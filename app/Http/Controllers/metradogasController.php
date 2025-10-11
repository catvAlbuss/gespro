<?php

namespace App\Http\Controllers;

use App\Models\metradogas;
use Illuminate\Http\Request;

class metradogasController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $metradogases = metradogas::select('idmetradogas', 'especialidad')->get();
        // Retornar la vista con los datos
        return view('gestor_vista.Construyehc.metradoGas.index', compact('metradogases'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validación de los datos (puedes agregar reglas de validación según tus necesidades)
        $request->validate([
            'nombre_proyecto' => 'required|string|max:255',
            'entidadm' => 'required|integer',
            'fecha' => 'required|date',
            'especialidad' => 'required|string|max:255',
            'cui' => 'required|integer',
            'codigo_modular' => 'required|integer',
            'codigo_local' => 'required|integer',
            'modulo' => 'required|string|max:255',
            'localidad' => 'required|string|max:255',
        ]);

        $modulo = [
            "modulos" => [
                [
                    "id" => 1,
                    "item" => "07",
                    "descripcion" => "INSTALACIONES DE GAS",
                    "totalnieto" => "0.00",
                    "children" => [
                        [
                            "id" => 2,
                            "item" => "07.01",
                            "descripcion" => "TUBERÍAS",
                            "totalnieto" => "0.00",
                            "children" => [
                                [
                                    "id" => 3,
                                    "item" => "07.01.01",
                                    "descripcion" => "TUBERÍA A LA VISTA",
                                    "totalnieto" => "0.00",
                                    "unidad" => null,
                                    "elesimil" => null,
                                    "largo" => null,
                                    "ancho" => null,
                                    "alto" => null,
                                    "longitud" => null,
                                    "volumen" => null,
                                    "kg" => null,
                                    "unidadcalculado" => null,
                                    "total" => "0.00"
                                ]
                            ],
                            "unidad" => null,
                            "elesimil" => null,
                            "largo" => null,
                            "ancho" => null,
                            "alto" => null,
                            "longitud" => null,
                            "volumen" => null,
                            "kg" => null,
                            "unidadcalculado" => null,
                            "total" => "0.00"
                        ]
                    ]
                ]
            ]
        ];

        // Convertimos el array $modulo a formato JSON
        $moduloJson = json_encode($modulo);

        // Guardamos la entrada en la base de datos
        metradogas::create([
            'nombre_proyecto' => $request->input('nombre_proyecto'),
            'unidad_ejecutora' => $request->input('entidadm'),
            'fecha' => $request->input('fecha'),
            'especialidad' => $request->input('especialidad'),
            'cui' => $request->input('cui'),
            'codigo_modular' => $request->input('codigo_modular'),
            'codigo_local' => $request->input('codigo_local'),
            'modulo' => $request->input('modulo'),
            'localidad' => $request->input('localidad'),
            'documentosdata' => $moduloJson, // Guardamos el JSON en la columna 'documentosdata'
        ]);

        // Redirigimos al usuario con un mensaje de éxito
        return redirect()->route('metrado_gas.index')->with('success', 'Metrado de comunicación agregado exitosamente');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // Obtener el metrado sanitario por su ID
        $metradogases = metradogas::findOrFail($id);

        // Retornar la vista con el dato del metrado
        return view('gestor_vista.Construyehc.metradoGas.show', compact('metradogases'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function actualizar_data_gas(Request $request)
    {
        // Validar los datos de entrada
        $request->validate([
            'id' => 'required|integer', // Validar que el ID es un entero
            'modulos' => 'required|array', // Validar que 'modulos' es un arreglo
        ]);

        // Obtener el ID de 'metrado' y los 'modulos' enviados en la solicitud
        $id = $request->id;
        $modulos = $request->modulos;
        $resumengas = $request->resumengas;
        
        // Buscar el registro correspondiente al 'id' recibido
        $metrado = metradogas::find($id);

        if ($metrado) {
            // Preparar los datos para la columna 'documentosdata'
            // Puedes agregar más datos si es necesario, como en el ejemplo de 'cisterna' o 'exterior'.
            $data = [
                'modulos' => $modulos,
            ];
            
            $dataresumen = [
                'resumengas' => $resumengas,
            ];
            
            // Convertir los datos en formato JSON
            $documentosData = json_encode($data);
            $resumenData = json_encode($dataresumen);
            
            // Actualizar la columna 'documentosdata' en el registro encontrado
            $metrado->documentosdata = $documentosData;
            $metrado->resumenmetrados = $resumenData;
            $metrado->save(); // Guardar los cambios

            // Responder con un mensaje de éxito
            return response()->json(['message' => 'Datos actualizados correctamente'], 200);
        } else {
            // Si no se encuentra el 'metrado', responder con un mensaje de error
            return response()->json(['message' => 'Registro no encontrado'], 404);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
      public function edit(string $id)
    {
        $metrado = metradogas::findOrFail($id);
        return view('gestor_vista.Construyehc.metradoGas.edit', compact('metrado'));
    }

    public function update(Request $request, string $id)
    {
        $request->validate([
            'nombre_proyecto' => 'required|string|max:255',
            'cui' => 'required|integer',
            'codigo_modular' => 'required|integer',
            'codigo_local' => 'required|integer',
            'unidad_ejecutora' => 'required|string',
            'fecha' => 'required|date',
            'especialidad' => 'required|string|max:255',
            'localidad' => 'required|string|max:255',
        ]);

        $metrado = metradogas::findOrFail($id);
        $metrado->update($request->all());

        return redirect()->route('metrado_gas.index')->with('success', 'Metrado eléctrico actualizado correctamente.');
    }

    public function destroy(string $id)
    {
        // Encuentra el registro que deseas eliminar
        $metrado = metradogas::findOrFail($id);  // Encuentra el registro usando el ID

        // Eliminar el registro
        $metrado->delete();

        // Redirigir con un mensaje de éxito
        return redirect()->route('metrado_gas.index')->with('success', 'Registro eliminado exitosamente');
    }
}
