<?php

namespace App\Http\Controllers;

use App\Models\Contabilidad;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;

class ContabilidadController extends Controller
{

    public function redirectWithData($id)
    {
        $contabilidad = Contabilidad::findOrFail($id);

        // Almacenar los datos en la sesión
        Session::put('nombre', $contabilidad->nombre_balance);
        Session::put('montoInicial', $contabilidad->montoInicial);
        Session::put('documentos_cont', $contabilidad->documentos_cont);
        Session::put('balance_programado', $contabilidad->balance_programado);

        return redirect()->route('gestorbalance', ['id' => $id]);
    }

    public function index($empresaId)
    {
        Carbon::setLocale('es');
        date_default_timezone_set('America/Lima');

        $contabilidads = Contabilidad::where('empresa_id', $empresaId)->get();

        foreach ($contabilidads as $contabilidad) {
            $contabilidad->fecha_ingreso_doc = Carbon::parse($contabilidad->fecha_ingreso_doc)->translatedFormat('l jS \\de F Y');
        }

        return view('gestor_vista.Administrador.Gestor_adm_balance', compact('contabilidads', 'empresaId'));
    }


    public function show($id)
    {
        // Buscar el registro de contabilidad
        $contabilidad = Contabilidad::findOrFail($id);

        // Obtener el ID de la empresa
        $empresaId = $contabilidad->empresa_id;

        // Redirigir a la vista con los datos cargados
        return view('gestor_vista.Administrador.Gestor_balance', compact('contabilidad', 'empresaId'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre_balance' => 'required|string|max:100',
            'descripcion' => 'required|string',
            'montoInicial' => 'required|numeric|regex:/^\d+(\.\d{1,2})?$/',
            'documentos_cont' => 'required|string',
            'balance_programado' => 'required|string',
            'fecha_ingreso_doc' => 'required|date',
            'empresa_id' => 'required|integer',
        ]);
        $empresa_id = $request->empresa_id;

        try {
            $data = $request->all();
            Contabilidad::create($data);
            return redirect()->route('contabilidad.balances', ['empresaId' => $request->empresa_id])
                ->with('success', 'Contabilidad creada exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('contabilidad.balances', ['empresaId' => $request->empresa_id])
                ->with('error', 'Error al crear la Contabilidad.');
        }
    }

    public function edit(Contabilidad $contabilidad)
    {
        $contabilidads = Contabilidad::where('empresa_id', $contabilidad->empresa_id)->get();
        return view('gestor_vista.Administrador.Gestor_adm_balance', compact('contabilidads', 'contabilidad'));
    }

    public function update(Request $request, Contabilidad $contabilidad)
    {
        $request->validate([
            'nombre_balance' => 'required|string|max:100',
            'descripcion' => 'required|string',
            'montoInicial' => 'required|numeric|regex:/^\d+(\.\d{1,2})?$/',
            'fecha_ingreso_doc' => 'required|date',
            'empresa_id' => 'required|integer',
        ]);

        try {
            $contabilidad->update($request->all());

            return redirect()->route('contabilidad.balances', ['empresaId' => $request->empresa_id])
                ->with('success', 'Contabilidad actualizada exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('contabilidad.balances', ['empresaId' => $request->empresa_id])
                ->with('error', 'Error al actualizar la Contabilidad.');
        }
    }

    public function destroy(Contabilidad $contabilidad)
    {
        $empresaId = $contabilidad->empresa_id;
        $contabilidad->delete();

        return redirect()->route('contabilidad.balances', ['empresaId' => $empresaId])
            ->with('success', 'balances eliminada exitosamente.');
    }

    /*public function updatebalancereal(Request $request)
    {
        try {
            // Validar solo los campos necesarios
            $validator = Validator::make($request->all(), [
                'id_contabilidad' => 'required|exists:contabilidads,id',
                'rowData' => 'required|json'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Buscar y actualizar el registro
            $contabilidad = Contabilidad::findOrFail($request->id_contabilidad);
            $contabilidad->documentos_cont = $request->rowData;
            $contabilidad->save();


            return response()->json([
                'status' => 'success',
                'message' => 'Los datos se guardaron correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error interno del servidor'
            ], 500);
        }
    }*/
    public function updatebalancereal(Request $request)
    {
        try {
            // Validar los datos
            $request->validate([
                'id_contabilidad' => 'required|integer',  // Verifica que id_contabilidad es un entero
                'rowData' => 'required|string',           // Verifica que rowData sea una cadena JSON
            ]);

            // Obtener los datos del request
            $idContabilidad = $request->id_contabilidad;
            $databalance = $request->rowData;

            // Buscar y actualizar el registro
            $contabilidad = Contabilidad::findOrFail($idContabilidad);
            $contabilidad->documentos_cont = $databalance; // Guardar como JSON
            $contabilidad->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Los datos se guardaron correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error interno del servidor: ' . $e->getMessage() // Devuelve el error real
            ], 500);
        }
    }

    public function obtenerBalance(Request $request)
    {
        try {
            // Validar que el ID de contabilidad fue enviado
            $request->validate([
                'id_contabilidad' => 'required|integer'
            ]);

            // Buscar el registro de contabilidad por ID
            $contabilidad = Contabilidad::findOrFail($request->id_contabilidad);

            // Decodificar documentos_cont (de JSON a array)
            $documentos = json_decode($contabilidad->documentos_cont, true);

            return response()->json([
                'status' => 'success',
                'data' => $documentos
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener los datos: ' . $e->getMessage()
            ], 500);
        }
    }

    //obtener balances
    public function listarBalancesFinan(Request $request)
    {
        $request->validate([
            'nombre_balance' => 'required|string'
        ]);

        // Buscar por nombre_balance
        $balance = Contabilidad::where('nombre_balance', $request->nombre_balance)->firstOrFail();

        // Decodificar JSON documentos_cont
        $docs = json_decode($balance->documentos_cont, true);

        // Buscar ingresos de financiamiento
        $ingresosFin = $this->buscarNodoPorNombre($docs['ingresos'] ?? [], "INGRESOS DE FINANCIAMIENTO");

        // Buscar gastos de financiamiento
        $gastosFin = $this->buscarNodoPorNombre($docs['gastos'] ?? [], "Gastos de financiamiento");

        return response()->json([
            'id' => $balance->id,
            'nombre_balance' => $balance->nombre_balance,
            'ingresos_financiamiento' => $ingresosFin,
            'gastos_financiamiento' => $gastosFin,
        ]);
    }


    private function buscarNodoPorNombre($nodos, $nombre)
    {
        foreach ($nodos as $nodo) {
            if (($nodo['datos_bal'] ?? null) === $nombre) {
                return $nodo; // encontramos el nodo que buscamos
            }

            if (!empty($nodo['children'])) {
                $resultado = $this->buscarNodoPorNombre($nodo['children'], $nombre);
                if ($resultado) {
                    return $resultado;
                }
            }
        }
        return null; // si no encontró nada
    }


    //balance programado
    public function updatebalanceprogramado(Request $request)
    {
        try {
            // Validar los datos recibidos
            $validator = Validator::make($request->all(), [
                'id_contabilidad' => 'required|integer',
                'rowDatapro' => 'required|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }
            $idContabilidad = $request->id_contabilidad;
            $databalancepro = $request->rowDatapro;
            // Buscar y actualizar el registro
            $contabilidad = Contabilidad::findOrFail($idContabilidad);
            $contabilidad->balance_programado = $databalancepro;
            $contabilidad->save();

            return response()->json([
                'status' => 'success',
                'message' => 'El balance programado se guardó correctamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error interno del servidor'
            ], 500);
        }
    }

    public function obtenerBalanceProgramado(Request $request)
    {
        try {
            // Validar que el ID de contabilidad fue enviado
            $request->validate([
                'id_contabilidad' => 'required|integer'
            ]);

            // Buscar el registro de contabilidad por ID
            $contabilidad = Contabilidad::findOrFail($request->id_contabilidad);

            // Decodificar documentos_cont (de JSON a array)
            $documentos = json_decode($contabilidad->balance_programado, true);

            return response()->json([
                'status' => 'success',
                'data' => $documentos
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener los datos: ' . $e->getMessage()
            ], 500);
        }
    }


    /******************************************************* */
    /*              RESUMEN DE BALANCES PROGRAMADO REAL      */
    /******************************************************* */

    private function unirBalances(array $planificado, array $real): array
    {
        $resultado = [];

        // Indexar real por nombre (datos_bal) o id si es necesario
        $realIndex = [];
        foreach ($real as $item) {
            $key = $item['datos_bal'] ?? $item['id'];
            $realIndex[$key] = $item;
        }

        // Recorremos planificado
        foreach ($planificado as $item) {
            $key = $item['datos_bal'] ?? $item['id'];

            // Buscar matching en real
            $realItem = $realIndex[$key] ?? null;

            $resultado[] = [
                // 🔥 Tomamos el nombre del que tenga texto disponible
                'concepto'     => $realItem['datos_bal']
                    ?? $item['datos_bal']
                    ?? 'SIN NOMBRE',
                'planificado'  => $item['total'] ?? 0,
                'real'         => $realItem['total'] ?? 0,
            ];

            unset($realIndex[$key]);
        }

        // Agregar los que solo están en real
        foreach ($realIndex as $item) {
            $resultado[] = [
                'concepto'     => $item['datos_bal'] ?? 'SIN NOMBRE',
                'planificado'  => 0,
                'real'         => $item['total'] ?? 0,
            ];
        }

        return $resultado;
    }

    private function extraerNietos(array $balances, string $padre, string $hijo): array
    {
        foreach ($balances as $item) {
            if (
                isset($item['datos_bal']) &&
                $item['datos_bal'] === $padre &&
                !empty($item['children'])
            ) {
                foreach ($item['children'] as $child) {
                    if (
                        isset($child['datos_bal']) &&
                        $child['datos_bal'] === $hijo &&
                        !empty($child['children'])
                    ) {
                        return array_map(function ($nieto) {
                            return [
                                'id' => $nieto['id'] ?? null,
                                'datos_bal' => $nieto['datos_bal'] ?? '',
                                'total' => $nieto['total'] ?? 0,
                            ];
                        }, $child['children']);
                    }
                }
            }
        }

        return [];
    }

    public function getResumBalances(Request $request)
    {
        try {
            $validated = $request->validate([
                'id_contabilidad' => 'required|integer|exists:contabilidads,id',
            ]);

            $contabilidad = Contabilidad::find($validated['id_contabilidad']);
            if (!$contabilidad) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'No se encontró el balance solicitado.'
                ], 404);
            }

            // Cargar JSONs
            $programadoJson = json_decode($contabilidad->balance_programado ?? '{}', true);
            $realJson       = json_decode($contabilidad->documentos_cont ?? '{}', true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Error al decodificar JSON.'
                ], 500);
            }

            // Extraer nietos de ingresos y gastos en ambos JSONs
            $planIngresos = $this->extraerNietos($programadoJson['ingresos'] ?? [], 'INGRESOS TOTALES', 'INGRESOS GENERALES');
            $realIngresos = $this->extraerNietos($realJson['ingresos'] ?? [], 'INGRESOS TOTALES', 'INGRESOS GENERALES');

            $planGastos = $this->extraerNietos($programadoJson['gastos'] ?? [], 'GASTOS TOTALES', 'Gastos operativos');
            $realGastos = $this->extraerNietos($realJson['gastos'] ?? [], 'GASTOS TOTALES', 'Gastos operativos');

            // Unir resultados
            $ingresosTabla = $this->unirBalances($planIngresos, $realIngresos);
            $gastosTabla   = $this->unirBalances($planGastos, $realGastos);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'ingresos' => $ingresosTabla,
                    'gastos'   => $gastosTabla,
                ]
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validación fallida',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error al obtener los datos: ' . $e->getMessage()
            ], 500);
        }
    }
}
