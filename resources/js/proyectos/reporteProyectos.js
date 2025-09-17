import { createApp, ref, onMounted, computed, reactive, nextTick, watch, onUnmounted } from 'vue';

const { paquetes } = window.APP_INIT || {};

// ====== CONFIGURACIONES DE GRÁFICOS ======
const CHART_CONFIGS = {
    // Configuración base compartida
    base: {
        backgroundColor: '#f8f9fa',
        fontFamily: 'Arial, sans-serif',
        colors: {
            primary: '#3CC1CF',
            secondary: '#485463',
            success: '#28a745',
            warning: '#FFA500',
            info: '#00BFFF',
            gray: '#999999',
            dark: '#646E7A'
        }
    },

    // Configuración específica para gráfico de resumen
    resumen: (data) => ({
        type: 'ring',
        height: '6%',
        width: '100%',
        y: '0%',
        x: '0%',
        title: {
            text: `RESUMEN DEL ${data.proyecto?.nombre_proyecto || 'PROYECTO'}`,
            align: 'center',
            fontFamily: 'Arial',
            backgroundColor: '#485463',
            fontColor: '#3CC1CF',
            fontSize: '25px',
            fontWeight: 'bold',
            padding: '8px',
        },
        plot: {
            tooltip: {
                align: 'center',
                alpha: 0.75,
                backgroundColor: '#000',
                borderRadius: '4px',
                borderWidth: '0px',
                callout: true,
                fontColor: '#fff',
                fontSize: '11px',
                fontWeight: 'bold',
                padding: '5 10 10 5',
            },
            valueBox: {
                decimals: 0,
                fontColor: '#D83B01',
                fontSize: '11px',
                fontWeight: 'normal',
                placement: 'out',
            },
            animation: {
                effect: 3,
                method: 0,
                speed: 300,
                sequence: 1,
            },
            borderWidth: 1,
            detach: false,
            slice: '60%',
        },
        plotarea: {
            margin: '60 0 0 0',
        },
        scale: {
            x: '12.5%',
            y: '20%',
            offsetX: '15%',
            offsetY: '20%',
            sizeFactor: 1.2,
        },
        scaleR: {
            aperture: 180,
            refAngle: 180,
        },
        labels: [
            {
                borderBottom: '1px solid #EDEDED',
                width: '100%',
                x: '5px',
                y: '38px',
            },
            // Información del proyecto
            {
                text: 'JEFE ENCARGADO: ',
                align: 'left',
                fontFamily: 'Arial',
                fontColor: '#485463',
                fontSize: '20px',
                fontWeight: 'normal',
                x: '2%',
                y: '30%',
            },
            {
                text: data.jefe || '',
                align: 'left',
                fontFamily: 'Arial',
                fontColor: '#485463',
                fontSize: '20px',
                fontWeight: 'bold',
                x: '5%',
                y: '38%',
            },
            {
                text: 'EMPRESA:',
                fontFamily: 'Arial',
                align: 'left',
                fontColor: '#485463',
                fontSize: '20px',
                fontWeight: 'normal',
                x: '2%',
                y: '50%',
            },
            {
                text: data.empresa || '',
                align: 'left',
                fontColor: '#485463',
                fontFamily: 'Arial',
                fontSize: '20px',
                fontWeight: 'bold',
                x: '5%',
                y: '58%',
            },
            {
                text: 'FECHA: ',
                align: 'left',
                fontFamily: 'Arial',
                fontColor: '#485463',
                fontSize: '20px',
                fontWeight: 'normal',
                x: '2%',
                y: '70%',
            },
            {
                text: data.fecha || new Date().toLocaleDateString(),
                align: 'left',
                fontFamily: 'Arial',
                fontColor: '#485463',
                fontSize: '20px',
                fontWeight: 'bold',
                x: '5%',
                y: '78%',
            },
            // Título del gráfico
            {
                text: `PORCENTAJE TOTAL <br> DEL PROYECTO ${data.proyecto?.nombre_proyecto || ''}`,
                align: 'center',
                fontFamily: 'Arial',
                fontColor: '#646E7A',
                fontSize: '12px',
                fontWeight: 'bold',
                x: '50%',
                y: '80%',
            },
            // Métricas financieras
            {
                text: `S/: ${data.montoPresupuestado.toFixed(2)}`,
                align: 'center',
                fontColor: '#3cc1cf',
                fontSize: '30px',
                fontWeight: 'bold',
                x: '80%',
                y: '25%',
            },
            {
                text: 'Monto Presupuestado (S/:)',
                align: 'center',
                fontColor: '#646E7A',
                fontSize: '12px',
                fontWeight: 'bold',
                x: '83%',
                y: '35%',
            },
            {
                text: `S/: ${data.montoInvertido.toFixed(2)}`,
                align: 'center',
                fontColor: '#3cc1cf',
                fontSize: '30px',
                fontWeight: 'bold',
                x: '80%',
                y: '40%',
            },
            {
                text: 'Monto Invertido (S/:)',
                align: 'center',
                fontColor: '#646E7A',
                fontSize: '12px',
                fontWeight: 'bold',
                x: '83%',
                y: '50%',
            },
            {
                text: `S/: ${data.gastoPresupuestado.toFixed(2)}`,
                align: 'center',
                fontColor: data.gastoPresupuestado > data.montoPresupuestado ? '#dc3545' : '#28a745',
                fontSize: '30px',
                fontWeight: 'bold',
                x: '80%',
                y: '56%',
            },
            {
                text: 'Gasto Presupuestado (S/:)',
                align: 'center',
                fontColor: '#646E7A',
                fontSize: '12px',
                fontWeight: 'bold',
                x: '83%',
                y: '67%',
            },
            {
                text: `${data.totalDias} Días`,
                align: 'center',
                fontColor: '#3cc1cf',
                fontSize: '36px',
                fontWeight: 'bold',
                x: '83%',
                y: '72%',
            },
            {
                text: 'Total de días ejecutado',
                align: 'center',
                fontColor: '#646E7A',
                fontSize: '12px',
                fontWeight: 'bold',
                x: '83%',
                y: '85%',
            },
        ],
        series: [
            {
                values: [data.porcentajeAvance],
                tooltip: {
                    text: '<span style="font-size:16px;color:#3CC1CF;">●</span> AVANCE %node-value%%',
                },
                valueBox: {
                    text: 'AVANCE %node-value%%',
                    fontColor: '#3CC1CF',
                    fontWeight: 'bold',
                },
                backgroundColor: '#3CC1CF',
            },
            {
                values: [data.porcentajeRestante],
                tooltip: {
                    text: '<span style="font-size:16px;color:#999999;">●</span> RESTANTE %node-value%%',
                },
                valueBox: {
                    text: 'RESTANTE %node-value%%',
                    fontColor: '#999999',
                    fontWeight: 'bold',
                },
                backgroundColor: '#999999',
            }
        ],
    }),

    resumenManoObra: (proAnterior) => ({
        type: 'null',
        backgroundColor: '#fbfcf7',
        borderColor: '#384653',
        borderRadius: '4px',
        borderWidth: '1px',
        height: '3%',
        //width: '30%',
        width: '45%',
        x: '2%',
        y: '6%',
        title: {
            text: 'MANO DE OBRA',
            backgroundColor: 'none',
            fontColor: '#384653',
            fontSize: '20px',
            height: '50px',
            textAlign: 'center',
        },
        subtitle: {
            text: `MONTO INVERTIDO \\nS/: ${proAnterior.toFixed(2)}`,
            bold: true,
            fontColor: '#3CC1CF',
            fontSize: '18px',
            height: '20px',
            paddingTop: '50%',
            textAlign: 'center',
        },
    }),

    resumenRequerimientos: (data) => {
        return {
            type: 'null',
            backgroundColor: '#fbfcf7',
            borderColor: '#384653',
            borderRadius: '4px',
            borderWidth: '1px',
            height: '3%',
            //width: '30%',
            width: '45%',
            //x: '68%',
            x: '53%',
            y: '6%',
            title: {
                text: 'REQUERIMIENTOS',
                backgroundColor: 'none',
                fontColor: '#384653',
                fontSize: '20',
                height: '50px',
                textAlign: 'center',
            },
            subtitle: {
                text: 'MONTO EMITIDO EN REQUERIMIENTOS \\nS/:' + data,
                bold: true,
                fontColor: '#3CC1CF',
                fontSize: '18',
                height: '10px',
                paddingTop: '50%',
                textAlign: 'center',
            },
        }
    },

    resumengeneral: (data) => ({
        type: 'null',
        backgroundColor: '#fbfcf7',
        borderColor: '#384653',
        borderRadius: '4px',
        borderWidth: '1px',
        height: '3%',
        width: '96%',
        x: '2%',
        y: '9.2%',
        title: {
            text: 'RESULTADO / PROYECTO',
            backgroundColor: 'none',
            fontColor: '#384653',
            fontSize: '20px',
            height: '70px',
            textAlign: 'center',
        },
        subtitle: {
            text: `Presupuestos S/: ${data.totalmonto} - Gastos Generales S/: ${data.sumaTotalGastototal} = Utilidad S/: ${data.ganpro.toFixed(2)}
                    (Gastos S/: ${data.sumaTotalGastototal} / Presupuestos S/: ${data.totalmonto}) x 100 = ${data.porcentaje_utilidad}%`,
            bold: true,
            fontColor: '#3CC1CF',
            fontSize: '18px',
            height: '40px',
            paddingTop: '90%',
            textAlign: 'center',
        },
        labels: [{
            text: '',
            backgroundColor: '#28a745',
            borderColor: '#000',
            borderWidth: 1,
            height: 40,
            width: 40,
            x: '65%', // Ajusta esta posición según sea necesario
            y: '10%', // Ajusta esta posición según sea necesario
            padding: 0,
        }],
    }),

    especialidades: (data) => {
        // Extraer labels y valores de los datos
        const labels = data.map(item => item.nombre || 'Sin nombre');
        const valores = data.map(item => item.porcentajeAvance || 0);

        return {
            type: 'bar',
            backgroundColor: '#f8f9fa', // Usar el valor de bgColorMain o un color por defecto
            height: '6%',
            width: '100%',
            x: '0%',
            y: '13%',
            plotarea: {
                margin: '80 50 80 80', // top right bottom left
            },
            title: {
                text: 'PORCENTAJE TOTAL POR ESPECIALIDAD',
                align: 'left',
                fontColor: '#464646',
                fontSize: '16px',
                fontStyle: 'Arial',
                fontWeight: 'normal',
                fontWeight: 'bold',
                padding: '10 10 10 20',
            },
            legend: {
                backgroundColor: 'none',
                borderWidth: '0px',
                item: {
                    color: '#464646',
                    fontSize: '12px',
                    fontWeight: 'normal',
                },
                layout: '1x',
                margin: 'auto auto 20 auto',
                marker: {
                    type: 'circle',
                    borderWidth: '0px',
                    size: 8,
                },
            },
            plot: {
                tooltip: {
                    align: 'center',
                    alpha: 0.9,
                    backgroundColor: '#000',
                    borderRadius: '4px',
                    borderWidth: '0px',
                    callout: true,
                    fontColor: '#fff',
                    fontSize: '12px',
                    fontWeight: 'normal',
                    padding: '8 12 8 12',
                    text: '%scale-key-text: %node-value%'
                },
                animation: {
                    effect: 1,
                    sequence: 2,
                    speed: 800,
                },
                valueBox: {
                    text: '%node-value%',
                    fontColor: '#464646',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    placement: 'top',
                    offsetY: -10
                },
                backgroundColor: '#3CC1CF',
                borderRadius: '4px'
            },
            scaleX: {
                labels: labels,
                label: {
                    fontColor: '#FFF',
                    backgroundColor: '#2b5f92',
                    fontSize: '14px',
                    alpha: 1,
                    padding: '8px',
                    maxChars: 15, // Limitar caracteres para evitar overflow
                },
                item: {
                    angle: -15, // Inclinar las etiquetas para mejor legibilidad
                    fontSize: '12px',
                    fontColor: '#464646',
                    wrapText: true,
                    maxChars: 20
                },
                tick: {
                    size: 5,
                    lineColor: '#ccc'
                }
            },
            scaleY: {
                values: '0:100:10', // De 0 a 100 con intervalos de 10
                label: {
                    text: 'Porcentaje de Avance (%)',
                    fontColor: '#464646',
                    fontSize: '14px',
                    offsetX: -10
                },
                item: {
                    fontSize: '11px',
                    fontColor: '#666'
                },
                guide: {
                    lineColor: '#e5e5e5',
                    lineStyle: 'solid',
                    alpha: 0.5
                }
            },
            series: [{
                text: 'Avance por Especialidad',
                values: valores,
                backgroundColor: '#3CC1CF',
                borderRadius: '3px',
                tooltip: {
                    text: '<b>%scale-key-text</b><br/>Avance: %node-value%'
                },
                valueBox: {
                    text: '%node-value%',
                    fontColor: '#fff',
                    backgroundColor: '#2b5f92',
                    borderRadius: '3px',
                    padding: '2 4',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    placement: 'top',
                    offsetY: -20   // ajusta altura para que no choque con labels
                }
            }]

        };
    },

    trabajadores: (data) => {
        console.log(data);
        const usuarios = data || [];

        // Calcular totales
        const total_dias = usuarios.reduce((sum, u) => sum + u.diasPasados + u.diasActuales, 0);
        const sumaTotalGasto = usuarios.reduce((sum, u) => sum + u.costoTotal, 0);

        // Construir filas para la tabla
        const seriesData = usuarios.map((u, i) => [
            i + 1,              // #
            u.nombre,           // Personal
            u.diasPasados,      // Tareas acumulados (dias pasados)
            u.diasActuales,     // Días trabajados del mes actual
            u.totalDiasEjecutado,     // Total de Días trabajados
            u.costoTotal.toFixed(2) // Gasto personal
        ]);

        return {
            type: 'grid',
            backgroundColor: '#f8f9fa',
            height: '10%',
            width: '100%',
            x: '0%',
            y: '20%',
            title: {
                text: 'Listado de trabajadores y gastos efectuados por días laborados',
                align: 'center',
                backgroundColor: '#485463',
                fontColor: '#3CC1CF',
                fontSize: '21px',
                fontWeight: 'bold',
                offsetY: '5px',
                padding: '8px',
                width: '100%',
            },
            subtitle: {
                text: `La tabla representa los personales cuyo datos son sobre la cantidad de dias trabajados (${total_dias} Días) y la cantidad de dinero (${sumaTotalGasto.toFixed(2)} Soles) invertido en cada personal <br>para la ejecución del proyecto.`,
                align: 'left',
                flat: true,
                fontColor: '#464646',
                fontSize: '13px',
                fontStyle: 'italic',
                fontWeight: 'normal',
                offsetY: '-40px',
                padding: '70 10 10 20',
            },
            options: {
                colLabels: ['#', 'Personal', 'Tareas <br> Acumulados', 'Días Trabajados <br>(Mes)', 'Total de Días <br>Trabajados', 'Gasto del<br> personal'],
                colWidths: ['5%', '30%', '10%', '10%', '10%', '10%'],
                style: {
                    '.th': {
                        backgroundColor: '#fff',
                        borderRight: '0px solid #fff',
                        borderBottom: '1px solid #aaa',
                        color: '#464646',
                        fontSize: '10px',
                        fontWeight: 'normal',
                        textAlign: 'center'
                    },
                    '.td': {
                        backgroundColor: '#fff',
                        borderRight: '0px solid #fff',
                        borderBottom: '1px solid #aaa',
                        fontWeight: 'normal',
                        color: '#464646',
                        height: '30px',
                        textAlign: 'center'
                    }
                }
            },
            plotarea: {
                margin: '100px 50px 40px 150px'
            },
            series: seriesData.map(row => ({ values: row })),
        };
    },

    resumenProyectos: (data) => {
        // Ya no necesitamos ordenar porque queremos mantener el orden: anterior, actual, total
        const proyectos = [...data];

        // Calcular el total general de todos los proyectos
        const totalGeneral = proyectos.reduce((sum, proyecto) => sum + proyecto.total, 0);

        // Construir las series para la tabla
        const series = proyectos.map((proyecto, index) => {
            // Estilo especial para la fila del total
            const estiloTotal = proyecto.esTotal ? {
                '.td': {
                    fontWeight: 'bold',
                    backgroundColor: '#f0f0f0',
                    borderTop: '2px solid #333'
                }
            } : {};

            return {
                values: [
                    proyecto.esTotal ? '' : index + 1, // Número de fila (vacío para el total)
                    proyecto.nombre, // Nombre del proyecto
                    proyecto.total.toFixed(2) // Total del proyecto
                ],
                style: estiloTotal
            };
        });

        // Calcular altura dinámica basada en número de proyectos
        const alturaDinamica = Math.min(60, Math.max(20, 10 + proyectos.length * 2));

        return {
            type: 'grid',
            backgroundColor: '#f8f9fa',
            height: `${alturaDinamica}%`, // Altura dinámica
            width: '100%',
            x: '0%',
            y: '0%',
            title: {
                text: 'Resumen de Proyectos y Gastos',
                align: 'center',
                backgroundColor: '#485463',
                fontColor: '#3CC1CF',
                fontSize: '18px',
                fontWeight: 'bold',
                offsetY: '5px',
                padding: '8px',
                width: '100%',
            },
            options: {
                colLabels: ['#', 'Proyecto', 'Total (S/.)'],
                colWidths: ['5%', '65%', '30%'], // Ajuste de anchos
                fontSize: '14px',
                style: {
                    '.th': {
                        backgroundColor: '#485463',
                        borderRight: '0px solid #fff',
                        borderBottom: '1px solid #aaa',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        padding: '8px'
                    },
                    '.td': {
                        backgroundColor: '#fff',
                        borderRight: '0px solid #fff',
                        borderBottom: '1px solid #ddd',
                        fontWeight: 'normal',
                        color: '#464646',
                        height: '30px',
                        textAlign: 'center',
                        padding: '5px'
                    },
                    // Estilo para filas impares (mejor legibilidad)
                    '.tr:nth-child(even) .td': {
                        backgroundColor: '#f9f9f9'
                    }
                }
            },
            plotarea: {
                margin: '60px 20px 20px 20px'
            },
            series: series
        }
    },

    presupuestos: (data) => {
        return {
            type: 'hbar',
            backgroundColor: '#f8f9fa',
            height: '5%',
            width: '100%',
            x: '0%',
            y: '45%',
            title: {
                text: `Presupuestos S/:${data.totalmonto} - Gastos Generales S/:${data.sumaTotalGastototal} = Utilidad S/:${data.ganpro.toFixed(2)}`,
                align: 'center',
                backgroundColor: '#485463',
                fontColor: '#3CC1CF',
                fontSize: '21px',
                fontWeight: 'bold',
                offsetY: '5px',
                padding: '8px',
                width: '100%',
            },
            subtitle: {
                text: `(Gastos S/:${data.sumaTotalGastototal} / Presupuestos S/:${data.totalmonto}) x 100 = ${data.porcentaje_utilidad}%`,
                align: 'left',
                flat: true,
                fontColor: '#464646',
                fontSize: '16px',
                fontStyle: 'italic',
                fontWeight: 'bold',
                offsetY: '-50px',
                offsetX: '400px',
                padding: '70 10 10 20',
            },
            plot: {
                tooltip: {
                    borderRadius: '2px',
                    borderWidth: '0px',
                    visible: false,
                },
                valueBox: {
                    text: '%v',
                    fontColor: '#2A2B3A',
                    fontSize: '14px',
                    visible: true,
                },
                animation: {
                    delay: 200,
                    effect: 'ANIMATION_EXPAND_TOP',
                    method: 'ANIMATION_BOUNCE_EASE_OUT',
                    sequence: 'ANIMATION_BY_PLOT_AND_NODE',
                },
                barsSpaceRight: '20px',
                barsSpaceLeft: '20px',
                stacked: true,
            },
            plotarea: {
                marginBottom: '30px',
                marginLeft: '100px',
                marginTop: '70px',
            },
            scaleX: {
                item: {
                    fontColor: '#2A2B3A',
                    fontSize: '14px',
                },
                labels: ['Monto Total'], // Etiqueta general
                lineColor: '#E71D36',
                tick: {
                    visible: false,
                },
            },
            scaleY: {
                guide: {
                    visible: false,
                },
                lineColor: '#2A2B3A',
                tick: {
                    visible: true,
                },
                visible: true, // Habilitar el eje Y
                maxValue: parseFloat(data.totalmonto) * 1.1, // Añadir un margen superior
            },
            series: [
                {
                    values: [parseFloat(data.totalmonto).toFixed(2) - parseFloat(data.sumaTotalGastototal).toFixed(2)], // Presupuesto restante
                    backgroundColor: '#2EC4B6', // Color verde
                    borderRadius: '50px 0px 0px 50px',
                    label: {
                        text: 'Restante',
                        fontColor: '#FFFFFF',
                        offsetY: -10,
                    },
                },
                {
                    values: [parseFloat(data.sumaTotalGastototal)], // Gastos
                    backgroundColor: '#E71D36', // Color rojo
                    borderRadius: '0px 50px 50px 0px',
                    label: {
                        text: 'Gasto Total',
                        fontColor: '#FFFFFF',
                        offsetY: -10,
                    },
                },
            ],
        }
    },

    progresoProyectos: (data) => {
        return {
            type: 'bar',
            backgroundColor: '#f8f9fa',
            height: '11%',
            width: '100%',
            x: '0%',
            y: '50%',
            title: {
                text: 'Progreso del proyecto en días planificados vs ejecutados',
                align: 'center',
                backgroundColor: '#485463',
                fontColor: '#3CC1CF',
                fontSize: '21px',
                fontWeight: 'bold',
                padding: '8px',
                width: '100%',
            },
            plot: {
                animation: {
                    effect: 'ANIMATION_SLIDE_LEFT',
                    sequence: 0,
                    speed: 800
                },
                valueBox: {
                    text: "%v días",   // 👈 label arriba de cada barra
                    placement: "top",
                    fontColor: "#000",
                    fontSize: 14,
                    angle: 0
                }
            },
            plotarea: {
                margin: '80 60 60 100'
            },
            scaleX: {
                labels: ["Plazo Planificado", "Días Ejecutados"], // 👈 label de cada barra
                item: {
                    fontColor: '#333333',
                    fontSize: 14
                }
            },
            scaleY: {
                format: '%v días',
                label: {
                    text: `Días (Planificado: ${data.plazoPlanificado}, Ejecutados: ${data.totalDiasEjecutados})`,
                    fontColor: '#333333',
                    fontSize: 14
                },
                item: {
                    fontColor: '#333333',
                    fontSize: 14
                },
                maxValue: Math.max(data.plazoPlanificado, data.totalDiasEjecutados) * 1.2 // margen
            },
            series: [
                {
                    values: [data.plazoPlanificado],
                    text: 'Plazo Planificado',
                    backgroundColor: '#3CB371'
                },
                {
                    values: [data.totalDiasEjecutados],
                    text: 'Días Ejecutados',
                    backgroundColor: '#1E90FF'
                }
            ]
        }
    },

    porcentajeAvance: (data) => {
        console.log(data)
        return {
            type: 'line',
            backgroundColor: '#f8f9fa',
            height: '6%',
            width: '100%',
            x: '0%',
            y: '59%',
            title: {
                text: 'Porcentaje de Avance de Proyectos en Términos de Días Presupuestados vs Días Ejecutados',
                align: 'center',
                backgroundColor: '#485463',
                fontColor: '#3CC1CF',
                fontSize: '21px',
                fontWeight: 'bold',
                offsetY: '5px',
                padding: '8px',
                width: '100%',
            },
            plot: {
                animation: {
                    effect: 'ANIMATION_SLIDE_LEFT',
                    sequence: 0,
                    speed: 800
                }
            },
            plotarea: {
                x: '10%',
                margin: '60 100 90 90'
            },
            scaleX: {
                title: {
                    text: 'Días'
                }
            },
            scaleY: {
                label: { text: 'Porcentaje' },
                title: {
                    text: 'Porcentaje (%)'
                },
                maxValue: 100
            },
            series: [
                {
                    values: data.porcentajeAvanceEsperado,
                    text: 'Avance Esperado',
                    lineColor: '#3CB371',
                    marker: { backgroundColor: '#3CB371' }
                },
                {
                    values: data.porcentajeAvanceActual,
                    text: 'Avance Actual',
                    lineColor: '#1E90FF',
                    marker: { backgroundColor: '#1E90FF' }
                }
            ]
        }
    },

    gastosEfectuadosEspecialidades: (especialidadData, index, totalEspecialidades) => {
        const nombreEspecialidad = especialidadData.nombre;
        const montoAsignado = especialidadData.montoAsignado;
        const trabajadores = especialidadData.trabajadores;

        // Calcular el monto total ejecutado para la especialidad
        const montoTotalEjecutado = trabajadores.reduce((sum, trabajador) =>
            sum + trabajador.montoEjecutado, 0);

        // Preparar texto con detalles de trabajadores para el tooltip
        const detallesTrabajadores = trabajadores.map(trabajador =>
            `${trabajador.nombre}: S/ ${trabajador.montoEjecutado.toFixed(2)}`
        ).join('<br/>');

        return {
            type: 'hbar',
            backgroundColor: '#FFFFFF',
            height: '8%',
            width: '100%',
            x: '0%',
            y: `${60 + (index * 8.5)}%`,
            plotarea: { margin: 'dynamic' },
            title: {
                text: `Gastos Ejecutados - ${nombreEspecialidad.toUpperCase()}`,
                align: 'center',
                backgroundColor: '#485463',
                fontColor: '#3CC1CF',
                fontSize: '18px',
                fontWeight: 'bold',
                padding: '8px',
                width: '100%',
            },
            plot: {
                tooltip: {
                    text: `Total: S/ %v<br/>${detallesTrabajadores}`
                },
                animation: {
                    delay: 600,
                    effect: 'ANIMATION_FADE_IN',
                    sequence: 'ANIMATION_BY_NODE',
                    speed: 700,
                },
                valueBox: {
                    text: `S/ %v`,
                    fontSize: '12px',
                    fontColor: '#000',
                    placement: 'top-out',
                    offsetX: 0,
                    offsetY: -10,
                },
                stacked: false,
                borderRadius: '3px'
            },
            // Eje X (vertical) - Muestra solo el nombre de la especialidad
            scaleX: {
                visible: true,
                labels: [nombreEspecialidad], // Array con un solo elemento
                item: {
                    fontSize: '14px',
                    angle: 0,
                    fontWeight: 'bold'
                }
            },
            // Eje Y (horizontal) - Montos
            scaleY: {
                format: '%v soles',
                label: { text: 'Presupuesto Total' },
                maxValue: montoAsignado * 1.1, // 10% extra para visualización
                markers: [
                    {
                        type: 'line',
                        range: [montoAsignado, montoAsignado],
                        lineColor: '#FF0000',
                        lineWidth: 2,
                        alpha: 1,
                        lineStyle: 'solid',
                    }
                ]
            },
            series: [
                {
                    values: [montoTotalEjecutado], // Monto total de la especialidad
                    text: nombreEspecialidad,
                    backgroundColor: '#4AC3B9'
                }
            ],
        };
    }
};

// ====== UTILIDADES PARA GRÁFICOS ======
const ChartUtils = {
    // Formatear números a moneda
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(amount);
    },

    // Formatear porcentajes
    formatPercentage: (value) => {
        return `${Math.round(value)}%`;
    },

    // Calcular porcentaje
    calculatePercentage: (part, total) => {
        return total > 0 ? Math.round((part / total) * 100) : 0;
    },

    // Generar colores dinámicamente
    generateColors: (count) => {
        const baseColors = ['#3CC1CF', '#FFA500', '#28a745', '#dc3545', '#6f42c1', '#fd7e14'];
        return Array.from({ length: count }, (_, i) => baseColors[i % baseColors.length]);
    }
};

// ====== COMPONENTE PRINCIPAL ======
createApp({
    setup() {
        // ====== ESTADO REACTIVO ======
        const state = reactive({
            loading: true,
            error: null,
            proyecto: null,
            actividades: [],
            usuarios: [],
            requerimientos: [],
            empresaId: null,
            empresa: null,
        });

        const modalPresupuestos = ref(false);

        const totalRequerimientos = computed(() => {
            const requerimientos = state.requerimientos;

            // Si no hay requerimientos, retornamos 0
            if (!Array.isArray(requerimientos) || requerimientos.length === 0) {
                return 0;
            }

            return requerimientos
                // Filtrar solo los requerimientos aprobados por logística y requerimiento
                .filter(req => req?.aprobado_logistica === 1 && req?.aprobado_requerimiento === 1)
                // Sumar los valores numéricos, usando 0 como valor por defecto en caso de datos inválidos
                .reduce((suma, req) => {
                    const valor = Number(req?.total_requerimientos ?? 0);
                    return suma + (isNaN(valor) ? 0 : valor);
                }, 0);
        });

        // Objeto centralizado con todos los datos de proyectos
        const proyectosData = {
            //"PROYECTO VINCHOS": {
            "COMBUSTIBLE Y GASOLINA EMPRESA": {
                montoAnterior: 0,
                topografia: 2751.5,
                desagregado: 5637.5,
                demolicion: 1090,
                costos_presupuesto: 0,
                suelos: 1276.5,
                electricas: 817,
                inicial_plaza: 85.5,
                sanitarias: 519,
                expedientes: 724,
                montoActual: 0
            },
            "PROYECTO VILCABAMBA": {
                montoAnterior: 0,
                topografia: 1571.25,
                desagregado: 4962.5,
                demolicion: 910.5,
                costos_presupuesto: 0,
                suelos: 1307.5,
                electricas: 865.5,
                inicial_plaza: 0,
                sanitarias: 270,
                expedientes: 651,
                montoActual: 0
            },
            "PROYECTO 358": {
                montoAnterior: 0,
                topografia: 0,
                desagregado: 0,
                demolicion: 0,
                costos_presupuesto: 0,
                suelos: 0,
                electricas: 0,
                inicial_plaza: 0,
                sanitarias: 0,
                expedientes: 0,
                montoActual: 0
            },
            "PROYECTO 64193": {
                montoAnterior: 0,
                topografia: 0,
                desagregado: 18025,
                demolicion: 0,
                costos_presupuesto: 0,
                suelos: 0,
                electricas: 5845.5,
                inicial_plaza: 0,
                sanitarias: 2237.5,
                expedientes: 0,
                montoActual: 0
            },
            "PROYECTO MORADA": {
                montoAnterior: 0,
                topografia: 0,
                desagregado: 0,
                demolicion: 0,
                costos_presupuesto: 0,
                suelos: 0,
                electricas: 0,
                inicial_plaza: 0,
                sanitarias: 0,
                expedientes: 0,
                montoActual: 0
            },
            "PROYECTO HUALLMISH": {
                montoAnterior: 0,
                topografia: 704.25,
                desagregado: 850,
                demolicion: 545,
                costos_presupuesto: 0,
                suelos: 449,
                electricas: 19,
                inicial_plaza: 0,
                sanitarias: 0,
                expedientes: 0,
                montoActual: 0
            },
            "PROYECTO PRIALE": {
                montoAnterior: 0,
                topografia: 0,
                desagregado: 3462.5,
                demolicion: 305,
                costos_presupuesto: 0,
                suelos: 0,
                electricas: 0,
                inicial_plaza: 0,
                sanitarias: 0,
                expedientes: 0,
                montoActual: 0
            },
            // Proyectos con solo montoAnterior
            "PUENTE KOKARI": { montoAnterior: 459, montoActual: 0 },
            "PTAR OLLACHEA": { montoAnterior: 502, montoActual: 0 },
            "PROYECTO ZOOTECNIA UNAS": { montoAnterior: 1964.5, montoActual: 0 },
            "PROYECTO PARQUE SAN PEDRO": { montoAnterior: 534, montoActual: 0 },
            "PROYECTO INSTITUTO PUERTO INCA": { montoAnterior: 2745.5, montoActual: 0 },
            "PROYECTO IE VINCHOS": { montoAnterior: 1039.5, montoActual: 0 },
            "PROYECTO IE VILCABAMBA PRIMARIA": { montoAnterior: 2892, montoActual: 0 },
            "PROYECTO IE VILCABAMBA INICIAL": { montoAnterior: 42, montoActual: 0 },
            "PROYECTO IE PALLANCHACRA": { montoAnterior: 76, montoActual: 0 },
            "PROYECTO IE N° 64193": { montoAnterior: 777.5, montoActual: 0 },
            "PROYECTO IE ILLATHUPA": { montoAnterior: 152, montoActual: 0 },
            "PROYECTO IE HERMILIO VALDIZAN": { montoAnterior: 23, montoActual: 0 },
            "PROYECTO IE CAYRAN": { montoAnterior: 23, montoActual: 0 },
            "PROYECTO 626 TANQUE ELEVADO Y JARDIN MODELAMIENTO": { montoAnterior: 19, montoActual: 0 },
            "CLINICA RENAL CARE": { montoAnterior: 122, montoActual: 0 },
            "AMPLIACIÓN DE LA CLINICA ANGEL REYES TINGO MARIA": { montoAnterior: 23, montoActual: 0 },

            // Proyectos con montoAnterior y montoActual
            "PROYECTO OFICINA": { montoAnterior: 706, montoActual: 475.80 },
            "EJECUCION POSTA DE SALUD PUCAJAGA": { montoAnterior: 0, montoActual: 1357.35 },
            "PROYECTO CASA VALLE": { montoAnterior: 0, montoActual: 27 },
            "CONCLUCION IBAÑEZ": { montoAnterior: 0, montoActual: 1128.89 },
            "PROYECTO IBAÑEZ": { montoAnterior: 0, montoActual: 5384.90 },
            "PROYECTO SUPERVICION FORESTALES": { montoAnterior: 0, montoActual: 1.83 },
            "PROYECTO CONSORCIO RINCONADA": { montoAnterior: 378, montoActual: 100.65 },
            "SUPERVICION SHAMBO": { montoAnterior: 0, montoActual: 445.30 },
            "ELABORACIOM DE EXPEDIENTILLOS PUESTO DE SALUD": { montoAnterior: 0, montoActual: 3296 },
            "EJECUCION POSTA DE SALUD CHINCHAVITO": { montoAnterior: 0, montoActual: 3296 },
            "PROYECTO CONSORCIO YANANO": { montoAnterior: 232, montoActual: 103.7 },
            "EJECUCION PROYECTO BARRUETA": { montoAnterior: 0, montoActual: 539 },
            "PROYECTO CONSORCIO PILLCO": { montoAnterior: 464, montoActual: 23057.50 },
            "EJECUCION POSTA DE SALUD CHINCHAYCOCHA": { montoAnterior: 0, montoActual: 1027 },
            "EJECUCION POSTA DE SALUD PAMPAMARCA": { montoAnterior: 410.75, montoActual: 1718.35 },
            "EJECUCION POSTA DE SALUD TAYAGASHA": { montoAnterior: 2288, montoActual: 228 },

            // Proyectos con solo montoAnterior (continuación)
            "ESTUDIO DE SUELOS Y CALICAS": { montoAnterior: 103.70, montoActual: 0 },
            "METODOLOGIA GENERAL (BASE DE DATOS)": { montoAnterior: 0, montoActual: 0 },
            "EJECUCION POSTA DE SALUD TAYAGASHA ADMINISTRATIVO": { montoAnterior: 30.50, montoActual: 0 },
            "PROYECTO MANTENIMIENTO Y AMPLIACION DE PARQUE SAN PEDRO": { montoAnterior: 0, montoActual: 0 },
            "PROYECTO VARIOS": { montoAnterior: 448.25, montoActual: 0 },
            "PROYECTO : VIVIENDA MULTIFAMILIAR ZAPATA CRUZ": { montoAnterior: 2710, montoActual: 0 },
            "PROYECTO SUPERVICION ESTADIO COLON": { montoAnterior: 562, montoActual: 0 },
            "PROYECTO ZOOTECNIA": { montoAnterior: 348.50, montoActual: 0 },
            "POROYECTO PORTALES CHUI": { montoAnterior: 1083.50, montoActual: 0 },
            "PROYECTO RICARDO PALMA": { montoAnterior: 4021, montoActual: 0 },
            "PROYECTO ISABEL": { montoAnterior: 596, montoActual: 0 },
            "EJECUCION PROYECTO IBAÑEZ ADMINISTRATIVO": { montoAnterior: 1627, montoActual: 0 },
            "EJECUCION DE COBERTURA HOSPITAL HV": { montoAnterior: 2159, montoActual: 0 },
            "prueba": { montoAnterior: 2349, montoActual: 0 },
            "SUPERVISION NOLBERTH": { montoAnterior: 2368, montoActual: 0 },
            "APYO AL AREA DE ESTRUCTURAS": { montoAnterior: 76, montoActual: 0 },
            "PROYECTO CLINICA PRIVADA ANGUEL REYES": { montoAnterior: 57, montoActual: 0 },
            "PROYECTO OFICINA ADMINISTRATIVO  SEVEN": { montoAnterior: 365, montoActual: 0 },

            // Proyectos Hyperium
            "Rizabal y Asociados": { montoAnterior: 2673, montoActual: 0 },
            "proyecto pavco": { montoAnterior: 361, montoActual: 0 },
            "GESPRO CAMPO": { montoAnterior: 195, montoActual: 0 },
            "Gespro": { montoAnterior: 4736, montoActual: 0 },
            "Dml arquitectos": { montoAnterior: 136, montoActual: 0 },
            "CONSTRUYE HCO": { montoAnterior: 76, montoActual: 0 },
            "Autocad y Matlab": { montoAnterior: 2080, montoActual: 0 },
            "Aceros y drywall Titan": { montoAnterior: 850, montoActual: 0 },
            "Construtienda": { montoAnterior: 1212, montoActual: 0 }
        };

        // Función para obtener datos de proyecto con valores por defecto
        function obtenerDatosProyecto(nombreProyecto) {
            const nombreNormalizado = nombreProyecto.trim();
            const proyecto = proyectosData[nombreNormalizado];

            // Objeto base con todas las propiedades posibles
            const base = {
                montoAnterior: 0,
                topografia: 0,
                desagregado: 0,
                demolicion: 0,
                costos_presupuesto: 0,
                suelos: 0,
                electricas: 0,
                inicial_plaza: 0,
                sanitarias: 0,
                expedientes: 0,
                montoActual: 0
            };

            // Si el proyecto existe, combinar con el objeto base
            return proyecto ? { ...base, ...proyecto } : base;
        }

        // Función para calcular el total del proyecto
        function calcularTotalProyecto(datosProyecto) {
            const montosKeys = [
                'montoAnterior',
                'topografia',
                'desagregado',
                'demolicion',
                'costos_presupuesto',
                'suelos',
                'electricas',
                'inicial_plaza',
                'sanitarias',
                'expedientes',
                'montoActual'
            ];

            return montosKeys.reduce((total, key) => total + (datosProyecto[key] || 0), 0);
        }

        // Datos para gráfico de especialidades (CORREGIDO)
        const datosGraficoEspecialidades = computed(() => {
            let documentosProyecto = state.proyecto?.documento_proyecto;

            // Si viene como string JSON, lo parseamos
            if (typeof documentosProyecto === "string") {
                try {
                    documentosProyecto = JSON.parse(documentosProyecto);
                } catch (error) {
                    console.error("Error al parsear documento_proyecto:", error);
                    documentosProyecto = [];
                }
            }

            // Validar si no hay documentos
            if (!Array.isArray(documentosProyecto) || documentosProyecto.length === 0) {
                return [
                    { nombre: 'Arquitectura', porcentajeAvance: 85 },
                    { nombre: 'Estructuras', porcentajeAvance: 72 },
                    { nombre: 'Instalaciones Eléctricas', porcentajeAvance: 60 },
                    { nombre: 'Instalaciones Sanitarias', porcentajeAvance: 45 },
                    { nombre: 'Seguridad y Salud', porcentajeAvance: 90 }
                ];
            }

            // Mapear especialidades con su avance
            return documentosProyecto.map(doc => ({
                nombre: doc.nombre?.trim() || doc.especialidad?.trim() || 'Sin nombre',
                porcentajeAvance: parseFloat(doc.porcentajeAvance) || 0
            }));
        });

        const datosUsuarios = computed(() => {
            const actividades = state.actividades || [];
            if (actividades.length === 0) return [];

            // Obtener mes y año actual
            const hoy = new Date();
            const mesActual = hoy.getMonth(); // 0-11
            const añoActual = hoy.getFullYear();

            // Agrupar por usuario
            const usuariosMap = {};

            actividades.forEach(act => {
                const userId = act.usuario.id;
                const nombreUsuario = `${act.usuario.name} ${act.usuario.surname}`;
                const fecha = new Date(act.fecha);
                const dias = Number(act.elapsed_time) || 0;
                const sueldoBase = Number(act.usuario.sueldo_base) || 0;
                const costoPorDia = sueldoBase / 26;

                if (!usuariosMap[userId]) {
                    usuariosMap[userId] = {
                        usuarioId: userId,
                        nombre: nombreUsuario,
                        diasPasados: 0,
                        diasActuales: 0,
                        totalDiasEjecutado: 0, // 👈 nueva columna
                        costoPorDia,
                        costoTotal: 0
                    };
                }

                // separar en pasado vs actual
                if (fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual) {
                    usuariosMap[userId].diasActuales += dias;
                } else {
                    usuariosMap[userId].diasPasados += dias;
                }
            });

            // calcular total de días ejecutados y costo total
            Object.values(usuariosMap).forEach(u => {
                u.totalDiasEjecutado = u.diasPasados + u.diasActuales; // 👈 suma
                u.costoTotal = u.totalDiasEjecutado * u.costoPorDia;
            });

            return Object.values(usuariosMap);
        });

        const totalDiasEjecutadoUsuario = computed(() => {
            const usuarios = datosUsuarios.value || [];
            return usuarios.reduce((total, usuario) => total + usuario.totalDiasEjecutado, 0);
        });

        const totalCostoUsuarios = computed(() => {
            const usuarios = datosUsuarios.value || [];
            return usuarios.reduce((total, usuario) => total + usuario.costoTotal, 0);
        });

        // Computed property para obtener el total acumulado
        const montosProyectosAnteriores = computed(() => {
            const nombreProyecto = state.proyecto?.nombre_proyecto || 'PROYECTO';
            const datosProyecto = obtenerDatosProyecto(nombreProyecto);
            console.log(datosProyecto)
            const totalProyecto = calcularTotalProyecto(datosProyecto);
            const totalUsuarios = totalCostoUsuarios.value || 0;

            return totalProyecto + totalUsuarios;
        });

        const proyectosAnteriores = computed(() => {
            // Proyecto anterior
            const nombreProyectoAnterior = (state.proyecto?.nombre_proyecto?.trim() || 'PROYECTO') + ' Anterior';
            const datosProyectoAnterior = obtenerDatosProyecto(state.proyecto?.nombre_proyecto?.trim() || 'PROYECTO');
            const totalAnterior = calcularTotalProyecto(datosProyectoAnterior);

            // Proyecto actual
            const nombreProyectoActual = (state.proyecto?.nombre_proyecto?.trim() || 'PROYECTO') + ' Actual';
            const totalActual = totalCostoUsuarios.value + totalRequerimientos.value;

            // Total general
            const totalGeneral = totalAnterior + totalActual;

            // Retornar array con ambas líneas y el total
            return [
                {
                    nombre: nombreProyectoAnterior,
                    ...datosProyectoAnterior,
                    total: totalAnterior
                },
                {
                    nombre: nombreProyectoActual,
                    total: totalActual
                },
                {
                    nombre: 'TOTAL GENERAL',
                    total: totalGeneral,
                    esTotal: true // Para identificar la fila del total
                }
            ];
        });

        // Datos para gráfico de resumen
        const datosGraficoResumen = computed(() => {
            const jefeArea = state.usuarios?.find(u => u?.area_laboral === "Jefe de area") ?? null;
            const fechaActual = new Date();
            const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const formateador = new Intl.DateTimeFormat('es-ES', opciones);

            const montoInvertido = Number(montosProyectosAnteriores.value || 0);
            const diasEjecutados = totalDiasEjecutadoUsuario.value || 0;
            const montorequerimiento = Number(totalRequerimientos.value || 0);

            const totalInvertido = montoInvertido + montorequerimiento;
            const porcentajeTotal = parseFloat(state.proyecto?.porcentaje_total) || 0;
            const porcentajerestante = 100 - porcentajeTotal;
            const gastoPresupuesto = porcentajeTotal > 0
                ? (porcentajerestante * montoInvertido) / porcentajeTotal
                : 0;

            return {
                proyecto: state.proyecto,
                jefe: jefeArea ? `${jefeArea.name} ${jefeArea.surname}` : 'Sin dato',
                empresa: state.empresa?.razonSocial || 'N/A',
                fecha: formateador.format(fechaActual),
                montoPresupuestado: parseFloat(state.proyecto?.monto_designado) || 0,
                montoInvertido: totalInvertido,
                gastoPresupuestado: gastoPresupuesto,
                totalDias: diasEjecutados,
                porcentajeAvance: porcentajeTotal,
                porcentajeRestante: porcentajerestante
            };
        });

        const dataresumenmore = computed(() => {
            const montoPresupuestado = parseFloat(state.proyecto?.monto_designado);
            const montoinvertido = parseFloat(montosProyectosAnteriores.value || []);
            const montorequerimiento = totalRequerimientos.value || 0;
            console.log(montorequerimiento)
            const totalInvertido = montoinvertido + montorequerimiento;
            const utilidad = montoPresupuestado - totalInvertido;
            const porcentaje_utilidad = parseFloat((totalInvertido / montoPresupuestado) * 10).toFixed(2);

            return {
                totalmonto: montoPresupuestado,
                sumaTotalGastototal: totalInvertido.toFixed(2),
                ganpro: utilidad,
                porcentaje_utilidad: porcentaje_utilidad,
            }
        });

        const progresoProyectos = computed(() => {
            const plazoPlanificado = Number(state.proyecto?.plazo_total_pro) || 0;

            // suma de días ejecutados de todos los usuarios
            const totalDiasEjecutados = datosUsuarios.value.reduce(
                (acc, u) => acc + u.totalDiasEjecutado,
                0
            );

            return {
                plazoPlanificado,
                totalDiasEjecutados
            };
        });

        const porcentajeAvance = computed(() => {
            const plazoPlanificado = Number(state.proyecto?.plazo_total_pro) || 0;

            // suma de días ejecutados de todos los usuarios
            const totalDiasEjecutados = datosUsuarios.value.reduce(
                (acc, u) => acc + u.totalDiasEjecutado,
                0
            );

            const diasTotales = plazoPlanificado;
            const porcentajeAvanceEsperado = [];
            const porcentajeAvanceActual = [];

            // porcentaje promedio de avance real hasta la fecha
            const promedioPorcentaje = (totalDiasEjecutados / diasTotales) * 100;

            for (let dia = 0; dia <= diasTotales; dia++) {
                // Avance esperado: crece lineal hasta 100%
                const avanceEsperado = (dia / diasTotales) * 100;

                // Avance actual: se trunca hasta el total de días ejecutados
                const avanceActual = dia <= totalDiasEjecutados
                    ? (dia / totalDiasEjecutados) * promedioPorcentaje
                    : null;

                porcentajeAvanceEsperado.push(avanceEsperado);
                porcentajeAvanceActual.push(avanceActual);
            }

            return {
                diasTotales,
                totalDiasEjecutados,
                porcentajeAvanceEsperado,
                porcentajeAvanceActual
            };
        });

        const montosEspecialidadesTrabajador = computed(() => {
            let especialidades = state.proyecto?.especialidades_porcentaje;
            const montoDesignado = parseFloat(state.proyecto?.monto_designado) || 0;
            const actividades = state.actividades || [];

            // Parsear especialidades si viene como string JSON
            if (typeof especialidades === "string") {
                try {
                    especialidades = JSON.parse(especialidades);
                } catch (e) {
                    console.error("Error parseando especialidades_porcentaje:", e);
                    especialidades = [];
                }
            }

            if (!Array.isArray(especialidades) || especialidades.length === 0) return [];

            // 1. Calcular monto asignado por especialidad mediante porcentaje
            const especialidadesConMontos = especialidades.map(esp => {
                const nombreEsp = esp.id?.trim() || esp.nombre?.trim() || "Sin nombre";
                const porcentaje = parseFloat(esp.porcentaje) || parseFloat(esp.porcentajeAvance) || 0;
                const montoAsignado = (porcentaje / 100) * montoDesignado;

                return {
                    nombre: nombreEsp,
                    porcentajeAvance: porcentaje,
                    montoAsignado
                };
            });

            // 2. Calcular monto ejecutado por especialidad usando elapsed_time
            return especialidadesConMontos.map(esp => {
                // Filtrar actividades de esta especialidad
                const actividadesEspecialidad = actividades.filter(
                    act => (act.especialidad || "").toLowerCase() === esp.nombre.toLowerCase()
                );

                // Agrupar trabajadores y calcular gastos usando elapsed_time
                const trabajadoresMap = new Map();

                actividadesEspecialidad.forEach(act => {
                    const userId = act.usuario?.id;
                    if (!userId) return;

                    const nombreUsuario = `${act.usuario.name || ''} ${act.usuario.surname || ''}`.trim();

                    // 2. Calcular sueldo diario: sueldo_base / 26
                    const sueldoBase = parseFloat(act.usuario.sueldo_base) || 0;
                    const sueldoDiario = sueldoBase / 26;

                    // 3. Obtener días trabajados usando elapsed_time
                    const diasTrabajados = parseFloat(act.elapsed_time) || 0;

                    // 4. Calcular monto ejecutado: elapsed_time * sueldo_diario
                    const montoEjecutado = diasTrabajados * sueldoDiario;

                    if (trabajadoresMap.has(userId)) {
                        // Si el trabajador ya existe, sumar días y montos
                        const trabajador = trabajadoresMap.get(userId);
                        trabajador.diasTrabajados += diasTrabajados;
                        trabajador.montoEjecutado += montoEjecutado;
                    } else {
                        // Crear nuevo registro de trabajador
                        trabajadoresMap.set(userId, {
                            usuarioId: userId,
                            nombre: nombreUsuario,
                            diasTrabajados: diasTrabajados,
                            montoEjecutado: montoEjecutado,
                            sueldoBase: sueldoBase,
                            sueldoDiario: sueldoDiario
                        });
                    }
                });

                const trabajadores = Array.from(trabajadoresMap.values());

                // 5. Sumar todo el monto ejecutado por especialidad
                const montoEjecutado = trabajadores.reduce((sum, trabajador) => sum + trabajador.montoEjecutado, 0);

                return {
                    nombre: esp.nombre,
                    porcentajeAvance: esp.porcentajeAvance,
                    montoAsignado: esp.montoAsignado,
                    montoEjecutado: montoEjecutado,
                    trabajadores: trabajadores,
                    eficiencia: esp.montoAsignado > 0 ? ((montoEjecutado / esp.montoAsignado) * 100) : 0
                };
            });
        });

        // ====== MÉTODOS DE PROCESAMIENTO DE DATOS ======
        const procesarDatosServidor = (paquetes) => {
            try {
                if (!paquetes) {
                    throw new Error('No se recibieron datos del servidor');
                }
                console.log('Procesando datos del servidor:', paquetes);

                state.proyecto = paquetes.proyecto || {};
                state.actividades = paquetes.actividades || [];
                state.usuarios = paquetes.usuarios || [];
                state.requerimientos = paquetes.requerimientos || [];
                state.empresa = paquetes.empresa || {};
                state.empresaId = paquetes.empresa?.id;

                console.log('Estado actualizado:', state);

            } catch (error) {
                console.error('Error procesando datos del servidor:', error);
                state.error = 'Error al procesar los datos del proyecto';
            } finally {
                state.loading = false;
            }
        };

        // ====== MÉTODOS DE GRÁFICOS ======
        const chartInstances = ref(new Map());

        const calcularAlturaDinamica = (tipoGrafico, datos) => {
            const ALTURA_FILA = 0.4; // Porcentaje por fila
            const ALTURA_HEADER = 1.2; // Altura del header/título
            const MARGEN_EXTRA = 0.3; // Margen adicional

            switch (tipoGrafico) {
                case 'trabajadores':
                    const cantidadTrabajadores = datos?.length || 0;
                    return ALTURA_HEADER + (cantidadTrabajadores * ALTURA_FILA) + MARGEN_EXTRA;

                case 'requerimientos':
                    const cantidadRequerimientos = datos?.length || 0;
                    return ALTURA_HEADER + (cantidadRequerimientos * ALTURA_FILA) + MARGEN_EXTRA;

                default:
                    return 6; // Altura fija para otros gráficos
            }
        };

        // ====== CONFIGURACIÓN ALTERNATIVA CON MÁS GRÁFICOS ======
        const renderizarGraficosCompletos = async () => {
            if (state.loading) return;

            try {
                await nextTick();

                // Limpiar contenedor existente
                if (chartInstances.value.has('dataProyectoreports')) {
                    zingchart.exec('dataProyectoreports', 'destroy');
                    chartInstances.value.delete('dataProyectoreports');
                }

                // Configurar todos los gráficos con posiciones dinámicas
                const graficos = [];
                let posicionY = 0; // Empezamos desde 0%

                // Gráfico 1: Resumen
                const g1 = CHART_CONFIGS.resumen(datosGraficoResumen.value);
                g1.height = '7%';
                g1.width = '100%';
                g1.y = `${posicionY}%`;
                g1.x = '0%';
                graficos.push(g1);
                posicionY += 7.2; // 6% altura + 0.2% margen

                // Gráfico 2: Resumen Mano de Obra
                const g2 = CHART_CONFIGS.resumenManoObra(montosProyectosAnteriores.value);
                g2.height = '3%';
                g2.width = '45%';
                g2.y = `${posicionY}%`;
                g2.x = '3%';
                graficos.push(g2);

                // Gráfico 3: Resumen requerimientos (mismo nivel que g2)
                const g3 = CHART_CONFIGS.resumenRequerimientos(totalRequerimientos.value);
                g3.height = '3%';
                g3.width = '45%';
                g3.y = `${posicionY}%`;
                g3.x = '50%';
                graficos.push(g3);
                posicionY += 3.3; // 2% altura + 0.3% margen

                // Gráfico 4: Resumen General
                const g4 = CHART_CONFIGS.resumengeneral(dataresumenmore.value);
                g4.height = '4%';
                g4.width = '92%';
                g4.y = `${posicionY}%`;
                g4.x = '3%';
                graficos.push(g4);
                posicionY += 4.5; // 3% altura + 0.5% margen

                // Gráfico 5: Especialidades
                const g5 = CHART_CONFIGS.especialidades(datosGraficoEspecialidades.value);
                g5.height = '7%';
                g5.width = '100%';
                g5.y = `${posicionY}%`;
                g5.x = '0%';
                graficos.push(g5);
                posicionY += 7.5; // 6% altura + 0.2% margen

                // Gráfico 6: Trabajadores (DINÁMICO)
                const alturaTrabajadores = calcularAlturaDinamica('trabajadores', datosUsuarios.value);
                const g6 = CHART_CONFIGS.trabajadores(datosUsuarios.value);
                g6.height = `${alturaTrabajadores}%`;
                g6.width = '100%';
                g6.y = `${posicionY}%`;
                g6.x = '0%';
                graficos.push(g6);
                posicionY += alturaTrabajadores + 4.5; // Altura calculada + margen

                // Gráfico 7: resumen de proyectos (DINÁMICO)
                const alturaProyectos = calcularAlturaDinamica('proyectos', proyectosAnteriores.value.length);
                const g8 = CHART_CONFIGS.resumenProyectos(proyectosAnteriores.value);
                g8.height = `${alturaProyectos}%`; // Usar altura dinámica calculada
                g8.width = '100%';
                g8.y = `${posicionY}%`;
                g8.x = '0%';
                graficos.push(g8);
                posicionY += alturaProyectos + 0.5;

                //grafico 8:  Presupuestos
                const g9 = CHART_CONFIGS.presupuestos(dataresumenmore.value);
                g9.height = '6%';
                g9.width = '100%';
                g9.y = `${posicionY}%`;
                g9.x = '0%';
                graficos.push(g9);
                posicionY += 6.5;

                //grafico 9:  progreso
                const g10 = CHART_CONFIGS.progresoProyectos(progresoProyectos.value);
                g10.height = '8%';
                g10.width = '100%';
                g10.y = `${posicionY}%`;
                g10.x = '0%';
                graficos.push(g10);
                posicionY += 8.5;

                //grafico 10:  Porcentaje de Avance
                const g11 = CHART_CONFIGS.porcentajeAvance(porcentajeAvance.value);
                g11.height = '7%';
                g11.width = '100%';
                g11.y = `${posicionY}%`;
                g11.x = '0%';
                graficos.push(g11);
                posicionY += 7.5;

                //grafico 12:  Gastos Efectuados Especilidades
                const especialidadesConTrabajadores = montosEspecialidadesTrabajador.value.filter(
                    esp => esp.trabajadores && esp.trabajadores.length > 0
                );

                // Generar un gráfico por cada especialidad
                especialidadesConTrabajadores.forEach((especialidad, index) => {
                    const graficoEspecialidad = CHART_CONFIGS.gastosEfectuadosEspecialidades(
                        especialidad,
                        index,
                        especialidadesConTrabajadores.length
                    );
                    graficoEspecialidad.y = `${posicionY}%`;
                    graficos.push(graficoEspecialidad);
                    posicionY += 8.5;
                });

                // Calcular altura total del contenedor
                const alturaTotal = Math.max(posicionY * 50, 3000); // Mínimo 3000px

                // Configuración final
                let chartConfig = {
                    graphset: graficos
                };

                // Renderizar
                zingchart.render({
                    id: 'dataProyectoreports',
                    data: chartConfig,
                    width: '100%',
                    height: `${alturaTotal}px`, // Altura dinámica
                    events: {
                        complete: () => {
                            chartInstances.value.set('dataProyectoreports', true);
                            console.log(`${graficos.length} gráficos renderizados correctamente`);
                        },
                        error: (e) => {
                            console.error('Error renderizando graphset:', e);
                        }
                    }
                });

            } catch (error) {
                console.error('Error en renderizarGraficosCompletos:', error);
            }
        };

        // ====== MÉTODOS DE UI ======
        const abrirModalPresupuestos = () => {
            modalPresupuestos.value = true;
        };

        const cerrarModalPresupuestos = () => {
            modalPresupuestos.value = false;
        };

        // ====== INICIALIZACIÓN ======
        const inicializar = async () => {
            try {
                console.log('Iniciando aplicación con paquetes:', paquetes);

                if (paquetes) {
                    procesarDatosServidor(paquetes);
                } else {
                    console.warn('No se recibieron paquetes, usando datos por defecto');
                    state.loading = false;
                }

            } catch (error) {
                console.error('Error en inicialización:', error);
                state.error = 'Error al inicializar la aplicación';
                state.loading = false;
            }
        };

        // ====== WATCHERS ======
        watch(
            () => state.loading,
            async (nuevo) => {
                if (nuevo === false) {
                    setTimeout(() => {
                        renderizarGraficosCompletos();
                    }, 200);
                }
            }
        );

        watch(() => [datosGraficoResumen.value, datosGraficoEspecialidades.value],
            async () => {
                if (!state.loading) {
                    setTimeout(() => {
                        renderizarGraficosCompletos();
                    }, 100);
                }
            },
            { deep: true }
        );

        // ====== LIFECYCLE HOOKS ======
        onMounted(() => {
            inicializar();
        });

        // ====== CLEANUP ======
        const limpiarGraficos = () => {
            chartInstances.value.forEach((_, containerId) => {
                try {
                    zingchart.exec(containerId, 'destroy');
                } catch (error) {
                    console.warn(`Error limpiando gráfico ${containerId}:`, error);
                }
            });
            chartInstances.value.clear();
        };

        onUnmounted(() => {
            limpiarGraficos();
        });

        // ====== RETORNO DEL SETUP ======
        return {
            // Estado
            state,
            modalPresupuestos,

            // Datos computados
            datosGraficoResumen,
            datosGraficoEspecialidades,

            // Métodos públicos
            abrirModalPresupuestos,
            cerrarModalPresupuestos,
            renderizarGraficosCompletos,


            // Utilidades
            ChartUtils
        };
    }
}).mount('#appreportesProyecto');