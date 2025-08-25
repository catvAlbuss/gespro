<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Gestion Metrados') }}
        </h2>
    </x-slot>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/tabulator-tables@6.3.0/dist/css/tabulator.min.css">
    <script type="text/javascript" src="https://unpkg.com/tabulator-tables@6.3.0/dist/js/tabulator.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/exceljs/dist/exceljs.min.js"></script>
    <script type="module" src="{{ asset('assets/js/gestion_metrados_sanitarias_v.js') }}"></script>

    <style>
        /* Estilo general */
        #modulo-1,
        #modulo-2,
        #resumen {
            margin-top: 20px;
        }

        /* Títulos de cada módulo */
        h3 {
            font-size: 18px;
            margin-bottom: 10px;
        }

        ,
        .tabulator {
            width: 100%;
            border-collapse: collapse;
        }

        .tabulator th,
        .tabulator td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: center;
        }
    </style>
    <div class="py-5">
        <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div class="p-6">
                <input type="hidden" name="datamodulos" id="datamodulos" value="{{ $metradosanitarias->documentosdata }}">
                <input type="hidden" name="idmetradosan" id="idmetradosan"
                    value="{{ $metradosanitarias->idmetradosan }}">
                <input type="hidden" name="nombre_proyecto" id="nombre_proyecto"
                    value="{{ $metradosanitarias->nombre_proyecto }}">
                <input type="hidden" name="entidadm" id="entidadm" value="{{ $metradosanitarias->entidadm }}">
                <input type="hidden" name="fecha" id="fecha" value="{{ $metradosanitarias->fecha }}">
                <input type="hidden" name="especialidad" id="especialidad"
                    value="{{ $metradosanitarias->especialidad }}">
                <input type="hidden" name="cui" id="cui" value="{{ $metradosanitarias->cui }}">
                <input type="hidden" name="codigo_modular" id="codigo_modular"
                    value="{{ $metradosanitarias->codigo_modular }}">
                <input type="hidden" name="codigo_local" id="codigo_local"
                    value="{{ $metradosanitarias->codigo_local }}">
                <input type="hidden" name="localidad" id="localidad" value="{{ $metradosanitarias->localidad }}">
                <div class="overflow-x-auto">
                    <label for="modules" class="text-gray-950 dark:text-white">Número de Módulos:</label>
                    <input
                        class="border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm block mt-1 w-48 text-center"
                        type="number" name="modules" id="modules" value="{{ $metradosanitarias->cantidadModulo}}" required="required" disabled>
                </div>
                <br>
                <div class="overflow-x-auto" id="modulos"></div>
                <br>
                <!-- Exterior Module Card -->
                <div class="card bg-white shadow-md rounded-lg overflow-hidden mb-6">
                    <div class="card-header bg-gray-100 p-4">
                        <label for=""
                            class="text-2xl font-semibold text-gray-950 dark:text-gray-950">EXTERIOR</label>
                    </div>
                    <div class="card-body p-4 overflow-x-auto" id="exterior" style="background-color: #fff">
                        <!-- Aquí se añadirá la tabla del módulo exterior usando JavaScript -->
                    </div>
                </div>

                <!-- Cisterna y TE Module Card -->
                <div class="card bg-white shadow-md rounded-lg overflow-hidden mb-6">
                    <div class="card-header bg-gray-100 p-4">
                        <label for="" class="text-2xl font-semibold text-gray-950 dark:text-gray-950">CISTERNA Y
                            TE</label>
                    </div>
                    <div class="card-body p-4 overflow-x-auto" id="cisternate" style="background-color: #fff">
                        <!-- Aquí se añadirá la tabla del módulo cisterna y TE usando JavaScript -->
                    </div>
                </div>

                <!-- Resumen Module Card -->
                 <button id="download-xlsx"
                    class="text-white bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 shadow-lg shadow-green-500/50 dark:shadow-lg dark:shadow-green-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Exportar
                    Documento </button>
                <button id="actualizar_metrados" class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2">Guardar </button>

                <div class="card bg-white shadow-md rounded-lg overflow-hidden mb-6">
                    <div class="card-header bg-gray-100 p-4">
                        <label for=""
                            class="text-2xl font-semibold text-gray-950 dark:text-gray-950">RESUMEN</label>
                    </div>
                    <div class="card-body p-4 overflow-x-auto" id="resumen" style="background-color: #fff">
                        <!-- Aquí se añadirá la tabla del módulo resumen usando JavaScript -->
                    </div>
                </div>

            </div>
        </div>
    </div>
</x-app-layout>
