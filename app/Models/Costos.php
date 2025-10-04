<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Costos extends Model
{
    use HasFactory;
    protected $table = 'costos';
    protected $fillable = [
        'name',
        'codigouei',
        'codigosnip',
        'codigocui',
        'unidad_ejecutora',
        'codigolocal',
        'codigomodular',
        'fecha',
        'region',
        'provincia',
        'distrito',
        'centropoblado',
    ];
}
