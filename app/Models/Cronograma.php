<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cronograma extends Model
{
    use HasFactory;
    protected $table = 'cronogramas'; // nombre de la tabla
    protected $fillable = [
        'nombrecronograma',
        'montos',
        'datacronograma',
    ];
}
