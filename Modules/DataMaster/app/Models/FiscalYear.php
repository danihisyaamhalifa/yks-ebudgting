<?php

namespace Modules\DataMaster\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FiscalYear extends Model
{
    use HasFactory;

    protected $fillable = [
        'year',
        'start_date',
        'end_date',
        'status',
        'is_active',
        'description'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean'
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    protected $attributes = [
        'status' => 'open',
        'is_active' => false
    ];

    /**
     * Scope untuk tahun fiskal yang aktif.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope untuk tahun fiskal dengan status tertentu.
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope untuk tahun fiskal dengan status open.
     */
    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    /**
     * Scope untuk tahun fiskal dengan status locked
     */
    public function scopeLocked($query)
    {
        return $query->where('status', 'locked');
    }

    /**
     * Scope untuk tahun fiskal dengan status closed.
     */
    public function scopeClosed($query)
    {
        return $query->where('status', 'closed');
    }

    /**
     * Scope untuk mencari tahun fiskal berdasarkan tahun.
     */
    public function scopeByYear($query, $year)
    {
        return $query->where('year', $year);
    }

    /**
     * Scope untuk tahun fiskal dalam periode tertentu.
     */
    public function scopeInPeriod($query, $startDate, $endDate)
    {
        return $query->where('start_date', '>=', $startDate)
                     ->where('end_date', '<=', $endDate);
    }

    /**
     * Cek apakah tahun fiskal sedang aktif.
     */
    public function isActive()
    {
        return $this->is_active;
    }

    /**
     * Cek apakah tahun fiskal open.
     */
    public function isOpen()
    {
        return $this->status === 'open';
    }

    /**
     * Cek apakah tahun fiskal terkunci.
     *
     * @return bool
     */
    public function isLocked()
    {
        return $this->status === 'locked';
    }

    /**
     * Cek apakah tahun fiskal closed.
     */
    public function isClosed()
    {
        return $this->status === 'closed';
    }

    /**
     * Mengaktifkan tahun fiskal.
     */
    public function activate()
    {
        // Nonaktifkan semua tahun fiskal lainnya
        self::query()->update(['is_active' => false]);
        
        return $this->update(['is_active' => true]);
    }

    /**
     * Menonaktifkan tahun fiskal.
     */
    public function deactivate()
    {
        return $this->update(['is_active' => false]);
    }

    /**
     * Mengubah status tahun fiskal.
     */
    public function changeStatus($status)
    {
        $allowedStatuses = ['open', 'locked', 'closed'];
        
        if (!in_array($status, $allowedStatuses)) {
            return false;
        }
        
        return $this->update(['status' => $status]);
    }

    /**
     * Mendapatkan tahun fiskal aktif saat ini.
     */
    public static function getActiveFiscalYear()
    {
        return self::active()->first();
    }

    /**
     * Mendapatkan tahun fiskal berdasarkan tanggal.
     */
    public static function getFiscalYearByDate($date)
    {
        if (!$date instanceof \Carbon\Carbon) {
            $date = \Carbon\Carbon::parse($date);
        }
        
        return self::where('start_date', '<=', $date)
                   ->where('end_date', '>=', $date)
                   ->first();
    }
}