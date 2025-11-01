<?php

namespace App\Http\Controllers;

use App\Models\metradoarquitectura;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MetradoarquitecturaController extends Controller
{
    //

    public function show(string $id)
    {
        try {
            $metradoarquitectura = metradoarquitectura::findOrFail($id);

            // Si no se encuentra el registro
            if (!$metradoarquitectura) {
                if (request()->expectsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Metrado no encontrado',
                    ], 404);
                }

                return redirect()->back()->with('error', 'Metrado no encontrado');
            }

            // ✅ Obtener los datos de costos asociados (solo el id del metrado + campos de costos)
            $costos = DB::table('costos AS c')
                ->join('costos_metrados AS cm', 'c.id', '=', 'cm.costos_id')
                ->join('metradoarquitectura AS m', 'm.id_arquitectura', '=', 'cm.m_arq_id')
                ->select(
                    'm.id_arquitectura',
                    'c.name',
                    'c.codigouei',
                    'c.codigosnip',
                    'c.codigocui',
                    'c.unidad_ejecutora',
                    'c.codigolocal',
                    'c.codigomodular',
                    'c.fecha',
                    'c.region',
                    'c.provincia',
                    'c.distrito',
                    'c.centropoblado'
                )
                ->where('m.id_arquitectura', $id)
                ->first();

            $data = [
                'id' => $metradoarquitectura->id_arquitectura,
                'especialidad' => $metradoarquitectura->especialidad,
                'documentosdata' => json_decode($metradoarquitectura->documentosdata ?? '[]', true),
                'resumenmetrados' => json_decode($metradoarquitectura->resumenmetrados ?? '[]', true),
            ];

            // ✅ Si la petición viene desde React/AJAX → devolver JSON
            if (request()->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'metrado' => $data,
                        'costos' => $costos,
                    ],
                ]);
            }

            // Para vista normal
            return view('gestor_vista.Construyehc.metradosArquitectura.show', compact('metradoarquitectura', 'costos'));
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

    public function actualizar_data_arquitectura(Request $request)
    {
        // Validar los datos de entrada
        $request->validate([
            'id' => 'required|integer', // Validar que el ID es un entero
            'modulos' => 'required|array',
            'resumencm' => 'required|array'
        ]);

        // Obtener el ID de 'metrado' y los 'modulos' enviados en la solicitud
        $id = $request->id;

        // Buscar el registro correspondiente al 'id' recibido
        $metrado = metradoarquitectura::find($id);

        if ($metrado) {
            $metrado->documentosdata = json_encode(['modulos' => $request['modulos']]);
            $metrado->resumenmetrados = json_encode(['resumencm' => $request['resumencm']]);
            $metrado->save(); // Guardar los cambios

            // Responder con un mensaje de éxito
            return response()->json(['message' => 'Datos actualizados correctamente'], 200);
        } else {
            // Si no se encuentra el 'metrado', responder con un mensaje de error
            return response()->json(['message' => 'Registro no encontrado'], 404);
        }
    }
}
