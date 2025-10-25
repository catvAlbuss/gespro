// resources/js/core/resumen.calculator.js
/**
 * Motor de cálculo para resúmenes usando Arquero
 * Optimizado para grandes volúmenes de datos
 */
export class ResumenCalculator {
    /**
     * Calcula resumen agrupado por unidad
     * @param {Array<Object>} data - Datos de entrada
     * @param {Object} config - Configuración de columnas
     * @returns {Array<Object>} - Datos resumidos
     */
    static resumenPorUnidad(data, config) {
        if (!data || data.length === 0) return [];

        const { unitColumn, elemColumn, totalColumn } = config;

        try {
            // Filtrar datos válidos
            const validData = data.filter(row =>
                row[unitColumn] &&
                row[totalColumn] !== null &&
                row[totalColumn] !== undefined &&
                !isNaN(parseFloat(row[totalColumn]))
            );

            if (validData.length === 0) return [];

            // Crear tabla Arquero
            const table = aq.from(validData);

            // Agrupar y sumar
            const grouped = table
                .groupby(String(unitColumn))
                .rollup({
                    elementos: aq.op.sum(String(elemColumn)),
                    total: aq.op.sum(String(totalColumn)),
                    count: aq.op.count()
                })
                .orderby(aq.desc('total'));

            // Convertir a array
            return grouped.objects().map((row, idx) => ({
                '0': idx + 1,
                '1': `TOTAL ${row[String(unitColumn)]?.toUpperCase() || 'N/A'}`,
                '2': row[String(unitColumn)] || '',
                '3': parseFloat(row.elementos || 0),
                '4': parseFloat(row.total || 0),
                '_count': row.count
            }));
        } catch (error) {
            console.error('Error en resumenPorUnidad:', error);
            return [];
        }
    }

    /**
     * Calcula resumen por partidas principales
     * @param {Array<Object>} data - Datos de entrada
     * @param {Object} config - Configuración
     * @returns {Array<Object>}
     */
    static resumenPorPartida(data, config) {
        if (!data || data.length === 0) return [];

        const { itemColumn, descriptionColumn, totalColumn } = config;

        try {
            // Filtrar solo partidas principales (sin punto)
            const partidas = data.filter(row => {
                const item = row[itemColumn];
                return item && !item.includes('.');
            });

            if (partidas.length === 0) return [];

            return partidas.map((partida, idx) => {
                const partidaItem = partida[itemColumn];

                // Sumar todas las filas que pertenecen a esta partida
                const totalPartida = data
                    .filter(row => {
                        const item = row[itemColumn];
                        return item && (item === partidaItem || item.startsWith(partidaItem + '.'));
                    })
                    .reduce((sum, row) => sum + (parseFloat(row[totalColumn]) || 0), 0);

                return {
                    '0': partidaItem,
                    '1': partida[descriptionColumn] || '',
                    '2': totalPartida
                };
            });
        } catch (error) {
            console.error('Error en resumenPorPartida:', error);
            return [];
        }
    }

    /**
     * Calcula resumen por subpartidas
     * @param {Array<Object>} data - Datos de entrada
     * @param {Object} config - Configuración
     * @returns {Array<Object>}
     */
    static resumenPorSubpartida(data, config) {
        if (!data || data.length === 0) return [];

        const { itemColumn, descriptionColumn, totalColumn } = config;

        try {
            // Filtrar subpartidas (tienen un punto)
            const subpartidas = data.filter(row => {
                const item = row[itemColumn];
                return item && item.split('.').length === 2;
            });

            if (subpartidas.length === 0) return [];

            return subpartidas.map((subpartida, idx) => {
                const subpartidaItem = subpartida[itemColumn];

                // Sumar detalles de esta subpartida
                const totalSubpartida = this._sumDetallesSubpartida(data, subpartidaItem, itemColumn, totalColumn);

                return {
                    '0': subpartidaItem,
                    '1': subpartida[descriptionColumn] || '',
                    '2': totalSubpartida
                };
            });
        } catch (error) {
            console.error('Error en resumenPorSubpartida:', error);
            return [];
        }
    }

    /**
     * Suma los detalles (filas sin item) de una subpartida
     * @private
     */
    static _sumDetallesSubpartida(data, subpartidaItem, itemColumn, totalColumn) {
        let sum = 0;
        let collecting = false;

        data.forEach(row => {
            const item = row[itemColumn];

            if (item === subpartidaItem) {
                collecting = true;
                return;
            }

            if (collecting) {
                if (!item || item === '') {
                    // Es un detalle
                    sum += parseFloat(row[totalColumn]) || 0;
                } else if (item.split('.').length <= 2) {
                    // Nueva subpartida o partida, detener
                    collecting = false;
                }
            }
        });

        return sum;
    }

    /**
     * Calcula estadísticas generales
     * @param {Array<Object>} data - Datos de entrada
     * @param {Object} config - Configuración
     * @returns {Object} - Estadísticas
     */
    static calcularEstadisticas(data, config) {
        if (!data || data.length === 0) {
            return {
                totalFilas: 0,
                totalPartidas: 0,
                totalSubpartidas: 0,
                totalDetalles: 0,
                sumaTotal: 0,
                promedio: 0,
                maximo: 0,
                minimo: 0
            };
        }

        const { itemColumn, totalColumn } = config;

        const partidas = data.filter(r => r[itemColumn] && !r[itemColumn].includes('.')).length;
        const subpartidas = data.filter(r => r[itemColumn] && r[itemColumn].split('.').length === 2).length;
        const detalles = data.filter(r => !r[itemColumn] || r[itemColumn] === '').length;

        const totales = data
            .map(r => parseFloat(r[totalColumn]) || 0)
            .filter(v => v > 0);

        const suma = totales.reduce((a, b) => a + b, 0);

        return {
            totalFilas: data.length,
            totalPartidas: partidas,
            totalSubpartidas: subpartidas,
            totalDetalles: detalles,
            sumaTotal: suma,
            promedio: totales.length > 0 ? suma / totales.length : 0,
            maximo: totales.length > 0 ? Math.max(...totales) : 0,
            minimo: totales.length > 0 ? Math.min(...totales) : 0
        };
    }

    /**
     * Agrupa datos por múltiples columnas
     * @param {Array<Object>} data - Datos
     * @param {Array<string>} groupColumns - Columnas para agrupar
     * @param {Object} aggregations - Agregaciones { columnName: 'sum'|'avg'|'count' }
     * @returns {Array<Object>}
     */
    static agruparPor(data, groupColumns, aggregations) {
        if (!data || data.length === 0) return [];

        try {
            const table = aq.from(data);

            // Crear objeto de rollup
            const rollupObj = {};
            Object.entries(aggregations).forEach(([col, agg]) => {
                const colStr = String(col);
                switch (agg) {
                    case 'sum':
                        rollupObj[colStr] = aq.op.sum(colStr);
                        break;
                    case 'avg':
                        rollupObj[colStr] = aq.op.mean(colStr);
                        break;
                    case 'count':
                        rollupObj[colStr] = aq.op.count();
                        break;
                    case 'max':
                        rollupObj[colStr] = aq.op.max(colStr);
                        break;
                    case 'min':
                        rollupObj[colStr] = aq.op.min(colStr);
                        break;
                }
            });

            const grouped = table
                .groupby(...groupColumns.map(String))
                .rollup(rollupObj);

            return grouped.objects();
        } catch (error) {
            console.error('Error en agruparPor:', error);
            return [];
        }
    }

    /**
     * Filtra datos por criterios
     * @param {Array<Object>} data - Datos
     * @param {Object} filters - Filtros { column: value }
     * @returns {Array<Object>}
     */
    static filtrar(data, filters) {
        if (!data || data.length === 0) return [];

        try {
            let table = aq.from(data);

            Object.entries(filters).forEach(([col, value]) => {
                const colStr = String(col);
                if (Array.isArray(value)) {
                    table = table.filter(aq.escape(d => value.includes(d[colStr])));
                } else {
                    table = table.filter(aq.escape(d => d[colStr] === value));
                }
            });

            return table.objects();
        } catch (error) {
            console.error('Error en filtrar:', error);
            return data;
        }
    }

    /**
     * Ordena datos por columna
     * @param {Array<Object>} data - Datos
     * @param {string} column - Columna para ordenar
     * @param {boolean} desc - Descendente
     * @returns {Array<Object>}
     */
    static ordenar(data, column, desc = false) {
        if (!data || data.length === 0) return [];

        try {
            const table = aq.from(data);
            const ordered = desc
                ? table.orderby(aq.desc(String(column)))
                : table.orderby(String(column));

            return ordered.objects();
        } catch (error) {
            console.error('Error en ordenar:', error);
            return data;
        }
    }
}