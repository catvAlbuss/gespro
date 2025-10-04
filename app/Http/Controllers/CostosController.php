<?php

namespace App\Http\Controllers;

use App\Models\Costos;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CostosController extends Controller
{
    /**
     * Display a listing of the resource.resources/views/gestor_vista/Construyehc/costos/index.blade.php
     */
    public function index()
    {
        try {
            $costos = Costos::orderBy('created_at', 'desc')->get();
            return view('gestor_vista.Construyehc.costos.index', compact('costos'));
        } catch (Exception $e) {
            return redirect()->back()->with('error', 'Error al cargar los metrados');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            // Validación de los datos
            $validatedData = $request->validate([
                'name' => 'required|string|max:500',
                'codigouei' => 'required|string|max:255',
                'codigosnip' => 'required|string|max:255',
                'codigocui' => 'required|string|max:255',
                'unidad_ejecutora' => 'required|string|max:255',
                'codigolocal' => 'required|string|max:255',
                'codigomodular' => 'required|string',
                'fecha' => 'required|date',
                'region' => 'required|string|max:255',
                'provincia' => 'required|string|max:255',
                'distrito' => 'required|string|max:255',
                'centropoblado' => 'required|string|max:255',
            ], [
                'name.required' => 'El nombre del proyecto es obligatorio',
                'name.max' => 'El nombre del proyecto no puede exceder 500 caracteres',
                'codigouei.required' => 'La UEI es obligatoria',
                'codigosnip.required' => 'El código SNIP es obligatorio',
                'codigocui.required' => 'El código CUI es obligatorio',
                'unidad_ejecutora.required' => 'La unidad ejecutora es obligatoria',
                'codigolocal.required' => 'El código local es obligatorio',
                'codigomodular.required' => 'Debe seleccionar al menos un nivel educativo',
                'especialidad.required' => 'La especialidad es obligatoria',
                'fecha.required' => 'La fecha es obligatoria',
                'fecha.date' => 'La fecha debe ser una fecha válida',
                'region.required' => 'La region es obligatoria',
                'provincia.required' => 'La region es obligatoria',
                'distrito.required' => 'La region es obligatoria',
            ]);

            // Validar que el JSON de codigo_modular tenga al menos un nivel educativo
            $codigoModular = json_decode($validatedData['codigomodular'], true);
            if (empty($codigoModular) || !is_array($codigoModular)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Debe seleccionar al menos un nivel educativo con su código correspondiente'
                ], 422);
            }

            // Iniciar transacción
            DB::beginTransaction();

            // Crear el metrado
            $metrado = Costos::create([
                'name' => $validatedData['name'],
                'codigouei' => $validatedData['codigouei'],
                'codigosnip' => $validatedData['codigosnip'],
                'codigocui' => $validatedData['codigocui'],
                'unidad_ejecutora' => $validatedData['unidad_ejecutora'],
                'codigolocal' => $validatedData['codigolocal'],
                'codigomodular' => $validatedData['codigomodular'],
                'fecha' => $validatedData['fecha'],
                'region' => $validatedData['region'],
                'provincia' => $validatedData['provincia'],
                'distrito' => $validatedData['distrito'],
                'centropoblado' => $validatedData['centropoblado'],
            ]);

            // Confirmar transacción
            DB::commit();
            return response()->json([
                'success' => true,
                'message' => 'Metrado de electricas creado exitosamente',
                'data' => $metrado
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

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $costos = Costos::findOrFail($id);

            // Si es una petición AJAX, devolver JSON
            if (request()->expectsJson()) {
                // Preparar datos para el modal de edición
                $data = [
                    'name' => $costos->name,
                    'codigouei' => $costos->codigouei,
                    'codigosnip' => $costos->codigosnip,
                    'codigocui' => $costos->codigocui,
                    'unidad_ejecutora' => $costos->unidad_ejecutora,
                    'codigolocal' => $costos->codigolocal,
                    'codigomodular' => $costos->codigomodular,
                    'fecha' => $costos->fecha,
                    'region' =>  $costos->region,
                    'provincia' =>  $costos->provincia,
                    'distrito' =>  $costos->distrito,
                    'centropoblado' =>  $costos->centropoblado,
                ];

                return response()->json($data);
            }

            // Para vista normal
            return view('gestor_vista.Construyehc.metradosElectricas.show', compact('metradoelectricas'));
        } catch (Exception $e) {
            if (request()->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Metrado no encontrado'
                ], 404);
            }

            return redirect()->back()->with('error', 'Metrado no encontrado');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            // Validación de los datos
            $validatedData = $request->validate([
                'name' => 'required|string|max:500',
                'codigouei' => 'required|string|max:255',
                'codigosnip' => 'required|string|max:255',
                'codigocui' => 'required|string|max:255',
                'unidad_ejecutora' => 'required|string|max:255',
                'codigolocal' => 'required|string|max:255',
                'codigomodular' => 'required|string',
                'fecha' => 'required|date',
                'region' => 'required|string|max:255',
                'provincia' => 'required|string|max:255',
                'distrito' => 'required|string|max:255',
                'centropoblado' => 'required|string|max:255',
            ], [
                'name.required' => 'El nombre del proyecto es obligatorio',
                'name.max' => 'El nombre del proyecto no puede exceder 500 caracteres',
                'codigouei.required' => 'La UEI es obligatoria',
                'codigosnip.required' => 'El código SNIP es obligatorio',
                'codigocui.required' => 'El código CUI es obligatorio',
                'unidad_ejecutora.required' => 'La unidad ejecutora es obligatoria',
                'codigolocal.required' => 'El código local es obligatorio',
                'codigomodular.required' => 'Debe seleccionar al menos un nivel educativo',
                'especialidad.required' => 'La especialidad es obligatoria',
                'fecha.required' => 'La fecha es obligatoria',
                'fecha.date' => 'La fecha debe ser una fecha válida',
                'region.required' => 'La region es obligatoria',
                'provincia.required' => 'La region es obligatoria',
                'distrito.required' => 'La region es obligatoria',
            ]);

            // Validar que el JSON de codigomodular tenga al menos un nivel educativo
            $codigoModular = json_decode($validatedData['codigomodular'], true);
            if (empty($codigoModular) || !is_array($codigoModular)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Debe seleccionar al menos un nivel educativo con su código correspondiente'
                ], 422);
            }

            // Iniciar transacción
            DB::beginTransaction();

            // Buscar y actualizar el metrado
            $costos = Costos::findOrFail($id);

            $costos->update([
                'name' => $validatedData['name'],
                'codigouei' => $validatedData['codigouei'],
                'codigosnip' => $validatedData['codigosnip'],
                'codigocui' => $validatedData['codigocui'],
                'unidad_ejecutora' => $validatedData['unidad_ejecutora'],
                'codigolocal' => $validatedData['codigolocal'],
                'codigomodular' => $validatedData['codigomodular'],
                'fecha' => $validatedData['fecha'],
                'region' => $validatedData['region'],
                'provincia' => $validatedData['provincia'],
                'distrito' => $validatedData['distrito'],
                'centropoblado' => $validatedData['centropoblado'],
            ]);

            // Confirmar transacción
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Costos actualizado exitosamente',
                'data' => $costos
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

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Costos $costos)
    {
        //
    }
}
