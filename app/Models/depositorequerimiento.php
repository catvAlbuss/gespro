<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class depositorequerimiento extends Model
{
    use HasFactory;
    protected $table = 'depositorequerimientos';
    public $primaryKey = 'id_depositoreq';

    protected $fillable = [
        'banco_req',
        'nro_banco_req',
        'cci_req',
        'titular_req',
        'dni_req',
        'deposito_desingreq',
    ];
}
