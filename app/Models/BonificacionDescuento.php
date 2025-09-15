<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BonificacionDescuento extends Model
{
    use HasFactory;
    protected $table = 'bonificacion_descuentos';

    protected $fillable = [
        'permisos',
        'adelantos',
        'incumplimientolab',
        'incumplimientomof',
        'descuento',
        'bonificacion',
        'tramite_desing',
    ];

    public function tramite()
    {
        return $this->belongsTo(tramites::class, 'tramite_desing');
    }
}
