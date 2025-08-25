<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class mantenimientocampo extends Model
{
    use HasFactory;
    protected $table = 'mantenimientocampos';
    public $primaryKey = 'id_mantimiento';
    protected $fillable = [
        'nombre_proyecto_mant',
        'propietario_mant',
        'ubicacion_mant',
        'fecha_pro_mant',
        'cotizacion_mant',
        'materiales_mant',
        'mano_obra_mant',
        'gastos_generales',
        'data_mantenimiento',
    ];
}
