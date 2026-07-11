const PDFDocument = require('pdfkit');

// Genera un PDF genérico tipo tabla, a partir de columnas y filas
const generarPDF = (res, { titulo, columnas, filas, nombreArchivo }) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${nombreArchivo}.pdf`);

  doc.pipe(res);

  // Título
  doc.fontSize(16).text(titulo, { align: 'center' });
  doc.moveDown();
  doc.fontSize(9).fillColor('gray').text(`Generado: ${new Date().toLocaleString('es-EC')}`, { align: 'center' });
  doc.moveDown(1.5);
  doc.fillColor('black');

  const anchoColumna = (doc.page.width - 80) / columnas.length;
  let y = doc.y;

  // Encabezados
  doc.fontSize(9).font('Helvetica-Bold');
  columnas.forEach((col, i) => {
    doc.text(col.header, 40 + i * anchoColumna, y, { width: anchoColumna, align: 'left' });
  });

  doc.moveDown();
  y = doc.y;
  doc.moveTo(40, y).lineTo(doc.page.width - 40, y).stroke();
  doc.moveDown(0.3);

  // Filas
  doc.font('Helvetica').fontSize(8);
  filas.forEach((fila) => {
    y = doc.y;

    // Salto de página si ya no cabe
    if (y > doc.page.height - 60) {
      doc.addPage();
      y = doc.y;
    }

    columnas.forEach((col, i) => {
      const valor = fila[col.key] !== undefined && fila[col.key] !== null ? String(fila[col.key]) : '';
      doc.text(valor, 40 + i * anchoColumna, y, { width: anchoColumna, align: 'left' });
    });

    doc.moveDown();
  });

  doc.end();
};

module.exports = generarPDF;