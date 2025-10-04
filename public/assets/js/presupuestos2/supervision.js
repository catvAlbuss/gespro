import Consolidado from "./consolidado.js";
import GGsuperDetails from "./ggsupervision.js"; // Asegurar importación correcta

class Supervision {
    constructor() {
        // Base tree structure data
        this.dataSupervision = null;
        // Tabulator instance
        this.tabla = null;
        // Format for money values
        this.ggSuperDetails = new GGsuperDetails(this);
        this.Consolidado = new Consolidado(this);
        this.formatoMoneda = {
            decimal: ".",
            thousand: ",",
            symbol: "S/. ",
            precision: 2
        };
        this.totalSupervision = 0;
        // Store reference to the specific row that needs adjustment
        this.filaAjustable = null;
    }

    initializeTreeData() {
        // Your existing tree data initialization
        // This looks good as is
        return [
            // Same data structure as in your original code
            // ...
        ];
    }

    init() {
        document.addEventListener("DOMContentLoaded", () => {
            this.configurarTabula();
            this.setupEventListeners();
            this.agregarEventos();
            this.loadData();
        });
    }

    setupEventListeners() {
        document.querySelector(".btn-add-row")?.addEventListener("click", () => {
            this.agregarFila();
        });
        document.getElementById('guardar-supervision').addEventListener('click', () => this.exportarDatos());

        // Add event listener for percentage change with debounce
        const inputPorcentajeSuper = document.getElementById('porcentajeCalcSuper');
        if (inputPorcentajeSuper) {
            let timeout;
            inputPorcentajeSuper.addEventListener('input', () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => this.calcularPorcentaje(), 300);
            });
        }
    }

    loadData() {
        const id_presupuesto = document.getElementById('id_presupuestos').value;
        $.ajax({
            url: "/obtener-gasto-supervision",
            type: "POST",
            data: JSON.stringify({ id_presupuesto }),
            contentType: "application/json",
            dataType: "json",
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
            },
            success: (response) => {
                if (response.status === "success" && response.data) {
                    const data = JSON.parse(response.data.gastos_supervision);
                    let datasuper = data.dataSupervision;
                    this.tabla.setData(datasuper);

                    // After loading data, find and store reference to adjustable row
                    this.buscarFilaAjustable();
                } else {
                    const treeData = this.initializeTreeData();
                    this.tabla.setData(treeData);
                    this.buscarFilaAjustable();
                }
            },
            error: (xhr, status, error) => {
                console.error("Error al cargar datos:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudieron cargar los datos del balance."
                });
            }
        });
    }

    buscarFilaAjustable() {
        const data = this.tabla.getData(); // Obtener los datos (esto lo usaremos para la lógica de búsqueda)
        let itemEncontrado = false;
        let filaAjustableEncontrada = null;

        // Iteramos sobre las filas de la tabla de Tabulator directamente
        this.tabla.getRows().forEach(row => {
            const rowData = row.getData();
            if (rowData.concepto === "<strong>I. ETAPA DE SUPERVISIÓN DE OBRA</strong>" && rowData.children) {
                row.getTreeChildren().forEach(childRow => {
                    const childData = childRow.getData();
                    if (childData.concepto === "<strong>A. SUELDOS Y SALARIOS (INC. LEYES SOCIALES)</strong>" && childData.children) {
                        childRow.getTreeChildren().forEach(subChildRow => {
                            const subChildData = subChildRow.getData();
                            if (subChildData.concepto === "<strong>B. OFICINAS ADM. DE CAMPO: ÚTILES DE OFICINA, AMORTIZACIÓN DE EQUIPOS:</strong>" && subChildData.children) {
                                subChildRow.getTreeChildren().forEach(subSubChildRow => {
                                    const subSubChildData = subSubChildRow.getData();
                                    if (subSubChildData.concepto === "Oficinas Incl. Mobiliario y útiles de ofic.") {
                                        filaAjustableEncontrada = subSubChildRow; // Almacenamos el componente de fila de Tabulator
                                        this.filaAjustable = subSubChildRow;
                                        this.parcialEspecificoOriginalDecimal = new Decimal(subSubChildData.subtotal || 0);
                                        itemEncontrado = true;
                                        //console.log("Fila a ajustar encontrada (Tabulator Row):", this.filaAjustable, "Valor original:", this.parcialEspecificoOriginalDecimal.toString());
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });

        if (!filaAjustableEncontrada) {
            console.warn("No se encontró la fila ajustable para el porcentaje (Tabulator Row)");
            this.filaAjustable = null;
        }
    }

    configurarTabula() {
        // Define columns for Tabulator - this part is good as is
        const columnas = [
            {
                title: "ÍNDICE",
                field: "index",
                width: 100,
                hozAlign: "center",
                frozen: true,
                formatter: this.indexFormatter
            },
            {
                title: "CONCEPTO",
                field: "concepto",
                hozAlign: "left",
                formatter: "html",
                width: 450,
                frozen: true
            },
            {
                title: "UNIDAD",
                field: "unidad",
                hozAlign: "center",
                editor: "input",
                width: 80
            },
            {
                title: "CANTIDAD",
                field: "cantidad",
                hozAlign: "center",
                editor: "number",
                formatter: "number",
                formatterParams: { precision: 2 },
                width: 80,
                cellEdited: this.recalcularFila.bind(this)
            },
            {
                title: "TIEMPO EN MESES",
                field: "tiempoMeses",
                hozAlign: "center",
                editor: "number",
                formatter: "number",
                formatterParams: { precision: 0 },
                width: 100,
                cellEdited: this.recalcularFila.bind(this)
            },
            {
                title: "S/. IMPORTE",
                field: "importe",
                hozAlign: "right",
                editor: "number",
                formatter: "money",
                formatterParams: this.formatoMoneda,
                width: 100,
                cellEdited: this.recalcularFila.bind(this),
                editable: function (cell) {
                    return !cell.getRow().getData().isStaticRow;
                }
            },
            {
                title: "S/. SUBTOTAL",
                field: "subtotal",
                hozAlign: "right",
                formatter: "money",
                formatterParams: this.formatoMoneda,
                width: 100,
                editor: false,
            },
            {
                title: "S/. TOTAL",
                field: "total",
                hozAlign: "right",
                formatter: function (cell) {
                    const value = cell.getValue();
                    const data = cell.getRow().getData();

                    // Si es la fila IV y tiene ggsupervicion, usar el totalGeneral
                    if (data.id === "IV" && data.ggsupervicion) {
                        return `S/. ${parseFloat(data.ggsupervicion.totalGeneral || 0).toFixed(2)}`;
                    }

                    return value ? `S/. ${parseFloat(value).toFixed(2)}` : "";
                },
                width: 120,
                editor: false,
                bottomCalc: "sum",
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: this.formatoMoneda
            },
            this.getAccionesColumn()
        ];

        // Create Tabulator instance
        this.tabla = new Tabulator("#supervition_base", {
            data: this.dataSupervision || this.initializeTreeData(),
            columns: columnas,
            layout: "fitDataStretch",
            dataTree: true,
            dataTreeStartExpanded: true,
            dataTreeChildField: "children",
            maxHeight: "600px",
            placeholder: "No hay datos de supervisión",
            progressiveLoad: "scroll",
            progressiveLoadDelay: 200,
            rowFormatter: function (row) {
                if (row.getData().isStaticRow) {
                    row.getElement().style.backgroundColor = "#e6f7ff";
                    row.getElement().style.fontWeight = "bold";
                }
            }
        });

        // Wait for table to fully load before adding event handlers
        this.tabla.on("tableBuilt", () => {
            // Debounce for cell editing
            let cellEditTimeout;
            this.tabla.on("cellEdited", (cell) => {
                clearTimeout(cellEditTimeout);
                cellEditTimeout = setTimeout(() => {
                    this.recalcularFila(cell);
                }, 300);
            });

            // Search for adjustable row after table is built
            this.buscarFilaAjustable();
        });
    }

    getAccionesColumn() {
        return {
            title: "",
            formatter: (cell) => {
                const rowData = cell.getRow().getData();
                if (rowData.id === "IV") {
                    return `<button class="view-gg-fijos">🗂️</button>`;
                }
                if (rowData.id === "III" || rowData.id === "V" || rowData.id === "VI" || rowData.id === "VII" || rowData.id === "VIII") {
                    return ``;
                }
                return `
                    <button class="add-details" title="Agregar detalle">📝</button> 
                    <button class="delete-row">🗑️</button>`;
            },
            width: 60,
            cellClick: (e, cell) => this.manejarAccion(e, cell),
        };
    }

    manejarAccion(e, cell) {
        const row = cell.getRow();
        const rowData = row.getData();

        if (e.target.classList.contains("view-gg-fijos")) {
            this.ggSuperDetails.showDetails(row, (updatedData) => {
                // Actualizar la fila con los nuevos datos
                const updateObj = {
                    total: updatedData.ggsupervicion.totalGeneral,
                    ggsupervicion: {
                        gastogeneralSupervision: updatedData.ggsupervicion.gastogeneralSupervision,
                        totalGeneral: updatedData.ggsupervicion.totalGeneral
                    }
                };

                row.update(updateObj);
                this.calcularTotales();
            });
        }

        if (e.target.classList.contains("add-details")) {
            this.agregarDetails(row);
        }
        if (e.target.classList.contains("delete-row")) {
            this.eliminarFila(row);
        }
    }

    agregarDetails(parentRow = null) {
        // Create new row with default values
        let childRow = {
            id: Date.now(),
            concepto: "Nuevo concepto",
            unidad: "Mes",
            cantidad: 1,
            tiempoMeses: 1,
            importe: 0,
            subtotal: 0
        };

        if (parentRow) {
            parentRow.addTreeChild(childRow);
            this.calcularTotales();
            // Show success message
            alert("Nueva fila agregada exitosamente");
        } else {
            // Si no hay padre, se agrega al nivel raíz
            this.tabla.addRow(childRow);
        }

    }

    eliminarFila(row) {
        const data = row.getData();
        if (data.isStatic) {
            Swal.fire({
                icon: "warning",
                title: "Advertencia",
                text: "No se pueden eliminar filas estáticas."
            });
            return;
        }

        try {
            row.delete();
            this.calcularTotales();
        } catch (error) {
            console.error("Error deleting row:", error);
        }
    }

    convertToRoman(num) {
        const romanNumerals = [
            { value: 1000, numeral: 'M' },
            { value: 900, numeral: 'CM' },
            { value: 500, numeral: 'D' },
            { value: 400, numeral: 'CD' },
            { value: 100, numeral: 'C' },
            { value: 90, numeral: 'XC' },
            { value: 50, numeral: 'L' },
            { value: 40, numeral: 'XL' },
            { value: 10, numeral: 'X' },
            { value: 9, numeral: 'IX' },
            { value: 5, numeral: 'V' },
            { value: 4, numeral: 'IV' },
            { value: 1, numeral: 'I' }
        ];

        let result = '';
        for (const { value, numeral } of romanNumerals) {
            while (num >= value) {
                result += numeral;
                num -= value;
            }
        }
        return result;
    }

    agregarEventos() {
        document.querySelector(".add-row-fatherSupervicion")?.addEventListener("click", () => {
            this.agregarFila();
        });
    }

    indexFormatter(cell) {
        const data = cell.getRow().getData();
        if (data.romanIndex) return data.romanIndex;
        if (data.letterIndex) return data.letterIndex;
        if (data.subIndex) return data.subIndex;
        return "";
    }

    recalcularFila(cell) {
        try {
            const row = cell.getRow();
            if (!row) return;

            const data = row.getData();

            // Skip static rows
            if (data.isStaticRow) return;

            // Calculate subtotal
            if (data.importe !== undefined) {
                const cantidad = parseFloat(data.cantidad) || 1;
                const importe = parseFloat(data.importe) || 0;
                const tiempoMeses = parseFloat(data.tiempoMeses) || 0;
                const subtotal = cantidad * importe * tiempoMeses;

                // Update row with new subtotal
                row.update({ subtotal }, true);
            }

            // Update parent totals
            this.actualizarTotalesPadre(row);

            // Recalculate overall totals
            this.calcularTotales();
        } catch (error) {
            console.error("Error en recalcularFila:", error);
        }
    }

    actualizarTotalesPadre(row) {
        try {
            if (!row) return;

            const parentRow = row.getTreeParent();
            if (!parentRow) return;

            const children = parentRow.getTreeChildren();
            if (!children || children.length === 0) return;

            let total = 0;

            // Calculate total from all children
            children.forEach(childRow => {
                if (!childRow) return;
                const childData = childRow.getData();
                if (!childData) return;

                // Use either subtotal or total, depending on what's available
                total += parseFloat(childData.subtotal || childData.total || 0);
            });

            // Update parent total
            parentRow.update({ total }, true);

            // Continue up the tree
            this.actualizarTotalesPadre(parentRow);
        } catch (error) {
            console.error("Error en actualizarTotalesPadre:", error);
        }
    }

    calcularTotales() {
        try {
            const data = this.tabla.getData();

            let etapaI = 0;
            let etapaII = 0;
            let costoDirectos = 0;
            let gastosGenerales = 0;

            // Calculate direct costs, general expenses, and stages I and II
            data.forEach(row => {
                if (row.id === "I") etapaI = parseFloat(row.total || 0);
                if (row.id === "II") etapaII = parseFloat(row.total || 0);
                if (row.id === "IV" && row.ggsupervicion) {
                    gastosGenerales = parseFloat(row.ggsupervicion.totalGeneral || 0);
                }
            });

            // Calculate direct costs as the sum of stages I and II
            costoDirectos = etapaI + etapaII;

            // Calculate profit as 5% of direct costs
            let utilidad = costoDirectos * 0.05;

            // Calculate total before tax
            let total = costoDirectos + gastosGenerales + utilidad;

            // Calculate tax (IGV) at 18%
            let igv = Math.round(total * 0.18 * 100) / 100;

            // Calculate final total
            let totalFinal = total + igv;

            // Update displayed total
            document.getElementById("totalsupervision").innerHTML = totalFinal.toFixed(2);

            // Store total for supervision
            this.totalSupervision = totalFinal;

            // Update static rows with calculated values
            this.tabla.updateData([
                { id: "III", total: costoDirectos },
                { id: "IV", total: gastosGenerales },
                { id: "V", total: utilidad },
                { id: "VI", total: total },
                { id: "VII", total: igv },
                { id: "VIII", total: totalFinal }
            ]);
        } catch (error) {
            console.error("Error en calcularTotales:", error);
        }
    }

    calcularPorcentaje() {
        try {
            // Get desired percentage from input
            const porcentajeInput = document.getElementById('porcentajeCalcSuper');
            if (!porcentajeInput) {
                console.error("No se encontró el input del porcentaje");
                return;
            }

            // Parse percentage value
            const porcentajeDeseado = parseFloat(porcentajeInput.value || 0);
            if (isNaN(porcentajeDeseado) || porcentajeDeseado < 0) {
                console.warn("Valor de porcentaje inválido:", porcentajeInput.value);
                return;
            }

            // Check if Consolidado is initialized
            if (!this.Consolidado) {
                console.error("Error: El objeto Consolidado no está inicializado");
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se puede calcular el porcentaje porque el objeto Consolidado no está inicializado."
                });
                return;
            }

            // Get total from Consolidado
            const totalConsolidado = this.Consolidado.calcularTotalGeneral();
            //console.log(`DIAGNÓSTICO: Valor del CONSOLIDADO: ${totalConsolidado}%`);
            if (!totalConsolidado || isNaN(totalConsolidado) || totalConsolidado <= 0) {
                console.warn("El total consolidado no es válido:", totalConsolidado);
                return;
            }

            // Calculate current supervision total
            this.calcularTotales();

            // DIAGNÓSTICO: Mostrar el porcentaje actual antes de cualquier ajuste
            const porcentajeActual = (this.totalSupervision / totalConsolidado) * 100;
            //console.log(`DIAGNÓSTICO: Porcentaje actual antes del ajuste: ${porcentajeActual.toFixed(4)}%`);
            //console.log(`DIAGNÓSTICO: Total Supervisión: ${this.totalSupervision}, Total Consolidado: ${totalConsolidado}`);

            // Calcular el valor total deseado usando la función auxiliar
            const totalDeseado = this.calcularValorDesdeProcentaje(porcentajeDeseado, totalConsolidado);
            //console.log(`DIAGNÓSTICO: Total deseado para lograr ${porcentajeDeseado}%: ${totalDeseado}`);

            // If we don't have the adjustable row, try to find it
            if (!this.filaAjustable) {
                this.buscarFilaAjustable();
                if (!this.filaAjustable) {
                    console.error("No se pudo encontrar la fila ajustable para el porcentaje");
                    return;
                }
            }

            // Obtener datos de la fila ajustable
            let rowData;
            try {
                if (typeof this.filaAjustable.getData === 'function') {
                    rowData = this.filaAjustable.getData();
                } else if (this.filaAjustable.data) {
                    rowData = this.filaAjustable.data;
                } else {
                    rowData = {};
                    console.warn("No se pudo obtener datos de forma estándar");
                }
            } catch (error) {
                console.error("Error al obtener datos de la fila:", error);
                rowData = {};
            }

            // Detección segura del subtotal
            let subtotalActual = 0;
            if (rowData.subtotal !== undefined) {
                subtotalActual = parseFloat(rowData.subtotal) || 0;
            } else if (rowData.getData && typeof rowData.getData === 'function') {
                const nestedData = rowData.getData();
                subtotalActual = parseFloat(nestedData.subtotal) || 0;
            } else if (this.filaAjustable.getCells && typeof this.filaAjustable.getCells === 'function') {
                const celdas = this.filaAjustable.getCells();
                const celdaSubtotal = celdas.find(c => c.getField() === 'subtotal');
                if (celdaSubtotal) {
                    subtotalActual = parseFloat(celdaSubtotal.getValue()) || 0;
                }
            }

            // Factor = 1 + 0.05 (profit) + 0.18 (IGV) + 0.05*0.18 (IGV on profit)
            const factor = 1.239;

            // Calcular el ajuste necesario usando la función auxiliar
            const ajusteInfo = this.calcularAjusteParaPorcentaje(
                this.totalSupervision,
                totalConsolidado,
                porcentajeDeseado,
                factor
            );

            //console.log("DIAGNÓSTICO: Información del ajuste:", ajusteInfo);

            // Calcular el nuevo subtotal
            const ajuste = ajusteInfo.ajuste;
            const nuevoSubtotal = subtotalActual + ajuste;

            //console.log("DIAGNÓSTICO: Subtotal actual:", subtotalActual, "Nuevo subtotal:", nuevoSubtotal);

            // Actualizar la fila con el nuevo subtotal
            let actualizacionExitosa = false;
            try {
                if (typeof this.filaAjustable.update === 'function') {
                    this.filaAjustable.update({
                        subtotal: nuevoSubtotal
                    });
                    actualizacionExitosa = true;
                } else if (this.table && typeof this.table.updateData === 'function') {
                    const rowId = this.filaAjustable.getIndex ? this.filaAjustable.getIndex() :
                        (this.filaAjustable.getData ? this.filaAjustable.getData().id : null);

                    if (rowId !== null) {
                        this.table.updateData([{ id: rowId, subtotal: nuevoSubtotal }]);
                        actualizacionExitosa = true;
                    }
                } else if (rowData) {
                    rowData.subtotal = nuevoSubtotal;
                    if (this.table && typeof this.table.redraw === 'function') {
                        this.table.redraw(true);
                    }
                    actualizacionExitosa = true;
                }
            } catch (updateError) {
                console.error("Error en los métodos de actualización:", updateError);
            }

            if (!actualizacionExitosa) {
                console.error("No se pudo actualizar la fila con el nuevo subtotal");
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudo actualizar la fila con el nuevo subtotal"
                });
                return;
            }

            // Recalcular totales
            try {
                if (this.actualizarTotalesPadre && typeof this.actualizarTotalesPadre === 'function') {
                    this.actualizarTotalesPadre(this.filaAjustable);
                }

                if (this.calcularTotales && typeof this.calcularTotales === 'function') {
                    this.calcularTotales();
                }
            } catch (recalcError) {
                console.error("Error al recalcular totales:", recalcError);
            }

            // FASE 2: Verificar que el porcentaje calculado sea igual al deseado
            // Usar la función de verificación
            const verificacionFinal = this.verificarPorcentaje(
                this.totalSupervision,
                totalConsolidado,
                porcentajeDeseado
            );

            //console.log("DIAGNÓSTICO: Verificación final del porcentaje:", verificacionFinal);

            // Mostrar el resultado al usuario
            if (verificacionFinal.esExacto) {
                Swal.fire({
                    icon: "success",
                    title: "Cálculo exitoso",
                    text: `El porcentaje ha sido ajustado correctamente al ${verificacionFinal.porcentajeFormateado}`
                });
            } else {
                Swal.fire({
                    icon: "info",
                    title: "Porcentaje ajustado",
                    text: `El porcentaje calculado es ${verificacionFinal.porcentajeFormateado} (deseado: ${porcentajeDeseado}%). ${nuevoSubtotal < 0 ? 'Se ha usado un valor negativo para lograr aproximar el porcentaje.' : ''}`
                });
            }

            // Registrar información completa
            const resultadoCompleto = {
                totalConsolidado,
                totalSupervisionInicial: ajusteInfo.valorActual,
                totalSupervisionFinal: this.totalSupervision,
                porcentajeInicial: ajusteInfo.porcentajeActual,
                porcentajeFinal: verificacionFinal.porcentajeCalculado,
                porcentajeDeseado,
                subtotalAnterior: subtotalActual,
                subtotalNuevo: nuevoSubtotal,
                ajuste,
                factor,
                esExacto: verificacionFinal.esExacto,
                usaValorNegativo: nuevoSubtotal < 0
            };

            //console.log("RESULTADO COMPLETO:", resultadoCompleto);

            return resultadoCompleto;

        } catch (error) {
            //console.error("Error en calcularPorcentaje:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Error al calcular el porcentaje: " + error.message
            });
        }
    }

    /**
    * Calcula el porcentaje que representa un valor sobre un total
    * @param {number} valor - El valor cuyo porcentaje queremos calcular
    * @param {number} total - El total sobre el cual calculamos el porcentaje
    * @returns {number} - El porcentaje que representa el valor sobre el total
    */
    calcularPorcentajeExacto(valor, total) {
        if (!total || total === 0) {
            console.error("El total no puede ser cero o indefinido");
            return 0;
        }
        return (valor / total) * 100;
    }

    /**
     * Calcula el valor necesario para obtener un porcentaje específico de un total
     * @param {number} porcentajeDeseado - El porcentaje que queremos obtener
     * @param {number} total - El total del cual queremos un porcentaje
     * @returns {number} - El valor que representa el porcentaje del total
     */
    calcularValorDesdeProcentaje(porcentajeDeseado, total) {
        return total * (porcentajeDeseado / 100);
    }

    /**
     * Verifica si el porcentaje calculado es igual al deseado (con tolerancia)
     * @param {number} valor - El valor actual 
     * @param {number} total - El total sobre el cual se calcula el porcentaje
     * @param {number} porcentajeDeseado - El porcentaje objetivo
     * @param {number} tolerancia - Margen de error aceptable (por defecto 0.01)
     * @returns {object} - Resultado de la verificación con detalles
     */
    verificarPorcentaje(valor, total, porcentajeDeseado, tolerancia = 0.01) {
        const porcentajeCalculado = this.calcularPorcentajeExacto(valor, total);
        const diferencia = Math.abs(porcentajeCalculado - porcentajeDeseado);

        return {
            porcentajeCalculado,
            porcentajeDeseado,
            diferencia,
            esExacto: diferencia <= tolerancia,
            porcentajeFormateado: porcentajeCalculado.toFixed(2) + '%',
            mensaje: diferencia <= tolerancia
                ? `El porcentaje de ${porcentajeCalculado.toFixed(2)}% coincide con el deseado (${porcentajeDeseado}%)`
                : `El porcentaje de ${porcentajeCalculado.toFixed(2)}% no coincide con el deseado (${porcentajeDeseado}%)`
        };
    }

    /**
     * Calcula el ajuste necesario para alcanzar un porcentaje deseado
     * @param {number} valorActual - Valor actual antes del ajuste
     * @param {number} total - El total sobre el cual calculamos el porcentaje
     * @param {number} porcentajeDeseado - El porcentaje objetivo
     * @param {number} factor - Factor de multiplicación (por defecto 1)
     * @returns {object} - Información del ajuste necesario
     */
    calcularAjusteParaPorcentaje(valorActual, total, porcentajeDeseado, factor = 1) {
        const valorDeseado = this.calcularValorDesdeProcentaje(porcentajeDeseado, total);
        const diferencia = valorDeseado - valorActual;
        const ajuste = diferencia / factor;

        return {
            valorActual,
            valorDeseado,
            diferencia,
            ajuste,
            nuevoValor: valorActual + ajuste,
            factor,
            porcentajeActual: this.calcularPorcentajeExacto(valorActual, total),
            porcentajeDeseado
        };
    }
    /**
     * Ejemplo de implementación en otra función para calcular presupuestos
     */
    calcularPresupuestoPorPorcentaje(porcentajeDeseado) {
        try {
            // Obtener el total base (similar a tu consolidado)
            const totalBase = this.obtenerTotalBase(); // Reemplaza con tu función real

            // Verificar que el total base sea válido
            if (!totalBase || isNaN(totalBase) || totalBase <= 0) {
                console.warn("El total base no es válido:", totalBase);
                return;
            }

            // Obtener el total actual (similar a tu totalSupervision)
            const totalActual = this.obtenerTotalActual(); // Reemplaza con tu función real

            // Usar las funciones auxiliares para calcular

            // 1. Verificar el porcentaje actual
            const verificacionInicial = this.verificarPorcentaje(totalActual, totalBase, porcentajeDeseado);
            //console.log("Porcentaje actual:", verificacionInicial);

            // 2. Calcular el ajuste necesario
            const factor = 1.0; // Ajusta según tu caso (impuestos, etc.)
            const ajusteInfo = this.calcularAjusteParaPorcentaje(totalActual, totalBase, porcentajeDeseado, factor);

            // 3. Aplicar el ajuste (implementa según tu estructura de datos)
            aplicarAjuste(ajusteInfo.ajuste); // Reemplaza con tu función real

            // 4. Recalcular totales
            const nuevoTotal = recalcularTotal(); // Reemplaza con tu función real

            // 5. Verificar el resultado final
            const verificacionFinal = this.verificarPorcentaje(nuevoTotal, totalBase, porcentajeDeseado);

            // 6. Mostrar resultado
            if (verificacionFinal.esExacto) {
                console.log("¡Éxito! Porcentaje ajustado correctamente.");
            } else {
                console.log("Porcentaje aproximado, puede requerir ajuste adicional.");
            }

            return {
                verificacionInicial,
                ajusteInfo,
                verificacionFinal,
                totalBase,
                totalActual,
                nuevoTotal
            };

        } catch (error) {
            console.error("Error al calcular presupuesto por porcentaje:", error);
        }
    }

    exportarDatos() {
        const idPresupuesto = document.getElementById('id_presupuestos').value;
        if (!idPresupuesto) {
            throw new Error('ID de presupuesto no encontrado');
        }

        const datosGenerales = this.tabla.getData();

        const datos = {
            dataSupervision: datosGenerales,
            totalSupervision: this.totalSupervision
        };

        const dataStr = JSON.stringify({ gastos_supervision: datos });
        $.ajax({
            url: `/guardar-gastos-supervision/${idPresupuesto}`,
            type: "POST",
            data: dataStr,
            contentType: "application/json",
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
            },
            success: (response) => {
                Swal.fire({
                    title: "Éxito",
                    text: "Datos guardados correctamente",
                    icon: "success",
                    timer: 1500
                });
            },
            error: (xhr, status, error) => {
                console.error("Error al guardar:", error);
                Swal.fire({
                    title: "Error",
                    text: "No se pudieron guardar los datos",
                    icon: "error"
                });
            }
        });
    }
}

export default Supervision;