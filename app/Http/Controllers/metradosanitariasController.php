<?php

namespace App\Http\Controllers;

use App\Models\metradosanitarias;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class metradosanitariasController extends Controller
{
    public function index()
    {
        try {
            $metradosanitarias = metradosanitarias::orderBy('created_at', 'desc')->get();
            return view('gestor_vista.Construyehc.metradosSanitarias.index', compact('metradosanitarias'));
        } catch (Exception $e) {
            return redirect()->back()->with('error', 'Error al cargar los metrados');
        }
    }

    // Método store para almacenar los datos
    public function store(Request $request)
    {
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
                'cantidadModulo' => 'required|numeric',
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
                'ubicacion.required' => 'La ubicación es obligatoria',
                'cantidadModulo.required' => 'La cantidad de modulo debe ser mayor a 0 y es obligatoria'
            ]);

            // Validar que el JSON de codigo_modular tenga al menos un nivel educativo
            $codigoModular = json_decode($validatedData['codigo_modular'], true);
            if (empty($codigoModular) || !is_array($codigoModular)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Debe seleccionar al menos un nivel educativo con su código correspondiente'
                ], 422);
            }

            // Estructura de módulos por defecto
            // Obtener la cantidad de módulos
            $modulocant = $request->input('cantidadModulo');

            // Estructura base del JSON
            $docdata = [
                "modulos" => [],
                "cisterna" => [],
                "exterior" => []
            ];

            // Crear los módulos dinámicamente
            for ($i = 1; $i <= $modulocant; $i++) {
                // Convertir el número de módulo a romano
                $nombreModulo = "modulo_" . $this->numeroARomano($i);

                // Estructura de cada módulo
                $modulo = [
                    "nombre" => $nombreModulo,
                    "datos" => [
                        [
                            "id" => 1,
                            "item" => "04",
                            "descripcion" => "INSTALACIONES SANITARIAS",
                            "totalnieto" => "0.00",
                            "children" => [
                                [
                                    "id" => 2,
                                    "item" => "04.01",
                                    "descripcion" => "APARATOS SANITARIOS Y ACCESORIOS",
                                    "totalnieto" => "0.00",
                                    "children" => [
                                        [
                                            "id" => 3,
                                            "item" => "04.01.01",
                                            "descripcion" => "SUMINISTRO DE APARATOS SANITARIOS",
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

                // Agregar el módulo creado al array de módulos
                $docdata['modulos'][] = $modulo;
            }

            // Añadir sección de cisterna
            $docdata['cisterna'] = [
                [
                    "id" => 1,
                    "item" => "04",
                    "descripcion" => "INSTALACIONES SANITARIAS",
                    "totalnieto" => "0.00",
                    "children" => [
                        [
                            "id" => 2,
                            "item" => "04.01",
                            "descripcion" => "APARATOS SANITARIOS Y ACCESORIOS",
                            "totalnieto" => "0.00",
                            "children" => [
                                [
                                    "id" => 3,
                                    "item" => "04.01.01",
                                    "descripcion" => "SUMINISTRO DE APARATOS SANITARIOS",
                                    "totalnieto" => "0.00",
                                    "unidad" => null,
                                    "elesimil" => null,
                                    "longitud" => null,
                                    "volumen" => null,
                                    "kg" => null,
                                    "unidadcalculado" => null,
                                    "total" => "0.00"
                                ],
                                [
                                    "id" => 11,
                                    "item" => "04.01.02",
                                    "descripcion" => "SUMINISTRO DE ACCESORIOS",
                                    "totalnieto" => "0.00",
                                    "unidad" => null,
                                    "elesimil" => null,
                                    "longitud" => null,
                                    "volumen" => null,
                                    "kg" => null,
                                    "unidadcalculado" => null,
                                    "total" => "0.00"
                                ]
                            ]
                        ]
                    ]
                ]
            ];

            // Añadir sección de exterior
            $docdata['exterior'] = [
                [
                    "id" => 1,
                    "item" => "04",
                    "descripcion" => "INSTALACIONES SANITARIAS",
                    "children" => [
                        [
                            "id" => 2,
                            "item" => "04.01",
                            "descripcion" => "APARATOS SANITARIOS Y ACCESORIOS",
                            "children" => [
                                [
                                    "id" => 3,
                                    "item" => "04.01.01",
                                    "descripcion" => "SUMINISTRO DE APARATOS SANITARIOS",
                                    "unidad" => null,
                                    "elesimil" => null,
                                    "longitud" => null,
                                    "volumen" => null,
                                    "kg" => null,
                                    "unidadcalculado" => null,
                                    "totalnieto" => "0.00",
                                    "total" => "0.00"
                                ]
                            ]
                        ]
                    ]
                ]
            ];

            // Convertir el array a JSON para almacenarlo o devolverlo en una respuesta
            $docdataJson = json_encode($docdata);

            // Iniciar transacción
            DB::beginTransaction();

            // Crear el metrado
            $metrado = metradosanitarias::create([
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
                'cantidadModulo' => $modulocant,
                'documentosdata' => $docdataJson,
                'proyectodesignado' => $validatedData['proyecto_designado'],
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

    // Función para convertir un número a su equivalente en números romanos
    private function numeroARomano($numero)
    {
        $numerosRomanos = [
            1   => 'I',
            4   => 'IV',
            5   => 'V',
            9   => 'IX',
            10  => 'X',
            40  => 'XL',
            50  => 'L',
            90  => 'XC',
            100 => 'C',
            400 => 'CD',
            500 => 'D',
            900 => 'CM',
            1000 => 'M'
        ];
        $resultado = '';
        foreach (array_reverse($numerosRomanos, true) as $valor => $romano) {
            while ($numero >= $valor) {
                $resultado .= $romano;
                $numero -= $valor;
            }
        }
        return $resultado;
    }

    public function show(string $id)
    {
        try {
            $metradosanitarias = metradosanitarias::findOrFail($id);

            // Si es una petición AJAX, devolver JSON
            if (request()->expectsJson()) {
                // Preparar datos para el modal de edición
                $data = [
                    'nombre_proyecto' => $metradosanitarias->nombre_proyecto,
                    'uei' => $metradosanitarias->uei,
                    'codigo_snip' => $metradosanitarias->codigosnip,
                    'codigo_cui' => $metradosanitarias->codigocui,
                    'unidad_ejecutora' => $metradosanitarias->unidad_ejecutora,
                    'codigo_local' => $metradosanitarias->codigo_local,
                    'codigo_modular' => $metradosanitarias->codigo_modular,
                    'especialidad' => $metradosanitarias->especialidad,
                    'fecha' => $metradosanitarias->fecha,
                    'ubicacion' => $metradosanitarias->ubicacion ?? $metradosanitarias->localidad,
                    'cantidadModulo' => $metradosanitarias->cantidadModulo,
                ];

                return response()->json($data);
            }

            // Para vista normal
            return view('gestor_vista.Construyehc.metradosSanitarias.show', compact('metradosanitarias'));
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

    public function update(Request $request, string $id)
    {

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
                'cantidadModulo' => 'required|numeric',
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
                'ubicacion.required' => 'La ubicación es obligatoria',
                'cantidadModulo.required' => 'La cantidad de modulo debe ser mayor a 0 y es obligatoria'
            ]);

            // Validar que el JSON de codigo_local tenga al menos un nivel educativo
            $codigoModular = json_decode($validatedData['codigo_local'], true);
            if (empty($codigoModular) || !is_array($codigoModular)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Debe seleccionar al menos un nivel educativo con su código correspondiente'
                ], 422);
            }

            // Iniciar transacción
            DB::beginTransaction();

            // Buscar y actualizar el metrado
            $metrado = metradosanitarias::findOrFail($id);

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
                'cantidadModulo' => $validatedData['cantidadModulo'],
            ]);

            // Confirmar transacción
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Metrado de Electricas actualizado exitosamente',
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

    public function destroy(string $id)
    {
        try {
            DB::beginTransaction();

            $metrado = metradosanitarias::findOrFail($id);
            $metrado->delete();

            DB::commit();

            return redirect()->route('metradosanitarias.index')
                ->with('success', 'Metrado eliminado exitosamente');
        } catch (Exception $e) {
            DB::rollback();
            return redirect()->back()
                ->with('error', 'Error al eliminar el metrado: ' . $e->getMessage());
        }
    }

    public function actualizar_data(Request $request)
    {
        // Validar los datos de entrada
        $request->validate([
            'modulos' => 'required|array',
            'cisterna' => 'required|array',
            'exterior' => 'required|array',
        ]);

        // Preparar los datos para la columna `documentosdata`
        $data = [
            'modulos' => $request->modulos,
            'cisterna' => $request->cisterna,
            'exterior' => $request->exterior,
        ];

        $resumendata = [
            'resumensa' => $request->resumensa,
        ];

        // Convertir los datos en formato JSON
        $documentosData = json_encode($data);
        $resumenData = json_encode($resumendata);

        // Actualizar la columna `documentosdata` en la tabla `metradosanitarias`
        $metradosanitarias = metradosanitarias::first(); // Obtener el primer registro (o ajustar la lógica según sea necesario)
        if ($metradosanitarias) {
            $metradosanitarias->documentosdata = $documentosData;
            $metradosanitarias->resumenmetrados = $resumenData;
            $metradosanitarias->save();
            return response()->json(['message' => 'Data updated successfully'], 200);
        }

        return response()->json(['message' => 'Record not found'], 404);
    }
}
