<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class indicesAcu extends Model
{
    use HasFactory;
    protected $table = 'indices_acus';
    protected $fillable = [
        'id',
        'codigo',
        'descripcion'
    ];

    public function insumos()
    {
        return $this->hasMany(insumosAcu::class, 'grupogenerico', 'id');
    }
}
