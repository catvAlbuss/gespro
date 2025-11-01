

import React, { useEffect, useRef, useState, useCallback, useMemo, memo } from 'react';
import { Plus, Trash2, Calculator, FileDown, SortAsc, ChevronRight, ChevronDown } from 'lucide-react';
import { createRoot } from 'react-dom/client';
import reportes_metrados from './reportes_metrados.jsx';

// ============================================
// CONSTANTES
// ============================================

const COL = { ITEM: 0, DESCRIPCION: 1, UND: 2, ELEM_L: 3, L: 4, ANC: 5, ALT: 6, NVECES: 7, LON: 8, AREA: 9, VOL: 10, KG: 11, UNDC: 12, TOTAL: 13 };

const COL_NAMES = ['ITEM', 'DESCRIPCIÓN', 'UND', 'ELEM.', 'L.', 'ANC.', 'ALT.', 'N VEC', 'LON.', 'ÁREA', 'VOL.', 'KG', 'UNDC', 'TOTAL'];

const UNIT_EDITABLE_COLS = {
    m: [COL.L, COL.ANC, COL.ALT, COL.NVECES],
    m2: [COL.ELEM_L, COL.L, COL.ANC, COL.ALT, COL.LON, COL.NVECES],
    'm²': [COL.L, COL.ANC, COL.ALT, COL.LON, COL.NVECES],
    m3: [COL.L, COL.ANC, COL.ALT, COL.LON, COL.AREA, COL.NVECES],
    und: [COL.NVECES],
    'pto': [COL.ELEM_L, COL.NVECES],
};

const ROW_HEIGHT = 34;
const BUFFER_SIZE = 10;
const HEADER_HEIGHT = 34;

// ============================================
// UTILIDADES
// ============================================
const API = {
    async cargarDatos() {
        const idmetrado = document.getElementById('id_sanitarias')?.value;
        console.log("🆔 ID metrado:", idmetrado);
        if (!idmetrado) return null;

        try {
            const response = await fetch(`/metrados/sanitarias/${idmetrado}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Error al cargar datos del metrado');

            const data = await response.json();
            // Preferir devolver el bloque de documentosdata si existe, o data.data, o el objeto completo
            const documentos = data?.data?.metrado?.documentosdata || data?.data || data;
            // documentos puede contener { variables: {...}, modulos: {...} }
            return documentos;

        } catch (error) {
            console.error("❌ Error cargando datos:", error);
            return { modulos: [], resumen: [] };
        }
    },

    async guardarDatos(payload) {
        const idmetrado = document.getElementById('id_sanitarias')?.value;
        if (!idmetrado) throw new Error('ID del metrado no encontrado');
        try {
            const body = {
                id: parseInt(idmetrado),
                ...payload
            };
            console.log(body);
            const response = await fetch('/metrados/sanitarias/actualizar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al guardar');
            }

            return await response.json();
        } catch (error) {
            console.error('Error guardando datos:', error);
            throw error;
        }
    }
};

class HierarchyManager {
    constructor() {
        this.counters = {};
    }

    rebuild(rows) {
        this.counters = {};
        for (const row of rows) {
            const item = row[COL.ITEM];
            if (!item?.trim()) continue;

            const parts = item.split('.');
            if (parts.length === 1) {
                this.counters['root'] = Math.max(this.counters['root'] || 0, parseInt(parts[0]) || 0);
            } else {
                const parent = parts.slice(0, -1).join('.');
                this.counters[parent] = Math.max(this.counters[parent] || 0, parseInt(parts[parts.length - 1]) || 0);
            }
        }
    }

    getNext(parentItem = null) {
        if (!parentItem?.trim()) {
            this.counters['root'] = (this.counters['root'] || 0) + 1;
            return String(this.counters['root']).padStart(2, '0');
        }
        this.counters[parentItem] = (this.counters[parentItem] || 0) + 1;
        return `${parentItem}.${String(this.counters[parentItem]).padStart(2, '0')}`;
    }

    getLevel(item) {
        return item?.trim() ? (item.match(/\./g) || []).length : -1;
    }

    getParent(item) {
        if (!item?.includes('.')) return null;
        return item.split('.').slice(0, -1).join('.');
    }

    reorder(rows) {
        this.counters = {};
        return rows.map(row => {
            const item = row[COL.ITEM];
            if (!item?.trim()) return row;

            const level = this.getLevel(item);
            let newItem;

            if (level === 0) {
                this.counters['root'] = (this.counters['root'] || 0) + 1;
                newItem = String(this.counters['root']).padStart(2, '0');
            } else {
                const parts = item.split('.');
                const parent = parts.slice(0, -1).join('.');
                this.counters[parent] = (this.counters[parent] || 0) + 1;
                newItem = `${parent}.${String(this.counters[parent]).padStart(2, '0')}`;
            }

            return { ...row, [COL.ITEM]: newItem };
        });
    }
}

const calculateRow = (row) => {
    if (!row[COL.UND]) return row;
    const tipo = (row[COL.UND] || '').toLowerCase();
    const newRow = { ...row };
    const safeFloat = (v) => {
        const num = parseFloat(v);
        return isNaN(num) ? 0 : num;
    };

    const elem = safeFloat(row[COL.ELEM_L]);
    const l = safeFloat(row[COL.L]);
    const anc = safeFloat(row[COL.ANC]);
    const alt = safeFloat(row[COL.ALT]);
    const nveces = safeFloat(row[COL.NVECES]) || 1;
    const lon = safeFloat(row[COL.LON]) || 1;
    const area = safeFloat(row[COL.AREA]) || 1;

    switch (tipo) {
        case 'm':
            newRow[COL.LON] = (l + anc + alt) * nveces;
            newRow[COL.UNDC] = '';
            break;

        case 'm2':
        case 'm²':
            newRow[COL.AREA] = (l || 1) * (anc || 1) * (alt || 1) * (nveces || 1) * (lon || 1);
            newRow[COL.UNDC] = '';
            break;

        case 'm3':
        case 'm³': {
            newRow[COL.VOL] = l * anc * alt * lon * nveces;
            newRow[COL.UNDC] = '';
            break;
        }

        case 'und':
        case 'pto': {
            newRow[COL.UNDC] = safeFloat(row[COL.NVECES]);
            newRow[COL.LON] = '';
            newRow[COL.AREA] = '';
            newRow[COL.VOL] = '';
            newRow[COL.KG] = '';
            break;
        }
    }
    return newRow;
};

const calculateTotals = (rows) => {
    const itemMap = new Map();
    let currentItem = null;

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const item = row[COL.ITEM];

        if (item?.trim()) {
            currentItem = item;
            if (!itemMap.has(item)) {
                itemMap.set(item, { indices: [], details: [] });
            }
            itemMap.get(item).indices.push(i);
        } else if (currentItem) {
            if (!itemMap.has(currentItem)) {
                itemMap.set(currentItem, { indices: [], details: [] });
            }
            itemMap.get(currentItem).details.push(i);
        }
    }

    const newRows = [...rows];

    const getValueByUnit = (row) => {
        const tipo = (row[COL.UND] || '').toLowerCase();
        const safeFloat = (v) => parseFloat(v) || 0;
        switch (tipo) {
            case 'm':
                return safeFloat(row[COL.LON]);
            case 'm2':
            case 'm²':
            case 'pto':
                return safeFloat(row[COL.AREA]);
            case 'm3':
                return safeFloat(row[COL.VOL]);
            default:
                return safeFloat(row[COL.UNDC]);
        }
    };

    const items = Array.from(itemMap.keys()).filter(k => k?.trim()).sort((a, b) => b.split('.').length - a.split('.').length);

    for (const item of items) {
        const info = itemMap.get(item);
        let total = 0;

        if (info.details.length > 0) {
            for (const idx of info.details) {
                total += getValueByUnit(newRows[idx]);
            }
            for (const idx of info.indices) {
                newRows[idx][COL.TOTAL] = total;
            }
        } else {
            for (const idx of info.indices) {
                newRows[idx][COL.TOTAL] = getValueByUnit(newRows[idx]);
            }
        }
    }
    return newRows;
};

// ============================================
// COMPONENTE DE FILA
// ============================================
const TableRow = memo(({ row, realIdx, indent, hasChildren, isCollapsed, editableCols, isRowSelected, isSelected, onUpdateImmediate, onMouseDown, onMouseEnter, onContextMenu, onToggleCollapse }) => {
    const getNumericValue = (val) => {
        if (val === '' || val === null || val === undefined) return '';
        const num = parseFloat(val);
        return isNaN(num) ? '' : val;
    };

    return (
        <tr className={`hover:bg-blue-50 ${isRowSelected ? 'bg-blue-100' : ''}`} onContextMenu={(e) => onContextMenu(e, realIdx)} style={{ height: ROW_HEIGHT }}>
            <td className="p-1 border align-top" style={{ paddingLeft: indent + 4, width: '120px' }}>
                <div className="flex items-center gap-1">
                    {hasChildren && row[COL.ITEM] && (
                        <button onClick={() => onToggleCollapse(row[COL.ITEM])} className="hover:bg-gray-200 rounded p-0.5 flex-shrink-0">
                            {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                    )}
                    <input
                        className={`flex-1 bg-transparent border-none outline-none font-semibold text-xs ${isSelected(realIdx, COL.ITEM) ? 'bg-blue-200' : ''}`}
                        value={row[COL.ITEM] || ''} onChange={(e) => onUpdateImmediate(realIdx, COL.ITEM, e.target.value)} onMouseDown={(e) => onMouseDown(realIdx, COL.ITEM, e)}
                        onMouseEnter={() => onMouseEnter(realIdx, COL.ITEM)} />
                </div>
            </td>
            <td className="p-1 border align-top" style={{ width: '300px' }}>
                <textarea
                    className={`w-full bg-transparent border-none outline-none text-xs resize-none ${isSelected(realIdx, COL.DESCRIPCION) ? 'bg-blue-200' : ''}`}
                    value={row[COL.DESCRIPCION] || ''}
                    onChange={(e) => {
                        onUpdateImmediate(realIdx, COL.DESCRIPCION, e.target.value);
                    }}
                    onMouseDown={(e) => onMouseDown(realIdx, COL.DESCRIPCION, e)} onMouseEnter={() => onMouseEnter(realIdx, COL.DESCRIPCION)} rows={1} style={{ overflow: 'hidden', minHeight: '20px' }} />
            </td>
            <td className="p-1 border align-top" style={{ width: '80px' }}>
                <select
                    className={`w-full bg-transparent border-none outline-none text-xs ${isSelected(realIdx, COL.UND) ? 'bg-blue-200' : ''}`}
                    value={row[COL.UND] || ''} onChange={(e) => onUpdateImmediate(realIdx, COL.UND, e.target.value)} onMouseDown={(e) => onMouseDown(realIdx, COL.UND, e)}
                    onMouseEnter={() => onMouseEnter(realIdx, COL.UND)}>
                    <option value=""></option>
                    {['m', 'm2', 'm3', 'm³v₁', 'm³v₂', 'kg', 'und', 'pto', 'glb'].map(u => (
                        <option key={u} value={u}>{u}</option>
                    ))}
                </select>
            </td>
            {[COL.ELEM_L, COL.L, COL.ANC, COL.ALT, COL.NVECES, COL.LON, COL.AREA, COL.VOL, COL.KG].map((col, idx) => {
                const isEditable = editableCols.includes(col);
                const value = getNumericValue(row[col]);
                const widths = ['70px', '70px', '70px', '70px', '70px', '80px', '80px', '80px', '80px'];
                return (
                    <td key={col} className={`p-1 border align-top ${isEditable ? 'bg-yellow-50' : ''}`} style={{ width: widths[idx] }}>
                        <input
                            type="text" inputMode="decimal" value={value}
                            className={`w-full bg-transparent border-none outline-none text-right text-xs ${isSelected(realIdx, col) ? 'bg-blue-200' : ''}`}
                            onChange={(e) => {
                                const val = e.target.value;
                                console.log(val);
                                if (val === '' || /^-?\d*\.?\d*$/.test(val)) {
                                    onUpdateImmediate(realIdx, col, val);
                                }
                            }}
                            onMouseDown={(e) => onMouseDown(realIdx, col, e)}
                            onMouseEnter={() => onMouseEnter(realIdx, col)}
                            readOnly={!isEditable && col !== COL.NVECES} />
                    </td>
                );
            })}
            <td className="p-1 border text-right font-mono text-blue-700 bg-gray-50 align-top" style={{ width: '90px' }}>
                {(parseFloat(row[COL.UNDC]) || 0).toFixed(2)}
            </td>
            <td className="p-1 border text-right font-mono font-semibold text-green-700 bg-gray-50 align-top" style={{ width: '100px' }}>
                {row[COL.ITEM]?.trim() ? (parseFloat(row[COL.TOTAL]) || 0).toFixed(2) : ''}
            </td>
        </tr>
    );
}, (prev, next) => {
    if (prev.row !== next.row) return false;
    if (prev.isCollapsed !== next.isCollapsed) return false;
    if (prev.isRowSelected !== next.isRowSelected) return false;

    for (let col = 0; col <= COL.TOTAL; col++) {
        if (prev.isSelected(prev.realIdx, col) !== next.isSelected(next.realIdx, col)) return false;
    }
    return true;
});

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function MetradoOptimizado() {
    const [rows, setRows] = useState([]);
    const [selectedCells, setSelectedCells] = useState(new Set());
    const [contextMenu, setContextMenu] = useState(null);
    const [dragStart, setDragStart] = useState(null);
    const [activeTab, setActiveTab] = useState('metrado');
    const [collapsedItems, setCollapsedItems] = useState(new Set());
    const [scrollTop, setScrollTop] = useState(0);
    const [history, setHistory] = useState([]);
    const [statusMessage, setStatusMessage] = useState('💡 Ctrl+Z: Deshacer | Click derecho: menú');

    // --- MULTI-MODULE SUPPORT ---
    // rows holds the currently active module's rows. rowsByModule stores all modules (numbered modules + Exterior + Cisterna)
    const [rowsByModule, setRowsByModule] = useState([]);
    const [moduleIndex, setModuleIndex] = useState(0); // index of active module
    const cantidadModulo = parseInt(document.getElementById('cantidadModulo').value || 0);
    console.log(cantidadModulo)
    const totalModules = cantidadModulo + 2; // numbered modules + Exterior + Cisterna

    // Helper: Arabic to Roman (small, sufficient for typical module counts)
    const toRoman = (num) => {
        const map = [
            [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
        ];
        let res = '';
        let n = num;
        for (const [val, sym] of map) {
            while (n >= val) { res += sym; n -= val; }
        }
        return res;
    };

    const moduleNames = useMemo(() => {
        const names = [];
        for (let i = 1; i <= cantidadModulo; i++) names.push(toRoman(i));
        names.push('Exterior');
        names.push('Cisterna');
        return names;
    }, [cantidadModulo]);

    const hierarchyManager = useRef(new HierarchyManager());
    const calcTimeoutRef = useRef(null);
    const containerRef = useRef(null);
    const contextMenuRef = useRef(null);
    const pendingUpdatesRef = useRef(new Map());
    const clipboardRef = useRef({ rows: [], indices: new Set(), isCut: false });
    const statusTimerRef = useRef(null);
    const [isSaving, setIsSaving] = useState(false);

    // Agregar al inicio del componente, junto con los otros estados
    const [showExportModal, setShowExportModal] = useState(false);
    const [logo1, setLogo1] = useState(null);
    const [logo2, setLogo2] = useState(null);

    useEffect(() => {
        const cargarDatosIniciales = async () => {
            const datosDB = await API.cargarDatos();

            // Queremos cargar solo los módulos desde el servidor. El resumen se calcula automáticamente.
            // Soporte flexible:
            // - If server returns an array of modules (array of arrays) -> use directly
            // - If server returns a flat array with MODULE property -> group by moduleNames order
            // - If server returns a single module (flat rows) -> replicate into modules

            let modules = [];

            // If server returned an object with named modules (modulos as object), use it
            if (datosDB && typeof datosDB === 'object' && datosDB.modulos && typeof datosDB.modulos === 'object' && !Array.isArray(datosDB)) {
                const modObj = datosDB.modulos;
                const arr = moduleNames.map(name => (modObj[name] || []).map(r => ({ ...r })));
                modules = arr;
                showStatus('✅ Módulos cargados desde la base de datos (objeto modulos)', 1500);
            } else if (Array.isArray(datosDB) && datosDB.length > 0 && Array.isArray(datosDB[0])) {
                // Already an array of modules
                modules = datosDB.map(mod => (mod || []).map(r => ({ ...r })));
                showStatus('✅ Módulos cargados desde la base de datos (array de módulos)', 1500);
            } else if (Array.isArray(datosDB) && datosDB.length > 0 && typeof datosDB[0] === 'object') {
                // Flat array of rows, maybe with MODULE property
                const hasModuleProp = datosDB.some(r => r && r.MODULE);
                if (hasModuleProp) {
                    // Group by moduleNames (use exact MODULE values)
                    const groups = moduleNames.map(() => []);
                    for (const r of datosDB) {
                        const modName = r.MODULE;
                        const idx = moduleNames.indexOf(modName);
                        if (idx >= 0) groups[idx].push(r);
                    }
                    modules = groups.map(g => g.map(r => ({ ...r })));
                    showStatus('✅ Módulos cargados desde la base de datos (agrupados por MODULE)', 1500);
                } else {
                    // Treat as single module: replicate into all modules
                    const single = datosDB.map(r => ({ ...r }));
                    modules = Array.from({ length: totalModules }, () => single.map(r => ({ ...r })));
                    showStatus('✅ Datos cargados (replicados en módulos)', 1500);
                }
            } else {
                // No data: create empty modules
                modules = Array.from({ length: totalModules }, () => []);
                showStatus('📝 No hay datos en BD: módulos vacíos creados', 1500);
            }

            // Normalize each module: calculate rows and totals
            let normalized = modules.map(modRows => {
                const calc = (modRows || []).map(calculateRow);
                return calculateTotals(calc);
            });

            // Ensure each module has at least one default row if empty/null
            const defaultRowFactory = (suffix = 0) => ({
                id: Date.now() + suffix,
                [COL.ITEM]: '',
                [COL.DESCRIPCION]: '',
                [COL.UND]: '',
                [COL.ELEM_L]: '',
                [COL.L]: '',
                [COL.ANC]: '',
                [COL.ALT]: '',
                [COL.NVECES]: '',
                [COL.LON]: '',
                [COL.AREA]: '',
                [COL.VOL]: '',
                [COL.KG]: '',
                [COL.UNDC]: '',
                [COL.TOTAL]: ''
            });

            normalized = normalized.map((modRows, idx) => {
                const rowsArr = Array.isArray(modRows) ? modRows.slice() : [];
                if (rowsArr.length === 0) {
                    const dr = defaultRowFactory(idx);
                    rowsArr.push(dr);
                }
                return rowsArr;
            });

            setRowsByModule(normalized);
            // Load the active module into `rows`
            const initial = normalized[moduleIndex] || [];
            setRows(initial.map(r => ({ ...r })));
            hierarchyManager.current.rebuild(initial);
        };

        cargarDatosIniciales();
    }, []);

    const showStatus = useCallback((msg, duration = 3000) => {
        if (statusTimerRef.current) {
            clearTimeout(statusTimerRef.current);
        }
        setStatusMessage(msg);
        if (duration > 0) {
            statusTimerRef.current = setTimeout(() => {
                // **CAMBIO**: Mensaje de estado por defecto
                setStatusMessage('💡 Ctrl+Z: Deshacer | Click derecho: menú');
            }, duration);
        }
    }, []);

    // Switch active module (save current module rows, load target module rows)
    const switchModule = useCallback((idx) => {
        setRowsByModule(prev => {
            const next = prev && prev.length ? prev.map(m => m.map(r => ({ ...r }))) : Array.from({ length: totalModules }, () => []);
            next[moduleIndex] = rows.map(r => ({ ...r }));
            const target = next[idx] ? next[idx].map(r => ({ ...r })) : [];
            setRows(target);
            return next;
        });
        setModuleIndex(idx);
        showStatus(`📁 Módulo ${moduleNames[idx] || idx + 1} activado`, 1200);
    }, [moduleIndex, rows, totalModules, moduleNames, showStatus]);

    // **NUEVO**: Función para guardar el estado actual en el historial
    const saveHistory = useCallback(() => {
        setHistory(prevHistory => {
            // Guardar el estado `rows` actual
            const newHistory = [...prevHistory, rows];
            // Limitar el historial a 20 pasos
            if (newHistory.length > 20) {
                return newHistory.slice(newHistory.length - 20);
            }
            return newHistory;
        });
    }, [rows]); // Depende de `rows` para guardar la instantánea correcta

    // **NUEVO**: Función para deshacer (Ctrl+Z)
    const undo = useCallback(() => {
        if (history.length === 0) {
            showStatus("🤷 No hay nada que deshacer.", 2000);
            return;
        }

        const newHistory = [...history];
        const lastState = newHistory.pop(); // Obtener y quitar el último estado

        setRows(lastState); // Restaurar estado
        setHistory(newHistory); // Actualizar el historial
        hierarchyManager.current.rebuild(lastState); // Reconstruir la jerarquía

        showStatus("↩️ Acción deshecha.", 2000);
    }, [history, showStatus]);

    const selectedRowIndices = useMemo(() => {
        return new Set(Array.from(selectedCells).map(key => parseInt(key.split('-')[0])));
    }, [selectedCells]);

    const updateCellImmediate = useCallback((rowIndex, col, value) => {
        // NOTA: No guardamos historial para cambios de celda individuales
        // para evitar deshacer cada pulsación de tecla.
        setRows(prevRows => {
            const newRows = [...prevRows];
            newRows[rowIndex] = { ...newRows[rowIndex], [col]: value };

            if (col === COL.UND) {
                const cleanFields = [COL.ELEM_L, COL.L, COL.ANC, COL.ALT, COL.NVECES, COL.LON, COL.AREA, COL.VOL, COL.KG, COL.UNDC];
                for (const c of cleanFields) {
                    newRows[rowIndex][c] = '';
                }
            }

            return newRows;
        });

        const numericCols = [COL.ELEM_L, COL.L, COL.ANC, COL.ALT, COL.NVECES, COL.VOL, COL.LON, COL.AREA]; // ✅ Agregados
        if (numericCols.includes(col) || col === COL.UND) {
            if (calcTimeoutRef.current) clearTimeout(calcTimeoutRef.current);
            calcTimeoutRef.current = setTimeout(() => {
                setRows(prevRows => {
                    const calculated = prevRows.map(calculateRow);
                    return calculateTotals(calculated);
                });
            }, 100);
        }
    }, []);

    const addRowFromMenu = useCallback((type, parentItem = null) => {
        saveHistory(); // **NUEVO**: Guardar estado antes de cambiar
        const rowIndices = Array.from(selectedRowIndices);
        const firstRow = rowIndices.length > 0 ? Math.min(...rowIndices) : rows.length - 1;

        let newRow = { id: Date.now() };

        if (type === 'parent') {
            const newItem = hierarchyManager.current.getNext();
            newRow = {
                ...newRow,
                [COL.ITEM]: newItem,
                [COL.DESCRIPCION]: 'Nueva Partida',
                [COL.UND]: ''
            };
        } else if (type === 'child') {
            const parent = parentItem || rows[firstRow][COL.ITEM];
            if (!parent?.trim()) return;
            const newItem = hierarchyManager.current.getNext(parent);
            newRow = {
                ...newRow,
                [COL.ITEM]: newItem,
                [COL.DESCRIPCION]: 'Nueva Subpartida',
                [COL.UND]: ''
            };
        } else if (type === 'detail') {
            newRow = {
                ...newRow,
                [COL.ITEM]: '',
                [COL.DESCRIPCION]: 'Detalle',
                [COL.UND]: 'und',
                [COL.ANC]: '1',
                [COL.ALT]: '1',
                [COL.ELEM_L]: '1'
            };
        }

        const newRows = [...rows];
        newRows.splice(firstRow + 1, 0, newRow);
        hierarchyManager.current.rebuild(newRows);

        const calculated = newRows.map(calculateRow);
        setRows(calculateTotals(calculated));
        setContextMenu(null);
    }, [rows, selectedRowIndices, saveHistory]);

    const deleteSelected = useCallback(() => {
        const rowIndices = Array.from(selectedRowIndices).sort((a, b) => a - b);
        if (rowIndices.length === 0) return;
        if (!confirm(`¿Está seguro de eliminar ${rowIndices.length} fila(s) seleccionada(s)?`)) return;

        saveHistory(); // **NUEVO**: Guardar estado antes de cambiar

        const newRows = rows.filter((_, idx) => !rowIndices.includes(idx));

        hierarchyManager.current.rebuild(newRows);
        const reordered = hierarchyManager.current.reorder(newRows);
        const calculated = reordered.map(calculateRow);
        setRows(calculateTotals(calculated));
        setSelectedCells(new Set());
        showStatus(`✅ ${rowIndices.length} fila(s) eliminada(s).`);
    }, [rows, selectedRowIndices, showStatus, saveHistory]);

    const copySelected = useCallback(() => {
        const rowIndices = Array.from(selectedRowIndices).sort((a, b) => a - b);
        if (rowIndices.length === 0) return;

        clipboardRef.current = {
            rows: rowIndices.map(idx => ({ ...rows[idx] })),
            indices: new Set(),
            isCut: false
        };
        showStatus(`📋 ${rowIndices.length} fila(s) copiada(s).`);
    }, [rows, selectedRowIndices, showStatus]);

    const cutSelected = useCallback(() => {
        const rowIndices = Array.from(selectedRowIndices).sort((a, b) => a - b);
        if (rowIndices.length === 0) return;

        clipboardRef.current = {
            rows: rowIndices.map(idx => ({ ...rows[idx] })),
            indices: new Set(rowIndices),
            isCut: true
        };
        showStatus(`✂️ ${rowIndices.length} fila(s) cortada(s).`);
    }, [rows, selectedRowIndices, showStatus]);

    const pasteRows = useCallback(() => {
        if (!clipboardRef.current.rows.length) return;

        saveHistory(); // **NUEVO**: Guardar estado antes de cambiar

        const rowIndices = Array.from(selectedRowIndices);
        const insertIndex = rowIndices.length > 0 ? Math.min(...rowIndices) + 1 : rows.length;

        const newRows = [...rows];
        const pastedRows = clipboardRef.current.rows.map((row, i) => ({
            ...row,
            id: Date.now() + i,
            [COL.ITEM]: ''
        }));

        if (clipboardRef.current.isCut) {
            const cutIndices = clipboardRef.current.indices;
            const filtered = newRows.filter((_, idx) => !cutIndices.has(idx));

            const itemsBefore = Array.from(cutIndices).filter(i => i < insertIndex).length;
            const adjustedInsertIndex = insertIndex - itemsBefore;

            filtered.splice(adjustedInsertIndex, 0, ...pastedRows);

            hierarchyManager.current.rebuild(filtered);
            const calculated = filtered.map(calculateRow);
            setRows(calculateTotals(calculated));
            clipboardRef.current = { rows: [], indices: new Set(), isCut: false };
        } else {
            newRows.splice(insertIndex, 0, ...pastedRows);
            hierarchyManager.current.rebuild(newRows);
            const calculated = newRows.map(calculateRow);
            setRows(calculateTotals(calculated));
        }

        setSelectedCells(new Set());
        showStatus(`📄 ${pastedRows.length} fila(s) pegada(s).`);
    }, [rows, selectedRowIndices, showStatus, saveHistory]);

    const moveRows = useCallback((direction) => {
        const rowIndices = Array.from(selectedRowIndices).sort((a, b) => a - b);
        if (rowIndices.length === 0) return;

        const newRows = [...rows];
        let moved = false;
        const offset = direction === 'up' ? -1 : 1;

        if (direction === 'up' && rowIndices[0] > 0) {
            const targetIdx = rowIndices[0] - 1;
            if (selectedRowIndices.has(targetIdx)) return;

            saveHistory(); // **NUEVO**: Guardar estado antes de cambiar
            const movedItems = rowIndices.map(idx => newRows[idx]);
            const otherItems = newRows.filter((_, idx) => !selectedRowIndices.has(idx));
            otherItems.splice(targetIdx, 0, ...movedItems);

            newRows.splice(0, newRows.length, ...otherItems);
            moved = true;

        } else if (direction === 'down' && rowIndices[rowIndices.length - 1] < rows.length - 1) {
            const targetIdx = rowIndices[rowIndices.length - 1] + 1;
            if (selectedRowIndices.has(targetIdx)) return;

            saveHistory(); // **NUEVO**: Guardar estado antes de cambiar
            const movedItems = rowIndices.map(idx => newRows[idx]).reverse();
            const otherItems = newRows.filter((_, idx) => !selectedRowIndices.has(idx));

            const adjustedTargetIdx = targetIdx - rowIndices.length;

            otherItems.splice(adjustedTargetIdx + 1, 0, ...movedItems.reverse());

            newRows.splice(0, newRows.length, ...otherItems);
            moved = true;
        }

        if (moved) {
            hierarchyManager.current.rebuild(newRows);
            const reordered = hierarchyManager.current.reorder(newRows);
            const calculated = reordered.map(calculateRow);
            setRows(calculateTotals(calculated));

            const newSelection = new Set(
                Array.from(selectedCells).map(key => {
                    const [row, col] = key.split('-');
                    return `${parseInt(row) + offset}-${col}`;
                })
            );
            setSelectedCells(newSelection);
            showStatus(`↕️ ${rowIndices.length} fila(s) movida(s).`);
        }
    }, [rows, selectedCells, selectedRowIndices, showStatus, saveHistory]);

    const handlePaste = useCallback((e) => {
        e.preventDefault();
        saveHistory(); // **NUEVO**: Guardar estado antes de cambiar

        const text = e.clipboardData.getData('text');
        const lines = text.split('\n').filter(l => l.trim());

        const pastedRows = lines.map((line, i) => {
            const values = line.split('\t');
            return {
                id: Date.now() + i,
                [COL.ITEM]: values[0] || '',
                [COL.DESCRIPCION]: values[1] || '',
                [COL.UND]: values[2] || '',
                [COL.ELEM_L]: values[3] || '',
                [COL.L]: values[4] || '',
                [COL.ANC]: values[5] || '',
                [COL.ALT]: values[6] || '',
                [COL.NVECES]: values[7] || '',
                [COL.LON]: values[8] || '',
                [COL.AREA]: values[9] || '',
                [COL.VOL]: values[10] || '',
                [COL.KG]: values[11] || ''
            };
        });

        const rowIndices = Array.from(selectedRowIndices);
        const insertIndex = rowIndices.length > 0 ? Math.min(...rowIndices) : rows.length;

        const newRows = [...rows];
        newRows.splice(insertIndex, 0, ...pastedRows);

        hierarchyManager.current.rebuild(newRows);
        const calculated = newRows.map(calculateRow);
        setRows(calculateTotals(calculated));
        showStatus(`📋 ${pastedRows.length} fila(s) pegada(s) desde el portapapeles.`);
    }, [rows, selectedRowIndices, showStatus, saveHistory]);

    const reorderItems = useCallback(() => {
        saveHistory(); // **NUEVO**: Guardar estado antes de cambiar
        const reordered = hierarchyManager.current.reorder(rows);
        const calculated = reordered.map(calculateRow);
        setRows(calculateTotals(calculated));
        showStatus('🔢 Items re-numerados.');
    }, [rows, showStatus, saveHistory]);

    const handleMouseDown = useCallback((rowIdx, colIdx, e) => {
        if (e.button === 2) return;

        const key = `${rowIdx}-${colIdx}`;
        if (e.shiftKey && selectedCells.size > 0) {
            const firstKey = Array.from(selectedCells)[0];
            const [startRow, startCol] = firstKey.split('-').map(Number);
            const minRow = Math.min(startRow, rowIdx);
            const maxRow = Math.max(startRow, rowIdx);
            const minCol = Math.min(startCol, colIdx);
            const maxCol = Math.max(startCol, colIdx);

            const newSelection = new Set();
            for (let r = minRow; r <= maxRow; r++) {
                for (let c = minCol; c <= maxCol; c++) {
                    newSelection.add(`${r}-${c}`);
                }
            }
            setSelectedCells(newSelection);
        } else if (e.ctrlKey || e.metaKey) {
            const newSelection = new Set(selectedCells);
            if (newSelection.has(key)) newSelection.delete(key);
            else newSelection.add(key);
            setSelectedCells(newSelection);
        } else {
            setSelectedCells(new Set([key]));
        }

        setDragStart({ row: rowIdx, col: colIdx });
    }, [selectedCells]);

    const handleMouseEnter = useCallback((rowIdx, colIdx) => {
        if (dragStart && dragStart.row !== null) {
            const minRow = Math.min(dragStart.row, rowIdx);
            const maxRow = Math.max(dragStart.row, rowIdx);
            const minCol = Math.min(dragStart.col, colIdx);
            const maxCol = Math.max(dragStart.col, colIdx);

            const newSelection = new Set();
            for (let r = minRow; r <= maxRow; r++) {
                for (let c = minCol; c <= maxCol; c++) {
                    newSelection.add(`${r}-${c}`);
                }
            }
            setSelectedCells(newSelection);
        }
    }, [dragStart]);

    const handleMouseUp = useCallback(() => {
        setDragStart(null);
    }, []);

    const handleContextMenu = useCallback((e, rowIdx) => {
        e.preventDefault();
        const row = rows[rowIdx];
        const item = row[COL.ITEM];
        const level = hierarchyManager.current.getLevel(item);

        // **NUEVO**: Lógica de posicionamiento del menú
        const menuHeight = 350; // Estimación de la altura del menú
        const { clientX, clientY } = e;
        const windowHeight = window.innerHeight;

        let yPos = clientY;
        // Si el menú se sale por abajo, muévelo hacia arriba
        if (clientY + menuHeight > windowHeight) {
            yPos = clientY - menuHeight;
            if (yPos < 0) yPos = 10; // Evitar que se salga por arriba
        }

        let xPos = clientX; // (Podríamos añadir lógica para el borde derecho también)

        setContextMenu({ x: xPos, y: yPos, rowIdx, item, level });
    }, [rows]);

    // **NUEVO**: Hook para cerrar el menú al hacer clic fuera
    useEffect(() => {
        if (!contextMenu) return; // Si no hay menú, no hacer nada

        const handleClickOutside = (e) => {
            // Si el clic fue fuera del div del menú (usando la ref)
            if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
                setContextMenu(null); // Cierra el menú
            }
        };

        // Añadir el listener
        document.addEventListener('mousedown', handleClickOutside);
        // Limpiar el listener al desmontar o cuando el menú cambie
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [contextMenu]); // Solo se ejecuta cuando `contextMenu` cambia

    // **CAMBIO**: Añadido Ctrl+Z y la dependencia `undo`
    useEffect(() => {
        const handleKeyDown = (e) => {
            // **NUEVO**: Manejador de Undo (Ctrl+Z)
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                undo();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                e.preventDefault();
                copySelected();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
                e.preventDefault();
                cutSelected();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'v' && clipboardRef.current.rows.length > 0) {
                e.preventDefault();
                pasteRows();
            }
            if (e.key === 'Delete') {
                e.preventDefault();
                deleteSelected();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [copySelected, cutSelected, pasteRows, deleteSelected, undo]); // **CAMBIO**: Añadida dependencia `undo`

    // Función para convertir archivo a buffer
    const fileToBuffer = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    };

    const exportToExcel = useCallback(async () => {
        if (!logo1 || !logo2) {
            showStatus('⚠️ Por favor sube ambos logos antes de exportar', 3000);
            return;
        }

        const rep = new reportes_metrados();
        // Convertir archivos a buffer
        const logo1Buffer = await fileToBuffer(logo1);
        const logo2Buffer = await fileToBuffer(logo2);

        // Detectar extensión
        const logo1Ext = logo1.name.split('.').pop().toLowerCase();
        const logo2Ext = logo2.name.split('.').pop().toLowerCase();

        // 🧠 Leer el JSON de Laravel (inyectado en el input hidden)
        let costosData = {};
        const costosInput = document.getElementById("costos");
        if (costosInput && costosInput.value) {
            try {
                costosData = JSON.parse(costosInput.value);
            } catch (e) {
                console.error("❌ Error al parsear los datos de costos:", e);
            }
        }
        // Ensure modules snapshot reflects current edits
        const modulesSnapshot = rowsByModule && rowsByModule.length ? rowsByModule.map(m => m.map(r => ({ ...r }))) : Array.from({ length: totalModules }, () => []);
        modulesSnapshot[moduleIndex] = rows.map(r => ({ ...r }));

        const isMulti = Array.isArray(moduleNames) && moduleNames.length > 0;

        // Build ordered data array expected by reportes_metrados (array of module arrays)
        // NOTE: our UI rows use numeric-indexed objects (COL constants). The report expects
        // named properties like `item`, `descripcion`, `unidad`, `largo`, `area`, `totalnieto`, etc.
        const mapRowToReport = (r) => ({
            item: (r[COL.ITEM] || '').toString(),
            descripcion: r[COL.DESCRIPCION] || '',
            unidad: r[COL.UND] || '',
            elesimil: r[COL.ELEM_L] || '',
            largo: r[COL.L] || '',
            ancho: r[COL.ANC] || '',
            alto: r[COL.ALT] || '',
            nveces: r[COL.NVECES] || '',
            longitud: r[COL.LON] || '',
            area: r[COL.AREA] || '',
            volumen: r[COL.VOL] || '',
            kg: r[COL.KG] || '',
            unidadcalculado: r[COL.UNDC] || '',
            totalnieto: r[COL.TOTAL] || ''
        });

        let dataArg;
        if (isMulti) {
            dataArg = moduleNames.map((name, i) => (modulesSnapshot[i] || []).map(r => mapRowToReport(r)));
        } else {
            // single module: send current rows (reflecting edits)
            const singleRows = modulesSnapshot[moduleIndex] || rows.map(r => ({ ...r }));
            dataArg = singleRows.map(r => mapRowToReport(r));
        }

        // Build resumen payload compatible with reportes_metrados
        // Robust getters that accept both numeric-indexed rows (COL constants) and object-shaped rows
        const getItemKey = (r) => {
            const v = (r && typeof r === 'object') ? (r[COL.ITEM] ?? r.item ?? r.ITEM ?? '') : '';
            return (v || '').toString().trim();
        };
        const getDescripcion = (r) => (r && typeof r === 'object') ? (r[COL.DESCRIPCION] ?? r.descripcion ?? r.DESCRIPCION ?? '') : '';
        const getUnidad = (r) => (r && typeof r === 'object') ? (r[COL.UND] ?? r.unidad ?? r.und ?? r.UND ?? '') : '';
        const getTotalVal = (r) => {
            if (!r || typeof r !== 'object') return 0;
            const candidates = [r[COL.TOTAL], r.totalnieto, r.total, r.TOTAL, r.total_nieto, r.total_neto];
            for (const c of candidates) {
                if (c !== undefined && c !== null && c !== '') {
                    const n = parseFloat(c);
                    if (!isNaN(n)) return n;
                }
            }
            return 0;
        };

        const resumenMap = new Map();

        if (isMulti) {
            for (let m = 0; m < dataArg.length; m++) {
                const modRows = dataArg[m] || [];
                for (const r of modRows) {
                    const itemKey = getItemKey(r);
                    if (!itemKey) continue;
                    const val = getTotalVal(r);
                    if (!resumenMap.has(itemKey)) {
                        resumenMap.set(itemKey, {
                            item: itemKey,
                            descripcion: getDescripcion(r),
                            unidad: getUnidad(r),
                            partials: Array(dataArg.length).fill(0),
                            total: 0
                        });
                    }
                    const rec = resumenMap.get(itemKey);
                    rec.partials[m] = (rec.partials[m] || 0) + val;
                    rec.total = (rec.total || 0) + val;
                }
            }
        } else {
            const modRows = Array.isArray(dataArg) ? dataArg : [];
            for (const r of modRows) {
                const itemKey = getItemKey(r);
                if (!itemKey) continue;
                const val = getTotalVal(r);
                if (!resumenMap.has(itemKey)) {
                    resumenMap.set(itemKey, {
                        item: itemKey,
                        descripcion: getDescripcion(r),
                        unidad: getUnidad(r),
                        parcial: 0,
                        total: 0
                    });
                }
                const rec = resumenMap.get(itemKey);
                rec.parcial = (rec.parcial || 0) + val;
                rec.total = (rec.total || 0) + val;
            }
        }

        const resumenPayload = Array.from(resumenMap.values());

        // Replace zeros with empty strings to avoid many zeros in the report
        const resumenPayloadClean = resumenPayload.map(entry => {
            const e = { ...entry };
            if (Array.isArray(e.partials)) {
                e.partials = e.partials.map(p => (typeof p === 'number' && p === 0 ? '' : p));
            }
            if (e.parcial !== undefined) {
                e.parcial = (typeof e.parcial === 'number' && e.parcial === 0) ? '' : e.parcial;
            }
            if (e.total !== undefined) {
                e.total = (typeof e.total === 'number' && e.total === 0) ? '' : e.total;
            }
            return e;
        });
        // Prepare options (metadata + logos)
        const options = {
            nombre_proyecto: costosData.name || 'PROYECTO SIN NOMBRE',
            uei: costosData.codigouei || 'SIN UEI',
            snip: costosData.codigosnip || 'SIN SNIP',
            cui: costosData.codigocui || '000000',
            unidad_ejecutora: costosData.unidad_ejecutora || 'NO REGISTRADO',
            codigo_local: costosData.codigolocal || '000000',
            codigomodular: costosData.codigomodular || '000000',
            fecha: costosData.fecha || new Date().toISOString().split('T')[0],
            ubicacion: [
                costosData.region,
                costosData.provincia,
                costosData.distrito,
                costosData.centropoblado
            ].filter(Boolean).join(" - "),
            especialidad: 'SANITARIAS', // o podrías usar dinámico si lo tienes en tu JSON
            moduleNames: moduleNames,
            // logos como buffers
            logo1: { data: logo1Buffer, extension: logo1Ext },
            logo2: { data: logo2Buffer, extension: logo2Ext }
        };

        // Call the report generator with the correct data shape
        try {
            const filename = `metrado_sanitarias_${new Date().toISOString().split('T')[0]}.xlsx`;
            await rep.download(dataArg, resumenPayloadClean, options, filename);
        } catch (err) {
            console.error('Export error', err);
            showStatus('❌ Error al generar el Excel. Revisa la consola.', 4000);
        }
    }, [rowsByModule, rows, logo1, logo2, moduleIndex, moduleNames]);

    // Build resumen across all modules (each module column + total)
    const resumenData = useMemo(() => {
        // Build modules snapshot: use rowsByModule if present, ensure current module saved
        const modulesSnapshot = rowsByModule && rowsByModule.length ? rowsByModule.map(m => m.map(r => ({ ...r }))) : Array.from({ length: totalModules }, () => []);
        // Ensure current module is reflected
        modulesSnapshot[moduleIndex] = rows.map(r => ({ ...r }));

        const itemMap = new Map();
        for (let m = 0; m < modulesSnapshot.length; m++) {
            const modRows = modulesSnapshot[m] || [];
            for (const row of modRows) {
                const item = row[COL.ITEM]?.trim();
                if (!item) continue;
                if (!itemMap.has(item)) {
                    itemMap.set(item, { item, descripcion: row[COL.DESCRIPCION] || '', und: row[COL.UND] || '', parcial: 0, partials: Array(modulesSnapshot.length).fill(0) });
                }
                const rec = itemMap.get(item);
                const val = parseFloat(row[COL.TOTAL]) || 0;
                rec.partials[m] += val;
                rec.parcial += val;
            }
        }

        const arr = Array.from(itemMap.values()).map(v => {
            const copy = { ...v, total: v.parcial };
            if (Array.isArray(copy.partials)) {
                copy.partials = copy.partials.map(p => (typeof p === 'number' && p === 0 ? '' : p));
            }
            copy.parcial = (typeof copy.parcial === 'number' && copy.parcial === 0) ? '' : copy.parcial;
            copy.total = (typeof copy.total === 'number' && copy.total === 0) ? '' : copy.total;
            return copy;
        });
        return arr;
    }, [rowsByModule, rows, moduleIndex, totalModules]);

    const toggleCollapse = useCallback((item) => {
        setCollapsedItems(prev => {
            const next = new Set(prev);
            if (next.has(item)) next.delete(item);
            else next.add(item);
            return next;
        });
    }, []);

    const visibleRows = useMemo(() => {
        if (collapsedItems.size === 0) return rows;

        const visible = [];
        let skipUntilLevel = -1;

        for (const row of rows) {
            const item = row[COL.ITEM];
            if (!item?.trim()) {
                if (skipUntilLevel === -1) visible.push(row);
                continue;
            }

            const level = hierarchyManager.current.getLevel(item);

            if (skipUntilLevel !== -1 && level > skipUntilLevel) continue;

            skipUntilLevel = -1;
            visible.push(row);

            if (collapsedItems.has(item)) {
                skipUntilLevel = level;
            }
        }

        return visible;
    }, [rows, collapsedItems]);

    const rowsData = useMemo(() => {
        return visibleRows.map(row => {
            const realIdx = rows.indexOf(row);
            const level = hierarchyManager.current.getLevel(row[COL.ITEM]);
            const indent = level > 0 ? level * 12 : 0;
            const hasChildren = rows.some(r => hierarchyManager.current.getParent(r[COL.ITEM]) === row[COL.ITEM]);
            const isCollapsed = collapsedItems.has(row[COL.ITEM]);
            const editableCols = UNIT_EDITABLE_COLS[row[COL.UND]?.toLowerCase()] || [];
            //console.log(editableCols);
            return { row, realIdx, level, indent, hasChildren, isCollapsed, editableCols };
        });
    }, [visibleRows, rows, collapsedItems]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            setScrollTop(container.scrollTop);
        };

        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    const visibleRange = useMemo(() => {
        const containerHeight = containerRef.current?.clientHeight || 600;
        const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_SIZE);
        const endIndex = Math.min(
            rowsData.length - 1,
            Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + BUFFER_SIZE
        );
        return { start: startIndex, end: endIndex };
    }, [scrollTop, rowsData.length]);

    const visibleRowsData = useMemo(() =>
        rowsData.slice(visibleRange.start, visibleRange.end + 1),
        [rowsData, visibleRange]
    );

    const isCellSelected = useCallback((rowIdx, colIdx) => {
        return selectedCells.has(`${rowIdx}-${colIdx}`);
    }, [selectedCells]);

    const isRowSelected = useCallback((rowIdx) => {
        return selectedRowIndices.has(rowIdx);
    }, [selectedRowIndices]);


    const totalHeight = rowsData.length * ROW_HEIGHT;
    const offsetTop = visibleRange.start * ROW_HEIGHT;

    const guardarDatos = useCallback(async () => {
        if (isSaving) return;

        setIsSaving(true);
        showStatus('💾 Guardando metrado y resumen...', 0);

        try {
            // Asegurar que el módulo actual esté guardado en rowsByModule
            const modulesCopy = rowsByModule && rowsByModule.length ? rowsByModule.map(m => m.map(r => ({ ...r }))) : Array.from({ length: totalModules }, () => []);
            modulesCopy[moduleIndex] = rows.map(r => ({ ...r }));

            // Construir objeto de módulos con claves por nombre de módulo
            const modulesObject = {};
            for (let i = 0; i < moduleNames.length; i++) {
                const name = moduleNames[i] || `M${i + 1}`;
                modulesObject[name] = (modulesCopy[i] || []).map(r => ({ ...r }));
            }

            // Generar resumen a partir de modulesObject
            const resumenMap = new Map();
            for (const modName of Object.keys(modulesObject)) {
                const modRows = modulesObject[modName] || [];
                for (const r of modRows) {
                    const item = (r[COL.ITEM] || '').trim();
                    if (!item) continue;
                    if (!resumenMap.has(item)) resumenMap.set(item, { item, descripcion: r[COL.DESCRIPCION] || '', und: r[COL.UND] || '', total: 0 });
                    resumenMap.get(item).total += parseFloat(r[COL.TOTAL]) || 0;
                }
            }
            const resumenPayload = Array.from(resumenMap.values());

            const payload = {
                variables: { cantidadModulo },
                modulos: modulesObject,
                resumencm: resumenPayload
            };

            await API.guardarDatos(payload);
            showStatus('✅ Metrado y resumen guardados correctamente', 2000);
        } catch (error) {
            showStatus('❌ Error al guardar. Intente nuevamente', 3000);
        } finally {
            setIsSaving(false);
        }
    }, [rows, isSaving, showStatus]);

    // Agregar el componente Modal antes del return principal
    const ExportModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                <h3 className="text-lg font-bold mb-4">Configurar Exportación</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Logo Izquierdo</label>
                        <input
                            type="file"
                            accept="image/png,image/jpeg"
                            onChange={(e) => setLogo1(e.target.files[0])}
                            className="w-full text-sm border rounded p-2"
                        />
                        {logo1 && <p className="text-xs text-green-600 mt-1">✓ {logo1.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Logo Derecho</label>
                        <input
                            type="file"
                            accept="image/png,image/jpeg"
                            onChange={(e) => setLogo2(e.target.files[0])}
                            className="w-full text-sm border rounded p-2"
                        />
                        {logo2 && <p className="text-xs text-green-600 mt-1">✓ {logo2.name}</p>}
                    </div>
                </div>

                <div className="flex gap-2 mt-6">
                    <button
                        onClick={() => setShowExportModal(false)}
                        className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded">
                        Cancelar
                    </button>
                    <button
                        onClick={exportToExcel}
                        disabled={!logo1 || !logo2}
                        className={`flex-1 px-4 py-2 rounded text-white ${logo1 && logo2
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-gray-400 cursor-not-allowed'
                            }`}>
                        Exportar
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <div className="flex items-center gap-2 p-2 bg-white border-b shadow-sm">
                <button onClick={deleteSelected} className="p-2 hover:bg-red-50 rounded" title="Eliminar">
                    <Trash2 className="w-4 h-4 text-red-600" />
                </button>
                <button onClick={() => moveRows('up')} className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded" title="Mover Arriba">↑</button>
                <button onClick={() => moveRows('down')} className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded" title="Mover Abajo">↓</button>

                <div className="w-px h-6 bg-gray-300 mx-1" />

                <button onClick={reorderItems} className="p-2 hover:bg-amber-50 rounded" title="Reordenar Items">
                    <SortAsc className="w-4 h-4 text-amber-600" />
                </button>
                <button
                    onClick={() => {
                        const calculated = rows.map(calculateRow);
                        setRows(calculateTotals(calculated));
                        showStatus('🧮 Recálculo completado.');
                    }}
                    className="p-2 hover:bg-green-50 rounded"
                    title="Recalcular Todo">
                    <Calculator className="w-4 h-4 text-green-600" />
                </button>
                <button
                    onClick={() => setShowExportModal(true)}
                    className="p-2 hover:bg-purple-50 rounded"
                    title="Exportar a Excel">
                    <FileDown className="w-4 h-4 text-purple-600" />
                </button>
                {/* <button onClick={exportToExcel} className="p-2 hover:bg-purple-50 rounded" title="Exportar a TSV (Excel)">
                    <FileDown className="w-4 h-4 text-purple-600" />
                </button> */}
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <button
                    onClick={guardarDatos}
                    disabled={isSaving}
                    className={`p-2 rounded ${isSaving ? 'bg-gray-200' : 'hover:bg-blue-50'}`}
                    title="Guardar en Base de Datos">
                    {isSaving ? '⏳' : '💾'}
                </button>
            </div>

            <div className="flex border-b bg-white">
                <button
                    onClick={() => setActiveTab('metrado')}
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'metrado' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                    📋 Metrado
                </button>
                <button
                    onClick={() => setActiveTab('resumen')}
                    className={`px-4 py-2 text-sm font-medium ${activeTab === 'resumen' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
                    📊 Resumen
                </button>
            </div>

            <div ref={containerRef} className="flex-1 overflow-auto" onPaste={handlePaste} onMouseUp={handleMouseUp}>
                {activeTab === 'metrado' ? (
                    <div className="relative">
                        {/* Encabezado fijo */}
                        <div className="sticky top-0 z-20 bg-white shadow-md">
                            {/* Module selector: numbered modules (Roman), plus Exterior and Cisterna */}
                            <div className="flex gap-2 items-center p-2 border-b overflow-x-auto">
                                {moduleNames.map((name, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => switchModule(idx)}
                                        className={`px-3 py-1 text-xs rounded ${moduleIndex === idx ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                        {name}
                                    </button>
                                ))}
                            </div>
                            <table className="w-full text-xs border-collapse table-fixed">
                                <thead className="bg-gray-100">
                                    <tr style={{ height: HEADER_HEIGHT }}>
                                        <th className="p-1 border font-semibold text-left w-[20%]">ITEM</th>
                                        <th className="p-1 border font-semibold text-left w-[28%]">DESCRIPCIÓN</th>
                                        <th className="p-1 border font-semibold text-center w-[7%]">UND</th>
                                        <th className="p-1 border font-semibold text-center w-[5%]">ELEM.</th>
                                        <th className="p-1 border font-semibold text-center w-[5%]">L.</th>
                                        <th className="p-1 border font-semibold text-center w-[5%]">ANC.</th>
                                        <th className="p-1 border font-semibold text-center w-[5%]">ALT.</th>
                                        <th className="p-1 border font-semibold text-center w-[5%]">N VEC</th>
                                        <th className="p-1 border font-semibold text-center w-[5%]">LON.</th>
                                        <th className="p-1 border font-semibold text-center w-[5%]">ÁREA</th>
                                        <th className="p-1 border font-semibold text-center w-[5%]">VOL.</th>
                                        <th className="p-1 border font-semibold text-center w-[5%]">KG</th>
                                        <th className="p-1 border font-semibold text-center w-[6%]">UNDC</th>
                                        <th className="p-1 border font-semibold text-center w-[7%]">TOTAL</th>
                                    </tr>
                                </thead>
                            </table>
                        </div>

                        {/* Cuerpo */}
                        <div style={{ height: totalHeight, position: "relative" }}>
                            <div style={{ position: "absolute", top: offsetTop, left: 0, right: 0 }}>
                                <table className="w-full text-xs border-collapse table-fixed bg-white">
                                    <colgroup>
                                        <col className="w-[20%]" />
                                        <col className="w-[28%]" />
                                        <col className="w-[7%]" />
                                        <col className="w-[5%]" />
                                        <col className="w-[5%]" />
                                        <col className="w-[5%]" />
                                        <col className="w-[5%]" />
                                        <col className="w-[5%]" />
                                        <col className="w-[5%]" />
                                        <col className="w-[5%]" />
                                        <col className="w-[5%]" />
                                        <col className="w-[5%]" />
                                        <col className="w-[6%]" />
                                        <col className="w-[7%]" />
                                    </colgroup>
                                    <tbody>
                                        {visibleRowsData.map(
                                            ({ row, realIdx, indent, hasChildren, isCollapsed, editableCols }) => (
                                                <TableRow
                                                    key={row.id || realIdx}
                                                    row={row}
                                                    realIdx={realIdx}
                                                    indent={indent}
                                                    hasChildren={hasChildren}
                                                    isCollapsed={isCollapsed}
                                                    editableCols={editableCols}
                                                    isRowSelected={isRowSelected(realIdx)}
                                                    isSelected={isCellSelected}
                                                    onUpdateImmediate={updateCellImmediate}
                                                    onMouseDown={handleMouseDown}
                                                    onMouseEnter={handleMouseEnter}
                                                    onContextMenu={handleContextMenu}
                                                    onToggleCollapse={toggleCollapse}
                                                />
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-2">
                        <table className="w-full text-xs border-collapse bg-white shadow-sm">
                            <thead className="sticky top-0 bg-gray-100 border-b-2 border-gray-300">
                                <tr>
                                    <th className="p-2 border font-semibold text-left">ITEM</th>
                                    <th className="p-2 border font-semibold text-left">DESCRIPCIÓN</th>
                                    <th className="p-2 border font-semibold text-center">UND</th>
                                    {moduleNames.map((m, i) => (
                                        <th key={i} className="p-2 border font-semibold text-right">{m}</th>
                                    ))}
                                    <th className="p-2 border font-semibold text-right">TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resumenData.map((row, idx) => {
                                    const level = hierarchyManager.current.getLevel(row.item);
                                    const indent = level * 16;
                                    return (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="p-2 border font-mono font-semibold" style={{ paddingLeft: indent + 8 }}>
                                                {row.item}
                                            </td>
                                            <td className="p-2 border">{row.descripcion}</td>
                                            <td className="p-2 border text-center">{row.und}</td>
                                            {row.partials.map((p, i) => (
                                                <td key={i} className="p-2 border text-right font-mono">{typeof p === 'number' ? p.toFixed(2) : ''}</td>
                                            ))}
                                            <td className="p-2 border text-right font-mono font-semibold text-green-700">
                                                {typeof row.total === 'number' ? row.total.toFixed(2) : ''}
                                            </td>
                                        </tr>
                                    );
                                })}
                                <tr className="bg-green-50 font-bold border-t-2 border-green-600">
                                    <td colSpan={3 + moduleNames.length} className="p-2 border text-right">TOTAL GENERAL:</td>
                                    <td className="p-2 border text-right font-mono text-green-700">
                                        {(() => {
                                            const totalGeneral = resumenData.reduce((sum, r) => sum + (typeof r.total === 'number' ? r.total : 0), 0);
                                            return totalGeneral === 0 ? '' : totalGeneral.toFixed(2);
                                        })()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {contextMenu && (
                <div
                    // **NUEVO**: Añadida la ref para detectar clics fuera
                    ref={contextMenuRef}
                    className="fixed bg-white border shadow-lg rounded-lg py-1 z-50"
                    // **CAMBIO**: El posicionamiento ahora usa las coordenadas `x` e `y` calculadas
                    style={{ left: contextMenu.x, top: contextMenu.y }}>
                    <button
                        onClick={() => addRowFromMenu('parent')}
                        className="w-full px-4 py-2 text-left text-xs hover:bg-blue-50 flex items-center gap-2">
                        <Plus className="w-3 h-3" /> Nueva Partida
                    </button>

                    {contextMenu.item && contextMenu.level < 8 && (
                        <button
                            onClick={() => addRowFromMenu('child', contextMenu.item)}
                            className="w-full px-4 py-2 text-left text-xs hover:bg-blue-50 flex items-center gap-2">
                            <ChevronRight className="w-3 h-3" /> Nueva Subpartida
                        </button>
                    )}

                    <button
                        onClick={() => addRowFromMenu('detail')}
                        className="w-full px-4 py-2 text-left text-xs hover:bg-blue-50 flex items-center gap-2">
                        <Plus className="w-3 h-3" /> Agregar Detalle
                    </button>

                    <div className="border-t my-1"></div>

                    <button
                        onClick={() => { copySelected(); setContextMenu(null); }}
                        className="w-full px-4 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2">
                        📋 Copiar (Ctrl+C)
                    </button>

                    <button
                        onClick={() => { cutSelected(); setContextMenu(null); }}
                        className="w-full px-4 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2">
                        ✂️ Cortar (Ctrl+X)
                    </button>

                    <button
                        onClick={() => { pasteRows(); setContextMenu(null); }}
                        className="w-full px-4 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2"
                        disabled={!clipboardRef.current.rows.length}>
                        📄 Pegar (Ctrl+V)
                    </button>

                    <div className="border-t my-1"></div>

                    <button
                        onClick={() => { moveRows('up'); setContextMenu(null); }}
                        className="w-full px-4 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2">
                        ⬆️ Mover Arriba
                    </button>

                    <button
                        onClick={() => { moveRows('down'); setContextMenu(null); }}
                        className="w-full px-4 py-2 text-left text-xs hover:bg-gray-50 flex items-center gap-2">
                        ⬇️ Mover Abajo
                    </button>

                    <div className="border-t my-1"></div>

                    <button
                        onClick={() => { deleteSelected(); setContextMenu(null); }}
                        className="w-full px-4 py-2 text-left text-xs hover:bg-red-50 flex items-center gap-2 text-red-600">
                        <Trash2 className="w-3 h-3" /> Eliminar (Delete)
                    </button>
                </div>
            )}

            <div className="p-2 bg-white border-t text-xs text-gray-600 flex items-center gap-4 justify-between">
                <div className="flex gap-4">
                    <span>Total: {rows.length}</span>
                    <span>Visibles: {visibleRows.length}</span>
                    <span>Renderizadas: {visibleRowsData.length}</span>
                    <span>Seleccionadas: {selectedRowIndices.size}</span>
                </div>
                <span className="text-blue-600 font-semibold text-right">
                    {statusMessage}
                </span>
            </div>
            {showExportModal && <ExportModal />}
        </div>
    );
}

const container = document.getElementById('metradoSanitarias');
if (container) {
    const root = createRoot(container);
    root.render(<MetradoOptimizado />);
}