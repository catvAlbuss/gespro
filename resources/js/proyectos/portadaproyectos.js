import { createApp, ref, onMounted, computed, reactive, nextTick } from 'vue';

// Obtener datos de configuración inicial
const { empresaId, trabajadorId, csrfToken, proyectos, routes, canManageTasks, permisosUser } = window.APP_INIT || {};

const app = createApp({
    setup() {
        // ======================= REACTIVE DATA =======================
        const proyectosList = ref(proyectos || []);
        const searchQuery = ref('');
        const isEditing = ref(false);
        const currentProyecto = ref(null);
        const dataTable = ref(null);
        const isLoading = ref(false);
        const showForm = ref(false);
        const errors = ref({});

        const especialidades = ref([
            { id: 'arquitectura', name: 'Arquitectura', icon: '🏗️' },        // construcción
            { id: 'estructuras', name: 'Estructuras', icon: '🏛️' },         // columnas / solidez
            { id: 'electrica', name: 'Eléctrica', icon: '⚡' },              // electricidad
            { id: 'sanitaria', name: 'Sanitaria', icon: '🚰' },              // grifo/agua
            { id: 'gas', name: 'Gas', icon: '🔥' },                         // fuego
            { id: 'comunicaciones', name: 'Comunicaciones', icon: '📡' },   // antena
            { id: 'electromecanica', name: 'Electromecánica', icon: '⚙️' }, // engranaje
            { id: 'topografia', name: 'Topografía', icon: '📐' },           // instrumento de medida
            { id: 'contingencia', name: 'Contingencia', icon: '🚨' },       // alarma/emergencia
            { id: 'demolicion', name: 'Demolición', icon: '🧨' },           // dinamita/explosivo
            { id: 'estudiosuelo', name: 'Estudio de Suelos', icon: '🪨' },  // roca
            { id: 'costopresupuestp', name: 'Costos y Presupuestos', icon: '💰' }, // dinero
            { id: 'campo', name: 'CAMPO', icon: '💰' }, // campo
            { id: 'procesos', name: 'PROCESOS', icon: '💰' }, // procesos
            { id: 'administracion', name: 'Administración', icon: '💰' }, // administracion
            { id: 'administracioncontratos', name: 'Administración de Contratos', icon: '💰' }, // administracion de contratos
            { id: 'sistemas', name: 'Sistemas', icon: '💰' }, // sistemas 
        ]);

        // Formulario reactivo
        const form = reactive({
            nombre_proyecto: '',
            cantidad_modulos: 1,   // ✅ corregido
            monto_designado: 0.00,   // ✅ corregido
            descripcion_proyecto: 'proyectos',
            tipoproyecto: 'oficina',
            documento_proyecto: {}, // ✅ mejor inicializar como objeto
            especialidades: [],
            // Array de objetos { id: 'arquitectura', porcentaje: 8.33 }
            especialidades_porcentaje: [],
            empresa_id: empresaId
        });

        // ======================= COMPUTED PROPERTIES =======================
        const filteredProyectos = computed(() => {
            if (!searchQuery.value) {
                return proyectosList.value;
            }
            return proyectosList.value.filter(proyecto =>
                proyecto.nombre_proyecto.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                proyecto.tipoproyecto.toLowerCase().includes(searchQuery.value.toLowerCase())
            );
        });

        const formTitle = computed(() => {
            return isEditing.value ? 'Editar Proyecto' : 'Crear Nuevo Proyecto';
        });

        const submitButtonText = computed(() => {
            return isEditing.value ? 'Actualizar Proyecto' : 'Crear Proyecto';
        });

        // ======================= VALIDATION =======================
        const validateForm = () => {
            const newErrors = {};

            if (!form.nombre_proyecto.trim()) {
                newErrors.nombre_proyecto = 'El nombre del proyecto es requerido';
            }

            if (form.cantidad_modulos < 1 || form.cantidad_modulos > 100) {
                newErrors.cantidad_modulos = 'La cantidad de módulos debe estar entre 1 y 100';
            }

            if (!Array.isArray(form.especialidades) || form.especialidades.length === 0) {
                newErrors.especialidades = 'Selecciona al menos una especialidad';
            }

            // ✅ Validación de monto_designado
            if (
                form.monto_designado === null ||
                form.monto_designado === undefined ||
                isNaN(form.monto_designado) ||
                form.monto_designado <= 0
            ) {
                newErrors.monto_designado = 'Ingresa un monto económico válido mayor a 0';
            }

            errors.value = newErrors;
            return Object.keys(newErrors).length === 0;
        };

        // ======================= METHODS =======================
        const toggleForm = () => {
            showForm.value = !showForm.value;
            if (!showForm.value) {
                resetForm();
            }
        };

        const resetForm = () => {
            form.nombre_proyecto = '';
            form.cantidad_modulos = 1;
            form.descripcion_proyecto = '';
            form.tipoproyecto = 'oficina';
            form.documento_proyecto = [];
            form.especialidades = [];
            form.empresa_id = empresaId;
            isEditing.value = false;
            currentProyecto.value = null;
            errors.value = {};
            showForm.value = false;
        };

        const editProyecto = (proyecto) => {
            isEditing.value = true;
            currentProyecto.value = proyecto;
            showForm.value = true;

            form.nombre_proyecto = proyecto.nombre_proyecto;
            form.cantidad_modulos = proyecto.cantidad_modulos || 1;
            form.descripcion_proyecto = proyecto.descripcion_proyecto || '';
            form.tipoproyecto = proyecto.tipoproyecto;
            // proyecto.especialidades puede venir como array de ids o como array de objetos con porcentaje
            if (Array.isArray(proyecto.especialidades) && proyecto.especialidades.length > 0 && typeof proyecto.especialidades[0] === 'object') {
                // ya contiene porcentajes
                form.especialidades_porcentaje = proyecto.especialidades.map(e => ({ id: e.id, porcentaje: Number(e.porcentaje) }));
                form.especialidades = proyecto.especialidades.map(e => e.id);
            } else {
                form.especialidades = proyecto.especialidades || [];
                // recalcular porcentajes automáticamente según lo seleccionado
                recalcularPorcentajes();
            }
            form.empresa_id = proyecto.empresa_id;

            // Scroll to form
            nextTick(() => {
                document.getElementById('project-form').scrollIntoView({ behavior: 'smooth' });
            });
        };

        // Recalcula y asigna porcentajes a las especialidades seleccionadas
        const recalcularPorcentajes = () => {
            const seleccionadas = Array.isArray(form.especialidades) ? form.especialidades.slice() : [];
            const n = seleccionadas.length;
            form.especialidades_porcentaje = [];
            if (n === 0) return;

            // Base con dos decimales
            const base = parseFloat((100 / n).toFixed(2));
            for (let i = 0; i < n; i++) {
                form.especialidades_porcentaje.push({ id: seleccionadas[i], porcentaje: base });
            }

            // Ajuste para que la suma sea exactamente 100 (pequeñas correcciones por redondeo)
            const total = form.especialidades_porcentaje.reduce((s, e) => s + e.porcentaje, 0);
            const diff = parseFloat((100 - total).toFixed(2));
            if (Math.abs(diff) >= 0.01) {
                const last = form.especialidades_porcentaje[form.especialidades_porcentaje.length - 1];
                last.porcentaje = parseFloat((last.porcentaje + diff).toFixed(2));
            }
        };

        const getPorcentaje = (id) => {
            const found = form.especialidades_porcentaje.find(e => e.id === id);
            return found ? found.porcentaje : 0;
        };

        const submitForm = async () => {
            if (!validateForm()) {
                return;
            }

            isLoading.value = true;

            try {
                const url = isEditing.value
                    ? routes.update.replace(':id', currentProyecto.value.id_proyectos)
                    : routes.store;

                const formData = new FormData();
                formData.append('_token', csrfToken);
                if (isEditing.value) {
                    formData.append('_method', 'PUT');
                }

                // Construir payload
                const payload = {
                    ...form,
                    documento_proyecto: JSON.stringify(form.documento_proyecto || {}), // siempre JSON válido

                    // Guardar ids simples (si necesitas en 'especialidades')
                    especialidades: JSON.stringify(
                        (form.especialidades || []).map(id => id)
                    ),

                    // Guardar array con id + porcentaje en la nueva columna
                    especialidades_porcentaje: JSON.stringify(
                        form.especialidades_porcentaje && form.especialidades_porcentaje.length > 0
                            ? form.especialidades_porcentaje
                            : (form.especialidades || []).map(id => ({
                                id,
                                porcentaje: parseFloat((100 / (form.especialidades.length || 1)).toFixed(2))
                            }))
                    ),
                };


                // 🚨 Mostrar en consola antes de enviar
                console.log("📤 Datos a enviar (payload):", payload);

                //Añadir al FormData
                Object.keys(payload).forEach(key => {
                    formData.append(key, payload[key]);
                });

                const response = await fetch(url, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    }
                });

                if (response.ok) {
                    showSuccessMessage(isEditing.value ? 'Proyecto actualizado correctamente' : 'Proyecto creado correctamente');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    const errorData = await response.json();
                    console.error("❌ Errores de validación Laravel:", errorData);
                    throw new Error(errorData.message || 'Error en la respuesta del servidor');
                }
            } catch (error) {
                console.error('Error:', error);
                showErrorMessage('Error al guardar el proyecto: ' + error.message);
            } finally {
                isLoading.value = false;
            }
        };

        const deleteProyecto = async (proyecto) => {
            if (!confirm(`¿Estás seguro de que deseas eliminar el proyecto "${proyecto.nombre_proyecto}"?`)) {
                return;
            }

            isLoading.value = true;

            try {
                const url = routes.destroy.replace(':id', proyecto.id_proyectos);

                const formData = new FormData();
                formData.append('_token', csrfToken);
                formData.append('_method', 'DELETE');

                const response = await fetch(url, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    }
                });

                if (response.ok) {
                    showSuccessMessage('Proyecto eliminado correctamente');
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    throw new Error('Error en la respuesta del servidor');
                }
            } catch (error) {
                console.error('Error:', error);
                showErrorMessage('Error al eliminar el proyecto');
            } finally {
                isLoading.value = false;
            }
        };

        const openProyecto = (proyecto) => {
            const url = routes.redirect
                .replace(':id', proyecto.id_proyectos)
                .replace(':empresa_id', proyecto.empresa_id);
            window.open(url, '_blank');
        };

        const getProgressColor = (porcentaje) => {
            if (porcentaje >= 80) return 'bg-green-500';
            if (porcentaje >= 60) return 'bg-blue-500';
            if (porcentaje >= 40) return 'bg-yellow-500';
            if (porcentaje >= 20) return 'bg-orange-500';
            return 'bg-red-500';
        };

        const getProgressTextColor = (porcentaje) => {
            return porcentaje < 40 ? 'text-white' : 'text-white';
        };

        const showSuccessMessage = (message) => {
            // Implementar notificación de éxito
            alert(message); // Reemplazar por una librería de notificaciones
        };

        const showErrorMessage = (message) => {
            // Implementar notificación de error
            alert(message); // Reemplazar por una librería de notificaciones
        };

        const initDataTable = () => {
            nextTick(() => {
                if (window.$ && window.$.fn.DataTable) {
                    // Destruir tabla existente si existe
                    if (dataTable.value) {
                        dataTable.value.destroy();
                    }

                    if (!$.fn.DataTable.isDataTable('#proyectosTable')) {
                        dataTable.value = window.$('#proyectosTable').DataTable({
                            responsive: true,
                            pagingType: 'simple_numbers',
                            pageLength: 10,
                            lengthMenu: [5, 10, 25, 50],
                            language: {
                                url: 'https://cdn.datatables.net/plug-ins/2.1.8/i18n/es-MX.json',
                                search: 'Buscar:',
                                lengthMenu: 'Mostrar _MENU_ proyectos',
                                info: 'Mostrando _START_ a _END_ de _TOTAL_ proyectos',
                                infoEmpty: 'Mostrando 0 a 0 de 0 proyectos',
                                infoFiltered: '(filtrado de _MAX_ proyectos totales)',
                                paginate: {
                                    first: 'Primero',
                                    last: 'Último',
                                    next: 'Siguiente',
                                    previous: 'Anterior'
                                }
                            },
                            columnDefs: [
                                {
                                    targets: 0, // columna #
                                    orderable: false,
                                    searchable: false,
                                    render: function (data, type, row, meta) {
                                        return meta.row + 1 + meta.settings._iDisplayStart;
                                    }
                                },
                                { targets: [3, 4, 5], orderable: false, searchable: false }, // Botones
                                { targets: '_all', className: 'text-center' }
                            ],
                            order: [[1, 'asc']]
                        });

                        // 🔥 Recalcular numeración cada vez que se dibuje la tabla
                        dataTable.value.on('draw.dt', function () {
                            dataTable.value
                                .column(0, { search: 'applied', order: 'applied' })
                                .nodes()
                                .each((cell, i) => {
                                    cell.innerHTML = i + 1 + dataTable.value.page.info().start;
                                });
                        });
                    }
                }
            });
        };

        // ======================= LIFECYCLE =======================
        onMounted(() => {
            setTimeout(() => {
                initDataTable();
            }, 200);
        });

        // ======================= RETURN =======================
        return {
            // Data
            proyectosList,
            searchQuery,
            form,
            isEditing,
            currentProyecto,
            isLoading,
            showForm,
            errors,
            routes,

            // Computed
            filteredProyectos,
            formTitle,
            submitButtonText,
            especialidades,

            // Methods
            toggleForm,
            resetForm,
            editProyecto,
            submitForm,
            deleteProyecto,
            openProyecto,
            getProgressColor,
            getProgressTextColor,
            validateForm,
            recalcularPorcentajes,
            getPorcentaje,

            // Config
            canManageTasks,
            permisosUser
        };
    },

    template: `
        <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div class="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                
                <!-- Header -->
                <div class="mb-8">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                                Gestión de Proyectos
                            </h1>
                            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Administra y organiza todos tus proyectos de construcción
                            </p>
                        </div>
                        <div class="mt-4 sm:mt-0 mr-2 flex items-center space-x-3">
                            <button 
                                @click="toggleForm"
                                :class="[
                                    'inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-200',
                                    showForm 
                                        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                                        : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                                ]">
                                <span v-if="!showForm" class="mr-2">➕</span>
                                <span v-else class="mr-2">❌</span>
                                {{ showForm ? 'Cancelar' : 'Nuevo Proyecto' }}
                            </button>

                            <a :href="routes.reportes"
                                class="inline-flex items-center px-5 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 
                                        hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 
                                        shadow-md transition-all duration-200 ease-in-out transform hover:scale-105">
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" stroke-width="2"
                                    viewBox="0 0 24 24" aria-hidden="true">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M9 17v-2h6v2m2 4H7a2 2 0 01-2-2V5a2 2 
                                            0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
                                </svg>
                                Reportes Proyectos
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Loading Overlay -->
                <div v-if="isLoading" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center space-x-3">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <span class="text-gray-900 dark:text-white font-medium">Procesando...</span>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    <!-- Formulario - Sidebar -->
                    <div v-show="showForm" id="project-form" class="lg:col-span-12">
                        <div class="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
                            <div class="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                                <h3 class="text-xl font-semibold text-white flex items-center">
                                    <span class="mr-2">{{ isEditing ? '✏️' : '➕' }}</span>
                                    {{ formTitle }}
                                </h3>
                            </div>

                            <form @submit.prevent="submitForm" class="p-6 space-y-2">
                                <div class="grid grid-cols-3 gap-4">
                                    <!-- Nombre Proyecto -->
                                    <div>
                                        <label for="nombre_proyecto" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <span class="flex items-center">
                                                📝 Nombre del Proyecto
                                                <span class="text-red-500 ml-1">*</span>
                                            </span>
                                        </label>
                                        <input 
                                            type="text" 
                                            id="nombre_proyecto"
                                            v-model="form.nombre_proyecto"
                                            :class="[
                                                'block w-full px-4 py-3 border text-gray-950 dark:text-gray-50 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
                                                errors.nombre_proyecto 
                                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                                                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                                            ]"
                                            placeholder="Ej: Edificio Corporativo ABC"
                                            required />
                                        <p v-if="errors.nombre_proyecto" class="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {{ errors.nombre_proyecto }}
                                        </p>
                                    </div>

                                    <!-- Número de Módulos -->
                                    <div>
                                        <label for="cantidad_modulo" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <span class="flex items-center">
                                                📊 Número de Módulos
                                                <span class="text-red-500 ml-1">*</span>
                                            </span>
                                        </label>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            max="100"
                                            id="cantidad_modulos"
                                            v-model="form.cantidad_modulos"
                                            :class="[
                                                'block w-full px-4 py-3 text-gray-950 dark:text-gray-50 border rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
                                                errors.cantidad_modulos 
                                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                                                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                                            ]"
                                            required />
                                        <p v-if="errors.cantidad_modulos" class="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {{ errors.cantidad_modulos }}
                                        </p>
                                    </div>

                                    <!-- MONTO DESIGNADO -->
                                    <div>
                                        <label for="cantidad_modulo" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            <span class="flex items-center">
                                                📊 Monto Designado
                                                <span class="text-red-500 ml-1">*</span>
                                            </span>
                                        </label>
                                        <input 
                                            type="number"
                                            id="monto_designado"
                                            step="0.01"
                                            min="0"
                                            inputmode="decimal"
                                            v-model.number="form.monto_designado"
                                            :class="[
                                                'block w-full px-4 py-3 text-gray-950 dark:text-gray-50 border rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
                                                errors.monto_designado 
                                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                                                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
                                            ]"
                                            required
                                        />
                                        <p v-if="errors.monto_designado" class="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {{ errors.monto_designado }}
                                        </p>
                                    </div>

                                    <!-- Especialidades -->
                                    <div class="col-span-3">
                                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                            <span class="flex items-center">
                                                🔧 Especialidades
                                                <span class="text-red-500 ml-1">*</span>
                                            </span>
                                        </label>
                                        <div class="grid grid-cols-4 gap-3">
                                            <div v-for="esp in especialidades" :key="esp.id" 
                                                class="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                                                <input 
                                                    type="checkbox"
                                                    :id="'esp-' + esp.id"
                                                    :value="esp.id"
                                                    v-model="form.especialidades"
                                                    @change="recalcularPorcentajes"
                                                    class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/>
                                                <label :for="'esp-' + esp.id" class="ml-3 text-sm text-gray-700 dark:text-gray-300 flex items-center cursor-pointer flex-1">
                                                    <span class="mr-2">{{ esp.icon }}</span>
                                                    <div class="flex items-center justify-between w-full">
                                                        <span>{{ esp.name }}</span>
                                                        <span class="ml-2 text-xs text-gray-500 dark:text-gray-400">{{ getPorcentaje(esp.id) }}%</span>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>
                                        <p v-if="errors.especialidades" class="mt-1 text-sm text-red-600 dark:text-red-400">
                                            {{ errors.especialidades }}
                                        </p>
                                    </div>
                                </div>
                                <!-- Botones -->
                                <div class="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                                    <button 
                                        v-if="isEditing"
                                        type="button"
                                        @click="resetForm"
                                        class="flex-1 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500">
                                        ❌ Cancelar
                                    </button>
                                    <button 
                                        type="submit"
                                        :disabled="isLoading"
                                        class="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                                        <span v-if="!isLoading">
                                            {{ isEditing ? '💾' : '➕' }} {{ submitButtonText }}
                                        </span>
                                        <span v-else class="flex items-center justify-center">
                                            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Procesando...
                                        </span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <!-- Lista de Proyectos -->
                    <div :class="showForm ? 'lg:col-span-8' : 'lg:col-span-12'">
                        <div class="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
                            <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                                <h3 class="text-xl font-semibold text-white flex items-center">
                                    <span class="mr-2">📋</span>
                                    Lista de Proyectos
                                    <span class="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm text-gray-950">
                                        {{ filteredProyectos.length }}
                                    </span>
                                </h3>
                            </div>
                            
                            <div class="p-6">
                                <div class="overflow-x-auto">
                                    <table 
                                        id="proyectosTable"
                                        class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead class="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-12">
                                                    #
                                                </th>
                                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Proyecto
                                                </th>
                                                <th scope="col" class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32">
                                                    Progreso
                                                </th>
                                                <th scope="col" class="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-20">
                                                    <span title="Ver proyecto"></span>
                                                </th>
                                                <th scope="col" class="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-20">
                                                    <span title="Editar"></span>
                                                </th>
                                                <th scope="col" class="px-3 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-20">
                                                    <span title="Eliminar"></span>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            <tr v-for="(proyecto, index) in filteredProyectos" 
                                                :key="proyecto.id_proyectos"
                                                class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                                                <td class="px-3 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400"></td>
                                                <td class="px-6 py-4 whitespace-nowrap">
                                                    <div class="flex items-center">
                                                        <div class="flex-shrink-0 h-10 w-10">
                                                            <div class="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                                                                <span class="text-white font-bold text-sm">
                                                                    {{ proyecto.nombre_proyecto.charAt(0).toUpperCase() }}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div class="ml-4">
                                                            <div class="text-sm font-medium text-gray-900 dark:text-white">
                                                                {{ proyecto.nombre_proyecto }}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td class="px-4 py-4 whitespace-nowrap">
                                                    <div class="flex items-center">
                                                        <div class="flex-1">
                                                            <div class="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                                <span>{{ proyecto.porcentaje_total || 0 }}%</span>
                                                            </div>
                                                            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                                <div 
                                                                    :class="[
                                                                        getProgressColor(proyecto.porcentaje_total || 0),
                                                                        'h-2 rounded-full transition-all duration-300 ease-out'
                                                                    ]"
                                                                    :style="{width: (proyecto.porcentaje_total || 0) + '%'}">
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td class="px-3 py-4 whitespace-nowrap text-center">
                                                    <button 
                                                        @click="openProyecto(proyecto)"
                                                        title="Ver proyecto"
                                                        class="inline-flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors duration-200">
                                                        👁️
                                                    </button>
                                                </td>
                                                <td class="px-3 py-4 whitespace-nowrap text-center">
                                                    <button 
                                                        @click="editProyecto(proyecto)"
                                                        title="Editar proyecto"
                                                        class="inline-flex items-center justify-center w-8 h-8 bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400 rounded-full hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors duration-200">
                                                        ✏️
                                                    </button>
                                                </td>
                                                <td class="px-3 py-4 whitespace-nowrap text-center">
                                                    <button 
                                                        @click="deleteProyecto(proyecto)"
                                                        title="Eliminar proyecto"
                                                        class="inline-flex items-center justify-center w-8 h-8 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-200">
                                                        🗑️
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                
                                <!-- Estado vacío -->
                                <div v-if="filteredProyectos.length === 0" class="text-center py-12">
                                    <div class="mx-auto h-24 w-24 text-gray-400 mb-4">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                        </svg>
                                    </div>
                                    <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        No hay proyectos
                                    </h3>
                                    <p class="text-gray-500 dark:text-gray-400 mb-4">
                                        Comienza creando tu primer proyecto para gestionar tus obras.
                                    </p>
                                    <button 
                                        @click="toggleForm"
                                        class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200">
                                        ➕ Crear Primer Proyecto
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Estadísticas rápidas -->
                        <div v-if="proyectosList.length > 0" class="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                <div class="flex items-center">
                                    <div class="flex-shrink-0">
                                        <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                            📊
                                        </div>
                                    </div>
                                    <div class="ml-4">
                                        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Total Proyectos</p>
                                        <p class="text-2xl font-semibold text-gray-900 dark:text-white">{{ proyectosList.length }}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                <div class="flex items-center">
                                    <div class="flex-shrink-0">
                                        <div class="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                                            ✅
                                        </div>
                                    </div>
                                    <div class="ml-4">
                                        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Completados</p>
                                        <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                                            {{ proyectosList.filter(p => (p.porcentaje_total || 0) >= 100).length }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                <div class="flex items-center">
                                    <div class="flex-shrink-0">
                                        <div class="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                                            ⏳
                                        </div>
                                    </div>
                                    <div class="ml-4">
                                        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">En Progreso</p>
                                        <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                                            {{ proyectosList.filter(p => (p.porcentaje_total || 0) > 0 && (p.porcentaje_total || 0) < 100).length }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                                <div class="flex items-center">
                                    <div class="flex-shrink-0">
                                        <div class="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                                            🚀
                                        </div>
                                    </div>
                                    <div class="ml-4">
                                        <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Sin Iniciar</p>
                                        <p class="text-2xl font-semibold text-gray-900 dark:text-white">
                                            {{ proyectosList.filter(p => (p.porcentaje_total || 0) === 0).length }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
});

app.mount('#appProyectos');