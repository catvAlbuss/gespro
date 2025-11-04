import { createApp, ref, computed, watch, nextTick } from 'vue';

export function initDemandaDiariaModule() {
    const container = document.getElementById('demandaDiaria-content');
    if (!container) {
        console.error('Contenedor Demanda Diaria no encontrado');
        return;
    }

    // Evitar montar más de una vez
    if (container.__demandaApp) {
        return;
    }

    const DemandaComponent = {
        template: `
        <div class="max-w-full mx-auto p-4">
            <header class="bg-white/80 backdrop-blur-lg border-b border-slate-200/60 shadow-lg sticky top-12 z-50">
                <div class="max-w-7xl mx-auto px-6 py-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg">
                                <i class="fas fa-water text-white text-lg"></i>
                            </div>
                            <div>
                                <h1 class="text-2xl font-bold text-slate-800">1. CÁLCULO DE LA DEMANDA DIARIA</h1>
                                <p class="text-sm text-slate-600">Cálculo de consumo de agua</p>
                            </div>
                        </div>

                        <div class="flex items-center space-x-3">
                            <div class="flex items-center space-x-2">
                                <span class="text-sm text-slate-600">Modo:</span>
                                <button @click="toggleMode()" 
                                        class="px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200"
                                        :class="mode === 'edit' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'">
                                    <i class="fas" :class="mode === 'edit' ? 'fa-edit' : 'fa-eye'"></i>
                                    <span>{{ mode === 'edit' ? 'Edición' : 'Vista' }}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main class="max-w-full mx-auto px-2 py-4 space-y-2">
                <section class="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                        <h2 class="text-xl font-semibold text-white flex items-center">
                            <i class="fas fa-users mr-2"></i>
                            ALUMNOS Y PERSONAL ADMINISTRATIVO
                        </h2>
                    </div>
                    <div class="p-6">
                        <div id="table-personal-administrativo" class="border border-slate-200 rounded-lg overflow-hidden"></div>
                        <button v-if="mode === 'edit'" @click="addRowTabla1()"
                                class="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center">
                            <i class="fas fa-plus mr-2"></i>
                            Agregar Fila
                        </button>
                    </div>
                </section>

                <section class="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div class="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                        <h2 class="text-xl font-semibold text-white flex items-center">
                            <i class="fas fa-building mr-2"></i>
                            MÓDULOS PROYECTADOS EN ARQUITECTURA
                        </h2>
                    </div>
                    <div class="p-6">
                        <div class="mb-4 flex justify-between items-center" v-if="mode === 'edit'">
                            <button @click="addPiso()" 
                                    class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center">
                                <i class="fas fa-plus mr-2"></i>
                                Agregar Piso
                            </button>
                        </div>

                        <div v-for="(piso, pisoIndex) in tabla2" :key="piso.id" class="mb-6 p-4 border border-slate-200 rounded-lg bg-slate-50">
                            <div class="flex justify-between items-center mb-4">
                                <h5 class="font-semibold text-slate-700 flex items-center">
                                    <i class="fas fa-layer-group mr-2 text-green-600"></i>
                                    PISO {{ pisoIndex + 1 }}
                                </h5>
                                <button v-if="mode === 'edit'" @click="removePiso(pisoIndex)"
                                        class="text-red-500 hover:text-red-700 px-3 py-1 rounded transition-colors duration-200 flex items-center">
                                    <i class="fas fa-trash mr-1"></i>
                                    Eliminar Piso
                                </button>
                            </div>

                            <div :id="'table-piso-' + pisoIndex" class="border border-slate-200 rounded-lg overflow-hidden mb-4"></div>

                            <button v-if="mode === 'edit'" @click="addModulo(pisoIndex)"
                                    class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center">
                                <i class="fas fa-plus mr-2"></i>
                                Agregar Ambiente
                            </button>
                        </div>
                    </div>
                </section>

                <section class="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div class="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                        <h2 class="text-xl font-semibold text-white flex items-center">
                            <i class="fas fa-map mr-2"></i>
                            PLANTA GENERAL PROYECTADA EN ARQUITECTURA
                        </h2>
                    </div>
                    <div class="p-6">
                        <div id="table-planta-general" class="border border-slate-200 rounded-lg overflow-hidden"></div>
                        <button v-if="mode === 'edit'" @click="addRowTabla3()"
                                class="mt-4 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center">
                            <i class="fas fa-plus mr-2"></i>
                            Agregar Fila
                        </button>
                    </div>
                </section>

                <section class="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-lg font-medium mb-2 flex items-center">
                                <i class="fas fa-tint mr-2"></i>
                                VOLUMEN DE DEMANDA DIARIA
                            </div>
                            <div class="text-4xl font-bold">{{ totalCaudal }} Lt/día</div>
                        </div>
                        <div class="text-6xl opacity-20">
                            <i class="fas fa-water"></i>
                        </div>
                    </div>
                </section>
            </main>
        </div>
        `,
        setup() {
            const mode = ref('view');

            // Cache para mejorar rendimiento
            const _totalCaudalCache = ref(null);
            const _cacheInvalid = ref(true);
            const _isUpdating = ref(false);
            const _updateTimeout = ref(null);

            const uso = ref([
                { label: 'DEPOSITO', value: 'DEPOSITO' },
                { label: 'ALMACEN', value: 'ALMACEN' },
                { label: 'OFICINA', value: 'OFICINA' },
                { label: 'CONSULTORIO', value: 'CONSULTORIO' },
                { label: 'LABORATORIO', value: 'LABORATORIO' },
                { label: 'COMEDOR', value: 'COMEDOR' },
            ]);

            const dotacionselect = ref([
                { label: '0.50 Lt x m2 / dia', value: 0.50 },
                { label: '2.00 Lt x m2 / dia', value: 2.00 },
                { label: '6.00 Lt x m2 / dia', value: 6.00 },
                { label: '40.00 Lt x m2 / dia', value: 40.00 },
                { label: '50.00 Lt x per / dia', value: 50.00 },
                { label: '200.00 Lt x per / dia', value: 200.00 },
                { label: '500.00 Lt /dia', value: 500 }
            ]);

            const tabla1 = ref([
                {
                    id: 'tabla1_1',
                    ambiente: '(DOCENTES) NIVEL INICIAL',
                    uso: 'DOCENTES',
                    cantidad: 3.00,
                    dotacion: '50.00 Lt x per / dia',
                    caudal: 150.00
                },
                { id: 'tabla1_2', ambiente: '(DOCENTES) NIVEL INICIAL', uso: 'DOCENTES', cantidad: 3.00, dotacion: '50.00 Lt x per / dia', caudal: 150.00 },
                { id: 'tabla1_3', ambiente: '(DOCENTES) NIVEL PRIMARIA', uso: 'DOCENTES', cantidad: 15.00, dotacion: '50.00 Lt x per / dia', caudal: 750.00 },
                { id: 'tabla1_4', ambiente: '(ALUMNOS) NIVEL INICIAL', uso: 'ALUMNOS/2 aulas 31 c/u', cantidad: 62.00, dotacion: '50.00 Lt x per / dia', caudal: 3100.00 },
                { id: 'tabla1_5', ambiente: '(ALUMNOS) NIVEL PRIMARIA', uso: 'ALUM./10 aulas 25 c/u +16', cantidad: 266.00, dotacion: '50.00 Lt x per / dia', caudal: 13300.00 },
                { id: 'tabla1_6', ambiente: 'DIRECTOR', uso: 'DIRECTOR', cantidad: 1.00, dotacion: '50.00 Lt x per / dia', caudal: 50.00 },
                { id: 'tabla1_7', ambiente: 'GUARDIAN', uso: 'GUARDIAN', cantidad: 1.00, dotacion: '50.00 Lt x per / dia', caudal: 50.00 },
                { id: 'tabla1_8', ambiente: 'PER.SERVICIO', uso: 'PER.SERVICIO', cantidad: 2.00, dotacion: '50.00 Lt x per / dia', caudal: 100.00 },
                { id: 'tabla1_9', ambiente: 'BIBLIOTECARIA', uso: 'BIBLIOTECARIA', cantidad: 1.00, dotacion: '50.00 Lt x per / dia', caudal: 50.00 },
                { id: 'tabla1_10', ambiente: 'SECRETARIA', uso: 'SECRETARIA', cantidad: 1.00, dotacion: '50.00 Lt x per / dia', caudal: 50.00 }
            ]);

            const tabla2 = ref([
                {
                    id: 'piso_0',
                    modulos: [
                        {
                            id: 'piso0_mod0',
                            ambiente: 'ALMACEN GENERAL',
                            uso: 'ALMACEN',
                            cantidad: 28.91,
                            dotacion: '0.50 Lt x m2 / dia',
                            caudal: 14.46
                        },
                        { id: 'piso0_mod2', ambiente: 'ALMACEN GENERAL', uso: 'ALMACEN', cantidad: 28.91, dotacion: '0.50 Lt x m2 / dia', caudal: 14.46 },
                        { id: 'piso0_mod3', ambiente: 'DEPOSITO SUM', uso: 'DEPOSITO', cantidad: 30.08, dotacion: '0.50 Lt x m2 / dia', caudal: 15.04 },
                        { id: 'piso0_mod4', ambiente: 'DEPOSITO DE MATERIALES DEPORT.', uso: 'DEPOSITO', cantidad: 16.01, dotacion: '0.50 Lt x m2 / dia', caudal: 8.01 },
                        { id: 'piso0_mod5', ambiente: 'COMEDOR', uso: 'COMEDOR', cantidad: 118.06, dotacion: '40.00 Lt x m2 / dia', caudal: 4722.40 },
                        { id: 'piso0_mod6', ambiente: 'BIBLIOTECA /AREA DE LIBROS', uso: 'OFICINA', cantidad: 93.80, dotacion: '6.00 Lt x m2 / dia', caudal: 562.80 }
                    ]
                },
                {
                    id: 'piso_1',
                    modulos: [
                        {
                            id: 'piso1_mod0',
                            ambiente: 'MODULO DE CONECTIVIDAD',
                            uso: 'OFICINA',
                            cantidad: 24.53,
                            dotacion: '6.00 Lt x m2 / dia',
                            caudal: 147.18
                        }
                    ]
                }
            ]);

            const tabla3 = ref([
                {
                    id: 'tabla3_1',
                    ambiente: 'JARDINES',
                    uso: 'AREAS VERDES',
                    cantidad: 533.06,
                    dotacion: '2.00 Lt x m2 / dia',
                    caudal: 1066.12
                },
                {
                    id: 'tabla3_2',
                    ambiente: 'DEPOSITO',
                    uso: 'DEPOSITOS',
                    cantidad: 137.36,
                    dotacion: '0.50 Lt x m2 / dia',
                    caudal: 68.68
                }
            ]);

            // Instancias de tablas Tabulator
            const tablePersonalAdmin = ref(null);
            const tablePlantaGeneral = ref(null);
            const tablesPisos = ref([]);

            // Getter optimizado con cache
            const totalCaudal = computed(() => {
                if (!_cacheInvalid.value && _totalCaudalCache.value !== null) {
                    return _totalCaudalCache.value;
                }

                let total = 0;

                // Suma tabla 1
                total += tabla1.value.reduce((sum, item) => sum + parseFloat(item.caudal || 0), 0);

                // Suma tabla 2 (todos los pisos y módulos)
                tabla2.value.forEach(piso => {
                    total += piso.modulos.reduce((sum, modulo) => sum + parseFloat(modulo.caudal || 0), 0);
                });

                // Suma tabla 3
                total += tabla3.value.reduce((sum, item) => sum + parseFloat(item.caudal || 0), 0);

                _totalCaudalCache.value = parseFloat(total.toFixed(2));
                _cacheInvalid.value = false;

                return _totalCaudalCache.value;
            });

            // Invalidar cache cuando sea necesario
            const invalidateCache = () => {
                _cacheInvalid.value = true;
            };

            // Debounced update para evitar múltiples llamadas
            const debouncedUpdate = () => {
                if (_updateTimeout.value) {
                    clearTimeout(_updateTimeout.value);
                }

                _updateTimeout.value = setTimeout(() => {
                    sendDataUpdate();
                }, 100); // 100ms de debounce
            };

            const sendDataUpdate = () => {
                if (_isUpdating.value) return;

                _isUpdating.value = true;

                try {
                    const data = {
                        totalCaudal: totalCaudal.value,
                        tabla1: tabla1.value,
                        tabla2: tabla2.value,
                        tabla3: tabla3.value,
                        mode: mode.value
                    };

                    document.dispatchEvent(new CustomEvent('demanda-diaria-updated', {
                        detail: data
                    }));
                } finally {
                    _isUpdating.value = false;
                }
            };

            // Inicialización
            const init = async () => {
                await nextTick();

                // Inicializa caudales y asigna IDs si no existen
                initializeData();

                // Crear tablas una sola vez
                createTables();

                // Envío inicial de datos
                sendDataUpdate();
            };

            // Inicialización optimizada de datos
            const initializeData = () => {
                // Asignar IDs únicos si no existen y calcular caudales
                tabla1.value.forEach((item, index) => {
                    if (!item.id) item.id = `tabla1_${index + 1}`;
                    calculateCaudal(item);
                });

                tabla2.value.forEach((piso, pisoIndex) => {
                    if (!piso.id) piso.id = `piso_${pisoIndex}`;
                    piso.modulos.forEach((modulo, moduloIndex) => {
                        if (!modulo.id) modulo.id = `piso${pisoIndex}_mod${moduloIndex}`;
                        calculateCaudal(modulo);
                    });
                });

                tabla3.value.forEach((item, index) => {
                    if (!item.id) item.id = `tabla3_${index + 1}`;
                    calculateCaudal(item);
                });

                invalidateCache();
            };

            // Configuración base para columnas optimizada
            const getBaseColumns = () => {
                return [
                    {
                        title: "AMBIENTE",
                        field: "ambiente",
                        editor: mode.value === 'edit' ? "input" : false,
                        headerSort: false,
                        cssClass: "text-left",
                        cellEdited: mode.value === 'edit' ? handleCellEdit : undefined
                    },
                    {
                        title: "USO",
                        field: "uso",
                        //editor: mode.value === 'edit' ? "input" : false,
                        editor: mode.value === 'edit' ? "list" : false,
                        editorParams: mode.value === 'edit' ? {
                            values: uso.value.reduce((acc, item) => {
                                acc[item.label] = item.label;
                                return acc;
                            }, {}),
                            autocomplete: true,
                            listOnEmpty: true,
                             freetext:true,
                        } : {},
                        headerSort: false,
                        cssClass: "text-center",
                        cellEdited: mode.value === 'edit' ? handleCellEdit : undefined
                    },
                    {
                        title: "CANTIDAD",
                        field: "cantidad",
                        editor: mode.value === 'edit' ? "number" : false,
                        headerSort: false,
                        cssClass: "text-center",
                        formatter: (cell) => {
                            const value = cell.getValue();
                            return `${parseFloat(value || 0).toFixed(2)} m²`;
                        },
                        cellEdited: mode.value === 'edit' ? handleCellEdit : undefined
                    },
                    {
                        title: "DOTACIÓN",
                        field: "dotacion",
                        editor: mode.value === 'edit' ? "list" : false,
                        editorParams: mode.value === 'edit' ? {
                            values: dotacionselect.value.reduce((acc, item) => {
                                acc[item.label] = item.label;
                                return acc;
                            }, {}),
                            autocomplete: true,
                            listOnEmpty: true
                        } : {},
                        headerSort: false,
                        cssClass: "text-center",
                        cellEdited: mode.value === 'edit' ? handleCellEdit : undefined
                    },
                    {
                        title: "CAUDAL",
                        field: "caudal",
                        headerSort: false,
                        cssClass: "text-center font-semibold text-blue-600",
                        formatter: (cell) => {
                            const value = cell.getValue();
                            return `${parseFloat(value || 0).toFixed(2)} Lt/día`;
                        }
                    }
                ];
            };

            // Manejo optimizado de edición de celdas
            const handleCellEdit = (cell) => {
                if (_isUpdating.value) return;

                const field = cell.getField();
                const rowData = cell.getRow().getData();
                const newValue = cell.getValue();

                // Actualizar el valor en los datos de Vue
                const item = findItemById(rowData.id);
                if (item) {
                    item[field] = newValue;

                    // Solo recalcular si afecta al caudal
                    if (field === 'cantidad' || field === 'dotacion') {
                        calculateCaudal(item);
                        // Actualizar solo la celda de caudal
                        updateCaudalCell(cell.getRow(), item.caudal);
                    }

                    invalidateCache();
                    debouncedUpdate();
                }
            };

            // Actualizar solo la celda de caudal sin recrear la tabla
            const updateCaudalCell = (row, newCaudal) => {
                try {
                    row.update({ caudal: newCaudal });
                } catch (error) {
                    console.warn('Error updating caudal cell:', error);
                }
            };

            // Búsqueda optimizada por ID
            const findItemById = (id) => {
                // Buscar en tabla1
                let item = tabla1.value.find(item => item.id === id);
                if (item) return item;

                // Buscar en tabla2
                for (const piso of tabla2.value) {
                    item = piso.modulos.find(modulo => modulo.id === id);
                    if (item) return item;
                }

                // Buscar en tabla3
                item = tabla3.value.find(item => item.id === id);
                return item;
            };

            // Configuración de columnas con acciones optimizada
            const getColumnsWithActions = () => {
                const baseColumns = getBaseColumns();

                if (mode.value === 'edit') {
                    baseColumns.push({
                        title: "ACCIONES",
                        field: "actions",
                        headerSort: false,
                        cssClass: "text-center",
                        width: 80,
                        formatter: () => {
                            return '<button class="delete-btn bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs transition-colors duration-200" title="Eliminar"><i class="fas fa-trash"></i></button>';
                        },
                        cellClick: (e, cell) => {
                            e.stopPropagation();
                            if (e.target.closest('.delete-btn')) {
                                handleDeleteRow(cell);
                            }
                        }
                    });
                }

                return baseColumns;
            };

            // Manejo optimizado de eliminación de filas
            const handleDeleteRow = (cell) => {
                const rowData = cell.getRow().getData();
                const table = cell.getTable();

                // Determinar qué tabla y eliminar
                if (table === tablePersonalAdmin.value) {
                    const index = tabla1.value.findIndex(item => item.id === rowData.id);
                    if (index !== -1) removeRowTabla1(index);
                } else if (table === tablePlantaGeneral.value) {
                    const index = tabla3.value.findIndex(item => item.id === rowData.id);
                    if (index !== -1) removeRowTabla3(index);
                } else {
                    // Tablas de pisos
                    const tableElement = table.element;
                    const pisoIndex = parseInt(tableElement.id.split('-')[2]);
                    const moduloIndex = tabla2.value[pisoIndex].modulos.findIndex(m => m.id === rowData.id);
                    if (moduloIndex !== -1) removeModulo(pisoIndex, moduloIndex);
                }
            };

            // Creación optimizada de tablas
            const createTables = () => {
                createTablePersonalAdmin();
                createTablePlantaGeneral();
                createTablesPisos();
            };

            const createTablePersonalAdmin = () => {
                const el = document.getElementById("table-personal-administrativo");
                if (!el) return;

                if (tablePersonalAdmin.value) {
                    tablePersonalAdmin.value.destroy();
                }

                tablePersonalAdmin.value = new Tabulator(el, {
                    data: tabla1.value,
                    layout: "fitColumns",
                    responsiveLayout: "hide",
                    pagination: false,
                    columns: getColumnsWithActions(),
                    cssClass: "tabulator-modern",
                    headerSort: false,
                    virtualDom: false, // Mejor rendimiento para tablas pequeñas
                    persistence: false,
                });
            };

            const createTablePlantaGeneral = () => {
                const el = document.getElementById("table-planta-general");
                if (!el) return;

                if (tablePlantaGeneral.value) {
                    tablePlantaGeneral.value.destroy();
                }

                tablePlantaGeneral.value = new Tabulator(el, {
                    data: tabla3.value,
                    layout: "fitColumns",
                    responsiveLayout: "hide",
                    pagination: false,
                    columns: getColumnsWithActions(),
                    cssClass: "tabulator-modern",
                    headerSort: false,
                    virtualDom: false,
                    persistence: false,
                });
            };

            const createTablesPisos = () => {
                // Limpiar tablas existentes
                tablesPisos.value.forEach(table => table?.destroy());
                tablesPisos.value = [];

                tabla2.value.forEach((piso, pisoIndex) => {
                    const tableId = `table-piso-${pisoIndex}`;
                    const el = document.getElementById(tableId);

                    if (!el) return;

                    const table = new Tabulator(el, {
                        data: piso.modulos,
                        layout: "fitColumns",
                        responsiveLayout: "hide",
                        pagination: false,
                        columns: getColumnsWithActions(),
                        cssClass: "tabulator-modern",
                        headerSort: false,
                        virtualDom: false,
                        persistence: false,
                    });

                    tablesPisos.value[pisoIndex] = table;
                });
            };

            // Toggle mode optimizado
            const toggleMode = async () => {
                mode.value = mode.value === 'view' ? 'edit' : 'view';

                // Recrear solo las configuraciones de columnas, no las tablas completas
                await nextTick();
                updateTablesMode();
            };

            // Actualizar modo de tablas sin recrearlas
            const updateTablesMode = () => {
                const newColumns = getColumnsWithActions();

                tablePersonalAdmin.value?.setColumns(newColumns);
                tablePlantaGeneral.value?.setColumns(newColumns);
                tablesPisos.value.forEach(table => table?.setColumns(newColumns));
            };

            // Generar ID único optimizado
            const generateId = (prefix = 'item') => {
                return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            };

            // FUNCIONES OPTIMIZADAS PARA TABLA 1
            const addRowTabla1 = () => {
                const newRow = {
                    id: generateId('tabla1'),
                    ambiente: 'Nuevo Ambiente',
                    uso: 'Nuevo Uso',
                    cantidad: 0,
                    dotacion: '50.00 Lt x per / dia',
                    caudal: 0
                };

                calculateCaudal(newRow);
                tabla1.value.push(newRow);

                if (tablePersonalAdmin.value) {
                    tablePersonalAdmin.value.addRow(newRow);
                }

                invalidateCache();
                debouncedUpdate();
            };

            const removeRowTabla1 = (index) => {
                if (index < 0 || index >= tabla1.value.length) return;

                tabla1.value.splice(index, 1);

                if (tablePersonalAdmin.value) {
                    tablePersonalAdmin.value.setData(tabla1.value);
                }

                invalidateCache();
                debouncedUpdate();
            };

            // FUNCIONES OPTIMIZADAS PARA TABLA 2
            const addPiso = async () => {
                const pisoIndex = tabla2.value.length;
                const newPiso = {
                    id: generateId('piso'),
                    modulos: [{
                        id: generateId(`piso${pisoIndex}_mod`),
                        ambiente: 'Nuevo Modulo',
                        uso: 'Nuevo Uso',
                        cantidad: 0,
                        dotacion: '0.50 Lt x m2 / dia',
                        caudal: 0
                    }]
                };

                calculateCaudal(newPiso.modulos[0]);
                tabla2.value.push(newPiso);

                await nextTick();
                createTablesPisos();

                invalidateCache();
                debouncedUpdate();
            };

            const removePiso = async (pisoIndex) => {
                if (pisoIndex < 0 || pisoIndex >= tabla2.value.length) return;

                tabla2.value.splice(pisoIndex, 1);

                await nextTick();
                createTablesPisos();

                invalidateCache();
                debouncedUpdate();
            };

            const addModulo = (pisoIndex) => {
                if (pisoIndex < 0 || pisoIndex >= tabla2.value.length) return;

                const moduloIndex = tabla2.value[pisoIndex].modulos.length;
                const newModulo = {
                    id: generateId(`piso${pisoIndex}_mod`),
                    ambiente: 'Nuevo Modulo',
                    uso: 'Nuevo Uso',
                    cantidad: 0,
                    dotacion: '0.50 Lt x m2 / dia',
                    caudal: 0
                };

                calculateCaudal(newModulo);
                tabla2.value[pisoIndex].modulos.push(newModulo);

                if (tablesPisos.value[pisoIndex]) {
                    tablesPisos.value[pisoIndex].addRow(newModulo);
                }

                invalidateCache();
                debouncedUpdate();
            };

            const removeModulo = (pisoIndex, moduloIndex) => {
                if (pisoIndex < 0 || pisoIndex >= tabla2.value.length) return;
                if (moduloIndex < 0 || moduloIndex >= tabla2.value[pisoIndex].modulos.length) return;

                tabla2.value[pisoIndex].modulos.splice(moduloIndex, 1);

                if (tablesPisos.value[pisoIndex]) {
                    tablesPisos.value[pisoIndex].setData(tabla2.value[pisoIndex].modulos);
                }

                invalidateCache();
                debouncedUpdate();
            };

            // FUNCIONES OPTIMIZADAS PARA TABLA 3
            const addRowTabla3 = () => {
                const newRow = {
                    id: generateId('tabla3'),
                    ambiente: 'Nuevo Ambiente',
                    uso: 'Nuevo Uso',
                    cantidad: 0,
                    dotacion: '2.00 Lt x m2 / dia',
                    caudal: 0
                };

                calculateCaudal(newRow);
                tabla3.value.push(newRow);

                if (tablePlantaGeneral.value) {
                    tablePlantaGeneral.value.addRow(newRow);
                }

                invalidateCache();
                debouncedUpdate();
            };

            const removeRowTabla3 = (index) => {
                if (index < 0 || index >= tabla3.value.length) return;

                tabla3.value.splice(index, 1);

                if (tablePlantaGeneral.value) {
                    tablePlantaGeneral.value.setData(tabla3.value);
                }

                invalidateCache();
                debouncedUpdate();
            };

            // CÁLCULO DE CAUDAL OPTIMIZADO
            const calculateCaudal = (item) => {
                const cantidad = parseFloat(item.cantidad) || 0;
                const dotacionStr = item.dotacion?.toString() || '';

                const dotacionEntry = dotacionselect.value.find(d => d.label === dotacionStr);
                const dotacionValue = dotacionEntry?.value || 0;
                let calculatedCaudal = 0;

                if (dotacionStr.includes('Lt /dia')) {
                    calculatedCaudal = dotacionValue;
                } else if (dotacionStr.includes('Lt x per / dia')) {
                    calculatedCaudal = cantidad * dotacionValue;
                } else if (dotacionStr.includes('Lt x m2 / dia')) {
                    calculatedCaudal = cantidad * dotacionValue;
                }

                item.caudal = parseFloat(calculatedCaudal.toFixed(2));
                return item.caudal;
            };

            // Setup watchers optimizados
            watch(totalCaudal, (newValue) => {
                if (!_isUpdating.value) {
                    debouncedUpdate();
                }
            });

            // Inicializar
            init();

            return {
                mode,
                dotacionselect,
                tabla1,
                tabla2,
                tabla3,
                totalCaudal,
                toggleMode,
                addRowTabla1,
                removeRowTabla1: removeRowTabla1, // Exposed for potential use, but handled in handleDeleteRow
                addPiso,
                removePiso,
                addModulo,
                removeModulo: removeModulo, // Exposed for potential use
                addRowTabla3,
                removeRowTabla3: removeRowTabla3 // Exposed for potential use
            };
        }
    };

    const app = createApp(DemandaComponent);
    // Montar dentro del contenedor
    container.innerHTML = '';
    const vm = app.mount(container);
    container.__demandaApp = { app, vm };

    // Cleanup cuando se destruye (aunque en este contexto podría no ser necesario, pero por completitud)
    // vm.$on('hook:beforeDestroy', () => {
    //     if (_updateTimeout.value) {
    //         clearTimeout(_updateTimeout.value);
    //     }

    //     tablePersonalAdmin.value?.destroy();
    //     tablePlantaGeneral.value?.destroy();
    //     tablesPisos.value.forEach(table => table?.destroy());

    //     tablePersonalAdmin.value = null;
    //     tablePlantaGeneral.value = null;
    //     tablesPisos.value = [];
    // });
}