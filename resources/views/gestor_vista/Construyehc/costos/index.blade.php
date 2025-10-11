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

    <!-- SweetAlert2 -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    <div class="py-2">
        <div
            class="bg-white dark:bg-gray-800 overflow-hidden shadow-xl rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl">
            <div class="p-6">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Lista de Proyecto Costos
                        </h3>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Gestiona los proyectos</p>
                    </div>
                    <button onclick="openModal('create')"
                        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                        Agregar Costos
                    </button>
                </div>

                <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                    <table id="pagination-table" class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead class="bg-gray-50 dark:bg-gray-700 text-center">
                            <tr>
                                <th scope="col"
                                    class="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Proyecto</th>
                                <th scope="col"
                                    class="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Fecha</th>
                                <th scope="col"
                                    class="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    UEI</th>
                                <th scope="col"
                                    class="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    SNIP</th>
                                <th scope="col"
                                    class="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    unidad_ejecutora</th>
                                <th scope="col"
                                    class="px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Ubicación</th>
                                <th scope="col"
                                    class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                    Acciones</th>
                            </tr>
                        </thead>
                        <tbody
                            class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 text-center">
                            @foreach ($costos as $costo)
                                <tr class="hover:bg-gray-950 dark:hover:bg-gray-750 transition-colors duration-150">
                                    <td class="px-6 py-4 max-w-xs whitespace-normal break-words">
                                        <div class="flex items-center">
                                            <div class="ml-4">
                                                <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {{ $costo->name }}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="text-sm text-gray-900 dark:text-gray-100">{{ $costo->fecha }}</div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span
                                            class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                            {{ $costo->codigouei }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span
                                            class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                                            {{ $costo->codigosnip }}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 max-w-[12rem] whitespace-normal break-words">
                                        <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            <div class="flex items-center">
                                                <div class="ml-4">
                                                    {{ $costo->unidad_ejecutora }}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 max-w-[12rem] whitespace-normal break-words">
                                        <div class="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            <div class="flex items-center">
                                                <div class="ml-4">
                                                    {{ "$costo->region $costo->provincia $costo->distrito $costo->centropoblado" }}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div class="flex justify-end space-x-3">
                                            <form action="{{ route('costos.control') }}" method="POST"
                                                style="display:inline;">
                                                @csrf
                                                <input type="hidden" name="id" value="{{ $costo->id }}">
                                                <button type="submit" title="Visualizar"
                                                    class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200">
                                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5"
                                                        viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                        <path fill-rule="evenodd"
                                                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                                            clip-rule="evenodd" />
                                                    </svg>
                                                </button>
                                            </form>
                                            <button onclick="openModal('edit', {{ $costo->id }})"
                                                class="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors duration-200"
                                                title="Editar">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5"
                                                    viewBox="0 0 20 20" fill="currentColor">
                                                    <path
                                                        d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                </svg>
                                            </button>
                                            <form action="{{ route('costos.destroy', $costo->id) }}" method="POST"
                                                onsubmit="return confirmDelete(event, this);" style="display: inline;">
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

                @if ($costos->count() === 0)
                    <div class="text-center py-12">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">No hay Proyecto de
                            COSTO registrados</h3>
                        <p class="mt-1 text-gray-500 dark:text-gray-400">Comienza agregando un proyecto nuevo de
                            COSTOS</p>
                        <div class="mt-6">
                            <button id="agregar_ms_vacio" data-modal-target="crud-modal"
                                data-modal-toggle="crud-modal"
                                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                Agregar Costos
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
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <!-- Fondo oscuro con animación -->
            <div class="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50 backdrop-blur-sm"
                aria-hidden="true" id="modal-backdrop"></div>

            <!-- Centrado del modal -->
            <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <!-- Contenido del modal con animación -->
            <div class="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full"
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
                                Registrar Costos
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
                    <div class="px-6 py-4 max-h-[70vh] overflow-y-auto">
                        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <!-- Nombre del Proyecto -->
                            <div class="sm:col-span-2">
                                <label for="nombre_proyecto"
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Nombre del Proyecto <span class="text-red-500">*</span>
                                </label>
                                <textarea id="nombre_proyecto" name="nombre_proyecto" rows="2" required
                                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                    placeholder="Escribe el nombre del proyecto"></textarea>
                            </div>

                            <!-- UEI y Unidad Ejecutora -->
                            <div>
                                <label for="uei"
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    UEI <span class="text-red-500">*</span>
                                </label>
                                <input type="text" name="uei" id="uei" required
                                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                    placeholder="Ej: 2999">
                            </div>

                            <div>
                                <label for="unidad_ejecutora"
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Unidad Ejecutora <span class="text-red-500">*</span>
                                </label>
                                <input type="text" name="unidad_ejecutora" id="unidad_ejecutora" required
                                    class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                    placeholder="Ej: 2999">
                            </div>

                            <!-- Códigos del proyecto -->
                            <div class="col-span-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div>
                                    <label for="codigo_snip"
                                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Código SNIP <span class="text-red-500">*</span>
                                    </label>
                                    <input type="text" name="codigo_snip" id="codigo_snip" required
                                        class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                        placeholder="SNIP123456">
                                </div>

                                <div>
                                    <label for="codigo_cui"
                                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Código CUI <span class="text-red-500">*</span>
                                    </label>
                                    <input type="text" name="codigo_cui" id="codigo_cui" required
                                        class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                        placeholder="CUI123456">
                                </div>

                                <div>
                                    <label for="codigo_local"
                                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Código Local <span class="text-red-500">*</span>
                                    </label>
                                    <input type="text" name="codigo_local" id="codigo_local" required
                                        class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                        placeholder="CL-001234">
                                </div>

                                <div>
                                    <label for="fecha"
                                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Fecha <span class="text-red-500">*</span>
                                    </label>
                                    <input type="date" name="fecha" id="fecha" required
                                        class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
                                </div>
                            </div>

                            <!-- Código Modular (Checklist) -->
                            <div class="sm:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Código Modular <span class="text-red-500">*</span>
                                </label>
                                <div
                                    class="space-y-3 p-4 border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                                    <!-- Inicial -->
                                    <div>
                                        <div class="flex items-center">
                                            <input id="check-inicial" name="nivel_educativo[]" type="checkbox"
                                                value="inicial"
                                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                onchange="toggleNivelInput('inicial')">
                                            <label for="check-inicial"
                                                class="ml-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                                                Nivel Inicial
                                            </label>
                                        </div>
                                        <input type="text" id="input-inicial" name="codigo_modular_inicial"
                                            class="mt-2 hidden block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
                                            placeholder="Ingrese código modular de nivel inicial">
                                    </div>

                                    <!-- Primaria -->
                                    <div>
                                        <div class="flex items-center">
                                            <input id="check-primaria" name="nivel_educativo[]" type="checkbox"
                                                value="primaria"
                                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                onchange="toggleNivelInput('primaria')">
                                            <label for="check-primaria"
                                                class="ml-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                                                Nivel Primaria
                                            </label>
                                        </div>
                                        <input type="text" id="input-primaria" name="codigo_modular_primaria"
                                            class="mt-2 hidden block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
                                            placeholder="Ingrese código modular de nivel primaria">
                                    </div>

                                    <!-- Secundaria -->
                                    <div>
                                        <div class="flex items-center">
                                            <input id="check-secundaria" name="nivel_educativo[]" type="checkbox"
                                                value="secundaria"
                                                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                onchange="toggleNivelInput('secundaria')">
                                            <label for="check-secundaria"
                                                class="ml-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                                                Nivel Secundaria
                                            </label>
                                        </div>
                                        <input type="text" id="input-secundaria" name="codigo_modular_secundaria"
                                            class="mt-2 hidden block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
                                            placeholder="Ingrese código modular de nivel secundaria">
                                    </div>
                                </div>
                            </div>

                            <!-- Ubicación -->
                            <div class="col-span-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div>
                                    <label for="region"
                                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Región <span class="text-red-500">*</span>
                                    </label>
                                    <input type="text" name="region" id="region" required
                                        class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                        placeholder="Huánuco">
                                </div>
                                <div>
                                    <label for="provincia"
                                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Provincia <span class="text-red-500">*</span>
                                    </label>
                                    <input type="text" name="provincia" id="provincia" required
                                        class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                        placeholder="Huánuco">
                                </div>
                                <div>
                                    <label for="distrito"
                                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Distrito <span class="text-red-500">*</span>
                                    </label>
                                    <input type="text" name="distrito" id="distrito" required
                                        class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                        placeholder="Huánuco">
                                </div>
                                <div>
                                    <label for="centropoblado"
                                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Centro Poblado
                                    </label>
                                    <input type="text" name="centropoblado" id="centropoblado"
                                        class="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                                        placeholder="Opcional">
                                </div>
                            </div>

                            <!-- SECCIÓN DE PLUGINS/MÓDULOS -->
                            <div class="sm:col-span-2 mt-2">
                                <div
                                    class="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                                    <h4
                                        class="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                                        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                        </svg>
                                        Módulos del Sistema
                                    </h4>
                                    <p class="text-sm text-blue-700 dark:text-blue-300 mb-4">
                                        Seleccione los módulos que desea activar para este proyecto
                                    </p>
                                </div>
                            </div>

                            <!-- Plugin de Metrados -->
                            <div class="sm:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <span class="flex items-center">
                                        <svg class="w-5 h-5 mr-2 text-purple-600" fill="currentColor"
                                            viewBox="0 0 20 20">
                                            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                            <path fill-rule="evenodd"
                                                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                                                clip-rule="evenodd" />
                                        </svg>
                                        Metrados
                                    </span>
                                </label>
                                <div
                                    class="space-y-3 p-4 border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                                    <div class="flex items-center mb-3">
                                        <input id="check-metrados-all" type="checkbox" onchange="toggleAllMetrados()"
                                            class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded">
                                        <label for="check-metrados-all"
                                            class="ml-2 block text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            Seleccionar Todos
                                        </label>
                                    </div>

                                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div
                                            class="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                                            <input id="check-metrado-arquitectura" name="metrados[]" type="checkbox"
                                                value="arquitectura"
                                                class="metrado-checkbox h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded">
                                            <label for="check-metrado-arquitectura"
                                                class="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                                                Arquitectura
                                            </label>
                                        </div>

                                        <div
                                            class="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                                            <input id="check-metrado-estructuras" name="metrados[]" type="checkbox"
                                                value="estructuras"
                                                class="metrado-checkbox h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded">
                                            <label for="check-metrado-estructuras"
                                                class="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                                                Estructuras
                                            </label>
                                        </div>

                                        <div
                                            class="flex flex-col p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                                            <div class="flex items-center">
                                                <input id="check-metrado-sanitarias" name="metrados[]"
                                                    type="checkbox" value="sanitarias"
                                                    class="metrado-checkbox h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                                    onchange="toggleModuloInput('sanitarias')">
                                                <label for="check-metrado-sanitarias"
                                                    class="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                                                    Instalaciones Sanitarias
                                                </label>
                                            </div>

                                            <!-- Input numérico oculto por defecto -->
                                            <input type="number" id="input-sanitarias" name="modulos_sanitarias"
                                                min="1"
                                                class="mt-2 hidden block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-gray-100 dark:border-gray-500"
                                                placeholder="Ingrese cantidad de módulos sanitarios">
                                        </div>

                                        <div
                                            class="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                                            <input id="check-metrado-electricas" name="metrados[]" type="checkbox"
                                                value="electricas"
                                                class="metrado-checkbox h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded">
                                            <label for="check-metrado-electricas"
                                                class="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                                                Instalaciones Eléctricas
                                            </label>
                                        </div>

                                        <div
                                            class="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                                            <input id="check-metrado-comunicacion" name="metrados[]" type="checkbox"
                                                value="comunicacion"
                                                class="metrado-checkbox h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded">
                                            <label for="check-metrado-comunicacion"
                                                class="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                                                Comunicación
                                            </label>
                                        </div>

                                        <div
                                            class="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                                            <input id="check-metrado-gas" name="metrados[]" type="checkbox"
                                                value="gas"
                                                class="metrado-checkbox h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded">
                                            <label for="check-metrado-gas"
                                                class="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                                                Instalaciones de Gas
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Plugin de Presupuestos -->
                            <div class="sm:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <span class="flex items-center">
                                        <svg class="w-5 h-5 mr-2 text-green-600" fill="currentColor"
                                            viewBox="0 0 20 20">
                                            <path
                                                d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                                            <path fill-rule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                                                clip-rule="evenodd" />
                                        </svg>
                                        Presupuestos
                                    </span>
                                </label>
                                <div
                                    class="p-4 border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                                    <div class="flex items-center">
                                        <input id="check-presupuesto" name="presupuesto" type="checkbox"
                                            value="activo"
                                            class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded">
                                        <label for="check-presupuesto"
                                            class="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                                            Activar módulo de presupuestos
                                        </label>
                                    </div>
                                    <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        Genera automáticamente presupuestos basados en los metrados seleccionados
                                    </p>
                                </div>
                            </div>

                            <!-- Plugin de Cronogramas -->
                            <div class="sm:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <span class="flex items-center">
                                        <svg class="w-5 h-5 mr-2 text-orange-600" fill="currentColor"
                                            viewBox="0 0 20 20">
                                            <path fill-rule="evenodd"
                                                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                                clip-rule="evenodd" />
                                        </svg>
                                        Cronogramas
                                    </span>
                                </label>
                                <div
                                    class="space-y-3 p-4 border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                                    <div class="flex items-center mb-3">
                                        <input id="check-cronogramas-all" type="checkbox"
                                            onchange="toggleAllCronogramas()"
                                            class="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded">
                                        <label for="check-cronogramas-all"
                                            class="ml-2 block text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            Seleccionar Todos
                                        </label>
                                    </div>

                                    <div class="space-y-2">
                                        <div
                                            class="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                                            <input id="check-cronograma-general" name="cronogramas[]" type="checkbox"
                                                value="general"
                                                class="cronograma-checkbox h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded">
                                            <label for="check-cronograma-general"
                                                class="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                                                Cronograma General
                                            </label>
                                        </div>

                                        <div
                                            class="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                                            <input id="check-cronograma-valorizado" name="cronogramas[]"
                                                type="checkbox" value="valorizado"
                                                class="cronograma-checkbox h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded">
                                            <label for="check-cronograma-valorizado"
                                                class="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                                                Cronograma Valorizado
                                            </label>
                                        </div>

                                        <div
                                            class="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded">
                                            <input id="check-cronograma-materiales" name="cronogramas[]"
                                                type="checkbox" value="materiales"
                                                class="cronograma-checkbox h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded">
                                            <label for="check-cronograma-materiales"
                                                class="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                                                Cronograma de Materiales
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Plugin de Especificaciones Técnicas -->
                            <div class="sm:col-span-2">
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <span class="flex items-center">
                                        <svg class="w-5 h-5 mr-2 text-indigo-600" fill="currentColor"
                                            viewBox="0 0 20 20">
                                            <path fill-rule="evenodd"
                                                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                                clip-rule="evenodd" />
                                        </svg>
                                        Especificaciones Técnicas
                                    </span>
                                </label>
                                <div
                                    class="p-4 border border-gray-300 rounded-lg dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                                    <div class="flex items-center">
                                        <input id="check-especificaciones" name="especificaciones" type="checkbox"
                                            value="activo"
                                            class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded">
                                        <label for="check-especificaciones"
                                            class="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                                            Activar módulo de especificaciones técnicas
                                        </label>
                                    </div>
                                    <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        Genera documentación técnica detallada de todos los componentes del proyecto
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div
                        class="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 sm:space-y-0">
                        <button type="button" onclick="closeModal()"
                            class="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-700 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" id="submit-btn"
                            class="w-full sm:w-auto px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                            <span id="submit-text">Guardar Costos</span>
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
                modalTitle.textContent = 'Registrar Costos';
                submitText.textContent = 'Guardar Costos';
                form.reset();
                clearNivelesEducativos();
                clearAllPlugins();
                // Establecer fecha actual por defecto
                const today = new Date().toISOString().split('T')[0];
                document.getElementById('fecha').value = today;
            } else if (mode === 'edit') {
                modalTitle.textContent = 'Editar Costos';
                submitText.textContent = 'Actualizar Costos';
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
            clearAllPlugins();
            currentMode = 'create';
            currentId = null;
        }

        // Función auxiliar para manejar el cambio de checkboxes de niveles educativos
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

        // Función mejorada para limpiar niveles educativos
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

        // ===== FUNCIONES PARA PLUGINS/MÓDULOS =====

        // Metrados - Seleccionar todos
        function toggleAllMetrados() {
            const checkAll = document.getElementById('check-metrados-all');
            const checkboxes = document.querySelectorAll('.metrado-checkbox');

            checkboxes.forEach(checkbox => {
                checkbox.checked = checkAll.checked;
                // Disparar el evento onchange para cada checkbox
                const event = new Event('change');
                checkbox.dispatchEvent(event);
            });
        }

        // Función mejorada para manejar módulos con input adicional (ej: sanitarias)
        function toggleModuloInput(nombre) {
            const checkbox = document.getElementById(`check-metrado-${nombre}`);
            const input = document.getElementById(`input-${nombre}`);

            if (checkbox && input) {
                if (checkbox.checked) {
                    input.classList.remove('hidden');
                    input.required = true;
                    // Establecer valor por defecto si está vacío
                    if (!input.value) {
                        input.value = '1';
                    }
                } else {
                    input.classList.add('hidden');
                    input.required = false;
                    input.value = '0'; // Establecer en 0 cuando no está seleccionado
                }
            }
        }

        // Cronogramas - Seleccionar todos (MEJORADO con validación)
        function toggleAllCronogramas() {
            const checkAll = document.getElementById('check-cronogramas-all');
            const generalCheckbox = document.getElementById('check-cronograma-general');

            // Solo permitir marcar "General" con el "Seleccionar todos"
            if (checkAll.checked) {
                if (generalCheckbox) {
                    generalCheckbox.checked = true;
                }
                // Mostrar mensaje sobre módulos en desarrollo
                showAlert('info', 'Solo el Cronograma General está disponible. Los demás módulos están en desarrollo.');
            } else {
                if (generalCheckbox) {
                    generalCheckbox.checked = false;
                }
            }
        }

        // Función para validar cronogramas en desarrollo
        function validateCronogramaSelection(value) {
            if (value !== 'general') {
                showAlert('info',
                    'Este módulo de cronograma está en proceso de desarrollo. Por el momento, solo está disponible el Cronograma General.'
                    );
                return false;
            }
            return true;
        }

        // Limpiar todos los plugins
        function clearAllPlugins() {
            // Limpiar metrados
            document.getElementById('check-metrados-all').checked = false;
            document.querySelectorAll('.metrado-checkbox').forEach(cb => {
                cb.checked = false;
            });

            // Limpiar y resetear input de sanitarias
            const inputSanitarias = document.getElementById('input-sanitarias');
            if (inputSanitarias) {
                inputSanitarias.classList.add('hidden');
                inputSanitarias.required = false;
                inputSanitarias.value = '0';
            }

            // Limpiar presupuestos
            document.getElementById('check-presupuesto').checked = false;

            // Limpiar cronogramas
            document.getElementById('check-cronogramas-all').checked = false;
            document.querySelectorAll('.cronograma-checkbox').forEach(cb => cb.checked = false);

            // Limpiar especificaciones
            document.getElementById('check-especificaciones').checked = false;
        }

        // Función loadMetradoData MEJORADA
        function loadMetradoData(id) {
            const submitBtn = document.getElementById('submit-btn');
            const submitText = document.getElementById('submit-text');
            const loadingSpinner = document.getElementById('loading-spinner');

            // Mostrar loading
            submitBtn.disabled = true;
            submitText.textContent = 'Cargando...';
            loadingSpinner.classList.remove('hidden');

            fetch(`{{ url('costos') }}/${id}/edit`, {
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
                    document.getElementById('nombre_proyecto').value = data.name || '';
                    document.getElementById('uei').value = data.codigouei || '';
                    document.getElementById('codigo_snip').value = data.codigosnip || '';
                    document.getElementById('codigo_cui').value = data.codigocui || '';
                    document.getElementById('unidad_ejecutora').value = data.unidad_ejecutora || '';
                    document.getElementById('codigo_local').value = data.codigolocal || '';
                    document.getElementById('fecha').value = data.fecha || '';
                    document.getElementById('region').value = data.region || '';
                    document.getElementById('provincia').value = data.provincia || '';
                    document.getElementById('distrito').value = data.distrito || '';
                    document.getElementById('centropoblado').value = data.centropoblado || '';

                    // Procesar codigo_modular 
                    if (data.codigomodular) {
                        console.log('codigo_modular original:', data.codigomodular);
                        let codigoModular;
                        try {
                            codigoModular = typeof data.codigomodular === 'string' ? JSON.parse(data.codigomodular) :
                                data.codigomodular;
                        } catch (e) {
                            console.warn('Error al parsear codigo_modular:', e);
                            codigoModular = {};
                        }

                        // Limpiar niveles antes de llenar
                        clearNivelesEducativos();

                        // Llenar niveles educativos
                        Object.keys(codigoModular).forEach(nivel => {
                            const checkbox = document.getElementById(`check-${nivel}`);
                            const input = document.getElementById(`input-${nivel}`);

                            if (checkbox && input) {
                                checkbox.checked = true;
                                toggleNivelInput(nivel);
                                input.value = codigoModular[nivel];
                            }
                        });
                    }

                    // Cargar cantidad de módulos sanitarios si existe
                    if (data.cantmodulos) {
                        const inputSanitarias = document.getElementById('input-sanitarias');
                        if (inputSanitarias) {
                            inputSanitarias.value = data.cantmodulos;
                        }
                    }

                    // Cargar plugins si existen
                    if (data.plugins) {
                        let plugins;
                        try {
                            plugins = typeof data.plugins === 'string' ? JSON.parse(data.plugins) : data.plugins;

                            // Cargar metrados
                            if (plugins.metrados && Array.isArray(plugins.metrados)) {
                                plugins.metrados.forEach(metrado => {
                                    const checkbox = document.getElementById(`check-metrado-${metrado}`);
                                    if (checkbox) {
                                        checkbox.checked = true;
                                        // Si es sanitarias, mostrar el input
                                        if (metrado === 'sanitarias') {
                                            toggleModuloInput('sanitarias');
                                        }
                                    }
                                });
                            }

                            // Cargar presupuesto
                            if (plugins.presupuesto) {
                                document.getElementById('check-presupuesto').checked = true;
                            }

                            // Cargar cronogramas (solo general disponible)
                            if (plugins.cronogramas && Array.isArray(plugins.cronogramas)) {
                                plugins.cronogramas.forEach(cronograma => {
                                    if (cronograma === 'general') {
                                        const checkbox = document.getElementById('check-cronograma-general');
                                        if (checkbox) checkbox.checked = true;
                                    }
                                });
                            }

                            // Cargar especificaciones
                            if (plugins.especificaciones) {
                                document.getElementById('check-especificaciones').checked = true;
                            }
                        } catch (e) {
                            console.warn('Error al parsear plugins:', e);
                        }
                    }
                })
                .catch(error => {
                    console.error('Error al cargar datos:', error);
                    showAlert('error', 'Error al cargar los datos para edición');
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitText.textContent = 'Actualizar Costos';
                    loadingSpinner.classList.add('hidden');
                });
        }

        // Función handleSubmit MEJORADA
        function handleSubmit(event) {
            event.preventDefault();

            const form = event.target;
            const formData = new FormData(form);
            const submitBtn = document.getElementById('submit-btn');
            const submitText = document.getElementById('submit-text');
            const loadingSpinner = document.getElementById('loading-spinner');

            // VALIDAR NIVELES EDUCATIVOS
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

            if (nivelesSeleccionados.length === 0) {
                showAlert('error', 'Debe seleccionar al menos un nivel educativo');
                return;
            }

            if (Object.keys(codigoModular).length === 0) {
                showAlert('error', 'Debe ingresar códigos para los niveles educativos seleccionados');
                return;
            }

            for (let nivel of nivelesSeleccionados) {
                if (!codigoModular[nivel]) {
                    showAlert('error', `Debe ingresar el código modular para el nivel ${nivel}`);
                    return;
                }
            }

            // RECOPILAR PLUGINS SELECCIONADOS (OPCIONALES)
            const plugins = {
                metrados: [],
                presupuesto: false,
                cronogramas: [],
                especificaciones: false
            };

            // Metrados
            document.querySelectorAll('.metrado-checkbox:checked').forEach(cb => {
                plugins.metrados.push(cb.value);
            });

            // Presupuesto
            plugins.presupuesto = document.getElementById('check-presupuesto').checked;

            // Cronogramas (solo general disponible)
            const generalCheckbox = document.getElementById('check-cronograma-general');
            if (generalCheckbox && generalCheckbox.checked) {
                plugins.cronogramas.push('general');
            }

            // Especificaciones
            plugins.especificaciones = document.getElementById('check-especificaciones').checked;

            // Obtener cantidad de módulos sanitarios
            const cantModulosSanitarias = document.getElementById('input-sanitarias');
            const cantModulos = cantModulosSanitarias && !cantModulosSanitarias.classList.contains('hidden') ?
                (cantModulosSanitarias.value || '0') :
                '0';

            // Validar cantidad de módulos si sanitarias está seleccionado
            if (plugins.metrados.includes('sanitarias') && (cantModulos === '0' || cantModulos === '')) {
                showAlert('error', 'Debe ingresar la cantidad de módulos sanitarios');
                return;
            }

            // Mostrar loading
            submitBtn.disabled = true;
            submitText.textContent = currentMode === 'create' ? 'Guardando...' : 'Actualizando...';
            loadingSpinner.classList.remove('hidden');

            // PREPARAR DATOS PARA ENVIAR
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
                centropoblado: formData.get('centropoblado'),
                cantmodulos: cantModulos,
                plugins: JSON.stringify(plugins)
            };

            console.log('Datos a enviar:', data);

            // Determinar URL y método
            let url = '';
            let method = '';
            if (currentMode === 'create') {
                url = "{{ route('costos.store') }}";
                method = 'POST';
            } else if (currentMode === 'edit') {
                url = `{{ url('costos') }}/${currentId}`;
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
                        `Costos ${currentMode === 'create' ? 'creado' : 'actualizado'} exitosamente`);
                    closeModal();
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
                    submitText.textContent = currentMode === 'create' ? 'Guardar Costos' : 'Actualizar Costos';
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
                    form.submit();
                }
            });

            return false;
        }

        // Función mejorada para mostrar alertas con más tipos
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

            // Establecer fecha actual por defecto
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('fecha').value = today;

            // Agregar event listeners a los cronogramas en desarrollo
            ['valorizado', 'materiales'].forEach(tipo => {
                const checkbox = document.getElementById(`check-cronograma-${tipo}`);
                if (checkbox) {
                    checkbox.addEventListener('click', function(e) {
                        if (!validateCronogramaSelection(tipo)) {
                            e.preventDefault();
                            this.checked = false;
                        }
                    });
                }
            });

            // Inicializar el input de sanitarias como oculto con valor 0
            const inputSanitarias = document.getElementById('input-sanitarias');
            if (inputSanitarias) {
                inputSanitarias.value = '0';
            }
        });
    </script>
</x-app-layout>
