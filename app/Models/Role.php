<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Spatie\Permission\Models\Role as SpatieRole;
use Spatie\Permission\Contracts\Role as RoleContract;

class Role extends SpatieRole implements RoleContract
{
    use HasFactory;

    protected $fillable = ['name', 'guard_name'];

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'role_has_permissions', 'role_id', 'permission_id');
    }
}

// class Role extends Model
// {
//     use HasFactory;
//     protected $fillable = ['name', 'guard_name'];

//     public function permissions(): BelongsToMany
//     {
//         return $this->belongsToMany(Permission::class, 'role_has_permissions', 'role_id', 'permission_id');
//     }
// }
