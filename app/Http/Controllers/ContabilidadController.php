<?php

namespace App\Http\Controllers;

use App\Models\Contabilidad;
use Carbon\Carbon;
use Illuminate\Http\Request;
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

        return view('gestor_vista.Administrador.Gestor_contabilidad', compact('contabilidads', 'empresaId'));
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

        try {
            $data = $request->all();
            Contabilidad::create($data);
            return redirect()->route('gestor-contabilidad', ['empresaId' => $data['empresa_id']])
                ->with('success', 'Contabilidad creada exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('gestor-contabilidad', ['empresaId' => $request->empresa_id])
                ->with('error', 'Error al crear la Contabilidad.');
        }
    }

    public function edit(Contabilidad $contabilidad)
    {
        $contabilidads = Contabilidad::where('empresa_id', $contabilidad->empresa_id)->get();
        return view('gestor_vista.Administrador.Gestor_contabilidad', compact('contabilidads', 'contabilidad'));
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

            return redirect()->route('gestor-contabilidad', ['empresaId' => $contabilidad->empresa_id])
                ->with('success', 'Contabilidad actualizada exitosamente.');
        } catch (\Exception $e) {
            return redirect()->route('gestor-contabilidad', ['empresaId' => $request->empresa_id])
                ->with('error', 'Error al actualizar la Contabilidad.');
        }
    }

    public function destroy(Contabilidad $contabilidad)
    {
        $empresaId = $contabilidad->empresa_id;
        $contabilidad->delete();

        return redirect()->route('gestor-contabilidad', ['empresaId' => $empresaId])
            ->with('success', 'Contabilidad eliminada exitosamente.');
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
}
