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
        Schema::create('contabilidads', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_balance', 100); // Limitando la longitud
            $table->text('descripcion');
            $table->decimal('montoInicial', 10, 2);
            $table->json('documentos_cont');
            $table->json('balance_programado');
            $table->date('fecha_ingreso_doc');
            $table->unsignedBigInteger('empresa_id');
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresas')->onDelete('cascade');

            $table->index('empresa_id');
            $table->index('fecha_ingreso_doc');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contabilidads');
    }
};
