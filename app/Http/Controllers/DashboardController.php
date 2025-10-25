<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Obtiene estadísticas del trabajador: total asistencias, tardanzas, porcentaje de avance.
     */
    public function getStats(int $id): JsonResponse
    {
        $mes = now()->month;
        $anio = now()->year;

        // Total de asistencias en el mes
        $totalAsistencias = DB::table('registro_asistencias')
            ->where('usuario_designado', $id)
            ->whereMonth('fecha_registro', $mes)
            ->whereYear('fecha_registro', $anio)
            ->count();

        $totalAsistenciaPuntual = DB::table('registro_asistencias')
            ->where('usuario_designado', $id)
            ->where('tipo_horario', 'Puntual') // 🔴 Este filtro faltaba
            ->whereMonth('fecha_registro', $mes)
            ->whereYear('fecha_registro', $anio)
            ->count();

        $totalAsistenciastarde = DB::table('registro_asistencias')
            ->where('usuario_designado', $id)
            ->where('tipo_horario', 'Tarde') // 🔴 Este filtro faltaba
            ->whereMonth('fecha_registro', $mes)
            ->whereYear('fecha_registro', $anio)
            ->count();

        // Tardanzas con detalles
        $tardanzas = DB::table('registro_asistencias')
            ->select('fecha_registro', 'tipo_horario', 'hora_ingreso')
            ->where('usuario_designado', $id)
            ->where('tipo_horario', 'Tarde')
            ->whereMonth('fecha_registro', $mes)
            ->whereYear('fecha_registro', $anio)
            ->get();

        // Porcentaje de avance (basado en tareas 'done' este mes)
        $diasLaborales = 26;
        $tareasDone = DB::table('actividadespersonals')
            ->where('usuario_designado', $id)
            ->whereIn('status', ['todo', 'doing', 'done']) 
            ->whereMonth('fecha', $mes)
            ->whereYear('fecha', $anio)
            ->count();

        $porcentajeAvance = $diasLaborales > 0
            ? min(round(($tareasDone / $diasLaborales) * 100, 2), 100)
            : 0;

        return response()->json([
            'total_asistencias' => min($totalAsistencias, 48),
            'total_Puntual' => min($totalAsistenciaPuntual, 48),
            'total_tardanza' => min($totalAsistenciastarde, 48),
            'total_tareas' => min($tareasDone,26),
            'tardanzas' => $tardanzas,
            'porcentaje_avance_mes' => $porcentajeAvance,
        ]);
    }

    /**
     * Obtiene la última asistencia del trabajador.
     */
    public function getUltimaAsistencia(int $id): JsonResponse
    {
        $ultima = DB::table('registro_asistencias')
            ->select('fecha_registro', 'hora_ingreso', 'tipo_horario')
            ->where('usuario_designado', $id)
            ->orderBy('fecha_registro', 'desc')
            ->orderBy('hora_ingreso', 'desc')
            ->first();

        return response()->json($ultima ?? null);
    }
}
