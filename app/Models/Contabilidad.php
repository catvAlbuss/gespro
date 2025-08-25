<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contabilidad extends Model
{
    use HasFactory;
    protected $table = 'contabilidads'; // nombre de la tabla

    protected $fillable = [
        'nombre_balance',
        'descripcion',
        'montoInicial',
        'documentos_cont',
        'balance_programado',
        'fecha_ingreso_doc',
        'empresa_id',
    ];
}
