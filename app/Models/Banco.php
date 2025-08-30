<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banco extends Model
{
    use HasFactory;
    protected $table = 'bancos';

    protected $fillable = [
        'user_id',
        'nombre_banco',
        'numero_cuenta',
        'cci',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
