class ResumenBalance {
    // Centralizamos los selectores del DOM y constantes
    _ui = {
        idContabilidad: '#id_contabilidad',
        tableIngresos: '#table_balance_resumen_ingreso',
        tableGastos: '#table_balance_resumen_gastos',
        // IDs para las tarjetas de resumen (se deben agregar en el HTML)
        ingresoMonto: '#resumen-ingreso-monto',
        ingresoPorcentaje: '#resumen-ingreso-porcentaje',
        ingresoTexto: '#resumen-ingreso-texto',
        gastoMonto: '#resumen-gasto-monto',
        gastoPorcentaje: '#resumen-gasto-porcentaje',
        gastoTexto: '#resumen-gasto-texto',
        // IDs para los gráficos (se deben agregar en el HTML)
        chartIngresos: '#grafico-balance-ingresos',
        chartGastos: '#grafico-balance-gastos'
    };

    _api = {
        url: '/obtener-resumen-balances',
        csrfToken: document.querySelector('meta[name="csrf-token"]').getAttribute('content')
    };

    constructor() {
        this.tableResumenIngresos = null;
        this.tableResumenGastos = null;
        this.chartIngresos = null;
        this.chartGastos = null;
        this.init();
    }

    async init() {
        this._configureTables();
        this._initCharts();
        await this._loadDataResumen();
    }

    /**
     * Configura las dos tablas Tabulator.
     */
    _configureTables() {
        const columnas = [
            {
                title: "Concepto",
                field: "concepto",
                editor: "input",
                width: 300,
                headerSort: false,
                responsive: 0
            },
            {
                title: "Planificado",
                field: "planificado",
                editor: "input",
                bottomCalc: "sum",
                formatter: "money",
                formatterParams: {
                    symbol: "S/ ",
                    precision: 2
                },
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: {
                    symbol: "S/ ",
                    precision: 2
                }
            },
            {
                title: "Real",
                field: "real",
                editor: "input",
                bottomCalc: "sum",
                formatter: "money",
                formatterParams: {
                    symbol: "S/ ",
                    precision: 2
                },
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: {
                    symbol: "S/ ",
                    precision: 2
                }
            }
        ];

        this.tableResumenIngresos = this._createTable(this._ui.tableIngresos, columnas);
        this.tableResumenGastos = this._createTable(this._ui.tableGastos, columnas);
    }

    /**
     * Crea una instancia de Tabulator para evitar repetir código.
     */
    _createTable(selector, columns) {
        return new Tabulator(selector, {
            height: "auto",
            virtualDom: true,
            layout: "fitColumns",
            columns: columns,
            placeholder: "No hay datos disponibles"
        });
    }

    /**
     * Inicializa las instancias de ECharts.
     */
    _initCharts() {
        const chartIngresosEl = document.querySelector(this._ui.chartIngresos);
        const chartGastosEl = document.querySelector(this._ui.chartGastos);

        if (chartIngresosEl) this.chartIngresos = echarts.init(chartIngresosEl);
        if (chartGastosEl) this.chartGastos = echarts.init(chartGastosEl);
    }

    /**
     * Carga los datos del servidor, actualiza tablas, resúmenes y gráficos.
     */
    async _loadDataResumen() {
        const id_contabilidad = document.querySelector(this._ui.idContabilidad)?.value;
        if (!id_contabilidad) {
            console.error("No se encontró el ID de contabilidad.");
            return;
        }

        try {
            const response = await fetch(this._api.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': this._api.csrfToken
                },
                body: JSON.stringify({ id_contabilidad })
            });

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const result = await response.json();

            if (result.status === "success" && result.data) {
                // Actualizar tablas
                this.tableResumenIngresos.setData(result.data.ingresos || []);
                this.tableResumenGastos.setData(result.data.gastos || []);

                // Actualizar tarjetas de resumen
                this._updateSummaryCards(result.data.ingresos || [], result.data.gastos || []);

                // Actualizar gráficos
                this._renderCharts(result.data.ingresos || [], result.data.gastos || []);
            } else {
                throw new Error(result.message || 'La respuesta del servidor no fue exitosa.');
            }
        } catch (error) {
            console.error("Error al cargar el resumen del balance:", error);
        }
    }

    /**
     * Calcula y actualiza las tarjetas de resumen de ingresos y gastos.
     */
    _updateSummaryCards(ingresos = [], gastos = []) {
        // Helper para calcular totales
        const calculateTotals = (data) => data.reduce(
            (acc, item) => {
                acc.planificado += parseFloat(item.planificado) || 0;
                acc.real += parseFloat(item.real) || 0;
                return acc;
            },
            { planificado: 0, real: 0 }
        );

        const totalesIngresos = calculateTotals(ingresos);
        const totalesGastos = calculateTotals(gastos);

        // Actualizar resumen de ingresos
        this._updateCard(
            'ingreso',
            totalesIngresos.real - totalesIngresos.planificado,  // diferencia = real - programado
            totalesIngresos.real,
            totalesIngresos.planificado
        );

        // Actualizar resumen de gastos
        this._updateCard(
            'gasto',
            totalesGastos.real - totalesGastos.planificado,      // diferencia = real - programado
            totalesGastos.real,
            totalesGastos.planificado
        );
    }

    /**
     * Helper para actualizar una tarjeta de resumen individual (ingreso o gasto).
     */
    _updateCard(type, diferencia, totalReal, totalPlanificado) {
        console.log(totalReal);
        console.log(diferencia);
        console.log(totalPlanificado);
        const montoEl = document.querySelector(this._ui[`${type}Monto`]);
        const porcentajeEl = document.querySelector(this._ui[`${type}Porcentaje`]);
        const textoEl = document.querySelector(this._ui[`${type}Texto`]);

        if (!montoEl || !porcentajeEl || !textoEl) return;

        // Formatear monto de la diferencia
        const montoFormateado = diferencia.toLocaleString('es-PE', {
            style: 'currency',
            currency: 'PEN'
        });

        // Calcular porcentaje: (totalReal / totalPlanificado) * 100
        const porcentaje = totalPlanificado !== 0 ? (totalReal / totalPlanificado) * 100 : 0;
        const porcentajeFormateado = `${porcentaje.toFixed(2)}%`;

        // Determinar color basado en si la diferencia es positiva o negativa
        const esPositivo = diferencia >= 0;
        const colorClass = esPositivo ? 'text-green-600' : 'text-red-600';

        // Determinar texto descriptivo
        let texto = '';
        if (type === 'ingreso') {
            texto = esPositivo ? 'SE SUPERÓ' : 'NO SE ALCANZÓ';
        } else { // Es gasto
            texto = esPositivo ? 'SE SOBREGASTÓ' : 'SE AHORRÓ';
        }

        // Aplicar valores y estilos
        montoEl.textContent = montoFormateado;
        montoEl.className = `text-2xl font-bold mt-2 ${colorClass}`;

        porcentajeEl.textContent = porcentajeFormateado;
        porcentajeEl.className = `text-xl font-semibold ${colorClass}`;

        textoEl.textContent = texto;
    }

    /**
     * Renderiza los gráficos de barras para ingresos y gastos.
     */
    _renderCharts(ingresos = [], gastos = []) {
        const prepareChartData = (data) => {
            const conceptos = data.map(item => item.concepto);
            const planificado = data.map(item => parseFloat(item.planificado) || 0);
            const real = data.map(item => parseFloat(item.real) || 0);
            return { conceptos, planificado, real };
        };

        const dataIngresos = prepareChartData(ingresos);
        const dataGastos = prepareChartData(gastos);

        // Plantilla de opciones con estilos para modo oscuro
        const getChartOption = (chartData) => ({
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                backgroundColor: '#282c34',
                borderColor: '#555',
                textStyle: {
                    color: '#fff'
                }
            },
            legend: {
                data: ['Planificado', 'Real'],
                textStyle: {
                    color: '#ccc'
                },
                top: '5%'
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: chartData.conceptos,
                axisLabel: {
                    interval: 0,
                    rotate: 45,
                    color: '#ccc'
                },
                axisTick: {
                    show: false
                },
                axisLine: {
                    lineStyle: {
                        color: '#555'
                    }
                }
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: 'S/ {value}',
                    color: '#ccc'
                },
                splitLine: {
                    lineStyle: {
                        color: '#333'
                    }
                }
            },
            series: [
                {
                    name: 'Planificado',
                    type: 'bar',
                    data: chartData.planificado,
                    itemStyle: { color: '#5470c6' }
                },
                {
                    name: 'Real',
                    type: 'bar',
                    data: chartData.real,
                    itemStyle: { color: '#ee6666' }
                }
            ]
        });

        if (this.chartIngresos) {
            this.chartIngresos.setOption(getChartOption(dataIngresos));
        }
        if (this.chartGastos) {
            this.chartGastos.setOption(getChartOption(dataGastos));
        }

        // Redimensionar gráficos con la ventana
        window.addEventListener('resize', () => {
            this.chartIngresos?.resize();
            this.chartGastos?.resize();
        });
    }
}

export default ResumenBalance;