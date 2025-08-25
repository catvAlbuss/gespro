<x-app-layout>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/select2.min.js"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/css/select2.min.css" rel="stylesheet" />

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://unpkg.com/jspdf@latest/dist/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.14/jspdf.plugin.autotable.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js"></script>

    <x-slot name="header">
        @php
            $permisos = auth()->user()->roles->first()->permissions;
        @endphp
        <input type="hidden" id="trabajador_id" value="{{ Auth::user()->id }}">
        <input type="hidden" name="empresaId" id="empresaId" value="{{ $id }}">
        
        <!-- Permite aprobación si es Jefe o si el ID es 16 -->
        <input type="hidden" name="rolUser" id="rolUser"
            value="{{ $permisos->pluck('name')->contains('Jefe') || Auth::user()->id == 16 ? 'true' : 'false' }}">


        <!--<input type="hidden" name="rolUser" id="rolUser"
            value="{{ $permisos->pluck('name')->contains('Jefe') ? 'true' : 'false' }}">-->

        <button id="toggle-btn"
            class="flex items-center justify-center w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 px-6 rounded-lg font-semibold transition duration-200">
            <span>Gestor de Actividades</span>
            <svg id="arrow-icon" class="w-5 h-5 ml-2 transition-transform duration-300"
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        </button>
    </x-slot>

    <style>
        .column {
            min-height: 400px;
        }

        .animate-pulse {
            animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {

            0%,
            100% {
                opacity: 1;
            }

            50% {
                opacity: 0.5;
            }
        }

        #edit-task-modal {
            z-index: 50;
        }
    </style>

    <div class="py-1">
        <div class="max-w-full  lg:px-8">
            <div class="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                @if ($permisos->contains('name', 'Jefe') || $permisos->contains('name', 'Administrador') || $permisos->contains('name', 'Administrativo'))
                    <div class="flex">
                        <div class="w-full bg-gray-800 text-white p-8 rounded-2xl shadow-lg py-1">
                            <div id="task-content" class="mt-6">
                                <form id="add-task-form" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div class="flex flex-col">
                                        <label for="task-name" class="text-sm font-medium mb-2">Nombre de la
                                            tarea</label>
                                        <input type="text" id="task-name" placeholder="Nombre de la tarea"
                                            class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                                    </div>

                                    <div class="flex flex-col">
                                        <label for="task-project" class="text-sm font-medium mb-2">Seleccionar
                                            Proyecto</label>
                                        <select id="task-project"
                                            class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                                            <option value="">Seleccionar Proyecto</option>
                                        </select>
                                    </div>

                                    <div class="flex flex-col">
                                        <label for="task-assigned-to" class="text-sm font-medium mb-2">Asignar
                                            a</label>
                                        <select id="task-assigned-to"
                                            class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                                            <option value="">Seleccionar trabajador</option>
                                        </select>
                                    </div>

                                    <div class="flex flex-col">
                                        <label for="task-dias-asignados" class="text-sm font-medium mb-2">Días
                                            estimados</label>
                                        <input type="text" id="task-dias-asignados" placeholder="Días estimados"
                                            class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                                    </div>

                                    <div class="flex flex-col">
                                        <label for="task-porcent-avance" class="text-sm font-medium mb-2">Porcentaje
                                            de actividad</label>
                                        <input type="text" id="task-porcent-avance"
                                            placeholder="Porcentaje de actividad"
                                            class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                                    </div>

                                    <div class="w-full flex justify-center items-center">
                                        <button type="submit"
                                            class="bg-cyan-500 hover:bg-cyan-600 text-white py-3 px-6 rounded-lg font-semibold transition duration-200">
                                            Añadir Tarea
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    <script>
                        document.getElementById('toggle-btn').addEventListener('click', function() {
                            const content = document.getElementById('task-content');
                            const arrow = document.getElementById('arrow-icon');
                            content.classList.toggle('hidden');
                            arrow.classList.toggle('rotate-180');
                        });
                    </script>
                    <!-- Sección principal con botón para abrir modal -->
                    <div
                        class="flex flex-col bg-gray-800 text-white py-5 -mt-5 px-6 rounded-lg shadow-lg ring-1 ring-cyan-500/40">
                        <h2 class="text-xl font-bold text-center mb-4">Buscar Actividad por PERSONAL</h2>
                        <div class="flex items-end gap-4">
                            <div class="flex-1">
                                <label for="search-task-assigned-to" class="text-sm font-medium mb-1">Buscar Personal
                                </label>
                                <select id="search-task-assigned-to"
                                    class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                                    <option value="">Seleccionar trabajador</option>
                                </select>
                            </div>
                            <button onclick="document.getElementById('modal-personal').classList.remove('hidden')"
                                class="bg-cyan-600 text-white px-4 py-3 rounded-lg hover:bg-cyan-500 transition duration-200 shadow-md">
                                ⚙️ Detalles IP
                            </button>
                        </div>
                    </div>
                @endif
                <!-- Navegación por Fechas -->
                <div class="flex justify-between items-center mb-6">
                    <button id="prev-date"
                        class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200 ease-in-out text-lg">&#9664;</button>
                    <h4 class="text-gray-950 dark:text-gray-50 text-lg font-semibold" id="month_now">FEBRERO-2025</h4>
                    <button id="next-date"
                        class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200 ease-in-out text-lg">&#9654;</button>
                </div>

                <!-- Modal Tareas -->
                <div id="edit-task-modal"
                    class="modal hidden fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
                    <div class="modal-content bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                        <h2 class="text-2xl font-semibold mb-6 text-center">Editar Tarea</h2>
                        <form id="edit-task-form" data-task-id="3">
                            <div class="mb-4">
                                <label for="edit-task-name" class="block text-sm font-medium text-gray-700">Nombre
                                    de la
                                    Tarea</label>
                                <input type="text" id="edit-task-name" name="edit-task-name"
                                    class="w-full p-3 text-gray-50 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                    placeholder="Nombre de la tarea" required />
                            </div>

                            <input type="hidden" id="edit-taskId"
                                class="w-full p-2 mt-1 border border-gray-300 rounded-md" />
                            <div class="flex flex-col">
                                <label for="edit-task-dias-asignados" class="text-sm font-medium mb-2">Días
                                    estimados</label>
                                <input type="text" id="edit-task-dias-asignados" name="edit-task-dias-asignados" placeholder="Días estimados"
                                    class="w-full p-3 text-gray-50 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                            </div>

                            <div class="flex flex-col">
                                <label for="edit-task-porcent-avance" class="text-sm font-medium mb-2">Porcentaje
                                    de actividad</label>
                                <input type="text" id="edit-task-porcent-avance" name="edit-task-porcent-avance" placeholder="Porcentaje de actividad"
                                    class="w-full p-3 text-gray-50 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent">
                            </div>

                            <input type="hidden" id="edit-taskId"
                                class="w-full p-2 mt-1 border border-gray-300 rounded-md" />

                            <div class="mb-4">
                                <label for="edit-task-project"
                                    class="block text-sm font-medium text-gray-700">Proyecto</label>
                                <select id="edit-task-project" name="edit-task-project"
                                    class="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent select2"
                                    required>
                                    <option value="">Selecciona un proyecto</option>
                                    <!-- Las opciones de los proyectos se cargarán dinámicamente -->
                                </select>
                            </div>

                            <div class="mb-4">
                                <label for="edit-task-assigned-to"
                                    class="block text-sm font-medium text-gray-700">Asignado a</label>
                                <select id="edit-task-assigned-to" name="edit-task-assigned-to"
                                    class="w-full p-3 mt-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent select2"
                                    required>
                                    <option value="">Asignar a</option>
                                    <!-- Las opciones de los usuarios se cargarán dinámicamente -->
                                </select>
                            </div>

                            <div class="flex justify-end mt-6 space-x-4">
                                <button type="submit"
                                    class="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition-colors duration-200">Guardar</button>
                                <button type="button" id="cerrar_modal"
                                    class="bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600 transition-colors duration-200">Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
                <!-- Gestión de Tareas -->
                <div class="grid grid-cols-4 gap-4">
                    <div>
                        <h2 class="font-bold text-center mb-2 text-gray-950 dark:text-gray-50">Por Hacer (<span id="totaldiashacer">0 dias</span>)</h2>
                        <div id="todo-column" class="column bg-gray-200 p-2 rounded"></div>
                    </div>
                    <div>
                        <h2 class="font-bold text-center mb-2 text-gray-950 dark:text-gray-50">Haciendo (<span id="totaldiashaciendo">0 dias</span>)</h2>
                        <div id="doing-column" class="column bg-gray-200 p-2 rounded"></div>
                    </div>
                    <div>
                        <h2 class="font-bold text-center mb-2 text-gray-950 dark:text-gray-50">Hecho (<span id="totaldiashecho">0 dias</span>)</h2>
                        <div id="done-column" class="column bg-gray-200 p-2 rounded"></div>
                    </div>
                    <div>
                        <h2 class="font-bold text-center mb-2 text-gray-950 dark:text-gray-50">Aprobado (<span id="totaldiasaprobado">0 dias</span>)</h2>
                        <div id="approved-column" class="column bg-gray-200 p-2 rounded"></div>
                    </div>
                </div>
                
                <!-- Modal futurista -->
                <div id="modal-personal"
                    class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div
                        class="bg-gray-800 text-white rounded-xl shadow-xl p-6 w-full max-w-5xl ring-1 ring-cyan-600/30 backdrop-blur-lg relative">
                        <button onclick="document.getElementById('modal-personal').classList.add('hidden')"
                            class="absolute top-3 right-4 text-white text-xl hover:text-red-400">✖</button>

                        <h2 class="text-2xl font-bold text-center text-cyan-400 mb-6">Buscar Actividad por PERSONAL
                        </h2>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4"></div>

                        <!-- Campos adicionales -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                            <!-- Select trabajador -->
                            <div>
                                <label for="search-task-assigned-to-modal"
                                    class="text-sm font-semibold text-cyan-300">Seleccione el PERSONAL</label>
                                <select id="search-task-assigned-to-modal"
                                    class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 mt-1">
                                    <option value="">Seleccionar trabajador</option>
                                </select>
                            </div>

                            <!-- Select mes -->
                            <div>
                                <label for="month-select" class="text-sm font-semibold text-cyan-300">Mes</label>
                                <select id="month-select"
                                    class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 mt-1">
                                    <option value="1">Enero</option>
                                    <option value="2">Febrero</option>
                                    <option value="3">Marzo</option>
                                    <option value="4">Abril</option>
                                    <option value="5">Mayo</option>
                                    <option value="6">Junio</option>
                                    <option value="7">Julio</option>
                                    <option value="8">Agosto</option>
                                    <option value="9">Septiembre</option>
                                    <option value="10">Octubre</option>
                                    <option value="11">Noviembre</option>
                                    <option value="12">Diciembre</option>
                                </select>
                            </div>

                            <div>
                                <label for="adelanto" class="text-sm font-semibold text-cyan-300">Adelanto</label>
                                <input id="adelanto" name="adelanto" type="number" value="0"
                                    class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 mt-1">
                            </div>
                            <div>
                                <label for="permisos" class="text-sm font-semibold text-cyan-300">Permisos</label>
                                <input id="permisos" name="permisos" type="number" value="0"
                                    class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 mt-1">
                            </div>
                            <div>
                                <label for="incMof" class="text-sm font-semibold text-cyan-300">Incumplimiento de
                                    MOF</label>
                                <input id="incMof" name="incMof" type="number" value="0"
                                    class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 mt-1">
                            </div>
                            <div>
                                <label for="bondtrab" class="text-sm font-semibold text-cyan-300">Bonificación</label>
                                <input id="bondtrab" name="bondtrab" type="number" value="0"
                                    class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 mt-1">
                            </div>
                            <div>
                                <label for="descuenttrab"
                                    class="text-sm font-semibold text-cyan-300">Descuentos</label>
                                <input id="descuenttrab" name="descuenttrab" type="number" value="0"
                                    class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 mt-1">
                            </div>
                            <div class=""></div>
                            <!-- Botón exportar -->
                            <div class="flex items-end">
                                <button id="export-ip-btn"
                                    class="w-full px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition duration-200 font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-400">
                                    🚀 Exportar IP
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    </div>

    <script src="{{ asset('assets/js/gestion_actividadesv11.js') }}"></script>
    <script>
        $(document).ready(function() {
            $('.select2').select2();
        });
    </script>
</x-app-layout>
