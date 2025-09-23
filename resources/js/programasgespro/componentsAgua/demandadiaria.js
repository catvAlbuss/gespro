export function initDemandaDiariaModule() {
    const demandadiaria = document.getElementById('demandaDiaria-content');
    if (!demandadiaria) {
        console.error('Contenedor Demanda Diaria no encontrado');
        return;
    }

    demandadiaria.innerHTML = `
        <div x-data="demandaDiariaModule" class="max-w-full mx-auto p-4">
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
                                    <span x-text="mode === 'edit' ? 'Edición' : 'Vista'"></span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
            
            <main class="max-w-full mx-auto px-2 py-4 space-y-6">
                <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                        <h2 class="text-xl font-semibold text-white flex items-center">
                            <i class="fas fa-users mr-2"></i>
                            ALUMNOS Y PERSONAL ADMINISTRATIVO
                        </h2>
                    </div>
                    <div class="p-6">
                        <div id="table-personal-administrativo" class="border border-slate-200 rounded-lg overflow-hidden"></div>
                        <button @click="addRowTabla1()" x-show="mode === 'edit'"
                                class="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center">
                            <i class="fas fa-plus mr-2"></i>
                            Agregar Fila
                        </button>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div class="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
                        <h2 class="text-xl font-semibold text-white flex items-center">
                            <i class="fas fa-building mr-2"></i>
                            MÓDULOS PROYECTADOS EN ARQUITECTURA
                        </h2>
                    </div>
                    <div class="p-6">
                        <div class="mb-4 flex justify-between items-center" x-show="mode === 'edit'">
                            <button @click="addPiso()" 
                                    class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center">
                                <i class="fas fa-plus mr-2"></i>
                                Agregar Piso
                            </button>
                        </div>

                        <template x-for="(piso, pisoIndex) in tabla2" :key="pisoIndex">
                            <div class="mb-6 p-4 border border-slate-200 rounded-lg bg-slate-50">
                                <div class="flex justify-between items-center mb-4">
                                    <h5 class="font-semibold text-slate-700 flex items-center">
                                        <i class="fas fa-layer-group mr-2 text-green-600"></i>
                                        PISO <span x-text="pisoIndex + 1"></span>
                                    </h5>
                                    <button x-show="mode === 'edit'" @click="removePiso(pisoIndex)"
                                            class="text-red-500 hover:text-red-700 px-3 py-1 rounded transition-colors duration-200 flex items-center">
                                        <i class="fas fa-trash mr-1"></i>
                                        Eliminar Piso
                                    </button>
                                </div>
                                
                                <div :id="'table-piso-' + pisoIndex" class="border border-slate-200 rounded-lg overflow-hidden mb-4"></div>
                                
                                <button @click="addModulo(pisoIndex)" x-show="mode === 'edit'"
                                        class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center">
                                    <i class="fas fa-plus mr-2"></i>
                                    Agregar Módulo
                                </button>
                            </div>
                        </template>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div class="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                        <h2 class="text-xl font-semibold text-white flex items-center">
                            <i class="fas fa-map mr-2"></i>
                            PLANTA GENERAL PROYECTADA EN ARQUITECTURA
                        </h2>
                    </div>
                    <div class="p-6">
                        <div id="table-planta-general" class="border border-slate-200 rounded-lg overflow-hidden"></div>
                        <button @click="addRowTabla3()" x-show="mode === 'edit'"
                                class="mt-4 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center">
                            <i class="fas fa-plus mr-2"></i>
                            Agregar Fila
                        </button>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg p-6 text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-lg font-medium mb-2 flex items-center">
                                <i class="fas fa-tint mr-2"></i>
                                VOLUMEN DE DEMANDA DIARIA
                            </div>
                            <div class="text-4xl font-bold" x-text="totalCaudal() + ' Lt/día'"></div>
                        </div>
                        <div class="text-6xl opacity-20">
                            <i class="fas fa-water"></i>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    `;

    Alpine.data('demandaDiariaModule', () => ({
        mode: 'view',

        // Cache para mejorar rendimiento
        _totalCaudalCache: null,
        _cacheInvalid: true,
        _isUpdating: false,
        _updateTimeout: null,

        dotacionselect: [
            { label: '0.50 Lt x m2 / dia', value: 0.50 },
            { label: '2.00 Lt x m2 / dia', value: 2.00 },
            { label: '6.00 Lt x m2 / dia', value: 6.00 },
            { label: '40.00 Lt x m2 / dia', value: 40.00 },
            { label: '50.00 Lt x per / dia', value: 50.00 },
            { label: '200.00 Lt x per / dia', value: 200.00 },
            { label: '500.00 Lt /dia', value: 500 }
        ],

        // Data inicial con IDs únicos
        tabla1: [
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
        ],

        tabla2: [
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
                    {  id: 'piso0_mod2', ambiente: 'ALMACEN GENERAL', uso: 'ALMACEN', cantidad: 28.91, dotacion: '0.50 Lt x m2 / dia', caudal: 14.46 },
                    {  id: 'piso0_mod3', ambiente: 'DEPOSITO SUM', uso: 'DEPOSITO', cantidad: 30.08, dotacion: '0.50 Lt x m2 / dia', caudal: 15.04 },
                    {  id: 'piso0_mod4', ambiente: 'DEPOSITO DE MATERIALES DEPORT.', uso: 'DEPOSITO', cantidad: 16.01, dotacion: '0.50 Lt x m2 / dia', caudal: 8.01 },
                    {  id: 'piso0_mod5', ambiente: 'COMEDOR', uso: 'COMEDOR', cantidad: 118.06, dotacion: '40.00 Lt x m2 / dia', caudal: 4722.40 },
                    {  id: 'piso0_mod6', ambiente: 'BIBLIOTECA /AREA DE LIBROS', uso: 'OFICINA', cantidad: 93.80, dotacion: '6.00 Lt x m2 / dia', caudal: 562.80 }
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
                    },
                ]
            }
        ],

        tabla3: [
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
        ],

        // Instancias de tablas Tabulator
        tablePersonalAdmin: null,
        tablePlantaGeneral: null,
        tablesPisos: [],

        // Getter optimizado con cache
        totalCaudal() {
            if (!this._cacheInvalid && this._totalCaudalCache !== null) {
                return this._totalCaudalCache;
            }

            let total = 0;

            // Suma tabla 1
            total += this.tabla1.reduce((sum, item) => sum + parseFloat(item.caudal || 0), 0);

            // Suma tabla 2 (todos los pisos y módulos)
            this.tabla2.forEach(piso => {
                total += piso.modulos.reduce((sum, modulo) => sum + parseFloat(modulo.caudal || 0), 0);
            });

            // Suma tabla 3
            total += this.tabla3.reduce((sum, item) => sum + parseFloat(item.caudal || 0), 0);

            this._totalCaudalCache = parseFloat(total.toFixed(2));
            this._cacheInvalid = false;

            return this._totalCaudalCache;
        },

        // Invalidar cache cuando sea necesario
        invalidateCache() {
            this._cacheInvalid = true;
        },

        // Debounced update para evitar múltiples llamadas
        debouncedUpdate() {
            if (this._updateTimeout) {
                clearTimeout(this._updateTimeout);
            }

            this._updateTimeout = setTimeout(() => {
                this.sendDataUpdate();
            }, 100); // 100ms de debounce
        },

        async init() {
            await this.$nextTick();

            // Inicializa caudales y asigna IDs si no existen
            this.initializeData();

            // Crear tablas una sola vez
            this.createTables();

            // Setup watchers optimizados
            this.setupOptimizedWatchers();

            // Envío inicial de datos
            this.sendDataUpdate();
        },

        // Inicialización optimizada de datos
        initializeData() {
            // Asignar IDs únicos si no existen y calcular caudales
            this.tabla1.forEach((item, index) => {
                if (!item.id) item.id = `tabla1_${index + 1}`;
                this.calculateCaudal(item);
            });

            this.tabla2.forEach((piso, pisoIndex) => {
                if (!piso.id) piso.id = `piso_${pisoIndex}`;
                piso.modulos.forEach((modulo, moduloIndex) => {
                    if (!modulo.id) modulo.id = `piso${pisoIndex}_mod${moduloIndex}`;
                    this.calculateCaudal(modulo);
                });
            });

            this.tabla3.forEach((item, index) => {
                if (!item.id) item.id = `tabla3_${index + 1}`;
                this.calculateCaudal(item);
            });

            this.invalidateCache();
        },

        // Watchers optimizados
        setupOptimizedWatchers() {
            // Solo un watcher para totalCaudal
            this.$watch(() => this.totalCaudal(), (newValue) => {
                if (!this._isUpdating) {
                    this.debouncedUpdate();
                }
            });
        },

        // Configuración base para columnas optimizada
        getBaseColumns() {
            const self = this;

            return [
                {
                    title: "AMBIENTE",
                    field: "ambiente",
                    editor: this.mode === 'edit' ? "input" : false,
                    headerSort: false,
                    cssClass: "text-left",
                    cellEdited: this.mode === 'edit' ? (cell) => this.handleCellEdit(cell, 'ambiente') : undefined
                },
                {
                    title: "USO",
                    field: "uso",
                    editor: this.mode === 'edit' ? "input" : false,
                    headerSort: false,
                    cssClass: "text-center",
                    cellEdited: this.mode === 'edit' ? (cell) => this.handleCellEdit(cell, 'uso') : undefined
                },
                {
                    title: "CANTIDAD",
                    field: "cantidad",
                    editor: this.mode === 'edit' ? "number" : false,
                    headerSort: false,
                    cssClass: "text-center",
                    cellEdited: this.mode === 'edit' ? (cell) => this.handleCellEdit(cell, 'cantidad') : undefined
                },
                {
                    title: "DOTACIÓN",
                    field: "dotacion",
                    editor: this.mode === 'edit' ? "list" : false,
                    editorParams: this.mode === 'edit' ? {
                        values: this.dotacionselect.reduce((acc, item) => {
                            acc[item.label] = item.label;
                            return acc;
                        }, {}),
                        autocomplete: true,
                        listOnEmpty: true
                    } : {},
                    headerSort: false,
                    cssClass: "text-center",
                    cellEdited: this.mode === 'edit' ? (cell) => this.handleCellEdit(cell, 'dotacion') : undefined
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
        },

        // Manejo optimizado de edición de celdas
        handleCellEdit(cell, field) {
            if (this._isUpdating) return;

            const rowData = cell.getRow().getData();
            const newValue = cell.getValue();

            // Actualizar el valor en los datos de Alpine
            const item = this.findItemById(rowData.id);
            if (item) {
                item[field] = newValue;

                // Solo recalcular si afecta al caudal
                if (field === 'cantidad' || field === 'dotacion') {
                    this.calculateCaudal(item);
                    // Actualizar solo la celda de caudal
                    this.updateCaudalCell(cell.getRow(), item.caudal);
                }

                this.invalidateCache();
                this.debouncedUpdate();
            }
        },

        // Actualizar solo la celda de caudal sin recrear la tabla
        updateCaudalCell(row, newCaudal) {
            try {
                row.update({ caudal: newCaudal });
            } catch (error) {
                console.warn('Error updating caudal cell:', error);
            }
        },

        // Búsqueda optimizada por ID
        findItemById(id) {
            // Buscar en tabla1
            let item = this.tabla1.find(item => item.id === id);
            if (item) return item;

            // Buscar en tabla2
            for (const piso of this.tabla2) {
                item = piso.modulos.find(modulo => modulo.id === id);
                if (item) return item;
            }

            // Buscar en tabla3
            item = this.tabla3.find(item => item.id === id);
            return item;
        },

        // Configuración de columnas con acciones optimizada
        getColumnsWithActions() {
            const baseColumns = this.getBaseColumns();

            if (this.mode === 'edit') {
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
                            this.handleDeleteRow(cell);
                        }
                    }
                });
            }

            return baseColumns;
        },

        // Manejo optimizado de eliminación de filas
        handleDeleteRow(cell) {
            const rowData = cell.getRow().getData();
            const table = cell.getTable();

            // Determinar qué tabla y eliminar
            if (table === this.tablePersonalAdmin) {
                const index = this.tabla1.findIndex(item => item.id === rowData.id);
                if (index !== -1) this.removeRowTabla1(index);
            } else if (table === this.tablePlantaGeneral) {
                const index = this.tabla3.findIndex(item => item.id === rowData.id);
                if (index !== -1) this.removeRowTabla3(index);
            } else {
                // Tablas de pisos
                const tableElement = table.element;
                const pisoIndex = parseInt(tableElement.id.split('-')[2]);
                const moduloIndex = this.tabla2[pisoIndex].modulos.findIndex(m => m.id === rowData.id);
                if (moduloIndex !== -1) this.removeModulo(pisoIndex, moduloIndex);
            }
        },

        // Creación optimizada de tablas
        createTables() {
            this.createTablePersonalAdmin();
            this.createTablePlantaGeneral();
            this.createTablesPisos();
        },

        createTablePersonalAdmin() {
            const el = document.getElementById("table-personal-administrativo");
            if (!el) return;

            if (this.tablePersonalAdmin) {
                this.tablePersonalAdmin.destroy();
            }

            this.tablePersonalAdmin = new Tabulator(el, {
                data: this.tabla1,
                layout: "fitColumns",
                responsiveLayout: "hide",
                pagination: false,
                columns: this.getColumnsWithActions(),
                cssClass: "tabulator-modern",
                headerSort: false,
                virtualDom: false, // Mejor rendimiento para tablas pequeñas
                persistence: false,
            });
        },

        createTablePlantaGeneral() {
            const el = document.getElementById("table-planta-general");
            if (!el) return;

            if (this.tablePlantaGeneral) {
                this.tablePlantaGeneral.destroy();
            }

            this.tablePlantaGeneral = new Tabulator(el, {
                data: this.tabla3,
                layout: "fitColumns",
                responsiveLayout: "hide",
                pagination: false,
                columns: this.getColumnsWithActions(),
                cssClass: "tabulator-modern",
                headerSort: false,
                virtualDom: false,
                persistence: false,
            });
        },

        createTablesPisos() {
            // Limpiar tablas existentes
            this.tablesPisos.forEach(table => table?.destroy());
            this.tablesPisos = [];

            this.tabla2.forEach((piso, pisoIndex) => {
                const tableId = `table-piso-${pisoIndex}`;
                const el = document.getElementById(tableId);

                if (!el) return;

                const table = new Tabulator(el, {
                    data: piso.modulos,
                    layout: "fitColumns",
                    responsiveLayout: "hide",
                    pagination: false,
                    columns: this.getColumnsWithActions(),
                    cssClass: "tabulator-modern",
                    headerSort: false,
                    virtualDom: false,
                    persistence: false,
                });

                this.tablesPisos[pisoIndex] = table;
            });
        },

        // Toggle mode optimizado
        toggleMode() {
            this.mode = this.mode === 'view' ? 'edit' : 'view';

            // Recrear solo las configuraciones de columnas, no las tablas completas
            this.$nextTick(() => {
                this.updateTablesMode();
            });
        },

        // Actualizar modo de tablas sin recrearlas
        updateTablesMode() {
            const newColumns = this.getColumnsWithActions();

            this.tablePersonalAdmin?.setColumns(newColumns);
            this.tablePlantaGeneral?.setColumns(newColumns);
            this.tablesPisos.forEach(table => table?.setColumns(newColumns));
        },

        // Generar ID único optimizado
        generateId(prefix = 'item') {
            return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        },

        // FUNCIONES OPTIMIZADAS PARA TABLA 1
        addRowTabla1() {
            const newRow = {
                id: this.generateId('tabla1'),
                ambiente: 'Nuevo Ambiente',
                uso: 'Nuevo Uso',
                cantidad: 0,
                dotacion: '50.00 Lt x per / dia',
                caudal: 0
            };

            this.calculateCaudal(newRow);
            this.tabla1.push(newRow);

            if (this.tablePersonalAdmin) {
                this.tablePersonalAdmin.addRow(newRow);
            }

            this.invalidateCache();
            this.debouncedUpdate();
        },

        removeRowTabla1(index) {
            if (index < 0 || index >= this.tabla1.length) return;

            this.tabla1.splice(index, 1);

            if (this.tablePersonalAdmin) {
                this.tablePersonalAdmin.setData(this.tabla1);
            }

            this.invalidateCache();
            this.debouncedUpdate();
        },

        // FUNCIONES OPTIMIZADAS PARA TABLA 2
        addPiso() {
            const pisoIndex = this.tabla2.length;
            const newPiso = {
                id: this.generateId('piso'),
                modulos: [{
                    id: this.generateId(`piso${pisoIndex}_mod`),
                    ambiente: 'Nuevo Modulo',
                    uso: 'Nuevo Uso',
                    cantidad: 0,
                    dotacion: '0.50 Lt x m2 / dia',
                    caudal: 0
                }]
            };

            this.calculateCaudal(newPiso.modulos[0]);
            this.tabla2.push(newPiso);

            this.$nextTick(() => {
                this.createTablesPisos();
            });

            this.invalidateCache();
            this.debouncedUpdate();
        },

        removePiso(pisoIndex) {
            if (pisoIndex < 0 || pisoIndex >= this.tabla2.length) return;

            this.tabla2.splice(pisoIndex, 1);

            this.$nextTick(() => {
                this.createTablesPisos();
            });

            this.invalidateCache();
            this.debouncedUpdate();
        },

        addModulo(pisoIndex) {
            if (pisoIndex < 0 || pisoIndex >= this.tabla2.length) return;

            const moduloIndex = this.tabla2[pisoIndex].modulos.length;
            const newModulo = {
                id: this.generateId(`piso${pisoIndex}_mod`),
                ambiente: 'Nuevo Modulo',
                uso: 'Nuevo Uso',
                cantidad: 0,
                dotacion: '0.50 Lt x m2 / dia',
                caudal: 0
            };

            this.calculateCaudal(newModulo);
            this.tabla2[pisoIndex].modulos.push(newModulo);

            if (this.tablesPisos[pisoIndex]) {
                this.tablesPisos[pisoIndex].addRow(newModulo);
            }

            this.invalidateCache();
            this.debouncedUpdate();
        },

        removeModulo(pisoIndex, moduloIndex) {
            if (pisoIndex < 0 || pisoIndex >= this.tabla2.length) return;
            if (moduloIndex < 0 || moduloIndex >= this.tabla2[pisoIndex].modulos.length) return;

            this.tabla2[pisoIndex].modulos.splice(moduloIndex, 1);

            if (this.tablesPisos[pisoIndex]) {
                this.tablesPisos[pisoIndex].setData(this.tabla2[pisoIndex].modulos);
            }

            this.invalidateCache();
            this.debouncedUpdate();
        },

        // FUNCIONES OPTIMIZADAS PARA TABLA 3
        addRowTabla3() {
            const newRow = {
                id: this.generateId('tabla3'),
                ambiente: 'Nuevo Ambiente',
                uso: 'Nuevo Uso',
                cantidad: 0,
                dotacion: '2.00 Lt x m2 / dia',
                caudal: 0
            };

            this.calculateCaudal(newRow);
            this.tabla3.push(newRow);

            if (this.tablePlantaGeneral) {
                this.tablePlantaGeneral.addRow(newRow);
            }

            this.invalidateCache();
            this.debouncedUpdate();
        },

        removeRowTabla3(index) {
            if (index < 0 || index >= this.tabla3.length) return;

            this.tabla3.splice(index, 1);

            if (this.tablePlantaGeneral) {
                this.tablePlantaGeneral.setData(this.tabla3);
            }

            this.invalidateCache();
            this.debouncedUpdate();
        },

        // CÁLCULO DE CAUDAL OPTIMIZADO
        calculateCaudal(item) {
            const cantidad = parseFloat(item.cantidad) || 0;
            const dotacionStr = item.dotacion?.toString() || '';

            const dotacionEntry = this.dotacionselect.find(d => d.label === dotacionStr);
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
        },

        // Envío optimizado de datos
        sendDataUpdate() {
            if (this._isUpdating) return;

            this._isUpdating = true;

            try {
                const data = {
                    totalCaudal: this.totalCaudal(),
                    tabla1: this.tabla1,
                    tabla2: this.tabla2,
                    tabla3: this.tabla3,
                    mode: this.mode
                };

                document.dispatchEvent(new CustomEvent('demanda-diaria-updated', {
                    detail: data
                }));
            } finally {
                this._isUpdating = false;
            }
        },

        // Cleanup cuando se destruye el componente
        destroy() {
            if (this._updateTimeout) {
                clearTimeout(this._updateTimeout);
            }

            this.tablePersonalAdmin?.destroy();
            this.tablePlantaGeneral?.destroy();
            this.tablesPisos.forEach(table => table?.destroy());

            this.tablePersonalAdmin = null;
            this.tablePlantaGeneral = null;
            this.tablesPisos = [];
        }
    }));

}

// Asegurarse de que el DOM esté completamente cargado antes de inicializar el módulo.
//document.addEventListener('DOMContentLoaded', initDemandaDiariaModule);