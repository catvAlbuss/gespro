import Modulos from './modulos.js';
import Exterior from './exterior.js';
import Cisterna from './cisternate.js';

export default class Sistema {
    constructor() {
        this.processedData = {}
        this.modulosTables = [];
        this.modulosCount = parseInt(document.getElementById('modules').value || 0);
        this.exteriorTable = null;
        this.cisternaTable = null;
        this.resumenTable = null;
        // Initialize base styles early in the constructor or method
        //this.baseStyles = this.initializeBaseStyles();


        this.initializeListeners();
        this.initializeTables();
    }

    toRoman(num) {
        const romanos = [
            ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"],
            ["", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"],
            ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"]
        ];

        let centenas = Math.floor(num / 100);
        let decenas = Math.floor((num % 100) / 10);
        let unidades = num % 10;

        return romanos[2][centenas] + romanos[1][decenas] + romanos[0][unidades];
    }

    initializeListeners() {
        const modulesInput = document.getElementById('modules');
        modulesInput.addEventListener('change', (e) => {
            this.modulosCount = parseInt(e.target.value);
            console.log(this.modulosCount);
            // Regenerar las columnas y la tabla de resumen
            this.updateColumns();
            this.recreateModulesTables();
            this.updateResumenTable();
        });
        this.cargarMetrados();
    }

    formatDate(fechaStr) {  // Changed name to match the call
        const fecha = new Date(fechaStr);
        const meses = [
            'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
            'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
        ];
        return `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
    }

    async recreateModulesTables() {
        const modulosContainer = document.getElementById('modulos');
        if (!modulosContainer) {
            console.error('El contenedor de los módulos no existe');
            return;
        }

        modulosContainer.innerHTML = ''; // Limpiar
        this.modulosTables = [];

        // Determinar fuente de datos prioritaria
        let sourceData = this.getDataSource();

        if (sourceData.length === 0) {
            console.log('No hay módulos disponibles en ninguna fuente de datos.');
            return;
        }

        console.log(`Usando datos de: ${sourceData.source}`, sourceData.data);

        // Crear tablas basadas en la fuente de datos
        for (let i = 0; i < sourceData.data.length; i++) {
            const modulo = sourceData.data[i];
            const moduleName = modulo.nombre || `Módulo ${i + 1}`;
            const moduleData = modulo.datos || [];

            // Crear elementos DOM
            const moduleCard = this.createModuleCard(moduleName, i);
            modulosContainer.appendChild(moduleCard);

            // Crear tabla
            const tableContainer = moduleCard.querySelector(`#modulo-${i}`);
            const moduleTable = new Modulos(
                tableContainer.id,
                moduleData,
                () => this.updateResumenTable()
            );

            this.modulosTables.push(moduleTable);
        }

        console.log(`Tablas de módulos recreadas desde ${sourceData.source}:`, this.modulosTables.length);
    }

    generateSingleModuleData() {
        return [
            {
                id: 1, item: "04", descripcion: "INSTALACIONES SANITARIAS", totalnieto: 10, children: [
                    {
                        id: 2, item: "04.01", descripcion: "APARATOS SANITARIOS Y ACCESORIOS", totalnieto: 10, children: [
                            {
                                id: 3, item: "04.01.01", descripcion: "SUMINISTRO DE APARATOS SANITARIOS", totalnieto: 10, children: [
                                    {
                                        id: 4, item: "04.01.01.01", descripcion: "INODORO LOZA VITRIFICADO ONE PIECE COLOR BLANCO", unidad: "Und", totalnieto: 10, children: [
                                            { id: 5, item: "04.01.01.01.01", descripcion: "SS.HH. DOCENTES", unidad: "Und", elesimil: 0, largo: 0, ancho: 0, alto: 0, nveces: 1, longitud: 1.5, area: 2.3, volumen: 0, kg: 0, unidadcalculado: 0 },
                                        ]
                                    },
                                    {
                                        id: 6, item: "04.01.01.02", descripcion: "INODORO LOZA VITRIFICADO CON TANQUE COLOR BLANCO", unidad: "Und", totalnieto: 30, children: [
                                            { id: 7, item: "04.01.01.02.01", descripcion: "SS.HH. VARONES", unidad: "Und", elesimil: 0, largo: 0, ancho: 0, alto: 0, nveces: 6, longitud: 1.8, area: 2.5, volumen: 0, kg: 0, unidadcalculado: 0 },
                                            { id: 8, item: "04.01.01.02.02", descripcion: "SS.HH. MUJERES", unidad: "Und", elesimil: 0, largo: 0, ancho: 0, alto: 0, nveces: 3, longitud: 1.9, area: 2.6, volumen: 0, kg: 0, unidadcalculado: 0 },
                                            { id: 9, item: "04.01.01.02.03", descripcion: "SS.HH. DISCAPACITADOS", unidad: "Und", elesimil: 0, largo: 0, ancho: 0, alto: 0, nveces: 2, longitud: 1.6, area: 2.2, volumen: 0, kg: 0, unidadcalculado: 0 },
                                            { id: 10, item: "04.01.01.02.04", descripcion: "SS.HH. FAMILIAR", unidad: "Und", elesimil: 0, largo: 0, ancho: 0, alto: 0, nveces: 4, longitud: 2.0, area: 2.8, volumen: 0, kg: 0, unidadcalculado: 0 },
                                        ]
                                    },
                                ]
                            },
                        ]
                    },
                ]
            },
        ];
    }

    initializeTables() {
        const TableConfig = {
            colors: {
                hierarchyLevels: {
                    0: '#800080', // Purple for top-level
                    1: '#FF0000', // Red for children
                    2: '#0000FF', // Blue for grandchildren
                    3: '#000000', // Default black
                    4: '#008f39'  // Green for grandchildren with children
                }
            },
            // Utilities for coloring and hierarchy calculations
            utils: {
                getHierarchyColor: function (depth, hasChildren) {
                    if (depth === 3) { // Level 3 (grandchild)
                        return hasChildren ? TableConfig.colors.hierarchyLevels[4] : TableConfig.colors.hierarchyLevels[5];
                    }
                    if (depth === 4) { // Level 4 (great-grandchild)
                        return TableConfig.colors.hierarchyLevels[5];
                    }
                    return TableConfig.colors.hierarchyLevels[depth] || TableConfig.colors.hierarchyLevels[3];
                },
                calculateItemDepth: function (item) {
                    return (item.match(/\./g) || []).length;
                },
                hasChildren: function (cell, allData) {
                    const value = cell.getValue();
                    return allData.some(row => row.item.startsWith(`${value}.`));
                }
            }
        };

        // Recreate Modules Tables
        this.recreateModulesTables();

        // Exterior Table
        this.exteriorTable = new Exterior('exterior', () => this.updateResumenTable());

        // Cisterna Table
        this.cisternaTable = new Cisterna('cisternate', () => this.updateResumenTable());

        // Resumen Table (non-editable)
        this.resumenTable = new Tabulator("#resumen", {
            layout: "fitColumns",
            dataTree: true,
            dataTreeStartExpanded: true,
            dataTreeChildField: "children",
            columnHeaderVertAlign: "bottom",
            columns: [
                {
                    title: "Item", field: "item", width: 100, formatter: "money",
                    formatter: (cell) => {
                        const value = cell.getValue();
                        const depth = TableConfig.utils.calculateItemDepth(value);
                        const hasChildren = TableConfig.utils.hasChildren(cell, cell.getTable().getData());
                        const color = TableConfig.utils.getHierarchyColor(depth, hasChildren);
                        return `<span style="color: ${color};">${value}</span>`;
                    }
                },
                {
                    title: "Descripción", field: "descripcion", width: 250, formatter: "money",
                    formatter: function (cell) {
                        const rowData = cell.getData(); // Obtiene la fila completa
                        const depth = (rowData.item.match(/\./g) || []).length; // Calcula la profundidad basado en el campo "item"
                        const hasChildren = TableConfig.utils.hasChildren({ getValue: () => rowData.item }, cell.getTable().getData()); // Verifica si tiene hijos
                        const color = TableConfig.utils.getHierarchyColor(depth, hasChildren); // Obtiene el color basado en la profundidad y si tiene hijos
                        return `<span style="color: ${color};">${cell.getValue()}</span>`; // Retorna el valor con el color aplicado
                    }
                },
                { title: "Und.", field: "unidad", hozAlign: "center", headerVertical: true, with: 80, formatter: "money", hozAlign: "center" },
                ...this.generateModuleColumns(),
                { title: "Exterior", field: "exterior", headerVertical: true, formatter: "money", hozAlign: "center" },
                { title: "Cisterna", field: "cisterna", headerVertical: true, formatter: "money", hozAlign: "center" },
                {
                    title: "Total", field: "total", headerVertical: true, formatter: "money", hozAlign: "center",
                    formatter: function (cell) {
                        const rowData = cell.getData();
                        const depth = (rowData.item.match(/\./g) || []).length;
                        const color = TableConfig.utils.getHierarchyColor(depth);
                        return `<span style="color: ${color};">${cell.getValue()}</span>`;
                    }
                }
            ],
            reactiveData: true
        });

        // Initial update of resumen table
        this.updateResumenTable();
    }

    generateModuleColumns() {
        // Crear las columnas para cada módulo
        //console.log("Generando columnas con modulosCount:", this.modulosCount);
        return Array.from({ length: this.modulosCount }, (_, i) => {
            return {
                title: `Módulo ${this.toRoman(i + 1)}`,
                field: `modulo_${i + 1}`,
                formatter: "money",
                hozAlign: "center",
                headerVertical: true
            };
        });
    }

    updateColumns() {
        // Obtener las columnas estáticas
        const staticColumn1s = [
            {
                title: "Item", field: "item", width: 100
            },
            {
                title: "Descripción", field: "descripcion", width: 250
            },
            { title: "Und.", field: "unidad", editor: "list", hozAlign: "center", headerVertical: true, with: 80 },
        ];

        const staticColumn2s = [
            { title: "Exterior", field: "exterior", headerVertical: true },
            { title: "Cisterna", field: "cisterna", headerVertical: true },
            {
                title: "Total", field: "total", headerVertical: true
            }
        ];

        // Generar las nuevas columnas dinámicas de los módulos
        const dynamicColumns = this.generateModuleColumns();

        // Combinar las columnas estáticas y dinámicas
        const allColumns = [...staticColumn1s, ...dynamicColumns, ...staticColumn2s];

        // Si la tabla ya está creada, actualizamos las columnas
        if (this.resumenTable) {
            this.resumenTable.setColumns(allColumns);
        }
    }

    // Nuevo método para determinar la fuente de datos
    getDataSource() {
        // Prioridad 1: Datos procesados de Excel (si existen y son recientes)
        if (this.hasValidProcessedData()) {
            console.log('Usando datos procesados desde Excel');
            return {
                source: 'Excel',
                data: this.convertProcessedDataToModulesFormat()
            };
        }

        // Prioridad 2: Datos del servidor
        console.log('Usando datos desde el servidor');
        const serverData = this.getServerData();
        return {
            source: 'Servidor',
            data: serverData
        };
    }

    // Verificar si hay datos procesados válidos
    hasValidProcessedData() {
        if (!this.processedData || typeof this.processedData !== 'object') {
            return false;
        }

        // Verificar que haya al menos un módulo procesado
        const moduleKeys = Object.keys(this.processedData).filter(key =>
            key.startsWith('modulo_') || key.startsWith('modulo')
        );

        return moduleKeys.length > 0 && moduleKeys.some(key =>
            Array.isArray(this.processedData[key]) && this.processedData[key].length > 0
        );
    }

    // Convertir datos procesados al formato esperado por las tablas
    convertProcessedDataToModulesFormat() {
        const moduleKeys = Object.keys(this.processedData).filter(key =>
            key.startsWith('modulo_') || key.startsWith('modulo')
        );

        return moduleKeys.map((key, index) => ({
            nombre: key.replace(/_/g, ' ').toUpperCase(),
            datos: this.processedData[key] || []
        }));
    }

    // Obtener datos del servidor
    getServerData() {
        const inputElement = document.getElementById('datamodulos');
        const modulosData = inputElement ? inputElement.value : null;

        if (!modulosData) {
            console.error('El elemento #datamodulos no contiene datos válidos.');
            return [];
        }

        try {
            const modulosParse = JSON.parse(modulosData);
            if (!modulosParse.modulos || !Array.isArray(modulosParse.modulos)) {
                console.warn('La clave "modulos" no existe o no es un array. Se usará un array vacío.');
                return [];
            }
            return modulosParse.modulos;
        } catch (error) {
            console.error('Error al procesar el JSON del servidor:', error.message);
            return [];
        }
    }

    // Método auxiliar para crear cards de módulos
    createModuleCard(moduleName, index) {
        const moduleCard = document.createElement('div');
        moduleCard.classList.add('card', 'bg-white', 'shadow-md', 'rounded-lg', 'overflow-hidden', 'mb-6');

        const cardHeader = document.createElement('div');
        cardHeader.classList.add('card-header', 'bg-gray-100', 'p-4');

        const h3Element = document.createElement('h3');
        h3Element.classList.add('text-xl', 'font-semibold', 'text-gray-950');
        h3Element.textContent = moduleName;

        cardHeader.appendChild(h3Element);

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body', 'p-4');

        const tableContainer = document.createElement('div');
        tableContainer.id = `modulo-${index}`;

        cardBody.appendChild(tableContainer);
        moduleCard.appendChild(cardHeader);
        moduleCard.appendChild(cardBody);

        return moduleCard;
    }

    // Método mejorado para cargar metrados
    cargarMetrados() {
        console.log('Iniciando carga de metrados...');
        let selectedFile;
        const self = this;

        document.getElementById("fileUpload").addEventListener("change", function (event) {
            selectedFile = event.target.files[0];
        });

        // Evento al hacer clic en "Cargar Excel"
        document.getElementById("uploadExcel").addEventListener("click", function () {
            if (!selectedFile) {
                alert("Por favor, selecciona un archivo Excel.");
                return;
            }

            const cantidadModulos = parseInt(document.getElementById('modules').value || 0);
            if (cantidadModulos <= 0) {
                alert("Por favor, especifica una cantidad válida de módulos.");
                return;
            }

            let fileReader = new FileReader();
            fileReader.onload = function (event) {
                try {
                    let data = new Uint8Array(event.target.result);
                    let workbook = XLSX.read(data, { type: "array" });

                    console.log('Hojas disponibles:', workbook.SheetNames);

                    // Limpiar datos procesados anteriores
                    self.processedData = {};

                    // Procesar cada módulo
                    for (let i = 1; i <= cantidadModulos; i++) {
                        const sheetName = `MODULO ${self.toRoman(i)}`;

                        if (workbook.Sheets[sheetName]) {
                            console.log(`Procesando ${sheetName}...`);
                            const sheetData = self.processSheet(workbook.Sheets[sheetName], sheetName);
                            self.processedData[`modulo_${self.toRoman(i)}`] = sheetData;
                        } else {
                            console.warn(`No se encontró la hoja '${sheetName}'`);
                            self.processedData[`modulo_${self.toRoman(i)}`] = [];
                        }
                    }

                    // Procesar otras hojas
                    self.processOtherSheets(workbook);

                    // Verificar que se procesó al menos una hoja
                    if (Object.keys(self.processedData).length === 0) {
                        alert("No se encontraron hojas válidas para procesar.");
                        return;
                    }

                    console.log('Datos procesados desde Excel:', self.processedData);

                    // Recrear todas las tablas con los nuevos datos de Excel
                    self.recreateAllTables();

                    alert(`Proceso completado. Se procesaron ${Object.keys(self.processedData).length} hojas desde Excel.`);

                } catch (error) {
                    console.error('Error al procesar el archivo Excel:', error);
                    alert('Error al procesar el archivo Excel. Revisa la consola para más detalles.');
                }
            };

            fileReader.readAsArrayBuffer(selectedFile);
        });

        console.log('Función cargarMetrados inicializada correctamente');
    }

    // Nuevo método para procesar otras hojas (Exterior, Cisterna)
    processOtherSheets(workbook) {
        // Procesar hoja Exterior
        if (workbook.Sheets["EXTERIOR"]) {
            console.log('Procesando EXTERIOR...');
            const exteriorData = this.processSheet(workbook.Sheets["EXTERIOR"], "EXTERIOR");
            this.processedData.exterior = exteriorData;
        } else {
            console.warn("No se encontró la hoja 'EXTERIOR'");
        }

        // Procesar hoja Cisterna
        if (workbook.Sheets["CISTERNA Y TE"]) {
            console.log('Procesando CISTERNA Y TE...');
            const cisternaData = this.processSheet(workbook.Sheets["CISTERNA Y TE"], "CISTERNA Y TE");
            this.processedData.cisterna = cisternaData;
        } else {
            console.warn("No se encontró la hoja 'CISTERNA Y TE'");
        }
    }

    // Nuevo método para recrear todas las tablas
    recreateAllTables() {
        // Recrear tablas de módulos
        this.recreateModulesTables();

        // Actualizar tabla exterior si hay datos procesados
        if (this.processedData.exterior && this.exteriorTable) {
            this.exteriorTable.table.setData(this.processedData.exterior);
            console.log('Tabla Exterior actualizada con datos de Excel');
        }

        // Actualizar tabla cisterna si hay datos procesados
        if (this.processedData.cisterna && this.cisternaTable) {
            this.cisternaTable.table.setData(this.processedData.cisterna);
            console.log('Tabla Cisterna actualizada con datos de Excel');
        }

        // Actualizar tabla resumen
        this.updateResumenTable();
    }

    // Función para procesar una hoja individual (extraída del método original)
    processSheet(sheet, sheetName) {
        if (!sheet["!ref"]) {
            console.warn(`No se detectaron datos en la hoja '${sheetName}'.`);
            return [];
        }

        try {
            let rowObject = XLSX.utils.sheet_to_json(sheet, { defval: "" });
            let filteredData = rowObject.slice(8); // Comenzar desde la fila 9, índice 8
            let hierarchyData = this.buildHierarchy(filteredData, sheetName);

            console.log(`${sheetName}: ${hierarchyData.length} elementos procesados`);
            return hierarchyData;

        } catch (error) {
            console.error(`Error al procesar la hoja '${sheetName}':`, error);
            return [];
        }
    }

    // Función para construir la jerarquía (extraída del método original)
    buildHierarchy(data, sheetName) {
        let tree = [];
        let map = {};

        data.forEach((row, index) => {
            let {
                __EMPTY: nivel,
                __EMPTY_1: item,
                __EMPTY_2: descripcion,
                __EMPTY_3: unidad,
                __EMPTY_4: elesimil,
                __EMPTY_5: largo,
                __EMPTY_6: ancho,
                __EMPTY_7: alto,
                __EMPTY_8: nveces,
                __EMPTY_9: longitud,
                __EMPTY_10: area,
                __EMPTY_11: volumen,
                __EMPTY_12: kg,
                __EMPTY_13: unidadcalculado,
                __EMPTY_14: total,
            } = row;

            let isDescriptionRow = !item;
            let levels = (item || "").split(".");

            let node = {
                id: `${sheetName}_${index + 1}`,
                sheet: sheetName,
                item: item || "",
                descripcion: descripcion || "",
                unidad: unidad || "",
                elesimil: elesimil || "",
                largo: largo || "",
                ancho: ancho || "",
                alto: alto || "",
                nveces: nveces || "",
                longitud: longitud || "",
                area: area || "",
                volumen: volumen || "",
                kg: kg || "",
                unidadcalculado: unidadcalculado || "",
                totalnieto: total || "",
                isDescriptionRow: isDescriptionRow,
                children: []
            };

            if (isDescriptionRow) {
                let lastParent = Object.values(map).reverse().find(n => !n.isDescriptionRow);
                if (lastParent) {
                    lastParent.children.push(node);
                } else {
                    tree.push(node);
                }
                return;
            }

            let key = levels.join(".");
            map[key] = node;

            if (levels.length === 1) {
                tree.push(node);
            } else {
                let parentKey = levels.slice(0, -1).join(".");
                if (map[parentKey]) {
                    map[parentKey].children.push(node);
                }
            }
        });

        return tree;
    }

    // Método para limpiar datos procesados (útil para resetear)
    clearProcessedData() {
        this.processedData = {};
        console.log('Datos procesados limpiados');
    }

    // Método para verificar el estado actual de los datos
    getDataStatus() {
        return {
            hasProcessedData: this.hasValidProcessedData(),
            hasServerData: this.getServerData().length > 0,
            processedDataKeys: Object.keys(this.processedData || {}),
            currentSource: this.hasValidProcessedData() ? 'Excel' : 'Servidor'
        };
    }

    updateResumenTable() {
        // Inicializar variables de control de actualización automática
        if (!this.updateTimer) {
            this.updateTimer = null;
            this.countdownInterval = null;
            this.isAutoUpdateActive = false;
            this.UPDATE_INTERVAL_TIME = 120000; // 2 minutos
            this.COUNTDOWN_SECONDS = this.UPDATE_INTERVAL_TIME / 1000;
            this.remainingSeconds = this.COUNTDOWN_SECONDS;
        }

        // Función para actualizar la visualización del temporizador
        const updateTimerDisplay = () => {
            const minutes = Math.floor(this.remainingSeconds / 60);
            const seconds = this.remainingSeconds % 60;
            const timerElement = document.getElementById('timerDisplay');
            if (timerElement) {
                timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            }
        };

        // Función para iniciar la cuenta regresiva visual
        const startCountdownTimer = () => {
            this.countdownInterval = setInterval(() => {
                this.remainingSeconds--;
                updateTimerDisplay();

                if (this.remainingSeconds <= 0) {
                    this.sendUpdateRequest();
                    this.remainingSeconds = this.COUNTDOWN_SECONDS; // Reinicia para el siguiente ciclo
                }
            }, 1000);
        };

        // Función para detener la cuenta regresiva visual
        const stopCountdownTimer = () => {
            if (this.countdownInterval) {
                clearInterval(this.countdownInterval);
                this.countdownInterval = null;
            }
        };

        // Función para iniciar la actualización automática
        const startAutoUpdate = () => {
            if (!this.updateTimer) {
                this.updateTimer = setInterval(() => {
                    this.sendUpdateRequest();
                }, this.UPDATE_INTERVAL_TIME);

                this.isAutoUpdateActive = true;
                this.remainingSeconds = this.COUNTDOWN_SECONDS;
                updateTimerDisplay();
                startCountdownTimer();
            }
        };

        // Función para detener la actualización automática
        const stopAutoUpdate = () => {
            if (this.updateTimer) {
                clearInterval(this.updateTimer);
                this.updateTimer = null;
            }

            stopCountdownTimer();
            this.isAutoUpdateActive = false;

            // Alerta con SweetAlert2
            Swal.fire({
                icon: 'info',
                title: 'Actualización detenida',
                text: 'La actualización automática ha sido detenida.',
                timer: 2000,
                showConfirmButton: false
            });
        };

        // Función para realizar la petición de actualización
        this.sendUpdateRequest = () => {
            const datamodulos = this.modulosTables;

            if (!datamodulos) {
                console.error('modulosTables is undefined');
                return;
            }

            const modulosData = [];

            // Recopilar datos de todos los módulos
            datamodulos.forEach((modulo, index) => {
                if (modulo && modulo.table) {
                    modulosData.push({
                        nombre: `modulo_${this.toRoman(index + 1)}`,
                        datos: modulo.table.getData()
                    });
                } else {
                    console.error(`Modulo en posición ${index} o su tabla está undefined`);
                }
            });

            // Recopilar datos de otras tablas
            const datacisterna = this.cisternaTable?.table?.getData();
            const dataexterior = this.exteriorTable?.table?.getData();

            // Obtener resumen actual
            const resumenDataSan = this.getResumenData();

            const dataToSend = {
                modulos: modulosData,
                cisterna: datacisterna,
                exterior: dataexterior,
                resumensa: resumenDataSan
            };

            const comprimido = JSON.stringify(dataToSend);
            console.log('Data to send:', comprimido);
            
            $.ajax({
                url: '/update_metrados_sanitarias',
                method: 'POST',
                data: comprimido,
                contentType: 'application/json',
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function (response) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Guardado exitoso',
                        text: response.message || 'Los datos se han guardado correctamente.',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    console.log('Update successful:', response.message);
                },
                error: function (xhr) {
                    console.error('Update error:', xhr.responseText);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al guardar',
                        text: 'Ocurrió un error durante la actualización: ' + xhr.responseText,
                    });
                    // Detener auto-actualización en caso de error
                    stopAutoUpdate();
                }
            });
        };

        // Función para obtener datos del resumen
        this.getResumenData = () => {
            const resumenData = {};
            const resumenMetradosSanitarias = [];

            const isValidItem = (item) => {
                if (!item) return false;
                const itemParts = item.split('.');
                return itemParts.every(part => /^[0-9]{2}$/.test(part));
            };

            const upsertResumenRecord = (key, node) => {
                if (node.item && node.item.trim() !== '') {
                    if (!resumenData[key]) {
                        resumenData[key] = {
                            id: node.id,
                            item: node.item,
                            descripcion: node.descripcion,
                            unidad: node.unidad || '',
                            totalnieto: (node.totalnieto === 0 || node.totalnieto === "0.00" ||
                                node.totalnieto === "" || node.totalnieto === undefined) ? '' : node.totalnieto,
                            exterior: '',
                            cisterna: '',
                            total: ''
                        };

                        for (let i = 1; i <= this.modulosCount; i++) {
                            resumenData[key][`modulo_${i}`] = '';
                        }
                    }
                    return resumenData[key];
                }
                return null;
            };

            const processNode = (node, options = {}) => {
                const { parentKey = '', sourceType = '', processChildren = true } = options;

                if (!node.item || typeof node.item !== 'string' || node.item.trim() === '') {
                    return;
                }

                const key = `${parentKey ? parentKey + '.' : ''}${node.item}-${node.descripcion}`;
                const record = upsertResumenRecord(key, node);

                if (record) {
                    const getNumericValue = (value) => parseFloat(value) || 0;

                    if (node.totalnieto !== null && node.totalnieto !== undefined) {
                        switch (sourceType) {
                            case 'exterior':
                                record.exterior = getNumericValue(node.totalnieto);
                                break;
                            case 'cisterna':
                                record.cisterna = getNumericValue(node.totalnieto);
                                break;
                            default:
                                if (sourceType.startsWith('modulo_')) {
                                    const moduleIndex = parseInt(sourceType.split('_')[1], 10);
                                    record[`modulo_${moduleIndex}`] = getNumericValue(node.totalnieto);
                                }
                                break;
                        }

                        const modulesTotal = Object.keys(record)
                            .filter(key => key.startsWith('modulo_'))
                            .reduce((sum, key) => sum + getNumericValue(record[key]), 0);

                        const total = getNumericValue(record.exterior) +
                            getNumericValue(record.cisterna) +
                            modulesTotal;

                        if (total > 0) {
                            record.total = total.toFixed(2);
                        }
                    }

                    if (processChildren && node.children && node.children.length > 0) {
                        node.children.forEach(child => {
                            processNode(child, {
                                parentKey: node.item,
                                sourceType
                            });
                        });
                    }
                }
            };

            const ordenarPorItem = (data) => {
                data.sort((a, b) => {
                    const aParts = a.item.split('.').map(num => parseInt(num, 10));
                    const bParts = b.item.split('.').map(num => parseInt(num, 10));

                    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
                        const aVal = aParts[i] || 0;
                        const bVal = bParts[i] || 0;

                        if (aVal !== bVal) {
                            return aVal - bVal;
                        }
                    }
                    return 0;
                });

                data.forEach(item => {
                    if (item.children && item.children.length > 0) {
                        ordenarPorItem(item.children);
                    }
                });
            };

            const buildTree = (items) => {
                const tree = [];
                const map = {};
                items.forEach(item => {
                    map[item.item] = { ...item, children: [] };
                });
                items.forEach(item => {
                    const parentKey = item.item.substring(0, item.item.lastIndexOf('.'));
                    if (map[parentKey]) {
                        map[parentKey].children.push(map[item.item]);
                    } else {
                        tree.push(map[item.item]);
                    }
                });
                return tree;
            };

            // Procesar datos de módulos
            this.modulosTables.forEach((modulo, index) => {
                const moduleData = modulo.table.getData();
                moduleData.forEach(row => {
                    processNode(row, { sourceType: `modulo_${index + 1}` });
                });
            });

            // Procesar datos exterior y cisterna
            const exteriorData = this.exteriorTable.table.getData();
            exteriorData.forEach(row => {
                processNode(row, { sourceType: 'exterior' });
            });

            const cisternaData = this.cisternaTable.table.getData();
            cisternaData.forEach(row => {
                processNode(row, { sourceType: 'cisterna' });
            });

            const resumenArray = Object.values(resumenData);
            ordenarPorItem(resumenArray);
            resumenMetradosSanitarias.push(...buildTree(resumenArray));

            return resumenMetradosSanitarias;
        };

        // Event Listeners
        // Botón principal de actualización
        $('#actualizar_metrados').off('click').on('click', () => {
            if (!this.isAutoUpdateActive) {
                startAutoUpdate();
                this.sendUpdateRequest(); // Guardado inmediato al iniciar
            } else {
                stopAutoUpdate();
            }
        });

        // Botones individuales (si existen en tu HTML)
        $('#btnIniciarAuto').off('click').on('click', () => {
            if (!this.isAutoUpdateActive) {
                startAutoUpdate();
                this.sendUpdateRequest();
            }
        });

        $('#btnPausarAuto').off('click').on('click', () => {
            if (this.isAutoUpdateActive) {
                stopAutoUpdate();
            }
        });

        $('#btnGuardarAhora').off('click').on('click', () => {
            this.sendUpdateRequest();
        });

        // Control de visibilidad de la pestaña
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isAutoUpdateActive) {
                stopAutoUpdate();
            }
        });

        // Detener actualización al cerrar ventana
        window.addEventListener('beforeunload', () => {
            if (this.isAutoUpdateActive) {
                stopAutoUpdate();
            }
        });

        // Actualizar tabla de resumen (lógica original)
        setTimeout(() => {
            const resumenData = this.getResumenData();
            this.resumenTable.setData(Object.values(resumenData));
        }, 100);
    }

    sendUpdateRequest() {
        const datamodulos = this.modulosTables;
        if (!datamodulos) {
            console.error('modulosTables is undefined');
            return;
        }

        const modulosData = [];

        datamodulos.forEach((modulo, index) => {
            if (modulo && modulo.table) {
                modulosData.push({
                    nombre: `modulo_${this.toRoman(index + 1)}`,
                    datos: modulo.table.getData()
                });
            } else {
                console.error(`Modulo en posición ${index} o su tabla está undefined`);
            }
        });

        const resumenDataSan = this.getResumenData();

        const dataToSend = {
            modulos: modulosData,
            cisterna: this.cisternaTable?.table?.getData(),
            exterior: this.exteriorTable?.table?.getData(),
            resumensa: resumenDataSan
        };

        console.log('Data to send:', dataToSend);

        $.ajax({
            url: '/update_metrados_sanitarias',
            method: 'POST',
            data: JSON.stringify(dataToSend),
            contentType: 'application/json',
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: (response) => {
                console.log('Response:', response.message);
                // Optional: Add visual feedback for successful update
                const button = $('#actualizar_metrados');
                button.addClass('update-success');
                setTimeout(() => button.removeClass('update-success'), 1000);
            },
            error: (xhr) => {
                console.error('Error:', xhr.responseText);
                // Optional: Add visual feedback for failed update
                const button = $('#actualizar_metrados');
                button.addClass('update-error');
                setTimeout(() => button.removeClass('update-error'), 1000);
            }
        });
    }

    calculateModulesTotal(item) {
        const moduleTotals = {};
        this.modulosTables.forEach((moduleTable, index) => {
            // Buscar el valor de `totalnietos` para este módulo y este item
            const moduleRow = moduleTable.getRow(item); // Asume que cada módulo tiene un método `getRow(item)`
            moduleTotals[`modulo_${index}`] = moduleRow ? moduleRow.totalnieto : 0;
        });
        return moduleTotals;
    }

    calculateOverallTotal(item) {
        // Sumar los totales de los módulos, exterior y cisterna para el `item` dado
        const modulesTotal = this.modulosTables.reduce((sum, moduleTable) => {
            const moduleRow = moduleTable.getRow(item);
            return sum + (moduleRow ? moduleRow.totalnieto : 0);
        }, 0);
        const exteriorTotal = this.exteriorTable.getRowTotal(item, 'totalnieto');
        const cisternaTotal = this.cisternaTable.getRowTotal(item, 'totalnieto');

        return modulesTotal + exteriorTotal + cisternaTotal;
    }
}

//export default new Sistema();