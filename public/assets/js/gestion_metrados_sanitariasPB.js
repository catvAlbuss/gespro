import Modulos from './metrados/modulos.js';
import Exterior from './metrados/exterior.js';
import Cisterna from './metrados/cisternate.js';

class Sistema {
    constructor() {
        this.modulosTables = [];
        this.modulosCount = 3;
        this.exteriorTable = null;
        this.cisternaTable = null;
        this.resumenTable = null;

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
    }

    async recreateModulesTables() {
        // Limpiar las tablas de los módulos existentes
        const modulosContainer = document.getElementById('modulos');
        if (!modulosContainer) {
            console.error('El contenedor de los módulos no existe');
            return;
        }
        modulosContainer.innerHTML = ''; // Limpiar el contenedor de módulos
        this.modulosTables = [];

        // Obtener el valor del input
        const inputElement = document.getElementById('datamodulos');
        const modulosData = inputElement ? inputElement.value : null;

        let modulosParse;
        if (modulosData) {
            try {
                // Parsear los datos JSON
                modulosParse = JSON.parse(modulosData);

                // Validar la estructura de los datos
                if (!modulosParse.modulos || !Array.isArray(modulosParse.modulos)) {
                    console.warn('La clave "modulos" no existe o no es un array. Se usará un array vacío.');
                    modulosParse.modulos = [];
                }
            } catch (error) {
                console.error('Error al procesar el JSON:', error.message);
                return;
            }
        } else {
            console.error('El elemento #datamodulos no contiene datos válidos.');
            return;
        }

        // Procesar cada módulo
        const modulos = modulosParse.modulos;
        const modulosCount = modulos.length; // Número de módulos en el JSON

        if (modulosCount === 0) {
            console.log('No hay módulos disponibles en los datos.');
            return;
        }

        for (let i = 0; i < modulosCount; i++) {
            const modulo = modulos[i];
            const moduleName = modulo.nombre || `Módulo ${i + 1}`; // Nombre del módulo por defecto
            const moduleData = modulo.datos || []; // Datos del módulo

            // Crear la tarjeta para el módulo
            const moduleCard = document.createElement('div');
            moduleCard.classList.add('card', 'bg-white', 'shadow-md', 'rounded-lg', 'overflow-hidden', 'mb-6');

            // Crear el header de la tarjeta
            const cardHeader = document.createElement('div');
            cardHeader.classList.add('card-header', 'bg-gray-100', 'p-4');

            const h3Element = document.createElement('h3');
            h3Element.classList.add('text-xl', 'font-semibold', 'text-gray-950', 'dark:text-gray-950');
            h3Element.textContent = moduleName;

            cardHeader.appendChild(h3Element);

            // Crear el body de la tarjeta (donde irá la tabla)
            const cardBody = document.createElement('div');
            cardBody.classList.add('card-body', 'p-4');

            // Crear un contenedor vacío para la tabla
            const tableContainer = document.createElement('div');
            tableContainer.id = `modulo-${i}`;

            cardBody.appendChild(tableContainer);
            moduleCard.appendChild(cardHeader);
            moduleCard.appendChild(cardBody);

            // Añadir la tarjeta al contenedor principal
            modulosContainer.appendChild(moduleCard);

            // Crear la tabla usando los datos del módulo
            const moduleTable = new Modulos(
                tableContainer.id,  // ID del contenedor de la tabla
                moduleData,         // Datos del módulo
                () => updateResumenTable() // Callback para actualizar resumen
            );

            // Guardar la tabla en el arreglo
            this.modulosTables.push(moduleTable);
        }

        console.log(this.modulosTables)
        //console.log('Tablas creadas:', modulosTables);
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
        // Recreate Modules Tables
        this.recreateModulesTables();

        // Exterior Table
        this.exteriorTable = new Exterior('exterior', () => this.updateResumenTable());

        // Cisterna Table
        this.cisternaTable = new Cisterna('cisternate', () => this.updateResumenTable());

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
                hozAlign:"center",
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

    updateResumenTable() {
        const resumenData = {};

        const isValidItem = (item) => {
            if (!item) return false;
            const itemParts = item.split('.');
            return itemParts.length === 4 && itemParts.every(part => /^[0-9]{2}$/.test(part));
        };

        const upsertResumenRecord = (key, node) => {
            if (!resumenData[key]) {
                resumenData[key] = {
                    id: node.id,
                    item: node.item,
                    descripcion: node.descripcion,
                    unidad: node.unidad || '',
                    totalnieto: '',
                    exterior: '',
                    cisterna: '',
                    total: '',
                };

                // Inicializar campos dinámicos para módulos
                for (let i = 1; i <= this.modulosCount; i++) {
                    resumenData[key][`modulo_${i}`] = '';
                }
            }
            return resumenData[key];
        };


        const processNode = (node, options = {}) => {
            const { parentKey = '', sourceType = '', processChildren = true } = options;

            const itemParts = node.item.split('.');
            // Aquí no limitamos la profundidad a 4, sino que permitimos hasta 5 niveles
            if (itemParts.length > 4) return; // Permitir hasta 5 niveles

            const key = `${parentKey ? parentKey + '.' : ''}${node.item}-${node.descripcion}`;
            const record = upsertResumenRecord(key, node);

            // Asegurarse de que los valores se sumen correctamente
            const getNumericValue = (value) => {
                return parseFloat(value) || 0; // Convertir a número, si no es un número válido, devolver 0
            };

            if (isValidItem(node.item)) {
                let moduleSum = 0; // Inicializar la suma de los módulos

                // Sumar exterior, cisterna y módulos
                switch (sourceType) {
                    case 'exterior':
                        record.exterior += getNumericValue(node.totalnieto); // Convertir y sumar
                        break;
                    case 'cisterna':
                        record.cisterna += getNumericValue(node.totalnieto); // Convertir y sumar
                        break;
                    default:
                        if (sourceType.startsWith('modulo')) {
                            const moduleIndex = parseInt(sourceType.split('_')[1], 10);
                            const moduleField = `modulo_${moduleIndex}`;

                            // Asegurarse de que el campo del módulo exista
                            record[moduleField] = (record[moduleField] || 0) + getNumericValue(node.totalnieto); // Convertir y sumar
                            moduleSum += getNumericValue(node.totalnieto); // Sumar el valor al total de módulos
                        }
                        break;
                }

                // Sumar todos los módulos
                const modulesTotal = Object.keys(record)
                    .filter(key => key.startsWith('modulo_'))
                    .reduce((sum, key) => sum + getNumericValue(record[key]), 0);

                // Calcular el total sumando los valores correspondientes
                record.total = (getNumericValue(record.totalnieto) + getNumericValue(record.exterior) + getNumericValue(record.cisterna) + modulesTotal).toFixed(2);

            } else {
                node.totalnieto = null;
            }

            // Procesar los hijos si es necesario
            if (processChildren && node.children && node.children.length > 0) {
                node.children.forEach(child => {
                    processNode(child, { parentKey: node.item, sourceType });
                });
            }
        };


        function ordenarPorItem(data) {
            console.log(data);
            // Primero, ordenamos los elementos en cada nivel de la jerarquía
            data.sort((a, b) => {
                // Convertir los items a una secuencia numérica para que la comparación sea adecuada
                const aParts = a.item.split('.').map(num => parseInt(num, 10)); // Dividimos por puntos y los convertimos a enteros
                const bParts = b.item.split('.').map(num => parseInt(num, 10)); // Hacemos lo mismo para b

                // Comparamos los arrays numéricos, asegurándonos de hacer la comparación de cada segmento
                for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
                    const aVal = aParts[i] || 0;  // Si no hay más segmentos, usamos 0
                    const bVal = bParts[i] || 0;  // Lo mismo para b

                    // Si los segmentos son diferentes, retornamos la diferencia
                    if (aVal !== bVal) {
                        return aVal - bVal;
                    }
                }

                // Si todo es igual, devolvemos 0 (es decir, son iguales)
                return 0;
            });

            // Luego, si un elemento tiene hijos, llamamos recursivamente a la función para ordenarlos también
            data.forEach(item => {
                if (item.children && item.children.length > 0) {
                    ordenarPorItem(item.children);
                }
            });
        }


        setTimeout(() => {
            this.modulosTables.forEach((modulo, index) => {
                const moduleData = modulo.table.getData();
                moduleData.forEach(row => {
                    processNode(row, { sourceType: `modulo_${index + 1}` });
                });
            });

            const exteriorData = this.exteriorTable.table.getData();
            exteriorData.forEach(row => {
                processNode(row, { sourceType: 'exterior' });
            });

            const cisternaData = this.cisternaTable.table.getData();
            cisternaData.forEach(row => {
                processNode(row, { sourceType: 'cisterna' });
            });

            const resumenArray = Object.values(resumenData);
            //console.log("Datos procesados:", resumenArray);
            // Ordenar los datos jerárquicos
            ordenarPorItem(resumenArray);

            //console.log(JSON.stringify(resumenData));
            this.resumenTable.setData(resumenArray);
        }, 100);


        $('#actualizar_metrados').on('click', () => {
            const datamodulos = this.modulosTables; // Array of Modulos objects
            console.log(datamodulos);
            if (!datamodulos) {
                console.error('modulosTables is undefined');
                return;
            }

            const modulosData = [];

            // Loop through all Modulos objects and collect the data from each table
            datamodulos.forEach((modulo, index) => {
                if (modulo && modulo.table) {
                    modulosData.push({
                        nombre: `modulo_${this.toRoman(index + 1)}`, // Nombre del módulo con numeración romana
                        datos: modulo.table.getData() // Datos de la tabla correspondiente al módulo
                    });
                } else {
                    console.error(`Modulo en posición ${index} o su tabla está undefined`);
                }
            });

            // Gather data from other tables (cisterna and exterior)
            const datacisterna = this.cisternaTable?.table?.getData();
            const dataexterior = this.exteriorTable?.table?.getData();

            // Create a JSON object to send via AJAX
            const dataToSend = {
                modulos: modulosData,
                cisterna: datacisterna,
                exterior: dataexterior
            };

            console.log('Data to send:', dataToSend); // Debugging

            // AJAX request with jQuery
            $.ajax({
                url: '/update_metrados_sanitarias', // Laravel route
                method: 'POST',
                data: JSON.stringify(dataToSend), // Send data as JSON
                contentType: 'application/json',
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') // Include CSRF token for Laravel
                },
                success: function (response) {
                    console.log('Response:', response.message); // Success message from the server
                },
                error: function (xhr) {
                    console.error('Error:', xhr.responseText); // Error response from the server
                }
            });
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

export default new Sistema();