<?php

namespace App\Http\Controllers;

use App\Models\mantenimientocampo;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MantenimientoCampoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $mantenimientos = MantenimientoCampo::orderBy('created_at', 'desc')->get();
            return view('gestor_vista.Campo.Panel_mantenimeinto', compact('mantenimientos'));
        } catch (Exception $e) {
            return redirect()->back()->with('error', 'Error al cargar los metrados');
        }
    }

    public function show(string $id)
    {
        try {
            $mantenimientos = MantenimientoCampo::findOrFail($id);

            // Si es una petición AJAX, devolver JSON
            if (request()->expectsJson()) {
                // Preparar datos para el modal de edición
                $data = [
                    'id_mantimiento' => $mantenimientos->id_mantimiento,
                    'nombre_proyecto_mant' => $mantenimientos->nombre_proyecto_mant,
                    'propietario_mant' => $mantenimientos->propietario_mant,
                    'ubicacion_mant' => $mantenimientos->ubicacion_mant,
                    'fecha_pro_mant' => $mantenimientos->fecha_pro_mant,
                    'cotizacion_mant' => $mantenimientos->cotizacion_mant,
                    'materiales_mant' => $mantenimientos->materiales_mant,
                    'mano_obra_mant' => $mantenimientos->mano_obra_mant,
                    'gastos_generales' => $mantenimientos->gastos_generales,
                    'data_mantenimiento' => $mantenimientos->data_mantenimiento,
                ];

                return response()->json($data);
            }

            // Para vista normal
            return view('gestor_vista.Campo.Gestor_mantenimiento', compact('mantenimientos'));
        } catch (Exception $e) {
            if (request()->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'mantenimeinto no encontrado'
                ], 404);
            }

            return redirect()->back()->with('error', 'mantenimiento no encontrado');
        }
    }

    public function store(Request $request)
    {
        try {
            // Validación de los datos
            $validatedData = $request->validate([
                'nombre_proyecto_mant' => 'required|string|max:255',
                'propietario_mant' => 'required|string|max:255',
                'ubicacion_mant' => 'required|string|max:255',
                'fecha_pro_mant' => 'required|date',
                'cotizacion_mant' => 'required|numeric',
                'materiales_mant' => 'required|numeric',
                'mano_obra_mant' => 'required|numeric',
                'gastos_generales' => 'required|numeric',
            ], [
                'nombre_proyecto_mant.required' => 'El nombre del proyecto es obligatorio',
                'propietario_mant.required' => 'La UEI es obligatoria',
                'fecha_pro_mant.required' => 'La fecha es obligatoria',
                'ubicacion_mant.required' => 'La ubicación es obligatoria',
                'cotizacion_mant.required' => 'La cantidad de cotizacion es obligatorio',
                'materiales_mant.required' => 'La cantidad de envio de materiales es obligatorio',
                'mano_obra_mant.required' => 'la cantidad de personal es obligatoria',
                'gastos_generales.required' => 'La cantidad de dias laburados es obligatorio',
            ]);

            // Iniciar transacción
            DB::beginTransaction();

            // Crear el metrado
            $mantenimiento = MantenimientoCampo::create([
                'nombre_proyecto_mant' => $validatedData['nombre_proyecto_mant'],
                'propietario_mant' => $validatedData['propietario_mant'],
                'ubicacion_mant' => $validatedData['ubicacion_mant'],
                'fecha_pro_mant' => $validatedData['fecha_pro_mant'],
                'cotizacion_mant' => $validatedData['cotizacion_mant'],
                'materiales_mant' => $validatedData['materiales_mant'],
                'mano_obra_mant' => $validatedData['mano_obra_mant'],
                'gastos_generales' => $validatedData['gastos_generales'],
                'data_mantenimiento' => '',
            ]);

            // Confirmar transacción
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Mantenimiento creado exitosamente',
                'data' => $mantenimiento
            ]);
        } catch (ValidationException $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, string $id)
    {
        try {
            // Validación de los datos
            $validatedData = $request->validate([
                'nombre_proyecto_mant' => 'required|string|max:255',
                'propietario_mant' => 'required|string|max:255',
                'ubicacion_mant' => 'required|string|max:255',
                'fecha_pro_mant' => 'required|date',
                'cotizacion_mant' => 'required|numeric',
                'materiales_mant' => 'required|numeric',
                'mano_obra_mant' => 'required|numeric',
                'gastos_generales' => 'required|numeric',
            ], [
                'nombre_proyecto_mant.required' => 'El nombre del proyecto es obligatorio',
                'propietario_mant.required' => 'La UEI es obligatoria',
                'fecha_pro_mant.required' => 'La fecha es obligatoria',
                'ubicacion_mant.required' => 'La ubicación es obligatoria',
                'cotizacion_mant.required' => 'La cantidad de cotizacion es obligatorio',
                'materiales_mant.required' => 'La cantidad de envio de materiales es obligatorio',
                'mano_obra_mant.required' => 'la cantidad de personal es obligatoria',
                'gastos_generales.required' => 'La cantidad de dias laburados es obligatorio',
            ]);

            // Iniciar transacción
            DB::beginTransaction();

            // Buscar y actualizar el metrado
            $mantenimiento = MantenimientoCampo::findOrFail($id);

            $mantenimiento->update([
                'nombre_proyecto_mant' => $validatedData['nombre_proyecto_mant'],
                'propietario_mant' => $validatedData['propietario_mant'],
                'ubicacion_mant' => $validatedData['ubicacion_mant'],
                'fecha_pro_mant' => $validatedData['fecha_pro_mant'],
                'cotizacion_mant' => $validatedData['cotizacion_mant'],
                'materiales_mant' => $validatedData['materiales_mant'],
                'mano_obra_mant' => $validatedData['mano_obra_mant'],
                'gastos_generales' => $validatedData['gastos_generales'],
            ]);

            // Confirmar transacción
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'mantenimiento actualizado exitosamente',
                'data' => $mantenimiento
            ]);
        } catch (ValidationException $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor: ' . $e->getMessage()
            ], 500);
        }
    }


    public function destroy(string $id)
    {
        // Encuentra el mantenimiento por ID
        $mantenimiento = MantenimientoCampo::findOrFail($id);

        // Elimina el mantenimiento
        $mantenimiento->delete();

        // Redirigir con un mensaje de éxito
        return redirect()->route('mantenimientoCampo.index') // Ajusta esta ruta según sea necesario
            ->with('success', 'Mantenimiento eliminado exitosamente.');
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
}
