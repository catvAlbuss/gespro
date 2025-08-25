<?php

namespace App\Http\Controllers;

use App\Models\metradosanitarias;
use Illuminate\Http\Request;

class metradosanitariasController extends Controller
{
    public function index()
    {
        $metradosanitarias = metradosanitarias::select('idmetradosan', 'nombre_proyecto', 'fecha', 'especialidad', 'localidad', 'cantidadModulo')
            ->get();
        // Retornar la vista con los datos
        return view('gestor_vista.Construyehc.metradosSanitarias.index', compact('metradosanitarias'));
    }

    // Método store para almacenar los datos
    public function store(Request $request)
    {
        // Validación de los datos entrantes (opcional pero recomendable)
        $request->validate([
            'nombre_proyecto' => 'required|string|max:255',
            'entidadm' => 'required|string|max:255',
            'fecha' => 'required|date',
            'especialidad' => 'required|string|max:255',
            'cui' => 'required|numeric',
            'codigo_modular' => 'required|numeric',
            'codigo_local' => 'required|numeric',
            'cantidadModulo' => 'required|numeric',
            'localidad' => 'required|string|max:255',
            'documentosdata' => 'nullable', // Si manejas archivos
        ]);
        
        // Obtener la cantidad de módulos
        $modulocant = $request->input('cantidadModulo');

        // Estructura base del JSON
        $docdata = [
            "modulos" => [],
            "cisterna" => [],
            "exterior" => []
        ];

        // Crear los módulos dinámicamente
        for ($i = 1; $i <= $modulocant; $i++) {
            // Convertir el número de módulo a romano
            $nombreModulo = "modulo_" . $this->numeroARomano($i);

            // Estructura de cada módulo
            $modulo = [
                "nombre" => $nombreModulo,
                "datos" => [
                    [
                        "id" => 1,
                        "item" => "04",
                        "descripcion" => "INSTALACIONES SANITARIAS",
                        "totalnieto" => "0.00",
                        "children" => [
                            [
                                "id" => 2,
                                "item" => "04.01",
                                "descripcion" => "APARATOS SANITARIOS Y ACCESORIOS",
                                "totalnieto" => "0.00",
                                "children" => [
                                    [
                                        "id" => 3,
                                        "item" => "04.01.01",
                                        "descripcion" => "SUMINISTRO DE APARATOS SANITARIOS",
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

            // Agregar el módulo creado al array de módulos
            $docdata['modulos'][] = $modulo;
        }

        // Añadir sección de cisterna
        $docdata['cisterna'] = [
            [
                "id" => 1,
                "item" => "04",
                "descripcion" => "INSTALACIONES SANITARIAS",
                "totalnieto" => "0.00",
                "children" => [
                    [
                        "id" => 2,
                        "item" => "04.01",
                        "descripcion" => "APARATOS SANITARIOS Y ACCESORIOS",
                        "totalnieto" => "0.00",
                        "children" => [
                            [
                                "id" => 3,
                                "item" => "04.01.01",
                                "descripcion" => "SUMINISTRO DE APARATOS SANITARIOS",
                                "totalnieto" => "0.00",
                                "unidad" => null,
                                "elesimil" => null,
                                "longitud" => null,
                                "volumen" => null,
                                "kg" => null,
                                "unidadcalculado" => null,
                                "total" => "0.00"
                            ],
                            [
                                "id" => 11,
                                "item" => "04.01.02",
                                "descripcion" => "SUMINISTRO DE ACCESORIOS",
                                "totalnieto" => "0.00",
                                "unidad" => null,
                                "elesimil" => null,
                                "longitud" => null,
                                "volumen" => null,
                                "kg" => null,
                                "unidadcalculado" => null,
                                "total" => "0.00"
                            ]
                        ]
                    ]
                ]
            ]
        ];

        // Añadir sección de exterior
        $docdata['exterior'] = [
            [
                "id" => 1,
                "item" => "04",
                "descripcion" => "INSTALACIONES SANITARIAS",
                "children" => [
                    [
                        "id" => 2,
                        "item" => "04.01",
                        "descripcion" => "APARATOS SANITARIOS Y ACCESORIOS",
                        "children" => [
                            [
                                "id" => 3,
                                "item" => "04.01.01",
                                "descripcion" => "SUMINISTRO DE APARATOS SANITARIOS",
                                "unidad" => null,
                                "elesimil" => null,
                                "longitud" => null,
                                "volumen" => null,
                                "kg" => null,
                                "unidadcalculado" => null,
                                "totalnieto" => "0.00",
                                "total" => "0.00"
                            ]
                        ]
                    ]
                ]
            ]
        ];

        // Convertir el array a JSON para almacenarlo o devolverlo en una respuesta
        $docdataJson = json_encode($docdata);

        // Almacenar los datos en la base de datos
        $metradosanitarias = new metradosanitarias([
            'nombre_proyecto' => $request->input('nombre_proyecto'),
            'entidadm' => $request->input('entidadm'),
            'fecha' => $request->input('fecha'),
            'especialidad' => $request->input('especialidad'),
            'cui' => $request->input('cui'),
            'codigo_modular' => $request->input('codigo_modular'),
            'codigo_local' => $request->input('codigo_local'),
            'cantidadModulo' => $modulocant,
            'localidad' => $request->input('localidad'),
            'documentosdata' => $docdataJson,  // Almacenamos el JSON generado
        ]);

        $metradosanitarias->save();

        // Redirigir al usuario con un mensaje de éxito
        return redirect()->route('metradosanitarias.index')->with('success', 'Metrado sanitario registrado exitosamente!');
    }

    // Función para convertir un número a su equivalente en números romanos
    private function numeroARomano($numero)
    {
        $numerosRomanos = [
            1   => 'I',
            4   => 'IV',
            5   => 'V',
            9   => 'IX',
            10  => 'X',
            40  => 'XL',
            50  => 'L',
            90  => 'XC',
            100 => 'C',
            400 => 'CD',
            500 => 'D',
            900 => 'CM',
            1000 => 'M'
        ];
        $resultado = '';
        foreach (array_reverse($numerosRomanos, true) as $valor => $romano) {
            while ($numero >= $valor) {
                $resultado .= $romano;
                $numero -= $valor;
            }
        }
        return $resultado;
    }

    public function show($id)
    {
        // Obtener el metrado sanitario por su ID
        $metradosanitarias = metradosanitarias::findOrFail($id);

        // Retornar la vista con el dato del metrado
        return view('gestor_vista.Construyehc.metradosSanitarias.show', compact('metradosanitarias'));
    }

    public function edit(string $id)
    {
        $metrado = metradosanitarias::findOrFail($id);
        return view('gestor_vista.Construyehc.metradosSanitarias.edit', compact('metrado'));
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
            'cantidadModulo' => 'required|numeric',
        ]);

        $metrado = metradosanitarias::findOrFail($id);
        $metrado->update($request->all());

        return redirect()->route('metradosanitarias.index')->with('success', 'Metrado eléctrico actualizado correctamente.');
    }

    public function destroy(string $id)
    {
        // Encuentra el registro que deseas eliminar
        $metrado = metradosanitarias::findOrFail($id);  // Encuentra el registro usando el ID

        // Eliminar el registro
        $metrado->delete();

        // Redirigir con un mensaje de éxito
        return redirect()->route('metradosanitarias.index')->with('success', 'Registro eliminado exitosamente');
    }

    public function actualizar_data(Request $request)
    {
        // Validar los datos de entrada
        $request->validate([
            'modulos' => 'required|array',
            'cisterna' => 'required|array',
            'exterior' => 'required|array',
        ]);

        // Preparar los datos para la columna `documentosdata`
        $data = [
            'modulos' => $request->modulos,
            'cisterna' => $request->cisterna,
            'exterior' => $request->exterior,
        ];
        
        $resumendata = [
            'resumensa' => $request->resumensa,
        ];
        
        // Convertir los datos en formato JSON
        $documentosData = json_encode($data);
        $resumenData = json_encode($resumendata);

        // Actualizar la columna `documentosdata` en la tabla `metradosanitarias`
        $metradosanitarias = metradosanitarias::first(); // Obtener el primer registro (o ajustar la lógica según sea necesario)
        if ($metradosanitarias) {
            $metradosanitarias->documentosdata = $documentosData;
            $metradosanitarias->resumenmetrados = $resumenData;
            $metradosanitarias->save();
            return response()->json(['message' => 'Data updated successfully'], 200);
        }

        return response()->json(['message' => 'Record not found'], 404);
    }
}
