<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class registroAsistencia extends Model
{
    protected $table = 'registro_asistencias';
    public $primaryKey = 'id_asistencia';
    protected $fillable = [
        'nombre_personal',
        'tipo_horario',
        'fecha_registro',
        'hora_ingreso',
        'ubicacion',
        'usuario_designado',
        'empresa_designado',
    ];
}
