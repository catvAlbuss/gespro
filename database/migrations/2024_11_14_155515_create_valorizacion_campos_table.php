<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('valorizacion_campos', function (Blueprint $table) {
            $table->id('id_valorizacion');
            $table->string('obra_valo');
            $table->string('contratista_valo');
            $table->integer('plazo_valo');
            $table->date('fecha_inicio_valo');
            $table->double('estructuras_valo');
            $table->double('inst_sanitarias_valo');
            $table->double('inst_electricas_valo');
            $table->longText('data_valorizacion');
            $table->string('contrato_n_valo');
            $table->string('modalidad_valo');
            $table->double('adelanto_directo_valo');
            $table->date('adelanto_directo_fecha_valo');
            $table->string('distrito_valo');
            $table->string('provincia_valo');
            $table->string('region_valo');
            $table->decimal('compras_valo', 10, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('valorizacion_campos');
    }
};
