<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Costos extends Model
{
    use HasFactory;

    protected $table = 'costos';

    protected $fillable = [
        'name',
        'codigouei',
        'codigosnip',
        'codigocui',
        'unidad_ejecutora',
        'codigolocal',
        'codigomodular',
        'fecha',
        'region',
        'provincia',
        'distrito',
        'centropoblado',
    ];

    // ========================================
    // RELACIONES CORREGIDAS (hasOne en lugar de hasMany)
    // ========================================

    /**
     * Relación uno a uno con costo_metrado
     */
    public function costoMetrado()
    {
        return $this->hasOne(costo_metrado::class, 'costos_id', 'id');
    }

    /**
     * Relación uno a uno con presupuestos
     */
    public function presupuesto()
    {
        return $this->hasOne(presupuestos::class, 'costos_pres_id', 'id');
    }

    /**
     * Relación uno a uno con costo_cronograma
     */
    public function costoCronograma()
    {
        return $this->hasOne(costo_cronograma::class, 'costos_cron_id', 'id');
    }

    /**
     * Relación uno a uno con especificaciones técnicas
     */
    public function especificacionesTecnicas()
    {
        return $this->hasOne(especificacionesTecnicas::class, 'costos_ettp_id', 'id');
    }

    // ========================================
    // RELACIONES ANTIGUAS (mantener por compatibilidad si se usan en otro lugar)
    // ========================================

    /**
     * @deprecated Usar costoMetrado() en su lugar
     */
    public function metrados()
    {
        return $this->hasMany(costo_metrado::class, 'costos_id');
    }

    /**
     * @deprecated Usar presupuesto() en su lugar
     */
    public function presupuestos()
    {
        return $this->hasMany(presupuestos::class, 'costos_pres_id');
    }

    /**
     * @deprecated Usar costoCronograma() en su lugar
     */
    public function cronograma()
    {
        return $this->hasMany(costo_cronograma::class, 'costos_cron_id');
    }

    /**
     * @deprecated Usar especificacionesTecnicas() en su lugar
     */
    public function ettp()
    {
        return $this->hasMany(especificacionesTecnicas::class, 'costos_ettp_id');
    }
}
