<x-app-layout>
    <script src="https://docs.dhtmlx.com/gantt/codebase/dhtmlxgantt.js?v=6.0.0"></script>
    <link rel="stylesheet" href="https://docs.dhtmlx.com/gantt/codebase/dhtmlxgantt.css?v=6.0.0">
    <!-- Include export API for PDF and MS Project -->
    <script src="https://export.dhtmlx.com/gantt/api.js"></script>
    <script src="https://code.jquery.com/jquery-1.7.1.min.js?v=8.0.3"></script>

    <!-- Moment.js -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"></script>

    <!-- Moment Timezone.js -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.34/moment-timezone-with-data.min.js"></script>
    <script src="codebase/ext/dhtmlxgantt_auto_scheduling.js"></script>

    <style>
        html,
        body {
            margin: 0;
            padding: 0;
            height: 100%;
            font-family: Arial, Helvetica, sans-serif;
        }

        .controls {
            padding: 10px;
            background-color: #f5f5f5;
            border-bottom: 1px solid #ddd;
        }

        .controls button {
            padding: 8px 15px;
            margin-right: 10px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        .controls button:hover {
            background-color: #45a049;
        }

        .gantt-chart-container {
            height: calc(100vh - 60px);
            width: 100%;
        }

        /* Custom legends for critical path */
        .legends {
            padding: 10px;
            display: flex;
            align-items: center;
            gap: 20px;
            background-color: #f9f9f9;
            border-bottom: 1px solid #eee;
        }

        .legend-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .legend-color {
            width: 20px;
            height: 12px;
            display: inline-block;
        }

        .critical-color {
            background-color: #ff5252;
            border: 1px solid #d32f2f;
        }

        .normal-color {
            background-color: #42a5f5;
            border: 1px solid #1976d2;
        }

        .summary-color {
            background-color: #4b8be0;
            border: 1px solid #1a73e8;
        }

        .critical_task {
            background-color: #ffcccc !important;
            border: 1px solid #ff0000 !important;
        }

        .critical_link {
            stroke: #ff0000 !important;
            stroke-width: 2px !important;
        }

        #gantt_here {
            width: 100%;
            height: 500px;
        }

        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9999;
            /* High z-index to ensure modal is above all */
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease-in-out;
        }

        .modal-content {
            background: linear-gradient(145deg, #ffffff, #e6e6e6);
            border-radius: 12px;
            width: 90%;
            max-width: 900px;
            max-height: 85vh;
            overflow-y: auto;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            animation: slideIn 0.3s ease-in-out;
        }

        .predecessors-cell-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
        }

        .pred-item {
            transition: background 0.2s;
        }

        .pred-item:hover {
            background: #f1f5f9;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
            }

            to {
                opacity: 1;
            }
        }

        @keyframes slideIn {
            from {
                transform: translateY(-50px);
                opacity: 0;
            }

            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        /* Custom scrollbar */
        .modal-content::-webkit-scrollbar {
            width: 8px;
        }

        .modal-content::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
        }

        .modal-content::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
        }

        .modal-content::-webkit-scrollbar-thumb:hover {
            background: #555;
        }

        /* Style for non-working days */
        .gantt_non_working {
            background: repeating-linear-gradient(45deg,
                    #f0f0f0,
                    #f0f0f0 10px,
                    #e0e0e0 10px,
                    #e0e0e0 20px);
            opacity: 0.6;
        }

        /* Modal overlay and transitions */
        .modal {
            transition: opacity 0.3s ease-in-out;
        }

        .modal-content {
            transition: transform 0.3s ease-in-out;
        }
    </style>
    <div class="py-2">
        <input type="hidden" name="proyecto_id" id="proyecto_id" value="1">
        <input type="hidden" name="cronograma_id" id="cronograma_id" value="1">
        <div class="controls">
            <button id="btn-import">Importar Presupuestos</button>
            <button id="exportPDF">Exportar PDF</button>
            <button id="exportMSProject">Exportar to MS Project</button>
            <button id="importMSProject">Importar de MS Project</button>
            <button id="toggleCriticalPath">Ruta Critica</button>
            <button id="saveGantt" class="btn btn-primary">Guardar Cronograma</button>
            <!-- Button to open the modal -->
            <button id="ajustesProyectoModal"
                class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200">
                Ajustes Proyecto
            </button>
        </div>
        <div id="gantt_here" class="gantt-chart-container"></div>

        <!-- Modal -->
        <div id="predecessorModal" class="modal">
            <div class="modal-content">
                <div class="p-8">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-gray-800">Gestión de Predecesores</h2>
                        <button id="closeModal"
                            class="text-gray-500 hover:text-gray-700 text-2xl transition-transform hover:scale-110">×</button>
                    </div>
                    <!-- Search -->
                    <div class="mb-6">
                        <input id="searchPredecessor" type="text" placeholder="Buscar por nombre..."
                            class="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                    </div>
                    <!-- Predecessor List -->
                    <div class="overflow-x-auto">
                        <div id="predecessorList" class="space-y-2"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal -->
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center hidden transition-opacity duration-300"
            id="ganttSettingsModal">
            <div
                class="modal-content bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 transform transition-transform duration-300 scale-95">
                <!-- Modal Header -->
                <div class="flex justify-between items-center border-b pb-3 mb-4">
                    <h5 class="text-xl font-semibold text-gray-800">Ajustes del Proyecto</h5>
                    <button type="button" class="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                        data-dismiss="modal">×</button>
                </div>

                <!-- Modal Body -->
                <div class="space-y-6">
                    <!-- Time Scale Configuration -->
                    <div>
                        <h6 class="text-lg font-medium text-gray-700 mb-3">Configuración de Escala de Tiempo</h6>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="topTierUnit" class="block text-sm font-medium text-gray-600 mb-1">Unidad
                                    (Capa Superior)</label>
                                <select id="topTierUnit"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="day">Día (D)</option>
                                    <option value="week">Semana (W)</option>
                                    <option value="month">Mes (M)</option>
                                    <option value="year">Año (Y)</option>
                                </select>
                            </div>
                            <div>
                                <label for="topTierFormat"
                                    class="block text-sm font-medium text-gray-600 mb-1">Formato</label>
                                <select id="topTierFormat"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></select>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div>
                                <label for="bottomTierUnit" class="block text-sm font-medium text-gray-600 mb-1">Unidad
                                    (Capa Inferior)</label>
                                <select id="bottomTierUnit"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                    <option value="day">Día (D)</option>
                                    <option value="week">Semana (W)</option>
                                    <option value="month">Mes (M)</option>
                                    <option value="year">Año (Y)</option>
                                </select>
                            </div>
                            <div>
                                <label for="bottomTierFormat"
                                    class="block text-sm font-medium text-gray-600 mb-1">Formato</label>
                                <select id="bottomTierFormat"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"></select>
                            </div>
                        </div>
                    </div>

                    <!-- Project Dates -->
                    <div>
                        <h6 class="text-lg font-medium text-gray-700 mb-3">Fechas del Proyecto</h6>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="projectStart" class="block text-sm font-medium text-gray-600 mb-1">Inicio
                                    del Proyecto</label>
                                <input type="date" id="projectStart"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            </div>
                            <div>
                                <label for="projectEnd" class="block text-sm font-medium text-gray-600 mb-1">Fin
                                    Pronosticado</label>
                                <input type="date" id="projectEnd"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            </div>
                        </div>
                        <div class="mt-3 flex items-center">
                            <input type="checkbox" id="scheduleFromEnd"
                                class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                            <label for="scheduleFromEnd" class="ml-2 text-sm text-gray-600">Programar desde el
                                Fin</label>
                        </div>
                    </div>

                    <!-- Working Days -->
                    <div>
                        <h6 class="text-lg font-medium text-gray-700 mb-3">Días Laborales</h6>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="space-y-2">
                                <div class="flex items-center">
                                    <input type="checkbox" id="workMon"
                                        class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        checked>
                                    <label for="workMon" class="ml-2 text-sm text-gray-600">Lunes</label>
                                </div>
                                <div class="flex items-center">
                                    <input type="checkbox" id="workTue"
                                        class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        checked>
                                    <label for="workTue" class="ml-2 text-sm text-gray-600">Martes</label>
                                </div>
                                <div class="flex items-center">
                                    <input type="checkbox" id="workWed"
                                        class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        checked>
                                    <label for="workWed" class="ml-2 text-sm text-gray-600">Miércoles</label>
                                </div>
                                <div class="flex items-center">
                                    <input type="checkbox" id="workThu"
                                        class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        checked>
                                    <label for="workThu" class="ml-2 text-sm text-gray-600">Jueves</label>
                                </div>
                            </div>
                            <div class="space-y-2">
                                <div class="flex items-center">
                                    <input type="checkbox" id="workFri"
                                        class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        checked>
                                    <label for="workFri" class="ml-2 text-sm text-gray-600">Viernes</label>
                                </div>
                                <div class="flex items-center">
                                    <input type="checkbox" id="workSat"
                                        class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                                    <label for="workSat" class="ml-2 text-sm text-gray-600">Sábado</label>
                                </div>
                                <div class="flex items-center">
                                    <input type="checkbox" id="workSun"
                                        class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                                    <label for="workSun" class="ml-2 text-sm text-gray-600">Domingo</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Working Hours -->
                    <div>
                        <h6 class="text-lg font-medium text-gray-700 mb-3">Horario Laboral</h6>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label for="workStartHour" class="block text-sm font-medium text-gray-600 mb-1">Hora
                                    de Inicio</label>
                                <input type="time" id="workStartHour" value="09:00"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            </div>
                            <div>
                                <label for="workEndHour" class="block text-sm font-medium text-gray-600 mb-1">Hora de
                                    Fin</label>
                                <input type="time" id="workEndHour" value="17:00"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal Footer -->
                <div class="flex justify-end space-x-3 mt-6 pt-4 border-t">
                    <button type="button"
                        class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200"
                        data-dismiss="modal">Cerrar</button>
                    <button type="button" id="saveSettings"
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200">Guardar
                        Cambios</button>
                </div>
            </div>
        </div>
        <!-- End Modal -->

    </div>
    <script src="codebase/dhtmlxgantt.js"></script>
    <script src="https://export.dhtmlx.com/gantt/api.js"></script>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script type="module" src="{{ asset('assets/js/gestion_diagrama_gantt.js') }}"></script>
</x-app-layout>
