<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Sistema de Caida Tension') }}
        </h2>
    </x-slot>

    <!-- CSS Libraries -->
    <link href="https://unpkg.com/tabulator-tables@6.3.1/dist/css/tabulator.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
        integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
        crossorigin="anonymous" referrerpolicy="no-referrer" />
    @push('styles')
        @vite('resources/css/caidatension.css')
    @endpush

    <!-- JavaScript Libraries (sin Alpine.js ya que se carga en app.js) -->
    <script type="text/javascript" src="https://unpkg.com/tabulator-tables@6.3.1/dist/js/tabulator.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js"></script>

    <div class="bg-gray-50">
        <div x-data="caidatensionSystem" class="max-w-full mx-auto p-2">
            <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                <!-- Navigation Tabs -->
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

                <!-- Tab Content -->
                <main class="w-full">
                    <!-- TD Tab Content -->
                    <div x-show="activeTab === 'td'" x-transition:enter="transition ease-out duration-300"
                        x-transition:enter-start="opacity-0 transform translate-y-4"
                        x-transition:enter-end="opacity-100 transform translate-y-0">
                        <div id="td-content" class="p-4"></div>
                    </div>

                    <!-- TG Tab Content -->
                    <div x-show="activeTab === 'tg'" x-transition:enter="transition ease-out duration-300"
                        x-transition:enter-start="opacity-0 transform translate-y-4"
                        x-transition:enter-end="opacity-100 transform translate-y-0">
                        <div id="tg-content" class="p-4"></div>
                    </div>

                    <!-- selector Tab Content -->
                    <div x-show="activeTab === 'selection'" x-transition:enter="transition ease-out duration-300"
                        x-transition:enter-start="opacity-0 transform translate-y-4"
                        x-transition:enter-end="opacity-100 transform translate-y-0">
                        <div id="selection-content" class="p-4"></div>
                    </div>
                </main>
            </div>
        </div>
    </div>

</x-app-layout>
