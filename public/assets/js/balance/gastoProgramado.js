class GastoProgramado {
    constructor() {
        this.ingresoTable = null;
        this.gastoTable = null;
        this.tableDetails = null; // For showing details modal
        this.dataGenerales = {
            ingresos: [
                {
                    id: 1,
                    abr: 0,
                    ago: 0,
                    dic: 0,
                    ene: 0,
                    feb: 0,
                    jul: 0,
                    jun: 0,
                    mar: 0,
                    may: 0,
                    nov: 0,
                    oct: 0,
                    sep: 0,
                    total: 0,
                    registro: "123",
                    _children: [
                        {
                            id: 2,
                            abr: 0,
                            ago: 0,
                            dic: 0,
                            ene: 0,
                            feb: 0,
                            jul: 0,
                            jun: 0,
                            mar: 0,
                            may: 0,
                            nov: 0,
                            oct: 0,
                            sep: 0,
                            total: 0,
                            registro: "123",
                            datos_bal: "INGRESOS GENERALES"
                        },
                        {
                            id: 3,
                            abr: 0,
                            ago: 0,
                            dic: 0,
                            ene: 0,
                            feb: 0,
                            jul: 0,
                            jun: 0,
                            mar: 0,
                            may: 0,
                            nov: 0,
                            oct: 0,
                            sep: 0,
                            total: 0,
                            registro: "123",
                            datos_bal: "INGRESOS DE INVERSION"
                        },
                        {
                            id: 4,
                            abr: 0,
                            ago: 0,
                            dic: 0,
                            ene: 0,
                            feb: 0,
                            jul: 0,
                            jun: 0,
                            mar: 0,
                            may: 0,
                            nov: 0,
                            oct: 0,
                            sep: 0,
                            total: 0,
                            registro: "123",
                            datos_bal: "INGRESOS DE FINANCIAMIENTO"
                        }
                    ],
                    datos_bal: "INGRESOS TOTALES",
                }
            ],
            gastos: [
                {
                    id: 5,
                    abr: 0,
                    ago: 0,
                    dic: 0,
                    ene: 1214.00,
                    feb: -500.00,
                    jul: 0,
                    jun: 0,
                    mar: 0,
                    may: 2,
                    nov: 0,
                    oct: 0,
                    sep: 0,
                    total: 714.00,
                    registro: "126",
                    _children: [
                        {
                            id: 6,
                            abr: 0,
                            ago: 0,
                            dic: 0,
                            ene: 0,
                            feb: 0,
                            jul: 0,
                            jun: 0,
                            mar: 0,
                            may: 0,
                            nov: 0,
                            oct: 0,
                            sep: 0,
                            total: 0,
                            registro: "123",
                            datos_bal: "Gastos operativos"
                        },
                        {
                            id: 7,
                            abr: 0,
                            ago: 0,
                            dic: 0,
                            ene: 1214.00,
                            feb: -500.00,
                            jul: 0,
                            jun: 0,
                            mar: 0,
                            may: 0,
                            nov: 0,
                            oct: 0,
                            sep: 0,
                            total: 714.00,
                            registro: "123",
                            _children: [
                                {
                                    id: 8,
                                    abr: 0,
                                    ago: 0,
                                    dic: 0,
                                    ene: 12,
                                    feb: 0,
                                    jul: 0,
                                    jun: 0,
                                    mar: 0,
                                    may: 0,
                                    nov: 0,
                                    oct: 0,
                                    sep: 0,
                                    total: 0,
                                    registro: "123",
                                    datos_bal: "cargos"
                                },
                                {
                                    id: 9,
                                    abr: 0,
                                    ago: 0,
                                    dic: 0,
                                    ene: 1200,
                                    feb: -500,
                                    jul: 0,
                                    jun: 0,
                                    mar: 0,
                                    may: 0,
                                    nov: 0,
                                    oct: 0,
                                    sep: 0,
                                    total: 0,
                                    registro: "123",
                                    datos_bal: "mantenimiento"
                                },
                                {
                                    id: 10,
                                    abr: 0,
                                    ago: 0,
                                    dic: 0,
                                    ene: 2,
                                    feb: 0,
                                    jul: 0,
                                    jun: 0,
                                    mar: 0,
                                    may: 0,
                                    nov: 0,
                                    oct: 0,
                                    sep: 0,
                                    total: 0,
                                    registro: "123",
                                    datos_bal: "Ventilaciones"
                                }
                            ],
                            datos_bal: "Gastos de inversion"
                        },
                        {
                            id: 11,
                            abr: 0,
                            ago: 0,
                            dic: 0,
                            ene: 0,
                            feb: 0,
                            jul: 0,
                            jun: 0,
                            mar: 0,
                            may: 0,
                            nov: 0,
                            oct: 0,
                            sep: 0,
                            registro: "123",
                            datos_bal: "Gastos de financiamiento"
                        }
                    ],
                    datos_bal: "GASTOS TOTALES",
                },
            ],
            resumen: [
                {
                    id: 12,
                    datos_bal: "Estado de cuenta",
                    registro: "",
                    ene: 0, feb: 0, mar: 0, abr: 0,
                    may: 0, jun: 0, jul: 0, ago: 0,
                    sep: 0, oct: 0, nov: 0, dic: 0,
                    total: 0
                },
                {
                    id: 13,
                    datos_bal: "Diferencia de balances",
                    registro: "",
                    ene: 0, feb: 0, mar: 0, abr: 0,
                    may: 0, jun: 0, jul: 0, ago: 0,
                    sep: 0, oct: 0, nov: 0, dic: 0,
                    total: 0
                }
            ]
        };
        this.initializeEventListeners();
        this.loadData();
    }

    init() {
        // Create container for both tables
        const container = document.getElementById("table_balance_programado");

        // Create containers for each table
        const ingresosContainer = document.createElement("div");
        ingresosContainer.id = "tabla-ingresos-programado";
        ingresosContainer.className = "tabulator-container mb-4";

        const gastosContainer = document.createElement("div");
        gastosContainer.id = "tabla-gastos-programado";
        gastosContainer.className = "tabulator-container mb-4";

        const estadoContainer = document.createElement("div");
        estadoContainer.id = "tabla-estado-programado";
        estadoContainer.className = "tabulator-container mb-4";

        const resumenContainer = document.createElement("div");
        resumenContainer.id = "tabla-resumen-programado";
        resumenContainer.className = "tabulator-container mb-4";

        // Append containers to main container
        container.appendChild(ingresosContainer);
        container.appendChild(gastosContainer);
        container.appendChild(estadoContainer);
        container.appendChild(resumenContainer);

        // Configure and initialize tables
        this.configTable();

        // Add event listeners for calculations
        this.setupCalculationEvents();

        // Inicializar gráfico
        this.graficoResumen();
    }

    configTable() {
        // Column definitions for both tables
        const columnas = [
            {
                title: "",
                field: "datos_bal",
                editor: "input",
                width: 150,
                headerSort: false,
                resizable: false,
                responsive: 0,
                frozen: true
            },
            {
                title: "REGISTRO",
                field: "registro",
                hozAlign: "right",
                editor: "input",
                headerSort: false,
                width: 89,
                resizable: false,
                frozen: true
            },
            {
                title: "ENERO",
                field: "ene",
                hozAlign: "right",
                editor: "input",
                headerSort: false,
                width: 70,
                resizable: false,
                formatter: "money",
                formatterParams: { precision: 2 },
                bottomCalc: "sum",
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: { precision: 2 }
            },
            {
                title: "FEBRERO",
                field: "feb",
                hozAlign: "right",
                editor: "input",
                headerSort: false,
                width: 70,
                resizable: false,
                formatter: "money",
                formatterParams: { precision: 2 },
                bottomCalc: "sum",
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: { precision: 2 }
            },
            {
                title: "MARZO",
                field: "mar",
                hozAlign: "right",
                editor: "input",
                headerSort: false,
                width: 70,
                resizable: false,
                formatter: "money",
                formatterParams: { precision: 2 },
                bottomCalc: "sum",
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: { precision: 2 }
            },
            {
                title: "ABRIL",
                field: "abr",
                hozAlign: "right",
                editor: "input",
                headerSort: false,
                width: 70,
                resizable: false,
                formatter: "money",
                formatterParams: { precision: 2 },
                bottomCalc: "sum",
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: { precision: 2 }
            },
            {
                title: "MAYO",
                field: "may",
                hozAlign: "right",
                editor: "input",
                headerSort: false,
                width: 70,
                resizable: false,
                formatter: "money",
                formatterParams: { precision: 2 },
                bottomCalc: "sum",
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: { precision: 2 }
            },
            {
                title: "JUNIO",
                field: "jun",
                hozAlign: "right",
                editor: "input",
                headerSort: false,
                width: 70,
                resizable: false,
                formatter: "money",
                formatterParams: { precision: 2 },
                bottomCalc: "sum",
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: { precision: 2 }
            },
            {
                title: "JULIO",
                field: "jul",
                hozAlign: "right",
                editor: "input",
                headerSort: false,
                width: 70,
                resizable: false,
                formatter: "money",
                formatterParams: { precision: 2 },
                bottomCalc: "sum",
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: { precision: 2 }
            },
            {
                title: "AGOSTO",
                field: "ago",
                hozAlign: "right",
                editor: "input",
                headerSort: false,
                width: 70,
                resizable: false,
                formatter: "money",
                formatterParams: { precision: 2 },
                bottomCalc: "sum",
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: { precision: 2 }
            },
            {
                title: "SEPTIEMBRE",
                field: "sep",
                hozAlign: "right",
                editor: "input",
                headerSort: false,
                width: 90,
                resizable: false,
                formatter: "money",
                formatterParams: { precision: 2 },
                bottomCalc: "sum",
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: { precision: 2 }
            },
            {
                title: "OCTUBRE",
                field: "oct",
                hozAlign: "right",
                editor: "input",
                headerSort: false,
                width: 90,
                resizable: false,
                formatter: "money",
                formatterParams: { precision: 2 },
                bottomCalc: "sum",
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: { precision: 2 }
            },
            {
                title: "NOVIEMBRE",
                field: "nov",
                hozAlign: "right",
                editor: "input",
                headerSort: false,
                width: 100,
                resizable: false,
                formatter: "money",
                formatterParams: { precision: 2 },
                bottomCalc: "sum",
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: { precision: 2 }
            },
            {
                title: "DICIEMBRE",
                field: "dic",
                hozAlign: "right",
                editor: "input",
                headerSort: false,
                width: 90,
                resizable: false,
                formatter: "money",
                formatterParams: { precision: 2 },
                bottomCalc: "sum",
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: { precision: 2 }
            },
            {
                title: "TOTAL",
                field: "total",
                hozAlign: "right",
                headerSort: false,
                width: 70,
                resizable: false,
                formatter: "money",
                formatterParams: { precision: 2 },
                bottomCalc: "sum",
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: { precision: 2 }
            },
            {
                title: "accion",
                width: 60,
                headerSort: false,
                formatter: function () {
                    return `<button class="add-row">➕</button> <button class="delete-row">🗑️</button>`;
                },
                cellClick: function (e, cell) {
                    const row = cell.getRow();
                    const action = e.target.className;

                    if (action === "add-row") {
                        try {
                            const parentData = row.getData();
                            const children = row.getTreeChildren();

                            // Obtener el siguiente número en orden
                            const nextItem = getNextNumber(children, parentData.item);

                            // Validar el orden jerárquico
                            if (!validateHierarchicalOrder(nextItem)) {
                                console.error('Error: Orden jerárquico inválido');
                                return;
                            }

                            // Crear la nueva fila
                            const newRow = {
                                id: Date.now(),
                                datos_bal: "Nuevo Item",
                                registro: 0,
                                total: 0,
                                ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0,
                                jul: 0, ago: 0, sep: 0, oct: 0, nov: 0, dic: 0,
                                children: []
                            };

                            // Insertar la nueva fila manteniendo el orden
                            row.addTreeChild(newRow);

                            // Reordenar los hijos después de insertar
                            const sortedChildren = children
                                .map(child => child.getData())
                                .sort((a, b) => {
                                    if (!a.item) return 1;
                                    if (!b.item) return -1;
                                    return a.item.localeCompare(b.item);
                                });

                            // Actualizar el orden en la tabla
                            children.forEach((child, index) => {
                                if (sortedChildren[index]) {
                                    child.update(sortedChildren[index]);
                                }
                            });

                        } catch (error) {
                            console.error('Error al agregar fila:', error);
                        }

                    } else if (action === "delete-row") {
                        const deletedRow = row.getData();

                        if (deletedRow.item && !deletedRow.isDescriptionRow) {
                            const parent = row.getTreeParent();
                            if (parent) {
                                // Obtener y reordenar hermanos numerados
                                const siblings = parent.getTreeChildren()
                                    .filter(child => {
                                        const childData = child.getData();
                                        return childData.item && !childData.isDescriptionRow;
                                    });

                                // Eliminar la fila actual
                                row.delete();

                                // Renumerar los hermanos restantes
                                siblings.forEach((sibling, index) => {
                                    if (sibling.getData().id !== deletedRow.id) {
                                        const baseItem = deletedRow.item.split('.').slice(0, -1).join('.');
                                        const newNumber = (index + 1).toString().padStart(2, '0');
                                        sibling.update({
                                            item: `${baseItem}.${newNumber}`
                                        });
                                    }
                                });
                            }
                        } else {
                            row.delete();
                        }
                    }
                }
            }
        ];

        // Configuration for Ingresos table
        this.ingresoTable = new Tabulator("#tabla-ingresos-programado", {
            dataTree: true,
            dataTreeStartExpanded: true, // Cambiado a false para mejorar rendimiento inicial
            layout: "fitColumns",
            maxHeight: "100%",
            renderVerticalBuffer: 500,  // Mejora rendimiento
            progressiveLoad: "load", // Carga progresiva para mejorar rendimiento
            progressiveLoadDelay: 200, // Pequeño retraso para mejor UI
            ajaxContentType: "json",
            dataTreeChildField: "_children", // 🔹 Define la clave de los hijos en los datos
            //pagination: true, // 🔹 Activa paginación
            paginationMode: "remote", // 🔹 Controla los datos desde el servidor
            paginationSize: 100, // 🔹 Reduce la cantidad de datos en memoria
            columns: columnas,
            data: this.dataGenerales.ingresos,
        });

        // Configuration for Gastos table
        this.gastoTable = new Tabulator("#tabla-gastos-programado", {
            dataTree: true,
            dataTreeStartExpanded: true,
            layout: "fitColumns",
            maxHeight: "100%",
            renderVerticalBuffer: 500,
            progressiveLoad: "load",
            progressiveLoadDelay: 200,
            ajaxContentType: "json",
            dataTreeChildField: "_children",
            paginationMode: "remote",
            paginationSize: 100,
            columns: columnas,
            data: this.dataGenerales.gastos,
        });

        // Estados
        this.estadoTable = new Tabulator("#tabla-estado-programado", {
            layout: "fitDataTable",
            maxHeight: "100%",
            columns: columnas.filter(col => {
                return col.title !== "accion" && col.title !== "REGISTRO";
            }).map(col => ({
                ...col,
                editable: false,
                width: col.field === "datos_bal" ? 295 : col.width,
                responsive: 0,
                frozen: col.field === "datos_bal",
                cellStyle: (cell) => {
                    // Ajusta el padding según sea necesario
                    if (cell.getColumn().getField() === "datos_bal") {
                        return { padding: "10px" };  // Aplica padding a la celda
                    }
                    return {};  // Mantén los estilos por defecto para otras celdas
                }
            })),
            data: this.dataGenerales.ingresos,
        });

        // Resumen
        this.resumenTable = new Tabulator("#tabla-resumen-programado", {
            layout: "fitDataTable",
            maxHeight: "100%",
            columns: columnas.filter(col => {
                return col.title !== "accion" && col.title !== "REGISTRO";
            }).map(col => ({
                ...col,
                editable: false,
                width: col.field === "datos_bal" ? 295 : col.width,
                responsive: 0,
                frozen: col.field === "datos_bal",
                cellStyle: (cell) => {
                    // Ajusta el padding según sea necesario
                    if (cell.getColumn().getField() === "datos_bal") {
                        return { padding: "10px" };  // Aplica padding a la celda
                    }
                    return {};  // Mantén los estilos por defecto para otras celdas
                }
            })),
            data: this.dataGenerales.resumen // Inicializar con datos
        });

        // Calcular datos iniciales
        this.calculateEstado();
        this.calculateResumen();
    }

    setupCalculationEvents() {
        const tables = [this.ingresoTable, this.gastoTable];
        tables.forEach(table => {
            table.on("cellEdited", cell => {
                const row = cell.getRow();
                this.updateRowTotal(row);
                this.recalculateHierarchy(row);
                this.calculateEstado();
                this.calculateResumen();
                this.graficoResumen(); // Actualizar gráfico cuando hay cambios
            });
        });
    }

    recalculateHierarchy(startRow) {
        let currentRow = startRow;
        while (currentRow) {
            const parentRow = currentRow.getTreeParent();
            if (parentRow) {
                this.calculateParentTotals(parentRow);
            }
            currentRow = parentRow;
        }
    }

    calculateParentTotals(parentRow) {
        const children = parentRow.getTreeChildren();
        const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

        let totals = {
            total: 0
        };
        months.forEach(month => totals[month] = 0);

        children.forEach(child => {
            const childData = child.getData();
            months.forEach(month => {
                totals[month] = this.addPrecise(totals[month], Number(childData[month] || 0));
            });
        });

        // Calcular el total de todos los meses
        totals.total = months.reduce((sum, month) => {
            return this.addPrecise(sum, totals[month]);
        }, 0);

        // Actualizar solo los valores calculados, preservando el registro
        const currentData = parentRow.getData();
        parentRow.update({
            ...currentData,
            ...totals,
            registro: currentData.registro // Mantener el valor original del registro
        });
    }

    updateRowTotal(row) {
        const rowData = row.getData();
        const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

        // Solo calcular el total si es una fila hoja (sin hijos)
        if (!row.getTreeChildren().length) {
            const total = months.reduce((sum, month) => {
                return this.addPrecise(sum, Number(rowData[month] || 0));
            }, 0);

            row.update({ total: total });
        }
    }

    addPrecise(a, b) {
        // Usar una precisión de 2 decimales para cálculos monetarios
        const result = Math.round((Number(a) + Number(b)) * 100) / 100;
        return parseFloat(result.toFixed(2));
    }

    calculateEstado() {
        const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

        // Obtener datos directamente de las tablas principales
        const ingresosData = this.ingresoTable.getData();
        const gastosData = this.gastoTable.getData();

        // Inicializar acumuladores
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

        // Calcular valores mensuales
        meses.forEach(mes => {
            // Buscar valores en los datos
            const ingresosInversion = this.findValueInChildren(ingresosData, "INGRESOS DE INVERSION", mes);
            const gastosInversion = this.findValueInChildren(gastosData, "Gastos de inversion", mes);
            const ingresosFinanciamiento = this.findValueInChildren(ingresosData, "INGRESOS DE FINANCIAMIENTO", mes);
            const gastosFinanciamiento = this.findValueInChildren(gastosData, "Gastos de financiamiento", mes);

            // Actualizar acumulados
            acumuladoInversion = this.addPrecise(acumuladoInversion, this.addPrecise(ingresosInversion, gastosInversion));
            acumuladoFinanciamiento = this.addPrecise(acumuladoFinanciamiento, this.addPrecise(ingresosFinanciamiento, gastosFinanciamiento));

            // Asignar valores a los objetos
            estadoCuenta[mes] = acumuladoInversion;
            diferenciaBalances[mes] = acumuladoFinanciamiento;
        });

        // Actualizar totales
        estadoCuenta.total = acumuladoInversion;
        diferenciaBalances.total = acumuladoFinanciamiento;
        // Actualizar tabla
        this.estadoTable.setData([estadoCuenta, diferenciaBalances]);
    }

    findValueInChildren(data, labelToFind, month) {
        if (!Array.isArray(data)) return 0;

        for (const item of data) {
            if (item.datos_bal === labelToFind) {
                return Number(item[month] || 0);
            }
            if (item._children) {
                const value = this.findValueInChildren(item._children, labelToFind, month);
                if (value !== 0) return value;
            }
        }
        return 0;
    }

    calculateResumen() {
        const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
        const monto2023 = 0; // Puedes ajustar este valor según necesites

        // Obtener datos de las tablas
        const ingresosData = this.ingresoTable.getData();
        const gastosData = this.gastoTable.getData();

        // Inicializar objetos para cálculos
        const ingresos = {};
        const gastosTotales = {};
        const saldoAhorroNeto = {};
        const ahorroNeto = {};

        // Calcular valores mensuales
        meses.forEach((mes, index) => {
            ingresos[mes] = this.sumMonthValues(ingresosData, mes);
            gastosTotales[mes] = this.sumMonthValues(gastosData, mes);
            saldoAhorroNeto[mes] = this.addPrecise(ingresos[mes], gastosTotales[mes]);

            if (index === 0) {
                ahorroNeto[mes] = this.addPrecise(monto2023, saldoAhorroNeto[mes]);
            } else {
                ahorroNeto[mes] = this.addPrecise(ahorroNeto[meses[index - 1]], saldoAhorroNeto[mes]);
            }
        });

        // Crear datos del resumen
        const resumenData = [
            {
                id: 'resumen-1',
                datos_bal: "Monto2023",
                registro: "",
                ...meses.reduce((acc, mes) => ({ ...acc, [mes]: mes === 'ene' ? monto2023 : 0 }), {}),
                total: monto2023
            },
            {
                id: 'resumen-2',
                datos_bal: "Ingresos",
                registro: "",
                ...ingresos,
                total: Object.values(ingresos).reduce((sum, val) => this.addPrecise(sum, val), 0)
            },
            {
                id: 'resumen-3',
                datos_bal: "Gastos",
                registro: "",
                ...gastosTotales,
                total: Object.values(gastosTotales).reduce((sum, val) => this.addPrecise(sum, val), 0)
            },
            {
                id: 'resumen-4',
                datos_bal: "Saldo",
                registro: "",
                ...saldoAhorroNeto,
                total: Object.values(saldoAhorroNeto).reduce((sum, val) => this.addPrecise(sum, val), 0)
            },
            {
                id: 'resumen-5',
                datos_bal: "Ahorro Neto",
                registro: "",
                ...ahorroNeto,
                total: ahorroNeto[meses[meses.length - 1]]
            }
        ];

        // Actualizar tabla
        this.resumenTable.setData(resumenData);
    }

    sumMonthValues(data, month) {
        let sum = 0;
        for (const item of data) {
            if (item._children) {
                for (const child of item._children) {
                    sum = this.addPrecise(sum, Number(child[month] || 0));
                }
            } else {
                sum = this.addPrecise(sum, Number(item[month] || 0));
            }
        }
        return sum;
    }

    graficoResumen() {
        const meses = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
        const container = document.getElementById('grafico-resumen-programados');

        if (!container) return;

        // Obtener datos
        const ingresosData = this.ingresoTable.getData()[0] || {};
        const gastosData = this.gastoTable.getData()[0] || {};
        const resumenData = this.resumenTable.getData();

        // Preparar series
        const series = [
            {
                name: 'Ingresos',
                type: 'bar',
                stack: 'total',
                data: meses.map(mes => ingresosData[mes.toLowerCase()] || 0),
                itemStyle: { color: '#91CC75' }
            },
            {
                name: 'Gastos',
                type: 'bar',
                stack: 'total',
                data: meses.map(mes => gastosData[mes.toLowerCase()] || 0),
                itemStyle: { color: '#EE6666' }
            },
            {
                name: 'Saldo Acumulado',
                type: 'line',
                smooth: true,
                data: meses.map((_, index) => {
                    return resumenData.find(item => item.datos_bal === "Ahorro Neto")?.[meses[index].toLowerCase()] || 0;
                }),
                itemStyle: { color: '#5470C6' }
            }
        ];

        // Configurar opciones
        const option = {
            title: {
                text: 'Balance General Programado',
                left: 'center',
                textStyle: {
                    color: this.isDarkMode() ? '#ffffff' : '#333333'
                }
            },
            tooltip: {
                trigger: 'axis',
                formatter: (params) => {
                    let result = `${params[0].axisValue}<br/>`;
                    params.forEach(param => {
                        result += `${param.seriesName}: ${this.formatMoney(param.value)}<br/>`;
                    });
                    return result;
                }
            },
            legend: {
                data: ['Ingresos', 'Gastos', 'Saldo Acumulado'],
                top: '30px'
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: meses
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: (value) => this.formatMoney(value)
                }
            },
            series: series
        };

        // Inicializar o actualizar gráfico
        if (!this.chart) {
            this.chart = echarts.init(container);
        }
        this.chart.setOption(option);

        // Manejar responsive
        window.addEventListener('resize', () => this.chart.resize());
    }

    isDarkMode() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    formatMoney(value) {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2
        }).format(value);
    }

    initializeEventListeners() {
        $('#guardar').on('click', () => this.saveData());
    }

    loadData() {
        const id_contabilidad = $("#id_contabilidad").val(); // Obtener el ID del balance
        $.ajax({
            url: "/obtener-balance-programado",
            type: "POST",
            data: JSON.stringify({ id_contabilidad }), // Enviar el ID
            contentType: "application/json",
            dataType: "json",
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
            },
            success: (response) => {
                if (response.status === "success" && response.data) {
                    // Guardar los datos en dataGenerales
                    this.dataGenerales = {
                        ingresos: response.data.ingresos || [
                            {
                                id: 1,
                                abr: 0,
                                ago: 0,
                                dic: 0,
                                ene: 0,
                                feb: 0,
                                jul: 0,
                                jun: 0,
                                mar: 0,
                                may: 0,
                                nov: 0,
                                oct: 0,
                                sep: 0,
                                total: 0,
                                registro: "123",
                                _children: [
                                    {
                                        id: 2,
                                        abr: 0,
                                        ago: 0,
                                        dic: 0,
                                        ene: 0,
                                        feb: 0,
                                        jul: 0,
                                        jun: 0,
                                        mar: 0,
                                        may: 0,
                                        nov: 0,
                                        oct: 0,
                                        sep: 0,
                                        total: 0,
                                        registro: "123",
                                        datos_bal: "INGRESOS GENERALES"
                                    },
                                    {
                                        id: 3,
                                        abr: 0,
                                        ago: 0,
                                        dic: 0,
                                        ene: 0,
                                        feb: 0,
                                        jul: 0,
                                        jun: 0,
                                        mar: 0,
                                        may: 0,
                                        nov: 0,
                                        oct: 0,
                                        sep: 0,
                                        total: 0,
                                        registro: "123",
                                        datos_bal: "INGRESOS DE INVERSION"
                                    },
                                    {
                                        id: 4,
                                        abr: 0,
                                        ago: 0,
                                        dic: 0,
                                        ene: 0,
                                        feb: 0,
                                        jul: 0,
                                        jun: 0,
                                        mar: 0,
                                        may: 0,
                                        nov: 0,
                                        oct: 0,
                                        sep: 0,
                                        total: 0,
                                        registro: "123",
                                        datos_bal: "INGRESOS DE FINANCIAMIENTO"
                                    }
                                ],
                                datos_bal: "INGRESOS TOTALES",
                            }
                        ],
                        gastos: response.data.gastos || [
                            {
                                id: 5,
                                abr: 0,
                                ago: 0,
                                dic: 0,
                                ene: 1214.00,
                                feb: -500.00,
                                jul: 0,
                                jun: 0,
                                mar: 0,
                                may: 2,
                                nov: 0,
                                oct: 0,
                                sep: 0,
                                total: 714.00,
                                registro: "126",
                                _children: [
                                    {
                                        id: 6,
                                        abr: 0,
                                        ago: 0,
                                        dic: 0,
                                        ene: 0,
                                        feb: 0,
                                        jul: 0,
                                        jun: 0,
                                        mar: 0,
                                        may: 0,
                                        nov: 0,
                                        oct: 0,
                                        sep: 0,
                                        total: 0,
                                        registro: "123",
                                        datos_bal: "Gastos operativos"
                                    },
                                    {
                                        id: 7,
                                        abr: 0,
                                        ago: 0,
                                        dic: 0,
                                        ene: 1214.00,
                                        feb: -500.00,
                                        jul: 0,
                                        jun: 0,
                                        mar: 0,
                                        may: 0,
                                        nov: 0,
                                        oct: 0,
                                        sep: 0,
                                        total: 714.00,
                                        registro: "123",
                                        _children: [
                                            {
                                                id: 8,
                                                abr: 0,
                                                ago: 0,
                                                dic: 0,
                                                ene: 12,
                                                feb: 0,
                                                jul: 0,
                                                jun: 0,
                                                mar: 0,
                                                may: 0,
                                                nov: 0,
                                                oct: 0,
                                                sep: 0,
                                                total: 0,
                                                registro: "123",
                                                datos_bal: "cargos"
                                            },
                                            {
                                                id: 9,
                                                abr: 0,
                                                ago: 0,
                                                dic: 0,
                                                ene: 1200,
                                                feb: -500,
                                                jul: 0,
                                                jun: 0,
                                                mar: 0,
                                                may: 0,
                                                nov: 0,
                                                oct: 0,
                                                sep: 0,
                                                total: 0,
                                                registro: "123",
                                                datos_bal: "mantenimiento"
                                            },
                                            {
                                                id: 10,
                                                abr: 0,
                                                ago: 0,
                                                dic: 0,
                                                ene: 2,
                                                feb: 0,
                                                jul: 0,
                                                jun: 0,
                                                mar: 0,
                                                may: 0,
                                                nov: 0,
                                                oct: 0,
                                                sep: 0,
                                                total: 0,
                                                registro: "123",
                                                datos_bal: "Ventilaciones"
                                            }
                                        ],
                                        datos_bal: "Gastos de inversion"
                                    },
                                    {
                                        id: 11,
                                        abr: 0,
                                        ago: 0,
                                        dic: 0,
                                        ene: 0,
                                        feb: 0,
                                        jul: 0,
                                        jun: 0,
                                        mar: 0,
                                        may: 0,
                                        nov: 0,
                                        oct: 0,
                                        sep: 0,
                                        registro: "123",
                                        datos_bal: "Gastos de financiamiento"
                                    }
                                ],
                                datos_bal: "GASTOS TOTALES",
                            },
                        ],
                        estado: response.data.estado || [],
                        resumen: response.data.resumen || []
                    };

                    // Cargar los datos en las tablas
                    this.ingresoTable.setData(this.dataGenerales.ingresos);
                    this.gastoTable.setData(this.dataGenerales.gastos);
                    this.estadoTable.setData(this.dataGenerales.estado);
                    this.resumenTable.setData(this.dataGenerales.resumen);

                    // Actualizar cálculos y gráficos
                    this.calculateEstado();
                    this.calculateResumen();
                    this.graficoResumen();
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "No se encontraron datos para este balance."
                    });
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

    saveData() {
        const id_contabilidad = $("#id_contabilidad").val();
        const requestData = {
            id_contabilidad: id_contabilidad,  // Asegúrate de enviar el ID correcto
            rowData: JSON.stringify({
                ingresos: this.ingresoTable.getData(),
                gastos: this.gastoTable.getData(),
                estado: this.estadoTable.getData(),
                resumen: this.resumenTable.getData()
            })
        };
        const dataActualizar = JSON.stringify(requestData);

        Swal.fire({
            title: '¿Guardar cambios?',
            text: "Se actualizarán los datos del balance",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: "/actualizar-balance-programado",
                    type: "POST",
                    data: dataActualizar,
                    contentType: "application/json",
                    dataType: "json",
                    headers: {
                        "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
                    },
                    success: (response) => {
                        if (response.status === 'success') {  // ✅ Ahora verifica correctamente
                            Swal.fire({
                                icon: 'success',
                                title: 'Guardado',
                                text: response.message, // ✅ Usa el mensaje del servidor
                                timer: 1500
                            });
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: response.message || 'Error al guardar'
                            });
                        }
                    },
                    error: (xhr, status, error) => {
                        console.error("Error al guardar:", error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'No se pudieron guardar los cambios'
                        });
                    }
                });
            }
        });
    }
}

// Agregar función de validación de orden jerárquico
function validateHierarchicalOrder(item) {
    const parts = item.split('.');
    return parts.every((part, index) => {
        // Verificar que cada parte sea un número de dos dígitos
        return /^\d{2}$/.test(part) &&
            // Verificar que el número esté en el rango correcto
            parseInt(part) > 0 &&
            parseInt(part) <= 99;
    });
}

function getNextNumber(children, parentItem = '') {
    // Filtrar solo las filas numeradas y ordenarlas
    const numeratedItems = children
        .filter(child => {
            const data = child.getData();
            return data.item && !data.isDescriptionRow;
        })
        .map(child => child.getData().item)
        .sort((a, b) => {
            const partsA = a.split('.');
            const partsB = b.split('.');
            // Comparar cada nivel de la jerarquía
            for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
                const numA = parseInt(partsA[i] || '0');
                const numB = parseInt(partsB[i] || '0');
                if (numA !== numB) return numA - numB;
            }
            return 0;
        });

    // Si no hay items numerados, empezar desde 01
    if (numeratedItems.length === 0) {
        return `${parentItem}${parentItem ? '.' : ''}01`;
    }

    // Obtener el último número usado en este nivel
    const lastItem = numeratedItems[numeratedItems.length - 1];
    const lastNumber = parseInt(lastItem.split('.').pop());

    // Generar el siguiente número
    const nextNumber = (lastNumber + 1).toString().padStart(2, '0');
    return `${parentItem}${parentItem ? '.' : ''}${nextNumber}`;
}

export default GastoProgramado;