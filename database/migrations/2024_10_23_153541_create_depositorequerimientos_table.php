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
        Schema::create('depositorequerimientos', function (Blueprint $table) {
            $table->id('id_depositoreq');
            $table->string('banco_req')->nullable();
            $table->string('nro_banco_req')->nullable();
            $table->string('cci_req')->nullable();
            $table->string('titular_req')->nullable();
            $table->integer('dni_req')->nullable();
            $table->foreignId('deposito_desingreq')->constrained('requerimientos', 'id_requerimiento')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('depositorequerimientos');
    }
};
