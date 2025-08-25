var pen_formatter = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

var sun_currency_formatter = {
  formatter: "money",
  formatterParams: {
    decimal: ".",
    thousand: ",",
    symbol: "S/ ",
    negativeSign: true,
  },
};

const percent_formatter = (value, precision) =>
  (value * 100).toFixed(precision) + "%";

var make_percent_formatter = function (precision) {
  return function (cell, formatterParams, onRendered) {
    //cell - the cell component
    //formatterParams - parameters set for the column
    //onRendered - function to call when the formatter has been rendered
    const value = parseFloat(cell.getValue());
    return isNaN(value) ? cell.getValue() : percent_formatter(value, precision); //return the contents of the cell;
  };
};

var tree_currency_formater = {
  formatter: function (cell, formatterParams, onRendered) {
    //cell - the cell component
    //formatterParams - parameters set for the column
    //onRendered - function to call when the formatter has been rendered
    let isParent = false;
    if (cell.getRow()._row.type !== "calc") {
      isParent = cell.getRow().getData().type?.startsWith("parent");
    }
    const value = cell.getValue();
    if (isParent) {
      return pen_formatter.format(isNaN(value) ? 0 : value); //return the contents of the cell;
    } else {
      return cell.getValue();
    }
  },
};

function* recursiveColumnLeafIterator(colDef) {
  if (!colDef.columns) {
    yield colDef;
  } else {
    for (let item of colDef.columns) {
      yield* recursiveColumnLeafIterator(item);
    }
  }
}

function* recursiveColumnIterator(colDef) {
  if (colDef.columns) {
    yield colDef;
    for (const column of colDef.columns) {
      yield* recursiveColumnIterator(column);
    }
  }
}

function linkMutators(tblModel) {
  for (const column of recursiveColumnLeafIterator(tblModel.config)) {
    Object.entries(tblModel.mutators ?? {}).forEach(
      ([mutator, { deps, mutator: mutate }]) => {
        if (column.field === mutator) {
          column.mutator = (value, data, type, params, component) => {
            const result = mutate(value, data, type, params, component);
            return Number.isNaN(result) ? undefined : result;
          };
        }
        if (deps?.includes(column.field)) {
          column.mutateLink ??= [];
          if (!column.mutateLink.includes(mutator)) {
            column.mutateLink.push(mutator);
          }
        }
      }
    );
  }
}

function insertColumns(
  tblModel,
  insertColumn,
  columnModel,
  start,
  end,
  maxColumns
) {
  const columnIterator = recursiveColumnIterator(tblModel.config);
  let columnDefinition;
  for (
    columnDefinition = columnIterator.next();
    !columnDefinition.done;
    columnDefinition = columnIterator.next()
  ) {
    if (columnDefinition.value.columns === insertColumn) {
      break;
    }
  }

  const beginColumns = insertColumn.slice(0, start);
  const endColumns = insertColumn.slice(end);

  const newColumns = [];
  for (let index = 1; index <= maxColumns; index++) {
    let colModel = columnModel;
    if (typeof columnModel === "function") {
      colModel = columnModel(index);
    }
    newColumns.push(colModel.config);
    tblModel.mutators ??= {};
    Object.assign(tblModel.mutators, colModel.mutators ?? {});
  }

  columnDefinition.value.columns = [
    ...beginColumns,
    ...newColumns,
    ...endColumns,
  ];

  linkMutators(tblModel);
}

const total_column = {
  bottomCalc: "sum",
  bottomCalcFormatter: "money",
  bottomCalcFormatterParams: sun_currency_formatter.formatterParams,
};

const total_precent_column = {
  bottomCalc: "sum",
  bottomCalcFormatter: make_percent_formatter(2),
};

function treeSum(row, field) {
  const value = row[field];
  return (
    (isNaN(value) ? 0 : value) +
    (row._children?.reduce((acc, r) => {
      return acc + treeSum(r, field);
    }, 0) ?? 0)
  );
}

const total_tree_column = (field) => {
  return {
    ...total_column,
    bottomCalc: function (values, data, calcParams) {
      return treeSum({ _children: data }, field);
    },
  };
};

const total_field_column = (field) => {
  return {
    ...total_column,
    bottomCalc: function (values, data, calcParams) {
      return data.reduce((acc, row) => {
        return acc + (row[field] ?? 0);
      }, 0);
    },
  };
};

const calcTitle = (title) => {
  return (values, data, calcParams) => {
    return title;
  };
};

const VALMetradoField = (index) => `VAL${index}Metrado`;
const VALMetradoDiarioField = (index, day) => `VAL${index}Metrado${day}`;

const VALMetradoDiarioModel = (index) => {
  return {
    mutators: {
      [VALMetradoField(index)]: {
        mutator: function (value, data) {
          const days = ["L", "M", "X", "J", "V", "S", "D"];
          return days.reduce((acc, day) => {
            const value = parseFloat(data[VALMetradoDiarioField(index, day)]);
            return acc + (isNaN(value) ? 0 : value);
          }, 0);
        },
      },
    },
    config: {
      title: VALTitle(index),
      columns: [
        {
          title: "Metrado",
          columns: [
            {
              title: "L",
              editor: "number",
              field: VALMetradoDiarioField(index, "L"),
              mutateLink: [VALMetradoField(index)],
            },
            {
              title: "M",
              editor: "number",
              field: VALMetradoDiarioField(index, "M"),
              mutateLink: [VALMetradoField(index)],
            },
            {
              title: "X",
              editor: "number",
              field: VALMetradoDiarioField(index, "X"),
              mutateLink: [VALMetradoField(index)],
            },
            {
              title: "J",
              editor: "number",
              field: VALMetradoDiarioField(index, "J"),
              mutateLink: [VALMetradoField(index)],
            },
            {
              title: "V",
              editor: "number",
              field: VALMetradoDiarioField(index, "V"),
              mutateLink: [VALMetradoField(index)],
            },
            {
              title: "S",
              editor: "number",
              field: VALMetradoDiarioField(index, "S"),
              mutateLink: [VALMetradoField(index)],
            },
            {
              title: "D",
              editor: "number",
              field: VALMetradoDiarioField(index, "D"),
              mutateLink: [VALMetradoField(index)],
            },
            { title: "TOTAL", field: VALMetradoField(index) },
          ],
        },
      ],
    },
  };
};

const tbl_metrado_diario_model = (id_elem) => {
  return {
    id: id_elem,
    config: {
      dataTree: true,
      dataTreeStartExpanded: true,
      dataTreeElementColumn: "item",
      dataTreeFilter: false,
      dataTreeChildIndent: 15,
      dataTreeCollapseElement: "",
      dataTreeExpandElement: "",
      dataTreeChildColumnCalcs: true,
      selectableRangeClearCells: false,
      columns: [
        {
          titleFormatter: function (cell, formatterParams, onRendered) {
            window["addItem_tbl_metrados_diario"] = (event) => {
              this.item ??= 1;
              event.preventDefault();
              cell.getTable().addRow({ item: this.item++ });
            };
            return `
              <form action="#" onsubmit="return false;">
                <div style="display: flex; align-items: center;">
                  <b>${cell.getValue() ?? ""} </b>
                  <button class="btn btn-success" onclick=addItem_tbl_metrados_diario(event)>+</button>
                </div>
              </form>`;
          },
          formatter: function (cell, formatterParams, onRendered) {
            return '<button class="btn btn-success">+</button>';
          },
          cellClick: function (e, cell) {
            const parentRow = cell.getRow();
            const nestedID = parentRow.getTreeChildren().length + 1;
            const id = `${parentRow.getIndex()}.${nestedID}`;
            parentRow.addTreeChild({ id: id, item: id });
          },
          headerSort: false,
          frozen: true,
        },
        {
          title: "Item",
          hozAlign: "left",
          field: "item",
          frozen: true,
        },
        {
          title: "Descripcion de la Partida",
          editor: "input",
          hozAlign: "left",
          field: "descripcionDeLaPartida",
          frozen: true,
        },
        {
          title: "Unidad",
          editor: "input",
          field: "unidad",
          frozen: true,
        },
        {
          title: "Metrado",
          editor: "number",
          field: "metrado",
          frozen: true,
        },
      ],
    },
  };
};

const VALTitle = (index) => `VAL ${index}`;
const VALMontoField = (index) => `VAL${index}Monto`;

const VALMetradoModel = (index) => {
  return {
    config: {
      title: VALTitle(index),
      columns: [
        {
          title: "Metrado",
          mutateLink: [VALMontoField(index)],
          field: VALMetradoField(index),
          bottomCalc: calcTitle(VALTitle(index)),
        },
      ],
    },
  };
};

const makeVALMontoModel = (valNum) => {
  return (index) => {
    return {
      mutators: {
        [VALMontoField(index)]: {
          deps: [VALMetradoField(index), "pAver"],
          mutator: function (value, data) {
            return data[VALMetradoField(index)] * data.pAver;
          },
        },
      },
      config: {
        title: VALTitle(index),
        columns: [
          {
            title: "Monto",
            field: VALMontoField(index),
            ...total_tree_column(VALMontoField(index)),
            ...sun_currency_formatter,
          },
        ],
      },
    };
  };
};

const makeValorizacionAcumuladaModel = (valNum) => {
  const VALACumuladaMetradoDeps = [];
  for (let index = 1; index <= valNum; index++) {
    VALACumuladaMetradoDeps.push(VALMetradoField(index));
  }
  return {
    mutators: {
      VALACumuladaMetrado: {
        deps: VALACumuladaMetradoDeps,
        mutator: function (value, data) {
          return VALACumuladaMetradoDeps.reduce((acc, valMetrado) => {
            return acc + (data[valMetrado] ?? 0);
          }, 0);
        },
      },
      VALACumuladaParcial: {
        deps: ["VALACumuladaMetrado", "pAver"],
        mutator: function (value, data) {
          return data.VALACumuladaMetrado * data.pAver;
        },
      },
      VALAcumuladaAvance: {
        deps: ["VALACumuladaMetrado", "metrado"],
        mutator: function (value, data) {
          return data.VALACumuladaMetrado / data.metrado;
        },
      },
    },
    config: {
      title: "Valorización Acumulada",
      columns: [
        {
          title: "Metrado",
          field: "VALACumuladaMetrado",
        },
        {
          title: "Parcial",
          field: "VALACumuladaParcial",
          ...sun_currency_formatter,
          ...total_tree_column("VALACumuladaParcial"),
        },
        {
          title: "% Avance",
          field: "VALAcumuladaAvance",
          formatter: make_percent_formatter(2),
        },
      ],
    },
  };
};

const saldoXValorizarModel = {
  mutators: {
    saldoXValorizarMetrado: {
      deps: ["VALACumuladaMetrado", "metrado"],
      mutator: function (value, data) {
        return data.metrado - data.VALACumuladaMetrado;
      },
    },
    saldoXValorizarParcial: {
      deps: ["saldoXValorizarMetrado", "pAver"],
      mutator: function (value, data) {
        return data.saldoXValorizarMetrado * data.pAver;
      },
    },
  },
  config: {
    title: "Saldo x Valorizar",
    columns: [
      {
        title: "Metrado",
        field: "saldoXValorizarMetrado",
      },
      {
        title: "Parcial",
        field: "saldoXValorizarParcial",
        ...sun_currency_formatter,
        ...total_tree_column("saldoXValorizarParcial"),
      },
    ],
  },
};

const tbl_metrado_model = (id_elem) => {
  return (model, pParcialEmpresaTotalCalc, pParcialMaestroTotalCalc) => {
    return {
      id: id_elem,
      mutators: {
        pParcialEmpresa: {
          deps: ["metrado", "pEmpresa"],
          mutator: function (value, data) {
            return data.metrado * data.pEmpresa;
          },
        },
        pParcialMaestro: {
          deps: ["metrado", "pMaestro"],
          mutator: function (value, data) {
            return data.metrado * data.pMaestro;
          },
        },
        pAver: {
          deps: ["pEmpresa", "pMaestro"],
          mutator: function (value, data) {
            if (model.tipoContrato.value === "SUBCONTRATO") {
              return data.pMaestro;
            } else {
              return data.pEmpresa;
            }
          },
        },
      },
      config: {
        dataTree: true,
        dataTreeStartExpanded: true,
        dataTreeElementColumn: "item",
        dataTreeFilter: false,
        dataTreeChildIndent: 15,
        dataTreeCollapseElement: "",
        dataTreeExpandElement: "",
        dataTreeChildColumnCalcs: true,
        selectableRangeClearCells: false,
        columns: [
          {
            title: "Item",
            hozAlign: "left",
            field: "item",
            frozen: true,
          },
          {
            title: "Descripcion de la Partida",
            hozAlign: "left",
            field: "descripcionDeLaPartida",
            frozen: true,
          },
          {
            title: "Unidad",
            field: "unidad",
            frozen: true,
          },
          {
            title: "Metrado",
            field: "metrado",
            frozen: true,
          },
          {
            title: "Precio",
            columns: [
              {
                title: "Empresa",
                editor: "number",
                field: "pEmpresa",
                bottomCalc: calcTitle("COSTO DIRECTO:"),
                ...sun_currency_formatter,
              },
            ],
          },
          {
            title: "Precio Parcial",
            columns: [
              {
                title: "Empresa",
                field: "pParcialEmpresa",
                ...sun_currency_formatter,
                bottomCalc: pParcialEmpresaTotalCalc,
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams:
                  sun_currency_formatter.formatterParams,
              },
            ],
          },
          {
            title: "Precio",
            columns: [
              {
                title: "Maestro",
                editor: "number",
                field: "pMaestro",
                bottomCalc: calcTitle("COSTO DIRECTO:"),
                ...sun_currency_formatter,
              },
            ],
          },
          {
            title: "Precio Parcial",
            columns: [
              {
                title: "Maestro",
                field: "pParcialMaestro",
                ...sun_currency_formatter,
                bottomCalc: pParcialMaestroTotalCalc,
                bottomCalcFormatter: "money",
                bottomCalcFormatterParams:
                  sun_currency_formatter.formatterParams,
              },
            ],
          },
          {
            title: "Precio a ver",
            field: "pAver",
            ...sun_currency_formatter,
          },
        ],
      },
    };
  };
};

function editableItem(cell) {
  if (cell.getRow()._row.type !== "calc") {
    return cell.getRow().getData().type === "end";
  } else {
    return false;
  }
}

const compraCANTField = (index) => `compraCANT${index}`;
const compraPrecioField = (index) => `compraPrecio${index}`;

// TODO: add title formatter with a input date and when edited
//       use set the last date to the current input date value
const makeDesagregadoCompraModel = (date, index) => {
  return {
    config: {
      title: date,
      columns: [
        {
          title: `Compra ${index}`,
          columns: [
            {
              title: "CANT.",
              editor: "number",
              editable: editableItem,
              mutateLink: ["total"],
              field: compraCANTField(index),
            },
            {
              title: "Precio",
              editor: "number",
              editable: editableItem,
              mutateLink: ["total"],
              ...sun_currency_formatter,
              field: compraPrecioField(index),
            },
          ],
        },
      ],
    },
  };
};

const tbl_desagregado_model = (id_elem) => {
  return (model, pParcialEmpresaTotalCalc) => {
    return {
      id: id_elem,
      mutators: {
        pParcialEmpresa: {
          deps: ["metrado", "pEmpresa"],
          mutator: function (value, data) {
            return data.metrado * data.pEmpresa;
          },
        },
        total: {
          mutator: function (value, data, type, params, component) {
            const indexes = Array.from(Array(model.compras), (_, i) => i + 1);
            if (type === "edit") {
              const row = component.getRow();
              const parent = row.getTreeParent();
              // TODO: use setTimeout(() => { parent.update({ total: parent }); }, 0);
              // to use update the parent
              parent.update({ total: parent }).then(() => {
                parent.update({ total: parent });
              });
              return indexes.reduce((acc, index) => {
                return acc + (data[compraCANTField(index)] ?? 0);
              }, 0);
            } else {
              if (data.type === "parentEnd") {
                const parent = value?.getTreeParent();
                parent?.update?.({ total: parent }).then(() => {
                  parent?.update({ total: parent });
                });
                return (
                  value?.getTreeChildren?.()?.reduce?.((acc1, data) => {
                    return (
                      acc1 +
                      indexes.reduce((acc2, index) => {
                        return (
                          acc2 +
                          (data.getData()[compraCANTField(index)] ?? 0) *
                          (data.getData()[compraPrecioField(index)] ?? 0)
                        );
                      }, 0)
                    );
                  }, 0) ?? 0
                );
              } else if (data.type === "parent") {
                const parent = value?.getTreeParent();
                parent?.update?.({ total: parent }).then(() => {
                  parent?.update({ total: parent });
                });
                return (
                  value?.getTreeChildren?.()?.reduce?.((acc1, data) => {
                    return acc1 + (data.getData().total ?? 0);
                  }, 0) ?? 0
                );
              } else {
                return value;
              }
            }
          },
        },
        faltaOSobra: {
          deps: ["total", "metrado"],
          mutator: function (value, data, type, params, component) {
            return data.metrado - data.total;
          },
        },
      },
      config: {
        selectableRangeClearCells: false,
        dataTree: true,
        dataTreeStartExpanded: true,
        dataTreeElementColumn: "item",
        dataTreeFilter: false,
        dataTreeChildIndent: 15,
        dataTreeCollapseElement: "",
        dataTreeExpandElement: "",
        columns: [
          {
            title: "PROYECTO",
            frozen: true,
            columns: [
              {
                formatter: function (cell, formatterParams, onRendered) {
                  const parentRow = cell.getRow();
                  if (parentRow.getTreeChildren().length === 0) {
                    parentRow.getData().type ??= "parentEnd";
                  } else if (parentRow.getTreeChildren().length > 0) {
                    parentRow.getData().type ??= "parent";
                  }
                  return parentRow.getData().type === "parentEnd"
                    ? '<button class="btn btn-success">+</button>'
                    : "";
                },
                cellClick: function (e, cell) {
                  const parentRow = cell.getRow();
                  if (parentRow.getData().type === "end") {
                    return;
                  }
                  const nestedID = parentRow.getTreeChildren().length + 1;
                  const id = `${parentRow.getIndex()}.${nestedID}`;
                  parentRow.addTreeChild({ id: id, item: "", type: "end" });
                },
              },
              {
                title: "Item",
                hozAlign: "left",
                field: "item",
                frozen: true,
              },
              {
                title: "Descripcion de la Partida",
                hozAlign: "left",
                field: "descripcionDeLaPartida",
                editable: editableItem,
                editor: "input",
                frozen: true,
              },
              {
                title: "Unidad",
                editor: "input",
                editable: editableItem,
                field: "unidad",
                frozen: true,
              },
              {
                title: "Metrado",
                editor: "number",
                editable: editableItem,
                field: "metradoDesagregado",
                frozen: true,
              },
              {
                title: "Metrado",
                editor: "number",
                editable: editableItem,
                field: "metrado",
                frozen: true,
              },
              {
                title: "Precio",
                frozen: true,
                columns: [
                  {
                    title: "Empresa",
                    editor: "number",
                    editable: editableItem,
                    field: "pEmpresa",
                    frozen: true,
                    bottomCalc: calcTitle("COSTO DIRECTO:"),
                    ...sun_currency_formatter,
                  },
                ],
              },
              {
                title: "Precio Parcial",
                frozen: true,
                columns: [
                  {
                    title: "Empresa",
                    frozen: true,
                    field: "pParcialEmpresa",
                    ...sun_currency_formatter,
                    bottomCalc: pParcialEmpresaTotalCalc,
                    bottomCalcFormatter: "money",
                    bottomCalcFormatterParams:
                      sun_currency_formatter.formatterParams,
                  },
                ],
              },
            ],
          },
          {
            title: "Total",
            field: "total",
            ...tree_currency_formater,
            bottomCalc: calcTitle("TOTAL GASTO"),
          },
          {
            title: "Falta/Sobra",
            field: "faltaOSobra",
            ...total_field_column("total"),
          },
        ],
      },
    };
  };
};

const tbl_programacion_model = (id_elem) => {
  return {
    id: id_elem,
    mutators: {
      diferenciaAcumulado: {
        deps: ["avanceEjecutadoAcumulado", "avanceProgramadoAcumulado"],
        mutator: function (value, data) {
          return data.avanceEjecutadoAcumulado - data.avanceProgramadoAcumulado;
        },
      },
      montoDiferenciaAcumulado: {
        deps: [
          "montoAvanceProgramadoAcumulado",
          "montoAvanceEjecutadoAcumulado",
        ],
        mutator: function (value, data) {
          return (
            data.montoAvanceProgramadoAcumulado -
            data.montoAvanceEjecutadoAcumulado
          );
        },
      },
      condicionDeLaObra: {
        deps: ["diferenciaAcumulado"],
        mutator: function (value, data) {
          if (data.diferenciaAcumulado >= 0) {
            return "ADELANTADA";
          } else {
            return "ATRASADA";
          }
        },
      },
    },
    config: {
      columns: [
        {
          title: "VALORIZACIÓN",
          field: "valorizacion",
        },
        {
          title: "PROGRAMADO CONTRACTUAL INICIAL",
          columns: [
            {
              title: "% AVANCE PROGRAMADO SEMANAL",
              field: "avanceProgramadoSemanal",
              editor: "number",
              formatter: make_percent_formatter(2),
            },
            {
              title: "MONTO AVANCE PROGRAMADO SEMANAL",
              field: "montoAvanceProgramadoSemanal",
              editor: "number",
              ...sun_currency_formatter,
            },
            {
              title: "% AVANCE PROGRAMADO ACUMULADO",
              field: "avanceProgramadoAcumulado",
              editor: "number",
              formatter: make_percent_formatter(2),
            },
            {
              title: "MONTO AVANCE PROGRAMADO ACUMULADO",
              field: "montoAvanceProgramadoAcumulado",
              editor: "number",
              ...sun_currency_formatter,
              bottomCalc: calcTitle("PORCENTAJE DE AVANCE ACUMULADO"),
            },
          ],
        },
        {
          title: "EJECUTADO",
          columns: [
            {
              title: "% AVANCE EJECUTADO SEMANAL",
              field: "avanceEjecutadoSemanal",
              editor: "number",
              formatter: make_percent_formatter(2),
              ...total_precent_column,
            },
            {
              title: "MONTO AVANCE EJECUTADO SEMANAL",
              field: "montoAvanceEjecutadoSemanal",
              editor: "number",
              ...sun_currency_formatter,
            },
            {
              title: "% AVANCE EJECUTADO ACUMULADO",
              field: "avanceEjecutadoAcumulado",
              editor: "number",
              formatter: make_percent_formatter(2),
            },
            {
              title: "MONTO AVANCE EJECUTADO ACUMULADO",
              field: "montoAvanceEjecutadoAcumulado",
              editor: "number",
              ...sun_currency_formatter,
            },
          ],
        },
        {
          title: "DIFERENCIA",
          columns: [
            {
              title: "% DIFERENCIA ACUMULADO",
              field: "diferenciaAcumulado",
              formatter: make_percent_formatter(2),
            },
            {
              title: "MONTO DIFERENCIA ACUMULADO",
              field: "montoDiferenciaAcumulado",
              ...sun_currency_formatter,
            },
          ],
        },
        {
          title: "CONDICION DE LA OBRA",
          field: "condicionDeLaObra",
        },
      ],
    },
  };
};

const tbl_metrado_diario = tbl_metrado_diario_model("#tbl_metrado_diario");
const tbl_metrado = tbl_metrado_model("#tbl_metrado");
const tbl_desagregado = tbl_desagregado_model("#tbl_desagregado");
const tbl_programacion = tbl_programacion_model("#tbl_programacion");

//IDEA: use field to do calculations example
// the formulas model its inmutable
/* const formulas = {
    "field1": (cell) {
      calculateTotal();
    }
  } */

// TODO: auto column names
// TODO: delete spare row on sort
// TODO: undo/redo update formulas
const defaultConfig = {
  /* renderHorizontal:"virtual", */
  layout: "fitDataFill",
  layoutColumnsOnNewData: true,
  columnHeaderVertAlign: "middle", //align header contents to bottom of cell
  //enable range selection
  headerSortClickElement: "icon",
  selectableRange: true,
  selectableRangeColumns: true,
  /* selectableRangeRows: true, */
  selectableRangeClearCells: true,
  /* rowHeader: {resizable: false, frozen: true, width:40, hozAlign:"center", formatter: "rownum", field:"rownum", accessorClipboard:"rownum"}, */
  //change edit trigger mode to make cell navigation smoother
  editTriggerEvent: "dblclick",
  history: true,
  //configure clipboard to allow copy and paste of range format data
  clipboard: true,
  clipboardCopyConfig: {
    columnHeaders: false, //do not include column headers in clipboard output
    columnGroups: false, //do not include column groups in column headers for printed table
    rowHeaders: false, //do not include row headers in clipboard output
    rowGroups: false, //do not include row groups in clipboard output
    columnCalcs: false, //do not include column calculation rows in clipboard output
    dataTree: false, //do not include data tree in printed table
    formatCells: false, //show raw cell values without formatter
  },
  clipboardCopyStyled: false,
  clipboardCopyRowRange: "range",
  clipboardPasteParser: "range",
  clipboardPasteAction: "range",
  columnDefaults: {
    hozAlign: "center",
    vertAlign: "middle",
    headerHozAlign: "center",
    headerWordWrap: true,
    resizable: true,
  },
};

function createSpreeadSheetTable(tableModel, sheetName) {
  const spareRow = tableModel.spareRow ?? false;
  const config = { ...defaultConfig, ...tableModel.config };

  linkMutators(tableModel);

  const table = new Tabulator(tableModel.id, config);

  function checkCellEdited(cell) {
    let isEditable = false;
    const column = cell.getColumn();
    const columnDef = column.getDefinition();
    if (typeof columnDef.editable === "function") {
      isEditable = columnDef.editable(cell);
    } else {
      isEditable = columnDef.editor !== undefined;
    }
    return isEditable;
  }

  table.on("cellEdited", function (cell) {
    cell.getColumn().getField();
    const rowPos = cell.getRow().getIndex();
    const lastIndex = table.getRows().length - 1;
    if (!checkCellEdited(cell)) {
      return;
    }

    if (spareRow && lastIndex === rowPos) {
      table.addRow({});
    }
  });

  table.on("rowAdded", function (row) {
    const lastIndex = table.getRows().length;
    row.update({ id: lastIndex });
  });

  // TODO: controller subscribe to table events
  // TODO: mutator to cancel noneditable Cells
  table.on("clipboardPasted", function (clipboard, rowData, rows) {
    let index = 0;
    let repeat = 0;
    for (; index < rows.length; index++) {
      Object.entries(rowData[repeat]).forEach(function ([colPos, value]) {
        const cell = rows[index].getCell(colPos).component;
        checkCellEdited(cell);
      });
      repeat = (repeat + 1) % rowData.length;
    }
    if (rowData.length > rows.length && spareRow) {
      table.addRow(rowData.slice(index));
      table.addRow({});
    }
  });

  table.on("tableBuilt", function () {
    if (config.clipboardPasteParser === "range") {
      const rangeParser = table.modules.clipboard.pasteParser.bind(
        table.modules.clipboard
      );
      table.modules.clipboard.setPasteParser(function (clipboard) {
        if (clipboard.endsWith("\n") || clipboard.endsWith("\r")) {
          clipboard = clipboard.slice(0, -1);
        }
        return rangeParser(clipboard);
      });
    }
    if (tableModel.data !== undefined) {
      table.addRow(tableModel.data);
      table.clearHistory();
    }
    if (spareRow) {
      table.addRow({});
    }
  });
  table["spareRow"] = spareRow;
  return table;
}

var makeResultController = function (view, model, callbackCalculate) {
  return {
    init: function () {
      this.calculate();
    },
    update(id, updateValue) {
      const value = model.data[id];
      value.value =
        value.parser === undefined ? updateValue : value.parser(updateValue);
    },
    render: function (emitterID) {
      const container = document.getElementById(model.id);
      container.innerHTML = view.render(model, this);
      Object.keys(model.data).forEach((id) => {
        const elem = document.querySelector(`#${model.id} #${id}`);
        if (elem) {
          const formatter = model.data[id].formatter;
          const value = model.data[id].value;
          elem.value = formatter === undefined ? value : formatter(value);
        }
      });
      document.querySelector(`#${model.id} #${emitterID}`)?.focus();
    },
    calculate: function (emitterID) {
      callbackCalculate();
      this.render(emitterID);
    },
  };
};

var fichaTecnicaController = function (view, model, callbackCalculate) {
  return {
    init: function () {
      view.init(model, this);
      this.calculate();
    },
    update(id, updateValue) {
      const value = model.data[id];
      value.value =
        value.parser === undefined ? updateValue : value.parser(updateValue);
    },
    render: function (emitterID) {
      const container = document.getElementById(model.id);
      console.log(container);
      container.innerHTML = view.render(model, this);
      Object.keys(model.data).forEach((id) => {
        const elem = document.querySelector(`#${model.id} #${id}`);
        if (elem) {
          const formatter = model.data[id].formatter;
          const value = model.data[id].value;
          const formatted = formatter === undefined ? value : formatter(value);
          if (elem.value !== undefined) {
            elem.value = formatted;
          } else {
            elem.innerHTML = formatted;
          }
        }
      });
      document.querySelector(`#${model.id} #${emitterID}`)?.focus();
    },
    calculate: function (emitterID) {
      callbackCalculate();
      this.render(emitterID);
    },
  };
};

var metradoController = function (view, model, callbackCalculate) {
  return {
    pParcialEmpresaTotalCalc: function (values, data, calcParams) {
      model.data.costoDirectoEmpresa.value = treeSum(
        { _children: data },
        "pParcialEmpresa"
      );
      this.calculate();
      return model.data.costoDirectoEmpresa.value;
    },
    pParcialMaestroTotalCalc: function (values, data, calcParams) {
      model.data.costoDirectoMaestro.value = treeSum(
        { _children: data },
        "pParcialMaestro"
      );
      this.calculate();
      return model.data.costoDirectoMaestro.value;
    },
    init() {
      view.init(model, this);
      model.tableModel = tbl_metrado(
        model.data,
        this.pParcialEmpresaTotalCalc.bind(this),
        this.pParcialMaestroTotalCalc.bind(this)
      );
      model.table = createSpreeadSheetTable(model.tableModel);
      this.calculate();
    },
    update(id, updateValue) {
      const value = model.data[id];
      value.value =
        value.parser === undefined ? updateValue : value.parser(updateValue);
    },
    render: function (emitterID) {
      const container = document.getElementById(model.id);
      container.innerHTML = view.render(model, this);
      Object.keys(model.data).forEach((id) => {
        const elem = document.querySelector(`#${model.id} #${id}`);
        if (elem) {
          const formatter = model.data[id].formatter;
          const value = model.data[id].value;
          elem.value = formatter === undefined ? value : formatter(value);
        }
      });
      document.querySelector(`#${model.id} #${emitterID}`)?.focus();
    },
    calculate: function (emitterID) {
      callbackCalculate();
      this.render(emitterID);
    },
    tipoContratoChange: function () {
      model.table
        .getColumn("pAver")
        .getCells()
        .forEach((cell) => {
          cell.setValue("", true);
        });
    },
  };
};

var desagregadoController = function (view, model, callbackCalculate) {
  return {
    pParcialEmpresaTotalCalc: function (values, data, calcParams) {
      model.data.costoDirectoEmpresa.value = treeSum(
        { _children: data },
        "pParcialEmpresa"
      );
      this.calculate();
      return model.data.costoDirectoEmpresa.value;
    },
    init() {
      view.init(model, this);
      model.tableModel = tbl_desagregado(
        model,
        this.pParcialEmpresaTotalCalc.bind(this)
      );
      model.table = createSpreeadSheetTable(model.tableModel);
      this.calculate();
    },
    update(id, updateValue) {
      const value = model.data[id];
      value.value =
        value.parser === undefined ? updateValue : value.parser(updateValue);
    },
    render: function (emitterID) {
      const container = document.getElementById(model.id);
      container.innerHTML = view.render(model, this);
      Object.keys(model.data).forEach((id) => {
        const elem = document.querySelector(`#${model.id} #${id}`);
        if (elem) {
          const formatter = model.data[id].formatter;
          const value = model.data[id].value;
          elem.value = formatter === undefined ? value : formatter(value);
        }
      });
      document.querySelector(`#${model.id} #${emitterID}`)?.focus();
    },
    calculate: function (emitterID) {
      callbackCalculate();
      this.render(emitterID);
    },
    añadirCompra: function (date) {
      const fecha = date;
      model.compras.push(date);
      const desagregadoCompraModel = (index) =>
        makeDesagregadoCompraModel(fecha, index);
      insertColumns(
        model.tableModel,
        model.tableModel.config.columns,
        (index) => desagregadoCompraModel(model.compras.length),
        model.tableModel.config.columns.length - 2,
        model.tableModel.config.columns.length - 2,
        1
      );
      model.table.setColumns(model.tableModel.config.columns);
    },
  };
};

// TODO: the view could generate the model, defining the model would be optional,
//       and define the formatters in the view
const resumen_del_presupuesto_view = {
  render: (resumen_del_presupuesto_model, controller) => {
    const update = `update_model_${resumen_del_presupuesto_model.id}`;
    const calculate = `calculate_results_${resumen_del_presupuesto_model.id}`;
    window[update] = function (event) {
      controller.update(event.target.id, event.target.value);
    };

    window[calculate] = function (event) {
      event.preventDefault();
      controller.calculate(event.target.id);
    };

    return `
    <div class="form-group row">
        <label for="obra" class="col-sm-2 col-form-label">Obra</label>
        <div class="col-sm-10">
            <input type="text" oninput="${update}(event)" class="form-control" name="obra" id="obra" required>
        </div>
    </div>
    <div class="form-group row">
        <label for="contratista" class="col-sm-2 col-form-label">Contratista</label>
        <div class="col-sm-10">
            <input type="text" oninput="${update}(event)" class="form-control" name="contratista" id="contratista" required>
        </div>
    </div>
    <div class="form-group row">
        <label for="pBase" class="col-sm-2 col-form-label">P.Base S/.</label>
        <div class="col-sm-10">
            <input type="text" class="form-control" name="pBase" id="pBase" readonly>
        </div>
    </div>
    <div class="form-group row">
        <label for="plazo" class="col-sm-2 col-form-label">Plazo (días)</label>
        <div class="col-sm-10">
            <input type="number" min="1" step="1" oninput="${update}(event)" class="form-control" name="plazo" id="plazo" required>
        </div>
    </div>
    <div class="form-group row">
        <label for="fechaInicio" class="col-sm-2 col-form-label">Fecha Inicio</label>
        <div class="col-sm-10">
            <input type="date" oninput="${update}(event)" class="form-control" name="fechaInicio" id="fechaInicio" required>
        </div>
    </div>
    <table class="table table-bordered mt-4">
        <thead class="thead-light">
            <tr>
                <th scope="col">FORMULA</th>
                <th scope="col">DESCRIPCION</th>
                <th scope="col">MONTO OFERTADO</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>02</td>
                <td>Estructuras</td>
                <td><input type="number" min="0" oninput="${update}(event);${calculate}(event)" class="form-control" name="estructuras" id="estructuras" required></td>
            </tr>
            <tr>
                <td>03</td>
                <td>Instalaciones Sanitarias (solo en losa)</td>
                <td><input type="number" min="0" oninput="${update}(event);${calculate}(event)" class="form-control" name="inst_sanitarias" id="inst_sanitarias" required></td>
            </tr>
            <tr>
                <td>04</td>
                <td>Instalaciones Eléctricas (solo en losa)</td>
                <td><input type="number" min="0" oninput="${update}(event);${calculate}(event)" class="form-control" name="inst_electricas" id="inst_electricas" required></td>
            </tr>
        </tbody>
    </table>
    <div class="form-group row">
        <label class="col-sm-6 col-form-label font-weight-bold">COSTO DIRECTO</label>
        <div class="col-sm-6">
            <input type="text" class="form-control-plaintext" id="costo_directo" readonly>
        </div>
    </div>
    <div class="form-group row">
        <label class="col-sm-6 col-form-label font-weight-bold">TOTAL PRESUPUESTO EJECUTADO</label>
        <div class="col-sm-6">
            <input type="text" class="form-control-plaintext" id="total_presupuesto_ejecutado" readonly>
        </div>
    </div>
    <div class="col-sm-12 text-right">
        <button type="submit" class="btn btn-primary" id="generar_valorizacion">VALORIZACIÓN</button>
    </div>`;
  },
};

const ficha_tecnica_view = {
  init(resumen_del_presupuesto_model, controller) {
    this.update = `update_model_${resumen_del_presupuesto_model.id}`;
    this.calculate = `calculate_results_${resumen_del_presupuesto_model.id}`;
    window[this.update] = function (event) {
      controller.update(event.target.id, event.target.value);
    };

    window[this.calculate] = function (event) {
      event.preventDefault();
      controller.calculate(event.target.id);
    };
  },
  render(resumen_del_presupuesto_model, controller) {
    console.log(resumen_del_presupuesto_model);
    return `
    <div class="card-header d-flex justify-content-between">
          <h3 class="card-title">FICHA TECNICA DE OBRA</h3>
          <button class="collapsible-btn ml-auto" onclick="displayToggle(event)" data-target="content1">ver / ocultar</button>
      </div>
      <div class="card-body p-0 m-0" class="collapsible-content" id="content1">
          <div class="card m-0">
              <div class="card-body collapsible-content mb-3">
                  <div class="d-flex flex-column">
                      <div class="col-md-8 mx-auto">
                          <h2 class="text-center">FICHA TÉCNICA DE OBRA</h2>
                          <form action="#">
                              <div class="form-group row">
                                  <label for="contratoN" class="col-sm-2 col-form-label font-weight-bold">CONTRATO Nº</label>
                                  <div class="col-sm-10">
                                      <input type="text" oninput="${this.update}(event)" class="form-control" id="contratoN">
                                  </div>
                              </div>
                              <div class="form-group row">
                                  <label for="obra" class="col-sm-2 col-form-label font-weight-bold">OBRA</label>
                                  <div class="col-sm-10">
                                      <input type="text" class="form-control" id="obra" readonly>
                                  </div>
                              </div>
                              <div class="form-group row">
                                  <label for="contratista" class="col-sm-2 col-form-label font-weight-bold">CONTRATISTA</label>
                                  <div class="col-sm-10">
                                      <input type="text" class="form-control" id="contratista" readonly>
                                  </div>
                              </div>
                              <div class="form-group row">
                                  <label for="modalidad" class="col-sm-2 col-form-label font-weight-bold">MODALIDAD</label>
                                  <div class="col-sm-10">
                                      <input type="text" oninput="${this.update}(event)" class="form-control" id="modalidad">
                                  </div>
                              </div>
                              <div class="form-group row">
                                  <label class="col-sm-2 col-form-label font-weight-bold">UBICACIÓN</label>
                                  <div class="col-sm-10">
                                      <div class="form-row">
                                          <div class="col-sm-2 font-weight-bold">DISTRITO</div>
                                          <div class="col-sm-10">HUANUCO</div>
                                      </div>
                                      <div class="form-row">
                                          <div class="col-sm-2 font-weight-bold">PROVINCIA</div>
                                          <div class="col-sm-10">HUANUCO</div>
                                      </div>
                                      <div class="form-row">
                                          <div class="col-sm-2 font-weight-bold">REGIÓN</div>
                                          <div class="col-sm-10">HUANUCO</div>
                                      </div>
                                  </div>
                              </div>
                              <div class="table-responsive">
                                  <table class="table table-bordered">
                                      <thead>
                                          <th colspan="4">PRESUPUESTO</th>
                                          <tr>
                                              <th>BASE</th>
                                              <th>FECHA</th>
                                              <th>CONTRATADO</th>
                                              <th>FR</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                          <tr>
                                              <td id="pBase"></td>
                                              <td id="fechaInicio"></td>
                                              <td id="pContratado"></td>
                                              <td id="pFr"></td>
                                          </tr>
                                      </tbody>
                                  </table>
                              </div>
                              <div class="table-responsive">
                                  <table class="table table-bordered">
                                      <thead>
                                          <tr>
                                              <th colspan="4">ADELANTO DE DIRECTO</th>
                                          </tr>
                                          <tr>
                                              <th>MAX</th>
                                              <th>OTORGADO</th>
                                              <th>%</th>
                                              <th>FECHA</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                          <tr>
                                              <td><input type="number" min="1" step="1" oninput="${this.update}(event);${this.calculate}(event)" class="form-control" name="adelantoOtorgadoMax" id="adelantoOtorgadoMax" required></td>
                                              <td id="adelantoOtorgado"></td>
                                              <td id="adelantoOtorgadoRatio"></td>
                                              <td>-</td>
                                          </tr>
                                      </tbody>
                                  </table>
                              </div>
                              <div class="table-responsive">
                                  <table class="table table-bordered">
                                      <thead>
                                          <tr>
                                              <th colspan="3">PLAZO DE EJECUCIÓN CONTRACTUAL</th>
                                          </tr>
                                          <tr>
                                              <th>PLAZO</th>
                                              <th>FECHA INICIO</th>
                                              <th>FECHA TÉRMINO</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                          <tr>
                                              <td id="plazo"></td>
                                              <td><input type="date" oninput="${this.update}(event);${this.calculate}(event)" class="form-control" name="fechaInicioPlazo" id="fechaInicioPlazo" required></td>
                                              <td id="fechaFinPlazo"></td>
                                          </tr>
                                      </tbody>
                                  </table>
                              </div>
                              <div class="table-responsive">
                                  <table class="table table-bordered">
                                      <thead>
                                          <tr>
                                              <th></th>
                                              <th>SEMANA</th>
                                              <th>% PARCIAL</th>
                                              <th>MONTO</th>
                                              <th>% ACUM</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                          <tr>
                                              <th>EJECUTADO</th>
                                              <td><input type="number" min="1" step="1" oninput="${this.update}(event);${this.calculate}(event)" class="form-control" name="ejecutado" id="ejecutado" required></td>
                                              <td id="parcialEjecutado"></td>
                                              <td id="montoEjecutado"></td>
                                              <td id="acumuladoEjecutado"></td>
                                          </tr>
                                          <tr>
                                              <th>PROGRAMADO</th>
                                              <td><input type="number" min="1" step="1" oninput="${this.update}(event);${this.calculate}(event)" class="form-control" name="programado" id="programado" required></td>
                                              <td id="parcialProgramado"></td>
                                              <td id="montoProgramado"></td>
                                              <td id="acumuladoProgramado"></td>
                                          </tr>
                                      </tbody>
                                  </table>
                              </div>
                              <div class="form-group row">
                                  <label for="estadoObra" class="col-sm-4 col-form-label font-weight-bold">ESTADO DE LA OBRA</label>
                                  <div class="col-sm-8">
                                      <input type="text" class="form-control-plaintext" id="estadoObra">
                                      <span id="estadoObraInfo"></span>
                                  </div>
                              </div>
                              <div class="form-group row">
                                  <label for="totalFacturable" class="col-sm-4 col-form-label font-weight-bold">TOTAL FACTURABLE</label>
                                  <div class="col-sm-8">
                                      <input type="text" class="form-control-plaintext text-blue" id="totalFacturable">
                                  </div>
                              </div>
                          </form>
                      </div>
                  </div>
              </div>
          </div>
      </div>`;
  },
};

const metrado_view = {
  init(model, controller) {
    this.update = `update_model_${model.id}`;
    this.calculate = `calculate_results_${model.id}`;
    this.tipoContrato = `tipo_contrato_${model.id}`;
    window[this.update] = function (event) {
      controller.update(event.target.id, event.target.value);
    };
    window[this.tipoContrato] = function (event) {
      controller.tipoContratoChange();
    };
    window[this.calculate] = function (event) {
      event.preventDefault();
      controller.calculate(event.target.id);
    };
    this.result_view = `
    <table id="result_metrado" class="table table-bordered mt-4">
        <thead class="thead-light">
            <tr>
                <th scope="col"></th>
                <th scope="col">PRECIO PARCIAL EMPRESA</th>
                <th scope="col">PRECIO PARCIAL MAESTRO</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>COSTO DIRECTO</td>
                <td><input type="text" class="form-control-plaintext" id="costoDirectoEmpresa"></td>
                <td><input type="text" class="form-control-plaintext" id="costoDirectoMaestro"></td>
            </tr>
            <tr>
                <td>GASTOS GENERALES</td>
                <td><input type="number" min="0" class="form-control" id="gastosGeneralesEmpresa" oninput="${this.update}(event);${this.calculate}(event)"></td>
                <td><input type="number" min="0" class="form-control" id="gastosGeneralesMaestro" oninput="${this.update}(event);${this.calculate}(event)"></td>
            </tr>
            <tr>
                <td>UTILIDAD</td>
                <td><input type="number" min="0" class="form-control" id="utilidadEmpresa" oninput="${this.update}(event);${this.calculate}(event)"></td>
                <td><input type="number" min="0" class="form-control" id="utilidadMaestro" oninput="${this.update}(event);${this.calculate}(event)"></td>
            </tr>
        </tbody>
        <tfoot class="thead-light">
            <tr>
                <th scope="row">COSTO TOTAL X FACTOR DE RELACION</th>
                <th><input type="text" class="form-control-plaintext" id="cotoTotalXFactorDeRelacionEmpresa"></th>
                <th><input type="text" class="form-control-plaintext" id="cotoTotalXFactorDeRelacionMaestro"></th>
            </tr>
            <tr>
                <th scope="row">PRECIO A VER</th>
                <th colspan="2"><input type="text" class="form-control-plaintext" id="precioAVer"></th>
            </tr>
        </tfoot>
    </table>`;

    const mainView = `
    <div id="metrado" class="card card-info p-0 m-0">
        <div class="card-header d-flex justify-content-between">
            <h3 class="card-title">METRADO</h3>
            <select class="ml-2 tipo-select" id="tipoContrato" onchange="${this.update}(event);${this.tipoContrato}(event);${this.calculate}(event)">
                <option value="SUBCONTRATO">SUBCONTRATO</option>
                <option value="EMPRESA">EMPRESA</option>
            </select>
            <button class="collapsible-btn ml-auto" onclick="displayToggle(event)" data-target="content2">ver / ocultar</button>
        </div>
        <div class="d-none card-body p-0" id="content2">
            <div class="card m-0">
                <div class="card-body collapsible-content mb-3">
                    <div class="d-flex flex-column">
                        <div class="row">
                            <div class="col-md-12 justify-content-center mb-3">
                                <div id="tbl_metrado"></div>
                            </div>
                            ${this.result_view}
                            <div class="col-sm-12 text-right">
                                <button id="generarDesagregado" type="button" class="btn btn-primary">Desagregado</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
    document.getElementById(model.containerID).outerHTML = mainView;
  },
  render(model, controller) {
    return this.result_view;
  },
};

const desagregado_view = {
  init(model, controller) {
    this.update = `update_model_${model.id}`;
    this.calculate = `calculate_results_${model.id}`;
    this.añadirCompra = `añadir_compra_${model.id}`;
    window[this.update] = function (event) {
      controller.update(event.target.id, event.target.value);
    };
    window[this.calculate] = function (event) {
      event.preventDefault();
      controller.calculate(event.target.id);
    };
    window[this.añadirCompra] = function (event) {
      event.preventDefault();
      controller.añadirCompra(event.target.elements["date"].value);
      return false;
    };
    this.result_view = `
      <table id="result_desagregado" class="table table-bordered mt-4">
          <thead class="thead-light">
              <tr>
                  <th scope="col"></th>
                  <th scope="col">PRECIO PARCIAL EMPRESA</th>
              </tr>
          </thead>
          <tbody>
              <tr>
                  <td>COSTO DIRECTO</td>
                  <td><input type="text" class="form-control-plaintext" id="costoDirectoEmpresa"></td>
              </tr>
              <tr>
                  <td>GASTOS GENERALES</td>
                  <td><input type="number" min="0" class="form-control" id="gastosGeneralesEmpresa" oninput="${this.update}(event);${this.calculate}(event)"></td>
              </tr>
              <tr>
                  <td>UTILIDAD</td>
                  <td><input type="number" min="0" class="form-control" id="utilidadEmpresa" oninput="${this.update}(event);${this.calculate}(event)"></td>
              </tr>
          </tbody>
          <tfoot class="thead-light">
              <tr>
                  <th scope="row">COSTO TOTAL X FACTOR DE RELACION</th>
                  <th><input type="text" class="form-control-plaintext" id="cotoTotalXFactorDeRelacionEmpresa"></th>
              </tr>
          </tfoot>
      </table>`;

    const mainView = `
        <div id="desagregado" class="card card-info p-0 m-0">
            <div class="card-header d-flex justify-content-between">
                <h3 class="card-title">DESAGREGADO</h3>
                <button class="collapsible-btn ml-auto" onclick="displayToggle(event)" data-target="content3">ver / ocultar</button>
            </div>
            <div class="d-none card-body p-0" class="collapsible-content" id="content3">
                <div class="card m-0">
                    <div class="card-body collapsible-content mb-3">
                        <div class="d-flex flex-column">
                            <form action="#" onsubmit="${this.añadirCompra}(event)">
                                <div class="form-group row">
                                    <label for="date" class="col-sm-auto col-form-label">Fecha:</label>
                                    <div class="col-sm-4">
                                        <input type="date" id="date" class="form-control" required>
                                    </div>
                                    <div class="col-sm-4">
                                        <button id="añadirCompra" class="btn btn-success">+ Compra</button>
                                    </div>
                                </div>
                            </form>
                            <div class="row">
                                <div class="col-md-12 justify-content-center mb-3">
                                    <div id="tbl_desagregado"></div>
                                </div>
                                ${this.result_view}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
    document.getElementById(model.containerID).outerHTML = mainView;
  },
  render(model, controller) {
    return this.result_view;
  },
};

const resumen_del_presupuesto_model = {
  id: "resumen_presupuesto",
  data: {
    obra: {
      value: "",
    },
    contratista: {
      value: "",
    },
    pBase: {
      value: 0,
      formatter: pen_formatter.format,
    },
    plazo: {
      value: 1,
      parser: parseInt,
    },
    fechaInicio: {
      value: new Date().toISOString().split("T")[0],
    },
    estructuras: {
      value: 0,
      parser: parseFloat,
    },
    inst_sanitarias: {
      value: 0,
      parser: parseFloat,
    },
    inst_electricas: {
      value: 0,
      parser: parseFloat,
    },
    costo_directo: {
      value: 0,
      formatter: pen_formatter.format,
    },
    total_presupuesto_ejecutado: {
      value: 0,
      formatter: pen_formatter.format,
    },
  },
};

const ficha_tecnica_model = {
  id: "ficha_tecnica",
  data: {
    contratoN: {
      value: "",
    },
    modalidad: {
      value: "",
    },
    obra: {
      value: "",
    },
    contratista: {
      value: "",
    },
    pBase: {
      value: 0,
      formatter: pen_formatter.format,
    },
    pContratado: {
      value: 0,
      formatter: pen_formatter.format,
    },
    pFr: {
      value: 1.0,
    },
    adelantoOtorgadoMax: {
      value: 0,
    },
    adelantoOtorgado: {
      value: 0,
      formatter: pen_formatter.format,
    },
    adelantoOtorgadoRatio: {
      value: 0,
      formatter: (value) => percent_formatter(value, 2),
    },
    plazo: {
      value: 1,
      parser: parseInt,
    },
    fechaInicio: {
      value: "",
    },
    fechaInicioPlazo: {
      value: "",
    },
    fechaFinPlazo: {
      value: "",
      formatter: (date) => date.toLocaleDateString("es-PE"),
    },
    ejecutado: {
      value: 0,
    },
    parcialEjecutado: {
      value: 0,
      formatter: (value) => percent_formatter(value, 2),
    },
    montoEjecutado: {
      value: 0,
      formatter: pen_formatter.format,
    },
    acumuladoEjecutado: {
      value: 0,
      formatter: (value) => percent_formatter(value, 2),
    },
    programado: {
      value: 0,
    },
    parcialProgramado: {
      value: 0,
      formatter: (value) => percent_formatter(value, 2),
    },
    montoProgramado: {
      value: 0,
      formatter: pen_formatter.format,
    },
    acumuladoProgramado: {
      value: 0,
      formatter: (value) => percent_formatter(value, 2),
    },
    estadoObra: {
      value: 0,
      formatter: (value) => percent_formatter(value, 2),
    },
    estadoObraInfo: {
      value: "",
    },
    totalFacturable: {
      value: 0,
      formatter: pen_formatter.format,
    },
  },
};

const metrado_model = {
  id: "result_metrado",
  containerID: "metrado",
  tableModel: null,
  table: null,
  data: {
    costoDirectoEmpresa: {
      value: 0,
      parser: parseFloat,
      formatter: pen_formatter.format,
    },
    costoDirectoMaestro: {
      value: 0,
      parser: parseFloat,
      formatter: pen_formatter.format,
    },
    tipoContrato: {
      value: "SUBCONTRATO",
    },
    gastosGeneralesEmpresa: {
      value: "",
      parser: parseFloat,
    },
    gastosGeneralesMaestro: {
      value: "",
      parser: parseFloat,
    },
    utilidadEmpresa: {
      value: "",
      parser: parseFloat,
    },
    utilidadMaestro: {
      value: "",
      parser: parseFloat,
    },
    cotoTotalXFactorDeRelacionEmpresa: {
      value: 0,
      formatter: pen_formatter.format,
    },
    cotoTotalXFactorDeRelacionMaestro: {
      value: 0,
      formatter: pen_formatter.format,
    },
    precioAVer: {
      value: 0,
      formatter: pen_formatter.format,
    },
  },
};

const desagregado_model = {
  id: "result_desagregado",
  containerID: "desagregado",
  tableModel: null,
  table: null,
  compras: [],
  data: {
    costoDirectoEmpresa: {
      value: 0,
      parser: parseFloat,
      formatter: pen_formatter.format,
    },
    gastosGeneralesEmpresa: {
      value: "",
      parser: parseFloat,
    },
    utilidadEmpresa: {
      value: "",
      parser: parseFloat,
    },
    cotoTotalXFactorDeRelacionEmpresa: {
      value: 0,
      formatter: pen_formatter.format,
    },
  },
};

function setInputValue(id, value) {
  const trigger = document.querySelector(id);
  trigger.value = value;
  trigger.dispatchEvent(new Event("input", { bubbles: true }));
}

let programacion;

function metradoDiarioSheet(valNum, metrado_diario) {
  insertColumns(
    tbl_metrado_diario,
    tbl_metrado_diario.config.columns,
    VALMetradoDiarioModel,
    10,
    tbl_metrado_diario.config.columns.length,
    valNum
  );
  metrado_diario.setColumns(tbl_metrado_diario.config.columns);
}

function metradoSheet(valNum, metrado) {
  const VALMontoModel = makeVALMontoModel();
  const VALAcumuladaModel = makeValorizacionAcumuladaModel(valNum);
  insertColumns(
    metrado_model.tableModel,
    metrado_model.tableModel.config.columns,
    VALMetradoModel,
    9,
    metrado_model.tableModel.config.columns.length,
    valNum
  );
  insertColumns(
    metrado_model.tableModel,
    metrado_model.tableModel.config.columns,
    VALMontoModel,
    metrado_model.tableModel.config.columns.length,
    metrado_model.tableModel.config.columns.length,
    valNum
  );
  insertColumns(
    metrado_model.tableModel,
    metrado_model.tableModel.config.columns,
    VALAcumuladaModel,
    metrado_model.tableModel.config.columns.length,
    metrado_model.tableModel.config.columns.length,
    1
  );
  insertColumns(
    metrado_model.tableModel,
    metrado_model.tableModel.config.columns,
    saldoXValorizarModel,
    metrado_model.tableModel.config.columns.length,
    metrado_model.tableModel.config.columns.length,
    1
  );

  metrado.setColumns(metrado_model.tableModel.config.columns);
}

function programacionSheet(valNum, programacion) {
  const programacion_valoraciones = Array.from(Array(valNum), (_, i) => {
    return { id: i + 1, valorizacion: i + 1 };
  });
  programacion.setData(programacion_valoraciones);
}

const ficha_tecnica_controller = fichaTecnicaController(
  ficha_tecnica_view,
  ficha_tecnica_model,
  () => {
    ficha_tecnica_model.data;
    ficha_tecnica_model.data.pContratado.value =
      ficha_tecnica_model.data.pBase.value * ficha_tecnica_model.data.pFr.value;
    ficha_tecnica_model.data.adelantoOtorgado.value =
      ficha_tecnica_model.data.adelantoOtorgadoMax.value;
    if (ficha_tecnica_model.data.pBase.value != 0) {
      ficha_tecnica_model.data.adelantoOtorgadoRatio.value =
        ficha_tecnica_model.data.adelantoOtorgadoMax.value /
        ficha_tecnica_model.data.pBase.value;
    } else {
      ficha_tecnica_model.data.adelantoOtorgadoRatio.value = 0;
    }
    ficha_tecnica_model.data.fechaFinPlazo.value = new Date(
      ficha_tecnica_model.data.fechaInicioPlazo.value
    );
    ficha_tecnica_model.data.fechaFinPlazo.value.setDate(
      ficha_tecnica_model.data.fechaFinPlazo.value.getDate() +
      ficha_tecnica_model.data.plazo.value +
      1
    );

    const programacionData = programacion?.getData() ?? [];
    const programacionRow = (index) => programacionData?.[index] ?? {};
    const programacionCol = (column, row) => row?.[column] ?? 0;

    const ejecutado = (column) =>
      programacionCol(
        column,
        programacionRow(ficha_tecnica_model.data.ejecutado.value - 1)
      );
    const programado = (column) =>
      programacionCol(
        column,
        programacionRow(ficha_tecnica_model.data.programado.value - 1)
      );

    ficha_tecnica_model.data.parcialEjecutado.value = ejecutado(
      "avanceEjecutadoSemanal"
    );
    ficha_tecnica_model.data.montoEjecutado.value = ejecutado(
      "montoAvanceEjecutadoSemanal"
    );
    ficha_tecnica_model.data.acumuladoEjecutado.value = ejecutado(
      "avanceEjecutadoAcumulado"
    );

    ficha_tecnica_model.data.parcialProgramado.value = programado(
      "avanceProgramadoSemanal"
    );
    ficha_tecnica_model.data.montoProgramado.value = programado(
      "montoAvanceProgramadoSemanal"
    );
    ficha_tecnica_model.data.acumuladoProgramado.value = programado(
      "avanceProgramadoAcumulado"
    );

    ficha_tecnica_model.data.estadoObra.value = ejecutado(
      "diferenciaAcumulado"
    );
    if (ficha_tecnica_model.data.estadoObra.value > 0) {
      ficha_tecnica_model.data.estadoObraInfo.value = "ADELANTADA";
    } else {
      ficha_tecnica_model.data.estadoObraInfo.value = "ATRASADA";
    }
    ficha_tecnica_model.data.totalFacturable.value =
      ficha_tecnica_model.data.montoEjecutado.value;
  }
);

const resumen_del_presupuesto_controller = makeResultController(
  resumen_del_presupuesto_view,
  resumen_del_presupuesto_model,
  () => {
    const rdp = resumen_del_presupuesto_model.data;
    rdp.pBase.value =
      rdp.costo_directo.value =
      rdp.total_presupuesto_ejecutado.value =
      rdp.estructuras.value +
      rdp.inst_electricas.value +
      rdp.inst_sanitarias.value;
  }
);

const metrado_controller = metradoController(
  metrado_view,
  metrado_model,
  () => {
    const mtd = metrado_model.data;
    mtd.cotoTotalXFactorDeRelacionEmpresa.value =
      mtd.costoDirectoEmpresa.value +
      mtd.gastosGeneralesEmpresa.value +
      mtd.utilidadEmpresa.value;
    mtd.cotoTotalXFactorDeRelacionMaestro.value =
      mtd.costoDirectoMaestro.value +
      mtd.gastosGeneralesMaestro.value +
      mtd.utilidadMaestro.value;
    if (mtd.tipoContrato.value === "SUBCONTRATO") {
      mtd.precioAVer.value = mtd.cotoTotalXFactorDeRelacionMaestro.value;
    } else {
      mtd.precioAVer.value = mtd.cotoTotalXFactorDeRelacionEmpresa.value;
    }
  }
);

const desagregado_controller = desagregadoController(
  desagregado_view,
  desagregado_model,
  () => {
    const dsg = desagregado_model.data;
    dsg.cotoTotalXFactorDeRelacionEmpresa.value =
      dsg.costoDirectoEmpresa.value +
      dsg.gastosGeneralesEmpresa.value +
      dsg.utilidadEmpresa.value;
  }
);

resumen_del_presupuesto_controller.init();
ficha_tecnica_controller.init();
metrado_controller.init();
desagregado_controller.init();

const metrado_diario = createSpreeadSheetTable(tbl_metrado_diario);
const metrado = metrado_model.table;
const desagregado = desagregado_model.table;
programacion = createSpreeadSheetTable(tbl_programacion);
const datavalorizacion = document.getElementById('valorizacionData').value;
// Paso 2: Parsear el JSON principal (valorizacionData)
const valorizacionData = JSON.parse(datavalorizacion);
if (valorizacionData) {
  const tableData = JSON.parse(valorizacionData.data_valorizacion);
  console.log(tableData);
  setInputValue("#resumen_presupuesto #obra", valorizacionData.obra_valo);

  setInputValue(
    "#resumen_presupuesto #contratista",
    valorizacionData.contratista_valo
  );

  setInputValue("#resumen_presupuesto #plazo", valorizacionData.plazo_valo);

  setInputValue(
    "#resumen_presupuesto #fechaInicio",
    valorizacionData.fecha_inicio_valo
  );

  setInputValue(
    "#resumen_presupuesto #estructuras",
    valorizacionData.estructuras_valo
  );

  setInputValue(
    "#resumen_presupuesto #inst_sanitarias",
    valorizacionData.inst_sanitarias_valo
  );

  setInputValue(
    "#resumen_presupuesto #inst_electricas",
    valorizacionData.inst_electricas_valo
  );

  setTimeout(() => {
    Object.entries(tableData.tables).forEach(([tbl_id, data]) => {
      Tabulator.findTable("#" + tbl_id)[0].clearData();
      Tabulator.findTable("#" + tbl_id)[0].addData(data);
    });

    /* const valNum = Math.floor(valorizacionData.plazo_valo / 7);
      metradoDiarioSheet(valNum, metrado_diario);
      metradoSheet(valNum, metrado);
      programacionSheet(valNum, programacion); */

    tableData.desagregado_model.compras.forEach((compra) => {
      desagregado_controller.añadirCompra(compra);
    });

    Object.keys(tableData.metrado_model.data).forEach((key) => {
      tableData.metrado_model.data[key].formatter =
        metrado_model.data[key].formatter;
      tableData.metrado_model.data[key].parser = metrado_model.data[key].parser;
    });
    Object.keys(tableData.desagregado_model.data).forEach((key) => {
      tableData.desagregado_model.data[key].formatter =
        desagregado_model.data[key].formatter;
      tableData.desagregado_model.data[key].parser =
        desagregado_model.data[key].parser;
    });

    tableData.metrado_model.table = metrado_model.table;
    tableData.metrado_model.tableModel = metrado_model.tableModel;

    tableData.desagregado_model.table = desagregado_model.table;
    tableData.desagregado_model.tableModel = desagregado_model.tableModel;

    Object.assign(metrado_model, tableData.metrado_model);
    Object.assign(desagregado_model, tableData.desagregado_model);

    Object.entries(metrado_model.data).forEach(([id, object]) => {
      metrado_controller.update(id, object.value);
    });

    Object.entries(desagregado_model.data).forEach(([id, object]) => {
      desagregado_controller.update(id, object.value);
    });

    metrado_controller.calculate();
    desagregado_controller.calculate();
  }, 2000);
}

document
  .getElementById("resumen_presupuesto")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    ficha_tecnica_model.data = {
      ...ficha_tecnica_model.data,
      ...resumen_del_presupuesto_model.data,
    };
    ficha_tecnica_controller.calculate();
    document.getElementById("valorizacion").classList.remove("d-none");
    let resumenData = new FormData(event.target);
    const resumen = Object.fromEntries(resumenData.entries());
    const valNum = Math.floor(resumen.plazo / 7);
    metradoDiarioSheet(valNum, metrado_diario);
    metradoSheet(valNum, metrado);
    programacionSheet(valNum, programacion);

    document.getElementById("guardar").addEventListener("click", (event) => {
      // Obtener los valores de los campos del formulario
      const id_valorizacion = document.getElementById('id_valorizacion').value;
      const obra_valo = document.getElementById('obra').value;
      const contratista_valo = document.getElementById('contratista').value;
      const plazo_valo = document.getElementById('plazo').value;
      const fecha_inicio_valo = document.getElementById('fechaInicio').value;
      const estructuras_valo = document.getElementById('estructuras').value;
      const inst_sanitarias_valo = document.getElementById('inst_sanitarias').value;  // Corregido
      const inst_electricas_valo = document.getElementById('inst_electricas').value;
      const contrato_n_valo = document.getElementById('contratoN').value;
      const modalidad_valo = document.getElementById('modalidad').value;
      const adelanto_directo_valo = document.getElementById('adelantoOtorgadoMax').value;
      const adelanto_directo_fecha_valo = document.getElementById('fechaInicioPlazo').value;
  
      // Datos de la tabla (Asegúrate de que estas variables estén correctamente definidas en tu código)
      const data = {
          tables: {
              [metrado_diario.element.id]: metrado_diario.getData(),
              [metrado.element.id]: metrado.getData(),
              [desagregado.element.id]: desagregado.getData(),
              [programacion.element.id]: programacion.getData(),
          },
          metrado_model: metrado_model,
          desagregado_model: desagregado_model,
      };
  
      // Eliminar campos no necesarios de los modelos
      delete data.metrado_model.table;
      delete data.metrado_model.tableModel;
      delete data.desagregado_model.table;
      delete data.desagregado_model.tableModel;
  
      // Preparar el objeto dataToSend para enviar al controlador
      const dataToSend = {
          id_valorizacion: id_valorizacion,
          obra_valo: obra_valo,  // Asegúrate de que todos los valores estén presentes
          contratista_valo: contratista_valo,
          plazo_valo: plazo_valo,
          fecha_inicio_valo: fecha_inicio_valo,
          estructuras_valo: estructuras_valo,
          inst_sanitarias_valo: inst_sanitarias_valo,
          inst_electricas_valo: inst_electricas_valo,
          contrato_n_valo: contrato_n_valo,
          modalidad_valo: modalidad_valo,
          adelanto_directo_valo: adelanto_directo_valo,
          adelanto_directo_fecha_valo: adelanto_directo_fecha_valo,
          data_valorizacion: JSON.stringify(data),  // Convertir los datos a formato JSON
          compras_valo: desagregado_model.compras.length  // Contar el número de compras, si es necesario
      };
      // Enviar la solicitud con AJAX
      $.ajax({
          type: 'PUT',
          url: '/actualizarvalorizacion',  // Asegúrate de que esta URL esté bien configurada
          data: JSON.stringify(dataToSend),  // Convertir el objeto a JSON
          contentType: 'application/json',   // Establecer el tipo de contenido correcto
          processData: false,                // Desactivar la conversión automática de jQuery
          headers: {
              'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),  // CSRF token si es necesario
              'Accept': 'application/json'  // Esperamos una respuesta en formato JSON
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

    });

    return false;
  });

document.getElementById("generarMetrado").addEventListener("click", () => {
  metrado.updateOrAddData(metrado_diario.getData());
});

document
  .getElementById("generarDesagregado")
  .addEventListener("click", (event) => {
    desagregado.setData(
      metrado.getData().map((row) => {
        const {
          id,
          item,
          descripcionDeLaPartida,
          unidad,
          metrado,
          pEmpresa,
          _children,
        } = row;
        return {
          id,
          item,
          descripcionDeLaPartida,
          unidad,
          metrado,
          pEmpresa,
          _children,
        };
      })
    );
  });

document
  .getElementById("generar_grafico")
  .addEventListener("click", (event) => {
    const grafico = document.getElementById("chart_programacion");
    const programacionData = programacion.getData();
    const labels = programacionData.map((row) => {
      return row.valorizacion;
    });
    const avanze_programado_acumulado = programacionData.map((row) => {
      return row.avanceProgramadoAcumulado;
    });
    const avanze_ejecutado_acumulado = programacionData.map((row) => {
      return row.avanceEjecutadoAcumulado;
    });

    const data = {
      labels: labels,
      datasets: [
        {
          label: "% AVANCE PROGRAMADO ACUMULADO",
          data: avanze_programado_acumulado,
          type: "line",
          fill: false,
          tension: 0,
          borderColor: "red",
        },
        {
          label: "% AVANCE EJECUTADO ACUMULADO",
          data: avanze_ejecutado_acumulado,
          type: "line",
          fill: false,
          tension: 0,
          borderColor: "blue",
        },
      ],
    };

    const config = {
      type: "line",
      data: data,
      options: {
        layout: {
          padding: {
            left: 200,
            right: 200,
            bottom: 100,
          },
        },
        /* responsive: true, */
        plugins: {
          title: {
            display: true,
            text: "PROGRAMACION",
          },
        },
        interaction: {
          mode: "index",
          intersect: true,
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: "VALORIZACION",
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: "% AVANCE",
            },
          },
        },
      },
    };

    new Chart(grafico, config);
  });
