import { createApp, ref, onMounted, computed, reactive, nextTick, watch } from 'vue';

// =====================================================================================
// 1. CONSTANTS & CONFIGURATION
// =====================================================================================
const DEFAULT_ROWS_BASE = [
    {
        id: 'calculos',
        nombre: 'Cálculos',
        porcentaje: 10,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    },
    {
        id: 'md_mc',
        nombre: 'MD y MC',
        porcentaje: 20,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    },
    {
        id: 'planeamiento',
        nombre: 'Planeamiento',
        porcentaje: 30,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    },
    {
        id: 'metrados',
        nombre: 'Metrados',
        porcentaje: 30,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    },
    {
        id: 'eett',
        nombre: 'EE.TT',
        porcentaje: 5,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    },
    {
        id: 'anexos',
        nombre: 'Anexos',
        porcentaje: 5,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    }
];

const DEFAULT_ROWS_BASE_CAMPO = [
    {
        id: 'informes',
        nombre: 'INFORMES',
        porcentaje: 20,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    },
    {
        id: 'control',
        nombre: 'CONTROL',
        porcentaje: 30,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    },
    {
        id: 'liquidaciones',
        nombre: 'LIQUIDACIONES',
        porcentaje: 30,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    },
    {
        id: 'valorizacion',
        nombre: 'VALORIZACION',
        porcentaje: 10,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    },
    {
        id: 'requerimiento',
        nombre: 'REQUERIMEINTO',
        porcentaje: 10,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    },
];

const DEFAULT_ROWS_BASE_PROCESOS = [
    {
        id: 'mof',
        nombre: 'MOF',
        porcentaje: 20,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    },
    {
        id: 'procesos',
        nombre: 'PROCESOS',
        porcentaje: 60,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    },
    {
        id: 'revisiones',
        nombre: 'REVISIONES ACTIVIDADES ADMINSTRATIVAS ',
        porcentaje: 10,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    },
    {
        id: 'actividad',
        nombre: 'ACTIVIDADES DE APOYO',
        porcentaje: 10,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    },
];

const DEFAULT_ROWS_BASE_ADMINISTRACION = [
    {
        id: 'reuniones',
        nombre: 'REUNION SEMANAL',
        porcentaje: 10,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    },
    {
        id: 'seguimiento_proyecto',
        nombre: 'SEGUIMIENTO DE PROYECTO',
        porcentaje: 20,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    },
    {
        id: 'cotizaciones',
        nombre: 'COTIZACIONES',
        porcentaje: 30,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    },
    {
        id: 'pago',
        nombre: 'PAGO REQUERIMIENTOS',
        porcentaje: 30,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    },
    {
        id: 'balance',
        nombre: 'BALANCE',
        porcentaje: 5,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    },
    {
        id: 'entrega_proyectos',
        nombre: 'ENTREGA DE PROYECTOS',
        porcentaje: 5,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    }
];

const DEFAULT_ROWS_BASE_CONTRATOS = [
    {
        id: 'informes',
        nombre: 'informes de avance  de proyectso - contratato',
        porcentaje: 20,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    },
    {
        id: 'gestiones',
        nombre: 'Gestión de enmiendas y adendas',
        porcentaje: 20,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    },
    {
        id: 'monitoreo',
        nombre: 'Monitoreo de la documentación de cumplimiento',
        porcentaje: 10,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    },
    {
        id: 'seguimiento',
        nombre: 'Seguimiento de pagos y facturación',
        porcentaje: 20,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    },
    {
        id: 'revision',
        nombre: 'Revisión de avances y plazos',
        porcentaje: 20,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    },
];

const DEFAULT_ROWS_BASE_SISTEMAS = [
    {
        id: 'planificacion',
        nombre: 'PLANIFICACION',
        porcentaje: 10,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    },
    {
        id: 'base_datos',
        nombre: 'BASE DE DATOS',
        porcentaje: 20,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    },
    {
        id: 'front_end',
        nombre: 'FRONT END',
        porcentaje: 30,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    },
    {
        id: 'back_end',
        nombre: 'BACK END',
        porcentaje: 30,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    },
    {
        id: 'pruebas_soluciones',
        nombre: 'PRUEBAS Y SOLUCIONES',
        porcentaje: 5,
        diasPlanificados: 0,
        diasEjecutados: 0,
        porcentajeAvance: 0,
        tipoProyecto: 'partes'
    }
];

const DEFAULT_SPECIALTIES = ['Arquitectura', 'Estructuras', 'Electrica', 'Sanitarias', 'Gas', 'Comunicaciones', 'Electromecanica', 'Topografica', 'Contingencia', 'Democilion', 'Estudio de Suelos', 'Costos y Presupuestos', 'campo', 'precesos', 'administracion', 'administracion de contratos', 'sistemas'];

const TIPOS_PROYECTO = [
    { value: 'todo', label: 'Todo' },
    { value: 'partes', label: 'Partes' }
];

// =====================================================================================
// 2. UTILITY FUNCTIONS
// =====================================================================================

/**
 * Parser para datos del servidor
 */
const parseDocumentoProyecto = (documento) => {
    if (!documento) return null;

    try {
        if (typeof documento === 'string') {
            return JSON.parse(documento);
        }
        return documento;
    } catch (error) {
        console.warn('Error parsing documento_proyecto:', error);
        return null;
    }
};

const parseTareas = (tareas) => {
    if (!tareas) return null;

    try {
        if (typeof tareas === 'string') {
            return JSON.parse(tareas);
        }
        return tareas;
    } catch (error) {
        console.warn('Error parsing Tareas:', error);
        return null;
    }
};

const parseEspecialidadesPorcentaje = (data) => {
    if (!data) return [];

    try {
        if (typeof data === 'string') {
            return JSON.parse(data);
        }
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.warn('Error parsing especialidades_porcentaje:', error);
        return [];
    }
};

// =====================================================================================
// 3. DATA PROCESSING & BUSINESS LOGIC
// =====================================================================================

/**
 * Procesamiento de datos iniciales
 */
const createDefaultSpecialty = (name, id_especialidad, index, porcentaje = 0) => {
    // Usar el ID exacto del backend o generar uno temporal
    const finalId = id_especialidad || `esp-${index}`;
    //campo
    let datosDefault;
    if (id_especialidad === 'campo') {
        datosDefault = JSON.parse(JSON.stringify(DEFAULT_ROWS_BASE_CAMPO));
    } else if (id_especialidad === 'procesos') {
        datosDefault = JSON.parse(JSON.stringify(DEFAULT_ROWS_BASE_PROCESOS));
    } else if (id_especialidad === 'administracion') {
        datosDefault = JSON.parse(JSON.stringify(DEFAULT_ROWS_BASE_ADMINISTRACION));
    } else if (id_especialidad === 'administracioncontratos') {
        datosDefault = JSON.parse(JSON.stringify(DEFAULT_ROWS_BASE_CONTRATOS));
    } else if (id_especialidad === 'sistemas') {
        datosDefault = JSON.parse(JSON.stringify(DEFAULT_ROWS_BASE_SISTEMAS));
    } else {
        // 👉 Cualquier otro id_especialidad cae aquí
        datosDefault = JSON.parse(JSON.stringify(DEFAULT_ROWS_BASE));
    }

    return {
        id: finalId,
        nombre: name || `Especialidad ${index + 1}`,
        porcentajeTotal: 0,
        porcentajeAsignado: porcentaje,
        datos: datosDefault,
        estado: 'pendiente',
    };
};

const consolidateActivityData = (specialty, tareasProyectos) => {
    // Validar que tareasProyectos no sea null/undefined
    if (!tareasProyectos || !Array.isArray(tareasProyectos)) {
        return specialty.datos;
    }

    // CORRECCIÓN: Función más estricta para mapear especialidades
    const mapSpecialtyName = (especialidadTarea) => {
        if (!especialidadTarea) return '';

        const especialidadLower = especialidadTarea.toLowerCase().trim();

        // Mapeo exacto y más específico
        const exactMapping = {
            'electrica': 'electrica',
            'electricas': 'electrica',
            'electrico': 'electrica',
            'electrical': 'electrica',
            'sanitaria': 'sanitaria',
            'sanitarias': 'sanitaria',
            'sanitario': 'sanitaria',
            'comunicaciones': 'comunicaciones',
            'comunicacion': 'comunicaciones',
            'gas': 'gas',
            'gases': 'gas',
            'estructuras': 'estructuras',
            'estructura': 'estructuras',
            'estructural': 'estructuras',
            'arquitectura': 'arquitectura',
            'arquitectonico': 'arquitectura',
            'mecanica': 'mecanica',
            'mecanicas': 'mecanica',
            'mecanico': 'mecanica'
        };

        // SOLO buscar mapeo exacto - NO coincidencias parciales
        return exactMapping[especialidadLower] || especialidadLower;
    };

    // CORRECCIÓN: Obtener el ID exacto de la especialidad actual
    const specialtyId = specialty.id.toLowerCase(); // electrica, sanitaria, etc.

    //console.log(`[${specialty.nombre}] Filtrando tareas para especialidad ID: "${specialtyId}"`);

    // CORRECCIÓN: Filtrado más estricto - solo tareas que coincidan exactamente
    const specialtyTasks = tareasProyectos.filter(tarea => {
        const tareaEspecialidad = mapSpecialtyName(tarea.especialidad || '');

        // SOLO coincidencia exacta con el ID de la especialidad
        const matches = tareaEspecialidad === specialtyId;

        if (matches) {
            //console.log(`[${specialty.nombre}] ✅ Tarea asignada: ${tarea.nameActividad} (${tarea.especialidad} -> ${tareaEspecialidad})`);
        }

        return matches;
    });

    //console.log(`[${specialty.nombre}] Total tareas encontradas: ${specialtyTasks.length}`);

    // El resto del código permanece igual...
    const consolidationMaps = {
        diasEjecutados: {},
        diasPlanificados: {},
        porcentajeAprobadas: {},
        tareasCount: {},
        tareasAprobadas: {},
        detallesTareas: {}
    };

    specialtyTasks.forEach(tarea => {
        const activityId = mapActivityNameToId(tarea.nameActividad);

        // Inicializar mapas para esta actividad si no existen
        Object.keys(consolidationMaps).forEach(key => {
            if (!consolidationMaps[key][activityId]) {
                consolidationMaps[key][activityId] = key === 'detallesTareas' ? [] : 0;
            }
        });

        // Consolidar días ejecutados y planificados (para todas las tareas)
        consolidationMaps.diasEjecutados[activityId] += parseInt(tarea.elapsed_time) || 0;
        consolidationMaps.diasPlanificados[activityId] += parseInt(tarea.diasAsignados) || 0;
        consolidationMaps.tareasCount[activityId]++;

        // SOLO consolidar porcentajes de tareas APROBADAS
        if (tarea.status === 'approved' || tarea.status === 'done') {
            const porcentajeTarea = parseFloat(tarea.porcentajeTarea) || 0;
            consolidationMaps.porcentajeAprobadas[activityId] += porcentajeTarea;
            consolidationMaps.tareasAprobadas[activityId]++;
        }

        // Guardar detalles para debugging
        consolidationMaps.detallesTareas[activityId].push({
            actividadId: tarea.actividadId,
            cantidad: tarea.cantidad,
            elapsed_time: tarea.elapsed_time || 0,
            diasAsignados: tarea.diasAsignados || 0,
            porcentajeTarea: parseFloat(tarea.porcentajeTarea) || 0,
            status: tarea.status,
            fecha: tarea.fecha,
            usuario_designado: tarea.usuario_designado
        });
    });

    // Actualizar los datos de la especialidad
    const updatedDatos = specialty.datos.map(actividad => {
        const activityId = actividad.id;
        const diasEjecutadosExtra = consolidationMaps.diasEjecutados[activityId] || 0;
        const diasPlanificadosExtra = consolidationMaps.diasPlanificados[activityId] || 0;
        const porcentajeAprobadas = consolidationMaps.porcentajeAprobadas[activityId] || 0;
        const cantidadTareas = consolidationMaps.tareasCount[activityId] || 0;
        const tareasAprobadas = consolidationMaps.tareasAprobadas[activityId] || 0;

        // Valores base + valores de tareas
        const totalDiasPlanificados = (actividad.diasPlanificados || 0) + diasPlanificadosExtra;
        const totalDiasEjecutados = (actividad.diasEjecutados || 0) + diasEjecutadosExtra;

        const actividadActualizada = {
            ...actividad,
            diasPlanificados: totalDiasPlanificados,
            diasEjecutados: totalDiasEjecutados,
            porcentajeAvance: Math.min(100, porcentajeAprobadas),

            // Métricas adicionales
            cantidadTareasAsignadas: cantidadTareas,
            cantidadTareasAprobadas: tareasAprobadas,
            porcentajeAprobacion: cantidadTareas > 0
                ? Math.round((tareasAprobadas / cantidadTareas) * 100)
                : 0,

            // Información de consolidación para debug
            _consolidationInfo: {
                diasEjecutadosOriginales: actividad.diasEjecutados || 0,
                diasPlanificadosOriginales: actividad.diasPlanificados || 0,
                diasEjecutadosExtra,
                diasPlanificadosExtra,
                porcentajeAprobadas,
                tareasCount: cantidadTareas,
                tareasAprobadas: tareasAprobadas,
                detallesTareas: consolidationMaps.detallesTareas[activityId] || []
            }
        };
        return actividadActualizada;
    });

    return updatedDatos;
};

const mapActivityNameToId = (nameActividad) => {
    // Limpiar el nombre de la actividad
    const cleanName = (nameActividad || '').trim();

    // Mapeo directo de nombres conocidos
    const directMapping = {
        'Cálculos': 'calculos',
        'MD y MC': 'md_mc',
        'Planeamiento': 'planeamiento',
        'Metrados': 'metrados',
        'EE.TT': 'eett',
        'Anexos': 'anexos',
        'documentoProyecto': 'anexos', // Mapear documentoProyecto a anexos
        'INFORMES': 'informes',
        'CONTROL': 'control',
        'LIQUIDACIONES': 'liquidaciones',
        'VALORIZACION': 'valorizacion',
        'REQUERIMEINTO': 'requerimiento',
        'MOF': 'mof',
        'PROCESOS': 'procesos',
        'REVISIONES ACTIVIDADES ADMINSTRATIVAS': 'revisiones',
        'ACTIVIDADES DE APOYO': 'actividad',
        'REUNION SEMANAL': 'reuniones',
        'SEGUIMIENTO DE PROYECTO': 'seguimiento_proyecto',
        'COTIZACIONES': 'cotizaciones',
        'PAGO REQUERIMIENTOS': 'pago',
        'BALANCE': 'balance',
        'ENTREGA DE PROYECTOS': 'entrega_proyectos',
        'informes': 'informes de avance  de proyectso - contratato',
        'gestiones': 'Gestión de enmiendas y adendas',
        'monitoreo': 'Monitoreo de la documentación de cumplimiento',
        'seguimiento': 'Seguimiento de pagos y facturación',
        'revision': 'Revisión de avances y plazos',
        'PLANIFICACION': 'planificacion',
        'BASE DE DATOS': 'base_datos',
        'FRONT END': 'front_end',
        'BACK END': 'back_end',
        'PRUEBAS Y SOLUCIONES': 'pruebas_soluciones',
    };

    // Si hay mapeo directo, usarlo
    if (directMapping[cleanName]) {
        return directMapping[cleanName];
    }

    // Mapeo por coincidencias parciales para casos complejos
    const partialMapping = [
        { pattern: /plano|comunicacion/i, id: 'anexos' },
        { pattern: /metrado/i, id: 'metrados' },
        { pattern: /calculo/i, id: 'calculos' },
        { pattern: /md|mc/i, id: 'md_mc' },
        { pattern: /planea/i, id: 'planeamiento' },
        { pattern: /ee\.?tt|especif/i, id: 'eett' }
    ];

    for (const mapping of partialMapping) {
        if (mapping.pattern.test(cleanName)) {
            return mapping.id;
        }
    }

    // Fallback: convertir a formato estándar
    const fallbackId = cleanName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');

    //console.warn(`Actividad no mapeada: "${cleanName}" -> "${fallbackId}"`);
    return fallbackId || 'sin_clasificar';
};

const recalculateSpecialtyStats = (specialty, updatedDatos) => {
    // Recalcular estadísticas de especialidad
    let filasCompletadas = 0;
    let filasEnProgreso = 0;
    let filasConError = 0;
    let filasExcedidas = 0;
    let totalDiasPlanificados = 0;
    let totalDiasEjecutados = 0;
    let sumaPorcentajes = 0; // NUEVO

    updatedDatos.forEach(actividad => {
        totalDiasPlanificados += actividad.diasPlanificados || 0;
        totalDiasEjecutados += actividad.diasEjecutados || 0;
        // Sum the porcentajeAvance (computed from approved tasks) for the specialty total
        sumaPorcentajes += actividad.porcentajeAvance || 0; // NUEVO

        if ((actividad.porcentajeAvance || 0) >= 100) {
            filasCompletadas++;
        } else if ((actividad.porcentajeAvance || 0) > 0) {
            filasEnProgreso++;
        }
    });

    // Determinar estado general
    // NUEVO: Determinar estado basado en suma de porcentajes
    let estado = 'pendiente';
    if (sumaPorcentajes >= 400) { // 100% * 4 actividades
        estado = 'completado';
    } else if (sumaPorcentajes >= 300) {
        estado = 'avanzado';
    } else if (sumaPorcentajes > 0) {
        estado = 'en_progreso';
    }

    return {
        ...specialty,
        datos: updatedDatos,
        porcentajeAvance: Math.round(sumaPorcentajes), // NUEVO: suma total
        filasCompletadas,
        filasEnProgreso,
        filasConError,
        filasExcedidas,
        estado,
        totalDiasPlanificados,
        totalDiasEjecutados
    };
};

// =====================================================================================
// 4. TABLE MANAGEMENT (TABULATOR)
// =====================================================================================

/**
 * Configuración de columnas
 */
const generarColumnasBase = (numeroModulos) => [
    {
        title: "Actividad",
        field: "nombre",
        frozen: true,
        minWidth: 160,
        headerSort: false,
        cssClass: "font-semibold",
        hozAlign: "left",
    },
    {
        title: "Porc. (%)",
        field: "porcentaje",
        frozen: true,
        minWidth: 100,
        hozAlign: "center",
        bottomCalc: "sum",
        headerTooltip: "Porcentaje Total",
        editor: "number",
        editorParams: { min: 0, max: 100, step: 1 },
        formatter: (cell) => {
            const value = cell.getValue() || 0;
            return `<div class="text-center font-semibold">${value}%</div>`;
        },
        cellEdited: (cell) => actualizarModulosDesdeTotal(cell, numeroModulos),
    },
    {
        title: "Días Planif.",
        field: "diasPlanificados",
        frozen: true,
        minWidth: 110,
        editor: "number",
        bottomCalc: "sum",
        hozAlign: "center",
        headerTooltip: "Días Planificados",
        editorParams: { min: 1, step: 1 },
    },
    {
        title: "Días Ejec.",
        field: "diasEjecutados",
        frozen: true,
        minWidth: 110,
        editor: "number",
        bottomCalc: "sum",
        hozAlign: "center",
        headerTooltip: "Días Ejecutados",
        editorParams: { min: 0, step: 1 },
        cellEdited: (cell) => actualizarStatus(cell),
    },
    {
        title: "% Avance",
        field: "porcentajeAvance",
        frozen: true,
        minWidth: 80,
        bottomCalc: "sum",
        hozAlign: "center",
        headerTooltip: "Porcentaje Avance",
    },
    {
        title: "Tipo Proy.",
        field: "tipoProyecto",
        frozen: true,
        minWidth: 110,
        hozAlign: "center",
        headerTooltip: "Tipo de Proyecto",
        editor: "list",
        editorParams: {
            values: { todo: "Todo", partes: "Partes" },
        },
        cellEdited: (cell) => redistribuirModulos(cell, numeroModulos),
        formatter: function (cell) {
            cell.getElement().style.backgroundColor = "yellow";
            return cell.getValue();
        },
    },
];

const generarColumnasModulos = (numeroModulos) => {
    const columnas = [];
    for (let i = 0; i <= numeroModulos; i++) {
        columnas.push({
            title: `Mód. ${i}`,
            field: `modulo${i}`,
            minWidth: 90,
            hozAlign: "center",
            headerHozAlign: "center",
            headerTooltip: `Módulo ${i}`,
            cssClass: "module-column",
            editor: "number",
            editorParams: { min: 0, max: 100, step: 0.1 },
            formatter: (cell) => {
                const value = cell.getValue() || 0;
                return `<div class="text-center font-medium">${parseFloat(value).toFixed(1)}%</div>`;
            },
            cellEdited: (cell) => {
                actualizarTotalDesdeModulos(cell);
                validarSumaModulos(cell);
            },
        });
    }
    return columnas;
};

const generarColumnas = (numeroModulos) => [
    ...generarColumnasBase(numeroModulos),
    ...generarColumnasModulos(numeroModulos),
];

/**
 * Preparación de datos para tablas
 */
const prepararFila = (fila, numeroModulos) => {
    const nuevaFila = {
        id: fila.id,
        nombre: fila.nombre,
        porcentaje: fila.porcentaje ?? 0,
        diasPlanificados: fila.diasPlanificados ?? 0,
        diasEjecutados: fila.diasEjecutados ?? 0,
        porcentajeAvance: fila.porcentajeAvance ?? 0,
        tipoProyecto: fila.tipoProyecto ?? "partes",
    };

    for (let i = 0; i <= numeroModulos; i++) {
        nuevaFila[`modulo${i}`] = fila[`modulo${i}`] ?? 0;
    }

    return nuevaFila;
};

//const prepararDatos = (datos, numeroModulos) => (datos || []).map((fila) => prepararFila(fila, numeroModulos));

const inicializarModulosAutomatico = (fila, numeroModulos) => {
    const tipoProyecto = fila.tipoProyecto || 'partes';
    const porcentajeTotal = parseFloat(fila.porcentaje) || 0;
    const actualizacion = { ...fila };

    if (tipoProyecto === 'todo') {
        actualizacion.modulo0 = porcentajeTotal;
        for (let i = 1; i <= numeroModulos; i++) {
            actualizacion[`modulo${i}`] = 0;
        }
    } else {
        const totalModulesCount = numeroModulos + 1;
        const porcentajePorModulo = totalModulesCount > 0 ?
            porcentajeTotal / totalModulesCount : 0;

        for (let i = 0; i <= numeroModulos; i++) {
            actualizacion[`modulo${i}`] = porcentajePorModulo;
        }
    }

    return actualizacion;
};

const prepararDatosConModulos = (datos, numeroModulos) => {
    return (datos || []).map((fila) => {
        const nuevaFila = prepararFila(fila, numeroModulos);
        return inicializarModulosAutomatico(nuevaFila, numeroModulos);
    });
};

/**
 * Gestión de tablas
 */
const inicializarTabla = (especialidad, tablas, configuracion) => {
    nextTick(() => {
        const elementoTabla = document.getElementById(`tabla-${especialidad.id}`);
        if (!elementoTabla) {
            console.warn(`Elemento de tabla no encontrado: tabla-${especialidad.id}`);
            return;
        }

        if (tablas.value[especialidad.id]) {
            tablas.value[especialidad.id].destroy();
            delete tablas.value[especialidad.id];
        }
        const datos = prepararDatosConModulos(especialidad.datos, configuracion.numeroModulos);
        //const datos = prepararDatos(especialidad.datos, configuracion.numeroModulos);
        const columnas = generarColumnas(configuracion.numeroModulos);

        try {
            const tabla = new Tabulator(`#tabla-${especialidad.id}`, {
                data: datos,
                columns: columnas,
                layout: "fitColumns",
                height: "auto",
                tooltips: true,
                movableColumns: true,
                resizableRows: false,
                columnMinWidth: 90,
                locale: "es-es",
                langs: {
                    "es-es": {
                        data: { loading: "Cargando...", error: "Error" },
                    },
                },
            });

            tablas.value[especialidad.id] = tabla;
            tabla.on("dataChanged", () => {
                actualizarEstadisticasEspecialidad(tabla, especialidad);
            });

            actualizarEstadisticasEspecialidad(tabla, especialidad);


        } catch (error) {
            console.error(`Error inicializando tabla ${especialidad.id}:`, error);
        }
    });
};
// =====================================================================================
// 5. TABLE EVENT HANDLERS
// =====================================================================================

/**
 * Validaciones en tiempo real
 */
const validarSumaModulos = (cell) => {
    // Validar que la suma de módulos no exceda 100%
};

/**
 * Actualizaciones automáticas
 */
const actualizarModulosDesdeTotal = (cell, numeroModulos) => {
    // Actualizar módulos cuando cambia el total
    const tabla = cell.getTable();
    const fila = cell.getRow();
    const datos = fila.getData();
    const porcentajeTotal = parseFloat(cell.getValue()) || 0;
    const tipoProyecto = datos.tipoProyecto || 'partes';
    const actualizacion = {};

    const totalModulesCount = numeroModulos + 1; // include modulo0

    if (tipoProyecto === 'todo') {
        actualizacion.modulo0 = porcentajeTotal;
        for (let i = 1; i <= numeroModulos; i++) {
            actualizacion[`modulo${i}`] = 0;
        }
    } else {
        const porcentajePorModulo = totalModulesCount > 0 ?
            porcentajeTotal / totalModulesCount : 0;
        for (let i = 0; i <= numeroModulos; i++) {
            actualizacion[`modulo${i}`] = porcentajePorModulo;
        }
    }

    fila.update(actualizacion);
    //actualizarEstadisticasEspecialidad(tabla);
};

const redistribuirModulos = (cell, numeroModulos) => {
    // Redistribuir porcentajes entre módulos
    const fila = cell.getRow();
    const datos = fila.getData();
    const tipoProyecto = cell.getValue() || 'partes';
    const porcentajeTotal = parseFloat(datos.porcentaje) || 0;
    const actualizacion = { tipoProyecto };

    const totalModulesCount = numeroModulos + 1;
    if (tipoProyecto === 'todo') {
        actualizacion.modulo0 = porcentajeTotal;
        for (let i = 1; i <= numeroModulos; i++) {
            actualizacion[`modulo${i}`] = 0;
        }
    } else {
        const porcentajePorModulo = totalModulesCount > 0 ? porcentajeTotal / totalModulesCount : 0;
        for (let i = 0; i <= numeroModulos; i++) {
            actualizacion[`modulo${i}`] = porcentajePorModulo;
        }
    }

    fila.update(actualizacion);
};

// =====================================================================================
// 6. SPECIALTY MANAGEMENT
// =====================================================================================
const initializeSpecialties = (configuracion) => {
    configuracion = configuracion || {};

    // Parsear datos del servidor y tareas
    const documentoProyecto = parseDocumentoProyecto(configuracion.documento_proyecto);
    const tareasProyectos = parseTareas(configuracion.tareas || []);

    // Log detallado de las tareas por especialidad (para debugging)
    if (tareasProyectos && Array.isArray(tareasProyectos)) {
        const tareasPorEspecialidad = tareasProyectos.reduce((acc, tarea) => {
            const esp = tarea.especialidad || 'sin_especialidad';
            if (!acc[esp]) acc[esp] = [];
            acc[esp].push({
                nombre: tarea.nameActividad,
                diasAsignados: tarea.diasAsignados,
                elapsed_time: tarea.elapsed_time,
                status: tarea.status
            });
            return acc;
        }, {});

        //console.log('Tareas por especialidad:', tareasPorEspecialidad);
    }

    // CASO 1: Si tenemos datos del backend con porcentajes asignados (configuración inicial)
    if (Array.isArray(configuracion.especialidades_porcentaje) && configuracion.especialidades_porcentaje.length > 0) {
        //console.log('Inicializando con especialidades_porcentaje:', configuracion.especialidades_porcentaje);

        return configuracion.especialidades_porcentaje.map((esp, index) => {
            // CORRECCIÓN: Usar el ID exacto que viene del backend
            const id_especialidad = esp.id; // electrica, sanitaria, comunicaciones, gas, estructuras
            const name = esp.nombre || id_especialidad; // Si no hay nombre, usar el ID

            //console.log(`Creando especialidad: ${name} con ID: ${id_especialidad}`);

            // Crear base con el porcentaje asignado y el ID exacto
            const baseSpecialty = createDefaultSpecialty(name, id_especialidad, index, esp.porcentaje);

            // Si tenemos documento_proyecto guardado previamente, usar esos datos
            let datosFinales = baseSpecialty.datos;
            if (Array.isArray(documentoProyecto) && documentoProyecto.length > index) {
                const savedData = documentoProyecto[index];
                if (savedData && Array.isArray(savedData.datos) && savedData.datos.length > 0) {
                    datosFinales = savedData.datos;
                    baseSpecialty.porcentajeTotal = savedData.porcentajeTotal || baseSpecialty.porcentajeTotal;
                    baseSpecialty.filasCompletadas = savedData.filasCompletadas || baseSpecialty.filasCompletadas;
                    baseSpecialty.filasEnProgreso = savedData.filasEnProgreso || baseSpecialty.filasEnProgreso;
                    baseSpecialty.filasConError = savedData.filasConError || baseSpecialty.filasConError;
                    baseSpecialty.filasExcedidas = savedData.filasExcedidas || baseSpecialty.filasExcedidas;
                    baseSpecialty.estado = savedData.estado || baseSpecialty.estado;
                }
            }

            // Consolidar con tareas del proyecto usando el ID exacto
            const updatedDatos = consolidateActivityData({ ...baseSpecialty, datos: datosFinales }, tareasProyectos);

            // Recalcular estadísticas
            const resultado = recalculateSpecialtyStats({ ...baseSpecialty, datos: datosFinales }, updatedDatos);

            //console.log(`Especialidad ${resultado.nombre} inicializada con ${resultado.datos.length} actividades`);

            return resultado;
        });
    }

    // CASO 2: Si tenemos datos guardados del servidor (documento_proyecto)
    if (Array.isArray(documentoProyecto) && documentoProyecto.length > 0) {
        return documentoProyecto.map((specialty, index) => {
            // CORRECCIÓN: Usar el ID exacto guardado sin transformaciones
            const baseSpecialty = {
                id: specialty.id, // Mantener el ID original exacto
                nombre: specialty.nombre || specialty.id, // Usar nombre si existe, sino el ID
                datos: Array.isArray(specialty.datos) && specialty.datos.length > 0
                    ? specialty.datos
                    : JSON.parse(JSON.stringify(DEFAULT_ROWS_BASE)),
                porcentajeTotal: specialty.porcentajeTotal || 0,
                porcentajeAsignado: specialty.porcentajeAsignado || 0,
                filasCompletadas: specialty.filasCompletadas || 0,
                filasEnProgreso: specialty.filasEnProgreso || 0,
                filasConError: specialty.filasConError || 0,
                filasExcedidas: specialty.filasExcedidas || 0,
                estado: specialty.estado || 'pendiente'
            };

            //console.log(`Cargando especialidad guardada: ${baseSpecialty.nombre} (ID: ${baseSpecialty.id})`);

            // Consolidar con las tareas del proyecto
            const updatedDatos = consolidateActivityData(baseSpecialty, tareasProyectos);

            // Recalcular estadísticas
            return recalculateSpecialtyStats(baseSpecialty, updatedDatos);
        });
    }

    // CASO 3: Especialidades por defecto (fallback)
    const especialidadesPorDefecto = [
        { id: 'arquitectura', nombre: 'Arquitectura' },
        { id: 'estructuras', nombre: 'Estructuras' },
        { id: 'electrica', nombre: 'Eléctrica' },
        { id: 'sanitaria', nombre: 'Sanitaria' }, // CORRECCIÓN: sanitaria (singular)
        { id: 'gas', nombre: 'Gas' },
        { id: 'mecanica', nombre: 'Mecánica' } // CORRECCIÓN: mecanica (singular)
    ];

    // Usar especialidades de configuración si están disponibles, si no usar por defecto
    const specialtiesToCreate = Array.isArray(configuracion.especialidades) && configuracion.especialidades.length > 0
        ? configuracion.especialidades.map((name, index) => ({
            id: generateSafeId(name, index),
            nombre: name
        }))
        : especialidadesPorDefecto;

    return specialtiesToCreate.map((spec, index) => {
        //console.log(`Creando especialidad por defecto: ${spec.nombre} (ID: ${spec.id})`);

        // Crear especialidad por defecto con ID consistente
        const defaultSpecialty = createDefaultSpecialty(spec.nombre, spec.id, index, 0);

        // Consolidar con tareas del proyecto
        const updatedDatos = consolidateActivityData(defaultSpecialty, tareasProyectos);

        // Recalcular estadísticas
        return recalculateSpecialtyStats(defaultSpecialty, updatedDatos);
    });
};
/**
 * Actualización de especialidades
 */
const actualizarEstadisticasEspecialidad = (tabla, especialidades) => {
    // Actualizar estadísticas de una especialidad
    const datos = tabla.getData();

    const especialidadId = tabla.element.id.replace('tabla-', '');
    const especialidad = (especialidades.id === especialidadId);

    if (!especialidad) return;

    // Calcular estadísticas
    let sumaPorcentajes = 0; // NUEVO
    let filasCompletadas = 0;
    let filasEnProgreso = 0;
    let filasConError = 0;
    let filasBonificacion = 0;
    let filasExcedidas = 0;

    datos.forEach(fila => {
        // Use porcentajeAvance (the % Avance column) for the specialty total shown in the UI
        sumaPorcentajes += fila.porcentajeAvance || 0; // NUEVO: sumar porcentajeAvance

        if ((fila.porcentajeAvance || 0) >= 100) {
            filasCompletadas++;
        } else if ((fila.porcentajeAvance || 0) > 0) {
            filasEnProgreso++;
        }
    });

    // Prepare new state
    const nuevoEstado = (sumaPorcentajes >= 400) ? 'completado' : (sumaPorcentajes >= 300) ? 'avanzado' : (sumaPorcentajes > 0) ? 'en_progreso' : 'pendiente';

    const updated = {
        porcentajeTotal: Math.round(sumaPorcentajes), // NUEVO
        filasCompletadas,
        filasEnProgreso,
        filasConError,
        filasBonificacion: filasBonificacion || 0,
        filasExcedidas: filasExcedidas || 0,
        estado: nuevoEstado,
        datos
    };

    // Use Object.assign to ensure Vue detects the changes on the reactive object
    Object.assign(especialidad, updated);
    // compat con la vista actual que puede usar esp.porcentajeTotalEspeciliad
    try {
        especialidad.porcentajeTotalEspeciliad = Math.round(sumaPorcentajes * 100) / 100;
    } catch (e) {
        // no crítico
    }

    // Forzar recomputo de computed que dependen de estos valores
    try {
        if (typeof forceComputedUpdate === 'function') forceComputedUpdate();
    } catch (e) {
        // ignore
    }
};
// =====================================================================================
// 7. VALIDATION & ERROR HANDLING
// =====================================================================================

/**
 * Validaciones
 */
const validarEspecialidad = (especialidadId) => {
    const tabla = tablas.value[especialidadId];
    if (!tabla) return;

    const datos = tabla.getData();
    const errores = [];

    datos.forEach((fila, index) => {
        // sumar desde modulo0 hasta moduloN inclusive
        let totalModulos = 0;
        for (let i = 0; i <= configuracion.numeroModulos; i++) {
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

// =====================================================================================
// 8. UI HELPERS & UTILITIES
// =====================================================================================

/**
 * Helpers de UI
 */
const getEstadoColor = (estado) => {
    // Obtener color CSS para estado
};
// =====================================================================================
// 10. VUE COMPOSITION API SETUP
// =====================================================================================

const { proyecto, tareas, trabajadores, csrfToken } = window.APP_INIT || {};

const app = createApp({
    setup() {
        // ======================= REACTIVE STATE =======================
        const especialidadActiva = ref('');
        const tablas = ref({});
        const mostrarModalValidacion = ref(false);
        const erroresValidacion = ref([]);
        const isLoading = ref(true);
        const triggerUpdate = ref(0);

        const configuracion = reactive({
            documento_proyecto: window.APP_INIT.proyecto.documento_proyecto || null,
            porcentaje_total_Proyecto: window.APP_INIT.proyecto.porcentaje_total ?? 0,
            especialidades_porcentaje: parseEspecialidadesPorcentaje(window.APP_INIT.proyecto.especialidades_porcentaje),
            plazostotal: window.APP_INIT.proyecto.plazo_total ?? 0,
            numeroModulos: window.APP_INIT.proyecto.cantidad_modulos ?? 0,
            especialidades: window.APP_INIT?.proyecto?.especialidades ?? [],
            tareas: window.APP_INIT?.tareas ?? [],
            tipoProyectoGlobal: 'partes'
        });
        const especialidades = reactive(initializeSpecialties(configuracion));
        // ======================= COMPUTED PROPERTIES =======================

        const visibleEspecialidades = computed(() => especialidades);

        // ======================= COMPUTED PROPERTIES MEJORADOS =======================

        // 1. COMPUTED CORREGIDO PARA PORCENTAJE GENERAL
        const porcentajeCalculado = ref(null);
        const porcentajeGeneralProyecto = computed(() => {
            const especialidades = especialidadesConPorcentaje.value || [];
            if (especialidades.length === 0) return 0;

            let sumaProductos = 0;

            especialidades.forEach((esp, index) => {
                const avance = parseFloat(esp.porcentajeAvance) || 0;
                const peso = parseFloat(esp.porcentajeAsignado) || 0;
                const producto = avance * peso;

                // 🔎 Log de cada especialidad
                // console.log(
                //     `Especialidad ${index + 1}: Avance=${avance}, Peso=${peso}, Avance*Peso=${producto}`
                // );

                sumaProductos += producto;
            });

            const n = especialidades.length;
            const resultado = (sumaProductos) / 100;

            // 🔎 Log de la fórmula completa
            // console.log(`Formula: ((${sumaProductos}) / ${n}) / 100`);
            // console.log(`Resultado final: ${resultado}`);

            return Math.round(resultado * 100) / 100;
        });

        const diasTotalesProyecto = computed(() => {
            const especialidades = especialidadesConPorcentaje.value || [];
            if (especialidades.length === 0) {
                return { planificados: 0, ejecutados: 0 };
            }

            let totalPlanificados = 0;
            let totalEjecutados = 0;

            especialidades.forEach(esp => {
                totalPlanificados += parseFloat(esp.totalDiasPlanificados) || 0;
                totalEjecutados += parseFloat(esp.totalDiasEjecutados) || 0;
            });

            return {
                planificados: totalPlanificados,
                ejecutados: totalEjecutados
            };
        });

        const estadoGeneral = computed(() => {
            const porcentaje = porcentajeGeneralProyecto.value;

            let texto = 'Pendiente';
            if (porcentaje >= 100) texto = 'Completado';
            else if (porcentaje >= 75) texto = 'Avanzado';
            else if (porcentaje >= 25) texto = 'En Progreso';

            return {
                porcentaje: porcentaje,
                texto: texto
            };
        });

        const especialidadesConPorcentaje = computed(() => {
            triggerUpdate.value;

            return especialidades.map(esp => {
                const tabla = tablas.value[esp.id];
                let datos = esp.datos;

                if (tabla) {
                    try {
                        datos = tabla.getData();
                    } catch (error) {
                        console.warn(`Error obteniendo datos de tabla ${esp.id}:`, error);
                    }
                }

                const totalPorcentaje = datos.reduce((sum, actividad) => {
                    return sum + (parseFloat(actividad.porcentajeAvance) || 0);
                }, 0);

                return {
                    ...esp,
                    porcentajeAvance: Math.round(totalPorcentaje * 100) / 100
                };
            });
        });

        // =====================================================================================
        // SERVER COMMUNICATION
        // =====================================================================================
        const guardarDocumento = async () => {
            try {
                // Construir payload de especialidades con datos actualizados
                const payload = especialidades.map(especialidad => {
                    const tabla = tablas.value[especialidad.id];
                    return {
                        ...especialidad,
                        datos: tabla ? tabla.getData() : especialidad.datos
                    };
                });


                // Extraer valores globales
                const porcentajeTotal = porcentajeGeneralProyecto.value || 0;
                const diasPlanificados = diasTotalesProyecto.value.planificados || 0;
                const diasEjecutados = diasTotalesProyecto.value.ejecutados || 0;
                const estado = estadoGeneral.value.texto;

                // 🚀 payload final que enviarás al backend
                // const payload = {
                //     id_proyecto: proyecto.id,
                //     documento_proyecto: JSON.stringify(payloadEspecialidades),
                //     plazo_total_pro: configuracion.plazostotal || 0,
                //     porcentaje_total_pro: porcentajeTotal,
                //     dias_planificados_pro: diasPlanificados,
                //     dias_ejecutados_pro: diasEjecutados,
                //     estado_general_pro: estado
                // };

                const token = csrfToken || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

                const response = await fetch('/proyecto/actualizardata', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': token
                    },
                    body: JSON.stringify({
                        id_proyecto: proyecto.id,
                        documento_proyecto: JSON.stringify(payload),
                        plazo_total_pro: diasPlanificados || 0,
                        porcentaje_total_pro: porcentajeTotal || 0,
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                return true;
            } catch (error) {
                console.error('Error guardando documento_proyecto:', error);
                return false;
            }
        };

        // ======================= METHODS =======================
        const forceComputedUpdate = () => {
            triggerUpdate.value++;
        };

        // ======================= LIFECYCLE =======================
        onMounted(() => {
            // Inicialización cuando el componente está montado
            setTimeout(() => {
                isLoading.value = false;
                visibleEspecialidades.value.forEach((especialidad, index) => {
                    setTimeout(() => {
                        inicializarTabla(especialidad, tablas, configuracion);
                    }, index * 100); // Stagger la inicialización
                });
            }, 200);
        });

        // ======================= RETURN =======================
        return {
            // Reactive State
            especialidades,
            configuracion,
            mostrarModalValidacion,
            erroresValidacion,
            isLoading,

            // Computed
            estadoGeneral,
            visibleEspecialidades,
            porcentajeGeneralProyecto,
            diasTotalesProyecto,

            // Methods - Table Management
            //actualizarTablas,
            inicializarTabla,

            // Methods - Validation
            validarEspecialidad,

            // Methods - Server
            guardarDocumento,

            // Methods - UI Helpers
            getEstadoColor,
            forceComputedUpdate
        };
    }
});

// =====================================================================================
// 11. APP INITIALIZATION
// =====================================================================================
app.mount('#appDetallesProyectos');