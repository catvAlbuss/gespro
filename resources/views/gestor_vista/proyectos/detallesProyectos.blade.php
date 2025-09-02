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

    {{-- ======================= MAIN CONTENT ======================= --}}
    <div class="py-2">
        <div class="max-w-full mx-auto sm:px-6 lg:px-8">
            <div id="appDetallesProyectos" class="space-y-2">
                {{-- Controles de configuración --}}
                <div
                    class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div class="flex-1">
                        <p class="text-sm text-gray-500">Ajusta el número de módulos y el tipo de proyecto para ver las
                            tablas correspondientes.</p>
                        <div class="flex items-center gap-3 mt-1">
                            <label class="text-sm font-medium text-gray-700">Plazo Total:</label>
                            <input type="number" id="plazo_total" name="plazo_total"
                                v-model.number="configuracion.plazostotal"
                                :value="{{ old('plazo_total', $plazo_total_pro ?? 5) }}" required autofocus
                                class="w-24 px-3 py-1 border rounded bg-gray-50 dark:bg-gray-700" />

                        </div>
                    </div>
                    <div class="flex items-center gap-3">
                        <button @click="exportarCSV(especialidades[0]?.id)"
                            class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">Exportar CSV</button>
                        <button @click="exportarExcel(especialidades[0]?.id)"
                            class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Exportar Excel</button>
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
                                <p class="text-sm text-gray-500">Porcentaje: <span
                                        class="font-medium">@{{ esp.porcentajeTotal }}%</span> · Estado: <span
                                        :class="getEstadoColor(esp)">@{{ esp.estado }}</span></p>
                            </div>
                        </div>

                        <div :id="`tabla-${esp.id}`" class="border rounded-lg h-96"></div>
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
                plazo_total: @json($plazo_total_pro ?? 0)
            },
            tareas: @json($tareas),
            trabajadores: @json($trabajadores),
            csrfToken: @json(csrf_token())
        };
    </script>

    {{-- ======================= VUE SCRIPTS ======================= --}}
    @vite(['resources/js/proyectos/detalles-proyectos.js'])
</x-app-layout>
