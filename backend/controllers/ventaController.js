const { Venta, DetalleVenta, Cliente } = require('../models/associations');
const sequelize = require('../config/database');

// REGISTRAR VENTA
const registrarVenta = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { cliente_id, metodo_pago, observaciones, detalles } = req.body;

    if (!metodo_pago || !['contado', 'fiado'].includes(metodo_pago)) {
      await t.rollback();
      return res.status(400).json({ error: 'metodo_pago debe ser "contado" o "fiado"' });
    }

    if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
      await t.rollback();
      return res.status(400).json({ error: 'Debes incluir al menos un ítem en la venta' });
    }

    // Calcular el total sumando los detalles (nunca confiar en un total enviado desde el frontend)
    let total = 0;
    for (const item of detalles) {
      if (!item.descripcion || !item.cantidad || !item.precio_unitario) {
        await t.rollback();
        return res.status(400).json({ error: 'Cada ítem necesita descripcion, cantidad y precio_unitario' });
      }
      total += item.cantidad * item.precio_unitario;
    }

    let cliente = null;

    // Si es venta fiada, el cliente es obligatorio y se valida el crédito disponible
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

      if (Number(total) > Number(cliente.limite_credito)) {
        await t.rollback();
        return res.status(403).json({
          error: `El total (${total}) supera el límite de crédito disponible del cliente (${cliente.limite_credito})`,
        });
      }
    }

    // Crear la venta
    const nuevaVenta = await Venta.create({
      cliente_id: cliente_id || null,
      usuario_id: req.usuario.id,
      total,
      metodo_pago,
      observaciones,
    }, { transaction: t });

    // Crear los detalles asociados
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

    await t.commit();

    res.status(201).json({
      mensaje: 'Venta registrada correctamente',
      venta: nuevaVenta,
      detalles: detallesCreados,
    });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ error: 'Error al registrar la venta' });
  }
};

// LISTAR VENTAS (con filtros opcionales)
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

// OBTENER UNA VENTA POR ID
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