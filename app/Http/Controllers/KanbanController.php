<?php

namespace App\Http\Controllers;

use App\Models\kanbantrabajador;
use App\Models\Proyecto;
use App\Models\User;
use Illuminate\Http\Request;

class KanbanController extends Controller
{
    public function index()
    {
        //
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre_calmen' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'semana_designado' => 'required|date',
            'color' => 'required|string',
            'monto' => 'required|numeric',
            'usuario_id' => 'required|integer|exists:users,id',
            'proyecto_id' => 'required|integer|exists:proyectos,id_proyectos',
        ]);

        try {
            KanbanTrabajador::create($request->all());
            return response()->json(['status' => 'success', 'message' => 'La tarjeta se creó correctamente.']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Hubo un problema al crear la tarjeta.']);
        }
    }

    /*public function show($empresaId)
    {
        try {
            // Obtener usuarios que pertenecen a la empresa con solo los campos id y name
            $usuarios = User::whereHas('empresas', function ($query) use ($empresaId) {
                $query->where('empresa_id', $empresaId);
            })->select('id', 'name')->get();

            // Obtener IDs de los usuarios
            $usuarioIds = $usuarios->pluck('id');

            // Obtener eventos que pertenecen a estos usuarios
            $eventkbs = kanbantrabajador::whereIn('usuario_id', $usuarioIds)->get();

            // Obtener proyectos que pertenecen a la empresa con solo los campos id_proyectos y nombre_proyecto
            $proyectos = Proyecto::where('empresa_id', $empresaId)->select('id_proyectos', 'nombre_proyecto')->get();

            // Retornar la vista con los datos
            return view('gestor_vista.Administrador.Gestor_kanbanGeneral', compact('eventkbs', 'usuarios', 'proyectos', 'empresaId'));
        } catch (\Exception $e) {
            return view('gestor_vista.Administrador.Gestor_kanbanGeneral', ['eventkbs' => collect([]), 'usuarios' => collect([]), 'proyectos' => collect([]), 'empresaId' => $empresaId])->with('error', 'Error al cargar los datos.');
        }
    }*/
    
    public function show($empresaId)
    {
        try {
            // Obtener usuarios que pertenecen a la empresa, excluyendo nombres específicos
            $usuarios = User::whereHas('empresas', function ($query) use ($empresaId) {
                    $query->where('empresa_id', $empresaId);
                })
                ->whereNotIn('name', ['LUIS ANGEL', 'Administrador'])
                ->select('id', 'name')
                ->get();
    
            // Obtener IDs de los usuarios
            $usuarioIds = $usuarios->pluck('id');
    
            // Obtener eventos que pertenecen a estos usuarios
            $eventkbs = kanbantrabajador::whereIn('usuario_id', $usuarioIds)->get();
    
            // Obtener proyectos que pertenecen a la empresa
            $proyectos = Proyecto::where('empresa_id', $empresaId)
                ->select('id_proyectos', 'nombre_proyecto')
                ->get();
    
            // Retornar la vista con los datos
            return view('gestor_vista.Administrador.Gestor_kanbanGeneral', compact('eventkbs', 'usuarios', 'proyectos', 'empresaId'));
        } catch (\Exception $e) {
            return view('gestor_vista.Administrador.Gestor_kanbanGeneral', [
                'eventkbs' => collect([]),
                'usuarios' => collect([]),
                'proyectos' => collect([]),
                'empresaId' => $empresaId
            ])->with('error', 'Error al cargar los datos.');
        }
    }

    public function edit(string $id)
    {
        //
    }
    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre_calmen' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'semana_designado' => 'required|date',
            'color' => 'required|string',
            'monto' => 'required|numeric',
            'usuario_id' => 'required|integer|exists:users,id',
            'proyecto_id' => 'required|integer|exists:proyectos,id_proyectos',
        ]);

        try {
            $kanbanTrabajador = KanbanTrabajador::findOrFail($id);
            $kanbanTrabajador->update($request->all());
            return response()->json(['status' => 'success', 'message' => 'La ficha ha sido editada exitosamente.']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Hubo un problema al editar la ficha.']);
        }
    }

    public function move(Request $request, $id)
    {
        $request->validate([
            'semana_designado' => 'sometimes|required|date',
            'usuario_id' => 'sometimes|required|integer|exists:users,id',
        ]);

        try {
            $kanban = KanbanTrabajador::findOrFail($id);
            $kanban->update($request->only(['semana_designado', 'usuario_id']));
            return response()->json(['status' => 'success', 'message' => 'La tarjeta se actualizó correctamente.']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Hubo un problema al actualizar la tarjeta.']);
        }
    }


    public function destroy(string $id)
    {

        try {
            $kanban = KanbanTrabajador::findOrFail($id);
            $kanban->delete();
            return response()->json(['status' => 'success', 'message' => 'La ficha ha sido eliminada correctamente.']);
        } catch (\Exception $e) {
            return response()->json(['status' => 'error', 'message' => 'Hubo un problema al eliminar la ficha.']);
        }
    }
}
