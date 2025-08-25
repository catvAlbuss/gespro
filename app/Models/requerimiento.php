<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class requerimiento extends Model
{
    use HasFactory;
    protected $table = 'requerimientos';
    public $primaryKey = 'id_requerimiento';

    protected $fillable = [
        'nombre_requerimiento',
        'numero_orden_requerimiento',
        'fecha_requerimiento',
        'correo_requerimiento',
        'solicitado_requerimiento',
        'cargo_requerimiento',
        'departamento_requerimiento',
        'total_requerimientos',
        'aprobado_logistica',
        'aprobado_contabilidad',
        'aprobado_requerimiento',
        'sustento_requerimiento',
        'proyecto_designado',
        'empresa_designado',
    ];

    public function proyecto()
    {
        return $this->belongsTo(Proyecto::class, 'proyecto_designado', 'id_proyectos');
    }

    public function empresas()
    {
        return $this->belongsToMany(Empresa::class, 'empresa_designado', 'id');
    }

    public function materiales()
    {
        return $this->hasMany(materialrequerimiento::class, 'requerimiento_manterialdesing', 'id_requerimiento');
    }

    public function manoObra()
    {
        return $this->hasMany(manoobrarequerimiento::class, 'requerimiento_manodesignado', 'id_requerimiento');
    }

    public function depositos()
    {
        return $this->hasMany(depositorequerimiento::class, 'deposito_desingreq', 'id_requerimiento');
    }
}
