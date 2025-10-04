<?php

namespace App\Http\Controllers;

use App\Models\detallesAcu;
use App\Models\gastoGeneral;
use App\Models\indicesAcu;
use App\Models\insumosAcu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class InsumosAcuController extends Controller
{
    /******************* CRUD DE INSUMOS **********************/
    // numero de codigos unicos 02 10 6 0025
    public function codigoInsumos(Request $request)
    {
        $indiceId = $request->input('id');
        $proveedor = $request->input('proveedor');

        // Buscar el índice
        $indice = indicesAcu::find($indiceId);

        if (!$indice) {
            return response()->json(['error' => 'Índice no encontrado'], 404);
        }

        $codigoIndice = str_pad($indice->codigo, 2, '0', STR_PAD_LEFT); // Asegurar formato "02", "39", etc.
        $codigoProveedor = str_pad($proveedor, 3, '0', STR_PAD_LEFT);    // Asegurar "106", etc.

        // Buscar todos los códigos únicos que ya existen con ese índice y proveedor
        $prefijo = $codigoIndice . $codigoProveedor;

        $maxSufijo = DB::table('insumos_acus')
            ->where('id', 'like', $prefijo . '%')
            ->select(DB::raw('MAX(RIGHT(id, 4)) as max_sufijo'))
            ->first();

        // Calcular el nuevo sufijo
        $nuevoSufijo = $maxSufijo && $maxSufijo->max_sufijo
            ? str_pad(((int)$maxSufijo->max_sufijo + 1), 4, '0', STR_PAD_LEFT)
            : '0001';

        // Generar el nuevo código único
        $codigoUnicoGenerado = $prefijo . $nuevoSufijo;

        return response()->json([
            'codigo_unico' => $codigoUnicoGenerado,
            'descripcion' => $indice->descripcion,
            'codigo' => $indice->codigo,
        ]);
    }

    public function buscartipoinsumo($selectedTipoInsumo)
    {
        if (!$selectedTipoInsumo) {
            return response()->json(['message' => 'Debe proporcionar un tipo de insumo'], 400);
        }

        // Buscar insumos por tipo
        $insumostipo = insumosAcu::where('tipoinsumo', $selectedTipoInsumo)->get();

        // if ($insumostipo->isEmpty()) {
        //     return response()->json(['message' => 'No existen insumos para este tipo de insumo'], 400);
        // }

        return response()->json($insumostipo);
    }


    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $insumos = insumosAcu::with('indice')->get();
        return response()->json($insumos);
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
        $validator = Validator::make($request->all(), [
            'codigo' => 'required|string|max:255',
            'grupo_gen' => 'required|string|max:255',
            'proveedor' => 'required|string|max:255',
            'descripcion' => 'required|string|max:255',
            'tipo_insumo' => 'required|string|max:255',
            'unidad_medida' => 'required|string|max:255',
            'preciounitario' => 'required|numeric',
            'presupuesto_designado' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $insumo = insumosAcu::create([
            'codigo' => $request->codigo,
            'proveedor' => $request->proveedor,
            'descripcion' => $request->descripcion,
            'especificaciones' => $request->especificaciones,
            'tipoinsumo' => $request->tipo_insumo,
            'unidad' => $request->unidad_medida,
            'preciounitario' => $request->preciounitario,
            'habilitar' => $request->has('habilitado') ? 1 : 0,
            'grupogenerico' => $request->grupo_gen,
            'presupuesto_designado' => $request->presupuesto_designado,
        ]);

        return response()->json($insumo, 201);
    }


    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $insumo = insumosAcu::findOrFail($id);
        return response()->json($insumo);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(insumosAcu $insumosAcu)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $insumo = insumosAcu::findOrFail($id);

        $data = $request->all();

        if (empty($data)) {
            $data = $request->json()->all();
        }

        $data['unidad'] = $data['unidad_medida'] ?? null;
        $data['marca'] = ($data['marca'] === "null") ? null : $data['marca'];
        $data['especificaciones'] = ($data['especificaciones'] === "null") ? null : $data['especificaciones'];
        $data['unidad_compra'] = $data['unidad_compra'] ?? null;
        $data['ficha_tecnica'] = $data['ficha_tecnica'] ?? '-';
        $data['habilitado'] = isset($data['habilitado']) ? 1 : 0;
        unset($data['_token'], $data['_method'], $data['insumo_id']);

        $validator = Validator::make($data, [
            'codigo' => 'required|string|max:255',
            'grupo_gen' => 'required|string|max:255',
            'proveedor' => 'required|string|max:255',
            'descripcion' => 'required|string|max:255',
            'tipo_insumo' => 'required|string|max:255',
            'unidad' => 'required|string|max:255',
            'preciounitario' => 'required|numeric',
            'fecha' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $insumo->update([
            'codigo' => $data['codigo'],
            'grupo_gen' => $data['grupo_gen'],
            'proveedor' => $data['proveedor'],
            'descripcion' => $data['descripcion'],
            'marca' => $data['marca'],
            'especificaciones' => $data['especificaciones'],
            'tipo_insumo' => $data['tipo_insumo'],
            'unidad' => $data['unidad'],
            'unidad_compra' => $data['unidad_compra'],
            'preciounitario' => $data['preciounitario'],
            'fecha' => $data['fecha'],
            'ficha_tecnica' => $data['ficha_tecnica'],
            'habilitado' => $data['habilitado'],
        ]);

        // 🔁 ACTUALIZAR detalles_acus
        $nuevoPrecio = $data['preciounitario'];

        $detalles = detallesAcu::where('id_insumo', $insumo->id)->get();

        foreach ($detalles as $detalle) {
            $detalle->precio = $nuevoPrecio;
            $detalle->total = $detalle->cantidad * $nuevoPrecio;
            $detalle->save();
        }

        return response()->json([
            'message' => 'Insumo y detalles actualizados correctamente.',
            'insumo' => $insumo
        ]);
    }
    /*public function update(Request $request, $id)
    {
        $insumo = insumosAcu::findOrFail($id);

        $data = $request->all();

        // Fallback por si llega vacío pero es JSON válido
        if (empty($data)) {
            $data = $request->json()->all();
        }

        // Normalización y limpieza
        $data['unidad'] = $data['unidad_medida'] ?? null;
        $data['marca'] = ($data['marca'] === "null") ? null : $data['marca'];
        $data['especificaciones'] = ($data['especificaciones'] === "null") ? null : $data['especificaciones'];
        $data['unidad_compra'] = $data['unidad_compra'] ?? null;
        $data['ficha_tecnica'] = $data['ficha_tecnica'] ?? '-';
        $data['habilitado'] = isset($data['habilitado']) ? 1 : 0;
        unset($data['_token'], $data['_method'], $data['insumo_id']);

        $validator = Validator::make($data, [
            'codigo' => 'required|string|max:255',
            'grupo_gen' => 'required|string|max:255',
            'proveedor' => 'required|string|max:255',
            'descripcion' => 'required|string|max:255',
            'tipo_insumo' => 'required|string|max:255',
            'unidad' => 'required|string|max:255',
            'preciounitario' => 'required|numeric',
            'fecha' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $insumo->update([
            'codigo' => $data['codigo'],
            'grupo_gen' => $data['grupo_gen'],
            'proveedor' => $data['proveedor'],
            'descripcion' => $data['descripcion'],
            'marca' => $data['marca'],
            'especificaciones' => $data['especificaciones'],
            'tipo_insumo' => $data['tipo_insumo'],
            'unidad' => $data['unidad'],
            'unidad_compra' => $data['unidad_compra'],
            'preciounitario' => $data['preciounitario'],
            'fecha' => $data['fecha'],
            'ficha_tecnica' => $data['ficha_tecnica'],
            'habilitado' => $data['habilitado'],
        ]);

        return response()->json($insumo);
    }*/

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(insumosAcu $insumosAcu, $id)
    {
        $insumo = insumosAcu::findOrFail($id);
        $insumo->delete();
        return response()->json(null, 204);
    }

    /******************* CRUD DE INDICES **********************/
    // Mostrar todos los índices
    public function indexIndices()
    {
        $indices = indicesAcu::all();
        return view('gestor_vista.Construyehc.presupuestos.insumos.indice', compact('indices'));
    }

    // Guardar nuevo índice
    public function storeIndices(Request $request)
    {
        $validated = $request->validate([
            'codigo' => 'required|numeric',
            'descripcion' => 'required|string|max:255',
        ]);

        indicesAcu::create($validated);

        return redirect()->route('indices')->with('success', 'Índice creado exitosamente.');
    }

    // Actualizar un índice existente
    public function updateIndices(Request $request, $id)
    {
        $validated = $request->validate([
            'codigo' => 'required|numeric' . $id,
            'descripcion' => 'required|string|max:255',
        ]);

        $indice = indicesAcu::findOrFail($id);
        $indice->update($validated);

        return redirect()->route('indices')->with('success', 'Índice actualizado exitosamente.');
    }

    // Eliminar un índice
    public function destroyIndices($id)
    {
        $indice = indicesAcu::findOrFail($id);
        $indice->delete();

        return redirect()->route('indices')->with('success', 'Índice eliminado exitosamente.');
    }

    public function listar_indice()
    {
        $indices = indicesAcu::all();
        return response()->json($indices);
    }

    /******************* CRUD DE DETALLES **********************/
    public function getDetailsById(Request $request, $id)
    {
        // Buscar los detalles por ID
        $detalles = detallesAcu::where('idgroupdetails', $id)->get();
        // O si el ID corresponde a id_insumo:
        // $detalles = DetalleAcu::where('id_insumo', $id)->get();

        if ($detalles->isEmpty()) {
            return response()->json(['error' => 'No se encontraron detalles'], 404);
        }

        return response()->json($detalles);
    }

    public function agregardetallesAcus(Request $request)
    {
        $idgroupdetails = $request->input('idgroupdetails');
        $items = $request->input('items');

        try {
            foreach ($items as $item) {
                // Verificar si ya existe un registro con los mismos valores clave
                $existingDetail = detallesAcu::where([
                    'idgroupdetails' => $idgroupdetails,
                    'indice' => $item['indice'],
                    'descripcion' => $item['descripcion'],
                    'tipoinsumo' => $item['tipoinsumo'],
                    'id_insumo' => $item['id_insumo'],
                ])->first();

                if ($existingDetail) {
                    // Actualizar el registro existente (opcional)
                    $existingDetail->update([
                        'unidad' => $item['unidad'],
                        'recursos' => $item['recursos'],
                        'cantidad' => $item['cantidad'],
                        'precio' => $item['precio'],
                        'total' => $item['total'],
                        'presupuesto_designado' => $item['presupuesto_designado'],
                    ]);
                } else {
                    // Crear un nuevo registro
                    detallesAcu::create([
                        'indice' => $item['indice'],
                        'descripcion' => $item['descripcion'],
                        'unidad' => $item['unidad'],
                        'recursos' => $item['recursos'],
                        'cantidad' => $item['cantidad'],
                        'precio' => $item['precio'],
                        'total' => $item['total'],
                        'tipoinsumo' => $item['tipoinsumo'],
                        'id_insumo' => $item['id_insumo'],
                        'presupuesto_designado' => $item['presupuesto_designado'],
                        'idgroupdetails' => $idgroupdetails,
                        'tipoespecialidad' => $item['tipoespecialidad'],
                    ]);
                }
            }

            return response()->json(['success' => true, 'message' => 'Detalles guardados correctamente']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error al guardar detalles: ' . $e->getMessage()], 500);
        }
    }

    /******************** EXPORTAR DATOS ******************** */
    public function exportarinsumo(Request $request)
    {
        $id_presupuesto = $request->input('id_presupuesto'); // obtener el ID

        // Obtener los insumos vinculados a ese presupuesto
        $detalles = detallesAcu::where('presupuesto_designado', $id_presupuesto)->get();

        // Retornar respuesta JSON
        return response()->json([
            'message' => 'Datos exportados correctamente',
            'data' => $detalles
        ]);
    }
    public function exportartipoinsumo(Request $request)
    {
        // 1. Validamos
        $request->validate([
            'id_presupuesto'    => 'required|integer',
            'tipoespecialidad'  => ['required', 'regex:/^\d{2}$/'], // dos dígitos
        ]);

        $id   = $request->input('id_presupuesto');
        $pref = $request->input('tipoespecialidad');

        // 2. Consultamos: presupuesto_designado = $id
        //    y tipoespecialidad comienza con ese prefijo
        $detalles = detallesAcu::where('presupuesto_designado', $id)
            ->where('tipoespecialidad', 'like', "{$pref}%")
            ->get();

        // 3. Retornamos JSON
        return response()->json([
            'message' => 'Datos filtrados por especialidad correctamente',
            'data'    => $detalles,
        ]);
    }

    public function exportarGastosGenerales(Request $request)
    {
        $presupuestoId = $request->input('id_presupuesto');

        // Obtener los gastos generales filtrados por 'presupuesto_designado'
        $gastos = gastoGeneral::where('presupuesto_designado', $presupuestoId)->get();

        return response()->json([
            'success' => true,
            'data' => $gastos
        ]);
    }
}
