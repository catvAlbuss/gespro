import Alpine from 'alpinejs';
import Swal from 'sweetalert2';

export function initGlobals() {
  window.Alpine = Alpine;
  window.Swal = Swal;

  document.addEventListener('DOMContentLoaded', () => {
    Alpine.start();
  });
}
