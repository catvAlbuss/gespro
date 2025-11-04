import { createApp } from 'vue';
import longEquival from "./longitud-components.js";
import UHData from "./uh-componets.js";

export function initRedDistribucionModule() {
    const redDistribucion = document.getElementById('tuberias-rd-grades-content');
    if (!redDistribucion) {
        console.error('Contenedor Red de Distribucion no encontrado');
        return;
    }

    const RedDistribucionComponent = {
        template: `
            <div class="w-full p-4">
                <!-- Header Principal -->
                <header class="bg-white/80 backdrop-blur-lg border-b border-slate-200/60 shadow-lg sticky top-12 z-50">
                    <div class="max-w-7xl mx-auto px-6 py-4">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-4">
                                <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg">
                                    <i class="fas fa-water text-white text-lg"></i>
                                </div>
                                <div>
                                    <h1 class="text-2xl font-bold text-slate-800">6. CALCULO DE LA RED DE DISTRIBUCION</h1>
                                    <p class="text-sm text-slate-600">Cálculo de consumo de agua</p>
                                </div>
                            </div>
                            
                            <div class="flex items-center space-x-3">
                                <div class="flex items-center space-x-2">
                                    <span class="text-sm text-slate-600">Modo:</span>
                                    <button @click="toggleMode()" 
                                            class="px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200"
                                            :class="mode === 'edit' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'">
                                        <i class="fas" :class="mode === 'edit' ? 'fa-edit' : 'fa-eye'"></i>
                                        <span v-text="mode === 'edit' ? 'Edición' : 'Vista'"></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
                
                <main class="w-full py-4 space-y-2">
                    <div class="p-6">
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 p-4 bg-white rounded-xl shadow">
                            <div class="space-y-1">
                                <label class="block text-xs font-semibold text-gray-600 tracking-wide">Nivel de Piso Terminado</label>
                                <div class="flex items-center">
                                    <input type="number" v-model.number="config.npisoterminado" step="0.001" @input="updateConfigAndNotify"
                                        class="w-full px-3 py-2 bg-yellow-100 border-2 border-yellow-300 text-gray-700 font-semibold rounded-l-md focus:outline-none">
                                    <span class="px-3 py-2 bg-gray-200 text-sm text-gray-700 rounded-r-md border-t border-b border-r border-gray-300">m</span>
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="block text-xs font-semibold text-gray-600 tracking-wide">Altura asumido del Fondo del Tanque Elevado</label>
                                <div class="flex items-center">
                                    <input type="number" v-model.number="config.altasumfondotanqueelevado" step="0.001" @input="updateConfigAndNotify"
                                        class="w-full px-3 py-2 bg-yellow-100 border-2 border-yellow-300 text-gray-700 font-semibold rounded-l-md focus:outline-none">
                                    <span class="px-3 py-2 bg-gray-200 text-sm text-gray-700 rounded-r-md border-t border-b border-r border-gray-300">m</span>
                                </div>
                            </div>
                            <div class="space-y-1">
                                <label class="block text-xs font-semibold text-gray-600 tracking-wide">Nivel asumido de Fondo de Tanque Elevado</label>
                                <div class="flex items-center">
                                  <!-- Campo calculado (solo lectura) -->
                                    <input type="number" :value="nivelasumfondotanqueelevado" step="0.001" disabled
                                        class="w-full px-3 py-2 bg-white border-2 border-white-300 text-gray-700 font-semibold rounded-l-md focus:outline-none">
                                    <span class="px-3 py-2 bg-gray-200 text-sm text-gray-700 rounded-r-md border-t border-b border-r border-gray-300">m</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <template v-for="(table, grado) in tables" :key="grado">
                        <div v-show="grades[grado]" class="bg-white/90 rounded-xl shadow-lg border border-slate-200/60 mb-6 overflow-hidden">
                            <div class="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700">
                                <div class="flex items-center space-x-2">
                                    <i class="fas fa-layer-group text-white"></i>
                                    <span class="text-lg font-semibold text-white capitalize" v-text="grado"></span>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <button v-show="mode === 'edit'" @click="addModulo(grado)" class="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs flex items-center">
                                        <i class="fas fa-plus mr-1"></i> Módulo
                                    </button>
                                    <button @click="table.expanded = !table.expanded" class="text-white focus:outline-none">
                                        <i class="fas" :class="table.expanded ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
                                    </button>
                                </div>
                            </div>
                            <div v-show="table.expanded" class="p-4 bg-white">
                                <template v-for="(modulo, idx) in table.modules" :key="modulo.id">
                                    <div class="mb-8 border border-slate-200 rounded-xl shadow-inner bg-slate-50">
                                        <div class="flex items-center justify-between px-4 py-2 bg-blue-100 rounded-t-xl">
                                            <div class="flex items-center space-x-2">
                                                <i class="fas fa-cube text-blue-700"></i>
                                                <template v-if="mode === 'edit'">
                                                    <input type="text" v-model="modulo.nombre" class="font-semibold text-blue-800 bg-white border border-blue-300 rounded px-2 py-1 text-sm w-full max-w-xl" />
                                                </template>
                                                <template v-if="mode !== 'edit'">
                                                    <span class="font-semibold text-blue-800" v-text="modulo.nombre"></span>
                                                </template>
                                            </div>
                                            <button v-show="mode === 'edit'" @click="removeModulo(grado, modulo.id)" class="text-red-600 hover:text-red-800 text-xs flex items-center">
                                                <i class="fas fa-trash-alt mr-1"></i> Eliminar módulo
                                            </button>
                                        </div>
                                        <div class="p-2">
                                            <div :id="'tabulator-table-' + grado + '-' + modulo.id" class="tabulator-table-container w-full overflow-x-auto border rounded-lg shadow-inner"></div>
                                            <div class="flex justify-end mt-2" v-show="mode === 'edit'">
                                                <button @click="addRow(grado, modulo.id)" class="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center">
                                                    <i class="fas fa-plus mr-1"></i> Fila
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </template>
                </main>
            </div>
        `,
        data() {
            return {
                mode: 'view',
                config: {
                    npisoterminado: 0.65,
                    altasumfondotanqueelevado: 13.85,
                },
                grades: {
                    inicial: true,
                    primaria: false,
                    secundaria: false
                },
                tables: {
                    inicial: { modules: [], expanded: true },
                    primaria: { modules: [], expanded: false },
                    secundaria: { modules: [], expanded: false }
                },
                tabulators: {},
                accesoriosConfig: {
                    codo90: 'codo90',
                    tee: 'tee',
                    val_compuerta: 'valCompuerta',
                    reduccion2: 'reduccion2'
                },
                resultados: {
                    grados: {},
                    exteriores: {}
                },
                totals: { totalUDPorGrado: {} },
                exterioresData: {},
            };
        },
        computed: {
            nivelasumfondotanqueelevado() {
                return +(this.config.npisoterminado + this.config.altasumfondotanqueelevado).toFixed(3);
            },
        },
        methods: {
            updateConfigAndNotify() {
                // Llamar cada vez que cambie un valor de configuración
                this.sendredDistribucionUpdate();
            },
            toggleMode() {
                // Guardar datos actuales de cada tabla antes de destruirlas
                Object.keys(this.tables).forEach(grado => {
                    this.tables[grado].modules.forEach(modulo => {
                        const tabKey = `${grado}-${modulo.id}`;
                        if (this.tabulators[tabKey]) {
                            // Guardar los datos actuales de la tabla en el módulo
                            try {
                                modulo.data = this.tabulators[tabKey].getData();
                            } catch (e) {
                                console.error('Error al guardar datos de tabla:', e);
                            }
                            this.tabulators[tabKey].destroy();
                            delete this.tabulators[tabKey];
                        }
                    });
                });
                this.mode = this.mode === 'view' ? 'edit' : 'view';
                this.$nextTick(() => {
                    Object.keys(this.tables).forEach(grado => {
                        this.tables[grado].modules.forEach(modulo => {
                            this.initTabulator(grado, modulo.id, modulo.data);
                        });
                    });
                });
            },
            configurarEventos() {
                document.addEventListener('maxima-demanda-simultanea-updated', (event) => {
                    if (!event.detail || !event.detail.grades) return;
                    const prevGrades = { ...this.grades };
                    const newGrades = { ...(event.detail.grades || {}) };
                    // Eliminar módulos de grados desactivados
                    Object.keys(prevGrades).forEach(grado => {
                        if (prevGrades[grado] && !newGrades[grado]) {
                            this.tables[grado].modules.forEach(m => {
                                const tabKey = `${grado}-${m.id}`;
                                if (this.tabulators[tabKey]) {
                                    this.tabulators[tabKey].destroy();
                                    delete this.tabulators[tabKey];
                                }
                            });
                            this.tables[grado].modules = [];
                            this.tables[grado].expanded = false;
                        }
                    });
                    // Agregar módulos solo a grados recién activados
                    Object.keys(newGrades).forEach(grado => {
                        if (newGrades[grado] && this.tables[grado].modules.length === 0) {
                            const modulo = this.crearModulo(grado);
                            this.tables[grado].modules.push(modulo);
                            this.tables[grado].expanded = true;
                            this.$nextTick(() => {
                                this.initTabulator(grado, modulo.id, modulo.data);
                            });
                        }
                    });
                    this.grades = newGrades;
                    this.exterioresData = JSON.parse(JSON.stringify(event.detail.exterioresData || {}));
                    this.totals = event.detail.totals || { totalUDPorGrado: {} };
                    this.actualizarResultados();
                });
            },
            addModulo(grado) {
                const modulo = this.crearModulo(grado);
                this.tables[grado].modules.push(modulo);
                this.$nextTick(() => {
                    this.initTabulator(grado, modulo.id, modulo.data);
                    this.sendredDistribucionUpdate();
                });
            },
            removeModulo(grado, moduloId) {
                this.tables[grado].modules = this.tables[grado].modules.filter(m => m.id !== moduloId);
                const tabKey = `${grado}-${moduloId}`;
                if (this.tabulators[tabKey]) {
                    this.tabulators[tabKey].destroy();
                    delete this.tabulators[tabKey];
                }
                this.sendredDistribucionUpdate();
            },
            addRow(grado, moduloId) {
                const tab = this.tabulators[`${grado}-${moduloId}`];
                if (tab) {
                    const newRow = this.crearFilaVacia();
                    tab.addRow(newRow);
                    this.sendredDistribucionUpdate();
                }
            },
            removeRow(grado, moduloId, rowId) {
                const tab = this.tabulators[`${grado}-${moduloId}`];
                if (tab) {
                    tab.deleteRow(rowId);
                    this.sendredDistribucionUpdate();
                }
            },
            crearFilaVacia() {
                return {
                    id: Date.now() + Math.random(),
                    segmento: 'TE',
                    punto: 'TE',
                    cota: 14.5,
                    uh_parcial: '',
                    uh_total: 259,
                    caudal: 2.9,
                    longitud: 15.5,
                    diametro: '2 1/2 pulg',
                    n1: 2,
                    codo90: 2.577,
                    n2: 1,
                    tee: 0,
                    n3: 1,
                    val_compuerta: 0,
                    n4: 1,
                    reduccion2: 0,
                    longitudtotal: 0,
                    coefrug: 150,
                    s: 0,
                    hf: 0,
                    hpiez: 0,
                    velocidad: 0,
                    presion: 0,
                    verificacion1: 'NO',
                    verificacion2: 'NO'
                };
            },
            calcularLongitudTotal(rowData) {
                const l = parseFloat(rowData.longitud) || 0;
                const n1 = parseFloat(rowData.n1) || 0;
                const codo90 = parseFloat(rowData.codo90) || 0;
                const n2 = parseFloat(rowData.n2) || 0;
                const tee = parseFloat(rowData.tee) || 0;
                const n3 = parseFloat(rowData.n3) || 0;
                const val_compuerta = parseFloat(rowData.val_compuerta) || 0;
                const n4 = parseFloat(rowData.n4) || 0;
                const reduccion2 = parseFloat(rowData.reduccion2) || 0;
                return +(l + n1 * codo90 + n2 * tee + n3 * val_compuerta + n4 * reduccion2).toFixed(3);
            },
            actualizarAccesoriosPorDiametro(row, diametro) {
                const data = row.getData();
                const updates = {};
                Object.keys(this.accesoriosConfig).forEach(field => {
                    const accesorioTipo = this.accesoriosConfig[field];
                    updates[field] = this.obtenerLongitudEquivalente(accesorioTipo, diametro);
                });
                const newData = { ...data, ...updates };
                updates.longitudtotal = this.calcularLongitudTotal(newData);
                row.update(updates);
            },
            actualizarLongitudTotal(row) {
                const data = row.getData();
                row.update({ longitudtotal: this.calcularLongitudTotal(data) });
            },
            obtenerLongitudEquivalente(accesorioTipo, diametro) {
                if (typeof longEquival !== 'undefined' && longEquival[accesorioTipo]) {
                    return longEquival[accesorioTipo][diametro] || 0;
                }
                // Valores de ejemplo si longEquival no está disponible
                const valoresEjemplo = {
                    'codo90': { '2 1/2 pulg': 2.577 },
                    'tee': { '2 1/2 pulg': 7.62 },
                    'valCompuerta': { '2 1/2 pulg': 0.69 },
                    'reduccion2': { '2 1/2 pulg': 1.91 }
                };
                return valoresEjemplo[accesorioTipo]?.[diametro] || 0;
            },
            getTankFlow(units) {
                const target = Number(units);
                if (isNaN(target)) return null;
                if (typeof UHData !== 'undefined') {
                    const entry = UHData.find(item => Number(item.units) === target);
                    return entry ? entry.tankFlow : null;
                }
                const ejemploUH = { 100: 1.5, 200: 2.5, 259: 2.9, 300: 3.2, 400: 4.1, 500: 5.0 };
                return ejemploUH[target] || null;
            },
            crearHeaderFilter(fieldName, defaultValue) {
                return function (cell) {
                    const el = document.createElement("select");
                    el.style.padding = "2px";
                    el.innerHTML = `
                        <option value="">Seleccione...</option>
                        <option value="codo45" ${defaultValue === 'codo45' ? 'selected' : ''}>Codo 45°</option>
                        <option value="codo90" ${defaultValue === 'codo90' ? 'selected' : ''}>Codo 90°</option>
                        <option value="tee" ${defaultValue === 'tee' ? 'selected' : ''}>Tee</option>
                        <option value="valCompuerta" ${defaultValue === 'valCompuerta' ? 'selected' : ''}>Val. Compuerta</option>
                        <option value="valCheck">Val. Check</option>
                        <option value="canastilla">Canastilla</option>
                        <option value="reduccion1">Reduccion 1 (d a D)</option>
                        <option value="reduccion2" ${defaultValue === 'reduccion2' ? 'selected' : ''}>Reduccion 2 (D a d)</option>
                    `;
                    el.addEventListener("change", () => {
                        const valor = el.value;
                        this.accesoriosConfig[fieldName] = valor;
                        const tabla = cell.getTable();
                        tabla.getRows().forEach(row => {
                            const data = row.getData();
                            const diametro = data.diametro;
                            const leq = this.obtenerLongitudEquivalente(valor, diametro);
                            const updates = { [fieldName]: leq };
                            const newData = { ...data, ...updates };
                            updates.longitudtotal = this.calcularLongitudTotal(newData);
                            row.update(updates);
                        });
                    });
                    return el;
                }.bind(this);
            },
            initTabulator(grado, moduloId, data = []) {
                const tableId = `#tabulator-table-${grado}-${moduloId}`;
                const tableElement = document.querySelector(tableId);
                if (!tableElement) {
                    setTimeout(() => { this.initTabulator(grado, moduloId, data); }, 100);
                    return;
                }
                if (data.length === 0) data = [this.crearFilaVacia()];
                const columns = this.getColumns(grado, moduloId);
                try {
                    const tab = new Tabulator(tableId, {
                        data: data,
                        columns: columns,
                        layout: 'fitDataStretch',
                        movableRows: this.mode === 'edit',
                        index: 'id',
                        height: 'auto',
                        resizableColumns: true,
                        headerSort: false,
                        responsiveLayout: 'scroll',
                        columnHeaderVertAlign: 'middle',
                        printAsHtml: true,
                        printHeader: "<h1>Red de Distribución<h1>",
                        printFooter: "",
                        downloadDataFormatter: (data) => data,
                        downloadReady: (fileContents, blob) => blob,
                    });
                    this.tabulators[`${grado}-${moduloId}`] = tab;
                    // Inicializar escuchas después de crear la tabla
                    setTimeout(() => {
                        this.inicializarEscuchasTabla(grado, moduloId);
                    }, 100);
                } catch (error) {
                    console.error(`Error inicializando Tabulator para ${tableId}:`, error);
                }
            },
            customFormulaEditor(cell, onRendered, success, cancel) {
                const input = document.createElement("input");
                input.type = "text";
                input.classList.add("tabulator-editor");
                const rowData = cell.getData();
                const rawFormula = rowData.rawCota ?? cell.getValue();
                input.value = rawFormula;
                onRendered(() => { input.focus(); input.select(); });
                function onBlurOrEnter() {
                    const value = input.value;
                    const newData = { cota: value };
                    if (value.trim().startsWith('=')) {
                        try {
                            const result = Function(`"use strict"; return (${value.substring(1)})`)();
                            newData.cota = isNaN(result) ? 'Error' : result;
                            newData.rawCota = value;
                        } catch {
                            newData.cota = 'Error';
                            newData.rawCota = value;
                        }
                    } else {
                        newData.rawCota = null;
                    }
                    cell.getRow().update(newData);
                    success(newData.cota);
                }
                input.addEventListener("keydown", e => {
                    if (e.key === "Enter") onBlurOrEnter();
                    if (e.key === "Escape") cancel();
                });
                input.addEventListener("blur", onBlurOrEnter);
                return input;
            },
            formulaFormatter(cell) {
                const rowData = cell.getData();
                const formula = rowData.rawCota || cell.getValue();
                if (typeof formula === 'string' && formula.trim().startsWith('=')) {
                    try {
                        const expr = formula.substring(1);
                        const result = Function(`"use strict"; return (${expr})`)();
                        return isNaN(result) ? 'Error' : (+result).toFixed(3);
                    } catch {
                        return 'Error';
                    }
                }
                return formula;
            },
            actualizarResultados() {
                const totalUDPorGrado = {};
                Object.entries(this.grades).filter(([g, a]) => a).forEach(([grado]) => {
                    totalUDPorGrado[grado] = this.totals?.totalUDPorGrado?.[grado] || 0;
                });
                const uhTotalExterioresPorGrado = {};
                Object.entries(this.grades).filter(([g, a]) => a).forEach(([grado]) => {
                    const entradaExterior = Object.values(this.exterioresData || {}).find(ext => ext.nombre?.toLowerCase().includes(grado.toLowerCase()));
                    uhTotalExterioresPorGrado[grado] = entradaExterior ? +((entradaExterior.uhTotal ?? (entradaExterior.salidasRiego * entradaExterior.uh)) || 0) : 0;
                });
                Object.entries(this.tabulators).forEach(([key, tabulatorInstance]) => {
                    if (!tabulatorInstance) return;
                    const grado = key.split('-')[0];
                    if (!this.grades[grado]) return;
                    let data = tabulatorInstance.getData();
                    if (!Array.isArray(data) || data.length === 0) return;
                    const sumaInicialGrado = (totalUDPorGrado[grado] || 0) + (uhTotalExterioresPorGrado[grado] || 0);
                    data.forEach((row, index, allRows) => {
                        let uhTotalCalculado = 0;
                        if (index === 0) {
                            uhTotalCalculado = sumaInicialGrado;
                        } else {
                            const uhParcialActual = parseFloat(row.uh_parcial) || 0;
                            const uhTotalAnterior = parseFloat(allRows[index - 1].uh_total) || 0;
                            uhTotalCalculado = uhTotalAnterior - uhParcialActual;
                        }
                        row.uh_total = +uhTotalCalculado.toFixed(3);
                        const caudal = this.getTankFlow(uhTotalCalculado);
                        row.caudal = (caudal !== null && caudal !== undefined) ? +caudal.toFixed(3) : 0;
                    });
                    tabulatorInstance.replaceData(data);
                });
                this.sendredDistribucionUpdate();
            },
            buscarHpiezPorPunto(grado, puntoABuscar) {
                if (!puntoABuscar || !this.tables[grado]?.modules?.[0]) return null;

                const primerModulo = this.tables[grado].modules[0];
                const tabulatorKey = `${grado}-${primerModulo.id}`;
                const tabulatorInstance = this.tabulators[tabulatorKey];

                let dataToSearch;
                if (tabulatorInstance) {
                    dataToSearch = tabulatorInstance.getData();
                } else {
                    dataToSearch = primerModulo.data;
                }

                if (!Array.isArray(dataToSearch)) return null;

                const filaEncontrada = dataToSearch.find(fila =>
                    fila.punto &&
                    fila.punto.toString().toLowerCase().trim() === puntoABuscar.toString().toLowerCase().trim()
                );

                return filaEncontrada ? (parseFloat(filaEncontrada.hpiez) || 0) : null;
            },
            actualizarFilaEstaticaPorPunto(grado, moduloIndex, puntoABuscar) {
                if (moduloIndex <= 0) return;

                const hpiezEncontrado = this.buscarHpiezPorPunto(grado, puntoABuscar);
                if (hpiezEncontrado === null) return;

                const modulo = this.tables[grado].modules[moduloIndex];
                if (!modulo || !Array.isArray(modulo.data)) return;

                const filaEstatica = modulo.data.find(fila => fila.isStatic);
                if (!filaEstatica) return;

                filaEstatica.cota = hpiezEncontrado;
                filaEstatica.hpiez = hpiezEncontrado;

                const tabulatorKey = `${grado}-${modulo.id}`;
                const tabulatorInstance = this.tabulators[tabulatorKey];
                if (tabulatorInstance) {
                    const filaTabulator = tabulatorInstance.getRows().find(row =>
                        row.getData().id === filaEstatica.id
                    );
                    if (filaTabulator) {
                        filaTabulator.update({
                            cota: hpiezEncontrado,
                            hpiez: hpiezEncontrado
                        });
                    }
                }
            },
            configurarEscuchasCambiosPrimerModulo(grado) {
                const primerModulo = this.tables[grado]?.modules?.[0];
                if (!primerModulo) return;

                const tabulatorKey = `${grado}-${primerModulo.id}`;
                const tabulatorInstance = this.tabulators[tabulatorKey];

                if (!tabulatorInstance) return;

                // Remover escuchas previas para evitar duplicados
                tabulatorInstance.off("cellEdited");
                tabulatorInstance.off("dataChanged");

                // Escuchar cambios en cualquier celda del primer módulo
                tabulatorInstance.on("cellEdited", (cell) => {
                    const field = cell.getField();
                    const rowData = cell.getRow().getData();

                    // Si cambió hpiez o cualquier campo que pueda afectar hpiez
                    if (['hpiez', 'coefrug', 'hf', 's', 'punto'].includes(field)) {
                        // Sincronizar después de un pequeño delay para permitir que se complete la actualización
                        setTimeout(() => {
                            this.sincronizarModulosConPunto(grado, rowData.punto, rowData.hpiez);
                        }, 50);
                    }
                });

                // Escuchar cuando se recalculan los resultados (importante para cálculos automáticos)
                tabulatorInstance.on("dataChanged", () => {
                    setTimeout(() => {
                        this.sincronizarTodosLosModulos(grado);
                    }, 100);
                });
            },
            sincronizarModulosConPunto(grado, punto, nuevoHpiez) {
                if (!punto || nuevoHpiez === undefined || nuevoHpiez === null) return;

                const hpiezValue = parseFloat(nuevoHpiez) || 0;

                // Recorrer todos los módulos excepto el primero
                this.tables[grado]?.modules?.forEach((modulo, index) => {
                    if (index === 0) return; // Saltar el primer módulo

                    // Buscar fila estática en los datos del módulo
                    const filaEstatica = modulo.data.find(fila => fila.isStatic);
                    if (!filaEstatica) return;

                    // Verificar si el punto de la fila estática coincide (case-insensitive)
                    if (filaEstatica.punto &&
                        filaEstatica.punto.toString().toLowerCase().trim() === punto.toString().toLowerCase().trim()) {

                        // Actualizar los valores en los datos del módulo
                        filaEstatica.cota = hpiezValue;
                        filaEstatica.hpiez = hpiezValue;

                        // Actualizar en Tabulator si existe
                        const tabulatorKey = `${grado}-${modulo.id}`;
                        const tabulatorInstance = this.tabulators[tabulatorKey];
                        if (tabulatorInstance) {
                            const filaTabulator = tabulatorInstance.getRows().find(row =>
                                row.getData().id === filaEstatica.id
                            );
                            if (filaTabulator) {
                                filaTabulator.update({
                                    cota: hpiezValue,
                                    hpiez: hpiezValue
                                });
                            }
                        }
                    }
                });
            },
            sincronizarTodosLosModulos(grado) {
                const primerModulo = this.tables[grado]?.modules?.[0];
                if (!primerModulo || !Array.isArray(primerModulo.data)) return;

                // Para cada fila del primer módulo, sincronizar con módulos dependientes
                primerModulo.data.forEach(fila => {
                    if (fila.punto && fila.hpiez !== undefined) {
                        this.sincronizarModulosConPunto(grado, fila.punto, fila.hpiez);
                    }
                });
            },
            manejarCambioPunto(grado, moduloId, nuevoPunto, filaId) {
                const moduloIndex = this.obtenerIndiceModulo(grado, moduloId);

                // Si no es el primer módulo y es una fila estática
                if (moduloIndex > 0) {
                    const modulo = this.tables[grado].modules[moduloIndex];
                    const filaEstatica = modulo.data.find(f => f.id === filaId && f.isStatic);

                    if (filaEstatica && nuevoPunto) {
                        // Buscar el valor hpiez en el primer módulo
                        const hpiezEncontrado = this.buscarHpiezPorPunto(grado, nuevoPunto);

                        if (hpiezEncontrado !== null) {
                            // Actualizar la fila estática
                            filaEstatica.cota = hpiezEncontrado;
                            filaEstatica.hpiez = hpiezEncontrado;

                            // Actualizar en Tabulator
                            const tabulatorKey = `${grado}-${moduloId}`;
                            const tabulatorInstance = this.tabulators[tabulatorKey];
                            if (tabulatorInstance) {
                                const filaTabulator = tabulatorInstance.getRows().find(row =>
                                    row.getData().id === filaId
                                );
                                if (filaTabulator) {
                                    filaTabulator.update({
                                        cota: hpiezEncontrado,
                                        hpiez: hpiezEncontrado
                                    });
                                }
                            }
                        }
                    }
                }
            },
            obtenerIndiceModulo(grado, moduloId) {
                if (!this.tables[grado]?.modules) return -1;
                return this.tables[grado].modules.findIndex(modulo => modulo.id === moduloId);
            },
            crearModulo(grado) {
                const count = (this.tables[grado]?.modules?.length || 0) + 1;
                const nombre = `CALCULO DE LA RED DE DISTRIBUCION ${count} (MAS DESFAVORABLE LAVATORIO) CIRCUITO ${count} - ${grado.toUpperCase()}`;

                let staticRow = {
                    id: `static-${Date.now()}-${Math.random()}`, // ID único para cada fila estática
                    isStatic: true,
                    segmento: 'TE',
                    punto: '',
                    cota: count === 1 ? this.nivelasumfondotanqueelevado : 0,
                    uh_parcial: '',
                    uh_total: '',
                    caudal: '',
                    longitud: '',
                    diametro: '',
                    n1: '',
                    codo90: '',
                    n2: '',
                    tee: '',
                    n3: '',
                    val_compuerta: '',
                    n4: '',
                    reduccion2: '',
                    longitudtotal: '',
                    coefrug: count === 1 ? 0 : '', // Solo el primer módulo tiene coefrug = 0
                    s: 0,
                    hf: 0,
                    hpiez: count === 1 ? this.nivelasumfondotanqueelevado : 0,
                    velocidad: 0,
                    presion: 0,
                    verificacion1: '',
                    verificacion2: ''
                };

                return {
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    nombre,
                    data: [staticRow, this.crearFilaVacia()]
                };
            },
            sendredDistribucionUpdate() {
                // Validar y preparar configuración base
                const config = {
                    npisoterminado: this.config?.npisoterminado ?? 0,
                    altasumfondotanqueelevado: this.config?.altasumfondotanqueelevado ?? 0,
                };

                const nivelasumfondotanqueelevado = +(
                    config.npisoterminado + config.altasumfondotanqueelevado
                ).toFixed(3);

                // Preparar las tablas
                const tablas = {};
                Object.keys(this.tables).forEach(grado => {
                    tablas[grado] = this.tables[grado].modules.map(modulo => {
                        const key = `${grado}-${modulo.id}`;
                        const tabulator = this.tabulators[key];
                        return {
                            nombre: modulo.nombre,
                            data: Array.isArray(tabulator?.getData?.())
                                ? tabulator.getData()
                                : (modulo.data || [])
                        };
                    });
                });

                // Enviar todo el paquete de datos
                const payload = {
                    config,
                    nivelasumfondotanqueelevado,
                    tablas
                };

                console.log("Payload enviado:", payload);

                document.dispatchEvent(new CustomEvent('red-alimentacion-updated', {
                    detail: payload
                }));
            },
            // Función para configurar escuchas de cambios en hpiez del primer módulo
            configurarEscuchasCambiosPrimerModulo(grado) {
                const primerModulo = this.tables[grado]?.modules?.[0];
                if (!primerModulo) return;

                const tabulatorKey = `${grado}-${primerModulo.id}`;
                const tabulatorInstance = this.tabulators[tabulatorKey];

                if (!tabulatorInstance) return;

                // Remover escuchas previas para evitar duplicados
                tabulatorInstance.off("cellEdited");
                tabulatorInstance.off("dataChanged");

                // Escuchar cambios en cualquier celda del primer módulo
                tabulatorInstance.on("cellEdited", (cell) => {
                    const field = cell.getField();
                    const rowData = cell.getRow().getData();

                    // Si cambió hpiez o cualquier campo que pueda afectar hpiez
                    if (['hpiez', 'coefrug', 'hf', 's', 'punto'].includes(field)) {
                        // Sincronizar después de un pequeño delay para permitir que se complete la actualización
                        setTimeout(() => {
                            this.sincronizarModulosConPunto(grado, rowData.punto, rowData.hpiez);
                        }, 50);
                    }
                });

                // Escuchar cuando se recalculan los resultados (importante para cálculos automáticos)
                tabulatorInstance.on("dataChanged", () => {
                    setTimeout(() => {
                        this.sincronizarTodosLosModulos(grado);
                    }, 100);
                });
            },
            // Función para sincronizar todos los módulos que dependan de un punto específico
            sincronizarModulosConPunto(grado, punto, nuevoHpiez) {
                if (!punto || nuevoHpiez === undefined || nuevoHpiez === null) return;

                const hpiezValue = parseFloat(nuevoHpiez) || 0;

                // Recorrer todos los módulos excepto el primero
                this.tables[grado]?.modules?.forEach((modulo, index) => {
                    if (index === 0) return; // Saltar el primer módulo

                    // Buscar fila estática en los datos del módulo
                    const filaEstatica = modulo.data.find(fila => fila.isStatic);
                    if (!filaEstatica) return;

                    // Verificar si el punto de la fila estática coincide (case-insensitive)
                    if (filaEstatica.punto &&
                        filaEstatica.punto.toString().toLowerCase().trim() === punto.toString().toLowerCase().trim()) {

                        // Actualizar los valores en los datos del módulo
                        filaEstatica.cota = hpiezValue;
                        filaEstatica.hpiez = hpiezValue;

                        // Actualizar en Tabulator si existe
                        const tabulatorKey = `${grado}-${modulo.id}`;
                        const tabulatorInstance = this.tabulators[tabulatorKey];
                        if (tabulatorInstance) {
                            const filaTabulator = tabulatorInstance.getRows().find(row =>
                                row.getData().id === filaEstatica.id
                            );
                            if (filaTabulator) {
                                filaTabulator.update({
                                    cota: hpiezValue,
                                    hpiez: hpiezValue
                                });
                            }
                        }
                    }
                });
            },
            // Función para sincronizar todos los módulos
            sincronizarTodosLosModulos(grado) {
                const primerModulo = this.tables[grado]?.modules?.[0];
                if (!primerModulo || !Array.isArray(primerModulo.data)) return;

                // Para cada fila del primer módulo, sincronizar con módulos dependientes
                primerModulo.data.forEach(fila => {
                    if (fila.punto && fila.hpiez !== undefined) {
                        this.sincronizarModulosConPunto(grado, fila.punto, fila.hpiez);
                    }
                });
            },
            
            getColumns(grado, moduloId) {
                const editable = this.mode === 'edit';
                const moduloIndex = this.obtenerIndiceModulo(grado, moduloId);
                const diametro = [
                    { label: '1/2 pulg', value: 0.5 },
                    { label: '3/4 pulg', value: 0.75 },
                    { label: '1 pulg', value: 1 },
                    { label: '1 1/4 pulg', value: 1.25 },
                    { label: '1 1/2 pulg', value: 1.5 },
                    { label: '2 pulg', value: 2 },
                    { label: '2 1/2 pulg', value: 2.5 },
                    { label: '3 pulg', value: 3 },
                    { label: '4 pulg', value: 4 },
                    { label: '6 pulg', value: 6 },
                    { label: '8 pulg', value: 8 },
                ];

                const columns = [
                    // Columnas principales
                    {
                        title: 'Segmento',
                        field: 'segmento',
                        editor: editable ? 'input' : false,
                        headerVertical: true,
                        cellEdited: function (cell) {
                            const row = cell.getRow();
                            const value = cell.getValue();

                            if (typeof value === 'string' && value.includes('-')) {
                                const partes = value.split('-');
                                const segundoPunto = partes[1]?.trim();

                                if (segundoPunto) {
                                    row.update({ punto: segundoPunto });

                                    // Si es fila estática y no es el primer módulo, buscar y actualizar
                                    const rowData = row.getData();
                                    const currentModuloIndex = this.obtenerIndiceModulo(grado, moduloId);
                                    if (rowData.isStatic && currentModuloIndex > 0) {
                                        this.actualizarFilaEstaticaPorPunto(grado, currentModuloIndex, segundoPunto);
                                    }
                                }
                            }

                            if (editable && typeof this.sendredDistribucionUpdate === 'function') {
                                this.sendredDistribucionUpdate();
                            }
                        }.bind(this)
                    },

                    // Columna Punto MEJORADA
                    {
                        title: 'Punto',
                        field: 'punto',
                        editor: editable ? 'input' : false,
                        headerVertical: true,
                        cellEdited: editable ? function (cell) {
                            const rowData = cell.getRow().getData();
                            const nuevoPunto = cell.getValue();

                            // Usar la nueva función para manejar el cambio
                            this.manejarCambioPunto(grado, moduloId, nuevoPunto, rowData.id);

                            if (typeof this.sendredDistribucionUpdate === 'function') {
                                this.sendredDistribucionUpdate();
                            }
                        }.bind(this) : undefined
                    },
                    {
                        title: 'Cota',
                        field: 'cota',
                        editor: editable ? this.customFormulaEditor : false,
                        formatter: this.formulaFormatter,
                        headerVertical: true,
                        cellEdited: editable ? () => { this.sendredDistribucionUpdate(); } : undefined
                    },

                    // Grupo U.H.
                    {
                        title: 'U.H.',
                        columns: [
                            {
                                title: 'Parcial',
                                field: 'uh_parcial',
                                editor: editable ? 'input' : false,
                                headerVertical: true,
                                cellEdited: (cell) => {
                                    this.actualizarResultados();
                                }
                            },
                            {
                                title: 'Total',
                                field: 'uh_total',
                                headerVertical: true,
                            }
                        ]
                    },

                    {
                        title: 'Caudal (l/s)',
                        field: 'caudal',
                        //editor: editable ? 'input' : false,
                        headerVertical: true,
                    },
                    {
                        title: 'Longitud (m)',
                        field: 'longitud',
                        editor: editable ? 'input' : false,
                        headerVertical: true,
                        cellEdited: editable ? (cell) => {
                            this.actualizarLongitudTotal(cell.getRow());
                            this.sendredDistribucionUpdate();
                        } : undefined
                    },
                    {
                        title: 'Diámetro plg',
                        field: 'diametro',
                        editor: editable ? "list" : false,
                        editorParams: editable ? {
                            values: diametro.reduce((acc, item) => {
                                acc[item.label] = item.label;
                                return acc;
                            }, {}),
                            autocomplete: true,
                            listOnEmpty: true
                        } : {},
                        headerVertical: true,
                        cellEdited: editable ? (cell) => {
                            const row = cell.getRow();
                            const data = row.getData();
                            this.actualizarAccesoriosPorDiametro(row, data.diametro);
                            this.sendredDistribucionUpdate();
                        } : undefined
                    },

                    // Grupo Longitud Equivalente
                    {
                        title: 'Longitud Equivalente (m)',
                        columns: [
                            {
                                title: 'N°',
                                field: 'n1',
                                editor: editable ? 'input' : false,
                                headerVertical: true,
                                cellEdited: editable ? (cell) => {
                                    this.actualizarLongitudTotal(cell.getRow());
                                    this.sendredDistribucionUpdate();
                                } : undefined
                            },
                            {
                                title: '',
                                field: 'codo90',
                                hozAlign: "center",
                                width: 95,
                                editor: editable ? "input" : false,
                                headerFilter: editable ? this.crearHeaderFilter('codo90', 'codo90') : false,
                                headerSort: false,
                                headerVertical: true,
                                titleFormatter: !editable ? () => {
                                    // Mostrar el nombre del accesorio seleccionado en modo vista
                                    const map = {
                                        codo90: 'Codo 90°',
                                        codo45: 'Codo 45°',
                                        tee: 'Tee',
                                        valCompuerta: 'Val. Compuerta',
                                        valCheck: 'Val. Check',
                                        canastilla: 'Canastilla',
                                        reduccion1: 'Reducción 1 (d a D)',
                                        reduccion2: 'Reducción 2 (D a d)'
                                    };
                                    return map[this.accesoriosConfig?.codo90] || 'Accesorio';
                                } : undefined
                            },
                            {
                                title: 'N°',
                                field: 'n2',
                                editor: editable ? 'input' : false,
                                headerVertical: true,
                                cellEdited: editable ? (cell) => {
                                    this.actualizarLongitudTotal(cell.getRow());
                                    this.sendredDistribucionUpdate();
                                } : undefined
                            },
                            {
                                title: '',
                                field: 'tee',
                                hozAlign: "center",
                                width: 95,
                                editor: editable ? "input" : false,
                                headerFilter: editable ? this.crearHeaderFilter('tee', 'tee') : false,
                                headerSort: false,
                                headerVertical: true,
                                titleFormatter: !editable ? () => {
                                    const map = {
                                        codo90: 'Codo 90°',
                                        codo45: 'Codo 45°',
                                        tee: 'Tee',
                                        valCompuerta: 'Val. Compuerta',
                                        valCheck: 'Val. Check',
                                        canastilla: 'Canastilla',
                                        reduccion1: 'Reducción 1 (d a D)',
                                        reduccion2: 'Reducción 2 (D a d)'
                                    };
                                    return map[this.accesoriosConfig?.tee] || 'Accesorio';
                                } : undefined
                            },
                            {
                                title: 'N°',
                                field: 'n3',
                                editor: editable ? 'input' : false,
                                headerVertical: true,
                                cellEdited: editable ? (cell) => {
                                    this.actualizarLongitudTotal(cell.getRow());
                                    this.sendredDistribucionUpdate();
                                } : undefined
                            },
                            {
                                title: '',
                                field: 'val_compuerta',
                                hozAlign: "center",
                                width: 95,
                                editor: editable ? "input" : false,
                                headerFilter: editable ? this.crearHeaderFilter('val_compuerta', 'valCompuerta') : false,
                                headerFilterLiveFilter: false,
                                headerSort: false,
                                headerVertical: true,
                                titleFormatter: !editable ? () => {
                                    const map = {
                                        codo90: 'Codo 90°',
                                        codo45: 'Codo 45°',
                                        tee: 'Tee',
                                        valCompuerta: 'Val. Compuerta',
                                        valCheck: 'Val. Check',
                                        canastilla: 'Canastilla',
                                        reduccion1: 'Reducción 1 (d a D)',
                                        reduccion2: 'Reducción 2 (D a d)'
                                    };
                                    return map[this.accesoriosConfig?.val_compuerta] || 'Accesorio';
                                } : undefined
                            },
                            {
                                title: 'N°',
                                field: 'n4',
                                editor: editable ? 'input' : false,
                                headerVertical: true,
                                cellEdited: editable ? (cell) => {
                                    this.actualizarLongitudTotal(cell.getRow());
                                    this.sendredDistribucionUpdate();
                                } : undefined
                            },
                            {
                                title: '',
                                field: 'reduccion2',
                                hozAlign: "center",
                                width: 95,
                                editor: editable ? 'input' : false,
                                headerFilter: editable ? this.crearHeaderFilter('reduccion2', 'reduccion2') : false,
                                headerSort: false,
                                headerVertical: true,
                                titleFormatter: !editable ? () => {
                                    const map = {
                                        codo90: 'Codo 90°',
                                        codo45: 'Codo 45°',
                                        tee: 'Tee',
                                        valCompuerta: 'Val. Compuerta',
                                        valCheck: 'Val. Check',
                                        canastilla: 'Canastilla',
                                        reduccion1: 'Reducción 1 (d a D)',
                                        reduccion2: 'Reducción 2 (D a d)'
                                    };
                                    return map[this.accesoriosConfig?.reduccion2] || 'Accesorio';
                                } : undefined
                            }
                        ]
                    },

                    // Columnas individuales adicionales
                    {
                        title: 'Longitud Total (m)',
                        field: 'longitudtotal',
                        editor: false, // No editable porque se calcula automáticamente
                        headerVertical: true,
                        formatter: (cell) => {
                            const value = cell.getValue();
                            return typeof value === 'number' ? value.toFixed(2) : value;
                        }
                    },
                    {
                        title: 'Coef. Rug.H-W',
                        field: 'coefrug',
                        editor: editable ? 'input' : false,
                        headerVertical: true,
                        cellEdited: (cell) => {
                            const table = cell.getTable();
                            const rows = table.getRows();

                            const nivelInicial = this.nivelasumfondotanqueelevado;

                            const sanitize = (val, dec = 2) => {
                                const num = Number(val);
                                return isFinite(num) && !isNaN(num) ? parseFloat(num.toFixed(dec)) : 0;
                            };

                            const resultadosParciales = [];

                            // FASE 1: calcular hf, s, velocidad, presion sin hpiez aún
                            rows.forEach((row) => {
                                const data = row.getData();

                                const cota = parseFloat(data.cota);
                                const caudal = parseFloat(data.caudal);
                                const coefrug = parseFloat(data.coefrug);
                                const longitudtotal = parseFloat(data.longitudtotal);
                                const diametroLabel = data.diametro;

                                const diametroItem = diametro.find(d => d.label === diametroLabel);
                                const diametroValor = diametroItem ? diametroItem.value : 0;
                                const diametroMetros = diametroValor * 2.54 / 100;

                                const sRaw = Math.pow(
                                    (caudal / 1000) / 0.2785 / coefrug / Math.pow(diametroMetros, 2.63),
                                    1.85
                                );
                                const s = sanitize(sRaw, 4);
                                const hf = sanitize(longitudtotal * s);

                                const area = Math.PI * Math.pow(diametroMetros, 2) / 4;
                                const velocidad = sanitize((caudal / 1000) / area);

                                resultadosParciales.push({
                                    row,
                                    cota,
                                    s,
                                    hf,
                                    velocidad,
                                    presion: 0,   // temporal
                                    hpiez: 0      // temporal
                                });
                            });

                            // FASE 2: calcular hpiez y presion en forma cruzada
                            let hpiezAnterior = sanitize(nivelInicial);

                            resultadosParciales.forEach((r, i) => {
                                r.hpiez = hpiezAnterior;
                                const nuevoHpiez = sanitize(hpiezAnterior - r.hf);
                                hpiezAnterior = nuevoHpiez;

                                r.presion = sanitize(r.hpiez - r.cota);

                                const verificacion1 = r.velocidad === 0 ? "" : (r.velocidad >= 0.6 && r.velocidad <= 3 ? "cumple" : "no cumple");
                                const verificacion2 = r.presion === 0 ? "" : (r.presion >= 2 ? "cumple" : "no cumple");

                                // Actualiza la fila
                                r.row.update({
                                    s: r.s,
                                    hf: r.hf,
                                    velocidad: r.velocidad,
                                    hpiez: r.hpiez,
                                    presion: r.presion,
                                    verificacion1: verificacion1,
                                    verificacion2: verificacion2,
                                });
                            });
                        }
                    },
                    {
                        title: 'S(m/m)',
                        field: 's',
                        //editor: editable ? 'input' : false,
                        headerVertical: true
                    },
                    {
                        title: 'Hf(m)',
                        field: 'hf',
                        //editor: editable ? 'input' : false,
                        headerVertical: true
                    },
                    {
                        title: 'H. Piez. (m)',
                        field: 'hpiez',
                        //editor: editable ? 'input' : false,
                        headerVertical: true
                    },
                    {
                        title: 'Velocidad(m/s)',
                        field: 'velocidad',
                        //editor: editable ? 'input' : false,
                        headerVertical: true
                    },
                    {
                        title: 'Presión (mca)',
                        field: 'presion',
                        //editor: editable ? 'input' : false,
                        headerVertical: true
                    },
                    {
                        title: 'VERIFICACIONES',
                        columns: [
                            {
                                title: '0.60<V< Adm?',
                                field: 'verificacion1',
                                //editor: editable ? 'input' : false,
                                headerVertical: true,
                                formatter: function (cell) {
                                    const value = cell.getValue();

                                    // Retorna el valor con estilos según el estado
                                    if (value === 'cumple') {
                                        return `<span style="color: green; font-weight: bold;">${value}</span>`;
                                    } else if (value === 'no cumple') {
                                        return `<span style="color: red; font-weight: bold;">${value}</span>`;
                                    } else {
                                        return '';
                                    }
                                },
                            },
                            {
                                title: 'P>2mca?',
                                field: 'verificacion2',
                                //editor: editable ? 'input' : false,
                                headerVertical: true,
                                formatter: function (cell) {
                                    const value = cell.getValue();

                                    // Retorna el valor con estilos según el estado
                                    if (value === 'cumple') {
                                        return `<span style="color: green; font-weight: bold;">${value}</span>`;
                                    } else if (value === 'no cumple') {
                                        return `<span style="color: red; font-weight: bold;">${value}</span>`;
                                    } else {
                                        return '';
                                    }
                                },
                            },
                        ]
                    },
                ];

                // Agregar columna de acciones solo en modo edición
                if (editable) {
                    columns.push({
                        title: '',
                        field: 'actions',
                        hozAlign: 'center',
                        headerSort: false,
                        formatter: (cell) => {
                            return `<button class='tabulator-btn-delete-row text-red-600 hover:text-red-800 p-1' title='Eliminar fila'>
                                <i class='fas fa-trash text-sm'></i>
                            </button>`;
                        },
                        cellClick: (e, cell) => {
                            const rowData = cell.getRow().getData();
                            this.removeRow(grado, moduloId, rowData.id);
                        }
                    });
                }
                return columns;
            },
            // Función auxiliar para obtener el índice del módulo
            obtenerIndiceModulo(grado, moduloId) {
                if (!this.tables[grado]?.modules) return -1;

                return this.tables[grado].modules.findIndex(modulo => modulo.id === moduloId);
            },
            // Función para inicializar las escuchas cuando se crea una tabla
            inicializarEscuchasTabla(grado, moduloId) {
                const moduloIndex = this.obtenerIndiceModulo(grado, moduloId);

                // Si es el primer módulo, configurar escuchas especiales
                if (moduloIndex === 0) {
                    // Usar setTimeout para asegurar que Tabulator esté completamente inicializado
                    setTimeout(() => {
                        this.configurarEscuchasCambiosPrimerModulo(grado);
                    }, 200); // Aumentar el timeout para mayor seguridad
                }
            },
            // Función que debes llamar después de que se actualicen los resultados en el primer módulo
            actualizarResultados() {
                const totalUDPorGrado = {};
                Object.entries(this.grades).filter(([g, a]) => a).forEach(([grado]) => {
                    totalUDPorGrado[grado] = this.totals?.totalUDPorGrado?.[grado] || 0;
                });

                const uhTotalExterioresPorGrado = {};
                Object.entries(this.grades).filter(([g, a]) => a).forEach(([grado]) => {
                    const entradaExterior = Object.values(this.exterioresData || {}).find(ext =>
                        ext.nombre?.toLowerCase().includes(grado.toLowerCase())
                    );
                    uhTotalExterioresPorGrado[grado] = entradaExterior ?
                        +((entradaExterior.uhTotal ?? (entradaExterior.salidasRiego * entradaExterior.uh)) || 0) : 0;
                });

                Object.entries(this.tabulators).forEach(([key, tabulatorInstance]) => {
                    if (!tabulatorInstance) return;

                    const [grado, moduloIndexStr] = key.split('-');
                    const moduloIndex = parseInt(moduloIndexStr);

                    if (!this.grades[grado]) return;

                    let data = tabulatorInstance.getData();
                    if (!Array.isArray(data) || data.length === 0) return;

                    const sumaInicialGrado = (totalUDPorGrado[grado] || 0) + (uhTotalExterioresPorGrado[grado] || 0);

                    data.forEach((row, index, allRows) => {
                        let uhTotalCalculado = 0;
                        if (index === 0) {
                            uhTotalCalculado = sumaInicialGrado;
                        } else {
                            const uhParcialActual = parseFloat(row.uh_parcial) || 0;
                            const uhTotalAnterior = parseFloat(allRows[index - 1].uh_total) || 0;
                            uhTotalCalculado = uhTotalAnterior - uhParcialActual;
                        }

                        row.uh_total = +uhTotalCalculado.toFixed(3);
                        const caudal = this.getTankFlow(uhTotalCalculado);
                        row.caudal = (caudal !== null && caudal !== undefined) ? +caudal.toFixed(3) : 0;
                    });

                    tabulatorInstance.replaceData(data);

                    // Si es el primer módulo, sincronizar con otros módulos
                    if (moduloIndex === 0) {
                        setTimeout(() => {
                            this.sincronizarTodosLosModulos(grado);
                        }, 50);
                    }
                });

                this.sendredDistribucionUpdate();
            },
            sendredDistribucionUpdate() {
                // Validar y preparar configuración base
                const config = {
                    npisoterminado: this.config?.npisoterminado ?? 0,
                    altasumfondotanqueelevado: this.config?.altasumfondotanqueelevado ?? 0,
                };

                const nivelasumfondotanqueelevado = +(
                    config.npisoterminado + config.altasumfondotanqueelevado
                ).toFixed(3);

                // Preparar las tablas
                const tablas = {};
                Object.keys(this.tables).forEach(grado => {
                    tablas[grado] = this.tables[grado].modules.map(modulo => {
                        const key = `${grado}-${modulo.id}`;
                        const tabulator = this.tabulators[key];
                        return {
                            nombre: modulo.nombre,
                            data: Array.isArray(tabulator?.getData?.())
                                ? tabulator.getData()
                                : (modulo.data || [])
                        };
                    });
                });

                // Enviar todo el paquete de datos
                const payload = {
                    config,
                    nivelasumfondotanqueelevado,
                    tablas
                };

                console.log("Payload enviado:", payload);

                document.dispatchEvent(new CustomEvent('red-alimentacion-updated', {
                    detail: payload
                }));
            }
        },
        mounted() {
            this.configurarEventos();
            for (const grado in this.tables) {
                if (this.grades[grado]) {
                    this.tables[grado].expanded = true;
                    break;
                }
            }
            this.$nextTick(() => {
                Object.keys(this.tables).forEach(grado => {
                    if (this.grades[grado] && this.tables[grado].modules.length === 0) {
                        const modulo = this.crearModulo(grado);
                        this.tables[grado].modules.push(modulo);
                        this.$nextTick(() => {
                            this.initTabulator(grado, modulo.id, modulo.data);
                            this.sendredDistribucionUpdate(); // Enviar datos tras inicializar la tabla
                        });
                    }
                });
                // Enviar datos por defecto tras inicialización
                this.sendredDistribucionUpdate();
            });
        }
    };

    createApp(RedDistribucionComponent).mount(redDistribucion);
}