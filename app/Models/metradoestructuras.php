<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class metradoestructuras extends Model
{
    use HasFactory;
    protected $table = 'metradoestructuras';
    public $primaryKey = 'idmetradoestructuras';

    protected $fillable = [
        'especialidad',
        'documentosdata',
        'resumenmetrados',
    ];
}
