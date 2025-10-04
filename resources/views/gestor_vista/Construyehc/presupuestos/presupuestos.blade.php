<x-app-layout>
    <x-slot name="header">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Archivo+Narrow:ital,wght@0,400..700;1,400..700&display=swap"
            rel="stylesheet">
        <link href="https://cdn.jsdelivr.net/npm/tabulator-tables@6.3.1/dist/css/tabulator.min.css" rel="stylesheet">
        <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
        <script type="text/javascript" src="https://unpkg.com/tabulator-tables@6.3.1/dist/js/tabulator.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/exceljs/dist/exceljs.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/decimal.js/10.4.1/decimal.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js"></script>
        <!-- CSS de Select2 -->
        <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
        <!-- JS de Select2 -->
        <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>

        <div class="flex justify-between items-center w-full h-2">
            <!-- Título a la izquierda -->
            <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200">
                {{ __('Gestion Presupuestos') }}
            </h2>

            <!-- Botones a la derecha -->
            <div class="flex items-center space-x-2">
                <!-- Agregar especialidad -->
                <button id="addParentRow" title="Agregar especialidad"
                    class="p-2 rounded-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clip-rule="evenodd" />
                    </svg>
                </button>

                <!-- Cargar metrados -->
                <button data-modal-target="default-modal" data-modal-toggle="default-modal" title="Cargar metrados"
                    class="p-2 rounded-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                            clip-rule="evenodd" />
                    </svg>
                </button>

                <!-- Guardar archivo -->
                <button id="savedata" title="Guardar archivo"
                    class="p-2 rounded-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                            d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6a1 1 0 10-2 0v5.586l-1.293-1.293z" />
                        <path d="M16 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path d="M19 3a2 2 0 00-2-2H3a2 2 0 00-2 2v10a2 2 0 002 2h4l2 2 2-2h4a2 2 0 002-2V3z" />
                    </svg>
                </button>

                <!-- Descargar Excel -->
                <button id="download-xlsx" title="Descargar Excel"
                    class="p-2 rounded-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 dark:focus:ring-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm7.293-7.707a1 1 0 011.414 0L13 10.586V6a1 1 0 112 0v6a1 1 0 01-1 1H6a1 1 0 01-1-1V6a1 1 0 112 0v4.586l1.293-1.293z"
                            clip-rule="evenodd" />
                    </svg>
                </button>

                <!-- Renumaración -->
                <button data-modal-target="renumeracion-modal" data-modal-toggle="renumeracion-modal"
                    title="Renumaración"
                    class="p-2 rounded-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                            d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                    </svg>
                </button>

                <!-- Insumos -->
                <button data-modal-toggle="insumos-completo-modal" title="Insumos"
                    class="p-2 rounded-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                            d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                    </svg>
                </button>

                <!-- Índices -->
                <a href="{{ route('indices') }}" title="Índices"
                    class="p-2 rounded-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd"
                            d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                            clip-rule="evenodd" />
                    </svg>
                </a>

                {{-- Mantenimientos  <a href="{{ route('mantenimientoCampo.show', $mantenimiento->id_mantimiento) }}" --}}
                <a href="{{ route('mantenimientoCampo.show', 1) }}" title="mantenimientos"
                    class="p-2 rounded-lg text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500">
                    <svg class="w-5 h-5 text-gray-800 dark:text-white" aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                        viewBox="0 0 24 24">
                        <path fill-rule="evenodd"
                            d="M9 7V2.221a2 2 0 0 0-.5.365L4.586 6.5a2 2 0 0 0-.365.5H9Zm2 0V2h7a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5h7.586l-.293.293a1 1 0 0 0 1.414 1.414l2-2a1 1 0 0 0 0-1.414l-2-2a1 1 0 0 0-1.414 1.414l.293.293H4V9h5a2 2 0 0 0 2-2Z"
                            clip-rule="evenodd" />
                    </svg>
                </a>

                <!-- Campos ocultos -->
                <input type="hidden" name="proyecto_id" id="proyecto_id" value="1">
                <input type="hidden" name="id_presupuestos" id="id_presupuestos" value="1">
                <input type="hidden" name="costodirectovalue" id="costodirectovalue">
                <input type="hidden" name="gastoGeneralTotal" id="gastoGeneralTotal" value="2">
            </div>
        </div>
    </x-slot>

    <div class="py-2 px-2">
        <div class="grid grid-cols-5 gap-1">
            {{-- Metrados --}}
            <div class="3/6 col-span-2 border rounded-lg shadow-sm">
                <div id="tabla"></div>
            </div>
            {{-- Acus --}}
            <div class="4/6 col-span-3 border rounded-lg shadow-sm" id="detallecontainer">
                <div id="tabla-detall"></div>
            </div>

            {{--  Gastos Generales --}}
            <div class="6/6 col-span-5">
                <div class="flex flex-col gap-2">
                    <!-- Barra superior de Tabs -->
                    <div class="bg-gray-800 p-4 rounded-t-lg">
                        <ul class="flex space-x-2 text-xs" id="tab-list">
                            <li role="presentation">
                                <button class="tab-button w-32 text-left p-4 rounded-lg bg-gray-700 text-green-500"
                                    data-tab="consolidado">
                                    Consolidado
                                </button>
                            </li>
                            <li role="presentation">
                                <button
                                    class="tab-button w-48 text-left p-4 rounded-lg text-gray-300 hover:text-blue-600 hover:bg-gray-600"
                                    data-tab="gastos-Generales">
                                    Gastos Generales
                                </button>
                            </li>
                            <li role="presentation">
                                <button
                                    class="tab-button w-48 text-left p-4 rounded-lg text-gray-300 hover:text-blue-600 hover:bg-gray-600"
                                    data-tab="gasto-fijo">
                                    Gastos Fijos
                                </button>
                            </li>
                            <li role="presentation">
                                <button
                                    class="tab-button w-48 text-left p-4 rounded-lg text-gray-300 hover:text-blue-600 hover:bg-gray-600"
                                    data-tab="supervision">
                                    Supervisión
                                </button>
                            </li>
                            <!-- <li role="presentation">
                                <button
                                    class="tab-button w-48 text-left p-4 rounded-lg text-gray-300 hover:text-blue-600 hover:bg-gray-600"
                                    data-tab="gastos-supervision">
                                    Gastos Supervisión
                                </button>
                            </li> -->
                            <li role="presentation">
                                <button
                                    class="tab-button w-48 text-left p-4 rounded-lg text-gray-300 hover:text-blue-600 hover:bg-gray-600"
                                    data-tab="renumeracion">
                                    Control Concurrente
                                </button>
                            </li>
                        </ul>
                    </div>

                    <!-- Contenido de los Tabs -->
                    <div id="tab-content" class="bg-white p-4 rounded-lg shadow-md -mt-5">
                        <div class="tab-panel hidden p-4 rounded-xs bg-white shadow-md" id="consolidado">
                            <div id="consolidado_table" class="w-full h-full overflow-x-auto"></div>
                            {{-- <table
                                class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 border rounded-lg shadow-sm bg-blue-500">
                                <tbody class="text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr class="bg-blue-500 text-gray-50">
                                        <th class="px-6 py-3">Costo Directo</th>
                                        <td class="px-6 py-3"></td>
                                        <td class="px-6 py-3">S/. <span class="costodirecto_gen"
                                                id="costodirecto">0.00</span></td>
                                    </tr>
                                    <tr>
                                        <th class="px-6 py-3">Gastos Generales</th>
                                        <td class="px-6 py-3">
                                            <div class="relative">
                                                <label for="porcentajegastos" class="sr-only"> Gastos Generales
                                                </label>

                                                <input type="text" id="porcentajegastos" name="porcentajegastos"
                                                    placeholder="Gastos Generales"
                                                    class="w-full text-gray-900  rounded-md border-gray-200 py-2.5 pe-10 shadow-xs sm:text-sm" />

                                                <span class="absolute inset-y-0 end-0 grid w-10 place-content-center">
                                                    <button type="button" class="text-gray-600 hover:text-gray-700">
                                                        <span class="sr-only">Search</span>
                                                        <img class="w-5 h-5"
                                                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAABMElEQVR4nO2UQUoDMRiFv5WeQAXHWepNeiZ7ESld240UV7Y3KCJuWyi4agvtyoIO3VcCrxCGTCaZjF3NB2Hgn+R/k+TNg46OOC6Ad2BGAnfAGCiADTAEbmrW9IEjME8R3auJPXZAVrEmBw6a12sqPFaDNwmZMVFtVLPGPBtTqElW2tFp12V6enfQvMYcNULqxlBL1R9TRGOFT4b6Ai5J5FfNjMl8R92KoWxe1WwicTOmqj23bSibB+Db8Tttgdu2DVXGOPpFx74CnoArh6HMHZ+NvkSX+ohy0hW6rvs2RXOHoaqSbu9JumhchvIlnbmuZKoM5Uu6n1RRX0LFBE40voT6N+G8JqF2gUkXTV1CjQKTLoqQhMqsXVclXTSLwIS6BgbA2pF0jfgEPqyE6ugghD9WEYrI0h9bwAAAAABJRU5ErkJggg=="
                                                            alt="percentage">
                                                    </button>
                                                </span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-3">S/. <span id="gastosgenerales">0.00</span></td>
                                    </tr>
                                    <tr>
                                        <th class="px-6 py-3">Utilidad</th>
                                        <td class="px-6 py-3">
                                            <div class="relative">
                                                <label for="porcentajeutilidad" class="sr-only"> Search </label>

                                                <input type="text" id="porcentajeutilidad"
                                                    name="porcentajeutilidad" placeholder="Utilidad"
                                                    class="w-full text-gray-900  rounded-md border-gray-200 py-2.5 pe-10 shadow-xs sm:text-sm" />

                                                <span class="absolute inset-y-0 end-0 grid w-10 place-content-center">
                                                    <button type="button" class="text-gray-600 hover:text-gray-700">
                                                        <span class="sr-only">Search</span>
                                                        <img class="w-5 h-5"
                                                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAABMElEQVR4nO2UQUoDMRiFv5WeQAXHWepNeiZ7ESld240UV7Y3KCJuWyi4agvtyoIO3VcCrxCGTCaZjF3NB2Hgn+R/k+TNg46OOC6Ad2BGAnfAGCiADTAEbmrW9IEjME8R3auJPXZAVrEmBw6a12sqPFaDNwmZMVFtVLPGPBtTqElW2tFp12V6enfQvMYcNULqxlBL1R9TRGOFT4b6Ai5J5FfNjMl8R92KoWxe1WwicTOmqj23bSibB+Db8Tttgdu2DVXGOPpFx74CnoArh6HMHZ+NvkSX+ohy0hW6rvs2RXOHoaqSbu9JumhchvIlnbmuZKoM5Uu6n1RRX0LFBE40voT6N+G8JqF2gUkXTV1CjQKTLoqQhMqsXVclXTSLwIS6BgbA2pF0jfgEPqyE6ugghD9WEYrI0h9bwAAAAABJRU5ErkJggg=="
                                                            alt="percentage">
                                                    </button>
                                                </span>
                                            </div>
                                            
                                        </td>
                                        <td class="px-6 py-3">S/. <span id="utilidad">0.00</span></td>
                                    </tr>
                                    <tr>
                                        <th class="px-6 py-3">Parcial</th>
                                        <td class="px-6 py-3"></td>
                                        <td class="px-6 py-3">S/. <span id="parcial">0.00</span></td>
                                    </tr>
                                    <tr>
                                        <th class="px-6 py-3">I.G.V.</th>
                                        <td class="px-6 py-3">
                                            <div class="relative">
                                                <label for="porcentajeigv" class="sr-only"> Search </label>

                                                <input type="text" id="porcentajeigv" name="porcentajeigv"
                                                    placeholder="IGV"
                                                    class="w-full text-gray-900  rounded-md border-gray-200 py-2.5 pe-10 shadow-xs sm:text-sm" />

                                                <span class="absolute inset-y-0 end-0 grid w-10 place-content-center">
                                                    <button type="button" class="text-gray-600 hover:text-gray-700">
                                                        <span class="sr-only">Search</span>
                                                        <img class="w-5 h-5"
                                                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAABMElEQVR4nO2UQUoDMRiFv5WeQAXHWepNeiZ7ESld240UV7Y3KCJuWyi4agvtyoIO3VcCrxCGTCaZjF3NB2Hgn+R/k+TNg46OOC6Ad2BGAnfAGCiADTAEbmrW9IEjME8R3auJPXZAVrEmBw6a12sqPFaDNwmZMVFtVLPGPBtTqElW2tFp12V6enfQvMYcNULqxlBL1R9TRGOFT4b6Ai5J5FfNjMl8R92KoWxe1WwicTOmqj23bSibB+Db8Tttgdu2DVXGOPpFx74CnoArh6HMHZ+NvkSX+ohy0hW6rvs2RXOHoaqSbu9JumhchvIlnbmuZKoM5Uu6n1RRX0LFBE40voT6N+G8JqF2gUkXTV1CjQKTLoqQhMqsXVclXTSLwIS6BgbA2pF0jfgEPqyE6ugghD9WEYrI0h9bwAAAAABJRU5ErkJggg=="
                                                            alt="percentage">
                                                    </button>
                                                </span>
                                            </div>
                                         
                                        </td>
                                        <td class="px-6 py-3">S/. <span id="igv">0.00</span></td>
                                    </tr>
                                    <tr class="bg-blue-500 text-gray-50">
                                        <th class="px-6 py-3 font-bold">SUB TOTAL :</th>
                                        <td class="px-6 py-3"></td>
                                        <td class="px-6 py-3">S/. <span id="subtotal">0.00</span></td>
                                    </tr>
                                    <tr>
                                        <th class="px-6 py-3">*Elaboracion del Expediente Tecnico</th>
                                        <td class="px-6 py-3"></td>
                                        <td class="px-6 py-3">
                                            <div class="relative">
                                                <label for="elabexpetecnico" class="sr-only">elaboracion
                                                    tecnico</label>
                                                <span class="absolute inset-y-0 end-0 grid w-10 place-content-center">
                                                    <button type="button" class="text-gray-950 hover:text-gray-700">
                                                        <span class="sr-only">elaboracion tecnico</span>
                                                        S/.
                                                    </button>
                                                </span>
                                                <input type="text" id="elabexpetecnico" name="elabexpetecnico"
                                                    placeholder="expediente tecnico"
                                                    class="w-full text-gray-900  rounded-md border-gray-200 py-2.5 pe-10 shadow-xs sm:text-sm" />
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th class="px-6 py-3">* Gastos Supervision</th>
                                        <td class="px-6 py-3">
                                            <div class="relative">
                                                <label for="porcentajegasoperacion" class="sr-only"> Gastos
                                                    Supervision </label>

                                                <input type="text" id="porcentajegasoperacion"
                                                    name="porcentajegasoperacion" placeholder="porcentajegasoperacion"
                                                    class="w-full text-gray-900  rounded-md border-gray-200 py-2.5 pe-10 shadow-xs sm:text-sm" />

                                                <span class="absolute inset-y-0 end-0 grid w-10 place-content-center">
                                                    <button type="button" class="text-gray-600 hover:text-gray-700">
                                                        <span class="sr-only">Gastos Supervision</span>
                                                        <img class="w-5 h-5"
                                                            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAABMElEQVR4nO2UQUoDMRiFv5WeQAXHWepNeiZ7ESld240UV7Y3KCJuWyi4agvtyoIO3VcCrxCGTCaZjF3NB2Hgn+R/k+TNg46OOC6Ad2BGAnfAGCiADTAEbmrW9IEjME8R3auJPXZAVrEmBw6a12sqPFaDNwmZMVFtVLPGPBtTqElW2tFp12V6enfQvMYcNULqxlBL1R9TRGOFT4b6Ai5J5FfNjMl8R92KoWxe1WwicTOmqj23bSibB+Db8Tttgdu2DVXGOPpFx74CnoArh6HMHZ+NvkSX+ohy0hW6rvs2RXOHoaqSbu9JumhchvIlnbmuZKoM5Uu6n1RRX0LFBE40voT6N+G8JqF2gUkXTV1CjQKTLoqQhMqsXVclXTSLwIS6BgbA2pF0jfgEPqyE6ugghD9WEYrI0h9bwAAAAABJRU5ErkJggg=="
                                                            alt="percentage">
                                                    </button>
                                                </span>
                                            </div>
                                        </td>
                                        <td class="px-6 py-3">S/:<span id="gastosupervicion">0.00</span></td>
                                    </tr>
                                    <tr class="bg-blue-500 text-gray-50">
                                        <th class="px-6 py-3 font-bold">TOTAL :</th>
                                        <td class="px-6 py-3"></td>
                                        <td class="px-6 py-3">S/. <span id="total">0.00</span></td>
                                    </tr>
                                </tbody>

                            </table> --}}
                        </div>
                        <div class="tab-panel hidden p-4 rounded-xs bg-white shadow-md" id="gastos-Generales">
                            <div class="flex">
                                <p class="text-base text-gray-500">Contenido de <strong>gastos-Generales</strong>.</p>
                                <button class="guardar-gastos-fijos text-xs" id="guardar-gastos-generales">💾</button>
                                <p class="tex-xs px-5">Que porcentaje deseas Calcular</p>
                                <input type="text" id="porcentajeCalc"
                                    class="w-48 inline-block pl-2 bg-transparent border-b-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md text-sm">
                            </div>

                            <h2 class="text-base font-bold mb-2">01) GASTOS GENERALES FIJOS <button
                                    class="add-row-fatherGG">➕</button></h2>
                            <div id="gastosGenerales"></div>

                            <h2 class="text-base font-bold mt-4 mb-2">02) GASTOS GENERALES VARIABLES <button
                                    class="add-row-fatherGE">➕</button></h2>
                            <div id="gastosEspecificos"></div>
                        </div>

                        <div class="tab-panel hidden p-4 rounded-xs bg-white shadow-md" id="gasto-fijo">
                            <p class="text-base text-gray-500">Contenido de <strong>gasto-fijo</strong>.</p>
                            <button class="guardar-gastos-fijos text-xs" id="guardar-gastos-fijos">💾</button>
                            <div class="overflow-x-auto">
                                <div class="flex items-center justify-between mb-2">
                                    <h3 class="text-lg font-semibold">Detalles del Gasto General</h3>
                                    <button id="toggleTable" class="bg-gray-500 text-white px-4 py-2 rounded-md">
                                        Abrir/Cerrar Tabla
                                    </button>
                                </div>

                                <table id="table"
                                    class="min-w-full table-auto border-separate border-spacing-0 border border-gray-300 text-sm hidden">
                                    <thead class="bg-gray-500">
                                        <tr>
                                            <th class="border px-4 py-1 text-left">Descripción</th>
                                            <th class="border px-4 py-1 text-left">Ingreso de Datos</th>
                                            <th class="border px-4 py-1 text-left">Resultado</th>
                                        </tr>
                                    </thead>
                                    <tbody class="text-xs">
                                        <tr>
                                            <td class="border px-4 py-1">Costo Directo</td>
                                            <td class="border px-4 py-1 hover:bg-gray-100">
                                                <div class="flex items-center space-x-2">
                                                    <span class="text-gray-700">S/.</span>
                                                    <input type="text" name="costoDirecto_gfijo"
                                                        id="costoDirecto_gfijo"
                                                        class="w-48 inline-block pl-2 bg-transparent border-b-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md text-sm"
                                                        value="10" disabled>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="border px-4 py-1">GGF</td>
                                            <td class="border px-4 py-1">
                                                <input type="text" name="ggf" id="ggf"
                                                    class="w-48 inline-block pl-2 bg-transparent border-b-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md text-sm"
                                                    value="100">
                                            </td>
                                            <td class="border px-4 py-1" id="resultadoGGF">0.00</td>
                                        </tr>
                                        <tr>
                                            <td class="border px-4 py-1">GGV</td>
                                            <td class="border px-4 py-1">
                                                <input type="text" name="ggv" id="ggv"
                                                    class="w-48 inline-block pl-2 bg-transparent border-b-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md text-sm"
                                                    value="100">
                                            </td>
                                            <td class="border px-4 py-1" id="resultadoGGV">0.00</td>
                                        </tr>
                                        <tr>
                                            <td class="border px-4 py-1">UTILIDAD</td>
                                            <td class="border px-4 py-1">
                                                <input type="text" name="utilidadgfijos" id="utilidadgfijos"
                                                    class="w-48 inline-block pl-2 bg-transparent border-b-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md text-sm"
                                                    value="155150.03">
                                            </td>
                                            <td class="border px-4 py-1" id="resultadoUtilidad">0.00</td>
                                        </tr>
                                        <tr>
                                            <td class="border px-4 py-1">SUB TOTAL (sin IGV)</td>
                                            <td class="border px-4 py-1">
                                                <strong>S/. <span id="subtotalgfijos"
                                                        class="w-48">0.00</span></strong>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="border px-4 py-1"><strong>Monto contrato Garantizar</strong>
                                            </td>
                                            <td class="border px-4 py-1"><strong>S/. <span id="montocontratov"
                                                        class="w-48">0.00</span></strong></td>
                                        </tr>
                                        <tr>
                                            <td class="border px-4 py-1">Duración obra</td>
                                            <td class="border px-4 py-1">
                                                <div class="flex items-center space-x-2">
                                                    <input type="text" name="duracionobra" id="duracionobra"
                                                        class="w-48 inline-block pl-2 bg-transparent border-b-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md text-sm"
                                                        value="180"> dias
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="mt-5" id="gastosfijos"></div>
                        </div>

                        <!-- Primer div -->
                        <div class="tab-panel hidden rounded-lg bg-white shadow-md w-full" id="supervision">
                            <div class="flex">
                                <p class="text-sm text-gray-500">Contenido de <strong>supervision</strong>.
                                    {{-- <button class="add-row-fatherSupervicion">➕</button> --}}
                                    <button class="guardar-supervision text-xs" id="guardar-supervision">💾</button>
                                </p>
                                <br>
                                <label for="totalsupervision">Total <span id="totalsupervision"
                                        class="border-2 border-yellow-500 bg-yellow-100 p-2"></span></label>
                                <p class="tex-xs px-5">Que porcentaje deseas Calcular</p>
                                <input type="text" id="porcentajeCalcSuper"
                                    class="w-48 inline-block pl-2 bg-transparent border-b-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md text-sm">
                            </div>
                            <div class="w-full h-full">
                                <style>
                                    .tabulator .tabulator-header .tabulator-col {
                                        font-size: 10px;
                                        color: black;
                                        font-weight: bolder;
                                        /* Ajusta el tamaño de letra de encabezados */
                                    }

                                    .tabulator .tabulator-row {
                                        font-size: 9px;
                                        color: black;
                                        font-weight: bolder;
                                        /* Ajusta el tamaño de letra de las filas */
                                    }

                                    .tabulator .tabulator-cell {
                                        padding: 8px;
                                        color: black;
                                        font-weight: bolder;
                                        /* Ajusta el padding interno de las celdas */
                                    }

                                    .tabulator .tabulator-cell.wrap-text {
                                        white-space: normal !important;
                                        word-wrap: break-word;
                                        overflow-wrap: break-word;
                                        line-height: 1.4;
                                        min-height: 20px;
                                        max-height: 100px;
                                        /* Limit cell height */
                                        overflow-y: auto;
                                        /* Add scrollbar for overflow */
                                    }
                                </style>
                                <div id="supervition_base" class="w-full h-full overflow-x-auto"></div>
                                <div id="gastosSupervision" class="w-full h-full overflow-x-auto"></div>
                            </div>
                        </div>

                        <!-- Segundo div -->
                        {{-- <div class="tab-panel hidden p-4 rounded-lg bg-white shadow-md w-full md:w-1/2"
                            id="gastos-supervision">
                            <p class="text-sm text-gray-500">Contenido de <strong>gastos-supervision</strong>.</p>
                            <div id=""></div>
                        </div> --}}
                        <div class="tab-panel hidden p-4 rounded-lg bg-white shadow-md" id="renumeracion">
                            <p class="text-sm text-gray-500">Contenido de <strong>CONTROL CONCURRENTE</strong>.
                                <button class="add-row-fatherCCuncurrente">➕</button>
                                <button class="savecontrolCun">💾</button>
                            </p>
                            <div id="controlcuncurrente"></div>
                        </div>
                    </div>
                </div>
                {{--  Gastos Supervicion --}}
            </div>
        </div>

        <div id="observationModal"
            class="hidden fixed inset-0 flex justify-end items-stard py-23 px-8 bg-opacity-50 border rounded-lg shadow-sm">
            <div
                class="bg-gray-800 text-gray-50 dark:bg-gray-300 dark:text-gray-950 w-1/3 h-72 p-6 border rounded-lg shadow-lg flex flex-col">
                <h2 class="text-lg font-semibold mb-4">Agregar Observación</h2>
                <textarea id="observationText" class="w-full h-64 p-2 border rounded-lg focus:ring focus:ring-blue-300"></textarea>
                <div class="mt-4 flex justify-end space-x-2">
                    <button id="cancelObservation"
                        class="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">Cancelar</button>
                    <button id="saveObservation"
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button>
                </div>
            </div>
        </div>

        <!-- Main modal -->
        <div id="default-modal" tabindex="-1" aria-hidden="true"
            class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
            <div class="relative p-4 w-full max-w-2xl max-h-full">
                <!-- Modal content -->
                <div class="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                    <!-- Modal header -->
                    <div
                        class="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                            Metrados a cargar
                        </h3>
                        <button type="button"
                            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                            data-modal-hide="default-modal">
                            <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                fill="none" viewBox="0 0 14 14">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                            </svg>
                            <span class="sr-only">Close modal</span>
                        </button>
                    </div>
                    {{-- <form method="POST" action="{{ route('obtenerresumMetrados') }}"> --}}
                    <form id="resumenMetradosForm">
                        @csrf
                        <!-- Modal body -->
                        <div class="flex items-center justify-center">
                            <ul
                                class="w-48 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-300 dark:border-gray-300 dark:text-gray-950">
                                <!-- Estructura Checkbox -->
                                <li class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-500">
                                    <div class="flex items-center ps-3">
                                        <input id="estructura-checkbox" name="estructura-checkbox" type="checkbox"
                                            value="true"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
                                        <label for="estructura-checkbox"
                                            class="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-950">Estructura</label>
                                    </div>
                                </li>

                                <!-- Arquitectura Checkbox -->
                                <li class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-500">
                                    <div class="flex items-center ps-3">
                                        <input id="arquitectura-checkbox" name="arquitectura-checkbox"
                                            type="checkbox" value="true"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
                                        <label for="arquitectura-checkbox"
                                            class="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-950">Arquitectura</label>
                                    </div>
                                </li>

                                <!-- Sanitarias Checkbox -->
                                <li class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-500">
                                    <div class="flex items-center ps-3">
                                        <input id="sanitarias-checkbox" name="sanitarias-checkbox" type="checkbox"
                                            value="true"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
                                        <label for="sanitarias-checkbox"
                                            class="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-950">Sanitaria</label>
                                    </div>
                                </li>

                                <!-- Electricas Checkbox -->
                                <li class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                                    <div class="flex items-center ps-3">
                                        <input id="electricas-checkbox" name="electricas-checkbox" type="checkbox"
                                            value="true"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
                                        <label for="electricas-checkbox"
                                            class="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-950">Electricas</label>
                                    </div>
                                </li>

                                <!-- Comunicacion Checkbox -->
                                <li class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                                    <div class="flex items-center ps-3">
                                        <input id="comunicacion-checkbox" name="comunicacion-checkbox"
                                            type="checkbox" value="true"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
                                        <label for="comunicacion-checkbox"
                                            class="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-950">Comunicacion</label>
                                    </div>
                                </li>

                                <!-- Gas Checkbox -->
                                <li class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
                                    <div class="flex items-center ps-3">
                                        <input id="gas-checkbox" name="gas-checkbox" type="checkbox" value="true"
                                            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
                                        <label for="gas-checkbox"
                                            class="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-950">Gas</label>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <input type="text" name="proyecto_id" id="proyecto_id" value="1">

                        <!-- Modal footer -->
                        <div
                            class="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                            <button id="obtenerResumenMetrados" type="button"
                                class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                Solicitar documentos
                            </button>

                            <button type="button"
                                class="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                                Cerrar/cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        {{-- Renumeracion --}}
        <div id="renumeracion-modal" tabindex="-1" aria-hidden="true"
            class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)]">
            <div class="relative p-4 w-full bg-white rounded-lg shadow-lg dark:bg-gray-800">
                <!-- Modal content -->
                <div
                    class="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600 border-gray-200">
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                        Renumeracion <button class="add-row-father-remuneracion">➕</button>
                    </h3>
                    <button type="button"
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                        data-modal-hide="renumeracion-modal">
                        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span class="sr-only">Close modal</span>
                    </button>
                </div>
                <div class="relative bg-white dark:bg-gray-700 p-4 rounded-b">
                    <!-- Modal body (Aquí va el contenido de la numeración) -->
                    <div id="renumeracionBase" class="w-full overflow-auto"></div>
                    <div class="flex justify-between mt-4">
                        <button type="button" id="guardarRemuneracion"
                            class="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                            Guardar
                        </button>

                        <button type="button"
                            class="text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
                            id="cerrarRemuneracion">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {{-- Modal de insumos completos visualizaciones --}}
        <div id="insumos-completo-modal" tabindex="-1" aria-hidden="true"
            class="hidden fixed inset-0 z-50 flex justify-center items-center w-full h-full bg-black bg-opacity-50">
            <div class="relative p-6 w-full max-w-4xl bg-white rounded-xl shadow-xl dark:bg-gray-800">
                <!-- Modal content -->
                <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600">
                    <h3 class="text-2xl font-semibold text-gray-900 dark:text-white">
                        Editar Insumos
                    </h3>
                    <button type="button" data-modal-hide="insumos-completo-modal"
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
                        <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span class="sr-only">Cerrar modal</span>
                    </button>
                </div>
                <div class="p-6 rounded-b">
                    <!-- Modal body -->
                    <div id="insumoCompuesto" class="w-full overflow-auto max-h-96"></div>
                    <form id="insumoFormModal" class="space-y-4 hidden mt-4">
                        <input type="hidden" id="insumo_id_modal" name="insumo_id">
                        <div>
                            <label for="codigo_modal"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300">Código</label>
                            <input type="text" id="codigo_modal" name="codigo"
                                class="w-full border-gray-300 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600">
                        </div>
                        <div>
                            <label for="grupo_gen_modal"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300">Grupo
                                Genérico</label>
                            <input type="text" id="grupo_gen_modal" name="grupo_gen"
                                class="w-full border-gray-300 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600">
                        </div>
                        <div>
                            <label for="proveedor_modal"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300">Proveedor</label>
                            <input type="text" id="proveedor_modal" name="proveedor"
                                class="w-full border-gray-300 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600">
                        </div>
                        <div>
                            <label for="descripcion_modal"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
                            <input type="text" id="descripcion_modal" name="descripcion"
                                class="w-full border-gray-300 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600">
                        </div>
                        <div>
                            <label for="marca_modal"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300">Marca</label>
                            <input type="text" id="marca_modal" name="marca"
                                class="w-full border-gray-300 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600">
                        </div>
                        <div>
                            <label for="especificaciones_modal"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300">Especificaciones</label>
                            <input type="text" id="especificaciones_modal" name="especificaciones"
                                class="w-full border-gray-300 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600">
                        </div>
                        <div>
                            <label for="tipo_insumo_modal"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo Insumo</label>
                            <input type="text" id="tipo_insumo_modal" name="tipo_insumo"
                                class="w-full border-gray-300 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600">
                        </div>
                        <div>
                            <label for="unidad_medida_modal"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300">Unidad
                                Medida</label>
                            <select id="unidad_medida_modal" name="unidad_medida"
                                class="w-full border-gray-300 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600">
                                <option value="">Seleccionar</option>
                                <option value="m2">[m2] GENERAL - % apli. al total del pre...</option>
                                <!-- Add other options as per your original code -->
                            </select>
                        </div>
                        <div>
                            <label for="unidad_compra_modal"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300">Unidad
                                Compra</label>
                            <select id="unidad_compra_modal" name="unidad_compra"
                                class="w-full border-gray-300 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600">
                                <option value="">Seleccionar</option>
                                <option value="m2">[m2] GENERAL - % apli. al total del pre...</option>
                                <!-- Add other options as per your original code -->
                            </select>
                        </div>
                        <div>
                            <label for="preciounitario_modal"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300">Precio
                                Unitario</label>
                            <input type="number" id="preciounitario_modal" name="preciounitario"
                                class="w-full border-gray-300 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600">
                        </div>
                        <div>
                            <label for="fecha_modal"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha</label>
                            <input type="date" id="fecha_modal" name="fecha"
                                class="w-full border-gray-300 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600">
                        </div>
                        <div>
                            <label for="ficha_tecnica_modal"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300">Ficha
                                Técnica</label>
                            <input type="text" id="ficha_tecnica_modal" name="ficha_tecnica"
                                class="w-full border-gray-300 rounded-lg shadow-sm dark:bg-gray-700 dark:border-gray-600">
                        </div>
                        <div>
                            <label for="habilitado_modal"
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300">Habilitado</label>
                            <input type="checkbox" id="habilitado_modal" name="habilitado"
                                class="h-4 w-4 text-blue-600 border-gray-300 rounded">
                        </div>
                        <div class="flex justify-between">
                            <button type="submit"
                                class="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5">
                                Guardar Cambios
                            </button>
                            <button type="button" id="cancelEditModal"
                                class="text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Modal Insumos-->
        <div id="insumosModal"
            class="fixed inset-0 bg-gray-800 bg-opacity-60 overflow-y-auto h-full w-full hidden z-50 transition-opacity duration-300">
            <div
                class="relative top-20 mx-auto p-2 border w-full max-w-4xl shadow-2xl rounded-xl bg-white transform transition-all duration-300 scale-95">
                <div class="mt-2">
                    <div class="-mt-4 mb-2">
                        <!-- Tabs Navigation -->
                        <div class="mb-2 border-b border-gray-200">
                            <ul class="flex flex-wrap -mb-px text-sm font-medium text-center text-gray-500"
                                id="insumosTabs" role="tablist">
                                <li class="mr-2" role="presentation">
                                    <button
                                        class="inline-block p-2 rounded-t-lg border-b-2 border-transparent hover:text-blue-600 hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                        id="replace-tab" data-tabs-target="#replace" type="button" role="tab"
                                        aria-controls="replace" aria-selected="true">Reemplazar por</button>
                                </li>
                                <li class="mr-2" role="presentation">
                                    <button
                                        class="inline-block p-2 rounded-t-lg border-b-2 border-transparent hover:text-blue-600 hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                        id="edit-replace-tab" data-tabs-target="#edit-replace" type="button"
                                        role="tab" aria-controls="edit-replace" aria-selected="false">Editar y
                                        Reemplazar</button>
                                </li>
                                {{-- <li class="mr-2" role="presentation">
                                    <button
                                        class="inline-block p-2 rounded-t-lg border-b-2 border-transparent hover:text-blue-600 hover:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                        id="compound-tab" data-tabs-target="#compound" type="button" role="tab"
                                        aria-controls="compound" aria-selected="false">Insumos Compuesto
                                        (ACU)</button>
                                </li> --}}
                            </ul>
                        </div>
                        <!-- Tabs Content -->
                        <div id="insumosTabsContent">
                            <!-- Reemplazar Por Tab -->
                            <div class="hidden p-2 bg-gray-50 rounded-lg" id="replace" role="tabpanel"
                                aria-labelledby="replace-tab">
                                <div id="reemplace" class="overflow-x-auto border rounded-lg"></div>
                                <div class="mt-2 flex items-center">
                                    <input type="checkbox" id="reemplazar-costo" class="mr-1">
                                    <label for="reemplazar-costo" class="text-sm text-gray-700">Reemplazar
                                        costo</label>
                                </div>
                            </div>
                            <!-- Editar y Reemplazar Tab -->
                            <div class="hidden p-4 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-sm"
                                id="edit-replace" role="tabpanel" aria-labelledby="edit-replace-tab">
                                <h4 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Editar Insumos
                                    Compuestos</h4>
                                <div class="space-y-6">
                                    <form id="insumoForm" class="space-y-6">
                                        @csrf
                                        <input type="hidden" id="insumo_id" name="insumo_id">
                                        <input type="hidden" id="presupuesto_designado" name="presupuesto_designado"
                                            value="1">

                                        <!-- Form Grid -->
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <!-- Código -->
                                            <div>
                                                <label for="codigo"
                                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Código</label>
                                                <input type="text" id="codigo" name="codigo"
                                                    class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out">
                                            </div>
                                            <!-- Grupo Genérico -->
                                            <div>
                                                <label for="grupo_gen"
                                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grupo
                                                    Genérico</label>
                                                <select id="grupo_gen" name="grupo_gen"
                                                    class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out">
                                                    <option value="manoobra">Mano de obra (incluido leyes sociales)
                                                    </option>
                                                    <option value="72">72 - Unión universal galvanizada</option>
                                                </select>
                                            </div>
                                            <!-- Proveedor -->
                                            <div>
                                                <label for="proveedor"
                                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proveedor</label>
                                                <select id="proveedor" name="proveedor"
                                                    class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out">
                                                    <option value="001">S10</option>
                                                    <option value="002">Otros proveedores</option>
                                                </select>
                                            </div>
                                            <!-- Descripción -->
                                            <div>
                                                <label for="descripcion"
                                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                                                <input type="text" id="descripcion" name="descripcion"
                                                    class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out">
                                            </div>
                                        </div>

                                        <!-- Especificaciones -->
                                        <div>
                                            <label for="especificaciones"
                                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Especificaciones</label>
                                            <textarea id="especificaciones" name="especificaciones" rows="3"
                                                class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out"></textarea>
                                        </div>

                                        <!-- Tipo Insumo and Unidad -->
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label for="tipo_insumo"
                                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo
                                                    de Insumo</label>
                                                <select id="tipo_insumo" name="tipo_insumo"
                                                    class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out">
                                                    <option value="manoobra">MANO DE OBRA</option>
                                                    <option value="materiales">MATERIALES</option>
                                                    <option value="equipo">EQUIPO</option>
                                                    <option value="SUB-CONTRATOS">SUB-CONTRATOS</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label for="unidad_medida"
                                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Unidad</label>
                                                <select id="unidad_medida" name="unidad_medida"
                                                    class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out">
                                                    <option value="" selected>Seleccione una unidad</option>
                                                    <option value="m2">[m²] GENERAL - % apli. al total del pre...
                                                    </option>
                                                    <option value="bls">[bls] GENERAL - BALDE</option>
                                                    <option value="bol">[bol] GENERAL - BOLSA</option>
                                                    <option value="cja">[cja] GENERAL - CAJA</option>
                                                    <option value="cjt">[cjt] GENERAL - CONJUNTO</option>
                                                    <option value="cm">[cm] GENERAL - CENTIMETRO</option>
                                                    <option value="cm2">[cm²] GENERAL - CENTIMETRO CUADRADO</option>
                                                    <option value="cm3">[cm³] GENERAL - CENTIMETRO CUBICO</option>
                                                    <option value="cto">[cto] GENERAL - CONJUNTO</option>
                                                    <option value="est">[est] GLOBAL - ESTIMADO</option>
                                                    <option value="gal">[gal] GLOBAL - GALON</option>
                                                    <option value="glb">[glb] GLOBAL - GLOBAL</option>
                                                    <option value="gl">[gl] GLOBAL - GLOBAL</option>
                                                    <option value="ha">[ha] GENERAL - HECTAREA</option>
                                                    <option value="hom">[hom] GENERAL - HOMBRE - MES</option>
                                                    <option value="hh">[hh] GENERAL - Hora - Hombre</option>
                                                    <option value="%mo">[%mo] GENERAL - PORCENTAJE - MANO OBRA
                                                    </option>
                                                    <option value="jgo">[jgo] GENERAL - JUEGO</option>
                                                    <option value="kg">[kg] GENERAL - KILOGRAMO</option>
                                                    <option value="kit">[kit] GENERAL - KIT</option>
                                                    <option value="km">[km] GENERAL - KILOMETRO</option>
                                                    <option value="l">[l] GENERAL - LITRO</option>
                                                    <option value="lb">[lb] GENERAL - LIBRA</option>
                                                    <option value="m">[m] GLOBAL - METRO LINEAL</option>
                                                    <option value="m2">[m²] GLOBAL - METRO CUADRADO</option>
                                                    <option value="m3">[m³] GLOBAL - METRO CUBICO</option>
                                                    <option value="mil">[mil] GENERAL - MILLAR</option>
                                                    <option value="p2">[p²] GENERAL - PIE CUADRADO</option>
                                                    <option value="par">[par] GENERAL - JUEGO</option>
                                                    <option value="plg">[plg] GENERAL - PLANCHA</option>
                                                    <option value="pin">[pin] GENERAL - PINTA</option>
                                                    <option value="ppt">[ppt] GENERAL - PUNTO</option>
                                                    <option value="pto">[pto] GENERAL - PIEZA</option>
                                                    <option value="ril">[ril] GENERAL - ROLLO</option>
                                                    <option value="sac">[sac] GENERAL - SACO</option>
                                                    <option value="sco">[sco] GENERAL - SACO</option>
                                                    <option value="tm">[tm] GENERAL - TONELADA METRICA</option>
                                                    <option value="tub">[tub] GENERAL - TUBERIA</option>
                                                    <option value="und">[und] GLOBAL - UNIDAD</option>
                                                    <option value="uni">[uni] GLOBAL - UNIDAD</option>
                                                    <option value="var">[var] GLOBAL - VARILLA</option>
                                                </select>
                                            </div>
                                        </div>

                                        <!-- Precio Unitario -->
                                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label for="preciounitario"
                                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio
                                                    Unitario</label>
                                                <input type="text" id="preciounitario" name="preciounitario"
                                                    class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150 ease-in-out">
                                            </div>
                                            <div class="flex items-center">
                                                <input type="checkbox" value="1" id="habilitado"
                                                    name="habilitado"
                                                    class="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:bg-gray-700">
                                                <label for="habilitado"
                                                    class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Habilitado</label>
                                            </div>
                                        </div>

                                        <!-- Informational Message -->
                                        <div
                                            class="flex items-start p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                                            <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor"
                                                viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                                <path fill-rule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                    clip-rule="evenodd" />
                                            </svg>
                                            <span>Las modificaciones que realice también se aplicarán a todos los
                                                insumos del proyecto.</span>
                                        </div>

                                        <!-- Submit Button -->
                                        <div class="flex justify-end">
                                            <button type="submit"
                                                class="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition duration-150 ease-in-out">
                                                Guardar
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                            <!-- Insumos Compuesto Tab -->
                            {{-- <div class="hidden p-2 bg-gray-50 rounded-lg" id="compound" role="tabpanel"
                                aria-labelledby="compound-tab">
                                <div id="insumoCompuesto" class="overflow-x-auto border rounded-lg"></div>
                            </div> --}}
                        </div>
                    </div>
                    <div class="flex justify-end px-6 py-4 space-x-2">
                        <button
                            class="px-4 py-2 bg-green-600 text-white font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200">Aceptar</button>
                        <button id="closeModal"
                            class="px-4 py-2 bg-gray-600 text-white font-medium rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200">Cerrar</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Exportacion -->
        <div id="exportModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center hidden">
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 class="text-xl font-semibold mb-4">Opciones de Exportación</h2>
                <form id="exportForm">
                    <!-- Export Format -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700">Formato de Exportación</label>
                        <select id="exportFormat"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50">
                            <option value="excel">Excel</option>
                            <option value="pdf">PDF</option>
                        </select>
                    </div>
                    <div class="container">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="relative">
                                <label for="logoFile"
                                    class="block text-gray-700 dark:text-gray-950 text-sm font-medium mb-2">
                                    Logo 1
                                    <div class="relative rounded-md shadow-sm mt-1">
                                        <div
                                            class="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-md py-2 px-3 cursor-pointer flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                                viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                                                class="w-5 h-5 mr-2">
                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                    d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.1-1.039m0 0a6 6 0 11-12 0" />
                                            </svg>
                                            <span>Subir Logo 1</span>
                                        </div>
                                        <input type="file" id="logoFile" accept="image/png, image/jpeg"
                                            class="sr-only" onchange="previewImage(this, 'logoPreview', 'logoFile')">
                                        <div id="logoFile-loading"
                                            class="absolute inset-0 bg-gray-200 dark:bg-gray-900 bg-opacity-50 rounded-md flex items-center justify-center hidden">
                                            <div
                                                class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500">
                                            </div>
                                        </div>
                                    </div>
                                </label>
                                <div id="logoPreview" class="mt-2 relative"></div>
                            </div>

                            <div class="relative">
                                <label for="escudoFile"
                                    class="block text-gray-700 dark:text-gray-950 text-sm font-medium mb-2">
                                    Logo 2
                                    <div class="relative rounded-md shadow-sm mt-1">
                                        <div
                                            class="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-md py-2 px-3 cursor-pointer flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none"
                                                viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                                                class="w-5 h-5 mr-2">
                                                <path stroke-linecap="round" stroke-linejoin="round"
                                                    d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.1-1.039m0 0a6 6 0 11-12 0" />
                                            </svg>
                                            <span>Subir Logo 2</span>
                                        </div>
                                        <input type="file" id="escudoFile" accept="image/png, image/jpeg"
                                            class="sr-only"
                                            onchange="previewImage(this, 'escudoPreview', 'escudoFile')">
                                        <div id="escudoFile-loading"
                                            class="absolute inset-0 bg-gray-200 dark:bg-gray-900 bg-opacity-50 rounded-md flex items-center justify-center hidden">
                                            <div
                                                class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500">
                                            </div>
                                        </div>
                                    </div>
                                </label>
                                <div id="escudoPreview" class="mt-2 relative"></div>
                            </div>
                        </div>
                    </div>
                    <script>
                        function previewImage(input, previewId, inputId) {
                            const previewContainer = document.getElementById(previewId);
                            const loadingDiv = document.getElementById(inputId + '-loading');

                            if (input.files && input.files[0]) {
                                const reader = new FileReader();

                                loadingDiv.classList.remove('hidden');
                                previewContainer.innerHTML = ''; // Clear previous preview

                                // Simulate loading for a bit (at least 500ms)
                                const minLoadTime = 500;
                                const startTime = Date.now();

                                reader.onload = function(e) {
                                    const loadTime = Date.now() - startTime;
                                    const delay = Math.max(0, minLoadTime - loadTime);

                                    setTimeout(() => {
                                        loadingDiv.classList.add('hidden');
                                        const img = document.createElement('img');
                                        img.src = e.target.result;
                                        img.style.width = '50px';
                                        img.style.height = '50px';
                                        img.style.objectFit = 'contain';
                                        img.classList.add('rounded-md', 'shadow-sm');

                                        const removeButton = document.createElement('button');
                                        removeButton.innerHTML =
                                            '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 ml-2 text-red-500 hover:text-red-700 cursor-pointer">' +
                                            '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>';
                                        removeButton.classList.add('focus:outline-none');
                                        removeButton.addEventListener('click', function() {
                                            document.getElementById(inputId).value = ''; // Clear file input
                                            previewContainer.innerHTML = ''; // Clear preview
                                        });

                                        const previewWrapper = document.createElement('div');
                                        previewWrapper.classList.add('flex', 'items-center');
                                        previewWrapper.appendChild(img);
                                        previewWrapper.appendChild(removeButton);

                                        previewContainer.appendChild(previewWrapper);
                                    }, delay);
                                }

                                reader.readAsDataURL(input.files[0]);
                            } else {
                                previewContainer.innerHTML = ''; // Clear preview if no file selected
                                loadingDiv.classList.add('hidden');
                            }
                        }
                    </script>
                    <!-- Export Options -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700">Criterios de Exportación</label>
                        <div class="mt-2 space-y-2">
                            <div>
                                <input type="radio" id="exportAll" name="exportOption" value="all"
                                    class="mr-2" checked>
                                <label for="exportAll">Exportar Presupuestos</label>
                            </div>
                            <div>
                                <input type="radio" id="exportSpecialty" name="exportOption" value="specialty"
                                    class="mr-2">
                                <label for="exportSpecialty">Exportar Acu por Especialidad</label>
                            </div>
                            <div>
                                <input type="radio" id="exportAllinsumos" name="exportOption" value="allInsumos"
                                    class="mr-2">
                                <label for="exportAllinsumos">Exportar Insumos</label>
                            </div>
                            <div>
                                <input type="radio" id="exportSupplies" name="exportOption" value="supplies"
                                    class="mr-2">
                                <label for="exportSupplies">Exportar por Tipo de Insumos</label>
                            </div>
                            <div>
                                <input type="radio" id="exportGastosGenerales" name="exportOption"
                                    value="gastosGenerales" class="mr-2">
                                <label for="exportGastosGenerales">Exportar Gastos Generales</label>
                            </div>
                        </div>
                    </div>

                    <!-- Specialty Dropdown (Hidden by Default) -->
                    <div id="specialtyOptions" class="mb-4 hidden">
                        <label class="block text-sm font-medium text-gray-700">Seleccionar Especialidad</label>
                        <select id="specialty"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50">
                            <option value="estructura">Estructura</option>
                            <option value="arquitectura">Arquitectura</option>
                            <option value="instalaciones sanitarias">Sanitarias</option>
                            <option value="instalaciones Electricas">Electricas</option>
                            <option value="instalaciones Comunicaciones">Comunicaciones</option>
                            <option value="instalaciones gas">Gas</option>
                        </select>
                    </div>

                    <!-- Supplies Dropdown (Hidden by Default) -->
                    <div id="suppliesOptions" class="mb-4 hidden">
                        <label class="block text-sm font-medium text-gray-700">Seleccionar Tipo de Insumos</label>
                        <select id="supplies"
                            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50">
                            <option value="02">ESTRUCTURAS</option>
                            <option value="03">ARQUITECTURA</option>
                            <option value="04">INSTALACIONES SANITARIAS</option>
                            <option value="05">INSTALACIONES ELECTRICAS</option>
                            <option value="06">INSTALACIONES COMUNICACIONES</option>
                            <option value="07">INSTALACIONES GAS</option>
                        </select>
                    </div>

                    <!-- Buttons -->
                    <div class="flex justify-end space-x-2">
                        <button type="button" id="cancelButton"
                            class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg">Cancelar</button>
                        <button type="submit" id="exportButton"
                            class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">Exportar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script>
        // Función para abrir y cerrar el modal del "default-modal"
        const modalButtonDefault = document.querySelector('[data-modal-toggle="default-modal"]');
        const modalDefault = document.getElementById('default-modal');
        const closeModalButtonDefault = document.querySelector('[data-modal-hide="default-modal"]');

        // Función para abrir el modal "default-modal"
        modalButtonDefault.addEventListener('click', () => {
            modalDefault.classList.remove('hidden');
            modalDefault.classList.add('flex'); // Mostrar el modal
        });

        // Función para cerrar el modal "default-modal"
        closeModalButtonDefault.addEventListener('click', () => {
            modalDefault.classList.add('hidden');
            modalDefault.classList.remove('flex'); // Ocultar el modal
        });

        // Cerrar el modal "default-modal" si haces clic fuera de él
        window.addEventListener('click', (event) => {
            if (event.target === modalDefault) {
                modalDefault.classList.add('hidden');
                modalDefault.classList.remove('flex');
            }
        });

        // Función para abrir y cerrar el modal del "renumeracion-modal"
        const modalButtonRenumeracion = document.querySelector('[data-modal-toggle="renumeracion-modal"]');
        const modalRenumeracion = document.getElementById('renumeracion-modal');
        const closeModalButtonRenumeracion = document.querySelector('[data-modal-hide="renumeracion-modal"]');
        const cerrarRemuneracion = document.getElementById('cerrarRemuneracion');
        // Función para abrir el modal "renumeracion-modal"
        modalButtonRenumeracion.addEventListener('click', () => {
            modalRenumeracion.classList.remove('hidden');
            modalRenumeracion.classList.add('flex'); // Mostrar el modal
        });

        closeModalButtonRenumeracion.addEventListener('click', () => {
            modalRenumeracion.classList.add('hidden');
            modalRenumeracion.classList.remove('flex'); // Ocultar el modal
        });

        cerrarRemuneracion.addEventListener('click', () => {
            modalRenumeracion.classList.add('hidden');
            modalRenumeracion.classList.remove('flex'); // Ocultar el modal
        });

        // Cerrar el modal "renumeracion-modal" si haces clic fuera de él
        window.addEventListener('click', (event) => {
            if (event.target === modalRenumeracion) {
                modalRenumeracion.classList.add('hidden');
                modalRenumeracion.classList.remove('flex');
            }
        });

        // JavaScript for modal functionality
        const modalButtonInsumosCompletos = document.querySelector('[data-modal-toggle="insumos-completo-modal"]');
        const modalInsumosCompletos = document.getElementById('insumos-completo-modal');
        const closeModalButtons = document.querySelectorAll('[data-modal-hide="insumos-completo-modal"]');

        // Open modal
        modalButtonInsumosCompletos.addEventListener('click', () => {
            modalInsumosCompletos.classList.remove('hidden');
            modalInsumosCompletos.classList.add('flex');
        });

        // Close modal
        closeModalButtons.forEach(button => {
            button.addEventListener('click', () => {
                modalInsumosCompletos.classList.add('hidden');
                modalInsumosCompletos.classList.remove('flex');
            });
        });

        // Close modal when clicking outside
        modalInsumosCompletos.addEventListener('click', (e) => {
            if (e.target === modalInsumosCompletos) {
                modalInsumosCompletos.classList.add('hidden');
                modalInsumosCompletos.classList.remove('flex');
            }
        });
    </script>

    <script type="module" src="{{ asset('assets/js/presupuestos.js') }}"></script>
    <script type="module" src="{{ asset('assets/js/insumos/insumos.js') }}"></script>
</x-app-layout>
