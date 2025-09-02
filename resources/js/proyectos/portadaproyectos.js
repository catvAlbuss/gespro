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

        const especialidades = ref([
            'Arquitectura',
            'Estructuras',
            'Eléctrica',
            'Sanitaria',
            'Mecánica',
            'Seguridad',
            'Gestión de Obra'
        ]);

        // Formulario reactivo
        const form = reactive({
            nombre_proyecto: '',
            descripcion_proyecto: '',
            tipoproyecto: 'oficina',
            documento_proyecto: [],
            especialidades: [],
            empresa_id: empresaId
        });

        // ======================= COMPUTED PROPERTIES =======================
        const filteredProyectos = computed(() => {
            if (!searchQuery.value) {
                return proyectosList.value;
            }
            return proyectosList.value.filter(proyecto =>
                proyecto.nombre_proyecto.toLowerCase().includes(searchQuery.value.toLowerCase())
            );
        });

        const formTitle = computed(() => {
            return isEditing.value ? 'Editar Proyecto' : 'Crear Proyecto';
        });

        const submitButtonText = computed(() => {
            return isEditing.value ? 'Actualizar' : 'Guardar';
        });

        // ======================= METHODS =======================
        const resetForm = () => {
            form.nombre_proyecto = '';
            form.descripcion_proyecto = '';
            form.tipoproyecto = 'oficina';
            form.documento_proyecto = [];
            form.empresa_id = empresaId;
            isEditing.value = false;
            currentProyecto.value = null;
        };

        const editProyecto = (proyecto) => {
            isEditing.value = true;
            currentProyecto.value = proyecto;
            form.nombre_proyecto = proyecto.nombre_proyecto;
            form.descripcion_proyecto = proyecto.descripcion_proyecto;
            form.tipoproyecto = proyecto.tipoproyecto;
            form.empresa_id = proyecto.empresa_id;
        };

        const submitForm = async () => {
            try {
                const url = isEditing.value
                    ? routes.update.replace(':id', currentProyecto.value.id_proyectos)
                    : routes.store;

                const method = isEditing.value ? 'PUT' : 'POST';

                const formData = new FormData();
                formData.append('_token', csrfToken);
                if (isEditing.value) {
                    formData.append('_method', 'PUT');
                }

                Object.keys(form).forEach(key => {
                    if (Array.isArray(form[key])) {
                        form[key].forEach(item => {
                            formData.append(`${key}[]`, item);
                        });
                    } else {
                        formData.append(key, form[key]);
                    }
                });

                const response = await fetch(url, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                    }
                });

                if (response.ok) {
                    // Recargar la página para mostrar los cambios
                    window.location.reload();
                } else {
                    throw new Error('Error en la respuesta del servidor');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error al guardar el proyecto');
            }
        };

        const deleteProyecto = async (proyecto) => {
            if (!confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
                return;
            }

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
                    // Recargar la página para mostrar los cambios
                    window.location.reload();
                } else {
                    throw new Error('Error en la respuesta del servidor');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Error al eliminar el proyecto');
            }
        };

        const openProyecto = (proyecto) => {
            const url = routes.redirect
                .replace(':id', proyecto.id_proyectos)
                .replace(':empresa_id', proyecto.empresa_id);
            window.location.href = url;
        };

        const getProgressColor = (porcentaje) => {
            if (porcentaje > 60) return 'bg-green-600';
            if (porcentaje > 30) return 'bg-yellow-600';
            return 'bg-red-600';
        };

        const handleDocumentoChange = (value, checked) => {
            if (checked) {
                if (!form.documento_proyecto.includes(value)) {
                    form.documento_proyecto.push(value);
                }
            } else {
                form.documento_proyecto = form.documento_proyecto.filter(item => item !== value);
            }
        };

        const initDataTable = () => {
            nextTick(() => {
                if (window.$ && window.$.fn.DataTable) {
                    dataTable.value = window.$('#proyectosTable').DataTable({
                        pagingType: 'simple_numbers',
                        pageLength: 10,
                        lengthMenu: [10, 25, 50, 100],
                        language: {
                            url: '//cdn.datatables.net/plug-ins/2.1.8/i18n/es-MX.json',
                        },
                        columnDefs: [{
                            targets: '_all',
                            searchable: true
                        }]
                    });
                }
            });
        };

        // ======================= LIFECYCLE =======================
        onMounted(() => {
            // Inicializar DataTable después del montaje
            setTimeout(() => {
                initDataTable();
            }, 100);
        });

        // ======================= RETURN =======================
        return {
            // Data
            proyectosList,
            searchQuery,
            form,
            isEditing,
            currentProyecto,

            // Computed
            filteredProyectos,
            formTitle,
            submitButtonText,
            especialidades,
            
            // Methods
            resetForm,
            editProyecto,
            submitForm,
            deleteProyecto,
            openProyecto,
            getProgressColor,
            handleDocumentoChange,

            // Config
            canManageTasks,
            permisosUser
        };
    },

    template: `
        <div class="flex flex-wrap py-5">
            <!-- Formulario - Columna izquierda -->
            <div class="w-full md:w-1/4">
                <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
                    <div class="overflow-auto">
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                            {{ formTitle }}
                        </h3>

                        <form @submit.prevent="submitForm">
                            <!-- Nombre Proyecto -->
                            <div class="mb-4">
                                <label for="nombre_proyecto" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Nombre Proyecto
                                </label>
                                <input 
                                    type="text" 
                                    id="nombre_proyecto"
                                    v-model="form.nombre_proyecto"
                                    class="block mt-1 w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                    required 
                                    autofocus />
                            </div>

                            <!-- # Modulos -->
                            <div class="mb-4">
                                <label for="descripcion_proyecto" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    # Modulos
                                </label>
                                <input 
                                    type="text" 
                                    id="descripcion_proyecto"
                                    v-model="form.descripcion_proyecto"
                                    class="block mt-1 w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                    required />
                            </div>

                            <!-- # Especialidad -->
                            <div class="mb-4">
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Especialidades
                                </label>
                                <div class="grid grid-cols-2 gap-2">
                                    <div v-for="(esp, idx) in especialidades" :key="idx" class="flex items-center">
                                        <input 
                                            type="checkbox"
                                            :id="'esp-' + idx"
                                            :value="esp"
                                            v-model="form.especialidades"
                                            class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"/>
                                        <label :for="'esp-' + idx" class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                            {{ esp }}
                                        </label>
                                    </div>
                                </div>
                            </div>


                            <!-- Botones -->
                            <div class="flex items-center justify-end mt-4">
                                <button 
                                    v-if="isEditing"
                                    type="button"
                                    @click="resetForm"
                                    class="mr-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    class="ml-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    {{ submitButtonText }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Lista de Proyectos - Columna derecha -->
            <div class="w-full md:w-3/4 px-4 mt-4 md:mt-0">
                <div class="overflow-auto">
                    <div class="bg-white dark:bg-gray-800 text-gray-950 dark:text-gray-50 shadow-md rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                            Lista de Proyectos
                        </h3>
                        
                        <div class="overflow-x-auto">
                            <!-- Tabla -->
                            <table 
                                id="proyectosTable"
                                class="min-w-full w-full text-sm text-center rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" class="px-6 py-3 text-center">#</th>
                                        <th scope="col" class="px-6 py-3 text-center">Nombre</th>
                                        <th scope="col" class="px-6 py-3 text-center">Porcentaje</th>
                                        <th scope="col" class="px-6 py-3 text-center">Mostrar</th>
                                        <th scope="col" class="px-6 py-3 text-center">Editar</th>
                                        <th scope="col" class="px-6 py-3 text-center">Eliminar</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(proyecto, index) in filteredProyectos" :key="proyecto.id_proyectos"
                                        class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                        <td class="px-6 py-4">{{ index + 1 }}</td>
                                        <td class="px-6 py-4">{{ proyecto.nombre_proyecto }}</td>
                                        <td class="px-6 py-4">
                                            <div class="w-full bg-gray-200 rounded-full dark:bg-gray-700">
                                                <div 
                                                    :class="[getProgressColor(proyecto.porcentaje_total), 'text-xs font-medium text-white text-center p-0.5 leading-none rounded-full']"
                                                    :style="{width: proyecto.porcentaje_total + '%'}">
                                                    {{ proyecto.porcentaje_total }}%
                                                </div>
                                            </div>
                                        </td>
                                        <td class="px-6 py-4">
                                            <button 
                                                @click="openProyecto(proyecto)"
                                                class="text-blue-600 hover:text-blue-800">
                                                Abrir
                                            </button>
                                        </td>
                                        <td class="px-6 py-4">
                                            <button 
                                                @click="editProyecto(proyecto)"
                                                class="text-blue-600 hover:text-blue-800">
                                                Editar
                                            </button>
                                        </td>
                                        <td class="px-6 py-4">
                                            <button 
                                                @click="deleteProyecto(proyecto)"
                                                class="text-red-600 hover:text-red-800">
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
});

app.mount('#appProyectos');