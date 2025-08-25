<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class materialrequerimiento extends Model
{
    use HasFactory;
    protected $table = 'materialrequerimientos';
    public $primaryKey = 'id_materiales_req';

    protected $fillable = [
        'cantidad_material_req',
        'descripcion_material_req',
        'unidad',
        'precio_unitario_matreq',
        'total_material_req',
        'requerimiento_manterialdesing',
    ];
}
