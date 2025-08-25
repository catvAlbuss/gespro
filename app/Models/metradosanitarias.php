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
        'entidadm',
        'fecha',
        'especialidad',
        'cui',
        'codigo_modular',
        'codigo_local',
        'localidad',
        'cantidadModulo',
        'documentosdata',
        'resumenmetrados',
        'proyectodesignado',
    ];
}
