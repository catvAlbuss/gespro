<?php

namespace App\Http\Controllers;

use App\Models\CalendarioTrabajador;
use App\Models\Proyecto;
use App\Models\User;
use Illuminate\Http\Request;

class CalendariotrabajadorController extends Controller
{
    public function index()
    {
        $events = CalendarioTrabajador::all();
        $trabajadores = User::select('id', 'name')->get();

        return view('gestor_vista.Administrador.Gestor_calendarioGeneral', compact('events', 'trabajadores'));
    }

    public function show($empresaId)
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

            // Retornar la vista con los datos
            return view('gestor_vista.Administrador.Gestor_calendarioGeneral', compact('events', 'usuarios', 'proyectos', 'empresaId'));
        } catch (\Exception $e) {
            return view('gestor_vista.Administrador.Gestor_calendarioGeneral', ['events' => collect([]), 'usuarios' => collect([]), 'proyectos' => collect([]), 'empresaId' => $empresaId])->with('error', 'Error al cargar los datos.');
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
