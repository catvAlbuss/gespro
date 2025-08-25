class TableDetails {
    constructor() {
        this.tableMO = null;
        this.tableMT = null;
        this.tableEQ = null;
        this.callback = null;
        this.detailContainer = document.getElementById("tabla-detall");
    }

    showDetails(row, callback) {
        const rowData = row.getData();
        this.callback = callback;
        this.clearDetails();
        this.createDetailPanel(rowData);
        const detalles = rowData.detalles || this.getDefaultDetails(rowData);
        this.createDetailTables(detalles);
    }

    clearDetails() {
        this.detailContainer.innerHTML = '';
    }

    createDetailPanel(rowData) {
        this.detailContainer.innerHTML = `
        <div class="bg-gradient-to-br from-gray-800 via-gray-900 to-black p-4 rounded-xl text-xs shadow-lg text-gray-200">
            <!-- Header -->
            <div class="flex justify-between items-center mb-3">
                <h3 class="text-sm font-bold text-white">🔍 Análisis de Costos Unitarios</h3>
                <button class="guardar-detalle bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md text-white font-semibold shadow">
                    💾 Guardar
                </button>
            </div>
    
            <!-- Información Principal -->
            <div class="grid grid-cols-2 gap-2 bg-gray-800 p-2 rounded-md shadow-inner">
                <div class="flex flex-col space-y-0.5">
                    <span class="font-semibold text-gray-400">Partida:</span>
                    <span id="items" class="font-medium text-gray-200">${rowData.item} ${rowData.descripcion}</span>
                </div>
                <div class="flex flex-col text-right space-y-0.5">
                    <span class="font-semibold text-gray-400">Costo Unitario (${rowData.detalles.unidadMD || 'm'}):</span>
                    <span id="costostotales" class="font-bold text-green-400">${rowData.precio || 0}</span>
                </div>
            </div>
    
            <!-- Rendimiento -->
            <div class="flex justify-end items-center mt-2 space-x-1">
                <span class="text-gray-400">Rendimiento:</span>
                <input 
                    type="number" 
                    id="rendimiento" 
                    class="w-16 text-center border border-gray-600 bg-gray-700 text-gray-300 rounded-md px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value="${rowData.detalles.rendimiento || 0}" 
                />
                <select 
                    id="unidadSelect" 
                    class="w-20 bg-gray-700 border border-gray-600 rounded-md px-2 py-0.5 text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500">
                    <option value="hh">hh</option>
                    <option value="kg">kg</option>
                    <option value="m">m</option>
                    <option value="m²">m²</option>
                    <option value="m³">m³</option>
                    <option value="bol">bol</option>
                    <option value="p²">p²</option>
                    <option value="p³">p³</option>
                    <option value="und">und</option>
                    <option value="lt">lt</option>
                    <option value="gal">gal</option>
                    <option value="hm">hm</option>
                    <option value="Glb">Glb</option>
                    <option value="par">Par</option>
                    <option value="rll">Rollo</option>
                    <option value="mes">Mes</option>
                </select>
                <span class="font-bold text-green-400">/ Día</span>
            </div>
    
            <!-- Secciones -->
            <div class="space-y-4 text-xs mt-4">
                <!-- Mano de Obra -->
                <div>
                    <div class="flex justify-between items-center">
                        <h4 class="font-semibold text-white">👷‍♂️ Mano de Obra</h4>
                        <button class="add-mo-row bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded-md text-white shadow">
                            ➕
                        </button>
                    </div>
                    <div id="detail-table"></div>
                </div>
    
                <!-- Materiales -->
                <div>
                    <div class="flex justify-between items-center">
                        <h4 class="font-semibold text-white">🛠 Materiales</h4>
                        <button class="add-mt-row bg-green-600 hover:bg-green-700 px-2 py-1 rounded-md text-white shadow">
                            ➕
                        </button>
                    </div>
                    <div id="detail-table-material"></div>
                </div>
    
                <!-- Equipos -->
                <div>
                    <div class="flex justify-between items-center">
                        <h4 class="font-semibold text-white">🚜 Equipos</h4>
                        <button class="add-eq-row bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded-md text-white shadow">
                            ➕
                        </button>
                    </div>
                    <div id="detail-table-equipo"></div>
                </div>
            </div>
        </div>
    `;

        const unidadSelect = document.getElementById('unidadSelect');
        unidadSelect.value = rowData.detalles.unidadMD || 'm';
        unidadSelect.addEventListener('change', function () {
            console.log("Unidad seleccionada: ", unidadSelect.value);
        });
        this.initializeDetailButtons();

    }

    initializeDetailButtons() {
        this.detailContainer.querySelector('.guardar-detalle').onclick = () => {
            this.saveAllDetails();
        };

        // Botón para agregar Mano de Obra
        this.detailContainer.querySelector('.add-mo-row').onclick = () => {
            this.tableMO.addRow({
                ind: "MO",
                codelect: "",
                descripcion: "Nueva MO",
                und: "hh",
                recursos: "1",
                cantidad: 0,
                precio: 0,
                parcial: 0
            });
        };

        // Botón para agregar Material
        this.detailContainer.querySelector('.add-mt-row').onclick = () => {
            this.tableMT.addRow({
                ind: "MT",
                codelect: "",
                descripcion: "Nuevo Material",
                und: "und",
                recursos: "-",
                cantidad: 0,
                precio: 0,
                parcial: 0
            });
        };

        // Botón para agregar Equipo
        this.detailContainer.querySelector('.add-eq-row').onclick = () => {
            this.tableEQ.addRow({
                ind: "EQ",
                codelect: "",
                descripcion: "Nuevo Equipo",
                und: "hm",
                recursos: "1",
                cantidad: 0,
                precio: 0,
                parcial: 0
            });
        };
    }

    saveAllDetails() {
        const allDetails = {
            detalles: {
                rendimiento: document.getElementById("rendimiento").value,
                unidadMD: document.getElementById("unidadSelect").value,
                manoObra: this.tableMO.getData(),
                materiales: this.tableMT.getData(),
                equipos: this.tableEQ.getData()
            },

            totalGeneral: this.calculateTotalGeneral()
        };

        if (this.callback) {
            this.callback({
                ...allDetails,
                precio: allDetails.totalGeneral
            });
        }
    }

    calculateTotalGeneral() {
        const moTotal = this.tableMO.getCalcResults().bottom.parcial || 0;
        const mtTotal = this.tableMT.getCalcResults().bottom.parcial || 0;
        const eqTotal = this.tableEQ.getCalcResults().bottom.parcial || 0;
        return moTotal + mtTotal + eqTotal;
    }

    createDetailTables(detalles) {
        // Tabla Mano de Obra
        this.tableMO = this.createTable("#detail-table", detalles.manoObra || [], "Mano de Obra");

        // Tabla Materiales
        this.tableMT = this.createTable("#detail-table-material", detalles.materiales || [], "Materiales");

        // Tabla Equipos
        this.tableEQ = this.createTable("#detail-table-equipo", detalles.equipos || [], "Equipos");

        // Actualizar totales iniciales
        this.updateTotals();
    }

    createTable(element, data, title) {
        return new Tabulator(element, {
            data: data,
            headerFilter: true,
            layout: "fitColumns",
            maxHeight: "100%",
            columns: [
                { title: "Ind.", field: "ind", width: 100, editor: "input" },
                { title: "descr.", field: "descripcion", editor: "input", widthGrow: 1 },
                {
                    title: "Unid.", field: "und", widthGrow: 1, editor: "list", editorParams: {
                        values: {
                            "hh": "horahombre",
                            "kg": "kilogramo",
                            "m": "metros",
                            "m²": "metroscuadrados",
                            "m³": "metroscubicos",
                            "bol": "bolsa",
                            "p²": "piecuadrado",
                            "p³": "piecubico",
                            "%mo": "porcentajemanoobra",
                            "und": "unidad",
                            "lt": "litro",
                            "gal": "galon",
                            "hm": "horamaquina",
                            "Glb": "galonbolsa",
                            "par": "par",
                            "rll": "rollo",
                            "mes": "mes",
                        },
                    },
                    cellEdited: (cell) => {
                        const selectedValue = cell.getValue();
                        console.log("Unidad seleccionada:", selectedValue); // Muestra el valor seleccionado en la consola
                        const row = cell.getRow();
                        row.update({ cantidad: "" }); // Limpiar el campo cantidad al cambiar unidad
                        row.getCell("cantidad").checkHeight(); // Refrescar celda
                        row.getCell("cantidad").setValue(""); // Asegurar que el valor se limpie

                        if (row.getData().und === "%mo") {
                            this.calculateRowUndMO(row);
                            const precioCell = row.getCell("precio"); // Obtener la celda de precio
                            if (precioCell) {
                                precioCell.getElement().style.backgroundColor = "yellow";
                            }
                            row.update({ recursos: "-" });
                        } else if (row.getData().und === "hh" || row.getData().und === "hm") {
                            const cantidadCell = row.getCell("cantidad");
                            if (cantidadCell) {
                                cantidadCell.getElement().style.backgroundColor = "yellow";
                            }
                        }
                    }
                },
                {
                    title: "rec.", field: "recursos", editor: "input", widthGrow: 1
                },
                {
                    title: "Cant.",
                    field: "cantidad",
                    widthGrow: 1,
                    editor: "input",
                    cellEdited: (cell) => {
                        const row = cell.getRow();
                        if (row.getData().und === "hh" || row.getData().und === "hm") {
                            this.calculateRowParcialcantidad(row);
                        } else if (row.getData().und === "%mo") {
                            this.calculateRowMOPorcent(row)
                        }
                        else {
                            this.processQuantityFormula(row);
                        }
                    }
                },
                {
                    title: "Pre.",
                    field: "precio",
                    editor: "number",
                    widthGrow: 1,
                    cellEdited: (cell) => this.calculateRowParcial(cell.getRow())
                },
                {
                    title: "Parcial",
                    field: "parcial",
                    widthGrow: 1,
                    bottomCalc: "sum",
                    bottomCalcFormatter: "money",
                    formatterParams: {
                        decimal: ".",
                        thousand: ",",
                        precision: 2
                    }
                },
                {
                    title: "",
                    width: 35, // Aumentar ancho para el nuevo botón
                    formatter: function (cell) {
                        const row = cell.getRow();
                        const data = row.getData();
                        return `
                            <button class='delete-btn'>🗑️</button>
                        `;
                    },
                    cellClick: (e, cell) => {
                        const row = cell.getRow();
                        const data = row.getData();
                        if (e.target.classList.contains('delete-btn')) {
                            row.delete();
                        }
                    }
                }
            ],
            rowAdded: (row) => {
                this.calculateRowParcial(row);
                this.updateTotals();
            },
            dataChanged: () => {
                this.updateTotalParcial();
                this.updateTotals();
            }
        });
    }

    processResourceFormula(row) {
        const data = row.getData();

        // Para otras unidades, procesar como fórmula
        try {
            const formula = data.cantidad;
            if (formula && formula.trim()) {
                // Reemplazar operadores y limpiar espacios
                const sanitizedFormula = formula.replace(/[^0-9+\-*/().]/g, '')
                    .replace(/\s+/g, '');

                // Evaluar la fórmula de manera segura
                if (this.isValidFormula(sanitizedFormula)) {
                    const result = Function('"use strict";return (' + sanitizedFormula + ')')();
                    row.update({ cantidad: parseFloat(result.toFixed(4)) });
                    this.calculateRowParcial(row);
                }
            }
        } catch (error) {
            console.error("Error en la fórmula:", error);
            // Mantener el valor anterior o establecer 0
            row.update({ cantidad: 0 });
        }
    }

    isValidFormula(formula) {
        // Validar que la fórmula solo contenga operaciones matemáticas seguras
        const validPattern = /^[0-9+\-*/().]+$/;
        return validPattern.test(formula) && !formula.includes('..') && !formula.includes('//');
    }

    processQuantityFormula(row) {
        const data = row.getData();
        try {
            const formula = data.cantidad.toString();
            if (formula && formula.trim()) {
                // Reemplazar operadores y limpiar espacios
                const sanitizedFormula = formula.replace(/[^0-9+\-*/().]/g, '')
                    .replace(/\s+/g, '');

                // Evaluar la fórmula de manera segura
                if (this.isValidFormula(sanitizedFormula)) {
                    const result = Function('"use strict";return (' + sanitizedFormula + ')')();
                    row.update({
                        cantidad: parseFloat(result.toFixed(2)),
                        parcial: parseFloat(result.toFixed(2)) * (data.precio || 0)
                    });
                }
            }
        } catch (error) {
            console.error("Error en la fórmula de cantidad:", error);
            // Mantener el valor anterior o establecer 0
            row.update({
                cantidad: 0,
                parcial: 0
            });
        }
    }

    calculateRowParcialcantidad(row) {
        const data = row.getData();
        const rendimiento = parseFloat(document.getElementById("rendimiento").value) || 1;

        if (data.und === "hh" || data.und === "hm") {
            const recursos = parseFloat(data.recursos) || 0;
            const cantidad = (recursos * 8) / rendimiento;
            row.update({ cantidad: parseFloat(cantidad.toFixed(4)) });
        }
    }

    calculateRowParcial(row) {
        const data = row.getData();
        const parcial = ((data.cantidad || 0) * (data.precio || 0)).toFixed(4);
        row.update({ parcial: parcial });
        this.updateTotals();
    }

    calculateRowUndMO(row) {
        const moTotal = this.tableMO.getCalcResults().bottom.parcial || 0;
        console.log("Total MO:", moTotal);
        row.update({ precio: moTotal });
    }

    calculateRowMOPorcent(row) {
        const data = row.getData();
        const cantidad = parseFloat(data.cantidad) || 0;
        const moTotal = this.tableMO.getCalcResults().bottom.parcial || 0;
        const parcial = ((moTotal * cantidad) / 100).toFixed(2);
        row.update({ parcial: parcial });
    }

    updateTotalParcial() {
        const moTotal = this.tableMO.getCalcResults().bottom.parcial || 0;
        const mtTotal = this.tableMT.getCalcResults().bottom.parcial || 0;
        const eqTotal = this.tableEQ.getCalcResults().bottom.parcial || 0;

        const totalGeneral = moTotal + mtTotal + eqTotal;

        if (this.callback) {
            this.callback({
                detalles: {
                    manoObra: this.tableMO.getData(),
                    materiales: this.tableMT.getData(),
                    equipos: this.tableEQ.getData()
                },
                precio: totalGeneral,
                rendimiento: document.getElementById("rendimiento").value,
            });
        }
    }

    updateTotals() {
        let basePrice = parseFloat(document.getElementById('costostotales').textContent) || 0;

        // Verificar si la función getCalcResults existe antes de llamarla
        const moTotal = (this.tableMO && typeof this.tableMO.getCalcResults === 'function')
            ? this.tableMO.getCalcResults().bottom.parcial || 0
            : 0;

        const mtTotal = (this.tableMT && typeof this.tableMT.getCalcResults === 'function')
            ? this.tableMT.getCalcResults().bottom.parcial || 0
            : 0;

        const eqTotal = (this.tableEQ && typeof this.tableEQ.getCalcResults === 'function')
            ? this.tableEQ.getCalcResults().bottom.parcial || 0
            : 0;

        const totalGeneral = (moTotal + mtTotal + eqTotal).toFixed(2);
        const montocosto = (totalGeneral == 0) ? basePrice : totalGeneral;
        document.getElementById('costostotales').textContent = montocosto;
    }

}

export default TableDetails;
