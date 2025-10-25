// resources/js/core/arquero.utils.js
export class AQUtils {
  static resumenPorColumna(data, colAgrupar, sumCols) {
    const df = aq.from(data);
    const rollups = {};
    for (const [key, colName] of Object.entries(sumCols)) {
      rollups[key] = aq.op.sum(colName);
    }
    return df.groupby(colAgrupar).rollup(rollups).objects();
  }
}
