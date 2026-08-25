<?php

namespace Modules\DataMaster\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BudgetCategory extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'budget_categories';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'parent_id',
        'code',
        'name',
        'budget_type',
        'sub_budget_type',
        'is_active',
        'unit_ids'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_active' => 'boolean',
        'unit_ids' => 'array'
    ];

    /**
     * Get the parent category.
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(BudgetCategory::class, 'parent_id');
    }

    /**
     * Get the child categories.
     */
    public function children(): HasMany
    {
        return $this->hasMany(BudgetCategory::class, 'parent_id');
    }

    /**
     * Get active children categories.
     */
    public function activeChildren(): HasMany
    {
        return $this->children()->where('is_active', true);
    }

    /**
     * Check if category has children.
     */
    public function hasChildren(): bool
    {
        return $this->children()->exists();
    }

    /**
     * Get all descendants (recursive).
     */
    public function descendants()
    {
        return $this->children()->with('descendants');
    }

    /**
     * Scope a query to only include active categories.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include root categories (no parent).
     */
    public function scopeRoot($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Scope a query to only include child categories.
     */
    public function scopeChild($query)
    {
        return $query->whereNotNull('parent_id');
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($category) {
            // Jika memiliki parent, ambil budget_type dan unit_ids dari parent
            if ($category->parent_id) {
                $parent = self::find($category->parent_id);
                if ($parent) {
                    if (empty($category->budget_type)) {
                        $category->budget_type = $parent->budget_type;
                    }

                    if (empty($category->unit_ids)) {
                        $category->unit_ids = $parent->unit_ids;
                    }
                }
            }

            // Auto-generate code
            if (empty($category->code)) {
                $category->code = $category->generateCode();
            }
        });

        static::updating(function ($category) {
            // Saat update, jika parent_id berubah, update budget_type dan unit_ids
            if ($category->isDirty('parent_id') && $category->parent_id) {
                $parent = self::find($category->parent_id);
                if ($parent) {
                    if (empty($category->budget_type)) {
                        $category->budget_type = $parent->budget_type;
                    }

                    if (empty($category->unit_ids)) {
                        $category->unit_ids = $parent->unit_ids;
                    }
                }
            }
        });

        static::updated(function ($category) {
            // Jika budget_type atau unit_ids parent berubah, update children
            if ($category->wasChanged('budget_type') || $category->wasChanged('unit_ids')) {
                $category->syncChildrenAttributes();
            }
        });
    }

    /**
     * Generate Code untuk BudgetCategory
     */
    // public function generateCode(): string
    // {
    //     // Jika tidak memiliki parent (root category)
    //     if (!$this->parent_id) {
    //         // Format untuk parent: KA-01, KA-02, dst
    //         $lastCategory = self::whereNull('parent_id')
    //             ->orderBy('code', 'desc')
    //             ->first();

    //         $sequence = 1;
    //         if ($lastCategory && preg_match('/KA-(\d+)/', $lastCategory->code, $matches)) {
    //             $sequence = $matches[1] + 1;
    //         }

    //         return 'KA-' . str_pad($sequence, 2, '0', STR_PAD_LEFT); // 2 digit
    //     }

    //     // Jika memiliki parent (child category)
    //     $parent = self::find($this->parent_id);
    //     if (!$parent) {
    //         return 'KA-' . str_pad(1, 2, '0', STR_PAD_LEFT); // 2 digit
    //     }

    //     // Format untuk child: KA-01-01, KA-01-02, dst
    //     $lastChild = self::where('parent_id', $this->parent_id)
    //         ->orderBy('code', 'desc')
    //         ->first();

    //     $sequence = 1;
    //     if ($lastChild && preg_match('/\d+$/', $lastChild->code, $matches)) {
    //         $sequence = (int)$matches[0] + 1;
    //     }

    //     return $parent->code . '-' . str_pad($sequence, 2, '0', STR_PAD_LEFT); // 2 digit
    // }

    public function generateCode(): string
    {
        // Mengambil kategori terakhir berdasarkan urutan kode terbesar
        $lastCategory = self::orderBy('code', 'desc')->first();

        $sequence = 1;

        // Mencari angka setelah teks 'KA-' menggunakan regular expression
        if ($lastCategory && preg_match('/KA-(\d+)/', $lastCategory->code, $matches)) {
            $sequence = (int)$matches[1] + 1;
        }

        // Menghasilkan format KA-01, KA-02, dst (minimal 2 digit angka)
        return 'KA-' . str_pad($sequence, 2, '0', STR_PAD_LEFT);
    }

    /**
     * Sync budget_type dan unit_ids untuk semua children (recursive)
     */
    public function syncChildrenAttributes(): void
    {
        // Ambil semua children langsung
        $children = $this->children()->get();

        foreach ($children as $child) {
            // Update child attributes mengikuti parent
            $child->updateQuietly([
                'budget_type' => $this->budget_type,
                'unit_ids' => $this->unit_ids,
            ]);

            // Rekursif: update children dari child ini juga
            $child->syncChildrenAttributes();
        }
    }

    /**
     * Override save untuk memastikan child selalu mengikuti parent
     * Saat create/update, abaikan budget_type dan unit_ids jika ada parent_id
     */
    public function save(array $options = [])
    {
        // Jika ini child category dan sedang dibuat/diupdate
        if ($this->parent_id && !$this->isDirty('budget_type') && !$this->isDirty('unit_ids')) {
            $parent = self::find($this->parent_id);
            if ($parent) {
                // Selalu ikuti parent untuk child category
                $this->budget_type = $parent->budget_type;
                // $this->unit_ids = $parent->unit_ids;
            }
        }

        return parent::save($options);
    }
}
