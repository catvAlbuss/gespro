export function createSpreeadSheetTable(tableModel) {
  const spareRow = tableModel.spareRow ?? false;
  const table = new Tabulator(tableModel.id, {
    columnHeaderVertAlign: "middle", //align header contents to bottom of cell
    //enable range selection
    selectableRange: 1,
    //selectableRangeColumns: true,
    //selectableRangeRows: true,
    //selectableRangeClearCells: true,

    //change edit trigger mode to make cell navigation smoother
    editTriggerEvent: "dblclick",

    //configure clipboard to allow copy and paste of range format data
    clipboard: true,
    clipboardCopyStyled: false,
    clipboardCopyConfig: {
      rowHeaders: false,
      columnHeaders: false,
    },
    clipboardCopyRowRange: "range",
    clipboardPasteParser: "range",
    clipboardPasteAction: "range",
    columnDefaults: {
      hozAlign: "center",
      headerHozAlign: "center",
      headerWordWrap: true,
      resizable: false,
    },
    ...tableModel.config,
  });

  table.on("cellEdited", function (cell) {
    const rowPos = parseInt(cell.getRow().getIndex());
    const colPos = parseInt(cell.getColumn().getField());
    const rows = cell.getTable().getRows().length;
    // add a empty row if its needed to add dinamically to the bottom
    if (cell.getRow().getData().spare !== undefined && cell.getValue() !== "") {
      delete cell.getRow().getData().spare;
      table.addRow({ spare: true }, false);
    }
  });

  table.on("rowAdded", function (row) {
    const lastIndex = table.getRows().length - 1;
    row.update({ id: lastIndex });
    const rowPos = parseInt(lastIndex);
    if (row.getData().spare !== undefined) {
      return;
    }
  });

  table.on("tableBuilt", function () {
    table.addRow(tableModel.data);
    if (spareRow) {
      table.addRow({ spare: true }, false);
    }
  });

  table.on("clipboardPasted", function (clipboard, rowData, rows) {
    let index = 0;
    for (index = 0; index < rows.length; index++) {
      Object.entries(rowData[index]).forEach(function ([colPos, value]) {
        if (rows[index].getData().spare !== undefined) {
          delete rows[index].getData().spare;
        }
        rows[index].getCell(colPos).setValue(value + " ");
      });
    }
    for (; index < rowData.length; index++) {
      table.addRow(rowData[index], false);
    }
    if (rowData.length > rows.length && spareRow) {
      table.addRow({ spare: true }, false);
    }
  });
  return table;
}