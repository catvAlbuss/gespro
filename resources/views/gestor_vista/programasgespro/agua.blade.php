<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Sistema de Cálculo de Agua') }}
        </h2>
        <p class="text-gray-200">Gestión integral de sistemas de agua</p>
    </x-slot>

    <!-- CSS Libraries -->
    <link href="https://unpkg.com/tabulator-tables@6.3.1/dist/css/tabulator.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
        integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />
    <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>
    <!-- JavaScript Libraries (sin Alpine.js ya que se carga en app.js) -->
    <script type="text/javascript" src="https://unpkg.com/tabulator-tables@6.3.1/dist/js/tabulator.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>

    <style>
        .tabulator-modern {
            border: none;
            font-size: 14px;
        }

        .tabulator-modern .tabulator-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
        }

        .tabulator-modern .tabulator-col {
            background: transparent;
            border: none;
            border-right: 1px solid rgba(255, 255, 255, 0.2);
        }

        .tabulator-modern .tabulator-col-title {
            color: white;
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .tabulator-modern .tabulator-row {
            border-bottom: 1px solid #e2e8f0;
        }

        .tabulator-modern .tabulator-row:hover {
            background-color: #f8fafc;
        }

        .tabulator-modern .tabulator-cell {
            border: none;
            border-right: 1px solid #e2e8f0;
            padding: 12px 8px;
        }

        .tabulator-modern .tabulator-cell:last-child {
            border-right: none;
        }

        .tabulator-modern .tabulator-cell input {
            width: 100%;
            padding: 4px 8px;
            border: 1px solid #d1d5db;
            border-radius: 4px;
            font-size: 13px;
        }

        .tabulator-modern .tabulator-cell input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .delete-btn:hover {
            transform: scale(1.05);
        }

        /* Evitar scroll horizontal innecesario */
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }

        /* Loading animation */
        .pulse-loader {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(59, 130, 246, 0.3);
            border-radius: 50%;
            border-top-color: #3b82f6;
            animation: spin 1s ease-in-out infinite;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }

        /* Sistema de agua específico */
        .agua-system-container {
            position: relative;
            min-height: 400px;
        }

        /* Debug info (remover en producción) */
        .debug-info {
            position: fixed;
            bottom: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
            display: none;
            /* Ocultar en producción */
        }
    </style>

    <!-- Contenedor principal -->
    <div id="agua-system-app" data-module="programasgespro/mainAgua" class="agua-system-container w-full">
        <!-- Debug Info (opcional, para desarrollo) -->
        <div class="debug-info" x-show="false"
            x-text="`Active: ${activeTab}, Init: ${isInitialized}, Modules: ${modulesLoaded}`"></div>

        <!-- Tab Navigation -->
        <div
            class="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg shadow-lg mb-4 overflow-hidden bg-white/80 backdrop-blur-lg border-b border-slate-200/60 shadow-lg sticky top-0 z-50">
            <div class="border-b border-blue-100">
                <div class="overflow-x-auto scrollbar-hide">
                    <nav class="flex whitespace-nowrap min-w-full">
                        <template x-for="(tab, index) in tabs" :key="`tab-${tab.id}-${index}`">
                            <button @click="changeTab(tab.id)"
                                :class="activeTab === tab.id ?
                                    'border-cyan-500 bg-gradient-to-b from-cyan-50 to-blue-50 text-cyan-700' :
                                    'border-transparent text-gray-600 hover:text-cyan-600 hover:bg-cyan-50/50'"
                                :disabled="!isInitialized"
                                class="flex items-center space-x-2 px-4 py-3 border-b-2 font-medium text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                <i :class="'fas ' + tab.icon + ' text-xs'"></i>
                                <span x-text="tab.name" class="hidden sm:inline"></span>
                                <span x-text="tab.name.split(' ')[0]" class="sm:hidden"></span>
                            </button>
                        </template>
                    </nav>
                </div>
            </div>
        </div>

        <!-- Tab Content Container -->
        <div class="bg-gradient-to-br from-white to-cyan-50/30 rounded-lg shadow-lg border border-blue-100/50 min-h-96">

            <!-- Loading State -->
            <div x-show="!isInitialized" class="p-8 text-center">
                <div class="flex items-center justify-center space-x-3 mb-4">
                    <div class="pulse-loader"></div>
                    <span class="text-gray-600">Inicializando sistema de agua...</span>
                </div>
                <div class="animate-pulse space-y-3">
                    <div class="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    <div class="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                    <div class="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
                </div>
            </div>

            <!-- Error State (si hay problemas) -->
            <div x-show="isInitialized && !modulesLoaded" class="p-8 text-center">
                <div class="text-red-600 mb-4">
                    <i class="fas fa-exclamation-triangle text-2xl"></i>
                </div>
                <p class="text-red-600 font-medium">Error al cargar los módulos del sistema</p>
                <p class="text-gray-500 text-sm mt-2">Revisa la consola para más detalles</p>
                <button @click="location.reload()"
                    class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                    Recargar página
                </button>
            </div>

            <!-- Tab Contents - Crear todos los contenedores inmediatamente -->
            <div class="relative">
                <!-- Demanda Diaria Tab -->
                <div x-show="activeTab === 'demandaDiaria'" x-transition:enter="transition ease-out duration-300"
                    x-transition:enter-start="opacity-0 transform translate-y-4"
                    x-transition:enter-end="opacity-100 transform translate-y-0">
                    <div id="demandaDiaria-content" class="p-4"></div>
                </div>

                <!-- Cisterna Tab -->
                <div x-show="activeTab === 'cisterna'" x-transition:enter="transition ease-out duration-300"
                    x-transition:enter-start="opacity-0 transform translate-y-4"
                    x-transition:enter-end="opacity-100 transform translate-y-0">
                    <div id="cisterna-content" class="p-4"></div>
                </div>

                <!-- Tanque Tab -->
                <div x-show="activeTab === 'tanque'" x-transition:enter="transition ease-out duration-300"
                    x-transition:enter-start="opacity-0 transform translate-y-4"
                    x-transition:enter-end="opacity-100 transform translate-y-0">
                    <div id="tanque-content" class="p-4"></div>
                </div>

                <!-- Red Alimentacion Tab -->
                <div x-show="activeTab === 'redAlimentacion'" x-transition:enter="transition ease-out duration-300"
                    x-transition:enter-start="opacity-0 transform translate-y-4"
                    x-transition:enter-end="opacity-100 transform translate-y-0">
                    <div id="red-alimentacion-content" class="p-4"></div>
                </div>

                <!-- Maxima demanda simultanea Tab -->
                <div x-show="activeTab === 'maximademandasimultanea'"
                    x-transition:enter="transition ease-out duration-300"
                    x-transition:enter-start="opacity-0 transform translate-y-4"
                    x-transition:enter-end="opacity-100 transform translate-y-0">
                    <div id="maximademanda-simultanea-content" class="p-4"></div>
                </div>

                <!-- Bombeo al Tanque Elevado Tab -->
                <div x-show="activeTab === 'bombeoTanqueElevado'" x-transition:enter="transition ease-out duration-300"
                    x-transition:enter-start="opacity-0 transform translate-y-4"
                    x-transition:enter-end="opacity-100 transform translate-y-0">
                    <div id="bombeo-tanque-elevado-content" class="p-4"></div>
                </div>

                <!-- Tuberia RD Grades Tab -->
                <div x-show="activeTab === 'tuberiasRD'" x-transition:enter="transition ease-out duration-300"
                    x-transition:enter-start="opacity-0 transform translate-y-4"
                    x-transition:enter-end="opacity-100 transform translate-y-0">
                    <div id="tuberias-rd-grades-content" class="p-4"></div>
                </div>

                <!-- Redes Interiores Grades Tab -->
                <div x-show="activeTab === 'redesInteriores'" x-transition:enter="transition ease-out duration-300"
                    x-transition:enter-start="opacity-0 transform translate-y-4"
                    x-transition:enter-end="opacity-100 transform translate-y-0">
                    <div id="redes-interiores-grades-content" class="p-4"></div>
                </div>

                <!-- Red de Riego Tab -->
                <div x-show="activeTab === 'redRiego'" x-transition:enter="transition ease-out duration-300"
                    x-transition:enter-start="opacity-0 transform translate-y-4"
                    x-transition:enter-end="opacity-100 transform translate-y-0">
                    <div id="red-griego-content" class="p-4"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- Vite ya maneja la carga de scripts, no necesitamos script tag aquí -->
</x-app-layout>
