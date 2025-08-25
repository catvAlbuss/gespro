import Table from "./presupuestos/table.js";
import TableDetails from "./presupuestos/tabledetails.js";
import Gastos from "./presupuestos/gastosGenerales.js";
import GastosFijos from "./presupuestos/gastosGeneralesFijos.js";
import Supervision from "./presupuestos/supervision.js";
import GGsuperDetails from "./presupuestos/ggsupervision.js";

import Remuneraciones from "./presupuestos/renumeracion.js";
import ControlCuncurrente from "./presupuestos/controlcuncurrente.js";
import Consolidado from "./presupuestos/consolidado.js";

const table = new Table(TableDetails);
table.init();

const gastos = new Gastos();
gastos.init();

const gastosfijo = new GastosFijos;
gastosfijo.init();

// Inicializar la clase
const remuneraciones = new Remuneraciones();
remuneraciones.init();

// Inicializar la clase
const supervision = new Supervision(GGsuperDetails);
supervision.init();

const controlCun = new ControlCuncurrente();
controlCun.init();

document.addEventListener('DOMContentLoaded', () => {
    const consolidado = new Consolidado();
    consolidado.init();
    // Aquí podrías agregar la lógica para mostrar la primera pestaña (Consolidado)
    const tabList = document.getElementById('tab-list');
    const tabContent = document.getElementById('tab-content');

    if (tabList && tabContent) {
        const tabs = tabList.querySelectorAll('.tab-button');
        const panels = tabContent.querySelectorAll('.tab-panel');

        if (tabs.length > 0 && panels.length === tabs.length) {
            // Desactivar todas las pestañas y ocultar todos los paneles
            tabs.forEach(tab => tab.classList.remove('bg-gray-700', 'text-green-500'));
            tabs.forEach(tab => tab.classList.add('text-gray-300', 'hover:text-blue-600', 'hover:bg-gray-600'));
            panels.forEach(panel => panel.classList.add('hidden'));

            // Activar la primera pestaña (Consolidado) y mostrar su contenido
            const firstTab = tabs[0];
            const firstPanel = panels[0];

            if (firstTab && firstPanel) {
                firstTab.classList.add('bg-gray-700', 'text-green-500');
                firstTab.classList.remove('text-gray-300', 'hover:text-blue-600', 'hover:bg-gray-600');
                firstPanel.classList.remove('hidden');
            }
        }
    }
});
