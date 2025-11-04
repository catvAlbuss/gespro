import longEquival from "./longitud-components.js";
import UHData from "./uh-componets.js";
import { createApp, ref, computed, onMounted, nextTick } from 'vue'; // Asumiendo que Vue 3 está disponible

export function initRedesInterioresModule() {
    const redesInteriores = document.getElementById('redes-interiores-grades-content');
    if (!redesInteriores) {
        console.error('Contenedor Red de Distribucion no encontrado');
        return;
    }

    // Crear la app Vue
    const app = createApp({
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
                                    <h1 class="text-2xl font-bold text-slate-800">7. CALCULO DE LA REDES INTERIORES</h1>
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
                    <div v-for="(table, grado) in tables" :key="grado" v-show="grades[grado]" class="bg-white/90 rounded-xl shadow-lg border border-slate-200/60 mb-6 overflow-hidden">
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
                            <div v-for="(modulo, idx) in table.modules" :key="modulo.id" class="mb-8 border border-slate-200 rounded-xl shadow-inner bg-slate-50">
                                <div class="flex items-center justify-between px-4 py-2 bg-blue-100 rounded-t-xl">
                                    <div class="flex items-center space-x-2">
                                        <i class="fas fa-cube text-blue-700"></i>
                                        <input v-if="mode === 'edit'" type="text" v-model="modulo.nombre" class="font-semibold text-blue-800 bg-white border border-blue-300 rounded px-2 py-1 text-sm w-full max-w-xl" />
                                        <span v-else class="font-semibold text-blue-800" v-text="modulo.nombre"></span>
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
                        </div>
                    </div>
                </main>
            </div>
        `,
        setup() {
            const mode = ref('view');
            const config = ref({
                npisoterminado: 0.65,
                altasumfondotanqueelevado: 13.85,
            });
            const nivelasumfondotanqueelevado = computed(() => {
                return +(config.value.npisoterminado + config.value.altasumfondotanqueelevado).toFixed(3);
            });
            const grades = ref({
                inicial: true,
                primaria: false,
                secundaria: false
            });
            const tables = ref({
                inicial: { modules: [], expanded: true },
                primaria: { modules: [], expanded: false },
                secundaria: { modules: [], expanded: false }
            });
            const tabulators = ref({});
            const accesoriosConfig = ref({
                codo90: 'codo90',
                tee: 'tee',
                val_compuerta: 'valCompuerta',
                reduccion2: 'reduccion2'
            });
            const resultados = ref({
                grados: {},
                exteriores: {}
            });
            const totals = ref({ totalUDPorGrado: {} });
            const exterioresData = ref({});
            const redAlimentacionData = ref({});

            const updateConfigAndNotify = () => {
                sendredInterioresUpdate();
            };

            const toggleMode = () => {
                // Guardar datos actuales de cada tabla antes de destruirlas
                Object.keys(tables.value).forEach(grado => {
                    tables.value[grado].modules.forEach(modulo => {
                        const tabKey = `${grado}-${modulo.id}`;
                        if (tabulators.value[tabKey]) {
                            try {
                                modulo.data = tabulators.value[tabKey].getData();
                            } catch (e) {
                                console.error(`Error guardando datos de tabla ${tabKey}:`, e);
                            }
                            tabulators.value[tabKey].destroy();
                            delete tabulators.value[tabKey];
                        }
                    });
                });
                mode.value = mode.value === 'edit' ? 'view' : 'edit';
                nextTick(() => {
                    Object.keys(tables.value).forEach(grado => {
                        tables.value[grado].modules.forEach(modulo => {
                            initTabulator(grado, modulo.id, modulo.data);
                        });
                    });
                });
            };

            const configurarEventos = () => {
                document.addEventListener('maxima-demanda-simultanea-updated', (event) => {
                    if (!event.detail || !event.detail.grades) return;
                    const prevGrades = { ...grades.value };
                    const newGrades = { ...(event.detail.grades || {}) };
                    // Eliminar módulos de grados desactivados
                    Object.keys(prevGrades).forEach(grado => {
                        if (prevGrades[grado] && !newGrades[grado]) {
                            tables.value[grado].modules.forEach(m => {
                                const tabKey = `${grado}-${m.id}`;
                                if (tabulators.value[tabKey]) {
                                    tabulators.value[tabKey].destroy();
                                    delete tabulators.value[tabKey];
                                }
                            });
                            tables.value[grado].modules = [];
                            tables.value[grado].expanded = false;
                        }
                    });
                    // Agregar módulos solo a grados recién activados
                    Object.keys(newGrades).forEach(grado => {
                        if (newGrades[grado] && tables.value[grado].modules.length === 0) {
                            const modulo = crearModulo(grado);
                            tables.value[grado].modules.push(modulo);
                            tables.value[grado].expanded = true;
                            nextTick(() => {
                                initTabulator(grado, modulo.id, modulo.data);
                            });
                        }
                    });
                    grades.value = newGrades;
                    exterioresData.value = JSON.parse(JSON.stringify(event.detail.exterioresData || {}));
                    totals.value = event.detail.totals || { totalUDPorGrado: {} };
                    actualizarResultados();
                });

                document.addEventListener('red-alimentacion-updated', (event) => {
                    if (!event.detail || !event.detail.tablas) return;
                    console.log("Datos recibidos de red de alimentación:", event.detail);
                    redAlimentacionData.value = JSON.parse(JSON.stringify(event.detail.tablas || {}));
                    sincronizarConRedAlimentacion();
                });
            };

            const sincronizarConRedAlimentacion = () => {
                if (!redAlimentacionData.value || Object.keys(redAlimentacionData.value).length === 0) {
                    console.log("No hay datos de red de alimentación para sincronizar");
                    return;
                }
                Object.keys(grades.value).forEach(grado => {
                    if (!grades.value[grado]) return;
                    tables.value[grado]?.modules?.forEach((modulo, moduloIndex) => {
                        if (Array.isArray(modulo.data)) {
                            modulo.data.forEach(fila => {
                                if (fila.isStatic && fila.punto) {
                                    const hpiezEncontrado = buscarHpiezEnRedAlimentacion(grado, fila.punto);
                                    if (hpiezEncontrado !== null) {
                                        fila.cota = hpiezEncontrado;
                                        fila.hpiez = hpiezEncontrado;
                                        const tabulatorKey = `${grado}-${modulo.id}`;
                                        const tabulatorInstance = tabulators.value[tabulatorKey];
                                        if (tabulatorInstance) {
                                            const filaTabulator = tabulatorInstance.getRows().find(row =>
                                                row.getData().id === fila.id
                                            );
                                            if (filaTabulator) {
                                                filaTabulator.update({
                                                    cota: hpiezEncontrado,
                                                    hpiez: hpiezEncontrado
                                                });
                                            }
                                        }
                                        console.log(`Sincronizado ${grado} - Punto: ${fila.punto} - Hpiez: ${hpiezEncontrado}`);
                                    }
                                }
                            });
                        }
                    });
                });
                sendredInterioresUpdate();
            };

            const buscarHpiezEnRedAlimentacion = (grado, puntoABuscar) => {
                if (!puntoABuscar || !redAlimentacionData.value[grado]) {
                    return null;
                }
                console.log(`Buscando punto "${puntoABuscar}" en grado "${grado}"`);
                console.log("Datos disponibles:", redAlimentacionData.value[grado]);
                for (let tabla of redAlimentacionData.value[grado]) {
                    if (!Array.isArray(tabla.data)) continue;
                    const filaEncontrada = tabla.data.find(fila => {
                        if (!fila.punto) return false;
                        const puntoComparar = fila.punto.toString().toLowerCase().trim();
                        const puntoBuscado = puntoABuscar.toString().toLowerCase().trim();
                        return puntoComparar === puntoBuscado;
                    });
                    if (filaEncontrada) {
                        const hpiezValue = parseFloat(filaEncontrada.hpiez) || 0;
                        console.log(`Punto encontrado: ${puntoABuscar} - Hpiez: ${hpiezValue}`);
                        return hpiezValue;
                    }
                }
                console.log(`Punto "${puntoABuscar}" no encontrado en grado "${grado}"`);
                return null;
            };

            const addModulo = (grado) => {
                const modulo = crearModulo(grado);
                tables.value[grado].modules.push(modulo);
                nextTick(() => {
                    initTabulator(grado, modulo.id, modulo.data);
                    sendredInterioresUpdate();
                });
            };

            const removeModulo = (grado, moduloId) => {
                tables.value[grado].modules = tables.value[grado].modules.filter(m => m.id !== moduloId);
                const tabKey = `${grado}-${moduloId}`;
                if (tabulators.value[tabKey]) {
                    tabulators.value[tabKey].destroy();
                    delete tabulators.value[tabKey];
                }
                sendredInterioresUpdate();
            };

            const addRow = (grado, moduloId) => {
                const tab = tabulators.value[`${grado}-${moduloId}`];
                if (tab) {
                    const newRow = crearFilaVacia();
                    tab.addRow(newRow);
                    sendredInterioresUpdate();
                }
            };

            const removeRow = (grado, moduloId, rowId) => {
                const tab = tabulators.value[`${grado}-${moduloId}`];
                if (tab) {
                    tab.deleteRow(rowId);
                    sendredInterioresUpdate();
                }
            };

            const crearFilaVacia = () => {
                return {
                    id: Date.now() + Math.random(),
                    segmento: 'TE', punto: 'TE', cota: 14.5, uh_parcial: '', uh_total: 259, caudal: 2.9, longitud: 15.5, diametro: '2 1/2 pulg',
                    n1: 2, codo90: 2.577, n2: 1, tee: 0, n3: 1, val_compuerta: 0, n4: 1, reduccion2: 0, longitudtotal: 0, coefrug: 150, s: 0, hf: 0, hpiez: 0, velocidad: 0, presion: 0, verificacion1: 'NO', verificacion2: 'NO'
                };
            };

            const calcularLongitudTotal = (rowData) => {
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
            };

            const actualizarAccesoriosPorDiametro = (row, diametro) => {
                const data = row.getData();
                const updates = {};
                Object.keys(accesoriosConfig.value).forEach(field => {
                    const accesorioTipo = accesoriosConfig.value[field];
                    updates[field] = obtenerLongitudEquivalente(accesorioTipo, diametro);
                });
                const newData = { ...data, ...updates };
                updates.longitudtotal = calcularLongitudTotal(newData);
                row.update(updates);
            };

            const actualizarLongitudTotal = (row) => {
                const data = row.getData();
                row.update({ longitudtotal: calcularLongitudTotal(data) });
            };

            const obtenerLongitudEquivalente = (accesorioTipo, diametro) => {
                if (longEquival && longEquival[accesorioTipo]) {
                    return longEquival[accesorioTipo][diametro] || 0;
                }
                const valoresEjemplo = {
                    'codo90': { '2 1/2 pulg': 2.577 },
                    'tee': { '2 1/2 pulg': 7.62 },
                    'valCompuerta': { '2 1/2 pulg': 0.69 },
                    'reduccion2': { '2 1/2 pulg': 1.91 }
                };
                return valoresEjemplo[accesorioTipo]?.[diametro] || 0;
            };

            const getTankFlow = (units) => {
                const target = Number(units);
                if (isNaN(target)) return null;
                if (UHData) {
                    const entry = UHData.find(item => Number(item.units) === target);
                    return entry ? entry.tankFlow : null;
                }
                const ejemploUH = { 100: 1.5, 200: 2.5, 259: 2.9, 300: 3.2, 400: 4.1, 500: 5.0 };
                return ejemploUH[target] || null;
            };

            const crearHeaderFilter = (fieldName, defaultValue) => {
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
                        accesoriosConfig.value[fieldName] = valor;
                        const tabla = cell.getTable();
                        tabla.getRows().forEach(row => {
                            const data = row.getData();
                            const diametro = data.diametro;
                            const leq = obtenerLongitudEquivalente(valor, diametro);
                            const updates = { [fieldName]: leq };
                            const newData = { ...data, ...updates };
                            updates.longitudtotal = calcularLongitudTotal(newData);
                            row.update(updates);
                        });
                    });
                    return el;
                };
            };

            const initTabulator = (grado, moduloId, data = []) => {
                const tableId = `#tabulator-table-${grado}-${moduloId}`;
                const tableElement = document.querySelector(tableId);
                if (!tableElement) {
                    setTimeout(() => { initTabulator(grado, moduloId, data); }, 100);
                    return;
                }
                if (data.length === 0) data = [crearFilaVacia()];
                const columns = getColumns(grado, moduloId);
                try {
                    const tab = new Tabulator(tableId, {
                        data: data,
                        columns: columns,
                        layout: 'fitDataStretch',
                        movableRows: mode.value === 'edit',
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
                    tabulators.value[`${grado}-${moduloId}`] = tab;
                    setTimeout(() => {
                        inicializarEscuchasTabla(grado, moduloId);
                    }, 100);
                } catch (error) {
                    console.error(`Error inicializando Tabulator para ${tableId}:`, error);
                }
            };

            const customFormulaEditor = (cell, onRendered, success, cancel) => {
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
            };

            const formulaFormatter = (cell) => {
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
            };

            const actualizarResultados = () => {
                const totalUDPorGrado = {};
                Object.entries(grades.value).filter(([g, a]) => a).forEach(([grado]) => {
                    totalUDPorGrado[grado] = totals.value?.totalUDPorGrado?.[grado] || 0;
                });
                const uhTotalExterioresPorGrado = {};
                Object.entries(grades.value).filter(([g, a]) => a).forEach(([grado]) => {
                    const entradaExterior = Object.values(exterioresData.value || {}).find(ext => ext.nombre?.toLowerCase().includes(grado.toLowerCase()));
                    uhTotalExterioresPorGrado[grado] = entradaExterior ? +((entradaExterior.uhTotal ?? (entradaExterior.salidasRiego * entradaExterior.uh)) || 0) : 0;
                });
                Object.entries(tabulators.value).forEach(([key, tabulatorInstance]) => {
                    if (!tabulatorInstance) return;
                    const [grado, moduloId] = key.split('-');
                    if (!grades.value[grado]) return;
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
                        const caudal = getTankFlow(uhTotalCalculado);
                        row.caudal = (caudal !== null && caudal !== undefined) ? +caudal.toFixed(3) : 0;
                    });
                    tabulatorInstance.replaceData(data);
                    const moduloIndex = obtenerIndiceModulo(grado, moduloId);
                    if (moduloIndex === 0) {
                        setTimeout(() => {
                            sincronizarTodosLosModulos(grado);
                        }, 50);
                    }
                });
                sendredInterioresUpdate();
            };

            const buscarHpiezPorPunto = (grado, puntoABuscar) => {
                if (!puntoABuscar || !tables.value[grado]?.modules?.[0]) return null;
                const primerModulo = tables.value[grado].modules[0];
                const tabulatorKey = `${grado}-${primerModulo.id}`;
                const tabulatorInstance = tabulators.value[tabulatorKey];
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
            };

            const actualizarFilaEstaticaPorPunto = (grado, moduloIndex, puntoABuscar) => {
                if (moduloIndex <= 0) return;
                const hpiezEncontrado = buscarHpiezPorPunto(grado, puntoABuscar);
                if (hpiezEncontrado === null) return;
                const modulo = tables.value[grado].modules[moduloIndex];
                if (!modulo || !Array.isArray(modulo.data)) return;
                const filaEstatica = modulo.data.find(fila => fila.isStatic);
                if (!filaEstatica) return;
                filaEstatica.cota = hpiezEncontrado;
                filaEstatica.hpiez = hpiezEncontrado;
                const tabulatorKey = `${grado}-${modulo.id}`;
                const tabulatorInstance = tabulators.value[tabulatorKey];
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
            };

            const configurarEscuchasCambiosPrimerModulo = (grado) => {
                const primerModulo = tables.value[grado]?.modules?.[0];
                if (!primerModulo) return;
                const tabulatorKey = `${grado}-${primerModulo.id}`;
                const tabulatorInstance = tabulators.value[tabulatorKey];
                if (!tabulatorInstance) return;
                tabulatorInstance.off("cellEdited");
                tabulatorInstance.off("dataChanged");
                tabulatorInstance.on("cellEdited", (cell) => {
                    const field = cell.getField();
                    const rowData = cell.getRow().getData();
                    if (['hpiez', 'coefrug', 'hf', 's', 'punto'].includes(field)) {
                        setTimeout(() => {
                            sincronizarModulosConPunto(grado, rowData.punto, rowData.hpiez);
                        }, 50);
                    }
                });
                tabulatorInstance.on("dataChanged", () => {
                    setTimeout(() => {
                        sincronizarTodosLosModulos(grado);
                    }, 100);
                });
            };

            const sincronizarModulosConPunto = (grado, punto, nuevoHpiez) => {
                if (!punto || nuevoHpiez === undefined || nuevoHpiez === null) return;
                const hpiezValue = parseFloat(nuevoHpiez) || 0;
                tables.value[grado]?.modules?.forEach((modulo, index) => {
                    if (index === 0) return;
                    const filaEstatica = modulo.data.find(fila => fila.isStatic);
                    if (!filaEstatica) return;
                    if (filaEstatica.punto &&
                        filaEstatica.punto.toString().toLowerCase().trim() === punto.toString().toLowerCase().trim()) {
                        filaEstatica.cota = hpiezValue;
                        filaEstatica.hpiez = hpiezValue;
                        const tabulatorKey = `${grado}-${modulo.id}`;
                        const tabulatorInstance = tabulators.value[tabulatorKey];
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
            };

            const sincronizarTodosLosModulos = (grado) => {
                const primerModulo = tables.value[grado]?.modules?.[0];
                if (!primerModulo || !Array.isArray(primerModulo.data)) return;
                primerModulo.data.forEach(fila => {
                    if (fila.punto && fila.hpiez !== undefined) {
                        sincronizarModulosConPunto(grado, fila.punto, fila.hpiez);
                    }
                });
            };

            const manejarCambioPunto = (grado, moduloId, nuevoPunto, filaId) => {
                const moduloIndex = obtenerIndiceModulo(grado, moduloId);
                const modulo = tables.value[grado].modules[moduloIndex];
                if (!modulo) return;
                const filaEstatica = modulo.data.find(f => f.id === filaId && f.isStatic);
                if (filaEstatica && nuevoPunto) {
                    const hpiezEncontrado = buscarHpiezEnRedAlimentacion(grado, nuevoPunto);
                    if (hpiezEncontrado !== null) {
                        filaEstatica.cota = hpiezEncontrado;
                        filaEstatica.hpiez = hpiezEncontrado;
                        const tabulatorKey = `${grado}-${moduloId}`;
                        const tabulatorInstance = tabulators.value[tabulatorKey];
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
                        console.log(`Punto actualizado: ${nuevoPunto} - Nuevo Hpiez: ${hpiezEncontrado}`);
                    } else {
                        console.log(`No se encontró el punto "${nuevoPunto}" en red de alimentación`);
                    }
                }
            };

            const sincronizarPuntoEnTodosModulos = (grado, punto, nuevoHpiez) => {
                if (!punto || nuevoHpiez === undefined || nuevoHpiez === null) return;
                const hpiezValue = parseFloat(nuevoHpiez) || 0;
                tables.value[grado]?.modules?.forEach((modulo) => {
                    const filaEstatica = modulo.data.find(fila => fila.isStatic);
                    if (!filaEstatica) return;
                    if (filaEstatica.punto &&
                        filaEstatica.punto.toString().toLowerCase().trim() === punto.toString().toLowerCase().trim()) {
                        filaEstatica.cota = hpiezValue;
                        filaEstatica.hpiez = hpiezValue;
                        const tabulatorKey = `${grado}-${modulo.id}`;
                        const tabulatorInstance = tabulators.value[tabulatorKey];
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
            };

            const forzarSincronizacion = () => {
                console.log("Forzando sincronización con red de alimentación...");
                sincronizarConRedAlimentacion();
            };

            const obtenerInfoDebug = () => {
                return {
                    redAlimentacionData: redAlimentacionData.value,
                    grades: grades.value,
                    tablesInfo: Object.keys(tables.value).map(grado => ({
                        grado,
                        modulosCount: tables.value[grado].modules.length,
                        modulos: tables.value[grado].modules.map(m => ({
                            id: m.id,
                            nombre: m.nombre,
                            filasEstaticas: m.data.filter(f => f.isStatic).map(f => ({
                                id: f.id,
                                punto: f.punto,
                                cota: f.cota,
                                hpiez: f.hpiez
                            }))
                        }))
                    }))
                };
            };

            const crearModulo = (grado) => {
                const count = (tables.value[grado]?.modules?.length || 0) + 1;
                const nombre = `CALCULO DEL MODULO ${count} (RED DE COCINA-CUARTO DE LIMPIEZA) - ${grado.toUpperCase()}`;
                let staticRow = {
                    id: `static-${Date.now()}-${Math.random()}`,
                    isStatic: true,
                    segmento: 'TE',
                    punto: '',
                    cota: count === 1 ? nivelasumfondotanqueelevado.value : 0,
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
                    coefrug: count === 1 ? 0 : '',
                    s: 0,
                    hf: 0,
                    hpiez: count === 1 ? nivelasumfondotanqueelevado.value : 0,
                    velocidad: '',
                    presion: '',
                    verificacion1: '',
                    verificacion2: ''
                };
                return {
                    id: Date.now() + Math.floor(Math.random() * 1000),
                    nombre,
                    data: [staticRow, crearFilaVacia()]
                };
            };

            const obtenerIndiceModulo = (grado, moduloId) => {
                if (!tables.value[grado]?.modules) return -1;
                return tables.value[grado].modules.findIndex(modulo => modulo.id === moduloId);
            };

            const getColumns = (grado, moduloId) => {
                const editable = mode.value === 'edit';
                const moduloIndex = obtenerIndiceModulo(grado, moduloId);
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
                                    const rowData = row.getData();
                                    const currentModuloIndex = obtenerIndiceModulo(grado, moduloId);
                                    if (rowData.isStatic && currentModuloIndex > 0) {
                                        actualizarFilaEstaticaPorPunto(grado, currentModuloIndex, segundoPunto);
                                    }
                                }
                            }
                            if (editable) {
                                sendredInterioresUpdate();
                            }
                        }
                    },
                    {
                        title: 'Punto',
                        field: 'punto',
                        editor: editable ? 'input' : false,
                        headerVertical: true,
                        cellEdited: editable ? function (cell) {
                            const rowData = cell.getRow().getData();
                            const nuevoPunto = cell.getValue();
                            manejarCambioPunto(grado, moduloId, nuevoPunto, rowData.id);
                            sendredInterioresUpdate();
                        } : undefined
                    },
                    {
                        title: 'Cota',
                        field: 'cota',
                        editor: editable ? customFormulaEditor : false,
                        formatter: formulaFormatter,
                        headerVertical: true,
                        cellEdited: editable ? () => { sendredInterioresUpdate(); } : undefined
                    },
                    {
                        title: 'U.H.',
                        columns: [
                            {
                                title: 'Parcial',
                                field: 'uh_parcial',
                                editor: editable ? 'input' : false,
                                headerVertical: true,
                                cellEdited: () => {
                                    actualizarResultados();
                                }
                            },
                            {
                                title: 'Total',
                                field: 'uh_total',
                                editor: editable ? 'input' : false,
                                headerVertical: true,
                            }
                        ]
                    },
                    {
                        title: 'Caudal (l/s)',
                        field: 'caudal',
                        headerVertical: true,
                    },
                    {
                        title: 'Longitud (m)',
                        field: 'longitud',
                        editor: editable ? 'input' : false,
                        headerVertical: true,
                        cellEdited: editable ? (cell) => {
                            actualizarLongitudTotal(cell.getRow());
                            sendredInterioresUpdate();
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
                            actualizarAccesoriosPorDiametro(row, data.diametro);
                            sendredInterioresUpdate();
                        } : undefined
                    },
                    {
                        title: 'Longitud Equivalente (m)',
                        columns: [
                            {
                                title: 'N°',
                                field: 'n1',
                                editor: editable ? 'input' : false,
                                headerVertical: true,
                                cellEdited: editable ? (cell) => {
                                    actualizarLongitudTotal(cell.getRow());
                                    sendredInterioresUpdate();
                                } : undefined
                            },
                            {
                                title: '',
                                field: 'codo90',
                                hozAlign: "center",
                                width: 95,
                                editor: editable ? "input" : false,
                                headerFilter: editable ? crearHeaderFilter('codo90', 'codo90') : false,
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
                                    return map[accesoriosConfig.value?.codo90] || 'Accesorio';
                                } : undefined
                            },
                            {
                                title: 'N°',
                                field: 'n2',
                                editor: editable ? 'input' : false,
                                headerVertical: true,
                                cellEdited: editable ? (cell) => {
                                    actualizarLongitudTotal(cell.getRow());
                                    sendredInterioresUpdate();
                                } : undefined
                            },
                            {
                                title: '',
                                field: 'tee',
                                hozAlign: "center",
                                width: 95,
                                editor: editable ? "input" : false,
                                headerFilter: editable ? crearHeaderFilter('tee', 'tee') : false,
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
                                    return map[accesoriosConfig.value?.tee] || 'Accesorio';
                                } : undefined
                            },
                            {
                                title: 'N°',
                                field: 'n3',
                                editor: editable ? 'input' : false,
                                headerVertical: true,
                                cellEdited: editable ? (cell) => {
                                    actualizarLongitudTotal(cell.getRow());
                                    sendredInterioresUpdate();
                                } : undefined
                            },
                            {
                                title: '',
                                field: 'val_compuerta',
                                hozAlign: "center",
                                width: 95,
                                editor: editable ? "input" : false,
                                headerFilter: editable ? crearHeaderFilter('val_compuerta', 'valCompuerta') : false,
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
                                    return map[accesoriosConfig.value?.val_compuerta] || 'Accesorio';
                                } : undefined
                            },
                            {
                                title: 'N°',
                                field: 'n4',
                                editor: editable ? 'input' : false,
                                headerVertical: true,
                                cellEdited: editable ? (cell) => {
                                    actualizarLongitudTotal(cell.getRow());
                                    sendredInterioresUpdate();
                                } : undefined
                            },
                            {
                                title: '',
                                field: 'reduccion2',
                                hozAlign: "center",
                                width: 95,
                                editor: editable ? 'input' : false,
                                headerFilter: editable ? crearHeaderFilter('reduccion2', 'reduccion2') : false,
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
                                    return map[accesoriosConfig.value?.reduccion2] || 'Accesorio';
                                } : undefined
                            }
                        ]
                    },
                    {
                        title: 'Longitud Total (m)',
                        field: 'longitudtotal',
                        editor: false,
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
                            const nivelInicial = nivelasumfondotanqueelevado.value;
                            const sanitize = (val, dec = 2) => {
                                const num = Number(val);
                                return isFinite(num) && !isNaN(num) ? parseFloat(num.toFixed(dec)) : 0;
                            };
                            const resultadosParciales = [];
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
                                    presion: 0,
                                    hpiez: 0
                                });
                            });
                            let hpiezAnterior = sanitize(nivelInicial);
                            resultadosParciales.forEach((r) => {
                                r.hpiez = hpiezAnterior;
                                const nuevoHpiez = sanitize(hpiezAnterior - r.hf);
                                hpiezAnterior = nuevoHpiez;
                                r.presion = sanitize(r.hpiez - r.cota);
                                const verificacion1 = r.velocidad === 0 ? "" : (r.velocidad >= 0.6 && r.velocidad <= 3 ? "cumple" : "no cumple");
                                const verificacion2 = r.presion === 0 ? "" : (r.presion >= 2 ? "cumple" : "no cumple");
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
                        headerVertical: true
                    },
                    {
                        title: 'Hf(m)',
                        field: 'hf',
                        headerVertical: true
                    },
                    {
                        title: 'H. Piez. (m)',
                        field: 'hpiez',
                        headerVertical: true
                    },
                    {
                        title: 'Velocidad(m/s)',
                        field: 'velocidad',
                        headerVertical: true
                    },
                    {
                        title: 'Presión (mca)',
                        field: 'presion',
                        headerVertical: true
                    },
                    {
                        title: 'VERIFICACIONES',
                        columns: [
                            {
                                title: '0.60<V< Adm?',
                                field: 'verificacion1',
                                headerVertical: true,
                                formatter: function (cell) {
                                    const value = cell.getValue();
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
                                headerVertical: true,
                                formatter: function (cell) {
                                    const value = cell.getValue();
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
                            removeRow(grado, moduloId, rowData.id);
                        }
                    });
                }
                return columns;
            };

            const inicializarEscuchasTabla = (grado, moduloId) => {
                const moduloIndex = obtenerIndiceModulo(grado, moduloId);
                if (moduloIndex === 0) {
                    setTimeout(() => {
                        configurarEscuchasCambiosPrimerModulo(grado);
                    }, 200);
                }
            };

            const sendredInterioresUpdate = () => {
                const configData = {
                    npisoterminado: config.value?.npisoterminado ?? 0,
                    altasumfondotanqueelevado: config.value?.altasumfondotanqueelevado ?? 0,
                };
                const nivelasumfondotanqueelevadoVal = +(
                    configData.npisoterminado + configData.altasumfondotanqueelevado
                ).toFixed(3);
                const tablasData = {};
                Object.keys(tables.value).forEach(grado => {
                    tablasData[grado] = tables.value[grado].modules.map(modulo => {
                        const key = `${grado}-${modulo.id}`;
                        const tabulator = tabulators.value[key];
                        return {
                            nombre: modulo.nombre,
                            data: Array.isArray(tabulator?.getData?.())
                                ? tabulator.getData()
                                : (modulo.data || [])
                        };
                    });
                });
                const payload = {
                    config: configData,
                    nivelasumfondotanqueelevado: nivelasumfondotanqueelevadoVal,
                    tablas: tablasData
                };
                document.dispatchEvent(new CustomEvent('redes-interiores-updated', {
                    detail: payload
                }));
            };

            onMounted(() => {
                configurarEventos();
                for (const grado in tables.value) {
                    if (grades.value[grado]) {
                        tables.value[grado].expanded = true;
                        break;
                    }
                }
                nextTick(() => {
                    Object.keys(tables.value).forEach(grado => {
                        if (grades.value[grado] && tables.value[grado].modules.length === 0) {
                            const modulo = crearModulo(grado);
                            tables.value[grado].modules.push(modulo);
                            nextTick(() => {
                                initTabulator(grado, modulo.id, modulo.data);
                                sendredInterioresUpdate();
                            });
                        }
                    });
                    sendredInterioresUpdate();
                });
            });

            return {
                mode,
                config,
                nivelasumfondotanqueelevado,
                grades,
                tables,
                toggleMode,
                addModulo,
                removeModulo,
                addRow,
                updateConfigAndNotify
            };
        }
    });

    app.mount(redesInteriores);
}