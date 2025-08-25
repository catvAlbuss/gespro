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
        Schema::create('empresas', function (Blueprint $table) {
            $table->id();
            $table->string('razonSocial');
            $table->integer('numeroDocumento')->unique();
            $table->string('estadoempresa');
            $table->string('direccionempresa');
            $table->string('distritoempresa');
            $table->string('provinciaempresa');
            $table->string('departamentoempresa');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('empresas');
    }
};
