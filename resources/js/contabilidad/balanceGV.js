// balance.js - Estructura robusta para manejo de grandes datasets
import { createApp, ref, reactive, computed, watch, onMounted, nextTick } from 'vue';
// Obtener datos de configuración inicial
const { empresaId, contabilidad, csrfToken } = window.APP_INIT || {};
// Core configuration for performance optimization
const PERFORMANCE_CONFIG = {
    VIRTUAL_DOM_BUFFER: 1000,    // Virtual DOM buffer size
    DEBOUNCE_DELAY: 300,         // Debounce delay for calculations
    CHUNK_SIZE: 1000,            // Chunk size for processing large data
    MAX_VISIBLE_ROWS: 500        // Maximum visible rows without pagination
};

// Color schemes for hierarchy levels
const HIERARCHY_COLORS = {
    levels: {
        0: { bg: '#f8f4ff', text: '#800080', weight: 'bold' },
        1: { bg: '#fff4f4', text: '#FF0000', weight: 'bold' },
        2: { bg: '#f4f4ff', text: '#0000FF', weight: 'bold' },
        3: { bg: '#f4fff4', text: '#008000', weight: 'normal' },
        4: { bg: '#ffffff', text: '#000000', weight: 'normal' },
        5: { bg: '#f9f9f9', text: '#666666', weight: 'normal' }
    }
};

// Performance utilities
class PerformanceUtils {
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static chunk(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    static throttle(func, delay) {
        let timeoutId;
        let lastExecTime = 0;
        return function (...args) {
            const currentTime = Date.now();
            if (currentTime - lastExecTime > delay) {
                func.apply(this, args);
                lastExecTime = currentTime;
            } else {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    func.apply(this, args);
                    lastExecTime = Date.now();
                }, delay - (currentTime - lastExecTime));
            }
        };
    }
}

// Data processing utilities
class DataProcessor {
    static calculateMonthTotals(rowData, months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']) {
        return months.reduce((sum, month) => {
            return this.addPrecise(sum, Number(rowData[month] || 0));
        }, 0);
    }

    static addPrecise(a, b) {
        const result = Math.round((Number(a) + Number(b)) * 100) / 100;
        return parseFloat(result.toFixed(2));
    }

    static processDataChunks(data, processor, chunkSize = PERFORMANCE_CONFIG.CHUNK_SIZE) {
        return new Promise((resolve) => {
            const chunks = PerformanceUtils.chunk(data, chunkSize);
            let processed = [];

            const processChunk = (index) => {
                if (index < chunks.length) {
                    const chunkResult = chunks[index].map(processor);
                    processed = processed.concat(chunkResult);
                    setTimeout(() => processChunk(index + 1), 0);
                } else {
                    resolve(processed);
                }
            };

            processChunk(0);
        });
    }

    static findRowRecursively(data, predicate) {
        for (const item of data) {
            if (predicate(item)) return item;

            const children = item.children || item._children;
            if (Array.isArray(children)) {
                const found = this.findRowRecursively(children, predicate);
                if (found) return found;
            }
        }
        return null;
    }
}

// Table configuration factory
class TableConfigFactory {
    static createBaseColumns() {
        return [
            {
                title: "Concepto",
                field: "datos_bal",
                editor: "input",
                width: 200,
                headerSort: false,
                frozen: true,
                responsive: 0,
                formatter: this.createHierarchyFormatter(),
                cellClick: this.createCellClickHandler()
            },
            {
                title: "Acciones",
                width: 100,
                hozAlign: "center",
                headerSort: false,
                formatter: () => `
                    <div class="flex gap-1 justify-center">
                        <button class="add-row px-2 py-1 text-green-600 hover:bg-green-50 rounded" title="Agregar">➕</button>
                        <button class="delete-row px-2 py-1 text-red-600 hover:bg-red-50 rounded" title="Eliminar">🗑️</button>
                        <button class="edit-row px-2 py-1 text-blue-600 hover:bg-blue-50 rounded" title="Editar">✏️</button>
                    </div>
                `,
                cellClick: this.createActionHandler()
            },
            ...this.createMonthColumns(),
            {
                title: "TOTAL",
                field: "total",
                hozAlign: "right",
                headerSort: false,
                width: 120,
                formatter: "money",
                formatterParams: { precision: 2, symbol: "S/ " },
                bottomCalc: "sum",
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: { precision: 2, symbol: "S/ " }
            }
        ];
    }

    static createMonthColumns() {
        const months = [
            { title: "ENERO", field: "ene" },
            { title: "FEBRERO", field: "feb" },
            { title: "MARZO", field: "mar" },
            { title: "ABRIL", field: "abr" },
            { title: "MAYO", field: "may" },
            { title: "JUNIO", field: "jun" },
            { title: "JULIO", field: "jul" },
            { title: "AGOSTO", field: "ago" },
            { title: "SEPTIEMBRE", field: "sep" },
            { title: "OCTUBRE", field: "oct" },
            { title: "NOVIEMBRE", field: "nov" },
            { title: "DICIEMBRE", field: "dic" }
        ];

        return months.map(month => ({
            title: month.title,
            field: month.field,
            hozAlign: "right",
            editor: "input",
            headerSort: false,
            width: 90,
            formatter: "money",
            formatterParams: { precision: 2, symbol: "" },
            bottomCalc: "sum",
            bottomCalcFormatter: "money",
            bottomCalcFormatterParams: { precision: 2, symbol: "S/ " },
            cellEdited: this.createCellEditHandler()
        }));
    }

    static createHierarchyFormatter() {
        return function (cell) {
            const row = cell.getRow();
            const value = cell.getValue() || '';
            const level = TableUtils.getTreeLevel(row);
            const colors = HIERARCHY_COLORS.levels[level] || HIERARCHY_COLORS.levels[5];

            return `<span style="color: ${colors.text}; font-weight: ${colors.weight}; padding-left: ${level * 15}px;">${value}</span>`;
        };
    }

    static createCellClickHandler() {
        return function (e, cell) {
            const rowData = cell.getData();

            if (rowData.datos_bal === "Gastos de financiamiento" ||
                rowData.datos_bal === "INGRESOS DE FINANCIAMIENTO") {

                window.balanceApp.showBalanceSearchModal(rowData.datos_bal);
            }
        };
    }

    static createCellEditHandler() {
        return PerformanceUtils.debounce(function (cell) {
            const row = cell.getRow();
            window.balanceApp.updateRowCalculations(row);
        }, PERFORMANCE_CONFIG.DEBOUNCE_DELAY);
    }

    static createActionHandler() {
        return async function (e, cell) {
            e.stopPropagation();
            const target = e.target;
            const row = cell.getRow();

            if (target.classList.contains('add-row')) {
                await window.balanceApp.addChildRow(row);
            } else if (target.classList.contains('delete-row')) {
                await window.balanceApp.deleteRow(row);
            } else if (target.classList.contains('edit-row')) {
                window.balanceApp.editRow(row);
            }
        };
    }

    static createBaseConfig(containerId) {
        return {
            height: "auto",
            virtualDom: true,
            virtualDomBuffer: PERFORMANCE_CONFIG.VIRTUAL_DOM_BUFFER,
            layout: "fitColumns",

            // Data tree configuration
            dataTree: true,
            dataTreeChildField: "children",
            dataTreeStartExpanded: false,

            // Performance optimizations
            renderHorizontal: "virtual",
            renderVertical: "virtual",

            // Column calculations
            columnCalcs: "both",

            // Persistence
            persistence: {
                sort: true,
                filter: true,
                columns: true,
                tree: true
            },

            columns: this.createBaseColumns(),

            rowFormatter: this.createRowFormatter(),

            // Event handlers
            dataChanged: PerformanceUtils.throttle(() => {
                window.balanceApp.recalculateAll();
            }, 500),

            dataTreeRowExpanded: (row, level) => {
                console.log(`Expanded row: ${row.getData().datos_bal} at level ${level}`);
            }
        };
    }

    static createRowFormatter() {
        return function (row) {
            const element = row.getElement();
            const level = TableUtils.getTreeLevel(row);
            const colors = HIERARCHY_COLORS.levels[level] || HIERARCHY_COLORS.levels[5];

            element.style.backgroundColor = colors.bg;
            element.classList.add(`hierarchy-level-${level}`);

            if (TableUtils.hasChildren(row)) {
                element.classList.add('has-children');
            }
        };
    }
}

// Table utilities
class TableUtils {
    static getTreeLevel(row) {
        if (!row || typeof row.getTreeParent !== 'function') return 0;

        let level = 0;
        let parent = row.getTreeParent();
        const maxDepth = 20; // Prevent infinite loops

        while (parent && level < maxDepth) {
            level++;
            parent = parent.getTreeParent();
        }

        return level;
    }

    static hasChildren(row) {
        if (!row || typeof row.getTreeChildren !== 'function') return false;

        const children = row.getTreeChildren();
        return children && Array.isArray(children) && children.length > 0;
    }

    static expandRowRecursively(row, maxLevels = 2) {
        if (maxLevels <= 0) return;

        if (this.hasChildren(row)) {
            row.treeExpand().then(() => {
                const children = row.getTreeChildren();
                children.forEach(child => {
                    this.expandRowRecursively(child, maxLevels - 1);
                });
            });
        }
    }
}

// Chart utilities
class ChartUtils {
    static createBaseOptions(title) {
        return {
            title: {
                text: title,
                left: 'center',
                textStyle: {
                    color: '#333333',
                    fontSize: 16
                }
            },
            tooltip: {
                trigger: 'axis',
                formatter: (params) => {
                    let result = `${params[0].axisValue}<br/>`;
                    params.forEach(param => {
                        const value = new Intl.NumberFormat('es-PE', {
                            style: 'currency',
                            currency: 'PEN'
                        }).format(param.value);
                        result += `${param.seriesName}: ${value}<br/>`;
                    });
                    return result;
                }
            },
            legend: {
                top: '30px'
            },
            grid: {
                left: '5%',
                right: '5%',
                bottom: '5%',
                top: '15%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: (value) => new Intl.NumberFormat('es-PE', {
                        style: 'currency',
                        currency: 'PEN',
                        minimumFractionDigits: 0
                    }).format(value)
                }
            }
        };
    }

    static initChart(containerId, options) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const chart = echarts.init(container);
        chart.setOption(options);

        // Handle resize
        const resizeObserver = new ResizeObserver(() => chart.resize());
        resizeObserver.observe(container);

        return chart;
    }
}

const BalanceApp = {
    setup() {
        // Reactive state
        const state = reactive({
            loading: false,
            activeView: 'real',
            sections: {
                ingresos: true,
                gastos: true,
                estado: false,
                'resumen-table': false,
                chart: true
            },
            showModal: false,
            modalTitle: '',
            modalInput: '',
            modalPlaceholder: '',
            modalCallback: null
        });

        // Data stores
        const data = reactive({
            ingresos: [],
            gastos: [],
            estado: [],
            resumen: [],
            programado: []
        });

        // Table instances
        const tables = reactive({
            ingresos: null,
            gastos: null,
            estado: null,
            resumen: null,
            programado: null,
            resumenIngresos: null,
            resumenGastos: null
        });

        // Charts
        const charts = reactive({
            resumen: null,
            programado: null,
            comparacionIngresos: null,
            comparacionGastos: null
        });

        // KPIs
        const resumenKPIs = reactive({
            ingresos: {
                monto: 'S/ 0.00',
                porcentaje: '0%',
                color: 'text-gray-600'
            },
            gastos: {
                monto: 'S/ 0.00',
                porcentaje: '0%',
                color: 'text-gray-600'
            }
        });

        // Configuration
        const config = {
            idContabilidad: contabilidad.id,
            nombreBalance: contabilidad.nombre_balance,
            empresaId: empresaId,
            csrfToken: csrfToken
        };

        console.log(config);
        // Computed properties
        const nome_balance = computed(() => config.nombreBalance || 'Balance');

        // API Service
        const apiService = {
            async loadData() {
                try {
                    const response = await fetch('/obtener-balance-real', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': config.csrfToken
                        },
                        body: JSON.stringify({ id_contabilidad: config.idContabilidad })
                    });

                    if (!response.ok) throw new Error('Network response was not ok');

                    const result = await response.json();
                    return result.data || {};
                } catch (error) {
                    console.error('Error loading data:', error);
                    throw error;
                }
            },

            async saveData(dataToSave) {
                try {
                    const response = await fetch('/actualizar-balance-real', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': config.csrfToken
                        },
                        body: JSON.stringify({
                            id_contabilidad: config.idContabilidad,
                            rowData: JSON.stringify(dataToSave)
                        })
                    });

                    if (!response.ok) throw new Error('Save failed');

                    return await response.json();
                } catch (error) {
                    console.error('Error saving data:', error);
                    throw error;
                }
            },

            async searchBalance(balanceName) {
                try {
                    const response = await fetch('/obtener-listado-balance', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': config.csrfToken
                        },
                        body: JSON.stringify({ nombre_balance: balanceName })
                    });

                    if (!response.ok) throw new Error('Balance not found');

                    return await response.json();
                } catch (error) {
                    console.error('Error searching balance:', error);
                    throw error;
                }
            }
        };

        // Core methods
        const methods = {
            // View management
            setActiveView(view) {
                state.activeView = view;
                nextTick(() => {
                    if (view === 'resumen') {
                        methods.calculateResumenKPIs();
                        methods.updateResumenCharts();
                    }
                });
            },

            toggleSection(section) {
                state.sections[section] = !state.sections[section];
            },

            // Data loading
            async loadInitialData() {
                state.loading = true;
                try {
                    const loadedData = await apiService.loadData();

                    // Process and assign data
                    data.ingresos = loadedData.ingresos || methods.getDefaultIngresos();
                    data.gastos = loadedData.gastos || methods.getDefaultGastos();
                    data.estado = loadedData.estado || [];
                    data.resumen = loadedData.resumen || [];
                    data.programado = loadedData.programado || [];

                    // Initialize tables
                    await nextTick();
                    methods.initializeTables();
                    methods.initializeCharts();

                } catch (error) {
                    methods.showError('Error al cargar los datos');
                } finally {
                    state.loading = false;
                }
            },

            // Table initialization
            initializeTables() {
                try {
                    // Ingresos table
                    tables.ingresos = new Tabulator("#tabla-ingresos", {
                        ...TableConfigFactory.createBaseConfig('tabla-ingresos'),
                        data: data.ingresos
                    });

                    // Gastos table
                    tables.gastos = new Tabulator("#tabla-gastos", {
                        ...TableConfigFactory.createBaseConfig('tabla-gastos'),
                        data: data.gastos
                    });

                    // Estado table (read-only)
                    tables.estado = new Tabulator("#tabla-estado", {
                        ...TableConfigFactory.createBaseConfig('tabla-estado'),
                        columns: TableConfigFactory.createBaseColumns().filter(col => col.title !== "Acciones").map(col => ({ ...col, editor: false })),
                        data: []
                    });

                    // Resumen table (read-only)
                    tables.resumen = new Tabulator("#tabla-resumen", {
                        ...TableConfigFactory.createBaseConfig('tabla-resumen'),
                        columns: TableConfigFactory.createBaseColumns().filter(col => col.title !== "Acciones").map(col => ({ ...col, editor: false })),
                        data: []
                    });

                    // Setup calculation triggers
                    [tables.ingresos, tables.gastos].forEach(table => {
                        table.on("cellEdited", methods.debouncedRecalculation);
                        table.on("rowAdded", methods.debouncedRecalculation);
                        table.on("rowDeleted", methods.debouncedRecalculation);
                    });

                    // Initial calculations
                    methods.recalculateAll();

                } catch (error) {
                    console.error('Error initializing tables:', error);
                    methods.showError('Error al inicializar las tablas');
                }
            },

            // Chart initialization
            initializeCharts() {
                try {
                    // Main balance chart
                    const resumenOptions = ChartUtils.createBaseOptions('Balance General');
                    charts.resumen = ChartUtils.initChart('grafico-resumen', resumenOptions);

                    // Programado chart
                    const programadoOptions = ChartUtils.createBaseOptions('Balance Presupuestado');
                    charts.programado = ChartUtils.initChart('grafico-programado', programadoOptions);

                    // Comparison charts
                    const ingresoCompOptions = ChartUtils.createBaseOptions('Comparación Ingresos');
                    charts.comparacionIngresos = ChartUtils.initChart('grafico-comparacion-ingresos', ingresoCompOptions);

                    const gastoCompOptions = ChartUtils.createBaseOptions('Comparación Gastos');
                    charts.comparacionGastos = ChartUtils.initChart('grafico-comparacion-gastos', gastoCompOptions);

                } catch (error) {
                    console.error('Error initializing charts:', error);
                }
            },

            // Row operations
            async addChildRow(parentRow) {
                try {
                    const parentData = parentRow.getData();
                    const children = parentRow.getTreeChildren();
                    const nextNumber = (children.length + 1).toString().padStart(2, '0');

                    const newRowData = {
                        id: Date.now(),
                        datos_bal: "Nuevo Item",
                        registro: "",
                        ene: 0, feb: 0, mar: 0, abr: 0,
                        may: 0, jun: 0, jul: 0, ago: 0,
                        sep: 0, oct: 0, nov: 0, dic: 0,
                        total: 0,
                        children: []
                    };

                    await parentRow.addTreeChild(newRowData);
                    parentRow.treeExpand();

                    methods.updateRowCalculations(parentRow);

                } catch (error) {
                    console.error('Error adding row:', error);
                    methods.showError('Error al agregar fila');
                }
            },

            async deleteRow(row) {
                const confirmed = await methods.showConfirmation(
                    '¿Eliminar fila?',
                    '¿Estás seguro de eliminar esta fila y todos sus elementos hijos?'
                );

                if (!confirmed) return;

                try {
                    const parent = row.getTreeParent();
                    await row.delete();

                    if (parent) {
                        methods.updateRowCalculations(parent);
                        methods.renumberSiblings(parent);
                    }

                } catch (error) {
                    console.error('Error deleting row:', error);
                    methods.showError('Error al eliminar fila');
                }
            },

            editRow(row) {
                const rowData = row.getData();
                methods.showModal(
                    'Editar concepto',
                    'Ingresa el nuevo nombre del concepto',
                    rowData.datos_bal,
                    (newValue) => {
                        row.update({ datos_bal: newValue });
                    }
                );
            },

            // Calculations
            updateRowCalculations(row) {
                const rowData = row.getData();
                const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

                if (!TableUtils.hasChildren(row)) {
                    // Leaf node: calculate total from months
                    const total = DataProcessor.calculateMonthTotals(rowData, months);
                    row.update({ total });
                } else {
                    // Parent node: sum from children
                    const children = row.getTreeChildren();
                    const totals = { total: 0 };

                    months.forEach(month => {
                        totals[month] = children.reduce((sum, child) => {
                            const childData = child.getData();
                            return DataProcessor.addPrecise(sum, Number(childData[month] || 0));
                        }, 0);
                    });

                    totals.total = children.reduce((sum, child) => {
                        const childData = child.getData();
                        return DataProcessor.addPrecise(sum, Number(childData.total || 0));
                    }, 0);

                    row.update(totals);
                }

                // Update parent recursively
                const parent = row.getTreeParent();
                if (parent) {
                    methods.updateRowCalculations(parent);
                }
            },

            debouncedRecalculation: PerformanceUtils.debounce(() => {
                methods.recalculateAll();
            }, PERFORMANCE_CONFIG.DEBOUNCE_DELAY),

            recalculateAll() {
                methods.calculateEstado();
                methods.calculateResumen();
                methods.updateMainChart();
            },

            calculateEstado() {
                try {
                    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
                    const ingresosData = tables.ingresos?.getData() || [];
                    const gastosData = tables.gastos?.getData() || [];

                    let acumuladoInversion = 0;
                    let acumuladoFinanciamiento = 0;

                    const estadoCuenta = {
                        id: 'estado-1',
                        datos_bal: "Estado de cuenta",
                        registro: "",
                        total: 0
                    };

                    const diferenciaBalances = {
                        id: 'estado-2',
                        datos_bal: "Diferencia de balances",
                        registro: "",
                        total: 0
                    };

                    months.forEach(mes => {
                        const ingresosInversion = methods.findValueInData(ingresosData, "INGRESOS DE INVERSION", mes);
                        const gastosInversion = methods.findValueInData(gastosData, "Gastos de inversion", mes);
                        const ingresosFinanciamiento = methods.findValueInData(ingresosData, "INGRESOS DE FINANCIAMIENTO", mes);
                        const gastosFinanciamiento = methods.findValueInData(gastosData, "Gastos de financiamiento", mes);

                        acumuladoInversion = DataProcessor.addPrecise(acumuladoInversion,
                            DataProcessor.addPrecise(ingresosInversion, gastosInversion));
                        acumuladoFinanciamiento = DataProcessor.addPrecise(acumuladoFinanciamiento,
                            DataProcessor.addPrecise(ingresosFinanciamiento, gastosFinanciamiento));

                        estadoCuenta[mes] = acumuladoInversion;
                        diferenciaBalances[mes] = acumuladoFinanciamiento;
                    });

                    estadoCuenta.total = acumuladoInversion;
                    diferenciaBalances.total = acumuladoFinanciamiento;

                    tables.estado?.setData([estadoCuenta, diferenciaBalances]);

                } catch (error) {
                    console.error('Error calculating estado:', error);
                }
            },

            calculateResumen() {
                try {
                    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
                    const ingresosData = tables.ingresos?.getData() || [];
                    const gastosData = tables.gastos?.getData() || [];

                    const ingresos = {};
                    const gastosTotales = {};
                    const saldoAhorroNeto = {};
                    const ahorroNeto = {};
                    const monto2023 = 0;

                    months.forEach((mes, index) => {
                        ingresos[mes] = methods.sumDataValues(ingresosData, mes);
                        gastosTotales[mes] = methods.sumDataValues(gastosData, mes);
                        saldoAhorroNeto[mes] = DataProcessor.addPrecise(ingresos[mes], gastosTotales[mes]);

                        if (index === 0) {
                            ahorroNeto[mes] = DataProcessor.addPrecise(monto2023, saldoAhorroNeto[mes]);
                        } else {
                            ahorroNeto[mes] = DataProcessor.addPrecise(ahorroNeto[months[index - 1]], saldoAhorroNeto[mes]);
                        }
                    });

                    const resumenData = [
                        {
                            id: 'resumen-1',
                            datos_bal: "Monto2023",
                            registro: "",
                            ...months.reduce((acc, mes) => ({ ...acc, [mes]: mes === 'ene' ? monto2023 : 0 }), {}),
                            total: monto2023
                        },
                        {
                            id: 'resumen-2',
                            datos_bal: "Ingresos",
                            registro: "",
                            ...ingresos,
                            total: Object.values(ingresos).reduce((sum, val) => DataProcessor.addPrecise(sum, val), 0)
                        },
                        {
                            id: 'resumen-3',
                            datos_bal: "Gastos",
                            registro: "",
                            ...gastosTotales,
                            total: Object.values(gastosTotales).reduce((sum, val) => DataProcessor.addPrecise(sum, val), 0)
                        },
                        {
                            id: 'resumen-4',
                            datos_bal: "Saldo",
                            registro: "",
                            ...saldoAhorroNeto,
                            total: Object.values(saldoAhorroNeto).reduce((sum, val) => DataProcessor.addPrecise(sum, val), 0)
                        },
                        {
                            id: 'resumen-5',
                            datos_bal: "Ahorro Neto",
                            registro: "",
                            ...ahorroNeto,
                            total: ahorroNeto[months[months.length - 1]]
                        }
                    ];

                    tables.resumen?.setData(resumenData);

                } catch (error) {
                    console.error('Error calculating resumen:', error);
                }
            },

            // Chart updates
            updateMainChart() {
                if (!charts.resumen) return;

                try {
                    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
                    const ingresosData = tables.ingresos?.getData()[0] || {};
                    const gastosData = tables.gastos?.getData()[0] || {};
                    const resumenData = tables.resumen?.getData() || [];

                    const series = [
                        {
                            name: 'Ingresos',
                            type: 'bar',
                            stack: 'total',
                            data: months.map(mes => ingresosData[mes.toLowerCase()] || 0),
                            itemStyle: { color: '#10B981' }
                        },
                        {
                            name: 'Gastos',
                            type: 'bar',
                            stack: 'total',
                            data: months.map(mes => Math.abs(gastosData[mes.toLowerCase()] || 0)),
                            itemStyle: { color: '#EF4444' }
                        },
                        {
                            name: 'Saldo Acumulado',
                            type: 'line',
                            smooth: true,
                            data: months.map((_, index) => {
                                const ahorroRow = resumenData.find(item => item.datos_bal === "Ahorro Neto");
                                return ahorroRow?.[months[index].toLowerCase()] || 0;
                            }),
                            itemStyle: { color: '#3B82F6' }
                        }
                    ];

                    charts.resumen.setOption({
                        series,
                        legend: { data: ['Ingresos', 'Gastos', 'Saldo Acumulado'] }
                    });

                } catch (error) {
                    console.error('Error updating main chart:', error);
                }
            },

            // Utility methods
            findValueInData(data, targetLabel, month) {
                const found = DataProcessor.findRowRecursively(data, item =>
                    item.datos_bal?.toLowerCase().trim() === targetLabel.toLowerCase().trim()
                );
                return Number(found?.[month] || 0);
            },

            sumDataValues(data, month) {
                let sum = 0;
                data.forEach(item => {
                    if (item._children || item.children) {
                        const children = item._children || item.children;
                        children.forEach(child => {
                            sum = DataProcessor.addPrecise(sum, Number(child[month] || 0));
                        });
                    } else {
                        sum = DataProcessor.addPrecise(sum, Number(item[month] || 0));
                    }
                });
                return sum;
            },

            renumberSiblings(parentRow) {
                const siblings = parentRow.getTreeChildren().filter(sibling => {
                    const sData = sibling.getData();
                    return sData.datos_bal && !sData.isDescriptionRow;
                });

                siblings.forEach((sibling, index) => {
                    const sData = sibling.getData();
                    const newNumber = (index + 1).toString().padStart(2, '0');
                    sibling.update({
                        ...sData,
                        item: newNumber
                    });
                });
            },

            // Modal and UI helpers
            showModal(title, placeholder, initialValue = '', callback = null) {
                state.modalTitle = title;
                state.modalPlaceholder = placeholder;
                state.modalInput = initialValue;
                state.modalCallback = callback;
                state.showModal = true;
            },

            closeModal() {
                state.showModal = false;
                state.modalCallback = null;
                state.modalInput = '';
            },

            confirmModal() {
                if (state.modalCallback) {
                    state.modalCallback(state.modalInput);
                }
                methods.closeModal();
            },

            showBalanceSearchModal(balanceType) {
                methods.showModal(
                    'Buscar Balance',
                    `Nombre del balance para ${balanceType}`,
                    balanceType,
                    methods.handleBalanceSearch
                );
            },

            async handleBalanceSearch(balanceName) {
                try {
                    const result = await apiService.searchBalance(balanceName);
                    // Process and insert balance data
                    methods.insertBalanceData(result, balanceName);
                    methods.showSuccess('Balance cargado correctamente');
                } catch (error) {
                    methods.showError('No se encontró el balance');
                }
            },

            insertBalanceData(result, targetSection) {
                // Implementation for inserting balance data into tables
                console.log('Inserting balance data:', result, targetSection);
            },

            // Save data
            async saveData() {
                try {
                    state.loading = true;

                    const dataToSave = {
                        ingresos: tables.ingresos?.getData() || [],
                        gastos: tables.gastos?.getData() || [],
                        estado: tables.estado?.getData() || [],
                        resumen: tables.resumen?.getData() || []
                    };

                    await apiService.saveData(dataToSave);
                    methods.showSuccess('Datos guardados correctamente');

                } catch (error) {
                    methods.showError('Error al guardar los datos');
                } finally {
                    state.loading = false;
                }
            },

            // Default data structures
            getDefaultIngresos() {
                return [{
                    id: 1,
                    datos_bal: "INGRESOS TOTALES",
                    registro: "123",
                    ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0,
                    jul: 0, ago: 0, sep: 0, oct: 0, nov: 0, dic: 0,
                    total: 0,
                    children: [
                        { id: 2, datos_bal: "INGRESOS GENERALES", registro: "123", ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, sep: 0, oct: 0, nov: 0, dic: 0, total: 0 },
                        { id: 3, datos_bal: "INGRESOS DE INVERSION", registro: "123", ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, sep: 0, oct: 0, nov: 0, dic: 0, total: 0 },
                        { id: 4, datos_bal: "INGRESOS DE FINANCIAMIENTO", registro: "123", ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, sep: 0, oct: 0, nov: 0, dic: 0, total: 0 }
                    ]
                }];
            },

            getDefaultGastos() {
                return [{
                    id: 5,
                    datos_bal: "GASTOS TOTALES",
                    registro: "126",
                    ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0,
                    jul: 0, ago: 0, sep: 0, oct: 0, nov: 0, dic: 0,
                    total: 0,
                    children: [
                        { id: 6, datos_bal: "Gastos operativos", registro: "123", ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, sep: 0, oct: 0, nov: 0, dic: 0, total: 0 },
                        { id: 7, datos_bal: "Gastos de inversion", registro: "123", ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, sep: 0, oct: 0, nov: 0, dic: 0, total: 0 },
                        { id: 8, datos_bal: "Gastos de financiamiento", registro: "123", ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0, jul: 0, ago: 0, sep: 0, oct: 0, nov: 0, dic: 0, total: 0 }
                    ]
                }];
            },

            // Notification helpers
            showSuccess(message) {
                if (window.Swal) {
                    Swal.fire({ icon: 'success', title: 'Éxito', text: message, timer: 2000 });
                } else {
                    alert(message);
                }
            },

            showError(message) {
                if (window.Swal) {
                    Swal.fire({ icon: 'error', title: 'Error', text: message });
                } else {
                    alert(message);
                }
            },

            async showConfirmation(title, message) {
                if (window.Swal) {
                    const result = await Swal.fire({
                        title, text: message, icon: 'warning',
                        showCancelButton: true, confirmButtonText: 'Sí',
                        cancelButtonText: 'Cancelar'
                    });
                    return result.isConfirmed;
                } else {
                    return confirm(`${title}\n${message}`);
                }
            },

            calculateResumenKPIs() {
                // Implementation for KPI calculations in resumen view
                console.log('Calculating resumen KPIs');
            },

            updateResumenCharts() {
                // Implementation for updating comparison charts
                console.log('Updating resumen charts');
            }
        };

        // Lifecycle
        onMounted(() => {
            // Make app globally available for table callbacks
            window.balanceApp = methods;

            // Load initial data
            methods.loadInitialData();
        });

        // Watch for view changes
        watch(() => state.activeView, (newView) => {
            nextTick(() => {
                // Resize charts when view changes
                Object.values(charts).forEach(chart => {
                    if (chart && typeof chart.resize === 'function') {
                        chart.resize();
                    }
                });
            });
        });

        return {
            // State
            ...state,

            // Computed
            nome_balance,
            resumenKPIs,

            // Methods
            ...methods
        };
    }
};

// Initialize Vue app
createApp(BalanceApp).mount('#appBalances');