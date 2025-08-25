<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class inventario extends Model
{
    use HasFactory;
    protected $table = 'inventarios';
    public $primaryKey = 'id_inventario';
    protected $fillable = [
        'nombre_producto',
        'marca_prod',
        'detalles_prod',
        'fecha_inv',
        'costo',
        'stock',
        'Stockactual',
        'sustentoactual',
        'inventario_designado',
    ];

    // Relación con GestionInventario
    public function gestionInventario()
    {
        // Cambiar 'gestion_inventario_id' por el nombre real de la columna en tu tabla
        return $this->belongsTo(gestioninventario::class, 'inventario_designado', 'id_gestion_inv');
    }
}
