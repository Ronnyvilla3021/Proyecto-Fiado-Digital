const ExcelJS = require('exceljs');

// Genera un archivo Excel genérico a partir de columnas y filas, y lo envía como respuesta HTTP
const generarExcel = async (res, { nombreHoja, columnas, filas, nombreArchivo }) => {
  const workbook = new ExcelJS.Workbook();
  const hoja = workbook.addWorksheet(nombreHoja);

  hoja.columns = columnas; // [{ header: 'Nombre', key: 'nombre', width: 20 }, ...]

  filas.forEach((fila) => hoja.addRow(fila));

  // Estilo simple para el encabezado
  hoja.getRow(1).font = { bold: true };
  hoja.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD9D9D9' },
  };

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', `attachment; filename=${nombreArchivo}.xlsx`);

  await workbook.xlsx.write(res);
  res.end();
};

module.exports = generarExcel;