<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class metradosanitarias extends Model
{
    use HasFactory;
    protected $table = 'metradosanitarias';
    public $primaryKey = 'idmetradosan';
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
        'cantidadModulo',
        'documentosdata',
        'resumenmetrados',
        'proyectodesignado',
    ];
}
