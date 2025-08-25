class ettp {
    constructor() {
        this.table = null;
        this.datosBase = [];
        this.descriptivosTemplates = [];
        this.selectedRowId = null;
        this.selectedRow = null; // Agregar referencia a la fila seleccionada
        // Iniciar carga de datos
        this.initializeData();
    }

    async initializeData() {
        try {
            // Intentar cargar datos del servidor primero
            await this.getDataServidor();
        } catch (error) {
            console.error("Error cargando datos del servidor:", error);
            this.datosBase = this.getDefaultData();
        } finally {
            // Inicializar la tabla con los datos disponibles
            this.init();
            // Configurar el manejador para cargar datos desde checkboxes
            this.setupDataLoadingFromCheckboxes();
        }
    }

    getDefaultData() {
        return [
            {
                "id": 1,
                "item": "05",
                "descripcion": "INSTALACIONES ELECTRICAS",
                "unidad": "",
                "_children": [
                    {
                        "id": 2,
                        "item": "05.01",
                        "descripcion": "CONEXION A LA RED EXTERNA DE SUMINISTRO DE ENERGIA ELECTRICA",
                        "unidad": "",
                        "_children": [
                            {
                                "id": 3,
                                "item": "05.01.01",
                                "descripcion": "ACOMETIDA MONO.FÁSICA DE ENERGÍA ELÉCTRICA DE RED SECUNDARIA CON MEDIDOR.",
                                "unidad": "GLB",
                            },
                            {
                                "id": 4,
                                "item": "05.01.02",
                                "descripcion": "Acondicionamiento de tubo de FG, tubo PVC y baston para acometida.",
                                "unidad": "GLB",
                            }
                        ]
                    }
                ]
            }
        ];
    }

    init() {
        this.getConfiguracion();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('savedata').addEventListener('click', () => this.exportarDatos());

        // Inicializar estado de checkboxes
        const checkboxesEstado = {
            estructura: document.getElementById('estructura')?.checked || false,
            arquitectura: document.getElementById('arquitectura')?.checked || false,
            sanitarias: document.getElementById('sanitarias')?.checked || false,
            electricas: document.getElementById('electricas')?.checked || false,
            comunicaciones: document.getElementById('comunicaciones')?.checked || false,
            gas: document.getElementById('gas')?.checked || false,
        };

        // Función para actualizar el estado de los checkboxes
        const actualizarEstadoCheckbox = (id, valor) => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkboxesEstado[id] = valor;
            }
        };

        // Event listeners para cada checkbox
        document.getElementById('estructura').addEventListener('change', (event) => {
            actualizarEstadoCheckbox('estructura', event.target.checked);
        });
        document.getElementById('arquitectura').addEventListener('change', (event) => {
            actualizarEstadoCheckbox('arquitectura', event.target.checked);
        });
        document.getElementById('sanitarias').addEventListener('change', (event) => {
            actualizarEstadoCheckbox('sanitarias', event.target.checked);
        });
        document.getElementById('electricas').addEventListener('change', (event) => {
            actualizarEstadoCheckbox('electricas', event.target.checked);
        });
        document.getElementById('comunicaciones').addEventListener('change', (event) => {
            actualizarEstadoCheckbox('comunicaciones', event.target.checked);
        });
        document.getElementById('gas').addEventListener('change', (event) => {
            actualizarEstadoCheckbox('gas', event.target.checked);
        });

        document.getElementById('generar_word').addEventListener('click', () => {
            document.getElementById('modalWord').classList.add('hidden');

            for (const seccionId in checkboxesEstado) {
                if (checkboxesEstado[seccionId]) {
                    const seccionValue = document.getElementById(seccionId).value.trim();
                    console.log('Generando Word para la sección:', seccionValue);
                    const datosFiltradosParaSeccion = this.filterTreeData(this.table.getData(), seccionValue);
                    console.log(datosFiltradosParaSeccion);
                    this.generarWordParaSeccion(datosFiltradosParaSeccion, seccionValue);
                }
            }
        });
    }

    setupDataLoadingFromCheckboxes() {
        const fetchMetradosData = async (proyectoId, selectedOptions, token) => {
            try {
                $("#loading-indicator").show();

                const response = await $.ajax({
                    url: '/obtener-metrados-ettp',
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

                $("#loading-indicator").hide();

                if (response.error) {
                    this.showNotification('error', response.error);
                    return [];
                }

                if (response.warning) {
                    this.showNotification('warning', response.warning);
                    return [];
                }

                if (response.data && Array.isArray(response.data)) {
                    return response.data;
                }

                if (Array.isArray(response)) {
                    return response;
                }

                return [];
            } catch (error) {
                $("#loading-indicator").hide();

                if (error.responseJSON && error.responseJSON.error) {
                    this.showNotification('error', error.responseJSON.error);
                } else {
                    this.showNotification('error', 'Error al cargar los datos. Por favor, inténtelo de nuevo.');
                }

                return [];
            }
        };

        const organizeAndSortData = (data) => {
            if (!Array.isArray(data) || data.length === 0) {
                return [];
            }

            let organizedData = [...data];

            try {
                organizedData.sort((a, b) => (a.nivel ?? 0) - (b.nivel ?? 0));

                const idMap = new Map();
                organizedData.forEach(item => idMap.set(item.id, item));

                const processedIds = new Set();

                organizedData.forEach(item => {
                    if (item.parent_id && idMap.has(item.parent_id)) {
                        const parent = idMap.get(item.parent_id);

                        if (!parent._children) parent._children = [];

                        if (!parent._children.some(child => child.id === item.id)) {
                            parent._children.push(item);
                        }

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
                event.preventDefault();

                this.table.clearData();

                const proyectoId = $("#proyecto_id").val();

                if (!proyectoId) {
                    this.showNotification('error', 'Debe seleccionar un proyecto');
                    resolve(this.datosBase);
                    return;
                }

                const token = localStorage.getItem("auth_token");

                const selectedOptions = {
                    estructura: $("#estructura-checkbox").is(":checked") ? 1 : 0,
                    arquitectura: $("#arquitectura-checkbox").is(":checked") ? 1 : 0,
                    sanitarias: $("#sanitarias-checkbox").is(":checked") ? 1 : 0,
                    electricas: $("#electricas-checkbox").is(":checked") ? 1 : 0,
                    comunicacion: $("#comunicacion-checkbox").is(":checked") ? 1 : 0,
                    gas: $("#gas-checkbox").is(":checked") ? 1 : 0
                };

                const hasSelection = Object.values(selectedOptions).some(value => value === 1);

                if (!hasSelection) {
                    this.showNotification('error', 'Debe seleccionar al menos una categoría');
                    resolve(this.datosBase);
                    return;
                }

                try {
                    $("#processing-indicator").show();

                    const rawData = await fetchMetradosData(proyectoId, selectedOptions, token);
                    console.log("Datos obtenidos del servidor:", rawData);

                    const processedData = organizeAndSortData(rawData);
                    console.log("Datos procesados:", processedData);

                    $("#processing-indicator").hide();

                    if (Array.isArray(processedData) && processedData.length > 0) {
                        this.table.setData(processedData)
                            .then(() => {
                                this.showNotification('success', 'Datos cargados correctamente');
                                resolve(processedData);
                            })
                            .catch(error => {
                                console.error("Error al establecer datos en la tabla:", error);
                                this.showNotification('error', 'Error al renderizar la tabla');
                                resolve(processedData); // Resolve even on table set error to continue flow
                            });
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

            // Resolve con los datos base iniciales para que el constructor continúe
            resolve(this.datosBase);
        });
    }

    getDataServidor() {
        return new Promise((resolve, reject) => {
            const id_especificacionestecnicas = document.getElementById('id_especificacionestecnicas')?.value;

            if (!id_especificacionestecnicas) {
                console.warn("No se encontró ID de especificaciones técnicas");
                this.datosBase = this.getDefaultData();
                resolve();
                return;
            }

            $.ajax({
                url: '/obtener-especificaciones-tecnicas',
                method: 'POST',
                data: JSON.stringify({ id: id_especificacionestecnicas }),
                contentType: 'application/json',
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: (response) => {
                    try {
                        if (response?.data) {
                            const parsedData = typeof response.data === 'string' ?
                                JSON.parse(response.data) : response.data;

                            this.datosBase = Array.isArray(parsedData) ?
                                parsedData : this.getDefaultData();
                        } else {
                            this.datosBase = this.getDefaultData();
                        }
                        resolve();
                    } catch (e) {
                        console.error("Error al procesar datos:", e);
                        this.datosBase = this.getDefaultData();
                        resolve();
                    }
                },
                error: (xhr) => {
                    console.error('Error en la llamada AJAX:', xhr.responseText);
                    this.datosBase = this.getDefaultData();
                    reject(xhr.responseText);
                }
            });
        });
    }

    showNotification(type, message) {
        if (typeof toastr !== 'undefined') {
            toastr[type](message);
        } else {
            if (type === 'error') {
                Swal.fire({
                    title: "Error en procesar datos",
                    text: message,
                    icon: "error"
                });
            } else if (type === 'warning') {
                Swal.fire({
                    title: "Advertencia",
                    text: message,
                    icon: "warning"
                });
            } else {
                Swal.fire({
                    title: message,
                    icon: "success"
                });
            }
        }
    }

    getConfiguracion() {
        this.table = new Tabulator("#tabla_ettp", {
            data: this.datosBase, // Usar this.datosBase aquí
            dataTree: true,
            dataTreeStartExpanded: false, // Cambiado a false para mejorar rendimiento inicial
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
            dataLoaded: (data) => {
                this.updateTotals();
            },
            rowUpdated: (row) => {
                this.updateTotals();
            },
            columns: [
                {
                    title: "Items",
                    field: "item",
                    width: 250,
                    editor: "input",
                    editable: function (cell) { return !cell.getRow().getData().isStatic; },
                    // cellEdited: (cell) => {
                    //     this.autocompletarDescripcion(cell.getRow());
                    // }
                },
                {
                    title: "Descripcion",
                    field: "descripcion",
                    width: 400,
                    //editor: "input",
                    editable: function (cell) { return !cell.getRow().getData().isStatic; }
                },
                {
                    title: "Und",
                    field: "unidad",
                    width: 80,
                    editor: "input",
                    editable: function (cell) { return !cell.getRow().getData().isStatic; }
                },
                {
                    title: "",
                    width: 50,
                    formatter: function (cell) {
                        const data = cell.getRow().getData();
                        let buttons = "";
                        if (data.unidad) {
                            buttons += `<button class="btn-show-description" title="Ver/Editar Descripción">📋</button>`;
                        }
                        return buttons;
                    },
                    cellClick: (e, cell) => {
                        const row = cell.getRow();

                        if (e.target.classList.contains('btn-show-description')) {
                            e.stopPropagation(); // Detener la propagación del evento
                            this.showDescription(row);
                        }
                    }
                }
            ],
        });

        fetch('/assets/data/descriptivos-templates.json')
            .then(response => response.json())
            .then(data => {
                console.log(data);
                this.descriptivosTemplates = data;
            });
    }

    // Función mejorada para buscar en el JSON con estructura jerárquica
    buscarTemplateRecursivo(templates, codigoABuscar) {
        if (!templates || !Array.isArray(templates) || templates.length === 0) {
            return null;
        }

        // Normalizar para buscar
        const codigoNormalizado = codigoABuscar.toString().trim().toLowerCase();
        console.log("Buscando código normalizado:", codigoNormalizado);

        // Función de búsqueda recursiva interna
        const buscarEnNivel = (items) => {
            if (!items || !Array.isArray(items)) return null;

            // Primero búsqueda exacta
            for (const item of items) {
                // Debug para ver qué está comparando
                if (item.codigo_completo) {
                    console.log(`Comparando: "${item.codigo_completo.toString().trim().toLowerCase()}" con "${codigoNormalizado}"`);
                }

                // Verificar coincidencia exacta
                if (item.codigo_completo &&
                    item.codigo_completo.toString().trim().toLowerCase() === codigoNormalizado) {
                    console.log("¡Coincidencia exacta encontrada por codigo_completo!");
                    return item;
                }

                if (item.codigo &&
                    item.codigo.toString().trim().toLowerCase() === codigoNormalizado) {
                    console.log("¡Coincidencia exacta encontrada por codigo!");
                    return item;
                }

                // Si tiene subpartidas, buscar recursivamente
                if (item.subpartidas && item.subpartidas.length > 0) {
                    const encontrado = buscarEnNivel(item.subpartidas);
                    if (encontrado) return encontrado;
                }
            }

            // Si no hay coincidencias exactas, buscar parciales
            for (const item of items) {
                // Verificar coincidencia parcial
                if (item.codigo_completo &&
                    item.codigo_completo.toString().trim().toLowerCase().includes(codigoNormalizado)) {
                    console.log("¡Coincidencia parcial encontrada por codigo_completo!");
                    return item;
                }

                if (item.codigo &&
                    item.codigo.toString().trim().toLowerCase().includes(codigoNormalizado)) {
                    console.log("¡Coincidencia parcial encontrada por codigo!");
                    return item;
                }

                // Buscar en subpartidas para coincidencia parcial
                if (item.subpartidas && item.subpartidas.length > 0) {
                    const encontrado = buscarEnNivel(item.subpartidas);
                    if (encontrado) return encontrado;
                }
            }

            return null;
        };

        return buscarEnNivel(templates);
    }

    // Versión mejorada de showDescription
    showDescription(row) {
        const data = row.getData();
        this.selectedRow = row;

        // Verificar que los templates estén cargados
        if (!this.descriptivosTemplates || !Array.isArray(this.descriptivosTemplates) || this.descriptivosTemplates.length === 0) {
            console.error("Error: descriptivosTemplates no está disponible o está vacío");
            this.mostrarFormularioDetalles(data);
            return;
        }

        console.log("Datos del row:", data);
        console.log("Buscando template para item:", data.item);

        // Buscar en estructura jerárquica
        const template = this.buscarTemplateRecursivo(this.descriptivosTemplates, data.item);
        console.log("Template encontrado:", template);

        if (template) {
            this.mostrarTemplateEncontrado(template, data);
        } else {
            // Intento adicional: buscar solo por código sin el texto
            if (data.item && data.item.includes(" ")) {
                // Extraer solo el código numérico (asumiendo que el código está al principio)
                const codigoNumerico = data.item.split(" ")[0];
                console.log("Realizando búsqueda secundaria por código numérico:", codigoNumerico);

                const templatePorCodigo = this.buscarTemplateRecursivo(this.descriptivosTemplates, codigoNumerico);

                if (templatePorCodigo) {
                    console.log("Template encontrado por código numérico:", templatePorCodigo);
                    this.mostrarTemplateEncontrado(templatePorCodigo, data);
                    return;
                }
            }

            this.mostrarFormularioDetalles(data);
        }
    }

    // Función auxiliar para búsqueda parcial
    buscarParcialRecursivo(template, codigoABuscar) {
        const codigoNormalizado = codigoABuscar.trim().toLowerCase();

        // Verificar coincidencia parcial en el template actual
        if ((template.codigo_completo && template.codigo_completo.trim().toLowerCase().includes(codigoNormalizado)) ||
            (template.codigo && template.codigo.trim().toLowerCase().includes(codigoNormalizado))) {
            return template;
        }

        // Si tiene subpartidas, buscar recursivamente
        if (template.subpartidas && template.subpartidas.length > 0) {
            for (const subpartida of template.subpartidas) {
                const encontrado = this.buscarParcialRecursivo(subpartida, codigoABuscar);
                if (encontrado) return encontrado;
            }
        }

        return null;
    }

    mostrarTemplateEncontrado(template, data) {
        Swal.fire({
            title: '¡Plantilla encontrada!',
            text: `Se encontró una plantilla para el item ${data.item}. ¿Desea cargar los detalles?`,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Sí, cargar',
            cancelButtonText: 'No, mantener actual'
        }).then((result) => {
            if (result.isConfirmed) {
                // Campos que NO queremos copiar
                const camposExcluidos = [
                    'codigo',
                    'codigo_completo',
                    'nivel',
                    'subpartidas',
                    'titulo',
                    'unidad_medida',
                    'codigo_original',
                ];

                // Copiar todos los campos excepto los excluidos
                data.detallesTecnicos = {};
                Object.keys(template).forEach(campo => {
                    if (!camposExcluidos.includes(campo)) {
                        data.detallesTecnicos[campo] = template[campo];
                    }
                });

                // Actualizar la fila seleccionada con los detalles filtrados
                this.selectedRow.update(data);
            }

            // Mostrar los detalles en el formulario
            this.mostrarFormularioDetalles(data);
        });
    }

    mostrarFormularioDetalles(data) {
        const detallesTecnicos = data.detallesTecnicos || {};
        console.log("Detalles técnicos:", detallesTecnicos);
        const sections = Object.entries(detallesTecnicos).map(([key, value]) => {
            const title = key.split('_').map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            return this.createSectionHTML(title, value);
        }).join('');

        const descriptionContainer = document.getElementById('decripcion_ettp');
        let html = `
            <div class="p-4 text-gray-950 dark:text-gray-50 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h3 class="text-lg font-bold mb-4">${data.item} - ${data.descripcion}</h3>
                <div id="description-sections" class="rounded-lg border-collapse">
                    ${sections || this.getDefaultSections(detallesTecnicos)}
                </div>
                <div class="flex justify-between mt-4">
                    <button id="add-section" class="bg-blue-500 text-white px-4 py-2 rounded">
                        Agregar Sección
                    </button>
                    <button id="save-description" class="bg-green-500 text-white px-4 py-2 rounded">
                        Guardar
                    </button>
                </div>
            </div>
        `;

        descriptionContainer.innerHTML = html;
        this.setupDescriptionEventListeners();
    }

    getDefaultSections(detallesTecnicos) {
        return `
            ${this.createSectionHTML('Descripción', detallesTecnicos.descripcion)}
            ${this.createSectionHTML('Método de Ejecución', detallesTecnicos.metodo_de_ejecucion)}
            ${this.createSectionHTML('Método de Medición', detallesTecnicos.metodo_de_medicion)}
            ${this.createSectionHTML('Condiciones de Pago', detallesTecnicos.condiciones_de_pago)}
        `;
    }

    createSectionHTML(title, content = '') {
        return `
            <div class="mb-4 section-container">
                <div class="flex justify-between items-center mb-2">
                    <h4 class="font-bold section-title text-blue-600 dark:text-blue-300">${title}</h4>
                    <div>
                        <button class="delete-section text-red-600">🗑️</button>
                    </div>
                </div>
                <div class="content-editable border p-2" contenteditable="true">
                    ${content || 'Agregar contenido...'}
                </div>
            </div>
        `;
    }

    setupDescriptionEventListeners() {
        const container = document.getElementById('description-sections');

        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-section')) {
                const section = e.target.closest('.section-container');
                if (section && container.children.length > 1) {
                    section.remove();
                } else {
                    this.showNotification('warning', 'Debe mantener al menos una sección');
                }
            }
        });

        document.getElementById('add-section').addEventListener('click', () => {
            const newSectionTitle = prompt('Ingrese el título de la nueva sección:');
            if (newSectionTitle) {
                const newSection = this.createSectionHTML(newSectionTitle);
                container.insertAdjacentHTML('beforeend', newSection);
            }
        });

        document.getElementById('save-description').addEventListener('click', () => {
            this.saveDescription();
        });
    }

    saveDescription() {
        if (!this.selectedRow) {
            this.showNotification('error', 'No hay una fila seleccionada');
            return;
        }

        const sections = {};
        document.querySelectorAll('.section-container').forEach(section => {
            const titleElement = section.querySelector('.section-title');
            const contentElement = section.querySelector('.content-editable');
            if (titleElement && contentElement) {
                const title = titleElement.textContent;
                const key = title.toLowerCase().replace(/ /g, '_');
                sections[key] = contentElement.textContent.trim();
            }
        });

        const currentData = this.selectedRow.getData();
        currentData.detallesTecnicos = sections;
        this.selectedRow.update(currentData);

        Swal.fire({
            title: '¡Guardado exitoso!',
            text: 'Los detalles técnicos se han actualizado correctamente',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });
    }

    exportarDatos() {
        const id_especificacionestecnicas = document.getElementById('id_especificacionestecnicas').value;
        if (!id_especificacionestecnicas) {
            throw new Error('ID de ETTP no encontrado');
        }

        const datosGenerales = this.table.getData();
        console.log("Datos a guardar:", datosGenerales);

        const dataETTP = JSON.stringify({ especificaciones_tecnicas: datosGenerales });
        console.log("Datos a guardar:", dataETTP);

        $.ajax({
            url: `/guardar-especificaciones-tecnicas/${id_especificacionestecnicas}`,
            type: "POST",
            data: dataETTP,
            contentType: "application/json",
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
            },
            success: (response) => {
                Swal.fire({
                    title: "Éxito",
                    text: "Datos guardados correctamente",
                    icon: "success",
                    timer: 1500
                });
            },
            error: (xhr, status, error) => {
                console.error("Error al guardar:", error);
                Swal.fire({
                    title: "Error",
                    text: "No se pudieron guardar los datos",
                    icon: "error"
                });
            }
        });
    }

    //***************************************************EXPORT WORD*************************************************** */
    filterTreeData(data, seccion) {
        function findRootSectionAndDescendants(items, sectionName) {
            if (!items || items.length === 0) {
                return [];
            }

            // Buscar la sección principal que coincida con el nombre de la sección
            for (const item of items) {
                // Si encontramos la sección principal, devolvemos todo su árbol
                if (item.descripcion && item.descripcion.toLowerCase().includes(sectionName.toLowerCase())) {
                    return [JSON.parse(JSON.stringify(item))]; // Devolver una copia profunda
                }

                // Si no encontramos en este nivel, buscar en los hijos
                if (item._children && item._children.length > 0) {
                    const foundInChildren = findRootSectionAndDescendants(item._children, sectionName);
                    if (foundInChildren.length > 0) {
                        return foundInChildren;
                    }
                }
            }

            return []; // No se encontró la sección
        }

        try {
            return findRootSectionAndDescendants(data, seccion);
        } catch (error) {
            console.error('Error al filtrar datos:', error);
            return [];
        }
    }

    // ADDED: Missing function that was causing the error
    generateSectionsForSection(data, sectionName) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            return [new docx.Paragraph({ text: "No se encontraron datos para esta sección." })];
        }

        const sections = [];

        // Add title for the section
        sections.push(
            new docx.Paragraph({
                text: sectionName.toUpperCase(),
                heading: docx.HeadingLevel.HEADING_1,
                alignment: docx.AlignmentType.CENTER,
                bold: true,
                spacing: {
                    before: 400,
                    after: 200,
                },
            })
        );

        // Process all items in the hierarchy
        this.processHierarchicalItems(data, sections, 1);

        return sections;
    }

    async generarWordParaSeccion(datosFiltrados, nombreArchivoBase) {
        if (typeof docx === 'undefined') {
            alert("Error: La biblioteca docx no se ha cargado correctamente");
            return;
        }

        const { Document, Paragraph, TextRun, Header, Footer, AlignmentType, HeadingLevel,
            PageNumber, BorderStyle, SectionType, Table, TableRow, TableCell, WidthType,
            ImageRun, UnderlineType, RunFonts } = docx;

        const logoFile = document.getElementById('logoFile').files[0];
        const escudoFile = document.getElementById('escudoFile').files[0];
        const principalFile = document.getElementById('logoPrinFile').files[0];
        const firmaFile = document.getElementById('firmaFile').files[0];

        let logoDataUrl = null;
        let escudoDataUrl = null;
        let principalDataUrl = null;
        let firmaDataUrl = null;

        async function readFileAsDataURL(file) {
            return new Promise((resolve, reject) => {
                if (!file) {
                    resolve(null);
                    return;
                }
                const reader = new FileReader();
                reader.onload = (event) => {
                    resolve(event.target.result);
                };
                reader.onerror = (error) => {
                    reject(error);
                };
                reader.readAsDataURL(file);
            });
        }

        try {
            if (logoFile) {
                logoDataUrl = await readFileAsDataURL(logoFile);
            }

            if (escudoFile) {
                escudoDataUrl = await readFileAsDataURL(escudoFile);
            }
            if (principalFile) {
                principalDataUrl = await readFileAsDataURL(principalFile);
            }

            if (firmaFile) {
                firmaDataUrl = await readFileAsDataURL(firmaFile);
            }
        } catch (error) {
            console.error("Error al procesar las imágenes:", error);
        }

        const logoImageRun = logoDataUrl ? new ImageRun({
            data: logoDataUrl,
            transformation: { width: 70, height: 70 },
        }) : null;

        const escudoImageRun = escudoDataUrl ? new ImageRun({
            data: escudoDataUrl,
            transformation: { width: 70, height: 70 },
        }) : null;

        const principalImageRun = principalDataUrl ? new ImageRun({
            data: principalDataUrl,
            transformation: { width: 300, height: 400 },
        }) : null;

        const firmaImageRun = firmaDataUrl ? new ImageRun({
            data: firmaDataUrl,
            transformation: { width: 70, height: 70 },
        }) : null;

        // Create the header with a table to position elements
        const header = new Header({
            children: [
                new Table({
                    width: {
                        size: 100,
                        type: WidthType.PERCENTAGE,
                    },
                    // Set table-level borders to NONE
                    borders: {
                        top: { style: BorderStyle.NONE },
                        bottom: { style: BorderStyle.NONE },
                        left: { style: BorderStyle.NONE },
                        right: { style: BorderStyle.NONE },
                        insideHorizontal: { style: BorderStyle.NONE },
                        insideVertical: { style: BorderStyle.NONE },
                    },
                    rows: [
                        new TableRow({
                            // Set row-level borders to NONE
                            borders: {
                                top: { style: BorderStyle.NONE },
                                bottom: { style: BorderStyle.NONE },
                                left: { style: BorderStyle.NONE },
                                right: { style: BorderStyle.NONE },
                            },
                            children: [
                                // Left logo cell
                                new TableCell({
                                    width: {
                                        size: 15,
                                        type: WidthType.PERCENTAGE,
                                    },
                                    // Explicitly set all cell borders to NONE
                                    borders: {
                                        top: { style: BorderStyle.NONE },
                                        bottom: { style: BorderStyle.NONE },
                                        left: { style: BorderStyle.NONE },
                                        right: { style: BorderStyle.NONE },
                                    },
                                    children: [
                                        new Paragraph({
                                            alignment: AlignmentType.LEFT,
                                            children: logoImageRun ? [logoImageRun] : [],
                                        }),
                                    ],
                                }),
                                // Center text cell
                                new TableCell({
                                    width: {
                                        size: 70,
                                        type: WidthType.PERCENTAGE,
                                    },
                                    // Explicitly set all cell borders to NONE
                                    borders: {
                                        top: { style: BorderStyle.NONE },
                                        bottom: { style: BorderStyle.NONE },
                                        left: { style: BorderStyle.NONE },
                                        right: { style: BorderStyle.NONE },
                                    },
                                    children: [
                                        new Paragraph({
                                            alignment: AlignmentType.CENTER,
                                            children: [
                                                new TextRun({
                                                    text: "MEJORAMIENTO DE LOS SERVICIOS DE EDUCACION INICIAL DE LA IEI N° 358 CIUDAD DE CONTAMANA DEL DISTRITO DE CONTAMANA- PROVINCIA DE UCAYALI – DEPARTAMENTO DE LORETO",
                                                    bold: true,
                                                    size: 16,
                                                    color: "#000000",
                                                    font: "Arial",
                                                }),
                                            ],
                                        }),
                                        new Paragraph({
                                            alignment: AlignmentType.CENTER,
                                            children: [
                                                new TextRun({
                                                    text: "CUI: 2484411; CÓDIGO MODULAR: 0651216; CÓDIGO LOCAL: 390867",
                                                    bold: true,
                                                    size: 16,
                                                    color: "#000000",
                                                    font: "Arial",
                                                }),
                                            ],
                                        }),
                                        new Paragraph({
                                            alignment: AlignmentType.CENTER,
                                            children: [
                                                new TextRun({
                                                    text: "I.E.I:358; UNIDAD EJECUTORA: MUNICIPALIDAD PROVINCIAL DE UCAYALI",
                                                    bold: true,
                                                    size: 16,
                                                    color: "#000000",
                                                    font: "Arial",
                                                }),
                                            ],
                                        }),
                                    ],
                                }),
                                // Right logo cell
                                new TableCell({
                                    width: {
                                        size: 15,
                                        type: WidthType.PERCENTAGE,
                                    },
                                    // Explicitly set all cell borders to NONE
                                    borders: {
                                        top: { style: BorderStyle.NONE },
                                        bottom: { style: BorderStyle.NONE },
                                        left: { style: BorderStyle.NONE },
                                        right: { style: BorderStyle.NONE },
                                    },
                                    children: [
                                        new Paragraph({
                                            alignment: AlignmentType.RIGHT,
                                            children: escudoImageRun ? [escudoImageRun] : [],
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    ],
                }),
                // Add a border line after the table
                new Paragraph({
                    border: {
                        bottom: { color: "#000000", space: 1, style: BorderStyle.SINGLE, size: 1 },
                    },
                    children: [new TextRun("")],
                }),
            ],
        });

        // Create the document with necessary sections
        const documentSections = [{
            properties: {
                type: SectionType.NEW_PAGE,  // Start on a new page
                page: {
                    size: {
                        width: 8.5 * 1440,    // Letter width in twips (8.5 inches)
                        height: 11 * 1440,    // Letter height in twips (11 inches)
                    },
                    margin: {
                        top: 1000,
                        right: 1000,
                        bottom: 1000,
                        left: 1000
                    },
                },
            },
            headers: {
                default: header,
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.LEFT,
                            children: firmaImageRun ? [firmaImageRun] : [],
                        }),
                        new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                                new TextRun({
                                    text: "Página ",
                                    bold: true,
                                    color: "#000000",
                                    font: "Arial",
                                }),
                                new TextRun({
                                    children: [PageNumber.CURRENT],
                                    bold: true,
                                    color: "#000000",
                                    font: "Arial",
                                }),
                                new TextRun({
                                    text: " | ",
                                    bold: true,
                                    color: "#000000",
                                    font: "Arial",
                                }),
                                new TextRun({
                                    children: [PageNumber.TOTAL_PAGES],
                                    bold: true,
                                    color: "#000000",
                                    font: "Arial",
                                }),
                            ],
                        }),
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: "MUNICIPALIDAD PROVINCIAL DE UCAYALI",
                                    bold: true,
                                    color: "#000000",
                                    font: "Arial",
                                })
                            ],
                        }),
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: "CENTRO POBLADO DE CONTAMANA",
                                    color: "#000000",
                                    font: "Arial",
                                })
                            ],
                        }),
                    ],
                }),
            },
        }];

        // Generate the cover page (first section)
        //const coverPageSections = await this.generateCoverPage(nombreArchivoBase, logoFile, firmaFile, principalFile);
        const coverPageSections = await this.generateCoverPage(nombreArchivoBase, principalFile, firmaFile);

        documentSections[0].children = coverPageSections;

        // Add table of contents (second section)
        documentSections.push({
            properties: {
                type: SectionType.NEW_PAGE,
                page: {
                    size: {
                        width: 8.5 * 1440,
                        height: 11 * 1440,
                    },
                    margin: {
                        top: 1000,
                        right: 1000,
                        bottom: 1000,
                        left: 1000
                    },
                },
            },
            headers: {
                default: header,
            },
            footers: {
                default: documentSections[0].footers.default,
            },
            children: this.generateTableOfContents(),
        });

        // Add content section (third section)
        documentSections.push({
            properties: {
                type: SectionType.CONTINUOUS,
                page: {
                    size: {
                        width: 8.5 * 1440,
                        height: 11 * 1440,
                    },
                    margin: {
                        top: 1000,
                        right: 1000,
                        bottom: 1000,
                        left: 1000
                    },
                },
            },
            headers: {
                default: header,
            },
            footers: {
                default: documentSections[0].footers.default,
            },
            children: this.generateSectionsForSection(datosFiltrados, nombreArchivoBase),
        });

        const doc = new Document({
            styles: {
                default: {
                    document: {
                        run: {
                            font: "Arial",
                            color: "#000000",
                            size: 24, // 12pt
                        },
                    },
                    paragraph: {
                        spacing: {
                            line: 276, // 1.15 line spacing
                        },
                    },
                },
                paragraphStyles: [
                    {
                        id: "Heading1",
                        name: "Heading 1",
                        basedOn: "Normal",
                        next: "Normal",
                        quickFormat: true,
                        run: {
                            font: "Arial",
                            size: 36, // 18pt
                            bold: true,
                            color: "#000000",
                        },
                        paragraph: {
                            spacing: {
                                before: 240, // 12pt
                                after: 120, // 6pt
                            },
                        },
                    },
                    {
                        id: "Heading2",
                        name: "Heading 2",
                        basedOn: "Normal",
                        next: "Normal",
                        quickFormat: true,
                        run: {
                            font: "Arial",
                            size: 30, // 15pt
                            bold: true,
                            color: "#000000",
                        },
                        paragraph: {
                            spacing: {
                                before: 240, // 12pt
                                after: 120, // 6pt
                            },
                        },
                    },
                    {
                        id: "Heading3",
                        name: "Heading 3",
                        basedOn: "Normal",
                        next: "Normal",
                        quickFormat: true,
                        run: {
                            font: "Arial",
                            size: 26, // 13pt
                            bold: true,
                            color: "#000000",
                        },
                        paragraph: {
                            spacing: {
                                before: 240, // 12pt
                                after: 120, // 6pt
                            },
                        },
                    },
                ],
            },
            sections: documentSections,
        });

        try {
            docx.Packer.toBlob(doc).then(blob => {
                saveAs(blob, `especificaciones_tecnicas_${nombreArchivoBase.replace(/ /g, '_')}.docx`);
                console.log(`Documento para sección ${nombreArchivoBase} generado con éxito!`);
            });
        } catch (error) {
            console.error("Error al generar el documento:", error);
            alert("Error al generar el documento Word: " + error.message);
        }
    }

    async generateCoverPage(sectionName, principalFile, signatureFile) {
        const sections = [];

        // Convert image files to data URLs
        const principalDataUrl = principalFile ? await this.readFileAsDataURL(principalFile) : null;
        const signatureDataUrl = signatureFile ? await this.readFileAsDataURL(signatureFile) : null;

        // Title with underline
        sections.push(
            new docx.Paragraph({
                children: [
                    new docx.TextRun({
                        text: `ESPECIFICACIONES TECNICAS-${sectionName.toUpperCase()}`,
                        bold: true,
                        size: 44,
                        font: "Arial",
                        color: "#000000",
                        underline: {
                            type: docx.UnderlineType.SINGLE,
                        },
                    }),
                ],
                alignment: docx.AlignmentType.CENTER,
                spacing: {
                    after: 200,
                },
            })
        );

        // Add a horizontal line
        sections.push(
            new docx.Paragraph({
                text: "",
                border: {
                    bottom: {
                        color: "#000000",
                        space: 1,
                        style: docx.BorderStyle.SINGLE,
                        size: 1,
                    },
                },
                spacing: {
                    after: 400,
                },
            })
        );

        // Project information - centered and bold
        sections.push(
            new docx.Paragraph({
                children: [
                    new docx.TextRun({
                        text: "PROYECTO:",
                        bold: true,
                        font: "Arial",
                        size: 28,
                        color: "#000000",
                    }),
                    new docx.TextRun({
                        text: "\t", // Tabulación
                        font: "Arial",
                        size: 28,
                    }),
                    new docx.TextRun({
                        text: "MEJORAMIENTO DE LOS SERVICIOS DE EDUCACION INICIAL DE LA IEI N°558 CIUDAD DE CONTAMANA DEL DISTRITO DE CONTAMANA-PROVINCIA DE UCAYALI - DEPARTAMENTO DE LORETO",
                        font: "Arial",
                        size: 28,
                        color: "#000000",
                    }),
                ],
                tabStops: [
                    {
                        type: docx.TabStopType.LEFT,
                        position: 1440, // 1 pulgada
                    },
                ],
                spacing: {
                    after: 400,
                    line: 360, // Espaciado entre líneas
                    lineRule: docx.LineRuleType.AUTO,
                },
                alignment: docx.AlignmentType.JUSTIFIED,
            })
        );

        // Create a table with two columns - left for info, right for image
        const coverTable = new docx.Table({
            width: {
                size: 100,
                type: docx.WidthType.PERCENTAGE,
            },
            borders: {
                top: { style: docx.BorderStyle.NONE },
                bottom: { style: docx.BorderStyle.NONE },
                left: { style: docx.BorderStyle.NONE },
                right: { style: docx.BorderStyle.NONE },
                insideHorizontal: { style: docx.BorderStyle.NONE },
                insideVertical: { style: docx.BorderStyle.NONE },
            },
            shading: {
                fill: "E6E6E6", // Light gray background
            },
            rows: [
                new docx.TableRow({
                    height: {
                        value: 7500, // Ajustar según la altura de la imagen (500 px aprox)
                        rule: docx.HeightRule.EXACT,
                    },
                    children: [
                        // Columna izquierda - detalles
                        new docx.TableCell({
                            width: {
                                size: 60,
                                type: docx.WidthType.PERCENTAGE,
                            },
                            verticalAlign: docx.VerticalAlign.CENTER,
                            children: [
                                this.crearParrafoDetalle("CÓDIGO UNIFICADO:", "2484411"),
                                this.crearParrafoDetalle("CÓDIGO MODULAR:", "0561216"),
                                this.crearParrafoDetalle("I.E.I. N°:", "558"),
                                this.crearParrafoDetalle("CÓDIGO LOCAL:", "390867"),
                                this.crearParrafoDetalle("DEPARTAMENTO:", "LORETO"),
                                this.crearParrafoDetalle("PROVINCIA:", "UCAYALI"),
                                this.crearParrafoDetalle("DISTRITO:", "CONTAMANA"),
                                this.crearParrafoDetalle("C.P.:", "CONTAMANA"),
                            ],
                            borders: this.sinBordes(),
                        }),

                        // Columna derecha - imagen
                        new docx.TableCell({
                            width: {
                                size: 40,
                                type: docx.WidthType.PERCENTAGE,
                            },
                            verticalAlign: docx.VerticalAlign.CENTER,
                            children: principalDataUrl ? [
                                new docx.Paragraph({
                                    alignment: docx.AlignmentType.CENTER,
                                    children: [
                                        new docx.ImageRun({
                                            data: principalDataUrl,
                                            transformation: {
                                                width: 300,
                                                height: 500,
                                            },
                                        }),
                                    ],
                                }),
                            ] : [new docx.Paragraph("")],
                            borders: this.sinBordes(),
                        }),
                    ],
                }),
            ],
        });

        sections.push(coverTable);

        return sections;
    }

    crearParrafoDetalle(titulo, descripcion) {
        return new docx.Paragraph({
            children: [
                new docx.TextRun({
                    text: `${titulo} `,
                    bold: true,
                    font: "Arial",
                    color: "#000000",
                }),
                new docx.TextRun({
                    text: descripcion,
                    font: "Arial",
                    color: "#000000",
                }),
            ],
            spacing: {
                after: 100,
                line: 750, // Esto configura el espaciado entre líneas a 2.5 (250% de la altura de línea normal)
                lineRule: docx.LineRuleType.AUTO // Asegura que sea un múltiplo de la altura de línea
            },
        });
    }

    sinBordes() {
        return {
            top: { style: docx.BorderStyle.NONE },
            bottom: { style: docx.BorderStyle.NONE },
            left: { style: docx.BorderStyle.NONE },
            right: { style: docx.BorderStyle.NONE },
        };
    }

    // Helper function to read files as data URLs
    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                resolve(null);
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                resolve(event.target.result);
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsDataURL(file);
        });
    }

    // Generate table of contents
    generateTableOfContents() {
        const sections = [];

        // Title
        sections.push(
            new docx.Paragraph({
                children: [
                    new docx.TextRun({
                        text: "TABLA DE CONTENIDO",
                        bold: true,
                        font: "Arial",
                        size: 24,
                        color: "#000000",
                    }),
                ],
                heading: docx.HeadingLevel.HEADING_1,
                alignment: docx.AlignmentType.CENTER,
                spacing: {
                    after: 400,
                },
            })
        );

        // Add TOC field
        sections.push(
            new docx.TableOfContents("Tabla de Contenido", {
                hyperlink: true,
                headingStyleRange: "1-5",
                size: 24,
                color: "#000000",
            })
        );

        return sections;
    }

    // Función para procesar los elementos manteniendo la jerarquía completa
    processHierarchicalItems(items, sections, level) {
        if (!items || !Array.isArray(items) || items.length === 0) return;

        items.forEach(item => {
            if (!item) return;

            // Determinar el nivel de encabezado basado en la profundidad
            let headingLevel;
            switch (level) {
                case 1: headingLevel = docx.HeadingLevel.HEADING_1; break;
                case 2: headingLevel = docx.HeadingLevel.HEADING_2; break;
                default: headingLevel = docx.HeadingLevel.HEADING_3; break;
            }

            // Agregar el ítem actual con su formato apropiado según el nivel
            sections.push(
                new docx.Paragraph({
                    children: [
                        new docx.TextRun({
                            text: `${item.item || ''} ${item.descripcion || ''}`.trim(),
                            bold: true,
                            font: "Arial Narrow",
                            color: "#000000",
                            size: 24,
                        }),
                    ],
                    heading: headingLevel,
                    spacing: {
                        before: 300,
                        after: 100,
                        line: 480, // Espaciado entre líneas de 1.15 (aproximadamente 1.15 en puntos)
                    },
                    // Para el nivel 1, centrar el texto
                    ...(level === 1 ? { alignment: docx.AlignmentType.LEFT } : {})
                })
            );

            // Agregar unidad de medida y metrado si existen
            if (item.unidad) {
                sections.push(
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "(Unidad de medida: " + item.unidad + ")",
                                font: "Arial Narrow",
                                size: 22,
                                color: "#000000",
                            }),
                        ],
                        spacing: {
                            line: 480, // Espaciado entre líneas de 1.15
                        },
                    })
                );
            }

            if (item.metrado) {
                sections.push(
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: "Metrado: " + item.metrado,
                                font: "Arial Narrow",
                                size: 24,
                                color: "#000000",
                            }),
                        ],
                        spacing: {
                            after: 200,
                            line: 480,
                        },
                        indent: {
                            left: 720, // Add 0.5 inch indentation for the content
                            firstLine: 0,
                        },
                    })
                );
            }

            // Agregar detalles técnicos si existen
            if (item.detallesTecnicos) {
                this.addTechnicalDetails(item.detallesTecnicos, sections);
            }

            // Procesar hijos recursivamente
            if (item._children && item._children.length > 0) {
                this.processHierarchicalItems(item._children, sections, level + 1);
            }
        });
    }

    // Función para agregar detalles técnicos
    addTechnicalDetails(detallesTecnicos, sections) {
        if (!detallesTecnicos || typeof detallesTecnicos !== 'object') return;

        // Descripción
        if (detallesTecnicos.descripcion) {
            sections.push(
                new docx.Paragraph({
                    children: [
                        new docx.TextRun({
                            text: "DESCRIPCIÓN:",
                            bold: true,
                            font: "Arial Narrow",
                            size: 24,
                            color: "#000000",
                        }),
                    ],
                    spacing: {
                        after: 200,
                        line: 480,
                    },
                    indent: {
                        left: 720, // Add 0.5 inch indentation for the content
                        firstLine: 0,
                    },
                })
            );
            sections.push(
                new docx.Paragraph({
                    children: [
                        new docx.TextRun({
                            text: detallesTecnicos.descripcion,
                            font: "Arial Narrow",
                            size: 24,
                            color: "#000000",
                        }),
                    ],
                    spacing: {
                        after: 200,
                        line: 480,
                    },
                    indent: {
                        left: 720, // Add 0.5 inch indentation for the content
                        firstLine: 0,
                    },
                })
            );
        }

        // Materiales - buscar clave que contenga "materiales" o similares
        const materialesKey = Object.keys(detallesTecnicos).find(key =>
            key.toLowerCase().includes('material') ||
            key.toLowerCase().includes('herramienta')
        );

        if (materialesKey) {
            sections.push(
                new docx.Paragraph({
                    children: [
                        new docx.TextRun({
                            text: "MATERIALES:",
                            bold: true,
                            size: 24,
                            font: "Arial Narrow",
                            color: "#000000",
                        }),
                    ],
                    spacing: {
                        after: 200,
                        line: 480,
                    },
                    indent: {
                        left: 720, // Add 0.5 inch indentation for the content
                        firstLine: 0,
                    },
                })
            );

            const materiales = detallesTecnicos[materialesKey];
            if (Array.isArray(materiales)) {
                materiales.forEach(material => {
                    sections.push(
                        new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: "- " + material,
                                    font: "Arial Narrow",
                                    size: 24,
                                    color: "#000000",
                                }),
                            ],
                            spacing: {
                                after: 200,
                                line: 480,
                            },
                            indent: {
                                left: 720, // Add 0.5 inch indentation for the content
                                firstLine: 0,
                            },
                        })
                    );
                });
            } else if (typeof materiales === 'string') {
                sections.push(
                    new docx.Paragraph({
                        children: [
                            new docx.TextRun({
                                text: materiales,
                                font: "Arial Narrow",
                                size: 24,
                                color: "#000000",
                            }),
                        ],
                        spacing: {
                            after: 200,
                            line: 480,
                        },
                        indent: {
                            left: 720, // Add 0.5 inch indentation for the content
                            firstLine: 0,
                        },
                    })
                );
            }

            sections.push(new docx.Paragraph({ text: "", spacing: { after: 100 } }));
        }

        // Método de ejecución
        const metodoEjecucionKey = Object.keys(detallesTecnicos).find(key =>
            key.toLowerCase().includes('ejecucion') ||
            key.toLowerCase().includes('ejecución') ||
            key.toLowerCase().includes('método_de_ejecucion')
        );

        if (metodoEjecucionKey) {
            sections.push(
                new docx.Paragraph({
                    children: [
                        new docx.TextRun({
                            text: "MÉTODO DE EJECUCIÓN:",
                            bold: true,
                            font: "Arial Narrow",
                            size: 24,
                            color: "#000000",
                        }),
                    ],
                    spacing: {
                        after: 200,
                        line: 480,
                    },
                    indent: {
                        left: 720, // Add 0.5 inch indentation for the content
                        firstLine: 0,
                    },
                })
            );
            sections.push(
                new docx.Paragraph({
                    children: [
                        new docx.TextRun({
                            text: detallesTecnicos[metodoEjecucionKey],
                            font: "Arial Narrow",
                            size: 24,
                            color: "#000000",
                        }),
                    ],
                    spacing: {
                        after: 200,
                        line: 480,
                    },
                    indent: {
                        left: 720, // Add 0.5 inch indentation for the content
                        firstLine: 0,
                    },
                })
            );
        }

        // Método de medición
        const metodoMedicionKey = Object.keys(detallesTecnicos).find(key =>
            key.toLowerCase().includes('medicion') ||
            key.toLowerCase().includes('medición') ||
            key.toLowerCase().includes('método_de_medicion')
        );

        if (metodoMedicionKey) {
            sections.push(
                new docx.Paragraph({
                    children: [
                        new docx.TextRun({
                            text: "MÉTODO DE MEDICIÓN:",
                            bold: true,
                            size: 24,
                            font: "Arial Narrow",
                            color: "#000000",
                        }),
                    ],
                    spacing: {
                        after: 200,
                        line: 480,
                    },
                    indent: {
                        left: 720, // Add 0.5 inch indentation for the content
                        firstLine: 0,
                    },
                })
            );
            sections.push(
                new docx.Paragraph({
                    children: [
                        new docx.TextRun({
                            text: detallesTecnicos[metodoMedicionKey],
                            font: "Arial Narrow",
                            size: 24,
                            color: "#000000",
                        }),
                    ],
                    spacing: {
                        after: 200,
                        line: 480,
                    },
                    indent: {
                        left: 720, // Add 0.5 inch indentation for the content
                        firstLine: 0,
                    },
                })
            );
        }

        // Condiciones de pago
        const condicionesPagoKey = Object.keys(detallesTecnicos).find(key =>
            key.toLowerCase().includes('pago') ||
            key.toLowerCase().includes('condiciones_de_pago')
        );

        if (condicionesPagoKey) {
            sections.push(
                new docx.Paragraph({
                    children: [
                        new docx.TextRun({
                            text: "CONDICIONES DE PAGO:",
                            bold: true,
                            font: "Arial Narrow",
                            size: 24,
                            color: "#000000",
                        }),
                    ],
                    spacing: {
                        after: 200,
                        line: 480,
                    },
                    indent: {
                        left: 720, // Add 0.5 inch indentation for the content
                        firstLine: 0,
                    },
                })
            );
            sections.push(
                new docx.Paragraph({
                    children: [
                        new docx.TextRun({
                            text: detallesTecnicos[condicionesPagoKey],
                            font: "Arial Narrow",
                            size: 24,
                            color: "#000000",
                        }),
                    ],
                    spacing: {
                        after: 200,
                        line: 480,
                    },
                    indent: {
                        left: 720, // Add 0.5 inch indentation for the content
                        firstLine: 0,
                    },
                })
            );
        }
    }

    // Nueva función para manejar la generación de documentos para una sección específica
    async generateDocumentForSection(data, sectionName) {
        try {
            if (typeof docx === 'undefined') {
                alert("Error: La biblioteca docx no se ha cargado correctamente");
                return;
            }

            const { Document, Packer } = docx;

            // Filtrar datos para esta sección
            const datosFiltrados = this.filterTreeData(data, sectionName);

            if (!datosFiltrados || datosFiltrados.length === 0) {
                alert(`No se encontraron datos para la sección "${sectionName}"`);
                return;
            }

            // Generar el documento completo
            await this.generarWordParaSeccion(datosFiltrados, sectionName);

            return true;
        } catch (error) {
            console.error("Error al generar documento para sección:", error);
            alert(`Error al generar documento para la sección "${sectionName}": ${error.message}`);
            return false;
        }
    }

    // Función auxiliar para manejar errores de manera consistente
    handleError(message, error) {
        console.error(message, error);
        alert(`${message}: ${error.message}`);
    }

    // Función para validar la entrada de datos antes de generar el documento
    validateInputs() {
        // Verificar los archivos de imagen
        const logoFile = document.getElementById('logoFile')?.files[0];
        const escudoFile = document.getElementById('escudoFile')?.files[0];
        const firmaFile = document.getElementById('firmaFile')?.files[0];

        // No son obligatorios, pero podemos advertir al usuario
        if (!logoFile || !escudoFile || !firmaFile) {
            if (!confirm("Algunas imágenes no se han seleccionado. ¿Desea continuar sin ellas?")) {
                return false;
            }
        }

        return true;
    }

    // Función auxiliar para manejar la integración con la interfaz de usuario
    async processSelectedSection() {
        try {
            const sectionSelect = document.getElementById('sectionSelect');
            if (!sectionSelect) {
                throw new Error("No se encontró el selector de secciones");
            }

            const selectedSection = sectionSelect.value;
            if (!selectedSection) {
                alert("Por favor, seleccione una sección para generar el documento");
                return;
            }

            if (!this.validateInputs()) {
                return;
            }

            // Obtener datos desde donde sea que se estén almacenando
            const data = this.getData(); // Implementar esta función para obtener los datos

            // Mostrar indicador de carga
            const loadingIndicator = document.getElementById('loadingIndicator');
            if (loadingIndicator) {
                loadingIndicator.style.display = 'block';
            }

            // Generar el documento
            const success = await this.generateDocumentForSection(data, selectedSection);

            // Ocultar indicador de carga
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }

            if (success) {
                alert(`Documento para la sección "${selectedSection}" generado exitosamente`);
            }
        } catch (error) {
            this.handleError("Error al procesar la sección seleccionada", error);

            // Asegurarse de ocultar el indicador de carga en caso de error
            const loadingIndicator = document.getElementById('loadingIndicator');
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        }
    }

    // Implementación de función getData() para obtener los datos (esto dependerá de tu aplicación)
    getData() {
        // Aquí deberías implementar la lógica para obtener los datos de tu aplicación
        // Por ejemplo, podrías tener una variable global, un almacenamiento en localStorage, etc.

        // Ejemplo:
        if (window.appData && window.appData.treeData) {
            return window.appData.treeData;
        } else {
            // Si no hay datos disponibles, mostrar un error
            throw new Error("No se encontraron datos para generar el documento");
        }
    }
}

export default ettp;