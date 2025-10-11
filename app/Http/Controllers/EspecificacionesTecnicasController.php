<?php

namespace App\Http\Controllers;

use App\Models\especificacionesTecnicas;
use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EspecificacionesTecnicasController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
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
    public function show(String $id)
    {
        //gestor_vista.Construyehc.ettp.index
        try {
            $especificacionesTecnicas = especificacionesTecnicas::findOrFail($id);

            // Si es una petición AJAX, devolver JSON
            if (request()->expectsJson()) {
                // Preparar datos para el modal de edición
                $data = [
                    'datosEspecificacionTecnica' => $especificacionesTecnicas->datosEspecificacionTecnica,
                    'costos_ettp_id' => $especificacionesTecnicas->costos_ettp_id,
                ];

                return response()->json($data);
            }

            return view('gestor_vista.Construyehc.ettp.index', compact('especificacionesTecnicas'));
        } catch (Exception $e) {
            if (request()->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'ETTP no encontrado'
                ], 404);
            }

            return redirect()->back()->with('error', 'ETTP no encontrado');
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(especificacionesTecnicas $especificacionesTecnicas)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, especificacionesTecnicas $especificacionesTecnicas)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(especificacionesTecnicas $especificacionesTecnicas)
    {
        //
    }

    /**
     * get ETTP.
     */
    public function getDataETTP(Request $request)
    {
        try {
            $id = $request->input('id');
            if (!$id) {
                return response()->json(['error' => 'ID no proporcionado'], 400);
            }

            $ettp = especificacionesTecnicas::findOrFail($id);

            // Decodificamos el JSON almacenado en la base de datos
            $datosEspecificacionTecnica = json_decode($ettp->datosEspecificacionTecnica, true);

            return response()->json(['data' => $datosEspecificacionTecnica], 200);
        } catch (\Throwable $th) {
            return response()->json(['error' => 'No se pudo obtener los datos'], 500);
        }
    }
    /**
     * Update ETTP.
     */
    public function updateETTP($id, Request $request)
    {
        try {

            $ettp = especificacionesTecnicas::findOrFail($id);

            // Asumiendo que la columna remuneraciones en la base de datos es de tipo JSON o texto
            $ettp->datosEspecificacionTecnica = json_encode($request->input('especificaciones_tecnicas')); // Guarda los datos como JSON
            $ettp->save(); // Guarda en la base de datos

            return response()->json(['message' => 'Datos guardados correctamente'], 200);
        } catch (\Throwable $th) {
            // Manejo de excepciones
            return response()->json(['error' => 'No se pudo guardar los datos'], 500);
        }
    }


    //OBTENER METRADOS PARA ETTP
    public function obtenerMetradosEttp(Request $request)
    {
        try {
            // Log::info($request->all());
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

            // Log::info($categorias);
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

                // Procesamos los datos manteniendo la estructura correcta
                $processedData = $this->procesarDatosMetradoEttp($data, $categoria['json_key']);

                // Verificar si hay datos procesados
                if (!empty($processedData)) {
                    $dataFound = true;

                    // Agregar categoría principal con los hijos correctos
                    $combinedData[] = [
                        'id' => Carbon::now()->timestamp,
                        'item' => $categoria['item'],
                        'descripcion' => $categoria['descripcion'],
                        'unidad' => '',
                        '_children' => $this->asignarNumeracionJerarquicaEttp($processedData, $categoria['item'])
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

    /**
     * Método para procesar los datos del metrado
     */
    private function procesarDatosMetradoEttp($data, $key)
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
                    continue;
                }

                if (empty($jsonData[$key])) {
                    continue;
                }

                // Obtenemos solo el primer nivel de elementos (evitando duplicados)
                $firstLevelItems = $jsonData[$key];

                // Si el primer elemento es la misma categoría, lo saltamos y usamos sus hijos directamente
                if (count($firstLevelItems) == 1 && isset($firstLevelItems[0]['children'])) {
                    $firstItem = $firstLevelItems[0];
                    // Verificamos si el primer elemento es un título duplicado
                    if (
                        isset($firstItem['descripcion']) &&
                        preg_match('/estructura|arquitectura|instalaciones|sanitarias|eléctricas|comunicaciones|gas/i', $firstItem['descripcion'])
                    ) {
                        // Usamos los hijos directamente como primer nivel
                        $firstLevelItems = $firstItem['children'];
                    }
                }

                // Extraer elementos que tengan datos significativos
                foreach ($firstLevelItems as $levelItem) {
                    if (!empty($levelItem) && isset($levelItem['descripcion'])) {
                        $item = [
                            'id' => $levelItem['id'] ?? 'item-' . uniqid(),
                            'descripcion' => $levelItem['descripcion'],
                            'unidad' => $levelItem['unidad'] ?? '',
                        ];

                        // Procesar hijos si existen
                        if (isset($levelItem['children']) && !empty($levelItem['children'])) {
                            $item['_children'] = $this->extractChildrenRecursiveEttp($levelItem['children']);
                        } else {
                            $item['_children'] = [];
                        }

                        $result[] = $item;
                    }
                }
            } catch (\Exception $e) {
                continue;
            }
        }

        return $result;
    }

    /**
     * Método para extraer los hijos recursivamente
     */
    private function extractChildrenRecursiveEttp($children)
    {
        $result = [];

        foreach ($children as $child) {
            if (empty($child) || !isset($child['descripcion'])) {
                continue;
            }

            $item = [
                'id' => $child['id'] ?? 'child-' . uniqid(),
                'descripcion' => $child['descripcion'],
                'unidad' => $child['unidad'] ?? '',
            ];

            // Procesar hijos si existen
            if (isset($child['children']) && !empty($child['children'])) {
                $item['_children'] = $this->extractChildrenRecursiveEttp($child['children']);
            } else {
                $item['_children'] = [];
            }

            $result[] = $item;
        }

        return $result;
    }

    /**
     * Método para asignar numeración jerárquica correcta a los elementos
     */
    private function asignarNumeracionJerarquicaEttp($items, $parentCode)
    {
        $result = [];

        foreach ($items as $index => $item) {
            $formattedIndex = str_pad($index + 1, 2, '0', STR_PAD_LEFT);
            $itemCode = $parentCode . '.' . $formattedIndex;

            $newItem = $item;
            $newItem['item'] = $itemCode;

            // Procesar hijos si existen
            if (isset($item['_children']) && !empty($item['_children'])) {
                $newItem['_children'] = $this->asignarNumeracionHijosEttp($item['_children'], $itemCode);
            }

            $result[] = $newItem;
        }

        return $result;
    }

    /**
     * Método para asignar numeración a los hijos recursivamente
     */
    private function asignarNumeracionHijosEttp($children, $parentCode)
    {
        $result = [];

        foreach ($children as $index => $child) {
            $formattedIndex = str_pad($index + 1, 2, '0', STR_PAD_LEFT);
            $childCode = $parentCode . '.' . $formattedIndex;

            $newChild = $child;
            $newChild['item'] = $childCode;

            // Procesar hijos si existen
            if (isset($child['_children']) && !empty($child['_children'])) {
                $newChild['_children'] = $this->asignarNumeracionHijosEttp($child['_children'], $childCode);
            }

            $result[] = $newChild;
        }

        return $result;
    }
}
