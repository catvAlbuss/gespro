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
        Schema::create('calendario_trabajadors', function (Blueprint $table) {
            $table->id();
            $table->string('text');
            $table->string('details')->nullable(); // Si los detalles son opcionales
            $table->dateTime('start_date'); // Cambié a dateTime para incluir la hora
            $table->dateTime('end_date'); // Cambié a dateTime para incluir la hora
            $table->boolean('allDay')->default(false);
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
        Schema::dropIfExists('calendario_trabajadors');
    }
};
