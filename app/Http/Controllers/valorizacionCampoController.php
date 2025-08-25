<?php

namespace App\Http\Controllers;

use App\Models\valorizacionCampo;
use Illuminate\Http\Request;

class valorizacionCampoController extends Controller
{
    public function rederigircampoval(string $empresaId)
    {
        // Obtener solo los registros con las columnas específicas que necesitas
        $valorizaciones = valorizacionCampo::select('id_valorizacion', 'obra_valo', 'contratista_valo', 'plazo_valo', 'fecha_inicio_valo')->get();

        // Pasar los datos a la vista
        return view('gestor_vista.Campo.Panel_valorizacion', [
            'empresaId' => $empresaId,
            'valorizaciones' => $valorizaciones, // Enviar los registros a la vista
        ]);
    }

    // public function show(string $id)
    // {
    //     $valorizaciones = valorizacionCampo::findOrFail($id);
    //     return view('gestor_vista.Campo.Gestor_valorizacion', [
    //         'valorizaciones' => $valorizaciones,
    //         'id_valorizacion' => $id,
    //     ]);
    // }

    public function show(string $id)
    {
        $valorizaciones = valorizacionCampo::findOrFail($id);
        return view('gestor_vista.Campo.Gestor_valorizacion', [
            'valorizaciones' => $valorizaciones,
            'id_valorizacion' => $id,
        ]);
    }


    public function store(Request $request)
    {
        // Validación de los datos recibidos desde el formulario
        $validatedData = $request->validate([
            'obra_valo' => 'required|string|max:255',
            'contratista_valo' => 'required|string|max:255',
            'plazo_valo' => 'required|integer|min:1',
            'fecha_inicio_valo' => 'required|date',
        ]);
        $empresaId = $request->input('empresaId');
        // Rellenar los datos en el modelo y asignar valores
        $valorizacion = new ValorizacionCampo();
        $valorizacion->fill([
            'obra_valo' => $validatedData['obra_valo'],
            'contratista_valo' => $validatedData['contratista_valo'],
            'plazo_valo' => $validatedData['plazo_valo'],
            'fecha_inicio_valo' => $validatedData['fecha_inicio_valo'],
            'estructuras_valo' => $validatedData['estructuras_valo'] ?? null, // Asigna null si no llega
            'inst_sanitarias_valo' => $validatedData['inst_sanitarias_valo'] ?? null,
            'inst_electricas_valo' => $validatedData['inst_electricas_valo'] ?? null,
            'data_valorizacion' => $validatedData['data_valorizacion'] ?? null,
            'contrato_n_valo' => $validatedData['contrato_n_valo'] ?? null,
            'modalidad_valo' => $validatedData['modalidad_valo'] ?? null,
            'adelanto_directo_valo' => $validatedData['adelanto_directo_valo'] ?? null,
            'adelanto_directo_fecha_valo' => $validatedData['adelanto_directo_fecha_valo'] ?? null,
            'distrito_valo' => $validatedData['distrito_valo'] ?? null,
            'provincia_valo' => $validatedData['provincia_valo'] ?? null,
            'compras_valo' => $validatedData['compras_valo'] ?? null,
        ]);

        // Guardar la valorización en la base de datos
        $valorizacion->save();

        // Redirigir o retornar respuesta
        return redirect()->route('valorizacionCampo.rederigircampoval', ['empresaId' => $empresaId])->with('success', 'Valorización Creado correctamente.');
    }

    public function edit(string $id)
    {
        $valorizaciones = valorizacionCampo::findOrFail($id);
        return response()->json($valorizaciones);
    }

    public function update(Request $request, string $id)
    {
        // Validación de los datos entrantes
        $validatedData = $request->validate([
            'obra_valo' => 'required|string|max:255',
            'contratista_valo' => 'required|string|max:255',
            'plazo_valo' => 'required|integer|min:1',
            'fecha_inicio_valo' => 'required|date',
            'empresaId' => 'required|integer',
        ]);
        $empresaId = $request->input('empresaId');
        //Buscar la valorización por su ID
        $valorizacion = ValorizacionCampo::findOrFail($id);

        //Actualizar los campos del modelo
        $valorizacion->update([
            'obra_valo' => $validatedData['obra_valo'],
            'contratista_valo' => $validatedData['contratista_valo'],
            'plazo_valo' => $validatedData['plazo_valo'],
            'fecha_inicio_valo' => $validatedData['fecha_inicio_valo'],
        ]);

        // Redirigir al usuario a la página de listado con un mensaje de éxito
        return redirect()->route('valorizacionCampo.rederigircampoval', ['empresaId' => $empresaId])->with('success', 'Valorización actualizada correctamente.');
    }

    public function destroy(Request $request, string $id)
    {
        $empresaId = $request->input('empresaId');
        // Encuentra el valorizacion por ID
        $valorizacion = valorizacionCampo::findOrFail($id);

        // Elimina la valorizacion
        $valorizacion->delete();

        // Redirigir con un mensaje de éxito
        return redirect()->route('valorizacionCampo.rederigircampoval', ['empresaId' => $empresaId]) // Ajusta esta ruta según sea necesario
            ->with('success', 'Valorizacion eliminado exitosamente.');
    }
    
     public function actualizarvalorizaciones(Request $request)
    {
        // Validar los datos
        $validatedData = $request->validate([
            'id_valorizacion' => 'required|exists:valorizacion_campos,id_valorizacion',
            'data_valorizacion' => 'required|json',
            'compras_valo' => 'required|numeric',  // Cambiado a numeric
            'obra_valo' => 'required|string|max:255',  // Asegurar que el campo 'obra' esté presente
            'contratista_valo' => 'required|string|max:255',
            'plazo_valo' => 'required|integer',
            'fecha_inicio_valo' => 'required|date',
            'estructuras_valo' => 'nullable|numeric', // Cambiado a numeric
            'inst_sanitarias_valo' => 'nullable|numeric', // Cambiado a numeric
            'inst_electricas_valo' => 'nullable|numeric', // Cambiado a numeric
        ]);
        // Buscar el registro de valorización
        $valorizacion = valorizacionCampo::find($request->id_valorizacion);

        if (!$valorizacion) {
            return response()->json([
                'message' => 'Registro no encontrado',
            ], 404);
        }

        // Intentar actualizar los datos
        try {
            $valorizacion->update([
                'obra_valo' => $request->obra_valo,  // Asegúrate de que este campo tenga un valor
                'contratista_valo' => $request->contratista_valo,
                'plazo_valo' => $request->plazo_valo,
                'fecha_inicio_valo' => $request->fecha_inicio_valo,
                'estructuras_valo' => $request->estructuras_valo,
                'inst_sanitarias_valo' => $request->inst_sanitarias_valo,
                'inst_electricas_valo' => $request->inst_electricas_valo,
                'compras_valo' => $request->compras_valo,
                'data_valorizacion' => $request->data_valorizacion,
            ]);

            return response()->json([
                'message' => 'success',
                'data' => $valorizacion,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar la valorización',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
