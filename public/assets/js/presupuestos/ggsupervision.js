class GGgeneralesDetails {
    constructor() {
        this.tableGGS = null;
        this.tableGGS = [];
        this.callback = null;
        this.detailContainer = document.getElementById("gastosSupervision");
        this.currentRow = null;
    }

    showDetails(row, callback) {
        const rowData = row.getData();
        this.callback = callback;
        this.clearDetails();
        this.createDetailPanel(rowData);
        const detalles = rowData.ggsupervicion.gastogeneralSupervision || this.getDefaultDetails(rowData);
        this.createDetailTable(detalles);
    }

    clearDetails() {
        this.detailContainer.innerHTML = '';
    }

    createDetailPanel() {
        this.detailContainer.innerHTML = `
            <div class="bg-white rounded-lg shadow-md">
                <div class="flex justify-between items-center">
                    <h3 class="font-bold text-xs">DETALLE DE GASTOS GENERALES DE SUPERVISIÓN</h3>
                    <div class="space-x-2">
                        <button class="agregar-padre text-xs">➕</button>                        
                        <button class="guardar-detalle text-xs">💾</button>
                    </div>
                </div>
                <div id="detail-table" class="mt-2"></div>
                <div class="bg-yellow-500 font-bold text-right px-3 py-2 mt-2 text-xs">
                    VIII. TOTAL GASTOS GENERALES: S/. <span id="valortotalGeneral">0.00</span>
                </div>
            </div>
        `;

        document.querySelector(".guardar-detalle").addEventListener("click", () => this.saveAllDetails());
        document.querySelector(".agregar-padre").addEventListener("click", () => this.addNewRow());

        //document.querySelector(".agregar-padre").addEventListener("click", () => this.agregarNodo("padre"));
    }

    createDetailTable(detalles) {
        this.tableGGS = new Tabulator("#detail-table", {
            data: detalles,
            layout: "fitDataFill",
            movableRows: true,
            dataTree: true,
            dataTreeStartExpanded: true,
            dataTreeChildIndent: 15,
            columns: [
                {
                    title: "CONCEPTO",
                    field: "concepto",
                    width: 255,
                    editor: "input",
                    headerSort: false,
                    cellClick: (e, cell) => {
                        const row = cell.getRow();
                        const data = row.getData();
                        if (data._children) {
                            row.toggleSelect();
                        }
                    }
                },
                { title: "UNIDAD", field: "unidad", width: 70, editor: "input", hozAlign: "center" },
                {
                    title: "CANTIDAD",
                    field: "cantidad",
                    width: 70,
                    editor: "number",
                    hozAlign: "right",
                    cellEdited: this.recalcularSubtotal.bind(this),
                    formatter: "number",
                    formatterParams: { precision: 2 }
                },
                {
                    title: "TIEMPO",
                    field: "tiempo",
                    width: 70,
                    editor: "number",
                    hozAlign: "right",
                    cellEdited: this.recalcularSubtotal.bind(this),
                    formatter: "number",
                    formatterParams: { precision: 2 }
                },
                {
                    title: "IMPORTE",
                    field: "importe",
                    width: 70,
                    editor: "number",
                    hozAlign: "right",
                    cellEdited: this.recalcularSubtotal.bind(this),
                    formatter: "number",
                    formatterParams: { precision: 2 }
                },
                {
                    title: "SUBTOTAL",
                    field: "subtotal",
                    width: 70,
                    hozAlign: "right",
                    formatter: (cell) => {
                        const value = cell.getValue();
                        const data = cell.getRow().getData();
                        // Solo mostrar subtotal para nodos hoja (sin hijos)
                        if (data._children) return "";
                        return value ? `S/.${parseFloat(value).toFixed(2)}` : "";
                    }
                },
                {
                    title: "TOTAL",
                    field: "total",
                    width: 80,
                    hozAlign: "right",
                    formatter: (cell) => {
                        const value = cell.getValue();
                        const data = cell.getRow().getData();
                        // Solo mostrar total para nodos padre (con hijos)
                        if (!data._children) return "";
                        return value ? `S/.${parseFloat(value).toFixed(2)}` : "";
                    },
                    bottomCalc: function (values) {
                        // Filtra valores no nulos o indefinidos
                        const validValues = values.filter(v => v !== null && v !== undefined && v !== "");
                        return validValues.reduce((sum, value) => sum + parseFloat(value || 0), 0);
                    },
                    bottomCalcFormatter: "money",
                    bottomCalcFormatterParams: { symbol: "S/.", precision: 2 }
                },
                {
                    title: "",
                    width: 70,
                    formatter: function (cell) {
                        const row = cell.getRow();
                        const data = row.getData();
                        const rowId = data.id || "sin-id"; // Fallback in case ID doesn't exist

                        return `
                            <button class='add-btn' data-row-id='${rowId}'>➕</button>
                            <button class='delete-btn' data-row-id='${rowId}'>🗑️</button>
                        `;
                    },
                    cellClick: (e, cell) => {
                        const row = cell.getRow();
                        const data = row.getData();

                        if (e.target.classList.contains('add-btn')) {
                            this.addNewRow(row);
                        } else if (e.target.classList.contains('delete-btn')) {
                            this.deleteRow(row);
                        }
                    }
                }
            ]
        });

        this.tableGGS.on("dataEdited", () => this.recalcularJerarquia());

        // Calcular los totales iniciales después de cargar los datos
        setTimeout(() => this.recalcularJerarquia(), 100);
    }

    recalcularSubtotal(cell) {
        const row = cell.getRow();
        const data = row.getData();

        // Solo calculamos subtotal si es un nodo hoja (sin hijos)
        if (!data._children) {
            const cantidad = parseFloat(data.cantidad) || 0;
            const tiempo = parseFloat(data.tiempo) || 0;
            const importe = parseFloat(data.importe) || 0;

            data.subtotal = (cantidad * tiempo * importe).toFixed(2);
            row.update(data);
        }

        // Recalcular toda la jerarquía
        this.recalcularJerarquia();
    }

    /*recalcularJerarquia() {
        // Obtenemos todos los datos de la tabla
        const datos = this.tableGGS.getData();
        const datosActualizados = this.calcularTotalesRecursivo(datos);

        // Actualizamos todos los datos de una vez
        this.tableGGS.setData(datosActualizados);

        // Calculamos el total general
        let totalGeneral = 0;

        datosActualizados.forEach(dato => {
            // Verificamos si 'total' es un número válido y si no es, lo tratamos como 0
            let total = parseFloat(dato.total);
            if (!isNaN(total)) {
                totalGeneral += total;
            }
        });
        this.totalGeneralSuper = totalGeneral;
        // Aquí tu lógica para actualizar el contenido
        document.getElementById("valortotalGeneral").innerHTML = totalGeneral;

        // Actualizamos el total en la fila actual si existe
        if (this.currentRow) {
            this.currentRow.update({ total: totalGeneral.toFixed(2) });
        }
        return totalGeneral;
    }*/
    recalcularJerarquia() {
        // Obtenemos todos los datos de la tabla solo si tableGGS no es null
        if (!this.tableGGS) {
            console.error('Error: tableGGS es null o undefined');
            return 0; // O el valor que desees retornar en caso de error
        }
        const datos = this.tableGGS.getData();
        const datosActualizados = this.calcularTotalesRecursivo(datos);
    
        // Actualizamos todos los datos de una vez
        this.tableGGS.setData(datosActualizados);
    
        // Calculamos el total general
        let totalGeneral = 0;
    
        datosActualizados.forEach(dato => {
            let total = parseFloat(dato.total);
            if (!isNaN(total)) {
                totalGeneral += total;
            }
        });
        this.totalGeneralSuper = totalGeneral;
    
        // Actualizamos el contenido del total general
        document.getElementById("valortotalGeneral").innerHTML = totalGeneral;
    
        if (this.currentRow) {
            this.currentRow.update({ total: totalGeneral.toFixed(2) });
        }
    
        return totalGeneral;
    }
    
    // Función recursiva para calcular los totales en toda la jerarquía
    calcularTotalesRecursivo(datos) {
        if (!datos || !Array.isArray(datos)) return [];

        // Procesamos cada nodo
        return datos.map(nodo => {
            // Hacemos una copia para no modificar el original
            const nodoCopia = { ...nodo };

            // Si tiene hijos, procesamos recursivamente
            if (nodoCopia._children && nodoCopia._children.length > 0) {
                // Procesamos los hijos
                nodoCopia._children = this.calcularTotalesRecursivo(nodoCopia._children);

                // Calculamos el total sumando los totales/subtotales de los hijos
                let totalHijos = 0;
                nodoCopia._children.forEach(hijo => {
                    // Sumamos el total si es un nodo padre, o el subtotal si es un nodo hoja
                    if (hijo._children && hijo._children.length > 0) {
                        totalHijos += parseFloat(hijo.total || 0);
                    } else {
                        totalHijos += parseFloat(hijo.subtotal || 0);
                    }
                });

                // Actualizamos el total del nodo
                nodoCopia.total = totalHijos.toFixed(2);
            }

            return nodoCopia;
        });
    }
    
    // When adding a new row, make sure to reference the parent ID
    addNewRow(parentRow = null) {
        let newRow = {
            id: Date.now(),
            concepto: "Nuevo Concepto",
            unidad: "",
            cantidad: 0,
            tiempo: 0,
            importe: 0,
            subtotal: "0.00",
            total: "0.00",
            _children: []
        };

        if (parentRow) {
            parentRow.addTreeChild(newRow);
        } else {
            // Si no hay padre, se agrega al nivel raíz
            this.tableGGS.addRow(newRow);
        }

        setTimeout(() => this.recalcularJerarquia(), 100);
    }

    deleteRow(row) {
        if (confirm('¿Está seguro de eliminar esta fila?')) {
            row.delete();
            setTimeout(() => this.recalcularJerarquia(), 100);
        }
    }

    // Helper function to remove a node by ID from the tree
    removeNodeById(treeData, idToRemove) {
        return treeData.filter(node => {
            if (node.id === idToRemove) {
                return false; // Remove this node
            }

            if (node._children && node._children.length > 0) {
                node._children = this.removeNodeById(node._children, idToRemove);
            }

            return true;
        });
    }

    // Función para actualizar un nodo en el árbol de datos
    updateNodeInTree(data, updatedNode) {
        return data.map(node => {
            // Si encontramos el nodo a actualizar, lo reemplazamos
            if (node.concepto === updatedNode.concepto) {
                return updatedNode;
            }

            // Si tiene hijos, buscamos recursivamente
            if (node._children && node._children.length > 0) {
                return {
                    ...node,
                    _children: this.updateNodeInTree(node._children, updatedNode)
                };
            }

            return node;
        });
    }

    getDefaultDetails() {
        return [
            {
                id: 1,
                concepto: "I. DETALLE DE GASTOS GENERALES",
                unidad: "",
                cantidad: "",
                tiempo: "",
                importe: "",
                total: "0.00",
                _children: [
                    {
                        id: 2,
                        concepto: "A. SUELDOS DE PERSONAL CEDE CENTRAL",
                        unidad: "",
                        cantidad: "",
                        tiempo: "",
                        importe: "",
                        total: "0.00",
                        _children: [
                            { id: 3, concepto: "Contador", unidad: "Mes", cantidad: 0.1, tiempo: 6, importe: 3600, subtotal: "2160.00" },
                            { id: 4, concepto: "Secretaria", unidad: "Mes", cantidad: 0.1, tiempo: 6, importe: 1800, subtotal: "1080.00" }
                        ]
                    },
                    {
                        id: 5,
                        concepto: "B. OFICINAS ADM. CEDE CENTRAL",
                        unidad: "",
                        cantidad: "",
                        tiempo: "",
                        importe: "",
                        total: "0.00",
                        _children: [
                            { id: 6, concepto: "Oficinas incl. Mobiliario y útiles", unidad: "Mes", cantidad: 0.1, tiempo: 6, importe: 1500, subtotal: "900.00" },
                            { id: 7, concepto: "Equipos de Cómputo", unidad: "Und", cantidad: 1, tiempo: 1, importe: 3500, subtotal: "3500.00" }
                        ]
                    },
                    {
                        id: 8,
                        concepto: "C. MOVILIDAD Y EQUIPOS",
                        unidad: "",
                        cantidad: "",
                        tiempo: "",
                        importe: "",
                        total: "0.00",
                        _children: [
                            { id: 9, concepto: "Alquiler de Camioneta", unidad: "Día", cantidad: 6, tiempo: 1, importe: 6200, subtotal: "37200.00" },
                            { id: 10, concepto: "Alquiler de Equipo topográfico", unidad: "Día", cantidad: 0.6, tiempo: 1, importe: 2373.28, subtotal: "1423.97" }
                        ]
                    }
                ]
            }
        ];
    }

    saveAllDetails() {
        const gastosData = this.tableGGS.getData();
        const totalGeneral = this.recalcularJerarquia();

        const allDetails = {
            ggsupervicion: {
                gastogeneralSupervision: gastosData,
                totalGeneral: totalGeneral
            }
        };

        if (this.callback) {
            this.callback(allDetails);
        }
    }
}

export default GGgeneralesDetails;