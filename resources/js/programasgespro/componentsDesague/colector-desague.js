// colector-desague.js - Módulo Colector Automatizado Mejorado
export function initColectorModule() {
    console.log('Inicializando módulo Colector');

    const colectorContent = document.getElementById('colector-content');
    if (!colectorContent) {
        console.error('Contenedor Colector no encontrado');
        return;
    }

    colectorContent.innerHTML = `
        <div x-data="colectorModule()" x-init="init()" class="w-full min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <!-- Header Principal -->
            <header class="bg-white/80 backdrop-blur-lg border-b border-slate-200/60 shadow-lg sticky top-0 z-50">
                <div class="max-w-7xl mx-auto px-6 py-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg">
                                <i class="fas fa-water text-white text-lg"></i>
                            </div>
                            <div>
                                <h1 class="text-2xl font-bold text-slate-800">Sistema de Colector</h1>
                                <p class="text-sm text-slate-600">Gestión de Datos Hidráulicos</p>
                            </div>
                        </div>
                        
                        <div class="flex items-center space-x-3">
                            <!-- Indicador de Modo -->
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

           <main class="max-w-full mx-auto px-2 py-4">
                <template x-for="(gradeConfig, grade) in getGradeConfigs()" :key="grade">
                    <div 
                        x-show="systemGrades[grade]"
                        x-transition:enter="transition ease-out duration-500"
                        x-transition:enter-start="opacity-0 transform translate-y-8 scale-95"
                        x-transition:enter-end="opacity-100 transform translate-y-0 scale-100"
                        class="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-8">
                        
                        <!-- Encabezado -->
                        <div 
                            class="px-6 py-4"
                            :class="{
                                'bg-gradient-to-r from-emerald-800 to-emerald-700': grade === 'inicial',
                                'bg-gradient-to-r from-blue-800 to-blue-700': grade === 'primaria',
                                'bg-gradient-to-r from-purple-800 to-purple-700': grade === 'secundaria'
                            }">
                            <div class="flex items-center justify-between">
                                <h2 class="text-xl font-bold text-white" x-text="'AMEXO 08. COLECTORES - ' + gradeConfig.title.toUpperCase()"></h2>
                                <div class="flex items-center space-x-3 text-sm text-white/80">
                                    <span>Filas: <span class="font-semibold text-white" x-text="getRowCount(grade)"></span></span>
                                    <span class="w-1 h-1 bg-white rounded-full"></span>
                                    <span>Actualizado: <span class="font-semibold text-white" x-text="lastUpdated"></span></span>
                                    <template x-if="mode === 'edit'">
                                        <div class="flex space-x-2">
                                            <button 
                                                @click="addRow(grade)"
                                                class="group inline-flex items-center px-3 py-1.5 text-sm font-semibold text-emerald-700 bg-emerald-50 border-2 border-emerald-200 rounded-lg hover:bg-emerald-100 hover:border-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/25 transition-all duration-200 transform hover:scale-105">
                                                <i class="fas fa-plus mr-2 group-hover:rotate-90 transition-transform duration-200"></i>
                                                Agregar Fila
                                            </button>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </div>

                        <!-- Tabla -->
                        <div class="p-6">
                            <div :id="'tabulator-' + grade" class="border border-slate-200 rounded-lg overflow-hidden"></div>
                        </div>

                        <!-- Footer -->
                        <div class="bg-gradient-to-r from-slate-100 to-slate-50 px-6 py-3 border-t border-slate-200">
                            <div class="flex items-center justify-between text-sm">
                                <div class="flex items-center space-x-4 text-slate-600">
                                    <div class="flex items-center space-x-2">
                                        <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span>Estado: <span class="font-semibold text-slate-900">Activo</span></span>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <i class="fas fa-clock text-slate-400"></i>
                                        <span>Actualizado: <span class="font-semibold text-slate-900" x-text="lastUpdated"></span></span>
                                    </div>
                                </div>
                                <div class="flex items-center space-x-4 text-slate-600">
                                    <div class="flex items-center space-x-2">
                                        <i class="fas fa-table text-slate-400"></i>
                                        <span>Filas: <span class="font-semibold text-slate-900" x-text="getRowCount(grade)"></span></span>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <i class="fas fa-calculator text-slate-400"></i>
                                        <span>Cálculos: <span class="font-semibold text-slate-900">Auto</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </template>
            </main>
        </div>
    `;

    Alpine.data('colectorModule', () => ({
        // Estado del módulo
        mode: 'view', // 'view' | 'edit'
        systemGrades: {
            inicial: true,
            primaria: false,
            secundaria: false
        },
        tables: {
            inicial: null,
            primaria: null,
            secundaria: null
        },
        // DATOS PERSISTENTES - Se mantienen entre cambios de modo y grados
        persistentData: {
            inicial: [],
            primaria: [],
            secundaria: []
        },
        lastUpdated: 'Ahora',
        nextIds: {
            inicial: 1,
            primaria: 1,
            secundaria: 1
        },
        // Flag para evitar reseteo de datos
        dataInitialized: {
            inicial: false,
            primaria: false,
            secundaria: false
        },

        // Configuración de dimensiones
        dimensionConfig: {
            thresholds: [0.61, 0.81, 1.01, 1.21],
            dimensions: [
                { valor: 0.61, value: '0.25m x 0.50m (10" x 20")', label: 'C.R.' },
                { valor: 0.81, value: '0.30m x 0.60m (12" x 24")', label: 'C.R.' },
                { valor: 1.01, value: '0.45m x 0.60m (18" x 24")', label: 'C.R.' },
                { valor: 1.21, value: '0.60m x 0.60m (24" x 24")', label: 'C.R.' },
                { valor: 1.2, value: 'Diametro D=1.20m', label: 'B.z.' }
            ]
        },

        // Datos iniciales por grado (solo se cargan una vez)
        initialData: {
            inicial: [
                {
                    id: 1,
                    tramo: 'C.R.1 - C.R.2',
                    longitud: 1.41,
                    ud: 5,
                    diametro: 'Ø4',
                    pendiente: '2.13%',
                    cr1_num: 'C.R.1',
                    cr1_nval: 1,
                    cr1_ct: 0.15,
                    cr1_cf: -0.15,
                    cr1_h: 0.30,
                    cr1_dim: '0.25m x 0.50m (10" x 20")',
                    cr2_num: 'C.R.2',
                    cr2_nval: 2,
                    cr2_ct: 0.15,
                    cr2_cf: -0.18,
                    cr2_h: 0.33,
                    cr2_dim: '0.25m x 0.50m (10" x 20")',
                    isStatic: false
                }
            ],
            primaria: [
                {
                    id: 1,
                    tramo: 'C.R.1 - C.R.2',
                    longitud: 1.53,
                    ud: 24,
                    diametro: 'Ø4',
                    pendiente: '1.96%',
                    cr1_num: 'C.R.1',
                    cr1_nval: 1,
                    cr1_ct: 0.15,
                    cr1_cf: -0.30,
                    cr1_h: 0.45,
                    cr1_dim: '0.25m x 0.50m (10" x 20")',
                    cr2_num: 'C.R.2',
                    cr2_nval: 2,
                    cr2_ct: 0.15,
                    cr2_cf: -0.33,
                    cr2_h: 0.48,
                    cr2_dim: '0.25m x 0.50m (10" x 20")',
                    isStatic: false
                },
                {
                    id: 2,
                    tramo: 'C.R.2 - C.R.3',
                    longitud: 1.25,
                    ud: 120,
                    diametro: 'Ø4',
                    pendiente: '1.60%',
                    cr1_num: 'C.R.2',
                    cr1_nval: 2,
                    cr1_ct: 0.15,
                    cr1_cf: -0.33,
                    cr1_h: 0.48,
                    cr1_dim: '0.25m x 0.50m (10" x 20")',
                    cr2_num: 'C.R.3',
                    cr2_nval: 3,
                    cr2_ct: 0.15,
                    cr2_cf: -0.35,
                    cr2_h: 0.50,
                    cr2_dim: '0.25m x 0.50m (10" x 20")',
                    isStatic: false
                }
            ],
            secundaria: [
                {
                    id: 1,
                    tramo: 'C.R.1 - C.R.2',
                    longitud: 1.53,
                    ud: 24,
                    diametro: 'Ø4',
                    pendiente: '1.96%',
                    cr1_num: 'C.R.1',
                    cr1_nval: '',
                    cr1_ct: 0.15,
                    cr1_cf: -0.30,
                    cr1_h: 0.45,
                    cr1_dim: '0.25m x 0.50m (10" x 20")',
                    cr2_num: 'C.R.2',
                    cr2_nval: '',
                    cr2_ct: 0.15,
                    cr2_cf: -0.33,
                    cr2_h: 0.48,
                    cr2_dim: '0.25m x 0.50m (10" x 20")',
                    isStatic: false
                }
            ]
        },

        async init() {
            //console.log('Módulo Colector inicializado');

            // INICIALIZAR DATOS PERSISTENTES SOLO UNA VEZ
            this.initializePersistentData();

            // Configurar listeners para cambios de grados
            document.addEventListener('DOT-data-updated', (event) => {
                //console.log(event);
                this.handleGradeChange(event.detail.grades);
            });

            // Cargar datos del sistema principal
            this.loadSystemData();

            // Configurar event listeners
            this.setupEventListeners();

            // Esperar a que Tabulator esté disponible
            await this.waitForTabulator();

            // Crear tablas
            this.createTables();

            // Enviar datos iniciales
            this.sendTableData();
        },

        // INICIALIZAR DATOS PERSISTENTES - Solo se ejecuta una vez
        initializePersistentData() {
            Object.keys(this.initialData).forEach(grade => {
                if (!this.dataInitialized[grade] && this.persistentData[grade].length === 0) {
                    this.persistentData[grade] = this.initialData[grade].map(row => ({ ...row }));
                    // Establecer nextId basado en los datos iniciales
                    const maxId = Math.max(...this.initialData[grade].map(row => row.id || 0));
                    this.nextIds[grade] = maxId + 1;
                    this.dataInitialized[grade] = true;
                    //console.log(`Datos iniciales cargados para ${grade}:`, this.persistentData[grade]);
                }
            });
        },

        getGradeConfigs() {
            return {
                inicial: { title: "Inicial" },
                primaria: { title: "Primaria" },
                secundaria: { title: "Secundaria" }
            };
        },

        // Cargar datos del sistema principal
        loadSystemData() {
            const mainSystem = Alpine.store('mainSystem');
            if (mainSystem) {
                this.systemGrades = { ...mainSystem.systemData.grades };
            }
        },

        // Configurar event listeners
        setupEventListeners() {
            // Escuchar cambios de grado desde el sistema principal
            document.addEventListener('system-grade-updated', (event) => {
                this.handleGradeChange(event.detail.grades);
            });

            // Escuchar cambios de datos del sistema
            document.addEventListener('system-data-changed', (event) => {
                this.handleSystemDataChange(event.detail);
            });
        },

        // Manejar cambios de grado
        handleGradeChange(grades) {
            console.log('Grados actualizados en Colector:', grades);

            // GUARDAR DATOS ACTUALES antes del cambio
            this.saveCurrentTableData();

            // Actualizar grados del sistema
            this.systemGrades = { ...grades };

            // Recrear tablas según los nuevos grados
            setTimeout(() => {
                this.createTables();
                this.sendTableData();
            }, 100);
        },

        // GUARDAR DATOS ACTUALES DE LAS TABLAS CORRECTAMENTE
        saveCurrentTableData() {
            Object.keys(this.tables).forEach(grade => {
                if (this.tables[grade]) {
                    const currentData = this.tables[grade].getData();
                    // GUARDAR SOLO LAS FILAS NO ESTÁTICAS Y PRESERVAR LOS DATOS
                    const nonStaticData = currentData.filter(row => !row.isStatic);
                    this.persistentData[grade] = nonStaticData.map(row => ({ ...row }));
                    console.log(`Datos guardados para ${grade}:`, this.persistentData[grade]);
                }
            });
        },

        // Manejar cambios de datos del sistema
        handleSystemDataChange(systemData) {
            console.log('Datos del sistema actualizados:', systemData);
            if (systemData.grades) {
                this.handleGradeChange(systemData.grades);
            }
        },

        waitForTabulator() {
            return new Promise((resolve) => {
                const checkTabulator = () => {
                    if (typeof Tabulator !== 'undefined') {
                        resolve();
                    } else {
                        setTimeout(checkTabulator, 100);
                    }
                };
                checkTabulator();
            });
        },

        // Crear todas las tablas según los grados seleccionados
        createTables() {
            Object.keys(this.systemGrades).forEach(grade => {
                if (this.systemGrades[grade]) {
                    this.createTable(grade);
                }
            });
        },

        // Crear tabla específica por grado
        createTable(grade) {
            const tableContainer = document.getElementById(`tabulator-${grade}`);
            if (!tableContainer) {
                console.error(`Contenedor de tabla ${grade} no encontrado`);
                return;
            }

            // Destruir tabla existente si existe
            if (this.tables[grade]) {
                this.tables[grade].destroy();
            }

            // USAR DATOS PERSISTENTES + FILAS ESTÁTICAS AL FINAL
            const persistentRows = [...this.persistentData[grade]];
            const staticRows = this.getStaticRows(grade);
            // GARANTIZAR QUE LAS FILAS ESTÁTICAS SIEMPRE VAYAN AL FINAL
            const data = [...persistentRows, ...staticRows];

            //console.log(`Creando tabla ${grade} con ${persistentRows.length} filas persistentes y ${staticRows.length} filas estáticas`);

            this.tables[grade] = new Tabulator(tableContainer, {
                data: data,
                columns: this.getColumns(grade),
                layout: "fitColumns",
                height: "auto",
                resizableColumns: true,
                selectable: this.mode === 'edit',
                cellEdited: (cell) => this.onCellEdited(cell, grade),
                rowAdded: (row) => {
                    this.updatePersistentData(grade);
                    this.updateLastUpdated();
                    this.sendTableData();
                },
                rowDeleted: (row) => {
                    this.updatePersistentData(grade);
                    this.updateLastUpdated();
                    this.sendTableData();
                },
                tooltips: true,
                columnCalcs: "both"
            });

            //console.log(`Tabla ${grade} creada exitosamente con ${persistentRows.length} filas persistentes`);
        },

        // ACTUALIZAR DATOS PERSISTENTES cuando hay cambios - MEJORADO
        updatePersistentData(grade) {
            if (this.tables[grade]) {
                const currentData = this.tables[grade].getData();
                const nonStaticData = currentData.filter(row => !row.isStatic);
                this.persistentData[grade] = nonStaticData.map(row => ({ ...row }));
                console.log(`Datos persistentes actualizados para ${grade}:`, this.persistentData[grade]);
            }
        },

        // Obtener columnas para cada grado
        getColumns(grade) {
            const baseColumns = [
                {
                    title: "TRAMO",
                    field: "tramo",
                    editor: false,
                    headerSort: false
                },
                {
                    title: "LONGITUD (m)",
                    field: "longitud",
                    editor: this.mode === 'edit' ? "number" : false,
                    validator: "numeric",
                    formatter: (cell) => this.formatNumber(cell.getValue(), 2),
                    headerSort: false,
                    cellEdited: (cell) => {
                        const row = cell.getRow();
                        const data = row.getData();
                        const pendiente = ((((data.cr1_cf || 0) - (data.cr2_cf || 0)) / (data.longitud || 1)) * 100).toFixed(2);
                        row.update({ pendiente: pendiente + '%' });
                        this.updatePersistentData(grade);
                        this.sendTableData();
                    }
                },
                {
                    title: "UD",
                    field: "ud",
                    editor: this.mode === 'edit' ? "number" : false,
                    validator: "integer",
                    headerSort: false,
                    cellEdited: (cell) => {
                        const row = cell.getRow();
                        const data = row.getData();
                        const diametro = ((data.ud || 0) > 180) ? "Ø6" : "Ø4";
                        row.update({ diametro: diametro });
                        this.updatePersistentData(grade);
                        this.sendTableData();
                    }
                },
                {
                    title: "DIAMETRO",
                    field: "diametro",
                    editor: false,
                    headerSort: false
                },
                {
                    title: "PENDIENTE",
                    field: "pendiente",
                    editor: false,
                    headerSort: false
                }
            ];

            const cajaColumns = this.getCajaRegistroColumns(grade);

            const actionColumn = {
                title: "ACCIONES",
                field: "actions",
                hozAlign: "center",
                headerSort: false,
                visible: this.mode === 'edit',
                cellClick: (e, cell) => {
                    const rowData = cell.getRow().getData();
                    if (!rowData.isStatic) {
                        this.deleteRow(cell.getRow(), grade);
                    }
                },
                formatter: (cell) => {
                    const rowData = cell.getRow().getData();
                    return rowData.isStatic ?
                        '<span class="text-gray-400 text-xs">Estático</span>' :
                        '<button class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"><i class="fas fa-trash"></i></button>';
                }
            };

            return [...baseColumns, ...cajaColumns, actionColumn];
        },

        // Obtener columnas específicas para cajas de registro
        getCajaRegistroColumns(grade) {
            return [
                {
                    title: "CAJA REGISTRO (INICIAL)",
                    columns: [
                        {
                            title: "N°",
                            field: "cr1_num",
                            editor: false,
                            headerSort: false
                        },
                        {
                            title: "N°",
                            field: "cr1_nval",
                            editor: this.mode === 'edit' ? "input" : false,
                            headerSort: false,
                            cellEdited: (cell) => {
                                this.updateTramoField(cell);
                                this.updatePersistentData(grade);
                                this.sendTableData();
                            }
                        },
                        {
                            title: "CT (m)",
                            field: "cr1_ct",
                            editor: this.mode === 'edit' ? "number" : false,
                            validator: "numeric",
                            formatter: (cell) => this.formatNumber(cell.getValue(), 2),
                            headerSort: false,
                            cellEdited: (cell) => {
                                this.updateCajaRegistroData(cell, 'cr1');
                                this.updatePersistentData(grade);
                                this.sendTableData();
                            }
                        },
                        {
                            title: "CF (m)",
                            field: "cr1_cf",
                            editor: this.mode === 'edit' ? "number" : false,
                            validator: "numeric",
                            formatter: (cell) => this.formatNumber(cell.getValue(), 2),
                            headerSort: false,
                            cellEdited: (cell) => {
                                this.updateCajaRegistroData(cell, 'cr1');
                                this.updatePersistentData(grade);
                                this.sendTableData();
                            }
                        },
                        {
                            title: "H (m)",
                            field: "cr1_h",
                            editor: false,
                            formatter: (cell) => this.formatNumber(cell.getValue(), 2),
                            headerSort: false
                        },
                        {
                            title: "DIMENSIONES",
                            field: "cr1_dim",
                            editor: false,
                            headerSort: false
                        }
                    ]
                },
                {
                    title: "CAJA REGISTRO (FINAL)",
                    columns: [
                        {
                            title: "N°",
                            field: "cr2_num",
                            editor: false,
                            headerSort: false
                        },
                        {
                            title: "N°",
                            field: "cr2_nval",
                            editor: this.mode === 'edit' ? "input" : false,
                            headerSort: false,
                            cellEdited: (cell) => {
                                this.updateTramoField(cell);
                                this.updatePersistentData(grade);
                                this.sendTableData();
                            }
                        },
                        {
                            title: "CT (m)",
                            field: "cr2_ct",
                            editor: this.mode === 'edit' ? "number" : false,
                            validator: "numeric",
                            formatter: (cell) => this.formatNumber(cell.getValue(), 2),
                            headerSort: false,
                            cellEdited: (cell) => {
                                this.updateCajaRegistroData(cell, 'cr2');
                                this.updatePersistentData(grade);
                                this.sendTableData();
                            }
                        },
                        {
                            title: "CF/CLL (m)",
                            field: "cr2_cf",
                            editor: this.mode === 'edit' ? "number" : false,
                            validator: "numeric",
                            formatter: (cell) => this.formatNumber(cell.getValue(), 2),
                            headerSort: false,
                            cellEdited: (cell) => {
                                this.updateCajaRegistroData(cell, 'cr2');
                                this.updatePersistentData(grade);
                                this.sendTableData();
                            }
                        },
                        {
                            title: "H (m)",
                            field: "cr2_h",
                            editor: false,
                            formatter: (cell) => this.formatNumber(cell.getValue(), 2),
                            headerSort: false
                        },
                        {
                            title: "DIMENSIONES",
                            field: "cr2_dim",
                            editor: false,
                            headerSort: false
                        }
                    ]
                }
            ];
        },

        // Actualizar campo tramo cuando cambian los valores cr1_nval o cr2_nval
        updateTramoField(cell) {
            const row = cell.getRow();
            const data = row.getData();

            // Construcción del tramo
            const cr1_complete = `${(data.cr1_num || '').trim()}${data.cr1_nval || ''}`;
            const cr2_complete = `${(data.cr2_num || '').trim()}${data.cr2_nval || ''}`;
            const tramo = `${cr1_complete} - ${cr2_complete}`;

            row.update({ tramo: tramo });
        },

        // Actualizar datos de caja de registro (altura, dimensiones, etc.)
        updateCajaRegistroData(cell, prefix) {
            const row = cell.getRow();
            const data = row.getData();

            // Calcular altura
            const ct = parseFloat(data[`${prefix}_ct`]) || 0;
            const cf = parseFloat(data[`${prefix}_cf`]) || 0;
            const altura = ct - cf;

            // Buscar dimensión correspondiente
            const dimMatch = this.dimensionConfig.dimensions.find(d => Math.abs(altura) < d.valor);

            // Determinar valores
            const dimension = Math.abs(altura) === 0 ? '' : (dimMatch ? dimMatch.value : 'No definido');
            const numPrefix = (dimMatch && dimMatch.label === "C.R.") ? "C.R." : "B.z.";

            // Actualizar datos
            const updateData = {
                [`${prefix}_h`]: parseFloat(altura.toFixed(2)),
                [`${prefix}_dim`]: dimension,
                [`${prefix}_num`]: numPrefix
            };

            row.update(updateData);

            // Actualizar tramo también
            this.updateTramoField(cell);
        },

        // Obtener filas estáticas - SIEMPRE AL FINAL
        getStaticRows(grade) {
            return [
                {
                    id: `static_${grade}_bz1`,
                    tramo: "B.z 1 - CAJA FINAL",
                    longitud: 0,
                    ud: 0,
                    diametro: "",
                    pendiente: "0%",
                    cr1_num: "B.z 1",
                    cr1_nval: 1,
                    cr1_ct: 0,
                    cr1_cf: 0,
                    cr1_h: 0,
                    cr1_dim: "Diametro D=1.20m",
                    cr2_num: "CAJA FINAL",
                    cr2_nval: "",
                    cr2_ct: 0,
                    cr2_cf: 0,
                    cr2_h: 0,
                    cr2_dim: "",
                    isStatic: true
                },
                {
                    id: `static_${grade}_final`,
                    tramo: "CAJA FINAL - CONEXIÓN",
                    longitud: 0,
                    ud: 0,
                    diametro: "",
                    pendiente: "0%",
                    cr1_num: "CAJA FINAL",
                    cr1_nval: 0,
                    cr1_ct: 0,
                    cr1_cf: 0,
                    cr1_h: 0,
                    cr1_dim: "",
                    cr2_num: "CONEXIÓN",
                    cr2_nval: "",
                    cr2_ct: 0,
                    cr2_cf: 0,
                    cr2_h: 0,
                    cr2_dim: "",
                    isStatic: true
                }
            ];
        },

        // ALTERNAR MODO VISTA/EDICIÓN - CORREGIDO PARA PRESERVAR DATOS
        toggleMode() {
            // GUARDAR DATOS ANTES DEL CAMBIO DE MODO
            this.saveCurrentTableData();

            // Cambiar modo
            this.mode = this.mode === 'view' ? 'edit' : 'view';

            // Recrear tablas con los datos preservados
            this.createTables();
            this.sendTableData();

            console.log(`Modo cambiado a: ${this.mode}`);
        },

        // AGREGAR NUEVA FILA - MEJORADO PARA INSERTAR ANTES DE FILAS ESTÁTICAS
        addRow(grade) {
            if (this.mode !== 'edit') return;

            if (this.systemGrades[grade] && this.tables[grade]) {
                const newRow = this.createNewRow(grade);

                // GUARDAR DATOS ACTUALES PRIMERO
                this.saveCurrentTableData();

                // AGREGAR A DATOS PERSISTENTES (antes de las estáticas)
                this.persistentData[grade].push(newRow);

                // RECREAR LA TABLA PARA MANTENER EL ORDEN CORRECTO
                this.createTable(grade);

                this.updateLastUpdated();
                this.sendTableData();

                console.log(`Nueva fila agregada al grado ${grade}:`, newRow);
            }
        },

        // Crear nueva fila
        createNewRow(grade) {
            const newRow = {
                id: Date.now(),
                tramo: `C.R.${this.nextIds[grade]} - C.R.${this.nextIds[grade] + 1}`,
                longitud: 0,
                ud: 0,
                diametro: 'Ø4',
                pendiente: '0%',
                cr1_num: 'C.R.',
                cr1_nval: this.nextIds[grade].toString(),
                cr1_ct: 0,
                cr1_cf: 0,
                cr1_h: 0,
                cr1_dim: '0.25m x 0.50m (10" x 20")',
                cr2_num: 'C.R.',
                cr2_nval: (this.nextIds[grade] + 1).toString(),
                cr2_ct: 0,
                cr2_cf: 0,
                cr2_h: 0,
                cr2_dim: '0.25m x 0.50m (10" x 20")',
                isStatic: false
            };

            this.nextIds[grade] += 2; // Incrementar para la próxima fila
            return newRow;
        },

        // Eliminar fila
        deleteRow(row, grade) {
            const rowData = row.getData();
            if (!rowData.isStatic) {
                // Eliminar de la tabla
                row.delete();

                // Actualizar datos persistentes
                this.updatePersistentData(grade);

                this.updateLastUpdated();
                this.sendTableData();

                console.log(`Fila eliminada del grado ${grade}:`, rowData);
            }
        },

        // Manejar edición de celda
        onCellEdited(cell, grade) {
            this.updatePersistentData(grade);
            this.updateLastUpdated();
            this.sendTableData();
        },

        // Formatear números
        formatNumber(value, decimals = 2) {
            return typeof value === 'number' ? value.toFixed(decimals) : (value || '0.00');
        },

        // Obtener conteo de filas NO ESTÁTICAS
        getRowCount(grade) {
            return this.persistentData[grade] ? this.persistentData[grade].length : 0;
        },

        // Actualizar timestamp
        updateLastUpdated() {
            this.lastUpdated = new Date().toLocaleTimeString();
        },

        // Enviar datos de todas las tablas
        sendTableData() {
            const exportData = {};

            Object.keys(this.systemGrades).forEach(grade => {
                if (this.systemGrades[grade]) {
                    // ENVIAR SOLO DATOS PERSISTENTES (sin filas estáticas)
                    exportData[grade] = this.persistentData[grade];
                }
            });

            //console.log("Datos exportados:", exportData);
            document.dispatchEvent(new CustomEvent('colector-data-updated', {
                detail: exportData
            }));
        }
    }));
}

// Inicializar cuando el DOM esté listo
// document.addEventListener('DOMContentLoaded', () => {
//     // Esperar a que el sistema principale esté listo
//     setTimeout(initColectorModule, 100);
// });