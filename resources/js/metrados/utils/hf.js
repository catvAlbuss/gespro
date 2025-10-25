/**
 * Singleton para gestionar una única instancia global de HyperFormula
 * Usando la versión cargada desde CDN (window.HyperFormula)
 */
export class HFCore {
  static instance = null;
  static sheetCounter = 0;

  constructor() {
    if (HFCore.instance) {
      return HFCore.instance;
    }

    if (typeof window.HyperFormula === "undefined") {
      throw new Error(
        "❌ HyperFormula no está disponible. Asegúrate de haber incluido el script CDN antes de este módulo."
      );
    }

    this.hf = HyperFormula.buildEmpty({
      licenseKey: "gpl-v3",
      chooseAddressMappingPolicy: HyperFormula.AlwaysSparse,
      useColumnIndex: true,
      evaluateNullToZero: true,
    });

    HFCore.instance = this;
  }

  /**
   * Devuelve la instancia global de HyperFormula
   */
  static getInstance() {
    if (!HFCore.instance) {
      new HFCore();
    }
    return HFCore.instance.hf;
  }

  /**
   * Crea una nueva hoja y devuelve su ID
   * @param {string} name
   * @returns {number} sheetId
   */
  static addSheet(name) {
    const hf = HFCore.getInstance();
    const sheetName = `${name}_${HFCore.sheetCounter++}`;
    hf.addSheet(sheetName);
    return hf.getSheetId(sheetName);
  }

  /**
   * Elimina una hoja si existe
   * @param {number} sheetId
   */
  static removeSheet(sheetId) {
    const hf = HFCore.getInstance();
    try {
      hf.removeSheet(sheetId);
    } catch (e) {
      console.warn("⚠️ No se pudo eliminar hoja:", e);
    }
  }
}
