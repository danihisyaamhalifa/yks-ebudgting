<?php

namespace Modules\DataMaster\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Log;

class Coa extends Model
{
    use HasFactory;

    protected $table = 'coas';

    protected $fillable = [
        'account_code',
        'account_name',
        'account_type',
        'parent_id',
        'level',
        'normal_balance',
        'is_header',
        'is_active',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'level' => 'integer',
        'is_header' => 'boolean',
        'is_active' => 'boolean',
        'parent_id' => 'integer',
    ];

    /**
     * Nilai default field
     * @var array
     */
    protected $attributes = [
        'level' => 1, // Default level adalah 1
        'is_header' => false,
        'is_active' => true,
    ];

    /**
     * Konstanta untuk tipe akun.
     */
    public const TYPE_AKTIVA = 'AKTIVA';
    public const TYPE_KEWAJIBAN = 'KEWAJIBAN';
    public const TYPE_MODAL = 'MODAL';
    public const TYPE_PENDAPATAN = 'PENDAPATAN';
    public const TYPE_BEBAN = 'BEBAN';

    /**
     * Konstanta untuk saldo normal.
     */
    public const SALDO_NORMAL_DEBIT = 'DEBIT';
    public const SALDO_NORMAL_KREDIT = 'KREDIT';

    /**
     * Konstanta untuk level default.
     */
    public const DEFAULT_LEVEL = 1;
    public const ROOT_LEVEL = 1;
    public const MAX_LEVEL = 5;

    public static function getValidTypes(): array
    {
        return [
            self::TYPE_AKTIVA,
            self::TYPE_KEWAJIBAN,
            self::TYPE_MODAL,
            self::TYPE_PENDAPATAN,
            self::TYPE_BEBAN,
        ];
    }

    public static function getValidSaldoNormal(): array
    {
        return [
            self::SALDO_NORMAL_DEBIT,
            self::SALDO_NORMAL_KREDIT,
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Coa::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Coa::class, 'parent_id');
    }

    protected static function boot()
    {
        parent::boot();

        // Set level default jika tidak disediakan
        static::creating(function ($coa) {
            if (empty($coa->level)) {
                $coa->level = $coa->parent_id
                    ? (self::find($coa->parent_id)->level + 1)
                    : self::ROOT_LEVEL;
            }

            // Validasi level tidak melebihi maksimum
            if ($coa->level > self::MAX_LEVEL) {
                throw new \InvalidArgumentException("Level tidak boleh lebih dari " . self::MAX_LEVEL);
            }
        });

        // Update level detail saat parent berubah
        static::updating(function ($coa) {
            if ($coa->isDirty('parent_id')) {
                $newLevel = $coa->parent_id
                    ? (self::find($coa->parent_id)->level + 1)
                    : self::ROOT_LEVEL;

                // Update level COA ini
                $coa->level = $newLevel;

                // Update level semua anak secara rekursif
                $coa->updateChildrenLevel($newLevel + 1);
            }
        });

        // Saat menghapus, periksa apakah ada anak-anaknya
        static::deleting(function ($coa) {
            if ($coa->hasChildren() && !$coa->is_header) {
                throw new \RuntimeException('Tidak dapat menghapus akun yang memiliki anak-anak');
            }
        });
    }

    /**
     * scopeHeader
     * @param mixed $query
     */
    public function scopeHeader($query)
    {
        return $query->where('is_header', 1);
    }

    /**
     * scopeDetail
     * @param mixed $query
     */
    public function scopeDetail($query)
    {
        return $query->where('is_header', false);
    }
}