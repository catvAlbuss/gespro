<?php

namespace App\Http\Controllers;

use App\Models\CalendarioTrabajador;
use App\Models\Proyecto;
use App\Models\registroAsistencia;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CalendarioTrabajadoresController extends Controller
{

    public function show($empresaId, $trabajadorId)
    {
        try {
            // Obtener el trabajador específico
            $trabajador = User::where('id', $trabajadorId)
                ->whereHas('empresas', function ($query) use ($empresaId) {
                    $query->where('empresa_id', $empresaId);
                })
                ->select('id', 'name')
                ->firstOrFail(); // Esto lanzará un error si no se encuentra

            // Obtener eventos del trabajador específico
            $events = CalendarioTrabajador::where('usuario_id', $trabajadorId)->get();

            // Obtener proyectos que pertenecen a la empresa
            $proyectos = Proyecto::where('empresa_id', $empresaId)->select('id_proyectos', 'nombre_proyecto')->get();

            // Retornar los datos en formato JSON
            return response()->json([
                'events' => $events,
                'trabajador' => $trabajador, // Incluye el trabajador
                'proyectos' => $proyectos,
                'empresaId' => $empresaId,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'events' => [],
                'trabajador' => null,
                'proyectos' => [],
                'empresaId' => $empresaId,
                'error' => 'Error al cargar los datos.'
            ], 500); // Código de error 500 para indicar un error interno del servidor
        }
    }

    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'nombre_trabajador' => 'required|string|max:255',
                'tipo_horario' => 'required|string|max:255',
                'fecha' => 'required|date',
                'horaLima' => 'required|date_format:H:i:s',
                'ubicacion' => 'required|string|max:255',
                'id_trabajador' => 'required|exists:users,id',
                'id_empresa' => 'required|exists:empresas,id',
            ]);

            // Mapea los datos validados a los campos del modelo
            $asistenciaData = [
                'nombre_personal' => $validatedData['nombre_trabajador'],
                'tipo_horario' => $validatedData['tipo_horario'],
                'fecha_registro' => $validatedData['fecha'],
                'hora_ingreso' => $validatedData['horaLima'],
                'ubicacion' => $validatedData['ubicacion'],
                'usuario_designado' => $validatedData['id_trabajador'],
                'empresa_designado' => $validatedData['id_empresa'],
            ];

            // Crea una nueva instancia del modelo y guarda los datos
            $asistencia = new RegistroAsistencia($asistenciaData);

            if (!$asistencia->save()) {
                throw new \Exception("Error al guardar la asistencia.");
            }

            return response()->json(['success' => 'Asistencia registrada con éxito', 'data' => $asistencia], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function listarAsistenciaUser($empresaId, $trabajadorId)
    {
        try {
            // Obtener el mes y año actuales
            $mes_designado = date('m');
            $anio_designado = date('Y');

            // Realizar la consulta SQL
            $asistencias = DB::table('registro_asistencias')
                ->select(
                    DB::raw("SUBSTRING_INDEX(nombre_personal, ' ', 2) AS nombre_estandarizado"), // Obtiene solo el primer nombre y apellido
                    DB::raw("SUM(CASE WHEN tipo_horario = 'Puntual' THEN 1 ELSE 0 END) AS Cantidad_Puntualidad"),
                    DB::raw("SUM(CASE WHEN tipo_horario = 'Tarde' THEN 1 ELSE 0 END) AS Cantidad_Tardanza")
                )
                ->whereMonth('fecha_registro', $mes_designado)
                ->whereYear('fecha_registro', $anio_designado)
                ->where('empresa_designado', $empresaId)
                ->where('usuario_designado', $trabajadorId)
                ->groupBy(DB::raw("SUBSTRING_INDEX(nombre_personal, ' ', 2)")) // Agrupa solo por los primeros 2 nombres
                ->get();
            
            // Formatear la respuesta
            $response = $asistencias->map(function ($asistencia) {
                return [
                    'nombre' => $asistencia->nombre_estandarizado, // Mostrar el nombre estandarizado
                    'puntualidad' => $asistencia->Cantidad_Puntualidad,
                    'tardanza' => $asistencia->Cantidad_Tardanza
                ];
            });


            return response()->json($response, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function listarTareasUser($trabajadorId)
    {
        try {
            // Obtener las tareas del trabajador para la empresa especificada
            $tareas = DB::table('tareas_trabajador')
                ->select('nombre_tarea', 'diasubido', 'fecha_iniciopro', 'fecha_finpro', 'nombre_documento', 'trabajar_asignadot')
                ->where('trabajar_asignadot', $trabajadorId)
                ->get();

            // Verificar si se encontraron tareas
            if ($tareas->isEmpty()) {
                return response()->json(['message' => 'No se encontraron tareas'], 404);
            }

            // Formatear la respuesta
            $response = $tareas->map(function ($tarea) {
                return [
                    'nombre_tarea' => $tarea->nombre_tarea,
                    'diasubido' => $tarea->diasubido,
                    'fecha_iniciopro' => $tarea->fecha_iniciopro,
                    'fecha_finpro' => $tarea->fecha_finpro,
                    'nombre_documento' => $tarea->nombre_documento,
                    'trabajador_id' => $tarea->trabajar_asignadot,
                ];
            });

            return response()->json($response, 200);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
