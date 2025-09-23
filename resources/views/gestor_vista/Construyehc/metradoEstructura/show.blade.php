<x-app-layout>
    <!-- FontAwesome CDN -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <x-slot name="header">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <!-- Título -->
            <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                <i class="fas fa-broadcast-tower mr-2 text-blue-600"></i>
                {{ __('Gestión Metrados Estructuras') }}
            </h2>

            <!-- Botones de acción -->
            <div class="flex flex-wrap items-center gap-2">
                <!-- Descargar Excel -->
                <button id="download-xlsx"
                    class="inline-flex items-center justify-center w-10 h-10 text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 shadow-lg shadow-green-500/50 dark:shadow-lg dark:shadow-green-800/80 rounded-lg transition-all duration-200 hover:scale-105"
                    data-tooltip="Descargar hoja de cálculo Excel" title="Descargar hoja de cálculo Excel">
                    <i class="fas fa-file-excel text-base"></i>
                </button>

                <!-- Separador visual -->
                <div class="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-1"></div>

                <div class="flex items-center gap-2">
                    <!-- Iniciar auto-actualización -->
                    <div class="relative group">
                        <button id="btnIniciarAuto"
                            class="inline-flex items-center justify-center w-10 h-10 text-white bg-green-600 hover:bg-green-700 shadow-lg rounded-lg transition-all duration-200 hover:scale-105">
                            <i class="fas fa-play text-base"></i>
                        </button>
                        <div
                            class="absolute left-1/2 top-full mt-1 -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            Iniciar auto-actualización
                        </div>
                    </div>

                    <!-- Intervalo de tiempo (informativo) -->
                    <div class="relative group">
                        <button id="btnTemporizador"
                            class="inline-flex items-center justify-center w-16 h-10 text-white bg-blue-500 shadow-lg rounded-lg transition-all duration-200 cursor-default text-sm font-mono">
                            <span id="timerDisplay">2:00</span>
                        </button>
                        <div
                            class="absolute left-1/2 top-full mt-1 -translate-x-1/2 bg-gray-700 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            Tiempo restante
                        </div>
                    </div>


                    <!-- Pausar auto-actualización -->
                    <div class="relative group">
                        <button id="btnPausarAuto"
                            class="inline-flex items-center justify-center w-10 h-10 text-white bg-yellow-500 hover:bg-yellow-600 shadow-lg rounded-lg transition-all duration-200 hover:scale-105">
                            <i class="fas fa-pause text-base"></i>
                        </button>
                        <div
                            class="absolute left-1/2 top-full mt-1 -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            Pausar auto-actualización
                        </div>
                    </div>

                    <!-- Guardar manual -->
                    <div class="relative group">
                        <button id="btnGuardarAhora"
                            class="inline-flex items-center justify-center w-10 h-10 text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg rounded-lg transition-all duration-200 hover:scale-105">
                            <i class="fas fa-save text-base"></i>
                        </button>
                        <div
                            class="absolute left-1/2 top-full mt-1 -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            Guardar cambios
                        </div>
                    </div>
                </div>


                <!-- Separador visual -->
                <div class="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-1"></div>

                <!-- Subir archivo -->
                <div class="flex items-center gap-2">
                    <label for="fileUpload"
                        class="inline-flex items-center justify-center w-10 h-10 text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 shadow-lg rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer"
                        data-tooltip="Seleccionar archivo Excel" title="Seleccionar archivo Excel">
                        <i class="fas fa-upload text-base"></i>
                    </label>
                    <input type="file" id="fileUpload" accept=".xls,.xlsx" class="hidden" />

                    <!-- Procesar archivo -->
                    <button id="uploadExcel"
                        class="inline-flex items-center justify-center w-10 h-10 text-white bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-orange-300 dark:focus:ring-orange-800 shadow-lg rounded-lg transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        data-tooltip="Procesar archivo Excel" title="Procesar archivo Excel" disabled>
                        <i class="fas fa-cogs text-base"></i>
                    </button>
                </div>

                <!-- Separador visual -->
                <div class="w-px h-8 bg-gray-300 dark:bg-gray-600 mx-1"></div>

                <!-- Regresar -->
                <a href="{{ route('metradoestructuras.index') }}"
                    class="inline-flex items-center justify-center w-10 h-10 text-white bg-gradient-to-r from-gray-500 via-gray-600 to-gray-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-gray-300 dark:focus:ring-gray-800 shadow-lg rounded-lg transition-all duration-200 hover:scale-105"
                    data-tooltip="Volver al listado" title="Volver al listado">
                    <i class="fas fa-arrow-left text-base"></i>
                </a>
            </div>
        </div>
    </x-slot>

    <!-- Tooltips CSS -->
    <style>
        /* Tooltips personalizados */
        [data-tooltip] {
            position: relative;
        }

        [data-tooltip]:hover::before {
            content: attr(data-tooltip);
            position: absolute;
            top: 120%;
            /* Se muestra debajo */
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            white-space: nowrap;
            z-index: 1000;
            opacity: 0;
            animation: tooltipFadeIn 0.2s ease-in-out forwards;
            pointer-events: none;
        }

        [data-tooltip]:hover::after {
            content: '';
            position: absolute;
            top: 110%;
            /* Flecha justo encima del tooltip */
            left: 50%;
            transform: translateX(-50%);
            border: 5px solid transparent;
            border-bottom-color: rgba(0, 0, 0, 0.9);
            /* Flecha hacia arriba */
            z-index: 1000;
            opacity: 0;
            animation: tooltipFadeIn 0.2s ease-in-out forwards;
        }

        @keyframes tooltipFadeIn {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(-5px);
                /* animación desde arriba */
            }

            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }

        /* Indicador visual de archivo seleccionado */
        .file-selected {
            background: linear-gradient(to right, #10b981, #059669, #047857) !important;
        }

        .file-selected i {
            animation: pulse 2s infinite;
        }

        @keyframes pulse {

            0%,
            100% {
                opacity: 1;
            }

            50% {
                opacity: 0.7;
            }
        }
    </style>

    <!-- Scripts necesarios -->
    <link href="https://unpkg.com/tabulator-tables@6.3.0/dist/css/tabulator.min.css" rel="stylesheet">
    <script type="text/javascript" src="https://unpkg.com/tabulator-tables@6.3.0/dist/js/tabulator.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/exceljs/dist/exceljs.min.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.1/xlsx.full.min.js"></script>
    <!-- Incluye SweetAlert2 desde CDN -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    <script type="module" src="{{ asset('assets/js/gestion_metrados_estructura_v2.js') }}"></script>
    <input type="hidden" name="datamodulos" id="datamodulos" value="{{ $metradoestructuras->documentosdata }}">
    <input type="hidden" name="idmetradoestructuras" id="idmetradoestructuras" value="{{ $metradoestructuras->idmetradoestructuras }}">
    <input type="hidden" name="nombre_proyecto" id="nombre_proyecto" value="{{ $metradoestructuras->nombre_proyecto }}">
    <input type="hidden" name="cui" id="cui" value="{{ $metradoestructuras->codigocui }}">
    <input type="hidden" name="codigo_modular" id="codigo_modular" value="{{ $metradoestructuras->codigo_modular }}">
    <input type="hidden" name="codigo_local" id="codigo_local" value="{{ $metradoestructuras->codigo_local }}">
    <input type="hidden" name="unidad_ejecutora" id="unidad_ejecutora"
        value="{{ $metradoestructuras->unidad_ejecutora }}">
    <input type="hidden" name="fecha" id="fecha" value="{{ $metradoestructuras->fecha }}">
    <input type="hidden" name="especialidad" id="especialidad" value="{{ $metradoestructuras->especialidad }}">
    <input type="hidden" name="localidad" id="localidad" value="{{ $metradoestructuras->ubicacion }}">
    <img id="imgencabezado" data-src="{{ asset('storage/eternit/cisternas/tanque1200.png') }}" />


    <div class="py-5">
        <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
            <div class="p-6">
                <!-- Tablas de metrados -->
                <div class="space-y-6">
                    <div>
                        <h3 class="text-gray-800 dark:text-gray-200 text-xl font-semibold mb-4 flex items-center">
                            <i class="fas fa-table text-blue-600 mr-2"></i>
                            Metrados de Estructura
                        </h3>
                        <div class="overflow-x-auto border rounded-lg" id="metrados-estructura-table"></div>
                    </div>

                    <div>
                        <h3 class="text-gray-800 dark:text-gray-200 text-xl font-semibold mb-4 flex items-center">
                            <i class="fas fa-chart-bar text-green-600 mr-2"></i>
                            Resumen de Metrados
                        </h3>
                        <div class="overflow-x-auto border rounded-lg" id="metrados-estructura-resumen"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Script para manejar la funcionalidad de los botones -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const fileInput = document.getElementById('fileUpload');
            const uploadButton = document.getElementById('uploadExcel');
            const fileLabel = fileInput.previousElementSibling;

            // Manejar selección de archivo
            fileInput.addEventListener('change', function() {
                if (this.files && this.files.length > 0) {
                    uploadButton.disabled = false;
                    uploadButton.classList.add('animate-bounce');
                    fileLabel.classList.add('file-selected');
                    fileLabel.setAttribute('data-tooltip', `Archivo seleccionado: ${this.files[0].name}`);

                    setTimeout(() => {
                        uploadButton.classList.remove('animate-bounce');
                    }, 1000);
                } else {
                    uploadButton.disabled = true;
                    fileLabel.classList.remove('file-selected');
                    fileLabel.setAttribute('data-tooltip', 'Seleccionar archivo Excel');
                }
            });

            // Animaciones hover para botones
            document.querySelectorAll('[data-tooltip]').forEach(element => {
                element.addEventListener('mouseenter', function() {
                    this.style.transform = 'scale(1.05)';
                });

                element.addEventListener('mouseleave', function() {
                    this.style.transform = 'scale(1)';
                });
            });
        });
    </script>

</x-app-layout>
