<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Gestor de Balances') }} {{ session('nombre') }}
        </h2>

        <div class="flex flex-col sm:flex-row items-end justify-end -mt-8 space-x-2">
            {{-- <button
                class="text-white bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 shadow-lg shadow-green-500/50 dark:shadow-lg dark:shadow-green-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 "
                id="guardar">Guardar</button>&nbsp;&nbsp;&nbsp; --}}
            <button
                class="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 "
                id="btnReal">Gasto real</button>&nbsp;&nbsp;&nbsp;
            <button
                class="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 shadow-lg shadow-red-500/50 dark:shadow-lg dark:shadow-red-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                id="btnProgramado">Gasto Presupuestado</button>
            <button
                class="text-white bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-yellow-300 dark:focus:ring-yellow-800 shadow-lg shadow-yellow-500/50 dark:shadow-lg dark:shadow-yellow-800/80 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                id="btnResumen">Resumen</button>
        </div>

    </x-slot>
    <link href="https://unpkg.com/tabulator-tables@6.3.1/dist/css/tabulator.min.css" rel="stylesheet">
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
    <script type="text/javascript" src="https://unpkg.com/tabulator-tables@6.3.1/dist/js/tabulator.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    {{-- APACHE ECHARS --}}
    {{-- <script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/5.2.2/echarts.min.js"></script> --}}
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>

    <div class="" id="appBalances" data-module="contabilidad/balanceGV">
        <div class="w-full">
            <section id="balance_real">
                <div class="w-full p-2 text-gray-900 dark:text-gray-100">
                    <input type="hidden" id="id_contabilidad" name="id_contabilidad" value="{{ $contabilidad->id }}">
                    <input type="hidden" id="nombre" value="{{ $contabilidad->nombre_balance }}">
                    <input type="hidden" id="montoInicial" value="{{ $contabilidad->montoInicial }}">
                    <input type="hidden" id="empresa_id" value="{{ $empresaId }}">

                    <div class="overflow-x-auto">
                        <button type="button"
                            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                            id="guardar">Guardar balance real</button>
                        <br>
                        <div class="overflow-x-auto" id="Tabla_Balance_Real"></div>
                        <div class="overflow-x-auto" id="grafico-resumen"></div>
                    </div>
                </div>
            </section>

            <section id="balance_programado_contenedor" style="display: none;">
                <div class="p-6 text-gray-900 dark:text-gray-100">
                    <div class="overflow-x-auto">
                        <button type="button"
                            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                            id="guardar_balance_programado">Guardar balance programado</button>
                        <br>
                        <div class="overflow-x-auto" id="table_balance_programado"></div>
                        <div class="overflow-x-auto" id="grafico-resumen-programados"
                            style="width: 80rem; height: 400px;"></div>
                    </div>
                </div>
            </section>

            <section id="resumen_balance_contenedor" class="hidden">
                <div class="p-6 text-gray-900 dark:text-gray-100 space-y-6">

                    <!-- tablas resumen general numerico -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <!-- Tus tarjetas de resumen actuales -->
                        <div class="bg-white dark:bg-gray-800 shadow rounded-2xl p-4">
                            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Diferencia de ingreso
                                planificado</h3>
                            <p id="resumen-ingreso-monto" class="text-2xl font-bold mt-2">S/ 0.00</p>
                            <p id="resumen-ingreso-porcentaje" class="text-xl font-semibold">0.00%</p>
                            <p id="resumen-ingreso-texto" class="text-sm font-medium">Calculando...</p>
                        </div>

                        <div class="bg-white dark:bg-gray-800 shadow rounded-2xl p-4">
                            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">Diferencia de gasto
                                planificado</h3>
                            <p id="resumen-gasto-monto" class="text-2xl font-bold mt-2">S/ 0.00</p>
                            <p id="resumen-gasto-porcentaje" class="text-xl font-semibold">0.00%</p>
                            <p id="resumen-gasto-texto" class="text-sm font-medium">Calculando...</p>
                        </div>
                    </div>

                    <!-- Tablas resumen-->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <!-- Tabla Ingresos -->
                        <div class="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-2xl p-4">
                            <h2 class="text-lg font-semibold mb-2 text-red-600">INGRESOS</h2>
                            <div id="table_balance_resumen_ingreso"></div>
                        </div>

                        <!-- Tabla Gastos -->
                        <div class="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-2xl p-4">
                            <h2 class="text-lg font-semibold mb-2 text-red-600">GASTOS</h2>
                            <div id="table_balance_resumen_gastos"></div>
                        </div>
                    </div>

                    <!-- Gráficos -->
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div class="bg-white dark:bg-gray-800 shadow rounded-2xl p-4">
                            <h2 class="text-lg font-semibold mb-2">Planificado y Real - Ingresos</h2>
                            <div id="grafico-balance-ingresos" class="w-150 h-[400px]"></div>
                        </div>

                        <div class="bg-white dark:bg-gray-800 shadow rounded-2xl p-4">
                            <h2 class="text-lg font-semibold mb-2">Planificado y Real - Gastos</h2>
                            <div id="grafico-balance-gastos" class="w-150 h-[400px]"></div>
                        </div>
                    </div>

                </div>
            </section>

            <script>
                document.addEventListener("DOMContentLoaded", function() {
                    const btnReal = document.getElementById('btnReal');
                    const btnProgramado = document.getElementById('btnProgramado');
                    const btnResumen = document.getElementById('btnResumen');

                    const balanceReal = document.getElementById('balance_real');
                    const balanceProgramadocont = document.getElementById('balance_programado_contenedor');
                    const resumenBalancecont = document.getElementById('resumen_balance_contenedor');

                    btnReal.addEventListener('click', function() {
                        balanceReal.style.display = 'block';
                        balanceProgramadocont.style.display = 'none';
                        resumenBalancecont.style.display = 'none';
                    });

                    btnProgramado.addEventListener('click', function() {
                        balanceReal.style.display = 'none';
                        balanceProgramadocont.style.display = 'block';
                        resumenBalancecont.style.display = 'none';
                    });

                    btnResumen.addEventListener('click', function() {
                        balanceReal.style.display = 'none';
                        balanceProgramadocont.style.display = 'none';
                        resumenBalancecont.style.display = 'block';
                    });
                });
            </script>
            <script>
                window.APP_INIT = {
                    contabilidad: {
                        id: @json($contabilidad->id),
                        nombre_balance: @json($contabilidad->nombre_balance),
                        montoInicial: @json($contabilidad->montoInicial ?? 0),
                    },
                    empresaId: @json($empresaId),
                    csrfToken: @json(csrf_token())
                };
               
            </script>

        </div>
    </div>
</x-app-layout>
{{-- <script type="module" src="{{ asset('assets/js/gestion_balances.js') }}"></script> --}}
