<?php

namespace App\Http\Controllers;

use App\Models\actividadespersonal;
use App\Models\Empresa;
use App\Models\Proyecto;
use App\Models\tarea_trabajador;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use PDO;

class ProyectoController extends Controller
{
    public function redirectProyecto($id, $empresa_id)
    {
        // Obtener el proyecto por su ID
        $proyecto = Proyecto::findOrFail($id);

        // Obtener las tareas relacionadas con el proyecto
        //$tareas = tarea_trabajador::where('proyecto_asignadot', $id)->get();
        $tareas = actividadespersonal::where('projectActividad', $id)->get();

        // Obtener todos los trabajadores (no solo los relacionados con el proyecto)
        $trabajadores = User::all(); // Esto obtiene todos los trabajadores

        // Asegurar que las especialidades vengan como un array de nombres.
        $especialidades = $proyecto->especialidades;
        if (is_string($especialidades)) {
            $decoded = json_decode($especialidades, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $especialidades = $decoded;
            } else {
                // Soporte a formato coma-separado en caso no sea JSON
                $especialidades = array_values(array_filter(array_map('trim', explode(',', $especialidades))));
            }
        }

        // Aceptar distintos nombres de campo para número de módulos (compatibilidad con DB)
        $cantidad_modulos = $proyecto->cantidad_modulos ?? 0;

        // Intentar decodificar documento_proyecto si es JSON, para que la vista reciba estructura utilizable
        $documento_proyecto = $proyecto->documento_proyecto;
        if (is_string($documento_proyecto)) {
            $decodedDoc = json_decode($documento_proyecto, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $documento_proyecto = $decodedDoc;
            }
        }

        return view('gestor_vista.proyectos.detallesProyectos', [
            'id' => $proyecto->id_proyectos,
            'nombre_proyecto' => $proyecto->nombre_proyecto,
            'porcentaje_total' => $proyecto->porcentaje_total,
            'especialidades_porcentaje' => $proyecto->especialidades_porcentaje,
            'documento_proyecto' => $documento_proyecto,
            'especialidades' => $especialidades,
            'cantidad_modulos' => $cantidad_modulos,
            'plazo_total_pro' => $proyecto->plazo_total_pro,
            'empresa_id' => $empresa_id, // Pasar el empresa_id
            'tareas' => $tareas, // Almacena las tareas en una variable
            'trabajadores' => $trabajadores, // Almacena todos los trabajadores
        ]);
    }

    public function index($empresaId)
    {
        $proyectos = Proyecto::where('empresa_id', $empresaId)->get();
        return view('gestor_vista.proyectos.PortadaProyectos', compact('proyectos', 'empresaId'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre_proyecto' => 'required|string|max:100',
            'descripcion_proyecto' => 'required|string',
            'documento_proyecto' => 'nullable|json',
            'tipoproyecto' => 'required|string',
            'empresa_id' => 'required|integer|exists:empresas,id',
            'cantidad_modulos' => 'required|integer|min:1',
            'especialidades' => 'nullable|string',
            'especialidades_porcentaje' => 'nullable|string',
            'monto_designado' => 'required|numeric|min:0.01',
        ]);

        try {
            $data = $request->only([
                'nombre_proyecto',
                'descripcion_proyecto',
                'documento_proyecto',
                'tipoproyecto',
                'empresa_id',
                'cantidad_modulos',
                'especialidades',
                'especialidades_porcentaje',
            ]);

            // Convertir el monto a decimal de forma segura
            $data['monto_designado'] = round(floatval($request->input('monto_designado')), 2);

            // Set default values
            $data['porcentaje_total'] = 0;
            $data['plazo_total_pro'] = 0;
            $data['monto_invertido'] = 0;

            Proyecto::create($data);

            return redirect()->route('proyectos.empresa', ['empresaId' => $data['empresa_id']])
                ->with('success', 'Proyecto creado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('proyectos.empresa', ['empresaId' => $request->empresa_id])
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
            return redirect()->route('proyectos.empresa', ['empresaId' => $proyecto->empresa_id])
                ->with('success', 'Proyecto actualizado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('proyectos.empresa', ['empresaId' => $request->empresa_id])
                ->with('error', 'Error al actualizar el Proyecto.');
        }
    }

    public function destroy(Proyecto $proyecto)
    {
        $empresaId = $proyecto->empresa_id;
        $proyecto->delete();

        return redirect()->route('proyectos.empresa', ['empresaId' => $empresaId])
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
            'porcentaje_total_pro' => 'required|numeric|min:0|max:100',
        ]);

        try {
            $proyecto = Proyecto::where('id_proyectos', $request->id_proyecto)->firstOrFail();
            $proyecto->documento_proyecto = $request->documento_proyecto;
            $proyecto->plazo_total_pro = $request->plazo_total_pro;
            $proyecto->porcentaje_total = $request->porcentaje_total_pro;
            $proyecto->save();

            return response()->json(['success' => true, 'message' => 'Documento del proyecto y plazo total actualizados correctamente.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error al actualizar el documento del proyecto.'], 500);
        }
    }

    public function reports_proyectos($empresaId)
    {
        $proyectos = Proyecto::where('empresa_id', $empresaId)->get();

        $totalMontoDesignado = $proyectos->sum('monto_designado');
        $totalMontoInvertido = $proyectos->sum('monto_invertido');
        $totalPorcentaje     = $proyectos->sum('porcentaje_total');

        return view('gestor_vista.Administrador.Reporte_proyectosAdmin', [
            'empresaId'              => $empresaId,
            'nombre_empresa'         => $proyectos->first()->nombre_empresa ?? '',
            'total_monto_designado'  => $totalMontoDesignado,
            'total_monto_invertido'  => $totalMontoInvertido,
            'total_porcentaje'       => $totalPorcentaje,
            'proyectos'              => $proyectos,
        ]);
    }

    public function reporteDetalles(Request $request)
    {
        $idProyecto = $request->input('id_proyecto');
        $empresaId  = $request->input('empresa_id');

        // Traer la empresa (solo id y razonSocial)
        $empresa = Empresa::select('id', 'razonSocial')->where('id', $empresaId)->firstOrFail();

        // Traer proyecto con actividades (filtradas) y usuarios
        $proyecto = Proyecto::with([
            'actividades' => function ($q) use ($idProyecto) {
                $q->where('projectActividad', $idProyecto)->with('usuario'); // incluir usuario de cada actividad
            },
            'requerimientos'
        ])->where('id_proyectos', $idProyecto)->where('empresa_id', $empresaId)->firstOrFail();

        // Usuarios únicos de las actividades de este proyecto
        $usuarios = $proyecto->actividades->filter(fn($act) => $act->usuario !== null) // solo si tiene usuario asignado
            ->pluck('usuario')
            ->unique('id')
            ->values();

        // Paquetes de datos
        $paquetes = [
            'proyecto'       => $proyecto,
            'empresa'        => $empresa,
            'actividades'    => $proyecto->actividades,
            'usuarios'       => $usuarios,
            'requerimientos' => $proyecto->requerimientos,
        ];

        return view('gestor_vista.proyectos.reporteProyectos', compact('paquetes'));
    }

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
        $proyectos = $request->input('proyectos');

        if (!$proyectos || !is_array($proyectos)) {
            return response()->json(['error' => 'Datos inválidos'], 400);
        }

        foreach ($proyectos as $proyecto_item) {
            $id_proyecto = $proyecto_item['id_proyecto'] ?? null;
            $monto_designado = $proyecto_item['monto_designado'] ?? null;
            $porcentaje_designado = $proyecto_item['especialidades_porcentaje'] ?? null;

            if (!$id_proyecto || !isset($monto_designado) || !isset($porcentaje_designado)) {
                continue;
            }

            $actualizados = Proyecto::where('id_proyectos', $id_proyecto)->update([
                'monto_designado' => $monto_designado,
                'especialidades_porcentaje' => $porcentaje_designado
            ]);

            if ($actualizados) {
            } else {
            }
        }

        return response()->json(['message' => 'Actualización de presupuesto completada']);
    }

    public function actualizarMontoInvertidoProyecto(Request $request)
    {
        $proyectos = $request->input('proyectos'); // Cambiado a 'proyectos' para ser consistente con el frontend

        if (!$proyectos || !is_array($proyectos)) {
            return response()->json(['error' => 'Datos inválidos'], 400);
        }

        foreach ($proyectos as $proyecto_item) {
            $id_proyecto = $proyecto_item['id_proyecto'] ?? null;
            $monto_invertido = $proyecto_item['monto_invertido'] ?? null; // Cambiado para coincidir con el frontend

            if (!$id_proyecto || !isset($monto_invertido)) {
                continue;
            }

            $actualizados = Proyecto::where('id_proyectos', $id_proyecto)->update([
                'monto_invertido_prev' => $monto_invertido, // Ajustado al nombre de la columna en la BD
            ]);

            if ($actualizados) {
            } else {
            }
        }

        return response()->json(['message' => 'Actualización de montos invertidos completada']); // Cambiado a 'message' para consistencia
    }
}
