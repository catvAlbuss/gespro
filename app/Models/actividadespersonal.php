<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class actividadespersonal extends Model
{
    use HasFactory;
    protected $table = 'actividadespersonals';
    public $primaryKey = 'actividadId';

    protected $fillable = [
        'nameActividad',
        'projectActividad',
        'elapsed_timeActividadId',
        'status',
        'fecha',
        'diasAsignados',
        'porcentajeTarea',
        'usuario_designado',
    ];

     // Agregar relación con el modelo Proyecto
     public function proyecto()
     {
         return $this->belongsTo(Proyecto::class, 'projectActividad', 'id_proyectos');
     }
}
