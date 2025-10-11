<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class metradoarquitectura extends Model
{
    use HasFactory;
    protected $table = 'metradoarquitectura';
    public $primaryKey = 'id_arquitectura';

    protected $fillable = [
        'especialidad',
        'documentosdata',
        'resumenmetrados',
    ];
}
