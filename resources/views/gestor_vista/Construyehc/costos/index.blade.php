<x-app-layout>
    <x-slot name="header">
        <h2 class="font-bold text-2xl text-gray-800 dark:text-gray-200 leading-tight flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {{ __('Costos') }}
        </h2>
    </x-slot>

    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <div class="py-2">
        <div
            class="bg-white dark:bg-gray-800 overflow-hidden shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl">
            <div class="p-6">
                <!-- Header con botón y estadísticas -->
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Lista de Proyectos de Costos
                        </h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Total: <span
                                class="font-semibold">{{ $costos->count() }}</span> proyectos</p>
                    </div>
                    <button onclick="openWizard()"
                        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4">
                            </path>
                        </svg>
                        Nuevo Proyecto
                    </button>
                </div>

                <!-- Controles de tabla -->
                <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                    <div class="flex items-center gap-2">
                        <label class="text-sm text-gray-700 dark:text-gray-300">Mostrar:</label>
                        <select id="entriesPerPage" onchange="updateTable()"
                            class="px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500">
                            <option value="5">5</option>
                            <option value="10" selected>10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div class="relative">
                        <input type="text" id="searchInput" onkeyup="searchTable()" placeholder="Buscar proyecto..."
                            class="pl-10 pr-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500">
                        <svg class="absolute left-3 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                    </div>
                </div>

                <!-- Tabla mejorada -->
                <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table id="costosTable" class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead class="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th
                                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    <div class="flex items-center gap-2">
                                        <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                            </path>
                                        </svg>
                                        Proyecto
                                    </div>
                                </th>
                                <th
                                    class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    <div class="flex items-center justify-center gap-2">
                                        <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z">
                                            </path>
                                        </svg>
                                        Fecha
                                    </div>
                                </th>
                                <th
                                    class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    <div class="flex items-center justify-center gap-2">
                                        <svg class="w-5 h-5 text-green-500" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z">
                                            </path>
                                        </svg>
                                        Códigos
                                    </div>
                                </th>
                                <th
                                    class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    <div class="flex items-center justify-center gap-2">
                                        <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z">
                                            </path>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        </svg>
                                        Ubicación
                                    </div>
                                </th>
                                <th
                                    class="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            @forelse ($costos as $costo)
                                <tr class="hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150">
                                    <td class="px-6 py-4">
                                        <div class="flex items-start">
                                            <div
                                                class="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                                <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none"
                                                    stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4">
                                                    </path>
                                                </svg>
                                            </div>
                                            <div class="ml-4">
                                                <div
                                                    class="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                                                    {{ $costo->name }}
                                                </div>
                                                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    UE: {{ $costo->unidad_ejecutora }}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td class="px-6 py-4 text-center">
                                        <span class="text-sm text-gray-900 dark:text-gray-100">{{ $costo->fecha }}</span>
                                    </td>

                                    <td class="px-6 py-4">
                                        <div class="flex flex-col gap-1">
                                            <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded">
                                                UEI: {{ $costo->codigouei }}
                                            </span>
                                            <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                                                SNIP: {{ $costo->codigosnip }}
                                            </span>
                                        </div>
                                    </td>

                                    <td class="px-6 py-4 text-center">
                                        <div class="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                                            {{ $costo->region }}, {{ $costo->provincia }}
                                        </div>
                                        <div class="text-xs text-gray-500 dark:text-gray-400">
                                            {{ $costo->distrito }}{{ $costo->centropoblado ? ', ' . $costo->centropoblado : '' }}
                                        </div>
                                    </td>

                                    <td class="px-6 py-4">
                                        <div class="flex justify-center gap-2">
                                            <form action="{{ route('costos.control') }}" method="POST"
                                                style="display:inline;">
                                                @csrf
                                                <input type="hidden" name="id" value="{{ $costo->id }}">
                                                <button type="submit" title="Visualizar"
                                                    class="p-2 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900 rounded-lg transition-colors">
                                                    <svg class="w-5 h-5" fill="none" stroke="currentColor"
                                                        viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z">
                                                        </path>
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z">
                                                        </path>
                                                    </svg>
                                                </button>
                                            </form>

                                            <button onclick="openWizard('edit', {{ $costo->id }})" title="Editar"
                                                class="p-2 text-yellow-600 hover:bg-yellow-100 dark:text-yellow-400 dark:hover:bg-yellow-900 rounded-lg transition-colors">
                                                <svg class="w-5 h-5" fill="none" stroke="currentColor"
                                                    viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                                                    </path>
                                                </svg>
                                            </button>

                                            <form action="{{ route('costos.destroy', $costo->id) }}" method="POST"
                                                onsubmit="return confirmDelete(event, this);"
                                                style="display: inline;">
                                                @csrf
                                                @method('DELETE')
                                                <button type="submit" title="Eliminar"
                                                    class="p-2 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900 rounded-lg transition-colors">
                                                    <svg class="w-5 h-5" fill="none" stroke="currentColor"
                                                        viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                                                        </path>
                                                    </svg>
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="px-6 py-12 text-center">
                                        <svg class="mx-auto h-16 w-16 text-gray-400" fill="none"
                                            stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                            </path>
                                        </svg>
                                        <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No hay
                                            proyectos registrados</h3>
                                        <p class="mt-1 text-gray-500 dark:text-gray-400">Comienza creando tu primer
                                            proyecto</p>
                                        <button onclick="openWizard()"
                                            class="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                                            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor"
                                                viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M12 4v16m8-8H4"></path>
                                            </svg>
                                            Crear Proyecto
                                        </button>
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                <!-- Paginación -->
                <div id="pagination" class="flex justify-between items-center mt-4">
                    <div class="text-sm text-gray-700 dark:text-gray-300">
                        Mostrando <span id="showingStart">0</span> a <span id="showingEnd">0</span> de <span
                            id="totalEntries">0</span> entradas
                    </div>
                    <div id="paginationButtons" class="flex gap-2"></div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Wizard Multi-paso -->
    <div id="wizard-modal" class="hidden fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div class="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50 backdrop-blur-sm"
                onclick="closeWizard()"></div>
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div
                class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <!-- Progress Bar -->
                <div class="bg-gray-100 dark:bg-gray-700 px-6 py-4">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Paso <span
                                id="currentStep">1</span> de 3</span>
                        <button onclick="closeWizard()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    <div class="flex gap-2">
                        <div id="step-indicator-1" class="flex-1 h-2 bg-blue-600 rounded-full transition-all"></div>
                        <div id="step-indicator-2"
                            class="flex-1 h-2 bg-gray-300 dark:bg-gray-600 rounded-full transition-all"></div>
                        <div id="step-indicator-3"
                            class="flex-1 h-2 bg-gray-300 dark:bg-gray-600 rounded-full transition-all"></div>
                    </div>
                </div>

                <form id="wizard-form" onsubmit="handleWizardSubmit(event)">
                    <!-- Paso 1: Información General -->
                    <div id="step-1" class="step-content p-6">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                            <svg class="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Información General del Proyecto
                        </h3>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nombre del Proyecto <span class="text-red-500">*</span>
                                </label>
                                <textarea name="nombre_proyecto" rows="2" required
                                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                    placeholder="Ej: Mejoramiento del servicio educativo..."></textarea>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    UEI <span class="text-red-500">*</span>
                                </label>
                                <input type="text" name="uei" required
                                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                    placeholder="2999">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Unidad Ejecutora <span class="text-red-500">*</span>
                                </label>
                                <input type="text" name="unidad_ejecutora" required
                                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                    placeholder="UGEL">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Código SNIP <span class="text-red-500">*</span>
                                </label>
                                <input type="text" name="codigo_snip" required
                                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                    placeholder="123456">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Código CUI <span class="text-red-500">*</span>
                                </label>
                                <input type="text" name="codigo_cui" required
                                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                    placeholder="CUI123456">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Código Local <span class="text-red-500">*</span>
                                </label>
                                <input type="text" name="codigo_local" required
                                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                    placeholder="CL-001234">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Fecha <span class="text-red-500">*</span>
                                </label>
                                <input type="date" name="fecha" required
                                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
                            </div>

                            <!-- Códigos Modulares -->
                            <div class="md:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Códigos Modulares <span class="text-red-500">*</span>
                                </label>
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div
                                        class="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                                        <label class="flex items-center mb-2">
                                            <input type="checkbox" name="nivel_inicial"
                                                onchange="toggleCodigoModular('inicial', this.checked)"
                                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                                            <span
                                                class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Inicial</span>
                                        </label>
                                        <input type="text" name="codigo_modular_inicial"
                                            class="codigo-modular-input hidden w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-600 dark:text-gray-100"
                                            placeholder="Código">
                                    </div>
                                    <div
                                        class="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                                        <label class="flex items-center mb-2">
                                            <input type="checkbox" name="nivel_primaria"
                                                onchange="toggleCodigoModular('primaria', this.checked)"
                                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                                            <span
                                                class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Primaria</span>
                                        </label>
                                        <input type="text" name="codigo_modular_primaria"
                                            class="codigo-modular-input hidden w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-600 dark:text-gray-100"
                                            placeholder="Código">
                                    </div>
                                    <div
                                        class="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                                        <label class="flex items-center mb-2">
                                            <input type="checkbox" name="nivel_secundaria"
                                                onchange="toggleCodigoModular('secundaria', this.checked)"
                                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
                                            <span
                                                class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Secundaria</span>
                                        </label>
                                        <input type="text" name="codigo_modular_secundaria"
                                            class="codigo-modular-input hidden w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-600 dark:text-gray-100"
                                            placeholder="Código">
                                    </div>
                                </div>
                            </div>

                            <!-- Ubicación -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Región <span class="text-red-500">*</span>
                                </label>
                                <input type="text" name="region" required
                                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                    placeholder="Huánuco">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Provincia <span class="text-red-500">*</span>
                                </label>
                                <input type="text" name="provincia" required
                                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                    placeholder="Huánuco">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Distrito <span class="text-red-500">*</span>
                                </label>
                                <input type="text" name="distrito" required
                                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                    placeholder="Distrito">
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Centro Poblado
                                </label>
                                <input type="text" name="centropoblado"
                                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                    placeholder="Opcional">
                            </div>
                        </div>
                    </div>

                    <!-- Paso 2: Módulos/Plugins -->
                    <div id="step-2" class="step-content hidden p-6">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                            <svg class="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10">
                                </path>
                            </svg>
                            Selecciona los Módulos del Proyecto
                        </h3>

                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">Elige los módulos que necesitas
                            activar para tu proyecto. Puedes seleccionar los que necesites.</p>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Metrados -->
                            <div
                                class="border border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-blue-500 transition-colors">
                                <div class="flex items-start mb-4">
                                    <input type="checkbox" name="modulo_metrados" id="modulo-metrados"
                                        onchange="toggleModulo('metrados', this.checked)"
                                        class="mt-1 h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded">
                                    <div class="ml-3">
                                        <label for="modulo-metrados"
                                            class="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center cursor-pointer">
                                            <svg class="w-6 h-6 mr-2 text-purple-600" fill="none"
                                                stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4">
                                                </path>
                                            </svg>
                                            Metrados
                                        </label>
                                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Cálculo de cantidades
                                            de obra</p>
                                    </div>
                                </div>
                                <div id="metrados-opciones" class="hidden pl-8 space-y-2">
                                    <label class="flex items-center">
                                        <input type="checkbox" name="metrados[]" value="arquitectura"
                                            class="h-4 w-4 text-purple-600 rounded">
                                        <span class="ml-2 text-sm">Arquitectura</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" name="metrados[]" value="estructuras"
                                            class="h-4 w-4 text-purple-600 rounded">
                                        <span class="ml-2 text-sm">Estructuras</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" name="metrados[]" value="sanitarias"
                                            onchange="toggleSanitarias(this.checked)"
                                            class="h-4 w-4 text-purple-600 rounded">
                                        <span class="ml-2 text-sm">Instalaciones Sanitarias</span>
                                    </label>
                                    <div id="sanitarias-cantidad" class="hidden ml-6 mt-2">
                                        <input type="number" name="modulos_sanitarias" min="1"
                                            placeholder="Cantidad de módulos"
                                            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-100">
                                    </div>
                                    <label class="flex items-center">
                                        <input type="checkbox" name="metrados[]" value="electricas"
                                            class="h-4 w-4 text-purple-600 rounded">
                                        <span class="ml-2 text-sm">Instalaciones Eléctricas</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" name="metrados[]" value="comunicacion"
                                            class="h-4 w-4 text-purple-600 rounded">
                                        <span class="ml-2 text-sm">Comunicación</span>
                                    </label>
                                    <label class="flex items-center">
                                        <input type="checkbox" name="metrados[]" value="gas"
                                            class="h-4 w-4 text-purple-600 rounded">
                                        <span class="ml-2 text-sm">Instalaciones de Gas</span>
                                    </label>
                                </div>
                            </div>

                            <!-- Presupuestos -->
                            <div
                                class="border border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-blue-500 transition-colors">
                                <div class="flex items-start">
                                    <input type="checkbox" name="modulo_presupuesto" id="modulo-presupuesto"
                                        class="mt-1 h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded">
                                    <div class="ml-3">
                                        <label for="modulo-presupuesto"
                                            class="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center cursor-pointer">
                                            <svg class="w-6 h-6 mr-2 text-green-600" fill="none"
                                                stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z">
                                                </path>
                                            </svg>
                                            Presupuestos
                                        </label>
                                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Cálculo automático de
                                            costos</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Cronogramas -->
                            <div
                                class="border border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-blue-500 transition-colors">
                                <div class="flex items-start mb-4">
                                    <input type="checkbox" name="modulo_cronogramas" id="modulo-cronogramas"
                                        onchange="toggleModulo('cronogramas', this.checked)"
                                        class="mt-1 h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded">
                                    <div class="ml-3">
                                        <label for="modulo-cronogramas"
                                            class="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center cursor-pointer">
                                            <svg class="w-6 h-6 mr-2 text-orange-600" fill="none"
                                                stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z">
                                                </path>
                                            </svg>
                                            Cronogramas
                                        </label>
                                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Programación de
                                            actividades</p>
                                    </div>
                                </div>
                                <div id="cronogramas-opciones" class="hidden pl-8 space-y-2">
                                    <label class="flex items-center">
                                        <input type="checkbox" name="cronogramas[]" value="general"
                                            class="h-4 w-4 text-orange-600 rounded">
                                        <span class="ml-2 text-sm">Cronograma General</span>
                                    </label>
                                    <label class="flex items-center opacity-50 cursor-not-allowed"
                                        title="En desarrollo">
                                        <input type="checkbox" disabled class="h-4 w-4 text-orange-600 rounded">
                                        <span class="ml-2 text-sm">Cronograma Valorizado <span
                                                class="text-xs">(Próximamente)</span></span>
                                    </label>
                                    <label class="flex items-center opacity-50 cursor-not-allowed"
                                        title="En desarrollo">
                                        <input type="checkbox" disabled class="h-4 w-4 text-orange-600 rounded">
                                        <span class="ml-2 text-sm">Cronograma de Materiales <span
                                                class="text-xs">(Próximamente)</span></span>
                                    </label>
                                </div>
                            </div>

                            <!-- Especificaciones Técnicas -->
                            <div
                                class="border border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-blue-500 transition-colors">
                                <div class="flex items-start">
                                    <input type="checkbox" name="modulo_especificaciones"
                                        id="modulo-especificaciones"
                                        class="mt-1 h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                                    <div class="ml-3">
                                        <label for="modulo-especificaciones"
                                            class="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center cursor-pointer">
                                            <svg class="w-6 h-6 mr-2 text-indigo-600" fill="none"
                                                stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                                                </path>
                                            </svg>
                                            Especificaciones Técnicas
                                        </label>
                                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Documentación técnica
                                            detallada</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            class="mt-6 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
                            <p class="text-sm text-blue-800 dark:text-blue-200">
                                <strong>Nota:</strong> Los módulos son opcionales. Si no seleccionas ninguno, se creará
                                un proyecto básico que podrás configurar posteriormente.
                            </p>
                        </div>
                    </div>

                    <!-- Paso 3: Previsualización -->
                    <div id="step-3" class="step-content hidden p-6">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                            <svg class="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            Revisión y Confirmación
                        </h3>

                        <div class="space-y-6">
                            <!-- Información General -->
                            <div class="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                                <h4
                                    class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                    <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    Información General
                                </h4>
                                <div id="preview-general" class="grid grid-cols-2 gap-4 text-sm"></div>
                            </div>

                            <!-- Módulos Seleccionados -->
                            <div class="border border-gray-300 dark:border-gray-600 rounded-lg p-4">
                                <h4
                                    class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                    <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10">
                                        </path>
                                    </svg>
                                    Módulos Activados
                                </h4>
                                <div id="preview-modulos" class="flex flex-wrap gap-2"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Botones de navegación -->
                    <div class="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-between">
                        <button type="button" id="btn-prev" onclick="previousStep()"
                            class="hidden px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-700 transition-colors">
                            Anterior
                        </button>
                        <div class="flex-1"></div>
                        <button type="button" id="btn-next" onclick="nextStep()"
                            class="px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                            Siguiente
                        </button>
                        <button type="submit" id="btn-submit"
                            class="hidden px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors">
                            <span id="submit-text">Guardar Proyecto</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script>
        // Variables globales
        let currentWizardStep = 1;
        let wizardMode = 'create';
        let editId = null;
        let allRows = [];
        let currentPage = 1;
        let entriesPerPage = 10;

        // Inicialización
        document.addEventListener('DOMContentLoaded', function() {
            const today = new Date().toISOString().split('T')[0];
            document.querySelector('input[name="fecha"]').value = today;

            // Guardar todas las filas para paginación
            const tbody = document.querySelector('#costosTable tbody');
            allRows = Array.from(tbody.querySelectorAll('tr'));
            updateTable();
        });

        // ========== FUNCIONES DE TABLA ==========
        function searchTable() {
            const input = document.getElementById('searchInput').value.toLowerCase();
            const tbody = document.querySelector('#costosTable tbody');
            const rows = tbody.querySelectorAll('tr');

            allRows = [];
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(input)) {
                    row.style.display = '';
                    allRows.push(row);
                } else {
                    row.style.display = 'none';
                }
            });

            currentPage = 1;
            updateTable();
        }

        function updateTable() {
            entriesPerPage = parseInt(document.getElementById('entriesPerPage').value);
            const start = (currentPage - 1) * entriesPerPage;
            const end = start + entriesPerPage;

            const tbody = document.querySelector('#costosTable tbody');
            const rows = tbody.querySelectorAll('tr');

            // Ocultar todas las filas primero
            rows.forEach(row => row.style.display = 'none');

            // Mostrar solo las filas de la página actual
            const visibleRows = allRows.slice(start, end);
            visibleRows.forEach(row => row.style.display = '');

            // Actualizar información de paginación
            const totalEntries = allRows.length;
            document.getElementById('showingStart').textContent = totalEntries > 0 ? start + 1 : 0;
            document.getElementById('showingEnd').textContent = Math.min(end, totalEntries);
            document.getElementById('totalEntries').textContent = totalEntries;

            // Renderizar botones de paginación
            renderPagination();
        }

        function renderPagination() {
            const totalPages = Math.ceil(allRows.length / entriesPerPage);
            const container = document.getElementById('paginationButtons');
            container.innerHTML = '';

            if (totalPages <= 1) return;

            // Botón anterior
            const prevBtn = document.createElement('button');
            prevBtn.innerHTML = '&laquo;';
            prevBtn.className = 'px-3 py-2 text-sm border border-gray-300 rounded-md dark:border-gray-600 ' +
                (currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700');
            prevBtn.disabled = currentPage === 1;
            prevBtn.onclick = () => {
                currentPage--;
                updateTable();
            };
            container.appendChild(prevBtn);

            // Números de página
            for (let i = 1; i <= totalPages; i++) {
                if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                    const btn = document.createElement('button');
                    btn.textContent = i;
                    btn.className = 'px-3 py-2 text-sm border border-gray-300 rounded-md dark:border-gray-600 ' +
                        (i === currentPage ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700');
                    btn.onclick = () => {
                        currentPage = i;
                        updateTable();
                    };
                    container.appendChild(btn);
                } else if (i === currentPage - 2 || i === currentPage + 2) {
                    const dots = document.createElement('span');
                    dots.textContent = '...';
                    dots.className = 'px-2';
                    container.appendChild(dots);
                }
            }

            // Botón siguiente
            const nextBtn = document.createElement('button');
            nextBtn.innerHTML = '&raquo;';
            nextBtn.className = 'px-3 py-2 text-sm border border-gray-300 rounded-md dark:border-gray-600 ' +
                (currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700');
            nextBtn.disabled = currentPage === totalPages;
            nextBtn.onclick = () => {
                currentPage++;
                updateTable();
            };
            container.appendChild(nextBtn);
        }

        // ========== FUNCIONES DEL WIZARD ==========
        function openWizard(mode = 'create', id = null) {
            wizardMode = mode;
            editId = id;
            currentWizardStep = 1;

            document.getElementById('wizard-modal').classList.remove('hidden');
            document.body.style.overflow = 'hidden';

            if (mode === 'edit') {
                loadProjectData(id);
            } else {
                document.getElementById('wizard-form').reset();
                const today = new Date().toISOString().split('T')[0];
                document.querySelector('input[name="fecha"]').value = today;
            }

            showStep(1);
        }

        function closeWizard() {
            document.getElementById('wizard-modal').classList.add('hidden');
            document.body.style.overflow = '';
            document.getElementById('wizard-form').reset();
        }

        function showStep(step) {
            // Ocultar todos los pasos
            document.querySelectorAll('.step-content').forEach(el => el.classList.add('hidden'));

            // Mostrar paso actual
            document.getElementById(`step-${step}`).classList.remove('hidden');
            document.getElementById('currentStep').textContent = step;

            // Actualizar indicadores de progreso
            for (let i = 1; i <= 3; i++) {
                const indicator = document.getElementById(`step-indicator-${i}`);
                if (i < step) {
                    indicator.className = 'flex-1 h-2 bg-green-600 rounded-full transition-all';
                } else if (i === step) {
                    indicator.className = 'flex-1 h-2 bg-blue-600 rounded-full transition-all';
                } else {
                    indicator.className = 'flex-1 h-2 bg-gray-300 dark:bg-gray-600 rounded-full transition-all';
                }
            }

            // Mostrar/ocultar botones
            document.getElementById('btn-prev').classList.toggle('hidden', step === 1);
            document.getElementById('btn-next').classList.toggle('hidden', step === 3);
            document.getElementById('btn-submit').classList.toggle('hidden', step !== 3);

            // Si es el paso 3, generar preview
            if (step === 3) {
                generatePreview();
            }
        }

        function nextStep() {
            if (currentWizardStep === 1) {
                if (!validateStep1()) return;
            }

            if (currentWizardStep < 3) {
                currentWizardStep++;
                showStep(currentWizardStep);
            }
        }

        function previousStep() {
            if (currentWizardStep > 1) {
                currentWizardStep--;
                showStep(currentWizardStep);
            }
        }

        function validateStep1() {
            const form = document.getElementById('wizard-form');
            const requiredFields = form.querySelectorAll('#step-1 [required]');

            for (let field of requiredFields) {
                if (!field.value.trim()) {
                    showAlert('error', 'Por favor, complete todos los campos obligatorios');
                    field.focus();
                    return false;
                }
            }

            // Validar que al menos un nivel educativo esté seleccionado
            const nivelesChecked = ['inicial', 'primaria', 'secundaria'].some(nivel =>
                form.querySelector(`input[name="nivel_${nivel}"]`).checked &&
                form.querySelector(`input[name="codigo_modular_${nivel}"]`).value.trim()
            );

            if (!nivelesChecked) {
                showAlert('error', 'Debe seleccionar al menos un nivel educativo con su código modular');
                return false;
            }

            return true;
        }

        function toggleCodigoModular(nivel, checked) {
            const input = document.querySelector(`input[name="codigo_modular_${nivel}"]`);
            if (checked) {
                input.classList.remove('hidden');
                input.required = true;
            } else {
                input.classList.add('hidden');
                input.required = false;
                input.value = '';
            }
        }

        function toggleModulo(modulo, checked) {
            const opciones = document.getElementById(`${modulo}-opciones`);
            if (checked) {
                opciones.classList.remove('hidden');
            } else {
                opciones.classList.add('hidden');
                // Desmarcar todas las opciones
                opciones.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
                if (modulo === 'metrados') {
                    toggleSanitarias(false);
                }
            }
        }

        function toggleSanitarias(checked) {
            const cantidad = document.getElementById('sanitarias-cantidad');
            const input = cantidad.querySelector('input');

            if (checked) {
                cantidad.classList.remove('hidden');
                input.required = false; // No obligatorio para evitar errores de validación HTML
            } else {
                cantidad.classList.add('hidden');
                input.required = false;
                input.value = '';
            }
        }

        function generatePreview() {
            const form = document.getElementById('wizard-form');
            const formData = new FormData(form);

            // Preview información general
            const previewGeneral = document.getElementById('preview-general');

            // Obtener niveles educativos
            const nivelesHtml = ['inicial', 'primaria', 'secundaria']
                .filter(nivel => form.querySelector(`input[name="nivel_${nivel}"]`).checked)
                .map(nivel => {
                    const codigo = formData.get(`codigo_modular_${nivel}`);
                    return `<span class="inline-block px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">${nivel.charAt(0).toUpperCase() + nivel.slice(1)}: ${codigo}</span>`;
                })
                .join(' ');

            previewGeneral.innerHTML = `
                <div class="col-span-2"><strong class="text-gray-700 dark:text-gray-300">Proyecto:</strong><br><span class="text-gray-900 dark:text-gray-100">${formData.get('nombre_proyecto')}</span></div>
                <div><strong class="text-gray-700 dark:text-gray-300">UEI:</strong><br><span class="text-gray-900 dark:text-gray-100">${formData.get('uei')}</span></div>
                <div><strong class="text-gray-700 dark:text-gray-300">Unidad Ejecutora:</strong><br><span class="text-gray-900 dark:text-gray-100">${formData.get('unidad_ejecutora')}</span></div>
                <div><strong class="text-gray-700 dark:text-gray-300">SNIP:</strong><br><span class="text-gray-900 dark:text-gray-100">${formData.get('codigo_snip')}</span></div>
                <div><strong class="text-gray-700 dark:text-gray-300">CUI:</strong><br><span class="text-gray-900 dark:text-gray-100">${formData.get('codigo_cui')}</span></div>
                <div><strong class="text-gray-700 dark:text-gray-300">Código Local:</strong><br><span class="text-gray-900 dark:text-gray-100">${formData.get('codigo_local')}</span></div>
                <div><strong class="text-gray-700 dark:text-gray-300">Fecha:</strong><br><span class="text-gray-900 dark:text-gray-100">${formData.get('fecha')}</span></div>
                <div class="col-span-2"><strong class="text-gray-700 dark:text-gray-300">Niveles Educativos:</strong><br>${nivelesHtml}</div>
                <div><strong class="text-gray-700 dark:text-gray-300">Región:</strong><br><span class="text-gray-900 dark:text-gray-100">${formData.get('region')}</span></div>
                <div><strong class="text-gray-700 dark:text-gray-300">Provincia:</strong><br><span class="text-gray-900 dark:text-gray-100">${formData.get('provincia')}</span></div>
                <div><strong class="text-gray-700 dark:text-gray-300">Distrito:</strong><br><span class="text-gray-900 dark:text-gray-100">${formData.get('distrito')}</span></div>
                <div><strong class="text-gray-700 dark:text-gray-300">Centro Poblado:</strong><br><span class="text-gray-900 dark:text-gray-100">${formData.get('centropoblado') || 'N/A'}</span></div>
            `;

            // Preview módulos
            const previewModulos = document.getElementById('preview-modulos');
            const modulos = [];

            if (form.querySelector('#modulo-metrados')?.checked) {
                const metradosSeleccionados = Array.from(form.querySelectorAll('input[name="metrados[]"]:checked'))
                    .map(cb => cb.value);
                if (metradosSeleccionados.length > 0) {
                    modulos.push(`<div class="px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-lg flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                        </svg>
                        Metrados (${metradosSeleccionados.join(', ')})
                    </div>`);
                }
            }

            if (form.querySelector('#modulo-presupuesto')?.checked) {
                modulos.push(`<div class="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Presupuestos
                </div>`);
            }

            if (form.querySelector('#modulo-cronogramas')?.checked) {
                const cronogramasSeleccionados = Array.from(form.querySelectorAll('input[name="cronogramas[]"]:checked'))
                    .map(cb => cb.value);
                if (cronogramasSeleccionados.length > 0) {
                    modulos.push(`<div class="px-4 py-2 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-lg flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        Cronogramas (${cronogramasSeleccionados.join(', ')})
                    </div>`);
                }
            }

            if (form.querySelector('#modulo-especificaciones')?.checked) {
                modulos.push(`<div class="px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-lg flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    Especificaciones Técnicas
                </div>`);
            }

            previewModulos.innerHTML = modulos.length > 0 ?
                modulos.join('') :
                '<p class="text-gray-500 dark:text-gray-400">No se seleccionaron módulos adicionales</p>';
        }

        function handleWizardSubmit(event) {
            event.preventDefault();

            const form = event.target;
            const formData = new FormData(form);

            // Construir códigos modulares
            const codigoModular = {};
            ['inicial', 'primaria', 'secundaria'].forEach(nivel => {
                if (form.querySelector(`input[name="nivel_${nivel}"]`).checked) {
                    const codigo = formData.get(`codigo_modular_${nivel}`);
                    if (codigo && codigo.trim()) {
                        codigoModular[nivel] = codigo.trim();
                    }
                }
            });

            if (Object.keys(codigoModular).length === 0) {
                showAlert('error', 'Debe seleccionar al menos un nivel educativo con su código modular');
                return;
            }

            // Construir plugins
            const plugins = {
                metrados: [],
                presupuesto: false,
                cronogramas: [],
                especificaciones: false
            };

            // Metrados
            if (form.querySelector('#modulo-metrados')?.checked) {
                plugins.metrados = Array.from(form.querySelectorAll('input[name="metrados[]"]:checked'))
                    .map(cb => cb.value);
            }

            // Presupuesto
            plugins.presupuesto = form.querySelector('#modulo-presupuesto')?.checked || false;

            // Cronogramas
            if (form.querySelector('#modulo-cronogramas')?.checked) {
                plugins.cronogramas = Array.from(form.querySelectorAll('input[name="cronogramas[]"]:checked'))
                    .map(cb => cb.value);
            }

            // Especificaciones
            plugins.especificaciones = form.querySelector('#modulo-especificaciones')?.checked || false;

            // Cantidad de módulos sanitarios (solo si está seleccionado y tiene valor)
            let cantModulos = '0';
            const sanitariasChecked = form.querySelector('input[name="metrados[]"][value="sanitarias"]')?.checked;
            const sanitariasInput = form.querySelector('input[name="modulos_sanitarias"]');

            if (sanitariasChecked && sanitariasInput && sanitariasInput.value) {
                cantModulos = sanitariasInput.value;
                if (cantModulos === '' || cantModulos === '0') {
                    showAlert('error', 'Por favor, ingrese la cantidad de módulos sanitarios');
                    currentWizardStep = 2;
                    showStep(2);
                    return;
                }
            }

            // Preparar datos para enviar
            const data = {
                name: formData.get('nombre_proyecto'),
                codigouei: formData.get('uei'),
                codigosnip: formData.get('codigo_snip'),
                codigocui: formData.get('codigo_cui'),
                unidad_ejecutora: formData.get('unidad_ejecutora'),
                codigolocal: formData.get('codigo_local'),
                codigomodular: JSON.stringify(codigoModular),
                fecha: formData.get('fecha'),
                region: formData.get('region'),
                provincia: formData.get('provincia'),
                distrito: formData.get('distrito'),
                centropoblado: formData.get('centropoblado') || '',
                cantmodulos: cantModulos,
                plugins: JSON.stringify(plugins)
            };

            // Deshabilitar botón de submit
            const submitBtn = document.getElementById('btn-submit');
            const submitText = document.getElementById('submit-text');
            submitBtn.disabled = true;
            submitText.textContent = wizardMode === 'create' ? 'Guardando...' : 'Actualizando...';

            // Determinar URL y método
            let url = wizardMode === 'create' ? "{{ route('costos.store') }}" : `{{ url('costos') }}/${editId}`;
            let method = wizardMode === 'create' ? 'POST' : 'PUT';

            fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    },
                    body: JSON.stringify(data)
                })
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(data => {
                            throw new Error(data.message || 'Error en la solicitud');
                        });
                    }
                    return response.json();
                })
                .then(responseData => {
                    showAlert('success', responseData.message ||
                        `Proyecto ${wizardMode === 'create' ? 'creado' : 'actualizado'} exitosamente`);
                    closeWizard();
                    setTimeout(() => window.location.reload(), 1500);
                })
                .catch(error => {
                    console.error('Error:', error);
                    showAlert('error', error.message || 'Hubo un problema al guardar los datos');
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitText.textContent = wizardMode === 'create' ? 'Guardar Proyecto' : 'Actualizar Proyecto';
                });
        }

        function loadProjectData(id) {
            fetch(`{{ url('costos') }}/${id}/edit`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    }
                })
                .then(response => {
                    if (!response.ok) throw new Error('No se pudo cargar el proyecto');
                    return response.json();
                })
                .then(data => {
                    console.log(data)
                    const form = document.getElementById('wizard-form');

                    // Llenar campos básicos
                    form.querySelector('[name="nombre_proyecto"]').value = data.name || '';
                    form.querySelector('[name="uei"]').value = data.codigouei || '';
                    form.querySelector('[name="codigo_snip"]').value = data.codigosnip || '';
                    form.querySelector('[name="codigo_cui"]').value = data.codigocui || '';
                    form.querySelector('[name="unidad_ejecutora"]').value = data.unidad_ejecutora || '';
                    form.querySelector('[name="codigo_local"]').value = data.codigolocal || '';
                    form.querySelector('[name="fecha"]').value = data.fecha || '';
                    form.querySelector('[name="region"]').value = data.region || '';
                    form.querySelector('[name="provincia"]').value = data.provincia || '';
                    form.querySelector('[name="distrito"]').value = data.distrito || '';
                    form.querySelector('[name="centropoblado"]').value = data.centropoblado || '';

                    // Procesar códigos modulares
                    if (data.codigomodular) {
                        let codigoModular;
                        try {
                            codigoModular = typeof data.codigomodular === 'string' ? JSON.parse(data.codigomodular) :
                                data.codigomodular;
                        } catch (e) {
                            codigoModular = {};
                        }

                        Object.keys(codigoModular).forEach(nivel => {
                            const checkbox = form.querySelector(`input[name="nivel_${nivel}"]`);
                            const input = form.querySelector(`input[name="codigo_modular_${nivel}"]`);

                            if (checkbox && input) {
                                checkbox.checked = true;
                                toggleCodigoModular(nivel, true);
                                input.value = codigoModular[nivel];
                            }
                        });
                    }

                    // Cargar plugins
                    if (data.plugins) {
                        let plugins;
                        try {
                            plugins = typeof data.plugins === 'string' ? JSON.parse(data.plugins) : data.plugins;

                            // Metrados
                            if (plugins.metrados && plugins.metrados.length > 0) {
                                form.querySelector('#modulo-metrados').checked = true;
                                toggleModulo('metrados', true);
                                plugins.metrados.forEach(metrado => {
                                    const checkbox = form.querySelector(
                                        `input[name="metrados[]"][value="${metrado}"]`);
                                    if (checkbox) {
                                        checkbox.checked = true;
                                        if (metrado === 'sanitarias') {
                                            toggleSanitarias(true);
                                            if (data.cantmodulos) {
                                                form.querySelector('input[name="modulos_sanitarias"]').value =
                                                    data.cantmodulos;
                                            }
                                        }
                                    }
                                });
                            }

                            // Presupuesto
                            if (plugins.presupuesto) {
                                form.querySelector('#modulo-presupuesto').checked = true;
                            }

                            // Cronogramas
                            if (plugins.cronogramas && plugins.cronogramas.length > 0) {
                                form.querySelector('#modulo-cronogramas').checked = true;
                                toggleModulo('cronogramas', true);
                                plugins.cronogramas.forEach(cronograma => {
                                    const checkbox = form.querySelector(
                                        `input[name="cronogramas[]"][value="${cronograma}"]`);
                                    if (checkbox) checkbox.checked = true;
                                });
                            }

                            // Especificaciones
                            if (plugins.especificaciones) {
                                form.querySelector('#modulo-especificaciones').checked = true;
                            }
                        } catch (e) {
                            console.warn('Error al parsear plugins:', e);
                        }
                    }
                })
                .catch(error => {
                    console.error('Error al cargar datos:', error);
                    showAlert('error', 'Error al cargar los datos del proyecto');
                    closeWizard();
                });
        }

        function confirmDelete(event, form) {
            event.preventDefault();

            Swal.fire({
                title: '¿Estás seguro?',
                text: "Esta acción no se puede deshacer",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    form.submit();
                }
            });

            return false;
        }

        function showAlert(type, message) {
            const config = {
                success: {
                    icon: 'success',
                    title: 'Éxito',
                    timer: 3000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end',
                    showCloseButton: true
                },
                error: {
                    icon: 'error',
                    title: 'Error',
                    showConfirmButton: true
                },
                info: {
                    icon: 'info',
                    title: 'Información',
                    timer: 4000,
                    showConfirmButton: true
                }
            };

            Swal.fire({
                ...config[type],
                text: message
            });
        }

        // Cerrar modal con ESC
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeWizard();
            }
        });
    </script>
</x-app-layout>
