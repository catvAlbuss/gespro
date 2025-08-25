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
        Schema::create('inventarios', function (Blueprint $table) {
            $table->id('id_inventario');
            $table->string('nombre_producto');
            $table->string('marca_prod');
            $table->string('detalles_prod');
            $table->decimal('costo', 2);
            $table->integer('stock');
            $table->integer('Stockactual');
            $table->string('sustentoactual');
            $table->foreignId('inventario_designado')->constrained('gestioninventarios', 'id_gestion_inv')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventarios');
    }
};
