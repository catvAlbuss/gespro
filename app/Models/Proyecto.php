<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Proyecto extends Model
{
    use HasFactory;

    protected $table = 'proyectos';
    public $primaryKey = 'id_proyectos';

    protected $fillable = [
        'nombre_proyecto',
        'descripcion_proyecto',
        'documento_proyecto',
        'especialidades',
        'cantidad_modulos',
        'porcentaje_total',
        'tipoproyecto',
        'plazo_total_pro',
        'especialidades_porcentaje',
        'monto_designado',
        'monto_invertido',
        'monto_invertido_prev',
        'empresa_id',
    ];
    public function tareas()
    {
        return $this->hasMany(tarea_trabajador::class, 'proyecto_asignadot', 'id_proyectos');
    }

    // Relación con actividades
    public function actividades()
    {
        return $this->hasMany(actividadespersonal::class, 'projectActividad', 'id_proyectos');
    }

    // Relación con requerimientos
    public function requerimientos()
    {
        return $this->hasMany(requerimiento::class, 'proyecto_designado', 'id_proyectos');
    }
    
}
