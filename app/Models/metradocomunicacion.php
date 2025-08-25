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
