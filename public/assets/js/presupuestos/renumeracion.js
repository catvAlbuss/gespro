class Remuneraciones {
    constructor() {
        // Datos iniciales basados en la imagen
        this.dataTrabajadores = [
            { porcentaje: 100, cantidad: 1, item: "Ingeniero Principal Residente de la Obra", meses: 6.00, precioUnitario: 9500.00, snp: 1240.98, asignacionFamiliar: 46.00, essalud: 855.00, cts: 861.79, vacaciones: 795.50, gratifica: 795.50, totalPagarMes: 12853.79 },
        ];

        // Filas estáticas - solo MENSUAL y TOTAL
        this.filasEstaticas = [
            { item: "MENSUAL", isStaticRow: true },
            { item: "TOTAL", isStaticRow: true }
        ];

        // Instancia de Tabulator
        this.tabla = null;

        // Agregar debounce para cálculos
        this.debouncedActualizarTotales = this.debounce(this.actualizarTotales.bind(this), 250);
        
        // Inicializar la tabla después de cargar datos
        this.loadData();
    }

    init() {
        try {
            this.configurarTabula();
            this.setupEventListeners();
        } catch (error) {
            this.handleError('Error en inicialización', error);
        }
    }

    setupEventListeners() {
        // Uso de querySelector para mayor compatibilidad
        const addButton = document.querySelector(".add-row-father-remuneracion");
        if (addButton) {
            // Asegurarse de eliminar listeners previos para evitar duplicaciones
            addButton.removeEventListener("click", this.handleAddButtonClick);
            addButton.addEventListener("click", this.handleAddButtonClick);
        } else {
            console.warn("Botón de agregar no encontrado");
        }
    }

    handleAddButtonClick = () => {
        this.agregarFilaUnica();
    }

    agregarFilaUnica() {
        try {
            const idUnico = Date.now();
            const nuevaFila = {
                id: idUnico,
                porcentaje: 0,
                cantidad: 1,
                item: "Nuevo Personal",
                meses: 1,
                precioUnitario: 0,
                snp: 0,
                asignacionFamiliar: 0,
                essalud: 0,
                cts: 0,
                vacaciones: 0,
                gratifica: 0,
                totalPagarMes: 0,
            };

            // Obtenemos solo las filas no estáticas (trabajadores)
            const todasLasFilas = this.tabla.getRows();
            const filasNoEstaticas = todasLasFilas.filter(row => !row.getData().isStaticRow);
            
            // Limpiamos la tabla completamente
            this.tabla.clearData();
            
            // Agregamos las filas de trabajadores más la nueva fila
            const nuevasFilas = [...filasNoEstaticas.map(row => row.getData()), nuevaFila];
            this.tabla.addData(nuevasFilas);
            
            // Recalculamos el nuevo registro
            const nuevaFilaRow = this.tabla.getRow(idUnico);
            if (nuevaFilaRow) {
                this.recalcularmonto(nuevaFilaRow);
            }
            
            // Actualizamos totales (esto añadirá las filas estáticas)
            this.actualizarTotales();
        } catch (error) {
            console.error("Error al agregar nueva fila:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al agregar la nueva fila.'
            });
        }
    }

    configurarTabula() {
        try {
            // Comenzamos solo con los datos de trabajadores
            // Las filas estáticas se añadirán en actualizarTotales()
            const columnas = [
                {
                    title: "",
                    field: "delete",
                    formatter: (cell, formatterParams, onRendered) => {
                        if (!cell.getRow().getData().isStaticRow) {
                            return '<button class="btn-delete-row">❌</button>';
                        }
                        return '';
                    },
                    width: 40,
                    hozAlign: "center",
                    cellClick: (e, cell) => {
                        if (!cell.getRow().getData().isStaticRow) {
                            cell.getRow().delete();
                            this.actualizarTotales();
                        }
                    }
                },
                {
                    title: "% Particip.", field: "porcentaje", hozAlign: "center", formatter: "html", editor: "number",
                    cellEdited: (cell) => {
                        this.recalcularmonto(cell.getRow());
                    },
                    formatter: function (cell) {
                        const value = cell.getValue();
                        return value ? value + "%" : "";
                    },
                    editable: function (cell) { return !cell.getRow().getData().isStaticRow; }
                },
                {
                    title: "Cant.", field: "cantidad", hozAlign: "center", editor: "number",
                    cellEdited: (cell) => {
                        this.recalcularmonto(cell.getRow());
                    },
                    editable: function (cell) { return !cell.getRow().getData().isStaticRow; }
                },
                {
                    title: "PERSONAL TÉCNICO ADMINISTRATIVO",
                    field: "item",
                    editor: "input",
                    width: 300,
                    editable: function (cell) { return !cell.getRow().getData().isStaticRow; }
                },
                {
                    title: "Meses", field: "meses", hozAlign: "center", editor: "number", formatter: "money", formatterParams: { precision: 2 },
                    cellEdited: (cell) => {
                        this.recalcularmonto(cell.getRow());
                    },
                    editable: function (cell) { return !cell.getRow().getData().isStaticRow; }
                },
                {
                    title: "Precio Unitario", field: "precioUnitario", hozAlign: "right", editor: "number", formatter: "money", formatterParams: { precision: 2 },
                    cellEdited: (cell) => {
                        this.recalcularmonto(cell.getRow());
                    },
                    editable: function (cell) { return !cell.getRow().getData().isStaticRow; }
                },
                { title: "SNP", field: "snp", hozAlign: "right", formatter: "money", formatterParams: { precision: 2 }, editor: false },
                { title: "Asignación Familiar", field: "asignacionFamiliar", hozAlign: "right", formatter: "money", formatterParams: { precision: 2 }, editor: false },
                { title: "ESSALUD", field: "essalud", hozAlign: "right", formatter: "money", formatterParams: { precision: 2 }, editor: false },
                { title: "CTS", field: "cts", hozAlign: "right", formatter: "money", formatterParams: { precision: 2 }, editor: false },
                { title: "Vacaciones", field: "vacaciones", hozAlign: "right", formatter: "money", formatterParams: { precision: 2 }, editor: false },
                { title: "Gratifica.", field: "gratifica", hozAlign: "right", formatter: "money", formatterParams: { precision: 2 }, editor: false },
                { title: "Total a Pagar por Mes", field: "totalPagarMes", hozAlign: "right", formatter: "money", formatterParams: { precision: 2 }, editor: false }
            ];

            this.tabla = new Tabulator("#renumeracionBase", {
                layout: "fitColumns",
                data: this.dataTrabajadores,  // Solo los datos de trabajadores inicialmente
                columns: columnas,
                rowFormatter: function (row) {
                    // Estilo especial para filas estáticas
                    if (row.getData().isStaticRow) {
                        row.getElement().style.backgroundColor = "#e6f7ff";
                        row.getElement().style.fontWeight = "bold";
                    }
                },
                dataLoaded: () => {
                    // Asegurarnos de que los datos se carguen correctamente antes de actualizar los totales
                    setTimeout(() => this.actualizarTotales(), 100);
                }
            });

            this.tabla.on("cellEdited", () => this.debouncedActualizarTotales());
            this.setupEventListeners();
        } catch (error) {
            console.error("Error al configurar la tabla:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al configurar la tabla.'
            });
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    recalcularmonto(row) {
        const data = row.getData();
        if (data.isStaticRow) return;

        try {
            const porcentaje = parseFloat(data.porcentaje) || 0;
            const cantidad = parseFloat(data.cantidad) || 0;
            const precioUnitario = parseFloat(data.precioUnitario) || 0;

            const asignacionFamiliar = 46 * (porcentaje / 100) * cantidad;
            const snp = (precioUnitario + asignacionFamiliar) * 0.13;
            const essalud = precioUnitario * 0.09;
            const vacaciones = (precioUnitario + asignacionFamiliar) / 12;
            const gratificacion = (precioUnitario + asignacionFamiliar) / 12;
            const cts = (precioUnitario + asignacionFamiliar + gratificacion) * 0.083333;

            const totalPagarMes = precioUnitario + asignacionFamiliar + essalud + cts + vacaciones + gratificacion;

            row.update({
                asignacionFamiliar,
                snp,
                essalud,
                cts,
                vacaciones,
                gratifica: gratificacion,
                totalPagarMes
            }, false);
        } catch (error) {
            console.error("Error en recalcularmonto:", error);
        }
    }

    actualizarTotales() {
        if (!this.tabla) return;

        try {
            // Eliminamos SOLO las filas estáticas existentes
            const rows = this.tabla.getRows();
            const filasEstaticas = rows.filter(row => row.getData().isStaticRow);
            filasEstaticas.forEach(row => row.delete());

            // Obtenemos las filas de trabajadores actuales
            const trabajadores = this.tabla.getRows();

            let totalesMensuales = {
                meses: 0,
                precioUnitario: 0,
                snp: 0,
                asignacionFamiliar: 0,
                essalud: 0,
                cts: 0,
                vacaciones: 0,
                gratifica: 0,
                totalPagarMes: 0
            };

            let totalesGenerales = {
                meses: 0,
                precioUnitario: 0,
                snp: 0,
                asignacionFamiliar: 0,
                essalud: 0,
                cts: 0,
                vacaciones: 0,
                gratifica: 0,
                totalPagarMes: 0
            };

            trabajadores.forEach(row => {
                const data = row.getData();
                const meses = parseFloat(data.meses) || 0;

                Object.keys(totalesMensuales).forEach(key => {
                    if (key === 'meses') {
                        totalesMensuales[key] = Math.max(totalesMensuales[key], meses);
                    } else {
                        const valor = parseFloat(data[key]) || 0;
                        totalesMensuales[key] += valor;
                    }
                });

                Object.keys(totalesGenerales).forEach(key => {
                    if (key === 'meses') {
                        totalesGenerales[key] = Math.max(totalesGenerales[key], meses);
                    } else {
                        const valor = parseFloat(data[key]) || 0;
                        totalesGenerales[key] += valor * meses;
                    }
                });
            });

            // Creamos solo DOS filas estáticas: MENSUAL y TOTAL
            const filaMensual = {
                item: "MENSUAL",
                isStaticRow: true,
                meses: totalesMensuales.meses,
                precioUnitario: totalesMensuales.precioUnitario,
                snp: totalesMensuales.snp,
                asignacionFamiliar: totalesMensuales.asignacionFamiliar,
                essalud: totalesMensuales.essalud,
                cts: totalesMensuales.cts,
                vacaciones: totalesMensuales.vacaciones,
                gratifica: totalesMensuales.gratifica,
                totalPagarMes: totalesMensuales.totalPagarMes
            };

            const filaTotal = {
                item: "TOTAL",
                isStaticRow: true,
                meses: totalesGenerales.meses,
                precioUnitario: totalesGenerales.precioUnitario,
                snp: totalesGenerales.snp,
                asignacionFamiliar: totalesGenerales.asignacionFamiliar,
                essalud: totalesGenerales.essalud,
                cts: totalesGenerales.cts,
                vacaciones: totalesGenerales.vacaciones,
                gratifica: totalesGenerales.gratifica,
                totalPagarMes: totalesGenerales.totalPagarMes
            };

            // Agregamos solo las dos filas estáticas
            this.tabla.addData([filaMensual, filaTotal]);
        } catch (error) {
            console.error("Error en actualizarTotales:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al actualizar los totales'
            });
        }
    }

    loadData() {
        const id_presupuesto = document.getElementById('id_presupuestos')?.value;

        if (!id_presupuesto) {
            // Si no hay ID de presupuesto, configuramos la tabla con los datos por defecto
            this.init();
            return;
        }

        Swal.fire({
            title: 'Cargando...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        $.ajax({
            url: "/obtener-remuneraciones",
            type: "POST",
            data: JSON.stringify({ id_presupuesto }),
            contentType: "application/json",
            dataType: "json",
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
            },
            success: (response) => {
                Swal.close();
                if (response.status === "success" && response.data && response.data.remuneraciones) {
                    try {
                        // Solo tomamos las filas que NO son estáticas
                        const datosCargados = JSON.parse(response.data.remuneraciones);
                        this.dataTrabajadores = datosCargados.filter(row => !row.isStaticRow);
                        
                        // Si no hay datos, mantenemos al menos el registro por defecto
                        if (this.dataTrabajadores.length === 0) {
                            this.dataTrabajadores = [
                                { porcentaje: 100, cantidad: 1, item: "Ingeniero Principal Residente de la Obra", meses: 6.00, precioUnitario: 9500.00, snp: 1240.98, asignacionFamiliar: 46.00, essalud: 855.00, cts: 861.79, vacaciones: 795.50, gratifica: 795.50, totalPagarMes: 12853.79 }
                            ];
                        }
                    } catch (e) {
                        console.error("Error al procesar datos:", e);
                    }
                }
                
                // Siempre inicializamos la tabla
                this.init();
                this.updateData();
            },
            error: (xhr, status, error) => {
                Swal.close();
                console.error("Error al cargar datos:", error);
                // Usamos los datos por defecto y continuamos
                this.init();
                this.updateData();
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudieron cargar los datos del balance."
                });
            }
        });
    }

    updateData() {
        const id_presupuesto = document.getElementById('id_presupuestos')?.value;
        if (!id_presupuesto) {
            console.warn("ID de presupuesto no encontrado para guardar");
            return;
        }

        const guardarBtn = document.getElementById('guardarRemuneracion');
        if (!guardarBtn) {
            console.warn("Botón de guardar no encontrado");
            return;
        }

        guardarBtn.removeEventListener('click', this.handleSaveButtonClick);
        guardarBtn.addEventListener('click', this.handleSaveButtonClick);
    }

    handleSaveButtonClick = () => {
        const id_presupuesto = document.getElementById('id_presupuestos')?.value;
        if (!id_presupuesto) {
            console.warn("ID de presupuesto no encontrado para guardar");
            return;
        }

        // Solo guardamos las filas que NO son estáticas
        //const dataRemuneracion = this.tabla.getData().filter(row => !row.isStaticRow);
        const dataRemuneracion = this.tabla.getData();

        if (dataRemuneracion.length === 0) {
            console.warn('No hay datos de remuneración para guardar');
            Swal.fire({
                icon: 'warning',
                title: 'Sin datos',
                text: 'No hay datos de remuneración para guardar.'
            });
            return;
        }

        Swal.fire({
            title: 'Guardando datos...',
            text: 'Por favor espere',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        fetch(`/guardar-remuneraciones/${id_presupuesto}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify({
                remuneraciones: dataRemuneracion
            })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la respuesta del servidor');
                }
                return response.json();
            })
            .then(data => {
                Swal.fire({
                    icon: 'success',
                    title: 'Datos guardados correctamente',
                    text: 'Los datos de remuneración han sido guardados con éxito.'
                });
            })
            .catch(error => {
                console.error("Error al guardar los datos:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un problema al guardar los datos de remuneración.'
                });
            });
    }
    
    // Método auxiliar para manejar errores
    handleError(message, error) {
        console.error(message, error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message
        });
    }
}

export default Remuneraciones;