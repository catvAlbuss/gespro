import { createSpreeadSheetTable } from "./tabulator_base/table_factory.js";
import {
  tbl_alumnos_y_personal_administrativo,
  tbl_areas_verdes_depositos,
  tbl_pisos_model,
  tbl_L_accesorios_model,
  tbl_gastos_por_accesorios_niveles,
  tbl_gastos_por_accesorios_model,
  tbl_areas_verdes_niveles_model,
  createJSpreadSheet,
  tbl_l_accesorios_model,
} from "./tabulator_base/istables.js";

import {
  tabulatorPisoComponent,
  alumnosYPersonalAdministrativoComponent,
  pisoComponent,
  areasVerdesYDepositosComponent,
  lAccesoriosComponent,
  tableCurvaDePresionComponent,
  analisisParaLaTuberiaComponent,
  perdidaDeCargaTotalComponent,
  tabulatorAccesorioComponent,
  accesoriosComponent,
  tabulatorAreasVerdesNivelesComponent,
  nivelesExteriorAreasVerdesComponent,
  dotTablesComponent,
  cisternaComponent,
  tanqueComponent,
  curvaDePerdidaDePresionAxesComponent,
  gastoPorAccesoriosNivelesComponent,
  curvaDePerdidaDePresionAxesComponentAsImg,
  curvaDePerdidaDePresionAxesComponent2,
} from "./tabulator_base/iscomponents.js";

import {
  h_formatter,
  ls_formatter,
  lt_dia_formatter,
  lt_formatter,
  m3_formatter,
  m3_h_formatter,
  m_formatter,
  m_sign_formatter,
  percent_formatter,
} from "./tabulator_base/formatters.js";

import { longEquiv, inch_decimal, gasto_acc, buscarGastoInch, gasto_imp, gasto } from "./tabulator_base/isdata.js";

function asNumber(value, data) {
  const valueParsed = parseFloat(value);
  return isNaN(valueParsed) ? 0 : valueParsed;
}

const pdfFormatters = {
  volumenDemanda: lt_dia_formatter,
  volDeCisterna: m3_formatter,
  volTotalMinimo: m3_formatter,
  alturaDeAguaMin: m_formatter,
  cisternaLargo: m_formatter,
  cisternaAncho: m_formatter,
  cisternaAltura: m_formatter,
  volumenCisterna: m3_formatter,
  cisternaNivelDelTecho: m_sign_formatter,
  cisternaNivelDeTerrenoNatural: m_sign_formatter,
  cisternaHTecho: m_formatter,
  cisternaHIngreso: m_formatter,
  cisternaHRebose: m_formatter,
  cisternaNivelHTecho: m_sign_formatter,
  cisternaNivelHIngreso: m_sign_formatter,
  cisternaNivelHReboseSuperior: m_sign_formatter,
  cisternaNivelHReboseInferior: m_sign_formatter,
  cisternaAlturaDeAgua: m_formatter,
  cisternaNivelBase: m_sign_formatter,
  cisternaBordeLibre: m_formatter,
  cisternaAlturaTotal: m_formatter,
  cisternaDiametroRebose: (value) => value + '"',
  volDeTanque: m3_formatter,
  volTotalCalculadoReserva: m3_formatter,
  tanqueAlturaDeAguaMin: m_formatter,
  tanqueLargo: m_formatter,
  tanqueAncho: m_formatter,
  tanqueAlturaAgua: m_formatter,
  volumenTanque: m3_formatter,
  tanqueAlturaDeAgua: m_formatter,
  tanqueAlturaLibreInferior: m_sign_formatter,
  tanqueAlturaLibre: m_sign_formatter,
  tanqueAlturaLibreSuperior: m_sign_formatter,
  tanqueNivelHReboseInferior: m_sign_formatter,
  tanqueNivelHReboseSuperior: m_sign_formatter,
  tanqueNivelHIngreso: m_sign_formatter,
  tanqueHTecho: m_formatter,
  tanqueHIngreso: m_formatter,
  tanqueHRebose: m_formatter,
  tanqueNivelHTecho: m_sign_formatter,
  tanqueNivelDelTecho: m_sign_formatter,
  tanqueAlturaDelAgua: m_formatter,
  tanqueAlturaDeLimpieza: m_formatter,
  tanqueBordeLibre: m_formatter,
  tanqueAlturaTotal: m_formatter,
  tanqueDiametroRebose: (value) => value + '"',
  caudalDeEntradaVolumenDeLaCisterna: lt_formatter,
  caudalDeEntradaTiempoDeLlenado: h_formatter,
  caudalDeEntradaQLlenado: ls_formatter,
  cargaDisponibleNivelDelTerrenoCNX: m_sign_formatter,
  cargaDisponibleNivelDeLaTuberiaCNX: m_sign_formatter,
  cargaDisponibleNivelDeIngreso: m_sign_formatter,
  cargaDisponiblePresionPublica: m_sign_formatter,
  cargaDisponiblePresionSalidaIngreso: m_sign_formatter,
  alturaEstaticaTubRedPublicaCist: m_sign_formatter,
  cargaDisponibleHd1: m_formatter,
  perdidaCargaTableQ: m3_h_formatter,
  perdidaCargaHfMed: m_formatter,
  perdidaCargaCargaDisponible: m_sign_formatter,
  perdidaCargaCargaMedidor: m_sign_formatter,
  perdidaCargaHd1: m_formatter,
  perdidaCargaRedPublicaConexion: m_sign_formatter,
  perdidaCargaLongTub: m_formatter,
  cargaDisponibleHd2: (value) => value.toFixed(2),
  perdidaCargaCargaDisponibleHd2: m_sign_formatter,
  perdidaCargaMedidorCisterna: m_sign_formatter,
  cargaDisponibleHd3: (value) => value.toFixed(2),
  resultadosQllenado: ls_formatter,
  caudalDeImpulsionVolumenTanque: lt_formatter,
  caudalDeImpulsionTiempoLLenado: h_formatter,
  caudalDeImpulsionQLlenado: ls_formatter,
  caudalDeImpulsionQMDS: ls_formatter,
  caudalDeImpulsionQimpul: ls_formatter,
  alturaDinamicaNivelDeFondoDelTanque: m_sign_formatter,
  alturaDinamicaTotalPresionSalida: m_formatter,
  alturaDinamicaNivelDeAguaTAnque: m_sign_formatter,
  alturaDinamicaNivelFondoCisterna: m_sign_formatter,
  alturaDinamicaPerdidaCargaSuccion: m_formatter,
  alturaDinamicaPerdidaCargaImpulsion: m_formatter,
  alturaDinamicaHDT: (value) => value.toFixed(2),
  calculoDelSistemaCaudalImpulsion: ls_formatter,
  calculoDelSIstemaAlturaDinamica: m_formatter,
  calculoDelSistemaEficiencia: (value) => percent_formatter(value, 0),
  calculoDelSistemaPOT: (value) => value.toFixed(2),
  calculoDelSistemaPOTROUND: (value) => value.toFixed(2),
  calculoDelSistemaPOTHP: (value) => asNumber(value).toFixed(2),
  calculoDeLaMaximaDemandaQMDS: ls_formatter,
  calculoDeLaMaximaDemandaQMDSTotal: ls_formatter,
};

const pdfInputs = {
  proyecto:
    '<input type="text" class="form-control" id="proyecto" name="proyecto" placeholder="Ingrese el nombre del proyecto" value="“MEJORAMIENTO DE LOS SERVICIOS DE EDUCACION INICIAL DE LA I.E.I.P N°358 CIUDAD DE CONTAMANA DISTRITO DE CONTAMANA-PROVINCIA DE UCAYALI-DEPARTAMENTO DE LORETO CON CUI. Nº 2484411&quot;" required>',
  ue: '<input type="text" class="form-control" id="ue" name="ue" placeholder="Ingresar UE" value="Municipalidad Provincial de Ucayali" required>',
  fecha: '<input type="date" class="form-control" id="fecha" name="fecha" placeholder="Seleccionar fecha" value="2024-07-10" required>',
  cui: '<input type="text" class="form-control" id="cui" name="cui" placeholder="Ingresar CUI" value="2484411" required>',
  codModular: '<input type="text" class="form-control" id="CodigoModular" name="codModular" placeholder="Ingresar Codigo Modular" value="0651216" required>',
  CodigoLocal: '<input type="text" class="form-control" id="CodigoLocal" name="CodigoLocal" placeholder="Ingrese Codigo Local" value="390867" required>',
  ubicacion:
    '<input type="text" class="form-control" id="ubicacion" name="ubicacion" placeholder="Ingresar Ubicacion" value="Loc. Contamana-Contamana-Ucayali-Loreto" required>',
  pisosNum: '<input type="number" min="1" step="1" class="form-control" id="pisosNum" name="pisosNum" placeholder="Ingresar Nº Pisos" required>',
  cisternaLargo:
    '<input type="number" min="0" step="any" class="form-control" id="cisternaLargo" name="cisternaLargo" placeholder="Ingresar Dimension" value="1.85" required>',
  cisternaAncho:
    '<input type="number" min="0" step="any" class="form-control" id="cisternaAncho" name="cisternaAncho" placeholder="Ingresar Dimension" value="1.85" required>',
  cisternaAltura:
    '<input type="number" min="0" step="any" class="form-control" id="cisternaAltura" name="cisternaAltura" placeholder="Ingresar Dimension" value="1.5" required>',
  cisternaNivelDelTecho:
    '<input type="number" min="0" step="any" class="form-control" id="cisternaNivelDelTecho" name="cisternaNivelDelTecho" placeholder="Nivel del Techo" value="1.65" required>',
  cisternaNivelDeTerrenoNatural:
    '<input type="number" min="0" step="any" class="form-control" id="cisternaNivelDeTerrenoNatural" name="cisternaNivelDeTerrenoNatural" placeholder="Nivel de Terreno Natural" value="1.4" required>',
  cisternaHTecho:
    '<input type="number" min="0" step="any" class="form-control" id="cisternaHTecho" name="cisternaHTecho" placeholder="Ingresar Techo" value="0.2" required>',
  cisternaHRebose:
    '<input type="number" min="0" step="any" class="form-control" id="cisternaHRebose" name="cisternaHRebose" placeholder="Ingresar Techo" value="0.15" required>',
  cisternaHIngreso:
    '<input type="number" min="0" step="any" class="form-control" id="cisternaHIngreso" name="cisternaHIngreso" placeholder="Ingresar Techo" value="0.15" required>',
  cisternaDiametroRebose:
    '<input type="number" min="1" step="1" class="form-control" id="cisternaDiametroRebose" name="cisternaDiametroRebose" placeholder="Ingresar Diametro Rebose" value="2" required>',
  tanqueLargo:
    '<input style="width: 60px" type="number" min="0" step="any" class="form-control" id="tanqueLargo" name="tanqueLargo" placeholder="Ingresar Dimension" value="1.5" required>',
  tanqueAncho:
    '<input style="width: 60px" type="number" min="0" step="any" class="form-control" id="tanqueAncho" name="tanqueAncho" placeholder="Ingresar Dimension" value="1.5" required>',
  tanqueAlturaAgua:
    '<input style="width: 60px" type="number" min="0" step="any" class="form-control" id="tanqueAlturaAgua" name="tanqueAlturaAgua" placeholder="Ingresar Dimension" value="1.25" required>',
  tanqueHTecho:
    '<input type="number" min="0" step="any" class="form-control" id="tanqueHTecho" name="tanqueHTecho" placeholder="Ingresar Techo" value="0.2" required>',
  tanqueHIngreso:
    '<input type="number" min="0" step="any" class="form-control" id="tanqueHIngreso" name="tanqueHIngreso" placeholder="Ingresar Ingreso" value="0.15" required>',
  tanqueHRebose:
    '<input type="number" min="0" step="any" class="form-control" id="tanqueHRebose" name="tanqueHRebose" placeholder="Ingresar Rebose" value="0.10" required>',
  tanqueAlturaLibre:
    '<input type="number" min="0" step="any" class="form-control" id="tanqueAlturaLibre" name="tanqueAlturaLibre" placeholder="Ingresar Rebose" value="0.05" required>',
  tanqueAlturaLibreInferior:
    '<input type="number" min="0" step="any" class="form-control" id="tanqueAlturaLibreInferior" name="tanqueAlturaLibreInferior" placeholder="Ingresar Rebose" value="10.65" required>',
  tanqueDiametroRebose:
    '<input type="number" min="1" step="1" class="form-control" id="tanqueDiametroRebose" name="tanqueDiametroRebose" placeholder="Ingresar Diametro Rebose" value="2" required>',
  caudalDeEntradaTiempoDeLlenado:
    '<input type="number" min="0" step="any" class="form-control" id="caudalDeEntradaTiempoDeLlenado" name="caudalDeEntradaTiempoDeLlenado" placeholder="Ingresar Tiempo" value="4" required>',
  cargaDisponibleNivelDelTerrenoCNX:
    '<input type="number" min="0" step="any" class="form-control" id="cargaDisponibleNivelDelTerrenoCNX" name="cargaDisponibleNivelDelTerrenoCNX" placeholder="Ingresar Nivel" value="0" required>',
  cargaDisponibleNivelDeLaTuberiaCNX:
    '<input type="number" step="any" class="form-control" id="cargaDisponibleNivelDeLaTuberiaCNX" name="cargaDisponibleNivelDeLaTuberiaCNX" placeholder="Ingresar Nivel" value="-0.7" required>',
  cargaDisponiblePresionPublica:
    '<input type="number" min="0" step="any" class="form-control" id="cargaDisponiblePresionPublica" name="cargaDisponiblePresionPublica" placeholder="Ingresar Presión" value="10" required>',
  cargaDisponiblePresionSalidaIngreso:
    '<input type="number" min="0" step="any" class="form-control" id="cargaDisponiblePresionSalidaIngreso" name="cargaDisponiblePresionSalidaIngreso" placeholder="Ingresar presión salida" value="2" required>',
  perdidaCargaDiametroConexion:
    '<select class="form-control diametroPulg" name="perdidaCargaDiametroConexion" id="perdidaCargaDiametroConexion" data-selected="1 pulg." value="1 pulg."><option value="1/2 pulg.">1/2 pulg.</option><option value="3/4 pulg.">3/4 pulg.</option><option value="1 pulg.">1 pulg.</option><option value="1 1/4 pulg.">1 1/4 pulg.</option><option value="1 1/2 pulg.">1 1/2 pulg.</option><option value="2 pulg.">2 pulg.</option><option value="2 1/2 pulg.">2 1/2 pulg.</option><option value="3 pulg.">3 pulg.</option><option value="4 pulg.">4 pulg.</option><option value="6 pulg.">6 pulg.</option><option value="8 pulg.">8 pulg.</option></select>',
  perdidaCargaMicromedicion:
    '<select class="form-control" id="perdidaCargaMicromedicion" name="perdidaCargaMicromedicion" placeholder="Ingresar Micromedicion" required><option value="SI">SI</option><option value="NO">NO</option></select>',
  perdidaCargaHfMed:
    '<input type="number" min="0" step="any" class="form-control" id="perdidaCargaHfMed" name="perdidaCargaHfMed" placeholder="Ingresar Hf med." value="0.39" required>',
  perdidaCargaLongTub:
    '<input type="number" min="0" step="any" class="form-control" id="perdidaCargaLongTub" name="perdidaCargaLongTub" placeholder="Ingresar Long. Tuberia" value="1.19" required>',
  perdidaCargaD1mm:
    '<input type="number" min="0" step="any" class="form-control" id="perdidaCargaD1mm" name="perdidaCargaD1mm" placeholder="D1 (mm)" value="19.05" required>',
  perdidaCargaD2mm:
    '<input type="number" min="0" step="any" class="form-control" id="perdidaCargaD2mm" name="perdidaCargaD2mm" placeholder="D2 (mm)" value="25.4" required>',
  perdidaCargaD3mm:
    '<input type="number" min="0" step="any" class="form-control" id="perdidaCargaD3mm" name="perdidaCargaD3mm" placeholder="D3 (mm)" value="31.8" required>',
  perdidaCargaLTuberia:
    '<input type="number" min="0" step="any" class="form-control" id="perdidaCargaLTuberia" name="perdidaCargaLTuberia" placeholder="D3 (mm)" value="18.69" required>',
  caudalDeImpulsionTiempoLLenado:
    '<input type="number" min="0" step="any" class="form-control" id="caudalDeImpulsionTiempoLLenado" name="caudalDeImpulsionTiempoLLenado" placeholder="Ingresar Tiempo" value="2" required>',
  succionDiametro:
    '<select type="number" min="0" step="any" class="form-control diametroPulg" id="succionDiametro" name="succionDiametro" placeholder="Ingresar Diametro" data-selected="2 pulg." value="2 pulg." required><option value="1/2 pulg.">1/2 pulg.</option><option value="3/4 pulg.">3/4 pulg.</option><option value="1 pulg.">1 pulg.</option><option value="1 1/4 pulg.">1 1/4 pulg.</option><option value="1 1/2 pulg.">1 1/2 pulg.</option><option value="2 pulg.">2 pulg.</option><option value="2 1/2 pulg.">2 1/2 pulg.</option><option value="3 pulg.">3 pulg.</option><option value="4 pulg.">4 pulg.</option><option value="6 pulg.">6 pulg.</option><option value="8 pulg.">8 pulg.</option></select>',
  succionLTuberia:
    '<input type="number" min="0" step="any" class="form-control" id="succionLTuberia" name="succionLTuberia" placeholder="L Tuberia" value="2.55" required>',
  impulsionDiametro:
    '<select type="number" min="0" step="any" class="form-control diametroPulg" id="impulsionDiametro" name="impulsionDiametro" placeholder="Ingresar Diametro" data-selected="1 1/2 pulg." value="1 1/2 pulg." required><option value="1/2 pulg.">1/2 pulg.</option><option value="3/4 pulg.">3/4 pulg.</option><option value="1 pulg.">1 pulg.</option><option value="1 1/4 pulg.">1 1/4 pulg.</option><option value="1 1/2 pulg.">1 1/2 pulg.</option><option value="2 pulg.">2 pulg.</option><option value="2 1/2 pulg.">2 1/2 pulg.</option><option value="3 pulg.">3 pulg.</option><option value="4 pulg.">4 pulg.</option><option value="6 pulg.">6 pulg.</option><option value="8 pulg.">8 pulg.</option></select>',
  impulsionLTuberia:
    '<input type="number" min="0" step="any" class="form-control" id="impulsionLTuberia" name="impulsionLTuberia" placeholder="L Tuberia" value="11.0" required>',
  alturaDinamicaNivelDeFondoDelTanque:
    '<input type="number" min="0" step="any" class="form-control" id="alturaDinamicaNivelDeFondoDelTanque" name="alturaDinamicaNivelDeFondoDelTanque" placeholder="Ingresar Presion de Salida" value="9" required>',
  alturaDinamicaTotalPresionSalida:
    '<input type="number" min="0" step="any" class="form-control" id="alturaDinamicaTotalPresionSalida" name="alturaDinamicaTotalPresionSalida" placeholder="Ingresar Presion de Salida" value="2" required>',
  calculoDelSistemaEficiencia:
    '<input type="number" class="form-control" id="calculoDelSistemaEficiencia" name="calculoDelSistemaEficiencia" placeholder="Ingresar Presion de Salida" value="0.6" required>',
  calculoDelSistemaPOTROUND:
    '<input style="width: 100%" type="number" min="0" step="any" class="form-control" id="calculoDelSistemaPOTROUND" name="calculoDelSistemaPOTROUND" placeholder="Ingresar Potencia" value="1" required>',
};

const parsers = {
  parseFloat: parseFloat,
};

function fillSelect(select, values) {
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = option.text = value;
    if (select.dataset?.selected === value) {
      option.selected = true;
    }
    select.add(option);
  });
}

function round(value, precission) {
  return Math.ceil(value * Math.pow(10, precission)) / Math.pow(10, precission);
}

function getInputValue(element) {
  let value = element.value;
  if (element.dataset.parser) {
    return parsers[element.dataset.parser](value);
  } else if (element.type === "number") {
    value = parseFloat(value);
    return isNaN(value) ? 0 : value;
  }
  return value;
}

function lAccesoriosData(qLlenado, diametro, lTuberia, accesorios) {
  const perdidaDeCargaLAccesorios = {
    qls: qLlenado,
    diametro: diametro,
    diametroDecimal: inch_decimal[diametro] ?? 0,
    lTuberia: lTuberia,
    accesorios: accesorios,
  };

  perdidaDeCargaLAccesorios.accesorios.forEach((accesorio) => {
    let accesorioName = accesorio.accesorio;
    if (accesorioName == "contraccion 2 (D a d)" || accesorioName == "Reduccion 2 (D a d)") {
      accesorioName = "Reduccion 1 (d a D) d/D=1/4";
    }
    if (accesorioName) {
      if (accesorioName !== "Canastilla") {
        accesorio.leq = longEquiv[accesorioName]?.[perdidaDeCargaLAccesorios.diametro] ?? 0;
      }
      accesorio.leqT = accesorio.leq * accesorio.cantidad;
    }
  });

  perdidaDeCargaLAccesorios.longitudTotalEq = perdidaDeCargaLAccesorios.accesorios.reduce((total, accesorio) => {
    return total + accesorio.leqT;
  }, 0);
  perdidaDeCargaLAccesorios.vms = round(
    perdidaDeCargaLAccesorios.qls / 1000 / ((Math.PI * Math.pow((perdidaDeCargaLAccesorios.diametroDecimal * 2.54) / 100, 2)) / 4),
    2
  );

  perdidaDeCargaLAccesorios.lTotal = perdidaDeCargaLAccesorios.lTuberia + perdidaDeCargaLAccesorios.longitudTotalEq;
  perdidaDeCargaLAccesorios.smm = Math.pow(
    perdidaDeCargaLAccesorios.qls / 1000 / 0.2785 / 140 / Math.pow((perdidaDeCargaLAccesorios.diametroDecimal * 2.54) / 100, 2.63),
    1.85
  );
  perdidaDeCargaLAccesorios.hfm = perdidaDeCargaLAccesorios.lTotal * perdidaDeCargaLAccesorios.smm;

  return perdidaDeCargaLAccesorios;
}

let alumnos_y_personal_administrativo;
let areas_verdes_y_depositos;
let perdida_de_carga_l_accesorios_medidor;
let perdida_de_carga_l_accesorios_cisterna;
let gastos_por_accesorios_niveles;
let areas_verdes_niveles;
let succion_l_accesorios;
let impulsion_l_accesorios;
let pdfDoc;

const pdfData = {};

const UHS = {};

let pisos = [];
let accesorioNiveles = {};

const areasVerdesYdepositos = [
  {
    id: 1,
    ambiente: "JARDINES",
    uso: "AREAS VERDES",
    cantidad: 0,
  },
  { id: 2, ambiente: "DEPOSITO SUM. / ALIM./ GENERAL. / RESIDUOS. / ALIMENTOS.", uso: "DEPOSITOS", cantidad: 0, volumenDemanda: 0 },
];

function calcs(pdfData) {
  pdfData.volumenDemanda = [...pisos, alumnos_y_personal_administrativo, areas_verdes_y_depositos].reduce((totalPiso, table) => {
    return (
      totalPiso +
      table.getData().reduce((total, row) => {
        return total + (isNaN(parseFloat(row.caudal)) ? 0 : row.caudal);
      }, 0)
    );
  }, 0);

  pdfData.volDeCisterna = ((3 / 4) * pdfData.volumenDemanda) / 1000;
  pdfData.volDeCisterna = round(pdfData.volDeCisterna, 1);
  pdfData.volTotalMinimo = pdfData.volDeCisterna;
  pdfData.alturaDeAguaMin = pdfData.volTotalMinimo / (pdfData.cisternaLargo * pdfData.cisternaAncho);

  pdfData.volumenCisterna = pdfData.cisternaAltura * pdfData.cisternaAncho * pdfData.cisternaLargo;


  // Capturamos el clic en el enlace
  // $('#obtenerEternit').click(function (e) {
  //   e.preventDefault(); // Evitamos que el enlace haga su acción predeterminada

  //   // Obtenemos el valor dinámico de pdfData.volumenCisterna y lo formateamos
  //   var valcisterna = parseFloat(pdfData.volumenCisterna).toFixed(2);
  //   // La URL con la ruta de Laravel
  //   const url = '/gestor-eternit/' + valcisterna;
  //   // Redirigimos a la URL generada
  //   window.location.href = url;
  // });
  $('#obtenerEternit').click(function (e) {
    e.preventDefault();

    // Validación de campos
    const requiredFields = [
      'volumenDemanda',
      'volumenCisterna',
      'volDeCisterna',
      'volTotalMinimo',
      'cisternaAltura',
      'cisternaAncho',
      'cisternaLargo',
      'alturaDeAguaMin'
    ];

    // Verificación de campos
    const missingFields = requiredFields.filter(field =>
      !pdfData[field] && pdfData[field] !== 0
    );

    if (missingFields.length > 0) {
      console.error("Error: Campos faltantes:", missingFields);
      alert("Por favor, complete todos los campos necesarios.");
      return;
    }

    // Preparar datos
    const datacisterna = {
      volumendemanda: pdfData.volumenDemanda,
      volumenCisterna: pdfData.volumenCisterna,
      volDeCisterna: pdfData.volDeCisterna,
      volTotalMinimo: pdfData.volTotalMinimo,

      cisternaAltura: pdfData.cisternaAltura,
      cisternaAncho: pdfData.cisternaAncho,
      cisternaLargo: pdfData.cisternaLargo,

      alturaDeAguaMin: pdfData.alturaDeAguaMin
    };

    // Deshabilitar botón
    const $button = $(this);
    $button.prop('disabled', true);

    // Mostrar indicador de carga
    const $loader = $('<div class="loader">Procesando...</div>');
    $button.after($loader);

    // Solicitud AJAX
    $.ajax({
      type: 'POST',
      url: '/eternitsistemcisterna',
      data: datacisterna,
      dataType: 'json',
      timeout: 30000, // Timeout de 30 segundos
      headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
      },
      success: function (response) {
        if (response.redirect) {
          // Redireccionamiento suave
          window.location.href = response.redirect;
        } else {
          alert('Error: No se proporcionó URL de redirección');
        }
      },
      error: function (xhr, status, error) {
        console.error('Error en la solicitud:', xhr.responseText, status, error);

        // Manejar diferentes tipos de errores
        let errorMessage = 'No se pudo procesar la solicitud';
        if (status === 'timeout') {
          errorMessage = 'La solicitud tardó demasiado. Por favor, intente nuevamente.';
        } else if (xhr.status === 500) {
          errorMessage = 'Error interno del servidor. Por favor, contacte soporte.';
        }

        alert(errorMessage);
      },
      complete: function () {
        // Rehabilitar botón y quitar loader
        $button.prop('disabled', false);
        $loader.remove();
      }
    });
  });

  /*   if (pdfData.volumenCisterna <= 12) {
    pdfData.cisternaHIngreso = 0.15;
  } else if (pdfData.volumenCisterna <= 30) {
    pdfData.cisternaHIngreso = 0.2;
  } else {
    pdfData.cisternaHIngreso = 0.3;
  }

  if (pdfData.volumenCisterna > 30) {
    pdfData.cisternaHRebose = 0.15;
  } else {
    pdfData.cisternaHRebose = 0.1;
  } */

  pdfData.cisternaNivelHTecho = pdfData.cisternaNivelDelTecho - 0.2;
  pdfData.cisternaNivelHIngreso = pdfData.cisternaNivelHTecho - pdfData.cisternaHTecho;
  pdfData.cisternaNivelHReboseSuperior = pdfData.cisternaNivelHIngreso - pdfData.cisternaHIngreso;
  pdfData.cisternaNivelHReboseInferior = pdfData.cisternaNivelHReboseSuperior - pdfData.cisternaHRebose;

  pdfData.cisternaAlturaDeAgua = pdfData.cisternaAltura;

  pdfData.cisternaNivelBase = pdfData.cisternaNivelHReboseInferior - pdfData.cisternaAlturaDeAgua;
  pdfData.cisternaAlturaDeAgua = pdfData.cisternaAlturaDeAgua;
  pdfData.cisternaBordeLibre = pdfData.cisternaHTecho + pdfData.cisternaHIngreso + pdfData.cisternaHRebose;
  pdfData.cisternaAlturaTotal = -pdfData.cisternaNivelBase + pdfData.cisternaNivelHTecho;

  /* if (pdfData.volumenDemanda > 10000) {
    pdfData.cisternaDiametroRebose = '4"';
  } else {
    pdfData.cisternaDiametroRebose = '2"';
  } */

  pdfData.volDeTanque = ((1 / 3) * pdfData.volumenDemanda) / 1000;
  pdfData.volDeTanque = round(pdfData.volDeTanque, 1);
  pdfData.volTotalCalculadoReserva = pdfData.volDeTanque * 1.25;
  pdfData.tanqueAlturaDeAguaMin = pdfData.volTotalCalculadoReserva / (pdfData.tanqueLargo * pdfData.tanqueAncho);
  pdfData.volumenTanque = pdfData.tanqueLargo * pdfData.tanqueAncho * pdfData.tanqueAlturaAgua;

  pdfData.tanqueAlturaDeAgua = pdfData.tanqueAlturaAgua;

  $('#obtenerEternittanque').click(function (e) {
    e.preventDefault();

    // Validación de campos
    const requiredFields = [
      'volumenDemanda',
      'volDeTanque',
      'volTotalCalculadoReserva',
      'tanqueAlturaDeAguaMin',
      'tanqueLargo',
      'tanqueAncho',
      'tanqueAlturaAgua',
      'volumenTanque'
    ];

    // Verificación de campos
    const missingFields = requiredFields.filter(field =>
      !pdfData[field] && pdfData[field] !== 0
    );

    if (missingFields.length > 0) {
      console.error("Error: Campos faltantes:", missingFields);
      alert("Por favor, complete todos los campos necesarios.");
      return;
    }

    // Preparar datos
    const datataque = {
      volumendemanda: pdfData.volumenDemanda,
      volDeTanque: pdfData.volDeTanque,
      volTotalCalculadoReserva: pdfData.volTotalCalculadoReserva,
      tanqueAlturaDeAguaMin: pdfData.tanqueAlturaDeAguaMin,

      tanqueLargo: pdfData.tanqueLargo,
      tanqueAncho: pdfData.tanqueAncho,
      tanqueAlturaAgua: pdfData.tanqueAlturaAgua,

      volumenTanque: pdfData.volumenTanque
    };

    // Deshabilitar botón
    const $button = $(this);
    $button.prop('disabled', true);

    // Mostrar indicador de carga
    const $loader = $('<div class="loader">Procesando...</div>');
    $button.after($loader);

    // Solicitud AJAX
    $.ajax({
      type: 'POST',
      url: '/eternitsistemtanque',
      data: datataque,
      dataType: 'json',
      timeout: 30000, // Timeout de 30 segundos
      headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
      },
      success: function (response) {
        if (response.redirect) {
          // Redireccionamiento suave
          window.location.href = response.redirect;
        } else {
          alert('Error: No se proporcionó URL de redirección');
        }
      },
      error: function (xhr, status, error) {
        console.error('Error en la solicitud:', xhr.responseText, status, error);

        // Manejar diferentes tipos de errores
        let errorMessage = 'No se pudo procesar la solicitud';
        if (status === 'timeout') {
          errorMessage = 'La solicitud tardó demasiado. Por favor, intente nuevamente.';
        } else if (xhr.status === 500) {
          errorMessage = 'Error interno del servidor. Por favor, contacte soporte.';
        }

        alert(errorMessage);
      },
      complete: function () {
        // Rehabilitar botón y quitar loader
        $button.prop('disabled', false);
        $loader.remove();
      }
    });
  });
  /* pdfData.tanqueAlturaLibreInferior = 15.0 + pdfData.cisternaNivelDelTecho; */
  /* if (pdfData.tanqueAlturaAgua > 30) {
    pdfData.tanqueAlturaLibre = 0.15;
  } else {
    pdfData.tanqueAlturaLibre = 0.05;
  } */

  pdfData.tanqueAlturaLibreSuperior = pdfData.tanqueAlturaLibre + pdfData.tanqueAlturaLibreInferior;
  pdfData.tanqueNivelHReboseInferior = pdfData.tanqueAlturaDeAgua + pdfData.tanqueAlturaLibreSuperior;
  pdfData.tanqueNivelHReboseSuperior = pdfData.tanqueHRebose + pdfData.tanqueNivelHReboseInferior;
  pdfData.tanqueNivelHIngreso = pdfData.tanqueHIngreso + pdfData.tanqueNivelHReboseSuperior;
  pdfData.tanqueNivelHTecho = pdfData.tanqueHTecho + pdfData.tanqueNivelHIngreso;

  pdfData.tanqueNivelDelTecho = pdfData.tanqueNivelHTecho + pdfData.tanqueHTecho;

  pdfData.tanqueAlturaDelAgua = pdfData.tanqueAlturaDeAgua;
  pdfData.tanqueAlturaDeLimpieza = pdfData.tanqueAlturaLibre;
  pdfData.tanqueBordeLibre = pdfData.tanqueHTecho + pdfData.tanqueHIngreso + pdfData.tanqueHRebose;
  pdfData.tanqueAlturaTotal = pdfData.tanqueHTecho + pdfData.tanqueHIngreso + pdfData.tanqueHRebose + pdfData.tanqueAlturaDelAgua + pdfData.tanqueAlturaLibre;

  /* if (pdfData.volumenDemanda > 10000) {
    pdfData.tanqueDiametroRebose = '4"';
  } else {
    pdfData.tanqueDiametroRebose = '2"';
  } */

  pdfData.caudalDeEntradaVolumenDeLaCisterna = pdfData.volumenCisterna * 1000;
  pdfData.caudalDeEntradaQLlenado = pdfData.caudalDeEntradaVolumenDeLaCisterna / (pdfData.caudalDeEntradaTiempoDeLlenado * 60 * 60);
  /* pdfData.cargaDisponibleNivelDeLaTuberiaCNX = pdfData.cargaDisponibleNivelDelTerrenoCNX - 0.7; */
  pdfData.cargaDisponibleNivelDeIngreso = pdfData.cisternaNivelHIngreso;
  pdfData.alturaEstaticaTubRedPublicaCist = pdfData.cargaDisponibleNivelDeIngreso - pdfData.cargaDisponibleNivelDeLaTuberiaCNX;
  pdfData.cargaDisponibleHd1 = pdfData.cargaDisponiblePresionPublica - pdfData.cargaDisponiblePresionSalidaIngreso - pdfData.alturaEstaticaTubRedPublicaCist;

  pdfData.perdidaCargaTableQ = (pdfData.caudalDeEntradaQLlenado / 1000) * 60 * 60;

  const perdidaCargaMedidorLAccesoriosData = lAccesoriosData(
    pdfData.caudalDeEntradaQLlenado,
    pdfData.perdidaCargaDiametroConexion,
    pdfData.perdidaCargaLongTub,
    perdida_de_carga_l_accesorios_medidor?.getJson() ?? []
  );

  pdfData.perdidaCargaCargaDisponible = pdfData.cargaDisponibleHd1;
  pdfData.perdidaCargaCargaMedidor = pdfData.perdidaCargaHfMed;
  pdfData.perdidaCargaRedPublicaConexion = perdidaCargaMedidorLAccesoriosData.hfm;

  pdfData.perdidaCargaHd1 = pdfData.cargaDisponibleHd1;
  pdfData.perdidaCargaDiametroTubAlim = perdidaCargaMedidorLAccesoriosData.diametro;
  pdfData.cargaDisponibleHd2 = pdfData.perdidaCargaCargaDisponible - pdfData.perdidaCargaCargaMedidor - pdfData.perdidaCargaRedPublicaConexion;

  const perdida_de_carga_l_accesorios_cisterna_data = lAccesoriosTableData(perdida_de_carga_l_accesorios_cisterna);
  const perdidaCargaCisternaLAccesoriosData = lAccesoriosData(
    pdfData.caudalDeEntradaQLlenado,
    perdida_de_carga_l_accesorios_cisterna_data[0].diametro,
    perdida_de_carga_l_accesorios_cisterna_data[0].lTuberia,
    perdida_de_carga_l_accesorios_cisterna_data
  );

  pdfData.perdidaCargaCargaDisponibleHd2 = pdfData.cargaDisponibleHd2;
  pdfData.perdidaCargaMedidorCisterna = perdidaCargaCisternaLAccesoriosData.hfm;
  pdfData.cargaDisponibleHd3 = pdfData.perdidaCargaCargaDisponibleHd2 - pdfData.perdidaCargaMedidorCisterna;

  pdfData.resultadosQllenado = pdfData.caudalDeEntradaQLlenado;
  pdfData.resultadosDiametroMedidor = perdidaCargaMedidorLAccesoriosData.diametro;
  pdfData.resultadosDiametroCisterna = perdidaCargaCisternaLAccesoriosData.diametro;

  const nivelesUHTotal = Object.entries(accesorioNiveles).reduce((totalTable, [_, table]) => {
    return (
      totalTable +
      table.getData().reduce((total, row) => {
        return total + asNumber(row.cantidadTotal);
      }, 0)
    );
  }, 0);
  const areasVerdesUHTotal =
    areas_verdes_niveles?.getData().reduce((total, row) => {
      return total + asNumber(row.uhTotal);
    }, 0) ?? 0;
  pdfData.calculoDeLaMaximaDemandaMaximaDemanda = nivelesUHTotal + areasVerdesUHTotal;

  pdfData.calculoDeLaMaximaDemandaQMDS = gasto[pdfData.calculoDeLaMaximaDemandaMaximaDemanda.toFixed(1)]?.[0] ?? 0;
  pdfData.calculoDeLaMaximaDemandaQMDSTotal = pdfData.calculoDeLaMaximaDemandaQMDS;

  pdfData.caudalDeImpulsionVolumenTanque = pdfData.volumenTanque * 1000;

  pdfData.caudalDeImpulsionQLlenado = pdfData.caudalDeImpulsionVolumenTanque / (pdfData.caudalDeImpulsionTiempoLLenado * 60 * 60);
  pdfData.caudalDeImpulsionQMDS = pdfData.calculoDeLaMaximaDemandaQMDS;
  pdfData.caudalDeImpulsionQimpul = pdfData.caudalDeImpulsionQMDS;

  pdfData.perdidaCargaDiametroSuccion = buscarGastoInch(pdfData.caudalDeImpulsionQimpul, gasto_acc);
  const succion_l_accesorios_data = lAccesoriosTableData(succion_l_accesorios);
  const laccesoriosSuccion = lAccesoriosData(
    pdfData.caudalDeImpulsionQimpul,
    succion_l_accesorios_data[0].diametro,
    succion_l_accesorios_data[0].lTuberia,
    succion_l_accesorios_data
  );

  pdfData.perdidaCargaDiametroImpulsion = buscarGastoInch(pdfData.caudalDeImpulsionQimpul, gasto_imp);
  const impulsion_l_accesorios_data = lAccesoriosTableData(impulsion_l_accesorios);
  const laccesoriosImpulsion = lAccesoriosData(
    pdfData.caudalDeImpulsionQimpul,
    impulsion_l_accesorios_data[0].diametro,
    impulsion_l_accesorios_data[0].lTuberia,
    impulsion_l_accesorios_data
  );

  /* pdfData.alturaDinamicaNivelDeFondoDelTanque = 15; */
  pdfData.alturaDinamicaNivelDeAguaTAnque = pdfData.tanqueNivelHReboseInferior;
  pdfData.alturaDinamicaNivelFondoCisterna = pdfData.cisternaNivelBase;
  pdfData.alturaDinamicaPerdidaCargaSuccion = laccesoriosSuccion.hfm;
  pdfData.alturaDinamicaPerdidaCargaImpulsion = laccesoriosImpulsion.hfm;

  pdfData.alturaDinamicaHDT =
    pdfData.alturaDinamicaNivelDeAguaTAnque +
    pdfData.alturaDinamicaTotalPresionSalida +
    pdfData.alturaDinamicaPerdidaCargaSuccion +
    pdfData.alturaDinamicaPerdidaCargaImpulsion +
    -pdfData.alturaDinamicaNivelFondoCisterna;

  pdfData.calculoDelSistemaCaudalImpulsion = pdfData.caudalDeImpulsionQimpul;
  pdfData.calculoDelSIstemaAlturaDinamica = pdfData.alturaDinamicaHDT;

  const format = (name) => pdfFormatters[name](pdfData[name]);

  pdfData.calculoDelSistemaPotenciaD = `${format("calculoDelSistemaCaudalImpulsion")} x ${format("calculoDelSIstemaAlturaDinamica")}`;
  pdfData.calculoDelSistemaPotenciad = `75 x ${pdfData.calculoDelSistemaEficiencia}`;
  pdfData.calculoDelSistemaPOT =
    (pdfData.calculoDelSistemaCaudalImpulsion * pdfData.calculoDelSIstemaAlturaDinamica) / (75 * pdfData.calculoDelSistemaEficiencia);

  /* pdfData.calculoDelSistemaPOTROUND = pdfData.calculoDelSistemaPOT; */
  pdfData.calculoDelSistemaPOTHP = pdfData.calculoDelSistemaPOTROUND;

  return {
    perdidaCargaMedidorLAccesoriosData: pdfData.perdidaCargaMedidorLAccesoriosData,
    perdidaCargaCisternaLAccesoriosData: perdidaCargaCisternaLAccesoriosData,
    laccesoriosSuccion: laccesoriosSuccion,
    laccesoriosImpulsion: laccesoriosImpulsion,
  };
}

function updateCalcs() {
  const perdidaCargaAnalisis = [];
  calcs(pdfData);
  pdfDoc.querySelectorAll(".cisterna_alm").forEach((element) => {
    element.innerHTML = cisternaComponent(pdfData);
  });
  pdfDoc.querySelectorAll(".tanque_alm").forEach((element) => {
    element.innerHTML = tanqueComponent(pdfData);
  });
  pdfDoc.querySelectorAll(".table_curva_de_presion").forEach((element) => {
    element.innerHTML = tableCurvaDePresionComponent(pdfData.perdidaCargaDiametroConexion);
  });
  pdfDoc.querySelectorAll(".perdida_de_carga_analisis_tuberia").forEach((element) => {
    element.innerHTML = analisisParaLaTuberiaComponent(pdfData.perdidaCargaDiametroConexion, pdfData.perdidaCargaLongTub, perdidaCargaAnalisis);
  });
  pdfDoc.querySelectorAll(".perdida_de_carga_total").forEach((element) => {
    element.innerHTML = perdidaDeCargaTotalComponent(
      pdfData.caudalDeEntradaQLlenado,
      pdfData.perdidaCargaD1mm,
      pdfData.perdidaCargaD2mm,
      pdfData.perdidaCargaD3mm,
      perdidaCargaAnalisis,
      pdfData.perdidaCargaHd1
    );
  });
  pdfDoc.querySelectorAll(".curvaDePresionAxes").forEach((element) => {
    element.outerHTML = curvaDePerdidaDePresionAxesComponent2(pdfData.perdidaCargaHfMed, pdfData.perdidaCargaTableQ);
  });
  document.querySelectorAll("#pdfDoc img:not([src^='data:image'])").forEach((img) => {
    // Obtén el src original de la imagen
    const currentSrc = img.src;

    // Asegúrate de que la ruta esté bien formada y quitar la parte incorrecta
    if (currentSrc.includes('gestor-intalacionsanitarias')) {
      // Reemplaza la parte del src que no es necesaria y usa la ruta relativa correcta
      img.src = currentSrc.replace('http://127.0.0.1:8000/gestor-intalacionsanitarias/', '../storage/construye/');
    }
  });

  Object.entries(pdfInputs).forEach(([className, component]) => {
    pdfDoc.querySelectorAll(`.${className}`).forEach((element) => {
      element.innerHTML = component;
      const formElement = element.querySelector(`#${className}`);
      formElement.style.textAlign = "center";
      if (pdfData[formElement.name]) {
        formElement.value = pdfData[formElement.name];
        formElement.dataset.value = formElement.value;
        if (pdfFormatters[formElement.name]) {
          formElement.type = "text";
          formElement.value = pdfFormatters[formElement.name](parseFloat(formElement.value));
        }
      } else {
        pdfData[formElement.name] = getInputValue(formElement);
      }
      formElement.addEventListener("focus", (event) => {
        var input = event.target;
        var value = input.dataset.value;
        input.value = value;
        input.type = "number";
      });
      formElement.addEventListener("blur", (event) => {
        var input = event.target;
        input.dataset.value = input.value;
        if (pdfFormatters[input.name]) {
          input.type = "text";
          input.value = pdfFormatters[input.name](parseFloat(input.value));
        }
      });
      formElement.addEventListener("change", () => {
        pdfData[formElement.name] = getInputValue(formElement);
        updateCalcs();
      });
    });
  });
  Object.entries(pdfData).forEach(([key, value]) => {
    if (key) {
      if (!Object.keys(pdfInputs).includes(key)) {
        pdfDoc.querySelectorAll(`.${key}`).forEach((element) => {
          if (pdfFormatters[key]) {
            element.textContent = pdfFormatters[key](value);
          } else {
            element.textContent = value;
          }
        });
      }
    }
  });
  pdfDoc.querySelectorAll(".caudalDeEntradaTiempoDeLlenado, .perdidaCargaDiametroConexion, .perdidaCargaLongTub").forEach((tramoRedPublicaMedidor) => {
    tramoRedPublicaMedidor.addEventListener("change", () => {
      updateTramoRedPublica(perdida_de_carga_l_accesorios_medidor);
    });
  });
  pdfDoc.querySelectorAll(".caudalDeImpulsionTiempoLLenado").forEach((qImpul) => {
    qImpul.addEventListener("change", () => {
      updateLaccesorios(succion_l_accesorios, () => pdfData.caudalDeImpulsionQimpul);
      updateLaccesorios(impulsion_l_accesorios, () => pdfData.caudalDeImpulsionQimpul);
    });
  });

  $(function () {
    $(".cisternaAltura").popover("dispose");
  });
  $(function () {
    $(".cisternaAlturaDeAgua").popover("dispose");
  });
  $(function () {
    $(".tanqueAlturaAgua").popover("dispose");
  });
  $(function () {
    $(".tanqueAlturaDeAgua").popover("dispose");
  });
  $(function () {
    $('[data-toggle="popover"]').popover({
      content: "Corregir.",
    });
  });
  if (pdfData.tanqueAlturaDeAguaMin >= pdfData.tanqueAlturaAgua) {
    $(function () {
      $(".tanqueAlturaAgua").popover("show");
    });
    $(function () {
      $(".tanqueAlturaDeAgua").popover("show");
    });
  } else {
    $(function () {
      $(".tanqueAlturaAgua").popover("dispose");
    });
    $(function () {
      $(".tanqueAlturaDeAgua").popover("dispose");
    });
  }
  if (pdfData.alturaDeAguaMin >= pdfData.cisternaAltura) {
    $(function () {
      $(".cisternaAltura").popover("show");
    });
    $(function () {
      $(".cisternaAlturaDeAgua").popover("show");
    });
  } else {
    $(function () {
      $(".cisternaAltura").popover("dispose");
    });
    $(function () {
      $(".cisternaAlturaDeAgua").popover("dispose");
    });
  }
}

function lAccesoriosTableData(table) {
  const tableData = (table?.getJson() ?? []).map((row) => {
    return {
      ...row,
      qls: asNumber(row.qls),
      vms: asNumber(row.vms),
      cantidad: asNumber(row.cantidad),
      leq: asNumber(row.leq),
      leqT: asNumber(row.leqT),
      lTuberia: asNumber(row.lTuberia),
      lTotal: asNumber(row.lTotal),
      smm: asNumber(row.smm),
      hfm: asNumber(row.hfm),
    };
  });

  return tableData;
}

function updateTramoRedPublica(table) {
  const tableData = lAccesoriosTableData(table);
  const perdidaCargaMedidorLAccesoriosData = lAccesoriosData(
    pdfData.caudalDeEntradaQLlenado,
    pdfData.perdidaCargaDiametroConexion,
    pdfData.perdidaCargaLongTub,
    tableData
  );
  table.updateCell(0, 0, perdidaCargaMedidorLAccesoriosData.qls, false);
  table.updateCell(1, 0, perdidaCargaMedidorLAccesoriosData.diametro, false);
  table.updateCell(2, 0, perdidaCargaMedidorLAccesoriosData.vms, false);
  const totalLeqT = perdidaCargaMedidorLAccesoriosData.accesorios.reduce((total, row, index) => {
    table.updateCell(5, index, row.leq, false);
    table.updateCell(6, index, row.leqT, false);
    return total + row.leqT;
  }, 0);
  table.updateCell(7, 0, perdidaCargaMedidorLAccesoriosData.lTuberia, false);
  table.updateCell(8, 0, perdidaCargaMedidorLAccesoriosData.lTotal, false);
  table.updateCell(9, 0, perdidaCargaMedidorLAccesoriosData.smm, false);
  table.updateCell(10, 0, perdidaCargaMedidorLAccesoriosData.hfm, false);
  table.setFooter([[, , , , , "LTEQ:", totalLeqT]]);
}

function updateLaccesorios(table, caudal) {
  const tableData = lAccesoriosTableData(table);
  const perdidaCargaCisternaLAccesoriosData = lAccesoriosData(caudal(), tableData[0].diametro, tableData[0].lTuberia, tableData);
  table.updateCell(0, 0, perdidaCargaCisternaLAccesoriosData.qls, false);
  /* table.updateCell(1, 0, perdidaCargaCisternaLAccesoriosData.diametro, false); */
  table.updateCell(2, 0, perdidaCargaCisternaLAccesoriosData.vms, false);
  const totalLeqT = perdidaCargaCisternaLAccesoriosData.accesorios.reduce((total, row, index) => {
    table.updateCell(5, index, row.leq, false);
    table.updateCell(6, index, row.leqT, false);
    return total + row.leqT;
  }, 0);
  /* table.updateCell(7, 0, perdidaCargaCisternaLAccesoriosData.lTuberia, false); */
  table.updateCell(8, 0, perdidaCargaCisternaLAccesoriosData.lTotal, false);
  table.updateCell(9, 0, perdidaCargaCisternaLAccesoriosData.smm, false);
  table.updateCell(10, 0, perdidaCargaCisternaLAccesoriosData.hfm, false);
  table.setFooter([[, , , , , "LTEQ:", totalLeqT]]);
}

function updateAlmacenDepositos() {
  areasVerdesYdepositos[1].cantidad = pisos.reduce((totalPiso, tablePiso) => {
    return (
      totalPiso +
      tablePiso
        .getData()
        .filter((row) => {
          return row.uso && (row.uso.toUpperCase() === "ALMACEN" || row.uso.toUpperCase() === "DEPOSITO");
        })
        .reduce((total, row) => {
          return total + row.cantidad;
        }, 0)
    );
  }, 0);
}

function updateVolumenDemanda() {
  areasVerdesYdepositos[1].volumenDemanda = [...pisos, alumnos_y_personal_administrativo, areas_verdes_y_depositos].reduce((totalPiso, table) => {
    return (
      totalPiso +
      table.getData().reduce((total, row) => {
        return total + (isNaN(parseFloat(row.caudal)) ? 0 : row.caudal);
      }, 0)
    );
  }, 0);
  areas_verdes_y_depositos.recalc();
  updateCalcs();
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".diametroPulg").forEach((select) => {
    fillSelect(select, Object.keys(inch_decimal));
  });
  fetch('/construye/sanitarias/controller', {
    method: "GET",
  })
    .then((response) => response.text())
    .then((pdfHtml) => {
      pdfDoc = document.getElementById("pdfDoc");
      pdfDoc.innerHTML = pdfHtml;
      Array.from(document.getElementById("instSanitariasPDF").elements).forEach((element) => {
        pdfData[element.name] = getInputValue(element);
        element.addEventListener("change", () => {
          pdfData[element.name] = getInputValue(element);
          updateCalcs();
        });
      });
      // document.querySelectorAll("#pdfDoc img:not([src^='data:image'])").forEach((img) => {
      //   img.src = "../storage/construye/" + img.src.substring(img.src.indexOf("img"));
      // });
      document.querySelectorAll("#pdfDoc img:not([src^='data:image'])").forEach((img) => {
        // Obtén el src original de la imagen
        const currentSrc = img.src;

        // Asegúrate de que la ruta esté bien formada y quitar la parte incorrecta
        if (currentSrc.includes('gestor-intalacionsanitarias')) {
          // Reemplaza la parte del src que no es necesaria y usa la ruta relativa correcta
          img.src = currentSrc.replace('http://127.0.0.1:8000/gestor-intalacionsanitarias/', '../storage/construye/');
        }
      });

      pdfDoc.querySelectorAll(".dot_tables").forEach((dot_table) => {
        dot_table.innerHTML = dotTablesComponent();
      });
      document.getElementById("generarPisos").addEventListener("click", () => {
        pisos = [];
        areasVerdesYdepositos[1].cantidad = 0;
        const pisosElement = document.getElementById("pisos");
        const pisosNum = parseFloat(document.getElementById("pisosNum").value);
        pisosElement.innerHTML = "";
        for (let index = 0; index < pisosNum; index++) {
          pisosElement.innerHTML += tabulatorPisoComponent(index);
        }
        for (let index = 0; index < pisosNum; index++) {
          pisos.push(createSpreeadSheetTable(tbl_pisos_model(`#piso${index}`, index, updateAlmacenDepositos, updateVolumenDemanda)));
        }
      });
      pdfDoc.querySelectorAll(".accesorios_niveles").forEach((dot_table) => {
        dot_table.innerHTML = gastoPorAccesoriosNivelesComponent();
      });
      document.getElementById("generarAccesoriosNiveles").addEventListener("click", () => {
        accesorioNiveles = {};
        const nivelesElement = document.getElementById("niveles");
        nivelesElement.innerHTML = "";
        gastos_por_accesorios_niveles.getData().forEach((_, index) => {
          nivelesElement.innerHTML += tabulatorAccesorioComponent(index);
        });
        nivelesElement.innerHTML += tabulatorAreasVerdesNivelesComponent();
        gastos_por_accesorios_niveles.getData().forEach((row, index) => {
          accesorioNiveles[row.nivel] = createSpreeadSheetTable(
            tbl_gastos_por_accesorios_model(
              `#accesorioNivel${index}`,
              index,
              row.nivel,
              () => {
                updateLaccesorios(succion_l_accesorios, () => pdfData.caudalDeImpulsionQimpul);
                updateLaccesorios(impulsion_l_accesorios, () => pdfData.caudalDeImpulsionQimpul);
                updateCalcs();
              },
              UHS
            )
          );
        });
        const tbl_areas_verdes_niveles = tbl_areas_verdes_niveles_model("#areasVerdesNiveles", () => {
          updateLaccesorios(succion_l_accesorios, () => pdfData.caudalDeImpulsionQimpul);
          updateLaccesorios(impulsion_l_accesorios, () => pdfData.caudalDeImpulsionQimpul);
          updateCalcs();
        });
        tbl_areas_verdes_niveles.config.data = gastos_por_accesorios_niveles.getData().map((row) => {
          return { exterior: `AREA VERDE - ${row.nivel.toUpperCase()}` };
        });
        areas_verdes_niveles = createSpreeadSheetTable(tbl_areas_verdes_niveles);
      });
      pdfDoc.querySelectorAll("table.normativas").forEach((normativas) => {
        const aparatos = Array.from(normativas.querySelectorAll("tbody > tr"));
        aparatos.forEach((row) => {
          if (row.classList.contains("highlight")) {
            UHS[row.cells[0].textContent] = parseFloat(row.cells[2].textContent);
          }
          row.addEventListener("click", () => {
            const aparato = row.cells[0].textContent;
            aparatos
              .filter((aparatoRow) => aparatoRow.cells[0].textContent === aparato)
              .forEach((aparatoRow) => {
                if (!row.classList.contains("highlight")) {
                  aparatoRow.classList.remove("highlight");
                }
              });
            row.classList.toggle("highlight");
            if (row.classList.contains("highlight")) {
              UHS[aparato] = parseFloat(row.cells[2].textContent);
            } else {
              delete UHS[aparato];
            }
          });
        });
      });
      alumnos_y_personal_administrativo = createSpreeadSheetTable(tbl_alumnos_y_personal_administrativo(updateVolumenDemanda));
      areas_verdes_y_depositos = createSpreeadSheetTable(tbl_areas_verdes_depositos(areasVerdesYdepositos, updateVolumenDemanda));
      perdida_de_carga_l_accesorios_medidor = createJSpreadSheet(
        tbl_l_accesorios_model("tramoRedPublicaMedidorLAccesorios", (table) => {
          updateTramoRedPublica(table);
          updateCalcs();
        })
      );
      perdida_de_carga_l_accesorios_cisterna = createJSpreadSheet(
        tbl_l_accesorios_model("perdida_de_carga_l_accesorios_cisterna", (table) => {
          updateLaccesorios(table, () => pdfData.caudalDeEntradaQLlenado);
          updateCalcs();
        })
      );
      gastos_por_accesorios_niveles = createSpreeadSheetTable(tbl_gastos_por_accesorios_niveles);
      succion_l_accesorios = createJSpreadSheet(
        tbl_l_accesorios_model("succion_l_accesorios", (table) => {
          updateLaccesorios(table, () => pdfData.caudalDeImpulsionQimpul);
          updateCalcs();
        })
      );
      impulsion_l_accesorios = createJSpreadSheet(
        tbl_l_accesorios_model("impulsion_l_accesorios", (table) => {
          updateLaccesorios(table, () => pdfData.caudalDeImpulsionQimpul);
          updateCalcs();
        })
      );
      setTimeout(() => {
        updateCalcs();
        updateTramoRedPublica(perdida_de_carga_l_accesorios_medidor);
        updateLaccesorios(perdida_de_carga_l_accesorios_cisterna, () => pdfData.caudalDeEntradaQLlenado);
        updateLaccesorios(succion_l_accesorios, () => pdfData.caudalDeImpulsionQimpul);
        updateLaccesorios(impulsion_l_accesorios, () => pdfData.caudalDeImpulsionQimpul);
      }, 2000);
    });
});

document.getElementById("instSanitariasPDF").addEventListener("submit", async (event) => {
  event.preventDefault();

  const { perdidaCargaMedidorLAccesoriosData, perdidaCargaCisternaLAccesoriosData, laccesoriosSuccion, laccesoriosImpulsion } = calcs(pdfData);
  const perdidaCargaAnalisis = [];

  const areasVerdes = areas_verdes_y_depositos.getData()[0];
  const depositos = areas_verdes_y_depositos.getData()[1];

  const dot_tables = `
  ${alumnosYPersonalAdministrativoComponent(alumnos_y_personal_administrativo.getData())}
  <br />
  ${(() => {
      return pisos.reduce((pisos, table, index) => {
        return (pisos += `${pisoComponent(table.getGroups(), index)}<br />`);
      }, "");
    })()}
  <br />
  ${areasVerdesYDepositosComponent(areasVerdes, depositos, pdfData.volumenDemanda)}
  `;

  const mds_tables =
    Object.entries(accesorioNiveles).reduce((niveles, [title, table], index) => {
      return niveles + accesoriosComponent(table.getGroups(), title, table.getCalcResults()) + "<br />";
    }, "") + nivelesExteriorAreasVerdesComponent(areas_verdes_niveles?.getData() ?? []);

  const postData = new FormData();

  // Aquí estás construyendo los datos de los cálculos, lo cual parece correcto
  Object.entries(pdfData).forEach(([name, value]) => {
    if (pdfFormatters[name]) {
      value = pdfFormatters[name](value);
    }
    postData.append(`data[calcs][${name}]`, value);
  });

  // Aquí estás añadiendo componentes al FormData
  postData.append("data[components][dot_tables]", dot_tables);
  postData.append("data[components][cisterna_alm]", cisternaComponent(pdfData));
  postData.append("data[components][tanque_alm]", tanqueComponent(pdfData));
  postData.append("data[components][table_curva_de_presion]", tableCurvaDePresionComponent(pdfData.perdidaCargaDiametroConexion));
  postData.append("data[components][curvaDePresionAxes]", curvaDePerdidaDePresionAxesComponent2(pdfData.perdidaCargaHfMed, pdfData.perdidaCargaTableQ));
  postData.append("data[components][perdida_de_carga_l_accesorios_cisterna]", lAccesoriosComponent(perdidaCargaCisternaLAccesoriosData));
  postData.append("data[components][perdida_de_carga_analisis_tuberia]", analisisParaLaTuberiaComponent(pdfData.perdidaCargaDiametroConexion, pdfData.perdidaCargaLongTub, perdidaCargaAnalisis));
  postData.append("data[components][perdida_de_carga_total]", perdidaDeCargaTotalComponent(
    pdfData.caudalDeEntradaQLlenado,
    pdfData.perdidaCargaD1mm,
    pdfData.perdidaCargaD2mm,
    pdfData.perdidaCargaD3mm,
    perdidaCargaAnalisis,
    pdfData.perdidaCargaHd1
  ));
  postData.append("data[components][normativas]", document.querySelector("table.normativas").outerHTML);
  postData.append("data[components][mds_tables]", mds_tables);
  postData.append("data[components][succion_l_accesorios]", lAccesoriosComponent(laccesoriosSuccion));
  postData.append("data[components][impulsion_l_accesorios]", lAccesoriosComponent(laccesoriosImpulsion));

  // Realizar la solicitud POST
  fetch('/construye/sanitarias/calcular', {
    method: "POST",
    headers: {
      'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
    },
    body: postData,
  })
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      window.open(url);
      // const iframe = document.getElementById("pdfFrame");
      // iframe.src = url;
      // iframe.style.display = "block";

      // Optionally, you can force download
      /* const a = document.createElement("a");
      a.href = url;
      a.download = "document.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a); */
    })
    .catch((error) => console.error("Error fetching the PDF:", error));

  return false;
});
