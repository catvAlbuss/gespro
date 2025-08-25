<?php

namespace App\Http\Controllers\dml;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use PageBuilder;

class EditorController extends Controller
{
    public function stard(Request $request)
    {
        // Incluir archivos externos usando __DIR__ para que la ruta sea relativa al directorio actual
        require_once __DIR__ . '/memorias.php';
        require_once __DIR__ . '/page.php';

        // Nota: Laravel ya maneja el inicio de sesión, no es necesario usar session_start()

        // Obtener la ruta completa al directorio donde están tus archivos HTML
        $directory = storage_path('app/public/html/memoria_descriptiva_de_seguridad_vinchos');

        // Se asume que la variable $memoria_descriptiva_de_seguridad se define en memorias.php
        $pg_builder = new PageBuilder($directory);
        $htmls = $pg_builder->GetIndices($memoria_descriptiva_de_seguridad);

        // Leer la portada y agregarla al inicio del array
        $portadaPath = $directory . '/portada.html';
        if (file_exists($portadaPath)) {
            $portada = file_get_contents($portadaPath);
            array_unshift($htmls, $portada);
        } else {
            // Manejo de error o registro si el archivo no existe
        }

        // Devolver la respuesta en formato JSON
        return response()->json($htmls);
    }
}
