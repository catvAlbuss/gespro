
class Table {
    constructor(TableDetails) {
        this.table = null;
        this.TableDetails = TableDetails;
        this.tableDetails = new TableDetails();
        this.initAddParentButton();
        this.initializeButtons();
        this.currentRow = null; // Agregar esta línea para mantener referencia a la fila actual
        //this.resumenMetrados = new ResumenMetrados();
        this.apiUrl = "/obtener-metrados"; // Ruta en Laravel
        this.datosBase = []; // Inicializamos datosBase como array vacío en lugar de null

        // Primero cargar los datos base del servidor
        this.getDataServidor().then(() => {
            // Una vez que tengamos los datos, inicializamos la tabla y los botones
            this.init();
            this.initAddParentButton();
            this.initializeButtons();
            console.log("Datos cargados: ", this.datosBase);
        }).catch(error => {
            console.error("Error al cargar los datos:", error);
            // En caso de error, inicializamos con datos vacíos
            this.datosBase = [];
            this.init();
            this.initAddParentButton();
            this.initializeButtons();
        });
    }

    async getSampleData() {
        const fetchMetradosData = async (proyectoId, selectedOptions, token) => {
            try {
                // Mostrar un indicador de carga
                $("#loading-indicator").show();

                const response = await $.ajax({
                    url: this.apiUrl,
                    type: "POST",
                    dataType: "json",
                    data: {
                        proyecto_id: proyectoId,
                        ...selectedOptions
                    },
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    }
                });

                // Ocultar el indicador de carga
                $("#loading-indicator").hide();

                console.log("Respuesta del servidor:", response);

                // Verificar la estructura de la respuesta
                if (response.error) {
                    this.showNotification('error', response.error);
                    return [];
                }

                if (response.warning) {
                    this.showNotification('warning', response.warning);
                    return [];
                }

                // Si hay datos, devolverlos
                if (response.data && Array.isArray(response.data)) {
                    return response.data;
                }

                // Si no hay una estructura esperada, pero hay datos, intentar usarlos directamente
                if (Array.isArray(response)) {
                    return response;
                }

                return [];
            } catch (error) {
                // Ocultar el indicador de carga en caso de error
                $("#loading-indicator").hide();

                console.error("Error al obtener metrados:", error);

                // Mostrar mensaje de error amigable
                if (error.responseJSON && error.responseJSON.error) {
                    this.showNotification('error', error.responseJSON.error);
                } else {
                    this.showNotification('error', 'Error al cargar los datos. Por favor, inténtelo de nuevo.');
                }

                return [];
            }
        };

        // Nueva función para organizar y ordenar los datos
        const organizeAndSortData = (data) => {
            if (!Array.isArray(data) || data.length === 0) {
                return [];
            }

            // Crear una copia para no modificar los datos originales
            let organizedData = [...data];

            try {
                // Ordenar los datos por nivel jerárquico si existe
                organizedData.sort((a, b) => {
                    // Primero por nivel jerárquico si existe
                    if (a.nivel !== undefined && b.nivel !== undefined) {
                        return a.nivel - b.nivel;
                    }

                    // Si no tienen nivel pero tienen código, ordenar por código
                    if (a.codigo && b.codigo) {
                        return a.codigo.localeCompare(b.codigo);
                    }

                    return 0;
                });

                // Establecer correctamente las relaciones padre-hijo para la estructura jerárquica
                const idMap = new Map();
                organizedData.forEach(item => {
                    if (item.id) {
                        idMap.set(item.id, item);
                    }
                });

                // Reconstruir la estructura jerárquica
                for (let i = organizedData.length - 1; i >= 0; i--) {
                    const item = organizedData[i];

                    if (item.parent_id && idMap.has(item.parent_id)) {
                        const parent = idMap.get(item.parent_id);

                        // Inicializar children si no existe
                        if (!parent._children) {
                            parent._children = [];
                        }

                        // Verificar que el elemento no esté ya en children para evitar duplicados
                        const isDuplicate = parent._children.some(child => child.id === item.id);
                        if (!isDuplicate) {
                            parent._children.push(item);
                        }
                    }
                }

                // Filtrar para solo mantener elementos raíz en el resultado final
                organizedData = organizedData.filter(item => !item.parent_id || !idMap.has(item.parent_id));

                // Agregar propiedades adicionales que Tabulator necesita para mostrar correctamente la estructura jerárquica
                const addTabulatorProperties = (items) => {
                    if (!items) return;

                    items.forEach(item => {
                        if (item._children && item._children.length > 0) {
                            item._children = addTabulatorProperties(item._children);
                        }
                    });

                    return items;
                };

                organizedData = addTabulatorProperties(organizedData);

                console.log("Datos organizados y ordenados:", organizedData);
                return organizedData;
            } catch (error) {
                console.error("Error al organizar los datos:", error);
                return data; // Devolver datos originales si hay error en la organización
            }
        };

        return new Promise((resolve) => {
            $("#obtenerResumenMetrados").off("click").on("click", async (event) => {
                event.preventDefault(); // Evita la recarga de la página

                // Limpiar datos existentes
                this.table.clearData();

                const proyectoId = $("#proyecto_id").val();

                // Validar que se haya seleccionado un proyecto
                if (!proyectoId) {
                    this.showNotification('error', 'Debe seleccionar un proyecto');
                    resolve(this.datosBase);
                    return;
                }

                const token = localStorage.getItem("auth_token");

                // Validar si se ha seleccionado al menos una categoría
                const selectedOptions = {
                    estructura: $("#estructura-checkbox").is(":checked"),
                    arquitectura: $("#arquitectura-checkbox").is(":checked"),
                    sanitarias: $("#sanitarias-checkbox").is(":checked"),
                    electricas: $("#electricas-checkbox").is(":checked"),
                    comunicacion: $("#comunicacion-checkbox").is(":checked"),
                    gas: $("#gas-checkbox").is(":checked"),
                };

                const hasSelection = Object.values(selectedOptions).some(value => value === true);
                console.log("¿Hay selección?:", hasSelection);

                if (!hasSelection) {
                    this.showNotification('error', 'Debe seleccionar al menos una categoría');
                    resolve(this.datosBase);
                    return;
                }

                console.log("Opciones seleccionadas:", selectedOptions);

                try {
                    // Mostrar indicador de procesamiento
                    $("#processing-indicator").show();

                    // Obtener datos del servidor
                    const rawData = await fetchMetradosData(proyectoId, selectedOptions, token);
                    console.log("Datos obtenidos del servidor:", rawData);

                    // Organizar y ordenar los datos
                    const processedData = organizeAndSortData(rawData);
                    console.log("Datos procesados:", processedData);

                    // Ocultar indicador de procesamiento
                    $("#processing-indicator").hide();

                    // Cargar los datos en la tabla
                    if (Array.isArray(processedData) && processedData.length > 0) {
                        this.table.setData(processedData)
                            .then(() => {
                                this.showNotification('success', 'Datos cargados correctamente');
                                this.calculateSubtotals();
                            })
                            .catch(error => {
                                console.error("Error al establecer datos en la tabla:", error);
                                this.showNotification('error', 'Error al renderizar la tabla');
                            });
                        resolve(processedData);
                    } else {
                        this.showNotification('warning', 'No se encontraron datos para mostrar');
                        this.table.setData(this.datosBase);
                        resolve(this.datosBase);
                    }
                } catch (error) {
                    console.error("Error en getSampleData:", error);
                    this.showNotification('error', 'Error al procesar los datos');
                    this.table.setData(this.datosBase);
                    resolve(this.datosBase);
                }
            });

            // Resolver con datos base por defecto
            // Si no se hace clic en el botón, resolver con los datos base
            console.log("Retornando datos base:", this.datosBase);

            // Verificar que datosBase exista y sea un array
            if (!this.datosBase || !Array.isArray(this.datosBase)) {
                this.datosBase = [];
            }

            resolve(this.datosBase);
        });
    }

    // Método para mostrar notificaciones
    showNotification(type, message) {
        // Si existe Toastr u otra librería de notificaciones
        if (typeof toastr !== 'undefined') {
            toastr[type](message);
        } else {
            // Alternativa simple usando alert
            if (type === 'error') {
                Swal.fire({
                    title: "Error en procesar datos",
                    text: message,
                    icon: "error"
                });
                //alert('Error: ' + message);
            } else if (type === 'warning') {
                Swal.fire({
                    title: "Advertencia",
                    text: message,
                    icon: "warning"
                });
                //alert('Advertencia: ' + message);
            } else {
                Swal.fire({
                    title: message,
                    icon: "success"
                });
                //alert(message);
            }
        }
    }

    // Método para obtener datos del servidor - nombre corregido para seguir convenciones
    getDataServidor() {
        return new Promise((resolve, reject) => {
            const id_presupuesto = document.getElementById('id_presupuestos').value;

            if (!id_presupuesto) {
                console.warn("No se encontró ID de presupuesto, usando datos predeterminados");
                this.datosBase = this.database(); // Suponiendo que database() es un método que devuelve datos predeterminados
                resolve();
                return;
            }

            const dataToSend = {
                id: id_presupuesto,
            };
            const obtenerdata = JSON.stringify(dataToSend);

            $.ajax({
                url: '/obtener-presupuestos',  // Ruta de Laravel
                method: 'POST',
                data: obtenerdata,  // Enviar datos como JSON
                contentType: 'application/json',
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')  // Token CSRF
                },
                success: (response) => {
                    console.log("Respuesta del servidor:", response);

                    // Verificamos que la respuesta sea válida
                    if (!response || !response.data || !response.data[0] || !response.data[0].datapresupuestos) {
                        console.warn("Respuesta del servidor no contiene datos de presupuestos, usando datos predeterminados");
                        this.datosBase = this.database();
                    } else {
                        try {
                            // Intentamos parsear los datos
                            const parsedData = JSON.parse(response.data[0].datapresupuestos);

                            //Cargar datos:
                            document.getElementById('costodirecto').textContent = parseFloat(response.data[0].costo_directo);
                            document.getElementById('porcentajegastos').value = parseFloat(response.data[0].gastosgenerales); // Ajusta la propiedad según corresponda
                            document.getElementById('porcentajeutilidad').value = parseFloat(response.data[0].utilidades); // Ajusta la propiedad según corresponda
                            document.getElementById('porcentajeigv').value = parseFloat(response.data[0].igv); // Ajusta la propiedad según corresponda
                            document.getElementById("elabexpetecnico").value = parseFloat(response.data[0].expediente); // Ajusta la propiedad según corresponda
                            document.getElementById('porcentajegasoperacion').value = parseFloat(response.data[0].gastosupervicion); // Ajusta la propiedad según corresponda
                            if (Array.isArray(parsedData)) {
                                this.datosBase = parsedData;
                            } else {
                                console.warn("Los datos parseados no son un array, usando datos predeterminados");
                                this.datosBase = this.database();
                            }
                        } catch (e) {
                            console.error("Error al parsear datos:", e);
                            this.datosBase = this.database();
                        }
                    }

                    console.log('Datos base cargados:', this.datosBase);
                    resolve();  // Resolvemos la promesa una vez que los datos están listos
                },
                error: (xhr) => {
                    console.error('Error en la llamada AJAX:', xhr.responseText);
                    // En caso de error, establecemos los datos predeterminados
                    this.datosBase = this.database();
                    reject(xhr.responseText);  // Rechazamos la promesa en caso de error
                }
            });
        });
    }

    // Datos predeterminados si la respuesta es nula o no contiene datapresupuestos
    database() {
        return [
            {
                id: 1,
                item: '01',
                descripcion: "Carpeta 1",
                _children: [
                    {
                        id: 2,
                        item: '01.01',
                        descripcion: "Documento 1.1",
                        _children: [
                            {
                                id: 3,
                                item: '01.01.01',
                                descripcion: "Documento 1.1.1",
                                unidad: "File",
                                cantidad: 2,
                                precio: 176.00,
                                parcial: 352.00,
                                detalles: {
                                    rendimiento: 20,
                                    unidadMD: "m²",
                                    manoObra: [
                                        {
                                            ind: "MO",
                                            codelect: "MO001",
                                            descripcion: "Operario",
                                            und: "hh",
                                            recursos: "1",
                                            cantidad: 2,
                                            precio: 15.50,
                                            parcial: 31.00
                                        },
                                        {
                                            ind: "MO",
                                            codelect: "MO002",
                                            descripcion: "Peón",
                                            und: "hh",
                                            recursos: "2",
                                            cantidad: 4,
                                            precio: 10.75,
                                            parcial: 43.00
                                        }
                                    ],
                                    materiales: [
                                        {
                                            ind: "MT",
                                            codelect: "MT001",
                                            descripcion: "Cemento Portland",
                                            und: "bls",
                                            recursos: "-",
                                            cantidad: 3,
                                            precio: 25.50,
                                            parcial: 76.50
                                        }
                                    ],
                                    equipos: [
                                        {
                                            ind: "EQ",
                                            codelect: "EQ001",
                                            descripcion: "Mezcladora",
                                            und: "hm",
                                            recursos: "1",
                                            cantidad: 2,
                                            precio: 12.75,
                                            parcial: 25.50
                                        }
                                    ]
                                },
                                observacion: "Observación del documento 1.1.1",
                            },
                            {
                                id: 4,
                                item: '01.01.02',
                                descripcion: "Documento mejorado 1.1.2",
                                unidad: "kg",
                                cantidad: 2,
                                detalles: {}
                            }
                        ]
                    }
                ]
            },
            {
                id: 5,
                item: '02',
                descripcion: "Carpeta 2",
                _children: [
                    {
                        id: 7,
                        item: '02.01',
                        descripcion: "Documento 1.1",
                        _children: [
                            {
                                id: 8,
                                item: '02.01.01',
                                descripcion: "Documento 2.1.1",
                                unidad: "und",
                                cantidad: 2,
                                precio: 100.00,
                                parcial: 200.00,
                                detalles: {}
                            },
                            {
                                id: 9,
                                item: '02.01.02',
                                descripcion: "Documento 2.1.2",
                                unidad: "und",
                                cantidad: 2,
                                precio: 120.00,
                                parcial: 240.00,
                                detalles: {}
                            }
                        ]
                    }
                ]
            }
        ];
    }
    // async getSampleData() {
    //     // return [
    //     //     {
    //     //         id: 1,
    //     //         item: '01',
    //     //         descripcion: "Carpeta 1",
    //     //         _children: [
    //     //             {
    //     //                 id: 2,
    //     //                 item: '01.01',
    //     //                 descripcion: "Documento 1.1",
    //     //                 _children: [
    //     //                     {
    //     //                         id: 3,
    //     //                         item: '01.01.01',
    //     //                         descripcion: "Documento 1.1.1",
    //     //                         unidad: "File",
    //     //                         cantidad: 2,
    //     //                         precio: 176.00,
    //     //                         parcial: 352.00,
    //     //                         detalles: {
    //     //                             rendimiento: 20,
    //     //                             unidadMD: "m²",
    //     //                             manoObra: [
    //     //                                 {
    //     //                                     ind: "MO",
    //     //                                     codelect: "MO001",
    //     //                                     descripcion: "Operario",
    //     //                                     und: "hh",
    //     //                                     recursos: "1",
    //     //                                     cantidad: 2,
    //     //                                     precio: 15.50,
    //     //                                     parcial: 31.00
    //     //                                 },
    //     //                                 {
    //     //                                     ind: "MO",
    //     //                                     codelect: "MO002",
    //     //                                     descripcion: "Peón",
    //     //                                     und: "hh",
    //     //                                     recursos: "2",
    //     //                                     cantidad: 4,
    //     //                                     precio: 10.75,
    //     //                                     parcial: 43.00
    //     //                                 }
    //     //                             ],
    //     //                             materiales: [
    //     //                                 {
    //     //                                     ind: "MT",
    //     //                                     codelect: "MT001",
    //     //                                     descripcion: "Cemento Portland",
    //     //                                     und: "bls",
    //     //                                     recursos: "-",
    //     //                                     cantidad: 3,
    //     //                                     precio: 25.50,
    //     //                                     parcial: 76.50
    //     //                                 }
    //     //                             ],
    //     //                             equipos: [
    //     //                                 {
    //     //                                     ind: "EQ",
    //     //                                     codelect: "EQ001",
    //     //                                     descripcion: "Mezcladora",
    //     //                                     und: "hm",
    //     //                                     recursos: "1",
    //     //                                     cantidad: 2,
    //     //                                     precio: 12.75,
    //     //                                     parcial: 25.50
    //     //                                 }
    //     //                             ]
    //     //                         },
    //     //                         observacion: "Observación del documento 1.1.1",
    //     //                     },
    //     //                     {
    //     //                         id: 4,
    //     //                         item: '01.01.02',
    //     //                         descripcion: "Documento mejorado 1.1.2",
    //     //                         unidad: "kg",
    //     //                         cantidad: 2,
    //     //                         detalles: {}
    //     //                     }
    //     //                 ]
    //     //             }
    //     //         ]
    //     //     },
    //     //     {
    //     //         id: 5,
    //     //         item: '02',
    //     //         descripcion: "Carpeta 2",
    //     //         _children: [
    //     //             {
    //     //                 id: 7,
    //     //                 item: '02.01',
    //     //                 descripcion: "Documento 1.1",
    //     //                 _children: [
    //     //                     {
    //     //                         id: 8,
    //     //                         item: '02.01.01',
    //     //                         descripcion: "Documento 2.1.1",
    //     //                         unidad: "und",
    //     //                         cantidad: 2,
    //     //                         precio: 100.00,
    //     //                         parcial: 200.00,
    //     //                         detalles: {}
    //     //                     },
    //     //                     {
    //     //                         id: 9,
    //     //                         item: '02.01.02',
    //     //                         descripcion: "Documento 2.1.2",
    //     //                         unidad: "und",
    //     //                         cantidad: 2,
    //     //                         precio: 120.00,
    //     //                         parcial: 240.00,
    //     //                         detalles: {}
    //     //                     }
    //     //                 ]
    //     //             }

    //     //         ]
    //     //     },
    //     // ];
    //     try {
    //         const data = await this.resumenMetrados.getMetrados();
    //         console.log("Datos obtenidos:", data);
    //         return Array.isArray(data) ? data : []; // 🔹 Garantizar siempre un array
    //     } catch (error) {
    //         console.error('Error en getSampleData:', error);
    //         return [];
    //     }
    // }


    async init() {
        this.table = new Tabulator("#tabla", {
            dataTree: true,
            dataTreeStartExpanded: false, // Cambiado a false para mejorar rendimiento inicial
            layout: "fitColumns",
            maxHeight: "100%",
            virtualDom: false,  // Evita ciclos de renderizado
            renderVerticalBuffer: 500,  // Mejora rendimiento
            progressiveLoad: "load", // Carga progresiva para mejorar rendimiento
            progressiveLoadDelay: 200, // Pequeño retraso para mejor UI
            paginationSize: 50, // Paginar para mejorar rendimiento con grandes conjuntos de datos
            ajaxContentType:"json",
            columns: [
                { title: "Item", field: "item", width: 100 },
                { title: "Descripcion", field: "descripcion", widthGrow: 1, editor: "input" },
                {
                    title: "und.", field: "unidad", widthGrow: 1, editor: "input", headerVertical: true,
                    cellEdited: (cell) => {
                        // Actualizar botones cuando se edita la unidad
                        this.updateRowButtons(cell.getRow());
                    }
                },
                {
                    title: "Cant.",
                    field: "cantidad",
                    widthGrow: 1,
                    editor: "number",
                    headerVertical: true,
                    formatter: function (cell, formatterParams, onRendered) {
                        // Get the value for either "cantidad" or "totalnieto"
                        return cell.getValue() || cell.getRow().getData().totalnieto;
                    },
                    cellEdited: (cell) => {
                        const row = cell.getRow();
                        const data = row.getData();
                        const parcial = (data.cantidad || 0) * (data.precio || 0);
                        row.update({ parcial: parcial });

                        // Actualizar botones cuando se edita la cantidad
                        this.updateRowButtons(row);
                    }
                },
                {
                    title: "Precio<br>Unit.",
                    field: "precio",
                    widthGrow: 1,
                    headerVertical: true,
                    formatter: "money",
                    formatterParams: {
                        decimal: ".",
                        thousand: ",",
                        precision: 2
                    }
                },
                {
                    title: "Parcial",
                    field: "parcial",
                    widthGrow: 1,
                    headerVertical: true,
                    formatter: "money",
                    formatterParams: {
                        decimal: ".",
                        thousand: ",",
                        precision: 2
                    },
                    cellEdited: (cell) => {
                        this.calculateSubtotals(); // Recalcular cuando cambie parcial
                    }
                },
                {
                    title: "Subtotal",
                    field: "subtotal",
                    widthGrow: 1,
                    headerVertical: true,
                    bottomCalc: "sum",
                    bottomCalcFormatter: "money",
                    formatterParams: {
                        decimal: ".",
                        thousand: ",",
                        precision: 2
                    },
                    formatter: function (cell) {
                        const data = cell.getRow().getData();
                        if (data.unidad) {
                            return "";
                        }
                        const value = cell.getValue();
                        return value ? Number(value).toFixed(2) : "0.00";
                    }
                },
                {
                    title: "",
                    width: 100, // Aumentar ancho para el nuevo botón
                    formatter: function (cell) {
                        const row = cell.getRow();
                        const data = row.getData();

                        // Solo mostrar botones si tiene unidad y cantidad
                        if (data.unidad && data.cantidad) {
                            return `
                                <button class='details-btn'>📇</button>
                                <button class='add-btn'>➕</button>
                                <button class='delete-btn'>🗑️</button>
                                <button class='observation-btn'>👁️‍🗨️</button>
                            `;
                        }
                        return `
                            <button class='add-btn'>➕</button>
                            <button class='delete-btn'>🗑️</button>
                            <button class='observation-btn'>👁️‍🗨️</button>
                        `;
                    },
                    cellClick: (e, cell) => {
                        const row = cell.getRow();
                        const data = row.getData();

                        if (e.target.classList.contains('details-btn')) {
                            if (data.unidad && data.cantidad) {
                                this.tableDetails.showDetails(row, (updatedData) => {
                                    const newPrecio = updatedData.precio;
                                    const newParcial = (data.cantidad || 0) * newPrecio;
                                    row.update({
                                        precio: newPrecio,
                                        parcial: newParcial,
                                        detalles: updatedData.detalles,
                                        rendimiento: updatedData.rendimiento
                                    });
                                    this.calculateSubtotals();
                                });
                            }
                        } else if (e.target.classList.contains('add-btn')) {
                            this.addNewRow(row);
                        } else if (e.target.classList.contains('delete-btn')) {
                            this.deleteRow(row);
                        } else if (e.target.classList.contains('observation-btn')) {
                            this.showObservation(row);
                        }
                    }
                }
            ],
            dataLoaded: (data) => {
                this.calculateSubtotals();
            },
            rowUpdated: (row) => {
                this.calculateSubtotals();
                this.updateRowButtons(row);
            },
            ajaxLoaderLoading: "<div class='loader-container'><div class='loader'></div></div>",
            ajaxLoaderError: "<div>Error al cargar datos</div>"
        });

        //Esperar hasta que Tabulator termine de construirse antes de cargar datos

        // Eliminar cualquier evento existente para evitar duplicación
        this.table.off("tableBuilt");

        // Esperar hasta que Tabulator termine de construirse antes de cargar datos
        this.table.on("tableBuilt", async () => {
            try {
                const data = await this.getSampleData();
                console.log("Datos iniciales cargados en Tabulator:", data);

                if (Array.isArray(data) && data.length > 0) {
                    this.table.setData(data);
                } else {
                    console.log("No hay datos iniciales para cargar");
                }
            } catch (error) {
                console.error('Error al cargar datos en la tabla:', error);
            }
        });

        // Agregar listener para recalcular subtotales después de cualquier cambio
        this.table.on("cellEdited", cell => {
            this.calculateSubtotals();
        });
    }

    initAddParentButton() {
        document.getElementById('addParentRow').addEventListener('click', () => {
            const lastRow = this.table.getRows().length > 0
                ? this.table.getRows()[this.table.getRows().length - 1]
                : null;

            const lastItem = lastRow ? lastRow.getData().item.split('.')[0] : "0";
            const nextItem = '0' + (parseInt(lastItem) + 1).toString();

            const newRow = {
                id: Date.now(),
                item: nextItem,
                descripcion: "Nueva Partida",
                unidad: "",
                cantidad: 0,
                precio: 0,
                parcial: 0,
                subtotal: 0,
                detalles: [],
                observacion: ""
            };

            this.table.addData([newRow]);
        });
    }

    // Método para actualizar los botones dinámicamente
    updateRowButtons(row) {
        // Redibuja toda la fila para actualizar los botones
        row.reformat();
    }

    addNewRow(parentRow) {
        const parentData = parentRow.getData();
        const children = parentRow.getTreeChildren() || [];
        const nextItem = this.calculateNextItem(parentData.item, children);

        const newRow = {
            id: Date.now(),
            item: nextItem,
            descripcion: "Nueva Fila",
            unidad: "",
            cantidad: "",
            precio: "",
            parcial: "",
            subtotal: "",
            detalles: [],
            observacion: ""
        };

        parentRow.addTreeChild(newRow);
        setTimeout(() => this.calculateSubtotals(), 100); // Asegurar que la fila se agregó
    }

    calculateNextItem(parentItem, children) {
        // Filtrar solo las filas numeradas y ordenarlas
        const numeratedItems = children
            .filter(child => {
                const data = child.getData();
                return data.item && !data.isDescriptionRow;
            })
            .map(child => child.getData().item)
            .sort((a, b) => {
                const partsA = a.split('.');
                const partsB = b.split('.');
                // Comparar cada nivel de la jerarquía
                for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
                    const numA = parseInt(partsA[i] || '0');
                    const numB = parseInt(partsB[i] || '0');
                    if (numA !== numB) return numA - numB;
                }
                return 0;
            });

        // Si no hay items numerados, empezar desde 01
        if (numeratedItems.length === 0) {
            return `${parentItem}${parentItem ? '.' : ''}01`;
        }

        // Obtener el último número usado en este nivel
        const lastItem = numeratedItems[numeratedItems.length - 1];
        const lastNumber = parseInt(lastItem.split('.').pop());

        // Generar el siguiente número
        const nextNumber = (lastNumber + 1).toString().padStart(2, '0');
        return `${parentItem}${parentItem ? '.' : ''}${nextNumber}`;
    }

    deleteRow(row) {
        if (confirm('¿Está seguro de eliminar esta fila?')) {
            const parent = row.getTreeParent();
            row.delete();
            if (parent) {
                this.reorderSiblings(parent.getTreeChildren());
            }
            setTimeout(() => this.calculateSubtotals(), 100); // Recalcular después de eliminar
        }
    }

    reorderSiblings(siblings) {
        siblings.forEach((sibling, index) => {
            const data = sibling.getData();
            const baseParts = data.item.toString().split('.');
            baseParts[baseParts.length - 1] = (index + 1).toString();
            sibling.update({ item: baseParts.join('.') });
        });
    }

    saveRowData(row) {
        const rowData = row.getData();
        // Aquí puedes enviar los datos al controlador
        this.sendToController({
            id: rowData.id,
            item: rowData.item,
            descripcion: rowData.descripcion,
            unidad: rowData.unidad,
            cantidad: rowData.cantidad,
            precio: rowData.precio,
            parcial: rowData.parcial,
            detalles: rowData.detalles,
            rendimiento: rowData.rendimiento
        });
    }

    sendToController(data) {
        // Ejemplo de cómo enviar datos al controlador
        console.log("Datos listos para enviar al controlador:", data);

        // Implementar llamada al controlador
        // fetch('/api/expediente/save', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(data)
        // })
        // .then(response => response.json())
        // .then(result => {
        //     console.log('Success:', result);
        // })
        // .catch(error => {
        //     console.error('Error:', error);
        // });
    }

    calculateSubtotals() {
        const processNode = (node) => {
            const data = node.getData();
            const children = node.getTreeChildren();

            if (!children || children.length === 0) {
                // Es una hoja
                return data.unidad ? (data.parcial || 0) : 0;
            }

            // Calcular suma de hijos
            const childrenSum = children.reduce((sum, child) => {
                return sum + processNode(child);
            }, 0);

            // Actualizar subtotal del nodo
            if (!data.unidad) {
                node.update({ subtotal: childrenSum });
            }

            return childrenSum;
        };

        // Procesar todos los nodos raíz
        const rootNodes = this.table.getRows().filter(row => !row.getTreeParent());
        rootNodes.forEach(node => {
            processNode(node);
        });
    }

    showObservation(row) {
        this.currentRow = row;
        const data = row.getData();
        const modal = document.getElementById('observationModal');
        const textarea = document.getElementById('observationText');
        const saveBtn = document.getElementById('saveObservation');
        const cancelBtn = document.getElementById('cancelObservation');

        // Mostrar observación existente si hay
        textarea.value = data.observacion || '';
        modal.classList.remove('hidden');

        // Manejadores de eventos
        const handleSave = () => {
            const observacion = textarea.value.trim();
            this.currentRow.update({ observacion: observacion });
            modal.classList.add('hidden');
            removeEventListeners();
        };

        const handleCancel = () => {
            modal.classList.add('hidden');
            removeEventListeners();
        };

        const handleClickOutside = (e) => {
            if (e.target === modal) {
                handleCancel();
            }
        };

        // Agregar event listeners
        saveBtn.addEventListener('click', handleSave);
        cancelBtn.addEventListener('click', handleCancel);
        modal.addEventListener('click', handleClickOutside);

        // Función para limpiar event listeners
        const removeEventListeners = () => {
            saveBtn.removeEventListener('click', handleSave);
            cancelBtn.removeEventListener('click', handleCancel);
            modal.removeEventListener('click', handleClickOutside);
        };
    }

    initializeButtons() {
        // Botón guardar datos
        document.getElementById('savedata').addEventListener('click', () => {
            this.resumenExpediente();
            const id_presupuesto = document.getElementById('id_presupuestos').value;
            const allData = this.table.getData();
            const costoDirecto = this.table.getRows()
                .filter(row => !row.getTreeParent()) // Solo nodos raíz
                .reduce((sum, row) => sum + (row.getData().subtotal || 0), 0);

            const porcentajeGastos = parseFloat(document.getElementById('porcentajegastos').value) || 0;
            const porcentajeUtilidad = parseFloat(document.getElementById('porcentajeutilidad').value) || 0;
            const porcentajeIGV = parseFloat(document.getElementById('porcentajeigv').value) || 0;
            const elabExpTecnico = parseFloat(document.getElementById("elabexpetecnico").value || 0);
            const porcentajeGastosOp = parseFloat(document.getElementById('porcentajegasoperacion').value) || 0;
            console.log("Datos completos de la tabla:", allData);
            const dataToSend = {
                id: id_presupuesto,
                gastosgenerales: porcentajeGastos,
                utilidades: porcentajeUtilidad,
                igv: porcentajeIGV,
                expediente: elabExpTecnico,
                gastosupervicion: porcentajeGastosOp,
                costo_directo: costoDirecto,
                datapresupuestos: allData,
            };
            const comprimido = JSON.stringify(dataToSend)
            console.log(comprimido);
            $.ajax({
                url: '/actualizar-presupuestos', // Laravel route
                method: 'POST',
                data: comprimido, // Send data as JSON
                contentType: 'application/json',
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') // Include CSRF token for Laravel
                },
                success: function (response) {
                    Swal.fire({
                        title: "Success",
                        text: response.message,
                        icon: "success"
                    });

                    console.log('Response:', response.message); // Success message from the server

                },
                error: function (xhr) {
                    Swal.fire({
                        title: "Error",
                        text: xhr.responseText,
                        icon: "error"
                    });
                    console.error('Error:', xhr.responseText); // Error response from the server
                }
            });
        });

        document.getElementById('download-xlsx').addEventListener('click', () => {
            const allData = this.table.getData();
            this.descargarExpediente(allData);
        });
        // Inputs con eventos 'input' para actualizar cálculos automáticamente
        const inputs = [
            'porcentajegastos',
            'porcentajeutilidad',
            'porcentajeigv',
            'elabexpetecnico',
            'porcentajegasoperacion'
        ];

        // Asociamos el evento input a cada campo
        inputs.forEach(id => {
            document.getElementById(id).addEventListener('input', (e) => {
                this.resumenExpediente(); // Llamamos a resumenExpediente para actualizar los cálculos
            });
        });
        // document.getElementById('download-xlsx').addEventListener('click', () => {
        //     const allData = this.table.getData();
        //     this.descargarExpediente(allData);
        // });

        // // Input porcentaje gastos
        // document.getElementById('porcentajegastos').addEventListener('input', (e) => {
        //     this.resumenExpediente();
        // });

        // // Input porcentaje utilidad
        // document.getElementById('porcentajeutilidad').addEventListener('input', (e) => {
        //     this.resumenExpediente();
        // });

        // // Input porcentaje IGV
        // document.getElementById('porcentajeigv').addEventListener('input', (e) => {
        //     this.resumenExpediente();
        // });

        // document.getElementById('elabexpetecnico').addEventListener('input', (e) => {
        //     this.resumenExpediente();
        // });

        // // Input porcentaje gastos operación
        // document.getElementById('porcentajegasoperacion').addEventListener('input', (e) => {
        //     this.resumenExpediente();
        // });
    }

    // Función que realiza los cálculos y actualiza los resultados en la interfaz
    resumenExpediente() {
        // Obtener el total de subtotales (costo directo) de la tabla
        const costoDirecto = this.table.getRows()
            .filter(row => !row.getTreeParent()) // Solo nodos raíz
            .reduce((sum, row) => sum + (row.getData().subtotal || 0), 0);

        // Actualizar el costo directo en la vista
        document.getElementById('costodirecto').textContent =
            costoDirecto.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        // Calcular gastos generales
        const porcentajeGastos = parseFloat(document.getElementById('porcentajegastos').value) || 0;
        const gastosGenerales = (costoDirecto * porcentajeGastos) / 100;
        document.getElementById('gastosgenerales').textContent =
            gastosGenerales.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        // Calcular utilidad
        const porcentajeUtilidad = parseFloat(document.getElementById('porcentajeutilidad').value) || 0;
        const utilidad = (costoDirecto * porcentajeUtilidad) / 100;
        document.getElementById('utilidad').textContent =
            utilidad.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        // Calcular parcial (costo directo + gastos generales + utilidad)
        const parcial = costoDirecto + gastosGenerales + utilidad;
        document.getElementById('parcial').textContent =
            parcial.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        // Calcular IGV
        const porcentajeIGV = parseFloat(document.getElementById('porcentajeigv').value) || 0;
        const igv = (parcial * porcentajeIGV) / 100;
        document.getElementById('igv').textContent =
            igv.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        // Calcular subtotal
        const subtotal = parcial + igv;
        document.getElementById('subtotal').textContent =
            subtotal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        // Calcular gastos de supervisión
        const porcentajeGastosOp = parseFloat(document.getElementById('porcentajegasoperacion').value) || 0;
        const gastosSupervision = (subtotal * porcentajeGastosOp) / 100;
        document.getElementById('gastosupervicion').textContent =
            gastosSupervision.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        // Establecer valor fijo para la elaboración del expediente técnico
        const elabExpTecnico = parseFloat(document.getElementById("elabexpetecnico").value || 0);
        // document.getElementById('elabexpetecnico').textContent =
        //     elabExpTecnico.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        // Calcular el total final (subtotal + gastos de supervisión + expediente técnico)
        const total = subtotal + gastosSupervision + elabExpTecnico;
        document.getElementById('total').textContent =
            total.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    descargarExpediente(data) {
        const workbook = new ExcelJS.Workbook();
        const expedienteSheet = workbook.addWorksheet('Presupuesto');
        const detallesSheet = workbook.addWorksheet('ACU');

        const styles = {
            title: {
                font: { bold: true, size: 14 },
                alignment: { horizontal: 'center', vertical: 'middle' },
                // border: {
                //     top: { style: 'thin' }, left: { style: 'thin' },
                //     bottom: { style: 'thin' }, right: { style: 'thin' }
                // }
            },
            headertable: {
                font: { bold: true, size: 11 },
                alignment: { horizontal: 'center', vertical: 'middle' },
                border: {
                    top: { style: 'thin' }, left: { style: 'thin' },
                    bottom: { style: 'thin' }, right: { style: 'thin' }
                },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E6E6E6' } }
            },

            header: {
                font: { bold: true, size: 11 },
                alignment: { vertical: 'middle' },
                border: {
                    top: { style: 'thin' }, left: { style: 'thin' },
                    bottom: { style: 'thin' }, right: { style: 'thin' }
                }
            },
            cell: {
                alignment: { vertical: 'middle' },
                border: {
                    top: { style: 'thin' }, left: { style: 'thin' },
                    bottom: { style: 'thin' }, right: { style: 'thin' }
                }
            },
            number: {
                alignment: { horizontal: 'left', vertical: 'middle' },
                border: {
                    top: { style: 'thin' }, left: { style: 'thin' },
                    bottom: { style: 'thin' }, right: { style: 'thin' }
                },
                numFmt: '#,##0.00'
            }
        };

        // Configurar anchos de columna
        expedienteSheet.columns = [
            { width: 4 },  // A
            { width: 15 }, // B
            { width: 50 }, // C
            { width: 8 },  // D
            { width: 8 },  // E
            { width: 12 }, // F
            { width: 12 }, // G
            { width: 12 }, // H
        ];

        detallesSheet.columns = [
            { width: 4 },  // A
            { width: 10 },  // B - Ind.
            { width: 50 }, // C -  Descripción
            { width: 12 }, // D - Unid
            { width: 12 },  // E - Recursos.
            { width: 12 }, // F - Cantidad
            { width: 12 }, // G - Precio
            { width: 12 }, // H - Parcial
            { width: 10 }, // I - Parcial
        ];

        // Encabezado común para ambas hojas
        const escribirEncabezado = (sheet) => {
            // Imagen en base64 (Reemplaza esto con tu imagen convertida a base64)
            const base64Image =
                'data:image/jpeg;base64,';
            // Agregar la imagen al workbook
            const imageId1 = workbook.addImage({
                base64: base64Image,
                extension: 'jpeg',  // Cambiar a 'jpeg' si la imagen es de tipo JPEG
            });

            // Asegurar que las columnas tienen el ancho correcto
            ['B', 'C', 'D', 'E', 'F', 'G', 'H'].forEach((col) => {
                sheet.getColumn(col).width = 15; // Ajusta el ancho de cada columna
            });

            // Insertar la imagen en el rango B1:H1
            sheet.addImage(imageId1, {
                tl: { col: 1, row: 0 },  // B1 equivale a col:1, row:0
                br: { col: 8, row: 1}   // H1 equivale a col:8, row:2
            });
            // Ajustar la altura de la fila 1
            sheet.getRow(1).height = 100; // Altura en puntos (puedes ajustar según sea necesario)

            // Título
            sheet.mergeCells('B2:I3');
            sheet.getCell('B2').value = 'PRESUPUESTO DE OBRA';
            sheet.getCell('B2').style = styles.title;

            // Información del proyecto
            sheet.mergeCells('B4:B4');
            sheet.getCell('B4').value = 'PROYECTO:';
            sheet.mergeCells('C4:H4');
            sheet.getCell('C4').value = '"REPARACIÓN DE COBERTURA: EN EL(LA) LOCAL INSTITUCIONAL..."';

            sheet.mergeCells('B5:B5');
            sheet.getCell('B5').value = 'PROPIETARIO:';
            sheet.mergeCells('C5:H5');
            sheet.getCell('C5').value = 'MUNICIPALIDAD PROVINCIAL DE HUÁNUCO';

            sheet.mergeCells('B6:B6');
            sheet.getCell('B6').value = 'UBICACIÓN:';
            sheet.mergeCells('C6:H6');
            sheet.getCell('C6').value = 'HUÁNUCO - HUÁNUCO - HUÁNUCO';

            sheet.mergeCells('B7:B7');
            sheet.getCell('B7').value = 'FECHA:';
            sheet.mergeCells('C7:H7');
            sheet.getCell('C7').value = formatearFecha(new Date().toLocaleDateString());//;

            return 9; // Retorna la siguiente fila disponible
        };

        const escribirResumen = (sheet, startRow) => {
            const resumen = [
                ['COSTO DIRECTO', '', document.getElementById('costodirecto').textContent],
                ['GASTOS GENERALES', document.getElementById('porcentajegastos').value + '%', document.getElementById('gastosgenerales').textContent],
                ['UTILIDAD', document.getElementById('porcentajeutilidad').value + '%', document.getElementById('utilidad').textContent],
                ['PARCIAL', '', document.getElementById('parcial').textContent],
                ['I.G.V.', document.getElementById('porcentajeigv').value + '%', document.getElementById('igv').textContent],
                ['SUB TOTAL', '', document.getElementById('subtotal').textContent],
                ['ELABORACIÓN DE EXPEDIENTE TÉCNICO', '', document.getElementById('elabexpetecnico').value],
                ['GASTOS DE SUPERVISIÓN', document.getElementById('porcentajegasoperacion').value + '%', document.getElementById('gastosupervicion').textContent],
                ['TOTAL', '', document.getElementById('total').textContent]
            ];

            resumen.forEach((row, index) => {
                const rowNum = startRow + index;
                sheet.mergeCells(`B${rowNum}:E${rowNum}`);
                sheet.getCell(`B${rowNum}`).value = row[0];
                sheet.getCell(`F${rowNum}`).value = row[1]; // Nueva columna para porcentajes
                sheet.getCell(`G${rowNum}`).value = row[2]; // Valor monetario

                // Estilos especiales para totales
                const isTotal = index === 0 || index === 3 || index === 5 || index === 8;
                const style = isTotal ?
                    { ...styles.header, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E6E6E6' } } }
                    : styles.cell;

                // Aplicar estilos a todas las celdas de la fila
                ['B', 'C', 'D', 'E', 'F', 'G'].forEach(col => {
                    sheet.getCell(`${col}${rowNum}`).style = style;
                });

                // Estilo especial para porcentajes y valores monetarios
                sheet.getCell(`F${rowNum}`).style = {
                    ...style,
                    alignment: { horizontal: 'center', vertical: 'middle' }
                };
                sheet.getCell(`G${rowNum}`).style = {
                    ...style,
                    numFmt: '#,##0.00',
                    alignment: { horizontal: 'right', vertical: 'middle' }
                };
            });
        };

        // Escribir Expediente
        const escribirExpediente = () => {
            let currentRow = escribirEncabezado(expedienteSheet);

            // Encabezados de tabla
            const headers = ['Item', 'Descripción', 'Unid.', 'Cant.', 'Precio', 'Parcial', 'Subtotal'];
            const headerRow = expedienteSheet.getRow(currentRow);
            headers.forEach((headertable, index) => {
                headerRow.getCell(index + 2).value = headertable;
                headerRow.getCell(index + 2).style = styles.headertable;
            });
            currentRow++;

            // Escribir datos
            const writeData = (items, level = 0) => {
                items.forEach(item => {
                    const row = expedienteSheet.getRow(currentRow);

                    // Escribir datos de la fila
                    row.getCell(2).value = item.item;
                    row.getCell(3).value = item.descripcion;
                    row.getCell(4).value = item.unidad || '';
                    row.getCell(5).value = item.cantidad || '';
                    row.getCell(6).value = item.precio || '';
                    row.getCell(7).value = item.parcial || '';
                    row.getCell(8).value = item.subtotal || '';

                    // Aplicar estilos
                    row.eachCell((cell, colNumber) => {
                        const isFirstColumn = colNumber === 2; // Primera columna con datos
                        const isLastColumn = colNumber === 8; // Última columna con datos
                        const isFirstRow = currentRow === 1; // Primera fila
                        const isLastRow = currentRow === expedienteSheet.rowCount; // Última fila

                        cell.style = {
                            alignment: { horizontal: 'left', vertical: 'middle' },
                            border: {
                                top: isFirstRow ? { style: 'thin' } : { style: 'thin' },
                                bottom: isLastRow ? { style: 'thin' } : { style: 'thin' },
                                left: isFirstColumn ? { style: 'thin' } : undefined,
                                right: isLastColumn ? { style: 'thin' } : undefined
                            },
                            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } }, // Fondo blanco
                            numFmt: '#,##0.00'
                        };
                    });

                    currentRow++;

                    // Procesar hijos si existen
                    if (item._children) {
                        writeData(item._children, level + 1);
                    }
                });
                return currentRow;
            };


            currentRow = writeData(data);
            currentRow += 5; // Espacio antes del resumen
            escribirResumen(expedienteSheet, currentRow);
        };

        // Escribir Detalles
        const escribirDetalles = () => {
            let currentRow = escribirEncabezado(detallesSheet);

            const writeItemDetails = (item) => {
                if (!item.detalles) return;

                // Fila vacía con borde superior para separar partidas
                currentRow++;
                const separatorRowTop = detallesSheet.getRow(currentRow);
                separatorRowTop.getCell(2).value = "";
                separatorRowTop.getCell(3).value = "";
                separatorRowTop.getCell(4).value = "";
                separatorRowTop.getCell(5).value = "";
                separatorRowTop.getCell(6).value = "";
                separatorRowTop.getCell(7).value = "";
                separatorRowTop.getCell(8).value = "";
                separatorRowTop.eachCell((cell) => {
                    cell.border = {
                        top: { style: "thick" },
                        bottom: { style: "thin" },
                    };
                });

                // Escribir la partida
                currentRow++;
                const headerRow = detallesSheet.getRow(currentRow);
                headerRow.getCell(2).value = `Partida: ${item.item} - ${item.descripcion}`;
                // headerRow.getCell(2).style = styles.header;
                detallesSheet.mergeCells(currentRow, 2, currentRow + 2, 5);

                // Agregar rendimiento
                headerRow.getCell(6).value = `Rendimiento: ${item.detalles.rendimiento || 0} ${item.detalles.unidadMD || "m"}/Día`;
                // headerRow.getCell(6).style = styles.header;
                detallesSheet.mergeCells(currentRow, 6, currentRow, 8);

                // Calcular y agregar costo unitario
                const calcularCostoUnitario = (detalles) => {
                    let total = 0;
                    if (detalles.manoObra) total += detalles.manoObra.reduce((sum, item) => sum + (parseFloat(item.parcial) || 0), 0);
                    if (detalles.materiales) total += detalles.materiales.reduce((sum, item) => sum + (parseFloat(item.parcial) || 0), 0);
                    if (detalles.equipos) total += detalles.equipos.reduce((sum, item) => sum + (parseFloat(item.parcial) || 0), 0);
                    return total;
                };
                // currentRow += 1;
                // const montRow = detallesSheet.getRow(currentRow);
                // const costoUnitario = calcularCostoUnitario(item.detalles);
                // montRow.getCell(6).value = `Costo unitario por m²: ${costoUnitario.toFixed(2)}`;
                currentRow += 1;
                const montRow = detallesSheet.getRow(currentRow);
                const costoUnitario = calcularCostoUnitario(item.detalles);

                // Asegúrate de que 'costoUnitario' es un número antes de intentar usar 'toFixed'
                if (!isNaN(costoUnitario)) {
                    montRow.getCell(6).value = `Costo unitario por ${item.detalles.unidadMD || "m"}: ${costoUnitario.toFixed(2)}`;
                } else {
                    console.error("Error: Costo unitario no es un número válido.");
                }
                // montRow.getCell(6).style = styles.header;
                detallesSheet.mergeCells(currentRow, 6, currentRow + 1, 8);

                // Escribir encabezado de tabla solo una vez
                currentRow += 2;
                const headers = ['Ind.', 'Descripción', 'Unid.', 'Recursos', 'Cant.', 'Precio', 'Parcial'];
                const headerRowTable = detallesSheet.getRow(currentRow);
                headers.forEach((header, index) => {
                    headerRowTable.getCell(index + 2).value = header;
                    headerRowTable.getCell(index + 2).style = styles.headertable;
                });

                // Escribir secciones de detalles sin bordes internos
                const writeSectionDetails = (title, details) => {
                    if (!details || details.length === 0) return;

                    currentRow++;
                    const sectionRow = detallesSheet.getRow(currentRow);

                    // Calcular suma de parciales para la sección
                    const sectionTotal = details.reduce((sum, detail) => sum + (parseFloat(detail.parcial) || 0), 0);

                    // Escribir título y total de la sección
                    sectionRow.getCell(2).value = title;
                    sectionRow.getCell(2).style = { font: { bold: true } };
                    detallesSheet.mergeCells(currentRow, 2, currentRow, 7);

                    // Asegurarnos de que sectionTotal sea un número válido
                    if (!isNaN(sectionTotal)) {
                        sectionRow.getCell(8).value = sectionTotal.toFixed(2);
                        sectionRow.getCell(8).style = { font: { bold: true } };
                    } else {
                        console.error("Error: sectionTotal no es un número válido.");
                    }

                    details.forEach(detail => {
                        currentRow++;
                        const row = detallesSheet.getRow(currentRow);
                        row.getCell(2).value = detail.ind;
                        row.getCell(3).value = detail.descripcion;
                        row.getCell(4).value = detail.und;
                        row.getCell(5).value = detail.recursos;
                        row.getCell(6).value = detail.cantidad;
                        row.getCell(7).value = detail.precio;
                        row.getCell(8).value = detail.parcial;

                        // Aplicar fondo blanco y sin bordes internos
                        row.eachCell((cell) => {
                            cell.style = {
                                alignment: { horizontal: 'left', vertical: 'middle' },
                                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } }, // Fondo blanco
                                numFmt: typeof cell.value === 'number' ? '#,##0.00' : undefined,
                            };
                        });
                    });
                };

                writeSectionDetails('MANO DE OBRA', item.detalles.manoObra);
                writeSectionDetails('MATERIALES', item.detalles.materiales);
                writeSectionDetails('EQUIPO', item.detalles.equipos);

                // Fila vacía con borde inferior para cerrar la partida
                currentRow++;
                const separatorRowBottom = detallesSheet.getRow(currentRow);
                separatorRowBottom.getCell(2).value = "";
                separatorRowBottom.getCell(3).value = "";
                separatorRowBottom.getCell(4).value = "";
                separatorRowBottom.getCell(5).value = "";
                separatorRowBottom.getCell(6).value = "";
                separatorRowBottom.getCell(7).value = "";
                separatorRowBottom.getCell(8).value = "";
                separatorRowBottom.eachCell((cell) => {
                    cell.border = {
                        top: { style: "thin" },
                        bottom: { style: "thick" },
                    };
                });
            };

            // Procesar todos los items recursivamente
            const processItems = (items) => {
                items.forEach(item => {
                    if (item.detalles) writeItemDetails(item);
                    if (item._children) processItems(item._children);
                });
            };

            processItems(data);
        };

        escribirExpediente();
        escribirDetalles();

        function formatearFecha(fechaStr) {
            const fecha = new Date(fechaStr);
            const meses = [
                'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
                'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
            ];
            return `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
        }

        // Exportar
        workbook.xlsx.writeBuffer().then(buffer => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Presupuesto-Acu.xlsx';
            a.click();
            window.URL.revokeObjectURL(url);
        });
    }
}

export default Table;