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
        'especialidad',
        'cantidad',
        'status',
        'fecha',
        'diasAsignados',
        'porcentajeTarea',
        'usuario_designado',
        'elapsed_time',
    ];

    // Agregar relación con el modelo Proyecto
    public function proyecto()
    {
        return $this->belongsTo(Proyecto::class, 'projectActividad', 'id_proyectos');
    }

    // Relación con Usuario
    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_designado', 'id');
    }
}
