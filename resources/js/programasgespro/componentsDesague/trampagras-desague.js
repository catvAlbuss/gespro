export function initTrampaModule() {
    console.log('Inicializando módulo Trampa de Grasa');

    const trampaContent = document.getElementById('trampa-content');
    if (!trampaContent) {
        console.error('Contenedor trampa-content no encontrado');
        return;
    }

    trampaContent.innerHTML = `
                <div x-data="trampagrasaModule()" x-init="initializeTables()" class="space-y-6">
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 mb-4 shadow-xl">
                        <div class="flex items-center justify-between">
                            <div>
                                <h1 class="text-base font-bold text-white mb-2">ANEXO 10. CALCULO DE LAS TRAMPA DE GRASA</h1>
                                <p class="text-blue-100">Calculadora de Trampa de Grasa</p>
                            </div>
                            <button
                                @click="setMode()"
                                :class="mode === 'edit' ? 'bg-green-500 hover:bg-green-600' : 'bg-white hover:bg-gray-50'"
                                class="px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                                :class="mode === 'edit' ? 'text-white' : 'text-gray-800'">
                                <span class="flex items-center space-x-2">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                              :d="mode === 'edit' ? 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' : 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'"></path>
                                    </svg>
                                    <span x-text="mode === 'edit' ? 'Modo Vista' : 'Modo Editor'"></span>
                                </span>
                            </button>
                        </div>
                    </div>

                    <!-- Tabla de Aparatos Sanitarios -->
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-xl font-semibold text-gray-800">
                                <i class="fas fa-table text-green-600 mr-2"></i>
                                Unidades de Gasto de Aparatos Sanitarios
                            </h2>
                            <div x-show="mode === 'edit'" class="space-x-2">
                                <button @click="addAparatoRow()" 
                                        class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                                    <i class="fas fa-plus mr-2"></i>Agregar
                                </button>
                                <button @click="deleteSelectedAparatos()" 
                                        class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                                    <i class="fas fa-trash mr-2"></i>Eliminar
                                </button>
                            </div>
                        </div>
                        <div id="aparatos-table"></div>
                    </div>

                    <!-- Tabla de CALCULO DE TRAMPA DE GRASA -->
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-xl font-semibold text-gray-800">
                                <i class="fas fa-table text-green-600 mr-2"></i>
                                CALCULO DE TRAMPA DE GRASA
                            </h2>
                            <div x-show="mode === 'edit'" class="space-x-2">
                                <button @click="addTrampaGrasaRow()" 
                                        class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                                    <i class="fas fa-plus mr-2"></i>Agregar
                                </button>
                                <button @click="deleteTrampaGrasa()" 
                                        class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                                    <i class="fas fa-trash mr-2"></i>Eliminar
                                </button>
                            </div>
                        </div>
                        <div id="trampa-grasa-table"></div>
                    </div>

                    <!-- Tabla de CALCULO DE TRAMPA DE GRASA Final -->
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-xl font-semibold text-gray-800">
                                <i class="fas fa-table text-green-600 mr-2"></i>
                                CALCULO DE TRAMPA DE GRASA (Final)
                            </h2>
                            <div x-show="mode === 'edit'" class="space-x-2">
                                <button @click="addTrampaGrasaFinalRow()" 
                                        class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                                    <i class="fas fa-plus mr-2"></i>Agregar
                                </button>
                                <button @click="deleteTrampaGrasaFinal()" 
                                        class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                                    <i class="fas fa-trash mr-2"></i>Eliminar
                                </button>
                            </div>
                        </div>
                        <div id="trampa-grasa-final-table"></div>
                    </div>

                    <!-- Tabla de Medidas -->
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <div class="flex items-center justify-between mb-4">
                            <h2 class="text-xl font-semibold text-gray-800">
                                <i class="fas fa-table text-green-600 mr-2"></i>
                                MEDIDAS
                            </h2>
                        </div>
                        <div id="medidas-table"></div>
                    </div>
                </div>
            `;

    Alpine.data('trampagrasaModule', () => ({
        mode: 'edit',
        aparatosTable: null,
        trampaGrasaTable: null,
        trampaGrasaFinalTable: null,
        medidasTable: null,
        resultados: { anchoTotal: 0.50, largoTotal: 0.80, altoTotal: 0.50, cumple: true },

        initializeTables() {
            // Aparatos Sanitarios
            this.aparatosTable = new Tabulator("#aparatos-table", {
                data: [
                    { aparato: "LAVADERO DE COCINA", cantidad: 2, tipo: "MULTIPLE HOTEL RESTAURANTE", ug: 3, totalUG: 6 },
                    { aparato: "LAVADERO DE REPOSTERIA", cantidad: 0, tipo: "MULTIPLE HOTEL RESTAURANTE", ug: 3, totalUG: 0 },
                    { aparato: "LAVADERO DE ROPA", cantidad: 2, tipo: "", ug: 3, totalUG: 6 }
                ],
                columns: [
                    { title: "Aparato Sanitario", field: "aparato", editor: "input", editable: () => this.mode === 'edit', cellEdited: (cell) => this.updateTotalUG(cell) },
                    { title: "Cantidad", field: "cantidad", editor: "number", editable: () => this.mode === 'edit', cellEdited: (cell) => this.updateTotalUG(cell) },
                    { title: "Tipo", field: "tipo", editor: "input", editable: () => this.mode === 'edit' },
                    { title: "UG", field: "ug", editor: "number", editable: () => this.mode === 'edit', cellEdited: (cell) => this.updateTotalUG(cell) },
                    {
                        title: "Total UG", field: "totalUG", formatter: (cell) => {
                            const row = cell.getRow().getData();
                            return (parseFloat(row.cantidad) * parseFloat(row.ug)).toFixed(2);
                        }, editable: false, bottomCalc: "sum"
                    },
                    { title: "Acciones", formatter: (cell) => `<button class='delete-btn bg-red-500 text-white px-2 py-1 rounded' data-id='${cell.getRow().getIndex()}'>Eliminar</button>`, cellClick: (e, cell) => this.deleteRow(e, cell, this.aparatosTable), headerSort: false, width: 100 }
                ],
                layout: "fitColumns",
                cellEdited: (cell) => { this.updateTotalUG(cell); this.updateFinalCalculations(); },
                editable: () => this.mode === 'edit',
            });

            // Trampa de Grasa
            this.trampaGrasaTable = new Tabulator("#trampa-grasa-table", {
                data: [
                    { caracteristica: "CAUDAL DE CALCULO", valor: "Caudal máximo" },
                    { caracteristica: "Tiempo de Retención Hidráulica (TRH)", valor: "VER TABLA A LA DERECHA" },
                    { caracteristica: "Relación Largo:Ancho", valor: "1:2" },
                    { caracteristica: "Dispositivos de ingreso y salida", valor: "Codo y Tee de 90° y mínimo de ¼ pulgadas" },
                    { caracteristica: "Sumergencia del tubo de entrada", valor: "Mínimo 0.15 m respecto del nivel de salida" }
                ],
                columns: [
                    { title: "Característica", field: "caracteristica", editor: "input", editable: this.mode === 'edit' },
                    { title: "Valor", field: "valor", editor: "input", editable: this.mode === 'edit' },
                    { title: "Acciones", formatter: (cell) => `<button class='delete-btn bg-red-500 text-white px-2 py-1 rounded' data-id='${cell.getRow().getIndex()}'>Eliminar</button>`, cellClick: (e, cell) => this.deleteRow(e, cell, this.trampaGrasaTable), headerSort: false, width: 100 }
                ],
                layout: "fitColumns",
                editable: this.mode === 'edit'
            });

            // Trampa de Grasa Final
            this.trampaGrasaFinalTable = new Tabulator("#trampa-grasa-final-table", {
                data: [
                    { parametro: "UG", calculos: 6.00, unidad: "" },
                    { parametro: "CAUDAL DE DISEÑO = 0.3*RAIZ(UG)", calculos: 0.73, unidad: "lps" },
                    { parametro: "TIEMPO DE RETENCION = 3 MIN RECOMENDADO", calculos: 180.00, unidad: "seg" },
                    { parametro: "VOLUMEN REQUERIDO", calculos: 0.13, unidad: "m3" },
                    { parametro: "PROFUNDIDAD INTERNA (SIN BORDE LIBRE)", calculos: 0.40, unidad: "m" },
                    { parametro: "RELACION LARGO:ANCHO", calculos: 0.50, unidad: "" },
                    { parametro: "ANCHO INTERNO", calculos: 0.50, unidad: "m" },
                    { parametro: "LARGO INTERNO", calculos: 0.80, unidad: "m" },
                    { parametro: "VOLUMEN UTIL CALCULADO (m3)", calculos: 0.16, unidad: "m3" },
                    { parametro: "VOLUMEN UTIL CALCULADO (lts)", calculos: 160.00, unidad: "lts" },
                    { parametro: "BORDE LIBRE", calculos: 0.10, unidad: "m" },
                    { parametro: "PROFUNDIDAD (CON BORDE LIBRE)", calculos: 0.50, unidad: "m" }
                ],
                columns: [
                    { title: "Parámetro", field: "parametro", editor: false },
                    {
                        title: "Datos y Cálculos", field: "calculos",
                        editor: (cell) => {
                            const param = cell.getRow().getData().parametro;
                            return [
                                "TIEMPO DE RETENCION = 3 MIN RECOMENDADO",
                                "PROFUNDIDAD INTERNA (SIN BORDE LIBRE)",
                                "RELACION LARGO:ANCHO",
                                "ANCHO INTERNO",
                                "LARGO INTERNO",
                                "BORDE LIBRE"
                            ].includes(param) && this.mode === 'edit' ? "number" : false;
                        },
                        editable: (cell) => {
                            const param = cell.getRow().getData().parametro;
                            return [
                                "TIEMPO DE RETENCION = 3 MIN RECOMENDADO",
                                "PROFUNDIDAD INTERNA (SIN BORDE LIBRE)",
                                "RELACION LARGO:ANCHO",
                                "ANCHO INTERNO",
                                "LARGO INTERNO",
                                "BORDE LIBRE"
                            ].includes(param) && this.mode === 'edit';
                        },
                        cellEdited: (cell) => {
                            const row = cell.getRow();
                            const data = row.getData();
                            row.update({ calculos: parseFloat(cell.getValue()) });
                            this.updateFinalCalculations();
                        },
                        formatter: (cell) => {
                            const param = cell.getRow().getData().parametro;
                            const value = cell.getValue();
                            // Si la celda está siendo editada, no aplicar formato especial
                            if (cell.getElement().classList.contains('tabulator-editing')) {
                                return value;
                            }
                            // Fondo amarillo para celdas editables
                            if ([
    "TIEMPO DE RETENCION = 3 MIN RECOMENDADO",
    "PROFUNDIDAD INTERNA (SIN BORDE LIBRE)",
    "RELACION LARGO:ANCHO",
    "ANCHO INTERNO",
    "LARGO INTERNO",
    "BORDE LIBRE"
].includes(param)) {
    return `<span style='background: #ffff66; color: #d90000; font-weight:bold;'>${value}</span>`;
}
                            // Fondo beige para volumen útil calculado
                            if (["VOLUMEN UTIL CALCULADO (m3)", "VOLUMEN UTIL CALCULADO (lts)"].includes(param)) {
                                return `<span style='background: #fff2cc; color: #222;'>${value}</span>`;
                            }
                            return value;
                        }
                    },
                    { title: "Unidad", field: "unidad", editor: "input", editable: () => this.mode === 'edit' },
                    {
                        title: "Comprobaciones", field: "comprobaciones", formatter: (cell) => {
                            const row = cell.getRow().getData();
                            if (row.parametro === "TIEMPO DE RETENCION = 3 MIN RECOMENDADO") {
                                return "DATO OBTENIDO DE LA TABLA E.3.2.";
                            }
                            if (row.parametro === "VOLUMEN UTIL CALCULADO (m3)") {
                                const data = this.trampaGrasaFinalTable.getData();
                                const volUtil = parseFloat(row.calculos) || 0;
                                const volReq = parseFloat(data.find(r => r.parametro === "VOLUMEN REQUERIDO")?.calculos) || 0;
                                return volUtil >= volReq ? "OK CUMPLE" : "NO CUMPLE";
                            }
                            return "";
                        }, editable: false
                    },
                    { title: "Acciones", formatter: (cell) => `<button class='delete-btn bg-red-500 text-white px-2 py-1 rounded' data-id='${cell.getRow().getIndex()}'>Eliminar</button>`, cellClick: (e, cell) => this.deleteRow(e, cell, this.trampaGrasaFinalTable), headerSort: false, width: 100 }
                ],
                layout: "fitColumns",
                cellEdited: (cell) => this.updateFinalCalculations(),
                editable: () => this.mode === 'edit'
            });

            // Medidas
            this.medidasTable = new Tabulator("#medidas-table", {
                data: [
                    { medida: "ANCHO A", valor: 0.50, unidad: "m" },
                    { medida: "LARGO L", valor: 0.80, unidad: "m" },
                    { medida: "ALTO H", valor: 0.50, unidad: "m" }
                ],
                columns: [
                    { title: "Medida", field: "medida", editor: "input", editable: () => this.mode === 'edit' },
                    { title: "Valor", field: "valor", formatter: (cell) => this.calculateMedidaValue(cell.getRow().getData()), editor: false },
                    { title: "Unidad", field: "unidad", editor: "input", editable: () => this.mode === 'edit' },
                    {
                        title: "Comprobaciones", field: "comprobaciones", formatter: (cell) => {
                            const row = cell.getRow().getData();
                            const dataFinal = this.trampaGrasaFinalTable.getData();
                            if (row.medida === "ANCHO A") {
                                const ancho = parseFloat(row.valor) || 0;
                                const anchoFinal = parseFloat(dataFinal.find(r => r.parametro === "ANCHO INTERNO")?.calculos) || 0;
                                return ancho >= anchoFinal ? "OK CUMPLE" : "NO CUMPLE";
                            }
                            if (row.medida === "LARGO L") {
                                const largo = parseFloat(row.valor) || 0;
                                const largoFinal = parseFloat(dataFinal.find(r => r.parametro === "LARGO INTERNO")?.calculos) || 0;
                                return largo >= largoFinal ? "OK CUMPLE" : "NO CUMPLE";
                            }
                            if (row.medida === "ALTO H") {
                                const alto = parseFloat(row.valor) || 0;
                                const altoFinal = parseFloat(dataFinal.find(r => r.parametro === "PROFUNDIDAD (CON BORDE LIBRE)")?.calculos) || 0;
                                return alto >= altoFinal ? "OK CUMPLE" : "NO CUMPLE";
                            }
                            return "";
                        }, editable: false
                    }
                ],
                layout: "fitColumns",
                cellEdited: () => this.updateFinalCalculations(),
                editable: () => this.mode === 'edit'
            });
        },

        setMode() {
            this.mode = this.mode === 'edit' ? 'view' : 'edit';
            this.initializeTables();
        },

        addAparatoRow() {
            this.aparatosTable.addRow({ aparato: "", cantidad: 0, tipo: "", ug: 0, totalUG: 0 }, true);
        },

        deleteSelectedAparatos() {
            this.aparatosTable.deleteRow(this.aparatosTable.getSelectedRows());
        },

        addTrampaGrasaRow() {
            this.trampaGrasaTable.addRow({ caracteristica: "", valor: "" }, true);
        },

        deleteTrampaGrasa() {
            this.trampaGrasaTable.deleteRow(this.trampaGrasaTable.getSelectedRows());
        },

        addTrampaGrasaFinalRow() {
            this.trampaGrasaFinalTable.addRow({ parametro: "", calculos: 0, unidad: "" }, true);
        },

        deleteTrampaGrasaFinal() {
            this.trampaGrasaFinalTable.deleteRow(this.trampaGrasaFinalTable.getSelectedRows());
        },

        deleteRow(e, cell, table) {
            if (e.target.classList.contains('delete-btn')) {
                table.deleteRow(cell.getRow());
            }
        },

        updateTotalUG(cell) {
            if (cell.getField() === 'cantidad' || cell.getField() === 'ug') {
                const row = cell.getRow();
                const data = row.getData();
                const totalUG = (parseFloat(data.cantidad) || 0) * (parseFloat(data.ug) || 0);
                row.update({ totalUG: totalUG });
                this.updateFinalCalculations();
            }
        },

        calculateFinalValue(row) {
            const data = this.trampaGrasaFinalTable.getData();
            switch (row.parametro) {
                case "UG":
                    return this.aparatosTable.getData().reduce((sum, r) => sum + (r.totalUG || 0), 0).toFixed(2);
                case "CAUDAL DE DISEÑO = 0.3*RAIZ(UG)":
                    const ug = parseFloat(this.calculateFinalValue({ parametro: "UG" })) || 0;
                    return (0.3 * Math.sqrt(ug)).toFixed(2);
                case "TIEMPO DE RETENCION = 3 MIN RECOMENDADO":
                    return (3 * 60).toFixed(2);
                case "VOLUMEN REQUERIDO":
                    const caudal = parseFloat(this.calculateFinalValue({ parametro: "CAUDAL DE DISEÑO = 0.3*RAIZ(UG)" })) || 0;
                    const tiempo = parseFloat(this.calculateFinalValue({ parametro: "TIEMPO DE RETENCION = 3 MIN RECOMENDADO" })) || 0;
                    return (caudal * tiempo / 1000).toFixed(2);
                case "VOLUMEN UTIL CALCULADO (m3)":
                    const profundidadInterna = parseFloat(data.find(r => r.parametro === "PROFUNDIDAD INTERNA (SIN BORDE LIBRE)")?.calculos) || 0;
                    const anchoInterno = parseFloat(data.find(r => r.parametro === "RELACION LARGO:ANCHO")?.calculos) || 0;
                    const largoInterno = parseFloat(data.find(r => r.parametro === "LARGO INTERNO")?.calculos) || 0;
                    return (profundidadInterna * anchoInterno * largoInterno).toFixed(2);
                case "VOLUMEN UTIL CALCULADO (lts)":
                    const volumenM3 = parseFloat(this.calculateFinalValue({ parametro: "VOLUMEN UTIL CALCULADO (m3)" })) || 0;
                    return (volumenM3 * 1000).toFixed(2);
                case "PROFUNDIDAD (CON BORDE LIBRE)":
                    const profundidadSinBorde = parseFloat(data.find(r => r.parametro === "PROFUNDIDAD INTERNA (SIN BORDE LIBRE)")?.calculos) || 0;
                    const bordeLibre = parseFloat(data.find(r => r.parametro === "BORDE LIBRE")?.calculos) || 0;
                    return (profundidadSinBorde + bordeLibre).toFixed(2);
                default:
                    return row.calculos;
            }
        },

        calculateMedidaValue(row) {
            const data = this.trampaGrasaFinalTable.getData();
            switch (row.medida) {
                case "ANCHO A":
                    return parseFloat(data.find(r => r.parametro === "ANCHO INTERNO")?.calculos) || 0;
                case "LARGO L":
                    return parseFloat(data.find(r => r.parametro === "LARGO INTERNO")?.calculos) || 0;
                case "ALTO H":
                    return parseFloat(this.calculateFinalValue({ parametro: "PROFUNDIDAD (CON BORDE LIBRE)" })) || 0;
                default:
                    return row.valor;
            }
        },

        updateFinalCalculations() {
            // Recalcular todos los valores dependientes en la tabla final
            const data = this.trampaGrasaFinalTable.getData();
            // UG
            const ug = this.aparatosTable.getData().reduce((sum, r) => sum + (parseFloat(r.totalUG) || 0), 0);
            this.trampaGrasaFinalTable.updateData([{ parametro: "UG", calculos: ug }]);
            // Caudal de diseño
            const caudal = 0.3 * Math.sqrt(ug);
            this.trampaGrasaFinalTable.updateData([{ parametro: "CAUDAL DE DISEÑO = 0.3*RAIZ(UG)", calculos: caudal }]);
            // Tiempo de retención
            const tiempoRet = parseFloat(data.find(r => r.parametro === "TIEMPO DE RETENCION = 3 MIN RECOMENDADO")?.calculos) || 180;
            // Volumen requerido
            const volReq = (caudal * tiempoRet / 1000);
            this.trampaGrasaFinalTable.updateData([{ parametro: "VOLUMEN REQUERIDO", calculos: volReq }]);
            // Profundidad interna
            const profInt = parseFloat(data.find(r => r.parametro === "PROFUNDIDAD INTERNA (SIN BORDE LIBRE)")?.calculos) || 0.4;
            // Relación largo:ancho
            const relLA = parseFloat(data.find(r => r.parametro === "RELACION LARGO:ANCHO")?.calculos) || 0.5;
            // Ancho interno
            const anchoInt = parseFloat(data.find(r => r.parametro === "ANCHO INTERNO")?.calculos) || 0.5;
            // Largo interno
            const largoInt = parseFloat(data.find(r => r.parametro === "LARGO INTERNO")?.calculos) || 0.8;
            // Volumen útil calculado (m3)
            const volUtil = profInt * anchoInt * largoInt;
            this.trampaGrasaFinalTable.updateData([{ parametro: "VOLUMEN UTIL CALCULADO (m3)", calculos: volUtil }]);
            // Volumen útil calculado (lts)
            this.trampaGrasaFinalTable.updateData([{ parametro: "VOLUMEN UTIL CALCULADO (lts)", calculos: volUtil * 1000 }]);
            // Borde libre
            const bordeLibre = parseFloat(data.find(r => r.parametro === "BORDE LIBRE")?.calculos) || 0.1;
            // Profundidad con borde libre
            this.trampaGrasaFinalTable.updateData([{ parametro: "PROFUNDIDAD (CON BORDE LIBRE)", calculos: profInt + bordeLibre }]);
            // Actualizar tabla de medidas
            this.medidasTable.replaceData(this.medidasTable.getData());
        }
    }));
}

// Inicializar cuando el DOM esté listo
//document.addEventListener('DOMContentLoaded', initTrampaModule);
