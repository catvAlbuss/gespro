<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class metradogas extends Model
{
    use HasFactory;
    protected $table = 'metradogas';
    public $primaryKey = 'idmetradogas';

    protected $fillable = [
        'especialidad',
        'documentosdata',
        'resumenmetrados',
    ];
}
