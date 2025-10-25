// resources/js/core/tabulator.base.js
import { HFCore } from "./hf.js";

/**
 * Clase base para todas las tablas con Tabulator + HyperFormula
 * Maneja la sincronización bidireccional y eventos
 */
export class TableBase {
    constructor(model, sheetName, editable = true) {
        this.sheetName = sheetName;
        this.hf = HFCore.getInstance();
        this.sheetId = HFCore.addSheet(sheetName);

        this.model = model;
        this.editable = editable;
        this.isUpdating = false;
        this.rowIndexMap = new Map(); // row.getIndex() -> rowPosition en HF
        this.nextRowPosition = 0;

        this.table = this._createTable();
        this._bindEvents();
    }

    _createTable() {
        // Use the numeric sheet id assigned when the TableBase was constructed
        const sheetID = this.sheetId;
        const spareRow = this.model.spareRow ?? false;
        const self = this; // optional fallback, but arrow functions are better

        const table = new Tabulator(this.model.id, {
            layout: "fitDataStretch",
            layoutColumnsOnNewData: true,
            columnHeaderVertAlign: "middle",
            headerSortClickElement: "icon",
            selectableRange: true,
            selectableRangeColumns: true,
            selectableRangeClearCells: true,
            editTriggerEvent: "dblclick",
            history: true,
            clipboard: true,
            clipboardCopyConfig: {
                columnHeaders: false,
                columnGroups: false,
                rowHeaders: false,
                rowGroups: false,
                columnCalcs: false,
                dataTree: false,
                formatCells: false,
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
            ...this.model.config,
        });

        // Helper (keep as is, but note: it uses `table` from closure)
        function checkCellEdited(cell) {
            let isEditable = false;
            const columnDef = cell.getColumn().getDefinition();
            if (typeof columnDef.editable === "function") {
                isEditable = columnDef.editable(cell);
            } else {
                isEditable = columnDef.editor !== undefined;
            }
            if (!isEditable) {
                cell.restoreOldValue();
            }
            return isEditable;
        }

        // ✅ Use arrow function to preserve `this`
        table.on("cellEdited", (cell) => {
            const colPos = parseInt(cell.getColumn().getField());
            const rowPos = this._getRowIndex(cell.getRow());
            if (!checkCellEdited(cell)) {
                return;
            }

            if (cell.getRow().getData().spare !== undefined && cell.getValue() !== "") {
                delete cell.getRow().getData().spare;
                table.addRow({ spare: true }, false);
            }

            let address;
            try {
                address = this._makeAddress(sheetID, colPos, rowPos);
            } catch (e) {
                console.warn('Skipping HF update due to invalid address:', e);
                return;
            }

            // Now `this.hf` is valid!
            try {
                if (
                    cell.getValue() != this.hf.getCellValue(address) &&
                    !this.hf.doesCellHaveFormula(address)
                ) {
                    this.hf.setCellContents(address, cell.getValue())
                        .filter((update) => {
                            return (
                                this.hf.simpleCellAddressToString(update.address, update.address.sheet) !== this.hf.simpleCellAddressToString(address, address.sheet)
                            );
                        })
                        .forEach((update) => {
                            const isInSheet = update.sheet === sheetID;
                            if (isInSheet) {
                                table.updateData([
                                    {
                                        id: update.address.row,
                                        [`${update.address.col}`]: update.newValue,
                                    },
                                ]);
                            }
                        });
                }
            } catch (err) {
                console.warn('HF interaction failed in cellEdited:', err);
            }
        });

        table.on("rowAdded", (row) => {
            const lastIndex = table.getRows().length - 1;
            row.update({ id: lastIndex });
            const rowPos = this._getRowIndex(row);

            Object.keys(this.model.formulas ?? {}).forEach((col) => {
                const colPos = parseInt(col);
                let address;
                try {
                    address = this._makeAddress(sheetID, colPos, rowPos);
                } catch (e) {
                    console.warn('Skipping formula set due to invalid address:', e);
                    return;
                }
                const formula = this.model.formulas[colPos](rowPos + 1) ?? "";
                if (formula !== "") {
                    let updates = [];
                    try {
                        updates = this.hf.setCellContents(address, formula);
                    } catch (err) {
                        console.warn('HF setCellContents failed for formula:', err);
                        updates = [];
                    }
                    const updates_filter = updates.filter((update) => {
                        return (
                            this.hf.simpleCellAddressToString(update.address, update.address.sheet) ===
                            this.hf.simpleCellAddressToString(address, address.sheet)
                        );
                    });
                    updates_filter.forEach((update) => {
                        table.updateData([
                            {
                                id: update.address.row,
                                [`${update.address.col}`]: update.newValue,
                            },
                        ]);
                    });
                }
            });

            if (row.getData().spare !== undefined) {
                return;
            }

            row.getCells().forEach((cell) => {
                const colPos = parseInt(cell.getColumn().getField());
                let address;
                try {
                    address = this._makeAddress(sheetID, colPos, rowPos);
                } catch (e) {
                    console.warn('Skipping HF update due to invalid address:', e);
                    return;
                }
                try {
                    if (!this.hf.doesCellHaveFormula(address)) {
                        this.hf.setCellContents(address, cell.getValue())
                            .filter((update) => {
                                return (
                                    this.hf.simpleCellAddressToString(update.address, update.address.sheet) !==
                                    this.hf.simpleCellAddressToString(address, address.sheet)
                                );
                            })
                            .forEach((update) => {
                                table.updateData([
                                    {
                                        id: update.address.row,
                                        [`${update.address.col}`]: update.newValue,
                                    },
                                ]);
                            });
                    }
                } catch (err) {
                    console.warn('HF interaction failed in rowAdded:', err);
                }
            });
        });

        table.on("clipboardPasted", (clipboard, rowData, rows) => {
            if (clipboard.charAt(clipboard.length - 1) === "\n") {
                rowData = rowData.slice(0, rowData.length - 1);
            }
            let index = 0;
            let repeat = 0;
            for (; index < rows.length; index++) {
                Object.entries(rowData[repeat]).forEach(([colPos, value]) => {
                    if (rows[index].getData().spare !== undefined) {
                        delete rows[index].getData().spare;
                    }
                    const cell = rows[index].getCell(colPos);
                    if (checkCellEdited(cell.component) && value !== "") {
                        cell.setValue(value + " ");
                    }
                });
                repeat = (repeat + 1) % rowData.length;
            }
            if (rowData.length > rows.length && spareRow) {
                table.addRow(rowData.slice(index));
                table.addRow({ spare: true }, false);
            }
        });

        table.on("tableBuilt", () => {
            if (this.model.data !== undefined) {
                table.addRow(this.model.data);
                table.clearHistory();
            }
            if (spareRow) {
                table.addRow({ spare: true }, false);
            }
        });

        table["spareRow"] = spareRow;

        return table;
    }

    _bindEvents() {
        if (this.editable) {
            this._bindCellEdit();
            this._bindClipboard();
        }

        this.table.on("rowAdded", (row) => this._onRowAdded(row));
        this.table.on("tableBuilt", () => this._onTableBuilt());
        this.table.on("rowDeleted", (row) => this._onRowDeleted(row));
    }

    /**
     * Crea y valida un SimpleCellAddress para HyperFormula
     * @param {number} sheet
     * @param {number} col
     * @param {number} row
     */
    _makeAddress(sheet, col, row) {
        const s = Number(sheet);
        const c = Number(col);
        const r = Number(row);

        if (!Number.isFinite(s) || !Number.isFinite(c) || !Number.isFinite(r)) {
            throw new Error(`Invalid cell address: sheet=${sheet}, col=${col}, row=${row}`);
        }

        // HyperFormula expects non-negative integers
        if (!Number.isInteger(s) || !Number.isInteger(c) || !Number.isInteger(r) || s < 0 || c < 0 || r < 0) {
            throw new Error(`Invalid cell address (must be non-negative integers): sheet=${s}, col=${c}, row=${r}`);
        }

        return { sheet: s, col: c, row: r };
    }

    _bindCellEdit() {
        this.table.on("cellEdited", (cell) => {
            if (this.isUpdating) return;
            if (!this._isCellEditable(cell)) {
                cell.restoreOldValue();
                return;
            }

            const colField = cell.getColumn().getField();
            const colPos = parseInt(colField, 10);
            if (isNaN(colPos)) {
                console.warn("Skipping non-numeric column:", colField);
                return;
            }

            const rowPos = this._getRowIndex(cell.getRow());
            const value = cell.getValue();

            this._updateCell(rowPos, colPos, value);
        });
    }

    _bindClipboard() {
        this.table.on("clipboardPasted", (clipboard, rowData, rows) => {
            this.isUpdating = true;

            if (clipboard.endsWith("\n")) rowData = rowData.slice(0, -1);

            let repeat = 0;
            rows.forEach((row) => {
                const rowIndex = this._getRowIndex(row);

                Object.entries(rowData[repeat]).forEach(([col, value]) => {
                    const cell = row.getCell(col);
                    if (!cell) return;

                    if (this._isCellEditable(cell.component) && value !== "")
                        this._updateCell(rowIndex, parseInt(col), value, true);
                });

                repeat = (repeat + 1) % rowData.length;
            });

            // Agregar filas adicionales si hay más datos que filas
            if (rowData.length > rows.length) {
                const extra = rowData.slice(rows.length);
                extra.forEach((data) => {
                    this.table.addRow(data);
                });
            }

            this.recalculateAll();
            this.isUpdating = false;
        });
    }

    _onRowAdded(row) {
        const rowPos = this._getRowIndex(row);

        // Aplicar valores iniciales
        row.getCells().forEach((cell) => {
            const col = parseInt(cell.getColumn().getField());
            const val = cell.getValue();
            if (val !== "" && val !== null && val !== undefined) {
                this._updateCell(rowPos, col, val, true);
            }
        });
    }

    _onRowDeleted(row) {
        // Accept RowComponent or plain object
        let rowIndex = null;
        if (row && typeof row.getIndex === 'function') {
            try { rowIndex = row.getIndex(); } catch (e) { rowIndex = null; }
        } else if (row && typeof row.getData === 'function') {
            const d = row.getData();
            if (d && d.id !== undefined) rowIndex = d.id;
        } else if (row && row.id !== undefined) {
            rowIndex = row.id;
        }

        if (rowIndex !== null && this.rowIndexMap.has(rowIndex)) {
            this.rowIndexMap.delete(rowIndex);
        }
    }

    _onTableBuilt() {
        if (Array.isArray(this.model.data) && this.model.data.length) {
            this.setData(this.model.data);
        }
    }

    _isCellEditable(cell) {
        const colDef = cell.getColumn().getDefinition();
        return typeof colDef.editable === "function"
            ? colDef.editable(cell)
            : colDef.editor !== undefined;
    }

    /**
     * Obtiene índice lógico consecutivo para HyperFormula
     */
    _getRowIndex(row) {
        // Accept different shapes: numeric index, Tabulator RowComponent, or plain object
        let rowId = null;

        if (typeof row === 'number') {
            rowId = row;
        } else if (row && typeof row.getIndex === 'function') {
            try {
                rowId = row.getIndex();
            } catch (e) {
                rowId = null;
            }
        } else if (row && typeof row.getData === 'function') {
            const d = row.getData();
            if (d && (d.id !== undefined)) rowId = d.id;
        } else if (row && row.id !== undefined) {
            rowId = row.id;
        }

        // If we still don't have an id, attach a synthetic id to the row object so it remains stable
        if (rowId === null || rowId === undefined) {
            if (row && typeof row === 'object') {
                if (row.__tbRowId === undefined) {
                    row.__tbRowId = this.nextRowPosition;
                    this.nextRowPosition++;
                }
                rowId = row.__tbRowId;
            } else {
                // Fallback to nextRowPosition and increment
                rowId = this.nextRowPosition;
                this.nextRowPosition++;
            }
        }

        if (!this.rowIndexMap.has(rowId)) {
            this.rowIndexMap.set(rowId, this.rowIndexMap.size);
        }

        return this.rowIndexMap.get(rowId);
    }

    /**
     * Garantiza que la hoja tenga suficientes filas antes de escribir
     */
    _ensureHFRowExists(rowIndex) {
        try {
            const sheetSize = this.hf.getSheetDimensions(this.sheetId).height;
            if (rowIndex >= sheetSize) {
                this.hf.addRows(this.sheetId, [[null]], rowIndex);
            }
        } catch (e) {
            console.warn('Error ensuring row exists:', e);
        }
    }

    /**
     * Actualiza una celda en HyperFormula
     */
    _updateCell(row, col, value, skipRecalc = false) {
        try {
            this._ensureHFRowExists(row);
            let address;
            try {
                address = this._makeAddress(this.sheetId, col, row);
            } catch (e) {
                console.warn('Invalid HF address in _updateCell:', e);
                return;
            }

            try {
                if (typeof value === "string" && value.startsWith("=")) {
                    this.hf.setCellContents(address, value);
                } else if (!this.hf.doesCellHaveFormula(address)) {
                    this.hf.setCellContents(address, [[value]]);
                }
            } catch (err) {
                console.warn('HF setCellContents failed in _updateCell:', err);
            }

            if (!skipRecalc) this.recalculateAll();
        } catch (err) {
            console.error("Error actualizando celda:", err);
        }
    }

    /**
     * Recalcula y sincroniza datos desde HyperFormula a Tabulator
     */
    recalculateAll() {
        try {
            const sheetData = this.hf.getSheetValues(this.sheetId);

            if (!Array.isArray(sheetData) || sheetData.length === 0) {
                return;
            }

            // Mapear datos de HF a estructura de Tabulator
            const updates = [];

            const rows = this.table.getRows();
            rows.forEach((rowComponent) => {
                // Try several ways to obtain a stable row identifier
                let rowId = null;
                if (rowComponent && typeof rowComponent.getIndex === 'function') {
                    rowId = rowComponent.getIndex();
                } else if (rowComponent && typeof rowComponent.getData === 'function') {
                    const d = rowComponent.getData();
                    rowId = d?.id ?? d?.id === 0 ? d.id : null;
                } else if (rowComponent && rowComponent.id !== undefined) {
                    rowId = rowComponent.id;
                }

                if (rowId === null || rowId === undefined) return;

                const hfRowIndex = this.rowIndexMap.get(rowId);
                if (hfRowIndex === undefined || hfRowIndex >= sheetData.length) return;

                const hfRow = sheetData[hfRowIndex];
                if (!hfRow) return;

                const rowData = rowComponent.getData ? rowComponent.getData() : {};
                const updatedRow = { ...rowData };
                let hasChanges = false;

                hfRow.forEach((value, colIdx) => {
                    if (value !== null && value !== undefined) {
                        const currentValue = rowData[colIdx];
                        if (currentValue !== value) {
                            updatedRow[colIdx] = value;
                            hasChanges = true;
                        }
                    }
                });

                if (hasChanges) {
                    updates.push({ id: rowId, data: updatedRow });
                }
            });

            // Aplicar actualizaciones en lote
            if (updates.length > 0) {
                this.isUpdating = true;
                updates.forEach(update => {
                    const row = this.table.getRow(update.id);
                    if (row) {
                        row.update(update.data);
                    }
                });
                this.isUpdating = false;
            }

        } catch (err) {
            console.error("Error en recalculateAll:", err);
        }
    }

    /**
     * Obtiene todos los datos de la tabla
     */
    getData() {
        return this.table.getData();
    }

    /**
     * Establece datos en la tabla
     */
    setData(data) {
        this.isUpdating = true;

        // Limpiar mapeos
        this.rowIndexMap.clear();
        this.nextRowPosition = 0;

        // Limpiar hoja de HyperFormula
        try {
            this.hf.clearSheet(this.sheetId);
        } catch (e) {
            console.warn('Error clearing sheet:', e);
        }

        // Establecer datos en Tabulator
        this.table.setData(data);

        // Poblar HyperFormula con los datos
        data.forEach((row, i) => {
            Object.entries(row).forEach(([field, val]) => {
                if (!isNaN(field) && val !== null && val !== undefined && val !== '') {
                    this._updateCell(i, parseInt(field), val, true);
                }
            });
        });

        this.isUpdating = false;
        this.recalculateAll();
    }

    /**
     * Agrega una fila vacía
     */
    addRow(data = {}) {
        return this.table.addRow(data);
    }

    /**
     * Elimina una fila
     */
    deleteRow(row) {
        this.table.deleteRow(row);
    }

    /**
     * Limpia todos los datos
     */
    clearData() {
        this.table.clearData();
        this.rowIndexMap.clear();
        this.nextRowPosition = 0;
        try {
            this.hf.clearSheet(this.sheetId);
        } catch (e) {
            console.warn('Error clearing sheet:', e);
        }
    }

    /**
     * Destruye la tabla y limpia recursos
     */
    destroy() {
        this.table.destroy();
        HFCore.removeSheet(this.sheetId);
    }
}