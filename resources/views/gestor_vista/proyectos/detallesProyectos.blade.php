<x-app-layout>
    <x-slot name="header">
        <div>
            <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                {{ __('PROYECTO ') }} {{ $nombre_proyecto }}
            </h2>
            <h1 id="porcentaje_Total" class="text-lg font-medium text-gray-700 dark:text-gray-300"></h1>
        </div>
    </x-slot>

    {{-- ======================= STYLES & SCRIPTS ======================= --}}
    <link href="https://cdn.jsdelivr.net/npm/tabulator-tables@6.3.1/dist/css/tabulator.min.css" rel="stylesheet">
    <script type="text/javascript" src="https://unpkg.com/tabulator-tables@6.3.1/dist/js/tabulator.min.js"></script>
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <style>
        .tabulator {
            border-radius: 0.75rem;
            /* Bordes suaves */
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
            font-size: 0.9rem;
        }

        .tabulator .tabulator-header {
            background: #f3f4f6;
            /* gris claro */
            font-weight: 600;
            text-align: center;
        }

        .tabulator .tabulator-row {
            background: #ffffff;
        }

        .tabulator .tabulator-row:nth-child(even) {
            background: #f9fafb;
            /* alterna filas */
        }

        .tabulator .tabulator-row.tabulator-selected {
            background: #2563eb !important;
            /* azul corporativo */
            color: white;
        }
    </style>
    {{-- ======================= MAIN CONTENT ======================= --}}
    <div class="py-2">
        <div class="max-w-full mx-auto sm:px-2 lg:px-4">
            <div id="appDetallesProyectos" class="space-y-2">
                {{-- Controles de configuración --}}
                <div
                    class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div class="flex-1">
                        <p class="text-sm text-gray-700 dark:text-gray-50">Información del proyecto:</p>
                        <div class="flex items-center gap-3 mt-1">
                            <p class="text-lg font-semibold text-gray-700 dark:text-gray-200">
                                Plazo Planificado:
                                <span class="text-blue-600">
                                    @{{ diasTotalesProyecto.planificados }}
                                </span>
                            </p>

                            <p class="text-lg font-semibold text-gray-700 dark:text-gray-200">
                                Total Dias Ejecutado:
                                <span class="text-blue-600">
                                    @{{ diasTotalesProyecto.ejecutados }}
                                </span>
                            </p>


                            <p class="text-lg font-semibold text-gray-700 dark:text-gray-200">
                                % General del Proyecto:
                                <span class="text-blue-600">
                                    @{{ porcentajeGeneralProyecto }}%
                                </span>
                            </p>

                            <p class="text-lg font-semibold text-gray-700 dark:text-gray-200">
                                # Módulos:
                                <span class="text-blue-600">
                                    @{{ configuracion.numeroModulos }}
                                </span>
                            </p>

                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <button @click="guardarDocumento()"
                            class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Guardar
                            Proyectos</button>
                    </div>
                </div>

                {{-- Especialidades y tablas dinámicas --}}
                <div class="grid grid-cols-1 md:grid-cols-1 gap-2">
                    <div v-for="esp in visibleEspecialidades" :key="esp.id"
                        class="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                        <div class="flex items-center justify-between mb-3">
                            <div>
                                <h4 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                    @{{ esp.nombre }}</h4>
                                <p class="text-sm text-gray-600 dark:text-gray-300">
                                    Porcentaje de Avance:
                                    <span class="font-medium text-gray-800 dark:text-gray-100">
                                        @{{ esp.porcentajeAvance }}%
                                    </span>
                                    · Estado:
                                    <span :class="getEstadoColor(estadoGeneral)">
                                        @{{ esp.estado }}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div :id="`tabla-${esp.id}`" class="border rounded-lg h-96 w-full overflow-x-auto"></div>

                    </div>
                </div>
            </div>
        </div>
    </div>

    {{-- ======================= DATA INITIALIZATION ======================= --}}
    <script>
        window.APP_INIT = {
            proyecto: {
                id: @json($id),
                empresa_id: @json($empresa_id),
                nombre_proyecto: @json($nombre_proyecto),
                documento_proyecto: @json($documento_proyecto),
                plazo_total: @json($plazo_total_pro ?? 0),
                porcentaje_total: @json($porcentaje_total ?? 0),
                especialidades: @json($especialidades),
                cantidad_modulos: @json($cantidad_modulos ?? 0),
                especialidades_porcentaje: @json($especialidades_porcentaje),
            },
            tareas: @json($tareas),
            trabajadores: @json($trabajadores),
            csrfToken: @json(csrf_token())
        };

    </script>

</x-app-layout>
