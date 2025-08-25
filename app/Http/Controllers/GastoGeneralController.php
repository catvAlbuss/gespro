<?php

namespace App\Http\Controllers;

use App\Models\gastoGeneral;
use App\Models\presupuestos;
use Illuminate\Http\Request;

class GastoGeneralController extends Controller
{
    public function obtenerCostoDirecto(Request $request)
    {
        try {
            // Validar si el id_presupuesto fue enviado correctamente
            $idPresupuesto = $request->input('id_presupuesto');

            // Buscar el presupuesto por su ID
            $presupuesto = presupuestos::findOrFail($idPresupuesto);

            // Retornar los datos de remuneraciones
            // Asumiendo que tienes un campo "remuneraciones" que contiene los datos que necesitas
            $costo_directo = $presupuesto->costo_directo;

            return response()->json([
                'status' => 'success',
                'costo_directo' => $costo_directo
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

    public function getDataTotalMetrados(Request $request)
    {
        try {
            // Validar si el id_presupuesto fue enviado correctamente
            $idPresupuesto = $request->input('id_presupuesto');

            // Buscar el presupuesto por su ID
            $presupuesto = presupuestos::findOrFail($idPresupuesto);

            // Retornar los datos de remuneraciones
            // Asumiendo que tienes un campo "remuneraciones" que contiene los datos que necesitas
            $totalmetrados = $presupuesto->totalmetrados;

            return response()->json([
                'status' => 'success',
                'totalmetrados' => $totalmetrados
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

    /**Actualizacion y Guardado de datos */
    public function guardarRemuneraciones($id, Request $request)
    {
        try {
            // Buscar el GastoGeneral usando el campo 'presupuesto_designado' que viene en el request
            $gastoGeneral = GastoGeneral::where('presupuesto_designado', $id)->firstOrFail();

            // Asumiendo que la columna remuneraciones en la base de datos es de tipo JSON o texto
            $gastoGeneral->remuneraciones = json_encode($request->input('remuneraciones')); // Guarda los datos como JSON
            $gastoGeneral->save(); // Guarda en la base de datos

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
            $idGastoGeneral = $request->input('id_presupuesto');

            // Buscar el gasto general por su ID
            $gastoGeneral = GastoGeneral::findOrFail($idGastoGeneral);
            $remuneraciones = $gastoGeneral->remuneraciones;

            return response()->json([
                'status' => 'success',
                'data' => [
                    'remuneraciones' => $remuneraciones
                ]
            ], 200);
        } catch (\Exception $e) {
            // Manejo de errores en caso de no encontrar el gasto general o cualquier otro error
            return response()->json([
                'status' => 'error',
                'message' => 'No se pudo obtener los datos de remuneración.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**Actualizacion y Guardado de Gastos fijos */
    public function guardarGastosFijos($id, Request $request)
    {
        try {
            // Buscar el GastoGeneral usando el campo 'presupuesto_designado' que viene en el request
            $gastoGeneral = GastoGeneral::where('presupuesto_designado', $id)->firstOrFail();

            // Asumiendo que la columna gastos_fijos en la base de datos es de tipo JSON o texto
            $gastoGeneral->gastos_fijos = json_encode($request->input('gastosfijos')); // Guarda los datos como JSON
            $gastoGeneral->tiempo_ejecucion = ($request->input('tiempo_ejecucion'));
            $gastoGeneral->ggf = ($request->input('ggf'));
            $gastoGeneral->ggv = ($request->input('ggv'));
            $gastoGeneral->porcentaje_fianza_adelanto_efectivo = ($request->input('porcentaje_fianza_adelanto_efectivo'));
            $gastoGeneral->porcentaje_fianza_adelanto_materiales = ($request->input('porcentaje_fianza_adelanto_materiales'));
            $gastoGeneral->porcentaje_fianza_buen_ejecucion = ($request->input('porcentaje_fianza_buen_ejecucion'));
            $gastoGeneral->save(); // Guarda en la base de datos

            return response()->json(['message' => 'Datos guardados correctamente'], 200);
        } catch (\Throwable $th) {
            // Manejo de excepciones
            return response()->json(['error' => 'No se pudo guardar los datos'], 500);
        }
    }

    public function ObtenerGastosFijos(Request $request)
    {
        try {
            // Validar si el id_presupuesto fue enviado correctamente
            $idGastoGeneral = $request->input('id_presupuesto');

            // Buscar el gasto general por su ID
            $gastoGeneral = GastoGeneral::findOrFail($idGastoGeneral);
            $gastosFijos = $gastoGeneral->gastos_fijos;
            $tiempoejecucion = $gastoGeneral->tiempo_ejecucion;
            $valggf = $gastoGeneral->ggf;
            $valggv = $gastoGeneral->ggv;
            $porcentaje_adelanto_efectivo = $gastoGeneral->porcentaje_fianza_adelanto_efectivo;
            $porcentaje_adelanto_materiales = $gastoGeneral->porcentaje_fianza_adelanto_materiales;
            $porcentaje_buen_ejecucion = $gastoGeneral->porcentaje_fianza_buen_ejecucion;

            return response()->json([
                'status' => 'success',
                'data' => [
                    'gastos_fijos' => $gastosFijos,
                    'tiempoejecucion' => $tiempoejecucion,
                    'valggf' => $valggf,
                    'valggv' => $valggv,
                    'porcentaje_fianza_adelanto_efectivo' => $porcentaje_adelanto_efectivo,
                    'porcentaje_fianza_adelanto_materiales' => $porcentaje_adelanto_materiales,
                    'porcentaje_fianza_buen_ejecucion' => $porcentaje_buen_ejecucion,
                ]
            ], 200);
        } catch (\Exception $e) {
            // Manejo de errores en caso de no encontrar el gasto general o cualquier otro error
            return response()->json([
                'status' => 'error',
                'message' => 'No se pudo obtener los datos de gastos fijos.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**Actualizaciones y guardaros Gastos Generales */
    public function guardarGastosGenerales($id, Request $request)
    {
        try {
            // Buscar el GastoGeneral usando el campo 'presupuesto_designado' que viene en el request
            $gastoGeneral = GastoGeneral::where('presupuesto_designado', $id)->firstOrFail();

            // Asumiendo que la columna remuneraciones en la base de datos es de tipo JSON o texto
            $gastoGeneral->gastos_generales = json_encode($request->input('gastos_generales')); // Guarda los datos como JSON
            $gastoGeneral->save(); // Guarda en la base de datos

            return response()->json(['message' => 'Datos guardados correctamente'], 200);
        } catch (\Throwable $th) {
            // Manejo de excepciones
            return response()->json(['error' => 'No se pudo guardar los datos'], 500);
        }
    }

    public function ObtenerGastosGenerales(Request $request)
    {
        try {
            // Validar si el id_presupuesto fue enviado correctamente
            $idGastoGeneral = $request->input('id_presupuesto');

            // Buscar el gasto general por su ID
            $gastoGeneral = GastoGeneral::findOrFail($idGastoGeneral);
            $gastos_generales = $gastoGeneral->gastos_generales;

            return response()->json([
                'status' => 'success',
                'data' => [
                    'gastos_generales' => $gastos_generales,
                ]
            ], 200);
        } catch (\Exception $e) {
            // Manejo de errores en caso de no encontrar el gasto general o cualquier otro error
            return response()->json([
                'status' => 'error',
                'message' => 'No se pudo obtener los datos de gastos fijos.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**Atualizacion y guardarnos  gastos generales */
    public function guardarGastosSupervision($id, Request $request)
    {
        try {
            // Buscar el GastoGeneral usando el campo 'presupuesto_designado' que viene en el request
            $gastoGeneral = GastoGeneral::where('presupuesto_designado', $id)->firstOrFail();

            // Asumiendo que la columna remuneraciones en la base de datos es de tipo JSON o texto
            $gastoGeneral->supervision = json_encode($request->input('gastos_supervision')); // Guarda los datos como JSON
            $gastoGeneral->save(); // Guarda en la base de datos

            return response()->json(['message' => 'Datos guardados correctamente'], 200);
        } catch (\Throwable $th) {
            // Manejo de excepciones
            return response()->json(['error' => 'No se pudo guardar los datos'], 500);
        }
    }

    public function ObtenerGastosSupervision(Request $request)
    {
        try {
            // Validar si el id_presupuesto fue enviado correctamente
            $idGastoGeneral = $request->input('id_presupuesto');

            // Buscar el gasto general por su ID
            $gastoGeneral = GastoGeneral::findOrFail($idGastoGeneral);
            $gastos_supervision = $gastoGeneral->supervision;

            return response()->json([
                'status' => 'success',
                'data' => [
                    'gastos_supervision' => $gastos_supervision,
                ]
            ], 200);
        } catch (\Exception $e) {
            // Manejo de errores en caso de no encontrar el gasto general o cualquier otro error
            return response()->json([
                'status' => 'error',
                'message' => 'No se pudo obtener los datos de gastos fijos.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**Actualizacion y guardar control concurrente */
    public function guardarControlConcurrente($id, Request $request)
    {
        try {
            // Buscar el GastoGeneral usando el campo 'presupuesto_designado' que viene en el request
            $gastoGeneral = GastoGeneral::where('presupuesto_designado', $id)->firstOrFail();

            // Asumiendo que la columna remuneraciones en la base de datos es de tipo JSON o texto
            $gastoGeneral->control_concurrente = json_encode($request->input('contro_concurrente')); // Guarda los datos como JSON
            $gastoGeneral->save(); // Guarda en la base de datos

            return response()->json(['message' => 'Datos guardados correctamente'], 200);
        } catch (\Throwable $th) {
            // Manejo de excepciones
            return response()->json(['error' => 'No se pudo guardar los datos'], 500);
        }
    }

    public function ObtenerControlConcurrente(Request $request)
    {
        try {
            // Validar si el id_presupuesto fue enviado correctamente
            $idGastoGeneral = $request->input('id_presupuesto');

            // Buscar el gasto general por su ID
            $gastoGeneral = GastoGeneral::findOrFail($idGastoGeneral);
            $control_concurrente = $gastoGeneral->control_concurrente;

            return response()->json([
                'status' => 'success',
                'data' => [
                    'control_concurrente' => $control_concurrente,
                ]
            ], 200);
        } catch (\Exception $e) {
            // Manejo de errores en caso de no encontrar el gasto general o cualquier otro error
            return response()->json([
                'status' => 'error',
                'message' => 'No se pudo obtener los datos de gastos fijos.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function guardarConsolidado($id, Request $request)
    {
        try {
            // Buscar el GastoGeneral usando el campo 'presupuesto_designado' que viene en el request
            $gastoGeneral = GastoGeneral::where('presupuesto_designado', $id)->firstOrFail();

            // Asumiendo que la columna remuneraciones en la base de datos es de tipo JSON o texto
            $gastoGeneral->consolidado = json_encode($request->input('consolidado')); // Guarda los datos como JSON
            $gastoGeneral->save(); // Guarda en la base de datos

            return response()->json(['message' => 'Datos guardados correctamente'], 200);
        } catch (\Throwable $th) {
            // Manejo de excepciones
            return response()->json(['error' => 'No se pudo guardar los datos'], 500);
        }
    }

    public function ObtenerConsolidado(Request $request){
        try {
            // Validar si el id_presupuesto fue enviado correctamente
            $idGastoGeneral = $request->input('id_presupuesto');

            // Buscar el gasto general por su ID
            $gastoGeneral = GastoGeneral::findOrFail($idGastoGeneral);
            $consolidado = $gastoGeneral->consolidado;

            return response()->json([
                'status' => 'success',
                'data' => [
                    'consolidado' => $consolidado,
                ]
            ], 200);
        } catch (\Exception $e) {
            // Manejo de errores en caso de no encontrar el gasto general o cualquier otro error
            return response()->json([
                'status' => 'error',
                'message' => 'No se pudo obtener los datos de gastos fijos.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
