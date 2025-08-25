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
        Schema::create('kanbantrabajadors', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_calmen');
            $table->string('descripcion')->nullable();
            $table->date('semana_designado');
            $table->string('color');
            $table->foreignId('usuario_id')->constrained('users')->onDelete('cascade'); // Clave foránea a la tabla users
            $table->foreignId('proyecto_id')->constrained('proyectos', 'id_proyectos')->onDelete('cascade'); // Clave foránea a la tabla proyectos
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kanbantrabajadors');
    }
};
