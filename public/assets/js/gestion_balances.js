import GastoReal from "./balance/gastoRealv5.js";
import GastoProgramado from "./balance/gastoProgramado.js";
import ResumenBalance from "./balance/resumenbalances.js";

const tableGastosReal = new GastoReal();
tableGastosReal.init();

const tableGastosProgramado = new GastoProgramado();
tableGastosProgramado.init();

const tableResumen = new ResumenBalance();
tableResumen.init();
