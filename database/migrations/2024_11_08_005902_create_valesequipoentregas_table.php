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
        Schema::create('valesequipoentregas', function (Blueprint $table) {
            $table->id('id_vaeqen');
            $table->date('fecha_entregado');
            $table->integer('cantidad_entrega');
            $table->string('estado_prod');
            $table->foreignId('usuario_designado')->constrained('users')->onDelete('cascade');
            $table->foreignId('inventario_designado')->constrained('inventarios', 'id_inventario')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('valesequipoentregas');
    }
};
