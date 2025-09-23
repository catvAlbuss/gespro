<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class metradoestructuras extends Model
{
    use HasFactory;
    protected $table = 'metradoestructuras';
    public $primaryKey = 'idmetradoestructuras';

    protected $fillable = [
        'nombre_proyecto',
        'uei',
        'codigosnip',
        'codigocui',
        'unidad_ejecutora',
        'codigo_local',
        'codigo_modular',
        'especialidad',
        'fecha',
        'ubicacion',
        'documentosdata',
        'resumenmetrados',
        'proyectodesignado',
    ];
}
