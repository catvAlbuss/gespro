<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class valesequipoentrega extends Model
{
    use HasFactory;
    protected $table = 'valesequipoentregas';
    public $primaryKey = 'id_vaeqen';
    
    protected $fillable = [
        'fecha_entregado',
        'cantidad_entrega',
        'estado_prod',
        'usuario_designado',
        'inventario_designado',
    ];
    // Relación con el Usuario
    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_designado', 'id');
    }

    // Relación con el Inventario
    public function inventario()
    {
        return $this->belongsTo(Inventario::class, 'inventario_designado', 'id_inventario');
    }
}
