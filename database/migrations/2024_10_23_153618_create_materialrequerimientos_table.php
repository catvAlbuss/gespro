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
        Schema::create('materialrequerimientos', function (Blueprint $table) {
            $table->id('id_materiales_req'); // ID auto-incremental
            $table->integer('cantidad_material_req')->nullable();
            $table->string('descripcion_material_req')->nullable();
            $table->string('unidad', 50)->nullable();
            $table->decimal('precio_unitario_matreq', 10, 2)->nullable();
            $table->decimal('total_material_req', 10, 2)->nullable();
            $table->foreignId('requerimiento_manterialdesing')
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
        Schema::dropIfExists('materialrequerimientos');
    }
};
