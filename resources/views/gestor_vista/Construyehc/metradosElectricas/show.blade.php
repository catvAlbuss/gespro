<x-app-layout>
    <x-slot name="header">
        <link href="https://unpkg.com/tabulator-tables@6.3.0/dist/css/tabulator.min.css" rel="stylesheet">
        <script type="text/javascript" src="https://unpkg.com/tabulator-tables@6.3.0/dist/js/tabulator.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/exceljs/dist/exceljs.min.js"></script>
        <script src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js"></script>
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script type="module" src="{{ asset('assets/js/gestion_metrados_electricas_v2.js') }}"></script>

        <div class="flex justify-between items-center mb-2 h-2">
            <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                {{ __('Gestion Metrados') }}
            </h2>
            <button class="px-2 py-2 mt-2 my-2 bg-green-500 border border-green-950 text-white rounded-lg"
                id="download-xlsx">Descargar Hoja de calculo</button>
            <button class="px-2 py-2 mt-2 my-2 bg-blue-500 border border-blue-950 text-white rounded-10 rounded-lg"
                id="actualizar_metrados">Guardar</button>
            <input type="file" id="fileUpload" accept=".xls,.xlsx" /><br />
            <button type="button" id="uploadExcel"
                class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-3.5 text-center me-2 mb-2">Convert</button>

        </div>
    </x-slot>


    <input type="hidden" name="datamodulos" id="datamodulos" value="{{ $metradoelectricas->documentosdata }}">
    <input type="hidden" name="id_melectricas" id="id_melectricas" value="{{ $metradoelectricas->idmeelectrica }}">
    <input type="hidden" name="nombre_proyecto" id="nombre_proyecto" value="{{ $metradoelectricas->nombre_proyecto }}">
    <input type="hidden" name="cui" id="cui" value="{{ $metradoelectricas->cui }}">
    <input type="hidden" name="codigo_modular" id="codigo_modular" value="{{ $metradoelectricas->codigo_modular }}">
    <input type="hidden" name="codigo_local" id="codigo_local" value="{{ $metradoelectricas->codigo_local }}">
    <input type="hidden" name="unidad_ejecutora" id="unidad_ejecutora"
        value="{{ $metradoelectricas->unidad_ejecutora }}">
    <input type="hidden" name="fecha" id="fecha" value="{{ $metradoelectricas->fecha }}">
    <input type="hidden" name="especialidad" id="especialidad" value="{{ $metradoelectricas->especialidad }}">
    <input type="hidden" name="modulo" id="modulo" value="{{ $metradoelectricas->modulo }}">
    <input type="hidden" name="localidad" id="localidad" value="{{ $metradoelectricas->localidad }}">
    <img id="imgencabezado" data-src="{{ asset('storage/eternit/cisternas/tanque1200.png') }}" />

    <div class="py-1">
        <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div class="p-2">
                <div class="overflow-x-auto" id="metrados-table">
                </div>
                <br>
                <h3 class="text-gray-950 dark:text-gray-50 text-2xl font-semibold">Resumen</h3>
                <div class="overflow-x-auto" id="metrados-resumen">
                </div>
            </div>
        </div>
    </div>


</x-app-layout>
