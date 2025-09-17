<x-app-layout>
    <x-slot name="header">
        <h2 class="font-bold text-2xl text-gray-800 dark:text-gray-200 leading-tight flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {{ __('Gestión de Metrados') }}
        </h2>
    </x-slot>

    <!-- SweetAlert2 -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    <div class="py-2">
        <div class="max-w-full mx-auto px-2 sm:px-2 lg:px-3">
            @if (session('success'))
                <div
                    class="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md shadow-sm transition-all duration-300 transform hover:scale-[1.01]">
                    <div class="flex items-center">
                        <svg class="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                            fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd" />
                        </svg>
                        <p class="text-green-700 font-medium">{{ session('success') }}</p>
                    </div>
                </div>
            @endif

            <div
                class="bg-white dark:bg-gray-800 overflow-hidden shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl">
                <div class="p-6">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Lista de Metrados</h3>
                            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestiona los metrados de
                                comunicaciones</p>
                        </div>
                        <button onclick="openModal('create')"
                            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                            Agregar Metrado
                        </button>
                    </div>

                    <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead class="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col"
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Proyecto</th>
                                    <th scope="col"
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Fecha</th>
                                    <th scope="col"
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Especialidad</th>
                                    <th scope="col"
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        unidad_ejecutora</th>
                                    <th scope="col"
                                        class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Ubicación</th>
                                    <th scope="col"
                                        class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Acciones</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                @foreach ($metradocomunicaciones as $metrado)
                                    <tr class="hover:bg-gray-950 dark:hover:bg-gray-750 transition-colors duration-150">
                                        <td class="px-6 py-4 max-w-xs whitespace-normal break-words">
                                            <div class="flex items-center">
                                                <div class="ml-4">
                                                    <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {{ $metrado->nombre_proyecto }}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <div class="text-sm text-gray-900 dark:text-gray-100">{{ $metrado->fecha }}
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap">
                                            <span
                                                class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                                {{ $metrado->especialidad }}
                                            </span>
                                        </td>
                                        <td class="px-6 py-4 max-w-[12rem] whitespace-normal break-words">
                                            <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                <div class="flex items-center">
                                                    <div class="ml-4">
                                                        {{ $metrado->unidad_ejecutora }}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 max-w-[12rem] whitespace-normal break-words">
                                            <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                <div class="flex items-center">
                                                    <div class="ml-4">
                                                        {{ $metrado->ubicacion }}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div class="flex justify-end space-x-3">
                                                <a href="{{ route('metradocomunicacion.show', $metrado->idmetradocomunicacion) }}"
                                                    class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                                                    title="Visualizar">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5"
                                                        viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                        <path fill-rule="evenodd"
                                                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                                            clip-rule="evenodd" />
                                                    </svg>
                                                </a>
                                                <button
                                                    onclick="openModal('edit', {{ $metrado->idmetradocomunicacion }})"
                                                    class="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors duration-200"
                                                    title="Editar">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5"
                                                        viewBox="0 0 20 20" fill="currentColor">
                                                        <path
                                                            d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                    </svg>
                                                </button>
                                                <form
                                                    action="{{ route('metradocomunicacion.destroy', $metrado->idmetradocomunicacion) }}"
                                                    method="POST" onsubmit="return confirmDelete(event, this);"
                                                    style="display: inline;">
                                                    @csrf
                                                    @method('DELETE')
                                                    <button type="submit"
                                                        class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                                                        title="Eliminar">
                                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5"
                                                            viewBox="0 0 20 20" fill="currentColor">
                                                            <path fill-rule="evenodd"
                                                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                                clip-rule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>

                    @if ($metradocomunicaciones->count() === 0)
                        <div class="text-center py-12">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No hay metrados
                                registrados</h3>
                            <p class="mt-1 text-gray-500 dark:text-gray-400">Comienza agregando un nuevo metrado de
                                comunicación</p>
                            <div class="mt-6">
                                <button id="agregar_ms_vacio" data-modal-target="crud-modal"
                                    data-modal-toggle="crud-modal"
                                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                    Agregar Metrado
                                </button>
                            </div>
                        </div>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <!-- Modal mejorado -->
    <div id="crud-modal" class="hidden fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title"
        role="dialog" aria-modal="true">
        role="dialog" aria-modal="true">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <!-- Fondo oscuro con animación -->
            <div class="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50 backdrop-blur-sm"
                aria-hidden="true" id="modal-backdrop"></div>

            <!-- Centrado del modal -->
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <!-- Contenido del modal con animación -->
            <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
                id="modal-content">
                <!-- Encabezado del modal -->
                <div class="bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <div
                                class="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg"
                                    class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <h3 id="modal-title" class="ml-3 text-xl font-bold text-gray-900 dark:text-gray-100">
                                Registrar Metrado de Comunicación
                            </h3>
                        </div>
                        <button type="button" onclick="closeModal()"
                            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Cuerpo del modal -->
                <form id="metrado-form" class="bg-white dark:bg-gray-800" onsubmit="handleSubmit(event)">
                    @csrf
                    <div class="px-6 py-4 max-h-96 overflow-y-auto">
                        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <!-- Nombre del Proyecto -->
                            <div class="sm:col-span-2">
                                <label for="nombre_proyecto"
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nombre del Proyecto <span class="text-red-500">*</span>
                                </label>
                                <textarea id="nombre_proyecto" name="nombre_proyecto" rows="3" required
                                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                    placeholder="Escribe el nombre del proyecto"></textarea>
                            </div>
                            <!-- UEI -->
                            <div>
                                <label for="uei"
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    UEI <span class="text-red-500">*</span>
                                </label>
                                <input type="text" name="uei" id="uei" required
                                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                    placeholder="Ej: 2999">
                            </div>

                            <!-- Código SNIP -->
                            <div>
                                <label for="codigo_snip"
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Código SNIP <span class="text-red-500">*</span>
                                </label>
                                <input type="text" name="codigo_snip" id="codigo_snip" required
                                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                    placeholder="Ej: SNIP123456">
                            </div>

                            <!-- Código CUI -->
                            <div>
                                <label for="codigo_cui"
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Código CUI <span class="text-red-500">*</span>
                                </label>
                                <input type="text" name="codigo_cui" id="codigo_cui" required
                                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                    placeholder="Ej: CUI123456">
                            </div>

                            <!-- Unidad Ejecutora -->
                            <div>
                                <label for="unidad_ejecutora"
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Unidad Ejecutora <span class="text-red-500">*</span>
                                </label>
                                <input type="text" name="unidad_ejecutora" id="unidad_ejecutora" required
                                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                    placeholder="Ej: 2999">
                            </div>

                            <!-- Código Modular (Checklist) -->
                            <div class="sm:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Código Modular <span class="text-red-500">*</span>
                                </label>
                                <div class="space-y-3 p-4 border border-gray-300 rounded-lg dark:border-gray-600">
                                    <!-- Inicial -->
                                    <div>
                                        <div class="flex items-center">
                                            <input id="check-inicial" name="nivel_educativo[]" type="checkbox"
                                                value="inicial"
                                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                onchange="toggleNivelInput('inicial')">
                                            <label for="check-inicial"
                                                class="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                                                C. Inicial
                                            </label>
                                        </div>
                                        <input type="text" id="input-inicial" name="codigo_modular_inicial"
                                            class="mt-2 hidden block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                            placeholder="Código modular de nivel inicial">
                                    </div>

                                    <!-- Primaria -->
                                    <div>
                                        <div class="flex items-center">
                                            <input id="check-primaria" name="nivel_educativo[]" type="checkbox"
                                                value="primaria"
                                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                onchange="toggleNivelInput('primaria')">
                                            <label for="check-primaria"
                                                class="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                                                C. Primaria
                                            </label>
                                        </div>
                                        <input type="text" id="input-primaria" name="codigo_modular_primaria"
                                            class="mt-2 hidden block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                            placeholder="Código modular de nivel primaria">
                                    </div>

                                    <!-- Secundaria -->
                                    <div>
                                        <div class="flex items-center">
                                            <input id="check-secundaria" name="nivel_educativo[]" type="checkbox"
                                                value="secundaria"
                                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                onchange="toggleNivelInput('secundaria')">
                                            <label for="check-secundaria"
                                                class="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                                                C. Secundaria
                                            </label>
                                        </div>
                                        <input type="text" id="input-secundaria" name="codigo_modular_secundaria"
                                            class="mt-2 hidden block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                            placeholder="Código modular de nivel secundaria">
                                    </div>
                                </div>
                            </div>

                            <!-- Código Local (Input simple) -->
                            <div>
                                <label for="codigo_local"
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Código Local <span class="text-red-500">*</span>
                                </label>
                                <input type="text" name="codigo_local" id="codigo_local" required
                                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                    placeholder="Ej: CL-001234">
                            </div>

                            <!-- Especialidad -->
                            <div>
                                <label for="especialidad"
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Especialidad <span class="text-red-500">*</span>
                                </label>
                                <input type="text" name="especialidad" id="especialidad" required
                                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                    placeholder="Ej: Telecomunicaciones">
                            </div>

                            <!-- Fecha -->
                            <div>
                                <label for="fecha"
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Fecha <span class="text-red-500">*</span>
                                </label>
                                <input type="date" name="fecha" id="fecha" required
                                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
                            </div>

                            <!-- Ubicación -->
                            <div>
                                <label for="ubicacion"
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Ubicación <span class="text-red-500">*</span>
                                </label>
                                <input type="text" name="ubicacion" id="ubicacion" required
                                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                    placeholder="Ej: Huánuco">
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div
                        class="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 sm:space-y-0">
                        <button type="button" onclick="closeModal()"
                            class="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-700">
                            Cancelar
                        </button>
                        <button type="submit" id="submit-btn"
                            class="w-full sm:w-auto px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            <span id="submit-text">Guardar Metrado</span>
                            <svg id="loading-spinner" class="hidden animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
                                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10"
                                    stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                            </svg>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script>
        // Variables globales
        let currentMode = 'create';
        let currentId = null;

        // Funciones para manejar el modal
        function openModal(mode, id = null) {
            currentMode = mode;
            currentId = id;

            const modal = document.getElementById('crud-modal');
            const modalTitle = document.getElementById('modal-title');
            const submitText = document.getElementById('submit-text');
            const form = document.getElementById('metrado-form');

            // Configurar modal según el modo
            if (mode === 'create') {
                modalTitle.textContent = 'Registrar Metrado de Comunicación';
                submitText.textContent = 'Guardar Metrado';
                form.reset();
                clearNivelesEducativos();
                // Establecer fecha actual por defecto
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('fecha').value = today;
            } else if (mode === 'edit') {
                modalTitle.textContent = 'Editar Metrado de Comunicación';
                submitText.textContent = 'Actualizar Metrado';
                loadMetradoData(id);
            }

            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function closeModal() {
            const modal = document.getElementById('crud-modal');
            modal.classList.add('hidden');
            document.body.style.overflow = '';

            // Resetear formulario
            document.getElementById('metrado-form').reset();
            clearNivelesEducativos();
            currentMode = 'create';
            currentId = null;
        }

        // 1. Primero, agrega esta función auxiliar para manejar el cambio de checkboxes
        function toggleNivelInput(nivel) {
            const checkbox = document.getElementById(`check-${nivel}`);
            const input = document.getElementById(`input-${nivel}`);

            if (checkbox && input) {
                if (checkbox.checked) {
                    input.classList.remove('hidden');
                    input.required = true;
                } else {
                    input.classList.add('hidden');
                    input.required = false;
                    input.value = '';
                }
            }
        }

        // 2. Función mejorada para limpiar niveles educativos
        function clearNivelesEducativos() {
            const niveles = ['inicial', 'primaria', 'secundaria'];
            niveles.forEach(nivel => {
                const checkbox = document.getElementById(`check-${nivel}`);
                const input = document.getElementById(`input-${nivel}`);

                if (checkbox) {
                    checkbox.checked = false;
                }
                if (input) {
                    input.classList.add('hidden');
                    input.required = false;
                    input.value = '';
                }
            });
        }

        // 3. Función loadMetradoData CORREGIDA
        function loadMetradoData(id) {
            const submitBtn = document.getElementById('submit-btn');
            const submitText = document.getElementById('submit-text');
            const loadingSpinner = document.getElementById('loading-spinner');

            // Mostrar loading
            submitBtn.disabled = true;
            submitText.textContent = 'Cargando...';
            loadingSpinner.classList.remove('hidden');

            fetch(`{{ url('metradocomunicacion') }}/${id}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    }
                })
                .then(response => {
                    if (!response.ok) throw new Error('No se pudo cargar el metrado');
                    return response.json();
                })
                .then(data => {
                    console.log('Datos cargados:', data);

                    // Llenar campos básicos del formulario
                    document.getElementById('nombre_proyecto').value = data.nombre_proyecto || '';
                    document.getElementById('uei').value = data.uei || '';
                    document.getElementById('codigo_snip').value = data.codigo_snip || '';
                    document.getElementById('codigo_cui').value = data.codigo_cui || '';
                    document.getElementById('unidad_ejecutora').value = data.unidad_ejecutora || '';
                    document.getElementById('codigo_local').value = data.codigo_local || '';
                    document.getElementById('especialidad').value = data.especialidad || '';
                    document.getElementById('fecha').value = data.fecha || '';
                    document.getElementById('ubicacion').value = data.ubicacion || '';

                    // Procesar codigo_modular 
                    if (data.codigo_modular) {
                        console.log('codigo_modular original:', data.codigo_modular);
                        let codigoModular;
                        try {
                            codigoModular = typeof data.codigo_modular === 'string' ? JSON.parse(data.codigo_modular) :
                                data.codigo_modular;
                        } catch (e) {
                            console.warn('Error al parsear codigo_modular:', e);
                            codigoModular = {};
                        }

                        // Limpiar niveles antes de llenar
                        clearNivelesEducativos();

                        // Llenar niveles educativos - AQUÍ ESTÁ LA CORRECCIÓN
                        Object.keys(codigoModular).forEach(nivel => {
                            const checkbox = document.getElementById(`check-${nivel}`);
                            const input = document.getElementById(`input-${nivel}`);

                            if (checkbox && input) {
                                // Marcar checkbox
                                checkbox.checked = true;

                                // IMPORTANTE: Disparar manualmente el evento onchange
                                // para que se ejecute toggleNivelInput
                                toggleNivelInput(nivel);

                                // Asignar valor
                                input.value = codigoModular[nivel];
                            }
                        });
                    }
                })
                .catch(error => {
                    console.error('Error al cargar datos:', error);
                    showAlert('error', 'Error al cargar los datos para edición');
                })
                .finally(() => {
                    // Restaurar botón
                    submitBtn.disabled = false;
                    submitText.textContent = 'Actualizar Metrado';
                    loadingSpinner.classList.add('hidden');
                });
        }

        // 4. Función handleSubmit MEJORADA con mejor validación
        function handleSubmit(event) {
            event.preventDefault();

            const form = event.target;
            const formData = new FormData(form);
            const submitBtn = document.getElementById('submit-btn');
            const submitText = document.getElementById('submit-text');
            const loadingSpinner = document.getElementById('loading-spinner');

            // VALIDACIÓN MEJORADA: Verificar checkboxes marcados directamente
            const nivelesSeleccionados = [];
            const codigoModular = {};

            ['inicial', 'primaria', 'secundaria'].forEach(nivel => {
                const checkbox = document.getElementById(`check-${nivel}`);
                const input = document.getElementById(`input-${nivel}`);

                if (checkbox && checkbox.checked) {
                    nivelesSeleccionados.push(nivel);
                    const codigo = input ? input.value.trim() : '';
                    if (codigo) {
                        codigoModular[nivel] = codigo;
                    }
                }
            });

            console.log('Niveles seleccionados:', nivelesSeleccionados);
            console.log('Códigos modulares:', codigoModular);

            // Validar que al menos un nivel educativo esté seleccionado
            if (nivelesSeleccionados.length === 0) {
                showAlert('error', 'Debe seleccionar al menos un nivel educativo');
                return;
            }

            // Validar que se hayan ingresado códigos para los niveles seleccionados
            if (Object.keys(codigoModular).length === 0) {
                showAlert('error', 'Debe ingresar al menos un código para los niveles educativos seleccionados');
                return;
            }

            // Validar que todos los niveles seleccionados tengan código
            for (let nivel of nivelesSeleccionados) {
                if (!codigoModular[nivel]) {
                    showAlert('error', `Debe ingresar el código modular para el nivel ${nivel}`);
                    return;
                }
            }

            // Mostrar loading
            submitBtn.disabled = true;
            submitText.textContent = currentMode === 'create' ? 'Guardando...' : 'Actualizando...';
            loadingSpinner.classList.remove('hidden');

            const data = {
                nombre_proyecto: formData.get('nombre_proyecto'),
                uei: formData.get('uei'),
                codigo_snip: formData.get('codigo_snip'),
                codigo_cui: formData.get('codigo_cui'),
                unidad_ejecutora: formData.get('unidad_ejecutora'),
                codigo_local: formData.get('codigo_local'),
                codigo_modular: JSON.stringify(codigoModular),
                especialidad: formData.get('especialidad'),
                fecha: formData.get('fecha'),
                ubicacion: formData.get('ubicacion'),
                proyecto_designado: 3,
            };

            console.log('Datos a enviar:', data);

            // Determinar URL y método
            let url = '';
            let method = '';
            if (currentMode === 'create') {
                url = "{{ route('metradocomunicacion.store') }}";
                method = 'POST';
            } else if (currentMode === 'edit') {
                url = `{{ url('metradocomunicacion') }}/${currentId}`;
                method = 'PUT';
            }

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
                    console.log('Respuesta del servidor:', responseData);
                    showAlert('success', responseData.message ||
                        `Metrado ${currentMode === 'create' ? 'creado' : 'actualizado'} exitosamente`);
                    closeModal();
                    // Recargar la página para mostrar los cambios
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                })
                .catch(error => {
                    console.error('Error:', error);
                    showAlert('error', error.message || 'Hubo un problema al guardar los datos');
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitText.textContent = currentMode === 'create' ? 'Guardar Metrado' : 'Actualizar Metrado';
                    loadingSpinner.classList.add('hidden');
                });
        }

        // Función para confirmar eliminación
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
                    // Enviar el formulario
                    form.submit();
                }
            });

            return false;
        }

        // Función para mostrar alertas
        function showAlert(type, message) {
            if (type === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: message,
                    timer: 3000,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end',
                    showCloseButton: true
                });
            } else if (type === 'error') {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: message,
                    showConfirmButton: true
                });
            }
        }

        // Event listeners
        document.addEventListener('DOMContentLoaded', function() {
            // Cerrar modal con escape
            document.addEventListener('keydown', function(event) {
                if (event.key === 'Escape') {
                    closeModal();
                }
            });

            // Cerrar modal al hacer clic en el fondo
            document.getElementById('modal-backdrop')?.addEventListener('click', function() {
                closeModal();
            });

            // Establecer fecha actual por defecto al abrir el modal de crear
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('fecha').value = today;
        });
    </script>
</x-app-layout>
