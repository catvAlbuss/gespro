class Consolidado {
    constructor() {
        this.tabla = {};
        this.dataConsolidad0 = null;
        this.costoDirecto = 0;
        this.formatoMoneda = {
            decimal: ".",
            thousand: ",",
            symbol: "S/. ",
            precision: 2
        };
        this.formatoPorcent = {
            symbol: "%",
        };
        this.gastosTotalSupervision = 0;
        this.fetchData();
    }

    async fetchData() {
        const id_presupuesto = document.getElementById('id_presupuestos').value;
        try {
            const [
                resumenTotalMetrados,
                resumenAggResponse,
                supervisionResponse,
                remuneracionesResponse,
                controlConcurrenteResponse
            ] = await Promise.all([
                fetch('/obtener-gasto-metrados', { // Reemplaza con tu ruta de Laravel
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr("content")
                    },
                    body: JSON.stringify({ id_presupuesto })
                }),
                fetch('/obtener-gasto_generales', { // Reemplaza con tu ruta de Laravel
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr("content")
                    },
                    body: JSON.stringify({ id_presupuesto })
                }),
                fetch('/obtener-gasto-supervision', { // Reemplaza con tu ruta de Laravel
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr("content")
                    },
                    body: JSON.stringify({ id_presupuesto })
                }),
                fetch('/obtener-remuneraciones', { // Reemplaza con tu ruta de Laravel
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr("content")
                    },
                    body: JSON.stringify({ id_presupuesto })
                }),
                fetch('/obtener-control-concurrente', { // Reemplaza con tu ruta de Laravel
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr("content")
                    },
                    body: JSON.stringify({ id_presupuesto })
                })
            ]);

            // Check if all responses are ok
            if (!resumenAggResponse.ok || !supervisionResponse.ok || !remuneracionesResponse.ok || !controlConcurrenteResponse.ok) {
                throw new Error('Some responses were not successful');
            }
            const totalMetrados = await resumenTotalMetrados.json();
            const resumenAggData = await resumenAggResponse.json();
            const supervisionData = await supervisionResponse.json();
            const remuneracionesData = await remuneracionesResponse.json();
            const controlConcurrenteData = await controlConcurrenteResponse.json();

            //Datos Parseados para su uso en RESUMEN GENERAL
            const getDataParseTotalMetrados = JSON.parse(totalMetrados.totalmetrados);
            const getDataParseAgg = JSON.parse(resumenAggData.data.gastos_generales);
            const getDataParseSupervision = JSON.parse(supervisionData.data.gastos_supervision);
            const getDataParseremuneracion = remuneracionesData.data.remuneraciones;
            const getDataParseControl = JSON.parse(controlConcurrenteData.data.control_concurrente);

            //Preparar datos para la tabla resumen-agg
            const dataResumenAgg = [
                { item: "I", descripcion: "Gastos Generales Fijos", und: "", cantidad: "", precioUnitario: "", valorTotal: "" },
                {
                    item: "1",
                    descripcion: "Análisis de Gastos Generales Fijos",
                    und: "Glb",
                    cantidad: "1.00",
                    precioUnitario: getDataParseAgg.totalGastoGeneralFijo,
                    valorTotal: getDataParseAgg.totalGastoGeneralFijo
                },
                { item: "II", descripcion: "Gastos Generales Variables", und: "", cantidad: "", precioUnitario: "", valorTotal: "" },
                {
                    item: "1",
                    descripcion: "Análisis de Gastos Generales Variables",
                    und: "Glb",
                    cantidad: "1.00",
                    precioUnitario: getDataParseAgg.totalGastoGeneralVariable,
                    valorTotal: getDataParseAgg.totalGastoGeneralVariable
                }
            ];

            //Preparar datos para la tabla resumen-ags
            const dataResumenAgs = [
                { item: "I", descripcion: "Gastos Generales de Supervision", und: "", cantidad: "", precioUnitario: "", valorTotal: "" },
                {
                    item: "1",
                    descripcion: "Análisis de Gastos de Supervisión",
                    und: "Glb",
                    cantidad: "1.00",
                    precioUnitario: getDataParseSupervision.totalSupervision,
                    valorTotal: getDataParseSupervision.totalSupervision
                }
            ];

            // Sumar todos los subtotales de getDataParseTotalMetrados
            const totalSubtotales = getDataParseTotalMetrados.reduce((acc, item) => acc + item.subtotal, 0);


            const dataDescripcionCosto = [
                { id: 1, item: "01", descripcion: "COMPONENTE I" },
                { id: 4, item: "", descripcion: "* COSTO DIRECTO", valor: "52" },
                { id: 5, item: "", descripcion: "* Gastos Generales", valor: getDataParseAgg.totalGastoGeneralFijo },
                { id: 6, item: "", descripcion: "* Utilidad", valor: "1629843.52" },
                { id: 8, item: "", descripcion: "SUB TOTAL PRESUPUESTO", valor: "1629843.52" },
                { id: 9, item: "", descripcion: "* Impuesto General a las Ventas", valor: "1629843.52" },
                { id: 10, item: "", descripcion: "SUB TOTAL PRESUPUESTO COMPONENTE I", valor: "1629843.52" },
                { id: 11, item: "", descripcion: "* Componente II: Mobiliario y Equipamiento", valor: "1629843.52" },
                { id: 12, item: "", descripcion: "*Impuesto General a las Ventas", valor: "1629843.52" },
                { id: 13, item: "", descripcion: "SUB TOTAL PRESUPUESTO COMPONENTE II", valor: "1629843.52" },
                // { id: 14, item: "", descripcion: "* Componente III: Plan Prevencion y Control Covid-19", valor: "1629843.52" },
                // { id: 15, item: "", descripcion: "* Gastos Generales ", valor: "1629843.52" },
                // { id: 16, item: "", descripcion: " SUB TOTAL PRESUPUESTO", valor: "1629843.52" },
                { id: 17, item: "", descripcion: "* Impuesto General a las Ventas ", valor: "1629843.52" },
                { id: 18, item: "", descripcion: "SUB TOTAL PRESUPUESTO COMPONENTE III", valor: "1629843.52" },
                { id: 19, item: "", descripcion: "TOTAL PRESUPUESTO DE OBRA COMPONENTE I + II+III", valor: "1629843.52" },
                { id: 20, item: "", descripcion: "* Gastos Supervision  y Liquidacion", valor: "1629843.52" },
                { id: 21, item: "", descripcion: "TOTAL", valor: "1629843.52" },
                {
                    id: 'static_total_texto',
                    descripcion: "SON: ",
                    valor: "",
                    isStatic: true,
                    editor: false,
                },
                {
                    id: 'static_control_concurrente',
                    descripcion: "(***)Control Concurrente Financiado por la entidad -- (hasta 2.0%)",
                    valor: 0,
                    isStatic: true,
                    editor: false
                },
                {
                    id: 'static_total_inversion_obra',
                    descripcion: "TOTAL DE INVERSION PARA LA OBRA",
                    valor: 0,
                    isStatic: true,
                    editor: false
                },
                {
                    id: 'static_control_concurrente_texto',
                    descripcion: " SON: ",
                    valor: "",
                    isStatic: true,
                    editor: false
                }
            ];

            // Asignar los datos de getDataParseTotalMetrados entre "COMPONENTE I" y "* COSTO DIRECTO"
            let totalMetradosIndex = 1; // Empezamos desde el índice después de "COMPONENTE I"

            // Insertamos los valores de `totalMetrados` en el array
            getDataParseTotalMetrados.forEach((item, index) => {
                // Asegúrate de insertar los datos entre "COMPONENTE I" y "* COSTO DIRECTO"
                if (totalMetradosIndex < dataDescripcionCosto.length - 3) {  // No insertar más allá de "* COSTO DIRECTO"
                    dataDescripcionCosto.splice(totalMetradosIndex, 0, {
                        id: index + 2,  // Asignar un ID único para cada componente
                        item: item.item,
                        descripcion: item.descripcion,
                        valor: item.subtotal // Formatear como moneda
                    });
                    totalMetradosIndex++; // Avanzamos al siguiente índice
                }
            });

            //monto gasto general
            const costofijo = parseFloat(getDataParseAgg.totalGastoGeneralFijo);
            const costovariable = parseFloat(getDataParseAgg.totalGastoGeneralVariable);
            // Convertir el valor actual a número para sumarlo al total
            const SumaGastos = costofijo + costovariable;
            this.costoDirecto = SumaGastos;
            //monto total utilidad
            const porcentajeUtilidad = 5;
            const costoUtilidad = totalSubtotales * (porcentajeUtilidad / 100);

            //monto total presupuesto: 
            const montoTotalPresupuestos = Math.round(totalSubtotales + costoUtilidad + SumaGastos);

            //monto total impuesto
            const totalInpuesto = Math.round(montoTotalPresupuestos * 0.18);
            const totalInpuestoPorcentaje = Math.round((totalInpuesto / montoTotalPresupuestos) * 100);
            //monto subtotal presupuesto comp 2
            const subtotalPresuCompONE = totalInpuesto + montoTotalPresupuestos
            const compOneME = 109367.36 / 1.18;
            const impuestoGenVentas = Math.round(compOneME * 0.18);
            const impuestoGenVentasPorcent = Math.round((impuestoGenVentas / compOneME) * 100);

            const compTwoME = compOneME + impuestoGenVentas;
            //covid
            // const compThree = 81613.92;
            // const gastoGencompTwo = 16502.33;
            // const gastoGencompTwoPorcentaje = gastoGencompTwo / compThree;
            //const subtotalPresuCompTwo = compThree + gastoGencompTwo;
            const impuestoGenVentasCompTwo = compTwoME * 0.18;
            const impuestoGenVentasCompTwoPorcentaje = Math.round((impuestoGenVentasCompTwo / compTwoME) * 100);

            const subTotalPresuCompThree = compTwoME + impuestoGenVentasCompTwo;

            const totalPresuCompThree = subtotalPresuCompONE + compTwoME + subTotalPresuCompThree;

            const gastosSuperLiquidacion = getDataParseSupervision.totalSupervision;
            this.gastosTotalSupervision = gastosSuperLiquidacion;
            const gastosSuperLiquidacionPorcentaje = Math.round((gastosSuperLiquidacion / totalPresuCompThree) * 100);
            const totalFinal = totalPresuCompThree + gastosSuperLiquidacion;

            const totalFinalTextual = this.convertirMontoATexto(totalFinal);

            const costoConcurrenteSubTotal = parseFloat(getDataParseControl.subtotal);
            const costoConcurrenteTotal = parseFloat(getDataParseControl.total);

            let controlConcurrenteFinanciado = 0; // Inicializamos la variable

            if (costoConcurrenteSubTotal < costoConcurrenteTotal) {
                controlConcurrenteFinanciado = costoConcurrenteSubTotal;
            } else {
                controlConcurrenteFinanciado = costoConcurrenteTotal;
            }

            const totalInversionObra = totalFinal + controlConcurrenteFinanciado;
            const montoTotalTextual = this.convertirMontoATexto(totalInversionObra);

            dataDescripcionCosto.forEach(item => {
                if (item.descripcion === "* COSTO DIRECTO") {
                    // Convertir el valor actual a número para sumarlo al total
                    const currentValue = parseFloat(item.valor.replace(/[^0-9.-]+/g, "")); // Eliminar cualquier carácter no numérico (como comas)
                    const updatedValue = totalSubtotales;

                    // Actualizamos el valor con la nueva suma
                    item.valor = updatedValue;
                }
                if (item.descripcion === "* Gastos Generales") {
                    const porcentajeGastos = (SumaGastos / totalSubtotales) * 100;
                    // Actualizamos el valor con la nueva suma
                    item.valor = SumaGastos;
                    item.porcentajeValor = porcentajeGastos;
                }
                if (item.descripcion === "* Utilidad") {
                    const porcentajeUtilidad = 5;
                    const costoUtilidad = totalSubtotales * (porcentajeUtilidad / 100);
                    item.valor = costoUtilidad;
                    item.porcentajeValor = porcentajeUtilidad;
                }
                if (item.descripcion === "SUB TOTAL PRESUPUESTO") {
                    item.valor = montoTotalPresupuestos;
                }
                if (item.descripcion === "* Impuesto General a las Ventas") {
                    item.valor = totalInpuesto;
                    item.porcentajeValor = totalInpuestoPorcentaje;
                }
                if (item.descripcion === "SUB TOTAL PRESUPUESTO COMPONENTE I") {
                    item.valor = subtotalPresuCompONE;
                }
                if (item.descripcion === "* Componente II: Mobiliario y Equipamiento") {
                    item.valor = compOneME;
                }
                if (item.descripcion === "*Impuesto General a las Ventas") {
                    item.valor = impuestoGenVentas;
                    item.porcentajeValor = impuestoGenVentasPorcent;
                }
                if (item.descripcion === "SUB TOTAL PRESUPUESTO COMPONENTE II") {
                    item.valor = compTwoME;
                }
                // if (item.descripcion === "* Componente III: Plan Prevencion y Control Covid-19") {
                //     item.valor = compThree;
                // }
                // if (item.descripcion === "* Gastos Generales ") {
                //     item.valor = gastoGencompTwo;
                //     item.porcentajeValor = gastoGencompTwoPorcentaje
                // }
                // if (item.descripcion === " SUB TOTAL PRESUPUESTO") {
                //     item.valor = subtotalPresuCompTwo;
                // }
                if (item.descripcion === "* Impuesto General a las Ventas ") {
                    item.valor = impuestoGenVentasCompTwo;
                    item.porcentajeValor = impuestoGenVentasCompTwoPorcentaje
                }
                if (item.descripcion === "SUB TOTAL PRESUPUESTO COMPONENTE III") {
                    item.valor = subTotalPresuCompThree;
                }
                if (item.descripcion === "TOTAL PRESUPUESTO DE OBRA COMPONENTE I + II+III") {
                    item.valor = totalPresuCompThree;
                }
                if (item.descripcion === "* Gastos Supervision  y Liquidacion") {
                    item.valor = gastosSuperLiquidacion;
                    item.porcentajeValor = gastosSuperLiquidacionPorcentaje;
                }
                if (item.descripcion === "TOTAL") {
                    item.valor = totalFinal;
                }
                if (item.descripcion === "SON: ") {
                    item.valor = totalFinalTextual;
                }
                if (item.descripcion === "(***)Control Concurrente Financiado por la entidad -- (hasta 2.0%)") {
                    item.valor = controlConcurrenteFinanciado;
                }
                if (item.descripcion === "TOTAL DE INVERSION PARA LA OBRA") {
                    item.valor = totalInversionObra;
                }
                if (item.descripcion === " SON: ") {
                    item.valor = montoTotalTextual;
                }
            });

            this.initializeTables(dataResumenAgg, dataResumenAgs, dataDescripcionCosto);
            // Add static rows after data is loaded

        } catch (error) {
            console.error('Error al cargar datos:', error);
            this.init();
        }
    }

    getTotalFromResponse(response, key = 'total') {
        if (response && response.status === 'success' && response.data && response.data[key]) {
            try {
                const parsedData = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
                return parsedData[key] || "";
            } catch (e) {
                console.warn(`Error parsing data for key "${key}":`, e);
                return "";
            }
        }
        return "";
    }

    init() {
        try {
            const container = this.getContainer();
            this.createHTMLStructure(container);
            this.initializeTables();
            this.setupEventListeners();
        } catch (error) {
            this.handleError('Error en inicialización', error);
        }
    }

    /**
     * Convierte un número a su representación textual en soles
     * @param {number} numero - El monto a convertir
     * @return {string} El monto en texto
     */
    convertirMontoATexto(numero) {
        // Validación básica
        if (typeof numero !== 'number' || isNaN(numero)) {
            return "CANTIDAD NO VÁLIDA";
        }

        // Formatear el número a dos decimales
        const numeroFormateado = Math.round(numero * 100) / 100;
        const partes = numeroFormateado.toString().split('.');
        let entero = parseInt(partes[0]);
        const decimal = partes.length > 1 ? parseInt(partes[1].padEnd(2, '0')) : 0;

        // Arrays para la conversión
        const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
        const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
        const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
        const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

        // Función para convertir grupos de tres dígitos
        const convertirGrupo = (numero) => {
            let resultado = '';

            // Centenas
            if (numero >= 100) {
                if (numero === 100) {
                    return 'CIEN';
                } else {
                    resultado += centenas[Math.floor(numero / 100)];
                    numero %= 100;
                    if (numero > 0) {
                        resultado += ' ';
                    }
                }
            }

            // Decenas y unidades
            if (numero > 0) {
                if (numero < 10) {
                    resultado += unidades[numero];
                } else if (numero < 20) {
                    resultado += especiales[numero - 10];
                } else {
                    const unidad = numero % 10;
                    resultado += decenas[Math.floor(numero / 10)];
                    if (unidad > 0) {
                        resultado += ' Y ' + unidades[unidad];
                    }
                }
            }

            return resultado;
        };

        if (entero === 0) {
            return 'CERO CON ' + (decimal < 10 ? '0' + decimal : decimal) + '/100 SOLES';
        }

        let resultado = '';

        // Procesar miles de millones
        if (entero >= 1000000000) {
            const milesMillones = Math.floor(entero / 1000000000);
            if (milesMillones === 1) {
                resultado += 'UN MIL MILLÓN ';
            } else {
                resultado += convertirGrupo(milesMillones) + ' MIL MILLONES ';
            }
            entero %= 1000000000;
        }

        // Procesar millones
        if (entero >= 1000000) {
            const millones = Math.floor(entero / 1000000);
            if (millones === 1) {
                resultado += 'UN MILLÓN ';
            } else {
                resultado += convertirGrupo(millones) + ' MILLONES ';
            }
            entero %= 1000000;
        }

        // Procesar miles
        if (entero >= 1000) {
            const miles = Math.floor(entero / 1000);
            if (miles === 1) {
                resultado += 'MIL ';
            } else {
                resultado += convertirGrupo(miles) + ' MIL ';
            }
            entero %= 1000;
        }

        // Procesar centenas, decenas y unidades
        if (entero > 0) {
            resultado += convertirGrupo(entero);
        }

        // Agregar el formato monetario
        resultado += ' CON ' + (decimal < 10 ? '0' + decimal : decimal) + '/100 SOLES';

        return resultado.trim();
    }

    getContainer() {
        const container = document.getElementById('consolidado_table');
        if (!container) {
            throw new Error('Contenedor gastosfijos no encontrado');
        }
        return container;
    }

    createHTMLStructure(container) {
        container.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold">Gastos Fijos <button class="guardar-Consolidado text-xs" id="guardar-Consolidado">💾</button></h2>
            </div>
            <div class="table-section">
                <h3>Resúmen de Análisis de Gastos Generales</h3>
                <div id="table-resumen-agg"></div>
            </div>
            
            <div class="table-section py-5">
                <h3>Resúmen de Análisis de Gastos De Supervision</h3>
                <div id="table-analisis-gp"></div>
            </div>
            
            <div class="table-section py-5">
                <h3>DESCRIPCION DEL COSTO</h3>
                <div id="table-descripcion-costo"></div>
            </div>
        `;
    }

    setupEventListeners() {
        document.getElementById('guardar-Consolidado').addEventListener('click', () => this.guardarConsolidado());
    }

    recalcularGGfijosTotal(row) {
        const data = row.getData();
        const canitdad = (parseFloat(data.cantidad) || 0);
        const precioUnitario = (parseFloat(data.precioUnitario) || 0);
        const resultadoTotal = canitdad * precioUnitario;

        row.update({
            valorTotal: resultadoTotal
        });
    }

    recalcularGGsupervisionTotal(row) {
        const data = row.getData();
        const canitdad = (parseFloat(data.cantidad) || 0);
        const precioUnitario = (parseFloat(data.precioUnitario) || 0);
        const resultadoTotal = canitdad * precioUnitario;

        row.update({
            valorTotal: resultadoTotal
        });
    }

    recalculaPorcentajeTotal(row) {
        const data = row.getData();
        const porcentaje = (parseFloat(data.porcentajeValor) || 0);
        const resultadoTotal = porcentaje * this.costoDirecto;

        row.update({
            valor: resultadoTotal
        });
    }

    initializeTables(dataResumenAgg, dataResumenAgs, dataDescripcionCosto) {
        this.tabla.resumenagg = new Tabulator("#table-resumen-agg", {
            height: "auto",
            layout: "fitColumns",
            data: dataResumenAgg,
            columns: [
                { title: "Item", field: "item", width: 100 },
                { title: "Descripción", field: "descripcion", width: 400 },
                { title: "Und.", field: "und", resizable: true },
                {
                    title: "Cantidad",
                    field: "cantidad",
                    resizable: true,
                    hozAlign: "right",
                    editor: "number",
                    cellEdited: (cell) => {
                        this.recalcularGGfijosTotal(cell.getRow());
                    }
                },
                {
                    title: "Precio Unitario S/.",
                    field: "precioUnitario",
                    resizable: true,
                    hozAlign: "right",
                    formatter: "money",
                    formatterParams: this.formatoMoneda,
                    editor: false
                },
                {
                    title: "Valor Total S/.",
                    field: "valorTotal",
                    resizable: true,
                    hozAlign: "right",
                    formatter: "money",
                    formatterParams: this.formatoMoneda,
                    bottomCalc: "sum",
                    bottomCalcFormatter: "money",
                    bottomCalcFormatterParams: this.formatoMoneda,
                    mutator: function (value, data) {
                        return data.cantidad && data.precioUnitario ?
                            parseFloat(data.cantidad) * parseFloat(data.precioUnitario) :
                            value;
                    }
                },
            ],
        });

        this.tabla.resumenags = new Tabulator("#table-analisis-gp", {
            height: "auto",
            layout: "fitColumns",
            data: dataResumenAgs,
            columns: [
                { title: "Item", field: "item", width: 100 },
                { title: "Descripción", field: "descripcion", width: 400, resizable: true },
                { title: "Und.", field: "und", resizable: true },
                {
                    title: "Cantidad",
                    field: "cantidad",
                    resizable: true,
                    hozAlign: "right",
                    editor: "number",
                    cellEdited: (cell) => {
                        this.recalcularGGsupervisionTotal(cell.getRow());
                    }
                },
                {
                    title: "Precio Unitario S/.",
                    field: "precioUnitario",
                    resizable: true,
                    hozAlign: "right",
                    formatter: "money",
                    formatterParams: this.formatoMoneda,
                    editor: false
                },
                {
                    title: "Valor Total S/.",
                    field: "valorTotal",
                    resizable: true,
                    hozAlign: "right",
                    formatter: "money",
                    formatterParams: this.formatoMoneda,
                    bottomCalc: "sum",
                    bottomCalcFormatter: "money",
                    bottomCalcFormatterParams: this.formatoMoneda,
                    mutator: function (value, data) {
                        return data.cantidad && data.precioUnitario ?
                            parseFloat(data.cantidad) * parseFloat(data.precioUnitario) :
                            value;
                    }
                },
            ],
        });

        this.tabla.descripcionCosto = new Tabulator("#table-descripcion-costo", {
            height: "auto",
            layout: "fitColumns",
            data: dataDescripcionCosto,
            columns: [
                { title: "", field: "item", width: 50, headerSort: false, resizable: true },
                { title: "", field: "descripcion", width: 450, headerSort: false, resizable: true },
                {
                    title: "",
                    field: "valor",
                    hozAlign: "right",
                    formatter: "money",
                    formatterParams: this.formatoMoneda,
                    headerSort: false,
                    resizable: true,
                    editor: function (cell, onRendered, success, cancel, editorParams) {
                        const descripcion = cell.getRow().getData().descripcion;
                        if (descripcion === "* Componente II: Mobiliario y Equipamiento") {
                            let input = document.createElement("input");
                            input.setAttribute("type", "number");
                            input.style.width = "100%";
                            input.style.padding = "4px";
                            input.value = cell.getValue() || "";

                            onRendered(() => {
                                input.focus();
                            });

                            input.addEventListener("blur", function () {
                                success(input.value);
                            });

                            return input;
                        }
                        return false;
                    },
                    cellEdited: (cell) => {
                        this.recalcularValores(cell.getRow());
                    }
                },
                {
                    title: "",
                    field: "porcentajeValor",
                    headerSort: false,
                    editor: function (cell, onRendered, success, cancel, editorParams) {
                        const descripcion = cell.getRow().getData().descripcion;
                        if (descripcion === "* Utilidad") {
                            let input = document.createElement("input");
                            input.setAttribute("type", "number");
                            input.style.width = "100%";
                            input.style.padding = "4px";
                            input.value = cell.getValue() || "";

                            onRendered(() => {
                                input.focus();
                            });

                            input.addEventListener("blur", function () {
                                success(input.value);
                            });

                            return input;
                        }
                        return false;
                    },
                    formatter: (cell) => {
                        const value = cell.getValue();
                        return value ? value + "%" : "";
                    },
                    cellEdited: (cell) => {
                        this.recalcularPorcentajes(cell.getRow());
                    }
                }
            ],
        });
    }

    recalcularValores(row) {
        const data = row.getData();
        const descripcion = data.descripcion;

        if (descripcion === "* Componente II: Mobiliario y Equipamiento") {
            const valor = parseFloat(data.valor) || 0;
            const igv = valor / 1.18;
            const inpuestoGen = igv * 0.18;
            const porcentajeInpuestoGen = (inpuestoGen / igv) * 100;
            this.tabla.descripcionCosto.getRows().forEach(r => {
                if (r.getData().descripcion === "* Componente II: Mobiliario y Equipamiento") {
                    r.update({
                        valor: igv
                    })
                }
            });
            // Actualizar IGV
            this.tabla.descripcionCosto.getRows().forEach(r => {
                if (r.getData().descripcion === "*Impuesto General a las Ventas") {
                    r.update({
                        valor: inpuestoGen,
                        porcentajeValor: porcentajeInpuestoGen
                    });
                }
            });

            // Actualizar subtotal del componente II
            this.tabla.descripcionCosto.getRows().forEach(r => {
                if (r.getData().descripcion === "SUB TOTAL PRESUPUESTO COMPONENTE II") {
                    r.update({ valor: valor + igv });
                }
            });

            this.actualizarTotales();
        }
    }

    recalcularPorcentajes(row) {
        const data = row.getData();
        if (data.descripcion === "* Utilidad") {
            const porcentaje = parseFloat(data.porcentajeValor) || 0;
            const costoDirecto = this.obtenerCostoDirecto();
            const utilidad = costoDirecto * (porcentaje / 100);

            row.update({ valor: utilidad });
            this.actualizarSubtotales();
        }
    }

    obtenerCostoDirecto() {
        const row = this.tabla.descripcionCosto.getRows().find(r =>
            r.getData().descripcion === "* COSTO DIRECTO"
        );
        return parseFloat(row.getData().valor) || 0;
    }

    actualizarSubtotales() {
        const costoDirecto = this.obtenerCostoDirecto();
        const gastosGenerales = parseFloat(this.tabla.descripcionCosto.getRows().find(r =>
            r.getData().descripcion === "* Gastos Generales"
        ).getData().valor) || 0;
        const utilidad = parseFloat(this.tabla.descripcionCosto.getRows().find(r =>
            r.getData().descripcion === "* Utilidad"
        ).getData().valor) || 0;

        const subtotal = costoDirecto + gastosGenerales + utilidad;
        const igv = subtotal * 0.18;

        this.tabla.descripcionCosto.getRows().forEach(row => {
            const data = row.getData();
            switch (data.descripcion) {
                case "SUB TOTAL PRESUPUESTO":
                    row.update({ valor: subtotal });
                    break;
                case "* Impuesto General a las Ventas":
                    row.update({ valor: igv, porcentajeValor: 18 });
                    break;
                case "SUB TOTAL PRESUPUESTO COMPONENTE I":
                    row.update({ valor: subtotal + igv });
                    break;
            }
        });

        this.actualizarTotales();
    }

    calcularTotalGeneral() {
        if (!this.tabla || !this.tabla.descripcionCosto || !this.tabla.descripcionCosto.getRows) {
            console.error("Error: this.tabla o this.tabla.descripcionCosto no están definidas o no tienen el método getRows.");
            return 0;
        }

        let totalGeneral = 0;
        const componenteI = parseFloat(this.tabla.descripcionCosto.getRows().find(r =>
            r.getData().descripcion === "SUB TOTAL PRESUPUESTO COMPONENTE I"
        )?.getData()?.valor) || 0;
        const componenteII = parseFloat(this.tabla.descripcionCosto.getRows().find(r =>
            r.getData().descripcion === "SUB TOTAL PRESUPUESTO COMPONENTE II"
        )?.getData()?.valor) || 0;
        const componenteIII = parseFloat(this.tabla.descripcionCosto.getRows().find(r =>
            r.getData().descripcion === "SUB TOTAL PRESUPUESTO COMPONENTE III"
        )?.getData()?.valor) || 0;

        totalGeneral = componenteI + componenteII + componenteIII;
        return totalGeneral;
    }

    // Método existente que ahora utiliza calcularTotalGeneral y actualiza la tabla
    actualizarTotales() {
        const totalGeneral = this.calcularTotalGeneral();

        const obtenerPorcentaje = (this.gastosTotalSupervision / totalGeneral) * 100
        if (this.tabla && this.tabla.descripcionCosto && this.tabla.descripcionCosto.getRows) {
            this.tabla.descripcionCosto.getRows().forEach(row => {
                const data = row.getData();
                if (data.descripcion === "TOTAL PRESUPUESTO DE OBRA COMPONENTE I + II+III") {
                    row.update({ valor: totalGeneral });
                }
                if (data.descripcion === "* Gastos Supervision y Liquidacion") {
                    row.update({ valor: this.gastosTotalSupervision, porcentajeValor: obtenerPorcentaje });
                }
            });
        }
        return totalGeneral;
    }

    getValorTotalFinalConsolidado() {
        const totalGeneralComponente = this.calcularTotalGeneral()
        const calcularTotalFinal = totalGeneralComponente + this.gastosTotalSupervision;
        return calcularTotalFinal;
    }

    guardarConsolidado() {
        try {
            const id_presupuesto = document.getElementById('id_presupuestos').value;

            // Obtener datos de todas las tablas
            const allData = {
                resumenAgg: this.tabla.resumenagg.getData(),
                resumenAgs: this.tabla.resumenags.getData(),
                descripcionCosto: this.tabla.descripcionCosto.getData(),
                totalFinal: this.getValorTotalFinalConsolidado(),
                totalMetrados: this.costoDirecto,
                totalSupervision: this.gastosTotalSupervision
            };

            const dataConsolidado = JSON.stringify({
                consolidado: allData,
            });

            // Realizar la petición AJAX para guardar
            $.ajax({
                url: `/guardar-consolidado/${id_presupuesto}`,
                type: "POST",
                data: dataConsolidado,
                contentType: "application/json",
                headers: {
                    "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
                },
                success: (response) => {
                    if (response && response.message === 'Datos guardados correctamente') {
                        Swal.fire({
                            title: "Éxito",
                            text: response.message,
                            icon: "success",
                            timer: 1500
                        });
                    } else {
                        throw new Error(response.error || 'Error al guardar'); // Asumiendo que el error tiene una propiedad 'error'
                    }
                },
                error: (xhr, status, error) => {
                    console.error("Error al guardar consolidado:", error);
                    Swal.fire({
                        title: "Error",
                        text: "No se pudieron guardar los datos del consolidado",
                        icon: "error"
                    });
                }
            });
        } catch (error) {
            console.error("Error en guardarConsolidado:", error);
            Swal.fire({
                title: "Error",
                text: "Error al procesar los datos del consolidado",
                icon: "error"
            });
        }
    }
}
export default Consolidado;