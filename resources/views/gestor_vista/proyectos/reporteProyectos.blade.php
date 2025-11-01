<x-app-layout>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.zingchart.com/zingchart.min.js"></script>
    <script src="https://cdn.zingchart.com/modules/zingchart-grid.min.js"></script>
    <script src="https://cdn.zingchart.com/modules/zingchart-treemap.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    <div id="appreportesProyecto" data-module="proyectos/reporteProyectos" class="min-h-screen">
        <x-slot name="header">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="font-bold text-2xl text-gray-900 dark:text-gray-100 leading-tight">
                        {{ __('Reporte del Proyecto') }}
                        <span class="text-blue-600">{{ $paquetes['proyecto']->nombre_proyecto ?? 'Cargando...' }}</span>
                    </h2>
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Análisis detallado del proyecto y sus métricas
                    </p>
                </div>
            </div>
        </x-slot>

        <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <!-- Spinner de carga elegante -->
            <div v-if="state.loading" class="flex items-center justify-center h-64">
                <div class="flex flex-col items-center space-y-4">
                    <div class="relative">
                        <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                        <div
                            class="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0">
                        </div>
                    </div>
                    <div class="text-center">
                        <p class="text-lg font-medium text-gray-700 dark:text-gray-300">Cargando reporte del proyecto
                        </p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Analizando datos y generando gráficas...</p>
                    </div>
                </div>
            </div>

            <!-- Estado de error mejorado -->
            <div v-if="state.error" class="m-6">
                <div class="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-400 rounded-lg p-6 shadow-lg">
                    <div class="flex items-start">
                        <div class="flex-shrink-0">
                            <i class="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
                        </div>
                        <div class="ml-4 flex-1">
                            <h3 class="text-lg font-semibold text-red-800">Error al cargar el reporte</h3>
                            <p class="text-red-700 mt-2">@{{ state.error }}</p>
                            <button @click="reintentar"
                                class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                <i class="fas fa-redo mr-2"></i>
                                Reintentar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contenido principal -->
            <div class="container w-full mx-auto px-1 py-1">
                <div v-show="!state.loading && !state.error" id="dataProyectoreports"
                    class="chart--container w-full">
                    <a href="https://www.zingchart.com/" rel="noopener" class="zc-ref">Powered by ZingChart</a>
                </div>
                <div id="contenedorId"></div>    
            </div>

            <!-- Modal de Presupuestos -->
            {{-- <div v-if="modales.presupuestos" class="fixed inset-0 z-50 overflow-y-auto">
                <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <!-- Overlay -->
                    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="cerrarModalPresupuestos"></div>
                    
                    <!-- Modal -->
                    <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                        <div class="bg-white dark:bg-gray-800 px-6 pt-6 pb-4">
                            <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-600 pb-4">
                                <h3 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                                    <i class="fas fa-chart-pie mr-3 text-blue-600"></i>
                                    Análisis de Presupuestos
                                </h3>
                                <button @click="cerrarModalPresupuestos" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                    <i class="fas fa-times text-xl"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="px-6 py-4 max-h-96 overflow-y-auto">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <!-- Contenido del modal de presupuestos -->
                                <div class="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl p-6">
                                    <h4 class="font-semibold text-blue-900 dark:text-blue-100 mb-4">Presupuesto Total</h4>
                                    <p class="text-3xl font-bold text-blue-700 dark:text-blue-300">$125,000.00</p>
                                    <p class="text-blue-600 dark:text-blue-400 text-sm mt-2">Asignado al proyecto</p>
                                </div>
                                
                                <div class="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-xl"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div> --}}

            <script>
                window.APP_INIT = {
                    paquetes: @json($paquetes),
                }
            </script>
        </div>
    </div>
</x-app-layout>
