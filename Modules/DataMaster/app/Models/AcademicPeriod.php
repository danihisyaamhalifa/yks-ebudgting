<?php

namespace Modules\DataMaster\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'academic_year',
        'semester',
        'start_date',
        'end_date',
        'description',
        'is_active',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    protected $appends = [
        'display_name',
        'semester_name',
    ];

    /**
     *Scope hanya period aktif
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope filter berdasarkan academic year.
     */
    public function scopeByAcademicYear($query, $academicYear)
    {
        return $query->where('academic_year', $academicYear);
    }

    /**
     * Scope filter berdsarkan semester.
     */
    public function scopeBySemester($query, $semester)
    {
        return $query->where('semester', $semester);
    }

    /**
     * Scope a query to get current academic period.
     */
    public function scopeCurrent($query)
    {
        $today = now()->toDateString();
        return $query->where('start_date', '<=', $today)
                    ->where('end_date', '>=', $today);
    }

    /**
     * Check if the academic period is currently active based on dates.
     */
    public function isCurrentlyActive(): bool
    {
        $today = now()->toDateString();
        return $this->start_date <= $today && $this->end_date >= $today;
    }

    /**
     * Get the display name for the academic period.
     */
    public function getDisplayNameAttribute(): string
    {
        return "{$this->academic_year} - Semester " . 
               ($this->semester === 'ganjil' ? 'Ganjil' : 'Genap');
    }

    /**
     * Get the academic year in split format.
     */
    public function getYearStartAttribute(): int
    {
        return (int) explode('/', $this->academic_year)[0];
    }

    public function getYearEndAttribute(): int
    {
        return (int) explode('/', $this->academic_year)[1];
    }

    /**
     * Mendapatkan nama semester.
     */
    public function getSemesterNameAttribute(): string
    {
        return $this->semester === 'ganjil' ? 'Ganjil' : 'Genap';
    }

    /**
     * Aktivasi period
     */
    public function activate(): void
    {
        // Deaktifasi period yang lainnya
        self::where('id', '!=', $this->id)->update(['is_active' => false]);
        
        // Aktifasi period
        $this->update(['is_active' => true]);
    }
}