// resources/js/core/metrado.base.js
import { TableBase } from "./tabulator.base.js";

/**
 * Clase base abstracta para todos los metrados
 * Implementa la lógica común de numeración y estructura jerárquica
 * Cada metrado específico debe extender esta clase
 */
export class MetradoBase extends TableBase {
    constructor(model, sheetName, options = {}) {
        super(model, sheetName, true);

        this.options = {
            autoNumeration: true,
            hierarchyLevels: 3, // 01, 01.01, 01.01.01
            itemColumn: 0, // Columna de ITEM
            descriptionColumn: 1, // Columna de DESCRIPCIÓN
            unitColumn: 2, // Columna de UNIDAD
            totalColumn: null, // Debe definirse en clase hija
            ...options
        };

        this.resumen = null;
        this.lastResumenData = "";
        this.resumenUpdateTimeout = null;

        this._setupMetradoEvents();
    }

    // ================================
    // MÉTODOS ABSTRACTOS (override requerido)
    // ================================

    /**
     * Debe implementar la lógica específica de cálculo para cada tipo de metrado
     * @param {Object} row - Datos de la fila
     * @returns {number} - Valor calculado
     */
    calculateRowTotal(row) {
        throw new Error("calculateRowTotal() debe ser implementado en la clase hija");
    }

    /**
     * Debe retornar las columnas que contienen fórmulas
     * @returns {Array<number>} - Array de índices de columnas con fórmulas
     */
    getFormulaColumns() {
        return [];
    }

    /**
     * Aplica fórmulas específicas a una fila
     * @param {number} rowIndex - Índice de la fila
     */
    applyFormulasToRow(rowIndex) {
        // Implementar en clase hija
    }

    // ================================
    // SISTEMA DE NUMERACIÓN JERÁRQUICA
    // ================================

    /**
     * Analiza un item y retorna su nivel jerárquico
     * @param {string} item - Ej: "01", "01.01", "01.01.01"
     * @returns {Object} { level, parent, isPartida, isSubpartida, isDetalle }
     */
    parseItemLevel(item) {
        if (!item || typeof item !== 'string') {
            return { level: 0, parent: null, isPartida: false, isSubpartida: false, isDetalle: true };
        }

        const parts = item.split('.');
        const level = parts.length;

        return {
            level,
            parent: level > 1 ? parts.slice(0, -1).join('.') : null,
            isPartida: level === 1,
            isSubpartida: level === 2,
            isDetalle: level === 3 || level === 0
        };
    }

    /**
     * Genera el siguiente número de item basado en el nivel
     * @param {string} parentItem - Item padre (null para partida principal)
     * @returns {string} - Nuevo item generado
     */
    generateNextItem(parentItem = null, level = 1) {  // level: 1=partida, 2=subpartida, 3=detalle
        const data = this.getData();
        if (level === 3) return '';  // Detalle: item vacío

        if (!parentItem) {
            // Partida principal (01, 02...)
            const partidas = data
                .map(row => row[this.options.itemColumn])
                .filter(item => item && !item.includes('.'))
                .map(item => parseInt(item, 10))
                .filter(num => !isNaN(num));
            const maxPartida = partidas.length > 0 ? Math.max(...partidas) : 0;
            return String(maxPartida + 1).padStart(2, '0');
        } else {
            // Subpartida (01.01, 01.02...)
            const prefix = parentItem + '.';
            const children = data
                .map(row => row[this.options.itemColumn])
                .filter(item => item && item.startsWith(prefix) && item.split('.').length === parentItem.split('.').length + 1)
                .map(item => parseInt(item.split('.').pop(), 10))
                .filter(num => !isNaN(num));
            const maxChild = children.length > 0 ? Math.max(...children) : 0;
            return `${parentItem}.${String(maxChild + 1).padStart(2, '0')}`;
        }
    }

    /**
     * Renumera automáticamente todos los items manteniendo la jerarquía
     */
    autoRenumber() {
        this.isUpdating = true;
        const data = this.getData();
        const counters = {}; // { '': 0, '01': 0, '01.01': 0, ... }

        data.forEach((row, idx) => {
            const currentItem = row[this.options.itemColumn];
            if (!currentItem) return;

            const parsed = this.parseItemLevel(currentItem);
            const parentKey = parsed.parent || '';

            if (!counters[parentKey]) counters[parentKey] = 0;
            counters[parentKey]++;

            const newNumber = String(counters[parentKey]).padStart(2, '0');
            const newItem = parentKey ? `${parentKey}.${newNumber}` : newNumber;

            if (newItem !== currentItem) {
                const tabulatorRow = this.table.getRows()[idx];
                if (tabulatorRow) {
                    tabulatorRow.update({ [this.options.itemColumn]: newItem });
                }
            }
        });

        this.isUpdating = false;
        this.recalculateAll();
    }

    // ================================
    // GESTIÓN DE FILAS
    // ================================

    /**
     * Agrega una nueva partida principal
     */
    addPartida() {
        const newItem = this.generateNextItem(null, 1);
        const newRow = this._createEmptyRow(newItem);
        this.table.addRow(newRow, true);  // Agregar al inicio o final según necesites
        this.applyFormulasToRow(this.getData().length - 1);
        this._scheduleResumenUpdate();
    }
    /**
     * Agrega una subpartida bajo una partida existente
     * @param {string} parentItem - Item de la partida padre
     */
    addSubpartida(parentItem) {
        const newItem = this.generateNextItem(parentItem, 2);
        const newRow = this._createEmptyRow(newItem);
        // Insertar después de la última fila de la partida padre (usa lógica de búsqueda)
        const data = this.getData();
        const parentIndex = data.findIndex(row => row[this.options.itemColumn] === parentItem);
        const insertAfter = this._findLastChildIndex(parentIndex);
        this.table.addRow(newRow, false, insertAfter + 1);
        this.applyFormulasToRow(insertAfter + 1);
        this._scheduleResumenUpdate();
    }

    _findLastChildIndex(parentIndex) {
        const data = this.getData();
        let i = parentIndex + 1;
        while (i < data.length &&
            (data[i][this.options.itemColumn] === '' || data[i][this.options.itemColumn].startsWith(data[parentIndex][this.options.itemColumn] + '.'))) {
            i++;
        }
        return i - 1;
    }
    /**
     * Agrega un detalle (fila sin número de item)
     * @param {string} parentItem - Item de la subpartida padre
     */
    addDetalle(parentItem) {
        const newRow = this._createEmptyRow('');  // Item vacío
        const data = this.getData();
        const parentIndex = data.findIndex(row => row[this.options.itemColumn] === parentItem);
        const insertAfter = this._findLastChildIndex(parentIndex);
        this.table.addRow(newRow, false, insertAfter + 1);
        this.applyFormulasToRow(insertAfter + 1);
        this._scheduleResumenUpdate();
    }

    /**
     * Crea una fila vacía con valores por defecto
     * @param {string} item - Número de item
     * @returns {Object} - Objeto con estructura de fila
     */
    _createEmptyRow(item = '') {
        const row = {
            [this.options.itemColumn]: item,
            [this.options.descriptionColumn]: '',
            [this.options.unitColumn]: 'und.',
        };

        // Valores por defecto para columnas numéricas
        const numericColumns = this._getNumericColumns();
        numericColumns.forEach(col => {
            row[col] = 0;
        });

        return row;
    }

    /**
     * Retorna las columnas que son numéricas (editables)
     * @returns {Array<number>}
     */
    _getNumericColumns() {
        // Implementar en clase hija o detectar automáticamente
        return [];
    }

    // ================================
    // EVENTOS ESPECÍFICOS DE METRADO
    // ================================
    _updateRowStyles(rowComponent) {
        const unit = (rowComponent.getData()[this.options.unitColumn] || '').toLowerCase();
        const cells = rowComponent.getCells();
        const editableColumns = this._getNumericColumns(); // e.g., [3,4,5,6,7] desde tu config

        cells.forEach(cell => {
            const field = parseInt(cell.getField());
            if (editableColumns.includes(field)) {
                const cellElement = cell.getElement();
                // Remover clases previas para evitar acumulación (mejora rendimiento)
                cellElement.classList.remove('bg-yellow-100', 'bg-gray-200', 'bg-white');

                let bgClass = 'bg-white'; // Default

                // Lógica de coloreo basada en unidad (amarillo para editables)
                if (field === this.config.columns.elem) {
                    bgClass = 'bg-yellow-100'; // Siempre editable
                } else if (field === this.config.columns.l && ['m', 'm2', 'm3'].includes(unit)) {
                    bgClass = 'bg-yellow-100';
                } else if (field === this.config.columns.an && ['m2', 'm3'].includes(unit)) {
                    bgClass = 'bg-yellow-100';
                } else if (field === this.config.columns.al && unit === 'm3') {
                    bgClass = 'bg-yellow-100';
                } else if (field === this.config.columns.veces && ['m', 'm2', 'm3', 'kg', 'und.', 'glb'].includes(unit)) {
                    bgClass = 'bg-yellow-100';
                } else {
                    bgClass = 'bg-gray-200'; // No editable (gris)
                }

                cellElement.classList.add(bgClass);
            }
        });
    }

    // Actualiza _setupMetradoEvents para llamar a _updateRowStyles
    _setupMetradoEvents() {
        this.table.on("cellEdited", (cell) => {
            if (this.isUpdating) return;

            const field = parseInt(cell.getColumn().getField());
            const rowIndex = this._getRowIndex(cell.getRow());

            if (field === this.options.unitColumn) {
                this._cleanRowByUnit(rowIndex, cell.getValue());
                this.applyFormulasToRow(rowIndex);
                this._updateRowStyles(cell.getRow());  // Ahora definida, resuelve el error
                this.recalculateAll();
            }

            if (this._getNumericColumns().includes(field)) {
                this.recalculateAll();
            }

            this._scheduleResumenUpdate();
        });

        this.table.on("rowAdded", (row) => {
            if (row.getData().spare) return;
            const rowIndex = this._getRowIndex(row);
            this.applyFormulasToRow(rowIndex);
            this._updateRowStyles(row);  // Aplica coloreo en nueva fila
            this._scheduleResumenUpdate();
        });

        this.table.on("clipboardPasted", () => {
            setTimeout(() => {
                this._reapplyAllFormulas();
                // Reaplicar estilos a todas las filas para consistencia
                this.table.getRows().forEach(row => this._updateRowStyles(row));
                this._scheduleResumenUpdate();
            }, 100);
        });
        this.table.on("rowAdded", (row) => {
            if (row.getData().spare) return;
            const rowIndex = this._getRowIndex(row);
            this.applyFormulasToRow(rowIndex);
            this._scheduleResumenUpdate();
        });

        this.table.on("clipboardPasted", () => {
            setTimeout(() => {
                this._reapplyAllFormulas();
                this._scheduleResumenUpdate();
            }, 100);
        });
    }

    // En MetradoBase (metrado.base.js)
    _cleanRowByUnit(rowIndex, unit) {
        unit = unit.toLowerCase();  // Normalizar a minúsculas
        const row = this.table.getRows()[rowIndex].getData();
        const updates = {};
        const columns = this.config.columns;  // Usa config de la subclase (e.g., COMUNICACIONES)

        // Limpiar (vaciar) columnas no aplicables
        if (!['m', 'm2', 'm3'].includes(unit)) {
            updates[columns.l] = '';  // Vacío si no aplica
        }
        if (!['m2', 'm3'].includes(unit)) {
            updates[columns.an] = '';  // Vacío si no aplica
        }
        if (unit !== 'm3') {
            updates[columns.al] = '';  // Vacío si no aplica
        }
        // Para Veces: Siempre aplica para la mayoría, pero ajusta si necesitas
        if (!['m', 'm2', 'm3', 'kg', 'und.', 'glb'].includes(unit)) {
            updates[columns.veces] = '';  // Vacío si no aplica (raro, pero por completitud)
        }
        // Elem siempre editable, no limpiar

        // Actualizar fila
        this.table.getRows()[rowIndex].update(updates);
        this.recalculateAll();  // Recalcula fórmulas para reflejar vacíos
    }

    recalculateAll() {
        try {
            const sheetData = this.hf.getSheetValues(this.sheetId);
            if (!Array.isArray(sheetData) || sheetData.length === 0) return;

            const updates = [];
            const rows = this.table.getRows();

            rows.forEach((rowComponent) => {
                let rowId = rowComponent.getIndex();  // Usa getIndex() primero
                if (rowId === undefined) {
                    const data = rowComponent.getData();
                    rowId = data.id;  // Fallback a data.id
                }
                if (rowId === undefined) return;  // Skip si no hay ID válido

                const hfRowIndex = this.rowIndexMap.get(rowId);
                if (hfRowIndex === undefined || hfRowIndex >= sheetData.length) return;

                const hfRow = sheetData[hfRowIndex];
                if (!hfRow) return;

                const rowData = rowComponent.getData();
                const updatedRow = { ...rowData };
                let hasChanges = false;

                hfRow.forEach((value, colIdx) => {
                    if (value !== null && value !== undefined && rowData[colIdx] !== value) {
                        updatedRow[colIdx] = value;
                        hasChanges = true;
                    }
                });

                if (hasChanges) {
                    updates.push(updatedRow);  // Acumula actualizaciones sin ID explícito
                }
            });

            // Actualiza en batch (mejor rendimiento, evita errores de row not found)
            if (updates.length > 0) {
                this.isUpdating = true;
                this.table.updateData(updates).catch(err => console.warn('Update error:', err));
                this.isUpdating = false;
            }
        } catch (err) {
            console.error("Error en recalculateAll:", err);
        }
    }

    /**
     * Reaplicar todas las fórmulas a todas las filas
     */
    _reapplyAllFormulas() {
        const data = this.getData();
        data.forEach((_, idx) => this.applyFormulasToRow(idx));
        this.recalculateAll();
    }

    // ================================
    // SISTEMA DE RESUMEN
    // ================================

    /**
     * Programa actualización del resumen con debounce
     */
    _scheduleResumenUpdate() {
        clearTimeout(this.resumenUpdateTimeout);
        this.resumenUpdateTimeout = setTimeout(() => {
            this.updateResumen();
        }, 300);
    }

    /**
     * Actualiza tabla resumen (debe implementarse en clase hija)
     */
    updateResumen() {
        // Implementar en clase hija
    }

    /**
     * Crea tabla resumen si no existe
     */
    createResumen(resumenModel, resumenSheetName) {
        if (!this.resumen) {
            this.resumen = new TableBase(resumenModel, resumenSheetName, false);
        }
        return this.resumen;
    }

    // ================================
    // EXPORTACIÓN DE DATOS
    // ================================

    exportData() {
        return {
            main: this.getData(),
            resumen: this.resumen?.getData() || [],
            metadata: {
                timestamp: new Date().toISOString(),
                sheetName: this.sheetName,
                totalRows: this.getData().length
            }
        };
    }

    importData(data) {
        if (data.main) {
            this.setData(data.main);
        }
        if (data.resumen && this.resumen) {
            this.resumen.setData(data.resumen);
        }
    }

    // ================================
    // UTILIDADES
    // ================================

    /**
     * Obtiene todas las subpartidas de una partida
     * @param {string} partidaItem - Item de la partida (ej: "01")
     * @returns {Array<Object>} - Array de filas que pertenecen a la partida
     */
    getSubpartidas(partidaItem) {
        return this.getData().filter(row => {
            const item = row[this.options.itemColumn];
            return item && item.startsWith(partidaItem + '.') && item.split('.').length === 2;
        });
    }

    /**
     * Obtiene todos los detalles de una subpartida
     * @param {string} subpartidaItem - Item de la subpartida (ej: "01.01")
     * @returns {Array<Object>} - Array de filas detalle
     */
    getDetalles(subpartidaItem) {
        const data = this.getData();
        const detalles = [];
        let collecting = false;

        data.forEach(row => {
            const item = row[this.options.itemColumn];

            if (item === subpartidaItem) {
                collecting = true;
                return;
            }

            if (collecting) {
                if (!item || item === '') {
                    detalles.push(row);
                } else if (item.split('.').length <= subpartidaItem.split('.').length) {
                    collecting = false;
                }
            }
        });

        return detalles;
    }

    /**
     * Suma los totales de las filas detalle de una subpartida
     * @param {string} subpartidaItem - Item de la subpartida
     * @returns {number} - Suma de los totales
     */
    sumDetalles(subpartidaItem) {
        const detalles = this.getDetalles(subpartidaItem);
        return detalles.reduce((sum, row) => {
            const total = parseFloat(row[this.options.totalColumn]) || 0;
            return sum + total;
        }, 0);
    }
}