// ======================================
// 1. CONFIGURACIÓN GLOBAL Y INICIALIZACIÓN
// ======================================

import { createApp, ref, reactive, onMounted, defineComponent, nextTick, computed, onBeforeUnmount } from 'vue';

// Variables globales del sistema
const { id_mantenimiento, datamantemiento, csrfToken } = window.APP_INIT || {};
let hf; // Instancia de HyperFormula

// Agregar después de las variables globales (línea ~10)
const dataCache = {
    initialized: false,
    tables: {
        insumos: null,
        cotizaciones: null,
        mano_obra: null,
        materiales: null,
        equipos: null,
        resumen: null,
    }
};

// ======================================
// 2. UTILIDADES CORE
// ======================================

class CoreUtils {
    static initHyperFormula() {
        hf = HyperFormula.buildEmpty({
            licenseKey: "gpl-v3",
            chooseAddressMappingPolicy: HyperFormula.AlwaysSparse,
            useColumnIndex: true,
            evaluateNullToZero: true,
        });

        // Limpiar mensajes de error
        const errors = hf._config.translationPackage.errors;
        Object.keys(errors).forEach(error => errors[error] = "");
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

    static formatCurrency(value) {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value || 0);
    }

    static getConclusion(value) {
        if (value > 0) return "SE GANA";
        if (value < 0) return "SE PIERDE";
        return "NEUTRO";
    }
}

// ======================================
// 3. CONFIGURACIONES DE COLUMNAS Y FORMATTERS
// ======================================

class ColumnConfig {
    static get CURRENCY_FORMATTER() {
        return {
            formatter: "money",
            formatterParams: {
                decimal: ".",
                thousand: ",",
                symbol: "S/ ",
                precision: 2,
            },
        };
    }

    static get TOTAL_COLUMN() {
        return {
            bottomCalc: "sum",
            bottomCalcParams: { precision: 2 },
            bottomCalcFormatter: "money",
            bottomCalcFormatterParams: this.CURRENCY_FORMATTER.formatterParams,
        };
    }

    static makeRoundFormatter(precision) {
        return (cell) => {
            const value = parseFloat(cell.getValue());
            return isNaN(value) ? "" : value.toFixed(precision);
        };
    }

    static get PERCENT_FORMATTER() {
        return {
            formatter: (cell) => {
                const value = parseFloat(cell.getValue());
                if (isNaN(value)) return "";
                return (value * 100).toFixed(2) + "%";
            }
        };
    }

    static calcTitle(title) {
        return () => title;
    }
}

// ======================================
// 4. FACTORY DE CONFIGURACIONES DE TABLA
// ======================================

class TableConfigFactory {
    static createInsumosConfig(dynamicColumns = 1) {
        const baseColumns = this._getBaseInsumosColumns();
        const dynamicCols = this._getDynamicReceiptColumns(dynamicColumns);
        const formulas = this._createInsumosFormulas(dynamicColumns);

        return {
            columns: [{
                title: `INSUMOS - ${datamantemiento?.nombre_proyecto_mant || ''}`,
                columns: [...baseColumns, ...dynamicCols]
            }],
            formulas
        };
    }

    static _getBaseInsumosColumns() {
        return [
            {
                title: "",
                formatter: () => `<div class="action-buttons">
                    <button class="delete-row" title="Eliminar registro">🗑️</button>
                </div>`,
                cellClick: this._handleRowActions,
            },
            {
                title: "ITEM",
                field: "0",
                formatter: "rownum",
                width: 60
            },
            {
                title: "DESCRIPCIÓN",
                field: "1",
                hozAlign: "left",
                editor: "input",
                width: 250
            },
            {
                title: "UND.",
                field: "2",
                editor: "input",
                width: 80
            },
            {
                title: "CANTIDAD EXP.",
                field: "3",
                editor: "number",
                width: 120
            },
            {
                title: "CANTIDAD CORREG.",
                field: "4",
                editor: "number",
                width: 140
            },
            {
                title: "PRECIO CORREG.",
                field: "5",
                editor: "number",
                ...ColumnConfig.CURRENCY_FORMATTER,
                width: 120
            },
            {
                title: "PRECIO EXP.",
                field: "6",
                editor: "number",
                ...ColumnConfig.CURRENCY_FORMATTER,
                bottomCalc: ColumnConfig.calcTitle("SUBTOTAL"),
                width: 120
            },
            {
                title: "PARCIAL EXP.",
                field: "7",
                ...ColumnConfig.CURRENCY_FORMATTER,
                ...ColumnConfig.TOTAL_COLUMN,
                width: 120
            },
            {
                title: "PARCIAL CORREG.",
                field: "8",
                ...ColumnConfig.CURRENCY_FORMATTER,
                ...ColumnConfig.TOTAL_COLUMN,
                width: 140
            },
            {
                title: "VARIACION DE MATERIAL",
                field: "9",
                ...ColumnConfig.TOTAL_COLUMN,
                formatter: ColumnConfig.makeRoundFormatter(4),
                width: 180
            },
            {
                title: "MATERIAL COMPRADO",
                field: "10",
                ...ColumnConfig.TOTAL_COLUMN,
                formatter: ColumnConfig.makeRoundFormatter(2),
                width: 160
            },
            {
                title: "DIFERENCIA DE MATERIAL",
                field: "11",
                ...ColumnConfig.TOTAL_COLUMN,
                formatter: ColumnConfig.makeRoundFormatter(2),
                width: 180
            },
            {
                title: "PRECIO",
                field: "12",
                ...ColumnConfig.CURRENCY_FORMATTER,
                ...ColumnConfig.TOTAL_COLUMN,
                width: 120
            },
            {
                title: "DIFERENCIA DE PRECIO",
                field: "13",
                ...ColumnConfig.CURRENCY_FORMATTER,
                ...ColumnConfig.TOTAL_COLUMN,
                width: 180
            },
        ];
    }

    static _getDynamicReceiptColumns(count) {
        const columns = [];
        for (let i = 1; i <= count; i++) {
            const baseIndex = 4 * (i - 1) + 14;
            columns.push({
                title: `RECEPCION DE MATERIALES ${i}`,
                columns: [
                    {
                        title: "FECHA",
                        field: `${baseIndex}`,
                        editor: "date",
                        width: 120
                    },
                    {
                        title: "C.R.",
                        field: `${baseIndex + 1}`,
                        editor: "number",
                        width: 80
                    },
                    {
                        title: "P.U.",
                        field: `${baseIndex + 2}`,
                        ...ColumnConfig.CURRENCY_FORMATTER,
                        editor: "number",
                        bottomCalc: ColumnConfig.calcTitle("TOTAL"),
                        width: 100
                    },
                    {
                        title: "P.S.T.",
                        field: `${baseIndex + 3}`,
                        ...ColumnConfig.CURRENCY_FORMATTER,
                        ...ColumnConfig.TOTAL_COLUMN,
                        width: 120
                    },
                ]
            });
        }
        return columns;
    }

    static _createInsumosFormulas(dynamicColumns) {
        const formulas = {
            7: (row) => `=+D${row}*G${row}`,  // PARCIAL EXP
            8: (row) => `=+E${row}*G${row}`,  // PARCIAL CORREG
            9: (row) => `=+H${row}-I${row}`,  // VARIACION DE MATERIAL
        };

        // Generar fórmulas dinámicas
        const materialParts = [];
        const precioParts = [];

        for (let i = 1; i <= dynamicColumns; i++) {
            const cantIndex = 4 * (i - 1) + 16;
            const parcialIndex = 4 * (i - 1) + 17;

            materialParts.push(`${CoreUtils.excelColumn(cantIndex)}`);
            precioParts.push(`${CoreUtils.excelColumn(parcialIndex)}`);

            // Fórmula para P.S.T. de cada recepción
            //formulas[parcialIndex] = (row) =>`=+${CoreUtils.excelColumn(cantIndex)}${row}*${CoreUtils.excelColumn(puIndex)}${row}`;
        }

        // MATERIAL COMPRADO y PRECIO
        formulas[10] = (row) => {
            const formula = materialParts.map(part => `${part}${row}`).join('+');
            return `=${formula || '0'}`;
        };

        formulas[11] = (row) => `=+E${row}-K${row}`;  // DIFERENCIA DE MATERIAL

        formulas[12] = (row) => {
            const formula = precioParts.map(part => `${part}${row}`).join('+');
            return `=${formula || '0'}`;
        };

        formulas[13] = (row) => `=+I${row}-M${row}`;  // DIFERENCIA DE PRECIO

        for (let i = 1; i <= dynamicColumns; i++) {
            const parcialIndex = 4 * (dynamicColumns - 1) + 1 + 16;
            formulas[parcialIndex] = (row) => {
                const cantIndex = 4 * (dynamicColumns - 1) + 1 + 15;
                const puIndex = 4 * (dynamicColumns - 1) + 1 + 16;
                return `=+${CoreUtils.excelColumn(cantIndex)}${row}*${CoreUtils.excelColumn(puIndex)}${row}`;
            };
        }

        return formulas;
    }

    static _handleRowActions(e, cell) {
        const row = cell.getRow();
        const action = e.target.className;

        if (action === "delete-row") {
            const deletedRow = row.getData();

            if (deletedRow.item && !deletedRow.isDescriptionRow) {
                const parent = row.getTreeParent();
                if (parent) {
                    const siblings = parent.getTreeChildren()
                        .filter(child => {
                            const childData = child.getData();
                            return childData.item && !childData.isDescriptionRow;
                        });

                    row.delete();

                    // Renumerar hermanos
                    siblings.forEach((sibling, index) => {
                        if (sibling.getData().id !== deletedRow.id) {
                            const baseItem = deletedRow.item.split('.').slice(0, -1).join('.');
                            const newNumber = (index + 1).toString().padStart(2, '0');
                            sibling.update({ item: `${baseItem}.${newNumber}` });
                        }
                    });
                }
            } else {
                row.delete();
            }
        }
    }

    //Cotizaciones
    static _getDynamicReceiptColumnsCotizacion(count) {
        const columns = [];
        for (let i = 1; i <= count; i++) {
            columns.push({
                title: `COTIZACIÓN ${i}`,
                columns: [
                    {
                        title: "PROVEEDOR",
                        field: `${2 * (i - 1) + 1 + 6}`,
                        editor: "input",
                    },
                    {
                        title: "P.U.",
                        field: `${2 * (i - 1) + 1 + 7}`,
                        ...ColumnConfig.CURRENCY_FORMATTER,
                        editor: "number",
                    }
                ],
            });
        }
        return columns;
    }

    static _getBaseCotizacionColumns(dynamicColumns = 1) {
        return [
            {
                title: "REQUERIEMIENTO",
                columns: [
                    { title: "ITEM", field: "0", formatter: "rownum" },
                    { title: "DESCRIPCIÓN", field: "1", hozAlign: "left" },
                    { title: "UND.", field: "2" },
                    {
                        title: "COTIZACIÓN CON PRECIO DE EXPEDIENTE CORREGIDO",
                        columns: [
                            {
                                title: "CANTIDAD PRESUPUESTADA",
                                field: "3",
                            },
                            {
                                title: "CANTIDAD CORREGIDA",
                                field: "4",
                            },
                            {
                                title: "PRECIO",
                                field: "5",
                                ...ColumnConfig.CURRENCY_FORMATTER,
                                bottomCalc: ColumnConfig.calcTitle("SUBTOTAL"),
                            },
                            {
                                title: "PARCIAL",
                                field: "6",
                                ...ColumnConfig.CURRENCY_FORMATTER,
                                ...ColumnConfig.TOTAL_COLUMN,
                            },
                        ],
                    },
                ],
            },
            ...this._getDynamicReceiptColumnsCotizacion(dynamicColumns),
            {
                title: "A COMPRAR EL MENOR PRECIO",
                columns: [
                    { title: "CANTIDAD", field: "26" },
                    {
                        title: "P.U.",
                        field: "27",
                        ...ColumnConfig.CURRENCY_FORMATTER,
                        bottomCalc: ColumnConfig.calcTitle("SUBTOTAL"),
                    },
                    {
                        title: "PARCIAL",
                        field: "28",
                        ...ColumnConfig.CURRENCY_FORMATTER,
                        ...ColumnConfig.TOTAL_COLUMN,
                    },
                ],
            },
        ];
    }

    static _createCotizacionesFormulas(dynamicColumns) {
        const formulas = {
            6: (row) => {
                return `=+E${row}*F${row}`;
            },
            28: (row) => {
                return `=+AA${row}*AB${row}`;
            },
            27: (row) => {
                const columns = [];
                for (
                    let index = "I".charCodeAt(0);
                    index <= "Z".charCodeAt(0);
                    index += 2
                ) {
                    columns.push(`${String.fromCharCode(index)}${row}`);
                }
                return "=+MIN(" + columns.join() + ")";
            },
            26: (row) => {
                return `=+E${row}`;
            },
        };
        return formulas;
    }

    static createCotizacionesConfig(dynamicColumns = 1) {
        const baseColumns = this._getBaseCotizacionColumns(dynamicColumns);
        const formulas = this._createCotizacionesFormulas(dynamicColumns);

        return {
            columns: [{
                title: `COTIZACIONES - ${datamantemiento?.nombre_proyecto_mant || ''}`,
                columns: [...baseColumns]
            }],
            formulas
        };
    }


    //Mano de obra
    static _getBaseManoObraColumns() {
        const cotizacionesCount = 3; // Número de cotizaciones
        return [
            {
                title: "",
                formatter: () => `<div class="action-buttons">
                    <button class="delete-row" title="Eliminar registro">🗑️</button>
                </div>`,
                cellClick: this._handleRowActions,
            },
            {
                title: "ITEM",
                field: "0",
                formatter: "rownum"
            },
            {
                title: "DESCRIPCIÓN",
                field: "1",
                hozAlign: "left",
                editor: "input"
            },
            {
                title: "UND.",
                field: "2",
                editor: "input",
            },
            {
                title: "CANTIDAD.",
                field: "3",
                editor: "number",
            },
            {
                title: "PRECIO COTIZADO",
                field: "4",
                editor: "number",
                ...ColumnConfig.CURRENCY_FORMATTER,
                bottomCalc: ColumnConfig.calcTitle("SUBTOTAL")
            },
            {
                title: "PARCIAL EXP.",
                field: "5",
                ...ColumnConfig.CURRENCY_FORMATTER,
                ...ColumnConfig.TOTAL_COLUMN
            },
            {
                title: "CANTIDAD CORREG.",
                field: "6",
                editor: "number"
            },
            ...this._getBaseCotizacionMaterialesColumns(cotizacionesCount),
            {
                title: "PRECIO MENOR.",
                field: "13",
                ...ColumnConfig.CURRENCY_FORMATTER,
                ...ColumnConfig.TOTAL_COLUMN,
                bottomCalc: ColumnConfig.calcTitle("SUBTOTAL")
            },
            {
                title: "PARCIAL CORREGIDO.",
                field: "14",
                ...ColumnConfig.CURRENCY_FORMATTER,
                ...ColumnConfig.TOTAL_COLUMN
            }
        ];
    }

    static _getBaseCotizacionManoObraColumns(count) {
        const columns = [];
        for (let i = 1; i <= count; i++) {
            columns.push({
                title: `COTIZACIÓN ${i}`,
                columns: [
                    {
                        title: "PROVEEDOR",
                        field: `${2 * (i - 1) + 1 + 6}`,
                        editor: "input",
                    },
                    {
                        title: "P.U.",
                        field: `${2 * (i - 1) + 1 + 7}`,
                        ...ColumnConfig.CURRENCY_FORMATTER,
                        editor: "number",
                    }
                ],
            });
        }
        return columns;
    }

    static _getDynamicReceiptColumnsManoObra(count) {
        const columns = [];
        for (let i = 1; i <= count; i++) {
            const baseIndex = 4 * (i - 1) + 15;
            columns.push({
                title: `ENVIO ${i}`,
                columns: [
                    {
                        title: "FECHA",
                        field: `${baseIndex}`,
                        editor: "date",
                    },
                    {
                        title: "CANTIDAD",
                        field: `${baseIndex + 1}`,
                        editor: "number"
                    },
                    {
                        title: "PRECIO",
                        field: `${baseIndex + 2}`,
                        ...ColumnConfig.CURRENCY_FORMATTER,
                        editor: "number",
                        bottomCalc: ColumnConfig.calcTitle("TOTAL")
                    },
                    {
                        title: "PARCIAL",
                        field: `${baseIndex + 3}`,
                        ...ColumnConfig.CURRENCY_FORMATTER,
                        ...ColumnConfig.TOTAL_COLUMN
                    },
                ]
            });
        }
        return columns;
    }

    static _createManoObraFormulas(dynamicColumns) {
        const formulas = {
            5: (row) => `=+D${row}*E${row}`,  // PARCIAL EXP
            13: (row) => {
                const columns = [];
                for (
                    let index = "I".charCodeAt(0);
                    index <= "M".charCodeAt(0);
                    index += 2
                ) {
                    columns.push(`${String.fromCharCode(index)}${row}`);
                }
                return "=+MIN(" + columns.join() + ")";
            },
            14: (row) => `=+G${row}*N${row}`,  // PARCIAL EXP
        };

        for (let i = 1; i <= dynamicColumns; i++) {
            const parcialIndex = 4 * (dynamicColumns - 1) + 1 + 17;
            formulas[parcialIndex] = (row) => {
                const cantIndex = 4 * (dynamicColumns - 1) + 1 + 16;
                const puIndex = 4 * (dynamicColumns - 1) + 1 + 17;
                return `=+${CoreUtils.excelColumn(cantIndex)}${row}*${CoreUtils.excelColumn(puIndex)}${row}`;
            };
        }

        return formulas;
    }

    static createManoObraConfig(dynamicColumns = 1) {
        const baseColumns = this._getBaseManoObraColumns(dynamicColumns);
        const dynamicCols = this._getDynamicReceiptColumnsManoObra(dynamicColumns);
        const formulas = this._createManoObraFormulas(dynamicColumns);

        return {
            columns: [{
                title: `Mano de Obra - ${datamantemiento?.nombre_proyecto_mant || ''}`,
                columns: [...baseColumns, ...dynamicCols]
            }],
            formulas
        };
    }

    //Materiales
    static _getBaseMaterialesColumns() {
        const cotizacionesCount = 3; // Número de cotizaciones
        return [
            {
                title: "",
                formatter: () => `<div class="action-buttons">
                    <button class="delete-row" title="Eliminar registro">🗑️</button>
                </div>`,
                cellClick: this._handleRowActions,
            },
            {
                title: "ITEM",
                field: "0",
                formatter: "rownum"
            },
            {
                title: "DESCRIPCIÓN",
                field: "1",
                hozAlign: "left",
                editor: "input"
            },
            {
                title: "UND.",
                field: "2",
                editor: "input",
            },
            {
                title: "CANTIDAD.",
                field: "3",
                editor: "number",
            },
            {
                title: "PRECIO COTIZADO",
                field: "4",
                editor: "number",
                ...ColumnConfig.CURRENCY_FORMATTER,
                bottomCalc: ColumnConfig.calcTitle("SUBTOTAL")
            },
            {
                title: "PARCIAL EXP.",
                field: "5",
                ...ColumnConfig.CURRENCY_FORMATTER,
                ...ColumnConfig.TOTAL_COLUMN
            },
            {
                title: "CANTIDAD CORREG.",
                field: "6",
                editor: "number"
            },
            ...this._getBaseCotizacionMaterialesColumns(cotizacionesCount),
            {
                title: "PRECIO MENOR.",
                field: "13",
                ...ColumnConfig.CURRENCY_FORMATTER,
                ...ColumnConfig.TOTAL_COLUMN,
                bottomCalc: ColumnConfig.calcTitle("SUBTOTAL")
            },
            {
                title: "PARCIAL CORREGIDO.",
                field: "14",
                ...ColumnConfig.CURRENCY_FORMATTER,
                ...ColumnConfig.TOTAL_COLUMN
            }
        ];
    }

    static _getBaseCotizacionMaterialesColumns(count) {
        const columns = [];
        for (let i = 1; i <= count; i++) {
            columns.push({
                title: `COTIZACIÓN ${i}`,
                columns: [
                    {
                        title: "PROVEEDOR",
                        field: `${2 * (i - 1) + 1 + 6}`,
                        editor: "input",
                    },
                    {
                        title: "P.U.",
                        field: `${2 * (i - 1) + 1 + 7}`,
                        ...ColumnConfig.CURRENCY_FORMATTER,
                        editor: "number",
                    }
                ],
            });
        }
        return columns;
    }

    static _getDynamicReceiptColumnsMateriales(count) {
        const columns = [];
        for (let i = 1; i <= count; i++) {
            const baseIndex = 4 * (i - 1) + 15;
            columns.push({
                title: `ENVIO ${i}`,
                columns: [
                    {
                        title: "FECHA",
                        field: `${baseIndex}`,
                        editor: "date",
                    },
                    {
                        title: "CANTIDAD",
                        field: `${baseIndex + 1}`,
                        editor: "number"
                    },
                    {
                        title: "PRECIO",
                        field: `${baseIndex + 2}`,
                        ...ColumnConfig.CURRENCY_FORMATTER,
                        editor: "number",
                        bottomCalc: ColumnConfig.calcTitle("TOTAL")
                    },
                    {
                        title: "PARCIAL",
                        field: `${baseIndex + 3}`,
                        ...ColumnConfig.CURRENCY_FORMATTER,
                        ...ColumnConfig.TOTAL_COLUMN
                    },
                ]
            });
        }
        return columns;
    }

    static _createMaterialesFormulas(dynamicColumns) {
        const formulas = {
            5: (row) => `=+D${row}*E${row}`,  // PARCIAL EXP
            13: (row) => {
                const columns = [];
                for (
                    let index = "I".charCodeAt(0);
                    index <= "M".charCodeAt(0);
                    index += 2
                ) {
                    columns.push(`${String.fromCharCode(index)}${row}`);
                }
                return "=+MIN(" + columns.join() + ")";
            },
            14: (row) => `=+G${row}*N${row}`,  // PARCIAL EXP
        };

        for (let i = 1; i <= dynamicColumns; i++) {
            const parcialIndex = 4 * (dynamicColumns - 1) + 1 + 17;
            formulas[parcialIndex] = (row) => {
                const cantIndex = 4 * (dynamicColumns - 1) + 1 + 16;
                const puIndex = 4 * (dynamicColumns - 1) + 1 + 17;
                return `=+${CoreUtils.excelColumn(cantIndex)}${row}*${CoreUtils.excelColumn(puIndex)}${row}`;
            };
        }

        return formulas;
    }

    static createMaterialesConfig(dynamicColumns = 1) {
        console.log("Creating Materiales Config with dynamicColumns:", dynamicColumns);
        const baseColumns = this._getBaseMaterialesColumns(dynamicColumns);
        const dynamicCols = this._getDynamicReceiptColumnsMateriales(dynamicColumns);
        const formulas = this._createMaterialesFormulas(dynamicColumns);

        return {
            columns: [{
                title: `Materiales - ${datamantemiento?.nombre_proyecto_mant || ''}`,
                columns: [...baseColumns, ...dynamicCols]
            }],
            formulas
        };
    }

    //Equipos
    static _getBaseEquiposColumns() {
        const cotizacionesCount = 3; // Número de cotizaciones
        return [
            {
                title: "",
                formatter: () => `<div class="action-buttons">
                    <button class="delete-row" title="Eliminar registro">🗑️</button>
                </div>`,
                cellClick: this._handleRowActions,
            },
            {
                title: "ITEM",
                field: "0",
                formatter: "rownum"
            },
            {
                title: "DESCRIPCIÓN",
                field: "1",
                hozAlign: "left",
                editor: "input"
            },
            {
                title: "UND.",
                field: "2",
                editor: "input",
            },
            {
                title: "CANTIDAD.",
                field: "3",
                editor: "number",
            },
            {
                title: "PRECIO COTIZADO",
                field: "4",
                editor: "number",
                ...ColumnConfig.CURRENCY_FORMATTER,
                bottomCalc: ColumnConfig.calcTitle("SUBTOTAL")
            },
            {
                title: "PARCIAL EXP.",
                field: "5",
                ...ColumnConfig.CURRENCY_FORMATTER,
                ...ColumnConfig.TOTAL_COLUMN
            },
            {
                title: "CANTIDAD CORREG.",
                field: "6",
                editor: "number"
            },
            ...this._getBaseCotizacionMaterialesColumns(cotizacionesCount),
            {
                title: "PRECIO MENOR.",
                field: "13",
                ...ColumnConfig.CURRENCY_FORMATTER,
                ...ColumnConfig.TOTAL_COLUMN,
                bottomCalc: ColumnConfig.calcTitle("SUBTOTAL")
            },
            {
                title: "PARCIAL CORREGIDO.",
                field: "14",
                ...ColumnConfig.CURRENCY_FORMATTER,
                ...ColumnConfig.TOTAL_COLUMN
            }
        ];
    }

    static _getBaseCotizacionEquiposColumns(count) {
        const columns = [];
        for (let i = 1; i <= count; i++) {
            columns.push({
                title: `COTIZACIÓN ${i}`,
                columns: [
                    {
                        title: "PROVEEDOR",
                        field: `${2 * (i - 1) + 1 + 6}`,
                        editor: "input",
                    },
                    {
                        title: "P.U.",
                        field: `${2 * (i - 1) + 1 + 7}`,
                        ...ColumnConfig.CURRENCY_FORMATTER,
                        editor: "number",
                    }
                ],
            });
        }
        return columns;
    }

    static _getDynamicReceiptColumnsEquipos(count) {
        const columns = [];
        for (let i = 1; i <= count; i++) {
            const baseIndex = 4 * (i - 1) + 15;
            columns.push({
                title: `ENVIO ${i}`,
                columns: [
                    {
                        title: "FECHA",
                        field: `${baseIndex}`,
                        editor: "date",
                    },
                    {
                        title: "CANTIDAD",
                        field: `${baseIndex + 1}`,
                        editor: "number"
                    },
                    {
                        title: "PRECIO",
                        field: `${baseIndex + 2}`,
                        ...ColumnConfig.CURRENCY_FORMATTER,
                        editor: "number",
                        bottomCalc: ColumnConfig.calcTitle("TOTAL")
                    },
                    {
                        title: "PARCIAL",
                        field: `${baseIndex + 3}`,
                        ...ColumnConfig.CURRENCY_FORMATTER,
                        ...ColumnConfig.TOTAL_COLUMN
                    },
                ]
            });
        }
        return columns;
    }

    static _createEquiposFormulas(dynamicColumns) {
        const formulas = {
            5: (row) => `=+D${row}*E${row}`,  // PARCIAL EXP
            13: (row) => {
                const columns = [];
                for (
                    let index = "I".charCodeAt(0);
                    index <= "M".charCodeAt(0);
                    index += 2
                ) {
                    columns.push(`${String.fromCharCode(index)}${row}`);
                }
                return "=+MIN(" + columns.join() + ")";
            },
            14: (row) => `=+G${row}*N${row}`,  // PARCIAL EXP
        };

        for (let i = 1; i <= dynamicColumns; i++) {
            const parcialIndex = 4 * (dynamicColumns - 1) + 1 + 17;
            formulas[parcialIndex] = (row) => {
                const cantIndex = 4 * (dynamicColumns - 1) + 1 + 16;
                const puIndex = 4 * (dynamicColumns - 1) + 1 + 17;
                return `=+${CoreUtils.excelColumn(cantIndex)}${row}*${CoreUtils.excelColumn(puIndex)}${row}`;
            };
        }

        return formulas;
    }

    static createEquiposConfig(dynamicColumns = 1) {
        const baseColumns = this._getBaseEquiposColumns(dynamicColumns);
        const dynamicCols = this._getDynamicReceiptColumnsEquipos(dynamicColumns);
        const formulas = this._createEquiposFormulas(dynamicColumns);

        return {
            columns: [{
                title: `Equipos - ${datamantemiento?.nombre_proyecto_mant || ''}`,
                columns: [...baseColumns, ...dynamicCols]
            }],
            formulas
        };
    }


    static createStaticTableConfig(tableType) {
        const configs = {
            resumen: {
                formulas: {},
                columns: [{
                    title: "RESUMEN GENERAL",
                    columns: [
                        {
                            title: "COMPONENTE",
                            field: "0",
                            hozAlign: "left",
                            bottomCalc: ColumnConfig.calcTitle("TOTAL"),
                            width: 300
                        },
                        {
                            title: "PRESUPUESTO (S/)",
                            field: "1",
                            ...ColumnConfig.CURRENCY_FORMATTER,
                            width: 150
                        },
                        {
                            title: "GASTO REAL (S/)",
                            field: "2",
                            ...ColumnConfig.CURRENCY_FORMATTER,
                            width: 150
                        },
                        {
                            title: "GASTO %",
                            field: "3",
                            ...ColumnConfig.PERCENT_FORMATTER,
                            width: 120
                        },
                    ],
                }],
            },
            // Agregar más configuraciones aquí
        };

        return configs[tableType] || { formulas: {}, columns: [] };
    }
}

// ======================================
// 5. MANEJADOR DE TABLAS TABULATOR
// ======================================

class TabulatorManager {
    static createTable(tableModel, sheetName, domElement, options = {}) {
        const sheetID = hf.getSheetId(sheetName);
        const spareRow = tableModel.spareRow ?? false;

        let tableTarget = domElement;
        if (!tableTarget) {
            const selector = tableModel.id?.startsWith('#') ? tableModel.id : `#${tableModel.id}`;
            tableTarget = document.querySelector(selector);
        }

        if (!tableTarget) {
            throw new Error(`Elemento no encontrado: ${tableModel.id}`);
        }

        const table = new Tabulator(tableTarget, {
            layout: "fitDataStretch",
            layoutColumnsOnNewData: true,
            columnHeaderVertAlign: "middle",
            selectableRange: true,
            selectableRangeColumns: true,
            selectableRangeClearCells: true,
            headerSortClickElement: 'icon',
            editTriggerEvent: "dblclick",
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
            ...tableModel.config,
            ...options,
        });

        this._setupTableEvents(table, tableModel, sheetID, spareRow);
        table.spareRow = spareRow;
        return table;
    }

    static _setupTableEvents(table, tableModel, sheetID, spareRow) {
        table.on("cellEdited", (cell) => this._handleCellEdit(cell, table, tableModel, sheetID));
        table.on("rowAdded", (row) => this._handleRowAdd(row, table, tableModel, sheetID));
        table.on("clipboardPasted", (clipboard, rowData, rows) =>
            this._handlePaste(clipboard, rowData, rows, table, spareRow));
        table.on("tableBuilt", () => this._handleTableBuilt(table, tableModel, spareRow));
    }

    static _handleCellEdit(cell, table, tableModel, sheetID) {
        const colPos = parseInt(cell.getColumn().getField());
        const rowPos = parseInt(cell.getRow().getIndex());

        if (!this._checkCellEditable(cell)) return;

        // Agregar fila spare si es necesario
        if (cell.getRow().getData().spare !== undefined && cell.getValue() !== "") {
            delete cell.getRow().getData().spare;
            table.addRow({ spare: true }, false);
        }

        const address = { sheet: sheetID, col: colPos, row: rowPos };
        if (cell.getValue() != hf.getCellValue(address) && !hf.doesCellHaveFormula(address)) {
            const updates = hf.setCellContents(address, cell.getValue());
            this._applyUpdates(table, updates, sheetID, address);
        }
    }

    static _handleRowAdd(row, table, tableModel, sheetID) {
        const lastIndex = table.getRows().length - 1;
        row.update({ id: lastIndex });
        const rowPos = parseInt(lastIndex);

        // Aplicar fórmulas
        this._applyFormulas(table, tableModel, rowPos, sheetID);

        if (row.getData().spare !== undefined) return;

        // Sincronizar con HyperFormula
        this._syncRowWithHyperFormula(row, table, sheetID);
    }

    static _applyFormulas(table, tableModel, rowPos, sheetID) {
        Object.keys(tableModel.formulas ?? {}).forEach(col => {
            const colPos = parseInt(col);
            const address = { sheet: sheetID, col: colPos, row: rowPos };
            const formula = tableModel.formulas[colPos](rowPos + 1) ?? "";

            if (formula !== "") {
                const updates = hf.setCellContents(address, formula);
                const filteredUpdates = updates.filter(update =>
                    hf.simpleCellAddressToString(update.address, update.address.sheet) ===
                    hf.simpleCellAddressToString(address, address.sheet)
                );

                filteredUpdates.forEach(update => {
                    table.updateData([{
                        id: update.address.row,
                        [`${update.address.col}`]: update.newValue,
                    }]);
                });
            }
        });
    }

    static _syncRowWithHyperFormula(row, table, sheetID) {
        const rowPos = parseInt(row.getIndex());
        row.getCells().forEach(cell => {
            const colPos = parseInt(cell.getColumn().getField());
            const address = { sheet: sheetID, col: colPos, row: rowPos };

            if (!hf.doesCellHaveFormula(address)) {
                const updates = hf.setCellContents(address, cell.getValue());
                this._applyUpdates(table, updates, sheetID, address);
            }
        });
    }

    static _applyUpdates(table, updates, sheetID, originAddress) {
        updates
            .filter(update =>
                hf.simpleCellAddressToString(update.address, update.address.sheet) !==
                hf.simpleCellAddressToString(originAddress, originAddress.sheet)
            )
            .forEach(update => {
                const isInSheet = update.sheet === sheetID;
                if (isInSheet) {
                    table.updateData([{
                        id: update.address.row,
                        [`${update.address.col}`]: update.newValue,
                    }]);
                }
            });
    }

    static _checkCellEditable(cell) {
        const columnDef = cell.getColumn().getDefinition();
        let isEditable = false;

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

    static _handlePaste(clipboard, rowData, rows, table, spareRow) {
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
                if (this._checkCellEditable(cell.component) && value !== "") {
                    cell.setValue(value + " ");
                }
            });
            repeat = (repeat + 1) % rowData.length;
        }

        if (rowData.length > rows.length && spareRow) {
            table.addRow(rowData.slice(index));
            table.addRow({ spare: true }, false);
        }
    }

    static _handleTableBuilt(table, tableModel, spareRow) {
        if (tableModel.data !== undefined) {
            try {
                if (Array.isArray(tableModel.data)) {
                    // Añadir múltiples filas de forma segura
                    if (table.addData) table.addData(tableModel.data);
                } else {
                    if (table.addRow) table.addRow(tableModel.data);
                }
                if (table.clearHistory) table.clearHistory();
            } catch (e) {
                console.warn('Error al poblar tabla con data inicial:', e);
            }
        }

        if (spareRow) {
            table.addRow({ spare: true }, false);
        }
    }

    // Utilidad para obtener resultados de cálculos de Tabulator de forma segura
    static getCalcResultsSafe(table) {
        if (!table) return null;
        try {
            // Algunos wrappers pueden exponer getCalcResults como propiedad no-funcional
            if (typeof table.getCalcResults === 'function') {
                return table.getCalcResults();
            }

            // Si en algún build se anexa un objeto tabulatorInstance con getCalcResults
            if (table.tabulatorInstance && typeof table.tabulatorInstance.getCalcResults === 'function') {
                return table.tabulatorInstance.getCalcResults();
            }

            return null;
        } catch (e) {
            console.warn('No se pudo obtener getCalcResults del table:', e);
            return null;
        }
    }
}

// ======================================
// 6. CALCULADORA DE RESULTADOS
// ======================================

class ResultsCalculator {
    static createInsumosResultsModel() {
        return reactive({
            id: "tbl_insumos_result",
            total_precio_expediente: { name: "PRECIO DE INSUMOS DE EXPEDIENTE", value: 0 },
            total_precio_corregido: { name: "PRECIO DE INSUMOS CORREGIDOS DE EXPEDIENTE", value: 0 },
            real_gastado: { name: "REAL GASTADO", value: 0 },
            adicional_precio_expediente: { name: "PRECIO DE INSUMOS DE EXPEDIENTE ADICIONAL DE OBRA", value: 0 },
            adicional_precio_corregido: { name: "PRECIO DE INSUMOS CORREGIDOS DE EXPEDIENTE ADICIONAL DE OBRA", value: 0 },
            adicional_real_gastado: { name: "REAL GASTADO ADICIONAL DE OBRA", value: 0 },
            conclusion: "",
            result: 0,
        });
    }

    static calculateInsumosResults(table, resultModel) {
        if (!table) return;

        try {
            const calc = TabulatorManager.getCalcResultsSafe(table) || {};
            const bottom = calc.bottom || {};
            const totalParcialExp = parseFloat(bottom["7"] || 0) || 0;
            const totalParcialCorreg = parseFloat(bottom["8"] || 0) || 0;
            const totalPrecio = parseFloat(bottom["12"] || 0) || 0;

            resultModel.total_precio_expediente.value = totalParcialExp;
            resultModel.total_precio_corregido.value = totalParcialCorreg;
            resultModel.real_gastado.value = totalPrecio;

            // Calcular adicionales
            const adicionales = this._calculateAdicionales(table);
            resultModel.adicional_precio_expediente.value = adicionales.precioExpediente;
            resultModel.adicional_precio_corregido.value = adicionales.precioCorregido;
            resultModel.adicional_real_gastado.value = adicionales.realGastado;

            // Conclusión
            const conclusionValue = totalParcialExp - totalPrecio;
            resultModel.result = conclusionValue;
            resultModel.conclusion = CoreUtils.getConclusion(conclusionValue);

        } catch (e) {
            console.error("Error al calcular resultados:", e);
        }
    }

    static renderInsumosResult(resultModel) {
        const el = document.getElementById(resultModel.id);
        if (!el) return;

        el.innerHTML = `
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    ${this._renderResultItem(resultModel.real_gastado)}
                    ${this._renderResultItem(resultModel.total_precio_expediente)}
                    ${this._renderResultItem(resultModel.total_precio_corregido)}
                </div>
                
                <div class="border-t border-gray-200 dark:border-gray-600 pt-4 mb-4">
                    <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Adicionales de Obra</h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                        ${this._renderResultItem(resultModel.adicional_real_gastado, true)}
                        ${this._renderResultItem(resultModel.adicional_precio_expediente, true)}
                        ${this._renderResultItem(resultModel.adicional_precio_corregido, true)}
                    </div>
                </div>
                
                <div class="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <div class="text-center">
                        <div class="inline-flex flex-col items-center">
                            <span class="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">CONCLUSIÓN</span>
                            <div class="flex items-center gap-3">
                                <span class="px-4 py-2 rounded-full font-semibold ${this._getConclusionClass(resultModel.result)}">
                                    ${resultModel.conclusion}
                                </span>
                                <span class="text-xl font-bold text-gray-900 dark:text-white">
                                    ${CoreUtils.formatCurrency(resultModel.result)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    //Cotizaciones
    static createCotizacionesResultsModel() {
        return reactive({
            id: "tbl_cotizaciones_result",
            total1: {
                name: "COTIZACION CON INSUMOS CORREGIDOS Y PRECIO DEL EXPEDITEN",
                value: 0,
            },
            total2: { name: "COTIZACION CON MENOR PRECIO", value: 0 },
            conclusion: "",
            result: 0,
        });
    }

    static calculateCotizacionesResults(table, resultModel) {
        if (!table) return;

        try {
            const calc = TabulatorManager.getCalcResultsSafe(table) || {};
            const bottom = calc.bottom || {};
            const totalParcialExp = parseFloat(bottom["6"] || 0) || 0;
            const totalPrecio = parseFloat(bottom["28"] || 0) || 0;

            resultModel.total1.value = totalParcialExp;
            resultModel.total2.value = totalPrecio;

            // Conclusión
            const conclusionValue = totalParcialExp - totalPrecio;
            resultModel.result = conclusionValue;
            resultModel.conclusion = CoreUtils.getConclusion(conclusionValue);

        } catch (e) {
            console.error("Error al calcular resultados:", e);
        }
    }

    static renderCotizacionesResult(resultModel) {
        const el = document.getElementById(resultModel.id);
        if (!el) return;

        el.innerHTML = `
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    ${this._renderResultItem(resultModel.total1)}
                    ${this._renderResultItem(resultModel.total2)}
                </div>
                <div class="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <div class="text-center">
                        <div class="inline-flex flex-col items-center">
                            <span class="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">CONCLUSIÓN</span>
                            <div class="flex items-center gap-3">
                                <span class="px-4 py-2 rounded-full font-semibold ${this._getConclusionClass(resultModel.result)}">
                                    ${resultModel.conclusion}
                                </span>
                                <span class="text-xl font-bold text-gray-900 dark:text-white">
                                    ${CoreUtils.formatCurrency(resultModel.result)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    //Mano de obra
    static createManoObraResultsModel() {
        return reactive({
            id: "tbl_mano_obra_result",
            total1: {
                name: "COTIZACION CON INSUMOS CORREGIDOS Y PRECIO DEL EXPEDITEN",
                value: 0,
            },
            total2: { name: "COTIZACION CON MENOR PRECIO", value: 0 },
            conclusion: "",
            result: 0,
        });
    }

    static calculateManoObraResults(table, resultModel) {
        if (!table) return null;

        try {
            const rows = table.getData ? table.getData() : [];

            const sumField = (idx) => rows.reduce((s, r) => s + (Number(r[idx] || 0) || 0), 0);

            // PARCIAL EXP suele estar en la columna 5
            const parcialExp = sumField(5);
            // PARCIAL CORREGIDO suele estar en la columna 14
            const parcialCorreg = sumField(14);

            // Sumar envios dinámicamente: campos 18,22,26,... (18 + 4*n)
            let enviosTotal = 0;
            rows.forEach(row => {
                Object.keys(row).forEach(k => {
                    if (!/^\d+$/.test(k)) return;
                    const idx = parseInt(k, 10);
                    if (idx >= 18 && ((idx - 18) % 4) === 0) {
                        enviosTotal += Number(row[idx] || 0) || 0;
                    }
                });
            });

            // Actualizar el modelo
            resultModel.total1.value = parcialExp;
            resultModel.total2.value = parcialCorreg;
            resultModel.result = enviosTotal;
            resultModel.conclusion = CoreUtils.getConclusion(parcialExp - parcialCorreg);

            return { presupuesto: parcialExp, gastoReal: parcialCorreg, envios: enviosTotal };

        } catch (e) {
            console.error('Error al calcular Mano de Obra:', e);
            return { presupuesto: 0, gastoReal: 0, envios: 0 };
        }
    }

    static renderManoObraResult(resultModel) {
        const el = document.getElementById(resultModel.id);
        if (!el) return;

        el.innerHTML = `
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    ${this._renderResultItem(resultModel.total1)}
                    ${this._renderResultItem(resultModel.total2)}
                </div>
                <div class="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <div class="text-center">
                        <div class="inline-flex flex-col items-center">
                            <span class="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">CONCLUSIÓN</span>
                            <div class="flex items-center gap-3">
                                <span class="px-4 py-2 rounded-full font-semibold ${this._getConclusionClass(resultModel.result)}">
                                    ${resultModel.conclusion}
                                </span>
                                <span class="text-xl font-bold text-gray-900 dark:text-white">
                                    ${CoreUtils.formatCurrency(resultModel.result)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    //Materiales
    static createMaterialesResultsModel() {
        return reactive({
            id: "tbl_materiales_result",
            total1: {
                name: "COTIZACION CON INSUMOS CORREGIDOS Y PRECIO DEL EXPEDITEN",
                value: 0,
            },
            total2: { name: "COTIZACION CON MENOR PRECIO", value: 0 },
            conclusion: "",
            result: 0,
        });
    }

    static calculateMaterialesResults(table, resultModel) {
        if (!table) return null;

        try {
            const rows = table.getData ? table.getData() : [];
            const sumField = (idx) => rows.reduce((s, r) => s + (Number(r[idx] || 0) || 0), 0);

            const parcialExp = sumField(5);
            const parcialCorreg = sumField(14);

            let enviosTotal = 0;
            rows.forEach(row => {
                Object.keys(row).forEach(k => {
                    if (!/^\d+$/.test(k)) return;
                    const idx = parseInt(k, 10);
                    if (idx >= 18 && ((idx - 18) % 4) === 0) {
                        enviosTotal += Number(row[idx] || 0) || 0;
                    }
                });
            });

            resultModel.total1.value = parcialExp;
            resultModel.total2.value = parcialCorreg;
            resultModel.result = enviosTotal;
            resultModel.conclusion = CoreUtils.getConclusion(parcialExp - parcialCorreg);

            return { presupuesto: parcialExp, gastoReal: parcialCorreg, envios: enviosTotal };
        } catch (e) {
            console.error('Error al calcular Materiales:', e);
            return { presupuesto: 0, gastoReal: 0, envios: 0 };
        }
    }

    static renderMaterialesResult(resultModel) {
        const el = document.getElementById(resultModel.id);
        if (!el) return;

        el.innerHTML = `
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    ${this._renderResultItem(resultModel.total1)}
                    ${this._renderResultItem(resultModel.total2)}
                </div>
                <div class="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <div class="text-center">
                        <div class="inline-flex flex-col items-center">
                            <span class="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">CONCLUSIÓN</span>
                            <div class="flex items-center gap-3">
                                <span class="px-4 py-2 rounded-full font-semibold ${this._getConclusionClass(resultModel.result)}">
                                    ${resultModel.conclusion}
                                </span>
                                <span class="text-xl font-bold text-gray-900 dark:text-white">
                                    ${CoreUtils.formatCurrency(resultModel.result)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    //Equipos
    static createEquiposResultsModel() {
        return reactive({
            id: "tbl_equipos_result",
            total1: {
                name: "COTIZACION CON INSUMOS CORREGIDOS Y PRECIO DEL EXPEDITEN",
                value: 0,
            },
            total2: { name: "COTIZACION CON MENOR PRECIO", value: 0 },
            conclusion: "",
            result: 0,
        });
    }

    static calculateEquiposResults(table, resultModel) {
        if (!table) return null;

        try {
            const rows = table.getData ? table.getData() : [];
            const sumField = (idx) => rows.reduce((s, r) => s + (Number(r[idx] || 0) || 0), 0);

            const parcialExp = sumField(5);
            const parcialCorreg = sumField(14);

            let enviosTotal = 0;
            rows.forEach(row => {
                Object.keys(row).forEach(k => {
                    if (!/^\d+$/.test(k)) return;
                    const idx = parseInt(k, 10);
                    if (idx >= 18 && ((idx - 18) % 4) === 0) {
                        enviosTotal += Number(row[idx] || 0) || 0;
                    }
                });
            });

            resultModel.total1.value = parcialExp;
            resultModel.total2.value = parcialCorreg;
            resultModel.result = enviosTotal;
            resultModel.conclusion = CoreUtils.getConclusion(parcialExp - parcialCorreg);

            return { presupuesto: parcialExp, gastoReal: parcialCorreg, envios: enviosTotal };
        } catch (e) {
            console.error('Error al calcular Equipos:', e);
            return { presupuesto: 0, gastoReal: 0, envios: 0 };
        }
    }

    static renderEquiposResult(resultModel) {
        const el = document.getElementById(resultModel.id);
        if (!el) return;

        el.innerHTML = `
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    ${this._renderResultItem(resultModel.total1)}
                    ${this._renderResultItem(resultModel.total2)}
                </div>
                <div class="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <div class="text-center">
                        <div class="inline-flex flex-col items-center">
                            <span class="text-lg font-bold text-gray-700 dark:text-gray-300 mb-2">CONCLUSIÓN</span>
                            <div class="flex items-center gap-3">
                                <span class="px-4 py-2 rounded-full font-semibold ${this._getConclusionClass(resultModel.result)}">
                                    ${resultModel.conclusion}
                                </span>
                                <span class="text-xl font-bold text-gray-900 dark:text-white">
                                    ${CoreUtils.formatCurrency(resultModel.result)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Utilidad para calcular totales de adicionales
    static _calculateAdicionales(table) {
        const rows = table.getData() || [];
        let adicionales = { precioExpediente: 0, precioCorregido: 0, realGastado: 0 };

        rows.forEach(row => {
            const desc = (row[1] || "").toLowerCase();
            if (desc.includes("adicional")) {
                adicionales.precioExpediente += Number(row[7] || 0);
                adicionales.precioCorregido += Number(row[8] || 0);
                adicionales.realGastado += Number(row[12] || 0);
            }
        });

        return adicionales;
    }

    static _renderResultItem(item, isSmall = false) {
        const sizeClass = isSmall ? 'text-xs' : 'text-sm';
        return `
            <div class="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div class="${sizeClass} text-gray-600 dark:text-gray-400 mb-1 font-medium">${item.name}</div>
                <div class="text-lg font-bold text-gray-900 dark:text-white">${CoreUtils.formatCurrency(item.value)}</div>
            </div>
        `;
    }

    static _getConclusionClass(value) {
        if (value > 0) return 'bg-green-500 text-green-50 dark:bg-green-500 dark:text-green-50';
        if (value < 0) return 'bg-red-500 text-red-50 dark:bg-red-500 dark:text-red-50';
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
}

// ======================================
// 7. COMPONENTE DE TABLA ESCALABLE
// ======================================

const ScalableTableTab = defineComponent({
    props: {
        tabKey: { type: String, required: true },
        tableType: { type: String, default: 'dynamic' },
        state: { type: Object, required: true },
        loadData: { type: Function, required: true },
        saveData: { type: Function, required: true },
    },
    emits: ['update-global-message', 'mark-changed', 'transfer-to-cotizaciones', 'summary-updated'],
    setup(props, { emit }) {
        const tableRef = ref(null);
        const tabulatorInstance = ref(null);
        const localMessage = ref(null);
        // Persistir dynamicColumns en el estado del tab para que no se reinicie al cambiar pestañas
        const dynamicColumns = ref(props.state.dynamicColumns || 1);
        const insumosResultModel = ref(null);
        const cotizacionesResultModel = ref(null);
        const manoObraResultModel = ref(null);
        const materialesResultModel = ref(null);
        const equiposResultModel = ref(null);

        // Inicializar modelo de resultados para insumos
        if (props.tabKey === 'insumos') {
            insumosResultModel.value = ResultsCalculator.createInsumosResultsModel();
        }

        if (props.tabKey === 'cotizaciones') {
            cotizacionesResultModel.value = ResultsCalculator.createCotizacionesResultsModel();
        }

        if (props.tabKey === 'mano_obra') {
            manoObraResultModel.value = ResultsCalculator.createManoObraResultsModel();
        }

        if (props.tabKey === 'materiales') {
            materialesResultModel.value = ResultsCalculator.createMaterialesResultsModel();
        }

        if (props.tabKey === 'equipos') {
            equiposResultModel.value = ResultsCalculator.createEquiposResultsModel();
        }

        const showMessage = (text, type = 'info') => {
            localMessage.value = { text, type };
            emit('update-global-message', { text, type });
            setTimeout(() => localMessage.value = null, 5000);
        };

        const markChanged = () => {
            emit('mark-changed', props.tabKey, true);
        };

        // Exponer markChanged hacia el template para evitar warnings de Vue
        const exposeMarkChanged = markChanged;

        const isDynamic = computed(() => {
            return props.tableType === 'dynamic' && ['insumos', 'cotizaciones', 'mano_obra', 'materiales', 'equipos'].includes(props.tabKey);
        });

        onMounted(async () => {
            if (!props.state.loaded) {
                await props.loadData(props.tabKey);
            }
            await nextTick();
            initializeTable();
        });

        onBeforeUnmount(() => {
            // Persistir número de columnas
            props.state.dynamicColumns = dynamicColumns.value;

            // Guardar datos temporales y destruir instancia de Tabulator para evitar referencias residuales
            try {
                if (tabulatorInstance.value) {
                    // antes de destruir, guardar datos (sin spare)
                    const currentData = tabulatorInstance.value.getData ? tabulatorInstance.value.getData().filter(r => !r.spare) : props.state.data;
                    props.state.data = currentData;
                    tabulatorInstance.value.destroy();
                    tabulatorInstance.value = null;
                }
            } catch (e) {
                console.warn('Error al desmontar tabla:', e);
            }
        });

        const initializeTable = () => {
            if (!tableRef.value) return;

            if (tabulatorInstance.value) {
                tabulatorInstance.value.destroy();
            }

            let config;
            if (props.tabKey === 'insumos') {
                config = TableConfigFactory.createInsumosConfig(dynamicColumns.value);
            } else if (props.tabKey === 'cotizaciones') {
                config = TableConfigFactory.createCotizacionesConfig(dynamicColumns.value);
            } else if (props.tabKey === 'mano_obra') {
                config = TableConfigFactory.createManoObraConfig(dynamicColumns.value);
            } else if (props.tabKey === 'materiales') {
                config = TableConfigFactory.createMaterialesConfig(dynamicColumns.value);
            } else if (props.tabKey === 'equipos') {
                config = TableConfigFactory.createEquiposConfig(dynamicColumns.value);
            } else {
                config = TableConfigFactory.createStaticTableConfig(props.tabKey);
            }

            const tableModel = {
                id: `tbl_${props.tabKey}`,
                spareRow: isDynamic.value,
                formulas: config.formulas || {},
                config: { columns: config.columns },
                data: props.state.data,
            };

            if (!hf.getSheetNames().includes(props.tabKey.toUpperCase())) {
                hf.addSheet(props.tabKey.toUpperCase());
            }

            // Asegurarse de destruir cualquier instancia previa del tabulator antes de crear una nueva
            if (tabulatorInstance.value && typeof tabulatorInstance.value.destroy === 'function') {
                try { tabulatorInstance.value.destroy(); } catch (e) { console.warn('Error destruyendo tabla anterior', e); }
            }

            tabulatorInstance.value = TabulatorManager.createTable(
                tableModel,
                props.tabKey.toUpperCase(),
                tableRef.value
            );

            tabulatorInstance.value.on("dataChanged", () => {
                markChanged();
                if (props.tabKey === 'insumos' && insumosResultModel.value) {
                    ResultsCalculator.calculateInsumosResults(tabulatorInstance.value, insumosResultModel.value);
                    ResultsCalculator.renderInsumosResult(insumosResultModel.value);
                }
                if (props.tabKey === 'cotizaciones' && cotizacionesResultModel.value) {
                    ResultsCalculator.calculateCotizacionesResults(tabulatorInstance.value, cotizacionesResultModel.value);
                    ResultsCalculator.renderCotizacionesResult(cotizacionesResultModel.value);
                }
                if (props.tabKey === 'mano_obra' && manoObraResultModel.value) {
                    const totals = ResultsCalculator.calculateManoObraResults(tabulatorInstance.value, manoObraResultModel.value);
                    ResultsCalculator.renderManoObraResult(manoObraResultModel.value);
                    emit('summary-updated', { tab: 'mano_obra', totals });
                }
                if (props.tabKey === 'materiales' && materialesResultModel.value) {
                    const totals = ResultsCalculator.calculateMaterialesResults(tabulatorInstance.value, materialesResultModel.value);
                    ResultsCalculator.renderMaterialesResult(materialesResultModel.value);
                    emit('summary-updated', { tab: 'materiales', totals });
                }
                if (props.tabKey === 'equipos' && equiposResultModel.value) {
                    const totals = ResultsCalculator.calculateEquiposResults(tabulatorInstance.value, equiposResultModel.value);
                    ResultsCalculator.renderEquiposResult(equiposResultModel.value);
                    emit('summary-updated', { tab: 'equipos', totals });
                }

            });

            // Cálculo inicial para insumos
            if (props.tabKey === 'insumos' && insumosResultModel.value) {
                nextTick(() => {
                    ResultsCalculator.calculateInsumosResults(tabulatorInstance.value, insumosResultModel.value);
                    ResultsCalculator.renderInsumosResult(insumosResultModel.value);
                });
            }
            if (props.tabKey === 'cotizaciones' && cotizacionesResultModel.value) {
                nextTick(() => {
                    ResultsCalculator.calculateCotizacionesResults(tabulatorInstance.value, cotizacionesResultModel.value);
                    ResultsCalculator.renderCotizacionesResult(cotizacionesResultModel.value);
                });
            }
            if (props.tabKey === 'mano_obra' && manoObraResultModel.value) {
                nextTick(() => {
                    ResultsCalculator.calculateManoObraResults(tabulatorInstance.value, manoObraResultModel.value);
                    ResultsCalculator.renderManoObraResult(manoObraResultModel.value);
                });
            }
            if (props.tabKey === 'materiales' && materialesResultModel.value) {
                nextTick(() => {
                    ResultsCalculator.calculateMaterialesResults(tabulatorInstance.value, materialesResultModel.value);
                    ResultsCalculator.renderMaterialesResult(materialesResultModel.value);
                });
            }
            if (props.tabKey === 'equipos' && equiposResultModel.value) {
                nextTick(() => {
                    ResultsCalculator.calculateEquiposResults(tabulatorInstance.value, equiposResultModel.value);
                    ResultsCalculator.renderEquiposResult(equiposResultModel.value);
                });
            }
        };

        const handleAddColumns = () => {
            if (!isDynamic.value || (props.tabKey !== 'insumos' && props.tabKey !== 'cotizaciones' && props.tabKey !== 'mano_obra' && props.tabKey !== 'materiales' && props.tabKey !== 'equipos')) return;
            dynamicColumns.value = Math.max(1, Math.min(10, dynamicColumns.value));
            // Persistir en el estado del tab para que no se pierda al cambiar de pestaña
            props.state.dynamicColumns = dynamicColumns.value;
            initializeTable();
            markChanged();
        };

        const handleLoad = async () => {
            try {
                localMessage.value = null;
                await props.loadData(props.tabKey);
                initializeTable();
                showMessage(`Datos de ${props.tabKey} recargados`, 'success');
            } catch (e) {
                showMessage(`Error al cargar: ${e.message}`, 'error');
            }
        };

        const handleSave = async () => {
            try {
                localMessage.value = null;
                const currentData = tabulatorInstance.value ?
                    tabulatorInstance.value.getData().filter(row => !row.spare) :
                    props.state.data;
                await props.saveData(props.tabKey, currentData);
                emit('mark-changed', props.tabKey, false);
                // Si guardamos insumos, emitir evento para transferir a cotizaciones
                if (props.tabKey === 'insumos') {
                    try {
                        const cotizacionesPayload = currentData.map(row => ({
                            0: row[0], // item
                            1: row[1], // descripcion
                            2: row[2], // unidad
                            3: row[3], // cantidad exp (cantidad presupuestado)
                            4: row[4], // cantidad corregida
                            5: row[6], // precio exp
                            6: row[7], // parcial corregido = parcial (parcial exp) -> map into field 8 to match cotizaciones layout
                        }));
                        // Emitir evento con la data transformada
                        emit('transfer-to-cotizaciones', cotizacionesPayload);
                    } catch (e) {
                        console.warn('Error preparando datos para cotizaciones', e);
                    }
                }
                showMessage('Guardado exitoso', 'success');
            } catch (e) {
                showMessage(`Error al guardar: ${e.message}`, 'error');
            }
        };

        return {
            tableRef,
            localMessage,
            dynamicColumns,
            isDynamic,
            handleAddColumns,
            handleLoad,
            handleSave,
            showMessage,
            markChanged: exposeMarkChanged,
        };
    },
    template: `
        <div class="fade-in">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                <h2 class="text-xl font-bold text-gray-800 dark:text-white">
                    {{ tabKey.replace(/_/g, ' ').toUpperCase() }}
                </h2>
                <div class="flex flex-wrap gap-2">
                    <div v-if="isDynamic && tabKey === 'insumos'" class="flex items-center gap-2">
                        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Columnas:</label>
                        <input 
                            v-model.number="dynamicColumns"
                            type="number" 
                            min="1" 
                            max="10" 
                            class="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            @change="handleAddColumns"
                        />
                        <button 
                            @click="handleAddColumns"
                            class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition">
                            Aplicar
                        </button>
                    </div>
                    <div v-if="isDynamic && tabKey === 'cotizaciones'" class="flex items-center gap-2">
                        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Columnas:</label>
                        <input 
                            v-model.number="dynamicColumns"
                            type="number" 
                            min="1" 
                            max="10" 
                            class="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            @change="handleAddColumns"
                        />
                        <button 
                            @click="handleAddColumns"
                            class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition">
                            Aplicar
                        </button>
                    </div>
                    <div v-if="isDynamic && tabKey === 'mano_obra'" class="flex items-center gap-2">
                        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Columnas:</label>
                        <input 
                            v-model.number="dynamicColumns"
                            type="number" 
                            min="1" 
                            max="10" 
                            class="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            @change="handleAddColumns"
                        />
                        <button 
                            @click="handleAddColumns"
                            class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition">
                            Aplicar
                        </button>
                    </div>
                    <div v-if="isDynamic && tabKey === 'materiales'" class="flex items-center gap-2">
                        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Columnas:</label>
                        <input 
                            v-model.number="dynamicColumns"
                            type="number" 
                            min="1" 
                            max="10" 
                            class="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            @change="handleAddColumns"
                        />
                        <button 
                            @click="handleAddColumns"
                            class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition">
                            Aplicar
                        </button>
                    </div>
                    <div v-if="isDynamic && tabKey === 'equipos'" class="flex items-center gap-2">
                        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Columnas:</label>
                        <input 
                            v-model.number="dynamicColumns"
                            type="number" 
                            min="1" 
                            max="10" 
                            class="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            @change="handleAddColumns"
                        />
                        <button 
                            @click="handleAddColumns"
                            class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition">
                            Aplicar
                        </button>
                    </div>
                                    
                    <button 
                        @click="handleLoad" 
                        class="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-4 py-2 rounded-lg font-medium text-sm transition">
                        Recargar
                    </button>
                    
                    <button 
                        @click="handleSave" 
                        class="flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg font-medium text-sm shadow transition transform hover:scale-105">
                        Guardar
                    </button>
                </div>
            </div>

            <div ref="tableRef" class="h-96 sm:h-128 border rounded-lg"></div>

            <div v-if="tabKey === 'insumos'" class="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div class="w-full" id="tbl_insumos_result"></div>
            </div>
            <div v-if="tabKey === 'cotizaciones'" class="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div class="w-full" id="tbl_cotizaciones_result"></div>
            </div>
            <div v-if="tabKey === 'mano_obra'" class="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div class="w-full" id="tbl_mano_obra_result"></div>
            </div>
            <div v-if="tabKey === 'materiales'" class="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div class="w-full" id="tbl_materiales_result"></div>
            </div>
            <div v-if="tabKey === 'equipos'" class="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div class="w-full" id="tbl_equipos_result"></div>
            </div>
        </div>
    `
});

// ======================================
// 8. APLICACIÓN VUE PRINCIPAL
// ======================================

const app = createApp({
    components: { ScalableTableTab },
    setup() {
        const TABS = [
            { key: 'insumos', label: 'Insumos', icon: '📦', type: 'dynamic' },
            { key: 'cotizaciones', label: 'Cotizaciones', icon: '📑', type: 'dynamic' },
            { key: 'mano_obra', label: 'Mano de Obra', icon: '🤲', type: 'dynamic' },
            { key: 'materiales', label: 'Materiales.', icon: '📁', type: 'dynamic' },
            { key: 'equipos', label: 'Equipos', icon: '📊', type: 'dynamic' },
            // { key: 'materiales_ejecucion', label: 'Materiales Ejec.', icon: '🔨', type: 'dynamic' },
            // { key: 'presupuesto_mano_obra', label: 'Presp. Mano Obra', icon: '👷', type: 'dynamic' },
            // { key: 'equipos_ejecucion', label: 'Equipos Ejecucion', icon: '⚡', type: 'dynamic' },
            // { key: 'gastos_generales', label: 'Gastos Generales', icon: '💰', type: 'static' },
            { key: 'resumen', label: 'Resumen', icon: '📈', type: 'static' },
        ];

        const activeKey = ref(TABS[0].key);
        const globalMessage = ref(null);
        const isMobile = ref(false);

        const tabState = reactive({});

        const tableMap = {
            insumos: '#tbl_insumos',
            cotizaciones: '#tbl_cotizaciones',
            mano_obra: '#tbl_mano_obra',
            materiales: '#tbl_materiales',
            equipos: '#tbl_equipos',
            resumen: '#tbl_resumen',
        };

        TABS.forEach(tab => {
            tabState[tab.key] = {
                loading: false,
                loaded: false,
                data: [],
                form: { note: '' },
                hasChanges: false,
                dynamicColumns: 1, // persistir número de columnas por tab
                locked: tab.key === 'cotizaciones' ? true : false, // cotizaciones bloqueada al inicio
            };
        });

        // onMounted(() => {
        //     CoreUtils.initHyperFormula();
        //     checkMobile();
        //     window.addEventListener('resize', checkMobile);

        //     loadTabData(activeKey.value).catch(err => {
        //         setGlobalMessage({ text: err.message, type: 'error' });
        //     });
        // });

        const loadAllTabs = async () => {
            const promises = TABS.map(tab => loadTabData(tab.key));
            await Promise.allSettled(promises); // o Promise.all si quieres que falle ante el primer error
        };

        onMounted(() => {
            CoreUtils.initHyperFormula();
            checkMobile();
            window.addEventListener('resize', checkMobile);
            loadAllTabs();
            // Pre-cargar todas las tablas desde el servidor al inicio
            preloadAllData().then(() => {
                loadTabData(activeKey.value).catch(err => {
                    setGlobalMessage({ text: err.message, type: 'error' });
                });
            });
        });

        // Agregar esta función antes de onMounted
        const preloadAllData = async () => {
            if (dataCache.initialized) return;

            try {
                const token = csrfToken || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                const response = await fetch('/obtenerPresupuestoMOMAEQ', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': token
                    },
                    body: JSON.stringify({})
                });

                if (response.ok) {
                    const result = await response.json();
                    dataCache.tables.mano_obra = result.data.mano_de_obra || [];
                    dataCache.tables.materiales = result.data.materiales || [];
                    dataCache.tables.equipos = result.data.equipos || [];
                    dataCache.initialized = true;
                }
            } catch (e) {
                console.warn('Error pre-cargando datos:', e);
            }
        };

        const checkMobile = () => {
            isMobile.value = window.innerWidth < 768;
        };

        const setActive = (key) => {
            // Evitar abrir tab si está bloqueada
            if (tabState[key] && tabState[key].locked) {
                setGlobalMessage({ text: 'Guarde Insumos para desbloquear Cotizaciones', type: 'warning' });
                return;
            }
            activeKey.value = key;
        };

        const setGlobalMessage = (message) => {
            globalMessage.value = message;
            setTimeout(() => globalMessage.value = null, 5000);
        };

        const markTabChanged = (tabKey, hasChanges) => {
            if (tabState[tabKey]) {
                tabState[tabKey].hasChanges = hasChanges;
            }
        };

        const loadTabData = async (key) => {
            const state = tabState[key];
            state.loading = true;

            try {
                // Si ya está en caché, usarlo
                if (dataCache.tables[key] !== null) {
                    state.data = dataCache.tables[key];
                    state.loaded = true;
                    state.loading = false;
                    return;
                }

                let data = [];
                let dynamicCols = 1; // valor por defecto

                if (datamantemiento?.data_mantenimiento) {
                    let raw = datamantemiento.data_mantenimiento;
                    raw = raw.replace(/,\s*([\]}])/g, '$1');
                    const parsedData = JSON.parse(raw);

                    const tableKey = tableMap[key];
                    if (tableKey && parsedData.tables?.[tableKey]?.length > 0) {
                        data = parsedData.tables[tableKey];
                    }

                    // ✅ Asignar dynamicColumns desde datamantemiento según la pestaña
                    if (key === 'insumos') {
                        dynamicCols = 1;
                    } else if (key === 'cotizaciones') {
                        dynamicCols = parseInt(datamantemiento.cotizacion_mant) || 1;
                    } else if (key === 'mano_obra') {
                        dynamicCols = parseInt(datamantemiento.mano_obra_mant) || 1;
                    } else if (key === 'materiales') {
                        dynamicCols = parseInt(datamantemiento.materiales_mant) || 1;
                    } else if (key === 'equipos') {
                        dynamicCols = parseInt(datamantemiento.materiales_mant) || 1; // o 1 si no aplica
                    }

                    // Asegurar límites
                    dynamicCols = Math.max(1, Math.min(10, dynamicCols));
                }

                console.log('dynamicCols asignado:', dynamicCols);

                // Si no hay datos y es mano_obra/materiales/equipos → fetch
                const normalizedKey = key.toLowerCase().trim();
                if (data.length === 0 && ['mano_obra', 'materiales', 'equipos'].includes(normalizedKey)) {
                    if (!dataCache.initialized) {
                        try {
                            const token = csrfToken || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                            const response = await fetch('/obtenerPresupuestoMOMAEQ', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': token },
                                body: JSON.stringify({})
                            });
                            if (response.ok) {
                                const result = await response.json();
                                dataCache.tables.mano_obra = result.data.mano_de_obra || [];
                                dataCache.tables.materiales = result.data.materiales || [];
                                dataCache.tables.equipos = result.data.equipos || [];
                                dataCache.initialized = true;
                                data = dataCache.tables[normalizedKey] || [];
                            }
                        } catch (fetchError) {
                            console.error('Error al obtener datos del backend:', fetchError);
                        }
                    }
                }

                // ✅ Asignar datos Y dynamicColumns al estado
                state.data = data;
                state.dynamicColumns = dynamicCols;
                state.loaded = true;

                // Guardar en caché
                dataCache.tables[key] = data;

            } catch (e) {
                console.error('Error en loadTabData:', e);
                throw new Error(e.message || 'Error al cargar datos');
            } finally {
                state.loading = false;
            }
        };

        // const loadTabData = async (key) => {
        //     const state = tabState[key];
        //     state.loading = true;

        //     try {
        //         let data = [];
        //         const normalizedKey = key.toLowerCase().trim();

        //         if (datamantemiento?.data_mantenimiento) {
        //             let raw = datamantemiento.data_mantenimiento;
        //             raw = raw.replace(/,\s*([\]}])/g, '$1');
        //             const parsedData = JSON.parse(raw);

        //             const tableMap = {
        //                 insumos: '#tbl_insumos',
        //                 cotizaciones: '#tbl_cotizaciones',
        //                 mano_obra: '#tbl_mano_obra',
        //                 materiales: '#tbl_materiales',
        //                 equipos: '#tbl_equipos',
        //                 resumen: '#tbl_resumen',
        //             };

        //             const tableKey = tableMap[normalizedKey];
        //             if (tableKey && parsedData.tables?.[tableKey]?.length > 0) {
        //                 data = parsedData.tables[tableKey];
        //             } else {
        //                 // 🔽 SOLICITUD AL BACKEND
        //                 try {
        //                     const token = csrfToken || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

        //                     const response = await fetch('/obtenerPresupuestoMOMAEQ', {
        //                         method: 'POST',
        //                         headers: {
        //                             'Content-Type': 'application/json',
        //                             'X-CSRF-TOKEN': token
        //                         },
        //                         body: JSON.stringify({}) // 🔄 Aquí estaba el problema
        //                     });

        //                     if (!response.ok) {
        //                         throw new Error('Error en la solicitud HTTP');
        //                     }

        //                     const result = await response.json();
        //                     console.log(' recibidos:', result.data);
        //                     console.log('Materiales recibidos:', result.data.materiales);

        //                     // 🔽 ASIGNAR LOS MATERIALES A "data"
        //                     if (normalizedKey === 'mano_obra') {
        //                         data = result.data.mano_de_obra || [];
        //                     } else if (normalizedKey === 'materiales') {
        //                         data = result.data.materiales || [];
        //                     } else if (normalizedKey === 'equipos') {
        //                         data = result.data.equipos || [];
        //                     }
        //                     // data = [
        //                     //     { 0: 1, 1: 'Cemento Portland', 2: 'bolsa', 3: 100, 4: 95, 6: 25.5, 13: 25.5 },
        //                     //     { 0: 2, 1: 'Arena fina', 2: 'm³', 3: 50, 4: 48, 6: 45.0 },
        //                     // ];

        //                 } catch (fetchError) {
        //                     if (normalizedKey === 'insumos') {
        //                         console.error('Error al obtener los datos del backend:', fetchError);

        //                         // Si falla el fetch, usar datos por defecto
        //                         data = [
        //                             { 0: 1, 1: 'Cemento Portland', 2: 'bolsa', 3: 100, 4: 95, 5: 25.5 },
        //                             { 0: 2, 1: 'Arena fina', 2: 'm³', 3: 50, 4: 48, 5: 45.0 },
        //                         ];
        //                     }
        //                 }
        //             }
        //         }

        //         state.data = data;
        //         state.loaded = true;

        //     } catch (e) {
        //         console.error('Error en loadTabData:', e);
        //         throw new Error(e.message || 'Error al cargar datos');
        //     } finally {
        //         state.loading = false;
        //     }
        // };

        const saveTabData = async (key, data) => {
            try {
                const payload = {
                    id_mantenimiento,
                    tab: key,
                    data,
                    note: tabState[key].form.note
                };

                // Simulación de guardado
                await new Promise(resolve => setTimeout(resolve, 300));

                // Actualizar caché con los nuevos datos
                dataCache.tables[key] = data;

            } catch (e) {
                throw new Error(e.message || 'Error al guardar');
            }
        };

        // Agregar esta función después de saveTabData
        const invalidateCache = (key) => {
            dataCache.tables[key] = null;
            if (['mano_obra', 'materiales', 'equipos'].includes(key)) {
                dataCache.initialized = false;
            }
        };

        const saveData = async () => {
            // Incluir todas las pestañas, sin importar si tienen cambios o no
            const tablesToSave = {};

            for (const tab of TABS) {
                const tabKey = tab.key;
                const tableSelector = tableMap[tabKey];
                const tableData = tabState[tabKey]?.data || []; // Si no hay datos, usar array vacío

                // Limpiar cada fila: eliminar propiedades `undefined` y asegurar claves como strings
                const cleanedData = tableData.map(row => {
                    const cleanedRow = {};
                    for (const key in row) {
                        // Solo incluir propiedades definidas
                        if (row[key] !== undefined) {
                            cleanedRow[String(key)] = row[key];
                        }
                    }
                    return cleanedRow;
                });

                tablesToSave[tableSelector] = cleanedData;
            }

            const payload = { tables: tablesToSave };

            console.log('Payload a enviar:', payload);

            // Aquí podrías hacer fetch o enviar `payload` al backend
            // await sendToBackend(payload);
            console.log(id_mantenimiento)
            const requestData = JSON.stringify({
                id_mantimiento: id_mantenimiento,
                data_mantenimiento: JSON.stringify(payload)
            });
            console.log(requestData);
            $.ajax({
                type: 'PUT',
                url: '/actualizarmantenimiento',
                data: requestData,
                contentType: 'application/json',
                processData: false,
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                    'Accept': 'application/json'
                },
                success: function (response) {
                    if (response.message === 'success') {
                        Swal.fire({
                            icon: 'success',
                            title: 'Éxito',
                            text: 'Los datos se guardaron correctamente.',
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Hubo un error al procesar la solicitud.',
                        });
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.error('Error Response:', jqXHR.responseJSON);
                    let errorMessage = 'Hubo un error al enviar los datos al servidor.';

                    if (jqXHR.responseJSON && jqXHR.responseJSON.errors) {
                        errorMessage = Object.values(jqXHR.responseJSON.errors).join('\n');
                    }

                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: errorMessage
                    });
                }
            });
        };

        const getCurrentTab = computed(() => {
            return TABS.find(t => t.key === activeKey.value);
        });

        return {
            TABS,
            activeKey,
            setActive,
            tabState,
            isMobile,
            globalMessage,
            setGlobalMessage,
            markTabChanged,
            loadTabData,
            saveTabData,
            saveData,
            getCurrentTab,
        };
    },
    template: `
        <div id="mantenimientoSystem" class="min-h-screen bg-gray-100 dark:bg-gray-900">
            <div class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div class="flex justify-between items-center py-4">
                        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
                            Sistema de Mantenimiento
                        </h1>
                        <button 
                            @click="saveData" 
                            class="flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-2 rounded-lg font-medium text-sm shadow transition transform hover:scale-105">
                            Guardar Mantenimiento al servidor
                        </button>
                    </div>
                </div>
            </div>

            <div v-if="globalMessage" class="max-w-7xl mx-auto mt-4 px-4 sm:px-6 lg:px-8">
                <div :class="[
                    'p-4 rounded-lg',
                    globalMessage.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' :
                    globalMessage.type === 'error' ? 'bg-red-100 text-red-800 border border-red-300' :
                    globalMessage.type === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                    'bg-blue-100 text-blue-800 border border-blue-300'
                ]">
                    {{ globalMessage.text }}
                </div>
            </div>

            <div class="max-w-full mx-auto px-1 sm:px-2 lg:px-2 mt-2">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div class="border-b border-gray-200 dark:border-gray-700">
                        <nav class="-mb-px flex space-x-8 overflow-x-auto px-6" aria-label="Tabs">
                            <button
                                v-for="tab in TABS"
                                :key="tab.key"
                                @click="setActive(tab.key)"
                                :class="[
                                    'whitespace-nowrap border-b-2 py-4 px-1 text-xs font-medium transition',
                                    activeKey === tab.key
                                        ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                ]">
                                <span class="flex items-center gap-2">
                                    {{ tab.icon }}
                                    {{ isMobile ? '' : tab.label }}
                                </span>
                            </button>
                        </nav>
                    </div>
                </div>
            </div>

            <div class="max-w-full mx-auto px-1 sm:px-2 lg:px-2 mt-2 pb-2">
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2">
                    <ScalableTableTab
                        :key="activeKey"
                        :tab-key="activeKey"
                        :table-type="getCurrentTab?.type || 'static'"
                        :state="tabState[activeKey]"
                        :load-data="loadTabData"
                        :save-data="saveTabData"
                        @update-global-message="setGlobalMessage"
                        @mark-changed="markTabChanged"
                        @transfer-to-cotizaciones="(payload) => {
                            // Poblar cotizaciones y desbloquearla
                            try {
                                tabState.cotizaciones.data = payload || [];
                                tabState.cotizaciones.loaded = true;
                                tabState.cotizaciones.locked = false;
                                // Copiar dynamicColumns desde insumos si existe
                                tabState.cotizaciones.dynamicColumns = tabState.insumos.dynamicColumns || 1;
                                setGlobalMessage({ text: 'Cotizaciones desbloqueada y rellenada desde Insumos', type: 'success' });
                            } catch (e) {
                                setGlobalMessage({ text: 'Error al transferir a cotizaciones: ' + (e.message || e), type: 'error' });
                            }
                        }"
                        @summary-updated="(payload) => {
                            try {
                                const { tab, totals } = payload || {};
                                if (!totals) return;
                                const idxMap = { mano_obra: 0, materiales: 1, equipos: 2 };
                                const rowIdx = idxMap[tab];
                                if (rowIdx === undefined) return;

                                // Ensure resumen has 3 rows
                                tabState.resumen = tabState.resumen || { data: [] };
                                const resumenData = tabState.resumen.data || [];
                                // Fill/expand rows
                                while (resumenData.length < 3) resumenData.push({ 0: '', 1: 0, 2: 0, 3: 0 });

                                const nombre = tab === 'mano_obra' ? 'Mano de Obra' : tab === 'materiales' ? 'Materiales' : 'Equipos';
                                const presupuesto = Number(totals.presupuesto || 0);
                                const gastoReal = Number(totals.gastoReal || 0);
                                const gastoPct = presupuesto !== 0 ? gastoReal / presupuesto : 0;

                                resumenData[rowIdx] = {
                                    0: nombre,
                                    1: presupuesto,
                                    2: gastoReal,
                                    3: gastoPct
                                };

                                tabState.resumen.data = resumenData;
                            } catch (e) {
                                setGlobalMessage({ text: 'Error actualizando resumen: ' + (e.message || e), type: 'error' });
                            }
                        }"
                    />
                </div>
            </div>
        </div>
    `
});

// ======================================
// 9. INICIALIZACIÓN
// ======================================

// Montar la aplicación
app.mount('#mantenimientoSystem');