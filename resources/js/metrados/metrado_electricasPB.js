import { createApp, ref, onMounted, onUnmounted } from 'vue';
import data from '../metrados/data.js';
// ==================== CONFIGURACIÓN DE UNIDADES ====================
const UnitConfig = {
    configs: {
        'und': {
            editables: ['elem', 'veces'],
            calculatedFields: ['undc'],
            displayFields: ['elem', 'veces', 'undc'],
            resultField: 'undc',
            showUndcInDetails: true, // NUEVO: mostrar undc en detalles
            formula: (r) => ({ undc: `=D${r}*H${r}` }),
            color: '#FFF9C4'
        },
        'pto': {
            editables: ['elem', 'veces'],
            calculatedFields: ['undc'],
            displayFields: ['elem', 'veces', 'undc'],
            resultField: 'undc',
            showUndcInDetails: true,
            formula: (r) => ({ undc: `=D${r}*H${r}` }),
            color: '#FFF9C4'
        },
        'm': {
            editables: ['elem', 'l', 'an', 'al', 'veces'],
            calculatedFields: ['lon'],
            displayFields: ['elem', 'l', 'an', 'al', 'veces', 'lon'],
            resultField: 'lon',
            showUndcInDetails: false,
            formula: (r) => ({ lon: `=D${r}*(E${r}+F${r}+G${r})*H${r}` }),
            color: '#FFF9C4'
        },
        'm1': {
            editables: ['elem', 'l', 'an', 'al'],
            calculatedFields: ['lon'],
            displayFields: ['elem', 'l', 'lon'],
            resultField: 'lon',
            showUndcInDetails: false,
            formula: (r) => ({ lon: `=D${r}*(E${r}+F${r})*G${r}` }),
            color: '#FFF9C4'
        },
        'm2': {
            editables: ['elem', 'l', 'an', 'al', 'veces'],
            calculatedFields: ['area'],
            displayFields: ['elem', 'l', 'an', 'veces', 'area'],
            resultField: 'area',
            showUndcInDetails: false,
            formula: (r) => ({ area: `=D${r}*E${r}*F${r}*G${r}*H${r}` }),
            color: '#FFF9C4'
        },
        'm3': {
            editables: ['elem', 'l', 'an', 'al', 'veces', 'lon', 'area'],
            calculatedFields: ['vol'],
            displayFields: ['elem', 'l', 'an', 'al', 'veces', 'vol'],
            resultField: 'vol',
            showUndcInDetails: false,
            formula: (r) => ({ vol: `=D${r}*E${r}*F${r}*G${r}*H${r}*I${r}*J${r}` }),
            color: '#FFF9C4'
        },
        'kg': {
            editables: ['kg'],
            calculatedFields: [],
            displayFields: ['kg'],
            formula: (r) => ({}),
            color: '#FFF9C4'
        },
        'gbl': {
            editables: ['elem', 'veces'],
            calculatedFields: ['undc'], // solo este se calcula
            displayFields: ['elem', 'veces', 'undc'], // solo estos se muestran
            formula: (r) => ({ undc: `=D${r}*H${r}` }),
            color: '#FFF9C4'
        }
    },

    getConfig(unit) {
        return this.configs[unit?.toLowerCase()] || null;
    },

    isEditable(unit, field) {
        const config = this.getConfig(unit);
        return config ? config.editables.includes(field) : false;
    },

    shouldDisplay(unit, field) {
        const config = this.getConfig(unit);
        if (!config) return false;
        return config.displayFields.includes(field);
    },

    isCalculated(unit, field) {
        const config = this.getConfig(unit);
        return config ? config.calculatedFields.includes(field) : false;
    },

    getResultField(unit) { // NUEVO método
        const config = this.getConfig(unit);
        return config?.resultField || 'undc' || 'lon';
    },

    showUndcInDetails(unit) { // NUEVO método
        const config = this.getConfig(unit);
        return config?.showUndcInDetails || false;
    },

    getColor(unit) {
        const config = this.getConfig(unit);
        return config?.color || '#ffffffff';
    }
};

// ==================== UTILIDADES ====================
class Utils {
    static generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    static debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    // Parseado de item numérico
    static parseItemNumber(item) {
        if (!item || item === '') return [];
        return item.split('.').filter(n => n !== '').map(n => parseInt(n) || 0);
    }

    // Generar siguiente item en secuencia
    static generateNextItem(parentItem, allRows) {
        if (!parentItem || parentItem === '') {
            // Raíz: buscar el máximo número de primer nivel
            const maxFirst = allRows
                .map(r => this.parseItemNumber(r.item))
                .filter(p => p.length === 1)
                .map(p => p[0])
                .reduce((max, n) => Math.max(max, n), 0);

            return this.formatItem([maxFirst + 1]);
        }

        const parentParts = this.parseItemNumber(parentItem);

        // Buscar hermanos (mismo nivel, mismo padre)
        const siblings = allRows
            .map(r => this.parseItemNumber(r.item))
            .filter(p => {
                if (p.length !== parentParts.length + 1) return false;
                for (let i = 0; i < parentParts.length; i++) {
                    if (p[i] !== parentParts[i]) return false;
                }
                return true;
            });

        const maxSibling = siblings.length > 0
            ? Math.max(...siblings.map(s => s[s.length - 1]))
            : 0;

        return this.formatItem([...parentParts, maxSibling + 1]);
    }

    // Formatear array de números a string de item
    static formatItem(parts) {
        return parts.map(n => String(n).padStart(2, '0')).join('.');
    }

    // Obtener nivel de profundidad del item
    static getItemLevel(item) {
        return this.parseItemNumber(item).length;
    }

    // Verificar si itemA es padre de itemB
    static isParentOf(itemA, itemB) {
        const partsA = this.parseItemNumber(itemA);
        const partsB = this.parseItemNumber(itemB);

        if (partsB.length <= partsA.length) return false;

        for (let i = 0; i < partsA.length; i++) {
            if (partsA[i] !== partsB[i]) return false;
        }

        return true;
    }
}

// ==================== GESTOR DE DATOS ====================
class DataManager {
    constructor() {
        this.rows = [];
        this.rowsById = new Map();
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;
    }

    // Cargar datos iniciales
    loadData(data) {
        this.rows = [];
        this.rowsById.clear();

        data.forEach(d => {
            const row = this.createRow(d);
            this.rows.push(row);
            this.rowsById.set(row.id, row);
        });

        this.saveState();
    }

    // Crear objeto de fila
    createRow(data = {}) {
        return {
            id: data.id || Utils.generateId(),
            item: data.item || '',
            descripcion: data.descripcion || '',
            und: data.und || 'gbl',
            elem: data.elem || '',
            l: data.l || '',
            an: data.an || '',
            al: data.al || '',
            veces: data.veces || '',
            lon: data.lon || '',
            area: data.area || '',
            vol: data.vol || '',
            kg: data.kg || '',
            undc: data.undc || '',
            total: data.total || '',
            // undc: data.undc || '',
            // total: data.total || '',
            isPartida: data.isPartida !== undefined ? data.isPartida : true
        };
    }

    // Guardar estado en historial
    saveState() {
        const state = JSON.parse(JSON.stringify(this.rows));
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(state);

        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
    }

    // Deshacer
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreState(this.history[this.historyIndex]);
            return true;
        }
        return false;
    }

    // Rehacer
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreState(this.history[this.historyIndex]);
            return true;
        }
        return false;
    }

    // Restaurar estado
    restoreState(state) {
        this.rows = JSON.parse(JSON.stringify(state));
        this.rowsById.clear();
        this.rows.forEach(row => {
            this.rowsById.set(row.id, row);
        });
    }

    // Agregar partida (hermana de la seleccionada o raíz)
    addPartida(selectedId = null) {
        let parentItem = '';
        let insertIndex = this.rows.length;

        if (selectedId) {
            const selectedRow = this.rowsById.get(selectedId);
            if (selectedRow) {
                const selectedParts = Utils.parseItemNumber(selectedRow.item);
                if (selectedParts.length > 1) {
                    // Obtener padre (quitar último nivel)
                    parentItem = Utils.formatItem(selectedParts.slice(0, -1));
                }
                // Insertar después de la seleccionada
                insertIndex = this.rows.findIndex(r => r.id === selectedId) + 1;
            }
        }

        const nextItem = Utils.generateNextItem(parentItem, this.rows);
        const row = this.createRow({
            item: nextItem,
            descripcion: 'Nueva Partida',
            und: 'gbl',
            isPartida: true
        });

        this.rows.splice(insertIndex, 0, row);
        this.rowsById.set(row.id, row);
        this.saveState();

        return row;
    }

    // Agregar subpartida (hija de la seleccionada)
    addSubpartida(parentId) {
        const parentRow = this.rowsById.get(parentId);
        if (!parentRow) return null;

        const nextItem = Utils.generateNextItem(parentRow.item, this.rows);
        const parentIndex = this.rows.findIndex(r => r.id === parentId);

        // Buscar última descendiente de parent para insertar después
        let insertIndex = parentIndex + 1;
        for (let i = parentIndex + 1; i < this.rows.length; i++) {
            if (Utils.isParentOf(parentRow.item, this.rows[i].item)) {
                insertIndex = i + 1;
            } else {
                break;
            }
        }

        const row = this.createRow({
            item: nextItem,
            descripcion: 'Nueva Subpartida',
            und: 'und',
            isPartida: false
        });

        this.rows.splice(insertIndex, 0, row);
        this.rowsById.set(row.id, row);
        this.saveState();

        return row;
    }

    addDetalleSubpartida(parentId) {
        const parentRow = this.rowsById.get(parentId);
        if (!parentRow) return null;

        const nextItem = Utils.generateNextItem(parentRow.item, this.rows);
        const parentIndex = this.rows.findIndex(r => r.id === parentId);

        // Buscar última descendiente de parent para insertar después
        let insertIndex = parentIndex + 1;
        for (let i = parentIndex + 1; i < this.rows.length; i++) {
            if (Utils.isParentOf(parentRow.item, this.rows[i].item)) {
                insertIndex = i + 1;
            } else {
                break;
            }
        }

        const row = this.createRow({
            item: '',
            descripcion: 'Nuevo Detalles',
            und: 'und',
            isPartida: false
        });

        this.rows.splice(insertIndex, 0, row);
        this.rowsById.set(row.id, row);
        this.saveState();

        return row;
    }

    // Eliminar filas
    deleteRows(ids) {
        // Eliminar filas y sus descendientes
        const toDelete = new Set(ids);

        ids.forEach(id => {
            const row = this.rowsById.get(id);
            if (row) {
                // Agregar descendientes
                this.rows.forEach(r => {
                    if (Utils.isParentOf(row.item, r.item)) {
                        toDelete.add(r.id);
                    }
                });
            }
        });

        this.rows = this.rows.filter(r => !toDelete.has(r.id));
        toDelete.forEach(id => this.rowsById.delete(id));
        this.saveState();
    }

    // Mover filas
    moveRows(ids, direction) {
        if (ids.length === 0) return false;

        const indices = ids
            .map(id => this.rows.findIndex(r => r.id === id))
            .filter(i => i !== -1)
            .sort((a, b) => a - b);

        if (indices.length === 0) return false;

        if (direction === 'up' && indices[0] === 0) return false;
        if (direction === 'down' && indices[indices.length - 1] === this.rows.length - 1) return false;

        if (direction === 'up') {
            indices.forEach(i => {
                [this.rows[i - 1], this.rows[i]] = [this.rows[i], this.rows[i - 1]];
            });
        } else {
            for (let j = indices.length - 1; j >= 0; j--) {
                const i = indices[j];
                [this.rows[i], this.rows[i + 1]] = [this.rows[i + 1], this.rows[i]];
            }
        }

        this.saveState();
        return true;
    }

    // Copiar filas
    copyRows(ids) {
        return ids
            .map(id => this.rowsById.get(id))
            .filter(row => row)
            .map(row => ({ ...row }));
    }

    // Pegar filas
    pasteRows(copiedRows, afterId = null) {
        const index = afterId
            ? this.rows.findIndex(r => r.id === afterId) + 1
            : this.rows.length;

        copiedRows.forEach((copiedRow, i) => {
            const newRow = this.createRow({
                ...copiedRow,
                id: Utils.generateId(),
                item: '' // Se regenerará
            });

            this.rows.splice(index + i, 0, newRow);
            this.rowsById.set(newRow.id, newRow);
        });

        this.saveState();
    }

    // Actualizar fila
    updateRow(id, updates) {
        const row = this.rowsById.get(id);
        if (row) {
            Object.assign(row, updates);
        }
    }

    // Obtener fila por ID
    getRow(id) {
        return this.rowsById.get(id);
    }

    // Obtener todas las filas
    getAllRows() {
        return this.rows;
    }

    // Exportar datos para servidor
    exportData() {
        return JSON.stringify(this.rows);
    }

    // Importar datos desde servidor
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            this.loadData(data);
            return true;
        } catch (e) {
            console.error('Error importing data:', e);
            return false;
        }
    }
}

// ==================== GESTOR DE FÓRMULAS ====================
class FormulaManager {
    constructor() {
        this.hf = null;
        this.sheetName = 'METRADOS';
        this.sheetId = null;
        this._init();
    }

    _init() {
        try {
            this.hf = HyperFormula.buildEmpty({
                licenseKey: "gpl-v3",
                useColumnIndex: true,
                evaluateNullToZero: true
            });
            this.hf.addSheet(this.sheetName);
            this.sheetId = this.hf.getSheetId(this.sheetName);
        } catch (e) {
            console.error('HyperFormula init error:', e);
        }
    }

    calculate(rows) {
        if (!this.hf || !rows || rows.length === 0) return rows;

        try {
            this.hf.clearSheet(this.sheetId);

            const headers = ['item', 'descripcion', 'und', 'elem', 'l', 'an', 'al',
                'veces', 'lon', 'area', 'vol', 'kg', 'undc', 'total'];

            // Convertir a datos numéricos
            const data = rows.map(r => [
                r.item || '',
                r.descripcion || '',
                r.und || '',
                this.toNumber(r.elem),
                this.toNumber(r.l),
                this.toNumber(r.an),
                this.toNumber(r.al),
                this.toNumber(r.veces),
                this.toNumber(r.lon),
                this.toNumber(r.area),
                this.toNumber(r.vol),
                this.toNumber(r.kg),
                this.toNumber(r.undc),
                this.toNumber(r.total)
            ]);

            this.hf.setSheetContent(this.sheetId, [headers, ...data]);

            // PASO 1: Calcular campos intermedios (lon, area, vol, undc)
            rows.forEach((row, idx) => {
                const rowNum = idx + 2;
                const config = UnitConfig.getConfig(row.und);

                if (config?.formula) {
                    const formulas = config.formula(rowNum);
                    Object.entries(formulas).forEach(([field, formula]) => {
                        const colMap = {
                            lon: 8,
                            area: 9,
                            vol: 10,
                            undc: 12
                        };
                        const col = colMap[field];

                        if (col !== undefined) {
                            this.hf.setCellContents({
                                sheet: this.sheetId,
                                col: col,
                                row: rowNum - 1
                            }, formula);
                        }
                    });
                }
            });

            // PASO 2: Calcular columna TOTAL solo para filas con item (partidas/subpartidas)
            rows.forEach((row, idx) => {
                const rowNum = idx + 2;

                // Si no tiene item, es detalle: NO calcular total
                if (!row.item || row.item === '') {
                    this.hf.setCellContents({
                        sheet: this.sheetId,
                        col: 13, // columna N (total)
                        row: rowNum - 1
                    }, ''); // Dejar vacío
                    return;
                }

                // Tiene item: buscar hijos directos (tanto con item como sin item)
                const childIndices = [];
                for (let i = idx + 1; i < rows.length; i++) {
                    const childRow = rows[i];

                    // Si no tiene item, es detalle hijo directo
                    if (!childRow.item || childRow.item === '') {
                        let directParentIdx = idx;
                        for (let j = i - 1; j >= 0; j--) {
                            if (rows[j].item && rows[j].item !== '') {
                                directParentIdx = j;
                                break;
                            }
                        }
                        if (directParentIdx === idx) {
                            childIndices.push({ rowNum: i + 2, hasItem: false });
                        }
                    }
                    // Si tiene item y es hijo directo
                    else if (Utils.isParentOf(row.item, childRow.item)) {
                        const childLevel = Utils.getItemLevel(childRow.item);
                        const parentLevel = Utils.getItemLevel(row.item);

                        if (childLevel === parentLevel + 1) {
                            childIndices.push({ rowNum: i + 2, hasItem: true });
                        }
                    }
                    // Si encontramos un no-descendiente, terminamos
                    else if (!Utils.isParentOf(row.item, childRow.item)) {
                        break;
                    }
                }

                let totalFormula;

                if (childIndices.length > 0) {
                    // Tiene hijos: construir fórmula que sume según el tipo de hijo
                    const sumParts = [];

                    childIndices.forEach(child => {
                        if (child.hasItem) {
                            // Hijo con item (subpartida): sumar su TOTAL (columna N)
                            sumParts.push(`N${child.rowNum}`);
                        } else {
                            // Hijo sin item (detalle): sumar su campo resultado
                            // lon(I) + area(J) + vol(K) + kg(L) + undc(M)
                            const detailRow = rows[child.rowNum - 2];
                            const resultField = UnitConfig.getResultField(detailRow?.und);

                            const colMap = {
                                lon: 'I',
                                area: 'J',
                                vol: 'K',
                                kg: 'L',
                                undc: 'M'
                            };

                            const col = colMap[resultField] || 'M';
                            sumParts.push(`${col}${child.rowNum}`);
                        }
                    });

                    totalFormula = `=${sumParts.join('+')}`;
                } else {
                    // No tiene hijos: dejar total vacío
                    totalFormula = '';
                }

                this.hf.setCellContents({
                    sheet: this.sheetId,
                    col: 13, // columna N (total)
                    row: rowNum - 1
                }, totalFormula);
            });

            // Obtener valores calculados
            const values = this.hf.getSheetValues(this.sheetId);

            if (!values || values.length <= 1) return rows;

            // Actualizar rows con valores calculados
            return values.slice(1).map((v, idx) => {
                if (idx >= rows.length) return rows[idx];

                const config = UnitConfig.getConfig(rows[idx].und);
                const updates = { ...rows[idx] };

                // Solo actualizar campos calculados y total
                const calcFields = ['lon', 'area', 'vol', 'undc', 'total'];
                calcFields.forEach((f, fidx) => {
                    const colIdx = [8, 9, 10, 12, 13][fidx];

                    // Si es campo calculado o total, actualizar
                    if (f === 'total' || (config && config.calculatedFields.includes(f))) {
                        updates[f] = this.formatNumber(v[colIdx]);
                    }
                    // Si no debe mostrarse, limpiar
                    else if (config && !config.displayFields.includes(f)) {
                        updates[f] = '';
                    }
                });

                // Para detalles (sin item), forzar total vacío
                if (!rows[idx].item || rows[idx].item === '') {
                    updates.total = '';
                } else {
                    updates.total = v[13] === '' || v[13] === null ? '' : this.formatNumber(v[13]);
                }

                return updates;
            });
        } catch (e) {
            console.error('Calculation error:', e);
            return rows;
        }
    }

    toNumber(val) {
        const num = parseFloat(val);
        return isNaN(num) ? 0 : num;
    }

    formatNumber(val) {
        if (val === null || val === undefined || val === '') return '';
        const num = parseFloat(val);
        return isNaN(num) ? '' : num;
    }
}

// ==================== APLICACIÓN VUE ====================
// createApp({
//     setup() {
//         const tableRef = ref(null);
//         const table = ref(null);
//         const dataManager = new DataManager();
//         const formulaManager = new FormulaManager();
//         const clipboard = ref([]);
//         const isCalculating = ref(false);

//         // Construir columnas de Tabulator
//         const buildColumns = () => [
//             {
//                 title: "Acciones",
//                 field: "actions",
//                 frozen: true,
//                 headerSort: false,
//                 formatter: () => `
//                     <div style="display: flex; gap: 4px; justify-content: center;">
//                         <button class="btn-add-partida" title="Agregar Partida Hermana">📁</button>
//                         <button class="btn-add-sub" title="Agregar Subpartida">➕</button>
//                         <button class="btn-del" title="Eliminar">🗑️</button>
//                     </div>
//                 `,
//                 cellClick: (e, cell) => {
//                     e.stopPropagation();
//                     const row = cell.getRow();
//                     const id = row.getData().id;

//                     if (e.target.classList.contains('btn-add-partida')) {
//                         addPartida(id);
//                     } else if (e.target.classList.contains('btn-add-sub')) {
//                         addSubpartida(id);
//                     } else if (e.target.classList.contains('btn-up')) {
//                         moveRows('up');
//                     } else if (e.target.classList.contains('btn-down')) {
//                         moveRows('down');
//                     } else if (e.target.classList.contains('btn-del')) {
//                         deleteRows();
//                     }
//                 }
//             },
//             { title: "ITEM", field: "item", width: 160, frozen: true, editor: "input", validator: "required", cssClass: "wrap-text" },
//             { title: "DESCRIPCIÓN", field: "descripcion", width: 320, editor: "input", validator: "required", cssClass: "wrap-text" },
//             {
//                 title: 'Und.', field: 'und', editor: 'list', editorParams: {
//                     values: ['und', 'pto', 'm', 'm1', 'm2', 'm3', 'kg', 'gbl', 'global']
//                 }
//             },
//             { title: 'Elem.', field: 'elem', editor: 'number', formatter: 'money', formatterParams: { precision: 2 } },
//             {
//                 title: 'DIMENSIONES',
//                 columns: [
//                     { title: 'L.', field: 'l', editor: 'number', formatter: 'money', formatterParams: { precision: 2 } },
//                     { title: 'An.', field: 'an', editor: 'number', formatter: 'money', formatterParams: { precision: 2 } },
//                     { title: 'Al.', field: 'al', editor: 'number', formatter: 'money', formatterParams: { precision: 2 } }
//                 ]
//             },
//             { title: 'Nº Veces', field: 'veces', editor: 'number', formatter: 'money', formatterParams: { precision: 0 } },
//             {
//                 title: 'METRADO',
//                 columns: [
//                     { title: 'Lon', field: 'lon', editor: 'number', formatter: 'money', formatterParams: { precision: 2 } },
//                     { title: 'Área', field: 'area', editor: 'number', formatter: 'money', formatterParams: { precision: 2 } },
//                     { title: 'Vol.', field: 'vol', editor: 'number', formatter: 'money', formatterParams: { precision: 2 } },
//                     { title: 'Kg.', field: 'kg', editor: 'number', formatter: 'money', formatterParams: { precision: 2 } },
//                     { title: 'Undc.', field: 'undc', editor: false, formatter: 'money', formatterParams: { precision: 2 } }
//                 ]
//             },
//             { title: 'Total', field: 'total', editor: false, formatter: 'money', formatterParams: { precision: 2 } }
//         ];

//         // Refrescar tabla con cálculos
//         const refresh = Utils.debounce(() => {
//             if (isCalculating.value) return;
//             isCalculating.value = true;

//             try {
//                 const calculated = formulaManager.calculate(dataManager.getAllRows());

//                 // Actualizar solo los campos calculados
//                 calculated.forEach((calcRow) => {
//                     if (!calcRow || !calcRow.id) return;

//                     // Only update fields that are calculated and NOT editable according to UnitConfig
//                     const config = UnitConfig.getConfig(calcRow.und);
//                     const updates = {};

//                     const calcFields = ['lon', 'area', 'vol', 'undc', 'total'];
//                     calcFields.forEach((f) => {
//                         // If the unit config marks this field editable, skip overwriting it
//                         if (!UnitConfig.isEditable(calcRow.und, f)) {
//                             // Only set if the calculated value is not empty string
//                             if (calcRow[f] !== '' && calcRow[f] !== null && calcRow[f] !== undefined) {
//                                 updates[f] = calcRow[f];
//                             }
//                         }
//                     });

//                     if (Object.keys(updates).length > 0) {
//                         dataManager.updateRow(calcRow.id, updates);
//                     }
//                 });

//                 if (table.value) {
//                     table.value.replaceData(dataManager.getAllRows());
//                 }
//             } catch (e) {
//                 console.error('Error in refresh:', e);
//             } finally {
//                 isCalculating.value = false;
//             }
//         }, 100);

//         // Agregar partida
//         const addPartida = (selectedId = null) => {
//             dataManager.addPartida(selectedId);
//             refresh();
//         };

//         // Agregar subpartida
//         const addSubpartida = (parentId) => {
//             if (!parentId) return;
//             dataManager.addSubpartida(parentId);
//             refresh();
//         };

//         const addDetallesSubpartida = (parentId) => {
//             if (!parentId) return;
//             dataManager.addDetalleSubpartida(parentId);
//             refresh();
//         };

//         // Eliminar filas
//         const deleteRows = () => {
//             if (!table.value) return;

//             const selected = table.value.getSelectedData();
//             if (selected.length === 0) {
//                 alert('Seleccione al menos una fila');
//                 return;
//             }

//             if (confirm(`¿Eliminar ${selected.length} fila(s) y sus descendientes?`)) {
//                 const ids = selected.map(r => r.id);
//                 dataManager.deleteRows(ids);
//                 refresh();
//             }
//         };

//         // Mover filas
//         const moveRows = (direction) => {
//             if (!table.value) return;

//             const selected = table.value.getSelectedData();
//             if (selected.length === 0) return;

//             const ids = selected.map(r => r.id);
//             if (dataManager.moveRows(ids, direction)) {
//                 refresh();

//                 // Re-seleccionar filas
//                 setTimeout(() => {
//                     ids.forEach(id => {
//                         const row = table.value.getRow(id);
//                         if (row) row.select();
//                     });
//                 }, 50);
//             }
//         };

//         // Copiar filas
//         const copyRows = () => {
//             if (!table.value) return;

//             const selected = table.value.getSelectedData();
//             if (selected.length === 0) return;

//             const ids = selected.map(r => r.id);
//             clipboard.value = dataManager.copyRows(ids);

//             console.log(`${clipboard.value.length} fila(s) copiada(s)`);
//         };

//         // Pegar filas
//         const pasteRows = () => {
//             if (clipboard.value.length === 0) {
//                 alert('No hay filas copiadas');
//                 return;
//             }

//             const selected = table.value?.getSelectedData() || [];
//             const afterId = selected.length > 0 ? selected[0].id : null;

//             dataManager.pasteRows(clipboard.value, afterId);
//             refresh();
//         };

//         // Deshacer
//         const undo = () => {
//             if (dataManager.undo()) {
//                 refresh();
//             }
//         };

//         // Rehacer
//         const redo = () => {
//             if (dataManager.redo()) {
//                 refresh();
//             }
//         };

//         const handleCellEdit = (cell) => {
//             const field = cell.getField();
//             const row = cell.getRow().getData();
//             const value = cell.getValue();

//             if (field === 'und') {
//                 // Incluir UNDC en la lista de campos a limpiar
//                 const allDataFields = ['elem', 'l', 'an', 'al', 'veces', 'lon', 'area', 'vol', 'kg', 'undc'];
//                 const config = UnitConfig.getConfig(value);

//                 const updates = { [field]: value };

//                 allDataFields.forEach(f => {
//                     if (!config || !config.displayFields.includes(f)) {
//                         updates[f] = '';
//                     }
//                 });

//                 dataManager.updateRow(row.id, updates);
//             } else {
//                 dataManager.updateRow(row.id, { [field]: value });
//             }

//             dataManager.saveState();
//             refresh();
//         };

//         // Guardar datos
//         const saveData = () => {
//             const jsonData = dataManager.exportData();
//             // Aquí iría la llamada al servidor
//             console.log('Datos para guardar:', jsonData);

//             // Simulación de guardado
//             localStorage.setItem('metrados_data', jsonData);
//             alert('Datos guardados localmente');
//         };

//         // Cargar datos
//         const loadData = () => {
//             const jsonData = localStorage.getItem('metrados_data');
//             if (jsonData) {
//                 if (dataManager.importData(jsonData)) {
//                     refresh();
//                     alert('Datos cargados correctamente');
//                 } else {
//                     alert('Error al cargar datos');
//                 }
//             } else {
//                 alert('No hay datos guardados');
//             }
//         };

//         // Ciclo de vida: montado
//         onMounted(() => {
//             // Cargar datos por defecto
//             const defaultData = data;
//             // const defaultData = [
//             //     { item: "01", descripcion: "INSTALACIONES ELÉCTRICAS", und: "gbl", isPartida: true },
//             //     { item: "01.01", descripcion: "CONEXIÓN A LA RED EXTERNA", und: "gbl", isPartida: true },
//             //     { item: "01.01.01", descripcion: "Acometida monofásica", und: "und", elem: 1, veces: 1, isPartida: false },
//             //     { item: "01.02", descripcion: "SALIDAS ELÉCTRICAS", und: "gbl", isPartida: true },
//             //     { item: "01.02.01", descripcion: "SALIDA PARA ALUMBRADO", und: "gbl", isPartida: true },
//             //     { item: "01.02.01.01", descripcion: "Salida luz interior empotrado", und: "und", elem: 1, veces: 1, isPartida: false },
//             //     { item: "01.02.01.02", descripcion: "Luminaria 50.2W", und: "und", elem: 8, veces: 1, isPartida: false }
//             // ];

//             dataManager.loadData(defaultData);

//             // Atajos de teclado
//             document.addEventListener('keydown', (e) => {
//                 if (e.ctrlKey || e.metaKey) {
//                     if (e.key === 'z' && !e.shiftKey) {
//                         e.preventDefault();
//                         undo();
//                     } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
//                         e.preventDefault();
//                         redo();
//                     } else if (e.key === 'c' && !e.shiftKey) {
//                         copyRows();
//                     } else if (e.key === 'v') {
//                         e.preventDefault();
//                         pasteRows();
//                     } else if (e.key === 's') {
//                         e.preventDefault();
//                         saveData();
//                     }
//                 } else if (e.key === 'Delete') {
//                     deleteRows();
//                 }
//             });

//             // Inicializar Tabulator
//             table.value = new Tabulator(tableRef.value, {
//                 height: "calc(100vh - 200px)",
//                 data: dataManager.getAllRows(),
//                 columns: buildColumns(),
//                 layout: "fitData",
//                 selectable: true,
//                 selectableRollingSelection: false,
//                 selectablePersistence: false,
//                 reactiveData: false,

//                 // Menú contextual
//                 rowContextMenu: [
//                     {
//                         label: "➕ Agregar Partida",
//                         action: (e, row) => addPartida(row.getData().id)
//                     },
//                     {
//                         label: "📁 Agregar Subpartida",
//                         action: (e, row) => addSubpartida(row.getData().id)
//                     },
//                     {
//                         label: "📁 Agregar Detalles",
//                         action: (e, row) => addDetallesSubpartida(row.getData().id)
//                     },
//                     { separator: true },
//                     {
//                         label: "📋 Copiar",
//                         action: () => copyRows()
//                     },
//                     {
//                         label: "📄 Pegar",
//                         action: () => pasteRows()
//                     },
//                     { separator: true },
//                     {
//                         label: "⬆️ Mover Arriba",
//                         action: () => moveRows('up')
//                     },
//                     {
//                         label: "⬇️ Mover Abajo",
//                         action: () => moveRows('down')
//                     },
//                     { separator: true },
//                     {
//                         label: "🗑️ Eliminar",
//                         action: () => deleteRows()
//                     }
//                 ],

//                 // Formateo de filas
//                 rowFormatter: (row) => {
//                     const data = row.getData();
//                     const elem = row.getElement();

//                     // Estilo base
//                     elem.style.backgroundColor = '';
//                     elem.style.fontWeight = 'normal';

//                     // Estilos de partida
//                     if (data.isPartida) {
//                         const level = Utils.getItemLevel(data.item);
//                         const colors = [
//                             '#E3F2FD', // Nivel 1
//                             // '#BBDEFB', // Nivel 2
//                             // '#90CAF9', // Nivel 3
//                             // '#64B5F6', // Nivel 4
//                             // '#42A5F5'  // Nivel 5+
//                         ];
//                         elem.style.backgroundColor = colors[Math.min(level - 1, colors.length - 1)];
//                         elem.style.fontWeight = 'bold';
//                     }

//                     // Colorear celdas según unidad y editabilidad
//                     const cells = row.getCells();
//                     cells.forEach(cell => {
//                         const field = cell.getField();
//                         const cellElem = cell.getElement();

//                         // No modificar acciones, item, descripcion, und
//                         if (['actions', 'item', 'descripcion', 'und'].includes(field)) {
//                             return;
//                         }

//                         cellElem.style.backgroundColor = '';

//                         // Campos editables según unidad
//                         if (UnitConfig.isEditable(data.und, field)) {
//                             cellElem.style.backgroundColor = UnitConfig.getColor(data.und);
//                         }
//                         // Campos calculados
//                         else if (['lon', 'area', 'vol', 'undc', 'total'].includes(field)) {
//                             //cellElem.style.backgroundColor = '#ffffffff';
//                             cellElem.style.fontWeight = '600';
//                         }
//                         // Campos no editables
//                         else {
//                             //cellElem.style.backgroundColor = '#F5F5F5';
//                         }
//                     });
//                 }
//             });

//             // Evento de edición
//             table.value.on("cellEdited", handleCellEdit);

//             // Refrescar inicial
//             refresh();
//         });

//         // Ciclo de vida: desmontado
//         onUnmounted(() => {
//             if (table.value) {
//                 table.value.destroy();
//             }
//         });

//         return {
//             tableRef,
//             addPartida,
//             copyRows,
//             pasteRows,
//             undo,
//             redo,
//             saveData,
//             loadData,
//             deleteRows
//         };
//     },

//     template: `
//         <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-1">
//             <!-- Barra de herramientas -->
//             <div class="bg-white rounded-lg shadow-lg p-4 mb-1">
//                 <div class="flex flex-wrap gap-3 items-center">
//                     <!-- Título -->
//                     <h1 class="text-2xl font-bold text-blue-900 mr-auto">
//                         📊 Sistema de Metrados
//                     </h1>

//                     <!-- Acciones principales -->
//                     <button 
//                         @click="addPartida(null)" 
//                         class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md transition-colors"
//                         title="Agregar nueva partida en raíz">
//                         📁 Nueva Partida
//                     </button>

//                     <!-- Separador -->
//                     <div class="h-8 w-px bg-gray-300"></div>

//                     <!-- Historial -->
//                     <button 
//                         @click="undo" 
//                         class="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold shadow-md transition-colors"
//                         title="Deshacer (Ctrl+Z)">
//                         ↶ Deshacer
//                     </button>
                    
//                     <button 
//                         @click="redo" 
//                         class="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold shadow-md transition-colors"
//                         title="Rehacer (Ctrl+Y)">
//                         ↷ Rehacer
//                     </button>

//                     <!-- Separador -->
//                     <div class="h-8 w-px bg-gray-300"></div>

//                     <!-- Portapapeles -->
//                     <button 
//                         @click="copyRows" 
//                         class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-md transition-colors"
//                         title="Copiar (Ctrl+C)">
//                         📋 Copiar
//                     </button>
                    
//                     <button 
//                         @click="pasteRows" 
//                         class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-md transition-colors"
//                         title="Pegar (Ctrl+V)">
//                         📄 Pegar
//                     </button>

//                     <!-- Separador -->
//                     <div class="h-8 w-px bg-gray-300"></div>

//                     <!-- Eliminar -->
//                     <button 
//                         @click="deleteRows" 
//                         class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-md transition-colors"
//                         title="Eliminar selección (Delete)">
//                         🗑️ Eliminar
//                     </button>

//                     <!-- Separador -->
//                     <div class="h-8 w-px bg-gray-300"></div>

//                     <!-- Persistencia -->
//                     <button 
//                         @click="saveData" 
//                         class="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-md transition-colors"
//                         title="Guardar datos (Ctrl+S)">
//                         💾 Guardar
//                     </button>
                    
//                     <button 
//                         @click="loadData" 
//                         class="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-md transition-colors"
//                         title="Cargar datos guardados">
//                         📂 Cargar
//                     </button>
//                 </div>

//                 <!-- Leyenda -->
//                 <div class="mt-1 pt-3 border-t border-gray-200">
//                     <div class="flex flex-wrap gap-4 text-sm">
//                         <div class="flex items-center gap-2">
//                             <div class="w-6 h-6 rounded" style="background-color: #FFF9C4;"></div>
//                             <span class="text-gray-700">Campos editables</span>
//                         </div>
//                         <div class="flex items-center gap-2">
//                             <div class="w-6 h-6 rounded" style="background-color: #E0F7FA;"></div>
//                             <span class="text-gray-700">Campos calculados</span>
//                         </div>
//                         <div class="flex items-center gap-2">
//                             <div class="w-6 h-6 rounded" style="background-color: #E3F2FD;"></div>
//                             <span class="text-gray-700">Partidas</span>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <!-- Tabla -->
//             <div class="bg-white rounded-lg shadow-lg p-2">
//                 <div ref="tableRef"></div>
//             </div>

//             <!-- Instrucciones -->
//             <div class="mt-1 bg-white rounded-lg shadow-lg p-4">
//                 <h3 class="font-bold text-lg mb-2 text-gray-800">📖 Instrucciones de uso:</h3>
//                 <ul class="text-sm text-gray-700 space-y-1">
//                     <li>• <strong>Agregar Partida (📁):</strong> Crea una partida hermana del mismo nivel</li>
//                     <li>• <strong>Agregar Subpartida (➕):</strong> Crea una subpartida hija de la fila seleccionada</li>
//                     <li>• <strong>Mover (⬆️⬇️):</strong> Mueve las filas seleccionadas arriba o abajo</li>
//                     <li>• <strong>Eliminar (🗑️):</strong> Elimina las filas seleccionadas y sus descendientes</li>
//                     <li>• <strong>Copiar/Pegar:</strong> Copia y pega filas completas</li>
//                     <li>• <strong>Atajos:</strong> Ctrl+Z (deshacer), Ctrl+Y (rehacer), Ctrl+C (copiar), Ctrl+V (pegar), Ctrl+S (guardar), Delete (eliminar)</li>
//                     <li>• <strong>Edición:</strong> Haz clic en cualquier celda editable (amarilla) para modificar valores</li>
//                     <li>• <strong>Selección múltiple:</strong> Mantén Ctrl/Cmd para seleccionar varias filas</li>
//                     <li>• <strong>Menú contextual:</strong> Clic derecho sobre una fila para ver opciones</li>
//                 </ul>
//             </div>
//         </div>
//     `
// }).mount('#metradotableSystem');