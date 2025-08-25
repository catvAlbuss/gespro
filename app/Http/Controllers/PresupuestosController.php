<?php

namespace App\Http\Controllers;

use App\Models\presupuestos;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PresupuestosController extends Controller
{
    public function obtenerMetrados(Request $request)
    {
        try {
            // Obtener el ID del proyecto desde la solicitud
            $proyectoId = $request->input('proyecto_id');

            if (!$proyectoId) {
                return response()->json([
                    'error' => 'Se requiere el ID del proyecto'
                ], 400);
            }

            // Mapeo de categorías con sus respectivas configuraciones
            $categorias = [
                'estructura' => [
                    'enabled' => $request->boolean('estructura'),
                    'table' => 'metradoestructuras',
                    'id_field' => 'idmetradoestructuras',
                    'json_key' => 'resumenestr',
                    'item' => '02',
                    'descripcion' => 'ESTRUCTURAS'
                ],
                'arquitectura' => [
                    'enabled' => $request->boolean('arquitectura'),
                    'table' => 'metradoarquitectura',
                    'id_field' => 'idmearquitectura',
                    'json_key' => 'resumenar',
                    'item' => '03',
                    'descripcion' => 'ARQUITECTURA'
                ],
                'sanitarias' => [
                    'enabled' => $request->boolean('sanitarias'),
                    'table' => 'metradosanitarias',
                    'id_field' => 'idmetradosan',
                    'json_key' => 'resumensa',
                    'item' => '04',
                    'descripcion' => 'INSTALACIONES SANITARIAS'
                ],
                'electricas' => [
                    'enabled' => $request->boolean('electricas'),
                    'table' => 'metradoelectricas',
                    'id_field' => 'idmeelectrica',
                    'json_key' => 'resumenel',
                    'item' => '05',
                    'descripcion' => 'INSTALACIONES ELÉCTRICAS'
                ],
                'comunicacion' => [
                    'enabled' => $request->boolean('comunicacion'),
                    'table' => 'metradocomunicacions',
                    'id_field' => 'idmetradocomunicacion',
                    'json_key' => 'resumencm',
                    'item' => '06',
                    'descripcion' => 'INSTALACIONES DE COMUNICACIONES'
                ],
                'gas' => [
                    'enabled' => $request->boolean('gas'),
                    'table' => 'metradogas',
                    'id_field' => 'idmetradogas',
                    'json_key' => 'resumengas',
                    'item' => '07',
                    'descripcion' => 'INSTALACIONES DE GAS'
                ]
            ];

            // Verificar si al menos una categoría está seleccionada
            $hasSelection = collect($categorias)->some(function ($categoria) {
                return $categoria['enabled'] === true;
            });

            if (!$hasSelection) {
                return response()->json([
                    'error' => 'Debe seleccionar al menos una categoría'
                ], 400);
            }

            // Array para almacenar todos los elementos combinados
            $combinedData = [];
            $dataFound = false;
            $seleccionadas = [];

            // Procesar cada categoría
            foreach ($categorias as $key => $categoria) {
                if (!$categoria['enabled']) {
                    continue; // Saltar categorías no seleccionadas
                }

                $seleccionadas[] = $key; // Guardar qué categorías se seleccionaron

                $data = DB::table($categoria['table'])
                    ->where('proyectodesignado', $proyectoId)
                    ->select($categoria['id_field'] . ' as id', 'resumenmetrados')
                    ->get();

                $processedData = $this->preProcessJsonData($data, $categoria['json_key'], $categoria['item']);
                $flattenedData = $this->flattenCategoryData($processedData);

                // Verificar si hay datos procesados
                if (!empty($flattenedData)) {
                    $dataFound = true;
                    // Agregar categoría principal
                    $combinedData[] = [
                        'id' => Carbon::now()->timestamp, //'cat_' . $categoria['item'],
                        'item' => $categoria['item'],
                        'descripcion' => $categoria['descripcion'],
                        'unidad' => '',
                        'cantidad' => 0,
                        'observacion' => '',
                        'detalles' => [],
                        '_children' => $flattenedData
                    ];
                }
            }

            // Verificar si se encontraron datos
            if (!$dataFound) {
                return response()->json([
                    'warning' => 'No se encontraron datos para las categorías seleccionadas',
                    'categorias_seleccionadas' => $seleccionadas,
                    'data' => []
                ], 200);
            }

            // Ordenar los resultados por número de item para mantener el orden adecuado
            usort($combinedData, function ($a, $b) {
                return $a['item'] <=> $b['item'];
            });

            return response()->json([
                'success' => true,
                'categorias_seleccionadas' => $seleccionadas,
                'data' => $combinedData
            ]);
        } catch (\Exception $e) {
            // \Log::error('Error en obtenerMetrados: ' . $e->getMessage() . ' - Línea: ' . $e->getLine());
            return response()->json([
                'error' => 'Error interno del servidor: ' . $e->getMessage()
            ], 500);
        }
    }

    // Función mejorada para aplanar los datos de cada categoría
    private function flattenCategoryData($categoryData)
    {
        $result = [];

        if (empty($categoryData)) {
            return $result;
        }

        foreach ($categoryData as $item) {
            if (isset($item['parsedData']) && is_array($item['parsedData']) && !empty($item['parsedData'])) {
                foreach ($item['parsedData'] as $parsedItem) {
                    if (!empty($parsedItem)) {
                        $result[] = $parsedItem;
                    }
                }
            }
        }

        return $result;
    }

    private function preProcessJsonData($data, $key, $parentItem)
    {
        $result = [];

        if ($data->isEmpty()) {
            return $result;
        }

        foreach ($data as $item) {
            if (empty($item->resumenmetrados)) {
                continue;
            }

            try {
                $jsonData = json_decode($item->resumenmetrados, true);

                if (json_last_error() !== JSON_ERROR_NONE) {
                    // \Log::warning("Error decodificando JSON para el item ID: " . $item->id);
                    continue;
                }

                if (empty($jsonData[$key])) {
                    continue;
                }

                // Usar el id que ya viene en la consulta
                $idField = $item->id;

                // Extraer solo los datos que necesitamos para reducir el tamaño
                $reducedItem = [
                    'id' => $idField,
                    'parsedData' => $this->extractReducedData($jsonData[$key], $parentItem)
                ];

                // Solo añadir si hay datos
                if (!empty($reducedItem['parsedData'])) {
                    $result[] = $reducedItem;
                }
            } catch (\Exception $e) {
                // \Log::error("Error procesando datos para item ID: " . $item->id . ". Error: " . $e->getMessage());
                continue;
            }
        }

        return $result;
    }

    private function extractReducedData($input, $parentItem, $parentHierarchy = "")
    {
        if (!is_array($input) || empty($input)) {
            return [];
        }

        $result = [];

        foreach ($input as $index => $item) {
            if (empty($item) || !is_array($item)) {
                continue;
            }

            $formattedIndex = str_pad($index + 1, 2, '0', STR_PAD_LEFT);
            $itemNumber = $parentHierarchy ? "{$parentHierarchy}.{$formattedIndex}" : $formattedIndex;
            $key = "{$parentItem}.{$itemNumber}";

            $resultItem = [
                'id' => $item['id'] ?? "{$key}-" . time(),
                'item' => $key,
                'descripcion' => $item['descripcion'] ?? "Sin descripción",
                'unidad' => $item['unidad'] ?? '',
                'cantidad' => isset($item['total']) ? (float)$item['total'] : 0,
                'observacion' => $item['observacion'] ?? "",
                'detalles' => [
                    'rendimiento' => $item['rendimiento'] ?? 20,
                    'unidadMD' => $item['unidadMD'] ?? "m",
                ]
            ];

            if (!empty($item['children']) && is_array($item['children'])) {
                $children = $this->extractReducedData($item['children'], $parentItem, $itemNumber);
                if (!empty($children)) {
                    $resultItem['_children'] = $children;
                } else {
                    $resultItem['_children'] = [];
                }
            } else {
                $resultItem['_children'] = [];
            }

            $result[] = $resultItem;
        }

        return $result;
    }

    public function actualizarMetrados(Request $request)
    {
        // Validar los datos de entrada
        $request->validate([
            'id' => 'required|integer',
            'gastosgenerales' => 'required|integer',
            'utilidades' => 'required|integer',
            'igv' => 'required|integer',
            'expediente' => 'required|integer',
            'totalmetrados' => 'required|array', //'required|integer',
            'costo_directo' => 'required|numeric',
            'datapresupuestos' => 'required|array',
        ]);

        // Obtener el ID del presupuesto desde la solicitud
        $id = $request->id;

        // Buscar el presupuesto por ID
        $presupuesto = presupuestos::find($id);

        if ($presupuesto) {
            // Actualizar los campos en la base de datos
            $presupuesto->gastosgenerales = $request->gastosgenerales;
            $presupuesto->utilidades = $request->utilidades;
            $presupuesto->igv = $request->igv;
            $presupuesto->expediente = $request->expediente;
            $presupuesto->totalmetrados = $request->totalmetrados;
            $presupuesto->costo_directo = $request->costo_directo;
            $presupuesto->datapresupuestos = $request->datapresupuestos;

            // Guardar los cambios
            $presupuesto->save();

            // Retornar una respuesta de éxito
            return response()->json(['message' => 'Presupuesto actualizado correctamente'], 200);
        } else {
            // Si no se encuentra el presupuesto con ese ID
            return response()->json(['message' => 'Presupuesto no encontrado'], 404);
        }
    }

    //CARGAR Y GUARDAR REMUNERACIONES
    public function guardarRemuneraciones($id, Request $request)
    {
        try {
            // Encuentra el presupuesto por ID
            $presupuesto = presupuestos::findOrFail($id);

            // Asumiendo que la columna remuneraciones en la base de datos es de tipo JSON o texto
            $presupuesto->remuneraciones = json_encode($request->input('remuneraciones')); // Guarda los datos como JSON
            $presupuesto->save(); // Guarda en la base de datos

            return response()->json(['message' => 'Datos guardados correctamente'], 200);
        } catch (\Throwable $th) {
            // Manejo de excepciones
            return response()->json(['error' => 'No se pudo guardar los datos'], 500);
        }
    }

    public function ObtenerRemuneraciones(Request $request)
    {
        try {
            // Validar si el id_presupuesto fue enviado correctamente
            $idPresupuesto = $request->input('id_presupuesto');

            // Buscar el presupuesto por su ID
            $presupuesto = presupuestos::findOrFail($idPresupuesto);

            // Retornar los datos de remuneraciones
            // Asumiendo que tienes un campo "remuneraciones" que contiene los datos que necesitas
            $remuneraciones = $presupuesto->remuneraciones;

            return response()->json([
                'status' => 'success',
                'data' => [
                    'remuneraciones' => $remuneraciones
                ]
            ], 200);
        } catch (\Exception $e) {
            // Manejo de errores en caso de no encontrar el presupuesto o cualquier otro error
            return response()->json([
                'status' => 'error',
                'message' => 'No se pudo obtener los datos de remuneración.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Guardar los datos de Gastos Generales
     */
    public function guardarGastosGenerales($id, Request $request) {}

    /**
     * Obtener los datos de Gastos Generales
     */
    public function obtenerGastosGenerales($id) {}

    /**
     * Guardar los datos de supervicion
     */
    public function guardarGastosSupervicion($id, Request $request) {}

    /**
     * Obtener los datos de supervicion
     */
    public function obtenerGastosSupervicion($id) {}

    /**
     * Guardar los datos de gastos cuncurrentes
     */
    public function guardarGastosConcurrentes($id, Request $request) {}

    /**
     * Obtener los datos de gastos concurrentes
     */
    public function obtenerGastosConcurrentes($id) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $presupuesto = presupuestos::select(
            'id',
            'datapresupuestos',
            'gastosgenerales',
            'utilidades',
            'igv',
            'expediente',
            'totalmetrados',
            'costo_directo',
        )->get();
        return response()->json([
            'success' => true,
            'data' => $presupuesto
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(presupuestos $presupuestos, $id)
    {
        $presupuesto = Presupuestos::select('id', 'datapresupuestos')->find($id);

        if (!$presupuesto) {
            return response()->json([
                'success' => false,
                'message' => 'Presupuesto no encontrado'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $presupuesto
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(presupuestos $presupuestos)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, presupuestos $presupuestos)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(presupuestos $presupuestos)
    {
        //
    }
}
