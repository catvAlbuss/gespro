import './bootstrap';
import Swal from 'sweetalert2';
import Alpine from 'alpinejs';
import '../css/app.css'; // Ensure this path is correct

window.Alpine = Alpine;
window.Swal = Swal;

Alpine.start();
