import { calcTitle, emptyValueAccessor, makeCreateDeleteColumn, makeEditableCells } from "./table.js";
import { make_round_formatter, make_lt_dia_formatter, make_lt_m2_dia_formatter_formatter, make_lt_per_dia_formatter } from "./formatters.js";

import { gasto, longEquiv } from "./isdata.js";

import { inch_decimal } from "./isdata.js";

function asNumber(value, data) {
  const valueParsed = parseFloat(value);
  return isNaN(valueParsed) ? undefined : valueParsed;
}

const calcCaudal = (updateVolumenDemanda) => {
  return {
    caudal: {
      deps: ["cantidad", "dotacion"],
      mutator: function (value, data) {
        setTimeout(() => {
          updateVolumenDemanda();
        }, 0);
        return data.cantidad * data.dotacion;
      },
    },
  };
};

const ambientes = [
  "ALMACEN GENERAL",
  "DEPOSITOS SUM.",
  "DEPOSITO DE MATERIALES DEPORT.",
  "COMEDOR",
  "BIBLIOTECA/AREA DE LIBROS",
  "DIRECCION",
  "SECRETARIA/ESTAR",
  "TOPICO",
  "MODULO DE CONECTIVIDAD",
  "DEPOSITO AIP",
  "TALLER CREATIVO",
  "DEPOSITO",
  "ARCHIVO",
  "SALA DE DOCENTES",
  "SALA DE REUNIONES",
  "SALA DE ESTAR/BIENESTAR",
];

const usos = ["DOCENTES", "DIRECTOR", "GUARDIAN", "PER: SERVICIO", "BIBLIOTECARIA", "SECRETARIA", "ALMACEN", "DEPOSITO", "COMEDOR", "OFICINA", "CONSULTORIO"];

const dotaciones = [50, 0.5, 40, 6, 500, 2];

const UHSanitarias = {
  Inodoro: [2.5, 5, 8, 4],
  Lavatorio: [2],
  Lavadero: [4, 3],
  Ducha: [4],
  Tina: [6],
  Urinario: [3, 5, 2.5, 3],
  Bebedero: [1],
};

const make_dynamic_select = (values, field) => {
  return {
    editor: "list",
    editorParams: {
      valuesLookup: function (cell, filterTerm) {
        const columnValues = cell
          .getColumn()
          .getCells()
          .map((cell) => cell.getValue());
        const unique = new Set([...columnValues, ...values]);
        return [...unique].filter((value) => value);
      },
      sort: "asc",
      valuesLookupField: field,
      autocomplete: true,
      listOnEmpty: true,
      freetext: true,
    },
  };
};

const make_select = (values) => {
  return {
    editor: "list",
    editorParams: {
      values: values,
      sort: "asc",
      autocomplete: true,
      listOnEmpty: true,
      freetext: true,
    },
  };
};

const tbl_alumnos_y_personal_administrativo_model = (id, updateVolumenDemanda) => {
  return {
    id: id,
    mutators: {
      ...calcCaudal(updateVolumenDemanda),
    },
    config: {
      editTriggerEvent: "focus",
      selectableRange: false,
      layout: "fitColumns",
      columnDefaults: {
        accessorData: emptyValueAccessor,
      },
      columns: [
        {
          title: "ALUMNOS Y PERSONAL ADMINISTRATIVO",
          columns: [
            makeCreateDeleteColumn(id),
            {
              title: "Ambiente",
              field: "ambiente",
              editor: "input",
            },
            {
              title: "Uso",
              field: "uso",
              ...make_dynamic_select(usos, "uso"),
            },
            {
              title: "Cantidad",
              field: "cantidad",
              editor: "number",
              formatter: make_round_formatter(2),
            },
            {
              title: "Dotacion",
              field: "dotacion",
              editor: "number",
              ...make_dynamic_select(dotaciones, "dotacion"),
              mutator: asNumber,
              formatter: make_lt_per_dia_formatter(),
            },
            {
              title: "Caudal",
              field: "caudal",
              formatter: make_lt_dia_formatter(),
            },
          ],
        },
      ],
    },
  };
};

export const tbl_pisos_model = (id, index, updateAlmacenDepositos, updateVolumenDemanda) => {
  let modulos = [[]];
  function recalcAlmacenYDeposito(value, data, type, params, component) {
    setTimeout(() => {
      updateAlmacenDepositos();
    }, 0);
    return value;
  }
  return {
    id: id,
    mutators: {
      ...calcCaudal(updateVolumenDemanda),
    },
    config: {
      editTriggerEvent: "focus",
      selectableRange: false,
      maxHeight: "480px",
      layout: "fitColumns",
      columnDefaults: {
        accessorData: emptyValueAccessor,
      },
      groupBy: "modulo",
      groupHeader: function (value, count, data, group) {
        //value - the value all members of this group share
        const fname = `addGroupModuloPisoRow${index}${value.replace(" ", "")}`;
        const deleteGroup = `deleteGroupModuloPisoRow${index}${value.replace(" ", "")}`;
        window[fname] = (event) => {
          event.preventDefault();
          group.getTable().addRow({ modulo: value });
        };
        window[deleteGroup] = (event) => {
          event.preventDefault();
          group.getRows().forEach((row) => {
            row.delete();
          });
          modulos[0] = modulos[0].filter((g) => value != g);
          group.getTable().setGroupValues(modulos);
        };
        return `<span>${value}&nbsp</span><button type="button" class="btn btn-success focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-1.5 py-1 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800" onclick=${fname}(event)>+</button><button type="button" class="btn btn-danger focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-1.5 py-1 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900" onclick=${deleteGroup}(event)>-</button>`;
      },
      columns: [
        {
          title: `PISO ${index + 1}`,
          columns: [
            {
              title: "(REALIZAR ESTO POR MODULOS PROYECTADOS EN ARQUITECTURA)",
              titleFormatter: function (cell, formatterParams, onRendered) {
                const fname = `addModuloPiso${index}`;
                window[fname] = (event) => {
                  event.preventDefault();
                  modulos[0].push(event.target.elements.modulo.value.toUpperCase());
                  modulos[0] = Array.from(new Set(modulos[0]));
                  cell.getTable().setGroupValues(modulos);
                };
                return `
                        <div class="container-fluid">
                          <form action="#" onsubmit="${fname}(event);return false;">
                            <div class="form-group row flex flex-col sm:flex-row items-center justify-center space-x-2">
                              <label for="modulo" class="col-sm-12 col-form-label">${cell.getValue()}</label>
                              <div class="col-sm-8">
                                <input type="text" class="form-control" id="modulo" name="modulo" placeholder="Modulo" required>
                              </div>
                              <div class="col-sm-auto">
                                <button type="submit" class="btn btn-success focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-1.5 py-1 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">+</button>
                              </div>
                            </div>
                          </form>
                        </div>`;
              },

              columns: [
                {
                  title: "Ambiente",
                  field: "ambiente",
                  ...make_dynamic_select(ambientes, "ambiente"),
                },
                {
                  title: "Uso",
                  field: "uso",
                  ...make_dynamic_select(usos, "uso"),
                  mutator: recalcAlmacenYDeposito,
                },
                {
                  title: "Cantidad",
                  field: "cantidad",
                  editor: "number",
                  formatter: make_round_formatter(2),
                  mutator: recalcAlmacenYDeposito,
                },
                {
                  title: "Dotacion",
                  field: "dotacion",
                  editor: "number",
                  ...make_dynamic_select(dotaciones, "dotacion"),
                  mutator: asNumber,
                  formatter: make_lt_m2_dia_formatter_formatter(),
                },
                {
                  title: "Caudal",
                  field: "caudal",
                  formatter: make_lt_dia_formatter(),
                },
              ],
            },
          ],
        },
      ],
    },
  };
};

export const tbl_areas_verdes_depositos_model = (id, data, updateVolumenDemanda) => {
  return {
    id: id,
    mutators: {
      ...calcCaudal(updateVolumenDemanda),
    },
    config: {
      editTriggerEvent: "focus",
      selectableRange: false,
      layout: "fitColumns",
      reactiveData: true,
      data: data,
      columnDefaults: {
        accessorData: emptyValueAccessor,
      },
      columns: [
        {
          title: "AREAS VERDES Y DEPOSITOS",
          columns: [
            {
              title: "(REALIZAR ESTO POR MODULOS PROYECTADOS EN ARQUITECTURA)",
              columns: [
                {
                  title: "Ambiente",
                  field: "ambiente",
                  formatter: "textarea",
                },
                {
                  title: "Uso",
                  field: "uso",
                  ...make_dynamic_select(usos, "uso"),
                },
                {
                  title: "Cantidad",
                  field: "cantidad",
                  editor: "number",
                  ...makeEditableCells(1),
                  formatter: make_round_formatter(2),
                },
                {
                  title: "Dotacion",
                  field: "dotacion",
                  editor: "number",
                  ...make_dynamic_select(dotaciones, "dotacion"),
                  mutator: asNumber,
                  formatter: make_lt_m2_dia_formatter_formatter(),
                  bottomCalc: calcTitle("VOLUMEN DE DEMANDA"),
                },
                {
                  title: "Caudal",
                  field: "caudal",
                  formatter: make_lt_dia_formatter(),
                  bottomCalc: function (values, data, calcParams) {
                    return data[1]?.volumenDemanda;
                  },
                  bottomCalcFormatter: make_lt_dia_formatter(),
                },
              ],
            },
          ],
        },
      ],
    },
  };
};

export const tbl_l_accesorios_model = (id, updateCalcs) => {
  function unmerge(instance) {
    instance.jspreadsheet.removeMerge("A1");
    instance.jspreadsheet.removeMerge("B1");
    instance.jspreadsheet.removeMerge("C1");
    instance.jspreadsheet.removeMerge("H1");
    instance.jspreadsheet.removeMerge("I1");
    instance.jspreadsheet.removeMerge("J1");
    instance.jspreadsheet.removeMerge("K1");
  }
  function rowSpan(instance) {
    if (instance.jspreadsheet.rows.length === 1) {
      return;
    }
    instance.jspreadsheet.setMerge("A1", 1, instance.jspreadsheet.rows.length);
    instance.jspreadsheet.setMerge("B1", 1, instance.jspreadsheet.rows.length);
    instance.jspreadsheet.setMerge("C1", 1, instance.jspreadsheet.rows.length);
    instance.jspreadsheet.setMerge("H1", 1, instance.jspreadsheet.rows.length);
    instance.jspreadsheet.setMerge("I1", 1, instance.jspreadsheet.rows.length);
    instance.jspreadsheet.setMerge("J1", 1, instance.jspreadsheet.rows.length);
    instance.jspreadsheet.setMerge("K1", 1, instance.jspreadsheet.rows.length);
  }
  return {
    id: id,
    config: {
      editTriggerEvent: "focus",
      selectableRange: false,
      data: [[]],
      footers: [[, , , , , "LTEQ:"]],
      columns: [
        {
          title: "Q (L/s)",
          name: "qls",
          type: "numeric",
          mask: "#.##,00 L/s",
          width: 60,
        },
        {
          title: "diametro",
          name: "diametro",
          type: "dropdown",
          source: Object.keys(inch_decimal),
          width: 60,
        },
        {
          title: "V (m/s)",
          name: "vms",
          type: "numeric",
          mask: "#.##,00 m/s",
          width: 60,
        },
        {
          title: "Accesorio",
          name: "accesorio",
          type: "dropdown",
          autocomplete: true,
          source: Array.from(
            new Set([...["Codo de 45°", "Codo 90°", "Tee", "Val. Compuerta", "Val. Check", "contraccion 2 (D a d)"], ...Object.keys(longEquiv)])
          ),
          width: 110,
        },
        {
          title: "#",
          name: "cantidad",
          type: "numeric",
          mask: "#.##,00",
          width: 60,
        },
        {
          title: "Leq.",
          name: "leq",
          type: "numeric",
          mask: "#.##0,000",
          width: 60,
        },
        {
          title: "Leq. T",
          name: "leqT",
          type: "numeric",
          mask: "#.##0.000 m",
          width: 60,
        },
        {
          title: "L tuberia",
          name: "lTuberia",
          type: "numeric",
          mask: "#.##0.00 m",
          width: 60,
        },
        {
          title: "L total",
          name: "lTotal",
          type: "numeric",
          mask: "#.##,00 m",
          width: 60,
        },
        {
          title: "S (m/m)",
          name: "smm",
          type: "numeric",
          mask: "#.##0,00000",
          width: 60,
        },
        {
          title: "hf (m)",
          name: "hfm",
          type: "numeric",
          mask: "#.##0,0000",
          width: 60,
        },
      ],
      toolbar: [
        {
          type: "i",
          content: "add_circle_outline",
          onclick: function (table) {
            table.jspreadsheet.insertRow();
          },
        },
        {
          type: "i",
          content: "remove_circle_outline",
          onclick: function (table) {
            table.jspreadsheet.deleteRow(table.jspreadsheet.rows.length - 1, 1);
          },
        },
      ],
      onbeforeinsertrow: function (table) {
        unmerge(table);
      },
      oninsertrow: function (table) {
        rowSpan(table);
      },
      onbeforedeleterow: function (table) {
        unmerge(table);
      },
      ondeleterow: function (table) {
        rowSpan(table);
        updateCalcs(table.jspreadsheet);
      },
      onafterchanges: function (table) {
        updateCalcs(table.jspreadsheet);
      },
      onchange: function (instance, cell, x, y, value) {
        if (value === "Canastilla" && x === "3" && y === "0") {
          instance.jspreadsheet.updateCell(5, 0, "", false);
        }
      },
      updateTable: function (el, cell, x, y, source, value, id) {
        /* if (x >= 8 || x == 5 || x == 6 || x == 2) {
          cell.classList.add("readonly");
        } */
      },
    },
  };
};

export const tbl_L_accesorios_model = (id) => {
  return {
    id: id,
    config: {
      editTriggerEvent: "focus",
      selectableRange: false,
      layout: "fitColumns",
      columnDefaults: {
        accessorData: emptyValueAccessor,
      },
      columns: [
        {
          title: "L accesorios",
          columns: [
            makeCreateDeleteColumn(id),
            {
              title: "Accesorio",
              field: "accesorio",
              editor: "list",
              editorParams: {
                values: ["Codo de 45°", "Codo 90°", "Tee", "Val. Compuerta", "Val. Check", "contraccion 2 (D a d)", "Reduccion 2 (D a d)"],
                autocomplete: true,
                listOnEmpty: true,
              },
            },
            {
              title: "#",
              field: "cantidad",
              editor: "number",
              formatter: make_round_formatter(2),
            },
          ],
        },
      ],
    },
  };
};

export const tbl_gastos_por_accesorios_niveles_model = (id) => {
  return {
    id: id,
    config: {
      editTriggerEvent: "focus",
      selectableRange: false,
      layout: "fitColumns",
      columnDefaults: {
        accessorData: emptyValueAccessor,
      },
      columns: [
        makeCreateDeleteColumn(id),
        {
          title: "Nivel",
          field: "nivel",
          editor: "input",
        },
      ],
    },
  };
};

const defaultValue = (value) => {
  return {
    mutator: function () {
      return value();
    },
  };
};

export const tbl_gastos_por_accesorios_model = (id, index, title, update, UHS) => {
  let modulos = [[]];
  const accesorioColumn = (title, value) => {
    let def = {};
    let edit = {};
    if (value()) {
      def = defaultValue(value);
    } else {
      edit = { editor: "number" };
    }
    return {
      title: title,
      columns: [
        {
          title: "#",
          field: `${title.toLowerCase()}Cantidad`,
          editor: "number",
          editorParams: {
            min: 0,
            step: 1,
          },
          bottomCalc: "sum",
        },
        {
          title: "UH",
          field: `${title.toLowerCase()}UH`,
          /* ...def, */
          ...make_select(UHSanitarias[title]),
        },
      ],
    };
  };
  return {
    id: id,
    mutators: {
      cantidadTotal: {
        deps: [
          "inodoroCantidad",
          "inodoroUH",
          "urinarioCantidad",
          "urinarioUH",
          "lavatorioCantidad",
          "lavatorioUH",
          "duchaCantidad",
          "duchaUH",
          "lavaderoCantidad",
          "lavaderoUH",
        ],
        mutator: function (value, data, type, params, component) {
          const products = [
            data.inodoroCantidad * data.inodoroUH,
            data.urinarioCantidad * data.urinarioUH,
            data.lavatorioCantidad * data.lavatorioUH,
            data.duchaCantidad * data.duchaUH,
            data.lavaderoCantidad * data.lavaderoUH,
          ];
          setTimeout(() => {
            update();
          }, 0);
          return products.reduce((total, value) => {
            return total + (isNaN(value) ? 0 : value);
          }, 0);
        },
      },
    },
    config: {
      editTriggerEvent: "focus",
      selectableRange: false,
      maxHeight: "720px",
      layout: "fitColumns",
      columnDefaults: {
        accessorData: emptyValueAccessor,
      },
      groupBy: "modulo",
      groupHeader: function (value, count, data, group) {
        //value - the value all members of this group share
        //count - the number of rows in this group
        //data - an array of all the row data objects in this group
        //group - the group component for the group
        const fname = `addGroupRow${index}${title.replace(" ", "")}${value.replace(" ", "")}`;
        const deleteGroup = `deleteGroupRow${index}${title.replace(" ", "")}${value.replace(" ", "")}`;
        window[fname] = (event) => {
          event.preventDefault();
          group.getTable().addRow({ modulo: value });
        };
        window[deleteGroup] = (event) => {
          event.preventDefault();
          group.getRows().forEach((row) => {
            row.delete();
          });
          modulos[0] = modulos[0].filter((g) => value != g);
          group.getTable().setGroupValues(modulos);
        };
        return `<span>${value}&nbsp</span><button type="button" class="btn btn-success focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800" onclick=${fname}(event)>+</button><button type="button" class="btn btn-danger" onclick=${deleteGroup}(event)>-</button>`;
      },
      columns: [
        {
          title: `SUMATORIA DE GASTOS POR ACCESORIOS - ${title}`,
          titleFormatter: function (cell, formatterParams, onRendered) {
            const fname = `addModuloAccesorio${index}`;
            window[fname] = (event) => {
              event.preventDefault();
              modulos[0].push(event.target.elements.modulo.value.toUpperCase());
              modulos[0] = Array.from(new Set(modulos[0]));
              cell.getTable().setGroupValues(modulos);
            };
            return `
                    <div class="container-fluid">
                      <form action="#" onsubmit="${fname}(event);return false;">
                        <div class="form-group row flex flex-col sm:flex-row items-center justify-center space-x-2">
                          <label for="modulo" class="col-sm-12 col-form-label">${cell.getValue()}</label>
                          <div class="col-sm-8">
                            <input type="text" class="form-control" id="modulo" name="modulo" placeholder="Modulo" required>
                          </div>
                          <div class="col-sm-auto">
                            <button type="submit" class="btn btn-success focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">+</button>
                          </div>
                        </div>
                      </form>
                    </div>`;
          },
          columns: [
            {
              title: "DESCRIPCION",
              field: "descripcion",
              editor: "input",
              bottomCalc: calcTitle("TOTAL"),
              width: 360,
            },
            accesorioColumn("Inodoro", () => UHS["Inodoro"]),
            accesorioColumn("Urinario", () => UHS["Urinario"]),
            accesorioColumn("Lavatorio", () => UHS["Lavatorio"]),
            accesorioColumn("Ducha", () => UHS["Ducha"]),
            accesorioColumn("Lavadero", () => UHS["Lavadero"]),
            {
              title: "U.H",
              field: "cantidadTotal",
              bottomCalc: "sum",
            },
          ],
        },
      ],
    },
  };
};

export const tbl_areas_verdes_niveles_model = (id, update) => {
  return {
    id: id,
    mutators: {
      /* salidaDeRiego: {
        deps: ["areaDeRiego"],
        mutator: function (value, data) {
          return Math.ceil(data.areaDeRiego / 100);
        },
      }, */
      caudalPorPuntoDeSalida: {
        deps: ["uh"],
        mutator: function (value, data) {
          return gasto[data.uh?.toFixed(1)]?.[0] ?? "";
        },
      },
      uhTotal: {
        deps: ["uh", "salidaDeRiego"],
        mutator: function (value, data) {
          setTimeout(() => {
            update();
          }, 0);
          return data.uh * data.salidaDeRiego;
        },
      },
    },
    config: {
      editTriggerEvent: "focus",
      selectableRange: false,
      layout: "fitColumns",
      columnDefaults: {
        accessorData: emptyValueAccessor,
      },
      columns: [
        {
          title: "EXTERIOR",
          field: "exterior",
        },
        {
          title: "AREA DE RIEGO",
          field: "areaDeRiego",
          editor: "number",
        },
        {
          title: "SALIDAS DE RIEGO",
          field: "salidaDeRiego",
          editor: "number",
        },
        {
          title: "CAUDAL POR PUNTO DE SALIDA",
          field: "caudalPorPuntoDeSalida",
          formatter: make_round_formatter(2),
        },
        {
          title: "U.H.",
          field: "uh",
          editor: "number",
          formatter: make_round_formatter(2),
        },
        {
          title: "U.H. TOTAL",
          field: "uhTotal",
          formatter: make_round_formatter(2),
        },
      ],
    },
  };
};

export const tbl_alumnos_y_personal_administrativo = (updateVolumenDemanda) =>
  tbl_alumnos_y_personal_administrativo_model("#tbl_alumnos_y_personal_administrativo", updateVolumenDemanda);
export const tbl_areas_verdes_depositos = (data, updateVolumenDemanda) =>
  tbl_areas_verdes_depositos_model("#tbl_areas_verdes_y_depositos", data, updateVolumenDemanda);
export const tbl_gastos_por_accesorios_niveles = tbl_gastos_por_accesorios_niveles_model("#tbl_gastos_por_accesorios_niveles");

export function createJSpreadSheet(tableModel) {
  return jspreadsheet(document.getElementById(tableModel.id), tableModel.config);
}
