<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Detalles del ') }} {{ str_replace('+', ' ', $nombre_proyecto) }}
        </h2>
        <div class="flex items-center justify-end -mt-10">

            <button id="actualizar_presupuestos" type="button"
                class="m-1 ms-0 relative py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50">
                Presupuestos
            </button>

            <button type="button" id="actualizarProyectosBtngastos"
                class="m-1 ms-0 relative py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50">
                Actualizar Gastos
            </button>
        </div>
    </x-slot>

    <script src="https://cdn.zingchart.com/zingchart.min.js"></script>
    <script src="https://cdn.zingchart.com/modules/zingchart-grid.min.js"></script>
    <script src="https://cdn.zingchart.com/modules/zingchart-treemap.min.js"></script>
    <script src="https://code.jquery.com/jquery-2.2.4.min.js"
        integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44=" crossorigin="anonymous"></script>

    <style>
        /* Estilo para asegurar que los modales estén al frente */
        #modalactualizar_presupuestos {
            z-index: 50;
            /* Asegúrate de que estén al frente */
        }
    </style>
    <div id="modalactualizar_presupuestos"
        class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 hidden">
        <div id="alert-additional-content-4"
            class="p-4 mb-4 text-yellow-800 border border-yellow-300 rounded-lg bg-white shadow-lg" role="alert">
            <div class="flex items-center">
                <svg class="flex-shrink-0 w-4 h-4 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor" viewBox="0 0 20 20">
                    <path
                        d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                </svg>
                <span class="sr-only">Marcar Asistencia</span>
                <h3 class="text-lg font-medium">Marcar Asistencia</h3>
            </div>
            <div class="overflow-auto max-h-96 w-full">
                <section class="col-lg-5 col-md-4 col-sm-6 col-12">
                    <div class="card card-primary">
                        <h2>Agregar Montos Invertidos en años pasados</h2>
                        <div class="card-body m-2">
                            <div class="col-md-12">
                                <div class="form-group">
                                    <label class="col-form-label" for="presupuesto_inversion"><i
                                            class="fas fa-check"></i>Montos Invertidos(*) S/: </label>
                                    <input type="number" class="form-control" name="presupuesto_inversion"
                                        id="presupuesto_inversion" placeholder="100.00" value="100.00">
                                </div>
                            </div>
                            <br>
                            <div class="row" id="contenedor_presupuesto_inversion"></div>
                            <div class="col-md-12">
                                <div class="form-group">
                                    <button type="submit" id="actualizar_monto_invertido"
                                        class="m-1 ms-0 relative py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-900 bg-white text-gray-800 hover:text-gray-50 shadow-sm hover:bg-blue-500 focus:outline-none focus:bg-blue-500 disabled:opacity-50">
                                        Actualizar Monto Invertido
                                    </button>
                                </div>
                            </div>
                        </div>
                        <br>
                        <div class="card-header text-center">
                            <label for=""><strong>Presupuesto/Tarea</strong></label>
                        </div>
                        <div class="card-body m-2">
                            <div class="col-md-12">
                                <div class="form-group">
                                    <label class="col-form-label" for="presupuesto_desginado"><i
                                            class="fas fa-check"></i>Presupuesto Designado(*) S/: </label>
                                    <input type="number" class="form-control" name="presupuesto_desginado"
                                        id="presupuesto_desginado" placeholder="100.00" value="100.00">
                                </div>
                            </div>
                            <br>
                            <div class="row" id="contenedor_presupuesto"></div>
                            <div class="col-md-12">
                                <div class="form-group">
                                    <button type="submit" id="actualizar_presupuesto"
                                        class="m-1 ms-0 relative py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-900 bg-white text-gray-800 hover:text-gray-50 shadow-sm hover:bg-blue-500 focus:outline-none focus:bg-blue-500 disabled:opacity-50">
                                        Actualizar prespuesto
                                    </button>
                                </div>
                            </div>
                        </div>            
                    </div>
                </section>
            </div>
            <div class="flex items-center justify-end mt-8">
                <button type="button" id="dismiss-actualizar_presupuestos"
                    class="text-yellow-800 bg-transparent border border-yellow-800 hover:bg-yellow-900 hover:text-white focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-xs px-3 py-1.5 text-center dark:hover:bg-yellow-600 dark:border-yellow-600 dark:text-yellow-400 dark:hover:text-white dark:focus:ring-yellow-700"
                    aria-label="Close">
                    Dismiss
                </button>
            </div>
        </div>
    </div>

    <div class="py-2 -mt-5">
        <div class="w-full sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-white overflow-hidden shadow-sm sm:rounded-lg">
                <style>
                    .zc-html,
                    .zc-body {
                        margin: 0;
                        padding: 0;
                        width: 100%;
                        height: 8000px;
                        background-color: #fff;
                    }

                    .chart--container {
                        height: 100%;
                        width: 100%;
                        min-height: 600px;
                    }

                    .zc-ref {
                        display: none;
                    }
                </style>
                <input type="hidden" id="datosproyectos" name="datosproyectos" value="{{ $datosProyecto }}">
                <input type="hidden" id="avanceporcentajeProyectos" name="avanceporcentajeProyectos" value="{{ $avancePorcentajeProyecto }}">
                <input type="hidden" id="tareas" name="tareas" value="{{ json_encode($tareas) }}">
                <input type="hidden" id="montoplazos" name="montoplazos" value="{{ json_encode($plazos) }}">
                <input type="hidden" id="listarPersonals" name="listarPersonals" value="{{ json_encode($personal) }}">
                <input type="hidden" id="reportpresupuestos" name="reportpresupuestos"value="{{ json_encode($presupuesto) }}">
                <input type="hidden" id="reporterequerimientoProceso" name="reporterequerimientoProceso" value="{{ json_encode($requerimientosProceso) }}">
                <input type="hidden" id="reporterequerimientosustentadp" name="reporterequerimientosustentadp" value="{{ json_encode($requerimientosSustentado) }}">

                <input type="hidden" id="id_empresa" value="{{ $empresaId }}">
                <input type="hidden" id="nombre_proyecto" value="{{ str_replace('+', ' ', $nombre_proyecto) }}">
                <div id="dataProyectoreports" style="display:none;"></div>
                <div id="mytotal" class="chart--container">
                    <a href="https://www.zingchart.com/" rel="noopener" class="zc-ref">Powered by ZingChart</a>
                </div>
            </div>
        </div>
    </div>
    <script src="{{ asset('assets/js/gestor_reportes_detailsv6.js') }}"></script>
</x-app-layout>
