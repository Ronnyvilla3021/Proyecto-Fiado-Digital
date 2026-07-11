const { Venta, DetalleVenta, Cliente, Credito, Pago, Usuario } = require('../models/associations');
const { Op } = require('sequelize');
const generarExcel = require('./reportes/excelHelper');
const generarPDF = require('./reportes/pdfHelper');

// Función auxiliar: lee filtros de fecha desde query params (?desde=2026-01-01&hasta=2026-01-31)
const construirFiltroFecha = (req, campo = 'fecha') => {
  const { desde, hasta } = req.query;
  if (!desde && !hasta) return {};

  const filtro = {};
  if (desde) filtro[Op.gte] = new Date(desde);
  if (hasta) {
    const fin = new Date(hasta);
    fin.setHours(23, 59, 59, 999);
    filtro[Op.lte] = fin;
  }
  return { [campo]: filtro };
};

// ================== REPORTE DE VENTAS ==================
const reporteVentas = async (req, res) => {
  try {
    const where = construirFiltroFecha(req, 'fecha');

    const ventas = await Venta.findAll({
      where,
      include: [{ model: Cliente, attributes: ['nombre', 'apellido'] }],
      order: [['fecha', 'DESC']],
    });

    const filas = ventas.map((v) => ({
      id: v.id,
      fecha: new Date(v.fecha).toLocaleDateString('es-EC'),
      cliente: v.Cliente ? `${v.Cliente.nombre} ${v.Cliente.apellido}` : 'Consumidor final',
      metodo_pago: v.metodo_pago,
      total: Number(v.total).toFixed(2),
      observaciones: v.observaciones || '',
    }));

    const columnas = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Cliente', key: 'cliente', width: 25 },
      { header: 'Método de pago', key: 'metodo_pago', width: 15 },
      { header: 'Total', key: 'total', width: 12 },
      { header: 'Observaciones', key: 'observaciones', width: 30 },
    ];

    if ((req.formatoOverride || req.query.formato) === 'pdf') {
      return generarPDF(res, { titulo: 'Reporte de Ventas', columnas, filas, nombreArchivo: 'reporte_ventas' });
    }
    return generarExcel(res, { nombreHoja: 'Ventas', columnas, filas, nombreArchivo: 'reporte_ventas' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar reporte de ventas' });
  }
};

// ================== REPORTE DE CLIENTES ==================
const reporteClientes = async (req, res) => {
  try {
    const clientes = await Cliente.findAll({ order: [['nombre', 'ASC']] });

    const filas = clientes.map((c) => ({
      id: c.id,
      nombre: `${c.nombre} ${c.apellido}`,
      cedula: c.cedula,
      telefono: c.telefono || '',
      limite_credito: Number(c.limite_credito).toFixed(2),
      estado: c.estado,
    }));

    const columnas = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Nombre completo', key: 'nombre', width: 25 },
      { header: 'Cédula', key: 'cedula', width: 15 },
      { header: 'Teléfono', key: 'telefono', width: 15 },
      { header: 'Límite de crédito', key: 'limite_credito', width: 15 },
      { header: 'Estado', key: 'estado', width: 12 },
    ];

    if ((req.formatoOverride || req.query.formato) === 'pdf') {
      return generarPDF(res, { titulo: 'Reporte de Clientes', columnas, filas, nombreArchivo: 'reporte_clientes' });
    }
    return generarExcel(res, { nombreHoja: 'Clientes', columnas, filas, nombreArchivo: 'reporte_clientes' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar reporte de clientes' });
  }
};

// ================== REPORTE DE CRÉDITOS ==================
const reporteCreditos = async (req, res) => {
  try {
    const { estado } = req.query;
    const where = {};
    if (estado) where.estado = estado;

    const creditos = await Credito.findAll({
      where,
      include: [{ model: Cliente, attributes: ['nombre', 'apellido'] }],
      order: [['fecha_limite', 'ASC']],
    });

    const hoy = new Date();
    const filas = creditos.map((c) => {
      const diasMora = c.estado !== 'pagado' && new Date(c.fecha_limite) < hoy
        ? Math.floor((hoy - new Date(c.fecha_limite)) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        id: c.id,
        cliente: c.Cliente ? `${c.Cliente.nombre} ${c.Cliente.apellido}` : 'N/A',
        monto_total: Number(c.monto_total).toFixed(2),
        saldo: Number(c.saldo).toFixed(2),
        fecha_limite: new Date(c.fecha_limite).toLocaleDateString('es-EC'),
        estado: c.estado,
        dias_mora: diasMora,
      };
    });

    const columnas = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Cliente', key: 'cliente', width: 25 },
      { header: 'Monto total', key: 'monto_total', width: 12 },
      { header: 'Saldo', key: 'saldo', width: 12 },
      { header: 'Fecha límite', key: 'fecha_limite', width: 15 },
      { header: 'Estado', key: 'estado', width: 12 },
      { header: 'Días mora', key: 'dias_mora', width: 10 },
    ];

    if ((req.formatoOverride || req.query.formato) === 'pdf') {
      return generarPDF(res, { titulo: 'Reporte de Créditos', columnas, filas, nombreArchivo: 'reporte_creditos' });
    }
    return generarExcel(res, { nombreHoja: 'Créditos', columnas, filas, nombreArchivo: 'reporte_creditos' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar reporte de créditos' });
  }
};

// ================== REPORTE DE PAGOS ==================
const reportePagos = async (req, res) => {
  try {
    const where = construirFiltroFecha(req, 'fecha');

    const pagos = await Pago.findAll({
      where,
      include: [
        { model: Usuario, attributes: ['nombre'] },
        {
          model: Credito,
          attributes: ['id'],
          include: [{ model: Cliente, attributes: ['nombre', 'apellido'] }],
        },
      ],
      order: [['fecha', 'DESC']],
    });

    const filas = pagos.map((p) => ({
      id: p.id,
      fecha: new Date(p.fecha).toLocaleDateString('es-EC'),
      cliente: p.Credito?.Cliente ? `${p.Credito.Cliente.nombre} ${p.Credito.Cliente.apellido}` : 'N/A',
      monto: Number(p.monto).toFixed(2),
      registrado_por: p.Usuario ? p.Usuario.nombre : 'N/A',
    }));

    const columnas = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Fecha', key: 'fecha', width: 15 },
      { header: 'Cliente', key: 'cliente', width: 25 },
      { header: 'Monto', key: 'monto', width: 12 },
      { header: 'Registrado por', key: 'registrado_por', width: 20 },
    ];

    if ((req.formatoOverride || req.query.formato) === 'pdf') {
      return generarPDF(res, { titulo: 'Reporte de Pagos', columnas, filas, nombreArchivo: 'reporte_pagos' });
    }
    return generarExcel(res, { nombreHoja: 'Pagos', columnas, filas, nombreArchivo: 'reporte_pagos' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar reporte de pagos' });
  }
};

module.exports = { reporteVentas, reporteClientes, reporteCreditos, reportePagos };