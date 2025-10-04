$(document).ready(function () {
    ///IMPORTAR DATAS EXCEL
    let selectedFile;
    let jsonTree;

    document.getElementById("fileUpload").addEventListener("change", function (event) {
        selectedFile = event.target.files[0];
    });
    // Función para actualizar la tabla con nuevos datos
    function updateTableData(newData) {
        console.log("Actualizando tabla con:", newData);
        table.clearData(); // Limpiar la tabla
        table.setData(newData); // Cargar nuevos datos
    }

    // Evento al hacer clic en "Cargar Excel"
    document.getElementById("uploadExcel").addEventListener("click", function () {
        if (!selectedFile) {
            alert("Por favor, selecciona un archivo Excel.");
            return;
        }

        let fileReader = new FileReader();
        fileReader.onload = function (event) {
            let data = new Uint8Array(event.target.result);
            let workbook = XLSX.read(data, { type: "array" });

            if (!workbook.Sheets["Metrado"]) {
                alert("La hoja 'Metrado' no se encuentra en el archivo.");
                return;
            }

            let sheet = workbook.Sheets["Metrado"];
            if (!sheet["!ref"]) {
                alert("No se detectaron datos en la hoja 'Metrado'.");
                return;
            }

            let rowObject = XLSX.utils.sheet_to_json(sheet, { defval: "" });
            let filteredData = rowObject.slice(8);
            console.log("Datos filtrados desde Excel:", filteredData);

            jsonTree = buildHierarchy(filteredData);
            console.log("Árbol generado desde Excel:", jsonTree);

            // Limpiar y actualizar la tabla con los datos del Excel
            updateTableData(jsonTree);
        };

        fileReader.readAsArrayBuffer(selectedFile);
    });

    // Función para construir la jerarquía
    function buildHierarchy(data) {
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

    // Main database structure
    const inputElement = document.getElementById('datamodulos');
    const modulosData = inputElement ? inputElement.value : null;

    // Validar y parsear el JSON
    if (!modulosData) {
        console.error('El input #datamodulos no contiene datos válidos.');
        return;
    }

    let database;
    try {
        database = JSON.parse(modulosData); // Parsear el JSON
    } catch (error) {
        console.error('Error al parsear los datos del input:', error.message);
        return;
    }

    // Validar que los datos de "modulo" existan
    if (!database.modulos || !Array.isArray(database.modulos)) {
        console.error('La clave "modulo" no existe o no es un array en los datos proporcionados.');
        return;
    }

    //const metradoComunicacion = database.modulos;
    let metradoComunicacion = sortTreeData(database.modulos);

    // Configuration object for managing calculation logic and color schemes
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
                // Si es de 5ta generación, revisa si tiene hijos
                if (depth === 4) {
                    if (node.children && node.children.length > 0) {
                        // Si tiene hijos, colorear al padre de verde
                        return TableConfig.colors.hierarchyLevels[3];
                    } else {
                        // Si no tiene hijos, colorear de negro
                        return TableConfig.colors.hierarchyLevels[4];
                    }
                }

                // Para la 4ta generación, revisa si tiene hijos en la 5ta
                if (depth === 3) {
                    if (node.children && node.children.some(child => child.children && child.children.length > 0)) {
                        // Si tiene hijos en la 5ta, colorear de verde
                        return TableConfig.colors.hierarchyLevels[3];
                    } else {
                        // Si no tiene hijos en la 5ta, colorear de negro
                        return TableConfig.colors.hierarchyLevels[4];
                    }
                }

                // Para los demás niveles, usar color por defecto
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
        //Und: ["elesimil", "nveces", "longitud", "area"],
        Und: ["elesimil", "nveces"],
        m: ["elesimil", "largo", "ancho", "alto", "nveces"],
        m1: ["elesimil", "largo", "ancho", "alto"],
        pto: ["nveces"],
        //m3: ["largo", "ancho", "alto", "nveces"],
        m3: ["elesimil", "largo", "ancho", "alto", "nveces", "longitud", "area"],
        GBL: ["elesimil", "nveces"],
    };

    const TableCalculator = {
        calculateByUnidad: function (data) {
            const unidad = data.unidad;
            switch (unidad) {
                case "Und":
                case "GBL": // Misma fórmula para "Und" y "GBL"
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
            const nveces = parseFloat(data.nveces) || 1;
            const longitud = parseFloat(data.longitud) || 1;

            const dimensionSum = largo + ancho;
            //const dimensionSum = largo + ancho + alto;
            //const unidadCalculado = elesimil * dimensionSum * longitud * nveces;
            const unidadCalculado = elesimil * dimensionSum * alto;

            return {
                unidadCalculado: unidadCalculado,
                displayValue: unidadCalculado.toFixed(2),
                dimensionSum: dimensionSum
            };
        },

        // Función recursiva para totales jerárquicos
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

    const listaNormativas = [
        {
            item: "INSTALACIONES DE COMUNICACIONES", children: [
                {
                    item: "CABLEADO ESTRUCTURADO EN INTERIORES DE EDIFICIOS", children: [
                        { item: "CABLES EN TUBERÍAS" },
                    ]
                },
                { item: "CANALETAS, CONDUCTOS Y/O TUBERÍAS " },
                { item: "SALIDA DE COMUNICACIONES" },
                { item: "CONDUCTORES DE COMUNICACIONES" },
                { item: "PATCH PANEL" },
                {
                    item: "RACK DE COMUNICACIONES", children: [
                        { item: "SWITCH" },
                        { item: "GABINETE DE COMUNICACIÓN" },
                    ]
                },
                { item: "CAJA DE PASE PARA TRANSFORMADOR" },
                {
                    item: "SISTEMAS VARIOS", children: [
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

    // Tabulator table initialization with enhanced configuration
    var table = new Tabulator("#metrados-comunicacion-table", {
        movableRows: true, //enable user movable rows
        height: "500px",
        data: metradoComunicacion,
        layout: "fitColumns",
        dataTree: true,
        dataTreeStartExpanded: true,
        dataTreeChildField: "children",  // Asegúrate de que cada elemento tenga este campo "children"
        columnHeaderVertAlign: "bottom",
        movableRowsConnectedTables: false, // Opcional: si necesitas mover entre tablas
        movableRowsReceiver: "add", // Especifica cómo se manejan las filas movidas
        movableRowsSender: "delete", // Especifica qué sucede con la fila original

        columns: [
            {
                title: "ITEM",
                field: "item",
                width: 100,
                formatter: function (cell) {
                    const rowData = cell.getData();
                    // Si es una fila de descripción, siempre será negro
                    if (rowData.isDescriptionRow) {
                        return `<span style="color: #000000;">${cell.getValue()}</span>`;
                    }
                    const item = rowData.item || "";  // Asegurarse de que 'item' no sea null o undefined
                    const depth = (item.match(/\./g) || []).length;  // Si item es null, usa una cadena vacía
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
                    const rowData = cell.getData(); // Datos de la fila actual

                    // Calcular la profundidad actual de la jerarquía
                    const depth = rowData.item ? rowData.item.split('.').length : 1;

                    // Generar opciones basadas en la jerarquía
                    const generateOptionsByHierarchy = (list, targetDepth, currentDepth = 1) => {
                        const options = [];
                        list.forEach((item) => {
                            // Comparar la profundidad actual con la profundidad objetivo
                            if (currentDepth === targetDepth) {
                                options.push(item.item); // Agregar solo elementos del nivel actual
                            }
                            // Si hay hijos, procesarlos recursivamente
                            if (item.children) {
                                options.push(
                                    ...generateOptionsByHierarchy(item.children, targetDepth, currentDepth + 1)
                                );
                            }
                        });
                        return options;
                    };

                    // Generar las opciones para la profundidad actual
                    const options = generateOptionsByHierarchy(listaNormativas, depth);

                    return {
                        values: options, // Opciones filtradas por jerarquía
                        autocomplete: true, // Activar autocompletado
                        allowEmpty: true, // Permitir celdas vacías
                        listOnEmpty: true, // Mostrar todos los valores si la entrada está vacía
                        valuesLookup: true, // Lookup de valores dinámicos
                        freetext: true, // Permitir texto libre (no limitado a valores de la lista)
                        multiselect: false, // Desactivar multiselección
                        placeholderLoading: "Cargando opciones...", // Placeholder personalizado
                    };
                },
                formatter: function (cell) {
                    const rowData = cell.getData();
                    // Si es una fila de descripción, siempre será negro
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
                title: "Und.", field: "unidad", editor: "list", hozAlign: "center", headerVertical: true,
                editorParams: { values: unidadValues, autocomplete: true, allowEmpty: true, listOnEmpty: true },
                cellEdited: function (cell) {
                    const row = cell.getRow();
                    formatRow(row); // Actualizar la fila cuando cambia la unidad
                    calculateRowTotal(row); // Recalcular el total
                }
            },
            {
                title: "Elem. Simil.", field: "elesimil", editor: "number", hozAlign: "center", headerVertical: true,
                cellEdited: function (cell) {
                    const row = cell.getRow();
                    calculateRowTotal(row); // Recalcular el total
                }
            },
            {
                title: "DIMENSIONES",
                columns: [
                    { title: "Largo", field: "largo", editor: "number", hozAlign: "center", headerVertical: true, cellEdited: onEdit },
                    { title: "Ancho", field: "ancho", editor: "number", hozAlign: "center", headerVertical: true, cellEdited: onEdit },
                    { title: "Alto", field: "alto", editor: "number", hozAlign: "center", headerVertical: true, cellEdited: onEdit }
                ]
            },
            {
                title: "Nº de Veces", field: "nveces", editor: "number", hozAlign: "center", headerVertical: true, cellEdited: onEdit
            },
            {
                title: "METRADO",
                columns: [
                    { title: "Lon", field: "longitud", editor: "number", hozAlign: "center", headerVertical: true, cellEdited: onEdit },
                    { title: "Área", field: "area", editor: "number", hozAlign: "center", headerVertical: true, cellEdited: onEdit },
                    { title: "Vol.", field: "volumen", hozAlign: "center", formatter: "money", headerVertical: true },
                    { title: "Kg.", field: "kg", editor: "number", hozAlign: "center", headerVertical: true },
                    { title: "Undc.", field: "unidadcalculado", hozAlign: "center", formatter: "money", headerVertical: true }
                ]
            },
            {
                title: "Total", field: "totalnieto", hozAlign: "center", formatter: "money"
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
                width: 100,
                cellClick: function (e, cell) {
                    const row = cell.getRow();
                    const action = e.target.className;

                    if (action === "add-row") {
                        try {
                            const parentData = row.getData();
                            const children = row.getTreeChildren();

                            // Obtener el siguiente número en orden
                            const nextItem = getNextNumber(children, parentData.item);

                            // Validar el orden jerárquico
                            if (!validateHierarchicalOrder(nextItem)) {
                                console.error('Error: Orden jerárquico inválido');
                                return;
                            }

                            // Crear la nueva fila
                            const newRow = {
                                id: Date.now(),
                                item: nextItem,
                                descripcion: "Nueva Fila",
                                unidad: "",
                                total: 0,
                                children: []
                            };

                            // Insertar la nueva fila manteniendo el orden
                            row.addTreeChild(newRow);

                            // Reordenar los hijos después de insertar
                            const sortedChildren = children
                                .map(child => child.getData())
                                .sort((a, b) => {
                                    if (!a.item) return 1;
                                    if (!b.item) return -1;
                                    return a.item.localeCompare(b.item);
                                });

                            // Actualizar el orden en la tabla
                            children.forEach((child, index) => {
                                if (sortedChildren[index]) {
                                    child.update(sortedChildren[index]);
                                }
                            });

                        } catch (error) {
                            console.error('Error al agregar fila:', error);
                        }

                    } else if (action === "add-row-descript") {
                        // Crear fila descriptiva (sin afectar numeración)
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
                                // Obtener y reordenar hermanos numerados
                                const siblings = parent.getTreeChildren()
                                    .filter(child => {
                                        const childData = child.getData();
                                        return childData.item && !childData.isDescriptionRow;
                                    });

                                // Eliminar la fila actual
                                row.delete();

                                // Renumerar los hermanos restantes
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
                    // Recalcular los valores de la fila actual
                    const data = row.getData();
                    const calculations = TableCalculator.calculateUnidadCalculado(data);
                    row.update({
                        unidadcalculado: calculations.unidadCalculado
                    });

                    // Actualizar los totales jerárquicos
                    table.getRootRows().forEach(rootRow =>
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
            table.getRootRows().forEach(rootRow =>
                TableCalculator.calculateHierarchicalTotals([rootRow])
            );
        }
    });

    // Función para colorear y deshabilitar celdas según la unidad seleccionada
    function formatRow(row) {
        const data = row.getData();
        const unidad = data.unidad;

        // Limpiar celdas previamente coloreadas/deshabilitadas
        row.getCells().forEach(cell => {
            cell.getElement().style.backgroundColor = "";
            cell.getColumn().getDefinition().editor = "number"; // Rehabilitar editor
        });

        if (fieldsToHighlight[unidad]) {
            // Colorear y habilitar celdas relevantes
            fieldsToHighlight[unidad].forEach(field => {
                const cell = row.getCell(field);
                if (cell) {
                    cell.getElement().style.backgroundColor = "yellow";
                }
            });

            // Deshabilitar celdas no relevantes
            row.getCells().forEach(cell => {
                const field = cell.getColumn().getField();
                if (!fieldsToHighlight[unidad].includes(field)) {
                    cell.getColumn().getDefinition().editor = false; // Deshabilitar editor
                }
            });
        }
    }

    // Función genérica para manejar cambios en celdas
    function onEdit(cell) {
        const row = cell.getRow();
        calculateRowTotal(row); // Recalcular el total
    }

    // Función para calcular y actualizar totales jerárquicos
    function updateHierarchicalTotals(row) {
        const children = row.getTreeChildren();
        const data = row.getData();

        // Si es una fila descriptiva (sin item), solo calcular su propio total sin suma en fila
        if (!data.item || data.item.trim() === '') {
            calculateDescriptiveTotal(row);
            return;
        }

        // Si no tiene hijos, calcular su total en fila (solo si tiene item)
        if (!children || children.length === 0) {
            calculateRowTotal(row);
            return;
        }

        // Separar hijos descriptivos y normales
        const descriptiveChildren = children.filter(child => {
            const childData = child.getData();
            return !childData.item || childData.item.trim() === '';
        });

        const normalChildren = children.filter(child => {
            const childData = child.getData();
            return childData.item && childData.item.trim() !== '';
        });

        // Calcular total propio si tiene item numérico
        let ownTotal = 0;
        if (data.item && /^\d/.test(data.item)) {
            calculateRowTotal(row);
            ownTotal = parseFloat(data.total) || 0;
        }

        // Sumar hijos descriptivos
        const descriptiveTotal = descriptiveChildren.reduce((sum, child) => {
            const childData = child.getData();
            calculateDescriptiveTotal(child);
            return sum + (parseFloat(childData.total) || 0);
        }, 0);

        // Actualizar total final
        const finalTotal = ownTotal + descriptiveTotal;
        row.update({
            total: finalTotal.toFixed(2),
            totalnieto: finalTotal.toFixed(2)
        });

        // Procesar hijos normales de forma independiente
        normalChildren.forEach(child => {
            updateHierarchicalTotals(child);
        });
    }

    function calculateDescriptiveTotal(row) {
        const data = row.getData();
        if (!data.unidad) {
            row.update({
                total: "0.00",
                totalnieto: "0.00",
                unidadcalculado: "0.00"
            });
            return;
        }

        let total = 0;
        switch (data.unidad) {
            case "Und":
            case "GBL":
                total = (parseFloat(data.nveces) || 0) * (parseFloat(data.elesimil) || 0);
                break;
            // ...otros casos para filas descriptivas...
        }

        row.update({
            total: total.toFixed(2),
            totalnieto: total.toFixed(2),
            unidadcalculado: total.toFixed(2)
        });
    }

    // Función para recalcular los totales de toda la tabla
    function recalculateTableTotals(table) {
        table.getRows().forEach(row => {
            if (!row.getTreeParent()) {
                // Inicia el cálculo desde las filas raíz
                updateHierarchicalTotals(row);
            }
        });
    }

    // Función para formatear número a dos dígitos
    function formatTwoDigits(num) {
        return num.toString().padStart(2, '0');
    }

    // Función para verificar si una fila debe ser numerada
    function shouldNumberRow(rowData) {
        return rowData.item !== null &&
            rowData.item !== undefined &&
            rowData.item !== "";
    }

    // Función para obtener el siguiente índice disponible
    function getNextIndex(siblings, currentIndex) {
        let numberedSiblings = siblings.filter(sibling =>
            shouldNumberRow(sibling.getData())
        );
        return numberedSiblings.length > 0 ? numberedSiblings.length + 1 : 1;
    }

    // Función para actualizar la numeración después de mover una fila
    function updateRowNumbers(table, movedRow) {
        const parentRow = movedRow.getTreeParent();
        let siblings;

        if (parentRow) {
            siblings = parentRow.getTreeChildren();
        } else {
            siblings = table.getRows().filter(row => !row.getTreeParent());
        }

        // Ordenar hermanos por su posición actual en la tabla
        const sortedSiblings = siblings.sort((a, b) => {
            return a.getPosition(true) - b.getPosition(true);
        });

        // Contador para filas numeradas
        let numberedIndex = 1;

        // Actualizar numeración solo para filas que deben ser numeradas
        sortedSiblings.forEach((row) => {
            const rowData = row.getData();

            // Solo actualizar si la fila debe ser numerada
            if (shouldNumberRow(rowData)) {
                const currentPrefix = parentRow ? parentRow.getData().item : '';
                let newItem;

                if (parentRow) {
                    // Si tiene padre, agregar el nuevo índice al prefijo existente
                    newItem = `${currentPrefix}.${formatTwoDigits(numberedIndex)}`;
                } else {
                    // Si es raíz, solo usar el nuevo índice formateado
                    newItem = formatTwoDigits(numberedIndex);
                }

                // Actualizar el item de la fila actual
                row.update({ item: newItem }, true);
                numberedIndex++;
            }

            // Siempre actualizar los hijos, independientemente de si la fila actual es numerada
            updateChildrenNumbers(row);
        });

        // Forzar la actualización de la tabla después de todos los cambios
        table.redraw(true);
    }

    // Función para actualizar recursivamente la numeración de los hijos
    function updateChildrenNumbers(parentRow) {
        const children = parentRow.getTreeChildren();
        if (!children || children.length === 0) return;

        let numberedIndex = 1;

        children.forEach((childRow) => {
            const childData = childRow.getData();

            // Solo actualizar si la fila hijo debe ser numerada
            if (shouldNumberRow(childData)) {
                const parentItem = parentRow.getData().item;
                // Solo agregar numeración si el padre tiene item
                if (shouldNumberRow(parentRow.getData())) {
                    const newItem = `${parentItem}.${formatTwoDigits(numberedIndex)}`;
                    childRow.update({ item: newItem }, true);
                    numberedIndex++;
                }
            }

            // Actualizar recursivamente los hijos del hijo
            updateChildrenNumbers(childRow);
        });
    }

    // Configuración del movimiento de filas en la tabla
    table.on("rowMoving", function (row, component, after) {
        return true;
    });

    // Configuración del evento rowMoved
    table.on("rowMoved", function (row) {
        const newParent = row.getTreeParent();
        const rowData = row.getData();

        // Solo validar profundidad si la fila debe ser numerada
        if (shouldNumberRow(rowData) && newParent) {
            const parentData = newParent.getData();
            if (shouldNumberRow(parentData)) {
                const newLevel = parentData.item.split('.').length + 1;
                if (newLevel > 5) {
                    console.error('Error: Máxima profundidad alcanzada');
                    return;
                }
            }
        }

        // Actualizar numeración
        updateRowNumbers(table, row);

        console.log("Fila movida y numeración actualizada:", row.getData());
    });

    // Evento para manejar la edición de una celda
    table.on("cellEdited", function (cell) {
        const row = cell.getRow();

        // Encontrar la fila raíz (padre más alto)
        let rootRow = row;
        while (rootRow.getTreeParent()) {
            rootRow = rootRow.getTreeParent();
        }

        // Actualizar totales desde la raíz
        updateHierarchicalTotals(rootRow);
    });

    // Evento para manejar la carga inicial de datos
    table.on("dataLoaded", function () {
        recalculateTableTotals(table);
    });

    // Function to calculate row total based on item type
    function calculateRowTotal(row) {
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
    }

    // Function to calculate descriptive children total
    function calculateDescriptiveChildrenTotal(row) {
        const children = row.getTreeChildren();
        let descriptiveTotal = 0;

        children.forEach(child => {
            const childData = child.getData();
            if (!childData.item) {
                let unidadcalculado = 0, longitud = 0, volumen = 0, total = 0;

                switch (childData.unidad) {
                    case "Und":
                    case "GBL":
                        unidadcalculado = (parseFloat(childData.nveces) || 0) * (parseFloat(childData.elesimil) || 0);
                        child.update({
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
                        longitud = (parseFloat(childData.elesimil) || 1) *
                            ((parseFloat(childData.largo) || 0) + (parseFloat(childData.ancho) || 0) + (parseFloat(childData.alto) || 0)) *
                            (parseFloat(childData.nveces) || 1);
                        child.update({
                            longitud: longitud.toFixed(2),
                            unidadcalculado: "",
                            volumen: "",
                            kg: "",
                            area: ""
                        });
                        total = longitud;
                        break;

                    case "m1":
                        longitud = (parseFloat(childData.elesimil) || 1) *
                            ((parseFloat(childData.largo) || 0) + (parseFloat(childData.ancho) || 0)) *
                            (parseFloat(childData.alto) || 1);
                        child.update({
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
                        volumen = (parseFloat(childData.largo) || 1) *
                            (parseFloat(childData.ancho) || 1) *
                            (parseFloat(childData.alto) || 1) *
                            (parseFloat(childData.nveces) || 1);
                        child.update({
                            volumen: volumen.toFixed(2),
                            unidadcalculado: "",
                            kg: ""
                        });
                        total = volumen;
                        break;

                    default:
                        child.update({
                            unidadcalculado: "",
                            longitud: "",
                            volumen: ""
                        });
                }

                child.update({ total: total.toFixed(2) });
                descriptiveTotal += total;
            }
        });

        return descriptiveTotal;
    }
    // Main function to update hierarchical totals
    function updateHierarchicalTotals(row) {
        calculateRowTotal(row);
        const descriptiveTotal = calculateDescriptiveChildrenTotal(row);
        const rowTotal = parseFloat(row.getData().total) || 0;
        const finalTotal = rowTotal + descriptiveTotal;

        row.update({
            totalnieto: finalTotal.toFixed(2)
        });

        const children = row.getTreeChildren();
        children.forEach(child => {
            if (child.getData().item && /^\d/.test(child.getData().item)) {
                updateHierarchicalTotals(child);
            }
        });
    }

    // Inicializar el objeto de resumen
    const resumenmetradocomunicacion = {};
    const resumenmetradocomunicacionTree = [];

    // Función para validar los items
    const isValidItem = (item) => {
        if (!item) return false;  // Si el item es null, undefined o una cadena vacía, es inválido
        const itemParts = item.split('.');
        // Modificado para permitir cualquier longitud de item y verificar que cada parte sea un número de dos dígitos
        return itemParts.every(part => /^[0-9]{2}$/.test(part));
    };

    const upsertResumenRecord = (key, node) => {
        // Solo crear registro si el item es válido
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

    // Función para procesar los nodos
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

    // Recorrer los datos y procesarlos
    metradoComunicacion.forEach(node => {
        processNode(node, { sourceType: 'exterior' });
    });

    // Mostrar el resumen en la tabla
    var table2 = new Tabulator("#metrados-comunicacion-resumen", {
        height: "500px",
        data: Object.values(resumenmetradocomunicacion),
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
                    // Si es una fila de descripción, siempre será negro
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
                title: "Und.", field: "unidad", hozAlign: "center",
            },
            {
                title: "Parcial", field: "totalnieto", hozAlign: "center",
                cellEdited: function (cell) {
                    const row = cell.getRow();
                    calculateRowTotal(row); // Recalcular el total
                }
            },
            {
                title: "Total", field: "totalnieto", hozAlign: "center", formatter: "money"
            },
        ],
    });

    // Variables para controlar la actualización automática
    let updateInterval = null;
    let countdownInterval = null;
    let isAutoUpdateActive = false;
    const UPDATE_INTERVAL_TIME = 120000; // 2 minutos en milisegundos
    const COUNTDOWN_SECONDS = UPDATE_INTERVAL_TIME / 1000;
    let remainingSeconds = COUNTDOWN_SECONDS;

    // Actualiza visualmente el temporizador
    function updateTimerDisplay() {
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        document.getElementById('timerDisplay').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Empieza la cuenta regresiva visual
    function startCountdownTimer() {
        countdownInterval = setInterval(() => {
            remainingSeconds--;
            updateTimerDisplay();

            if (remainingSeconds <= 0) {
                updateMetrados();
                remainingSeconds = COUNTDOWN_SECONDS; // Reinicia para el siguiente ciclo
            }
        }, 1000);
    }

    // Detiene la cuenta regresiva visual
    function stopCountdownTimer() {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }

    // Manejo de botones individuales
    document.getElementById('btnIniciarAuto').addEventListener('click', () => {
        if (!isAutoUpdateActive) {
            startAutoUpdate();
            updateMetrados(); // Guardado inmediato al iniciar
        }
    });

    document.getElementById('btnPausarAuto').addEventListener('click', () => {
        if (isAutoUpdateActive) {
            stopAutoUpdate();
        }
    });

    document.getElementById('btnGuardarAhora').addEventListener('click', () => {
        updateMetrados(); // Guardar manual inmediato
    });

    // Función para realizar la actualización
    function updateMetrados() {
        const id_metrado_comunicacion = document.getElementById('idmetradocomunicacion').value;
        const datatableresumen = resumenmetradocomunicacionTree;
        const datosActuales = table.getData();

        // const dataToSend = {
        //     id: id_metrado_comunicacion,
        //     modulos: metradoComunicacion,
        //     resumencm: datatableresumen,
        // };

        const dataToSend = {
            id: id_metrado_comunicacion,
            modulos: datosActuales,
            resumencm: datatableresumen,
        };

        const comprimido = JSON.stringify(dataToSend);

        $.ajax({
            url: '/update_metrados_comunicacion',
            method: 'POST',
            data: comprimido,
            contentType: 'application/json',
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function (response) {
                //console.log('Auto-update successful:', response.message);
                Swal.fire({
                    icon: 'success',
                    title: 'Guardado exitoso',
                    text: response.message || 'Los datos se han guardado correctamente.',
                    timer: 2000,
                    showConfirmButton: false
                });
            },
            error: function (xhr) {
                //console.error('Auto-update error:', xhr.responseText);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al guardar',
                    text: 'Ocurrió un error durante la actualización automática.' + xhr.responseText,
                });
                // Si hay un error, detener la actualización automática
                stopAutoUpdate();
            }
        });
    }

    // Función para iniciar la actualización automática
    function startAutoUpdate() {
        if (!updateInterval) {
            updateInterval = setInterval(updateMetrados, UPDATE_INTERVAL_TIME);
            isAutoUpdateActive = true;
            remainingSeconds = COUNTDOWN_SECONDS;
            updateTimerDisplay();
            startCountdownTimer();
            console.log('Auto-update started');
        }
    }

    // Función para detener la actualización automática
    function stopAutoUpdate() {
        if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
        }
        stopCountdownTimer();
        isAutoUpdateActive = false;
        //console.log('Auto-update stopped');
        Swal.fire({
            icon: 'info',
            title: 'Actualización detenida',
            text: 'La actualización automática ha sido detenida.',
            timer: 2000,
            showConfirmButton: false
        });
    }

    // Modificar el evento click del botón para alternar la actualización automática
    $('#actualizar_metrados').on('click', () => {
        if (!isAutoUpdateActive) {
            startAutoUpdate();
            // Realizar una actualización inmediata
            updateMetrados();
        } else {
            stopAutoUpdate();
        }
    });

    // Control de visibilidad de la pestaña
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            // Si la pestaña no está visible, detener la actualización
            stopAutoUpdate();
        } else {
            // Si la pestaña vuelve a ser visible y estaba activa la actualización
            if (isAutoUpdateActive) {
                startAutoUpdate();
            }
        }
    });

    // Detener la actualización cuando se cierre la ventana
    window.addEventListener('beforeunload', function () {
        stopAutoUpdate();
    });

    $('#actualizar_metrados').on('click', () => {
        const id_metrado_comunicacion = document.getElementById('idmetradocomunicacion').value;
        const datatableresumen = resumenmetradocomunicacionTree;
        const datosActuales = table.getData();

        const dataToSend = {
            id: id_metrado_comunicacion,
            modulos: datosActuales,
            resumencm: datatableresumen,
        };

        const comprimido = JSON.stringify(dataToSend);
        $.ajax({
            url: '/update_metrados_comunicacion', // Laravel route
            method: 'POST',
            data: comprimido, // Send data as JSON
            contentType: 'application/json',
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') // Include CSRF token for Laravel
            },
            success: function (response) {
                //console.log('Response:', response.message); // Success message from the server
                Swal.fire({
                    icon: 'success',
                    title: 'Guardado exitoso',
                    text: response.message || 'Los datos se han guardado correctamente.',
                    timer: 2000,
                    showConfirmButton: false
                });
            },
            error: function (xhr) {
                //console.error('Error:', xhr.responseText); // Error response from the server
                Swal.fire({
                    icon: 'error',
                    title: 'Error al guardar',
                    text: xhr.responseText,
                });
            }
        });
    });
});

// Agregar función de validación de orden jerárquico
function validateHierarchicalOrder(item) {
    const parts = item.split('.');
    return parts.every((part, index) => {
        // Verificar que cada parte sea un número de dos dígitos
        return /^\d{2}$/.test(part) &&
            // Verificar que el número esté en el rango correcto
            parseInt(part) > 0 &&
            parseInt(part) <= 99;
    });
}

// Función para obtener el siguiente número disponible en orden
function getNextNumber(children, parentItem = '') {
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

// Función para ordenar los datos del árbol
function sortTreeData(data) {
    // Función para comparar números de item
    function compareItems(a, b) {
        if (!a.item) return 1;  // Items sin numeración van al final
        if (!b.item) return -1;

        const partsA = a.item.split('.');
        const partsB = b.item.split('.');

        // Comparar cada nivel numérico
        for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
            // Si un número no existe en algún nivel, ese item va primero
            if (!partsA[i]) return -1;
            if (!partsB[i]) return 1;

            // Convertir a números para comparación
            const numA = parseInt(partsA[i]);
            const numB = parseInt(partsB[i]);

            if (numA !== numB) {
                return numA - numB;
            }
        }
        return 0;
    }

    // Función recursiva para ordenar el árbol
    function sortRecursive(items) {
        // Separar items numerados y descriptivos
        const numberedItems = items.filter(item => item.item && !item.isDescriptionRow);
        const descriptiveItems = items.filter(item => !item.item || item.isDescriptionRow);

        // Ordenar items numerados
        numberedItems.sort(compareItems);

        // Procesar hijos recursivamente
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

    // Validar y ordenar el árbol completo
    function validateAndOrderTree(items) {
        let lastItem = '';
        let isValid = true;

        function validateItem(item) {
            if (!item.item || item.isDescriptionRow) return true;

            // Verificar formato XX.XX.XX
            const isValidFormat = /^(\d{2}\.)*\d{2}$/.test(item.item);

            // Verificar orden secuencial
            if (lastItem && item.item) {
                const isValidOrder = item.item > lastItem;
                if (!isValidOrder) {
                    console.warn(`Orden incorrecto detectado: ${lastItem} -> ${item.item}`);
                    isValid = false;
                }
            }

            lastItem = item.item;
            return isValidFormat;
        }

        // Validar estructura recursivamente
        function validateStructure(items) {
            items.forEach(item => {
                if (!validateItem(item)) {
                    console.warn(`Item inválido detectado:`, item);
                    isValid = false;
                }
                if (item.children && item.children.length > 0) {
                    validateStructure(item.children);
                }
            });
        }

        validateStructure(items);
        return isValid;
    }

    // Ordenar los datos
    const sortedData = sortRecursive(data);

    // Validar la estructura
    if (!validateAndOrderTree(sortedData)) {
        console.warn('Se detectaron inconsistencias en la numeración de items');
    }

    return sortedData;
}