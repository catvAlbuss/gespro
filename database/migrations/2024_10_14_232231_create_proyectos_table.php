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
        Schema::create('proyectos', function (Blueprint $table) {
            $table->bigIncrements('id_proyectos'); // Autoincrementable y clave primaria
            $table->string('nombre_proyecto', 255)->nullable();
            $table->string('descripcion_proyecto', 255)->nullable();
            $table->text('documento_proyecto')->nullable();
            $table->integer('porcentaje_total')->nullable();
            $table->string('tipoproyecto', 30)->nullable();
            $table->integer('plazo_total_pro');
            $table->integer('porcentaje_designado')->nullable();
            $table->decimal('monto_designado', 10, 2)->nullable();
            $table->float('monto_invertido', 10, 2);
            $table->unsignedBigInteger('empresa_id'); // Foreign key
            $table->timestamps();

            $table->foreign('empresa_id')->references('id')->on('empresas')->onDelete('cascade');
            $table->index('empresa_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proyectos');
    }
};
