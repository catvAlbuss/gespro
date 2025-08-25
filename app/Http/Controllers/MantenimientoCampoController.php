<?php

namespace App\Http\Controllers;

use App\Models\mantenimientocampo;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class MantenimientoCampoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        //
    }

    public function show(Request $request)
    {
        $mantenimientos = MantenimientoCampo::all();

        return view('gestor_vista.Campo.Panel_mantenimeinto', compact('mantenimientos'));
    }


    public function ObtenerMant(Request $request)
    {
        $mantenimientos = MantenimientoCampo::all();

        return view('gestor_vista.Campo.Panel_mantenimeinto', compact('mantenimientos'));
    }

    public function gestorMantenimiento($id_mantimiento)
    {
        // Busca el mantenimiento por su ID
        $mantenimiento = MantenimientoCampo::findOrFail($id_mantimiento);

        return view('gestor_vista.Campo.Gestor_mantenimiento', compact('mantenimiento', 'id_mantimiento'));
    }

    public function rederigircampo(string $empresaId)
    {
         // Obtener solo los registros con las columnas específicas que necesitas
         $mantenimientos = mantenimientocampo::select('id_mantimiento', 'nombre_proyecto_mant', 'propietario_mant', 'ubicacion_mant', 'fecha_pro_mant','cotizacion_mant')->get();

        return view('gestor_vista.Campo.Panel_mantenimeinto', [
            'empresaId' => $empresaId,
            'mantenimientos' => $mantenimientos
        ]);
    }

    public function guardar_mantenimiento(Request $request)
    {
        try {
            // Validar los datos
            $validated = $request->validate([
                'id_mantimiento' => 'required|integer|exists:mantenimientocampos,id_mantimiento',
                'data_mantenimiento' => 'required|string'
            ]);

            // Buscar el mantenimiento por ID
            $mantenimiento = mantenimientocampo::find($request->id_mantimiento);

            if (!$mantenimiento) {
                return response()->json([
                    'message' => 'error',
                    'error' => 'Mantenimiento no encontrado'
                ], 404);
            }

            // Actualizar la columna data_mantenimiento
            $mantenimiento->data_mantenimiento = $request->data_mantenimiento;
            $mantenimiento->save();

            return response()->json(['message' => 'success']);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'error',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        // Validación
        $request->validate([
            'nombre_proyecto_mant' => 'required|string|max:255',
            'propietario_mant' => 'required|string|max:255',
            'ubicacion_mant' => 'required|string|max:255',
            'fecha_pro_mant' => 'required|date',
            'cotizacion_mant' => 'required|numeric',
            'materiales_mant' => 'required|numeric',
            'mano_obra_mant' => 'required|numeric',
            'gastos_generales' => 'required|numeric',
        ]);
    
        // Crear un nuevo mantenimiento
        $mantenimiento = new MantenimientoCampo($request->all());
        // Guardar el nuevo mantenimiento
        $mantenimiento->save();
    
        return redirect()->route('mantenimientoCampo.traerdataman')->with('success', 'Mantenimiento creado exitosamente.');
    }

    public function edit($id)
    {
        $mantenimiento = MantenimientoCampo::findOrFail($id);
        return response()->json($mantenimiento);
    }


    public function update(Request $request, string $id)
    {
        // Validación
        $request->validate([
            'nombre_proyecto_mant' => 'required|string|max:255',
            'propietario_mant' => 'required|string|max:255',
            'ubicacion_mant' => 'required|string|max:255',
            'fecha_pro_mant' => 'required|date',
            'cotizacion_mant' => 'required|numeric',
            'materiales_mant' => 'required|numeric',
            'mano_obra_mant' => 'required|numeric',
            'gastos_generales' => 'required|numeric',
        ]);

        // Actualizar el mantenimiento
        $mantenimiento = MantenimientoCampo::findOrFail($id);
        $mantenimiento->update($request->all());

        // Redirigir a la ruta que maneja la obtención de datos
        return redirect()->route('mantenimientoCampo.traerdataman')
            ->with('success', 'Mantenimiento actualizado exitosamente.');
    }


    public function destroy(string $id)
    {
        // Encuentra el mantenimiento por ID
        $mantenimiento = MantenimientoCampo::findOrFail($id);

        // Elimina el mantenimiento
        $mantenimiento->delete();

        // Redirigir con un mensaje de éxito
        return redirect()->route('mantenimientoCampo.traerdataman') // Ajusta esta ruta según sea necesario
            ->with('success', 'Mantenimiento eliminado exitosamente.');
    }
}