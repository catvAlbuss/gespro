<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class metradocomunicacion extends Model
{
    use HasFactory;
    protected $table = 'metradocomunicacions';
    public $primaryKey = 'idmetradocomunicacion';

    protected $fillable = [
        'nombre_proyecto',
        'uei',
        'codigosnip',
        'codigocui',
        'unidad_ejecutora',
        'codigo_local',
        'codigo_modular',
        'especialidad',
        'localidad',
        'fecha',
        'ubicacion',
        'documentosdata',
        'resumenmetrados',
        'proyectodesignado',
    ];
}
