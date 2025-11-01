// resources/js/app.js
import './bootstrap';
import Swal from 'sweetalert2';
import Alpine from 'alpinejs';
import '../css/app.css';

// Configurar globals (si los necesitas en Blade)
window.Swal = Swal;
window.Alpine = Alpine;

// Cargar dinámicamente el módulo según la vista actual
import('./core/route-loader.js')
  .then(() => console.log('✅ route-loader inicializado'))
  .catch(err => console.error('❌ Error al cargar route-loader:', err));

// Iniciar Alpine al final
document.addEventListener('DOMContentLoaded', () => {
  Alpine.start();
});
