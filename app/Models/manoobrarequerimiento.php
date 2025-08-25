<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class manoobrarequerimiento extends Model
{
    use HasFactory;
    protected $table = 'manoobrarequerimientos';
    public $primaryKey = 'id_mano_obra';

    protected $fillable = [
        'descripcion_manoobra',
        'cantidad_manoobra',
        'precio_uni_manoobra',
        'total_manoobra',
        'requerimiento_manodesignado',
    ];
}
