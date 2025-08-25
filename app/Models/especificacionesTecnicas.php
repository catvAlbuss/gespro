<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class especificacionesTecnicas extends Model
{
    use HasFactory;
    protected $table = 'especificaciones_tecnicas';
    protected $fillable = [
        'nameEspecificacionTecnica',
        'datosEspecificacionTecnica',
    ];
}
