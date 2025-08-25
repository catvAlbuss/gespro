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
        Schema::create('registro_asistencias', function (Blueprint $table) {
            $table->id('id_asistencia');
            $table->string('nombre_personal');
            $table->string('tipo_horario');
            $table->date('fecha_registro');
            $table->time('hora_ingreso');
            $table->string('ubicacion');
            $table->foreignId('usuario_designado')->constrained('users')->onDelete('cascade');
            $table->foreignId('empresa_designado')->constrained('empresas')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registro_asistencias');
    }
};
