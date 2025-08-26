class GastoProgramado {
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
                    ene: 0,
                    feb: 0,
                    jul: 0,
                    jun: 0,
                    mar: 0,
                    may: 2,
                    nov: 0,
                    oct: 0,
                    sep: 0,
                    total: 0,
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
                                    id: 8,
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
                                    datos_bal: "cargos"
                                },
                                {
                                    id: 9,
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
                                    datos_bal: "mantenimiento"
                                },
                                {
                                    id: 10,
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
    }

    init() {
        // Create container for both tables
        const container = document.getElementById("table_balance_programado");

        // Función para crear secciones con título y contenido colapsable
        const createSection = (id, titulo) => {
            // Wrapper
            const section = document.createElement("div");
            section.className = "mb-4 border rounded-lg shadow bg-white";

            // Header con botón
            const header = document.createElement("div");
            header.className = "flex items-center justify-between px-4 py-2 cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-t-lg";
            header.innerHTML = `
            <h3 class="font-semibold text-gray-700">${titulo}</h3>
            <button class="toggle-btn text-sm text-blue-600 hover:underline">Contraer</button>
        `;

            // Contenido (donde va Tabulator)
            const content = document.createElement("div");
            content.id = id;
            content.className = "tabulator-container px-2 py-2";

            // Acción de colapsar/expandir
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

        // Crear las secciones
        const ingresosSection = createSection("tabla-ingresos-programado", "Ingresos Programados");
        const gastosSection = createSection("tabla-gastos-programado", "Gastos Programados");
        const estadoSection = createSection("tabla-estado-programado", "Estado de Cuenta");
        const resumenSection = createSection("tabla-resumen-programado", "Resumen General");

        // Append to main container
        container.appendChild(ingresosSection);
        container.appendChild(gastosSection);
        container.appendChild(estadoSection);
        container.appendChild(resumenSection);

        // Configurar e inicializar tablas
        this.configTable();

        // Eventos de cálculo
        this.setupCalculationEvents();

        // Inicializar gráfico
        this.graficoResumen();
    }

    configTable() {
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
        // Column definitions for both tables
        const columnas = [
            {
                title: "",
                field: "datos_bal",
                editor: "input",
                width: 150,
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
                frozen: true
            },
            {
                title: "action",
                width: 60,
                headerSort: false,
                formatter: () => `
                    <button class="add-row-pro text-green-600 hover:scale-125">➕</button>
                    <button class="delete-row-pro text-red-600 hover:scale-125">🗑️</button>
                `,
                cellClick: function (e, cell) {
                    const row = cell.getRow();
                    const target = e.target;

                    const action = target.classList.contains('add-row-pro') ? 'add' :
                        target.classList.contains('delete-row-pro') ? 'delete' : null;

                    if (!action) return;

                    try {
                        const parentRowPro = row;
                        const parentDataPro = parentRowPro.getData();
                        const parentItemPro = parentDataPro.item || "";
                        const parentChildren = parentRowPro.getTreeChildren() || [];

                        if (action === 'add') {
                            const nextNumber = (parentChildren.length + 1).toString().padStart(2, '0');
                            const newItem = parentItemPro ? `${parentItemPro}.${nextNumber}` : nextNumber;

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

                            parentRowPro.addTreeChild(newRow);
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
                title: "REGISTRO",
                field: "registro",
                hozAlign: "right",
                editor: "input",
                headerSort: false,
                width: 89,
                resizable: false,
                frozen: true
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
            },
        ];

        // Configuration for Ingresos table
        this.ingresoTable = new Tabulator("#tabla-ingresos-programado", {
            // --- Renderizado y Rendimiento Visual ---
            height: "auto", // ¡Importante! Usar una altura fija en píxeles para que el Virtual DOM funcione correctamente. "100%" requiere un contenedor padre con altura definida.
            virtualDom: true, // Esencial para el rendimiento. Mantenlo en true.
            renderVerticalBuffer: 800, // Aumenta el búfer para un scroll más suave en tablas con muchas filas. 800px es un buen punto de partida.
            layout: "fitColumns", // 'fitColumns' suele ser más rápido que 'fitDataTable'. Para un rendimiento máximo, define anchos fijos en cada columna.

            // --- Configuración del Árbol de Datos (Data Tree) ---
            dataTree: true, // Habilita la vista de árbol.
            dataTreeChildField: "_children", // Campo que contiene los hijos.
            dataTreeStartExpanded: [true, true], // ¡Cambio clave! No expandir todo al inicio. Esto mejora drásticamente el tiempo de carga inicial. El usuario expandirá lo que necesite.

            // --- Cálculos ---
            // Habilita los cálculos en las columnas y en los grupos del árbol.
            columnCalcs: "both", // 'true' calcula solo el total. 'both' calcula para grupos y el total general.

            // --- Módulo de Persistencia ---
            persistence: {
                tree: true, // ¡Magia! Guarda el estado de expansión del árbol
            },
            columns: columnas,
            data: this.dataGenerales.ingresos,
        });

        // Configuration for Gastos table
        this.gastoTable = new Tabulator("#tabla-gastos-programado", {
            // --- Renderizado y Rendimiento Visual ---
            height: "auto", // ¡Importante! Usar una altura fija en píxeles para que el Virtual DOM funcione correctamente. "100%" requiere un contenedor padre con altura definida.
            virtualDom: true, // Esencial para el rendimiento. Mantenlo en true.
            renderVerticalBuffer: 800, // Aumenta el búfer para un scroll más suave en tablas con muchas filas. 800px es un buen punto de partida.
            layout: "fitColumns", // 'fitColumns' suele ser más rápido que 'fitDataTable'. Para un rendimiento máximo, define anchos fijos en cada columna.

            // --- Configuración del Árbol de Datos (Data Tree) ---
            dataTree: true, // Habilita la vista de árbol.
            dataTreeChildField: "_children", // Campo que contiene los hijos.
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
        this.estadoTable = new Tabulator("#tabla-estado-programado", {
            layout: "fitDataTable",
            maxHeight: "100%",
            columns: columnas.filter(col => col.title !== "accion" && col.title !== "REGISTRO")
                .map(col => ({
                    ...col,
                    editable: false,
                    width: col.field === "datos_bal" ? 295 : col.width,
                    responsive: 0,
                    frozen: col.field === "datos_bal",
                    formatter: (cell) => {
                        let value = cell.getValue();
                        let el = document.createElement("div");
                        el.textContent = value;

                        if (cell.getColumn().getField() === "datos_bal") {
                            el.style.padding = "10px";
                        }
                        return el;
                    }
                })),
            data: this.dataGenerales.ingresos,
        });


        // Resumen
        this.resumenTable = new Tabulator("#tabla-resumen-programado", {
            layout: "fitDataTable",
            maxHeight: "100%",
            columns: columnas.filter(col => col.title !== "accion" && col.title !== "REGISTRO")
                .map(col => ({
                    ...col,
                    editable: false,
                    width: col.field === "datos_bal" ? 295 : col.width,
                    responsive: 0,
                    frozen: col.field === "datos_bal",
                    formatter: (cell) => {
                        let value = cell.getValue();
                        let el = document.createElement("div");
                        el.textContent = value;

                        if (cell.getColumn().getField() === "datos_bal") {
                            el.style.padding = "10px";
                        }
                        return el;
                    }
                })),
            data: this.dataGenerales.resumen,
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

        for (const item of data) {
            if (item.datos_bal === labelToFind) {
                return Number(item[month] || 0);
            }
            if (item._children) {
                const value = this.findValueInChildren(item._children, labelToFind, month);
                if (value !== 0) return value;
            }
        }
        return 0;
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
        const container = document.getElementById('grafico-resumen-programados');

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
                text: 'Balance General Programado',
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
        $('#guardar_balance_programado').on('click', () => this.saveData());
    }

    loadData() {
        const id_contabilidad = $("#id_contabilidad").val(); // Obtener el ID del balance
        $.ajax({
            url: "/obtener-balance-programado",
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
                                ene: 0,
                                feb: 0,
                                jul: 0,
                                jun: 0,
                                mar: 0,
                                may: 2,
                                nov: 0,
                                oct: 0,
                                sep: 0,
                                total: 0,
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
                                                id: 8,
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
                                                datos_bal: "cargos"
                                            },
                                            {
                                                id: 9,
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

    saveData() {
        const id_contabilidad = $("#id_contabilidad").val();
        const requestData = {
            id_contabilidad: id_contabilidad,  // Asegúrate de enviar el ID correcto
            rowDatapro: JSON.stringify({
                ingresos: this.ingresoTable.getData(),
                gastos: this.gastoTable.getData(),
                estado: this.estadoTable.getData(),
                resumen: this.resumenTable.getData()
            })
        };

        const dataActualizar = JSON.stringify(requestData);
        console.log(dataActualizar);
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
                    url: "/actualizar-balance-programado",
                    type: "POST",
                    data: dataActualizar,
                    contentType: "application/json",
                    dataType: "json",
                    headers: {
                        "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content")
                    },
                    success: (response) => {
                        console.log(response);
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

export default GastoProgramado;