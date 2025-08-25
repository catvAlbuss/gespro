export class Tabla {
    constructor(id, nombre) {
        this.id = id;
        this.nombre = nombre;
        this.elemento = null;
    }

    crear() {
        // Crear el contenedor para la tabla
        const contenedorTabla = document.createElement('div');
        contenedorTabla.id = this.id;  // Asignar el id de la tabla

        // Crear el título de la tabla
        const titulo = document.createElement('h3');
        titulo.textContent = `${this.nombre} (${this.convertirARomano(this.nombre)})`;
        titulo.className = "text-gray-900 dark:text-gray-100";
        contenedorTabla.appendChild(titulo);

        // Crear la tabla
        const tablaElemento = document.createElement('table');
        tablaElemento.classList.add('tabulator'); // Usar la clase de Tabulator.js

        // Asegurarse de que el id de la tabla es correcto
        console.log(`Tabla creada con id: ${this.id}`);

        // Inicializar la tabla con Tabulator
        new Tabulator(`#${this.id}`, {
            layout: "fitColumns",
            columns: [
                { title: "Valor", field: "valor", editor: "input" }
            ],
            cellEdited: (cell) => {
                this.actualizarResumen();
            }
        });

        // Añadir la tabla al contenedor
        contenedorTabla.appendChild(tablaElemento);

        // Devuelve el contenedor que contiene la tabla
        return contenedorTabla;
    }

    convertirARomano(num) {
        const romanos = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
        return romanos[num - 1] || num;
    }

    actualizarResumen() {
        const resumen = document.getElementById('resumen');
        resumen.innerHTML = ''; // Limpiar el resumen antes de actualizar

        const tablas = [this]; // Agregar otras tablas aquí si es necesario

        const resumenDatos = tablas.map(tabla => {
            return {
                nombre: tabla.nombre,
                valor: tabla.obtenerDatos(),
            };
        });

        // Crear una tabla de resumen con Tabulator
        new Tabulator('#resumen', {
            layout: "fitColumns",
            columns: [
                { title: "Items", field: "nombre" },
                { title: "Valor", field: "valor" },
            ],
            data: resumenDatos,
        });
    }
}
