<x-app-layout>
    <script type="module" src="{{ asset('assets/js/ettps.js') }}"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <link href="https://cdn.jsdelivr.net/npm/tabulator-tables@6.3.1/dist/css/tabulator.min.css" rel="stylesheet">
    <script type="text/javascript" src="https://unpkg.com/tabulator-tables@6.3.1/dist/js/tabulator.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <!-- Carga de librerías necesarias en el orden correcto -->
    <script src="https://cdn.jsdelivr.net/npm/docx@7.8.2/build/index.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>

    <x-slot name="header">
        <div class="flex justify-between items-center mb-2 h-2">
            <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-50 leading-tight">
                {{ __('ETTP') }}
            </h2>
            <button id="savedata" title="guardar archivo"
                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
                💾
            </button>
            <button id="openModal"
                class="bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 hover:from-blue-800 hover:to-blue-800 text-white font-semibold px-6 py-2 rounded-xl shadow-lg transition duration-300 ease-in-out">
                📄 Generar WORD
            </button>


            <button data-modal-target="default-modal" data-modal-toggle="default-modal" title="cargar metrados"
                class="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                type="button">
                <img class="h-5 w-5"
                    src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAkElEQVR4nO2UbQqAIAxA3ykyumIdN/o4zUKYIJL9aka1B0NBZE83BefldBqP0AOLRpw3JQAzIBo7MDyVXFpK9MCqCdOYz1fLcoTs5JueNgl02ZrJTYST5GQCWEqESvJSwExiuqhvKVD2Sdx7C2Oluc4EkkTcY45UBJohLoCXAG9C/BnKrz+i7yM3xXsFnO9zAAsGbeXvq0QtAAAAAElFTkSuQmCC"
                    alt="upload">
            </button>

            <input type="hidden" name="proyecto_id" id="proyecto_id" value="405">
            <input type="hidden" name="id_especificacionestecnicas" id="id_especificacionestecnicas" value="1">
        </div>
    </x-slot>

    <div class="py-2">
        <div class="flex">
            <div class="w-2/3" id="tabla_ettp"></div>
            <div class="w-1/3" id="decripcion_ettp"></div>
        </div>

    </div>

    <div id="default-modal" tabindex="-1" aria-hidden="true"
        class="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
        <div class="relative p-4 w-full max-w-md max-h-full">
            <div class="relative bg-gray-800 rounded-lg shadow-md">
                <div class="flex items-center justify-between p-4 md:p-5 border-b border-gray-700 rounded-t">
                    <h3 class="text-xl font-semibold text-white">
                        {{ __('Metrados a cargar') }}
                    </h3>
                    <button type="button"
                        class="text-gray-400 bg-transparent hover:bg-gray-700 hover:text-white rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                        data-modal-hide="default-modal">
                        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 14 14">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span class="sr-only">{{ __('Close modal') }}</span>
                    </button>
                </div>
                <form id="resumenMetradosForm" class="p-4 md:p-5">
                    @csrf
                    <div class="mb-4">
                        <ul
                            class="w-full text-sm font-medium text-gray-200 bg-gray-700 border border-gray-600 rounded-lg">
                            <li class="w-full border-b border-gray-600 rounded-t-lg">
                                <div class="flex items-center ps-3">
                                    <input id="estructura-checkbox" name="estructura-checkbox" type="checkbox"
                                        value="true"
                                        class="w-4 h-4 text-blue-500 bg-gray-600 border-gray-500 rounded focus:ring-blue-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-500 dark:border-gray-500">
                                    <label for="estructura-checkbox"
                                        class="w-full py-3 ms-2 text-sm font-medium text-gray-300">{{ __('Estructura') }}</label>
                                </div>
                            </li>

                            <li class="w-full border-b border-gray-600">
                                <div class="flex items-center ps-3">
                                    <input id="arquitectura-checkbox" name="arquitectura-checkbox" type="checkbox"
                                        value="true"
                                        class="w-4 h-4 text-blue-500 bg-gray-600 border-gray-500 rounded focus:ring-blue-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-500 dark:border-gray-500">
                                    <label for="arquitectura-checkbox"
                                        class="w-full py-3 ms-2 text-sm font-medium text-gray-300">{{ __('Arquitectura') }}</label>
                                </div>
                            </li>

                            <li class="w-full border-b border-gray-600">
                                <div class="flex items-center ps-3">
                                    <input id="sanitarias-checkbox" name="sanitarias-checkbox" type="checkbox"
                                        value="true"
                                        class="w-4 h-4 text-blue-500 bg-gray-600 border-gray-500 rounded focus:ring-blue-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-500 dark:border-gray-500">
                                    <label for="sanitarias-checkbox"
                                        class="w-full py-3 ms-2 text-sm font-medium text-gray-300">{{ __('Sanitaria') }}</label>
                                </div>
                            </li>

                            <li class="w-full border-b border-gray-600">
                                <div class="flex items-center ps-3">
                                    <input id="electricas-checkbox" name="electricas-checkbox" type="checkbox"
                                        value="true"
                                        class="w-4 h-4 text-blue-500 bg-gray-600 border-gray-500 rounded focus:ring-blue-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-500 dark:border-gray-500">
                                    <label for="electricas-checkbox"
                                        class="w-full py-3 ms-2 text-sm font-medium text-gray-300">{{ __('Electricas') }}</label>
                                </div>
                            </li>

                            <li class="w-full border-b border-gray-600">
                                <div class="flex items-center ps-3">
                                    <input id="comunicacion-checkbox" name="comunicacion-checkbox" type="checkbox"
                                        value="true"
                                        class="w-4 h-4 text-blue-500 bg-gray-600 border-gray-500 rounded focus:ring-blue-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-500 dark:border-gray-500">
                                    <label for="comunicacion-checkbox"
                                        class="w-full py-3 ms-2 text-sm font-medium text-gray-300">{{ __('Comunicacion') }}</label>
                                </div>
                            </li>

                            <li class="w-full rounded-b-lg">
                                <div class="flex items-center ps-3">
                                    <input id="gas-checkbox" name="gas-checkbox" type="checkbox" value="true"
                                        class="w-4 h-4 text-blue-500 bg-gray-600 border-gray-500 rounded focus:ring-blue-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-500 dark:border-gray-500">
                                    <label for="gas-checkbox"
                                        class="w-full py-3 ms-2 text-sm font-medium text-gray-300">{{ __('Gas') }}</label>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <input type="hidden" name="proyecto_id" id="proyecto_id" value="1">

                    <div class="flex items-center justify-end p-4 md:p-5 border-t border-gray-700 rounded-b">
                        <button id="obtenerResumenMetrados" type="button"
                            class="text-white bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                            {{ __('Solicitar documentos') }}
                        </button>

                        <button type="button" data-modal-hide="default-modal"
                            class="ms-3 text-gray-400 bg-gray-700 hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-gray-400 rounded-lg border border-gray-600 text-sm font-medium px-5 py-2.5 hover:text-white focus:z-10">
                            {{ __('Cerrar/cancelar') }}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div id="modalWord"
        class="fixed inset-0 z-50 hidden bg-black bg-opacity-70 flex items-center justify-center transition-opacity duration-300 ease-in-out">
        <div
            class="bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-2xl w-full max-w-xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-center w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                        stroke="currentColor" class="w-6 h-6 inline-block mr-2 align-middle text-blue-500">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 8.25l-3 3m6-3l3 3m7.5-3l-3 3m6-3l3 3" />
                    </svg>
                    Selecciona Componentes
                </h2>
                <button type="button" id="cancelModal"
                    class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            <div class="mb-8 overflow-y-auto max-h-[calc(100vh - 200px)]">
                <h3 class="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Componentes a Incluir:</h3>
                <div class="grid grid-cols-2 gap-4">
                    <label for="estructura" class="flex items-center">
                        <input type="checkbox" name="componentes" value="Estructura" id="estructura"
                            class="form-checkbox h-5 w-5 text-blue-600 focus:ring-blue-500 rounded border-gray-300 dark:border-gray-700 mr-3">
                        <span class="text-gray-900 dark:text-gray-100">Estructura</span>
                    </label>
                    <label for="arquitectura" class="flex items-center">
                        <input type="checkbox" name="componentes" value="Arquitectura" id="arquitectura"
                            class="form-checkbox h-5 w-5 text-blue-600 focus:ring-blue-500 rounded border-gray-300 dark:border-gray-700 mr-3">
                        <span class="text-gray-900 dark:text-gray-100">Arquitectura</span>
                    </label>
                    <label for="sanitarias" class="flex items-center">
                        <input type="checkbox" name="componentes" value="Sanitarias" id="sanitarias"
                            class="form-checkbox h-5 w-5 text-blue-600 focus:ring-blue-500 rounded border-gray-300 dark:border-gray-700 mr-3">
                        <span class="text-gray-900 dark:text-gray-100">Sanitarias</span>
                    </label>
                    <label for="electricas" class="flex items-center">
                        <input type="checkbox" name="componentes" value="Electricas" id="electricas"
                            class="form-checkbox h-5 w-5 text-blue-600 focus:ring-blue-500 rounded border-gray-300 dark:border-gray-700 mr-3">
                        <span class="text-gray-900 dark:text-gray-100">Eléctricas</span>
                    </label>
                    <label for="comunicaciones" class="flex items-center">
                        <input type="checkbox" name="componentes" value="Comunicaciones" id="comunicaciones"
                            class="form-checkbox h-5 w-5 text-blue-600 focus:ring-blue-500 rounded border-gray-300 dark:border-gray-700 mr-3">
                        <span class="text-gray-900 dark:text-gray-100">Comunicaciones</span>
                    </label>
                    <label for="gas" class="flex items-center">
                        <input type="checkbox" name="componentes" value="Gas" id="gas"
                            class="form-checkbox h-5 w-5 text-blue-600 focus:ring-blue-500 rounded border-gray-300 dark:border-gray-700 mr-3">
                        <span class="text-gray-900 dark:text-gray-100">Gas</span>
                    </label>
                </div>

                <h3 class="text-lg font-semibold mt-6 mb-3 text-gray-700 dark:text-gray-300">Imágenes para el
                    Encabezado:</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="relative">
                        <label for="logoFile" class="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                            Logo 1
                            <div class="relative rounded-md shadow-sm mt-1">
                                <div
                                    class="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-md py-2 px-3 cursor-pointer flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                        stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.1-1.039m0 0a6 6 0 11-12 0" />
                                    </svg>
                                    <span>Subir Logo 1</span>
                                </div>
                                <input type="file" id="logoFile" accept="image/png, image/jpeg" class="sr-only"
                                    onchange="previewImage(this, 'logoPreview', 'logoFile')">
                                <div id="logoFile-loading"
                                    class="absolute inset-0 bg-gray-200 dark:bg-gray-900 bg-opacity-50 rounded-md flex items-center justify-center hidden">
                                    <div
                                        class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500">
                                    </div>
                                </div>
                            </div>
                        </label>
                        <div id="logoPreview" class="mt-2 relative"></div>
                    </div>

                    <div class="relative">
                        <label for="escudoFile"
                            class="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                            Logo 2
                            <div class="relative rounded-md shadow-sm mt-1">
                                <div
                                    class="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-md py-2 px-3 cursor-pointer flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                        stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.1-1.039m0 0a6 6 0 11-12 0" />
                                    </svg>
                                    <span>Subir Logo 2</span>
                                </div>
                                <input type="file" id="escudoFile" accept="image/png, image/jpeg" class="sr-only"
                                    onchange="previewImage(this, 'escudoPreview', 'escudoFile')">
                                <div id="escudoFile-loading"
                                    class="absolute inset-0 bg-gray-200 dark:bg-gray-900 bg-opacity-50 rounded-md flex items-center justify-center hidden">
                                    <div
                                        class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500">
                                    </div>
                                </div>
                            </div>
                        </label>
                        <div id="escudoPreview" class="mt-2 relative"></div>
                    </div>

                    <div class="relative">
                        <label for="logoPrinFile"
                            class="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                            Logo Principal
                            <div class="relative rounded-md shadow-sm mt-1">
                                <div
                                    class="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-md py-2 px-3 cursor-pointer flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                        stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.1-1.039m0 0a6 6 0 11-12 0" />
                                    </svg>
                                    <span>Subir Logo Principal</span>
                                </div>
                                <input type="file" id="logoPrinFile" accept="image/png, image/jpeg"
                                    class="sr-only" onchange="previewImage(this, 'logoPrinPreview', 'logoPrinFile')">
                                <div id="logoPrinFile-loading"
                                    class="absolute inset-0 bg-gray-200 dark:bg-gray-900 bg-opacity-50 rounded-md flex items-center justify-center hidden">
                                    <div
                                        class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500">
                                    </div>
                                </div>
                            </div>
                        </label>
                        <div id="logoPrinPreview" class="mt-2 relative"></div>
                    </div>

                    <div class="relative">
                        <label for="firmaFile"
                            class="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                            Firma
                            <div class="relative rounded-md shadow-sm mt-1">
                                <div
                                    class="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-md py-2 px-3 cursor-pointer flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                        stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-2">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.1-1.039m0 0a6 6 0 11-12 0" />
                                    </svg>
                                    <span>Subir Firma</span>
                                </div>
                                <input type="file" id="firmaFile" accept="image/png, image/jpeg" class="sr-only"
                                    onchange="previewImage(this, 'firmaPreview', 'firmaFile')">
                                <div id="firmaFile-loading"
                                    class="absolute inset-0 bg-gray-200 dark:bg-gray-900 bg-opacity-50 rounded-md flex items-center justify-center hidden">
                                    <div
                                        class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500">
                                    </div>
                                </div>
                            </div>
                        </label>
                        <div id="firmaPreview" class="mt-2 relative"></div>
                    </div>
                </div>
            </div>

            <div class="flex justify-end space-x-4 mt-8">
                <button type="button" id="cancelModal"
                    class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 transition duration-200 ease-in-out">
                    Cancelar
                </button>
                <button id="generar_word"
                    class="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-200 ease-in-out">
                    Generar Documento
                </button>
            </div>
        </div>
    </div>

    <script>
        function previewImage(input, previewId, inputId) {
            const previewContainer = document.getElementById(previewId);
            const loadingDiv = document.getElementById(inputId + '-loading');

            if (input.files && input.files[0]) {
                const reader = new FileReader();

                loadingDiv.classList.remove('hidden');
                previewContainer.innerHTML = ''; // Clear previous preview

                // Simulate loading for a bit (at least 500ms)
                const minLoadTime = 500;
                const startTime = Date.now();

                reader.onload = function(e) {
                    const loadTime = Date.now() - startTime;
                    const delay = Math.max(0, minLoadTime - loadTime);

                    setTimeout(() => {
                        loadingDiv.classList.add('hidden');
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.style.width = '50px';
                        img.style.height = '50px';
                        img.style.objectFit = 'contain';
                        img.classList.add('rounded-md', 'shadow-sm');

                        const removeButton = document.createElement('button');
                        removeButton.innerHTML =
                            '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 ml-2 text-red-500 hover:text-red-700 cursor-pointer">' +
                            '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>';
                        removeButton.classList.add('focus:outline-none');
                        removeButton.addEventListener('click', function() {
                            document.getElementById(inputId).value = ''; // Clear file input
                            previewContainer.innerHTML = ''; // Clear preview
                        });

                        const previewWrapper = document.createElement('div');
                        previewWrapper.classList.add('flex', 'items-center');
                        previewWrapper.appendChild(img);
                        previewWrapper.appendChild(removeButton);

                        previewContainer.appendChild(previewWrapper);
                    }, delay);
                }

                reader.readAsDataURL(input.files[0]);
            } else {
                previewContainer.innerHTML = ''; // Clear preview if no file selected
                loadingDiv.classList.add('hidden');
            }
        }
    </script>

    <script>
        // Función para abrir y cerrar el modal del "default-modal"
        const modalButtonDefault = document.querySelector('[data-modal-toggle="default-modal"]');
        const modalDefault = document.getElementById('default-modal');
        const closeModalButtonDefault = document.querySelector('[data-modal-hide="default-modal"]');

        // Función para abrir el modal "default-modal"
        modalButtonDefault.addEventListener('click', () => {
            modalDefault.classList.remove('hidden');
            modalDefault.classList.add('flex'); // Mostrar el modal
        });

        // Función para cerrar el modal "default-modal"
        closeModalButtonDefault.addEventListener('click', () => {
            modalDefault.classList.add('hidden');
            modalDefault.classList.remove('flex'); // Ocultar el modal
        });

        // Cerrar el modal "default-modal" si haces clic fuera de él
        window.addEventListener('click', (event) => {
            if (event.target === modalDefault) {
                modalDefault.classList.add('hidden');
                modalDefault.classList.remove('flex');
            }
        });

        document.getElementById("openModal").addEventListener("click", () => {
            document.getElementById("modalWord").classList.remove("hidden");
        });

        document.getElementById("cancelModal").addEventListener("click", () => {
            document.getElementById("modalWord").classList.add("hidden");
        });

        // document.getElementById("wordForm").addEventListener("submit", function(e) {
        //     e.preventDefault();

        //     const selected = Array.from(document.querySelectorAll('input[name="componentes"]:checked'))
        //         .map(cb => cb.value);

        //     document.getElementById("modalWord").classList.add("hidden");

        //     generarWord(selected);
        // });
    </script>

</x-app-layout>
