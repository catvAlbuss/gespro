<?php

namespace App\Http\Controllers;

use App\Models\metradoarquitectura;
use Exception;
use Illuminate\Http\Request;

class MetradoarquitecturaController extends Controller
{
    //

    public function show(string $id)
    {
        try {
            $metradoarquitectura = metradoarquitectura::findOrFail($id);

            // Si es una petición AJAX, devolver JSON
            if (request()->expectsJson()) {
                // Preparar datos para el modal de edición
                $data = [
                    'especialidad' => $metradoarquitectura->especialidad,
                    'documentosdata' => $metradoarquitectura->documentosdata,
                    'resumenmetrados' => $metradoarquitectura->resumenmetrados,
                ];

                return response()->json($data);
            }

            // Para vista normal
            return view('gestor_vista.Construyehc.metradosArquitectura.show', compact('metradoarquitectura'));
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
}
