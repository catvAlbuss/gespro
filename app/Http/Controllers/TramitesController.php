<?php

namespace App\Http\Controllers;

use App\Models\actividadespersonal;
use App\Models\aprobaciones;
use App\Models\BonificacionDescuento;
use App\Models\tramites;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;


class TramitesController extends Controller
{
    /**
     * Jerarquía de roles y sus permisos de aprobación
     */
    private const ROLES_HIERARCHY = [
        'ROOT' => ['ROOT', 'Gerencia', 'Administración', 'Administrador de Proyectos', 'Jefe de Área', 'Asistente', 'Contabilidad'],
        'Gerencia' => ['Gerencia', 'Administración', 'Administrador de Proyectos', 'Jefe de Área', 'Asistente', 'Contabilidad'],
        'Administración' => ['Administración', 'Administrador de Proyectos', 'Jefe de Área', 'Asistente'],
        'Administrador de Proyectos' => ['Administrador de Proyectos', 'Jefe de Área', 'Asistente'],
        'Jefe de Área' => ['Jefe de Área', 'Asistente'],
        'Contabilidad' => ['Contabilidad', 'Gerencia', 'Administración', 'Administrador de Proyectos', 'Jefe de Área', 'Asistente'],
        'Asistente' => []
    ];

    /**
     * Mostrar trámites filtrados por empresa
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $empresaId = $request->get('empresa_id');

        // Loguear los datos iniciales
        Log::info('📥 Datos recibidos en index', [
            'user_id'    => $user->id ?? null,
            'user_name'  => $user->name ?? null,
            'user_role'  => $user->area_laboral ?? null, // 👈 ajusta según tu campo de rol
            'empresa_id' => $empresaId,
        ]);

        // Verificar que el usuario pertenece a la empresa solicitada
        if ($empresaId && !$this->usuarioPerteneceEmpresa($user, $empresaId)) {
            Log::warning('❌ Usuario no pertenece a la empresa', [
                'user_id'    => $user->id,
                'empresa_id' => $empresaId,
            ]);
            return response()->json(['message' => 'No tienes acceso a esta empresa'], 403);
        }

        $query = tramites::with([
            'aprobaciones' => function ($query) {
                $query->orderBy('orden')->with('usuario:id,name,area_laboral');
            },
            'creador:id,name,area_laboral'
        ]);

        // Filtrar por empresa si se proporciona
        if ($empresaId) {
            $query->whereHas('creador.empresas', function ($q) use ($empresaId) {
                $q->where('empresa_id', $empresaId);
            });
        }

        // Filtrar trámites según el rol del usuario
        $tramites = $this->filtrarTramitesPorRol($query, $user)->get();

        // Agregar información de permisos a cada trámite
        $tramites->transform(function ($tramite) use ($user) {
            $tramite->puede_modificar    = $this->puedeModificarTramite($tramite, $user);
            $tramite->puede_ver_botones  = $this->puedeVerBotones($tramite, $user);
            return $tramite;
        });

        // 🔍 Loguear todo lo que se va a devolver
        Log::info('📤 Trámites retornados', [
            'total'    => $tramites->count(),
            'tramites' => $tramites->toArray()
        ]);

        return response()->json($tramites);
    }


    /**
     * Crear nuevo trámite
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tipo' => ['required', Rule::in(['Informe de Pago', 'Requerimiento', 'Solicitud de Compra', 'Autorización de Gasto', 'Reporte Financiero'])],
            'fecha_informe_sol' => 'required|integer|min:1|max:12',
            'descripcion' => 'required|string|max:1000',
            'empresa_id' => 'required|exists:empresas,id',
            'rolUser' => 'required|string|max:1000'
        ]);

        $user = Auth::user();

        // Verificar que el usuario pertenece a la empresa
        if (!$this->usuarioPerteneceEmpresa($user, $validated['empresa_id'])) {
            return response()->json(['message' => 'No tienes acceso a esta empresa'], 403);
        }

        try {
            DB::beginTransaction();

            // Crear el trámite
            $tramite = tramites::create([
                'user_id' => $user->id,
                'tipo' => $validated['tipo'],
                'descripcion' => $validated['descripcion'],
                'estado_actual' => 'En proceso',
                'fecha_informe_sol' => $validated['fecha_informe_sol'],
            ]);

            // Crear registro de bonificación/descuento por defecto
            BonificacionDescuento::create([
                'permisos'          => 0,
                'adelantos'         => 0,
                'incumplimientolab' => 0,
                'incumplimientomof' => 0,
                'descuento'         => 0,
                'bonificacion'      => 0,
                'tramite_desing'    => $tramite->id,
            ]);

            // Usar el rol enviado desde el frontend
            $flujo = $this->definirFlujoAprobacion($validated['rolUser']);

            // Crear las etapas de aprobación
            foreach ($flujo as $index => $etapa) {
                aprobaciones::create([
                    'tramite_id' => $tramite->id,
                    'etapa' => $etapa,
                    'orden' => $index + 1,
                    'aprobado' => false,
                ]);
            }

            DB::commit();

            return response()->json(
                $tramite->load(['aprobaciones', 'creador:id,name,area_laboral']),
                201
            );
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear el trámite: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Aprobar trámite
     */
    public function aprobar(Request $request, tramites $tramite)
    {
        $request->validate([
            'observaciones' => 'nullable|string|max:500',
            'empresa_id' => 'required|exists:empresas,id'
        ]);

        $user = Auth::user();

        // Verificar que el usuario pertenece a la empresa (antes de permisos)
        if (!$this->usuarioPerteneceEmpresa($user, $request->empresa_id)) {
            return response()->json(['message' => 'No tienes acceso a esta empresa'], 403);
        }

        // Verificar permisos
        if (!$this->puedeModificarTramite($tramite, $user)) {
            return response()->json(['message' => 'No tienes permisos para aprobar este trámite'], 403);
        }

        try {
            DB::beginTransaction();

            // Buscar la etapa correspondiente al usuario actual comparando normalizado
            $etapaActual = $tramite->aprobaciones->first(function ($a) use ($user) {
                return !$a->aprobado && is_null($a->usuario_id) && $this->roleKey($a->etapa) === $this->roleKey($user->area_laboral);
            });

            // Si no hay una etapa exactamente igual al rol del usuario (por ejemplo
            // en casos donde se permite auto-aprobación), tomar la primera etapa pendiente
            if (!$etapaActual) {
                $etapaActual = $tramite->aprobaciones->first(function ($a) {
                    return !$a->aprobado && is_null($a->usuario_id);
                });
            }

            if (!$etapaActual) {
                return response()->json(['message' => 'No tienes una etapa pendiente para este trámite'], 403);
            }

            // Marcar como aprobado
            $etapaActual->update([
                'aprobado' => true,
                'usuario_id' => $user->id,
                'observaciones' => $request->observaciones,
                'fecha_aprobacion' => now()
            ]);

            // Verificar si el trámite está completamente aprobado
            $etapasPendientes = $tramite->aprobaciones()
                ->where('aprobado', false)
                ->count();

            if ($etapasPendientes === 0) {
                $tramite->update(['estado_actual' => 'Completado']);
            }

            DB::commit();

            return response()->json([
                'message' => 'Trámite aprobado correctamente',
                'tramite' => $tramite->fresh()->load(['aprobaciones.usuario:id,name,area_laboral', 'creador:id,name,area_laboral'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al aprobar el trámite: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Rechazar trámite
     */
    public function rechazar(Request $request, tramites $tramite)
    {
        $request->validate([
            'observaciones' => 'required|string|max:500',
            'empresa_id' => 'required|exists:empresas,id'
        ]);

        $user = Auth::user();

        // Verificar que el usuario pertenece a la empresa (antes de permisos)
        if (!$this->usuarioPerteneceEmpresa($user, $request->empresa_id)) {
            return response()->json(['message' => 'No tienes acceso a esta empresa'], 403);
        }

        // Verificar permisos
        if (!$this->puedeModificarTramite($tramite, $user)) {
            return response()->json(['message' => 'No tienes permisos para rechazar este trámite'], 403);
        }

        try {
            DB::beginTransaction();

            // Buscar la etapa correspondiente al usuario actual comparando normalizado
            $etapaActual = $tramite->aprobaciones->first(function ($a) use ($user) {
                return !$a->aprobado && is_null($a->usuario_id) && $this->roleKey($a->etapa) === $this->roleKey($user->area_laboral);
            });

            // Si no hay una etapa exactamente igual al rol del usuario, tomar la primera pendiente
            if (!$etapaActual) {
                $etapaActual = $tramite->aprobaciones->first(function ($a) {
                    return !$a->aprobado && is_null($a->usuario_id);
                });
            }

            if (!$etapaActual) {
                return response()->json(['message' => 'No tienes una etapa pendiente para este trámite'], 403);
            }

            // Marcar como rechazado
            $etapaActual->update([
                'aprobado' => false,
                'usuario_id' => $user->id,
                'observaciones' => $request->observaciones,
                'fecha_aprobacion' => now()
            ]);

            // Cambiar estado del trámite a rechazado
            $tramite->update(['estado_actual' => 'Rechazado']);

            DB::commit();

            return response()->json([
                'message' => 'Trámite rechazado',
                'tramite' => $tramite->fresh()->load(['aprobaciones.usuario:id,name,area_laboral', 'creador:id,name,area_laboral'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al rechazar el trámite: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar detalles de un trámite específico
     */
    public function show(Request $request, tramites $tramite)
    {
        $user = Auth::user();
        $empresaId = $request->get('empresa_id');

        // Verificar permisos para ver el trámite
        if (!$this->puedeVerTramite($tramite, $user)) {
            return response()->json(['message' => 'No autorizado para ver este trámite'], 403);
        }

        // Verificar empresa si se proporciona
        if ($empresaId && !$this->usuarioPerteneceEmpresa($user, $empresaId)) {
            return response()->json(['message' => 'No tienes acceso a esta empresa'], 403);
        }

        $tramite->load(['aprobaciones.usuario:id,name,area_laboral', 'creador:id,name,area_laboral']);
        $tramite->puede_modificar = $this->puedeModificarTramite($tramite, $user);
        $tramite->puede_ver_botones = $this->puedeVerBotones($tramite, $user);

        return response()->json($tramite);
    }

    /**
     * Reenviar (reiniciar) un trámite rechazado para que vuelva a empezar el flujo
     */
    public function reenviar(Request $request, tramites $tramite)
    {
        $request->validate([
            'empresa_id' => 'required|exists:empresas,id'
        ]);

        $user = Auth::user();

        // Solo permitir reenviar si pertenece a la empresa
        if (!$this->usuarioPerteneceEmpresa($user, $request->empresa_id)) {
            return response()->json(['message' => 'No tienes acceso a esta empresa'], 403);
        }

        // Solo se puede reenviar si el trámite está en estado Rechazado
        if ($tramite->estado_actual !== 'Rechazado') {
            return response()->json(['message' => 'Solo se pueden reenviar trámites rechazados'], 422);
        }

        try {
            DB::beginTransaction();

            // Resetear todas las aprobaciones: marcar como no aprobadas y limpiar usuario/observaciones/fecha
            foreach ($tramite->aprobaciones as $ap) {
                $ap->update([
                    'aprobado' => false,
                    'usuario_id' => null,
                    'observaciones' => null,
                    'fecha_aprobacion' => null
                ]);
            }

            // Cambiar estado del trámite a 'En proceso' y limpiar observaciones generales si existieran
            $tramite->update([
                'estado_actual' => 'En proceso',
                'observaciones' => null
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Trámite reenviado correctamente',
                'tramite' => $tramite->fresh()->load(['aprobaciones.usuario:id,name,area_laboral', 'creador:id,name,area_laboral'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Error al reenviar trámite: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Obtener estadísticas de trámites
     */
    public function estadisticas(Request $request)
    {
        $user = Auth::user();
        $empresaId = $request->get('empresa_id');

        $query = tramites::query();

        // Filtrar por empresa si se proporciona
        if ($empresaId) {
            if (!$this->usuarioPerteneceEmpresa($user, $empresaId)) {
                return response()->json(['message' => 'No tienes acceso a esta empresa'], 403);
            }

            $query->whereHas('creador.empresas', function ($q) use ($empresaId) {
                $q->where('empresa_id', $empresaId);
            });
        }

        // Filtrar según permisos del usuario
        $query = $this->filtrarTramitesPorRol($query, $user);

        $stats = [
            'total' => $query->count(),
            'en_proceso' => (clone $query)->where('estado_actual', 'En proceso')->count(),
            'completados' => (clone $query)->where('estado_actual', 'Completado')->count(),
            'rechazados' => (clone $query)->where('estado_actual', 'Rechazado')->count(),
            'mis_tramites' => (clone $query)->where('user_id', $user->id)->count(),
            'pendientes_aprobacion' => $this->contarTramitesPendientesAprobacion($user, $empresaId)
        ];

        return response()->json($stats);
    }

    /**
     * Obtener perfil del usuario con rol
     */
    public function getUserProfile(Request $request)
    {
        $trabajadorId = $request->input('id');       // viene del JSON
        $empresaId    = $request->input('empresaId');

        $user = User::with(['empresas'])->find($trabajadorId);

        if (!$user) {
            return response()->json(['error' => 'Usuario no encontrado'], 404);
        }

        $empresa = $user->empresas()->where('empresas.id', $empresaId)->first();

        if (!$empresa) {
            return response()->json(['error' => 'Empresa no encontrada o no asociada al usuario'], 404);
        }

        return response()->json([
            'id'                  => $user->id,
            'name'                => $user->name,
            'rol'                 => $user->area_laboral ?? 'Sin Rol',  // ✅ usar campo simple
            'empresaid'           => $empresa->id,
            'empresarazonsocial'  => $empresa->razonSocial,
        ]);
    }

    /**
     * Normalizar/obtener la clave canónica de un rol.
     */
    private function roleKey($rol)
    {
        if (!$rol) return '';
        // quitar tildes y normalizar
        $s = trim($rol);
        $search = ['Á', 'É', 'Í', 'Ó', 'Ú', 'á', 'é', 'í', 'ó', 'ú', 'Ñ', 'ñ'];
        $replace = ['A', 'E', 'I', 'O', 'U', 'a', 'e', 'i', 'o', 'u', 'N', 'n'];
        $s = str_replace($search, $replace, $s);
        $s = mb_strtolower($s);

        $map = [
            'root' => 'ROOT',
            'gerencia' => 'Gerencia',
            'administracion' => 'Administración',
            'administración' => 'Administración',
            'administrador de proyectos' => 'Administrador de Proyectos',
            'jefe de area' => 'Jefe de Área',
            'jefe de área' => 'Jefe de Área',
            'asistente' => 'Asistente',
            'contabilidad' => 'Contabilidad'
        ];

        return $map[$s] ?? ucfirst($s);
    }

    /**
     * Cargar Actividad del personal y los descuentos
     */
    public function getDataActivityPersonalMount(Request $request)
    {
        // 1. Validar datos de entrada
        $validated = $request->validate([
            'user_id'       => 'required|exists:users,id',
            'month'         => 'required|integer|min:1|max:12',
            'empresaId'     => 'required|exists:empresas,id',
            'tramitedesing' => 'required|numeric|exists:tramites,id',
            'adelanto'      => 'nullable|numeric',
            'permisos'      => 'nullable|numeric',
            'incMof'        => 'nullable|numeric',
            'bondtrab'      => 'nullable|numeric',
            'descuenttrab'  => 'nullable|numeric',
        ]);

        $userId    = $validated['user_id'];
        $month     = $validated['month'];
        $tramiteId = $validated['tramitedesing'];

        // 2. Extras por defecto
        $extras = [
            'adelanto'     => $validated['adelanto'] ?? 0,
            'permisos'     => $validated['permisos'] ?? 0,
            'incMof'       => $validated['incMof'] ?? 0,
            'bondtrab'     => $validated['bondtrab'] ?? 0,
            'descuenttrab' => $validated['descuenttrab'] ?? 0,
        ];

        // 3. Mapper de tareas
        $mapTareas = function ($tarea, $aprobada = true) {
            $fechaInicio = \Carbon\Carbon::parse($tarea->fecha);
            $fechaFin    = (clone $fechaInicio)->addDays($tarea->elapsed_time ?? 0);

            return [
                'id'             => $tarea->actividadId,
                'titulo'         => $tarea->nameActividad,
                'descripcion'    => $tarea->descripcion ?? 'Sin descripción',
                'status'         => $aprobada ? 'sí' : 'no',
                'fecha_inicio'   => $fechaInicio->format('Y-m-d'),
                'fecha_fin'      => $fechaFin->format('Y-m-d'),
                'diasEjecutados' => $tarea->elapsed_time ?? 0,
                'diasProgramado' => $tarea->diasAsignados ?? 0,
                'proyecto'       => $tarea->proyecto->nombre_proyecto ?? 'Sin proyecto',
            ];
        };

        // 4. Consultar tareas aprobadas y no aprobadas
        $tareasAprobadas = actividadespersonal::with('proyecto:id_proyectos,nombre_proyecto')
            ->where('usuario_designado', $userId)
            ->where('status', 'approved')
            ->whereMonth('fecha', $month)
            ->get();

        $tareasNoAprobadas = actividadespersonal::with('proyecto:id_proyectos,nombre_proyecto')
            ->where('usuario_designado', $userId)
            ->where('status', 'done')
            ->whereMonth('fecha', $month)
            ->get();

        // 5. Mapear tareas
        $tareasMapped     = $tareasAprobadas->map(fn($t) => $mapTareas($t, true));
        $tareasNoMapped   = $tareasNoAprobadas->map(fn($t) => $mapTareas($t, false));

        // 6. Totales sumando diasProgramado y diasEjecutados
        $totalDiasAprobados = $tareasMapped->sum('diasProgramado');

        $totalDiasNoAprobados = $tareasNoMapped->sum('diasProgramado');

        // 7. Bonificación y descuentos
        $bonificacionDescuento = BonificacionDescuento::where('tramite_desing', $tramiteId)->first();

        $bonificacionData = [
            'adelantos'          => $bonificacionDescuento->adelantos ?? 0,
            'permisos'           => $bonificacionDescuento->permisos ?? 0,
            'incumplimientolab'  => $bonificacionDescuento->incumplimientolab ?? 0,
            'incumplimientomof'  => $bonificacionDescuento->incumplimientomof ?? 0,
            'descuento'          => $bonificacionDescuento->descuento ?? 0,
            'bonificacion'       => $bonificacionDescuento->bonificacion ?? 0,
        ];

        // 8. Respuesta
        return response()->json([
            'status'              => 'success',
            'mes'                 => $month,
            'extras'              => $bonificacionData,
            'tareas'              => $tareasMapped,
            'tareas_no_aprobadas' => $tareasNoMapped,
            'totalDiasAprobados'  => $totalDiasAprobados,
            'totalDiasNoAprobados' => $totalDiasNoAprobados,
        ]);
    }

    /**
     * Actualizar Bonificacion/descuentos
     */
    public function updateBonificacionDescuento(Request $request)
    {
        $validated = $request->validate([
            'tramitedesing' => 'required|exists:tramites,id',
            'descuentos'    => 'required|array',
            'descuentos.*.key' => 'required|string',
            'descuentos.*.cantidad' => 'nullable|numeric',
        ]);

        try {
            // Buscar registro existente
            $bonificacion = BonificacionDescuento::firstOrCreate(
                ['tramite_desing' => $validated['tramitedesing']],
                [
                    'permisos' => 0,
                    'adelantos' => 0,
                    'incumplimientolab' => 0,
                    'incumplimientomof' => 0,
                    'descuento' => 0,
                    'bonificacion' => 0,
                ]
            );

            // Mapeo entre keys de JS y columnas DB
            $map = [
                'permisos'    => 'permisos',
                'adelanto'    => 'adelantos',
                'adelantos'   => 'adelantos',
                'incLab'      => 'incumplimientolab',
                'incMof'      => 'incumplimientomof',
                'descuenttrab' => 'descuento',
                'bondtrab'    => 'bonificacion',
            ];

            foreach ($validated['descuentos'] as $item) {
                if (isset($map[$item['key']])) {
                    $columna = $map[$item['key']];
                    $bonificacion->$columna = $item['cantidad'] ?? 0;
                }
            }

            $bonificacion->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Descuentos actualizados correctamente',
                'data' => $bonificacion,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al actualizar descuentos: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtener Informe de Pago - Banco
     */
    public function getDataInformePago(Request $request)
    {
        // Validar los datos de entrada
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'month' => 'required|integer|min:1|max:12',
            'empresaId' => 'required|exists:empresas,id',
            'tramite_id' => 'nullable|exists:tramites,id', // 🔹 Agregar tramite_id
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
        $tramiteId = $validated['tramite_id'] ?? null;

        // 🔹 Inicializar extras con valores por defecto
        $extras = [
            'adelanto' => $validated['adelanto'] ?? 0,
            'permisos' => $validated['permisos'] ?? 0,
            'incMof' => $validated['incMof'] ?? 0,
            'bondtrab' => $validated['bondtrab'] ?? 0,
            'descuenttrab' => $validated['descuenttrab'] ?? 0,
        ];

        // Obtener el usuario con su empresa y banco
        $user = User::with([
            'empresas' => function ($query) use ($empresaId) {
                $query->where('empresas.id', $empresaId);
            },
            'banco'
        ])->findOrFail($userId);

        // 🔹 Obtener datos del trámite, sus aprobaciones y bonificaciones/descuentos
        $tramiteData = null;
        $aprobacionesData = [];
        $bonificacionDescuentoData = null;

        if ($tramiteId) {
            $tramite = tramites::with([
                'aprobaciones' => function ($query) {
                    $query->with('usuario:id,name,surname,email')
                        ->orderBy('orden');
                }
            ])->find($tramiteId);

            if ($tramite) {
                $tramiteData = [
                    'id' => $tramite->id,
                    'tipo' => $tramite->tipo,
                    'descripcion' => $tramite->descripcion,
                    'estado_actual' => $tramite->estado_actual,
                    'progreso' => $tramite->progreso,
                    'esta_completamente_aprobado' => $tramite->estaCompletamenteAprobado(),
                    'created_at' => $tramite->created_at,
                    'updated_at' => $tramite->updated_at,
                ];

                $aprobacionesData = $tramite->aprobaciones->map(function ($aprobacion) {
                    return [
                        'id' => $aprobacion->id,
                        'etapa' => $aprobacion->etapa,
                        'aprobado' => $aprobacion->aprobado,
                        'orden' => $aprobacion->orden,
                        'observaciones' => $aprobacion->observaciones,
                        'fecha_aprobacion' => $aprobacion->fecha_aprobacion,
                        'usuario_aprobador' => $aprobacion->usuario ? [
                            'id' => $aprobacion->usuario->id,
                            'nombre' => $aprobacion->usuario->name,
                            'apellido' => $aprobacion->usuario->surname,
                            'email' => $aprobacion->usuario->email,
                        ] : null,
                        'esta_aprobado' => $aprobacion->estaAprobado(),
                        'esta_pendiente' => $aprobacion->estaPendiente(),
                        'esta_rechazado' => $aprobacion->estaRechazado(),
                    ];
                });

                // 🔹 Buscar bonificaciones y descuentos directamente por tramite_id
                $bonificacionDescuento = BonificacionDescuento::where('tramite_desing', $tramiteId)->first();

                if ($bonificacionDescuento) {
                    $bonificacionDescuentoData = [
                        'id' => $bonificacionDescuento->id,
                        'permisos' => $bonificacionDescuento->permisos ?? 0,
                        'adelantos' => $bonificacionDescuento->adelantos ?? 0,
                        'incumplimientolab' => $bonificacionDescuento->incumplimientolab ?? 0,
                        'incumplimientomof' => $bonificacionDescuento->incumplimientomof ?? 0,
                        'descuento' => $bonificacionDescuento->descuento ?? 0,
                        'bonificacion' => $bonificacionDescuento->bonificacion ?? 0,
                    ];

                    // 🔹 Sobrescribir los valores de extras con los datos del trámite si existen
                    $extras['permisos'] = $bonificacionDescuento->permisos ?? 0;
                    $extras['adelanto'] = $bonificacionDescuento->adelantos ?? 0;
                    $extras['incumplimientolab'] = $bonificacionDescuento->incumplimientolab ?? 0;
                    $extras['incMof'] = $bonificacionDescuento->incumplimientomof ?? 0;
                    $extras['descuenttrab'] = $bonificacionDescuento->descuento ?? 0;
                    $extras['bondtrab'] = $bonificacionDescuento->bonificacion ?? 0;
                }
            }
        }

        $jefesPorEmpresa = [
            1 => 2,  // Empresa 1 -> User ID 2
            2 => 6,  // Empresa 2 -> User ID 6
            3 => 14, // Empresa 3 -> User ID 14
            4 => 14, // Empresa 4 -> User ID 14
            5 => 12, // Empresa 5 -> User ID 12
        ];

        // 🔹 Obtener información del jefe de área para esta empresa
        $jefeAreaId = $jefesPorEmpresa[$empresaId] ?? null;
        $jefeAreaInfo = null;

        if ($jefeAreaId) {
            $jefeArea = User::select('id', 'name', 'surname', 'email', 'area_laboral')
                ->find($jefeAreaId);
            if ($jefeArea) {
                $jefeAreaInfo = [
                    'id' => $jefeArea->id,
                    'nombre' => $jefeArea->name,
                    'apellido' => $jefeArea->surname,
                    'email' => $jefeArea->email,
                    'area_laboral' => $jefeArea->area_laboral,
                    'nombre_completo' => $jefeArea->name . ' ' . $jefeArea->surname
                ];
            }
        }

        // 🔹 Generar mapeo de firmas basado en las aprobaciones
        $firmasDisponibles = $this->generarMapeoFirmas($aprobacionesData, $empresaId, $jefeAreaInfo);

        // ... resto del código para tareas (sin cambios) ...
        $tareas = actividadespersonal::with(['proyecto' => function ($query) {
            $query->select('id_proyectos', 'nombre_proyecto');
        }])
            ->where('usuario_designado', $userId)
            ->whereIn('status', ['approved'])
            ->whereMonth('fecha', $monthValue)
            ->get()
            ->map(function ($tarea) {
                return [
                    'id' => $tarea->actividadId,
                    'titulo' => $tarea->nameActividad,
                    'descripcion' => $tarea->descripcion ?? 'Sin descripción',
                    'status' => $tarea->status,
                    'fecha' => $tarea->fecha,
                    'diasAsignados' => $tarea->diasAsignados,
                    'nombre_proyecto' => $tarea->proyecto ? $tarea->proyecto->nombre_proyecto : 'Sin proyecto asignado',
                ];
            });

        $tareasNoAprobadas = actividadespersonal::with(['proyecto' => function ($query) {
            $query->select('id_proyectos', 'nombre_proyecto');
        }])
            ->where('usuario_designado', $userId)
            ->whereIn('status', ['done'])
            ->whereMonth('fecha', $monthValue)
            ->get()
            ->map(function ($tarea) {
                return [
                    'id' => $tarea->actividadId,
                    'titulo' => $tarea->nameActividad,
                    'descripcion' => $tarea->descripcion ?? 'Sin descripción',
                    'status' => $tarea->status,
                    'fecha' => $tarea->fecha,
                    'diasAsignados' => $tarea->diasAsignados,
                    'nombre_proyecto' => $tarea->proyecto ? $tarea->proyecto->nombre_proyecto : 'Sin proyecto asignado',
                ];
            });

        // Preparar datos bancarios
        $datosBancarios = null;
        if ($user->banco) {
            $datosBancarios = [
                'id' => $user->banco->id,
                'nombre_banco' => $user->banco->nombre_banco,
                'numero_cuenta' => $user->banco->numero_cuenta,
                'cci' => $user->banco->cci,
            ];
        }

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
                })->first(),
                'banco' => $datosBancarios
            ],
            'tareas' => $tareas,
            'tareasnoaprobados' => $tareasNoAprobadas,
            'mes' => $monthValue,
            'idEmpresa' => $empresaId,
            'extras' => $extras,
            // 🔹 Nuevos datos del trámite
            'tramite' => $tramiteData,
            'aprobaciones' => $aprobacionesData,
            'bonificacion_descuento' => $bonificacionDescuentoData, // 🔹 Agregar bonificaciones/descuentos
            'firmas_disponibles' => $firmasDisponibles,
            'jefe_area' => $jefeAreaInfo
        ], 200);
    }

    /**
     * 🔹 Método auxiliar para generar mapeo de firmas (modificado)
     */
    private function generarMapeoFirmas($aprobaciones, $empresaId, $jefeAreaInfo)
    {
        $mapeoFirmas = [];

        foreach ($aprobaciones as $aprobacion) {
            if ($aprobacion['aprobado']) {
                $etapa = $aprobacion['etapa'];
                $archivoFirma = null;
                $usuarioAprobador = $aprobacion['usuario_aprobador'];

                // 🔹 Lógica especial para Jefe de Área
                if ($etapa === 'Jefe de Área') {
                    $archivoFirma = $this->obtenerFirmaJefeAreaPorEmpresa($empresaId, $jefeAreaInfo);
                    // Usar la info del jefe específico en lugar del usuario que aprobó
                    if ($jefeAreaInfo) {
                        $usuarioAprobador = [
                            'id' => $jefeAreaInfo['id'],
                            'nombre' => $jefeAreaInfo['nombre'],
                            'apellido' => $jefeAreaInfo['apellido'],
                            'email' => $jefeAreaInfo['email']
                        ];
                    }
                } else {
                    // Para otras etapas, usar el mapeo normal
                    $archivoFirma = $this->obtenerArchivoFirmaPorEtapa($etapa);
                }

                if ($archivoFirma) {
                    $mapeoFirmas[] = [
                        'etapa' => $etapa,
                        'archivo' => $archivoFirma,
                        'usuario_aprobador' => $usuarioAprobador,
                        'fecha_aprobacion' => $aprobacion['fecha_aprobacion'],
                        'orden' => $aprobacion['orden']
                    ];
                }
            }
        }

        // Ordenar por orden de aprobación
        usort($mapeoFirmas, function ($a, $b) {
            return $a['orden'] <=> $b['orden'];
        });

        return $mapeoFirmas;
    }

    /**
     * 🔹 Obtener archivo de firma específico para Jefe de Área según empresa
     */
    private function obtenerFirmaJefeAreaPorEmpresa($empresaId, $jefeAreaInfo)
    {
        // Mapeo de empresa -> archivo de firma del jefe
        $firmasJefesPorEmpresa = [
            1 => 'FirmasGestorPro-bg.png',    // Para empresa 1 (userId=2)
            2 => 'FirmasJefeAreaProyecta-bg.png',    // Para empresa 2 (userId=6)
            3 => 'FirmasJefeAreaSeven-bg.png',    // Para empresa 3 (userId=14)
            4 => 'FirmaJefeArea_Empresa4.png',    // Para empresa 4 (userId=14)
            5 => 'FirmaJefeArea_Empresa5.png',    // Para empresa 5 (userId=12)
        ];

        return $firmasJefesPorEmpresa[$empresaId] ?? 'FirmaJefeArea_Default.png';
    }

    /**
     * 🔹 Mapeo de etapas a archivos de firma (actualizado)
     */
    private function obtenerArchivoFirmaPorEtapa($etapa)
    {
        $mapeoArchivos = [
            'Asistente' => 'FirmaAsistente-bg.png',
            // 'Jefe de Área' se maneja por separado en obtenerFirmaJefeAreaPorEmpresa
            'Administrador de Proyectos' => 'FirmasGestorPro-bg.png',
            'Administración' => 'FirmasGestorAdmon-bg.png',
            'Gerencia' => 'FirmasGerencia-bg.png',
            'Contabilidad' => 'FirmasGestorAdmon-bg.png',
        ];

        return $mapeoArchivos[$etapa] ?? null;
    }

    // ============ MÉTODOS PRIVADOS ============

    /**
     * Verificar si el usuario pertenece a la empresa
     */
    private function usuarioPerteneceEmpresa($user, $empresaId)
    {
        if ($user->area_laboral === 'ROOT') {
            return true; // ROOT puede acceder a todas las empresas
        }

        return $user->empresas()->where('empresa_id', $empresaId)->exists();
    }

    /**
     * Filtrar trámites según el rol del usuario
     */
    private function filtrarTramitesPorRol($query, $user)
    {
        $rol = $this->roleKey($user->area_laboral);
        Log::info('El rol detectado', ['rol' => $rol]);

        // si ROOT, ve todo
        if ($rol === 'ROOT') return $query;

        // Helper closures para buscar etapas pendientes comparando normalizado
        $etapaPendienteWhere = function ($q) use ($user) {
            $q->where('aprobado', false)->whereNull('usuario_id');
        };

        switch ($rol) {
            case 'Asistente':
                return $query->where('user_id', $user->id);

            case 'Jefe de Área':
                return $query->where(function ($q) use ($user, $etapaPendienteWhere) {
                    $q->where('user_id', $user->id)
                        ->orWhere(function ($q2) use ($user, $etapaPendienteWhere) {
                            $q2->whereHas('creador', function ($q3) {
                                $q3->where('area_laboral', 'Asistente');
                            })->whereHas('aprobaciones', function ($q3) use ($user, $etapaPendienteWhere) {
                                $etapaPendienteWhere($q3);
                                $q3->where('etapa', $user->area_laboral);
                            });
                        });
                });

            case 'Administrador de Proyectos':
                return $query->where(function ($q) use ($user, $etapaPendienteWhere) {
                    $q->where('user_id', $user->id)
                        ->orWhere(function ($q2) use ($user, $etapaPendienteWhere) {
                            $q2->whereHas('aprobaciones', function ($q3) use ($user, $etapaPendienteWhere) {
                                $etapaPendienteWhere($q3);
                                $q3->where('etapa', $user->area_laboral);
                            })->whereHas('creador', function ($q3) {
                                $q3->whereIn('area_laboral', ['Asistente', 'Jefe de Área']);
                            });
                        });
                });

            case 'Administración':
            case 'Gerencia':
                // Normalizar area_laboral (trim y lowercase)
                $area = mb_strtolower(trim($user->area_laboral));

                return $query->where(function ($q) use ($user, $etapaPendienteWhere, $area) {
                    $q->where('user_id', $user->id)
                        ->orWhereHas('aprobaciones', function ($q2) use ($etapaPendienteWhere, $area) {
                            $etapaPendienteWhere($q2);
                            // Comparación normalizada (sin espacios/tildes ni mayúsculas)
                            $q2->whereRaw('LOWER(TRIM(etapa)) = ?', [$area]);
                        });
                });
                
            case 'Contabilidad':
                return $query->whereHas('aprobaciones', function ($q) use ($user, $etapaPendienteWhere) {
                    $etapaPendienteWhere($q);
                    $q->where('etapa', $user->area_laboral);
                });

            default:
                return $query->where('user_id', $user->id);
        }
    }

    /**
     * Definir flujo de aprobación según el rol del creador
     */
    private function definirFlujoAprobacion($rolCreador)
    {
        $flujos = [
            'Asistente' => ['Jefe de area', 'Administrador de Proyectos', 'Administracion', 'Gerencia', 'Contabilidad'],
            'Jefe de area' => ['Jefe de area', 'Administrador de Proyectos', 'Administracion', 'Gerencia', 'Contabilidad'],
            'admin_proyectos' => ['Administrador de Proyectos', 'Administracion', 'Gerencia', 'Contabilidad'],
            'administracion' => ['Administracion', 'Gerencia', 'Contabilidad'], // ← Cambié de 'Administración' a 'Administracion'
            'Gerencia' => ['Contabilidad'],
            'Contabilidad' => [],
        ];

        return $flujos[$rolCreador] ?? ['Jefe de area', 'Administrador de Proyectos', 'Administracion', 'Gerencia', 'Contabilidad'];
    }

    /**
     * Verificar si el usuario puede modificar (aprobar/rechazar) un trámite
     */
    private function puedeModificarTramite($tramite, $user)
    {
        // No puede modificar sus propios trámites salvo excepciones de negocio
        if ($tramite->user_id === $user->id) {
            // Excepciones: Jefe de Área y roles administrativos pueden revisar
            // su propio 'Informe de Pago' (no requieren un jefe para ese tipo).
            $userKey = $this->roleKey($user->area_laboral);
            if (
                in_array($userKey, ['Jefe de Área', 'Administración', 'Administrador de Proyectos', 'Gerencia'])
                && isset($tramite->tipo) && $tramite->tipo === 'Informe de Pago'
            ) {
                // permitir la modificación en este caso
            } else {
                return false;
            }
        }

        // ROOT puede modificar cualquier trámite
        if ($user->area_laboral === 'ROOT') {
            return true;
        }

        // Verificar jerarquía: normalizar ambos roles
        $userKey = $this->roleKey($user->area_laboral);
        $creatorKey = $this->roleKey($tramite->creador->area_laboral ?? '');
        $rolesPermitidos = self::ROLES_HIERARCHY[$userKey] ?? [];
        $puedeModificarPorJerarquia = in_array($creatorKey, $rolesPermitidos);

        // Comprobar si tiene una etapa pendiente para su área (comparar normalizado)
        $tieneEtapaPendiente = $tramite->aprobaciones->contains(function ($a) use ($user) {
            return $a->aprobado == false
                && is_null($a->usuario_id)
                && $this->roleKey($a->etapa) === $this->roleKey($user->area_laboral);
        });

        return $puedeModificarPorJerarquia && $tieneEtapaPendiente;
    }

    /**
     * Verificar si debe mostrar los botones de acción
     */
    private function puedeVerBotones($tramite, $user)
    {
        return $tramite->estado_actual === 'En proceso' && $this->puedeModificarTramite($tramite, $user);
    }

    /**
     * Verificar si el usuario puede ver un trámite
     */
    private function puedeVerTramite($tramite, $user)
    {
        // Si es su propio trámite
        if ($tramite->user_id === $user->id) {
            return true;
        }

        // ROOT ve todo
        if ($user->area_laboral === 'ROOT') {
            return true;
        }

        $userKey = $this->roleKey($user->area_laboral);
        $creatorKey = $this->roleKey($tramite->creador->area_laboral ?? '');
        $rolesPermitidos = self::ROLES_HIERARCHY[$userKey] ?? [];
        $puedeVerPorJerarquia = in_array($creatorKey, $rolesPermitidos);

        $tieneEtapa = $tramite->aprobaciones->contains(function ($a) use ($user) {
            return $this->roleKey($a->etapa) === $this->roleKey($user->area_laboral);
        });

        return $puedeVerPorJerarquia || $tieneEtapa;
    }

    /**
     * Contar trámites pendientes de aprobación para el usuario
     */
    private function contarTramitesPendientesAprobacion($user, $empresaId = null)
    {
        $query = tramites::where('estado_actual', 'En proceso')
            ->where('user_id', '!=', $user->id) // No incluir sus propios trámites
            ->whereHas('aprobaciones', function ($q) use ($user) {
                $q->where('etapa', $user->area_laboral)
                    ->where('aprobado', false)
                    ->whereNull('usuario_id');
            });

        // Filtrar por empresa si se proporciona
        if ($empresaId) {
            $query->whereHas('creador.empresas', function ($q) use ($empresaId) {
                $q->where('empresa_id', $empresaId);
            });
        }

        return $query->count();
    }
}
