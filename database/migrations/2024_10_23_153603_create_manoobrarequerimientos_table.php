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
        Schema::create('manoobrarequerimientos', function (Blueprint $table) {
            $table->id('id_mano_obra'); // ID auto-incremental
            $table->string('descripcion_manoobra')->nullable();
            $table->integer('cantidad_manoobra')->nullable();
            $table->decimal('precio_uni_manoobra', 10, 2)->nullable();
            $table->decimal('total_manoobra', 10, 2)->nullable();
            $table->foreignId('requerimiento_manodesignado')
                ->constrained('requerimientos', 'id_requerimiento') // Clave foránea
                ->onDelete('cascade'); // Acción al eliminar
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('manoobrarequerimientos');
    }
};
