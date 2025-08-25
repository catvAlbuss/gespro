<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Empresa extends Model
{
    use HasFactory;
    protected $table = 'empresas'; // nombre de la tabla si no sigue la convención

    protected $fillable = [
        'razonSocial',
        'numeroDocumento',
        'estadoempresa',
        'direccionempresa',
        'distritoempresa',
        'provinciaempresa',
        'departamentoempresa'
    ];

    
    // La relación entre una empresa y los usuarios (muchos a muchos)
    public function users()
    {
      return $this->belongsToMany(User::class, 'empresa_user', 'empresa_id', 'user_id');
    }
    // protected $fillable = ['razonSocial', 'numeroDocumento', 'estadoempresa', 'direccionempresa', 'distritoempresa', 'provinciaempresa', 'departamentoempresa'];
}


