import { createApp, ref, onMounted, computed, reactive, nextTick } from 'vue';

// Obtener datos de configuración inicial
const { metradocomunicaciones } = window.APP_INIT || {};

const app = createApp({
    setup() {
        // ===== REACTIVE STATE =====
        const configuracion = reactive({
            documento_proyecto: window.APP_INIT.metradocomunicaciones.datamodulos || null,
            id: window.APP_INIT.metradocomunicaciones.id || null,
            nombre_proyecto: window.APP_INIT.metradocomunicaciones.nombre_proyecto || null,
            uei: window.APP_INIT.metradocomunicaciones.uei || null,
            codigosnip: window.APP_INIT.metradocomunicaciones.codigosnip || null,
            codigocui: window.APP_INIT.metradocomunicaciones.codigocui || null,
            unidad_ejecutora: window.APP_INIT.metradocomunicaciones.unidad_ejecutora || null,
            codigo_local: window.APP_INIT.metradocomunicaciones.codigo_local ?? [],
            codigo_modular: window.APP_INIT.metradocomunicaciones.codigo_modular || null,
            especialidad: window.APP_INIT.metradocomunicaciones.especialidad || null,
            fecha: window.APP_INIT.metradocomunicaciones.fecha || null,
            ubicacion: window.APP_INIT.metradocomunicaciones.ubicacion || null,
        });

        // State para las tablas y funcionalidades
        const selectedFile = ref(null);
        const jsonTree = ref([]);
        const metradoComunicacion = ref([]);
        const resumenData = ref([]);
        const isAutoUpdateActive = ref(false);
        const updateInterval = ref(null);

        // Referencias a las tablas Tabulator
        const table = ref(null);
        const tableResumen = ref(null);

        // ===== CONFIGURACIONES =====
        const TableConfig = {
            colors: {
                hierarchyLevels: {
                    0: '#800080', // Purple for top-level
                    1: '#FF0000', // Red for children
                    2: '#0000FF', // Blue for grandchildren
                    3: '#008000', // Green for 4th gen with 5th gen
                    4: '#000000'  // Black for deeper levels
                }
            },
            utils: {
                getHierarchyColor: function (node, depth) {
                    if (depth === 4) {
                        if (node.children && node.children.length > 0) {
                            return TableConfig.colors.hierarchyLevels[3];
                        } else {
                            return TableConfig.colors.hierarchyLevels[4];
                        }
                    }
                    if (depth === 3) {
                        if (node.children && node.children.some(child => child.children && child.children.length > 0)) {
                            return TableConfig.colors.hierarchyLevels[3];
                        } else {
                            return TableConfig.colors.hierarchyLevels[4];
                        }
                    }
                    return TableConfig.colors.hierarchyLevels[depth] || TableConfig.colors.hierarchyLevels[4];
                },
                calculateItemDepth: function (item) {
                    return (item.match(/\./g) || []).length;
                }
            }
        };

        const unidadValues = {
            "": "",
            "Und": "Unidad",
            "pto": "Punto",
            "m": "metros",
            "m1": "metros cc",
            "m3": "metros cúbicos",
            "GBL": "global"
        };

        const fieldsToHighlight = {
            Und: ["elesimil", "nveces"],
            m: ["elesimil", "largo", "ancho", "alto", "nveces"],
            m1: ["elesimil", "largo", "ancho", "alto"],
            pto: ["nveces"],
            m3: ["elesimil", "largo", "ancho", "alto", "nveces", "longitud", "area"],
            GBL: ["elesimil", "nveces"],
        };

        const listaNormativas = [
            {
                item: "INSTALACIONES DE COMUNICACIONES",
                children: [
                    {
                        item: "CABLEADO ESTRUCTURADO EN INTERIORES DE EDIFICIOS",
                        children: [
                            { item: "CABLES EN TUBERÍAS" },
                        ]
                    },
                    { item: "CANALETAS, CONDUCTOS Y/O TUBERÍAS " },
                    { item: "SALIDA DE COMUNICACIONES" },
                    { item: "CONDUCTORES DE COMUNICACIONES" },
                    { item: "PATCH PANEL" },
                    {
                        item: "RACK DE COMUNICACIONES",
                        children: [
                            { item: "SWITCH" },
                            { item: "GABINETE DE COMUNICACIÓN" },
                        ]
                    },
                    { item: "CAJA DE PASE PARA TRANSFORMADOR" },
                    {
                        item: "SISTEMAS VARIOS",
                        children: [
                            { item: "SISTEMA DE DETECCION Y ALARMA CONTRA INCENDIOS" },
                            { item: "SISTEMA DE SONIDO AMBIENTAL" },
                            { item: "SISTEMA DE VIDEOVIGILANCIA" },
                            { item: "SISTEMA DE PUESTA TIERRA" },
                            { item: "SISTEMA DE CONDUCTOS" },
                        ]
                    },
                ]
            }
        ];

        // ===== CALCULADORA DE TABLAS =====
        const TableCalculator = {
            calculateByUnidad: function (data) {
                const unidad = data.unidad;
                switch (unidad) {
                    case "Und":
                    case "GBL":
                        return this.calculateUnidadCalculado(data);
                    case "m":
                        return this.calculatemetros(data);
                    case "m1":
                        return this.calculate1metros(data);
                    case "pto":
                        return {
                            unidadCalculado: parseFloat(data.nveces) || 1,
                            displayValue: (parseFloat(data.nveces) || 1).toFixed(2)
                        };
                    case "m3":
                        const largo = parseFloat(data.largo) || 1;
                        const ancho = parseFloat(data.ancho) || 1;
                        const alto = parseFloat(data.alto) || 1;
                        const nveces = parseFloat(data.nveces) || 1;
                        const longitud = parseFloat(data.longitud) || 1;
                        const area = parseFloat(data.area) || 1;
                        const unidadCalculado = largo * ancho * alto * nveces * longitud * area;
                        return {
                            unidadCalculado: unidadCalculado,
                            displayValue: unidadCalculado.toFixed(2)
                        };
                    default:
                        return { unidadCalculado: 0, displayValue: "0.00" };
                }
            },

            calculateUnidadCalculado: function (data) {
                const elesimil = parseFloat(data.elesimil) || 1;
                const nveces = parseFloat(data.nveces) || 1;
                const unidadCalculado = elesimil * nveces;
                return {
                    unidadCalculado: unidadCalculado,
                    displayValue: unidadCalculado.toFixed(2)
                };
            },

            calculatemetros: function (data) {
                const elesimil = parseFloat(data.elesimil) || 1;
                const largo = parseFloat(data.largo) || 1;
                const ancho = parseFloat(data.ancho) || 1;
                const alto = parseFloat(data.alto) || 1;
                const nveces = parseFloat(data.nveces) || 1;
                const longitud = parseFloat(data.longitud) || 1;
                const dimensionSum = largo + ancho + alto;
                const unidadCalculado = elesimil * dimensionSum * longitud * nveces;
                return {
                    unidadCalculado: unidadCalculado,
                    displayValue: unidadCalculado.toFixed(2),
                    dimensionSum: dimensionSum
                };
            },

            calculate1metros: function (data) {
                const elesimil = parseFloat(data.elesimil) || 1;
                const largo = parseFloat(data.largo) || 1;
                const ancho = parseFloat(data.ancho) || 1;
                const alto = parseFloat(data.alto) || 1;
                const dimensionSum = largo + ancho;
                const unidadCalculado = elesimil * dimensionSum * alto;
                return {
                    unidadCalculado: unidadCalculado,
                    displayValue: unidadCalculado.toFixed(2),
                    dimensionSum: dimensionSum
                };
            },

            calculateHierarchicalTotals: function (rows) {
                rows.forEach(row => {
                    const children = row.getTreeChildren();
                    if (children && children.length > 0) {
                        const totalGeneral = children.reduce((sum, childRow) => {
                            const childData = childRow.getData();
                            const childCalculation = this.calculateUnidadCalculado(childData);
                            return sum + childCalculation.unidadCalculado;
                        }, 0);
                        row.update({ total: totalGeneral });
                    } else {
                        const calculation = this.calculateUnidadCalculado(row.getData());
                        row.update({
                            unidadcalculado: calculation.unidadCalculado,
                            total: calculation.unidadCalculado
                        });
                    }
                });
            }
        };

        // ===== FUNCIONES DE EXCEL =====
        const handleFileChange = (event) => {
            selectedFile.value = event.target.files[0];
        };

        const uploadExcel = () => {
            if (!selectedFile.value) {
                alert("Por favor, selecciona un archivo Excel.");
                return;
            }

            const fileReader = new FileReader();
            fileReader.onload = function (event) {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: "array" });

                if (!workbook.Sheets["Metrado"]) {
                    alert("La hoja 'Metrado' no se encuentra en el archivo.");
                    return;
                }

                const sheet = workbook.Sheets["Metrado"];
                if (!sheet["!ref"]) {
                    alert("No se detectaron datos en la hoja 'Metrado'.");
                    return;
                }

                const rowObject = XLSX.utils.sheet_to_json(sheet, { defval: "" });
                const filteredData = rowObject.slice(8);

                jsonTree.value = buildHierarchy(filteredData);
                updateTableData(jsonTree.value);
            };

            fileReader.readAsArrayBuffer(selectedFile.value);
        };

        const buildHierarchy = (data) => {
            let tree = [];
            let map = {};

            data.forEach((row, index) => {
                const {
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

                const isDescriptionRow = !item;
                const levels = (item || "").split(".");

                const node = {
                    id: index + 1,
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
                    const lastParent = Object.values(map).reverse().find(n => !n.isDescriptionRow);
                    if (lastParent) {
                        lastParent.children.push(node);
                    } else {
                        tree.push(node);
                    }
                    return;
                }

                const key = levels.join(".");
                map[key] = node;

                if (levels.length === 1) {
                    tree.push(node);
                } else {
                    const parentKey = levels.slice(0, -1).join(".");
                    if (map[parentKey]) {
                        map[parentKey].children.push(node);
                    }
                }
            });

            return tree;
        };

        const updateTableData = (newData) => {
            if (table.value) {
                table.value.clearData();
                table.value.setData(newData);
            }
        };

        // ===== FUNCIONES DE FORMATEO Y CÁLCULO =====
        const formatRow = (row) => {
            const data = row.getData();
            const unidad = data.unidad;

            row.getCells().forEach(cell => {
                cell.getElement().style.backgroundColor = "";
                cell.getColumn().getDefinition().editor = "number";
            });

            if (fieldsToHighlight[unidad]) {
                fieldsToHighlight[unidad].forEach(field => {
                    const cell = row.getCell(field);
                    if (cell) {
                        cell.getElement().style.backgroundColor = "yellow";
                    }
                });

                row.getCells().forEach(cell => {
                    const field = cell.getColumn().getField();
                    if (!fieldsToHighlight[unidad].includes(field)) {
                        cell.getColumn().getDefinition().editor = false;
                    }
                });
            }
        };

        const calculateRowTotal = (row) => {
            const data = row.getData();
            let unidadcalculado = 0, longitud = 0, volumen = 0, total = 0;

            if (data.item && /^\d/.test(data.item)) {
                switch (data.unidad) {
                    case "Und":
                    case "GBL":
                        unidadcalculado = (parseFloat(data.nveces) || 0) * (parseFloat(data.elesimil) || 0);
                        row.update({
                            unidadcalculado: unidadcalculado.toFixed(2),
                            longitud: "",
                            area: "",
                            largo: "",
                            ancho: "",
                            alto: "",
                            volumen: "",
                            kg: ""
                        });
                        total = unidadcalculado;
                        break;

                    case "m":
                        longitud = (parseFloat(data.elesimil) || 1) *
                            ((parseFloat(data.largo) || 0) + (parseFloat(data.ancho) || 0) + (parseFloat(data.alto) || 0)) *
                            (parseFloat(data.nveces) || 1);
                        row.update({
                            longitud: longitud.toFixed(2),
                            unidadcalculado: "",
                            volumen: "",
                            kg: "",
                            area: ""
                        });
                        total = longitud;
                        break;

                    case "m1":
                        longitud = (parseFloat(data.elesimil) || 1) *
                            ((parseFloat(data.largo) || 0) + (parseFloat(data.ancho) || 0)) *
                            (parseFloat(data.alto) || 1);
                        row.update({
                            longitud: longitud.toFixed(2),
                            nveces: "",
                            unidadcalculado: "",
                            volumen: "",
                            kg: "",
                            area: ""
                        });
                        total = longitud;
                        break;

                    case "m3":
                        volumen = (parseFloat(data.largo) || 1) *
                            (parseFloat(data.ancho) || 1) *
                            (parseFloat(data.alto) || 1) *
                            (parseFloat(data.nveces) || 1);
                        row.update({
                            volumen: volumen.toFixed(2),
                            unidadcalculado: "",
                            kg: ""
                        });
                        total = volumen;
                        break;

                    default:
                        row.update({
                            unidadcalculado: "",
                            longitud: "",
                            volumen: ""
                        });
                }
                row.update({ total: total.toFixed(2) });
            }
        };

        // ===== FUNCIONES DE JERARQUÍA =====
        const getNextNumber = (children, parentItem = '') => {
            const numeratedItems = children
                .filter(child => {
                    const data = child.getData();
                    return data.item && !data.isDescriptionRow;
                })
                .map(child => child.getData().item)
                .sort((a, b) => {
                    const partsA = a.split('.');
                    const partsB = b.split('.');
                    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
                        const numA = parseInt(partsA[i] || '0');
                        const numB = parseInt(partsB[i] || '0');
                        if (numA !== numB) return numA - numB;
                    }
                    return 0;
                });

            if (numeratedItems.length === 0) {
                return `${parentItem}${parentItem ? '.' : ''}01`;
            }

            const lastItem = numeratedItems[numeratedItems.length - 1];
            const lastNumber = parseInt(lastItem.split('.').pop());
            const nextNumber = (lastNumber + 1).toString().padStart(2, '0');
            return `${parentItem}${parentItem ? '.' : ''}${nextNumber}`;
        };

        const validateHierarchicalOrder = (item) => {
            const parts = item.split('.');
            return parts.every((part, index) => {
                return /^\d{2}$/.test(part) &&
                    parseInt(part) > 0 &&
                    parseInt(part) <= 99;
            });
        };

        // ===== AUTO-UPDATE FUNCIONES =====
        const startAutoUpdate = () => {
            if (!updateInterval.value) {
                updateInterval.value = setInterval(updateMetrados, 120000);
                isAutoUpdateActive.value = true;
                console.log('Auto-update started');
            }
        };

        const stopAutoUpdate = () => {
            if (updateInterval.value) {
                clearInterval(updateInterval.value);
                updateInterval.value = null;
                isAutoUpdateActive.value = false;
                console.log('Auto-update stopped');
            }
        };

        const updateMetrados = async () => {
            try {
                const dataToSend = {
                    id: configuracion.id,
                    modulos: metradoComunicacion.value,
                    resumencm: resumenData.value,
                };

                const response = await fetch('/update_metrados_comunicacion', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    },
                    body: JSON.stringify(dataToSend)
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('Update successful:', result.message);
                } else {
                    throw new Error('Update failed');
                }
            } catch (error) {
                console.error('Update error:', error);
                stopAutoUpdate();
            }
        };

        // ===== INICIALIZACIÓN DE TABLAS =====
        const initializeMainTable = () => {
            table.value = new Tabulator("#metrados-comunicacion-table", {
                movableRows: true,
                height: "500px",
                data: metradoComunicacion.value,
                layout: "fitColumns",
                dataTree: true,
                dataTreeStartExpanded: true,
                dataTreeChildField: "children",
                columnHeaderVertAlign: "bottom",
                movableRowsConnectedTables: false,
                movableRowsReceiver: "add",
                movableRowsSender: "delete",

                columns: [
                    {
                        title: "ITEM",
                        field: "item",
                        width: 100,
                        formatter: function (cell) {
                            const rowData = cell.getData();
                            if (rowData.isDescriptionRow) {
                                return `<span style="color: #000000;">${cell.getValue()}</span>`;
                            }
                            const item = rowData.item || "";
                            const depth = (item.match(/\./g) || []).length;
                            const color = TableConfig.utils.getHierarchyColor(rowData, depth);
                            const isBold = rowData.descripcion && rowData.descripcion !== "Descripcion";
                            return `<span style="color: ${color}; font-weight: ${isBold ? 'bold' : 'normal'};">${cell.getValue()}</span>`;
                        }
                    },
                    {
                        title: "DESCRIPCIÓN",
                        field: "descripcion",
                        width: 250,
                        editor: "list",
                        editorParams: (cell) => {
                            const rowData = cell.getData();
                            const depth = rowData.item ? rowData.item.split('.').length : 1;

                            const generateOptionsByHierarchy = (list, targetDepth, currentDepth = 1) => {
                                const options = [];
                                list.forEach((item) => {
                                    if (currentDepth === targetDepth) {
                                        options.push(item.item);
                                    }
                                    if (item.children) {
                                        options.push(
                                            ...generateOptionsByHierarchy(item.children, targetDepth, currentDepth + 1)
                                        );
                                    }
                                });
                                return options;
                            };

                            const options = generateOptionsByHierarchy(listaNormativas, depth);

                            return {
                                values: options,
                                autocomplete: true,
                                allowEmpty: true,
                                listOnEmpty: true,
                                valuesLookup: true,
                                freetext: true,
                                multiselect: false,
                                placeholderLoading: "Cargando opciones...",
                            };
                        },
                        formatter: function (cell) {
                            const rowData = cell.getData();
                            if (rowData.isDescriptionRow) {
                                return `<span style="color: #000000;">${cell.getValue()}</span>`;
                            }
                            const depth = (rowData.item.match(/\./g) || []).length;
                            const color = TableConfig.utils.getHierarchyColor(rowData, depth);
                            const isBold = rowData.descripcion && rowData.descripcion !== "Descripcion";
                            return `<span style="color: ${color}; font-weight: ${isBold ? 'bold' : 'normal'};">${cell.getValue()}</span>`;
                        }
                    },
                    {
                        title: "Und.",
                        field: "unidad",
                        editor: "list",
                        hozAlign: "center",
                        headerVertical: true,
                        editorParams: {
                            values: unidadValues,
                            autocomplete: true,
                            allowEmpty: true,
                            listOnEmpty: true
                        },
                        cellEdited: function (cell) {
                            const row = cell.getRow();
                            formatRow(row);
                            calculateRowTotal(row);
                        }
                    },
                    {
                        title: "Elem. Simil.",
                        field: "elesimil",
                        editor: "number",
                        hozAlign: "center",
                        headerVertical: true,
                        cellEdited: function (cell) {
                            const row = cell.getRow();
                            calculateRowTotal(row);
                        }
                    },
                    {
                        title: "DIMENSIONES",
                        columns: [
                            {
                                title: "Largo",
                                field: "largo",
                                editor: "number",
                                hozAlign: "center",
                                headerVertical: true,
                                cellEdited: (cell) => calculateRowTotal(cell.getRow())
                            },
                            {
                                title: "Ancho",
                                field: "ancho",
                                editor: "number",
                                hozAlign: "center",
                                headerVertical: true,
                                cellEdited: (cell) => calculateRowTotal(cell.getRow())
                            },
                            {
                                title: "Alto",
                                field: "alto",
                                editor: "number",
                                hozAlign: "center",
                                headerVertical: true,
                                cellEdited: (cell) => calculateRowTotal(cell.getRow())
                            }
                        ]
                    },
                    {
                        title: "Nº de Veces",
                        field: "nveces",
                        editor: "number",
                        hozAlign: "center",
                        headerVertical: true,
                        cellEdited: (cell) => calculateRowTotal(cell.getRow())
                    },
                    {
                        title: "METRADO",
                        columns: [
                            {
                                title: "Lon",
                                field: "longitud",
                                editor: "number",
                                hozAlign: "center",
                                headerVertical: true,
                                cellEdited: (cell) => calculateRowTotal(cell.getRow())
                            },
                            {
                                title: "Área",
                                field: "area",
                                editor: "number",
                                hozAlign: "center",
                                headerVertical: true,
                                cellEdited: (cell) => calculateRowTotal(cell.getRow())
                            },
                            {
                                title: "Vol.",
                                field: "volumen",
                                hozAlign: "center",
                                formatter: "money",
                                headerVertical: true
                            },
                            {
                                title: "Kg.",
                                field: "kg",
                                editor: "number",
                                hozAlign: "center",
                                headerVertical: true
                            },
                            {
                                title: "Undc.",
                                field: "unidadcalculado",
                                hozAlign: "center",
                                formatter: "money",
                                headerVertical: true
                            }
                        ]
                    },
                    {
                        title: "Total",
                        field: "totalnieto",
                        hozAlign: "center",
                        formatter: "money"
                    },
                    {
                        title: "",
                        formatter: function () {
                            return `<div class="action-buttons">
                                <button class="add-row" title="Agregar nuevo ítem">➕</button> 
                                <button class="add-row-descript" title="Agregar subpartida">📝</button> 
                                <button class="delete-row" title="Eliminar registro">🗑️</button>
                            </div>`;
                        },
                        width: 120,
                        cellClick: function (e, cell) {
                            const row = cell.getRow();
                            const action = e.target.className;

                            if (action === "add-row") {
                                try {
                                    const parentData = row.getData();
                                    const children = row.getTreeChildren();
                                    const nextItem = getNextNumber(children, parentData.item);

                                    if (!validateHierarchicalOrder(nextItem)) {
                                        console.error('Error: Orden jerárquico inválido');
                                        return;
                                    }

                                    const newRow = {
                                        id: Date.now(),
                                        item: nextItem,
                                        descripcion: "Nueva Fila",
                                        unidad: "",
                                        total: 0,
                                        children: []
                                    };

                                    row.addTreeChild(newRow);
                                } catch (error) {
                                    console.error('Error al agregar fila:', error);
                                }

                            } else if (action === "add-row-descript") {
                                const newRow = {
                                    id: Date.now(),
                                    item: "",
                                    descripcion: "Descripcion",
                                    unidad: "",
                                    total: 0,
                                    isDescriptionRow: true,
                                    children: []
                                };
                                row.addTreeChild(newRow);

                            } else if (action === "delete-row") {
                                const deletedRow = row.getData();
                                if (deletedRow.item && !deletedRow.isDescriptionRow) {
                                    const parent = row.getTreeParent();
                                    if (parent) {
                                        const siblings = parent.getTreeChildren()
                                            .filter(child => {
                                                const childData = child.getData();
                                                return childData.item && !childData.isDescriptionRow;
                                            });

                                        row.delete();

                                        siblings.forEach((sibling, index) => {
                                            if (sibling.getData().id !== deletedRow.id) {
                                                const baseItem = deletedRow.item.split('.').slice(0, -1).join('.');
                                                const newNumber = (index + 1).toString().padStart(2, '0');
                                                sibling.update({
                                                    item: `${baseItem}.${newNumber}`
                                                });
                                            }
                                        });
                                    }
                                } else {
                                    row.delete();
                                }
                            }
                        }
                    },
                ],

                rowFormatter: function (row) {
                    formatRow(row);
                },

                cellEdited: function (cell) {
                    const row = cell.getRow();
                    const editableFields = ["nveces", "longitud", "area", "elesimil", "largo", "ancho", "alto"];

                    if (editableFields.includes(cell.getField())) {
                        try {
                            const data = row.getData();
                            const calculations = TableCalculator.calculateUnidadCalculado(data);
                            row.update({
                                unidadcalculado: calculations.unidadCalculado
                            });

                            table.value.getRootRows().forEach(rootRow =>
                                TableCalculator.calculateHierarchicalTotals([rootRow])
                            );
                        } catch (error) {
                            console.error("Error al editar celda:", error);
                        }
                    }
                },

                dataTreeRowExpanded: function (row) {
                    TableCalculator.calculateHierarchicalTotals([row]);
                },

                dataTreeRowCollapsed: function () {
                    table.value.getRootRows().forEach(rootRow =>
                        TableCalculator.calculateHierarchicalTotals([rootRow])
                    );
                },

                rowMoved: function (row) {
                    updateRowNumbers(table.value, row);
                }
            });
        };

        const initializeResumenTable = () => {
            tableResumen.value = new Tabulator("#metrados-comunicacion-resumen", {
                height: "500px",
                data: resumenData.value,
                layout: "fitColumns",
                dataTree: true,
                dataTreeStartExpanded: true,
                dataTreeChildField: "children",
                columnHeaderVertAlign: "bottom",

                columns: [
                    {
                        title: "ITEM",
                        field: "item",
                        width: 100,
                        formatter: function (cell) {
                            const rowData = cell.getData();
                            const depth = (rowData.item.match(/\./g) || []).length;
                            const color = TableConfig.utils.getHierarchyColor(rowData, depth);
                            const isBold = rowData.descripcion && rowData.descripcion !== "Descripcion";
                            return `<span style="color: ${color}; font-weight: ${isBold ? 'bold' : 'normal'};">${cell.getValue()}</span>`;
                        }
                    },
                    {
                        title: "DESCRIPCIÓN",
                        field: "descripcion",
                        width: 650,
                        formatter: function (cell) {
                            const rowData = cell.getData();
                            if (rowData.isDescriptionRow) {
                                return `<span style="color: #000000;">${cell.getValue()}</span>`;
                            }
                            const depth = (rowData.item.match(/\./g) || []).length;
                            const color = TableConfig.utils.getHierarchyColor(rowData, depth);
                            const isBold = rowData.descripcion && rowData.descripcion !== "Descripcion";
                            return `<span style="color: ${color}; font-weight: ${isBold ? 'bold' : 'normal'};">${cell.getValue()}</span>`;
                        }
                    },
                    {
                        title: "Und.",
                        field: "unidad",
                        hozAlign: "center",
                    },
                    {
                        title: "Parcial",
                        field: "totalnieto",
                        hozAlign: "center",
                        cellEdited: function (cell) {
                            const row = cell.getRow();
                            calculateRowTotal(row);
                        }
                    },
                    {
                        title: "Total",
                        field: "totalnieto",
                        hozAlign: "center",
                        formatter: "money"
                    },
                ],
            });
        };

        // ===== FUNCIONES DE UTILIDAD PARA NUMERACIÓN =====
        const shouldNumberRow = (rowData) => {
            return rowData.item !== null &&
                rowData.item !== undefined &&
                rowData.item !== "";
        };

        const formatTwoDigits = (num) => {
            return num.toString().padStart(2, '0');
        };

        const updateRowNumbers = (table, movedRow) => {
            const parentRow = movedRow.getTreeParent();
            let siblings;

            if (parentRow) {
                siblings = parentRow.getTreeChildren();
            } else {
                siblings = table.getRows().filter(row => !row.getTreeParent());
            }

            const sortedSiblings = siblings.sort((a, b) => {
                return a.getPosition(true) - b.getPosition(true);
            });

            let numberedIndex = 1;

            sortedSiblings.forEach((row) => {
                const rowData = row.getData();

                if (shouldNumberRow(rowData)) {
                    const currentPrefix = parentRow ? parentRow.getData().item : '';
                    let newItem;

                    if (parentRow) {
                        newItem = `${currentPrefix}.${formatTwoDigits(numberedIndex)}`;
                    } else {
                        newItem = formatTwoDigits(numberedIndex);
                    }

                    row.update({ item: newItem }, true);
                    numberedIndex++;
                }

                updateChildrenNumbers(row);
            });

            table.redraw(true);
        };

        const updateChildrenNumbers = (parentRow) => {
            const children = parentRow.getTreeChildren();
            if (!children || children.length === 0) return;

            let numberedIndex = 1;

            children.forEach((childRow) => {
                const childData = childRow.getData();

                if (shouldNumberRow(childData)) {
                    const parentItem = parentRow.getData().item;
                    if (shouldNumberRow(parentRow.getData())) {
                        const newItem = `${parentItem}.${formatTwoDigits(numberedIndex)}`;
                        childRow.update({ item: newItem }, true);
                        numberedIndex++;
                    }
                }

                updateChildrenNumbers(childRow);
            });
        };

        // ===== FUNCIONES DE PROCESAMIENTO DE RESUMEN =====
        const processResumenData = () => {
            const resumenmetradocomunicacion = {};
            const resumenmetradocomunicacionTree = [];

            const isValidItem = (item) => {
                if (!item) return false;
                const itemParts = item.split('.');
                return itemParts.every(part => /^[0-9]{2}$/.test(part));
            };

            const upsertResumenRecord = (key, node) => {
                if (node.item && node.item.trim() !== '') {
                    if (!resumenmetradocomunicacion[key]) {
                        resumenmetradocomunicacion[key] = {
                            id: node.id,
                            item: node.item,
                            descripcion: node.descripcion,
                            unidad: node.unidad || '',
                            totalnieto: (node.totalnieto === 0 || node.totalnieto === "0.00" ||
                                node.totalnieto === "" || node.totalnieto === undefined) ? '' : node.totalnieto,
                            total: (node.total === 0 || node.total === "0.00" ||
                                node.total === "" || node.total === undefined) ? '' : node.total,
                        };
                    }
                    return resumenmetradocomunicacion[key];
                }
                return null;
            };

            const processNode = (node, options = {}) => {
                const { parentKey = '', sourceType = '', processChildren = true, treeParent = null } = options;

                if (node.item && typeof node.item === 'string' && node.item.trim() !== '') {
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
                                    record.modulo_1 = getNumericValue(node.totalnieto);
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
                    }

                    const treeNode = {
                        id: node.id,
                        item: node.item,
                        descripcion: node.descripcion,
                        unidad: node.unidad || '',
                        total: record ? record.total : '',
                        children: []
                    };

                    if (treeParent) {
                        treeParent.children.push(treeNode);
                    } else {
                        resumenmetradocomunicacionTree.push(treeNode);
                    }

                    if (processChildren && node.children && node.children.length > 0) {
                        node.children.forEach(child => {
                            processNode(child, {
                                parentKey: node.item,
                                sourceType,
                                treeParent: treeNode
                            });
                        });
                    }
                }
            };

            metradoComunicacion.value.forEach(node => {
                processNode(node, { sourceType: 'exterior' });
            });

            resumenData.value = Object.values(resumenmetradocomunicacion);
            return resumenmetradocomunicacionTree;
        };

        // ===== FUNCIONES DE ORDENAMIENTO =====
        const sortTreeData = (data) => {
            function compareItems(a, b) {
                if (!a.item) return 1;
                if (!b.item) return -1;

                const partsA = a.item.split('.');
                const partsB = b.item.split('.');

                for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
                    if (!partsA[i]) return -1;
                    if (!partsB[i]) return 1;

                    const numA = parseInt(partsA[i]);
                    const numB = parseInt(partsB[i]);

                    if (numA !== numB) {
                        return numA - numB;
                    }
                }
                return 0;
            }

            function sortRecursive(items) {
                const numberedItems = items.filter(item => item.item && !item.isDescriptionRow);
                const descriptiveItems = items.filter(item => !item.item || item.isDescriptionRow);

                numberedItems.sort(compareItems);

                const allItems = [...numberedItems, ...descriptiveItems].map(item => {
                    if (item.children && item.children.length > 0) {
                        return {
                            ...item,
                            children: sortRecursive(item.children)
                        };
                    }
                    return item;
                });

                return allItems;
            }

            return sortRecursive(data);
        };

        // ===== LIFECYCLE HOOKS =====
        onMounted(() => {
            // Inicializar datos desde configuración
            if (configuracion.documento_proyecto) {
                try {
                    const database = JSON.parse(configuracion.documento_proyecto);
                    if (database.modulos && Array.isArray(database.modulos)) {
                        metradoComunicacion.value = sortTreeData(database.modulos);
                    }
                } catch (error) {
                    console.error('Error al parsear datos del documento:', error);
                }
            }

            // Inicializar tablas
            nextTick(() => {
                initializeMainTable();
                initializeResumenTable();

                // Procesar datos del resumen
                processResumenData();

                // Actualizar tabla resumen
                if (tableResumen.value) {
                    tableResumen.value.setData(resumenData.value);
                }
            });

            // Configurar eventos de visibilidad
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    stopAutoUpdate();
                } else if (isAutoUpdateActive.value) {
                    startAutoUpdate();
                }
            });

            // Configurar evento de cierre de ventana
            window.addEventListener('beforeunload', () => {
                stopAutoUpdate();
            });
        });

        // ===== COMPUTED PROPERTIES =====
        const autoUpdateButtonText = computed(() => {
            return isAutoUpdateActive.value ? 'Detener Auto-actualización' : 'Iniciar Auto-actualización';
        });

        // ===== RETURN STATEMENT =====
        return {
            // Reactive State
            configuracion,
            selectedFile,
            jsonTree,
            metradoComunicacion,
            resumenData,
            isAutoUpdateActive,
            autoUpdateButtonText,

            // Table References
            table,
            tableResumen,

            // File handling functions
            handleFileChange,
            uploadExcel,

            // Auto-update functions
            startAutoUpdate,
            stopAutoUpdate,
            updateMetrados,

            // Utility functions
            processResumenData,
            sortTreeData,

            // Table configuration
            TableConfig,
            unidadValues,
            fieldsToHighlight,
            listaNormativas,
        };
    }
});

app.mount('#appMetradoComunicacion');