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
        Schema::create('aprobaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tramite_id')->constrained('tramites')->onDelete('cascade');
            $table->enum('etapa', [
                'Asistente',
                'Jefe de Área',
                'Administrador de Proyectos',
                'Administración',
                'Gerencia',
                'Contabilidad'
            ]);
            $table->boolean('aprobado')->default(false);
            $table->foreignId('usuario_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('observaciones')->nullable();
            $table->tinyInteger('orden')->unsigned(); // Orden de aprobación (1, 2, 3...)
            $table->timestamp('fecha_aprobacion')->nullable();
            $table->timestamps();

            // Índices para mejor rendimiento
            $table->index(['tramite_id', 'orden']);
            $table->index(['etapa', 'aprobado']);
            $table->index('usuario_id');

            // Constraint única para evitar duplicados
            $table->unique(['tramite_id', 'etapa']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('aprobaciones');
    }
};
