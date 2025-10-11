<?php

namespace App\Http\Controllers;

use App\Models\presupuestos;
use Carbon\Carbon;
use Exception;
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
            'totalmetrados' => 'required|array',
            'costo_directo' => 'required|numeric',
            'datapresupuestos' => 'required|array',
        ]);

        // Obtener el ID del presupuesto desde la solicitud
        $id = $request->id;

        // Buscar el presupuesto por ID
        $presupuesto = presupuestos::find($id);

        if ($presupuesto) {
            // Actualizar los campos en la base de datos
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



    public function obtenerPresupuestoMOMAEQCompleto()
    {
        $presupuestos = presupuestos::select('id', 'datapresupuestos')->get();

        $estructuraManoObra = [];
        $estructuraMateriales = [];
        $estructuraEquipos = [];

        foreach ($presupuestos as $presupuesto) {
            $dataPresupuestos = json_decode($presupuesto->datapresupuestos, true);

            if (is_array($dataPresupuestos)) {
                $this->aplanarEstructuraManoObra($dataPresupuestos, $estructuraManoObra);
                $this->aplanarEstructuraMateriales($dataPresupuestos, $estructuraMateriales);
                $this->aplanarEstructuraEquipos($dataPresupuestos, $estructuraEquipos);
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'mano_de_obra' => $estructuraManoObra,
                'materiales' => $estructuraMateriales,
                'equipos' => $estructuraEquipos
            ]
        ]);
    }

    // ESTRUCTURA COMPLETA PARA MANO DE OBRA
    private function aplanarEstructuraManoObra($items, &$estructuraManoObra)
    {
        foreach ($items as $item) {
            $fila = [
                'id' => $item['id'] ?? null,
                //'item' => $item['item'] ?? null,
                '1' => $item['descripcion'] ?? null,
                '2' => $item['unidad'] ?? null,
                '3' => $item['cantidad'] ?? null,
                // 'observacion' => $item['observacion'] ?? null,
                // 'subtotal' => $item['subtotal'] ?? null,
                // 'precio_original' => $item['precio'] ?? null,
                // 'parcial_original' => $item['parcial'] ?? null,
                // 'rendimiento' => null,
                // 'unidadMD' => null,
                '4' => 0, // Este será el precio calculado de mano de obra
                // 'tiene_detalles' => false,
                // 'tiene_mano_obra' => false
            ];

            // Si tiene detalles, procesar mano de obra
            if (isset($item['detalles']) && is_array($item['detalles'])) {
                // $fila['tiene_detalles'] = true;
                // $fila['rendimiento'] = $item['detalles']['rendimiento'] ?? null;
                // $fila['unidadMD'] = $item['detalles']['unidadMD'] ?? null;

                // Calcular solo total Mano de Obra
                if (isset($item['detalles']['manoObra']) && is_array($item['detalles']['manoObra']) && count($item['detalles']['manoObra']) > 0) {
                    $totalManoObra = 0;
                    foreach ($item['detalles']['manoObra'] as $mo) {
                        if (isset($mo['parcial'])) {
                            $totalManoObra += $mo['parcial'];
                        }
                    }
                    $fila['4'] = $totalManoObra;
                    //$fila['tiene_mano_obra'] = true;
                }
            }

            $estructuraManoObra[] = $fila;

            // Procesar hijos recursivamente
            if (isset($item['_children']) && is_array($item['_children'])) {
                $this->aplanarEstructuraManoObra($item['_children'], $estructuraManoObra);
            }
        }
    }

    // ESTRUCTURA COMPLETA PARA MATERIALES
    private function aplanarEstructuraMateriales($items, &$estructuraMateriales)
    {
        foreach ($items as $item) {
            // Si tiene materiales, crear una fila por cada material
            if (isset($item['detalles']['materiales']) && is_array($item['detalles']['materiales']) && count($item['detalles']['materiales']) > 0) {

                foreach ($item['detalles']['materiales'] as $material) {
                    $fila = [
                        'id' => $item['id'] ?? null,
                        //'item' => $item['item'] ?? null,
                        '1' => ($item['descripcion'] ?? '') . ' - ' . ($material['descripcion'] ?? ''),
                        '2' => $material['und'] ?? null,
                        '3' => $material['cantidad'] ?? null,
                        //'3' => $item['cantidad'] ?? null,
                        '4' => $material['precio'] ?? null,
                        // 'parcial' => $material['parcial'] ?? null,
                        // 'observacion' => $item['observacion'] ?? null,
                        // 'subtotal' => $item['subtotal'] ?? null,
                        // 'precio_original' => $item['precio'] ?? null,
                        // 'parcial_original' => $item['parcial'] ?? null,
                        // 'rendimiento' => $item['detalles']['rendimiento'] ?? null,
                        // 'unidadMD' => $item['detalles']['unidadMD'] ?? null,
                        // 'tiene_detalles' => true,
                        // 'tiene_materiales' => true,
                        // Información específica del material
                        // 'material_id' => $material['id'] ?? null,
                        // 'material_ind' => $material['ind'] ?? null,
                        // 'material_descripcion' => $material['descripcion'] ?? null,
                        // 'material_tipoinsumo' => $material['tipoinsumo'] ?? null,
                        // 'material_recursos' => $material['recursos'] ?? null,
                        // 'id_insumo' => $material['id_insumo'] ?? null,
                        // 'tipoespecialidad' => $material['tipoespecialidad'] ?? null
                    ];

                    $estructuraMateriales[] = $fila;
                }
            } else {
                // Si no tiene materiales, crear la fila normal del ítem
                $fila = [
                    'id' => $item['id'] ?? null,
                    //'item' => $item['item'] ?? null,
                    '1' => $item['descripcion'] ?? null,
                    '2' => $item['unidad'] ?? null,
                    '3' => $item['cantidad'] ?? null,
                    '4' => $item['precio'] ?? null,
                    // 'parcial' => $item['parcial'] ?? null,
                    // 'observacion' => $item['observacion'] ?? null,
                    // 'subtotal' => $item['subtotal'] ?? null,
                    // 'precio_original' => $item['precio'] ?? null,
                    // 'parcial_original' => $item['parcial'] ?? null,
                    // 'rendimiento' => null,
                    // 'unidadMD' => null,
                    // 'tiene_detalles' => isset($item['detalles']) && is_array($item['detalles']),
                    // 'tiene_materiales' => false,
                    // Campos de material vacíos
                    // 'material_id' => null,
                    // 'material_ind' => null,
                    // 'material_descripcion' => null,
                    // 'material_tipoinsumo' => null,
                    // 'material_recursos' => null,
                    // 'id_insumo' => null,
                    // 'tipoespecialidad' => null
                ];

                // Si tiene detalles, agregar información adicional
                // if (isset($item['detalles']) && is_array($item['detalles'])) {
                //     $fila['rendimiento'] = $item['detalles']['rendimiento'] ?? null;
                //     $fila['unidadMD'] = $item['detalles']['unidadMD'] ?? null;
                // }

                $estructuraMateriales[] = $fila;
            }

            // Procesar hijos recursivamente
            if (isset($item['_children']) && is_array($item['_children'])) {
                $this->aplanarEstructuraMateriales($item['_children'], $estructuraMateriales);
            }
        }
    }

    //Anterior CARGOS
    // private function aplanarEstructuraMateriales($items, &$estructuraMateriales)
    // {
    //     foreach ($items as $item) {
    //         $fila = [
    //             'id' => $item['id'] ?? null,
    //             'item' => $item['item'] ?? null,
    //             'descripcion' => $item['descripcion'] ?? null,
    //             'unidad' => $item['unidad'] ?? null,
    //             'cantidad' => $item['cantidad'] ?? null,
    //             'observacion' => $item['observacion'] ?? null,
    //             'subtotal' => $item['subtotal'] ?? null,
    //             'precio_original' => $item['precio'] ?? null,
    //             'parcial_original' => $item['parcial'] ?? null,
    //             'rendimiento' => null,
    //             'unidadMD' => null,
    //             'precio' => 0, // Este será el precio calculado de materiales
    //             'tiene_detalles' => false,
    //             'tiene_materiales' => false
    //         ];

    //         // Si tiene detalles, procesar materiales
    //         if (isset($item['detalles']) && is_array($item['detalles'])) {
    //             $fila['tiene_detalles'] = true;
    //             $fila['rendimiento'] = $item['detalles']['rendimiento'] ?? null;
    //             $fila['unidadMD'] = $item['detalles']['unidadMD'] ?? null;

    //             // Calcular solo total Materiales
    //             if (isset($item['detalles']['materiales']) && is_array($item['detalles']['materiales']) && count($item['detalles']['materiales']) > 0) {
    //                 $totalMateriales = 0;
    //                 foreach ($item['detalles']['materiales'] as $material) {
    //                     if (isset($material['parcial'])) {
    //                         $totalMateriales += $material['parcial'];
    //                     }
    //                 }
    //                 $fila['precio'] = $totalMateriales;
    //                 $fila['tiene_materiales'] = true;
    //             }
    //         }

    //         $estructuraMateriales[] = $fila;

    //         // Procesar hijos recursivamente
    //         if (isset($item['_children']) && is_array($item['_children'])) {
    //             $this->aplanarEstructuraMateriales($item['_children'], $estructuraMateriales);
    //         }
    //     }
    // }

    // ESTRUCTURA COMPLETA PARA EQUIPOS
    private function aplanarEstructuraEquipos($items, &$estructuraEquipos)
    {
        foreach ($items as $item) {
            $fila = [
                'id' => $item['id'] ?? null,
                //'item' => $item['item'] ?? null,
                '1' => $item['descripcion'] ?? null,
                '2' => $item['unidad'] ?? null,
                '3' => $item['cantidad'] ?? null,
                // 'observacion' => $item['observacion'] ?? null,
                // 'subtotal' => $item['subtotal'] ?? null,
                // 'precio_original' => $item['precio'] ?? null,
                // 'parcial_original' => $item['parcial'] ?? null,
                // 'rendimiento' => null,
                // 'unidadMD' => null,
                '4' => 0, // Este será el precio calculado de equipos
                // 'tiene_detalles' => false,
                // 'tiene_equipos' => false
            ];

            // Si tiene detalles, procesar equipos
            if (isset($item['detalles']) && is_array($item['detalles'])) {
                $fila['tiene_detalles'] = true;
                $fila['rendimiento'] = $item['detalles']['rendimiento'] ?? null;
                $fila['unidadMD'] = $item['detalles']['unidadMD'] ?? null;

                // Calcular solo total Equipos
                if (isset($item['detalles']['equipos']) && is_array($item['detalles']['equipos']) && count($item['detalles']['equipos']) > 0) {
                    $totalEquipos = 0;
                    foreach ($item['detalles']['equipos'] as $equipo) {
                        if (isset($equipo['parcial'])) {
                            $totalEquipos += $equipo['parcial'];
                        }
                    }
                    $fila['4'] = $totalEquipos;
                    //$fila['tiene_equipos'] = true;
                }
            }

            $estructuraEquipos[] = $fila;

            // Procesar hijos recursivamente
            if (isset($item['_children']) && is_array($item['_children'])) {
                $this->aplanarEstructuraEquipos($item['_children'], $estructuraEquipos);
            }
        }
    }

    // MÉTODOS INDIVIDUALES SI LOS NECESITAS POR SEPARADO

    public function obtenerEstructuraManoObra()
    {
        $presupuestos = presupuestos::select('id', 'datapresupuestos')->get();
        $estructuraManoObra = [];

        foreach ($presupuestos as $presupuesto) {
            $dataPresupuestos = json_decode($presupuesto->datapresupuestos, true);

            if (is_array($dataPresupuestos)) {
                $this->aplanarEstructuraManoObra($dataPresupuestos, $estructuraManoObra);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $estructuraManoObra
        ]);
    }

    public function obtenerEstructuraMateriales()
    {
        $presupuestos = presupuestos::select('id', 'datapresupuestos')->get();
        $estructuraMateriales = [];

        foreach ($presupuestos as $presupuesto) {
            $dataPresupuestos = json_decode($presupuesto->datapresupuestos, true);

            if (is_array($dataPresupuestos)) {
                $this->aplanarEstructuraMateriales($dataPresupuestos, $estructuraMateriales);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $estructuraMateriales
        ]);
    }

    public function obtenerEstructuraEquipos()
    {
        $presupuestos = presupuestos::select('id', 'datapresupuestos')->get();
        $estructuraEquipos = [];

        foreach ($presupuestos as $presupuesto) {
            $dataPresupuestos = json_decode($presupuesto->datapresupuestos, true);

            if (is_array($dataPresupuestos)) {
                $this->aplanarEstructuraEquipos($dataPresupuestos, $estructuraEquipos);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $estructuraEquipos
        ]);
    }

    // MÉTODO PARA OBTENER SOLO FILAS CON PRECIOS (OPCIONAL)
    public function obtenerPresupuestoSoloConPrecios()
    {
        $presupuestos = presupuestos::select('id', 'datapresupuestos')->get();

        $manoObraConPrecio = [];
        $materialesConPrecio = [];
        $equiposConPrecio = [];

        foreach ($presupuestos as $presupuesto) {
            $dataPresupuestos = json_decode($presupuesto->datapresupuestos, true);

            if (is_array($dataPresupuestos)) {
                $estructuraManoObra = [];
                $estructuraMateriales = [];
                $estructuraEquipos = [];

                $this->aplanarEstructuraManoObra($dataPresupuestos, $estructuraManoObra);
                $this->aplanarEstructuraMateriales($dataPresupuestos, $estructuraMateriales);
                $this->aplanarEstructuraEquipos($dataPresupuestos, $estructuraEquipos);

                // Filtrar solo los que tienen precio > 0
                $manoObraConPrecio = array_merge($manoObraConPrecio, array_filter($estructuraManoObra, function ($item) {
                    return $item['precio'] > 0;
                }));

                $materialesConPrecio = array_merge($materialesConPrecio, array_filter($estructuraMateriales, function ($item) {
                    return $item['precio'] > 0;
                }));

                $equiposConPrecio = array_merge($equiposConPrecio, array_filter($estructuraEquipos, function ($item) {
                    return $item['precio'] > 0;
                }));
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'mano_de_obra_con_precio' => array_values($manoObraConPrecio),
                'materiales_con_precio' => array_values($materialesConPrecio),
                'equipos_con_precio' => array_values($equiposConPrecio)
            ]
        ]);
    }


    /**
     * Display a listing of the 
     */
    public function index()
    {
        $presupuesto = presupuestos::select(
            'id',
            'datapresupuestos',
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
    public function show(string $id)
    {
        try {
            $presupuestos = presupuestos::findOrFail($id);

            // Si es una petición AJAX, devolver JSON
            if (request()->expectsJson()) {
                // Preparar datos para el modal de edición
                $data = [
                    'totalmetrados' => $presupuestos->totalmetrados,
                    'costo_directo' => $presupuestos->costo_directo,
                    'datapresupuestos' => $presupuestos->datapresupuestos,
                    'costos_pres_id' => $presupuestos->costos_pres_id,
                    'pres_mant_id' => $presupuestos->pres_mant_id
                ];

                return response()->json($data);
            }

            // Para vista normal resource.resources/views/gestor_vista/Construyehc/presupuestos/presupuestos.blade.php
            return view('gestor_vista.Construyehc.presupuestos.presupuestos', compact('presupuestos'));
        } catch (Exception $e) {
            if (request()->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Presupuesto no encontrado'
                ], 404);
            }

            return redirect()->back()->with('error', 'Presupuesto no encontrado');
        }
    }

    // public function show(presupuestos $presupuestos, $id)
    // {
    //     $presupuesto = Presupuestos::select('id', 'datapresupuestos')->find($id);

    //     if (!$presupuesto) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Presupuesto no encontrado'
    //         ], 404);
    //     }

    //     return response()->json([
    //         'success' => true,
    //         'data' => $presupuesto
    //     ]);
    // }

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
