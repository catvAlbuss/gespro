<?php

namespace App\Http\Controllers;

use App\Models\tarea_trabajador;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TareasController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'nombre_tarea' => 'required|string|max:255',
                'fecha_subido_t' => 'required|date_format:Y-m-d H:i:s', // Cambiado a date_format
                'fecha_iniciopro' => 'required|date_format:Y-m-d H:i:s',
                'fecha_finpro' => 'required|date_format:Y-m-d H:i:s',
                'porcentaje_tarea' => 'required|integer|between:0,100',
                'diasubido' => 'required|string|max:255',
                'nombre_documento' => 'required|string|max:500',
                'trabajar_asignadot' => 'required|exists:users,id',
                'proyecto_asignadot' => 'required|exists:proyectos,id_proyectos',
            ]);

            // Convertir las fechas a formato correcto
            $fechaSubido = Carbon::createFromFormat('Y-m-d H:i:s', $validatedData['fecha_subido_t']);
            $fechaIniciopro = Carbon::createFromFormat('Y-m-d H:i:s', $validatedData['fecha_iniciopro']);
            $fechaFinpro = Carbon::createFromFormat('Y-m-d H:i:s', $validatedData['fecha_finpro']);

            // Crear una nueva tarea
            $tarea = tarea_trabajador::create([
                'nombre_tarea' => $validatedData['nombre_tarea'],
                'fecha_subido_t' => $fechaSubido,
                'fecha_iniciopro' => $fechaIniciopro,
                'fecha_finpro' => $fechaFinpro,
                'porcentaje_tarea' => $validatedData['porcentaje_tarea'],
                'procentaje_trabajador' => 0, // Valor por defecto
                'diasubido' => $validatedData['diasubido'],
                'nombre_documento' => $validatedData['nombre_documento'] ?? null,
                'trabajar_asignadot' => $validatedData['trabajar_asignadot'],
                'proyecto_asignadot' => $validatedData['proyecto_asignadot'],
            ]);

            return response()->json(['success' => 'Tarea registrada con éxito', 'tarea' => $tarea], 201);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->validator->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
