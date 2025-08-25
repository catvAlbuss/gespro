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
