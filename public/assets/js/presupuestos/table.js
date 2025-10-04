class Table {
    constructor(TableDetails) {
        this.table = null;
        this.TableDetails = TableDetails;
        this.tableDetails = new TableDetails();
        this.initAddParentButton();
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
        }).catch(error => {
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

            let organizedData = [...data];

            try {
                // Ordenar por nivel
                organizedData.sort((a, b) => (a.nivel ?? 0) - (b.nivel ?? 0));

                const idMap = new Map();
                organizedData.forEach(item => idMap.set(item.id, item));

                // Evitar referencias circulares
                const processedIds = new Set();

                organizedData.forEach(item => {
                    if (item.parent_id && idMap.has(item.parent_id)) {
                        const parent = idMap.get(item.parent_id);

                        if (!parent._children) parent._children = [];

                        // Verificar si ya existe el hijo para evitar duplicados
                        if (!parent._children.some(child => child.id === item.id)) {
                            parent._children.push(item);
                        }

                        // Evitar bucles infinitos verificando referencias
                        if (processedIds.has(item.id)) {
                            console.warn(`Posible referencia circular detectada en ID: ${item.id}`);
                        } else {
                            processedIds.add(item.id);
                        }
                    }
                });

                return organizedData.filter(item => !item.parent_id || !idMap.has(item.parent_id));
            } catch (error) {
                console.error("Error organizando datos:", error);
                return data;
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

                if (!hasSelection) {
                    this.showNotification('error', 'Debe seleccionar al menos una categoría');
                    resolve(this.datosBase);
                    return;
                }

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
                    // Verificamos que la respuesta sea válida
                    if (!response || !response.data || !response.data[0] || !response.data[0].datapresupuestos) {
                        console.warn("Respuesta del servidor no contiene datos de presupuestos, usando datos predeterminados");
                        this.datosBase = this.database();
                    } else {
                        try {
                            // Intentamos parsear los datos
                            const parsedData = JSON.parse(response.data[0].datapresupuestos);

                            //Cargar datos:
                            //document.getElementById('costodirecto').textContent = parseFloat(response.data[0].costo_directo);
                            // Convertir costoDirecto a formato numérico y asignarlo al input con name="costodirectovalue"
                            document.querySelector('[name="costodirectovalue"]').value = parseFloat(response.data[0].costo_directo)
                            document.querySelector('[name="costoDirecto_gfijo"]').value = parseFloat(response.data[0].costo_directo)

                            // document.getElementById('porcentajegastos').value = parseFloat(response.data[0].gastosgenerales); // Ajusta la propiedad según corresponda
                            // document.getElementById('porcentajeutilidad').value = parseFloat(response.data[0].utilidades); // Ajusta la propiedad según corresponda
                            // document.getElementById('porcentajeigv').value = parseFloat(response.data[0].igv); // Ajusta la propiedad según corresponda
                            // document.getElementById("elabexpetecnico").value = parseFloat(response.data[0].expediente); // Ajusta la propiedad según corresponda
                            // document.getElementById('porcentajegasoperacion').value = parseFloat(response.data[0].gastosupervicion); // Ajusta la propiedad según corresponda
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

    async init() {
        this.table = new Tabulator("#tabla", {
            dataTree: true,
            dataTreeStartExpanded: true, // Cambiado a false para mejorar rendimiento inicial
            //layout: "fitColumns",
            layout: "fitDataStretch",
            maxHeight: "100%",
            virtualDom: true,  // ✅ Permite renderizado eficiente
            renderVerticalBuffer: 500,  // Mejora rendimiento
            ajaxContentType: "json",
            dataTreeChildField: "_children", // 🔹 Define la clave de los hijos en los datos
            //pagination: true, // 🔹 Activa paginación
            progressiveLoad: "scroll",
            progressiveLoadDelay: 200, // Add delay to prevent too many calculations at once
            progressiveLoadScrollMargin: 300, // Carga datos al acercarse al límite
            paginationMode: "remote", // 🔹 Controla los datos desde el servidor
            paginationSize: 100, // 🔹 Reduce la cantidad de datos en memoria
            height: "500px", // 🔹 Establece altura para mejorar rendimiento
            columns: [
                {
                    title: "Item",
                    field: "item",
                    width: 150,
                    frozen: true, // Mantiene estática la columna
                    tooltip: true, // Muestra el ítem completo en el tooltip
                    cssClass: "wrap-text"
                },
                {
                    title: "Descripcion",
                    field: "descripcion",
                    editor: "input",
                    formatter: "html",
                    widthGrow: 5, // Crece dinámicamente según el espacio disponible
                    frozen: true,
                    tooltip: true, // Tooltip para descripciones largas
                    cellMouseOver: function (e, cell) {
                        const data = cell.getValue();
                        if (data && data.length > 50) {
                            cell.getElement().setAttribute("title", data);
                        }
                    },
                    cssClass: "wrap-text" // Custom CSS class for text wrapping
                },
                {
                    title: "und.",
                    field: "unidad",
                    width: 40,
                    editor: "input",
                    headerVertical: true,
                    cellEdited: (cell) => {
                        this.updateRowButtons(cell.getRow());
                    }
                },
                {
                    title: "Cant.",
                    field: "cantidad",
                    width: 60,
                    editor: "number",
                    headerVertical: true,
                    formatter: function (cell) {
                        return cell.getValue() || cell.getRow().getData().totalnieto;
                    },
                    cellEdited: (cell) => {
                        const row = cell.getRow();
                        const data = row.getData();
                        const parcial = (data.cantidad || 0) * (data.precio || 0);
                        row.update({ parcial: parcial });
                        this.updateRowButtons(row);
                    }
                },
                {
                    title: "Precio<br>Unit.",
                    field: "precio",
                    width: 80,
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
                    width: 80,
                    headerVertical: true,
                    formatter: "money",
                    formatterParams: {
                        decimal: ".",
                        thousand: ",",
                        precision: 2
                    },
                    cellEdited: (cell) => {
                        this.calculateSubtotals();
                    }
                },
                {
                    title: "Subtotal",
                    field: "subtotal",
                    width: 100,
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
                    width: 90, // Aumentar ancho para el nuevo botón
                    frozen: true,
                    formatter: function (cell) {
                        const row = cell.getRow();
                        const data = row.getData();
                        let observationIcon = '👁️‍🗨️'; // Icono por defecto
                        let observationClass = ''; // Clase por defecto (sin color)

                        // Verificar si hay observaciones
                        if (data.observacion && Object.keys(data.observacion).length > 0) {
                            observationClass = 'bg-red-700 text-white'; // Clase para colorear de rojo
                        }
                        // Solo mostrar botones si tiene unidad y cantidad
                        if (data.unidad && data.cantidad) {
                            return `
                                <button class='details-btn'>📇</button>
                                <button class='add-btn'>➕</button>
                                <button class='delete-btn'>🗑️</button>
                                <button class='observation-btn ${observationClass}'>${observationIcon}</button>
                            `;
                        }
                        return `
                            <button class='add-btn'>➕</button>
                            <button class='delete-btn'>🗑️</button>
                            <button class='observation-btn ${observationClass}'>${observationIcon}</button>
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
                                    console.log(data.id);
                                    row.update({
                                        precio: newPrecio,
                                        parcial: newParcial,
                                        detalles: updatedData.detalles,
                                        rendimiento: updatedData.rendimiento,
                                        id: data.id,
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
        const id_presupuesto = document.getElementById('id_presupuestos').value;
        const self = this; // ← GUARDA el contexto de la clase

        // Botón guardar datos
        document.getElementById('savedata').addEventListener('click', () => {
            const allData = this.table.getData();

            // Función para obtener solo los padres con su id, descripcion y subtotal (sin recorrer hijos)
            function extractParentsData(data) {
                let result = [];

                // Recorrer cada item
                data.forEach(item => {
                    // Verificamos si es un "padre" que tiene id y subtotal, pero sin hijos
                    if (item.id && item.subtotal !== undefined) {
                        result.push({
                            id: item.id,
                            item: item.item,
                            descripcion: item.descripcion,
                            subtotal: item.subtotal
                        });
                    }
                });

                return result;
            }

            // Obtener los datos solo de los padres principales con su id, descripcion y subtotal
            const parentsData = extractParentsData(allData);

            // Ahora `parentsData` contendrá todos los padres con sus id, descripcion y subtotal
            const costoDirecto = parentsData.reduce((acc, item) => acc + item.subtotal, 0);
            const dataToSend = {
                id: id_presupuesto,
                gastosgenerales: 1,
                utilidades: 1,
                igv: 1,
                expediente: 1,
                totalmetrados: parentsData,
                costo_directo: costoDirecto,
                datapresupuestos: allData,
            };
            const comprimido = JSON.stringify(dataToSend)
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
                },
                error: function (xhr) {
                    Swal.fire({
                        title: "Error",
                        text: xhr.responseText,
                        icon: "error"
                    });
                }
            });

        });

        const modal = document.getElementById('exportModal');
        const downloadButton = document.getElementById('download-xlsx');
        const cancelButton = document.getElementById('cancelButton');
        const exportForm = document.getElementById('exportForm');
        const exportOptionRadios = document.getElementsByName('exportOption');
        const specialtyOptions = document.getElementById('specialtyOptions');
        const suppliesOptions = document.getElementById('suppliesOptions');

        // Show modal
        const showModal = () => modal.classList.remove('hidden');

        // Hide modal
        const hideModal = () => {
            modal.classList.add('hidden');
            exportForm.reset();
            specialtyOptions.classList.add('hidden');
            suppliesOptions.classList.add('hidden');
        };

        // Toggle visibility of specialty/supplies dropdowns
        const toggleOptions = () => {
            const selectedOption = document.querySelector('input[name="exportOption"]:checked').value;
            specialtyOptions.classList.toggle('hidden', selectedOption !== 'specialty');
            suppliesOptions.classList.toggle('hidden', selectedOption !== 'supplies');
        };

        // Event listeners for buttons
        downloadButton.addEventListener('click', showModal);
        cancelButton.addEventListener('click', hideModal);

        // Event listener for export option changes
        exportOptionRadios.forEach(radio => {
            radio.addEventListener('change', toggleOptions);
        });

        // Form submission
        document.getElementById('exportForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            const format = document.getElementById('exportFormat').value;
            const option = document.querySelector('input[name="exportOption"]:checked').value;
            // Normaliza texto: sin tildes, minúsculas
            function normalizeText(text) {
                return text.normalize("NFD")               // separa letras y tildes
                    .replace(/[\u0300-\u036f]/g, '') // elimina los acentos
                    .toLowerCase().trim();           // convierte a minúscula y quita espacios
            }

            // Obtener los archivos seleccionados
            const logoFileInput = document.getElementById('logoFile');
            const escudoFileInput = document.getElementById('escudoFile');

            // Verificar si los inputs existen
            if (!logoFileInput || !escudoFileInput) {
                alert('Error: No se encontraron los elementos de entrada para los logos.');
                return;
            }

            const logoFile1 = logoFileInput.files[0];
            const logoFile2 = escudoFileInput.files[0];

            // Verificar si se seleccionaron ambas imágenes
            if (!logoFile1 || !logoFile2) {
                alert('Por favor seleccione ambos logos');
                console.log('logoFile1:', logoFile1, 'logoFile2:', logoFile2);
                return;
            }

            // Definir función para cargar una imagen como ArrayBuffer
            const cargarImagen = (file) => {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        resolve({
                            data: e.target.result,
                            extension: file.name.split('.').pop().toLowerCase()
                        });
                    };
                    reader.onerror = reject;
                    reader.readAsArrayBuffer(file);
                });
            };

            const [logo1Data, logo2Data] = await Promise.all([
                cargarImagen(logoFile1),
                cargarImagen(logoFile2)
            ]);

            function formatearFechaCompleta(fechaStr) {
                const fecha = new Date(fechaStr); // Puede ser Date() o un string de fecha
                const meses = [
                    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
                ];

                const dia = fecha.getDate();             // Día del mes (1-31)
                const mes = meses[fecha.getMonth()];     // Nombre del mes
                const anio = fecha.getFullYear();        // Año completo

                return `${dia} de ${mes} del ${anio}`;
            }

            const fechaActual = formatearFechaCompleta(new Date());

            // Asegúrate de que getData() se llame desde el contexto correcto
            let filteredData = self.table.getData(); // ← Usa `self` en lugar de `this`

            // Filter data based on selected option
            if (option === 'all') {
                if (format === 'excel') {
                    self.descargarExpediente(filteredData, logo1Data, logo2Data, fechaActual);
                } else if (format === 'pdf') {
                    self.descargarExpedientepdf(filteredData, logo1Data, logo2Data, fechaActual);
                }
            } else if (option === 'allInsumos') {
                const id_presupuesto = document.getElementById('id_presupuestos').value;
                const exportinsumosGeneral = {
                    id_presupuesto: id_presupuesto,
                };
                const insumosExptotal = JSON.stringify(exportinsumosGeneral)
                $.ajax({
                    url: '/exportar_insumo', // Laravel route
                    method: 'POST',
                    data: insumosExptotal, // Send data as JSON
                    contentType: 'application/json',
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') // Include CSRF token for Laravel
                    },
                    success: function (response) {
                        if (format === 'excel') {
                            self.descargarInsumos({ datos: response.data, }, logo1Data, logo2Data, fechaActual);
                        } else if (format === 'pdf') {
                            self.descargarInsumospdf({ datos: response.data, }, logo1Data, logo2Data, fechaActual);
                        }
                        // self.descargarInsumos({
                        //     datos: response.data,
                        // }, logo1Data, logo2Data, fechaActual);
                    },
                    error: function (xhr) {
                        Swal.fire({
                            title: "Error",
                            text: xhr.responseText,
                            icon: "error"
                        });
                    }
                });

                //filteredData = filteredData.filter(item => item.isBudget || item.isComplete); // Adjust filter logic
            } else if (option === 'specialty') {
                const specialtyInput = document.getElementById('specialty').value;
                const keyword = normalizeText(specialtyInput);

                const filteredData = self.table.getData().filter(item => {
                    const descripcion = normalizeText(item.descripcion || '');
                    return descripcion.includes(keyword); // coincidencia parcial
                });

                console.log('Filtrado:', filteredData);
                if (format === 'excel') {
                    await self.descargaracuespecialidad(filteredData, specialtyInput, logo1Data, logo2Data, fechaActual);
                } else if (format === 'pdf') {
                    await self.descargaracuespecialidadpdf(filteredData, specialtyInput, logo1Data, logo2Data, fechaActual);
                }
                //this.descargaracuespecialidad(filteredData, specialtyInput);
            } else if (option === 'supplies') {
                const id_presupuesto = document.getElementById('id_presupuestos').value;
                // const supplies = document.getElementById('supplies').value;
                const select = document.getElementById('supplies');
                const supplies = select.value;                                 // p. ej. "02"
                const suppliesText = select.options[select.selectedIndex].text;    // p. ej. "Estructura"

                console.log(supplies, suppliesText);

                console.log(supplies);
                const exportinsumos = {
                    id_presupuesto: id_presupuesto,
                    tipoespecialidad: supplies,
                };
                const insumosExp = JSON.stringify(exportinsumos)
                $.ajax({
                    url: '/exportar_tipo_insumo', // Laravel route
                    method: 'POST',
                    data: insumosExp, // Send data as JSON
                    contentType: 'application/json',
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') // Include CSRF token for Laravel
                    },
                    success: function (response) {
                        console.log(response);
                        if (format === 'excel') {
                            self.descargarInsumosTipo({ datos: response.data, }, logo1Data, logo2Data, fechaActual, suppliesText);
                        } else if (format === 'pdf') {
                            self.descargarInsumosTipopdf({ datos: response.data, }, logo1Data, logo2Data, fechaActual, suppliesText);
                        }
                        // self.descargarInsumosTipo({
                        //     datos: response.data,
                        // }, logo1Data, logo2Data, fechaActual, suppliesText);
                    },
                    error: function (xhr) {
                        Swal.fire({
                            title: "Error",
                            text: xhr.responseText,
                            icon: "error"
                        });
                    }
                });

                //filteredData = filteredData.filter(item => item.supplyType === supplies); // Adjust filter logic
            } else if (option === 'gastosGenerales') {
                const id_presupuesto = document.getElementById('id_presupuestos').value;
                const exportgastosGen = {
                    id_presupuesto: id_presupuesto,
                };
                const gastosGenerales = JSON.stringify(exportgastosGen)
                $.ajax({
                    url: '/exportar_gastos_generales', // Laravel route
                    method: 'POST',
                    data: gastosGenerales, // Send data as JSON
                    contentType: 'application/json',
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') // Include CSRF token for Laravel
                    },
                    success: function (response) {
                        try {
                            console.log('Respuesta completa:', response.data);

                            // Asegúrate de que response.data es un arreglo y tiene al menos un elemento
                            if (!Array.isArray(response.data) || response.data.length === 0) {
                                throw new Error('La respuesta no contiene datos válidos');
                            }

                            const data = response.data[0]; // Tomamos el primer objeto del arreglo

                            // Parseamos cada propiedad si es una cadena JSON
                            const consolidado = typeof data.consolidado === 'string' ? JSON.parse(data.consolidado) : data.consolidado;
                            const control_concurrente = typeof data.control_concurrente === 'string' ? JSON.parse(data.control_concurrente) : data.control_concurrente;
                            const gastos_fijos = typeof data.gastos_fijos === 'string' ? JSON.parse(data.gastos_fijos) : data.gastos_fijos;
                            const gastos_generales = typeof data.gastos_generales === 'string' ? JSON.parse(data.gastos_generales) : data.gastos_generales;
                            const remuneraciones = typeof data.remuneraciones === 'string' ? JSON.parse(data.remuneraciones) : data.remuneraciones;
                            const supervision = typeof data.supervision === 'string' ? JSON.parse(data.supervision) : data.supervision;

                            const timepoejecucion = data.tiempo_ejecucion;
                            const ggf = data.ggf;
                            const ggv = data.ggv;
                            const porcentaje_fianza_adelanto_efectivo = data.porcentaje_fianza_adelanto_efectivo;
                            const porcentaje_fianza_adelanto_materiales = data.porcentaje_fianza_adelanto_materiales;
                            const porcentaje_fianza_buen_ejecucion = data.porcentaje_fianza_buen_ejecucion;

                            // Mostramos los datos parseados
                            console.log('Consolidado:', consolidado);
                            console.log('Control Concurrente:', control_concurrente);
                            console.log('Gastos Fijos:', gastos_fijos);
                            console.log('Gastos Generales:', gastos_generales);
                            console.log('Remuneraciones:', remuneraciones);
                            console.log('Supervisión:', supervision);

                            // Ejemplo: Acceder a datos específicos
                            console.log('Resumen Agg (Consolidado):', consolidado.resumenAgg);
                            console.log('Total Final (Consolidado):', consolidado.totalFinal);
                            console.log('Tiempo de Ejecucion :', timepoejecucion);

                            self.exportarGastosGenerales(consolidado, control_concurrente, gastos_fijos, gastos_generales, remuneraciones, supervision, timepoejecucion, ggf
                                , ggv, porcentaje_fianza_adelanto_efectivo, porcentaje_fianza_adelanto_materiales, porcentaje_fianza_buen_ejecucion, logo1Data, logo2Data, fechaActual);
                        } catch (error) {
                            console.error('Error al procesar la respuesta:', error.message);
                        }
                    },
                    error: function (xhr) {
                        Swal.fire({
                            title: "Error",
                            text: xhr.responseText,
                            icon: "error"
                        });
                    }
                });

            }

            // Export based on format
            // if (format === 'excel') {
            //     this.descargarExpediente(filteredData);
            // } else if (format === 'pdf') {
            //     this.descargarExpedientepdf(filteredData);
            // }

            hideModal();
        });
        // Inputs con eventos 'input' para actualizar cálculos automáticamente
        const inputs = [
            'porcentajegastos',
            'porcentajeutilidad',
            'porcentajeigv',
            'elabexpetecnico',
            'porcentajegasoperacion'
        ];

    }

    /********************* EXPORTADO EN EXCEL **********************/
    async descargarExpediente(data, logo1Data, logo2Data, fechaActual) {
        const workbook = new ExcelJS.Workbook();
        const expedienteSheet = workbook.addWorksheet('Presupuesto');
        const detallesSheet = workbook.addWorksheet('ACU');

        const styles = {
            title: {
                font: { bold: true, size: 14 },
                alignment: { horizontal: 'center', vertical: 'middle' },
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
            { width: 15 }, // B - item
            { width: 150 }, // C - descripcion
            { width: 10 },  // D - unidad
            { width: 10 },  // E - cantidad
            { width: 20 }, // F - precio
            { width: 20 }, // G - parcial
            { width: 30 }, // H - subtotal
        ];

        detallesSheet.columns = [
            { width: 4 },  // A
            { width: 15 }, // B - Ind.
            { width: 50 }, // C - Descripción
            { width: 15 }, // D - Unid
            { width: 15 }, // E - Recursos
            { width: 15 }, // F - Cantidad
            { width: 15 }, // G - Precio
            { width: 15 }, // H - Parcial
            { width: 30 }, // I - Parcial
        ];

        // Encabezado común para ambas hojas
        const escribirEncabezado = (sheet, logo1Data, logo2Data) => {
            // Agregar las imágenes al workbook
            const imageId1 = workbook.addImage({
                buffer: logo1Data.data,
                extension: logo1Data.extension,
            });

            const imageId2 = workbook.addImage({
                buffer: logo2Data.data,
                extension: logo2Data.extension,
            });

            // Ajustar la altura de las 3 primeras filas (en puntos)
            sheet.getRow(1).height = 130;
            sheet.getRow(2).height = 20;
            sheet.getRow(3).height = 20;

            // Insertar el Logo 1 (izquierda)
            sheet.addImage(imageId1, {
                tl: { col: 0, row: 0 }, // A1
                ext: { width: 150, height: 150 }
            });

            // Insertar el Logo 2 (derecha)
            sheet.addImage(imageId2, {
                tl: { col: 7, row: 0 }, // I1
                ext: { width: 150, height: 150 }
            });

            // Combinar de C1 hasta G3 (una gran celda para todo el texto centrado)
            sheet.mergeCells('C1:G3');

            // Texto con formato enriquecido (rich text)
            sheet.getCell('C1').value = {
                richText: [
                    {
                        text: '“MEJORAMIENTO DE LOS SERVICIOS DE EDUCACION INICIAL DE LA IEI Nº 358 CIUDAD DE CONTAMANA\n',
                        font: { bold: true, size: 11 }
                    },
                    {
                        text: 'DEL DISTRITO DE CONTAMANA - PROVINCIA DE UCAYALI - DEPARTAMENTO DE LORETO”\n',
                        font: { bold: true, size: 11 }
                    },
                    {
                        text: 'CUI: 2484411; CÓDIGO MODULAR: 0651216; CÓDIGO LOCAL: 390867\n',
                        font: { size: 11 }
                    },
                    {
                        text: 'I.E.I:358; UNIDAD EJECUTORA: MUNICIPALIDAD PROVINCIAL DE UCAYALI',
                        font: { size: 11 }
                    }
                ]
            };

            // Estilo de alineación y ajuste de texto
            sheet.getCell('C1').alignment = {
                vertical: 'middle',
                horizontal: 'center',
                wrapText: true
            };

            // Altura ajustada (basta con aumentar solo la fila 1, ya que C1 abarca hasta G3)
            sheet.getRow(1).height = 75;

            try {
                // Título
                sheet.mergeCells('B4:H4');
                sheet.getCell('B4').value = 'PRESUPUESTO DE OBRA';
                sheet.getCell('B4').style = styles.title;

                // Información del proyecto
                sheet.getCell('B5').value = 'PROYECTO:';
                sheet.mergeCells('C5:H5');
                sheet.getCell('C5').value = '"REPARACIÓN DE COBERTURA: EN EL(LA) LOCAL INSTITUCIONAL..."';

                sheet.getCell('B6').value = 'PROPIETARIO:';
                sheet.mergeCells('C6:H6');
                sheet.getCell('C6').value = 'MUNICIPALIDAD PROVINCIAL DE HUÁNUCO';

                sheet.getCell('B7').value = 'UBICACIÓN:';
                sheet.mergeCells('C7:H7');
                sheet.getCell('C7').value = 'HUÁNUCO - HUÁNUCO - HUÁNUCO';

                sheet.getCell('B8').value = 'FECHA:';
                sheet.mergeCells('C8:H8');
                sheet.getCell('C8').value = fechaActual;
            } catch (error) {
                console.error('Error al mergear celdas:', error);
                throw error;
            }

            return 9; // Siguiente fila disponible
        };

        const escribirResumen = (sheet, startRow) => {
            const resumen = [
                ['COSTO DIRECTO', '', 0],
                ['GASTOS GENERALES', 0],
                ['UTILIDAD', 0],
                ['PARCIAL', '', 0],
                ['I.G.V.', 0],
                ['SUB TOTAL', '', 0],
                ['ELABORACIÓN DE EXPEDIENTE TÉCNICO', '', 0],
                ['GASTOS DE SUPERVISIÓN', 0],
                ['TOTAL', '', 0]
            ];

            resumen.forEach((row, index) => {
                const rowNum = startRow + index;
                sheet.mergeCells(`B${rowNum}:E${rowNum}`);
                sheet.getCell(`B${rowNum}`).value = row[0];
                sheet.getCell(`F${rowNum}`).value = row[1];
                sheet.getCell(`G${rowNum}`).value = row[2];

                const isTotal = index === 0 || index === 3 || index === 5 || index === 8;
                const style = isTotal
                    ? { ...styles.header, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E6E6E6' } } }
                    : styles.cell;

                ['B', 'C', 'D', 'E', 'F', 'G'].forEach(col => {
                    sheet.getCell(`${col}${rowNum}`).style = style;
                });

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

        const escribirExpediente = async (logo1Data, logo2Data) => {
            let currentRow = 9; // Inicializar después del encabezado
            console.log(expedienteSheet);
            try {
                // Escribir encabezado en ambas hojas
                currentRow = escribirEncabezado(expedienteSheet, logo1Data, logo2Data);
                escribirEncabezado(detallesSheet, logo1Data, logo2Data);

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

                        row.getCell(2).value = item.item;
                        row.getCell(3).value = item.descripcion;
                        row.getCell(4).value = item.unidad || '';
                        row.getCell(5).value = item.cantidad || '';
                        row.getCell(6).value = item.precio || '';
                        row.getCell(7).value = item.parcial || '';
                        row.getCell(8).value = item.subtotal || '';

                        row.eachCell((cell, colNumber) => {
                            const isFirstColumn = colNumber === 2;
                            const isLastColumn = colNumber === 8;
                            const isFirstRow = currentRow === 1;
                            const isLastRow = currentRow === expedienteSheet.rowCount;

                            cell.style = {
                                alignment: { horizontal: 'left', vertical: 'middle' },
                                border: {
                                    top: isFirstRow ? { style: 'thin' } : { style: 'thin' },
                                    bottom: isLastRow ? { style: 'thin' } : { style: 'thin' },
                                    left: isFirstColumn ? { style: 'thin' } : undefined,
                                    right: isLastColumn ? { style: 'thin' } : undefined
                                },
                                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } },
                                numFmt: '#,##0.00'
                            };
                        });

                        currentRow++;

                        if (item._children) {
                            writeData(item._children, level + 1);
                        }
                    });
                    return currentRow;
                };

                currentRow = writeData(data);
                currentRow += 5;
                escribirResumen(expedienteSheet, currentRow);
            } catch (error) {
                console.error('Error al procesar expediente:', error);
                throw error;
            }
            return currentRow;
        };

        const escribirDetalles = (startRow) => {
            let currentRow = 10;

            const writeItemDetails = (item) => {
                // Verificar si hay detalles y al menos una de las categorías tiene elementos
                if (!item.detalles) return;

                const tieneDetalles = (
                    (item.detalles.manoObra && item.detalles.manoObra.length > 0) ||
                    (item.detalles.materiales && item.detalles.materiales.length > 0) ||
                    (item.detalles.equipos && item.detalles.equipos.length > 0)
                );

                // Si no hay ningún detalle en ninguna categoría, no mostrar nada
                if (!tieneDetalles) return;

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

                currentRow++;
                const headerRow = detallesSheet.getRow(currentRow);
                headerRow.getCell(2).value = `Partida: ${item.item} - ${item.descripcion}`;
                detallesSheet.mergeCells(currentRow, 2, currentRow + 2, 5);

                headerRow.getCell(6).value = `Rendimiento: ${item.detalles.rendimiento || 0} ${item.detalles.unidadMD || "m"}/Día`;
                detallesSheet.mergeCells(currentRow, 6, currentRow, 8);

                const calcularCostoUnitario = (detalles) => {
                    let total = 0;
                    if (detalles.manoObra && detalles.manoObra.length > 0)
                        total += detalles.manoObra.reduce((sum, item) => sum + (parseFloat(item.parcial) || 0), 0);
                    if (detalles.materiales && detalles.materiales.length > 0)
                        total += detalles.materiales.reduce((sum, item) => sum + (parseFloat(item.parcial) || 0), 0);
                    if (detalles.equipos && detalles.equipos.length > 0)
                        total += detalles.equipos.reduce((sum, item) => sum + (parseFloat(item.parcial) || 0), 0);
                    return total;
                };

                currentRow += 1;
                const montRow = detallesSheet.getRow(currentRow);
                const costoUnitario = calcularCostoUnitario(item.detalles);
                if (!isNaN(costoUnitario)) {
                    montRow.getCell(6).value = `Costo unitario por ${item.detalles.unidadMD || "m"}: ${costoUnitario.toFixed(2)}`;
                } else {
                    console.error("Error: Costo unitario no es un número válido.");
                }
                detallesSheet.mergeCells(currentRow, 6, currentRow + 1, 8);

                currentRow += 2;
                const headers = ['Ind.', 'Descripción', 'Unid.', 'Recursos', 'Cant.', 'Precio', 'Parcial'];
                const headerRowTable = detallesSheet.getRow(currentRow);
                headers.forEach((header, index) => {
                    headerRowTable.getCell(index + 2).value = header;
                    headerRowTable.getCell(index + 2).style = styles.headertable;
                });

                const writeSectionDetails = (title, details) => {
                    // No escribir la sección si no hay detalles o el array está vacío
                    if (!details || details.length === 0) return false;

                    // Verificar si todos los detalles son inválidos (parcial es 0, NaN o undefined)
                    const hasValidDetails = details.some(detail => {
                        const parcial = parseFloat(detail.parcial);
                        return !isNaN(parcial) && parcial > 0;
                    });

                    // Si no hay detalles válidos, no escribir la sección
                    if (!hasValidDetails) return false;

                    currentRow++;
                    const sectionRow = detallesSheet.getRow(currentRow);
                    const sectionTotal = details.reduce((sum, detail) => sum + (parseFloat(detail.parcial) || 0), 0);

                    sectionRow.getCell(2).value = title;
                    sectionRow.getCell(2).style = { font: { bold: true } };
                    detallesSheet.mergeCells(currentRow, 2, currentRow, 7);

                    if (!isNaN(sectionTotal)) {
                        sectionRow.getCell(8).value = sectionTotal.toFixed(2);
                        sectionRow.getCell(8).style = { alignment: { horizontal: 'right', vertical: 'middle' }, font: { bold: true } };
                    } else {
                        console.error(`Error: sectionTotal no es un número válido para ${title}.`);
                    }

                    details.forEach(detail => {
                        // Solo escribir el detalle si tiene un parcial válido
                        const parcial = parseFloat(detail.parcial);
                        if (isNaN(parcial) || parcial === 0) return;

                        currentRow++;
                        const row = detallesSheet.getRow(currentRow);
                        // Asignar valores
                        row.getCell(2).value = detail.ind;
                        row.getCell(3).value = detail.descripcion;
                        row.getCell(4).value = detail.und;
                        row.getCell(5).value = detail.recursos;
                        row.getCell(6).value = parseFloat(detail.cantidad) || 0;
                        row.getCell(7).value = parseFloat(detail.precio) || 0;
                        row.getCell(8).value = parcial;

                        // Aplicar estilos individuales
                        row.getCell(2).style = {
                            alignment: { horizontal: 'left', vertical: 'middle' },
                            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } }
                        };

                        row.getCell(3).style = {
                            alignment: { horizontal: 'left', vertical: 'middle' },
                            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } }
                        };

                        row.getCell(4).style = {
                            alignment: { horizontal: 'center', vertical: 'middle' },
                            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } }
                        };

                        // Columnas 5 a 8: alineación a la derecha y formato numérico si corresponde
                        [5, 6, 7, 8].forEach(i => {
                            const isNumeric = typeof row.getCell(i).value === 'number';
                            row.getCell(i).style = {
                                alignment: { horizontal: 'right', vertical: 'middle' },
                                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } },
                                numFmt: isNumeric ? '#,##0.00' : undefined
                            };
                        });
                    });

                    return true; // Indica que la sección se escribió correctamente
                };

                // Intentar escribir cada sección y verificar si al menos una fue escrita
                const manoObraEscrito = writeSectionDetails('MANO DE OBRA', item.detalles.manoObra);
                const materialesEscritos = writeSectionDetails('MATERIALES', item.detalles.materiales);
                const equiposEscritos = writeSectionDetails('EQUIPO', item.detalles.equipos);

                // Solo agregar el separador inferior si al menos una sección fue escrita
                if (manoObraEscrito || materialesEscritos || equiposEscritos) {
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
                } else {
                    // Si ninguna sección se escribió, retroceder el currentRow para eliminar los encabezados
                    // y el separador superior que ya se habían escrito
                    currentRow -= 5; // Retroceder hasta antes del primer separatorRowTop
                }
            };

            const processItems = (items) => {
                items.forEach(item => {
                    if (item.detalles) writeItemDetails(item);
                    if (item._children) processItems(item._children);
                });
            };

            processItems(data);
        };

        // Cargar imágenes y procesar expediente
        try {
            const nextRow = await escribirExpediente(logo1Data, logo2Data);
            escribirDetalles(nextRow);
        } catch (error) {
            console.error('Error al cargar imágenes o procesar expediente:', error);
            alert('Error al procesar el expediente. Por favor, intenta de nuevo.');
            return;
        }

        // Exportar
        try {
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Presupuesto-Acu.xlsx';
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error al exportar el archivo:', error);
            alert('Error al exportar el archivo Excel. Por favor, intenta de nuevo.');
        }
    }

    async descargaracuespecialidad(filteredDataespecial, specialtyInput, logo1Data, logo2Data, fechaActual) {
        console.log(filteredDataespecial)
        const workbookaesp = new ExcelJS.Workbook();
        const detallesespecializadoSheet = workbookaesp.addWorksheet(`ACU_${specialtyInput}`);

        const styles = {
            title: {
                font: { bold: true, size: 14 },
                alignment: { horizontal: 'center', vertical: 'middle' },
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
                alignment: { horizontal: 'right', vertical: 'middle' },
                border: {
                    top: { style: 'thin' }, left: { style: 'thin' },
                    bottom: { style: 'thin' }, right: { style: 'thin' }
                },
                numFmt: '#,##0.00'
            }
        };

        detallesespecializadoSheet.columns = [
            { width: 4 },  // A
            { width: 15 }, // B - Ind.
            { width: 50 }, // C - Descripción
            { width: 15 }, // D - Unid
            { width: 15 }, // E - Recursos
            { width: 15 }, // F - Cantidad
            { width: 15 }, // G - Precio
            { width: 15 }, // H - Parcial
            { width: 30 }, // I - Parcial
        ];

        // Encabezado común para ambas hojas
        const escribirEncabezado = (sheet, logo1Data, logo2Data) => {
            // Agregar las imágenes al workbook
            const imageId1 = workbookaesp.addImage({
                buffer: logo1Data.data,
                extension: logo1Data.extension,
            });

            const imageId2 = workbookaesp.addImage({
                buffer: logo2Data.data,
                extension: logo2Data.extension,
            });

            // Ajustar la altura de las 3 primeras filas (en puntos)
            sheet.getRow(1).height = 130;
            sheet.getRow(2).height = 20;
            sheet.getRow(3).height = 20;

            // Insertar el Logo 1 (izquierda)
            sheet.addImage(imageId1, {
                tl: { col: 0, row: 0 }, // A1
                ext: { width: 150, height: 150 }
            });

            // Insertar el Logo 2 (derecha)
            sheet.addImage(imageId2, {
                tl: { col: 7, row: 0 }, // I1
                ext: { width: 150, height: 150 }
            });

            // Combinar de C1 hasta G3 (una gran celda para todo el texto centrado)
            sheet.mergeCells('C1:G3');

            // Texto con formato enriquecido (rich text)
            sheet.getCell('C1').value = {
                richText: [
                    {
                        text: '“MEJORAMIENTO DE LOS SERVICIOS DE EDUCACION INICIAL DE LA IEI Nº 358 CIUDAD DE CONTAMANA\n',
                        font: { bold: true, size: 11 }
                    },
                    {
                        text: 'DEL DISTRITO DE CONTAMANA - PROVINCIA DE UCAYALI - DEPARTAMENTO DE LORETO”\n',
                        font: { bold: true, size: 11 }
                    },
                    {
                        text: 'CUI: 2484411; CÓDIGO MODULAR: 0651216; CÓDIGO LOCAL: 390867\n',
                        font: { size: 11 }
                    },
                    {
                        text: 'I.E.I:358; UNIDAD EJECUTORA: MUNICIPALIDAD PROVINCIAL DE UCAYALI',
                        font: { size: 11 }
                    }
                ]
            };

            // Estilo de alineación y ajuste de texto
            sheet.getCell('C1').alignment = {
                vertical: 'middle',
                horizontal: 'center',
                wrapText: true
            };

            // Altura ajustada (basta con aumentar solo la fila 1, ya que C1 abarca hasta G3)
            sheet.getRow(1).height = 75;

            try {
                // Título
                sheet.mergeCells('B4:H4');
                sheet.getCell('B4').value = `Analisis de Costos Unitarios ${specialtyInput}`;
                sheet.getCell('B4').style = styles.title;

                // Información del proyecto
                sheet.getCell('B5').value = 'PROYECTO:';
                sheet.mergeCells('C5:H5');
                sheet.getCell('C5').value = '"REPARACIÓN DE COBERTURA: EN EL(LA) LOCAL INSTITUCIONAL..."';

                sheet.getCell('B6').value = 'PROPIETARIO:';
                sheet.mergeCells('C6:H6');
                sheet.getCell('C6').value = 'MUNICIPALIDAD PROVINCIAL DE HUÁNUCO';

                sheet.getCell('B7').value = 'UBICACIÓN:';
                sheet.mergeCells('C7:H7');
                sheet.getCell('C7').value = 'HUÁNUCO - HUÁNUCO - HUÁNUCO';

                sheet.getCell('B8').value = 'FECHA:';
                sheet.mergeCells('C8:H8');
                sheet.getCell('C8').value = fechaActual;
            } catch (error) {
                console.error('Error al mergear celdas:', error);
                throw error;
            }

            return 9; // Siguiente fila disponible
        };

        const escribirDetalles = async (logo1Data, logo2Data) => {
            let currentRow = 10;
            escribirEncabezado(detallesespecializadoSheet, logo1Data, logo2Data);

            const writeItemDetails = (item) => {
                // Verificar si hay detalles y al menos una de las categorías tiene elementos
                if (!item.detalles) return;

                const tieneDetalles = (
                    (item.detalles.manoObra && item.detalles.manoObra.length > 0) ||
                    (item.detalles.materiales && item.detalles.materiales.length > 0) ||
                    (item.detalles.equipos && item.detalles.equipos.length > 0)
                );

                // Si no hay ningún detalle en ninguna categoría, no mostrar nada
                if (!tieneDetalles) return;

                currentRow++;
                const separatorRowTop = detallesespecializadoSheet.getRow(currentRow);
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

                currentRow++;
                const headerRow = detallesespecializadoSheet.getRow(currentRow);
                headerRow.getCell(2).value = `Partida: ${item.item} - ${item.descripcion}`;
                detallesespecializadoSheet.mergeCells(currentRow, 2, currentRow + 2, 5);

                headerRow.getCell(6).value = `Rendimiento: ${item.detalles.rendimiento || 0} ${item.detalles.unidadMD || "m"}/Día`;
                detallesespecializadoSheet.mergeCells(currentRow, 6, currentRow, 8);

                const calcularCostoUnitario = (detalles) => {
                    let total = 0;
                    if (detalles.manoObra && detalles.manoObra.length > 0)
                        total += detalles.manoObra.reduce((sum, item) => sum + (parseFloat(item.parcial) || 0), 0);
                    if (detalles.materiales && detalles.materiales.length > 0)
                        total += detalles.materiales.reduce((sum, item) => sum + (parseFloat(item.parcial) || 0), 0);
                    if (detalles.equipos && detalles.equipos.length > 0)
                        total += detalles.equipos.reduce((sum, item) => sum + (parseFloat(item.parcial) || 0), 0);
                    return total;
                };

                currentRow += 1;
                const montRow = detallesespecializadoSheet.getRow(currentRow);
                const costoUnitario = calcularCostoUnitario(item.detalles);
                if (!isNaN(costoUnitario)) {
                    montRow.getCell(6).value = `Costo unitario por ${item.detalles.unidadMD || "m"}: ${costoUnitario.toFixed(2)}`;
                } else {
                    console.error("Error: Costo unitario no es un número válido.");
                }
                detallesespecializadoSheet.mergeCells(currentRow, 6, currentRow + 1, 8);

                currentRow += 2;
                const headers = ['Ind.', 'Descripción', 'Unid.', 'Recursos', 'Cant.', 'Precio', 'Parcial'];
                const headerRowTable = detallesespecializadoSheet.getRow(currentRow);
                headers.forEach((header, index) => {
                    headerRowTable.getCell(index + 2).value = header;
                    headerRowTable.getCell(index + 2).style = styles.headertable;
                });

                const writeSectionDetails = (title, details) => {
                    // No escribir la sección si no hay detalles o el array está vacío
                    if (!details || details.length === 0) return false;

                    // Verificar si todos los detalles son inválidos (parcial es 0, NaN o undefined)
                    const hasValidDetails = details.some(detail => {
                        const parcial = parseFloat(detail.parcial);
                        return !isNaN(parcial) && parcial > 0;
                    });

                    // Si no hay detalles válidos, no escribir la sección
                    if (!hasValidDetails) return false;

                    currentRow++;
                    const sectionRow = detallesespecializadoSheet.getRow(currentRow);
                    const sectionTotal = details.reduce((sum, detail) => sum + (parseFloat(detail.parcial) || 0), 0);

                    sectionRow.getCell(2).value = title;
                    sectionRow.getCell(2).style = { font: { bold: true } };
                    detallesespecializadoSheet.mergeCells(currentRow, 2, currentRow, 7);

                    if (!isNaN(sectionTotal)) {
                        sectionRow.getCell(8).value = sectionTotal.toFixed(2);
                        sectionRow.getCell(8).style = { alignment: { horizontal: 'right', vertical: 'middle' }, font: { bold: true } };
                    } else {
                        console.error(`Error: sectionTotal no es un número válido para ${title}.`);
                    }

                    details.forEach(detail => {
                        // Solo escribir el detalle si tiene un parcial válido
                        const parcial = parseFloat(detail.parcial);
                        if (isNaN(parcial) || parcial === 0) return;

                        currentRow++;
                        const row = detallesespecializadoSheet.getRow(currentRow);

                        // Asignar valores
                        row.getCell(2).value = detail.ind;
                        row.getCell(3).value = detail.descripcion;
                        row.getCell(4).value = detail.und;
                        row.getCell(5).value = detail.recursos;
                        row.getCell(6).value = parseFloat(detail.cantidad) || 0;
                        row.getCell(7).value = parseFloat(detail.precio) || 0;
                        row.getCell(8).value = parcial;

                        // Aplicar estilos individuales
                        row.getCell(2).style = {
                            alignment: { horizontal: 'left', vertical: 'middle' },
                            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } }
                        };

                        row.getCell(3).style = {
                            alignment: { horizontal: 'left', vertical: 'middle' },
                            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } }
                        };

                        row.getCell(4).style = {
                            alignment: { horizontal: 'center', vertical: 'middle' },
                            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } }
                        };

                        // Columnas 5 a 8: alineación a la derecha y formato numérico si corresponde
                        [5, 6, 7, 8].forEach(i => {
                            const isNumeric = typeof row.getCell(i).value === 'number';
                            row.getCell(i).style = {
                                alignment: { horizontal: 'right', vertical: 'middle' },
                                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } },
                                numFmt: isNumeric ? '#,##0.00' : undefined
                            };
                        });

                    });

                    return true; // Indica que la sección se escribió correctamente
                };

                // Intentar escribir cada sección y verificar si al menos una fue escrita
                const manoObraEscrito = writeSectionDetails('MANO DE OBRA', item.detalles.manoObra);
                const materialesEscritos = writeSectionDetails('MATERIALES', item.detalles.materiales);
                const equiposEscritos = writeSectionDetails('EQUIPO', item.detalles.equipos);

                // Solo agregar el separador inferior si al menos una sección fue escrita
                if (manoObraEscrito || materialesEscritos || equiposEscritos) {
                    currentRow++;
                    const separatorRowBottom = detallesespecializadoSheet.getRow(currentRow);
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
                } else {
                    // Si ninguna sección se escribió, retroceder el currentRow para eliminar los encabezados
                    // y el separador superior que ya se habían escrito
                    currentRow -= 5; // Retroceder hasta antes del primer separatorRowTop
                }
            };

            const processItems = (items) => {
                items.forEach(item => {
                    if (item.detalles) writeItemDetails(item);
                    if (item._children) processItems(item._children);
                });
            };

            processItems(filteredDataespecial);
        };

        // Cargar imágenes y procesar expediente
        try {
            //const nextRow = await escribirExpediente(logo1Data, escudoImage);
            const nextRow = await escribirDetalles(logo1Data, logo2Data);
        } catch (error) {
            console.error('Error al cargar imágenes o procesar expediente:', error);
            alert('Error al procesar el expediente. Por favor, intenta de nuevo.');
            return;
        }

        // Exportar
        try {
            const buffer = await workbookaesp.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Acu_${specialtyInput}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error al exportar el archivo:', error);
            alert('Error al exportar el archivo Excel. Por favor, intenta de nuevo.');
        }
    }

    async descargarInsumos({ datos }, logo1Data, logo2Data, fechaActual) {
        console.log(datos);
        const workbookaesp = new ExcelJS.Workbook();
        const insumosPreSheet = workbookaesp.addWorksheet('INSUMOS PRESUPUESTOS');

        const styles = {
            title: {
                font: { bold: true, size: 14 },
                alignment: { horizontal: 'center', vertical: 'middle' },
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
            cell: {
                alignment: { vertical: 'middle' },
                border: {
                    top: { style: 'thin' }, left: { style: 'thin' },
                    bottom: { style: 'thin' }, right: { style: 'thin' }
                }
            },
            number: {
                alignment: { horizontal: 'right', vertical: 'middle' },
                border: {
                    top: { style: 'thin' }, left: { style: 'thin' },
                    bottom: { style: 'thin' }, right: { style: 'thin' }
                },
                numFmt: '#,##0.00'
            },
            total: {
                font: { bold: true },
                alignment: { horizontal: 'right', vertical: 'middle' },
                border: {
                    top: { style: 'thin' }, left: { style: 'thin' },
                    bottom: { style: 'thin' }, right: { style: 'thin' }
                },
                numFmt: '#,##0.00'
            }
        };

        insumosPreSheet.columns = [
            { width: 4 },  // A
            { width: 15 }, // B - Ind.
            { width: 15 }, // C - Descripción
            { width: 50 }, // D - Unid
            { width: 15 }, // E - Cantidad
            { width: 15 }, // F - Costo
            { width: 15 }, // G - Total
            { width: 25 }, // G - Total
        ];

        // Encabezado común para ambas hojas
        const escribirEncabezado = (sheet, logo1Data, logo2Data) => {
            // Agregar las imágenes al workbook
            const imageId1 = workbookaesp.addImage({
                buffer: logo1Data.data,
                extension: logo1Data.extension,
            });

            const imageId2 = workbookaesp.addImage({
                buffer: logo2Data.data,
                extension: logo2Data.extension,
            });

            // Ajustar la altura de las 3 primeras filas (en puntos)
            sheet.getRow(1).height = 130;
            sheet.getRow(2).height = 20;
            sheet.getRow(3).height = 20;

            // Insertar el Logo 1 (izquierda)
            sheet.addImage(imageId1, {
                tl: { col: 0, row: 0 }, // A1
                ext: { width: 150, height: 150 }
            });

            // Insertar el Logo 2 (derecha)
            sheet.addImage(imageId2, {
                tl: { col: 7, row: 0 }, // I1
                ext: { width: 150, height: 150 }
            });

            // Combinar de C1 hasta G3 (una gran celda para todo el texto centrado)
            sheet.mergeCells('C1:G3');

            // Texto con formato enriquecido (rich text)
            sheet.getCell('C1').value = {
                richText: [
                    {
                        text: '“MEJORAMIENTO DE LOS SERVICIOS DE EDUCACION INICIAL DE LA IEI Nº 358 CIUDAD DE CONTAMANA\n',
                        font: { bold: true, size: 11 }
                    },
                    {
                        text: 'DEL DISTRITO DE CONTAMANA - PROVINCIA DE UCAYALI - DEPARTAMENTO DE LORETO”\n',
                        font: { bold: true, size: 11 }
                    },
                    {
                        text: 'CUI: 2484411; CÓDIGO MODULAR: 0651216; CÓDIGO LOCAL: 390867\n',
                        font: { size: 11 }
                    },
                    {
                        text: 'I.E.I:358; UNIDAD EJECUTORA: MUNICIPALIDAD PROVINCIAL DE UCAYALI',
                        font: { size: 11 }
                    }
                ]
            };

            // Estilo de alineación y ajuste de texto
            sheet.getCell('C1').alignment = {
                vertical: 'middle',
                horizontal: 'center',
                wrapText: true
            };

            // Altura ajustada (basta con aumentar solo la fila 1, ya que C1 abarca hasta G3)
            sheet.getRow(1).height = 75;

            try {
                // Título
                sheet.mergeCells('B4:H4');
                sheet.getCell('B4').value = `LISTA DE INSUMOS DEL PRESUPUESTO`;
                sheet.getCell('B4').style = styles.title;

                // Información del proyecto
                sheet.getCell('B5').value = 'PROYECTO:';
                sheet.mergeCells('C5:H5');
                sheet.getCell('C5').value = '"REPARACIÓN DE COBERTURA: EN EL(LA) LOCAL INSTITUCIONAL..."';

                sheet.getCell('B6').value = 'PROPIETARIO:';
                sheet.mergeCells('C6:H6');
                sheet.getCell('C6').value = 'MUNICIPALIDAD PROVINCIAL DE HUÁNUCO';

                sheet.getCell('B7').value = 'UBICACIÓN:';
                sheet.mergeCells('C7:H7');
                sheet.getCell('C7').value = 'HUÁNUCO - HUÁNUCO - HUÁNUCO';

                sheet.getCell('B8').value = 'FECHA:';
                sheet.mergeCells('C8:H8');
                sheet.getCell('C8').value = fechaActual;
            } catch (error) {
                console.error('Error al mergear celdas:', error);
                throw error;
            }

            return 9; // Siguiente fila disponible
        };

        const escribirDetalles = async (logo1Data, logo2Data) => {
            let rowIndex = 10;
            escribirEncabezado(insumosPreSheet, logo1Data, logo2Data);

            // 1) CABECERA ÚNICA
            const headerRow = insumosPreSheet.getRow(rowIndex++);
            ['Ind.', 'Cod. Elect.', 'Descripción', 'Unid.', 'Cantidad', 'Costo', 'Total']
                .forEach((txt, i) => {
                    const cell = headerRow.getCell(i + 2);
                    cell.value = txt;
                    cell.style = {
                        font: { bold: true, size: 10 },
                        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9E1F2' } },
                        alignment: { horizontal: 'center', vertical: 'middle' },
                        border: {
                            top: { style: 'thin' }, left: { style: 'thin' },
                            bottom: { style: 'thin' }, right: { style: 'thin' }
                        }
                    };
                });

            // 2) Agrupar datos
            const cats = { manoObra: [], materiales: [], equipos: [] };
            datos.forEach(d => cats[d.tipoinsumo]?.push(d));

            // 3) Recoger totales de sección
            const sectionTotals = {};

            // 4) Función para escribir cada bloque
            const writeBlock = (title, items, key) => {
                if (!items.length) return;
                // calcular total de sección
                const total = items.reduce((sum, i) =>
                    sum + (parseFloat(i.total) || (parseFloat(i.cantidad) || 0) * (parseFloat(i.precio) || 0))
                    , 0);
                sectionTotals[key] = total;

                // título + total en misma fila
                const tRow = insumosPreSheet.getRow(rowIndex++);
                insumosPreSheet.mergeCells(`B${tRow.number}:F${tRow.number}`);
                tRow.getCell(2).value = title;
                tRow.getCell(2).style = {
                    font: { bold: true, size: 10 },
                    alignment: { horizontal: 'left', vertical: 'middle' }
                };
                tRow.getCell(8).value = total;
                tRow.getCell(8).style = {
                    font: { bold: true, size: 10 },
                    alignment: { horizontal: 'right', vertical: 'middle' },
                    numFmt: '#,##0.00'
                };

                // filas de datos con “rayado”
                items.forEach(item => {
                    const row = insumosPreSheet.getRow(rowIndex++);
                    const cant = parseFloat(item.cantidad) || 0;
                    const cost = parseFloat(item.precio) || 0;
                    const tot = parseFloat(item.total) || cant * cost;

                    row.getCell(2).value = item.indice?.slice(0, 2) || '';
                    row.getCell(3).value = item.indice || '';
                    row.getCell(4).value = item.descripcion;
                    row.getCell(5).value = item.unidad;
                    row.getCell(6).value = cant;
                    row.getCell(7).value = cost;
                    row.getCell(8).value = tot;

                    [2, 3, 4, 5, 6, 7, 8].forEach(i => {
                        row.getCell(i).style = {
                            font: { size: 10 },
                            alignment: {
                                horizontal: i <= 5 ? (i <= 4 ? 'left' : 'center') : 'right',
                                vertical: 'middle'
                            },
                            border: { bottom: { style: 'thin' } },
                            numFmt: i >= 6 ? '#,##0.00' : undefined
                        };
                    });
                });
            };

            writeBlock('MANO DE OBRA', cats.manoObra, 'manoObra');
            writeBlock('MATERIALES', cats.materiales, 'materiales');
            writeBlock('EQUIPOS', cats.equipos, 'equipos');

            // 5) FILA FINAL "Total"
            const grandTotal = Object.values(sectionTotals).reduce((s, v) => s + v, 0);
            const finalRow = insumosPreSheet.getRow(rowIndex++);
            insumosPreSheet.mergeCells(`B${finalRow.number}:F${finalRow.number}`);
            finalRow.getCell(7).value = 'TOTAL:';
            finalRow.getCell(7).style = {
                font: { bold: true, size: 10 },
                alignment: { horizontal: 'center', vertical: 'middle' }
            };
            finalRow.getCell(8).value = grandTotal;
            finalRow.getCell(8).style = {
                font: { bold: true, size: 10 },
                alignment: { horizontal: 'right', vertical: 'middle' },
                numFmt: '#,##0.00'
            };
        };


        try {
            const nextRow = await escribirDetalles(logo1Data, logo2Data);
        } catch (error) {
            console.error('Error al procesar expediente:', error);
            alert('Error al procesar el expediente. Por favor, intenta de nuevo.');
            return;
        }

        try {
            const buffer = await workbookaesp.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `LISTA DE INSUMOS DEL PRESUPUESTO.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error al exportar el archivo:', error);
            alert('Error al exportar el archivo Excel. Por favor, intenta de nuevo.');
        }
    }

    async descargarInsumosTipo({ datos }, logo1Data, logo2Data, fechaActual, suppliesText) {
        console.log(datos);
        const workbookaesp = new ExcelJS.Workbook();
        const insumosPreTipoSheet = workbookaesp.addWorksheet(`INSUMOS PRESUPUESTOS  ${suppliesText}`);

        const styles = {
            title: {
                font: { bold: true, size: 14 },
                alignment: { horizontal: 'center', vertical: 'middle' },
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
            cell: {
                alignment: { vertical: 'middle' },
                border: {
                    top: { style: 'thin' }, left: { style: 'thin' },
                    bottom: { style: 'thin' }, right: { style: 'thin' }
                }
            },
            number: {
                alignment: { horizontal: 'right', vertical: 'middle' },
                border: {
                    top: { style: 'thin' }, left: { style: 'thin' },
                    bottom: { style: 'thin' }, right: { style: 'thin' }
                },
                numFmt: '#,##0.00'
            },
            total: {
                font: { bold: true },
                alignment: { horizontal: 'right', vertical: 'middle' },
                border: {
                    top: { style: 'thin' }, left: { style: 'thin' },
                    bottom: { style: 'thin' }, right: { style: 'thin' }
                },
                numFmt: '#,##0.00'
            }
        };

        insumosPreTipoSheet.columns = [
            { width: 4 },  // A
            { width: 15 }, // B - Ind.
            { width: 15 }, // C - Descripción
            { width: 50 }, // D - Unid
            { width: 15 }, // E - Cantidad
            { width: 15 }, // F - Costo
            { width: 15 }, // G - Total
            { width: 25 }, // G - Total
        ];

        // Encabezado común para ambas hojas
        const escribirEncabezado = (sheet, logo1Data, logo2Data) => {
            // Agregar las imágenes al workbook
            const imageId1 = workbookaesp.addImage({
                buffer: logo1Data.data,
                extension: logo1Data.extension,
            });

            const imageId2 = workbookaesp.addImage({
                buffer: logo2Data.data,
                extension: logo2Data.extension,
            });

            // Ajustar la altura de las 3 primeras filas (en puntos)
            sheet.getRow(1).height = 130;
            sheet.getRow(2).height = 20;
            sheet.getRow(3).height = 20;

            // Insertar el Logo 1 (izquierda)
            sheet.addImage(imageId1, {
                tl: { col: 0, row: 0 }, // A1
                ext: { width: 150, height: 150 }
            });

            // Insertar el Logo 2 (derecha)
            sheet.addImage(imageId2, {
                tl: { col: 7, row: 0 }, // I1
                ext: { width: 150, height: 150 }
            });

            // Combinar de C1 hasta G3 (una gran celda para todo el texto centrado)
            sheet.mergeCells('C1:G3');

            // Texto con formato enriquecido (rich text)
            sheet.getCell('C1').value = {
                richText: [
                    {
                        text: '“MEJORAMIENTO DE LOS SERVICIOS DE EDUCACION INICIAL DE LA IEI Nº 358 CIUDAD DE CONTAMANA\n',
                        font: { bold: true, size: 11 }
                    },
                    {
                        text: 'DEL DISTRITO DE CONTAMANA - PROVINCIA DE UCAYALI - DEPARTAMENTO DE LORETO”\n',
                        font: { bold: true, size: 11 }
                    },
                    {
                        text: 'CUI: 2484411; CÓDIGO MODULAR: 0651216; CÓDIGO LOCAL: 390867\n',
                        font: { size: 11 }
                    },
                    {
                        text: 'I.E.I:358; UNIDAD EJECUTORA: MUNICIPALIDAD PROVINCIAL DE UCAYALI',
                        font: { size: 11 }
                    }
                ]
            };

            // Estilo de alineación y ajuste de texto
            sheet.getCell('C1').alignment = {
                vertical: 'middle',
                horizontal: 'center',
                wrapText: true
            };

            // Altura ajustada (basta con aumentar solo la fila 1, ya que C1 abarca hasta G3)
            sheet.getRow(1).height = 75;

            try {
                // Título
                sheet.mergeCells('B4:H4');
                sheet.getCell('B4').value = `LISTA DE INSUMOS DEL PRESUPUESTO ${suppliesText}`;
                sheet.getCell('B4').style = styles.title;

                // Información del proyecto
                sheet.getCell('B5').value = 'PROYECTO:';
                sheet.mergeCells('C5:H5');
                sheet.getCell('C5').value = '"REPARACIÓN DE COBERTURA: EN EL(LA) LOCAL INSTITUCIONAL..."';

                sheet.getCell('B6').value = 'PROPIETARIO:';
                sheet.mergeCells('C6:H6');
                sheet.getCell('C6').value = 'MUNICIPALIDAD PROVINCIAL DE HUÁNUCO';

                sheet.getCell('B7').value = 'UBICACIÓN:';
                sheet.mergeCells('C7:H7');
                sheet.getCell('C7').value = 'HUÁNUCO - HUÁNUCO - HUÁNUCO';

                sheet.getCell('B8').value = 'FECHA:';
                sheet.mergeCells('C8:H8');
                sheet.getCell('C8').value = fechaActual;
            } catch (error) {
                console.error('Error al mergear celdas:', error);
                throw error;
            }

            return 9; // Siguiente fila disponible
        };

        const escribirDetalles = async (logo1Data, logo2Data) => {
            let rowIndex = 10;
            escribirEncabezado(insumosPreTipoSheet, logo1Data, logo2Data);

            // 1) CABECERA ÚNICA
            const headerRow = insumosPreTipoSheet.getRow(rowIndex++);
            ['Ind.', 'Cod. Elect.', 'Descripción', 'Unid.', 'Cantidad', 'Costo', 'Total']
                .forEach((txt, i) => {
                    const cell = headerRow.getCell(i + 2);
                    cell.value = txt;
                    cell.style = {
                        font: { bold: true, size: 10 },
                        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9E1F2' } },
                        alignment: { horizontal: 'center', vertical: 'middle' },
                        border: {
                            top: { style: 'thin' }, left: { style: 'thin' },
                            bottom: { style: 'thin' }, right: { style: 'thin' }
                        }
                    };
                });

            // 2) Agrupar datos
            const cats = { manoObra: [], materiales: [], equipos: [] };
            datos.forEach(d => cats[d.tipoinsumo]?.push(d));

            // 3) Recoger totales de sección
            const sectionTotals = {};

            // 4) Función para escribir cada bloque
            const writeBlock = (title, items, key) => {
                if (!items.length) return;
                // calcular total de sección
                const total = items.reduce((sum, i) =>
                    sum + (parseFloat(i.total) || (parseFloat(i.cantidad) || 0) * (parseFloat(i.precio) || 0))
                    , 0);
                sectionTotals[key] = total;

                // título + total en misma fila
                const tRow = insumosPreTipoSheet.getRow(rowIndex++);
                insumosPreTipoSheet.mergeCells(`B${tRow.number}:F${tRow.number}`);
                tRow.getCell(2).value = title;
                tRow.getCell(2).style = {
                    font: { bold: true, size: 10 },
                    alignment: { horizontal: 'left', vertical: 'middle' }
                };
                tRow.getCell(8).value = total;
                tRow.getCell(8).style = {
                    font: { bold: true, size: 10 },
                    alignment: { horizontal: 'right', vertical: 'middle' },
                    numFmt: '#,##0.00'
                };

                // filas de datos con “rayado”
                items.forEach(item => {
                    const row = insumosPreTipoSheet.getRow(rowIndex++);
                    const cant = parseFloat(item.cantidad) || 0;
                    const cost = parseFloat(item.precio) || 0;
                    const tot = parseFloat(item.total) || cant * cost;

                    row.getCell(2).value = item.indice?.slice(0, 2) || '';
                    row.getCell(3).value = item.indice || '';
                    row.getCell(4).value = item.descripcion;
                    row.getCell(5).value = item.unidad;
                    row.getCell(6).value = cant;
                    row.getCell(7).value = cost;
                    row.getCell(8).value = tot;

                    [2, 3, 4, 5, 6, 7, 8].forEach(i => {
                        row.getCell(i).style = {
                            font: { size: 10 },
                            alignment: {
                                horizontal: i <= 5 ? (i <= 4 ? 'left' : 'center') : 'right',
                                vertical: 'middle'
                            },
                            border: { bottom: { style: 'thin' } },
                            numFmt: i >= 6 ? '#,##0.00' : undefined
                        };
                    });
                });
            };

            writeBlock('MANO DE OBRA', cats.manoObra, 'manoObra');
            writeBlock('MATERIALES', cats.materiales, 'materiales');
            writeBlock('EQUIPOS', cats.equipos, 'equipos');

            // 5) FILA FINAL "Total"
            const grandTotal = Object.values(sectionTotals).reduce((s, v) => s + v, 0);
            const finalRow = insumosPreTipoSheet.getRow(rowIndex++);
            insumosPreTipoSheet.mergeCells(`B${finalRow.number}:F${finalRow.number}`);
            finalRow.getCell(7).value = 'TOTAL:';
            finalRow.getCell(7).style = {
                font: { bold: true, size: 10 },
                alignment: { horizontal: 'center', vertical: 'middle' }
            };
            finalRow.getCell(8).value = grandTotal;
            finalRow.getCell(8).style = {
                font: { bold: true, size: 10 },
                alignment: { horizontal: 'right', vertical: 'middle' },
                numFmt: '#,##0.00'
            };
        };

        try {
            const nextRow = await escribirDetalles(logo1Data, logo2Data);
        } catch (error) {
            console.error('Error al procesar expediente:', error);
            alert('Error al procesar el expediente. Por favor, intenta de nuevo.');
            return;
        }

        try {
            const buffer = await workbookaesp.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `LISTA DE INSUMOS DEL PRESUPUESTO ${suppliesText}.xlsx`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error al exportar el archivo:', error);
            alert('Error al exportar el archivo Excel. Por favor, intenta de nuevo.');
        }
    }

    /*********************** EXPORTADO EN PDF ***********************/
    // Tu función principal
    descargarExpedientepdf(data, logo1Data, logo2Data, fechaActual) {
        let _dibujaDetallesPresupuesto = true;
        let _dibujaTituloACU = true;

        try {
            // Resetear flags al inicio de cada generación de PDF
            _dibujaDetallesPresupuesto = true;
            _dibujaTituloACU = true;

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('portrait', 'mm', 'A4');

            const pageWidth = 210;
            const pageHeight = 297;
            const margin = 10;
            // const headerHeight = 35; // Calcularemos dinámicamente o usaremos el retorno de addHeaderToPage
            const footerHeight = 15;

            // ... (tu código para convertir logo1Data y logo2Data a base64) ...
            let logo1Base64 = null;
            let logo2Base64 = null;

            if (logo1Data) {
                const uint8Array = new Uint8Array(logo1Data.data);
                const binaryString = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
                logo1Base64 = 'data:image/' + logo1Data.extension + ';base64,' + btoa(binaryString);
            }

            if (logo2Data) {
                const uint8Array = new Uint8Array(logo2Data.data);
                const binaryString = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
                logo2Base64 = 'data:image/' + logo2Data.extension + ';base64,' + btoa(binaryString);
            }


            const nombreProyecto = "MEJORAMIENTO DE LOS SERVICIOS DE EDUCACION INICIAL DE LA IEI Nº 358 CIUDAD DE CONTAMANA DEL DISTRITO DE CONTAMANA - PROVINCIA DE UCAYALI - DEPARTAMENTO DE LORETO";
            const cui = "2484411";
            const codigoModular = "0651216";
            const codigoLocal = "390867";
            const infoIE = "I.E.I:358; UNIDAD EJECUTORA: MUNICIPALIDAD PROVINCIAL DE UCAYALI";

            const proyectoActual = {
                nombre: "MEJORAMIENTO DE LOS SERVICIOS DE EDUCACION INICIAL DE LA IEI Nº 358 CIUDAD DE CONTAMANA DEL DISTRITO DE CONTAMANA - PROVINCIA DE UCAYALI - DEPARTAMENTO DE LORETO",
                propietario: "MUNICIPALIDAD PROVINCIAL DE HUÁNUCO",
                ubicacion: "HUÁNUCO - HUÁNUCO - HUÁNUCO",
                fecha: fechaActual || "15 de mayo del 2025" // Fecha actual del sistema si no se provee
            };

            this.addHeaderToPage = (doc, pageNum, totalPages) => {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                const leftLogoX = margin;
                const leftLogoY = margin;
                const leftLogoWidth = 25;
                const leftLogoHeight = 25;
                const rightLogoX = pageWidth - margin - 25;
                const rightLogoY = margin;
                const rightLogoWidth = 25;
                const rightLogoHeight = 25;

                if (logo1Base64) {
                    doc.addImage(logo1Base64, 'AUTO', leftLogoX, leftLogoY, leftLogoWidth, leftLogoHeight);
                }
                if (logo2Base64) {
                    doc.addImage(logo2Base64, 'AUTO', rightLogoX, rightLogoY, rightLogoWidth, rightLogoHeight);
                }

                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                const maxTextWidth = pageWidth - 2 * (margin + 30);
                const titleLines = doc.splitTextToSize(nombreProyecto, maxTextWidth);
                let titleY = margin + 5;
                titleLines.forEach(line => {
                    const titleWidth = doc.getTextWidth(line);
                    const titleX = (pageWidth - titleWidth) / 2;
                    doc.text(line, titleX, titleY);
                    titleY += 6;
                });

                doc.setFontSize(9);
                const infoY = titleY + 3;
                const infoText1 = `CUI: ${cui}; CÓDIGO MODULAR: ${codigoModular}; CÓDIGO LOCAL: ${codigoLocal}`;
                const infoWidth1 = doc.getTextWidth(infoText1);
                const infoX1 = (pageWidth - infoWidth1) / 2;
                doc.text(infoText1, infoX1, infoY);

                const infoText2 = infoIE;
                const infoWidth2 = doc.getTextWidth(infoText2);
                const infoX2 = (pageWidth - infoWidth2) / 2;
                doc.text(infoText2, infoX2, infoY + 5);

                doc.setLineWidth(0.5);
                doc.line(margin, infoY + 8, pageWidth - margin, infoY + 8);
                return infoY + 12; // Retorna la posición Y después del encabezado
            };

            this.addFooterToPage = (doc, pageNum, totalPages) => {
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setLineWidth(0.3);
                doc.line(margin, pageHeight - footerHeight, pageWidth - margin, pageHeight - footerHeight);
                const pageText = `Página ${pageNum} de ${totalPages}`;
                doc.text(pageText, pageWidth - margin - doc.getTextWidth(pageText), pageHeight - 5);
                const fechaTexto = `HYPERIUMTECH ${fechaActual || new Date().toLocaleDateString()}`;
                doc.text(fechaTexto, margin, pageHeight - 5);
            };

            this.addWatermark = (doc) => {
                doc.setFontSize(60);
                doc.setTextColor(220, 220, 220);
                doc.setFont('helvetica', 'bold');
                const watermarkText = "HYPER";
                try {
                    if (typeof doc.setGState === 'function') {
                        doc.saveGraphicsState();
                        doc.setGState(new doc.GState({ opacity: 0.15 }));
                    }
                } catch (e) { console.warn("setGState no disponible:", e); }
                const textWidth = doc.getStringUnitWidth(watermarkText) * doc.getFontSize() / doc.internal.scaleFactor;
                const x = (pageWidth - textWidth) / 2;
                const y = pageHeight / 2;
                doc.text(watermarkText, x, y);
                try {
                    if (typeof doc.restoreGraphicsState === 'function') {
                        doc.restoreGraphicsState();
                    }
                } catch (e) { console.warn("restoreGraphicsState no disponible:", e); }
                doc.setTextColor(0, 0, 0);
            };

            this.addProyectoDetalles = (currentDoc, currentY, titulo) => {
                let yPos = currentY;
                let contentDrawnThisCall = false;

                if (titulo === "PRESUPUESTO DE OBRA" && _dibujaDetallesPresupuesto) {
                    contentDrawnThisCall = true;
                    currentDoc.setFontSize(14);
                    currentDoc.setFont('helvetica', 'bold');
                    const titleWidth = currentDoc.getTextWidth(titulo);
                    currentDoc.text(titulo, (pageWidth - titleWidth) / 2, yPos);
                    yPos += 10;

                    currentDoc.setFontSize(10);
                    currentDoc.setFont('helvetica', 'bold');
                    currentDoc.text("PROYECTO:", margin, yPos);
                    currentDoc.setFont('helvetica', 'normal');
                    currentDoc.text(proyectoActual.nombre, margin + 40, yPos); // Asumiendo que entra en una línea o usa splitTextToSize
                    yPos += 7; // Ajustar según sea necesario

                    currentDoc.setFont('helvetica', 'bold');
                    currentDoc.text("PROPIETARIO:", margin, yPos);
                    currentDoc.setFont('helvetica', 'normal');
                    currentDoc.text(proyectoActual.propietario, margin + 40, yPos);
                    yPos += 7;

                    currentDoc.setFont('helvetica', 'bold');
                    currentDoc.text("UBICACIÓN:", margin, yPos);
                    currentDoc.setFont('helvetica', 'normal');
                    currentDoc.text(proyectoActual.ubicacion, margin + 40, yPos);
                    yPos += 7;

                    currentDoc.setFont('helvetica', 'bold');
                    currentDoc.text("FECHA:", margin, yPos);
                    currentDoc.setFont('helvetica', 'normal');
                    currentDoc.text(proyectoActual.fecha, margin + 40, yPos);
                    yPos += 7;

                    yPos += 3; // Espacio antes de la línea
                    currentDoc.setLineWidth(0.3);
                    currentDoc.line(margin, yPos, pageWidth - margin, yPos);
                    yPos += 7; // Espacio después de la línea
                } else if (titulo === "PRESUPUESTO DE OBRA - ACU" && _dibujaTituloACU) {
                    // contentDrawnThisCall = true;
                    // currentDoc.setFontSize(14);
                    // currentDoc.setFont('helvetica', 'bold');
                    // const titleWidth = currentDoc.getTextWidth(titulo);
                    // currentDoc.text(titulo, (pageWidth - titleWidth) / 2, yPos);
                    // yPos += 10; // Espacio después del título "ACUs"
                    contentDrawnThisCall = true;
                    currentDoc.setFontSize(14);
                    currentDoc.setFont('helvetica', 'bold');
                    const titleWidth = currentDoc.getTextWidth(titulo);
                    currentDoc.text(titulo, (pageWidth - titleWidth) / 2, yPos);
                    yPos += 10;

                    currentDoc.setFontSize(10);
                    currentDoc.setFont('helvetica', 'bold');
                    currentDoc.text("PROYECTO:", margin, yPos);
                    currentDoc.setFont('helvetica', 'normal');
                    currentDoc.text(proyectoActual.nombre, margin + 40, yPos); // Asumiendo que entra en una línea o usa splitTextToSize
                    yPos += 7; // Ajustar según sea necesario

                    currentDoc.setFont('helvetica', 'bold');
                    currentDoc.text("PROPIETARIO:", margin, yPos);
                    currentDoc.setFont('helvetica', 'normal');
                    currentDoc.text(proyectoActual.propietario, margin + 40, yPos);
                    yPos += 7;

                    currentDoc.setFont('helvetica', 'bold');
                    currentDoc.text("UBICACIÓN:", margin, yPos);
                    currentDoc.setFont('helvetica', 'normal');
                    currentDoc.text(proyectoActual.ubicacion, margin + 40, yPos);
                    yPos += 7;

                    currentDoc.setFont('helvetica', 'bold');
                    currentDoc.text("FECHA:", margin, yPos);
                    currentDoc.setFont('helvetica', 'normal');
                    currentDoc.text(proyectoActual.fecha, margin + 40, yPos);
                    yPos += 7;

                    yPos += 3; // Espacio antes de la línea
                    currentDoc.setLineWidth(0.3);
                    currentDoc.line(margin, yPos, pageWidth - margin, yPos);
                    yPos += 7; // Espacio después de la línea
                }
                return yPos; // Devuelve yPos actualizada si dibujó, sino la original.
            };

            this.tieneDetallesValidos = (detalles) => { // Tu función original
                if (!detalles) return false;
                if (!detalles.rendimiento || !detalles.unidadMD) return false; // Asegúrate que unidadMD exista o ajústalo
                const secciones = ['manoObra', 'materiales', 'equipos'];
                return secciones.some(seccion =>
                    detalles[seccion] &&
                    Array.isArray(detalles[seccion]) &&
                    detalles[seccion].length > 0
                );
            };


            this.generateTables = (currentDoc, tableData) => {
                const headers = ['Item', 'Descripción', 'Unid.', 'Cant.', 'Precio', 'Parcial', 'Subtotal'];
                const rows = [];
                const detallesRows = [];

                const processData = (items, level = 0, parentItem = '') => {
                    items.forEach((item) => {
                        rows.push([
                            item.item || '',
                            { content: item.descripcion || '', styles: { cellPadding: { left: 4 }, halign: 'left', valign: 'top', fontSize: 7 } },
                            item.unidad || '',
                            item.cantidad || '',
                            item.precio || '',
                            (item.parcial !== undefined && item.parcial !== null) ? item.parcial.toFixed(2) : '',
                            (item.subtotal !== undefined && item.subtotal !== null) ? item.subtotal.toFixed(2) : ''
                        ]);
                        if (item.detalles && this.tieneDetallesValidos(item.detalles)) {
                            const partidaDetallesHeader = [
                                { content: `Partida: ${item.item} - ${item.descripcion}`, colSpan: 5, styles: { halign: 'left', fontStyle: 'bold', fontSize: 8 } },
                                { content: `Rendimiento: ${item.detalles.rendimiento || 0} ${item.detalles.unidadMD || "m"}/Día`, colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', fontSize: 8 } }
                            ];
                            detallesRows.push(partidaDetallesHeader);
                            detallesRows.push([{ content: item.precio, colSpan: 7, styles: { halign: 'right', fontStyle: 'bold', fontSize: 8 } }]);
                            detallesRows.push(
                                ['Ind.', 'Descripción', 'Unid.', 'Recursos', 'Cant.', 'Precio', 'Parcial'].map(header => ({
                                    content: header, styles: { fillColor: [0, 102, 204], textColor: 255, fontSize: 8, fontStyle: 'bold', halign: 'center' }
                                }))
                            );
                            const sections = [
                                { title: 'MANO DE OBRA', data: item.detalles.manoObra },
                                { title: 'MATERIALES', data: item.detalles.materiales },
                                { title: 'EQUIPO', data: item.detalles.equipos }
                            ];
                            sections.forEach(section => {
                                if (section.data && section.data.length > 0) {
                                    detallesRows.push([
                                        { content: section.title, colSpan: 6, styles: { halign: 'left', fontStyle: 'bold', fontSize: 8 } },
                                        { content: section.data.reduce((sum, d) => sum + (parseFloat(d.parcial) || 0), 0).toFixed(2), styles: { halign: 'left', fontStyle: 'bold', fontSize: 8 } } // Debería ser 'right' para el total?
                                    ]);
                                    section.data.forEach(detail => {
                                        detallesRows.push([
                                            detail.ind || '',
                                            { content: detail.descripcion || '', styles: { fontSize: 8, halign: 'left' } },
                                            detail.und || '', detail.recursos || '', detail.cantidad || '', detail.precio || '', detail.parcial || ''
                                        ]);
                                    });
                                }
                            });
                            detallesRows.push([{ content: '', colSpan: 7, styles: { lineWidth: { bottom: 0.5 } } }]);
                        }
                        if (item._children && item._children.length > 0) {
                            processData(item._children, level + 1, parentItem ? `${parentItem}.${item.item}` : item.item);
                        }
                    });
                };

                processData(tableData);

                // Calcular altura del header una vez para usar en margin.top de autoTable
                // Usamos un doc temporal solo para medir, no para dibujar en el doc final aún.
                const tempDoc = new jsPDF('portrait', 'mm', 'A4');
                const headerEndYValue = this.addHeaderToPage(tempDoc, 1, 1); // pageNum, totalPages no importan mucho para la altura
                const autoTableTopMarginValue = headerEndYValue + 5; // Espacio para el header + un poco más

                // --- Tabla Principal (Presupuesto) ---
                let startYMainTable = this.addHeaderToPage(currentDoc, 1, 0) + 5; // Dibuja header en P1. TotalPages se actualizará
                this.addWatermark(currentDoc); // Dibuja watermark en P1

                if (_dibujaDetallesPresupuesto) {
                    startYMainTable = this.addProyectoDetalles(currentDoc, startYMainTable, "PRESUPUESTO DE OBRA");
                    //_dibujaDetallesPresupuesto = false; // Detalles del proyecto dibujados
                }

                currentDoc.autoTable({
                    startY: startYMainTable,
                    head: [headers],
                    body: rows,
                    margin: { top: autoTableTopMarginValue, left: margin, right: margin, bottom: footerHeight + margin },
                    styles: { fontSize: 8, cellPadding: 2 },
                    headStyles: { fillColor: [0, 102, 204], textColor: 255, fontSize: 8 },
                    bodyStyles: { textColor: 50, fontSize: 8 },
                    columnStyles: {
                        0: { cellWidth: 20, fontSize: 8 },
                        1: { cellWidth: 80, halign: 'left', valign: 'top', overflow: 'linebreak', fontSize: 5 },
                        2: { cellWidth: 15, fontSize: 8 }, 3: { cellWidth: 15, fontSize: 8 },
                        4: { cellWidth: 20, fontSize: 8 }, 5: { cellWidth: 20, fontSize: 8 },
                        6: { cellWidth: 20, fontSize: 8 }
                    },
                    didDrawPage: (hookData) => {
                        if (hookData.pageNumber > 1) { // Solo para páginas 2+ de esta tabla
                            this.addHeaderToPage(currentDoc, hookData.pageNumber, 0); // TotalPages se actualizará
                            this.addWatermark(currentDoc);
                        }
                    }
                });

                // --- Tabla de Detalles (ACUs) ---
                if (detallesRows.length > 0) {
                    currentDoc.addPage();
                    const acusPageNum = currentDoc.internal.getNumberOfPages();
                    let startYAcusTable = this.addHeaderToPage(currentDoc, acusPageNum, 0) + 5; // Header en la nueva página
                    this.addWatermark(currentDoc); // Watermark en la nueva página

                    if (_dibujaTituloACU) {
                        startYAcusTable = this.addProyectoDetalles(currentDoc, startYAcusTable, "PRESUPUESTO DE OBRA - ACU");
                        //_dibujaTituloACU = false; // Título ACUs dibujado
                    }

                    currentDoc.autoTable({
                        startY: startYAcusTable,
                        body: detallesRows,
                        theme: 'plain',
                        margin: { top: autoTableTopMarginValue, left: margin, right: margin, bottom: footerHeight + margin },
                        styles: { fontSize: 8, cellPadding: 2 },
                        columnStyles: {
                            0: { cellWidth: 15, fontSize: 8 },
                            1: { cellWidth: 80, overflow: 'linebreak', halign: 'left', fontSize: 8 },
                            2: { cellWidth: 15, fontSize: 8 }, 3: { cellWidth: 25, fontSize: 8 },
                            4: { cellWidth: 15, fontSize: 8 }, 5: { cellWidth: 20, fontSize: 8 },
                            6: { cellWidth: 20, fontSize: 8 }
                        },
                        didDrawPage: (hookData) => {
                            // hookData.settings.pageCount es el contador de páginas para ESTA tabla
                            if (hookData.settings.pageCount > 1) { // Si la tabla ACUs ocupa más de 1 página
                                this.addHeaderToPage(currentDoc, hookData.pageNumber, 0); // TotalPages se actualizará
                                this.addWatermark(currentDoc);
                            }
                        }
                    });
                }

                // Actualizar pie de página en todas las páginas con el número total correcto
                const totalPages = currentDoc.internal.getNumberOfPages();
                for (let i = 1; i <= totalPages; i++) {
                    currentDoc.setPage(i);
                    // Re-dibujar el encabezado no es ideal aquí, pero el pie de página sí.
                    // this.addHeaderToPage(currentDoc, i, totalPages); // Podría ser redundante si ya se hizo bien
                    this.addFooterToPage(currentDoc, i, totalPages);
                }
            };

            // Iniciar la generación de tablas
            this.generateTables(doc, data);

            doc.save('presupuestos.pdf');

        } catch (error) {
            console.error("Error generando PDF:", error);
            // Considerar mostrar un mensaje de error al usuario también
        }
    }
    descargaracuespecialidadpdf(data, specialtyInput, logo1Data, logo2Data, fechaActual) {
        let _dibujaDetallesPresupuesto = true;
        let _dibujaTituloACU = true;

        try {
            // Resetear flags al inicio de cada generación de PDF
            _dibujaDetallesPresupuesto = true;
            _dibujaTituloACU = true;

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('portrait', 'mm', 'A4');

            const pageWidth = 210;
            const pageHeight = 297;
            const margin = 10;
            // const headerHeight = 35; // Calcularemos dinámicamente o usaremos el retorno de addHeaderToPage
            const footerHeight = 15;

            // ... (tu código para convertir logo1Data y logo2Data a base64) ...
            let logo1Base64 = null;
            let logo2Base64 = null;

            if (logo1Data) {
                const uint8Array = new Uint8Array(logo1Data.data);
                const binaryString = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
                logo1Base64 = 'data:image/' + logo1Data.extension + ';base64,' + btoa(binaryString);
            }

            if (logo2Data) {
                const uint8Array = new Uint8Array(logo2Data.data);
                const binaryString = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
                logo2Base64 = 'data:image/' + logo2Data.extension + ';base64,' + btoa(binaryString);
            }

            const nombreProyecto = "MEJORAMIENTO DE LOS SERVICIOS DE EDUCACION INICIAL DE LA IEI Nº 358 CIUDAD DE CONTAMANA DEL DISTRITO DE CONTAMANA - PROVINCIA DE UCAYALI - DEPARTAMENTO DE LORETO";
            const cui = "2484411";
            const codigoModular = "0651216";
            const codigoLocal = "390867";
            const infoIE = "I.E.I:358; UNIDAD EJECUTORA: MUNICIPALIDAD PROVINCIAL DE UCAYALI";

            const proyectoActual = {
                nombre: "MEJORAMIENTO DE LOS SERVICIOS DE EDUCACION INICIAL DE LA IEI Nº 358 CIUDAD DE CONTAMANA DEL DISTRITO DE CONTAMANA - PROVINCIA DE UCAYALI - DEPARTAMENTO DE LORETO",
                propietario: "MUNICIPALIDAD PROVINCIAL DE HUÁNUCO",
                ubicacion: "HUÁNUCO - HUÁNUCO - HUÁNUCO",
                fecha: fechaActual || "15 de mayo del 2025" // Fecha actual del sistema si no se provee
            };

            this.addHeaderToPage = (doc, pageNum, totalPages) => {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                const leftLogoX = margin;
                const leftLogoY = margin;
                const leftLogoWidth = 25;
                const leftLogoHeight = 25;
                const rightLogoX = pageWidth - margin - 25;
                const rightLogoY = margin;
                const rightLogoWidth = 25;
                const rightLogoHeight = 25;

                if (logo1Base64) {
                    doc.addImage(logo1Base64, 'AUTO', leftLogoX, leftLogoY, leftLogoWidth, leftLogoHeight);
                }
                if (logo2Base64) {
                    doc.addImage(logo2Base64, 'AUTO', rightLogoX, rightLogoY, rightLogoWidth, rightLogoHeight);
                }

                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                const maxTextWidth = pageWidth - 2 * (margin + 30);
                const titleLines = doc.splitTextToSize(nombreProyecto, maxTextWidth);
                let titleY = margin + 5;
                titleLines.forEach(line => {
                    const titleWidth = doc.getTextWidth(line);
                    const titleX = (pageWidth - titleWidth) / 2;
                    doc.text(line, titleX, titleY);
                    titleY += 6;
                });

                doc.setFontSize(9);
                const infoY = titleY + 3;
                const infoText1 = `CUI: ${cui}; CÓDIGO MODULAR: ${codigoModular}; CÓDIGO LOCAL: ${codigoLocal}`;
                const infoWidth1 = doc.getTextWidth(infoText1);
                const infoX1 = (pageWidth - infoWidth1) / 2;
                doc.text(infoText1, infoX1, infoY);

                const infoText2 = infoIE;
                const infoWidth2 = doc.getTextWidth(infoText2);
                const infoX2 = (pageWidth - infoWidth2) / 2;
                doc.text(infoText2, infoX2, infoY + 5);

                doc.setLineWidth(0.5);
                doc.line(margin, infoY + 8, pageWidth - margin, infoY + 8);
                return infoY + 12; // Retorna la posición Y después del encabezado
            };

            this.addFooterToPage = (doc, pageNum, totalPages) => {
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setLineWidth(0.3);
                doc.line(margin, pageHeight - footerHeight, pageWidth - margin, pageHeight - footerHeight);
                const pageText = `Página ${pageNum} de ${totalPages}`;
                doc.text(pageText, pageWidth - margin - doc.getTextWidth(pageText), pageHeight - 5);
                const fechaTexto = `HYPERIUMTECH ${fechaActual || new Date().toLocaleDateString()}`;
                doc.text(fechaTexto, margin, pageHeight - 5);
            };

            this.addWatermark = (doc) => {
                doc.setFontSize(60);
                doc.setTextColor(220, 220, 220);
                doc.setFont('helvetica', 'bold');
                const watermarkText = "HYPER";
                try {
                    if (typeof doc.setGState === 'function') {
                        doc.saveGraphicsState();
                        doc.setGState(new doc.GState({ opacity: 0.15 }));
                    }
                } catch (e) { console.warn("setGState no disponible:", e); }
                const textWidth = doc.getStringUnitWidth(watermarkText) * doc.getFontSize() / doc.internal.scaleFactor;
                const x = (pageWidth - textWidth) / 2;
                const y = pageHeight / 2;
                doc.text(watermarkText, x, y);
                try {
                    if (typeof doc.restoreGraphicsState === 'function') {
                        doc.restoreGraphicsState();
                    }
                } catch (e) { console.warn("restoreGraphicsState no disponible:", e); }
                doc.setTextColor(0, 0, 0);
            };

            this.addProyectoDetalles = (currentDoc, currentY, titulo) => {
                let yPos = currentY;
                let contentDrawnThisCall = false;
                const pageHeight = currentDoc.internal.pageSize.height;
                const margin = 10;
                const pageWidth = currentDoc.internal.pageSize.width;
                const maxTextWidth = pageWidth - 2 * margin - 40; // Width for text after label

                if (titulo === `PRESUPUESTO DE OBRA ${specialtyInput}` && _dibujaDetallesPresupuesto) {
                    // Check if there's enough space; if not, add a new page
                    if (yPos + 60 > pageHeight - 20) { // 60mm for content, 20mm for footer
                        currentDoc.addPage();
                        yPos = this.addHeaderToPage(currentDoc, currentDoc.internal.getNumberOfPages(), 0) + 5;
                        this.addWatermark(currentDoc);
                    }

                    // Title
                    currentDoc.setFontSize(14);
                    currentDoc.setFont('helvetica', 'bold');
                    const titleWidth = currentDoc.getTextWidth(titulo);
                    currentDoc.text(titulo, (pageWidth - titleWidth) / 2, yPos);
                    yPos += 10;

                    // Project details with fallback for undefined values
                    currentDoc.setFontSize(10);
                    const fields = [
                        { label: "PROYECTO:", value: proyectoActual?.nombre || "N/A" },
                        { label: "PROPIETARIO:", value: proyectoActual?.propietario || "N/A" },
                        { label: "UBICACIÓN:", value: proyectoActual?.ubicacion || "N/A" },
                        { label: "FECHA:", value: proyectoActual?.fecha || "N/A" }
                    ];

                    fields.forEach(({ label, value }) => {
                        currentDoc.setFont('helvetica', 'bold');
                        currentDoc.text(label, margin, yPos);
                        currentDoc.setFont('helvetica', 'normal');
                        const splitText = currentDoc.splitTextToSize(value, maxTextWidth);
                        currentDoc.text(splitText, margin + 40, yPos);
                        yPos += 7 * splitText.length; // Adjust yPos based on number of lines
                    });

                    yPos += 3; // Space before line
                    currentDoc.setLineWidth(0.3);
                    currentDoc.line(margin, yPos, pageWidth - margin, yPos);
                    yPos += 7; // Space after line
                } else if (titulo === `PRESUPUESTO DE OBRA - ACU ${specialtyInput}` && _dibujaTituloACU) {
                    // Check if there's enough space; if not, add a new page
                    if (yPos + 60 > pageHeight - 20) { // 60mm for content, 20mm for footer
                        currentDoc.addPage();
                        yPos = this.addHeaderToPage(currentDoc, currentDoc.internal.getNumberOfPages(), 0) + 5;
                        this.addWatermark(currentDoc);
                    }

                    // Title
                    currentDoc.setFontSize(14);
                    currentDoc.setFont('helvetica', 'bold');
                    const titleWidth = currentDoc.getTextWidth(titulo);
                    currentDoc.text(titulo, (pageWidth - titleWidth) / 2, yPos);
                    yPos += 10;

                    // Project details with fallback for undefined values
                    currentDoc.setFontSize(10);
                    const fields = [
                        { label: "PROYECTO:", value: proyectoActual?.nombre || "N/A" },
                        { label: "PROPIETARIO:", value: proyectoActual?.propietario || "N/A" },
                        { label: "UBICACIÓN:", value: proyectoActual?.ubicacion || "N/A" },
                        { label: "FECHA:", value: proyectoActual?.fecha || "N/A" }
                    ];

                    fields.forEach(({ label, value }) => {
                        currentDoc.setFont('helvetica', 'bold');
                        currentDoc.text(label, margin, yPos);
                        currentDoc.setFont('helvetica', 'normal');
                        const splitText = currentDoc.splitTextToSize(value, maxTextWidth);
                        currentDoc.text(splitText, margin + 40, yPos);
                        yPos += 7 * splitText.length; // Adjust yPos based on number of lines
                    });

                    yPos += 3; // Space before line
                    currentDoc.setLineWidth(0.3);
                    currentDoc.line(margin, yPos, pageWidth - margin, yPos);
                    yPos += 7; // Space after line
                }
                return yPos; // Devuelve yPos actualizada si dibujó, sino la original.
            };

            this.tieneDetallesValidos = (detalles) => { // Tu función original
                if (!detalles) return false;
                if (!detalles.rendimiento || !detalles.unidadMD) return false; // Asegúrate que unidadMD exista o ajústalo
                const secciones = ['manoObra', 'materiales', 'equipos'];
                return secciones.some(seccion =>
                    detalles[seccion] &&
                    Array.isArray(detalles[seccion]) &&
                    detalles[seccion].length > 0
                );
            };

            this.generateTables = (currentDoc, tableData) => {
                const headers = ['Item', 'Descripción', 'Unid.', 'Cant.', 'Precio', 'Parcial', 'Subtotal'];
                const rows = [];
                const detallesRows = [];

                const processData = (items, level = 0, parentItem = '') => {
                    items.forEach((item) => {
                        rows.push([
                            item.item || '',
                            { content: item.descripcion || '', styles: { cellPadding: { left: 4 }, halign: 'left', valign: 'top', fontSize: 7 } },
                            item.unidad || '',
                            item.cantidad || '',
                            item.precio || '',
                            (item.parcial !== undefined && item.parcial !== null) ? item.parcial.toFixed(2) : '',
                            (item.subtotal !== undefined && item.subtotal !== null) ? item.subtotal.toFixed(2) : ''
                        ]);
                        if (item.detalles && this.tieneDetallesValidos(item.detalles)) {
                            const partidaDetallesHeader = [
                                { content: `Partida: ${item.item} - ${item.descripcion}`, colSpan: 5, styles: { halign: 'left', fontStyle: 'bold', fontSize: 8 } },
                                { content: `Rendimiento: ${item.detalles.rendimiento || 0} ${item.detalles.unidadMD || "m"}/Día`, colSpan: 2, styles: { halign: 'right', fontStyle: 'bold', fontSize: 8 } }
                            ];
                            detallesRows.push(partidaDetallesHeader);
                            detallesRows.push([{ content: item.precio, colSpan: 7, styles: { halign: 'right', fontStyle: 'bold', fontSize: 8 } }]);
                            detallesRows.push(
                                ['Ind.', 'Descripción', 'Unid.', 'Recursos', 'Cant.', 'Precio', 'Parcial'].map(header => ({
                                    content: header, styles: { fillColor: [0, 102, 204], textColor: 255, fontSize: 8, fontStyle: 'bold', halign: 'center' }
                                }))
                            );
                            const sections = [
                                { title: 'MANO DE OBRA', data: item.detalles.manoObra },
                                { title: 'MATERIALES', data: item.detalles.materiales },
                                { title: 'EQUIPO', data: item.detalles.equipos }
                            ];
                            sections.forEach(section => {
                                if (section.data && section.data.length > 0) {
                                    detallesRows.push([
                                        { content: section.title, colSpan: 6, styles: { halign: 'left', fontStyle: 'bold', fontSize: 8 } },
                                        { content: section.data.reduce((sum, d) => sum + (parseFloat(d.parcial) || 0), 0).toFixed(2), styles: { halign: 'left', fontStyle: 'bold', fontSize: 8 } } // Debería ser 'right' para el total?
                                    ]);
                                    section.data.forEach(detail => {
                                        detallesRows.push([
                                            detail.ind || '',
                                            { content: detail.descripcion || '', styles: { fontSize: 8, halign: 'left' } },
                                            detail.und || '', detail.recursos || '', detail.cantidad || '', detail.precio || '', detail.parcial || ''
                                        ]);
                                    });
                                }
                            });
                            detallesRows.push([{ content: '', colSpan: 7, styles: { lineWidth: { bottom: 0.5 } } }]);
                        }
                        if (item._children && item._children.length > 0) {
                            processData(item._children, level + 1, parentItem ? `${parentItem}.${item.item}` : item.item);
                        }
                    });
                };

                processData(tableData);

                // Calcular altura del header una vez para usar en margin.top de autoTable
                // Usamos un doc temporal solo para medir, no para dibujar en el doc final aún.
                const tempDoc = new jsPDF('portrait', 'mm', 'A4');
                const headerEndYValue = this.addHeaderToPage(tempDoc, 1, 1); // pageNum, totalPages no importan mucho para la altura
                const autoTableTopMarginValue = headerEndYValue + 5; // Espacio para el header + un poco más

                // --- Tabla Principal (Presupuesto) ---
                let startYMainTable = this.addHeaderToPage(currentDoc, 1, 0) + 5; // Dibuja header en P1. TotalPages se actualizará
                this.addWatermark(currentDoc); // Dibuja watermark en P1

                if (_dibujaDetallesPresupuesto) {
                    startYMainTable = this.addProyectoDetalles(currentDoc, startYMainTable, `PRESUPUESTO DE OBRA ${specialtyInput}`);
                    //_dibujaDetallesPresupuesto = false; // Detalles del proyecto dibujados
                }

                currentDoc.autoTable({
                    startY: startYMainTable,
                    head: [headers],
                    body: rows,
                    margin: { top: autoTableTopMarginValue, left: margin, right: margin, bottom: footerHeight + margin },
                    styles: { fontSize: 8, cellPadding: 2 },
                    headStyles: { fillColor: [0, 102, 204], textColor: 255, fontSize: 8 },
                    bodyStyles: { textColor: 50, fontSize: 8 },
                    columnStyles: {
                        0: { cellWidth: 20, fontSize: 8 },
                        1: { cellWidth: 80, halign: 'left', valign: 'top', overflow: 'linebreak', fontSize: 5 },
                        2: { cellWidth: 15, fontSize: 8 }, 3: { cellWidth: 15, fontSize: 8 },
                        4: { cellWidth: 20, fontSize: 8 }, 5: { cellWidth: 20, fontSize: 8 },
                        6: { cellWidth: 20, fontSize: 8 }
                    },
                    didDrawPage: (hookData) => {
                        if (hookData.pageNumber > 1) { // Solo para páginas 2+ de esta tabla
                            this.addHeaderToPage(currentDoc, hookData.pageNumber, 0); // TotalPages se actualizará
                            this.addWatermark(currentDoc);
                        }
                    }
                });

                // --- Tabla de Detalles (ACUs) ---
                if (detallesRows.length > 0) {
                    currentDoc.addPage();
                    const acusPageNum = currentDoc.internal.getNumberOfPages();
                    let startYAcusTable = this.addHeaderToPage(currentDoc, acusPageNum, 0) + 5; // Header en la nueva página
                    this.addWatermark(currentDoc); // Watermark en la nueva página

                    if (_dibujaTituloACU) {
                        startYAcusTable = this.addProyectoDetalles(currentDoc, startYAcusTable, `PRESUPUESTO DE OBRA - ACU ${specialtyInput}`);
                        //_dibujaTituloACU = false; // Título ACUs dibujado
                    }

                    currentDoc.autoTable({
                        startY: startYAcusTable,
                        body: detallesRows,
                        theme: 'plain',
                        margin: { top: autoTableTopMarginValue, left: margin, right: margin, bottom: footerHeight + margin },
                        styles: { fontSize: 8, cellPadding: 2 },
                        columnStyles: {
                            0: { cellWidth: 15, fontSize: 8 },
                            1: { cellWidth: 80, overflow: 'linebreak', halign: 'left', fontSize: 8 },
                            2: { cellWidth: 15, fontSize: 8 }, 3: { cellWidth: 25, fontSize: 8 },
                            4: { cellWidth: 15, fontSize: 8 }, 5: { cellWidth: 20, fontSize: 8 },
                            6: { cellWidth: 20, fontSize: 8 }
                        },
                        didDrawPage: (hookData) => {
                            // hookData.settings.pageCount es el contador de páginas para ESTA tabla
                            if (hookData.settings.pageCount > 1) { // Si la tabla ACUs ocupa más de 1 página
                                this.addHeaderToPage(currentDoc, hookData.pageNumber, 0); // TotalPages se actualizará
                                this.addWatermark(currentDoc);
                            }
                        }
                    });
                }

                // Actualizar pie de página en todas las páginas con el número total correcto
                const totalPages = currentDoc.internal.getNumberOfPages();
                for (let i = 1; i <= totalPages; i++) {
                    currentDoc.setPage(i);
                    // Re-dibujar el encabezado no es ideal aquí, pero el pie de página sí.
                    // this.addHeaderToPage(currentDoc, i, totalPages); // Podría ser redundante si ya se hizo bien
                    this.addFooterToPage(currentDoc, i, totalPages);
                }
            };

            // Iniciar la generación de tablas
            this.generateTables(doc, data);

            doc.save(`PRESUPUESTO DE OBRA ${specialtyInput}.pdf`);

        } catch (error) {
            console.error("Error generando PDF:", error);
            // Considerar mostrar un mensaje de error al usuario también
        }
    }
    descargarInsumospdf({ datos }, logo1Data, logo2Data, fechaActual) {
        let _dibujaDetallesPresupuesto = true;
        let _dibujaTituloACU = true;

        try {
            // Resetear flags al inicio de cada generación de PDF
            _dibujaDetallesPresupuesto = true;
            _dibujaTituloACU = true;

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('portrait', 'mm', 'A4');

            const pageWidth = 210;
            const pageHeight = 297;
            const margin = 10;
            // const headerHeight = 35; // Calcularemos dinámicamente o usaremos el retorno de addHeaderToPage
            const footerHeight = 15;

            // ... (tu código para convertir logo1Data y logo2Data a base64) ...
            let logo1Base64 = null;
            let logo2Base64 = null;

            if (logo1Data) {
                const uint8Array = new Uint8Array(logo1Data.data);
                const binaryString = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
                logo1Base64 = 'data:image/' + logo1Data.extension + ';base64,' + btoa(binaryString);
            }

            if (logo2Data) {
                const uint8Array = new Uint8Array(logo2Data.data);
                const binaryString = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
                logo2Base64 = 'data:image/' + logo2Data.extension + ';base64,' + btoa(binaryString);
            }


            const nombreProyecto = "MEJORAMIENTO DE LOS SERVICIOS DE EDUCACION INICIAL DE LA IEI Nº 358 CIUDAD DE CONTAMANA DEL DISTRITO DE CONTAMANA - PROVINCIA DE UCAYALI - DEPARTAMENTO DE LORETO";
            const cui = "2484411";
            const codigoModular = "0651216";
            const codigoLocal = "390867";
            const infoIE = "I.E.I:358; UNIDAD EJECUTORA: MUNICIPALIDAD PROVINCIAL DE UCAYALI";

            const proyectoActual = {
                nombre: "MEJORAMIENTO DE LOS SERVICIOS DE EDUCACION INICIAL DE LA IEI Nº 358 CIUDAD DE CONTAMANA DEL DISTRITO DE CONTAMANA - PROVINCIA DE UCAYALI - DEPARTAMENTO DE LORETO",
                propietario: "MUNICIPALIDAD PROVINCIAL DE HUÁNUCO",
                ubicacion: "HUÁNUCO - HUÁNUCO - HUÁNUCO",
                fecha: fechaActual || "15 de mayo del 2025" // Fecha actual del sistema si no se provee
            };

            this.addHeaderToPage = (doc, pageNum, totalPages) => {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                const leftLogoX = margin;
                const leftLogoY = margin;
                const leftLogoWidth = 25;
                const leftLogoHeight = 25;
                const rightLogoX = pageWidth - margin - 25;
                const rightLogoY = margin;
                const rightLogoWidth = 25;
                const rightLogoHeight = 25;

                if (logo1Base64) {
                    doc.addImage(logo1Base64, 'AUTO', leftLogoX, leftLogoY, leftLogoWidth, leftLogoHeight);
                }
                if (logo2Base64) {
                    doc.addImage(logo2Base64, 'AUTO', rightLogoX, rightLogoY, rightLogoWidth, rightLogoHeight);
                }

                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                const maxTextWidth = pageWidth - 2 * (margin + 30);
                const titleLines = doc.splitTextToSize(nombreProyecto, maxTextWidth);
                let titleY = margin + 5;
                titleLines.forEach(line => {
                    const titleWidth = doc.getTextWidth(line);
                    const titleX = (pageWidth - titleWidth) / 2;
                    doc.text(line, titleX, titleY);
                    titleY += 6;
                });

                doc.setFontSize(9);
                const infoY = titleY + 3;
                const infoText1 = `CUI: ${cui}; CÓDIGO MODULAR: ${codigoModular}; CÓDIGO LOCAL: ${codigoLocal}`;
                const infoWidth1 = doc.getTextWidth(infoText1);
                const infoX1 = (pageWidth - infoWidth1) / 2;
                doc.text(infoText1, infoX1, infoY);

                const infoText2 = infoIE;
                const infoWidth2 = doc.getTextWidth(infoText2);
                const infoX2 = (pageWidth - infoWidth2) / 2;
                doc.text(infoText2, infoX2, infoY + 5);

                doc.setLineWidth(0.5);
                doc.line(margin, infoY + 8, pageWidth - margin, infoY + 8);
                return infoY + 12; // Retorna la posición Y después del encabezado
            };

            this.addFooterToPage = (doc, pageNum, totalPages) => {
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setLineWidth(0.3);
                doc.line(margin, pageHeight - footerHeight, pageWidth - margin, pageHeight - footerHeight);
                const pageText = `Página ${pageNum} de ${totalPages}`;
                doc.text(pageText, pageWidth - margin - doc.getTextWidth(pageText), pageHeight - 5);
                const fechaTexto = `HYPERIUMTECH ${fechaActual || new Date().toLocaleDateString()}`;
                doc.text(fechaTexto, margin, pageHeight - 5);
            };

            this.addWatermark = (doc) => {
                doc.setFontSize(60);
                doc.setTextColor(220, 220, 220);
                doc.setFont('helvetica', 'bold');
                const watermarkText = "HYPER";
                try {
                    if (typeof doc.setGState === 'function') {
                        doc.saveGraphicsState();
                        doc.setGState(new doc.GState({ opacity: 0.15 }));
                    }
                } catch (e) { console.warn("setGState no disponible:", e); }
                const textWidth = doc.getStringUnitWidth(watermarkText) * doc.getFontSize() / doc.internal.scaleFactor;
                const x = (pageWidth - textWidth) / 2;
                const y = pageHeight / 2;
                doc.text(watermarkText, x, y);
                try {
                    if (typeof doc.restoreGraphicsState === 'function') {
                        doc.restoreGraphicsState();
                    }
                } catch (e) { console.warn("restoreGraphicsState no disponible:", e); }
                doc.setTextColor(0, 0, 0);
            };

            this.addProyectoDetalles = (currentDoc, currentY, titulo) => {
                let yPos = currentY;
                const pageHeight = currentDoc.internal.pageSize.height;
                const margin = 10;
                const pageWidth = currentDoc.internal.pageSize.width;
                const maxTextWidth = pageWidth - 2 * margin - 40; // Width for text after label

                // Draw details only for insumos-related titles
                if ((titulo === "INSUMOS" || titulo === "PRESUPUESTO DE OBRA - INSUMOS") && _dibujaTituloACU) {
                    // Check if there's enough space; if not, add a new page
                    if (yPos + 60 > pageHeight - 20) { // 60mm for content, 20mm for footer
                        currentDoc.addPage();
                        yPos = this.addHeaderToPage(currentDoc, currentDoc.internal.getNumberOfPages(), 0) + 5;
                        this.addWatermark(currentDoc);
                    }

                    // Title
                    currentDoc.setFontSize(14);
                    currentDoc.setFont('helvetica', 'bold');
                    const titleWidth = currentDoc.getTextWidth(titulo);
                    currentDoc.text(titulo, (pageWidth - titleWidth) / 2, yPos);
                    yPos += 10;

                    // Project details with fallback for undefined values
                    currentDoc.setFontSize(10);
                    const fields = [
                        { label: "PROYECTO:", value: proyectoActual?.nombre || "N/A" },
                        { label: "PROPIETARIO:", value: proyectoActual?.propietario || "N/A" },
                        { label: "UBICACIÓN:", value: proyectoActual?.ubicacion || "N/A" },
                        { label: "FECHA:", value: proyectoActual?.fecha || "N/A" }
                    ];

                    fields.forEach(({ label, value }) => {
                        currentDoc.setFont('helvetica', 'bold');
                        currentDoc.text(label, margin, yPos);
                        currentDoc.setFont('helvetica', 'normal');
                        const splitText = currentDoc.splitTextToSize(value, maxTextWidth);
                        currentDoc.text(splitText, margin + 40, yPos);
                        yPos += 7 * splitText.length; // Adjust yPos based on number of lines
                    });

                    yPos += 3; // Space before line
                    currentDoc.setLineWidth(0.3);
                    currentDoc.line(margin, yPos, pageWidth - margin, yPos);
                    yPos += 7; // Space after line
                }
                return yPos;
            };

            this.generateTables = (currentDoc, tableData) => {
                const detallesRows = [];
                const margin = 10;
                const footerHeight = 10;

                // Group data by tipoinsumo
                const groupedData = tableData.reduce((acc, item) => {
                    const type = item.tipoinsumo?.toLowerCase() || 'otros'; // Fallback for undefined tipoinsumo
                    if (!acc[type]) acc[type] = [];
                    acc[type].push({
                        ind: item.indice || '',
                        descripcion: item.descripcion || '',
                        und: item.unidad || '',
                        recursos: item.recursos || '',
                        cantidad: item.cantidad || '',
                        precio: item.precio || '',
                        parcial: item.total || ''
                    });
                    return acc;
                }, {});

                // Define sections with proper titles
                const sections = [
                    { title: 'MANO DE OBRA', data: groupedData.manoobra || [] },
                    { title: 'MATERIALES', data: groupedData.materiales || [] },
                    { title: 'EQUIPO', data: groupedData.equipos || [] }
                ];

                // Add partida header
                detallesRows.push([
                    { content: 'Partida: Insumos', colSpan: 7, styles: { halign: 'left', fontStyle: 'bold', fontSize: 8 } }
                ]);

                // Add table headers
                detallesRows.push(
                    ['Ind.', 'Descripción', 'Unid.', 'Recursos', 'Cant.', 'Precio', 'Parcial'].map(header => ({
                        content: header, styles: { fillColor: [0, 102, 204], textColor: 255, fontSize: 8, fontStyle: 'bold', halign: 'center' }
                    }))
                );

                // Process each section
                sections.forEach(section => {
                    if (section.data && section.data.length > 0) {
                        const sectionTotal = section.data.reduce((sum, d) => sum + (parseFloat(d.parcial) || 0), 0).toFixed(2);
                        detallesRows.push([
                            { content: section.title, colSpan: 6, styles: { halign: 'left', fontStyle: 'bold', fontSize: 8 } },
                            { content: sectionTotal, styles: { halign: 'right', fontStyle: 'bold', fontSize: 8 } }
                        ]);
                        section.data.forEach(detail => {
                            detallesRows.push([
                                detail.ind || '',
                                { content: detail.descripcion || '', styles: { fontSize: 8, halign: 'left' } },
                                detail.und || '',
                                detail.recursos || '',
                                detail.cantidad || '',
                                detail.precio || '',
                                detail.parcial || ''
                            ]);
                        });
                    }
                });

                // Add separator line
                if (detallesRows.length > 2) {
                    detallesRows.push([{ content: '', colSpan: 7, styles: { lineWidth: { bottom: 0.5 } } }]);
                }

                // Calculate header height for margin
                const tempDoc = new jsPDF('portrait', 'mm', 'A4');
                const headerEndYValue = this.addHeaderToPage(tempDoc, 1, 1);
                const autoTableTopMarginValue = headerEndYValue + 5;

                // --- Tabla de Detalles (Insumos) ---
                if (detallesRows.length > 0) {
                    const acusPageNum = currentDoc.internal.getNumberOfPages();
                    let startYAcusTable = this.addHeaderToPage(currentDoc, acusPageNum, 0) + 5;
                    this.addWatermark(currentDoc);

                    // Draw project details before the table
                    startYAcusTable = this.addProyectoDetalles(currentDoc, startYAcusTable, "PRESUPUESTO DE OBRA - INSUMOS");

                    currentDoc.autoTable({
                        startY: startYAcusTable,
                        body: detallesRows,
                        theme: 'plain',
                        margin: { top: autoTableTopMarginValue, left: margin, right: margin, bottom: footerHeight + margin },
                        styles: { fontSize: 8, cellPadding: 2 },
                        columnStyles: {
                            0: { cellWidth: 15, fontSize: 8 },
                            1: { cellWidth: 80, overflow: 'linebreak', halign: 'left', fontSize: 8 },
                            2: { cellWidth: 15, fontSize: 8 },
                            3: { cellWidth: 25, fontSize: 8 },
                            4: { cellWidth: 15, fontSize: 8 },
                            5: { cellWidth: 20, fontSize: 8 },
                            6: { cellWidth: 20, fontSize: 8 }
                        },
                        didDrawPage: (hookData) => {
                            if (hookData.settings.pageCount > 1) {
                                this.addHeaderToPage(currentDoc, hookData.pageNumber, 0);
                                this.addWatermark(currentDoc);
                            }
                        }
                    });
                }

                // Update footer on all pages
                const totalPages = currentDoc.internal.getNumberOfPages();
                for (let i = 1; i <= totalPages; i++) {
                    currentDoc.setPage(i);
                    this.addFooterToPage(currentDoc, i, totalPages);
                }
            };

            // Iniciar la generación de tablas
            this.generateTables(doc, datos);

            doc.save('presupuestos.pdf');

        } catch (error) {
            console.error("Error generando PDF:", error);
            // Considerar mostrar un mensaje de error al usuario también
        }

    }
    descargarInsumosTipopdf({ datos }, logo1Data, logo2Data, fechaActual, suppliesText) {
        let _dibujaDetallesPresupuesto = true;
        let _dibujaTituloACU = true;

        try {
            // Resetear flags al inicio de cada generación de PDF
            _dibujaDetallesPresupuesto = true;
            _dibujaTituloACU = true;

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('portrait', 'mm', 'A4');

            const pageWidth = 210;
            const pageHeight = 297;
            const margin = 10;
            // const headerHeight = 35; // Calcularemos dinámicamente o usaremos el retorno de addHeaderToPage
            const footerHeight = 15;

            // ... (tu código para convertir logo1Data y logo2Data a base64) ...
            let logo1Base64 = null;
            let logo2Base64 = null;

            if (logo1Data) {
                const uint8Array = new Uint8Array(logo1Data.data);
                const binaryString = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
                logo1Base64 = 'data:image/' + logo1Data.extension + ';base64,' + btoa(binaryString);
            }

            if (logo2Data) {
                const uint8Array = new Uint8Array(logo2Data.data);
                const binaryString = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
                logo2Base64 = 'data:image/' + logo2Data.extension + ';base64,' + btoa(binaryString);
            }


            const nombreProyecto = "MEJORAMIENTO DE LOS SERVICIOS DE EDUCACION INICIAL DE LA IEI Nº 358 CIUDAD DE CONTAMANA DEL DISTRITO DE CONTAMANA - PROVINCIA DE UCAYALI - DEPARTAMENTO DE LORETO";
            const cui = "2484411";
            const codigoModular = "0651216";
            const codigoLocal = "390867";
            const infoIE = "I.E.I:358; UNIDAD EJECUTORA: MUNICIPALIDAD PROVINCIAL DE UCAYALI";

            const proyectoActual = {
                nombre: "MEJORAMIENTO DE LOS SERVICIOS DE EDUCACION INICIAL DE LA IEI Nº 358 CIUDAD DE CONTAMANA DEL DISTRITO DE CONTAMANA - PROVINCIA DE UCAYALI - DEPARTAMENTO DE LORETO",
                propietario: "MUNICIPALIDAD PROVINCIAL DE HUÁNUCO",
                ubicacion: "HUÁNUCO - HUÁNUCO - HUÁNUCO",
                fecha: fechaActual || "15 de mayo del 2025" // Fecha actual del sistema si no se provee
            };

            this.addHeaderToPage = (doc, pageNum, totalPages) => {
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                const leftLogoX = margin;
                const leftLogoY = margin;
                const leftLogoWidth = 25;
                const leftLogoHeight = 25;
                const rightLogoX = pageWidth - margin - 25;
                const rightLogoY = margin;
                const rightLogoWidth = 25;
                const rightLogoHeight = 25;

                if (logo1Base64) {
                    doc.addImage(logo1Base64, 'AUTO', leftLogoX, leftLogoY, leftLogoWidth, leftLogoHeight);
                }
                if (logo2Base64) {
                    doc.addImage(logo2Base64, 'AUTO', rightLogoX, rightLogoY, rightLogoWidth, rightLogoHeight);
                }

                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                const maxTextWidth = pageWidth - 2 * (margin + 30);
                const titleLines = doc.splitTextToSize(nombreProyecto, maxTextWidth);
                let titleY = margin + 5;
                titleLines.forEach(line => {
                    const titleWidth = doc.getTextWidth(line);
                    const titleX = (pageWidth - titleWidth) / 2;
                    doc.text(line, titleX, titleY);
                    titleY += 6;
                });

                doc.setFontSize(9);
                const infoY = titleY + 3;
                const infoText1 = `CUI: ${cui}; CÓDIGO MODULAR: ${codigoModular}; CÓDIGO LOCAL: ${codigoLocal}`;
                const infoWidth1 = doc.getTextWidth(infoText1);
                const infoX1 = (pageWidth - infoWidth1) / 2;
                doc.text(infoText1, infoX1, infoY);

                const infoText2 = infoIE;
                const infoWidth2 = doc.getTextWidth(infoText2);
                const infoX2 = (pageWidth - infoWidth2) / 2;
                doc.text(infoText2, infoX2, infoY + 5);

                doc.setLineWidth(0.5);
                doc.line(margin, infoY + 8, pageWidth - margin, infoY + 8);
                return infoY + 12; // Retorna la posición Y después del encabezado
            };

            this.addFooterToPage = (doc, pageNum, totalPages) => {
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.setLineWidth(0.3);
                doc.line(margin, pageHeight - footerHeight, pageWidth - margin, pageHeight - footerHeight);
                const pageText = `Página ${pageNum} de ${totalPages}`;
                doc.text(pageText, pageWidth - margin - doc.getTextWidth(pageText), pageHeight - 5);
                const fechaTexto = `HYPERIUMTECH ${fechaActual || new Date().toLocaleDateString()}`;
                doc.text(fechaTexto, margin, pageHeight - 5);
            };

            this.addWatermark = (doc) => {
                doc.setFontSize(60);
                doc.setTextColor(220, 220, 220);
                doc.setFont('helvetica', 'bold');
                const watermarkText = "HYPER";
                try {
                    if (typeof doc.setGState === 'function') {
                        doc.saveGraphicsState();
                        doc.setGState(new doc.GState({ opacity: 0.15 }));
                    }
                } catch (e) { console.warn("setGState no disponible:", e); }
                const textWidth = doc.getStringUnitWidth(watermarkText) * doc.getFontSize() / doc.internal.scaleFactor;
                const x = (pageWidth - textWidth) / 2;
                const y = pageHeight / 2;
                doc.text(watermarkText, x, y);
                try {
                    if (typeof doc.restoreGraphicsState === 'function') {
                        doc.restoreGraphicsState();
                    }
                } catch (e) { console.warn("restoreGraphicsState no disponible:", e); }
                doc.setTextColor(0, 0, 0);
            };

            this.addProyectoDetalles = (currentDoc, currentY, titulo) => {
                let yPos = currentY;
                const pageHeight = currentDoc.internal.pageSize.height;
                const margin = 10;
                const pageWidth = currentDoc.internal.pageSize.width;
                const maxTextWidth = pageWidth - 2 * margin - 40; // Width for text after label

                // Draw details only for insumos-related titles
                if ((titulo === "INSUMOS" || titulo === `INSUMOS ${suppliesText}`) && _dibujaTituloACU) {
                    // Check if there's enough space; if not, add a new page
                    if (yPos + 60 > pageHeight - 20) { // 60mm for content, 20mm for footer
                        currentDoc.addPage();
                        yPos = this.addHeaderToPage(currentDoc, currentDoc.internal.getNumberOfPages(), 0) + 5;
                        this.addWatermark(currentDoc);
                    }

                    // Title
                    currentDoc.setFontSize(14);
                    currentDoc.setFont('helvetica', 'bold');
                    const titleWidth = currentDoc.getTextWidth(titulo);
                    currentDoc.text(titulo, (pageWidth - titleWidth) / 2, yPos);
                    yPos += 10;

                    // Project details with fallback for undefined values
                    currentDoc.setFontSize(10);
                    const fields = [
                        { label: "PROYECTO:", value: proyectoActual?.nombre || "N/A" },
                        { label: "PROPIETARIO:", value: proyectoActual?.propietario || "N/A" },
                        { label: "UBICACIÓN:", value: proyectoActual?.ubicacion || "N/A" },
                        { label: "FECHA:", value: proyectoActual?.fecha || "N/A" }
                    ];

                    fields.forEach(({ label, value }) => {
                        currentDoc.setFont('helvetica', 'bold');
                        currentDoc.text(label, margin, yPos);
                        currentDoc.setFont('helvetica', 'normal');
                        const splitText = currentDoc.splitTextToSize(value, maxTextWidth);
                        currentDoc.text(splitText, margin + 40, yPos);
                        yPos += 7 * splitText.length; // Adjust yPos based on number of lines
                    });

                    yPos += 3; // Space before line
                    currentDoc.setLineWidth(0.3);
                    currentDoc.line(margin, yPos, pageWidth - margin, yPos);
                    yPos += 7; // Space after line
                }
                return yPos;
            };

            this.generateTables = (currentDoc, tableData) => {
                const detallesRows = [];
                const margin = 10;
                const footerHeight = 10;

                // Group data by tipoinsumo
                const groupedData = tableData.reduce((acc, item) => {
                    const type = item.tipoinsumo?.toLowerCase() || 'otros'; // Fallback for undefined tipoinsumo
                    if (!acc[type]) acc[type] = [];
                    acc[type].push({
                        ind: item.indice || '',
                        descripcion: item.descripcion || '',
                        und: item.unidad || '',
                        recursos: item.recursos || '',
                        cantidad: item.cantidad || '',
                        precio: item.precio || '',
                        parcial: item.total || ''
                    });
                    return acc;
                }, {});

                // Define sections with proper titles
                const sections = [
                    { title: 'MANO DE OBRA', data: groupedData.manoobra || [] },
                    { title: 'MATERIALES', data: groupedData.materiales || [] },
                    { title: 'EQUIPO', data: groupedData.equipos || [] }
                ];

                // Add partida header
                detallesRows.push([
                    { content: 'Partida: Insumos', colSpan: 7, styles: { halign: 'left', fontStyle: 'bold', fontSize: 8 } }
                ]);

                // Add table headers
                detallesRows.push(
                    ['Ind.', 'Descripción', 'Unid.', 'Recursos', 'Cant.', 'Precio', 'Parcial'].map(header => ({
                        content: header, styles: { fillColor: [0, 102, 204], textColor: 255, fontSize: 8, fontStyle: 'bold', halign: 'center' }
                    }))
                );

                // Process each section
                sections.forEach(section => {
                    if (section.data && section.data.length > 0) {
                        const sectionTotal = section.data.reduce((sum, d) => sum + (parseFloat(d.parcial) || 0), 0).toFixed(2);
                        detallesRows.push([
                            { content: section.title, colSpan: 6, styles: { halign: 'left', fontStyle: 'bold', fontSize: 8 } },
                            { content: sectionTotal, styles: { halign: 'right', fontStyle: 'bold', fontSize: 8 } }
                        ]);
                        section.data.forEach(detail => {
                            detallesRows.push([
                                detail.ind || '',
                                { content: detail.descripcion || '', styles: { fontSize: 8, halign: 'left' } },
                                detail.und || '',
                                detail.recursos || '',
                                detail.cantidad || '',
                                detail.precio || '',
                                detail.parcial || ''
                            ]);
                        });
                    }
                });

                // Add separator line
                if (detallesRows.length > 2) {
                    detallesRows.push([{ content: '', colSpan: 7, styles: { lineWidth: { bottom: 0.5 } } }]);
                }

                // Calculate header height for margin
                const tempDoc = new jsPDF('portrait', 'mm', 'A4');
                const headerEndYValue = this.addHeaderToPage(tempDoc, 1, 1);
                const autoTableTopMarginValue = headerEndYValue + 5;

                // --- Tabla de Detalles (Insumos) ---
                if (detallesRows.length > 0) {
                    const acusPageNum = currentDoc.internal.getNumberOfPages();
                    let startYAcusTable = this.addHeaderToPage(currentDoc, acusPageNum, 0) + 5;
                    this.addWatermark(currentDoc);

                    // Draw project details before the table
                    startYAcusTable = this.addProyectoDetalles(currentDoc, startYAcusTable, `INSUMOS ${suppliesText}`);

                    currentDoc.autoTable({
                        startY: startYAcusTable,
                        body: detallesRows,
                        theme: 'plain',
                        margin: { top: autoTableTopMarginValue, left: margin, right: margin, bottom: footerHeight + margin },
                        styles: { fontSize: 8, cellPadding: 2 },
                        columnStyles: {
                            0: { cellWidth: 20, fontSize: 8 },
                            1: { cellWidth: 70, overflow: 'linebreak', halign: 'left', fontSize: 8 },
                            2: { cellWidth: 15, fontSize: 8 },
                            3: { cellWidth: 25, fontSize: 8 },
                            4: { cellWidth: 15, fontSize: 8 },
                            5: { cellWidth: 20, fontSize: 8 },
                            6: { cellWidth: 20, fontSize: 8 }
                        },
                        didDrawPage: (hookData) => {
                            if (hookData.settings.pageCount > 1) {
                                this.addHeaderToPage(currentDoc, hookData.pageNumber, 0);
                                this.addWatermark(currentDoc);
                            }
                        }
                    });
                }

                // Update footer on all pages
                const totalPages = currentDoc.internal.getNumberOfPages();
                for (let i = 1; i <= totalPages; i++) {
                    currentDoc.setPage(i);
                    this.addFooterToPage(currentDoc, i, totalPages);
                }
            };

            // Iniciar la generación de tablas
            this.generateTables(doc, datos);

            doc.save(`INSUMOS ${suppliesText}.pdf`);

        } catch (error) {
            console.error("Error generando PDF:", error);
            // Considerar mostrar un mensaje de error al usuario también
        }
    }

    //*************************GASTOS GENERALES **************** */
    async exportarGastosGenerales(
        consolidado, control_concurrente, gastos_fijos, gastos_generales,
        remuneraciones, supervision, tiempoEjecucion, ggf, ggv,
        porcentaje_fianza_adelanto_efectivo, porcentaje_fianza_adelanto_materiales,
        porcentaje_fianza_buen_ejecucion, logo1Data, logo2Data, fechaActual
    ) {
        // Crear un nuevo libro de Excel
        const workbook = new ExcelJS.Workbook();
        console.log(supervision);
        console.log(remuneraciones);
        console.log(control_concurrente);
        // Crear todas las hojas necesarias
        const resumenSheet = workbook.addWorksheet('Resumen');
        const consolidadoSheet = workbook.addWorksheet('Consolidado');
        const gastosGeneralesSheet = workbook.addWorksheet('Gastos Generales');
        const gastosFijosSheet = workbook.addWorksheet('Gastos Fijos');
        const supervisionSheet = workbook.addWorksheet('Supervisión');
        const gastossupervisionSheet = workbook.addWorksheet('GG Supervision');
        const remuneracionesSheet = workbook.addWorksheet('Remuneraciones');
        const controlConcurrenteSheet = workbook.addWorksheet('Control Concurrente');
        // const fianzasSheet = workbook.addWorksheet('Fianzas');
        let costoDirectoValue = 0;
        // Inicializamos costoDirecto en 0 por si no se encuentra el item o el valor.
        let costoDirecto = 0;
        let gastosGeneralesMonto = 0; // Initialize gastosGenerales

        // Verificamos que 'consolidado' y 'consolidado.descripcionCosto' existan y que 'descripcionCosto' sea un array.
        if (consolidado && consolidado.descripcionCosto && Array.isArray(consolidado.descripcionCosto)) {
            // Usamos el método find() para buscar el objeto específico.
            const itemCostoDirecto = consolidado.descripcionCosto.find(
                item => item && typeof item.descripcion === 'string' && item.descripcion === "* COSTO DIRECTO"
            );

            const itemGastosGenerales = consolidado.descripcionCosto.find(
                item => item && typeof item.descripcion === 'string' && item.descripcion === "* Gastos Generales"
            );

            // Si encontramos el itemCostoDirecto y tiene una propiedad 'valor'.
            if (itemCostoDirecto && typeof itemCostoDirecto.valor !== 'undefined') {
                costoDirecto = parseFloat(itemCostoDirecto.valor) || 0; // Convertimos a float, o 0 si la conversión falla.
            } else {
                console.warn("Advertencia: No se encontró el item '* COSTO DIRECTO' con un valor válido en consolidado.descripcionCosto.");
            }

            // Si encontramos el itemGastosGenerales y tiene una propiedad 'valor'.
            if (itemGastosGenerales && typeof itemGastosGenerales.valor !== 'undefined') {
                gastosGeneralesMonto = parseFloat(itemGastosGenerales.valor) || 0; // Convertimos a float, o 0 si la conversión falla.
            } else {
                console.warn("Advertencia: No se encontró el item '* Gastos Generales' con un valor válido en consolidado.descripcionCosto.");
            }

        } else {
            console.error("Error: La estructura de 'consolidado.descripcionCosto' no es la esperada o no existe.");
        }

        // Definir estilos comunes para todas las hojas
        const styles = {
            title: {
                font: { bold: true, size: 14 },
                alignment: { horizontal: 'center', vertical: 'middle' },
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
                alignment: { horizontal: 'right', vertical: 'middle' },
                border: {
                    top: { style: 'thin' }, left: { style: 'thin' },
                    bottom: { style: 'thin' }, right: { style: 'thin' }
                },
                numFmt: '#,##0.00'
            },
            percentage: {
                alignment: { horizontal: 'right', vertical: 'middle' },
                border: {
                    top: { style: 'thin' }, left: { style: 'thin' },
                    bottom: { style: 'thin' }, right: { style: 'thin' }
                },
                numFmt: '0.00%'
            },
            subtotal: {
                font: { bold: true },
                alignment: { horizontal: 'right', vertical: 'middle' },
                border: {
                    top: { style: 'thin' }, left: { style: 'thin' },
                    bottom: { style: 'thin' }, right: { style: 'thin' }
                },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' } },
                numFmt: '#,##0.00'
            },
            datatable: {
                alignment: { vertical: 'middle' },
                border: {
                    top: { style: 'thin' }, left: { style: 'thin' },
                    bottom: { style: 'thin' }, right: { style: 'thin' }
                }
            },
            sectionHeader: {
                font: { bold: true, size: 11 },
                alignment: { vertical: 'middle', horizontal: 'left' },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF00' } },
                border: {
                    top: { style: 'thin' }, left: { style: 'thin' },
                    bottom: { style: 'thin' }, right: { style: 'thin' }
                }
            },
            totalHeader: {
                font: { bold: true, size: 11 },
                alignment: { vertical: 'middle', horizontal: 'right' },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF00' } },
                border: {
                    top: { style: 'thin' }, left: { style: 'thin' },
                    bottom: { style: 'thin' }, right: { style: 'thin' }
                }
            }
        };

        // Configurar anchos de columna para todas las hojas
        const setupColumns = (sheet) => {
            sheet.columns = [
                { width: 4 },   // A
                { width: 10 },  // B - Item
                { width: 50 },  // C - Descripción
                { width: 15 },  // D - Unidad
                { width: 15 },  // E - Cantidad
                { width: 15 },  // F - Precio
                { width: 15 },  // G - Parcial
                { width: 15 },  // H - Subtotal
            ];
        };

        // Configurar todas las hojas
        [resumenSheet, consolidadoSheet, remuneracionesSheet, gastosGeneralesSheet,
            gastosFijosSheet, supervisionSheet, gastossupervisionSheet, controlConcurrenteSheet].forEach(setupColumns);

        // Función para escribir el encabezado común en todas las hojas
        /*const escribirEncabezado = (sheet, titulo, logo1Data, logo2Data) => {
            // Agregar las imágenes al workbook
            const imageId1 = workbook.addImage({
                buffer: logo1Data.data,
                extension: logo1Data.extension,
            });

            const imageId2 = workbook.addImage({
                buffer: logo2Data.data,
                extension: logo2Data.extension,
            });

            // Ajustar la altura de las 3 primeras filas (en puntos)
            sheet.getRow(1).height = 130;
            sheet.getRow(2).height = 20;
            sheet.getRow(3).height = 20;

            // Insertar el Logo 1 (izquierda)
            sheet.addImage(imageId1, {
                tl: { col: 0, row: 0 }, // A1
                ext: { width: 150, height: 150 }
            });

            // Insertar el Logo 2 (derecha)
            sheet.addImage(imageId2, {
                tl: { col: 7, row: 0 }, // I1
                ext: { width: 150, height: 150 }
            });

            // Combinar de C1 hasta G3 (una gran celda para todo el texto centrado)
            sheet.mergeCells('C1:H3');

            // Texto con formato enriquecido (rich text)
            sheet.getCell('C1').value = {
                richText: [
                    {
                        text: '“MEJORAMIENTO DE LOS SERVICIOS DE EDUCACION INICIAL DE LA IEI Nº 358 CIUDAD DE CONTAMANA\n',
                        font: { bold: true, size: 11 }
                    },
                    {
                        text: 'DEL DISTRITO DE CONTAMANA - PROVINCIA DE UCAYALI - DEPARTAMENTO DE LORETO”\n',
                        font: { bold: true, size: 11 }
                    },
                    {
                        text: 'CUI: 2484411; CÓDIGO MODULAR: 0651216; CÓDIGO LOCAL: 390867\n',
                        font: { size: 11 }
                    },
                    {
                        text: 'I.E.I:358; UNIDAD EJECUTORA: MUNICIPALIDAD PROVINCIAL DE UCAYALI',
                        font: { size: 11 }
                    }
                ]
            };

            // Estilo de alineación y ajuste de texto
            sheet.getCell('C1').alignment = {
                vertical: 'middle',
                horizontal: 'center',
                wrapText: true
            };

            // Altura ajustada (basta con aumentar solo la fila 1, ya que C1 abarca hasta G3)
            sheet.getRow(1).height = 75;

            try {
                // Título
                sheet.mergeCells('B4:H4');
                sheet.getCell('B4').value = titulo;
                sheet.getCell('B4').style = styles.title;

                // Información del proyecto
                sheet.getCell('B5').value = 'PROYECTO:';
                sheet.mergeCells('C5:H5');
                sheet.getCell('C5').value = '"REPARACIÓN DE COBERTURA: EN EL(LA) LOCAL INSTITUCIONAL..."';

                sheet.getCell('B6').value = 'PROPIETARIO:';
                sheet.mergeCells('C6:H6');
                sheet.getCell('C6').value = 'MUNICIPALIDAD PROVINCIAL DE HUÁNUCO';

                sheet.getCell('B7').value = 'UBICACIÓN:';
                sheet.mergeCells('C7:H7');
                sheet.getCell('C7').value = 'HUÁNUCO - HUÁNUCO - HUÁNUCO';

                sheet.getCell('B8').value = 'FECHA:';
                sheet.mergeCells('C8:H8');
                sheet.getCell('C8').value = fechaActual;
            } catch (error) {
                console.error('Error al mergear celdas:', error);
                throw error;
            }

            return 9; // Siguiente fila disponible
        };*/
        function getExcelColumnLetter(colNumber) {
            let letter = '';
            while (colNumber > 0) {
                let mod = (colNumber - 1) % 26;
                letter = String.fromCharCode(65 + mod) + letter;
                colNumber = Math.floor((colNumber - mod) / 26);
            }
            return letter;
        }

        const escribirEncabezado = (sheet, titulo, logo1Data, logo2Data, colStart = 2, colEnd = 8, anchosColumnas = []) => {
            const Excel = ExcelJS; // Solo para claridad

            // Insertar logos
            const imageId1 = sheet.workbook.addImage({
                buffer: logo1Data.data,
                extension: logo1Data.extension,
            });
            const imageId2 = sheet.workbook.addImage({
                buffer: logo2Data.data,
                extension: logo2Data.extension,
            });

            sheet.addImage(imageId1, {
                tl: { col: 0, row: 0 },
                ext: { width: 150, height: 150 }
            });
            sheet.addImage(imageId2, {
                tl: { col: colEnd, row: 0 },
                ext: { width: 150, height: 150 }
            });

            // Ajustar alturas
            sheet.getRow(1).height = 75;
            const colStartLetter = getExcelColumnLetter(colStart);
            const colEndLetter = getExcelColumnLetter(colEnd);

            // Calcular letras de columna dinámicamente (B = 2, H = 8)
            // const colStartLetter = Excel.utils.columnLetters[colStart - 1];
            // const colEndLetter = Excel.utils.columnLetters[colEnd - 1];

            // Merge del bloque principal del encabezado
            const mergedHeaderRange = `${colStartLetter}1:${colEndLetter}3`;
            sheet.mergeCells(mergedHeaderRange);

            sheet.getCell(`${colStartLetter}1`).value = {
                richText: [
                    { text: '“MEJORAMIENTO DE LOS SERVICIOS DE EDUCACION INICIAL DE LA IEI Nº 358 CIUDAD DE CONTAMANA\n', font: { bold: true, size: 11 } },
                    { text: 'DEL DISTRITO DE CONTAMANA - PROVINCIA DE UCAYALI - DEPARTAMENTO DE LORETO”\n', font: { bold: true, size: 11 } },
                    { text: 'CUI: 2484411; CÓDIGO MODULAR: 0651216; CÓDIGO LOCAL: 390867\n', font: { size: 11 } },
                    { text: 'I.E.I:358; UNIDAD EJECUTORA: MUNICIPALIDAD PROVINCIAL DE UCAYALI', font: { size: 11 } },
                ]
            };

            sheet.getCell(`${colStartLetter}1`).alignment = {
                vertical: 'middle',
                horizontal: 'center',
                wrapText: true
            };

            // Título centrado dinámicamente
            sheet.mergeCells(`${colStartLetter}4:${colEndLetter}4`);
            sheet.getCell(`${colStartLetter}4`).value = titulo;
            sheet.getCell(`${colStartLetter}4`).style = styles.title;

            // Información del proyecto
            sheet.getCell('B5').value = 'PROYECTO:';
            sheet.mergeCells(`C5:${colEndLetter}5`);
            sheet.getCell('C5').value = '"REPARACIÓN DE COBERTURA: EN EL(LA) LOCAL INSTITUCIONAL..."';

            sheet.getCell('B6').value = 'PROPIETARIO:';
            sheet.mergeCells(`C6:${colEndLetter}6`);
            sheet.getCell('C6').value = 'MUNICIPALIDAD PROVINCIAL DE HUÁNUCO';

            sheet.getCell('B7').value = 'UBICACIÓN:';
            sheet.mergeCells(`C7:${colEndLetter}7`);
            sheet.getCell('C7').value = 'HUÁNUCO - HUÁNUCO - HUÁNUCO';

            sheet.getCell('B8').value = 'FECHA:';
            sheet.mergeCells(`C8:${colEndLetter}8`);
            sheet.getCell('C8').value = fechaActual;

            // Anchos de columna específicos para la hoja
            if (anchosColumnas.length > 0) {
                sheet.columns = anchosColumnas.map(width => ({ width }));
            }

            return 9;
        };

        // Función para escribir consolidado de gastos generales
        const hojasconsolidado = async () => {
            try {
                // Definir anchos específicos para esta hoja
                const columnaConsolidado = [
                    4,   // A 
                    40,  // B - 
                    10,  // C - .
                    10,  // D - 
                    15,  // E - 
                    15,  // F - 
                    15,  // G -
                    15,  // H - 
                ];

                let currentRow = escribirEncabezado(
                    consolidadoSheet,
                    'CONSOLIDADO DE GASTOS GENERALES',
                    logo1Data,
                    logo2Data,
                    2, // colStart = B
                    8, // colEnd = I
                    columnaConsolidado
                );

                // const currentRow = escribirEncabezado(consolidadoSheet, 'CONSOLIDADO DE GASTOS GENERALES', logo1Data, logo2Data);
                // const currentRow = escribirEncabezado(consolidadoSheet, 'CONSOLIDADO DE GASTOS GENERALES');
                let row = currentRow + 1;

                // Define common styles
                const headerStyle = {
                    font: { bold: true, size: 10, color: { argb: '000000' } },
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D3D3D3' } },
                    alignment: { horizontal: 'center', vertical: 'middle' },
                    border: {
                        top: { style: 'thin' }, left: { style: 'thin' },
                        bottom: { style: 'thin' }, right: { style: 'thin' }
                    }
                };

                const cellStyle = {
                    border: {
                        top: { style: 'thin' }, left: { style: 'thin' },
                        bottom: { style: 'thin' }, right: { style: 'thin' }
                    },
                    font: { size: 10 }
                };

                const numberStyle = {
                    ...cellStyle,
                    alignment: { horizontal: 'right', vertical: 'middle' },
                    numFmt: '#,##0.00'
                };

                const percentStyle = {
                    ...cellStyle,
                    alignment: { horizontal: 'right', vertical: 'middle' },
                    numFmt: '0.00%'
                };

                const totalStyle = {
                    ...numberStyle,
                    font: { bold: true, size: 10 },
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF00' } }
                };

                const titleStyle = {
                    font: { bold: true, size: 12, color: { argb: '000000' } },
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D3D3D3' } },
                    alignment: { horizontal: 'center', vertical: 'middle' },
                    border: cellStyle.border
                };

                // Headers for regular tables (6 columns)
                const regularHeaders = ['Item', 'Descripción', 'Und.', 'Cantidad', 'Precio Unitario S/.', 'Valor Total S/.'];

                // Headers for description table (5 columns)
                const descriptionHeaders = ['', 'DESCRIPCIÓN', 'UND.', 'METRADO', '%'];

                // Find COSTO DIRECTO value from descripcionCosto
                if (consolidado.descripcionCosto && consolidado.descripcionCosto.length > 0) {
                    const costoDirectoItem = consolidado.descripcionCosto.find(item =>
                        item.descripcion && item.descripcion.includes('COSTO DIRECTO')
                    );
                    if (costoDirectoItem && costoDirectoItem.valor) {
                        costoDirectoValue = parseFloat(costoDirectoItem.valor);
                    }
                }

                // Write PORCENTAJE CD header
                if (costoDirectoValue > 0) {
                    //consolidadoSheet.mergeCells(`B${row}:E${row}`);
                    consolidadoSheet.mergeCells(`E${row}`);
                    const headerCell = consolidadoSheet.getCell(`B${row}`);
                    headerCell.value = 'PORCENTAJE CD';
                    headerCell.style = {
                        font: { bold: true, size: 10 },
                        alignment: { horizontal: 'left', vertical: 'middle' }
                    };

                    consolidadoSheet.mergeCells(`B${row + 1}:D${row + 1}`);
                    const subHeaderCell = consolidadoSheet.getCell(`B${row + 1}`);
                    subHeaderCell.value = 'MONTO DEL COSTO DIRECTO DEL PRESUPUESTO BASE:';
                    subHeaderCell.style = {
                        font: { bold: true, size: 10 },
                        alignment: { horizontal: 'left', vertical: 'middle' }
                    };

                    const montoCell1 = consolidadoSheet.getCell(`F${row + 1}`);
                    montoCell1.value = 'S/.';
                    montoCell1.style = {
                        font: { bold: true, size: 10 },
                        alignment: { horizontal: 'right', vertical: 'middle' }
                    };

                    const montoCell2 = consolidadoSheet.getCell(`G${row + 1}`);
                    montoCell2.value = costoDirectoValue;
                    montoCell2.style = {
                        font: { bold: true, size: 10 },
                        alignment: { horizontal: 'right', vertical: 'middle' },
                        numFmt: '#,##0.00'
                    };

                    const percentCell = consolidadoSheet.getCell(`G${row}`);
                    percentCell.value = 1; // 100%
                    percentCell.style = {
                        font: { bold: true, size: 10 },
                        alignment: { horizontal: 'right', vertical: 'middle' },
                        numFmt: '0%'
                    };

                    row += 3; // Add spacing
                }

                // Function to write section header (6 columns)
                const writeSectionHeader = (title, startRow, columns = 6) => {
                    const endCol = columns === 6 ? 'G' : 'F';
                    consolidadoSheet.mergeCells(`B${startRow}:${endCol}${startRow}`);
                    const titleCell = consolidadoSheet.getCell(`B${startRow}`);
                    titleCell.value = title;
                    titleCell.style = titleStyle;
                    return startRow + 1;
                };

                // Function to write regular table headers (6 columns)
                const writeRegularHeaders = (startRow) => {
                    const headerRow = consolidadoSheet.getRow(startRow);
                    regularHeaders.forEach((header, index) => {
                        const cell = headerRow.getCell(index + 2);
                        cell.value = header;
                        cell.style = headerStyle;
                    });
                    return startRow + 1;
                };

                // Function to write description table headers (5 columns)
                const writeDescriptionHeaders = (startRow) => {
                    const headerRow = consolidadoSheet.getRow(startRow);
                    descriptionHeaders.forEach((header, index) => {
                        const cell = headerRow.getCell(index + 2);
                        cell.value = header;
                        cell.style = headerStyle;
                    });
                    return startRow + 1;
                };

                // Function to write regular data row (6 columns)
                const writeRegularDataRow = (rowData, rowIndex) => {
                    const currentRowObj = consolidadoSheet.getRow(rowIndex);

                    currentRowObj.getCell(2).value = rowData.item || '';
                    currentRowObj.getCell(2).style = cellStyle;

                    currentRowObj.getCell(3).value = rowData.descripcion || '';
                    currentRowObj.getCell(3).style = cellStyle;

                    currentRowObj.getCell(4).value = rowData.und || '';
                    currentRowObj.getCell(4).style = cellStyle;

                    const cantidad = rowData.cantidad ? parseFloat(rowData.cantidad) : '';
                    currentRowObj.getCell(5).value = cantidad;
                    currentRowObj.getCell(5).style = cantidad ? numberStyle : cellStyle;

                    const precioUnitario = rowData.precioUnitario ? parseFloat(rowData.precioUnitario) : '';
                    currentRowObj.getCell(6).value = precioUnitario;
                    currentRowObj.getCell(6).style = precioUnitario ? numberStyle : cellStyle;

                    let valorTotal = 0;
                    if (rowData.valor) {
                        valorTotal = parseFloat(rowData.valor);
                    } else if (rowData.cantidad && rowData.precioUnitario) {
                        valorTotal = parseFloat(rowData.cantidad) * parseFloat(rowData.precioUnitario);
                    }

                    currentRowObj.getCell(7).value = valorTotal > 0 ? valorTotal : '';
                    currentRowObj.getCell(7).style = valorTotal > 0 ? numberStyle : cellStyle;

                    return valorTotal;
                };

                // Function to write total row (6 columns)
                const writeTotalRow = (title, total, rowIndex) => {
                    const totalRow = consolidadoSheet.getRow(rowIndex);

                    consolidadoSheet.mergeCells(`C${rowIndex}:F${rowIndex}`);
                    totalRow.getCell(3).value = title;
                    totalRow.getCell(3).style = {
                        ...cellStyle,
                        font: { bold: true, size: 10 },
                        alignment: { horizontal: 'right', vertical: 'middle' }
                    };

                    totalRow.getCell(7).value = total;
                    totalRow.getCell(7).style = totalStyle;

                    return rowIndex + 1;
                };

                // 1. Write "Resumen de Análisis de Gastos Generales"
                if (consolidado.resumenAgg && consolidado.resumenAgg.length > 0) {
                    row = writeSectionHeader('Resumen de Análisis de Gastos Generales', row);
                    row = writeRegularHeaders(row);

                    let totalGastosGenerales = 0;
                    consolidado.resumenAgg.forEach((rowData) => {
                        const valorTotal = writeRegularDataRow(rowData, row);
                        totalGastosGenerales += valorTotal || 0;
                        row++;
                    });

                    row = writeTotalRow('Total de Gastos Generales S/.', totalGastosGenerales, row);
                    row++; // Add spacing
                }

                // 2. Write "Resumen de Análisis de Gastos de Supervisión"
                if (consolidado.resumenAgs && consolidado.resumenAgs.length > 0) {
                    row = writeSectionHeader('Resumen de Análisis de Gastos De Supervisión', row);
                    row = writeRegularHeaders(row);

                    let totalGastosSupervision = 0;
                    consolidado.resumenAgs.forEach((rowData) => {
                        const valorTotal = writeRegularDataRow(rowData, row);
                        totalGastosSupervision += valorTotal || 0;
                        row++;
                    });

                    row = writeTotalRow('Total de Gastos De Supervisión S/.', totalGastosSupervision, row);
                    row++; // Add spacing
                }

                // 3. Write "DESCRIPCIÓN DEL COSTO" (5 columns format)
                // Write "DESCRIPCIÓN DEL COSTO" (5 columns format)
                if (consolidado.descripcionCosto && consolidado.descripcionCosto.length > 0) {
                    row = writeSectionHeader('DESCRIPCIÓN DEL COSTO', row, 5);
                    row = writeDescriptionHeaders(row);

                    consolidado.descripcionCosto.forEach((rowData) => {
                        const currentRowObj = consolidadoSheet.getRow(row);

                        const isSubTotal = rowData.descripcion && (
                            rowData.descripcion.includes('SUB TOTAL') ||
                            rowData.descripcion.includes('TOTAL')
                        );
                        const isComponent = rowData.descripcion && rowData.descripcion.startsWith('*');
                        const isSonText = rowData.descripcion && rowData.descripcion.startsWith('SON:');

                        if (isSonText) {
                            // Write SON: text as a merged cell with styling
                            consolidadoSheet.mergeCells(`B${row}:F${row + 1}`);
                            const sonCell = consolidadoSheet.getCell(`B${row}`);
                            sonCell.value = rowData.valor; // e.g., "NOVECIENTOS CINCUENTA Y TRES MIL..."
                            sonCell.style = {
                                font: { italic: true, size: 10, color: { argb: '000000' } },
                                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF00' } },
                                alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
                                border: cellStyle.border
                            };
                            row += 2; // Move row pointer after writing SON: text
                            return;
                        }

                        // Column 1: Item
                        currentRowObj.getCell(2).value = rowData.item || '';
                        currentRowObj.getCell(2).style = cellStyle;

                        // Column 2: DESCRIPCIÓN
                        let descripcionStyle = {
                            ...cellStyle,
                            alignment: { horizontal: isSubTotal || isComponent ? 'right' : 'left', vertical: 'middle' },
                            font: { size: 10, bold: isSubTotal || isComponent }
                        };
                        currentRowObj.getCell(3).value = rowData.descripcion || '';
                        currentRowObj.getCell(3).style = descripcionStyle;

                        // Column 3: UND.
                        currentRowObj.getCell(4).value = rowData.und || 'S/.';
                        currentRowObj.getCell(4).style = {
                            ...cellStyle,
                            alignment: { horizontal: 'center', vertical: 'middle' }
                        };

                        // Column 4: METRADO
                        let metradoValue = '';
                        let metradoStyle = {
                            ...cellStyle,
                            alignment: { horizontal: 'right', vertical: 'middle' }
                        };
                        if (rowData.valor) {
                            metradoValue = parseFloat(rowData.valor);
                            metradoStyle.numFmt = '#,##0.00';
                            if (isSubTotal) {
                                metradoStyle = { ...totalStyle };
                            }
                        }
                        currentRowObj.getCell(5).value = metradoValue;
                        currentRowObj.getCell(5).style = metradoStyle;

                        // Column 5: %
                        let percentValue = '';
                        if (rowData.porcentajeValor !== null && rowData.porcentajeValor !== undefined) {
                            percentValue = parseFloat(rowData.porcentajeValor) / 100;
                        } else if (costoDirectoValue > 0 && metradoValue > 0 && !isComponent && !isSubTotal) {
                            percentValue = '';
                        }
                        currentRowObj.getCell(6).value = percentValue;
                        currentRowObj.getCell(6).style = percentValue ? percentStyle : cellStyle;

                        row++;
                    });
                }

                // Set column widths
                consolidadoSheet.getColumn(2).width = 8;  // vacio
                consolidadoSheet.getColumn(2).width = 8;  // Item
                consolidadoSheet.getColumn(3).width = 55; // Descripción
                consolidadoSheet.getColumn(4).width = 8;  // Und.
                consolidadoSheet.getColumn(5).width = 15; // Cantidad/Metrado
                consolidadoSheet.getColumn(6).width = 15; // Precio Unitario/%
                consolidadoSheet.getColumn(7).width = 15; // Valor Total
                consolidadoSheet.getColumn(8).width = 10; // % (for CD header)

                return row;
            } catch (error) {
                console.error('Error al escribir hoja consolidado:', error);
                throw error;
            }
        };

        // Función para escribir la tabla de gastos
        const hojasgastosgenerales = async () => {
            try {
                const columnasgastoGeneral = [
                    4,   // A - 
                    40,  // B - 
                    10,  // C - 
                    10,  // D - 
                    15,  // E - 
                    15,  // F - 
                    15,  // G -
                    15,  // H - 
                ];

                let currentRow = escribirEncabezado(
                    gastosGeneralesSheet,
                    'GASTOS GENERALES',
                    logo1Data,
                    logo2Data,
                    2, // colStart = B
                    8, // colEnd = I
                    columnasgastoGeneral
                );
                // let currentRow = escribirEncabezado(gastosGeneralesSheet, 'GASTOS GENERALES', logo1Data, logo2Data);

                // Validate costoDirecto - cambiar const por let
                let validCostoDirecto = costoDirecto;
                if (validCostoDirecto === undefined || validCostoDirecto === null) {
                    console.warn(`Warning: costoDirecto is undefined for sheet. Using 0 as default.`);
                    validCostoDirecto = 0;
                }

                // Function to convert numbers to Spanish words (simplified for this example)
                function numberToSpanishWords(n) {
                    const units = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
                    const teens = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
                    const tens = ['', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
                    const hundreds = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

                    function convertGroup(num) {
                        let text = '';
                        if (num >= 100) {
                            text += hundreds[Math.floor(num / 100)] + ' ';
                            num %= 100;
                        }
                        if (num >= 20) {
                            text += tens[Math.floor(num / 10)] + ' ';
                            num %= 10;
                        }
                        if (num >= 10) {
                            text += teens[num - 10] + ' ';
                            num = 0;
                        }
                        if (num > 0) {
                            text += units[num] + ' ';
                        }
                        return text;
                    }

                    if (n === 0) return 'CERO';

                    let integerPart = Math.floor(n);
                    let decimalPart = Math.round((n - integerPart) * 100);

                    let words = '';

                    if (integerPart >= 1000000) {
                        words += convertGroup(Math.floor(integerPart / 1000000)) + 'MILLONES ';
                        integerPart %= 1000000;
                    }
                    if (integerPart >= 1000) {
                        words += convertGroup(Math.floor(integerPart / 1000)) + 'MIL ';
                        integerPart %= 1000;
                    }
                    words += convertGroup(integerPart);

                    let finalWords = words.trim();

                    if (decimalPart > 0) {
                        finalWords += ` Y ${decimalPart}/100 NUEVOS SOLES`;
                    } else {
                        finalWords += ` Y 00/100 NUEVOS SOLES`;
                    }

                    return finalWords.trim().toUpperCase();
                }

                // Definir estilos personalizados mejorados
                const customStyles = {
                    // Fondo blanco para toda la hoja
                    whiteBackground: {
                        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
                        font: { color: { argb: 'FF000000' } }
                    },
                    mainTitle: {
                        font: { bold: true, size: 12, color: { argb: 'FF0000FF' } },
                        alignment: { horizontal: 'left', vertical: 'middle', wrapText: true },
                        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }
                    },
                    mainTitleCentered: {
                        font: { bold: true, size: 12, color: { argb: 'FF0000FF' } },
                        alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
                        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }
                    },
                    redTitle: {
                        font: { bold: true, size: 12, color: { argb: 'FFFF0000' } },
                        alignment: { horizontal: 'left', vertical: 'middle', wrapText: true },
                        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }
                    },
                    subTitle: {
                        font: { bold: true, size: 11, color: { argb: 'FF000000' } },
                        alignment: { horizontal: 'left', vertical: 'middle', wrapText: true },
                        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }
                    },
                    // Encabezados de tabla con bordes completos
                    headerTableWithBorder: {
                        font: { bold: true, size: 10, color: { argb: 'FF000000' } },
                        alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
                        border: {
                            top: { style: 'thin', color: { argb: 'FF000000' } },
                            left: { style: 'thin', color: { argb: 'FF000000' } },
                            bottom: { style: 'thin', color: { argb: 'FF000000' } },
                            right: { style: 'thin', color: { argb: 'FF000000' } }
                        },
                        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6FA' } }
                    },
                    // Datos de tabla con bordes completos
                    dataTableWithBorder: {
                        font: { size: 9, color: { argb: 'FF000000' } },
                        alignment: { horizontal: 'left', vertical: 'middle', wrapText: true },
                        border: {
                            top: { style: 'thin', color: { argb: 'FF000000' } },
                            left: { style: 'thin', color: { argb: 'FF000000' } },
                            bottom: { style: 'thin', color: { argb: 'FF000000' } },
                            right: { style: 'thin', color: { argb: 'FF000000' } }
                        },
                        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }
                    },
                    // Números con bordes
                    numberWithBorder: {
                        font: { size: 9, color: { argb: 'FF000000' } },
                        alignment: { horizontal: 'right', vertical: 'middle', wrapText: true },
                        numFmt: '#,##0.00',
                        border: {
                            top: { style: 'thin', color: { argb: 'FF000000' } },
                            left: { style: 'thin', color: { argb: 'FF000000' } },
                            bottom: { style: 'thin', color: { argb: 'FF000000' } },
                            right: { style: 'thin', color: { argb: 'FF000000' } }
                        },
                        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }
                    },
                    // Estilo para información de resumen (sin bordes)
                    summaryInfo: {
                        font: { bold: true, size: 11, color: { argb: 'FF000000' } },
                        alignment: { horizontal: 'left', vertical: 'middle', wrapText: true },
                        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }
                    },
                    summaryAmount: {
                        font: { bold: true, size: 11, color: { argb: 'FF000000' } },
                        alignment: { horizontal: 'right', vertical: 'middle', wrapText: true },
                        numFmt: '#,##0.00',
                        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }
                    },
                    totalHeader: {
                        font: { bold: true, size: 10, color: { argb: 'FF000000' } },
                        alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
                        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCCCCC' } },
                        border: {
                            top: { style: 'thin', color: { argb: 'FF000000' } },
                            left: { style: 'thin', color: { argb: 'FF000000' } },
                            bottom: { style: 'thin', color: { argb: 'FF000000' } },
                            right: { style: 'thin', color: { argb: 'FF000000' } }
                        }
                    },
                    subtotal: {
                        font: { bold: true, size: 10, color: { argb: 'FF000000' } },
                        alignment: { horizontal: 'right', vertical: 'middle', wrapText: true },
                        numFmt: '#,##0.00',
                        border: {
                            top: { style: 'thin', color: { argb: 'FF000000' } },
                            left: { style: 'thin', color: { argb: 'FF000000' } },
                            bottom: { style: 'thin', color: { argb: 'FF000000' } },
                            right: { style: 'thin', color: { argb: 'FF000000' } }
                        },
                        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCCCCC' } }
                    },
                };

                // --- INFORMACIÓN DE RESUMEN INICIAL ---
                currentRow += 2;

                // Separar COSTO DIRECTO en label y monto
                gastosGeneralesSheet.mergeCells(`B${currentRow}:F${currentRow}`);
                gastosGeneralesSheet.getCell(`B${currentRow}`).value = 'COSTO DIRECTO:';
                gastosGeneralesSheet.getCell(`B${currentRow}`).style = customStyles.summaryInfo;

                gastosGeneralesSheet.mergeCells(`G${currentRow}:I${currentRow}`);
                gastosGeneralesSheet.getCell(`G${currentRow}`).value = `S/. ${validCostoDirecto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
                gastosGeneralesSheet.getCell(`G${currentRow}`).style = customStyles.summaryAmount;
                currentRow += 1;

                // Separar GASTOS GENERALES en label y monto
                gastosGeneralesSheet.mergeCells(`B${currentRow}:F${currentRow}`);
                gastosGeneralesSheet.getCell(`B${currentRow}`).value = 'GASTOS GENERALES:';
                gastosGeneralesSheet.getCell(`B${currentRow}`).style = customStyles.summaryInfo;

                gastosGeneralesSheet.mergeCells(`G${currentRow}:I${currentRow}`);
                gastosGeneralesSheet.getCell(`G${currentRow}`).value = `S/. ${gastosGeneralesMonto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
                gastosGeneralesSheet.getCell(`G${currentRow}`).style = customStyles.summaryAmount;
                currentRow += 2;

                // Texto en palabras del monto
                const totalGastosText = numberToSpanishWords(gastosGeneralesMonto);
                gastosGeneralesSheet.mergeCells(`B${currentRow}:I${currentRow}`);
                gastosGeneralesSheet.getCell(`B${currentRow}`).value = `SON: ${totalGastosText}`;
                gastosGeneralesSheet.getCell(`B${currentRow}`).style = customStyles.mainTitle;
                currentRow += 3;

                // --- TÍTULOS PRINCIPALES ---
                const titulogastosgenerales = "I.- CALCULO DE GASTOS GENERALES";
                gastosGeneralesSheet.mergeCells(`B${currentRow}:I${currentRow}`);
                gastosGeneralesSheet.getCell(`B${currentRow}`).value = titulogastosgenerales;
                gastosGeneralesSheet.getCell(`B${currentRow}`).style = customStyles.redTitle;
                currentRow += 1;

                // Fórmula de cálculo
                const totalgastogengastogenvar = "GASTOS GENERALES FIJOS + GASTOS GENERALES VARIABLES";
                gastosGeneralesSheet.mergeCells(`B${currentRow}:F${currentRow}`);
                gastosGeneralesSheet.getCell(`B${currentRow}`).value = totalgastogengastogenvar;
                gastosGeneralesSheet.getCell(`B${currentRow}`).style = customStyles.summaryInfo;

                gastosGeneralesSheet.mergeCells(`G${currentRow}:I${currentRow}`);
                gastosGeneralesSheet.getCell(`G${currentRow}`).value = `S/. ${gastosGeneralesMonto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
                gastosGeneralesSheet.getCell(`G${currentRow}`).style = customStyles.summaryAmount;
                currentRow += 3;

                // --- PRIMERA TABLA: Gastos Generales Fijos ---
                gastosGeneralesSheet.mergeCells(`B${currentRow}:I${currentRow}`);
                gastosGeneralesSheet.getCell(`B${currentRow}`).value = '01) GASTOS GENERALES FIJOS';
                gastosGeneralesSheet.getCell(`B${currentRow}`).style = customStyles.subTitle;
                currentRow++;

                // Headers para tabla fijos
                const headerRowFijos = gastosGeneralesSheet.getRow(currentRow);
                const startRowFijos = currentRow;

                // ITEM
                headerRowFijos.getCell(2).value = 'ITEM';
                headerRowFijos.getCell(2).style = customStyles.headerTableWithBorder;

                // DESCRIPCIÓN (colspan 3 columnas: C, D, E)
                gastosGeneralesSheet.mergeCells(`C${currentRow}:E${currentRow}`);
                headerRowFijos.getCell(3).value = 'DESCRIPCIÓN';
                headerRowFijos.getCell(3).style = customStyles.headerTableWithBorder;
                // Ensure all merged cells have borders
                for (let col = 3; col <= 5; col++) { // C to E (columns 3 to 5)
                    headerRowFijos.getCell(col).style = customStyles.headerTableWithBorder;
                }
                // UNIDAD
                headerRowFijos.getCell(6).value = 'UNIDAD';
                headerRowFijos.getCell(6).style = customStyles.headerTableWithBorder;

                // CANT.
                headerRowFijos.getCell(7).value = 'CANT.';
                headerRowFijos.getCell(7).style = customStyles.headerTableWithBorder;

                // COSTO UNITARIO  
                headerRowFijos.getCell(8).value = 'COSTO UNITARIO';
                headerRowFijos.getCell(8).style = customStyles.headerTableWithBorder;

                // PARCIAL
                headerRowFijos.getCell(9).value = 'PARCIAL';
                headerRowFijos.getCell(9).style = customStyles.headerTableWithBorder;

                currentRow++;

                let totalFijos = 0;
                const gastosFijosData = gastos_generales.gastosGenerales || [];

                for (const parentRowData of gastosFijosData) {
                    let currentRowObj = gastosGeneralesSheet.getRow(currentRow);
                    currentRowObj.getCell(2).value = parentRowData.item || '';
                    currentRowObj.getCell(2).style = customStyles.dataTableWithBorder;

                    // Mergear celdas para descripción
                    gastosGeneralesSheet.mergeCells(`C${currentRow}:E${currentRow}`);
                    currentRowObj.getCell(3).value = parentRowData.descripcion || '';
                    currentRowObj.getCell(3).style = customStyles.dataTableWithBorder;
                    // Ensure all merged cells have borders
                    for (let col = 3; col <= 5; col++) { // C to E (columns 3 to 5)
                        currentRowObj.getCell(col).style = customStyles.dataTableWithBorder;
                    }

                    currentRowObj.getCell(6).value = parentRowData.unidad || '';
                    currentRowObj.getCell(6).style = customStyles.dataTableWithBorder;
                    currentRowObj.getCell(7).value = '';
                    currentRowObj.getCell(7).style = customStyles.dataTableWithBorder;
                    currentRowObj.getCell(8).value = '';
                    currentRowObj.getCell(8).style = customStyles.dataTableWithBorder;
                    currentRowObj.getCell(9).value = parseFloat(parentRowData.parcialgen || 0);
                    currentRowObj.getCell(9).style = customStyles.numberWithBorder;
                    currentRow++;

                    if (parentRowData.children && parentRowData.children.length > 0) {
                        for (const childData of parentRowData.children) {
                            currentRowObj = gastosGeneralesSheet.getRow(currentRow);
                            currentRowObj.getCell(2).value = childData.item || '';
                            currentRowObj.getCell(2).style = customStyles.dataTableWithBorder;

                            // Mergear celdas para descripción del child
                            gastosGeneralesSheet.mergeCells(`C${currentRow}:E${currentRow}`);
                            currentRowObj.getCell(3).value = "    " + (childData.descripcion || '');
                            currentRowObj.getCell(3).style = customStyles.dataTableWithBorder;

                            currentRowObj.getCell(6).value = childData.unidad || '';
                            currentRowObj.getCell(6).style = customStyles.dataTableWithBorder;
                            currentRowObj.getCell(7).value = parseFloat(childData.cantidad || 0);
                            currentRowObj.getCell(7).style = customStyles.numberWithBorder;
                            currentRowObj.getCell(8).value = parseFloat(childData.costounitario || 0);
                            currentRowObj.getCell(8).style = customStyles.numberWithBorder;
                            currentRowObj.getCell(9).value = parseFloat(childData.parcialgen || 0);
                            currentRowObj.getCell(9).style = customStyles.numberWithBorder;

                            totalFijos += parseFloat(childData.parcialgen || 0);
                            currentRow++;
                        }
                    }
                }

                // Total Fijos
                gastosGeneralesSheet.mergeCells(`B${currentRow}:H${currentRow}`);
                gastosGeneralesSheet.getCell(`B${currentRow}`).value = 'TOTAL GASTOS FIJOS';
                gastosGeneralesSheet.getCell(`B${currentRow}`).style = customStyles.totalHeader;
                gastosGeneralesSheet.getCell(`I${currentRow}`).value = totalFijos;
                gastosGeneralesSheet.getCell(`I${currentRow}`).style = customStyles.subtotal;
                currentRow += 3;

                // --- SEGUNDA TABLA: Gastos Generales Variables ---
                gastosGeneralesSheet.mergeCells(`B${currentRow}:I${currentRow}`);
                gastosGeneralesSheet.getCell(`B${currentRow}`).value = '02) GASTOS GENERALES VARIABLES';
                gastosGeneralesSheet.getCell(`B${currentRow}`).style = customStyles.subTitle;
                currentRow++;

                const headersVariables = ['ITEM', 'DESCRIPCIÓN', 'UNIDAD', 'CANTIDAD', 'TIEMPO', 'PARTICIPACIÓN', 'PRECIO UNIT.', 'PARCIAL'];
                const headerRowVariables = gastosGeneralesSheet.getRow(currentRow);
                const startRowVariables = currentRow;

                headersVariables.forEach((header, index) => {
                    const cell = headerRowVariables.getCell(index + 2);
                    cell.value = header;
                    cell.style = customStyles.headerTableWithBorder;
                });
                currentRow++;

                let totalVariables = 0;
                const gastosVariablesData = gastos_generales.gastosEspecificos || [];

                const writeHierarchicalData = (rowData, level = 0) => {
                    let currentRowObj = gastosGeneralesSheet.getRow(currentRow);
                    const indent = "    ".repeat(level);

                    currentRowObj.getCell(2).value = rowData.item || '';
                    currentRowObj.getCell(2).style = customStyles.dataTableWithBorder;
                    currentRowObj.getCell(3).value = `${indent}${rowData.descripcion || ''}`;
                    currentRowObj.getCell(3).style = customStyles.dataTableWithBorder;
                    currentRowObj.getCell(4).value = rowData.unidad || '';
                    currentRowObj.getCell(4).style = customStyles.dataTableWithBorder;
                    currentRowObj.getCell(5).value = rowData.cantidad != null ? parseFloat(rowData.cantidad) : '';
                    currentRowObj.getCell(5).style = customStyles.numberWithBorder;
                    currentRowObj.getCell(6).value = rowData.cantidadtiempo != null ? parseFloat(rowData.cantidadtiempo) : '';
                    currentRowObj.getCell(6).style = customStyles.numberWithBorder;
                    currentRowObj.getCell(7).value = rowData.participacion || '';
                    currentRowObj.getCell(7).style = customStyles.dataTableWithBorder;
                    currentRowObj.getCell(8).value = rowData.costounitario != null ? parseFloat(rowData.costounitario) : '';
                    currentRowObj.getCell(8).style = customStyles.numberWithBorder;

                    const parcialField = rowData.parcialespecifico || rowData.parcial || 0;
                    currentRowObj.getCell(9).value = parseFloat(parcialField);
                    currentRowObj.getCell(9).style = customStyles.numberWithBorder;

                    // Solo sumar parciales de elementos hoja (sin children)
                    if (!rowData.children || rowData.children.length === 0) {
                        totalVariables += parseFloat(parcialField);
                    }

                    currentRow++;

                    if (rowData.children && rowData.children.length > 0) {
                        for (const childData of rowData.children) {
                            writeHierarchicalData(childData, level + 1);
                        }
                    }
                };

                for (const parentRowData of gastosVariablesData) {
                    writeHierarchicalData(parentRowData);
                }

                // Total Variables
                gastosGeneralesSheet.mergeCells(`B${currentRow}:H${currentRow}`);
                gastosGeneralesSheet.getCell(`B${currentRow}`).value = 'TOTAL GASTOS VARIABLES';
                gastosGeneralesSheet.getCell(`B${currentRow}`).style = customStyles.totalHeader;
                gastosGeneralesSheet.getCell(`I${currentRow}`).value = totalVariables;
                gastosGeneralesSheet.getCell(`I${currentRow}`).style = customStyles.subtotal;
                currentRow += 3;

                // --- RESUMEN FINAL ---
                gastosGeneralesSheet.mergeCells(`B${currentRow}:I${currentRow}`);
                gastosGeneralesSheet.getCell(`B${currentRow}`).value = `III.- GASTOS GENERALES TOTAL`;
                gastosGeneralesSheet.getCell(`B${currentRow}`).style = customStyles.redTitle;
                currentRow += 2;

                const totalGastos = totalFijos + totalVariables;

                // Total Fijos + Variables
                gastosGeneralesSheet.mergeCells(`B${currentRow}:F${currentRow}`);
                gastosGeneralesSheet.getCell(`B${currentRow}`).value = 'TOTAL GASTOS FIJOS + GASTOS VARIABLES:';
                gastosGeneralesSheet.getCell(`B${currentRow}`).style = customStyles.summaryInfo;
                gastosGeneralesSheet.mergeCells(`G${currentRow}:I${currentRow}`);
                gastosGeneralesSheet.getCell(`G${currentRow}`).value = `S/. ${totalGastos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
                gastosGeneralesSheet.getCell(`G${currentRow}`).style = customStyles.summaryAmount;
                currentRow++;

                // Total Costo Directo
                gastosGeneralesSheet.mergeCells(`B${currentRow}:F${currentRow}`);
                gastosGeneralesSheet.getCell(`B${currentRow}`).value = 'TOTAL DE COSTO DIRECTO:';
                gastosGeneralesSheet.getCell(`B${currentRow}`).style = customStyles.summaryInfo;
                gastosGeneralesSheet.mergeCells(`G${currentRow}:I${currentRow}`);
                gastosGeneralesSheet.getCell(`G${currentRow}`).value = `S/. ${validCostoDirecto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
                gastosGeneralesSheet.getCell(`G${currentRow}`).style = customStyles.summaryAmount;
                currentRow++;

                // Porcentaje
                const percentage = validCostoDirecto > 0 ? (totalGastos / validCostoDirecto) * 100 : 0;
                gastosGeneralesSheet.mergeCells(`B${currentRow}:F${currentRow}`);
                gastosGeneralesSheet.getCell(`B${currentRow}`).value = '% DE GASTOS GENERALES:';
                gastosGeneralesSheet.getCell(`B${currentRow}`).style = customStyles.summaryInfo;
                gastosGeneralesSheet.mergeCells(`G${currentRow}:I${currentRow}`);
                gastosGeneralesSheet.getCell(`G${currentRow}`).value = `${percentage.toFixed(2)}%`;
                gastosGeneralesSheet.getCell(`G${currentRow}`).style = {
                    ...customStyles.summaryAmount,
                    numFmt: '0.00"%"'
                };

                // Ajustar ancho de columnas para mejor visualización
                gastosGeneralesSheet.getColumn(2).width = 8;   // Item
                gastosGeneralesSheet.getColumn(3).width = 40;  // Descripción (más ancho)
                gastosGeneralesSheet.getColumn(4).width = 12;  // Unidad
                gastosGeneralesSheet.getColumn(5).width = 12;  // Cantidad
                gastosGeneralesSheet.getColumn(6).width = 12;  // Tiempo/Costo
                gastosGeneralesSheet.getColumn(7).width = 15;  // Participación
                gastosGeneralesSheet.getColumn(8).width = 15;  // Precio
                gastosGeneralesSheet.getColumn(9).width = 15;  // Parcial

                // Aplicar fondo blanco a toda la hoja usada
                const lastUsedRow = currentRow;
                for (let row = 1; row <= lastUsedRow; row++) {
                    for (let col = 1; col <= 10; col++) {
                        const cell = gastosGeneralesSheet.getCell(row, col);
                        if (!cell.style || !cell.style.fill) {
                            if (!cell.style) cell.style = {};
                            cell.style.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } };
                            if (!cell.style.font) cell.style.font = {};
                            cell.style.font.color = { argb: 'FF000000' };
                        }
                    }
                }

                return totalGastos;

            } catch (error) {
                console.error(`Error al escribir hoja gastos generales:`, error);
                throw error;
            }
        };

        const hojasgastosFijos = async () => {
            try {
                const columnasgastofijos = [
                    4,   // A - 
                    40,  // B - 
                    10,  // C - 
                    10,  // D - 
                    15,  // E - 
                    15,  // F - 
                    15,  // G -
                    15,  // H - 
                    15,  // I -
                ];

                let currentRow = escribirEncabezado(
                    gastosFijosSheet,
                    'GASTOS FIJOS',
                    logo1Data,
                    logo2Data,
                    2, // colStart = B
                    9, // colEnd = I
                    columnasgastofijos
                );
                // let currentRow = escribirEncabezado(gastosFijosSheet, 'GASTOS FIJOS', logo1Data, logo2Data);

                // Define a base style for table headers (assuming 'styles' object is available)
                const headerStyle = {
                    font: { bold: true, color: { argb: 'FF000000' } }, // Black font
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }, // White background
                    border: {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    },
                    alignment: { vertical: 'middle', horizontal: 'center' }
                };

                const cellStyle = {
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }, // White background
                    border: {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    },
                    alignment: { vertical: 'middle', horizontal: 'left' }
                };

                const totalRowStyle = {
                    font: { bold: true },
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }, // White background
                    border: {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    },
                    alignment: { vertical: 'middle', horizontal: 'right' }
                };

                // Helper function to add a table
                const addTable = (sheet, startRow, title, headers, data, totalValue, columnMapping, totalColumnIndex) => {
                    // Add subtitle
                    const startColLetter = 'B';
                    // Calculate the end column letter based on the last header's column index.
                    // The maximum column index used by headers will determine the merge width.
                    let maxHeaderColIndex = 0;
                    Object.values(columnMapping).forEach(colIndex => {
                        if (colIndex > maxHeaderColIndex) {
                            maxHeaderColIndex = colIndex;
                        }
                    });
                    // Ensure the subtitle merges at least to where the actual data might end, or to the last header if it's wider
                    const endColLetter = String.fromCharCode(64 + Math.max(maxHeaderColIndex, totalColumnIndex)); // Ensure subtitle spans adequately

                    sheet.mergeCells(`${startColLetter}${startRow}:${endColLetter}${startRow}`);
                    const titleCell = sheet.getCell(`${startColLetter}${startRow}`);
                    titleCell.value = title;
                    titleCell.font = { bold: true, color: { argb: 'FF0000FF' }, size: 12 }; // Blue color
                    titleCell.alignment = { vertical: 'middle', horizontal: 'left' };

                    startRow++; // Move to the next row for headers

                    // Add headers
                    headers.forEach((header, index) => {
                        const headerCell = sheet.getCell(startRow, index + 2); // Start from column 2 (B)
                        if (headerCell) { // Ensure the cell exists before styling
                            headerCell.value = header;
                            Object.assign(headerCell.style, headerStyle);
                        }
                    });

                    startRow++; // Move to the next row for data

                    // Add data rows
                    if (data && data.length > 0) {
                        data.forEach(item => {
                            Object.keys(columnMapping).forEach(colKey => {
                                const colIndex = columnMapping[colKey];
                                const cell = sheet.getCell(startRow, colIndex);

                                if (cell) { // Crucial: Ensure the cell object is not undefined
                                    let value = item[colKey];

                                    // Special handling for percentage values based on key
                                    if (colKey.includes('tea') && typeof value === 'number') {
                                        cell.numFmt = '0.00%';
                                        value = value / 100; // Convert to decimal for Excel percentage format
                                        cell.alignment = { horizontal: 'right' }; // Directly assign alignment
                                    } else if (colKey.includes('Dias') && typeof value === 'number') {
                                        cell.numFfmt = '0.00'; // Specific format for days if needed
                                        cell.alignment = { horizontal: 'center' };
                                    } else if (typeof value === 'number' && (colKey.includes('garantiaFC') || colKey.includes('garantiaTotal') || colKey.includes('Monto') || colKey.includes('S/.'))) {
                                        cell.numFmt = '#,##0.00';
                                        cell.alignment = { horizontal: 'right' };
                                    } else if (typeof value === 'number') { // General number formatting
                                        cell.numFmt = '#,##0.00';
                                        cell.alignment = { horizontal: 'right' };
                                    } else { // Default alignment for text/other types
                                        cell.alignment = { horizontal: 'left' };
                                    }
                                    cell.value = value;
                                    Object.assign(cell.style, cellStyle);
                                }
                            });
                            startRow++;
                        });
                    } else {
                        // Add a placeholder row if no data
                        const noDataCell = sheet.getCell(startRow, 2); // Start from B
                        if (noDataCell) {
                            noDataCell.value = "No hay datos disponibles";
                            sheet.mergeCells(`B${startRow}:${String.fromCharCode(64 + headers.length + 1)}${startRow}`); // Merge across header columns
                            Object.assign(noDataCell.style, cellStyle);
                            noDataCell.alignment = { horizontal: 'center' };
                        }
                        startRow++;
                    }

                    // Add total row if totalValue is provided and totalColumnIndex is valid
                    if (totalValue !== undefined && totalColumnIndex > 0) {
                        // Merge cells for 'TOTAL S/.' label
                        const totalLabelStartCol = 2; // Column B
                        const totalLabelEndCol = totalColumnIndex - 1; // Column before the total value

                        // Ensure totalLabelEndCol is not less than totalLabelStartCol for merging
                        if (totalLabelStartCol < totalLabelEndCol) {
                            sheet.mergeCells(`${String.fromCharCode(64 + totalLabelStartCol)}${startRow}:${String.fromCharCode(64 + totalLabelEndCol)}${startRow}`);
                        }

                        const totalCellText = sheet.getCell(startRow, totalLabelStartCol);
                        if (totalCellText) {
                            totalCellText.value = 'TOTAL S/.';
                            Object.assign(totalCellText.style, totalRowStyle);
                            totalCellText.alignment = { horizontal: 'right' }; // Ensure 'TOTAL S/.' is right-aligned in its merged cell
                        }

                        const totalValueCell = sheet.getCell(startRow, totalColumnIndex);
                        if (totalValueCell) {
                            totalValueCell.value = totalValue;
                            totalValueCell.numFmt = '#,##0.00';
                            Object.assign(totalValueCell.style, totalRowStyle);
                            totalValueCell.alignment = { horizontal: 'right' };
                        }
                    }
                    startRow++; // For the total row or just move past the last data row

                    return startRow + 2; // Return the row for the next table, leaving 2 blank rows
                };

                // Order of tables as requested
                const tableOrder = [
                    {
                        title: 'RESUMEN',
                        key: 'resumen', // This key doesn't exist in your data, need to create a dummy table for it or skip
                        headers: ['Descripción', 'INGRESO DE DATOS'],
                        // Assuming RESUMEN table data is from the initial part of image_0a69f1.png
                        // This data is not directly in gastos_fijos.tables, so we'll construct it
                        data: [
                            { Descripcion: 'Costo Directo :', Valor: 3495150.47 },
                            { Descripcion: 'GGF :', Valor: 48764.01 },
                            { Descripcion: 'GGV :', Valor: 406654.10 },
                            { Descripcion: 'UTILIDAD :', Valor: 174757.52 },
                            { Descripcion: 'SUB TOTAL (sin IGV)', Valor: 4125326.10 },
                            { Descripcion: 'Monto contrato Garantizar', Valor: 4867884.80 },
                            { Descripcion: 'Duracion obra', Valor: '180 Dias' }
                        ],
                        columnMapping: { 'Descripcion': 2, 'Valor': 3 }, // Start from column B (2)
                        totalKey: null, // No total for summary table
                        totalColumn: 3 // Column where 'Valor' is
                    },
                    {
                        title: 'FIANZA POR GARANTIA DE FIEL CUMPLIMIENTO (10%)',
                        key: 'fianzaCumplimiento',
                        headers: ['Descripción', 'Garantia Fiel Comp. 10%', 'TEA %', 'TEA / 360 dias', 'Duración Obra (Dias)', 'Duracion Liq. (Dias)', 'Garantia FC (sin IGV) S/.'],
                        columnMapping: {
                            'descripcion': 2, // Column B
                            'garantiaFC': 3, // Column C (Garantia Fiel Comp. 10%)
                            'tea': 4, // Column D (TEA %)
                            'teaDias': 5, // Column E (TEA / 360 dias)
                            'duracionObra': 6, // Column F (Duración Obra (Dias))
                            'duracionLiq': 7, // Column G (Duracion Liq. (Dias))
                            'garantiaFC': 8 // Column H (Garantia FC (sin IGV) S/.)
                        },
                        totalKey: 'total',
                        totalColumn: 8 // Column H
                    },
                    {
                        title: 'FIANZA POR GARANTIA DE DE ADELANTO EN EFECTIVO (10%)',
                        key: 'fianzaAdelantoEfectivo',
                        headers: ['Descripción', 'Garantia Fiel Comp. 10%', 'TEA %', 'TEA / 360 dias', 'Factor %', 'Avance %', 'Renovacion c/ 3 meses (Dias)', 'Garantia FC (sin IGV) S/.'],
                        // Assuming similar keys for fianzaAdelantoEfectivo data
                        columnMapping: {
                            'descripcion': 2,
                            'garantiaFC': 3, // Assuming this holds the value for 'Garantia Fiel Comp. 10%'
                            'tea': 4,
                            'teaDias': 5,
                            'factor': 6, // Assuming 'factor' key exists
                            'avance': 7, // Assuming 'avance' key exists
                            'renovacion': 8, // Assuming 'renovacionDias' key exists
                            'garantiaFC': 9
                        },
                        totalKey: 'total',
                        totalColumn: 9
                    },
                    {
                        title: 'FIANZA POR GARANTIA DE DE ADELANTO EN MATERIALES (20%)',
                        key: 'fianzaAdelantoMateriales',
                        headers: ['Descripción', 'Garantia Fiel Comp. 20%', 'TEA %', 'TEA / 360 dias', 'Factor %', 'Avance %', 'Renovacion c/ 3 meses (Dias)', 'Garantia FC (sin IGV) S/.'],
                        // Assuming similar keys for fianzaAdelantoMateriales data
                        columnMapping: {
                            'descripcion': 2,
                            'garantiaFC': 3, // Assuming this holds the value for 'Garantia Fiel Comp. 20%'
                            'tea': 4,
                            'teaDias': 5,
                            'factor': 6,
                            'avance': 7,
                            'renovacion': 8,
                            'garantiaFC': 9
                        },
                        totalKey: 'total',
                        totalColumn: 9
                    },
                    {
                        title: 'Póliza de Seguros C.A.R. Contra Todo Riesgo (vigencia durante ejecución de la obra)',
                        key: 'polizaCAR',
                        headers: ['Descripción', 'Monto del Contrato', 'TEA %', 'TEA / 360 dias', 'Duración Obra (Dias)', 'Póliza S/.'],
                        // Assuming keys for polizaCAR data
                        columnMapping: {
                            'descripcion': 2,
                            'montoContrato': 3, // Assuming 'montoContrato' key exists
                            'tea': 4,
                            'teaDias': 5,
                            'duracionObra': 6,
                            'poliza': 7 // Assuming 'poliza' key exists for 'Póliza S/.'
                        },
                        totalKey: 'total',
                        totalColumn: 7
                    },
                    {
                        title: 'SEGURO SCTR del Prersonal del personal tecnico - Gastos Generales (vigencia durante ejec. de obra)',
                        key: 'seguroSCTR',
                        headers: ['Descripción', 'SUB TOTAL (sin IGV)', 'TEA %', 'TEA / 360 dias', 'Duracion Obra (Dias)', 'Póliza S/.'],
                        // Assuming keys for seguroSCTR data
                        columnMapping: {
                            'descripcion': 2,
                            'subtotal': 3, // Assuming 'subTotal' key exists for 'SUB TOTAL (sin IGV)'
                            'tea': 4,
                            'teaDias': 5,
                            'duracionObra': 6,
                            'poliza': 7
                        },
                        totalKey: 'total',
                        totalColumn: 7
                    },
                    {
                        title: 'POLIZA DE SEGUROS ESSALUD + Vida para los trabajadores',
                        key: 'polizaEssalud',
                        headers: ['Descripción', 'Monto', 'TEA %', 'PÓLIZA S/.'], // Updated headers based on common usage
                        // Assuming keys for polizaEssalud data
                        columnMapping: {
                            'descripcion': 2,
                            'descripcionessalud': 3, // Assuming 'monto' key exists for the value that was previously 'Description'
                            'tea': 4,
                            'poliza': 5 // Assuming 'poliza' key exists for 'PÓLIZA S/.'
                        },
                        totalKey: 'total',
                        totalColumn: 5
                    },
                    {
                        title: 'PAGO SENCICO',
                        key: 'pagoSencico',
                        headers: ['Descripción', 'Monto', 'TEA %', 'PÓLIZA S/.'], // Updated headers
                        // Assuming keys for pagoSencico data
                        columnMapping: {
                            'descripcion': 2,
                            'descripcion2': 3,
                            'tea': 4,
                            'poliza': 5
                        },
                        totalKey: 'total',
                        totalColumn: 5
                    },
                    {
                        title: 'Impuestos ITF',
                        key: 'impuestosITF',
                        headers: ['Descripción', 'Monto', 'TEA %', 'PÓLIZA S/.'], // Updated headers
                        // Assuming keys for impuestosITF data
                        columnMapping: {
                            'descripcion': 2,
                            'descripcion2': 3,
                            'tea': 4,
                            'poliza': 5
                        },
                        totalKey: 'total',
                        totalColumn: 5
                    }
                ];

                for (const tableConfig of tableOrder) {
                    const data = gastos_fijos.tables[tableConfig.key]?.data || tableConfig.data; // Prioritize actual data, fallback to static if summary
                    const total = gastos_fijos.tables[tableConfig.key]?.total || undefined; // Total might not exist for some

                    // Dynamically calculate the total column index for 'TOTAL S/.' label merging
                    // It should span from column B up to the column *before* the total value column.
                    let currentTotalColumnIndex = tableConfig.totalColumn;

                    currentRow = addTable(
                        gastosFijosSheet,
                        currentRow,
                        tableConfig.title,
                        tableConfig.headers,
                        data,
                        total,
                        tableConfig.columnMapping,
                        currentTotalColumnIndex
                    );
                }

                return currentRow; // Return the final row for any subsequent content
            } catch (error) {
                console.error('Error al escribir hoja GASTOS FIJOS:', error);
                throw error;
            }
        };

        const hojassupervision = async () => {
            try {
                const columnassupervision = [
                    4,   // A - 
                    40,  // B - 
                    10,  // C - 
                    10,  // D - 
                    15,  // E - 
                    15,  // F - 
                    15,  // G -
                    15,  // H - 
                ];

                let currentRow = escribirEncabezado(
                    supervisionSheet,
                    'SUPERVISION',
                    logo1Data,
                    logo2Data,
                    2, // colStart = B
                    8, // colEnd = I
                    columnassupervision
                );

                //let currentRow = await escribirEncabezado(supervisionSheet, 'SUPERVISION', logo1Data, logo2Data);

                // Define styles
                const commonCellStyle = {
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } }, // White background
                    border: {
                        top: { style: 'thin', color: { argb: 'FF000000' } },
                        left: { style: 'thin', color: { argb: 'FF000000' } },
                        bottom: { style: 'thin', color: { argb: 'FF000000' } },
                        right: { style: 'thin', color: { argb: 'FF000000' } }
                    },
                    alignment: { vertical: 'middle', horizontal: 'left', wrapText: true }
                };

                const headerStyle = {
                    ...commonCellStyle,
                    font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 }, // White font
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000080' } }, // Dark blue background
                    alignment: { vertical: 'middle', horizontal: 'center' }
                };

                const romanHeaderStyle = {
                    ...commonCellStyle,
                    font: { bold: true, color: { argb: 'FF000000' }, size: 10 },
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCE6FF' } }, // Light blue background
                    alignment: { vertical: 'middle', horizontal: 'left' }
                };

                const letterHeaderStyle = {
                    ...commonCellStyle,
                    font: { bold: true, color: { argb: 'FF000000' }, size: 10 },
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0FFFF' } }, // Lighter blue background
                    alignment: { vertical: 'middle', horizontal: 'left' }
                };

                const subtotalStyle = {
                    ...commonCellStyle,
                    font: { bold: true, color: { argb: 'FF000000' }, size: 10 },
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC2D69B' } }, // Light green background
                    alignment: { vertical: 'middle', horizontal: 'right' }
                };

                const totalRowStyle = {
                    ...commonCellStyle,
                    font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 },
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000080' } }, // Dark blue background
                    alignment: { vertical: 'middle', horizontal: 'right' }
                };

                const percentageStyle = {
                    ...commonCellStyle,
                    font: { bold: true, color: { argb: 'FF000000' }, size: 10 },
                    alignment: { vertical: 'middle', horizontal: 'right' },
                    numFmt: '0.00%' // Format as percentage
                };

                // Write title "RESUMEN DE COSTOS"
                supervisionSheet.mergeCells(`B${currentRow}:H${currentRow}`);
                const resumeTitleCell = supervisionSheet.getCell(`B${currentRow}`);
                resumeTitleCell.value = 'RESUMEN DE COSTOS';
                resumeTitleCell.font = { bold: true, size: 12, color: { argb: 'FF000000' } };
                resumeTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };
                Object.assign(resumeTitleCell.style, commonCellStyle);

                currentRow++; // Move to next row for headers

                // Write table headers
                const headers = ['CONCEPTO', 'UNIDAD', 'CANTIDAD', 'TIEMPO EN MESES', 'IMPORTE S/.', 'SUBTOTAL', 'TOTAL'];
                const headerRow = supervisionSheet.getRow(currentRow);
                headers.forEach((header, index) => {
                    const col = index + 2; // Start from column B (2)
                    const cell = headerRow.getCell(col);
                    cell.value = header;
                    Object.assign(cell.style, headerStyle);
                });

                // Set column widths
                supervisionSheet.getColumn(2).width = 40; // CONCEPTO
                supervisionSheet.getColumn(3).width = 10; // UNIDAD
                supervisionSheet.getColumn(4).width = 12; // CANTIDAD
                supervisionSheet.getColumn(5).width = 15; // TIEMPO EN MESES
                supervisionSheet.getColumn(6).width = 15; // IMPORTE S/.
                supervisionSheet.getColumn(7).width = 15; // SUBTOTAL
                supervisionSheet.getColumn(8).width = 15; // TOTAL

                currentRow++; // Move to next row for data

                // Helper function to process hierarchical data
                const processNode = (node, level, sheet, startRow) => {
                    let row = startRow;

                    // Handle static rows (I., A., A.1, totals, percentages)
                    if (node.isStaticRow) {
                        const conceptCol = 2; // Column B
                        const subtotalCol = 7; // Column G
                        const totalCol = 8; // Column H

                        // Clean concepto by removing HTML tags
                        const cleanConcepto = node.concepto.replace(/<\/?strong>/g, '');

                        if (node.romanIndex) { // I., II., III., etc.
                            sheet.mergeCells(`B${row}:F${row}`);
                            const conceptCell = sheet.getCell(row, conceptCol);
                            conceptCell.value = `${node.romanIndex}. ${cleanConcepto}`;
                            Object.assign(conceptCell.style, romanHeaderStyle);

                            const totalCell = sheet.getCell(row, totalCol);
                            totalCell.value = node.total || 0;
                            totalCell.numFmt = '#,##0.00';
                            Object.assign(totalCell.style, romanHeaderStyle);
                            totalCell.alignment = { vertical: 'middle', horizontal: 'right' };

                        } else if (node.letterIndex) { // A., B., etc.
                            sheet.mergeCells(`B${row}:F${row}`);
                            const conceptCell = sheet.getCell(row, conceptCol);
                            conceptCell.value = `${node.letterIndex}. ${cleanConcepto}`;
                            Object.assign(conceptCell.style, letterHeaderStyle);

                            const totalCell = sheet.getCell(row, subtotalCol);
                            totalCell.value = node.total || 0;
                            totalCell.numFmt = '#,##0.00';
                            Object.assign(totalCell.style, letterHeaderStyle);
                            totalCell.alignment = { vertical: 'middle', horizontal: 'right' };

                        } else if (cleanConcepto.includes('TOTAL') || cleanConcepto.includes('SUB TOTAL')) {
                            sheet.mergeCells(`B${row}:G${row}`);
                            const conceptCell = sheet.getCell(row, conceptCol);
                            conceptCell.value = cleanConcepto;
                            Object.assign(conceptCell.style, totalRowStyle);
                            conceptCell.alignment = { vertical: 'middle', horizontal: 'right' };

                            const totalValueCell = sheet.getCell(row, totalCol);
                            totalValueCell.value = node.total || 0;
                            totalValueCell.numFmt = '#,##0.00';
                            Object.assign(totalValueCell.style, totalRowStyle);
                            totalValueCell.alignment = { vertical: 'middle', horizontal: 'right' };

                        } else if (cleanConcepto.includes('Porcentaje') || cleanConcepto.includes('IGV')) {
                            sheet.mergeCells(`B${row}:G${row}`);
                            const conceptCell = sheet.getCell(row, conceptCol);
                            conceptCell.value = cleanConcepto;
                            Object.assign(conceptCell.style, percentageStyle);
                            conceptCell.alignment = { vertical: 'middle', horizontal: 'right' };

                            const percentageValueCell = sheet.getCell(row, totalCol);
                            percentageValueCell.value = cleanConcepto.includes('Porcentaje') ? (node.total / 100) : (node.total || 0);
                            percentageValueCell.numFmt = cleanConcepto.includes('Porcentaje') ? '0.00%' : '#,##0.00';
                            Object.assign(percentageValueCell.style, percentageStyle);
                            percentageValueCell.alignment = { vertical: 'middle', horizontal: 'right' };

                        } else if (node.subIndex) { // A.1, B., etc.
                            sheet.mergeCells(`B${row}:F${row}`);
                            const conceptCell = sheet.getCell(row, conceptCol);
                            conceptCell.value = `${node.subIndex} ${cleanConcepto}`;
                            Object.assign(conceptCell.style, subtotalStyle);
                            conceptCell.alignment = { vertical: 'middle', horizontal: 'left' };

                            const subtotalValueCell = sheet.getCell(row, totalCol);
                            subtotalValueCell.value = node.total || 0;
                            subtotalValueCell.numFmt = '#,##0.00';
                            Object.assign(subtotalValueCell.style, subtotalStyle);
                            subtotalValueCell.alignment = { vertical: 'middle', horizontal: 'right' };
                        }

                        row++; // Increment row after static row
                    } else {
                        // Handle leaf nodes (data rows)
                        const dataRow = sheet.getRow(row);

                        // Apply common cell style to all cells in the row
                        for (let i = 2; i <= 8; i++) {
                            const cell = dataRow.getCell(i);
                            Object.assign(cell.style, commonCellStyle);
                        }

                        // CONCEPTO (indented based on level)
                        const conceptCell = dataRow.getCell(2);
                        const indentation = '  '.repeat(level);
                        conceptCell.value = `${indentation}${node.concepto || ''}`;
                        conceptCell.alignment = { vertical: 'middle', horizontal: 'left' };

                        // UNIDAD
                        const unitCell = dataRow.getCell(3);
                        unitCell.value = node.unidad || '';
                        unitCell.alignment = { vertical: 'middle', horizontal: 'center' };

                        // CANTIDAD
                        const quantityCell = dataRow.getCell(4);
                        quantityCell.value = node.cantidad || 0;
                        quantityCell.numFmt = '#,##0.00';
                        quantityCell.alignment = { vertical: 'middle', horizontal: 'center' };

                        // TIEMPO EN MESES
                        const timeCell = dataRow.getCell(5);
                        timeCell.value = node.tiempoMeses || 0;
                        timeCell.numFmt = '0.00';
                        timeCell.alignment = { vertical: 'middle', horizontal: 'center' };

                        // IMPORTE S/.
                        const importeCell = dataRow.getCell(6);
                        importeCell.value = node.importe || 0;
                        importeCell.numFmt = '#,##0.00';
                        importeCell.alignment = { vertical: 'middle', horizontal: 'right' };

                        // SUBTOTAL
                        const subtotalCell = dataRow.getCell(7);
                        subtotalCell.value = node.subtotal || 0;
                        subtotalCell.numFmt = '#,##0.00';
                        subtotalCell.alignment = { vertical: 'middle', horizontal: 'right' };

                        // TOTAL (leave blank for leaf nodes)
                        const totalCell = dataRow.getCell(8);
                        totalCell.value = '';
                        totalCell.alignment = { vertical: 'middle', horizontal: 'right' };

                        row++;
                    }

                    // Process children recursively
                    if (node.children && node.children.length > 0) {
                        node.children.forEach(child => {
                            row = processNode(child, level + 1, sheet, row);
                        });
                    }

                    return row;
                };

                // Process the supervision data
                if (supervision && supervision.dataSupervision && Array.isArray(supervision.dataSupervision)) {
                    supervision.dataSupervision.forEach(node => {
                        currentRow = processNode(node, 0, supervisionSheet, currentRow);
                    });

                    // Add final total row if totalSupervision exists
                    if (supervision.totalSupervision) {
                        supervisionSheet.mergeCells(`B${currentRow}:G${currentRow}`);
                        const totalConceptCell = supervisionSheet.getCell(`B${currentRow}`);
                        totalConceptCell.value = 'TOTAL GENERAL';
                        Object.assign(totalConceptCell.style, totalRowStyle);
                        totalConceptCell.alignment = { vertical: 'middle', horizontal: 'right' };

                        const totalValueCell = supervisionSheet.getCell(`H${currentRow}`);
                        totalValueCell.value = supervision.totalSupervision;
                        totalValueCell.numFmt = '#,##0.00';
                        Object.assign(totalValueCell.style, totalRowStyle);
                        totalValueCell.alignment = { vertical: 'middle', horizontal: 'right' };

                        currentRow++;
                    }
                } else {
                    console.warn('No valid supervision data found.');
                }

                return currentRow;
            } catch (error) {
                console.error('Error al escribir hoja SUPERVISION:', error);
                throw error;
            }
        };

        const hojasgastossupervision = async () => {
            try {
                const columnasgastogeneralsupervision = [
                    4,   // A - 
                    40,  // B - 
                    10,  // C - 
                    10,  // D - 
                    15,  // E - 
                    15,  // F - 
                    15,  // G -
                    15,  // H - 
                ];

                let currentRow = escribirEncabezado(
                    gastossupervisionSheet,
                    'GASTOS GENERALES SUPERVISION',
                    logo1Data,
                    logo2Data,
                    2, // colStart = B
                    8, // colEnd = I
                    columnasgastogeneralsupervision
                );

                //let currentRow = await escribirEncabezado(gastossupervisionSheet, 'GASTOS GENERALES SUPERVISION', logo1Data, logo2Data);

                // Define styles
                const commonCellStyle = {
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' } },
                    border: {
                        top: { style: 'thin', color: { argb: 'FF000000' } },
                        left: { style: 'thin', color: { argb: 'FF000000' } },
                        bottom: { style: 'thin', color: { argb: 'FF000000' } },
                        right: { style: 'thin', color: { argb: 'FF000000' } }
                    },
                    alignment: { vertical: 'middle', horizontal: 'left', wrapText: true }
                };

                const headerStyle = {
                    ...commonCellStyle,
                    font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 },
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000080' } },
                    alignment: { vertical: 'middle', horizontal: 'center' }
                };

                const sectionStyle = {
                    ...commonCellStyle,
                    font: { bold: true, color: { argb: 'FF000000' }, size: 10 },
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCE6FF' } },
                    alignment: { vertical: 'middle', horizontal: 'left' }
                };

                const totalStyle = {
                    ...commonCellStyle,
                    font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 10 },
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD700' } },
                    alignment: { vertical: 'middle', horizontal: 'right' }
                };

                // Write title
                gastossupervisionSheet.mergeCells(`B${currentRow}:H${currentRow}`);
                const titleCell = gastossupervisionSheet.getCell(`B${currentRow}`);
                titleCell.value = 'DETALLE DE GASTOS GENERALES DE SUPERVISION';
                titleCell.font = { bold: true, size: 12, color: { argb: 'FF000000' } };
                titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
                Object.assign(titleCell.style, commonCellStyle);

                currentRow += 1;

                // Write "RESUMEN DE COSTOS" section
                gastossupervisionSheet.mergeCells(`B${currentRow}:H${currentRow}`);
                const resumenCell = gastossupervisionSheet.getCell(`B${currentRow}`);
                resumenCell.value = 'RESUMEN DE COSTOS';
                resumenCell.font = { bold: true, size: 10, color: { argb: 'FF000000' } };
                resumenCell.alignment = { vertical: 'middle', horizontal: 'center' };
                Object.assign(resumenCell.style, commonCellStyle);

                currentRow += 1;

                // Write table headers
                const headers = ['CONCEPTO', 'UNIDAD', 'CANTIDAD', 'TIEMPO EN MESES', 'IMPORTE S/.', 'SUBTOTAL', 'TOTAL'];
                const headerRow = gastossupervisionSheet.getRow(currentRow);
                headers.forEach((header, index) => {
                    const col = index + 2;
                    const cell = headerRow.getCell(col);
                    cell.value = header;
                    Object.assign(cell.style, headerStyle);
                });

                currentRow++;

                // Helper function to process hierarchical data
                const processNode = (node, level, sheet, startRow) => {
                    let row = startRow;
                    let total = 0;

                    if (node._children && node._children.length > 0 || (!node.cantidad && !node.importe && node.total)) {
                        // Handle section headers
                        const conceptCol = 2;
                        const totalCol = 8;

                        const cleanConcepto = node.concepto ? node.concepto.replace(/<\/?strong>/g, '') : '';

                        // Merge cells for section headers
                        sheet.mergeCells(`B${row}:E${row}`);
                        const conceptCell = sheet.getCell(row, conceptCol);
                        conceptCell.value = `${'  '.repeat(level)}${cleanConcepto}`;
                        Object.assign(conceptCell.style, sectionStyle);
                        conceptCell.alignment = { vertical: 'middle', horizontal: 'left' };

                        const totalCell = sheet.getCell(row, totalCol);
                        totalCell.value = node.total ? parseFloat(node.total.replace(/,/g, '')) : 0;
                        totalCell.numFmt = '#,##0.00';
                        Object.assign(totalCell.style, sectionStyle);
                        totalCell.alignment = { vertical: 'middle', horizontal: 'right' };

                        total += parseFloat(node.total.replace(/,/g, '')) || 0;
                        row++;

                        if (node._children && node._children.length > 0) {
                            node._children.forEach(child => {
                                const childResult = processNode(child, level + 1, sheet, row);
                                total += childResult.total || 0;
                                row = childResult.row;
                            });
                        }
                    } else {
                        // Handle leaf nodes (data rows)
                        const dataRow = sheet.getRow(row);

                        for (let i = 2; i <= 8; i++) {
                            const cell = dataRow.getCell(i);
                            Object.assign(cell.style, commonCellStyle);
                        }

                        const conceptCell = dataRow.getCell(2);
                        conceptCell.value = `${'  '.repeat(level)}${node.concepto || ''}`;
                        conceptCell.alignment = { vertical: 'middle', horizontal: 'left' };

                        const unitCell = dataRow.getCell(3);
                        unitCell.value = node.unidad || '';
                        unitCell.alignment = { vertical: 'middle', horizontal: 'center' };

                        const quantityCell = dataRow.getCell(4);
                        quantityCell.value = node.cantidad !== null && node.cantidad !== undefined ? node.cantidad : '';
                        quantityCell.numFmt = node.cantidad !== null && node.cantidad !== undefined ? '#,##0.00' : '';
                        quantityCell.alignment = { vertical: 'middle', horizontal: 'center' };

                        const timeCell = dataRow.getCell(5);
                        timeCell.value = node.tiempo !== null && node.tiempo !== undefined ? node.tiempo : '';
                        timeCell.numFmt = node.tiempo !== null && node.tiempo !== undefined ? '0.00' : '';
                        timeCell.alignment = { vertical: 'middle', horizontal: 'center' };

                        const importeCell = dataRow.getCell(6);
                        importeCell.value = node.importe !== null && node.importe !== undefined ? parseFloat(node.importe) : '';
                        importeCell.numFmt = node.importe !== null && node.importe !== undefined ? '#,##0.00' : '';
                        importeCell.alignment = { vertical: 'middle', horizontal: 'right' };

                        const subtotalCell = dataRow.getCell(7);
                        let subtotalValue = node.subtotal || (node.importe && node.cantidad && node.tiempo ? node.importe * node.cantidad * node.tiempo : '');
                        subtotalCell.value = subtotalValue ? parseFloat(subtotalValue) : '';
                        subtotalCell.numFmt = subtotalValue ? '#,##0.00' : '';
                        subtotalCell.alignment = { vertical: 'middle', horizontal: 'right' };

                        const totalCell = dataRow.getCell(8);
                        totalCell.value = node.total ? parseFloat(node.total.replace(/,/g, '')) : '';
                        totalCell.numFmt = node.total ? '#,##0.00' : '';
                        totalCell.alignment = { vertical: 'middle', horizontal: 'right' };

                        total += subtotalValue ? parseFloat(subtotalValue) : (node.total ? parseFloat(node.total.replace(/,/g, '')) : 0);
                        row++;
                    }

                    return { row, total };
                };

                // Extract gastogeneralSupervision
                let gastogeneralSupervision = null;
                let totalGeneral = 0;
                if (supervision && supervision.dataSupervision && Array.isArray(supervision.dataSupervision)) {
                    const ivNode = supervision.dataSupervision.find(node => node.romanIndex === 'IV');
                    if (ivNode && ivNode.ggsupervicion && ivNode.ggsupervicion.gastogeneralSupervision) {
                        gastogeneralSupervision = ivNode.ggsupervicion.gastogeneralSupervision;
                        totalGeneral = ivNode.ggsupervicion.totalGeneral || ivNode.total || 0;
                    } else {
                        gastogeneralSupervision = [gastogeneralSupervision]; // Use the predefined data
                    }
                } else {
                    gastogeneralSupervision = [gastogeneralSupervision]; // Use the predefined data
                }

                // Process nodes
                if (gastogeneralSupervision && gastogeneralSupervision.length > 0) {
                    for (const rootNode of gastogeneralSupervision) {
                        const result = processNode(rootNode, 0, gastossupervisionSheet, currentRow);
                        totalGeneral = result.total;
                        currentRow = result.row;
                    }

                    // Add total row
                    gastossupervisionSheet.mergeCells(`B${currentRow}:E${currentRow}`);
                    const totalConceptCell = gastossupervisionSheet.getCell(`B${currentRow}`);
                    totalConceptCell.value = 'TOTAL GASTOS GENERALES';
                    Object.assign(totalConceptCell.style, totalStyle);
                    totalConceptCell.alignment = { vertical: 'middle', horizontal: 'right' };

                    const totalValueCellF = gastossupervisionSheet.getCell(`F${currentRow}`);
                    totalValueCellF.value = parseFloat(totalGeneral);
                    totalValueCellF.numFmt = '#,##0.00';
                    Object.assign(totalValueCellF.style, totalStyle);
                    totalValueCellF.alignment = { vertical: 'middle', horizontal: 'right' };

                    const totalValueCellH = gastossupervisionSheet.getCell(`H${currentRow}`);
                    totalValueCellH.value = parseFloat(totalGeneral);
                    totalValueCellH.numFmt = '#,##0.00';
                    Object.assign(totalValueCellH.style, totalStyle);
                    totalValueCellH.alignment = { vertical: 'middle', horizontal: 'right' };

                    currentRow++;
                }

                // Set column widths
                gastossupervisionSheet.getColumn(2).width = 40;
                gastossupervisionSheet.getColumn(3).width = 10;
                gastossupervisionSheet.getColumn(4).width = 10;
                gastossupervisionSheet.getColumn(5).width = 15;
                gastossupervisionSheet.getColumn(6).width = 15;
                gastossupervisionSheet.getColumn(7).width = 15;
                gastossupervisionSheet.getColumn(8).width = 15;

                return currentRow;
            } catch (error) {
                console.error('Error al escribir hoja GASTOS GENERALES SUPER:', error);
                throw error;
            }
        };

        const hojasremuneraciones = async () => {
            let total = 0;

            try {
                const columnaremuneraciones = [
                    4,   // A - 
                    40,  // B - 
                    10,  // C - 
                    10,  // D - 
                    15,  // E - 
                    15,  // F - 
                    15,  // G -
                    15,  // H - 
                    15,  // I -
                    15,  // J -
                    15,  // K -
                    15,  // L -
                    15   // M -
                ];

                let currentRow = escribirEncabezado(
                    remuneracionesSheet,
                    'GASTOS GENERALES SUPERVISION',
                    logo1Data,
                    logo2Data,
                    2, // colStart = B
                    13, // colEnd = M
                    columnaremuneraciones
                );

                //let currentRow = escribirEncabezado(remuneracionesSheet, 'REMUNERACIONES', logo1Data, logo2Data);

                const defaultCellStyle = {
                    border: {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    },
                    alignment: { vertical: 'middle', horizontal: 'left' }
                };

                const headerCellStyle = {
                    ...defaultCellStyle,
                    font: { bold: true, color: { argb: 'FF000000' } },
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } },
                    alignment: { vertical: 'middle', horizontal: 'center' }
                };

                const titleStyle = {
                    font: { bold: true, size: 13 },
                    alignment: { vertical: 'middle', horizontal: 'center' }
                };

                const staticRowStyle = {
                    font: { bold: true },
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF9F9' } }
                };

                const titulo = 'CÁLCULO DE REMUNERACIONES POR TRABAJADOR';
                const startCol = 2; // Column B
                const endCol = startCol + 11; // Columns B to M
                remuneracionesSheet.mergeCells(currentRow, startCol, currentRow, endCol);
                const tituloCell = remuneracionesSheet.getCell(currentRow, startCol);
                tituloCell.value = titulo;
                Object.assign(tituloCell.style, titleStyle);
                currentRow++;

                const headers = [
                    '%', 'Cant.', 'Descripción', 'Meses', 'Precio Unitario',
                    'SNP', 'Asignación Familiar', 'ESSALUD', 'CTS',
                    'Vacaciones', 'Gratifica.', 'Total a Pagar por Mes'
                ];

                const headerRow = remuneracionesSheet.getRow(currentRow);
                headers.forEach((header, i) => {
                    const cell = headerRow.getCell(startCol + i);
                    cell.value = header;
                    Object.assign(cell.style, headerCellStyle);
                    switch (header) {
                        case '%': case 'Cant.': cell.width = 8; break;
                        case 'Descripción': cell.width = 40; break;
                        case 'Meses': cell.width = 10; break;
                        case 'Precio Unitario': cell.width = 15; break;
                        case 'Total a Pagar por Mes': cell.width = 20; break;
                        default: cell.width = 13; break;
                    }
                });
                currentRow++;

                remuneraciones.forEach((item) => {
                    const row = remuneracionesSheet.getRow(currentRow);

                    const values = [
                        item.porcentaje ?? '',
                        item.cantidad ?? '',
                        item.item ?? '',
                        item.meses ?? '',
                        item.precioUnitario ?? '',
                        item.snp ?? '',
                        item.asignacionFamiliar ?? '',
                        item.essalud ?? '',
                        item.cts ?? '',
                        item.vacaciones ?? '',
                        item.gratifica ?? '',
                        item.totalPagarMes ?? ''
                    ];

                    values.forEach((value, i) => {
                        const cell = row.getCell(startCol + i);
                        cell.value = value;
                        Object.assign(cell.style, defaultCellStyle);

                        if (typeof value === 'number') {
                            if (i === 0) {
                                cell.numFmt = '0.00%';
                                cell.value = value / 100;
                                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                            } else if (i === 1 || i === 3) {
                                cell.numFmt = '0';
                                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                            } else if (i >= 4) {
                                cell.numFmt = '#,##0.00';
                                cell.alignment = { vertical: 'middle', horizontal: 'right' };
                            }
                        } else if (typeof value === 'string' && value.endsWith('%')) {
                            cell.numFmt = '0.00%';
                            cell.alignment = { vertical: 'middle', horizontal: 'center' };
                        } else {
                            cell.alignment = { vertical: 'middle', horizontal: 'left' };
                        }
                    });

                    if (item.isStaticRow) {
                        row.eachCell((cell, colNumber) => {
                            if (colNumber >= startCol && colNumber <= endCol) {
                                if (!cell.style) cell.style = {};
                                if (!cell.style.font) cell.style.font = {};
                                if (!cell.style.fill) cell.style.fill = {};

                                Object.assign(cell.style.font, staticRowStyle.font);
                                Object.assign(cell.style.fill, staticRowStyle.fill);

                                const originalIndex = colNumber - startCol;
                                const originalValue = values[originalIndex];

                                if (typeof originalValue === 'number') {
                                    if (originalIndex === 0) {
                                        cell.numFmt = '0.00%';
                                    } else if (originalIndex === 1 || originalIndex === 3) {
                                        cell.numFmt = '0';
                                    } else if (originalIndex >= 4) {
                                        cell.numFmt = '#,##0.00';
                                    }
                                }
                            }
                        });

                        const itemCell = row.getCell(startCol + 2); // 'Descripción'
                        if (itemCell) {
                            itemCell.alignment = { vertical: 'middle', horizontal: 'right' };
                        }
                    }

                    total += typeof item.totalPagarMes === 'number' ? item.totalPagarMes : 0;
                    currentRow++;
                });

                currentRow++; // Blank row for spacing
                return total;

            } catch (error) {
                console.error('Error al escribir hoja REMUNERACIONES:', error);
                throw error;
            }
        };

        const hojascontrolconcurrente = async () => {
            try {
                // Definir anchos específicos para esta hoja
                const columnasControlConcurrente = [
                    4,   // A (espacio o índice)
                    40,  // B - Descripción
                    10,  // C - Unid.
                    10,  // D - Cantidad
                    15,  // E - Participacion
                    15,  // F - periodo
                    15,  // G - Precio Unitario
                    15,  // H - Sub Total
                    15   // I - Subtotal
                ];

                // let currentRow = await escribirEncabezado(controlConcurrenteSheet, 'CONTROL CONCURRENTE', logo1Data, logo2Data);
                let currentRow = escribirEncabezado(
                    controlConcurrenteSheet,
                    'CONTROL CONCURRENTE',
                    logo1Data,
                    logo2Data,
                    2, // colStart = B
                    9, // colEnd = I
                    columnasControlConcurrente
                );

                const defaultCellStyle = {
                    border: {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    },
                    alignment: { vertical: 'middle', horizontal: 'left' }
                };

                const headerCellStyle = {
                    ...defaultCellStyle,
                    font: { bold: true, color: { argb: 'FF000000' } },
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } },
                    alignment: { vertical: 'middle', horizontal: 'center' }
                };

                const staticRowStyle = {
                    font: { bold: true },
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF9F9' } },
                    alignment: { vertical: 'middle', horizontal: 'left' }
                };

                // Define headers to match the data fields
                const headers = ['Descripción', 'Unid.', 'Cantidad.', 'Participacion', 'periodo', 'Precio Unitario', 'Sub Total', 'Subtotal'];
                const startCol = 2; // Column B (after the header layout)

                // Write table headers
                const headerRow = controlConcurrenteSheet.getRow(currentRow);
                headers.forEach((header, i) => {
                    const cell = headerRow.getCell(startCol + i);
                    cell.value = header;
                    Object.assign(cell.style, headerCellStyle);
                });
                currentRow++;

                let total = 0;

                const escribirFila = (item, nivel = 0) => {
                    const row = controlConcurrenteSheet.getRow(currentRow);
                    const values = [
                        `${'  '.repeat(nivel)}${item.descripcion ?? ''}`, // Descripción
                        item.unidad ?? '',                                // Unid.
                        item.cantidad ?? '',                              // Cantidad
                        item.participacion ?? '',                         // Participacion
                        item.periodo ?? '',                               // periodo
                        item.preciounitario ?? '',                        // Precio Unitario
                        item.subtotal ?? '',                              // Sub Total
                        item.total ?? ''                                  // Subtotal
                    ];

                    values.forEach((value, i) => {
                        const cell = row.getCell(startCol + i);
                        cell.value = value;
                        Object.assign(cell.style, defaultCellStyle);

                        if (typeof value === 'number') {
                            if ([2].includes(i)) { // Cantidad
                                cell.numFmt = '0';
                                cell.alignment = { vertical: 'middle', horizontal: 'center' };
                            } else if ([3, 4, 5, 6, 7].includes(i)) { // Participacion, periodo, Precio Unitario, Sub Total, Subtotal
                                cell.numFmt = '#,##0.00';
                                cell.alignment = { vertical: 'middle', horizontal: 'right' };
                            }
                        } else {
                            cell.alignment = { vertical: 'middle', horizontal: 'left' };
                        }
                    });

                    if (!item.preciounitario && item._children?.length > 0) {
                        row.eachCell((cell, colNumber) => {
                            if (colNumber >= startCol && colNumber <= startCol + 7) {
                                if (!cell.style) cell.style = {};
                                if (!cell.style.font) cell.style.font = {};
                                if (!cell.style.fill) cell.style.fill = {};
                                Object.assign(cell.style.font, staticRowStyle.font);
                                Object.assign(cell.style.fill, staticRowStyle.fill);
                            }
                        });

                        const descCell = row.getCell(startCol); // 'Descripción'
                        if (descCell) {
                            descCell.alignment = { vertical: 'middle', horizontal: 'right' };
                        }
                    }

                    if (typeof item.total === 'number') {
                        total += item.total;
                    }

                    currentRow++;

                    // Recursively draw children if they exist
                    if (Array.isArray(item._children)) {
                        item._children.forEach(child => escribirFila(child, nivel + 1));
                    }
                };

                // Extract the array from the object and iterate over it
                let controlConcurrenteData = control_concurrente;
                if (control_concurrente && control_concurrente.contro_concurrente && Array.isArray(control_concurrente.contro_concurrente)) {
                    controlConcurrenteData = control_concurrente.contro_concurrente;
                } else if (!Array.isArray(controlConcurrenteData)) {
                    // If it's a single object, wrap it in an array
                    controlConcurrenteData = Array.isArray(controlConcurrenteData) ? controlConcurrenteData : [controlConcurrenteData];
                }

                // Iterate over all items in the main array
                controlConcurrenteData.forEach(item => escribirFila(item));

                currentRow++; // Space

                // Add total row
                const totalRow = controlConcurrenteSheet.getRow(currentRow);
                totalRow.getCell(startCol + 6).value = 'TOTAL'; // Precio Unitario column
                totalRow.getCell(startCol + 6).style = {
                    ...headerCellStyle,
                    alignment: { horizontal: 'right', vertical: 'middle' }
                };

                totalRow.getCell(startCol + 7).value = total; // Subtotal column
                totalRow.getCell(startCol + 7).numFmt = '#,##0.00';
                totalRow.getCell(startCol + 7).style = {
                    ...headerCellStyle,
                    alignment: { horizontal: 'right', vertical: 'middle' }
                };

                // Set column widths for better readability
                controlConcurrenteSheet.getColumn(2).width = 40;  // Descripción
                controlConcurrenteSheet.getColumn(3).width = 10;  // Unid.
                controlConcurrenteSheet.getColumn(4).width = 10;  // Cantidad
                controlConcurrenteSheet.getColumn(5).width = 15;  // Participacion
                controlConcurrenteSheet.getColumn(6).width = 15;  // periodo
                controlConcurrenteSheet.getColumn(7).width = 15;  // Precio Unitario
                controlConcurrenteSheet.getColumn(8).width = 15;  // Sub Total
                controlConcurrenteSheet.getColumn(9).width = 15;  // Subtotal

                return total;
            } catch (error) {
                console.error('Error al escribir hoja CONTROL CONCURRENTE:', error);
                throw error;
            }
        };

        const escribirResumen = async (totales) => {
            try {
                let currentRow = escribirEncabezado(resumenSheet, 'RESUMEN', logo1Data, logo2Data);
                const headers = ['Descripción', 'Monto'];
                const headerRow = resumenSheet.getRow(currentRow);
                headers.forEach((header, index) => {
                    headerRow.getCell(index + 2).value = header;
                    headerRow.getCell(index + 2).style = styles.headertable;
                });

                let row = currentRow + 1;
                const items = [
                    { descripcion: 'Costo Directo', monto: totales.consolidado },
                    { descripcion: 'Gastos Generales', monto: totales.gastosGenerales },
                    { descripcion: 'Gastos Fijos', monto: totales.gastosFijos },
                    { descripcion: 'Supervisión', monto: totales.supervision },
                    { descripcion: 'GG Supervisión', monto: totales.gastosSupervision },
                    { descripcion: 'Remuneraciones', monto: totales.remuneraciones },
                    { descripcion: 'Control Concurrente', monto: totales.controlConcurrente },
                    { descripcion: 'Fianzas', monto: totales.fianzas }
                ];

                let totalGeneral = 0;
                items.forEach((item) => {
                    const currentRowObj = resumenSheet.getRow(row);
                    currentRowObj.getCell(2).value = item.descripcion;
                    currentRowObj.getCell(2).style = styles.datatable;
                    currentRowObj.getCell(3).value = item.monto;
                    currentRowObj.getCell(3).style = styles.number;
                    totalGeneral += item.monto || 0;
                    row++;
                });

                // Fila de total
                const totalRow = resumenSheet.getRow(row);
                totalRow.getCell(2).value = 'Total General';
                totalRow.getCell(2).style = styles.totalHeader;
                totalRow.getCell(3).value = totalGeneral;
                totalRow.getCell(3).style = styles.subtotal;

                return totalGeneral;
            } catch (error) {
                console.error('Error al escribir hoja Resumen:', error);
                throw error;
            }
        };

        try {
            // Escribir todas las hojas
            const totalConsolidado = await hojasconsolidado();
            const totalGastosGenerales = await hojasgastosgenerales(gastosGeneralesSheet, gastos_generales, 'GASTOS GENERALES', costoDirecto);
            const totalGastosFijos = await hojasgastosFijos(gastosFijosSheet, gastos_fijos, 'GASTOS FIJOS', costoDirecto);
            const totalSupervision = await hojassupervision(supervisionSheet, supervision, 'SUPERVISIÓN', costoDirecto);
            const totalGastosSupervision = await hojasgastossupervision(gastossupervisionSheet, supervision, 'GG SUPERVISIÓN', costoDirecto);
            const totalRemuneraciones = await hojasremuneraciones(remuneracionesSheet, remuneraciones, 'REMUNERACIONES DEL PERSONAL PROFESIONAL Y TÉCNICO', costoDirecto);
            const totalControlConcurrente = await hojascontrolconcurrente(controlConcurrenteSheet, control_concurrente, 'CONTROL CONCURRENTE', costoDirecto);
            //const totalFianzas = await escribirFianzas();

            // Escribir la hoja de resumen con los totales
            const totales = {
                consolidado: totalConsolidado,
                gastosGenerales: totalGastosGenerales,
                gastosFijos: totalGastosFijos,
                supervision: totalSupervision,
                gastosSupervision: totalGastosSupervision,
                remuneraciones: totalRemuneraciones,
                controlConcurrente: totalControlConcurrente,
                //fianzas: totalFianzas
            };

            await escribirResumen(totales);

            // Exportar el archivo Excel
            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Gastos-Generales.xlsx';
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error general al exportar gastos generales:', error);
            alert('Error al exportar el archivo de Gastos Generales. Por favor, intenta de nuevo.');
        }
    }
}

export default Table;