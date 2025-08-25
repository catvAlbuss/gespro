<?php

namespace App\Http\Controllers;

use DOMDocument;
use Dompdf\Dompdf;
use Dompdf\Options;
use DOMXPath;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;

class instalacionSanitariaController extends Controller
{
    public function sanitarias(Request $request)
    {
        // Cargar el contenido HTML desde un archivo (usamos Laravel Storage o el sistema de archivos)
        $html = file_get_contents(public_path('assets/html/inst_sanitarias.html'));

        // Crear un objeto DOMDocument y cargar el HTML
        $dom = new DOMDocument('1.0', 'UTF-8');
        @$dom->loadHTML($html, LIBXML_NOERROR); // Usamos @ para suprimir advertencias de HTML mal formado

        // Crear un objeto DOMXPath para navegar por el documento
        $xpath = new DOMXPath($dom);

        if ($request->isMethod('post')) {
            //dd($request->all());
            // Manipulamos los encabezados si se recibe un POST
            $headers = $xpath->query("//*[contains(concat(' ', normalize-space(@class), ' '), ' header_dummy ')]");
            foreach ($headers as $header_element) {
                // Crear un fragmento de documento con el contenido de 'header.html'
                $header = $dom->createDocumentFragment();
                $header->appendXML(file_get_contents(public_path('assets/html/header.html')));
                // Reemplazar el encabezado original con el nuevo
                $header_element->parentNode->replaceChild($header, $header_element);
            }

            // Reemplazar los componentes con los valores del POST
            foreach ($request->input('data.components', []) as $id => $component_value) {
                $components = $xpath->query("//*[contains(concat(' ', normalize-space(@class), ' '), ' $id ')]");
                foreach ($components as $component) {
                    // Crear un nuevo fragmento de documento con el valor de cada componente
                    $newFragment = $dom->createDocumentFragment();
                    $newFragment->appendXML($component_value);
                    // Reemplazar el componente en el DOM
                    $component->parentNode->replaceChild($newFragment, $component);
                }
            }

            // Reemplazar los cálculos con los valores del POST
            // foreach ($request->input('data.calcs', []) as $id => $value) {
            //     $elements = $xpath->query("//*[contains(concat(' ', normalize-space(@class), ' '), ' $id ')]");
            //     foreach ($elements as $element) {
            //         $element->textContent = $value;
            //     }
            // }
            foreach ($request->input('data.calcs', []) as $id => $value) {
                $elements = $xpath->query("//*[contains(concat(' ', normalize-space(@class), ' '), ' $id ')]");

                foreach ($elements as $element) {
                    // Verifica si $value es nulo y asigna un valor predeterminado (como una cadena vacía)
                    $element->textContent = $value ?? ''; // Si $value es null, asigna una cadena vacía
                }
            }

            // Configuración de Dompdf
            $options = new Options();
            $options->set('isRemoteEnabled', true);
            $options->set('chroot', public_path());  // Asegúrate de usar el directorio público para archivos remotos
            $dompdf = new Dompdf($options);
            $dompdf->loadHtml($dom->saveHTML());
            $dompdf->render();

            // Descargar el PDF o mostrarlo en una nueva ventana
            return $dompdf->stream("document.pdf", ["Attachment" => false]);
        } elseif ($request->isMethod('get')) {
            // En caso de ser un GET, devolver el cuerpo HTML
            $body = $xpath->query("/html/body")->item(0);
            return response($body->ownerDocument->saveHTML($body));
        }

        // Si no es ni POST ni GET, retornar un error
        return response('Invalid request method.', 400);
    }

    public function eternitcisterna(Request $request)
    {
        // Validación de datos de entrada
        $validatedData = $request->validate([
            'volumendemanda' => 'required|numeric',
            'volumenCisterna' => 'required|numeric',
            'volDeCisterna' => 'required|numeric',
            'volTotalMinimo' => 'required|numeric',

            'cisternaAltura' => 'required|numeric',
            'cisternaAncho' => 'required|numeric',
            'cisternaLargo' => 'required|numeric',

            'alturaDeAguaMin' => 'required|numeric',

        ]);

        try {
            // Generar un hash único y seguro
            $hash = hash('sha256', json_encode($validatedData) . microtime());

            // Almacenar en caché con una expiración más corta
            Cache::put($hash, $validatedData, now()->addMinutes(5));

            // Generar URL de redirección con el hash
            $redirectUrl = route('gestor_vista.Construyehc.Sanitarias.redirec', [
                'h' => $hash
            ]);

            // Devolver respuesta JSON con la URL de redirección
            return response()->json([
                'redirect' => $redirectUrl
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error en el procesamiento'
            ], 500);
        }
    }

    public function mostrarVista(Request $request)
    {
        // Obtener el hash de la URL
        $hash = $request->input('h');

        // Verificar si el hash está presente
        if (!$hash) {
            abort(404, 'Solicitud inválida');
        }

        // Recuperar datos de la caché
        $data = Cache::get($hash);

        // Verificar si los datos existen
        if (!$data) {
            abort(404, 'Datos no encontrados o expirados');
        }

        // Eliminar los datos de la caché inmediatamente
        Cache::forget($hash);

        // Pasar datos a la vista
        return view('gestor_vista.Construyehc.Sanitarias.redirec', $data);
    }

    public function eternitcisternapdf(Request $request)
    {
        // Obtener los datos del formulario
        $consumoDiarioTotal = $request->input('consumoDiarioTotal');
        $volDeCisterna = $request->input('volDeCisterna');
        $volTotalMinimo = $request->input('volTotalMinimo');
        $alturaDeAguaMin = $request->input('alturaDeAguaMin');
        $cisternaLargo = $request->input('cisternaLargo');
        $cisternaAncho = $request->input('cisternaAncho');
        $cisternaAltura = $request->input('cisternaAltura');
        $volumenCisterna = $request->input('volumenCisterna');
        $volumenCisternalitros = $request->input('volumenCisternalitros');

        // Array de cisternas con nombre, capacidad e imagen
        $cisternas = [
            [
                'nombre' => 'Cisterna Eternit Antibacterial',
                'capacidad' => 1350,
                'imagen' => 'Cisterna_Eternit_Antibacterial-1350.png'
            ],
            [
                'nombre' => 'Tanque Cisterna Industrial',
                'capacidad' => 5000,
                'imagen' => 'Tanque_Cisterna_Industrial-5000.png'
            ]
        ];

        // Seleccionar la cisterna adecuada
        $selectedCisterna = null;
        $range = 1500;

        foreach ($cisternas as $cisterna) {
            if (
                $volumenCisternalitros >= ($cisterna['capacidad'] - $range) &&
                $volumenCisternalitros <= ($cisterna['capacidad'] + $range)
            ) {
                $selectedCisterna = $cisterna;
                break;
            }
        }

        if (!$selectedCisterna) {
            $selectedCisterna = $cisternas[0];
        }

        // Cargar el archivo HTML desde el directorio 'assets/html'
        $html = file_get_contents(public_path('assets/html/pdfcisterna.html'));

        // Crear un objeto DOMDocument y cargar el HTML
        $dom = new DOMDocument('1.0', 'UTF-8');
        @$dom->loadHTML($html, LIBXML_NOERROR); // Usamos @ para suprimir advertencias de HTML mal formado

        // Crear un objeto DOMXPath para navegar por el documento
        $xpath = new DOMXPath($dom);

        // Reemplazar los componentes con los valores del POST
        $this->replaceHtmlContent($xpath, $dom, 'volDeCisterna', $volDeCisterna);
        $this->replaceHtmlContent($xpath, $dom, 'volTotalMinimo', $volTotalMinimo);
        $this->replaceHtmlContent($xpath, $dom, 'alturaDeAguaMin', $alturaDeAguaMin);
        $this->replaceHtmlContent($xpath, $dom, 'cisternaLargo', $cisternaLargo);
        $this->replaceHtmlContent($xpath, $dom, 'cisternaAncho', $cisternaAncho);
        $this->replaceHtmlContent($xpath, $dom, 'cisternaAltura', $cisternaAltura);
        $this->replaceHtmlContent($xpath, $dom, 'volumenCisterna', $volumenCisterna);
        $this->replaceHtmlContent($xpath, $dom, 'consumoDiarioTotal', $consumoDiarioTotal);
        $this->replaceHtmlContent($xpath, $dom, 'volumenCisternalitros', $volumenCisternalitros);

        // Aquí reemplazamos el nombre, capacidad e imagen de la cisterna seleccionada
        $this->replaceHtmlContent($xpath, $dom, 'cisternaNombre', $selectedCisterna['nombre']);
        $this->replaceHtmlContent($xpath, $dom, 'cisternaCapacidad', $selectedCisterna['capacidad']);


        // Manejar la imagen
        $imageBasePath = public_path('eternit/');
        $imagePath = $imageBasePath . $selectedCisterna['imagen'];

        if (file_exists($imagePath)) {
            // Encontrar y actualizar la imagen
            $imgElements = $xpath->query("//img[@class='img_cisterna_pro']");
            if ($imgElements->length > 0) {
                $imgElement = $imgElements->item(0);
                // Usar la ruta relativa para que Dompdf pueda encontrar la imagen
                $relativeImagePath = 'eternit/' . $selectedCisterna['imagen'];
                $imgElement->setAttribute('src', $relativeImagePath);
            }
        }

        // Obtener el HTML modificado
        $modifiedHtml = $dom->saveHTML();

        // Crear una instancia de Dompdf
        $options = new Options();
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isPhpEnabled', true);
        $options->set('isRemoteEnabled', true); // Permite cargar archivos remotos como imágenes o fuentes
        $options->set('chroot', public_path());  // Asegúrate de usar el directorio público para archivos remotos
        $dompdf = new Dompdf($options);

        // Cargar el HTML modificado en Dompdf
        $dompdf->loadHtml($modifiedHtml);

        // (Opcional) Configurar el tamaño de la página
        $dompdf->setPaper('A4', 'portrait'); // O 'landscape' si prefieres

        // Renderizar el PDF (esto es lo que realmente crea el archivo PDF)
        $dompdf->render();

        // Descargar el PDF generado
        return $dompdf->stream("documento.pdf", ["Attachment" => false]); // Nombre del archivo PDF que se descargará
    }

    private function replaceHtmlContent($xpath, $dom, $className, $value)
    {
        $elements = $xpath->query("//*[contains(concat(' ', normalize-space(@class), ' '), ' $className ')]");

        foreach ($elements as $element) {
            $element->nodeValue = $value;
        }
    }

    //====================tanque ==========//

    public function eternittanque(Request $request)
    {
        // Validación de datos de entrada
        $validatedData = $request->validate([
            'volumendemanda' => 'required|numeric',
            'volDeTanque' => 'required|numeric',
            'volTotalCalculadoReserva' => 'required|numeric',
            'tanqueAlturaDeAguaMin' => 'required|numeric',

            'tanqueLargo' => 'required|numeric',
            'tanqueAncho' => 'required|numeric',
            'tanqueAlturaAgua' => 'required|numeric',

            'volumenTanque' => 'required|numeric',

        ]);

        try {
            // Generar un hash único y seguro
            $hash = hash('sha256', json_encode($validatedData) . microtime());

            // Almacenar en caché con una expiración más corta
            Cache::put($hash, $validatedData, now()->addMinutes(5));

            // Generar URL de redirección con el hash
            $redirectUrl = route('gestor_vista.Construyehc.Sanitarias.gestortanaqueeternit', [
                'h' => $hash
            ]);

            // Devolver respuesta JSON con la URL de redirección
            return response()->json([
                'redirect' => $redirectUrl
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Error en el procesamiento'
            ], 500);
        }
    }

    public function mostrarVistatanque(Request $request)
    {
        // Obtener el hash de la URL
        $hash = $request->input('h');

        // Verificar si el hash está presente
        if (!$hash) {
            abort(404, 'Solicitud inválida');
        }

        // Recuperar datos de la caché
        $data = Cache::get($hash);

        // Verificar si los datos existen
        if (!$data) {
            abort(404, 'Datos no encontrados o expirados');
        }

        // Eliminar los datos de la caché inmediatamente
        Cache::forget($hash);

        // Pasar datos a la vista
        return view('gestor_vista.Construyehc.Sanitarias.gestortanaqueeternit', $data);
    }

    public function eternittanquepdf(Request $request)
    {
        // Obtener los datos del formulario
        $consumoDiarioTotal = $request->input('consumoDiarioTotal');
        $volDeCisterna = $request->input('volDeCisterna');
        $volTotalMinimo = $request->input('volTotalMinimo');
        $alturaDeAguaMin = $request->input('alturaDeAguaMin');
        $cisternaLargo = $request->input('cisternaLargo');
        $cisternaAncho = $request->input('cisternaAncho');
        $cisternaAltura = $request->input('cisternaAltura');
        $volumenCisterna = $request->input('volumenCisterna');
        $volumenCisternalitros = $request->input('volumenCisternalitros');

        // Array de cisternas con nombre, capacidad e imagen
        $cisternas = [
            [
                'nombre' => 'Cisterna Eternit Antibacterial',
                'capacidad' => 1350,
                'imagen' => 'Cisterna_Eternit_Antibacterial-1350.png'
            ],
            [
                'nombre' => 'Tanque Cisterna Industrial',
                'capacidad' => 5000,
                'imagen' => 'Tanque_Cisterna_Industrial-5000.png'
            ]
        ];

        // Seleccionar la cisterna adecuada
        $selectedCisterna = null;
        $range = 1500;

        foreach ($cisternas as $cisterna) {
            if (
                $volumenCisternalitros >= ($cisterna['capacidad'] - $range) &&
                $volumenCisternalitros <= ($cisterna['capacidad'] + $range)
            ) {
                $selectedCisterna = $cisterna;
                break;
            }
        }

        if (!$selectedCisterna) {
            $selectedCisterna = $cisternas[0];
        }

        // Cargar el archivo HTML desde el directorio 'assets/html'
        $html = file_get_contents(public_path('assets/html/pdfcisterna.html'));

        // Crear un objeto DOMDocument y cargar el HTML
        $dom = new DOMDocument('1.0', 'UTF-8');
        @$dom->loadHTML($html, LIBXML_NOERROR); // Usamos @ para suprimir advertencias de HTML mal formado

        // Crear un objeto DOMXPath para navegar por el documento
        $xpath = new DOMXPath($dom);

        // Reemplazar los componentes con los valores del POST
        $this->replaceHtmlContentt($xpath, $dom, 'volDeCisterna', $volDeCisterna);
        $this->replaceHtmlContentt($xpath, $dom, 'volTotalMinimo', $volTotalMinimo);
        $this->replaceHtmlContentt($xpath, $dom, 'alturaDeAguaMin', $alturaDeAguaMin);
        $this->replaceHtmlContentt($xpath, $dom, 'cisternaLargo', $cisternaLargo);
        $this->replaceHtmlContentt($xpath, $dom, 'cisternaAncho', $cisternaAncho);
        $this->replaceHtmlContentt($xpath, $dom, 'cisternaAltura', $cisternaAltura);
        $this->replaceHtmlContentt($xpath, $dom, 'volumenCisterna', $volumenCisterna);
        $this->replaceHtmlContentt($xpath, $dom, 'consumoDiarioTotal', $consumoDiarioTotal);
        $this->replaceHtmlContentt($xpath, $dom, 'volumenCisternalitros', $volumenCisternalitros);

        // Aquí reemplazamos el nombre, capacidad e imagen de la cisterna seleccionada
        $this->replaceHtmlContentt($xpath, $dom, 'cisternaNombre', $selectedCisterna['nombre']);
        $this->replaceHtmlContentt($xpath, $dom, 'cisternaCapacidad', $selectedCisterna['capacidad']);


        // Manejar la imagen
        $imageBasePath = public_path('eternit/');
        $imagePath = $imageBasePath . $selectedCisterna['imagen'];

        if (file_exists($imagePath)) {
            // Encontrar y actualizar la imagen
            $imgElements = $xpath->query("//img[@class='img_cisterna_pro']");
            if ($imgElements->length > 0) {
                $imgElement = $imgElements->item(0);
                // Usar la ruta relativa para que Dompdf pueda encontrar la imagen
                $relativeImagePath = 'eternit/' . $selectedCisterna['imagen'];
                $imgElement->setAttribute('src', $relativeImagePath);
            }
        }

        // Obtener el HTML modificado
        $modifiedHtml = $dom->saveHTML();

        // Crear una instancia de Dompdf
        $options = new Options();
        $options->set('isHtml5ParserEnabled', true);
        $options->set('isPhpEnabled', true);
        $options->set('isRemoteEnabled', true); // Permite cargar archivos remotos como imágenes o fuentes
        $options->set('chroot', public_path());  // Asegúrate de usar el directorio público para archivos remotos
        $dompdf = new Dompdf($options);

        // Cargar el HTML modificado en Dompdf
        $dompdf->loadHtml($modifiedHtml);

        // (Opcional) Configurar el tamaño de la página
        $dompdf->setPaper('A4', 'portrait'); // O 'landscape' si prefieres

        // Renderizar el PDF (esto es lo que realmente crea el archivo PDF)
        $dompdf->render();

        // Descargar el PDF generado
        return $dompdf->stream("documento.pdf", ["Attachment" => false]); // Nombre del archivo PDF que se descargará
    }

    private function replaceHtmlContentt($xpath, $dom, $className, $value)
    {
        $elements = $xpath->query("//*[contains(concat(' ', normalize-space(@class), ' '), ' $className ')]");

        foreach ($elements as $element) {
            $element->nodeValue = $value;
        }
    }
}
