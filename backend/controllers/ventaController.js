const { Venta, DetalleVenta, Cliente, Credito } = require('../models/associations');
const sequelize = require('../config/database');
const { Op } = require('sequelize');

// REGISTRAR VENTA
const registrarVenta = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { cliente_id, metodo_pago, observaciones, detalles, dias_plazo } = req.body;

    if (!metodo_pago || !['contado', 'fiado'].includes(metodo_pago)) {
      await t.rollback();
      return res.status(400).json({ error: 'metodo_pago debe ser "contado" o "fiado"' });
    }

    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: 'Debes incluir al menos un ítem en la venta' });
    }

    let total = 0;
    for (const item of detalles) {
      if (!item.descripcion || !item.cantidad || !item.precio_unitario) {
        await t.rollback();
        return res.status(400).json({ error: 'Cada ítem necesita descripcion, cantidad y precio_unitario' });
      }
      total += item.cantidad * item.precio_unitario;
    }

    let cliente = null;

    if (metodo_pago === 'fiado') {
      if (!cliente_id) {
        await t.rollback();
        return res.status(400).json({ error: 'Una venta fiada requiere un cliente' });
      }

      cliente = await Cliente.findByPk(cliente_id, { transaction: t });
      if (!cliente || cliente.estado !== 'activo') {
        await t.rollback();
        return res.status(404).json({ error: 'Cliente no encontrado o inactivo' });
      }

      // Sumar el saldo de todos los créditos NO pagados de este cliente
      const creditosPendientes = await Credito.findAll({
        where: {
          cliente_id: cliente.id,
          estado: { [Op.ne]: 'pagado' },
        },
        transaction: t,
      });

      const deudaActual = creditosPendientes.reduce(
        (suma, c) => suma + Number(c.saldo),
        0
      );

      const creditoDisponible = Number(cliente.limite_credito) - deudaActual;

      if (Number(total) > creditoDisponible) {
        await t.rollback();
        return res.status(403).json({
          error: `El total (${total}) supera el crédito disponible del cliente. Límite: ${cliente.limite_credito}, deuda actual: ${deudaActual.toFixed(2)}, disponible: ${creditoDisponible.toFixed(2)}`,
        });
      }
    }

    const nuevaVenta = await Venta.create({
      cliente_id: cliente_id || null,
      usuario_id: req.usuario.id,
      total,
      metodo_pago,
      observaciones,
    }, { transaction: t });

    const detallesCreados = await Promise.all(
      detalles.map((item) =>
        DetalleVenta.create({
          venta_id: nuevaVenta.id,
          descripcion: item.descripcion,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          subtotal: item.cantidad * item.precio_unitario,
        }, { transaction: t })
      )
    );

    // Si la venta es fiada, se crea automáticamente el crédito asociado
    let creditoCreado = null;
    if (metodo_pago === 'fiado') {
      const plazo = dias_plazo && Number(dias_plazo) > 0 ? Number(dias_plazo) : 15; // 15 días por defecto
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + plazo);

      creditoCreado = await Credito.create({
        venta_id: nuevaVenta.id,
        cliente_id: cliente.id,
        monto_total: total,
        saldo: total,
        fecha_limite: fechaLimite,
        estado: 'pendiente',
      }, { transaction: t });
    }

    await t.commit();

    res.status(201).json({
      mensaje: 'Venta registrada correctamente',
      venta: nuevaVenta,
      detalles: detallesCreados,
      credito: creditoCreado,
    });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ error: 'Error al registrar la venta' });
  }
};

// LISTAR VENTAS
const listarVentas = async (req, res) => {
  try {
    const { cliente_id, metodo_pago } = req.query;
    const where = {};

    if (cliente_id) where.cliente_id = cliente_id;
    if (metodo_pago) where.metodo_pago = metodo_pago;

    const ventas = await Venta.findAll({
      where,
      include: [
        { model: Cliente, attributes: ['id', 'nombre', 'apellido', 'cedula'] },
        { model: DetalleVenta, as: 'detalles' },
      ],
      order: [['fecha', 'DESC']],
    });

    res.json(ventas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar ventas' });
  }
};

// OBTENER UNA VENTA
const obtenerVenta = async (req, res) => {
  try {
    const { id } = req.params;

    const venta = await Venta.findByPk(id, {
      include: [
        { model: Cliente, attributes: ['id', 'nombre', 'apellido', 'cedula'] },
        { model: DetalleVenta, as: 'detalles' },
      ],
    });

    if (!venta) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }

    res.json(venta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener venta' });
  }
};

module.exports = { registrarVenta, listarVentas, obtenerVenta };