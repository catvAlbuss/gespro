<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class valorizacionCampo extends Model
{
    use HasFactory;
    protected $table = 'valorizacion_campos';
    public $primaryKey = 'id_valorizacion';
    
    protected $fillable = [
        'obra_valo',
        'contratista_valo',
        'plazo_valo',
        'fecha_inicio_valo',
        'estructuras_valo',
        'inst_sanitarias_valo',
        'inst_electricas_valo',
        'data_valorizacion',
        'contrato_n_valo',
        'modalidad_valo',
        'adelanto_directo_valo',
        'adelanto_directo_fecha_valo',
        'distrito_valo',
        'provincia_valo',
        'provincia_valo',
        'compras_valo',
    ];
}
