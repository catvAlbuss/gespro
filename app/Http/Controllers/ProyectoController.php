<?php

namespace App\Http\Controllers;

use App\Models\actividadespersonal;
use App\Models\Proyecto;
use App\Models\tarea_trabajador;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use PDO;

class ProyectoController extends Controller
{
    // public function redirectProyecto($id)
    // {
    //     $proyecto = Proyecto::findOrFail($id);
    //     return view('gestor_vista.Administrador.Gestor_Proyectos_ges', [
    //         'id' => $proyecto->id_proyectos,
    //         'nombre_proyecto' => $proyecto->nombre_proyecto,
    //         'porcentaje_total' => $proyecto->porcentaje_total,
    //         'documento_proyecto' => $proyecto->documento_proyecto,
    //         'empresa_id' => $proyecto->empresa_id,
    //     ]);
    // }

    public function redirectProyecto($id, $empresa_id)
    {
        // Obtener el proyecto por su ID
        $proyecto = Proyecto::findOrFail($id);

        // Obtener las tareas relacionadas con el proyecto
        $tareas = tarea_trabajador::where('proyecto_asignadot', $id)->get();

        // Obtener todos los trabajadores (no solo los relacionados con el proyecto)
        $trabajadores = User::all(); // Esto obtiene todos los trabajadores
//resources/views/gestor_vista/proyectos/detallesProyectos.blade.php
        // Pasar los datos a la vista
        // return view('gestor_vista.Administrador.Gestor_Proyectos_ges', [
        //     'id' => $proyecto->id_proyectos,
        //     'nombre_proyecto' => $proyecto->nombre_proyecto,
        //     'porcentaje_total' => $proyecto->porcentaje_total,
        //     'documento_proyecto' => $proyecto->documento_proyecto,
        //     'plazo_total_pro' => $proyecto->plazo_total_pro,
        //     'empresa_id' => $empresa_id, // Pasar el empresa_id
        //     'tareas' => $tareas, // Almacena las tareas en una variable
        //     'trabajadores' => $trabajadores, // Almacena todos los trabajadores
        // ]);
        return view('gestor_vista.proyectos.detallesProyectos', [
            'id' => $proyecto->id_proyectos,
            'nombre_proyecto' => $proyecto->nombre_proyecto,
            'porcentaje_total' => $proyecto->porcentaje_total,
            'documento_proyecto' => $proyecto->documento_proyecto,
            'plazo_total_pro' => $proyecto->plazo_total_pro,
            'empresa_id' => $empresa_id, // Pasar el empresa_id
            'tareas' => $tareas, // Almacena las tareas en una variable
            'trabajadores' => $trabajadores, // Almacena todos los trabajadores
        ]);
    }

    public function index($empresaId)
    {//resources/views/gestor_vista/proyectos/PortadaProyectos.blade.php
        $proyectos = Proyecto::where('empresa_id', $empresaId)->get();
        //return view('gestor_vista.Administrador.Gestor_Proyectos', compact('proyectos', 'empresaId'));
        return view('gestor_vista.proyectos.PortadaProyectos', compact('proyectos', 'empresaId'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre_proyecto' => 'required|string|max:100',
            'descripcion_proyecto' => 'required|string',
            'documento_proyecto' => 'required|string',
            'tipoproyecto' => 'required|string',
            'empresa_id' => 'required|integer',
        ]);

        try {
            $data = $request->only(['nombre_proyecto', 'descripcion_proyecto', 'documento_proyecto', 'tipoproyecto', 'empresa_id']);

            // Set default values for the remaining fields
            $data['porcentaje_total'] = 0;
            $data['plazo_total_pro'] = 0;
            $data['porcentaje_designado'] = 0;
            $data['monto_designado'] = 0;
            $data['monto_invertido'] = 0;

            Proyecto::create($data);
            return redirect()->route('gestor-proyectos', ['empresaId' => $data['empresa_id']])
                ->with('success', 'Proyecto creado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('gestor-proyectos', ['empresaId' => $request->empresa_id])
                ->with('error', 'Error al crear el Proyecto.');
        }
    }

    public function edit(Proyecto $proyecto)
    {
        $proyectos = Proyecto::where('empresa_id', $proyecto->empresa_id)->get();
        return view('gestor_vista.Administrador.Gestor_Proyectos', compact('proyectos', 'proyecto'));
    }

    public function update(Request $request, $id_proyectos)
    {
        $request->validate([
            'nombre_proyecto' => 'required|string|max:100',
            'descripcion_proyecto' => 'required|string',
            'tipoproyecto' => 'required|string',
            'empresa_id' => 'required|integer',
        ]);

        try {
            $proyecto = Proyecto::findOrFail($id_proyectos);
            $data = $request->only(['nombre_proyecto', 'descripcion_proyecto', 'tipoproyecto', 'empresa_id']);

            $proyecto->update($data);
            return redirect()->route('gestor-proyectos', ['empresaId' => $proyecto->empresa_id])
                ->with('success', 'Proyecto actualizado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('gestor-proyectos', ['empresaId' => $request->empresa_id])
                ->with('error', 'Error al actualizar el Proyecto.');
        }
    }
    
    public function destroy(Proyecto $proyecto)
    {
        $empresaId = $proyecto->empresa_id;
        $proyecto->delete();

        return redirect()->route('gestor-proyectos', ['empresaId' => $empresaId])
            ->with('success', 'Proyectos eliminada exitosamente.');
    }

    public function actualizarPorcentaje(Request $request)
    {
        $request->validate([
            'id_proyecto' => 'required|integer|exists:proyectos,id_proyectos', // Asegúrate de usar id_proyectos aquí
            'porcentaje_total' => 'required|integer|min:0|max:100',
        ]);

        try {
            $proyecto = Proyecto::where('id_proyectos', $request->id_proyecto)->firstOrFail();
            $proyecto->porcentaje_total = $request->porcentaje_total;
            $proyecto->save();

            return response()->json(['success' => true, 'message' => 'Porcentaje actualizado correctamente.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error al actualizar el porcentaje.'], 500);
        }
    }

    public function actualizarDocumentoProyecto(Request $request)
    {
        $request->validate([
            'id_proyecto' => 'required|integer|exists:proyectos,id_proyectos',
            'documento_proyecto' => 'required|string',
            'plazo_total_pro' => 'required|integer', // Valida el plazo total como entero
        ]);

        try {
            $proyecto = Proyecto::where('id_proyectos', $request->id_proyecto)->firstOrFail();
            $proyecto->documento_proyecto = $request->documento_proyecto;
            $proyecto->plazo_total_pro = $request->plazo_total_pro;
            $proyecto->save();

            return response()->json(['success' => true, 'message' => 'Documento del proyecto y plazo total actualizados correctamente.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error al actualizar el documento del proyecto.'], 500);
        }
    }

    public function reports_proyectos($empresaId)
    {
        // Realizar la consulta SQL directamente
        $sql = "
            SELECT 
                MD5(SUBSTRING_INDEX(p1.nombre_proyecto, '-', 1)) AS grupo_id,
                SUBSTRING_INDEX(p1.nombre_proyecto, '-', 1) AS nombre_comun,
                GROUP_CONCAT(p1.id_proyectos) AS ids_proyectos,
                GROUP_CONCAT(p1.nombre_proyecto) AS nombres_proyectos,
                GROUP_CONCAT(p1.porcentaje_total) AS porcentajes_totales,
                SUM(p1.monto_designado) AS total_monto_designado,
                SUM(p1.monto_invertido) AS total_monto_invertido
            FROM 
                proyectos p1
            WHERE 
                p1.empresa_id = :id_empresa
            GROUP BY 
                grupo_id, nombre_comun;";

        // Preparar y ejecutar la consulta
        $query = DB::connection()->getPdo()->prepare($sql);
        $query->execute([':id_empresa' => $empresaId]);
        $resultados = $query->fetchAll(PDO::FETCH_OBJ);

        $json = [];

        // Procesar los resultados
        foreach ($resultados as $objeto) {
            $ids_proyectos = explode(',', $objeto->ids_proyectos);
            $nombres_proyectos = explode(',', $objeto->nombres_proyectos);
            $porcentajes_totales = explode(',', $objeto->porcentajes_totales);

            $desagregados = [];
            for ($i = 0; $i < count($ids_proyectos); $i++) {
                $desagregados[] = [
                    'id_proyecto' => $ids_proyectos[$i],
                    'nombre_proyecto' => $nombres_proyectos[$i],
                    'porcentaje_total' => $porcentajes_totales[$i],
                ];
            }

            // Agregar a la estructura principal
            $json[] = [
                'grupo_id' => $objeto->grupo_id,
                'nombre_comun' => $objeto->nombre_comun,
                'total_monto_designado' => $objeto->total_monto_designado,
                'total_monto_invertido' => $objeto->total_monto_invertido,
                'desagregados' => $desagregados,
                'empresaId' => $empresaId,
            ];
        }

        // Retornar la vista con los datos procesados
        return view('gestor_vista.Administrador.Reporte_proyectosAdmin', compact('json'));
    }

    public function reporteDetalles($grupo_id, $nombre_proyecto, $empresaId)
    {
        // Realiza las consultas necesarias usando los parámetros
        $datosProyecto = $this->obtenerDatosProyecto($grupo_id, $empresaId);
        $avancePorcentajeProyecto = $this->obtenerporcentajeProyecto($grupo_id, $empresaId);
        $personal = $this->listarPersonal($empresaId);
        $tareas = $this->obtener_tareasProyecto($grupo_id, $empresaId);
        $presupuesto = $this->obtenerPresupuestoTotal($grupo_id, $empresaId);
        $requerimientosProceso = $this->obtener_resumen_requerimientos_proceso($grupo_id, $empresaId);
        $requerimientosSustentado = $this->obtener_resumen_requerimientos_sustentado($grupo_id, $empresaId);
        $plazos = $this->obtener_plazo_monto($grupo_id, $empresaId);
        //return view('gestor_vista.Administrador.Reporte_proyectoDetails', compact('grupo_id', 'nombre_proyecto', 'empresaId'));
        return view('gestor_vista.Administrador.Reporte_proyectoDetails', compact(
            'grupo_id',
            'nombre_proyecto',
            'empresaId',
            'avancePorcentajeProyecto',
            'datosProyecto',
            'tareas',
            'personal',
            'presupuesto',
            'requerimientosProceso',
            'requerimientosSustentado',
            'plazos',

        ));
    }
    
    private function obtenerporcentajeProyecto($grupo_id, $empresaId)
    {
        return Proyecto::whereRaw('MD5(SUBSTRING_INDEX(nombre_proyecto, "-", 1)) = ?', [$grupo_id])
            ->where('empresa_id', $empresaId)
            ->leftJoin('actividadespersonals', 'proyectos.id_proyectos', '=', 'actividadespersonals.projectActividad')
            ->select(
                'proyectos.id_proyectos',
                'proyectos.nombre_proyecto',
                'proyectos.porcentaje_total',
                'proyectos.porcentaje_designado',
                'proyectos.monto_designado',
                'proyectos.monto_invertido_prev', // ✅ Se mantiene en el SELECT
                DB::raw('COALESCE(SUM(CASE WHEN actividadespersonals.status = "approved" THEN actividadespersonals.porcentajeTarea ELSE 0 END), 0) AS porcentaje_total_actividades')
            )
            ->groupBy(
                'proyectos.id_proyectos',
                'proyectos.nombre_proyecto',
                'proyectos.porcentaje_total',
                'proyectos.porcentaje_designado',
                'proyectos.monto_designado',
                'proyectos.monto_invertido_prev' // ✅ Agregado en el groupBy
            )
            ->get();
    }

    private function obtenerDatosProyecto($grupo_id, $empresaId)
    {
        // Obtener los proyectos utilizando Eloquent
        return Proyecto::whereRaw('MD5(SUBSTRING_INDEX(nombre_proyecto, "-", 1)) = ?', [$grupo_id])
            ->where('empresa_id', $empresaId)
            ->get(['id_proyectos', 'nombre_proyecto', 'porcentaje_total', 'porcentaje_designado', 'monto_designado']);
    }

    private function listarPersonal($empresaId)
    {
        // Obtener el personal asociado a la empresa
        return User::whereHas('empresas', function ($query) use ($empresaId) {
            $query->where('empresa_id', $empresaId);
        })->get(['id', 'name', 'sueldo_base']);
    }

    private function obtener_tareasProyecto($grupo_id, $empresaId)
    {
        // Primero, obtenemos los proyectos agrupados
        $proyectosAgrupados = DB::table('proyectos')
            ->selectRaw('MD5(SUBSTRING_INDEX(nombre_proyecto, "-", 1)) AS grupo_id,
                 SUBSTRING_INDEX(nombre_proyecto, "-", 1) AS nombre_comun,
                 GROUP_CONCAT(id_proyectos) AS ids_proyectos,
                 GROUP_CONCAT(nombre_proyecto) AS nombres_proyectos,
                 GROUP_CONCAT(porcentaje_total) AS porcentajes_totales')
            ->where('empresa_id', $empresaId)
            ->groupBy('grupo_id', 'nombre_comun')
            ->get();

        // Filtramos los proyectos que coinciden con el grupo_id
        $proyectosFiltrados = $proyectosAgrupados->filter(function ($proyecto) use ($grupo_id) {
            return $proyecto->grupo_id === $grupo_id;
        });

        // Inicializamos un arreglo para almacenar las actividades
        $actividades = [];

        foreach ($proyectosFiltrados as $proyecto) {
            // Verificamos que existan proyectos antes de continuar
            if (empty($proyecto->ids_proyectos)) {
                continue;
            }

            // Buscamos las actividades relacionadas que tengan status "approved"
            $actividadesDelProyecto = actividadespersonal::whereIn('projectActividad', explode(',', $proyecto->ids_proyectos))
                ->where('status', 'approved') // Filtrar actividades aprobadas
                ->get();

            // Agregamos las actividades al arreglo
            foreach ($actividadesDelProyecto as $actividad) {
                $actividades[] = [
                    'grupo_id' => $proyecto->grupo_id,
                    'nombre_comun' => $proyecto->nombre_comun,
                    'ids_proyectos' => $proyecto->ids_proyectos,
                    'nameActividad' => $actividad->nameActividad,
                    'fecha' => $actividad->fecha,
                    'diasAsignados' => $actividad->diasAsignados,
                    'status' => $actividad->status,
                    'usuario_designado' => $actividad->usuario_designado,
                    'projectActividad' => $actividad->projectActividad,
                ];
            }
        }

        // Ordenamos las actividades por grupo_id y fecha
        usort($actividades, function ($a, $b) {
            return strtotime($a['fecha']) <=> strtotime($b['fecha']);
        });

        return $actividades;
    }

    private function obtenerPresupuestoTotal($grupo_id, $empresaId)
    {
        // Obtenemos los ids de proyectos para el grupo
        $idsProyectos = DB::table('proyectos')
            ->where('empresa_id', $empresaId)
            ->pluck('id_proyectos'); // Solo obtenemos los IDs

        // Convertimos el resultado en un array
        $idsProyectos = $idsProyectos->toArray();

        // Verificamos que haya proyectos para filtrar
        if (empty($idsProyectos)) {
            return []; // Retornar un array vacío si no hay proyectos
        }

        $resultados = DB::table('proyectos as p')
            ->select(
                DB::raw('MD5(SUBSTRING_INDEX(p.nombre_proyecto, "-", 1)) AS grupo_id'),
                DB::raw('SUBSTRING_INDEX(p.nombre_proyecto, "-", 1) AS nombre_comun'),
                DB::raw('GROUP_CONCAT(p.id_proyectos) AS ids_proyectos'),
                'ap.nameActividad',
                'ap.fecha',
                'ap.diasAsignados',
                'ap.status',
                'ap.usuario_designado',
                'ap.projectActividad',
                't.name AS nombre_trab',
                't.sueldo_base AS sueldo_Personal'
            )
            ->join('actividadespersonals as ap', 'ap.projectActividad', '=', 'p.id_proyectos')
            ->join('users as t', 'ap.usuario_designado', '=', 't.id')
            ->where('p.empresa_id', $empresaId)
            ->where(DB::raw('MD5(SUBSTRING_INDEX(p.nombre_proyecto, "-", 1))'), $grupo_id)
            ->whereIn('p.id_proyectos', $idsProyectos) // Filtrar por los ids de proyectos
            ->groupBy(
                'grupo_id',
                'nombre_comun',
                'ap.nameActividad',
                'ap.fecha',
                'ap.diasAsignados',
                'ap.status',
                'ap.usuario_designado',
                'ap.projectActividad',
                't.name',
                't.sueldo_base'
            ) // Agrupación correcta
            ->orderBy('grupo_id')
            ->orderBy('ap.fecha')
            ->get();

        // Formatear los resultados en un array
        $json = [];
        foreach ($resultados as $objeto) {
            $json[] = [
                'grupo_id' => $objeto->grupo_id,
                'nombre_comun' => $objeto->nombre_comun,
                'ids_proyectos' => $objeto->ids_proyectos,
                'nameActividad' => $objeto->nameActividad,
                'fecha' => $objeto->fecha,
                'diasAsignados' => $objeto->diasAsignados,
                'status' => $objeto->status,
                'usuario_designado' => $objeto->usuario_designado,
                'nombre_trab' => $objeto->nombre_trab,
                'sueldo_Personal' => $objeto->sueldo_Personal,
                'projectActividad' => $objeto->projectActividad,
            ];
        }

        return $json; // Retornar el array
    }

    private function obtener_resumen_requerimientos_proceso($grupo_id, $empresaId)
    {
        $sql = "
            WITH ProyectosAgrupados AS (
                SELECT 
                    MD5(SUBSTRING_INDEX(p.nombre_proyecto, '-', 1)) AS grupo_id,
                    SUBSTRING_INDEX(p.nombre_proyecto, '-', 1) AS nombre_comun,
                    GROUP_CONCAT(p.id_proyectos) AS ids_proyectos,
                    GROUP_CONCAT(p.nombre_proyecto) AS nombres_proyectos,
                    GROUP_CONCAT(p.porcentaje_total) AS porcentajes_totales
                FROM 
                    proyectos p
                WHERE
                    p.empresa_id = :empresaId
                GROUP BY 
                    grupo_id, nombre_comun
            )
            SELECT 
                pa.grupo_id,
                pa.nombre_comun,
                SUM(r.total_requerimientos) AS totalmontoreque  -- Suma del total de los requerimientos
            FROM 
                ProyectosAgrupados pa
            JOIN 
                requerimientos r ON FIND_IN_SET(r.proyecto_designado, pa.ids_proyectos)
            WHERE 
                pa.grupo_id = :grupo_id 
                AND r.aprobado_logistica = 1
                AND r.aprobado_contabilidad = 1 
                AND r.aprobado_requerimiento = 0 
            GROUP BY 
                pa.grupo_id, pa.nombre_comun  -- Agrupamos solo por el grupo de proyectos
            ORDER BY 
                pa.grupo_id;
        ";

        return DB::select($sql, [
            'grupo_id' => $grupo_id,
            'empresaId' => $empresaId,
        ]);
    }

    private function obtener_resumen_requerimientos_sustentado($grupo_id, $empresaId)
    {
        $sql = "
            WITH ProyectosAgrupados AS (
                SELECT 
                    MD5(SUBSTRING_INDEX(p.nombre_proyecto, '-', 1)) AS grupo_id,
                    SUBSTRING_INDEX(p.nombre_proyecto, '-', 1) AS nombre_comun,
                    GROUP_CONCAT(p.id_proyectos) AS ids_proyectos,
                    GROUP_CONCAT(p.nombre_proyecto) AS nombres_proyectos,
                    GROUP_CONCAT(p.porcentaje_total) AS porcentajes_totales
                FROM 
                    proyectos p
                WHERE
                    p.empresa_id = :empresaId
                GROUP BY 
                    grupo_id, nombre_comun
            )
            SELECT 
                pa.grupo_id,
                pa.nombre_comun,
                SUM(r.total_requerimientos) AS totalmontoreque  -- Suma del total de los requerimientos
            FROM 
                ProyectosAgrupados pa
            JOIN 
                requerimientos r ON FIND_IN_SET(r.proyecto_designado, pa.ids_proyectos)
            WHERE 
                pa.grupo_id = :grupo_id 
                AND r.aprobado_logistica = 1
                AND r.aprobado_contabilidad = 1 
                AND r.aprobado_requerimiento = 1 
            GROUP BY 
                pa.grupo_id, pa.nombre_comun  -- Agrupamos solo por el grupo de proyectos
            ORDER BY 
                pa.grupo_id;
        ";

        return DB::select($sql, [
            'grupo_id' => $grupo_id,
            'empresaId' => $empresaId,
        ]);
    }

    private function obtener_plazo_monto($grupo_id, $empresaId)
    {
        $sql = "
            SELECT 
                p.id_proyectos,
                p.nombre_proyecto,
                p.plazo_total_pro,
                p.monto_designado,
                p.monto_invertido_prev
            FROM 
                proyectos p
            WHERE 
                MD5(SUBSTRING_INDEX(p.nombre_proyecto, '-', 1)) = :grupo_id
                AND p.empresa_id = :empresaId
        ";

        return DB::select($sql, [
            'grupo_id' => $grupo_id,
            'empresaId' => $empresaId,
        ]);
    }

    /*public function actualizar_presupuesto_proyecto(Request $request)
    {
        $proyectos = $request->input('proyectos'); // Obtenemos los datos enviados

        foreach ($proyectos as $proyecto_item) {
            $id_proyecto = $proyecto_item['id_proyecto'];
            $monto_designado = $proyecto_item['monto_designado'];
            $porcentaje_designado = $proyecto_item['porcentaje_designado'];

            // Usamos el modelo para actualizar
            Proyecto::where('id_proyectos', $id_proyecto)->update([
                'monto_designado' => $monto_designado,
                'porcentaje_designado' => $porcentaje_designado
            ]);
        }

        return response()->json(['message' => 'Actualización completada']);
    }*/

    public function actualizar_inversion(Request $request)
    {
        $proyectos = $request->input('proyectos');

        foreach ($proyectos as $proyecto) {
            $this->actualizar_inversion_proyecto($proyecto['id_proyecto'], $proyecto['monto_actualizado']);
        }

        return response()->json(['message' => 'Actualización realizada correctamente']);
    }

    private function actualizar_inversion_proyecto($id_proyecto, $monto_invertido)
    {
        $proyecto = Proyecto::find($id_proyecto);

        if ($proyecto) {
            $proyecto->monto_invertido = $monto_invertido;
            $proyecto->save();
            return true;
        }

        return response()->json(['message' => 'Error: Proyecto no encontrado'], 404);
    }
    
     public function actualizar_presupuesto_proyecto(Request $request)
    {
        \Log::info("Actualizando presupuesto con datos: " . json_encode($request->all()));
        
        $proyectos = $request->input('proyectos');
        
        if (!$proyectos || !is_array($proyectos)) {
            \Log::error("Error: No se recibieron datos válidos para proyectos.");
            return response()->json(['error' => 'Datos inválidos'], 400);
        }
        
        \Log::info("Actualizando Presupuestos: " . json_encode($proyectos));
        
        foreach ($proyectos as $proyecto_item) {
            $id_proyecto = $proyecto_item['id_proyecto'] ?? null;
            $monto_designado = $proyecto_item['monto_designado'] ?? null;
            $porcentaje_designado = $proyecto_item['porcentaje_designado'] ?? null;
            
            if (!$id_proyecto || !isset($monto_designado) || !isset($porcentaje_designado)) {
                \Log::warning("Datos incompletos para actualización de presupuesto: " . json_encode($proyecto_item));
                continue;
            }
            
            $actualizados = Proyecto::where('id_proyectos', $id_proyecto)->update([
                'monto_designado' => $monto_designado,
                'porcentaje_designado' => $porcentaje_designado
            ]);
            
            if ($actualizados) {
                \Log::info("Presupuesto ID $id_proyecto actualizado correctamente.");
            } else {
                \Log::warning("No se pudo actualizar el presupuesto ID $id_proyecto.");
            }
        }
        
        return response()->json(['message' => 'Actualización de presupuesto completada']);
    }
    
    public function actualizarMontoInvertidoProyecto(Request $request)
    {
        //\Log::info("Actualizando montos invertidos con datos: " . json_encode($request->all()));
        
        $proyectos = $request->input('proyectos'); // Cambiado a 'proyectos' para ser consistente con el frontend
        
        if (!$proyectos || !is_array($proyectos)) {
            //\Log::error("Error: No se recibieron datos válidos para proyectos.");
            return response()->json(['error' => 'Datos inválidos'], 400);
        }
        
        //\Log::info("Actualizando Montos Invertidos: " . json_encode($proyectos));
        
        foreach ($proyectos as $proyecto_item) {
            $id_proyecto = $proyecto_item['id_proyecto'] ?? null;
            $monto_invertido = $proyecto_item['monto_invertido'] ?? null; // Cambiado para coincidir con el frontend
            
            if (!$id_proyecto || !isset($monto_invertido)) {
                //\Log::warning("Datos incompletos para actualización de monto invertido: " . json_encode($proyecto_item));
                continue;
            }
            
            $actualizados = Proyecto::where('id_proyectos', $id_proyecto)->update([
                'monto_invertido_prev' => $monto_invertido, // Ajustado al nombre de la columna en la BD
            ]);
            
            if ($actualizados) {
                //\Log::info("Monto invertido ID $id_proyecto actualizado correctamente.");
            } else {
                //\Log::warning("No se pudo actualizar el monto invertido ID $id_proyecto.");
            }
        }
        
        return response()->json(['message' => 'Actualización de montos invertidos completada']); // Cambiado a 'message' para consistencia
    }
}
