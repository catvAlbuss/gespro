<?php

namespace App\Http\Controllers;

use App\Models\gestioninventario;
use App\Models\inventario;
use Carbon\Carbon;
use Illuminate\Http\Request;
use PhpOffice\PhpSpreadsheet\IOFactory;

class InventarioController extends Controller
{

    public function show($empresaId)
    {
        // Asegúrate de eliminar espacios en blanco en los nombres de las columnas
        $gestioninventarios = gestioninventario::where('empresa_designado', $empresaId)->get();

        return view('gestor_vista.Administrador.Gestor_inventarioGen', compact('gestioninventarios', 'empresaId'));
    }

    public function store(Request $request)
    {
        // Validar los datos de entrada
        $validatedData = $request->validate([
            'nombre_gest_inv' => 'required|string|max:255',
            'area_desiganda' => 'required|string|max:255',
            'empresa_id' => 'required|integer',
        ]);

        // Crear el inventario y guardar el empresa_id correctamente
        gestioninventario::create([
            'nombre_gest_inv' => $validatedData['nombre_gest_inv'],
            'area_desiganda' => $validatedData['area_desiganda'],
            'empresa_designado' => $validatedData['empresa_id'], // Asegúrate de usar el nombre correcto del campo
        ]);

        // Redirigir a la ruta deseada con un mensaje de éxito
        return redirect()->route('inventarios.principal', ['empresaId' => $validatedData['empresa_id']])
            ->with('success', 'Inventario Creado con éxito.');
    }

    public function edit($id_gestion_inv)
    {
        $gestioninventario = gestioninventario::findOrFail($id_gestion_inv);
        $empresaId = $gestioninventario->empresa_designado;
        $gestioninventarios = gestioninventario::where('empresa_designado', $gestioninventario->empresa_designado)->get();
        return view('gestor_vista.Administrador.Gestor_inventarioGen', compact('gestioninventarios', 'gestioninventario', 'empresaId'));
    }

    public function update(Request $request, $id_gestion_inv)
    {
        $validatedData = $request->validate([
            'nombre_gest_inv' => 'required|string|max:255',
            'area_desiganda' => 'required|string|max:255',
            'empresa_id' => 'required|integer',
        ]);

        try {
            $gestioninventario = gestioninventario::findOrFail($id_gestion_inv);
            $gestioninventario->update($validatedData);

            return redirect()->route('inventarios.principal', ['empresaId' => $gestioninventario->empresa_id])
                ->with('success', 'Inventario actualizado con éxito.');
        } catch (\Exception $e) {
            return redirect()->route('inventarios.principal', ['empresaId' => $request->empresa_id])
                ->with('error', 'Error al actualizar el inventario.');
        }
    }

    public function destroy(Request $request, $id_gestion_inv)
    {
        $request->validate([
            'empresa_id' => 'required|integer',
        ]);

        $empresaId = $request->input('empresa_id');

        try {
            $gestioninventario = gestioninventario::findOrFail($id_gestion_inv);
            $gestioninventario->delete();

            return redirect()->route('inventarios.principal', ['empresaId' => $empresaId])
                ->with('success', 'Inventario eliminado con éxito.');
        } catch (\Exception $e) {
            return redirect()->route('inventarios.principal', ['empresaId' => $empresaId])
                ->with('error', 'Error al eliminar el inventario.');
        }
    }

    public function showInventario($id_gestion_inv)
    {
        $inventarios = inventario::where('inventario_designado', $id_gestion_inv)->get();
        return view('gestor_vista.Administrador.Gestor_inventario', compact('inventarios', 'id_gestion_inv'));
    }

    // public function insertarexcel(Request $request)
    // {
    //     $request->validate([
    //         'inventario_designado' => 'required|integer',
    //         'documents' => 'required|file|mimes:xlsx,xls,csv|max:2048',
    //     ]);
    //     $inventario_designado = $request->input('inventario_designado');
    //     // Obtener el archivo
    //     $file = $request->file('documents');

    //     // Verificar si el archivo está limpio
    //     // if (!$this->isFileClean($file)) {
    //     //     return response()->json(['error' => 'El archivo contiene potencialmente archivos maliciosos.'], 400);
    //     // }

    //     // Cargar el archivo usando PhpSpreadsheet
    //     $spreadsheet = IOFactory::load($file->getPathname());
    //     $data = $spreadsheet->getActiveSheet()->toArray();

    //     // Iterar desde la fila 10 (índice 9) hasta el final
    //     for ($i = 9; $i < count($data); $i++) {
    //         $row = $data[$i];
    //         // Verificar si hay datos nulos en las columnas relevantes
    //         if (empty($row[1])) {
    //             // Omitir esta fila si hay un valor nulo en la columna de fecha
    //             continue; // Continúa con la siguiente iteración
    //         }

    //         var_dump($row[7]); // Verifica el contenido de la columna de fecha

    //         // Crear una nueva instancia del modelo Inventario
    //         $inventario = new inventario();

    //         // Asignar valores a los campos del modelo
    //         $inventario->nombre_producto = $row[4]; // Ajusta según la columna correcta
    //         $inventario->marca_prod = $row[5];      // Ajusta según la columna correcta
    //         $inventario->detalles_prod = !empty($row[6]) ? $row[6] : 'Sin detalles'; // O cualquier valor por defecto que prefieras
    //         $inventario->fecha_inv = Carbon::createFromFormat('m/d/Y', $row[1])->format('Y-m-d');
    //         $costo = floatval($row[7]); // Convierte a un número decimal
    //         $inventario->costo = $costo; // Ajusta según la columna correcta
    //         $inventario->stock = !empty($row[8]) ? $row[8] : 0; //$row[8];            // Ajusta según la columna correcta
    //         $inventario->Stockactual = 0;             // Ajusta según la columna correcta
    //         $inventario->sustentoactual = '-';        // Ajusta según la columna correcta
    //         $inventario->inventario_designado = $inventario_designado; // Asignar la columna correcta


    //         // Guardar el modelo en la base de datos
    //         $inventario->save();
    //     }
    //     // Retornar una respuesta después de procesar todas las filas
    //     return response()->json(['success' => 'Datos procesados e insertados exitosamente.']);
    // }

    public function insertarexcel(Request $request)
    {
        $request->validate([
            'inventario_designado' => 'required|integer',
            'documents' => 'required|file|mimes:xlsx,xls,csv|max:2048',
        ]);

        $inventario_designado = $request->input('inventario_designado');
        $file = $request->file('documents');

        // Cargar el archivo usando PhpSpreadsheet
        $spreadsheet = IOFactory::load($file->getPathname());
        $data = $spreadsheet->getActiveSheet()->toArray();

        // Iterar desde la fila 10 (índice 9) hasta el final
        for ($i = 9; $i < count($data); $i++) {
            $row = $data[$i];

            // Verificar si hay datos nulos en las columnas relevantes
            if (empty($row[1])) {
                continue; // Omitir esta fila si hay un valor nulo en la columna de fecha
            }

            // Crear o buscar el modelo Inventario
            $inventario = inventario::where('nombre_producto', $row[4])
                ->where('marca_prod', $row[5])
                ->first();

            if (!$inventario) {
                // Si no existe, crear una nueva instancia
                $inventario = new inventario();
            }

            // Asignar valores a los campos del modelo
            $inventario->nombre_producto = $row[4]; // Ajusta según la columna correcta
            $inventario->marca_prod = $row[5];      // Ajusta según la columna correcta
            $inventario->detalles_prod = !empty($row[6]) ? $row[6] : 'Sin detalles'; // Valor por defecto
            $inventario->fecha_inv = Carbon::createFromFormat('m/d/Y', $row[1])->format('Y-m-d');
            $inventario->costo = floatval($row[7]); // Convierte a un número decimal
            $inventario->stock = !empty($row[8]) ? $row[8] : 0; // Ajusta según la columna correcta
            $inventario->Stockactual = 0; // Ajusta según la columna correcta
            $inventario->sustentoactual = '-'; // Ajusta según la columna correcta
            $inventario->inventario_designado = $inventario_designado; // Asignar la columna correcta

            // Guardar el modelo en la base de datos
            $inventario->save();
        }

        // Retornar una respuesta después de procesar todas las filas
        return response()->json(['success' => 'Datos procesados e insertados/actualizados exitosamente.']);
    }

    public function editinventario(Request $request, $id)
    {
        // Validar los datos del formulario
        $request->validate([
            'Stockactual' => 'required|integer',
            'sustentoactual' => 'required|string',
            'inventario_designado' => 'required|integer',
        ]);
        $id_gestion_inv = $request->input('inventario_designado');
        // Encontrar el inventario por su ID
        $inventario = Inventario::findOrFail($id);

        // Actualizar los campos
        $inventario->Stockactual = $request->Stockactual;
        $inventario->sustentoactual = $request->sustentoactual;

        // Guardar los cambios
        $inventario->save();

        // Redirigir a la ruta showInventario
        return redirect()->route('inventarios.principal', ['id_gestion_inv' => $id_gestion_inv])
            ->with('success', 'Inventario actualizado exitosamente.');
    }

    public function destroyinventario(Request $request,$id)
    {
        $request->validate([
            'inventario_designado' => 'required|integer',
        ]);
        $id_gestion_inv = $request->input('inventario_designado');

        // Encontrar el inventario por su ID
        $inventario = Inventario::findOrFail($id);
        // Eliminar el inventario
        $inventario->delete();

        // Redirigir a la ruta showInventario
        return redirect()->route('inventarios.principal', ['id_gestion_inv' => $id_gestion_inv])
            ->with('success', 'Inventario eliminado exitosamente.');
    }


    // private function isFileClean($file)
    // {
    //     // Verificar la extensión del archivo
    //     $validExtensions = ['xlsx', 'xls', 'csv', 'xlsm'];
    //     $extension = $file->getClientOriginalExtension();

    //     if (!in_array($extension, $validExtensions)) {
    //         return false;
    //     }

    //     // Verificar el tipo MIME
    //     $mimeType = $file->getMimeType();
    //     if (!in_array($mimeType, [
    //         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    //         'application/vnd.ms-excel', // .xls
    //         'text/csv', // .csv
    //         'application/vnd.ms-excel.sheet.macroEnabled.12' // .xlsm
    //     ])) {
    //         return false;
    //     }

    //     // Escanear el archivo en busca de virus
    //     if (!$this->scanFileForViruses($file)) {
    //         return false; // Archivo contaminado
    //     }

    //     // Verificar contenido sospechoso
    //     if ($this->containsSuspiciousContent($file)) {
    //         return false; // Contenido sospechoso encontrado
    //     }

    //     // Si todo es válido
    //     return true;
    // }

    // private function scanFileForViruses($file)
    // {
    //     // Ejecutar el escaneo con ClamAV
    //     $output = [];
    //     $returnVar = 0;

    //     // Comando para escanear el archivo
    //     exec("clamscan " . escapeshellarg($file->getPathname()), $output, $returnVar);

    //     // Si el comando devuelve 0, el archivo está limpio
    //     return $returnVar === 0;
    // }

    // private function containsSuspiciousContent($file)
    // {
    //     $spreadsheet = IOFactory::load($file->getPathname());
    //     $data = $spreadsheet->getActiveSheet()->toArray();

    //     foreach ($data as $row) {
    //         foreach ($row as $cell) {
    //             // Buscar patrones comunes de inyección SQL
    //             if (preg_match('/(SELECT|INSERT|DELETE|UPDATE|WHERE|=|\')/i', $cell)) {
    //                 return true;
    //             }
    //         }
    //     }

    //     return false;
    // }

    
}
