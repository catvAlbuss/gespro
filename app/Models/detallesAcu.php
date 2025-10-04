<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class detallesAcu extends Model
{
    use HasFactory;
    protected $table = 'detalles_acus';
    protected $fillable = [
        'indice',
        'descripcion',
        'unidad',
        'recursos',
        'cantidad',
        'precio',
        'total',
        'tipoinsumo',
        'id_insumo',
        'presupuesto_designado',
        'idgroupdetails',
    ];
}
