$(document).ready(function () {
    ///IMPORTAR DATAS EXCEL
    let selectedFile;
    let jsonTree;

    document.getElementById("fileUpload").addEventListener("change", function (event) {
        selectedFile = event.target.files[0];
    });
    // Función para actualizar la tabla con nuevos datos
    function updateTableData(newData) {
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
            ////console.log(filteredData)
            jsonTree = buildHierarchy(filteredData);

            // Limpiar y actualizar la tabla con los datos del Excel
            updateTableData(jsonTree);
        };

        fileReader.readAsArrayBuffer(selectedFile);
    });

    // Función para construir la jerarquía
    function buildHierarchy(data) {
        ////console.log(data);
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
        ////console.error('El input #datamodulos no contiene datos válidos.');
        return;
    }

    let database;
    try {
        database = JSON.parse(modulosData); // Parsear el JSON
    } catch (error) {
        ////console.error('Error al parsear los datos del input:', error.message);
        return;
    }

    // Validar que los datos de "modulo" existan
    if (!database.modulos || !Array.isArray(database.modulos)) {
        ////console.error('La clave "modulo" no existe o no es un array en los datos proporcionados.');
        return;
    }

    //const metradoestructuras = database.modulos;
    //const metradoestructuras = sortTreeData(database.modulos);
    let metradoestructuras = sortTreeData(database.modulos);

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
        "kg": "Kilogramos",
        "m": "metros",
        "m1": "metros cc",
        "m2": "metros cuadrado",
        "m3": "metros cúbicos",
        "GBL": "global"
    };

    const fieldsToHighlight = {
        //Und: ["elesimil", "nveces", "longitud", "area"],
        Und: ["elesimil", "nveces"],
        kg: ["elesimil", "largo", "ancho", "alto", "nveces", "volumen"],
        m: ["elesimil", "largo", "ancho", "alto", "nveces"],
        m1: ["elesimil", "largo", "ancho", "alto"],
        m2: ["elesimil", "largo", "ancho", "alto", "nveces"],
        pto: ["nveces"],
        //m3: ["largo", "ancho", "alto", "nveces"],
        m3: ["elesimil", "largo", "ancho", "alto", "nveces"],
        GBL: ["elesimil", "nveces"],
    };

    const TableCalculator = {
        calculateByUnidad: function (data) {
            const unidad = data.unidad;
            switch (unidad) {
                case "Und":
                case "GBL": // Misma fórmula para "Und" y "GBL"
                    return this.calculateUnidadCalculado(data);
                case "kg":
                    return this.calculatekilogramos(data);
                case "m":
                    return this.calculatemetros(data);
                case "m1":
                    return this.calculate1metros(data);
                case "m2":
                    return this.calculatemetroscuadrado(data);
                case "pto":
                    return {
                        unidadCalculado: parseFloat(data.nveces) || 1,
                        displayValue: (parseFloat(data.nveces) || 1).toFixed(2)
                    };
                case "m3":
                    const elementosim = parseFloat(data.elesimil) || 1;
                    const largo = parseFloat(data.largo) || 1;
                    const ancho = parseFloat(data.ancho) || 1;
                    const alto = parseFloat(data.alto) || 1;
                    const nveces = parseFloat(data.nveces) || 1;
                    const longitud = parseFloat(data.longitud) || 1;
                    const area = parseFloat(data.area) || 1;
                    const unidadCalculado = elementosim * largo * ancho * alto * nveces * longitud * area;
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

        calculatekilogramos: function (data) {
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

        calculatemetroscuadrado: function (data) {
            const elesimil = parseFloat(data.elesimil) || 1;
            const largo = parseFloat(data.largo) || 1;
            const ancho = parseFloat(data.ancho) || 1;
            const alto = parseFloat(data.alto) || 1;
            const nveces = parseFloat(data.nveces) || 1;
            const longitud = parseFloat(data.longitud) || 1;

            //const dimensionSum = largo + ancho;
            //const dimensionSum = largo + ancho + alto;
            const unidadCalculado = elesimil * largo * ancho * alto * nveces * longitud;
            //const unidadCalculado = elesimil * dimensionSum * alto;

            return {
                unidadCalculado: unidadCalculado,
                displayValue: unidadCalculado.toFixed(2),
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

    const unidadesvolumen = {
        "0.222": "6 mm",
        "0.395": "8 mm",
        "0.56": "3/8' ",
        "0.888": "12 mm",
        "0.994": "1/2' ",
        "1.552": "5/8' ",
        "2.235": "3/4' ",
        "3.973": "1' ",
        "7.907": "1 1/8' ",
    };

    const listaNormativas = [
        {
            item: "ESTRUCTURAS", children: [
                {
                    item: "MOVIMIENTO DE TIERRAS", children: [
                        {
                            item: "NIVELACIÓN DE TERRENO", children: [
                                { item: "NIVELACIÓN" },
                                { item: "NIVELADO APISONADO" },
                            ]
                        },
                        {
                            item: "EXCAVACIONES", children: [
                                { item: "EXCAVACIONES MASIVAS" },
                                { item: "EXCAVACIONES SIMPLES" },
                            ]
                        },
                        { item: "CORTES" },
                        {
                            item: "RELLENOS", children: [
                                { item: "RELLENO CON MATERIAL PROPIO" },
                                { item: "RELLENOS CON MATERIAL DE PRÉSTAMO" },
                            ]
                        },
                        { item: "NIVELACIÓN INTERIOR Y APISONADO" },
                        { item: "ELIMINACIÓN DE MATERIAL EXCEDENTE" },
                        {
                            item: "TABLAESTACADO O ENTIBADO", children: [
                                { item: "TABLAESTACADO PARA EXCAVACIONES, ESTRUCTURAS, POZOS,CÁMARAS SUBTERRÁNEAS, ETC" },
                                { item: "TABLAESTACADO PARA EXCAVACIONES DE ZANJAS" },
                            ]
                        },
                    ]
                },
                {
                    item: "OBRAS DE CONCRETO SIMPLE", children: [
                        { item: "CIMIENTOS CORRIDOS" },
                        {
                            item: "SUB ZAPATAS O FALSA ZAPATA", children: [
                                { item: "PARA EL CONCRETO" },
                                { item: "PARA EL ENCOFRADO Y DESENCOFRADO" },
                            ]
                        },
                        { item: "SOLADOS" },
                        { item: "BASES DE CONCRETO" },
                        { item: "ESTRUCTURAS DE SOSTENIMIENTO DE EXCAVACIONES" },
                        { item: "SOBRECIMIENTOS" },
                        { item: "GRADAS" },
                        { item: "RAMPAS" },
                        { item: "FALSOPISO" },
                    ]
                },
                {
                    item: "OBRAS DE CONCRETO ARMADO", children: [
                        {
                            item: "CIMIENTOS REFORZADOS", children: [
                                { item: "PARA EL CONCRETO" },
                                { item: "PARA EL ENCOFRADO Y DESENCOFRADO" },
                                { item: "PARA LA ARMADURA DE ACERO" },
                            ]
                        },
                        { item: "ZAPATAS" },
                        { item: "VIGAS DE CIMENTACIÓN" },
                        { item: "LOSAS DE CIMENTACIÓN" },
                        { item: "SOBRECIMIENTOS REFORZADOS" },
                        { item: "MUROS REFORZADOS" },
                        { item: "COLUMNAS" },
                        { item: "VIGAS" },
                        { item: "LOSAS" },
                        { item: "ESCALERAS" },
                        { item: "CAJA DE ASCENSORES Y SIMILARES" },
                        { item: "CISTERNAS SUBTERRÁNEAS" },
                        { item: "TANQUES ELEVADOS" },
                        { item: "PILOTES" },
                        { item: "CAISSONES" },
                        { item: "ESTRUCTURAS DE CONCRETO PRETENSADO O POSTENSADO" },
                        { item: "ESTRUCTURAS PREFABRICADAS" },
                    ]
                },
                {
                    item: "ESTRUCTURAS METÁLICAS", children: [
                        {
                            item: "COLUMNAS O PILARES", children: [
                                { item: "PARA ARMADO" },
                                { item: "PARA MONTAJE" },
                            ]
                        },
                        { item: "VIGAS" },
                        { item: "VIGUETAS" },
                        { item: "TIJERALES Y RETICULADOS" },
                        { item: "CORREAS" },
                        { item: "COBERTURAS" },
                        { item: "ELEMENTOS PARA AGUAS PLUVIALES" },
                    ]
                },
                {
                    item: "ESTRUCTURA DE MADERA", children: [
                        { item: "COLUMNAS O PILARES" },
                        { item: "VIGAS" },
                        { item: "TIJERALES Y RETICULADOS" },
                        { item: "CORREAS" },
                        { item: "COBERTURAS" },
                        { item: "PILOTES DE MADERA" },
                    ]
                },
                {
                    item: "VARIOS", children: [
                        { item: "JUNTAS" },
                    ]
                },
            ]
        }
    ];

    // Tabulator table initialization with enhanced configuration
    var table = new Tabulator("#metrados-estructura-table", {
        movableRows: true, //enable user movable rows
        height: "500px",
        data: metradoestructuras,
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
                    {
                        title: "Vol.", field: "volumen", editor: "list", hozAlign: "center", formatter: "money", headerVertical: true, editorParams: { values: unidadesvolumen, autocomplete: true, allowEmpty: true, listOnEmpty: true },
                        cellEdited: function (cell) {
                            const row = cell.getRow();
                            formatRow(row); // Actualizar la fila cuando cambia la unidad
                            calculateRowTotal(row); // Recalcular el total
                        }
                    },
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
                    return `<button class="add-row">➕</button> <button class="add-row-descript">➕</button> <button class="delete-row">🗑️</button>`;
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
                                //console.error('Error: Orden jerárquico inválido');
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
                            //console.error('Error al agregar fila:', error);
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
                    //console.error("Error al editar celda:", error);
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
                    //console.error('Error: Máxima profundidad alcanzada');
                    return;
                }
            }
        }

        // Actualizar numeración
        updateRowNumbers(table, row);

        //console.log("Fila movida y numeración actualizada:", row.getData());
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

    // Función de cálculo base para las filas hoja
    function calculateRowTotal(row) {
        const data = row.getData();
        let unidadcalculado = 0, longitud = 0, volumen = 0, total = 0, kg = 0, area = 0;

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
                case "kg":
                    longitud = (parseFloat(data.elesimil) || 1) *
                        ((parseFloat(data.largo) || 0) +
                            (parseFloat(data.ancho) || 0) +
                            (parseFloat(data.alto) || 0)) *
                        (parseFloat(data.nveces) || 1);

                    if (data.volumen && longitud) {
                        kg = longitud * (parseFloat(data.volumen) || 1);
                    }

                    row.update({
                        longitud: longitud.toFixed(2),
                        kg: kg.toFixed(2),
                        //unidadcalculado: kg.toFixed(2),
                        area: ""
                    });

                    total = kg;
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
                case "m2":
                    area = (parseFloat(data.elesimil) || 1) *
                        (parseFloat(data.largo) || 1) *
                        (parseFloat(data.ancho) || 1) *
                        (parseFloat(data.alto) || 1) *
                        (parseFloat(data.nveces) || 1);
                    row.update({
                        area: area.toFixed(2),
                        unidadcalculado: "",
                        volumen: "",
                        longitud: "",
                        kg: ""
                    });
                    total = area;
                    break;
                case "m3":
                    volumen = (parseFloat(data.elesimil) || 1) *
                        (parseFloat(data.largo) || 1) *
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
                let unidadcalculado = 0, longitud = 0, volumen = 0, total = 0, kg = 0, area = 0;
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
                    case "kg":
                        // Corregido: usando childData en lugar de data
                        longitud = (parseFloat(childData.elesimil) || 1) *
                            ((parseFloat(childData.largo) || 0) +
                                (parseFloat(childData.ancho) || 0) +
                                (parseFloat(childData.alto) || 0)) *
                            (parseFloat(childData.nveces) || 1);

                        if (childData.volumen && longitud) {
                            kg = longitud * (parseFloat(childData.volumen) || 1);
                        }

                        child.update({
                            longitud: longitud.toFixed(2),
                            kg: kg.toFixed(2),
                            //unidadcalculado: kg.toFixed(2),
                            area: ""
                        });

                        total = kg;
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
                    case "m2":
                        area = (parseFloat(childData.elesimil) || 1) *
                            (parseFloat(childData.largo) || 1) *
                            (parseFloat(childData.ancho) || 1) *
                            (parseFloat(childData.alto) || 1) *
                            (parseFloat(childData.nveces) || 1);
                        child.update({
                            area: area.toFixed(2),
                            unidadcalculado: "",
                            volumen: "",
                            longitud: "",
                            kg: ""
                        });
                        total = area;
                        break;
                    case "m3":
                        volumen = (parseFloat(childData.elesimil) || 1) *
                            (parseFloat(childData.largo) || 1) *
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
    const resumenmetradoestructuras = {};
    const resumenmetradoestructurasTree = [];

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
            if (!resumenmetradoestructuras[key]) {
                resumenmetradoestructuras[key] = {
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
            return resumenmetradoestructuras[key];
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
                resumenmetradoestructurasTree.push(treeNode);
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
    metradoestructuras.forEach(node => {
        processNode(node, { sourceType: 'exterior' });
    });

    // Mostrar el resumen en la tabla
    var table2 = new Tabulator("#metrados-estructura-resumen", {
        height: "500px",
        data: Object.values(resumenmetradoestructuras),
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
        const idmetradoestructuras = document.getElementById('idmetradoestructuras').value;
        const datatableresumen = resumenmetradoestructurasTree;
        const datosActuales = table.getData();

        const dataToSend = {
            id: idmetradoestructuras,
            modulos: datosActuales,
            resumenestr: datatableresumen,
        };

        const comprimido = JSON.stringify(dataToSend)
        //console.log(comprimido)
        $.ajax({
            url: '/update_metrados_estructuras',
            method: 'POST',
            data: comprimido,
            contentType: 'application/json',
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            success: function (response) {
                ////console.log('Auto-update successful:', response.message);
                Swal.fire({
                    icon: 'success',
                    title: 'Guardado exitoso',
                    text: response.message || 'Los datos se han guardado correctamente.',
                    timer: 2000,
                    showConfirmButton: false
                });
            },
            error: function (xhr) {
                ////console.error('Auto-update error:', xhr.responseText);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al guardar',
                    text: xhr.responseText,
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
            //console.log('Auto-update started');
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
        // Alerta con SweetAlert2
        Swal.fire({
            icon: 'info',
            title: 'Actualización detenida',
            text: 'La actualización automática ha sido detenida.',
            timer: 2000,
            showConfirmButton: false
        });
        // //console.log('Auto-update stopped');
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
        const idmetradoestructuras = document.getElementById('idmetradoestructuras').value;
        //const datatable = metradoestructuras;
        const datatableresumen = resumenmetradoestructurasTree;
        const datosActuales = table.getData();

        const dataToSend = {
            id: idmetradoestructuras,
            modulos: datosActuales,
            resumenestr: datatableresumen,
        };

        const comprimido = JSON.stringify(dataToSend)

        $.ajax({
            url: '/update_metrados_estructuras', // Laravel route
            method: 'POST',
            data: comprimido, // Send data as JSON
            contentType: 'application/json',
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') // Include CSRF token for Laravel
            },
            success: function (response) {
                ////console.log('Response:', response.message); // Success message from the server
                Swal.fire({
                    icon: 'success',
                    title: 'Guardado exitoso',
                    text: response.message || 'Los datos se han guardado correctamente.',
                    timer: 2000,
                    showConfirmButton: false
                });
            },
            error: function (xhr) {
                ////console.error('Error:', xhr.responseText); // Error response from the server
                Swal.fire({
                    icon: 'error',
                    title: 'Error al guardar',
                    text: xhr.responseText,
                });
            }
        });
    });

    document.getElementById('download-xlsx').addEventListener('click', function () {
        //Datos Excel
        const data = metradoestructuras;
        const dataresumen = (Object.values(resumenmetradoestructuras));

        const nombre_proyecto = document.getElementById('nombre_proyecto').value;
        const cui = document.getElementById('cui').value;
        const codigo_modular = document.getElementById('codigo_modular').value;
        const codigo_local = document.getElementById('codigo_local').value;
        const unidad_ejecutora = document.getElementById('unidad_ejecutora').value;
        const fecha = document.getElementById('fecha').value;
        const especialidad = document.getElementById('especialidad').value;
        const modulo = document.getElementById('modulo').value;
        const localidad = document.getElementById('localidad').value;

        //Inicio de documento
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Metrado');

        // Estilos generales
        const borderStyle = {
            top: { style: 'thin', color: { argb: '000000' } },
            bottom: { style: 'thin', color: { argb: '000000' } },
            left: { style: 'thin', color: { argb: '000000' } },
            right: { style: 'thin', color: { argb: '000000' } },
        };

        const headerStyle = {
            font: { name: 'Arial', size: 10, bold: true },
            alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
            border: borderStyle,
        };

        const bodyStyle = {
            font: { name: 'Arial', size: 10 },
            alignment: { horizontal: 'left', vertical: 'middle' },
            border: borderStyle,
        };

        const bodysStyle = {
            font: { name: 'Arial', size: 10 },
            alignment: { horizontal: 'center', vertical: 'middle' },
            border: borderStyle,
        };

        const bodyStylenumb = {
            font: { name: 'Arial', size: 10 },
            alignment: { horizontal: 'right', vertical: 'middle' },
            border: borderStyle,
        };

        // Modificar el estilo del título para incluir borde completo
        const titleStyle = {
            font: { name: 'Arial', size: 12, bold: true },
            alignment: { horizontal: 'center', vertical: 'middle' },
            border: borderStyle,
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' }
            }
        };

        // Modificar el estilo de descripción para el contenido sin bordes
        const descriptionContentStyle = {
            font: { name: 'Arial', size: 10 },
            alignment: { vertical: 'middle', horizontal: 'left' },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' }
            },
            border: null // Aseguramos que no haya bordes
        };

        // Modificar el estilo para la sección de descripción completa
        const descriptionContainerStyle = {
            font: { name: 'Arial', size: 10 },
            alignment: { vertical: 'middle', horizontal: 'left' },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' }
            },
            border: {
                top: { style: 'thin', color: { argb: '000000' } },
                left: { style: 'thin', color: { argb: '000000' } },
                bottom: { style: 'thin', color: { argb: '000000' } },
                right: { style: 'thin', color: { argb: '000000' } }
            }
        };

        // Ancho de columnas
        worksheet.columns = [
            { width: 4 },  // A
            { width: 4 },  // B
            { width: 15 },  // C
            { width: 50 }, // D
            { width: 6 },  // E
            { width: 6 },  // F
            { width: 8 },  // G
            { width: 8 },  // H
            { width: 8 },  // I
            { width: 12 }, // J
            { width: 8 },  // K
            { width: 8 },  // L
            { width: 8 },  // M
            { width: 8 },  // N
            { width: 8 },  // O
            { width: 8 },  // P
            { width: 4 },  // Q
        ];

        // Imagen en base64 (Reemplaza esto con tu imagen convertida a base64)
        const base64Image =
            'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAABiAAAADMCAYAAAD6SWtOAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAFxEAABcRAcom8z8AAP+lSURBVHhe7J0FvBXl9ve5dmC3Xru7MLAQQTBREQMVRQVb6e7u7m6QDglBkC7pllS6pOMk/N75blne5847e5+9D3i93v8sP4/7sGfmmSdW/FbM7CwKKaSQQgoppJBCCimkkEIKKaSQQgoppJBCCimk/zFK1RGN+mW6Cg+opNzti+rxVoX08YDqWvTbmsjxHWn7VXdWD2Xv8IEebPeeWs3sr3U7N2jCz9PU7aeBWrh5mY4cPRI5d+av89Vldn9NXD1Ta3ZuVP2pvXRnyzeUvf37ajF/oPanHo6cN3njAr3Xt0LkXrk7fqqPBlTVuPWzvbGkR47/X6LWrVsrTECEFFJIIYUUUkghhRRSSCGFFFJIIYUUUkghhfQ/Qbv279LcVfM0ddksDV38g4oMqKFLq+TSqeUe1sll7tfNdfOp45T+2r5ru3ov/F63NH9N51R6WC92/UK9fxqhHpMHKU/jwrq1Ui6V6FNTM5bO1ZQls/R598q6sVwOvdj0Y/WdPkzdZw/Xsx2K6syK2XRP+0IaumKKtu7cqgZju+jams/p5NL369SK2XV5tTz6bFBtDfPGMn35TM1fvUAHDu0/Ntr/bWrUqFGYgAgppJBCCimkkEIKKaSQQgoppJBCCimkkEIK6X+DZq9aoLID6uuLvtX19cDaeqrlRzqr/FPKWv5JnVwqm66q+ZzqjOugKT/P1ueD6+m0Ctl0a92X1XxcV3We0EcvtPhEl5XPqUtLPK5sVV/TK22+1sttv9ED1V7VJV89qivL5lT+1p+qy4991PD7jrqudl6dWuUxlRnZUpO9Pst/1zyS8Di5xIM6p2IOnV0hh55uUyQyls/7VFWlQQ21eP2yY6P936aGDRuGCYiQQgoppJBCCimkkEIKKaSQQgoppJBCCimkkP7+9Mv2jao0vJVuq5VPt9fJpyebFtLNtV7RORVy6qYaL+uSMk/pmurPq+r4dvp+2VS93a2cTi/zkPK0KKK6w1vr/fYldXGpJ3R2mcd0Zemcuqr007qwSi5dVCW3/lk+t64s+4zOLf24rinzpIp2Kq3a3r2ebP6BTi/7sIr2q6lxP09T6dHNdUXlZ7175dAtNV/RuRWe1q11XvHOe1+31n5Zd9d9TTVHtdMvOzYdG/X/LoUJiJBCCimkkEIKKaSQQgoppJBCCimkkEIKKaSQ/va0dc9ONf2hh26vl1+nlX1E19R4Xg/WK6B/VnxWl1fMozzNiurOKi/risq5VHF8a83btELVRrRWttoFVKhtSb3V6ks9VP113VThBd1Q9QXdXf0VZWvwth5u9aEeblHY+/sd3VXnNd1S/SXdU/5FPVG9gAq2/kZvtPxGD9V9Q03GddPcTctUbGQjXVbxad1T7RXlbf6p9/ezurrys3qg/hu6qmZenVb+Ud1Vv4Baju+t3/buko4em8D/IIUJiGN09OjRf2tG/u8TaUZBxxJpIYUUUkghhRRSSCGFFFJIIYUUUkghhRRSSCFFoXRp885t6jJ9qB5v+r5OKXGPTq/0mB5o9q6ea1FUt1d6UffVLKDKA5srf7tvdFW1XCozupl+3bNFExZNU+Xu9VWra2N90bKc3mzwpV5vUkz5Wn+jt7qU1if9aqrYoEYqNqCBPuleTW+3K6n8Lb9RwUbF9Xa9z/VZkzKq0KaWqnh9zPx5rlbv2qCvhtbVlVVz6a32xVWxf1PdXSO/bq/ysvK2+ER3N3tbp1R8VKcUv1c5W3yk3rO+09bftkm//871/xz9n09AWJD/yJEjfzQL+vu/d4+7zb7zn2N9pKenR5odc/+2f7vfWb/WQgoppJBCCimkkEIKKaSQQgoppJBCCimkkEL6/yktJVU/r1ultvx2Q6evdX75J5Xls1t1fpWn9XLnEvqqZy09U6eQ8jYqomFzx6vD1AF6re03qje0nX7duF4b1/2q0WNHqt+AvurUs5MqtKujt5qX0CttiumNzmX0fq/KKtqvhj7pVVXvtyurN5oWU/5mX+vtZiVVvk1tterYWl26ddbo77/T9o2btPqXNaoxsLleb19cXaYO0oCZo5W7wYfKVa+wvuxVS891/FpnVnhcWT6/TZdUelqvdimhDj/206r1q5WamnpsVv879H8+AeEmAtwEAMRnWlpaZONp/G3H7dP+plkigWZ98L1dz/fWH59us+8sEWF9Wz8hhRRSSCGFFFJIIYUUUkghhRRSSCGFFFJIIf2LiKMu/3Wlag1tqeyN39GVNfPqvAo5dNIX9+ji0k+pULeKaj22j0p2q6Wi7Svop1WLtWbDOvUZOVD9hg7QrOkztWjOAn03dpQ6D+ypzn276/M2lXV7rdd0fY18ur5aPt1U+zXd1+Qt3VePVzM9r+vLPK+bKr+s22u/rk/bVFHr7h3Upk9njRozSkvnLtSMqdPUZ8i3+nbsEK3d8IumLZujom0rqHTPemoxrpfe7FhK55R4VKd8fZ8uqPK0/ln7eT3W+D3VG9FWKzetUbo3p/8l+j+dgCC47w/487c1jpEYSElJiTRLIljzn+8mFOwY51mCwW3WhyUd3HP42+03pJBCCimkkEIKKaSQQgoppJBCCimkkEIKKaR/p517d6j5+G66v97rOq30Qzqr/BO6sHpenV3qcV1Z4ikV6lxa3y+Zoh9+mqQOA7tp3sIF2rryV839cbpGjvhO3Yb0Vpt+XVWha0O91bas3mtbQdkbfaDTqzylUyo/pX+Uzq7zKuTUXbXz67aqL+qsUtl1UslHdXrFp3RGlRx6uOEHeqNNab3ZtoyqdG2stv27qMfgPhrz3SgtmDxL21Zv8O45T10G99L4eVM1fOF4vdH6K11W/HFlLeeNtUYenVnhCZ1W8mFla/CW2k3qo137fzs2u/8N+j+dgLAEAZ9uAsISApYUsOSD2yxxYNfT7Br3mB23voKO2305bveyc/g+pJBCCimkkEIKKaSQQgoppJBCCimkkEIKKaTfad/B/dq2c5t+WjVHb/csrVPLP6IsJbLp9FLZdXmdl/RQ88J6pdlnKta1iqYvn63Vq1dr6IihGjN+rCZNnqQxo0ep66Ce+qxTJb3Y4BM9UO1NXVTpGV1SPbfOrZ5L/6j6pLJUelxZSmfTFdWe08tNPlHueu/r/Ao5lKVcNp3EscqPK2vVp3VhtVy6uEpuPVyzoF5sWFRfda6iXsP6avTo0Zo8ZYrGTRyvkWNGeWNYo/ELJuvLDhUiY3uwxfu6rPYLOr1kdmUp9oDOqpBdH/atqLmr52nLjq3af+iA/hd+nDpMQBwL8kdLQNAsIeAmEGjutXy63/lb0PV2vnu9e44dCymkkEIKKaSQQgoppJBCCimkkEIKKaSQQgpJSjuSprFLpqjd2O7qPqm/nu/8lU6t/JjOKJVd5xTPrnsbv62qYzto6LQx6jKgu0aNHaXh40eqbq/majSwnRoM76Qa37bQl+0q6q5ar+iC8k/qrFKPK0uxe5Sl7L3KUulhZSGhUfIBnVzift3VoIC+6FFZH3coo5uqv6iTSt6nLKUe8M59yDvvQWUp7V1T/D5lLfOkLij3hLLVfV0lulZXlW+bqd7QDmoyqL0a9m2t4eNGach3w9R9YE8NmzFGFca01t0N3tB5xR/V6SUf1VlVntBrXUuo8/i+ajmqsyYvn6nU9L//b0KEr2A6lmzg05IH9rcd8z+VwHVBiQG7lk+XrB9rdp71af2559kxf18hhRRSSCGFFFJIIYUUUkghhRRSSCGFFFJI/xfpqPffln07VHZ4Yz3RpKA+7lVFOdsU0RVV8+iqcrl0Q7nceqXtlxq+cIJ2/LJFPw7/Qd07d1OVDnX0dqsvVah9Gb3WsYRytiiiB2vk1xmlsylLqXt0XtkndGX5Z3RV7ed1dvWn9Y9S2XR+2cd1X9039NWAuuo1a4h6Thmoz3pW0921X9eF5Z7SKaUf1nnVvWtq5NVlZZ/W2d75WUrco3PKZlf2+gX1ZMuP9GK7r1WoY0m92/obVWtfT107dNaMMZO1c8NWDZz7vV5u9ZluKfus/umN/apqzylPm8/1XpcyerR+AdUc1UrbD/z9X8cU/gi1kzSwZskFPkkCJCcnR5IQlhDg8/Dhw9q/f78OHDgQOc73EH1xLseTkpL+LXnBJ8ct+cB1/O1PQNinnR9SSCGFFFJIIYUUUkghhRRSSCGFFFJIIYX0f53Sjx7RvA3L9Uq34jqr8qO6u+mburdeft1UIY+y1Xhd+Vt8oVI96+i7ad9r7ZKV+uG7cWrSrrm+bFFG+ZsV1dN13tMNVV7UxRVz6ZLyT+uMsg/pwso59ES9d/V+u9L6qn8d5en8te5s8KZe61RCzcf11Ny1S7TjwC79tm+Xflq1UE3HdleBLqWVrcl7erVrKX3Rr5beblVMD9V9SxdUekqnl8uuK6s8qwsr5dTVlZ5Tjvrv6Y1Wn6tYq4pq1q6FJo0erzVLf9agyaNU2hvrW82/0kPV+YHrvLqv3hu6uf4rOrv8w3qvVzkt2bLy2Mz/vvR/PgFhyQYjSwRYs0SAJQNIKGzdulVz5szRmDFj9P3332vevHnatm1b5BiJiF27dmnJkiWR79evXx9JRlji4uDBg9qxY4d27twZ+Zt+uc5NVBjxt/vvkEIKKaSQQgoppJBCCimkkEIKKaSQQgoppP+rdCQ9XVNWzlXuNp/qpPIP6+bG+fVwg7d0W6W8er7lJ2r3fW91G9RbHft105AJI9V1ZF993q6S3mj6ud5u/pUerFpAF5Z9WhdVyaUbar6kuxu9pTe7lFGzUV00es4E/bR2kYYsmaj20wdp9PKpWr9zi46m/yt+fCT9iPfdJo1ZPl3dZg3XqKXTNHPNQn03e5waj+yo17qU0l1enzfXyqcLKz+j88rm0EM13tA7Lb/RW82/1tcdqqrrqL4a8MMwtenbRT2H9FPH7/sob9OPvTk8p4caFdSV9V7UP8pkU/6OxTXnl0X/X/z670b/538DwoL8PI3AEw0kEtatW6c1a9Zo06ZNke8sGcETDb/88otGjBihOnXq6KuvvtLXX3+tmjVrasiQIZHr6IdzevbsGVnc7777LpJsgA4dOqQVK1Zo3Lhxmj17trZs2aLt27dHrtu4cWPkaQpLdLjt785kIYUUUkghhRRSSCGFFFJIIYUUUkghhRRSSMdLhw4dVP9ZI/VQw3d0atnseqjF+/qgewXla/6pPu5WSeNnTNKw/oNUsUkNlehRU1/0qaYnmxf2zi+o55oW1Z3V8+vyWi/qnlbv6vUuJVVpWEsNXjBOq7f+EikWh9KPputwapKOHIn+ZhriysmpFKPzZhvpoDeutV4f/eeOVblhzZW/Swnd1bygLqvxgu6qUUB5mhTRw/ULKneLj/VZ76r6pkcNVWxaQ6MHj9D42VNUuHN5vdzic73brYJuafCGTin1sHI2+1DfLRivFO8+f2f6r09AEHyPt7mU0XEIRiHBsHnzZi1dulQTJ07UwIED1bFjR7Vt2zaSVCBhYK9YIiHBcZIOr7zySqTly5dPzz33nIoUKaJvv/02ksDgGpISHKtevbpWrvz9URmenOjdu7cqVKigHj16aPHixZo1a1akz/Hjx0fGsXfv3kgygnuRsIg2dvc7O8d/rv2bsVuLdV6sFlJIIYUUUkghhRRSSCGFFFJIIYUUUkghhfRXETHKlZtW64sB1XVB1aeUpdSDurvem2oypqu6jemrhj1bq+/g/mrToY0KVv9UD1R7RXfWyKfrq76kq2q+oKvrvKArqubV1Q1fU+5exdV0Yk/NX7dUuw/u1ZGjx/87vCQjdh/Yq5/WLFTD8V31TJcvdW3dfPpn1ed1Va3ndXX1F3Rb1Zd1lzemB2vmV6FaX6hT187qP3ywGvdpo67eHGoMb6frvHOyFLtPl1TLqdJDG2r99g1/6/jsf30CgqA5TwFY8NyeCrB/23F3E/g7aFP83/Pkw9q1azV8+HA1aNBAJUqUUNGiRfXuu++qQIEC+uSTT9SrV6/Ikwq8Rmnq1KkqXry4nn32Wb333nuqXbt2JMHAuU8++WTk2MyZMyMJiFq1ailbtmyRvqZPnx657/z58yP3eO211yIJDpIPXbt2VbFixdS6dWstX75cy5YtU79+/SLJjJ9//jnyaiaIT57AIBnCUxLR1sMa/2Z+fNoaWbPj7vkZtZBCCimkkEIKKaSQQgoppJBCCimkkEIKKaS/ig4cPqieM4fo3qav66SKD+qk0g/qinK51GZ8Hy1avFD9B/ZXvTaN9FmTMnq0SgGd+/XDOqvYI7qgzDM6s9yTylL2QZ1cMbuuqfOSPhlQS7PXLdKRP+H198Rxp6+cq8I9K+mfNZ7TaRUeV5Yy2ZS17JO6pFROnfXNIzq/+GN6smZBfdOikpp0aq4hQwdp/sL5qjeioy4t9ZROKvmgslTMpkdbvKPBc7/XoaSkY73//ei/PgFBwNwC6QTCLYhu/7bguhtQ52+aEX8TvOdVSDyhwFMPnEcwn+RAuXLllCtXLj3zzDMqWLCg3n//fT3//PN69NFHI69Z4vceeHqhW7dukacdXn755chTEqtWrYokDNq1a6cXX3xRL730UuTJBhIHnJszZ87I97yy6bffftPQoUP1+uuvRxIWgwcPjiQgqlSpErmOZAYJipEjR+qjjz7SBx98EHkCY8+ePZGx//rrr5EnJni90759+/5YB/vdCP/c7bclOGbnWuM4n3aMf9v10VpIIYUUUkghhRRSSCGFFFJIIYUUUkghhRTSX0Ubdm1VhRHNdGnN3Dq3Rk5dW+tF3VH1ZTUY0UHT58zUgCEDVK11bb3S9DPdXbuALiv7rLJWyqUra76kqyo/rzPLPa5zajyjJ1t8oM7j+mjvvj3Hej7xtGv3brUa0UWPNH5H51TPrazlc+jqKi/qiuovKGu5p3VZuTy6t95beqvF16rTvkEkATF59lRVG9BCt1bLp6trv6Szq3rX1H5Odb5vr617tx/r+e9Hf7sEhAXYrQV9Z41r+V2FDRs2RJ5M4MmCDh06RIL8fEcgn99jeOedd3TXXXdFEgOtWrWKJA9KlSqlhx56SPnz59fo0aMjSYW6devq8ccfjzwZ8dNPP0XuzdhIUHzzzTfKkSNH5IkInmTgx6nffPNN5c2bN9LfwoUL1bx588jTE7zCiWvmzp0bSXDkyZNHLVq00KJFiyKJjQcffFB33nln5KkMfsSaH63mtyTatGkT6Zckis3bXRv+toSEJSD4pLEW1jhujX/b9bFaSCGFFFJIIYUUUkghhRRSSCGFFFJIIYUU0l9CR6Vftm9U5ZEtdVmtvLqi3ksq0L2cyvaur05DeqjXgL5q17W96nRqoDfafqOnm32sB+q/p0vqvagnu37unVtW2Zu+rxe7FlfTH3tq5fpVOpIW/TcejpvSj2jZup9V/4cueq5zMT3Z/GPl71ZOD3csqsvrvaxHGn+gZ1t9qg/alVGDzo0jY+89oI86DOmucv0a6bVuZXRJref0z1rPq96YDlq/baN05O8Zo/1bJCCsWVLB/501AuX2aU8NkGAguM+rj954443Ikw6FChVSnz59Iq9fmjBhQuR1Svfff3/kFUo//vijJk2aFEk2PP3005FXKNHHkiVLVLFiRT3xxBOqVKlSJDFgRIKgSZMmkfNJRHDuvHnzIn/zBASLzBMPjMGSDTxRMWPGDBUuXDjyWxL9+/ePPE1BAuOyyy7TueeeG7mepx74vkaNGpFESadOnSK/D2HEXC3BYP92ExFuoiGouWsXq4UUUkghhRRSSCGFFFJIIYUUUkghhRRSSCH9FfTb3t36ftEUffhtdZ1f5WldVv05VfqutWYumaMxP4xW1z7d1XNQbzXo31IF2hdTzhZFdF+DgjqzylO6u+27ytv9az3b7lPVHd1JK7b8ovQjx/+bDxkRMdfFG1ep6vDWytXmUz3T+Qvd3PJNnVvjGT3a9H3lbfGp3mtfUg36tVS3/r3UpU83ff/jWE1bNkclhzXVRZVz6eLKOfVZv5r6fv4k7fLW4O9I/9UJCALfFiCnETCPFlR3g+gQry7iSQeeNuBVSPxGA8mHBx54QPfcc0/ktx5IPvBkROnSpZU9e/bIq48I8Ddr1iySeCChwA9Gk1Dgh6QrV64c6YdExLp16yL3gXi1U9OmTSNPQHz++eeRH7QmuUESg+QCiQ1+lJo+33rrrcjTDPyq+pgxYyK/B8F3PNlA0uKzzz7T+eefr6xZs0Zew8QYaYyNpye6dOkSSXhA/Eg1SRbGx+ugdu3a9cdrl4LWJ1aztYvW/huIefBbHCRXjOy3MTgGMRfOYW2ssdb2Q+JBRH/u+da4xp07a+rvO57G/bku2v39xHnMy+2De2e0DxxnLqyHey33jud6iHX0Xx+t2bzc/YiXuI+/L+ac0RoxB+biXkuzcQTNke+C5mTrYsR5/nV3+7R7c517TrwtiJ/c49w7FrE2Ng8/T5tsuP0l0ri3OzY/0T/nuPfgb74z2fuziHExV3e8/pYoL/r3Od5mfJoIsc9cZ9f7+eB46Hjl3SV4yb/ONt4/a48Zv59v4x0/x49nH7mHUTw85jbjfb++sjG5c+Lf8ewFfdl8jF9M//Bp/bnfxyJbW+uLBq/Ecy377eoa+vHPNYjo+0TxI2P4T/KjzdldL3/jGOe4vBONmC/7Gau/aI1rWMtEiPOD+sqo+e8V77hNBuLZV9bLZMLWMNZ1HPPvfUZrHsQvNsbM8gvjsHFbY+yZ7S9IPvg332e0HtzTXUP+zqxM8m/WM57r3fvatfHsHWO0vc7sernk8hCNe7jj8I+T47HmxzHjFxunez5/u+tG3xnNw/p0x0Hju3h0hl+G45UvznOv4/7cL6NrbY7M3649EXvlkvGDOz7+ndHYOO7qIV6dzGc86xh0z1gt1jq7fBJPY+0z2jf/Pvvl38/L1ujX5VGjaPONZyxGnOe/NhEecq+N1kzOos0D4n7+scSz55B/HPz7RPMzRJ/xzNnWMCMKmnMiDf5JhLifn8eYT7Q9SZTo/8/YC/plPW3c8BN8n8i46SMRefa3ROZg9zIdFi8/uOTXFbHaidzDvwOxF/PWLFbJQQ11c6PXdUqph3Vuyce8fzfSms3r9P3UH9R5aE/1nDhYxfvX1VPNP9IdDd/U1TVf1NnlntC5VXPq8gYv6NmOX2jg9FE6sG//sZ7/fNqzZ7e6e+N6otVHurBWLp1b5QmdXymnrq+TT3fVfV05mrynYn1qqtv4AWozpLvGTPtBSzf8rM/71lDWUtl1SskHdWuD11Tq2/pauHbZsV7/XvRfm4BAcBEkmv2N4NJgOvd7/m3f8x3ED0fzpAFJgfvuu08ff/xx5CmFMmXKRJIIJCU6d+4cCfrbeY899ljkNUz8zsPtt98eSViQkCDBsHHjxsgPS3PtF198oQULFkTuA5Fs4KkIno7gB6VJBvB6p969e0eSCzwFkS9fvkjj9yZIGKCUeCXUCy+8EEkuTJw4UT/88EPkKY1rr71W119/vd5++21179498rsSPP3A70fwOiiUGUkIriFZUr58+cjYeMpizZo1fyhkWxdbG2v+Y7aWsdp/A5Esat++vWbPnh0ZE2swbNgwDRw48I8nUlavXh35PQ1ebUXyiU8SQLx6i2PM1SWUO+vGOZxv17Cm/AYHr/CCWC9eo1WnTh19+eWXf5wbT/v000/VuHFjbd8e37vaNm/eHOEdEmNcz3x45Rf7Go2YB7zMkz2NGjWKvEKMcZYsWTKSCONHzXmaBgMYjeAF7lOtWrU/1i9Wo2/GBh/z2ySJ0LRp01S2bNk/1pL19z/dE0SMcezYsZH5uXuM/CEbu3f//5lgeIP19+9b/fr1/3iVGsTvtAwYMCAyL84l4YhMck+ItePfJCUT5QHGyA/aG1AELJB0hM/oC53Cq9rQG9EIvcLecD56DB5hzBC/J0NilH6C7h+r0Rd7SAIziEhy8js2vAKONWEuPJ3F38jV5MmT/0iKnmhib7g/P9JPcjdo/DT4B14cNGhQhry4d+/eiMyzz/HwudsYw6hRoyL6IB5CV3O+ySP2gafdTK9kluBJbFDfvn3/kHfmwlN2yDvfo6/gs3gIG8eTfsgJfdi68DevDoRXeW3hiSKcLV45iH2Db901hsfRY/wmUqzxo0+RmUR53uQHmTF7wBOJXbt2jasveJ8xIw/oMeZihPyy38yBvtBx/PZTPLqfMdAn9+Ba+mCMvHJx+PDhEXvA2NF16ECcjWiEDKDLwAWubeMJS/QQtsD0mp/QUfAO4JBxcD2/c+U+9ekn1/5wnckWn/Xq1fvD/sQas0usFwUa9MX9XX4Er8GrGdmKRAg+4ElTbEIsHmA+nIM+ZL9iEfsGf7rjj6dxLtdMmTLlWE8ZE3aPNc6MTmO+8JMRNgX9EWvcyAC/X8b8wLN+XOUSfMZvrWEvuBc8DPZGD0cj1o7XoXIvxoDN5bWl0Yj5U6gDHka27Trwdtu2bSNrGcu2RqMVK1ZE7IrLExQb8UrWRHGxySTFSLa2rCMyiS1HPqLZFZNJZInrsCOJyqTZCFcm2btYmJA+wNuGCdk75o8/FI2wJdhrcC/zZJzHazuwl/AoeIm9MHyOfYXgMcbJWnKcht2KpSPgMXQJ82Kc8IlhB/iZojP4yfaJecMP0Yh1BE8yX+wD19h643uCT/FLoxFFc+gVbAbjpw9sSSzcD8HX2C7jT+7JtWDVWHsL/4IpsfngGu6JveAVwieSkE3mhSwyNtubWGsBcdzVn7z6GPsYi/cg5sW1rAn8ausSrTEu+kW/uLbcCB7i1cjx9OViA/zVoL1jPeBdw4ToRfCVu1fwEf0wb/rlPOw/OB3/0K974AF0KufbNTTkYfz48YHzcsm93u4HzuDajHgIOQnyr4IaegtdQiEluieImB+40HAoPMnbIjIi+AIsbHPgE38dHBnLPiVKzBk9gE71z89tpmfBbhnxOv4TNiCon1jN+IK3diQyR/gB/sSG23qhszMaZ7xEHIq5m8/GPVgvinP9vJsIIU/wgo0bGUJHZITFjLg3Or5ly5YRPeSuZUaN+4FDwInxEPeiUBl7QGExuoE1wM7Hu1dgJPwHrg0ak9vAPcghOCgzWOfvSCmpKRo+7wc90bywzqj4uC6o9LSyFs+m19p+rklLp6n9sO56s9lXeqH953q0YUHdXf013Vwvvx5s/YFe6VxSOdt9ojzdi6np1H5au2WDjv6Zr17y0ZHUNK3YuEZ1J3RT7k6fK2+7z/RKt1K6r9UHurnmy7qj8vN6pMEbeq7tZyrQ5Eu1HdJVI7255mnxkc4r85jOrZRDZ1R4XDlbfqTRiyZ6DHes478RIQ9/mwSEBc+DCABKs+PmwJAw4EkG/saZJ5hvPzAN+ESZ4GyRdLjjjjsiP0TNkwYkIEgosEAYWEAIgIZkAg2wihHiWM+ePSO/FUHCAgPIvRkzioAftL7lllsiSQUSEBhWHDyqOVBMjAVDSxCPcfAD14yB70leAEIAAvyeBEoIY8r1PN2BMSeBwXj5LFKkSAREMC4cfcZgxN+sj60hn+6acTxW+ysJJ4h9wuigyAk+2BMuGGACAvZECsb+pptu0tlnnx15ioRPXmfFq6+4jr5cwuCyR5xrjWuuvvrqyNpbgBdHB965+eab/+g73nbWWWdFeJAESDzEb4O8+uqrkXFz/a233hpJskRzRHBC7RVf3Oeaa67ROeec88c4r7rqqghv4tjw9E0048T38DXnxzNH7sHrwrgncoIzE00+XUI+AP2XXHLJv90HecOJjEUEybnWnR+fl156aeR7koF+wom7++67/+1e/P3II49EAtbG3/AYr0S74IILIsdvvPHGCFAxnmHcOAvM2e0rnsb5PHVlewjIdteAhuzHcnBJtpGY5NwLL7wwwvuAbmQZ8Hj55ZcnPC7aRRddFNElfscO8EOAFfmCH/mdnPPOO++PezAGXl334YcfRhy0oLU/XkI/4QTBYxnNjX1BjxOAnzp1akRHBOku5BBdyTWJrteZZ54ZcWoYVzxE4AVHxPgV3sKhJkiTWWKf4AX6JZGObUFX2FyuvPLKyPeAc85jHaIR8wAQY4tIfiP79EFf1h/6hGPIODY03iByNCK4TEACx4niABu7NZ4A5LeW0GfovSCnCD1DwIAnDG2c8TbOv+KKKyKBeAv4oXdeeumluPtiH5EHgiKuk44jCf+hO+gL2aLAgOBhRnYUnuV3p+gfm8FvQaGvCQgh68ZD6AACWmAIP6GjwB2MAZuHXnTHzXieeuqpiC0gIBbEh/SLrWN+3A+ZB9+QMAoisz/wtdkf7mVr6dofbHaswDOOMWuFPuOe7JP1Zf3B72Aj1iCjxHy8BE8TkOXpWLtPUGMPwAY8uQp+xFYHJRPZa46h07kuVp/+xrnoVnRqPMS94BFeJWrX+/uM1dBpOK7WF4Eh1pdjsfpijDw5jB0jWRQtCMB+g4tZN/qDtxlrrKABPIB95j5cAw9hq/0Er4KJSYTTJ9iPPbLr0C3YfmwUPI2NigejQIaH4Dd3Hfh9NuQyI3k2Yp682tVkEjtt4+MTDJCRTDIW/Ax8Ca4zmWSdgoggC+uFTFJc5ceE//znPyMySSA/lkzyPcFUw4Q09BI6JhqR9DB7zfrHGme8hB1lrIZx+ASfW9EE64POuOGGG/5tnKx7tH1Cd2TLlu2P88E4yCyETsGXcI/nzp07UvTlJ3QWCSmCwwSp7r333j+wO9fxic6muI3AO2vhDwgzRnAJgaSLL744ch17BtawJEsQwctgNPaY+9g96YNgWVBBjhFjYI7YHJsjeA57diIJm4iudHmIe3KfaLJo+tjVAegNApoZ4UxsOjglXntuOgL/2h9wpy+Sp+DKePqigV/oj7EiJ/4APjED/FjXnqN/zS9j7vAy+tXuyScyj6+KfPnXDZ1NHIDz3HHedtttER8mViEHc4SH0EHu/eAhYg+x8CM8BMaEb9z7xmr0y/4jz2A41ye3vSNWYuuDTQarxSLkleQuvrI7h+uuuy4St/H7/cdD7A94Bzvgn5u/oWfBqCQv0TfRsAI6AYwd1EesxhzRheB3w7LxEHodmXR9cLDKiUg+wmusuRsr4RNMTPFVvHYziNBn6FDWlT6RXfA1sYd4CH+HxCyxBhtbvI3z0cnEkeIhZIN7YTe4lkaRM1gp3r1C16FHDNPEapyD/QMHoTujFRT+2cT+Mr/UxB70yBSlpqVq2ILxerjpu/pHqQd1XZ2XdF+tV/VG40/UckBblWldRU9Uf1OPNHtX+dp8qRcbf6rszQrrhV4lVWxYA305oJaaTOqptbs3Ky0B+TlRlJaeppU71qvx+O4qPqCOvhxWX7l7FNfDjd7Vcw0/VL62X+jRpoWUo+pbKt2skhr0bKZ8DYvq/vpv6oraL+ik0g8rR5uPNHbpVA8MHOv0T6TUNOLIJ26d/msTEBCMjKF1mxHHXEXGMZjezkEJEngkcE8wxqpjq1atGlECOAJUBgFsCYYADlFKBHUwFjwxwXmAZxxBgjQkCQiK2Pf0iVNRsGDBSEKDVyahXAxwUKEKoMSJBpQAHjD0KEECkFwLSKIiCmCLYiW5gcLBqeN87oMB4zzuh4EAJBO84Z4kHggeEgghacFYcFQI2tj62NqxPm6z720tY7W/knDgyKYzNxIsVESTBcdhA/BTGQUAwRkFuBEcypIly781HGXAths8A5TgoABy/edjaAhwGCgkaMaPgmOw/efG09gnxh0PMSYCc3YthhxgHLQPOJqMC14AiJxxxhn/dl9rBBlwAOAjeNRdByMCm8gHxiyoj2iNe5KwQ5nEcngg1hyHl8Sgvx/GF8v5Yf7wP7/h4r8W5wRewBF0ifEwLgJv/msABgAECHmgigQZOumkkyLHcSIIWnCMe5McIHAdbY1jtZNPPjkSEGb+9EUlCMmO00477Y9zcFzh0aCKI4ArvI0e4Vz4kEoighXwPY4Ce2x9JdLoi0opt0obp5cqLZ66wkGCJ5iD/9pTTjklsrbwK04Ueu1EEvNGTxMM9d87qMEHjBcwz1r6g5OsPZU/ODhB12fUALwAd3giHsKx4NV7dj3OF/o+IzmJRtgr9BK2ioQLe/6Pf/zj38ZI43vsDvxMsCxI3iEALnoUZwoH19+PNY4R3MMuWpAmM8R+EKjBWSZRAv8E3Q+5YPwEVnBm/I4b/WDfscVB12fUCCriRGL/sMesETo06NxoDXlAdng6kSAohCzylB6BQjuHuWZUoQY/wFfocK5j/7D/6DsCDgS87b4USrAm/qACuoB7cz8Lmto1bkN/sfZ58+aNFD34g48kMbC3nMP59IPeI3DiJ7M/2Ff4MZb9oT+cXOyPXy6NuAcYDHuCrAX1RYMfsYtUWR9vcBOi0AD8hQ0Kup+/cX/2GOeXvfUTzifBZNYl6PqMGryP3ouH0EVU+LOfQX1l1LApBDCsL7AoRTBB5/ob+81YsaXgZH+wCn2LjgGjGq7gE1wcKwnLGAhY2H3YF6qEXWKN4SUcbgJt4D6z3W5Dx6B3CZJRTeu+PjUaMW6SkvgPp5566r/1h6MPxuacjIg5ksTISCZPP/30yBzNLzHcaQQGphDA8Cfnx5JJ5NcwIef670dDJrmnyWSQjcDeUHThYkKuISkRlLRgT7C7Zq+5Lto44yXWGRnHvzL9Aj4Hb6BvIQrEGCdBWxsnfMnaBwVQGacVdHAua4EsWwCO9SepxZ5xHB4AUwQ9hYPuxy+Ev0j4Btk0bDT6DJ1FMtkfREbu4Df8ULse/YJcRrPdEHwBnuC+/ntiP2I9mcockVlbAxq+MgH3E0noenA2GMPugy3Az46mA9hv/D2Xd9GlYIdYCRmI++HTJ2LPWXPsF74Fvr4Raw8OJhEVdF205vbnt0+sL8kuOxdbxxMBNi8wNMF5v94BSxAPAL+6+BMcwLrAW+75NHA5+iSavYW4H78xGcRDyIQV4QUROgA5QR7918ZqzI1rsAuuPma9/XtHMQrfxSLkFiyAHLv3AUeiN2PJUKJEYBdfzPBRRg25Bzsjj/i3/uIldBHyQdI26PqMGnyGPYqFL/1E0QgJSpMv1gl/lCcXjodMV2OT/ViQPUefxWM3oxExFPwVs6PYfCr/mU88hB/BkybgBXds8TZ0GHHAeAh57tWrVySBxrXoBPwxCo3i2SvOwSYg8/5xRGvYGdYE/AZeitdPPZHEuPfv26sdOzd7nzuV7MleJHDtDeVERxK517wNy1WoV0WdUfphXVktjz7sVFH1OzdV1abVVL55FVXr01gtJ/RSlymDIq8req7N53qqXVE92/4TfdyjgobPGxdJZPxVdDDpkAbPHq0PupXTU22L6PE2RZSzVRGV6FdP3aYPUZuJfVWtVyOVa1xJVRpXV+3OjVWwY1mdz9MeZR/T5/1radmW+IqbEyH2Ks1jU/YtJSXJwws7vD3d4snQiXu65m+RgECIXIFFgWMECLLziQI3svO4lmAkyooAM4F9gicE8wFZfG8ZaQK+gFucBB65RYECOvju4YcfjgAhsutUGZBZ5N+AIfrB8cJAAihQroB/xsD9MaxUflGJAyAHKJqiJABJEoHx4PjiAJB0oNKCTSHwScU0QUmABYqLV9RwHU9R4KhwX0tekFwBLDAu+mUOBDIBD9wTIMq/GZu7pozTmh1zmx37KwmjyN5RzYVDxH4DKgB3ABNzhMxZcp0QGsAN4+5PQBBwpR8q89zzaQS26Nt4i+ok1jUzCQiMOwkiAjvxEON0x0SwMehxVSr2AY7wSJDTE9RwngmYkcDxGyd4C+coVuAnWmONkQX69QMsl1hzwDUBAX8frG1QlaMR/Eiwh+CxP+jKnlPB5D5BwPkES3mVmR8M8W8SfXY+sgGIR94tiEGyxir9WCscB5xQP8iNpxGkx2FGluiLgBFBRXdcAEnWBj72E8khEg62N4AadATjJsAD4LN+Em1UCeGomxzhsOO0EJiIFZR2G/tPVROOVKyKqUQJ/YVOtoBuvA0+R+b8gNqCzQC0oGBVRg1HAhsAb2VE7DX8wzpyLffDIUR/Z+REBxG8SkUkv2Pkd06jNdYBe2WJb5dsn9EfjM0qdLB7yBLOIZXQrD3HkTkqj7A5ZucSIfgePYajA9/TJxU7yAF6B/2OzaMSz/ic85BDHDfXiSbwxKPXBH38c46ngQnQJewRewHfsg5B52bUWBMcUuSHNcaWMweOsWboFJKufn1rxBjYH7CA6QM3GUkgG1vP9+h5As1UYbm4BxzEHLAV0QKO/kayjnuyDu7YCBayH5a0JeBIQNP/JAr2Al5AF8XLj1aIgWPl50eSMMgGWIl1g3dJVFO9Dj/S4EdkkOM0AoSMDZ15PDgFjGRPtwWNO6hxf4I2XOcP9MGf6GdklfOCro/VwIz+gHs0Qi5IprH3mdFpJLS43voC6xIASmTc8BwYm+CYqxf4G5xNEhZ+41zwLMHHoAA2BC8yHuwS5zMn+J9+jOB9dCtYBhsVz1ixUcgVATN/gN9PyJ09/eDvGxklWejKXxARXKVghrEnKpNgelcm8WWQSSuuIfgF3/ufIkG/UkyQCCZE14Kl2Tu/TNIfOMnFASQV0OFBmBSbQlDb7DVBxqBxJkKMCf2Pb2QFG9gp+BR+Re7BwozTLT7CnjFON6BsxDjhA+MxdDi21QoowOo8cW0JYbAp2MzFE9yXNaCwhOvjkT14CWwPlnOfOIWX8DdIuMOnnAtGIcnu3xOXCGbhhwbpX3zSWMk29DlzZuycz9phfy0JcyKJuRIgNj4CQ1PcYol7l9gD1ge7Y3NhjODAePgI2UbuMmPPScaQXLPqYXQUSX2KkYLOz6jB/1xvmBiewcfx23OK6Eyf8KQh++D3M/g39s/vu8GTJMD8fi+8RvCS82NhNXwR/OMgHmKPYhXOwUMURsYbjHcb4yOgS6zFiilYb/QuNolzGBO+jav7/URRF5X1JHL8upr1Ja4SzdZkhsAa6FgSnO69MmrgKeJO/tfCgT8pBAkqhIyngb/AiIngH3Qi8miBfHQSyfnj0dMQ+hgMZxjNHSf6EVtwPMkg9AVYwmSDPSfuZvKaEZk/id/hji3eRiGp+/r1WIT9p8jYbAz6lSJJ9Gs8e4U+wG8gLulfy4waOBu+x09LhC9OBB05clQ7tm3Ukvl9tWhmTa1Z0lab1g71vuOVwAe948dOPEG0L+mguk0fqDuqPa+zv3hQX3SvoUHjhqt55xbqN/xbzVs6X5OWzVaTCT31csdvdHutV3V5tTy6vlE+lR3eRKs2rPYU87HO/gJCNy/9ZYW+HFRXV9Z7QZdVyaObar6ilzoXV8tJfTVzxTzNWzJfvYf0VeuubdVvzCC9266MTvvsXj1YK7/6zx6pwyn/f9Hq8RB7dODgfm3ftkhb1o/SumVttXBmbS1dMEi/7Tw+HeHSX5qAQDAyamyO2zAkgD6cc7K+fAI+LaBj10EoG169hDMHmAG0EozEYcS5Q2nRJ9UoKAaMMAoSAwEIwoG0317AKOKY86gXgQ/ALgCP4AmKnOModRwXwAH94lBjGACoAASUCQkPjlFJg4IgsM48qMYhYEawhaAQoICADOMG8HMvzsFxBwjjbOKQ4DRgvDEcAH8AChlhzgP0AWzI+BLgYDzcm/HRgtY3qNl6/lXEmuMgMS/2hX1jngA3N3hCQATgZiDXgDwgBDAPwHeNH4YEZw9jhoJ3HQj2Ab6wufM3ho+gCMdxKNkbHK1bb701auM4ToUb4M2I4DtzpJgDe+/P8LMG8CqG1AWOjA/Qa+MCCPirsvg3QAjj5BI8AmA1484nwCTaHHEK4E0zjtwL4B9tnuwTfM2j/7bWzM/2CYAGD7uBRpe43sA719Ps3lyLvLhPQBgYMmBqjfMZN8Ezq8DCaSFBYJU89O06r+YgoiNsLVlrAhRBa+Nv7CHXW1+815Hgmrsv/I0zySPIfmIc6AcL4hDgRIfhnDJnqoYJ3NleEeTBKTCHnWb7SfWHjYvz2XMcXWTDnH2SSayRXUs/OOPssV1HXzYeGjJBkIBqnhP1yDM6DF41sA+vEyRkfjYHGuOygKk1gDnA3q2eZ+0t2AwvsM+ANeTI7c/fmC/OEjyBnMSjE9GdJCusmouxsz6usxkvEdCEP5l3ZuQd3Umiyh03+o+ktek0gvnYNpKt6FmcS/QewQA3GAifYaMyMwece3MuWXdkFucSm8v90HP0jW43WSVAho214BCEbUf/WfUmOoSkJlXT/r1zG+sHX3BfC7TQF060zZG+CDgF9cU6wys4+7bGyBWyaboHfOI+YcM18IHZKT+hewjIWsCF+xN0tyeSWDOrxCX4iR3CEbO9xP6jT9BNlsCgIb/oaJNZ5oMcucFQ5gEecp9+ApvgaNl5jB++cIO26HjWnz79/MhYY/EjeoTXp7j2h7lwX+y8OcUkbqggg2/ZexoJZa5F93AOawXf8qqu49E58AJYzLADc0d/+vUMe+8GY2nYd3Cea7fgKcC1VfEbf9pexGoEu3hCwF85G43AvjjhyJXpNPY1I1lgj5BlKtTBi9YXmJnjjJu+0Kv+vlgX9pF52TrAWzwN4wYxsCfoO+yJ8YkFj8HKQQRvgZcsqAUfwxdWLIBeNd3lBt3MRpkuZ37oRtNvdg6Jkoye4uJeJGKNb1kHmysyRgAqFp5jbiRRsNOxZJJPv0zCJ/C4K5PgfIqQXJkE29gTABD4noCyHxOiP10bwV6i39y9Y93wK/zBRj8mpLEW8Cj+iF+nocdZG9NlYA10hzvORAk7gw9jiUn6ZQ+pRDUfheKQoHFyDQFOP9k4LeHIuoALbE8J3LuBLtaPQjE30WiBSOyGjYt7sn98ZzyIjYJPOWbnkJjEd7XkAjqcQDX8QF80il3g02hYg7EyJvQr/dLYUxsLRWqxgmXoVfxekyF0KpjYHyA9EYReYQ+xvdyLMcKHBI5dvY3cUAhEoYatF/aAvQADx4O7kBuCqWbPkWH43a972RtsFTjE5Bz5BOMRU7C+wD/mF0Tryxp7jb60/sDHvGsefcLYaSQvzZ4jz/YEJXwMwdf4pRxjDWwd6Iv4hf8JCIoRiAfY3tv+cx24ye/nuURiBOzBnLiG5vIQeDXaqxchsKKbGGXM6DPTNf7GvLGfpnv4myI6S8ax3ughGw9zxreBV6MRmJFzXB1q688nsRoXOx4v2dMW8A33sDkHYQU7xxq+AHLvxiHQ2+wBa8Y57FuQzfU37oceZn5BibxYhB8ORsUestf4Q36MlxkiGcZ4XPtje80nvly0p57iIXjd/H/6JGmDfo+GJfxk/qTpTMaJDYgmz9bYG+KI6IJ432SBHsUvsGIq7oNeipcXmRN7YkVW7BP8hI7xjw9ew+7YusP3JC5Yr1gJ7D+DUNG/7diseVNr6Idvr9e0YTdr0Y+5tWp+OW3dOD1hvzEWHT1yVLv27dLYRRP0bofiuuzLR5WvxadqP763eo/prxWrVmjDlg1qP66vHm9SWOdVfErnlH9K51fNqZubv6Ha4zpr07bN8jTzsR7/AvLU/rot61VhVGtd2yi/zq+SW2dXyOF95tDTzT9WtwkDtXnLZi1esVR9vh+oVt931TP1CumKrx7Tp90q6sclk7T3wO+x3RNFPPGwef1E/Ty/vBZPeVEzvD0c3/8WLZjRRLt3Zfx7hvESMY2/JAGBIcaIIhx8snj2b7fZMRQ2VSkEnFHWOIs8roqjzjsOUcCWRTfjDOhBORF8xqARVAbk4eiiBO08lCaKAcCGM46C4RhGjwAW98PBx9ChFACnCDaJAxxkHCwMMfdnrAAqrsch5VwCejxlARBgThwnWM4TDYydYwQACYoQQKf6iTFZUAQHinlS8UXQEWeMAAHKyTK/3BewSZ+MmSAIlQ88Zoejxlgx7pxn62rXuevMp7/FA/r+TCLxg7HE8OC4AsrZK4wIVbqm0AFmrAsOH8DGQAzK2J+AYF4Es1HcKHaADsrdjCW85VY7sScEh+04BovX3rDWgGgCTNEawQmSKPEESOAhMvQW/OWT94W6T0/Ag/ABc+Ica8yXQDeBD8bFWuFUEczAEXNBAYADB5m9NyJBhkHHuLMmXINDgkPgzpG/aQBHggnmpOFYk/GPVkUB2CVAwXmcz3gApLZPgFgUEoAsiFg/gnGAAa7lOgsuBCUgcBZJ/rG3zAcg4K4rzpsFjQgYAWIt+AXPkDQ0Zwy+4bUnGHv64hyCC+gGd6+DGmsF/1hf7B9yyjysL2s4OpwPf7qEjsAZsD0kGIEeQzbRAcg6/Gz3Y98ByRbEgW9x6ghQ2HnW6JvgL/dEjwHQXOAMwCYYSBCbNaB/+Iu9BuS4ATmu43o3eHI8hNzgfLKH9I/MA3DRZ4zD5sB8CaQZb9HYY75jTkbsI+O2AAm8i10g4OX2F9RYNwIdsV5r4BKyRTDPHGH0EtXf8TrSRowZ3e9/xQqAE72ITJkeYn/Qici3m3zC8UcfmA7i/thGkioG5km0+ysmsQnYKoI71hfnE3gxexsvoReYv+kLAh4Ejv1rgSxiF5mf3RO95FZmwq/oNeNTZBs+gQ+YZ9D+0dBlzBvZMWcL+wFPGR/TJ8FH1tLti/WlUTnLUyUWvGKdWTvsD3NBz3G9jR09Be5wda0R6wt2oT9kFH1A0A79wPn05z4qjxzg8LtOEPfletNtNP6Gr9HfBCoZN2tDXzhSdh4NvUIAmrFA6AMcW9NN8A62wcbPvoN5SCS7/SCbFGTw1KfxYzT7QwAOTGV9cm/Od3UigRn/02CcB85hbtYXuppkSLxOaBCRBHP1K84/eoxkmLv/6AmKH1ze5G90IzxpxN/YDwvMYKeMP62/aA27DH9Gs4N+go95daI51fAI+wCfMuage1hDp8E/hiPpi+C32WTsIYFQ+NH64hPcy5xJehgm4pM1BKMb4Wwicy4/8USYv4rXJXAyY7DAKDrdrRhnbdE/loSyxmtSsPfIGmMk4AkWglfcwDT9IRNWtOQndCRFIBYsRd9hRwky8TeyCFaw8QQRa0qw0OwWDZkkcI6vwf0NnxFw8z/JBb6lEMHWCHlDV7syic9gxw0TglHdfkwm/ZiQwDP9uTLJGFyZhMDM2H6zEdbYG7Cafw3R0QRwLehCn+iOeLBvNGJuYGLjSRr6zuwBawDG5ulv/zhZc+bu1w02TtOZ2EuejLRxYvPAd7beBPvgJ/Mf0IHYB/SYnUNDb4C7GC98z5qDAbAHZi9o8AU8bDiJBA262taNeeALxnqCAR2BbNoeYrfAGsZzjN+SNEEEDoE3zLZYsuh4g5BBxBgI6tvToDR0C3LuJjyYExXvrtyAW7HZtvYZEXLp2nM+WX/m5tpz9gf8jj63vWEtwVnIL4TPzz7YvtAXvri/L/QNDd3j9sfa8ho3+rN98NtzEhSuPWeuyBy4Ar/GbAg6zJ+AYE3ASiYb8DNjhX/gS57aj2VHsHtgF2wo1/t5iKIGgtXReIjkBD6nYU38OXQjsmJrY+sD1mO98V1sb7gPeMZkGXvP/tt4mAs+i9knPzEudJT7Sl90HraBPrBJxEtcv/B4iTXDpticuRd2B6zAPG2+8AJ6ytVbrC+4wLUd+PbsE3vNOewzPITNdXnM3+Bf7DfYzZ6wiZdIgmAv4RF4hSIKCseCMGq8xF4wb3iXedAviW3sLXvBvZDLWAmxjIj1MH+Khr2L95VGkPmThgew6UH+ZFCDz+D3aLjBT8QPiUeZTWIdKBSJNxlP4Rxv6DBfFd2E7PC0tZ8vwKUkO7A/nMs9sWnwyPHY3sxS0uEkrV3WRdOHXq/pA7NowcgztezHW7RmUVXt37fxhIX7D3v674f5P6rx6PYqN6yJ8jb9WHkaFFLx7lXVYXRvrfx1tcYtmKwCLb7WhSWf0illHtVV9V7SPc3f0QPNC+mz3rU0bdncv+T3H4ySUpL1w8Lp+rBbZd3f9F3d2/J9XVHvZW+sD+nS0k+pYJsSmrh4hpatXaH2o3rpmy6V9Wy9d/VSi09VZWQLNRnTxjs+5YQmdvbvWa/V88tqyYSbvL07W9MHZNHM4Xdo/c/9lZx04p62aNToL0pAQBhRhIOG4qMREGQh7XvOATwizChNHotFqSPYBL/I/BOEIZhIoBpFRD9ch3GmggeDRsAYYIjxoH836EFACYHGCCDcVm1OP4AjgvkEsTDk9EtDiQAeuRZFYYqb+zNuPmmMneuoVmE8nMf9caIIpDMeQCZ/Uz1OBThKEoMLyGF+gF+cFJw2lCTVEcwJcGn3hRgTQXP64xMnB4WFscShsqQLzZ0//6YfGzPNvvOf+1cQwBVjCWjDEcVBNyNHMAVnAcIhI9BhypdXwmD0MH7+BAT7hgNgAWeUPNeYQ4KRcgMKXGvKnQYwozrY1iijFu8aAsDYazOQGFuCKy4As6oTAyzMl6x4kSJFIlVpBPqMB3GUAPUEXXE4bfzME1lyq/gIKlgAlz5xlnFSguZI38gkr8UwgIWTzppGc8zpC97FkNI/fA04tApxgjSMyR90MkJuAO+cB4Al+WEV0DjEbgKC8SFbzIHj3JP5s4fcm/UF4Nm+sNeMxZxJgCuBAgMbrCOOrAVFaATWWGv/2gQ1xmP3ok/2w0C429gX1zE1ArxbhSvn4XianqJf//1wIgHA6D3OB+gT/EWW/OczNgjdi1ONHLBGXAdgxiHDiUbO0GdcA3+xz4Bu9K9b5QmYjVV5lwihe+nP5g3PEChgrO4c2B90Pck6NziIfnDf2cl58Kw5gOwB8gWAd/uL1tx9zIg4l4S2JcnYA3g0WoIuGgHYSSqYU8taoBdwhAkYwbuurWTtAa7so60D+4PsmDPKHLA1pv9oOD1Br4mjb+wH+4wtQYb5d7wBASOcbPbS7keyjb0MIngNHcf9CGqybq6TDu+RFDFHFd3DmJg/6+7fN39z95B+mVs8ffFv7CwOC8Enzke3sCYEXjmOvmS/bJ6sMcla90kcI/gY58Gq39gniivge8YIvxIAcfsi8W16m+v5TRAcKTsHfkPv4ZigS9knxk5f6Ef31SI05kHQwwAsf1vikoYdtQp5CPtD0MQC3ugKEvmMEzsJf5vN4J7YSYIIrv1BFrDlNg/OBXu5eoSgUVC1HPNBdxPMMn4k0MdaZJZIurjyQrEDgR6TK2uMl2AwQSXDCswfR5g9M4KnOMd4ChuJbmU93P6iNfY+Xj2DTON8WkAEnQ0exgYE9e1v7n3oi4IVeJq+wBhU7Pr7glcIGpH4cHERfAiONWKv2Fc3+IqdNdsVROgvbJUFweAb+rTAKHvlBpsZK3tHIpY9QD5tjNhRcI3JKo2gVqxKRPQpdoT9RdciC9hb/A1wA9gArGW400/sMUk4Vya5Jz6LK5PoCs6lOho7YfJEM5k0HYv9d2XWL5PgfWTSxYQmk/hNfkyIv0GBkyuT6A1k0g1moQddXWANXqNvfBWXf8BcYGNLSoHR+O54iH33/8YV/G6FAOgaAi1WVe5v6FP/OEnuEKC3ceJPuOMES5A0sz54ipZCMusDHYi9NBwBn2DPCETip4HXGReN9aRgDRtj9+N8eMgq7TkHXGI8zXESoGav/YSuQweC7ziXtUEHkbS1gBU+E/ggml5kDUjscz3nw3OME9n5M4g5knCAR7knc8Uv4552HFzMOtqYOBd/KJGCFvCSu9bR7Dl7Q7EDCTLzQdDXrCP7DyFXyK31hUyDeaPhDHQPfrvZEvgDnGJBfPYC3uUYzW/PIfAAe8i18KXxIXvsT0DggxHXYHwm8/gJxpfYesYaROhHktRcw7noW2TX5SHuj/7IiIc4lwbPoZ/p2782yA77CDa1IDL3RI/YUxbIlVtog95kjNHuj3y4CXOSNew9mAB9Bh+RZHMTQMdLFAO5WIEkK3P2YwV4gaQw62k+AONB74CJjLBDxLTMfuOTEKjGTwziMX/LzLyIDZmvD++ApVz8khkCq4HTza/FXpHcQn7MzyBuxZOdri6Ol5gnvGA2jgbORbfHS8wR+Tb9gv0Dz8FfQWvrb4mMm3lanIpGrILYFf3EQ9g9/AhbO+TfYjZ+vuBceJz1tvuhB8A+hutjEfNKSjrsYYOkyDv/j1dSWKa9Oxbq5xnvadHok7RsVBYtGfUPLfkxuzb9Okkpmc9z/RvtPbBPjb5rr2eavqsP+lZS9e9aq9a3zVSpSx016NNKwyaNVMX+jXRz9Rd1bY2XdX3d/Lq1YQHd1eBVXVP7eb3asbjGLJrylyYgDqckacjcH/R8m891fa3ndGfjN3Rzozd0bd1XdF2tF3VrnVdUfXBzDZkwXA16t1T1bg1Uf1BrVRvZWu/2KaenmxZUq7HdIkmfE0HJqZ5/vXacFk94yNuzLFo6MosWjTxLq2Z/ov27f/59c4+DuPqI978U70a1atb46xIQCBFKGwGxhrEEdJsyRzBQbAQqANhUBgH8cHxwanFmCDJRsQ7YQji5DnCBUsHhxkChCDB0gExXifC3OQFkgBFiwKMpdT5tbPTHZzQlxPd2b67j3/YJcYw+aMwTpYGR4m/ANGCUxvd8h1Gz9x6jeAngArQxsMybwBp9cT+CG1xn/8aJo0INB4AMLwCIedqYOI9/u2vN926jH9uDv5LYQxIpJBcAZ2T9cQYBg6yDZdQBfgZE4AerpKBRrQnQZN4Q6wFIwfhyHB4imGEBZhxQN1gHgDVDANADCJoDdKKI++AYEngxAAm4I7jCXkHsCYAQ48JxGgYZw49DCj/5CZ4lIELVmwV4mDMVYG4ggECDOXmsC8ejVZ5AACd4zBxjgD6BNreiyYhx4TBZsIIx44BhIAnU8B1gFDAdDQjRB4EJzgU8ca45DvRH5Y392CHrBa/wxIIdBwihB5gbIImkoxEgxq3OYp24HjmAkC3myrpxnKAHgT87ngiho9gvczb5NEBE/8i3GzTnHiQT3IAfuixWJQa8SZDFHAkCQFTYxXLk4BH23IJPjAV9i7xZosVPyAjBWPbV5sCa8x78E6E3cObdHwyj8pOEWhAh26wbAN/Otyp7GztOLg6BHUeHcPzPIMYDj9o+E9BCPuKtoIEYN2sJULZ+CDCS/ML5gy/9hI4gCY08WJCU5upK9oaniYyfaSS70ZEWPDHiXGww9gdHEWCN7CfK+zjLBA7tfiSKSLYxVtNvRugsZJL7YcuwARaMgzhm71GmwXPo9MwQNtd1ognq4GRGI/bVrfRCXqgCtAQEewY+MV2KLiGZEpSYRf9ip0zm4Ff0pK0HwUrTjzQcbILLtj/oO6432cOJJckDTwfpbvYSvkGPokNpBFfBV6wvx7k/PGb3xHaak8fcsD8kTIwf0a1U9YGtguwP+IJADvbHgso0AoOWbKZfqiNtHjSCUziHQfyIHnP5kaBxZnQxRH9gR3PIaeg9N+HlEntjCWE7n/VwK/8Jzrt6iCCPBbVONDF3gix2L3Q+FeGZIfoCB1lf6EcwJ2sURNhqijUMr2BbCWybvkXXEdS24zT4IEhvGbGO7D19cT5yBn/SJzgXPnGD9dgekg/oF7uvS/AYehcdAVZBB4F1jPdcQgYoZDHZZtzINtgSnWuBJNYbW+PnOdYJXwIbY+NHxxL0iCaT9IGdQz/Dg+gAZJ454wfQJ/jfDWKxPgTrIMOEBMk5TkO3xpJJ9Cu2wI8JST7ZunBfKvlt77ivySefYC+wAfJt5+NDufYaOWJfjoeQdXwY05Hcm6C02QPmQpLLXR8bJ41xgvU4z4jAIMUMdg6vCDN5Zz8o5LHiDRoJH8Ol9MNx/BE7znrDHzzNZj6GS2A+EpDYGbAY1+KXWhILfIUet/7Q4/B0UF/GY+yV6VOC1CS9qIa39YffwY1ucNslAv/uHLH/J6pwJIjgE/gU+2SygT1jnsgFOosAuNkV+I7gPX5NIrode27ySyMxxX5HI/gLGedck1XT1dgX9+kk1svF5n5iv/DXCMRzPnMgKMiTs+wb+tW159hZ9JnZN+ZJkJH9Bz/gC6KPWRP+jV7BfpueI6BpOAish83BXuOrssbwhGs7jVweMpxCUN3PQ3yCB6Lpa+yzy0OuHAUR/gI6xa6Bf0nIWCIO/jOfjoaskIhlvH5iXlS/c0/Whwb/oCvBXxYL4DsKI0xPHS8xHjcZjNzY+P2E/YPn8VtMJzF39KQR2Aies/6w32D+P5PgOYtnwCfwVZDfHi+hE5mTPYkC38O3PG1HYa/hSXxwErlBPJkRsZbE/CzBwXoybny6eIn4nptYZryxnjLLLMGvzNPFiOj8RDAgPheJKdOH7Be4JRrB3yTA7X6JJCDS01K1eeNKrVoxU9u3rvHWertSk/d63/MbS8dOSpCSDu3TppWdtWbqLfp5bFbNH3ayZgw5X4tn1dau3zYGynSitO/gftUa1U6XVnhUN9fMqwZjOmvRz0s0ZvJY1erYUA06N1HRLhV1T8uCerB1Yd3VqKCuqprHOz+7Lqv7jD4dVkcLNv7+ery/ikh+zPp1sd4fVF1X1cqpiyo9qauqP6e7Gr+t+9sV1gPt3tdX3auqfsfGkR/XnjhjshatWqoaI9ro6qrP6NJKT6jZuG5KOQEJiKNH07Vjx69aOL2SZg69UAuGn6IVY8/U6mkPavOavkpOij924RLLCy/BUwcPbtPe3eu1ft18lSzx6V/3CiaMLYqIhpDQAJUYcVdBEewASGFIMOwAN4ww4A0BI2CHU0GAjUAFgoiBpg/ABdVTAAycbhS7gTrub+eh3DCOgDXGYH24jMl37jGu57g1vrPmHrP72Pzcvq3xHc4GzdYDw4SxQ4ljaAlgMH6AKnPG0AIiCELwihdADkCOPriOOeMAsHZu1S1OHNfh9ACqucbGzL1tDvY34/srCUUMqMMJZLwYe/4GuJKkISDA+vFvq3og+EZlCYYQUAlIAeAyJ84FBFGFwbk4sDiUZNO5nuZWrNI/1e9mCABsBJCDKlqPh1hrgDIVIBYYxGAzR8YNAWAJ2pkR5jwAEMaf/YtFBIoBlMwZ0AEQRl4geIYqPLsv64YxMyfPJeQHJxXZwxG2ICeVSwDYoCA3wJKkkIFdq/AD4BP05jtAN0khAH4Qz+EwW3CEgA+vALAnHAiCAXTMKQcEIycAXBqgFmPO49zMHeNsIJB7oU9cEEjACOfaCNmzcdIIgJCUygwxNoI29MNYSHoxfgIB7A3riBMAP0DoJvjRHGzAHADbjgcRFTbsr603zjYyE82RYJ8JPuNo2xwBwsiUJeKiEXoYXWP3Yu1w+I1nM0vIKTziBgZxtuCZaERFG4kt+JfzcWDQf8bHBFJJZlp/BG2Qrz+DCC4T3LV7sccEShJZF2QJ0G3OAvIJL2MHYsk7PE2Q3J4I41ocYXOUOI5dND1Cw2FDD5J4I5ASJPvHQ/A9etjuxx6hB6j0JOgXpDeCCL7HHpojgczAF/G+M98l+mL/3aAZyeigJBdrhrODE0MxhFUGo7dISFughD5xFAgk2jwJLmK7XL2GXSGQZQEOzkO/WWUz5yLHLr9iqwgIQ+hhKqpNZlkHqqyoIg0KdBpxX/ACCVQagU70JnyJrqFC0XQNY0LvmXMKjiCg7AYtceIysj8cw14gb8aP6GNLGHMcvnMTZjj52Aye1GFvDbedaML2cW/3ySnu62ImP2E3SVibvWSvCQYxD/YN/sTWWH8EHqMFKY6HuBf6EGxs90Iu4NFEibFjp93XWaDL4Q+Xb11i7XiCzE0IgBssKMATVciK7TlBZAJssfYSu+sGtZibVafDB9hO4z/0F3Y+1toij8geeBnZoIIZ+Q4KzBKMIChvrz1BxuEN9hs8SUUu36NvSCj4dTnyg0yiQ5BHzjWZjGVHwZLoIVcmsVXYQI6xxmZf+SQwCRaETCZNZk0mCYDEkkkITEig2jAhxU4mk8wFX4tjNOaOjICn2E9wCL9jZwkO1oJXr7h6Ed0RS47iIdbBTehgR9Gvhn9YVwvauuM0m8n58KStP9cxb3tCBV5yn7ZCPxJ0BYfZeuJvWWIGO8bThBbgREcS9CWgH2u9uR4/Bl7A9oJzrYgJ/uUe9EcD84DXgrAC4+N6MCzzZS/APOgB8JI91cL84IugpxrxL1kD2ysadubPCMYZoUPon+Iu1szuy94SICYhbYFK9hr9yRqgY+Il1p/iAXja+gcDRUsaMCYXE8JDPHGJPwBh16xoioatdavXjegHm4veZX4ub6Gv0Fumq+1e7B19o4+M0Jtcz3FsITENAvSsB3JPX1ZEiV6gKAr+hkcJcoP5SUJwX+wnle5BPAkPYVctQAoPcR+S+uhf4yErKgvCZvAQ/bs8hN0MCgjDx/A6OA8caoV+yCiJUnw75sTeua++AxtF2zvGhB9ka43cU3SFrqZIw566wx4izycCz6KP8SeMT2n46MRqohFzI5FmPI9eAcOZ/oJn3CQXfE9s5s8i9DUJXHid+2GTsXmJBPL9BD5Ex5pOZO3ZA/aCPbH1IjEIv2cGyxEH5B6GEbF38H+8fcGD6Ed74gf+Yl9OdCEphGywx6Y7uBe+TyIYkBgd8Tv0BH2wtiSxoxG+L4l6ux8JRcYAz2ZEqakpWr54nCaOKqdF04rr12V1tGVNN+3aNkcpyZl7tU96mucv/bZMm5dX1eqZr2rumAf047eXaurIx7V6WWsdOLjhuF/FxCuYus0Yqltrv6STvrlL+TsX14INy7V89QrV7FAvErRvM6qnigyoqfvqva6LKjypS2s+q2zN39RrPYur5ZReWrntFx05Ghsn/ZlEAmLZllVqPLm73uhVQve1KKhLvDFeXu4J3dvgTX09rKE6j+2ret5cGndrqTW/rNWMNQuUp/UnyvLVnbqrwevq/9NopR6nf+SpXx3Yv1YrlzTR1O8e0cT+V2je2GxaNetlbf65jvbtXuPprMztWEpykn7bMivCU78uq6lV8ytq9sQ6KvrRi//5BASGBqOIAqYhIDQUBP/mGOfYuSgIgAjBThIQBB4RNs5FuQPoAIAkGAjgYlztWkA0zjbBVZQVGXszRFzPPbmf3ZPGdygQmo2J8aHobJw0d8z2nfXl9nfk2PX096/r/5WssOv55Do+OZdgIaAVgASIZF44UhhdjF6RokUiSp5sdrny5SLBLSrvMIZUoT322GOR13RQGUr/jIU+cb44FxDNo34EEBkX97bx8Wnj4bq/khiD7YetFXvBPvJvCDDC/gJoAGMYPYLh5iyxFlathUNkrxmgAep40gSgwr8Bryh6A74EnzF85gBhAFlX+ArAhtMe1ACd7B2ObjxryNgwzm61BIEtQKvxEmAFAGcOOCAz3keUqSzEyWGOzIXgKEYOQo6o1raACmCJNSJjz/1tTjyhgXMMzxGAcQNGBJdwvpE5l9g3gvUWkOP+BORYV8ZtgX3GxD7hjLDnLjF3QJklCdgrdIJVEwE+GT/8z7k48/baBYLvJKQ4F2DE3AiYMxeI8TEnq5piDXjCxipa6Q+nw+8gImP0wT67++42+IO1dXUSDoQ5IfAn4JMgC0EX9p37AyTQcRDAiwpqC0CwzjgPxvtBxPwJgth4ASOxHq+3JyZsjwCn6Jh4KjYAnwRnzBEA4AF8MgMyXQIQk4gxR4J1gfctyRREOIEERczBAbShB+BJeAoHx62cxwFDB7JXsfYRvQu/wivxEDqKtYOP7F62LokQwWiCQuYsEOgj0ZZRtRJzJSFNQsF0BWAbWTaiMsuC+NbgMfQP+o6EFPrreBwTl9C7BBlsLjR0M3NibPA0tgl+RxdGI2QJPWlBStPv6B4AftD+WcPWEbhjfyCceHSTvcqNhjzSv78vHGF0DpWublACHYh+odIX+WbtCTSZ/KHv2Af2w5U/+Bi5NqcNx5TgozlE8Bp4xSrp4X+qR+3pDM4jeWPBX+6DTrfgSSxiHNhPmtl6iOAafaKX6JPgAglvC86hg5mL2QnsD0HKjIKM9I8+xWaYIw5fm0PGmmGf3SpudCH8aEkq+y2laBW9mSXGDj60oDP8SdA81n3AWNhHs38kawnGsJbsG8k/C4IxDxIQyL7LT0HN+DMW/7tktssqbmnIL0Ur9JeRTkOPmE6DF9AJFgxh3ATcSKZEI2SRgIwrD9gudCWEPcbuGp5hncCe0eYHHxDwt72gkZTDhiKzrKGLj+ANElsZ2RrkknPAdMyXvvjOJf6NvFllOzxOIJ9kLPYD3G1BfvaWhIatnRG8hP0xmaQP5p+ITJqf4cokOt/kBjuLTFqSEUyITLrHkcmgwLNLzNdk0jAhMmlFKQSLedKSteYYSVrwF8FJsylgIvYGQpdia23vGAfBy1jJ0IwIfkDnwAOMg4ZepcCBYxCySPCUtfaPk3lxDXjL5oUPREGRJRzRcQTqTd5ZN5KwVuUMlsA/ML2MXScwZHYMzIQPGg8GZ1/hQfbYeJBP8Br+Lf0xB4qK0HfGAy7hE5Iw4f7MDV4jIUGf8K/pUDAxweyg152BLUlqme1h7egzI545XkJfUPxla0sDm5JENOxJY2+Qo0SfnkFO0cP2ih/Wkr0PCvyxF/AuySwrQECfMxZ0I/xFX+640LPY9iBsgM9IINfFEugLbBf6kH0moeG351YIBcGjJGQ4jhyhK/Fr4WP2mwIt/Hn4Bt/N/Ah4lL0mEQXOpG8wUbRCFXQKPpjLQ4wfHuIa4yESvGAUS765BCagOMZ4iGYV7q7dQX8yR+wE93QT/SRP8CXBmOhS9Ls9mYQvT0KDvoIIP4q1ZPzsM1gWbMQcsCE2LvYPXvf7pZkhZNxN9rJ+4AAwazRi79FPVuyDDQTrogfYGwoXjP9Mv8F38WBZ7uu3QRkRCWaLf3BPkgP4fokk+lyCF+F/wyDsBb40dok+WXubOziBmFWi9+IerAf+g2FT8D/+YbzzN3+S9ed65k8BIzHDWHEcGrKG/g+SpSAi2Y3sWhIbfkE2zVZmROh95IhiM3iCBn8HPcnFuYwN2bHiEeQfGxjNhvgpNT1NK5aO1Q+DXta0QRdqwfeXa8mEB7V2QVXt+22djnjrnxlKTU3Wnp0rtOWXUVq1sLnmjH9XkwbdruljcmrNKk8GUo7P3qDDf1q7SF8NrK9LKz+jSyo/pRpj22nMgsmq27u5+o4aoB9mTlCJHjV1RbFHdGrxe3RHm4IqNLSGKg5vpsYjO2ji8plK8eb/V9Gh5MMav3SKmozuoEojW6rgsOq6udWbOvvru3VV8SdVqU99TZozWb1H9VfzgR01ZuFklR7WWOeWya6rqj6n0kObaeH6FUqPgqnjIXb3YNJmrVreUtNGPa7Jg+/SnAnva9WiVt7ejfZ4YJXSPfuVGTpy5KjHA2u0el55LZ5wv+aPvlRzx1ytmd8X1qcfv/TXPQGBYNBQIABvDLR9x3EIgQe0AJRRPoAV3otmYJJzAV0YNkAhQMwCJvSR5BkjQAyCy2P2KBpTWHYv7mH38/6IfMc5NBjcGuOzFvh9pK/fA8WRvr1+6ZvGMbsXn6mp/+qLxr3suPX7+3m/Jz44h35RbFRN4iADynEAACGv5Hslougxyigd1oNAG0AbJ5N+MZ4YaAKnVHngvHEea4NBoH/u487rj3X5LybGiIGAP3CMUPYYOd5bD6BEeQNqeOUIIIRAEMqZ7zG+GCXWhOtQ3ASDCb4ZnwCAAOccQ7kDOjCknAfPEWT0N7LdPMnAkxLcj/XMiNhnt3KD8RFUt2AjewgPIwME3TgHg8N+cywjIojOPHBUAQk4xgR0IAJ/BK/4nn75ZI44Re4cmRdPGwFQ3SoQ1gZ+RL78hCOLA8e6cS4Amb0xmbesPfMFiFFFB++7xNrA91btyxhwQkkecZ2BCXsNFf2b40ByEqeB8TFOcyit0g/H2SrKOB8+ICliwJcxAsrdKlP4ikAI6+Huu9s4hnOPc2rrTF/wFg4m/bCGBNWp4MO5YHzMB5lmLsbbOCW2fjgtBIpiySZrZUEQGusVVLllhEPivncbB5FxWxIkFgF+CJxaZQl8Axhif4+HcJwJDFoyAYeM4G+QM2REsIPgizk5OCE8xYENYTzwFvLDMRrrD3AO2j9r8A97BKDMKNBqxP1wLOxxcguSBwHIWMQ+o6dN3umPgGNG+gTegH/RiRYkZQ6WzIRwsnGMCFTYetCQfYAz9gPQTGCfwAS8ezyEnOF4AaThcfeeOCjIEzKKHQP0m03yE3YMp9XAPX3B6/A4OjdoD2nII1X38IAFm9hPbKQ5JTSc4qC+kDuCsyQfTU/SCDiQxDAHF12Mw40+Yt84F93BXqLH7Bz2kSAZxzkPm4StMF1OoIwqVQsII5voARx6CJl1kwHoLYozWOfMEn27zil7RaDVnpwiSeAGgNFj6MaMeIM5kawFb5iOcRMQxq8k9pkHx60xP16jwb3gVyrP0TnHy49GBMkJ3th90X0ETmMFLCzoadfAPwT9GZM5uu476Y0/XX7yN/iT/WXPY1XLuwQfu7aLhr4kABB0D2voNOw9e2uBVcbNvy0YAk7AJhm/BRF6jmvcimMwC0EX9pxgGfiB7+Fx1oAqxGh7x5pT9WvrCp9h4+E/9DeyagFuO3a8r/gxwtYReDZ9CR8Q/LP1QbYskMIx7IphRCPGgkyafkC3YhszK5PIBesPHjGZJEHCmlufrCc2zWSSoBw+kR9DBRGYALsPbmbMyKQl+PElsBn0yb3hTwoNwJBmX8Fj4E/sEXqZoLHtHeNE3x+PPjLcZ4EVxoGNwI9hbeAxcBK8DH/Bs/A242Retl+sD4UtrIklieyY6TgLioHVSChjBzgOroHvTAeCwQ3r0OBpCwpnhpAh8JIF8NCPYHMCeGYLjFhnMIR7LkFfS3ChYw3fsFasS1DBBvqLORqGZ64UMpnv/GcR88E2wkuGZ5E3N4gNH2ILbY8TIXAKcmlV+fAisoOdYZ3hRRoyjc8DjgDnWHEPvhe+IP2w3+gD1x9jncBgQdiAynXsgMk+DSyM7wEfo9tce8490fdWCMVcsf/2VLc9BQMvs1bcH72OPMCryD222O7DucQFkGX6RpbNh3AJncWTCFagxbnwEOdCrAsywTHuSxEc/OIn+IqnF1x9zLr7/WL2GvmlT+yg6SnklTWDH+ALsDu60vw2eAL/Oeje7CFPNRhuw+aBVcFEzJc1tyQXPI4eD3oVXaJE3ImEjGEY5sP+WIFGEOGvsC8ma4wZfYM9gyeIS1jSyniMfY4WW7CGjiBpFI+PZoT+I4Hq4kYC+SSH/LYsXgKrELcwP43x46dZ3IICL+MR7AYJnFjYKojAC+hYN9GO3iUGEE9sBcKfZK9M1yCnyBj2MqO1BhNjP+JdI/gQn958cCvkiTfBC39bMSrXm/2l6NXVY+hrElHIPnbReAz+xPcjHhOPDuWd/Nu3r9XiacU1e+hZmjMkixZ+d7J+nvKINq8ZqJSkf39FbiKUlsbvSxzQwX2btH39NE3/9iMNa3SNJg3MoQ2/9lZy2m4dzeSzEMxt36EDGrVkivK1L6YLSjyqxxu+qwqDmqnJ0E4aPWO82o3opBw1XtOVFTwd1KSAnu36pfJ2/VrPtPpYL7b6RJ2m9FdS2vEVSx4P7T28Tx0m91G+dp8qR9siytXtKz3T9Qvd1+QNXVXpGeWqUUAdR3TRyGlj1XxEV5UZ0EgP135TlxZ/Qu92qaAfl8/WoaRgXzkeYu0Pp+3Qr2s768d+j2too2s1a/CX2r5hug7u3+Lt3UFvD4+dnAlK9vZ+06reWjHpAS34LotmD8qiJeMu19ol9VS+XLG/JgEBYXRQLBhnhApFRoYQw4ZCdwE0oJGsNpVkAMw+vXtHBBBCyL4p9k1EkVBdYQqZ/klAACQQfLLF3AOFRd80nk6wv91/cw5jo/3r/N+TB/Y9TzGkRb77vSHE8ACN7/845h2gHY0kJzACJBmOXX+sf9bAxoCS43vGD1PxaX9znDXq/21/lS1TVm8XLKgCrxdQiWIl9G2/bzV16rRIAIfAMeCGqmfWCYcQZU3yBoBD4AMDjXLFoTeD4M6PvzPL1P9JYqyuUcWYU4GIUnaDCoBJjCKg016/hLNNYIhjnAd4w+nC2DF/iOokEj0GnBJpBE0Ae/EYSfYAA2nghvtRPWOOETxAkMMqzQFwgC57FD8jMgOOMcP44pwYuCOIhIGjT3f88TTWHGeToL8f5MHLBPwM7HIu9wXk2vryJI6BIfaJQK8dM8LQ4syyX6wLlTEYY4CBjRlAQqKSgBKBRvaeeXIO1QRWYQboAAxYZRjOCKDInBZAAw6qrQ1AkYoUm0MijfvjCFtihr0ENBqwAJABsnG2CHoZuOIVUwBTzscxsOQJc2XusZ5MYO0IShkf0Ug4BjmiRiRjbH1ojA/dEY/8o1sAW7Z+5nQdbwKCYLkb5ENm0W0WEAoinBj4yZ+AQL+i+933zybSCCThbAVVEwYR4wB4o2e5nn1l3+KphHUJHWZOFntPADeeMaArcGaRNatW5SkDgry2p8gqQXB4y9bY36hCg3eoEnST95khxkQyjf0heRBNnxJMxU6hN4McO+QS+bTAQCIN2YYfrCqXYBPVxcYviTacLgtwGLG+rBUOgMkzzjcOs9lZsAgBHzuO3kP3u1W0YBYq06ya03jQ9BIJJPdpHhx3bNnxEMEtnDH2Bt1F4IBAh8kyjrOtu+nWWNV/RugkquR48sz4kQAJzpMROI3gCvxmQWB/g0/BL9gIro3HrsYieBJdipxYEMoCvLH0F3tAdbjJDTKKXmfv0YckTjPDn9h2Er+xAhouYfs533gkkUZQwH16hX0k+G8BIHibwIkl6oPIEhD2I+o0EhD0ic7FDpjdZN9ZZ9bbb9+NWDsCo7b/7An2Eb2DviKQZFgB2eGpBO5zvAQfYO/gfcMTyBY6yPpnf01PYFvBZn7+w2a5Msm+oGMzS6yTyaSNC5kkCG66GL1iwTbOwWbansYieBWZJMlkmJCgliV0SCwYJiAQCaaieIJglQXg4VdsP/yKX4JMsGfoD7Av4zweHMCeI+uWFMMeoXOsmIL1YUz4hBzn3gRM2Tf40mwn6wOv4xsyP9bIeMzWEz+CNcFGsw7ci+MESUkwGx+Awd2gK+fCt5klsC1PjtiaIncE8OxpXpcIbGEDLDnC/EiOmN3Anrn8RyDf1bEQfYK/wRI2Rwq0sPHmU/+ZhJ4Bf9sc/A39g49mNjoRAuNiz61v5gcP49+B4cHFyAs6Ez1FoNdsMA3dD+/AV+h41toCq4k2roNXrfgoyJ6j2+w4coL9Q27gK5J7yD4JERsjiV50KnzAU6rgGWSefUZ/MSfOI7lGYRd77+chCsLAV7ZG4Hb4z3A1QXYrnKEhWy6+gdCXJCh5WiSarY7VmB/rAAYy/9XGZevNcfC+3781GQU/mI+Dv0ISD3sEobssqI9uo7DheJNr3JekIPrF9gOsit8b62lJEhDshQWHWW98WWwHPIHvaT59Ig0dlEhQG4LHwIjwC/qefuA3iqUyg6VYE3xuMBnrTH88wQFmtL2ggMmwEBiABE6iySDGTUwHH9/GbYloeDEjYpxgcvS+7UMiDblD78fr/1A0QKLeZIPriV/Gy4PIIr4qvjTXg3lIXOI7mR6jkbBDh6DjLKFOQy/Al5Y0j4eIV+5YP1xLf7xP80f8Q4u/y6JFo87Q0umfaM/OlZlMEfw7pR1K1vz2LTToles04sMzNG/Ac9q4wZPb1O3eHh07KUFCVy9Yu0SVBjRR7nof6JEqBZS/8Req1qeZOnzXUyU7VlbehgX1Ru9SKjqsrp5v+7muqPi0Tqv4iG5rkE+tJ/VWcupfl4DYd3i/Wkzsrtsav6KTymfTZZWe0Uudvtbnoxrrrb5l9WyDgirVvpI6DOuhyr2aKF+jT5W96ht6oUER1RnSVsvXe/ic4HMmKN1b9IMpm7VxfVfN7ZNTwwudpkGv3qzF3Tp7e3X8BV4M67ftS7V0aiEtHHlGhKfmDT9Jv8zJo0N7Zqp+gxZ/XQICxkHpmXMBeO/evUcECJFtJNAC6EN5mKMICMahIfi+ZMnSiGKaMmWqp1g+jYB0QKcJOf1znD4Al7/f69iTC96nG2inf2v827636/j8/RhJE/d8kgpO8/7jcaW0I8eSE9af1yJPRHjHfk9K/CvRwfz55N/2nd3PxhMZs9e4R1JyUgSATPQUf+/efdSrdy9N/HGilnrrQeUTAZGncuSIOJMEKQBl3Xt0j1SLUYWLg0/iAaWI84GDxDrZmtmc+Zv7/bcTY3erpDCoBG1xKqy6l6AzgSdAE4FAjBjghaAcwXeCP5wHYMVwYEBs7TF87o+Uxttw2nBOqHChr4wI54hKTKsMwlgzZiP42K3QY24ErdmveAjgaoFv5g+Ag4+4HqOGgQMY2vhjNcAG60cAhj4ByfCZyy/8TcKHQBz3o2+ACJWEBk4gwK+BTtYfvvUbekAo3wPezPkHuBMgAYDTN/sO/wOmzJnDmWFsOKnmmAFM0THmtLEGbmUuvIJht+PoJvbBrXqLtwESCUZZ1T5AFefHqmNZDx5j5l4kAgEOzAWAi/PCdTghjJ15su44GTin0Qg+wtGxgBr8RBLEKlL8xD7Bo8Yb3B9dGuseLuHkwOe2foAmkp3xgrVoRHCExJ+BfSr74NNY4JVAiFuVRQICIIc+Y/4EsDITGCRg7ia3MyKcbBwLC+Yhszx1QwA+XkJnICsW5EQ2CKJYQjIWIdPwE7bSZBq953ck4UccNyrgcEhdZ9wa35G0saRcPLosGjEudCtBRoIe8IwF1qwxXvaPp4DAAWabjLgefjbdnkjDYaSyyPQPfJ+IE81YkSvORxeR5KeCzz9GnEJsigV4CIAhk+aoYq+wxRxDN2KPSZK6MoNDjuNsjgXBTzcBBx5yZZaqWGTmeIggqwX7cHp4gotX8GAH2Xd0lekV+BIHOB45R/78rxcEy9mTrEYEnXilDhgFm2C20G3wIwFv9Cq6+3gwCvwIj1G8Yo6tPWEWy64SlAdP2f4SCGR+EHoTm5cZ/iRRxfzjrRBEHglWZiaBhkyTJDV9iv0mUGKBKewg+x2rwIFx8rSHBXtoBBjQkxwDr9AP38Mv0YJiEN8RJIDnjcfQu+hA9gLdzroa/6DHCU4fr52BSE4TSLc9Qy/xOhU3IQiucOeJffbvE0UerkwS4CQRnFli3iaT9EdDJpF91ou5oxNcTAhOQl4zIq6nOMSS5PA/MonfxX1Jfls1PTIHNiV4zyuRmJftA7KKXeGpNRKM6A36IkAUK9kUD6EPsNmGDwkegf3QjRB6hXGSJOA4+wY+4jjBQjAtOpsxUWADfzFOcL/ZOnc9GSv+EPMzu4RfAa40fwC8algHPnVfz5QZIlkEjjXeg6/ZQz9e494Ex606nTVmbG5RA9cwH9sbeNEq242YB/MB41nQEP8GP8dvx/4MYp2ZB/4n93Yb6wkPJoKTXCIxhV42eWAP2Sv4B2wNHqSBL9DdpvNplmSzBBxJGoLNpuMzavRl2AB7gE9BgNT0E/269hw9iy9gAWSChQSmebqcvkjWIlf4KsarHMM+EPS117MwN2STBAT3tL4JVtpcjNh7+JtEi40ZHnJ5BJtKQNl4CNliLVyCF/FLwC02towaMshesD7YHpIN7JfpB+TSxftgNYK+/uA+OpfgqiUX4WH2zX29DfJsT5rQ6NfV5ZkhxokfSfCeudAvPidPhbr+rJ9YT/bd5Jtxk9BkL7C5mQ2Ks4bYhkSCzCQY4THDYTQKLsF4jCdRYi/gYRs//O8vSiEZ5Mo6cYdEk4vMEZ/c/GbkmjgN+jweQudgm4l3GbZIpCEjxIniXSOwPNcYn+CHwSfx6ld4Bjtnvir7hFywzq4eQ/bBVabHaawN8YJYr86MRvt2r9SqeSW1bMI/tXj0WZox6HRNG36f1i7vrsNJ0ZNs8VLynn1aVLmuxlx5s8ZedYqmfXS25g7No7W/9tT+pN064v2XKB1OOqQJCyarVO9aer9zOb3fprQ+a1FB5TrW0TfNK6pq1/rqOW2Qes4bplLfNdXddfLr5K/v0cV1c+vNvuU0Zsnvr6j/q+hwymGNWDRe+XuX1jnVcuikr+7RQw0Kqsq4duq34Dv1mDZQVbrUV4mWVVWuUz191rK8Crcrqw86l1W5vvU1dfGMP4ojEiHWeu/hrZ6N6KT5A57StEJnauzlJ+v7q2/XsjrNlLz7+J4YA+EfOrRHq5e017Shd2rmoFO1xOOpZRNu0JZVdXUkdYeaNm3z1yQgUOYYZhp/47AMGzZUhQt/GHmED+XSsWOHiOHDOSDQjwPSsmUr5XwmlwduX1GnTp09QZ+ghg0aK/+rr+ujwh9pzMjROnzMKSBRkHw4SalJKTqa5i33seQBSYjk5BSlekyX6t3bkgNkg2hp/O2dx7hofzzN4B2L/Od9/r68GE6yxgAMT7Ec9YzQEe/eXjt65IDX+Dzo3feQ13+SjhxN9a6iysZr3ueRoxbsT1Naqt0rPfI+NsaW5n3SANkwWATIHBvDQU/o1m/eoNXrVmrz1o06dHC/tu/YFgm6A8De8oBTl65dNO6HsWrWvJleePF53X7H7cqVO5fKeIoNwPLII4+q8AeFI0ELE0DugcFnzTGqjOn3+f73EkaQbDBBCZQvVf4EpwFaBkSppiAg5D4CizOJgwxItMoRQAIBTHNwWA/Ajut4cg8MS0aNvnBOYr0yxiXAIgEtruU+OO7MywigSrbbKkhxzqmSZ48yIs4hEG/rwT0ACjhOBDRZB6tgD5oj/7ZjNMAhoI8qHNYUIOUfB8YWo23VNAB8nEAc8givw+NeA0RZcB9wQJ9+UMXasEcAWAwwYASQg+OGccYAY/BxRi34DrgGIGP4qcIwJxUQT7DIggcEjACVNjcC6ABEC/SidwDLFtSm0be7PtEae0iQx+bDHhLYMCcEMMpx1oHAKk6hASQCYYAmc0r4jr3HsYhV9cJeEJQyIE9wikqjaE4yuoWAqFVbcA90iMlARoQzZE4xDbCJM5QZQOsSuowqMPYX/sMuAOzQh9EIWbMEI2Ohsoi9h9/QCfCsrS/9xruPAHYCUPEaevi1SJEifzgdOIRUKiYSqIDvCL5YsAP5pDLQdHUsYpzuK0No0ZJQ2F4CEgQ9kE/GzLqwPnYtDaeV6sHMVCa6xPhxHOgLxwzdyhr7dQy6iopaHFNXt8BvjNNAN+P071e0RtCf660/dD98xTHry+UJ/zoA+Hn9ArqIQBSOrj8ICaE7eCzd9p+5MRfWjmPIo+0N5wTJJ8EH96k0khjYA3NicIYtWcBakESy1zlkhrDz2AFLeNEn9siSBPAJ9sz0Csk1AsDxyDlYgmC2rQdrinwEVWqzDtgNEnjoZfggiB/R5+j746lsxL67SRfWGv2RUdEAuBResjHBw/ASRDAHHskMf8KLPNkXj4xDyBHBVEvUcK94dRq6FYxk98L+uAEg1gQ7GKsq2gLE7r4SyGdd2Rfss+lbdCBJo2iJcMZhT8nYfAiMksxGXgmMExDkexsfAfRY9iAeom8KUwjcsnb0DW+RmIUHGBeN/bVXQNJIurv8Sz+spwVbmAMyif7KLKHHkUkLwMOf2GaTSYJqYBNbYwI0VFrGg9mZE5jQ7As8gUzSJzqGwJJV5hrugBfYPxJBhiXBgugiS6oyRnjfHWdmCZyDzTY5A8tQDIJ/Atn6GHZFd5EoB28xTuyL4TbwDYlFcIUbHHLHyZpQ5GBJMxqJcNtD+oWHDYODRbGbNp7MEMEm5M7ux73B9f5CCyvCMV4gAMVc8deMR9HR7KHxAz4RWMwlzoO3LVFGs2TR8WK2eAnMjbyZjqQhewR0Y72iLSPiaXXXnsfT4FfOJ4GPrjH7SmGByyd+3eq3SfAmvEKSFf8EP8cNTFMMyNMEZs8JLoLt7RzsHvvLviKTJHJ5sgb/03QyOBtcgYwbz6Or6IdAL/vId8gt+A8M6ZIVxphMMAawBxjGeAidhm9oPI6eBXe7hM6loA1MaGtg6xhtfcAL+Ob4Jvg8yJSru/F13KfM8dP9r71Br4GLkGtbEwLx4BD6sjmQ5MaXsvuDo+xJk8wS/WMP0XfWL/MhAejiUz+x7+AY43V8XfQlBI7ARmTGfvOkAbKdiKygp/CPjXe4F/5oZtYGXcEegpcYD/3BD+Ap126yr8i1rRnJrXh/C8EInMGTTZYM5H7EQqJhCT8xHnS/+ZO21u56xmokadynxzMiir/cV3CiR8A28V5PApbCKLPN8TTjHeJC6B9sQaKUknxY2zdN0brFlbVqdiHNHZtL4/vfppljn9OGX75VcsrxBaX3bdmqRZ+X1OSzrteMLBdo9vVnavon52vm4Nxa80tnHUjapKMJJiGSk5M0fM44Pdv8A93Z4BV91qemBk8aqX5jh+jrFpXVdkQvbd61VeOWT1S+1p/pzBL369QKjyhvp6/UZ/Z32rZne6Qw/K8i3oyzfucmdZwyUI+3LqJTymbT+cUf0jsdSmrKz9O0adcWtR3eS2Xa1dbgCSM1YOIIfdS7iu6p/7Je8s4fu3BSQjoAIvmw7/AGrVrTSrO+fVIzPjhHP13t7YW3J5Oz3qwlJSvpgLdXmaejOpx8QL+u7q4ZY57R+G9v17xxubT6p/f1y5Ka2r+b36I86vHpn/wEBAIX1FDmGHoWjn9jfAlkPvNMbg+AXR0xqq+/XkBVq1b3FMd3Hkjb6BnJQ5o3b4FKlCit7Nmf8ByVAipS9HO9/WYhvf/2x+rQqqPWrVit9KRkD2WlKz3ZM0iHUpV+0GuHPGWYnB4J9Kd6LSXtiFI8pURK4FhawGu/pxTSvPFEnlLwjEpkvGwXSYMjnrE8QjLjsNcOen/u8u61RWmH13v9r1La/qVK27tI6fu8tn+x17x/71+u1P1rvHM2KD3FY/T037x+PLB6lGziIU8xpkZe+0RyJJIg8f5OPZKm5LQUpaSn/t5SUzwh48fzvHkdhXWOaNu+bVq4ZqGW/bpIe1MIXKRr7/4dnvP6g7epDdW4SSN16dZFVatXUd4X8+iaG67WDbfcoDcLvqW6HmD/4vMvleOJp1WmVJnIkxPMk70ADGMwUJYE89gnjv03EwCcSkwCOoAmnCPmgUOEYwwwotqW7wGH5lxQ9QiwIiCFE893ADOcMtfBIXHhBpIAPAS2AZPRGoADR5pqlVgV20YYSIAMxhkjwr0w2gAwI0ACT7cY8MKhAnjG4zRgqEnqcR2NtSJQAPhlfDixZuxsvXisj3kSCMeRMUBKw5BTEY6hjKb8ALs4SFapglNEf4wZZ94aAQwz1tyDoIU/MEWgBUDJ2GzeOGQk0jC89M04SV6w7qwhYIVkEtfy2gBLIgHc2HcDjay7VfrRAFEEZI3vuQ/BBtsXxgg4Dtp3t+EIAZTdgBIyBa8xD/oCjBLY5l7MmSdaDBxSmcgaUyGDU8J3zBPHIloVPP0QTMGpBjhxDQ4ETks0Jxnng/UEuHA+62YylBGhHwiKWgUua4Rc2e9nHA9R/eQCZapX/BX8LjF39Bb7yzU0nGyrQGVMLhAmgGLvWg3aP2vMB6cJsB2PrEE42AQhbZ9xCAmWJQIUSCSxDyZ3JFHN0cqI4FkC3rYO8A2OZixdBP8xRnQMgT8C3rZWNPQOvHsi9hZiHlTToofQC+gYC5xYQw/hbLuOPDqRc+0cdDYVP7F0sukygkf2CiOIYAf63O2Lx7ytL3iJwKntI3KIzkF/xFpL9hln1eSWhqPGvuB0wht8x/rCg9gqv5316yX23+wB/ePk2DrgwLI3xxPsBI/h5Nlc4Tv43oIY2B+SWOYso4d54jSW822E3uNamws6htfnBCVvjLAfrCFVndgbgiUuP8Ir/tc4JUrMmYCmVfChM9nfWK9UYZ8IVJldQzfBM6absGluQhb+QYcQBPHzpduwF6wJ/OnnhWgEj7hPZ2LXXf6N1hgPttJ9GoEApKs7CQYxl1hjIXCLXrZrWEdsCQSmN1xFI1hLYDVaQgOsRVCLMZitxZaT0GEMYA37TQIaup2q7UR0ahCRKCGxS+LA+At+I2FMQNNwCoFu9tXkg3m7AXbGj0yisziO/DDeeKs0gwgdwz4Z5mNdSAJa0g2ZBNfZce5NYjce/oHHXZmEdwhOIpM0AlOGCfkEd2D/rIrWknbgaZKLJCgMx6EjCKDGKpSIhwhUYZ9tjMgcCQKzgeAgAlFmNwjOM07k2nANAUOOoYsJvjFOsKDtNeO05C97CC9YEpZGEtaKiJgPlalmk8En8IW/SjsRQgbd1yZhjyiacfUq6w4v8rSJ7TVrAVYm6WV8SmKBILQlh+gLnnRlhLUDRxhmYx0Idvmr5f9Mwh/BN3ArfFlL+Oh4EsrYUZO/jBr3ZJ/hWQKE/idcWTcryqGhx0mwoVvBE+hHFxswF/aDvQjScUH2nKCoySryaIF19ga/E34Du/Mdss89scnIvPm24AowP4k1K/aib+IplkyB4CdwC9jDeAjZRc79PIQfasFeMAY+isuPyAmJERffwI/4YNg5/F90pfnNNNYSrAf+cZMKRmAb9ylz9oR5uYS8My/WwdYdfw27ydwYP5/YGdbCgv7YO39fiRJjJrDrzplETaxXorJm7LH5nvAceM8KRRirmwjEfsJjsbCCYVn0UKJPCoHl4FHT6+AddKK/4C8egsfB5qy/7QV+MTJse4Hvy5qxX2bTGTtvO0mE8E3gedPZ6F/uEw1L+Il9wG4YZqPhk8GvsbASa439wSb4YxKxCLtjNoQxo5PjfaMABH/A/zbfjBr7iSyDneALfMfMEJoInbFrxyrt3DxZG1b30U8TvtSPvW/R7O9f0qaNY5Sc9i9fLBHCc97prcH8Nwtp6mmXa16Wq7X81Gs179bzNKVIVs3q95TWrm6j/cm/eOdmjF/+oCOe379itnK09LBMmfuVo11RDZj3g35atkBNh3TRoJnjtHPfTnWc0FNXl82h00rer1uavqm3OpfT0Dk/6EBydB/kP0W/HditntOG6eWOxXVt4/w69eu7dEv5Z9Vr8rfauXenBs0Ypzbf9dG8n5eq10+jla2Vh/nK3KfnvLnOWh39N9qCiPjx/sNrtfrnpprR82FN+eAsLbjhfC0/6TrNzXKNpp59pRZ8UFS7PGyZwC78QREeSt2nDeuHadaoZ/Vjn9s0Z2JxbVzTXzu3TNWu39Z68vg7HqGI709LQACaEHz7dBuACIXO39Devfs8gz/YE9R8nkK+z3PGnvEM5fOeIcut9woVVvv2nTygttwDLlvVrVsvTzHk0bXX36z7H8yuQu99qg4tu2vFgpVK3XvYs1IeOOWpB+/z6EGPlQ96YziUpvTktEgCIi39qNK8VfLOUJLSvZaqpKNJSj6SrNR0Xtd0WGkph5WeckhHUg/oaPJeHTmwTel7NyrVW7zk7SuUtHWhDq2frv1rv9e+NUO1b1U/7V/eTfuXdNKBZR0ibf+yLtq3vJf2rRykg7+O1uGtk5X820yl7Jmj1P0LlX54tY4kb9PRFA+8evdR5EmJw0rx2uH0w0o6kqKkdG9sack6nHxISZ6gpB7x2tEDWrNzuYbPGKSBP/bQ/HVTdCBtqw6n/aZNm9d467RQ06ZOVsdO7fVe4Xf1TN6cykl7Lqdezv+yCr77jp7z1jZ3zmfVvHFzbd70++NyGCeALwAd54uKuCCg8N9GjBvghiImgERAmyouqgwwMhhHnEsMCaAI44ViJ7gHeOBRUgKTXA/ww6iag4OBI5BnwVwUPa9BoToc5y9WA9AT9IX/AZl8WvM7iAArAC/BBMYGQCSI7IImjAqAx8AjgB3DaDIUjQjeua+RYj1I8FEZzjhYPwLsBiLoH6DI/ZgDfACIwCm3dSCYAECOVfnFI4CAQAMe9A/AAowBanEUaAQ6LajFvQEafgNKXxYoBLCxVoybBAMgE7DMvQC+9tobHAKqMQhkAVYMOOLsWVCAvfAHNDlO1YoRa0BwyI4D7kksESgK2ndrvKYD/nJBEt8Zr9GYC0FYCFCPA2WAlHUhgAPP2hoSJCAox7iDCF6gEgpQxXrDSwBa9jpasA/+YJ0sAcEewA9uoDYaEYyGJ81ZgS9IZrHmx0sEEowv4DsCkbH6xVlDb9k8kFXmYUEieMh1KAHO6AgSLUH7Z409IwDhOnMZEQDSDULi5KJnEiF0DMknC3bAzwQ7MtLJHCewzr5zHTzAXOFZeMx0Ebzi6iI+CXiZTsRRgddNL9CQ10Tn4b+fy7voWXQ1OgZHG0fR5ktDtnG43aAEDqgL7nHW2FvkNGj/3EYCwF0/klxuX8g5jjhrD9/g1BOAsgA1/IgDT7A2FjFHnHpXr1Ath6yzh26yj0BMUCUXcuw65DhxBDEg1o2gAHaNY+wRMp+Rk217YY1/2/7jYCHLtt+MjSpos4XoZJJTJpNmfzIKACM32B/sh40VR5VAB3vh5w8bD584xsgnr+zgqRPWjX2iHxrBRZzczBK6j6SL9cfcwD+xHHJ4AyfPqkgJejI220MwlCVOaeAOgi7x2As/f2ZEVOkio3Yvghs4/wRug+5hjXsxXvSBEfxmxRk0EhmxgufYE54kBEtwPjYKncPTKxD8goNv/aEDsbW2v34iiEsC3iq82WcKRiz4S7CFYJv1hy53g9HRyOV3l7+MWAv7bSzrG50Ar7k4hbUh0G38x74ij9Yf+8bem8yzHsik/V5BNOJ6//j4hOAHZM7GxidYxog1dquBGSN6NNoaG7F3yJ+LCZFJe1oQbEXyxHQBuJjkNMRx9B96l7VAN1LBz94bTmGdwJDRMEe8hD4zO0ZD31H1a/NDTtHPdhy5I4ll60fxgSV7CYYSCIKvbb1ojNPkAKwGvjcdx3xIcJj9AWOQyDcbBa9yfSwcDAXtsX2P/jIZovE3r49yCR2Ks25JAxpzACMaf9LA1ugl2wdkjgIRdx/gU+TM9pZzsbGZqZjNLMFf+BSGx+AX+I3it+MhnogDI9sawZ/Mkzn6G7wCP1C8RsERe+vKDYk8t/AMfmev0P/oIuwvCXA7B56hmt2/d0boVxd/Ys/dc9HLpi/xYVgf+Ap/lHsg+/AG40DHMCZ4gOA7thu/wHQPn+hhdz7YOrCHG0CHj4N4CJlmjTiHf4OT3CIQ/FWSlXYO64yeAsdh50jGo5t5IsSSgyTF0FVBhU3ocLfgiEaC14+LwIrYWhcjWvAV3WBzYP24n+lqfEP0Brors8T8wWruvfE/Y+k47DB+MokqzmcfiTtYsg8esqfMaPieFFFlhBVofvsdD+E/4VPaujAXkjWZIeaA7nXXgzX32032gj2ye8LjzNF0dDyEnXOfEmM98Vnj3U8wKljV9DpjIemKn5aR38C9SVDHW+iArua1iGaz8V3h+0QSGKyPWxjFeKPpMWwQcQ/iXvAT+imRtfUTKiMtjSdYkpWSekBbfp2t6R0LaEKDyzVv1GvatHGcUtIT4zuI19JvmzRZ857Iq6lZLtDc06/Rz2ferBVnXau5N1yoye+fq1l9H9CaVU2079CGhJIQa7f+qorDW+jmOq/q3PKP68XOxdV7+nB1mThIw+b/qNk/z1fpHrV0cYUcurnha8rd5nPdWfd1fTa4vpbs+M8l3oMo/egRzdm8TIX6VdVddQvo2XZf6Oq6z+uyCk+rcp+GmvPzAg2b96O6ThysLpMH6+n2X+q0yk/pjvqvq/rI1lq3Lb43rEAe+tDeAx6/L6+rmd3v1pS3smrutRdp5ZnXaMWZN2mOtydTT75QC3K/ou2ebcqMtkxKO6gN60do7ncvany9SzWz2/vatmGuxzOHPJ4i5n/sRI+I1/ypCQiEFiXBpzX+TfsdjP3OZIcPJ3uOEz8qW8Qz4i/pm29KeMq+omds8+rGm27V0zlyq2aN2h5Q+EFDBg/Xl18V11O58ujtQh+rY5d+WrbkFyXt92aW4vV3yHPgDiV5K5Gqo0lHlOp9Hjp8SIeSDyqZ5MLRVG9h05V0JFl7U/Zpx4Ft2rZrg6dkftG+nb8qZc8Gpe/3BGDPWqVvX6y0X6YpadkoHZwzQPumddOuiW21Y3wTbR5VQxtHlNGGEV9p47Ci2jz4fW0Z9I62DSqorQPf1qYB72jDgMLaOORzbfm+tHZMra5dc+tp9+JG2rO8uQ6s6aGkjaOVsnW60n9bqKMHV+lo6galHtnhjW2fDqUn6VAaCYgUb+yHtWvvdm39bZ2271+tn7fP0sCpHVSvZzl1GN5IP62ZpD1Jm5Wcvs8z5oe1betmD4CMUt0GdVS3UR116NZe9ZvV1/tF3tfDjz6s22+7Q6++/JoGDxgcMaD8rsSkyZMiQScADoYWxylepftXEgqXx3lR1AAYmBpHAiWOU4UBwGCZIeQ8gCAGDAeGgJYFcgBjODBGAAicUwPrOPs4aYkQa8gYCZpjmKjGpwLADTTwiCHBHgsA4ACzB251BQ4CwRJznjD8AKCMqheoiiWZYY491xHkt8pRwDTZfgMIAFR3joBYgAuVEhbcZz0AiATqXZBrhLFlrq7DFE/DaNs7eV3eIzDPuBgjAXwcAfjWEgsAC9bOzmHPcS4AxAQwqHKzIDn8besKqAT4WuUe82K/7ThzYyw4CzZGAFSilScQ+o6nbdyKFyos3ApeqiQIWnCMfaJiw8bNvKg6JBgXtOYQa0ag2YLfzAfghmMXDawB/nFWXOcIp98SI9EIpxyn2JwhrmOd4J1oT2jES/A0QT7rF553Kz/9xHrgRBJANocHWeaRdpwWCHDGdxyjX4JZ8TzlkSixzzibbmCQPU/0XeCsAcEO01nMi4CcVWtGI/gJwOvKO2AbWUVm4AWcWxwj9o8go5830E0Ef3AyTTZo8COyGC+xFgB4nGMCNTjLVIT595H9Q06pLKfK03QRDV1lr33C4SIxZToQhwe+iOUERiNzFKwvcxTcsdEviQTk1BwK1oNAR6zAJ/OxR8+Nh+FN1p3ApTlCOGjwpZ9Yf+yS2QPGhjPv6gr6dysqeU1bRskhHFueWiDogh1CZuxxeBIuvHfa1p69JghjxLpgb2y90EskG21vohG2juShJXHgZxId6FDsNLocPoQfcRIJXvj5kX0nWAMP2ZrQ2AsLeGeGcOLhL+uPAAH4IZr+Yl/AB7yugz3hGhxFKopJ3nGcvy05wT6zRhnZ6MwQa4KuJ+nLveAzKtozk/xFFuBp0xk0gmnglmgEL4IrLODHvvL6F3sSBLvJOll//O1/H71LOPu8YgmnmvORN55Gtb1gXu5TXewVAbVYQRgCeCQRsQPwFn8TdLCiAOw/gTLX2Y+3EbynP5dX/DJJgsz/Chw/oR95JQkyiWwiw7buyCSBWeM1ktCcY2RFGBYEYg/4fZ1YT2dB4CJebWT7zXXoPts7ZJOghs0D3WKvDYGsWps9YmzoCjfwCw4nsJVRcigWcS1Yxw3OE6AjmWcEz6AX7TiJdlcHYivhSY4xVsYF39j54EXGaViTeWFjjQfxG8DlZl/gG+yPYQyzGbGCS/AnuA9exd6Q+AELoE+5L36B+R808KlbLYstgWfdp4nibeAdZMgN5IKHwMN2DnuPXTaZ+E8Q6+X6E+hL97fSMkPoMJ5ms71hD0l6k1BmDbif26jgh79IQLq+GERf+BbuPlMM4q4Rf4OF8AdcbIBO9vO92XOrwKY/vz1HN8K/HLffeoB3sDdgc65hPwlY2/2YH1gTPcfc7YkS+nHxOzxE/zxRxvFEGjLj5yGSNciJnQMPcX/WzYgxoVuRX8MUJAIo8HB9OwhZ4HrzF5kfut7FYvQNFrNChkQaT5MzluOxwySDwS3sA32Cg7ArrG0Q8T2FF1SlG94jOM+TNjYvMJhhBbOfbqLnRBNY3y0KQP/Zb1clQuhD+NJ+PyiRho+IDkxE38C7rj3C50T2oq29n+BFfCm7HiwK5jxePzWIkA18V+N57CL3ZgzxEHPCJrjJOOQfHOnXY/AfPgU+BMWAmfGDMqJDnswsaVVbk/NfrmnFztX8se9o045RSkpP7F5Jhw9q/YCBWnz3I5qZ5VzNPvsaLT//Jq058xatOO06zbn2PE1580zN6pHN08n1tfPgqkiheIbkrde2XTvU/6cxKtizki4o+6SyFsuu11p9pfL9G6vthL7qNr6/vuxUWQ83f1cPd/xY9zYuqNPLPabcnb7UpHWxC0T+bCIxM3bVLD3R7hNlLfekHmpWSA92KKxHm76n4p2qR8beanxvlelXX3mbFNVZxR7RhZVz6b0+1TRwzljt2BNf4QA/IbDzwHL9vKyWZna6V1NePUNzrzrfW/sbInuw7IIbNTPrNd7enKMlDz6pjSNGKJm37iRAyWm7tWH7EM377lVN//JsTX79n1rWqZnHQ8G88h9JQNAwyDQcS1dp2J+88mjBgkUeEKqhN9982xPYip7D0ML7u6DnHNymW26+XU/nyKWvvyymDu07q0evfmrbuYuGfT9Oqzdu0cEU7uOB1qR0pSd5xj81TUd5eiD1kHYc2qGN+zdqy+FN2pW6VbsObNDGrcu0YvUsLVg8SXPnjdPieWO0ZsH32r50rA6sGKtDK0bowLxe2j+phfaNqKLdfb7Qjk7vaXvrV7W9xXPa1jyXNjZ9XOubPqT1ze7XhuZ3a1Ozu7Sl+Z3a1uwObW18mzbWv1Xr692m9Y3u1aa2j2hbz6e0Y1BObR/xtLaPzqUd417X7ilfaO/Majq4sLmS1/VSyvbRSto3W4eS1npz2qlDKQeVkp6i5NQkbd6+TnOW/qDJC77VhCXd1PPHuirV9kMVrf+emg9spAW/ztXBdByPo0o6eFgb1q/XgoXzvXku15Ydm7R4xSK16dhaOZ7JoRtuuFEfFv5IM6bPVEpySsTxoCoG48Tjlzg5BGHZw/9mgpcA5wSIUNQE/Rg7vEYAzYI9GAM3qAWYx8lCYRNkswoFrgfkQMydyloLzgNoCQ5nVP3qJwwtjiqBNYwRRpsfbnQf2zbn24AKQQUqX1wjzZz4QTIDLDSCWlQVBjmcADYALvMD+Nr8AamAbwM6VFG6r3EA/NqrPoxYZxJSBG0tAIVRZB5BASicbhwpm0+8jTXGycQA2/gACQTC2COCLPTLWFgPgj1WJezuMQDDAkkYZsC+BQJx6C0ojYPKeWbsuQeGHhABcT1Ay36DgcQQjogLxuMleM2tUqIvAK37pAEghWo0N+nAJ421JCiEYxENeOGwAKzMEWE9uUdGgXaAKdWzdi/WAwcMHeC/F3KBA0miAX1hgJz1JdCNQ3e8RB9UVNn8AcoAd7/jAsEnBFRIntq60QC6gFTWBDniepNz1gen+8+o+uNe8KvxFM4Ujp/7uo54iHWHv92gIIkhwGaQI4W8E7gAmCITtnY4rOgNeJmAFSAWR9kCMvBkUBCPfYY3XYcFB8oNRGVE2HsCxKaHcejhR6sAc4n5sr8EaWzs8C/yZuCdICSVPuaAM8/MBroIdhC8Mx2FA8jrTlynF0JPoyMsEUOwj4B6rNcdMReOo9PtdRiMlWpcq3iDV1kLC/q5xD7BrybH6DMcfnfdkBH3aSr0if0ws99usz440PSJLmP9SH6Q0LYfgiTAj55k7ZFlC7AaMSeCbxZo5Dx4g4RSkDMJv5n9Ye1sT0kg4HjDc+hZjvMdY+I8ezLCT8yJOWMfbM6sKfYrM0R/YAe3sg6bRtDAnwCBsLEEmHmqygK+NHibYgd4F3tCwIu94Bh4Ahl2AzMnitBdBDVNP8BX6Gw//8ZDjBu9YXsLb/p/hNmIvUEvIKcEEG1f0Q3MFTzA2qIn3GA8vBotCctc0JnuU2NgFoJwRvAYa4tO4Dj3BcfBt379Ba+yX2A5ZI79Yp1IsIEtDHuRlKWK07Ub8TbkyOZrBKbk1Ql2DutJ0izIjsIvBLxJjBCAhv9JhLgyyRMW4EabMzbaTVgi18i0iwkJ1DDvaJiQOWP7XEyIHQBvIrMQMmWBPsYF7nD3DptLwNCSX/RjfaE7uJZxBtnreInxY5sMe7FHJE0sOE/fjNN0oIuPjOBDdJY7Tj5prKmN0/QlyVL4wbAigVwKlUx+2UOeBHHXmwAjfUTTgfghJCm4BhuDr4KPgmyBCd3Xg6I3qJC2pDBEv8i5nZNI457YDfSw8R/7T+W+nYMMM8fM2NDMEvoDG8p6MAYC68jS8bzKyuy5myAnGYduYW7+Bv/44xFG2FBwuNtX0CsskX10riVSOJ+9Zo1dYgzIqfEh+8Kr/syem75ED3AcvWlPi2Ff4TGTMVfOTEeDxwnYW8KEp3zcV2XCQ+hrtygm3obeBFu7OAV/ATto52B7SKK6epixg9d4gshwN/NHh1uBlxHrzfqaXKGPsEfuenMNiTPrK5HGvNmnzCTnIeYCngPHm7+DvSNp7yfOZb3Rl/hDhlXZN/x1nlBkv+EJ9LBhBfpDV8GbfwbRL1jcigLgH3ykzDxBCg6Dz91kbrwNG0fQPAhbBBHjJlFoMQr0PHEYkrpBsusnzmG8YG2uZx9IivG04vHYp2gEBnALJZgv8ZYgexxE6ED8NXxermefKIokRmS6y9/QY2bDTjQd3n9Aq5u11by779Xs20/StDIXat7YN7V5y3AlH9kT93MK+7dv06qmLbXshns0N8t5kWD3kgtu1CqvrTnrZi0/9XrNvfwSTXvzTE3rco+WLKqj3QdX6EgGdfj8hsIvW9erw6T+Ktivsq6tlU/nffmoslV+VUXalFOFnvVVrmstVelRX9VHtdHr/Ssoa42cOqXCY3q9a2lNXMaPOJ94fB4vHTp8UGOXTNWLnYrr1HKP6uLaeVRwYBXVHNFGVbrVVblutVW+V3191Lq07qnwks75JrturP+aCn5bWV2nDNSm7VuO9RSdjihVu/cv1ZL5NTS9/Z2a/tpZmnfxpVpx6g1affZNkT1YdP4Nmn7OtZrn7c2yWx/U6rbtdXB3fL/3CA8cTtvp4dmBmjf6FU375hzNufUkzbs/m9Z06KakA8FJ1T8tAYHQI9w0BIOGkPz+3e8/qgw448egjXi9UseOnT1wVFAvv/yKB1AKK9/Lryn/a2/ovXcL68Xn8ylvnhc8Q9JAs+cu1Kr1G7TFAwD70w4ryfsvOc37v+ccpfL40JF0HUo/oE0HftHCLXP008apWrRjtpbvmKWflg/XiO+be+C2onp2LKfB3atpyqD6+nlMc239sZl2fl9LWwYU08bOBbWlWV5tq/uwtla9TdsqXK0dZS/V3vKXaH/Fi7W32kXaXesC7apzgfbWu0AH6l2oQw0v0aEGF+ug9/2+KudqV5Vz9Fv1C7Sn4cU60PZy7e96qfb0ukA7+5yrHb0v1Zbet2rrt49q+3cvatfkj7R7QWXtXtNWe7Z4DsSueTp8cKOnYHYrLX2fNmxbrtFTuqtZ7xKq1e0DVepRSB82ya/cxZ7RW5XeUY/ve2vj7s0RZjjK71wcTNahfQeU4gnX0aPpSk45pPkL5+jjoh9FAE7ZMuU8ULFc27ZuiwBQHB0CClRiYWzNGYlHyf9VhPKl4smMEyCdShP4DODPnCzAZI1/4+QRxMMoUMWHM4JhIsBHMAFi/jgW1rcFnvzgMiMCpAKuLSBJPxhDCzzj0OPUuNUEOD44V65R4W9erQJoMAcJBxfjBEh1M+wEIUgCUB2MAbTzAUME8EmsQDiS3NsqbwBXJFww7n5ivTCkVsXDOvIUhP99jsg2zqkbOI23sQfwJsEIM9gEqQDPzJV54GTiULFuOM1u5b41AKcFzwBY9r5iwB4g1oI07AEBTau8ISjHKwwswGuBQAPuOEoEzIKSLhmRJTvMWSHoRjDYkh2Q8QIOB+e4DXAOsInFf8wLJ8ytAgPYIyexCAcA3rZgKXwASCOZYXwKoQu4P2uErjAHksYakZA63mAbdoIkH2AffqBRSeoGoyDGgtMJOMVpt8AujXkQuLZKUs7D8bEAG44eges/o2KEQC/7agCSe+LAEWxKlEigwAsmvwB+EsToJZcHAa04Nuw9CS5zkkyeLWmKo0pAzJw45IHgBs5QEHEPAqycSyMYxLtd4yX2kmCYBYnYS+SXwFo0wIyOsfvBx8inBSZwfNGdpq/RzTw1kaiN4t7YOCrGba2QS+TT7yjQN84k47ZxEfjmyalYckVlMwEQ4wP0PokEux9ryT76g6cQgQn41Rxy7sfYXKcNh5wggAUnWQ/0nCUOjRgjgXZkmfUyXiKoQsIFpxy9g77E/nEMO0Gw1v8UFMF5nubhXpwHb2MD/PaHv3m6AvuDTrU50y822SrhSeS6gQc+7dUTQcT8ceI5l0bAOtGCACPWnepRS7CxjgRu/BXr8DD7QeCaNbEnOWjYDZI+Zk8IjqJ3TP/i7LNmfwaGQi/DXxYEAD/wupUgfsqIcG7ZKwvEo0sJAPmDqtgw1pvX1Lh6hn0leUV1OnNFvgh2gFU4TuN8xmeFBUbYWNYWPWOJHdaPJxjdvcWuYIvdABR/ow/8fAr/Y0cpNrAADw1dyLmMj4buYFzGz4k07B1r5Fa/Y0cJ7ppMImvYGqro/TJJkgGcRFLBzmf+7Cl9so/of3iSfsBb9O0mAlhrdAhP+toc4E8SM/4nzUwmCayCmUwPmExav9hEbK3hUfoj0ElgxYi1Q04IBNnYrTFOnmJN9DUbfgIXobMs8QtP8pSU2VEbJ3PnOLoDbOeOEwJHk4Rinu44WWt0lwWyGCs21PS8rQtrZoEqziNQbEUkNDAQvM9eudgHmwo2IQFg2J+G3gfH41+geyn8MuyCDUJ/I2dGBM9IkpqsJdLAQSRt8IWYH+OnAp15cRweQEbdRPN/gvAZsDXGs2BhEs+Z5RfmZfbc9pm1JLmHbUuEGAP2kkSU9UVwmL78uov7kpSGv2wu2DsSZ+5cwKHYc7MdfnuOniWYbX4Ge4J80T+JCOyIX0eh18DbnEP/JLY4B/lD/tHpRsZDJvOJNO7DWri6HQxorzbjnvgKFCT51xo9ZxjWzuUpCGSSviD6gx/A8OZ/MH/W0JUn+NYSMTa2eBuFHGAd8wcSJeaBHmCNWUPGQPLSX6jHXEgeIt8Unxj2o+EPg2XNXlCQhF9gPhR6DH0G3vgzCFzrJnRJlmFjsUOJkPEk9iEze4Gso8fjfdqJcfP0itkj9DwYK944DOuJbbOnf5BpeBd+OtHEvYitgDu4F7YRfAk/xOsXsy5gShcTg83ASX8FHfJ009pW7bT01oe05NRzNOuuszWtxGWaP+ZFbdryrQ6nxpdY2bNqtRZ/U05LLr1F80+6WDPOuUZLzr9BK8+/UavOvUmrzrhZy8+4TvOuvkiTXz9HU9rfpeVLymsPv6l7TFcEkndoyS/L9fW3NXVTywI6s3Yu3VLzFb3XtpTq926pCm1qqEj9r9WsX2tNW/6Tqo3vpHOqPa3za+TWF71raOjU77Rw9SIdTAoOkv+ZdDDpoOavWqiBk0eocK8qOrtKDl1Y81k1mNJL0xbPUIMejfRJo29UtWNdNejTSu+0LqHrar6sc+p6c2zxukoPrKdVG2O/KjvdW5/dB+dp+aJSmtLmdk3Jd44WXHWxVpx+nVad6a37uTdq5bEEBHuy4B8XaemVd2ppmSra++u/J4qDiK05kLJH6zd007wRz2raV5fop5uzaump52rJnY9pXaeuSooSZ8EG/ikJCBSxJSAQSjM2COH69b96CmFGBOzNmTPXM8K/C9bBg4c9wDbGA0zvegDvNk/BP6rCH3yoDh26eApvpFp7QlCpYhUPqAzUtq27vH5/dyLSjuxTctoOJaXsUlJ6kvanp2nTwd+0YNM8/bBssIbN6aCB09vo20mt1GV0HTXq/alqtXpZTRo+p96NXtUPbd7X/K5FtbZnUW3qWlAbWubV+joPaH2F67W55EXa+s1Z2vnVKdr91T904JssSil5ktLLnqK0KicrpeZJSq5zstLqnayj9U/T0Uane+0MHa1zqlK940mVT9Khqt459bzzW52m1I6n6nAXr58uWbSr0z+0rd3J2tIhq7b0vEJbh96prT/k0NYZb2vr/DLauaK1xwDDdWD7LB3Yt0zrNk/X4MmtVa7t28pfOZueq/igni7/uO7+6EHdV+hxFW9aUbNWLlTqEc+AgX3AAqneunvrpKPeHihNGzauU7nyZSNB6GbNWmjZ0uURR7HQ+4UiIAcADyC3wBzrS/tvJYAbRtsC6ARgAArwG0EuDA2AjGNmEAhmYogBFSh7e+UNTq+9qgTCeaOqwwwfBpvqNgLQBMipYorWuI57AHgAZQBF13FmvABS+sHJwmGzQAKOEU8a+B0pCKAGyDZHHQBAEAjjijNMQJ6KKgKgOKsYexd0Ao7JrhvwxdEh4AMg5jgBCPoHzPuJNcWQ4xBbfziHOPEGmjiHyhsMMGvN+AjaE1zg8VKAg78BPOnTwD4JEwINFnQESAMeAWr0CbDDcUOXkNjxJyAAsTiWVgFEAMgcQPqmygRHgrHimNGfBV4AlQRDLIhjjoM5iDgQJHxYM35oKmjvrcEDBAdsHpbssCoo+NBeA2bEmHAWSAZwjtsYAxUzBDmiEQE9N6jKWsBfGRFjhEfNAaLRB4CfgAg8w5z4REewTsaDdh/2kScRjpfYVxxiCzTCQ/AZyRf4m3WnMV72Bl5jTV0wzPgAfbaP8LPr4JBEY42ZT0b7SKKCQGW8yQocCwCjJTu4JzqGJFo0vYHMcgzHzAWa6CICbLafzBE9gTPJ47esB9cj7/Ax6+QGhEjI4jhbggGd5lZcotNwVoOqiQiQMB5zHpFP9Iw/4RiLTMbYI8ZOQ58iP0FJD3ibtbPxo5fYHwPvjBPZNicQfUYlIXsUax+ZM8cJFqCP0VfgDxww01M4gDg6/iADxLrxWLXpKGwFQTmSTdGIABoBRks40rgPn+gy9iuaLBMAITHOfWxsPCrvJkdIDgHgLCFMYy4E5Qnq25xZa/QsfZgtpE+cfKv2Z37IgiVquS9PgrlBDAidityYTaEfsz/Gj9wXW0RyhLm7/Mh+kWCyBIMl522NWBeuC0oqIH9gFXuFHbzLuUF2Mh4CO7DfFiRnnOhkknjobuMnbBEFCwQm/Ul18AUJbvgcnAR/weuMjePYG95ZbXrLz5dug4e5Pl68RUCIvbAABkEyqhJZ34zuxZoj2yZXyChBJvadvsAqzIO5m85ifBSn8GQaAVi/noF/XP5E51pyhwafkDxFJmwc9EkAFvzjJnYI3MDbbsUqvgR6mCdgTI74BF8wb+wB82ateX0lGNeceBrnEfiw4C6yR3Wu2QTO5Tdo0Ld+jGKNPg0rENRCJ7iJhSCZRHfDs65MopPhCwJ3xis0/m2BWJNJC3YzTmwx+MAl9DF8YP24MmmYkLU2mfRjQvpn7czuoLfASGYjWDdsl796mH8zfxcH0FgfsB66wm9TEiF0D8kSw83oDuSSdYEYL+vI9xwHHwVVOfNvEma2z9awo2AKw4nwF8VLZu+QK17PBqZxZZLz0d3uvplNBmsZb8PXYEV0m603Y7CnRFkbs+9uEhGdZIk/S7LYHLE/+A7cH/7x8yffgfsNxzFGZM70Cj4PgWLD8IwLHQWmi6WjWHeeBCbBSh/HS9hxC4TSGAP6KLNk9hw9YnoJvc5aWiFdvMT8CP6j760v8CT7YPrSJWwZ/onZVvgGveImkcyem6z47Tn+GLxjfgYFG/AZe0YAH9/clVn2lUA+vi6ELbCnzdCdjMewCTwEX7PGHGec8BCJqXh5CJxEYBWeZX3QUdzf+sO/Y80sUecSfg/8ajobPY9dsblzDXtPEs/wlb8/1hLZNvvLGlNMgS0KmgONMZvuQB8i64k+hWyEPJLQtkQQDb2JfnJlBn2NTuTe2BObM43kBfNkT2kkwtHHxhNgXcaIbXZlz9+wIXySBEokuWY8ZvvKvjEfbGJGeAF/zJ76R5+6yTTWFpvMXgTtA/sDTjIdx56A8d3CtliEPQJ3mE1FRtCtlohmLUn6kHBHhyHz8KphTHgIGTJ/EnuMrCAjLs4LamavsQEW4+C+JJa5liIk8J/ZTmQDTG1P6bLGxHJ4StOuByOgjynG4B4ktMEidhybwLqZvWK/8O9cfRIv4dfDZyQ3GS/rwLonosMPHdivNW1aadntD2lllku15LTLNfvOrJr29XmaP+pFrd/cVwdSd2T4JMSOefO14LWCWnr2NVpw6hWace61fyQgCICvOu8mreZJiNNv0NwrL9LUl8/QjBa3aMWC0vrtwFylxsASG3dsUqWRzXRezSeU5esbdEXV3CrQvYwajuikrkN6qnWfduo8opdm/DxfNUZ31AVln9YttfOraLdKKta9mqoMaa7Fm47/zQ2JENOZ9+syVRrURMV6VFXh7hV1TfWXdHGF3Gr8Y29NWT5bbQZ7fDigg3qO6qf6IzrqtS6lI69fylLsJl1cJ6fqfd9eW377VwGrn1KOpGjH3llaPv8bzWh6k6a+cKbmX36RfvbWePXZN2sVa3+sLY4kIK7VgpMv11Lv70UFC+u3pf//0/kusSP7U7Zr7YbumjM4l6Z/cq5m35ZVS0+5QquyXKal9z6mtV066fAxPOOnPy0BgaFCoBB+FASE8aZyuWfPHhEw/tVXX6tatRoaPHioJ4DrPaCQ5BnSefrssy888HujJ8RPeEC4iQfWVkUEaf2vG7R48ZLIZ/JBT/GmeP0mJ+lI0m9KS92slPQd2puyU6t2/qLvl0xQ+zFNVb/fN2rQs7DqdXxPVZsWUPFauVSs1oOq1fwBfdv+Cf3UMa/WdvSEqO2z2tT0EW2odas2VrxSW0ufr50lztCe4qdoX4mTdbj0aUopd6bSK52jo9Uu0tFal+ho3fOV1uBMpTY6VekN/6GjjbylbPoPqZn3d8MsSq2ZRYeqZNHBall0uP5JSm/lXd/pXKV2O0fJ3bLqYBev/w4na0fHk7WtxynaPvAsbR91kbb/cL22TXhE26e8rh2zSmrLwqZa93NPzV7SXV3G19Qn7d7QI2Xu1HUfXa2rC9+oq9+9Q9fmv1f5SrynQRNHa++hY4GyZG8fko7qaEqajqYmKyX5oNb9skoNG9XT5198pp69enrKb1TEYBJYB5AQMCUwZPuHorL9+28kFD8OrVVJAeyokoXI7FOx6Doe/I2htCAajrcZCwwjjoo5lBhakg0WHAFM4KADggh4xmqAQEAeAROIoLbrlAK0ACicy30BVAZWACIEjYIMDsFqjJYlDKxxPePivvTJ3ziCLmjFkQQwAcJsT5krwRWu4RyuRzajVYqQsCGQa04464lTbOcjp1THG9jl/gQ4AcoAoKBGRQgOrwEUxsA+mFHHeANgWTMaFWUEltEnBPDdilwaCQnGAADhHAIyNj+qrizoRgNIAKRtnQCJVO4ZGIBP4BdAFsc5jzlT+UqfsRrzoNLMHqcnIEOgwPgRp4aAih9E4jARLHArN2nsOXMJCtxCyCz3IPBgjhNBhKDHhP0EP1CVjBPtriXrzdxtvnyyT+Yo0JAJAuwAqcxU3/oJsA+Pu6/jsHEYf9tYAMGu7NBINlHl71amUu2CU2BBA0Ao6+v2F61xDkkdt79YxDriWDAu7gXP8DdyHtS/NYA1gRvXScJJA+T6k2zxyDvfIysEDUze4WvAL/vFmtHog2A6QBUnA70HSAWsuryPTOMcmVzGS+ZAmHyzBzjYOOBUluMoA+rRxehyc6ThK9bdKu/AEuhRZNj2G4Dv54toDb7AcYK/6ItADE4sfbFuOEk8TRcEzrk/jo2r13Bo0O/RnED2Dtmz4JHbsA04NxZo8hP9EiSyPWK9cF7dsTEHdCNBLjcYDG8jFzZv5ARed2UWvcBaW7COfSfhYA475+P0oJ9dsgSW2Vtr8fAj/I3jSWDR+JH54MCxljZXrieAgxwZP/I0CQlF9KfpRQJY6AlzNBMlrmMNzJZyb/iJtXP5yfQM/Mg5di4yiTzYHrIfOOpgKduPIL0VrXEfbG+8ziE2FZ61feUTGYv3XgQGbO2wQwTXrS/G77dz9Atm4XuX3/g3egK9hZwYgV/Yb5P7ID1In/AK37trCz+QhDI7bAT+QLczLrs/58MTNlb6ZL/cwDhjINCLjoH32CsKJ7DBdl/2jcAaet6PUawRhDUcxz3hRzdJx3hNJl15y0gmGQOBBp5Gs8pQ+B45sCQK1xOEYxwugQmRSQssWYtXJi3RaDIJlgMTch3nIOvoMTe5BDFX8JcFTa3B7+jZWIUSGRF8xF4RPEcm6Rech39iQWDDruBaGyfj8Y8TeSIAS4LOHSd86I4TPQ7usvmwP2Bb93VIEDoQm2zJWmvoB5e3ja9tveEB5JUnAg0nEYiH1znGOfAjuh/+hPBlSFiYzsOGYUux6X7etEbgGhzH+dybJ2zAuewX2BJs7I49HhvKMYKV8H9QED4RYj+w45bgotF3opXYLrGerj2nxbLnsYg1ApuYbqCRjMD+2r64BK/Cd2ZH0I08aUUA3bAB43DtObrGtefgLWQdGacP/AZwEzKJnue1aq4+YT9IssK7nENFuu0pGIVAuBU24cOQ/HB5iGIBkmBB/EPDjwAvcz7zgYewEcyV/SeB4CZGSdSxf6ZDXMInBEvAR5wPT5LsJikDsUbIp1XU0/DbGYMRa4V9MjlBF2D70QFB46ex5oYlsQXIhNtnIoSdxCc3/EczrODKCXqd79AFdh7zIYbA9awFBB+xZ67ss7/xYgV0FL689RcPwSsUV5heZ1ysC3oq6B5uIzlEQSf7jy4Bj9q48Z/ZP+xV0D7Q0NsmH+hE/KOgV48GEfYI/rKYA3aORIMlouFHZB8ZYW7sEUkVS3DAX64/ybzxQbCr8aw19h6/Gx3D/El0YJe4lrFgP9HHdi/22fAx60tSyTCC2TViKMgh/VPo4f4uCskTeNV8VWJa2N9E9hriXiQz4BPGw3gZN/uXiA4nAbHaw7lL7sqmVSddolUnX6ulZ16nObefqxnfXKifhubRul+760DS1qhJCH6ad9OPE7XoidxafvoVmn/mPzXznOu09LxjCQhr592oVWffFElCLLj4Us3Mc5ZmNbteS+cW1/Y985V6NNjXSktP04+rZ+vpjkV0Xqn7lLXc47q+cQG91bO8Ok/oryFTR6vpqC5q9kMPvdG5jC4q+ZSealhYH3Yup+wN39I9Dd5Q+ykDtPfgv2OHP5N27N2lpuN76c46r+nxRgX1YZfyeqTOu7qoVA590LOqGo/rrnrD22n4jO/VadIAvdazjK5u9JrOqfCkziv3kF7s/o1m/rIoMvcgSjmSrC07Z2rxrM80o6G33s9k1cKLLv89+ZD1pshau2u/2NuLmedepwVnXKVlZ16pxblf1JaZsxTcu8dfXjuQRKygo2YN9PD6J+dpzs3naxlPVng8surkS7X4/uxa62Gl/3gCAjKgjyAAfjB4OGwAqjx58noG5dlI+/DDIurVq7dnTDZ4TsxKVa1aTQ88kE35878eCYJYBUOa1wc/lpziKYL0lFQdSUpR+uH9SiUBkb5DSelbtWb7Qg2f2VcN+lTQN01eV5EaT6pohQf0Wek7Vaz07apc9Q61bHa/hnZ9TPO6P6Zf2z6gLQ1v15Za12hLlYu1o0JW7Sl3hvaVOVWHyp6qlIpnKq36BTpa9yodbXiT0pverfRW2ZTe5mGltbtbqe2uVWqbi5Ta8gylND/J+8yitDZea5FFhxtk0Z4aWbTTa3sbnKHkdpcorft1Su99s1L73KzDva7X/u5Xalf387Sjz6naNTSL9n9/kg6OP1X7xl2g3WNv1vYfcmndxMKaNbGUeo8sqbLdP9Bz9XPrpuK367xCVyjrG1foggI36OKXbtUTH7+ktgN7aNMOz0GBO+CcpCM6muTtgacYU1MOacvWDRo1Zri69eiivv36RtYasATAotKNQBD7xp6xd7Z//62EUUXBW1AXAEqwAsIhRvmawaXxNwYCJwWexJhYBSRGnUC4Bf4xYAQEre9EG5VmKHsIo2NBv6Bz3YaRIBgYBJzZCyo+AasAh6DrgxpGlConnGO3XwwniSdz1nHSqEqMFtQh2EJFgD0VApikYsweRcXQuhWgjBGHJ6MqJACKzQdgw5is4oI9AgCzdoA+nEL2jnlwXz84BxBZxRfghySS9Y1TApiF4G2qmizBRKO62gVGgAGArxtwSaRRAWoOLs4mYzWHlGRHUJUg4yZJQjWkgTwaATeAVjTwAEAiCcA9uQfrRbDW9iYjAuDgSAF47J4ZNfaDaiUcNio7TgTBezjZgLOge8Zq8Dky73eGcHiR83jkL6iRAItV7e4Sjg/rnhme4T5uRS28gR5zk4TxNIIyBBgJ4pkTbIR+w/C7zhRyjw3ANtNwEOAjuyfOK3oWQIvsJULImb3awuQUJwSHnEo7gng4yOg9eNzWjQAA/G5PJMD36CY3cJFI4948gURFIGtC1a85CtyTcRDwiWbv0OGM15xLgk0EjKNVJqGfCDa5iTRrOFRuIthPyBMOCuciy+gtqrD8Y8OOUdnkD4bFasyZogM3MYWtI2hq+gbnjH79CUXO5zo3WRFPYy5B9gci0EJg1Q2gMkYCIC4/ErSxwDOOOv1hC6OtYUZEoJkAuQV9EmkEX3gazQ0+My9soytXiTaq8vzrE40IBsJbmdVpOMFm590AUNC50Rr7wN6g8/x6hnmAf3iqIOjaaA08QcDAAgwuoUtIWKEr4tWv6C7GSCDPbCe6HBxhQQ1kGh0LL8Yi+NeSwcglet4f1MKOIjtuhXdGDZ1GQBHsYfoVmQRL2TzhfRINfplEJyCT8LIlK+JphgkJLLk8R5EYdsgwHLqFtQuSMwInYBo7l4ZeAEcH7V+8xJywGW5xCdgeXGc6kDkzTsOut956a9RxguPA3+44eYIFX8DGCUbFZro6kISEHwvTP74sT95ZUDejxh4iBzwV7eIkkqquviAgCXZhjuwJMk7gzvAcfeAb+O2AS/Afsm19Mk8CWMgO+B0+S0R3WwMjgEvp53iI8RFAtEQeGBJdn9kn2SBsOkF3155TvEDwPdZaBRE2Fb4wv4C1J3np/o6Gn5Ah9/fxwE0EQa1Yg32MZc8JxrMGho8oIoJPOE4iHtxhuoqGDmIv0LnsKfrSArzYBEsUwatU7hsPcRweQ4/FIniep8rsfswH3qU/7geOMp8KXqJgzBKnfjI74Abb0XfEgiD0GfrC7DDjhH/N/yORwhNYdpw1Ym8twByNsM1WXIjssC7oj8wQWAHbnIh+tcZeIXPoKyPmjK+FzsqM/eYaiovcp+czImwLdtDVgfE2/G98VWSDAgDbC2SX4iUrZIlG2EiKbriG/cUXy4gHjRi3vfqK61kz/DmzWehv/EWL8xCvYb2Nf/AfOG6/p5ZoQ+7QLcia8SqxHY6xlu5vuXAv+MR8BMMVxCEgbDs632JONOwSb5ZA1mn46/akDcftyRk/vsqIkFWSoCSL7F5BhUwZ0b8nIC7W6jOu08rTb9Hys/+puXedpymfXKxZg3Jo7S+tdCBpY2AS4mB6mn4ZOESL7squFadcqoVZr9XMrNdr8bk36GeSDk4gfBX/Putm77wbtMjDPLPynK0ZTW7U0nlfa/ue6ZHX6wfRjkN71HP+KH02uJYeaFFIWSs+rWurvKDXOhbTl4Pq6OteNVS0UwXdX+8NXVIpp15v96WqDm6iXK2L6LwKT+mdLuX04+KZ2oO9j+vXrzNHvB6fItIx8yYpf/sSOrf8k3qu7WeqOqSJXm79iS6umEPZG7yjoh3L6ZNulfXlwNrK1/FrXV0lj86rnFNPtC+qr4c30MDFP2jP4eDAflp6irbumqhFM4tqRr3rNPvps7T4wku18tQbtfqsW7z1vulf683nuTdq0Tk3aNY512nh2Vfr51Mv0+IHn9KvI0frcMB6szr7k9ZrzbqmmtnvCU358ALNvfV8LT/raq06/VatPv1arTrlkt8TEJ3/ogQEwoQQIDgYJ5ycd999L5JN/fDDj/TFF18qX75XlD37455DXljDhg33lM1yD5y08wz08ypU6P2IsBjgOXr0iNK9xUhPS1VaymGlpxzwFMIeJaft0/7U37Rmx0KNmN5J9bp9rM9rPqE3v75N+Ytco3eKXqVvil+tRjVvUP+Wd2pSx4e1pOPj+rXlfdpc52ptrny+tpQ/UzvKnap95U9RUqVTlVr1TB2pfYHU5Bqp9R1Sx0eV3iW3knq8poN93tGhbwspeUB+pX6bQ6m971Jyt6t1sOOFXjtbyV3OVkqXc3Ww7Tn6rWlWbWt0rna1vkpJPe9W+uDHdWRETqV/l0spw3Lp8OAntK//Xdo16DLt/u40HZyQRSmTsihpwj90YOx5+u37O/XLhJc0dVxhNevzngo0yKtbS2XT+R/fqFPevlwnvXqhTnvpMmXNc40eej+3GvZordUb18tbqogQHT2UpiMHk3WEJ0XSk3To8F5t2vyrFi9bqP6D+uutgm9HHAwMOkCH/fp9rX/fOz7jIVOebvtPEIbNHgWlATgMmGAUcDLdBAJONhVGjA+AB9C0IBuAigCXGXUAIkEwuzbRxrX2KgkMEKCbIIpVBPobQUOCfm52P4gwHhhvnCVAFUGAoP4AB4Bo1gejiOPid14xfG6AjCQMBjKak4EBJUhnFVY0jCyVZAROcbzdijgcJpy/jAija8ElGvtoleAkMGzNcCy4F+NjLBhY1syuw2gTzDTwgQNCMsOAL5VFBnzQS1TmGLCh4US4gWYSI5kFLvTLWCxASXWl6/gRkLXkhEvwJmCPwJs7NuQUhz+abMHPgCN3/QnUxLP+EP2yblQ3saY4TNHAMfMAUAJoCZbiaJ0omQfs43C5c4/VCEDA5wS0CaziDPrBGuviOnCJNILlOFzxJlhwLNykZ7wN3uadsEEVnOhmgD4BmWgBU+QdYIyzQICYfQ9KVqHXkQuC5yS5bKzcH0BNw8lj75FtXktDhTN6M1ryKyOCP3CE4UecYXOCuA9/M3buz3fwHUEtdLObjGFdmJddm2izZCg6ECea4Bv35RhzZe3NUQgiQCNjcu0JujWaI4U8oHOtCs8a+gQdH80JYH94Z7w7T9bNX4lrROAGB4sAXbQkFfqP++LY4Jxh29z785QJ+2znIysEMYJkGtliXjjAsewP40cuGRd2mHXy2x8IPc54cNRYK7MDfn7kO2QRG06AggBlUH/xEviA5LI75liNe5MkIZBCBSmOsWsnkQ3W1saaaIM/0VPxBvgIymRWFuBhEiima5hPvH2hl+EldAf7QGWsX2cZITPwOmuGXJsd9jdbW+QeGSWgEc2eoEt4Ggn7yTXR1hu+JFGEDXZ/lJlAsyX47VySBdh6C/5HI5KQVvlLg1fBIC4xbpNJdHE0mbR1JOEC3xB49sukG6hgPiRkY8kkr27ALkfDmOg7AsnoLeQtCBMSpHN1Af1ZtbKf0En04/IOfEwxU0ZrGYvQgfiLboCf4AkJcCPGboUwNP6ONk7sCNjAXRfGia22NQf72G8j0FhvCzz5CVnHHuI3ERCDf+06txlf0y+v3CDBZfuHnNO/KxMUg1kwy7Cr4SB0MnPI6AlEAvzoZuuTRhEO8wCLUmTjHou3MU+KaI6X4BkqsW1vwW/wbTT7Fg/hL2G/zZ7TMrLn0QidxXjcfWG8fB+N2BOeprPAI43kpD29SaDFEmU07LmL/dFPbmEFiTXDm/gC/NvVc+hJvofgbfCp4RLklUIk+Asb5WJpeAjclxEPkYDAv7T70bARyDTX8qor+x48Ci4CUwUR82eMFAaZngBv8ZQD/Ai/kjy1/mhgXb5HD6Bf3SQ2GJdEbEZYlDiA6xuy/tH0Z0ZEXySNrK+MGnxAMoxxYweQZVe3kzAjQRVNb2TUkB2KNoJeFxqN8AdcXz+RBr+il/A/wXP2PckV/L+MMAsxA9feonspLIyHuKf7FDF6iNdP2T6it0nUm69K3yS3rOgRXkZ+ovmyGTXkEt+dOaJn8IXMV0HmSFKznxC+q6tf0Ufsv+09Ohg94fpwPA1k8Qrki7EzBztOvBQ8kSjfck8KYuwJQRpxGwp0E+mL34BY06aNlt71kFaedLFWnX2tVp1/s1afcbOWnXmNfrrlfE354CzN6pNda1a30N6kteKF7y7t37Nbaxo21ZJLrtXKLFm17IxrNOesGzQ/6w1ace6/JyCsrT7rJq085UYtvugyzXz2TM1oeI2WzvhCO3b/qJQj/z/eTD96RHuSDmjMyhl6o3d5nVH2CZ38zYO6otbzytPxE1Xp3UAVu9TWA1Vf0dXln1bZvrU0ZNYofdy7qs4onk03VnleX/WopQ5j++r7eZO1asu6SME7embLb1u1bfd2pab9S4YzopSU5Mh1W3dti/Sz//ABLd2wSiPn/Ki2Y3vr025VdUPF55S15CP6ol9tDZ45Ul/3rKwryz+pp2q/papd66hktxrK2e5jXVLzWW8u9+uCik/p40E1NGndXG+dD+hIwD6mHN2vbb+N1cLJhTWt1lWa9fRZWnL+5ZG1JLHjJh9orP2K827UAm8vfjr7ei0945/6+R/naMlVN2pdq7Y6uH/vv+0mkr7n0EqtWdlEM3s8pMnvna2fbjhfK864Vqv5TYnzb/Huc413v0u05IHsWteli5L+0wkIl8ExpBhYnJVnn80dMeYonx8n/Kg2rdvq9fwF9OSTT3kgvIImTpykgQMH67PPPo+8oglF87uhOfZKp3Sq8pOVmnLQa3t0OOU37U3do5U7VmnQ1O6q0qmQita+XwVLXaVXP75Q7xS+UGVLXK32De7QmA53aXaHO7SwyR1aVuNOrax0o9ZUvEy/VrpAmyqdq20Vz9auimdof9WzlVL3Eh1pcZOOdHpA6d1zKLnXi9rb521t7VdEv377tdb1L6atg4vowLACShmeRylDHtOh/vfq4Le3KnnA7UobfI+S+9+jfT3v1O6ud2p/r2zeec/qyPhXdXRifqVOyK+UcW8qZfQ7OjT8Ze0ZkU27xv5Teyado4NTT9PhyWfq0I+XaNf4e7Rm4ksaP/YD1enxtvLWyKkrPr9Lpxa8Rlle8xz1l8/VSc+do7NyXaiHCj2hhj2badXGdUpLSVXygUM6+Nse7d2+Q/t+26ZDB3d5a3fAW8cU7T2wW+Mn/qBPPvtUD3gOEMFOHHpARDTlFEtpART87T9BOG0YRAw+jh7Gwd4NCMADeGNAAF4oYoClJShwcjHiBMQwJDhdPJZvDpk5gFyL4xJvAxzgWFI1AwCE4F0C21QiYaBwAu1cnFjuQ4UxQR/Gn5GBQCYANVTxUrmKgcZo0R+OEyAN8MOTEhhPKraCABvOJoAVIMS1jMN+jDAa0Q/gCSPKuhGMBkDCPwT12Ae+x/EiwJ9RdQTEOADsrAl7CcC2iiiCMjY3nH8CGqwnjet4xRPHuScBLAw4ewgPEvQCfDBG5kjlsfXLPAAHNg+qWwiUAXyNCFTAN9zb3eOMGuezJ4ATS2j16tUrste2ZoDsaNXTjIG9hXc5n7G7axJEOFvcj2u4P/cC9BsPxkPwHfvFq0RwYgmOMH+bF8FqQCygiUQFQQB/heDxEvcHULrrGa1RRUdwC/6Dz3lcNygoCehDLoL6iNZYQ67hiRAqzKIF2fwE6CMJxL4F9RvUuBdz4R2trqNixJyowCNBytoAwuEhGyPyToCGdYDPqLaK9dQR/XEOjhx6CucAfkH2cNQYO8FjHA+cSwI78c4/iOArHHgq4dAdVP2gAxk/94O/uT/jQGeBD+AD17FBjtAvyCvXBa1jUONcrmF9SK6iN+gLB9tkH/2BLQgKNhlxHc4QSSCTSXgDbBPNAQPs40BwLtegG9FH0ZIWEPuGs4+scQ16iSqraHLGmHEOCdhRtUggzniDhvxiI8FfvDoEHeKfJzof3W/XYAvR59EI3YlTiY6iWtNvf+Ad7A9YD5tGMjnI/hjBjwQX0e3YcEtEGD/SL/xC4IMANQmLaAGPeIm9QaeyxkF8Yw0eIZgAzxIAhDcpqPHvOfuG/WC8Qf1Ea8yNe1CcQGVfvNgJXZ8ZbML+UBzhvh+dZEQ8fcG/2AR0BjoRHshoHwi68iQzsouNJxHh9onu4ik6Cgs4LyO8wPpgNwkAE7inT7NRzA8+JKEALiJJA2+7laL4I7xDGnyCXKKrscVgpIwIHWy/V8G9CMDYU64uIV/gTKqGkUnkCX7mGsbJeNkDZJIgOPLhl0mKV0hgMEauw+7GCgAjX4YJwZhgJddGuDKJraRCOEgmecKEYgfjB/oyzOwnxjxo0KCIzuFcruG+QWuSCKFrSWLAK8gnc0BvGraHCKixrhxnfgRXou0h+oVxwrusJ+OER9zkEXtAFTr92Ty4JhoWxx6ix+ExgpOsL+NgHfgEh8HXBHxZD38wnDGBbdHv3BOeQq7sKRxkAd62Y1TCElj284mfkEcS2Kwd8+Ba5Ju9pm/4lz4ZZzyNtaeRREkES0Yj7A+4lPGxF/AOWDKjoHgswjbi27HujJU1zcieRyNwCjJrc2f9wGXwZDTiGE/fMBfWlnnBaxRQsh+8Wg2f0PbSb8/BJegS9gt9CEYyvIXOAYujM+gXf5UqdFsveB7MBH7kOEksClbgW7AJhTnGB/BQ0Gtf/cS98d3okzGzrmASbB5BVnAhfZqcoE9irQ+YFuxhvjgNWcN+IBfgVr7jXtgY8Dr8yjjRZ8gqx9GhJJQtsROL0BXoV66hX/Q82Dij64IIXUmxQizbDq+wTugBziUphB8FVvBjengC22V+a1B/sRp4DlyFDomXsB3YEHgkqM9oDb6hgJH1xF+AT+kDfkbmYj0ZZATWIhFm8wVPkfDPiOgXnQfmZv+5LzzsJqJZX2wUx2jMEVm0MSEn9iruoPlFa5yP/YRPWTtwB7oB/uMY40EWiREYgcPBHfAB5yA/JJ6N4Glwm8VIWFtiVIYl+UQXIuscp8HDmdGNyA6xEPSJjRfbH8svDCKq19d5uHzZ3Q/r55Mu1sqzr9XKC28+9sPRN/2ehLjmfE0peK5m9cimn1c00u6Da3Qk8kO0v9Mezy//uVRZLTrvYi3/x1lafso/Ne/UqzXnrOu0PCgBEflNCJIQ3n1Ov1GLSELkyKoZNa/W4snvauv275WUFvybjMs2rlSxAbV1cc1nlaXcA7qwVh691vFrtRveRf3G9FehJl/p8XL51HZoJ81YOkel+tXTJd88quvKP6sH6hTQndVe0TONPlLVIS300+qFWrlxtQZOG6auP36rmas9vyOOH6ved/iApi6frU4/9NbQGd95fazR+KXTVaJvHT3V4APdWf1VPVjnTd1U3sMNJZ5UxUFNNX3JHDX8tqWyl3tJX7WtoAFjB6n+wFZ6vv1nOq9WLmUp/4CurJNHlYY30bptwcn65LQD3tqM1OIf39L0SpdrZvZztPjCy7XqNJIPvHbJa97ausmH1V5bdj7Jh2s157R/atnJV2p5lrO16OLLtKpyVe3fuOGPBEQ6MrDvZy1fXFszu96vKQXO0Zx/XqjlZ1z7+w9a07/HGytJQJx8iZY++Jh+6caPUP9FCQg+EUoAEVU3KGYM0c7fdkYEYfWqNWrRvJVeeOElT3BfjzhFJB0A5Tg48+bNj5x3JJJ4SFFaarLS0r2WdkjJKXu199A2rd25SiNmD/l/7L0FgBTHuv5NQoTg7q7BCRLc3d3d3WVhDXd3t+DuCUGDu7sFl+DOCsvz9W9I5XQms8tCknvu/X/znlOZZaa75HWp6pbn9Faq0z+bKnsnVIUuUVSzY2T18raMzpi02j4tiw5N+lZHhiTRAc9E2tspqfZYbX/3xDrimVAnveLrvFdsXfaKoZt9YuvRsGR6OiGTnkzPo4czi+n2rPK6MLOmDkytr83jGurHMQ20a1JNXfqhqp6uqSa/jbRKevNjWfn/VE5Bm6vo7Sbru/Xl9WpFSb1ZWVIBP1fS2x1VFbCznF5sLqkXP1WV34YWerO+hZ7/XEOPdhXUwwMZ9PhQCr08nEavD2bXb7uL6dBPFTVnYWW1H1NSBT1zKVHrdIraMKmi1ImnSDUt57V8eEUtHkH5mnyvCctG69pvly0D91i/WYxz6+plXTx7UiePH9DlK6f1/BWK7K0C3vnp0q8XNWvubDVo2ECVKr5/iSTBGslPQz+ULo6F+eR7Gn+jLGn2v+2Ne8z1/xZQOeb5fBwBJRDAWJmAmGo1vIST7+3t7XBq+LepVvM7DiK/49Dh6OAcM28Ag8sOJe7Fgf+YxlwIOpx3zeC8MUeMDIaHa3GUKUwQcIZ2l7UB5sg4JG4wbPRHUp2X87HbA0fNnlB3BhK2XIvDy72cYAhNwYDgj3HAG3xDsMRpFHY5E9zzPbgjIA5NEMA6wAFzgJYkcU1ynncyMBa/YVAZB56CTuyawhEzY2LsTZDE76yP38ENa8QhNI4/PEoAyr3QmE/4we7UscvI4PVjmuEnEvRm/RTLzDxx7nGSgnMGmDtOFrRhbuAEnRgSLQkamD9KnTnAV4zxsTwFmOAafYzcGF5Fj4NjkpM4fkZW/kkgWUSgYMenq8acSI7D5+xMDenUEEkVs4aPafAddgg+cFUYcAWcwIC+0NlVn8E1glTznNXgANkk8WaXd9YFnxAEgofQFoQYB31EEQ86o7OYM/xGnyR60VUUcv8pOrNjC75GDtEP4JfxGJfxSaIjJ0ZH2wHnnfuMLviYxj0kAwkkWTd9kVxinYyNXH6o8AqAL3Qkc0afoMfRcegSV4C8wstca9bI42pCkknmhhxDXzO30CQNsDXoSnQn/GfWjvyCV+gc3I5Q9CS61dxDoct++iQ4MPaH6+38CF7gRwpXIcmlHeAxivQEe9gCOz9CP/QpeGBe/4RPAb6QbcYw63bVGBtZIGBGD7jiTQD9QMKHhKOrfkJqjIEMkgQN7drQwR+au6vGWCR3kUPDt9iJ0PQFTZAjeCm0j6QD8MlIiuEfkMyz62L8LxJwoSlm2AHbieyxA9Nuo/BHSJTAKyTOnWWTMSgiGZ8Ae4nvFZrdpCQCKBIhk4wFn4e0KYDrkUn4DHts1myXyeCSC8RN+LbGN0PnI28fAq5Bb3O90QPQnLliK5HJkPwIcAaNzLhsygnpeuwDOpFrkVVsMvrk7wC6wCT3DV+ir+38ge9nfHfWxzxD0qvME93Iupgn9seu49DtyCC/0cDXh4pS8Bb4wi5xveFBPtFXhq9d+XncC2/Ar2YN6A/Dh/ju2HXzG4ku5vgh/YAeAnfQkHUYv5bxwB+6NTSy7tyQ3U/xJZ2BIgjyhzxAC/iUgjJ271MB/MIfZq7gy5w+/1gA//CSva+QNgwYIBZlLeCWdcFfbPIA5/ifxp7Tn7M9RxejE7gP+UEvGH8TfHFCHN+b39EJ+HnOvyMrJk4wRSxknf4YFz5gXfz2IR5ibsQuhoeYM/YGuSQ2YAwjJ/Co/fFCwQHXmFicRh/IMP4+/GC+Zx34weQVWCMxGt/xm4lpQtJHBpgneOYe7gW/+JafAuhobCZFcsMXrhp4Qg/Ai8SpwfkKxJj4TeiJj5VF7gF34BMchRawJ/ZYP7QNviFvAs75xKbQB/EKfB0am40PSI7A6DpsLnrxQ3wIvxHPmzwM/I2Otush+uY7fmNe6F1iUwPQAB/8Y/HM9awVvWv6oy/yCfzGfJAPu43Av0ZPGrrCt/goBtDB6GK7zscGGGC95FaMrqAhG6HJoTgDvEFMY/ifhix9rO/8+uULXbX8qTOZfy9AhE+iC9FS/fHi6Itfp9TZL5LqUKKo2lUjgnbPzKFzZ4boycv/+EX3LB/phMVHR/MX0vEUGXQ8UjId+Cym9n6dwPEeiMvR/rwr394uRUytC1+l1ImocbTv+/Da0yuujm+tr5t3f9SbwOdWIPv7IL/Dgyf39cOeFco7pbE+88iicD1yKeewumo3v5/mbFuuMcumqOP4npq8app+PLBFnguGqlCfGmo6o5cKjmmkMG3S64tWGZXap7R6rx6r5QfXq+eywSoxqqGazvXSlnN75R/CSQj/AH/9eHKHGszsrpLWPb1XjdSyAxvUafEAJfEooM9bpleYthlVbFwLtZzupRL96qr3opFav3+Txi6bqA7jPTRl3WzN3L5EDWb1VJahNfRljxz6vGc2FZ7ewuprvZ4++2tM9dr/mYWTNTq+uab2drNw9d03Ohk5vi5Y9LkU0aKXC9xyGgLc8zLwPeHiab9F3+ORk+l48kw6WqiwTloy/vDy+xOZQe+C9PjZCZ050Vu7pnynnVUj6HD8qDr7ZTJdCmfRKIrVJ8UNeMNRgIitM9nz6tqc2XoTjB781woQdsBBQ6DYLciLpQl0f+M9BRYEWAJ59Ohxde7STcWKl7QEs7/D8OHUnzlz2mEs/fwpOPhZ176xiPvaUYAIstqbN091594VbTuwVgOnd1V1z5wq55VEVQYkVO1BsdVlTFxNmZVM62Z+q82jk2tz77j6uXtMbegQRytaJ9DCVom1oE0SLW6XVKs7JtGmbom02yOhjvgk0bmBaXRpRCadH5VDp0bm1b6hBbShTyHN6l5Aw1vnUv9m2TW2bVat6ZNHJ6eX1d1VdfTkx4Z6sr6Bnq5roOc/NtHzDU30eGUt3V9QVr/NL2b9XULPNxbT85/z6OH6rHqyurjerG0pvx976NWurnp2opken6+uxxfL69WlKvK72ED3jjTR9g21NXxaKTUYnFtFfbMpp3cWfe+VSd/3SqtsXZMqU/M4ylg3tmr2LKzFWybq13vHdf3WaZ0/d1RXLp/SgcM7tHT1PK3ZuEy/3r4gf71SoN7ohd9zXbx8UbNmz3I8Aoud5ChMjDQOHYoKhYnyQ5nxbxoOA8YMxYvC5XccBa7lk3/zN/eY+/4tYDwSbjgIGCUMhBkPZY4zyffmd5xc++9cb36nH7uip2/z28c0EhtmLoxhB8ZmThhN+7Xg9GN2Mxgw/eEc0JdprAXH4EOGi9/NGrmPeYXGqQGP9vFw9uAZsy4af4PD0AD8Ag7s95p5sD77/Ox4on/u4zeu4W/7mKzP4IbfwYmhCbiDRmZMrmEswx8A6zS/metC25irPagyfdHAufNYzmDnbRprc+YnOxh+Zq40M0ZI94QE4A66Gv4w82Ye9nX90wDdoZkZM6Rm+PxDfGanc2ibwSNzgedCopUdkANX/YXUDL1Cg1f6t8s794cWD66AtRk6mz5p8O+HePRTAPrSL/3bx2P8kNYAHzNPgy87/kJqpn+7bmBN/Nv+e2hwzxyYt+mbORtb6Qq43j7Oh64H7HJs7gNfoQFoCW/Yacnf4C0kW8Bv8JC5hzWik0MDrviR+/8OP4Iz5zXQ54dw9zEAH9ppGVIDN9AkJJwwL/BM4dxVH8E1s0Y7f4YGmM+njgW9oLnBZWj7svPSx9KBtXGv3abRDG5D43c4A/SAz5gXfdnXFxyv2GXSjG/3KUIC5sh4ZpzQ3Ossk4xp8BjSvUYmzbpCK5OsGX3hrAdCK5OMa+ZJ4x5wFhw4yxFz/hS5dwbWYObBJ/Ow05MxnH8PiYf4DZzY52nHJ387/x6adYAbY8/MvTT+HRJfGzoxd9O43qzxQ+sPDrgGW2bnHdMvc3We54eamRsyExIfhBaMzJq1MZ9P0Sd24F67naV9qo9q1w8f05eRA7MuZA/5NvxhvucTetiB68zv0M2uu+jXFb4MgE90ifkdHjY893d5yOhVmpmzMw8xX/t8ggNkyfAkzayDuTJ/8z1jGnwzD+ffQusDME/mbNZg7/djwdA2JBsJfmlcx7gh6WrmDy1c9ROa9rG+AgCu7fQMbWNN4Bx8MmeDg4/Bp6GFwRH3wvOhoSPX2fnGWQ8ZfjTz4m/D/wC/2/V6aJuZJ2s2tDR9mbGYl50OXGd0B4377bLBesGDfQxwawdk1vxOY/xPAcaib8YwfdH3x8KfCxCx/lyAiJbScRKCR++c+yqJDieIph3Vw2vXlCw6d6Kvnr85p7fv/HXz8lWdWLlS5ydO0vmevjpVsbb2pcqinZET61SkJLriIjnuaI7d+tYYJNDDJteJr+Nrf7bw2u0ZV0d+rq2bd9fqTeBjiy7I6Pv5QqNL967J56exSj+wjKJ75FE0r8JK0KeUas/2kO+KMer6Qz95zO6jYYvGqscU6+/p/bXpyE55rRmr6N3zKkyLdArTJoNyDK2uniuGqevSQUrbp7T1W261WdxfF+78auH3/Xh2CAp6p3M3LqnxXE9F7fq9sgyqpJ6rhqvb0iHK1L+iPmv1rT5vlUGxuhdQv/VTtOnwL46xe0zup6ELxqjXnD7qMr+vvFeNUdUZXRTLp6giexVSFI9cyjS4vAZunqLrD2/rnTUO48OWrP114ANdv7Vch3+sqt3dY2l/pgg68WV8xzsfLkZyXXygUYC4YrUTEZNoR5TE2v9tNp2qUk/nPfvonEWrE2vW6s7VWwoIeqMnL47ozOFe2jkhrXZUCW/ROoZF86QW7d+fhnH06VSAOPvfKkCgAFBOMDw7A6gI89gOjiXyssd1a9dZiuJ9Ffv+bw80fPgolSxZRt27e+jQocOW0uH4nZ8l3L+feLCaKUC8tT5lMbXfy8c6d/aApszup3qd8qt4qwSq3DuBWkxKqV7z02jUipSaMi+xJo6IpXE9I2lKlwia0TGqprSOqRGNYqp3rZjyrBZLvtXjamjdeJraLKEWt0+sdd2SabtXau3pm147+mTUjz3TaV67VBpeL6m6lo+vxkWiq17ByGpZPIr610mg+T2+0/bRJXRkemWdmFFVJ6dW0YnJlXR8fDkdGl5Yewfm0P5BmXR6YlbdXJxDD9dls1oWPVtbTH4bWitgW2/5HRukl9d669ldDz2/11V+d7sr8Ka3Hp331qE9HTVjVR31mFNCTWcWUJM5edVqXh61mZNTraZkU7ORWdRiSE4NndtQO47P1LGL67V93zLtOrhBF64d1e7jWzRixmD1HeerzQd+1oPXv8lPrzgH4cDvxYsXNHnyJMdjmDgayq4dlBaCjEJFgfI3gDJkdwI7ntiJQfUWhQu9uYZrjVNhWmiMjBvc4AY3uMENbnCDG9zgBje4wQ1ucIMb3OCG/w7w+JxrjgJEzj8XIP5IOL8/CcE7IUhIH44XVdvKR9SOCel04VQv3X90VNdv3NTVS5f19OYtPb1wUbe3btPRbj21M3lmnQyXUFciJftTYvxPjf4pQoRPpfNfpNSpiHG1P3sE7ewWV0c2VtbNW0v09JHV98PrCnjzPqfsFxCoXZf2q99P41RjXldlGFVLEXvkVep+5VVkYlOVndhcTcZ2Urcx3uo1boDmrF2sG3dva8GeNcrTv5aS9iiu5L3LKG6vQiozqplGbpiphrN7Kkq3XErXr6Lm7lyjl47CEZu0X+ltwCvrzyA9ev5c07YudbxPIkbPfGq1qI9G/DhNRYc3VIJeRZTCt4yS9SypgoPqa/n+jbp++6Zmr16gnmP6ymOMr5qP66xSk5up0OSmSt27nKL3KOB4oXatBT00aOME7f/1qAJ+fyn0q5dP9OC3y3r88KJu3Jivw+vLamfH2NqfOaJORYhv4SqVLkawGqdLHIWcvzYecwXuj4dLoJ1psuu4V2/d/mWnnlm0euyg2RXdsGh27+FenT3aUb+MTK3tpcLraLzoOhcu6fsXWjs91ulPBYgc+XVj7lz5/U8XIKhCcgSNI1ocQeJEA0eOeckrz69r07qttm37RU+fPte5M+fUu3c/lStbUQMHDrauPQ9dHRD0LlABga8dLfDtG8dnUBCE95ffi9+032IYD9/aKlYrocq2ja2WY1LKZ0FGDV2eQYPnJlbPoVHU0eMrdev2tXy6R5RPxyjyaBZNnWpHU4sKUdWoeBQ1LhJJbUtFlnfVGBrRIK5mtEqoFd1S6iefjFrtkVbTmsVX/6pR1L7YN6qX52tVy/mVquX6SjWtv5sWjaie1eJpVOt0muORQ4u9c2tJzxxa2DmTfmidWnOaJrFaPC1pE1/b+qbWhbm59WhTCb38pYzebK2mwK3t9PZAH/lfHq6Xvw3X0yeD9fLJIAU+GKSg24P1+upA3bzYW3vOdNaio/U1bl9ZjdhVQGO259D4Tdk1cX0eTVldVD9sqKUth7x04sp0bdk/QZMXemvKkkH66dAKrT+yUr2n+6ihZ0MNnTVUhy4e1PPApwq0cPhOQfJ7w7NjjzuOrXMCguOcnGyg+GAKCxQRKDRwpIsjeTzblOeecqSS5/txLddQDaaZe90FCDe4wQ1ucIMb3OAGN7jBDW5wgxvc4AY3uOF/N/hRgJg2VWey5PrzI5hsiWwa7xO4/E1qnQubQvtjx9C2cl9p19jUOrLLQ5d+3asnL/6ThH6jd7ry40btz1tCp8Ml0BUS1sEkyU2jf8d7Ib5OpVOREmh/1oja2SGWDi+rqPMHvXTl+EA9urZSAa95TKH07M1Lnbl/Sesv7tKQ7XPU+Adf1Z/tqVo/dFedGV3Ve95wzV65QMvWr9TGPdt06PIpzdy8SHVHtFeDSd3lvW6C8g1voO98Kmv61iVacXSzSk9oq5idC6v93GG6evuS3r2+qMc3V+r+9VV68/S8Tl45o2Yz+itW56KqNqOb1p3aoXEb5yqDZzmVGttSXmsnqtaELmo8uovmb1upI5fPaMveX6w5rNIPKxaorzWn2rM7q84CDzWe46228wdo7K5F2nhln87dv6IXfjzBRXr17IauX1ig0wf76vReTx1eXFa728TQ/kwUHxLpYrhUfy0MuGjg87KF+xPh4mt/0fK6un2HzHkdsraPnj/TxSs7dGhHR+0YnkzbS3ytQzEsHvjSus9R3HDRr70AkbOAbs6bJ/9X/4MFCBLOPNuPZ4XzUj6eD0wRgkf28Bw9XhhToEAh9erprbVrNmjWjDlqUL+J6tZpoCVLlunBw0eOt3u/exfoOPngF/BCfn7PFRD4yvr3Kwsxrx3twf3zWrFmrBp2zKPC9WOopk9CdZ+ZSb5zM8pjQlK17h1VTbuGU7te4dWrX3R184yppi0iq16dyGpUO6YaVYmreiVjqHbBiGpQKJxal/hGHpUia1jDOJrdKaVW+WbT3M7fqne1SGpT5HM1zP+56hWMoEYlYqhRmTiqWzyWahaOprpFY6hlpXjqWS+pBjZPpaHNkmtgvXjqVy2q+leOrOE1omhq4zha75VBZ+eV1bM9zRV4rK2C9rXU291tFXjcQ343Burpw8F6+HiQnj8cIv9bAxR4yUdvznvo2dVuunW/k048aa4tdyto+YUcWnoktVbtTa0NO7Jp045i2n+ooU6e66WDJ/tr2c895Duujlr2r6Se0zto6OpB6ja9myp0qaRqnWto+srpuvX4huM9EBQgeL8Gx8p4piCPv+KlQvybQoI5BcGRM4pJPEeOlwDx8h1ePtWgQQPHc0spOJkTEPYihCleuMENbnCDG9zgBje4wQ1ucIMb3OAGN7jBDW743wn+L1/q2ozpOv1dbp0LoQDhOKngOAnx/p0Qh2NF19aS3+jHoel16thMvQn4z6OqyAjeO3FKR6rU1slv4uvyF7F1IUpyq4/g3wXh6N/6vBQplS59nUKnwyfUvm+jaUenqNq0IKHWrMyq3Zvr6tal+Xr7mveT+Tteg/3c/7WuP7qro9fOauPp3Zq6a4kGrp+syVvma9/Zozp1+aw2HNmu+XvWqv+SsWo+pruGrJikHWcPqMuCofq+d21N3L5Clx7+pjE/LVDWXuXUaHwz7Ts8R/fPDdPJ7SV0Yntp3TkzWj/vnqGqwxsom1cVTf9lpX59+EDDfpyn7D411GfFBG0/vV+9F49Rq3E9NWTZJC3Z95O2ntijM79e0J5TBzVp8zwN+mmypu9Zri3n9uvsnSu68/SBXgX6Odby7u0bPX/8q349PUNHf6mnfRvz65cFibWtZRQdSBldZ75J5Hgnh+MF4c74c248PitSMl20cH88YgIdrdvEWs95a5T/AI/pP3ZwvDb0T6WtRcLpSIyYOveFdU94617e/xFcAeKbxI7TMmdyFdTNhfMV8N8oQPDivlKlSql8+fKOl99wIoKX+PEOiArlK6pwoeKqU7uBqlWtrSqVa2jQwKE6deq0/P0DHW/b/uO9D/4vHQUI/wCexfZSQe9e6enLW9pxaLn6TGioal3TqHKvBKo3LKWajEmjRoOTqpFvXLX2iiWvPnE0clhijRqcXD06xledGtFUpWo01akbV01qJ1TzyvHUtHQMNS0eQc1LfKX2Zb6Wd42oGts6mWb1yKThzZOqVcmvVDtvGNUp9JWalY+ndrXTqE3dDKpfObUql0issoXjqVLJ2GpQOY7a1Ykvj0YJ5d0onnzqxlLvWjE0pF5sTWqeTKu8c+rYrOq6v62T3hz0UMDedvLb0VBvDjfR8yud9OCup+7/5qunt3rrxemuemr99mBrFT04XEn3b1XTrZeVdeZFER24m0n7LloCfjypju1Pp6O7rH53l9SubVW0ZFllTZ5fQ57jy6tKr1wq2jWXyvcuraqDa6pQxxL6rkYOtRvQXvtP79XLgOcWLt8qMOB90YBHZnHKgcZz98x3vKiNl6x16tTJUXwoWrSo4yRLuXLlHI33e/ASLe6h6GAKEKb44C5AuMENbnCDG9zgBje4wQ1ucIMb3OAGN7jBDf97gQLEjVmzdDprHp37PEbwBQhH8jmFLlmfvBfgwueJtT9mJP1YJalObZkmv6D3j3E3cP/XKzrQobMOxUiqc2Ei6eI3iX7vI4QihNUuRmfXfipdCpNaJ6LF1s4Gn2n8xHiqP6qUuo6voA3r6uq3s8Pl/2if3r39z/s1/AMCtf7YL2q7fJDK/9BVNeb11KBtczRh31L1/XmqRmycrR4LR6jG6A7qPLu/5m9bod4LR6vWqO6atmWdHj59pQMndsljYjV5TvxOC1ZU1qoVZbVsXmrtWp1VF3Y10uo1NdR+eBZ1GFtbB04f0N2HzzVm7TJVH9FFA5ZM0NzNS9Vhel/VGtNZPReP0oif56j/5hkav2+5+m6aoao/eKjS/O7quGqEtp478PvMgXcK9Huq+7e26dzh/jqyvYmO7+mik4c6aefSlNpSNawOR4itixZOOJnwoZMP74tF1udXCXQ+TGQdjp9SR3p46dH167+P9x5e+73U0fWj9FPZBDoQPbLOh01i0Ta168KDab8XIM45ChCFdGvRwv/ZAgTAy1d4lE+zZs30/fffq3jx4ho6dKj27tunA/sPaMjgYSpSuIS+TZNJObLlUaeO3bR9207HeyHevg2yWuAfBYjAgNcK8H9p/f1CbwNf6sXz+zpwfLMGT++gOr7ZVHNAMjUYnUqV+idRse5xVLZ7XDXtk0yDRqXV3ImZtXx0Fk3vlVa9asdXw1IxVbNiHNXib6u1qp5Q7SvHU9vy0dSqTHi1LPWVOlWIKN8G8TWgRXJ1qh5L1fOHVaV8YVW3TEy1rZ9OHZvlULN636lKhW+tdSVT4SKJVLRobJUtEV016KduXHm3Sq6hHb7ViLapNaplck1snVqLembXjjFldGFxfd37qbme/lhbvIj6ycaienS4hiWQ7fXojpdeXPXW072tdXtZKV2dn0M3f8qmO6dz6vbd73XtYWZdvZdKN68k0Z3jiXRtZxKd35hcR9ak0Zo5aTRqeGr1HZlDXcYUUHmvzPq2aUIlrJNAaVtmVsbmOZS8QlqVb11RizYs0v0nd2FrRwHCP+D9iQXz6KQAS1gpRHAqgrf6N2/eXHnz5nU8dmnAgAGON/PzyKa6des63h2xdOlSx3sjKDaY0w/uwoMb3OAGN7jBDW5wgxvc4AY3uMENbnCDG9zwvx8CXr3SzdmzdTZbXp37jAJEYl2IHkwBgkZyO1pKXfoykU5+GV978hXW5Q1rZH9lOpnB+7/d05FZs3S4bFWdipVKZ7+IpwvhEuhi5GQhFiEcj2LiEUORkujM91G1ukcC1R9bWzF9xiuVl4/ajK6kZcvK6sReDz2+vlpvX17Qu7eP9ezFU836ZbWKTmuvaMMq6Auvwko+vKYyT2is7GObqNGcPqo6zVPp+9RRZs8aKje0hVpN7CLv6T01b+1oXTm7VuePTtXcBRXlMyG9Wo4prKbDymjI5CLas7GOrh3pqb1bG2ve/NxavLS2Th6ZqSNHl2v84iHqNL6r6o/poNKDmimbV21lGdBAVWd4qc4sX2Ud3UgZxzVSoqHVFda7qOKNqa5yczy0aP8mvXr5XAFvftOLRyd089IyndzXTQe31Nap/Z66fWO37j88p3OHvbTHK4n2Z4isM98kfl/8ccLZnxq4tXB8/qsEOvtlXJ2Nm1bHKtXW8QUL9ejB/fcE+h38A/x1YfkS7c2RR6e/iKtLXyd+/04JV/2aZitAnM1dWLcXLVLAa9cvP//XChAkoG/cuGExwjI1btxYWbNmVbFixTR0yBD9sv0X/fTjRnn08FKxoqVVq0Y9LVy4xGLIh++LD4FvrcaLjP30NuiN9flGb/yfy8//mfz9nunixWOaOLuf6vTIpSq+idVoXErVHJZcBbrEUJEO0dWoT0r1GZVNU8d+ryXDcmmZVw5NapJavcrEVfNisVS3bDxVrxxXtSrHUdPK8dXWaq0qxlKzMlHUsHg4NSoVQW2qxFCbmnFUp1RElc79mSoWiajmdVKre9s8atfse1WrmFoFCyXQ93njKke+uMqZN5py5QynArm+UJXiEdWxflIN75JVE3tk1/gO6TW2RVJNb59Cq3tn1r6JBXRhQTHdmJNTtyam1L3ZafRgSwk9Od9OL+4MkN/VIXq2q5NFuPK6MS+X7m3MoQcnsurer+l1+3pyPbySUC9OxNXz7TH025rIurosqk4vjauf5yTWuOEJ1KV3ItXyTqK8nRIqYaPo+qZKeEWuHktxaiZX3DLJlat2fg2fPkJXb10Wj7l6X+yxWtB/3vdAAeLy5cuOx2jVrFnT8d6O0qVLa4hFvyNHjujJ48eO0yzdunVznHIZOHCgrly54qD9+wJGgOPTDW5wgxvc4AY3uMENbnCDG9zgBje4wQ1ucMP/bgh89VI358zWmRz5dfazmDr/wQJESscphYtfxtfpcIl1tHQN3dm201F0MPAuKEhPXjzX5QvndXHZKp1t2EbH46fTGR7FFC7++yKEq755B0REq/9vkuts2pja2ymSPEcXUrIBwxXGc43C9lykhN5DVWFwMw2dVUZb1pXRlUOd9fjqIr24f1KXrp3SzL0rVGZ2F0XrU1oJB1VU0kGVFbFbfsXrVlRxehRXpI55FaV1TqXukV+NR1XViBnVNGFOQW1YWcxq5TRgaiUVH9RKCbyG6tteHuoxvrrjPRcv72/Xg3sHdfHERJ3e3V7Ht9fW6pXFNWx6AflMrKiKg8opcZc8itY2j8J3zq+Y1lgxOxdRhC75lWhwZcUaWFHR+5dXzUW+mn/oR52/dkb3bh7R9fNzdHpPGx3aUklHdzXTpdMz9Mhai3/AKwUGSQ9+26+TP9fS3jaRdShpdJ37Ovl7HLnCn9UcuP06voXrWDqROJMutOyiy2vW69dLF/X05Ys/bRwnh3vrp006VriiznyVUBe/TmjR/sMFiPPfJNbZz2PpdJ4iurV48b9TgLBPNLjd7rw7gMf3sIM+V65cjiKEj4+v1qxZp9Wr12r8+ImaP2+Bzp+/oMCAtwp6G+TYke8oQAT5Keidn974v7CY9Tfdf3pT126e1dJVM9TCo6wqd0mqBiMSqv6YxCrnFVtlusdUs4Ep1W9sVo0Zmk3jemTS5FaZNblBZg2tkkK9SsVT65KxVK90HFUvE091yydU8ypJ1aZKEjUvH1cNSkRV9cLhVK1oONUtG0n1K0RTlWLfqEyBL1W7Ujx1aZNL3TsVVt0a6VQoX2xl+y6KsmSLphy5YyhX3qjK+f03yv1dWBXP+bXql4ol32YZNckjj2Z6ZNfE1kk0rll0zesaS1uHp9Dp6el0yZr3r32j6+6YZHq2sbzeXPJU4N1xCrg2Qa8P9NXTH1vp6cZaenGgsl5eLqmnN3Lr8a8Z9fJEMvltiqnnC8Pr7uwvdX1BRP26OqmOrc+mpQuyycPqv2yP2MrQOppiN4qsr6tH0FeVoipCuTiKUSKJMlXMIa8RPjp76axFIYuDLdq9DQhUoH+Ahfv3dUoep3TgwAG1bt1G3377rQoUKKDhw4Y73g9BcQG4evVXi5beKlSokLp3764zZ844vre/C4K/3eAGN7jBDW5wgxvc4AY3uMENbnCDG9zgBjf87wUKEDc+sgBBO/9FHJ2KkUInWnbSgxOnfu/tPQS9fatnL1/ozrOnevjoke79skfnO/fU8bQ5dOqLWLrweWxdjJhUF23JbsfJh0j0m0rnEsbRwXoRNXFcOuUZ01VhvZcojPe6963nakXuNVE5+rZTg+HlNGRaGa1c1UhH9/bWgwvTdO3kBC34sYu6z68j32Ut1HluAxXtn1M5eiVTbs+4KuYVUxV846jWkGTynpxNw6fmUpcxWdViRD7VHlZdeQb0UjTvuQrT42fF7jVaXSfW1an9faU37x9fFPDyrp7e2qCrJwdq17YGWrG6rOYvLiavqTlUcWAyFfCIrcxdoyl155hK1TmxcvtkV7Pp9dR2XmO1nVVbM9Z21dmjE3X73FSdtfo9ur2djv7SVGcPeujmlaV6/oIn1/wH/ANf68bdRTqwJK92VA2vozFi68JXqXTJwtWfaGLR7FLEJLrwWSyd/DK2TmTMpQs9e+v+noN6+PiJbj99qmcWre05W/L6vx06ohMNW+pU5KS68GW8//QZXPu9AHHm81g6laeIbv4bBQgmaXbLm7/tYHa/Oxbw22/66aefHC+kJlnNewR8fX21ddsmnT13UrduX9fz50/lz3sHSFwH+ivwrdWC/PQq8LnuPLmh83dO6MilnVq6aYY696uvKm0zqvGglGo+MaFqDIqqqj7R1WlMKo2cnV3jx2bV8K6pNKBOUvWvZH1WSCOfCknVo2JCtS4fV/VLx1PdMknUokpada6dUT1qp1enKknVtGR0VSnwlcoXCKuqxcOrTtnIql0ygnVtNLVr9K08OhdQy2Y5Vap4IuX9PobyZIupArnjqmSx+KpYNp4ql4ujSiViqUKhGKqSP7qalk2oQa2yaLZXbs3oklpjm0XRzPaRtXlIEp2emk6XRqXQ9QHJ9XhqPvnvbq13N4Yr6N4UBfw6Qf5Hhihgfx+9PeGjoKs9FPiwtfwe19abW2XlfzSX/Fan0NM5sXRvXkxdW55U59d/r/0/ldW85SXUcUxmFewWV0maRFLE2hEUrmoUha8YW5FKxlW0/AmUoWx29Rrqq1PnzigowKJbgEXDV356++q1gvxeW8QNkL//Kx05clCtWrVUunRpVbNGDW3dssX63s9B16fPHmvTlo1q0qyxChUupH59+/1xAgKaU3wwRQjn4hT/dm5ucIMb3OAGN7jBDW5wgxvc4AY3uMENbnCDG/47YAoQp3Lk15nPeAn1BwoQUd8nvnlfxKnE6XR6yEg9vHP3997eA/niJ0+f6u5vv+mNv7/IFv926pTO+vTVsUy5dSp8PJ37Op4uREjiOPXgOFUROdX7F1xHTKxjxaNo6bAEqjq2saL4zlYYz9UK47NMYXyXvP/0WqkwvZYoYq/JyuDbXbWGVFfvKaX1w4Iy2rCiotavrqG1G5po+9auWrW2tQZOL6keU7LJc2Iy9R8fV0MmJVO/ad/Je3JBtR5bRUUGdVAin8H6utcMfea5WGG811pjbFBC6zuPSbV0cp+33r34zwucg4Le6s3rx3r64ITuXl6si0d6ac+Oulq5rphm/ZBeo6cmtsZMrQGzcmnC/IrasqmTDu/pqR1bWuiX9XV06OfaOrWzoU7tbqvT+wfq5pUf9eL5bb0NDPx9hD/Dszd3debUcO0Yl1J7cke08Jfo/WOqorwvBjnoEiGxzn0V1/otgY5ly69zAwbr4cWLjpdbv3zzRnfu3tPTZ88cp1MMkJm9f+26Tvn018nY74tKf6a1i/Y/UYCgwGDeF8AnyWZ7EYLvTWKZ73knxM6dOx2Fh8JFiqhKtUqav3CGxYAkrd9Y177R24A3CvT3c/Tl/zZAr4Ne6/bzWzr46179fGq15v8yUW2H1lTJlulVtVcatZrwreqPiqlag8Kr48SEGr3wO02e8Z1G906l4S2SaljtlBpY7Vt5V0ylrpWTqGP1JGpeNZHql0+sJhW/VYeaWeTVILuGNPleQxtmlkfVxKpXOJzK5Ayj8vnCqk7xr9W8fGR1rZdUPu1yqEPLHKpYIYUK5Y+nMoVSqFqxtKpXLq1a10ur7m3SyaN9OnVvnUmt62ZU9WIJVT5XFLWqnEDjumfVLK/Mmtg2vqa3jatNAzLo1KR8ujKpkO5MKafXa1rr3ckh0p1JCrw9Rq/PDtDrg94KPNpPujpSejRKQa/6K/B5dwXcaqGAo1Xl/1NB+a3LoefbcurKloLatry0pkwrq/ZD86lgl2RK3CiSItX6Rl9XiaRvysVS1NIJFaNAAsXIEV/flcmtPmOG6sT5c3r1+KX8HzzX24fPFWQx39tXVvOz/v32hW7f+VXjxo1UsSKFVLVKZa1ft85RKHr2/JF27dmibj076vs82VW2XFnNmzdPDx48cNAbgP6couAl1vCHHZyLD4ZP3OAGN7jBDW5wgxvc4AY3uMENbnCDG9zgBjf8z0Mg74D4Ya5O5yigM6F4B8TFqCkdLzg+81lUnUr7na4sWKznfm9+7+09kBN+9vSpY3O63+9PVPF/G6gnFy7q4vjJOlSopI58E1tnw8TQxQhJdCk6j11KrXNhU+h85mja3COmuk0qpaRDxjoevRTGe7nC+C7+vVGEWKkwXtb3nisU1nO2YnkOVyovL+Xt20lVRrRRk4lt1X5KW3Wf1l5dJrVQi9H1VH9ULdUdU0t1xtRX1VGtVGRId2Xp30/J+45WdN9Z+tzL6tdzlTWW1XwYc60S+w6Ux6SaOrnPS0HP3z8B5k9grfOd30P5PTurJ/f26M7VNbp+doounxis04f76uj+vjpxYJB+PTZWt09P1K1T43T91ERdPTNLty6v1oM7u/X04Rn5vXn6p1MPzvDW+vX+sxM6vru5dnWLpUNpIlu4Sq6LEVPrEsUbi2ZnwsTUkfBxdbh4OV2eNkNPLl36Izf7+s0b/XbvNz1//vwv+dhnL1/qknX9ySTpdDasRQ8KQi7o/kdzFCAS6cznMXU6b1HdXrJEga//8zJwO3xSAYIJmqIDnySZeQHxvXv3HC8uthci+Nv8+8mTJ9q0aZPjcT2t27TQ4iWzdP8BBQg/60J/BQUG6G3A+/cHBLx7q8d+T3Tk2iGtPbxY83aPU78FbVW2QwYVb5NQTYalU5NRyVW9X2Q1Hh5NvnPTaOTcjBo+LLmGdI6vUc0Sa3zjVBreMI08aiVXs8oJVKtiXFUqE1uVSsZX7dIp1KxiWnWumUlDmubQ1I75NL7dd+peI45qFgirirnCqFaBz9WuYnT5Nk0v79Y5VLdychXME01lCiVU66o55NkgvwY0z6VxHjk1Z0huzRmRV1OGFNSgHvnVrFpqFc0aXuXyhpdny1SaMSCn5vbOrvm9suvnoUV1fFpVXZ5XX/dWtZU/x3cujVDQr3314ngb3d5cTb9Z7c3R1tL13tLdgQq47qMXp9vp4e7aeripjJ7/XFiBewrK/0xxXT9eSmvXlpL32MKq6JVFmTsmU+J2sRWndTTFbBRDMavEUpxSCRQrTzxFyRRTOSrl19C5E3TkwildOnlGV/Yf09ML1xT0+LHevX6qwDePLCK/UEDgcx0+vEc9u3dVhXJl5enRUyuWL9XSZQvUpVs75cqfTd/nzS6f3j46cfy4gx9eW4wGD/BpTkDY+QGwFx5Mc4Mb3OAGN7jBDW5wgxvc4AY3uMENbnCDG9zw34G3r1/p9rx5OvN9aAsQKXQpUjKd+Cy6juYooNtbtirAKX1Ozu/FixeOR/STKzTA94/v3tHF2bN1vEJ1HY+dUmc/j6lLYePr8tfJdC5JXB1sFlHDx2VXjhG99WXv5Qrjvfr3wsMiWxHCNE5FrFEYr7X6rMdKfd5jgcJ7TVfM3uMU33uIEnj2VTIvX6X26a8UvsOUuK/1/YAZitpnvr7otVSfeazSZ55r34/hs0Jhei+1Gv1a43qtUWKfDxQg/oB3ehf0ToH+QXrn/9Rqt/X2xUW9fnhML347ole/HdfL+9bfj07ozfPLeuv/zFG84L737cMQEOSn23c36NCaEtpdP7yOxYmli18mt3AXz6JbdB2Pm1rHq9TSxQUL9fS3+3/Ku758+dJBCz6d87E88+bGmjU6nD67ToWNZdE2uUu6/9FsBYiz+YrqztKlDh5yBX+rAEFymZ3uVE1OnDihDRs2aNu2bbp+/fqfdr2TgKZIwUuN165dq5kzZ2rlquU6fdJC/PMHUqC1RE5Q8A6IgHdWn0EWMgN0/eFV/XRotRbvmKzpG/uo2/jKqtkjnZr1TqP2Q9OoTq/YqtUrploNS6pu49LKY2gq9fZOoqGdE2l86wSa0DyhBjVKqHY146ly2RgqUCSScuePqAJ5o6pEnhgqWzCOqpVMpHa10mpkpzya41tQ4zqnV8fKUVQ772eqkS+sWpaPo67106tVrXSqUCiWSnwfQY1LJdLAJjk0vWMeze+WTWsHZNO2yXm1fVZRrZtcXNP655VHk1SqkD+8iuX4XM1rxNaE/jm1eEwJLR1eWj+OraRDP9TTxdVNdXdrW7050VU631EBh2rozqocOjk9ia6s/FavjhWVLtbVu6ON9GJ9dd2eVVhXpmTR1Xnp9GBjBr0+kkl+VzLp7q9ZtetgDo237m07M7uqT/1epaZmVoHxKZVrUAJl6RxH6RsmUNJScRQ7VzTlb5hPY9ZM0L5L+7V72ybtXr5Gtw6eUOCjxxYdnls0eKKgd9anXuvpk/tau3qlWrdopWqVq6pp48aqX7+uChTOp0JF86mbRxdt275Vdy2lccOi+65du7Rjxw5du3bNcQICXnFmaPOdvbnBDW5wgxvc4AY3uMENbnCDG9zgBje4wQ1u+O/AfwoQBUP1CKaLUZLr8jeJdfSreDpQqqp+O3z0957+DK9evXIkvSlE2HOAQdbfr5480a2NG3W6UQudjJ9W5z+Lp0ux4+hE9UiaMyy5yo5pqQi+896fcuDEw18KD/a21GrL3hcQOCnhvVSf0bwWW22hPrdaWO/F+sJ7ifW5TJ9b133We7XC9Oakw0rrXpp1r6OYwViLrO8/tgDhDNZ63wVZiw2Q/5v3m7bfvLbwEBTo+B5svPbz14tXrx358NDCm4AHunxpjPZOzaD9JcPrdMQ4Oh82vk4mTqdTzdro5qYtevX8mQPHBsA9OXxOo9iLQQa48vaO3dpXoLSOfx1PVyzauqL7H+1PBYhiurPsXyhAmJMNNJhozZo1jnc8tG3bVrNnz9bFixcdRQcDnJBYvny5PDw8NHnyZJ05c1ovnj3VWwoPbwIV9Pqt3vm907uA93R5+vKJDp/bp8WbpmvB5uGauKqTOg8rpM5DsshzVEa1802sOh2iq2GPBGrV71u16Z9WnXunk693Wo3olkwT2sfX2Jax5Vk3mmqXi6CChb9RtgJWyx9ZefJGVr6cEZU7ZyTlyRdNZcvEU6dm6TXBJ59m98mlwc2SqlnRb1Qz3zeqXya+GlVJo1rlkqtywZiqUyCyPCrG1aTmqbWsc2qt75FEv/RPpuNTs+nMwqLaP6eYlo/8XiO6JFXzyuFVvmAY1SkfXgO6p9XckYU1f2RJLR9XVnsW19blTQ11f1ddvT5aQ+9OldWLrVl1aVJ0HR3+ha6tiiG/kxkVdCS3Xq7IrjtDUuvXXgl1dWgC3VmaUo8PpNWLC8n18nosPbwVU+euJ9GPpzJrwu488txaUG0351KzjRnUaFVq1Z6ZSlUGp1WRjimVvV5CVeyRTxM2DdL+q9t1+OBWHflpo24fOanAx48sbfNCQYFPFPD2mQLfvbZo/VY3b1zXgnkL1b51B1WrXF2VKlZWvYb1NHBwP23dtllXfr2sI0cOafr06Wrfvr169eqlrVu3OhSLKzBFB3tzgxvc4AY3uMENbnCDG9zgBje4wQ1ucIMb3PDfgT8KEDkLOpLKIRYgHO9qSKZLX8XXsejJdKRZWz26fPX3nv4MJLtJejs/NQcgI+j38oV+275T59v56HiG3DqRJ4p+7h1dLSZWVuy+UxTGiwIBhQFXRQcXjZMLnGCgeMB9FBcc7fdCg6NRpLBab+vvvmusttb622p9rL978/0/VYD4D9x5+EjrD2/TznOH9Cbw/eOobj2+rw3Htujno5v18NlDx3ehAUoXj5+f18mDXbTTK6b2Zoqio5nz62LXfrq3Z6/evHjuwK0dwD1PJ3I8DsuWs7fDbydP61DtxjoZJakufxn/j/dyuOYBWwEiPwWIZXr75q+FDeCTCxCmMXkmvnLlSjVu3Fj58uVT1apVNWbMGO3fv19Pnz51nJI4deqUevToodKlS2vkyJG6c/uu40jKu7c8YyxIQa8stLB2ChBvg3T91hWt3bJQM5YP0ez1vho5v4E6DMoqj+Fp1Wt4SrXqGUuNOsdQ0x4J1MIzhTr0/lbe/bJoYO9MGt4jpUa2j6/eDaKpeflwqlD8K5UoFVklysdWmUoJVK5cfJUoFlN5CkZT1kIxlKtkDFWtFV+eHTNomk8uTeiQQR3LxlKtAlFVtWRCVauQSrUrpFHzCsnlWS2RxjaMrwVt4mp1pyj6sePX2tYzgo4OT6YLs3LrzA+F9MukbFo2JLlGdY+uzvW/VMuqYeXTOpYm90mvmQOzadGInNq9uJR+3VhW938upFe78yjwUFbdW5NIJ4aH1ZnxYfVwU2z5HUyhp9Z3t8ZE16+eEXWtbwzdmZVSd7dl1Z0z2fXgaio9vR1Vz+5HtJg4sY7ezaG1lwtr8pkCGnwqq/oe/1Z9Dnyr3lszyXvV9+o+63t1GJ9VXScX1OSfOmvv+VW69usR3Tt/Ts+u3dDbF0/0NuCp3vg/1MuAR3r99pXF0EEKCAjUr5eva9WyNRoxeJRGDB+tRUuWaMfundp/4IDWrl2tAQP6O+ieJUsWx0vGx40b5zgJ46q4YOcf09zgBje4wQ1ucIMb3OAGN7jBDW5wgxvc4AY3/HfAUYCYP19nchUKVQHiQsSkuvB5LB1Lmk4nBw7S4yePSevq9dtA+b8jo/geePfD/QcP9OTx4z89MccOgf7+urv3uM74NtK2jjHUb1ROpR82SJ/3Mo9E+tDpB1eNe1w0x+OVlunL7tMVoc1QRewyXhG85iqi1cJ7z39fdKAw4RjznytAnL9+SR3m+6jFAk8duH5aj1891w+H1qjmzA7qs2aErj288fuVoYOAoEDdub9DB1eU0vb2cXTIp5XuHjyjtwH+fyk+AOD+0cNHuv/woQwVoJFfUJBFs7cO2j24c1vHvbx0IkEaXQxj8UBoCxAFiuvO8uX/TgGC4gOTp4J1+PBhR9GhVq1ajiJE2bJl1bt3b8dO+LNnz2rBggWqU6e24/fFixbp6RNedmEx91sLYa+tvqzmeNiUtdpAvzc6fnKPJs8ZqOHTO2nUgpbynlpWzfulUrO+cdV6YGy16BtTzbxjqFnP6OrkHVd9B6bQ0AFpNcw7jYZ0TS7vZvHUuFxEVS78lWqWi6aWDZOrQ+sM6tw2o9q3TKfGDVKqYvXkKlotuQpVS6QyNeOqaePEGtQhk0a2zqKuFROrduHYqlQ6kWpVT6+2TbKrb8tsmtY+k5Z2T6U1HnG1tuvXWtchjH7q8IV+6RVHh4dn1InJOXV4ambtmUl/K6cAAP/0SURBVJ5am6ck1bz+sTWizTca3jqSpnvE13zfJFo1JLkOz82ia4u/0935afXyxwx6tT2dri6KraOjw+ragkh6uTWxnqxOqF/HRNHp/hF1blQcXZyfTqd+zK/dv5TULwdL6eDZvLp8I43u3EupS7dyaefFMlp6qqxmnC+sSVeya9z5dBp3Ip2mHsquOfvyauGuglq8taBmLi+gmQtqaPOmUbp58aD8H99X0KunCvB7oicvbuvOk6v6zfp8FvhMb4L8FWAR6s2rQN26/ptOHjmrwweP68ChI/rxp581atQY1avXQAULFrJaQRUoUECFChVSu3bt9Msvv/zl+W7/rxYbjDxQbLO/gD0ksF8f3D18F9r+PhZM3/9E/6Yv1kT7lP7M/aG5l2s+Ft/OYO/jU+f8IXCe5z8xzt/t034/n6EB5/EMOM/lY1toxnfuPzT3AMHN7UO4cr6e9jFjfsp9gH2uobnPeawPrcuAM04+Zo6fAs7zdNU+Zg6h6S+45jyOq77+LQgtHkJLR8BOyw/dy2/262mhGSs08w6uMZ7zvJznEFz70HoMmHWZfs095nvnfkPTzH0fAldjhGbOnwL0ax/HVWMuoYW/i59/CpzXRd9/F4f2tfH5sX3a5xSatTqPZx/LfP+pLTTj28dwHj8ksK8ztPfzu/N4poUG7Pea+0MDznMNzRrtY/F3aPHyqff9m+C8/uBaaPAZ2r5of2f93GcfKzR98bvBP58fO759PPIT5l57vzTnPu33hXZMe3+hvcfVPEJzH/Ap4wH2+8y9/xY4j+WqhXbeQGj6c27mno8F5mXv40Pz5Hf7/Pg7NOB8z8fgIzgw/Zn2oT7tcwjN9XYw9yBfdhkLDuzjfMx6uc753o8F+vg38P3/FyB5fHvRIp3JU8TxDojzIRQgLnICImJSxwuPD6bJoqPDhunexfN6ePWqbhw+orsnTurZjRsKfP1Kr/38dO/+fT0KoQABvHh0Wee3ttPUSZlUYFA7fc0JBMd7H3i0kqsCwye2PlZ//VcqfPuRSlSpvr6t2VjZ23ZQ0a7tlb9LNyXwGKPPfazreO8Ej2X6hwoQ1+7fUMN53ZVyaGn5bJyozWf2qO78Hko8qJh8fhqru8/u/35l6MHP/6WunJmsfSvz6+imbnpwn3ctuwbe1fvw4SMHLfyQZ4s2T69d153jx3Xz6DE9vH5dt8+c1uE+fXUoaXqdtXiAF1FDa1c88EcBwrruTKGSurNqpcVDrk9WfFIBAkCAYRreA8Gz/nnE0rFjx/TDDz84HsNUtGhRlShRQh06dNDAgQPVvHlzxw754cOHOd4XwfOtAoLeye/tO/kHWArC31IsAVYLDNDLF/e1bccy+Q5ppk4DKqnb2DJqOSK7qvVOoBr9Y6jpmHhqNjquGg+Iqvb9I2rwsBiaPDy+JvdLoHE9E2tAhyRqUSOmSub9SqULRFDb2kk1rFt2TfbNq6l982psn1zq0zOH2nfIpiZtcqhO6yyq2jiF6tRJqE71U8q7zrfqUD6x6haPp5qVkqpl8+/Uz6OgpvsW1Or+ebRpSBb9NCiZ1vpE1ZrukbS+cxyt75RCP3mk1+Y+6bVjaEodnJJcZxd+qxNz02vL4ERa3CmaVnaJri2+sbVvSExdnJJA1ycn0M2JifRiZXo9W5dGV2bH1NmpkfRgTVw9XZlA18ZG0+n+0XVsTCodWFJQP66vqCkra6j3wnryWt5Uo7c10qoTlbXtbDmt3l9H4zY0Ue81tdVneyWNPFlK0y8W1YKLBbX+UiHtulxAh8/m1qH932vDgoyaMziblo5uqFPbl+jNk1sWRd/old8DXbh1Qgcu7NapW6f02+sHevHutaNyaZFZAW+C9PTRK504ekZz5sxXly49VKZMOaVJk9Zq36pu3brq06ePWrRo4aD1hAkTdPPmzfcM8zv8v6j4EeBDhw5p9OjRGjJkiIYOHep43NhjS7EGB7ywfc6cORo0aJBGjBih1atX69GjR7//+v6lMHv27NHEiRMdfc6aNUunT592GNC/Czwai/nSJ33TmMvJkyc/un/oefv2bS1dutTRD6ebeBfM3bt3Q01rHALeHUIBc/78+Y73h4R074MHD7R582ZNmjTJMSb4Q+9QBEUffQjA7d69ex2PikMB0ge0W7JkiS5cuPD7VX8frly54njnDTSEJ8xcwTXFOU6OfQzwnL4DBw44TptNnTrV0R/9ctpo8eLFjhNn6OGQgD5+/vlnxzzM/du3bw+R7mfOnNGoUaMc1zMW73hB56P/oRs0Hzx4sOP3j2njx4/Xzp07//SoPmfgFJVZq2nQ+kM8wm/ICzoIGTP3Dh8+XD/99JMD9873gxvk0D4WbcqUKQ68s+aQALlyvp/xuTckB4t5sE54HzwyX9Z86dKl36/4K4CzjRs3/oF3eBneDQknAOOwHvscweevv/76+xX/LCCrq1at+kPOXDVownrhy1u3sEXBA+uG57jHVV8hNeYAzgwdKY7Df/QFHpEF5uDqOZh/Fxhz3759Dh0XkqwgX+ghToyGpMvgp3Pnzjkee8h9yDM2B73rDOCM/vjd2Cga+MAGIP/OdtoOvLsLnrHLUWgbusHYNnTM0aNH/yKTwTV0DnzNe8Vc2VL641GfvFMMHxMcLFu27A8csCbw8ynzNn1hp10BuuLgwYMO3rbrp7Fjx2qRFaxBa3j/nwL0OngMSY74jbnA4yHRE4An8C/A8cfqbuTkxx9//KA+/BAgZ0eOHHHgC7kw/YND/Al45WNlkXXDz/SJLNGfwQu2GFvGs4eDA/TnDStARhdzL7zDI2ND8gvw/zZt2uTgQe6BZ8+fP+/oCz7BNpu1fUwDz/gK8HhwiRdkAF5Drg0dkTnow+nzkAD64UfZ6c96kXX8Q1d4unr1qmbMmPHHWmnIChvM8Hc+BOB22rRpf9xLw/7Qb0i2C13InKCpme+KFSscjw4IDu7cuePQDWaOPCb4QzIJnsEn15v5GXxCy/8WQEv8FjOnkBq8AP8HZ0Poi/W4ute5Gf+S/pDH0MYH6GvwCI2QH9OfsW/oTnu8YwdoxPzQCfAZshscPzoDfoyhOXyCLMKX2ATk39h67AL+oQF8ty1btjjozu/oDDZPhuS3YX+NLWNd6J2Q5si68PuZHzxl8Escs27dOoecBycD8CVrQ1a4j/khc/jBHwJ0Eb62oQFjQgNXvsLfAXiNHJB9LFcN/b5w4cJQ6Xf0udHFH9PgG/QY/m5oAX6EX8EPfRC3IUMhATGnoSW8BR1D0hPQC95GJowt5z78MPiNWPpjAVuO32r6oyE7IcVW6AD41e4PQhMepx4SINfr16934Ag56du3r8O+BecnAfAENDd6m/XiN31oLGQSnLAuZAw8m9gztIC+Qv7nzp3rGJu+0GUfijPc8B9wFCAsfXEmT1Gd/lABImpKxwuoT38VXzuTZda2eo11zqu3fu3uqXMt2+pC6/a67Omj23Pm6dahw7p284YeWvISnF0JCnilZ7fn6ectlVVnXC1F8ZkkXijtOK3gqojwdxp99lulrzpPUvzKjZSnRH61qfudxnVIq9Ed0qtl57JK79FfX3hz7TqF8Vmn4AoQ6PEg1hRyOO6AF36vNGTbLCUZWloFJzSS78qxyja8mjKOqqo1p7eH6Bf9AW/fF9kMcMvTpxd0/nQfHT3QUNeuLFCAv2u5CbBs3ENLH1y7fk23DxzUrVlzdbmnt863am+1dvrVw0unLRpurVFPuxOm15mv4jleNE5zxQOmAHH68xg6U7iU7lpxS2Awegh5/KQCBABiTGPxKDsSOxjZ/v37q3r16o5CBCcicuXKpVatWmnXrt2WYnnlON7x0mrPgwIdCe63gX5699aa5LsXlpK7pBVrx6tF1xKq0ek71e+XVTUGpVbFIQlUd1oyNZ2XUg2nxFeL0VHVf0IUzZoYTQuHRdE8r8ia1jW2ejeNo2olIihf9i9UuXhM9W6eQT/45NW6wYW0cUwRrRxbWNOG5dewPvnVz7uIevYsqJbtrHHqplDjqknUsnxiNS0ZV/XLxFXzesnl3S2rJg8sqCXDC2rDiDzaMDKrVgxLo0V9k2qJdxot7ZFdc1rn0ORGGTS1SRIt6BBTm/rH0ukpKXVzXjZdnfKdDvVOqgM9Yutcnxi6OTiSHo2JrN9GRtXdcQn0anl6PV+UTLenRNOduTH1cHl83ZwRS2eGxtKhMem19Yfymrmirbov9FDFiZ7KObyfcowZrdJzx6jt2r7yWtdLHeb1VbWxA1VqpKeqzOysNuvbafC+5pp3uo62X6ug83eL6tavuXRld2btnZpSy7sl1vxOOfXj5B66cHqbXgY+0KOAO9p1bqvmb5mjDYfX69en1/Rcr63f/OXnH6S3/paR/u2Zli1erdq16it//sIWfUtY9M2v3LnzqHv37g7jhOEuV66coxCBkSNAMxAqYfo/BiQHcFyTJUumuHHjOhqPGjt+/PjvV/wZwAFJtNy5cytOnDhKnDixQzZMEhDnAGe5fv36SpQokaO/tGnTWnza01G8Cy4YDQ1g9Elgt2zZ0tGnmW+mTJkc72chif0xBp5kPk4xMk4/CRIkcBQdOfUUGsDJABeNGjVy3Fu+fHnt3r3bJZ/wHckwAuDKlSsrSZIkDvzFixfPMX/eP4KDEpIDiKOEkwlvpkmT5o/1M3bOnDkdBTQc49AUMlwBc8SxRwfiNJUsWVJJkyb9YxzmmiFDBtWrV88RWBEE2eXDFRAEkYzGQaS4yyPOUqRI8Uef8A+8BE1xZLk2ODnjN65jveb+zp07B1u4gNfAt+Ht1KlTO5xP6Ebz9vZWwoQJHXQw/YW2wX/IDSfoXAF8SPBhpxONtZJkC0kOuJcgkzHsc2Ou0B6n2Pl+eLZChQp/Gov23XffOQKGDyUgCEbKlCnzp3vhUWxhcIEAAP1ZT+HChR1zpcHPBJjB8QbJlWbNmv1xPXaWPkJKEICTefPm6dtvv/3THHPkyOEoGv7TAA+CkypVqjj43j6mvfFbqlSpHEVrAnnkLzieYN1eXl4OOrrqK6QWP358devW7Y++CfbQqYZ/kQn+HVJS61MBv2jAgAEOuWUsV/OjMRd0KfMg4cR6XSVBkD1kI2PGjI77WFuDBg0cRWQDRhdBWx5/iX4zcm/mAC/UrFnTEbBSKEOf2wEZQV/yaMWQ5h1cY17oG2wbfZPwRoeEpi/mmj59etWuXdsR5DoHrCR7SKSwrtixYzvuYROEwQEJpWzZsn3SvOHJhg0b/ilJBRhdzHzMRpvkyZP/cR+6GF+XNZP8CqmIGFqAjsgE/nRo5AjbSGKB5H5wSWj4ghPK6PWPxQ807dSpk4MHPwXQheAFP6Rjx476/vvv/2SPjAxgl0hUIKfB2TMDyDRJShId8AB9Gt/J4KVUqVIO3YFvFZy9M8UETvFyL7jBXqM3g0tGwpdt2rRx8CDXY5+NfWKdzjbhY1rx4sUd8wlOr5NIAU9Gh3EP9MG/IKkfEoBXfCY7/fk7c+bMDn3gvEGC9VOUQxcYeaOB34oVKzp8/ZAAuoNHZ3uOvKDrQqIxyUESV3bdQYxh13fOgC+I7eZa8INMkuQNCZCLrl27/knOwCe++IeKev8mUABj/mZOITVkCZ2IzicJ6Zzkxc9p2rSpy3tdNXQa/cFn+OohJdmRHxLzxATMFzmyx0X4Q8g2uhNecMWjyAw0wFbCZ9g4kpfYwg8B/GniGu6tVKmSI6ZBN/D0BegK/+TPn99RkDeAfUIWoDW/cx1xTHAFK+SR4qDxL9Ev2HdXvgO6CT6l8ICNTpcunWMcgxPWiW7q16+fg16u+sB3I7lt4iwaa2MjVUiAjsangv/NfTTsFvb+nwTmTfEhZcqUfxrLuTEXw08U1SkSuIq30DfYcJ6s4KqfkBq0ZwxiydACNpb40/QB39l5xBnQ7/gzhpbwTOvWrV0m47ER0Ip4hzHwGYyO4RM/Bz8M/JE3CClecAbkDR/J9EcDx/i6wfmy6HZspV024S3kOziAHhRPyG1wPXwfK1Ysx9Mugis+Y2cpUrBeo7eZJzgILj9iAJnEP+B67mWu6IGPKQSjq+CxvHnzOsaGVsQZ6AM3hA4Cfy9AnM5TVKc+WICwWpQUOh0pmX6JnUabkmXWkYTf6nyspDoXLZHORE+gE3GS61TOIjrRw1OnN2/S/ceP/vRSZAPv3gbq5b2dOr6jvnpNLqGEPoMUxpOXSa9yXUD4222JwvRZps98lipyiwEqVj6/ptSPqUMeUbS9S1TNaRlDTVsUUuIu/fQZ74nw+VGJrDm5KkCgG357fF/nblzW1Qe35Bfw1zj+2evnuv3knq49uq0VJ7eq9nwPlRnfQp1m91OViW3VbtkgHb52Wnef3tc9q73y+6tOeGnR5tKtK7p8+6peOT3m6O3bAN2/t1cn9jbXiV3N9dutfXrrwod9a+EefXBqw4862bmHTmbPr+Oxk+tMtIQ6Fz2Rg3aHEqXTRouWu2Km1plISUNVgDhlChBrVn/aCQgcwuBaSIDDQ+UYg0tiMXv27I7kyljLqb17971y9nsXpBdBgXoW5KeXQa/lH/jcIhrB0kPde3BIMxZ6q3LzTCrVOrGq9UutGqNTqu7MVGq5JrMaLUujBjPiymtWbM2aE1srx0bRCu9wWt45vOa2jSrfmpFUveCXKps/nJpXTaiR7TJrqWcubRlUQLvGFtHPEwpp0ci8mjkwv6b2K6ZRvsXUq3NutWicQQ1rpFT9CglVu2R0NaoYUz1aJbd+z6zZQ7Jr6fDsWjEsm+YNSK+JPik1xjOtxvfMqTEdCqt37ZzqViaVepWNqRF1Imheuwja5hNHZ0ek1c3x2XRjREZd65dY9/pE1YsB3yhgeAS9HmH9PTmBApam0qvZcfV0UhQ9nBNHV2cn0PGpSbV3Zg6tW1BNI37ooLpTBinHqClKPHiBovVfr8iDtirOyE3KNHGpco+bo+xDFypt3+VK1WeRMgyervzjR6r2D77y+bG9Fh6qr8OXquj6xTK6vquQTs7Jpu390mpZtyya4lVOCxYP0vEbe/Xr63Nae2y5+s/vrXGrx+jwzSN6oud6FRQgv8Agi3mle7ceaPyYKcqTq4DlGBSVp6e3+vcfaDno9awgrLUjYKQRABF4sdvJvtMFwQwND/1fApLiGOGwYcMqTJgwjoaxxBl2lcxHPkgeYVi5Nnz48I772R0GkLwmoIsePfof/dEw4hjzT63e44zg9BcrVsxh0O1900iUE0iHtniAE44TS4Lxyy+/dPQBDnDcPxT8AjhZFKxIGODIcD9ONbujXAEBIE4+AXCkSJH+NHcagRcOPgG7q2QByRh0EsGHq/V//vnnDhwTiODUfQpAQ4J3HkFHUAJtncehxYgRwxEck8jBGQouuYG8kEiiOESgDs+ECxfuL/198cUXjjWRTGanh6udP9ALJ5hgx34vRZLg5sCOF4oMhrdxbFkftMPRRs7tfX1MI0GEExycQ4kNwX4434dcEOCGlGxnbp6enooQIcJf7qfIwO5fcGsAOSXRigw4X0/ChMKOc3LWDsgWO3Rc8RVrCClZR4BKkQfeM/cwb5JlroJudCcFFBJd5nrsK8FaSDghmcpc4HNzHy1KlCiO9f3TAE6R76xZs/5pvOAa8yDo411SBNvOiRPWDU98Ks8hIyRlDL+RFCApYX5Hp4Dz4JK2fwdIfFH4MnoypPbVV185+BA5JXlg7IId4G8KnBEjRnTcQ7/gza67WQd0JWB0xdemRY0a1REAN2nSxJG0s9tmeB55jxYtmst7P9S+/vprh01hDST3sA185+ra4BryTsKEpL+dv0kOkZQ0MgcOKBqw45PrKACgZ537C02jL2SFvgygL0hSUByiCPohXUwSnID5Y3ZhugKSMyRo0e3OY7lqyBFJLubPrm9XyQz4BFzZfZbQNvQHyaNPKUCAQ3ZGk2AkKYA9cTUH8I99cMQNlo0IKfnLPChmoBfgY/jFVZ/YYvwy5AHfzNX8kRn4xi4v3AfNg9PF6BH6NNczZ5Lx/EZCB1qY3z62oePpy26rDJDsZd3EV873oXM57REcIB8Uh/FTnO+NGTOmw+Y7+5kEqXzvyqfBX8WmhgTB2XN0CztUXa3RAAkufGS7vJHoxGa7SoibYrvRW8yZpLfZ5OMKwAnFKeTWjGEaycx/8nTsxwDzIjGNn+Y8r+Aa8oM/DL5J9Bmdjo8HP9l9h9A0dBrySH/wjSugb2Qb3QAOSfi50vXYN3Rnnjx5HLbFWa7Ql9hpO+2wTR/CP/YFOTX+DT4UvjzxGQVBu5wwNrQG4DviGJKi5ncacRLf222OAWJaCrjGvySxSTLF2XfAfhIPgzdkMjh7RD/wc7Vq1RxJb2fdRL9sgmEcrmeNFJo/lEiFHsim83gUlbAp/yRANzYhwivO4zk3w08UqIhXXBUG8dMo8oTku4TU8CU/VKAxgI0kUY39MPejt6FdcACN4HX7mBTdnIvb8CW0I7alYOUqdqXB72w8og/sRmg2wcFfbLTCrjn3R5zjXEQ2gG+N7qQgaK5H73MaJzj/1xRB7fofHLGRztVpJvQBJ+xc6Rrmi04LDtBXyB5rMPeQI8Df+xi/Ax8RH9ouN2zk+FDxww3/AQoQN5Yu0Ym8xXTysxi6ED6RLoZQgODzeNTk2hslmfZb154KG0vnP4uuC5/H0LnPo+u09ffpL2LrcJqsOuLlo7tXLv/1xcjWF6+fXNLlgz01aVZx5e3dVmE9FiiM98r3hQKXBYR/oPF+h77rFL77DFVsUl7re6TUpXF5tXVwaS1qn0bjmyVQ7Y4VFb0HL8HeoES+g10WIAKD3urY1bMa/tMMDfppio7fOKuAQH/LZ/NzyDWnI45dO6UJ2+Zp6LZZGr9nsUZvnavRa2Zo2uofNGntHOu3+ZpofT9i6ywt2rdWV+/dcNz3xu+1/K0+3vi/0c4LB+W7aqTm7FymJ8//Krf+r5/p6rkfdHhLXZ3Z76MnDy87cGsHrNvt02d0qHN3HUmZRWe+iKkzYaLrvEUvaAbtTlr02mfRcl+UpDph0TakAsRFChDhEumkde/JIqV1e+0ax2sVXMEHCxAYZ5r5m0/TUNooHhQunyRhSKag3PhktzbH4AhAcVxJrPr9PhE/qltBgXoe9EYvgl7o9VuqYA8UpJu6dGujhs1oplLNEqt053iqNzqVms9Jq3YrM6r16vRquCCJOv4QVzOWJtbPcxNp88CoWtcxnNa0/EYLG0fQkKpfqUOZr9SpRnQNaJNaU7p9p0Ue2bXOJ5d+GphHq4fk1OJBObSgX27N61NIU72LanDXAurWJofaNM+ipvVTqV7VmGpVJ4b6dUqsyX1Sa07/1Fo4MJ3mDcysCZ7p5Nsumbq3Sq2urb5Tm7rZVa/Et6qdP55aFo8sn+rhNLbR11rYKpK2dEmgE33T6PrwtLo3LJEeD4wiv8ERFDQ8mgJHxZT/lNgKXBBfAbNj6OXUaLozM4GOzUqrnxYU1exVjeW5pJfKTR6sVIMmK8aAFYo4aKfCDT6uLwed0leDjijqwJ2K3W+rYvfZqRh9Dyhm/z2K3X+jEvVfoExDxqnshIHqNL+Xpm7sqo0722rn5jravbyM9swvqQ1TS2tw7yLq1LeqJqwdps2/rtf8gzPVYWJrdZzQXuuOrtEdv3t6JUtw3kF76fEDK0CbPlclS5RRlcrVtHDhIsuQ7FLfvn0clWWSIgS9vr6+joo+OwTsgYzhJ9P+XwAccnZI4VgbY4mj2atXL5fJI4wiyUpjFHGwMJIke5EbdkyTRCAxhIOGY4wzRVBBIERyLrid0cEBssp9BMrMk75wdnCycbpMoEASFKcvNEaeYI4krymk0Aj+WcuH7ifowLmDR1gn9+KY0Z8rnKFfcLSYM9fiwJLAxwknkQG+zPjs/HDehWLWT3LABCgkifg3QTiOlKEfO5IonLl67EdIwJo4/cOuW/BLXx9qOOHoRldJKntAB4989tlnLvuwN64h0HEu/AEE5QRd7CiyJ2iMEwnvOQOBAYE7uKFvijfIN3Mj8cIOTfv4H9OgHzuYXSXI6J/kKcl/5/ugNTzmqrgHYJtIvnCqyNnZhy4EeeyMsusfeI7ks3OiFT6DPwjaQwoIKBIhp3YdQANn6EWCkOCA3wjC7IEW/RA4Eog4B8DghoAavufayJEjO5Lb0IO1uwLmTmINWjvzEfhET9PvPwnwE2Mis6HhXdOgATs07clfgPmRICeQMzL8MY0Ahh1m8Bt4gqbQzMgCO53RMSHt8PwUgH4EUxQ7XCWsg2vwAEVHAmNnfU8wSELO8DeJXB47YGwtuGLnJzyEbgdfBH3oO/BH0ZhHZKLrzPoJQNGdJGwMH5H45btvvvnmT3MLbUMfk4RHlyKTFIhdJTA/1MAbBRYK20YesD9dunRxjME1BgcE3QTRFOs/ZSwaPIg+cMYn44HH0PAzOKdYjm4Nbsd9aABbSsGVvj5GjrCrJO6c5Qj8kSxGL31sMYhGv+gLV3o7JEDfUjilCIXPEJq1oH+RATZsuCoA40vxuCZ4Gj3oqg/nBi9jAyjYOssVNpygyJ6YQQ7RE+geZx2JXmXDAzaVa40uZgMDfTNvEsGmr49prJ3NGeDMlV7nBAM7RI3vY2+cbMJ3CA5McRj/0vle/FL8d3vRh/HhGfDs7NsgKyR+Q3oEE3jCr3Rlz8EZRabgfFr4xvjY9g0F6HP8RVebXYyPbTa24NdyKsj5FJUd+M2uT+yNUyHBbYz5twG8UGjC93Ke14caiWZ8JfABQHfkhQKqq+s/1OANaOXsG9MvCUViffRwaGQbu4Nso9vsSU/yCCRssU1ch47CXpFPCA6QS/jZ7t+zoxsZN34IMsH32BLskEnew5ucEqTIbfcr4FUSsq42yHBKAz1m7C8FDfBq3zSBfmTHOHN3JaOuGvyNbgKXdpnHDvn4+PxRbIev2ZQUkszhxyADdl1mGnTkUTT/ZAyO/8mjtj/Gx0HHYdcoFjr78/jFJJxdJddD09gAGVIR1g7EStDa6Cd0PrFlSEVVaIKuN+OhB8l/2P1H5I7NRfBHaPHC6Q02poWm4Mk1nH5w1Tf8HNIJTH7DvphNLPhK6FjnU58A60B/UiQz/TNPnhjAY6Vc8RE+D0U6CpHmHtOw/8hrcIA8IzvkJ7geuWQDBptQPsbvwEfENhm5QbdjM/7uppD/PwEFiOtLl+h4KAoQl37/PBQ1qfZHTqIzEZM43glxMVIyXYic3NEuRkiqS2Fi6PgXMXS4fHXdOXzEkQS3Q+Cbh7pzfrJWLiuuaoPrKWqv6QrjxXsflllt0Z+LBv9067NekTxmqH7H8to9tojubhmsQ1tXaNeiIToyqZIWDC6jgj1664seyxTfd6h6TK7l4gTEOx25asU7czyUcWhFDd0+U6dvX9CxKyd1+MpxvXz1Qgetz8bzvZRhZDXln9xYfdaM0tbdW7Rv716t2LxWHRb1U9YJdZRjdC0NXj9JN+7e1OPnj7XjzG6dvnFWJ29dUMdVg5VuUBn1WTtOL6w+/wKWDXn+5IbOHRqogz9X0uVT0/T61Z9tNx7tzV926VDRcjoRNoZFm5i6FDGZLv5OrwsW7S5a/z4dIYlF08Q6YtGW4oOhtXOzFyBOFCmtW3+nAEGwgnIxzXyHk4BDgBKhksqOIj75N0af4B6jjgOO48mz3HDuUSxvrX78AwL1JvCtXgf66/Xbl44ChL/u6EnAKW07OUPdx5VTmc7xVX1gArWZnUo9ln+rnivSqPWseOowM7omLo2vrcuS6fjUhDrsHU2/tImonxt/oxX1w2lmva81sVkkTeuWSHP6ZNAcn2ya0T2LpnXMpInt02p8x9Sa3D2dZvTMarXcmtIjv8Z0K6j+3fLJs3tudeicUS1bxle3NnE0rHtCTfFOrBleSTTLJ7Wm9/5OI7t9px4NUqpJ9cSqWS2xKpRPqNJFYqlSkchqVimCetQLpz51v9SIut/oh2YxtalHEp0aklLXxibSvTGx9HBULN0flkB3hsbTnZExdHdyLD2YkUg3Z6TSselZteGHchq9tL0aLx6kHFPHKd6IGYowcLEiDN6oiMP2K8LQ4/pm0FF90/+QIvY7qMh9+TxmXXPCuuaI1XYq8oD1it1vqVL1Wai8/X9Q7THT5TF7qIYsbqPxSyrph9WVtWBNHfmOL6/KXfKohm859VvpqZGbBqrpmPqq7ltZ4yyBOHP/tCzqWLQJdFQp/V/76ZfN29W6ZWuHozTHcuzOnz+nBQsWWoawjsMpw1mGH3AecHLMEXoa9IeP4CHz9/9lYP4EoOxOwpkyBpa/cYZdOTA4jewUIeHDtThgJOMJNHCYSMrjDBDssYMAx47ENo4kwT9HdT8mOQ7eCWJxunE2CA4IqHC4mB9OAs4Ec8GRIaj90FF1nHJOE5C0szvtBB/Q3xVdmQdJBBwfAgycC3vCF+eAgqWrnc/MExwT/DIeO0lIsrOTE9yRTDP4Z8cF15tEFYCzyG4ok5CiDxKC6CVwA6+aHehcQ7IrpIDHGcAHu/gIqOxJaAIK6GyOnoJnghaDM2gB/dn1ZA/AWTN44kgvCQwT0HEf99MP/dHo354gZHxwiwNnd+pJZOEMQ3s7zeAJ1uv8PFloyA4i+BHcMgeccpKp/EaCg+CKYMbMBUePhIK9wAFPMV/7dfxdo0YNR1HaVWKfpAIFBDsuzZzpH8cXG+QKoDsFBvSTwYvBH/zDuM4FCOZBMcWs01zP3M3uO2jiClztQrLTl53s7P4MDkj4EnAYGTSN/pAH58CM8bCpphjHfciwq8KdAWgLL5kEDvMyc4SfCG6Dw+enAolgks/IlcEptINHDB/QkA2+N+umEQgSlNqDf+QDOSGxYOYOfeF/e3+uGjIEfSnAYXfgOZOIMXPjd3yW4BJhnwqMZYIpk7xj3iQRnOdJ4dqe4OM6CpDOiQZkkMKYkQ8KSyRZTCKHZBqPSkMf8zs8QiCGvsPGkCBFtknS81gTMx4BpinSAOggEh3msQpmnuhqu2wiN3xnXwuNgjmPEoNnSaqQFDD3IVvB0Y6xsA32MUzx3QT47GJDH5kkOjbBnFQieYGdtM+bT/DrPG/GcR6bYNfs7EPuwT+F2A/pYmhq18XQkkQAfrGzXQstMAccdRJyjM24znKEPmXeruQIu2QvLsPfFJFJmhubGRw/OjfGYT3Y+I+RE3CInoOXKLqb+bEWknN2HDrbM/5GZzvbY+SYdSBX9nWDc2hqpzv/NmulwQfoQ/wHux1gjsibsy6mOIwP5lychNfAL8V0rjO6mA0Q/AY/siHArI0GnvExnPnIfg1zRi7ZnOBq1z42DllGF5o5Gj3G3/AKsuLKDwPQq8zNzNt+LzoD+2ovQGCD8BdNAsp+PTIBboLbOQtgz0lO22XP6HD8D3AW3P3QGR8bO2q/HzrjY7vaSQsd8bGNfwkNSF5BE1cAPikwFShQ4I912ddI8hoZDg6f/ybAc/jL+NrMBbyBM7vMmAZv8Zvxv+AzkoxskEAG6YuCBLrS9AXvoUvs/plpfM/vpj8+8RXt/gz9krTET4JvDc7o21lPIdv2ZCm6m+KevRiIvcROG/+GfiiUhbTbH18D3WJOGKAz+Dd8TqyEHIEbfiOG4oSFkSt4G38KHjFzp4E7YibnZCU8gP0l8Wv0FGuAD+FVgDVQsCbGMBusaKwXnjQ4MbrJbvPBEZvXSOAanxP/kxNexn9DH3F6JLiCmqEJetP0bedneAc7/6k2yRUgP+xYNzLKWqGHob2dB+xyzHXwjrMuxuZyUg5ccR28h60wej2khu6E/iH5xHYgR0HR1RSLoRlxMHNyBeAX/4PYiOvBK7YWH8z468gaPiaFQzvPw1fgxawDWiAnRh/S6Av97Oz724Hf6B/fz9xnpzEblEIqQuMTEEMbXcB99MWGFzsd4GV0H7bG2FDoB8+bWNAZjIyw4dGsi/7N36wZu0nfrgBdYGSS6+ER8iHEaUbGQgPQCBlAJ9IPBVn43nlznhuCh08pQOyPnFR7IyfRuSjJHN/xbogLtGipHI9ouvxlPJ0KG1vHilTQ3d17HTnhP+Dta724tU67fq6s9mNKKpH3YIXxXKMwPub0w79ZgODdEusUretYteuYT8dnlJXfpQ16/uK5nj+6q9fn1ujkUk+18OmpyF3nKI73UHVzUYAA7j19IO/1oxW/f2GVm9te03cv1ZifpslnzQidvH5Wl+9ck+eGicowuqYSDyqpFnM89MuuzTp16IjmblischNbKcGQUiowubFm7lqm2/fv6JcL+9V2kZembp+ruftWKevYGkoxpIxm7Fv+p3yXHZDF+7d26MTO5jqyrY7uXF2nt4H/8d0dBYiftuhormKOkymXv4r/+0umofF7ukHDsxYtoenBKP8DBQgULBNnUTSE3iwQxUcwwE4IjhZiZOvUqeOonuKc8B0No4IRIBmNA8p9jmYpnYCAt46XGjua9e9XgU/00P+KTtz5SePXd1O9Id+r6qAkajY1mbosTCbvxYnUZ24c+UyIoAkzI2vrsng6Ny+ubo2LoRu9o+hMl0ja3yq8trX4Rhs7RtKP3rG0dlBSLRn8rab7ZtTwDmnl1Sip2laOpdaVo6p7vXjq3yqNhrTNrKFtsml4x1wa1iuf+vrmVDevdOrkkVi+vRJrtFcSTexpte7JNa5bGo3pZl3bLre8amVUo3LxVaFsFJWuGFHlKn2j2jUjqF2LSOrRKqLa1fxC7St+rUGN4mqxd3rtmphdh2dm0uEpqbVndCpt6p9eG7wtp9Yrmdb1SaWNY/Jq3ZTKmmMx24CpPVV32khlGjtdUYbM01cDVyjc4A2KNGSLIg/baX3uUaSBuxS5/y5FHLBH4QccULiBh/XV4CP6cuhBq+22/t6m8P23KZr3biXy2K0Mvdar6ODJqj2toxpMLaHGE3Opw/Tiaje5okr3yKMsjb5ViZ4F1HJ6I9UeUVXFuxZSx3FttPn0z3ry9rHFpP6yOAJu1tVLlzRqxHBVqVxBnr08tHfvHkcyY9Cg9y8l4oVIOD/sWsJRJbFl+AjDYniJT1fG6/8SsAaeze9qly+BNgU4IzcG2ElligxcRxLMPKsSp5VEGI4JCRCDHxJBZncPgXNwRytdAU44z54kwGA8nFgcO3P0mUDVJKFw9pBbHjURHDAn85goe1BPI0ii+OgM4AlnkMCCwJAj2nYnlIZTQhHTGUic4ygZRxTnjaOgJoAgwODRTGbnmnHe7EkXEm7sqoYmOHs4miR3DX7hU3PEnTWRZOHlp6EB6EsAhUPmHEiQcGNXHYlYlC2BEEdAcT7NdThXBEQ4wQZwkCgW2HecwF8EHjhUOMsUTeiTHcoUXXCaDQ8SNLJD2r47EDyxQ9gkJe2N5J6zs4peJtFkEr70TUBmilP0zQkGeIt5MB8S2azZJITABydCSH6yG4vrzLUUjkhyOOsAxiXRbH8UAjQHn/yNMwlOze5kZ+B+eJp5Mz64oJn5gD8KVGZcrocXTPBBUGlkk08CEecTNXYwjzYywSHzQ34ZC5wRPHOSwXmdBrCl8IQZ0zTkg8KE2b1ogMCU5KqhI5841cElcNC54BoaG/4AlwafzJs1hjZYCy0QuFP0MwE460NnMHfDu/AOsos+NPJNI2DDl7DvYCMpThKMR5uxDniSRDGyY/oLrsF7+CHoDHwbAm9eIGmKjgS3JGrQeybo/6cAn4ddnvZiLYk/5NbMj/lTMABf2BK7HmGNBJrwqQEK05yKM9cQqBEkmmvgSQoUph/Ggwed14ZeZNeiXReTWDHFKHiP5B++HvNjnugQ9IBJJEMLArtmzZo5frfTgiCSMcAB+GcehgdZJ3JsrjWN+9GX2CF0uUl+ESiTiDPFd9Zjf6wGfWNf0MfIAnYIubDPmz7tJ42QeR5FZHQYjesprhO8Mm90MfYEvjP3sQb6ociJzjP3YtuwHSbxSUMfYLPtuvhjADtNUtzYN/rD1uBrmXFZH3KEL27sPA05glb2Rw4gR9gWkqqGFuCRuZv+gmuMAy+S4A1On7kCcIi8mWSHaeCUxBqnTegfurNWEsH2pA38hS9lCmOMbU7n2YsV3IMssDOV3ajQlU94E/nD1pprsa34WPakNLoY++Csi5Ej7Kmz38W6OLHK/LgO3CMr+FzoXRK/FKcN7uAtdC2bDozvRFINepqXZNK4jqQ+PG73Ywwgl+hR7Ax9IL/4FCbRAm9SwA0uwci8kQdkmLXBrwaP2BN4y16AoKCHzwX+0GHYDKMzWDtFRmc/1wC+H34d9ofraXZ7Tl/QPDh7Dh7ZyMTGCcOvprF+dKszL5KsxqYYHiIZh48W3BxJ5CI/RnbAiR2f8ArjfMzu238K0GX4e8ZnhDeJEew+oGn4WbwbwyTb4TESoOhwcAQvsQPY2Fpwj99LAci5L/4NH8CbdttMUhHf2NgScIeete+0h0fAGbaEYpbhffQ9sg3Pm2vxD7CFJh4BiB3tpzTQGyS4XQE2j98oRMIf2AtsgYkl8Kux7cYWwnesz9gREsXMzV4YNQ0f1PkxPsa/ZB1Ghsl/kKwGJzR0E/rU0IHG+PSHbkJ20U3IIP923shFrEcsiOwAbJKCjob/sYvIXHDyjU7Dhtn1LXMxdgkcoLecfctPBdaMj4mvYubI2Pgzdp6iwQNcZ9fFJL6xsXZdzMY77JnRS+gM8Iw+d+ZV54afQEwdmpP8APYMP8jECcgaYwTn9+MX2HfoQ1v+5rFW6BhkDd2NX29fJ3yP7OLXG/uEHCMn9riM/uALfAZnn80ABRrwa2QJvcC8zXjYdOYTnJ2Gt7BP9kfy0he8iUybcfHf7JuXaNhtZ3rZAT2DHTS+FnKCDjFzhZYUQl3ZNgC+xhcwMokeZkMacwkOH64AHsDuGNli3hSioZ8bQgcfW4A4FzmF9kdMqn1WO2f9+6+P6kmuS+ET6/TXCXWsYAXd3b7zPwUIi7RvHh3V2T0dNGJqPmXx7aSwPRcpjM8a/auPXjKNF1H7rFXsLsPVq2M2nZ6UT29Pz1HQ6zu6/+Klzl65qA3rlqjBgNGK0n2u4noPVrdJrgsQwJaLe1V5dnuVnNxcXitGqsUPnso7rrYmbJ2r/WePaMnhTRqze4l6b56iab8s1J6927T/ly1av+NHjd72g/psmaoZ+1dozdHNWnNki3quG6WMw8ury+J+GrJ2knKMqqmmy/rq5N2Q3zXn7/9ENy4t1eEt1XVqb1c9uX/qD72Ahbm1dqOOfl9MZ8Il1KUISXQhSvI/0exitBQ6GzWZ9kZMpgMWXc9bNA7NI5g+uQDB5ExDUZnEMYBywKEh6UIAj1BjMHF8SPqw+4bdmxhbrkHgzekHHLg3lvAH+lt9v3xnNWusN+/07NVjnb17SEv3T1SrieVUum8qNZiaWu0XJFfHWbHUY1JEDZ8UQQumR9DOeVF1cX503ZkWXk/HfqWXI8LpwYDwuuwVXqc8I+lI/1jaOSSeVvSPr4k946lv+4Tq0jiRGteIq4olIql0ka9UuXRkNaqeQK1rJVOnWink3SSdBnXPpr69M6urd3J18U1sOV+pNKZ3Gk3wTKux3TNpULuM6t8im4Y3LagRDfKrS9XUql4+oipU/1J1moZTx24x1bd/Qnl5xlWDOuFVtXR4tamXVKP65dPi2eW1dF5pzZxSQMMH51PvXsXl2bWMenQqrY5dKqljn1ZqO6K/GgyfqJKDZitjv3mK47tIkXqvUKR+PypK/82K1H+LIgzcovADNitiv80Kb7WvB2xR2EHb9dmgnVbbozCD91rN+hy0W2H7H1AEn5OK2euo4nVbr/S9R6vM1M4qP7mM8vikU55uaVS2T14V7ZFLyWsmUqJqcZW/ey6V8i2qvO1yqIpnec3ZMlN3Xt20mNTP0g2W8/4uSM+fPNaqlcssp66mataoZgU6PzgMAwYXg0fSiAQGjh0GCt7BKNv5iH+b9jEG5X8bsBYMrQkE7Y0kLMkJ56DVPM/ZOGo4LuAPIAnMv3FGSO4aIDgzCXICwdAWIJBf6EEQYeaFzOIsGmB3DQ4GDj9JP9ZDwSM4IDAl6WcCSNNw/HGuXB1Vx5HC4WCHjN0pNw1cUARxlfRnfgSoOKJcR/DO7gnjXJoA1QRA0MJ+zBL+IvGIw0SgQ0KG3Xj2Z9nicOHcmrmACx5zExrAiceptiedcLRIThEEsXZkAaeHcSjQsXPXnvQj6YEzCDBfkmfgygTQXIuTzjgE0iShWTf6lHWSbCC5axxoGnhyDhRJotgTNqaRRCBZaA9omC9JI+NE4sRxwsk8TgTeYg5cR+Nv5kLASTGJe0iacQ/4R1bMtTT+7Ur2SXbYE24EqDjJBGA4suCEYMEEfM5A3yTYsEE44+CBgI2+cOzBNUGluZfEO468wTV8RPAMH+DUU0QPLrnPWASC0IbrTZAJ7UzinVMxBKzBJS+Qea6xB6CmIbfwBbg2QECNnJokGfTBxoJPV4Dthe8NPuFNkgjmsSHwA8U59IQrfH4qILfwuUkgwxMk48Cl4RuCeZJ17OZFLglMuJbGo+FIqhtAhkiIGDmDF0jmoRvtfOiq8bud37BLFAMNjeiLoNCeBPmnAJmiAGJkgga+0Qv2+cEfPC6HwNTwE9diR9gRCZ4MkMy3J5o54m/fIYotNo+coBGEudrNBz4oMmJzSNpQLETHmAIEfAeN7PMkaKTozvX0Dc8jn+wA5Xc7LbiXMfiOhKpJotFIPJOoMdfa7wFnrAFZNXKJfeAxACZpwmkV+6kjdDZJG4AxobeZC5/YC5MIBbfIG8VB9Lx9jeZ6fBPAFNvtupjkCvyCLmY+3AP90CUkyuF7uy4meYpO/xT54vQSyVTwTF8E8hRMoZF9vvAHc6XIYrfN4M1e2If34TG7rGEPseumv5CaoenHAHThlKJZAzoBPUuSDjrjz9A3Mo6tIIFkfx43CQgSZiYhhA6hGGkvwqHXoCeyRiEBejNXPrH1rBn+NnoWmSc+sRdesQvwkStdjM7Et7HrYvQFxQ2TnGFN2AOji+EhOw/C1+h7++OvkHXsFb/Z8Wx40BnX/JvdpQafzBUaw3OmSIZuCGmnJ3jEjwSv8AHJKiObpgBhCgKsl0QOMR6/Y3ewp0af4TtQ+AsO7PYcuYNO6AuTwEWuwGFI9hw/xJWPzb3ocWd/GB/L2ccO7hSiHZ/INryJj2zHJ3T9b+2cJVEOfgy/INskzNE7hrdo6B/4EVk3j2dk/fgj5vQGfcHzpi98cZKgrMveFw3ZQcdQeAGXRibAJclX+gN36E9wZ/qEJhSX8ZsoDJi+mZ/xw9mkYvwXGv4PNDDAdfRpfoc3WZcrHwfaUzwyyUpsOvGJiWFILhOXmL7Qn+xUZ30AetPEF+Ya06A780UvGWAdbIgymxdo6E/Dg+AOHYD+MvwHTsAhpxZIrKO/GJ+x0VXYd7ttRCdgY02CF9tqLyag97A9ruQFYO0U1tFLzAGewZdkDtxvcPSpRXFXgA6zb0rgdDQyZ+cpGmMSY9p1MbwADtEVBtDF+DVmzegc9Ay0cOZV5xac7gwOmCc6yfiqRo/TlyuAbvCAOaUDfcG32biH3BD7230+/Dg2hUBXigfGPhFP4RtQJKMfrgV/zAe964rnWRsxBXqbOaNHiXM4JWCKhfAIcbGdd50B2cSPMfYLe0IeD34Dd9gk9J6Jn2j4NdgO55NBdkCXU3xhPawFfDI3gy9wgT0Pzt+G7/HtTQEYm0Gh5mMLZugpu5xS6AtJbtzwV/iYAgRJ6dMUIMIn06EIyXSenfTO10RJrssRkuhU2Lg6nL2Y7mzc8r4A8S5Ib178pqsnR+qHBaVVtn8DRfCY/v70A4UBVwWDf7o5ChCrlbDbCA3oklNnhqbQ4xV1dPmX8Zq1abM8Vu5V41kblWXgEn3da5kSeA9SdxfvgPAPDNDdZ4+07eJB9Vs/UZ3m9tHg5RPU8AdPJR5SWtWnddTAVRP0w57V+vW3m3r6+qUePHmg00f2avPqBbpw9qSevH6h+08f6sLNy5q4eZ7qz/JQnnH1lcS6v9OiAZq4Zpaazuql4dt+0OFbF/T41bM/nyRxghcv7unisdE6vLWuLp+coJfP3z+ZhijnxtI1OpQ+r05/GV+XIyb9E71ol6Kl0LmoyXXAointjEVj52tM+9cLEBhgFCZJEAwOhpHqJAqFijUFCJSfSWZiSFDIb9++78dhHPws54X8odXevnir2/du6uejazVgSVeV65tNxQcmUfNF6dVmQWI1HvWNugwKq1mTIurA/Bi6Oj+67k0LrweTPteLyWHkP/1zvZkcTg/GRdK10bF0clRCbRycUOO7RlPHeuFUt9I3qlEluqpUi6dS5eMoX/Goyls0qooUj6lyJeOoZolYalUlgTzbfiuvXt+qk2cSde6dTL5902qY73ca7Z1TI3rkk2+rnPKom11D6hfVzNaVNLhxHjWoHF0Vq36mJu0iqt+wlBo3JZv6Dsmoes0SqWT5uKpQ81s16VJIHqNqqueUBmo9qo6q+9RW2R6tVLp7LxXt1kc5uw1Qxp5jlcZnvpL4rFNsz58Uo+d6xey5RnF6rVVcrw2K7b1RUX1+VoTeGxSuz1pH+6rfWn0+YI0+G7xWnw3cqM8GbNVnFCMGWq3/Dn3RZ58i+BxSNM9fFL3rDCX16qmS09up7pLGKj2ymDK1TaP0TVNaLbUSWLiJXCqCEtdOoO9ap1fmJulUoFUeDVs8WJfun1PAOxiIAsQ7BVl0PHrssDy9PKxAqpKGDx/mcHiePH3icMKgteEVwz98YjQxuHzS+N789n8V4GUcDWPAMbY0/iaYIRGJE856DeCAmGDKOGpm9ztOOE4KSTaCc4JjnFV2vOJgYNA5vWCSwB8CnBwKGSYZhaOCM45M4pjgSJFQwmEgEcBOSZx/4/g6A9+TYDE7T3EgzXpxKpB550QXayd4IAljHAruAz/GASV4IcB3dfKCJDoBC+NwPY4ZQbxxIuApdsybZBTzIMgyRR34i3mDY5KirJEdwvY18j204n4aji9F1g8BayO5Yn+WMoEMCSsSZK4S19CEZD/BAHMlWUCAST+sCboQUNkLGgQkBJ0kiXEKnYHAkqQkPGLogfNLoQYeBUgoUBQxfZrraMyD4oT90VvMA962nx6guBCSvJLEItltErsE8CQe4bPQAPoAelPIZn7wCKc7cIIpkoFbeJh14Jzb5coAdGUXD0EN82B3EcEs/bEGknnmtAfj4aSSXKFfnHnGNqeN4Fd2qbkKRKAVskKBxTjarNfsTDTBGLaQ3WjoRVeAbJsdtDQ7XQhiSdrbeZXgxRQjacg29tgVgB9+M8UG5snaoAn0NnKIDrI/QuCfAOTMvuuVxFZwLz6Ep80L64xOgP9Zu5FzeMi8j4Tf4QUS0p8C0MK+859Pkm7BBZx/B5g3yRgTXNLYqeoKDE9RBDA2BXxQHDXBOTQlQWsSyPALOt0eEFLQMc/QpuGjsXPdJD7sQBCKPUDuzCPpjM5wBfxGsgGdRN/ICAW8kJIZ6BJ0h8E3a0JPuNJlBtBF+JXGZpgCBPMFB+g2e1ISHDg/Rs4OrJukAkEwOEM/UAgydsIVMG8S10YXcx+4ZHceSQt8YWdAF1PUIcFiZJmkgF0XfwwwPyO/NHQFOssVwL/QEFyYZAp8hLwbOYIHSDoYWnAdgcC/BeCQkwbmhBkNukF/eM2ZHwGShiTIuAfbZHBuigX4GNhYswZ0Nz4ChVhXp+rQa6Y4bi+8YLdN4R8gcU2yhN+gnaEfjTlQ+MF+G0BW8VvMNSRqSHCEBPhZ+DDYIvrnbwpHoQV0F/Q0O2ZZDwkhdIJ5hBDfYbuDkwdwYWwickXRyhR86Bf7aQoQjMc7P4w+gZdZs5F/vg9udzp4x/4Ye46fh/3BnpNwNPacgkxI9pwd+iZBTD80/oZ38dvAn+FvAD4wBVp0DfbNnty0g8GnSQCTlEcvQGvj17HmkPD5bwIxlX0DEfPEBw8OuJ5iPteCJ/xMkpXIBIUn+M30Ba3txUlngB74wcY/4h4KEBQd6A9ZYLOP8REZDx8UPY3ecmVPiV2YP/Jk6IhOw4c3/gcyjJ9mfAGKV2xgcuVHIr/MCV6gP/olUW10LcVHux+CX4ZvbgB7QvLXzN/MiUbiE7/THtMY/5zfzD2c4DLjkVSloGHsPb8T+8DzyJ2dTw1gf1kvhQL65RQdm4qIzbgee2IvtrMeChmugHmwwYxkK9diP0kqw88U/fkOmwCPo39D8udDC/RBfGLnA2Ka4Ha4gyN0jNkUQ0On2OMP+M5sfqI/1kyc9m8AsZdJjtPw40OK/7Dx2BJj08CxidcBikp2u4Ds4LPD4/CbM+BHEKeb00HoG3w+fDJXPgP4o/BqeBD5wV6Sb4P/+Y7Ee0iP6QKgG0UKipSG77HN3IesYatYh5F9bBa+BT5GcLEC8gHvmpwDc0S+8AGw2XyHLqfAEJzvhY9CLtHMCXvG2j7GP0du8PfsRSB0of00qBs+DKEtQJhCw4koyR0nII7w3gfb9/brLkdOrpOfx9TBNN/r1krLNll25l3Qc929slIb11ZT4xFVFNNznMJ4rlYYnxUK09upUPBvNQoQ3iuVvMdwjeyWW+f6RNaFgXH1Q59CKuE7WAn7rlac/msUvvcqx9wS+QxUD6cCBE/4OXLtrIZvm6dWSweq++Jhmrl2ntZs/1EeK0Yrw/DqKjiqkYqOa6I683pq48lduvPggcXzj3Th0HZtmDdW18+f1Bt/P126dlHL9q1XjZldlWFQJWUdWkP5xjfWqB9nasuurRq0fKKaLR6gdmtHatbBtbry4KbeBv3VhwKwOk8enNPp/T11dHsT3biy2pLhVzzXRtdmL9L+RJl0KmwcXXY6/UDjZAvFpEMWTfdHSKqTv1/jTFvHd38pQFjj/J0CBE4IDYWDUPNJEgSHF8cIpdm1axfHLhWSMSgojDbPZ0XB4BARaFKA4F4CjkA/i+EozL54pxcPn+v4mSOasXa8Wo+poVK+GVRlfGq1WpZB9afEUs2+X8hzeEStmZdQ51ck1Y25sXR1YnjdmPa17s4PpweLw+vRwii6Oze2LkxPou0jU2par8Tq3CCqyhX/wnJ+P1fR0lFVtkYilaqRXLnKJFKWIvH0faF4Kl40gSoXiat6peKqZb0katcuhdp2T6kO3unU3ec7effKqT7dC6h35yLq3qKgOtTIJd9aRTStTS0Nb1lKjasmU9kKEVS/WUz17J1e/YfmUVev3KrRJIsKVcyo3JVyKG+9YireuY5K9e6gQr49ldXDV+m6j1DqnjOUxHuBYvksVHivhQrrSfWNo0br9Y33esX2XKfEHmuUqMcaxe25RjG91iiq1wpF8F6iry2B/KLvQn3Rb4G+7r9I3/RdabW1Ctd/tb7uu0rhfNcqgtfPikIxo9cCxejmo/jdaun7IZVUc04D1Z1aRwV75lPKuskUr0pcxawUS5HLRFa08lGUpFYCpaiVTN/VzaRek3vq2NWj8g+yGOidxaoWPwB37t7SsuWL5dvbW9OmTf0j+QC/YDDhF8M70Nze7PxE47r/q0BFniQJhhkDhyOCwTXBJU4jxhyjDLBeHGnjnOIIkgjEoQGQK/7N7wSGJK4I/jDGOHfszCb5Y/r7EODwEiCYUweMR6DOnNjZROCFUxTcTgQ7QDMKJDjKJG9wSnCYzU4mHBcccXsiDCCAJLnHNTSSBgStOMgmuYQjSnLR7oAawPk2O3cIMthJYXe+4TecN+Og49yAL4oMoQECUJwj47iBe5LW9sREcEAwRWBhdlkQMLEuEs4hJddwVNlBw5pJWBMEIkPwB/MmYKY/GjQjWeoKN3YgaCORYIIAnDZ4zfAKxQsCSX6DP0nsgH/oyL/BsT0ww3ElsWGSPPAQu05DAhxmAlxzD7tJeaaoq0SdK6BIZOdXHHEST9DbFPqQK2wOQZar5BU0Aa/cD09yH4UxaMM6cezNbjuCAX4nWcGcceRJhpAIh9e4Hzq50lHQCufd/pxSHG36RqYMT5DQImB1JWP0gZNsEpzwHvoDHmadpphm36XLTncjD6yJkyEEPK4A22t//jEBk0mektSB9qyTPphzaOn0IcBPIPFk3zkVUqEEQA7xH4xOYO3M1fAv/M2OeJOU+FAiJiQgccgOV9MXYyIr/wbA0wT74JmxwDn8gD4NDkig2XUKRWkTrBGccb8p8sF3JJzsgS3FJPsJCPiL4A9eJulgL2h9LJAcxkaZRC4BHgU3eC04QJcYmaQhxyQsXAXXyDSJMmiLHJqdtehn88gceIKd7oavwS3JFWNHXQEyRJLABKTMH7sEX7kCZB69Yy/aMm90rPOLnZ0BWUdn2+0bNvdj8Y4ckZglqWfmAB5CkiP4gwKWSU6g19gcZJcjcGV4H96gOPJvAPPH7pjd9oyHv0BCzBSBXQF6ET3KvElU4wNhW6Av/EGx3cgHepKkInbYVYLSDiRO2G1tEioktUzy3CQsjC5GByNjRhdjV5Ezu39jT25yDTvPQ3p8JfPD5zJ6EdqQqAtud74rAG/4QMbGsh4SrjxWENvLPOBTdE5wdoEkjDnBRPKJQJAiAf8Gl3Z7xdzMiR5wge3BP6IAAQ9h44MbB92HT2i35zxqypU9x89zpQ/QK/AAMs618BG2wawfv8/+UnT0KrzANfzOGOie4HiD5C/4NP2zHnwL8IyvTB/IUkj4/LcAnsQfNLShkZS1n2B2BuhmEs3QB540BQP6sifjsRGuikeMS7IPPUeiGH41+gJbBK8ho/CRwRENnGPDP1Sowf7io5vYAVtu95kpFmFjjC8L/vFXnH0o9Cn3mWIc1+PfYaMA1symBwoA/A59KQybk3IA15o1uPKLSUzb8Y1/ScGd37gHHQG/AfAeOsZ+egN9QrI1pAI9vMkpFZLIFIeJ8fDz4GlwYi/gQgeKbs5xlgFiSOQFvud6Ykb8dnjX2GBkBzpSLIWOfxewORSUTVwLbijChBSnwpNszoEm3GM/xQnd8K1NgQJaIKPBPRLp7wBjEfeYYgcN3Wg/UeoMzAO/3PAv/IleY73QDHtqdDz0QkdRlAvJPsHbbExDftigQkxLwcWZPsimeSeD6R9+wOez8zq6NjSnXIgr0W1GvqEHa8PHgG+N7uZ7chIUAkLyY7AX2Elj76Exmy6xlabQB3+QR0D3ugJk0i5DxGcUNVh7aAG5QS6Nn8yY+MDIhxtCDxQgbi5brpP5S+rU5yEXIM5b7WiU5NoXKamOREnm+M5lASJKCkcx40CitLo8c67e+AUoMOi2Lh7qqnHTsus7X0tP9VyrMD7rFKb3v/zS6T/aEmus5QrjtVwpuw3S6K7ZdcnrCx3q8YU8mqdX7NY+CtPVuoZHQnmvsK5bo8Q+A+VhChAv3hepf/3ttgasn6j0w6spdr/iqjm9izbt26obl37V8u1r1XqGl5rP9lGOCfWVZFgZNVvQW4N/mql1Rzbr+I7V2jC9nw7s+1E/n92jXkuGqc70zso0qpqyj6qllta9/ZaM0o6ju3X9yjVN/XmBcoytrygDiqro1Naas3ulHj0L/l2OQUEBunFhtg5uLK0zRzz1yu+u3gS81cXRE7U/enKd/jyWLjve+/Bnmjne92DR7HDkZA7aHrdo+8f3Ts1egDhVtJxurVv3aQUIjCmNv03j3ygBggACYpQRybIyZco6FEq1alUdR9FIbuJEcJ1pgYHsfg+y/g5UgJ+lVP3fKfClv25e/1U//bJCA2d0U72+hVV5QAY1mplZTX/4VhWGRladgRE0Ym5ybd6QVUdWZNChqQm0f1ws7ZuZUAeXJNfBZcl1YGEy7f0hjTZNzqiZfTJYDJNC1cvHU+58kZU1TyTlKx1fRaunUsGq3ypryVTKUiiFChZNrZrlM6hppQyqXza5alZMotp1Uqhhq4xq1vV7teyaWy075FKLVjnVsmletWpYQE2rWt9VyCuv+uXVvWEZ1aqURcVLJ1LZKolUvV5q1W6QRVXr5lbJKnmVq3ReZSxdUGkrl1eGBk2Vqa2X0ncZrRRdpipep9mK0nWevum1RF/2XqbP+lgC0He+wgz4QWEGLdBXfZYoutdKxe+xSgl6rFDcnksV23OxYvdapGi9FiiC91yF852hiFaL6jVHMXoucBQaonvNVnTPGYrec65idF+kWD3mK4HXOCXx7qiE3YorUYeMytozp0oNKK2insWUtlEGxawYV5HLxVSkctGtz2iKWyWeElRMqDSVv1W7YR217+x+vXnrZ1k+iy8Crf9Y/3/x8oXOXTirbdu3Wo76XkciPsiiLfxhChDwCQ2+wYjS+P4//PC++PAxRuV/G+DQc9QQ40YAg0OPg08ik3/jOBFgGseJJBEJQeN0cR3JG+OY4LyQeCG4I/GCQ4cjSf8417xnheANvIUGMPoEjwSOjIdTQIIcpwCnn3/jYBPoc4olJGeUoIJdHzgDzJ9AlcDR7DQjIUASz/mYJA4Qjq9JrhLg4WSBF7PrjL6Yg9l1Zwd27poEDDjFibAHgjga6BtwyTU4hQTIIRUg4Dl2b5GMIfHK7hTmx7pw2FlHaJxdkivQxARKBC8UX4Pb2WEHnFUSKuwSYg3g3qzFJAeYD/Thuw/t/oC3SMqZnYo47zi9jAO/EGyYkyvQwTxyBUeV73DUuN7wAMEnyXiTrOHakAJfgMQpTqqZO3jlsRWhlXF23JAQ4X4cYmSJYJcAh0KNcfiRD3bHu8IJwa0JwOEJaElCzsgj9oqkHoCDTzKMuVJM4z6ccYIHrmfNZvegM0A7aG0SpBQrSC6Bb+4xAQ10IGB15fhCM4ww/MMckCXWzG5Us1ZoZk7HoD8p6JhiGboB/jMBtx24niQKgR3X0j+yh9OPvkGWWSPf0x/J6b+TmLYDfIwes+8mRleEVNRjbJId4JF70E08msDoEwJCghITKKFv2ATB7wRvwTXkmOIGNgcAL+DAftoC/fOpxYyQgLFI0pgEF2Oh89iNGJJMEEiSWDS4Y0ekKZqhswj2jc4BXyRn7LsNSYKya557TR/oN3Q/ssDuPpKD8GpI83AF6F4SnUYvIGMkbkPST+hJ/EOupyET8B82BfoYWpFUQd7hRYJqs0YaegG5go4kJSlUmmQxRQUSnSEF+OhkZB9byj3gjURPcDxveNgUGMEh+OPxHR8q1KEbSIpiS7iX9fJv9NjHAOM461SKhR9KclO4M3aZZBOJCLMTkntJuBneR08RqOOv2+XGufE763KVJA4OoBU2w570R9egk0OiFYAd4hrGxFYbnMMjbMwwBTB8G3yckBJGBvAJ0O8mKUEy3RRzGANfzPAcCT+ji00yD12MTkVmaCT+zUkA9DUJlpA2CpC8ZO4mOc498G1IxTs7gE9oZYpo2B42wCBD7NK2n/TDriFLzsC8Sf6ZEw/s8ifxxcYx/o1cUBxAP3At9sYUe7gHm4c+w16C++DsD4A9N3oMfkOG0b3Gnhu8gkNk0ZUOgWam8My6jI+NbWGt8DdFQbuPDU5N3+gnbCy6zhmwp/Ci8YFYD8Uy+kJfmNMCjAE+jd/wPwXIGslRuz8ID7pK3OGjYAPwZ7HzZt7IOvPmd/rC9+c3GvqMwg98aZd1/CJOA3H6C/1ndAUyTHISHkdv8ngi+uA3rmFuFAdDiiMA8EuRy/gH2ES7/wENOXlqfscXIKHtLFvoMudkJ36hOaVEf/jOJhkMfSkoY48A6I/8m0dWIfvEGqyDOYFvZAz+4VoAXseW8Rv3QBtwDqCj8MGN7we+8DOwW+b+4ADeRy5o8KrRs+AKXBiZNwUNVzoDeSU5bXQSNIH+rBf9T2GC75k7ssi8jV/0dwB+gQ7GFya+YM4hrRndxMkVY4/xtSneAOh98Gj0JP0SZ6PjWbedV+0NG8U6P8avgUfgGWMvwRm7/p1P8tuBGAO6Gh7AvtMHgE8DnsEBv8FT6Ehi8Q8BPge+KjxgYkLndfA9BQrD8/ADsgTOKCYa+WZccnEhxcEAuKJ4YuZLQ2ezBuO/mP7Q/eQfggN4iWKD2QyIz4usgC82gJjHHPM9dsfVSU7WDB8YHUbDZ7A/jjU0AC/gYxo7gL3C94VP3BB6eGvptNsr1uh0wbI6HTaWLnyTyJFkdk48v98ln1yHIyV1vIT6RNTgCxCXoqbUmS9i6VDMpDrevZfunr+uly8u6tLxzho3O49y9G6nsD3NhuzQvPuBa3hMk3NzdW1wjQLECoXxXKY0XfpofOeMuuoVVnu8Y6llpzKK3m2swnitVhhv61ofChX/KUCc2u+tdy/fv5/k8JXTajHfW2mGV1LGCbXVceUQHb54Qi8fPNapI/u1dMUMzVo7V3Xm9VLa0VWUf3wTZR1dV+2X9tf2dTO1boKHFq6eoNYrByndwErKP7K+ikxurKZze2jByjnasnG1rl6+4PCL1xzZrOrzeyjpqIrKMa6e+q+dqBv3XL9LCwgIeK5bF2fo6PZyOnfCQw+fXtGdUxd1rG1HHYqcUOe+jKvLwdCWz2NRkmmfRdsjFo15T4TrAkRKnf8moU5Z9D1dvJLubNiot/6uY8NgCxAADgvKACPC3yDXfJrfT58+43BSCIrixo1nGb73z8ZF2fI7wPWBgRQz/vPy4beOfwfo+auHOnp6h+asHKEew+uoVq8cqjc0k5pPy6xqI5OoZN8oaj0lqab+nF+rtxTR8vnfaf7Y5Jo7KpVmTcqhGbOLaeLMYhozKb/GjiukIQMLqVPbnKpeMb1lIFIpR77kjmLD92XTK0/lLNZnZmUpnEl5CmZRzdI51b1OIXk3LKwWVXOoQqm0KlkmncrWyK5KDXOrcpPcqtgwm8rVyqRK1TOrerXsqlgqi0oVzKDKZfOoRvUSKlUhr3IVTqvs+ZMpe75kypH3W+UulFM5i+SzxsmjdCUKKH2lyspcv70ythii1K0mK0GLaYrafJK+bj1Jn3eeaQnafH3lNV/hfGfr674z9JXVvvGZp6i9liiWxzLF6r5YMT1+sNocxe7+g/XveYruMVdRPWYqRvdpitVlqmJ3mGa1qYrVyQpOOo1RnC6TFKfzVMXrNkmp+4zQ92N6KNvw8kraJaUSNIqllA2TKF3DdEpaI7ViVEioyOXiKnKFuIpitdiVEipW6QRKUT6NWg/qoD2nD+rNW3+LjpYyCrB4INCip3+gXr56qUePHzmaw1haxgfa2nkEsPMNBgpHC+fK1bX/l4D547wS9GFQcZIIWDByBCvGQcDJMklYkvEYcRwXGo4ulX3wZ4Br2B3Kbzhn9I3xJyGDI2u/9kNAEEHQaBwl+jO7VHC0zDwIMNkdSrKMdTkDNCPJZHZXEJzjELLL0yS8cRJIltjnB30J2Ck24OSjGwjaCYBxonEKzL0EIChVZ6AAYcYFFxQg7E4QDgUOmNmpgcNBIsAEGa6AQIHkJc4Russ4XyQ1WBP9u8KDMxBg4zibAA08goOPSdLYAceTApUJNlhLaHbcAgRdJMyYDzTFMWXXLWuFJjiG4Jl+Ca4o0kADk6CGLygUmd32BAgkJVgbfGN22YQE7LQyDh/3UcAI7Y4TAgFO0Rme4BMnmIADfPKsYiNT8B/JIpOUMoCMEaQwV67jKDU75HDY4R3mhGNLUgX6wofm6DVBKjvNKBaQGEKe4TXw4KyjuJfvSapzL/ghSWwSFAQCRi7AK7h2FdDgmJNMZjzmxlygATQnKc79BOHsqIKGBAsEOsbBJ3FCkp5kkTMQkMDjJrCCH9hVSHAPEOCZ4I9rcAY+lBQMLRAE0r8pMLI+cBBSYY6xSZya3YzQmmQdfYF/kifQzsga6wH/FI2Q9+AaCUcS/oav4Rlzqgo5oT8SWh8b4IQGsHc8WoqTR0YHo8tI0oRk9ygQoJe4nvu4Hz0KsMOMEz2mqEzAie60J9hMkcIkae2NhBw2CT5DVyFfH0qO2IHkl0lw0JCxkB47Y+yk/bFhzJ0ECLtg7fTj3wT/2D6TJKYhu+hqgntsCrJE4hW7yO/oNXg9JNtI8Yt+TZ/IF7YoODBJUntykuRbSIkJA+hi7KUZDzogDyQXPgZIDLLJxyTi0CUkY0OSI5KQyLLRH8g4vACdwR0+gXkkDr+DZ/5tlxlXDZ2Efv/Qjko7QA97gpdG8vrv7CTnBA96meQq/YEbxggNbuEfktNGL6EDzOOP2PxAoQY6gxt0MfaHdZvNDSQWSdYja+gRkuYmOY/Nxs4Ed6IGIJlIMorraeg4iv6h8RfQF9hSfCnuRW+RjMe+IWPYAE6kG51GEglaOwN2Fp+T5BLXkqDExzKPDCHpZ5LM6GSSU3xHn9CO8cxJSvCIv+IqqcM4FOSNPUcGwCf6nPViv42vgP3BvjvLL+uCPkZ3cL3dx8ZGswb0GQVacIRNRTcY/Wh8bFe+ArwMfY1NAZ8mkQgdWS/fMwa2xxU+/01AB4Fv5sU84HmKqNgAbItp+Ockxtk1ze9Gd/KJzYdv4Fn4FX3NbzRoAm7hSbus49vjz6BXTbxAw+aiW9Ax+Op2GwOPYFNC4+8hq+DZFC8oeuF7Gf8D/Ulxw2w8Yg4kuO1FRtYMboyfBQ2ZN/rZ2FZ0HnxlCgLECBQyjA4zfrEZh9+xQfjF6ETsDrS3P/OeOZjCFLoVmTNFTObPy4NNsRWc4MOQDP1UQA6ZM7inT/QNsuNK3+HbsZHLxDPIFTYM3of+6De+pxnfGDz+HcB3wO/F5zb+JDTBJwnJx8F/5hSG0eMUuvCVAHQxutTYd/BJEZ5Cc0j+Hr9xH6flnOU9OIA29viRYoI9DnIF5LfsvgR60BShsE/2zR/YYeTO7p99KoBPbCd4M3hBz5uT64xtipX8Bm9+6CQ/PgG+L/rN0A+9wbzhf/6NbLFenmoSkq0yNtT0g92EV7EFrB9fHLzQkH3sjjMg+8ikicuYA8UKYu2PAXwkdJ/hL+wdm0BM/OOG0EHgGz/dWrFOpwqV16mwsXXhm4SOJLNz4plk9BnH6YckOhA5qc5GTf6X4gPNFCDOR0isY+ETak+m3DrmO1h3j+7T3dvr9cuuJuowoaqS+I7QZ57LFcZ3pVOhwLktfX9yoc8Kq63+vVn38J1z+6MwQcHCubBBAcK6z3OJsnTppdnd0umOb1j94ptEjXvUVwyvmdbva99f57PsrwUITkBY8nn78W/acHK7pu1dpkXHN2rf9RP69cENnb91Wfv2b9OudYu1Y8NijVgyUg1me6jCrK6KNaC4Ck2or8WLhmjNyA4aNquX8k5rpngDSqv2dA/5LBmqiYtHavvKedr981rtP3FAF+5d1YX7V7Xl0gHNOLhas/at0q7zh/T0pevH3vGYq0d39+vc4S46c7y9btz8UTf27taxHr7anTa7jn+TQBciJNElF7Q1haQzFk0pLkHjcxatL9uu+ePaPwoQsXWqeBXd3rBJb4PRGaEqQNAwMig/Gg7Pixcv9frVG714/lJ7LOPTvl17JUyYyBFokMBjx6b/71UP+uF+x8kH617HSYh3gfJ791y3npzXT/t+0Ki5ndRlSDnV98ys5sMyquGI1CrlGUfVhyWVz+p8GrOllAYuzifPcRnVc2gmdR9cUO0G1lDjga1Uq19bVfVtrmqejVW1Q02VrlVKBYp+r5z5syhHoe+UvVQuZauQX1nK51eGormVPX9uVShWWB7VymhMk4oa0rSMWlYvqLIlc6pgsZzKVzKf8pbJq3yVcytfle+Uv0JaFS2XWsVLf6s8BVMoc56Uyl4ymwrVKKG8FYsoXb6MSvZdMiXLlFSps3yrTLmy67v83ytTge+s8bLpu4rFlbt+c+Vu1leZGg9T4jq9Fb1mN0WoZwU7TforYssxit5+quJ0mq44nacpRqepitphuiJ1nGG1aYrYYZLVxilSu3GK0sZy6FtPVaxWMxS3tXV9qwmK1XyEojceqigNBitqowGK3nSg9f1wxW07WvE7Dlda34EqNNlTFRc2UYkp+ZTFM76SN4mmRNVjK06lBIpaNr4ilo2nSBXiK2rFBIpZPpFiFEuk1OUzqetILx29fFoB74IcT2AKtPjobYBFT9pbix+g7+88YXgE4JN/Y0wIjAgKCFJw0HB4zPXwhrnn/xpgVDGgJilGkg0DS3KTnbwmiYyjRwIMA0zgYHaCYlhxZEmCOht1nB8cdJJ2BAjIFMkS46CHFki0mXmYRtBGEozkMgGGcRZw0il8ODu20IikEzuHuJa14uzhvFJQMIkOHBTnZ/FyL0UNggsSRGY3Bgl+ggXmwr04n+DNlTOMc0QyDqeFsdl5YpwRxuJvHC0TcEIHgghwHRyQiCDA4nrTcHZJmJP8gz9DAxSETMKURjKf9X4q4ByRXDQ0ITADb6FxpqEbeMaxA1cELCa5QSKLv00gxie7ppk/PMt3OKw4euy+RuebhC99EfjDgyEljsAZfM/1pj/6JuHwIYBPCEjgCUNHEpQkauEJdAX8RnDAb8yHxDsyaAfmwLxNYYDEMmtkJwzz4TsCGRIS6CW+Rz6YM2snAMJpNWOYYpQz4GizS9QkpghewKfZhWkPBOgbXuM7ZyCQIdkDvdEH8DmBt33nNXQkcYMOhcYkhMxxfAI9EpTOTrWRWZKVJsmDfIJPw9vg0wR4JtnvKqj9FGCuBIKGXvgFJCuQu+AA3eZcgKAPeJdEATvPCUoMf4W2GT40BUkSJ8iJSaKT3CBpA//90wB/2hPRBEPofLPTLzhwVYAwJyC4lz5MYEWw66w7wRe8jD4zuwidG7oXG0DRD10Z2iQo8mWKWjT41MzNFaC7sJOm0PmxDbkgAYceBNAFJBhIQBoc0DcJgJDWwD0mWUWD/sE9ux6A79DFZgz0BLgKjS4mQYf9NrsRkQMSYR8rXyS9SJibBD5zIBkVkhy5KkCwuYD1MHd0H7rpY+WIfsDHxxQPkGn0pEliYr/RAx/rx9jBFP3NvND15oTYh4BkHj6LSYpTgDA8gAygJ6A3uCEBSeIIXWzkl8QMG0hIspIctutiEoMU/ENKcHDK1P5scOZBQQN9/SFAl2AbjF3ATpJwM6dhoDuJZHDM7/idJilmB2wUxTDmzVpZM7oCH4r7oDOyhR+DzSKxiK7ArwJ3yD+2mWuxpa7WbOyP3Z6Da/QAMop/Ybfn9O3KnqPTuAc7znXoMuZLIsyeaGXzgClAYq/x/4xvif+Mj+3s05kkt9mwgZ1gh66x05yswzYbOSGBFdL7Ev4NwEfBJtoLkPi/rJU1sYOYxi5//A/oZooPNPw87CZ4IRnPrnS7v/oxDTqCS+N70x/0NX4VvhAbJULjO5vCqjnZRQKXGMnoBXiE9eE3wc/YAENHAxRc0EdmfNZKgpG1GkDe7PLONcgscwegMfxrijLYNQpqxFoUEgwPsXmK75gXsmIef4OPAj8anx9f1xStaPjvyDf8/imAHLHxAD8OGaFP5B96u/J98d3ZEGdsFvgzSX10P2s3v5mieGjsWUgAvjnlhh6GTvQNfog9Q9LJ+FsUP818WJfxi9DFFFqN7viYxoY7cO6Mn+AAvxD/2vhJ8AK22vkkvwH8D3SgSZDTiKMNnp0ff4mtNZtH/i7AX9h2czIB/Ucx1hTUkAniGDM2dis0iXvsGYUDU0x0bvAx+sXVRicD4AV7Y04TYUewHYzPbwC+i7FP2B+KVM6AbCKTZo3wPXbNVfwUEjAuBSujH7A/+D7ofTeEHihAXF++Tsfyl9fJzzkBEXwB4lSU5NoVOYkO8filKCl1KXJKXY70vvG3KUi8T2in1MmvE2nH5zG0J3UWXeg5SHd27NStC5O0bnMt1RrTXJF78RLqVQr+NAPFBwoUK/SF10KF7zVX4XvOVdheC/QZRQLr+8+sxmcY3+UK42P1RfO1Gvc5ChOmIEFfa/R1r3kq1bmN1vZMqd/6fKnNPilUr0djx9Nl+N0xrtMJCOeXUDsAly7grX59cF0zDixXz3UjNXXTPJ0+sEMXdm3U8gWjNW7WIPVdMVo5JjRUkQmNNH22r1YMaynfye1VZHY7lZreVsMXj9HiRZP007JpOr19o3bs/FlD1k2W54ZRWn56ix48f2wJnzVWCHvIUMMvn93QlTMjdexAM507PkU3Nv+i8x17a3fSDNoRJppOh09s0ew9bQyNLke2WkSLdtDQoh80Phg5qXZGSqLTHyhAnAwbW8eLVtGtdZsU6PeRBQgMB8YPw4lh45PvcAivX79mCfce/bJ9ly5dvKJbN2/r542b1Lx5K2XJkk1ly5a3DOQ8y9Gl6k+CmVMPAQqwjHeAP8lnywFVgF4EPdSZu/v0w09DNGBqI3UfVlpNfbKo5ZC0qj8gkSp4x1aHedk1cEs5dV5YUNWGplOl/hlUY0AhVfSpo4Kduyhr2wFK13a40rUfpIxtfPRdw7bKXrGGchQuoqx5v1f2wrmUo1wRfVe5pNKXLa40BfLr+7wF1bBcRQ1vUk8Tm1eTd63iql0un4oXy6cCRQopV+GiymoF/NlKF1SO8t8rd7l0KlQ6pfIVSaLMuRMoTf6UylQhl/LWL6dc1Yordf5MSpwthZJ8l0qps2WwrsmurAWyKUvBdMpcKLWylMysnJVLK0/tZspRp73SVm+kxJWrKG6laopZpYViVfNQwroDlLzBcKWsN1pJ6o5QrLqDFbF+X33d0MtqPRWunoe+qd1LEWr5KGqNfopTwwp8agxWXOvfMWp1VZTqHRShcjtFrNLO+r2TYtXvoXhNvRS3RU8latdB3w1opeqLW6rV5tpqvLqwyo3PrFy9UitV00SKUSWmvikTVeHLRVfEsnEUuUR8RS+UWFmrFdDQWeP0680behdkcbDV3vkHKshqgb8XIPga42KCCngFw8+uAirQJKQJ4HAuMdoE1FxreIsWmuDrfyOQTOA4PMEPBo5EH0ac5AABknFqTeDO2jGK5qg73xPwsKPGFQ4IKNmFRTKPhOen7KDgOZpm5wwNB5EdE3xPMI4Dat+diEOI024HxrbvwCGJw85ZAl/mbxxjkmTOR6TRGcybAJWAHXoDJIOYhwnucFhdHSsH2MFBIGiCAfBKMp0gBoeM3Sv2hBh0IDAP6QQEfZpHsDAHGnQM7U5KgLURcBmnDdyS8AvucQShARw8e4ICZ9oedIUEFPhIIpudPMyLIA/5hI/gTXtRDOeP8Sg6mcCBQI2AF9zirJkkLUEtgZnZBeYKGIPkvaGpSSpA9w8BgSfBkdmZSh/sTIT3AOQD59YE4jQCP+dEFrxGUsEk/iiaEczA58YRJViAbgQF8ADfmcQGAZDZYcp3JMuc5QEg2LCffKGgZ08qo/uMnNMISFzxN4lm6M16TZDNbjLuJ5lg7ieIYZcd+CDgMDzHuOx6dNYNBIUYd0Nv+keG7LtzKUbY8cnvoSkWhQYIyDn+TYBO3yQaSA6E1D/6jgKWkWXu5TE78A9FA05a2ucb2gYd2QVo1o5t4tn/JhFDEAffhqQvPhXQJfCeSXyjm7AFHwqmSCRQ/OMeaAefmlOlJB9MkZHfSXgQzJsgzwD4JDHAbnEKTeZ6eyP4Z248Eo/E3YdsMbYdvWF0DH1SDAkJdwR86FV7UP6hRr/IFjKLDoIvzM5a/Ad8CnjfrAm7RSLZGQcG8Fu5x558I2ESEh2QNbsuRm8E9/JnZyCIpnhm18Wf8ggmkxQ3iVaCcpIjJoHmCqA7smIS4/gZprjIb+xINCeoPqYxhw/ZAGcgiUNyx9gXfAjmDw0/FdiQYPQA9McHCe0OY3QwetUUREhK2E+tsbMUvqOhi0km8XgRe1KR3dL4L9jOrl27/pHcxOawczO4xBeyRX/2Qhx6kcRmSIk6A9ghEr4mYYffxgkDk0BEzti5Db35neQ+SX5nwD9h3vAkuhFewd6Yd51wPzoD+0gij3HAM3oC2pFYNMV1knAkuOErO/Bv7LnxLbkfvWd0MHKKPTcbImjwuXM/RncYHxs/xO5jmw0A+IbYL+Njk4Q19h7+QHc66wboypoNL8DfFBgNb2JzwJNJgqK7nfEJ3Uzc49z4Pjh9FFpgjpzINHoEvkSXI9vIMA0cote4xp6wBecUp03BEBoji4ZfQ9PogzHx5UhmU0w3NCIuMUVyGv5QaJKdAHRiXSamwO/DrtiTg9gjEu+Gn+E1fFIAfQ7fmRMUXMNmLU6aGxsGbcxpWBM7YEu4z/iNbPRCTxufA71CcQfdj902/gu8gc+APqMgZsZFxvBxjU7k9AWncfiNhs0Irf/uCuAh+JyCH3SgTxLM9OmsQ/HZkQ1TgIL/KTybU+VcTxxu5yXm/ilxpR3gBzZ0oP/gF3Q9cvUhXkDv4iMb+sI/phiMnkRPGxkObWNN8Lwr/LgCeIQxnQsh8FlwRXK+Ry8ancQcsRXmdA763O6n8ptzXPypgP1ifQYv6GT0seF5+BDcG16Br/ElPwToK3xFsyZ7g6bI0Ic2HmCDKdoZPCIbxOZ2nU7R2GyIwvZgI5xtH8UU+Jiih+kH/wV9E1qgT+QUWjJ/GnJJvPV3fI//P0LAGz9dXb5eR/OV14nPYupC+IQu3wFBcvpk1OTaGTmJ4wXUjoQ1yesIv7dIKXUxcor3SW6rcQridORk2hMunvaHjaFTibPoTJNOurJhoc4e9dXEpRWUoZ/n+3cu+FBkcHFigQKD92JF7jlVaboNUIHOPZSnYzel6txHsTzGKprnVKtNUZRekxW51zRF7DVHX1Gc8Fz6vjDBI5ccJyOWvf/bd61idx+ndp3Labd3PN3rF07rPFOrSrcWiuQ55/3pitAWICy4/+Shhm+apowjyirZwCLyWTdWF29c0pmTB7Rk7lAtndxHy1ZNUdsfeqvxdA/NmO6jRYMbq8/4tmqxoI/6LRmqZQvHaMX0gdqwepbOXTylHacOqN6cHorvm1t5JjXSyuNbFBBMgt+An98r3by6Tsf3N9GxA711aukPOl2nnU7Gy6C9n8fQvq/jOU40UBQy9IFWlyJaLbxFO6s5CknWd4ciJXXQ+LRF62ALEOES6sTnsXWkaFXdWLc52Pl98ASEcaZwpDCGOJCLFy+xnIeOlkPZTKNHjdOxIyd15/Y9/bhhk5o1a2spyBLy9PRx7HbmpReUZgLfvtHbQD8FWe1tYICCrP89D3isQ1e2adJyT/lOqKWeoyqqRe+cato/tRoNja3mk+Ko38Zc6rm6sMoPzqC8vVKqaL9cKupbXVk7dFKKFoMUr8kExWs2VUlaTFTyxoOUqlonZShTV1mKlFTGfLmVqVAuZS1fWN9VLal0pQsrWa7sym4FAM1r1NLIjq01qFlNNS6XXyWKZle+gtmVv2Bu5S1URDmKlVT2MqX1fdkCylMio/IXSaIceePo2+yxlTJ3MmUslU15ahZRnioFlLl4ZqXL/63S50unzPkzK3vhHMpRJKuyFkqrTAWSKX2B5MpcNIvVXxHlrFhGOauWUJaq+ZW2YiElK1tJicvUU5KyzZW8XBulKN1OSUu1UbyyzRStfD1FrFhTkSrVUNQKNRW9XG3FKFdfcco0VsKSzZW4pPVZpqbiWcYhXqUyilOxrGKXp1VQ7EpVFbdqbcWqUVtRq1dU/Cal9P+x9xbwVR1b3z+3hjsBQgjxBHcJJDiE4O5upS1tcXdtKcXdIZ4QnOJO0eJudb11pfjvv78Hps/uuTF6e//Pe9/3rH5WTzhn79kza9Ysn9nVpjfXi9s6adR7nTX0cEv1WFdH4XPLqfhgT7l1zKwMTV5Q+nqZlbFaTuWvGaCGL7ZVzKYN+uarb/XoN8vJ+d1yrH7/RQ/v3n6cTLpHEuHx7hZ4g6AXjgHOGYY6BhsVxFRW4dBQfUNgyigA7nNWPv9NQCUZATIT5EOhEryFFvA+4zbODUYDBheBf1O9h1FsKpv/E4BjivNGv3geSFUkwXtTsUblIIEYY7AQJLK/mAxjC6PVGCYY5FQUEexmLk1lIAYRW6RTqpCwA86nqdDEOIBWydGBwAmBdBOEgW4E59gmC39h+NoNVZwZDO+UjopAjhHIo7ICIw4jmHlkbDgRaXEcCTTY6csn1ZEmaP60gLzFiDUBCubEXvmcGuCsQkczlxhuOFsARzjhoBkHFUeMqmmeiYNDogPHATqaii4SE2aOoA1VKckF0FjHJHV4BteDOMXwWmoODvcaZ5O+g/SPYI5dPuDQEDAy7bOTyDnwRP8IqGB4YwjDI8w1fWds8Br8wr9JVOAg0hbjJ5mI40ISie9wjmnL7GowgKOH4jS7BwjkEPixX8ffBFxMcg5aJHV8g32rMf3j2TgrOOJ22YJTSX9xsAmoGCMeXkHemvVqAB42c8G8Mj6ehS43AD1JAnINSLVQStvOnwZw6ghYmHXJvLHmU6pKIzmBA2OcftYTQVuAfjGX9urOtCLzaD/eATnDc8y6JUjGfDrP898BjMl+TAWf9mRIckCCzATnjHzEuSTwgtNmDyIhd1n7SQFyHp6mip6gnF0X2BEZSMAltX4h90kGmMARc0WiMCUdRgCEQIcJfKSGyGL4FX7k6At2EjA+IwvQa/CFoQH0gddTSoIQOCJ4avqAHOSe5OhmZLFJAiGTCPwklyR3BpIl9qC1CQYzf2kFxsvzCGCYdYRDjWOdkkyF57ArjHxCXxpHH3mJrDLz9zQIvQnOPU0SBb6AP41Ogs+QY3Y59DTA3LOWTaKaMaKz09ongiz0wYwJ+Wmql5FP5igW+suuKPQmMos1a/iNuWRnBPzBTlAji5Gl2E7J2Q7MGXNn5D3PwPZCVtr1XFLAvfTdFARgV2JTm74bILlkeJy1yTpxbpukG7xPG+gl+BLZQnKD+1gbyBuq/QnO0k/4jyAUwS7mz9iDrA8CbiYJAvA8Z32OniV4bQJlAElTs7MB5Hrno5ycZQfyE17medjYJAiNTcNcGhsbu5Tn8j16w9kW5H7GYpKizCGJVHtCkrWK/WJ4jfaQkWZ+4WGSNNgIJCqwOQ0i8wm2MUb7mJ8WsKngQ+NHPA0aW98EALEjmcO0tsXaojCI3SSMB/4zBQTYGwSJSQJzLTYGQdy07o6CP7APzLMINlJIYZcL8II9oIn9D38D6GrsVPMbdhK2uD1oDB9iG5k1DcIXFMKZ57C+8QHMGibBixwASHSaJDfjQ46x3lhTJvGF7QBPmOcy36YCnPtI0JgE518BfGXWpz1xztqk+MvOV/wNL5qiF+iCzYXuN+ufa7D1jQwB0RNpLbhKDtCt+PomiYO+QcekFnTH/0COmHUKr8EXAGvTBI9NX9OCzBN6N618CE3oBz6BaQOZjK2enI5Ch8KHhgfgS+hoCiTwK03yn7UG35gE1b8DzBO+uEnq8lySrvbdkPAh+tDum7Cu0gL4DMhTaMi9BpkHijecfQw7ICspwDK+KzYc69v+sncAvWnohtxOKgGGXLfrVXifxLBJpKUVuMfQCh6DL552F4ULOPXknj7etkdn67TShWfyPnkJ9b/ugAB5OfHRTN46/4Kfrmb015lcPnovr7dOWng2m68up/fTzRcCdCuThdn8dTmnv45l99ap5/LqSrqcuuBRUpe69tP1VcO1c2Mz9VzUTm7jZindiI1KN8a2C8Kxa2G9nhsRq6BBE9R1UBu9MbSaFg0tr3mDymrSkFANHdZIrw9rqVeGWH7E4ObqPaStdV03NRrUV+UHj5Tv0BnKPHSF0g3jpdIkOLZaz0lUuUFDtWxIMV2ZkFOfTMyshGFFFDbgVWUYGal049k5YT0/DQkIZMuBKyfUdFFf+Uyuo0YrXtYb+1dq2uEovRw3XjMipurcO3E6szVaS5dP1Jtzhmj59L5aMaa1ZrzRU9Pmj1B8xAyd3RavPRtXa2LkZL224S1N3RehoVtmKWROO/lNbaTB8W/p2qcpF71+//0lnTs7UofeaaP3FgzWhXav6GK+Yrps0fzE8/l03JqDqzl5Obi/3s8YoJvPB+iKNVdnrPk86ebtmMOzOX10NYO/zr7gq2PMcXZfa85Bvz92TTj+fpKAuPBMfp1r1FGf7j3k4KGkIMUEBAIHBcgnSgzhhpBB2JYtW94yKourQf3Gmjtroa5f+0Cfffq1ZWSut5zGfpbx9YalTM5b9+JwUeV+W48eWkbqw7t69MSA+/nODzpyaadmRw/QiFktNGh6E/UcW0k9Jvur3/ICGruloMbvLKZOC4MUMrSQaowppnqTaqvSgHby6vS63DpOVO6ubyt/jxny7fGGgjoMV+Gm3VW8XjOVrlNLJWtVVom6FVSmaWWVb1lNJcIrybdiEZUJKaNO7Vtq2Ou91KtjE9UiWVC1iMpV8VNwFX9Vq11JNZo3Uc12bVW1WT1Vrl1MFYPzqVT5HAosn0eBFQupdLXCCqlfStUblVK1RsVVrWEJVW1QysJyqtmksvV9JVWqW0IlQn1VuGJBFQn2VknrnsrhZVSrZbBqtamgytZnycY1FBheV751LKxtYS0+a8urbnUVqhcqr/pV5N0gRP4NqiqwQTUVblBDRcJrqXDdmipSO0SFw6x5aFRaxZqVUPEWpVS0WRkFNSkj3/rlVKh+sArUr6rc9SorV4My8u9eXg1mhmnA7vaafL67JpxtpwH7G6l9VLBCp/jIq3c25WyWQVlrZFexpuU0cMpoHT56XF9/+Ll+uPWBfv/iYz365Ws9uvuTxVDsZCHx8Pjl5L/++ptDcVAZgPFB8ACHncoNnAwMXwIAXINih5+4778ZCIpR5WuMYBxUUyGFUYYDYgwRDFkUIoa8XQETGHraqsi0As4C2yaNIseYI6CNkWeMUqqiCGgaJ45jBAhUsuaZH5xjAlcocBxaqivM/RhpxjnDSMAoS+tYCCqZIAgGD0Gs5I4u4FkYMlTE4PxzD/3BKQa5326oYtRSGZhcewBtIttwynByCGzSBg4IDkZajB0C0QTpjbFH33BE01qN6QysC5x5U12IEUdFZmpneBrA2SJwx71mLKb6BceJJJihEY6YCaYRuOvVq5djfrkPR5z5YReJSfowzwQQkjNCoaWp5ud65odxREb+69nLzmCqqo0TwJwSzGEOcbQwGgn2cP44zqRxWJAxzk6OCb7hBNF31hfzwZzSrukXuwg4J9pU2WCc4ijiZJstzDi10MG+pR9gTSDPTOUWjj7zzg4F6Ex/OfaJwIFZe8iBpI5vwGk2RjJyhHnAuWbt4YQR4IG/eRZVQCRJkKeMhXuo6jFOmwGcAQx9e2KDe5A/0BGawlMEE3EuDD0JIKTlXSNpAcZveBGkgh8H2cidpACn0exIAaEZO60A+gXNjXPEmKgepv+pIfNgT9LgaDFW0xbyOC18+leAgD7y1fAK6wg+TikRw28cW2NkMk4svAofEkyCd+1BJBxOZFFSAL0JmLEGcERxhlln8JwZPwjvoRuQ6SnNEfqC3RImsUbQgTWWUuIZXYijbPQktKBCkHVIMp5qUuhi+mP6An9iLzAv9j5BHxxXQ1PuI8iYktwlEE4w1SSwGD9rNrmjjJDFBKCMLIbfkG0kANMC7Pw0wTkQWUzg62mAMTMf9naQ4akFNZHnyAWjE9FLBEUAArHocCM/oCG74ZJaN3aEDshbAuymgCQtwA4OE4jmeciElPRIaoB8x64yyQA+4QV7lWVyAB9ho5h1BX0YkwlOk9gw+gD6EOBEFrN+CFIRWITXWHsEmZHF6CnDh/BsSoEvbAp0mtkZi74luIssTmnNAex+wK42gXhsDhLwyFnkPzId/cU1Rp+ge6CVvaocgDdNYo21h1xgHZjEO3oT+chuF7MLj/XOcYU8BxqagKj93QsGjD43VeLQjOc563OCafCWWffoYGd9zk4fu+xATmBjwz/wAslQY0+TTEDHMTfIF8P/jMOZP5AHyE1jg5KYhU+ZZ6PDCbAja01gFZ7geUZ2EziDFswJv8EHBvk3/WKMaSlmSQ7og73oIjXk2awJEj70Hb4xc4PvDr3NtcwpNMMW5HvsZmPvgdAG2mOHIN8Zh2mLtUQyzRRwMD/wD/I6LYAsRCZyL/MEr8CXdsCXoBLa6BquQy8aW9PQhTETeEcu2gEZic1l+APEtoP3DDDXxt4D7f1A1+Eb8HzkF7yOXQVNTCIf3kC2Qhueh7w2STX6hS2d1gKipAA624tdwKQC2vA3vGh2tiGj6C+FDMgX1h39oC2TPAQpknFO+j0tcL/9nSvIHQrxUkpsQC+SY9jp3MN6Yf0ZOwL5YXxnEJ5GBxl9lBTyO7QnIZhWHww5QkLVrHEQmYfeSg4oWsDeML4ospDYBuNlvrDvjF8Mn0Cbv1qUZgd2cdkD88h5CjTYjY3eQWaxLux+G2uY8aVF30IzZIbRMfA89hLyM6UdlwDzRpLeHtuAjsgI1hj8x7rDVjS7Q7gGGYx9aAdsLJJAXAOiL/HLnsZmwH5DXxnZgY6B19M6DzwLvoau0J019DSIj4FN/jR9/j8VOL3mswOHdKFRB118zv3JEUx/TjwQgL6S3VenMvvoSCZvncxtYUBBHQjOr9018mp39bw6UDa/jvt56Eweb13K7KubmQJ0Nau/jmb30WkLb9LuC+66nK+UzjVsrCNTwrV0WXlVebOfnh259nHQ35F8ePyuhn+MilfA4Eka0L+u3hnqrktjs+rKuCy6ODaLzo7NoffGuOnIyHw6MDyv9g7Lp93DC1rX+Wr1kGKaMqSqXhvcQg0H9lGZQSMUOOxNFRw2V0UGTbS+b6LDYzz0/qScujk+s1YOKa4KA0ZYfbCe7Xi3RNoSEPesuX/32hmN3TxfY7fN17wDUXpl/VQFzGol/zcba+rWJTp77pj2bl6tqIVjterNV7VkVCstGFJfS8Z21NKpryt68WS9u2+TDpzcp1eiJirPxDoqObeDRm2bpzn712jkljmaszNSlz9KupAKuP/gvj7+IFKHE2tpz5h6OlGnga7kLa6bz+fXjcyeOpnj8Yulr7NDJZO/Y27O5PW25qqg9pez5s+aO+bwQMX8OulvXZ/TS+9m9NKpLD6OOWfuk0pAXHy2gC626q7Pjx7Tg2TWQbIJCJQpixhlb5wdlB4GXv3w+paxXUNh9eopJLSqunTqrq2bd+r7737TzRufaNOm7ZYi3qPPPv/EUjQ4K/f06OEdR/JBD+8/SUA80k+/f63D5zdq+poX1e+NWnpxfFV1HVNKL88M0Pj1fpq620+vRhVU/Qluqj6ikBpNKafao0IV1KWOcjVqqyxNXla21oOUp/1AebXpq8CmnVW0biOVqF1D5euFqFLDYAU3raTKrSxsUUFlw0upaEiAKlYvoRat66pT58aq07CyilbxV0Dlgioa7KaylfIoNKyoGnRpqeav9la9jk1VqWaQSlfIomLlMiqoUm6rjUIqV81HobV9VSvcT/WaBKlhi+Jq1KqMGrcJVvNONdS8Y02FNa+kCjUDVLS8u4qUy6fSVTxULczPuq6EmrQtpTotSyu4cXmVDi+v4mFlVbxuaeuzlErUK6FS9YupTMOiKteoqCo0LqZKTYqrCti4hIIbllSlcOu78CBVrO9v/dtPlZv4KKS5t6o081VwEz9rrIEqVreYgmqVlX+d8ipUp5S8GxdRhZdKqMOCWhq5u4Umn2yjye+11djDbfTa5vpqPNN69kvu8mriprq962hRzHJduXRVt06d14U9e/XF+ZO6/4MlwO//pAf3fne8iPqhNZUYEx9++JEjWGde6ksgiQotAstU8uLcUXGLQ4dQhqeM0Zaa8/V/KlDxQHDeKEqMP4IWAGuHahMTwEAxE4jCETPBI5RjUhVqfxdgNGAU2BMQ9MFucBLYw2AxxqNJQAA45gQ9TRU2Rh7VQaa/GDbGgSOoRbV9Wio8cSyomMEB516qNOARe/WSM+DsEUwnQGscbBDjDwMFY998Rz9xPJwrK5IC5BvjNS+SxBAmKJBcYMoOphLeOCM4CQS//6qx6cwzGIAENZyrSJIC1hU7jAxt4C17JRBrz+54sD5N1TKBEXaYGCOcuaQqjOtN4Aij0ZxxmhQQHCWwZHe+qNylAotxpQQEaXGqjDMCn2Lc0w8qalgzIJVbGNYmsIBzh7Fn9BOAIWyCJjgwOAYkoggWMbcYotCXawjs4TjzPcFJ5g1n0gT8CEYRkLCvT2QXuyfsPAitqapl7Kav8CBOCG2btpJaHyQIjTzgk3WAEwMQSMThMMEXklEE043jAxJAc961wDhwkp3piXNt+gcSDLTvKMBhNS/L/3eBiikTzAOht6kQSwpwoElem4pU6Abvk+wBcK7MbisQXkWnkNQgkZYS4gDZnWF4xqwxkLmDT/8TwBqzV3qSrOLoK3RfUsD3zIH9bG1ztjXzwjpnbs26ZI6pCE5tjXEv6xyeQkcRqDQBIIOsLZxn+3pyBuiNjjc8SQAqtWQva9J+lBH6hEAeASNkG0FUjvgzwRP4leQS7ToHTwEcVpx60x7rj/aSutYA/EOxgNGF6Axkg6nodQboSb/ssjitOyDQu8yJkaf0L6lq9dSAOcOBtwdHoGNSR8IZgAasPVPlCg9RWWpkN/qef5v20J8ESZ3XTFJI/+Ghp5EPBCThF8Ov/+4OCOcEBLoX3klLFS+BBPsOPeQzAU3DuxwXwVzxm9EJJtlCQAH+QUbDn8hiAq7G/gFJkKZU6co6IJhj5pN1QMAnLcdzYPvAiyZYT//QbyTwjI6k2AdZYfQJNh32m3PwiICyCZCRVCFois7A7uE77DHsA2xbswMSPoEXsYto0+ggbAzn3QVGnxsZAb1oE/2Tkj7HXjDHzBnAVrXLDmQWx6DBg/AQ+tkEoqEr9i3PMDSg7aRsbMaMjjbPxl4x9DT9c6Yn19jpib3K/Jk2nJG+Yk+kJE9TAwL19kBsSsh8Y4Ngg6JLCaDbA2AE8cy8gxQoYLMRGESu01d42tgEjBebgOS9M/2wUUhcmQQEfJnWHRDwGuvOrGHsZnjPufjBHCNpT4qQkGAtYieZQCnzznXOSXjGbj8uEHS2l0ja2e1iZKMJPuOnEO+AZswx9hJ2MXxs5hy7GF4C0N32BATXkDBGdv5VwC6C54x/A51JnDsn1KCJffcz1yFfsGUNP9Mvxmr8LhC6J7cLMK2AzEO/GZogk6F7SnyPHUKC19yDrYivauQ4CQx70gUdgr3grJOcEXsCeZTWJDk8hh1gt4ORXSkV0tEPAuRGFkNTZCPjpT1sKGP7ok+SShj9FWBNI48MzZBL2EzIPyNXkV/IC2M7Mi78lZRsIwPQ3p7Eou/IXpIaqel85Ae8bmQ+z4cG6Cy7zEf/m1gDtisJPmdfG3lj36WIH/i0u4jQ6RTKGB+IuUJ2GN8qNeB+4lkkNqEpuiCtyHwQU8GXTymm8d8CaUlAcBTP5ax+jsr43Xk9tCvUTbt7ZtPOwZm0Y4SFwzJp5wDrs0dWba+ZWwe8PHQhq6+uZPbT8aw+Op3DVzezk5QopOvpvXQhezGdrRKgPaPyqfesFso7aanScQwT73UYn6h0o9fJfehsvTqwgXYMd9e18dl1a2JO3ZiYS9ctvGY+x+fWlfE5dXlcLl0en0cXx+XWGQuPjS2g3aO8FT8iSEuGldZbQ6pqzIAwvTEwROtHBOjihLy6Mcm6Z0xmvT20ggoNesvxzHTjeK8ER0KlnoBAH3z30/f64JtPdePLDzV/7xoVn9ZUblNqq03UMC08kqB5+6M0PvZNLYucoYQFY7R4SCPNe72GIid2VdyicZoTMU1TN87RisMJmrZrhSrM76Ks40PVbOkr2nxqu27+82N9+M/P9B3vgUgGfvrlA116d4D2D82nQ6X9LboX040Mnno/s6duWHR/L4ePTmTx0dXM/jqfzVf7fQtoe+3c2tkzq3YOfDx3zOHOQZm0p3s27QrOo925PXQ8s7euWNdz9JadF/6cgOihz48e/2sJCBQ4iPAxjvGQIUPVvEVzTZ4yUfMXzlW7Dm1VPzzcErpLLOfgB92588ByEL+zjLRv9dvt36x7ebDlbD+0Ph34UA8foJju66ffP9HhCzF6a01H9RpbWm0HB6nbxCCNjCiiN7cX0eAYL7V8I5fCx7ip1ZuBav1mOVV9vbh8mhdV7rqVlS28gbI1bqk8TVrKq2FjBdatpaLVKqhUtRKqUq+U6rSqqPqdqqhe52DVaFlalcKCVDbEW9VrFVeLFtXUtFU1VaxTRD6V88u7Sm4FVcmikpUyKDTMR61eaqUeo/urcffmKlfVU6Urplfp0EwqYS2ekjULqGIND1WvU1B1wwuqYRMfNWtVWC3bllKbTsHq0quOur/cQO27W0Z8k1KqVM1L5SrlU8UqbqpRp4CaNg9Q63bF1LhVUVVvXFjB4YGqWC9AlRzJBF8FN/JWSENvVW3spepNPB1Yw8JajR9jzYbWvxsUVPX6BVWzgZdq1/dRrfqFVKuBh+o08rTQuq+en6pYY6tUu6wq1KmoMtZnsbpFVKqpdW3fAHWdUVaD42tq0q7WmnGkj2Yce0XDN7dS2+mVFPpSgDqOaKq1u+L00Qc3dP7QIe2Jidblg3t0+5+Wsrj3sx7dv2tNJ8kDS4n/9rsOHjzkOA4HJUOQDAMTR5PADo4rjgTKGb4yvIWRYPjrvxFYDyYohlGA4rFX4WBkYZTzO0YfQW6MM2NAYCgQLPhPAQY5gRljcPLpXHGA0Y+BZIwCnCYTdDXOnTG0cDZwoAn8EbDGmDf3kWChHZw9Avo4P8kZoJxBzJnrxtnHsCcIklrCAIeTSgqCOxx1hCHO83iuCSyBBPwIOCUX5HMG5hEjx9xPVSNzlxpgzFARZRwkjC4M8ZQCRAC0iYyMdBjpBANxAJkTI2ONAwNCG3ZFpATch7FDgMwYgAQOEO4YUswDQU/jyMJ/OB4EMwF+x8g0QSuCC/CqmR/mnz7ZK8ecAQOXiiaTyMHwY16Yh5QAmUBAxF7lC9JHngtNDfJvs3ZAgicECe1GJc6j2QJPkJEKMPgK5xqDmDYIpmDIw7u0x9zjnBNcwxkxQRecS/t7HaAz1abQjv6YftAGjp9zX40zCOIEw7eG5gAGP8ECruUaHHKcBbNuMF5JUJh5YI3Rd0MD+k8llt3xpjqTsdiPHQDTQk9kN7yWliRiSsB8cCyB3anDIHcOENiBpABBd3MPY2ZsZi1ReW1eWEm/CRTgODMnxk5JDrnGrmPQSfCG6Ru8l5Yk318Bqg7tiROcVcaSHMCDJBLpn5kbEvrm3QPQA7lrfoOnqQhmfPAN8pzAEPIZ2QRdjTNu7DjmBzlKINd+HANtwqNckxwQCKU/8DbX41yiJ5Jz7HgmMsB+1Bdjo8rUzA39Q7ZQzWdkKfPPGeFJJXOhgXMgmd0SKfGt2ckH33MPeo3dNaaa2RmgJXOHQ2meg/5jrCkB9yGTSJ6ZwCXyhIBKcsmO5AC5ReLUvo6QPSlVIxIAJAhrpyN0NcE9HHmzM4r5Q1ayjpzXTFLovI7SAgT7sAsNv9Kv1HiMccMf6Ef0JDvLSGSgK+AVAjymKAJZgNxwTsI6A/qVBINJusG/Rn8wZ8ha+M3oTxILyDADBPywpUxQjDm1y2LmmqRYSnOM3UNBjmkDHYS+SWk+AXSGfSerQcZgl+n8bdYlv6ODCfJBOzNvfEJXYxOSGGbtIZuxybiH56DHjb5Ez2DTE+QkWYJeNzqJdWhPPjJHf1X/MB/YQ3ZZgu+AjDHXsB4JdhmgPwRe+Y0+0W/D+7SNbICH7EClL9Wx9kQ+mBo9+Tf0hA4APAdd7G3YEX1qkiV/BVhzBB1NgQv9gH+hP7yKfrQjO4HwudBl6BH7GqMt5t3OQ9CN4B/XgQRdmTtkF+PnGmwgs+PEDvybNWq3mwk2pqTbAO5DPzGnJqhOsBF95ZxExN5nPMamBEkCIuu5n/ngO/gGueZMZ9Y01fBGfrK2kYXGDqEv2J7GLqY9EjCmUIL2SNyaJAsygb7aA/joEbtdjK6DfuZ39KspSksO6A92F+PCTqdYiMIF5BK8SpAWPjR9YNc168wA80Zxi5FtBpPiZ9C+5ggws8smJXmcGrBG7e8CQW4QkE8O6Dt6jUQO19MfeMccEYovgZ9q9Cf8j85gvlJDxgHd0grIaxI8Zl0g61hHySXIaRt5guw348W+M/YjPAN/m50AzAFBbCMzkgN0A8lAfGt0EraH2cVBm/wO7xr9BEK35GSWuQZdw66D1PQjgI5kvZi+kzSGNs4JZmdA/uP7GZ1s0LlvIN8Z/mP9o7tZP4b/oC+8Y08asr7Tkti0A+sHWWFkDOsGXZtWWUy8ihiDnZZPgzyPZI5dN/63giMBse9gsgkIqt/fz+avS1l9tT9fQa0PzaVN/TJqx+zntHPJM9qx9BntXPwP6+9/aLv13aZB6bWlZTYdKJNfJ3J66cTzPjqX6fFRPgSzb2b20tV03rqaPZ/OtsiqOW+XV/k5Y/UsCYjRFo7fpMwjV6vx4Be1bqiX3h+XUTcn59HFSQV0wcKLE0F3XZqUX5cn5dOVyWB+x+dV67qbk3M93t0wIbuuT8imS2Oz6eSwLDrQL4OO9HtWZ4Y8o0ujnteVsen13mg3jRzRXNlHLLWezcuree9E6gkI+OyX27/poy8/1Wdff667lm+y9/Jh9Vs3Wa9vmqaxOxaoS+wIlZ7VQo0Xv6KEw1t0fHeiVo/voHn9amnLouE6eWiLFu5eo5oLeqjKnA56JWGSRm6doz6JE/XGjoW6/pllt1ty6trHV3Tz81vWM/9V7t17dF+ff7lB762prnfrZNSZjG669oy3g8Y3cz6m+RmL9setOTiR21v7y+fTltbZtHloem2f86x2WfO3a/GTObT+3jnreW16JZM2BOfWQWuuL1tzfov3Rlj4Bz/YExAtu+vzI39xB4RdkOMU4Hx17tzFYUTv2r1dp84c1YhRA9SyTVMtX7FU3//wOGsM8R/ygmJeWsxbiln0T15izJvBHycg7ujnu+/rxLVozYjuoC4jA9W8fz71erOQJiYW1egEf7Wdmkf1R+RW+2m+enFBSbWZWEzBPT0V1DS/vBr4qUB4GeWrHyKP8KoKDAtW8RolVbKKn8pV9lSNsAC16FBe7XtXVatuwQprVkxVanpZBqy76lQPUvsWoWrTOlRV6wWqcEheBYZmV4nQjKoYkkHhjQPVu387vTrydTVqW1dlKuRRtepZVK9JflVt5KEKdfIppHZ+1a3nofoNPdWwqbeatApQ8zbF1KpjeXXuXUO9XquvHn3rq1WXENVrWkzVw3wVWtNdVWu4qV6DgmrROkBNWwepVmPr+3BvhdTzUtWGXqrWyNP69FDVBgWsv91VvXFe69N6fkMLG4Buql4fzKPq4e6qZd1bp66fatf1UZ2wglafPC30Ut0wP9WqXdTCsqpRq6Kq1qygKnVKqGKYRYMmuVS3W251GBWoV+fU1MjIjpq88UVN2NBZry+vq+YjSqjL6DBFbF6g6zdO6ey7e7Q9LkrnD+zTb199akmkX6QH7Gp5LMx/+P5HxcbGOSqSQXN0AkYwQQH4CAWDY4FxgQHC3/yGok+rUvg/CXCEWQ+mYhfnB+PVrihR6FTnYbCidFHARvnyN0b0f6ryFmDNogSNw4uBQALBbugTaOdIBlMpgMGMY8HcYXwYIxDE+MFpwzjAOGHM9vHwHL7HAMeISsqohRcIshMkMW1joGGkOxt9XMsY6C9OOgYZxjbBAGiLcseBorLBOAUYHAQ86D98RYAJI5N7McKSqgQhGGeCMiBObloSELTPOO3V8NAPA4p+OwMGMv1l9weBSO4jKEbQGQOT9pyrhaE3BnFyRiDjwyHHMTaON4hDQNANGuKI2Q1EAt0cU2A3jghCEYzA4DKGo5lbjHPmi8RJckBbHC9mnD1jyKcWXCGAgGHtHAxIC5rElalWgt9IpFCxwu84xybAxFol0MzYjDHMNfAgtGNe4BGCSGa9wBNUVRmA75gr5s70Ia2IE0XQwE5DeMwcTwKtTUWikYd8kqA0DjhzApo2cRRQ4PZqOAKN0JN1aK5LK+JoI7tTqv5KC8DD8IKhI/wDLyQVIGbOqA4j6A5/GoOfwAdzy3pF1pJAMo4RPIZT/rQBXYB1SWDeJJl4HnzvXIX1dwDjJaBgD/KTJEzOGYXu8CvJFcOffCLPWCfwA46u2XUHzxAAMUFx6IQTz9pn/uEb+MM5sAMgi3DSqOg06xxaoC9YL8kBzrepTuN6KsGRn4ZnnQEakBx1lq/oADvQd6p96buRPSQtCIjZ+Ya+QQOea/pgduYlFzQACDSZgAeIzsHJT0pHGaCSm+cY+sB3VMWnJItps1evXn8qNGA+SWRC86cBnGAqfc06Qt+i65KqqmMc6DeCU/bAOOvIrGloTNLFJN9ol77+lXWUVqCvBEBMIID5ImhNIjcp2tNHAmLoGwJZ8DA7flhHho+xFQje0x4Ib3Huf1JyC75EB7Eu7OsKuU+AwVSmIjfpl/kdXoHX7bIY2pkgn7MsRp4QJEtJdhKoo8rf3IdcYKdmcsk7AH4nOIncgHbmeWlBaM6uDCpKzdpAV5AMQz9zDWNG9/M9SQ5sO3gHOph+UmFOwBC7neAola6Gv9A1dn4kOYgO/Tv0ObzA2E1xAn3GxrYfj4J+wMZGx5h+m74xfubcbmOzBpEz2KiGJ9OK0J+gPfYx/IDNxvpBLzH/fBqEb0nopFaAkRJgUzFXJjiK/c26YPwErbGB7cj1Rl86A7+TQDM2N21h95ggpwFoDx8bXQvNCeTBu856gfHbj/VEf5PUTu49QvCJWdv2ID76DDvLWR4wV+gOe7IB3cGuG8NfBPooRMLmcAbWNnaukZ/IE2hg+ItPjsA0djFtEfi2t4VcYM7hK+bfzl/Qhsp8u02HLKUIid9B+kkxXlKJdAA/BbkCP5pjhhgPNj3ziK1A0tm0h8wg2WDmGD40O7vMOJ8GKSxCdtoTGk8DzJHZnWXaxP5OrmIdHiBJRZzABNNZh9DRrBX4ioIVsz5Z/yklNP4dgEfQA2ZdYDfBI0npJmhNXIPrTQIWvoQf7fYjCXN7gQv2EoVQSelt1hTrBTsN+QcvsqbQ48ZOZG5IxJHUNbyXVoRHOXqIQpTUAB7FrjZ8hNzH30nKfrQD8hAb2p4cSQtCO/ieNW74Dz2Er8pa5BriEsiLp9lBAk1ZExTq2PU5PkRaAXmJHMTXQ26QpHwaZIcMz0vJHvhvgdQSEOCtLP66lN1X+0rl07qXM+id2c9o/6JntXfW89r31gvaa+H+2c9r/8LntGPus9r8xnPa8nJm7aqQV4dyFNKpjD5PXoLspxt8ZvTVzYxeuloyt7aN8lCHxZ2VYVyM0o3epGdHJ6rk0HF6e0glnRudXbcm5dSlifl1bkI+C/Pq/AR3nZ9YwEI+3XXhT5jfce3lifl0xcKrE910eXwOXR2XTdcm5dH1Nwvq8hsFdW1KHt16I5/2vhGi7hNGKNOY6MfJD/MOiiQSEI+cdkB8/u0/tfrQes3etVpXP7+l7374Vp98/YmuffGB3t65UmXeaqqC40LVO26MLn75vj6/dVnxM/tp3qB62hc/R99++Zn23TyhhstfUa5RwQpf8KISjm/Vza8+0ifffKavv/9apz+6oAkbpivuyHo9TEJm/fL7N7p2YYSOjfTQGb/cuvaCp25mgsYkCvwcOxjes2h9IFch7azspq2vZdLmac9qx5xntc+aq/2zn3s8f9MtZP4WWfM261mt751JB4rn02Xrft7lcSP735yAQNiCBjB4MA5x3FAWm7es0779WzVwSB/16N1O72xfp3sWoxogGcPxPA/vk4SgPRs6DJk7+u3BR7rw0XrNT+iprqOD1GxADvWY5qYha7zVc467wgbnUIuxBdV3UUm9uqC0Wg73U5XOeVW2ZR6Vauahwg385V+vhIrWK61y1melmv4qH+yuShVyq15dL0uJVVDPPlXVrnNF1WsQoJAq7qpQKo9qV/JVx0aV1bVlqBrUL6LyVfOrTGhOhVTLokZhburdqbJGDu6uAa/2UoPalVSldB61b1JIL/Ysqdbtiqgmgf467mrc0EtNmvmqYQs/NWodpCZtiqtp+zJq3a2KOvSpqY4v1VHrHlXVpGN51W9TUrUa+SmkVj5Vq5tX9Zp4qUGLANVpHKBq9f1ULdxH1Rv6qGojL4XWL6iQ+u4KbZBfoQ3dFNIgj/VvC8NB69/186pq/fzWPRzp5KsadQNVs26AatX1Vu26nqpdx8LaPqpdq7Bq1yylmtXLqmaNcqpRu6RCa3urYs3sCg5/QXXa5FLTXkFqO6Cauo0NU5+3aqnPzEoWnX3UvH8pTV00QAePb9CJo+9o7zvrdOPsad398RtLIv2iR/dvW4LpsUH63Tffa+WqlY7tup06d3I4KcbZRpFjZOHk8D2GJg48zjpOEdc5G7b/DYBSplrBOMJUWhEcsAcnUKo4sRhkzs4jBgzBRwIW/ymArlQvGYMCY5gACvNhAEORCg5j2ODoEhilCsi8lPBpEYeCuU5qXplzHEKuMQYmBjYBKefrccyhD8YXtMVhItBkd7AIZCCPTAKFICpyirZ4FsYRlY84gxi1BKKcjUsC9SZIaJyK1Ko+DHCvPbiGIUvQiqCgPbBAEI2x4FBiUBt6EyzCCcLgATBYCFSbQD5GGu1jkGKY2wHnkfHgIGIsmjZJRHDEimkT45hkkjHqoJHz8SY4rziP9soeg4a3UzICCX5BN2Pw4WAStEjKkLcDAVeMw6cNroBsFSZwbQJoBJcJ2GPI87u9Io9ABnzu/BxoQqUr80PwhKMnuAbeZPcSjrcBficAYpyVp0HWO8cpGUcAuuCoEJBi3ngmfEOwyA6sC9ah8zO5HrmCfLEnu6An82sc9qdBgpWsldSSRikBNgNrkqChcdJol6MMnAEZyvioRoXHzdzgyOD0UxlFe9geGCrwoWmPeU8qmZgasGao8jJJQwLFOJTw/98N9Js1YBJIyBYC/s7BEuQUvIWTCg/YgzMEPEmYwJ8gAXmzmwCeYM2ZJBlykSpXs1MEHqYyNrnkCnyDnDByA1ogF5LTx+hq5JCRTcwX1bgpBbDRNchje58I0MAjzgBdCLib4BL9QW7b+ZExspZNxSU0xdFMqYoT+hKEtyeK0b2p8Tn8CX2M3GRNkdREhmPP2AG+Ym5w9pHF5jnoXuQ5yYSnAfgePUxAwKwjgpwEBOx2OUA/WSsETghSmLUPrUlmm2Nt4Eece5N8w1FG5ie3C+TvAHQguxQNDc1zCfTZZSuAvqJinISbvQISZ55KZKP3GSuBCzNO1guymiQFYzTAmAkYsQaR6/Z1BT+aym6uQ49DK9pkPdCeczU3spv1Bs+ZdkCuR9eY3XbJAbLdngQjeUibzvNpBwIyJHDMcTVPg4wF2mEjGFsEPU1Q1thL2A7odYJj8IKRsXaE59FVAPYX8pfvWZ8EV531D9cbWf406KzPjY1tZAfrl77b5RnzZ2xsI8cMMt8EZu02Njojqd0PaUXkDvTkudhqyB0CyM4IL8KnjOGvAjqB5IrR/fAA8vGvBLVIYCNLTZCQ9UVbSclu9AmJK66DpgRTmQfnIDXykwSM8S+w/bCxkFHO9jN8R2U482EC/iDzQHGCfd0aQJ7jR7DLxPArusdeqEB1NLKB+bADawr5QrGkWa8kqtlRYviVPrG2jGwi2MhODLstQL/gSXvC0yD9cH6PEOuIZxrZxCe2DTams96nAACZQfDWyHgQHUKbjAm5RLCe75Hn/M0xT2a8jJMxsSad+T8tiN+DbZZUcDwtwH0836xReJWAvHOxEnMJT8AD6GtjQ4DoI/QSMgpZzJxjB5mkj9ml8Z8Agv/sQjY8QrIPnZuU/8d6xD6GTwyt6TuJWzvPINPZ/WTGR9vERkj02G1W5pCkC5X56ALD08hVbFRjn8A38JRdf6UVWe/YW/jBydl1BpARnB5g+oE8piDK7m87A7/B2wTpn5b/eA5yG/4xdGFNIg/MWEkI4bs+jRzFTibGwFhYfzwHfkrpCGFnoA1sB2Q9xQvM3dMgzyeGgu353w7w6af7D+t8k466YBIQT4LNDszmp5uZ/HUlj4+O1nbTtonptWfBczoyIZOOvpRdxzvl0rHOFvbNriPjMmnPrOe1ffE/tGPOc9r+ama9U9lNB9wK6WIWq53sj3dB0O5NXljtVkCne2bVmHnVlH/KAqUbs0k5hy5Xx/5ttGNoXl0bl8WRUDhPAmJcHp0bm1PnSULYEhBJo/X7BAvHu1mf+XV9Tll9sbGPvjk0TZ/tGa+v1nXTV7FtFbdshGq8uVLPjYlXulHsfkh7AuLmlx+rX+Kbqr2ot6KOb9Gtj25YNu6X+snS39GHN+qlyFEauelt7b52RLcf3NWXH95Q7KwBmjuwnvYmLtCvP/2gr3/9QbGnt6lv/AQNSZyuvWcP6cefvtdXX3+uY1dP6q09K1VtbidN3b5I9+78mdce6KG++e6UTm9vrKNtM+hydk/dyPCYviBJgwtZ/bQ/fyFtreqm7f0zOZJD2xc/oz0znte7YzLr2CvW/HWx5q5LTh3pm01HJmbSrkXW/I1Lr+PV8+pqLl/dyOyvG9n+NQFx4TmLvq166LOjx3U/Gd8sxQSEEVj8jQM1c+Ysh/MbXDlYAwf21eAhLyusfojadWyszVtjLSHxraVEfnMIpXt3H+j+3Yd6YOlJRzLCsrEf0qbj84Ee6a5uP/pSVz/bo0Vr+6v76BJqMTi7Ok7Opq7Tc6vp6JxqMDSXekz3V/9FpdXzjWJq+loh1elSQDXaFVDl5h4qE15IpesGKrheMVW3sEYNX1WpmEdVymZTg5qe6t6hgnp1q6JWzUqqdjUvVa3ortBSBVSvfIA6hFVStyYhalG/hGrWKKRq1fOpfu28erFNMU3u31Izh/fTkC7d1LRKRTWp5K9BXSpoTP9a6mV9Nq7vr2bhfmrTLEgtWhZWQ7B1MTVqXVINW5VWwzbl1bBdJQc2aFNBjdpXULPOwWrUtqxqNvBTSG13VQ/zUL3GAQpvUly1GxRXrXqFVaNeoKrV87PQW6FhhRRSr6BCwguoSj13VbawShho/TvcQ1XqF1JouK9Cwgpb1xa37imh6uFWG2G+ql6rkOWg+al2rSKqXb2kalUta42/nGrXLG05YkGqWtNqr2ZWVamVWSF18yu0QYCqNg9U3W5e1hx4qP5r2VWrh7teHNVEq9e9pXd2r7SE91p9ai2QB/d+seb2G/3w0xcW/qgHDx9YTtLPiouPcwSN2rVt5wgQoDQxsDAcMLJwjnHEcd4JeuNYwV8YJqkpxv8TgfExJhQvihIj3R5IBhgX1Uo4ecaANojRS3AjparyvwMIhJtqJoxDAkamQgmHAufcOJ0ErjnTFsOHa6gAwPjHGcGIsSOOhjHcMTyo8kDJE9ghCJZcwAUjkwoeHHFjsFAxh7J2dsQJjODIsUMDYx9Hh/6bLdIYvxhvBOloCyRJYXahMD4CTzwLgxcjn4CcPQHDWBmnCRphUNKm/ZqUgPmjT/YAMQYkRjZnSEJ/KjwIImLoknwwTiDGEQkfnHsTPIM+GGT2QAWOB84Tzj4BdtqELvSbuTBVi1yLsUWwhTVIm9AUIxe6GKOOqkDawMgygKFEla795V8G4W2cypQCjRhr9rPuCRZguKUEHC3BmEyFH/2DPvARToyd3/g38gW+M9fDtxinpoqPtUc/TcCXyjmCAADBQecEBPTHAKYiEjoRqDA7mnCMkVc4HQDzQvDFVDbhHGGgM2bnvpr+EiQz8oE5Zx2ZI9rgTaq6jKPC7zg+zoFZHBsCePaAHAhPkMSj+sw4CIwfehpZAz1xfpOiJ0h/qCg0fMEaI9Hk7Cg/DWCs4uzQvukHSS14n2pf+M7wL/KS73FeTeIKRJYgl9ARAIk3HH0TNIKmOGQEnkx7KSH9MUFWnCyCOkZ2IfPoK0nOpO41CP/AS08T/CGwx3wYHoBvSTgRzLG3SyCUnWnwkpkLEJlCgIe1BUAPaGacfWQa8toEw6E9bTKn/A6P4PgaWeAMZgeOeR7Ba+53lsMGeD47W4ysY355fkoOKnoEPWmC3tCbhI9ZV3Yw/TdHXoCsYZJUpk/IfGS6SRhDA+edRc6Ac0twFbnMPcgA+pBSvwHWKLaLsyyGTgTvnGUxa8xZFiPfuSa1ZzkDtgOBGBKeZh0RuEdXIjfQKebZ8AR6DZrY1xFyEHlogksEVShAMIkYPrFN0rKO4FPW0dMm/dAr8B88aacLATN4h2AtY0E2EMgg2WpP4DC/zJU9yEeQAnlgAp8g6wZ5hqw09GHuCFhT5WsP8HEtdIT/AeYZOsJr9I05Zt05J0gIghCgtAdQQWjOOiN5YtepdoC36ZexxUCKuZJLDgLwADrJvmuCOSPompQ8B0mcGB3FWLAbmF/GCKBfsAXQN8wHQWlkGmvbbs8ahMYUiGDLI0MIVpp1BL9h65kxY0s9jT5nvgi8GZnH2OBPo8+NjW2KItAL8Lo9WI1cQD4StLXzPkjwikSXOX6MawkO0h/GDjKX0DMpG5c+EvyEnqZtEk3YZ6xn2uMT2yApZM6Tk6VpAeQeCWueTV/pB4Hap01A0Af4iOA/fERbJtieVGAP29duR/CJbWL8BgPIAnty2VzLeiPJg/2H7IDvCdzCm/bED+OCvgTUk9JP9Js1ylo1PGXmjb/hQ+bXBGrtwNqhXQL2jBlkHbFD1gQFWQuMi7Zpk9gGNp49ocb8Yp/bbVuDyFd2DNqfz7wjg4y+A5En2J4ElQloQhPkHu88oF17ctZUnfNc+omOwUblN/oJn7Pj0PjMyA/ko+FP5CXXk9RIas3xPWvSBNxJrOCT/9VEGTY8RQlmvLRLBT+8ZdcdrBl4gvm279SG7tggxk5HTqEL8FGYM2QYNjJ9NDovOeQ5XJOUbZEcGF43MojnQT/sBTNXtIsM5Tp+s8sZbHwC23a5j55lTuw6h7lj7BwfaMaBH0wMAN6w+4/IGBK5rAlkCMFs874a+oc85LnO82vmGL1i5oO+4g/iJxieSQ7YWWo/Og9fiDWUHJj1iVyBx7kHmcv6T0qegvhwFIjZ5RA6xcg04iUUIBj+RF6Q9EeXY0fY59sg8wO98HPhH+QS9rwp9DO+1dMe4wTtmVdnuZ4W5D7jf/+3A3T4+OBhnWvSKdkExI2MAbrm7q2TTfNo1+QMOjAwq86E5dPFMh66WLSQzhe3sKKHztTPq6Pdcujg6Iw6sORZ7Vr8rDa9lll7y7jrAomMrBZmt9rMabWZPkC3MnrpWr0sWjmpsIJnjtJzE9Yrd//5Gvh6bZ0cllXXxmXTmQkcvVRQF6Z46+JkD12YmNexG+KPRMO/JB8e47nxeXV2bG5dnhOsz3dP0q8fvau7P32p3769pTvv79bnJ2I1MSpGnhMTlG50nIWx/5KA8BwzRcMXtdPF46N19/sL+vyHb3Txsxv64OtPdeGTa+qzbpK8pjfSoMS3tGj7KkUfitfVj6/pvatn9e7lE/rwm091++7j4pCPr59X1PTXNGdguHYlzNWP333jiJn/ePsXXf30pk5cPaPT1jWHrx5X/LvrHe+GaL6iv4JmNNek3Uv01fff6NbXH+vSZ9f1zU8/6M7DX/XpR7E6Mb+0TgS/oKvp2VkSqBu5niQgsvjrfHZf7amQX5sHZtZuaz4OLLRwVCYd7ZJTp8MtGlpzdsGau0tFPXWxnDV/1nf7h2bWrokZdKqBm67n9XG8uDrJBMTzFu3b9NRnx086XoSdFCSbgEBYmQXEJ0o2MiJSrVq1VkhoFdWuW13BVcrIP8hDoTXKaez4IY5dEadPn7QMyC905/Y9Pbj3yPHah0eWbfGAdh49tAh6Xw90Vw8t/O3RD7r08RHNiRqqTsPKqNmg3Go9JouajsyqhsOyq92kfHppjp9enl5U7YYGqcmL3mrS3V/hbf0UUt9LFWp5q1LNAFWrU0Rh9YqpbnV/VSuXV1VL51Tj6j7q1rqSurQOVsOaQapqEa9GBS+FBxdRi2rl1aleqLo0ClXr+mUVXjdI9cL81bJxoIa+WFOLx72iZZayGd35JXWtUVc964VozEthGj+woXp3CVGLRsXVtnFJq+1yat+6jJo2L6GGTYtbWFLhjUqqbv2SqhFeQlXrFlU1C8MalVKzNsFq1b6KGjUvo5p1fFS9ZkHLILLG1LisGoSXVZ2axVSzepClWAJVq06AdY2fqte1rqvrZY3PS1UtDDWfdb0VEuarKnUDFFy3uILDyqpyeBlVCSumKtZ9IdWt66r5qAbtVS2uWiFlVKtKWdUOLaU61Yuqdg0fVauWz3K4sqtilTyqWNVDFWp7qGrrvGryWm7V75tZIR1zqdGLlTR8Vm9rfkYpZstivf/ZVf3+8Dt98f1lnb9+VNc+vKZffv9Nv9+7q0OHD6lPnxdVr249h1JF0WIs42RiYOCIUz1EsACFbZxihNt/o6Am6EPwzBiPKG6cWOcKOBw7jCe7kQnibGGU/zvBvrQATgxKHwMBZYyxgwHEczFK7FsnMRxxojF+UaA4+gR2MDLYDmpHxmQCvRhP0AIDALoQCGVekwLmHeMOQ8XQAqczKQMYRU5/7MY/hhgODcFw+Ig+G+MHgwmDnfvM/Ri+xiEHMWwxVnBiaQNDBcfDtIGTklI1rTNgOGEcmap7gzhHOMwE03DU+ZvglHkOSGCLimPnqk0MJXZr2A1d5gjnhLHQJoYbRqY9CGMMOhwYkwijPSov4QEzz8w5W7ydDVJ4gsp1jEPTJohBTCWMWbPOAK0ITpnKbPpBFSSB/eSA9c7vyAWuB5lbjFECP878BsKHBB9NNRo0JhBtdmbgjJGQMAk1AvQmWWWOd7HT3wQvzc4S+9Ee8DaJKPPOBgLXdkeYwAWyjXEn1VcQ/oSfuB7HgQCXOQ4CviHIboKtrCGq8ZzlAXPEPc78xfXOO4dYKzgm/A49mTcCNjisSfUPepIkgze5BycMeiZV/ZVWQG7gxBsH0vSVwBbrk/Ea/oXWrAk7v+F40Af6Z3QC/Wc9GNrDx8wxgQ/TXkqIg2R4hAAUW7pNW6wxKkvNukoJSc4YfkoN6Dv0JZAJn/EsxolDRcLU3i70Z23bHVauRVbjYBnnFnlF8sQEcdAhyGHDozwTB46dNowLHkDvQE/WO3IGOYtsYI0REGEeaMusBfqcHLC+GI+RI9CN56dU5cU8ohuMvCeIjt5LLkHN85FVRvYh41gnpsKQT9a4ScjRB460S2mHAWvKHNNixkrwJzkdZYB1RZDKBAG5F0xOFpvALAjt+Z5gVFIBstSAvuFY2192SXDPrCN0inm2WUf2PrKOkOXQH4A30Ct8Z/rJOOChtKwjnmlfR2kFnsuaIXFlt4GQhzyb/jMW2icpQXAK2nEN4yWgYg8aAgQZkDEEGEx7ILqQNkybrDPkhAmkgtAFewLbx6wr1gR6mHt4tpHFzgFXxoJMR7fZnwsdsXEJ8iZnN6A7eYZJrnAPMs0E25MCeJ3gnklaMA6eA18YGe6MyErWm6GhCdobu5RgqllfzAHVu/A5+ghn0Og/g9AEnUsCl8CO/Z1EJuli1hF/G31O22nR5yRjzUtPmT+SI4bH0Lkk1oy8I5mOjW2SKQagrX1nlkHWCtXrRjZwHTrd7OBgHCS8oCd9SaqP7B6iD2bM9BW/xvDOfxLQ+9gPhp7muJyn3bHE/DI3zJdpC1sEO9rZXwHgc5IHdruZJI292AGgXQLHFAjRprkWPkXOG7nCeiRoaoK8IDKNdUQCI6ViH2Q3gV+7bAUNPQjk2/tkgHWI7Q//cj12H4FM+3GB7C4gKMpvtGd2btvXMNeiXwmK2scI0n+OWbHbxdCEHSQkju3yGJqgI4wNBG2gkV3nI8PRwaYIBT7HV+I6foe/Saga+4xnMU8mQcHz8IcIbNNGUvzM9yTLjY2M/qRN4y88LdAXdCvt0B40op/Yz3b9gSxmHM48AD2goVnTyCHkDfYuvAoy98gl5tLeZlKIH44/llZAr0BD+mH6xZzAr2auQNYCstuuSxgLtgi0MzwFsD5ZW9jf5lpzPXQx44Am+BHGnmKsfIcsM34AOgjdaWQgtCWYjk5Man5BeJg1adqEJuw8ScmnRYYTF7DTAfsT+ZccmASk0ZsgSRZkVHLylGQxxRsmwQBNSTIbHxjfm+SFoQlrk3XBeklp/rEF0E3GxiXZZZLpPItnOutzF6QN4I2PD5GA6OIIKl/P4JFkAuJqAW+daJ7bUR2/t0Uuncvjo5sZ/HUro78j2M2xP1fdfHTRv5BO1curY0OzOI702TnrBR1ukkeXTDU9x/lwxFMmf+t+H90oYbXZ30NdFnZR1ilRythvubr3b6e9owvr6iQSDG66MMVHl+dW1dX51XXpTV+dG5vdkWB4nICwo7sjOXFunNU/65rzUzz10aYBuv3VVT28/7tYxazle7d/1uFzl9Rk0SalHx755+SDUwJixOJ2unpirH779rz2Xj6lsRtma9K2hYo4tlEvJU5SiVmt1HvNaHVc/JpaLX1JkUfX68S10/r0nxY/2uTGh1fPKuKtvpo7qL52x8/TD9/+j99w+/av+uzLT3XowlGN2TxLnVcPUodlryt8Xm+FzO+qEdtmK/L4Ro3bOk9TtyzUqVvX9eu9L3Xr/EQdH+CnM97ZdJ0ERJbAx8kdjmDKFKCL1nwcapVbO+c9rwPzn9exQVl0qk4+XbDmiLlyHIeVxc8xh8zl2bw+2tMup3aMy6D3GufR9XxJJCAsvJaeBISHzrftpc9OvPf0CQiEFcKZTxgQYXP69BktX75CI0YOV8/e3dSocbgqVCqtMhWKq0btKuravYNl7M7SeTKRv91xJB7Y/cArH+5b/7j36I6Fv+quftJ93dYvD37WqevHNXnRELV4tawavOqupkNzqfHwnGoxJpe6vJVHvWd6qNvEALUeUFjNXiyspl2LqW6zYqpcs7AqVQ1S5WqFVb1mUdWrW0Lh1YuoRoVCqlW+oJrVLqbOzaqobcOKqlPJX8ElCli/BahFnUrq3Liuujerq05Na6hFo4oKr0/ioIRloJTVyH5NtGzSEK0ZP01v9hqh/o07qF+rhhr+ciMN6ddQnTuFqnHDUmrTrLy6tw9V5zaV1bxxKTWoV1RhdYuqTu2ilhFeRKFVCyu4SoAqV/FXdauP4fVKqXnzYLVoXlH1w4o4kgCNwoqpVeMKahJWRnWs62uFBqhujUBrLNb1YUGW8RmgeuH+Cgu3vrewtvV3rXp+qhnmp6p1/RRSJ8iRgChft5TK1ymmcjX9VaG6pyqGulvPdVdoZU9VC/ZTjYpBqlkeDFStin6qHVxINSvlU/XgXKpW1U3VanuoVjNftXilsHpOKax2YzwV2jmfKrYprFaDw/T69HZ6M2K0jl0/pE9+uaqj1zcrYc9yHTy9T9/89J0eWsv2A8sQmTdvrpo0buIIRGLsUmlE1QsOD5X0OBcEE0ymmoUObxkH5r8JUMx2RYmBTnWzs5LHSDTOst2AxcCheox19Z8EjCOqUYwRi5NHv6kcIhBtAkMYOCjwtAZLMBJNEAgjgrGkBTAQqA4xgWCMZgzipHgA2pHQwFHnWpAgBv3GaIanjGOCcU9QyR485X7miYCjeR6GMvdjONKGPSiNo+RcYZca8AwqbnD67ZU9qSEGFYEzKgvtxisAT5BIwcFK6t7kEEOMOTQVfwD8CP9hTBojkYAaz3UGnFECiswn15l2oRGBl+QCjfSXBIWpFGZNYIgmdw4sgNNJ1bcJGhD0IcCfWvCbII95DrxDMMmMlwCb/bgi+NwY8qaa2PwGEtjB+SGYgBNLMsqsE+Nc4kwwPwQp+M6sYWQcwRzmPzmgTQJ+5nk4UcwrwDrDKDbVtDgnyMakAhsY7fC63Vnlb9aRCYjjuOGom/UMT+OopFRhC0AzU/WEQ4jcTikInRrAQ8gGHDY7D6UF4QXmjGSRndegs/3IladFnHLD7yTj+PdfaQs5lFYnBp4h6M86MPIlrQiPEbwjWGaXxzwbHjZ9R4eQQLIHkeADZLE9YYVsJFlFoheeQ/axa8scewVCX+ieXHALOcJ42NllxoNDyO6N5OQCQIKMII/Rk8hYAgT2oI0dkL3IRROoZb0ShDYVkugz5LkJ7uBksm6Sa4/1aRJYZu0jewkGp8XuQLYRoPgrshh99Fd3OEJT5pG+Pu06Qiei40i0m+AcdEAGEmSzB8aeBkmGpDUBZwf6QDCVSsyk2k0KCfTAkwQzzE4oO6An4GXDJ2lBAhHINwKT9iMzWGPoIhIiXIcstgft7UAQheCOSWaB8BUBypQqbwmq249SQk6T0Ewp8AffYj+btZPUek8KCJAbnsEmYb1DQ2QSvMy653fWPQ4gwLpH/xE0s/MbFeTYUNzLGeEESBkv96Jr0ccA6w9+f1p9TtvoVe4x+sfs6CJZjLwxQT8qoQnuOutc1rGxse1ynUSDnV7oUbssQi6yMzW1gD68YAo94A0CgqnNwb8LjBFbwU4b/CkCdE/rL3G9vUiGttCzSfkrBpgXdIaxOeBb+Mh5Fyz6xlQbc11akeuxNVOTJ8hfCmpMANYga5nAN/zlbD8DjIv2jX8AD2EP2ROo2HTswIHfkYkk9wzv2QFZjC52tovZ1eWclAEIgGIDIbvNtakh40MnYzOb9lhT9NnwKzKDMZmEDXILvwOe5HfGioxJzYejqt0kGtHlzHNKCfyUgIIH6GYCyk+D8COBYruNCn/xnUmQPC1CK+yBpwH8B2TV04wBeYBNjm3qzH/8mzEhJ4y8TwuSnGCNYTOw/kH8LmwPI9eQB+wESMnm4vnsEDTtQktiACnJDXgNWWmKCnketmtK9gt0oyjByAh0DckTZEJKgK9oeJZ1SVGL4T8KbvBV0S+m/2lF8z4ikvrEmozeYK7YXZmcjeiClIHg8ceHj+hcs1QSEHm99V6jPNo58QVt65ZVhwp66uI//HUrXaA+fC5A76f3140X/B2JhcsFvHUu1F1HX8+qA7PS63iXnLpCNb1JQBDIzkbywmrfvYCOdcmjMYtrK+/UBfrHgDiFDJusxVO76+Lb5XRjcg5dmFJIl5a31aW4Qbq4sJYujM2ic2Oy6/z4/Do/yeN/cAJHNeXWmZEZdG50Jl2bV1Hfnlrz5LUA/wPf/3pXM3eelc+keKUbskbpxsQp3bikj2Aasaitrp0crzs/XdXOS5a/s+AlFZ7aQOGLX1Tzpa+p7ZL+mrJhgZote0VF3mqklyLHaMrm+Vp3Zoc+//6rP5798bVzTxIQDbU3Yb5+/O6xruVdyqc/vqTooxs0ccNsVZndSeXmtlfXqBEasGaiei0frpZLX1XlOe1VZFoT9YkYq/du3dQvv1/T1X2ddbxVfl3Ink83LVr+kShgt4k1Z5c9fHSsdw5rDjI4jls6V9ldV/L5OOaIuWLOmDvm8MIz/jro7aF3XsyqXRMy6FQ9N13P8yQBYX8HhIXX0ns8TkC0663PTv4bCQiEFohS/P77Hy1H/kPLqTyhre9s1rIVSzV+4jj16tNdDRrXU+MmDTRu3BidOHZcv5OAsOgK8e5ZBL776K7uPPpZtx99rZ/uf6JfH3yjH+58r6MXj2n42wMU1q20anb3Uv3XPNRsRAG1mZBb7adkU6c38qrDWG+1GVREzV8qrrC2RVWlTlGVDymlCiElVTG0iEKqF7EM11IKr221USVItasEqnlYeXVoUtX6rKiq5fxUtpiHqlYMVKsm1dWjYzN179BQbVtWV8PG5VSjfgnValxczduXU/9XG2nO2AGKmjhbywfO1BvdB2l4l/Z6vXcD9e5TR83aVFStsKJq3Li0OrSprLatKqph/WKWs+SnkKreqhzio+AQX1Ws7KvylX1ULthbFSvxva/qhBVToyalFV6vsOrU8lOjBsWsPpRT6+al1bRxMcvRLq62bcuoY5cK6tytgjr1KKeOvaxx9Kqgdj3Lq033smrZtYyadS6phh2KK7xtCdVpVUI1mxdTjaaBqt3UW2FNPBTewE31wnIprGYuhVd3U6Oq7moc4qHGVTzUNMRdLau5q22dAurU1EudOwaqdZcgtehdVL0nBGvUmtrqt6SK6vQtrMJNAxRqPbvl6FrqO6er1hxaoX23NmrNwbc0LWqY1h+MtxbQl46sIYbikSPvOowHnF+2AWLYUCWM8cYWRrL2OAEEGeApeMx8/rcBRhwBGKP8cJySM6YJ8lGVahQiSOCRLZ7OztTfDRgjJHx4vnGwMdIwADA+UfQEXQnQUM2dlv7gsFEVZsaCIcm22aQcAWeg2hyn2tyL0ZxS8oJdDOymIaBjDB36j1FB//mbqjT6A2858xJGB0EMKrLtwVnuhwaMH2eZ9glC0L+0jMMOyEmCdxjiBLWTM2RxcugDAQCelVR/DWCQ4fhifJLosTvWduRZOEZcx9rDYLQbmvxNQMIEBkCcFnsAxgDXMg5oZX8GgSAcjeToQmCC8Rgnkb7iTMH3SYEJSFGFZ56BQ4STbO97UgAvQz9zH/Q2iQ6MdXsFD/NhDFscataA3bDF+TQBFBIVjMEEluAHjGH6Q/Aa49asXz45uiIpGtoBeuFAmucxV1Rk8j2OMA6MmVd4kWq+pACnDMfTVPSA8CwBLAJL9BHZanaggASrqIRLbT3jRBDsNvdRgYUc+KuA84HjlVZnjvkgqchzCSxDc3vAkf6zfk3V6l9BeBE+gO44P/ZjUJ4GCb6lNfBEv3EUGVdSbSWF8B6ymEAvDpNzcIX1ZI5XAln3yF37HPM3cwovs05YkwRN4FlknkH4B97DQWa9E+RxDi7ZgXHbA2Ig65equZT0NwEaeyUtOhNeTe4eeBnZYB8nYyCgQ3KOIK9dbrAmsC2Sa497oBFr3dxDxSgViin12w7wDkENZCx6OyVZTH94FrI4JfmeGqD3OAs5reuIOWYdUfGO3MO2sO8qpB8EaU21+V9B1qdJ6D4tUEWMPiOInBoN4WsSJciv5IJp8AkBanQZgT54Oqn2oAuBEfQLhTDoGOegP+uMpILpE+uQQH1SwL0EWeyyGBuEgo7kKrlZwyZ5Z5I/yGeOb0kquQJgI2M32wNx0MT5WKikAHvJ3APyXOgPzeBLE5RlvNgGAPzmXLXL79hVjIsxoCsJXJvfse+RNbTL8Y12uyGt+hyZZg9eI+fNO23Q5+hh8xu7K5JK8tA32sGGtdvY0Bh9wu+MARln5g2+wEdJzkaxA7s0TMAMJImRkqz8OwC6sUPN2G30l4TP0xwvYwAZyLybAhnaYi0nVYRiAD5nvZoiIxD7wjkBBG3ZKU0gAbmKfZtc8NDoN+Q39gxjsbeVFPA7csA5AYGcYzdMcvIVHwXZYK6Hl1mjdpmITDf0pc8ELZNLCOLvmd2lBik6IzEODezAvyniwD5DX9ptb2dEbiGTsU3Re3b7ArqaHbSg0YP4GxTwMX67D4ofRtLZuT/OgH1n1wMEfP9q0QkJMbv9mBoaHYkeYHcH/op9DrGLkSvJ6YfUEPmBvfg0wPpgfolbwJ/YRkm1DSI7eQYyFfsuueQlc0SxC8Ve0NqesLYj42TNIOewm9FpRmYy/3xndBu6g/bSUgSD7WB/xuuvv55iopVnkdA3uxSRo+ycTa6AySQs7HyEzUZCJjXADjE6CGRdGbnGjrmnSdoYRAdj8yIvSCLajxJmLCSa/6ot9v86EDz+9MgxXWjR7Y8EhAk2/xF0zuSna9l9dbZaPu2fmF5bJj+vrS2z61BQAZ3L7qPr6f11M32AI+h9K5P1mSFA13JY11dx19HXsutUKzddpZqeBETWJwmIHI8TENeyeOli4xxaOLeUAiz/Od3QdXIbE6eeMxbo8OJ2+mgaL5Z207kVXfXethW6sG6UbswuoYvjsuvMyMw6Mzqbzo7JrrPW55lRWRwvo744uYD1mUvvr2ygn69tfzJS4JHu37ur87c+VZsl7yj9sAilGxnz590PTgkI3gFx9cQ4Pbx9S5e//EiD1r2pom81VukZLdVl2TAt2LBK247sUb8Nb6rS3A5qMLunQt5qp85RwxVzcovOf3hF3//yk25dPqXot1/TgkGNdCBxkT777CN98d3XuvrZ+5q8a6maLn1VdWd1l9+Uxqq+/CVN27lc63Zt1IpNEWq3+HV5TQ1TBav92fsi9bGlx77/7qDOx1bT8dAcusTLpzM/Tg445owEhDUPVzx9dLJ9bh17JYfOVSzgmMMbzJVj94lF/xesebL+fTaHjw4Vc9fWdtm09c3ndGBsRp0Lzq/rWa02bUmjx/NmEhAFdaFjH31+ypJp7EJIAlJMQCAIWdAIUww4hNT773+gD95/Xzdv3dSFSxd1xDKsN23ZrIVLFmn6228p2nJSr1+5pnu/33O8gPr+vQe6c/+efn/wq35/9I1+fvi+PvvllD7/5YK++PlDHTq3TwOnvqSqbYqrSltf1enlqyZDPNV8bC4Ls6nNpLxqPbqAmg/xUqO+gQpu6q2iVfxUrHJJlaxaysIglakeqNB6JVWnYXlVr1VC1asXU5MGwWrTtLoahpVXpfLeljNeQJVDAtSsTTV1ebGJ2vWop4ZtKqh6k6Kq2DBAFRv5q3abourUM1TjBvdUzJS52jR1jVaNnK7xr/ZWr9511KJbJdVsbl3PEUoNAhTeqpjCWhZVaGM/lQvzUKma+VW8hrtK1PJQyVqeKl67kIpZn8VqeDi+Kx/u7XjXQvWmAarWxE9hbYPUqncpdXitjLoOKq/eo0L02uRaGvhWXQ2cEaYBM+uo36zaes367Dujtl5+q6Z6vllNXSdXUccJwWo3qrzaDCqptv2KqGP/IPUcHKhXhgXotcE+evnVAurV0029u+bRK53zq28nT73asZD6dfHS8J7+mjyghGZMrKJZ88I0ZHqoOowsoa4Ty2rYmjoaHtNYTcdUV2DrUirdvaxqDa+kZpPCNCjidc3bN0GTEvto0MKuit67Up/88JnjZSfwCkY5BiqBCpQTATWcCJQqxi7GH8FHeAu+4h54679RMVA9g5OF4iMwjgGZXOU8QTkqEHCIUIYYODjNKVWI/52AsYpxS8U0Faj0AaMEp4rqZ4wctiMn5ww7A3OJkUg7GFYkFFKrBjdAVR+OHzSAbhi/GM0pAYkdHGUqKDHmSSCAGEtU52PIUmmbHB8RxCDwyHnXGEw8G2OOuSMpg2NPUIEge1rGkBQgHzE4MYIwqAgcMD6ehdGNUYWhTh/YtkolpTE0kwMMTYxpKkRMMJG2QOaOQA1OOZVgXJeUQ8cz2OIKvZgv2oBeyRmjGJwE1zEQ6Ts0ouo6JYeboxLgLeaDe3BaMWaTq34kcE8gHmOfPuEYs37M1vOUALpRlQnfcS/OAM4DThfBUNMm4yT5aRxKAg1UqWLMQz/mnXEaYx5HiH/TF34n2IhzRbscX4DTTLsgvxGsSY1XoD38AF24D97l38g81hD8zPfQDHlAYDYpoB0CPPA6feMeaEyQmv4hV3Ho4QfaYowEGNISrCLhhuMFPZlr+pEWJzY5YB1AZ/jN8GpyCD3YzYIsIdjGGbTO1VPQGF3CemLcSbWTEiJz4XdoRFusPQKgT9MWNKWvyIi00oVnse2dfnN/Uu0aZC2TFEEusiuLoBm2ljNQwU6Qh3mi/wQ3kNvOAH8RUKDKH4cV5xa+Zk6QeyA8QsCCIA2BDNZ9SmNjXghIEfhhPMg2AmLo+5TuI/gPvbkHJEiZGl8ShKDfRn4yVhxq5AYBH9Yf30EHAjCs/+QAOYfzyXWm3wRRk6pcTAlIsiJjSSgSMCVowNzRpl0WE+QieI0s/nfsGnQ2c8NcOfOLMzK3jI8jRjDoqWx2Xkf0hYAwco8+J9VOcsj1rCOCmKklXZMDns+8QhuSuegz1pRpH/nDM9CdyG3WQGqVvNiS2BPIQeYU3W70Fu3SPvKMRC/HfmGLJtUmc4Ushp+4NzVZjJ6Hj03f0TXI3+TmG1lgApjmHuwebBJz9IgzoK+Qi4wHXmdsyJ+00J92oaWhA5Xz0B65AH+y9vmNtcwuP4AgHPrTjAtENrPDif4zbmxICm34DZ5H50NP7EZ2sRr71ujztAT30bt2fY5NbfQ5AT7TJr+nlAAz8gl7gOtB+o9dCJAM5H6j53iOvZo8JWDdk0g2c4e9m1Lw/u8A6M2ONejMM5kz5EFa+usMJJewEe1tEZB0lhF2gJfxT0hIQUtjG+DTwSvOgK0HL2HfoleweQwf8TzmEd5Bv2E7JbdzISngaEzob/gZ2UtwNKWgOXzJ+xIML5g1al9v/JvfaJff2UGanF2MnUhVObzN9ehSZE5yAVpohD9BQJWEMPwGHQxNWNeMiaQo9gm2pnOFNvcbGxH6s17xOwH0EbSEFvSHT5KFadmhRiKR5An9oG1sChKkfwWQk/iU9M+MzRnpH+sO2xwZyBHN2BysIWSLHeg/SZe02I/OCH9zb1qC4M6ADGMsJI3YIUtf6TPtmv5Df5KP7NBEl6TmLzOf2Gz4X/iYJF5oh/ZoF55DDyIr4RP8H7P7hfXHOIy8ZZ6w99htxHpODbCn8TlN37FbUtrZjxyGf7iHuWQnBOsjOb8Pv4FdI+hY+oadi40GX6YG6BFksxkXfo1ZyzzTrDF+TwtyLfYXiWKAIjWKQGjb/IZuc8FfA14g/Pnxk7rUuqcuvlAw6QQEgehM/roU5KmjfbNp56zn9M6057S9TxbtDXHTiXxeusxRTBkC9H6WAEfw++bzAY5dD2dCCuhcBQ9dtf4m+fA/CQg/R9D8+vO+uhmaQwlT/VTtjUF6bnS8nhmzVaWmJWrNynG6MbuUrozLptMLm+vdnYm6cGyXPt4yVO/PK6WL47LozKgMjh0PZ0ak17lxOXVzWV19GNVSV2YE6IPVjfTLdcvWo1regnt3b+ufX3ymuP3HVXJqrNINXv2vyYckEhCXjo3Ro1+v6de7v+vkRxc1+3CUxu9YpKW74/Xu0SO6ePacluyJ0qtRY9VjySCVfrO5Ki7orK7RIzUkfpoST+/WsRO7FD+zv5YMaaKDiYt04MwhLd4Xr2lbl6r+kpdVamZbNVjwsgMHr5+ud47v0hnLvjl8/F0t3BOt0Tvma9V7m3X960/0852f9cmtCL03o4jeK5ZDV5/x0U12qpg5s/6+btH5SgEfx66Hs8EFdC23RWdrTpibWyQV0vvrcgY/HXcvpD3V3bSjb2a989Zz2jX7OR17Mbsu+xdyJJLYVZFUAuLSC4V0qesr+tIa+30nOW8g2QQEigEhiJGAUsZpjIqKdFSRLFmy1FIg67Vp8w69s32vdu7ar+07d2uXZTieOXla3371rR7wAmoL7915oLv37uj3Bz/qtj7Td/fP6erXW3Xxyy269s0h7T4Xr9ff6KjKrQJUsaWfanQNVN2+Hqo/JLeajcuntlPc1WJ8HjUa4aa6rxdUiaZ55VW1gPxqBCkwrLAC6vqqcJivyjYuppCWZRXcoLjjXQgNWwSrZduqqtuglMpWtu4LzqeKYT6q36Wimr9aQ+EvVVJol8Iq295bJdp5qWi7QirbxUe1exTTywNaaNXMGdq5NEHRM+Zp1IheatU3RDV6F1f5TgEq2dJL5dr6qKJ1ffnuPirVtZCKdPJQUHt3BbQvoICOBVW4k5eCOnsr0IFeKmxh8W4+KtvbXxVetMbaJ0BV+wUofHRhNX+zmNrPLaPuS4P14uqqeimqml6Mqape0aHqHl3FYtIq6hJdWZ0ig9VuTQW1WllezZeVVdP5JdT87SC1e8NXPWYEqt+iEhq9uqwmRZTTxBUlNXZBEY2bFaTJM4vpjVmlNW1WOc2YXVHzF4ZoVURdxW1qrtj97fX25sbqNbecmoz2V+upxdVjYV01m9zY6m9VFelZThWGlFbl4WXU6I26ej2qg/quaKzeM5tr9d6l+uTHz3TfkYB4vGMGA4+gH8YFigAFTMUFBg6BSpS24SuM7P/WBASBEIx6AiUEiHHuk3MmGStJGAL9GOgYxmxXTyrI9J8CKmuYA6ru6C/9wOCgWo61/TRzgDOLwcTxMgQTUPxpccigA4YLAQNoQKASeZLUtmdnoAqVxBYOtKEhxiLfpWXXAsYgBh0GDs+lDejAPGAMP41DlBxAQyoCqcglAM9z6CfOEn0lIEgfUjIEnYF5wxEkgYUDRJUWbUJ3jlvC6TNHmiUF9IlqWKrAGTPG/549exzrLinAcSLgTjCe+YW/mV9jGCcFzA2GMfxE3wgg0Ya92swOfM96IYBBn6gsJ+jt7IAlBRjE7JjBoOZetizDv2aN4VgzVvqA42roggNpnkkfMZZxIkzFGYYzR3Pg5PM7wR4TlMU5JBjA97TNmmENpMYv0B5jGzlBX3k2AVloyTjgRWhMuwTIkI/JAduKWXNcS1vMjwk+E5SAD+g77fEJPVMKMBiAFwnwQ0/mGrqwW8TZMUwrYCsQtKIt+pocsibgRRKL0Ci5wBL9IOAHbzHupNpKCUn4MM84bbQF7xu+S+r65JC+0o+0As8ioUK/zRwnhzhyOLUEugg6oBedAV4jiIa8grbwIY5tcgEQgKpnElcE5lgPPItx0x/GgzxirtPi0LJO2M2AHKMdZBuVqanpMAKAZk3xXBxj886K5IA1S6AL+cw9fBJURW4gXwnYMA7owPwi/5MDxgYNkMf0gbaQH8klR1MCaEBwH3qiy40sZv6MLCYgbmTKvwPICOhLVTfPSAmRebxrgvlJrjoSfkSOpYUfnZHrOdqDdZScnkkrPN4p+5iG6HLkAM9A/pDgQHcSuE4qyJkcIDsIzJHURi6afkMXHBwC2Snpd2Qrspg1xX3wV0qyGP5FFtN3aAN/w2PJAbRHR/EM+I9nELBHbye11gH4nOt5Bv1CP3B9cnrbDvAg/EjfuB9ao294FvYSa5ffoBfXAvzG3+g9+BpENpPwB9Bl5nfaxP4gwcr6Qm8zb9DB6Cb0T1oKWugX9oXR5+jZpPQ5v/OM5NrkevqH/uJ62kKmmndsMJ/QnHGxpuA1rk8LPekP9DR8BT3Nzsr/FEBvU3zCXDFnBO5TssOSA8bIvNvbogo5Od4zQBDfrAtkLTIP+zW5tWlsbPgGm8esbfQtc4EMJ8iaFn1jB4KjzCt9pz3sYGRdSvYNiTrkvOEF+Aj9DV0NEJSkPdpFLtJmcvzA9yTGjF0MD6E/U7NZkRXYwuxmMXoQ5HmsJWxzfKekZBMyC5419IcGZj3Cf+yGYB3SH2Qp40uL7kFnM0esBdrGjkDe/BVgPkmE0I4ZW1IIz5HgYQ2zrpPjIXgOuqRmPyaF6GEKTP5qchA5jf2Fn4B8QOaYtqEzc0hinPbtfJQSMK/YJ9gz2Cq0Y9rEJkOWkPhwDvTTPrYTNONa6MucpbWwAd8AWw3eYByMKbn1Qh+xG7A34G94m+diLySn7/F/8N3hIdYX9gHFKGnR2/j7zLEZF3Q1iQt0Nf01az2tiGzC3gZYN8gb+sVv9nXjgqeHBw8f6PP3Tutyu966lD7pBIQj8JzJX9fy+OpMrXw6NCKz9iz/h3YseFbv9M+k3WF5dDTIQ2dye+sKlfgEuTMGOKrnOfLnsruPruby1XVeQA3SJu8qyOKvm8/668NSObVtuIdav91TWSavUbqRW5Rz4gaNWLRAJ+aE6frYLDo9s6qO7YrX2Uu39MGZXfrnnvH6MrqxPlhYQddml3Qct/RRbHt9c3yJvjrwlq5Y391YEa6fbz623TgK6YevvtB57Jy1u1RoYozSDY1MUwLiwrFRevjzJUc7wHe//axDt04r6t2N2nJgu86fek97D2xR1PrFWpA4X50jhits1auqOq+bik5ppk4xY7TmnaVKnNlPK4e30I7omZq1danqLXxZDea+pMoz2qve8lc0buNsTY+ZocRt0Tp35oSOnDyq+EMblXDSesZnN3T73mP74Pf73+j6mck6OsyiuXdO3fiHRWve+8C7NaDtEzpfzW3RvoC3430Pt6z5e9+aE3Y/XLHm5bQ1V0cKF9Cu+rn0zuCM2rX4Ge1Z8owODcmiM9Xcdc2aL3a02HkAfJyAKGjxSiFd7v6avjxv+bQWbZOCFBMQIMIJx+9xIKW/I8PcoEFDte+AgHhVL740SP0HjNCYsRO1fOlynTrxnn7+3lLKlm3DS6jv3X2ge/fv6M7D7/WbPtQ/7x7T6c8idPDWfB37ZLk2n31br01vpCrtvFSxpZdCO/kotHtehQ3Mr3bT/NV+ekE1fyOHGk7OoRpD86ho55zybpZPvq185dfe30Jf+bf3U4lOhVWucwmVbhmkCs2DVL9LBTXvEaJaLYqodK28Klk3jyq0LqQaLxVVzQGlFDygsEr281LhAZ4KGFRIvoO95TekkEoO9FHLUXU1Y9EExa1Zqdlzp6jnhDaqNqKsSo8IUvHhhVV0UKCKDfJT0aHeKjzCW4GjvOQ/ppD8xlhtjLVwnNWn8X7ynxBofYIBCrD+LjwxSMUmF1aJKYVVakqQyr7lrwqzvRW8sJBCl3mr+ipf1Vjjq2oRFg0ivFQ5wlOVIjxU0YEFVT7SQuu7Mms8VWpVQZVa6qGyC9wVMs9d9RZ7qXVkYfXaUFb9tlXW4B1VNGRrsIZuDNbojSGasLmGJm+poymbw/Tmlvp6e0djzd7fXHOONNO0Q400ILG6Gr0RqAqv51Po0OKqPjxcRXvVkU+PsgroG6DA13xUdnAxtZpdQ+1mharjG+FavnuJPvnxc8c7IEhAGH7B+EMZ4Vgg/AkwYjSiQFFq/M51XI8RzOd/G2DooTRRxChvgoCMKTlAMWM0YvyBOEZpcX7+TsB5ITlEf+kD/affaTWmDDAWDCYzduYzrWPhXoxMns+9BEDT6lThfBJssNOQ71Kiux1Mv834+aQvBEXS2kZqAC/TJxwP8xzTV2idFgPNGaAPdLKP3fQdozK1+UN+E6jkPtpIabx8TxDZ8Db3ML8prVHm3s5X5hnJ3cOa53rTPtfzzLTMAWOFjvZnGaeLT76nXdYazqFpkz4yDnMf88H15ndobP8d2nIPvzOfpl1+4/lplVnQwcwbbTAX3AsN4BHTJs9LaR0wbniAa0Hmx4zb0J+2QH5LrpLPGZzpCd3sdHlaoD36YvgtJYQujCmloCb9YB5N/54WmWfDW6atpK5LDaFLWmkK8Cyut/NNcsg1zD99S24t0x50YjzmPvgnNblLsAe+tusekH8z76kFoQwYuWbnZe5P7fnQwDwTOphAaErAWJFr9jmHT6CNnQa0x98prZuk+v00+soZjCyGfqZ/rDfmgueklZ6pATTgOTjThgbJIWNjzRl5kBTQHrKIPqfGj85o6GzW0b8LRtaaOQHpV1r1WVJA3+At5sK0yd/QJbV1Cy88rSym/1zLPanJW2jG3PAM0zf6mlIgluvhMdMnrk+pT3agXft4uNfwu73f9j7QR9YWYzd9dF4nZgzcy3yhy7jPyHzzvKfVPzzHrCXGbPQBzzP8ap6Xkt7FtnKWj2Y90ib8hl6ivdTm2A52mxW00/M/BdDVPleMn7XxV9Zfcm2lBtDaPm7mFRmX2hwgt+xrm/toJyX9lhKYeTX8BY+kJouYd/ph7qE/zjwJDQw/0Ee7vZgUwI9cx/Ug7adECwPcx/rgXjtN+C4lW5xx22WGXdfxadYiyPjMukkN4F2ebdYc7ab1XmfgPkMT08/kkOekpiPpm32unwYZD3ye1nWdFNA3+AJ+NfQxbbPu0yrX7ACPwFuMy94mc0Z/k9MD8IadtvBbWtePs/7gOSndC81on/5xD32ljeR4k+vt8wQvwq9pAa6DloYO3GvmDNrz3dPOP2Olv4CRF+Y3/k5r31zwr3D/4QN99t5pXWxPAqKArqd3egeEQXZBZAnQZY71aeKmw5My6MDSZ7V73nPaNiG9tnXPqj1V3HTcw1MXqcDnmJ8nSKLB0YYJkJu/s1q/PxegjwJza0/fvOo1q43cpi1RuhFblH7sBrWevkSbpzfX9fHZdGFGWZ3ZG62TF97X0dMXdOHcUX11Jk6/HJ2hHw9N0Y8nF+r3j9/V3e8+1ZdHFuviNKvtVU30y8fHdc9a9z/88KOunz+r7dt3auCKDco/IU7phsfK8f6Hp0hAPLTWzJc/f6vFxxLUNXKYJq6drfMXTun6iXd1cEOE3tmwSjPWzdaghMlqsayfvKe1UImFnTUmcrQSZ7yuNcNba93ySXo5aox8ZjRT+KJX1G7hq+ofNVpx21dpa/wSndyxUZ9cvap9pw/p1Zhx6h09Wu9cOqBffn+8Bm7f+0DX3u2vw71z62z+nBYNA3XdvNzb0BfM5uug/60MAbqZ0frd+vtiVl8d8/TU7lA3beuVRe9MfF67Fzyrg0ue1eFxGfVe/byOd0dct+ba7Faxo9kBcTFDQV3s/pq+OH9RD5LRk6nugAARCgSOqQximzcJiLB6TVWjZhNVDglX+YrVFRJSTa/0eVk73tmuH797bNxwBNODew90/8Ed/f7oO/2mm/rs9/06cGO21p4aoC1Xhmrtmf4aOL+GanRzV8U2eVWpXV4Fd8qjRsN91H1+SbWfW0gt5uZSk/m5VHVqDpUYmkNBAwqo8GA/BQ0NUNCwQBUeUlilhhRX2f4lVbxHgMp08lHtF0uq2WsVVKdLoMo2za1SrXKqUu+CChniqwqjfVVyQiEFvuEh7xme8pztLffZPhYWks90b9WaUU0Dl7yuSUvGqe9bLylsSh0Vm1ZUvnMC5D+3qPznFJXfrAD5WPcUmuutQgu85LnY+lzqp0LL/eW5PMBCPgOfYID1fYC8lgXIe5m/fJb6y8+61ne5l7xX5JfXijwqtDKXvFbmkOeq7PJYlU3uqzIr3+qMcgPXWBiRWW6RWSzMpjyR2ZU7Iodyr86pvNa9HkvzWm15qGiEtyrEF1a1DSVUZ3NphW0srfD1pdVkQzm13BSsNptD1HpTqFpvqKbWG6ur7cYq6rKpvPrtCdHgfXXVMSJYZYcUlG/3ggrsXl5enUOVr2MJuXX1UL7ubvLp46GaE0opfGIZtRpXV8t3LtXnP37leAeEIwHxhFfIvpNBZ+s35wKyjZdtnrwwlioAKuBQrvAYmJLR5wIXuMAFLnCBC1zgAhe4wAUucIELXOACF7jgPwsmAXGhfS9dTO+u6+kLJJ2AsPBG1gBHMuGSTyGdbuSmYyMya/+857Rz+TPaPutZbRuYUdsb59D+Evl1Kp+Xrmby0/svBD7eDUFSwt4ewfJs/rr5QoA+KJhX+zvkVf+3G8rzrdlKN2Kznh29XpUmLtXyqa10Y1IOXZ1dXpcPxurU+RtaseO4xiYe0rpDJ/TPDy/q/nc39fD3f+ru/Yf64dtvdeOdSTo/pZA+Seiurz++oCsffa5DJ89p0+atmrU8Qo2nrVT2cTFKN9r24ulUExCPjxH74bdftPxooqrM76Ci0xppwqa5ev+TD/TBlUs6uDVOe9YuUNzqqVoT87amJc5Ro8jhKrOsh/ov76/E6a8qYkQrxS4cq+6rBqvIgnYavGmWFsTP0ZKV47Q9YY4OrV+pkwd26ouPP9G5Dy6pc+RQFZxQXe3W9Ne+a8d198ED3b53WVd29dG7LfPoXK7cupU+4F8TEOyIyOqnW7zr4flAx86U9/J7aX+pfNrWLIe2DbXmau6z2rnsHzow93kdH5xVZ8Lz6nIhb8ccM9d/7FaxoUlAXMhgYfdX9flfTUCQDQbJLJIZJXDMttuFixZr8pS3NWjIePXs1V8tW3ZQw4aN1e+1V7Xjna364bvH51Q+ekASwmrnwV1HAuJX3dStH99R3NGhmrGxsZYfbqmo99pr2IpghffNo4rtMql8m8yq2iuv2kwuql7LyqjNQi+1XFFAzSILKGRBdpV4O7uKz3RX0Tl+CpoToKDZgSo6q4hKvV1SpSeXUvEhASr+kqdCXw1Qk6GlFfayv8q1z6FSXbKp0iAPBU/0UqlpHtZ97vJZ4q6Cqwsqf4SX8kQUUq41Hiqwwluhy6uq1/IeennmS2o2vpnKT6kg7wUBcl/lqwKrA+VhYUHrb49VXsq/xlP5IgoqX6T1GeOlvLHeDsxj/Z0n9gnGFJJbtKfcoiyM8FRe6zn5LHRb467cq92Ua1Ue5VyVy8Icyr46u7Ktya4sa7Iqc2SWxxiVTZmjsytzTA4LcylTTG5ljHVTxph81m8e1rWeyrrKU9mt/uRZ7aN8q/1UYJWf1Uc/FVrpJ99VAQpcU0RBa4opcHVxBa4qYWFJFV5RWOWs8TZeV0x9D9fVa/saq/GiCgrq6yW3Vj7K2aKYsrbwVebWeZStbXa5d8mncgMDVWVgETUbWU+rd63RV79860hAPHr00JFlZps4W7vZKVOlShXHeam84I/zMnkxEGdewnRssyfz70o+uMAFLnCBC1zgAhe4wAUucIELXOACF7jABf+74EhAnDmjCx17p5qAcAS1CU5n8teVgj46WzO/jvXKroPjM+jgoue0e+kz2jjpOW3ukVn7arnpZEBBXXDz1tUs1n2Z/XWTI5dog7ZMAiKDv953c9e7DfNp7Bs1FfjWm0o3fJP+MXqDik+K0Lw32urWtAJ6f2VDXT/xjk5fvKXR0dtVeMxKNZu/VYsOXdOeG//U8Y+/094rn2n7wUM6uKqfzr9dQZ9sG6sjp09r5saDGrl8rYbOWa62k+bJb8QCPTea45cS/jX5kEwC4tEvjxMQ17/4SN0ihstjfE01XP6SVh9br22X31XUu5u0cW+izuxfpwNxc7VtxTQlxs/XhLXT1SVquMYtH6rYN3pp5ZAmip03QqPWjFPb5f21dMtS7Yhfqq0r3tCprWt06fherTu4UTHHtmjH1aOasnepSs1sruJvNNTsnav17S8/67c7Z3VpfTcdq51XF7Lkfby7wZYsgMa32HVizdPlrP46n8dbJ4I8tLdOHm3qlVmbplhztfwZHVzwnA6Oy6CjPXLoXNUCjndGOHasZH0813+a+yf4PwmIArrQ61V9fvGyHjx5x4YzJJmAIChM4oHtcAYJFrPlnq1R16/d0PkLl3X46Clt3rZb0bEJiohYra2b1+nqpXP69aefLK4l+SA9sPCe9b87j37ST7qpM1/Ea3pCB700s6jGJVSwmCPcYpZyajYslyp3eVYVOj6n8AEe6jKrpLotLaqWS7zUKjpATdb6qvyKbApYkkF+K3LJe3VBFVrlJc+VXvJe7qPAJYEqNq+oik4OULHBBRU8yFf1RxZX7f6+KtM1m4r3yqLyozxUYYaXiswroEJL8qrAGjfli8knt7gCyhlbQFmi3OS22kNVI0PVN6a3XpvbR03GNVCZqaXkucRHuSM8lSvCW24RXo6kQ/7IAsproVvUY8wV42618xizg3HuygHG5ld26zk5o/MrZ2R+qx3QXbnWWM+1xpFzlacDc62xPq12c0QUUDbrmqxR+aw+5VeWaKtv0R7KElNQWWMKKUust4W+1r/9lC0mwGo7UNmiLIwobLVXVDlXFlXu5UXltryI8q0oKveVxeSxooQKrCwhd+vTfUUpuS8vLY9lxeS72E/BkYXVfm9NDXyvrfrsaKzqb5ZRgc6eytzYQ+kb5leGxrmUuVlO5W2fX4E9fFSye6Bajmih+P0b9O3t/zkDky18nPPJLhl2P3D8Ev/mDEzOHOVcRRIRvLySMwnZhge4khAucIELXOACF7jABS5wgQtc4AIXuMAFLnDB/x4QPP78/AVd6vqyLmbkCKYUEhAgLzsmuJ3Zz/Fi44tBnjrVwE1Hh2bRwXnPa9eCZ7RtxrPaOSa9dnXJpn1V8uq4ZyFdzuZr3eOvW1l5qbHVDkgCIpO/3s/loZM182nG5GCVnj5B6YZu0D9Gb1KJtxK1YFZ3fTCvpD5Z/7o+vHhcxy/e0mur31GWwcuVbViUgt7aoqrztqvh4m1qMH+L+sxeppj5A3V+VR9d371S8zfuU80pa1Ru6FxVHDpL3kMWKMOw1Uo3JlbpxqZtB8TF46P16Nerjljm2Q+valD8VL0cN0ERJzZr2bF1ariqv8IWvazIdzfoq68+1uVTh7Utaq42LJ2gNSsmaNbKiVqwYKhWjm2jRQPqKurtvlqyYpKmLx6tuBVT9c6q6dq3cZU+uXFR33z7habvXKqKs9qqffwYRZ/drnmHY/RSzFjN3xmtT7/9Rj//ekwXY1rrROV8upQpn25adHUkh57gTRI+HLdkzdUxr0LaW9VNO7tn1c5xGbRt5nPaNf85HZr3gmPXw+l6brroV8jxzofrJJeYW+Ymqbm30JGAyOChi5kK6mKf/vri6jU9cJSp/yskuwOCo5dIPJCIYDcEZ/3x8h1e3PX+Bx/p9p17+vHX33T24kXt3b9Hp88c0xdfvK+ff/xKd379WQ/uWPfd42ge6c6DR7qj3/Ttvevae3WpBi0MU+Mhbuo120dTtwRrwvqy6vKGm6r1ekZVuj2nlmM91XNRYbVd6KXmK3zUKrG0wtYVVqDjWKJ0yh2VUdlj3ZQ9Lr+yR+dVrsh8yr+yoHyW+KrIrACVmOir4NGBChtdVDX6+6hkt+wq8mIWlR5fUKUX+sl3WSHlXe6mnGtyKUdULuWMstqKJtifR3lWuqtGZFWN3DhAkyNGqOfMjgqdWVkFl/pY13tY6Kk8awoq7xp3C/M7djHkWVNAuUkmRLgrR2R+B2aPLqDsMQWUA+TvKHfrOdZ1kQWUJ9JDbpHshPBW3lWBFhazxlVC+dcUV/4I6++IInKLCLTGCQYpT1QRC4taWEx5oksoT0xpC8vKzcJ8caWUP7ak8lvf5Y8upwIRFVVgdbAKrAqWx8pKKriyojxXVVSh1ZXktaaSCkUGq1BEZXmuCbGwsrxXllXxNWVUb0s19TnZSgNPtleH+LoqNSRIOVrkVsYGuZWpoZsyN84rt+Yeyt/EQ4EtCqvrmN7afvKwfrT4AGDh8bIlXv4TFhbmeDHViRMnHGc+cr4fRy7xkiBeclS5cmXHC5L+6ouvXOACF7jABS5wgQtc4AIXuMAFLnCBC1zgAhf8ffDg0SN9eeWKrvR6zRFUvpZaAuIJOnY0vBCg6xn8HS86PlfZQ+91yKV3R2TS3nnPa/eqf2jH7Ge1vX8m7W6RQ4cr5dPJgoV0IbOvrqf3163MAbqVNUA3s1ifuTx0qmZeLZhSTuVnjlW6oev1zJhNKj1jk5Yvel0frqinD7ZN16fXL+ng2WvqtmyLMg5bo3T9VyndwJVKN2CZA58ZvFqVR8/UinnDdHnTdN04ulNT4vbIa9hSZXh1rrIMWKRnh1r3jEoh+QAmlYD45YojDvrpt1/pwNXjOvPhJR27dVZdY0bquVEVVH1RT0Wc3KK4c3u0bF+ctu1N1JVDW3V03RJFzxqiRWM6aOGgcM3vX0tLRzXXism9tHbeKJ3eGq3LR3cpcW+CFh2I17arRzRj3yr5TKmnbBOqacqeZbr46Q2d+OCcTr1/Sd/98rO+/emAzkU20cnKeXUpS37dgobZ/PV+Jn+LtgEOGr9n0fpwcD7tapVD7wzJqB1znnHMyb45z+vdwZl1ql1una9YQFfyMx/WPDCXWZKeazv+kYDIUkiXXx2if966yX6EJCHZBITZBWGSD5cuXdLSpUs1ZepUvbNtu3765Vd999NP2rBloya/MU4rV8/X1asndfvXr3X/zq+6//sdPbzHMU4mAfG7Pv7hguIPTVe/2WFqMdxPHaYEaOCq0pq0sZxeX+yleq89r2o9n1PHN9zVe6mnWs53U4s1AWq+vpIqxxeVx6rMyhaZThnjM+rZ+Dx6fm1evRCfWxlicinr6rzKt9xT/gv9VXpmUYVOKaE6Y0uo6oAAleyZV0Ev5VTxCV4qtihIniv9lGOlu7KsyaOsETmVbXUeZY/Ir2zR7sqzoqBqrK6hCZtGauG6tzVi5QDVXxiuQkuDlGOVp3JHeCvfGo45KqS8qwrKbZW33Fb7KM8aX+Wyvs8VYWGkhdHWvy3MbcM80X7KG+2v/Ba6RwepQGQxFVhd1sKKKrAmWAUjguUZUcn6rKACEWXlHmlhFJ/lLKxgYUXr38EqEB0ij5hq8owLtbCSCsWVl1dcRXnHhMonqoZ8ImvLJ8LCNRaurmVhDflF1JRftIVxteUXW1e+0fWsa8Mc1xa27gnZUFPtDzVRv1Nt1XdvczWYW1G+PQsoZ5PcytrQ3cKCylGvoLJVza8ijcpp6IxJeu/aVf1mzTFAwury5UsaPHiw6tatqxkzZjheDGSA30lQjBo1SuXLl1efPn0cxzC5wAUucIELXOACF7jABS5wgQtc4AIXuMAFLvjfBV5d/s/r13W1T39dyuSpay94JBl4/hd07GCwkKB1Bn9H9fwlL2+drplPR/tk1+GpGXVgwXPaOfc5bZtu4cCM2hGeUwcDCuhMHm9dpVqfJESGQH2Qs6DO1smrBW+WU7lZY5Vu2Ho9M2qDykxL0OolQ3R1VQcd27hIN65e046Tl9R8/nqlHx6pdMOjlG50rIUxSjcy3sJ1Cpk0T7HLR+j6zgX65OIxLdx2RAFj1yjdoFVKNyKZl047YwrvgDDw6MED7bx4QDXmdlGJOW00Yc8STdu9TCHWv1suG6Cdl47oq2++1JGDm7VmRj8tGNRAc1+voXkDalpYRwuGN9faJeN0/ty7+vL7b7T0cKKCZ3RQ0+Wva9b+KL22/g0Vf7upekaP0tkPH78AG3ioR9b1e3UqspFOhbrpamZ3vZ8+0LFz4Yo1L6ct2h4MLKBdDXNp++CMFu2f1c4Fz+rA/Of07pQMOtoru05Xy6/Lhbwcu1iuc3wTc5jCroc/oXXd1fQeupTVS1f7DdfXH37o4KGkIMUEBMkHAse8/2HlypWOo3M4zz8qKlo//vyzvvnhOy1bvVTNWjVQm/aNFBm1UP/88pYe3vtND+/c06O7Vhvsgnj4SLcf/qbzH76rBYnDNWpRGw1Z0FR93q6tXjPKaExcOY2MLKoWw7Ir7JUM6jYzj15anUctF+VQq5jCCl8XrGKRRZR7ZTZlic2gFxJzK91aDz2z1l3PJuTW8/G5lDE6nyNBQKKgxPxSqvx2OdWYVFZVh5dQmVe8Fdg3v4LG+SpwQVEVXFVE2df4KEukp7JHFlCONRZGeCoH73BY6afqq+pobOIoLUyYpbGrR6rJ0pbyWlxSOVb4Kc/qQLlHFFaBiEDlXxOovBFFlS+yuIUllDequIUl5BZtYcxjzBtjfWd95ospaWEpuVvoYWHBmLLyjGJHQlV5RdSwsKa81lSX95pq8o6sJi++j7Iwuqo8rb89re88I6tbaF1LgiE6TD6xdSysLp+4UPnGVZN/TG35R4UrIKqhhU0UGGlhVGMFRPLvBgqItjC+kYVN5B/fXH5xLeUb00pB0U1VIbGBmu5qoJeONtfg463VY20dVR7lL/e2bsrZwKJPuLey1PBU1mBPVWnbQIuio/TRl99Yc8v7Qh79kWDgJdM1atRwJCLYLcMuGoAkFu8QefHFFx0JiEGDBunq1auO31zgAhe4wAUucIELXOACF7jABS5wgQtc4AIX/O8BweOvrl/XlT79dfFpEhAGOZIps79uZAhwHLF0xc1HFwt76mxDNx0blFX7Zj6vPcue0e6Fz2j7+Be0tXsW7aybR+8WK6izOa17nwnUR5kL6WytfJr/RjmVZQfE8A16ZmSigqesVMySQTqyvLciopbr5Pmr2nDkrOrMWKvnR0Yr3aiYJ0mDeKUbvdb69wbVmbZAWyPH6ebeZfr82hkt2XlS/uMjlW5ohHWddc24ZN77YMc0JCAo4N9/6YgmbpmrFcfXK/LkRjVc3FtZR1dW9/jx2nDpkFaf3KI3Ny5QdOxcJc7sr7mvVdfsV6tq8dDGSlgwQpHrlmjq1sVKOH9AEWe2q9qCLsozNkR94sZr7antmn8wSjN3rNSp9y88eerjBMTn3+/RexGNdLpyXl17voCDhmdy++pwcQ/tDMutd3pm0Y6JL2jvYovuS5/Rvhkv6NiAbDob7uY4Muuq2+PjsMycpTn5AP6RgCj07yUgAF5AffDgQUfFenBwsCOAvHv3bv1qff/Dzz9qw5b16tiltSoEl1L/AS/q7Jkjun/nF4trLTLce6BH9x/q4aP7+vnONzpwapPeXNJfC+KHKnb/DL0RNUBdJ4TqtdklNGxJUXUanVfNh2RVj/l51Ccqh9quzKpW6wJUNbG0Cq70U86Vbsodn09Z1/rq+bggpY/xUeZod2WJzafMsR7KGuWjPKuLyGdZKZWaX0HB0yspdFIFlR9STEUG+ShoQqACF5RQodXFlSeysHJFBypPVICF/soVE6Bc8SQViqvqyvoaGDlYk5dM0MB5A9R4YRv5LaqoPMuLKt+aEioYVVae0WVVIKqc8keWl3t0RbnHBKsAGF1ZBWIryz022ELr75jK8oirooKxISoYE6pCFnrFVJV3TDULSSSEyyeqgXwi68snwvo7op78IsPlZ33vH1Nf/rH1rb/ry9e65jE2lF9UE/lHN7d+sz5jG8g/rr4C4hoq0Pp3YHQLBUW3sbCdCke3V5EYC2PbKSi2jfW7hfFtLWyvgLWd5L+2m/zjeyoorpvKrG2p2pvC1WVPQw091lpD9jZViyXlVLiPh3I3tGhex0OZqxeUT3hZ9R45WHuOHtMvv9wm+/DHUV3ffPONVqxY4XjxNLsgYC52znAE05dffun4jZdQN2rUSMuWLdNXX33l4DEXuMAFLnCBC1zgAhe4wAUucIELXOACF7jABf97wPn9X127pisv9nt8BNPTJiBAXijNZxZ/3UwfoBsZ/HXV3UfnKhfQ8Xa5dHRkFr274HntXvGstsx9RltGv6Cd3bPrQLX8OlHQUxdyuetE9SdHMM1gB8QmpR+ZoOZTZ2rT8kFat2SQpiyP0sEzVxW976TKTonSM6OilW70k4TBOAtHxyvd8Dg1nbFUhzbO1oeHY/Xp9fNasPOEvMdFWG1Gpi35AKYhAXHv/j29/+VHuvzxDX3zw7dafShR1Wa0V/iyPpq+f7WGb31bVea0V8fIkdp39l2d3h6lRYPDNeOlioqa0l3n9m/R5lP7VGfhS6qxsKem7V+pcbvmq9q8jmq3op92XTyoL7//py5+dFUff/3Zk6c+2QHxw16dWt1YRyq56b2seXXCy1P7aubVjl5ZtXns89o67xntXfGMjsx9QUeHZtbxNrl0PthDV/P56GaGgMdzxLseclho5i6t+KcExDB9/cEHT5eAMMkH4IcffnC8SLh27dqqU6eOVq9e7Thah90R9+7f160Pbmne/LmqF15Hbdq20I7tm/TbLz9Ydz6y2rlr4R3rr9vWBHygbftiNHvZaG05sFTnP9mvqL1L1HNiI7UbHKAeYwqp43A3dRqfW72X5Fev6NzqGJVDrTZ5qeK6wo6jjvKs8lChuADljy+t7BFllXN1MeVd7SO3SC9lj/ZR1tgAZYsuqnyrS8lvaXmVml9FlWZWUYXJFVRyfHEVm1ZCRRaVkv/qEvKIKqb80SUtLKV8sSXlllBcuSzkuKNqq5vplVUDNWD6IHWf1Fv1Z7dR0SXV5LG6nApGlVehmCryiq0uz5ga8oiupoLW32Ah69+FYmqpUOxj9IytbX3WlXdcPQvD5RMbLj+SCjENHOgX08jCZhY2l190C/lFNZd/VDMFWJ8B1ndBsS1VOLaVCse0VpAD21rY3vp3Rws7Kyiuk4UdFBQPWt/Fd1KR2K4WdrOwu4rG9lCxOAsTeqmohUUc2NvCF1V47csKSnxNQWsHWP/up5IJXRW6tqlab2qs/vvaaMS7rdV7Qx2Fjikij5buyhnmLq9mRdVicFetXBenDz/5WA/u/K5H9+/qrvVJkuH277d14vgJx+6HatWqqUePHtqxY4cjicUumnnz5qlLly4aO3as430QvNgcsPObC1zgAhe4wAUucIELXOACF7jABS5wgQtc4IL/f+FvSUDYMSs7IqzPzP66av37sreXztXMrxMvZ9e7UzJp7+zntXvBM9o9/zltG5FR21pm1/4KObSvUU7Ne6OCKrw9XumGblb20bEaOXeadkaM1tzFb2r0yg06fO6GFuw4Is8xK5VuZJT+eI/DOOtzVJz+MWSNOsxZrdM7I3Xj8Ca9f+W85uw4oYJjSUBYyHXOyYakMA0JCOD+g8evMfj1998UfWSTxm+c7di5sPhAlKrObKWC40M09J05+viHr/XBmYNaNqqZ3updTomzX9M/b1zU1X9+pHZRQ5V1eDm1Wd1fG8/sVMTRRE3bvkA7L+13JDk4fea+hQZIQHzz/X6djmiiXWE5tb1sFm1rm0PbR2fQHoumexY+q72znte7kzLqZO+cOlfN/fFxS9n8dZ13RLDjwZqjp9r1YMd/NwFhh2+//dbx7odKlSo5qtf37dvnqHY3wNE627a9o1atWqhR40ZKXJegH3/8zvrlofXfbYsUv+nho5/1yWcXtW1XjBI3LdX5a/v05e2b2nF2o159s6PCuvoovGt2tXw9u3pNy68+y73UM6qAusbnVZut3iqTGCC3VT4qsMZbheOKyS+movKvriz31eXlubqYPKIKK1dMEWWLL6psCSWUK7qMPNZUVNCKqiq1pIbKzquuMrOrqMS8Siq8tIIC1pSVT0xZecUGyzMmRB6xlZUvoYJyxZaX+5pQ1YzsqP7RY9XvraHqOKaXGszsqDLLG8ovsqa8YqrJK7q2vGMaWH83tO4Pt9oJV6HYevKOrS/f2AbyjWtofVrXxzaSf1xTBcY1V2BsCwcWfpJUCLIwILa19V07Czs4MCCmg4IsLGz9XSS2o4WdVTS2i4rFdlXx2G4Wdrewp4W9re/7qEgc+KKKxFuY8KKKJvRRsbiXLXzFgcXjX1GJhL4WvqaSa/uphAP7q/jaARYOUrHEoSqcMFpF1o5QqcTXFBLfWY0T2qr75nYatL+jBu1uq+ZzaqhojyAFti+qpiNaatGm5br64Q3d+fUXPbLm/sHvv+venTu6c+d3x2IjYUXSYdiwYY73Pezdu1e//vqr/vnPf2rz5s1asmSJ9uzZ4/g3C8eVfHCBC1zgAhe4wAUucIELXOACF7jABS5wgQv+d8GRgLj65wQELxpOy4uok8Xs/3MsE5X2VN5fKuGpc/Xz6/jLOXR4enrtW/0P7Vz8rLZPekG7Xnte7wzKqrferqzSb05VusEbFDAhUlGRs7QtZroGzF+iUbG7dfj8dU3eeEhZR6xWOnZA/JE0eJyAyDBslfouWq33dsXowM71Onv2rObvOilPEhBD1/ztCQgDFOtf/+IDXf70hj766lO9tXmuqr3VXJ3WDNSeGyd179FDfXD+XS0d3ULTepVT4tz++ucHV3T73l3Fnt2p0NntFT63qzac2GLd/7GufnFDH3/7SZLx00fWf999c0inNjTX5gGZtPkVi4aTX7Bo+Yz2WzQ9/FZ6He+TQ2fr5delYp66mtdHN5kL3vVA8uGvJh4sdPCFPQHx+jB9/f6/kYD46aefFB8fr7CwMMcOCI7R+eijjx1B5d9+u61PP/1Mq1atchy707JlS23b/o5++fUHizBkfm5bLfym3+98q6vXT2r/gQ06fWaPPv/nZX3x63XtvJCofjM6qWpbT5Vv+Lwa9s6ol2cW1MsrfdUr0lsvrvdVuy2FVS6uiDxW+csnwlel4guraGx5ea+pKs+IUMeOhAIxZZQvrqzcLMwTX1Z54yrKPTpUvpG1FLSqroqvqKfSK8JUcnltFV5ZTQHWff4x1eQXU0c+0SQOwlQgvqZyx1S1nlNX4TEvadS62RqzaLr6vDFYzWe/pErL26kIRx/FcAxSE/nGtJFfbBv5xraQT1wz+VroH9dCgfFgSwXGtVZQXBsVjm+rovHtVTSug4UdVTyukwOLWVgkrrMKx3WxrulmYQ/r3493LBSP72ld01Ml43pb+KKFL6lU3CsW9rXwVYsGr6tkfH+VMJjwGEtaWDph4BMcoDLWZ1kHDla5tUMtHGbhcJVdO0Jl1o5UqcSxKrp2koomTlaZdaMVat0fFtNHLWJ76MVNPdR/Sw+1X9RM1QaHqsnIxpqZOE3v3Tqu73/6Vg9/+10Pf7Xw9h09uHPPsQPi7v27Dn7h2KV33nlHO3fu1IcffujIAJKo4h0RvPeB5MOdO3ccRzeRhHCBC1zgAhe4wAUucIELXOACF7jABS5wgQtc8L8HROi+uvb4HRCXMnvq+t+RgAAJdPN+CHZEZAxwVN9fc/fVhXIF9V7b3DoyLLMOvP34PQX7l6TTpnkZNXZ2NQWOf0vPDVmvejMTdHhXvCITItVkZpRGxe3V3hPnNTB+n9KPjFS6UbF/ThqMjle+sREat2yZDm9apjXr1urAyXNavPukCv2HExCkCdilcP/hA/386y+KPpygaVvna8+Vo/rl998c11w7vV9L2QHRq7zWzn5dn1w/7fj+u19/VMSxDZq6da72XTio327/qgdWO2BSQE7i+6+P6/TuNtq6MIPemZ9Oexc9q/3TXtCRIZl0qnUeXSzjqWv5LPpbNOc4LObAMR//RvIBhCduZvfVtfQF/ucl1B/8xXdAgByTw3E5/fv3V82aNdWtWzfHjohdO/do794DioiIUp8+L6l6jZrq16+/zpw5pbt3f9ODB3cs/N1q4zf9+NOXunDpmN47tV+ffX5V3/zwvq59cUTxh+fq5TebqErbgipd/wXV751Zr84ppNdW+uilyAC9tqWsOm4qr+CI0vJfWliF1/iqXIK/SsWXk39kDRWMrqn88dVUID5UheJC5RULhqiQ4zik2vKJCZd/REMVXdVEpdc0U6mVjVVsVUMFRjaUf0xDBUQ3V2B0S8fOBK/4RsofU1/eq5qpccwgTdmyUrOj12jEgrfVYcEwVVnaXcUj2qoIxyBFd1RQbDcVjuvmOAYpML6DAhM6qHBCJws7q4iFRRO6qFhCVxVf200l1vZQyYSeFvZS6YTeDixlYcmEF1UioY+FL1vIboVXrO/7Wr+/6sCyCa9b2M9CkgmDLBxs4RCVWTvMwseJBLCcDSskjlTFJ1gpcZSC1460cIwqrx3nwOC1EyycqEoWlk+cqlKJ01Vq3QxVWPeWQhMmq2bsaDWIHqIOUa+r++qX1OLt1moyoblGrhyifec36/qHZ/Th+9f18z+/08Of7urR7Qd6eNdCkgx3buvS5UuOnQ4g2cXvvvvOwUcASQcSESb5QNKCT9cuCBe4wAUucIELXOACF7jABS5wgQtc4AIXuOB/Dwge//PmLV19ZZAuZSmk6y8U0LXsvkkGoP8SEvTOYiHV93xa31329NLZyu462i2HDk5Kr2ML02nr4kwaOKu2PEa9rawjN6j36h06efKIpiZuV4nJ0eq7covW7zuiFyN36nlePj3aloAYE6d/jI6T/6QYTVu+WNvi5mlKRLzWHT6tedvelceYNf+RI5iSAhIRX3z3pT779nP9dvfxMfQPHz3Slff2aOnI5n8kID66+p71y+PY6Pe//aSPv/lM3/74bapF2w9JQHx7RucPdNPOpRm1a1Y6HRqfUcc659TZSu4Wbb0dNHa84wEk+WCfj38Dr+XwtXjD53ECIpuPrg4apa85rv9J35wh2XdAOM6Vun/f8ckLhBMTE9W9e3fH2f4cxdS1a3f16NFbLVu2Vo0atdS2bVutWbPGuvZzPXxIYPm2df9t6/NXfWMR7vLVM7r5/kX98us/9f1PH+vYlY2as76fOo2trOB2HirXNJsa982u1+cXUr8VPnotqpgGbqupLhtrKHRZJRWdW1wlV/sqeF2AKiRUVJGoMBWKrS/3tfVVKCFcgdHhKhZZz8JwFY5qoIBoXtTcTEFrWqrEitYqv7ydKixrp7IrOqjoqnYKWNNeQdFdVDyG4406KTChnbxj2yhodWe1iBmtt7bGaMnaRE1cslCd541RyMItg8U9AAD/9ElEQVQ+1vO7qWRMD5WIeVEl4vqqRHxfFYvvo6LxHH/0ooonvORAEgoln2Cpta+ozNpXVXbtaw4sl9DvDyyb0F9lHDjwjwQDOxXKO3CYKpJQcOAo699jLBxr4XiVT5ygChZWTJzowEo2rJw4SVUsDHHgZIUmTlFowlRVS3hTVS2sljDNwrdUbe1067cZqrRhnipuXKTK6xer6tpFqhE/V+GxM9Ri5SS1mjVAYaPbqu3Ublq6bZ6ufnBE588c0IkD+/XVzU/04If7krV+Hj05keu3279p165dGjlypAYOHKhFixbp8OHD+uyzz/50bBfJCv5tEhD82wUucIELXOACF7jABS5wgQtc4AIXuMAFLnDB/w44EhDvf6hrrw51VLVffsFdF7L66FJ2379nJ4RBEhGO3RCPq/Kv5vLV+SIFdSo8j86+9oLeeTurXpldX3nHzFTusZvUL/aAdr13Xi9F7la2YavUYFa8Fm7crc4rtup5kg/2BMTYeEcCImBilCasWK0V0SvUfV603t64XxPW7pbbqNVKN/zvfQl1SuBcdJ1aAsIB1p9pKdbmil9+uqRL776oPW9l1sEez+l03bw6H1RQV3L66jrHXnHc0t+YeDA8cCmbry5m9dYVi0cukYwYOlZff/7Z0ycgCBBTqW4CxR9//LGioqIcLxbmKKYqVUIsrKrates4Xiy8dOkS3bhxw7qWnQ/3rHtJPtzW7ds/6ZtvvtDHn97SN99+4UhIfP/jZ9pzIkJjl7VS88GBqtTOQ5Va51XzgbnUf6GH+i/3Vv+Ychq8o7G6rm+g6vNCVGp6KZVdEaSQDcVVZW1VlYxq7Dj+qODa1vKLb6WSka1UYU1LlV/dSqUjWqtoVBsVjWyn0qs6qsqyLqq5uLtqLeqpkEW9VXJpDxVe1UslY/uqXNwrKhPXS8USuisorrtKRb6k9vGTNWNrnBZFx2vUrFlq+9Zwhcx/RWXXvKxy1j1lY15X2bhBKhM/WKXiB6lE/EAHlkoYrNIOHKKy7FSw/i67dogqrB3uSCaAlRL+ByskjFTFhFEWjrZwjIVjrWvMLoVJFk55gm9YOM3Ctx5j4nRVduDbDqxiw6qJM1QtcaaqO3CWhbNVI2GOaiXMdWDthHmqkzBfddbOV+3Ehaq+camqblqlqhsirWujVcvC8LVRar56mZpOn6RaQ7qp65SXFL97td6/cVzHdm/SrrVr9dGZa7r/7T1HAuKh9QGwW2bf3n169dVXVb16dcexXfy9cuVKvffeexYffONIOBgwSS5XAsIFLnDB/8vAkYYcUXf+/Plk8eLFiw4dyxF29oRuUoCc5cX/3HfhwoV/aSs1/Prrr/8wduxtpYYcv/fBBx/o559/dtybVvjll190+fLlP7UFPfg+JUB30Ffne5ND+nfz5k0HDZMy5n788cc0t2VHaMz8YCdhLyUH0PL999//033Xrl3T999/n6pxye5B5v/cuXN/ejb0TopOtEfxCP2yXw8NmE97P5mv69evPzWv0BeOVaRvBjiGkTHxO+3RZ/g7OYCXP/rooz/aZH7MeGiXfpnf0opmHPa2kgLeWfXJJ5/8aezQhzlytlf+bmDcFGc4z48zXrlyxdHH3357vFU7OWC+2XHK9Um1kxoy5rSOl2exVphneIDdrtAaG/DfBejC+uT4TvtahM+gA89NDeiHWWdp4WnaZu0mxyv06YsvvnDwRlL3J4c8G/pwLwB94XXnNZxWNLIiOWAdw1PMhRk3n/wbWYBPlxIYHjJ0515kBf1G1jIOw6+sa9ZPanLLBS5wgQtc4AIX/PeBIwFh2WLX+w5z7IA4/4K7TmXx0flsf3MCAnxyLJMjEcHxQOn9dS2nj65Wy6ptI3Oo99xmyjNxvrKP3qiOK3dpzYHTart8u/4xYLlKTInWpJit6rRko14YE+eUgIjTM9a/AyZGa9jKRE2IWKeQyRF6ZfkmDVizWXlIQIyI+v8tAeEMaUpAPAXcvn1NV4721b6h2XSyTObHdOWoJZI7WQMe0/jfPG7JjoYHzmf11WmLNy5YPHI5u4+uDxmrry179KkSEADBYYxVnFRTsY6ju27dOk2aNEmvvPKK4+ilUaNGKzIywmGwYvRzH0kIXkpMEuK33352vJT6hx+/0e3ff3EkJ3746SvtPrZGw+fVV5N+hVShbT5VauumFsNyqf9idw1Y4aUBscEauLOlOq1tompvh6js1DKqtKKsQjdWVkhiuMpGtVVQbGf5JnZTkYRuqhDZTZXXdHVg+aiuKhnVWaUjOit0ZTc1W/myOq3orzYLXlWdOS+p3II+Kraqr8rGD1ZwwiCV590KCX0cuxcqxvZTl/XTNOudOM1ZtUoDJk9Ui8kDVX1hfwVHD1TF+EHWNYOte4arXNxoq41xFo51fJZPGKcKCeP/wIoJExxHHQUnTlHlJ1glwcK1T9D6OyRhqoVvWPjmY1z7loVvK3TtLGuccyyca+H8J7jwCS5SaOJiVUtc4sDq1t8GayQuVc3EZarlwOUWrlDdtStVN2GlwiwMT1il+uBaCxOt79avVK0Nq1RzfbRqW3Mbtn69GiSuV4uoeLWev0QNRw5Qn6n9tXFXjD6+dkond27R7thYvX/iku59fdeRgHhw95G1gB7zCEEjXjTdqFEjeXt7q0iRImrRooUmTpyorVu3OhwhnCT4BMcF3nI5MC5wgQv+XwVk4ZkzZzRo0CDVr1/fITuTwmbNmlk6t48WLFjgCPilFOz7/PPPNXv2bMd9DRs2/Je2kkPe5cRzNm7c6OgXQEBrxowZjt+SuseOrVu31uDBg7VhwwZHwCutcOjQIXXs2PFPz4AeBOpSAgKGCQkJat++fZr6x3uqsF0WLlzoCDrbdQ+6aM+ePY5+pDQPSSE0btOmjebOnetIiCQH6EfGZb+PnaXbt2936M+UgGDg66+/rnr16v3p/vHjxzvoZObLALThuEz0r502jI/vTT957tGjRx289TS8AkKnvn37OsZl2mLXY+/evR3PpD1+T2ke6Qf2Adc3adLEsYMSexIgmM58/ZX5aNq0qUaPHv1HW3agnwSo4+LiNGHCBPXq1cvxbO6DhwcMGKBly5bp5MmTKSYw/h0gyM5adp4fZ2S+oM/u3bv17bffPrn7X4FkDe/e6ty581+i17hx41IMbtuBgPT+/fsd8xweHu543ogRIxxB/H8HoDU0Z30OGzZMHTp0+KOPFDrRR3Zjw2/O/G6ANU2gftSoUX/woH2szsiObmgGr0A/EmjOQDKKNdOqVasU58oZeTZ8FRER8Uc78Jt9DT8NUtBz8OBBR1t2YMzI/C1btuiNN95wrJnmzZs7ns8n/0YfcG9qPEQbRgaysx17nqQPdFm8eLGDX2mX+UFuJDcP/7fA/w3+icvHcoELXOACFzwtoN2/IgHxymBdzFxAZ57Lp5NZvHQhm69u2oLPfztm89PN5wP0froAfVAkp7YPyKOuc9or59Rlem5EoirP3KA577yrTqt26JnBq+Q9IVrDV29U58UblGlcnNKNJlHwJGEwOlbPW/8uOS1eg1Zv1otLN8lndKTazEvUayvWq9DY1fqH46XV//kjmJKCvz0Bcfd9XT0+SAdfzamzHjksGgbpZoYniYekaP1vouGBc1l9dDKzt848m1eXshTU9cGj/1oCAmccJ8PsgsDIJHBMAHnv3r2KiYnR6tWrLed/rcNpJyBCxRLVM1Rq3b3LvXcdBu1vv/2q27//ZrXzuIqGl1QffC9WY+c3VosBXqrY1k0V2uZS8+E5NGCpuwav9tbAhBD129lGbWOaKGRKJVWcVF6hq2srZGMjVU5oo4pRvKT5FRVJfPy+hCrRr6pqxCsKiXpZFWP7qGxMT1WM6K4GK3vp9djhmpQwWf0WDlHjN3ur4qwXVWpNf8eOhCprh6lS3ACVW/u6Sq/rb7U9WF03vKWZ70Rr9uoVGvTmJLWdPkx1VwxTaNxI6/qR1jWjVCl+rCrETVaF+Detv6db+Lb1/WOssnbGE5ypkLWzFJo4W1WTwGprZ6vG2jmquXauhfOsvy1MXGjhYlVfu1TV1i23cKWFqy1cY8NI1bCwVmKUA2snkjwAY1QnMVZ1E+OeYIKFa1Vv3VqFW/PUwMJGFja2sIn1fZPEGDVYu0J14heqZvxyha1PUION661rEtUsOlHtl0WrzcSxGvzWSO3Yu8ESQtd188RRnd6xXZ9fuKF7392T7ljO/N0Huv/gvsPIhV9Onz6tIUOGqHjx4goMDFTdunUdDg3HMuFwHzhwwOEsmWo7l3HsAhe44P9VQEcSRC9WrJjSpUuXLD7zzDPKkSOHgoODHe9kIklAkN9ZfvJvEhoEnpJqJzXMmDGj5s2b59D7ALvXCKIlda0zPv/88/Lw8HAE9ZYvX+4IuKUGBGLHjBmjrFmz/qktHx8fxxhTAqpzSXjQZ/u9yeGzzz6rXLlyqVKlSo5AIJXPBkjozJkzR1myZEny3tQwW7ZsjmA7CZukALuIQKSnp+ef7mNOp06dmuLOCX4j8BoQEPCne0GOxSRw6nw/thoJF8Zsvz5nzpwaOnToH/0k6Mtcubu7/+m6tGKZMmUc/AZgI3L0or2tfPnyOexFw092wB7Edqxatarj2ueee86xc/LEiROO33fu3OkoZDBtPQ3SFsFi3mFmBwKp2KwEnPnd39/fwXv/+Mc/HPfBw/Q5NDTUEbglIJvSDo6/AqxREkoEeJ3nxxkzZMjgsKNIshGYpwo/KVqSyKE4KHfu3Em2kxqyZtOaNCQgTbKNtW7ux84jYfRXweyyJhFWuXJlR9vp06f/o/1MmTLJ19fXEYhnnFThJ2U7YleS0KtQocIf96aEzDvyAz5jPtauXfunXRY8g3GRpLD3J63I/JIkBEh6sjs4qevSguXKldP69esdbRnA5ma9vPnmm471XrRoUccaN3xlZB73ksRBBiUnl+Eh5CIyiXu5j4Qgfh3+HXY864rfjNxJihf/buD5yAL4IzIy8o/P2NhYx3pIig8MQB94JT4+3tFGUjrTAN8jw6An8vbdd991PNtcb3iBxCW6iR05fxcgC9ldgi3AHDFGnkNf/gqN8dlpD35hHEkl1gCeS4KYZxnagjt27HDQ4mnB8CPFiviC2DdJAf0hiWnmMjo62pF85P7UgDbxIzn22fSXv51lvTPA94zL3GNH0wd0Q0pFBC5wgQtc8P8KOBIQlm126dWBOpUhl06my6yTBJgzeeoWweecT/BJEPoa3z352wSn/1KSwmqTdxTc+keAPiIBMSi/2s7srmxT1yjd0LXymhSvN9bt0WvRO5VtdIzyj43Wy8s2qOOi9co+LuZJ8uFJQmFUrNKPjlPwzPV6ZflGNZwZr9yjotV4znq9tnSdik6M0HMkIEzCIjX8DyUglvxNCYhf732uq+9N0uEBBRwJiFvpAnSD5AM0TYrWKaB9/pKby5tWu7x8+kIGT514xs3ikUw6nT6Prgwdpa+/+FzJnXGTagICpxbnC0OLQASGPQYSyn7JkqUOJ2TatGmaPHmyVqxY4XAmcWjv33+gu/fuP05ikIyw2uE77Lg7937Xexe2avryjuoyooiqdXZXhfY51XhoNvVfll/DYnw1eFNVvb67rZpH1FelcaUVPLGSakS1UeWNPVUhto+CI/urQvwwx4uXK8ePUO3okaobNVw1Y4YoJH6gqsS9phqr+6jDylc1a+ObWrdjid5eOl7tx/ZQ6NSeqrhykKokjLaute5PGKZKG4ar/EYSEiPUKfEtTd8SqUVxkZq4eI56LpmiBlETVDVhgkLXTVRo4mRVXjtVwQnTrTbmKTRhsfXbkj+wGsmDJ1h97TLVSFym6onLLbT+Xse/lzuw5trlqmNhXQeusP5erTqJERZGqea6GAvjLEywcK2Fiar1B65THQvrWoZl3fUbVXcduMnCLaq37h0Ltz3B7Qpbv0P1LGywdocaWdjEwmYWtkjcrpaJ69U8bpnqrn5T1VZNUz2rD802x6hx3Go1XLNabZevUccpkzR21iQdPLxLP3z1hb7/6AN9cfmCfvrsC93/5Z7j+KX71jw/NpAfL5avvvrKEcihgopqKZIRPXv2VI0aNRzIv/ft2/eHcZuS8+ACF7jABf83AwEOAv5pDbQSBMufP7/jKEQCMM5HsyCLCbTUrFkzyftTwwIFCjiccQIY2AHbtm37I0CcViSIX6tWLcc7gVIKKNA+fSUoR4LF3kb27NkdRQ7JAXqDIG63bt3+CIqlFV944QVH4HnmzJl/BJdJhKCbTCD6adHNzc0RvEsuuEegjAAgAW77ffybivuUjtihahmdWrBgwT/dCxKsJchkpzN2G4HzUqVK/cv1Xl5ejmpo+A5AX0+ZMsURbHS+Ni1INbcJPHNECzQgAGp+h9ZUo1N04Az0mSCm6SeBYOaTCnb4eNWqVX85oA5dobfZAQG/cGTM5s2bHZXsBLjh0+Tmm8B/3rx5HTsiKLr5O44XMsDYsIEI2if1bGekj6wHijrGjh2bZOCThBM7ZJwTeWlB1h42WloDbzyfBI6ZG5IDXbt2dQSpnxaQARxLNGvWLEdyNU+ePA7aO/fRIHNGIo7ns4vF2X7E/8A/KVy4cJL3p4QE3knEHDt27I/KfuaKXT1U/aeWLEoKSUxSeMM42YFQsmTJJK9LC8Iv8I0BZMaRI0f04osvOpIzPCu5PrIOWZfIZYLxSQWXWXe0ZRK6JL7YCcS19N3oAfiRHUYEmhnXfwrwH5EpBOTRZ/SHuTfIDmuS8adOnXLs3kmqL8hOErwk+NlRw7XJ+Rx8z9FS7FIrUaKE45N1Za6nP/Pnz3fwFnNBAP3vAOQguqxfv36OfqKbGB/JJHbIEVhPLpCfHLAW2ZUEv5FwJlnvDMg0kjMk/aClnbYkYNm1npJecgboRAwAWYJMZ00776pijtA9mzZtcviIZk6DgoIcMgR+Tu6ZtG8SyOzU9PPz+6O//M396NnkbA4SMSS4nfnIIN8j70mEJMcjLnCBC1zw/wo4EhAcvTjlDZ0oXFJHs7nr6Av5dM7CGxk9dSObz+OXD+d4nHz4WxMQWf1141k/vV82pzaN8lL9N/sqw4QopRu2Vm4T4jQ8eruGWFhoYpxyjo5S24Xr1XHBWhUcF6l0YziC6X8SEBlHx6n6nA3qumitykyKUJbRsQqflaiXFyao7NQYpef6/8UExGVHAqLZ4wTEnH83AfGzblxcomPjg/T/sfcWgFUd3fp3oMXdLXiAuru3tLRFirtTirWF4u7u7u4akuDuxENIQpBQoC7UC8Xh+eZ3wtx3v+eehND2vf/73e5FV8/J2XvP3ntmjT3PWjPRAXl0Mp0pg1xG83rlcRrUu/zs9xOoKSM2JD+do5SxBX/FZihsbKOgwnIXVeT9TyhxwkSd/+H7P0dAMPBmwMWkBOKBiQ8DCyaIrVsnfzKRYwIKsNy+fXvhXYD3EJ33tevJAMb16zd17SppsdwOad/QyTOHtGB1F3Uc+oIqtyutF1rk07tds+mj2QXVa3Vp9dz2sjruqaPK81/Vk30r6KWRL+qt1W31fHBvPbGij15YNkAvrRqql1YM0RtLhqrqwuF6z2jlxUNUafkADxnx3rxP1GF2Ny0PmqqIXau0cu5Yfdy7raoMbKM3ZvXS6ysH65WVgzzEwgvBw/VM8FC9YL43XjvRswn1vPWrNWbpfHVYMkVVV47Tq2vH6uX14/Vy4CS9tHay0Rl6be0CvbF2qdHlen3NMo++sRZd/q9Pz94KKzxKlELFdSuTIxXWrtI7a1fqXY/yfa3eXheoSuuC9GZgMqHwVuBmc26yVkIhGNZt0jvms3LQNlUO3ql31u80v+3S24F7zW8HjB7Su+j6g+bYQfN5SFUCD+k9ozWM1gw8qDqB+9Vo/VbzrvP07hyTn5M/UaWlI1R/43RVXzVBb80eqxozp6jh0H4eAmLfgd362Qzkr128oKu/nte1Cz+bMr2iq9cgmq6Zydq/PHQAciCmIB8IGWfyxcSYwTQTPCZATBAtUOMO9FxxxZV/qgDm0beWKFHi3wCjOymAEn0wXvzONhRQAY++Z555xud1qSnAEsADy73QdwNkQwLgPevr/NQUQBuQEHAxJQGIALAG6PW+HsAVAIMxiC/h+fCCJNIjNcAyNaWPArAgLYAm9rjyJkLSqvRvOGH4AvbIR7wrAVm806ccWcoGIiAlIQ8B8X1FKTD2YskrJ+hCWtgURJXzXMoXEJHxnI2Y4L0hQAB+neemRQG76dstIA54x99OAgIigDGiL7AOQoA9ogDWOZdnACxkzMk4EucWZ1p3o9gPeWafDeAK5xmAK475usaXYscs0QSw9nctN0MdxdP+xRdfvGtQ+6mnnvKQKE5CBPvFQQgv/T8TwQN5Rr47Pf9TE0gdxvu2bCBPbbndrQCUMhGhjbmbvAAEZpzJeNMpjCvHjRvnASR9XXcnJS8ghC1BRz7j7Q5JerdEJwoQCxlIOgD/gJy+zruTkjeA0XY5M9pF6hRzsruJXoIsIqINUs3ZZtCHALwSaWPb04oVK3raWJ4dEoD2i98hwT/++OO/vORWasL8kzpH/wAx5XwHp/LuPDP9lK8lxLAv+knOhVxKbTk4mweA1JwPMO8E7mlDiOTmGPWQvPmrYt+TJa18lSMkH+UOMJ9WoV2lL6JPIg3KypsYh9CAWKO9Tol8pq1kTp/WCDBIZshs+x70397XUl+Z/0Hoed+P+SEEGEsy+iJcIJMg28EdfPX5vAfvQ0Sed1tNfSFP7tT2v/DCCx6iwp2XuuKKK/90uWHawfOm3f105y4dGzpSEfWa6dBTryqyaAUdz1pCpzIXV3yOkjqau4yOO8BpvntA6tvkhAWw06x5yiopm7k+Y2mdfDmPlg27T08P66X0LK3UZ41yDVqtxrM3qPPCDXpy5Crl6rtcb09Yo1bTVunJYUuTN6Luf5uA6LNCOfqvUPUZIWo5e71KD1qqjH1X6rXRK9R68go9P2a1sg0055K2N9ngS/9mAuLGzVtKiNihWb2ra8wHyQTEuROR5sif64Mumb7vs7Mhipn6tKIeyavEdCU9ERBEqvjM61QUcsmWYXJ5Jv+eaDQ2TxlT9qV0KlNxJRpbiPB/QIeefV2RDVvp+IgxOmPGRz+acTQEiy9JlYCgA2dwxKCCwV2DBg08nTMT2HfffccM5v61NikDWgZQeOd4CAiTBsTDrZsmC2/c0o1rbGzNAI/Ub+nb748rZPs49R1XRQ26P6S3PiziISDazCigHmtKqPeu59Vx33t6c+aTeqx3Cb0+/hVVWd9VLwWP0dMrx+iVFaP16vKRemnuYL06qb/eHjtQ1cYNUbXJQ1V55iBVntFHdSd30ScTu2rF4gmKXL9YG2eO1/D+XdR6aBc1mDNMtVZN1DtrJul1yIT1U/Ts+kl6ac1EtQheoHFbgzVj9RoNmjtXH8yfrirLZ5jzZuvV9fP0auACowv1xrolnqWOkkkDo2vR9R596780UG+uDTIarDfXBatSIBqitwM3qPK6Daq2NkTvoXxft8n8tlXvBm43x3fqncDdRvfe/tytykarrTcauEvVg3apRsh+Vd9wSNWCDqtKYKiqro9QteBoVQuJVVWjVYJiVNlolaAj5pwY1TBa2xyvHRSlekHhahmyS21CFqrm7I56dkQdvT6jjRoG91fNlb312uSuqjS2j6r17qBPhvVQ8NYN+va8HcCyJNfvunzjoi5dv6zL15KX6bp546ZnohJrBn94kjK5BuDBC4cJAEs1MFFlUEu4b2pr0briiiuu/BMEAgGA04J5TKzxxmOZIPpbPNxRADq8tp0gHQADXuLOST4AuBOA43yu43pnet7K/SCHIQ0AGJmAkxZLe7AcEmkBwLGEEOCLd1qPPfaYx0MfQJ1zAakYFwCc+JrMM8bA05jxg30nwGp7PeA2ILoFAr2F8QnLZHBvrgdcB8AG8HM+F8qz8n7kq3O5Hd7DRg8AVBHJiaetzXt7jXOJJ67HS5X+zaYP2QNwwvjHCQxbYf8sgBHAP9Lgee1yLrwzYyuWZ0lJWEoDoBHwhGspB/sOAKMApE4wkaUv8C4lLyE8bP7ynd85bgWwhvtny5bNcw6fAI2Afs489KUs+QIwaYE/vIsBh7yXxML+WD7IGxRibMn+BpZ8w35Yax8PWModcoJlkigHe0/y3klKUF/wGOZ5nTaJhzZEnPWMBlhk7GHLACXvuSdjE67her4DoDnBZp6feuANdv9Zob7imGG99CkXIo+oo/b5eRbeCftzPjP2B2EE2WOFfIU0xCubd+I8wDyIHZteakqkiDepkZJQl6m35KUtZ7ysmSP4It9SE6IVsB+8zZ3EHO/Ie1OvbJmSV3ZpIKuQb0TQOElKAGNAYogEzqGeER1AWt7v7Sxvm2+cz1Jqdnk2nhGbxO6ocyjE3hNPPPHf0vNW5kp2Lxtsmmgy6przWWg3WfLLvpO1SZaQctozZUsUFKA/ZUCbgoOPEzymnpMW+WnrA20cUU+2vUGJlMDbnogHK6TJ3+yzQV5THoDERDcxvqeNoT2njaV8OA+g+z8h2DP5z5zS5g2ftO28D/WET/KOZ+E4fReRAt5tDOA+7RT2ACGZGknGtXjX096QRwDozjoBEUw7T/vDp9375q8IxADkHW0g7TV5z7uhtt+l3WcZr7TUL8oKgpm9WbAllIg3Szhbob+hT4LgoM2nDtu8JV+pE9Rvlt0iOoM2NDWxdZk0qCOki804+37SIH+J3qR9pUypR1xDW0VZUk7UX29yi2sh3Bgv0B5yHnXX5hX1k/aB31mizW78bgVSnuXEKDvb1jqV56AvpT+ClHfFFVdc+acLfeIPP/2sb7/7Xl+fOaOTW7YqdtwEHf3gYyW++K6O5aug8CzFFJmrlAecBqhmg+qEnIDUZXQ0V2kdw0v+NnCdVsVj/3TWsjqRvYTiK+fW9PGPq9yw4fLru15+/VYrU7+Ven78OnVZGKK609Yrd78Venz4crWdvkrVJ65Srv4rPHs/+LEfRO/lKjBwpT5avEWdl25VkSGrlb7PCj09bLFaT16malPWqcCQNSZtL6IhJf2bCYjrN27qaOg2zej1nsa0eUprJnXS2eMsQ+sbuL+T4A7+7fkDil32qiJeyKP4DP5KYmPvu9x4mmgHyi4ud2kdN9ey7wdlSxlTthE5Syoiq7+OFXhAia9U09H2n+jopCk6uX2nvjt7ztPnQkB4j8ms3JGAQBmwEYrJgJMBb/fuPTwd/LhxYzVt2lTNnj3L41nABObUqZOegTaDjhs32GTYZKHRmyZHPE7ytwmI337/SvvDl2no5AZq2fdx1epRUtV759H70wuq8yp/9d71pD7e86Zem1JOj/cuqLenvKJawb30RvBUvbxmqt5cM0GvLR2mZyf10BN92umZT9rptS4d9WbfbnpzaHe9Nbyzagz7UB2Gf6RpE/soeOYoU6jDNG10fw2eMkxdl01T2+DFqheyTJXWLdVLaxfpmbUL9HrgYrXZHKSxW7Zp5JzF+njEBDWaNF1Vly7Tm+vW6o3A9Xpj/XpVZPkj8/3dwGBVDtykd9dtUpV1m41u9WjlQIgEMwhcu8XoNqPbzTk7zG87PVo5cJeqrdulGuazpvm7Jt/X7dF76/epWuABT8SCh1QICvMQDO8Fh6pmSKjqbDisOkEHVCd4v+qGHDIa4SEVagbFGD2qGiEJqh5yTO8ZrRZslO8bElVjwzHV3pCgehvjVHdDrOoHR6n1pt3qtHWBmixsqxcGvaznhlVU7RUtVXNZa70wupFe6NtEz7evqQbdW2je2sU69+03uvjHRV344zdduvmr/rj1uy5cv6jL1y57JoC///q7J5x3hplYM3FhQM2gkO9s0MnEq127dp6JN6CHDbN1DlBdccUVV/5JAmhrwQLABsAiwE4m23ji4aWIAipA7AK2WkCZiTjkLmCUFUAh9kWwYB3gBZ6cgF/O9LwVr0M2FQWYsIQGIDBAlfUaJE3WxedZvNMCbGCpB0t8AGABgLEMky/wAkcFlkCyS0/x/gDf9npAEYAIX8vNIAAtbIpqrwfQAFzHy9j5XCjPSn4CKPFMluSAwGGTVTxbeWdALwgT8oJrAHXZn4IysfcADGRZEvLKps/59H2Q6t7vynMSoQCoRZ4AzpAeS17wzpQlYDke7L76Qn7jmYgi4LkBAAHErb14ExD0xSzNZfMRUIcIE+6NEjHiBFhYWoWoF2tT9Nl4lvO7Mw99KbYLicA7InhVkz/ch7SsAn5Slt5euACeePcC9nEezwwhxLjTkkKAiuQv9+OZWAKFvOR88hKPcrxuvesLhAP7XJAWYBSb89qIEK4DXAO4gnBj7Mo1XE9eAvBjG04Sgny+Gy/k1ATbx66cSxiRD4Dp9vl5FjyseV/u7SR1AMywKSvkP9EdNpLEPi+exjbvUlMAcsb5vuqpt3AOXtGA6Lac2Q+Asrd2kBbBriEyADitLZMeACLkBuNECD3ygXJnjsE4EtCS8uN8bJuycpKU2DZ7OVjAHTAfIpO0vN+b8iQfiUAClOR8ypxnoj4itKfMd2yUFs/KceZE3ul5K+nTpiQvS3vdY4ek6yyTpUuX/ps3OPdhnsXSdFxvzyOvqA/UC4BoiGeIBnsd70ubAqiMLdg2jHQAVSEknDbEuTgCOQWwnXYNQor2lyWLsAvKimfnWSFVAMYhZbxB7b9LIJGor7ST2ARtPEQO7bHNE97NLsVDmVGXIJC9gWf6PdoL2kxsKDUbpe1kvxpIdpS2yLbJ1l4pK2yF6Ky0RgylJLRNvAftL2VCe0SkHO+IEomD/do+wpdnv1N4RpwHaEtsWdPmQQw4ryMP2KMBGyB/eSeidGzeUldwHMMGmMfRjqS2BBTpcS39r20TaD9pk52CLRHRwniCNo/xAnWbPOD+9HFcC7HAb06hj6adp86jRHXQPnIeStsJ+c39cSIgXadAorC8Eu0LRISvdpHyhVS62+WuXHHFFVf+Lwpt+3kzbv/B9HW/X7+mn375Wd9+dk7fHY3XuVkLFf3CO9qXpaiiMvt7AGsiH6Kzl9bR7GU84HV4ztI6YtSzBJA55gvo9qVJOQM8BERSAX9F1c+j4VNfUNGRk+XXd4NnqaR0fVeo1LCV6rF0s3os36oig5arcL9Fajh1tZpOX61iA5eYc29vLN3b9OlD12jkuh0atm6nCg9b5/mtwuAlajVthdrOWqtyw1YoXR/O9yIbfOnfTEAwjorcH6Jp3StrbNsntXL8h0qK/2tzjZ9/j1JMyLsKfTeP4nMU8USTkKe+8tqXUlYoZRcJiZSzjGKyllZUttLJkS6mbCMzFdX+bP6Keb26Pl+0Qt/GJejbzz/XT7/+ogvGVs6bT+Z8KY250kRAMHgG4GBCd/hwqGfSGR8fZwY6x3TsWLz5O+q/JqtJSac859+8CflwKzkCwozfbpqxj2duY77fMl8uXvxBEUc2aPiUFmra/SHV6lFMtQfmV4upBfXxykLqs/tBddr5ot6YUFxP9cmjajNeUKOQbqoaPElvrZmkyoFjVGnlIL0wrase7/O+Hu/QQs+3b6NXP+mo13p31msDOurdwR3UYsTH6ju6syaM6qEZ4/pr2pQRGrdwigatXaxPNgSqacgGVV0botfWBOnFdcF6O2iD2oRs05DVm9RzxAy17DlKDcbMVc1lG/VO4C69tW63Kq3fpXeCdurd9dtULXCr3gvcpurGsKsTmRC4J1mD9uo9o9XWo/v03vr9Rg/oveBDHq0efFg1gyATDqtu0CGjh1U7KFS1gsNVMzjSHI8258WoekiM+TtKtUOiVW9jtBpujFR9c369dXuNHlCD9WFqGBSjBiFxqh+coDohx1QrJFE1PHpcNTacUK1NJ1Vn4wlzfaLqb4xXgw1x5vwItdq0TZ13zFK71e+r4tAn9Gj38qo0/U1VnVddz/R/XQ+2fVEVGj2jtzvV0LSgeTr+xafavGWz1m9Yo+9+/1p/6IJ+v/abrt68omtXr+mzc595PBaZ/DGABMhgYM2yAEzgGFhjI9hSso2wJJexkdsDfFdcccWVf5rQdzqBQ7wPLfjlLYDcTNqdS+sAWjg3XwSMAziygLIFIP6M4MHApN2mhVckwFdKwtgAEIJzAQIAowErvUET2nyWPsIz1YLwAMl4HgMocT0ACksiARz46iMAi+hXLNACOA8Y6b3kg1MgVyBsAFa4hj4KoNPX0h0I9+B98cbmfIAPPF8BAtMq5CGevJYQgkBgrWreDSAGMNXul+EL0KOfBJwhfwDaAH4Bl+078J31tO0gD9Cd+9koAby/KQfyiTKhf3ZuNgz4bskKFE/r1JbNSk0AtbifTcsqz83yJ4CbTpAbO8eL3doX3r/ewJG3cJz84nzKHPIO4Cgl4X68I8CpJRTId5ZZoeydXuAItobXNKCt9UBGAYaxBefz/1mBqCKixb43BAykjy+hPkN44RFvwT2WWWLwbusFdgoZ51zKrHXr1h7Q7u8W6jLAtXMzdaJUbMRAWgXwFsDYpkM94DvPDQnkTVYBugMmey8zBdho9/lAaFcoa3ucOu4NhDqFemPBfJ4BG8FZxtoUz0G7ZElLIm6IRPi7hAiDJk2aeNKmfBk7QyCkJgDRRBfbNoBngmAAoKVOeU/4GHNj6/QV1oZodyFmrIc/tsS4HHIZL3NsH8982iSOYbMA+LQ/1B3y9O+oC76EyDa7LwzkAe9FufoS2kaeiXMhlwGWnUK9gJygH6SdTE3IC4gFyBxvAJ13hdzGniAgmOukNLFOq5Cn48eP9/QN9AvUB2f/BbnLUmdEuVD/nUSzL6GvgdiEsMGOKWvISto/Zx9MOdN+0O7Q9vtq15jvMxbhHPI/tbaEfpXnpP3hvrRr2Ah7hFjh/pCU9FeQD/Tz3mUK2QrBSDqQXc5nIiKCus870Wcwl/QW2knykb4SG7LCvSHisBPe9059jCuuuOKKK8njIyJ/fzh/XpeuXNYl8zc9FDGn5899ptBPemhP/rI6mi6/TucsrYQ8ZRWZo5SOmu+JucooNEdp83dpnbhNQFj1BXr/m+YI0KdZyurTkoW1r2VhdZpaRflGzJFf300eAsKv3wrlHLBCdWeGqOsiMwYYvky5+yzWkyNX6J2xS1Wq3zzd03eZPAREn5XyH7paQ1dv0cjVmxQw3FzfZ4XyDFiut8evVOspy/T04PnK1HuRSZu9I24TDSnp30xAXPjtV+0Lma+JHV/V6A8e14IhTRV7ePN/mzffjfx25YSO7Gmp0EZFFFeggJJMXiaZPPWZ115qy4gyizBlB4mUmKOMYrKVVkT20jpmjlHWsX55tadwBUX2HqCfzJySkckFo5fMfOSSGUvhcICmNE5KkYDgxbkIZXLDwIxBC5MhBkWffnpacXFHtW/fXo/HyNixYz3KYBAPFAasyZOjZPWQEbf/vG7S+/XX7xUWtVnDJ7VW7Y/K6+0P8+q9fnnVeGI+tV+ZV/32lFe3bU/p7TFF9GLfXKo/52m12/yhGgcP0nurBqj6uv6qFjRAlZb302uTe+i1wd31Zp8+qtRvkCoNGao3Rw1R5fED1WjqILWb3F/dxvfToCmjNHz2FA1aNE+9zEDyo8AQNV27VTVW79S76/bqraC9qhq0W++v3qo+c9eox+CpattngppPWKEGqyARws15YaqyPkzVIBHM+TXX71Yto3XW71WdoP2e6IS6wQdVJ/iwahutFRLm0drBRCpAJMTc1iOqa7RBSLQahkR5Puvx28ajqrMxTjU3JqjWhgTV3hBvzjuq+kYbbTiiJsGRarjO3GPFTtVbsUMNVx9Qs3WRahYUa47FqWFwgjn3mOqEJKqm+V57Q6LqbTquBpAPJq0GJo2G3DPosFqYwewnOyaoy6aWqjHhcT30cSE9N/gRvT72JT3a6WGVrB+gErXL67WulTVtx1zFnI1VpzYfq1mDJoo/F28aoQu6cO033bh1zWMjxxOPe7yW7JJceM7i4YoXESASEznOQ7ANBpfY2X9qEuOKK6648r9ZaAcBB+wyExZEob30JZwPMMAk3noBExGBN65tR4kYAES26QEI4zn6Z4RNXpns27QACJ0Te28BUAEk4FyAAt7FFwHBWAIAxwL7AER4IfMekAj8BuBHPwII5GsAA1BDH2OfDTAOQiIl70X6Hoga53JDgI4AVCktJUJe4glqywdvVEA5gJ60CPck7wHMKS9APwBz1v8HxLSAMSARgAv54i28O3kF6AqJwHrngNeWYACAZdxFHqMQGZQ/IBpgEGVA1APkCfcnGsbeB3sCfMIrlLR4RvInpU1AUxPSsgAQaVH+AFGkyfcKFSp43tnpNYynLb/bewOipmT7CGCoXQ6HawDHIITsJti+hHEHHq82isfehygR7JXn9iUQExBklrQAJGR8c7fLDPkSPLyxbdJFsX/KIaWBOvZGBAllaK8hGsqWE5+AlwB7HCO/eWfvevd3CGUAmO18FmwmrXUCoa2C5LFkJYp9Q8zRvqUEsnJvSC6IKsqR66g7AJtW8MS29oECOrKEmS+h7Jkg4WnONaSJzULgWhIYQg8S1qZHWd2JIEircH/afyJISJv6CVGHZ3dKZcdcDCIAj377TLSjLLPDs6Y0noZ0pG210Ua8KxHJzOcQAGbaatoXvN55Z0Be0gOAgMQGVCbvIee4198t5Ae2DOHDM/KO2Br1NCWhvZ85c6YHdLf7F9k6jb2w7BJpQajcac8G7kMECXWePhZbtEJ50H5BBpA/zGusUG/JI0Byu+RbWoTzIQwgNCCUIPCd7RH3xD6wTaIVcOJKqW3md9oQzqOMWFKJsiZd+j3nM9EG05ZRh+mbvAlcnoFrID0oAyIHffVNCJgAfSL5D2kE+E8eYVvOZeLor7kn7TDn0Gc5n8neE/unP4L0cPYVkP7YJn0gaXuT5JQB/Q9jFIg2xhJWsBH6DfKFcqWPpLys8g7YiiuuuOKKK/8S2tXzpo0kCuIP047+bvqBX4yyN8Rv5jNi4WLtffg5xfnlUFLmoorPhcd8KcXnLq2TtwHsiJyldTxXGQ+onealmLJBQJTWp4/kU/BHZVRvYktlH7ZYfn2Db5MAK5W+73KVHLpC745drrdGLlb+/kuVo99Sle43T4V6z1Um891vIEsrrVSegSvVYOY6fTBzle4bulTp+61QOpNGiSEr9NrwhXq83yzl6rUgedkmu3l1Svo3EhD0e99+eVYbFw7TmDZPa3TrxzWl67vaGzJXf1z03eemRS7e+FrHjwxTWKfyOlIyh05lNvmfvVzy5t6+8tuhliCCaIB8iDJlSFnGmu+UbYL5TMpcRLF+ObX3iVcUvXKVLhjbuGbe5RczP8Iu6HP/EgFhlUk0gwcmTQyQ8CKZM2e2GUyM8ITFEhZt1yhl7el/hfczkGKAcdMMNG6YjGZPiFumo7+ib7/7XPsOBWvktA6q+eF9eqVlDlXqmlt1xuRV2+W5NGB3SfXZ+LCqjyioiv1yqe2SpzRgT0t13vyhmqz4QHVXd1Ct4J6qvn6Yaq4cpzoLpqvuzPmqNX2x3pu5XFXnLdd7ixar9pK5ajh/ulrMnqoPF8xXp0XL9eHidWq3cotar96upqu2q/7qfaq9PlzVN4Sr5vq9arNikwYvDNTIiYvUa8RctZu6Vs1WH1bd4KOqsT5WNYOiVSskXHVDDqp+8AE1CN6frObvBiGH1XBDmBpsiFD9DUQtxBg9Yr4f9RAAdTceU90NyVrPaEPzW6ONcWpIZII5BllQd9MJ1b4dtVB343HVN783MOc1DolVs/URarp6v+ov3ar6izer+Yrd+mBtqFoHRqplYLSam+drBtEQFKfagbGqE5R834Ybj5pnizLPGapGwYfVKHCXmgUu00fbh6rX7mZqNu8ZPfpxQT34cSk93u1BVWhVWv41C6tYnZJ6scebGrVjnHaf3KmOrT9Uo2qNtSdmv3689pMuX/vDlK6xkevXdO7sOY9nHEbFesBMBPG8AtyxA00+rWKUKDbmiiuuuPJPEzpplgBygkIsh+CcuHsLE2aAOrvECBNugAcL2gEmALByDMWDFM9z+nEm2Skpx2mLLQDCdzwFAfhsWniFpkRmcD5An11OBDANcBxw0Ak0IADGAFx2I0mIAIgNAH+89/kNIJBxBWCfL0ASQMJ6DqOAFpAJAHTe7waQAZgEGAXgbUFl3g1QJyVwhb0S8NS0ec217CuQWpSFUwC/e/Xq5QEtuZ5PltfCSQMQ0RIbeGXiwOELaONe9Kk8M+ANQDTLYVrygjwGbKHcOJf0IQF4ZoArwGGWtgCc5v6QNOQJwnsDCtnoDM4BpPTOP1+KvTjLFQATYNLasgXqSJuyBDjiWWz0CM/LeMHmgT3uXE7MW8hPxpw2Pylz7umM6HAKNontA/bbMicPP/nkE089Sk2wI0AwSCd7HR7jDKj/ivDejKOdxB7gKICmdz2xQl4DstqlwFAiBSx4zLsAnFovffIc0JD2xVfZOZUxmK3zaRHAOkBTW3fJVwDju9kPgHMh1QAESYN2j7YFEo53TU282w67yTNCeUPuOaNwAM1pV7zfm7zhd7zaabNsHSAPAThtZAxRZ2zGbNPjOVn6xzs9b+U97pS3gMY46dhypc5SrkSTpHQd3uYs0UR9sdcwB0uNhEOwLbvfBteR587l++hzILV4PyJamOdBtlEPiIogz7mWexOBkdKk8q8I7Tx9Du0+78VSUN4RSr6E9pRyZzktytSK7St5V+obz52aEElDhBjAPHlDXluhPGl3sQ8iA5yRFsyNIartnjhp7R9sVA/AOu0w7Zu3sDwaRAAkE/XDV9qULaA6ZBvtFe0bdsR3yotlhZz2hH2SFu0ofRplbW2WT8gl9pwg4pE+krzFDryF83lfno10WM4Osht7hpRwtrEQMywNhe1BMviKIuQ5IZTpE2jnnSQX703fRP5THylL+7wo+QRxCDFPOTijL8hX8oRn5BlYopJl1FiyCcWRgfkq7YcrrrjiiivJQj9PO04bShvM2O0n85229/LNGzrGEng1G+pIxgI6nj6v4rMWv01AlPGA2FE5SyvC/M1yTE6QO1UFJM9SXmeylFLSazk0v98DenFcT2UYvEp+/W4TEB4iYJXu6cvSS4sVMHCRsrHvQ9+Vyth3iTL3Xar0RDOwubQ5L6M533/wcs95efsu8pAPEA1sVp2v/zLl67NYmYiYILoizQTEiNsERD/d/D318VdKcsPk75nj0Vo3vbcmdXrD6Oua3OVtbV46Rue/x5n/9ol3KVf1uz4/u1xhY55QxGOZlJSpjE5nuzMBwabT7PGAJpjv4TlLKTpXac8x9vPwEBCZi3nKOjpbQR2u30InoqJ0Wbc847cfjW38amyEse1fIiDs4JnOncECEyQmYHjfMUijk2fyyyQTj8InnnjcDKbHOQYWyeSDMWEzQLpm0uLzpi5fvayzn5/Qlr0rNH5eZzXq+pReb11Qb3UppFqj8qnNspwavNNf/deUV+2++VSlT071XPuk5kbX18Q9tdV59btqvbauPtjc0ehgvb9hkj5Yv0At1qxT49WbVH/NdtVbv8voFtVctVrVFy1UvUWL1WzlWjVduUGNVmxVo1W71XS10ZU7zOc+NVofrjobwlV33Q59vHqjpgdu1sIlazVi0nx9NG25mq/aqwZBsaqz/qjRaNUNDlP9DYfUcMNBNQpB+R6qRiaNRhsizfcYNQD03xRv9Jj5DpFw0lyTpLohyVpvw0lz3gk12piohuZ4g42nVG+TObbptOoYrbvRnGN+a7DhuBqGxKtJ8BG1MM/ZYvV+NV6yVc2XbFHH9QfVbWOUOgaGq/XKg2qx6rCaB0aq8bpI1VvD+0SY5zbPY563QdA+NQjcpUaBO9R4zQY1XTNH7bf0Uq/9jdV61Yt6ppu/SjcvqtJNS6hkPX+VqFVExesV11NdnlfnNZ9occRsDRzR2wwMu2nTgW367vfzumbK9YZphLARwBMGkBBQTFKdwnEaMY4zQWDgTQOGjbmDPldcceWfKAAngBrWm5h+FODACaJ4C57GgI0WMANkYINfADXaUwA1vB8tyMTyTiwrgSclSzikpIBMLIlggQYGEIDtAFKkhVc1QLa3hzpjBM7lWtZ3tuAf7wKg7O3VSbsP2WDPA5wG3MKjkQEMQA6/o3hK4rnIuznFAssAZfZcgAeAUMASABX7XhAYLG/D3hV4h9rzUaIRACp4Jl9C9IVdCgTlO4RKSuCgUzgHL288LrmWsgBIsl645K0lEQDSIV58eZFjIxyD0OEdsRccPewyXJZE4R0ApAHt+B37YFkMwBaAF/KZ92c9b/u+jNUAZpz2x7iOqFanbfhSgEInQES0DPlvl8fBbgD+icCw0Qds9ImXq7UZysUeA+zCa5/3TUk4Ztf55ho8hyHwSMuX8DvkHPXBXgO46dw/ISWhHpAPdr8JnpO8d4Jqf0ZIF/vES5d0UewiNbuiXljvZuyIawBWGU8hgM+AmNgIxwAWiSgiWsBX2VkFuIew9AV8piSM74iisaQc94IEupvIEGwF0M9G3mB3AINpWcYJsBeg014LGGy9nXkGIgGc0QHkLcSks02g/HGSob3CRp1LOkGgQeIxhqWdsftd2OOArdgBaTjz0ltZk576n1q+WFDVRq5AKlDXU/L4xz5op/Fapz7b5yFK4E6gN3MvIo6IUIY0wo7Ic8oCwZZoV+hbmOvZOkW6LF9DOwLxBJGb0oTyrwrvDfBNu0j9II+92/67EUgVwG7IKmzWvqsvIW9pm3Gko12BqHWSjZQjfYiNzHMu+0VfZPciguS+m6XPSJd6CKHh3Y6Rz+QBUY7YOecxl/IWIilY0o/3BMCHIKNdh9jEln0tMQixQxvC+AHgnnGDHSMQTUVbTR/Nko+0L97zNPILhwP6UOoM2AAkCGQY7RQEh/N9KFv6FuyW/Rt8taM8E+Mf6jbneJMU2D7Lq1E+jBOoY9Rr+nyIFp6X/pD64OxHsAPuTbvABthcb+szSr5xP8Y2/ynbdsUVV1z5/5vQHnoTEHxnHHvV9AFfmjY6cfZ8JbzXUPH+Dyn63sIKz1RU8bcB7ZjboDUEBJtUQ0wkOMiIpDz/8rj/L+W3zOX0afYSiquZU8NHvaziwybLr/8W+fXdKr9+Icna32gfoz0D5dcLUiDY/L7R6AaHmt84j0/O67bGfCYTCJ7f2VOiz23lO+fZ9FPSvuY5eu9Q0b7j1W16YyWED9Kti8lj8buVmzdu6fsvP1PUrkDtXjPN6HTtWj1VRw5s1S8///k9pphJ/PBDlKJXVFFoxWw6nrGkkrIEePLbmdee/Hf8RvnEmTJjnwcICMij2Nz/IiDCMxdVTJZiSijzmBJqN1Pi/MX65qsvxajkkunvISCwEfr+P01AMFhlksonAx4GW3hUMbhg8MXAFS8hPIcYeDHQef/9VmYAst3c/GczOGFpHbwpUdJhHVEz6TV/X7t+WafOxit45yJNXtZTbQa+pSod71O1PuVUd1xRtV2eR0O3+WvgkjKq0zmnqnfLoRFBj2vT8cpacfgFjVj/qPpveFOj972v0Xu7asC2/uq2cYw6bJitViEr1DQkUM02haiF+WywcoHqLJimhotnqvnqZWpuJmSN129Wo/Vb1WzdJn2wdrParNuuZuv3qGHIHjUO3KjewUFaun2zVq1arpETJuijCdP0/oqNahocqobsuRB4QI2CdqvJhj1qunGvmmw8YBQS4rDRMKMRnmWVGoYc8UQ4NNxwTA1CTqh+yCnVDz6tusGfGj2teuZvfm8QctwcO2H+TlLdjZ+qjtHat7XuBnNOcKIaBsWaZ4tUi3WH9f7afWqxdJvartymvlsjNHRXrHoEH9YHS3eo2WLzLisgV/ar4cq9qr96rxqu22eeebcarNmq+qs2qvHqDWqycrWarJikNps/UbdD9dUm5BW92K+MSjYorEJViqpo9WIqWbe4/Bv469GPHlGTWXXVL6SjOk75QL3G99KOg7v1i2eQfcuU53WPhymDYCYxgCg0TgxQmTjjnQjIw5IHeH0y0eY3jJJBLTbmiiuuuPJPEyb2gLbWm5UJMiBPasuZ0HYyWfYmIGhrAT5YRxnAgmOATKQNWE2kRErKfQHqGBBYMJJnoM+3RAGTdPp/ogJot7kf4BDEAcADz42HrAXGAJQBcbyX6sDjFlDDAs+kzzrYFkCDLOF3FE9IIgO8IxQsiGs370QB1QBDyQ/nu/E36QCS2GdDAT0B+1IDiwBknGAF4DWelmkRQB+81m3+EZVAudFPIgCbFigFgAR4AVz1FsZeHANApxzxmGbJGPKXa3k/8ohBH4SJzRMcQwDn8eK3eQ1wCWhDn0v/TFmyZJYFQMkf8onncuaht+LhChEAIISQHkvWAGRZW+ZegF94VTM+5DfGivPmzfOUJ3YGaGXBX0Ar3svbecEpAIh2uRqU5wBk5118CeMSwHG7LBSguS9gy5cw7gX8s/cjD/+OCAieiaVCLLFHvUptE3IkJQKCusQ1kEEsZ2SjPCAiiEDxrgtO5RjgNbYFKZQW4V4QFrQD9l6QWwD83uBpagLQBxBuCRPKkYiIO4HoCO0fNm0JOCcBAXELiWWJPRR7pA57vz+/0V6Q/zZP+SQ92jOEd4KocO7Rgw0BkHqn51TylnQgKmx99yXYOlFclhyjTcIT3hfIjFDPeB5n+47tQPLeaRzNcby8IXvJd67Fy99GrFsnIYBb3tvaItfRRkJucjwlsvbvEJ6FiDNAfhzdUiMj7yQ8P2QJ7RBlTVuUGtFGn0afQj9I/kLU0s9Yoa7xbLRXkGfOcqX+Ud5E9EAsU1/TKjwn/Sj38i5DgHOAddoeytlX30OdoZ+mLgOuUz+JDoCcp73leXyVGb9RbyAayG/6SPoUlLaD+kVbyT29yQeE8QHRffQz2DDkIfUG4oh9TCBznO9D3kMCkH/UUW+SjXxgnkgeUy8hULyXWaLthGDk2SDNKVf7zKRLxB/9I+2AvTfzTIg37IA2i3ET9Yy+zip1gToLsZlSNJ0rrrjiyj9NaD9pu2mvGRdYAoI+65rpF34yf5//9ht9vWuvEj7opNAC5XU4fQHF5SippFwBistZxrOET1yuMkrMXdYDaENKeMBv1AsAt7+fzmy+5y+m0FYF1GVyNeUetFDp+m9WukEblG7g+mQd4PXp0SCHeh3vH5is3r8P8HFNimquH7BR6fptVckBY9RrZgPFR/TRjQsJMrMqz4owd6O3dF1Xr/2hPy7+pAu/nzdzox/0u/n844+fdf3GVZ/XpEWvm5R//C1JcbtbKaxhfsVlL6ZTWcrodJ5/3wfC5r8lgYh2iMhZyrN/B2XG/h3xpgxP5Sqro9lL6vC9BRRR9nEd79ZH3xw8rPNmjPbz77/p2vUbHvvATiwBgZ2gf4qAYNBhgQYmfniDMZmjg2dQwyfhlngcMIkNClpvbnbeDCSSiYebN5MjH8xQx/zNgJrvN3XTfD91NlZrd87RlNV91Gl0TdXq9oRq9H9ATacFqMOqwhq8yV9DFpRSo445VbdLdk0IflB7T7ykkINlNWltYU3f+rRCYupqS0wLrQxtrRkHP9HQvQPVbedofbRlgj7cOEWdQibq47Uj1WnFIHVZO0zdN4xXt+1z1GnXIn24bbE6bV6sHpuXq8emteq4OVDttq7TR+bvUduXae2uVVq8YLz6DOyiDqMGqNPa5eq4bavabdmi9ps2GF2v9puD1HbzRrXZtEWtjbbasFUtNmxTi5Adah68y+geo/vVLPiQmgSFqXFQpBqvj1bD9TFqEGQ+g6OMRprvUapv/q4XFKu6IfGejaTZu6HOhmOqH5Kg+uuPqv7acDVYdUBNV+1Vy9W71XL5VrVdvkm9gndr0KYD6rl2h9ouClHLBevVYskGNVu2SQ3MZ72lG8x1G40Gq+7SNaq3ZKWaLDO6dKE5PlItNrZXp7C6arOzol4b9aBK1vdXvjeLqlDl4ipSq5gK1ymsxz5+WLUmv6MG095V/RFVNXT+YB1JOKorfyQPahnIYh94mjIQZuCONw8TasAOBox4DuGJxKSCZRcYvFob8x50u+KKK678EwRACDDPAkJMoCET6MBTEtpOABC7BwBgMR5/9NMANkyinaB5WrWImcRDGFgAmDYdgN4CfTwjQBx9PeAAz4C3LM4IgB0AkRaURHkXlpdwDj74zjgCsMaCbgCnAEUW8AK0tx75gIcA2N4kAX8TGWEjPe5WAdlZGxtgIqX+h2flHoAh9jre0y5ZkprwLjZCwwLykDOA5RZcPHTokAdQtmnjzOHtoUs69KWAT9gH5+OdzPjLkheArQCygDV4rlpiCq9tvFk5ZkF+ACC7eSf9Nstp8YwAUPY50qoA85aAIC0IFSJkLKhM/uKJyzMAcvEbRAegJ+8JSAT5Zj3pWTaMMURKIDTlRJ5hO/YZsDHKMCVhMIznM3nH+YBslGlKAK9TGEBD4HAPrgUEvBM5mBahjlLP7LI72Bfjo9SWmuF5GVfxLPZdqIcQKeQ9EUXkn61Td6MQSc7lSlITygAvbJZA4TkA7/BIxq7vBnSF8HCC+i+++GKanwHbAZS1dk5UkiUgiMKCULGE290qADJ1yIKQ2A/AtSXQ7kZ5Ptqu1AgIypz6Z8sUW4CcSkkYLxOlAGnC+ZZETWkTfafQnkGoEpGFnXBPSKy0LHH0PyX0h4DXlB+k6t3YlLdwLW0P6WFrtC1OQsFbqGP0PfSd9CuQClbIO9phorlob72XF6KMiUJjbkOd/DvmNJSpdQCgDyY/vPtB3pEypU2kf2G+xTtSRyFRICBog30JzmLYDv2+026tsiygcxNup1gSlXoBsA8Bxn3JP8YlRI1525UlIOgfiKbhb6eQZ0Qy8NzUAyJhvKMk6Ltor1LqryDXvEl8yG7GVBAltFeMN8AxmJcSgUf/aJeCo3y5hx2LuOKKK678k4UxB+Mg5oWWgOBv2nv6zJ9NX3Dx1k1duXpNX+/ep/DajXUgh7+OpmdT6rI6nqucZw+IIx6v+jIKM5+RloDIVdYDbLO/wL+B4jkCdDpLGSWWL6x9/Quo78rX9dSUfnps4jDzOcjowH/TJ6cO0pPm9ye9fv9vas77L/V1PI36xOShenTiCFWe1loTVr+smKj6Zsw4V9/+ukff/LzD6PY067e/bNf533brx0sH9fOVMKOhHv3xjwP67tdd+sYc93XdnfTrX/bq7PkgJcQ3UGSfgjriX1gnM5fW6Rzl/pXXNu+NQkCw7FKEKRuWXYKA8ESv5CRypbwpk9KKNWW6P19JRbVqq+/MGP7Kjeu6YMZGv/z+m8cWIKWcBATf6eexIV9yRwKCgReDHIwPbwzWQ8Vrk4kgnjpEQ+D1hlcbvzNw/+GH7/W7eaDr15OXXTLDN93yBGgkExB8nv3qmNbvma+JK3upy4R6qt39Cb3bvZSaTC6j9kuLqPeaIuo/t7iadsmhRj2ya+L6+7Tz6NNasaWQxi/OriVb71dU4ps6fvJdRcS/o61xtbUstpmmhLXRsN3tNWBzew3Z0E6jNrTR+I2tNHVba83c/6FmR3TX1Mg+GhfaR5MO9dOMw0M0/fAITTg0UqNDR2j8oRFaeHC8Nuyaovmz+6pv/1bqNamTRu+cqPGRszU6bIrGHp6ssQcmadS+SRqxZ4qG7p6qwbunaODOyepvrutntO+OqeqzbZrR6eq9dZZ6bpmn7lsWquvmxfpk81J9vHmZPty8XO23rFCbzav1wea1arlxvZptDFGTkC1qFLLD6B41DmbZpD2qv2q76i3brIbLN6vpyq1qsmyDmi1co7ZLVqnT8jX6eOkqtVmwXK0XLlXrRcvVbMEy1Zu7SLXnLVQ9M3Gtv3SR6iyYp7rzZqnRgtlqNG+66s0fZO7VVh0iG6jNoaqqOOUplWxSQnneLKJ8bxdTnioFVbh2MT3d6SlVGfmGXu/7rOoMqqZ5IXP09fffioAWU7C6ZhoeQs0ZMAJAAKQALDDIhHDgbyY9rMEKYIWXDAbKIM8lIFxxxZV/quBxaT2smRzzHdAkNaCEiAJAXMAnrsPjlnWYaUtZs5qlGP4MAMckHBDFLnlBX89yPoD19hyAK54TosEqf6MWREMBmnkObzAAQIFlgSxQCiBMxIMzwgEwk6WXOE6apOMNVvA3y6fw7vaeqSn3A9QA9MXznDEL+ewdWeEUgGbuYfMS0AOyJS1euYDogBtOz3vewwleM15yri1PdAUAqlPoIyEcOEZe0IcC9mA3eGxyHYAZgDZjMgAezoPAAVyEICDaxEY4YDfWixYbgwzC4/fPANcA4HY5LmwGUgSiwdoBtgMYh1ezJVD4nXPwjmXMwFKe2BDHWPoEwCulwSoDWp7XkjZcQ33B0SElARiECLHPDBAJWJ2WMQcAIPttWKIPOwC4SgvYm5oAoFMH8DImXcoREMzu5+BLKCsimwAU7bsAtBONQb5wDA9oeyytagm+tESEIMwHiFQA7OR67Jr8xfZSKjdvwaaxS0ugkQYkLPOLtAjljae3JTsBXwFZSZfnILLCklp3UoB8ngOQFxKE8nXuvwBJBtHqJCHTqoCzqW1wT14SDQyBY+sGZZjaJv+0K9Rnew/AY8o+tf7CCucAulriizrP+DytZf8/IbRrANAofdFfISAsgE/7CCDu3LPBl9CGURfIF8g858bl5DvgOMQEzwb47iQD7FwGtbbzV4R+gjk1z00fQltOu+8tEHkA8pAiOB5wf9oD3hubpZ76uo70ieaib6ev4Dz6AZTvtHW8Jw4EEJxOwW4hOpjT0f9COtCe0ifTXlKnWJbJuz2jPHgPbA/cwHspR+oa80PqAu/Dht/O5csoD/oLxhrYPf0IJDvPzHiB63Byo79xtkWUE+VF/0Je8U7UBd4DpX5yX9oT6iwRRuShK6644so/XWhLAZJpv2kXnQTEFaO0+7a9vHThd50wY/QDz72h8PS5dDJdfp28t5jCMxZRVLYSOuFZ0udfBATgd0KO0krImbxBtQXFk7IE6KT5Le7VgjowJpcWLimrAWNf0YBRr2rw2Jf/8zru3/8e4qWDxr6qAWNe09gJj2nd3BIKX/2Ajm6oqiObWihmQ2OjDe9SGylmYyMdMer89H1uWrSB0eaK2WLS2PG4okbn1ZFnC+pE9tI6nSWZgPDkt8nr+BxljN4uD6OUTWTuZLIoMmsJRWQsqpMZiumEX36Fp8ujg6+9oyQzd75yGye4aMre2gN2YAkIxlPYDNyBsz92SooEBMKggsEHg0CPsZlPOnMmyQxkmVTivUOYMZN5POAAD/hkEMA1HoSakJCb13TzFkRE8pJMX/9wRlvCVmrCsh7qOrGO6nR/RK91yKs6wwqq1cwC6rSgoLrNKqqGvbKrYd8cGh/4gIIjn9O0lYU0eHoWLdlUSnHHn9bZ008q8fjDijzxlHadfEXr4t7S3AOVNHnLW5q68U3N3vyGFmx/Wav2v6TNR97UruNVtC2xmjbFV9WW+GradqyGth6rrY2JRk/U1qZjDbXjSEft2T9Eq5YO0ISJH2riorZaHtZZ6xI7aHVccwXGtlBwzAfaEN1GIdHvKyi6hdZFN9PqqCZaGW00ppGWRzXU8nCjYY20LLSZloS21KLQDzTvUHvNOvSRphz8WBMOdtLIQ9019FAfDTjQX733DFTnbUPVcfM4ddg0VW03ztX7wQvVfN1SNV65VA3MBL/BspVquIJIhhWqawaoTebOUKt509R63nS1mjtd78+dolZzJqnxzEmqM32sas0artrzR6ruonHm/HGqPXuk6kwboXpTRqju7D5qHNxGbaOaqk1EHb0190WVaFVcOd/OZ7Sgcr1bQMXrltbTHz6rV7q9pBc7Pa+Pp3+kvQl79fuVC8aoGHTjOXTdTNpOegaMeKCwLwjAAANEBuwM/PDww3OLyT8THmwDo8TG/o4BuyuuuOLK/98EMI+JPpNyJsAsPwDAlhpACoBM+2pBKybf1lORSAI2XbXg3N0o3n8AYnawAJgHQP5n0qIPYBzg9DTnO79xjHPwhAR8w4PTKXhv2vXxeUdAB28iAxIAz3YbKXEnhTwgz1gygjy/09rsCB6ceFpbogcvVNb39iZDvIX+DPIGssJGAwAsQkg48wMCgghSC5bSX3ovhYMd4IUPMEI5QDBwnZOAAFBkw068PCEq+A1AFWCS8gRktPcAIALoQSBfeCYLSN6NAgIB1tnltUgL0Ms+EyAewC15zJgRYNcCzrwL4Brewk5vbIBsJ+jnLYDtjDstCA94DpGU0r4BlANe9dbeuA/2Rl1Jy5iDcQqAFu/K9RARRBoBWv0V4R0B4KxtEDnEeumpkWEM5Ck7G8mC9unTx2Mf5C/fLaFxNwq4SbmRfloE+8XxyEZFUTcgU+xeFGkRJimUvwX1AUFZzjW1SAGnMNfAO9u+AzYPmEleUC/weLdt450Ue4UoI8oBYJK64Sxf2oDUPK5TU4gR2jZnnXcKoDbLkvK8nI+dQTCm5LGOYJMQmfYekMZExqR0D6dQxiypY8lI8gibcgLp/y+FuSZEOvWb9j+l/Q7SKvQZAMu0fbQBd1o6j3ygryFvANDt0lSI9finXeXZ6Mf+ajuQklBOrC4AWUqdpo+gHU+eT/9LsFX2QaD95rktoE+bS6QWdZs5undUHfWEtpd2hz6Fdpel5iAqWJIPm+U66iVLK9FXOoUlAenbIB9o4+0ySRAOENzUa+Z73m0K7RtYAX02fQGOBzbCgbxnfsgzkf+QRhABlvwA0OBa8oPrsVvyhKWmGC9RNkRC4dBAX+Mk+sk3yh7Sm7bXO8KO8Q7zUkgnnovlINPaHrriiiuu/F8W2kdAZAsq0xcCMjOO428nAXHL/Pv+s3OK6D1AB4vfrwS/PEr0y6vQ9PkVmaWYTuT6FwEBAH4iV1lF5CilIzlL67QDFE+6t5wSC5dSdIN8Cu2fXQc659GexoW1t2Eh7WtS8D+sBbSvsflE+dt+b+jUQtrbqJD2N8mv0BZ5FN4yn8JbFDHfiym0edE/py18qK/z0qTmWZoWU1jLYgrvmV9h/XMoqk4+HS9o8t3kLWTDaZa9MuURnbOUIo2yPwe/ewgIo8eNRmQuqvB78uu4Kce4dPm0v8wjihoyUj9+9y8nPEs6YAv0rXzHRuh3sRn60r9MQDDY4m8mnKxFC6jM4B2vIbzdmQAxicAri8E8E+k//rCbh900117XDZZkur0802+XflBYwnZNXNpTncdWV/1eD+mNdjlUtXcONRydS+1nF1Tnef5qOCin6vXLqWErH9LyQy9p+KKi6j4uixYGF9fRxAd09rQx4uNFdfRkUYWdKKWt0eW0fHc5zd4QoNnBAZoXUkqLNxdV8L5COhBXQkeSyir2VFlzfoDi+EwqrZhTpRRzupSOnilnvj+u2GO1FRszQFtDRmn2jM6avqCJVux8T6t2P69FGypo9aaHtXPvi4qIfFVH4p5TbOITijr+qMKPP6zQEw8q9OT9Ony8gg4lVFBo3H1Gze/xT+hQ/DPaG/e8dsS9pM3xryk44U2tOVZFKxJqaOHROpoRXk/j9jfWmL3tNHx3Z/Xb0kvdNgxUx/XD1WHtOL2/YoIaLx6nhosnqf6iyaq7YKwazh+uZnMHq8XsoWo+Y4gaT+6phhO6qv7EHqo7qZtqTPlQ1ae3U525XdVgXh/VnNZFVUZ/pPdGdFLdqZ3UNLC12oc3V/vIRqq65A2Val9COarmUu7K+ZWvShGVqF1O9zV6WA82ekQVO76jaRtn6uzPn+vKrWu6evOGsQ9jI8Y2MLqIiHDPRJryZyM0BuoM2AFN+J3JHMZoyQdsytqVK6644so/TeiA7VIiAJJM4C1A7EsAZFhKwno7A6oCrtjlDpiU2+UEUIBC0gQsZtKemgJ0O+8NyHI3XtUAHngk4hmP9yqDD6fQ9gOY2CUfAD/wtgQUA3xg4o8yhgCk5hxAMkgZb+9onpPIOt6f8wAl8HwGiCfyjjR4Fgu2cS/AZ/oh+qqUBkRWOM5a2mzsa5dQInKCPQoYXKUmgNvsdWTLgXdg+QfyhfIGXOI9KRNASgtukhfWk9sKfSNgEs+AZynvxRJQgLB2mS1AG9Jmw29LALAPBEtAsYwIYBK2xXOwdIgFYAB98Jp1gtqM59gU15d9OBUih0hGO/EgT1jOwy4Nwzvh1U//Tl4CallyBJAIYJBxI/nCbzwbQHBq+ysApHFfC35jb5S39zrhVrgv+QmxxvnYCoQHeXInAoJ6hpe+c4kvyh+A+68KJCHLltp0Ac5YCiu1cRBOP5SjtXc8hCGcEOwZQNAeI++pG3cqR44D1jFW9/ZyTkk4j+XXLHlCvcOT+m4AO9oF7N9JQGAL3iSjL+E+RPtYssVGTwA4Ut6AltgXx1DqBvMS2gTel7Gok3DjXLvOPWXubRcQidZ+UPZ+wIub9HzlqVXyiLYCEDslW2PiDvljo70soZZaRA8gM/XcPg/RQEQe3Qmo5xkAmFl+xtoJ7w6hd6e68D8llpiCgCDP6X/Sape+hGhAIrJ5X8r9TgQXfQx9KX0FG7g77RH7IhoOEvJOUVd/RSDWIfhoF6kXlDVEjG1nrVDniTygvYagwFnACm0xxDl9Ac/sJNppY8gH6gR1mAgLIjtIn/qDYktE7lAOAPJsTm2FPKHNoP2CCHMus0S6EKvYMyS/N0FDuqRlI9gg3InmYWkpiH0iGch7jtH/894I6dBGke/Ud5zcbJvF+/DM4BLUSfp78sRJZHMcDMOe70voW+hDyTOWYPur+/y44oorrvxfENrPlAgI1ElAIBcvX9apfQcU1bO/4t+uqfiHn9PeouV0MGtRHctYRJHZSioqdxnPvgOJucrqcM5Sisr17wTEqXvLKT6guEI75VJ4m1w69lQBnSljtGw+nanwF7V8Pn2Kmu/ees78fq5sAZ0tabREAX1WuoDOlTL3LVZQp82YO8kon58WKqizxQvo0zIFdaJ8YfOsBXW0VB6juRR7W4+gJc33/1fqb7R4HkU/nleH2+VU2Ee5lFCqpE7dE+DJZw8BQUSKyf/QXP8iICibyGwllJCxqA5kM1qsvBIefV5xVeooqt8QfRoWoUvGJqxQ9tiDJSCwFWyEvxmvo9iQL0nTEkwMHPjOhJVJZ+PGjT0TALyfmDTjcYniLcmEnckFngmXLrGp1i0zwLX7SSSDzfx9/ZYx0q9iNHPNEH00vIqHgKjapYBq9smlRqNy6cO5RdR5sb8aD8+pWn1zqu/ihzVv74vqO6eoPhqRRbPXFVPUsfI6caqY4o+ZjD5uMvhYbm09nFuLQnJo8tLsmrAohyYtzqpZazIocOe9Ongkq+JOZNfxEzl06mROnUrKqsRTGXXsZCYdT8quU6fzKPGEKYjjlXX6+BDt3zFVc2f10riJ9TRh1tMaNr6Q+vTPpFFDcmnZTH/t21hWcZEldCqxkE6czK94o0dP5TVqDPFEbsWa54mLz6tj8YV1PLG4jh0vrSNGI06UVeip+3To9EPaf+pR7T7xhLbEPaU14c9o6f6XtexQVS08WF9TtjXW8ODmGrS+nfqv76KuKz9Rq7lt1WxWe7Va2EUfLOmplgs7q/mcjmoxs5OaTGqv2iMaqvrgWqo1opHqjG2i6uOqq+qEyqo9vb4azH5fNSY0UqVBNVRlQF3VM8dbLWqozjsbqdv+Jmqw+B2V61BS2avlUJ4qBVSgir+KVCmtwm+V1H3vPaxWg9tqR+xu/Xb9gq7ohi7dNGps4zczwP3eDNC/+fprzxJceGlhJwwumfDjQcYkCQ+Z5PK/5fnEttCUBoWuuOKKK/9XhQkxbaQF8wAO8Sj0Bu6dgrc34ALgK9dAXgDe2WWBWK7HuVwIfTJ9MYOCOylAhXOggJekXX4IgJj+HvAO72OIZadCNgNIAIrgRUlaTmCLNh7QBg9f61FOmgAK3IPxhFVATZsnnAOIBBng7CfIB8AT+54ANhAz9l0AFHgW57r4gCmAHd4ekL6EfgmPaLtxJdcD6rM8CgOrlIR3piwAsOx1KN95L+d78t6UOe/IOYClADROT1cGd5AOnMP5APCAYYBzNnKG/Ad0oVzIN8oJm6C/5R0A88gD8h3Q2pYLIAuOAvb+kAd4pTKhcNqFL2VQST7YtPBkpfxtWtgnYKItM8qLsSHHyAee10m+8AlAnBqQChgM+AswxzWAVJA5KUWk8GyQMABXnI/a/QKctulLACMhNyyYjZ0y7vVeNuRuhftCNliCDcVGqaMpCXUJQNDuRUFZ8k52/w3ANyI1bHrYOXXXV7l5K20N4Nyd8sMKcwDywd6L9gcQ3ds7OzXhfaib1AHSoOwBWu8URUHbtH37dk/UtSW6AEmZxHB/2lOITGtTKB7clKV9X8gnvLNtuVJf8HZPKf9ZtsdJ6FKX8Ah35qEvZUJGXtGOpCSQqM49dshLQNTU8gFCA6LOPg+AaVqWYKKu0/bZNoN6St9Afv5vEeo+0RzUDchj7DstBATtEMA4bT72bG2Z/oY6gz1Ql1MjjmmnqJe0SZB7OFFRjlYoE8gh2nHIPciNv1ssIQWxjC3gOMCeGN79DTaFXVIPIPMhsulzmXeh2DjzcdKBYKbNor0mX6hDRIDRD1MHvKMFrNDf0u/SVlNXEWyMSAnKhr6Gekc0HveEFGfsQf5BQBBZR72jDtjyII8hBiD8IPLoj+jTIHX4GyyBZ8I26WshahHSoC+hn6M8aducgBeCnfA75+A0wfPfjfD81CuiOrzL3hVXXHHlnyr0GYxn6ENod+ljUyIgbt28pT+uXNV353/Qubh4nVkfpFOjxii07Yc6+FIlHcldRmH3FFR0tuI6nTtAx/OU9YDf0blLewBxDzCeM0AnswQo+ukiOtArmyKqFtDxbGV0NkNZnclcRmey/kU1aaFnzfezWayW1bmMJv17zf3vKatP05fRaaNJ6cropPntRI5SOpG/hE4WKq6TBUroRK6SOpnJPDPn3ltOSfcE6NQ95nyjp/m8t7SSMhvNUkqn0Mz/85pknu/UvWWUkK2UQuvk1UGTlzGPFjXPbfI5p3lPk9dJecp4oh/Ccpv3yxNg/g5QZNbinjKKyRugA6++q/D2Hytp3HidCdmoc8eO6XvTN166es2zthFC2XsTENgIv9uxsBNXcEqqBASdOoMdLmYQwcQazwYmPwyQ6KytBwaTT8AUJrgMcDiXAeX168kkBmncuAERQTSESU/X9N0vZ7R25yx1GlFL9bo+rPp9Sqnp8KJqO7moOi8qqU8WFlOjkTlUq19O9VrwoKZtf0FdphbR+4Mza/LqYjpwtJxiEgspPCaLIuKyKiwhh7YcyqbZq+/V0Knp1H9Ceg2alE6TF/spcPc9OhyXWXEnsyrheDYzcMqq4yczKOHUPebvLDp2LLeOJRQ0k4uySjhaVUnHhit031wtXThCo0Y2Vc/ej6j9h3nV7v0c6tY2t8b0yKM1c/IpfG9eHT+WS8dP5dDRkzkVczKHYk7k0pHE3DoSn0exR/OY9AoqMb6oGXwVM89bVOHHidYorlA0wV8HYvy1I9RfQTuLafWWMlq/+0kF7ntDCze/oQkrX9XoFW9r1Oqa6r+4mjpMeV1tJ72uLgtqqfuKpmo3r76aT62jZpPqqdHo91R94Euq0ucZVR/0imqPeEPvjXxGVcc8ppqTXlH9qe/ovVGv6p3+z6l6/1fUaGgltR1XSf2WvKchwQ3VYnollW9dQpnfzaZslfMrT2V/5X2zuIq+UVoVm7+lKcsmK+mrk7p664rYm/2y0QumjJPMwJ+NIBkUA3pQ1kwy+Q1ADa8rPMIY4NsBqR0MY2d2gOqKK6648k8RgEM8ly0gjyc63r0pgS4AACw1AFBtAXoAJQACljfgOvpfu2QQ6bE8SkoAbWrCQALvWOv9zzNCJrOBL17ggA1OBSwCBKH99/X8/M5gw3ro341aL00LxDCewLPdArIowIc36MA9yU+7T4QFkQFBLDCekjB2YTkQvN4tqM44B8/L1K6lHCAR7BJSd6OQKDhvOL0v8e7He5fjgPoArNwDYB2QhnKhnAFzsQnAaZZ0gYzhPOzFgo6ASbyTFbxXnfsjANxQln9GAKLwfrVpUTakZfOKASlgGPbEMzJ+tLaFAqTx7qnlLZuDOtf+JzoBQig18BVQ0gnOAy4C8qVGQtl8w1PX3gswD492JmF/RbBhvPRtFBAKkMhzpiQsI0V0jwXd8fLFg9kuPYVnO9E9HMMeiDSx4N3fLSy/wvPaZydfli5desf65BTOJYLHkgDUL7yf7TJyKQngO+NJ6oGtk9iDjWhhsmPX8OcY9Z2IK2dZQ7YwTsUmbH4CphLVzdjUKZzLEkk2YoLz8ZJmQvV3CCA26dkoLWyCZUxTAz8B0Ymw4HyUtp5oIrtpti+hvbRr9ltyhjYDMjOty179TwhlSJtBewXpQxuWGiGJYEu0CxCuLDVHv2D7H+YblC0Ez51IGuYr1HnID4Bw2nAn8A/phI2SdxDCf7eHPOUH8I2t0U4TEcA9fb0/7RP9POQb7RPtPVGCKFFS1AkAfdpX3oXfcQCzKxmwTDJtJ0q/7avucm/6O56FZecQSGainSAMSBsyjnPsfemPIIe5hggJ+lqIcif4QBlADDEusfUPpb+AmCBNSAlIQogNhLwmmo72gj7GOxoS4R5E2WE3kBD0j2kV3p/zIVzIU8ZTaXFScMUVV1z5vy70GdYpCVDZEhC0kRZ8tgTEzRs3ze9/6LwZp/xkxlO///SjfjDt9dkjMUqcs1Axr1fXgQwFFZk+v5JylfEiIAJ0OldZfZqlnBILlFboO/l1oGt2RT9fRCfSl9OnGcorKWu5v0VPG/00c3lPmp9mqKAzRj/1q6Bj6copJkdpHfUvqaNmPhaet6T2F/dXaMVCOtoqjxI75lLCh7l1pH4+RT9WVEezl9FJv/IePW70hNEkk86n5tOTfjZzr2zmvW7f839SP+Uzo3mmdOUV9VohHeiWTWFvFVBiPpPXWQP0aa4AnYKAMPkfRgSEyX+WZApPl1cHMxdRTKU6OrFwmc6Zsvvx7Bn9ZuY+P5gy/cGULeV98zZua23AFwHB76hzDOAUnwSEBYe9CQg8JRiY4ZnBgINJEB4UeGcBSuCtwaSIwRSDHTp2rk8mIkiHv9FrunHzqn7743uFJmzTsFkfqlH3p1W/Z1m1GlVa3Rc+oEHrH1GXxSVUb1g21eibTd3m36dxG55R27GF1aR/Zo1b5a8dR+7TgSOFtONwRu2NyazQxFzaGpFTM1dmUJ+xfuoy2E+9Rvhp0sJ02nAgs8JP5NLR03l05HguHYk3mpBDsYn5FXOkmPbtLarNGwsqeH1J7d7xjo5EDlXo/sVas2KqRo1sq06fPKUune/XqEHPaOrQZzRtYDmtnFFI+3fm0dH4nIo/mVPRJ3Mr/HgehZk0IxMKKzK+sKKPFtGRWGOoscV1JK64ohKKKfRYER00x/cdza994Xm0e19ubd6aU2sCs2rZqlxaG1JKQdsf1+KgxzR2boDJn3IaNu8R9ZthBmljSuqjcWXUd/4zGrjiDX086yU1G/eCmox6WQ2HPW3yqqyq9iyu9/qUU43B96vGsNKqPrqEao27T7XGPKzKAwNUuW9p1er3gFr0fkzdez6picPf0MRJ1dSs73Mq06CQ0r+bXemqmgFsteIq/N79eqVVRfWf1Feh0Xv126/f6frVS7pmypah8W+mnA+awRthqz3N5A8PGetphBEy2GUgiicptsKkyw54+URdAsIVV1z5JwntHiChc1kVwBI22fUWzgVMB2zF+9KCooBwkLv0u5zDRB2AwAmsAVSkRGikJniUAlAB4pEWgBXgH2MA+nP6d6fymx0n+BJAIjxubXp3owDBAEi2XwEsAsTl/TgO6MqSkIAmTuFZIAwASQDnyS/IGwAG0khNGEgRDQCQY5+DaAEbaZKSQBgAhNmNi+9GuRcAKt6YiLURgBGOA54z1mIsBeiMLQAo8l4WkMU2WJIGQBugCg9rwH6OAa7RP9u0AWLplzlGOtiidx6mRXge1tfGq5a0KGPs0rnUEfbBslwATc7nRfkOiIbt81wpCWNMys9eh/ML+ZPa+IHBL+NUC7ySP4D5ALLeNkA6lB/PCcjutFWcbmw9+ysCiMcyWDaCCQCZeuULdAYQh3wgMsSC9SggJWApx6nbgPksZ8IxwD+cge5kp39GuBeRrZbsoNwAZe8G7LMCWQhpaNs+8gPvf18RJkxkiH4h35yEICAonu12HXmASeYm9jh5xgSHeuAUyh1y1bYfEAB4txMF4bQlbAfCz5JFkC2AxE5g+q8IQCx5aZ+XcqUsU5qsIdQ1iDraY66xZUB7aPPBKfxGFBTe3c42CaCWsbkvgPv/pUBC0U7RZgE63ymvaachNjmf6Cbqtc0/8hIygzaDd02t7tJeYjvkK+0t7aCzHGgrAbapr8x1/i4bQKj7EE+kTxnRXmHLKdkB/TyEi3VCwAZo16hLKN+tTaH0j/QrPDNp0r5R/hCVvjaoRmi7qZ8QCkQfIMzdnGQu9yJt+4k670ubC3nh/R78Tb/Me0Je0F9yHv0tZQgJgKOjBbUY+1DG9I/YcUoEHUtIUud5N7tEFnWdtoZ+z/ar3kKdwrGC+k2bQD/zV9t5V1xxxZX/C0L7CAHBeIg2OTUC4sb1G/rt19/0w08/6pKZF97ULf1mxo0/3byhH775VqdnzNP+Z1/TvnvzKCF9bh1nSabM/orJWlyfZiuh01lK6fS9AYorV0IHG+fRwVa5dPS+4jppfkvKHuBZIuiv6mmTTlLGch5S49i9RjOY+2UqqyMFSynm6aI60jCf4jvmNppTYc1ya1frHNo7OrNi19yjpB3pdXpnep1Yfa+ODs7uic6IfLCojj5eRAkvFlHcs0UUe5+/jhYopcTM5nnTl1fSvUazmXuytJSP5/lPKdEknjy7p5xiHyqmAx/k1KGGeRVfxuSzyc9PiZQweR6VpbinDE7cW1hx6XJrbwaT7y+9rTNzF+unb7/XT6a/vmjKjx7xohlD/GDKm37V9uvWBpwEBHN1frd2k9JYJlUCAsOzyt9MeFgrFSAETxU6drzo8FRg4sZ3On4mhXT2dsBjiQyiIfh+1ei161f1x9XfdO67RK3ePkPdxtZWox4PqOngUuq99HFN2PWqBgQ+ogbDc6lyz8z6eFaAhgU+qeYjCqlu38wataq4NsU8qM3hRbRudwZticioQyfyaFdsfi0MyaYR0zNq4Ph7NWzKvZq7JqO2R+RURJIxllP5FRqXV4ePFFTYEX+FRVcwk6r7tGBeEY0blUPDh+bSnJnPa+fWvjqwZ6nWrp6lMWM/Uv8Bb2n2rGrat6WNIrd9oN0rK2v76gd0cF9BRR/NrZiTeRR+Mr8OJhbUgcQiOpxg0k4ooYi4koqMLaHIGKNHzd/m90MJRcxz5tOWsJwK2ZVN6zdl1ap1WTR/aUbNWphZ85cX0KLAspq2tJT6T8yjbua5uo/Lq0/GmcHp8Gz6cGxu9ZpdUr0X3Kf2kwLUdGhZNRlcQQ36l1KNbnlU9ZNsqtY1j2r0K6jaw/Kq9ug8qj2qkKoPKaJ3e+dSlV65VLd3EbXrHqDRHR/Woo4vamKHF1SvcTk9WL+Eira8T4XaP6XSH72iN/s20MD5w7QnYpt+Ov+Fbl74VTeMkV0zZXnF2MrvZgJzwExAiXB45aWXPCANXkgYIoKXL56DgEB4bmEbFhBjkIemBiC44oorrvxfE0B7wBLWnGbSjgLCsgQFoBEdN8oyHfSzgOZ4NtrlZ1AmzM71ivFCx7PQgtJ4PzKxJw0GATZNX0oa9O924g0QiKenJTvs0gTeYF5ahHeFQLAAGIAFQA5LRQE8+lKAVM7jfAAJ3pN3QABXeRYbTQFoBHjkXI/aCoNlADvAe84lb1gKyHpXpiQMogB+nV6a7HPFOCYloR8DoGXzUPvsXE90AuCJr/cEOLNAEp6fLN1kPdvJN5YLsoAvQCje5oiTgLDPh2IfPCeeptgRZATAEOWIB7T1Muc44zjr1QsIyzI4AE++7MOXWo9ixnk4plgQnHfCDvGWt4JdAepRTjZCxyrPBmFB3qU2FgAIs2QKCpFwp3LEXgH3sCF7HflMvgBQAjzyLjjNMDYBcIZswP7s+dQz8jQ1L/O0CsAidmXfA7sAeOd3bI5ngeQj7wDNsAeWVHLaExExjMPJU+wbUsoSM3YDWAB7Z1n5Uuo897TjsTsJkw4iaGw5Y7cQWCzj4yt9q9yHyBHs2Qrvy3JaFkjHRgH/iFgAnGTcyLXMKwDQyTOARWvvnG8jo+zzQ3JConGc9o96CJDpCyymrLEfzkUBvYmCsGlhh9gGBJ5d0g6AGJCUZ/J+R2/lnZmE2fbUl+Chb6OTUMg53j01IT3swrmHCHWXcuD5aTuo99gQkV7sRQPIyztYcBjb816//88Kz0P+Wtvlk4lnau+dmmC39IPYO22CNynkFOyRuQZLmNGmMAdh3mnPB0im3lO2EDRO+3MKz0u7Sn9C/SKihLSdQloQRN528leFeRJtJ8saEQFHOwPQn9KEHaF8eVciOyhXlL4VpW2DOKWs+aSs6ftYqg6yiXKB6IXIs3vaePdptOtEiWFX3MNGxfFctJu0WdyTfs3el37HRuBxHfdlzEAfQ3lY/AAbIX2ehbLCXonCoT7iqMa1EMsQr1Zod9mAmvvS5zn7FSucQzSp7ecYCyEsnUV5MhaiH/BlA9zfLitHm3KnzcpdccUVV/4pQv9Au838i76ScQ39vC8Cgn7RjgOumzb/hulvfvztd/188Q+Pw/LvX36lmPGTtPupFxWZraCOpS+gyHSFFJW+kI5nLKxT9xDtUFIxTxfWgY9yKvS9/DpWmOWE8M4vq1PsW/An1QPI5zTpZA1QYrYAxeYvpSNl/XXkPn+FPlhU+6rmV+SQLDoReK/O7L5HZ3en14mN9+hIYHpFbU6n+H1+Ohflp28T/PRdvJ8+P5xesQsy6mC/LOa6zDo+ObOOTcysqJ7JxERUyRI6mrmMEjOZ+2dJJlA8e1z4eLa7VfbP8CjvdPv7fzsvr/k9l7mnybsE/5I6XCu/DnyYSzGPmzz2K6Ekk9fHMxVWxL3kf3JZhGcvrF3PvaqjU2fqd1YzuHlLP5my/cXMoxg7UL6UN2rHDU4bsAQEfT1/W7tJaTyT6hJMXMRNuCnKwIGJBINbJj505tyEDpyJK15ZDKCYLPCdQQCDU9JCSYtrICDQy1cv6ecL3yn+zEEt2TRCnUZXUuN+ZdVpxoOavLuSJu+pqNZTSurtbln0/sQS6r/qMTUZUUg1e2fWoOUltDriEa3YX0wLt2VUUHgm7T+VT/uPF1bwgQJasqGAFgbm15LgvAram0f74gro8ImC2hOXR9vCc2t7WBHti6ygnfsf1eIlARoyKI96dMukjz7KoH797teK5Z20c/sCrVw+XePHd9S06Y3M3x10NmGgvjraXyf3tVHk9lcVeqiUImLzKTwxvw4lFtK+RJNuor/2J5TQQaOH40rp8BHzGV1cobFG44tpb2xBbQzLqZU7Mmt+YAbNWp5JUxdn1vh5mTR6dhaNnptLo+YXUL+pedVhWAa1HphOrYfco5bD7lHzoen1wZhM+nhqLn04Oa/5LY8a9smthj3yqW7XXHrvo4x6t106VTGftXpnVf3hRkdlUe3hOVRjQC5V75tF1XtlUqM+edS9X4DmdH9aS99/VoOrlFfdd0uqxsevqtHU1mqyuIc+XDPMlMFiHT4Vqh9++lI3L5lB+R8Xdf3iFVN2N3WR9d6MjZw+d84DMDFwZBKFRx8TKcqawSeTCI5jE2ymiB3YQSma0gTDFVdcceX/ogBwAIoA5llgCAAEsMhupIzi6Vi/fn0PyOJcsoaJvveSQABwgJOWNACwxpObCTgekDZNb+V+KMCEJRjwaOdZuA/PhzckALA3MHMnoW1nQs8E374nwAQex3g0A/iyNrm3sna7XSMeAIXlHRl3IAAhjDEA8DmO1yPjDucG2lbIG0Aqnp9zUb4DmqYGIjGmwdvS5iWANERGaoKnJhtGW5IIMAgQDfCEa329J32l0xObDTZtFAKDOABU++wAYICxCI4eeKM6vfQpK5Z+YukShCVrbIQDzwToCMCHUI6QU4C6HAfYZUkO3tmXjXgr+W3XzSct1vy2G5YDWrH0FSCyUxgzAgLZNe+tAvoBRqfkjYswjmSwat+X5+V97kQKMNZgbMo6/9b+UGyH33CY4H0A9CBgyGuex57HfSgT6lZq9pJWAVijLlgSBrti3MS+Ltg4z4Jtkx92HXf7LChEAzZh6yk2N2jQoP9aZox0AdEgLpzl5Uu5D0TenUgcKwCf2KwtZ+oGADqEnq/0rXIfAE2AQzsRwRYgVQH17btRPqwfD8hJm8W1EFm0YQDJzvKDlCGiFjIAIV283O1+H5YcYSNbX17+TIrIb1vWnI8NWJu141ZATUtGAboSaWWfLTUlLcB/64jjLTwvwLOtC7wbEUS+wFVv4RzK10k+Uu4QldQJ2nKcfbAhlrRxknbcB4AW8s2CBn9FKEeIFDY75r2xJzZETum97yTYc9u2bT1tPwqZ5mtPDGwRMow+infHmx+i3k6KEchW2kyOkyb9hrcwpwVgh9wnfwDl6ZedwjnYKv0zxA9L/Tjv81eEZ6aPIG36aN7/TkLe0n/Rp9AmUiftJ+0y9R9ij7InIpI2lz7FzukhHSCeyReiEGy/aoVlk2iTyA+iFi0pBrBAHaPP5n5Oxd7JO/o8SAIcBsgzG3UAaEU+QzCyrJmzLQVToL8gD3gm2kJnPlBXeVfaQsoThzZn/tMW8hvHeG+7/xECyWb3HvK11wtp0z/TnnAt9/47iGZXXHHFlf8LQlvrJCCYl9DvMya3ILMdS4D54SDGccZQtPMcp40H5WP091XSKR2ZOk3RtRsptsJTCs1TSodzl9CRgmV0LHdpxWX2V9hbuT37P0S9VFgncpTV6WxlfXr5p1UB6E/nCNCpzOUUn7+MYp4poiON8iqhew4l9M2h6H7ZFTYlk6KD0+lEqJ8+j/PTtyf89E2in76I9dOn4X5K3OOnk/v89FWUn34yv/9w0k9nI/wUu8VPMZv8dHq/uS7MT0nb0+vYrMw61CK39r5aQFFPF1F80VI6mTUg+RkgB3w8490o+zewXBV7ORBZkVp0BXl3PFcZRb5a2JOnoW/kUXyG4ko0eR1TqLQO5S2usLylFHv/s4qq21RHZs3WN6c/TS6vGzf1s+n36fstVst3ytiS+ZQ9tmHtgbL/ywQEwoAFA2IAz82s5wK/MQhiws9gk/BFJhmsJ8wgmMENAAMDRCby9uYYMulcN9fjQX/56hX9cfV3/XzpCx09u11zgrqr/cjn1HxIGQ1e86JmHaymrose19vdc6nukELqtvhBNR1dWNX7ZFOPBaW04ODjmrW9hKZtyqK1Edm0+1R+HThVRLuP+mtXVBntjgjQrshS2nu0mA4mFtHehAIKCc2uZduzaOX2/Np0oLyCtj2g6bP9NXhYbg0bmUe9+mdXz/5lNWdeawWun2rejYHdR1q+vL2iQnvp84Th+jxyiE7u6qKYbdUUduBBhUYX06E40i+qPceKandiMe1KKKY95u99cUW1P7aI9scU0QGj+2IKaUtYbq3clUkz16XXiAXp1H/aPeo1OYN6Ts6sXtPMu03Lro4TsqvlkIyq38dP9foaHeinOkbrDk6npmMyqNVEM2kfnUmNB2RUva4ZVL9TJjX4JJPqdLxXNT+8R3W6ZFaTgdnVfExONR2XXfWHmzwcmEeNBudWo4E51HpwAQ0Y+aBmDXxR45o8og4vF9UHtR7X2GldtXzPQq0MW68dJw7o5I+ndeHqL7p53TQwV/7QDWMDV67e0MVrN/X7TXbykGcjavZ7APxikgaoRvg0XrTYCgNEBv/8zWAXe7CElDVqV1xxxZV/itAp403rBOAA9AChAYutAn7xGwCZ8zyAUoBIJ9ADsED/CxCdUnq+lHsw+SbigQEDAlgAgEE6eBsD0AB++wLzUhPGDCwDZT20AcDwUobgYCADeM1gxamAFYA8Nm8ACQHGGUsggO+ACoAVHAcQ5R6k50sAsKx3JecDPrOkgzdAboW+CTCc5+TduQZglOiU1IT1tFkH2+Y/ZcRyF/R5vt4TxUvZgl/cyy71g3AdICuesfY97XI39KXkiQVHUQBJACWIBwTgCGCOY5BRgFEWsCWvIEsswE25cD124MtGvBXSB+9zmxbAl10mCCDILhHkFPKVPGKZDSeYTDkCmKa0RAbCkmAAxpYQogy5J/XoTgJYCdll89EqZAbvC2hm65ktb5S/qU+UoZ1g/VUB3KO8bX3GVrBv7u/MX/LESS6h5C/gtzOfKGvK3Bld5Cs9X8q7Y6N38rq3Qv0D3LbRRJQh78Gz+krfKvehLYEIxAYQxn2Agc56bJ+ffLfPz7Xe+cD9IQbYc8bOLSxIDAjKOZC1pA3hY89xCu0Y8xMIOGuLlLXdoBzdvXu3Bxy2QD+2Qbre7+dLeSeIY9ueegttHKCpJVFJF9I1tb1ArDCexmMfwtC2NShl4ay/PIOtLyjfuQZv+LTUm7QI9gfxQPvCPVkuD+KF9/szQn8GaWSXc8PmaQOxUcrSfkKeQrZSNtzb19JYOMABoFO+EFi0ASyl5EyHNgxSibzDzgCgcZJyCv0EyxFid5CCzHmtjdDG4cWPLXLe3RATlCNgPuUEgciyYNQJogF4Pqv0d9Q9bByhDvGuzn4EpY/BfiDwmIdRV5mjcx/bb1MX6NsgVclfyG/m79yT/IC0YR6HrUOOka8WzOe+lA9l631vnpG+i/4EwgP74r627lEPIKmwd86DyOCeKO9tI9QgPuj7nWVJ20vUD5ExnAOBxjk8L9fTPts9l8AeiLqw4yLaft6BNp48IaIJQtraAG0G9sO1PBe2521Hrrjiiiv/VLEEBON82mLafxQs14LMdnxMH8VY3fb/4H/0BfQRnj7T/HbhxnV9bfqzs5u26GT/IYpu1EIR9RoroWVbJTVurSOvV9T+VoV1sGtWHb2/mE5lLKdTOX2D63dSSzyczlROJ+4tp9g8pRVVsZDihmTT6XX36vP96XXuUHqdOZBOSYf9dHy/n47t8dMp8/lFhJ++P+qnn+L99F2Mn07v81P8dj+d2O2nryP9dN4cO2+OfRblpwRz7NNQc36Cn35INMej0yl82T3aNTaTIgZnU0yNAoorWsI8Q4BOmWfxRGL8CSLidC72k2AJqQCdzBCgE+YTUiUps/ktq/n07OvgdZ3Ju5PmvNiHi+pgj6za17Kojr5eyeT1+4pr+YEi6jdSTJOWOjlkpD7dsk1ff/WlLl5PdhCgz6fsIJBsX44dUMZ2PGJtgH6T3+yYwP5O+fsagyMpEhAYCzfHgDA01BIRdOpMkllzEQ8+NoZiUIDnA15keGYyUGNTKQbxdjBg07MExJWrJu1rJu1b5gUvn1bYydUas7S5GvYup1ajyml40Ovqvfx5Ve1TSO/2zKt2M8ur5QR/1eifRx/PDNC0XU9r3IZSGrM+m5aH59D2E/m050Qh7U0oroPxZrIef58Om8+Dx0pq/7Gi2nG0gFbuzaFp6zJq6uqcWrKxuFaEBGjW4hKaPs9fS9aU1czFxTV6ygOataC55i0cqlGje2noiA+0as1Hig7vozPRQ5W0d4hi13dTWGBdHd71jA6Hl9f+mNLaFVtCO+KLantiYW1LKKDtCfm0KyGv9sSZ54rNrz0xBbQtLI/W7M6iOUHpNWqxn7pN9VObkX5qMSSdPhiZQR9Nzq6Pp+RSy5FZVbvPPXqvVzrV6JdO1Qf4qVp/P9UYnE4Nx2RQ0/EZ1dic37h/RjXseq8ad86g93tn1QcDsqnNwOxqMzSv2o8tpA7TiqjtjMJqNrawGgwpZPLVX+3GFlOncaXVb/xjGjDwabWqW0oNKhbXsK71tX/TQsUd2KKoHZv1+dEjuvKTmahcN4PX61fMxx+6bL5fvHVTvxv7sNDXFVOeDFwBRJiAMMmBjGKCxeDc2g0DZIwUY8QWaNj4xNZcccUVV/4pAliBdyegDZPftChgE2AFBC8egQwCrNCOMpn2BlnTqgAOPI8F8QF48EjkGMAVgAWRDHfTVvNMeOsCiFhPY4AAAAE7eElJAGKsdz4KOGiXVWCpHrw8LVhMf5OSpzPCYJgIPOu5zXUA83ju+hoY0UcBkHAPb3AyJWHJFbsWOeeTZ3ggO8vIl9An4sXLNSjgPd7JCGASjhw28oVlJAB67DFAe6d3M7ZEn0s+MM7iHSwgi4cnNsPYDcH+2ADXGVVzNwpoY5+TtAB7LVBMPlMevsA47IF3smQQim3gAcsg15dgc4BFALq2PADOALrsRCc1wQ6xJ7ygAaGs3aSkHCcv8aCH5LN59ncIJBZRA/Y90qKArNRrnh8CymmzAJ+sWe8kKO9GaUtSizxxCvWPcZ03IZAW9UV0MEEBLCSfscM75Qn5gB3j5Q+IyJjSCmAnhJStD7STkDUpRXdgU+Qd8xXbNnEtoC1pYTNEKNg9S5zPkVaF9LTtqbcA3FN/bfsPMAvBRl1Ki/BeeG6zJNCd7NmSOpQ1E760kBxpFeaBlkBFAdLJtzu17ykJ+W494gHAaUcBp1mq0Cr2AqHNe0O4ECXjK0oCTzwis2gDOZd6RzvuTAvgmvJHWQYJYNv72YkewO7JQ9p0S/DSvhEZhT2ynNeqVav+zSEgNeE9nUSAJekgvHg/5zMyl6ZvT4tnPkQFID6EJBER3u+C3ZO/gP6UFe0GNg5Rw70g0CH/qD916tTxPCN9yZ2Edon8pZ2yxLRTqOsQBfQN3JN8556o7ZepA0ROeLxlHeMM8gqbhWiljlJW9M08L9fTttA2cD1EEd6ZXINQRjwbEaTcg+dz2gDzVWu3EFT043czxnHFFVdc+b8sjDcBkRnLMDayHu6MvyzIzCfCb/RTzGvs3xznb9pV9IKZn/xq+qWLv/2qX09/qnOmD03avUffRB/VD1ExSlg2SvuGParDTbIroWAxzx4K/wao34USIXA6czmdYHPpLGV14IXCihqdVef2p9e38X76PtFP36HH/PSN+furSD99us9Px7b56fgOP31+yE8/xvjpfLQ5Hu6nk7v9FLfVT6f3mr8jzLGj5tMcO2n+TrLRESYtSIjjB/wUs9N87k2v+DmZFP5OPkVlLaXj6dkk+vZyTHehnncx153MVE7xGcvqaLYyOpqzjOLM7+w3kWR+9+xv4etak4fxRYvqcMts2jfqKSWumGjyOkpfR0WbvN9t3vOwfjtzVr9DNly+pIum3Gw/SNlR/nYcwJyLMrbzbacNUN7YBjaCrVi7uWsCgg6ci5wEBH9zEwYldNZMnBmwMAhgYIY3B5NeQlhZ6xdiAs9EZzglAwL02jWU9M3nzUu6ph/13cVYbQydqA7DX1WVj4uq1ej71Hnu06o7pJQqdc+npuPLqNWUANUeXFStJ5XTmE3PaMjaMhq8OrsWHM6pTYn5tf1YQe04Wlh7jpTW/tgAo6W196i/9sQX1dbYYlq+t6AmrsmlUYvyasry4pq7srzmLKmg+SsqaOWGB7RwXYCmLXxKs5e00KRpPdSnX1sNGNxEa9a2U2RoVyWF91XSzv6KXd1FYasa6fDWN3T44BPaH/6AdkaVMfcoqi0J+bX5WC5tTsymrccya0dCVu2Ky6mdMbm14VAOLd6SUVNWpdOQBenUeUo6tRqRTk0Gp1Pr0Rn0ycxc6j6vgNpPyqMmw7Ko/pCMqjfkXtUc4Kf3+vmpzhBz7pgMaj7O6IgMajEok1r0yqgP+mTVJyPyqOekvOo5Na+6TimsztOLq/P8Muq0MEAtJ5VU/aH++mBCOXWZ+aC6T39Incc/qiY97tertQurbuPHtXzuQH26d6OOrViliElz9FXQLt04ZSZEv13SLWzg+mVduHVdv+qmftEt/W5s5LIpvzNmMoTHIxMugAg2FYOMAmjgdyYH2E9yuf9rY3P76Q74XHHFlX+S0CbiecnkNy0KcArQDmDhXNrACm1p3759/80j9m4U7076bwYNtMd4CjqPA7Lc7ca2DFR4VktkoIAjeELfSQB98JS31wFuWO9/gB6IDHsMYA1PyJSEPgbgHsDBXgPgCUDDYMlbGDxxzHpGokRD2MgEbyHviQ6xESMoRAIOGhxLTbgXwLq9DnCFNf0Zf9n10O0xxlp2fWqAJsAWJ4GAfbA0B8KgD09n62ENmEdZ2PdlDX7n896tkpd4AiNENwLe2WMAWiwt4kt4LpbjcS7DBMALQZQS0EX5OferQAGdWMrDTnzuJAyWiboBxAf8AqDzBpYBKfG45jjOFHiZ/53kA8K4Oa11lLKFaGF8Td3G/r1JNiJP7RJed6u8P+QgtpAWoY6xr4KvtO6kvIMv4JuJC6QMcwmijHwRYtQJgHaAWZapoRy984F6xHjTXkM6APSpEVQco5472xLaJ5xmqLeQedzbHrsbhVggwoj21JfQljj3oAAApf0lP9IitNFEQUG6UI+pT76ICABbiEvrEPR3kg8IJCRtnb0fdceSpH9FmGOyXI9zrwtvBVSGfEipraENpZ8FbE+traPO0wbTXvvq46hjtK2cS5trwRWIakhQS6ZC2qfVe562jr0knCR7aoqj353IbNpJSHL2SsAemHul1D7St0B4OcvOKm0j4wzm8mlpX5nbYVuQRbQP9IW++j2iMSCWvJeVQ+nfWToJUtCXkF84HlDHnfXVKiQVDo+++mjqOXUrpbzGZrG1lO7tiiuuuPJPFfoVSGHG7rSlfNIH0ibTPwAy236CczlGn4DQH0Lq2j6TPpk0fjXzELtL1M/Xr+o7cx4pcNXpL9fo4LTnFfZaTh3PVlRJme6egGCJIgD7E5kCFJ+jjKJLFVfoK4V1sG82HdmaTmdi/PR5lJ++IZIBguE2yfCD0a8j/JS0N5loOLHTT18Q2WDO/cGcw3eICQiKLw6b34746Vtz/pn9yeee2een70wapPdZmJ9OGz0XZ34354SPzKy9rxRQdIniOm6e6dRdLCvF+7CPRELWsoosWUKHnyiiiIqFFFW5oA6/XkhhjxRVfJESOm6On8oWkLxfhuP6pIzllZijmMLeyqlDc1/TuW82evbkwF3i+z8u6TdTbsh1M678GYLJqCXxKTvGpbZMcWrgN8oaoYyxCT4ZlzPHxCbsJ2Nze6633JGAYCBBonZyiKHhfYR3ERMCwjUJrWT5BwZ73IxBLuH+TDro2PF6syAz6ZAmG1Jfv35T16+xP0RyVly59Y2Of71DE1Z8rGof3q+KbQqr6fD71WREBVXpXUR1hpVUy0kPqM6Q0mo8qoz6r35SPZeUUa+lOTRrXy4FHSuozQkFteVIAW2LKqodkcW1I8pfO2OKamesv7YeKauV+8to0lp/DZpdTIOmltbwSRU0ctwDGjXxPo2fUU6jppfSuJnPau6yNpoys6f6D2yrEaOaKSioraIOfaSk0M76bHdPJYV8orjAFora8p4i9r5hBj7PaVf4/doUWUybjubRxsSs2nD8Xm04ls480z3aHp9Z22NzKOhwDi3amkXT1mbWmBVZNWBhVnWflVVdp2dTn3m5NXxVIY1dX0pDV5ZQr3kF1XlGbrWfkFVNh6ZXo0Hp1Gr0PWo/KZPaT8yodmMyqP2ITOowNLO6jM6tftMKaeC8fBqwIK96zSmkrnNLqvuyCuq8/EE1mVhaNYcUV/sZj6rvkufUc+4TajPmQb3xcXE90ai42gyopf17lurzfVsVOXGWDvUZpy8WbdT1uM+kny7p5pWrnuiHC7dueMiHby9fUtLX3yjqaJwWL1mq9z9o7VljE68uBnsQEYAneNHgEUUjhE39q/z/pdbQXXHFFVf+CQKBACiERx4gQGoK2Aq5C1gG6Mtg0LvNpF1lqQqWLfKVRmrK5B3PS5ZdYpBB2oB3Ni08FFlSLy1ghFNwPGAcgJch6eC1CgCbFi9fxhKAwDwbecRYwxIQACMAFvb5ASVSW74HYYDEMpH2GsBO3ol+yVvIX8B7wC/uzXMD9KUE1JIv7I8BIMb5gKV4a1qyIDUBoCSveR6utRvn0i+yFAhAP79TBoy5LIBI3hLRAEnD+wD6AyiRbwjvBdAPOcP1RKgyRrODSLx4AUABPm2epFUBcujnAWoRCAj6fu7DcUBt6yXsLdgWNoy92fN5diImUhLyAq9aPIG5BrtkuZq73ZeBd+eZIWLwfCdvsC+egTQpP5wnACKJmPBFTv0VYQxMmUHI2bxMSSlv8hTAk3oJeEc+eAtjcbyBbV6mVTmf8Rkex2klFgGFIcF8pZeaUh9YIz4lD27mDCyNQz3gnalv9lrqBREe2Db1nnruTT4gTGrZF4H3QqkXALy+8swpkKGQDvY69puwewmwNI21j7tV6i0EVkqRANQBbNC2sdyXck6JsPAlPCNLqkHEtW7d2mO/Nj2em/LlHozHyV8mg3+3UG+5D3nHfWmznQ5nf1YoY96NumrbVZu3fCfqgiW0qBe+7MEK7Q3tOWVBnbJpOJV9YGx99+UMRd4xlyVvsSl7Du0+5AZ9ESA2RIWv630JzwxBwLv5eian8twQHbxHaoKtMdfiWWjbeZ6U2kd+Z15OxA/9s81f7IYy5Nq02iL1l76GdhxHBfo9X3M6frORP5Cm9p70eZB19COplSXvx4oKzC1pU7iWNIhwAWdgOUNf11MmEMm0vTyj05awXQh/CP07tRWuuOKKK/80AQe2xANtPeMI+gbaSyf4bIXzbftPH/nd7SVoEX7n+0+mL6M9v2na5t/N548XL+iKueTqrSs6+/U0hY18UBEV8uhEpuI6nb3cfwPU76SevRayBOho7tIKe7qwwtrnUsyUzErclF7HD/opfrfRHbejFsL89F2Un76PTiYaIA+Ibkjak0xCEPUAycDv35rjZw+Ya7ckR0pwzXnzG2lAQJwy55IWZMbnoSYNc+5Zc+zro346ui2d9o7PqNAWuRRbwV+J2cqY5yx7x0gIjn+aLUDHspVVWLli2tMwt/YNzKqoGZkUMz+j9o/LpL1dsim0Sl5FFy+h4+a8JN7fkcbprOV0IksJRTyYR+ETHtfn3y/QNV3W5eu39NPvFzxRKZTFJTNHYpxxwZSRLUPGRfSftozpT52EAmWMTVCe2IQlLLAZS0TcNQFhyQf7aTtnbsIAA48HJgwMAvGmcBoYkwQm7ExWmDTbDbB4cAYI165e043rN4ze1I1rt3TTpH3rpjFG/aafLidp15HF6jiypl5s7K9KHfxVf2A51ejnr/f6+6vZuAdVe3AZ1Rzor49nP6iPZ5VUl/k5NHVnHgXGF9XGY4W1IbaANkUV0ubwItoSUVTbootpW0xJbYy8T0t33a+Ri0qp47Aiat21sFp/VExtOpRRh47l1bFbaXXsVVwDRj2rOUs/1OKVIzR99kDNnttZmzZ0VPS+jko62Elf7+umr7d9ok83fKBjWxorfm89xRyurH1hT2lzqLlPTF5tSMiskOPpFHTMTyEJftqSkFFb43IoJDKfVuwroEU7C2n+9mKataWopm8pphmb/TVnWynN311Gi/fer4W77tOMTWU0fp2/hizOrx7TsqmLqUB9ZufQoIV51H9uLvWanlU9pmZVr6nmtzkFNXJZUY1YmVdDV+fVgOVF1HtlWfVZ/5A6rnpINcaYydXgkuq09BUNDamk7vOfUpNh5fRcm8J6/eMnNW7VQJ0+G6qvow4qdv5yHZ2yTN+FHNL1E2Zy+ospmytXdeX6Nf1x64Z+v3FTn379rdaEbFbfAYNVvUZN3W8GgQxkAYMYDOLRhhcOgzwm0WwGhg1gT07bsnbhiiuuuPJPETpnvBUBNPAATk0B3gBbWXbDDgq8hd9Z4oToQ9RXOr6Uc+nDWZufSbhtkwHhbFqANwA0Kd07JWHgwdJ8pE86RC4AMqQFNOZawFXuzZrieNpaoBQQwz47n4CIdwJLuCce3M53Ir98XccYB29InpfyAeADfLVjHG9hTMP5LDFB2rwvXsBpIWzoB8lb7gXxwL0AhshrBm+UPc/ABuE8r30GlvpgXMV13JONpxmX2UEi9+aZAKS4nvyjfG0ZYn8QEhAnTnu4k3Iv7klekgbCBIT0KSeOUx4p5RXCJAZ747lseql59/LM2A3rgHMN+Ytd/dnlMrAj6hOAr7VN7IH8YG3wu430uRuhTNKS55Q30SyQUKnZNmSetVNf6aSknE9UidNm7iRMQrAz8stXmr6Uc5ctW+ZpT1K7D2XMGJF35n3s9dQHfgNcTM2mIJdYUo06xLuRRloiO7Ah7Mpehx1ji9gV9+S3u3lfq7TtkIW0p76EcqMOWPvbvHnzf7W/dyvUJ+wW+yWvuT/pYt/YOUC+nb/93cJcD1u19ke9tCTn3yGQViyLRPnYvOVelDXtTlqFSTVtoXdZ8jdte2pCWWEj5K2TWCVPaYNJg+N3Q/BQzsybfT2Tt2LLEKd36jd5HvoOyFqiBaivqbWPPAM2Tp225Wf7xbspQ+o1eci7QKxhjyndl99p06zN8O7YKXU/LUK/RpQDfS3PSxq8L/lzp74Assr2hzZvsa3/ZHvviiuuuPL/Z2FsxtiLPhSl36Ud5nfafrv8ji/hd/oh5nMIbbS95jczf2A5fpv2lavm2NVvdeLIxzrcoaBiCxTWqUylPfseOMH0OymbM5/KHKCEHGUV8XphRY/IqhOb79G5CD99dSR5bweWUCKSwRPlsOt2lEN0MnlgCQSWXErc6af429EO3xItYX7/Msz8bq6FbOC751yT5nFzLml5ro/x07mDyaQEhAVRESfNPWL2+SlhTQZFN82r2CIllZQpIJksSGU/iCTzHuz1EFnWX/vez6mDC+5VlEn3GHtWmDRjzT3Dg9Lp4ISMOlQnj2JLlNCprCZNc51N4zR7TmQurSOFCim0S1ElHeupy9fPm7nuDf38E4TDBU9ZWIKJMrL9qTcB4RTOYX5CeVoCgrmpJav45Lidd3pLmggIqyTCZJtBO+G/TF64McKDMCFlQMOgAs93CAhICjsR4Byuv3rlqm5cM2lfM+kSAWE+b94wv936Q1du/aAvf47Ros0jVafTC3qxcVFV6lBMVboWUeWuhdVwWAXV6FdKVXoUUvMxZdV6QjF1nJFbE7YU1Jq4EgpJLKagowUVEl1ImyKLaHNkMW2JLmG+l9bq/eU1eVWAOo0opNptcqpKw5yqUT+f6jYorfoN71eDJmXVsGVxdez5tKYv6KDgLTMUvGGOGbSM0Kb1fRSxvZfO7Oun7/b01vntXfXlxg91Zkt7nd3XTqfCmyk8tKK2HbxfGyMKacPR7ApOuEdBCek8BMTGhIzaFJdLITGFtS6ihNFyWhd1n9ZFVjCf5bQmPECrDpfR8gNltHRvWS3ZVVYLdpTR/O2lNWdzKU0JLKpJawtrelBxzQgqoQmrCmnY4twauCC7Bi3KpTFrCmvq5uKavL2QJu4ootHbymrYtkc0aMeTarvyIVUcavJxSFn1CKqsIVuqqs3UB1W1R1G91raE2o9tqO2xgfr5wjn9/NlJfR4aoe9C4/TH8S914zsz6btwzUNAXL9mys7YxKWr13T85KeaNHGmqr9XSw899LDHI+WB+x/weApR9nis4k2DdxAeLww6sR/UaVvYhDV0V1xxxRVXXHHFFVdcccUVV1xxxRVXXHHlf17A7ACRIQkAlQGYwXHB7SCqAaxTIiA4znV2bySuAcgGQwachlQn7V9+uaDLV4lWjNORjdV1qHoWHctWPHlzZQcYfyf1RAtkKafjmQIU9WAxxQzPrjNR6XQ+yU8/Jfrp/JFkwgCSwC6nFLclOdqBpZeIgIBo8EQ2GD170E/HbkdKfB2evAwTnyzRBNkAyfDfCAiuNedBcnDtZ4fNcZMmm1ifMp9fJvgpfmZmRT1TWInsB2Ge93QKBERSLqOZy+pIntI6VDOfDi2+V+HmPtHbzXOb9E+atE8cSiYjYszfh6ZmVOgbBRSfu7SS2GfiduQI+UJeHsvur8P1suvojgb65bcT+uPKTU/eX7hw0VMW4PmUDWSCxWYpO8qdMvcWe5yypKwtR2CvoeyxDc7zJWlagsmpJM6DYkQ8JN9hsPBQwwOHZSBYP5LQUj7xdOCFLPjM+VfNg173KMD2dQ8BccOkfY2NjiEhdF6xZ3ZoyMz2eqtFBT1TN7debpFTFdvlU60+AarWs5QqfVJIdfqXUKOhhdV2Yh6NCi6qFUfKan2Cv9YdKajg6CLaEF1MG6OKGy2pdYfLaGZwSXUfV0B122XX26YQqjbIp/otSqpJi0dVt/7Teq/G/apSvbhatntcE6a30abtc7Rl6xKtWjFBQUuHKCxktD7bMV7fbx+uHzb11nfru+ibDd307Z5e+iqik+JD62r3gWe04WApBUfkU1BsVgXFZTKawXzPoqCYvAo0z7UuspQCo+5TcOxDWh97v9ZGl9WS/UU1Z3t+zdiUV5PX59a4Vbk1MbCg5u8spRWH7tOqgw9o5f77tXLPA5q/pawmrS2okUtzavCirBq8LLvGbyigeYdKaGF0Cc0/UkbTIx/ShNBnNHj/M2q29D4937+I3hh6v7oFV1fXtW/pnd5F9GyrnHrvk0c0eV1/nfg2QhdvfG8M57x+P/+9Lv34m67/dkU3LpnyoYyumrK6ftWU1VVduXhJSYlJWjR3qT75qIuaNG7qiXxg3w+WMEBZIoElRlq2bOnxjMT7xEk8WMUmUjJOV1xxxRVXXHHFFVdcccUVV1xxxRVXXHHlPy/gc4DIgMk4mYPhWcyO7xwD1/UlYHwWJ0a4DsIBj3rS43f+/vXXy/rt8gV98fkmRc5+UREvZNHxjCWVlLlcqtEB3ko0QVK6Cjqav7TCm+fWyc336rvTfvox0U8/xPrp+5hkksET6RCZvHQSkQwJ25IJAogEjnmWYzL6Vbg5vieZSCAK4scjyeew/BLRDecOJBMQpAMBwbn8DQFx0nxP2J4cJcHSTZAcpw6a682zJO1Mr/DGeRWZvYxOZiivMznN83svM2Xe2xMdQfRDeX+F9cmu6J3ptG9VOm0bmVH7J2VQ9Pp0itlq7mPSPmGeK3JzOu3ukEPhpf09hINnKarbaZ2CmMlcQhGvZ1H0oor68pudJs8v6Zdf/9DFPy6asrzmIRIoGwgEW8aUEWUIVustnAMngA1Q1vyNcg2RE5SxM5rCW9K0CbUlHazaxGA8CJ0kBJJIB9YbZa1hIh8ApNmUiygJQpoJc7QsyjVz3VXz4pAQN69CQJh7XYecuK4bN41x66p+vvS5Nh5coPd7v6MnqufVY9Uz6cVmufXux8VVqWMxvdmhiKp0Lqr3uuVTs6G5NXi1v5ZEldfauOJaHVNQ644U1voYfwVHl1RQZBkt3V1aQ2YXVKOOWVS1cU41ah2gj3o8rk69n1a7j19Uoyav6r3qj+v1Sv6q1/QhjZ7QWutDZmjVytmaPWWEVs4Yqch1c/XFlvn6Nniczq8doB9W9TKf/fTjlkH64VA/nQ1rp9D9lbVxzyNaf7CU1kcVVlBMPvMcuRVodF1UQa2OKGa0lNZEVdDaI/drRWSA5u4rorFB2TV4WUYNXJxBvefdoy7T06vf/GyavrW4VkU8qPWxjykw+jGtPPSQZm0urtGrcmnI4izqvzCDBizLpAmb82qhSXtpQgktSiyraUce0pjwp9V33zOqO7ecHuteSC8NfFAfrKimOpOeUfkmWXV/gxxqNPB1Ldw+Qce+idQvV77Tleus7QY5dNOUzS2PJkeqXDP2YMr+xnX99P15RYdGaUvQZm1av1Hbt2zTtm3bPGHkhCITNk+ILJ9sSEZYMI2MtSVLQvCJ+jJsV1xxxRVXXHHFFVdcccUVV1xxxRVXXHHlf0bAewGRAadxNnfidRzjb9QXyMxv9hyET0gMGzUBJsjfv/52Vb9e+k4nEsYrfPB9inkoh05mLKWkrGkgIMxxll36NFs5c02AjmQqo9DnCit8QiZPdABLL7FJ9OcHk6McIAgsCUFEw5dEQuxMXo6JiAe7FBOREOz98Km59th2P31mjnH+f206fTsCgvNYZok0zprf7fXHzXEICCIm+I29JIi4+PaIuadJJ2JcVu15qpiiM5XVSb9yOk20B0SEfV8ICDaUNu8U9UAxRQ7NpiN7/bRr2r3aWjW3dr+cX/s7ZtfBRek9JETiHj9FmXtCTux9vqASs5h84frbaZ0y+XMiU0lFP5ZN4SMf0amTM/Tr5Z/0y69XPeUKJkuZUDb2b8RZfr7EV/nz999OQFjg2CbG+pwAzXi+v/DCC3r66ac9mwuysRXrVrIuJGshQ1CwljFANEwK0Q5Xr/yh61cvebzqb103aV43L8l+EDeMwZp/129d0okvIjVxYS+92+JBPVI5m56qlV0vt8iv11oX0msfFNEbrQvq9fdzqGaPbOq9qJgWhFXQqriSWhFTSKuOFNaamGIKjC6ldZEBmrWxhDoPz6n3mmRQrSbF1aXXqxo0+i116/+M3m//pBo0ek41aj2h1ysVU60G92nkuA+0Zt00LZg7ReOHDtCS8SMVvXqRvtqwVN+umajzywfr56X99dPyAfppnfm+a4i+OtxLMfubaMuOVxW4+3EFHnpAgWFltDa8uNZG+mtNZDGtCPfXcvP3iqhSWh5VVgtCS2jS9nwatCqzei68Rz2NMXWbf486z7pXfZfk0JTt5vyo+7Q69iFzzQNadDBAU7cU1pj1OTV8TTYNXZlVI9dl15QdeTUvrIgWxBbWzNjiGh9RQcMPP61uO59T5SllVP6jAnqs6wOqOu41Pd25ggpXz6JHmvmr2chqmrpxtA6c3K3vL3yp69f+0I0rpqwvmrL+44ZuXrlhfjPldeOqrt66pj+u/mHKNUozp0zXrMkztH/HXn3z1dcew71y9YouXLzgaagI5cGQMULsxxIOLgHhiiuuuOKKK6644oorrrjiiiuuuOKKK/+7BLzXEhDgeX8Fr+NawG087C3G/Ouvv5m/b+rXS2cUH/qhDrcrqtgSeXUqcxklsQF1KgSEZ4kiQPbM5XQsS4Cii5bQwecL6GDXbDoalF6JkAc7kiMcIADOmb+/Ck0mDf4r0sF8fnbIT0e3JJMKEAaWgOAYJAN7PkAycD6/WwLi88PJpAbRDidM+vzNtV+aNOySTCy/ZAkI0vmWNNiUetO92t01pw4+XlhHCpdQYh7zvuYd/mvpJAgI9nHIHKAjxUsoomNORe5Np8PL7lXo6wUUfm8ZHXygiHYNzKS9gX4KDfFTuHmHnfPv0Z4aeXU0ZxnPXhCeJaxIK7vJp0ylFVMmt0I/MfeL7q5fr3yl3y/e8JQJ5YxSNk4C4s9Icrn++tcICGsggMQQECh/2wdlQ67Ro0ercuXKqlSpkjp06KDZs2d7NqJiSabQ0FBNmDBBTZs29ZASe/bs8QDVxqRNWpd04/pF3bpxmTge3bpq0rxq7nvNHPW89y39cvEb7QpfrS7D6+uVusX1aJUseqZeTr3cvKBeaVFELzTMq2frZValdpnUaXohzdpfXstjS2tpTGEtiy6kFVFFtTqqtFaFltXktUXUvn8WVW+cVQ2al9dHnV/VR92eVZM2JVS9flHVqH2fatZ9QG9XK6LaDStoxNg2Cg5eqFWLF2rysKFaOGqwDi6YpnNr5+r7lZP0y7IR+n3xYP22cLB+XjZEP28coW/3Dlb8no+0c1sdBW2vpLW7X9KafU9o1aEHtSqsvFZGlNayiOJaEl5UiyOKaHGkv+aH+WvavoIatTmXhgVnM5pVw4OyaURwTo3bkl+zD/hraVRZLY8J0KLwUpp3yF+z9xfRrH2FNWNvEc3YVViz9xTTvIMlNC+smGZFFtTkiKIaG/6ghoW+ok+2vqw3xgSoeKtCKtmqnB7p+LACmpVQidoF9WKHh9VseA2NXTdM+07u1g8mv69TLpeu6fofN3Tt8k1du3pDV26wX/o1XTIF9Pl3X2rugrmqUbWaqr1VWQN79teeneba88l7gaQk2Iu1JW/9K4buiiuuuOKKK6644oorrrjiiiuuuOKKK678NQG7s57xgMp/Ba8jLSfmd+tW8rL8125KP19MVPzOhjpcu6BicxdSUtaySmLzZC/SwaOQEkbx8E+6p5zi0pXVgWIltLteHh0Yl0mxQel15rCfPg9LJg7YswFCACKCz3OH/kVA2D0cIAg4DrnAkkkcZyklll5K3J687BK/QSgQFUE6EA4s00S0AySEh7wwx4mkgGxgWSfPNSZ9yAgPIWG+s0/ECXMsfNW9OjQ6sw61z6moZwsrMbN5J/M+pyELIA0gWLIE6Gju0gprmFcRu9Mrdn86RTfPo9hMZXUkR2ltrJ9Da2ek067VJr2tfjoUnM6zWXVk/lI6aa61m3gnmc+kLGV0JG8BhTY29zrwvn67/JmumqKgDKxYnJay+rPC9ZAPNtIlpbTuSEBYdYLF/E2Cn3/+uZYuXapBgwZp6tSpHsKBqAjW+2dJHpZlYkNi9gIYMWKEjhyJ8SzbBLlw4/ol3bxxwbztRfP2V3Xryi2j5r7oVXOGMchrNy/ryx+Pa/3uWeo4pIZea+ivJ2pk18tNCumdtmVVsXlxPVc7h15peo/eH5lTE7eW1pKYMlocU0xLootqWbS/VkSZ3w6W1viVhfXhwOxq8H5eNWhcXvUbPqoa9UuoRqO8qtesiBo3L6cGzcrq7Rp5VKNhgIaPbadNm1YpcOUqTRo2VFP7ddHqYZ0VOqWvvlo4UhdXjNHVpaN1acFw/bZomH5aM1JfbRquxG19dWj7R9q8rYlWb6mmZVtf09Kdz2nZvse07NADWhJaWovDi2pRRAEtiiqoBRFFNPtwIc04UNBofs08mE+zDubVnEP5NS+soOaHF9SiyMLm/MKaH1ZIC8ILaaH5viiimBZHlNDS8HLmHR/SyqhHzG/lNDOsmCYeKq6xh5/QsEPvqH1wRT0zsILyNiyqHDVKKX+d0ipWp4Tua1xOr7Z/Wq0G19P8TVN18ps4Xbrxi67fuKJrl6+bcrqpS6ZV+OP6DV28eV2XdUM/X/5dW3dvU7v2bfTs40/ouUee1FuvvKFWLVpq7py5no2mk8s3WbARbMVJXjltyWlPrrjiiiuuuOKKK6644oorrrjiiiuuuOLK/xsBx8MrnlVNWEbfkgd/p5Didz+GK3ZdFYW9ll/xGfyVlK2sknL/dwIiCeIhR4BnuaWELGUVW6K4ol4srEOtc+vwvAw6QnRCqJ9O7UsmE9iDgSgFyAK73wNRERyDTGBZJUgCjkMaQCxAEkBMcIzfWYLJFwFB5MQXJv1E8509HiA0vgm/TTaY37g31xBFwflcRwQFpAYbWxOhcdR8RgenU3jfrAo37xFbtKQSs5j3y1BOZ7IG6Gxmlk4KUPQLRRQ+NrviZ2RVYrVCOp6xvMLuKaO5FXNq1kg/bV/pp3DzbhFGD3bKrvAiJXXSXH/6NolDXpKnRzMXVdg7BRS3oa7O/3JMN/48z5CigO3alXD+FAFhwWMLEPNpv6McJxwnKSlJcXFxOnPmjMc4v/rqK88+AO3atdNrr73miY4YMGCA+W29oqKide7cOXPez56lfm7dvGgs7w/pqpOAuKUbV2+Z4zd19cZlXbjynZK+DtXyLaP1Qd839UrDYnq9WXHV7vyo6nR6VG+1KKJXGmdQg76ZNGSdv+aGl9WC6FJaEFNCi2NKaklEGS3cH6CJa4qr8/B8atImv2rWKaEqVUurdr0S+qBTgLr1e0Sdejysph/4642qmVS5XkmNmPCRtm4LUuDaQE0cPlSjun6gcR1qaVnXBoqZ2EU/LR2lq6sm6OqSMbq4ZJR+Wj5GX6wZq+MhoxSxdZC2bemk5cGNNC+oqhZsqKTFWytq2a4XtWzfo1p2OEBLwgprMQREeCHNPVhQcw/xvaAWRuTXwsi8WhidW/OjcmtOeA7zTjk1N8z8HV5AiyOLanFYMS065K8lh8pqeeijWhP5otZGv6QV0U9oYdR9mnKogsYdeFFD9r6nFsvf0kPd7lfWWv7K8E4pZXmnhArVKK1yDcrp2ZaP68NRLbUjMlC/XflK1/S7rtz8Q5euXzZ6XRdNOaOXdEt/3LquY5+e0MChA/XOO5XUvEFDdf/4E9WvWUdPPPa4Z+mtESNHKiIiwmMXTruBlLAb0ThtyZ6TknG64oorrrjiiiuuuOKKK6644oorrrjiiiv/efmfICCu3ZK++GKjwmc/q4jH8+jEPaU8yw9BNngTEOz3cCpLgBJyllHUw0UV1TqXYmdm0oktyVEPZyOSyYe4Lcn7OhCFQJQCG1BbMoC9GeyeD0QsQDYQ9UAUBGQDBAHLL0FAfBF6m2DYm0xMoGdMmpz7mTmPaAqugdD44UgyYRFv0oaQ8JAbJn2ID9L43KTF31zP8dPmmpNEaIT56eiGdDo0KrPCG+ZRdPniis9SViczmffNHKBTGcopvmgpRb5cRNGvFFG8fynFZiyrLSWKamqjLFo4xU971/gpdJOfwjf76WCX7AorUVwnICDsRtRGk7KXVeI9JRT+bB5FLHpNX327R9dv/v0O4E4C4k8twWQJCAsQO5XfuAHr+QMuo4TmJCQkaMGCBWrdurVnM+qKFSt6vrNM08SJEzVixEjNnTvXszH11asXzV0umxtdIf5DukrIg/nT6M3r5s8r1/TL7z/r25/O6cw30dp3dLUmLumspl1eVOX3K6hOx8fUtNczqt25vCq2yqZqXTOqx5Iimry/nGaEl9Hs8BKaH1VKCyPKacGhBzQ1pIK6jS+meh/k1rs186tOwwB16v6Mho17zeiL6tSrghq0zKUX3/bTO3VKatSUbtp9cKe2btulGVOnaESvthrcporGtX5Lwb2b6tSMfvpt1VhdWj1WF1eM00/LpujLZTN0cs10hQWNVkhQd81f3VLTVjbUzFWNtGhtU60MbqjVW6pq5e5ntPRAGS0OL6KFoSyfVFTzDxXVQiIcIvJqYVRuzY/OrjmRWTQz3GhYds0Mzau5YcXMOeW06OADWrL/Ua3Y/7xWH3xTaw9VVmBoJa2PflXrjj6nBWFPa9K+ihq0tZbqzXxLZdo/oAzV/JX+nRLKWLm4cpvvRWv466nmj6jnrA91OGmLfrx2Rr/e+Fq/XD2vC9d/06WbV4xe1xX24zAl9YMp33XBQapZu6beebuSZk2bpv17dmvOzNmqV7eunnnmGb3+xhvq3r27Nm7c6Nl4HMIBe+ETG8FmrP24xIMrrrjiiiuuuOKKK6644oorrrjiiiuu/O8QcDpAZMBkQOX/DAFxWWdOzdW+EWUUWT6HTt8T8O8bMgOe316S6FSGAMVmL6OI5wsrtn82ndpwrz6L9NM38X76NtZ8RiVvLM2G0OzLANlA9AG//WCOQyxwDNKAY3bjaZZbgqwgOuKs+SSSgd8gLzx7POxKToNlljzkwd5kcgLiwbNJ9aHkdIhyiGcppwN++vFIcjoc/6/ll8yzEh3hITDMNZAQZ8LMp0krfmd6HV2SQVEf5Vbo00UUVqi4onOUVlyWMoojCiJzWYXlKqUDhf2184kC2tgyuzZOuUd71/kpLMhPhzckkxAHumfT4dL+OsESTCznZPMQMiJ9GYU/lF0HJtyvz86t0HWT93+3WAICda6K4y2pEhBOdYolIPhE8G5nw+lhw4bp9ddfV0BAgB5++GFVqVJFH3zwgUfffvttPfvsc+Z7W+3du9dcz0OZ62EbICCum+/Grtn/4ebNW7py9aq+/+lbnTwbp+jje7QnarUWBA9X52F1VKPNY3qnVTnV+Ki8qncupTfaZFelThnUYWZhjd5eQROIeDhQXNMPl9TssHJaEPaYZu14Qr2mlla1ltn0Zu1catvlMY2ZVk2jp76jrv0fVtP2+VW98b16rWp61W/1oGYtGqHwI5HateegZsyYrmH9PtbI7o00uWsdrRrQXBHTe+jLVYP0U+Ag/bxmmH5cPlnfLJ2nU8vnav+KsVqxtLMmLWyuMQuaa/LC9pq/oLtWLumuNSvbaGVQVS3d/pQW7n9ACw48pHn7jR64X/MPltH8w8U0P7yw5oYX0KywfJoRVkDTQ4tp+sGymnngEc3d+4IW7KyoJTuqas2ehlq/v7kC9zXSur3VtD70DQVFvaIlh17U5F2V1DewpiqPfF1Fm1ZQ+sr+uqdKCWWqWlRZ382rIjWLqGKXFzVkTQ8Fxy7RnpNBCj2zQ6e+P6qfrnyrSzcv6MrNqzKlb/5J5774ShMmTlblylX04YcfejYX//3i7zpz5qxWrV6tjh076rVXX9VLL72kLl266ODBg7f3+/jXmmIu6eCKK6644oorrrjiiiuuuOKKK6644oor//sEzA6MFwKCNf3B8v5uuXLzB50+Okp7exRUdIls+vSe8sn7PzgJCMiH7AGKz15WkU8V0ZEh5ryD6fTdST/9kGj0aDIBQJQDyncIg1N7kqMhPBEIh/30Y0xyxMO5A8lREMfM75AK/MZySpAWEBZfm2shIFgyiX0kWJ6Ja1hW6eSuZBKD9CASUNL4yhzjWiIevjbfPUs4mXRY9okICv7+NiKZ5Dhp/iYtng/i4zNz3lnz3EkmnYTADIocmE37G+bWwXfzKbRiQYWbd468v5gOPFdQO+vl0o4+GXVgUTrFmrR5N94x2igbUe/vl1WHHiiWTEBk/XcCAnInMsCkPcBfZ09M0bWbv9wuhb9PsBFsBSVQISVJkYBITTBIJ5gMy7FmzRpVq1ZNefLkUd68efXoo496luWpXbu2Xn75Zfn7+ysgoJw6dPhI+/bt18ULF3Tz+jXdumGMGYOGgDD/3bpp0r69McmPv57Xp18kKurYXu0MXavlGydp6PQOatntTb3bsoJeb1ZEr72fWy+2zKQ3PrxXLcbl15CQChqzq5yGbyuisbuLadrBspof/rhm7X5avWaUNddl1TtN8qjb8Gc0Zl4VdR7ypGq3zquaLTOrTutMqt08lzr2fk3rN81WXOJRbdqyXUOHDlGv7q01dvD7WjCurdZNaq89szrp6MqPdSaonb5Y11FfrRykL5ZP1vEV07Rj6VDNmdPOPGsDDZreRKNmdtCMGX21aPpALZ3VRQsXN9G89ZU1e9sbmrWzombseEMzd76q2Tte0OydT2r27sc0c9fDmr7rIU3b/aim7HpGk3e8rClbK2naxpqaGdJI8zd8oFU7uih4f1cF7jHfd1bXip0va9mupzVn29MaF/y6Ppn/tl7p8Yzy1Sqte97xV4ZqxZWxSgFlqZJb5VuUU/3R1TVwdReNDOylEat6a/7WyQpP2q3zlz7X5Zu/mSK5Ysrjhq5cvqpjCYmaMH6KunTprqXLlurb89971m27Ysrpm+++0569ez1Lbb1Xvbratm2rLVu2eJZisuISD6644oorrrjiiiuuuOKKK6644oorrrjyv1csAYH+JwiIC1fP6fjhvjrUrqBiiuTybCztTUCcyhagE0Zj7vdXbI+cOrcvvb4/4afzcUaP3CYfIm+TD7cJCL4TdcD+DQD0bBZNRAORCRwjkoFoBQgAiAau4TtLKEEuWAKC7xAQRDcQ9UA6RC+wnJNn+aUDyfcmGgKygd89yzpxb/Obh7wwvzmXdGIZJgiLU3tvExDmHmeIiCBdc86pXekVteoeRc7PoLDpGXV4RBaF9c+qg2PN98XpFbOBiAnzLLcJE0iRE+Ze7AOxe0AWHX68qE5kLZtMQJCPKBEQ95RVTImcOtTJX0lRw/XH9W9ul8LfJ9jI+fPnPfbyHyEgnCQE64KFhIR4yIYiRYqobNmyHvKByIc2bdp4lmOqUKGCx3t+4sRJ2r59uxITEvTrzz95SAiTkHTDpEX0ww0IiBu6dvOaLl7+XT/+9o0+//6UEj8L1+H4jQrcOVPj5ndV237vqmq7Cnq1RR690CyDXmt7rxoMyaO+q8tr+NZy6htUQEO3FNLkfWU0J/RRTd35mHrOKqFqHbKqRvt86jHhSfWZ+oLqdymud9/PqhY98qvToOLq0LOMBo5+T9t3LVTCsWitXLVMH37YSh+0rqqhgxpoxsRmmj22vpZOqK2ti95TxPp3lRBcXSfWttaJ1X0UvXKIghZ116QZzdVncg31nFRHg6a01IQpnTVzYg/NmNBRU6a30uQljTVxXQONXV9PYwPraPz62poYWF1TAqtqamBlTV77jiaueVvj176rsWuqafTqWhqzuqHGrmyuccs+0LQ1nbV0az+t3dtXK3a10aJtVTV/83OaGfSgxq9+QIMXP6NWo5/VE60rKHcVf8/eD1mqFVeWKgVUsHYRPf/J02pq3qHtpEZqMbymPhzbTDOCxinm7AH9cvUbXb910RTJFf1x8YLOfXpOu7fv0ZLFKxQSvFFJSad16eo1XdMtDwlx09jAr8YGDh86pJmzZmnOnDmKjIzUhQsXkg3GFVdcccUVV1xxxRVXXHHFFVdcccUVV1z5Xy2AyHiz/6cIiJ//OKajWz9SWP3CisufT6cz/DsBkQQBkTlAiTnLKqZWfp1Yl8FDPvx4LDnSAFD/K6OQDez1AHHgjITgdyINIBuIROB3yAAiEI7vSP79y8PmtyPJRIFnaaYDfp59ITjXQxo4CYidyefxNwSE5/7hycsscR7P9FNscpqeiAhzbzbCJj3IEAiMzw8l/8Yxnon0WNYJQuJr88yfm2eJN+ccN2kkmGtitqZTzKZ0ijLPGm/ue9w8H+QDz0AankgMc27oVj/t6pZNkeWLezahTnIswXSKPM1QVrGF8yqsmb+O7emhXy+fvr3Ozd8nloAgOCE1e/lLERAkjMKOxcfHa8KECWratKmHdBg5cqSmTJmiPn36qE6dOqpRo4ZnaR7OYU+IZUuW6Nzp07oBAYFAQJjnvHn9dto3r+najcu6evOSLt/4Tb9f+07nL57Wp9+E62BcoJZsHqWBs5qr9eAXVaNzCb3VIaeq9cipjvNKql9gafVYmU991+fT2J2lNG3/Axq3tbx6zS+qhn2zqVHvvOo04T61HlZOVTvmV/0ehdRvxiMaNe8Z9Rj2kPoMeVPL14zQ3gPrNW32CDVuXkmNmj2lXn1f19Bhr6tv78c1uN+DWjDrYW0JflR7Nz+lwyGVdDiwqXasbqsli9/XqDn11H16FXWZVll9ZtTWiBlNNXZKC42a0EzDJjfR0LnNNHhJUw1YUl8DF9fWkCXmnCV1NWpxXY1eVEejFtTSiHk1NWx+bQ1bUEdDF9bX8CWNNWJxM41Y2EITV3fQoh29tXx/T83b0VIzNr+jaRue1rhV5TV8sXnX6Q+rbs8HVKFmEeV6o4ByvOWvHG8XU+4qhVWyQUk92+FJvdvjVdXoXlHNB9TSsIW9tSVqnT776YQu3fjZmONlUw5X9d0332pT0CaNHj5GU6fMUFhopH6/8IfHXK8RHXHjuim65D0diHg4c/asTp48qe+++86z9pclq1xxxRVXXHHFFVdcccUVV1xxxRVXXHHFlf+9As77888//8cIiO9+CVfE6iYKr1xICbkLKClLOSXl+hcBwcbTJzMFKL5AKcV1zamzEen0TVxyZILH898oyx4BxhNJ4AH7b0c0WIUggAwgQgFygQiFH2OTl1IiOgJigPNYtok9GiADSMfzW9i/CAiOkw7nQxxwb9L2RD8QDWF+596QGZ7ftvp5lm6yhAfp8KyQIizb9F8EBNEP5hMi4Rtz/Zfm+AnzNxtrn4OoOOinY+bv49zXqCU7uI73OWXuBTGxd9E92lMrj+LylVZStoDkfLQEhPmelKms4vPlV1iNIooOaaMfLsT97QQEKxhBQBCcADackvwpAgJhXX9uAjNm2bEjR45o69at2r17tw4cOODZkLpdu3aqW7euh5To1KmTmjVrprp16mj0iJE6eeyYSee2MZv0bkE+oERBmIe+cfO6zF10XZfM/3/XVf2kCze+0vk/Tujktwe0J36pFmzprR5TK6tWt9Kq2D6bGg7Lp08WFFPnJfnUZWluDQ4ponE7y2jkplLqv6KYOkzOrTbj8qnDhOKq37+wqnbJrzZj7tP4tRU1eU1FdR76gFp2fFD9RtbXrCX9NHDs+6r//pNq8EE5dR7wqHoNvl8fdi6oj7vl1ZgZ/lq2uaxWby+nwC1PKHBDRS0PrKZpq2po8LKq6rq4kj5ZVFE9Fr2pgQvf1pC572rgzHfVe2ZVdZ9TU93mV1f3uW+r15w31H9eRQ3mnEXvaKjRwQsref4exPcl72rIssoavrKqRq2qptErqmlqSAMt3t9BCw98rElbG2ncxrc1ceNzGrPqAQ1f8oC6T3xYNTqUVYV3CqrQq4WU/3V/5a1YVIWqFFXp2iX1QINyer7VY2rU+z2NXzbY5OUmnfv5uH67+p2u3PzdmOM1z/JLX5z5QrOmzlb92g3UpFFzzZ49TydOJunSlSvJBMT1q7p23ZSRaZQos6vGJtj7AVLK/uYSEK648v8fuRvS0J6b0jVpTcdKauk41Vu8jzv1rwpppNaJpiTez+HUv0t8pX0nvRu50/nead9J0yJ/5hrkbq9J6Xzn72lR5zWpifOaO53rS7yvT0n/jHDd//a+2vmOvp4zpd+d4jxuz/d1zZ3S8ZbU0nFqauJ97p3Od8qdrnEeT0nvVv7stX/2fkhKNmrTTEn/qvyZdJz396V/h9h0vNP21rSIr+u89c/In03jbs+3wjUp2Ymv3//Mfe7mGnvu3Vxj5W6u4bw/O075T4h9dl96N+Lrel/qPPduxDuNO8ndnO88N63XpCRpTYPj2MGftQWwnZTqj1PsOXc6zyl3e75T/sq1rrjiyp8X2gQICEBlcN+/W748v1uHFlZTxOsFlJizoJKy3iYgbgPnp3MG6HimAMX6l1Di0Oz67KifPg1Njj6APGDJpHjzHQKAaAZAfMgJGwFhl2Qi6oBrUMgAohRYBgkSA+U7xABLM5EGkQ1EU0A6eJZNOnD7+w4/z14RnAOBQFoQApAbpEEUBuQCxzmX3yAgIArizfNCTJDuF+YZITMgHng2S2gQQYEmmeshPSBC2Cyb/SpYrum0uSeRG6TPtZ5oDHN+9OZ02tE5mw7dV0wnMv/7BtQoeXo6S4CO5SmosLcL6vDKevr25zCZHuN2Sfw9go18//33HgIitTb7LxEQlnzgZni7AzzjBc+N9+zZo549e+qtt95SpUqVVL9+fU8UBH83b95cyxYv0Zefn9MtNqG+ZToyz14QptNM/tN0bskd3LWbV3Xl5kUPKH711i+6dOO8fr3+ub7/47hOfrdPO2Pna/KaD9Vy4FN6pVV2VeyQUc3H5NNHcwqo7cyc6rosn4ZtLq4RRgevL6Y+Kwqr15Ji6jirmOoNyqv3euZThykPa/KmypoSUkkfjyivGh8UVJNOj6jH2PfUcXgl1e5QTrXaF1K7ASXVZVgJfdg7rz7ul09D5pfS1K3lNXl7KU3bUkEzNz2hqRtf1JiQN9Qv6A11WfeqOq1+QV1WPaNeK59U3+VPqtfSp9Rl8bP6aNFL+miBOTb3KfWc+7j6LXxSg5Y/q8GrntOgNc9p4NpnNHid0cBnNSzoOQ0PeU6jNj6vsRte0PiQ5zVz51tacKiBJu9qqsFBtTR8g3n+HW9o0oZnNXzJ4/po6P2q1qKMXqp9n56t9YQervaISlUqo5KVS6p8zTJ6qsmjqvv/sXceAFIV2ddvcs45MzBgXNecdc15zTlgBlHECIqgYsIcEbMiAooKiuQch8lMzkOQnCUNk2fOV7/XU+6zt7tncN1dv/++i2VPv36vXtWtW7eqzqkw7Aq9MeEFrcheoB2F61Ro9FtcuVelZQeM0VAeldq+abumfDNFd/W7R2eccqYpw2v05jvvKiU9TXsK9ppbWAHhP2QamyDwN3Zhr3mdBk88+fMLsxvmzJmj8ePHKzY2VoWFhVW//LNQr9etW6cZM2bo22+/VUZGhkM6IvjtDRs2aNq0afrxxx+1Zs0a5/5Qwv3r16/X9OnTNWXKFK1evfo399OmzJs3T59//rmWLl3669Zu+BWe4xnI7mCBZ7755hsnrQcrrOIiDx999JEmTJjgHLxfUFBQ9WtwQQfc99VXXznvDpamTz/91MnP7+3IkW/SRlmFeoc72HsWLFjgTBSoToh/1apVmjRpkhMoSyv8RhxLlizRuHHjavx+zgTauHFjyLaA9iImJsaxPfdzfM6fP/835wkFirUDbI2yTk9Pd9qeUILeWaU3efJkTZ06VWvXrnXsjf4LWweShprki8B93L9ixQqngx6YP76THtIVGCfbVm7ZsqXqztCCbpKTk6tNF7+NHTvW2eKSgUJNhHxTd7Hvjz/+2NEhZR+uvv5eQe+8C11QB6jL+/btq/o1vKDDL7/80skfdr958z/2LcU2sEfqHHHS6Q0l+BrqDvWPdFBX3f6Eviv640yzzMxMp18bSuz9xGV9oLtOY09RUVFOuZBmliMHE2yVdFAGgeXLhJ5Qz1nhd/wwz2KH1m/ji8gDddgdZ6iA7moi5DElJcUpj88++8zxkdQhdBtKsCfs6ocfftDMmTMdXxDu/kBBz9QXyp86asuFeKnLX3/9ddA8EdALdl2dHgOF8iVf+AnaAMoYO6Q+hhNsmglY6CewPG16+IyOjj4oHbiFfP/888+O/6IuBb7DHdgSFfsItiUqtpeVlRXUPwULtNGUXU2EdoL38pyNm0/aDfxZuLzv2bNHy5cvd2yXukFdqk6wd3TKO9AL9RyhHKkH+E/qNWVqhT6Pu/7aPkwo4X7aUe5n1X84W8jNzXXe59Yrf1MHaK/CCXWY/PMMviNcu42uSBN1kfupx9XZOvpEr+gXHxWufT0YoX+EDwrVN7DXqB/hdEeZoWtwhFD1KDCQf3RFm8rz1Ql+DLvA9vEP1fkw8paYmOjcTxsR7j2UCWkhXe60kxfiCNc/CRTeQZ8YW8IP2bYplP5o+2k3eBc2hD+qiT7w6fgS+gH012z9CRR8MfWa+2hz4+Liqt1uGX1Q5tQbJqrWpD5boZzQGb6/pn0mTzzx5I8T+hu0QfgEdx/3j5L1W6dq2cenK/70Nspu1kl5TX5LQOQ5BEQfJXfvrswXmyo/wb8SAACelQgA+vkmQAYA0kMEAOxz3Tlg2tzvbMsU77+fw6cB+iEYOKcBIoDvEASQFg7YP8//3RIQTnwuAsISHVzjPc7KBvN+yA6eWbW4akWE+c1ZgWHew9ZLmeYa7+Ucip95j4mHeyApIBNIB3+TLr5DSkCKcOYEaeJ9zn1VeYeIWG3iWxVbS1Ef1NeiM9srqWkvZxUJK0eCERBZLToq9pzWWv7Vedq8c4H8m+n/cULbhJ+mHxKu7fnDCAi+WwFwYgumk08+2TkP4vjjj9c555zjHFI9ePBgTZw4UXm5OSosMINPGIfyqsOoafzNf/8gICpVaq6XsBVTeYGKSvdo94Et2rQrT/mbErUyf57mxH2pT38arkffukSXPNBVp99eX1c+2VT3vN1Wd7zVUvd93FIjpnTU89O76tmfOunFGd31yuy+Gjaph25/q7Wufr657hsTqTdmnq33Zp+tR96L1OWDmuqyge11xzN/0d0vHK0rHu6iC/o30fWPtVL/57rqwRd66LHXIjVi7F9M3IfriSk99OzU3np55uF6aeZfNXLGcXpi+ol6dOqJGjz5aA3+7nA9PKm3HpsUoUcm9dSgb3qp/8RI3Teurx76rK+GmjD8q0P1zHdHmHiO1LMmnpFzDtXz8w7VCwsO0agFh+llE15dcITemPsXvTHnKH2w5DSNXnKJhk+5RA9PvFTPzbxKY5ZeqbdnnKWh7/1Ftz7cWzf1P1aDnrxBDz97n/o9eosuuvtCnX3Xmbp08IUa+Nq9+mD6e4rJW6YdhZtUor0qrSxQaUWhysuKVVlapoqSShXvL9Hq7NWaMPZr3XZzPx17zPE6/8KL9OqbrysmIVa/7N3tEBCUv7UD+7dHQHjiyf8fQh1lQMo5PkceeaTjv8MNegGAACMuvPBCnXjiic5AxIKJDOIBpc4991ynDWBQE26Ay/2APGeffbbTTjCYdrcneXl5uummm9SrVy8NGTJEmzZtcq4zSGcwf8oppzi/RUREBA2HH3643nzzTee5mg78bJrOPPNMde3aVcccc4yee+65aokMgIVhw4bp0EMPDZoWQs+ePZ0zkhYvXvy7Bv74VnR01VVXBY0/VOBMJkCR6oRBOIDe0UcfreOOO85JpxX0BwB4xx13KDIyMuh7AgP5Ja3YV+AAn+8AxgxOb775ZvXt2/c3z1Ku6IpBN0RIsM4v1xgQn3XWWY4tMlANR56hc0CBk046yZkcgS7JF4N8tokMTINNhw2Bv/Xp08d5Djt1t3UMygGp+O2www77p+dOOOEEZxDPe8Oll47ciy++6JyjFRhHYKC/dd555znlV13nDyHuZ555xkkfdk595tlwwPvvFUCI999/36lLPXr0cFbH1sQeSQv+iHLB5u68804HkLBCHPfcc49TDkOHDnX0GUqwNwAytgX9y19MX+qNN34la7ABwDtsFR/IVqGALaGE+yE+6NdST+jXugFM/M2DDz7o2P/dd98dNK/oBNCU+hRYvtgaPhFiAr8SCnACOLriiisc3YwcOfJXv8373377bSefwezWHfj9+uuvV35+ftA65hbS8uSTTzrvI2/kHwAvHHhLXaCNwFczEQnQ0+3jqxMIcSYvYaeUmSWZ0B+g3BFHHBEyj6Tx2GOPdd5PWYcDGd2CnyBu7LVLly5OW8a2suEILuobgD6+Npx/JK233nqrVq5ceVBgnBX0CZhHG0tdCvYOG/id+/DjgTYEaUqdPOqoo4I+GxhOP/10x2dRL0LpEfuBpACE5vy/wHKhnt5///0O4YytBovH+mLS9eyzz/7a5ocTCBn0Tn5pS/C9CPX0ww8/dN5LeiC0EezP+gLqOz423HsoW9qpq6++2hnT0s4Es3nKBrINv4pdYn827/z917/+1emPQJyFImAhWAcNGuToDn+HTQUT8gDIfOmllzpxk0eewyeEE8B2+inkG5/pJmV+r6Af2sAHHnjASYe7zN2BPKFz/F4o26fMKBvK8WD6GTfeeKOT9+raPQTdYxf4R/oYth8QSuh/0AekP8kkSki0wPdg+5QdxA7tcKDt0z7TVlFm+KKa+EB3u4kfog6OGTMmpB/C9h555BGnPUEfEATVCXHh06k7lB397Ozs7Kpf/yG0xZAAZ5xxhrp16+bYz9NPP+3UvVBC/aYu0gbSp2Qb7ppOkEAoJ/SOLmmb3W2/J5548u8X/BR1lvFCdf3D3yPrN09U1JijlHhSK2U37frPBIT5O6dBH6V17KnUR5oreW4tpS/yaX2MH/AHoIcYgEhgCyZAewgCAlsi8TukwM5EPyHBFkgps/xkBSsleI5VERAKEBCsaOBZVkLwHM9DLkAUcC9kw8oZ5pp5D8QAqyMgKCAWdlS9w1lpYe6z2zixbRLEB6SBXZnB3xAQrH7gHW4Cgu/kg8AWT7zXEh7OdZMeCJJMcy3PxJU9t46W9m+luE49lFs3UvnNfks+OMHoEWIiq1lnxZ7ZQivGnqjNO6b9WwgI2kEmEYTrb/9uAoJIaawxRoJtSLnG4IKzIFq3bq1WrVo5nTUGN88//7wzc4BOXjlG7JAPpkNswm8ICP400UFAlPGeqvMgCkv2aee+rVq7KUdpebFakTJbs6Mn6pv5b+mtbwbpwVfO01UPR+iKR1vrlhda64432qr/+62d7ZiGfd9OT05poxfmdNObSw7V87N668EJ7dXvg2Ya+EVHvTjzKL09/3gNGxeh655qpPMHNtCVj7fTzc9G6MonOums/o11zr2NdfUjHXT3M4do0KvH6f53j9HtoyPV7+NueujbSA2ffoie+ilSQ37orUd/PFSP/HCEBn93mAZN7K0HxnXVA1910MDxrXXvhBa666uWuvuLthr4UWc99GF3Pf5FTw2d1FNP/tRDw+Z21dMLu+jZpV30/PIuemlZN720tIdGLeqlV+YfolfnHal3lp6mF+ecq3s+P0N3fX6Rnp51k15fcK2GfXGSbhrSTTfdf5ieGXWrvv5ujL6fOl6fjv9Ab372ql754gW9P+UdTYv/UambUrS9eKuKKvertPKASsoKVFpWrHJThhUl5Q4BUWmKqbyoXOtWr9fXE77RbbferuNPPFEXXHyhRr74nJatWK4dZhBhiSjKH1tw/12TzqAnnnjy3xPqKjNTAc5btmzpAH7hgBYGjgAR7du3d4IbfAP4pGFp27atfD6fM1gLN2sSoOeFF15QgwYNnPcz8LQ+g0+ACgCk+vXr67HHHvt1Zhafo0aNUuPGjZ33hAsMMml/GPSHaxCtQKIDkNapU0e1a9dWp06dnO0DmSUZSogXoOyyyy4LmgZ3IC+ABoBIB0tC2IEzA9pgcYcKtME1WQmCLbzyyitOvtu1a+fMELUCUE6aAYaCvSNUOPXUUx0ANrAtwC6YuQio07Rp06DP1qtXT6eddpqGDx8eFIjBFpnlix2iE2a6hgPQ6UiPGDHCsTfsAiCEdgqC5JJLLgmahuoCtsHA3wp1h5U5gEeABsGeIQBcDxw40AG2QrWTACoACcGeDxUAhSFlQgFcCHmmbCFieKZhw4YOuEKdqm5G4+8RyhpgA73zPkBR6na4+shvlPnll1/+a95uueUWpaamOr9b/wAoQ13FP4SbXYxtA5YDslAHX3/99V9XNZFnQEVbr7CFcPUdfweRRR+3RYsWDmFp+8EIAA6EDnHhAwH33YL/AhRni1J8rs2fO9SqVcsBvgEJg4GK5B/gDLAJPwhYC6iMoCPsL1i8wQJ5AEwKB0ZSHpDLgGE8wzsBVEePHh12dRgDV/JAXYZ4A4CriR9G0CnvBPBiTAF4a30mQDVbuwbmJVjAB0EguFd0hRMARgAvniXdgHMAe+QllNAPZvaxrVPhAmWOXTAmCkfeBBPSQFnbNra6gK3fddddDhDo1juAMf4n2DOhAqQYAGuwWfb0+5nhDPgOGYz9BouDdgWfj98OFg82CClHnQaEpt0OJ9gIeoekJK+A4Lato14DrvJe+hGWUKfdoK3AF/Ab/ghCKJSgN2aVd+jQQc2bN3eeddd3hHfhd+k7ADa78+wOALeUB32uYPWA/EKOcy9j6VBELW0ZfacmTZo497Zp08bxW/iEUILPoJ9ifdOAAQN+1wrRQMG3sv0y4LTNZ6hAeilX8h/Mb9iyoT8Y7PlQAZKSdjhUW+oWSDR8Ut26dZ3+BW1wOJ9EmdD28B5I1ECbxBaoX/Qz8TXYbmD6CPgwCGN8UThfgpAPbJL2nGexbdqnxx9/POSz1Kd3333X8ecESGjqZSjBZpnIQ1+Id+CfaQeDke/US0h16jWBuuAm+4IJ76ac6TPS9mOvAFM1FfJJ/4q0XXTRRdWSa5544skfK/g22hqw23C+5PfK+o3jtOLdQ5R4bCtlN+72T2cX5LWqAs6b91bcNW0UNbaukub5tCrKD8Kz2gDwnk9WFUAEsHURxAAAP2D95lifsw0SZz8A8ENCQDJAHBASf/ITBBAZlkDgOs9xpgNkAcA/7+O35Jn+d3K+QyrvMH9DVkAucJ24SQNEA+nhOysiIBM4H2KducaKCNLB+ywxAskAacF9OSbdvJfvpIt8sAUT97ENE+c/ZJr8phP/mEaKOb6L0hpEalUjoy838WADBERjo8cm3RR7SnPFfPpXbd7247+FgGC8h82Ea1N/FwFBo0jAKOl02IDYpaOw/HTAGNDSgYKxZ+YkbL7TOXBCmSod8uG3BITDSxCMTsp5T6WfhCguK9K+A7u1dedGrdmYrczV8UrMWayozJ80N+FzjZ/zrJ7/7Abd/cJRunFEe935Snv1f6+97v+4tR4c21yDxjXVkz+006iFvTRqcS89NbuTBk9pqYentNKzs7rr1bl99cw33XXny8100YN1df4DDXXVk+117dPddeHD7XXG3S101t1tdPmgCN0w9C+68sm+unh4Z137ZjcNnHCoHpvcVw9900kPjG+nhyZ21sNfR2jwuN564NMI3fdhV/X/sIPu/qCF+n3QQLd9UFf9RjfUXW+10L1vt9GAD9pq4Lg2enBKaz0yp5WeWNxKI5a30bNRbfXcsnYaubCDnp7TRc/O7KUX5xyl15acpSFTz9FV75yk6z68SIMn36BBX56ra4b31MX3dNIjIy/T1BljlJy4RPErlikmaqmS0+KUsipROVuztKlws34p36OCyv0qLj+gstIiEyAfSlVRCvlQYT4rTTCFasqhrKRcG9dv1uTvf9S9A/rrpFNP1rkXna+RLzynqBUrTLnuduzBBuzBkhBOeXviiSd/WmHAx4xFBuOASwyiw3U0AIAAKhlMMWABvLXCYJZZeAzSGTQAxjALK5QfYBYkgxruBQRwz6aiIWPwwswpwAUAOztgBTwBfOI9ABqkg4GfOwDeMXMKMB0gGPCqusEPDSZL0AFQAIkACwDZIAzc+QwUQG/0xgC8UaNGji4D08NAF/0CFJBfQAa2GQjXSAcKjTpArgU+AbGJN/BdNjDrmE/aYMq5OkG/bJ/IYJEZo+48A6wzMxwwEBCBvIR7NwE9MoMtcJY/5Q6ACyiELiAgGKS6nyXtzGzkdwiGDz74wOlDuIXyxBY7duzozGQMttLCLQDUgG6UEQCj3c6HbQ0AYFlJYXUGsE2aSBuAAjbktjPsizIESLPALzoGMAXgsQAcNmjjtAF75jfSAWAGQE3b6RbqDCuNKAdAUPpU7jjcgXIgbdgsdQIQjDoSSkgvYAB5Qnc8CwjBzONAHf+rQj4gEkiTJZrsbGTbdwwmdvYndRB7xAYgDagDiPUPpB0d48PCkSfcj82x2gMgh3Kygh1hp4AqpI+Zt+g+VPqoJxC1pAsCgP6tFewPIhWwFv0CArmBVnTPygYLVAPko3t3eWIv5Inf8Rf4rkBSGJ8DIQhQh51CglgwG0CN+gDA1r1797D1lN95D/nAh4Xy1fh9Zk6jI/KF78E3s/IiHJEKWAfRQh1ilZ2brKtO0DOAGH4AfQE027YJcI7VcZBnpCewjhGwDcqb/DEj3d2GhBLshHeiD3RPHtEvY5lws32xPWwQe8U/Mv4JTA+Bsm7WrJlTp0n/wYJqEC8Ax9Ql2j58bLDyRR/YBsAlZEVgG8CKH8BNbBgbwJ8FxkEgbt5B/cNfkWZ077YTbB7SjbaDNKFvOwHNnTbisYA55Un9DWwbsHOAXNo3QMdw/QcEsBSCGp2yipI21dZb+iOsuKAcGZda26M+vvTSS47dkBY+v//++3/ywVa4zuob8o9vCNyyjLoI8I99Y+f4fvoAbptED9gG76PsORuRgbq7veJvSHHaIfwyM8ZD9VnQC4QDPp93Yeu0WZDfoYR8sEUVNkg7AQgQzmfWVLAriCn6BOiI1UrB6iP1iHLFL6Er2uvAsqVsKH/8DDZeXR+HgJ0xcSLcakK30Daif/qwtEvh6jWCveNPyRuEltsXU2bEx8QGJqtQvqQ90PapX7yP38kT7V+4fja+nAka9BWov+iWcoOcC0e0uwksiL5gfQuEOgKBzxbZth3D79m+jFsoI3wveaBe40vpu6ET4ggl2AUryahfBCYrhZsgEij0y7ATfAp1vDrSxhNPPPljBd9hCQj6Rn+0rN84Vive7qPEY1opu1EwAsKERn2U3ri3oi5qp+Uf1VPSXJ/iZvoU84NPKebTEglsSQQ4z0oBVhMkTDPhJz+wD/EAIbBzZdUWR0v8pADnSMRP9SnR3MtZEID+kBHJrHIwz0EyEK9dJcEWT5bY4JwGiA5WUrCtEp+QDbybVQyQB/zNORWWkNhu7mP1BMQF5zdwzdmOycRPmrYk+EmLTPMcqy4gQOwKCMgN3smKitWxJo3zainu8/pKurWN0lr3Uk7dPsHJB4JDQEQ6BETcSc0V89FR2rzth/+/CAgEg6Txsp+2EaVhofGDgaeRfPjhh509E7lmO750NTjg2CEgKjjsmGA6i+y9ZH50Vj/YYBo9J5hMcCh1aXmJCksOaN+BX7S7YIt27F+nrftztXFPsrI2z9WshHf04thrdeuIXrpxRDvd83oXPfBRZ/X/sIX6jW6gez9vomE/ddJLS3vquWVdNGxhGz05t7WemdVFL07rree/jtTD73TRjUNb6pL7GumKh9vq1pF9dcvzR+jKIb11zn2ddM7dHXX+gC46Z1AHXTysg255r5cGTThcg8b31L2fttK9HzXR/Z+01IMfd9CgD7rq/vciNODtXrr7jR7q90p73TiqiW54qY5ufLGWbnqpnm5+ub5ueauBbv+0gfp/21gPz26uoYtaacSSVnrafA6f01JP/tRGQ6d01JM/9tKzc4/XC0vO132TztI5o47TRW+ep2tGX6iznzxEJ93RWtc9fLS++H6kcvOilJeWpNgFS5Uen6I9O3eqqLRAhSoyoUQFKtWByhJHpxWm/CAeKssq/KHE6NyEcmcVhCkU/iuv1ObN/n3RBw4aqDPO/puuvu4afTH2c3Pdv3SZTgplhU3YEG7g4Iknnvz3BTAYMJJOPrPIws1oQhjwA4AAbDCbyz0YwtcD1jMAB/hn5mgw4NgKAwq2o+B+BkLuAQaDPJ4FLASwdM9SA7ThfkAHgCEAAUBABuUE/mY1HoClBXsZDHItnDD4AohksMTgnnzyPANqgI1QQvs2vmrWHnlmVrBNiztNAC7MfmQQDvAIYHMwqyDQNQMy8sMyfwaFDOID3xUYAoGOUMJ96JO0Adi4QWxmbTNYp9wZQAPQunUeLDA4ZUWJWwAJmIkOyAJYgy4gAwBO7HPEy0xNQCKAGPJrt29x5wMwDiCBOFjm7z4fIJgwoGXQzICbLSFtv4QyYKapOz8s92fWK0AiABYz7Nl2x95D+rgHndl+EDaKXaI/wAoAJwBo9OCOGzCQ+kYdAVwFYLbb51ghnwzeIXzQAbbMs8F0zjUAMIBeC3AwGSSY0CYzw5vVOoDc2CPPAXJgWwczQ7EmQj+RmcesZEAn5BlAhvION6ChjmPjgKPUK/LEdlzoGrGrgahvgCHVzWKlrAHLAUABUtCZFWbGowfAbNKHPQGCUbbBBHuBCKQuQDpiV1awb8A4wCICgJ/NJ31kfAAEFSAk78HPkC93WWIv2IQFzwFi3cAqQjnRicc+sGmes/mHRAU4R99PPfWUY6due3G/C98PuIwvBfAMBtBjM8QBSQwRxnY3+H5shnoXaLtu4R2AceSDMcHB+DsGvcz2x/7ZusW9KoW6CMkDIEbdBLgNzBt2R/4tsYR9B9texC3YAj6lc+fOTl1mLEM5AO6Ge5a2gzLjOYBWSCZ3emyaIIrQHbaDX3nnnXd+U67ViV0VhO/EV5NH4g18D/4Jwg0bpH2F6Lf2THlCXtGuAWAD7qG/wHhsXLSvtIUAx4Dd2LQb1ERnEHL4MuoPdoHeAFltnHySVuydvGObzKAOJDPwoxBFFuiEFHO/yy3YO/WessHn4iPdgDrvRVcAwxDVFjjGrrBh649oD9BBqPpO/cWOqLMA6+6tYEgD3/EfgPr4EOoes9wpA6tH2mlsgvYEW+STPoO7b4TvoFxoN8g77WQwwJb0QHzTN2KrSEhsCB1sj9WpoQQ7w2dS5twL6fJHCL6YNg1fjU1x5oE77zZgN6zGREekAdIgcAUQfUBWB2Gz6BpfVl0fB3/JDP2ajjfpR+CDqX/YbTjigjhZLUiZQCCgP3e7RZ8Dv4lfJM3ogL4FK0Lc9QlSmtn85J02iBUYgX0jt0CK0AfDv7MKkmcpM8o71KoYhLKgz8G92Af2EIxU4N3YPL6fNDGhJ9jKBwQbpT0kTuov/UDsF9KC8y5CCb7erjjFnsORFYGCrbJCjH47+cCmakoweeKJJ3+M0PaGIyAsDhyu7x1O1m8eqxXv9VXi8S3/eQVECw6h7q2cRn2U2LWnou9ppbSptZW12KdF35nwtc/Z6ogVBZzdAJmQMNVPIEAEQEBET/YpzlyDoGB7JVZBsBqC1Qo8B+EAwZA0w6eV0/3bM/E3zySZ7xAOkBgEiATi5n4C2zHxXuKC1GCrJu6HWIBIgFAgPsgDvrNKgtUNPAf5wcoHVkRAZpB2tmMibc7WTsRdRVo43xeY7+ZztYk7x3xmL66l6Hcaa/m1bZXcu7tyGvoJhtxWAcSDDVUERHbTboo/tZmiP2EFBAREzfueVmgTKfdg/TJshH7Uv4WA4MUYmzU4EkCHkU++08GjswA4wQDBDs6R8vIKlTmJhnwAnP5HsASE82GDeRf9CT4rzI90Lfx/mXerSOUqMH/tNn9t0a7iLCX/PFWfTH1Edz97nP7+YHvdNKKL7h8doYEfdNLNbzbTda830MBxrfXsgh56NqqrnlzeXsMWd9bIuYfo9Rkn6O1vTtfz7x2nh586RHfc31W3Pxihwc+doCfeO1cPvXOGbn3uMP19SEdd+ngbXflMW93+bjcNmnCoBn/TV3d90l43vt1It71dX3e901D3vNlE977eRve92VV3v9Zbt73UWzc801VXD2ulK56op8uf9OnyET79faRPV75cSzeNqacBE1ro8Z86asTMznp6akcNn9RGT3zZyoRO5u9D9ez0k/TCkgs0bNFluu7LM3TM8KN0wohTdfyQY9Tr1jY69vbOeviNa7UsebK2b8tXRlyiFk+dp8zYdBXv8Tfc5ZXlOmC0tr+iXIUmUCaVZUa3Jjh2yCerHyAgik35mlDBNb/ynYHmtBnT9djQx3XvgHs1NoCAoKytPRC45oknnvx5BVCbwQ3gAiBvuNlVCDOqALwYRDPodgOWbP0BUMhAncEK4CAzJhmgB/MFANwMBBmQMfvaDWTRdrDtBbPgGPS4QT4AEQanAHgAOKEEYIRZu4C93Auga9ujYMIAiVmUAFYACADQzHjkeQDTUA0qAy0aVAaozPIMtW8zOgAoRn8AHwBogGo19ZPM4ARs4VlANwug/xFCGignQF/ywYoANyDD33ZbEsq0upnEoYQyB3gChILoYYYqREqwzgzvBFwBKAIgBWCyEx4QwCvKCzCOrQmqAzcBqwASGHADvAbrULsFEJ+Zhwy2AU/Cid2iAOCMtAKYAlYEm7VHnWGrEmwLfUL8BZtVzN7k5B0QERAjnHA/7wP8I150GkwYxANKAMpB7JEvdIdO+B4OFPk9go4B2gBl0Qt1CfIJQCGU/fIM4Cl5oZ4DIlKvAKOsoEObbgiNcKAMQoeYbYmoO/gTdx2lXllgFL8F4EwdDQWuADoBkvFutuZwz+oH7AHsJJ/MSnaTnoBKALOUKcAPQDd9ZbdNW7HbhOD/CNiru85BvgGi4jsByt1pAMAlfvJB/OGEOs+MWQBBfAoDzUAB1MXP4he5lzhZ6Yafp2zCbW0EcQKAxL3MIq+uzrkF34h+ySNEh/s9gKeA4eQRUD+UEAd6Roekg33MQ/lx6h95AywjbgBjSAXsEBIMUDWUYBMQLADh6CQUKUP+IZywZ+o+vjCYzkMJoCY+iffQRoVrOyCNATGpdwC/dnIBz9AWAsACmIbyFW5BxxAMkEHYl21HsV3OjsFHkR9sHrAewDWY0I5an409kQ63HyBtkA74J37Hd4Rqs/EBAMjcBwkZSLryLvwOaQawt/UMX00Z2X4K77J2HUyfzMrH/vAPkLVuIgpwFpKM+g7QyqoSZpIH8/vUX3w0OrdlTz22wnvID3FB2pGfYOmhD0YbjE3TTkNUQITij3g+WFuKkH9Ifd5NOxiKpD5YwdbpZ2Fn6DHURADSZc8RIA3M0A/sb7JqBcKV39F5uK0Ef69YW4Yw4pyycEKaWdmED8DXQBC5/Qc2Y+syfV+A+lCrmsBE6F9xLytr3e2ZW3gnZUq/A1/EygFWn1pSDh8QSqgrHJhPe0afnnYssD8KqWXbZNJCn5K0hRL6HtRZ/AUTTHkWf4hOqPuhfBD2DHHJOyCv3W1UdUI/xU7AwBcz+THUezzxxJN/j+CLwhEQ1FN8NL/9nvq5fut4rfjwSCWe3ErZTf75DIjchpFKb9FL8ed1UOoHjbQxsZbWrvBp6bc+xf5QRSqs9K8+AMRnJQPgPdsiQQhAAERPMden+5xtj1gdARnwS4pPu0yAPCAOyAJIimxzD4QBKxv4mwAhEWPiIJ54iIg5fjKC+7dUrWpgtQJkCPEQHyseWOXAPZAOO5P9hAOrLCApuH+reZaVEpaQYMsnVmhwdgUrIsgTBMUa85lh8rLW3M+ZD8kmjuQxDRRzeXvFt49QVkOjs6aRymvp0ltggIBoFKnsZl0U75wBccLvPgOCsqbMKfvAMuc3xu3/NgICgyQQOZ90amj0+M4nCWMQxqDF3sf1sjL/cxxcXAHx4Ee8TTAKIBPkI0Twf9j/mzhUbJ4sVKn2aX/ZFm3Zm6mE3BkaN+15PfjSxbrsvl76+6DO6vd8Tw14r5duf6uzrn25he74sI2emNlDTy7voYeXd9XQJX31xrJz9U303fpx9oP66pPbNfr5KzTqsbP17KOn64Wnz9Ur71yqUZ9epGGfnqz7P4pU/086adD4Thryo4lnVqQemNxNN37cTH9/vY6ufr22bjDhplfq6LZXG+qON1vrltc66ZoXu+jyZzrrsqGtdfEjDXXBo7V03pMmjKili1+orxveaqGBH3XVE1/00cjPDtXzYw7RC2/10UvvHK63x56hT2der7HxAzQ6ZZAenH+Dznj3JHUd1Ec9+h+hrv16qst1rXTW4KP0ytePKmX1Uu3Ytl4ZK5IVPSNKq5NWqXR3kbGMcpWVGq2Z8jhg9F1sAmdtOPZnQ1WRsPKBrZjK2ZKprMJ/n5GKygpt3LxJCxYt1KRvJzmDazuryNoCwZa712HwxJM/twDQADwySACgcxMKgUJ9ps4zOAZEYzm6nV3FbwC8zIpi0ADgwcCGgS5Avh38W+F+Bj2AKQzI2W7FDbABVAPiki5mgLkHqgwCGQwCLDAYCicMshnQMjiG0Ag1OGZQBkDGoIoZjAzyINPJA2AeA9XAPFgB6AFIB1RhwBduST+ABSskAN8ZxLEHb7BZjsGEmesAPZApNOB/5OCcjoPd0obyYKDpBtEAeBk8k0f0eDAzma2gP8A3AB8GxwAMrJqhvQglAPOAGgBFgCu2E4z9MEOOFSrEBegbboYc72Bmul1RwIzNUOWJ0H8BLAK0BDAPB9bQvwHs4l5AKlYBMaM4XLlSz9AjoBWzJwEZ3OlnZii/kzfeb88+CCXkD2AF8oE6GAxURGcAXtQnwDdslvrAQB8QL3B2b6CQHwAiSAra/XAdTCvkg3pF/OgeXwP4F2xbISsApfgiVmgAHjPTG4DRvb85IKJdDQTYQh0MJ3b1C/okbjfRwvtsPWd2OvaGHgHrgtmmXZ0BIMOKKffMUYBH9GrLzc7ax0YAVtEBv9n9s8PZPsARpB++AsLKPbsbe8CvMesWIsICnpQJ9QQ7ZKVH4HYxgYIeIJLJC2RfoO/CZkgnegHgtHuQM8uWZyDPwhGu+DfqG4AfvjpcnQsUQGxm/GKrENQAWgjxQogAIALI2cOFgwn6BfSkzQLYhcQMZXf4O0gY2jZ0C2CGT6Q+AYIBGIayedordATBBejvLqtAoc4xMxhAEbujjLCP6oR8A3jiP7EjfEY4feKjIa6oewDjdiIAOsFGIHYAQmsCRNNW0y7S7lpSgLjwJ6xipB7i//CZocgXBP8NuEq5YaOBNkeckFaAo+gnlJ/mPvQGiY8d0hdxEzn8zrNu4NiK7fPwG5MumARB+UIkBJKixIN94ztID7PG7Xv4jTbZAtAA68yWD5zV7xbaf4gqfD4+gPbPCvGiD/RC+ixh5Bb0TjuGb8QOsG3qMD4dQgIiIFTbTN5YuYXPwMdV16bUVOib8X5sH8IwXB+S3yDWqYvojZUC7vKF3Dn11FMdHwmR9Xv6GeGEMqNvg08hDeHISwSd0Q5A+NH3ol21PgBbhiRGn9ggPjFc3ql3duURvhnyP5g/IQ5WJOCH8CnUMe61bTvEOPkIJbwH3eGvmUxCfbPtDM/Rr4VIw85IN+1/qL4KfRL0RV2hzjJJB5unbeMadSzUs/g5yHH0wyQn94SW6oS+LeQaecAXMLbwxBNP/rOC3whFQOBLaM/4HT8ZzCdxzYZgsmHHVK344gwlntFW2c06OecUOAQEWy+17K2c2n2U1K6nEga21OpFdfRLns85gJoVCZADu1L9JIJDGrBqYJlPm+N92m6u2dUDEBOsboBIAPyHHNgY7X/O2RZppT/wNwdbc52VEnyHIGAbJrZ6ivrOp+UmQEKkzzfvMunYnGJ+N+/LWOxzVmasi/UTBmnm9wyTpg2sckj2+c+SML+zgoK08g4C2ypBNqwy79iWZOIz1zj/Idtc38R382zu8qr4FtRS0rQ6inmngRKubaOUDj2VXauP8p1VI0FIB3ewBETzjko4t43ivj5fW35Z4ODpgRKuzLgGTkOZU/aB7Rc28m8jIBASgFESeAEdIjoQfAZ7ob3HBv8KCJPpShvMM/4lDwHBPPybv4kNAqJC5ZUlJhSptKJAe4u2at2WTMWnzdWUuR9o1EcPqN/jZ+qiu3roooHtdeMzXXXXm711+1vddfdHXfTo1AgNWdpHgxf31rDFx2tcYn+tXP2pVmVOUcqcL7V83Fua9cYT+vrpOzRm6OV6/enz9Opbf9Mr407Wc5MP1zPTu+vpue319MJ2Grqove6b0U7XjWuqi96rp0verqOr3q2rG8zft7xvBpnvN9CVbzfSJa8118WvtNGlI1vpkieb6sInGurCp5rowhHNdfmzbXTTc13V//m+evy5o/TCyJP13vPnacKb12na2IFaMud5JWd+opVbJ2ryz2M0YMad6vv0UWp0Uyc1u7qr2lzbSRG3dtXlz5ylD2a/rOzNSdq1Y6tWrcxXdlSWtuduVTkExAFTRsVlKi6rVKFRe7EJ9El+VT/BFom5B+KhvCpAHlkSosSU9Q4zEFy/YYNjZHS2rT247SKUAXviiSd/HmEACBDOAAuQK9yAj7rOtnqAvgBKbJFkSQMGIcyGYtUDA0gGLey3D1DCIM2CR1YY2ABkMKgC9AZYcQ9EGXwDLjBQBIi1RAf+hYEe4AmgAYOrcIKPYlDOQIsZdxyUGeiXiJNBFSANM4GZyc4gEGCEARQAGiBqKFCJGYmAqoAQDMDdQEgwAZwGYABAAIgNN2i1gm6YBQZwge6ZIe4mbP5VIS67RQSkEYC6BVLQF2APgAF6BOz/PeQHA2nAFwa+AIIMqukThBM6tgw+AV0oO8oKQR/MNGUQjB6ZUR/YQXYL9kMZUpb23TauYELZk1ZAJ+wC0DlUewYAhM1AJjALknoQDoRCiAugDdAfIAQg2w2iM3hnliuED0QcAGc4of6xsgFyivoZbPY+ZUzaqDcAWNQ/dADISpmT9nBbjdnDjQEvANOrKzuEdwK24l8AMKkfgCpcC2b36A1QA8KBewFSAP8gGdwzP7EFtmcA3ICkoDMcSsgjIDXblATqmnJAVwCxAEwAs4CM+DHeHwiakGf0BXGKnpkN7vYL1meQLkhY+x6uA5ICqKAHiLhw9opQpgA+gFaARm7/yKxU/CbxAZza+gj4a0FMfBIEXihBL4DS3IedsyVc4DYc6JXZ4/gcgDP8As+xAoH8A7qGWhlAWUK24jMoT/xXuDoXKIC5gF6Qx+7VE7RREAW0DbQ1+NNwgt9h5QnpoE1yk09W0DUEF8AgNoKPI/3YGe0Qfpe6E6rMbHnY1VjhfDM6ADjG3qiL1Z1fYoU4AfgBFbFX2sxQdRC7xnbxS7RpAMQW7OZdAJyklZnN5DGckF78JUQYvhbig2u04egEO6CMKBM3mRBKsFF0RD6o19i4e+xot4gjTsohmM4pL37D56JDyGi3fyY+yBfqB77NHkDNPZQzdZC2jjioP5Qvfi3QNng3voOy5R7aXVvXsEPKA4IHvTBLvSbtIgQIxBx9LzcZBqlqgXx8R+BkCdIOKcYWOJBv9GdoF0iHPX+Duh/4nBWIAuoBOoH8qG7VWE2FvhpEIT6P99u+WjChXCgr2hr0ycQOqzPyh04AnCGDQ20J968Itg8JQ1+NOmTtIpRgzxDK2CJ+0hL01Du7YhY/hM+vCaGDbqi3+MJg20Zh1/g9+lrYFX6Pa7R9+FrqGu2Buy0IJvgXfC7tAP1v247xfr7jE7Ah2s5QfQvKiroICU6/At9J+8BKNCYFYPPUn1BjBp6F6KLtxzeE2uIpmFAv0Ds2BdlviXxPPPHkPye084yhaVMCfQ6+C39CHzcUAcEz9KNoR4P9vmXPMsV9c53iL2yvjJbtgxAQfZXUvqcSH2qutVG1tHuNTxvi/AdBcxbCzhT/igMHxDffIRAgE9jKiHMZAPlZbcAKA+dgavPJ9krO2RALzLPR5n5zHysUnMDfJuyq+psVCKxUYDUCz66Y7FPU9+ZvVjqk1lJubC3FL6ilxIW1lLXCfDfxZZn35Sw3v/N8un+VBCsyUmb7lL3Qp03xJu5UP5FiV0lsMfduT/Mp3zxP3OtM+rdk+pRr8pwwzYSv6mj5Cw215O7mij27vVK7Vm271KCP8puz+iEI6eAOVQRERut2Svh7B62cept27Etw8HS3UEaUFWUWrI2hTaANpcyDTULjWfAPxnaBv7nlDyMgCDTGJNZes4bG3/Ya9xD+QUCAeLuDeSZk4MXOy81/5p2V5l2VxSqrKFRB4S5t3bFWuWuSlZi2SLOWjdcbnz2mGwadpJOvaam/3d5MVz3RWf1e66n7PuqtYT8coReXHK2R847U8z+eqAlzBig9daL2rU5UQVaGdpsOxuZF85Tx3Wea/8EIjXvpVr098iy9+NKRevH9Hnplgulozmyr5xe31pClrTVgQVvdOLWNLv+6ha4c30o3TWyt2yc0V7/xDXXThDq65qvauuKrhrpqXEvd8EkH3fpeZ931eg/d+2Jv3fV0hPo9HqG7Hj1UDz1xskY9d6XGv/ugFo1/TRmzJmhj3Bztzl2hvRtjtX7TUk1L+kJ3fnCzuvWLUJ2LWqv+hW3V4vK2OvyePrrzves1OXGcNuxbrX3792nXul3atXqnirYUqHJPsSoPFKu8uFzFZrxSaOyKzzJTDKZo/hH47gTKmLKj3PyhtLTMIR9KTfmVV5jfCaZsKXd32fNJwAaCORxPPPHkzyHUVwYzkAQAbgC64WaR09mAWOBewD9mg1kAhMEFy88ZlDAYA5Bh5QOzIgFwAInc/gBCgsEVs+2ZbQqIRXqsMCuTASKgEbNdGYQhdIYYzDCoAcSvbgBJgwhRQroYyABm45/cAsgGEcA9AF42X8z0ZasRZt8DUvDuYMKqEIAwSBGAleoGWgw8ARgADJjlVR1hgQDaMCAnLbyLfP+R/tWWB/Ez+CVPNn5sApCM2XeAOYCPttxrKujcblcAaRAIuB+s0OGlE8MgGkIBUCNcmhg0AzwwqGfmvJ0NHEqYMQ8BALjAYDvc7D1mRgNIM2ORd4Syk0DhPgb1gAEAAXaLAuoB6WOWIfmDQAtHUqFb7BpgH2CF+hYMFAaAJC/YKZ8WeKCsmYmN7QNcUGeCCSQQgAYB4KgmNkC6ARLII0QO9YlZ8wBVwcofHVA++Bi2mEGfAIXsq+3ewgGiBP8AiMle4uGAKn4DKCV/gOgQLxbw5RMQETAM/wAARv0HHAYICyRGuR+/Rl3A7iAv3L8DlBAPOibt9j3YJzrGnwEWhgIJayLYLe8FeMVnAYraNAAqAmLyHlYNhLJb4mC2MQQPuiZw6CkDD7cAImFX1ANWWgBiYm+AZICy1GfyFuhTEe7FV1ugGRt1+/jqxLZNtCEQNlawAwBU6hugcbCZ4m4B4ITwwu/wXDAwCx8MMAfQRv2B8CGt1BneQRqYKWzL0y3UA4hwwEF8Om1JuHYUoX4D2pI/SJpwoK0V/IXd7gcwlK1WQgn5gcgDaEf/TC6wKxPQH6Qm+sPvsKoplKADCAq2HAPsx89ZcpP6y/O0xfQHIKlr0iZhK0xkQKfYEOSGuw6RPrZuwfcx+SBw8gLvABhm9QIAJQApbapbKCfIF8B2/I7VFb4A38XEB/wrZAS2DCCOn4EYcPs/6zv4DV0CHNu0Un/o6+Db+Ay19U5NhTTiO9Anthjo0+gDkRYmjEAG0V8jnwT6BtgS5QThFiiUIyuK8L34Bvop4bZOq6lQltZfQmKyuqE6EoZ8suqElSn0Oaxd2rKBHMfO0PXB9jOqE/p0kOjYMnWgOt8BgUvZQogwIcHWFUB3CCf6S/SJ8FWB5fV7BH+N38b2sQVLeNjVcNQZdFTdu0gn8ZBPfDQ2jg1Qd2m7bD+BdtRd99xCHpnsY1fr0s+hbtC/xX64DqkerL/LfdRrSBDKOdzKs2CCbeJ3ST8ryv4IW/XEE08OTvDv9DtCERD4Ifw3Pj9YH5B+EH0b2ih+5xn7ifxSmKHUOYMUc2N7pbVrrfwGfZTX/B8ERF79PkprGaH4K9oq65u62pLh06YE/2oHtkFimyW2PuLQaIgGSzqwCsIhIxL9JINztsNMP4kQ86NPSyb5yQRWRbAigWc5z4EDnzmwmsBzbJ/E6gVWMUBEQGIsGV9LCePqKm9sAyW82lBLn26o6FcbKeHTRor7vq5SzTs4q4HDpFltkWFCCp9R5lqqic/k4eeVPmWZ39PMtbXmb1ZSQKgkTKuj5Dm1tGZpLeVNraf4VxoqanAzxd7WUstOa68o08anNuul3AaR/m2XQp35EBDQaZ55JrVTK8Xe3lkZS4Zob1G+KQE/Tks7S/tA2VCWlBljAVtOVriPdoFxXTDSCb//bycgiJjA3/Y7CSfY39x///Z3jM8krEbBZI78/Rr4zntLVVFZrPKKYpWWFRpF7dP+A7u0p2C7tu1ao2WJ0zX8jQE6/+a+OuGq5jr55ia6+NG2uv31nho28a96d9YJGv3DX/Xy6MP15svnauonw5Qz60ftjl+potx8Fa/KU2F2krbHzVXyjx/ouzf6683HTtUrj/TSW8910Tufd9HL0ztr2MJOun9xJ92xoLNum9tDd8/ro4Gz+ur+qd11z5Q2unNqU901z4QFzXXX3DZ6YEZ3PTH5cL34+Ql6/bVTNGrYyXr64ZP1zJDz9O6rd2rGxFeVvXyqdmWuVGG+SUdevgpSkrV1+QKtnDFBn30wXDf0P0s9z+mgpme2UqPz2qjZZa30l4GH6pGvBmhu3k/aULBOBUX7Vby3ROV7S1W5x3Sm95nBUGGRKkrLVGx8yAETnBUQRsWmaAIC5EKFypwzO6rIB1NukA8EzvFw7nFICj8BgdG5DZi/+Qw0Tk888eTPIzQgzJpm4Ao4xky/UIMRBMABAAQQl8G/e/DGYBwwgsEtA38aMQZvdisFBsiWREAYaDHTGDCFgaB7Gw/8BgM6yAkAQwBvmy6AYWYmEydbh9RkZhSAIYMgBnSArfgptwAyMeOSGaEM8uyAio4V4C8gHwBoIMiBkCfSCrjJwBkwM9SMMCt05ti2grwDDNWEgABUYEAJiMaMcAgI3kMZ0gkMDHT4+A0/XBOhPACHGfAxMHWDW3Qm2IaAASfkBwNLSJtw7ya4wQPaCAahgDWAFeFm2tdE6BRjP9gbZA5AaWC5uoUyxl7QH/YZjlBAGPizbzEAF2BQOD1S5mx/QdysIqmpMCBnJjLPAhrbOoBNAb4AimG3zMoHzKVDGKhrOviAcegAUAGbAmzlfreQfkBSAAxmc0Ik2vKxMxUB4S2oFUwAv5gJD3AHUB9O31aon8zU5b3YL2UG6Ai5EwjCkz9IDuo8eQd0pszwA3RYLbFDutk6gzoH+MMz2FcoQc9s8QbIzooTyE2bdtJAHcenATRRFwkAZAC0lL0bYKFjDihDuUCAQvS4+znoBWKE3wGWLaAPmYJ9AOSweuRfEcoSsoDVPAA8AEPWPgHO2QIMn4Wvxm8E1lNsBl9G3sg3dR5/zrNuIV8Qj/ha7gH4smK3R6IM0H8g4M6z2BU6BQCHhKpuFY9b8PcA+TxrtylCKDd8OEAqtg6BEmjrgUJcAKOAiKEICPKDXbL1C3XStlXMiAewtPUwGNiGL6SssS+AU2wzXDuKWKKKtheioCYEBGkhbeQDAhFiwPp5W7b8DWBPnNQj/BcAJKt2SBP6s1sXYY+QYazgI79uGyFQpuSXGffEAzlDG2HLEbKLFSO0m9TTgyHVIDppL6kPrKhw11/ARoBN0kd5BdoNaYPA4Fn8Ef43EPTGJ0Jk4lvx9xY4pg9Dm4vd45d4F3mE0KG+AzLb7cwQfAe6xAfR9kGi2foOeYGOSSeTJALJu4MVO/sfm8BfBcZHOqlHrJBgNZc9i4Iyt6uUIAuxi0DfTPnSj4JEQe9MyqiOKKiJUBb4ItoOfDFlaetOKMHe6G9Rp6jjlmDCfigb/Bq+FZutrp/BbzXt4yD0A+hvWtsP5zsoZ7Yew9dANNCHtW0jz9EPtasfwpF4ByO0TRDbxEt7Sf4Q/Dh9RnQG8WHbwlBC2mk/8d3UW9pP7IVtL/Fx9OUg7sP5Heod9oS98WnfSXmNHDnS0Qm+IRjhhW1hw9gaNodPrM4u3IIN4/fx//huS1J54okn/znBt1LvaROD9Wm4RhuJTwj2O36a5/Hj9NttP8P67ILSjcqJf05RD3VUUrfmyq/7DwIC4Dy/aaSym/RWYt+uSnisqXLm1HJWQADWx/7o07Lv/WdBEFhdwLZJdnsju73S2iifoib7tHCifyul7AV+QmLZtz4tmODfVokzIpwDps1vrFbgLAcOh+ZvDpV2znFI9WlDvIlrXB0tGNxUcRe2V9zRnZT4l06KOaGzFl3WQUuHNFPKmAbK+bSBUt5uqGWvNdCyT+s6qx/Ysmm9iSd3bi0lTamt+Gm1/CslTJw5U2trxSsNtfT5Zkp4p7FSX2us+LtbKfqETorr1l3J7Xoqs3mEchoavbDlUjOjI7ZdqikBYe7Pq9tbSRHNFD20h/JT3lBhmb8vS7nQrlE2tjwpM9oe29exQj8NX8w97vG9FX6nHf+3ERAIiSJyjIjA3+5AJkgIn/Z3Pkmw/S629CFzTiChGGRV+KftmcxlbnGeA9g28VZAQJSYQKeaazwLOVGirbt+1szF32jE6/fq6vuO14nXttLxN9TX+Q80V78XOumZD3rrjdF99dzQCD12c1+9eMsFGj/4QS0Y9bpSvxirDdOnaP+KBSpLjdH+lcuVP3uSMaKR+unFmzXuyTP05tOH6Ol3u2nI11310MweemBRpAYtPVwPLTxWj80+SY9PPV6P/HCEHpweoUGLu2hwVEc9sqSzhs3tpecmHaHX3j5O7z91hsY+8Xd989LdmjV2pJLmjdOmxAUqSI1XUVyCds9erJ8nTFHy22M0d/gz+mzQAA254SJdfNahOvSk9upwZju1uaSjOt/YWac9Yd43YYA+XTpGizIXat22DSo+YDr07LW033Ri95uOZtE+VZQVqaSs3BhepUogEYzuCWVOMIbofDdlRaAcTVmVmjIjQDw4wTxfVgrxUHWdYMqZT1v+tpwDjdcTTzz58whAmx3wAQiG2svbCjMT7eGrdjm2FQBbBvzM3AIApe4zKGNwxoCH52iUrDAQZAAHsMWg2h0XnRXAagAmBv0QI/gTBMCP2bSkmRUX1Q3EELZJjiyk8wAAkLNJREFUYVAfjICgnQKYZUYkwCygnQVD6CixxJx0AFYA0AX6NAZaDOYZgAPGBM6IDiaAIABIB0NAAFgxAxkAn3cBWKO3UAEyiFUGFqSoThhEUlYATcw8c4NJgDQM1gG+GACjC8o/2HsJvBsAiVUwVtd0WOzWMICdlP+/IuQL0AsgCSA1nA4pM+yG7RIApLAtO7APJdgcM5oZvANAhRLyh56xYwDMcIc5Bgo6YYYvs+WpO/agdWyKWfqAUdQnwEJmAaK/QF1zDWCCdEJA2G2UAm2QeoKtUXcBje0sZgSggTKhfKlToYBE/AOANMCQu76GEvoBzI4F9AeUZwY5oAQEFAB/YJkRJ/kBtAB8geiCbIO8CNz6BAIFwI14AldXBQrvYTUCumQ2tHs2JXaPvaI/7InONR1x3o+tAj65D8CHuLJlBijjzgM2ZVd9WWKEciCwEgAbIT//6kxp0oifApwhfYDn5J/3QG6wVQe+DAAHwCmYzeB/qMvYDCQe5EIg8UR5QLwChgVuVwL5zMo1gCwAscBZ6vhrwFp8LmAf4D32XlNhwIue8XfYpt0mCN+M/QHAomeA1+oIX+wQPx6KgMDPU8dJJ8SNm2jBVwNgoyN8XjAShXsA5HgW8sft90IJ/gvSr6YEBOVLG0ubiR1jX5RhsLLFnikvypZ78cUWVEd/gP/YBjPtqZvYfSjfwm+UMXExc5o6adtHtqABgKfuUL7osabCyiLqOW0ZPsXGiWB3xMd7AarJt7t+Qy7QnyD9lCdEiPt3bM8SZLSx+DTKCLFb6qAX/CY2z7vREQQE5Kp7YgX1m7aPdgN7t1s0Ub5s+0cdZHUENlldmYcTfI7bd0CwuHVC/sgTdRvCh3pt6xP2ja9Bn5BNdqa6WygbJptwD7bBPX+EUO+p//gS6rqb3A0l+FwIn0ACAlKUOk89hPCBKAjXz6A/BKEdjHAJJuiJ9pkyRs/oIxwJg86ZXILdU0/Zfs4K5KqtQ9T96voTNREL2uNrsH3sywptMquCsDfqJSROdcIkEmwW26WdxMYpf+oy/Ufs3F1v3IKu8BPknbaOlbq2D44tUW70vaifgauXEdoo+kX4XPpdgeR2OMF2mYBBPcAO6DcwJvDEE0/+s0KdtwQEbRSkuJsYx3/QDtnf7TUrXMMX0L+hf0pfjfhs+1RUvl/5WR9o+Us9Fd+3mXJq9fGD5VXAurMKokmkspr1VvRJHRXzYiNlza+lzCX+FQzLvvOTChAKEAjO4c4JVYdMJ/lXMnBoNIdWx/zg/51zHVjpwMqHpOl+coItmdimiUA8fLKywtm6yXyyciJ/mU8bVpr4fqijqJtbKa5VT6XV662cJr2UbtKX2D5CiX/pqtRzOij9vA5aeWpHRZ3SQcuvbK2VjzZT1stNlTGymRL7t9KK21op5pHmSnupqbJGNlXSLa0Ue1wnJf61q9JO76y0EzspuWd3pZq4M+uY/Nfp46wOWdXY6KYmWy65g9ElOs2uFaH4vzRTzNtHat3ar1VS4Z80VFxU7JQJ7Q/lQlnZcRBCedoypexpi/DH9hqf1i545t9OQCC8lEaKgJHyMq7xN4ZGRgjue5xPzhNwpt4TiQ18oXGrCr8SEDZwv7mRDAUSEOVlzpZBjjLMPcRdVFKgDdvytSRhqt75apjuGHa2zr2zq06/vYUuGNBE/Ya20aNPdtdDd3bXXX/rqvuPPUzPHHea3j/rIn1nBjuL7rlVKU89orUfvKPtP/yoXxYs0c7FC7X+p0mK/ewlTXj5Vo164TQNef1QPfRpDz0+JVKPTz9cj3x7jJ765jy9+dMtenf2bXph2gV6/Mcj9Oj0nnpyancNH9dDz73bV288f4q+ev5GLf7gaWX8+JnWL5uqnTGztWvOVG367HPlPvOiku95WIuuuUPfn3eF3j/jXD15ysm68bhDdZox0L7HdVCH09qq/cXtFXFLN5029Bjd+s5VemLcwxq7YKwy1mU5nYTKQmNABftUeWCXKot2qrx0n0rLS0ylr1Sx0ZWfeDADVydUOKHMCaasTCgpN+VYZsqxDH1XOLotKzHlW1JmytYMrKvKtdxVxtiB2x488cSTP6ewZy2ABiAPQJMdpIcSVjRACDAjigGJe9AFYMvgmBlXDE4QBveAKwymmNUFIIVvQAAvGCwDiAI2uGfQAhKwxBvwAPDJLkPHxzDQB+hlQAixYBvJUIIPYlY3g91gWz0BKDCYRQcMoEmXW5jRzoCYtAKmBjaqFgwkrQzGgs2uDRQaaAgfSBT2qbbgUCghD4Cs6AKQBJIAEKK6ANBcU0Dcbv9A2QK4ucEkAB6AKECbmr6bAT6giC1vS0YBVjGL919ZUk8ZALIzsGWAyzYOgeCpW7ifwTRgF8AsgJdNVyiBAGCwzzY37u1fAoXON+AyurErMWoqAC/UO9JkgTQEm6IOQYAAFlAmwXTsDsSBjTJbMBg5wOxaZpVSP6lbbpujHkNwAKYA6gQDWRHbv6tp206dttsVkTbAcQBMSBK+u+sKcbJNBH4CgIi/WXEBWAYRQ/nZuo7toDfyApDi3popmEB2AXihS4BLt6/BB0JKANJAZDFAIi2ATYCrADbMHOYaAgkDAUqZAATR17VCuQHG4e/IAzbKc1znEE5sHxCpuvRWJ4BPAHP4JTegTh0AwELfNbEbCBZmkaPLwL3vSTcgMQA17wFkcxPI+DDaDmyGWfGBK4rQC2VN2QGoAabhv2sq5AmAnXcDqFud4Zfw+9RLACrsurq6jN3Yw5gp/0DyExug7lKHyJObtCUfkBfYB+SC+xwSK+iOmcDYI/WnJr6N/OG/INEgUaoD2Gx5WAC6Oj9sZznjc92rdBhkMmOdlRo19S0QZ9wPieeeMU59xtaoI/jUwFUwoYS8sNURzwHeB4Lt1EEIR35naye2+LL1jHzQ16BuUp6sfgi0K9JB/KSZONwAJmQiBDqgKu0Qg2biBPDE11Ae7sO98cm0u+gB0N+2M9ghdkG/AVLRkoC/VyyQT5nhp8mjO1+kn34SJBd1ikkT7t8pY+oyq3CCnQ/F8xAxpJf+U7izYQ5GsHXIWmyfuhNsNnyg0L7QVyKtrAyzZUMfhDioazXtZ9BG0jZY/xxO0Al2ymQT7IfnwpUZcQKU4OPoO9B/tcLqF4h0APKabIlUE4FIYQUufgjfZ/sDCGnBB2O3tFc1KT9sirShZ/on9Jmp8/QLIVbcbVegUK7UD8oVP8XEHbewooH+K3UscJtCBOKONor+PfWHPn1NhfpPutG5XT1RU9/iiSee/HFC34p+H2MK+lH4asY81t/iPwGsqe+WmOA+/rZjBZ7hea7R/2DsYbGDsopy/bxhqqI/P1bRJzVXZr0eym8K8RD5K3ie3yxSqxr0UVzrXlp+eytlzKmlnBifEqf5z4KATOCwaUgCDplmKyW2T1pnruUuZFsjn2Kn+gkHzobgXAe2ZuLvzbF+ggESg+cJK2f4D62GgMhd7F9ZkT7bT2RwxsOqJbWUfl9LpZl0rvIdorV1D9Hqen21un6k8ur1UXadPsqqbT5r91WGuZbatoeSD+mi5OM6K/moLlrZtbsSOvVQ0uFdlXKs+d6nqxKa9VRSrUil1eqrTBM4+yKvrv+Aac54yK/SxT+RCzUMeU16K71+V8Wc1VIJk87W1p1L/RC8Kb+Cgv1OmdC3oYwgI/DB/EYZcs2OvfDDtA3uyUT0Q7ABS2AQ17+FgCBBBCK2gQRaQ+OThohAovjOp/vv8AQEHSoTKt3BXCeQGWOsqigzaWDVQ7H5WmK+mu8QEFW38TfvKizbq2171yohd77GznhVw0bfqjuePk3XPXaYbh1yqAY+frTu63eM7jztMA087Ag90/dYjTnyRH1tBsc/nHKMZpxzihZcc6ViBj2qjNc+0KZJs7RnfrS2L16i1Knj9d3HQ/TKqPM19KVDTNx9NfS9Phr80mF66f2rNHXBq1qY+JG+nPaQho85VY+/G2nu6a2nX4vU6y+foG/f76e4797S+gU/aseyOdow/VtlffC2Vg55TMuvv0kLz7xQ8445UzP/crq+OeIUvXPkCRp69DG69aS/6uxTDtehp0So42nt1fH8doq4touOv+9wXfXcBRo+/nH9GDdFq3esVaExmIqSYlWy8qFwp8oObFNZyW6Vlher2Oiy2JRjiQn/IB9M2ZkycILRO+RDcVmxSkwoLoNsqFr5UGI+q0gIW662vLEBt33wtyeeePLnFHvoJgMsCAUakHDCoJgBFwNEAFLb4UAA6vkNoB/gEKH+M6hiKxsAerbxYVDEdYgEBtMEACX3AAaQgME+4BODGAvo8D7AGgY+DE7sthzhhI4O2yOQLsDKQILA7onLgJftF9wgGwL4SNoBvNxApBUGVgwWAXLYqgOwsTqxgCj6AjCk8Q4n6ItBHsADA8iaBNLDrPqaHIyIQFQQPwNGZsq7y5bZa4Aiwd4TKtj9ha2+KFPyDGgEYRMMJK+p0NZAEGADlA2AWuAA2C3cz2xHBuHYAeBUYDm6hXoA2ANgzExriKdQAvBqZybyWdMVJwi2g80A0EL6WHAPsgZQl+vBdBssQGgxqxVgmDbZLeQfYgIgEYCL+unOP7oDTAfQAZxzb7/1rwigDNsVsVUDs0UB6ZghCzgPCOI+yJpOK4AH6YPQYTYsqxwgmJjJjB+x/QlmbgIGA7IC+FZnS4DGtu5Qx922Yu2esiatFuigDAD3sRnKwgIoEIEA3/hAAEO3rrEFu1IIQNvaAqAcdRF/xnZPNQGowwkkF74M23dvEYUfgVwCwAq0j2ABMpm6Q94C6w9xETdxAfLhf9w2g5/jQFv8JjPJA7enw38A/JJG/DVkxMEIRDAgJf4C4NT6SNoPZtZSLpAjocgyt5BW9EI6KP/AbVcgybBRwD3ITDfYhc3R1kH8hjrnANuEvGWlCO1oTcBI6gLpB4CH4KxuBjV2BihnQcTqAiAr7S11xe3L0QUrFKlnwZ4LFigHQEDK2NoJ9RbiwIKEAOJ2kFqdcB8gOcAoNojfsn4AIa8QkNQz4sdGrX6wdcgk7Aog1k5OcAv+G8ILHZA2t58BSAU0xX6ovzY/1F18sSUJ7ZY6tH3EQbvIe20e6Scwoxwfje+lTgbaxcFIoO9wr7pC6Lew2sm264Ez4LFBbIl2CD8W2JcjvUwioL7Sltek3tREbLuOL8Zvu4GJUIJO6R/Q76Idt/WNsqFOBLPBUIGZ/TUlf/Ah+A76u5BN1U3OwGZol3kPW925J8LQh4DwsWC+u479XsHOKT/aFrZ7CgTd6ZNgh7SltKPVCTqBxKD9JA+UPQRUTfpf9N3QEc9AUANKuQXCjr47BF8ggYjwXib88F76xwfT3+Ne6iY+GfIj2AoLTzzx5N8vtMX0ueg3UMchE+zf+BcCPp9xh20baXtob9zfISjwZzzHb/ji0lJ/33nXvmQlzbtGK65vo9TWHZTX0D9j34Ln+S0ild84UomNeyvuhrZavaCONmX4iYHMuf4zGthqac0y/3cOdnYOmjYBQgIigVUNHFLNfQRWSTh/J/qJCs6QiDf3cy9EAwRE9vyqMyDifNqwwv98pnlH3orayhjSQinNI5Tn66vVtQ9Rfr0+Ws2B0A1NWuv0Ua65zm/OllKNIpXdtJeympnQpLeyzT0cIJ1j8pRtfks3+V3ZIkKxnbsrvlNPpTSNcEiMPOI62NUOQYKzoqRhLyW3b6eo29orZUm/qvMfzNjPlAdlYcuUvit9ETvRgjKkvGx/gnaOsrSTBih/rvE8zxAHbQVxhmuT/2UCwv23DRgrjTPBfZ1g7+UePn9LQPA/LtBJrAq/ISC43waMloOsS02AfDDXuMRtBPNIOecWVJaopLJAu0u2KG9rohYlfa/xs1/T2xMf1cufPqBX339QL464R0OvuUKPHnuaRvQ+TqMPO17fn3SK5p/3Ny285DzNvvQiTbv8Ws28eaBWPDZKuW9P0OZJs7V53kKlz/5G0ycM14dvX6U3XjhVT93fR4Nv7q23Rt6sxBWTtX5VlOb/+JZGPX6Ohvbvo+eHHa3337hQ08YNVPrM97R5/vfaPvV7rfn4Q8U89YRm9rtFP116iWafe6GWnHepos7+u+acdJ6+OvxkvXbIsXrqpDP05LXX6IG7b9Hlt1yqE/5+gv5y+eE64eajdfnjF2jIJw/pm5gJSt+Spl1Fu1VcXmr0YJxESYEqin9RWeEOlZXuMfovUanRo0M+/LoKomrVg1EiwRIQhDKj51Kjc7ZeQq+c/VBRVqly4zwoZ8qTTrwtc2sXBE888eTPK5AGDKABmQDCw9VZGhaAGgZIzBJk4Mg1K6x0YHAEWOUGbGmYABYBPxksMpOV9zDLEBCAQTPgFn7ECgNR7uV3ltjDxiM0ggB4xMXgqCZbmQCaAK6SbvcqD9JAw8qsMgZ8djALaMNAj8BWPYBrDFghC8i/O50IA3AGhDzP9gGBA/9AwU9CejCghdSoCXBDWgGNKSsAEgAK9AAAEiwAZADaAbzQeaxOKEfKk3Iln4D17rIFdKNc0QPAL2BeqPfzbggMBuV0ZKwA0DBzHOALHaP73yukjdmngB6kF/sJJ9gPacJumHnP4DqcrdOZJo/YDGBPsFnPVgBvAXYoG+yrprPbaSsBQBhgM9B278cMOAQRAKCJnQCaWn2z5z2gO89gc4A4AGPUGTr4gflCV4CQzELkfjtLmw6gtXN0CbgKuAWQejDbJYQT9A4oZe2GfFFfADQBLgAhLbCIjQEMMjMVcAMQAvAHnwLY7l6xgd4Afkgv+rCd5VBCPcBOAJjJN3XQCr9hk4ApzI61gCT1HBCE+kYZWLITYJS40D+AkdOXrRIIB2bw8h50bH0NqybYrgkAHPAH+/pXBOIYn0NZkkarQ+qUJUOZnQtxElg/bQAoBzjimUCbQQeAetgmABR5xYeiO2yFdwJiM5MamwIIDgQ0sUXuhdSiTN2zh6sT0oMNAPxCQLDFnS0zdEceSRf+pCbAFvbPzGLAXfJg7YWyo30AcMY3sCKEFQPkj7Tb+kH+8DW0OfjuQH1RHvhy6ivgr9t3BhPKC1ujDjABgLrrtslggj3iIyyJCPlDGQQrW3wFPhyQOrC9wiaxTeoVACrlSh2yz1HnyAvlynu4Tv6oy25bZ9Bp82BXN1XXjlmhLvMuCDnKxU0uWgFwZzUUgCllYfsA6B+7o166bd8t2AQ+kfoBwQGAaYXnIaGxBQgdqx/yQ9nxDISkBXhZYcNqPtKKTq1/IA/4NogQygLSNjAPByNMSoDwxHewGs36DoTBPqs4aZ8pF/SNH7F2il3QxyJP9JkA2QOJAOKjvlBv8KfutvlfEfwE9YL6QbserDzcgp7pG2B7lC9tsS0DVrqQR/pjkBqsuAnXz6DvBjHmbhvCCffRn8M/QsJUR7RzP9tRojPs1BLK2Dm+k7aXtoE+HPn6vUL+WUVFuZM26jhlRPlStvggPllpY/0QuqqJ4Ifx9dgGdZ5+AO17KFvlOgASdkX/B3uD+KJsrU8kLZB1lBM+gnYwsO6jW3RDeinHmhBTViDs6UsxLqHddK8E8cQTT/5zQptP+8M4kjpO38kC0vgt/AVtM+2L9QHcD0ht2wKeob2x3/EF/vv9bWlh+Vblpb2gFU9GKL5PE+XW66W8Jn1+nfGfx1kHzZjB30cr/9ZB2ePra2u2Tz/H+ckGiAF75gMrH7Lm+7ToG58WmwCJwDVWMnCugz0Xgvsd4sJ8529WPrCaYu0y/2oKnste4CcenNUSbOdk3pcbY+6dX1sr72mluCYRSmzRU8k9uyq5U3dlNO6tnDp9lGnSmtSxhxLa91AKWybV7aPVrGjw9XWIiXxIC+fzEKX5+iipbzel3t5aGU81V/qw5lp5XRsl9unubDvFQdOBhMJBBbZfamx0aXQad3hjLX/W/J35uorL/bhAoSkTysISCoFlRTlTlrb/RXtCu2hxDvqtPAvOwzO0g/xt7w8l/zIBYcVes9dtcF+38ptrXP412D+ItypAOjjBXA8Mzu+m0/Lr7/7HnT/NZVZZOFsHVRSrTEUqrtin3YWbtXZbupLyl2lF6jwtj5unhbOmavIb7+qDfvfrlVMu0htHnazxfztHy2+/TZnDHlPa009pxaNDtKD/w1p816OKvm+44h8fpdS33lfGpLFKmfGJln87SlNfukdvXHG8Hjulj95/+A7lxs5XwfocJX3zucZcd5FeOO9IfTL4Ui34YpgyZ43R2qmfa9WYd5X25NOK6T9QC26/Q7NNJ3bRffcpcehQZQ9/VskPPKqfLrpKbx52goYfeqxGXXyVJjz3on786kt9/OkYjRg1XA+OeECPjnpYb094Q7MSZip/1yrtKd+nwspSk/dylVWwPVWxKsoKVFGy3/xd6JA25RAPJvBZYZTmD6bcqkI5ZITzfHnVNcrWlBsBHTvq/0d544hClbknnnjy5xPqKLOsGFwBqAH4hBPAUQb1AAKAX4ASduBIXAxQGGwAZAKoWKFBYqDPAIiBPEAejRirEhjgMBDkGv7DCisNmPkIcMmMVPegnwEkaWZQVN2ZFQgDNWaxAxADMNi4aDhZhcH7AckYaPE+AAgbSB+DLN7H35AsNs9W2BcdcB7wilnm1Q3A6chxnwVHWEpfnb8krbyb9AG8km7KI1ygU4Ce0SvPM6gEkHLPVLFCmhjsMpikbAFp3PlkqwLAU+wEIMTOcAgV6GCiB3ccAEoAecQDOVITAoLnKXMG/nSKbNmRLzszkbKtDjCHJGBwT1lC3lS3KoQBLwNsbJbtJexs2GDCbHbipl6wlVdNCQjKgBn+6APADyDFgpCQNWy1AmDALHR04NYt5cg7AasAo5gtHlimVugMUrbUPfQFwAFIhT27bZ138TugEKDSHyHoBuCGugHIS5lzjTJg9jPAMmVJp5d6zuxuwDzyC6DNHvn4FMA196xytkeCMAD8Y5Z9qLwj+B+2aQFEp+6wLZj1NdQ7iFB0YbfksGWA8J1n+B2CDmG2OukEBKLM3HUXvWGPpJlys5168gKRhT1BqNKhr05II0Aqts+MfXceWTEGiEq5sSLM5gc7pY5RxtgHQI67XrqDraPBfA/6p46SXmyC/ATaDPYOUMbvrGgJ9MUMQNABvhXg7GBW1ZAfCHFAX8qNMrOCPngf7w08VyiYEBdEO3UMmwP8tHnGpiCVAZzx8QR8RGDdwO/yPsB2wEa3zogf26B9QV/4R+unQgnlBPBPvNiFXV0TTih/QFfSCDGErVGGwcqWQJ0KbKsQCBdAPcgSVhliI+54sE3KjfJlBQHEQrA2jTxSd/ArobZhCSboDn/Fqkjyj38NRsihE9oi0gkITRoRSBfsjtURrMgMJuQRkgq7ZVKBBY4RbAm/AXhM/bV1B12xEgNbIO/YBb9xD3bDRAlsx/oH7A4gHBulTxJuP30r/I5PoH2hnaCMrFjfQX0BsLUDeJ6hfYMYYxUOdkj+3fZJoH7yLPdAnlOWbqHNoL8BqAsgTbvwrwr6YSUAbRj2jz8P54sRyhrihnRAStv2krjQL3XPzqqnX2LtMliwPiyYnQcT3mX7e2yJF46EQe9MPGClBvZAmdj7eR92QZsB0Ut7VBMCgnuwa8gm+lDW9vBDgPjERfmG8kO2/KlztE01EchQiELSCrlDexluhRb2Tf8PH0P94X28150OgrtfTD8mMP+MAfAfEMj0XcO9M1AgJKm3lBM+HoDME088+c8LfhCwmfaCvjqBtg/fbNtCfDDXbD/BgtYWpOY6fVnrA2jb+N35bprMcrFtz1wljvubVpzTUBkNujnnHfxm5j8kRP0+zrkIiQOaK29qXeUtraWYaT7FTPUfFg2RwPkO+eZvznuImuLfdmlDjP9wacgKVklsjv8HYQG5wDkRrJyAuOD7rmT/NVZYQExAcKyP9h8inT6vlqLfaqjlF7RTzOGdFHtFayXc11wJN7ZS4gmdtLJnNyWd0lFx5vuKa1sr7sROSmsfoez6kQ5BkdYqQimtI5TexoROPRR3ZGfFmOezfqyjTfG1tTGxtjK+rqf429ootXMP5bIahLy7dXEQIb8Vqx8ild6oq1Zc2EDxE883bfBCZ6o54i4rW9b4W8qZ77SxtHuUFd/5dJc1fT6+W/uwtlCdv/9dBMT/D0KjTgehlG2DWAUAI2GsvFIcqlyovUV7tKNgl3bs/UU7t2zT+vgUxX44XuNvGaDXTvib3j3pNM0ynZO8t1/X9h++1fbpP2rD+Ila8/YHynzqJS255yFNve1OzXj4AcW8P0q5kz5V6qujNOH8i/X04Ufqo/vuVX7MYhX/nK+cL7/S1+dfrk+PP1Vz7u+v7LHvmWvvKmrEEM257Q4tvOlOxd//iLJGvao1X4zV5qk/mPdN0/pxX2n5kGH65NwLNaz3YXriqOP04e13aMVX4/VzcoJWZ6YpIW6FFi6ZryXRS5Sel6Fte7brQHmRiipKVVhephL04OQalpKVIsbgHOagikj4lVAIHiAd+KyJ2Gc88cST/z+EAQODecBBBmXuWYLBBBDNAq3M8nVvZUTjw2xbBpUM/N2/4Y8ZjPAOBqoMRgCrABX4zv2B2w2MHj3aAScY1NrtnBAG+SzrZkDEvuDVATcMhpm1xWxJgET3THkaWgAEfmOQVV1gMAaQ6x7sEj+DO0AyQAq2fahuAE5e7Uw2Zs4D9lUnDLYpK3TCgPhgzhlA6CwCqDDohoQJ3AKGDgbgFoNFwGE3WEiHAmCBgSagKzPAf48AChE39gPoVBMQFqCO8gOkwyYsaEJ+AH2wXWaNhgP9sT8AL3QOWEQ+w22BY+0VgAxAEZLOdraCCWlhhQIDcvd+/NUJaWDrDgbx1A03KYKOmSGKXbFKIFBoa5k5ynOk0W5ZFEywN8CE2rVrB7XrwAD4Q9x/hAAkMMMbwIJZk3RKAV4AFSCzIAaoL9yHbTDj3QJ/zECmzkKMMKPX1is6vIDu+Abup067SYNAoTNNmQM6MgPYTY7iA6jT2DZ+BRDQXb/xN5Qp6Yc4AKzFHgD/Ac8CiRpAIUg8/CAEqwVlqF/4OXwNwHOosnIL9YOtf7B9Pt0grSV7IULcPg3AjO02sEVW/DAg+D1CedhtO2oSmOkaSOqRR3vuBW1D4LZH4YQysOQFwJk9/NraPYA3OiaPluQJJfgMu5IG38kB0Vbsagr8SLB8BYbA9gjh/cwKBgDmbBPI4XD2iLCCB53hz/HrNSknbIj2AvAZm8QWf4+wjYytk9h+sPaKe5iBjh1RV4P5NMoCewdkJKCX6lZ+IOiGlQTUR/RJXQ6WBsqGOobfovzwswD3AJMQr+5t0QKF9LKVD74VQtMCmPhxiE7aAchNJj64xy30S7AHdEPfAKAYcJV6xv3uA5YBUexEAlZ01eTgcWwFPUEmQBK421l0yXvo2+BjrE6oC7QBtM3BbDIwoC/6aYAAVoiDegPAjX8nPjf58XsF/4l+0AGEEGREdSQUbTFECPWRdsumg0/yjb+ABLcrzv5IYbIHq2fog7B6gn5VKMF3MxGGfAH401a5Z3UysQV98hukY7g+ghVshJn99J8pb3f7wIoHOwmgukB75SZlwwltLu0H9gO5xoqecML96AZ/FuzdgcFOvHETEPgBCCTsGT/H5Kaa+AYrpJEJSMTPOMEdtyeeePKfE9pH/Dz9dnw0/oE+FcH2c2iraJ/xj1zDF0I48J02kbrP74DZ9nfGvXxnsrh5iwoKNyk7+gGtuL+tEju1U26DCK1ybcNEyGvWWxnNeinx8C6Ke7iZ4r6poyU/+rTgG/+WSRAPnPnANkqZ831KneVT0gw/iZDIYdPfm/um+QkFiAoIiE2saDD3x0zxb9fEuRB70vxEBHHFmvg5EyJ7kYnPfF/+WV3Nua6VFp3bTiuHNlP21/W0anYd5Uyqp5UvNVbUoGZKeaWx8r+vp5zv6int9caKv6i9Ysx4J/74Tkq4up1irmqrqMtbK+be5op7trHivqzjbO20OcO8P9endSkm/WMaKum4TspoQL4jfzcJsapZH+U0jFBi1zaKfriDcuIf1/5C//iXsqBcKAt8LOVEm8g12nH6DXynLPmd7/Rh+N09HrP2gG1gK26yKZT8nyUgqDAYPYcmOwcnB3QKK4yxF5twoKJcBaZC7cjMVcb4yfrhnsF6+5Rz9PZxJ+vbK69S4vPPauv071WcFqvynBSVpSRo/9zZyhvzvhaazu9U02GYd+/dShnxjDIGP6WfTrtcbxx2ksYOvF+50YtUuDpXqz8bpxnnXKvJf/mboq6/UxlPDFfsoAc17fobNaPfPUp4ZpS2Tpqikph4leflqSw3S7uWLFLmRx9qphmofnrxxXrFdJheOfN0fXHXTZr/3svKXPCDNmbGaef61foFpmn/AZUYI4AwKDN5LSwtUSEHRLNywckvOvEHk20n1ISAsMETTzz5vyc0FADBDPgAQgMP5gwUBpcMYBiYMOBwAz9shWS3GGHmrB3wW2EwDKAEoMqsS2YRQyAwQAGAoXNjBZ8DsMRAGoDRgk/4cQbRrLBg9jOAJo1eOAFIY7YscfFeu00I7wBcZBUFA35mHgKAogd3YKAIaEk6GQwBGrgHoXSg2KaJwR0z1gGObacsmNBoM5AFfAGoBAgIBr4ECjM4LZhHmgIJm+oE8I+BL88D3AeWNQA+8QM4sT2HmxThWWb/ATIA/gDgVge0BBM6LYBBgIoANjXJAwNXAAAAA+zKljcDdrZGID+USTgShw4Ss6mxPUBvZkOHA/y4n8E9M6YBqgCMwuWX8maAD5jGYLsme93zDKuCAC8A08iDrQN0AiGysA8ADmZc0/ELFPIA8AkBYWd2B95Hp5Hr2Cc2R/kF2rgNzDambnNvsLh+jwAkQCIw8xJbJ810TAHhKQ8AJ+oTvzHDGLDT2iZ65DnAfmZt2npFHJBogDBsF+U+YDeYQBJAJgGUUAfcQDggLocHo0PSxHd3XNRviC/0CyALqIIfw454zr0yBn1RbugQQNa9ogVfy/34IdJckwNE8SWAZcTHFjmWgMA+2eoNf0SZ2e3BKGv8KvWF9GLzvwdkxB8BqGEv+HOIu0BbAQDHX9rzg8gv6bU2Q33BT5BXyvlgt1wj3fgK9OVePUHdII+QEqw6Q9/VgffM5kUnpBM9Wl9BGmlbqGP4Pcg8QMDAvBLsGUbUVTexhEAUUR74KLZNA7wP5y+wd2ag0+7QnuLjqutnE58lUfEzALfhSNRQgj1Sr9AdvieU/tAzdQ4fxPtos7gWKNgeNogfRrc1KWPIc0ssQHJhJ8Hyj6+njwAoy2o0tqihLmKT+FmIHnc5uIVzWljhQLlCXtrBMIQF9Zyy5GypwK1dqKfkFd3QRrHCg3zR/pMGN3GIrVPHyLut79UJdgyhCIlE++VuA6lztLEQBNi4rUvYF76DdhM7xsaof4E2ytY65Jn7+NtNypMv294A7mNzNel3VCf08yBmsRFsE72Hs32AJyYUUI8g2AH4bT7RLf6ZeoTusa3q6sXBCgQStoNPgvgKZT8IeWPlHenBD0OIWH+OkD7Kg7xAcKPjcEL9wQ+iK8qJMiY+8s9qYnwatgRJGswPUeZMJKBPgu/g8O6alCH+Br1iF/g4+r2hBH1jk+iflUfkGz8faG98pw7TDhIvenLXfQAoxgjUVYh96rgt55oIK0po39E9fuiPtgNPPPGkZkLdoz/G+IQxPz4cUJr22fpD/BDfGePh5+ij0nfmGr9xH88SB8/znd/xsXxHyitLTZ9mouI+OVEr/tZIGQ07aVX9vv84jNqEPLZkqtNHqc16Keralor6oraWT/Npyfd+siF/kU9ZVQdHb4rzr4rg8GlICA6sXvadn2jgntVLTeDMiPk+LTfPs2VT0nT/FkysmFi73Pxm7uO59LkmbnM9i/g+q6d5t7ZQ1APNlTerjjZn+rQN0iDZ3De/lhJ+qK38pbW0LcunrTkmnuhaih/VSEtvb6mkZ5sq68uGShvbQPEf1lfM17WVOq+WMky8GSbtP6/waWeKTzvW+bRqVm2tPLedUlkB0fTgCQhWj6C7/Lp9ldakk1ac10jxX55u+hM/qKzS35fbv7/A8dWUDf6ZsqCMaMtox2kfKUN+p8woW8rYlivCNb5TnjzPvf/TBIQVmiwnBLRdfC+qLNPWfTuVlZWs6Cnfa8Err+nHuwfqm6uu0w/XXq85d9+pmJFPKnfiR9oeP1cHNqSo9JdVKt6cqR0rFynz8zFaeP8A/fD3yzXt0qu04MLrNPmoczT6qNM0YdAg5UTNV0FehtZ8Ok5zzr9e3x96mmaefpFmX3ylpl50qabcdKN55wvKnPuTdq/JUOmOdSrasko7k6OVP2mcEkY9p6VDHtGihwdr7gMD9NOAO/X9oDs06YkBmvzaE5o3/n2lxyzR7q3bqhgGE8orVVZapiJjEMUlnN3gJyCsDhw9VAWPgPDEk/9toVMB8MkAH3At2GGOCD6AwSHbywDiAW4xe8v6BjobgDyA+ACGDKQDB0Y0ZoC6DNi4j9mF1157rXM/KyJsRwahAWN2I+li+xZ7zgNxMshnFr6d+RwMFEFIG0Aj5IYFBAEPLdjCoIz3AiwAfJJmuy2COwBIAlIxY5GBJgMv9+GP7pUDzE4FJAnlM2ngGQAzkxI9MsisyWx54mPGLGAeAzoGdnQCDkZIJ4NE8oBOA8F/BoiAiQw6AVjtYJp3Axgx6GTgzEAW4CtUHsMJukdXAKfYULhZmJQ1pAvAC3ZA3iGfbHkDygDgAORwT6gZ5dgVJJQ9/wDb43u49PNuAG4GvwBw2HZ1wjYl2CT6ZbYuNuK2abdge5Qn4Buz2CHUANNs3hjIU8aA4gAG5DvU4B1wnQE+4CrvDdwqCpsGxLPlTlyBNm4DK3mYWQ44xyzh6gCV6oT8UF8BO6mzgApcwxcwqxEQiJmWpBGQD1DGAp3oDvvATpjJjH4ssEWnmFm3gDXYLNuwhAK9GOCwVzpgBjpwb9eEDTAjFd9H/QUYC5wRS7zUDcoI3wVhC1GH3yDt7k429g0Zib+BjHRvK8cn6QB0hTzF92AHwYT8Yz+A2pQrAC+zbW26GSDgawChmK1tQVR8AoQOaWNbLvyjfeZgBN8ASQl4S/z4rGD2wnvRJ+VGWQJw2sEkeQBgo05A5LFFUTiwL1CwY4Ba8k+7Y+s3/gLdAaRCCgDKhyp7rjOj3Z53gK24CWL0CNGNX6O8INjRe7C8okvAP3QSSHjipyDOsCHsmMFXKEE/EAB29QMrpwLrbDChHEkfz5F3gG/ayYMVnqGOARxSNsQZykZY0UIbhZ1BeqPLQL9JW8DWarRn+Fb0FMqnYxPcTxvA6hXqJH4uFHmM/6FO4gcBOyFi2V7M+jr3iqBAIR3MoCaf+BH6KKSdPg5tAXGynSQDZ7dwD4Qmfpd+AeXDxAXaAfosgXkDQIcgxY9TX0Ot6sMW8UWAxtgJZUjdsfHhOxiQ49NoF+hzWF2Tb1bW0PajD0iMYDZKP4n0olficK/WIF34H95NewEBGqreHIzwXtpf4g2Xf4Q8cjYY9RB74Tm7ioe8AuhDrgCw0wcJV76/VyBIsHvega8GNAkm1AlIGkgBypb+X6Cd4iuwE1bZ4KMDCQq3YMv8zv3UJ/JuiXbihcSBfOJ3+tah/BC2AEGBH2JSSDhfY4V76L/R9tB/DedvKCNWJ0GC0W5D0gTrFxPoexAfaYGkcG9zxjMQfPhWiLtAYj+cYJe0JZQRBC368MQTT/57YoFoAn/Td2WcYv0d1/jO77Tz1HX6xvg2C2bT1tnv9hm+02+1vuGX/blKX/GAlj/SQoldWyqnTm/lN+vzW2CdMxaa91LMbS2UMLmWkhb5FDfDp/yFPq2P8unn5T5tivWvboCAgHzIMfdASiTN9CnhJ59SZplg/oZwWDHFpwUT/ds1cVA1pEP2Av95EDzLuRFsx7SF7Z3ifVo1p7bix9RTyvi62rzSpx2sWkg37za/55p350Wb9yf7r+3MNM+lmnin1VbCN3W0ZkltbUmq5YTVK2opzaSL+9ea+HPNe3KXmnclmWdWmTR8W1cJp7VXGisgDpaA4NwH84nusuv0UnxEK0U92VoZCY9pT4G/L02ZUF70S2yZ0T/kO2XHd8qZ7/Rb+W7tgLK2/UY++U750n647SSc/J8nINyC8ggo3fylwvJCrV6XrblTv9bEV0bqh+FPaPGI4Up6+UXlvf+2Vn0xWrkT31fGjx8rfclEZabOVPbqJUrNX6T4xJ+06Lsx+vHpwfrixiv12cUXaOLfLtDnh5+st486WV8/MFB5S2frQHaq1nw6VtMuuFafH3qSvjjlb/r8wvP0yVUX6bPBt2riFyM1Y/lYRefONPHOU8rKHxQ37WMlfPqK0t9/WWs+G61NE7/Spq8naNXYz7Ty/Xc07+WRmjDiUX3+3DBNHz9WazKzVFZojKe0QhUl5Spn5YNxCgRnBQh5d/LvDx4B4YknniB0HpgdCDALSOQeELuFwQMzNhmUMNsJ4sANnNPo2AP5APoBWIL5DQb/gEoAZIA5AIsQEMy2tsJzDF4YMAEAM4ixqxZoHAEeARVYuRBuxQaNJuAS+WIQBGBhB7sIgBaDXfLDu8LNJqURBqwAOGSWn52ZRwAMAJwBtOUegI5QwoCNdzHQZGDFPu4WsAsngM8WtArUV02FDgErCBjUAU4y484KZc6sXvJAcM925d0MnNE3v3Hf7xXiAohkYAtxwGCbAXWgcB8z5yFMADYpP/ZHdoO9AAfMkMZ2ATSIJ9jgH7KBwT75BvSCQAkEEgIFe4a4AngA+HFv2RJKAOcYaGNPAF+AbMFmuWOXzDoG9AaEARTnXsAWW2ewTcAc9M3AHhsLVp8Q9EDdBJSz+7C77wVgpF4CbLnPPwkmAM/UT95LmqrTU3XCwMLWVwgk7N+mjZmgzICFiADooVwglOw2cNgrAD/AH9fd2/vQh2ObJvwDYBv3oddAAWAGkMfe0DWgnPsgZOwM8gLwCAANuw/WaQawsau1AKoJ+AJmY7ttjjIEnKZ+41sCz3YBrGS2PXbFOyFkSYNbuJ/6RjzUdbuVk/XL/M4MVlabkXfus4AS7wcAx9ZZtYXO3O+viaBbVgiRVwBPbDUUqIaQRwhV9EeZUm4IeqQ9AWjFbx3MAdToBDuws30pXwtGUs7YDAAy5AgDn1ACiAeRTT4AiQG7sQkr7KsPsQQgyIqCcKQu74cIIT34HdsmkVbyhn/kHYDd4QQwjVVIkFT4P84cCFcnreD77Ax2iDDqeaDt1ETIB3rAfkkzdZIyDya8E8CcPFOHICgD08o9gJQQhfh07BLSMZBcs3rCXulH4LdtfQxlX7SN+H38BKuo2FaI9/A3ZGao/GN76MqSLLQN3Es+AfZ5L/YDiROsvkPWs0qC57EPAF/uZ8AcqCtsCFIEv4+O8DfBiCF8K6vVaKvIO/0a90osgHtsEN+BD7aTQWiH8Y2AvPiM6toi/CJ9HtoC+gy2vKgL5Il2ALKsJsB1dYJvoZ6Sf+sPwwnkA37JEseUiwUx0Cu+mLKhvgKC/zuEtpQ2HR+Mj7btjVuwRyYd0EZzH36Ycg0k6vA9kAD4PuozYLydLOMWfCI+lXKlHLFJ7N6WDaQI+oAkdU/+CCaW8LPAPkRAdUI/GbKWtgSiI5zPxA7pc9Be0s8PFz/1E5umj4YvIR+2vaHfRbtNG807qwOj3EKfhr4q/RD6DUzW8MQTT/57gn+mXtJ/YHyEj6Iv5gah8XP0oezYkb4B/sSSvPgAnuc7fgI/u934ou2mLbLxlJQXad3GbxU7/iRFX9pMaa06K69eH+W1cK2CqNtHGa0iFNevldKm11Z2rE+JM/2rGtZF+ckCtleCiOBazgJzzdyzNdG/RRMERNyPJkz1KfYHn5Z/518ZkTrXvyICwiF3kU/x5j7uJb6dK33OwdWcDbHFxM15Edkmrm1JPudw6u0JPq1f4ScR1pjPLeZdO831XSZAWmQtNcGkbUuGuZZpQpa5nuJTnrm+iq2XTPpY/ZBmvueY+3Pn11bSE82U0qershqYfDd3kQs1CKwUyWtudFa/j9LadFD01S0U/90Z2rDtJ5VVmHbH6J/yoB9AuVm/TflRRrY8mJBFGVr/zSf3E+w92AO2QHkTeJ7+X3X90/+zBATKtMEKFQiFYPSVleUqLdmnjfmpWjplvH5692UtHv26sid8rs0zv9fO5TO1NW6GspdP0uJZY/Tt5Ff0xfej9NmPr+ujH9/QmEmvaPRnT+u91wZr9PB79Nljd+nrO2/TR6efq5eOPlFf9r9H+QtnqjArVTmffKaJF16lt48/VR9cd5U+e+QufTDiHr3xan+9PHawXp3yuN6Z/pTG/PCURn/5sMa801/fvfuw4se9qp+nj9fWBdNMmKMtpkO0YfpM5Xw7Wcs//EQ/vf2e5k/4RmvTs1S6v0iVxWWqIJSWO/lkXzUnz1X5/1VQiQluHVUXPPHEk/+bwsCIARSzuOjsA4oz4xdggkDnH2AJcIWBM2AmIIt7prAFKhg4MtMZAC2Y0NixVQ33MbgAXARMYFaqFQZlgM8M+rmPWXt2Vh0NGzP8GEhBXgDEM+ixabWBWbGArQAI5IsBMnHajhHvAPQEzGDgSJrsb8HEAiGQK4BGxIVfxL8yoxxggIElA3y+B6aHNJJHZk4zyCTvkCOslqiJ4M8BAhkIM9hj0EceA9/jDpQhRAngJPklf+SBgSt5Bgiy5YwNUPaUL3pn5qT1+7wbXQEiAhzwHOUb+D53IF6AEvLnJliIE6CeWeSUIaANs1GZ3e4uR0A6Zt4CsAIA8HfgQJj82H3XARAhdgA03OkA0OBdgDrkDeAY4I4OUzihEwZwyWoQBtF2hnk4oVNN3QFg5l3UF2wVgNHmDdCB2dvoktmIkA/YpnvrGgSQBDCDwTugFJ29cMIWUdRhdMoMWdsxpBMIQAIwCCBltzILJdgKNgzYBkBm7RM7B7QAVABwph5zrTqhzADP0D+grQXKeRZigrqEPQEoQxIBZNq8onO7FztkTCBgRl7QI7pmmwjOKHH7Lf5G1/gjWx7UczepQr2w2/ngK/g7WL7wb/YQT+oAfou6iN5tuWHb6AdbpY6RHwtSW+E7BAF5wvYBogEJ3XWZusbqA0Bf67vcZC9lS30BsCJPdOItoARxZc8IoD4EI2WqE3wtNoB9Uj6hVsVZAdiknLA/SCsLqlLvAbrRBTPJKdtgvpqAv8FX2bLnWcoCkhbAnbK1g1h0aA/jRTfoIlicBDurGDAN+yMvtnx5B/HyO+2AuyyDCe0dBDNlDzBHWSP4Idoh8kiZ0V6Rn8C0kHfKFgAW3dKWANi6CZFwwoCfuk16AVDR1+8R6iRkPPGgk3DEO4JvggBAh9RDWw5W0Bk+AVCbto0AIUV9cddH7BzbxKdRH2n3sd1wQDiDXewAW+c56hyfAK/hzn7ChiGQ8WO0a7RX1E/qO4QsZUXdCUYAItgGbSL38T7IOO4PRi5R97Aj0ka+eIZ21l3ukP34YWzZ5h0w3rax2CT2BPBLfYHoopy4DtnIhAHsnTYpnL2QF9ob/CHpoD2ywAFkJG0Z5QNJFNjmugPlRhvkbruDCe+jXAHUsSfqP21csDjJLyvwsH3qG6sP6M9ZIa8QV5BrtPvU3WD1yB1IJ/UAv1ddm26Fd9qzo6ivlAury9zxkifICfwoPph+G0RTYNuAL6YvyHZFlCvtL+21O93oGCKW1UG8E5uEULW6Jd20hdgZ9oG9hxN8JD6GfmAgMR9MSDN9eMoI31XdyjuIFyZQkB57ZlMowbZYOQzxBlHHs7Y+8U62PqWPA3GIntw6toEyJODXbR+cv1m1RvnQjgUjdTzxxJP/rDAJBnKevggkO77Uti/gqvQN3MA0Po57bJ+BexzA27SZpSVsGV+h/eaeneb3/VXxIAVlm5SVN0pR7/ZV3Kmtldmwp3OIsrMCAGC9YR9lNuut+HM6KO2jhsqM8il2gU8rF/qUt4Itj3zKX+5TGmdBLPFpfaxPO1mRkFRFLEz1KXmG/1wIAqseWBmxaqlP21b6V05AJnBmBEQFWzFBQEAo/JLi03bzmWXiSZvnJw22JfiJCUgODrpOm+MnMjjkemu8T2tMvJAbbN+0zdz3S5q5P9VPTJAeCA+2i1q9qJYSxtdV4gcNlDKkuVae3lFZrXspr/Fvz8GoLkA+5Lcw+moQqYwmEYo9q6VWfHSkcle9pYJyf/+Bnsc+0/ag+4KqtqjM9I8ggygjygqh38uYyU020Oeh/O09tpytXWAjNWmP/3cJiHJj/Af2aP+abP28bJ7Sp36jlCnjlTnja2XP/1bJi7/WooWf65uf3tBrYx/XY2/dpQdeu12PvjtQIz4aopfGPq03vnpOoye+oLHfvqbpk0dr6adva5IZtI+68CJ98tD9xthma192mpK/+FyfX3+zRl97jb59+SnNmvKhJs8YrU+njtK7U57R65OH6vnxD+qJ9+/QAy9epfuevFjDnr1OH7wzSJPHPqe5E9/WkgkfKG78p0qd+JWyJn2rnO+mKHvKNOUvXq5dazaofH+xKov8BERlabkqIR9MXsnzP9EHXDDBraPqgieeePJ/UwC37AxxBgsAdnaWL4GBhZ2xCHAOMGkHx1bodABqMLgFwA61rRC+F7CNQSbxWbCCwZ0VBjwM9BnQM/B3z3xnJpcFcBikMqhjxpw7vQQGPswChBQAeAW8t7PKaAMYXAOYMCAEoGDAGDi4dAvABSATcQIwM1AmHq4zyAe8BFAEVIKMCEwT30krOibdgJTk2Q7WqhM6eQAqlA9ABPoDHHS/I1gAoEN/dmYvg0L2f0b36Nfex+CUuClfQEM3KMSgEIAFgBEygMEmzwTTuzuwzQOzBi3obIWODMQA6af8AXQBTNzxAbAxAKZ8uA5AgK7dQrtEuQEUUM7olby50wBJxaAbeyG/EGmAsuHaNH5jtiogDYACMxItARZOsB+AEMABABZ0BUjgtlHqEsAQtgJgQ/kASgbOmEU/gOvkn62QqrMT6hSHegKWAM6y0gc9Q7ZQtugHoN894zaYUO6ASJQJIKvdK5oOJjOO0QmzOAETAssjmEBCUb+xWeK1nVh0RR3HRkgvtgDoTb209RDQELtAj8EOyqWTC4lH3cOO0Ku77AkAp5BI2BJgDfG7dUknmbghsXg+FHGKTbC9BIQBdcfujU05WVsiXsqS64CI7tUAVsgDAB2zRVmxQp3jfnddxoaxDfsOyDh33gGPAK6ZcYy/AUS1g0BATGyMNDJLtqagnBX8rBt4xZarA8gpB9oPbIataiAYEXwOQDE2jH6x51A+gzRTj9ENgt4gF/GXkBDYsbU3QCt0hK1Tv7D7wHjtd9oP6jDtAXq0+sCn8S5WswEysoKNNiucX0A3rETBDxIfRDNC3cCGrL+CpOL9wdKEX6NsIdYBkwNJ1XCC37IrrNBXTUjRYMKMb9o80opvq64eY/cWYGUWNSROoD9CNwD7xGvbKHc/grzbemF1xOATP2UHscGE3yBA6FPgw0kDIK17hV4wsWA76QBstkQgZUWbRFmRBsowWJlzjb4G9sE7STP2yzZ7gYK/wuYhcyhb7qd9tuXPp22HKDv8FfXXTeRQBvgOax8Av9RzyCF8HPWHfgcrqMLlm7TQJmIfvI9JGLbfAwlCXwg9Um+4J9BGbaAPA5Ae2HYHCmkBPKdc8VdMTiHOwHj5DolCGw0AD7gcWN/QAWXDPcSF77bPuuNyB9LJ1lzoEz9UE8FXslqX/FOuEEsQXPY9fGKr+A18A3rHJ2I7gUL60S86oH9BuvHL7j4gn7Ydom4Axtu6i/5oc6g3tGHYkHsbo2ACCAiRjh6pFzxv28xgQvpoa8kn5QPRGiwvxEH7aLerI276i+Hipn7SLyB/tBnEbeszOrYrpqmzwfrFNtD+4e9tPxXfjI+l3wJBVNOy9cQTT/59Qv8JMJrxCoHxAm0/fpDA3/RTDphPBP+2ffuOXwlPfMk+4792/vKLCoo4hdf0m03Yae7fsW+v4zsqysqdbeTX71iuqDl/15IHW2tl33bKqddbeY36KB+AvXlv5TTpreSuPZR8e2slflFPy6bXVvw8n7KW+5SzwqfURT7FzTKfC2tpQ9Vh0+vM9WRzjTMd1pj7WCUBacDfEBEQEKxygKhYH+3fogkCgt84qJpDqTmgeku8n3xgBUW6+YSscEgL80z6bJ9i2cqpitBgxUXGHP+9vJuzJbZzxkOyTz9H+ckKtoZak2Ce+b6OogY0V9yZHZR6SDdltI1QbrNI5bOSIYBkCBcgavIb9lFOg15KPLK9Fj/eWjELr9PGHbGmna0wOi5TsWlvt5ty+cW0BXhsyqLAtI07jA+mjCgrzhTebcp5h+mP234i7YlTxuY5p9zNfbRJ2AI2AWHB3+H6KVb+5wgIDNxpIMtKVLl7pwqy0rV+4WwlffeVFn7xnmaMfUOTv3xZH3zylIa/O1ADXr1NN710vW4cdaMGvNNfI8eN0CfTRmvykvGaGT9Zc1OmKSp3gbLXRmtD2nLFTxyr8c88pW/ee01piUu1ZXWmEn/6Xj+MfFbT3nhZK5dMVd76eKVtXKHo3LlaljxNC2Ina/L8L/T+d69qxEeP6b5X7lC/Z67RbU9drvuevkrDnrtVb7zYX5+9+IAmPf+Qpr/0pKLeeVlp475Q/rz52pqVr+Kd+1VZWOasgqgsKVelqcBUZPJstFClgSrhqwluHVUXPPHEk/+bwoAMABMwAsCGAXSwwKCMwUAw8JFZsIBq3AeQBBAbSujAAA5wL+AiW5vwvBUG5mwLZWfK8T7rgxhsMdhxpytUAExnxiXkg3u2JPEDJDHQZQAK4B5uSboVwAcGUsRrARA6ZCwVJx/B0hAYABiY2QegfjDgIDoDqA0WZ7jAAJrteSyhwCwFBq+AE4H3AiCy5RHnPbgBJjqPgBGB99ckAIK6y9YK+qZcsBXeG+xZdA145D63I1DoDKFLgE9AmmDxENjKhdnLALTVtWf0DyhrgE/AIGZq2oFxdUJ7y2w9nmFgHSwtBAAq9hMHFLVb67gF0giAGpA12KzbQLEHqzLYZ9DPNleACeiF9wE8MDsxEMQPFAYQgM7YMwANMxMRygvbIC5AYeKyQEM44T5ActIFIG+FMgC4AGQgvegDsIz3WwH0Qf/ogNnz6NYtvB+gkfrLO9z6dQd+QzcAfBaotwLQbXUEURRuNin1gBUt5IX7sV3qirUn/AHpRD+km/QH0xH+B9KS+gxw506rDfg9Zn4yizzQPigL/DD3MZPavYUIeQQA4zcIy+rAZbegX0BBCCaeB6ysCdFE3UAv+GvIYTszn3ofrg4EBuo7s7cRACd8B9cBB7FlhDRCuEACBD4fLGBbAP084/bxEIoQYvhHyos65ra9YEJZsq0P/or6hP0ilCdtWLD3BwuA+KxkgEipjlh0C2WDLogDIrC6lQuhhFVi5Jl4SEd1AgGFLQFKYq+0H27w3AptDAA59ckC8YEBEJaVXRDaNSFfqFvUSezKxkHeq9uGiH6CXR0F8WpBeOo7ZBnX6c8E2yLPCvWdZ+kj2PeGWnWCX6UdYnJGKF+ETsgHbYN7FRaCX8J30LegX8JkB/IOqcOkB56HfIJArq79ov2h3mHbtDG27cKXAOgGpitUCDzEOpigI9su1CQANNMOUD6BAAU2xcqPYM+FC7RVpCFcnzNQ0D/6gLwIFifBkvBs01XdSlXqJvkif7RXweKj7pI/26Yi1GH6VuQBn0a7XRM/RP+T/g594VBbT1qBROId2DE2DxEV7H7AI4gcfAPpod8YSKAHE+zebnPKKmjKFT8NiRZKF8ECbbT10fhWCBPaFOI8mL6yJ5548u8R6jbtCSAzvp9PgvXltGObTd/Ktrf0b3b9slt7zHfbapWYv3YVFWqXeabEtGWlxeYZ067lpaVqY1q6tq5M1rbFK7T66wmKffNKLX6+jaJvbKzkLt2VU7eP8hv1UV7r3spt1luZjXor9ZCuir2utZY/3lQxoxopZVxdZcyrpeRptRQzpr5i3mmg5G/rKGO+T5kL/ec6ECAdIBIgIFiFsHK6f1slDqCGNOAcCALkA0QExAKHVeeYOLLMJ6smOEeC351VD+YTMsFZUWGup5u/ObiaMyS4L83c71w31zKW+ldqZJr3Ogdcm+ezEnyK/byelp/WXkkNeim3Vh/lOqs+TAhCMoQLrBDJNrpK6tFVK/o11pIX2yruzRu0dtLX2rYk2tHxutR0o/M0bTN97bKSYqdcdprPXaYMbY+fLfx/MeUMCcHfyB7TTm/a/I8tmkrM564qO6ANoc3g73BtkpU/FQFBx8odaMQI9nug2HuC/W6vuQOVgcEUn5VG0QfWr1P+3FmaN/odTXxumD5+5mGNfvEhvfjS/Ro4/CZdO/QKXfnMNbrlnXv0+NdP6/35H2tm6gylrI/X+l052rJ/jTYV/qytJZu0v2ybSvZv1o7sVCUtmqvo5fOVvTZD67esVvbKGKXMnqH8mKX6ZfsqFZRv096KrdpduFl7d2/R7u2btHHDKqXkJmhmwix9NOdTDflymG56+RZd+cRFuvGxC3T/0L9r5LBr9daQ6zTmwas19sEb9d1TgzTtnTcVNXWGNmSvUule00gXm7xBQhSXOlsxVZSjn98O3I0qqs5+8OvXrUOCvRZKt5544sn/LcEnMlBhIMdMLoAbGwCGmAXGoAdgKBiIyYxxSAXuB2CHIQ8ldFwY1AFwMSBiSbgbHKIRA+Rgpj0zxN0ANoAYYHJgGt2B9LKEnMEesxgtU28FEJ7BFXEwI8s9izmcAD4AIJBm9lmm00XcDLQYgPHeYOkh8BvkA6A7ea0OCA4UAGZmpoV7R2DgXmZeMtBGpwg+ncE3IEzgvazKYMZ7IChGZwIAKpzOAwPxAQABKoeyBdLEDDsAKcrLnTeAVYBwgMdA0DhQ6OgAugAWBEsjM6RZsYLea9Ip4n0M6iHUABTYEqE6UMAt6A+dMRuQfASWGd+xGTpqoQbW2AngAjq0oGw4ocMPUcMsQ8B8ZhMCDABiM+MWULAmqzhIO+9m9jJANMQkAggJiEHaAW1qOnObGcaQDPgPwBW3sDUFM8/RETM/A/fiBsCHBKK+MQMe2w0U0ku5QgICCrt1zd/EzXYXpDeYHWGbbBHFvdSvcEATz7t1DPHhXlFC35I8UmYAgFZ3wQQfCABNvgNtn3ywTRM2HWymKvmFTONeytcC0fgw7JaZxqRh4sSJ/1SXwwl1g/pI+UKAAAjVxGawYWYAoxNWldmtiQDlIGmq8xvkHV/PzGC74sYSBIC5XLcgKjqmDMijW2eBgd/QI0Q27VpgPWMGMgQHIBdtTHXbmFiBmMSfMGMZm0So62xNVJN8Yhc8R/kfDDmEoFfKhnwBdtaUFA0USE9mK6Nb6lh1gt2zXQ+rf3iGcgllF7RrlDt2GUwftJ/oGn8VrD4HE4gNJkfwPH6EvkMwAsQt1C3eRd2CzLVCXGzJR1lQ94KR41bIN4QKbQB+BFsKB3KTd1ZC0LegP2DzzLvQG3WDbeOClRvvwnewsgd/abc9Y+se6garNchHTXRGX4E6Q33ETrBPhPgpd5uucIFVc4AD1a1+og1j+7ya2D51lnaYsg8kHxDKBsKnurjcwcYb2IesiUDs0vcL5ktIAzZMG0U/pTq94zvpV9Hms3LAHR9xcY2timgv3PWefjNlxcQfCB/qTk0Eopm+HX4InxSuX8MqI+oPNkS/L9TKKfrF2Dj9Bch46nxNBL8EOYftYqPUA/RFH57659ZrqMBkB/odlmy3WwzSD2HrLk888eS/L/Qn8d/4avwi9ZU+dEFV/6oEP2jam92mPWNEjVfaYdrqbbvMWMdcKzV+v8A8s9H4wZ+NH9qenqEdCxcp/8txSnj1TUU//bwSH35C6Tffo/QzLlfyyccr5t52WvZkQ624rK1SO0c4ZxrkNfED87lNeyuLlRDteio+sqtiTuqoxLtaKu31Rkp7qbESbmqjJZe10Tzz/OLvayl5qU/ZS3xKnudTwhyfsyVSnvkOQcBZDxkQDgt8iuFsiB99yl3o01pWKZjry6b4tPR7/4HVKyb7yQbOmFht4oRkmD/RpyXf+skMDsBmpQOERfw0P2FhV1rETK6luR/X1vJvaynFxJ9kQtoyn1LNb7GvNVLcYV2UUauPVjcw+WxWte1UEJLhnwJbU5l789iuyTyb0q2Hoq5sreXDGir2zg5KPvEkpZ91hdJuuVcJDz9pdP2CEl5/U2u+mqBfli7V9oxMrTVlssmMJw6YMiotNWVVVKitpo3ftXfPr2cJ/2LGwltNmZZVtYls37Rt+zbHFuiXYRs17d/9aQgIBk8kmGD/plEl2GtusfdQIQJ/5+9ggXstAVFaeEDrUpM18+MPNGboI3r/ycH6ZNQwjXnzKT394iD1H36b+r8yQMMnPK8xS8dpet5CrdyRpvWFG7SvfJepWAUmFKpIB0woNIVTbGqn+TSVcu+2rdq6fZO27N2u7Xt3aceWzdqzfp2Kd2xTRel+VZhnyk1QpRkQl5nOSImppqZiFhWbil2wWRnbMjQrc47GzPtQT30+VANf6qf7h1+vZ1+8Sx+8OVifv2LCyPv18fBBGj1siL547S3FzVusgq2mY1tk4oKAKHITEEY3RkfoyQmVJnDdhF+3aarSkdWpW6/O85544sn/eQEAYqAKyGMDgyoGPAxQQgkDUQBP7mdWYbgZS/h0AEHiJDAgcg9I+RvwjbjYfsGCcPghwDaeCUyjO5BeZhACXgfzXTSObFMAMM9Ap6YDV5tHZiVCbNj2hPza9wamxQbAQAaKBztItkJnD/Ai3DsCA/eSP0CTwAEqAEfgvcwqDQaKUZaAw4BV7mfCBfIL0IWewpEt/MZ7KS933ni2piA3QrqZWRjMLigzS8DURNAVwBRAIfoD0AnUX02Ezhi2gi7c6eF7dbM1AbK4l72oa7L9ALbIfZAVxA9wQh74zmx7vtc0D2xXwgxE9GbJI2wA/RI3JGAwACmYkCbqK/EFlid1gbiIE8CQeukWtqLALrCF6mb+EjdgoduGiDfYe90CscR2DzxHGgJXG7iF/hD+B70QL/7FTRDwO76M37Cd6uo65cE2bIG2T5mHAokQwErqL8/gE2z94v2UOSAfOsduD6bvhg3xDO/HZiBca1LOvBcgDf1Tnha0JP+sgAnnqwnkgzSTJ2sDlAs+x5YLaUP4tDqmfIPFR7BlH6qe4ctpWwC9mBFcU4LR2jPBxk150J7UJJ+8K9DOayoM7PBHEKIAlTWtg4ECycaKEOIBnKxOKF/eTdppAyCpIFBCCXaNvwmmD549WCGftr3Cn1Y3Gx0BDEZX5NNNMlDO1o9RZuHKAluDaMGGsSWIk2CEYKBY+7R5dtt3KB9s7Zr7SLclWAB3qYuUVXVthhXSSB6pj/RNsE+EthhfY9MVLpAG9FadjfEuiNaa2D56tGRIMKFsqOvVxeUOlCN1sSZpDSY8Q15Jnzte7BwbxvYPRiCXIDXcvom4qDv4HLfgm/GVtCeQE/jOmtgXQntIu0g7U52fp++DPVAXKKtQ76DtQ/+khbip8zURyhRfis3Tb8GWSQ+rAwP1GirwPPmwfp6/qevEGbhayBNPPPnvCPWa9gQsYJfxZwfMuACAeo/x3RWVFQ4ovb3wgLbs26t95lrBL7u0MSdbeckrtS4tVZsSV+rn2XOVMuYjxT/1jNL6P6Ssy65X5innKPGoU7SozzGK7n6U0tr2UWbD7spihcOR3RV9Twste6qJ4q5pq7SuPZVTL1L5jfson4OZG0Uqu56531xLb9pLaRHdlHZSZ2Wc0FmZXXoqvnN3Lb62pZZOqKOV0T5lxfqcrZrmf19LsbNqKT/Kp/xlPq0yn2tifEpb5NPyqT7FTfMTCPzGORLLzPdoEzgrgm2ZWOHA1ktrzO+snlj4tXlusrnf3MsWTr8k+wkHyIvVJu6dGT5tTfUpcUJdzby3qRY91chZqZEb71NOTC2lTKqr+NtaK6WjyV99k7eDWfkA8cC2S436OM+m9uih6BtbOzqLub2l0g7pruyGrBjprpR2kVrR4ygtPuRYrTz6FGWfeq5yr7hJafc9orgRzyjlo4+1bu4CbTZ9j59NmeWZz035uSo0fZK9pkw3792jnUWFzooI2sc9pj3ZvsvYgrlGnx9/Tbtak7HHf5WAIIHuQONjGy8+ARUsYeC+h0wT+JsOnb3Gp/t3gn3OPmvvLzAVJCMxVlO++ERfvvOKpk/8VMvmTtH8ed9r4vef6ONJo/XNwq+1NH+Fsveu0dbyXdqrAodyKFWxykzgX6ETSlRaUarKItMBKig1IxL2MCtVkQmFpiBKD5jr+01giyTyU2meN6G8vNh8h4QoND1QBpEEYturX0q2aPWObEVlzNc3s7/QR1+/pYk/fKQFS743HefpWrpwqub8aBrvjz/ShPc+VMzM+dq7yQz8Cs37WQXhEBBsw2R0gG5Mvsm7k/8KoyOjg0p+Y5sm4zjQj1unBLf+PPHEE0888cQTTzzxxBNPPPHEE0888cST/w0BI9y2fbu2btumvYDPe/Zo89at2rVhvfZmZ2tTdIzSZs5S5rdTtO6zscp9+TUlPv2MVj71jDIfeVLpt9yrmNPP1+KII7WiZU+trN1WOb7mSve1VJSvhRJ8bZRTp4NWNeii/PoRymkQqeRjuyh6cHMtH9ZUsVe3U1rP7spp1Ft59SOdVQL5LXprVdNIrWoYqdy6kcqsE6ksE/Jr9TX3medP6KyEZ5oo/pu6SpxWW1Gf19PsFxoq+ou6Whvr09ZMn7aZsHZJLSV+XVcx39RR5hKfcsxvnCmRPt+n6Em1lTy9ltZxWLS5xlZM2ZzvsMgE8ztnQbC9UvYC/6HVG6P9qys4CHttvIk/x6f15jPltcZadlxHxZ3ZXlkvNFX2Zw2UNaaRUu9rpeQjuyqzaW/lsoqhVQDJECbkmbznG11km+dSI7sr9vq2WjqiiWIHNlfKEV39hE2DCBO6GL10ULzRcbTRdYbRObpPqt1OK9r01uLef1HMGRcq47b7lPXYMCUOf8aU3bPKe/V1rfviK2V8P0UZs2Zrc2ys9ubmaOf69abstzjnd+w74D//Y/uOHTXGjP/rBEQgWeD+7gbCCW4CwX4S3L+57w8W7DN79u5RTm6GYuOWKTU1Tps2rjKKW6+Nm1dp9c+ZWr0+S5t2r9fukt0qNP9KnX8mfvv/ylIVm1CoCrHYqIR0FJZJByocHqHS/GkuqbzU/A2vwCQUEypLK1VWXqHSinKHtCgtNzGUH5B52B/Md1UWOKG8fJ8p1G3auH2Vsn/OUO6GbK3b8bNJ12Zt2b1dW7Zv1drcPKWviNeapEwd2L7bRFHqPwPChPKSUvN+8+kc6uIncwiOjlj9APlA4G+jG67/5h5zzSMfPPHEE0888cQTTzzxxBNPPPHEE0888eR/S8AFOaSYme6bf/5Zm9MzlD5zjlaOHqP8YcOVfc9ALbniRs099QLFH36CUnseruiukYrq3EdpHQ5RTmvz2aSrYup1UHSd9kqv11GrG3ZWlgnx9TsptkFnpTfupvxmEVrVtJfyWeHQvLeSjumiqAEttOzZJoq5sbWSe3Y3z0T6t2Nq1tvcH+mE3KYmNOL8hD7Kb9LHObg6s20vrTypo6LvbqXo4U0VdVdLLT6nneIeaKa8yXW1Ibq21i6uo5S3G2r5wBaKe6aJ8mfX0c+JtZS3oJZSPq+rpUMbKf69BtqY4NPWdP9qiZXzfIqfXUurlvu0xVz/Odp/bgSrI1j5EP+TTzGTail3eh2tW1hbmV/UU/z1rZXStqdDNCQf3lVxp3dU/MmdlRrRQ9kQCuSBz5oQEKx8MHnPMzrKMiGpdzfF9Gvl6CjqnpZ+8sG8hwOp85v1Mvf2VKrRbazRdUL9zso2n6uMvlPrGt3Ua6/Y+h1M2XT3l1HHQ7S8U6RiuvZ2yjDuiJM09/QLteyqm5Qz4AHlPDVCie9/qIzZc7U5M0tb1q3Tlq1btb/Afyh5TeRPSUC4yQRLGNhrFhy3wf28vca9Nh53+PW+8jLtLzqgzb9s14bdW/VL6T6HVihViYrKDph3QAiwnJPllyiyUpUV5v3lrMaoIkBMKDah0KSZzUZKKipVXmzyUGTuLzb3m8chH8rNJ39DPsAvlBWbe8sqnfuLTZzF5oay8mJVlLMSwoRSc1NpgXnQpMFhLsw7SZeKdaCiyLyvxHwz+Ta/IBANB7btVsGWXSrZW6iyAyWqKC51VjaUl5q0Gn2UuoKjM5Nu/6oIiIl/6MutP7e+PPHEE0888cQTTzzxxBNPPPHEE0888cST/y0BH9y8YYMyvv1OmQ89rui/X6+lJ52r5L5HK6NzX0U376F5tdtqua+50nzNlORrqigTVvpaKtfXVvl1Oiq5fmfFNuqmzBa9taZ1X+W06qPkVr0V06KXVrbsrbxWkco339mKKL9+H2U37q2VR3dW1J0ttXRoU624o6UST+qk9DYRyqnTR6vq93XuzW1jnm3N872Vy2fz3s4qiPTmJt7e3ZR4TBcl9emm5DY9lXJUZ6Xe1lqpQ1po5cCWSji7gxL6dlPSmZ2UYa6lv95YKUNM+i9vo+i/dlLsTa2VMbGuVif4lBfrU9ykuloxtr7yl9TWriyfdqT6SQi2dcqO8ylhch0tHdJUCbe3VKpJb/JlbZTUu6tym/RSXu2+SjfpTmrYW8kNIpVVr49zfoNz5kMo8qHqOudf5Dcnz32cvKe37anEUztqxd0ttcy8b0W/lko6souyGxn9mbidg6x51uh0ZcteimkZoRQnvj5abXSfbnQe07CrUup30WpTNjmmjBJ8LbTC10TJJqSaMlxqwry67RXbqqcyuvbVykOO0ZJTzlPs5Tco87EnlPnjT9q6ZYuDjddU/lQEhAW9+bRgeLBgAXL33+447HX37zbYOIrLSrW/vER7KoudsF8lzuZHReXFKiktdrYvqjT3A+SrtMIB+itKzDVWF5jvFSaUllWosLzSv+iB1Q5lleZeE0pMvooqVV4VKiEkqv4uNb+VmGfMh4oqKlVk4i+GCDBpcrZMKmEFQ4mzNVNZWaFKy6EeTNoqTdoqilVcUWTyYX6vSpeKSlV+wKT3QInKC0tVWliisuISVVgdlJtrJq9lFf/QgZuAKHUREFY/7u8EbxWEJ5544oknnnjiiSeeeOKJJ5544oknnvzvyY5tW5XyxpuK7RKpGF8jxdTtoKR6HZRbv6MJnZVQr4tiGnVXZpNeymnSW4mNeyq6SQ+ltOipvBYRSmnWUyua9lRq8wjlA6qbkAE4bn5LaN7LD7QDkld9As5nN+itpIjuirmhtZaPaKyoQS0Ue1Z7pfTopizzbG4TVj9EOisC2JbIHuLsBPM9G6C/bqRy2LrJ3JPdtJeS20cotnt3xXYwaTHpzDW/ZbbqpZWHdlPMMR0V26uLkk0eMupEKimym+L6tVTy6w2V9l4DJTxq3j+gjdLHNNa6ZbW0Jd2nLWk+bUr1b7uU9o7Ry6kdFdO8pxIaRyitaYRyG5u0cHZFK3+a8k2+8qtWcfxKNLiCk3fS39zc82v++ii3aR+TzgglR3RT7LnttZwtqoxOYq5uoySTH3SVZ/LjEBpV8eSYEG/0G2vSk2n0hd4JyaYMVjTtodRmlEUvpZjv0Y17aKUpsxzybvQUbcpyZf0uymvQ2eivk1aygqV2O1P2DY2ODlPqmA+1e9cuZ8p+TeW/QkAAaAcjH9xb/wT+ZoP7e+BvNlgQneCOw24vROC09uLKchWK46RLVVBRpiLzvajChPIyh8VxtiaCfIBdKDKhxAY/IVFuPovLKnUAIsL8XVZFPqiwXJWF5tkD5r4DfK9wQiXERJlMvJUy/zmrIA6YP/i5yMRTVmzSybNF3GvyUFbsEBAllcUmrSXms0RlFZAjxeZ3llJw3gTBRFpFjpSbT7ZbYqUGeigxn6UcDmPyxsoPDgch/xXmb/JXVubXEeVhdRSoP4+A8MQTTzzxxBNPPPHEE0888cQTTzzxxJP/PSkqKdbaH39Uwl9PUKKvoRJqtVM84HTjblrTtIfSm/RUfOMIpTKrv1mkMlr0doB4CAaIhnTIBvM9yXwHGF9VBZDHtDD3NO/hEAqWgHAA9OaRym3IOQe9ldKtuwO6Rw1urmUjGmvp3c0Vc2JHpbbr6ZAMuawmYOY/4L55zgHa2dqoamsmyAe+A+izjVOmCRnm/uwG/t9ym/RWVtPeygB8N+9z4jS/ZTXvpZSu3ZV6VGelH9tJ6b27KTmiu1Ze1k4pbzZS1jyf8qJMmFdLqe820srL2ym1TYQya5ln60Qqx24ZBSkAAWE+na2jIBdceXUH/z0moMf6Jh11TVwmHg6rjjm1g5b1b66lTzfWigdaKO7sDkrr0sN/PgZEBUSHKy5Ih+gWPRwC4h8676VER+c9ldnC5NdcizZlEmcC39kSKsW8O76JKTdTrmtNyDZlHAfJ5GtjQiMlnHS61s2dq+LS0irrqJn81wgISwq4CQLAccDvYIA31yxIzj2BIHmghHqHDQDvxFFaXqqSCkKFSjnLwYSiygqV8C4nIhP4A8aA1zjB/O0c4MwqiHIVlZq0m1DJPWXmdw6BPmBi40BqG4rNg/zG8ya+SofLqNR+EwrMY/xskmEuVoVSk/5So4/SQhWXHXBWPrBFVCWRsK9TcZFUWOQcfF3JqglWRJSbNJm0+U+jLzfGUKaislITldGBebKc6+iOVQ+stjDPOJ9GH4jVb2AIVh6eeOKJJ5544oknnnjiiSeeeOKJJ5544sn/fdm7do2yhgxTaqe+WsnBxo17KJ3tgVpFOgB3erNeSm/cW7lVs/tTW0QovlmE0pv7SQiA8Hjzd5b5bbUJgPAJgN/mOtsCucFzu/0QQHxu7T5Kb91LSWd00oq7W2jh4CZaeE8zrbiulVae315px3RRRkR3pbc172nSW9kcwsw2TXX6Kr9uH+WZv3NN4DPfxLW6dl+tqmt+a9DXWV2Q18B/7xpzfXV9E5pFapV5P0RATj3IBBNqm3T4+ii7jp8MYPumlfc1V8rjTZVyf3OtPKeDcz3P3L+mvnkH5zAQNwQIwbwDUsP5NPc46TFpIeSTHtLKe8xv6U2MHtsZnfTqrtTjuijxgvaKur6VFtzbVAsfbKIVd7VU0qmdHPIg1zzr6MitOxOc8jA6jWvRUyurVp2g8wyuGX1TFlkteiuteS+njNJMOTirJpqb5xr3Upopy2x00DLS/BbplHWir7VSux2unGee077Nm6qsoubypyIggpEP9l57nb/dBIT7fnuvW2zcNth7mP3vgO8lJapg1r/5rVQVDljPKohCE8rMvb/G7ryHQBwmnRUA96QDkoDVCiawzZETt/m7uFhlhUUqP1Co8iJWLfyDJHC2TmILp9JKFUBAmK/FJmpICf8WTnya95QUm3sOqLDsgA5UFDpbMZlUmzjKzAPm70ITb1GJ/7BpyAQTKir8RAOHXEM+FJaWqNjcz3eICXufczi1ea7M5J+0oxerG/tp9RyoU0888cQTTzzxxBNPPPHEE0888cQTTzzx5H9DSkqKtWnBQmVeeKVW1m6j2DqdlMhM+ZZVZAGfzPY3wc7wzwDIbm6CuZbQLEKxDtjdy5mNz/2A5CktTBzmE9DcDaI7gbg4WLlJpLJNXMmduiv6tA5aem9zLRveWCueaqK4/q0Uf3lbxZ/WSQmHd1NKtx7K7NxT2R1NaB+hrDa9lNXaBPMOAoc/864cE7c/MPPfvIctjNjKiYOtWblgA99NGpx7zGeOuUa6Uzv0VHrn7spo11OZjc31+pAN3O+/N4d8m2Dfgw54t5OOlia0MqGtucekMadTT2V07qHk7j0Uf0RXxZ7eQbFXGh0PaGny2FRLhzfR0jtbKPrkDkru2MPZTsq/ldM/kw8E8seKBnSbboKzKsSEZHMtpmmEUxZOepr7y+jXMuPTBKcsTWAlS4Ip4xjKun5bZV1+gzYvW+Zs9X+w8l87A+JXIsAEiAG2/uET4dqBAwe0c+dObdu2Tb/88ouKiop+BcndZIK9f9++fc69mzdv1p49e5z4EPseVlcUFBRo7969TtxlbFlUat5XVKzyggMq3LffxLFHBUUHVFBapD2F+7V77x5z/x7tM2H//t3m91+0e99O7dy3Q78U7FJB4T6VFhc6KxWKiwq0u2C3dh74RQWsWCgrUklpoXlvkfN3Qal59wET356dOmDyU1ZQ6KShyOSjwBRcQaF5r0l3wa5dKtqzT+Umv+XmuVIOnjZhX3mhfinZr19MHAUHClRWWGLuMTpjy6Uy9GfiKjT3FZh8mPwdMPkthIAoM58mfftN/HuNjvabfJZAjpjnnEOqS/xbUqHf/fv3OzqyZeEREJ544oknnnjiiSeeeOKJJ5544oknnnjyvy0gsAU7dmrVqFeV1PNIJfraKK5hVyW19JMHgNburYX42353yIbmvRTdrKfiW7AlkH/LJZ77lRAwwT7rDk48bKHkbJsUqfT2EUo+soviz+6g2GvaavmdLbRsYFPFDm6u+AdaKqZ/C0Xf20Kx5nr8ra2VcF1bJV7ZXokXd1DCOR208rSOSjm5o5KP76SkYzsp9ZjOSjuiq9L7dlNa9x5KaROhtIaRzoHP+fX6aBWkBGmpOuyatLC9krNVEysZfH2V7TtE6XX7KI1nTRzpfbsq7cjOTty8I8m8K/nkTko8vaMSzzHhkvZKuLq94q9vp7jbWinuLn+aYwa0UNyglop+qJmWmDwtv72lYq9uo4SzOijpMJNGDuGG5DCBrZxCHmBdFaxu/br2r4iIMWWQ3tx/zd7n6Nj1N+WVbe5PNJ+xDbo6ZZ3U969a89a7Dm79e+S/SkBYIgGQG9AboJvPjRs3aunSpfrmm280btw4TZkyRbGxsQ7BwP1WuB/QPDs7W7NmzdLYsWP1+eefa+rUqUpJSdHu3bur7pTzd0ZGhhYtXqy4+HgT13ZVlFWIcxT2mr8zU1IVExWl3Nwcbdi8UfEJcZo+/SdN/XGKZs6YpnlzZ2n2nOmaMn2yvpv+neYsnau8NbkqKtyvsqID+nltvhZGLdDc6AXK3pCn3cV7nbMbOLdhf9kBrdu5QbEpMZozd7qWL5inNSbNRQUFKq8o0y97f1F6ZroWz5ur+bNmKCU+Vju2bVJpWZFYl1Fiwo4De5WSm6l5SxYpJi5OmzZsUUkhqyr8BEtxcbHWr1uvGKOnqJhorV63TgUl5kmj5z379yknL08rVqxQYmKiNm8ycReXqJIzLsrKtc/oMM/8vmTJEueedeZZ4iNeGzzxxBNPPPHEE0888cQTTzzxxBNPPPHEk/9NAR/cFherzNvuUXKjjkqs1VppzXoqp3Wf3wDavwLbAPZs5dPCD4Cz5VKsuZ/DqPndkhbBng0W8pubwNkO9SKV2bS3Urv3UMKJHRV7aVsl3tJaife2UvQDLbT84SZa8VhjRT/aVCseaqkV95twb0tF3dFS0be1Umy/VlpxW2tF3dra+b7i5haKvr6l4q5po7hL2yv+7I5KObarMruZvHHGAqsbWG1QlZ9VTdjmyX/AdWa3CKUc11UJ5pm4y9op1sQRc4N53y0tFGPes5x3mBDbz7zPfCcNK/qbMMik9aEWWvFIU0WZtEaZNEcPaqkE81vCra0UY/KUcFwnpXbtoSzzPvLMdk4O8RBEN4HB6hUdQ0KwGoKzHxLNJ79z3eYn8LncVpHKNiG1KVsvtVVyky7KvucB7UhJVkXVYoCDlf/qFkx2hj0BYoFZ+Pn5+Zo0aZIef/xx3XTTTbrmmmucz6eeekrTpk1zVjhYEoKVDvHx8Xr33Xd1zz336IorrtDll1+ufv366aWXXtLChQu1q4qZ2bBhg77++ms98sgjGvn8c1q2fJkKDxSa2lOptbl5+urzL/T8yOf0ww8/KD4hXh98OEb33nuPbrn5Rt1xRz/de89duvueO3Rzv5t0y123avjzI7R4yULt37dbu3Zs009Tp+iRoY/owaGDNWnqd1q3bYNKVe78219yQPFpiXpz9Ju659479eiDgzRl0jfavnWLQ0CsWrtKn332qe4fOEAD7r5T773zhtLTklRSWiQ2gSKe1Rt+1mdffamBgwdpxNPPaNHCJdr7yz4/BWkEImb58uV60eR76JNP6Nspk7V1x3bnt+27duono7vnnnte7733nkNCFBcVO79x/sPan3/WhAkT9OCDD+rJJ590yBz0ZleY2E9PPPHEE0888cQTTzzxxBNPPPHEE0888eR/U4oPFGj9198r5cRzlFqnrXLqd/YftNwyNDBuwXC2LmL7n2QT2JbIAcEPMuQ3NXGx/RBnHzSNVHbLCGVx/kOnnkrt2V3JR3RR0vEdlXxGeyWd214J53dQ3IXtFXtRO8VCEFzVVrE3tVHUbW20/I7WWnZXSy3u31RLBzVRzKPNFPdEC8U+2Uwxg5sp9pJWWtmjkzIb91J+Yz/4zwHZnLuQ2aSXEnt2VtzfWynW3Btvnol7ormiH/HHtaR/My2/q5WW395aUbe0UewN5r1Xm3CZCSY9cRd2cM53SDqng0mrCaTZpD2F8yw693TylG305WwHZd7t5LnqfI2DCf7VDL2V1DzCIR/Szd+2PILd75RjK39Z5tTtoNT6Jpx+oTb8MM3ZXej3yp9iBQR/Q0KsX79e48eP12233abTTjtNf/vb35xw7LHH6qSTTtLAgQM1e/ZsZzUDmU5NTdUrr7yiSy+9VCeccIJOOeUUnX766c7fPAeJsWzZMmfLpdzcXD333HM65phjzD2n6Z133tHGjZtIiFKSkvTE0Cd08cWX6NVXX9XCBQv14ovP66KLL3Li+stf/qLevSN1+OGH6tjjj9GZ55ypAQ/cp9lzZmn3L7uUnZWh4cOf0pFHHalDjjhMjz0xRIkpK1VawanTUmFJoeYvmq/b77xdERE9dOThh+upYU8qJztLRUWFzuqO/v3vVc+ePdS7V4TuvKOfQ24Ul/hJgiKT12UronTvfQPUu2+kTjzpRL339ntav3aDc+g0gk6+/fZbh4D5y1F/0YMPD1ZScpLDT2zZulWjR4/W3//+d4eomctp5UV+o0GPy5ctd3QbGRmp4447ztHB6tWrvZUPnnjiiSeeeOKJJ5544oknnnjiiSeeeOKJI+CMezduUu7Lbyi591HK8rVWfsNufuA6DAlBYCY+WzFlmMD30CB4+OCsrGgR6ZzPkM92RFUHO2fVj1QWB1G35GyFnsrq3FOZXXs42yKl9eyutN7dldq3m1KP7Kbkv3ZV8jFdtfK4Tko8uYOSIAHO7aSVl3RU4tVtFH1TfS253aeltzRUwskdldmmt/I5vNoEyIH4U9tr6c0NtNTcE3NjA600zyRf0kkp53VU0ukdtPIk83lcZ+cdyUd1Vcrh5r1s89TLhJ49lM5ZFd38acxpF+GsEMlqbEKDSOfwa/JE3pxzKSB4AlYq1DSgY0fvLYzezTuC3fOb0Mq/miW/UTdl+lqZdJ+gvLff176t/knuv1f+6wSEBbkhCRYvXqz77rtPRx99tEMgDB482JmRf9111+moo45ySIk333zTAcdZCfHFF1845AO/Aa4//PDDGjp0qLNq4vDDD9eJJ57ogOlr1qxRZmamHnvsMbVp00bNmzfXjTfeqCVLljrvTUhI0D339neIhseHDHG2f/rqq6+cuG655RYHlOeZXr166corr9SDgx90Vl2wkmDbtq2aPWuWs/qiYcOGqluvni6+5BL9NP0nFRYWOnmDSJg1e5Yuu+xSNWhQX40aN9b111/vkCO7du5yVnace+45ql27tho2aqhLzX2z58w2z/lJgp3mni/HjXPIldp1a6tFixYOYZAQn+BsWYVwTgZbUB1//PGqX7++TjzpBGf7Ks592Lxli15++WWHTLn66qv1008/qaTYH/fuX3bryy+/1Kmnnuq8v2XLlg5JwVZMNv2eeOKJJ5544oknnnjiiSeeeOKJJ5544okn5WzFlJWptAcfUXInzkBordyGXf2kQOvQJISdef97iYd/Ci1MXJxnwMoEzomwqyMCQ+Oq0MikrWFV4G8TnOtN+jjbKuU27an0Zh2V3KK14g5vo6X3RWjpJ4drxVNdtPLE9spq2ktZzXsp8bT2Wj6yq5Z+dISW39tTcX3aOM9kmmfzTBzElde0j3+VBsG8h7MbeC9p+DU97jQSGpv0c9g1eSFPEA/O6pJ/PdRE95RdXksTGnRRdu3WSup+qDKGDtP23ByV/4u74/zXD6G22/ts2rRJH374oc466ywHRH/iiSecLZRWrlzprIoAFL/sssscQoGVDwDk999/v4444ghddNFFGjNmzK9nHEBMsBIgIiLC2b4JQgECYtiwYWrXrp18Pp9DULzzzrsOOcEzA+67T4cddpgGP/SQs3KAcyViYmKcrYkgK9q3b+8QABAPnJWQkZ6u7du3O2QI11ih0aZ1G7Vq2cohLFhxsHXrVidvkARz5s7RlVdcoQYNGqhe/fo6//zzNXnyZOXl5jnnVpxw4glOuho3buyQKbPnzFGJeQ795GTnaMSIEU5e27Zt65Ao5I+zMdiGCoGAgHDg3cTTpm0bh8BJN+ncsH69Xn/9dSeN1157rWbMmPHrshnS/8wzz6hv375q2rSpox9InYkTJzr588QTTzzxxBNPPPHEE0888cQTTzzxxBNPPLFSXFaqdVFRSr3tbiW36q7sOu2U16SHA2AHA7dt+EMJCAIrA2zgO4B9cxPYrggwnxUENljgv1Ef5ywJZ/VEAxPqR2pV7Qjl+boq09dOKQ26KuWUC5QyariSpg9X9IdHKfrWeko8sb0STm6nqLsbaMW445U041mlPv+kko89W6n1uyjLPEscxLXKxOnEzTvMu3inE3j/r2n6RzqdNFuyITBPf0Coid6dlSWNuymrdnslt49Q6r33a0N8vFPW/6r8VwkISz6wEiItLc1ZocBqBlYZcJD0vn37HPCeQ5EB29k2ieuA6gDkF1xwgY488kiHrOCAaQ5O5v5Vq1Y5Z0D89a9/1RlnnOHcC2nxwgsvOKsYatWq5YD4d9xxh+bPn+8QDayeOOboo51PtmsCoCc+u3KiZ8+euuqqqxxS5EDBAec9hLi4OOfsBLaJ+tuZf3NIClZS8AxpQrhv3rx5uuGGGxwCobV5N+mCpIAcIa3Hn3C8s8oCooP3sNUUz3EuBmm89dZbnXecd955v24xxfZTEAgIWzBBlvB+SI4mTZo493KQN+mAJOEZVnQQt119Qt7vvPNOh9w4+eSTHZICEghdcTC1LSNPPPHEE0888cQTTzzxxBNPPPHEE0888cQT0MKCwgNaO2OGUq6+SSmtuimrVmvlNeymvJZ9ZM8R+NMFQH1m+jsHZ/dSfqOuyqndXhm+1kpt3kMZR52u3Jvu1YYx47V5QaJyv52k+IdOUdRtPkU90khRDzfS8n4+xT1xtnKm/qDN8xK0/u3PlHv9XUo//BSlNuvmxJVTu53yGqGLXsprY/Rh3sd7g6bpvx1MWTkrH4wu2HYpuW2EUm+9Qz8vWKiC4mJ7/PC/JH8KAgKgHSAecJxVCGwvlJyc7PyGcD7Eli1bnAOqN27c6BAMb7/9tgPEA7h/9tlnv64EQCAO2GaIlRGspuBeDqsG6Gd7J0D+bt26OUA7wPys2bM15PHHnTMkIA4sqI/8/PPPDsHBagpWD7DKwgpbFEGMsP3SmWee6RyUzZZRbBXFqok5c+Y4QD/549yFm2++2VlpQB4B+4mXrZ4eeOAB5zu/9e7d2yEgZs6c6eR7x44dTv4gWy655BI9//zzzsoPCAwIFPTGfZA1EC3nnnuuQ5YQICxID4QDh09feOGFzgHdpAvygfR///33zsqSc845x0kPcfP3vffeq6ioKCftnnjiiSeeeOKJJ5544oknnnjiiSeeeOKJJ1bYVH//3j1a88MPSrnsGqW07KFMX1vlNOiq3GYR/hn3fwYigjQAshNa9FJe0x7KadhV2fU7OiGzeQ+l9DpKqX+/Xqtfe0fbo+NUvGO3CjbtVP6rH2jlEcco5uT6WjKygZaPaKi44xoo8aiTlTf6cxVs3qWirTu0LSpa+S+9rtSLr1JKjyOV3qybsup3cuLPadTVvLOnQ0bYtPxZ9OKsjOBQ8AZdlFmrnZJbRyj12pv186xZKigocMr4j5D/GgGBWAICwgCAnvMJ2BqJsxeYfR9KWBHx4osvOgdKQzL8YAydlQJu4WBntl8ChId4AEznEGrIAciCiy++2FkRAPj/0UcfOSsf+A4I7yYgIDs4zBpAn7MlAPztuRVsscSqDOJkSyRWG3AQNAQCRACg/65duxwQH9Cf9LBFEgA/ZAeEy9NPP+3Ey7u5xkoENwEB6cI9/MY2VJwXwVZVZ599tpMPzm/Yu3ev9u/f76yAQB/ExTZKkBSQJm+99ZZGjRrlEBgQEOgaYgRSBwOAxGGFxXfffaf333/fiQNSYtKkSc7KCk888cQTTzzxxBNPPPHEE0888cQTTzzxxBO3gOzu3/2L1n8/RWnX9FNSu0hl1G6j3PqdlNc0Ijjw/V8Kec17Kb9xD+XW6agsXxulNeyk5F5/VfpVNyvvpde0cfY87V2zViUV5U7e9m1Yr+w77ldqvQjFtm2thRe3UfQFbZXWsp1SG0Qq6/5HtG/TBufekvIy7Vm1RhunzVTOyJeUevkNSul1tLmvk/Ou3Lod/e+uOoD7zxEildesp3LrdVRGrTZK6nio0m+6Rxumz1TBvr1/yMoHK38KAgLywBIQAPCBBASAv11JACi/du1aZ4sgCAhA9R9//PHXA5Ptygq2RgLw5x7ICg58Hj58uAPas3Lg2WefdQ63hjiAhACAt6sYIB14J/GwHROrIlgBQfo4KNsSEGxtBDkBaWIJCFZEsNUSW0mxmoDtomz+uA4pwEoIzoCApOAwalZiQBiQF7aNYgsqCAiIGVZc3H777c5WUwMGDHAIiE8++cSJp0+fPs6KiA0bNjgrIDgDAmKFfHHeBflkGyY+WdHA+4iLLZ1IE6tMOPSbuLkOkfPxxx//us0TWzyha0888cQTTzzxxBNPPPHEE0888cQTTzzxxJNgcmDPXq37cYbS7xio1L5HK6NRR2XVbqfcBl2cGfb/0Vn/zvkJ/hUP+c3Nuxt3dwiR7DodlGk+01tFKKPv8cq86GplPTFCa6f+pJ0bNqik3E88IKVM3F6yVBmnnavUWm0VW7+rlrbqqWTzbH7DHsqs3V5pZ1+sLSuiVVr5j3UCxaWl2r5mjdZMnqKcoSOUccFVyog8VukteyqzntGJSYNDzpg05bMaw+rlP6EbqxeHeDB64bDpOu2V3qiT0g49Tpn9B2vDrPkqKiioys0fJ//VLZggFfjkvIVFixY52xY5B0EPHvzr+QkIv69fv945J4LVCVlZWc5h1HY1AVsPsQLACvez4gBSAAKCTALkA8qfeuqpTvysVOA7KwlYwcAKgxNPPNE57Bnyw6YNAgKSgbMjLAHBb4QFCxY4pELnzp2dVQQQHBAbxNmxY0dnJQFEAttDAfqTP4gHVltAPLA6g/QB9rMyARKALaPY0onnOFiag6rJI+9gVQKrOB599FGHNODA6P79+yslJcW5d+zYsc42S6ysgKRg5QPEhj3bgfdBRqBrtnbiPA0Ii06dOjlbPBH3kCFDHL2y4oO4IXLIqxV0QnBL4HdPPPHEE0888cQTTzzxxBNPPPHEE0888eR/Q0AGi/bu05boWGUPH6mUY05XatMuyqoL4N5FuU16ONsy5UII/AqK/xGgO3FUbSXUopc//uY9ldvUBN7ZsIuzDVJW/Q5Ka9Zdyb2PVuqlVyvv+Ze0ac5c7c7PV+HevSrzZ+NX2bdzp1aP/kBpPY5Qoq+V4hr0VHLDSOU0itTqppHK9rVRaq+jlf/JF85qASvogbgO7N6t3bl52jhjlvKeeV6pF12hpIijlNqsq0lLR2fVQW7DriadJo2k1Ul3L5MHk49f8xWY198TXPG0qNJ/4+7+LZfqtHfOrEg+/m/Kee4lbYtPUNH+P558QP5rBASrCFjNAHjNJ2c0sGKAFRCsXAAkZ8UD97HVEbPzmZEP2QAo/umnnzpbDXGmAyscmKnPvYRNmzY5BzwDugO+c29CQoKzugGAn0OjWRHBigVIBc6DAMznDAa2O4LksEA7BASgvF0BsWTJEucdEB5ffPGFQzxwoDWEAATB3//+d+cQ6hYtWjjkwpgxYxzyhEOoyRerHEaOHOmsPDj00EOd9wL4s/UT74EIYQXEjBkztGbNGodEYDUF74CogJyA2CA9HFpNfJzxgI5YAQGRwAoIVmJAkLC645BDDlGrVq3UvXt3h+SARMnJyXHiRn/ETVohbMgDeuCwbMgSzohgiycEfVgdWxKGwHdPPPHEE0888cQTTzzxxBNPPPHEE0888eR/V1gNsCM9Q2tGf6D06/oppe/xSm3cxdmGKKd2B+U17OrMvv8NyO6sAKgCyWsSqmby+1cN+Gf057forfymPUz8XZRXp5NyfG2VYUJy/U5K6XqY0k49X1n9BmjVqNe04cep+n/tnXl0lmV6xiEESCDLBySB7CsUFUURXKqCK6P1uDuOjDpFXGBGxK091Z4ep62nOhYFe2Z0zqg4SOtSrVSHEXDBAUL25Mu3Z2cNS0gCmJ0QvPpeb/LQ16/BGbeJNtfvnPt87/vszxP4577e+7lba6vR3Td43luKCAe9HgQW3gtfXAaKIxJQGpuFamvues7FhNIRSXZUg2/JMrSEqvo7hsFxuo72oKUqhD3vrEXdE08jeNvd8J97GTzJ0+Edk9KfsNpaJ69oYhLoupis/sgIno05ly9zNsZO9GWybeZ5yELt2DRUWesOjpwEX0w6PKeci8CCO7H91y+huab6c5Ec3zRDIkAYR7YRIPhMpz+jGigY8CqkZ555xr6+iPkeGA1ARzq/7qfznmIFIxz4pT+vIaLDnhENFCHo7Oc1RYwoYB0d9uvXr7ejBOjkpzOf1xFVVFTA6/XaURD82n/EiBF2JAAFCDr+zToZDcGIAzrvORaFCwojnIttKTYwaoOOezr377jjDjuqgHPn5eXZ0RMUP7gGXr3EiITly5fbYgj7RUVF2VEZzBfBPA0UNLgfJtFmHgtGa3AsXvPE3BCMYODeGGWRmZlpCyovvPCCLShQgKBowP7r1q2z18grlSjERERE2KIIz4zRGBRSmOybSa85NvfGcWm8golnwnKuiYm4eRY0Izjwb2fMGSEhhBBCCCGEEEIIIYQYntBL2NHait0fb0Lo738O36VXw58xA8H4LITGpSEUlYrq6FTU0Mal90cBmOiIgUiAGkYzGOO7qWM75i1gH16tFJ1mj1XFSAfauFQE47IQTJoGX/bZqDz/SvjvXoraF17E3qIStDc3o/fYsS9MrtzX24s9b6+Fe/ZF8IxJQnF0Msrjs1HnogCRa1+bVB/FfSTDff5lds6EvuMnvx2Gc/Ue60XbwSY0bitAHcWZhUtQee4P4Ms601rrVHvNXHtVVAqqxqb0n491VjXjrfPhfj93PrSBczlxPuFnZJ0P+1pjVFtjhqwxg9ZZBax9+Jn3Yv51CP38CTRu3oLOI0e+0XwPgzGkVzCZL+n5zGuK+NU/owTomOeX/LzOaOXKlbZgwC/1GQFAYYKOdSZnZnJpfrlPJzod62zLyIdFixbZY/DLf4oOwWDQFiAeeOABu4xOfHNtERM30+k/evRoJCUl2dcohUdA8Mqk1NRUO0KAyawZEUAHPtfKnA102vP6I4oiFBoYccE6ChCMmmCOChqvYKI4wUTPXCv3M378eDuKgQIK184ICM7DhNA0ChsUArgnRn8wlwSjKdiWYgYjRhjRwfKXX37ZFiAYhcGzZLbyoqIiWxRhtERMTIwtgrCO+6agw7O788477bEZScH1c31cE0UIiioUQii68DwoOPDZ5ONQBIQQQgghhBBCCCGEEMJJV3c3Wmtr0LjufdT+85PwX/MjVE6fg8oJmfCNnoDQqAmoHpWI6shkVPOaJl5JFJ1u50eoHe8wvlvlrOOVSsxdYPeJSLLH8Ee6UDl2MjwJU+E9bQ68869H8P5H0PDcC9j77no0V3rx6b596DnW+yc52tuamtHwT0+hMiEXFdb6SuIy4XVl2+JDg2V1E/LQEJeD6tFT4Emeivp/XYH2Q4f/6Nis7+49aq1lL1rK3djz9jrUrfgVAj99EJ7Lr4X3VOtsrDkrxyYhEBmPKvt8kqx5Uqw9W8bzYQSJOSNzTvb5ZFh1PB8KDv3nUxORiOAoFzzWWbuZv+LU8+C/4TbUPbkce9dvxKH6eutv1PWtiw9kyAQI4oyC4C+TP9OxziuG6HTn1/10yFNM4BVHd911l/31Ph3rvAJp06ZNtvOdIgTbM5cDkzPTKc/2TCxNxz+FBuaPYCQD2zK3AaMfOGd5ebktTFAsoD3++OP/Jwk1k2LzuiQKCHTo77P+0a5Zs8YWSRgtwAgEJoKmM57GiAHug+sx9bzuicIHoxgoFNDhz2fOSYGFogLzNjCygfkhOD6jIvjOeShwHDx48MS6GPHABNQUT26++Wb7OiiOy0gG9qeQQJFg//799jjcN6+a4t55Jrx+iZEX7E/BhDkhCM+EY1P8YR8KIGxvcmywPlx84HqEEEIIIYQQQgghhBDCYDvdj/ehtaEBu9e+i7p/WY7QovsQuPwa+M6eB9/UWfAkTIM/Lh3BmBQEx1kWlYKA06JpyQiOt+riUhFwZcE7+RR4p86Bf9Y8BOZeicANt6F66d+g/ulnseONt7C3rBxHmpvRM7CGP5Xjn32G/SVlqL51IbyMfoicjHJXDkKu/uiCKsuC8XzPtSMVuK6qnyxGU6XnS32gzTX19PXhUFMTGotLsOO1N1D/i2dQdd8jCFy/AMG58xE4ay48ubPhSZqOQHwmgrGp1hklIzDOMp6J43yC0VaddXaB2BT44tOsPtOs85kN/5x5/dEO99yPul+sxJ7fvY/WnTvtc/lzMuRXMBmnPcsoLDAygQ7zm266yb4uiQ565kig+MAoAeZ3oAOciaabrD8Sc0XwGqWLL77Yzl3A64roVF+6dKmdwJlXOPX09NhXKT377LN2ZAKTLVNY4JzMnUBxgF/603nPudmH66PxOiZGK1AsePTRR+31MQKDzn4KEhRAKIR0dXUN7A7o7Oy0y3htFEUQ5oFgLgUmuGY0BR36rOcVThQL+EfgtVLcH/fJa5u4Jq6F0RW8ronCB8/LcPjwYTuJ9OLFi+0+FCAYMfHQQw/ZuSSY54Hn1N3dbUdr8DwYGcE8GozUoABB4YJXPOXn59tnZKBgw/UyMoLGfBKcL/xvxmeWSYAQQgghhBBCCCGEEEIMBh37vd3daG9pwcFAELvXb0D1i6vg+7vH4bnlDviv+Cv4514K/3nz4Js1F97TL4R3hmWnXwTvmdb77AsRuGAeqi65AsGrroXvx3fB9+g/oubXL2HX2nfRVFiIQw3b0X7oEHq7unG8r+8Lr1k6GT3WGutW/RaVsy6Ee1QCto5JQYkrF974LFTEZKDcsoo469mVA290GvyRiXCfdwkaXn8DRzu+fAJnrrHv2DEc7exEe+shtNbX48C2fOx65x3UPP8beP/25/DceicCV16HkLV3/wXWWZx9AbwzrXPh2fCczrjIFnN4dv55l8L3g6vhvfUn8D5mnc/Lr2DPBx/aeSo6rPF7e3q+0rl8XYZcgDBmHNkUIUKhEFavXm076+kAp6OeOREoDFB4oGOdxj68uonXIvFqJn7dT2c88xYwUoJf/5uv9Rm1YKIMOBaFDM5HBz2vaKLDn5EK7MdoAONkp0DBfqxjImzmmOC4vPKIVxXR6U+Rgm0NnI8iBZ34zMHAHBaF1n8ECgYUGdxuty2AMEqBkQ2ck2NQhOC+OSZFAeay4HrZv7Gx0d6vgfviNVRsSzGEY/CqJI5P4aWqqso+K/ZhX+6Za+G6Kysr7RwRXD/3xLVyPAPFCJ7J66+/bkdHFBQU2NdOGdHBnI3z7yaEEEIIIYQQQgghhBAngx5EeiC7OjtweP9+O2H1wa35OLBhA/a89y52/udb2Ln6NWx/cTW2/+a3/b+r1mD7v7+GXW+/jf3r1qH5w4/QvK0QLYEQjuzdi462Izh6/Jide+LreCjZ9/CBJlQsexhbJqYjf3QSPoxKwycxWdgUl4GNLqvMlYmy+GyU0mIyUTx6MjYnZaPysX9AW1NT/0BfEc7PT8+P9h1Dx6dHcLixEc2+IA7mF+DgBx9hn7X3ndYZbH/1P6wzedU6G8t4Ri+txs5XX8PON99Co3WGBz7YaPXZhuaQdT4H9qOrp8sedyi9t0MmQHyRCEHHOR39dKgzwoHXJVEUYDnbGRHCOL7b2trsa4MoRGzZsgWBQMD+Yt84ytmewgZFB0ZCUMhgH47FcShi0AlPUYDOekYwmDq24/VKHJ9r4jg0ltHJz7F4PZFxyNP4zDLWsR9/KVqwP+dpaWmx18f1MN8Ef/nOiA5e/8Q2LKMowTm4Js7J9Tjn4Dq5DgoR/KVYwj6ch+OxPc/U7N2041VOvCaKa+M7xQWekfO82J9teCbsS1HC7NG0o0mAEEIIIYQQQgghhBBCfBmMf/iz48fRZ1lXXx/aLGvv6UFbRzva2tv6fzs70Hb0KNqtuh6rne2LNP7Ib9AnyUTRuwoKsO3yq7E5Ih6F49KxdVwmtkal4qOU6Xj/7LnYOmseKpNPhTc6HZVx2SiJSsMfRk1EwTU3Y09ZOY59g25+5/lwz9w7z6CN58Mz6bBs4IzsM7PqeIY8y2/jfL4O34kcEHSU04xD29QxOoFOduNIpxknvGlL44Hyne15FZIZi79GtOC7cy7ns2nnrDP1dLybepZxvvBxaM7xw99NX+e7s4zGecxcxsyaOBaN72zD9mbvfDblpr1z3PDxjIWXm3Gc7Ux/82zmNHvjs/nPIIQQQgghhBBCCCGEEF8FehfpFf4i+zZpazoA7y9/hcKpM+Ee6UJVXA6qYrNQNSYF7lPOx7bb70XxgrsRzDsHdaOTURNv1cdko2KECwWnzUHgpVXoPHJ4YLRvh8HOxGnfVYZUgDDCgXF085fvgzm0WeZsZ57pHKcjPByO4xQkjLPcwHczjrPOrOlk6zH9nLCM7WjOMZ2EjxE+p5nrZLCOezUihZmDfWnh8/Gd7cLbOuclZs1sx/GdfUw79jHrC9+jmV8IIYQQQgghhBBCCCG+b9CresDvQ+mie1A2IRPVkUmoc+WiIT4HDdHpCOTORvGVP0TZZTchmH4W6qNSUWvV11GkGJWA0oRslN+3DC319UN61dF3lSETIIwz3JjTwU1zlhuHuPk1ZpzlbD/YeOFRBc5+znn4a+qcbZxj0Uyfk72Hj2X6mzL+Goe9sx1tsPWZvjSWUSAwIgHbmTFYxl/inI/tzFjh786+4eM6zbQLL6NxLrMfIYQQQgghhBBCCCGE+L5BAWJfaSmKbrwFpTEp8I2eAm98NnzxOfDGZqNoUh4+SZ6BwsmnodKVB19sFjxWvTcuC97IySiOS0XJ7QvRFApJgBiEIRcgjAPbvDuNZU6Ht/PZ+c62zjFpLB/MoR7uhDd9TL0p57MZ04zlHNu0Ne/m2fnurGd7PhvM3pxm2pl1m778NeWmzllO8YDvZlznnM5xzDufne/O+UxbU2+enWbacS5jQgghhBBCCCGEEEII8X2kKRhA0d1LsGViNopGJaI4JhMl8dkojMvGhzEZeH9sGrZGZaA0NgvFVnlRfBaKrPLCkQnYkpiL0mWPoHXHjoHRhJMhv4IpnHCnNh3dhO/hTm9T58RZ5zSn49z5bDDvg40d3tY5vmnvNFPnrDfPBmc7sx5T5nw3xjJjpl94e4PpY9oNVmZssHbOctPPmCkTQgghhBBCCCGEEEKI/w8cadwLz5PPoDD7TJSPSIA3NgteVw5KY3PwcXQaPoicgrIxaf3RD1Z5pWWemEyUWW0Lp50D/3PPo72ldWA04WRIBYg/J06n+XfNgR6+nsHWxzJj4QxWJoQQQgghhBBCCCGEEOKP03b4MILPvwj3X5yH4IhE1MZmo9Y1FZ7YXGwem4ZPIpPgG5Nqleeg2pWH6gm5qInJstomwX36Rah+ZQ26OtoHRhNOho0AIYQQQgghhBBCCCGEEEKE09rYiPLHHkdJ2gx4IpLsSAdffC5K47Kx0ZWF9RNzUDZpGvwTp8HjyoXXKvfFZMIzcjKKs2ai8omncKSleWA04UQChBBCCCGEEEIIIYQQQohhB++V6Wo9hPo338G2y65BYWwGysemoCw2C6XjM1AQl4kPZ83Fx3+9BCW3L0HZzLkostqUxmRYbTJRNibFblN41U3YsW49ug8f6R9YnEAChBBCCCGEEEIIIYQQQohhhS0+dHZg53+9g9L5N6J4QjYqolLhic+GOy4Hbuu5JCYNJT9aCM+GDxB473eouPZWlEQlwz0+HZVWO0+c1XZsKoon5qD8ugXY/fv1ONrd3T+BsJEAIYQQQgghhBBCCCGEEGJYcazvOPaFgihfdBfyI8ejYkQsfNGZ8E7Kgyc+B56oVLijUuC5fgH8/70WgTffROX8G1AxejI8MRl2kmrvxDyrTwbKR0Qjf0wcKpY9iKbt23FcOXtPIAFCCCGEEEIIIYQQQgghxLDi6NEe1G/diuJbbkFJUgLKY1NREZ+D8vhs69eymAw7CqJo+mxs/uEC5N9wK0pyZsE9JhkVcVn/29Zl/bqmoDgxESULF2JHSSmOHT8+MIuQACGEEEIIIYQQQgghhBBiWNHb24u9wRBqV61CaNlSlF0yH0VJU1E6NhnltsCQDXdsJjbHpeG9CanY4EpHYUwm3JaVU3yIy0bJ2BQUTZmGsiuuQtWDD6JuzRrsr6nFcQkQJ5AAIYQQQgghhBBCCCGEEGJYQZGgq6MT7S0taNyWj4qf/QylU6bCE5EEb3wO/BOmIhSXg/zIRKwdMQa/HxGN0jFTEGKdKw/e2Cy4IxJRkjYd7ocexr6yUrRZY3V3duEzXcF0AgkQQgghhBBCCCGEEEIIIYYVFAmoE1AqaKmqgv+eJQhMzEbtyCTUxGSh1rL66DSUjUvB+7GTscGyCuu5ITrdrqsZn2m1TYA/KQ/BBx/God27wLgHaQ+fRwKEEEIIIYQQQgghhBBCiGEJhYiDf9iM6ouuRP3oROyMmGQLC6GIifCOTUTJrL9Ewb0/xbZF96BkxjnwRE606hKsNonYMXIS6iITUXPVjWgtq7DFDPF5JEAIIYQQQgghhBBCCCGEGJb0fHoEO1b8EsHMM1AXl4EdqaejNvsshGZcgOBVN6Jh5XM44PPigNuN+qeeRuDya1B1+oWos9psn3Ia6qLTEZw2B7tefAW9nZ0DowrDypUrJUAIIYQQQgghhBBCCCGEGH7sLylB/h2L8EnWGSiaeRHc1/8YniXLEHj239D48cfoOrAfnw3ENnQ2NmL3xo0ILF8J7+L74b52AQpnXIBNOTNRsPg+NPv9uoMpjBUrVuB/AC+mFqIgVkaAAAAAAElFTkSuQmCC';

        // Agregar la imagen al workbook
        const imageId1 = workbook.addImage({
            base64: base64Image,
            extension: 'png',
        });

        // Ajustar la imagen al rango C2:P2
        worksheet.addImage(imageId1, {
            tl: { col: 2, row: 1 }, // Columna y fila (C2 equivale a col: 2 y row: 1 en ExcelJS)
            br: { col: 16, row: 2 }, // P2 equivale a col: 16 y row: 2
        });

        // Ajustar la altura de la fila 2 para que acomode correctamente la imagen
        worksheet.getRow(2).height = 100; // Altura en puntos (puedes ajustar según sea necesario)

        // Título principal
        worksheet.mergeCells('C3:P3');
        worksheet.getCell('C3').value = 'METRADO DE ESTRUCTURAS';
        worksheet.getCell('C3').style = titleStyle;

        //INICIO DE DESCRIPCION
        // Crear un borde exterior para toda la sección de descripción
        worksheet.getCell('C5:P11').style = descriptionContainerStyle;

        // Aplicar estilos individuales sin bordes
        for (let row = 5; row <= 11; row++) {
            for (let col = 3; col <= 16; col++) {
                worksheet.getCell(row, col).style = descriptionContentStyle;
            }
        }

        // Información del proyecto con salto de línea
        worksheet.mergeCells('C5:C6');
        worksheet.getCell('C5').value = 'Proyecto:';
        worksheet.getCell('C5').style = {
            ...descriptionContentStyle,
            alignment: { vertical: 'middle', horizontal: 'left' }
        };

        // Función mejorada para formatear el texto del proyecto
        function formatearTextoProyecto(texto) {
            // Dividir el texto en palabras
            const palabras = texto.split(' ');
            const mitad = Math.ceil(palabras.length / 2);

            // Unir las palabras en dos líneas
            const primeraLinea = palabras.slice(0, mitad).join(' ');
            const segundaLinea = palabras.slice(mitad).join(' ');

            return `${primeraLinea}\n${segundaLinea}`;
        }

        // Estilo específico para el nombre del proyecto
        const projectNameStyle = {
            font: { name: 'Arial', size: 10 },
            alignment: {
                vertical: 'middle',
                horizontal: 'left',
                wrapText: true
            },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' }
            },
            border: null
        };

        // Para la hoja principal
        worksheet.mergeCells('D5:P6');
        const cellD5 = worksheet.getCell('D5');
        cellD5.value = `"${formatearTextoProyecto(nombre_proyecto)}"`;
        cellD5.style = projectNameStyle;
        worksheet.getRow(5).height = 30; // Aumentar altura de la primera fila
        worksheet.getRow(6).height = 30; // Aumentar altura de la segunda fila

        // Información del propietario
        worksheet.mergeCells('C7');
        worksheet.getCell('C7').value = 'Propietario:';
        worksheet.getCell('C7').style = descriptionContentStyle;

        worksheet.mergeCells('D7');
        worksheet.getCell('D7').value = `${unidad_ejecutora}`;
        worksheet.getCell('D7').style = descriptionContentStyle;

        // Información del hecho por
        worksheet.mergeCells('L7');
        worksheet.getCell('L7').value = 'Hecho por:';
        worksheet.getCell('L7').style = descriptionContentStyle;

        worksheet.mergeCells('M7:P7');
        worksheet.getCell('M7').value = '';
        worksheet.getCell('M7').style = descriptionContentStyle;

        // Información del revisado por
        worksheet.mergeCells('L8');
        worksheet.getCell('L8').value = 'Revisado por:';
        worksheet.getCell('L8').style = descriptionContentStyle;

        worksheet.mergeCells('M8:P8');
        worksheet.getCell('M8').value = '';
        worksheet.getCell('M8').style = descriptionContentStyle;

        // Información de la fecha
        worksheet.mergeCells('C8');
        worksheet.getCell('C8').value = 'Fecha:';
        worksheet.getCell('C8').style = descriptionContentStyle;

        worksheet.mergeCells('D8');
        worksheet.getCell('D8').value = formatearFecha(fecha);
        worksheet.getCell('D8').style = {
            ...descriptionContentStyle,
            alignment: { vertical: 'middle', horizontal: 'left' }
        };

        // Información de la especialidad
        worksheet.mergeCells('C9');
        worksheet.getCell('C9').value = 'Especialidad:';
        worksheet.getCell('C9').style = descriptionContentStyle;

        worksheet.mergeCells('D9');
        worksheet.getCell('D9').value = `${especialidad}`;
        worksheet.getCell('D9').style = descriptionContentStyle;

        // Información del módulo
        worksheet.mergeCells('C10');
        worksheet.getCell('C10').value = 'Modulo:';
        worksheet.getCell('C10').style = descriptionContentStyle;

        worksheet.mergeCells('D10');
        worksheet.getCell('D10').value = `${modulo}`;
        worksheet.getCell('D10').style = descriptionContentStyle;

        worksheet.addRow([]); // Espacio vacío

        // Encabezado de la tabla (modificado para evitar fusiones redundantes)
        worksheet.mergeCells('C14:C15'); // ITEM
        worksheet.mergeCells('D14:D15'); // DESCRIPCIÓN
        worksheet.mergeCells('E14:E15'); // Und
        worksheet.mergeCells('F14:F15'); // Simb
        worksheet.mergeCells('G14:I14'); // DIMENSIONES
        worksheet.mergeCells('J14:J15'); // Elem. Simil.
        worksheet.mergeCells('K14:O14'); // METRADO
        worksheet.mergeCells('P14:P15'); // TOTAL

        worksheet.getCell('C14').value = 'ITEM';
        worksheet.getCell('D14').value = 'DESCRIPCIÓN';
        worksheet.getCell('E14').value = 'Und';
        worksheet.getCell('F14').value = 'Elem. Simil.';
        worksheet.getCell('G14').value = 'DIMENSIONES';
        worksheet.getCell('J14').value = 'Nº de Veces';
        worksheet.getCell('K14').value = 'METRADO';
        worksheet.getCell('P14').value = 'TOTAL';

        worksheet.getRow(14).eachCell((cell) => (cell.style = headerStyle));

        // Sub-encabezados
        worksheet.getCell('G15').value = 'Largo';
        worksheet.getCell('H15').value = 'Ancho';
        worksheet.getCell('I15').value = 'Alto';
        worksheet.getCell('K15').value = 'Lon.';
        worksheet.getCell('L15').value = 'Área';
        worksheet.getCell('M15').value = 'Vol.';
        worksheet.getCell('N15').value = 'Kg.';
        worksheet.getCell('O15').value = 'Und.';

        worksheet.getRow(15).eachCell((cell) => (cell.style = headerStyle));

        // Contenido de la tabla
        worksheet.addRow([]);

        // Llenado de datos en la tabla
        let currentRow = 17; // Comienza en la fila 16 después del encabezado

        const colorStyles = {
            morado: {
                font: {
                    name: 'Arial',
                    size: 10,
                    bold: true,
                    color: { argb: '800080' } // Morado
                }
            },
            rojo: {
                font: {
                    name: 'Arial',
                    size: 10,
                    bold: true,
                    color: { argb: 'FF0000' } // Rojo
                }
            },
            azul: {
                font: {
                    name: 'Arial',
                    size: 10,
                    bold: true,
                    color: { argb: '0000FF' } // Azul
                }
            },
            verde: {
                font: {
                    name: 'Arial',
                    size: 10,
                    bold: true,
                    color: { argb: '008000' } // Verde
                }
            },
            negro: {
                font: {
                    name: 'Arial',
                    size: 10,
                    bold: true,
                    color: { argb: '000000' } // Negro
                }
            }
        };

        // Reemplazar la función getColorStyle con esta versión:
        function getColorStyle(item) {
            if (!item || item === '' || item === undefined) {
                return colorStyles.negro;
            }

            // Función auxiliar para verificar si es un par válido (XX)
            const isValidPair = (pair) => {
                return pair && pair.length === 2 && !isNaN(Number(pair));
            };

            // Dividir el item por puntos y contar pares válidos
            const parts = item.split('.');
            let validPairs = 0;

            for (const part of parts) {
                if (isValidPair(part)) {
                    validPairs++;
                }
            }

            // Verificar si existe un siguiente nivel con un par válido más
            const hasNextLevel = (itemToCheck) => {
                const base = itemToCheck.split('.').slice(0, -1).join('.') + '.';
                return data.some(item =>
                    item.item &&
                    item.item.startsWith(base) &&
                    item.item.split('.').filter(isValidPair).length > validPairs
                );
            };

            switch (validPairs) {
                case 1: // XX
                    return colorStyles.morado;
                case 2: // XX.XX
                    return colorStyles.rojo;
                case 3: // XX.XX.XX
                    return colorStyles.azul;
                case 4: // XX.XX.XX.XX
                    // Si tiene un quinto nivel, usar verde; si no, negro
                    return hasNextLevel(item) ? colorStyles.verde : colorStyles.negro;
                case 5: // XX.XX.XX.XX.XX
                    return colorStyles.negro;
                default:
                    return colorStyles.negro;
            }
        }

        // Modificar la función addRowRecursive para aplicar los colores
        function addRowRecursive(data, level = 0) {
            data.forEach((item) => {
                // Crear una fila para el elemento actual
                worksheet.addRow([
                    '', // Columna A
                    '', // Columna B
                    item.item || '', // ITEM - Columna C
                    item.descripcion || '', // DESCRIPCIÓN - Columna D
                    item.unidad || '', // Und - Columna E
                    item.elesimil || '', // elemn simil - Columna F
                    item.largo || '', // Largo - Columna G
                    item.ancho || '', // Ancho - Columna H
                    item.alto || '', // Alto - Columna I
                    item.nveces || '', // Elem. n veces. - Columna J
                    item.longitud || '', // Lon. - Columna K
                    item.area || '', // Área - Columna L
                    item.volumen || '', // Vol. - Columna M
                    item.kg || '', // Kg. - Columna N
                    //item.unidadcalculado || '', // Und. - Columna O
                    item.unidadcalculado = (item.unidadcalculado === 0 || item.unidadcalculado === "0.00" || item.unidadcalculado === "" || item.unidadcalculado === undefined) ? '' : item.unidadcalculado || '',

                    item.totalnieto = (item.totalnieto === 0 ||
                        item.totalnieto === "0.00" ||
                        item.totalnieto === "" ||
                        item.totalnieto === undefined) ? '' :
                        item.totalnieto || '',
                ]);

                // Aplicar estilos a la fila actual
                worksheet.getRow(currentRow).eachCell((cell, colNumber) => {
                    //cell.style = bodyStyle;

                    // Aplicar negrita a las columnas ITEM y DESCRIPCIÓN (C y D)
                    if (colNumber === 3 || colNumber === 4) {
                        const colorStyle = getColorStyle(item.item);
                        cell.style = {
                            ...bodyStyle,
                            font: colorStyle.font,
                            border: {
                                top: { style: 'thin' },
                                left: { style: 'thin' },
                                bottom: { style: 'thin' },
                                right: { style: 'thin' }
                            }
                        };
                    }

                    if (colNumber === 5) {
                        cell.style = { ...bodysStyle, font: { bold: true } };
                    }

                    if (colNumber === 6 || colNumber === 7 || colNumber === 8 || colNumber === 9 || colNumber === 10
                        || colNumber === 11 || colNumber === 12 || colNumber === 13 || colNumber === 14 || colNumber === 15
                        || colNumber === 16
                    ) {
                        cell.style = { ...bodyStylenumb, font: { bold: true } };
                    }

                    // Aplicar bordes solo a las columnas C a P
                    if (colNumber >= 3 && colNumber <= 16) {
                        cell.border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        };
                    }
                });

                currentRow++;

                // Si hay hijos (children), llamamos recursivamente a la función
                if (item.children && item.children.length > 0) {
                    addRowRecursive(item.children, level + 1);
                }
            });
        }

        // Llamar a la función con los datos iniciales
        addRowRecursive(data);

        // Modificar el aplicador de bordes generales para excluir la sección de descripción
        worksheet.eachRow((row, rowNumber) => {
            if ((rowNumber >= 3 && rowNumber <= 4) || (rowNumber >= 14 && rowNumber <= 15)) {
                row.eachCell((cell) => {
                    cell.border = borderStyle;
                });
            }
        });

        // Crear nueva hoja de cálculo "Resumen"
        const resumenSheet = workbook.addWorksheet('Resumen');

        resumenSheet.columns = [
            { width: 4 },  // A
            { width: 4 },  // B
            { width: 15 },  // C
            { width: 90 }, // D
            { width: 6 },  // E
            { width: 8 },  // F
            { width: 12 },  // G
            { width: 4 },  // H
        ];

        // Agregar la imagen al workbook
        const imageId2 = workbook.addImage({
            base64: base64Image,
            extension: 'png',
        });

        // Ajustar la imagen al rango C2:P2
        resumenSheet.addImage(imageId2, {
            tl: { col: 2, row: 1 }, // Columna y fila (C2 equivale a col: 2 y row: 1 en ExcelJS)
            br: { col: 7, row: 2 }, // P2 equivale a col: 16 y row: 2
        });

        // Ajustar la altura de la fila 2 para que acomode correctamente la imagen
        resumenSheet.getRow(2).height = 97; // Altura en puntos (puedes ajustar según sea necesario)

        // Copiar encabezado a la nueva hoja
        resumenSheet.mergeCells('C3:G3');
        resumenSheet.getCell('C3').value = 'RESUMEN DE METRADO DE OBRAS PROVISIONALES';
        resumenSheet.getCell('C3').style = titleStyle;

        // Aplicar el mismo patrón para la sección de descripción
        resumenSheet.getCell('C5:G11').style = descriptionContainerStyle;

        for (let row = 5; row <= 11; row++) {
            for (let col = 3; col <= 7; col++) {
                resumenSheet.getCell(row, col).style = descriptionContentStyle;
            }
        }

        resumenSheet.mergeCells('C5:C6');
        resumenSheet.getCell('C5').value = 'Proyecto:';
        resumenSheet.getCell('C5').style = descriptionContentStyle;

        // Información del proyecto con salto de línea en la hoja resumen
        resumenSheet.mergeCells('D5:G6');
        const cellResumenD5 = resumenSheet.getCell('D5');
        cellResumenD5.value = `"${formatearTextoProyecto(nombre_proyecto)}"`;
        cellResumenD5.style = projectNameStyle;
        resumenSheet.getRow(5).height = 30;
        resumenSheet.getRow(6).height = 30;

        resumenSheet.mergeCells('C7');
        resumenSheet.getCell('C7').value = 'Propietario:';
        resumenSheet.getCell('C7').style = descriptionContentStyle;

        resumenSheet.mergeCells('D7');
        resumenSheet.getCell('D7').value = `${unidad_ejecutora}`;
        resumenSheet.getCell('D7').style = descriptionContentStyle;

        resumenSheet.mergeCells('C8');
        resumenSheet.getCell('C8').value = 'Fecha:';
        resumenSheet.getCell('C8').style = descriptionContentStyle;

        resumenSheet.mergeCells('D8');
        resumenSheet.getCell('D8').value = formatearFecha(fecha);
        resumenSheet.getCell('D8').style = {
            ...descriptionContentStyle,
            alignment: { vertical: 'middle', horizontal: 'left' }
        };

        resumenSheet.mergeCells('C9');
        resumenSheet.getCell('C9').value = 'Especialidad:';
        resumenSheet.getCell('C9').style = descriptionContentStyle;

        resumenSheet.mergeCells('D9');
        resumenSheet.getCell('D9').value = `${especialidad}`;
        resumenSheet.getCell('D9').style = descriptionContentStyle;

        resumenSheet.mergeCells('C10');
        resumenSheet.getCell('C10').value = 'Modulo:';
        resumenSheet.getCell('C10').style = descriptionContentStyle;

        resumenSheet.mergeCells('D10');
        resumenSheet.getCell('D10').value = `${modulo}`;
        resumenSheet.getCell('D10').style = descriptionContentStyle;

        resumenSheet.addRow([]); // Espacio vacío

        // Encabezado de la tabla para "Resumen"
        resumenSheet.mergeCells('C14:C15'); // ITEM
        resumenSheet.mergeCells('D14:D15'); // DESCRIPCIÓN
        resumenSheet.mergeCells('E14:E15'); // Und
        resumenSheet.mergeCells('F14:F15'); // Parcial
        resumenSheet.mergeCells('G14:G15'); // Total

        resumenSheet.getCell('C14').value = 'ITEM';
        resumenSheet.getCell('D14').value = 'DESCRIPCIÓN';
        resumenSheet.getCell('E14').value = 'Und';
        resumenSheet.getCell('F14').value = 'Parcial';
        resumenSheet.getCell('G14').value = 'Total';

        resumenSheet.getRow(14).eachCell((cell) => (cell.style = headerStyle));

        // Llenado de datos en la hoja "Resumen"
        let resumenRow = 16; // Comienza en la fila 16 después del encabezado
        function addRowRecursiveresumen(data, level = 0) {
            data.forEach((item) => {
                resumenSheet.addRow([
                    '',
                    '',
                    item.item || '', // ITEM - Columna C
                    item.descripcion || '', // DESCRIPCIÓN - Columna D
                    item.unidad || '', // Und - Columna E
                    item.parcial || item.totalnieto || '', // Parcial - Columna F
                    item.total || '' // Total - Columna G
                ]);

                resumenSheet.getRow(resumenRow).eachCell((cell, colNumber) => {
                    //cell.style = bodyStyle;
                    // Aplicar negrita a las columnas ITEM y DESCRIPCIÓN (C y D)
                    if (colNumber === 3 || colNumber === 4) {
                        const colorStyle = getColorStyle(item.item);
                        cell.style = {
                            ...bodyStyle,
                            font: colorStyle.font,
                            border: {
                                top: { style: 'thin' },
                                left: { style: 'thin' },
                                bottom: { style: 'thin' },
                                right: { style: 'thin' }
                            }
                        };
                    }

                    if (colNumber === 5) {
                        cell.style = { ...bodysStyle, font: { bold: true } };
                    }

                    if (colNumber === 6 || colNumber === 7
                    ) {
                        cell.style = { ...bodyStylenumb, font: { bold: true } };
                    }

                    if (colNumber >= 3 && colNumber <= 7) {
                        cell.border = {
                            top: { style: 'thin' },
                            left: { style: 'thin' },
                            bottom: { style: 'thin' },
                            right: { style: 'thin' }
                        };
                    }
                });

                resumenRow++;

                // Si hay hijos (children), llamamos recursivamente a la función
                if (item.children && item.children.length > 0) {
                    addRowRecursive(item.children, level + 1);
                }
            });
        };
        addRowRecursiveresumen(dataresumen);
        // Modificar también los bordes generales en la hoja de resumen
        resumenSheet.eachRow((row, rowNumber) => {
            if ((rowNumber >= 3 && rowNumber <= 4) || (rowNumber >= 14 && rowNumber <= 15)) {
                row.eachCell((cell) => {
                    cell.border = borderStyle;
                });
            }
        });

        // Añadir borde exterior para toda la sección de descripción
        const rangeDescription = worksheet.getCell('C5:P11');
        worksheet.getCell('C5:P11').style = {
            border: {
                top: { style: 'thin', color: { argb: '000000' } },
                left: { style: 'thin', color: { argb: '000000' } },
                bottom: { style: 'thin', color: { argb: '000000' } },
                right: { style: 'thin', color: { argb: '000000' } }
            }
        };

        // Para la hoja de resumen
        const rangeDescriptionResumen = resumenSheet.getCell('C5:G11');
        resumenSheet.getCell('C5:G11').style = {
            border: {
                top: { style: 'thin', color: { argb: '000000' } },
                left: { style: 'thin', color: { argb: '000000' } },
                bottom: { style: 'thin', color: { argb: '000000' } },
                right: { style: 'thin', color: { argb: '000000' } }
            }
        };

        // Crear borde exterior para la sección de descripción usando las esquinas
        const descriptionBorderStyle = {
            font: { name: 'Arial', size: 10 },
            alignment: { vertical: 'middle', horizontal: 'left' },
            fill: {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' }
            }
        };

        // Aplicar bordes a las esquinas y lados
        // Esquina superior izquierda
        worksheet.getCell('C5').style = {
            ...descriptionBorderStyle,
            border: {
                top: { style: 'thin', color: { argb: '000000' } },
                left: { style: 'thin', color: { argb: '000000' } }
            }
        };

        // Esquina superior derecha
        worksheet.getCell('P5').style = {
            ...descriptionBorderStyle,
            border: {
                top: { style: 'thin', color: { argb: '000000' } },
                right: { style: 'thin', color: { argb: '000000' } }
            }
        };

        // Esquina inferior izquierda
        worksheet.getCell('C11').style = {
            ...descriptionBorderStyle,
            border: {
                bottom: { style: 'thin', color: { argb: '000000' } },
                left: { style: 'thin', color: { argb: '000000' } }
            }
        };

        // Esquina inferior derecha
        worksheet.getCell('P11').style = {
            ...descriptionBorderStyle,
            border: {
                bottom: { style: 'thin', color: { argb: '000000' } },
                right: { style: 'thin', color: { argb: '000000' } }
            }
        };

        // Borde superior
        for (let col = 4; col <= 15; col++) {
            worksheet.getCell(5, col).style = {
                ...descriptionBorderStyle,
                border: {
                    top: { style: 'thin', color: { argb: '000000' } }
                }
            };
        }

        // Borde inferior
        for (let col = 4; col <= 15; col++) {
            worksheet.getCell(11, col).style = {
                ...descriptionBorderStyle,
                border: {
                    bottom: { style: 'thin', color: { argb: '000000' } }
                }
            };
        }

        // Bordes laterales
        for (let row = 6; row <= 10; row++) {
            // Borde izquierdo
            worksheet.getCell(row, 3).style = {
                ...descriptionBorderStyle,
                border: {
                    left: { style: 'thin', color: { argb: '000000' } }
                }
            };

            // Borde derecho
            worksheet.getCell(row, 16).style = {
                ...descriptionBorderStyle,
                border: {
                    right: { style: 'thin', color: { argb: '000000' } }
                }
            };
        }

        // Hacer lo mismo para la hoja de resumen
        // Esquinas y bordes para la hoja de resumen
        // Esquina superior izquierda
        resumenSheet.getCell('C5').style = {
            ...descriptionBorderStyle,
            border: {
                top: { style: 'thin', color: { argb: '000000' } },
                left: { style: 'thin', color: { argb: '000000' } }
            }
        };

        // Esquina superior derecha
        resumenSheet.getCell('G5').style = {
            ...descriptionBorderStyle,
            border: {
                top: { style: 'thin', color: { argb: '000000' } },
                right: { style: 'thin', color: { argb: '000000' } }
            }
        };

        // Esquina inferior izquierda
        resumenSheet.getCell('C11').style = {
            ...descriptionBorderStyle,
            border: {
                bottom: { style: 'thin', color: { argb: '000000' } },
                left: { style: 'thin', color: { argb: '000000' } }
            }
        };

        // Esquina inferior derecha
        resumenSheet.getCell('G11').style = {
            ...descriptionBorderStyle,
            border: {
                bottom: { style: 'thin', color: { argb: '000000' } },
                right: { style: 'thin', color: { argb: '000000' } }
            }
        };

        // Borde superior
        for (let col = 4; col <= 6; col++) {
            resumenSheet.getCell(5, col).style = {
                ...descriptionBorderStyle,
                border: {
                    top: { style: 'thin', color: { argb: '000000' } }
                }
            };
        }

        // Borde inferior
        for (let col = 4; col <= 6; col++) {
            resumenSheet.getCell(11, col).style = {
                ...descriptionBorderStyle,
                border: {
                    bottom: { style: 'thin', color: { argb: '000000' } }
                }
            };
        }

        // Bordes laterales
        for (let row = 6; row <= 10; row++) {
            // Borde izquierdo
            resumenSheet.getCell(row, 3).style = {
                ...descriptionBorderStyle,
                border: {
                    left: { style: 'thin', color: { argb: '000000' } }
                }
            };

            // Borde derecho
            resumenSheet.getCell(row, 7).style = {
                ...descriptionBorderStyle,
                border: {
                    right: { style: 'thin', color: { argb: '000000' } }
                }
            };
        }

        // Función para formatear la fecha
        function formatearFecha(fechaStr) {
            const fecha = new Date(fechaStr);
            const meses = [
                'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
                'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
            ];
            return `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
        }

        // Exportar archivo
        workbook.xlsx.writeBuffer().then(function (data) {
            const blob = new Blob([data], { type: 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'metrado_instalaciones.xlsx';
            a.click();
            window.URL.revokeObjectURL(url);
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
                    ////console.warn(`Orden incorrecto detectado: ${lastItem} -> ${item.item}`);
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
                    ////console.warn(`Item inválido detectado:`, item);
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
        ////console.warn('Se detectaron inconsistencias en la numeración de items');
    }

    return sortedData;
}