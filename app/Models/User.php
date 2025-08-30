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

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'fecha_nac' => 'date',
        'sueldo_base' => 'decimal:2',
        'password' => 'hashed',
    ];

    // Roles/Áreas laborales válidas en orden jerárquico
    const AREAS_LABORALES = [
        'ROOT' => 6,
        'Gerencia' => 5,
        'Contabilidad' => 5,
        'Administración' => 4,
        'Administrador de Proyectos' => 3,
        'Jefe de Área' => 2,
        'Asistente' => 1
    ];

    /**
     * Relación con empresas
     */
    public function empresas()
    {
        return $this->belongsToMany(Empresa::class, 'empresa_user', 'user_id', 'empresa_id');
    }

    /**
     * Relación con tareas
     */
    public function tareas()
    {
        return $this->hasMany(tarea_trabajador::class, 'user_asignado', 'id');
    }

    /**
     * Relación con trámites creados
     */
    public function tramites()
    {
        return $this->hasMany(tramites::class);
    }

    /**
     * Relación con aprobaciones realizadas
     */
    public function aprobaciones()
    {
        return $this->hasMany(aprobaciones::class, 'usuario_id');
    }

    /**
     * Obtener trámites que puede aprobar
     */
    public function tramitesPorAprobar()
    {
        return tramites::pendientesAprobacionPor($this->area_laboral);
    }

    /**
     * Verificar si puede aprobar un trámite específico
     */
    public function puedeAprobar(tramites $tramite)
    {
        return $tramite->aprobaciones()
            ->where('etapa', $this->area_laboral)
            ->where('aprobado', false)
            ->exists();
    }

    /**
     * Obtener nivel jerárquico del usuario
     */
    public function getNivelJerarquico()
    {
        return self::AREAS_LABORALES[$this->area_laboral] ?? 0;
    }

    /**
     * Verificar si tiene un nivel jerárquico superior a otro
     */
    public function esSuperiorA(User $otroUsuario)
    {
        return $this->getNivelJerarquico() > $otroUsuario->getNivelJerarquico();
    }

    /**
     * Scope para usuarios por área laboral
     */
    public function scopePorArea($query, $area)
    {
        return $query->where('area_laboral', $area);
    }

    /**
     * Obtener nombre completo
     */
    public function getNombreCompletoAttribute()
    {
        return $this->name . ' ' . $this->surname;
    }

    /**
     * Relación con bancos
     */
    public function banco()
    {
        return $this->hasOne(Banco::class);
    }
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
//php artisan make:model Banco -m
