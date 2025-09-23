import './bootstrap';
import Swal from 'sweetalert2';
import Alpine from 'alpinejs';
import '../css/app.css'; // Ensure this path is correct
// Carga condicional según la URL
const path = window.location.pathname;


// resources/js/app.js
import './contabilidad/kanban.js';
import './tramites/tramites.js';
/**
 * PROYECTOS
 */
import './proyectos/portadaproyectos.js';
import './proyectos/detallesproyectos.js';
import './proyectos/reporteProyectos.js';
/**
 * PRGRAMAS
 */
import './programasgespro/cotizador.js';
import './programasgespro/mainAgua.js';
import './programasgespro/mainDesague.js';
import './programasgespro/aireacondicionado.js';
import './programasgespro/mainCaidaTension.js';
import './programasgespro/pozopararrayo.js';

/**
 * BALANCES
 */
import './contabilidad/balanceGV.js';

// === METRADOS ===
if (path.includes('/metrados')) {
    import('./metrados/gestion_metrados_sanitarias.js');
}
window.Alpine = Alpine;
window.Swal = Swal;

Alpine.start();
