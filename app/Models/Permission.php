<?php

namespace App\Models;

// use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Spatie\Permission\Models\Permission as SpatiePermission;
// use Illuminate\Support\Str;

class Permission extends SpatiePermission
{
    // use HasUuids;

    /**
     * The data type of the auto-incrementing ID.
     *
     * @var string
     */
    // protected $keyType = 'string';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    // public $incrementing = false;

    /**
     * The "boot" method of the model.
     *
     * @return void
     */
    // protected static function boot()
    // {
    //     parent::boot();

    //     static::creating(function ($permission) {
    //         if (empty($permission->{$permission->getKeyName()})) {
    //             $permission->{$permission->getKeyName()} = (string) Str::uuid();
    //         }
    //     });
    // }
}