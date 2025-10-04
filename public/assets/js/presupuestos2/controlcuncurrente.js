import Consolidado from "./consolidado.js";

class ControlCuncurrente {
    constructor() {
        this.table = null;
        this.staticRows = {};
        this.initStaticRows(); // Make sure this is uncommented
        this.dataTable = this.getDefaultControlCon();
        this.valorTotal = new Consolidado(this);
        this.init();
        this.addEventListeners();
        this.montoTotal = 0;
        this.montoTotalPorcentaje = 0;
    }

    init() {
        this.configTable();
        this.loadData();
    }

    loadData() {
        const id_presupuesto = document.getElementById('id_presupuestos').value;
        $.ajax({
            url: "/obtener-control-concurrente",
            type: "POST",
            data: JSON.stringify({ id_presupuesto }),
            contentType: "application/json",
            dataType: "json",
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
            },
            success: (response) => {
                if (response.status === "success" && response.data) {
                    const data = JSON.parse(response.data.control_concurrente);
                    if (data && data.length > 0) {
                        // Filter out any static rows that might be in the loaded data
                        const nonStaticData = data.filter(row => !row.isStatic);
                        this.table.setData(nonStaticData);
                    } else {
                        // If no data from server, load default data
                        this.table.setData(this.getDefaultControlCon() || []);
                    }
                } else {
                    // If error response, load default data
                    this.table.setData(this.getDefaultControlCon() || []);
                }

                // Add static rows after data is loaded
                setTimeout(() => this.addStaticRowsToEndOfTable(), 100);
            },
            error: (xhr, status, error) => {
                console.error("Error al cargar datos:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudieron cargar los datos del balance."
                });

                // Load default data on error
                this.table.setData(this.getDefaultControlCon() || []);

                // Add static rows after data is loaded
                setTimeout(() => this.addStaticRowsToEndOfTable(), 100);
            }
        });
    }

    configTable() {
        // Store reference to the class instance
        const self = this;

        this.table = new Tabulator("#controlcuncurrente", {
            data: this.dataTable,
            layout: "fitDataStretch",
            movableRows: true,
            dataTree: true,
            dataTreeStartExpanded: true,
            dataTreeChildIndent: 15,
            responsiveLayout: "collapse",
            dataLoaded: (data) => {
                this.updateTotals();
            },
            rowUpdated: (row) => {
                this.updateTotals();
            },
            columns: [
                {
                    title: "Descripcion",
                    field: "descripcion",
                    width: 450,
                    editor: "input",
                    editable: function (cell) { return !cell.getRow().getData().isStatic; }
                },
                {
                    title: "Und",
                    field: "unidad",
                    width: 100,
                    editor: "input",
                    editable: function (cell) { return !cell.getRow().getData().isStatic; }
                },
                {
                    title: "Cantidad",
                    field: "cantidad",
                    width: 100,
                    editor: "number",
                    editable: function (cell) { return !cell.getRow().getData().isStatic; },
                    editorParams: {
                        min: 0,
                        step: 0.1
                    },
                    cellEdited: (cell) => this.calculateRowValues(cell.getRow())
                },
                {
                    title: "Participacion",
                    field: "participacion",
                    width: 100,
                    editor: "number",
                    editable: function (cell) { return !cell.getRow().getData().isStatic; },
                    editorParams: {
                        min: 0,
                        max: 1,
                        step: 0.1
                    },
                    cellEdited: (cell) => this.calculateRowValues(cell.getRow())
                },
                {
                    title: "Periodo",
                    field: "periodo",
                    width: 100,
                    editor: "number",
                    editable: function (cell) { return !cell.getRow().getData().isStatic; },
                    editorParams: {
                        min: 0,
                        step: 1
                    },
                    cellEdited: (cell) => this.calculateRowValues(cell.getRow())
                },
                {
                    title: "Precio <br> Unitario",
                    field: "preciounitario",
                    width: 100,
                    editor: "number",
                    editable: function (cell) { return !cell.getRow().getData().isStatic; },
                    editorParams: {
                        min: 0,
                        step: 0.01
                    },
                    cellEdited: (cell) => this.calculateRowValues(cell.getRow())
                },
                {
                    title: "Sub Total",
                    field: "subtotal",
                    width: 100,
                    formatter: "money",
                    formatterParams: {
                        decimal: ".",
                        thousand: ",",
                        precision: 2
                    }
                },
                {
                    title: "Total",
                    field: "total",
                    width: 100,
                    formatter: "money",
                    formatterParams: {
                        decimal: ".",
                        thousand: ",",
                        precision: 2
                    }
                },
                {
                    title: "Acciones",
                    width: 130,
                    formatter: function (cell) {
                        const data = cell.getRow().getData();
                        if (data.isStatic) {
                            return ""; // No buttons for static rows
                        }
                        return `
                            <button class="btn-add-child" title="Agregar detalle">📝</button>
                            <button class="btn-delete" title="Eliminar">❌</button>
                        `;
                    },
                    cellClick: (e, cell) => {
                        const row = cell.getRow();
                        const data = row.getData();

                        if (e.target.classList.contains('btn-add-child')) {
                            this.addChildRow(row);
                        } else if (e.target.classList.contains('btn-delete')) {
                            this.deleteRow(row);
                        }
                    }
                }
            ],
        });
    }

    getDefaultControlCon() {
        return [
            {
                id: 1, descripcion: "Personal de control (** )", unidad: "", cantidad: "", participacion: "", periodo: "", preciounitario: "", subtotal: "", total: 57720.00, _children: [
                    { id: 2, descripcion: "Supervisor", unidad: "Mes", cantidad: 1, participacion: 0.2, periodo: 6, preciounitario: 10500.00, subtotal: 12600.00, total: 12600.00 },
                    { id: 3, descripcion: "Jefe de Comisión", unidad: "Mes", cantidad: 1, participacion: 0.4, periodo: 6, preciounitario: 9800.00, subtotal: 23520.00, total: 23520.00 },
                    { id: 4, descripcion: "Profesional ( integrantes de Comisión )", unidad: "Mes", cantidad: 1, participacion: 0.4, periodo: 6, preciounitario: 9000.00, subtotal: 21600.00, total: 21600.00 },
                ]
            },
            {
                id: 5, descripcion: "Equipamiento", unidad: "", cantidad: "", participacion: "", periodo: "", preciounitario: "", subtotal: "", total: 5772.00, _children: [
                    { id: 6, descripcion: "Seguridad industrial", unidad: "Glb .", cantidad: 1, participacion: 1, periodo: 1, preciounitario: 288.60, subtotal: 288.60, total: 288.60 },
                    { id: 7, descripcion: "Equipos de telecomunicaciones", unidad: "Glb .", cantidad: 1, participacion: 1, periodo: 1, preciounitario: 2886.00, subtotal: 288.60, total: 288.60 },
                    { id: 8, descripcion: "Equipos de cómputo", unidad: "Glb .", cantidad: 1, participacion: 1, periodo: 1, preciounitario: 2886.00, subtotal: 2886.00, total: 2886.00 },
                    { id: 9, descripcion: "Equipos e instrumentos de medición", unidad: "Glb .", cantidad: 1, participacion: 1, periodo: 1, preciounitario: 577.20, subtotal: 577.20, total: 577.20 },
                    { id: 10, descripcion: "Software", unidad: "Glb .", cantidad: 1, participacion: 1, periodo: 1, preciounitario: 1731.60, subtotal: 1731.60, total: 1731.60 },
                ]
            },
            {
                id: 11, descripcion: "Seguros", unidad: "", cantidad: "", participacion: "", periodo: "", preciounitario: "", subtotal: "", total: 1980.00, _children: [
                    { id: 12, descripcion: "Seguros SCTR", unidad: "Mes", cantidad: 3, participacion: 1, periodo: 6, preciounitario: 110.00, subtotal: 1980.00, total: 1980.00 },
                ]
            },
            {
                id: 13, descripcion: "Servicios especializados", unidad: "", cantidad: "", participacion: "", periodo: "", preciounitario: "", subtotal: "", total: 18500.00, _children: [
                    { id: 14, descripcion: "Servicios especializados", unidad: "Und", cantidad: 1, participacion: 1, periodo: 1, preciounitario: 18500.00, subtotal: 18500.00, total: 18500.00 },
                ]
            },
            {
                id: 15, descripcion: "Pasajes , Víaticos y bolsa de viaje", unidad: "", cantidad: "", participacion: "", periodo: "", preciounitario: "", subtotal: "", total: 3472.00, _children: [
                    { id: 16, descripcion: "Pasajes", unidad: "Pje", cantidad: 6.2, participacion: 1, periodo: 1, preciounitario: 100.00, subtotal: 620.00, total: 620.00 },
                    { id: 17, descripcion: "Viaticos", unidad: "Dia", cantidad: 24.8, participacion: 1, periodo: 1, preciounitario: 100.00, subtotal: 2480.00, total: 2480.00 },
                    { id: 18, descripcion: "Bolsa de viaje", unidad: "Viaje", cantidad: 3, participacion: 1, periodo: 1, preciounitario: 120.00, subtotal: 372.00, total: 372.00 },
                ]
            },
            {
                id: 19, descripcion: "Alquiler de vehiculos", unidad: "", cantidad: "", participacion: "", periodo: "", preciounitario: "", subtotal: "", total: 6696.00, _children: [
                    { id: 20, descripcion: "Camioneta 4x4", unidad: "Día", cantidad: 24.8, participacion: 1, periodo: 1, preciounitario: 270.00, subtotal: 6696.00, total: 6696.00 }
                ]
            },
            {
                id: 21, descripcion: "Gastos administrativos", unidad: "", cantidad: "", participacion: "", periodo: "", preciounitario: "", subtotal: "", total: 14121.00, _children: [
                    { id: 22, descripcion: "Gastos admi . ( 15 % ) ( *** )", unidad: "Glb .", cantidad: 1, participacion: 1, periodo: 1, preciounitario: 14121.00, subtotal: 14121.00, total: 14121.00 }
                ]
            },
        ];
    }

    initStaticRows() {
        this.staticRows = {};
        this.staticRowsData = [
            {
                id: 'static_total',
                descripcion: "Total Costo de Inversión del control concurrente",
                total: 0,
                isStatic: true,
                editor: false,
            },
            {
                id: 'static_percentage',
                descripcion: "(***)Control Concurrente Financiado por la entidad -- (hasta 2.0%)",
                total: 0,
                isStatic: true,
                editor: false
            }
        ];
    }

    addStaticRowsToEndOfTable() {
        // First, remove existing static rows if they exist
        for (const id in this.staticRows) {
            const row = this.table.getRow(id);
            if (row) {
                row.delete();
            }
        }

        // Reset the static rows object
        this.staticRows = {};

        // Add the static rows to the end of the table
        this.staticRowsData.forEach(rowData => {
            this.table.addRow(rowData)
                .then(row => {
                    this.staticRows[rowData.id] = row;
                })
                .catch(error => {
                    console.error("Error adding static row:", error);
                });
        });

        // Update totals after adding static rows
        this.updateTotals();
    }

    calculateRowValues(row) {
        const data = row.getData();
        if (!data.isStatic) {
            const cantidad = parseFloat(data.cantidad) || 0;
            const participacion = parseFloat(data.participacion) || 0;
            const periodo = parseFloat(data.periodo) || 0;
            const preciounitario = parseFloat(data.preciounitario) || 0;

            const subtotal = cantidad * participacion * periodo * preciounitario;
            row.update({
                subtotal: subtotal,
                total: subtotal
            });

            this.updateTotals();
        }
    }

    updateTotals() {
        try {
            let data = this.table.getData();
            data = data.filter(row => !row.isStatic);

            let totalGeneral = 0;

            // Calculate totals hierarchically
            data.forEach(parent => {
                if (parent._children) {
                    let parentTotal = 0;
                    parent._children.forEach(child => {
                        parentTotal += parseFloat(child.total) || 0;
                    });

                    // Update the parent row in the table
                    const parentRow = this.table.getRow(parent.id);
                    if (parentRow) {
                        parentRow.update({ total: parentTotal });
                    }

                    totalGeneral += parentTotal;
                } else if (!parent._children) {
                    totalGeneral += parseFloat(parent.total) || 0;
                }
            });
            //this.montoTotal = 0;
            //this.montoTotalPorcentaje = 0;
            this.montoTotal = totalGeneral;
            // Update static rows
            const totalRow = this.table.getRow("static_total");
            if (totalRow) {
                totalRow.update({ total: totalGeneral });
            }

            const percentageRow = this.table.getRow("static_percentage");
            const getTotalFinal = this.valorTotal.getValorTotalFinalConsolidado();
            const getCalcFinal = getTotalFinal * 0.02;
            this.montoTotalPorcentaje = getCalcFinal;
            if (percentageRow) {
                percentageRow.update({ total: getCalcFinal });
            }
        } catch (error) {
            console.error("Error updating totals:", error);
        }
    }

    addEventListeners() {
        document.querySelector('.add-row-fatherCCuncurrente').addEventListener('click', () => this.addParentRow());
        document.querySelector('.savecontrolCun').addEventListener('click', () => this.saveData());
    }

    addParentRow() {
        let newRow = {
            id: Date.now(),
            descripcion: "Nueva fila padre",
            unidad: "",
            cantidad: "",
            participacion: "",
            periodo: "",
            preciounitario: "",
            subtotal: "",
            total: 0,
            _children: []
        };
        this.table.addData([newRow]);
        setTimeout(() => this.addStaticRowsToEndOfTable(), 100);
    }

    addChildRow(parentRow = null) {
        let childRow = {
            id: Date.now(),
            descripcion: "Nuevo hijo",
            unidad: "",
            cantidad: 0,
            participacion: 0,
            periodo: 0,
            preciounitario: 0,
            subtotal: 0,
            total: 0
        };
        if (parentRow) {
            parentRow.addTreeChild(childRow);
            this.updateTotals();
        } else {
            // Si no hay padre, se agrega al nivel raíz
            this.table.addRow(childRow);
        }

        /*try {
            parentRow.addTreeChild(childRow)
                .then(() => {
                    this.updateTotals();
                })
                .catch(error => {
                    console.error("Error adding child row:", error);
                });
        } catch (error) {
            console.error("Error in addChildRow:", error);
        }*/
    }

    deleteRow(row) {
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
            setTimeout(() => this.addStaticRowsToEndOfTable(), 100);
        } catch (error) {
            console.error("Error deleting row:", error);
        }
    }

    saveData() {
        const idPresupuesto = document.getElementById('id_presupuestos').value;

        // Get all data except static rows
        const allData = this.table.getData();
        const nonStaticData = allData.filter(row => !row.isStatic);

        const datos = {
            contro_concurrente: nonStaticData,
            subtotal: this.montoTotal,
            total: this.montoTotalPorcentaje
        };
        const dataConcurrente = JSON.stringify({ contro_concurrente: datos });
        $.ajax({
            url: `/guardar-control-concurrente/${idPresupuesto}`,
            type: "POST",
            data: dataConcurrente,
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

export default ControlCuncurrente;