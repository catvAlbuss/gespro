export function initUVModule() {
    console.log('Inicializando módulo UV');

    const uvContent = document.getElementById('uv-content');

    if (!uvContent) {
        console.error('Contenedor UV no encontrado');
        return;
    }

    uvContent.innerHTML = `
        <div x-data="uvModule" class="max-w-full mx-auto p-4">
            <!-- Header -->
            <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 mb-4 shadow-xl">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-base font-bold text-white mb-2">ANEXO 10. CALCULO DE LAS VENTILACIONES</h1>
                        <p class="text-blue-100">Sistema de cálculo para instituciones educativas</p>
                    </div>
                    <button
                        @click="toggleMode()"
                        :class="mode === 'edit' ? 'bg-green-500 hover:bg-green-600' : 'bg-white hover:bg-gray-50'"
                        class="px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        :class="mode === 'edit' ? 'text-white' : 'text-gray-800'">
                        <span class="flex items-center space-x-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                      :d="mode === 'edit' ? 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' : 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'"></path>
                            </svg>
                            <span x-text="mode === 'edit' ? 'Modo Vista' : 'Modo Editor'"></span>
                        </span>
                    </button>
                </div>
            </div>

            <!-- Tabla Dimensiones de Tubos -->
            <div class="bg-white rounded-2xl shadow-lg border border-gray-100 mb-4">
                <div class="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-t-2xl p-2">
                    <div class="flex items-center justify-between">
                        <h2 class="text-base font-bold text-white flex items-center">
                            <svg class="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            DIMENSIONES DE LOS TUBOS DE VENTILACION
                        </h2>
                        <button 
                            x-show="mode === 'edit'" 
                            @click="addDimensionRow()"
                            class="bg-white text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors font-semibold shadow-md">
                            + Agregar Fila
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    <div id="dimensions-table"></div>
                </div>
            </div>

            <!-- Tablas por Grado -->
            <div x-show="hasSelectedGrades()" x-transition class="space-y-8">
                <h2 class="text-2xl font-bold text-gray-800 flex items-center">
                    <svg class="w-7 h-7 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    Cálculos por Grado Educativo
                </h2>

                <template x-for="grade in getSelectedGradesList()" :key="grade">
                    <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div class="bg-gradient-to-r from-green-500 to-teal-600 p-2">
                            <div class="flex items-center justify-between">
                                <h3 class="text-base font-bold text-white flex items-center" x-text="'APARATOS VENTILADOS - ' + getGradeName(grade).toUpperCase()"></h3>
                                <button 
                                    x-show="mode === 'edit'"
                                    @click="addModuleRow(grade)" 
                                    class="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors font-semibold shadow-md">
                                    + Agregar Módulo
                                </button>
                            </div>
                        </div>
                        <div class="p-6">
                            <div :id="'grade-table-uv-' + grade"></div>
                        </div>
                    </div>
                </template>
            </div>

            <!-- Estado vacío -->
            <div x-show="!hasSelectedGrades()" x-transition class="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg">
                <div class="max-w-md mx-auto">
                    <svg class="mx-auto h-16 w-16 text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <h3 class="text-2xl font-bold text-gray-900 mb-3">Selecciona Grados Educativos</h3>
                    <p class="text-gray-600 mb-6">Para comenzar con los cálculos, selecciona al menos un grado educativo en la configuración superior.</p>
                    <button @click="systemGrades.inicial = true; updateTables()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                        Seleccionar Inicial
                    </button>
                </div>
            </div>
        </div>
    `;

    // Inicializar componente Alpine.js
    Alpine.data('uvModule', () => ({
        mode: 'view',
        systemGrades: { inicial: true, primaria: false, secundaria: false },
        accesorios: [],
        gradeData: {
            inicial: [],
            primaria: [],
            secundaria: []
        },
        dimensionRows: [
            { id: Date.now() + 1, diametro: '2', tipo: 'pulg.', size2: '60', size3: '', size4: '' },
            { id: Date.now() + 2, diametro: '2', tipo: 'pulg.', size2: '45', size3: '-', size4: '-' },
            { id: Date.now() + 3, diametro: '3', tipo: 'pulg.', size2: '30', size3: '180', size4: '-' },
            { id: Date.now() + 4, diametro: '3', tipo: 'pulg.', size2: '18', size3: '150', size4: '-' },
            { id: Date.now() + 5, diametro: '3', tipo: 'pulg.', size2: '15', size3: '120', size4: '-' },
            { id: Date.now() + 6, diametro: '4', tipo: 'pulg.', size2: '11', size3: '78', size4: '900' },
            { id: Date.now() + 7, diametro: '4', tipo: 'pulg.', size2: '9', size3: '75', size4: '270' },
            { id: Date.now() + 8, diametro: '4', tipo: 'pulg.', size2: '6', size3: '54', size4: '210' }
        ],
        tables: {
            dimensions: null,
            grades: {},
            inicial: { modules: [] },
            primaria: { modules: [] },
            secundaria: { modules: [] }
        },
        idCounter: Date.now(),

        init() {
            console.log('Inicializando UV Module...');
            this.loadSystemData();
            this.setupEventListeners();

            // Datos de ejemplo para accesorios si no existen
            if (!this.accesorios.length) {
                this.accesorios = [
                    { key: 'lavatorio', label: 'LAVATORIO', totalCategoryCount: 1.5 },
                    { key: 'inodoro', label: 'INODORO', totalCategoryCount: 6.0 },
                    { key: 'urinario', label: 'URINARIO', totalCategoryCount: 4.0 },
                    { key: 'ducha', label: 'DUCHA', totalCategoryCount: 2.0 }
                ];
            }

            // Inicializar datos con estructura padre-hijo por defecto
            this.initializeDefaultGradeData();

            // Retrasar la inicialización de tablas
            this.$nextTick(() => {
                setTimeout(() => {
                    console.log('Inicializando tablas con systemGrades:', this.systemGrades);
                    this.initializeTables();
                }, 200);
            });
        },

        // Generar ID único
        generateUniqueId() {
            return ++this.idCounter;
        },

        initializeDefaultGradeData() {
            const grades = ['inicial', 'primaria', 'secundaria'];

            grades.forEach(grade => {
                if (!this.gradeData[grade].length) {
                    // Crear estructura padre-hijo por defecto
                    const parentModule = {
                        id: this.generateUniqueId(),
                        tipo: 'module',
                        nivel: `MODULO SS.HH. ${grade.toUpperCase()}`,
                        descripcion: `Servicios higiénicos nivel ${grade}`,
                        ...this.createAccessoriesObject(),
                        totalUD: 0,
                        diametroVentilacion: '3"',
                        _children: [
                            {
                                id: this.generateUniqueId(),
                                tipo: 'child',
                                nivel: `SS.HH. PRINCIPAL`,
                                descripcion: `Servicios higiénicos principales ${grade}`,
                                ...this.createAccessoriesObject({
                                    lavatorio: grade === 'inicial' ? 2 : grade === 'primaria' ? 4 : 6,
                                    inodoro: grade === 'inicial' ? 2 : grade === 'primaria' ? 4 : 6
                                }),
                                totalUD: 0,
                                diametroVentilacion: '2"',
                                _children: []
                            }
                        ]
                    };

                    this.gradeData[grade] = [parentModule];
                }
            });

            // Calcular totales UD para todos los grados
            grades.forEach(grade => {
                this.calculateAllUD(grade);
            });
        },

        createAccessoriesObject(values = {}) {
            const obj = {};
            this.accesorios.forEach(acc => {
                obj[`acc_${acc.key}`] = values[acc.key] || 0;
            });
            return obj;
        },

        loadSystemData() {
            const mainSystem = Alpine.store('mainSystem');
            if (mainSystem && mainSystem.systemData) {
                this.systemGrades = { ...mainSystem.systemData.grades };
            }
        },

        setupEventListeners() {
            document.addEventListener('uddesague-data-updated', (event) => {
                console.log('Accesorios recibidos:', event.detail.accesorios);
                this.accesorios = event.detail.accesorios || [];
                this.updateTables();
            });

            document.addEventListener('system-grade-updated', (event) => {
                this.handleGradeChange(event.detail.grades);
            });

            document.addEventListener('system-data-changed', (event) => {
                this.handleSystemDataChange(event.detail);
            });
        },

        handleGradeChange(grades) {
            console.log('Grados actualizados:', grades);
            this.systemGrades = { ...grades };
            this.$nextTick(() => {
                setTimeout(() => {
                    this.updateTables();
                }, 100);
            });
        },

        handleSystemDataChange(data) {
            console.log('Datos del sistema cambiados:', data);
            if (data.accesorios) {
                this.accesorios = [...data.accesorios];
            }
            this.$nextTick(() => {
                setTimeout(() => {
                    this.updateTables();
                }, 100);
            });
        },

        initializeTables() {
            console.log('Creando tablas...');
            this.createDimensionsTable();
            this.updateTables();
        },

        createDimensionsTable() {
            const container = document.getElementById('dimensions-table');
            if (!container) {
                console.error('Contenedor dimensions-table no encontrado');
                return;
            }

            const columns = [
                {
                    title: "DIAMETRO DESAGÜE",
                    field: "diametro",
                    editor: this.mode === 'edit' ? "input" : false,
                },
                {
                    title: "TIPO",
                    field: "tipo",
                    editor: this.mode === 'edit' ? "input" : false,
                },
                {
                    title: "2\"",
                    field: "size2",
                    editor: this.mode === 'edit' ? "input" : false,
                    hozAlign: "center",
                },
                {
                    title: "3\"",
                    field: "size3",
                    editor: this.mode === 'edit' ? "input" : false,
                    hozAlign: "center",
                },
                {
                    title: "4\"",
                    field: "size4",
                    editor: this.mode === 'edit' ? "input" : false,
                    hozAlign: "center",
                }
            ];

            if (this.mode === 'edit') {
                columns.push({
                    title: "ACCIONES",
                    field: "actions",
                    width: 120,
                    hozAlign: "center",
                    formatter: () => `<button class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors delete-dimension-btn text-xs">🗑️ Eliminar</button>`,
                    cellClick: (e, cell) => {
                        if (e.target.classList.contains('delete-dimension-btn')) {
                            this.removeDimensionRow(cell.getRow());
                        }
                    }
                });
            }

            if (this.tables.dimensions) {
                this.tables.dimensions.destroy();
            }

            this.tables.dimensions = new Tabulator(container, {
                data: this.dimensionRows,
                columns: columns,
                layout: "fitColumns",
                responsiveLayout: "hide",
                height: 'auto',
                pagination: false,
                movableColumns: true,
                resizableRows: true,
                headerSort: false
            });

            console.log('Tabla de dimensiones creada');
        },

        updateTables() {
            console.log('Actualizando tablas para grados seleccionados:', this.getSelectedGradesList());
            this.getSelectedGradesList().forEach(grade => {
                console.log(`Procesando grado: ${grade}`);
                this.createGradeTable(grade);
            });
        },

        createGradeTable(grade) {
            console.log(`Intentando crear tabla para ${grade}`);
            const container = document.getElementById(`grade-table-uv-${grade}`);
            if (!container) {
                console.warn(`Contenedor grade-table-uv-${grade} no encontrado. Es probable que el grado no esté seleccionado.`);
                return;
            }

            if (!this.accesorios.length) {
                console.warn('No hay accesorios definidos');
                return;
            }

            // Construir columnas con estructura compleja
            const columns = [
                {
                    title: 'NIVEL',
                    field: 'nivel',
                    editor: this.mode === 'edit' ? 'input' : false,
                    headerSort: false,
                    cellEdited: (cell) => this.handleGradeCellEdit(grade, cell),
                },
                {
                    title: 'DESCRIPCION',
                    field: 'descripcion',
                    editor: this.mode === 'edit' ? 'input' : false,
                    headerSort: false,
                    cellEdited: (cell) => this.handleGradeCellEdit(grade, cell),
                },
                {
                    title: 'APARATOS VENTILADOS',
                    headerHozAlign: 'center',
                    columns: this.accesorios.map(acc => ({
                        title: `<div class='text-xs font-bold uppercase'>${acc.label}</div><div class='text-xs font-semibold'>${acc.totalCategoryCount} U.D.</div>`,
                        field: `acc_${acc.key}`,
                        editor: this.mode === 'edit' ? 'number' : false,
                        editorParams: { min: 0, step: 0.1 },
                        formatter: (cell) => {
                            const value = parseFloat(cell.getValue()) || 0;
                            return value > 0 ? value.toFixed(1) : '-';
                        },
                        // bottomCalc: (values, data, calcParams) => {
                        //     const total = values.reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
                        //     return total.toFixed(1);
                        // },
                        cellEdited: (cell) => this.handleGradeCellEdit(grade, cell),
                        hozAlign: 'center',
                        headerSort: false,
                    })),
                },
                {
                    title: 'U.D',
                    field: 'totalUD',
                    formatter: (cell) => {
                        const value = parseFloat(cell.getValue()) || 0;
                        return `${value.toFixed(1)}`;
                    },
                    // bottomCalc: (values, data, calcParams) => {
                    //     const total = values.reduce((sum, value) => sum + (parseFloat(value) || 0), 0);
                    //     return `${total.toFixed(1)}`;
                    // },
                    hozAlign: 'center',
                    headerSort: false,
                },
                {
                    title: 'DIAMETRO VENTILACION',
                    field: 'diametroVentilacion',
                    editor: this.mode === 'edit' ? 'select' : false,
                    editorParams: {
                        values: ['', '2"', '3"', '4"']
                    },
                    hozAlign: 'center',
                    headerSort: false,
                    cellEdited: (cell) => this.handleGradeCellEdit(grade, cell),
                }
            ];

            if (this.mode === 'edit') {
                console.log(this.mode);
                columns.push({
                    title: 'ACCIONES',
                    field: 'acciones',
                    width: 140,
                    formatter: ((cell) => {
                        const data = cell.getRow().getData();
                        let buttons = '';
                        console.log('Modo dentro de formatter:', this.mode);
                        console.log('Datos de la fila:', data);
                        console.log('Tipo de datos:', data.tipo);
                        if (this.mode === 'edit') {
                            if (data.tipo === 'module') {
                                buttons = `
                <button class="add-btn bg-blue-500 text-white px-1 py-1 rounded text-xs mr-1">➕</button>
                <button class="delete-btn bg-red-500 text-white px-1 py-1 rounded text-xs">🗑️</button>
            `;
                            } else if (data.tipo === 'child') {
                                buttons = `
                <button class="add-btn bg-blue-500 text-white px-1 py-1 rounded text-xs mr-1">➕</button>
                <button class="delete-btn bg-red-500 text-white px-1 py-1 rounded text-xs">🗑️</button>
            `;
                            } else if (data.tipo === 'grandchild') {
                                buttons = `
                <button class="delete-btn bg-red-500 text-white px-1 py-1 rounded text-xs">🗑️</button>
            `;
                            }
                        }
                        console.log('Botones generados:', buttons);
                        return buttons;
                    }).bind(this), // Bindear el contexto al componente
                    cellClick: (e, cell) => this.handleGradeButtonClick(grade, cell, e),
                    hozAlign: 'center'
                });
            }

            // Destruir tabla existente si existe
            if (this.tables.grades[grade]) {
                this.tables.grades[grade].destroy();
            }

            // Crear nueva tabla con estructura de árbol
            this.tables.grades[grade] = new Tabulator(container, {
                data: this.gradeData[grade],
                dataTree: true,
                dataTreeStartExpanded: true,
                dataTreeChildField: '_children',
                layout: 'fitColumns',
                columns: columns,
                height: 450,
                pagination: false,
                movableColumns: false,
                headerSort: false,
                resizableRows: true,
                index: 'id',
            });

            console.log(`Tabla ${grade} creada con ${this.gradeData[grade].length} filas principales`);
        },

        handleGradeButtonClick(grade, cell, e) {
            const row = cell.getRow();
            const data = row.getData();

            if (e.target.classList.contains('add-btn')) {
                this.addNewRow(grade, row);
            } else if (e.target.classList.contains('delete-btn')) {
                this.deleteRow(grade, row);
            }
        },

        handleGradeCellEdit(grade, cell) {
            const field = cell.getField();

            // Si es una columna de accesorio, recalcular totales
            if (field.startsWith('acc_')) {
                this.calculateRowUD(cell.getRow());
                this.calculateAllUD(grade);
            }
        },

        addModuleRow(grade) {
            // Crear un nuevo módulo único para el grado correspondiente
            const newModule = {
                id: this.generateUniqueId() + '-' + grade + '-' + Date.now(),
                tipo: 'module',
                nivel: 'NUEVO MÓDULO',
                descripcion: 'Descripción del módulo',
                ...this.createAccessoriesObject(),
                totalUD: 0,
                diametroVentilacion: '',
                _children: []
            };
            // Agregar solo al array de datos del grado correspondiente
            this.gradeData[grade].push(newModule);
            if (this.tables.grades[grade]) {
                this.tables.grades[grade].addRow(newModule);
            }
        },

        addNewRow(grade, row) {
            // Agrega un hijo (child) a la fila seleccionada en el grado correspondiente
            const parent = row.getData();
            const newChild = {
                id: this.generateUniqueId() + '-' + grade + '-' + Date.now(),
                tipo: parent.tipo === 'module' ? 'child' : 'grandchild',
                nivel: parent.tipo === 'module' ? 'NUEVO NIVEL' : '',
                descripcion: parent.tipo === 'module' ? 'Descripción del nivel' : 'Detalle',
                ...this.createAccessoriesObject(),
                totalUD: 0,
                diametroVentilacion: '',
                _children: []
            };
            if (!parent._children) parent._children = [];
            parent._children.push(newChild);
            // Actualizar la tabla visual
            if (this.tables.grades[grade]) {
                this.tables.grades[grade].updateData([parent]);
            }
            this.calculateAllUD(grade);
        },

        deleteRow(grade, row) {
            if (!confirm('¿Está seguro de eliminar esta fila?')) return;

            const rowData = row.getData();
            const module = this.tables[grade].modules.find(m =>
                m.id === rowData.id ||
                m.details.some(d => d.id === rowData.id) ||
                m.children.some(c => c.id === rowData.id || c.details.some(gc => gc.id === rowData.id))
            );

            if (!module) return;

            if (rowData.type === 'module') {
                this.tables[grade].modules = this.tables[grade].modules.filter(m => m.id !== rowData.id);
            } else if (rowData.type === 'child') {
                // Verificar si es un detalle directo o un hijo
                if (module.details.some(d => d.id === rowData.id)) {
                    module.details = module.details.filter(d => d.id !== rowData.id);
                } else {
                    module.children = module.children.filter(c => c.id !== rowData.id);
                }
            } else if (rowData.type === 'grandchild') {
                const parent = module.children.find(c => c.details.some(gc => gc.id === rowData.id));
                if (parent) {
                    parent.details = parent.details.filter(gc => gc.id !== rowData.id);
                }
            }

            this.calculateModuleTotal(module);
            this.updateTableRow(grade, module.id);
        },

        removeFromGradeData(grade, id) {
            const removeRecursive = (items) => {
                for (let i = items.length - 1; i >= 0; i--) {
                    if (items[i].id === id) {
                        items.splice(i, 1);
                        return true;
                    }
                    if (items[i]._children && removeRecursive(items[i]._children)) {
                        return true;
                    }
                }
                return false;
            };

            removeRecursive(this.gradeData[grade]);
        },

        calculateRowUD(row) {
            const data = row.getData();
            let total = 0;

            this.accesorios.forEach(acc => {
                const cantidad = parseFloat(data[`acc_${acc.key}`]) || 0;
                const udValue = parseFloat(acc.totalCategoryCount) || 0;
                total += cantidad * udValue;
            });
            const diametroVentilacion = (total || 0) < 100 ? '2"' : (total || 0) < 500 ? '3"' : (total || 0) < 1000 ? '6"' : '';

            row.update({ totalUD: total, diametroVentilacion: diametroVentilacion + 'pulg.' });
            return total;
        },

        calculateAllUD(grade) {
            const calculateRecursive = (items) => {
                items.forEach(item => {
                    let total = 0;

                    // Calcular total basado en accesorios
                    this.accesorios.forEach(acc => {
                        const cantidad = parseFloat(item[`acc_${acc.key}`]) || 0;
                        const udValue = parseFloat(acc.totalCategoryCount) || 0;
                        total += cantidad * udValue;
                    });

                    item.totalUD = total;

                    // Calcular recursivamente para hijos
                    if (item._children && item._children.length > 0) {
                        calculateRecursive(item._children);
                    }
                });
            };

            calculateRecursive(this.gradeData[grade]);

            // Actualizar tabla si existe
            if (this.tables.grades[grade]) {
                this.tables.grades[grade].replaceData(this.gradeData[grade]);
            }
        },

        toggleMode() {
            this.mode = this.mode === 'edit' ? 'view' : 'edit';
            console.log('Modo cambiado a:', this.mode);

            // Recrear todas las tablas con el nuevo modo
            setTimeout(() => {
                this.initializeTables();
            }, 100);
        },

        hasSelectedGrades() {
            return Object.values(this.systemGrades).some(selected => selected);
        },

        getSelectedGradesList() {
            return Object.keys(this.systemGrades).filter(grade => this.systemGrades[grade]);
        },

        getGradeName(grade) {
            const names = {
                inicial: 'Inicial',
                primaria: 'Primaria',
                secundaria: 'Secundaria'
            };
            return names[grade] || grade;
        },

        addDimensionRow() {
            const newRow = {
                id: this.generateUniqueId(),
                diametro: '',
                tipo: 'pulg.',
                size2: '',
                size3: '',
                size4: ''
            };
            this.dimensionRows.push(newRow);
            if (this.tables.dimensions) {
                this.tables.dimensions.addRow(newRow);
            }
        },

        removeDimensionRow(row) {
            const data = row.getData();
            const index = this.dimensionRows.findIndex(item => item.id === data.id);
            if (index > -1) {
                this.dimensionRows.splice(index, 1);
                row.delete();
            }
        },

        // Método para exportar datos
        exportData() {
            return {
                dimensionRows: this.dimensionRows,
                gradeData: this.gradeData,
                accesorios: this.accesorios
            };
        },

        // Método para importar datos
        importData(data) {
            if (data.dimensionRows) {
                this.dimensionRows = data.dimensionRows;
            }
            if (data.gradeData) {
                this.gradeData = data.gradeData;
            }
            if (data.accesorios) {
                this.accesorios = data.accesorios;
            }
            this.initializeTables();
        }
    }))
}

// Inicializar cuando el DOM esté listo
//document.addEventListener('DOMContentLoaded', initUVModule);