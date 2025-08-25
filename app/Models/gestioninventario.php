<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class gestioninventario extends Model
{
    use HasFactory;
    protected $table = 'gestioninventarios';
    public $primaryKey = 'id_gestion_inv';
    protected $fillable = [
        'nombre_gest_inv',
        'area_desiganda',
        'empresa_designado',
    ];
}
