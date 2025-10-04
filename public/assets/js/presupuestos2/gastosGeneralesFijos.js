// Toggle the visibility of the table when the button is clicked
document.getElementById("toggleTable").addEventListener("click", function () {
    const table = document.getElementById("table");
    table.classList.toggle("hidden");
});

class gastosFijos {
    constructor() {
        this.tables = {};
        this.costoDirect = 0;
        this.montoConstructor = 0;
        this.montototalSCTR = 0;
        this.montototaPolizaessalud = 0;
        this.formatoMoneda = {
            decimal: ".",
            thousand: ",",
            symbol: "S/. ",
            precision: 2
        };
        this.subtotalFinal = 0;
    }

    init() {
        try {
            const container = this.getContainer();
            this.createHTMLStructure(container);
            this.initializeTables();
            this.setupEventListeners();
            this.loadDataCostoDirecto();
            this.loadData();
        } catch (error) {
            this.handleError('Error en inicialización', error);
        }
    }
    //CoNsTrUyEHCO.2025
    getTotalFromTable(tableName, field) {
        const table = this.tables[tableName];
        if (!table) return 0;

        const data = table.getData();
        return data.reduce((sum, row) => {
            const value = parseFloat(row[field]) || 0;
            return sum + value;
        }, 0);
    }

    updateRowBasedOnDescription(description, totals) {
        if (!this.currentRow) return;

        const updateMap = {
            "Fianza por Garantía de Fiel Cumplimiento (Vigencia hasta la liquidación)": totals.fianzaCumplimiento,
            "Fianza por Garantía de Adelanto en Efectivo": totals.fianzaAdelantoEfectivo,
            "Fianza por Garantía de Adelanto en Materiales": totals.fianzaAdelantoMateriales,
            "Póliza de Seguros C.A.R. Contra Todo Riesgo (vigencia durante ejecución de la obra)": totals.polizaCAR,
            "Póliza SCTR del Personal de Administración y Control de Obra - Gastos Generales": totals.seguroSCTR,
            "PÓLIZA DE SEGUROS ESSALUD + VIDA": totals.polizaEssalud,
            "Sencico (0.20% del ppto)": totals.pagoSencico,
            "Impuestos ITF": totals.impuestosITF
        };

        const newValue = updateMap[description] || 0;
        this.currentRow.update({
            costounitario: newValue,
            parcialgen: newValue
        });
    }

    getTablesTotals() {
        // Implementa aquí la lógica para obtener los totales de tus tablas de gastos fijos
        // Devuelve un objeto con las claves: fianzaCumplimiento, fianzaAdelantoEfectivo, etc.
        const totals = {
            fianzaCumplimiento: this.getTableTotal(this.tables.fianzaCumplimiento, "garantiaTotal"),
            fianzaAdelantoEfectivo: this.getTableTotal(this.tables.fianzaAdelantoEfectivo, "garantiaTotalefe"),
            fianzaAdelantoMateriales: this.getTableTotal(this.tables.fianzaAdelantoMateriales, "garantiaTotalMaterial"),
            polizaCAR: this.getTableTotal(this.tables.polizaCAR, "poliza"),
            seguroSCTR: this.getTableTotal(this.tables.seguroSCTR, "poliza"),
            polizaEssalud: this.getTableTotal(this.tables.polizaEssalud, "poliza"),
            pagoSencico: this.getTableTotal(this.tables.pagoSencico, "poliza"),
            impuestosITF: this.getTableTotal(this.tables.impuestosITF, "poliza")
        };
        return totals;
    }

    getTableTotal(table, columnField) {
        if (table && table.getData().length > 0) {
            let total = 0;
            table.getData().forEach(item => {
                total += parseFloat(item[columnField]) || 0;
            });
            return total;
        }
        return 0;
    }

    guardarDatosTablas() {
        try {
            const allData = {
                tables: {}
            };
            // Recopilar datos de todas las tablas
            Object.entries(this.tables).forEach(([tableName, table]) => {
                if (table) {
                    allData.tables[tableName] = {
                        data: table.getData(),
                        total: this.getTotalFromTable(tableName, this.getFieldNameForTable(tableName))
                    };
                }
            });

            // Obtener ID del presupuesto
            const idPresupuesto = document.getElementById('id_presupuestos').value;
            if (!idPresupuesto) {
                throw new Error('ID de presupuesto no encontrado');
            }

            // Obtener los valores que quieres guardar
            const tiempo_ejecucion = document.getElementById('duracionobra').value;
            const ggf = document.getElementById('ggf').value;
            const ggv = document.getElementById('ggv').value;
            const porcentaje_fianza_adelanto_efectivo = document.getElementById('porcentajeFPGDAE').value;
            const porcentaje_fianza_adelanto_materiales = document.getElementById('porcentajeFGDAM').value;
            const porcentaje_fianza_buen_ejecucion = document.getElementById('porcentajeFGFC').value;

            const datagfijos = JSON.stringify({
                gastosfijos: allData,
                tiempo_ejecucion: tiempo_ejecucion,
                ggf: ggf,
                ggv: ggv,
                porcentaje_fianza_adelanto_efectivo: porcentaje_fianza_adelanto_efectivo,
                porcentaje_fianza_adelanto_materiales: porcentaje_fianza_adelanto_materiales,
                porcentaje_fianza_buen_ejecucion: porcentaje_fianza_buen_ejecucion,
            });
            // Realizar la petición AJAX para guardar
            $.ajax({
                url: `/guardar-gastos-fijos/${idPresupuesto}`,
                type: "POST",
                data: datagfijos,
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

        } catch (error) {
            console.error("Error al preparar datos:", error);
            Swal.fire({
                title: "Error",
                text: "Error al preparar los datos para guardar",
                icon: "error"
            });
        }
    }

    loadData() {
        const id_presupuesto = document.getElementById('id_presupuestos').value;
        $.ajax({
            url: "/obtener-gastos-fijos", // URL de la API
            type: "POST",
            data: JSON.stringify({ id_presupuesto }), // Enviar el ID
            contentType: "application/json",
            dataType: "json",
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
            },
            success: (response) => {
                if (response && response.status === "success" && response.data && response.data.gastos_fijos) {
                    try {
                        const data = JSON.parse(response.data.gastos_fijos);
                        const tiempo_ejecucion = parseInt(JSON.parse(response.data.tiempoejecucion));
                        const valggf = parseFloat(JSON.parse(response.data.valggf));
                        const valggv = parseFloat(JSON.parse(response.data.valggv));
                        const porcentaje_fianza_buen_ejecucion = JSON.parse(response.data.porcentaje_fianza_buen_ejecucion);
                        const porcentaje_fianza_adelanto_efectivo = JSON.parse(response.data.porcentaje_fianza_adelanto_efectivo);
                        const porcentaje_fianza_adelanto_materiales = JSON.parse(response.data.porcentaje_fianza_adelanto_materiales);
                        //duracionObra === tiempo_ejecucion
                        document.getElementById("ggf").value = valggf || 20;
                        document.getElementById("ggv").value = valggv || 20;
                        document.getElementById("duracionobra").value = tiempo_ejecucion || 20;

                        // Asignar los valores de los porcentajes a los campos correspondientes en el formulario
                        document.getElementById("porcentajeFGFC").value = porcentaje_fianza_buen_ejecucion || 10; // Valor por defecto 10 si no existe
                        document.getElementById("porcentajeFPGDAE").value = porcentaje_fianza_adelanto_efectivo || 10; // Valor por defecto 10 si no existe
                        document.getElementById("porcentajeFGDAM").value = porcentaje_fianza_adelanto_materiales || 20; // Valor por defecto 20 si no existe

                        if (data && data.tables) {
                            for (const tableName in this.tables) {
                                if (this.tables.hasOwnProperty(tableName) && data.tables[tableName] && data.tables[tableName].data) {
                                    const tableData = data.tables[tableName].data;
                                    this.tables[tableName].setData(tableData);
                                    // Igualar duracionObra al tiempo_ejecucion si la tabla tiene esa columna
                                    const columns = this.tables[tableName].getColumnDefinitions().map(col => col.field);
                                    if (columns.includes('duracionObra')) {
                                        this.tables[tableName].getRows().forEach(row => {
                                            row.update({ duracionObra: tiempo_ejecucion });
                                        });
                                        //console.log(`Se igualó 'duracionObra' a ${tiempo_ejecucion} en la tabla ${tableName}.`);
                                    }
                                } else {
                                    console.log(`No hay datos o la estructura es incorrecta para la tabla ${tableName} en la respuesta del servidor. Se mantendrán los datos por defecto.`);
                                }
                            }
                        } else {
                            //console.log("La propiedad 'tables' no se encontró en los datos del servidor. Se mantendrán los datos por defecto.");
                        }
                    } catch (error) {
                        //console.error("Error al analizar los datos JSON:", error);
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: "Error al procesar los datos recibidos del servidor."
                        });
                    }
                } else {
                    console.log("La respuesta del servidor está vacía, tiene un estado de error o no contiene datos de gastos fijos. Se mostrarán los datos por defecto.");
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

        $.ajax({
            url: "/obtener-gasto_generales",
            type: "POST",
            data: JSON.stringify({ id_presupuesto }),
            contentType: "application/json",
            dataType: "json",
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
            },
            success: (response) => {
                if (response && response.status === 'success' && response.data) {
                    const data = JSON.parse(response.data.gastos_generales);
                    let subtotalIgvData = data.gastosEspecificos;

                    // Inicializamos las variables para las sumas
                    let totalGastosAdminObra = 0;
                    let totalBeneficiosSociales = 0;

                    // Iteramos sobre los elementos de 'subtotalIgvData'
                    subtotalIgvData.forEach(item => {
                        // Verificamos si el item es "GASTOS DE ADMINISTRACIÓN EN OBRA"
                        if (item.descripcion === "GASTOS DE ADMINISTRACIÓN EN OBRA") {
                            totalGastosAdminObra += parseFloat(item.parcialespecifico) || 0;
                        }

                        // Verificamos si el item es "Pago de Beneficios Sociales"
                        if (item.descripcion === "Pago de Beneficios Sociales") {
                            totalBeneficiosSociales += parseFloat(item.parcialespecifico) || 0;
                        }
                    });

                    // Sumamos ambos totales
                    const totalGastos = totalGastosAdminObra + totalBeneficiosSociales;
                    const totalEsalud = totalGastosAdminObra;
                    this.montototalSCTR = totalGastos
                    this.montototaPolizaessalud = totalEsalud;
                    this.updateMontoConstructor();
                    // Llamamos a la función 'calcularSeguroPersonal' con el total


                } else {
                    console.error("Error: La respuesta del servidor de gastos generales no tiene el formato esperado.");
                }
            },
            error: (error) => {
                console.error("Error en la petición AJAX para gastos generales:", error);
            }
        });
    }

    loadDataCostoDirecto() {
        const id_presupuesto = document.getElementById('id_presupuestos').value;
        $.ajax({
            url: "/obtener-costo_directo", // URL de la API
            type: "POST",
            data: JSON.stringify({ id_presupuesto }), // Enviar el ID
            contentType: "application/json",
            dataType: "json",
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
            },
            success: (response) => {
                const CostoDirecto = parseFloat(response.costo_directo);
                this.costoDirect = CostoDirecto; // Asigna el valor recibido a this.costoDirect
                // Llama a updateMontoConstructor aquí, después de cargar los datos
                this.updateMontoConstructor();
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

    updateMontoConstructor() {
        this.montoConstructor = this.calculateResults();
        this.calcularPolizaSeguro();
        this.calcularSeguroPersonal();
        this.calcularPolizaEsalud();
        this.calcularPagoSencico();
        this.calcularImpustoITF();
    }

    calculateResults() {
        const costoDirecto = this.costoDirect;
        const ggf = parseFloat(document.getElementById('ggf').value) || 0;
        const ggv = parseFloat(document.getElementById('ggv').value) || 0;
        const utilidad = parseFloat(document.getElementById('utilidadgfijos').value) || 0;
        const porcentajeUtilidad = 5;

        const dataggf = ggf;
        const dataggv = ggv;
        const utilidaggfijo = costoDirecto * porcentajeUtilidad;
        const subtotalggfijo = costoDirecto + dataggf + dataggv + utilidaggfijo;

        const subtototalsinIgv = costoDirecto + dataggf + dataggv + utilidad;
        const subtototalIgv = subtototalsinIgv * 0.18;
        const total = subtototalsinIgv + subtototalIgv;

        // Update result columns
        document.getElementById('resultadoGGF').innerText = dataggf.toFixed(2);
        document.getElementById('resultadoGGV').innerText = dataggv.toFixed(2);
        document.getElementById('resultadoUtilidad').innerText = utilidaggfijo.toFixed(2);
        document.getElementById('subtotalgfijos').innerText = subtototalsinIgv.toFixed(2);
        document.getElementById('montocontratov').innerText = total.toFixed(2);

        return total; // Return the total value
    }

    getFieldNameForTable(tableName) {
        const fieldMap = {
            fianzaCumplimiento: 'garantiaTotal',
            fianzaAdelantoEfectivo: 'garantiaTotalefe',
            fianzaAdelantoMateriales: 'garantiaTotalMaterial',
            polizaCAR: 'poliza',
            seguroSCTR: 'poliza',
            polizaEssalud: 'poliza',
            pagoSencico: 'poliza',
            impuestosITF: 'poliza'
        };
        return fieldMap[tableName] || 'poliza';
    }

    getContainer() {
        const container = document.getElementById('gastosfijos');
        if (!container) {
            throw new Error('Contenedor gastosfijos no encontrado');
        }
        return container;
    }

    handleError(message, error) {
        console.error(`${message}:`, error);

        Swal.fire({
            title: 'Error',
            text: message,
            icon: "error",
        })
        // Aquí podrías agregar notificación visual al usuario
    }

    setupEventListeners() {
        document.querySelector('.add-row-fgfc').addEventListener('click', () => this.addNewRow('fianzaCumplimiento'));
        document.querySelector('.add-row-fgae').addEventListener('click', () => this.addNewRow('fianzaAdelantoEfectivo'));
        document.querySelector('.add-row-fgam').addEventListener('click', () => this.addNewRow('fianzaAdelantoMateriales'));
        document.querySelector('.add-row-car').addEventListener('click', () => this.addNewRow('polizaCAR'));
        document.querySelector('.add-row-sctr').addEventListener('click', () => this.addNewRow('seguroSCTR'));
        document.querySelector('.add-row-essalud').addEventListener('click', () => this.addNewRow('polizaEssalud'));
        document.querySelector('.add-row-sencico').addEventListener('click', () => this.addNewRow('pagoSencico'));
        document.querySelector('.add-row-itf').addEventListener('click', () => this.addNewRow('impuestosITF'));
        document.getElementById('guardar-gastos-fijos').addEventListener('click', () => this.guardarDatosTablas());
        document.getElementById('ggf').addEventListener('input', () => this.updateMontoConstructor()); // Cambiar a 'input' y llamar al método de la clase
        document.getElementById('ggv').addEventListener('input', () => this.updateMontoConstructor());
    }

    addNewRow(tableKey) {
        try {
            const newRow = this.getEmptyRowData(tableKey);
            this.tables[tableKey].addRow(newRow);
            this.recalcularTotal(tableKey);

            Swal.fire({
                title: 'Éxito',
                text: 'Nueva fila agregada',
                icon: 'success',
                timer: 1500
            });
        } catch (error) {
            this.handleError(`Error al agregar fila a ${tableKey}`, error);
        }
    }

    getEmptyRowData(tableKey) {
        const uniqueId = Date.now() + Math.random().toString(36).substr(2, 9);
        const emptyRows = {
            fianzaCumplimiento: {
                id: uniqueId,
                descripcion: "FIANZA POR GARANTÍA DE FIEL CUMPLIMIENTO",
                garantiaFC: 0,
                tea: 0,
                teaDias: 0,
                duracionObra: 0,
                duracionLiq: 0,
                garantiaTotal: 0
            },
            fianzaAdelantoEfectivo: {
                id: uniqueId,
                descripcion: "FIANZA Adelanto en Efectivo",
                garantiaFC: 0,
                tea: 0,
                teaDias: 0,
                factor: 0,
                avance: 0,
                renovacion: 0,
                garantiaTotal: 0
            },
            fianzaAdelantoMateriales: {
                id: uniqueId,
                descripcion: "FIANZA Adelanto en Materiales",
                garantiaFC: 0,
                tea: 0,
                teaDias: 0,
                factor: 0,
                avance: 0,
                renovacion: 0,
                garantiaTotal: 0
            },
            polizaCAR: {
                id: uniqueId,
                descripcion: "SEGUROS",
                montoContrato: 0,
                tea: 0,
                teaDias: 0,
                duracionObra: 0,
                poliza: 0
            },
            seguroSCTR: {
                id: uniqueId,
                descripcion: "SEGUROS",
                subtotal: 0,
                tea: 0,
                teaDias: 0,
                duracionObra: 0,
                poliza: 0
            },
            polizaEssalud: {
                id: uniqueId,
                descripcion: "SEGUROS",
                subtotal: 0,
                tea: 0,
                teaDias: 0,
                duracionObra: 0,
                poliza: 0
            },
            pagoSencico: {
                id: uniqueId,
                descripcion: "SEGUROS",
                subtotal: 0,
                tea: 0,
                teaDias: 0,
                duracionObra: 0,
                poliza: 0
            },
            impuestosITF: {
                id: uniqueId,
                descripcion: "SEGUROS",
                subtotal: 0,
                tea: 0,
                teaDias: 0,
                duracionObra: 0,
                poliza: 0
            },
        };
        return emptyRows[tableKey] || { id: uniqueId };
    }

    deleteRow(tableKey, id) {
        try {
            // Convertir el ID de la tabla al nombre correcto de la propiedad
            const tableName = this.getTableNameFromKey(tableKey);
            const table = this.tables[tableName];

            if (!table) {
                throw new Error(`Tabla ${tableName} no encontrada`);
            }

            table.deleteRow(id);
            this.recalcularTotal(tableName);

            Swal.fire({
                title: 'Éxito',
                text: 'Fila eliminada correctamente',
                icon: 'success',
                timer: 1500
            });
        } catch (error) {
            this.handleError('Error al eliminar fila', error);
        }
    }

    getTableNameFromKey(tableKey) {
        // Mapeo de IDs de tabla a nombres de propiedad
        const tableMap = {
            'fianza-cumplimiento': 'fianzaCumplimiento',
            'fianza-adelanto-efectivo': 'fianzaAdelantoEfectivo',
            'fianza-adelanto-materiales': 'fianzaAdelantoMateriales',
            'poliza-car': 'polizaCAR',
            'seguro-sctr': 'seguroSCTR',
            'poliza-essalud': 'polizaEssalud',
            'pago-sencico': 'pagoSencico',
            'impuestos-itf': 'impuestosITF'
        };

        return tableMap[tableKey] || tableKey;
    }

    recalcularTotal(tableKey) {
        // this.calcularSeguroPersonal();
        // this.calcularPolizaEsalud();
        // this.calcularPagoSencico();
        // this.calcularImpustoITF();
        const calculators = {
            fianzaCumplimiento: this.calcularFianzaCumplimiento.bind(this),
            fianzaAdelantoEfectivo: this.calcularFianzaAdelantoEfectivo.bind(this),
            fianzaAdelantoMateriales: this.calcularFianzaAdelantoMateriales.bind(this),
            polizaCAR: this.calcularPolizaSeguro.bind(this),
            seguroSCTR: this.calcularSeguroPersonal.bind(this),
            polizaEssalud: this.calcularPolizaEsalud.bind(this),
            pagoSencico: this.calcularPagoSencico.bind(this),
            impuestosITF: this.calcularImpustoITF.bind(this),
            // Agregar más calculadoras...
        };

        if (calculators[tableKey]) {
            calculators[tableKey]();
        }
    }

    calcularFianzaCumplimiento() {
        try {
            const table = this.tables.fianzaCumplimiento;
            const data = table.getData();

            data.forEach(row => {
                const tea = parseFloat(row.tea) || 0;
                const teaDias = tea / 360;
                const garantiaTotal = (row.garantiaFC * teaDias * (row.duracionObra + row.duracionLiq)) / 100;

                table.updateData([{
                    ...row,
                    teaDias: teaDias,
                    garantiaTotal: garantiaTotal
                }]);
            });

            this.actualizarFooter(table, data);
        } catch (error) {
            this.handleError('Error en cálculo de fianza cumplimiento', error);
        }
    }

    calcularFianzaAdelantoEfectivo() {
        try {
            const table = this.tables.fianzaAdelantoEfectivo;
            const data = table.getData();

            data.forEach(row => {
                const tea = parseFloat(row.tea) || 0;
                const teaDias = tea / 360;
                const garantiaTotal = (row.garantiaFC * teaDias * row.renovacion * row.factor) / 100;

                table.updateData([{
                    ...row,
                    teaDias: teaDias,
                    garantiaTotal: garantiaTotal
                }]);
            });

            this.actualizarFooter(table, data);
        } catch (error) {
            this.handleError('Error en cálculo de fianza cumplimiento', error);
        }
    }

    calcularFianzaAdelantoMateriales() {
        try {
            const table = this.tables.fianzaAdelantoMateriales;
            const data = table.getData();

            data.forEach(row => {
                const tea = parseFloat(row.tea) || 0;
                const teaDias = tea / 360;
                const garantiaTotal = (row.garantiaFC * teaDias * row.renovacion * row.factor) / 100;

                table.updateData([{
                    ...row,
                    teaDias: teaDias,
                    garantiaTotal: garantiaTotal
                }]);
            });

            this.actualizarFooter(table, data);
        } catch (error) {
            this.handleError('Error en cálculo de fianza cumplimiento', error);
        }
    }

    calcularPolizaSeguro() {
        // Verificar que la tabla existe
        if (!this.tables.polizaCAR) {
            console.error("❌ Error: La tabla 'polizaCAR' no está inicializada.");
            return;
        }

        // Obtener los datos de la tabla
        const table = this.tables.polizaCAR;
        const data = table.getData();
        const rows = table.getRows();

        // Validar que la tabla tenga filas antes de operar
        if (!Array.isArray(data) || data.length === 0 || rows.length === 0) {
            console.warn("⚠️ Advertencia: La tabla 'polizaCAR' está vacía, no hay datos para actualizar.");
            return;
        }

        // Validar que 'costoDirect' está definido
        if (typeof this.montoConstructor !== "number" || isNaN(this.montoConstructor)) {
            console.error("❌ Error: 'costoDirect' no es un número válido.");
            return;
        }

        // Recorrer todas las filas y actualizar valores
        rows.forEach(row => {
            let rowData = row.getData();

            // Asignar el nuevo montoContrato y recalcular póliza
            let nuevoMontoContrato = this.montoConstructor;
            let nuevaPoliza = nuevoMontoContrato * ((rowData.teaDias / 100) || 0) * (rowData.duracionObra || 0);

            // Redondear a 2 decimales y actualizar la fila
            row.update({
                montoContrato: nuevoMontoContrato,
                poliza: Math.round(nuevaPoliza)
            });
        });

        //console.log("✅ Se actualizó toda la columna 'Monto del Contrato' y se recalculó 'Póliza S/'.");
    }

    calcularSeguroPersonal() {
        // Verificar que la tabla existe
        if (!this.tables.seguroSCTR) {
            console.error("❌ Error: La tabla 'polizaCAR' no está inicializada.");
            return;
        }

        // Obtener los datos de la tabla
        const table = this.tables.seguroSCTR;
        const data = table.getData();
        const rows = table.getRows();
        const sumaGastoGeneral = this.montototalSCTR;//310070.66;
        // Validar que la tabla tenga filas antes de operar
        if (!Array.isArray(data) || data.length === 0 || rows.length === 0) {
            console.warn("⚠️ Advertencia: La tabla 'polizaCAR' está vacía, no hay datos para actualizar.");
            return;
        }

        // Validar que 'costoDirect' está definido
        if (typeof this.costoDirect !== "number" || isNaN(this.costoDirect)) {
            console.error("❌ Error: 'costoDirect' no es un número válido.");
            return;
        }

        // Recorrer todas las filas y actualizar valores
        rows.forEach(row => {
            let rowData = row.getData();

            // Asignar el nuevo montoContrato y recalcular póliza
            let nuevoMontoContrato = sumaGastoGeneral;
            let nuevaPoliza = nuevoMontoContrato * ((rowData.teaDias / 100) || 0) * (rowData.duracionObra || 0);

            // Redondear a 2 decimales y actualizar la fila
            row.update({
                subtotal: this.montototalSCTR,
                poliza: Math.round(nuevaPoliza)
            });
        });

        //console.log("✅ Se actualizó toda la columna 'Monto del Contrato' y se recalculó 'Póliza S/'.");
    }

    calcularPolizaEsalud() {
        // Verificar que la tabla existe
        if (!this.tables.polizaEssalud) {
            console.error("❌ Error: La tabla 'polizaEssalud' no está inicializada.");
            return;
        }

        // Obtener la instancia de la tabla
        const table = this.tables.polizaEssalud;

        // Validar que 'montototaPolizaessalud' esté definido
        if (typeof this.montototaPolizaessalud !== "number" || isNaN(this.montototaPolizaessalud)) {
            console.error("❌ Error: 'montototaPolizaessalud' no es un número válido.");
            return;
        }

        // Obtener todas las filas de la tabla
        const rows = table.getRows();
        const updateData = [];

        // Crear un array de objetos para actualizar cada fila
        rows.forEach(row => {
            updateData.push({ id: row.getData().id, descripcionessalud: this.montototaPolizaessalud });
        });

        // Actualizar todas las filas con el nuevo valor de descripcionessalud
        if (updateData.length > 0) {
            table.updateData(updateData);
        } else {
            console.warn("⚠️ Advertencia: La tabla 'polizaEssalud' está vacía, no hay filas para actualizar.");
        }
    }

    calcularPagoSencico() {
        // Verificar que la tabla existe
        if (!this.tables.pagoSencico) {
            console.error("❌ Error: La tabla 'pagoSencico' no está inicializada.");
            return;
        }

        // Obtener la instancia de la tabla
        const table = this.tables.pagoSencico;
        const rows = table.getRows();

        // Validar que 'costoDirect' está definido
        if (typeof this.costoDirect !== "number" || isNaN(this.costoDirect)) {
            console.error("❌ Error: 'costoDirect' no es un número válido.");
            return;
        }

        const updateData = [];

        // Crear un array de objetos para actualizar cada fila
        rows.forEach(row => {
            updateData.push({ id: row.getData().id, descripcion2: this.costoDirect });
            // Opcional: Si también quieres recalcular la póliza basado en el nuevo costo directo
            let rowData = row.getData();
            row.update({
                poliza: this.costoDirect * ((parseFloat(rowData.tea) / 100) || 0)
            });
        });

        // Actualizar todas las filas con el nuevo valor de descripcion2
        if (updateData.length > 0) {
            table.updateData(updateData);
        } else {
            console.warn("⚠️ Advertencia: La tabla 'pagoSencico' está vacía, no hay filas para actualizar.");
        }

        //console.log("✅ Se actualizó toda la columna 'Descripción' con el costo directo y se recalculó 'Póliza S/'.");
    }

    calcularImpustoITF() {
        // Verificar que la tabla existe
        if (!this.tables.impuestosITF) {
            console.error("❌ Error: La tabla 'polizaCAR' no está inicializada.");
            return;
        }

        // Obtener los datos de la tabla
        const table = this.tables.impuestosITF;
        const data = table.getData();
        const rows = table.getRows();

        // Validar que la tabla tenga filas antes de operar
        if (!Array.isArray(data) || data.length === 0 || rows.length === 0) {
            console.warn("⚠️ Advertencia: La tabla 'polizaCAR' está vacía, no hay datos para actualizar.");
            return;
        }

        // Validar que 'costoDirect' está definido
        if (typeof this.costoDirect !== "number" || isNaN(this.costoDirect)) {
            console.error("❌ Error: 'costoDirect' no es un número válido.");
            return;
        }

        // Recorrer todas las filas y actualizar valores
        rows.forEach(row => {
            let rowData = row.getData();

            // Asignar el nuevo montoContrato y recalcular póliza
            let nuevoMontoContrato = this.costoDirect;
            let nuevaPoliza = nuevoMontoContrato * ((rowData.tea / 100) || 0);

            // Redondear a 2 decimales y actualizar la fila
            row.update({
                descripcion2: nuevoMontoContrato,
                poliza: Math.round(nuevaPoliza)
            });
        });

        //console.log("✅ Se actualizó toda la columna 'Monto del Contrato' y se recalculó 'Póliza S/'.");
    }

    updateGarantiaFC() {
        const inputFGFC = document.getElementById('porcentajeFGFC');
        if (!inputFGFC) return;

        const porcentajeFGFC = parseFloat(inputFGFC.value);
        if (isNaN(porcentajeFGFC) || porcentajeFGFC < 0) return;

        // Obtener todas las filas de la tabla
        let rows = this.tables.fianzaCumplimiento.getRows();
        if (rows.length === 0) {
            console.error("❌ No hay filas en la tabla fianzaCumplimiento");
            return;
        }

        // Recorrer todas las filas y actualizar la columna "garantiaFC"
        rows.forEach(row => {
            let rowData = row.getData();
            const garantiaFC = this.montoConstructor * (porcentajeFGFC / 100);

            row.update({ garantiaFC: garantiaFC });

            // Recalcular la garantía total para cada fila
            this.recalcularGarantiaTotal(row);
        });

        // Actualizar el footer después de modificar todas las filas
        this.actualizarFooter();
    }

    updateGarantiaFPGDAE() {
        const inputFPGDAE = document.getElementById('porcentajeFPGDAE');
        if (!inputFPGDAE) return;

        const porcentajeFPGDAE = parseFloat(inputFPGDAE.value);
        if (isNaN(porcentajeFPGDAE) || porcentajeFPGDAE < 0) return;

        // Obtener todas las filas de la tabla
        let rows = this.tables.fianzaAdelantoEfectivo.getRows();
        if (rows.length === 0) {
            console.error("❌ No hay filas en la tabla fianzaCumplimiento");
            return;
        }
        // Recorrer todas las filas y actualizar la columna "garantiaFC"
        rows.forEach(row => {
            let rowData = row.getData();
            const garantiaFC = this.montoConstructor * (porcentajeFPGDAE / 100);

            row.update({ garantiaFC: garantiaFC });

            // Recalcular la garantía total para cada fila
            this.recalcularGarantiaTotaltfae(row);
        });

        // Actualizar el footer después de modificar todas las filas
        this.actualizarFooter();
    }

    updateGarantiaFGDAM() {
        const inputFGDAM = document.getElementById('porcentajeFGDAM');
        if (!inputFGDAM) return;

        const porcentajeMaterail = parseFloat(inputFGDAM.value);
        if (isNaN(porcentajeMaterail) || porcentajeMaterail < 0) return;

        // Obtener todas las filas de la tabla
        let rows = this.tables.fianzaAdelantoMateriales.getRows();
        if (rows.length === 0) {
            console.error("❌ No hay filas en la tabla fianzaCumplimiento");
            return;
        }
        // Recorrer todas las filas y actualizar la columna "garantiaFC"
        rows.forEach(row => {
            let rowData = row.getData();
            const garantiaFC = this.montoConstructor * (porcentajeMaterail / 100);

            row.update({ garantiaFC: garantiaFC });

            // Recalcular la garantía total para cada fila
            this.recalcularGarantiaTotalMat(row);
        });

        // Actualizar el footer después de modificar todas las filas
        this.actualizarFooter();
    }

    recalcularGarantiaTotal(row) {
        const data = row.getData();
        const duracionTotal = (parseFloat(data.duracionObra) || 0) + (parseFloat(data.duracionLiq) || 0);
        const garantiaTotal = data.garantiaFC * (data.teaDias / 100) * duracionTotal;

        row.update({
            garantiaTotal: Math.round(garantiaTotal)
        });

        this.actualizarFooter();
    }

    recalcularGarantiaTotaltfae(row) {
        const data = row.getData();
        const garantiaTotalefectivo = data.garantiaFC * (data.teaDias / 100) * (data.factor / 100) * data.renovacion;

        row.update({
            garantiaTotalefe: Math.round(garantiaTotalefectivo)
        });

        this.actualizarFooter();
    }

    recalcularGarantiaTotalMat(row) {
        const data = row.getData();
        const garantiaTotalefectivo = data.garantiaFC * (data.teaDiasMat / 100) * (data.factor / 100) * data.renovacion;

        row.update({
            garantiaTotalMaterial: Math.round(garantiaTotalefectivo)
        });

        this.actualizarFooter();
    }

    recalcularGarantiaTotalPOLI(row) {
        const data = row.getData();
        const recalcarpoliza = data.montoConstructor * (data.teaDias / 100) * data.duracionObra;

        row.update({
            poliza: Math.round(recalcarpoliza * 100) / 100
        });

        this.actualizarFooter();
    }

    recalcularGarantiaTotalSeguroPersonal(row) {
        const data = row.getData();
        const recalcarpoliza = data.subtotal * (data.teaDias / 100) * data.duracionObra;

        row.update({
            poliza: Math.round(recalcarpoliza)
        });

        this.actualizarFooter();
    }

    recalcularGarantiaTotalSeguroEssalud(row) {
        const data = row.getData();
        const recalcarpoliza = data.descripcionessalud * (data.tea / 100);

        row.update({
            poliza: Math.round(recalcarpoliza)
        });

        this.actualizarFooter();
    }

    recalcularPagoSencico(row) {
        const data = row.getData();
        const recalcarpoliza = data.descripcion2 * (data.tea / 100);

        row.update({
            poliza: Math.round(recalcarpoliza)
        });

        this.actualizarFooter();
    }

    recalcularImpustITF(row) {
        const data = row.getData();
        const recalcarpoliza = data.descripcion2 * (data.tea / 100);

        row.update({
            poliza: Math.round(recalcarpoliza)
        });

        this.actualizarFooter();
    }

    actualizarFooter(table, data) {
        const total = this.tables.fianzaCumplimiento.getData()
            .reduce((sum, row) => sum + (row.garantiaTotal || 0), 0);

        // Busca el elemento del footer dentro del contenedor de la tabla
        const footerElement = document.querySelector("#table-fianza-cumplimiento .tabulator-footer");

        if (footerElement) {
            footerElement.innerHTML = `<span>Costo por fianza S/. ${total.toFixed(2)}</span>`;
        } else {
            console.error("❌ Error: No se encontró el footer de la tabla");
        }
    }

    formatMoney(amount) {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2
        }).format(amount);
    }

    createHTMLStructure(container) {
        container.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold">Gastos Fijos</h2>
            </div>
            <div class="table-section">
                <h3>FIANZA POR GARANTÍA DE FIEL CUMPLIMIENTO (10%)<button class="add-row-fgfc">➕</button>
                  <input type="number" 
                        name="porcentajeFGFC"
                        id="porcentajeFGFC"
                        class="w-15 inline-block pl-2 bg-transparent text-sm py-2" value="10"></h3>
                <div id="table-fianza-cumplimiento"></div>
            </div>
            
            <div class="table-section py-5">
                <h3>FIANZA POR GARANTÍA DE ADELANTO EN EFECTIVO <button class="add-row-fgae">➕</button>
                <input type="number" 
                        name="porcentajeFPGDAE"
                        id="porcentajeFPGDAE"
                        class="w-15 inline-block pl-2 bg-transparent text-sm py-2" value="10"></h3>
                <div id="table-fianza-adelanto-efectivo"></div>
            </div>
            
            <div class="table-section py-5">
                <h3>FIANZA POR GARANTÍA DE ADELANTO EN MATERIALES (20%)<button class="add-row-fgam">➕</button>
                <input type="number" 
                        name="porcentajeFGDAM"
                        id="porcentajeFGDAM"
                        class="w-15 inline-block pl-2 bg-transparent text-sm py-2" value="20"></h3>
                <div id="table-fianza-adelanto-materiales"></div>
            </div>
            
            <div class="table-section py-5">
                <h3>PÓLIZA DE SEGUROS C.A.R. CONTRA TODO RIESGO<button class="add-row-car">➕</button></h3>
                <div id="table-poliza-car"></div>
            </div>
            
            <div class="table-section py-5">
                <h3>SEGURO SCTR DEL PERSONAL<button class="add-row-sctr">➕</button></h3>
                <div id="table-seguro-sctr"></div>
            </div>
            
            <div class="table-section py-5">
                <h3>PÓLIZA DE SEGUROS ESSALUD + VIDA<button class="add-row-essalud">➕</button></h3>
                <div id="table-poliza-essalud"></div>
            </div>
            
            <div class="table-section py-5">
                <h3>PAGO SENCICO<button class="add-row-sencico">➕</button></h3>
                <div id="table-pago-sencico"></div>
            </div>
            
            <div class="table-section py-5">
                <h3>IMPUESTOS ITF<button class="add-row-itf">➕</button></h3>
                <div id="table-impuestos-itf"></div>
            </div>
            
            <div class="total-section">
                <h3>TOTAL GASTOS FIJOS: <span id="total-gastos-fijos">S/. 0.00</span></h3>
            </div>
        `;
    }

    initializeTables() {
        // Configuración común para el botón eliminar
        const deleteButton = {
            title: "Eliminar",
            field: "delete",
            width: 70,
            hozAlign: "center",
            formatter: (cell) => {
                return `<button class="delete-row">🗑️</button>`;
            },
            cellClick: (e, cell) => {
                const row = cell.getRow();
                const tableId = cell.getTable().element.id;
                const tableKey = tableId.replace('table-', '');
                this.deleteRow(tableKey, row.getData().id);
            }
        };

        // 1. FIANZA POR GARANTÍA DE FIEL CUMPLIMIENTO     
        this.tables.fianzaCumplimiento = new Tabulator("#table-fianza-cumplimiento", {
            height: "auto",
            layout: "fitColumns",
            data: [{
                id: 1, // ← Asegura que la fila tenga un ID
                descripcion: "FIANZA POR GARANTÍA DE FIEL CUMPLIMIENTO",
                garantiaFC: 485788.48,
                tea: 2.30,
                teaDias: 0.006344,
                duracionObra: 180,
                duracionLiq: 30,
                garantiaTotal: 7099.00
            }],
            columns: [
                {
                    title: "Descripción",
                    field: "descripcion",
                    width: 300,
                    editor: false
                },
                {
                    title: "Garantía F.C.",
                    field: "garantiaFC",
                    hozAlign: "right",
                    formatter: "money",
                    formatterParams: this.formatoMoneda,
                    editor: false // No editable
                },
                {
                    title: "TEA %",
                    field: "tea",
                    hozAlign: "right",
                    formatter: "number",
                    formatterParams: { precision: 2 },
                    editor: "number",
                    validator: ["required", "numeric"],
                    cellEdited: (cell) => {
                        const row = cell.getRow();
                        const tea = cell.getValue();
                        const teaDias = tea / 360;
                        row.update({ teaDias: teaDias });
                        this.recalcularGarantiaTotal(row);
                    }
                },
                {
                    title: "TEA / 360 días %",
                    field: "teaDias",
                    hozAlign: "right",
                    formatter: "number",
                    formatterParams: { precision: 6 },
                    editor: false // No editable
                },
                {
                    title: "Duración Obra (Días)",
                    field: "duracionObra",
                    hozAlign: "right",
                    editor: "number",
                    validator: ["required", "numeric"],
                    cellEdited: (cell) => {
                        this.recalcularGarantiaTotal(cell.getRow());
                    }
                },
                {
                    title: "Duración Liq. (Días)",
                    field: "duracionLiq",
                    hozAlign: "right",
                    editor: "number",
                    validator: ["required", "numeric"],
                    cellEdited: (cell) => {
                        this.recalcularGarantiaTotal(cell.getRow());
                    }
                },
                {
                    title: "Garantía F.C. (sin IGV) S/.",
                    field: "garantiaTotal",
                    hozAlign: "right",
                    formatter: "money",
                    editor: false, // No editable, 
                    bottomCalc: "sum"
                },
                deleteButton
            ],
            footerElement: "<span>Costo por fianza S/. 0.00</span>",
        });
        const inputFGFC = document.getElementById('porcentajeFGFC');
        if (inputFGFC) {
            inputFGFC.addEventListener('input', () => this.updateGarantiaFC());
        } else {
            console.error("Input 'porcentajeFGFC' no encontrado en el DOM.");
        }

        // 2. FIANZA POR GARANTÍA DE ADELANTO EN EFECTIVO
        this.tables.fianzaAdelantoEfectivo = new Tabulator("#table-fianza-adelanto-efectivo", {
            height: "auto",
            layout: "fitColumns",
            data: [
                { id: 2, descripcion: "FIANZA Adelanto en Efectivo", garantiaFC: 485788.48, tea: 2.30, teaDias: 0.006344, factor: 100.00, avance: 100.00, renovacion: 90.00, garantiaTotalefe: 3042.43 },
                { id: 3, descripcion: "FIANZA Adelanto en Efectivo", garantiaFC: 485788.48, tea: 2.30, teaDias: 0.006344, factor: 60.00, avance: 60.00, renovacion: 90.00, garantiaTotalefe: 1825.46 }
            ],
            columns: [
                { title: "Descripción", field: "descripcion", width: 220, editor: "input" },
                { title: "Garantía F.C.", field: "garantiaFC", hozAlign: "right", formatter: "money", formatterParams: this.formatoMoneda },
                {
                    title: "TEA %", field: "tea", hozAlign: "right", formatter: "money", editor: "input", formatterParams: { precision: 2, symbol: "%" },
                    validator: ["required", "numeric"],
                    cellEdited: (cell) => {
                        const row = cell.getRow();
                        const tea = cell.getValue();
                        const teaDias = tea / 360;
                        row.update({ teaDias: teaDias });
                        this.recalcularGarantiaTotaltfae(row);
                    }
                },
                { title: "TEA / 360 días %", field: "teaDias", hozAlign: "right", formatter: "money", formatterParams: { precision: 6, symbol: "%" } },
                {
                    title: "Factor %", field: "factor", hozAlign: "right", formatter: "money", editor: "input", formatterParams: { precision: 2, symbol: "%" }, validator: ["required", "numeric"],
                    cellEdited: (cell) => {
                        this.recalcularGarantiaTotaltfae(cell.getRow());
                    }
                },
                {
                    title: "Avance %", field: "avance", hozAlign: "right", formatter: "money", editor: "input", formatterParams: { precision: 2, symbol: "%" }, validator: ["required", "numeric"]
                },
                {
                    title: "Renovación c/3 meses (Días)", field: "renovacion", hozAlign: "right", editor: "input", validator: ["required", "numeric"],
                    cellEdited: (cell) => {
                        this.recalcularGarantiaTotaltfae(cell.getRow());
                    }
                },
                { title: "Garantía F.C. (sin IGV) S/.", field: "garantiaTotalefe", hozAlign: "right", formatter: "money", formatterParams: this.formatoMoneda, bottomCalc: "sum" },
                deleteButton
            ],
            footerElement: "<div>Costo por Renovación: <span class='total-renovacion'>S/. 5,186.27</span></div>",
        });
        const inputFPGDAE = document.getElementById('porcentajeFPGDAE');
        if (inputFPGDAE) {
            inputFPGDAE.addEventListener('input', () => this.updateGarantiaFPGDAE());
        } else {
            console.error("Input 'porcentajeFPGDAE' no encontrado en el DOM.");
        }

        // 3. FIANZA POR GARANTÍA DE ADELANTO EN MATERIALES
        this.tables.fianzaAdelantoMateriales = new Tabulator("#table-fianza-adelanto-materiales", {
            height: "auto",
            layout: "fitColumns",
            data: [
                { id: 4, descripcion: "FIANZA Adelanto en Materiales", garantiaFC: 973576.96, teaMat: 2.30, teaDiasMat: 0.006344, factor: 100.00, avance: 100.00, renovacion: 90.00, garantiaTotalMaterial: 6084.86 },
                { id: 5, descripcion: "FIANZA Adelanto en Materiales", garantiaFC: 973576.96, teaMat: 2.30, teaDiasMat: 0.006344, factor: 60.00, avance: 60.00, renovacion: 90.00, garantiaTotalMaterial: 3650.91 }
            ],
            columns: [
                { title: "Descripción", field: "descripcion", width: 220, editor: "input" },
                { title: "Garantía F.C.", field: "garantiaFC", hozAlign: "right", formatter: "money", editor: "input", formatterParams: this.formatoMoneda },
                {
                    title: "TEA %", field: "teaMat", hozAlign: "right", formatter: "money", editor: "input", formatterParams: { precision: 2, symbol: "%" },
                    cellEdited: (cell) => {
                        const row = cell.getRow();
                        const teaMat = cell.getValue();
                        const teaDias = teaMat / 360;
                        row.update({ teaDiasMat: teaDias });
                        this.recalcularGarantiaTotalMat(row);
                    }
                },
                { title: "TEA / 360 días %", field: "teaDiasMat", hozAlign: "right", formatter: "money", formatterParams: { precision: 6, symbol: "%" } },
                {
                    title: "Factor %", field: "factor", hozAlign: "right", formatter: "money", editor: "input", formatterParams: { precision: 2, symbol: "%" },
                    cellEdited: (cell) => {
                        this.recalcularGarantiaTotalMat(cell.getRow());
                    }
                },
                { title: "Avance %", field: "avance", hozAlign: "right", formatter: "money", editor: "input", formatterParams: { precision: 2, symbol: "%" } },
                {
                    title: "Renovación c/3 meses (Días)", field: "renovacion", hozAlign: "right", editor: "input",
                    cellEdited: (cell) => {
                        this.recalcularGarantiaTotalMat(cell.getRow());
                    }
                },
                { title: "Garantía F.C. (sin IGV) S/.", field: "garantiaTotalMaterial", hozAlign: "right", formatter: "money", formatterParams: this.formatoMoneda, bottomCalc: "sum" },
                deleteButton
            ],
        });
        const inputFGDAM = document.getElementById('porcentajeFGDAM');
        if (inputFGDAM) {
            inputFGDAM.addEventListener('input', () => this.updateGarantiaFGDAM());
        } else {
            console.error("Input 'porcentajeFPGDAE' no encontrado en el DOM.");
        }

        // 4. PÓLIZA DE SEGUROS C.A.R. CONTRA TODO RIESGO
        this.tables.polizaCAR = new Tabulator("#table-poliza-car", {
            height: "auto",
            layout: "fitColumns",
            data: [{
                id: 6,
                descripcion: "SEGUROS CAR",
                montoContrato: 485788.80,
                tea: 0.30,
                teaDias: 0.000833,
                duracionObra: 180,
                poliza: 7301.83
            }],
            columns: [
                { title: "Descripción", field: "descripcion", width: 220, editor: "input" },
                { title: "Monto del Contrato", field: "montoContrato", hozAlign: "right", formatter: "money", editor: "input", formatterParams: this.formatoMoneda },
                {
                    title: "TEA %", field: "tea", hozAlign: "right", formatter: "money", editor: "input", formatterParams: { precision: 2, symbol: "%" },
                    cellEdited: (cell) => {
                        const row = cell.getRow();
                        const tea = cell.getValue();
                        const teaDias = tea / 360;
                        row.update({ teaDias: teaDias });
                        this.recalcularGarantiaTotalPOLI(row);
                    }
                },
                { title: "TEA / 360 días %", field: "teaDias", hozAlign: "right", formatter: "money", formatterParams: { precision: 6, symbol: "%" } },
                {
                    title: "Duración Obra (Días)", field: "duracionObra", hozAlign: "right", editor: "input",
                    cellEdited: (cell) => {
                        this.recalcularGarantiaTotalPOLI(cell.getRow());
                    }
                },
                { title: "Póliza S/", field: "poliza", hozAlign: "right", formatter: "money", formatterParams: this.formatoMoneda },
                deleteButton
            ]
        });
        //setTimeout(() => this.calcularPolizaSeguro(), 500); // Espera 500ms

        // 5. SEGURO SCTR DEL PERSONAL
        this.tables.seguroSCTR = new Tabulator("#table-seguro-sctr", {
            height: "auto",
            layout: "fitColumns",
            data: [
                { id: 7, descripcion: "Tasa SALUD (Empleados)", subtotal: 310070.66, tea: 0.99, teaDias: 0.00136, duracionObra: 180, poliza: 775.18 },
                { id: 8, descripcion: "Tasa PENSIÓN", subtotal: 310070.66, tea: 1.99, teaDias: 0.00416, duracionObra: 180, poliza: 2325.53 }
            ],
            columns: [
                { title: "Descripción", field: "descripcion", width: 220, editor: "input" },
                {
                    title: "SUB TOTAL (sin IGV)", field: "subtotal", hozAlign: "right", formatter: "money", formatterParams: this.formatoMoneda,
                },
                {
                    title: "TEA %", field: "tea", hozAlign: "right", formatter: "money", editor: "input", formatterParams: { precision: 2, symbol: "%" },
                    cellEdited: (cell) => {
                        const row = cell.getRow();
                        const tea = cell.getValue();
                        const teaDias = tea / 360;
                        row.update({ teaDias: teaDias });
                        this.recalcularGarantiaTotalSeguroPersonal(row);
                    }
                },
                { title: "TEA / 360 días %", field: "teaDias", hozAlign: "right", formatter: "money", formatterParams: { precision: 6, symbol: "%" } },
                {
                    title: "Duración Obra (Días)", field: "duracionObra", hozAlign: "right", editor: "input",
                    cellEdited: (cell) => {
                        this.recalcularGarantiaTotalSeguroPersonal(cell.getRow());
                    }
                },
                { title: "Póliza S/", field: "poliza", hozAlign: "right", formatter: "money", formatterParams: this.formatoMoneda, bottomCalc: "sum" },
                deleteButton
            ],
        });
        //setTimeout(() => this.calcularSeguroPersonal(), 500); // Espera 500ms

        // 6. PÓLIZA DE SEGUROS ESSALUD + VIDA
        this.tables.polizaEssalud = new Tabulator("#table-poliza-essalud", {
            height: "auto",
            layout: "fitColumns",
            data: [{
                id: 9,
                descripcion: "PÓLIZA DE SEGUROS ESSALUD + VIDA",
                descripcionessalud: 200.00,
                tea: 0.53,
                poliza: 1129.43
            }],
            columns: [
                { title: "Descripción", field: "descripcion", width: 300, editor: "input" },
                { title: "Descripción", field: "descripcionessalud", hozAlign: "right", formatter: "money", formatterParams: this.formatoMoneda },
                {
                    title: "TEA %", field: "tea", hozAlign: "right", formatter: "money", editor: "input", formatterParams: { precision: 2, symbol: "%" },
                    cellEdited: (cell) => {
                        this.recalcularGarantiaTotalSeguroEssalud(cell.getRow());
                    }
                },
                { title: "PÓLIZA DE SCTR S/", field: "poliza", hozAlign: "right", formatter: "money", bottomCalc: "sum", formatterParams: this.formatoMoneda },
                deleteButton
            ]
        });
        //setTimeout(() => this.calcularPolizaEsalud(), 500); // Espera 500ms

        // 7. PAGO SENCICO
        this.tables.pagoSencico = new Tabulator("#table-pago-sencico", {
            height: "auto",
            layout: "fitColumns",
            data: [{
                id: 10,
                descripcion: "Sencico (0.20% del ppto)",
                descripcion2: 4857884.80,
                tea: 0.20,
                poliza: 9735.77
            }],
            columns: [
                { title: "Descripción", field: "descripcion", width: 300, editor: "input" },
                { title: "Descripción", field: "descripcion2", hozAlign: "right", formatter: "money", formatterParams: this.formatoMoneda },
                {
                    title: "TEA %", field: "tea", hozAlign: "right", formatter: "money", editor: "input", formatterParams: { precision: 2, symbol: "%" },
                    cellEdited: (cell) => {
                        this.recalcularPagoSencico(cell.getRow());
                    }
                },
                { title: "PÓLIZA DE SCTR S/", field: "poliza", hozAlign: "right", formatter: "money", bottomCalc: "sum", formatterParams: this.formatoMoneda },
                deleteButton
            ]
        });
        //setTimeout(() => this.calcularPagoSencico(), 500); // Espera 500ms

        // 8. IMPUESTOS ITF
        this.tables.impuestosITF = new Tabulator("#table-impuestos-itf", {
            height: "auto",
            layout: "fitColumns",
            data: [{
                id: 11,
                descripcion: "Impuestos ITF",
                descripcion2: 4857884.80,
                tea: 0.01,
                poliza: 738.45
            }],
            columns: [
                { title: "Descripción", field: "descripcion", width: 300, editor: "input" },
                { title: "Descripción", field: "descripcion2", hozAlign: "right", formatter: "money", formatterParams: this.formatoMoneda },
                {
                    title: "TEA %", field: "tea", hozAlign: "right", formatter: "money", editor: "input", formatterParams: { precision: 2, symbol: "%" },
                    cellEdited: (cell) => {
                        this.recalcularImpustITF(cell.getRow());
                    }
                },
                { title: "PÓLIZA DE SCTR S/", field: "poliza", hozAlign: "right", formatter: "money", bottomCalc: "sum", formatterParams: this.formatoMoneda },
                deleteButton
            ]
        });
        //setTimeout(() => this.calcularImpustoITF(), 500); // Espera 500ms
    }
}

export default gastosFijos;