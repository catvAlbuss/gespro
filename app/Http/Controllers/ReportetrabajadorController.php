<?php

namespace App\Http\Controllers;

use App\Models\actividadespersonal;
use App\Models\Proyecto;
use App\Models\tarea_trabajador;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReportetrabajadorController extends Controller
{

    public function show($empresaId)
    {
        try {
            // Obtener usuarios que pertenecen a la empresa con solo los campos id y name
            $usuarios = User::whereHas('empresas', function ($query) use ($empresaId) {
                $query->where('empresa_id', $empresaId);
            })->select('id', 'name', 'surname')->get();

            // Obtener IDs de los usuarios
            $usuarioIds = $usuarios->pluck('id');

            if ($usuarioIds) {
                $tasks = actividadespersonal::where('usuario_designado', $usuarioIds)->get();
            } else {
                // Si no se pasa un ID de trabajador, se devuelven todas las tareas para la empresa
                $tasks = Actividadespersonal::whereIn('usuario_designado', $usuarios->pluck('id'))->get();
            }

            // Obtener proyectos que pertenecen a la empresa con solo los campos id_proyectos y nombre_proyecto
            $proyectos = Proyecto::where('empresa_id', $empresaId)->select('id_proyectos', 'nombre_proyecto', 'plazo_total_pro')->get();

            // Retornar la vista con los datos
            return view('gestor_vista.Administrador.Gestor_reportesGeneral', compact('usuarios', 'proyectos', 'empresaId'));
        } catch (\Exception $e) {
            return view('gestor_vista.Administrador.Gestor_reportesGeneral', ['eventkbs' => collect([]), 'usuarios' => collect([]), 'proyectos' => collect([]), 'empresaId' => $empresaId])->with('error', 'Error al cargar los datos.');
        }
    }

    public function reporteMensual(Request $request, $empresaId)
    {
        Log::info('datos para reportes', $request->all());
        $mes = $request->input('mes', date('m'));
        $anio = $request->input('anio', date('Y'));

        // Validar mes y año
        if (!checkdate($mes, 1, $anio)) {
            return response()->json(['error' => 'Fecha inválida'], 400);
        }

        // Obtener IDs de usuarios de la empresa
        $usuarioIds = User::whereHas('empresas', fn($q) => $q->where('empresa_id', $empresaId))
            ->pluck('id');

        // Filtrar actividades del mes/año seleccionado
        $actividades = actividadespersonal::with(['usuario:id,name,surname', 'proyecto:id_proyectos,nombre_proyecto'])
            ->whereIn('usuario_designado', $usuarioIds)
            ->whereYear('fecha', $anio)
            ->whereMonth('fecha', $mes)
            ->whereIn('status', ['todo', 'doing', 'done', 'aproved'])
            ->get();

        // Agrupar por usuario y status
        $reporte = [];

        foreach ($actividades as $act) {
            $userId = $act->usuario_designado;
            $status = $act->status;

            if (!isset($reporte[$userId])) {
                $reporte[$userId] = [
                    'usuario' => $act->usuario ? $act->usuario->name . ' ' . $act->usuario->surname : "ID: $userId",
                    'todo' => ['diasAsignados' => 0, 'elapsed_time' => 0, 'tareas' => 0],
                    'doing' => ['diasAsignados' => 0, 'elapsed_time' => 0, 'tareas' => 0],
                    'done' => ['diasAsignados' => 0, 'elapsed_time' => 0, 'tareas' => 0],
                    'aproved' => ['diasAsignados' => 0, 'elapsed_time' => 0, 'tareas' => 0],
                ];
            }

            $reporte[$userId][$status]['diasAsignados'] += (float) $act->diasAsignados;
            $reporte[$userId][$status]['elapsed_time'] += (float) $act->elapsed_time;
            $reporte[$userId][$status]['tareas']++;
        }

        return response()->json(array_values($reporte));
    }

    public function reporteMensualPorProyecto(Request $request, $empresaId)
    {
        $mes = $request->input('mes', date('m'));
        $anio = $request->input('anio', date('Y'));

        if (!checkdate($mes, 1, $anio)) {
            return response()->json(['error' => 'Fecha inválida'], 400);
        }

        // Obtener IDs de proyectos de la empresa
        $proyectoIds = Proyecto::where('empresa_id', $empresaId)->pluck('id_proyectos');

        $actividades = actividadespersonal::with(['proyecto:id_proyectos,nombre_proyecto'])
            ->whereIn('projectActividad', $proyectoIds)
            ->whereYear('fecha', $anio)
            ->whereMonth('fecha', $mes)
            ->whereIn('status', ['todo', 'doing', 'done', 'aproved'])
            ->get();

        $reporte = [];

        foreach ($actividades as $act) {
            $proyId = $act->projectActividad;
            $status = $act->status;

            if (!isset($reporte[$proyId])) {
                $reporte[$proyId] = [
                    'proyecto' => $act->proyecto ? $act->proyecto->nombre_proyecto : "ID: $proyId",
                    'todo' => ['diasAsignados' => 0, 'elapsed_time' => 0, 'tareas' => 0],
                    'doing' => ['diasAsignados' => 0, 'elapsed_time' => 0, 'tareas' => 0],
                    'done' => ['diasAsignados' => 0, 'elapsed_time' => 0, 'tareas' => 0],
                    'aproved' => ['diasAsignados' => 0, 'elapsed_time' => 0, 'tareas' => 0],
                ];
            }

            $reporte[$proyId][$status]['diasAsignados'] += (float) $act->diasAsignados;
            $reporte[$proyId][$status]['elapsed_time'] += (float) $act->elapsed_time;
            $reporte[$proyId][$status]['tareas']++;
        }

        return response()->json(array_values($reporte));
    }

    public function obtenerTareasSemanal(Request $request)
    {
        $request->validate([
            'datedesde' => 'required|date',
            'datehasta' => 'required|date',
            'empresa_id' => 'required|integer', // Asegúrate de incluir empresa_id para la consulta de trabajadores
        ]);

        $empresaId = $request->input('empresa_id');
        $fechaDesde = Carbon::parse($request->input('datedesde'))->startOfDay();
        $fechaHasta = Carbon::parse($request->input('datehasta'))->endOfDay();

        // Obtener trabajadores de la empresa
        $trabajadores = User::whereHas('empresas', function ($query) use ($empresaId) {
            $query->where('empresa_id', $empresaId);
        })->select('id', 'name', 'surname', 'area_laboral')->get();

        // Obtener IDs de los trabajadores
        $usuarioIds = $trabajadores->pluck('id');

        // Obtener las tareas actuales dentro del rango de fechas
        $tareasActuales = tarea_trabajador::whereIn('trabajar_asignadot', $usuarioIds)
            ->whereBetween('fecha_subido_t', [$fechaDesde, $fechaHasta])
            ->get();

        // Obtener las tareas de fechas anteriores
        $tareasAnteriores = tarea_trabajador::whereIn('trabajar_asignadot', $usuarioIds)
            ->where('fecha_subido_t', '<', $fechaDesde)
            ->get();

        return response()->json([
            'fecha_desde' => $fechaDesde,
            'fecha_hasta' => $fechaHasta,
            'tareas_actuales' => $tareasActuales,
            'tareas_anteriores' => $tareasAnteriores,
            'trabajadores' => $trabajadores,
        ]);
    }

    public function obtenerTareasMensual(Request $request)
    {
        $request->validate([
            'mes_reporte' => 'required|integer|between:1,12',
            'empresa_id' => 'required|integer',
        ]);

        $empresaId = $request->input('empresa_id');
        $mesSeleccionado = $request->input('mes_reporte');
        $anioActual = now()->year;

        // Obtener trabajadores de la empresa
        $trabajadores = User::whereHas('empresas', function ($query) use ($empresaId) {
            $query->where('empresa_id', $empresaId);
        })->select('id', 'name', 'surname', 'area_laboral')->get();

        // Obtener IDs de los trabajadores
        $usuarioIds = $trabajadores->pluck('id');

        // Obtener las fechas de inicio y fin para la búsqueda de tareas actuales
        $fechaInicioActual = Carbon::createFromDate($anioActual, $mesSeleccionado, 1)->startOfMonth();
        $fechaFinActual = Carbon::createFromDate($anioActual, $mesSeleccionado, 1)->endOfMonth();

        // Obtener las tareas actuales
        $tareasActuales = tarea_trabajador::whereIn('trabajar_asignadot', $usuarioIds) // Cambiado a whereIn
            ->whereBetween('fecha_subido_t', [$fechaInicioActual, $fechaFinActual])
            ->get();

        // Obtener las tareas de meses y años anteriores
        $tareasAnteriores = tarea_trabajador::whereIn('trabajar_asignadot', $usuarioIds) // Cambiado a whereIn
            ->where('fecha_subido_t', '<', $fechaInicioActual)
            ->get();

        return response()->json([
            'mes_seleccionado' => $mesSeleccionado,
            'tareas_actuales' => $tareasActuales,
            'tareas_anteriores' => $tareasAnteriores,
            'trabajadores' => $trabajadores,
        ]);
    }

    public function obtenerTareasIp(Request $request)
    {
        $request->validate([
            'adelanto' => 'required|integer',
            'permisos' => 'required|integer',
            'incMof' => 'required|integer',
            'bondtrab' => 'required|integer',
            'descuenttrab' => 'required|integer',
            'personalIpago' => 'required|integer',
            'informe_pago_mes' => 'required|integer',
            'empresa_id' => 'required|integer',
        ]);

        $empresaId = $request->input('empresa_id');
        $adelantos = $request->input('adelanto');
        $permisos = $request->input('permisos');
        $incMof = $request->input('incMof');
        $bondtrab = $request->input('bondtrab');
        $descuenttrab = $request->input('descuenttrab');
        $personalId = $request->input('personalIpago');
        $informeMes = $request->input('informe_pago_mes');

        // Obtener el año actual
        $anioActual = date('Y');

        // Crear rango de fechas basado en el mes del informe
        $fechaInicio = "$anioActual-$informeMes-01";
        $fechaFin = date("Y-m-t", strtotime($fechaInicio)); // Último día del mes

        // Buscar tareas del trabajador y dentro del rango de fechas
        $tareas = tarea_trabajador::where('trabajar_asignadot', $personalId)
            ->whereBetween('fecha_subido_t', [$fechaInicio, $fechaFin])
            ->get();

        $usuarios = User::whereHas('empresas', function ($query) use ($empresaId) {
            $query->where('empresa_id', $empresaId);
        })->select('id', 'name', 'surname', 'dni_user', 'sueldo_base', 'area_laboral')->get();


        // Obtener proyectos que pertenecen a la empresa con solo los campos id_proyectos y nombre_proyecto
        $proyectos = Proyecto::where('empresa_id', $empresaId)->select('id_proyectos', 'nombre_proyecto')->get();

        // Retornar la vista con los datos de las tareas y otros datos necesarios
        return response()->json([
            'tareas' => $tareas,
            'personalId' => $personalId,
            'informeMes' => $informeMes,
            'adelantos' => $adelantos,
            'permisos' => $permisos,
            'incMof' => $incMof,
            'bondtrab' => $bondtrab,
            'descuenttrab' => $descuenttrab,
            'empresaId' => $empresaId,
            'usuarios' => $usuarios,
            'proyectos' => $proyectos,
        ]);
    }

    public function listarTareasPorEmpresa($empresaId, $mes_reporte_asistencia)
    {
        try {
            // Obtener el año actual
            $anio_designado = date('Y');  // Año actual

            // Validar que el mes esté en el rango de 1 a 12
            if ($mes_reporte_asistencia < 1 || $mes_reporte_asistencia > 12) {
                return response()->json(['error' => 'Mes inválido. Debe ser un número entre 1 y 12.'], 400);
            }

            // Realizar la consulta SQL para obtener las tareas por empresa y mes
            $tareas = DB::table('registro_asistencias')
                ->select(
                    DB::raw("SUBSTRING_INDEX(nombre_personal, ' ', 2) AS nombre_estandarizado"), // Obtiene solo el primer nombre y apellido
                    DB::raw("SUM(CASE WHEN tipo_horario = 'Puntual' THEN 1 ELSE 0 END) AS Cantidad_Puntualidad"),
                    DB::raw("SUM(CASE WHEN tipo_horario = 'Tarde' THEN 1 ELSE 0 END) AS Cantidad_Tardanza")
                )
                ->whereMonth('fecha_registro', $mes_reporte_asistencia)  // Filtrar por el mes proporcionado
                ->whereYear('fecha_registro', $anio_designado)  // Filtrar por el año actual
                ->where('empresa_designado', $empresaId)  // Filtrar por la empresa
                ->groupBy(DB::raw("SUBSTRING_INDEX(nombre_personal, ' ', 2)")) // Agrupa solo por los primeros 2 nombres
                ->get();

            // Verificar si se encontraron resultados
            if ($tareas->isEmpty()) {
                return response()->json(['message' => 'No se encontraron registros para este mes ' . $mes_reporte_asistencia . ' y empresa ' . $empresaId . '.'], 404);
            }

            // Formatear la respuesta
            $response = $tareas->map(function ($tarea) {
                return [
                    'nombre' => $tarea->nombre_estandarizado,
                    'puntualidad' => $tarea->Cantidad_Puntualidad,
                    'tardanza' => $tarea->Cantidad_Tardanza
                ];
            });

            // Devolver la respuesta como JSON
            return response()->json($response, 200);
        } catch (\Exception $e) {
            // Manejar errores
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }


    public function listarAsistenciatrabajador($empresaId, $mes_reporte_asistencia)
    {
        try {
            // Recibir el mes y año a través de la ruta (se asume que el mes se pasa correctamente)
            $mes_designado = $mes_reporte_asistencia;

            // Definir el año. Puedes recibirlo también desde el frontend si es necesario.
            $anio_designado = request('anio_reporte_asistencia', 2024); // Año por defecto 2024 si no se pasa desde el frontend

            // Realizar la consulta SQL para obtener las asistencias de los trabajadores de la empresa
            $asistencias = DB::table('registro_asistencias')
                ->select(
                    DB::raw("SUBSTRING_INDEX(nombre_personal, ' ', 2) AS nombre_estandarizado"), // Obtiene solo el primer nombre y apellido
                    DB::raw("SUM(CASE WHEN tipo_horario = 'Puntual' THEN 1 ELSE 0 END) AS Cantidad_Puntualidad"),
                    DB::raw("SUM(CASE WHEN tipo_horario = 'Tarde' THEN 1 ELSE 0 END) AS Cantidad_Tardanza")
                )
                ->whereMonth('fecha_registro', $mes_designado)
                ->whereYear('fecha_registro', $anio_designado)
                ->where('empresa_designado', $empresaId)
                ->groupBy(DB::raw("SUBSTRING_INDEX(nombre_personal, ' ', 2)")) // Agrupa solo por los primeros 2 nombres
                ->get();

            // Verificar si se encontraron resultados
            if ($asistencias->isEmpty()) {
                return response()->json(['message' => 'No se encontraron registros para este mes y empresa.'], 404);
            }

            // Formatear la respuesta
            $response = $asistencias->map(function ($asistencia) {
                return [
                    'nombre' => $asistencia->nombre_estandarizado, // Mostrar el nombre estandarizado
                    'puntualidad' => $asistencia->Cantidad_Puntualidad,
                    'tardanza' => $asistencia->Cantidad_Tardanza
                ];
            });

            // Devolver la respuesta como JSON
            return response()->json($response, 200);
        } catch (\Exception $e) {
            // Manejar cualquier error
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function vistaTareas($empresaId, $id_tarea = null)
    {
        try {
            // Obtener los usuarios que pertenecen a la empresa especificada
            $usuarios = User::whereHas('empresas', function ($query) use ($empresaId) {
                $query->where('empresa_id', $empresaId);
            })->select('id', 'name')->get();

            // Obtener los ids de los usuarios de la empresa
            $usuarioIds = $usuarios->pluck('id');

            // Filtrar tareas por empresa a través de los proyectos asociados a esa empresa
            $tareas = tarea_trabajador::with(['proyecto', 'user'])
                ->whereHas('proyecto', function ($query) use ($empresaId) {
                    $query->where('empresa_id', $empresaId); // Asegurarse de que el proyecto pertenezca a la empresa
                })
                ->get();

            // Si se pasó un id_tarea, buscarla y cargarla, de lo contrario, dejarla como null
            $tarea = $id_tarea ? tarea_trabajador::with(['proyecto', 'user'])->findOrFail($id_tarea) : null;

            // Obtener los proyectos de la empresa
            $proyectos = Proyecto::where('empresa_id', $empresaId)->select('id_proyectos', 'nombre_proyecto', 'plazo_total_pro')->get();

            // Retornar la vista con los datos
            return view('gestor_vista.Administrador.Gestor_tareas_revGeneral', compact('tareas', 'usuarios', 'proyectos', 'empresaId', 'tarea'));
        } catch (\Exception $e) {
            // Si ocurre un error, devolver una vista con datos vacíos y un mensaje de error
            return view('gestor_vista.Administrador.Gestor_tareas_revGeneral', [
                'eventkbs' => collect([]),
                'usuarios' => collect([]),
                'proyectos' => collect([]),
                'empresaId' => $empresaId
            ])->with('error', 'Error al cargar los datos.');
        }
    }



    public function edit($id_tarea)
    {
        $tarea = tarea_trabajador::findOrFail($id_tarea);
        $tareas = tarea_trabajador::all();
        return view('gestor_vista.Administrador.Gestor_tareas_revGeneral', compact('tareas', 'tarea'));
    }


    public function update(Request $request, $gestorReporte)
    {
        try {
            $tarea = tarea_trabajador::findOrFail($gestorReporte);
            $tarea->procentaje_trabajador = $request->input('procentaje_trabajador');
            $tarea->nombre_documento = $request->input('nombre_documento');
            // Actualiza otros campos necesarios aquí
            $tarea->save();

            // Redirigir a vistaTareas con el ID de la empresa
            return redirect()->route('gestor-tareasRev', ['empresaId' => $request->input('empresa_id')])->with('success', 'Tarea actualizada con éxito.');
        } catch (\Exception $e) {
            return redirect()->route('gestor-tareasRev', ['empresaId' => $request->input('empresa_id')])->with('error', 'Error al actualizar la tarea.');
        }
    }

    public function destroy(string $id)
    {
        //
    }
}
