<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class aprobaciones extends Model
{
    use HasFactory;

    protected $fillable = [
        'tramite_id',
        'etapa',
        'aprobado',
        'usuario_id',
        'observaciones',
        'orden',
        'fecha_aprobacion',
    ];

    protected $casts = [
        'aprobado' => 'boolean',
        'fecha_aprobacion' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Etapas válidas en orden
    const ETAPAS = [
        'Asistente',
        'Jefe de Área',
        'Administrador de Proyectos',
        'Administración',
        'Gerencia',
        'Contabilidad'
    ];

    /**
     * Relación con el trámite
     */
    public function tramite()
    {
        return $this->belongsTo(tramites::class, 'tramite_id');
    }

    /**
     * Relación con el usuario que aprobó
     */
    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    /**
     * Verificar si está aprobado
     */
    public function estaAprobado()
    {
        return $this->aprobado === true;
    }

    /**
     * Verificar si está pendiente
     */
    public function estaPendiente()
    {
        return $this->aprobado === false && is_null($this->usuario_id);
    }

    /**
     * Verificar si está rechazado
     */
    public function estaRechazado()
    {
        return $this->aprobado === false && !is_null($this->usuario_id);
    }

    /**
     * Scope para filtrar por etapa
     */
    public function scopePorEtapa($query, $etapa)
    {
        return $query->where('etapa', $etapa);
    }

    /**
     * Scope para aprobaciones pendientes
     */
    public function scopePendientes($query)
    {
        return $query->where('aprobado', false)->whereNull('usuario_id');
    }

    /**
     * Scope para aprobaciones completadas
     */
    public function scopeCompletadas($query)
    {
        return $query->where('aprobado', true);
    }
}
