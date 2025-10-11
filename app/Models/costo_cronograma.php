<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class costo_cronograma extends Model
{
    use HasFactory;
    protected $table = 'costos_cronograma';
    // costos_cronograma table doesn't have Laravel timestamps
    public $timestamps = false;
    protected $fillable = [
        'costos_cron_id',
        'cron_gen_id',
        'cron_val_id',
        'cron_mat_id',
    ];

    public function costo()
    {
        return $this->belongsTo(Costos::class, 'costos_cron_id');
    }
}
