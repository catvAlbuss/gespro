class GastoReal {
    constructor() {
        this.ingresoTable = null;
        this.gastoTable = null;
        this.tableDetails = null; // For showing details modal
        this.dataGenerales = {
            ingresos: [
                {
                    id: 1,
                    abr: 0,
                    ago: 0,
                    dic: 0,
                    ene: 0,
                    feb: 0,
                    jul: 0,
                    jun: 0,
                    mar: 0,
                    may: 0,
                    nov: 0,
                    oct: 0,
                    sep: 0,
                    total: 0,
                    registro: "123",
                    _children: [
                        {
                            id: 2,
                            abr: 0,
                            ago: 0,
                            dic: 0,
                            ene: 0,
                            feb: 0,
                            jul: 0,
                            jun: 0,
                            mar: 0,
                            may: 0,
                            nov: 0,
                            oct: 0,
                            sep: 0,
                            total: 0,
                            registro: "123",
                            datos_bal: "INGRESOS GENERALES"
                        },
                        {
                            id: 3,
                            abr: 0,
                            ago: 0,
                            dic: 0,
                            ene: 0,
                            feb: 0,
                            jul: 0,
                            jun: 0,
                            mar: 0,
                            may: 0,
                            nov: 0,
                            oct: 0,
                            sep: 0,
                            total: 0,
                            registro: "123",
                            datos_bal: "INGRESOS DE INVERSION"
                        },
                        {
                            id: 4,
                            abr: 0,
                            ago: 0,
                            dic: 0,
                            ene: 0,
                            feb: 0,
                            jul: 0,
                            jun: 0,
                            mar: 0,
                            may: 0,
                            nov: 0,
                            oct: 0,
                            sep: 0,
                            total: 0,
                            registro: "123",
                            datos_bal: "INGRESOS DE FINANCIAMIENTO"
                        }
                    ],
                    datos_bal: "INGRESOS TOTALES",
                }
            ],
            gastos: [
                {
                    id: 5,
                    abr: 0,
                    ago: 0,
                    dic: 0,
                    ene: 1214.00,
                    feb: -500.00,
                    jul: 0,
                    jun: 0,
                    mar: 0,
                    may: 2,
                    nov: 0,
                    oct: 0,
                    sep: 0,
                    total: 714.00,
                    registro: "126",
                    _children: [
                        {
                            id: 6,
                            abr: 0,
                            ago: 0,
                            dic: 0,
                            ene: 0,
                            feb: 0,
                            jul: 0,
                            jun: 0,
                            mar: 0,
                            may: 0,
                            nov: 0,
                            oct: 0,
                            sep: 0,
                            total: 0,
                            registro: "123",
                            datos_bal: "Gastos operativos"
                        },
                        {
                            id: 7,
                            abr: 0,
                            ago: 0,
                            dic: 0,
                            ene: 1214.00,
                            feb: -500.00,
                            jul: 0,
                            jun: 0,
                            mar: 0,
                            may: 0,
                            nov: 0,
                            oct: 0,
                            sep: 0,
                            total: 714.00,
                            registro: "123",
                            _children: [
                                {
                                    id: 8,
                                    abr: 0,
                                    ago: 0,
                                    dic: 0,
                                    ene: 12,
                                    feb: 0,
                                    jul: 0,
                                    jun: 0,
                                    mar: 0,
                                    may: 0,
                                    nov: 0,
                                    oct: 0,
                                    sep: 0,
                                    total: 0,
                                    registro: "123",
                                    datos_bal: "cargos"
                                },
                                {
                                    id: 9,
                                    abr: 0,
                                    ago: 0,
                                    dic: 0,
                                    ene: 1200,
                                    feb: -500,
                                    jul: 0,
                                    jun: 0,
                                    mar: 0,
                                    may: 0,
                                    nov: 0,
                                    oct: 0,
                                    sep: 0,
                                    total: 0,
                                    registro: "123",
                                    datos_bal: "mantenimiento"
                                },
                                {
                                    id: 10,
                                    abr: 0,
                                    ago: 0,
                                    dic: 0,
                                    ene: 2,
                                    feb: 0,
                                    jul: 0,
                                    jun: 0,
                                    mar: 0,
                                    may: 0,
                                    nov: 0,
                                    oct: 0,
                                    sep: 0,
                                    total: 0,
                                    registro: "123",
                                    datos_bal: "Ventilaciones"
                                }
                            ],
                            datos_bal: "Gastos de inversion"
                        },
                        {
                            id: 11,
                            abr: 0,
                            ago: 0,
                            dic: 0,
                            ene: 0,
                            feb: 0,
                            jul: 0,
                            jun: 0,
                            mar: 0,
                            may: 0,
                            nov: 0,
                            oct: 0,
                            sep: 0,
                            registro: "123",
                            datos_bal: "Gastos de financiamiento"
                        }
                    ],
                    datos_bal: "GASTOS TOTALES",
                },
            ],
            resumen: [
                {
                    id: 12,
                    datos_bal: "Estado de cuenta",
                    registro: "",
                    ene: 0, feb: 0, mar: 0, abr: 0,
                    may: 0, jun: 0, jul: 0, ago: 0,
                    sep: 0, oct: 0, nov: 0, dic: 0,
                    total: 0
                },
                {
                    id: 13,
                    datos_bal: "Diferencia de balances",
                    registro: "",
                    ene: 0, feb: 0, mar: 0, abr: 0,
                    may: 0, jun: 0, jul: 0, ago: 0,
                    sep: 0, oct: 0, nov: 0, dic: 0,
                    total: 0
                }
            ]
        };
        this.initializeEventListeners();
        this.loadData();
        //this.loadDataBalances();
    }

    init() {
        // Main container
        const container = document.getElementById("Tabla_Balance_Real");

        // Función para crear secciones con encabezado y contenido colapsable
        const createSection = (id, titulo, extraClasses = "") => {
            // Wrapper
            const section = document.createElement("div");
            section.className = `mb-4 border rounded-lg shadow bg-white ${extraClasses}`;

            // Header con botón expandir/contraer
            const header = document.createElement("div");
            header.className = "flex items-center justify-between px-4 py-2 cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-t-lg";
            header.innerHTML = `
            <h3 class="font-semibold text-gray-700">${titulo}</h3>
            <button class="toggle-btn text-sm text-blue-600 hover:underline">Contraer</button>
        `;

            // Contenido
            const content = document.createElement("div");
            content.id = id;
            content.className = "tabulator-container px-2 py-2";

            // Lógica expandir/contraer
            header.addEventListener("click", () => {
                if (content.style.display === "none") {
                    content.style.display = "block";
                    header.querySelector(".toggle-btn").innerText = "Contraer";
                } else {
                    content.style.display = "none";
                    header.querySelector(".toggle-btn").innerText = "Expandir";
                }
            });

            // Añadir al wrapper
            section.appendChild(header);
            section.appendChild(content);

            return section;
        };

        // Crear las secciones para las tablas
        const ingresosSection = createSection("tabla-ingresos", "Ingresos Reales");
        const gastosSection = createSection("tabla-gastos", "Gastos Reales");
        const estadoSection = createSection("tabla-estado", "Estado de Cuenta");
        const resumenSection = createSection("tabla-resumen", "Resumen General");

        // Agregar las secciones al contenedor principal
        container.appendChild(ingresosSection);
        container.appendChild(gastosSection);
        container.appendChild(estadoSection);
        container.appendChild(resumenSection);

        // Sección del gráfico con misma lógica
        const graficoSection = document.createElement("div");
        graficoSection.className = "mb-4 border rounded-lg shadow bg-white";

        const graficoHeader = document.createElement("div");
        graficoHeader.className = "flex items-center justify-between px-4 py-2 cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-t-lg";
        graficoHeader.innerHTML = `
        <h3 class="font-semibold text-gray-700">Gráfico Resumen</h3>
        <button class="toggle-btn text-sm text-blue-600 hover:underline">Contraer</button>
    `;

        const graficoContent = document.createElement("div");
        graficoContent.id = "grafico-resumen";
        graficoContent.className = "overflow-x-auto p-2";
        graficoContent.style.height = "400px"; // Altura fija para el gráfico

        // Expandir/contraer gráfico
        graficoHeader.addEventListener("click", () => {
            if (graficoContent.style.display === "none") {
                graficoContent.style.display = "block";
                graficoHeader.querySelector(".toggle-btn").innerText = "Contraer";
            } else {
                graficoContent.style.display = "none";
                graficoHeader.querySelector(".toggle-btn").innerText = "Expandir";
            }
        });

        graficoSection.appendChild(graficoHeader);
        graficoSection.appendChild(graficoContent);
        container.appendChild(graficoSection);

        // Inicializar tablas
        this.configTable();

        // Eventos de cálculo
        this.setupCalculationEvents();

        // Inicializar gráfico
        this.graficoResumen();
    }

    // Mover loadDataBalances como método de la clase (SOLUCIÓN PRINCIPAL)
    loadDataBalances(nombre_balance) {
        console.log("Buscando balance:", nombre_balance);

        // Obtener datos actuales de ambas tablas
        const ingresosData = this.ingresoTable.getData();
        const gastosData = this.gastoTable.getData();

        $.ajax({
            url: "/obtener-listado-balance",
            type: "POST",
            data: JSON.stringify({ nombre_balance }),
            contentType: "application/json",
            dataType: "json",
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
            },
            success: (response) => { // Usar arrow function para mantener contexto
                console.log("Balance encontrado:", response);

                // PROCESAR INGRESOS - Solo nodos padre
                if (response.ingresos_financiamiento) {
                    console.log("Procesando ingresos de financiamiento:", response.ingresos_financiamiento);

                    // Extraer solo los nodos padre
                    const ingresosParent = this.extractParentNodes(response.ingresos_financiamiento);

                    // Buscar la fila específica en ingresos por datos_bal
                    console.log(ingresosData);
                    const ingresoTargetRow = this.findRowByDatosBal(ingresosData, "INGRESOS DE FINANCIAMIENTO");

                    console.log(ingresoTargetRow);
                    if (ingresoTargetRow) {
                        console.log("Fila de INGRESOS DE FINANCIAMIENTO encontrada:", ingresoTargetRow);

                        // Limpiar children existentes y agregar nuevos datos
                        ingresoTargetRow.children = ingresosParent;

                        // Actualizar la tabla con setData
                        this.ingresoTable.setData(ingresosData).then(() => {
                            console.log("Ingresos padre insertados correctamente");

                            // Expandir la sección actualizada
                            this.expandRowByDatosBal(this.ingresoTable, "INGRESOS DE FINANCIAMIENTO");
                        });
                    } else {
                        console.warn("No se encontró la fila 'INGRESOS DE FINANCIAMIENTO' en la tabla de ingresos");
                    }
                }

                // PROCESAR GASTOS - Estructura completa
                if (response.gastos_financiamiento) {
                    console.log("Procesando gastos de financiamiento:", response.gastos_financiamiento);

                    // Buscar la fila específica en gastos por datos_bal
                    const gastoTargetRow = this.findRowByDatosBal(gastosData, "Gastos de financiamiento");

                    if (gastoTargetRow) {
                        console.log("Fila de 'Gastos de financiamiento' encontrada:", gastoTargetRow);

                        // Limpiar children existentes y agregar nueva estructura completa
                        gastoTargetRow.children = [response.gastos_financiamiento];

                        // Actualizar la tabla con setData
                        this.gastoTable.setData(gastosData).then(() => {
                            console.log("Gastos completos insertados correctamente");

                            // Expandir la sección actualizada y sus primeros 2 niveles
                            this.expandRowByDatosBal(this.gastoTable, "Gastos de financiamiento", 2);
                        });
                    } else {
                        console.warn("No se encontró la fila 'Gastos de financiamiento' en la tabla de gastos");
                    }
                }

                Swal.fire({
                    icon: "success",
                    title: "Datos insertados",
                    text: "Se cargaron las estructuras de Ingresos y Gastos de Financiamiento",
                });
            },
            error: (xhr) => {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: xhr.responseJSON?.message || "No se encontró el balance",
                });
            }
        });
    }

    // Buscar fila en los datos de la tabla por el campo datos_bal
    findRowByDatosBal(data, targetValue) {
        const searchInData = (items) => {
            for (let item of items) {
                if (item.datos_bal && this.normalizeText(item.datos_bal) === this.normalizeText(targetValue)) {
                    return item;
                }

                if (item.children && Array.isArray(item.children)) {
                    const found = searchInData(item.children);
                    if (found) return found;
                }
            }
            return null;
        };

        return searchInData(data);
    }

    // Método principal para insertar datos en sección de financiamiento
    insertIntoFinancingSection(table, currentData, newData, sectionName) {
        console.log(`Insertando datos en sección: ${sectionName}`);

        // Buscar la fila padre de financiamiento
        const financingParentRow = this.findFinancingParentRow(currentData, sectionName);

        if (!financingParentRow) {
            console.warn(`No se encontró la sección: ${sectionName}`);
            return;
        }

        console.log(`Sección encontrada:`, financingParentRow);

        // Limpiar datos existentes en la sección de financiamiento
        this.clearFinancingSectionData(financingParentRow);

        // Insertar nuevos datos
        this.insertNewFinancingData(financingParentRow, newData);

        // Actualizar la tabla con los datos modificados
        table.replaceData(currentData).then(() => {
            console.log(`Datos de ${sectionName} actualizados correctamente`);

            // Expandir la sección recién actualizada
            this.expandFinancingSection(table, sectionName);
        });
    }

    // Buscar la fila padre de financiamiento en los datos
    findFinancingParentRow(data, sectionName) {
        const searchInData = (items) => {
            for (let item of items) {
                // Buscar por diferentes campos posibles
                if (this.matchesFinancingSection(item, sectionName)) {
                    return item;
                }

                // Búsqueda recursiva en children
                if (item.children && Array.isArray(item.children)) {
                    const found = searchInData(item.children);
                    if (found) return found;
                }
            }
            return null;
        };

        return searchInData(data);
    }

    // Verificar si una fila coincide con la sección de financiamiento
    matchesFinancingSection(item, sectionName) {
        const fieldsToCheck = ['datos_bal', 'nombre', 'descripcion', 'title', 'label'];

        return fieldsToCheck.some(field => {
            if (item[field]) {
                const fieldValue = item[field].toString().toLowerCase();
                const searchValue = sectionName.toLowerCase();

                // Coincidencia exacta o contiene el texto
                return fieldValue.includes(searchValue) ||
                    fieldValue.includes(searchValue.replace(/\s+/g, '')) ||
                    this.normalizeText(fieldValue).includes(this.normalizeText(searchValue));
            }
            return false;
        });
    }

    // Normalizar texto para comparaciones más flexibles
    normalizeText(text) {
        return text.toLowerCase()
            .replace(/[áàäâ]/g, 'a')
            .replace(/[éèëê]/g, 'e')
            .replace(/[íìïî]/g, 'i')
            .replace(/[óòöô]/g, 'o')
            .replace(/[úùüû]/g, 'u')
            .replace(/ñ/g, 'n')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Limpiar datos existentes en la sección de financiamiento
    clearFinancingSectionData(financingParentRow) {
        // Limpiar children existentes pero mantener la estructura del padre
        if (financingParentRow.children) {
            financingParentRow.children = [];
        }

        console.log("Datos de financiamiento limpiados");
    }

    // Insertar nuevos datos de financiamiento
    insertNewFinancingData(financingParentRow, newData) {
        if (!financingParentRow.children) {
            financingParentRow.children = [];
        }

        // Agregar nuevos datos como children
        financingParentRow.children.push(...newData);

        console.log("Nuevos datos de financiamiento insertados:", newData);
    }

    // Expandir la sección de financiamiento después de la actualización
    expandFinancingSection(table, sectionName) {
        // Esperar un poco para que la tabla se actualice
        setTimeout(() => {
            const rows = table.getRows();

            rows.forEach(row => {
                const rowData = row.getData();

                if (this.matchesFinancingSection(rowData, sectionName)) {
                    // Expandir esta fila y sus primeros niveles
                    row.treeExpand().then(() => {
                        console.log(`Sección ${sectionName} expandida`);

                        // Expandir también los primeros niveles de children
                        const childRows = row.getTreeChildren();
                        childRows.forEach(childRow => {
                            if (this.hasChildren(childRow.getData())) {
                                childRow.treeExpand();
                            }
                        });
                    });
                }
            });
        }, 100);
    }

    extractParentNodes(data) {
        const result = [];

        const processNode = (node) => {
            // Crear copia del nodo sin children
            const parentNode = {
                ...node,
                children: undefined
            };

            result.push(parentNode);

            // Si tiene hijos, procesarlos recursivamente
            if (node.children && Array.isArray(node.children)) {
                node.children.forEach(child => processNode(child));
            }
        };

        if (Array.isArray(data)) {
            data.forEach(item => processNode(item));
        } else {
            processNode(data);
        }

        return result;
    }

    // Función auxiliar para verificar si un nodo tiene hijos
    hasChildren(rowData) {
        return rowData.children && Array.isArray(rowData.children) && rowData.children.length > 0;
    }

    // Función auxiliar para expandir niveles específicos del árbol
    expandTreeLevels(table, maxLevel) {
        const expandLevel = (rows, currentLevel) => {
            if (currentLevel >= maxLevel) return;

            rows.forEach(row => {
                const rowData = row.getData();

                if (this.hasChildren(rowData)) {
                    row.treeExpand().then(() => {
                        // Expandir siguiente nivel
                        const childRows = row.getTreeChildren();
                        expandLevel(childRows, currentLevel + 1);
                    });
                }
            });
        };

        // Comenzar desde el nivel raíz
        const rootRows = table.getRows().filter(row => row.getTreeParent() === false);
        expandLevel(rootRows, 0);
    }

    // Método alternativo para cargar datos de forma incremental
    loadIncrementalData(tableInstance, newData) {
        return new Promise((resolve, reject) => {
            try {
                tableInstance.updateOrAddData(newData, "id").then(() => {
                    console.log("Datos cargados incrementalmente");
                    resolve();
                }).catch(reject);
            } catch (error) {
                reject(error);
            }
        });
    }

    // Método para limpiar y recargar datos
    clearAndReloadData(tableInstance, newData) {
        return new Promise((resolve, reject) => {
            try {
                tableInstance.clearData().then(() => {
                    return tableInstance.setData(newData);
                }).then(() => {
                    console.log("Datos recargados completamente");
                    resolve();
                }).catch(reject);
            } catch (error) {
                reject(error);
            }
        });
    }

    // Función para manejar la expansión automática basada en criterios
    autoExpandBasedOnCriteria(table, criteria = {}) {
        const {
            expandAll = false,
            expandLevels = 1,
            expandByField = null,
            expandByValue = null
        } = criteria;

        if (expandAll) {
            table.getRows().forEach(row => {
                if (this.hasChildren(row.getData())) {
                    row.treeExpand();
                }
            });
            return;
        }

        if (expandLevels > 0) {
            this.expandTreeLevels(table, expandLevels);
            return;
        }

        if (expandByField && expandByValue) {
            table.getRows().forEach(row => {
                const rowData = row.getData();
                if (rowData[expandByField] === expandByValue && this.hasChildren(rowData)) {
                    row.treeExpand();
                }
            });
        }
    }

    configTable() {
        const self = this;
        const TableConfig = {
            colors: {
                hierarchyLevels: {
                    0: '#800080', // Purple - Nivel raíz
                    1: '#FF0000', // Red
                    2: '#0000FF', // Blue
                    3: '#008000', // Green
                    4: '#000000', // Black
                    5: '#666666'  // Gray
                },
                backgrounds: {
                    0: '#f8f4ff', // Light purple
                    1: '#fff4f4', // Light red
                    2: '#f4f4ff', // Light blue
                    3: '#f4fff4', // Light green
                    4: '#ffffff', // White
                    5: '#f9f9f9'  // Light gray
                }
            },

            utils: {
                // 🔹 Método robusto para obtener nivel del árbol en Tabulator 6.x
                getTreeLevel: function (row) {
                    // Verificaciones de seguridad
                    if (!row) {
                        console.warn('TableConfig: row is null or undefined');
                        return 0;
                    }

                    // Verificar si el método existe (compatibilidad v6)
                    if (typeof row.getTreeParent !== 'function') {
                        console.warn('TableConfig: getTreeParent method not available');
                        return 0;
                    }

                    let level = 0;
                    let parent = row.getTreeParent();

                    // Protección contra bucles infinitos
                    const maxDepth = 50;
                    while (parent && level < maxDepth) {
                        level++;
                        parent = parent.getTreeParent();
                    }

                    return level;
                },

                // 🔹 Verificar si tiene hijos con validaciones mejoradas
                hasChildren: function (row) {
                    if (!row) return false;

                    // Verificar múltiples métodos según la versión
                    if (typeof row.getTreeChildren === 'function') {
                        const children = row.getTreeChildren();
                        return children && Array.isArray(children) && children.length > 0;
                    }

                    // Fallback para versiones anteriores o diferentes configuraciones
                    if (row._row && row._row.modules && row._row.modules.tree) {
                        return row._row.modules.tree.children && row._row.modules.tree.children.length > 0;
                    }

                    return false;
                },

                // 🔹 Verificar nietos con manejo de errores
                hasGrandchildren: function (row) {
                    try {
                        if (!this.hasChildren(row)) return false;

                        const children = row.getTreeChildren();
                        if (!Array.isArray(children)) return false;

                        return children.some(child => {
                            try {
                                return this.hasChildren(child);
                            } catch (e) {
                                console.warn('Error checking grandchildren:', e);
                                return false;
                            }
                        });
                    } catch (error) {
                        console.warn('Error in hasGrandchildren:', error);
                        return false;
                    }
                },

                // 🔹 Obtener color jerárquico con manejo de errores
                getHierarchyColor: function (row, rowData) {
                    try {
                        // Verificar fila de descripción
                        if (rowData && rowData.isDescriptionRow) {
                            return '#666666';
                        }

                        const level = this.getTreeLevel(row);

                        // Validar que el nivel sea un número
                        if (typeof level !== 'number' || level < 0) {
                            console.warn('Invalid tree level:', level);
                            return TableConfig.colors.hierarchyLevels[0];
                        }

                        switch (level) {
                            case 0:
                                return TableConfig.colors.hierarchyLevels[0];
                            case 1:
                                return TableConfig.colors.hierarchyLevels[1];
                            case 2:
                                return TableConfig.colors.hierarchyLevels[2];
                            case 3:
                                return this.hasChildren(row)
                                    ? TableConfig.colors.hierarchyLevels[3]
                                    : TableConfig.colors.hierarchyLevels[4];
                            case 4:
                                return TableConfig.colors.hierarchyLevels[4];
                            default:
                                return TableConfig.colors.hierarchyLevels[5];
                        }
                    } catch (error) {
                        //console.error('Error getting hierarchy color:', error);
                        return TableConfig.colors.hierarchyLevels[0]; // Color por defecto
                    }
                },

                // 🔹 Obtener color de fondo con validaciones
                getBackgroundColor: function (row) {
                    try {
                        const level = this.getTreeLevel(row);

                        if (typeof level !== 'number' || level < 0) {
                            return TableConfig.colors.backgrounds[0];
                        }

                        return TableConfig.colors.backgrounds[level] || TableConfig.colors.backgrounds[4];
                    } catch (error) {
                        console.error('Error getting background color:', error);
                        return TableConfig.colors.backgrounds[0];
                    }
                },

                // 🔹 Método de depuración para identificar problemas
                debugRowInfo: function (row) {
                    if (!row) {
                        console.log('DEBUG: Row is null/undefined');
                        return;
                    }

                    console.log('DEBUG Row Info:', {
                        hasGetTreeParent: typeof row.getTreeParent === 'function',
                        hasGetTreeChildren: typeof row.getTreeChildren === 'function',
                        level: this.getTreeLevel(row),
                        hasChildren: this.hasChildren(row),
                        rowData: row.getData ? row.getData() : 'No getData method'
                    });
                }
            }
        };

        // 🔹 Verificación de compatibilidad al cargar
        if (typeof window !== 'undefined' && window.Tabulator) {
            console.log('Tabulator version detected:', window.Tabulator.prototype.constructor.version || 'Unknown');

            // Test básico de compatibilidad
            const testCompatibility = function () {
                console.log('TableConfig loaded successfully for Tabulator 6.x');
            };

            // Ejecutar test cuando DOM esté listo
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', testCompatibility);
            } else {
                testCompatibility();
            }
        }

        // function loadDataBalances(nombre_balance) {
        //     console.log("Buscando balance:", nombre_balance);

        //     $.ajax({
        //         url: "/obtener-listado-balance",
        //         type: "POST",
        //         data: JSON.stringify({ nombre_balance }),
        //         contentType: "application/json",
        //         dataType: "json",
        //         headers: {
        //             "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
        //         },
        //         success: (response) => {
        //             console.log("Balance encontrado:", response);

        //             // PROCESAR INGRESOS - Solo nodos padre
        //             if (response.ingresos_financiamiento) {
        //                 console.log(response.ingresos_financiamiento);
        //                 const ingresosParent = this.extractParentNodes(response.ingresos_financiamiento);

        //                 // Insertar datos en tabla de ingresos
        //                 this.ingresoTable.replaceData(ingresosParent).then(() => {
        //                     console.log("Ingresos padre insertados:", ingresosParent);

        //                     // Opcional: Expandir primer nivel automáticamente
        //                     this.ingresoTable.getRows().forEach(row => {
        //                         if (this.hasChildren(row.getData())) {
        //                             row.treeExpand();
        //                         }
        //                     });
        //                 });
        //             }

        //             // PROCESAR GASTOS - Estructura completa
        //             if (response.gastos_financiamiento) {
        //                 // Insertar datos completos en tabla de gastos
        //                 this.gastoTable.replaceData([response.gastos_financiamiento]).then(() => {
        //                     console.log("Gastos completos insertados:", response.gastos_financiamiento);

        //                     // Expandir automáticamente los primeros 2 niveles
        //                     this.expandTreeLevels(this.gastoTable, 2);
        //                 });
        //             }

        //             Swal.fire({
        //                 icon: "success",
        //                 title: "Datos insertados",
        //                 text: "Se cargaron las estructuras de Ingresos y Gastos de Financiamiento",
        //             });
        //         },
        //         error: (xhr) => {
        //             Swal.fire({
        //                 icon: "error",
        //                 title: "Error",
        //                 text: xhr.responseJSON?.message || "No se encontró el balance",
        //             });
        //         }
        //     });
        // }

        // Column definitions for both tables
        const columnas = [
            {
                title: "Concepto",
                field: "datos_bal",
                editor: "input",
                width: 100,
                headerSort: false,
                responsive: 0,
                formatter: function (cell, formatterParams, onRendered) {
                    const rowData = cell.getData();
                    const value = cell.getValue();
                    const color = TableConfig.utils.getHierarchyColor(cell.getRow(), rowData);

                    const isBold = (rowData.descripcion &&
                        rowData.descripcion !== "Descripcion" &&
                        !rowData.isDescriptionRow) ||
                        TableConfig.utils.hasChildren(rowData);

                    return `<span style="color: ${color}; font-weight: ${isBold ? 'bold' : 'normal'};">${value || ''}</span>`;
                },
                cellClick: function (e, cell) {
                    const rowData = cell.getData();
                    console.log("Fila seleccionada:", rowData);
                    if (rowData.datos_bal === "Gastos de financiamiento") {
                        // Lanzamos SweetAlert2 con input
                        Swal.fire({
                            title: "Buscar Balance",
                            text: `Coloca el nombre del balance para buscarlo (ejemplo: ${rowData.datos_bal})`,
                            input: "text",
                            inputValue: rowData.datos_bal, // valor inicial = texto de la fila
                            showCancelButton: true,
                            confirmButtonText: "Buscar",
                            cancelButtonText: "Cancelar",
                        }).then((result) => {
                            if (result.isConfirmed && result.value) {
                                // Llamamos a la función con el valor ingresado
                                self.loadDataBalances(result.value);
                            }
                        });
                    }
                }
            },
            {
                title: "act",
                width: 60,
                headerSort: false,
                formatter: () => `
                    <button class="add-row text-green-600 hover:scale-125">➕</button>
                    <button class="delete-row text-red-600 hover:scale-125">🗑️</button>
                `,
                cellClick: function (e, cell) {
                    const row = cell.getRow();
                    const target = e.target;

                    const action = target.classList.contains('add-row') ? 'add' :
                        target.classList.contains('delete-row') ? 'delete' : null;

                    if (!action) return;

                    try {
                        const parentRow = row;
                        const parentData = parentRow.getData();
                        const parentItem = parentData.item || "";
                        const parentChildren = parentRow.getTreeChildren() || [];

                        if (action === 'add') {
                            const nextNumber = (parentChildren.length + 1).toString().padStart(2, '0');
                            const newItem = parentItem ? `${parentItem}.${nextNumber}` : nextNumber;

                            const newRow = {
                                id: Date.now(),
                                item: newItem,
                                datos_bal: "Nuevo Item",
                                registro: 0,
                                total: 0,
                                ene: 0, feb: 0, mar: 0, abr: 0, may: 0, jun: 0,
                                jul: 0, ago: 0, sep: 0, oct: 0, nov: 0, dic: 0,
                                children: []
                            };

                            parentRow.addTreeChild(newRow);
                        }

                        if (action === 'delete') {
                            const parent = row.getTreeParent();
                            row.delete();

                            // Si hay un padre, renumerar hijos hermanos
                            if (parent) {
                                const siblings = parent.getTreeChildren().filter(s => {
                                    const sData = s.getData();
                                    return sData.item && !sData.isDescriptionRow;
                                });

                                siblings.forEach((sibling, index) => {
                                    const sData = sibling.getData();
                                    const base = (sData.item || "").split(".").slice(0, -1).join(".");
                                    const newNum = (index + 1).toString().padStart(2, '0');
                                    const newItem = base ? `${base}.${newNum}` : newNum;
                                    sibling.update({ item: newItem });
                                });
                            }
                        }
                    } catch (error) {
                        console.error("Error al procesar acción:", error);
                    }
                }
            },
            {
                title: "Reg",
                field: "registro",
                editor: "input",
            },
            {
                title: "Imagen",
                field: "imagen",
                width: 80,
                minWidth: 60,
                headerSort: false,
                responsive: 0,
                resizable: false,
                formatter: function (cell) {
                    const value = cell.getValue();
                    if (!value) {
                        return '<button class="upload-btn" title="Subir imagen">📷</button>';
                    }
                    return `<img src="${value}" alt="Imagen" style="width:40px;height:40px;object-fit:cover;border-radius:4px;cursor:pointer;" onclick="openImageModal('${value}')">`;
                },
                cellClick: function (e, cell) {
                    e.stopPropagation();
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.accept = 'image/*';
                    fileInput.onchange = function (event) {
                        const file = event.target.files[0];
                        if (file) {
                            // Validación de tamaño (máximo 2MB)
                            if (file.size > 2 * 1024 * 1024) {
                                alert('La imagen es muy grande. Máximo 2MB.');
                                return;
                            }

                            const reader = new FileReader();
                            reader.onload = function (e) {
                                // Actualizar celda sin perder posición
                                cell.setValue(e.target.result);

                                // Mantener fila seleccionada y visible
                                const row = cell.getRow();
                                row.select();
                                row.scrollTo();
                            };
                            reader.readAsDataURL(file);
                        }
                    };
                    fileInput.click();
                }
            },
            {
                title: "ENERO",
                field: "ene",
                hozAlign: "right",
                editor: "input",
                headerSort: false,
                width: 70,
                resizable: false,
                formatter: "money",
                formatterParams: { precision: 2 },
                bottomCalc: "sum",
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: { precision: 2 }
            },
            {
                title: "FEBRERO",
                field: "feb",
                hozAlign: "right",
                editor: "input",
                headerSort: false,
                width: 70,
                resizable: false,
                formatter: "money",
                formatterParams: { precision: 2 },
                bottomCalc: "sum",
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: { precision: 2 }
            },
            {
                title: "MARZO",
                field: "mar",
                hozAlign: "right",
                editor: "input",
                headerSort: false,
                width: 70,
                resizable: false,
                formatter: "money",
                formatterParams: { precision: 2 },
                bottomCalc: "sum",
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: { precision: 2 }
            },
            {
                title: "ABRIL",
                field: "abr",
                hozAlign: "right",
                editor: "input",
                headerSort: false,
                width: 70,
                resizable: false,
                formatter: "money",
                formatterParams: { precision: 2 },
                bottomCalc: "sum",
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: { precision: 2 }
            },
            {
                title: "MAYO",
                field: "may",
                hozAlign: "right",
                editor: "input",
                headerSort: false,
                width: 70,
                resizable: false,
                formatter: "money",
                formatterParams: { precision: 2 },
                bottomCalc: "sum",
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: { precision: 2 }
            },
            {
                title: "JUNIO",
                field: "jun",
                hozAlign: "right",
                editor: "input",
                headerSort: false,
                width: 70,
                resizable: false,
                formatter: "money",
                formatterParams: { precision: 2 },
                bottomCalc: "sum",
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: { precision: 2 }
            },
            {
                title: "JULIO",
                field: "jul",
                hozAlign: "right",
                editor: "input",
                headerSort: false,
                width: 70,
                resizable: false,
                formatter: "money",
                formatterParams: { precision: 2 },
                bottomCalc: "sum",
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: { precision: 2 }
            },
            {
                title: "AGOSTO",
                field: "ago",
                hozAlign: "right",
                editor: "input",
                headerSort: false,
                width: 70,
                resizable: false,
                formatter: "money",
                formatterParams: { precision: 2 },
                bottomCalc: "sum",
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: { precision: 2 }
            },
            {
                title: "SEPTIEMBRE",
                field: "sep",
                hozAlign: "right",
                editor: "input",
                headerSort: false,
                width: 90,
                resizable: false,
                formatter: "money",
                formatterParams: { precision: 2 },
                bottomCalc: "sum",
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: { precision: 2 }
            },
            {
                title: "OCTUBRE",
                field: "oct",
                hozAlign: "right",
                editor: "input",
                headerSort: false,
                width: 90,
                resizable: false,
                formatter: "money",
                formatterParams: { precision: 2 },
                bottomCalc: "sum",
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: { precision: 2 }
            },
            {
                title: "NOVIEMBRE",
                field: "nov",
                hozAlign: "right",
                editor: "input",
                headerSort: false,
                width: 100,
                resizable: false,
                formatter: "money",
                formatterParams: { precision: 2 },
                bottomCalc: "sum",
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: { precision: 2 }
            },
            {
                title: "DICIEMBRE",
                field: "dic",
                hozAlign: "right",
                editor: "input",
                headerSort: false,
                width: 90,
                resizable: false,
                formatter: "money",
                formatterParams: { precision: 2 },
                bottomCalc: "sum",
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: { precision: 2 }
            },
            {
                title: "TOTAL",
                field: "total",
                hozAlign: "right",
                headerSort: false,
                width: 70,
                resizable: false,
                formatter: "money",
                formatterParams: { precision: 2 },
                bottomCalc: "sum",
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams: { precision: 2 }
            }
        ];

        // Configuration for Ingresos table
        this.ingresoTable = new Tabulator("#tabla-ingresos", {
            height: "auto",
            virtualDom: true,
            renderVerticalBuffer: 800,
            layout: "fitColumns",

            // Configuración del árbol
            dataTree: true,
            dataTreeChildField: "children",
            dataTreeStartExpanded: [true, true], // Expandir primeros 2 niveles

            // Cálculos
            columnCalcs: "both",

            // Persistencia
            persistence: {
                tree: true,
                columns: true
            },

            columns: columnas
                .filter(col => col.title !== "Imagen"), // 👈 Ocultamos Imagen

            // Row formatter mejorado para DataTree
            rowFormatter: function (row) {
                const rowData = row.getData();
                const element = row.getElement();

                // Aplicar color de fondo
                const backgroundColor = TableConfig.utils.getBackgroundColor(row);
                element.style.backgroundColor = backgroundColor;

                // Obtener nivel y aplicar clases
                const level = TableConfig.utils.getTreeLevel(row);
                element.classList.add(`hierarchy-level-${level}`);

                // Clase especial para filas con hijos
                if (TableConfig.utils.hasChildren(row)) {
                    element.classList.add('has-children');
                }

                // Clase para descripción
                if (rowData.isDescriptionRow) {
                    element.classList.add('description-row');
                }

                // Agregar padding visual basado en el nivel
                const firstCell = element.querySelector('.tabulator-cell:first-child');
                if (firstCell) {
                    const paddingLeft = 10 + (level * 15); // 15px por cada nivel
                    firstCell.style.paddingLeft = `${paddingLeft}px`;
                }
            },

            // Callback para cuando se expande/colapsa
            dataTreeRowExpanded: function (row, level) {
                // Opcional: lógica adicional cuando se expande
                console.log("Expandido:", row.getData(), "Nivel:", level);
            },

            dataTreeRowCollapsed: function (row, level) {
                // Opcional: lógica adicional cuando se colapsa
                console.log("Colapsado:", row.getData(), "Nivel:", level);
            }
        });

        // Configuration for Gastos table
        this.gastoTable = new Tabulator("#tabla-gastos", {
            // --- Renderizado y Rendimiento Visual ---
            height: "auto", // ¡Importante! Usar una altura fija en píxeles para que el Virtual DOM funcione correctamente. "100%" requiere un contenedor padre con altura definida.
            virtualDom: true, // Esencial para el rendimiento. Mantenlo en true.
            renderVerticalBuffer: 800, // Aumenta el búfer para un scroll más suave en tablas con muchas filas. 800px es un buen punto de partida.
            layout: "fitColumns", // 'fitColumns' suele ser más rápido que 'fitDataTable'. Para un rendimiento máximo, define anchos fijos en cada columna.

            // --- Configuración del Árbol de Datos (Data Tree) ---
            dataTree: true, // Habilita la vista de árbol.
            dataTreeChildField: "children", // Campo que contiene los hijos.
            dataTreeStartExpanded: [true, true], // ¡Cambio clave! No expandir todo al inicio. Esto mejora drásticamente el tiempo de carga inicial. El usuario expandirá lo que necesite.

            // --- Cálculos ---
            // Habilita los cálculos en las columnas y en los grupos del árbol.
            columnCalcs: "both", // 'true' calcula solo el total. 'both' calcula para grupos y el total general.

            // --- Módulo de Persistencia ---
            persistence: {
                tree: true, // ¡Magia! Guarda el estado de expansión del árbol
            },
            columns: columnas,
            data: this.dataGenerales.gastos,
        });

        // Estados
        this.estadoTable = new Tabulator("#tabla-estado", {
            layout: "fitDataTable",
            maxHeight: "100%",
            columns: columnas.filter(col => {
                return col.title !== "act" && col.title !== "Reg" && col.title !== "Imagen";
            }).map(col => ({
                ...col,
                editable: false,
                width: col.field === "datos_bal" ? 295 : col.width,
                responsive: 0,
                frozen: col.field === "datos_bal",
                cellStyle: (cell) => {
                    // Ajusta el padding según sea necesario
                    if (cell.getColumn().getField() === "datos_bal") {
                        return { padding: "10px" };  // Aplica padding a la celda
                    }
                    return {};  // Mantén los estilos por defecto para otras celdas
                }
            })),
        });

        // Resumen
        this.resumenTable = new Tabulator("#tabla-resumen", {
            layout: "fitDataTable",
            maxHeight: "100%",
            columns: columnas.filter(col => {
                return col.title !== "act" && col.title !== "Reg" && col.title !== "Imagen";
            }).map(col => ({
                ...col,
                editable: false,
                width: col.field === "datos_bal" ? 295 : col.width,
                responsive: 0,
                frozen: col.field === "datos_bal",
                cellStyle: (cell) => {
                    // Ajusta el padding según sea necesario
                    if (cell.getColumn().getField() === "datos_bal") {
                        return { padding: "10px" };  // Aplica padding a la celda
                    }
                    return {};  // Mantén los estilos por defecto para otras celdas
                }
            })),
        });

        // Calcular datos iniciales
        this.calculateEstado();
        this.calculateResumen();
    }

    setupCalculationEvents() {
        const tables = [this.ingresoTable, this.gastoTable];
        tables.forEach(table => {
            table.on("cellEdited", cell => {
                const row = cell.getRow();
                this.updateRowTotal(row);
                this.recalculateHierarchy(row);
                this.calculateEstado();
                this.calculateResumen();
                this.graficoResumen(); // Actualizar gráfico cuando hay cambios
            });
        });
    }

    recalculateHierarchy(startRow) {
        let currentRow = startRow;
        while (currentRow) {
            const parentRow = currentRow.getTreeParent();
            if (parentRow) {
                this.calculateParentTotals(parentRow);
            }
            currentRow = parentRow;
        }
    }

    calculateParentTotals(parentRow) {
        const children = parentRow.getTreeChildren();
        const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

        let totals = {
            total: 0
        };
        months.forEach(month => totals[month] = 0);

        children.forEach(child => {
            const childData = child.getData();
            months.forEach(month => {
                totals[month] = this.addPrecise(totals[month], Number(childData[month] || 0));
            });
        });

        // Calcular el total de todos los meses
        totals.total = months.reduce((sum, month) => {
            return this.addPrecise(sum, totals[month]);
        }, 0);

        // Actualizar solo los valores calculados, preservando el registro
        const currentData = parentRow.getData();
        parentRow.update({
            ...currentData,
            ...totals,
            registro: currentData.registro // Mantener el valor original del registro
        });
    }

    updateRowTotal(row) {
        const rowData = row.getData();
        const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

        // Solo calcular el total si es una fila hoja (sin hijos)
        if (!row.getTreeChildren().length) {
            const total = months.reduce((sum, month) => {
                return this.addPrecise(sum, Number(rowData[month] || 0));
            }, 0);

            row.update({ total: total });
        }
    }

    addPrecise(a, b) {
        // Usar una precisión de 2 decimales para cálculos monetarios
        const result = Math.round((Number(a) + Number(b)) * 100) / 100;
        return parseFloat(result.toFixed(2));
    }

    calculateEstado() {
        const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

        // Obtener datos directamente de las tablas principales
        const ingresosData = this.ingresoTable.getData();
        const gastosData = this.gastoTable.getData();

        // Inicializar acumuladores
        let acumuladoInversion = 0;
        let acumuladoFinanciamiento = 0;

        const estadoCuenta = {
            id: 'estado-1',
            datos_bal: "Estado de cuenta",
            registro: "",
            total: 0
        };

        const diferenciaBalances = {
            id: 'estado-2',
            datos_bal: "Diferencia de balances",
            registro: "",
            total: 0
        };

        // Calcular valores mensuales
        meses.forEach(mes => {
            // Buscar valores en los datos
            const ingresosInversion = this.findValueInChildren(ingresosData, "INGRESOS DE INVERSION", mes);
            const gastosInversion = this.findValueInChildren(gastosData, "Gastos de inversion", mes);
            const ingresosFinanciamiento = this.findValueInChildren(ingresosData, "INGRESOS DE FINANCIAMIENTO", mes);
            const gastosFinanciamiento = this.findValueInChildren(gastosData, "Gastos de financiamiento", mes);

            // Actualizar acumulados
            acumuladoInversion = this.addPrecise(acumuladoInversion, this.addPrecise(ingresosInversion, gastosInversion));
            acumuladoFinanciamiento = this.addPrecise(acumuladoFinanciamiento, this.addPrecise(ingresosFinanciamiento, gastosFinanciamiento));

            // Asignar valores a los objetos
            estadoCuenta[mes] = acumuladoInversion;
            diferenciaBalances[mes] = acumuladoFinanciamiento;
        });

        // Actualizar totales
        estadoCuenta.total = acumuladoInversion;
        diferenciaBalances.total = acumuladoFinanciamiento;
        // Actualizar tabla
        this.estadoTable.setData([estadoCuenta, diferenciaBalances]);
    }

    findValueInChildren(data, labelToFind, month) {
        if (!Array.isArray(data)) return 0;

        const searchLabel = (labelToFind || "").toLowerCase().trim();

        for (const item of data) {
            const currentLabel = (item.datos_bal || "").toLowerCase().trim();

            // Si coincide exactamente con el label buscado
            if (currentLabel === searchLabel) {
                return Number(item[month]) || 0;
            }

            // Buscar recursivamente en hijos
            const children = item.children || item._children;
            if (Array.isArray(children) && children.length > 0) {
                const value = this.findValueInChildren(children, labelToFind, month);
                if (value !== 0) {
                    return value;
                }
            }
        }

        return 0; // No encontrado
    }

    calculateResumen() {
        const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
        const monto2023 = 0; // Puedes ajustar este valor según necesites

        // Obtener datos de las tablas
        const ingresosData = this.ingresoTable.getData();
        const gastosData = this.gastoTable.getData();

        // Inicializar objetos para cálculos
        const ingresos = {};
        const gastosTotales = {};
        const saldoAhorroNeto = {};
        const ahorroNeto = {};

        // Calcular valores mensuales
        meses.forEach((mes, index) => {
            ingresos[mes] = this.sumMonthValues(ingresosData, mes);
            gastosTotales[mes] = this.sumMonthValues(gastosData, mes);
            saldoAhorroNeto[mes] = this.addPrecise(ingresos[mes], gastosTotales[mes]);

            if (index === 0) {
                ahorroNeto[mes] = this.addPrecise(monto2023, saldoAhorroNeto[mes]);
            } else {
                ahorroNeto[mes] = this.addPrecise(ahorroNeto[meses[index - 1]], saldoAhorroNeto[mes]);
            }
        });

        // Crear datos del resumen
        const resumenData = [
            {
                id: 'resumen-1',
                datos_bal: "Monto2023",
                registro: "",
                ...meses.reduce((acc, mes) => ({ ...acc, [mes]: mes === 'ene' ? monto2023 : 0 }), {}),
                total: monto2023
            },
            {
                id: 'resumen-2',
                datos_bal: "Ingresos",
                registro: "",
                ...ingresos,
                total: Object.values(ingresos).reduce((sum, val) => this.addPrecise(sum, val), 0)
            },
            {
                id: 'resumen-3',
                datos_bal: "Gastos",
                registro: "",
                ...gastosTotales,
                total: Object.values(gastosTotales).reduce((sum, val) => this.addPrecise(sum, val), 0)
            },
            {
                id: 'resumen-4',
                datos_bal: "Saldo",
                registro: "",
                ...saldoAhorroNeto,
                total: Object.values(saldoAhorroNeto).reduce((sum, val) => this.addPrecise(sum, val), 0)
            },
            {
                id: 'resumen-5',
                datos_bal: "Ahorro Neto",
                registro: "",
                ...ahorroNeto,
                total: ahorroNeto[meses[meses.length - 1]]
            }
        ];

        // Actualizar tabla
        this.resumenTable.setData(resumenData);
    }

    sumMonthValues(data, month) {
        let sum = 0;
        for (const item of data) {
            if (item._children) {
                for (const child of item._children) {
                    sum = this.addPrecise(sum, Number(child[month] || 0));
                }
            } else {
                sum = this.addPrecise(sum, Number(item[month] || 0));
            }
        }
        return sum;
    }

    graficoResumen() {
        const meses = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
        const container = document.getElementById('grafico-resumen');

        if (!container) return;

        // Obtener datos
        const ingresosData = this.ingresoTable.getData()[0] || {};
        const gastosData = this.gastoTable.getData()[0] || {};
        const resumenData = this.resumenTable.getData();

        // Preparar series
        const series = [
            {
                name: 'Ingresos',
                type: 'bar',
                stack: 'total',
                data: meses.map(mes => ingresosData[mes.toLowerCase()] || 0),
                itemStyle: { color: '#91CC75' }
            },
            {
                name: 'Gastos',
                type: 'bar',
                stack: 'total',
                data: meses.map(mes => gastosData[mes.toLowerCase()] || 0),
                itemStyle: { color: '#EE6666' }
            },
            {
                name: 'Saldo Acumulado',
                type: 'line',
                smooth: true,
                data: meses.map((_, index) => {
                    return resumenData.find(item => item.datos_bal === "Ahorro Neto")?.[meses[index].toLowerCase()] || 0;
                }),
                itemStyle: { color: '#5470C6' }
            }
        ];

        // Configurar opciones
        const option = {
            title: {
                text: 'Balance General',
                left: 'center',
                textStyle: {
                    color: this.isDarkMode() ? '#ffffff' : '#333333'
                }
            },
            tooltip: {
                trigger: 'axis',
                formatter: (params) => {
                    let result = `${params[0].axisValue}<br/>`;
                    params.forEach(param => {
                        result += `${param.seriesName}: ${this.formatMoney(param.value)}<br/>`;
                    });
                    return result;
                }
            },
            legend: {
                data: ['Ingresos', 'Gastos', 'Saldo Acumulado'],
                top: '30px'
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: meses
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    formatter: (value) => this.formatMoney(value)
                }
            },
            series: series
        };

        // Inicializar o actualizar gráfico
        if (!this.chart) {
            this.chart = echarts.init(container);
        }
        this.chart.setOption(option);

        // Manejar responsive
        window.addEventListener('resize', () => this.chart.resize());
    }

    isDarkMode() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    formatMoney(value) {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2
        }).format(value);
    }

    initializeEventListeners() {
        $('#guardar').on('click', () => this.saveData());
    }

    loadData() {
        const id_contabilidad = $("#id_contabilidad").val(); // Obtener el ID del balance

        $.ajax({
            url: "/obtener-balance-real",
            type: "POST",
            data: JSON.stringify({ id_contabilidad }), // Enviar el ID
            contentType: "application/json",
            dataType: "json",
            headers: {
                "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
            },
            success: (response) => {
                if (response.status === "success" && response.data) {
                    // Guardar los datos en dataGenerales
                    this.dataGenerales = {
                        ingresos: response.data.ingresos || [
                            {
                                id: 1,
                                abr: 0,
                                ago: 0,
                                dic: 0,
                                ene: 0,
                                feb: 0,
                                jul: 0,
                                jun: 0,
                                mar: 0,
                                may: 0,
                                nov: 0,
                                oct: 0,
                                sep: 0,
                                total: 0,
                                registro: "123",
                                _children: [
                                    {
                                        id: 2,
                                        abr: 0,
                                        ago: 0,
                                        dic: 0,
                                        ene: 0,
                                        feb: 0,
                                        jul: 0,
                                        jun: 0,
                                        mar: 0,
                                        may: 0,
                                        nov: 0,
                                        oct: 0,
                                        sep: 0,
                                        total: 0,
                                        registro: "123",
                                        datos_bal: "INGRESOS GENERALES"
                                    },
                                    {
                                        id: 3,
                                        abr: 0,
                                        ago: 0,
                                        dic: 0,
                                        ene: 0,
                                        feb: 0,
                                        jul: 0,
                                        jun: 0,
                                        mar: 0,
                                        may: 0,
                                        nov: 0,
                                        oct: 0,
                                        sep: 0,
                                        total: 0,
                                        registro: "123",
                                        datos_bal: "INGRESOS DE INVERSION"
                                    },
                                    {
                                        id: 4,
                                        abr: 0,
                                        ago: 0,
                                        dic: 0,
                                        ene: 0,
                                        feb: 0,
                                        jul: 0,
                                        jun: 0,
                                        mar: 0,
                                        may: 0,
                                        nov: 0,
                                        oct: 0,
                                        sep: 0,
                                        total: 0,
                                        registro: "123",
                                        datos_bal: "INGRESOS DE FINANCIAMIENTO"
                                    }
                                ],
                                datos_bal: "INGRESOS TOTALES",
                            }
                        ],
                        gastos: response.data.gastos || [
                            {
                                id: 5,
                                abr: 0,
                                ago: 0,
                                dic: 0,
                                ene: 1214.00,
                                feb: -500.00,
                                jul: 0,
                                jun: 0,
                                mar: 0,
                                may: 2,
                                nov: 0,
                                oct: 0,
                                sep: 0,
                                total: 714.00,
                                registro: "126",
                                _children: [
                                    {
                                        id: 6,
                                        abr: 0,
                                        ago: 0,
                                        dic: 0,
                                        ene: 0,
                                        feb: 0,
                                        jul: 0,
                                        jun: 0,
                                        mar: 0,
                                        may: 0,
                                        nov: 0,
                                        oct: 0,
                                        sep: 0,
                                        total: 0,
                                        registro: "123",
                                        datos_bal: "Gastos operativos"
                                    },
                                    {
                                        id: 7,
                                        abr: 0,
                                        ago: 0,
                                        dic: 0,
                                        ene: 1214.00,
                                        feb: -500.00,
                                        jul: 0,
                                        jun: 0,
                                        mar: 0,
                                        may: 0,
                                        nov: 0,
                                        oct: 0,
                                        sep: 0,
                                        total: 714.00,
                                        registro: "123",
                                        _children: [
                                            {
                                                id: 8,
                                                abr: 0,
                                                ago: 0,
                                                dic: 0,
                                                ene: 12,
                                                feb: 0,
                                                jul: 0,
                                                jun: 0,
                                                mar: 0,
                                                may: 0,
                                                nov: 0,
                                                oct: 0,
                                                sep: 0,
                                                total: 0,
                                                registro: "123",
                                                datos_bal: "cargos"
                                            },
                                            {
                                                id: 9,
                                                abr: 0,
                                                ago: 0,
                                                dic: 0,
                                                ene: 1200,
                                                feb: -500,
                                                jul: 0,
                                                jun: 0,
                                                mar: 0,
                                                may: 0,
                                                nov: 0,
                                                oct: 0,
                                                sep: 0,
                                                total: 0,
                                                registro: "123",
                                                datos_bal: "mantenimiento"
                                            },
                                            {
                                                id: 10,
                                                abr: 0,
                                                ago: 0,
                                                dic: 0,
                                                ene: 2,
                                                feb: 0,
                                                jul: 0,
                                                jun: 0,
                                                mar: 0,
                                                may: 0,
                                                nov: 0,
                                                oct: 0,
                                                sep: 0,
                                                total: 0,
                                                registro: "123",
                                                datos_bal: "Ventilaciones"
                                            }
                                        ],
                                        datos_bal: "Gastos de inversion"
                                    },
                                    {
                                        id: 11,
                                        abr: 0,
                                        ago: 0,
                                        dic: 0,
                                        ene: 0,
                                        feb: 0,
                                        jul: 0,
                                        jun: 0,
                                        mar: 0,
                                        may: 0,
                                        nov: 0,
                                        oct: 0,
                                        sep: 0,
                                        registro: "123",
                                        datos_bal: "Gastos de financiamiento"
                                    }
                                ],
                                datos_bal: "GASTOS TOTALES",
                            },
                        ],
                        estado: response.data.estado || [],
                        resumen: response.data.resumen || []
                    };

                    // Cargar los datos en las tablas
                    this.ingresoTable.setData(this.dataGenerales.ingresos);
                    this.gastoTable.setData(this.dataGenerales.gastos);
                    this.estadoTable.setData(this.dataGenerales.estado);
                    this.resumenTable.setData(this.dataGenerales.resumen);

                    // Actualizar cálculos y gráficos
                    this.calculateEstado();
                    this.calculateResumen();
                    this.graficoResumen();
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: "No se encontraron datos para este balance."
                    });
                }
            },
            error: (xhr, status, error) => {
                console.error("Error al cargar datos:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "No se pudieron cargar los datos del balance."
                });
            }
        });
    }

    // loadDataBalances(nombre_balance) {
    //     console.log("datos de la fila :", nombre_balance);
    //     $.ajax({
    //         url: "/obtener-listado-balance",
    //         type: "POST",
    //         data: JSON.stringify({ nombre_balance }),
    //         contentType: "application/json",
    //         dataType: "json",
    //         headers: {
    //             "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
    //         },
    //         success: (response) => {
    //             console.log("Balance encontrado:", response);

    //             // if (response.status === "success" && response.data) {

    //             //     // Cargar los datos en las tablas
    //             //     this.ingresoTable.setData(this.dataGenerales.ingresos);
    //             //     this.gastoTable.setData(this.dataGenerales.gastos);
    //             //     this.estadoTable.setData(this.dataGenerales.estado);
    //             //     this.resumenTable.setData(this.dataGenerales.resumen);

    //             //     // Actualizar cálculos y gráficos
    //             //     this.calculateEstado();
    //             //     this.calculateResumen();
    //             //     this.graficoResumen();
    //             // } else {
    //             //     Swal.fire({
    //             //         icon: "error",
    //             //         title: "Error",
    //             //         text: "No se encontraron datos para este balance."
    //             //     });
    //             // }
    //         },
    //         error: (xhr, status, error) => {
    //             console.error("Error al cargar datos:", error);
    //             Swal.fire({
    //                 icon: "error",
    //                 title: "Error",
    //                 text: "No se pudieron cargar los datos del balance."
    //             });
    //         }
    //     });
    // }

    saveData() {
        const id_contabilidad = $("#id_contabilidad").val();
        const requestData = {
            id_contabilidad: id_contabilidad,  // Asegúrate de enviar el ID correcto
            rowData: JSON.stringify({
                ingresos: this.ingresoTable.getData(),
                gastos: this.gastoTable.getData(),
                estado: this.estadoTable.getData(),
                resumen: this.resumenTable.getData()
            })
        };
        console.log(id_contabilidad);
        console.log(requestData);
        const dataActualizar = JSON.stringify(requestData);

        Swal.fire({
            title: '¿Guardar cambios?',
            text: "Se actualizarán los datos del balance",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, guardar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: "/actualizar-balance-real",
                    type: "POST",
                    data: dataActualizar,
                    contentType: "application/json",
                    dataType: "json",
                    headers: {
                        "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
                    },
                    success: (response) => {
                        if (response.status === 'success') {  // ✅ Ahora verifica correctamente
                            Swal.fire({
                                icon: 'success',
                                title: 'Guardado',
                                text: response.message, // ✅ Usa el mensaje del servidor
                                timer: 1500
                            });
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: response.message || 'Error al guardar'
                            });
                        }
                    },
                    error: (xhr, status, error) => {
                        console.error("Error al guardar:", error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'No se pudieron guardar los cambios'
                        });
                    }
                });
            }
        });
    }
}

export default GastoReal;