<?php

namespace App\Models;

// use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Spatie\Permission\Models\Role as SpatieRole;
// use Illuminate\Support\Str;

class Role extends SpatieRole
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
    // public $incrementing = true;

    /**
     * The "boot" method of the model.
     *
     * @return void
     */
    // protected static function boot()
    // {
    //     parent::boot();

    //     static::creating(function ($role) {
    //         if (empty($role->{$role->getKeyName()})) {
    //             $role->{$role->getKeyName()} = (string) Str::uuid();
    //         }
    //     });
    // }

}