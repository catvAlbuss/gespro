<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class tramites extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'tipo',
        'descripcion',
        'estado_actual',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Estados válidos
    const ESTADOS = [
        'EN_PROCESO' => 'En proceso',
        'COMPLETADO' => 'Completado',
        'RECHAZADO' => 'Rechazado'
    ];

    // Tipos de trámite válidos
    const TIPOS = [
        'INFORME_PAGO' => 'Informe de Pago',
        'REQUERIMIENTO' => 'Requerimiento'
    ];

    /**
     * Relación con el usuario creador
     */
    public function creador()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Relación con las aprobaciones
     */
    public function aprobaciones()
    {
        return $this->hasMany(aprobaciones::class, 'tramite_id');
    }

    /**
     * Aprobaciones ordenadas por secuencia
     */
    public function aprobacionesOrdenadas()
    {
        return $this->hasMany(aprobaciones::class, 'tramite_id')->orderBy('orden');
    }

    /**
     * Siguiente etapa de aprobación
     */
    public function siguienteEtapa()
    {
        return $this->aprobaciones()
            ->where('aprobado', false)
            ->orderBy('orden')
            ->first();
    }

    /**
     * Verificar si está completamente aprobado
     */
    public function estaCompletamenteAprobado()
    {
        return $this->aprobaciones()->where('aprobado', false)->count() === 0;
    }

    /**
     * Obtener progreso del trámite (porcentaje)
     */
    public function getProgresoAttribute()
    {
        $total = $this->aprobaciones()->count();
        $aprobadas = $this->aprobaciones()->where('aprobado', true)->count();

        return $total > 0 ? round(($aprobadas / $total) * 100) : 0;
    }

    /**
     * Scope para filtrar por estado
     */
    public function scopePorEstado($query, $estado)
    {
        return $query->where('estado_actual', $estado);
    }

    /**
     * Scope para trámites del usuario
     */
    public function scopeDelUsuario($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope para trámites pendientes de aprobación por rol
     */
    public function scopePendientesAprobacionPor($query, $rol)
    {
        return $query->whereHas('aprobaciones', function ($q) use ($rol) {
            $q->where('etapa', $rol)->where('aprobado', false);
        })->where('estado_actual', 'En proceso');
    }
}
