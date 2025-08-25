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
        'cui',
        'codigo_modular',
        'codigo_local',
        'unidad_ejecutora',
        'fecha',
        'especialidad',
        'modulo',
        'localidad',
        'documentosdata',
        'resumenmetrados',
        'proyectodesignado',
    ];
}
