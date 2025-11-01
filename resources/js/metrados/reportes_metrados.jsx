export class reportes_metrados {
    constructor() {
        this.workbook = null;

        // Estilos de borde estándar
        const border = {
            top: { style: 'thin', color: { argb: '000000' } },
            bottom: { style: 'thin', color: { argb: '000000' } },
            left: { style: 'thin', color: { argb: '000000' } },
            right: { style: 'thin', color: { argb: '000000' } },
        };

        // Definir todos los estilos
        this.styles = {
            border,

            // Título principal
            title: {
                font: { name: 'Arial', size: 12, bold: true },
                alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
                border,
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF' } },
            },

            // Encabezados de tabla
            header: {
                font: { name: 'Arial', size: 10, bold: true },
                alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
                border,
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9D9D9' } }
            },

            // Etiquetas de información (Proyecto:, UEI:, etc.)
            infoLabel: {
                font: { name: 'Arial', size: 9, bold: true },
                alignment: { vertical: 'middle', horizontal: 'left' },
                border
            },

            // Valores de información
            infoValue: {
                font: { name: 'Arial', size: 9 },
                alignment: { vertical: 'middle', horizontal: 'left', wrapText: true },
                border
            },

            // Cuerpo - alineación izquierda
            bodyLeft: {
                font: { name: 'Arial', size: 10 },
                alignment: { horizontal: 'left', vertical: 'middle' },
                border
            },

            // Cuerpo - alineación centro
            bodyCenter: {
                font: { name: 'Arial', size: 10 },
                alignment: { horizontal: 'center', vertical: 'middle' },
                border
            },

            // Cuerpo - alineación derecha
            bodyRight: {
                font: { name: 'Arial', size: 10 },
                alignment: { horizontal: 'right', vertical: 'middle' },
                border
            },

            // Colores jerárquicos (nivel 1-5)
            hierarchy: [
                { font: { name: 'Arial', size: 10, bold: true, color: { argb: '800080' } } }, // Morado
                { font: { name: 'Arial', size: 10, bold: true, color: { argb: 'FF0000' } } }, // Rojo
                { font: { name: 'Arial', size: 10, bold: true, color: { argb: '0000FF' } } }, // Azul
                { font: { name: 'Arial', size: 10, bold: true, color: { argb: '008000' } } }, // Verde
                { font: { name: 'Arial', size: 10, bold: true, color: { argb: '000000' } } }  // Negro
            ]
        };

        // Anchos de columna estándar
        this.columnWidths = {
            metrado: [
                { width: 4 }, { width: 4 }, { width: 15 }, { width: 50 },
                { width: 6 }, { width: 6 }, { width: 8 }, { width: 8 },
                { width: 8 }, { width: 12 }, { width: 8 }, { width: 8 },
                { width: 8 }, { width: 8 }, { width: 8 }, { width: 8 },
                { width: 4 }
            ],
            resumen: [
                { width: 4 }, { width: 4 }, { width: 15 }, { width: 90 },
                { width: 6 }, { width: 8 }, { width: 12 }, { width: 4 }
            ]
        };
    }

    // ============================================
    // UTILIDADES
    // ============================================

    _formatDate(fechaStr) {
        if (!fechaStr) return '';
        const fecha = new Date(fechaStr);
        if (isNaN(fecha)) return fechaStr;

        const meses = [
            'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
            'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
        ];
        return `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
    }

    // _getHierarchyLevel(itemCode) {
    //     if (!itemCode) return 4;
    //     const parts = itemCode.split('.');
    //     const validPairs = parts.filter(p => p && p.length === 2 && !isNaN(Number(p))).length;
    //     return Math.min(validPairs - 1, 4);
    // }

    _applyStyle(cell, baseStyle, options = {}) {
        cell.style = {
            ...baseStyle,
            ...options,
            border: this.styles.border
        };
    }

    _isEmpty(value) {
        return value === 0 || value === '0.00' || value === '' || value === undefined || value === null;
    }

    // ============================================
    // ENCABEZADO CON LOGOS
    // ============================================

    _escribirEncabezado(ws, options, numColumns) {
        const { logo1, logo2, nombre_proyecto, cui, codigo_modular, codigo_local } = options;

        ws.getRow(1).height = 100;

        const lastCol = numColumns;
        const logo2StartCol = lastCol - 1;
        const textEndCol = String.fromCharCode(65 + logo2StartCol - 3);

        // === Logo izquierdo ===
        if (logo1) {
            const imageId1 = this.workbook.addImage({
                buffer: logo1.data,
                extension: logo1.extension
            });
            ws.addImage(imageId1, {
                tl: { col: 2.2, row: 0 },
                ext: { width: 100, height: 95 }
            });
            ws.mergeCells('C1');
            this._applyStyle(ws.getCell('C1'), { alignment: { vertical: 'middle', horizontal: 'center' } });
        }

        // === Texto central (con fondo blanco y borde) ===
        ws.mergeCells(`D1:${textEndCol}1`);
        ws.getCell('D1').value = {
            richText: [
                { text: `${nombre_proyecto || ''}\n`, font: { bold: true, size: 11, name: 'Arial' } },
                {
                    text: `CUI: ${cui || ''}; CÓDIGO MODULAR: ${codigo_modular || ''}; CÓDIGO LOCAL: ${codigo_local || ''}`,
                    font: { size: 9, name: 'Arial' }
                }
            ]
        };
        this._applyStyle(ws.getCell('D1'), {
            alignment: { vertical: 'middle', horizontal: 'center', wrapText: true }
        });

        // Fondo blanco y borde solo desde C hasta Q (según numColumns)
        const startCol = 3; // C siempre
        const endCol = lastCol - 1; // convertir índice numérico a 1-based
        const row = ws.getRow(1);

        for (let col = startCol; col <= endCol; col++) {
            const cell = row.getCell(col);

            // Fondo blanco limpio
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFFFFF' }
            };

            // Borde exterior completo
            cell.border = {
                top: { style: 'thin', color: { argb: '000000' } },
                bottom: { style: 'thin', color: { argb: '000000' } },
                left: col === startCol ? { style: 'thin', color: { argb: '000000' } } : {},
                right: col === endCol ? { style: 'thin', color: { argb: '000000' } } : {}
            };
        }

        // === Logo derecho ===
        if (logo2) {
            const imageId2 = this.workbook.addImage({
                buffer: logo2.data,
                extension: logo2.extension
            });
            const logo2ColLetter = String.fromCharCode(65 + logo2StartCol);
            const lastColLetter = String.fromCharCode(65 + lastCol);

            ws.addImage(imageId2, {
                tl: { col: logo2StartCol - 1.50, row: 0 },
                ext: { width: 100, height: 95 }
            });
            ws.mergeCells(`${logo2ColLetter}1:${lastColLetter}1`);
            this._applyStyle(ws.getCell(`${logo2ColLetter}1`), {
                alignment: { vertical: 'middle', horizontal: 'center' }
            });
        }

        return 3;
    }

    // ============================================
    // INFORMACIÓN DEL PROYECTO (MEJORADA)
    // ============================================
    _colToNumber(col) {
        let num = 0;
        for (let i = 0; i < col.length; i++) {
            num = num * 26 + (col.charCodeAt(i) - 64);
        }
        return num;
    }

    _aplicarFondoYBorde(ws, startCol, startRow, endCol, endRow) {
        const borderColor = { argb: '000000' };

        // Aplicar fondo blanco a todo el bloque
        for (let r = startRow; r <= endRow; r++) {
            const row = ws.getRow(r);
            for (let c = startCol; c <= endCol; c++) {
                const cell = row.getCell(c);
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFFF' },
                };
                // ❌ Sin bordes internos
                cell.border = undefined;
            }
        }

        // ✅ Aplicar solo los bordes del contorno exterior
        // Borde superior
        for (let c = startCol; c <= endCol; c++) {
            ws.getCell(startRow, c).border = {
                top: { style: 'thin', color: borderColor },
            };
        }

        // Borde inferior
        for (let c = startCol; c <= endCol; c++) {
            ws.getCell(endRow, c).border = {
                bottom: { style: 'thin', color: borderColor },
            };
        }

        // Borde izquierdo
        for (let r = startRow; r <= endRow; r++) {
            const cell = ws.getCell(r, startCol);
            cell.border = {
                ...cell.border,
                left: { style: 'thin', color: borderColor },
            };
        }

        // Borde derecho
        for (let r = startRow; r <= endRow; r++) {
            const cell = ws.getCell(r, endCol);
            cell.border = {
                ...cell.border,
                right: { style: 'thin', color: borderColor },
            };
        }
    }
    
    _escribirInfoProyecto(ws, startRow, endCol, options) {
        const {
            nombre_proyecto, uei, snip, cui, unidad_ejecutora,
            codigo_local, codigomodular, // 👈 nombre correcto según tu log
            fecha, ubicacion, especialidad
        } = options;

        const colInicio = 3; // C
        const colFin = this._colToNumber(endCol);
        const colFinLetra = endCol;

        let currentRow = startRow;
        const firstRow = currentRow;

        // ====== PROYECTO ======
        ws.mergeCells(`C${currentRow}:C${currentRow + 1}`);
        ws.getCell(`C${currentRow}`).value = 'Proyecto:';
        this._applyStyle(ws.getCell(`C${currentRow}`), this.styles.infoLabel);

        ws.mergeCells(`D${currentRow}:${colFinLetra}${currentRow + 1}`);
        ws.getCell(`D${currentRow}`).value = nombre_proyecto || '';
        this._applyStyle(ws.getCell(`D${currentRow}`), this.styles.infoValue);

        ws.getRow(currentRow).height = 18;
        ws.getRow(currentRow + 1).height = 18;
        currentRow += 2;

        // ====== UIE / SNIP ======
        ws.getCell(`C${currentRow}`).value = 'UIE:';
        this._applyStyle(ws.getCell(`C${currentRow}`), this.styles.infoLabel);
        ws.getCell(`D${currentRow}`).value = uei || '';
        this._applyStyle(ws.getCell(`D${currentRow}`), this.styles.infoValue);

        ws.mergeCells(`E${currentRow}:F${currentRow}`);
        ws.getCell(`E${currentRow}`).value = 'SNIP:';
        this._applyStyle(ws.getCell(`E${currentRow}`), this.styles.infoLabel);

        ws.getCell(`G${currentRow}`).value = snip || '';
        this._applyStyle(ws.getCell(`G${currentRow}`), this.styles.infoValue);

        ws.getRow(currentRow).height = 18;
        currentRow++;

        // ====== Unidad Ejecutora / CUI ======
        ws.getCell(`C${currentRow}`).value = 'Unidad Ejecutora:';
        this._applyStyle(ws.getCell(`C${currentRow}`), this.styles.infoLabel);
        ws.getCell(`D${currentRow}`).value = unidad_ejecutora || '';
        this._applyStyle(ws.getCell(`D${currentRow}`), this.styles.infoValue);

        ws.mergeCells(`E${currentRow}:F${currentRow}`);
        ws.getCell(`E${currentRow}`).value = 'CUI:';
        this._applyStyle(ws.getCell(`E${currentRow}`), this.styles.infoLabel);

        ws.getCell(`G${currentRow}`).value = cui || '';
        this._applyStyle(ws.getCell(`G${currentRow}`), this.styles.infoValue);

        ws.getRow(currentRow).height = 18;
        currentRow++;

        // ====== Código Modular / Código Local ======
        let modulos = '-';
        try {
            let data = codigomodular;

            // Si viene como string JSON → parsear
            if (typeof data === 'string') {
                data = JSON.parse(data);
            }

            // Si viene como objeto simple, convertir a array
            if (!Array.isArray(data) && typeof data === 'object' && data !== null) {
                data = [data];
            }

            // Extraer niveles válidos (inicial, primaria, secundaria)
            const niveles = ['inicial', 'primaria', 'secundaria'];
            const partes = [];

            niveles.forEach(nivel => {
                const encontrado = data.find(d => d[nivel]);
                if (encontrado && encontrado[nivel]) {
                    partes.push(`${capitalize(nivel)}: ${encontrado[nivel]}`);
                }
            });

            modulos = partes.join(' / ') || '-';
        } catch (err) {
            console.warn('⚠️ Error al parsear código modular:', err);
        }

        ws.getCell(`C${currentRow}`).value = 'Código Modular:';
        this._applyStyle(ws.getCell(`C${currentRow}`), this.styles.infoLabel);
        ws.getCell(`D${currentRow}`).value = modulos;
        this._applyStyle(ws.getCell(`D${currentRow}`), this.styles.infoValue);

        ws.mergeCells(`E${currentRow}:F${currentRow}`);
        ws.getCell(`E${currentRow}`).value = 'Código Local:';
        this._applyStyle(ws.getCell(`E${currentRow}`), this.styles.infoLabel);

        ws.getCell(`G${currentRow}`).value = codigo_local || '';
        this._applyStyle(ws.getCell(`G${currentRow}`), this.styles.infoValue);

        ws.getRow(currentRow).height = 18;
        currentRow++;

        // ====== Fecha ======
        ws.getCell(`C${currentRow}`).value = 'Fecha:';
        this._applyStyle(ws.getCell(`C${currentRow}`), this.styles.infoLabel);
        ws.mergeCells(`D${currentRow}:${colFinLetra}${currentRow}`);
        ws.getCell(`D${currentRow}`).value = this._formatDate(fecha);
        this._applyStyle(ws.getCell(`D${currentRow}`), this.styles.infoValue);
        ws.getRow(currentRow).height = 18;
        currentRow++;

        // ====== Ubicación ======
        if (ubicacion) {
            ws.getCell(`C${currentRow}`).value = 'Ubicación:';
            this._applyStyle(ws.getCell(`C${currentRow}`), this.styles.infoLabel);
            ws.mergeCells(`D${currentRow}:${colFinLetra}${currentRow}`);
            ws.getCell(`D${currentRow}`).value = ubicacion;
            this._applyStyle(ws.getCell(`D${currentRow}`), this.styles.infoValue);
            ws.getRow(currentRow).height = 18;
            currentRow++;
        }

        // ====== Especialidad ======
        if (especialidad) {
            ws.getCell(`C${currentRow}`).value = 'Especialidad:';
            this._applyStyle(ws.getCell(`C${currentRow}`), this.styles.infoLabel);
            ws.mergeCells(`D${currentRow}:${colFinLetra}${currentRow}`);
            ws.getCell(`D${currentRow}`).value = especialidad;
            this._applyStyle(ws.getCell(`D${currentRow}`), this.styles.infoValue);
            ws.getRow(currentRow).height = 18;
            currentRow++;
        }

        // ====== BORDE Y FONDO ======
        const lastRow = currentRow - 1;
        this._aplicarFondoYBorde(ws, colInicio, firstRow, colFin, lastRow);

        return currentRow + 1;

        function capitalize(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
    }

    // ============================================
    // ENCABEZADOS DE TABLA
    // ============================================

    _escribirEncabezadosMetrado(ws, headerRow) {
        // ====== MERGE CELLS ======
        ws.mergeCells(`C${headerRow}:C${headerRow + 1}`);
        ws.mergeCells(`D${headerRow}:D${headerRow + 1}`);
        ws.mergeCells(`E${headerRow}:E${headerRow + 1}`);
        ws.mergeCells(`F${headerRow}:F${headerRow + 1}`);
        ws.mergeCells(`G${headerRow}:I${headerRow}`);
        ws.mergeCells(`J${headerRow}:J${headerRow + 1}`);
        ws.mergeCells(`K${headerRow}:O${headerRow}`);
        ws.mergeCells(`P${headerRow}:P${headerRow + 1}`);

        // ====== TITULOS PRINCIPALES ======
        const headers = {
            C: 'ITEM',
            D: 'DESCRIPCIÓN',
            E: 'Und',
            F: 'Elem.\nSimil.',
            G: 'DIMENSIONES',
            J: 'Nº de\nVeces',
            K: 'METRADO',
            P: 'TOTAL'
        };

        Object.entries(headers).forEach(([col, value]) => {
            const cell = ws.getCell(`${col}${headerRow}`);
            cell.value = value;
            this._applyStyle(cell, this.styles.header);
        });

        // ====== SUBTITULOS ======
        const subHeaders = {
            G: 'Largo', H: 'Ancho', I: 'Alto',
            K: 'Lon.', L: 'Área', M: 'Vol.', N: 'Kg.', O: 'Und.'
        };

        Object.entries(subHeaders).forEach(([col, value]) => {
            const cell = ws.getCell(`${col}${headerRow + 1}`);
            cell.value = value;
            this._applyStyle(cell, this.styles.header);
        });

        // ====== ALTURAS ======
        ws.getRow(headerRow).height = 30;
        ws.getRow(headerRow + 1).height = 20;

        // ====== BORDES ======
        const borderStyle = {
            top: { style: 'thin', color: { argb: '000000' } },
            left: { style: 'thin', color: { argb: '000000' } },
            bottom: { style: 'thin', color: { argb: '000000' } },
            right: { style: 'thin', color: { argb: '000000' } }
        };

        for (let r = headerRow; r <= headerRow + 1; r++) {
            for (let c = this._colToNumber('C'); c <= this._colToNumber('P'); c++) {
                ws.getCell(r, c).border = borderStyle;
            }
        }

        return headerRow + 2;
    }

    _escribirEncabezadosResumen(ws, headerRow, moduleNames = null) {
        const borderStyle = {
            top: { style: 'thin', color: { argb: '000000' } },
            left: { style: 'thin', color: { argb: '000000' } },
            bottom: { style: 'thin', color: { argb: '000000' } },
            right: { style: 'thin', color: { argb: '000000' } }
        };

        let lastColLetter = 'G'; // valor por defecto si no hay módulos

        if (moduleNames && moduleNames.length > 0) {
            ws.mergeCells(`C${headerRow}:C${headerRow + 1}`);
            ws.mergeCells(`D${headerRow}:D${headerRow + 1}`);
            ws.mergeCells(`E${headerRow}:E${headerRow + 1}`);

            ws.getCell(`C${headerRow}`).value = 'ITEM';
            ws.getCell(`D${headerRow}`).value = 'DESCRIPCIÓN';
            ws.getCell(`E${headerRow}`).value = 'Und';

            this._applyStyle(ws.getCell(`C${headerRow}`), this.styles.header);
            this._applyStyle(ws.getCell(`D${headerRow}`), this.styles.header);
            this._applyStyle(ws.getCell(`E${headerRow}`), this.styles.header);

            moduleNames.forEach((name, i) => {
                const col = String.fromCharCode(70 + i); // F, G, H...
                ws.mergeCells(`${col}${headerRow}:${col}${headerRow + 1}`);
                ws.getCell(`${col}${headerRow}`).value = name;
                this._applyStyle(ws.getCell(`${col}${headerRow}`), this.styles.header);
            });

            const totalCol = String.fromCharCode(70 + moduleNames.length);
            lastColLetter = totalCol;

            ws.mergeCells(`${totalCol}${headerRow}:${totalCol}${headerRow + 1}`);
            ws.getCell(`${totalCol}${headerRow}`).value = 'TOTAL';
            this._applyStyle(ws.getCell(`${totalCol}${headerRow}`), this.styles.header);
        } else {
            // ====== SIN MÓDULOS ======
            ws.mergeCells(`C${headerRow}:C${headerRow + 1}`);
            ws.mergeCells(`D${headerRow}:D${headerRow + 1}`);
            ws.mergeCells(`E${headerRow}:E${headerRow + 1}`);
            ws.mergeCells(`F${headerRow}:F${headerRow + 1}`);
            ws.mergeCells(`G${headerRow}:G${headerRow + 1}`);

            const headers = {
                C: 'ITEM',
                D: 'DESCRIPCIÓN',
                E: 'Und',
                F: 'Parcial',
                G: 'Total'
            };

            Object.entries(headers).forEach(([col, value]) => {
                const cell = ws.getCell(`${col}${headerRow}`);
                cell.value = value;
                this._applyStyle(cell, this.styles.header);
            });
        }

        // ====== ALTURAS ======
        ws.getRow(headerRow).height = 30;
        ws.getRow(headerRow + 1).height = 20;

        // ====== BORDES ======
        const startCol = this._colToNumber('C');
        const endCol = this._colToNumber(lastColLetter);

        for (let r = headerRow; r <= headerRow + 1; r++) {
            for (let c = startCol; c <= endCol; c++) {
                ws.getCell(r, c).border = borderStyle;
            }
        }

        return headerRow + 2;
    }

    // ============================================
    // LLENADO DE DATOS
    // ============================================

    _llenarFilasMetrado(ws, items, startRow) {
        let currentRow = startRow;

        const addRow = (item) => {
            const row = [
                '', '',
                item.item || '',
                item.descripcion || '',
                item.unidad || '',
                item.elesimil || '',
                item.largo || '',
                item.ancho || '',
                item.alto || '',
                item.nveces || '',
                item.longitud || '',
                item.area || '',
                item.volumen || '',
                item.kg || '',
                this._isEmpty(item.unidadcalculado) ? '' : item.unidadcalculado,
                this._isEmpty(item.totalnieto) ? '' : item.totalnieto
            ];

            ws.addRow(row);

            const level = this._getHierarchyLevel(item.item);
            const hierarchyStyle = this.styles.hierarchy[level];

            ws.getRow(currentRow).eachCell((cell, colNum) => {
                if (colNum < 3 || colNum > 16) return;

                if (colNum === 3 || colNum === 4) {
                    this._applyStyle(cell, this.styles.bodyLeft, { font: hierarchyStyle.font });
                } else if (colNum === 5) {
                    this._applyStyle(cell, this.styles.bodyCenter, { font: { bold: true } });
                } else {
                    this._applyStyle(cell, this.styles.bodyRight, { font: { bold: true } });
                }
            });

            currentRow++;

            if (item.children && item.children.length > 0) {
                item.children.forEach(child => addRow(child));
            }
        };

        items.forEach(item => addRow(item));
    }
    _getHierarchyLevel(itemCode) {
        if (!itemCode) return 4;
        const parts = itemCode.split('.');
        const validPairs = parts.filter(p => p && p.length === 2 && !isNaN(Number(p))).length;
        const level = validPairs - 1;
        if (isNaN(level) || level < 0) return 4;
        return Math.min(level, 4);
    }

    _llenarFilasResumen(ws, items, startRow, moduleNames = null) {
        let currentRow = startRow;

        const addRow = (item) => {
            const row = moduleNames
                ? ['', '', item.item || '', item.descripcion || '', item.unidad || '',
                    ...(item.partials || []), item.total || '']
                : ['', '', item.item || '', item.descripcion || '', item.unidad || '',
                    item.parcial || item.totalnieto || '', item.total || ''];

            ws.addRow(row);

            const level = this._getHierarchyLevel(item.item);
            const hierarchyStyle = this.styles.hierarchy[level] || this.styles.hierarchy[4];
            const maxCol = moduleNames ? 6 + moduleNames.length : 7;

            ws.getRow(currentRow).eachCell((cell, colNum) => {
                if (colNum < 3 || colNum > maxCol) return;

                if (colNum === 3 || colNum === 4) {
                    this._applyStyle(cell, this.styles.bodyLeft, { font: hierarchyStyle.font });
                } else if (colNum === 5) {
                    this._applyStyle(cell, this.styles.bodyCenter, { font: { bold: true } });
                } else {
                    this._applyStyle(cell, this.styles.bodyRight, { font: { bold: true } });
                }
            });

            currentRow++;

            if (item.children && item.children.length > 0) {
                item.children.forEach(child => addRow(child));
            }
        };

        items.forEach(item => addRow(item));
    }

    // ============================================
    // GENERACIÓN DE WORKBOOK
    // ============================================

    async generateWorkbook(data = [], resumenData = [], options = {}) {
        this.workbook = new ExcelJS.Workbook();

        const isMultiModule = options.moduleNames && options.moduleNames.length > 0;

        // Función auxiliar: agrega borde al título
        const aplicarBordeTitulo = (ws, startCol, endCol, row) => {
            const borderColor = { argb: '000000' };
            for (let c = startCol; c <= endCol; c++) {
                const cell = ws.getRow(row).getCell(c);
                cell.border = {
                    top: { style: 'thin', color: borderColor },
                    bottom: { style: 'thin', color: borderColor },
                    left: c === startCol ? { style: 'thin', color: borderColor } : undefined,
                    right: c === endCol ? { style: 'thin', color: borderColor } : undefined,
                };
            }
        };

        if (isMultiModule) {
            // ======== MÚLTIPLES MÓDULOS ========
            options.moduleNames.forEach((moduleName, index) => {
                const ws = this.workbook.addWorksheet(`Metrado - ${moduleName}`);
                ws.columns = this.columnWidths.metrado;

                let currentRow = 1;

                if (options.logo1 && options.logo2) {
                    currentRow = this._escribirEncabezado(ws, options, 17);
                }

                // ----- Título -----
                const titulo = `METRADO - ${moduleName.toUpperCase()}${options.especialidad ? ` (${options.especialidad.toUpperCase()})` : ''}`;
                ws.mergeCells(`C${currentRow}:P${currentRow}`);
                ws.getCell(`C${currentRow}`).value = titulo;
                this._applyStyle(ws.getCell(`C${currentRow}`), this.styles.title);

                // Aplicar borde exterior al título
                aplicarBordeTitulo(ws, 3, 16, currentRow);

                currentRow++;

                // ----- Info del proyecto -----
                currentRow = this._escribirInfoProyecto(ws, currentRow, 'P', options);

                // ----- Encabezado de metrado -----
                currentRow = this._escribirEncabezadosMetrado(ws, currentRow);

                // ----- Datos -----
                const moduleData = Array.isArray(data[index]) ? data[index] : [];
                this._llenarFilasMetrado(ws, moduleData, currentRow);
            });

            // ======== RESUMEN (MULTIMÓDULO) ========
            const resumenWs = this.workbook.addWorksheet('Resumen');
            const numColsResumen = 5 + options.moduleNames.length + 1;

            resumenWs.columns = [
                { width: 4 }, { width: 4 }, { width: 15 }, { width: 90 }, { width: 6 },
                ...Array(options.moduleNames.length + 1).fill({ width: 12 })
            ];

            let currentRow = 1;

            if (options.logo1 && options.logo2) {
                currentRow = this._escribirEncabezado(resumenWs, options, numColsResumen);
            }

            const endCol = String.fromCharCode(69 + options.moduleNames.length + 1);
            const tituloResumen = `RESUMEN DE METRADO${options.especialidad ? ` (${options.especialidad.toUpperCase()})` : ''}`;
            resumenWs.mergeCells(`C${currentRow}:${endCol}${currentRow}`);
            resumenWs.getCell(`C${currentRow}`).value = tituloResumen;
            this._applyStyle(resumenWs.getCell(`C${currentRow}`), this.styles.title);

            // Borde del título de resumen
            const startColNum = 3;
            const endColNum = this._colToNumber(endCol);
            aplicarBordeTitulo(resumenWs, startColNum, endColNum, currentRow);

            currentRow++;

            currentRow = this._escribirInfoProyecto(resumenWs, currentRow, endCol, options);
            currentRow = this._escribirEncabezadosResumen(resumenWs, currentRow, options.moduleNames);
            this._llenarFilasResumen(resumenWs, resumenData, currentRow, options.moduleNames);

        } else {
            // ======== MÓDULO ÚNICO ========
            const ws = this.workbook.addWorksheet('Metrado');
            ws.columns = this.columnWidths.metrado;

            let currentRow = 1;

            if (options.logo1 && options.logo2) {
                currentRow = this._escribirEncabezado(ws, options, 17);
            }

            // ----- Título -----
            const titulo = `METRADO${options.especialidad ? ` (${options.especialidad.toUpperCase()})` : ''}`;
            ws.mergeCells(`C${currentRow}:P${currentRow}`);
            ws.getCell(`C${currentRow}`).value = titulo;
            this._applyStyle(ws.getCell(`C${currentRow}`), this.styles.title);
            aplicarBordeTitulo(ws, 3, 16, currentRow);
            currentRow++;

            // ----- Info del proyecto -----
            currentRow = this._escribirInfoProyecto(ws, currentRow, 'P', options);
            currentRow = this._escribirEncabezadosMetrado(ws, currentRow);
            this._llenarFilasMetrado(ws, data, currentRow);

            // ======== RESUMEN SIMPLE ========
            const resumenWs = this.workbook.addWorksheet('Resumen');
            resumenWs.columns = this.columnWidths.resumen;

            currentRow = 1;

            if (options.logo1 && options.logo2) {
                currentRow = this._escribirEncabezado(resumenWs, options, 8);
            }

            const tituloResumen = `RESUMEN DE METRADO${options.especialidad ? ` (${options.especialidad.toUpperCase()})` : ''}`;
            resumenWs.mergeCells(`C${currentRow}:G${currentRow}`);
            resumenWs.getCell(`C${currentRow}`).value = tituloResumen;
            this._applyStyle(resumenWs.getCell(`C${currentRow}`), this.styles.title);
            aplicarBordeTitulo(resumenWs, 3, 7, currentRow);
            currentRow++;

            currentRow = this._escribirInfoProyecto(resumenWs, currentRow, 'G', options);
            currentRow = this._escribirEncabezadosResumen(resumenWs, currentRow);
            this._llenarFilasResumen(resumenWs, resumenData, currentRow);
        }

        return this.workbook;
    }

    // ============================================
    // DESCARGA
    // ============================================

    async download(data = [], resumenData = [], options = {}, filename = 'metrado_instalaciones.xlsx') {
        const workbook = await this.generateWorkbook(data, resumenData, options);
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        return true;
    }
}

export default reportes_metrados;