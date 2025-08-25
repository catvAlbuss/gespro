<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class gastoGeneral extends Model
{
    use HasFactory;
    protected $table = 'gasto_generals';
    protected $fillable = [
        'tiempo_ejecucion',
        'ggf',
        'ggv',
        'porcentaje_fianza_adelanto_efectivo',
        'porcentaje_fianza_buen_ejecucion',
        'consolidado',
        'gastos_generales',
        'gastos_fijos',
        'supervision',
        'remuneraciones',
        'control_concurrente',
        'presupuesto_designado',
    ];

}
