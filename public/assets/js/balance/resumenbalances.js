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
                    precision: 2  // 🔥 dos decimales en las celdas normales
                },
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: {
                    symbol: "S/ ",
                    precision: 2  // 🔥 dos decimales en el total
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
            placeholder: "No hay datos disponibles" // Mensaje para tablas vacías
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
            // Opcional: mostrar un mensaje de error en la UI
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
            // Opcional: Mostrar un mensaje de error al usuario en la UI
            // ej: document.querySelector('#error-message').textContent = 'No se pudieron cargar los datos.';
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
            totalesIngresos.real - totalesIngresos.planificado,
            totalesIngresos.planificado
        );

        // Actualizar resumen de gastos
        this._updateCard(
            'gasto',
            totalesGastos.real - totalesGastos.planificado,
            totalesGastos.planificado
        );
    }

    /**
     * Helper para actualizar una tarjeta de resumen individual (ingreso o gasto).
     */
    _updateCard(type, diferencia, totalPlanificado) {
        const esIngreso = type === 'ingreso';
        const esPositivo = diferencia >= 0;

        const montoEl = document.querySelector(this._ui[`${type}Monto`]);
        const porcentajeEl = document.querySelector(this._ui[`${type}Porcentaje`]);
        const textoEl = document.querySelector(this._ui[`${type}Texto`]);

        if (!montoEl || !porcentajeEl || !textoEl) return;

        // Formatear valores
        const montoFormateado = diferencia.toLocaleString('es-PE', { style: 'currency', currency: 'PEN' });
        const porcentaje = totalPlanificado !== 0 ? (diferencia / totalPlanificado) * 100 : 0;
        const porcentajeFormateado = `${porcentaje.toFixed(2)}%`;

        // Lógica de colores y texto
        let colorClass = '';
        let texto = '';
        if (esIngreso) {
            colorClass = esPositivo ? 'text-green-600' : 'text-red-600';
            texto = esPositivo ? 'SE SUPERÓ' : 'NO SE ALCANZÓ';
        } else { // Es gasto
            colorClass = esPositivo ? 'text-red-600' : 'text-green-600';
            texto = esPositivo ? 'SE SOBREGASTÓ' : 'SE AHORRÓ';
        }

        // Aplicar clases y texto
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
            // ELIMINADO: El título ya está en el HTML (h2)
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                backgroundColor: '#282c34', // Fondo de tooltip oscuro
                borderColor: '#555',
                textStyle: {
                    color: '#fff' // Texto de tooltip blanco
                }
            },
            legend: {
                data: ['Planificado', 'Real'],
                // NUEVO: Estilo para el texto de la leyenda
                textStyle: {
                    color: '#ccc' // Color de texto gris claro
                },
                top: '5%' // Un poco de espacio desde arriba
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
                    // NUEVO: Estilo para las etiquetas del eje X
                    color: '#ccc'
                },
                axisTick: {
                    show: false
                },
                axisLine: {
                    lineStyle: {
                        color: '#555' // Color de la línea del eje
                    }
                }
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: 'S/ {value}',
                    // NUEVO: Estilo para las etiquetas del eje Y
                    color: '#ccc'
                },
                splitLine: {
                    lineStyle: {
                        color: '#333' // Color de las líneas de la cuadrícula
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

        // NUEVO: Asegurarse de que los gráficos se redimensionen con la ventana
        // Esto es crucial para que se ajusten al contenedor responsivo
        window.addEventListener('resize', () => {
            this.chartIngresos?.resize();
            this.chartGastos?.resize();
        });
    }
}

export default ResumenBalance;