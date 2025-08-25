<?php

namespace App\Http\Controllers;

use App\Models\metradoelectricas;
use Illuminate\Http\Request;

class metradoelectricasController extends Controller
{
    public function index()
    {
        $metradoelectricas = metradoelectricas::select('idmeelectrica', 'nombre_proyecto', 'fecha', 'especialidad', 'localidad', 'modulo')->get();
        // Retornar la vista con los datos
        return view('gestor_vista.Construyehc.metradosElectricas.index', compact('metradoelectricas'));
    }

    public function store(Request $request)
    {
        // Validación de los datos (puedes agregar reglas de validación según tus necesidades)
        $request->validate([
            'nombre_proyecto' => 'required|string|max:255',
            'entidadm' => 'required|integer',
            'fecha' => 'required|date',
            'especialidad' => 'required|string|max:255',
            'cui' => 'required|integer',
            'codigo_modular' => 'required|string|max:255',
            'codigo_local' => 'required|integer',
            'modulo' => 'required|string|max:255',
            'localidad' => 'required|string|max:255',
        ]);

        // Estructura JSON que quieres almacenar en documentosdata
        $documentosdata = [
            "modulos" => [
                [
                    "id" => 1,
                    "item" => "05",
                    "descripcion" => "INSTALACIONES ELÉCTRICAS Y MECÁNICAS",
                    "unidad" => null,
                    "totalnieto" => "0.00",
                    "total" => "0.00",
                    "children" => [
                        [
                            "id" => 2,
                            "item" => "05.01",
                            "descripcion" => "CONEXIÓN A LA RED EXTERNA DE MEDIDORES",
                            "unidad" => null,
                            "totalnieto" => "0.00",
                            "total" => "0.00",
                            "children" => [
                                [
                                    "id" => 1736206694907,
                                    "item" => "05.01.01",
                                    "descripcion" => "Nueva Fila",
                                    "unidad" => null,
                                    "total" => "0.00",
                                    "totalnieto" => "0.00",
                                    "children" => [
                                        [
                                            "id" => 1736206922262,
                                            "item" => "05.01.01.01",
                                            "descripcion" => "Nueva Fila",
                                            "unidad" => null,
                                            "total" => "0.00",
                                            "totalnieto" => "0.00",
                                            "longitud" => null,
                                            "volumen" => null,
                                            "unidadcalculado" => null
                                        ]
                                    ],
                                    "longitud" => null,
                                    "volumen" => null,
                                    "unidadcalculado" => null
                                ]
                            ],
                            "longitud" => null,
                            "volumen" => null,
                            "unidadcalculado" => null
                        ]
                    ],
                    "longitud" => null,
                    "volumen" => null,
                    "unidadcalculado" => null
                ]
            ]
        ];


        // Crear una nueva entrada en la base de datos
        try {
            metradoelectricas::create([
                'nombre_proyecto' => $request->input('nombre_proyecto'),
                'unidad_ejecutora' => $request->input('entidadm'),
                'fecha' => $request->input('fecha'),
                'especialidad' => $request->input('especialidad'),
                'cui' => $request->input('cui'),
                'codigo_modular' => $request->input('codigo_modular'),
                'codigo_local' => $request->input('codigo_local'),
                'modulo' => $request->input('modulo'),
                'localidad' => $request->input('localidad'),
                'documentosdata' => json_encode($documentosdata), // Convertir a JSON
            ]);
        } catch (\Exception $e) {
            dd($e->getMessage());
        }

        // Redirigir al usuario o devolver una respuesta
        return redirect()->route('metradoelectricas.index')->with('success', 'Metrado de comunicación agregado exitosamente');
    }


    public function show($id)
    {
        // Obtener el metrado sanitario por su ID
        $metradoelectricas = metradoelectricas::findOrFail($id);

        // Retornar la vista con el dato del metrado
        return view('gestor_vista.Construyehc.metradosElectricas.show', compact('metradoelectricas'));
    }

    public function actualizar_data_electricas(Request $request)
    {
        // Validar los datos de entrada
        $request->validate([
            'id' => 'required|integer', // Validar que el ID es un entero
            'modulos' => 'required|array', // Validar que 'modulos' es un arreglo
        ]);

        // Obtener el ID de 'metrado' y los 'modulos' enviados en la solicitud
        $id = $request->id;
        $modulos = $request->modulos;
        $resumenel = $request->resumenel;

        // Buscar el registro correspondiente al 'id' recibido
        $metrado = metradoelectricas::find($id);

        if ($metrado) {
            // Preparar los datos para la columna 'documentosdata'
            // Puedes agregar más datos si es necesario, como en el ejemplo de 'cisterna' o 'exterior'.
            $data = [
                'modulos' => $modulos,
            ];
            
            $resumenel = [
                'resumenel' => $resumenel,
            ];
            
            // Convertir los datos en formato JSON
            $documentosData = json_encode($data);
            $resumenData = json_encode($resumenel);
            
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

    public function edit(string $id)
    {
        $metrado = metradoelectricas::findOrFail($id);
        return view('gestor_vista.Construyehc.metradosElectricas.edit', compact('metrado'));
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

        $metrado = metradoelectricas::findOrFail($id);
        $metrado->update($request->all());

        return redirect()->route('metradoelectricas.index')->with('success', 'Metrado eléctrico actualizado correctamente.');
    }

    public function destroy(string $id)
    {
        // Encuentra el registro que deseas eliminar
        $metrado = metradoelectricas::findOrFail($id);  // Encuentra el registro usando el ID

        // Eliminar el registro
        $metrado->delete();

        // Redirigir con un mensaje de éxito
        return redirect()->route('metradoelectricas.index')->with('success', 'Registro eliminado exitosamente');
    }
}
