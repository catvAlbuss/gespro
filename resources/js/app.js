// resources/js/app.js
import './bootstrap';
import Swal from 'sweetalert2';
import Alpine from 'alpinejs';
import '../css/app.css';

import './contabilidad/kanban.js';
import './tramites/tramites.js';

import './proyectos/portadaproyectos.js';
import './proyectos/detallesproyectos.js';
import './proyectos/reporteProyectos.js';

import './contabilidad/balanceGV.js';

//MANTENIMIENTO 
import './programasgespro/mantenimiento.js';
import './metrados/metrado_electricas.js';
//COSTOSresources/js/costos/main.js
import './costos/main.js';
// Configurar globals ANTES de todo
window.Alpine = Alpine;
window.Swal = Swal;

const path = window.location.pathname;

// Función para cargar módulos de manera segura
async function loadModulesForRoute() {
    console.log('Cargando módulos para ruta:', path);

    const loadPromises = [];

    try {
        // CONTABILIDAD
        if (path.includes('/contabilidad') || path.includes('/kanban')) {
            loadPromises.push(import('./contabilidad/kanban.js'));
        }
        if (path.includes('/balance')) {
            loadPromises.push(import('./contabilidad/balanceGV.js'));
        }

        // TRÁMITES
        if (path.includes('/tramites')) {
            loadPromises.push(import('./tramites/tramites.js'));
        }

        // PROYECTOS
        if (path.includes('/proyectos') || path.includes('/portada-proyecto')) {
            loadPromises.push(import('./proyectos/portadaproyectos.js'));
        }
        if (path.includes('/detalles-proyecto')) {
            loadPromises.push(import('./proyectos/detallesproyectos.js'));
        }
        if (path.includes('/reporte-proyecto')) {
            loadPromises.push(import('./proyectos/reporteProyectos.js'));
        }

        // PROGRAMAS GESPRO - ESTOS SON LOS IMPORTANTES
        if (path.includes('/portada-programas-gespro')) {
            loadPromises.push(import('./programasgespro/cotizador.js'));
        }
        if (path.includes('/calculo-agua')) {
            console.log('Cargando mainAgua.js...');
            loadPromises.push(import('./programasgespro/mainAgua.js'));
        }
        if (path.includes('/calculo-desague')) {
            loadPromises.push(import('./programasgespro/mainDesague.js'));
        }
        if (path.includes('/calculo-aire-acondicionado')) {
            loadPromises.push(import('./programasgespro/aireacondicionado.js'));
        }
        if (path.includes('/calculo-caida-tension')) {
            loadPromises.push(import('./programasgespro/mainCaidaTension.js'));
        }
        if (path.includes('/calculo-pozo-pararrayo')) {
            loadPromises.push(import('./programasgespro/pozopararrayo.js'));
        }

        // METRADOS
        if (path.includes('/metrados')) {
            loadPromises.push(import('./metrados/gestion_metrados_sanitarias.js'));
        }

        // Esperar a que se carguen todos los módulos
        if (loadPromises.length > 0) {
            await Promise.all(loadPromises);
            console.log(`✓ ${loadPromises.length} módulo(s) cargado(s) exitosamente`);
        }

    } catch (error) {
        console.error('Error al cargar módulos:', error);
    }
}

// Secuencia de inicialización correcta
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM cargado, iniciando secuencia...');

    // 1. Primero cargar los módulos específicos de la ruta
    await loadModulesForRoute();

    // 2. Pequeña pausa para asegurar que los módulos se registren
    await new Promise(resolve => setTimeout(resolve, 100));

    // 3. Finalmente iniciar Alpine
    Alpine.start();

    console.log('Secuencia de inicialización completada');
});

// Para SPAs, manejar cambios de ruta
window.addEventListener('popstate', async () => {
    await loadModulesForRoute();
});

console.log('app.js cargado - Esperando DOM...');