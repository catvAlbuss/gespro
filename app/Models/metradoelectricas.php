<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class metradoelectricas extends Model
{
    use HasFactory;
    protected $table = 'metradoelectricas';
    public $primaryKey = 'idmeelectrica';

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
