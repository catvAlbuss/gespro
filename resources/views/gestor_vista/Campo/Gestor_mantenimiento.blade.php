<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Gestor Campo') }}
        </h2>
    </x-slot>
    <link rel="stylesheet" href="{{ asset('assets/css/tabulator_simple.min.css') }}">
    <script type="text/javascript" src="https://unpkg.com/tabulator-tables/dist/js/tabulator.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/hyperformula/dist/hyperformula.full.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.4.0/jspdf.umd.min.js"></script>
    <script type="text/javascript"
        src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.20/jspdf.plugin.autotable.min.js"></script>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="{{ asset('assets/js/gestion_mantenimiento_final.js') }}"></script>
    <style>
        /* .tabulator-cell.tabulator-editable {
            background-color: #f0f8ff;
        } */
        .tabulator-cell:not(.tabulator-editable):not(.tabulator-calcs>.tabulator-cell) {
            background-color: #f2f2f2 !important;
        }

        .addColumn {
            padding: 0px;
            width: 50px;
            margin-left: 10px;
            border-radius: 0px;
        }
    </style>
    <input type="hidden" id="id_mantenimiento" value="{{ $id_mantimiento }}">
    <input type="hidden" id="datamantemiento" value='@json($mantenimiento)' />
    <div class="py-12">
        <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900 dark:text-gray-100">
                    <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 py-6">
                        <div class="overflow-auto" id="content0">
                            <form action="#" id="ficha">
                                <div>
                                    <x-input-label for="proyecto" :value="__('Proyecto')" />
                                    <x-text-input id="proyecto" class="block mt-1 w-full" type="text"
                                        name="proyecto" required autofocus />
                                </div>
                                <div>
                                    <x-input-label for="propietario" :value="__('Propitario')" />
                                    <x-text-input id="propietario" class="block mt-1 w-full" type="text"
                                        name="propietario" required autofocus />
                                </div>
                                <div>
                                    <x-input-label for="ubicacion" :value="__('Ubicación')" />
                                    <x-text-input id="ubicacion" class="block mt-1 w-full" type="text"
                                        name="ubicacion" required autofocus />
                                </div>
                                <div>
                                    <x-input-label for="fecha" :value="__('Fecha')" />
                                    <x-text-input id="fecha" class="block mt-1 w-full" type="date" name="fecha"
                                        required autofocus />
                                </div>
                                <div class="flex items-center justify-end mt-4">
                                    <button type="button"
                                        class="bg-blue-500 text-white font-semibold py-2 px-4 rounded"
                                        id="generar_mantenimiento">GUARDAR</button>
                                </div>
                            </form>
                        </div>
                        <br>
                        <br>
                        <div class="container-fluid d-none" id="mantenimiento">
                            <div class="bg-blue-400 text-gray-950 rounded-lg shadow-md p-0 mt-4">
                                <!-- -------INSUMOS------- -->
                                <div class="flex items-center justify-between p-4 border-b">
                                    <h3 class="text-lg font-semibold">INSUMOS</h3>
                                    <button class="collapsible-btn ml-auto" data-target="content1">ver /
                                        ocultar</button>
                                </div>
                                <!-- Tablas interiores -->
                                <div class="hidden p-0 m-0" id="content1">
                                    <!-- G.V -->
                                    <div class="m-0">
                                        <div class="p-4 mb-3">
                                            <div class="flex flex-col">
                                                <div class="w-full flex justify-center">
                                                    <div id="tbl_insumos"></div>
                                                    {{-- <div id="tbl_insumos_transporte"></div> --}}
                                                </div>
                                                {{-- <div class="w-full" id="tbl_insumos_result"></div> --}}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- -------COMPARACION MATERIALES------- -->
                            <div class="bg-blue-400 text-gray-950 rounded-lg shadow-md p-0 m-0 mt-4">
                                <div class="flex items-center justify-between p-4 border-b">
                                    <h3 class="text-lg font-semibold">INSUMOS TRANSPORTE</h3>
                                    <button class="collapsible-btn ml-auto" data-target="content8">ver /
                                        ocultar</button>
                                </div>
                                <!-- Tablas interiores -->
                                <div class="hidden p-0 m-0" id="content8">
                                    <!-- Masa o peso -->
                                    <div class="m-0">
                                        <div class="p-4 mb-3">
                                            <div class="flex flex-col">
                                                <div class="w-full flex justify-center">
                                                    {{-- <div id="tbl_insumos"></div> --}}
                                                    <div id="tbl_insumos_transporte"></div>
                                                </div>
                                                <div class="w-full" id="tbl_insumos_result"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- -------COTIZACIONES------- -->
                            <div class="bg-blue-400 text-gray-950 rounded-lg shadow-md p-0 m-0 mt-4">
                                <div class="flex items-center justify-between p-4 border-b">
                                    <h3 class="text-lg font-semibold">COTIZACIONES</h3>
                                    <input type="number" class="border border-gray-300 text-gray-900 rounded p-1 w-24"
                                        value="1" min="1" max="7" step="1"
                                        id="addCotizaciones">
                                    <button class="collapsible-btn ml-auto" data-target="content2">ver /
                                        ocultar</button>
                                </div>
                                <!-- Tablas interiores -->
                                <div class="hidden p-0 m-0" id="content2">
                                    <!-- Masa o peso -->
                                    <div class="m-0">
                                        <div class="p-4 mb-3">
                                            <div class="flex flex-col">
                                                <div class="w-full flex justify-center">
                                                    <div id="tbl_cotizaciones"></div>
                                                    <div id="tbl_cotizaciones_transporte"></div>
                                                </div>
                                                <div class="w-full" id="tbl_cotizaciones_result"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <br>
                            <!-- -------MATERIALES Expediente------- -->
                            <div class="bg-blue-400 text-gray-950 rounded-lg shadow-md p-0 m-0 mb-4">
                                <div class="flex items-center justify-between p-4 border-b">
                                    <h3 class="text-lg font-semibold">MATERIALES EXPEDIENTE</h3>
                                    <button class="collapsible-btn ml-auto" data-target="content3">ver /
                                        ocultar</button>
                                </div>
                                <div class="hidden p-0" id="content3">
                                    <div class="m-0">
                                        <div class="p-4 mb-3">
                                            <div class="flex flex-col">
                                                <div class="w-full mb-3">
                                                    <div id="tbl_materiales_expediente"></div>
                                                </div>
                                                {{-- <div class="w-full text-right">
                                                    <button type="button"
                                                        class="bg-blue-500 text-white font-semibold py-2 px-4 rounded"
                                                        id="generar_mano_de_obra">PRESUPUESTO MANO DE OBRA</button>
                                                </div> --}}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- -------MATERIALES EJECUCION------- -->
                            <div class="bg-blue-400 text-gray-950 rounded-lg shadow-md p-0 m-0 mb-4">
                                <div class="flex items-center justify-between p-4 border-b">
                                    <h3 class="text-lg font-semibold">MATERIALES EJECUCION</h3>
                                    <input type="number"
                                        class="border text-gray-900 border-gray-300 rounded p-1 w-24"
                                        placeholder="Envios..." min="1" max="99" step="1"
                                        id="addEnvios">
                                    <button class="collapsible-btn ml-auto" data-target="content9">ver /
                                        ocultar</button>
                                </div>
                                <div class="hidden p-0" id="content9">
                                    <div class="m-0">
                                        <div class="p-4 mb-3">
                                            <div class="flex flex-col">
                                                <div class="w-full mb-3">
                                                    <div id="tbl_materiales"></div>
                                                </div>
                                                {{-- <div class="w-full text-right">
                                                    <button type="button"
                                                        class="bg-blue-500 text-white font-semibold py-2 px-4 rounded"
                                                        id="generar_mano_de_obra">PRESUPUESTO MANO DE OBRA</button>
                                                </div> --}}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- -------PRESUPUESTO MANO DE OBRA------- -->
                            <div class="bg-blue-400 text-gray-950 rounded-lg shadow-md p-0 m-0 mb-4">
                                <div class="flex items-center justify-between p-4 border-b">
                                    <h3 class="text-lg font-semibold">PRESUPUESTO MANO DE OBRA</h3>
                                    <button class="collapsible-btn ml-auto" data-target="content4">ver /
                                        ocultar</button>
                                </div>
                                <div class="hidden p-0" id="content4">
                                    <div class="m-0">
                                        <div class="p-4 mb-3">
                                            <div class="flex flex-col">
                                                <div class="w-full">
                                                    <div id="tbl_presupuesto_mano_de_obra"></div>
                                                </div>
                                                <div class="w-full" id="tbl_presupuesto_mano_de_obra_result"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- -------MANO DE OBRA------- -->
                            <div class="bg-blue-400 text-gray-950 rounded-lg shadow-md p-0 m-0 mb-4">
                                <div class="flex items-center justify-between p-4 border-b">
                                    <h3 class="text-lg font-semibold">MANO DE OBRA</h3>
                                    <input type="number"
                                        class="border text-gray-900 border-gray-300 rounded p-1 w-24"
                                        placeholder="Maestros..." min="1" max="99" step="1"
                                        id="addMaestros">
                                    <button class="collapsible-btn ml-auto" data-target="content5">ver /
                                        ocultar</button>
                                </div>
                                <div class="hidden p-0" id="content5">
                                    <div class="m-0">
                                        <div class="p-4 mb-3">
                                            <div class="flex flex-col">
                                                <div class="w-full">
                                                    <div id="tbl_mano_de_obra"></div>
                                                </div>
                                                <div class="w-full" id="tbl_mano_de_obra_result"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- -------EQUIPOS EXPEDIENTE------- -->
                            <div class="bg-blue-400 text-gray-950 rounded-lg shadow-md p-0 m-0 mb-4">
                                <div class="flex items-center justify-between p-4 border-b">
                                    <h3 class="text-lg font-semibold">EQUIPOS EXPEDIENTE</h3>
                                    <button class="collapsible-btn ml-auto" data-target="content10">ver /
                                        ocultar</button>
                                </div>
                                <div class="hidden p-0" id="content10">
                                    <div class="m-0">
                                        <div class="p-4 mb-3">
                                            <div class="flex flex-col">
                                                <div class="w-full mb-3">
                                                    <div id="tbl_equipo_expediente"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- -------EQUIPOS EJECUCION------- -->
                            <div class="bg-blue-400 text-gray-950 rounded-lg shadow-md p-0 m-0 mb-4">
                                <div class="flex items-center justify-between p-4 border-b">
                                    <h3 class="text-lg font-semibold">EQUIPOS EJECUCION</h3>
                                    <button class="collapsible-btn ml-auto" data-target="content11">ver /
                                        ocultar</button>
                                </div>
                                <div class="hidden p-0" id="content11">
                                    <div class="m-0">
                                        <div class="p-4 mb-3">
                                            <div class="flex flex-col">
                                                <div class="w-full mb-3">
                                                    <div id="tbl_equipos"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- -------GASTOS GENERALES------- -->
                            <div class="bg-blue-400 text-gray-950 rounded-lg shadow-md p-0 m-0 mb-4">
                                <div class="flex items-center justify-between p-4 border-b">
                                    <h3 class="text-lg font-semibold">GASTOS GENERALES</h3>
                                    <button class="collapsible-btn ml-auto" data-target="content6">ver /
                                        ocultar</button>
                                </div>
                                <div class="hidden p-0 m-0" id="content6">
                                    <div class="m-0">
                                        <div class="p-4 mb-3">
                                            <div class="flex flex-col">
                                                <div class="w-full">
                                                    <div id="tbl_gastos_generales"></div>
                                                </div>
                                                <div class="w-full" id="tbl_gastos_generales_result"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- -------RESUMEN------- -->
                            <div class="bg-blue-400 text-gray-950 rounded-lg shadow-md p-0 mb-4">
                                <div class="flex items-center justify-between p-4 border-b">
                                    <h3 class="text-lg font-semibold">RESUMEN</h3>
                                    <button class="collapsible-btn ml-auto" data-target="content7">ver /
                                        ocultar</button>
                                </div>
                                <div class="hidden p-0 m-0" id="content7">
                                    <div class="m-0">
                                        <div class="p-4 mb-3">
                                            <div class="flex flex-col">
                                                <div class="w-full mb-3">
                                                    <button type="button"
                                                        class="bg-blue-500 text-white font-semibold py-2 px-4 rounded"
                                                        id="generar_resumen">GENERAR</button>
                                                </div>
                                                <div class="flex">
                                                    <div class="w-1/2">
                                                        <div id="tbl_resumen_general"></div>
                                                    </div>
                                                    <div class="w-1/2">
                                                        <div id="tbl_resumen_desagregado"></div>
                                                    </div>
                                                </div>
                                                <div class="w-full mt-3 text-right">
                                                    <x-primary-button class="ml-4 text-center" id="guardar">
                                                        {{ __('Guardar') }}
                                                    </x-primary-button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <script>
        document.querySelectorAll('.collapsible-btn').forEach(button => {
            button.addEventListener('click', () => {
                const targetId = button.getAttribute('data-target');
                const content = document.getElementById(targetId);
                content.classList.toggle('hidden');
            });
        });
    </script>

    <script>
        const insertUrl = "{{ route('actualizarmantenimiento') }}"; // Genera la URL de forma correcta
    </script>
</x-app-layout>
