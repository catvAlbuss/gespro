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
        Schema::create('mantenimientocampos', function (Blueprint $table) {
            $table->id('id_mantimiento'); // Eliminar el espacio en el nombre de la columna
            $table->string('nombre_proyecto_mant');
            $table->string('propietario_mant');
            $table->string('ubicacion_mant'); // Agregar la columna 'ubicacion_mant'
            $table->date('fecha_pro_mant');
            $table->integer('cotizacion_mant')->nullable(); // Hacer nullable si es necesario
            $table->integer('materiales_mant')->nullable(); // Hacer nullable si es necesario
            $table->integer('mano_obra_mant')->nullable(); // Hacer nullable si es necesario
            $table->integer('gastos_generales')->nullable(); // Hacer nullable si es necesario
            $table->longText('data_mantenimiento');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mantenimientocampos');
    }
};
