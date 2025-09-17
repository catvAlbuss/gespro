<?php

namespace App\Http\Controllers;

use App\Models\metradocomunicacion;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class metradocomunicacionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $metradocomunicaciones = metradocomunicacion::orderBy('created_at', 'desc')->get();
            return view('gestor_vista.Construyehc.metradoComunicacion.index', compact('metradocomunicaciones'));
        } catch (Exception $e) {
            Log::error('Error al cargar metrados: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Error al cargar los metrados');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Log::info('Datos recibidos para crear metrado:', $request->all());

        try {
            // Validación de los datos
            $validatedData = $request->validate([
                'nombre_proyecto' => 'required|string|max:500',
                'uei' => 'required|string|max:255',
                'codigo_snip' => 'required|string|max:255',
                'codigo_cui' => 'required|string|max:255',
                'unidad_ejecutora' => 'required|string|max:255',
                'codigo_local' => 'required|string|max:255',
                'codigo_modular' => 'required|string',
                'especialidad' => 'required|string|max:255',
                'fecha' => 'required|date',
                'ubicacion' => 'required|string|max:255',
                'proyecto_designado' => 'required|integer',
            ], [
                'nombre_proyecto.required' => 'El nombre del proyecto es obligatorio',
                'nombre_proyecto.max' => 'El nombre del proyecto no puede exceder 500 caracteres',
                'uei.required' => 'La UEI es obligatoria',
                'codigo_snip.required' => 'El código SNIP es obligatorio',
                'codigo_cui.required' => 'El código CUI es obligatorio',
                'unidad_ejecutora.required' => 'La unidad ejecutora es obligatoria',
                'codigo_local.required' => 'El código local es obligatorio',
                'codigo_modular.required' => 'Debe seleccionar al menos un nivel educativo',
                'especialidad.required' => 'La especialidad es obligatoria',
                'fecha.required' => 'La fecha es obligatoria',
                'fecha.date' => 'La fecha debe ser una fecha válida',
                'ubicacion.required' => 'La ubicación es obligatoria'
            ]);

            // CORRECCIÓN: Validar que el JSON de codigo_modular tenga al menos un nivel educativo
            $codigoModular = json_decode($validatedData['codigo_modular'], true);
            if (empty($codigoModular) || !is_array($codigoModular)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Debe seleccionar al menos un nivel educativo con su código correspondiente'
                ], 422);
            }

            // Estructura de módulos por defecto
            $modulo = [
                "modulos" => [
                    [
                        "id" => 1,
                        "item" => "07",
                        "descripcion" => "INSTALACIONES DE COMUNICACION",
                        "totalnieto" => "0.00",
                        "children" => [
                            [
                                "id" => 2,
                                "item" => "07.01",
                                "descripcion" => "CABLEADO ESTRUCTURADO EN INTERIORES DE EDIFICIOS",
                                "totalnieto" => "0.00",
                                "children" => [
                                    [
                                        "id" => 3,
                                        "item" => "07.01.01",
                                        "descripcion" => "CABLES EN TUBERÍAS",
                                        "totalnieto" => "0.00",
                                        "unidad" => null,
                                        "elesimil" => null,
                                        "largo" => null,
                                        "ancho" => null,
                                        "alto" => null,
                                        "longitud" => null,
                                        "volumen" => null,
                                        "kg" => null,
                                        "unidadcalculado" => null,
                                        "total" => "0.00"
                                    ]
                                ],
                                "unidad" => null,
                                "elesimil" => null,
                                "largo" => null,
                                "ancho" => null,
                                "alto" => null,
                                "longitud" => null,
                                "volumen" => null,
                                "kg" => null,
                                "unidadcalculado" => null,
                                "total" => "0.00"
                            ]
                        ]
                    ]
                ]
            ];

            // Iniciar transacción
            DB::beginTransaction();

            // Crear el metrado
            $metrado = metradocomunicacion::create([
                'nombre_proyecto' => $validatedData['nombre_proyecto'],
                'uei' => $validatedData['uei'],
                'codigosnip' => $validatedData['codigo_snip'],
                'codigocui' => $validatedData['codigo_cui'],
                'unidad_ejecutora' => $validatedData['unidad_ejecutora'],
                'codigo_local' => $validatedData['codigo_local'],
                'codigo_modular' => $validatedData['codigo_modular'],
                'especialidad' => $validatedData['especialidad'],
                'fecha' => $validatedData['fecha'],
                'ubicacion' => $validatedData['ubicacion'],
                'documentosdata' => json_encode($modulo),
                'proyectodesignado' => $validatedData['proyecto_designado'],
            ]);

            // Confirmar transacción
            DB::commit();

            Log::info('Metrado creado exitosamente:', ['id' => $metrado->idmetradocomunicacion]);

            return response()->json([
                'success' => true,
                'message' => 'Metrado de comunicación creado exitosamente',
                'data' => $metrado
            ]);
        } catch (ValidationException $e) {
            DB::rollback();
            Log::warning('Error de validación al crear metrado:', $e->errors());
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            DB::rollback();
            Log::error('Error al crear metrado: ' . $e->getMessage());
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
            $metradocomunicaciones = metradocomunicacion::findOrFail($id);

            // Si es una petición AJAX, devolver JSON
            if (request()->expectsJson()) {
                // Preparar datos para el modal de edición
                $data = [
                    'nombre_proyecto' => $metradocomunicaciones->nombre_proyecto,
                    'uei' => $metradocomunicaciones->uei,
                    'codigo_snip' => $metradocomunicaciones->codigosnip,
                    'codigo_cui' => $metradocomunicaciones->codigocui,
                    'unidad_ejecutora' => $metradocomunicaciones->unidad_ejecutora,
                    'codigo_local' => $metradocomunicaciones->codigo_local,
                    'codigo_modular' => $metradocomunicaciones->codigo_modular,
                    'especialidad' => $metradocomunicaciones->especialidad,
                    'fecha' => $metradocomunicaciones->fecha,
                    'ubicacion' => $metradocomunicaciones->ubicacion ?? $metradocomunicaciones->localidad,
                ];

                return response()->json($data);
            }

            // Para vista normal
            return view('gestor_vista.Construyehc.metradoComunicacion.show', compact('metradocomunicaciones'));
        } catch (Exception $e) {
            Log::error('Error al obtener metrado: ' . $e->getMessage());

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
        Log::info('Datos recibidos para actualizar metrado:', $request->all());

        try {
            // Validación de los datos
            $validatedData = $request->validate([
                'nombre_proyecto' => 'required|string|max:500',
                'uei' => 'required|string|max:255',
                'codigo_snip' => 'required|string|max:255',
                'codigo_cui' => 'required|string|max:255',
                'unidad_ejecutora' => 'required|string|max:255',
                'codigo_local' => 'required|string|max:255',
                'codigo_modular' => 'required|string',
                'especialidad' => 'required|string|max:255',
                'fecha' => 'required|date',
                'ubicacion' => 'required|string|max:255',
            ], [
                'nombre_proyecto.required' => 'El nombre del proyecto es obligatorio',
                'uei.required' => 'La UEI es obligatoria',
                'codigo_snip.required' => 'El código SNIP es obligatorio',
                'codigo_cui.required' => 'El código CUI es obligatorio',
                'unidad_ejecutora.required' => 'La unidad ejecutora es obligatoria',
                'codigo_local.required' => 'El código local es obligatorio',
                'codigo_modular.required' => 'Debe seleccionar al menos un nivel educativo',
                'especialidad.required' => 'La especialidad es obligatoria',
                'fecha.required' => 'La fecha es obligatoria',
                'ubicacion.required' => 'La ubicación es obligatoria'
            ]);

            // CORRECCIÓN: Validar que el JSON de codigo_modular tenga al menos un nivel educativo
            $codigoModular = json_decode($validatedData['codigo_modular'], true);
            if (empty($codigoModular) || !is_array($codigoModular)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Debe seleccionar al menos un nivel educativo con su código correspondiente'
                ], 422);
            }

            // Iniciar transacción
            DB::beginTransaction();

            // Buscar y actualizar el metrado
            $metrado = metradocomunicacion::findOrFail($id);

            $metrado->update([
                'nombre_proyecto' => $validatedData['nombre_proyecto'],
                'uei' => $validatedData['uei'],
                'codigosnip' => $validatedData['codigo_snip'],
                'codigocui' => $validatedData['codigo_cui'],
                'unidad_ejecutora' => $validatedData['unidad_ejecutora'],
                'codigo_local' => $validatedData['codigo_local'],
                'codigo_modular' => $validatedData['codigo_modular'],
                'especialidad' => $validatedData['especialidad'],
                'fecha' => $validatedData['fecha'],
                'ubicacion' => $validatedData['ubicacion'],
            ]);

            // Confirmar transacción
            DB::commit();

            Log::info('Metrado actualizado exitosamente:', ['id' => $metrado->idmetradocomunicacion]);

            return response()->json([
                'success' => true,
                'message' => 'Metrado de comunicación actualizado exitosamente',
                'data' => $metrado
            ]);
        } catch (ValidationException $e) {
            DB::rollback();
            Log::warning('Error de validación al actualizar metrado:', $e->errors());
            return response()->json([
                'success' => false,
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (Exception $e) {
            DB::rollback();
            Log::error('Error al actualizar metrado: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Error interno del servidor: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            DB::beginTransaction();

            $metrado = metradocomunicacion::findOrFail($id);
            $metrado->delete();

            DB::commit();

            Log::info('Metrado eliminado exitosamente:', ['id' => $id]);

            return redirect()->route('metradocomunicacion.index')
                ->with('success', 'Metrado eliminado exitosamente');
        } catch (Exception $e) {
            DB::rollback();
            Log::error('Error al eliminar metrado: ' . $e->getMessage());

            return redirect()->back()
                ->with('error', 'Error al eliminar el metrado: ' . $e->getMessage());
        }
    }

    public function actualizar_data_comunicacion(Request $request)
    {
        // Validar los datos de entrada
        $request->validate([
            'id' => 'required|integer', // Validar que el ID es un entero
            'modulos' => 'required|array', // Validar que 'modulos' es un arreglo
        ]);

        // Obtener el ID de 'metrado' y los 'modulos' enviados en la solicitud
        $id = $request->id;
        $modulos = $request->modulos;
        $resumencm = $request->resumencm;

        // Buscar el registro correspondiente al 'id' recibido
        $metrado = metradocomunicacion::find($id);

        if ($metrado) {
            // Preparar los datos para la columna 'documentosdata'
            // Puedes agregar más datos si es necesario, como en el ejemplo de 'cisterna' o 'exterior'.
            $data = [
                'modulos' => $modulos,
            ];

            $dataresumen = [
                'resumencm' => $resumencm,
            ];
            // Convertir los datos en formato JSON
            $documentosData = json_encode($data);
            $resumenData = json_encode($dataresumen);

            // Actualizar la columna 'documentosdata' en el registro encontrado
            $metrado->documentosdata = $documentosData;
            $metrado->resumenmetrados = $resumenData;
            $metrado->save(); // Guardar los cambios

            // Responder con un mensaje de éxito
            return response()->json(['message' => 'Datos actualizados correctamente'], 200);
        } else {
            // Si no se encuentra el 'metrado', responder con un mensaje de error
            return response()->json(['message' => 'Registro no encontrado'], 404);
        }
    }
}
