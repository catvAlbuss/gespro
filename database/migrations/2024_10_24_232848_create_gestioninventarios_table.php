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
        Schema::create('gestioninventarios', function (Blueprint $table) {
            $table->id('id_gestion_inv');
            $table->string('nombre_gest_inv');
            $table->string('area_desiganda');
            $table->foreignId('empresa_designado')->constrained('empresas')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gestioninventarios');
    }
};
