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
        Schema::create('bonificacion_descuentos', function (Blueprint $table) {
            $table->id();
            $table->decimal('permisos', 10, 2);
            $table->decimal('adelantos', 10, 2);
            $table->decimal('incumplimientolab', 10, 2);
            $table->decimal('incumplimientomof', 10, 2);
            $table->decimal('descuento', 10, 2);
            $table->decimal('bonificacion', 10, 2);
            $table->foreignId('tramite_desing')->constrained('tramites')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bonificacion_descuentos');
    }
};
