<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Área Contable - Informes de Personal') }}
        </h2>
    </x-slot>

    <div class="py-6 max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">

            {{-- Caso: Usuario individual --}}
            @isset($datos)
                <h3 class="text-lg font-bold text-gray-700 dark:text-gray-300 mb-4">
                    Informe del trabajador
                </h3>

                <div class="mb-6 border rounded-lg p-4 shadow-sm bg-gray-50 dark:bg-gray-900">
                    <p><span class="font-semibold">Nombre:</span> {{ $datos['nombre'] }} {{ $datos['apellido'] }}</p>
                    <p><span class="font-semibold">DNI:</span> {{ $datos['dni'] }}</p>
                    <p><span class="font-semibold">Área laboral:</span> {{ $datos['area_laboral'] }}</p>
                    <p><span class="font-semibold">Sueldo:</span> S/ {{ number_format($datos['sueldo'], 2) }}</p>
                    <p><span class="font-semibold">Empresa:</span> {{ $datos['empresa'] ?? 'N/A' }}</p>
                    <p><span class="font-semibold">Total Actividades:</span> {{ $datos['total_actividades'] ?? 0 }}</p>
                    <p><span class="font-semibold">Total Días Asignados:</span> {{ $datos['total_dias_asignados'] ?? 0 }}
                    </p>
                </div>

                <h4 class="text-md font-semibold mb-2">Actividades del mes</h4>
                <div class="overflow-x-auto">
                    <table class="min-w-full border border-gray-300 dark:border-gray-700 rounded-lg">
                        <thead class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                            <tr>
                                <th class="px-4 py-3 border">Nombre Actividad</th>
                                <th class="px-4 py-3 border">Proyecto</th>
                                <th class="px-4 py-3 border">Fecha</th>
                                <th class="px-4 py-3 border">Días Asignados</th>
                                <th class="px-4 py-3 border">Progreso</th>
                                <th class="px-4 py-3 border">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($datos['actividades'] as $actividad)
                                <tr class="hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <td class="px-4 py-3 border">{{ $actividad['nameActividad'] ?? '-' }}</td>
                                    <td class="px-4 py-3 border">{{ $actividad['proyecto'] ?? 'Sin proyecto' }}</td>
                                    <td class="px-4 py-3 border">
                                        {{ \Carbon\Carbon::parse($actividad['fecha'])->format('d/m/Y') }}</td>
                                    <td class="px-4 py-3 border text-center">{{ $actividad['diasAsignados'] ?? 0 }}</td>
                                    <td class="px-4 py-3 border">
                                        <div class="flex items-center">
                                            <div class="w-full bg-gray-200 rounded-full h-2 mr-2">
                                                <div class="bg-blue-600 h-2 rounded-full"
                                                    style="width: {{ $actividad['porcentajeTarea'] ?? 0 }}%"></div>
                                            </div>
                                            <span class="text-sm">{{ $actividad['porcentajeTarea'] ?? 0 }}%</span>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 border">
                                        <span
                                            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            {{ ucfirst($actividad['status']) }}
                                        </span>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                                        <div class="flex flex-col items-center">
                                            <svg class="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor"
                                                viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                                </path>
                                            </svg>
                                            <p>No hay actividades registradas este mes</p>
                                        </div>
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            @endisset

            {{-- Caso: Empresa - Vista con Cards --}}
            @isset($resultados)
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-lg font-bold text-gray-700 dark:text-gray-300">
                        Personal de {{ $empresa->razonSocial }}
                    </h3>
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                        Total empleados: {{ count($resultados) }}
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    @forelse($resultados as $index => $user)
                        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                            onclick="openModal({{ $index }})">
                            <div class="p-6">
                                <!-- Header del Card -->
                                <div class="flex items-center mb-4">
                                    <div
                                        class="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <span class="text-white font-semibold text-lg">
                                            {{ substr($user['nombre'], 0, 1) }}{{ substr($user['apellido'], 0, 1) }}
                                        </span>
                                    </div>
                                    <div class="ml-4 flex-1">
                                        <h4 class="text-lg font-semibold text-gray-900 dark:text-white">
                                            {{ $user['nombre'] }} {{ $user['apellido'] }}
                                        </h4>
                                        <p class="text-sm text-gray-600 dark:text-gray-400">{{ $user['area_laboral'] }}</p>
                                    </div>
                                </div>

                                <!-- Información básica -->
                                <div class="space-y-2 mb-4">
                                    <div class="flex justify-between items-center">
                                        <span class="text-sm text-gray-600 dark:text-gray-400">DNI:</span>
                                        <span
                                            class="text-sm font-medium text-gray-900 dark:text-white">{{ $user['dni'] }}</span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <span class="text-sm text-gray-600 dark:text-gray-400">Sueldo:</span>
                                        <span class="text-sm font-medium text-gray-900 dark:text-white">S/
                                            {{ number_format($user['sueldo'], 2) }}</span>
                                    </div>
                                </div>

                                <!-- Estadísticas de actividades -->
                                <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                                    <div class="flex justify-between items-center">
                                        <div class="text-center">
                                            <div class="text-2xl font-bold text-blue-600">
                                                {{ $user['total_actividades'] ?? 0 }}</div>
                                            <div class="text-xs text-gray-600 dark:text-gray-400">Actividades</div>
                                        </div>
                                        <div class="text-center">
                                            <div class="text-2xl font-bold text-green-600">
                                                {{ $user['total_dias_asignados'] ?? 0 }}</div>
                                            <div class="text-xs text-gray-600 dark:text-gray-400">Días Total</div>
                                        </div>
                                        <div class="text-center">
                                            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor"
                                                viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M9 5l7 7-7 7"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    @empty
                        <div class="col-span-full text-center py-12">
                            <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM9 9a2 2 0 11-4 0 2 2 0 014 0z">
                                </path>
                            </svg>
                            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay empleados</h3>
                            <p class="text-gray-600 dark:text-gray-400">No se encontraron empleados registrados en esta
                                empresa.</p>
                        </div>
                    @endforelse
                </div>
            @endisset

        </div>
    </div>

    {{-- Modal para mostrar actividades --}}
    @isset($resultados)
        <div id="actividadesModal"
            class="fixed inset-0 bg-black bg-opacity-50 hidden z-50 flex items-center justify-center p-4">
            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <!-- Header del Modal -->
                <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h3 id="modalTitle" class="text-xl font-semibold text-gray-900 dark:text-white"></h3>
                        <p id="modalSubtitle" class="text-sm text-gray-600 dark:text-gray-400 mt-1"></p>
                    </div>
                    <button onclick="closeModal()"
                        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <!-- Contenido del Modal -->
                <div class="p-6 max-h-[60vh] overflow-y-auto">
                    <div id="modalContent">
                        <!-- Aquí se cargará dinámicamente el contenido -->
                    </div>
                </div>
            </div>
        </div>

        <script>
            const resultados = @json($resultados);

            function openModal(index) {
                const user = resultados[index];
                const modal = document.getElementById('actividadesModal');
                const title = document.getElementById('modalTitle');
                const subtitle = document.getElementById('modalSubtitle');
                const content = document.getElementById('modalContent');

                // Actualizar título
                title.textContent = `${user.nombre} ${user.apellido}`;
                subtitle.textContent = `${user.area_laboral} - DNI: ${user.dni}`;

                // Generar contenido de actividades
                let actividades = '';
                if (user.actividades && user.actividades.length > 0) {
                    actividades =
                        `
                        <div class="overflow-x-auto">
                            <table class="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                                <thead class="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border">Actividad</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border">Proyecto</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border">Fecha</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border">Días</th>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border">Progreso</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">`;

                    user.actividades.forEach(actividad => {
                        const fecha = new Date(actividad.fecha).toLocaleDateString('es-PE');
                        actividades += `
                            <tr class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <td class="px-4 py-3 border text-sm text-gray-900 dark:text-white">${actividad.nameActividad || '-'}</td>
                                <td class="px-4 py-3 border text-sm text-gray-600 dark:text-gray-300">${actividad.proyecto || 'Sin proyecto'}</td>
                                <td class="px-4 py-3 border text-sm text-gray-600 dark:text-gray-300">${fecha}</td>
                                <td class="px-4 py-3 border text-sm text-center text-gray-600 dark:text-gray-300">${actividad.diasAsignados || 0}</td>
                                <td class="px-4 py-3 border">
                                    <div class="flex items-center">
                                        <div class="w-full bg-gray-200 rounded-full h-2 mr-2">
                                            <div class="bg-blue-600 h-2 rounded-full" style="width: ${actividad.porcentajeTarea || 0}%"></div>
                                        </div>
                                        <span class="text-sm text-gray-600 dark:text-gray-300">${actividad.porcentajeTarea || 0}%</span>
                                    </div>
                                </td>
                            </tr>`;
                    });

                    actividades += `
                                </tbody>
                            </table>
                        </div>`;
                } else {
                    actividades = `
                        <div class="text-center py-12">
                            <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <p class="text-gray-500 dark:text-gray-400">No hay actividades registradas este mes</p>
                        </div>`;
                }

                content.innerHTML = actividades;
                modal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            }

            function closeModal() {
                const modal = document.getElementById('actividadesModal');
                modal.classList.add('hidden');
                document.body.style.overflow = 'auto';
            }

            // Cerrar modal al hacer click fuera
            document.getElementById('actividadesModal').addEventListener('click', function(e) {
                if (e.target === this) {
                    closeModal();
                }
            });

            // Cerrar modal con tecla Escape
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    closeModal();
                }
            });
        </script>
    @endisset
</x-app-layout>
