<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Gestion Metrados Comunicación') }}
        </h2>
    </x-slot>

    <link href="https://unpkg.com/tabulator-tables@6.3.0/dist/css/tabulator.min.css" rel="stylesheet">
    <script type="text/javascript" src="https://unpkg.com/tabulator-tables@6.3.0/dist/js/tabulator.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/exceljs/dist/exceljs.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.1/xlsx.full.min.js"></script>
    <script type="module" src="{{ asset('assets/js/gestion_metrados_comunicacion_v2.js') }}"></script>

    <input type="hidden" name="datamodulos" id="datamodulos" value="{{ $metradocomunicaciones->documentosdata }}">
    <input type="hidden" name="idmetradocomunicacion" id="idmetradocomunicacion" value="{{ $metradocomunicaciones->idmetradocomunicacion }}">
    <input type="hidden" name="nombre_proyecto" id="nombre_proyecto" value="{{ $metradocomunicaciones->nombre_proyecto }}">
    <input type="hidden" name="cui" id="cui" value="{{ $metradocomunicaciones->cui }}">
    <input type="hidden" name="codigo_modular" id="codigo_modular" value="{{ $metradocomunicaciones->codigo_modular }}">
    <input type="hidden" name="codigo_local" id="codigo_local" value="{{ $metradocomunicaciones->codigo_local }}">
    <input type="hidden" name="unidad_ejecutora" id="unidad_ejecutora" value="{{ $metradocomunicaciones->unidad_ejecutora }}">
    <input type="hidden" name="fecha" id="fecha" value="{{ $metradocomunicaciones->fecha }}">
    <input type="hidden" name="especialidad" id="especialidad" value="{{ $metradocomunicaciones->especialidad }}">
    <input type="hidden" name="modulo" id="modulo" value="{{ $metradocomunicaciones->modulo }}">
    <input type="hidden" name="localidad" id="localidad" value="{{ $metradocomunicaciones->localidad }}">

    <div class="py-5">                
        <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div class="p-6">
                <button class="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 shadow-lg shadow-green-500/50 dark:shadow-lg dark:shadow-green-800/80 font-medium rounded-lg text-sm px-5 py-3.5 text-center me-2 mb-2"
                    id="download-xlsx">Descargar Hoja de calculo</button>
                <button class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-3.5 text-center me-2 mb-2"
                    id="actualizar_metrados">Guardar</button>
                <input type="file" id="fileUpload" accept=".xls,.xlsx" /><br />
                <button type="button" id="uploadExcel" class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-3.5 text-center me-2 mb-2">Convert</button>


                <div class="overflow-x-auto" id="metrados-comunicacion-table">
                </div>
                <br>
                <h3 class="text-gray-950 dark:text-gray-50 text-2xl font-semibold">Resumen</h3>
                <div class="overflow-x-auto" id="metrados-comunicacion-resumen">
                </div>
            </div>
        </div>
    </div>


</x-app-layout>
