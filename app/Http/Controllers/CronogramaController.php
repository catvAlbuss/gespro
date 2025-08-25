<?php

namespace App\Http\Controllers;

use App\Models\Cronograma;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Throwable;

class CronogramaController extends Controller
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
    public function show(Cronograma $cronograma)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Cronograma $cronograma)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Cronograma $cronograma)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Cronograma $cronograma)
    {
        //
    }


    //almacenamiento de datacronogramas 

    public function obtenerCronogramaGantt(Request $request)
    {
        try {
            // Encuentra el modelo Cronograma por el ID.
            // Asumimos que el ID del cronograma es el mismo que el ID del presupuesto.
            $cronograma = Cronograma::findOrFail($request->id);

            // Retorna una respuesta JSON con los datos del cronograma
            return response()->json(['message' => 'Cronograma encontrado', 'cronograma' => $cronograma], 200);
        } catch (Throwable $e) {
            return response()->json(['message' => 'Error al obtener el cronograma', 'error' => $e->getMessage()], 500);
        }
    }
    public function saveDataCronograma($id, Request $request)
    {
        try {
            // Encuentra el modelo Cronograma por el ID.
            // Asumimos que el ID del cronograma es el mismo que el ID del presupuesto.
            $cronograma = Cronograma::findOrFail($id); // Corrected typo

            // Obtiene la cadena JSON de los datos del cronograma del cuerpo de la solicitud.
            // El nombre del campo es 'datacronograma' como se envió desde JS.
            $ganttDataJsonString = $request->input('datacronograma');

            // Valida si se recibieron los datos
            if (is_null($ganttDataJsonString)) {
                return response()->json(['message' => 'Datos del cronograma no recibidos'], 400);
            }

            // Asigna la cadena JSON directamente a la columna datacronograma (longText)
            $cronograma->datacronograma = $ganttDataJsonString;

            // Guarda los cambios en la base de datos
            $cronograma->save();

            // Retorna una respuesta JSON de éxito
            return response()->json(['message' => 'Cronograma guardado exitosamente', 'cronograma' => $cronograma], 200);
        } catch (Throwable $e) {
            return response()->json(['message' => 'Error al guardar el cronograma', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Exportar pdf
     */
    public function exportarGanttPDF(Request $request)
    {
        $tareas = $request->input('tareas', []);
        $imagen = $request->input('imagen');
        $titulo = $request->input('titulo', 'Diagrama Gantt');
    
        $pdf = Pdf::loadView('gestor_vista/Construyehc/diagramaGantt/exportarpdf', compact('tareas', 'imagen', 'titulo'))
            ->setPaper('a4', 'landscape');
    
        return $pdf->download('diagrama_gantt.pdf');
    }
}
