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
        Schema::create('costos', function (Blueprint $table) {
            $table->id();
            $table->string('name');

            $table->string('codigouei');
            $table->string('codigosnip');
            $table->string('codigocui');
            $table->string('unidad_ejecutora');
            $table->string('codigolocal');
            $table->json('codigomodular')->nullable();
            $table->date('fecha');
            $table->string('region')->index();
            $table->string('provincia')->index();
            $table->string('distrito')->index();
            $table->string('centropoblado');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('costos');
    }
};
