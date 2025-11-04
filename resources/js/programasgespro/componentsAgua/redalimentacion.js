import { ref, reactive, computed, onMounted, createApp } from 'vue';
import longEquival from "./longitud-components.js";

export function initRedAlimentacionModule() {
    const app = {
        setup() {
            const mode = ref('default');

            // CONFIGURACIÓN GLOBAL Y CONSTANTES
            const config = reactive({
                diametros: {
                    '1/2 pulg': { mm: 15, area: 0.50, pulg: '1/2' },
                    '3/4 pulg': { mm: 20, area: 0.74, pulg: '3/4' },
                    '1 pulg': { mm: 25, area: 1, pulg: '1' },
                    '1 1/4 pulg': { mm: 32, area: 1.25, pulg: '1 1/4' },
                    '1 1/2 pulg': { mm: 40, area: 1.5, pulg: '1 1/2' },
                    '2 pulg': { mm: 50, area: 2, pulg: '2' },
                    '2 1/2 pulg': { mm: 50, area: 2.5, pulg: '2' },
                    '3 pulg': { mm: 50, area: 3, pulg: '2' },
                    '4 pulg': { mm: 50, area: 4, pulg: '2' },
                    '6 pulg': { mm: 50, area: 6, pulg: '2' },
                },
                accesoriosDisponibles: [
                    { label: 'Codo de 45°', key: 'codo45' },
                    { label: 'Codo de 90°', key: 'codo90' },
                    { label: 'Tee', key: 'tee' },
                    { label: 'Válvula Compuerta', key: 'valCompuerta' },
                    { label: 'Válvula Check', key: 'valCheck' },
                    { label: 'Canastilla', key: 'canastilla' },
                    { label: 'Reducción 1', key: 'reduccion1' },
                    { label: 'Reducción 2', key: 'reduccion2' }
                ],
                leqTabla: longEquival,
            });

            // ==============================================
            // MÓDULO 1: CAUDAL DE ENTRADA
            // ==============================================
            const caudalEntrada = reactive({
                volumenCisterna: 2268,
                tiempoLlenado: 10,
                get qLlenado() {
                    //console.log('Calculando qLlenado con volumenCisterna:', this.volumenCisterna, 'y tiempoLlenado:', this.tiempoLlenado);
                    if (this.tiempoLlenado <= 0 || this.volumenCisterna <= 0) return 0;
                    return parseFloat((this.volumenCisterna / (this.tiempoLlenado * 3600)).toFixed(3));
                },
                get qLlenadoM3h() {
                    return parseFloat((this.qLlenado * 3.6).toFixed(2));
                },
                actualizar() {
                    this.notificarCambio();
                },
                notificarCambio() {
                    document.dispatchEvent(new CustomEvent('caudal-actualizado', {
                        detail: { qLlenado: this.qLlenado }
                    }));
                },
                validar() {
                    return {
                        valido: this.volumenCisterna > 0 && this.tiempoLlenado > 0,
                        errores: []
                    };
                }
            });

            // ==============================================
            // MÓDULO 2: CARGA DISPONIBLE
            // ==============================================
            const cargaDisponible = reactive({
                datos: {
                    nivelTerreno: 0,
                    presionConexion: 10.00,
                    presionSalida: 2.00
                },
                nivelIngresoCist: 0,
                get nivelTuberiaConexion() {
                    return this.datos.nivelTerreno - 0.70;
                },
                get alturaEstatica() {
                    return this.nivelIngresoCist - this.nivelTuberiaConexion;
                },
                get cargaDisponibleTotal() {
                    return parseFloat((
                        this.datos.presionConexion -
                        this.datos.presionSalida -
                        this.alturaEstatica
                    ).toFixed(2));
                },
                actualizar() {
                    this.notificarCambio();
                },
                notificarCambio() {
                    document.dispatchEvent(new CustomEvent('carga-actualizada', {
                        detail: {
                            cargaDisponible: this.cargaDisponibleTotal,

                            alturaEstatica: this.alturaEstatica
                        }
                    }));
                },
                validar() {
                    const errores = [];
                    if (this.datos.presionConexion <= this.datos.presionSalida) {
                        errores.push('La presión de conexión debe ser mayor a la presión de salida');
                    }
                    return {
                        valido: errores.length === 0,
                        errores
                    };
                }
            });

            // ==============================================
            // MÓDULO 3: PÉRDIDA DE CARGA
            // ==============================================
            const perdidaCarga = reactive({
                configuracion: {
                    diametroConexion: '1 pulg',
                    micromedidor: 'SI',
                    longitudTuberia: 5.40,
                    hfMedidor: 1.10
                },
                accesorios: [
                    { tipo: 'codo45', cantidad: 0, leq: 0.477 },
                    { tipo: 'codo90', cantidad: 3, leq: 1.023 },
                    { tipo: 'tee', cantidad: 1, leq: 2.045 },
                    { tipo: 'valCompuerta', cantidad: 2, leq: 0.216 },
                    { tipo: 'valCheck', cantidad: 0, leq: 2.114 },
                    { tipo: 'reduccion2', cantidad: 1, leq: 1.045 }
                ],
                caudal: 0,
                cargaDisponible: 0,
                analisisCarga: [{ d: 25.4 }, { d: 31.8 }, { d: 38.1 }],
                init() {
                    this.caudal = caudalEntrada.qLlenado;
                    this.cargaDisponible = cargaDisponible.cargaDisponibleTotal;
                },
                get caudalM3h() {
                    return parseFloat((caudalEntrada.qLlenado * 3.6).toFixed(2));
                },
                get velocidad() {
                    const diametroInfo = config.diametros[this.configuracion.diametroConexion];
                    if (!diametroInfo || !diametroInfo.area) return 0;
                    const caudal_Ls = caudalEntrada.qLlenado; // L/s
                    const caudal_m3s = caudal_Ls / 1000;
                    const d_m = diametroInfo.area * 2.54 / 100; // pulgadas → metros
                    const area_m2 = Math.PI * Math.pow(d_m, 2) / 4;
                    if (area_m2 === 0) return 0;
                    const velocidad = caudal_m3s / area_m2;
                    return +velocidad.toFixed(3); // Redondeo a 3 decimales
                },
                get leqTotal() {
                    return this.accesorios.reduce((sum, acc) => sum + (acc.cantidad * acc.leq), 0);
                },
                get longitudTotal() {
                    return parseFloat((this.leqTotal + this.configuracion.longitudTuberia).toFixed(2));
                },
                get pendienteHidraulica() {
                    const diametroInfo = config.diametros[this.configuracion.diametroConexion];
                    if (!diametroInfo || !diametroInfo.area) return 0;
                    const caudalLmin = caudalEntrada.qLlenado;
                    if (caudalLmin <= 0) return 0;
                    try {
                        const q_m3s = caudalLmin / 1000 / 0.2785 / 140; // L/min a m³/s
                        const d_m = diametroInfo.area * 2.54 / 100; // pulgadas a metros
                        const pendiente = Math.pow(q_m3s / (Math.pow(d_m, 2.63)), 1.85);
                        return +pendiente.toFixed(6);
                    } catch (error) {
                        console.error('Error calculando pendiente hidráulica:', error);
                        return 0;
                    }
                },
                get perdidaPorFriccion() {
                    return parseFloat((this.longitudTotal * this.pendienteHidraulica).toFixed(2));
                },
                get perdidaPorMedidor() {
                    return this.configuracion.micromedidor === 'SI' ? parseFloat(this.configuracion.hfMedidor.toFixed(2)) : 0;
                },
                get perdidaTotalCarga() {
                    return parseFloat((this.perdidaPorFriccion + this.perdidaPorMedidor).toFixed(2));
                },
                get esSistemaViable() {
                    return this.cargaDisponible > this.perdidaTotalCarga;
                },
                get cargaDisponibleHdTRMD() {
                    return this.cargaDisponible - this.configuracion.hfMedidor - this.perdidaPorFriccion;
                },
                obtenerInfoDiametro() {
                    return config.diametros[this.configuracion.diametroConexion] || null;
                },
                actualizarLeqAccesorio(accesorio) {
                    accesorio.leq = config.leqTabla[accesorio.tipo]?.[this.configuracion.diametroConexion] || 0;
                    this.actualizar();
                },
                agregarAccesorio(tipo = 'codo90') {
                    const nuevoAccesorio = { tipo, cantidad: 1, leq: 0 };
                    this.actualizarLeqAccesorio(nuevoAccesorio);
                    this.accesorios.push(nuevoAccesorio);
                },
                eliminarAccesorio(index) {
                    this.accesorios.splice(index, 1);
                    this.actualizar();
                },
                agregarFilaAnalisis() {
                    this.analisisCarga.push({ d: 25.4 });
                    analisisTuberias.modulos.push({ longitudTotal: 5.40 });
                },
                updateRow(index) {
                    // Lógica adicional si es necesaria
                },
                actualizar() {
                    this.notificarCambio();
                },
                notificarCambio() {
                    document.dispatchEvent(new CustomEvent('perdida-carga-actualizada', {
                        detail: {
                            perdidaTotal: this.perdidaTotalCarga,
                            velocidad: this.velocidad,
                            viable: this.esSistemaViable
                        }
                    }));
                },
                validar() {
                    const errores = [];
                    const caudal = caudalEntrada.qLlenado;
                    if (caudal <= 0) errores.push('El caudal debe ser mayor a 0');
                    if (this.velocidad > 3) errores.push('Velocidad excesiva (> 3 m/s)');
                    if (!this.esSistemaViable) errores.push('Sistema no viable: pérdida > carga disponible');
                    return {
                        valido: errores.length === 0,
                        errores,
                        advertencias: this.velocidad > 2 ? ['Velocidad alta (> 2 m/s)'] : []
                    };
                }
            });

            perdidaCarga.init();

            // analisisTuberias
            const analisisTuberias = reactive({
                modulos: [],
                agregarAnalisis() {
                    const nuevoModulo = {
                        config: {
                            analisistuberia: '',
                            longitudTuberia: 5.40
                        },
                        accesorios: [],
                        get leqTotal() {
                            return this.accesorios.reduce((sum, acc) => sum + (acc.leq || 0), 0);
                        },
                        get longitudTotal() {
                            return +(this.leqTotal + this.config.longitudTuberia).toFixed(2);
                        }
                    };
                    this.modulos.push(nuevoModulo);
                    this.actualizarLongitudFinal();
                },
                eliminarAnalisis(index) {
                    this.modulos.splice(index, 1);
                    this.actualizarLongitudFinal();
                },
                agregarFila(modulo) {
                    modulo.accesorios.push({ descripcion: '', leq: 0 });
                    this.actualizarLongitudFinal();
                },
                eliminarFila(modulo, index) {
                    modulo.accesorios.splice(index, 1);
                    this.actualizarLongitudFinal();
                },
                autocompletarAnalisis(modulo) {
                    const tipo = modulo.config.analisistuberia;
                    const presetsPorTipo = {
                        '1/2"': [
                            { descripcion: '01 Codo 1/2" x 90°', leq: 0.532 },
                            { descripcion: '02 Codo 1/2" x 45°', leq: 0.324 },
                            { descripcion: '1 Válvula compuerta 1/2"', leq: 0.181 }
                        ],
                        '3/4"': [
                            { descripcion: '01 Codo 3/4" x 90°', leq: 0.720 },
                            { descripcion: '02 Codo 3/4" x 45°', leq: 0.405 },
                            { descripcion: '1 Válvula compuerta 3/4"', leq: 0.202 }
                        ],
                        '1"': [
                            { descripcion: '01 Codo 1" x 90°', leq: 1.023 },
                            { descripcion: '02 Codo 1" x 45°', leq: 0.477 },
                            { descripcion: '2 Válvula compuerta 1"', leq: 0.216 }
                        ],
                        '1 1/4"': [
                            { descripcion: '01 Codo 1 1/4" x 90°', leq: 1.323 },
                            { descripcion: '2 Válvula compuerta 1 1/4"', leq: 0.230 }
                        ],
                        '1 1/2"': [
                            { descripcion: '01 Codo 1 1/2" x 90°', leq: 1.620 },
                            { descripcion: '1 Válvula compuerta 1 1/2"', leq: 0.250 }
                        ],
                        '2"': [
                            { descripcion: '01 Codo 2" x 90°', leq: 2.000 },
                            { descripcion: '2 Válvula compuerta 2"', leq: 0.265 }
                        ],
                        '2 1/4"': [
                            { descripcion: '01 Codo 2 1/4" x 90°', leq: 2.350 },
                            { descripcion: '1 Válvula compuerta 2 1/4"', leq: 0.280 }
                        ],
                        '2 1/2"': [
                            { descripcion: '01 Codo 2 1/2" x 90°', leq: 2.577 },
                            { descripcion: '1 Válvula compuerta 2 1/2"', leq: 0.290 }
                        ],
                        '3"': [
                            { descripcion: '01 Codo 3" x 90°', leq: 3.100 },
                            { descripcion: '2 Válvula compuerta 3"', leq: 0.320 }
                        ],
                        '4"': [
                            { descripcion: '01 Codo 4" x 90°', leq: 4.800 },
                            { descripcion: '2 Válvula compuerta 4"', leq: 0.380 }
                        ],
                        '6"': [
                            { descripcion: '01 Codo 6" x 90°', leq: 6.200 },
                            { descripcion: '2 Válvula compuerta 6"', leq: 0.460 }
                        ]
                    };
                    modulo.accesorios = presetsPorTipo[tipo] || [];
                    this.actualizarLongitudFinal();
                },
                actualizarLongitudFinal() {
                    const ultimoModulo = this.modulos[this.modulos.length - 1];
                    if (ultimoModulo) {
                        perdidaCarga.configuracion.longitudTuberia = +ultimoModulo.longitudTotal.toFixed(2);
                    }
                }
            });

            // ==============================================
            // MÓDULO 4: ANÁLISIS DE DIÁMETROS
            // ==============================================
            const analisisDiametros = reactive({
                dia_configuracion: { dia_selectedDiameter: '1 pulg', dia_longitudTuberia: 15.88, dia_micromedidor: 'SI', dia_hfMedidor: 1.10 },
                dia_accesorios: [
                    { tipo: 'codo45', cantidad: 0, leq: 0.477 },
                    { tipo: 'codo90', cantidad: 7, leq: 1.023 },
                    { tipo: 'tee', cantidad: 2, leq: 2.045 },
                    { tipo: 'valCompuerta', cantidad: 2, leq: 0.216 },
                    { tipo: 'valCheck', cantidad: 0, leq: 2.114 },
                    { tipo: 'reduc2', cantidad: 0, leq: 1.045 }
                ],
                dia_availableHead: 6.9,
                init() {
                    this.dia_availableHead = cargaDisponible.cargaDisponibleTotal;
                },
                get dia_caudalM3h() { return parseFloat((caudalEntrada.qLlenado * 3.6).toFixed(2)); },
                get dia_velocity() {
                    const dia_diametroInfo = config.diametros[this.dia_configuracion.dia_selectedDiameter];
                    if (!dia_diametroInfo || !dia_diametroInfo.area) return 0;
                    const caudal_Ls = caudalEntrada.qLlenado; // L/s
                    const caudal_m3s = caudal_Ls / 1000;
                    const d_m = dia_diametroInfo.area * 2.54 / 100; // pulgadas a metros
                    const area_m2 = Math.PI * Math.pow(d_m, 2) / 4;
                    if (area_m2 === 0) return 0;
                    const velocidad = caudal_m3s / area_m2;
                    return +velocidad.toFixed(3);
                },
                get dia_leqTotal() { return this.dia_accesorios.reduce((sum, acc) => sum + (acc.cantidad * acc.leq), 0); },
                get dia_totalLength() { return parseFloat((this.dia_leqTotal + this.dia_configuracion.dia_longitudTuberia).toFixed(2)); },
                get dia_slope() {
                    const diametroInfo = config.diametros[this.dia_configuracion.dia_selectedDiameter];
                    if (!diametroInfo || !diametroInfo.area) return 0;
                    const caudalLmin = caudalEntrada.qLlenado;
                    if (caudalLmin <= 0) return 0;
                    try {
                        const q_m3s = caudalLmin / 1000 / 0.2785 / 140; // L/min a m³/s
                        const d_m = diametroInfo.area * 2.54 / 100; // pulgadas a metros
                        const pendiente = Math.pow(q_m3s / (Math.pow(d_m, 2.63)), 1.85);
                        return +pendiente.toFixed(6);
                    } catch (error) {
                        console.error('Error calculando pendiente hidráulica:', error);
                        return 0;
                    }
                },
                get dia_headLoss() { return parseFloat((this.dia_totalLength * this.dia_slope).toFixed(2)); },
                get dia_perdidaPorMedidor() { return this.dia_configuracion.dia_micromedidor === 'SI' ? parseFloat(this.dia_configuracion.dia_hfMedidor.toFixed(2)) : 0; },
                get dia_perdidaTotalCarga() { return parseFloat((this.dia_headLoss + this.dia_perdidaPorMedidor).toFixed(2)); },
                get dia_isSystemViable() { return this.dia_availableHead > this.dia_perdidaTotalCarga; },
                get dia_cargaDisponibleHdTRMD() {
                    return perdidaCarga.cargaDisponibleHdTRMD - this.dia_headLoss;
                },
                dia_obtenerInfoDiametro() { return config.diametros[this.dia_configuracion.dia_selectedDiameter] || null; },
                dia_actualizarLeqAccesorio(accesorio) {
                    accesorio.leq = config.leqTabla[accesorio.tipo]?.[this.dia_configuracion.dia_selectedDiameter] || 0;
                    this.dia_updateCalculations();
                },
                dia_agregarAccesorio(tipo = 'codo90') {
                    const nuevoAccesorio = { tipo, cantidad: 1, leq: 0 };
                    this.dia_actualizarLeqAccesorio(nuevoAccesorio);
                    this.dia_accesorios.push(nuevoAccesorio);
                },
                dia_eliminarAccesorio(index) {
                    this.dia_accesorios.splice(index, 1);
                    this.dia_updateCalculations();
                },
                dia_updateCalculations() {
                    this.dia_actualizar();
                },
                dia_actualizar() { this.dia_notificarCambio(); },
                dia_notificarCambio() {
                    document.dispatchEvent(new CustomEvent('medido-cisterna-actualizada', {
                        detail: { dia_perdidaTotal: this.dia_perdidaTotalCarga, dia_velocity: this.dia_velocity, dia_viable: this.dia_isSystemViable }
                    }));
                },
                dia_validar() {
                    const errores = [];
                    const caudal = caudalEntrada.qLlenado;
                    if (caudal <= 0) errores.push('El caudal debe ser mayor a 0');
                    if (this.dia_velocity > 3) errores.push('Velocidad excesiva (> 3 m/s)');
                    if (!this.dia_isSystemViable) errores.push('Sistema no viable: pérdida > carga disponible');
                    return { valido: errores.length === 0, errores, advertencias: this.dia_velocity > 2 ? ['Velocidad alta (> 2 m/s)'] : [] };
                }
            });

            analisisDiametros.init();

            // MÓDULO 5: GRÁFICOS Y VISUALIZACIÓN
            const graficos = reactive({
                chartInstance: null,
                configuracion: {
                    colores: {
                        carga: '#e74c3c',
                        perdida: '#F44336',
                        viable: '#4CAF50',
                        cruz: '#9C27B0'
                    }
                },
                datosCurvas: {},
                datosReales: {
                    15: [[0.4, 0.1], [0.5, 0.15], [0.6, 0.2], [0.7, 0.27], [0.8, 0.35], [0.9, 0.44], [1, 0.5], [1.1, 0.58], [1.2, 0.7], [1.3, 0.82], [1.4, 0.95], [1.5, 1.1], [1.7, 1.4], [2, 2], [2.5, 3], [3, 4.5], [3.5, 6.2], [4, 8]],
                    20: [[0.6, 0.1], [0.7, 0.12], [0.8, 0.15], [0.9, 0.19], [1, 0.25], [1.2, 0.35], [1.4, 0.42], [1.5, 0.5], [1.7, 0.65], [2, 0.8], [2.5, 1.25], [3, 1.8], [3.5, 2.4], [4, 3.2], [4.5, 4.1], [5, 5], [6, 7.2], [7, 9.8], [8, 12.5], [9, 15.8], [10, 19.5]],
                    25: [[0.8, 0.1], [0.9, 0.12], [1, 0.15], [1.2, 0.22], [1.4, 0.26], [1.5, 0.3], [1.7, 0.38], [2, 0.5], [2.5, 0.78], [3, 1.1], [3.5, 1.5], [4, 2], [4.5, 2.55], [5, 3.1], [5.5, 3.75], [6, 4.5], [7, 6.2], [8, 8], [9, 10.2], [10, 12.5], [12, 18], [15, 28], [18, 40], [20, 50]],
                    32: [[1, 0.1], [1.2, 0.14], [1.4, 0.17], [1.5, 0.2], [1.7, 0.25], [2, 0.3], [2.2, 0.38], [2.5, 0.48], [3, 0.65], [3.5, 0.85], [4, 1.15], [4.5, 1.45], [5, 1.8], [5.5, 2.2], [6, 2.6], [7, 3.6], [8, 4.6], [9, 5.8], [10, 7.2], [12, 10.5], [15, 16], [18, 22], [20, 28], [25, 44], [30, 63], [35, 86], [40, 112]],
                    40: [[1.5, 0.08], [2, 0.1], [2.2, 0.12], [2.5, 0.15], [3, 0.2], [3.5, 0.27], [4, 0.35], [4.5, 0.44], [5, 0.55], [5.5, 0.67], [6, 0.8], [7, 1.1], [8, 1.4], [9, 1.75], [10, 2.2], [12, 3.2], [15, 5], [18, 7.2], [20, 8.9], [25, 14], [30, 20], [35, 27], [40, 35]],
                    50: [[2, 0.06], [2.5, 0.08], [3, 0.1], [3.5, 0.12], [4, 0.15], [4.5, 0.19], [5, 0.25], [5.5, 0.29], [6, 0.35], [7, 0.48], [8, 0.6], [9, 0.75], [10, 0.95], [12, 1.35], [15, 2.1], [18, 3], [20, 3.8], [25, 6], [30, 8.5], [35, 11.5], [40, 15], [45, 19], [50, 23]]
                },

                asignarColorPorDiametro(diametro) {
                    const mapaColores = { 15: '#e74c3c', 20: '#F44336', 25: '#9C27B0', 32: '#FF9800', 40: '#2196F3', 50: '#4CAF50' };
                    return mapaColores[diametro] || '#333';
                },

                interpolacionLogaritmica(x, puntos) {
                    if (!puntos || puntos.length < 2 || x <= 0) return null;
                    if (x <= puntos[0][0]) return puntos[0][1];
                    if (x >= puntos[puntos.length - 1][0]) return puntos[puntos.length - 1][1];
                    for (let i = 0; i < puntos.length - 1; i++) {
                        const [x1, y1] = puntos[i];
                        const [x2, y2] = puntos[i + 1];
                        if (x >= x1 && x <= x2) {
                            const logX = Math.log(x);
                            const logX1 = Math.log(x1);
                            const logX2 = Math.log(x2);
                            const logY1 = Math.log(y1);
                            const logY2 = Math.log(y2);
                            const logY = logY1 + (logY2 - logY1) * (logX - logX1) / (logX2 - logX1);
                            return Math.exp(logY);
                        }
                    }
                    return null;
                },

                generarCurvaCompleta(diametro) {
                    const puntos = this.datosReales[diametro];
                    if (!puntos) return [];
                    const curva = [];
                    const min = 0.4, max = 50;
                    for (let i = 0; i <= 200; i++) {
                        const t = i / 200;
                        const x = min * Math.pow(max / min, t);
                        const y = this.interpolacionLogaritmica(x, puntos);
                        if (y !== null) curva.push([x, y]);
                    }
                    return curva;
                },

                asegurarContenedor() {
                    let el = document.getElementById('perdidaChart');
                    if (!el) {
                        console.error('Elemento #perdidaChart no encontrado');
                        return null;
                    }
                    if (!el.style.height) el.style.height = '500px';
                    if (!el.style.width) el.style.width = '100%';
                    return el;
                },

                async inicializarGrafico() {
                    // Esperar a que ECharts esté disponible
                    let intentos = 0;
                    while (typeof echarts === 'undefined' && intentos < 30) {
                        await new Promise(r => setTimeout(r, 100));
                        intentos++;
                    }
                    if (typeof echarts === 'undefined') {
                        console.error('ECharts no cargado. Verifica el CDN.');
                        return;
                    }

                    const el = this.asegurarContenedor();
                    if (!el) return;

                    if (this.chartInstance) this.chartInstance.dispose();
                    this.chartInstance = echarts.init(el);

                    // Generar todas las curvas
                    this.datosCurvas = {};
                    Object.keys(this.datosReales).forEach(d => {
                        this.datosCurvas[d] = this.generarCurvaCompleta(parseInt(d));
                    });

                    this.dibujarGrafico();

                    window.addEventListener('resize', () => {
                        if (this.chartInstance) this.chartInstance.resize();
                    });
                },

                dibujarGrafico() {
                    if (!this.chartInstance) return;

                    const series = Object.keys(this.datosCurvas).map(d => ({
                        name: `Ø ${d} mm`,
                        type: 'line',
                        smooth: false,
                        showSymbol: false,
                        data: this.datosCurvas[d],
                        lineStyle: { color: this.asignarColorPorDiametro(d), width: 2 },
                        z: 1
                    }));

                    const option = {
                        title: { text: 'Curva de Pérdida de Presión', left: 'center', textStyle: { fontSize: 18, fontWeight: 'bold', color: '#000' } },
                        grid: { left: '15%', right: '5%', bottom: '15%', top: '15%', containLabel: true, backgroundColor: '#fff', show: true, borderColor: '#000', borderWidth: 2 },
                        xAxis: {
                            type: 'log',
                            name: 'Caudal - m³/h',
                            nameLocation: 'middle',
                            nameGap: 35,
                            min: 0.4,
                            max: 50,
                            axisLine: { lineStyle: { color: '#000', width: 2 } },
                            axisLabel: { color: '#000', fontSize: 12 },
                            splitLine: { show: true, lineStyle: { color: '#666', width: 1 } },
                            minorSplitLine: { show: true, lineStyle: { color: '#ccc', width: 0.5 } }
                        },
                        yAxis: {
                            type: 'log',
                            name: 'Pérdida de Presión (m.c.a.)',
                            nameLocation: 'middle',
                            nameGap: 60,
                            min: 0.05,
                            max: 12,
                            axisLine: { lineStyle: { color: '#000', width: 2 } },
                            axisLabel: { color: '#000', fontSize: 12 },
                            splitLine: { show: true, lineStyle: { color: '#666', width: 1 } },
                            minorSplitLine: { show: true, lineStyle: { color: '#ccc', width: 0.5 } }
                        },
                        series,
                        animation: false,
                        legend: { show: true, bottom: 10, textStyle: { fontSize: 12 } }
                    };

                    this.chartInstance.setOption(option);
                    this.actualizarCruz();
                },

                calcularPerdidaDeCarga(caudal, diametroMm) {
                    return this.interpolacionLogaritmica(caudal, this.datosReales[diametroMm]);
                },

                actualizarCruz() {
                    if (!this.chartInstance) return;

                    const diamInfo = perdidaCarga.obtenerInfoDiametro();
                    const diamMm = diamInfo ? diamInfo.mm : 25;
                    const caudal = perdidaCarga.caudalM3h;

                    if (isNaN(caudal) || caudal <= 0 || isNaN(diamMm)) {
                        this.limpiarCruz();
                        return;
                    }

                    const perdida = this.calcularPerdidaDeCarga(caudal, diamMm);
                    const baseSeries = Object.keys(this.datosCurvas).map(d => ({
                        name: `Ø ${d} mm`,
                        type: 'line',
                        smooth: false,
                        showSymbol: false,
                        data: this.datosCurvas[d],
                        lineStyle: { color: this.asignarColorPorDiametro(d), width: 2 },
                        z: 1
                    }));

                    if (perdida !== null && perdida > 0) {
                        // Actualizar el valor en perdidaCarga (opcional, según tu lógica)
                        // perdidaCarga.configuracion.hfMedidor = +perdida.toFixed(3);

                        baseSeries.push({
                            name: 'Punto de Operación',
                            type: 'scatter',
                            data: [[caudal, perdida]],
                            symbolSize: 12,
                            itemStyle: { color: this.configuracion.colores.cruz, borderColor: '#fff', borderWidth: 2 },
                            markLine: {
                                silent: true,
                                symbol: 'none',
                                lineStyle: { color: this.configuracion.colores.cruz, type: 'dashed', width: 2 },
                                data: [{ xAxis: caudal }, { yAxis: perdida }]
                            },
                            z: 3
                        });
                    }

                    this.chartInstance.setOption({ series: baseSeries });
                },

                limpiarCruz() {
                    if (!this.chartInstance) return;
                    const baseSeries = Object.keys(this.datosCurvas).map(d => ({
                        name: `Ø ${d} mm`,
                        type: 'line',
                        smooth: false,
                        showSymbol: false,
                        data: this.datosCurvas[d],
                        lineStyle: { color: this.asignarColorPorDiametro(d), width: 2 },
                        z: 1
                    }));
                    this.chartInstance.setOption({ series: baseSeries });
                }
            });
            // MÉTODOS PRINCIPALES DEL MÓDULO
            // Inicialización
            const init = () => {
                configurarEventos();
                configurarReferencias();
                inicializarModulos();
                realizarCalculosIniciales();
            };

            const configurarEventos = () => {
                document.addEventListener('caudal-actualizado', (event) => {
                    perdidaCarga.caudal = event.detail.qLlenado;
                    analisisDiametros.caudal = event.detail.qLlenado;
                    actualizarTodosLosModulos();
                });
                document.addEventListener('carga-actualizada', (event) => {
                    perdidaCarga.cargaDisponible = event.detail.cargaDisponible;
                    analisisDiametros.dia_availableHead = event.detail.cargaDisponible;
                    actualizarTodosLosModulos();
                });
                document.addEventListener('cisterna-updated', (event) => {
                    if (event.detail) {
                        console.log('Datos que vienen de cisterna:', event.detail);
                        console.log('Modulos de volumen capturadp:', event.detail.volumencisterna);

                        caudalEntrada.volumenCisterna = event.detail.volumencisterna ?
                            (parseFloat(event.detail.volumencisterna) * 1000) : 0;
                        console.log('cargando a la variable:', caudalEntrada.volumenCisterna);
                        cargaDisponible.nivelIngresoCist = event.detail.nivel2 || 0;
                        actualizarTodosLosModulos();
                    }
                });
            };

            const configurarReferencias = () => {
                perdidaCarga.parent = { config, caudalEntrada, cargaDisponible };
                analisisDiametros.parent = { config, caudalEntrada, perdidaCarga };
                graficos.parent = { perdidaCarga };
            };

            const inicializarModulos = () => {
                onMounted(() => {
                    graficos.inicializarGrafico();
                });
            };

            const realizarCalculosIniciales = () => {
                actualizarTodosLosModulos();
            };

            const actualizarTodosLosModulos = () => {
                perdidaCarga.caudal = caudalEntrada.qLlenado;
                perdidaCarga.configuracion.diametroConexion = perdidaCarga.configuracion.diametroConexion || '1 pulg';
                perdidaCarga.cargaDisponible = cargaDisponible.cargaDisponibleTotal;
                analisisDiametros.caudal = caudalEntrada.qLlenado;
                analisisDiametros.dia_availableHead = cargaDisponible.cargaDisponibleTotal;
                perdidaCarga.actualizar();
                analisisDiametros.dia_updateCalculations();
                graficos.actualizarCruz();
            };

            const toggleMode = () => {
                mode.value = mode.value === 'edit' ? 'vista' : 'edit';
            };

            const exportarDatos = () => {
                return {
                    caudalEntrada: {
                        volumenCisterna: caudalEntrada.volumenCisterna,
                        tiempoLlenado: caudalEntrada.tiempoLlenado,
                        qLlenado: caudalEntrada.qLlenado
                    },
                    cargaDisponible: {
                        datos: cargaDisponible.datos,
                        nivelIngresoCist: cargaDisponible.nivelIngresoCist,
                        cargaTotal: cargaDisponible.cargaDisponibleTotal
                    },
                    perdidaCarga: {
                        configuracion: perdidaCarga.configuracion,
                        accesorios: perdidaCarga.accesorios,
                        perdidaTotal: perdidaCarga.perdidaTotalCarga,
                        viable: perdidaCarga.esSistemaViable
                    },
                    analisisDiametros: {
                        dia_configuracion: analisisDiametros.dia_configuracion,
                        dia_accesorios: analisisDiametros.dia_accesorios
                    }
                };
            };

            const validarSistemaCompleto = () => {
                const validaciones = {
                    caudalEntrada: caudalEntrada.validar(),
                    cargaDisponible: cargaDisponible.validar(),
                    perdidaCarga: perdidaCarga.validar(),
                    analisisDiametros: analisisDiametros.dia_validar()
                };
                const erroresGenerales = [];
                const advertencias = [];
                Object.values(validaciones).forEach(validacion => {
                    erroresGenerales.push(...validacion.errores);
                    if (validacion.advertencias) {
                        advertencias.push(...validacion.advertencias);
                    }
                });
                return {
                    valido: erroresGenerales.length === 0,
                    errores: erroresGenerales,
                    advertencias,
                    detalles: validaciones
                };
            };

            onMounted(() => {
                init();
                setTimeout(() => graficos.inicializarGrafico(), 300);
            });

            return {
                mode,
                config,
                caudalEntrada,
                cargaDisponible,
                perdidaCarga,
                analisisTuberias,
                analisisDiametros,
                graficos,
                toggleMode,
                exportarDatos,
                validarSistemaCompleto
            };
        },
        template: `
        <div class="max-w-full mx-auto p-4">
            <!-- Header Principal -->
            <header class="bg-white/80 backdrop-blur-lg border-b border-slate-200/60 shadow-lg sticky top-12 z-50">
                <div class="max-w-7xl mx-auto px-6 py-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <div class="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg">
                                <i class="fas fa-water text-white text-lg"></i>
                            </div>
                            <div>
                                <h1 class="text-2xl font-bold text-slate-800">3. CALCULO DE LA RED DE ALIMENTACION</h1>
                                <p class="text-sm text-slate-600">Cálculo de consumo de agua</p>
                            </div>
                        </div>
                       
                        <div class="flex items-center space-x-3">
                            <div class="flex items-center space-x-2">
                                <span class="text-sm text-slate-600">Modo:</span>
                                <button @click="toggleMode"
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
           
            <main class="max-w-full mx-auto px-2 py-4 space-y-6">
                <!-- 3.1 Caudal de Entrada -->
                <div class="bg-white rounded-lg shadow-md border border-gray-200">
                    <div class="bg-gray-100 px-4 py-3 border-b">
                        <h2 class="text-lg font-semibold text-gray-800">3.1. CAUDAL DE ENTRADA</h2>
                    </div>
                    <div class="p-6">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-gray-700">Volumen de la Cisterna</label>
                                <div class="flex items-center space-x-2">
                                  <input
                                    type="number"
                                    :value="caudalEntrada.volumenCisterna.toFixed(2)"
                                    class="flex-1 px-3 py-2 bg-yellow-100 border-2 border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-medium"
                                    step="0.001"
                                    disabled>
                                    <span class="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-2 rounded">L</span>
                                </div>
                            </div>
                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-gray-700">Tiempo de Llenado</label>
                                <div class="flex items-center space-x-2">
                                    <input type="number" v-model.number="caudalEntrada.tiempoLlenado"
                                        @input="caudalEntrada.actualizar()"
                                        class="flex-1 px-3 py-2 bg-yellow-100 border-2 border-yellow-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 font-medium"
                                        step="0.1">
                                    <span class="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-2 rounded">hrs</span>
                                </div>
                            </div>
                            <div class="space-y-2">
                                <label class="block text-sm font-medium text-gray-700">Q llenado</label>
                                <div class="flex items-center space-x-2">
                                    <input type="text" :value="caudalEntrada.qLlenado" readonly
                                        class="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-800 font-bold">
                                    <span class="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-2 rounded">L/s</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 3.2 Carga Disponible -->
                <div class="bg-white rounded-lg shadow-md border border-gray-200">
                    <div class="bg-gray-100 px-4 py-3 border-b">
                        <h2 class="text-lg font-semibold text-gray-800">3.2. CARGA DISPONIBLE</h2>
                    </div>
                    <div class="p-6 space-y-6">
                        <div>
                            <h3 class="font-medium text-gray-700 mb-4 text-center bg-blue-50 py-2 rounded">Datos de la
                                FACTIBILIDAD DE SERVICIO</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <!-- Nivel de Terreno -->
                                <div class="space-y-2">
                                    <label class="block text-sm font-medium text-gray-700">Nivel del terreno donde la
                                        cnx.</label>
                                    <div class="flex items-center space-x-2">
                                        <input type="number" v-model.number="cargaDisponible.datos.nivelTerreno"
                                            @input="cargaDisponible.actualizar()"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <span
                                            class="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-2 rounded">m</span>
                                    </div>
                                </div>
                                <!-- Nivel de Tubería Conexión -->
                                <div class="space-y-2">
                                    <label class="block text-sm font-medium text-gray-700">Nivel de la tubería de
                                        cnx.</label>
                                    <div class="flex items-center space-x-2">
                                        <input type="text" :value="cargaDisponible.nivelTuberiaConexion" readonly
                                            class="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-800 font-bold">
                                        <span
                                            class="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-2 rounded">m</span>
                                    </div>
                                </div>
                                <!-- Nivel de Ingreso a Cisterna -->
                                <div class="space-y-2">
                                    <label class="block text-sm font-medium text-gray-700">Nivel de tubería ingreso a
                                        cist.</label>
                                    <div class="flex items-center space-x-2">
                                        <input type="text" :value="cargaDisponible.nivelIngresoCist" readonly
                                            class="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-800 font-bold">
                                        <span
                                            class="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-2 rounded">m</span>
                                    </div>
                                </div>
                                <!-- Altura Estática -->
                                <div class="space-y-2">
                                    <label class="block text-sm font-medium text-gray-700">Presión en la CONEXIÓN
                                        PÚBLICA</label>
                                    <div class="flex items-center space-x-2">
                                        <input type="number" v-model.number="cargaDisponible.datos.presionConexion"
                                            @input="cargaDisponible.actualizar()"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <span
                                            class="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-2 rounded">m</span>
                                    </div>
                                </div>
                                <div class="space-y-2">
                                    <label class="block text-sm font-medium text-gray-700">Presión de salida en tub. de
                                        ingreso</label>
                                    <div class="flex items-center space-x-2">
                                        <input type="number" v-model.number="cargaDisponible.datos.presionSalida"
                                            @input="cargaDisponible.actualizar()"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <span
                                            class="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-2 rounded">m</span>
                                    </div>
                                </div>
                                <div class="space-y-2">
                                    <label class="block text-sm font-medium text-gray-700">Altura estática entre tub.
                                        red pública y la cist</label>
                                    <div class="flex items-center space-x-2">
                                        <input type="text" :value="cargaDisponible.alturaEstatica" readonly
                                            class="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-800 font-bold">
                                        <span
                                            class="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-2 rounded">m</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
                            <div class="flex items-center justify-between">
                                <span class="font-semibold text-gray-700">Carga Disponible (Hd 1)</span>
                                <span class="text-xl font-bold text-blue-600"
                                    v-text="cargaDisponible.cargaDisponibleTotal + ' m'"></span>
                            </div>
                        </div>
                    </div>
                </div>
               
                <!-- 3.3 Pérdida de Carga -->
                <div class="bg-white rounded-lg shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg">
                    <div class="bg-gradient-to-r from-gray-100 to-gray-200 px-6 py-4 border-b border-gray-300">
                        <h2 class="text-xl font-bold text-gray-800 tracking-tight">3.3. PÉRDIDA DE CARGA: TRAMO RED PÚBLICA - MEDIDOR</h2>
                    </div>
                   
                    <div class="p-8 space-y-8">
                        <!-- Controles Principales -->
                        <div class="bg-white p-6 rounded-xl shadow-md border border-gray-200 space-y-4">
                            <!-- Primera fila de controles -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <!-- Diámetro de la Conexión Domiciliaria -->
                                <div class="space-y-2">
                                    <select v-model="perdidaCarga.configuracion.diametroConexion"
                                            @change="perdidaCarga.actualizar()"
                                            class="w-full px-4 py-2 bg-blue-50 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 transition">
                                        <option v-for="(val, key) in config.diametros" :key="key" :value="key">{{ key }}</option>
                                    </select>
                                </div>
                                <!-- Presencia MICROMEDIDOR -->
                                <div class="space-y-2">
                                    <label class="block text-sm font-semibold text-gray-700">Presencia de Micromedidor</label>
                                    <select v-model="perdidaCarga.configuracion.micromedidor"
                                            @change="perdidaCarga.actualizar()"
                                            class="w-full px-4 py-2 bg-yellow-50 border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-700 transition">
                                        <option value="SI">SÍ</option>
                                        <option value="NO">NO</option>
                                    </select>
                                </div>
                            </div>
                            <!-- Segunda fila de controles -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <!-- Longitud tubería -->
                                <div class="space-y-2">
                                    <label class="block text-sm font-semibold text-gray-700">Longitud de la Tubería (m)</label>
                                    <div class="flex items-center gap-2">
                                        <input type="number" v-model.number="perdidaCarga.configuracion.longitudTuberia"
                                            @input="perdidaCarga.actualizar()"
                                            step="0.01" min="0"
                                            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 transition">
                                        <span class="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">m</span>
                                    </div>
                                </div>
                               
                                <!-- Hf medidor -->
                                <div class="space-y-2">
                                    <label class="block text-sm font-semibold text-gray-700">Hf medidor (m)</label>
                                    <div class="flex items-center gap-2">
                                        <input type="number" v-model.number="perdidaCarga.configuracion.hfMedidor"
                                            @input="perdidaCarga.actualizar()"
                                            class="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 transition-all duration-200"
                                            step="0.01" min="0">
                                        <span class="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">m</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Tabla de Accesorios -->
                        <div class="space-y-4">
                            <h3 class="text-lg font-semibold text-gray-800">Accesorios y Cálculos</h3>
                            <div class="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                                <table class="min-w-full divide-y divide-gray-200">
                                    <thead class="bg-blue-600 to-indigo-600 text-white text-sm font-semibold">
                                        <tr>
                                            <th rowspan="2" class="px-6 py-3 text-center">q (L/s)</th>
                                            <th rowspan="2" class="px-6 py-3 text-center">Diámetro</th>
                                            <th rowspan="2" class="px-6 py-3 text-center">V (m/s)</th>
                                            <th colspan="4" class="px-6 py-3 text-center">L accesorios</th>
                                            <th rowspan="2" class="px-6 py-3 text-center">L tubería (m)</th>
                                            <th rowspan="2" class="px-6 py-3 text-center">L total (m)</th>
                                            <th rowspan="2" class="px-6 py-3 text-center">S (m/m)</th>
                                            <th rowspan="2" class="px-6 py-3 text-center">hf (m)</th>
                                        </tr>
                                        <tr class="bg-gradient-to-r from-blue-700 to-indigo-700">
                                            <th class="px-6 py-3 text-center">Accesorio</th>
                                            <th class="px-6 py-3 text-center">#</th>
                                            <th class="px-6 py-3 text-center">Leq</th>
                                            <th class="px-6 py-3 text-center">Leq.T</th>
                                        </tr>
                                    </thead>
                                    <tbody class="bg-white divide-y divide-gray-100 text-sm text-gray-800">
                                        <tr v-for="(accesorio, idx) in perdidaCarga.accesorios" :key="idx" class="hover:bg-gray-50 transition-all duration-200">
                                            <template v-if="idx === 0">
                                                <td rowspan="6" class="px-6 py-3 align-top font-semibold text-blue-600 text-center"
                                                    v-text="perdidaCarga.caudal + ' L/s'"></td>
                                            </template>
                                            <template v-if="idx === 0">
                                                <td rowspan="6" class="px-6 py-3 align-top font-semibold text-center"
                                                    v-text="perdidaCarga.configuracion.diametroConexion"></td>
                                            </template>
                                            <template v-if="idx === 0">
                                                <td rowspan="6" class="px-6 py-3 align-top font-semibold text-green-600 text-center"
                                                    v-text="perdidaCarga.velocidad + ' m/s'"></td>
                                            </template>
                                            <td class="px-6 py-3">
                                                <select v-model="accesorio.tipo"
                                                        @change="perdidaCarga.actualizarLeqAccesorio(accesorio)"
                                                        class="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                                                    <option value="">Seleccione</option>
                                                    <option v-for="item in config.accesoriosDisponibles" :key="item.key" :value="item.key">{{ item.label }}</option>
                                                </select>
                                            </td>
                                            <td class="px-6 py-3">
                                                <input type="number" min="0" step="1" v-model.number="accesorio.cantidad"
                                                    @input="perdidaCarga.actualizar()"
                                                    class="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                                            </td>
                                            <td class="px-6 py-3 text-center" v-text="accesorio.leq.toFixed(3)"></td>
                                            <td class="px-6 py-3 text-center font-semibold"
                                                v-text="(accesorio.cantidad * accesorio.leq).toFixed(3)"></td>
                                            <template v-if="idx === 0">
                                                <td rowspan="6" class="px-6 py-3 align-top font-semibold text-center"
                                                    v-text="perdidaCarga.configuracion.longitudTuberia + ' m'"></td>
                                            </template>
                                            <template v-if="idx === 0">
                                                <td rowspan="6" class="px-6 py-3 align-top font-semibold text-purple-600 text-center"
                                                    v-text="perdidaCarga.longitudTotal + ' m'"></td>
                                            </template>
                                            <template v-if="idx === 0">
                                                <td rowspan="6" class="px-6 py-3 align-top font-mono text-xs text-center"
                                                    v-text="perdidaCarga.pendienteHidraulica"></td>
                                            </template>
                                            <template v-if="idx === 0">
                                                <td rowspan="6" class="px-6 py-3 align-top font-bold text-red-600 text-center"
                                                    v-text="perdidaCarga.perdidaPorFriccion + ' m'"></td>
                                            </template>
                                        </tr>
                                    </tbody>
                                    <tfoot>
                                        <tr class="bg-gray-50 text-sm font-semibold">
                                            <td colspan="6" class="px-6 py-3 text-right">LONGITUD TOTAL EQUIVALENTE (m):</td>
                                            <td class="px-6 py-3 font-bold text-blue-600 text-center"
                                                v-text="perdidaCarga.leqTotal.toFixed(3)"></td>
                                            <td colspan="4"></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                        <!-- Gráfica de Pérdida de Presión -->
                        <div class="bg-gray-50 border-2 border-gray-200 rounded-lg p-6 shadow-sm">
                            <h3 class="font-semibold text-gray-800 mb-4 text-center text-lg">Curva de Pérdida de Presión</h3>
                            <div class="relative">
                                 <div id="perdidaChart" style="width:800px; height:500px; min-height:400px;"></div>
                            </div>
                            <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <!-- Leyenda -->
                                <div class="space-y-2">
                                    <h4 class="font-semibold text-gray-700 mb-2">Leyenda</h4>
                                    <div class="flex items-center space-x-2">
                                        <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <span>15 - 1/2 pulg</span>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <div class="w-3 h-3 bg-orange-500 rounded-full"></div>
                                        <span>20 - 3/4 pulg</span>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <span>25 - 1 pulg</span>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span>32 - 1 1/4 pulg</span>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span>40 - 1 1/2 pulg</span>
                                    </div>
                                    <div class="flex items-center space-x-2">
                                        <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
                                        <span>50 - 2 pulg</span>
                                    </div>
                                </div>
                                <!-- Información del caudal -->
                                <div class="space-y-2">
                                    <div class="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200">
                                        <span class="font-semibold">Q =</span>
                                        <span class="font-bold text-blue-600" v-text="perdidaCarga.caudalM3h + ' m³/h'"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Resultados de cálculos -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div class="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500 shadow-sm transition-all duration-200 hover:shadow-md">
                                <div class="text-sm text-gray-600 mb-2">Carga Disponible</div>
                                <div class="text-xl font-bold text-blue-600"
                                    v-text="cargaDisponible.cargaDisponibleTotal + ' m'">
                                </div>
                            </div>
                            <div class="bg-red-50 p-5 rounded-lg border-l-4 border-red-500 shadow-sm transition-all duration-200 hover:shadow-md">
                                <div class="text-sm text-gray-600 mb-2">Pérdida de Carga en Medidor</div>
                                <div class="text-xl font-bold text-red-600"
                                    v-text="perdidaCarga.configuracion.hfMedidor + ' m'">
                                </div>
                            </div>
                            <div class="bg-green-50 p-5 rounded-lg border-l-4 border-green-500 shadow-sm transition-all duration-200 hover:shadow-md">
                                <div class="text-sm text-gray-600 mb-2">Pérdida de Carga Red - Medidor</div>
                                <div class="text-xl font-bold text-green-600"
                                    v-text="perdidaCarga.perdidaPorFriccion + ' m'"></div>
                            </div>
                        </div>
                        <!-- Sección de Análisis de Tuberías -->
                        <div>
                            <div v-for="(modulo, index) in analisisTuberias.modulos" :key="index" class="mb-4 border p-4">
                                <div class="mb-2">
                                    <label class="block font-semibold">Diámetro:</label>
                                    <select v-model="modulo.config.analisistuberia" @change="analisisTuberias.autocompletarAnalisis(modulo)">
                                        <option value="">Seleccionar</option>
                                        <option>1/2"</option>
                                        <option>3/4"</option>
                                        <option>1"</option>
                                        <option>1 1/4"</option>
                                        <option>1 1/2"</option>
                                        <option>2"</option>
                                        <option>2 1/4"</option>
                                        <option>2 1/2"</option>
                                        <option>3"</option>
                                        <option>4"</option>
                                        <option>6"</option>
                                    </select>
                                </div>
                                <table class="text-sm w-full border mt-2">
                                    <thead class="bg-gray-100">
                                        <tr><th>Descripción</th><th>Leq</th><th></th></tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(fila, i) in modulo.accesorios" :key="i">
                                            <td><input type="text" v-model="fila.descripcion" class="w-full border"/></td>
                                            <td><input type="number" v-model.number="fila.leq" class="w-24 border text-right"/></td>
                                            <td><button @click="analisisTuberias.eliminarFila(modulo, i)">❌</button></td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div class="mt-2 text-sm">
                                    <strong>Leq Total:</strong> <span v-text="modulo.leqTotal.toFixed(3)"></span> m<br>
                                    <strong>Longitud Tubería:</strong>
                                    <input type="number" step="0.01" v-model.number="modulo.config.longitudTuberia" @input="analisisTuberias.actualizarLongitudFinal" class="w-24 border text-right"/>
                                    <br>
                                    <strong>Ltotal:</strong> <span v-text="modulo.longitudTotal.toFixed(2)"></span> m
                                </div>
                            </div>
                            <button @click="analisisTuberias.agregarAnalisis()" class="mt-4 bg-blue-600 text-white px-4 py-2 rounded">+ Añadir análisis</button>
                        </div>
                        <!--Determinamos la perdida de carga total-->
                        <div class="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-6">
                            <!-- Tabla de Pérdida de Carga -->
                            <div class="space-y-4">
                                <h4 class="text-lg font-semibold text-gray-800">Cálculos de Pérdida de Carga</h4>
                                <div class="grid grid-cols-1 lg:grid-cols-2 gap-2">
                                <!-- Información de coeficientes -->
                                <div class="text-sm text-gray-600 space-y-1">
                                    <p>C = 0.0001; Coeficiente de fricción (Flamant)</p>
                                    <p>C = 140 para la ecuación de HW</p>
                                    <p>Determinación de la pérdida de carga total.</p>
                                </div>
                                <!-- Tabla de análisis -->
                                <div class="overflow-x-auto">
                                    <table class="min-w-full bg-white border rounded-lg shadow-sm divide-y divide-gray-200">
                                    <thead class="bg-blue-600 text-white text-sm font-semibold">
                                        <tr>
                                        <th class="px-4 py-3 text-center">Caudal (L/s)</th>
                                        <th class="px-4 py-3 text-center">Ø (mm)</th>
                                        <th class="px-4 py-3 text-center">V (m/s)</th>
                                        <th class="px-4 py-3 text-center">Hf (m)</th>
                                        <th class="px-4 py-3 text-center">Condicional</th>
                                        <th class="px-4 py-3 text-center">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-100 text-sm text-gray-800">
                                        <tr v-for="(row, index) in perdidaCarga.analisisCarga" :key="index" class="hover:bg-gray-50 transition">
                                            <td class="px-2 py-2 text-center" v-text="caudalEntrada.qLlenado.toFixed(2)"></td>
                                            <td class="px-2 py-2">
                                            <input type="number" step="0.1" v-model.number="row.d" @input="perdidaCarga.updateRow(index)"
                                                class="w-full text-center border border-gray-300 rounded px-2 py-1">
                                            </td>
                                            <td class="px-2 py-2 text-center" v-text="((caudalEntrada.qLlenado / 1000) / (Math.PI * Math.pow((row.d / 1000), 2) / 4)).toFixed(2)"></td>
                                            <td class="px-2 py-2 text-center" v-text="(6.1 * 0.0001 * Math.pow((caudalEntrada.qLlenado / 1000), 1.75) / Math.pow((row.d / 1000), 4.75) * analisisTuberias.modulos[index]?.longitudTotal || 0).toFixed(2)"></td>
                                            <td class="px-2 py-2 text-center" v-text="cargaDisponible.cargaDisponibleTotal > (6.1 * 0.0001 * Math.pow((caudalEntrada.qLlenado / 1000), 1.75) / Math.pow((row.d / 1000), 4.75) * analisisTuberias.modulos[index]?.longitudTotal || 0) ? 'SI' : 'NO'"></td>
                                            <td class="px-2 py-2 text-center">
                                            <button @click="perdidaCarga.analisisCarga.splice(index, 1); analisisTuberias.modulos.splice(index, 1)" class="text-red-500 font-bold">×</button>
                                            </td>
                                        </tr>
                                    </tbody>
                                    </table>
                                    <div class="mt-2 text-right">
                                    <button @click="perdidaCarga.agregarFilaAnalisis()"
                                        class="text-blue-600 hover:text-blue-700 text-sm underline font-medium transition duration-200">
                                        + Agregar Fila
                                    </button>
                                    </div>
                                </div>
                                </div>
                                <!-- Resultado final -->
                                <div class="flex flex-col lg:flex-row justify-between gap-4">
                                    <!-- Diámetro de tuberías -->
                                    <div class="flex-1 bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500 shadow-sm">
                                        <div class="text-sm text-gray-600 mb-2">Por lo tanto el diámetro de las tuberías de Alimentación es</div>
                                        <div class="text-xl font-bold text-blue-600" v-text="perdidaCarga.configuracion.diametroConexion"></div>
                                    </div>
                                    <!-- Carga disponible -->
                                    <div class="flex-1 bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500 shadow-sm">
                                        <div class="text-sm text-gray-600 mb-2">Carga Disponible (Hd 2) = </div>
                                        <div class="text-xl font-bold text-blue-600" v-text="perdidaCarga.cargaDisponibleHdTRMD.toFixed(2) + ' m'"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- 3.4. PERDIDA DE CARGA: MEDIDOR - CISTERNA -->
                <div class="bg-white rounded-lg shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg">
                    <div class="bg-gradient-to-r from-gray-100 to-gray-200 px-6 py-4 border-b border-gray-300">
                    <h2 class="text-xl font-bold text-gray-800 tracking-tight">3.4. PERDIDA DE CARGA: MEDIDOR - CISTERNA</h2>
                    </div>
                    <div class="p-8 space-y-8">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Longitud tubería -->
                            <div class="space-y-2">
                                <label class="block text-sm font-semibold text-gray-700">Longitud de la Tubería (m)</label>
                                <div class="flex items-center gap-2">
                                    <input type="number" v-model.number="analisisDiametros.dia_configuracion.dia_longitudTuberia"
                                        @input="analisisDiametros.dia_updateCalculations()"
                                        step="0.01" min="0"
                                        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 transition">
                                    <span class="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">m</span>
                                </div>
                            </div>
                            <div class="space-y-2">
                                <label class="block text-sm font-semibold text-gray-700">Tuberías</label>
                                <select v-model="analisisDiametros.dia_configuracion.dia_selectedDiameter"
                                        @change="analisisDiametros.dia_updateCalculations()"
                                        class="w-full px-4 py-2 bg-blue-50 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 transition">
                                    <option v-for="(val, key) in config.diametros" :key="key" :value="key">{{ key }}</option>
                                </select>
                            </div>
                        </div>
                        <table class="min-w-full divide-y divide-gray-200">
                            <thead class="bg-blue-600 to-indigo-600 text-white text-sm font-semibold">
                                <tr>
                                    <th rowspan="2" class="px-6 py-3 text-center">q (L/s)</th>
                                    <th rowspan="2" class="px-6 py-3 text-center">Diámetro</th>
                                    <th rowspan="2" class="px-6 py-3 text-center">V (m/s)</th>
                                    <th colspan="4" class="px-6 py-3 text-center">L accesorios</th>
                                    <th rowspan="2" class="px-6 py-3 text-center">L tubería (m)</th>
                                    <th rowspan="2" class="px-6 py-3 text-center">L total (m)</th>
                                    <th rowspan="2" class="px-6 py-3 text-center">S (m/m)</th>
                                    <th rowspan="2" class="px-6 py-3 text-center">hf (m)</th>
                                </tr>
                                <tr class="bg-gradient-to-r from-blue-700 to-indigo-700">
                                    <th class="px-6 py-3 text-center">Accesorio</th>
                                    <th class="px-6 py-3 text-center">#</th>
                                    <th class="px-6 py-3 text-center">Leq</th>
                                    <th class="px-6 py-3 text-center">Leq.T</th>
                                </tr>
                            </thead>
                            <tbody class="bg-white divide-y divide-gray-100 text-sm text-gray-800">
                                <tr v-for="(accesorio, idx) in analisisDiametros.dia_accesorios" :key="idx" class="hover:bg-gray-50 transition-all duration-200">
                                    <template v-if="idx === 0">
                                        <td rowspan="6" class="px-6 py-3 align-top font-semibold text-blue-600 text-center"
                                            v-text="caudalEntrada.qLlenado + ' L/s'"></td>
                                    </template>
                                    <template v-if="idx === 0">
                                        <td rowspan="6" class="px-6 py-3 align-top font-semibold text-center"
                                            v-text="analisisDiametros.dia_configuracion.dia_selectedDiameter"></td>
                                    </template>
                                    <template v-if="idx === 0">
                                        <td rowspan="6" class="px-6 py-3 align-top font-semibold text-green-600 text-center"
                                            v-text="analisisDiametros.dia_velocity.toFixed(3) + ' m/s'"></td>
                                    </template>
                                    <td class="px-6 py-3">
                                        <select v-model="accesorio.tipo" @change="analisisDiametros.dia_actualizarLeqAccesorio(accesorio)"
                                                class="w-full border border-gray-200 rounded-lg px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                                            <option value="">Seleccione</option>
                                            <option v-for="item in config.accesoriosDisponibles" :key="item.key" :value="item.key">{{ item.label }}</option>
                                        </select>
                                    </td>
                                    <td class="px-6 py-3">
                                        <input type="number" min="0" step="1" v-model.number="accesorio.cantidad" @input="analisisDiametros.dia_updateCalculations()"
                                            class="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200">
                                    </td>
                                    <td class="px-6 py-3 text-center" v-text="accesorio.leq.toFixed(3)"></td>
                                    <td class="px-6 py-3 text-center font-semibold" v-text="(accesorio.cantidad * accesorio.leq).toFixed(3)"></td>
                                    <template v-if="idx === 0">
                                        <td rowspan="6" class="px-6 py-3 align-top font-semibold text-center"
                                            v-text="analisisDiametros.dia_configuracion.dia_longitudTuberia + ' m'"></td>
                                    </template>
                                    <template v-if="idx === 0">
                                        <td rowspan="6" class="px-6 py-3 align-top font-semibold text-purple-600 text-center"
                                            v-text="analisisDiametros.dia_totalLength + ' m'"></td>
                                    </template>
                                    <template v-if="idx === 0">
                                        <td rowspan="6" class="px-6 py-3 align-top font-mono text-xs text-center"
                                            v-text="analisisDiametros.dia_slope"></td>
                                    </template>
                                    <template v-if="idx === 0">
                                        <td rowspan="6" class="px-6 py-3 align-top font-bold text-red-600 text-center"
                                            v-text="analisisDiametros.dia_headLoss + ' m'"></td>
                                    </template>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr class="bg-gray-50 text-sm font-semibold">
                                    <td colspan="6" class="px-6 py-3 text-right">LONGITUD TOTAL EQUIVALENTE (m):</td>
                                    <td class="px-6 py-3 font-bold text-blue-600 text-center" v-text="analisisDiametros.dia_leqTotal.toFixed(3)"></td>
                                    <td colspan="4"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <!-- Resultado final -->
                    <div class="flex flex-col lg:flex-row justify-between gap-4">
                        <!-- Carga Disponible (Hd 2) -->
                        <div class="flex-1 bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500 shadow-sm">
                            <div class="text-sm text-gray-600 mb-2">Carga Disponible (Hd 2)</div>
                            <div class="text-xl font-bold text-blue-600" v-text="perdidaCarga.cargaDisponibleHdTRMD.toFixed(2) + ' m'"></div>
                        </div>
                        <!-- Perdida de carga entre el Medidor - Cisterna -->
                        <div class="flex-1 bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500 shadow-sm">
                            <div class="text-sm text-gray-600 mb-2">Perdida de carga entre el Medidor - Cisterna</div>
                            <div class="text-xl font-bold text-blue-600" v-text="analisisDiametros.dia_headLoss + ' m'"></div>
                        </div>
                        <!-- Carga Disponible (Hd 3) -->
                        <div class="flex-1 bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500 shadow-sm">
                            <div class="text-sm text-gray-600 mb-2">Carga Disponible (Hd 3)</div>
                            <div class="text-xl font-bold text-blue-600" v-text="analisisDiametros.dia_cargaDisponibleHdTRMD.toFixed(2) + ' m'"></div>
                        </div>
                    </div>
                </div>
                <!-- 3.5. RESULTADOS -->
                <div class="bg-white rounded-lg shadow-md border border-gray-200 transition-all duration-300 hover:shadow-lg">
                    <div class="bg-gradient-to-r from-gray-100 to-gray-200 px-6 py-4 border-b border-gray-300">
                        <h2 class="text-xl font-bold text-gray-800 tracking-tight">3.5. RESULTADOS</h2>
                    </div>
                   
                    <div class="p-8 space-y-8">
                        <div class="flex flex-col lg:flex-row justify-between gap-4">
                            <!-- Q llenado -->
                            <div class="flex-1 bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500 shadow-sm">
                                <div class="text-sm text-gray-600 mb-2">Q llenado </div>
                                <div class="text-xl font-bold text-blue-600" v-text="caudalEntrada.qLlenado.toFixed(2) + ' L/s'"></div>
                            </div>
                            <!-- Diametro (Tramo Red Publica - Medidor) = -->
                            <div class="flex-1 bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500 shadow-sm">
                                <div class="text-sm text-gray-600 mb-2">Diametro (Tramo Red Publica - Medidor) </div>
                                <div class="text-xl font-bold text-blue-600" v-text="perdidaCarga.configuracion.diametroConexion"></div>
                            </div>
                            <!-- Diametro (Medidor - Cisterna) -->
                            <div class="flex-1 bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500 shadow-sm">
                                <div class="text-sm text-gray-600 mb-2">Diametro (Medidor - Cisterna) </div>
                                <div class="text-xl font-bold text-blue-600" v-text="analisisDiametros.dia_configuracion.dia_selectedDiameter"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    `
    };

    const redAlimentacion = document.getElementById('red-alimentacion-content');
    if (!redAlimentacion) {
        console.error('Contenedor Red de Alimentacion no encontrado');
        return;
    }

    createApp(app).mount(redAlimentacion);
}