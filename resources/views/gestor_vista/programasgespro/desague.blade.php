<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Sistema de Cálculo de Desagüe') }}
        </h2>
        <p class="text-gray-200">Gestión integral de sistemas de desagüe</p>
    </x-slot>

    <!-- CSS Libraries -->
    <link href="https://unpkg.com/tabulator-tables@6.3.1/dist/css/tabulator.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
        integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />

    <!-- JavaScript Libraries (sin Alpine.js ya que se carga en app.js) -->
    <script type="text/javascript" src="https://unpkg.com/tabulator-tables@6.3.1/dist/js/tabulator.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>

    <div x-data="desagueSystem" class="desague-system-container w-full">
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

            <!-- Tab Content -->
            <div class="relative">
                <!-- UD Tab -->
                <div x-show="activeTab === 'ud'" x-transition:enter="transition ease-out duration-300"
                    x-transition:enter-start="opacity-0 transform translate-y-4"
                    x-transition:enter-end="opacity-100 transform translate-y-0">
                    <div id="ud-content" class="p-4"></div>
                </div>

                <!-- Colector Tab -->
                <div x-show="activeTab === 'colector'" x-transition:enter="transition ease-out duration-300"
                    x-transition:enter-start="opacity-0 transform translate-y-4"
                    x-transition:enter-end="opacity-100 transform translate-y-0">
                    <div id="colector-content" class="p-4"></div>
                </div>

                <!-- Cajas de Registro Tab -->
                <div x-show="activeTab === 'cajas'" x-transition:enter="transition ease-out duration-300"
                    x-transition:enter-start="opacity-0 transform translate-y-4"
                    x-transition:enter-end="opacity-100 transform translate-y-0">
                    <div id="cajas-content" class="p-4"></div>
                </div>

                <!-- UV Tab -->
                <div x-show="activeTab === 'uv'" x-transition:enter="transition ease-out duration-300"
                    x-transition:enter-start="opacity-0 transform translate-y-4"
                    x-transition:enter-end="opacity-100 transform translate-y-0">
                    <div id="uv-content" class="p-4"></div>
                </div>

                <!-- Trampa de Grasa Tab -->
                <div x-show="activeTab === 'trampa'" x-transition:enter="transition ease-out duration-300"
                    x-transition:enter-start="opacity-0 transform translate-y-4"
                    x-transition:enter-end="opacity-100 transform translate-y-0">
                    <div id="trampa-content" class="p-4"></div>
                </div>
                
            </div>

            <!-- Status Bar -->
            <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <div class="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span class="text-sm text-gray-700">Sistema activo</span>
                    </div>
                    <div class="text-sm text-gray-600">
                        Grados configurados: <span x-text="getSelectedGrades().join(', ') || 'Ninguno'"></span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
