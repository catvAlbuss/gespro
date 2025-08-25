<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class kanbantrabajador extends Model
{
    use HasFactory;
    protected $table = 'kanbantrabajadors';

    protected $fillable = [
        'nombre_calmen',
        'descripcion',
        'semana_designado',
        'color',
        'monto',
        'usuario_id',
        'proyecto_id'
    ];
}
