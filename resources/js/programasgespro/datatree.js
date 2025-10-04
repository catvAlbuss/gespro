class CoreUtils {
    static initHyperFormula(config = {}) {
        const defaultConfig = {
            licenseKey: "gpl-v3",
            evaluateNullToZero: true,
            useColumnIndex: true,
            chooseAddressMappingPolicy: HyperFormula.AlwaysSparse,
            ...config
        };
        const hf = HyperFormula.buildEmpty(defaultConfig);

        // Limpiar mensajes de error
        const errors = hf._config.translationPackage.errors;
        Object.keys(errors).forEach(error => errors[error] = "");

        return hf;
    }

    static excelColumn(n) {
        let result = "";
        while (n > 0) {
            n--;
            result = String.fromCharCode((n % 26) + 65) + result;
            n = Math.floor(n / 26);
        }
        return result;
    }

    static getHierarchyColor(depth, customColors = null) {
        const colors = customColors || [
            "#9600d1ff", "#0046c7ff", "#a80808ff",
            "#11b835ff", "#000000ff"
        ];
        return colors[depth] || colors[colors.length - 1];
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    static formatCurrency(value) {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value || 0);
    }
}

// ======================================
// TreeDataManager - Gestión de Datos Jerárquicos
// ======================================
class TreeDataManager {
    constructor() {
        this.cache = new Map();
    }

    normalize(data) {
        if (!Array.isArray(data)) return [];

        return data.map(row => {
            const normalized = { ...row };

            if (row.children && Array.isArray(row.children)) {
                normalized._children = this.normalize(row.children);
                delete normalized.children;
            }

            if (!normalized.id) {
                normalized.id = CoreUtils.generateId();
            }

            return normalized;
        });
    }

    denormalize(data) {
        if (!Array.isArray(data)) return [];

        return data.map(row => {
            const denormalized = { ...row };

            if (row._children && Array.isArray(row._children)) {
                denormalized.children = this.denormalize(row._children);
                delete denormalized._children;
            }

            return denormalized;
        });
    }

    renumber(data, parentItem = '', config = {}) {
        if (!Array.isArray(data)) return data;

        const {
            padLength = 2,
            separator = '.',
            skipDescriptions = true
        } = config;

        let counter = 0;

        return data.map(row => {
            const updated = { ...row };

            if (skipDescriptions && row.isDescriptionRow) {
                updated.item = '';
                if (row._children?.length) {
                    updated._children = this.renumber(
                        row._children,
                        parentItem,
                        config
                    );
                }
                return updated;
            }

            counter++;
            const num = counter.toString().padStart(padLength, '0');
            const item = parentItem
                ? `${parentItem}${separator}${num}`
                : num;

            updated.item = item;

            if (row._children?.length) {
                updated._children = this.renumber(
                    row._children,
                    item,
                    config
                );
            }

            return updated;
        });
    }

    getNextItemNumber(parentRow, config = {}) {
        const { padLength = 2, separator = '.' } = config;
        const parentData = parentRow.getData();
        const parentItem = parentData.item || "";

        const siblings = parentRow.getTreeChildren()
            .map(r => r.getData())
            .filter(r => r.item && !r.isDescriptionRow);

        const nextNum = (siblings.length + 1)
            .toString()
            .padStart(padLength, '0');

        return parentItem
            ? `${parentItem}${separator}${nextNum}`
            : nextNum;
    }

    addChild(parentRow, template = {}, config = {}) {
        const { isDescriptionRow = false } = config;
        const parent = parentRow.getData();

        const newItem = isDescriptionRow
            ? ""
            : this.getNextItemNumber(parentRow, config);

        const defaultTemplate = {
            id: CoreUtils.generateId(),
            item: newItem,
            descripcion: isDescriptionRow ? "Descripción" : "Nueva Partida",
            isDescriptionRow,
            _children: []
        };

        const newRow = { ...defaultTemplate, ...template };
        const children = [...(parent._children || []), newRow];

        parentRow.update({ _children: children });

        if (!parentRow.isTreeExpanded()) {
            parentRow.treeExpand();
        }

        return newRow;
    }

    deleteRow(row, table, config = {}) {
        const parent = row.getTreeParent();
        const rowData = row.getData();

        if (config.beforeDelete) {
            const shouldDelete = config.beforeDelete(rowData);
            if (shouldDelete === false) return false;
        }

        row.delete();

        if (parent) {
            const siblings = parent.getTreeChildren();
            const parentItem = parent.getData().item;
            const renumbered = this.renumber(
                siblings.map(r => r.getData()),
                parentItem,
                config
            );
            parent.update({ _children: renumbered });
        } else {
            const roots = table.getRows()
                .filter(r => !r.getTreeParent());
            const renumbered = this.renumber(
                roots.map(r => r.getData()),
                '',
                config
            );
            table.replaceData(renumbered);
        }

        if (config.afterDelete) {
            config.afterDelete(rowData);
        }

        return true;
    }

    moveRow(row, newParent, position = 'child', config = {}) {
        const rowData = row.getData();
        const oldParent = row.getTreeParent();

        if (config.beforeMove) {
            const shouldMove = config.beforeMove(rowData, newParent);
            if (shouldMove === false) return false;
        }

        row.delete();

        if (position === 'child' && newParent) {
            const parentData = newParent.getData();
            const children = [...(parentData._children || []), rowData];
            newParent.update({ _children: children });

            if (!newParent.isTreeExpanded()) {
                newParent.treeExpand();
            }
        }

        const table = row.getTable();
        this._renumberBranch(oldParent, table, config);
        this._renumberBranch(newParent, table, config);

        if (config.afterMove) {
            config.afterMove(rowData, newParent);
        }

        return true;
    }

    _renumberBranch(parent, table, config) {
        if (parent) {
            const siblings = parent.getTreeChildren();
            const parentItem = parent.getData().item;
            const renumbered = this.renumber(
                siblings.map(r => r.getData()),
                parentItem,
                config
            );
            parent.update({ _children: renumbered });
        } else {
            const roots = table.getRows()
                .filter(r => !r.getTreeParent());
            const renumbered = this.renumber(
                roots.map(r => r.getData()),
                '',
                config
            );
            table.replaceData(renumbered);
        }
    }

    getTreeStats(data) {
        let totalRows = 0;
        let maxDepth = 0;
        let leafNodes = 0;

        const traverse = (nodes, depth = 0) => {
            nodes.forEach(node => {
                totalRows++;
                maxDepth = Math.max(maxDepth, depth);

                if (!node._children || node._children.length === 0) {
                    leafNodes++;
                } else {
                    traverse(node._children, depth + 1);
                }
            });
        };

        traverse(data);

        return { totalRows, maxDepth, leafNodes };
    }
}

// ======================================
// FormulaManager - Gestión de Fórmulas con HyperFormula
// ======================================
class FormulaManager {
    constructor(hf, sheetName) {
        this.hf = hf;
        this.sheetName = sheetName;
        this.sheetID = hf.getSheetId(sheetName);
        this.formulaCache = new Map();
    }

    applyFormulas(table, formulas, rowPos) {
        if (!formulas || typeof formulas !== 'object') return;

        Object.entries(formulas).forEach(([colIndex, formulaFn]) => {
            const colPos = parseInt(colIndex);
            const address = { sheet: this.sheetID, col: colPos, row: rowPos };

            try {
                const formula = typeof formulaFn === 'function'
                    ? formulaFn(rowPos + 1)
                    : formulaFn;

                if (formula) {
                    const updates = this.hf.setCellContents(address, formula);
                    this._applyUpdates(table, updates, address);
                }
            } catch (error) {
                console.warn(`Error aplicando fórmula en col ${colPos}, row ${rowPos}:`, error);
            }
        });
    }

    updateCell(table, address, value) {
        if (!this.hf.doesCellHaveFormula(address)) {
            const updates = this.hf.setCellContents(address, value);
            this._applyUpdates(table, updates, address);
        }
    }

    _applyUpdates(table, updates, originAddress) {
        updates
            .filter(update => {
                const updateAddr = this.hf.simpleCellAddressToString(update.address, update.address.sheet);
                const originAddr = this.hf.simpleCellAddressToString(originAddress, originAddress.sheet);
                return updateAddr !== originAddr;
            })
            .forEach(update => {
                if (update.sheet === this.sheetID) {
                    table.updateData([{
                        id: update.address.row,
                        [`${update.address.col}`]: update.newValue,
                    }]);
                }
            });
    }

    clearSheet() {
        this.hf.clearSheet(this.sheetID);
        this.formulaCache.clear();
    }
}

// ======================================
// ColumnBuilder - Constructor de Columnas
// ======================================
class ColumnBuilder {
    constructor(manager, formulaManager) {
        this.manager = manager;
        this.formulaManager = formulaManager;
        this.columns = [];
    }

    addColumn(config) {
        this.columns.push(config);
        return this;
    }

    addItemColumn(config = {}) {
        const defaults = {
            title: "ITEM",
            field: "item",
            width: 150,
            editable: false,
            frozen: true,
            formatter: this._createHierarchyFormatter()
        };

        this.columns.push({ ...defaults, ...config });
        return this;
    }

    addDescriptionColumn(config = {}) {
        const defaults = {
            title: "DESCRIPCIÓN",
            field: "descripcion",
            width: 350,
            editor: "input",
            hozAlign: 'left',
            formatter: this._createHierarchyFormatter()
        };

        this.columns.push({ ...defaults, ...config });
        return this;
    }

    addActionColumn(callbacks = {}) {
        const column = {
            title: "",
            frozen: true,
            headerSort: false,
            formatter: () => `
                <button class="btn-add-child" title="Agregar hijo">➕</button>
                <button class="btn-add-desc" title="Agregar descripción">📝</button>
                <button class="btn-delete" title="Eliminar">🗑️</button>
            `,
            cellClick: (e, cell) => {
                const row = cell.getRow();
                const table = cell.getTable();
                const cls = e.target.className;

                if (cls.includes("btn-add-child")) {
                    if (callbacks.onAddChild) {
                        callbacks.onAddChild(row, table);
                    } else {
                        this.manager.addChild(row);
                    }
                } else if (cls.includes("btn-add-desc")) {
                    if (callbacks.onAddDescription) {
                        callbacks.onAddDescription(row, table);
                    } else {
                        this.manager.addChild(row, {}, { isDescriptionRow: true });
                    }
                } else if (cls.includes("btn-delete")) {
                    if (callbacks.onDelete) {
                        callbacks.onDelete(row, table);
                    } else {
                        this.manager.deleteRow(row, table);
                    }
                }
            }
        };

        this.columns.push(column);
        return this;
    }

    _createHierarchyFormatter() {
        return (cell) => {
            const row = cell.getData();
            const value = cell.getValue() || '';

            if (row.isDescriptionRow) {
                return `<span style="color:#000;font-style:italic">${value}</span>`;
            }

            const depth = (row.item?.match(/\./g) || []).length;
            const color = CoreUtils.getHierarchyColor(depth);
            const isBold = row.descripcion && row.descripcion !== "Descripcion";

            return `<span style="color:${color};font-weight:${isBold ? 'bold' : 'normal'}">${value}</span>`;
        };
    }

    build() {
        return this.columns;
    }
}

// ======================================
// DataTree - Clase Principal
// ======================================
class DataTree {
    constructor(config = {}) {
        this.config = {
            sheetName: 'Sheet1',
            autoRenumber: true,
            enableVirtualDOM: true,
            virtualDomBuffer: 300,
            renderVerticalBuffer: 200,
            ...config
        };

        this.manager = new TreeDataManager();
        this.hf = config.hyperFormula || CoreUtils.initHyperFormula();

        if (!this.hf.getSheetNames().includes(this.config.sheetName)) {
            this.hf.addSheet(this.config.sheetName);
        }

        this.formulaManager = new FormulaManager(this.hf, this.config.sheetName);
        this.table = null;
        this.formulas = {};
    }

    columnBuilder() {
        return new ColumnBuilder(this.manager, this.formulaManager);
    }

    setFormulas(formulas) {
        this.formulas = formulas;
        return this;
    }

    init(element, columns, data = [], options = {}) {
        const normalized = this.manager.normalize(data);

        const defaultOptions = {
            dataTree: true,
            dataTreeChildField: "_children",
            dataTreeStartExpanded: true,
            movableRows: true,
            height: "600px",
            layout: "fitDataStretch",
            layoutColumnsOnNewData: true,
            columnHeaderVertAlign: "middle",
            //editTriggerEvent: "dblclick",
            history: true,
            clipboard: true,
            clipboardCopyConfig: {
                columnHeaders: false,
                rowHeaders: false,
                columnCalcs: false,
            },
            clipboardCopyStyled: false,
            clipboardCopyRowRange: "range",
            clipboardPasteParser: "range",
            clipboardPasteAction: "range",
            columnDefaults: {
                hozAlign: "center",
                headerHozAlign: "center",
                headerWordWrap: true,
                resizable: true,
            },
            virtualDom: this.config.enableVirtualDOM,
            virtualDomBuffer: this.config.virtualDomBuffer,
            renderVerticalBuffer: this.config.renderVerticalBuffer,
            data: normalized,
            columns: columns,
        };

        const finalOptions = { ...defaultOptions, ...options };

        this.table = new Tabulator(element, finalOptions);

        this._setupEvents();

        return this.table;
    }

    _setupEvents() {
        this.table.on("cellEdited", (cell) => this._handleCellEdit(cell));
        this.table.on("rowAdded", (row) => this._handleRowAdd(row));
        this.table.on("rowMoved", CoreUtils.debounce((row) => this._handleRowMove(row), 150));
        this.table.on("dataTreeRowExpanded", (row, level) => {
            if (this.config.onRowExpanded) {
                this.config.onRowExpanded(row, level);
            }
        });
        this.table.on("dataTreeRowCollapsed", (row, level) => {
            if (this.config.onRowCollapsed) {
                this.config.onRowCollapsed(row, level);
            }
        });
    }

    _handleCellEdit(cell) {
        const colPos = parseInt(cell.getColumn().getField());
        const rowPos = parseInt(cell.getRow().getIndex());
        const address = {
            sheet: this.formulaManager.sheetID,
            col: colPos,
            row: rowPos
        };

        this.formulaManager.updateCell(this.table, address, cell.getValue());
    }

    _handleRowAdd(row) {
        const rowPos = parseInt(row.getIndex());
        this.formulaManager.applyFormulas(this.table, this.formulas, rowPos);
    }

    _handleRowMove(row) {
        if (!this.config.autoRenumber) return;

        const data = this.table.getData();
        const renumbered = this.manager.renumber(data);
        this.table.replaceData(renumbered);
    }

    getData() {
        if (!this.table) return [];
        const data = this.table.getData();
        return this.manager.denormalize(data);
    }

    setData(data) {
        if (!this.table) return;
        const normalized = this.manager.normalize(data);
        const renumbered = this.manager.renumber(normalized);
        this.table.replaceData(renumbered);
    }

    addRootRow(template = {}) {
        if (!this.table) return;

        const currentData = this.table.getData();
        const nextNum = (currentData.length + 1)
            .toString()
            .padStart(2, '0');

        const newRow = {
            id: CoreUtils.generateId(),
            item: nextNum,
            descripcion: "Nueva Partida",
            isDescriptionRow: false,
            _children: [],
            ...template
        };

        this.table.addRow(newRow);
    }

    getStats() {
        const data = this.table.getData();
        return this.manager.getTreeStats(data);
    }

    destroy() {
        if (this.table) {
            this.table.destroy();
            this.table = null;
        }
        this.formulaManager.clearSheet();
    }
}

export { DataTree, TreeDataManager, ColumnBuilder, FormulaManager, CoreUtils };