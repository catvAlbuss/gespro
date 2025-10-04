<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class insumosAcu extends Model
{
    use HasFactory;
    protected $table = 'insumos_acus';
    protected $fillable = [
        'codigo',
        'proveedor',
        'descripcion',
        'marca',
        'especificaciones',
        'tipoinsumo',
        'unidad',
        'unidadcompra',
        'preciounitario',
        'fecha',
        'fichatecnica',
        'codigoelectrico',
        'habilitar',
        'grupogenerico',
        'presupuesto_designado',
    ];
    public function indice()
    {
        return $this->belongsTo(indicesAcu::class, 'grupogenerico', 'id');
    }
    
}
