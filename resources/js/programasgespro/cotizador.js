import { createApp, ref, onMounted, computed, reactive, nextTick } from 'vue';

// Obtener datos de configuración inicial
const { empresaId } = window.APP_INIT || {};

const app = createApp({
    setup() {
        // Estado del proyecto
        const proyecto = reactive({
            area: 100,
            pisos: 5,
            categoria: 1,
            gestionLicencia: false,
            estudioSuelos: false,
            igv: false
        });

        // Estado de cotizaciones
        const cotizacionPlanos = reactive({
            items: [],
            total: 0
        });

        const cotizacionObra = reactive({
            items: [],
            total: 0
        });

        // Función de cálculo
        const calcular = () => {
            const area = proyecto.area || 0;
            const pisos = proyecto.pisos || 0;
            const categoria = proyecto.categoria || 1;
            const gestionLicencia = proyecto.gestionLicencia ? 2000 : 0;
            const estudioSuelos = proyecto.estudioSuelos ? 1200 : 0;
            const igv = proyecto.igv ? 1 : 0;

            // Cálculos para planos
            const topografia = 500;
            const mecanicaSuelos = estudioSuelos;
            const arquitectura = area * pisos * categoria * 2;
            const estructuras = area * pisos * categoria * 1.8;
            const sanitarias = area * pisos * categoria * 0.8;
            const electricas = area * pisos * categoria * 1;
            const costos = area * pisos * categoria * 0.8;

            const costoDirPlan = topografia + mecanicaSuelos + arquitectura + estructuras + sanitarias + electricas + costos;
            const gastosGenPlan = costoDirPlan * 0.20;
            const impresion = costoDirPlan * 0.06;
            const igvPlan = costoDirPlan * 0.18 * igv;
            const utilidadPlan = costoDirPlan * 0.08;
            const gestionLicPlan = gestionLicencia * categoria;

            const totalPlanos = costoDirPlan + gastosGenPlan + impresion + igvPlan + utilidadPlan + gestionLicPlan;

            // Actualizar cotización planos
            cotizacionPlanos.items = [
                { nombre: 'Topografía', precio: topografia },
                { nombre: 'Estudio de mecánica de suelos', precio: mecanicaSuelos },
                { nombre: 'Arquitectura', precio: arquitectura },
                { nombre: 'Estructuras', precio: estructuras },
                { nombre: 'Instalaciones Sanitarias', precio: sanitarias },
                { nombre: 'Instalaciones Eléctricas', precio: electricas },
                { nombre: 'Costos y presupuesto', precio: costos },
                { nombre: 'Costo directo', precio: costoDirPlan },
                { nombre: 'Gastos Generales', precio: gastosGenPlan },
                { nombre: 'Impresión', precio: impresion },
                { nombre: 'IGV', precio: igvPlan },
                { nombre: 'Utilidad', precio: utilidadPlan },
                { nombre: 'Gestión de licencia', precio: gestionLicPlan }
            ];
            cotizacionPlanos.total = totalPlanos;

            // Cálculos para obra
            const topoObra = area * categoria * 5;
            const suelosObra = area * categoria * 20;
            const arquiObra = area * pisos * categoria * 450 * 0.8;
            const estrucObra = area * pisos * categoria * 640 * 0.8;
            const sanitObra = area * pisos * categoria * 70 * 0.8;
            const elecObra = area * pisos * categoria * 70 * 0.8;

            const costoDirObra = topoObra + suelosObra + arquiObra + estrucObra + sanitObra + elecObra;
            const gastosGenObra = costoDirObra * 0.08;
            const igvObra = costoDirObra * 0.18 * igv;
            const utilidadObra = costoDirObra * 0.04;
            const gestionLicObra = gestionLicencia * categoria;

            const totalObra = costoDirObra + gastosGenObra + igvObra + utilidadObra + gestionLicObra;

            // Actualizar cotización obra
            cotizacionObra.items = [
                { nombre: 'Topografía', precio: topoObra },
                { nombre: 'Estudio de mecánica de suelos', precio: suelosObra },
                { nombre: 'Arquitectura', precio: arquiObra },
                { nombre: 'Estructuras', precio: estrucObra },
                { nombre: 'Instalaciones Sanitarias', precio: sanitObra },
                { nombre: 'Instalaciones Eléctricas', precio: elecObra },
                { nombre: 'Costo directo', precio: costoDirObra },
                { nombre: 'Gastos Generales', precio: gastosGenObra },
                { nombre: 'IGV', precio: igvObra },
                { nombre: 'Utilidad', precio: utilidadObra },
                { nombre: 'Gestión de licencia', precio: gestionLicObra }
            ];
            cotizacionObra.total = totalObra;
        };

        // Cálculo inicial
        calcular();

        return {
            proyecto,
            cotizacionPlanos,
            cotizacionObra,
            calcular
        };
    }
})
app.mount('#appProgramas');