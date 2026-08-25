<?php

namespace Modules\DataMaster\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
// use Modules\DataMaster\Database\Factories\JenisTransaksiFactory;

class TransactionType extends Model
{
    use HasFactory;

    protected $table = 'transaction_types';

    protected $fillable = [
        'transaction_code',
        'transaction_name',
        'status',
    ];

    protected $hidden = [
        // 'created_at',
        // 'updated_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            // Validasi kode unik
            if (self::where('transaction_code', $model->transaction_code)->exists()) {
                throw new \Exception('Kode transaksi sudah ada.');
            }
        });

        static::updating(function ($model) {
            // Validasi kode unik saat update (kecuali untuk record yang sama)
            if (self::where('transaction_code', $model->transaction_code)
                ->where('id', '!=', $model->id)
                ->exists()) {
                throw new \Exception('Kode transaksi sudah ada.');
            }
        });
    }
}
