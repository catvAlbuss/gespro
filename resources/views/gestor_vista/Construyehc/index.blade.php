<x-app-layout>
    <x-slot name="header">
        <div class="text-center space-y-2">
            <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                {{ __('Gestion Construye') }}
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
                Seleccione una sección para trabajar.
            </p>

            <div class="flex justify-center">
                <nav>
                    <ul class="flex flex-wrap gap-2">
                        <li>
                            <button data-tab="memoria"
                                class="tab-btn px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition">
                                Memoria de cálculo
                            </button>
                        </li>
                        <li>
                            <button data-tab="metrados"
                                class="tab-btn px-4 py-2 rounded-md bg-gray-600 text-white text-sm font-medium hover:bg-gray-700 transition">
                                Metrados
                            </button>
                        </li>
                        <li>
                            <button data-tab="costos"
                                class="tab-btn px-4 py-2 rounded-md bg-gray-600 text-white text-sm font-medium hover:bg-gray-700 transition">
                                Costos (Presupuestos)
                            </button>
                        </li>
                        <li>
                            <button data-tab="programas"
                                class="tab-btn px-4 py-2 rounded-md bg-gray-600 text-white text-sm font-medium hover:bg-gray-700 transition">
                                Programas HCO
                            </button>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    </x-slot>

    <div class="py-1">
        <div class="max-w-full mx-auto sm:px-3 lg:px-3">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                <div class="p-6 text-gray-900 dark:text-gray-100">
                    <!-- Tabs -->

                    <!-- Sections container -->
                    <div id="sections" class="space-y-6">
                        <!-- Memoria de cálculo -->
                        <section id="memoria" class="tab-panel">
                            <h2 class="text-xl font-semibold mb-3">Memoria de cálculo</h2>
                            <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                <div class="p-4 bg-white dark:bg-gray-900 rounded-lg shadow hover:shadow-md transition">
                                    <h3 class="font-medium">Diseño Sanitarias</h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Acceso rápido a los diseños y
                                        memoria de cálculo.</p>
                                    <div class="mt-3">
                                        <a href="{{ route('construye.sanitarias', ['empresaId' => $empresaId]) }}"
                                            class="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded text-sm">Abrir</a>
                                    </div>
                                </div>
                                <!-- Placeholder cards for other memoria items -->
                                <div class="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
                                    <h3 class="font-medium">Cálculos Estructurales</h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Próximamente.</p>
                                </div>
                                <div class="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
                                    <h3 class="font-medium">Cargas y Esfuerzos</h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Próximamente.</p>
                                </div>
                            </div>
                        </section>

                        <!-- Metrados -->
                        <section id="metrados" class="hidden tab-panel">
                            <h2 class="text-xl font-semibold mb-3">Metrados</h2>
                            <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                <div class="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
                                    <h3 class="font-medium">Instalación Sanitarias</h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Listado y acceso a metrados
                                        sanitarias.</p>
                                    <div class="mt-3">
                                        <a href="{{ route('metrados.sanitarias.index') }}"
                                            class="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded text-sm">Mostrar</a>
                                    </div>
                                </div>

                                <div class="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
                                    <h3 class="font-medium">Instalación Eléctricas</h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Metrados eléctricos y detalles.
                                    </p>
                                    <div class="mt-3">
                                        <a href="{{ route('metrados.electricas.index') }}"
                                            class="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded text-sm">Mostrar</a>
                                    </div>
                                </div>

                                <div class="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
                                    <h3 class="font-medium">Comunicaciones</h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Metrados comunicaciones.</p>
                                    <div class="mt-3">
                                        <a href="{{ route('metrados.comunicacion.index') }}"
                                            class="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded text-sm">Mostrar</a>
                                    </div>
                                </div>

                                <div class="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
                                    <h3 class="font-medium">Gas</h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Metrados de gas.</p>
                                    <div class="mt-3">
                                        <a href="{{ route('metrados.gas.index') }}"
                                            class="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded text-sm">Mostrar</a>
                                    </div>
                                </div>

                                <div class="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
                                    <h3 class="font-medium">Estructuras</h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Metrados de estructuras.</p>
                                    <div class="mt-3">
                                        <a href="{{ route('metrados.estructuras.index') }}"
                                            class="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white rounded text-sm">Mostrar</a>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- Costos / Presupuestos -->
                        <section id="costos" class="hidden tab-panel">
                            <h2 class="text-xl font-semibold mb-3">Costos (Presupuestos)</h2>
                            <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                <div class="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
                                    <h3 class="font-medium">Presupuestos Generales</h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Accede a los presupuestos del
                                        proyecto.</p>
                                    <div class="mt-3">
                                        {{-- <a href="{{ route('presupuestosAcu', ['empresaId' => $empresaId]) }}"
                                            class="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded text-sm">Visualizar</a> --}}
                                    </div>
                                </div>

                                <div class="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
                                    <h3 class="font-medium">Especificaciones Técnicas</h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Documentos y notas técnicas.</p>
                                    <div class="mt-3">
                                        {{-- <a href="{{ route('especificacionesTecnicas', ['empresaId' => $empresaId]) }}"
                                            class="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded text-sm">Mostrar</a> --}}
                                    </div>
                                </div>

                                <div class="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
                                    <h3 class="font-medium">Cronograma</h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Diagramas y planificación
                                        temporal.</p>
                                    <div class="mt-3">
                                        {{-- <a href="{{ route('diagramaGant', ['empresaId' => $empresaId]) }}"
                                            class="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded text-sm">Mostrar</a> --}}
                                    </div>
                                </div>

                                <div class="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
                                    <h3 class="font-medium">Formula Polinómica</h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Enlaces y utilidades
                                        relacionadas con HCO.</p>
                                </div>

                                <div class="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
                                    <h3 class="font-medium">Costos</h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Costos</p>
                                    <div class="mt-3">
                                        <a href="{{ route('costos.index') }}"
                                            class="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded text-sm">Mostrar</a>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <!-- Programas HCO -->
                        <section id="programas" class="hidden tab-panel">
                            <h2 class="text-xl font-semibold mb-3">Programas HCO</h2>
                            <div class="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                <div class="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
                                    <h3 class="font-medium">Cisterna / Tanque</h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Acciones sobre cisterna y
                                        tanque.</p>
                                    <div class="mt-3 space-x-2">
                                        <a href="{{ route('construye.cisterna', ['empresaId' => $empresaId]) }}"
                                            class="inline-flex items-center px-3 py-1.5 bg-yellow-600 text-white rounded text-sm">Cisterna</a>
                                        <a href="{{ route('construye.tanque', ['empresaId' => $empresaId]) }}"
                                            class="inline-flex items-center px-3 py-1.5 bg-yellow-600 text-white rounded text-sm">Tanque</a>
                                    </div>
                                </div>

                                <div class="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
                                    <h3 class="font-medium">Agua / Desague</h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Acciones sobre agua y desague
                                    </p>
                                    <div class="mt-3 space-x-2">
                                        <a href="{{ route('programas.agua', ['empresaId' => $empresaId]) }}"
                                            class="inline-flex items-center px-3 py-1.5 bg-yellow-600 text-white rounded text-sm">Agua</a>
                                        <a href="{{ route('programas.desague', ['empresaId' => $empresaId]) }}"
                                            class="inline-flex items-center px-3 py-1.5 bg-yellow-600 text-white rounded text-sm">Desague</a>
                                    </div>
                                </div>

                                <div class="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
                                    <h3 class="font-medium">Aire Acondicionado</h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Enlaces y utilidades
                                        relacionadas con HCO.</p>
                                    <a href="{{ route('programas.aire', ['empresaId' => $empresaId]) }}"
                                        class="inline-flex items-center px-3 py-1.5 bg-yellow-600 text-white rounded text-sm">Aire
                                        Acondicionado</a>
                                </div>

                                <div class="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
                                    <h3 class="font-medium">Caida Tension</h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Enlaces y utilidades
                                        relacionadas con HCO.</p>
                                    <a href="{{ route('programas.tension', ['empresaId' => $empresaId]) }}"
                                        class="inline-flex items-center px-3 py-1.5 bg-yellow-600 text-white rounded text-sm">Caida
                                        Tension </a>
                                </div>

                                <div class="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
                                    <h3 class="font-medium">Pozo a Tierra y Pararrayo</h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Enlaces y utilidades
                                        relacionadas con HCO.</p>
                                    <a href="{{ route('programas.pozo', ['empresaId' => $empresaId]) }}"
                                        class="inline-flex items-center px-3 py-1.5 bg-yellow-600 text-white rounded text-sm">Pozo
                                        a tierra y pararrayo</a>
                                </div>

                                <div class="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
                                    <h3 class="font-medium">Pruebas de Metrados</h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400"></p>
                                    <a href="{{ route('programas.metrados', ['empresaId' => $empresaId]) }}"
                                        class="inline-flex items-center px-3 py-1.5 bg-yellow-600 text-white rounded text-sm">Metrados</a>
                                </div>
                            </div>
                        </section>
                    </div>

                    <!-- Small script to switch tabs without Alpine/JS frameworks -->
                    <script>
                        (function() {
                            const buttons = document.querySelectorAll('.tab-btn');
                            const panels = document.querySelectorAll('.tab-panel');

                            function showTab(name) {
                                panels.forEach(p => {
                                    if (p.id === name) {
                                        p.classList.remove('hidden');
                                    } else {
                                        p.classList.add('hidden');
                                    }
                                });
                                buttons.forEach(b => b.classList.remove('bg-blue-50', 'dark:bg-blue-900', 'text-blue-700',
                                    'dark:text-blue-200'));
                                const active = Array.from(buttons).find(b => b.dataset.tab === name);
                                if (active) {
                                    active.classList.add('bg-blue-50', 'dark:bg-blue-900', 'text-blue-700', 'dark:text-blue-200');
                                }
                            }

                            buttons.forEach(b => {
                                b.addEventListener('click', () => showTab(b.dataset.tab));
                            });

                            // Default show memoria
                            showTab('memoria');
                        })();
                    </script>

                </div>
            </div>
        </div>
    </div>
</x-app-layout>
