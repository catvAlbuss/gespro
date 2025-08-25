<?php

namespace App\Http\Controllers\dml;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Dompdf\Dompdf;
use Dompdf\Options;
use DOMDocument;
use PageBuilder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;

class memoriaCalculo extends Controller
{
    protected $storagePath;
    protected $publicPath;

    public function __construct()
    {
        $this->storagePath = storage_path('app/public/html');
        $this->publicPath = public_path();
    }

    /**
     * Generate PDF for Memoria Descriptiva
     */
    public function generarPDF(Request $request)
    {
        require_once __DIR__ . '/memorias.php';
        require_once __DIR__ . '/page.php';

        // Verify if POST request
        if ($request->isMethod('post')) {
            try {
                // Configurar DomPDF con opciones más permisivas
                $options = new Options();
                $options->set('defaultFont', 'Times');
                $options->set('isHtml5ParserEnabled', true);
                $options->set('isPhpEnabled', true);
                $options->set('isRemoteEnabled', true);
                
                // Importante: establecer la ruta base para recursos
                $options->set('chroot', [
                    $this->publicPath,
                    $this->storagePath,
                    public_path('storage')
                ]);
                
                // Crear instancia de DomPDF
                $dompdf = new Dompdf($options);
                $dompdf->setPaper('A4', 'portrait');
                
                // Preparar archivos necesarios (opcional pero útil para depurar)
                $this->prepareFiles();
                
                // Crear contenido HTML completo
                $html = $this->generateCompleteHtml($request);
                
                // Cargar HTML en DomPDF
                $dompdf->loadHtml($html);
                
                // Renderizar PDF (con manejo de errores)
                $dompdf->render();
                
                // Configurar nombre del archivo
                $filename = 'memoria_descriptiva.pdf';
                
                // Devolver el PDF como respuesta
                return response($dompdf->output())
                    ->header('Content-Type', 'application/pdf')
                    ->header('Content-Disposition', "inline; filename='{$filename}'");
            } catch (\Exception $e) {
                // Registrar el error para depuración
                \Log::error('Error en generación de PDF: ' . $e->getMessage());
                return response()->json(['error' => $e->getMessage()], 500);
            }
        }

        // If not POST request, return view to submit the form
        return view('dml.memoria_descriptiva_form');
    }
    
    /**
     * Prepara los archivos necesarios y verifica permisos
     */
    private function prepareFiles()
    {
        // Verificar que la carpeta de destino exista y tenga permisos
        $htmlDir = $this->storagePath . '/memoria_descriptiva_de_seguridad_vinchos';
        
        if (!File::isDirectory($htmlDir)) {
            File::makeDirectory($htmlDir, 0755, true);
        }
        
        // Verificar que los archivos existan
        $requiredFiles = [
            $htmlDir . '/header.html',
            $htmlDir . '/footer.html',
            $htmlDir . '/portada.html'
        ];
        
        foreach ($requiredFiles as $file) {
            if (!File::exists($file)) {
                \Log::warning("Archivo no encontrado: $file");
            } else {
                // Asegurar permisos correctos
                chmod($file, 0644);
            }
        }
    }
    
    /**
     * Genera el HTML completo para el PDF
     */
    private function generateCompleteHtml(Request $request)
    {
        // Ruta base para recursos (importante para resolver problemas 403)
        $basePath = $this->storagePath . '/memoria_descriptiva_de_seguridad_vinchos';
        
        // Asegurarse de que podemos leer los archivos
        $headerHtml = $this->safeReadFile($basePath . '/header.html');
        $footerHtml = $this->safeReadFile($basePath . '/footer.html');
        $portadaHtml = $this->safeReadFile($basePath . '/portada.html');
        
        // Crear el HTML completo que incluirá todas las secciones
        $completeHtml = '<!DOCTYPE html>
        <html>
        <head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
            <title>Memoria Descriptiva</title>
            <style>
                @page {
                    margin: 100px 30px 70px 30px;
                }
                body {
                    font-family: Times, serif;
                    font-size: 10pt;
                    margin: 0;
                    padding: 0;
                }
                .page-break {
                    page-break-after: always;
                }
                .portada {
                    text-align: center;
                    margin-top: 150px;
                    page-break-after: always;
                }
                .indice {
                    margin-top: 30px;
                    page-break-after: always;
                }
                .indice h1 {
                    text-align: center;
                    font-size: 14pt;
                }
                .indice-item-0 {
                    font-weight: bold;
                    font-size: 12pt;
                }
                .indice-item-1 {
                    margin-left: 20px;
                    font-size: 11pt;
                }
                .indice-item-2 {
                    margin-left: 40px;
                    font-style: italic;
                    font-size: 10pt;
                    color: #666666;
                }
                header {
                    position: fixed;
                    top: -80px;
                    left: 0;
                    right: 0;
                    height: 60px;
                }
                footer {
                    position: fixed;
                    bottom: -50px;
                    left: 0;
                    right: 0;
                    height: 40px;
                }
                main {
                    margin-top: 0px;
                }
            </style>
        </head>
        <body>';
        
        // Agregar encabezado como un elemento header fijo
        $completeHtml .= '<header>' . $headerHtml . '</header>';
        
        // Agregar pie de página como un elemento footer fijo
        $completeHtml .= '<footer>' . $footerHtml . '</footer>';
        
        // Contenido principal
        $completeHtml .= '<main>';
        
        // Agregar portada sin encabezado ni pie
        $completeHtml .= '<div class="portada">' . $portadaHtml . '</div>';
        
        // Agregar índice
        $completeHtml .= '<div class="indice">';
        $completeHtml .= '<h1>ÍNDICE</h1>';
        
        // Aquí generamos el índice dinámicamente
        $pg_builder = new PageBuilder($basePath);
        $memoria_descriptiva_de_seguridad = isset($GLOBALS['memoria_descriptiva_de_seguridad']) 
            ? $GLOBALS['memoria_descriptiva_de_seguridad'] 
            : [];
        $indices = $pg_builder->GetIndices($memoria_descriptiva_de_seguridad);
        
        // Generar HTML del índice
        $indiceHtml = $this->generateIndexHtml($indices);
        $completeHtml .= $indiceHtml;
        $completeHtml .= '</div>';
        
        // Agregar contenido principal
        $contentHtml = $this->generateContentHtml($memoria_descriptiva_de_seguridad, $basePath);
        $completeHtml .= $contentHtml;
        
        // Cerrar main y HTML
        $completeHtml .= '</main>';
        $completeHtml .= '</body></html>';
        
        return $completeHtml;
    }
    
    /**
     * Lee un archivo de forma segura
     */
    private function safeReadFile($path)
    {
        if (File::exists($path)) {
            try {
                return File::get($path);
            } catch (\Exception $e) {
                \Log::error("Error leyendo archivo $path: " . $e->getMessage());
                return "<!-- Error al cargar: $path -->";
            }
        }
        return "<!-- Archivo no encontrado: $path -->";
    }
    
    /**
     * Genera el HTML para el índice
     */
    private function generateIndexHtml($indices)
    {
        $html = '<div class="toc">';
        
        foreach ($indices as $index) {
            $level = isset($index['level']) ? $index['level'] : 0;
            $title = isset($index['title']) ? $index['title'] : '';
            $page = isset($index['page']) ? $index['page'] : '';
            
            $html .= '<div class="indice-item-' . $level . '">';
            $html .= htmlspecialchars($title) . ' <span style="float:right">' . $page . '</span>';
            $html .= '</div>';
        }
        
        $html .= '</div>';
        
        return $html;
    }
    
    /**
     * Genera el HTML para el contenido principal
     */
    private function generateContentHtml($memoria_descriptiva_de_seguridad, $basePath)
    {
        $html = '';
        
        // Procesamos el contenido de manera segura
        if (is_array($memoria_descriptiva_de_seguridad)) {
            foreach ($memoria_descriptiva_de_seguridad as $section) {
                if (isset($section['title'])) {
                    $html .= '<h1>' . htmlspecialchars($section['title']) . '</h1>';
                }
                
                if (isset($section['content'])) {
                    // Si es una ruta de archivo, carga el contenido
                    if (is_string($section['content']) && file_exists($basePath . '/' . $section['content'])) {
                        $html .= $this->safeReadFile($basePath . '/' . $section['content']);
                    } else {
                        $html .= $section['content'];
                    }
                }
                
                if (isset($section['subsections']) && is_array($section['subsections'])) {
                    foreach ($section['subsections'] as $subsection) {
                        if (isset($subsection['title'])) {
                            $html .= '<h2>' . htmlspecialchars($subsection['title']) . '</h2>';
                        }
                        
                        if (isset($subsection['content'])) {
                            // Si es una ruta de archivo, carga el contenido
                            if (is_string($subsection['content']) && file_exists($basePath . '/' . $subsection['content'])) {
                                $html .= $this->safeReadFile($basePath . '/' . $subsection['content']);
                            } else {
                                $html .= $subsection['content'];
                            }
                        }
                        
                        // Manejar sub-subsecciones si existen
                        if (isset($subsection['subsections']) && is_array($subsection['subsections'])) {
                            foreach ($subsection['subsections'] as $subsubsection) {
                                if (isset($subsubsection['title'])) {
                                    $html .= '<h3>' . htmlspecialchars($subsubsection['title']) . '</h3>';
                                }
                                
                                if (isset($subsubsection['content'])) {
                                    // Si es una ruta de archivo, carga el contenido
                                    if (is_string($subsubsection['content']) && file_exists($basePath . '/' . $subsubsection['content'])) {
                                        $html .= $this->safeReadFile($basePath . '/' . $subsubsection['content']);
                                    } else {
                                        $html .= $subsubsection['content'];
                                    }
                                }
                            }
                        }
                    }
                }
                
                // Agregar salto de página después de cada sección principal
                $html .= '<div class="page-break"></div>';
            }
        }
        
        return $html;
    }
}