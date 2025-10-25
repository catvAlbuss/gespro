// resources/js/core/formula.engine.js

/**
 * Motor de fórmulas universal para metrados
 * Genera fórmulas dinámicas basadas en unidades y estructura
 */
export class FormulaEngine {
    /**
     * Genera fórmulas CONDICIONALES para las columnas de metrado intermedias
     * Solo calcula el valor si la unidad corresponde, caso contrario retorna vacío
     * @param {number} row - Número de fila (0-indexed)
     * @param {Object} columns - Mapeo de columnas
     * @returns {Object} - { lon: formula, area: formula, vol: formula, kg: formula, undc: formula }
     */
    static generateIntermediateFormulas(row, columns) {
        const { unit, elem, l, an, al, veces, lon, area, vol, kg, undc } = columns;

        // Referencias base
        const U = `${this._colToLetter(unit)}${row + 1}`;
        const E = `${this._colToLetter(elem)}${row + 1}`;
        const F = `${this._colToLetter(l)}${row + 1}`;
        const G = `${this._colToLetter(an)}${row + 1}`;
        const H = `${this._colToLetter(al)}${row + 1}`;
        const I = `${this._colToLetter(veces)}${row + 1}`;

        return {
            // Longitud (m): Solo si unidad = "m"
            // =IF(C2="m", D2*E2*I2, "")
            [lon]: `=IF(${U}="m",${E}*${F}*${I},"")`,

            // Área (m2): Solo si unidad = "m2"
            // =IF(C2="m2", D2*E2*F2*I2, "")
            [area]: `=IF(${U}="m2",${E}*${F}*${G}*${I},"")`,

            // Volumen (m3): Solo si unidad = "m3"
            // =IF(C2="m3", D2*E2*F2*G2*I2, "")
            [vol]: `=IF(${U}="m3",${E}*${F}*${G}*${H}*${I},"")`,

            // Kilogramos: Solo si unidad = "kg"
            // =IF(C2="kg", D2*I2, "")
            [kg]: `=IF(${U}="kg",${E}*${I},"")`,

            // Unidades: Para "und." y "glb"
            // =IF(OR(C2="und.",C2="glb"), D2*I2, "")
            [undc]: `=IF(OR(${U}="und.",${U}="glb"),${E}*${I},"")`
        };
    }

    /**
     * Genera fórmula para columna TOTAL que selecciona la columna correcta según unidad
     * @param {number} row - Número de fila
     * @param {Object} columns - Mapeo de columnas
     * @returns {string} - Fórmula con IF anidados
     */
    static generateTotalFormula(row, columns) {
        const { unit, lon, area, vol, kg, undc } = columns;

        const U = `${this._colToLetter(unit)}${row + 1}`;
        const Lon = `${this._colToLetter(lon)}${row + 1}`;
        const Area = `${this._colToLetter(area)}${row + 1}`;
        const Vol = `${this._colToLetter(vol)}${row + 1}`;
        const Kg = `${this._colToLetter(kg)}${row + 1}`;
        const Undc = `${this._colToLetter(undc)}${row + 1}`;

        // Fórmula que selecciona la columna correcta
        // =IF(C2="m", J2, IF(C2="m2", K2, IF(C2="m3", L2, IF(C2="kg", M2, N2))))
        return `=IF(${U}="m",${Lon},IF(${U}="m2",${Area},IF(${U}="m3",${Vol},IF(${U}="kg",${Kg},${Undc}))))`;
    }

    /**
     * Genera fórmula SUMIF para sumar por subpartida
     * @param {string} sheetName - Nombre de la hoja
     * @param {number} startRow - Fila inicial (1-indexed)
     * @param {number} endRow - Fila final (1-indexed)
     * @param {Object} columns - Mapeo de columnas
     * @param {string} criteria - Criterio de búsqueda (ej: "01.01*")
     * @returns {string} - Fórmula SUMIF
     */
    static generateSumIfFormula(sheetName, startRow, endRow, columns, criteria) {
        const { item, total } = columns;
        const itemRange = `${sheetName}!${this._colToLetter(item)}${startRow}:${this._colToLetter(item)}${endRow}`;
        const totalRange = `${sheetName}!${this._colToLetter(total)}${startRow}:${this._colToLetter(total)}${endRow}`;

        return `=SUMIF(${itemRange},"${criteria}",${totalRange})`;
    }

    /**
     * Genera fórmula para subtotales de partidas (01, 02, 03)
     * Suma todos los detalles de esa partida
     * @param {number} row - Fila de la partida
     * @param {Object} columns - Mapeo de columnas
     * @param {number} startDetailRow - Primera fila de detalles
     * @param {number} endDetailRow - Última fila de detalles
     * @returns {string}
     */
    static generatePartidaTotalFormula(row, columns, startDetailRow, endDetailRow) {
        const { item, total } = columns;
        const partidaItem = `${this._colToLetter(item)}${row + 1}`;
        const itemRange = `${this._colToLetter(item)}${startDetailRow}:${this._colToLetter(item)}${endDetailRow}`;
        const totalRange = `${this._colToLetter(total)}${startDetailRow}:${this._colToLetter(total)}${endDetailRow}`;

        // Suma si el item comienza con el número de la partida
        // Ejemplo: =SUMIF(A:A, "01*", N:N)
        return `=SUMIF(${itemRange},${partidaItem}&"*",${totalRange})`;
    }

    /**
     * Convierte número de columna a letra (0 = A, 1 = B, etc.)
     * @param {number} col - Índice de columna (0-indexed)
     * @returns {string} - Letra de columna
     */
    static _colToLetter(col) {
        let letter = '';
        let temp = col;

        while (temp >= 0) {
            letter = String.fromCharCode((temp % 26) + 65) + letter;
            temp = Math.floor(temp / 26) - 1;
        }

        return letter;
    }

    /**
     * Convierte letra de columna a número (A = 0, B = 1, etc.)
     * @param {string} letter - Letra de columna
     * @returns {number} - Índice de columna
     */
    static _letterToCol(letter) {
        let col = 0;
        for (let i = 0; i < letter.length; i++) {
            col = col * 26 + (letter.charCodeAt(i) - 64);
        }
        return col - 1;
    }

    /**
     * Valida que una fórmula sea correcta
     * @param {string} formula - Fórmula a validar
     * @returns {boolean}
     */
    static validateFormula(formula) {
        if (!formula || typeof formula !== 'string') return false;
        if (!formula.startsWith('=')) return false;

        // Validaciones básicas
        const openParens = (formula.match(/\(/g) || []).length;
        const closeParens = (formula.match(/\)/g) || []).length;

        return openParens === closeParens;
    }

    /**
     * Genera fórmulas para toda una fila según configuración
     * @param {Object} config - Configuración de fórmulas
     * @param {number} row - Número de fila (0-indexed)
     * @returns {Object} - { columnIndex: formula, ... }
     */
    static generateRowFormulas(config, row) {
        const formulas = {};

        // Generar fórmulas intermedias condicionales
        const intermediate = this.generateIntermediateFormulas(row, config.columns);
        Object.assign(formulas, intermediate);

        // Generar fórmula total
        formulas[config.columns.total] = this.generateTotalFormula(row, config.columns);

        return formulas;
    }

    /**
     * Determina si una fila es partida (01, 02), subpartida (01.01) o detalle (vacío)
     * @param {string} item - Valor del item
     * @returns {string} - 'partida' | 'subpartida' | 'detalle'
     */
    static getRowType(item) {
        if (!item || item.trim() === '') return 'detalle';

        const parts = item.split('.');
        if (parts.length === 1) return 'partida';
        if (parts.length === 2) return 'subpartida';
        if (parts.length >= 3) return 'subsubpartida';

        return 'detalle';
    }

    /**
     * Verifica si un item es hijo de una partida
     * @param {string} childItem - Item hijo (ej: "01.01.02")
     * @param {string} parentItem - Item padre (ej: "01")
     * @returns {boolean}
     */
    static isChildOf(childItem, parentItem) {
        if (!childItem || !parentItem) return false;
        return childItem.startsWith(parentItem + '.');
    }
}

/**
 * Configuración de fórmulas para metrados específicos
 */
export class MetradoFormulaConfig {
    /**
     * Configuración para metrado de comunicaciones/instalaciones
     */
    static COMUNICACIONES = {
        columns: {
            item: 0,        // A
            description: 1, // B
            unit: 2,        // C
            elem: 3,        // D
            l: 4,           // E
            an: 5,          // F
            al: 6,          // G
            veces: 7,       // H
            lon: 8,         // I (Longitud m)
            area: 9,        // J (Área m2)
            vol: 10,        // K (Volumen m3)
            kg: 11,         // L (Kilogramos)
            undc: 12,       // M (Unidades/Global)
            total: 13       // N (Total)
        },
        formulaColumns: [8, 9, 10, 11, 12, 13], // Columnas que tienen fórmulas
        editableColumns: [0, 1, 2, 3, 4, 5, 6, 7], // Columnas editables
        numericColumns: [3, 4, 5, 6, 7], // Columnas numéricas de entrada
        units: ['m', 'm2', 'm3', 'kg', 'und.', 'glb'] // Unidades válidas
    };

    /**
     * Configuración para metrado de estructuras
     */
    static ESTRUCTURAS = {
        columns: {
            item: 0,
            description: 1,
            unit: 2,
            elem: 3,
            l: 4,
            an: 5,
            al: 6,
            veces: 7,
            parcial: 8,
            total: 9
        },
        formulaColumns: [8, 9],
        editableColumns: [0, 1, 2, 3, 4, 5, 6, 7],
        numericColumns: [3, 4, 5, 6, 7],
        units: ['m', 'm2', 'm3', 'und.', 'glb']
    };

    /**
     * Obtiene configuración por nombre
     * @param {string} name - Nombre de la configuración
     * @returns {Object}
     */
    static getConfig(name) {
        return this[name.toUpperCase()] || this.COMUNICACIONES;
    }
}