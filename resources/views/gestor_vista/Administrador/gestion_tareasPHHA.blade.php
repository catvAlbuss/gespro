<x-app-layout>
    <div id="app" class="font-sans antialiased">
        {{-- ======================= SCRIPTS & STYLES ======================= --}}
        <link href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/css/select2.min.css" rel="stylesheet" />
        <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/select2.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.14/jspdf.plugin.autotable.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.15.0/Sortable.min.js"></script>
        <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>

        {{-- ======================= MAIN CONTENT ======================= --}}
        <div class="py-2">
            <div class="max-w-full lg:px-2">
                <div class="bg-white dark:bg-gray-800 shadow-md sm:rounded-lg p-6">
                    @php
                        $permisos = auth()->user()->roles->first()->permissions;
                        $canManageTasks =
                            $permisos->contains('name', 'Jefe') ||
                            $permisos->contains('name', 'Administrador') ||
                            $permisos->contains('name', 'Administrativo');
                        // si el usuario puede aprobar (ejemplo: Jefe o Administrador)
                        $permisosUser =
                            $permisos->contains('name', 'Jefe') || $permisos->contains('name', 'Administrador');
                    @endphp

                    {{-- Inicialización para Vue --}}
                    <script>
                        window.APP_INIT = {
                            empresaId: @json($id),
                            trabajadorId: @json(Auth::user()->id),
                            rolUser: @json($permisos->pluck('name')->contains('Jefe') || Auth::user()->id == 16),
                            canManageTasks: @json($canManageTasks),
                            permisosUser: @json($permisosUser),
                            csrfToken: @json(csrf_token())
                        };
                    </script>

                    {{-- Gestor de Actividades --}}
                    @if ($canManageTasks)
                        <button @click="toggleTaskPanel"
                            class="flex items-center justify-center w-full bg-cyan-500 hover:bg-cyan-600 text-white py-3 px-6 rounded-lg font-semibold transition duration-200">
                            <span>Gestor de Actividades</span>
                            <svg :class="{ 'rotate-180': showTaskPanel }"
                                class="w-5 h-5 ml-2 transition-transform duration-200" xmlns="http://www.w3.org/2000/svg"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {{-- Panel de Gestión de Tareas --}}
                        <transition name="slide-down">
                            <div v-show="showTaskPanel"
                                class="flex flex-col bg-gray-800 text-white py-5 px-4 rounded-lg shadow-lg ring-1 ring-cyan-500/40 mt-4">
                                <div class="w-full bg-gray-800 text-white p-2 rounded-2xl shadow-lg">
                                    <form @submit.prevent="handleAddTask"
                                        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                                        <div class="flex flex-col">
                                            <label class="text-sm font-medium mb-2">Nombre de la tarea</label>
                                            <input v-model="newTask.name" type="text"
                                                placeholder="Nombre de la tarea"
                                                class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                                                required>
                                        </div>

                                        <div class="flex flex-col">
                                            <label class="text-sm font-medium mb-2">Seleccionar Proyecto</label>
                                            <select v-model="newTask.project"
                                                class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                                                required>
                                                <option value="">Seleccionar Proyecto</option>
                                                <option v-for="proyecto in proyectos" :key="proyecto.id_proyectos"
                                                    :value="proyecto.id_proyectos">
                                                    @{{ proyecto.nombre_proyecto }}
                                                </option>
                                            </select>
                                        </div>

                                        <div class="flex flex-col">
                                            <label class="text-sm font-medium mb-2">Asignar a</label>
                                            <select v-model="newTask.assignedTo"
                                                class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                                                required>
                                                <option value="">Seleccionar trabajador</option>
                                                <option v-for="worker in workers" :key="worker.id"
                                                    :value="worker.id">
                                                    @{{ worker.name }}
                                                </option>
                                            </select>
                                        </div>

                                        <div class="flex flex-col">
                                            <label class="text-sm font-medium mb-2">Días estimados</label>
                                            <input v-model.number="newTask.dias" type="number" min="1"
                                                placeholder="Días estimados"
                                                class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                                                required>
                                        </div>

                                        <div class="flex flex-col">
                                            <label class="text-sm font-medium mb-2">Porcentaje de actividad</label>
                                            <input v-model.number="newTask.porcent" type="number" min="0"
                                                max="100" placeholder="Porcentaje de actividad"
                                                class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white"
                                                required>
                                        </div>

                                        <div class="flex items-end">
                                            <button type="submit" :disabled="isLoadingTask"
                                                class="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-500 text-white py-3 px-6 rounded-lg font-semibold transition duration-200">
                                                <span v-if="isLoadingTask">Añadiendo...</span>
                                                <span v-else>Añadir Tarea</span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </transition>

                        {{-- Búsqueda por Personal --}}
                        <div
                            class="flex flex-col bg-gray-800 text-white py-5 px-6 rounded-lg shadow-lg ring-1 ring-cyan-500/40 mt-6">
                            <h2 class="text-xl font-bold text-center mb-4">Buscar Actividad por PERSONAL</h2>
                            <div class="flex items-end gap-4">
                                <div class="flex-1">
                                    <label class="text-sm font-medium mb-1 block">Buscar Personal</label>
                                    <select v-model="selectedWorkerSearch" @change="searchTasksByWorker"
                                        class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white">
                                        <option value="">Seleccionar trabajador</option>
                                        <option v-for="worker in workers" :key="worker.id" :value="worker.id">
                                            @{{ worker.name }}
                                        </option>
                                    </select>
                                </div>
                                <button @click="showPersonalModal = true"
                                    class="bg-cyan-600 text-white px-4 py-3 rounded-lg hover:bg-cyan-500 transition duration-200 shadow-md">
                                    ⚙️ Detalles IP
                                </button>
                            </div>
                        </div>
                    @endif

                    {{-- Botón Informe --}}
                    <div class="flex justify-end mb-4 mt-6">
                        <a href="{{ route('Tramites', ['empresaId' => $id]) }}" class="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md transition duration-200">📄 Iniciar Tramites Ip</a>
                        {{-- <button @click="openReportModal"
                            class="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-md transition duration-200">
                            
                        </button> --}}
                    </div>

                    {{-- Navegación por Fechas --}}
                    <div class="flex justify-between items-center mb-6">
                        <button @click="previousMonth"
                            class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200 text-lg">
                            &#9664;
                        </button>
                        <h4 class="text-gray-950 dark:text-gray-50 text-lg font-semibold">
                            @{{ currentMonthYear }}
                        </h4>
                        <button @click="nextMonth"
                            class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200 text-lg">
                            &#9654;
                        </button>
                    </div>

                    {{-- Gestión de Tareas (Kanban) --}}
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div v-for="column in columns" :key="column.id" class="flex flex-col">
                            <h2 class="font-bold text-center mb-2 text-gray-950 dark:text-gray-50">
                                @{{ column.title }}
                                <span class="text-sm font-normal">(@{{ column.days }} días)</span>
                            </h2>
                            <div :id="column.id + '-column'" :data-status="column.id"
                                class="column bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow-md min-h-[300px] flex-1 transition-colors duration-200"
                                @dragover.prevent @drop="handleDrop($event, column.id)">

                                {{-- Loading State --}}
                                <div v-if="isLoadingTasks" class="flex items-center justify-center h-32">
                                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
                                </div>

                                {{-- Task Cards --}}
                                <div v-else>
                                    <div v-for="task in getTasksByStatus(column.id)" :key="task.id"
                                        :data-task-id="task.id" draggable="true"
                                        @dragstart="handleDragStart($event, task)"
                                        class="task-card bg-white dark:bg-gray-800 p-4 mb-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 cursor-move hover:shadow-md transition-shadow duration-200">

                                        <div class="flex justify-between items-start mb-2">
                                            <h3 class="font-semibold text-gray-900 dark:text-white text-sm">
                                                @{{ task.name }}
                                            </h3>
                                            <div v-if="canManageTasks" class="flex space-x-1">
                                                <button @click="openEditModal(task)"
                                                    class="text-blue-500 hover:text-blue-700 text-xs">
                                                    ✏️
                                                </button>
                                                <button @click="deleteTask(task.id)"
                                                    class="text-red-500 hover:text-red-700 text-xs">
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>

                                        <div class="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                                            <div>Proyecto: @{{ task.project }}</div>
                                            <div>Asignado: @{{ task.assignedTo }}</div>
                                            <div>Días Ejecutados: @{{ task.elapsed_time }} / Dias Asignado
                                                @{{ task.diasAsignados }}</div>
                                            <div class="flex justify-between">
                                                <span>Porcentaje Designado</span>
                                                <span>@{{ task.porcentajeTarea }}%</span>
                                            </div>
                                        </div>

                                        <!-- Progress Bar -->
                                        <div class="mt-2 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                            <div class="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                                                :style="{ width: task.porcentajeTarea + '%' }"></div>
                                        </div>

                                        <div v-if="task.status === 'done' && permisosUser"
                                            class="approval-controls flex space-x-2 mt-3">

                                            <button @click="handleApproval(task.id, true)"
                                                class="px-3 py-2 text-xs font-medium text-white bg-green-700 rounded-lg hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300">
                                                Aprobar
                                            </button>

                                            <button @click="handleApproval(task.id, false)"
                                                class="px-3 py-2 text-xs font-medium text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300">
                                                Desaprobar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {{-- ======================= MODAL DE INFORME ======================= --}}
        <transition name="modal">
            <div v-if="showReportModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl p-6 mx-4">

                    <!-- Header -->
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Redactar Informe</h3>
                        <button @click="showReportModal = false" class="text-gray-400 hover:text-gray-500 text-2xl">
                            ×
                        </button>
                    </div>

                    <!-- Form -->
                    <form @submit.prevent="submitReport" class="space-y-4">

                        <!-- Para -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Para</label>
                            <select v-model="reportRecipient"
                                class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <option disabled value="">Selecciona un destinatario</option>
                                <option value="jefe_area">Jefe de Área</option>
                                <option value="admin_proyectos">Administrador de Proyectos</option>
                                <option value="gerencia">Gerencia</option>
                                <option value="contabilidad">Contabilidad</option>
                            </select>
                        </div>

                        <!-- Asunto -->
                        <div>
                            <label
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asunto</label>
                            <input type="text" v-model="reportSubject"
                                class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Ej: Informe semanal de actividades" />
                        </div>

                        {{-- <!-- Tipo de informe -->
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de
                                Informe</label>
                            <select v-model="reportType"
                                class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                <option value="daily">Diario</option>
                                <option value="weekly">Semanal</option>
                                <option value="monthly">Mensual</option>
                            </select>
                        </div> --}}

                        <!-- Descripcion -->
                        <div>
                            <label
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripcion</label>
                            <textarea v-model="reportDescription" rows="6"
                                class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Escribe aquí el detalle de las actividades realizadas..."></textarea>
                        </div>

                        <!-- Footer (Acciones) -->
                        <div class="flex justify-end gap-3">
                            <button type="button" @click="showReportModal = false"
                                class="px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:border-gray-500 dark:text-white transition duration-200">
                                Cancelar
                            </button>
                            <button type="submit" :disabled="isLoadingReport"
                                class="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 disabled:bg-gray-400 shadow-md transition duration-200">
                                <span v-if="isLoadingReport">Enviando...</span>
                                <span v-else>Enviar</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </transition>

        {{-- ======================= MODAL EDITAR TAREA ======================= --}}
        <transition name="modal">
            <div v-if="showEditModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                <div class="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 mx-4">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white">Editar Tarea</h3>
                        <button @click="showEditModal = false" class="text-gray-400 hover:text-gray-500 text-2xl">
                            ×
                        </button>
                    </div>

                    <form @submit.prevent="handleEditTask" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de la
                                Tarea</label>
                            <input v-model="editingTask.name" type="text"
                                class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Días
                                    estimados</label>
                                <input v-model.number="editingTask.dias" type="number" min="1"
                                    class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    required>
                            </div>

                            <div>
                                <label
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Porcentaje</label>
                                <input v-model.number="editingTask.porcent" type="number" min="0"
                                    max="100"
                                    class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    required>
                            </div>
                        </div>

                        <div>
                            <label
                                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proyecto</label>
                            <select v-model="editingTask.project"
                                class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required>
                                <option value="">Seleccionar Proyecto</option>
                                <option v-for="proyecto in proyectos" :key="proyecto.id_proyectos"
                                    :value="proyecto.id_proyectos">
                                    @{{ proyecto.nombre_proyecto }}
                                </option>
                            </select>
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asignado
                                a</label>
                            <select v-model="editingTask.assignedTo"
                                class="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                required>
                                <option value="">Seleccionar trabajador</option>
                                <option v-for="worker in workers" :key="worker.id" :value="worker.id">
                                    @{{ worker.name }}
                                </option>
                            </select>
                        </div>

                        <div class="flex justify-end gap-3">
                            <button type="button" @click="showEditModal = false"
                                class="px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:border-gray-500 dark:text-white transition duration-200">
                                Cancelar
                            </button>
                            <button type="submit" :disabled="isLoadingEdit"
                                class="px-4 py-2 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 disabled:bg-gray-400 shadow-md transition duration-200">
                                <span v-if="isLoadingEdit">Guardando...</span>
                                <span v-else>Guardar</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </transition>

        {{-- ======================= MODAL DE INFORME PERSONAL ======================= --}}
        <transition name="modal">
            <div v-if="showPersonalModal"
                class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                <div
                    class="bg-gray-800 text-white rounded-xl shadow-xl p-6 w-full max-w-5xl mx-4 ring-1 ring-cyan-600/30">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-2xl font-bold text-cyan-400">Buscar Actividad por PERSONAL</h2>
                        <button @click="showPersonalModal = false" class="text-white hover:text-red-400 text-2xl">
                            ×
                        </button>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="text-sm font-semibold text-cyan-300 block mb-1">Seleccione el
                                PERSONAL</label>
                            <select v-model="personalReport.trabajador"
                                class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 text-white">
                                <option value="">Seleccionar trabajador</option>
                                <option v-for="worker in workers" :key="worker.id" :value="worker.id">
                                    @{{ worker.name }}
                                </option>
                            </select>
                        </div>

                        <div>
                            <label class="text-sm font-semibold text-cyan-300 block mb-1">Mes</label>
                            <select v-model="personalReport.mes"
                                class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 text-white">
                                <option v-for="(mes, index) in meses" :key="index" :value="index + 1">
                                    @{{ mes }}
                                </option>
                            </select>
                        </div>

                        <div>
                            <label class="text-sm font-semibold text-cyan-300 block mb-1">Adelanto</label>
                            <input v-model.number="personalReport.adelanto" type="number" min="0"
                                class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 text-white">
                        </div>

                        <div>
                            <label class="text-sm font-semibold text-cyan-300 block mb-1">Permisos</label>
                            <input v-model.number="personalReport.permisos" type="number" min="0"
                                class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 text-white">
                        </div>

                        <div>
                            <label class="text-sm font-semibold text-cyan-300 block mb-1">Incumplimiento de MOF</label>
                            <input v-model.number="personalReport.incMof" type="number" min="0"
                                class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 text-white">
                        </div>

                        <div>
                            <label class="text-sm font-semibold text-cyan-300 block mb-1">Bonificación</label>
                            <input v-model.number="personalReport.bondtrab" type="number" min="0"
                                class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 text-white">
                        </div>

                        <div>
                            <label class="text-sm font-semibold text-cyan-300 block mb-1">Descuentos</label>
                            <input v-model.number="personalReport.descuenttrab" type="number" min="0"
                                class="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 text-white">
                        </div>

                        <div></div>

                        <div class="flex items-end">
                            <button @click="exportIP" :disabled="isLoadingExport"
                                class="w-full px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:bg-gray-500 transition duration-200 font-semibold shadow-md">
                                <span v-if="isLoadingExport">Exportando...</span>
                                <span v-else>🚀 Exportar IP</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </transition>

        {{-- ======================= SCRIPTS ======================= --}}
        @vite(['resources/js/app.js'])
    </div>
</x-app-layout>
