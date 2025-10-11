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

    public function metrados()
    {
        // One Costos has many costo_metrado entries; foreign key is 'costos_id'
        return $this->hasMany(costo_metrado::class, 'costos_id');
    }

    public function presupuestos()
    {
        return $this->hasMany(presupuestos::class, 'costos_pres_id');
    }

    public function cronograma()
    {
        // One Costos has many costo_cronograma entries; foreign key is 'costos_cron_id'
        return $this->hasMany(costo_cronograma::class, 'costos_cron_id');
    }

    public function ettp()
    {
        return $this->hasMany(especificacionesTecnicas::class, 'costos_ettp_id');
    }
}
