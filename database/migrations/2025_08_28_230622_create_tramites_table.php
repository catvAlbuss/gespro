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
        Schema::create('tramites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('tipo', ['Informe de Pago', 'Requerimiento']);
            $table->text('descripcion');
            $table->enum('estado_actual', ['En proceso', 'Completado', 'Rechazado'])->default('En proceso');
            $table->timestamps();

            // Índices para mejor rendimiento
            $table->index(['user_id', 'estado_actual']);
            $table->index('tipo');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tramites');
    }
};
