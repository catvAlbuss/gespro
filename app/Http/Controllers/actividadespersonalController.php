<?php

namespace App\Http\Controllers;

use App\Models\actividadespersonal;
use App\Models\Empresa;
use App\Models\Proyecto;
use App\Models\requerimiento;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Svg\Tag\Rect;

class actividadespersonalController extends Controller
{
    public function index(Request $request)
    {
        // Obtener el ID de la empresa y el ID del trabajador desde la solicitud
        $empresaId = $request->input('empresaId');
        $usuarioId = $request->input('usuarioId');

        // Obtener los usuarios que pertenecen a esa empresa (si se necesita filtrar por empresa)
        $users = User::whereHas('empresas', function ($query) use ($empresaId) {
            $query->where('empresa_id', $empresaId);
        })->get();

        // Filtrar las tareas según el usuario designado
        if ($usuarioId) {
            $tasks = Actividadespersonal::where('usuario_designado', $usuarioId)->get();
        } else {
            // Si no se pasa un ID de trabajador, se devuelven todas las tareas para la empresa
            $tasks = Actividadespersonal::whereIn('usuario_designado', $users->pluck('id'))->get();
        }

        // Obtener los proyectos asociados a la empresa
        $proyectos = Proyecto::where('empresa_id', $empresaId)->get();

        // Incluir el nombre del usuario y el nombre e ID del proyecto en cada tarea
        $tasksWithUserAndProject = $tasks->map(function ($task) use ($users, $proyectos) {
            $user = $users->firstWhere('id', $task->usuario_designado);
            $proyecto = $proyectos->firstWhere('id_proyectos', $task->projectActividad);

            return [
                'task' => $task,
                'user_name' => $user ? $user->name : null,
                'user_id' => $user ? $user->id : null,
                'project_name' => $proyecto ? $proyecto->nombre_proyecto : null,
                'project_id' => $proyecto ? $proyecto->id_proyectos : null,
            ];
        });

        return response()->json($tasksWithUserAndProject);
    }

    public function listar_trabajador($empresaId)
    {
        // Obtener la empresa por su ID
        $empresa = Empresa::find($empresaId);

        // Verificar si la empresa existe
        if (!$empresa) {
            return response()->json(['error' => 'Empresa no encontrada'], 404);
        }

        // Obtener los usuarios (trabajadores) asociados a esta empresa y filtrarlos
        $trabajadores = $empresa->users->filter(function ($user) {
            // Filtrar los usuarios con los nombres especificados
            return !in_array($user->name, ['Administrador', 'LUIS ANGEL']);
        });

        // Obtener solo los campos 'id' y 'name' de los trabajadores filtrados
        $trabajadoresFiltrados = $trabajadores->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name
            ];
        });

        // Retornar los trabajadores filtrados
        return response()->json($trabajadoresFiltrados);
    }

    public function listar_proyectos($empresaId)
    {
        // Obtener solo los nombres y los IDs de los proyectos pertenecientes a la empresa especificada
        $proyectos = Proyecto::where('empresa_id', $empresaId)
            ->select('id_proyectos', 'nombre_proyecto') // Seleccionar solo los campos id y nombre
            ->get();

        // Retornar los proyectos como respuesta JSON
        return response()->json($proyectos);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'project' => 'required|integer',
            'assignedTo' => 'required|integer',
            'status' => 'required|string|in:todo,doing,done,approved',
            'fecha' => 'required|date',
            'diasTo' => 'required|integer',
            'porcentTo' => 'required|integer',
        ]);

        $task = actividadespersonal::create([
            'nameActividad' => $request->name,
            'projectActividad' => $request->project,
            'elapsed_timeActividadId' => 0,
            'status' => $request->status,
            'fecha' => $request->fecha,
            'diasAsignados' => $request->diasTo,
            'porcentajeTarea' => $request->porcentTo,
            'usuario_designado' => $request->assignedTo,
        ]);

        // 🔹 Aquí cargamos joins como en loadTasks
        $projectName = Proyecto::find($request->project)->nombre_proyecto ?? 'Sin proyecto';
        $userName = User::find($request->assignedTo)->name ?? 'Sin asignar';

        return response()->json([
            'task' => $task,
            'project_name' => $projectName,
            'project_id' => $request->project,
            'user_name' => $userName,
            'user_id' => $request->assignedTo,
        ], 201);
    }

    public function edit(string $id)
    {
        //
    }

    public function update_fichas(Request $request, string $id)
    {
        try {
            $request->validate([
                'nameActividad' => 'required|string|max:255',
                'diasAsignados' => 'required|integer',
                'porcentajeTarea' => 'required|integer',
                'projectActividad' => 'required|exists:proyectos,id_proyectos',
                'usuario_designado' => 'required|exists:users,id',
            ]);

            // Si los datos son válidos, proceder a actualizar la tarea
            $actividad = actividadespersonal::findOrFail($id);

            // Asignar los valores validados
            $actividad->nameActividad = $request['nameActividad'];
            $actividad->diasAsignados = $request['diasAsignados'];
            $actividad->porcentajeTarea = $request['porcentajeTarea'];
            $actividad->projectActividad = $request['projectActividad'];
            $actividad->usuario_designado = $request['usuario_designado'];

            // Guardar los cambios
            $actividad->save();

            return response()->json([
                'success' => true,
                'actividad' => $actividad
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Capturar errores de validación
            return response()->json([
                'success' => false,
                'error' => 'Error de validación',
                'detalles' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            // Capturar cualquier otro error
            return response()->json([
                'success' => false,
                'error' => 'Error interno del servidor',
                'mensaje' => $e->getMessage()
            ], 500);
        }
    }

    public function update_colum_task(Request $request, $taskId)
    {
        try {

            // Validar los datos recibidos
            $request->validate([
                'status' => 'required|string|in:todo,doing,done,approved',
                //'elapsedTime' => 'required|numeric',
            ]);

            // Buscar la tarea por su ID
            $task = actividadespersonal::find($taskId);

            // Verificar si la tarea existe
            if (!$task) {
                return response()->json(['error' => 'Tarea no encontrada'], 404);
            }

            // Actualizar las columnas correctas
            $task->update([
                'status' => $request->status,
                //'elapsed_time' => $request->elapsedTime,
            ]);
            return response()->json([
                'message' => 'Tarea actualizada correctamente',
                'task' => $task
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Error interno del servidor'], 500);
        }
    }

    public function destroy(string $id)
    {
        // Encuentra la tarea por su ID
        $task = actividadespersonal::findOrFail($id);

        // Elimina la tarea
        $task->delete();

        // Retorna una respuesta JSON para confirmar que se eliminó
        return response()->json(['message' => 'Tarea eliminada correctamente'], 200);
    }

    //funcionalidades extras
    public function listarTarea($idtrabajador)
    {
        // Obtenemos las tareas del trabajador con status 'todo', solo seleccionamos actividadId y nameActividad
        $actividades = actividadespersonal::where('usuario_designado', $idtrabajador)
            ->whereIn('status', ['todo', 'doing'])  // Usamos whereIn para filtrar por múltiples valores
            ->get(['actividadId', 'nameActividad']);

        // Retornamos los datos en formato JSON para usarlos en el frontend
        return response()->json($actividades);
    }

    //funcionalidades para los jefes
    public function listarTareaJefes($empresaId)
    {
        // Definir los nombres de usuarios que NO deben contarse
        $usuariosExcluidos = ['LUIS ANGEL', 'ANDREA ALEXANDRA', 'Administrador', 'FERNANDO PIERO', 'CESAR RICARDO'];

        // Obtener todos los trabajadores de la empresa, excluyendo los nombres específicos
        $usuarios = User::whereHas('empresas', function ($query) use ($empresaId) {
            $query->where('empresa_id', $empresaId);
        })
            ->whereNotIn('name', $usuariosExcluidos) // Excluir usuarios específicos
            ->get();

        // Verificar si quedan trabajadores después del filtro
        if ($usuarios->isEmpty()) {
            return response()->json([
                'message' => 'No hay trabajadores en esta empresa o los trabajadores están excluidos.',
                'tareas' => [],
                'total_doing' => 0
            ]);
        }

        // Inicializar array de tareas y contador total de "doing"
        $tareas = [];
        $totalDoing = 0;

        // Iterar sobre los trabajadores filtrados
        foreach ($usuarios as $usuario) {
            // Obtener tareas "doing" de cada trabajador
            $actividades = actividadespersonal::where('usuario_designado', '=', (int) $usuario->id)
                ->where('status', 'doing')
                ->get(['actividadId', 'nameActividad']);

            // Contar las tareas y sumarlas al total general
            $cantidadDoing = $actividades->count();
            $totalDoing += $cantidadDoing;

            // Agregar al array de respuesta
            $tareas[] = [
                'nombre_usuario' => $usuario->name,
                'tareas_doing' => $actividades,
                'cantidad_doing' => $cantidadDoing,
            ];
        }

        // Retornar respuesta JSON con la lista de tareas y total "doing"
        return response()->json([
            'tareas' => $tareas,
            'total_doing' => $totalDoing
        ]);
    }

    //funcionalidad para los admninistradores
    public function countRequerimientoAdmin()
    {
        // Contamos los registros de requerimientos donde todos los campos tengan el valor 0
        $count = requerimiento::where('aprobado_logistica', 0)
            ->where('aprobado_contabilidad', 0)
            ->where('aprobado_requerimiento', 0)
            ->count();

        return response()->json(['count' => $count]);
    }

    public function actualizarStatusUser($idTarea, $status)
    {
        // Buscamos la tarea por su ID
        $tarea = actividadespersonal::find($idTarea);

        // Verificamos si la tarea existe
        if ($tarea) {
            // Actualizamos el estado de la tarea
            $tarea->status = $status;
            $tarea->save();

            // Respondemos con un mensaje de éxito
            return response()->json(['success' => true]);
        } else {
            // Si no encontramos la tarea, respondemos con un error
            return response()->json(['success' => false], 404);
        }
    }

    public function exportarIp(Request $request)
    {
        // Validar los datos de entrada
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'month' => 'required|integer|min:1|max:12',
            'empresaId' => 'required|exists:empresas,id',
            'adelanto' => 'nullable|numeric',
            'permisos' => 'nullable|numeric',
            'incMof' => 'nullable|numeric',
            'bondtrab' => 'nullable|numeric',
            'descuenttrab' => 'nullable|numeric',
        ]);

        // Extraer datos validados
        $userId = $validated['user_id'];
        $monthValue = $validated['month'];
        $empresaId = $validated['empresaId'];
        $extras = [
            'adelanto' => $validated['adelanto'] ?? 0,
            'permisos' => $validated['permisos'] ?? 0,
            'incMof' => $validated['incMof'] ?? 0,
            'bondtrab' => $validated['bondtrab'] ?? 0,
            'descuenttrab' => $validated['descuenttrab'] ?? 0,
        ];

        // Obtener el usuario con su empresa
        $user = User::with(['empresas' => function ($query) use ($empresaId) {
            $query->where('empresas.id', $empresaId);
        }])->findOrFail($userId);

        // Obtener tareas del usuario en el mes seleccionado con el proyecto relacionado Aprobados
        $tareas = actividadespersonal::with(['proyecto' => function ($query) {
            $query->select('id_proyectos', 'nombre_proyecto');
        }])
            ->where('usuario_designado', $userId)
            ->whereIn('status', ['approved'])
            ->whereMonth('fecha', $monthValue)
            ->get()
            ->map(function ($tarea) {
                return [
                    'id' => $tarea->actividadId, // Usar la clave primaria correcta
                    'titulo' => $tarea->nameActividad, // Ajustar al campo correcto
                    'descripcion' => $tarea->descripcion ?? 'Sin descripción', // Añadir valor por defecto
                    'status' => $tarea->status,
                    'fecha' => $tarea->fecha,
                    'diasAsignados' => $tarea->diasAsignados,
                    'nombre_proyecto' => $tarea->proyecto ? $tarea->proyecto->nombre_proyecto : 'Sin proyecto asignado',
                ];
            });

        //Obtener tareas del usuario en el mes seleccionado con el proyecto relacionado No Aprobados Contados
        $tareasNoAprobadas = actividadespersonal::with(['proyecto' => function ($query) {
            $query->select('id_proyectos', 'nombre_proyecto');
        }])
            ->where('usuario_designado', $userId)
            ->whereIn('status', ['done'])
            ->whereMonth('fecha', $monthValue)
            ->get()
            ->map(function ($tarea) {
                return [
                    'id' => $tarea->actividadId, // Usar la clave primaria correcta
                    'titulo' => $tarea->nameActividad, // Ajustar al campo correcto
                    'descripcion' => $tarea->descripcion ?? 'Sin descripción', // Añadir valor por defecto
                    'status' => $tarea->status,
                    'fecha' => $tarea->fecha,
                    'diasAsignados' => $tarea->diasAsignados,
                    'nombre_proyecto' => $tarea->proyecto ? $tarea->proyecto->nombre_proyecto : 'Sin proyecto asignado',
                ];
            });
        // Preparar respuesta
        return response()->json([
            'status' => 'success',
            'message' => 'Datos obtenidos correctamente',
            'usuario' => [
                'id' => $user->id,
                'nombre' => $user->name,
                'apellido' => $user->surname,
                'email' => $user->email,
                'dni' => $user->dni_user,
                'telefono' => $user->phone,
                'sueldo_base' => $user->sueldo_base,
                'area_laboral' => $user->area_laboral,
                'empresas' => $user->empresas->map(function ($empresa) {
                    return [
                        'id' => $empresa->id,
                        'razonSocial' => $empresa->razonSocial,
                    ];
                })->first() // Obtener solo la empresa específica
            ],
            'tareas' => $tareas,
            'tareasnoaprobados' => $tareasNoAprobadas,
            'mes' => $monthValue,
            'idEmpresa' => $empresaId,
            'extras' => $extras
        ], 200);
    }

    // En el controlador
    // public function actividadPersonal(Request $request)
    // {
    //     $empresaId = $request->empresaId;
    //     $usuarioId = $request->usuarioId;
    //     $month = $request->month ?? date('m');
    //     $year = $request->year ?? date('Y');

    //     // Filtrar por mes y año específicos
    //     $query = actividadespersonal::whereMonth('fecha', $month)
    //         ->whereYear('fecha', $year);

    //     // ... resto de la lógica
    // }

    public function updateElapsedTime()
    {
        $updated = Actividadespersonal::where('status', 'doing')->update([
            'elapsed_time' => DB::raw('COALESCE(elapsed_time, 0) + 1')
        ]);

        return response()->json([
            'success' => true,
            'message' => "Se actualizó el elapsed_time de {$updated} actividades."
        ]);
    }
}
