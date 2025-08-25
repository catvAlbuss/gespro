<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class presupuestos extends Model
{
    use HasFactory;
    protected $table = 'presupuestos';

    protected $fillable = [
        'nombreproyecto',
        'propietario',
        'ubicacion',
        'fecha',
        'gastosgenerales',
        'utilidades',
        'igv',
        'expediente',
        'gastosupervicion',
        'costo_directo',
        'datapresupuestos',
    ];
}
