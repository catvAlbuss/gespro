<?php

namespace App\Http\Controllers;

use App\Models\CalendarioTrabajador;
use App\Models\Proyecto;
use App\Models\User;
use Illuminate\Http\Request;

class CalendarioJefesController extends Controller
{
    public function index()
    {
        $events = CalendarioTrabajador::all();
        $trabajadores = User::select('id', 'name')->get();

        return view('gestor_vista.Administrador.Gestor_calendarioGeneral', compact('events', 'trabajadores'));
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
            $events = CalendarioTrabajador::whereIn('usuario_id', $usuarioIds)->get();
    
            // Obtener proyectos que pertenecen a la empresa con solo los campos id_proyectos y nombre_proyecto
            $proyectos = Proyecto::where('empresa_id', $empresaId)->select('id_proyectos', 'nombre_proyecto')->get();
    
            // Retornar los datos en formato JSON
            return response()->json([
                'events' => $events,
                'usuarios' => $usuarios,
                'proyectos' => $proyectos,
                'empresaId' => $empresaId,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'events' => [],
                'usuarios' => [],
                'proyectos' => [],
                'empresaId' => $empresaId,
                'error' => 'Error al cargar los datos.'
            ], 500); // Código de error 500 para indicar un error interno del servidor
        }
    }*/
    /*public function show($empresaId)
    {
        try {
            // Obtener los permisos del primer rol del usuario autenticado
            $permisos = auth()->user()->roles->first()->permissions;

            // Filtrar usuarios que tienen los permisos 'Jefe' o 'Trabajador'
            $usuariosPermitidos = User::whereHas('roles.permissions', function ($query) use ($permisos) {
                // Buscar si tiene el permiso 'Jefe' o 'Trabajador'
                $query->whereIn('name', ['Jefe', 'Trabajador']);
            })
                ->whereHas('empresas', function ($query) use ($empresaId) {
                    // Obtener usuarios de la empresa específica
                    $query->where('empresa_id', $empresaId);
                })
                ->select('id', 'name')
                ->get();

            // Obtener los IDs de los usuarios permitidos
            $usuarioIds = $usuariosPermitidos->pluck('id');

            // Obtener las tareas de calendario de los usuarios permitidos
            $events = CalendarioTrabajador::whereIn('usuario_id', $usuarioIds)->get();

            // Obtener proyectos de la empresa
            $proyectos = Proyecto::where('empresa_id', $empresaId)
                ->select('id_proyectos', 'nombre_proyecto')
                ->get();

            // Retornar los datos en formato JSON
            return response()->json([
                'events' => $events,
                'usuarios' => $usuariosPermitidos,
                'proyectos' => $proyectos,
                'empresaId' => $empresaId,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'events' => [],
                'usuarios' => [],
                'proyectos' => [],
                'empresaId' => $empresaId,
                'error' => 'Error al cargar los datos.'
            ], 500); // Código de error 500 para indicar un error interno del servidor
        }
    }*/
    public function show($empresaId)
    {
        try {
            // Obtener el usuario autenticado y su primer rol
            $usuario = auth()->user();
            $rolUsuario = $usuario->roles->first();
            
            // Obtener usuarios según el rol
            $usuariosPermitidos = User::whereHas('roles.permissions', function ($query) use ($rolUsuario) {
                    // Si es Jefe o Trabajador, solo mostrar esos roles
                    if ($rolUsuario->hasPermissionTo('Jefe') || $rolUsuario->hasPermissionTo('Trabajador')) {
                        $query->whereIn('name', ['Jefe', 'Trabajador']);
                    }
                    // Si es Logístico o Administrativo, mostrar todos excepto Gerencia y Administrador
                    elseif ($rolUsuario->hasPermissionTo('Logistico') || $rolUsuario->hasPermissionTo('Administrativo')) {
                        $query->whereIn('name', ['Jefe', 'Trabajador', 'Logistico', 'Administrativo']);
                    }
                    else {
                        // Para otros roles, no mostrar ningún usuario
                        $query->where('name', 'no_role_match');
                    }
                })
                ->whereHas('empresas', function ($query) use ($empresaId) {
                    // Filtrar por empresa específica
                    $query->where('empresa_id', $empresaId);
                })
                // Excluir usuarios con rol de Gerencia y Administrador
                ->whereDoesntHave('roles', function ($query) {
                    $query->whereIn('name', ['Gerencia', 'Administrador']);
                })
                ->select('id', 'name')
                ->get();
    
            // Obtener los IDs de los usuarios permitidos
            $usuarioIds = $usuariosPermitidos->pluck('id');
    
            // Obtener las tareas de calendario de los usuarios permitidos
            $events = CalendarioTrabajador::whereIn('usuario_id', $usuarioIds)->get();
    
            // Obtener proyectos de la empresa
            $proyectos = Proyecto::where('empresa_id', $empresaId)
                ->select('id_proyectos', 'nombre_proyecto')
                ->get();
    
            // Retornar los datos en formato JSON
            return response()->json([
                'events' => $events,
                'usuarios' => $usuariosPermitidos,
                'proyectos' => $proyectos,
                'empresaId' => $empresaId,
            ]);
    
        } catch (\Exception $e) {
            \Log::error('Error en show: ' . $e->getMessage());
            return response()->json([
                'events' => [],
                'usuarios' => [],
                'proyectos' => [],
                'empresaId' => $empresaId,
                'error' => 'Error al cargar los datos.'
            ], 500);
        }
    }


    public function store(Request $request)
    {
        $request->validate([
            'text' => 'required|string|max:255',
            'details' => 'nullable|string',
            'start_date' => 'required|date_format:Y-m-d H:i:s',
            'end_date' => 'required|date_format:Y-m-d H:i:s',
            'allDay' => 'required|boolean',
            'usuario_id' => 'required|integer',
            'proyecto_id' => 'required|integer'
        ]);

        try {
            $event = CalendarioTrabajador::create($request->all());
            return response()->json(['message' => 'Evento guardado con éxito', 'event' => $event], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al guardar el evento', 'error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'text' => 'required|string|max:255',
            'details' => 'nullable|string',
            'start_date' => 'required|date_format:Y-m-d H:i:s',
            'end_date' => 'required|date_format:Y-m-d H:i:s',
            'allDay' => 'required|boolean',
            'usuario_id' => 'required|integer',
            'proyecto_id' => 'required|integer'
        ]);

        try {
            $event = CalendarioTrabajador::findOrFail($id);
            $event->update($request->all());
            return response()->json(['message' => 'Evento actualizado con éxito', 'event' => $event], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al actualizar el evento', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy(CalendarioTrabajador $calendariotrabajador)
    {
        try {
            $calendariotrabajador->delete();
            return response()->json(['message' => 'Evento eliminado con éxito', 'event' => $calendariotrabajador], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al eliminar el evento', 'error' => $e->getMessage()], 500);
        }
    }
}
