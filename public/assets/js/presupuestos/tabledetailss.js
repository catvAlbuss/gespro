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
            <div class="bg-white p-4 rounded-lg text-sm shadow-md">
                <!-- Header -->
                <div class="flex justify-between items-center mb-2">
                    <h3 class="font-bold">Análisis de Costos Unitarios</h3>
                    <button class="guardar-detalle bg-blue-500 text-white px-3 py-1 rounded">💾 Guardar</button>
                </div>

                <!-- Información principal -->
                <div class="flex justify-between items-center px-2 py-1 bg-white">
                    <div class="flex items-center space-x-2">
                        <span class="font-bold">Partida:</span>
                        <span id="items">${rowData.item} ${rowData.descripcion}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                        <span class="font-bold">Costo Unitario (${rowData.detalles.unidadMD || 'm'}):</span>
                        <span id="costostotales" class="text-right font-bold">${rowData.precio || 0}</span>
                    </div>
                </div>

                <!-- Rendimiento -->
                <div class="flex items-center space-x-2 justify-end px-2 py-1">
                    <span class="font-bold">Rendimiento:</span>
                    <input type="number" id="rendimiento" class="w-16 text-center border rounded px-1" value="${rowData.detalles.rendimiento || 0}" />
                    <select id="unidadSelect" class="border rounded px-1">
                        <option value="hh" selected>hh</option>
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
                    <span>/ Día</span>
                </div>

                <!-- Secciones -->
                <div class="space-y-2 text-sm mt-2">
                    <!-- Mano de Obra -->
                    <div>
                        <div class="flex justify-between items-center">
                            <h4 class="font-semibold">Mano de Obra</h4>
                            <button class="add-mo-row bg-blue-500 text-white px-2 py-1 rounded">➕</button>
                        </div>
                        <div id="detail-table" class="mt-1"></div>
                    </div>

                    <!-- Materiales -->
                    <div>
                        <div class="flex justify-between items-center">
                            <h4 class="font-semibold">Materiales</h4>
                            <button class="add-mt-row bg-green-500 text-white px-2 py-1 rounded">➕</button>
                        </div>
                        <div id="detail-table-material" class="mt-1"></div>
                    </div>

                    <!-- Equipos -->
                    <div>
                        <div class="flex justify-between items-center">
                            <h4 class="font-semibold">Equipos</h4>
                            <button class="add-eq-row bg-yellow-500 text-white px-2 py-1 rounded">➕</button>
                        </div>
                        <div id="detail-table-equipo" class="mt-1"></div>
                    </div>
                </div>
            </div>

        `;
        // Obtener el select y el valor de la unidad desde rowData
        const unidadSelect = document.getElementById('unidadSelect');
        const unidadMD = rowData.detalles.unidadMD || 'm';  // Valor de la unidad

        // Establecer el valor del select según unidadMD
        unidadSelect.value = unidadMD;

        // Si necesitas reaccionar al cambio, puedes agregar un listener
        unidadSelect.addEventListener('change', function () {
            console.log("Unidad seleccionada: ", unidadSelect.value);
            // Aquí podrías actualizar el valor en tu base de datos o hacer otras acciones
        });
        // Inicializar eventos
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
                { title: "Ind.", field: "ind", width:100, editor: "input" },
                { title: "descr.", field: "descripcion", editor: "input", widthGrow:1 },
                {
                    title: "Unid.", field: "und", widthGrow:1, editor: "list", editorParams: {
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
                            row.update({ recursos: "-" });
                        }
                    }
                },
                {
                    title: "rec.", field: "recursos", editor: "input", widthGrow:1
                },
                {
                    title: "Cant.",
                    field: "cantidad",
                    widthGrow:1,
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
                    widthGrow:1,
                    cellEdited: (cell) => this.calculateRowParcial(cell.getRow())
                },
                {
                    title: "Parcial",
                    field: "parcial",
                    widthGrow:1,
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
                    row.update({ cantidad: parseFloat(result.toFixed(2)) });
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
            row.update({ cantidad: parseFloat(cantidad.toFixed(2)) });
        }
    }

    calculateRowParcial(row) {
        const data = row.getData();
        const parcial = ((data.cantidad || 0) * (data.precio || 0)).toFixed(2);
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
