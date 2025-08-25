import { ls_formatter, lt_dia_formatter, lt_m2_dia_formatter, lt_per_dia_formatter, m_formatter, pulg_formatter } from "./formatters.js";

import { caudalCords, getPixelCoord, inch_decimal, longEquiv, perdidaDePresion } from "./isdata.js";

export const cisternaComponent = (pdfData) => {
  const graphicsHeight = 254;
  const minHeight = 21;
  const cisternaHeight = pdfData.cisternaHTecho + pdfData.cisternaHIngreso + pdfData.cisternaHRebose + pdfData.cisternaAlturaDeAgua;
  const widths = {
    cisternaHTecho: (pdfData.cisternaHTecho / cisternaHeight) * graphicsHeight,
    cisternaHIngreso: (pdfData.cisternaHIngreso / cisternaHeight) * graphicsHeight,
    cisternaHRebose: (pdfData.cisternaHRebose / cisternaHeight) * graphicsHeight,
    cisternaAlturaDeAgua: (pdfData.cisternaAlturaDeAgua / cisternaHeight) * graphicsHeight,
  };
  let remaining_width = graphicsHeight;
  let remaining_sum = cisternaHeight;
  const adjustedWidth = {};
  Object.entries(widths).forEach(([widthName, width]) => {
    if (width < minHeight) {
      adjustedWidth[widthName] = minHeight;
      remaining_width -= minHeight;
      remaining_sum -= pdfData[widthName];
    }
  });
  Object.entries(widths).forEach(([widthName, width]) => {
    adjustedWidth[widthName] ??= (pdfData[widthName] * remaining_width) / remaining_sum;
  });
  return `
<div class="cisterna_alm">
  <div style="display: flex; align-items: center; justify-content: start;">
    <div style="display: flex; align-items: center; justify-content: center; text-align: center; margin-right: 10px;" class="inline_block bold text-gray-950">
      <!-- Nivel -->
      <div class="inline_block bg_sky border_hard" style="padding: 0px 50px; display: flex; align-items: center;">
        Nivel =<span class="cisternaNivelDelTecho" style="margin-left: 5px;">-</span>
      </div>

      <!-- Imagen -->
      <img src="nivel.png" alt="Nivel Icon" style="vertical-align: middle; margin-left: 10px;" />

      <!-- NTN -->
      <div class="border_dotted inline_block" style="margin-left: 10px; padding-right: 20px; display: flex; align-items: center;">
        NTN =
        <span class="cisternaNivelDeTerrenoNatural" style="margin-left: 5px;">-</span>
      </div>
    </div>
  </div>

  <div>
    <div style="height: 300px" class="inline_block">
      <div style="position: relative; height: 294px; width: 294px; background-color: rgb(190, 187, 187); border: 3px solid black">
        <div style="position: absolute; top: 20px; left: 20px; background-color: white; width: 248px; height: 248px; border: 3px solid black">
          <div style="position: relative">
            <div style="width: 248px; height: ${adjustedWidth.cisternaHTecho - 1}px; border-bottom: 1px dashed black; position: relative">
              <div
                style="position: absolute; bottom: -1px; right: -50px; height: 15px; width: 60px; background-color: coral; border: 3px solid black"
              ></div>
            </div>
            <div style="width: 248px; height: ${adjustedWidth.cisternaHIngreso - 1}px; border-bottom: 1px dashed black; position: relative">
              <div
                style="position: absolute; bottom: -1px; right: -50px; height: 15px; width: 60px; background-color: lightgreen; border: 3px solid black"
              ></div>
            </div>
            <div style="width: 248px; height: ${adjustedWidth.cisternaHRebose - 1}px"></div>
            <div style="width: 248px; height: ${adjustedWidth.cisternaAlturaDeAgua - 8}px; border-top: 2px solid black; background-color: aliceblue"> </div>
            <div></div></div></div></div></div
    ><div style="height: 300px; width: calc(100% - 300px)" class="inline_block">
      <div style="position: relative; height: 25px; border-bottom: 0.5px dotted red"
        ><div style="position: absolute; top: 100%; right: 0%; transform: translate(0%, -100%)"
          ><img src="nivel.png" alt="" class="inline_block" /><div
            style="padding-right: 20px; margin-left: 2px"
            class="border_dotted inline_block"
            >Nivel =<span class="cisternaNivelHTecho">-</span></div
          ></div
        ></div
      >
      <div style="position: relative; height: ${adjustedWidth.cisternaHTecho - 0.5}px; border-bottom: 0.5px dotted red">
        <div style="position: absolute; left: 10%; top: 50%; transform: translateY(-50%); width: 50%" class="inline_block text_right"
          >H. techo (Ht) =<span class="cisternaHTecho bold">-</span></div
        ><div style="position: absolute; top: 100%; right: 0%; transform: translate(0%, -100%)" class="inline_block"
          ><img src="nivel.png" alt="" class="inline_block" /><div
            style="padding-right: 20px; margin-left: 2px"
            class="border_dotted inline_block"
            >Nivel =<span class="cisternaNivelHIngreso">-</span></div
          ></div
        >
      </div>
      <div style="position: relative; height: ${adjustedWidth.cisternaHIngreso - 0.5}px; border-bottom: 0.5px dotted red">
        <div style="position: absolute; left: 10%; top: 50%; transform: translateY(-50%); width: 50%" class="inline_block text_right"
          >H. ingreso (Hi) =<span class="cisternaHIngreso bold">-</span></div
        ><div style="position: absolute; top: 100%; right: 0%; transform: translate(0%, -100%)" class="inline_block"
          ><img src="nivel.png" alt="" class="inline_block" /><div
            style="padding-right: 20px; margin-left: 2px"
            class="border_dotted inline_block"
            >Nivel =<span class="cisternaNivelHReboseSuperior">-</span></div
          ></div
        >
      </div>
      <div style="position: relative; height: ${adjustedWidth.cisternaHRebose - 0.5}px; border-bottom: 0.5px dotted red">
        <div style="position: absolute; left: 10%; top: 50%; transform: translateY(-50%); width: 50%" class="inline_block text_right">H. rebose (Hr) =<span class="cisternaHRebose bold">-</span></div><div style="position: absolute; top: 100%; right: 0%; transform: translate(0%, -100%)" class="inline_block text_right"
          ><img src="nivel.png" alt="" class="inline_block" /><div
            style="padding-right: 20px; margin-left: 2px"
            class="border_dotted inline_block"
            >Nivel =<span class="cisternaNivelHReboseInferior">-</span></div
          ></div
        >
      </div>
      <div style="position: relative; height: ${adjustedWidth.cisternaAlturaDeAgua - 6.5}px; border-bottom: 0.5px dotted red">
        <div style="position: absolute; left: 10%; top: 50%; transform: translateY(-50%); width: 50%" class="inline_block text_right"
          >Altura de agua (Ha) =<span class="cisternaAlturaDeAgua bold" data-toggle="popover">-</span></div
        ><div style="position: absolute; top: 100%; right: 0%; transform: translate(0%, -100%)" class="inline_block"
          ><img src="nivel.png" alt="" class="inline_block" /><div
            style="padding-right: 20px; margin-left: 2px"
            class="border_dotted inline_block"
            >Nivel =<span class="cisternaNivelBase">-</span></div
          ></div
        >
      </div>
      <div style="position: relative; height: 22px; border-bottom: 0.5px dotted red"></div>
    </div>
  </div>
</div>`;
};

export const tanqueComponent = (pdfData) => {
  const graphicsHeight = 254;
  const minHeight = 21;
  const cisternaHeight = pdfData.tanqueHTecho + pdfData.tanqueHIngreso + pdfData.tanqueHRebose + pdfData.tanqueAlturaDeAgua + pdfData.tanqueAlturaLibre;
  const widths = {
    tanqueHTecho: (pdfData.tanqueHTecho / cisternaHeight) * graphicsHeight,
    tanqueHIngreso: (pdfData.tanqueHIngreso / cisternaHeight) * graphicsHeight,
    tanqueHRebose: (pdfData.tanqueHRebose / cisternaHeight) * graphicsHeight,
    tanqueAlturaDeAgua: (pdfData.tanqueAlturaDeAgua / cisternaHeight) * graphicsHeight,
    tanqueAlturaLibre: (pdfData.tanqueAlturaLibre / cisternaHeight) * graphicsHeight,
  };
  let remaining_width = graphicsHeight;
  let remaining_sum = cisternaHeight;
  const adjustedWidth = {};
  Object.entries(widths).forEach(([widthName, width]) => {
    if (width < minHeight) {
      adjustedWidth[widthName] = minHeight;
      // discard fixed widths
      remaining_width -= minHeight;
      remaining_sum -= pdfData[widthName];
    }
  });
  // adjust only the non fixed
  Object.entries(widths).forEach(([widthName, width]) => {
    adjustedWidth[widthName] ??= (pdfData[widthName] * remaining_width) / remaining_sum;
  });
  return `
<div class="tanque_alm">
  <div>
    <div style="width: 300px; text-align: center" class="inline_block bold">
      <div style="padding: 0px 10px; border-bottom: none" class="inline_block bg_sky border_hard font-11"
        >Nivel =<span class="tanqueNivelDelTecho">-</span></div
      ></div
    >
  </div>
  <div>
    <div style="height: 300px" class="inline_block">
      <div style="position: relative; height: 294px; width: 294px; background-color: rgb(190, 187, 187); border: 3px solid black">
        <div style="position: absolute; top: 20px; left: 20px; background-color: white; width: 248px; height: 248px; border: 3px solid black">
          <div style="position: relative">
            <div style="width: 248px; height: ${adjustedWidth.tanqueHTecho - 1}px; border-bottom: 1px dashed black; position: relative">
              <div
                style="position: absolute; bottom: -1px; right: -50px; height: 15px; width: 60px; background-color: coral; border: 3px solid black"
              ></div>
            </div>
            <div style="width: 248px; height: ${adjustedWidth.tanqueHIngreso - 1}px; border-bottom: 1px dashed black; position: relative">
              <div
                style="position: absolute; bottom: -1px; right: -50px; height: 15px; width: 60px; background-color: lightgreen; border: 3px solid black"
              ></div>
            </div>
            <div style="width: 248px; height: ${adjustedWidth.tanqueHRebose}px"></div>
            <div style="width: 248px; height: ${
              adjustedWidth.tanqueAlturaDeAgua + adjustedWidth.tanqueAlturaLibre - 8
            }px; border-top: 2px solid black; background-color: aliceblue">
              <div style="margin-left: 10px; width: 238px; height: ${
                adjustedWidth.tanqueAlturaDeAgua - 1
              }px; border-bottom: 1px dashed black; position: relative">
                <div
                  style="position: absolute; bottom: -1px; right: -50px; height: 15px; width: 60px; background-color: lightblue; border: 3px solid black"
                ></div>
              </div>
            </div>
            <div></div></div></div></div></div
    ><div style="height: 300px; width: calc(100% - 306px)" class="inline_block">
      <div style="position: relative; height: 25px; border-bottom: 0.5px dotted red"
        ><div style="position: absolute; top: 100%; right: 0%; transform: translate(0%, -100%)"
          ><img src="nivel.png" alt="" class="inline_block" /><div
            style="padding-right: 20px; margin-left: 2px"
            class="border_dotted inline_block"
            >Nivel =<span class="tanqueNivelHTecho">-</span></div
          ></div
        ></div
      >
      <div style="position: relative; height: ${adjustedWidth.tanqueHTecho - 0.5}px; border-bottom: 0.5px dotted red">
        <div style="position: absolute; left: 10%; top: 50%; transform: translateY(-50%); width: 50%" class="inline_block text_right"
          >H. techo (Ht) =<span class="tanqueHTecho bold">-</span></div
        ><div style="position: absolute; top: 100%; right: 0%; transform: translate(0%, -100%)" class="inline_block"
          ><img src="nivel.png" alt="" class="inline_block" /><div
            style="padding-right: 20px; margin-left: 2px"
            class="border_dotted inline_block"
            >Nivel =<span class="tanqueNivelHIngreso">-</span></div
          ></div
        >
      </div>
      <div style="position: relative; height: ${adjustedWidth.tanqueHIngreso - 0.5}px; border-bottom: 0.5px dotted red">
        <div style="position: absolute; left: 10%; top: 50%; transform: translateY(-50%); width: 50%" class="inline_block text_right"
          >H. ingreso (Hi) =<span class="tanqueHIngreso bold">-</span></div
        ><div style="position: absolute; top: 100%; right: 0%; transform: translate(0%, -100%)" class="inline_block"
          ><img src="nivel.png" alt="" class="inline_block" /><div
            style="padding-right: 20px; margin-left: 2px"
            class="border_dotted inline_block"
            >Nivel =<span class="tanqueNivelHReboseSuperior">-</span></div
          ></div
        >
      </div>
      <div style="position: relative; height: ${adjustedWidth.tanqueHRebose - 0.5}px; border-bottom: 0.5px dotted red">
        <div style="position: absolute; left: 10%; top: 50%; transform: translateY(-50%); width: 50%" class="inline_block text_right"
          >H. rebose (Hr) =<span class="tanqueHRebose bold">-</span></div
        ><div style="position: absolute; top: 100%; right: 0%; transform: translate(0%, -100%)" class="inline_block text_right"
          ><img src="nivel.png" alt="" class="inline_block" /><div
            style="padding-right: 20px; margin-left: 2px"
            class="border_dotted inline_block"
            >Nivel =<span class="tanqueNivelHReboseInferior">-</span></div
          ></div
        >
      </div>
      <div style="position: relative; height: ${adjustedWidth.tanqueAlturaDeAgua - 0.5}px; border-bottom: 0.5px dotted red">
        <div style="position: absolute; left: 10%; top: 50%; transform: translateY(-50%); width: 50%" class="inline_block text_right"
          >Altura de agua (Ha) =<span class="tanqueAlturaDeAgua bold" data-toggle="popover">-</span></div
        ><div style="position: absolute; top: 100%; right: 0%; transform: translate(0%, -100%)" class="inline_block"
          ><img src="nivel.png" alt="" class="inline_block" /><div
            style="padding-right: 20px; margin-left: 2px"
            class="border_dotted inline_block"
            >Nivel =<span class="tanqueAlturaLibreSuperior">-</span></div
          ></div
        >
      </div>
      <div style="position: relative; height: ${adjustedWidth.tanqueAlturaLibre - 0.5}px; border-bottom: 0.5px dotted red">
        <div style="position: absolute; left: 10%; top: 50%; transform: translateY(-50%); width: 50%" class="inline_block text_right"
          >Altura Libre (HL) =<span class="tanqueAlturaLibre bold">-</span></div
        ><div style="position: absolute; top: 100%; right: 0%; transform: translate(0%, -100%)" class="inline_block"
          ><img src="nivel.png" alt="" class="inline_block" /><div
            style="padding-right: 20px; margin-left: 2px"
            class="border_dotted inline_block"
            >Nivel =<span class="tanqueAlturaLibreInferior">-</span></div
          ></div
        >
      </div>
    </div>
  </div>
</div>`;
};

export const tabulatorPisoComponent = (id) => {
  return `
<div class="col-12">
  <div id="piso${id}"></div>
</div>
<hr>`;
};

export const tabulatorAccesorioComponent = (id) => {
  return `
<div class="col-12 mb-3">
  <div id="accesorioNivel${id}"></div>
</div>
<hr>`;
};

export const tabulatorAreasVerdesNivelesComponent = () => {
  return `
<div class="col-12">
  <div id="areasVerdesNiveles"></div>
</div>
<hr>`;
};

export const dotTablesComponent = () => {
  return `
<div class="container-fluid mt-3 mb-3">
  <div class="row">

    <div class="col-6 mt-3 mb-3">
      <div class="form-group flex flex-col sm:flex-row items-center justify-start mt-4 space-x-2">
        <label for="pisosNum">PISOS:</label>
        <input type="number" min="1" step="1" class="form-control bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-34 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" id="pisosNum" name="pisosNum" placeholder="Ingresar Nº Pisos" required>
        <button id="generarPisos" class="inline-flex items-center px-5 py-2.5 text-sm font-medium text-center text-white bg-blue-700 rounded-lg focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 hover:bg-blue-800" type="button">GENERAR</button>
      </div>
    </div>

    <div class="col-12">
      <div id="tbl_alumnos_y_personal_administrativo"></div>
    </div>

    <hr>

    <div class="col-12">
      <div id="pisos" class="row"></div>
    </div>

    <hr>

    <div class="col-12">
      <div id="tbl_areas_verdes_y_depositos"></div>
    </div>
  </div>
</div>`;
};

export const gastoPorAccesoriosNivelesComponent = () => {
  return `
  <div class="container-fluid mt-3 mb-3">
    <div class="row">
      <div class="col-md-8">
        <div id="tbl_gastos_por_accesorios_niveles"></div>
      </div>

      <div class="col-sm-8 text-right">
        <button type="button" class="btn btn-primary" id="generarAccesoriosNiveles">GENERAR</button>
      </div>

      <br />

      <div class="col-12">
        <div id="niveles" class="row"></div>
      </div>
    </div>
  </div>`;
};

const tableRowComponent = (row) => {
  return `
<tr>
  <td style="width: 30%; word-wrap: break-word" class="text_left">${row.ambiente}</td>
  <td style="width: 20%; word-wrap: break-word" class="text_center">${row.uso}</td>
  <td style="width: 15%; word-wrap: break-word" class="text_center">${row.cantidad}</td>
  <td style="width: 20%; word-wrap: break-word" class="text_right">${row.dotacion}</td>
  <td style="width: 15%; word-wrap: break-word" class="text_right">${row.caudal}</td>
</tr>`;
};

function formatAlumnosYPersonalAdministrativo(row) {
  return {
    ambiente: row.ambiente,
    uso: row.uso,
    cantidad: row.cantidad.toFixed(2),
    dotacion: lt_per_dia_formatter(row.dotacion),
    caudal: lt_dia_formatter(row.caudal),
  };
}

function formatPiso(row) {
  return {
    ambiente: row.ambiente,
    uso: row.uso,
    cantidad: row.cantidad.toFixed(2),
    dotacion: lt_m2_dia_formatter(row.dotacion),
    caudal: lt_dia_formatter(row.caudal),
  };
}

function formatAreasVerdesYDepositos(row) {
  return {
    ambiente: row.ambiente,
    uso: row.uso,
    cantidad: row.cantidad.toFixed(2),
    dotacion: lt_m2_dia_formatter(row.dotacion),
    caudal: lt_dia_formatter(row.caudal),
  };
}

export const alumnosYPersonalAdministrativoComponent = (data) => {
  return `
<table style="width: 100%" class="text_center table_border">
  <thead>
    <tr>
      <th colspan="5" class="bg_yellow color_red" scope="col">ALUMNOS Y PERSONAL ADMINISTRATIVO</th>
    </tr>
  </thead>
  <tbody>
  ${data.reduce((body, row) => {
    return (body += tableRowComponent(formatAlumnosYPersonalAdministrativo(row)));
  }, "")}
  </tbody>
</table>`;
};

const pisoModuloComponent = (group) => {
  return `
<tr>
<th class="text_left color_red bg_beige" colspan="5" scope="col">${group.getKey()}</th>
</tr>
${(() => {
  return group.getRows().reduce((rows, row) => {
    return (rows += tableRowComponent(formatPiso(row.getData("data"))));
  }, "");
})()}`;
};

export const pisoComponent = (groups, index) => {
  return `
<table class="text_center table_border" style="width: 100%">
  <thead>
    <tr>
      <th class="text_left bg_green" colspan="5" scope="col">PISO ${index + 1}</th>
    </tr>
    <tr class="bg_yellow">
      <th style="width: 30%" scope="col">AMBIENTE</th>
      <th style="width: 20%" scope="col">USO</th>
      <th style="width: 15%" scope="col">CANTIDAD</th>
      <th style="width: 20%" scope="col">DOTACION</th>
      <th style="width: 15%" scope="col">CAUDAL</th>
    </tr>
    <tr>
      <th class="color_red bg_yellow" colspan="5" scope="col">(REALIZAR ESTO POR MODULOS PROYECTADOS EN ARQUITECTURA)</th>
    </tr>
  </thead>
  <tbody>
  ${(() => {
    return groups.reduce((body, group) => {
      return (body += pisoModuloComponent(group));
    }, "");
  })()}
  </tbody>
</table>`;
};

export const areasVerdesYDepositosComponent = (areaVerde, almacen, total) => {
  return `
<table class="text_center table_border" style="width: 100%">
  <thead>
    <tr>
      <th class="color_red bg_yellow" colspan="5">(REALIZAR ESTO POR MODULOS PROYECTADOS EN ARQUITECTURA)</th>
    </tr>
  </thead>
  <tbody>
  ${tableRowComponent(formatAreasVerdesYDepositos(areaVerde))}
  ${tableRowComponent(formatAreasVerdesYDepositos(almacen))}
  </tbody>
  <tfoot>
    <tr class="bg_sky">
      <th colspan="4" class="text_right" scope="row">VOLUMEN DE DEMANDA</th>
      <th class="text_right">${lt_dia_formatter(total)}</th>
    </tr>
  </tfoot>
</table>`;
};

export const lAccesoriosComponent = (data) => {
  const rowCellsComponent = (row) => {
    let cantidad = row.cantidad === 0 ? "" : row.cantidad.toFixed(2);
    return `
<td>${row.accesorio}</td>
<td class="${cantidad ? "" : "bg_sky"}">${cantidad}</td>
<td>${row.leq?.toFixed(2) ?? 0}</td>
<td>${m_formatter(row.leqT)}</td>`;
  };

  const tableRowComponent = (row) => `<tr>${rowCellsComponent(row)}</tr>`;

  const tableRowSpanComponent = (row) => `
<tr>
  <td rowspan="${data.accesorios.length + 1}" class="text_center">${ls_formatter(data.qls)}</td>
  <td rowspan="${data.accesorios.length + 1}" class="text_center">${data.diametro}</td>
  <td rowspan="${data.accesorios.length + 1}" class="text_center">${data.vms.toFixed(2)}</td>
  ${rowCellsComponent(row)}
  <td rowspan="${data.accesorios.length + 1}" class="text_center">${m_formatter(data.lTuberia)}</td>
  <td rowspan="${data.accesorios.length + 1}" class="text_center">${m_formatter(data.lTotal)}</td>
  <td rowspan="${data.accesorios.length + 1}" class="text_center">${data.smm.toFixed(6)}</td>
  <td rowspan="${data.accesorios.length + 1}" class="text_center">${data.hfm.toFixed(2)}</td>
</tr>`;

  return `
<table style="width: 100%" class="table_border_dotted">
<thead>
  <tr class="bg_yellow">
    <th rowspan="2">Q (L/s)</th>
    <th rowspan="2">diametro</th>
    <th rowspan="2">V (m/s)</th>
    <th colspan="4">L accesorios</th>
    <th rowspan="2">L tuberia</th>
    <th rowspan="2">L total</th>
    <th rowspan="2">S (m/m)</th>
    <th rowspan="2">hf (m)</th>
  </tr>
  <tr class="bg_yellow">
    <th>accesorios</th>
    <th>#</th>
    <th>Leq.</th>
    <th>Leq. T</th>
  </tr>
</thead>
<tbody>
${data.accesorios.reduce((body, row, index) => {
  if (index === 0) {
    return body + tableRowSpanComponent(row);
  } else {
    return body + tableRowComponent(row);
  }
}, "")}
  <tr>
    <td colspan="3" class="bg_grey bold">LONGITUD TOTAL EQUIVALENTES</td>
    <td class="bold">${m_formatter(data.longitudTotalEq)}</td>
  </tr>
</tbody>
</table>`;
};

export const tableCurvaDePresionComponent = (diametro) => {
  const highlight_row = (value) => (value === diametro ? "table_curva_de_presion_highlight_row" : "");
  return `
<table style="width: 210px; border-collapse: collapse; position: absolute; top: 50%; transform: translateY(-50%)">
  <tr class="row_border_dotted ${highlight_row("1/2 pulg.")}"
    ><td width="60px" style="width: 60px" class="text_center">15</td><td width="150px" style="width: 150px" class="text_right">1/2 pulg.</td></tr
  >
  <tr class="row_border_dotted ${highlight_row("3/4 pulg.")}"><td class="text_center">20</td><td class="text_right">3/4 pulg.</td></tr>
  <tr class="row_border_dotted ${highlight_row("1 pulg.")}"
    ><td class="text_center">25</td><td class="text_right">1<span style="color: ${
      "1 pulg." === diametro ? "rgb(221, 235, 247)" : "white"
    }"> 7/7 </span>pulg.</td></tr
  >
  <tr class="row_border_dotted ${highlight_row("1 1/4 pulg.")}"><td class="text_center">32</td><td class="text_right">1 1/4 pulg.</td></tr>
  <tr class="row_border_dotted ${highlight_row("1 1/2 pulg.")}"><td class="text_center">40</td><td class="text_right">1 1/2 pulg.</td></tr>
  <tr class="row_border_dotted ${highlight_row("2 pulg.")}"
    ><td class="text_center">50</td><td class="text_right">2<span style="color: ${
      "2 pulg." === diametro ? "rgb(221, 235, 247)" : "white"
    }"> 7/7 </span>pulg.</td></tr
  >
  <tr class="row_border_dotted"><td style="border: none" class="text_center">&#160;</td><td style="border: none" class="text_right"></td></tr>
  <tr class="row_border_dotted bold"><td class="text_center">Q =</td><td class="text_center perdidaCargaTableQ">-</td></tr>
  <tr class="row_border_dotted"><td style="border: none" class="text_center">&#160;</td><td style="border: none" class="text_right"></td></tr>
  <tr class="row_border_dotted bold"><td class="text_center">Hf med. =</td><td class="text_left perdidaCargaHfMed">-</td></tr>
</table>`;
};

export function analisisParaLaTuberiaComponent(diametro, longTuberia, ltotals = []) {
  const inches = Object.keys(inch_decimal);
  const diametroIndex = inches.indexOf(diametro);
  return inches.slice(diametroIndex, diametroIndex + 3).reduce((analisis, inch, index) => {
    const inchName = inch.substring(0, inch.indexOf(" pulg."));
    const codo90 = longEquiv["Codo 90°"][inch];
    const codo45 = longEquiv["Codo de 45°"][inch];
    const valCompuerta = longEquiv["Val. Compuerta"][inch];
    const leq = codo90 + codo45 + valCompuerta;
    const lTotal = leq + longTuberia;
    ltotals.push(lTotal);
    return (
      analisis +
      `
      <br />
      <div style="width: 30%" class="bold">Análisis para la tubería de ${inchName}"Ø</div>
      <div style="width: 30%; border-bottom: 1px solid black" class="">Longitud equivalente p/tub. ${inchName}"Ø</div>
      <div><div style="width: 22%" class="inline_block">01 codos ${inchName}" x 90º</div><div style="width: 8%" class="inline_block text_right">${codo90}</div></div>
      <div><div style="width: 22%" class="inline_block">02 codos ${inchName}" x 45º</div><div style="width: 8%" class="inline_block text_right">${codo45}</div></div>
      <div>
        <div style="width: 22%" class="inline_block">2 válvula de compuerta ${inchName}"</div><div style="width: 8%" class="inline_block text_right">${valCompuerta}</div>
      </div>
      <div>
        <div style="width: 15%; margin-left: 7%; border-bottom: 1px solid black" class="inline_block">Leq (${inchName}"Ø)</div
        ><div style="width: 8%; border-bottom: 1px solid black" class="inline_block text_right">${leq.toFixed(3)}</div>
      </div>
      <div>
        <div style="width: 15%; margin-left: 7%" class="inline_block bold">Ltotal ${
          index + 1
        }</div><div style="width: 8%" class="inline_block text_right bold">${lTotal.toFixed(3)}</div>
      </div>`
    );
  }, "");
}

export function perdidaDeCargaTotalComponent(qLlenado, d1, d2, d3, analisis, hd1) {
  const d = [d1, d2, d3];
  const ids = ["perdidaCargaD1mm", "perdidaCargaD2mm", "perdidaCargaD3mm"];
  return `
<table class="text_center perdida_de_carga_total">
  <thead>
    <tr>
      <th scope="col">Caudal (lps)</th>
      <th scope="col">D (mm)</th>
      <th scope="col">V (m/s)</th>
      <th scope="col">Hf (m)</th>
      <th scope="col"></th>
    </tr>
  </thead>
  <tbody>
    ${analisis.reduce((body, lTotal, index) => {
      const vms = qLlenado / 1000 / ((Math.PI * Math.pow(d[index] / 1000, 2)) / 4);
      const hfm = 6.1 * 0.0001 * (Math.pow(qLlenado / 1000, 1.75) / Math.pow(d[index] / 1000, 4.75)) * lTotal;
      return (
        body +
        `
    <tr>
      <td>${qLlenado.toFixed(2)}</td>
      <td class="${ids[index]}">${d[index]?.toFixed(2) ?? 0}</td>
      <td>${vms.toFixed(2)}</td>
      <td>${hfm.toFixed(2)}</td>
      <td>${hd1 > hfm ? "SI" : "NO"}</td>
    </tr>`
      );
    }, "")}
  </tbody>
</table>`;
}

const accesoriosModuloComponent = (group) => {
  const rowComponent = (row) => {
    const td = (key) => {
      let value = row[key] === 0 ? "" : row[key];
      return `<td class="${value ? "" : "bg_sky"}">${value}</td>`;
    };
    return `
  <tr>
    <td class="text_left">${row.descripcion}</td>
    ${td("inodoroCantidad")}
    <td>${row.inodoroUH}</td>
    ${td("urinarioCantidad")}
    <td>${row.urinarioUH}</td>
    ${td("lavatorioCantidad")}
    <td>${row.lavatorioUH}</td>
    ${td("duchaCantidad")}
    <td>${row.duchaUH}</td>
    ${td("lavaderoCantidad")}
    <td>${row.lavaderoUH}</td>
    <td>${row.cantidadTotal}</td>
  </tr>`;
  };

  return `
<tr>
  <th class="text_left color_red bg_yellow" colspan="12" scope="col">${group.getKey()}</th>
</tr>
${(() => {
  return group.getRows().reduce((rows, row) => {
    return rows + rowComponent(row.getData("data"));
  }, "");
})()}`;
};

export const accesoriosComponent = (groups, title, calcs) => {
  const totals = {
    inodoroCantidad: 0,
    urinarioCantidad: 0,
    lavatorioCantidad: 0,
    duchaCantidad: 0,
    lavaderoCantidad: 0,
    cantidadTotal: 0,
  };
  groups.forEach((group) => {
    totals.inodoroCantidad += calcs[group.getKey()].bottom?.inodoroCantidad ?? 0;
    totals.urinarioCantidad += calcs[group.getKey()].bottom?.urinarioCantidad ?? 0;
    totals.lavatorioCantidad += calcs[group.getKey()].bottom?.lavatorioCantidad ?? 0;
    totals.duchaCantidad += calcs[group.getKey()].bottom?.duchaCantidad ?? 0;
    totals.lavaderoCantidad += calcs[group.getKey()].bottom?.lavaderoCantidad ?? 0;
    totals.cantidadTotal += calcs[group.getKey()].bottom?.cantidadTotal ?? 0;
  });
  return `
<table style="width: 100%" class="table_border text_center">
  <thead class="bg_yellow">
    <tr>
      <th style="width: 25%;" rowspan="3">DESCRIPCION</th>
      <th colspan="10">SUMATORIA DE GASTOS POR ACCESORIOS - ${title}</th>
      <th rowspan="3">U.H</th>
    </tr>
    <tr>
      <th colspan="2">Inodoro</th>
      <th colspan="2">Urinario</th>
      <th colspan="2">Lavatorio</th>
      <th colspan="2">Ducha</th>
      <th colspan="2">Lavadero</th>
    </tr>
    <tr>
      <th>#</th>
      <th>UH</th>
      <th>#</th>
      <th>UH</th>
      <th>#</th>
      <th>UH</th>
      <th>#</th>
      <th>UH</th>
      <th>#</th>
      <th>UH</th>
    </tr>
  </thead>
  <tbody>
  ${(() => {
    return groups.reduce((body, group) => {
      return body + accesoriosModuloComponent(group);
    }, "");
  })()}
  </tbody>
  <tfoot>
    <tr class="bg_yellow text_center">
      <th scope="row">TOTAL</th>
      <td colspan="2">${totals.inodoroCantidad}</td>
      <td colspan="2">${totals.urinarioCantidad}</td>
      <td colspan="2">${totals.lavatorioCantidad}</td>
      <td colspan="2">${totals.duchaCantidad}</td>
      <td colspan="2">${totals.lavaderoCantidad}</td>
      <td>${totals.cantidadTotal}</td>
    </tr>
  </tfoot>
</table>`;
};

export const nivelesExteriorAreasVerdesComponent = (data) => {
  const rowComponent = (row) => `
<tr>
  <td class="text_left">${row.exterior}</td>
  <td>${row.areaDeRiego}</td>
  <td>${row.salidaDeRiego}</td>
  <td>${row.caudalPorPuntoDeSalida}</td>
  <td>${row.uh}</td>
  <td>${row.uhTotal}</td>
</tr>`;

  return `
<table style="width: 100%" class="table_border text_center">
  <thead class="bg_yellow">
    <tr>
      <th style="width: 25%;" class="color_red text_left">
        EXTERIOR
      </th>
      <th>AREA DE RIEGO</th>
      <th>SALIDAS DE RIEGO</th>
      <th>CAUDAL POR PUNTO DE SALIDA</th>
      <th>U.H.</th>
      <th>U.H. TOTAL</th>
    </tr>
  </thead>
  <tbody>
    ${(() => {
      return data.reduce((body, row) => {
        return body + rowComponent(row);
      }, "");
    })()}
  </tbody>
</table>`;
};

export const curvaDePerdidaDePresionAxesComponent2 = (hfMed, Q) => {
  const yRatio = 280 / 524;
  const newWidth = (280 * 429) / 524;
  const xRatio = newWidth / 429;
  const perdidaDePresionAxis = getPixelCoord(hfMed, perdidaDePresion) * yRatio;
  const caudalAxis = getPixelCoord(Q, caudalCords) * xRatio;
  const svgHTML = `
<div class='curvaDePresionAxes' style='position: absolute; width: 263px; height: 280px'>
  <div style="position: absolute; width: 263px; border-bottom: 1.5px solid #00B0F0; top: ${perdidaDePresionAxis}px;"></div>
  <div style="position: absolute; height: 280px; border-left: 1.5px solid #00B0F0; left: ${caudalAxis}px;"></div>
</div>`;

  return svgHTML;
};

export const curvaDePerdidaDePresionAxesComponent = (hfMed, Q) => {
  const yRatio = 280 / 524;
  const newWidth = (280 * 429) / 524;
  const xRatio = newWidth / 429;
  const perdidaDePresionAxis = getPixelCoord(hfMed, perdidaDePresion) * yRatio;
  const caudalAxis = getPixelCoord(Q, caudalCords) * xRatio;
  const svgHTML = `
<svg class='curvaDePresionAxes' xmlns='http://www.w3.org/2000/svg' style='position: absolute; width: 263px; height: 280px'>
  <line x1='0' y1='${perdidaDePresionAxis}' x2='100%' y2='${perdidaDePresionAxis}' stroke='#00B0F0' stroke-width='2' />
  <line x1='${caudalAxis}' y1='0' x2='${caudalAxis}' y2='100%' stroke='#00B0F0' stroke-width='2' />
</svg>`;

  return svgHTML;
};

export const curvaDePerdidaDePresionAxesComponentAsImg = async (hfMed, Q) => {
  const tmpDiv = document.createElement("div");
  tmpDiv.appendChild(document.createElement("svg"));
  tmpDiv.querySelector("svg").outerHTML = curvaDePerdidaDePresionAxesComponent(hfMed, Q);
  const axesSvg = tmpDiv.querySelector("svg");
  const svgString = new XMLSerializer().serializeToString(axesSvg);
  const svgBlob = new Blob([svgString], {
    type: "image/svg+xml;charset=utf-8",
  });

  const DOOMURL = window.URL;
  const url = DOOMURL.createObjectURL(svgBlob);

  const image = new Image();
  image.width = parseFloat(axesSvg.style.width);
  image.height = parseFloat(axesSvg.style.height);
  image.src = url;

  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0);
  DOOMURL.revokeObjectURL(url);

  const imgURI = canvas.toDataURL("image/png").replace("image/png", "image/octect-stream");

  return `<img src="${imgURI}" style="position: absolute; width: 263px; height: 280px"/>`;
};
