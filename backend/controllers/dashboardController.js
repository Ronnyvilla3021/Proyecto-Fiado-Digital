const { Venta, Cliente, Credito, Pago } = require('../models/associations');
const { Op, fn, col, literal } = require('sequelize');

const obtenerDashboard = async (req, res) => {
  try {
    // --- Ventas de hoy ---
    const inicioHoy = new Date();
    inicioHoy.setHours(0, 0, 0, 0);
    const finHoy = new Date();
    finHoy.setHours(23, 59, 59, 999);

    const ventasHoy = await Venta.findAll({
      where: { fecha: { [Op.between]: [inicioHoy, finHoy] } },
    });

    const totalVentasHoy = ventasHoy.reduce((suma, v) => suma + Number(v.total), 0);
    const cantidadVentasHoy = ventasHoy.length;

    // --- Clientes morosos (créditos vencidos: fecha_limite pasada y no pagados) ---
    const creditosVencidos = await Credito.findAll({
      where: {
        estado: { [Op.ne]: 'pagado' },
        fecha_limite: { [Op.lt]: new Date() },
      },
      include: [{ model: Cliente, attributes: ['id', 'nombre', 'apellido'] }],
    });

    // Contar clientes únicos morosos (un cliente puede tener varios créditos vencidos)
    const clientesMorososIds = [...new Set(creditosVencidos.map((c) => c.cliente_id))];

    // --- Crédito activo (suma de saldos pendientes, no pagados) ---
    const creditosActivos = await Credito.findAll({
      where: { estado: { [Op.ne]: 'pagado' } },
    });
    const totalCreditoActivo = creditosActivos.reduce((suma, c) => suma + Number(c.saldo), 0);

    // --- Pagos recibidos hoy ---
    const pagosHoy = await Pago.findAll({
      where: { fecha: { [Op.between]: [inicioHoy, finHoy] } },
    });
    const totalPagosHoy = pagosHoy.reduce((suma, p) => suma + Number(p.monto), 0);

    res.json({
      ventas_hoy: {
        total: totalVentasHoy.toFixed(2),
        cantidad: cantidadVentasHoy,
      },
      clientes_morosos: {
        cantidad: clientesMorososIds.length,
        clientes: creditosVencidos.map((c) => ({
          credito_id: c.id,
          cliente: c.Cliente ? `${c.Cliente.nombre} ${c.Cliente.apellido}` : 'N/A',
          saldo: c.saldo,
          fecha_limite: c.fecha_limite,
        })),
      },
      credito_activo: {
        total: totalCreditoActivo.toFixed(2),
        cantidad_creditos: creditosActivos.length,
      },
      pagos_recibidos_hoy: {
        total: totalPagosHoy.toFixed(2),
        cantidad: pagosHoy.length,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener datos del dashboard' });
  }
};

// --- Datos para gráfico de barras: ventas de los últimos 7 días ---
const graficoVentasSemana = async (req, res) => {
  try {
    const haceSieteDias = new Date();
    haceSieteDias.setDate(haceSieteDias.getDate() - 6);
    haceSieteDias.setHours(0, 0, 0, 0);

    const ventas = await Venta.findAll({
      where: { fecha: { [Op.gte]: haceSieteDias } },
      attributes: [
        [fn('DATE', col('fecha')), 'dia'],
        [fn('SUM', col('total')), 'total'],
      ],
      group: [fn('DATE', col('fecha'))],
      order: [[fn('DATE', col('fecha')), 'ASC']],
    });

    res.json(ventas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener gráfico de ventas' });
  }
};

// --- Datos para gráfico circular: ventas contado vs fiado ---
const graficoMetodoPago = async (req, res) => {
  try {
    const resultado = await Venta.findAll({
      attributes: [
        'metodo_pago',
        [fn('COUNT', col('id')), 'cantidad'],
        [fn('SUM', col('total')), 'total'],
      ],
      group: ['metodo_pago'],
    });

    res.json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener gráfico de métodos de pago' });
  }
};

module.exports = { obtenerDashboard, graficoVentasSemana, graficoMetodoPago };