<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class presupuestos extends Model
{
    use HasFactory;
    protected $table = 'presupuestos';

    protected $fillable = [
        'gastosgenerales',
        'utilidades',
        'igv',
        'expediente',
        'gastosupervicion',
        'costo_directo',
        'datapresupuestos',
        'costos_pres_id',
        'pres_mant_id',
    ];

    public function costo()
    {
        return $this->belongsTo(Costos::class, 'costos_pres_id');
    }
}
