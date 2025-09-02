import { createApp, ref, onMounted, computed, reactive, nextTick } from 'vue';

// Obtener datos de configuración inicial
const { proyecto, tareas, trabajadores, csrfToken } = window.APP_INIT || {};

const app = createApp({
    setup() {
        // ======================= REACTIVE DATA =======================
        const especialidadActiva = ref('basicos');
        const tablas = ref({});
        const mostrarModalValidacion = ref(false);
        const erroresValidacion = ref([]);

        const configuracion = reactive({
            plazostotal: window.APP_INIT.proyecto.plazo_total ?? 0,
            numeroModulos: 5,
            tipoProyectoGlobal: 'partes'
        });

        // Dos opciones por fila: 'todo' = todo en módulo 1, 'partes' = dividir entre módulos
        const tiposProyecto = [
            { value: 'todo', label: 'Todo' },
            { value: 'partes', label: 'Partes' }
        ];

        const filasBase = [{
            id: 'calculos',
            nombre: 'Cálculos',
            porcentaje: 0,
            diasPlanificados: 10,
            diasEjecutados: 0,
            tipoProyecto: 'partes'
        },
        {
            id: 'md_mc',
            nombre: 'MD y MC',
            porcentaje: 0,
            diasPlanificados: 8,
            diasEjecutados: 0,
            tipoProyecto: 'partes'
        },
        {
            id: 'planeamiento',
            nombre: 'Planeamiento',
            porcentaje: 0,
            diasPlanificados: 12,
            diasEjecutados: 0,
            tipoProyecto: 'partes'
        },
        {
            id: 'metrados',
            nombre: 'Metrados',
            porcentaje: 0,
            diasPlanificados: 15,
            diasEjecutados: 0,
            tipoProyecto: 'partes'
        },
        {
            id: 'eett',
            nombre: 'EE.TT',
            porcentaje: 0,
            diasPlanificados: 20,
            diasEjecutados: 0,
            tipoProyecto: 'partes'
        },
        {
            id: 'anexos',
            nombre: 'Anexos',
            porcentaje: 0,
            diasPlanificados: 5,
            diasEjecutados: 0,
            tipoProyecto: 'partes'
        }
        ];

        const especialidades = reactive([{
            id: 'basicos',
            nombre: 'Básicos',
            datos: JSON.parse(JSON.stringify(filasBase)),
            porcentajeTotal: 0,
            filasCompletadas: 0,
            filasEnProgreso: 0,
            filasConError: 0,
            estado: 'pendiente'
        },
        {
            id: 'toppo',
            nombre: 'Toppo',
            datos: JSON.parse(JSON.stringify(filasBase)),
            porcentajeTotal: 0,
            filasCompletadas: 0,
            filasEnProgreso: 0,
            filasConError: 0,
            estado: 'pendiente'
        },
        {
            id: 'segundo',
            nombre: 'Segundo',
            datos: JSON.parse(JSON.stringify(filasBase)),
            porcentajeTotal: 0,
            filasCompletadas: 0,
            filasEnProgreso: 0,
            filasConError: 0,
            estado: 'pendiente'
        }
        ]);

        // ======================= COMPUTED =======================
        const estadoGeneral = computed(() => {
            const totalEspecialidades = especialidades.length;
            const promedioTotal = especialidades.reduce((sum, esp) => sum + esp.porcentajeTotal,
                0) / totalEspecialidades;

            let texto = 'Pendiente';
            if (promedioTotal >= 100) texto = 'Completado';
            else if (promedioTotal >= 75) texto = 'Avanzado';
            else if (promedioTotal >= 25) texto = 'En Progreso';

            return {
                porcentaje: Math.round(promedioTotal),
                texto: texto
            };
        });

        // ======================= METHODS =======================
        const generarColumnas = (numeroModulos) => {
            const columnasBase = [{
                title: "Actividad",
                field: "nombre",
                frozen: true,
                width: 150,
                headerSort: false,
                cssClass: "font-semibold"
            },
            {
                title: "Porcentaje (%)",
                field: "porcentaje",
                width: 120,
                editor: "number",
                bottomCalc: "sum",
                editorParams: {
                    min: 0,
                    max: 100,
                    step: 1
                },
                formatter: function (cell) {
                    const value = cell.getValue();
                    return `<div class="text-center font-semibold">${value}%</div>`;
                },
                cellEdited: function (cell) {
                    actualizarModulosDesdeTotal(cell);
                }
            },
            {
                title: "Días Planificados",
                field: "diasPlanificados",
                width: 140,
                editor: "number",
                bottomCalc: "sum",
                editorParams: {
                    min: 1,
                    step: 1
                },
                hozAlign: "center"
            },
            {
                title: "Días Ejecutados",
                field: "diasEjecutados",
                width: 140,
                editor: "number",
                bottomCalc: "sum",
                editorParams: {
                    min: 0,
                    step: 1
                },
                hozAlign: "center",
                cellEdited: function (cell) {
                    actualizarStatus(cell);
                }
            },
            {
                title: "Status",
                field: "status",
                width: 120,
                hozAlign: "center",
                formatter: function (cell) {
                    const value = cell.getValue() || 'pendiente';
                    return `<span class="status-badge status-${value}">${value.charAt(0).toUpperCase() + value.slice(1)}</span>`;
                }
            },
            {
                title: "Tipo Proyecto",
                field: "tipoProyecto",
                width: 130,
                editor: "list",
                // Proveer opciones por fila: 'todo' => todo en modulo1, 'partes' => dividir entre módulos
                editorParams: function (cell) {
                    return {
                        values: {
                            'todo': 'Todo',
                            'partes': 'Partes'
                        }
                    };
                },
                cellEdited: function (cell) {
                    redistribuirModulos(cell);
                }
            }
            ];

            // Agregar columnas de módulos dinámicamente
            for (let i = 1; i <= numeroModulos; i++) {
                columnasBase.push({
                    title: `${i}`,
                    field: `modulo${i}`,
                    width: 100,
                    editor: "number",
                    editorParams: {
                        min: 0,
                        max: 100,
                        step: 0.1
                    },
                    hozAlign: "center",
                    headerHozAlign: "center",
                    cssClass: "module-column",
                    formatter: function (cell) {
                        const value = cell.getValue() || 0;
                        return `<div class="text-center font-medium">${parseFloat(value).toFixed(1)}%</div>`;
                    },
                    cellEdited: function (cell) {
                        actualizarTotalDesdeModulos(cell);
                        validarSumaModulos(cell);
                    }
                });
            }

            return columnasBase;
        };

        const prepararDatos = (datos, numeroModulos) => {
            return datos.map(fila => {
                const filaCompleta = {
                    ...fila
                };

                // Inicializar módulos si no existen
                for (let i = 1; i <= numeroModulos; i++) {
                    if (filaCompleta[`modulo${i}`] === undefined || filaCompleta[`modulo${i}`] === null) {
                        filaCompleta[`modulo${i}`] = 0;
                    }
                }

                // Aplicar distribución inicial según tipoProyecto por fila
                const tipo = filaCompleta.tipoProyecto || configuracion.tipoProyectoGlobal || 'partes';
                const total = parseFloat(filaCompleta.porcentaje) || 0;
                if (tipo === 'todo') {
                    filaCompleta.modulo1 = total;
                    for (let i = 2; i <= numeroModulos; i++) filaCompleta[`modulo${i}`] = 0;
                } else {
                    const porModulo = numeroModulos > 0 ? total / numeroModulos : 0;
                    for (let i = 1; i <= numeroModulos; i++) filaCompleta[`modulo${i}`] = porModulo;
                }

                // Calcular status
                filaCompleta.status = calcularStatus(filaCompleta);

                return filaCompleta;
            });
        };

        const calcularStatus = (fila) => {
            const porcentaje = fila.porcentaje || 0;
            const diasEjecutados = fila.diasEjecutados || 0;
            const diasPlanificados = fila.diasPlanificados || 1;

            if (porcentaje >= 100) return 'completado';
            if (diasEjecutados > diasPlanificados && porcentaje < 100) return 'retrasado';
            if (porcentaje > 0) return 'progreso';
            return 'pendiente';
        };

        const actualizarModulosDesdeTotal = (cell) => {
            const tabla = cell.getTable();
            const fila = cell.getRow();
            const datos = fila.getData();
            const porcentajeTotal = parseFloat(cell.getValue()) || 0;
            const tipoProyecto = datos.tipoProyecto || configuracion.tipoProyectoGlobal || 'partes';
            const actualizacion = {};

            if (tipoProyecto === 'todo') {
                // Todo en el primer módulo
                actualizacion.modulo1 = porcentajeTotal;
                for (let i = 2; i <= configuracion.numeroModulos; i++) {
                    actualizacion[`modulo${i}`] = 0;
                }
            } else {
                // Dividir equitativamente entre módulos
                const porcentajePorModulo = configuracion.numeroModulos > 0 ? porcentajeTotal / configuracion.numeroModulos : 0;
                for (let i = 1; i <= configuracion.numeroModulos; i++) {
                    actualizacion[`modulo${i}`] = porcentajePorModulo;
                }
            }

            fila.update(actualizacion);

            actualizarEstadisticasEspecialidad(tabla);
        };

        const actualizarTotalDesdeModulos = (cell) => {
            const tabla = cell.getTable();
            const fila = cell.getRow();
            const datos = fila.getData();

            let totalModulos = 0;
            for (let i = 1; i <= configuracion.numeroModulos; i++) {
                totalModulos += parseFloat(datos[`modulo${i}`]) || 0;
            }

            fila.update({
                porcentaje: Math.round(totalModulos * 100) / 100
            });
            actualizarEstadisticasEspecialidad(tabla);
        };

        const validarSumaModulos = (cell) => {
            const fila = cell.getRow();
            const datos = fila.getData();

            let totalModulos = 0;
            for (let i = 1; i <= configuracion.numeroModulos; i++) {
                totalModulos += parseFloat(datos[`modulo${i}`]) || 0;
            }

            // Aplicar estilos según validación
            const celdas = fila.getCells();
            celdas.forEach(celda => {
                if (celda.getField().startsWith('modulo')) {
                    const elemento = celda.getElement();
                    elemento.classList.remove('error-cell', 'warning-cell', 'success-cell');

                    if (totalModulos > 100) {
                        elemento.classList.add('error-cell');
                    } else if (totalModulos > 90 && totalModulos < 100) {
                        elemento.classList.add('warning-cell');
                    } else if (totalModulos === 100) {
                        elemento.classList.add('success-cell');
                    }
                }
            });
        };

        const redistribuirModulos = (cell) => {
            const fila = cell.getRow();
            const datos = fila.getData();
            const tipoProyecto = cell.getValue() || datos.tipoProyecto || configuracion.tipoProyectoGlobal || 'partes';
            const porcentajeTotal = parseFloat(datos.porcentaje) || 0;
            const actualizacion = {};

            if (tipoProyecto === 'todo') {
                actualizacion.modulo1 = porcentajeTotal;
                for (let i = 2; i <= configuracion.numeroModulos; i++) {
                    actualizacion[`modulo${i}`] = 0;
                }
            } else {
                const porcentajePorModulo = configuracion.numeroModulos > 0 ? porcentajeTotal / configuracion.numeroModulos : 0;
                for (let i = 1; i <= configuracion.numeroModulos; i++) {
                    actualizacion[`modulo${i}`] = porcentajePorModulo;
                }
            }

            // Guardar el tipo elegido en los datos de la fila para independencia
            actualizacion.tipoProyecto = tipoProyecto;
            fila.update(actualizacion);
            actualizarEstadisticasEspecialidad(cell.getTable());
        };

        const actualizarStatus = (cell) => {
            const fila = cell.getRow();
            const datos = fila.getData();
            const nuevoStatus = calcularStatus(datos);

            fila.update({
                status: nuevoStatus
            });
            actualizarEstadisticasEspecialidad(cell.getTable());
        };

        const actualizarEstadisticasEspecialidad = (tabla) => {
            const datos = tabla.getData();
            const especialidadId = tabla.element.id.replace('tabla-', '');
            const especialidad = especialidades.find(e => e.id === especialidadId);

            if (!especialidad) return;

            // Calcular estadísticas
            let porcentajeTotal = 0;
            let filasCompletadas = 0;
            let filasEnProgreso = 0;
            let filasConError = 0;

            datos.forEach(fila => {
                porcentajeTotal += fila.porcentaje || 0;

                const totalModulos = Array.from({
                    length: configuracion.numeroModulos
                }, (_, i) =>
                    parseFloat(fila[`modulo${i + 1}`]) || 0
                ).reduce((sum, val) => sum + val, 0);

                if (totalModulos > 100) {
                    filasConError++;
                } else if (fila.status === 'completado') {
                    filasCompletadas++;
                } else if (fila.status === 'progreso') {
                    filasEnProgreso++;
                }
            });

            especialidad.porcentajeTotal = Math.round(porcentajeTotal / datos.length);
            especialidad.filasCompletadas = filasCompletadas;
            especialidad.filasEnProgreso = filasEnProgreso;
            especialidad.filasConError = filasConError;

            // Determinar estado general
            if (filasConError > 0) {
                especialidad.estado = 'error';
            } else if (especialidad.porcentajeTotal < 50) {
                especialidad.estado = 'warning';
            } else {
                especialidad.estado = 'success';
            }

            // Actualizar datos de la especialidad
            especialidad.datos = datos;
        };

        const inicializarTabla = (especialidad) => {
            nextTick(() => {
                const elementoTabla = document.getElementById(`tabla-${especialidad.id}`);
                if (!elementoTabla) return;

                const datos = prepararDatos(especialidad.datos, configuracion.numeroModulos);
                const columnas = generarColumnas(configuracion.numeroModulos);

                // Destruir tabla existente si existe
                if (tablas.value[especialidad.id]) {
                    tablas.value[especialidad.id].destroy();
                }

                // Crear nueva tabla
                tablas.value[especialidad.id] = new Tabulator(`#tabla-${especialidad.id}`, {
                    data: datos,
                    columns: columnas,
                    layout: "fitDataFill",
                    responsiveLayout: "scroll",
                    height: "auto",
                    movableColumns: true,
                    resizableRows: false,
                    tooltips: true,
                    locale: "es-es",
                    langs: {
                        "es-es": {
                            "data": {
                                "loading": "Cargando...",
                                "error": "Error"
                            }
                        }
                    }
                });

                // Event listeners
                tablas.value[especialidad.id].on("dataChanged", function (data) {
                    actualizarEstadisticasEspecialidad(tablas.value[especialidad.id]);
                });
            });
        };

        const actualizarTablas = () => {
            especialidades.forEach(especialidad => {
                inicializarTabla(especialidad);
            });
        };

        // Mostrar solo las especialidades que correspondan: todas por ahora,
        // pero la vista puede filtrarlas según tipo/proyectos o número de módulos.
        const visibleEspecialidades = computed(() => {
            // Si existen menos de 3 módulos, ocultar especialidades que no correspondan
            // (ejemplo: si numeroModulos == 1 mostrar menos columnas; esto es una heurística)
            if (configuracion.numeroModulos <= 1) {
                return especialidades.slice(0, 1);
            }
            if (configuracion.numeroModulos <= 3) {
                return especialidades.slice(0, 2);
            }
            return especialidades;
        });

        const actualizarTipoProyectoGlobal = () => {
            especialidades.forEach(especialidad => {
                especialidad.datos.forEach(fila => {
                    fila.tipoProyecto = configuracion.tipoProyectoGlobal;
                });
                inicializarTabla(especialidad);
            });
        };

        const validarEspecialidad = (especialidadId) => {
            const especialidad = especialidades.find(e => e.id === especialidadId);
            const tabla = tablas.value[especialidadId];

            if (!tabla) return;

            const datos = tabla.getData();
            const errores = [];

            datos.forEach((fila, index) => {
                let totalModulos = 0;
                for (let i = 1; i <= configuracion.numeroModulos; i++) {
                    totalModulos += parseFloat(fila[`modulo${i}`]) || 0;
                }

                if (totalModulos > 100) {
                    errores.push(
                        `Fila ${index + 1} (${fila.nombre}): La suma de módulos (${totalModulos.toFixed(1)}%) excede el 100%`
                    );
                }

                if (fila.diasEjecutados > fila.diasPlanificados && fila.porcentaje < 100) {
                    errores.push(
                        `Fila ${index + 1} (${fila.nombre}): Días ejecutados exceden los planificados sin completar el 100%`
                    );
                }
            });

            erroresValidacion.value = errores;
            mostrarModalValidacion.value = true;
        };

        const resetearEspecialidad = (especialidadId) => {
            const especialidad = especialidades.find(e => e.id === especialidadId);
            if (especialidad) {
                especialidad.datos = JSON.parse(JSON.stringify(filasBase));
                inicializarTabla(especialidad);
            }
        };

        const exportarCSV = (especialidadId) => {
            const tabla = tablas.value[especialidadId];
            if (tabla) {
                tabla.download("csv", `${especialidadId}_datos.csv`);
            }
        };

        const exportarExcel = (especialidadId) => {
            const tabla = tablas.value[especialidadId];
            if (tabla) {
                tabla.download("xlsx", `${especialidadId}_datos.xlsx`, {
                    sheetName: "Datos"
                });
            }
        };

        const getEstadoColor = (estado) => {
            const colors = {
                'Pendiente': 'text-gray-600',
                'En Progreso': 'text-yellow-600',
                'Avanzado': 'text-blue-600',
                'Completado': 'text-green-600'
            };
            return colors[estado.texto] || 'text-gray-600';
        };

        // ======================= WATCHERS =======================
        // watch(() => configuracion.numeroModulos, () => {
        //     actualizarTablas();
        // });

        // ======================= LIFECYCLE =======================
        onMounted(() => {
            // Inicializar todas las tablas
            setTimeout(() => {
                // inicializar solo las visibles
                visibleEspecialidades.value.forEach(especialidad => {
                    inicializarTabla(especialidad);
                });
            }, 100);
        });

        // ======================= RETURN =======================
        return {
            // Data
            especialidadActiva,
            especialidades,
            configuracion,
            tiposProyecto,
            mostrarModalValidacion,
            erroresValidacion,

            visibleEspecialidades,

            // Computed
            estadoGeneral,

            // Methods
            actualizarTablas,
            actualizarTipoProyectoGlobal,
            validarEspecialidad,
            resetearEspecialidad,
            exportarCSV,
            exportarExcel,
            getEstadoColor
        };
    }
});

app.mount('#appDetallesProyectos');