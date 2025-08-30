import { createApp, ref, reactive, computed, onMounted, nextTick, onUnmounted } from 'vue';

const app = createApp({
    setup() {
        // ======================= STATE =======================
        const showTaskPanel = ref(false);
        const showReportModal = ref(false);
        const showEditModal = ref(false);
        const showPersonalModal = ref(false);

        // Loading states
        const isLoadingTasks = ref(false);
        const isLoadingTask = ref(false);
        const isLoadingReport = ref(false);
        const isLoadingEdit = ref(false);
        const isLoadingExport = ref(false);

        // Form data
        const reportType = ref('daily');
        const reportDescription = ref('');

        const newTask = reactive({
            name: '',
            project: '',
            assignedTo: '',
            dias: 0,
            porcent: 0
        });

        const editingTask = ref({});
        const selectedWorkerSearch = ref('');

        // Sistema de seguimiento de tiempo diario
        const dailyTimeTracking = ref({});
        const lastDailyCheck = ref(new Date().toDateString());

        const personalReport = reactive({
            trabajador: '',
            mes: new Date().getMonth() + 1,
            adelanto: 0,
            permisos: 0,
            incMof: 0,
            bondtrab: 0,
            descuenttrab: 0
        });

        const permisosUser = ref(false);

        // App configuration
        const empresaId = ref(null);
        const trabajadorId = ref(null);
        const rolUser = ref(false);
        const canManageTasks = ref(false);
        const csrfToken = ref('');

        // Data collections
        const tasks = ref([]);
        const workers = ref([]);
        const proyectos = ref([]);

        // Current date navigation
        const currentDate = ref(new Date());
        const searchDate = ref(new Date());

        // Kanban columns
        const columns = reactive([
            { id: 'todo', title: 'Por Hacer', days: 0 },
            { id: 'doing', title: 'Haciendo', days: 0 },
            { id: 'done', title: 'Hecho', days: 0 },
            { id: 'approved', title: 'Aprobado', days: 0 }
        ]);

        // Month names
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        // Daily check interval
        let dailyCheckInterval = null;

        // ======================= COMPUTED =======================
        const currentMonthYear = computed(() => {
            const date = selectedWorkerSearch.value ? searchDate.value : currentDate.value;
            const monthName = meses[date.getMonth()];
            const year = date.getFullYear();
            return `${monthName.toUpperCase()}-${year}`;
        });

        const searchMonthYear = computed(() => {
            const monthName = meses[searchDate.value.getMonth()];
            const year = searchDate.value.getFullYear();
            return `${monthName.toUpperCase()}-${year}`;
        });

        // ======================= METHODS =======================

        // Initialize app configuration
        const initializeConfig = () => {
            if (window.APP_INIT) {
                empresaId.value = window.APP_INIT.empresaId;
                trabajadorId.value = window.APP_INIT.trabajadorId;
                rolUser.value = window.APP_INIT.rolUser;
                canManageTasks.value = window.APP_INIT.canManageTasks;
                permisosUser.value = window.APP_INIT.permisosUser;
                csrfToken.value = window.APP_INIT.csrfToken;
            } else {
                console.warn('APP_INIT no está disponible');
            }
        };

        // Toggle task panel
        const toggleTaskPanel = () => {
            showTaskPanel.value = !showTaskPanel.value;
        };

        // Date navigation mejorada
        const previousMonth = () => {
            if (selectedWorkerSearch.value) {
                searchDate.value = new Date(searchDate.value.setMonth(searchDate.value.getMonth() - 1));
                loadTasks(selectedWorkerSearch.value);
            } else {
                currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() - 1));
                loadTasks();
            }
        };

        const nextMonth = () => {
            if (selectedWorkerSearch.value) {
                searchDate.value = new Date(searchDate.value.setMonth(searchDate.value.getMonth() + 1));
                loadTasks(selectedWorkerSearch.value);
            } else {
                currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() + 1));
                loadTasks();
            }
        };

        // API calls
        const loadWorkers = async () => {
            try {
                const response = await fetch(`/listar_trab/${empresaId.value}`);
                const data = await response.json();
                workers.value = Array.isArray(data) ? data : Object.values(data);

                await nextTick();
                initializeSelect2();
            } catch (error) {
                console.error('Error cargando trabajadores:', error);
                showNotification('Error al cargar trabajadores', 'error');
            }
        };

        const loadProyectos = async () => {
            try {
                const response = await fetch(`/listar_pro/${empresaId.value}`);
                const data = await response.json();
                proyectos.value = Array.isArray(data) ? data : [];
            } catch (error) {
                console.error('Error cargando proyectos:', error);
                showNotification('Error al cargar proyectos', 'error');
            }
        };

        // Cargar tareas mejorado para búsqueda por trabajador
        const loadTasks = async (selectedWorkerId = null) => {
            isLoadingTasks.value = true;
            try {
                // Usar la fecha correcta según el contexto
                const dateToUse = selectedWorkerId ? searchDate.value : currentDate.value;
                const month = dateToUse.getMonth() + 1;
                const year = dateToUse.getFullYear();

                // URL base para las tareas
                let url = `/actividadpersonal?empresaId=${empresaId.value}&month=${month}&year=${year}`;

                // Si hay un trabajador seleccionado, agregarlo a la URL
                if (selectedWorkerId) {
                    url += `&usuarioId=${selectedWorkerId}`;
                } else if (trabajadorId.value) {
                    url += `&usuarioId=${trabajadorId.value}`;
                }

                const response = await fetch(url);
                const data = await response.json();

                // console.log('Datos recibidos:', data);

                // Limpiar tareas existentes
                tasks.value = [];

                if (Array.isArray(data)) {
                    data.forEach(taskData => {
                        if (!taskData.task) return;
                        const task = taskData.task;

                        // Validar fecha
                        if (!task.fecha || !/^\d{4}-\d{2}-\d{2}/.test(task.fecha)) return;

                        const taskDate = new Date(task.fecha);

                        // Para búsquedas por trabajador, mostrar todas las tareas del mes/año
                        // independientemente del mes actual
                        if (taskDate.getMonth() + 1 !== month || taskDate.getFullYear() !== year) {
                            return;
                        }

                        // Procesar tarea
                        const processedTask = {
                            id: task.actividadId || task.id,
                            name: task.nameActividad || task.name,
                            project: taskData.project_name || 'Sin proyecto',
                            projectId: taskData.project_id,
                            assignedTo: taskData.user_name || 'Sin asignar',
                            assignedToId: taskData.user_id,
                            status: task.status || 'todo',
                            fecha: task.fecha,
                            diasAsignados: parseFloat(task.diasAsignados) || 0,
                            diasRestantes: parseFloat(task.diasRestantes) || parseFloat(task.diasAsignados) || 0,
                            porcentajeTarea: task.porcentajeTarea || 0,
                            elapsed_time: parseFloat(task.elapsed_time || task.elapsed_timeActividadId) || 0
                        };

                        tasks.value.push(processedTask);
                    });
                }

                // Actualizar contadores en la interfaz
                updateColumnDays();

            } catch (error) {
                console.error('Error cargando tareas:', error);
                showNotification('Error al cargar tareas', 'error');
            } finally {
                isLoadingTasks.value = false;
            }
        };

        // Task management
        const handleAddTask = async () => {
            if (!newTask.name || !newTask.project || !newTask.assignedTo || !newTask.dias) {
                showNotification('Por favor completa todos los campos requeridos', 'warning');
                return;
            }

            isLoadingTask.value = true;
            try {
                const response = await fetch('/tasks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken.value
                    },
                    body: JSON.stringify({
                        ...newTask,
                        empresa_id: empresaId.value,
                        status: 'todo',
                        created_by: trabajadorId.value
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    tasks.value.push(result.task);
                    resetNewTask();
                    updateColumnDays();
                    showNotification('Tarea creada exitosamente', 'success');
                } else {
                    showNotification(result.message || 'Error al crear la tarea', 'error');
                }
            } catch (error) {
                console.error('Error creando tarea:', error);
                showNotification('Error al crear la tarea', 'error');
            } finally {
                isLoadingTask.value = false;
            }
        };

        const resetNewTask = () => {
            Object.assign(newTask, {
                name: '',
                project: '',
                assignedTo: '',
                dias: 0,
                porcent: 0
            });
        };

        const openEditModal = (task) => {
            console.log(task);
            editingTask.value = {
                id: task.id,
                name: task.name,
                project: task.projectId,
                assignedTo: task.assignedToId,
                dias: task.diasAsignados,
                porcent: task.porcentajeTarea
            };
            showEditModal.value = true;

            nextTick(() => {
                if (window.$ && window.$.fn.select2) {
                    $('#edit-task-project, #edit-task-assigned-to').trigger('change');
                }
            });
        };

        const handleEditTask = async () => {
            if (!editingTask.value.name || !editingTask.value.project || !editingTask.value.assignedTo) {
                showNotification('Por favor completa todos los campos requeridos', 'warning');
                return;
            }

            isLoadingEdit.value = true;
            try {
                const response = await fetch(`/actualizar_fichas/${editingTask.value.id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken.value
                    },
                    body: JSON.stringify({
                        nameActividad: editingTask.value.name,
                        projectActividad: editingTask.value.project,
                        usuario_designado: editingTask.value.assignedTo,
                        diasAsignados: editingTask.value.dias,
                        porcentajeTarea: editingTask.value.porcent,
                    })
                });

                const result = await response.json();

                if (result.success) {
                    const index = tasks.value.findIndex(t => t.id === editingTask.value.id);
                    if (index !== -1) {
                        tasks.value[index] = {
                            ...tasks.value[index],
                            name: editingTask.value.name,
                            projectId: editingTask.value.project,
                            assignedToId: editingTask.value.assignedTo,
                            diasAsignados: parseFloat(editingTask.value.dias),
                            porcentajeTarea: parseFloat(editingTask.value.porcent),
                            project: getProjectName(editingTask.value.project),
                            assignedTo: getWorkerName(editingTask.value.assignedTo)
                        };
                    }

                    showEditModal.value = false;
                    updateColumnDays();
                    showNotification('Tarea actualizada exitosamente', 'success');
                } else {
                    showNotification(result.message || 'Error al actualizar la tarea', 'error');
                }
            } catch (error) {
                console.error('Error actualizando tarea:', error);
                showNotification('Error al actualizar la tarea', 'error');
            } finally {
                isLoadingEdit.value = false;
            }
        };

        // Eliminación de tareas
        const deleteTask = async (taskId) => {
            if (!confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
                return;
            }

            try {
                const response = await fetch(`/actividadpersonal/${taskId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken.value
                    }
                });

                if (response.ok) {
                    tasks.value = tasks.value.filter(t => t.id !== taskId);
                    updateColumnDays();
                    showNotification('Tarea eliminada exitosamente', 'success');
                } else {
                    const errorData = await response.json();
                    showNotification(errorData.message || 'Error al eliminar la tarea', 'error');
                }
            } catch (error) {
                console.error('Error eliminando tarea:', error);
                showNotification('Error al eliminar la tarea', 'error');
            }
        };

        // Actualizar estado de tarea mejorado
        const updateTaskStatus = async (taskId, newStatus) => {
            const task = tasks.value.find(t => t.id === taskId);
            if (!task) return;

            const oldStatus = task.status;

            try {
                const response = await fetch(`/actualizar_actividadcol/${taskId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken.value
                    },
                    body: JSON.stringify({
                        status: newStatus,
                        elapsed_time: task.elapsed_time
                    })
                });

                if (response.ok) {
                    task.status = newStatus;
                    updateColumnDays();
                    showNotification(`Tarea movida a ${getStatusName(newStatus)}`, 'success');
                } else {
                    const result = await response.json();
                    showNotification(result.message || 'Error al actualizar estado', 'error');
                    loadTasks(selectedWorkerSearch.value || null);
                }
            } catch (error) {
                console.error('Error actualizando estado:', error);
                showNotification('Error al actualizar estado', 'error');
                loadTasks(selectedWorkerSearch.value || null);
            }
        };

        // Drag and drop handlers (simplificados)
        const handleDragStart = (event, task) => {
            event.dataTransfer.setData('text/plain', JSON.stringify({
                id: task.id,
                status: task.status
            }));
            event.dataTransfer.effectAllowed = 'move';
        };

        const handleDrop = (event, newStatus) => {
            event.preventDefault();

            try {
                const dragData = JSON.parse(event.dataTransfer.getData('text/plain'));
                const taskId = dragData.id;
                const currentStatus = dragData.status;

                if (currentStatus !== newStatus) {
                    updateTaskStatus(taskId, newStatus);
                }
            } catch (error) {
                console.error('Error en handleDrop:', error);
                showNotification('Error al mover la tarea', 'error');
            }
        };

        // Utility functions
        const getStatusName = (status) => {
            const statusNames = {
                todo: 'Por Hacer',
                doing: 'Haciendo',
                done: 'Hecho',
                approved: 'Aprobado'
            };
            return statusNames[status] || status;
        };

        const getTasksByStatus = (status) => {
            return tasks.value.filter(task => task.status === status);
        };

        const updateColumnDays = () => {
            columns.forEach(column => {
                column.days = getTasksByStatus(column.id)
                    .reduce((total, task) => total + (parseFloat(task.diasAsignados) || 0), 0);
            });
        };

        const getProjectName = (projectId) => {
            const project = proyectos.value.find(p => p.id_proyectos == projectId || p.id == projectId);
            return project ? (project.nombre_proyecto || project.name) : 'Sin proyecto';
        };

        const getWorkerName = (workerId) => {
            const worker = workers.value.find(w => w.id == workerId);
            return worker ? worker.name : 'Sin asignar';
        };

        // Búsqueda por trabajador mejorada
        const searchTasksByWorker = () => {
            const selectedWorkerId = selectedWorkerSearch.value;
            if (selectedWorkerId) {
                // Resetear searchDate al mes actual cuando se selecciona un trabajador
                searchDate.value = new Date();
                loadTasks(selectedWorkerId);
            } else {
                // Volver a cargar las tareas del usuario actual
                loadTasks();
            }
        };

        // Limpiar búsqueda
        const clearSearch = () => {
            selectedWorkerSearch.value = '';
            searchDate.value = new Date();
            currentDate.value = new Date();
            loadTasks();
        };

        // Report functionality
        const openReportModal = () => {
            showReportModal.value = true;
        };

        const submitReport = async () => {
            isLoadingReport.value = true;
            try {
                const response = await fetch('/exportar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken.value
                    },
                    body: JSON.stringify({
                        type: reportType.value,
                        description: reportDescription.value,
                        empresa_id: empresaId.value,
                        user_id: trabajadorId.value
                    })
                });

                if (response.ok) {
                    showReportModal.value = false;
                    reportDescription.value = '';
                    showNotification('Informe enviado exitosamente', 'success');
                } else {
                    showNotification('Error al enviar el informe', 'error');
                }
            } catch (error) {
                console.error('Error enviando informe:', error);
                showNotification('Error al enviar el informe', 'error');
            } finally {
                isLoadingReport.value = false;
            }
        };

        // Export IP functionality
        const exportIP = async () => {
            if (!personalReport.trabajador) {
                showNotification('Por favor selecciona un trabajador', 'warning');
                return;
            };

            isLoadingExport.value = true;

            try {
                const response = await fetch('/actividades-personal/exportar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': csrfToken.value
                    },
                    body: JSON.stringify({
                        user_id: personalReport.trabajador,  // 👈 debe llamarse user_id
                        month: personalReport.mes,           // 👈 debe llamarse month
                        empresaId: empresaId.value,          // 👈 debe llamarse empresaId
                        adelanto: personalReport.adelanto || 0,
                        permisos: personalReport.permisos || 0,
                        incMof: personalReport.incMof || 0,
                        bondtrab: personalReport.bondtrab || 0,
                        descuenttrab: personalReport.descuenttrab || 0,
                    })
                });

                if (!response.ok) {
                    throw new Error(`Error en la exportación: ${response.statusText}`);
                }

                const data = await response.json();
                console.log(data);
                // ✅ Extraemos datos con valores seguros por defecto
                const {
                    tareas = [],
                    tareasnoaprobados = [],
                    usuario = {},
                    extras = {},
                    idEmpresa = 1,
                    mes = personalReport.mes,
                    proyectos = []
                } = data;

                // ✅ Variables de extras
                const {
                    adelanto = 0,
                    permisos = 0,
                    incMof = 0,
                    bondtrab = 0,
                    descuenttrab = 0
                } = extras;

                const trabajador = [usuario]; // si esperas array

                // ✅ Armamos payload final para pasar a la función
                const payload = {
                    tareas,
                    tareasnoaprobados,
                    trabajador,
                    adelanto,
                    permisos,
                    incMof,
                    bondtrab,
                    descuenttrab,
                    proyectos,
                    id_empresa: parseInt(idEmpresa),
                    id_trabajador: parseInt(usuario.id || personalReport.trabajador),
                    Messelect: parseInt(mes)
                };

                console.log("✅ Exportación completada", payload);

                // ✅ Ahora pasamos bien las variables a la función
                informe_pago_personal(
                    payload.tareas,
                    payload.tareasnoaprobados,
                    payload.trabajador,
                    payload.adelanto,
                    payload.permisos,
                    payload.incMof,
                    payload.bondtrab,
                    payload.descuenttrab,
                    payload.proyectos,
                    payload.id_empresa,
                    payload.id_trabajador,
                    payload.Messelect
                );

            } catch (error) {
                console.error('❌ Error exportando IP:', error);
                showNotification('Error al exportar IP', 'error');
            } finally {
                isLoadingExport.value = false;
            }
        };

        // Initialize Select2
        const initializeSelect2 = () => {
            if (window.$ && window.$.fn.select2) {
                $('.select2').select2({
                    theme: 'default',
                    width: '100%'
                });
            }
        };

        const handleApproval = (taskId, isApproved) => {
            const task = tasks.value.find(t => t.id === taskId);
            if (!task || task.status !== 'done') return;

            const newStatus = isApproved ? 'approved' : 'todo';
            updateTaskStatus(taskId, newStatus);
        };

        // Notification system
        const showNotification = (message, type = 'info') => {
            const notification = document.createElement('div');
            notification.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;

            const typeClasses = {
                success: 'bg-green-500 text-white',
                error: 'bg-red-500 text-white',
                warning: 'bg-yellow-500 text-black',
                info: 'bg-blue-500 text-white'
            };

            notification.className += ` ${typeClasses[type] || typeClasses.info}`;
            notification.textContent = message;

            document.body.appendChild(notification);

            setTimeout(() => {
                notification.classList.remove('translate-x-full');
            }, 100);

            setTimeout(() => {
                notification.classList.add('translate-x-full');
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }, 5000);
        };

        // ======================= LIFECYCLE =======================
        onMounted(async () => {
            initializeConfig();

            if (empresaId.value) {
                await loadWorkers();
                await loadProyectos();
                await loadTasks();

                // Configurar listener para cambio de trabajador
                await nextTick();
                const workerSelect = document.getElementById('search-task-assigned-to');
                if (workerSelect) {
                    workerSelect.addEventListener('change', (event) => {
                        selectedWorkerSearch.value = event.target.value;
                        searchTasksByWorker();
                    });
                }
            } else {
                console.warn('empresaId no está disponible');
            }
        });

        onUnmounted(() => {
            // Limpiar interval al desmontar el componente
            if (dailyCheckInterval) {
                clearInterval(dailyCheckInterval);
            }
        });

        // ======================= RETURN =======================
        return {
            // State
            showTaskPanel,
            showReportModal,
            showEditModal,
            showPersonalModal,
            isLoadingTasks,
            isLoadingTask,
            isLoadingReport,
            isLoadingEdit,
            isLoadingExport,

            // Form data
            reportType,
            reportDescription,
            newTask,
            editingTask,
            selectedWorkerSearch,
            personalReport,

            // Configuration
            canManageTasks,
            permisosUser,

            // Data
            tasks,
            workers,
            proyectos,
            columns,
            meses,

            // Computed
            currentMonthYear,
            searchMonthYear,

            // Methods
            toggleTaskPanel,
            previousMonth,
            nextMonth,
            handleAddTask,
            openEditModal,
            handleEditTask,
            deleteTask,
            handleDragStart,
            handleDrop,
            getTasksByStatus,
            getProjectName,
            getWorkerName,
            searchTasksByWorker,
            clearSearch,
            openReportModal,
            submitReport,
            exportIP,
            handleApproval
        };
    }
});

// Function to format the date
function formatearFecha(fecha) {
    const opcionesFecha = {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    };
    const opcionesHora = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };

    const parteFecha = fecha.toLocaleDateString('es-ES', opcionesFecha);
    const parteHora = fecha.toLocaleTimeString('es-ES', opcionesHora);

    return `${parteFecha.toUpperCase()} Hora: ${parteHora}`;
}

// Placeholder for proyecto_efectuadoIP (adjust based on your requirements)
function proyecto_efectuadoIP(dataIP) {
    // Example implementation: Map tasks to project data
    const proyectos = dataIP.map(tarea => {
        return [
            tarea.titulo || "Proyecto Desconocido",
            tarea.fecha || "N/A",
            tarea.fecha || "N/A",
            tarea.diasAsignados || "0",
            tarea.status || "N/A"
        ];
    });
    // Add a total row if needed
    proyectos.push(["TOTAL", "", "", dataIP.reduce((sum, tarea) => sum + parseFloat(tarea.diasAsignados || 0), 0), ""]);
    return proyectos;
}

// Placeholder for descuentosBonificacion (adjust based on your requirements)
function descuentosBonificacion(dataIP, sueldoPIP, Messelect, conteoDiasNA, extras = {}) {
    let totalDescuento = 0;
    let totalBonificacion = 0;

    if (!sueldoPIP || sueldoPIP <= 0) {
        console.error("Error: sueldoPIP no está definido o es inválido.");
        return [];
    }

    // Calcular descuentos/bonificaciones por tareas
    dataIP.forEach(tarea => {
        const porcentajeAvance = tarea.procentaje_trabajador ? tarea.procentaje_trabajador / 100 : 0;

        if (porcentajeAvance <= 0.1) totalDescuento += 1;
        else if (porcentajeAvance <= 0.25) totalDescuento += 0.75;
        else if (porcentajeAvance <= 0.50) totalDescuento += 0.50;
        else if (porcentajeAvance <= 0.75) totalDescuento += 0.25;
        else if (porcentajeAvance <= 0.97) totalDescuento += 0.10;
        else if (porcentajeAvance < 0.98) totalDescuento += 0;

        if (porcentajeAvance > 0.98) {
            totalBonificacion += porcentajeAvance;
        }
    });

    // Calcular sueldo diario
    const fechaActual = new Date();
    const year = fechaActual.getFullYear();
    const diasLaborablesMes = obtenerDiasLaborables(year, Messelect);
    const sueldoDiario = sueldoPIP / diasLaborablesMes;

    // Incumplimiento
    const incumplimiento = (conteoDiasNA * sueldoDiario).toFixed(2);

    // ✅ Usamos extras desde Vue (en lugar de DOM)
    const {
        adelanto = 0,
        permisos = 0,
        incMof = 0,
        bondtrab = 0,
        descuenttrab = 0
    } = extras;

    // Calcular montos
    const totaladelanto = (sueldoDiario * adelanto).toFixed(2);
    const totalPermisos = (sueldoDiario * permisos).toFixed(2);
    const totalIncMof = (sueldoDiario * incMof).toFixed(2);
    const totalDescuentos = (sueldoDiario * descuenttrab).toFixed(2);
    const totalBonos = (sueldoDiario * bondtrab).toFixed(2);

    const totalDescuentoMonetario = (
        parseFloat(totalDescuentos) +
        parseFloat(totaladelanto) +
        parseFloat(totalPermisos) +
        parseFloat(totalIncMof)
    ).toFixed(2);

    const totalDiasDescuento = adelanto + permisos + incMof + descuenttrab;

    const bonificacionMonto = totalBonificacion * sueldoDiario;

    // Armar filas para tabla
    const filas = [
        ["PERMISOS", permisos, totalPermisos],
        ["ADELANTO", adelanto, totaladelanto],
        ["INCUMPLIMIENTO DEL LAB", conteoDiasNA, incumplimiento],
        ["INCUMPLIMIENTO DEL MOF (2 HORAS)", incMof, totalIncMof],
        ["DESCUENTO", descuenttrab, totalDescuentos],
        ["TOTAL DE DESCUENTO", totalDiasDescuento, totalDescuentoMonetario],
        ["BONIFICACIÓN", bondtrab, totalBonos],
        ["TOTAL DE BONIFICACIÓN", bondtrab, totalBonos]
    ];

    return filas;
}

// Placeholder for calcularSueldoDescuentos (adjust based on your requirements)
function calcularSueldoDescuentos(totalDiasTrabajados, sueldoPIP, Messelect) {
    // Example: Calculate net salary based on days worked
    const diasLaborables = obtenerDiasLaborables(26);
    const sueldoDiario = sueldoPIP / diasLaborables;
    return (sueldoDiario * totalDiasTrabajados).toFixed(2);
}

// Placeholder for obtenerDiasLaborables (adjust based on your requirements)
function obtenerDiasLaborables(year, month) {
    // Example: Return number of working days in the month
    const date = new Date(year, month - 1, 1);
    let diasLaborables = 26;
    //const ultimoDia = new Date(year, month, 0).getDate();
    //for (let i = 1; i <= ultimoDia; i++) {
    //date.setDate(i);
    //if (date.getDay() !== 0 && date.getDay() !== 6) {
    //diasLaborables++;
    //}
    //}
    return diasLaborables;
}

// Main function to generate the PDF
function informe_pago_personal(tareas, tareasnoaprobados, trabajador, adelantos, permisos, incMof, bondtrab, descuenttrab, proyectos, id_empresa, id_trabajador, Messelect) {
    const trabajadorEncontrado = trabajador.find(t => t.id == id_trabajador);
    let trabajadorDatos = "";
    if (trabajadorEncontrado) {
        trabajadorDatos = {
            name: trabajadorEncontrado.nombre,
            surname: trabajadorEncontrado.apellido,
            dni_user: trabajadorEncontrado.dni,
            sueldo_base: trabajadorEncontrado.sueldo_base,
            area_laboral: trabajadorEncontrado.area_laboral,
        };
    } else {
        console.log("No se encontró el trabajador con el ID proporcionado.");
        return;
    }

    const dataIP = tareas.map(tarea => {
        const nombreTrabajador = trabajadorDatos && trabajadorDatos.name && trabajadorDatos.surname
            ? `${trabajadorDatos.name} ${trabajadorDatos.surname}`
            : "Trabajador no especificado";

        return {
            ...tarea,
            nombre_proyecto: tarea.titulo || (tarea.proyecto && tarea.proyecto.nombre_proyecto) || "Proyecto no encontrado",
            nombre_trabajador: nombreTrabajador
        };
    });

    const conteoDiasNA = tareasnoaprobados.reduce((total, tarea) => {
        const dias = parseFloat(tarea.diasAsignados); // Convertir a número
        return total + (isNaN(dias) ? 0 : dias); // Sumar, ignorando valores no numéricos
    }, 0);

    let nombre_empresa = '';
    switch (id_empresa) {
        case 1:
            nombre_empresa = "Rizabal & Asociados ING. estruc";
            break;
        case 2:
            nombre_empresa = "CONTRUYEHCO";
            break;
        case 3:
            nombre_empresa = "SEVEN HEART";
            break;
        case 4:
            nombre_empresa = "DML arquitectos";
            break;
        case 5:
            nombre_empresa = "HYPERIUM";
            break;
        default:
            nombre_empresa = "Empresa no reconocida";
    }

    const nombres = (trabajadorDatos.name + ' ' + trabajadorDatos.surname).split(' ');
    let iniciales = '';
    nombres.forEach(nombre => {
        iniciales += nombre.charAt(0);
    });

    const pdf_IP = new window.jspdf.jsPDF();
    const date = new Date();
    const anioactual = date.getFullYear();
    const fechaFormateada = formatearFecha(date);
    const mesActual = new Intl.DateTimeFormat('es', { month: 'long' }).format(date).toUpperCase();
    const primerDiaMes = new Date(anioactual, date.getMonth(), 1);
    const inicioMes = primerDiaMes.toLocaleDateString('es', { day: '2-digit', month: 'long' });
    const ultimoDiaMes = new Date(anioactual, date.getMonth() + 1, 0);
    const finMes = ultimoDiaMes.toLocaleDateString('es', { day: '2-digit', month: 'long' });

    let nombre_mes;
    switch (parseInt(Messelect)) {
        case 1:
            nombre_mes = "ENERO";
            break;
        case 2:
            nombre_mes = "FEBRERO";
            break;
        case 3:
            nombre_mes = "MARZO";
            break;
        case 4:
            nombre_mes = "ABRIL";
            break;
        case 5:
            nombre_mes = "MAYO";
            break;
        case 6:
            nombre_mes = "JUNIO";
            break;
        case 7:
            nombre_mes = "JULIO";
            break;
        case 8:
            nombre_mes = "AGOSTO";
            break;
        case 9:
            nombre_mes = "SEPTIEMBRE";
            break;
        case 10:
            nombre_mes = "OCTUBRE";
            break;
        case 11:
            nombre_mes = "NOVIEMBRE";
            break;
        case 12:
            nombre_mes = "DICIEMBRE";
            break;
        default:
            nombre_mes = "MES INVÁLIDO";
    }

    let rol = '';
    if (['JOSE EDUARDO', 'LUIS DANIEL', 'EMERSON MESIAS'].includes(trabajadorDatos.name)) {
        rol = 'Jefe de Área';
    } else {
        rol = 'Asistente';
    }

    pdf_IP.setFontSize(11);
    pdf_IP.setFont("Arial", "bold"); // Use Arial instead of Arial Narrow
    pdf_IP.text("INFORME N°" + ("00" + Messelect).slice(-2) + "-" + anioactual + "/" + nombre_empresa + "-" + iniciales, 20, 20);
    pdf_IP.setFont("Arial", "bold");
    pdf_IP.setFontSize(10);
    pdf_IP.text("SEÑOR(A): ", 20, 30);
    pdf_IP.setFont("Arial", "normal");
    pdf_IP.text("Andrea Alexandra Paredes Sánchez", 40, 30);
    pdf_IP.setFont("Arial", "bold");
    pdf_IP.text("Administradora", 40, 35);
    pdf_IP.setFont("Arial", "bold");
    pdf_IP.text("DE: ", 20, 40);
    pdf_IP.setFont("Arial", "normal");
    pdf_IP.text((trabajadorDatos.name + ' ' + trabajadorDatos.surname), 40, 40);
    pdf_IP.setFont("Arial", "bold");
    pdf_IP.setFontSize(10);
    pdf_IP.text(rol, 40, 45);
    pdf_IP.setFont("Arial", "bold");
    pdf_IP.text("ASUNTO:", 20, 50);
    pdf_IP.setFont("Arial", "normal");
    pdf_IP.text("INFORME DE PAGO DEL MES DE " + nombre_mes + " del " + anioactual, 40, 50);
    pdf_IP.setFont("Arial", "bold");
    pdf_IP.text("FECHA:", 20, 55);
    pdf_IP.setFont("Arial", "normal");
    pdf_IP.text("HUANUCO, " + fechaFormateada, 40, 55);

    let imagenEmpresa = '';
    switch (id_empresa) {
        case 1:
            imagenEmpresa = "{{ asset('storage/avatar_empresa/logo_rizabal.png') }}";
            break;
        case 2:
            imagenEmpresa = "{{ asset('storage/avatar_empresa/logo_contruyehco.png') }}";
            break;
        case 3:
            imagenEmpresa = "{{ asset('storage/avatar_empresa/logo_sevenheart.png') }}";
            break;
        case 4:
            imagenEmpresa = "{{ asset('storage/avatar_empresa/logo_dml.png') }}";
            break;
        case 5:
            imagenEmpresa = "{{ asset('storage/avatar_empresa/logo_hyperium.png') }}";
            break;
        default:
            imagenEmpresa = "{{ asset('storage/avatar_empresa/logo_default.png') }}";
    }

    let tipoGerencia = '';
    if (id_empresa == 1) {
        tipoGerencia = "Área Campo";
    } else if (id_empresa == 2) {
        tipoGerencia = "ÁREA OFICINA TECNICA";
    } else if (id_empresa == 3) {
        tipoGerencia = "Área de Obras";
    } else if (id_empresa == 4) {
        tipoGerencia = "Área Arquitectura";
    } else if (id_empresa == 5) {
        tipoGerencia = "Área de Informatica";
    } else if (id_empresa == 6) {
        tipoGerencia = "Área de Obras";
    }

    // Note: Image loading requires actual image URLs or base64 data
    // pdf_IP.addImage(imagenEmpresa, "JPEG", 125, -5, 80, 50); // Uncomment when images are available
    pdf_IP.setFontSize(9);
    pdf_IP.text("Por medio de la presente me es grato dirigirme a Ud. Cordialmente y felicitarlo por la acertada labor que viene desempeñando, así mismo", 20, 65);
    pdf_IP.text("entrego a su despacho el informe de avance del personal, para ello se detalla a continuación:", 20, 70);
    var sueldoPIP = parseFloat(trabajadorDatos.sueldo_base);
    pdf_IP.autoTable({
        head: [["PROYECTOS EFECTUADOS", "INICIO DE PROYECTO", "FIN DE PROYECTO", "DIAS", "CIERRE"]],
        body: proyecto_efectuadoIP(dataIP),
        startY: 85,
        styles: {
            fontSize: 8,
            valign: 'middle',
            halign: 'center',
            lineWidth: 0.1,
        },
        theme: 'plain',
    });

    const descuentosBonificacionData = descuentosBonificacion(dataIP, sueldoPIP, Messelect, conteoDiasNA);
    pdf_IP.autoTable({
        head: [["DESCUENTOS Y BONIFICACIONES", "CANT.", "MONTO"]],
        body: descuentosBonificacionData,
        startY: pdf_IP.autoTable.previous.finalY + 10,
        styles: {
            fontSize: 8,
            valign: 'middle',
            halign: 'left',
            lineWidth: 0.1,
        },
        theme: 'plain',
        didParseCell: (data) => {
            if (data.row.index === descuentosBonificacionData.findIndex(row => row[0] === "TOTAL DE DESCUENTO")) {
                data.cell.styles.fontStyle = 'bold';
            }
            if (data.row.index === descuentosBonificacionData.length - 1) {
                data.cell.styles.fontStyle = 'bold';
            }
        },
    });

    const dataProyectos = proyecto_efectuadoIP(dataIP);
    const dataDescuentos = descuentosBonificacion(dataIP, sueldoPIP, Messelect);
    let totalDiasTrabajados = 0;
    for (let i = 0; i < dataProyectos.length - 1; i++) {
        totalDiasTrabajados += parseFloat(dataProyectos[i][3]);
    }

    const year = new Date().getFullYear();
    const diasLaborablesMes = obtenerDiasLaborables(year, parseInt(Messelect));
    if (totalDiasTrabajados >= 24.90 && totalDiasTrabajados <= diasLaborablesMes) {
        totalDiasTrabajados = diasLaborablesMes;
    }

    const totalDescuentoSoles = parseFloat(dataDescuentos[5][2]);
    const totalbonosSoles = parseFloat(dataDescuentos[6][2]);
    const sueldoNeto = calcularSueldoDescuentos(totalDiasTrabajados, sueldoPIP, Messelect);
    const SaltoDescontado = parseFloat(sueldoNeto) + totalbonosSoles - totalDescuentoSoles;

    pdf_IP.setFont("Arial", "bold");
    pdf_IP.setFontSize(11);
    pdf_IP.text("MONTO TOTAL DE PAGO: ", 20, pdf_IP.autoTable.previous.finalY + 20);
    pdf_IP.setFont("Arial", "normal");
    pdf_IP.text("S/.: " + SaltoDescontado.toFixed(2), 75, pdf_IP.autoTable.previous.finalY + 20);

    let posY = pdf_IP.autoTable.previous.finalY + 30;
    pdf_IP.setFont("Arial", "bold");
    pdf_IP.text("DNI:", 20, posY + 5);
    pdf_IP.setFont("Arial", "normal");
    pdf_IP.text(String(trabajadorDatos.dni_user), 30, posY + 5);

    pdf_IP.setFont("Arial", "bold");
    pdf_IP.text("ANEXOS:", 20, posY + 10);
    pdf_IP.setFont("Arial", "normal");
    pdf_IP.text("LAP mensual, Recibo por Honorarios.", 40, posY + 15);

    pdf_IP.setFontSize(9);
    pdf_IP.setFont("Arial", "normal");
    pdf_IP.text("Sin otro particular aprovecho la oportunidad para reiterarle las muestras de mi", 30, posY + 25);
    pdf_IP.text("especial consideración y estima personal.", 20, posY + 30);
    pdf_IP.text("Atentamente", 20, posY + 35);

    // // Option 1: Display PDF in an embed element
    // const string = pdf_IP.output('datauristring');
    // const embedElement = document.createElement('embed');
    // embedElement.setAttribute('width', '100%');
    // embedElement.setAttribute('height', '100%');
    // embedElement.setAttribute('src', string);
    // const divMostrarInformePago = document.getElementById('mostrarInformePago');
    // divMostrarInformePago.innerHTML = '';
    // divMostrarInformePago.appendChild(embedElement);

    // Option 2: Download the PDF
    pdf_IP.save(`Informe_Pago_${trabajadorDatos.name}_${nombre_mes}_${anioactual}.pdf`);
}

// Mount the app
app.mount('#app');