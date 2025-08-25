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
        Schema::create('tareas_trabajador', function (Blueprint $table) {
            $table->id('id_tarea'); // Define 'id_tarea' como clave primaria y auto-incrementable
            $table->string('nombre_tarea')->nullable();
            $table->date('fecha_subido_t')->nullable();
            $table->date('fecha_iniciopro')->nullable();
            $table->date('fecha_finpro')->nullable();
            $table->integer('porcentaje_tarea')->nullable();
            $table->integer('procentaje_trabajador');
            $table->string('diasubido')->nullable();
            $table->string('nombre_documento')->nullable();

            // Claves foráneas
            $table->unsignedBigInteger('trabajar_asignadot')->nullable(); // Referencia a la tabla 'users'
            $table->unsignedBigInteger('proyecto_asignadot')->nullable(); // Referencia a la tabla 'proyectos'

            // Definición de claves foráneas
            $table->foreign('trabajar_asignadot')->references('id')->on('users')->onDelete('set null');
            $table->foreign('proyecto_asignadot')->references('id_proyectos')->on('proyectos')->onDelete('set null');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tareas_trabajador');
    }
};
