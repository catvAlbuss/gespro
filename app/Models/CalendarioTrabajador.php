<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CalendarioTrabajador  extends Model
{
    use HasFactory;
    protected $table = 'calendario_trabajadors';
    protected $fillable = ['text', 'details', 'start_date', 'end_date', 'allDay', 'usuario_id', 'proyecto_id']; // Asegúrate de que estos campos existan en la base de datos
    
    // Asegúrate de agregar esta relación en el modelo CalendarioTrabajador si no existe
    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
