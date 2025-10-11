<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class metradocomunicacion extends Model
{
    use HasFactory;
    protected $table = 'metradocomunicacions';
    public $primaryKey = 'idmetradocomunicacion';

    protected $fillable = [
        'especialidad',
        'documentosdata',
        'resumenmetrados',
    ];
}
