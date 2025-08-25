<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class tarea_trabajador extends Model
{
    use HasFactory;
    protected $table = 'tareas_trabajador';
    public $primaryKey = 'id_tarea';
    protected $fillable = [
        'nombre_tarea',
        'fecha_subido_t',
        'fecha_iniciopro',
        'fecha_finpro',
        'porcentaje_tarea',
        'procentaje_trabajador',
        'diasubido',
        'nombre_documento',
        'trabajar_asignadot',
        'proyecto_asignadot',
    ];
    public function user()
    {
        return $this->belongsTo(User::class, 'trabajar_asignadot', 'id');
    }
    public function proyecto()
    {
        return $this->belongsTo(Proyecto::class, 'proyecto_asignadot', 'id_proyectos');
    }
}
