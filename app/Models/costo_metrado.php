<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class costo_metrado extends Model
{
    use HasFactory;
    protected $table = 'costos_metrados';
    // The costos_metrados table does not have timestamp columns
    public $timestamps = false;
    protected $fillable = [
        'costos_id',
        'm_arq_id',
        'm_est_id',
        'm_san_id',
        'm_elec_id',
        'm_com_id',
        'm_gas_id',
    ];

    /**
     * Each costo_metrado belongs to one Costos (foreign key: costos_id)
     */
    public function costo()
    {
        return $this->belongsTo(Costos::class, 'costos_id');
    }
}
