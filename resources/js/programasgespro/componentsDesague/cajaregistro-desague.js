export function initCajasModule() {
    //console.log('Inicializando módulo Cajas de Registro');

    const cajaregistro = document.getElementById('cajas-content');
    if (!cajaregistro) {
        console.error('Contenedor Caja de Registro no encontrado');
        return;
    }

    cajaregistro.innerHTML = `
        <div x-data="cajasregModule()" x-init="init()" class="w-full min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <!-- Header Principal -->
            <header class="bg-white/80 backdrop-blur-lg border-b border-slate-200/60 shadow-lg sticky top-0 z-50">
                <div class="max-w-7xl mx-auto px-6 py-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg">
                                <i class="fas fa-water text-white text-lg"></i>
                            </div>
                            <div>
                                <h1 class="text-2xl font-bold text-slate-800">Sistema de Cajas de Registro</h1>
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
                        
                            <!-- Botón Exportar -->
                            <!--<button @click="exportData()" 
                                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md">
                                <i class="fas fa-download mr-2"></i>Exportar
                            </button>-->
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
                                <h2 class="text-xl font-bold text-white" x-text="'ANEXO 09. CAJAS DE REGISTRO - ' + gradeConfig.title.toUpperCase()"></h2>
                                <div class="flex items-center space-x-3 text-sm text-white/80">
                                    <span>Filas: <span class="font-semibold text-white" x-text="getRowCount(grade)"></span></span>
                                    <span class="w-1 h-1 bg-white rounded-full"></span>
                                    <span>Actualizado: <span class="font-semibold text-white" x-text="lastUpdated"></span></span>
                                </div>
                            </div>
                        </div>

                        <!-- Tabla Principal -->
                        <div class="p-6">
                            <div :id="'tabulatorcaja-' + grade" class="border border-slate-200 rounded-lg overflow-hidden"></div>
                        </div>

                        <!-- Tabla Resumen -->
                        <div class="px-6 pb-6">
                            <div class="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
                                <h3 class="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                                    <i class="fas fa-chart-bar mr-2 text-slate-600"></i>
                                    Resumen de Tipos de Cajas
                                </h3>
                                <div :id="'resumen-' + grade" class="border border-slate-300 rounded-lg overflow-hidden bg-white"></div>
                            </div>
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
    Alpine.data('cajasregModule', () => ({
        mode: 'view',
        systemGrades: { inicial: true, primaria: false, secundaria: false },
        tables: { inicial: null, primaria: null, secundaria: null },
        resumenTables: { inicial: null, primaria: null, secundaria: null },
        colectorData: { inicial: [], primaria: [], secundaria: [] },
        lastUpdated: 'Ahora',
        nextIds: { inicial: 1, primaria: 1, secundaria: 1 },

        dimensionConfig: {
            thresholds: [0.61, 0.81, 1.01, 1.21],
            dimensions: [
                { valor: 0.61, value: '0.25m x 0.50m (10" x 20")', label: 'C.R.' },
                { valor: 0.81, value: '0.30m x 0.60m (12" x 24")', label: 'C.R.' },
                { valor: 1.01, value: '0.45m x 0.60m (18" x 24")', label: 'C.R.' },
                { valor: 1.21, value: '0.60m x 0.60m (24" x 24")', label: 'C.R.' }
            ]
        },

        async init() {
            this.loadSystemData();
            this.setupEventListeners();
            await this.waitForTabulator();
            this.createTables();
        },

        getGradeConfigs() {
            return { inicial: { title: "Inicial" }, primaria: { title: "Primaria" }, secundaria: { title: "Secundaria" } };
        },

        loadSystemData() { },

        setupEventListeners() {
            document.addEventListener('colector-data-updated', (event) => this.processColectorData(event.detail));
            document.addEventListener('system-grade-updated', (event) => this.handleGradeChange(event.detail.grades));
            document.addEventListener('system-data-changed', (event) => this.handleSystemDataChange(event.detail));
        },

        processColectorData(data) {
            this.colectorData = { inicial: [], primaria: [], secundaria: [] };
            Object.keys(data).forEach(grade => {
                if (Array.isArray(data[grade])) {
                    this.colectorData[grade] = this.transformColectorDataToTable(data[grade], grade);
                }
            });
            this.createTables();
            this.updateLastUpdated();
        },

        transformColectorDataToTable(gradeData, grade) {
            return gradeData.map((item, index) => ({
                id: `${grade}_cr_${index}`,
                tramocajalabel: item.cr1_num || 'C.R.',
                tramocajavalue: item.cr1_nval || (index + 1),
                ctcaja: parseFloat(item.cr1_ct) || 0,
                cfcaja: parseFloat(item.cr1_cf) || 0,
                hcaja: parseFloat(item.cr1_h) || 0,
                dimensionescaja: item.cr1_dim || this.calculateDimension(Math.abs(parseFloat(item.cr1_h) || 0))
            }));
        },

        handleGradeChange(grades) {
            this.systemGrades = { ...grades };
            setTimeout(() => this.createTables(), 100);
        },

        handleSystemDataChange(systemData) {
            if (systemData.grades) this.systemGrades = { ...systemData.grades };
        },

        waitForTabulator() {
            return new Promise((resolve) => {
                const checkTabulator = () => { if (typeof Tabulator !== 'undefined') resolve(); else setTimeout(checkTabulator, 100); };
                checkTabulator();
            });
        },

        createTables() {
            Object.keys(this.systemGrades).forEach(grade => {
                if (this.systemGrades[grade]) {
                    this.createTable(grade);
                    this.createResumenTable(grade);
                }
            });
        },

        createTable(grade) {
            const tableContainer = document.getElementById(`tabulatorcaja-${grade}`);
            if (!tableContainer) { console.error(`Contenedor de tabla ${grade} no encontrado`); return; }
            if (this.tables[grade]) this.tables[grade].destroy();

            const data = [...this.colectorData[grade], ...this.getStaticRows(grade)];
            this.nextIds[grade] = Math.max(...data.map(row => row.id ? parseInt(row.id.split('_').pop()) : 0)) + 1;

            this.tables[grade] = new Tabulator(tableContainer, {
                data: data,
                columns: this.getColumns(grade),
                layout: "fitColumns",
                height: "auto",
                resizableColumns: true,
                selectable: this.mode === 'edit',
                cellEdited: (cell) => this.onCellEdited(cell, grade),
                rowAdded: () => this.updateTables(grade),
                rowDeleted: () => this.updateTables(grade),
                dataChanged: () => this.updateTables(grade),
                tooltips: true,
                columnCalcs: "both"
            });

            // Actualizar resumen inmediatamente después de crear la tabla
            setTimeout(() => this.updateResumenTable(grade), 100);
            //console.log(`Tabla ${grade} creada exitosamente`);
        },

        createResumenTable(grade) {
            const resumenContainer = document.getElementById(`resumen-${grade}`);
            if (!resumenContainer) { console.error(`Contenedor de resumen ${grade} no encontrado`); return; }
            if (this.resumenTables[grade]) this.resumenTables[grade].destroy();

            const resumenData = this.generateResumenData(grade);
            this.resumenTables[grade] = new Tabulator(resumenContainer, {
                data: resumenData,
                columns: [
                    {
                        title: "TIPO DE CAJA DE REGISTRO",
                        field: "descripcioncaja",
                        headerSort: false,
                        formatter: (cell) => {
                            const value = cell.getValue();
                            if (value.includes('BUZON')) return `<span class="font-semibold text-purple-800">${value}</span>`;
                            if (value.includes('FINAL')) return `<span class="font-semibold text-red-800">${value}</span>`;
                            if (value.includes('CONC')) return `<span class="font-semibold text-green-800">${value}</span>`;
                            if (value.includes('TOTAL')) return `<span class="font-bold text-black">${value}</span>`;
                            return `<span class="font-semibold text-blue-800">${value}</span>`;
                        }
                    },
                    {
                        title: "TIPO DE CAJA DE REGISTRO",
                        field: "tipo",
                        headerSort: false,
                        formatter: (cell) => {
                            const value = cell.getValue();
                            if (value.includes('BUZON')) return `<span class="font-semibold text-purple-800">${value}</span>`;
                            if (value.includes('FINAL')) return `<span class="font-semibold text-red-800">${value}</span>`;
                            if (value.includes('CONC')) return `<span class="font-semibold text-green-800">${value}</span>`;
                            if (value === '') return `<span class="font-bold text-black">${value}</span>`;
                            return `<span class="font-semibold text-blue-800">${value}</span>`;
                        }
                    },
                    {
                        title: "N°",
                        field: "cantidad",
                        headerSort: false,
                        formatter: (cell) => `<span class="font-bold text-slate-900">${cell.getValue()}</span>`,
                        bottomCalc: "sum",
                        bottomCalcFormatter: (cell) => `<span class="font-bold text-slate-900">${cell.getValue()}</span>`
                    }
                ],
                layout: "fitColumns",
                height: "auto",
                resizableColumns: false,
                selectable: false
            });
            //console.log(`Tabla resumen ${grade} creada exitosamente`);
        },

        generateResumenData(grade) {
            //console.log(`=== Iniciando generateResumenData para ${grade} ===`);

            // Plantilla de resumen con todos los tipos posibles
            const summaryTemplate = [
                { descripcioncaja: "CAJA DE REGISTRO ", tipo: '0.25m x 0.50m (10" x 20")', cantidad: 0 },
                { descripcioncaja: "CAJA DE REGISTRO ", tipo: '0.30m x 0.60m (12" x 24")', cantidad: 0 },
                { descripcioncaja: "CAJA DE REGISTRO ", tipo: '0.45m x 0.60m (18" x 24")', cantidad: 0 },
                { descripcioncaja: "CAJA DE REGISTRO ", tipo: '0.60m x 0.60m (24" x 24")', cantidad: 0 },
                { descripcioncaja: "BUZON", tipo: 'D=1.20m', cantidad: 0 },
                { descripcioncaja: "FINAL", tipo: '0.60m x 0.60m (24" x 24")', cantidad: 0 },
                { descripcioncaja: "CONC.", tipo: '0.50m x 0.80m x 0.50m', cantidad: 0 }
            ];

            // Obtener datos de la tabla principal
            if (this.tables[grade]) {
                const data = this.tables[grade].getData();
                //console.log(`Datos de tabla ${grade}:`, data);

                // Iterar sobre cada fila de la tabla tabulatorcaja
                data.forEach((row, index) => {
                    const dimension = row.dimensionescaja ? row.dimensionescaja.trim() : '';
                    const label = row.tramocajalabel ? row.tramocajalabel.trim() : '';

                    //console.log(`Fila ${index + 1}: label="${label}", dimension="${dimension}"`);

                    if (!dimension) {
                        //console.log(`Fila ${index + 1} saltada - dimensión vacía`);
                        return;
                    }

                    // Lógica de conteo mejorada
                    let conteoRealizado = false;

                    // 1. Verificar BUZON
                    if (dimension === 'D=1.20m') {
                        const buzonRow = summaryTemplate.find(item => item.descripcioncaja === 'BUZON');
                        if (buzonRow) {
                            buzonRow.cantidad += 1;
                            //console.log(`✓ BUZON incrementado: ${buzonRow.cantidad}`);
                            conteoRealizado = true;
                        }
                    }

                    // 2. Verificar CONC.
                    else if (dimension === '0.50m x 0.80m x 0.50m') {
                        const concRow = summaryTemplate.find(item => item.descripcioncaja === 'CONC.');
                        if (concRow) {
                            concRow.cantidad += 1;
                            //console.log(`✓ CONC. incrementado: ${concRow.cantidad}`);
                            conteoRealizado = true;
                        }
                    }

                    // 3. Verificar FINAL (específicamente para 0.60m x 0.60m)
                    else if (dimension === '0.60m x 0.60m (24" x 24")' &&
                        (label.includes('FINAL') || label === 'CAJA DE REGISTRO FINAL')) {
                        const finalRow = summaryTemplate.find(item => item.descripcioncaja === 'FINAL');
                        if (finalRow) {
                            finalRow.cantidad += 1;
                            //console.log(`✓ FINAL incrementado: ${finalRow.cantidad}`);
                            conteoRealizado = true;
                        }
                    }

                    // 4. Verificar CAJA DE REGISTRO (para todas las dimensiones estándar)
                    else {
                        // Lista de dimensiones válidas para CAJA DE REGISTRO
                        const dimensionesValidas = [
                            '0.25m x 0.50m (10" x 20")',
                            '0.30m x 0.60m (12" x 24")',
                            '0.45m x 0.60m (18" x 24")',
                            '0.60m x 0.60m (24" x 24")'
                        ];

                        if (dimensionesValidas.includes(dimension)) {
                            const cajaRow = summaryTemplate.find(item =>
                                item.descripcioncaja === 'CAJA DE REGISTRO ' && item.tipo === dimension
                            );
                            if (cajaRow) {
                                cajaRow.cantidad += 1;
                                //console.log(`✓ CAJA DE REGISTRO ${dimension} incrementado: ${cajaRow.cantidad}`);
                                conteoRealizado = true;
                            }
                        }
                    }

                    if (!conteoRealizado) {
                        //console.log(`⚠️ No se pudo contar la fila ${index + 1}: label="${label}", dimension="${dimension}"`);
                    }
                });
            } else {
                //console.log(`Tabla ${grade} no existe aún`);
            }

            // Log del resumen final
            //console.log(`=== Resumen final para ${grade} ===`);
            summaryTemplate.forEach(item => {
                if (item.cantidad > 0) {
                    //console.log(`${item.descripcioncaja}${item.tipo}: ${item.cantidad}`);
                }
            });

            return summaryTemplate;
        },

        updateTables(grade) {
            this.updateLastUpdated();
            this.updateResumenTable(grade);
        },

        updateResumenTable(grade) {
            if (this.resumenTables[grade]) {
                const resumenData = this.generateResumenData(grade);
                this.resumenTables[grade].setData(resumenData);
                //console.log(`Resumen ${grade} actualizado`);
            }
        },

        getColumns(grade) {
            return [
                { title: "N°", field: "tramocajalabel", editor: false, headerSort: false, width: 80 },
                { title: "TRAMO", field: "tramocajavalue", editor: false, headerSort: false, width: 100 },
                { title: "CT", field: "ctcaja", editor: this.mode === 'edit' ? "number" : false, validator: "numeric", formatter: (cell) => this.formatNumber(cell.getValue(), 2), headerSort: false, width: 100 },
                { title: "CF", field: "cfcaja", editor: this.mode === 'edit' ? "number" : false, validator: "numeric", formatter: (cell) => this.formatNumber(cell.getValue(), 2), headerSort: false, width: 100 },
                { title: "H", field: "hcaja", editor: false, formatter: (cell) => this.formatNumber(cell.getValue(), 2), headerSort: false, width: 100 },
                { title: "DIMENSIONES", field: "dimensionescaja", editor: this.mode === 'edit' ? "list" : false, editorParams: { values: this.getDimensionOptions() }, headerSort: false }
            ];
        },

        getDimensionOptions() {
            return [
                ...this.dimensionConfig.dimensions.map(d => d.value),
                'D=1.20m',
                '0.50m x 0.80m x 0.50m'
            ];
        },

        getStaticRows(grade) {
            return [
                { id: `static_${grade}_buzon`, tramocajalabel: 'B.z', tramocajavalue: 18, ctcaja: 0.00, cfcaja: -1.40, hcaja: 1.40, dimensionescaja: 'D=1.20m', isStatic: true },
                { id: `static_${grade}_final`, tramocajalabel: 'CAJA DE REGISTRO FINAL', tramocajavalue: '', ctcaja: -0.35, cfcaja: -1.50, hcaja: 1.15, dimensionescaja: '0.60m x 0.60m (24" x 24")', isStatic: true },
                { id: `static_${grade}_conc`, tramocajalabel: 'CONC.', tramocajavalue: '', ctcaja: -0.10, cfcaja: -0.30, hcaja: 0.20, dimensionescaja: '0.50m x 0.80m x 0.50m', isStatic: true }
            ];
        },

        toggleMode() {
            this.mode = this.mode === 'view' ? 'edit' : 'view';
            this.createTables();
        },

        onCellEdited(cell, grade) {
            const row = cell.getRow();
            const rowData = row.getData();

            // Recalcular altura si se modificó CT o CF
            if (cell.getField() === 'ctcaja' || cell.getField() === 'cfcaja') {
                rowData.hcaja = (parseFloat(rowData.ctcaja) || 0) - (parseFloat(rowData.cfcaja) || 0);
                rowData.dimensionescaja = this.calculateDimension(Math.abs(rowData.hcaja));
            }

            row.update(rowData);
            this.updateTables(grade);
        },

        calculateDimension(height) {
            if (height === 0) return "";
            for (let i = 0; i < this.dimensionConfig.thresholds.length; i++) {
                if (height < this.dimensionConfig.thresholds[i]) return this.dimensionConfig.dimensions[i].value;
            }
            return this.dimensionConfig.dimensions[this.dimensionConfig.dimensions.length - 1].value;
        },

        formatNumber(value, decimals = 2) {
            return typeof value === 'number' ? value.toFixed(decimals) : (value || '0.00');
        },

        getRowCount(grade) {
            return this.tables[grade] ? this.tables[grade].getData().filter(row => !row.isStatic).length : 0;
        },

        updateLastUpdated() {
            this.lastUpdated = new Date().toLocaleTimeString();
        },
    }));
}

// document.addEventListener('DOMContentLoaded', () => {
//     if (typeof initCajasModule === 'function') initCajasModule();
// });