// ============================================
// CONFIGURACIÓN Y CONSTANTES
// ============================================

const CURRENCY_CONFIG = {
  formatter: "money",
  formatterParams: {
    decimal: ".",
    thousand: ",",
    symbol: "S/ ",
    precision: 2,
  },
};

const pen_formatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

// Configuración de virtualización para grandes cantidades de datos
const VIRTUAL_DOM_CONFIG = {
  height: 600,               // Altura fija de la tabla
  virtualDomBuffer: 100,     // Número de filas extra a renderizar
  placeholder: "Cargando...", // Texto mientras se cargan las filas
  pagination: true,          // Habilitar paginación
  paginationSize: 100,       // Filas por página
  movableRows: true,         // Permitir mover filas
  ajaxSorting: true,         // Ordenamiento del lado del cliente
  ajaxFiltering: true,       // Filtrado del lado del cliente
  history: true,             // Historial de cambios
};

// Índices de columnas (como Excel: 0=A, 1=B, 2=C, etc.)
const COL = {
  ITEM: 0,           // A
  DESCRIPCION: 1,    // B
  UND: 2,            // C
  ELEM_L: 3,         // D
  L: 4,              // E
  ANC: 5,            // F
  ALT: 6,            // G
  NVECES: 7,         // H
  LON: 8,            // I
  AREA: 9,           // J
  VOL: 10,           // K
  KG: 11,            // L
  UNDC: 12,          // M
  TOTAL: 13          // N
};

// Unidades de medida con sus fórmulas
const UNIDADES = {
  'm': 'longitud',
  'ml': 'longitud',
  'km': 'longitud',
  'm2': 'area',
  'm²': 'area',
  'm3': 'volumen',
  'm³': 'volumen',
  'kg': 'peso',
  'tn': 'peso',
  'und': 'unidad',
  'pza': 'unidad',
  'glb': 'unidad',
  'pln': 'unidad'
};

// ============================================
// UTILIDADES
// ============================================

function excelColumn(n) {
  let result = "";
  while (n >= 0) {
    result = String.fromCharCode((n % 26) + 65) + result;
    n = Math.floor(n / 26) - 1;
  }
  return result;
}

function makeRoundFormatter(precision) {
  return function (cell) {
    const value = parseFloat(cell.getValue());
    return isNaN(value) ? "" : value.toFixed(precision);
  };
}

// Utilidad para batch updates en HyperFormula
class BatchUpdateManager {
  constructor(hf) {
    this.hf = hf;
    this.updates = new Map();
    this.isProcessing = false;
    this.debounceTimeout = null;
  }

  queueUpdate(address, value) {
    const key = `${address.sheet}-${address.row}-${address.col}`;
    this.updates.set(key, { address, value });

    // Debounce para procesar actualizaciones en lote
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    this.debounceTimeout = setTimeout(() => this.processUpdates(), 100);
  }

  async processUpdates() {
    if (this.isProcessing || this.updates.size === 0) return;

    this.isProcessing = true;
    const CHUNK_SIZE = 100; // Procesar en chunks para no bloquear el UI
    
    try {
      const updates = Array.from(this.updates.values());
      for (let i = 0; i < updates.length; i += CHUNK_SIZE) {
        const chunk = updates.slice(i, i + CHUNK_SIZE);
        await new Promise(resolve => setTimeout(resolve, 0)); // Yield al event loop
        
        // Procesar chunk
        this.hf.batch(() => {
          chunk.forEach(({ address, value }) => {
            this.hf.setCellContents(address, value);
          });
        });
      }
    } finally {
      this.updates.clear();
      this.isProcessing = false;
    }
  }

  cancelPendingUpdates() {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    this.updates.clear();
    this.isProcessing = false;
  }

  // Ejecuta un bloque sincronizado y luego procesa las actualizaciones en cola
  async batch(cb) {
    try {
      cb();
    } catch (e) {
      console.error('Error en batch callback:', e);
    }
    // Forzar procesamiento inmediato de updates (no debounce)
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = null;
    }
    await this.processUpdates();
  }
}

// ============================================
// CLASE: UNIDADES DE MEDIDA
// ============================================

class UnidadMedida {
  static getFormula(und, row) {
    const tipo = (und || '').toLowerCase();
    const D = excelColumn(COL.ELEM_L);
    const F = excelColumn(COL.ANC);
    const G = excelColumn(COL.ALT);
    const H = excelColumn(COL.NVECES);
    const I = excelColumn(COL.LON);
    const J = excelColumn(COL.AREA);
    const K = excelColumn(COL.VOL);
    const L = excelColumn(COL.KG);
    const M = excelColumn(COL.UNDC);

    switch (tipo) {
      case "m": // Longitud
        return `=IF(${I}${row}<>"",${I}${row},${D}${row})*IF(${H}${row}<>"",${H}${row},1)`;
      case "m2": // Área
        return `=IF(${J}${row}<>"",${J}${row},${D}${row}*${F}${row})*IF(${H}${row}<>"",${H}${row},1)`;
      case "m3": // Volumen
        return `=IF(${K}${row}<>"",${K}${row},${D}${row}*${F}${row}*${G}${row})*IF(${H}${row}<>"",${H}${row},1)`;
      case "kg": // Peso
        return `=${L}${row}*IF(${H}${row}<>"",${H}${row},1)`;
      case "und": // Unidad
      default:
        return `=${D}${row}*IF(${H}${row}<>"",${H}${row},1)`;
    }
  }

  // 🔹 Aplica la fórmula en HyperFormula y devuelve valor resultante
  static applyToHF(hf, sheetID, und, row, targetCol) {
    const formula = this.getFormula(und, row + 1); // Excel usa 1-based
    const address = { sheet: sheetID, col: targetCol, row };
    const changes = hf.setCellContents(address, formula);

    // devuelve valor calculado
    const val = hf.getCellValue(address);
    return { formula, value: val };
  }
}

// ============================================
// CLASE: NUMERACIÓN DE ITEMS
// ============================================

class ItemNumerator {
  constructor() {
    this.counters = {};
  }

  // Analiza todas las filas existentes y reconstruye contadores
  rebuildFromTable(tableData) {
    this.counters = {};

    tableData.forEach(row => {
      const item = row[`${COL.ITEM}`];
      if (!item || item.trim() === '') return;

      const parts = item.split('.');

      if (parts.length === 1) {
        // Partida raíz (01, 02, 03...)
        const num = parseInt(parts[0]);
        this.counters['root'] = Math.max(this.counters['root'] || 0, num);
      } else {
        // Subpartida (01.01, 01.02, etc.)
        const parent = parts.slice(0, -1).join('.');
        const num = parseInt(parts[parts.length - 1]);
        this.counters[parent] = Math.max(this.counters[parent] || 0, num);
      }
    });
  }

  getNextNumber(parentItem = null) {
    if (!parentItem || parentItem.trim() === '') {
      const key = 'root';
      this.counters[key] = (this.counters[key] || 0) + 1;
      return this.pad(this.counters[key]);
    }

    this.counters[parentItem] = (this.counters[parentItem] || 0) + 1;
    return `${parentItem}.${this.pad(this.counters[parentItem])}`;
  }

  pad(num) {
    return String(num).padStart(2, '0');
  }

  getLevel(item) {
    if (!item || item.trim() === '') return -1;
    return (item.match(/\./g) || []).length;
  }

  // Renumera automáticamente toda la estructura
  renumberAll(tableData) {
    this.counters = {};
    const result = [];

    tableData.forEach(row => {
      const currentItem = row[`${COL.ITEM}`];

      if (!currentItem || currentItem.trim() === '') {
        // Fila detalle sin item
        result.push({ ...row });
        return;
      }

      const level = this.getLevel(currentItem);

      if (level === 0) {
        // Partida
        const newItem = this.getNextNumber();
        result.push({ ...row, [`${COL.ITEM}`]: newItem });
      } else if (level === 1) {
        // Subpartida - necesita encontrar su padre
        const parts = currentItem.split('.');
        const parentCode = parts[0];

        // Buscar padre real en result
        let realParent = null;
        for (let i = result.length - 1; i >= 0; i--) {
          const checkItem = result[i][`${COL.ITEM}`];
          if (checkItem && checkItem.split('.').length === 1 &&
            parseInt(checkItem) === parseInt(parentCode)) {
            realParent = checkItem;
            break;
          }
        }

        if (realParent) {
          const newItem = this.getNextNumber(realParent);
          result.push({ ...row, [`${COL.ITEM}`]: newItem });
        } else {
          result.push({ ...row });
        }
      } else {
        // Niveles más profundos
        result.push({ ...row });
      }
    });

    return result;
  }
}

// ============================================
// CLASE: TABLA DE METRADO
// ============================================

class MetradoTable {
  constructor(containerId, hf, tableModel = {}) {
    this.containerId = containerId;
    this.hf = hf;
    this.batchManager = new BatchUpdateManager(hf);
    this.sheetName = "METRADO";
    this.sheetID = null;
    this.table = null;
    this.numerator = new ItemNumerator();
    this.tableModel = tableModel;
    this._suspendRowAdded = false;
    this._calculationQueue = new Set();
    this._pendingUpdates = new Map();

    this.initializeSheet();
    this.createTable();
  }

  initializeSheet() {
    this.hf.addSheet(this.sheetName);
    this.sheetID = this.hf.getSheetId(this.sheetName);
  }

  getColumnConfig() {
    return [
      {
        title: "METRADO DE COMUNICACIONES",
        columns: [
          {
            title: "ITEM",
            field: `${COL.ITEM}`,
            width: 100,
            editor: "input",
            formatter: (cell) => {
              const value = cell.getValue() || '';
              const nivel = this.numerator.getLevel(value);
              const indent = '&nbsp;&nbsp;&nbsp;&nbsp;'.repeat(Math.max(0, nivel));
              return `${indent}<b>${value}</b>`;
            }
          },
          {
            title: "DESCRIPCIÓN",
            field: `${COL.DESCRIPCION}`,
            width: 300,
            editor: "input",
            hozAlign: "left"
          },
          {
            title: "UND",
            field: `${COL.UND}`,
            editor: "list",
            editorParams: {
              values: ["m", "m2", "m3", "kg", "und", "pza", "glb", "ml", "km", "tn"]
            },
            cellEdited: (cell) => {
              // Al cambiar unidad, limpiar campos de cálculo
              this.onUnitChange(cell.getRow());
            }
          },
          {
            title: "ELEM.",
            field: `${COL.ELEM_L}`,
            editor: "number",
            editorParams: { step: 0.01 },
            formatter: makeRoundFormatter(2)
          },
          {
            title: "DIMENSIONES",
            columns: [
              {
                title: "L.",
                field: `${COL.L}`,
                editor: "number",
                editorParams: { step: 0.01 },
                formatter: makeRoundFormatter(2)
              },
              {
                title: "ANC.",
                field: `${COL.ANC}`,
                editor: "number",
                editorParams: { step: 0.01 },
                formatter: makeRoundFormatter(2)
              },
              {
                title: "ALT.",
                field: `${COL.ALT}`,
                editor: "number",
                editorParams: { step: 0.01 },
                formatter: makeRoundFormatter(2)
              },
            ],
          },
          {
            title: "N VECES",
            field: `${COL.NVECES}`,
            editor: "number",
            editorParams: { step: 1 },
            formatter: makeRoundFormatter(0)
          },
          {
            title: "METRADO",
            columns: [
              {
                title: "LON.",
                field: `${COL.LON}`,
                editor: "number",
                editorParams: { step: 0.01 },
                formatter: makeRoundFormatter(2)
              },
              {
                title: "ÁREA",
                field: `${COL.AREA}`,
                editor: "number",
                editorParams: { step: 0.01 },
                formatter: makeRoundFormatter(2)
              },
              {
                title: "VOL.",
                field: `${COL.VOL}`,
                editor: "number",
                editorParams: { step: 0.01 },
                formatter: makeRoundFormatter(2)
              },
              {
                title: "KG",
                field: `${COL.KG}`,
                editor: "number",
                editorParams: { step: 0.01 },
                formatter: makeRoundFormatter(2)
              },
              {
                title: "UNDC",
                field: `${COL.UNDC}`,
                editor: "number",
                editorParams: { step: 1 },
                formatter: makeRoundFormatter(0)
              },
            ]
          },
          {
            title: "TOTAL",
            field: `${COL.TOTAL}`,
            formatter: makeRoundFormatter(2),
            bottomCalc: "sum",
            bottomCalcParams: { precision: 2 },
            bottomCalcFormatter: makeRoundFormatter(2)
          }
        ]
      }
    ];
  }

  // Determina qué celdas colorear según la unidad
  getCellColorClass(cell, colIndex) {
    const rowData = cell.getRow().getData();
    const und = (rowData[`${COL.UND}`] || '').toLowerCase();

    const colorMap = {
      'm': [COL.ELEM_L, COL.LON], // D, I
      'm2': [COL.ELEM_L, COL.ANC, COL.AREA], // D, F, J
      'm3': [COL.ELEM_L, COL.ANC, COL.ALT, COL.VOL], // D, F, G, K
      'kg': [COL.KG], // L
      'und': [COL.ELEM_L], // D
    };

    const requiredCols = colorMap[und] || [COL.ELEM_L];

    return requiredCols.includes(colIndex) ? 'bg-yellow-100' : '';
  }

  // Limpia campos al cambiar unidad
  onUnitChange(row) {
    const fieldsToClean = [
      COL.ELEM_L, COL.L, COL.ANC, COL.ALT,
      COL.LON, COL.AREA, COL.VOL, COL.KG, COL.UNDC
    ];

    const updates = {};
    fieldsToClean.forEach(col => {
      updates[`${col}`] = '';
    });

    row.update(updates);

    // Limpiar en HyperFormula
    const rowIndex = parseInt(row.getIndex());
    fieldsToClean.forEach(col => {
      const address = { sheet: this.sheetID, col, row: rowIndex };
      this.hf.setCellContents(address, null);
    });
  }

  createTable() {
    const rowMenu = [
      {
        label: "➕ Agregar fila",
        menu: [
          {
            label: "Nueva Partida",
            action: (e, row) => {
              const rowPosition = row.getPosition();
              this.addRow("padre", null, rowPosition);
            }
          },
          {
            label: "Nueva Subpartida",
            action: (e, row) => {
              const data = row.getData();
              const currentItem = data[COL.ITEM];
              // Obtener el ítem padre correcto
              let parentItem = currentItem;
              if (currentItem && currentItem.includes('.')) {
                parentItem = currentItem.split('.')[0];
              }
              this.addRow("hijo", parentItem, row.getPosition());
            }
          },
          {
            label: "Agregar Detalle Aquí",
            action: (e, row) => {
              const data = row.getData();
              const currentItem = data[COL.ITEM];
              this.addRow("detalle", currentItem, row.getPosition());
            }
          },
          {
            label: "Insertar Detalle al Final del Grupo",
            action: (e, row) => {
              const rows = this.table.getRows();
              const pos = row.getPosition();
              let insertAfter = pos;
              
              // Encontrar el último detalle del grupo actual
              for (let i = pos; i < rows.length; i++) {
                const nextRow = rows[i];
                const nextData = nextRow.getData();
                if (nextData[COL.ITEM] && nextData[COL.ITEM].trim() !== '' && 
                    i !== pos) {
                  break;
                }
                insertAfter = i;
              }
              
              this.addRow("detalle", null, insertAfter);
            }
          }
        ]
      },
      { separator: true },
      {
        label: "🗑️ Eliminar / Mover",
        menu: [
          {
            label: "🗑️ Eliminar fila actual",
            action: function (e, row) {
              if (confirm(`¿Eliminar la fila ${row.getPosition() + 1}?`)) {
                row.delete();
              }
            }
          },
          {
            label: "🗑️ Eliminar seleccionadas",
            action: function (e, row) {
              const table = row.getTable();
              const selected = table.getSelectedRows();

              if (selected.length === 0) {
                alert("⚠️ No hay filas seleccionadas.");
                return;
              }

              // Agrupamos las filas seleccionadas contiguas
              const positions = selected.map(r => r.getPosition()).sort((a, b) => a - b);
              const bloques = [];
              let bloque = [positions[0]];

              for (let i = 1; i < positions.length; i++) {
                if (positions[i] === positions[i - 1] + 1) {
                  bloque.push(positions[i]);
                } else {
                  bloques.push([...bloque]);
                  bloque = [positions[i]];
                }
              }
              bloques.push(bloque);

              if (confirm(`¿Eliminar ${selected.length} filas (${bloques.length} bloque${bloques.length > 1 ? 's' : ''})?`)) {
                bloques.forEach(bloque => {
                  bloque.forEach(pos => {
                    const row = table.getRowFromPosition(pos);
                    if (row) row.delete();
                  });
                });
              }
            },
          },
          { separator: true },
          {
            label: "⬆️ Mover fila arriba",
            action: function (e, row) {
              const table = row.getTable();
              const position = row.getPosition();
              if (position > 0) {
                table.moveRow(row, table.getRowFromPosition(position - 1), true); // antes
              }
            }
          },
          {
            label: "⬇️ Mover fila abajo",
            action: function (e, row) {
              const table = row.getTable();
              const position = row.getPosition();
              const nextRow = table.getRowFromPosition(position + 1);
              if (nextRow) {
                table.moveRow(row, nextRow, false); // después
              }
            }
          },
          {
            label: "↕️ Habilitar arrastre manual",
            action: function (e, row) {
              const table = row.getTable();
              if (!table.modules.moveRow) {
                alert("Debes habilitar la opción movableRows en la configuración del Tabulator.");
              } else {
                alert("Puedes arrastrar filas desde el icono o handle configurado.");
              }
            }
          }
        ]
      },
      { separator: true },
      {
        label: "Más opciones",
        menu: [
          {
            label: "🔁 Duplicar fila",
            action: (e, row) => {
              const data = row.getData();
              this.table.addRow({ ...data }, false, row.getPosition());
            }
          },
          {
            label: "📋 Copiar ítem",
            action: (e, row) => {
              navigator.clipboard.writeText(row.getData()[COL.ITEM]);
            }
          },
        ]
      }
    ];

    this.table = new Tabulator(this.containerId, {
      layout: "fitDataStretch",
      height: 'auto',
      rowContextMenu: rowMenu,
      selectable: true,
      rowHandle: true,   // opcional: agrega un handle visual
      rowContextMenu: rowMenu,
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
      columns: this.getColumnConfig()
    });

    this.table.on("tableBuilt", () => {
      this.loadSampleData();
    });

    this.setupEvents();
  }

  setupEvents() {
    this.table.on("cellEdited", (cell) => this.onCellEdited(cell));
    this.table.on("clipboardPasted", (clipboard, rowData, rows) =>
      this.onClipboardPasted(clipboard, rowData, rows)
    );
    this.table.on("rowAdded", (row) => this.onRowAdded(row));
  }

  onCellEdited(cell) {
    const field = parseInt(cell.getColumn().getField());
    const rowComponent = cell.getRow();
    const rowIndex = parseInt(rowComponent.getPosition());
    const data = cell.getRow().getData();

    if (!this.checkCellEdited(cell)) return;

    const address = { sheet: this.sheetID, col: field, row: rowIndex };
    this.hf.setCellContents(address, cell.getValue());

    // 🔹 columnas que afectan el cálculo
    const dependientes = [
      COL.ELEM_L,
      COL.L,
      COL.ANC,
      COL.ALT,
      COL.NVECES,
      COL.LON,
      COL.AREA,
      COL.VOL,
      COL.KG,
      COL.UND,
    ];

    if (dependientes.includes(field)) {
      this.updateRowFormula(rowComponent);
    }
  }

  checkCellEdited(cell) {
    if (!cell || typeof cell.getColumn !== "function") {
      console.warn("⚠️ checkCellEdited recibió un objeto inválido:", cell);
      return false;
    }

    const column = cell.getColumn();
    const columnDef = column?.getDefinition?.() ?? {};

    let isEditable = false;
    if (typeof columnDef.editable === "function") {
      isEditable = columnDef.editable(cell);
    } else {
      isEditable = columnDef.editor !== undefined;
    }

    if (!isEditable) {
      cell.restoreOldValue?.();
    }

    return isEditable;
  }

  async onClipboardPasted(clipboard, rowData, rows) {
    if (!rowData || rowData.length === 0) return;

    // Normalizar final de línea
    if (clipboard && clipboard.charAt(clipboard.length - 1) === "\n") {
      rowData = rowData.slice(0, rowData.length - 1);
    }

    // Recojo filas actuales (puede que Tabulator entregue un subconjunto)
    let currentRows = this.table.getRows();
    const existingRowCount = currentRows.length;
    const totalToPaste = rowData.length;

    // Si vienen más filas que las existentes, crear las faltantes de una sola vez (batch)
    if (totalToPaste > existingRowCount) {
      const missing = totalToPaste - existingRowCount;
      const newRows = new Array(missing).fill(0).map(() => ({ spare: true }));

      // Suspender onRowAdded mientras añadimos filas en lote
      this._suspendRowAdded = true;
      await this.table.addData(newRows); // addData añade varias filas y devuelve promise
      this._suspendRowAdded = false;

      // volver a tomar las filas actualizadas
      currentRows = this.table.getRows();
    }

    // Asegurar que tenemos al menos totalToPaste filas
    currentRows = this.table.getRows();
    if (currentRows.length < totalToPaste) {
      // fallback: si algo raro pasó, añadir las que faltan
      const missing = totalToPaste - currentRows.length;
      this._suspendRowAdded = true;
      await this.table.addData(new Array(missing).fill(0).map(() => ({ spare: true })));
      this._suspendRowAdded = false;
      currentRows = this.table.getRows();
    }

    // Asignar valores pegados a cada fila
    for (let i = 0; i < totalToPaste; i++) {
      const rowComponent = currentRows[i];
      const dataObj = rowData[i] || {};
      if (!rowComponent) continue;

      // eliminar marca spare si vamos a rellenar la fila
      if (rowComponent.getData().spare !== undefined) {
        delete rowComponent.getData().spare;
      }

      Object.entries(dataObj).forEach(([colField, value]) => {
        const cell = rowComponent.getCell(colField);
        if (!cell) return;

        const colDef = cell.getColumn().getDefinition();
        // sólo setear si columna es editable
        if ((colDef.editor || colDef.editable) && value !== "") {
          // si quieres, limpia espacios y/o convertir tipos aquí
          cell.setValue(String(value).trim());
        }
      });
    }

    // Después del pegado, aseguramos UNA sola fila spare al final (si no existe)
    const finalRows = this.table.getRows();
    const lastRow = finalRows[finalRows.length - 1];
    if (!lastRow || lastRow.getData().spare === undefined) {
      // suspender para evitar reentrada
      this._suspendRowAdded = true;
      await this.table.addRow({ spare: true }, false);
      this._suspendRowAdded = false;
    }

    // 🔹 Recalcular fórmulas tras el pegado
    const allRows = this.table.getRows();
    allRows.forEach((row, index) => {
      const und = row.getData()[`${COL.UND}`];
      if (und) this.updateRowFormula(index);
    });

    console.info(`✅ Pegado completado (${totalToPaste} filas aplicadas).`);
  }

  onRowAdded(row) {
    // si estamos en modo suspendido (batch add), no procesamos cada onRowAdded
    if (this._suspendRowAdded) return;

    const lastIndex = this.table.getRows().length - 1;
    row.update({ id: lastIndex });
    const rowPos = parseInt(lastIndex);

    // Defender contra tableModel undefined y usar this.hf / this.sheetID
    const formulas = this.tableModel?.formulas ?? {};
    Object.keys(formulas).forEach((col) => {
      const colPos = parseInt(col);
      const address = { sheet: this.sheetID, col: colPos, row: rowPos };
      const formula = (formulas[colPos] && formulas[colPos](rowPos + 1)) ?? "";
      if (formula !== "") {
        const updates = this.hf.setCellContents(address, formula);
        const updates_filter = updates.filter((update) => {
          return (
            this.hf.simpleCellAddressToString(update.address, update.address.sheet) ===
            this.hf.simpleCellAddressToString(address, address.sheet)
          );
        });
        updates_filter.forEach((update) => {
          this.table.updateData([
            {
              id: update.address.row,
              [`${update.address.col}`]: update.newValue,
            },
          ]);
        });
      }
    });

    // si la fila es spare (fila creada automáticamente vacía) no sincronizamos valores
    if (row.getData().spare !== undefined) {
      return;
    }

    // sincronizar valores de la fila nueva a HyperFormula (usar arrow para preservar this)
    row.getCells().forEach((cell) => {
      const colPos = parseInt(cell.getColumn().getField());
      const address = { sheet: this.sheetID, col: colPos, row: rowPos };
      if (!this.hf.doesCellHaveFormula(address)) {
        const updates = this.hf.setCellContents(address, cell.getValue());
        updates
          .filter((update) => {
            return (
              this.hf.simpleCellAddressToString(update.address, update.address.sheet) !==
              this.hf.simpleCellAddressToString(address, address.sheet)
            );
          })
          .forEach((update) => {
            this.table.updateData([
              {
                id: update.address.row,
                [`${update.address.col}`]: update.newValue,
              },
            ]);
          });
      }
    });
  }

  updateRowFormula(rowOrIndex) {
    const rows = this.table.getRows();
    let rowComponent;
    let hfRow;

    if (typeof rowOrIndex === 'number') {
      hfRow = rowOrIndex;
      if (hfRow < 0 || hfRow >= rows.length) return;
      rowComponent = rows[hfRow];
    } else {
      rowComponent = rowOrIndex;
      hfRow = rowComponent.getPosition();
    }

    const rowData = rowComponent.getData();
    if (!rowData) return;

    const und = rowData[`${COL.UND}`];
    if (und) {
      const result = UnidadMedida.applyToHF(this.hf, this.sheetID, und, hfRow, COL.UNDC);
      rowComponent.update({ [`${COL.UNDC}`]: result.value });
      this.updateParentTotal(rowComponent);
    }
  }

  async updateParentTotal(rowComponent) {
    // Recalculo jerárquico bottom-up: sumamos detalles y subpartidas hacia sus padres
    const rows = this.table.getRows();
    const parentTotals = new Map(); // key: itemCode, value: sum

    // Helper: get item code for a row, empty string means detail
    const getItemCode = (r) => r.getData()[`${COL.ITEM}`] || '';

    // Primero, inicializar parentTotals para todos items
    rows.forEach(r => {
      const code = getItemCode(r);
      if (code && code.trim() !== '') parentTotals.set(code, 0);
    });

    // Recorremos desde abajo hacia arriba y acumulamos
    for (let i = rows.length - 1; i >= 0; i--) {
      const r = rows[i];
      const data = r.getData();
      const code = getItemCode(r);
      const ownValue = parseFloat(data[`${COL.TOTAL}`]) || 0;

      if (!code) {
        // detalle: sumar al último item anterior
        // buscar item padre hacia arriba
        let j = i - 1;
        while (j >= 0) {
          const candidate = getItemCode(rows[j]);
          if (candidate && candidate.trim() !== '') {
            parentTotals.set(candidate, (parentTotals.get(candidate) || 0) + ownValue);
            break;
          }
          j--;
        }
      } else {
        // subpartida o partida: sumar su propio valor y, si tiene parent, propagar
        parentTotals.set(code, (parentTotals.get(code) || 0) + ownValue);
        // propagar hacia su padre (si existe)
        if (code.includes('.')) {
          const parentCode = code.split('.').slice(0, -1).join('.');
          parentTotals.set(parentCode, (parentTotals.get(parentCode) || 0) + parentTotals.get(code));
        }
      }
    }

    // Aplicar totales calculados a las filas de la tabla y en HyperFormula
    await this.batchManager.batch(() => {
      rows.forEach(r => {
        const code = getItemCode(r);
        if (code && parentTotals.has(code)) {
          const value = parentTotals.get(code) || 0;
          r.update({ [`${COL.TOTAL}`]: value });
          const idx = r.getPosition();
          this.batchManager.queueUpdate({ sheet: this.sheetID, col: COL.TOTAL, row: idx }, value);
        }
      });
    });
  }

  resyncToHF() {
    this.hf.clearSheet(this.sheetID);
    const rows = this.table.getRows();
    rows.forEach((row, hfRow) => {
      const rowData = row.getData();
      Object.entries(rowData).forEach(([field, value]) => {
        const col = parseInt(field);
        if (!isNaN(col) && col !== COL.TOTAL) {
          const address = { sheet: this.sheetID, col, row: hfRow };
          this.hf.setCellContents(address, value || null);
        }
      });
      this.updateRowFormula(hfRow);
    });
  }

  // Renumera partidas y subpartidas sin alterar filas detalle (filas sin ITEM)
  async renumberRows() {
    const data = this.table.getData();
    // Reconstruir contadores sobre los ítems actuales
    this.numerator.rebuildFromTable(data);

    // Recorrer y asignar nuevos códigos sequentialmente por nivel
    let rootCounter = 0;
    const parentMap = new Map();

    const updates = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const item = row[COL.ITEM];

      if (!item || item.toString().trim() === '') continue; // detalle

      const parts = item.toString().split('.');
      if (parts.length === 1) {
        rootCounter++;
        const newCode = String(rootCounter).padStart(2, '0');
        parentMap.set(newCode, newCode);
        if (newCode !== item) updates.push({ id: i, item: newCode });
      } else if (parts.length === 2) {
        const parent = parts[0];
        // asignar contador para ese padre
        const key = parentMap.get(parent) || parent;
        const childCount = (this.numerator.counters[parent] = (this.numerator.counters[parent] || 0) + 1);
        const newCode = `${key}.${String(childCount).padStart(2, '0')}`;
        if (newCode !== item) updates.push({ id: i, item: newCode });
      } else {
        // niveles más profundos: no manejados por ahora
      }
    }

    if (updates.length > 0) {
      // aplicar actualizaciones por índice
      const rowsComp = this.table.getRows();
      updates.forEach(u => {
        const r = rowsComp[u.id];
        if (r) r.update({ [`${COL.ITEM}`]: u.item });
      });
    }
  }

  async addRow(tipo = 'padre', parentItem = null, afterPosition = null) {
    try {
      // Suspender actualizaciones en lote durante la inserción
      this.batchManager.cancelPendingUpdates();
      
      const rows = this.table.getRows();
      let insertPosition = afterPosition !== null ? afterPosition : rows.length - 1;
      
      // Determinar la posición de inserción basada en el tipo y contexto
      if (afterPosition !== null && rows[afterPosition]) {
        const currentRow = rows[afterPosition];
        const currentItem = currentRow.getData()[COL.ITEM] || '';
        
        switch (tipo) {
          case 'detalle':
            // Insertar detalle inmediatamente después de la fila seleccionada
            insertPosition = afterPosition;
            break;
            
          case 'hijo':
            if (currentItem) {
              // Si la fila seleccionada tiene un ítem, insertar después
              insertPosition = afterPosition;
              // Actualizar parentItem al ítem actual si no se proporcionó uno
              if (!parentItem) {
                parentItem = currentItem.includes('.') ? 
                  currentItem.split('.')[0] : currentItem;
              }
            }
            break;
            
          case 'padre':
            // Buscar el final del grupo actual para insertar el nuevo padre
            for (let i = afterPosition + 1; i < rows.length; i++) {
              const nextItem = rows[i].getData()[COL.ITEM] || '';
              if (!nextItem || this.numerator.getLevel(nextItem) >= 
                  this.numerator.getLevel(currentItem)) {
                continue;
              }
              insertPosition = i - 1;
              break;
            }
            break;
        }
      }
      
      // Preparar datos de la nueva fila con valores por defecto seguros
      const newRow = {
        [`${COL.ITEM}`]: tipo === 'detalle' ? '' : this.numerator.getNextNumber(parentItem),
        [`${COL.DESCRIPCION}`]: '',
        [`${COL.UND}`]: tipo === 'detalle' ? 'und' : '',
        [`${COL.ELEM_L}`]: '',
        [`${COL.L}`]: '',
        [`${COL.ANC}`]: '',
        [`${COL.ALT}`]: '',
        [`${COL.NVECES}`]: tipo === 'detalle' ? '1' : '',
        [`${COL.LON}`]: '',
        [`${COL.AREA}`]: '',
        [`${COL.VOL}`]: '',
        [`${COL.KG}`]: '',
        [`${COL.UNDC}`]: '',
        [`${COL.TOTAL}`]: 0
      };

      // Insertar la nueva fila en la posición calculada
      const insertedRow = await this.table.addRow(newRow, false, insertPosition + 1);

      // Actualizar HyperFormula de manera optimizada
      const rowIndex = insertedRow.getPosition();
      await this.batchManager.batch(async () => {
        // Sincronizar datos con HyperFormula
        Object.entries(newRow).forEach(([field, value]) => {
          const col = parseInt(field);
          if (!isNaN(col) && col !== COL.TOTAL) {
            this.batchManager.queueUpdate(
              { sheet: this.sheetID, col, row: rowIndex },
              value || null
            );
          }
        });

        // Si es un detalle, actualizar su parent
        if (tipo === 'detalle' && afterPosition !== null) {
          const parentRow = this.findParentRow(afterPosition);
          if (parentRow) {
            await this.updateParentTotal(parentRow);
          }
        }
      });

      // Renumerar y recalcular la jerarquía
      if (tipo !== 'detalle') {
        await this.renumberRows();
      }
      await this.recalculateHierarchy();

      return insertedRow;
    } catch (error) {
      console.error('Error al insertar fila:', error);
      return null;
    }

    // Actualizar HyperFormula de manera optimizada
    const rowIndex = insertedRow.getPosition();
    Object.entries(newRow).forEach(([field, value]) => {
      const col = parseInt(field);
      if (!isNaN(col) && col !== COL.TOTAL) {
        this.batchManager.queueUpdate(
          { sheet: this.sheetID, col, row: rowIndex },
          value || null
        );
      }
    });

    // Renumerar y recalcular
  if (typeof this.renumberRows === 'function') await this.renumberRows();
    await this.recalculateHierarchy();

    return insertedRow;
  }

  deleteSelectedRows() {
    const selectedRows = this.table.getSelectedRows();
    if (selectedRows.length === 0) {
      alert("Selecciona al menos una fila para eliminar");
      return;
    }
    selectedRows.forEach(row => row.delete());
    this.resyncToHF();
  }

  getData() {
    return this.table.getData();
  }

  setData(data) {
    this.table.setData(data);
  }

  loadSampleData() {
    const sampleData = [
      {
        [`${COL.ITEM}`]: '01',
        [`${COL.DESCRIPCION}`]: 'TRABAJOS PRELIMINARES',
        [`${COL.UND}`]: '',
        [`${COL.TOTAL}`]: 0
      },
      {
        [`${COL.ITEM}`]: '01.01',
        [`${COL.DESCRIPCION}`]: 'LIMPIEZA DE TERRENO',
        [`${COL.UND}`]: 'm2',
        [`${COL.ELEM_L}`]: 10,
        [`${COL.ANC}`]: 5,
        [`${COL.NVECES}`]: 1,
        [`${COL.TOTAL}`]: 50
      },
      {
        [`${COL.ITEM}`]: '',
        [`${COL.DESCRIPCION}`]: 'Área principal',
        [`${COL.UND}`]: 'm2',
        [`${COL.AREA}`]: 50,
        [`${COL.NVECES}`]: 1,
        [`${COL.TOTAL}`]: 50
      },
      {
        [`${COL.ITEM}`]: '01.02',
        [`${COL.DESCRIPCION}`]: 'TRAZO Y REPLANTEO',
        [`${COL.UND}`]: 'm',
        [`${COL.LON}`]: 30,
        [`${COL.NVECES}`]: 1,
        [`${COL.TOTAL}`]: 30
      },
      {
        [`${COL.ITEM}`]: '02',
        [`${COL.DESCRIPCION}`]: 'MOVIMIENTO DE TIERRAS',
        [`${COL.UND}`]: '',
        [`${COL.TOTAL}`]: 0
      },
      {
        [`${COL.ITEM}`]: '02.01',
        [`${COL.DESCRIPCION}`]: 'EXCAVACIÓN',
        [`${COL.UND}`]: 'm3',
        [`${COL.ELEM_L}`]: 2,
        [`${COL.ANC}`]: 1.5,
        [`${COL.ALT}`]: 0.8,
        [`${COL.NVECES}`]: 1,
        [`${COL.TOTAL}`]: 2.4
      }
    ];

    this.table.setData(sampleData);

    // ✅ Usa un microtask para asegurar que las filas están listas
    Promise.resolve().then(() => {
      const rows = this.table.getRows();
      rows.forEach((row) => {
        const hfRow = row.getIndex(); // ✅ clave
        const rowData = row.getData();

        // Cargar datos en HyperFormula (excepto TOTAL)
        Object.entries(rowData).forEach(([field, value]) => {
          const col = parseInt(field);
          if (!isNaN(col) && col !== COL.TOTAL) {
            const address = { sheet: this.sheetID, col, row: hfRow };
            this.hf.setCellContents(address, value || null);
          }
        });

        // Aplicar fórmula si hay unidad
        const und = rowData[`${COL.UND}`];
        if (und) {
          this.updateRowFormula(hfRow);
        }
      });

      // Actualizar resumen
      if (window.metradoManager?.resumenTable) {
        window.metradoManager.resumenTable.updateFromMetrado(this.getData());
      }
    });
  }
}

// ============================================
// CLASE: TABLA DE RESUMEN
// ============================================

class ResumenTable {
  constructor(containerId) {
    this.containerId = containerId;
    this.table = null;
    this.createTable();
  }

  getColumnConfig() {
    return [
      {
        title: "ITEM",
        field: `${COL.ITEM}`,
        width: 120,
        formatter: (cell) => `<b>${cell.getValue() || ''}</b>`
      },
      {
        title: "DESCRIPCIÓN",
        field: `${COL.DESCRIPCION}`,
        width: 400,
        hozAlign: "left"
      },
      {
        title: "UND",
        field: `${COL.UND}`,
        width: 80
      },
      {
        title: "PARCIAL",
        field: "3",
        width: 150,
        formatter: makeRoundFormatter(2)
      },
      {
        title: "TOTAL",
        field: "4",
        width: 150,
        ...CURRENCY_CONFIG,
        bottomCalc: "sum",
        bottomCalcParams: { precision: 2 },
        bottomCalcFormatter: "money",
        bottomCalcFormatterParams: CURRENCY_CONFIG.formatterParams
      }
    ];
  }

  createTable() {
    this.table = new Tabulator(this.containerId, {
      layout: "fitDataStretch",
      layoutColumnsOnNewData: true,
      columnHeaderVertAlign: "middle",
      height: "400px",
      columnDefaults: {
        hozAlign: "center",
        headerHozAlign: "center",
        headerWordWrap: true,
        resizable: true,
      },
      columns: this.getColumnConfig()
    });
  }

  updateFromMetrado(metradoData) {
    const resumenData = metradoData
      .filter(row => row[`${COL.ITEM}`] && row[`${COL.ITEM}`].trim() !== '')
      .map(row => ({
        [`${COL.ITEM}`]: row[`${COL.ITEM}`],
        [`${COL.DESCRIPCION}`]: row[`${COL.DESCRIPCION}`] || '',
        [`${COL.UND}`]: row[`${COL.UND}`] || '',
        3: parseFloat(row[`${COL.TOTAL}`] || 0),
        4: parseFloat(row[`${COL.TOTAL}`] || 0)
      }));
    this.table.setData(resumenData);
  }

  getData() {
    return this.table.getData();
  }
}

// ============================================
// CLASE PRINCIPAL
// ============================================

class MetradoComunicacionManager {
  constructor() {
    this.hf = this.initializeHyperFormula();
    this.metradoTable = null;
    this.resumenTable = null;
  }

  initializeHyperFormula() {
    const hf = HyperFormula.buildEmpty({
      licenseKey: "gpl-v3",
      chooseAddressMappingPolicy: HyperFormula.AlwaysSparse,
      useColumnIndex: true,
      evaluateNullToZero: true,
    });

    const errors = hf._config.translationPackage.errors;
    Object.keys(errors).forEach((error) => {
      errors[error] = "";
    });

    return hf;
  }

  initialize() {
    this.metradoTable = new MetradoTable("#tbl_insumos", this.hf);
    this.resumenTable = new ResumenTable("#tbl_resumen");

    setTimeout(() => {
      this.setupGlobalFunctions();
      const data = this.metradoTable.getData();
      this.resumenTable.updateFromMetrado(data);
    }, 100);
  }

  setupGlobalFunctions() {
    window.addParentRow = () => this.metradoTable.addRow('padre');

    window.addChildRow = () => {
      const selected = this.metradoTable.table.getSelectedRows();
      if (selected.length === 0) {
        alert("Selecciona una fila padre primero");
        return;
      }
      const parentItem = selected[0].getData()[`${COL.ITEM}`];
      if (!parentItem || parentItem.trim() === '') {
        alert("La fila seleccionada debe tener un ITEM válido");
        return;
      }
      this.metradoTable.addRow('hijo', parentItem);
    };

    window.addDescriptiveRow = () => this.metradoTable.addRow('descriptiva');

    window.deleteRows = () => this.metradoTable.deleteSelectedRows();

    window.generateResumen = () => {
      const data = this.metradoTable.getData();
      this.resumenTable.updateFromMetrado(data);
    };
  }

  saveData() {
    return {
      metrado: this.metradoTable.getData(),
      resumen: this.resumenTable.getData()
    };
  }

  loadData(data) {
    if (data.metrado) this.metradoTable.setData(data.metrado);
    if (data.resumen) this.resumenTable.setData(data.resumen);
  }
}

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  const manager = new MetradoComunicacionManager();
  manager.initialize();

  window.metradoManager = manager;

  console.log("✅ Metrado de Comunicación inicializado");
});

// Exportar para Vite
export default MetradoComunicacionManager; 