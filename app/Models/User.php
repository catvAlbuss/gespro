<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    //protected $fillable = ['name', 'email', 'password','image_user'];
    protected $fillable = [
        'name',
        'surname',
        'email',
        'dni_user',
        'phone',
        'fecha_nac',
        'sueldo_base',
        'area_laboral',
        'nivel_estudio',
        'image_user',
        'contratouser',
        'password',
    ];

    // Relación con empresas
    public function empresas()
    {
        return $this->belongsToMany(Empresa::class, 'empresa_user', 'user_id', 'empresa_id');
    }

    public function tareas()
    {
        return $this->hasMany(tarea_trabajador::class, 'user_asignado', 'id');
    }
    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
