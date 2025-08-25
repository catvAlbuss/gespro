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
        Schema::create('requerimientos', function (Blueprint $table) {
            $table->id('id_requerimiento');
            $table->string('nombre_requerimiento')->nullable();
            $table->integer('numero_orden_requerimiento')->nullable();
            $table->dateTime('fecha_requerimiento')->nullable();
            $table->string('correo_requerimiento')->nullable();
            $table->string('solicitado_requerimiento')->nullable();
            $table->string('cargo_requerimiento')->nullable();
            $table->string('departamento_requerimiento')->nullable();
            $table->integer('total_requerimientos')->nullable();
            $table->boolean('aprobado_logistica'); // Cambia a booleano
            $table->boolean('aprobado_contabilidad'); // Cambia a booleano
            $table->boolean('aprobado_requerimiento'); // Cambia a booleano
            $table->string('sustento_requerimiento');
            $table->foreignId('proyecto_designado')->constrained('proyectos', 'id_proyectos')->onDelete('cascade');
            $table->foreignId('empresa_designado')->constrained('empresas')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requerimientos');
    }
};
