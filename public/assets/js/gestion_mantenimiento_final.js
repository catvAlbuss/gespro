var pen_formatter = new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
});

const sun_currency_formatter = {
    formatter: "money",
    formatterParams: {
        decimal: ".",
        thousand: ",",
        symbol: "S/ ",
        precision: 2,
    },
};

var make_round_formatter = function (precision) {
    return function (cell, formatterParams, onRendered) {
        //cell - the cell component
        //formatterParams - parameters set for the column
        //onRendered - function to call when the formatter has been rendered
        const value = parseFloat(cell.getValue());
        return isNaN(value) ? value : value.toFixed(precision); //return the contents of the cell;
    };
};

var bold_formatter = (...rows) => {
    return {
        formatter: function (cell, formatterParams, onRendered) {
            //cell - the cell component
            //formatterParams - parameters set for the column
            //onRendered - function to call when the formatter has been rendered
            const bold = rows.some((row) => {
                if (cell.getRow()._row.type !== "calc") {
                    return cell.getRow().getIndex() === row;
                } else {
                    return false;
                }
            });
            if (rows.length == 0 || bold) {
                return `<b>${cell.getValue() ?? ""}</b>`; //return the contents of the cell;
            } else {
                return cell.getValue();
            }
        },
    };
};

function excelColumn(n) {
    let result = "";
    while (n > 0) {
        n--;
        result = String.fromCharCode((n % 26) + 65) + result;
        n = Math.floor(n / 26);
    }
    return result;
}

function insertColumns(
    columnsDefinitions,
    columnModel,
    start,
    end,
    maxColumns
) {
    const columns = [];
    for (let index = 1; index <= maxColumns; index++) {
        columns.push(columnModel(index));
    }
    return [
        ...columnsDefinitions.slice(0, start),
        ...columns,
        ...columnsDefinitions.slice(end),
    ];
}

const total_column = {
    bottomCalc: "sum",
    bottomCalcParams: { precision: 2 },
    bottomCalcFormatter: "money",
    bottomCalcFormatterParams: sun_currency_formatter.formatterParams,
};

const partial_total_column = (start, end) => {
    return {
        ...total_column,
        bottomCalc: function (values, data, calcParams) {
            let calc = 0.0;
            values.slice(start, end).forEach(function (value) {
                value = parseFloat(value);
                calc += isNaN(value) ? 0 : value;
            });
            return calc.toFixed(calcParams.precision);
        },
    };
};

const calcTitle = (title) => {
    return (values, data, calcParams) => {
        return title;
    };
};

const makeEditableCells = (...rows) => {
    return {
        editable: function (cell) {
            return rows.some(function (row) {
                if (cell.getRow()._row.type !== "calc") {
                    return cell.getRow().getIndex() === row;
                } else {
                    return false;
                }
            });
        },
    };
};

function filterColumns(data, start, end) {
    return data
        .filter((row) => row.spare === undefined)
        .map((row) => Object.fromEntries(Object.entries(row).slice(start, end)));
}

function getColumns(id) {
    const value = parseInt(document.getElementById(id).value);
    return isNaN(value) ? 1 : value;
}

function addColumns(id, numColumns) {
    const trigger = document.getElementById(id);
    trigger.value = numColumns;
    trigger.dispatchEvent(new Event("input", { bubbles: true }));
}

function getData(table) {
    const data = table.getData();
    if (table.spareRow) {
        data.pop();
    }
    return data;
}

async function deleteAllRows(table) {
    const rows = table.getRows();
    const deletePromises = rows.map((row) => row.delete());
    await Promise.all(deletePromises);
}

const GASTOS_GENERALES_SUMA_COLUMN = "100";
const COTIZACIONES_MENOR_PRECIO_PARCIAL = "28";

const tbl_insumos_model = (id_elem) => {
    return {
        id: id_elem,
        formulas: {
            6: (row) => {
                return `=+D${row}*F${row}`;
            },
            7: (row) => {
                return `=+E${row}*F${row}`;
            },
            8: (row) => {
                return `=+D${row}-E${row}`;
            },
        },
        spareRow: true,
        config: {
            columns: [
                {
                    title: "INSUMOS PRECIO DEL EXPEDIENTE" || "INSUMOS PRECIO DEL TRANSPORTE",
                    columns: [
                        {
                            title: "ITEM",
                            field: "0",
                            formatter: "rownum",
                        },
                        {
                            title: "DESCRIPCIÓN",
                            field: "1",
                            hozAlign: "left",
                            editor: "input",
                        },
                        {
                            title: "UND.",
                            field: "2",
                            editor: "input",
                        },
                        {
                            title: "CANTIDAD EXP.",
                            field: "3",
                            editor: "number",
                        },
                        {
                            title: "CANTIDAD CORREGIDA",
                            field: "4",
                            editor: "number",
                        },
                        {
                            title: "PRECIO EXP.",
                            field: "5",
                            editor: "number",
                            ...sun_currency_formatter,
                            bottomCalc: calcTitle("SUBTOTAL"),
                        },
                        {
                            title: "PARCIAL EXP.",
                            field: "6",
                            ...sun_currency_formatter,
                            ...total_column,
                        },
                        {
                            title: "PARCIAL CORREG.",
                            field: "7",
                            ...sun_currency_formatter,
                            ...total_column,
                        },
                    ],
                },
                {
                    title: "VARIACION DE MATERIAL",
                    field: "8",
                    formatter: make_round_formatter(4),
                },
            ],
        },
    };
};

var cotizacionModel = (index) => {
    return {
        title: `COTIZACION ${index}`,
        columns: [
            {
                title: "PROVEEDOR",
                field: `${2 * (index - 1) + 1 + 6}`,
                editor: "input",
            },
            {
                title: "P.U.",
                field: `${2 * (index - 1) + 1 + 7}`,
                ...sun_currency_formatter,
                editor: "number",
            },
        ],
    };
};

const tbl_cotizaciones_model = function (id_elem) {
    return {
        id: id_elem,
        formulas: {
            6: (row) => {
                return `=+E${row}*F${row}`;
            },
            28: (row) => {
                return `=+AA${row}*AB${row}`;
            },
            27: (row) => {
                const columns = [];
                for (
                    let index = "I".charCodeAt(0);
                    index <= "Z".charCodeAt(0);
                    index += 2
                ) {
                    columns.push(`${String.fromCharCode(index)}${row}`);
                }
                return "=+MIN(" + columns.join() + ")";
            },
            26: (row) => {
                return `=+E${row}`;
            },
        },
        config: {
            columns: [
                {
                    title: "CENTRO DE SALUD PUCAJAGA",
                    columns: [
                        {
                            title: "REQUERIEMIENTO",
                            columns: [
                                { title: "ITEM", field: "0", formatter: "rownum" },
                                { title: "DESCRIPCIÓN", field: "1", hozAlign: "left" },
                                { title: "UND.", field: "2" },
                                {
                                    title: "COTIZACIÓN CON PRECIO DE EXPEDIENTE CORREGIDO",
                                    columns: [
                                        {
                                            title: "CANTIDAD PRESUPUESTADA",
                                            field: "3",
                                        },
                                        {
                                            title: "CANTIDAD CORREGIDA",
                                            field: "4",
                                        },
                                        {
                                            title: "PRECIO",
                                            field: "5",
                                            ...sun_currency_formatter,
                                            bottomCalc: calcTitle("SUBTOTAL"),
                                        },
                                        {
                                            title: "PARCIAL",
                                            field: "6",
                                            ...sun_currency_formatter,
                                            ...total_column,
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            title: "COTIZACION",
                            columns: [cotizacionModel(1)],
                        },
                        {
                            title: "A COMPRAR EL MENOR PRECIO",
                            columns: [
                                { title: "CANTIDAD", field: "26" },
                                {
                                    title: "P.U.",
                                    field: "27",
                                    ...sun_currency_formatter,
                                    bottomCalc: calcTitle("SUBTOTAL"),
                                },
                                {
                                    title: "PARCIAL",
                                    field: COTIZACIONES_MENOR_PRECIO_PARCIAL,
                                    ...sun_currency_formatter,
                                    ...total_column,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    };
};

const tbl_materiales_expediente_model = function (id_elem) {
    return {
        id: id_elem,
        formulas: {
            5: (row) => {
                return `=+D${row}*E${row}`;
            },
            8: (row) => {
                return `=+G${row}*H${row}`;
            },
            11: (row) => {
                return `=+J${row}*K${row}`;
            },
        },
        spareRow: true,
        config: {
            columns: [
                {
                    title: "TRABAJOS A REALIZAR",
                    columns: [
                        {
                            title: "INDICE",
                            field: "0",
                            hozAlign: "left",
                            editor: "input",
                        },
                        {
                            title: "DESCRIPCIÓN",
                            field: "1",
                            hozAlign: "left",
                            editor: "input",
                        },
                        {
                            title: "UND.",
                            field: "2",
                            editor: "input",
                        },
                    ],
                },
                {
                    title: "PRECIO Y CANTIDAD DEL EXPEDIENTE",
                    columns: [
                        {
                            title: "CANT.",
                            field: "3",
                            editor: "number",
                        },
                        {
                            title: "P.U.",
                            field: "4",
                            editor: "number",
                            bottomCalc: calcTitle("TOTAL"),
                        },
                        {
                            title: "PARCIAL",
                            field: "5",
                            ...sun_currency_formatter,
                            ...total_column,
                        },
                    ],
                },
            ],
        },
    };
};

var envioModel = (index) => {
    const cantIndex = 3 * (index - 1) + 1 + 6;
    const puIndex = 3 * (index - 1) + 1 + 7;
    const parcialIndex = 3 * (index - 1) + 1 + 8;
    return {
        title: `ENVIO ${index}`,
        formulas: {
            [parcialIndex]: (row) => {
                console.log(row);
                return `=+${excelColumn(cantIndex)}${row}*${excelColumn(
                    puIndex
                )}${row}`;
            },
        },
        columns: [
            {
                title: "CANT.",
                field: `${cantIndex}`,
                editor: "number",
            },
            {
                title: "P.U.",
                field: `${puIndex}`,
                editor: "number",
                bottomCalc: calcTitle("TOTAL"),
            },
            {
                title: "PARCIAL",
                field: `${parcialIndex}`,
                ...total_column,
                ...sun_currency_formatter,
            },
        ],
    };
};

const tbl_materiales_model = function (id_elem) {
    return {
        id: id_elem,
        formulas: {
            6: (row) => {
                return `=+E${row}*F${row}`;
            },
            9: (row) => {
                return `=+H${row}*I${row}`;
            },
            12: (row) => {
                return `=+K${row}*L${row}`;
            },
            15: (row) => {
                return `=+N${row}*O${row}`;
            },
            18: (row) => {
                return `=+Q${row}*R${row}`;
            },
            21: (row) => {
                return `=+T${row}*U${row}`;
            },
            24: (row) => {
                return `=+W${row}*X${row}`;
            },
            27: (row) => {
                return `=+Z${row}*ZA${row}`;
            }
        },
        spareRow: true,
        config: {
            columns: [
                {
                    title: "TRABAJOS A REALIZAR",
                    columns: [
                        {
                            title: "INDICE",
                            field: "0",
                            hozAlign: "left",
                            editor: "input",
                        },
                        {
                            title: "DESCRIPCIÓN",
                            field: "1",
                            hozAlign: "left",
                            editor: "input",
                        },
                        {
                            title: "FECHA",
                            field: "2",
                            editor: "date",
                        },
                        {
                            title: "UND.",
                            field: "3",
                            editor: "input",
                        },
                    ],
                },
                {
                    title: "PRECIO COTIZADO Y CANTIDAD CORREGIDA",
                    columns: [
                        {
                            title: "CANT.",
                            field: "4",
                            editor: "number",
                        },
                        {
                            title: "P.U.",
                            field: "5",
                            bottomCalc: calcTitle("TOTAL"),
                            editor: "number",
                        },
                        {
                            title: "PARCIAL",
                            field: "6",
                            ...sun_currency_formatter,
                            ...total_column,
                        },
                    ],
                },
                envioModel(1),
            ],
        },
    };
};

const tbl_presupuesto_mano_de_obra_model = function (id_elem) {
    return {
        id: id_elem,
        formulas: {
            6: (row) => {
                return `=+E${row}*F${row}`;
            },
            8: (row) => {
                return `=+G${row}*H${row}`;
            },
            11: (row) => {
                return `=+J${row}*K${row}`;
            },
        },
        spareRow: true,
        config: {
            columns: [
                {
                    title: "ITEM",
                    field: "0",
                    hozAlign: "left",
                    editor: "input",
                },
                {
                    title: "DESCRIPCIÓN",
                    field: "1",
                    hozAlign: "left",
                    editor: "input",
                },
                {
                    title: "FECHA",
                    field: "2",
                    editor: "date",
                },
                {
                    title: "UND.",
                    field: "3",
                    editor: "input",
                },
                {
                    title: "CANT.",
                    field: "4",
                    editor: "number",
                },
                {
                    title: "PRECIO",
                    field: "5",
                    editor: "number",
                    ...sun_currency_formatter,
                    bottomCalc: calcTitle("TOTAL"),
                },
                {
                    title: "PARCIAL",
                    field: "6",
                    ...sun_currency_formatter,
                    ...total_column,
                },
            ],
        },
    };
};

var maestroModel = (index) => {
    return {
        title: `MAESTRO ${index}`,
        columns: [
            {
                title: "PARCIAL",
                field: `${6 + index}`,
                editor: "number",
                ...sun_currency_formatter,
                ...total_column,
            },
        ],
    };
};

const tbl_mano_de_obra_model = function (id_elem) {
    return {
        id: id_elem,
        formulas: {
            6: (row) => {
                return `=+E${row}*F${row}`;
            },
        },
        config: {
            columns: [
                {
                    title: "TRABAJOS A REALIZAR",
                    columns: [
                        {
                            title: "INDICE",
                            field: "0",
                            hozAlign: "left",
                        },
                        {
                            title: "DESCRIPCIÓN",
                            field: "1",
                            hozAlign: "left",
                        },
                        {
                            title: "FECHA",
                            field: "2",
                        },
                        {
                            title: "UND.",
                            field: "3",
                        },
                        {
                            title: "CANT.",
                            field: "4",
                            editor: "number",
                        },
                        {
                            title: "P.U.",
                            field: "5",
                            editor: "number",
                            bottomCalc: calcTitle("TOTAL"),
                            ...sun_currency_formatter,
                        },
                    ],
                },
                {
                    title: "MANO DE OBRA EXPEDIENTE",
                    columns: [
                        {
                            title: "PARCIAL",
                            field: "6",
                            ...sun_currency_formatter,
                            ...total_column,
                        },
                    ],
                },
                maestroModel(1),
            ],
        },
    };
};

const tbl_equipo_expediente_model = function (id_elem) {
    return {
        id: id_elem,
        formulas: {
            5: (row) => {
                return `=+D${row}*(E${row})`;
            },
            8: (row) => {
                return `=+G${row}*H${row}`;
            },
            11: (row) => {
                return `=+J${row}*K${row}`;
            },
        },
        spareRow: true,
        config: {
            columns: [
                {
                    title: "TRABAJOS A REALIZAR",
                    columns: [
                        {
                            title: "INDICE",
                            field: "0",
                            hozAlign: "left",
                            editor: "input",
                        },
                        {
                            title: "DESCRIPCIÓN",
                            field: "1",
                            hozAlign: "left",
                            editor: "input",
                        },
                        {
                            title: "UND.",
                            field: "2",
                            editor: "input",
                        },
                    ],
                },
                {
                    title: "PRECIO Y CANTIDAD DEL EXPEDIENTE",
                    columns: [
                        {
                            title: "DIAS.",
                            field: "3",
                            editor: "number",
                        },
                        {
                            title: "H.E.",
                            field: "4",
                            editor: "number",
                            bottomCalc: calcTitle("TOTAL"),
                        },
                        {
                            title: "PARCIAL",
                            field: "5",
                            ...sun_currency_formatter,
                            ...total_column,
                        },
                    ],
                },
            ],
        },
    };
};

const tbl_equipo_model = function (id_elem) {
    return {
        id: id_elem,
        formulas: {
            6: (row) => {
                return `=+E${row}*F${row}`;
            },
            8: (row) => {
                return `=+G${row}*H${row}`;
            },
            11: (row) => {
                return `=+J${row}*K${row}`;
            },
        },
        spareRow: true,
        config: {
            columns: [
                {
                    title: "TRABAJOS A REALIZAR",
                    columns: [
                        {
                            title: "INDICE",
                            field: "0",
                            hozAlign: "left",
                            editor: "input",
                        },
                        {
                            title: "DESCRIPCIÓN",
                            field: "1",
                            hozAlign: "left",
                            editor: "input",
                        },
                        {
                            title: "FECHA.",
                            field: "2",
                            editor: "date",
                        },
                        {
                            title: "UND.",
                            field: "3",
                            editor: "input",
                        },
                    ],
                },
                {
                    title: "PRECIO Y CANTIDAD DEL EXPEDIENTE",
                    columns: [
                        {
                            title: "DIAS.",
                            field: "4",
                            editor: "number",
                        },
                        {
                            title: "P.U.",
                            field: "5",
                            editor: "number",
                            bottomCalc: calcTitle("TOTAL"),
                        },
                        {
                            title: "PARCIAL",
                            field: "6",
                            ...sun_currency_formatter,
                            ...total_column,
                        },
                    ],
                },
            ],
        },
    };
};

var dayModel = (index) => {
    return {
        title: `Dia ${index}`,
        field: `${index}`,
        editor: "number",
        hozAlign: "center",
        ...sun_currency_formatter,
    };
};

const tbl_gastos_generales_model = function (id_elem) {
    return {
        id: id_elem,
        formulas: {
            [GASTOS_GENERALES_SUMA_COLUMN]: (row) => {
                return `=+SUM(B${row}:AAA${row})`;
            },
        },
        data: [
            ["SCTR"],
            ["RESIDENTE"],
            ["ADMIN"],
            ["LOGISTICO"],
            ["JEFE DE AREA"],
            ["ASIATENTE"],
            ["CONTADOR"],
            ["IMPRESION"],
            ["ALOJAMIENTO"],
            ["INTERNET"],
            ["DESAYUNO"],
            ["ALMUERZO"],
            ["CENA"],
        ],
        config: {
            columns: [
                {
                    title: "GASTOS GENERALES",
                    columns: [
                        {
                            title: "DIAS",
                            field: "0",
                            hozAlign: "left",
                            headerSort: false,
                            ...bold_formatter(),
                            titleFormatter: function (cell, formatterParams, onRendered) {
                                window["addDays_tbl_gastos_generales"] = (event) => {
                                    const maxColumns = (this.dayInput = parseInt(
                                        event.target.value
                                    ));
                                    const dayColumn = cell.getTable().getColumnDefinitions();
                                    dayColumn[0].columns = insertColumns(
                                        dayColumn[0].columns,
                                        dayModel,
                                        1,
                                        dayColumn[0].columns.length - 1,
                                        maxColumns
                                    );
                                    cell.getTable().setColumns(dayColumn);
                                };
                                return `
                  <form action="#" onsubmit="return false;">
                    <div style="display: flex; align-items: center;">
                      <b>${cell.getValue() ?? ""}: </b>
                      <input
                        type="number"
                        min="1"
                        max="999"
                        step="1"
                        ${this.dayInput !== undefined
                                        ? `value="${this.dayInput}"`
                                        : `value="1"`
                                    }
                        oninput=addDays_tbl_gastos_generales(event)
                        style="width: 60px; margin-right: 5px; padding: 5px; border: 1px solid #ccc; border-radius: 4px;"
                        id="addDays"
                        required
                      />
                    </div>
                  </form>`;
                            },
                        },
                        {
                            ...dayModel(1),
                        },
                        {
                            title: "SUMA",
                            field: GASTOS_GENERALES_SUMA_COLUMN,
                            ...sun_currency_formatter,
                            ...total_column,
                        },
                    ],
                },
            ],
        },
    };
};

const tbl_resumen_general_model = function (id_elem) {
    return {
        id: id_elem,
        formulas: {
            1: (row) => {
                if (parseInt(row) === 4) {
                    return `=+B1+B2+B3`;
                } else {
                    return "";
                }
            },
            2: (row) => {
                if (parseInt(row) === 4) {
                    return `=+C1+C2+C3`;
                } else {
                    return "";
                }
            },
        },
        data: [
            ["MATERIALES", 0, 0],
            ["MANO DE OBRA", 0, 0],
            ["EQUIPOS Y HERRAMIENTAS", 0, 0],
            ["COSTO DIRECTO", 0, 0],
            ["GASTOS  GENERALES", 0, 0],
            ["UTILIDAD", 0, 0],
        ],
        config: {
            columns: [
                {
                    title: "RESUMEN GENERAL",
                    columns: [
                        {
                            title: "COMPONENTE",
                            field: "0",
                            hozAlign: "left",
                            bottomCalc: calcTitle("TOTAL"),
                            ...bold_formatter(),
                        },
                        {
                            title: "PRESUPUESTO EXPEDIENTE",
                            field: "1",
                            editor: "input",
                            ...makeEditableCells(5),
                            ...bold_formatter(3),
                            ...sun_currency_formatter,
                            ...partial_total_column(3, 6),
                        },
                        {
                            title: "PRESUPUESTO APROBADO",
                            field: "2",
                            ...bold_formatter(3),
                            ...sun_currency_formatter,
                            ...partial_total_column(3, 6),
                        },
                    ],
                },
            ],
        },
    };
};

const tbl_resumen_desagregado_model = function (id_elem) {
    return {
        id: id_elem,
        data: [
            ["MATERIALES"],
            ["MATERIALES", 0, 0],
            ["TRANSPORTE", 0, 0],
            ["MOVILIDAD", 0, 0],
            ["MANO DE OBRA"],
            ["SUBCONTRATO", 0, 0],
            ["EQUIPOS Y HERRAMIENTAS", 0, 0],
            ["COSTO DIRECTO", 0, 0],
            ["GASTOS  GENERALES", 0, 0],
            ["SCTR", 0, 0],
            ["RESIDENTE", 0, 0],
            ["ADMIN", 0, 0],
            ["LOGISTICO", 0, 0],
            ["JEFE de area", 0, 0],
            ["ASIATENTE", 0, 0],
            ["CONTADOR", 0, 0],
            ["IMPRESION", 0, 0],
            ["ALOJAMIENTO", 0, 0],
            ["INTERNET", 0, 0],
            ["DESAYUNO", 0, 0],
            ["ALMUERZO", 0, 0],
            ["CENA", 0, 0],
            ["UTILIDAD", 0, 0],
        ],
        config: {
            /* dataTree: true,
              dataTreeStartExpanded: true,
              dataTreeChildColumnCalcs: true, //include child rows in column calculations
              groupClosedShowCalcs: true,
              dataTreeChildField: "3", */
            columns: [
                {
                    title: "RESUMEN DESAGREGADO",
                    columns: [
                        {
                            title: "COMPONENTE",
                            field: "0",
                            hozAlign: "left",
                            bottomCalc: calcTitle("TOTAL"),
                            ...bold_formatter(0, 4, 6, 7, 8, 22),
                        },
                        {
                            title: "PRESUPUESTO EXPEDIENTE",
                            field: "1",
                            editor: "input",
                            ...makeEditableCells(...Array.from(Array(17), (_, i) => i + 6)),
                            ...sun_currency_formatter,
                            ...total_column,
                        },
                        {
                            title: "PRESUPUESTO APROBADO",
                            field: "2",
                            /* editor: "input",
                              ...makeEditableCells(...Array.from(Array(17), (_, i) => i + 7)), */
                            ...sun_currency_formatter,
                            ...total_column,
                        },
                    ],
                },
            ],
        },
    };
};

var tbl_insumos = tbl_insumos_model("#tbl_insumos");
var tbl_insumos_transporte = tbl_insumos_model("#tbl_insumos_transporte");
var tbl_cotizaciones = tbl_cotizaciones_model("#tbl_cotizaciones");
var tbl_cotizaciones_transporte = tbl_cotizaciones_model(
    "#tbl_cotizaciones_transporte"
);
var tbl_materiales_expediente = tbl_materiales_expediente_model("#tbl_materiales_expediente");
var tbl_materiales = tbl_materiales_model("#tbl_materiales");

var tbl_presupuesto_mano_de_obra = tbl_presupuesto_mano_de_obra_model(
    "#tbl_presupuesto_mano_de_obra"
);
var tbl_mano_de_obra = tbl_mano_de_obra_model("#tbl_mano_de_obra");

var tbl_equipo_expediente = tbl_equipo_expediente_model("#tbl_equipo_expediente");
var tbl_equipos = tbl_equipo_model("#tbl_equipos");

var tbl_gastos_generales = tbl_gastos_generales_model("#tbl_gastos_generales");
var tbl_resumen_general = tbl_resumen_general_model("#tbl_resumen_general");

var tbl_resumen_desagregado = tbl_resumen_desagregado_model(
    "#tbl_resumen_desagregado"
);

// Create a HyperFormula instance
var hf = HyperFormula.buildEmpty({
    licenseKey: "gpl-v3",
    chooseAddressMappingPolicy: HyperFormula.AlwaysSparse,
    useColumnIndex: true,
    evaluateNullToZero: true,
});

// set errors to use ""
var errors = hf._config.translationPackage.errors;
Object.keys(errors).forEach((error) => {
    errors[error] = "";
});

// TODO: auto column index
// TODO: auto column names
// TODO: delete spare row on sort
// TODO: undo/redo update formulas
function createSpreeadSheetTable(tableModel, sheetName) {
    const sheetID = hf.getSheetId(sheetName);
    const spareRow = tableModel.spareRow ?? false;
    const table = new Tabulator(tableModel.id, {
        // layout: "fitDataFill",
        layout: "fitDataStretch",
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
            headerHozAlign: "center",
            headerWordWrap: true,
            resizable: true,
        },
        ...tableModel.config,
    });

    function checkCellEdited(cell) {
        let isEditable = false;
        const columnDef = cell.getColumn().getDefinition();
        if (typeof columnDef.editable === "function") {
            isEditable = columnDef.editable(cell);
        } else {
            isEditable = columnDef.editor !== undefined;
        }
        if (!isEditable) {
            cell.restoreOldValue();
            /* const value = cell.getOldValue() ?? "";
              table.updateData([{ id: rowPos, [`${colPos}`]: value }]); */
        }
        return isEditable;
    }

    /* table.on("rowUpdated", function (row) {
        //row - row component
        console.log("rowUpdated");
      }); */

    table.on("cellEdited", function (cell) {
        const colPos = parseInt(cell.getColumn().getField());
        const rowPos = parseInt(cell.getRow().getIndex());
        if (!checkCellEdited(cell)) {
            return;
        }
        // add a empty row if its needed to add dinamically to the bottom
        if (cell.getRow().getData().spare !== undefined && cell.getValue() !== "") {
            delete cell.getRow().getData().spare;
            table.addRow({ spare: true }, false);
        }
        const address = { sheet: sheetID, col: colPos, row: rowPos };
        if (
            cell.getValue() != hf.getCellValue(address) &&
            !hf.doesCellHaveFormula(address)
        ) {
            hf.setCellContents(address, cell.getValue())
                .filter((update) => {
                    return (
                        hf.simpleCellAddressToString(
                            update.address,
                            update.address.sheet
                        ) !== hf.simpleCellAddressToString(address, address.sheet)
                    );
                })
                .forEach((update) => {
                    const isInSheet = update.sheet === sheetID;
                    if (isInSheet) {
                        table.updateData([
                            {
                                id: update.address.row,
                                [`${update.address.col}`]: update.newValue,
                            },
                        ]);
                        /* table.getRow(update.address.row).getCell(update.address.col).setValue(update.newValue); */
                    }
                });
            //    // if cellAddress is within the table
            //    //  update the cell with the value (this should fire cellEdited again)
            //    // else
            //    //  update the html element
            //    //  const result = document.getElementById(id);
            //    //  const id = hf.simpleCellAddressToString(update.address, sheetID);
            //  });
        }
    });

    table.on("rowAdded", function (row) {
        const lastIndex = table.getRows().length - 1;
        row.update({ id: lastIndex });
        const rowPos = parseInt(lastIndex);
        Object.keys(tableModel.formulas ?? {}).forEach((col) => {
            const colPos = parseInt(col);
            const address = { sheet: sheetID, col: colPos, row: rowPos };
            const formula = tableModel.formulas[colPos](rowPos + 1) ?? "";
            if (formula !== "") {
                var updates = hf.setCellContents(address, formula);
                var updates_filter = updates.filter((update) => {
                    return (
                        hf.simpleCellAddressToString(
                            update.address,
                            update.address.sheet
                        ) === hf.simpleCellAddressToString(address, address.sheet)
                    );
                });
                updates_filter.forEach((update) => {
                    table.updateData([
                        {
                            id: update.address.row,
                            [`${update.address.col}`]: update.newValue,
                        },
                    ]);
                });
            }
        });
        if (row.getData().spare !== undefined) {
            return;
        }
        row.getCells().forEach(function (cell) {
            const colPos = parseInt(cell.getColumn().getField());
            const address = { sheet: sheetID, col: colPos, row: rowPos };
            if (!hf.doesCellHaveFormula(address)) {
                hf.setCellContents(address, cell.getValue())
                    .filter((update) => {
                        return (
                            hf.simpleCellAddressToString(
                                update.address,
                                update.address.sheet
                            ) !== hf.simpleCellAddressToString(address, address.sheet)
                        );
                    })
                    .forEach((update) => {
                        table.updateData([
                            {
                                id: update.address.row,
                                [`${update.address.col}`]: update.newValue,
                            },
                        ]);
                    });
            }
        });
    });

    // FIXME: fix pasting in non editable cells
    // TODO: use the tabulator clipboardCopyParser module to
    //       override the last empty row
    table.on("clipboardPasted", function (clipboard, rowData, rows) {
        if (clipboard.charAt(clipboard.length - 1) === "\n") {
            rowData = rowData.slice(0, rowData.length - 1);
        }
        let index = 0;
        let repeat = 0;
        for (; index < rows.length; index++) {
            Object.entries(rowData[repeat]).forEach(function ([colPos, value]) {
                if (rows[index].getData().spare !== undefined) {
                    delete rows[index].getData().spare;
                }
                const cell = rows[index].getCell(colPos);
                if (checkCellEdited(cell.component) && value !== "") {
                    cell.setValue(value + " ");
                }
            });
            repeat = (repeat + 1) % rowData.length;
        }
        if (rowData.length > rows.length && spareRow) {
            table.addRow(rowData.slice(index));
            table.addRow({ spare: true }, false);
        }
    });

    table.on("tableBuilt", function () {
        if (tableModel.data !== undefined) {
            table.addRow(tableModel.data);
            table.clearHistory();
        }
        if (spareRow) {
            table.addRow({ spare: true }, false);
        }
        table.on("columnsLoaded", function (columns) {
            //columns - All columns in the table
        });
    });
    table["spareRow"] = spareRow;
    return table;
}

var makeResultController = function (view, model, callbackCalculateResults) {
    return {
        init: function () {
            this.calculateResults();
            this.render();
        },
        render: function () {
            document.getElementById(model.id).innerHTML = view.render(model, this);
        },
        calculateResults: function () {
            callbackCalculateResults();
            this.render();
        },
    };
};

var makeGastosGeneralesResultController = function (
    view,
    model,
    callbackCalculateResults
) {
    return {
        init: function () {
            this.calculateResults();
            this.render();
        },
        render: function () {
            document.getElementById(model.id).innerHTML = view.render(model, this);
        },
        updateGastosGenerales(value) {
            value = parseFloat(value);
            model.total2.value = isNaN(value) ? 0 : value;
        },
        calculateResults: function () {
            callbackCalculateResults();
            this.render();
        },
    };
};

var insumos_result_model = {
    id: "tbl_insumos_result",
    total1: { name: "PRECIO DE INSUMOS DE EXPEDIENTE", value: 0, class: "block mt-1 w-full text-lg font-semibold" },
    total2: { name: "PRECIO DE INSUMOS CORREGIDOS DE EXPEDIENTE", value: 0, class: "block mt-1 w-full text-lg font-semibold" },
    conclusion: "",
    result: 0,
};

var cotizaciones_result_model = {
    id: "tbl_cotizaciones_result",
    total1: {
        name: "COTIZACION CON INSUMOS CORREGIDOS Y PRECIO DEL EXPEDITEN",
        value: 0,
    },
    total2: { name: "COTIZACION CON MENOR PRECIO", value: 0 },
    conclusion: "",
    result: 0,
};

var presupuesto_mano_de_obra_result_model = {
    id: "tbl_presupuesto_mano_de_obra_result",
    costo_directo: {
        value: 0,
    },
    gastos_generales: {
        precent: 0.1,
        value: 0,
    },
    utilidad: {
        precent: 0.05,
        value: 0,
    },
    total: {
        value: 0,
    },
};

var mano_de_obra_result_model = {
    id: "tbl_mano_de_obra_result",
    total1: { name: "PRECIO DE MANO DE OBRA DE EXPEDIENTE", value: 0 },
    total2: { name: "PRECIO DE MANO DE OBRA DE SUBCONTRATO", value: 0 },
    conclusion: "",
    result: 0,
};

var gastos_generales_result_model = {
    id: "tbl_gastos_generales_result",
    total1: { name: "GASTOS GENERALES", value: 0 },
    total2: { name: "GASTOS GENERALES", value: 0 },
    conclusion: "",
    result: 0,
};

var result_view = {
    render: (result_model, controller) => {
        const calculate = `calculate_results_${result_model.id}`;
        window[calculate] = function (event) {
            event.preventDefault();
            controller.calculateResults();
        };
        return `<div class="result-container">
      <div class="form-group row">
          <label class="col-sm-8 col-form-label">${result_model.total1.name
            }</label>
          <div class="col-sm-4">
              <input type="text" readonly class="form-control-plaintext" value="${pen_formatter.format(
                result_model.total1.value
            )}">
          </div>
      </div>
      <div class="form-group row">
          <label class="col-sm-8 col-form-label">${result_model.total2.name
            }</label>
          <div class="col-sm-4">
              <input type="text" readonly class="form-control-plaintext" value="${pen_formatter.format(
                result_model.total2.value
            )}">
          </div>
      </div>
      <div class="form-group row">
          <label class="col-sm-4 col-form-label conclusion">CONCLUSION:</label>
          <div class="col-sm-4">
              <input type="text" readonly class="form-control-plaintext conclusion-value" value="${result_model.conclusion
            }">
          </div>
          <div class="col-sm-4">
              <input type="text" readonly class="form-control-plaintext conclusion-value" value="${pen_formatter.format(
                result_model.result
            )}">
          </div>
      </div>
      <div class="form-group row">
          <div class="col-sm-12 text-right">
              <button type="button" class="btn btn-primary" onclick="${calculate}(event)">RESULTADOS</button>
          </div>
      </div>
  </div>`;
    },
};

var gastos_result_view = {
    render: (result_model, controller) => {
        const calculate = `calculate_results_${result_model.id}`;
        const gastosTotalInput = `gastosTotalInput${result_model.id}`;
        window[gastosTotalInput] = function (event) {
            controller.updateGastosGenerales(event.target.value);
            controller.calculateResults();
        };
        window[calculate] = function (event) {
            event.preventDefault();
            controller.calculateResults();
        };
        return `<div class="result-container">
        <div class="form-group row">
            <label class="col-sm-8 col-form-label">${result_model.total1.name
            }</label>
            <div class="col-sm-4">
                <input type="text" readonly class="form-control-plaintext" value="${pen_formatter.format(
                result_model.total1.value
            )}">
            </div>
        </div>
        <div class="form-group row">
            <label class="col-sm-8 col-form-label">${result_model.total2.name
            }</label>
            <div class="col-sm-4">
                <input type="number" onchange="${gastosTotalInput}(event)" class="form-control" value="${result_model.total2.value
            }">
            </div>
        </div>
        <div class="form-group row">
            <label class="col-sm-4 col-form-label conclusion">CONCLUSION:</label>
            <div class="col-sm-4">
                <input type="text" readonly class="form-control-plaintext conclusion-value" value="${result_model.conclusion
            }">
            </div>
            <div class="col-sm-4">
                <input type="text" readonly class="form-control-plaintext conclusion-value" value="${pen_formatter.format(
                result_model.result
            )}">
            </div>
        </div>
        <div class="form-group row">
            <div class="col-sm-12 text-right">
                <button type="button" class="btn btn-primary" onclick="${calculate}(event)">RESULTADOS</button>
            </div>
        </div>
    </div>`;
    },
};

var presupuesto_mano_de_obra_result_view = {
    render: (result_model, controller) => {
        const calculate = `calculate_results_${result_model.id}`;
        window[calculate] = function (event) {
            event.preventDefault();
            controller.calculateResults();
        };
        return `
      <div class="result-container">
          <div class="form-group row">
              <label class="col-sm-8 col-form-label">Costo Directo</label>
              <div class="col-sm-4">
                  <input type="text" readonly class="form-control-plaintext" value="${pen_formatter.format(
            result_model.costo_directo.value
        )}">
              </div>
          </div>
          <div class="form-group row">
              <label class="col-sm-8 col-form-label">Gastos Generales (${(
                result_model.gastos_generales.precent * 100
            ).toFixed(2)}%)</label>
              <div class="col-sm-4">
                  <input type="text" readonly class="form-control-plaintext" value="${pen_formatter.format(
                result_model.gastos_generales.value
            )}">
              </div>
          </div>
          <div class="form-group row">
              <label class="col-sm-8 col-form-label">Utilidad (${(
                result_model.utilidad.precent * 100
            ).toFixed(2)}%)</label>
              <div class="col-sm-4">
                  <input type="text" readonly class="form-control-plaintext" value="${pen_formatter.format(
                result_model.utilidad.value
            )}">
              </div>
          </div>
          <div class="form-group row">
              <label class="col-sm-8 col-form-label conclusion">TOTAL:</label>
              <div class="col-sm-4">
                  <input type="text" readonly class="form-control-plaintext conclusion-value" value="${pen_formatter.format(
                result_model.total.value
            )}">
              </div>
          </div>
          <div class="form-group row">
              <div class="col-sm-12 text-right">
                  <button type="button" class="btn btn-primary" onclick="${calculate}(event)">GENERAR MANO DE OBRA</button>
              </div>
          </div>
      </div>`;
    },
};

function ganaOPierde(conclusion) {
    if (conclusion < 0) {
        return "SE PIERDE";
    } else if (conclusion > 0) {
        return "SE GANA";
    } else {
        return "NO SE GANA NI SE PIERDE";
    }
}

function makeCalculateResult(tbl1, tbl2, column1, column2, model) {
    return () => {
        const total1 = tbl1?.getCalcResults?.()?.bottom ?? {
            [column1]: 0,
            [column2]: 0,
        };
        const total2 = tbl2?.getCalcResults?.()?.bottom ?? {
            [column1]: 0,
            [column2]: 0,
        };
        const result1 = parseFloat(total1[column1]) + parseFloat(total2[column1]);
        const result2 = parseFloat(total1[column2]) + parseFloat(total2[column2]);
        const conclusion = result1 - result2;
        model.total1.value = result1;
        model.total2.value = result2;

        model.result = conclusion;
        model.conclusion = ganaOPierde(conclusion);
    };
}

function linkTables(dataIn, tblOut, columnStart, columnEnd) {
    deleteAllRows(tblOut);
    tblOut.addData(filterColumns(dataIn, columnStart, columnEnd));
    tblOut.clearHistory();
}

document.addEventListener("DOMContentLoaded", () => {
    Array.from(document.getElementsByClassName("collapsible-btn")).forEach(
        (show_btn) => {
            show_btn.addEventListener("click", () => {
                var targetId = show_btn.getAttribute("data-target");
                document.getElementById(targetId)?.classList.toggle("d-none");
            });
        }
    );

    hf.addSheet("INSUMOS");
    hf.addSheet("INSUMOS_TRANSPORTE");
    hf.addSheet("COTIZACIONES");
    hf.addSheet("COTIZACIONES_TRANSPORTE");
    hf.addSheet("MATERIALES_EXPEDIENTE");
    hf.addSheet("MATERIALES");
    hf.addSheet("PRESUPUESTO_MANO_DE_OBRA");
    hf.addSheet("MANO_DE_OBRA");
    hf.addSheet("EQUIPO_EXPEDIENTE");
    hf.addSheet("EQUIPO");
    hf.addSheet("GASTOS_GENERALES");
    hf.addSheet("RESUMEN_GENERAL");
    hf.addSheet("RESUMEN_DESAGREGADO");
    
    const insumos = createSpreeadSheetTable(tbl_insumos, "INSUMOS");
    const insumos_transporte = createSpreeadSheetTable(
        tbl_insumos_transporte,
        "INSUMOS_TRANSPORTE"
    );
    const cotizaciones = createSpreeadSheetTable(
        tbl_cotizaciones,
        "COTIZACIONES"
    );
    const cotizaciones_transporte = createSpreeadSheetTable(
        tbl_cotizaciones_transporte,
        "COTIZACIONES_TRANSPORTE"
    );
    const materialExpediente = createSpreeadSheetTable(tbl_materiales_expediente, "MATERIALES_EXPEDIENTE");
    const materiales = createSpreeadSheetTable(tbl_materiales, "MATERIALES");

    const presupuesto_mano_de_obra = createSpreeadSheetTable(
        tbl_presupuesto_mano_de_obra,
        "PRESUPUESTO_MANO_DE_OBRA"
    );
    const mano_de_obra = createSpreeadSheetTable(
        tbl_mano_de_obra,
        "MANO_DE_OBRA"
    );

    const equiposExpediente = createSpreeadSheetTable(tbl_equipo_expediente, "EQUIPO_EXPEDIENTE");

    const equipos = createSpreeadSheetTable(tbl_equipos, "EQUIPO");

    const gastos_generales = createSpreeadSheetTable(
        tbl_gastos_generales,
        "GASTOS_GENERALES"
    );
    const resumen_general = createSpreeadSheetTable(
        tbl_resumen_general,
        "RESUMEN_GENERAL"
    );
    const resumen_desagregado = createSpreeadSheetTable(
        tbl_resumen_desagregado,
        "RESUMEN_DESAGREGADO"
    );
    const insumos_result_controller = makeResultController(
        result_view,
        insumos_result_model,
        () => {
            makeCalculateResult(
                insumos,
                insumos_transporte,
                "6",
                "7",
                insumos_result_model
            )();
            linkTables(insumos.getData(), cotizaciones, 0, 6);
            linkTables(insumos_transporte.getData(), cotizaciones_transporte, 0, 6);
        }
    );

    function addCotizaciones(maxColumns) {
        const columns = tbl_cotizaciones.config.columns;
        const cotizacionesColumn = columns[0].columns[1].columns;
        columns[0].columns[1].columns = insertColumns(
            cotizacionesColumn,
            cotizacionModel,
            0,
            cotizacionesColumn.length,
            maxColumns
        );
        cotizaciones.setColumns(columns);
        cotizaciones_transporte.setColumns(columns);
    }

    function addEnvios(maxColumns) {
        // Obtener configuración actual de columnas
        const enviosColumn = tbl_materiales.config.columns;

        // Definir el índice de inicio de los envíos (después de las primeras columnas fijas)
        const startColumn = enviosColumn.findIndex(col => col.title.startsWith("ENVIO")) || enviosColumn.length;

        // Limpiar columnas previas de envíos
        tbl_materiales.config.columns = enviosColumn.slice(0, startColumn);

        // Agregar nuevas columnas de envíos
        for (let i = 1; i <= maxColumns; i++) {
            tbl_materiales.config.columns.push(envioModel(i));
        }
        // Actualizar estructura de la tabla
        materiales.setColumns(tbl_materiales.config.columns);
    }


    // function addEnvios(maxColumns) {
    //     const enviosColumn = tbl_materiales.config.columns;
    //     const startColumn = 3;
    //     const endColumn = enviosColumn.length;
    //     tbl_materiales.config.columns = insertColumns(
    //         enviosColumn,
    //         envioModel,
    //         startColumn,
    //         endColumn,
    //         maxColumns
    //     );
    //     console.log(tbl_materiales.config.columns);
    //     /* for (let index = startColumn; index < endColumn; index++) {
    //           tbl_materiales.formulas = Object.assign(tbl_materiales.formulas, envioModel(index).formulas);
    //         } */
    //     materiales.setColumns(tbl_materiales.config.columns);
    // }

    function addMaestros(maxColumns) {
        const maestrosColumn = tbl_mano_de_obra.config.columns;
        tbl_mano_de_obra.config.columns = insertColumns(
            maestrosColumn,
            maestroModel,
            2,
            maestrosColumn.length,
            maxColumns
        );
        mano_de_obra.setColumns(tbl_mano_de_obra.config.columns);
    }

    $(document).ready(function () {
        buscar_mantenimiento();
        function buscar_mantenimiento(consulta) {

            const dataSmantenimiento = document.getElementById('datamantemiento').value;
            console.log(dataSmantenimiento);
            const tableData = JSON.parse(dataSmantenimiento);
            const tablaParse = JSON.parse(tableData.data_mantenimiento);
            document.querySelector("#ficha #proyecto").value =
                tableData.nombre_proyecto_mant;
            document.querySelector("#ficha #propietario").value =
                tableData.propietario_mant;
            document.querySelector("#ficha #ubicacion").value =
                tableData.ubicacion_mant;
            document.querySelector("#ficha #fecha").value =
                tableData.fecha_pro_mant;

            setTimeout(() => {
                Object.entries(tablaParse.tables).forEach(([tbl_id, data]) => {
                    Tabulator.findTable(tbl_id)[0].clearData();
                    Tabulator.findTable(tbl_id)[0].addData(data);
                });
                console.log(tableData.materiales_mant);
                addColumns("addCotizaciones", tableData.cotizacion_mant);
                addColumns("addEnvios", tableData.materiales_mant);
                addColumns("addMaestros", tableData.mano_obra_mant);
                addColumns("addDays", tableData.gastos_generales);

                insumos.addRow({ spare: true });
                insumos_transporte.addRow({ spare: true });
                materialExpediente.addRow({ spare: true });
                materiales.addRow({ spare: true });
                presupuesto_mano_de_obra.addRow({ spare: true });
                equiposExpediente.addRow({ spare: true });
                equipos.addRow({ spare: true });
            }, 2000);
        }
    })

    document.getElementById("addCotizaciones").addEventListener("input", (event) => {
        const maxColumns = event.target.value;
        addCotizaciones(maxColumns);
    });

    const cotizaciones_result_controller = makeResultController(
        result_view,
        cotizaciones_result_model,
        makeCalculateResult(
            cotizaciones,
            cotizaciones_transporte,
            "6",
            COTIZACIONES_MENOR_PRECIO_PARCIAL,
            cotizaciones_result_model
        )
    );

    document.getElementById("addEnvios").addEventListener("input", (event) => {
        const maxColumns = event.target.value;
        addEnvios(maxColumns);
    });

    // document.getElementById("generar_mano_de_obra").addEventListener("click", () => {
    //     const materialesData = materiales
    //         .getData()
    //         .filter((row) => `${row[0]}`.trim() !== "");
    //     linkTables(materialesData, presupuesto_mano_de_obra, 0, 3);
    // });

    const presupuesto_mano_de_obra_result_controller = makeResultController(
        presupuesto_mano_de_obra_result_view,
        presupuesto_mano_de_obra_result_model,
        () => {
            const total = presupuesto_mano_de_obra?.getCalcResults?.()?.bottom ?? {
                5: 0,
            };
            const pmormdl = presupuesto_mano_de_obra_result_model;
            pmormdl.costo_directo.value = parseFloat(total[6]);
            pmormdl.gastos_generales.value =
                pmormdl.costo_directo.value * pmormdl.gastos_generales.precent;
            pmormdl.utilidad.value =
                pmormdl.costo_directo.value * pmormdl.utilidad.precent;
            pmormdl.total.value =
                pmormdl.costo_directo.value +
                pmormdl.gastos_generales.value +
                pmormdl.utilidad.value;
            linkTables(presupuesto_mano_de_obra.getData(), mano_de_obra, 0, 5);
        }
    );
    // FIXME: adding new maestros gives exception

    document.getElementById("addMaestros").addEventListener("input", (event) => {
        const maxColumns = event.target.value;
        addMaestros(maxColumns);
    });

    const mano_de_obra_result_controller = makeResultController(
        result_view,
        mano_de_obra_result_model,
        () => {
            const maestros = mano_de_obra.getCalcResults().bottom;
            let totales = Object.entries(maestros);
            totales = totales.slice(6, totales.length);
            const result = totales.reduce((min, current) => {
                const value1 = parseFloat(min[1]);
                let value2 = parseFloat(current[1]);
                value2 = isNaN(value2) ? value1 : value2;
                return value2 < value1 ? current : min;
            }, totales[0]);
            makeCalculateResult(
                mano_de_obra,
                null,
                "6",
                result[0],
                mano_de_obra_result_model
            )();
        }
    );

    const gastos_generales_result_controller = makeGastosGeneralesResultController(
        gastos_result_view,
        gastos_generales_result_model,
        () => {
            let suma_total_dias =
                gastos_generales?.getCalcResults?.()?.bottom?.[
                GASTOS_GENERALES_SUMA_COLUMN
                ] ?? 0;
            suma_total_dias = parseFloat(suma_total_dias);
            const conclusion =
                gastos_generales_result_model.total2.value - suma_total_dias;
            gastos_generales_result_model.total1.value = suma_total_dias;
            gastos_generales_result_model.result = conclusion;
            gastos_generales_result_model.conclusion = ganaOPierde(conclusion);
        }
    );

    document.getElementById("generar_resumen").addEventListener("click", () => {
        const {
            5: materiales_expediente,
        } = materialExpediente.getCalcResults().bottom;

        const {
            6: materiales_corregida,
            ..._
        } = materiales.getCalcResults().bottom;

        const {
            5: equipos_expediente,
        } = equiposExpediente.getCalcResults().bottom;

        const {
            6: equipos_corregidos,
        } = equipos.getCalcResults().bottom;

        const { 6: mano_de_obra_expediente, ...__ } =
            mano_de_obra.getCalcResults().bottom;
        const gastos_generales_total_dias =
            gastos_generales.getCalcResults().bottom[GASTOS_GENERALES_SUMA_COLUMN];
        const gastos_generales_input = gastos_generales_result_model.total2.value;
        const maestros = mano_de_obra.getCalcResults().bottom;
        let totales = Object.entries(maestros);
        totales = totales.slice(6, totales.length);
        const result = totales.reduce((min, current) => {
            const value1 = parseFloat(min[1]);
            let value2 = parseFloat(current[1]);
            value2 = isNaN(value2) ? value1 : value2;
            return value2 < value1 ? current : min;
        }, totales[0]);
        const maestro_min = mano_de_obra.getCalcResults().bottom[result[0]];
        const resumen_general_columns = [
            {
                id: 0,
                0: "MATERIALES",
                1: materiales_expediente,
                2: materiales_corregida,
            },
            {
                id: 1,
                0: "MANO DE OBRA",
                1: mano_de_obra_expediente,
                2: maestro_min,
            },
            {
                id: 2,
                0: "EQUIPOS Y HERRAMIENTAS",
                1: equipos_expediente,
                2: equipos_corregidos,
            },
            { id: 3, 0: "COSTO DIRECTO" },
            {
                id: 4,
                0: "GASTOS  GENERALES",
                1: gastos_generales_input,
                2: gastos_generales_total_dias,
            },
            { id: 5, 0: "UTILIDAD" },
        ];

        deleteAllRows(resumen_general);
        resumen_general.addData(resumen_general_columns);

        const aprobado_transporte =
            cotizaciones_transporte.getData()?.[0]?.[
            COTIZACIONES_MENOR_PRECIO_PARCIAL
            ] ?? 0;
        const aprobado_movilidad =
            cotizaciones_transporte.getData()?.[1]?.[
            COTIZACIONES_MENOR_PRECIO_PARCIAL
            ] ?? 0;

        const expediente_transporte = insumos_transporte.getData()?.[0]?.[6] ?? 0;
        const expediente_movilidad = insumos_transporte.getData()?.[1]?.[6] ?? 0;

        // DESAGREGADO: DATOS GENERALES
        const resumen_desagregado_data = [
            { id: 0, 0: "MATERIALES" },
            {
                id: 1,
                0: "Materiales",
                1: materiales_expediente - expediente_transporte - expediente_movilidad,
                2: materiales_corregida - aprobado_transporte - aprobado_movilidad,
            },
            { 0: "Transporte", 1: expediente_transporte, 2: aprobado_transporte },
            { 0: "Movilidad", 1: expediente_movilidad, 2: aprobado_movilidad },
            { 0: "MANO DE OBRA" },
            { 0: "Subcontrato", 1: mano_de_obra_expediente, 2: maestro_min },
            {
                0: "EQUIPOS Y HERRAMIENTAS",
                1: equipos_expediente,
                2: equipos_corregidos,
            },
            { 0: "COSTO DIRECTO", 1: 0, 2: 0 },
            { 0: "GASTOS  GENERALES", 1: 0, 2: 0 },
            { 0: "SCTR", 1: 0, 2: 0 },
            { 0: "Residente", 1: 0, 2: 0 },
            { 0: "Admin", 1: 0, 2: 0 },
            { 0: "Logistico", 1: 0, 2: 0 },
            { 0: "Jefe de area", 1: 0, 2: 0 },
            { 0: "Asiatente", 1: 0, 2: 0 },
            { 0: "Contador", 1: 0, 2: 0 },
            { 0: "Impresion", 1: 0, 2: 0 },
            { 0: "Alojamiento", 1: 0, 2: 0 },
            { 0: "Internet", 1: 0, 2: 0 },
            { 0: "DESAYUNO", 1: 0, 2: 0 },
            { 0: "ALMUERZO", 1: 0, 2: 0 },
            { 0: "CENA", 1: 0, 2: 0 },
            { 0: "UTILIDAD", 1: 0 },
        ];

        // DESAGREGADO: DATOS GENERALES
        const gastos_generales_totales = gastos_generales.getData().map((row) => {
            return row[GASTOS_GENERALES_SUMA_COLUMN];
        });
        resumen_desagregado_data
            .slice(9, resumen_desagregado_data.length - 1)
            .forEach((gasto, index) => {
                gasto[2] = gastos_generales_totales[index];
            });

        deleteAllRows(resumen_desagregado);
        resumen_desagregado.addData(resumen_desagregado_data);
    });

    setTimeout(() => {
        insumos_result_controller.init();
        cotizaciones_result_controller.init();
        presupuesto_mano_de_obra_result_controller.init();
        mano_de_obra_result_controller.init();
        gastos_generales_result_controller.init();
    }, 500);

    // TODO: add a model and a view for the tables the model probably will have
    document.getElementById("guardar").addEventListener("click", () => {

        // Obtener el ID usando el nombre correcto del campo
        const id_mantimiento = $('#id_mantenimiento').val();

        const data = {
            tables: {
                [tbl_insumos.id]: getData(insumos),
                [tbl_insumos_transporte.id]: getData(insumos_transporte),
                [tbl_cotizaciones.id]: getData(cotizaciones),
                [tbl_cotizaciones_transporte.id]: getData(cotizaciones_transporte),
                [tbl_materiales_expediente.id]: getData(materialExpediente),
                [tbl_materiales.id]: getData(materiales),
                [tbl_presupuesto_mano_de_obra.id]: getData(presupuesto_mano_de_obra),
                [tbl_mano_de_obra.id]: getData(mano_de_obra),
                [tbl_equipo_expediente.id]: getData(equiposExpediente),
                [tbl_equipos.id]: getData(equipos),
                [tbl_gastos_generales.id]: getData(gastos_generales),
                [tbl_resumen_general.id]: getData(resumen_general),
                [tbl_resumen_desagregado.id]: getData(resumen_desagregado),
            },
        };

        const tableData = JSON.stringify(data, (key, value) => (value === null ? undefined : value));

        // Preparar los datos para enviar
        const requestData = JSON.stringify({
            id_mantimiento: id_mantimiento,
            data_mantenimiento: tableData
        });
        console.log(requestData);
        $.ajax({
            type: 'PUT',
            url: '/actualizarmantenimiento',
            data: requestData,
            contentType: 'application/json',
            processData: false,
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
                'Accept': 'application/json'
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
    // document.getElementById("ficha").addEventListener("submit", (event) => {
    //     alert("hear");
    //     event.preventDefault();



    //     return false;
    // });
});
