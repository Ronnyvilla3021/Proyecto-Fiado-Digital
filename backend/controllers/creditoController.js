const { Credito, Cliente, Pago, Venta } = require('../models/associations');
const sequelize = require('../config/database');

// Función auxiliar: calcula los días de mora sin guardarlos en la BD
const calcularDiasMora = (fechaLimite, estado) => {
  if (estado === 'pagado') return 0;
  const hoy = new Date();
  const limite = new Date(fechaLimite);
  const diffMs = hoy - limite;
  const dias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return dias > 0 ? dias : 0;
};

// LISTAR CRÉDITOS (con filtro opcional por cliente o estado)
const listarCreditos = async (req, res) => {
  try {
    const { cliente_id, estado } = req.query;
    const where = {};

    if (cliente_id) where.cliente_id = cliente_id;
    if (estado) where.estado = estado;

    const creditos = await Credito.findAll({
      where,
      include: [
        { model: Cliente, attributes: ['id', 'nombre', 'apellido', 'cedula'] },
        { model: Venta, attributes: ['id', 'fecha', 'total'] },
      ],
      order: [['fecha_limite', 'ASC']],
    });

    // Agregamos dias_mora calculado dinámicamente y actualizamos estado si venció
    const resultado = creditos.map((credito) => {
      const diasMora = calcularDiasMora(credito.fecha_limite, credito.estado);
      const estadoCalculado =
        credito.estado === 'pagado' ? 'pagado' : diasMora > 0 ? 'vencido' : 'pendiente';

      return {
        ...credito.toJSON(),
        dias_mora: diasMora,
        estado: estadoCalculado,
      };
    });

    res.json(resultado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar créditos' });
  }
};

// VER UN CRÉDITO CON SUS CUOTAS/PAGOS
const obtenerCredito = async (req, res) => {
  try {
    const { id } = req.params;

    const credito = await Credito.findByPk(id, {
      include: [
        { model: Cliente, attributes: ['id', 'nombre', 'apellido', 'cedula'] },
        { model: Venta, attributes: ['id', 'fecha', 'total'] },
        { model: Pago, as: 'pagos', order: [['fecha', 'DESC']] },
      ],
    });

    if (!credito) {
      return res.status(404).json({ error: 'Crédito no encontrado' });
    }

    const diasMora = calcularDiasMora(credito.fecha_limite, credito.estado);
    const estadoCalculado =
      credito.estado === 'pagado' ? 'pagado' : diasMora > 0 ? 'vencido' : 'pendiente';

    res.json({
      ...credito.toJSON(),
      dias_mora: diasMora,
      estado: estadoCalculado,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener crédito' });
  }
};

// REGISTRAR PAGO (abono a un crédito)
const registrarPago = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { credito_id, monto } = req.body;

    if (!credito_id || !monto || Number(monto) <= 0) {
      await t.rollback();
      return res.status(400).json({ error: 'credito_id y monto (mayor a 0) son obligatorios' });
    }

    const credito = await Credito.findByPk(credito_id, { transaction: t });
    if (!credito) {
      await t.rollback();
      return res.status(404).json({ error: 'Crédito no encontrado' });
    }

    if (credito.estado === 'pagado') {
      await t.rollback();
      return res.status(400).json({ error: 'Este crédito ya está totalmente pagado' });
    }

    if (Number(monto) > Number(credito.saldo)) {
      await t.rollback();
      return res.status(400).json({
        error: `El monto (${monto}) es mayor al saldo pendiente (${credito.saldo})`,
      });
    }

    // Registrar el pago
    const nuevoPago = await Pago.create({
      credito_id,
      usuario_id: req.usuario.id,
      monto,
    }, { transaction: t });

    // Actualizar el saldo del crédito
    const nuevoSaldo = Number(credito.saldo) - Number(monto);
    credito.saldo = nuevoSaldo;
    if (nuevoSaldo <= 0) {
      credito.estado = 'pagado';
    }
    await credito.save({ transaction: t });

    await t.commit();

    req.io.emit('nuevo-pago', {
      pago: nuevoPago,
      credito: credito,
    });

    res.status(201).json({
      mensaje: 'Pago registrado correctamente',
      pago: nuevoPago,
      credito_actualizado: credito,
    });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el pago' });
  }
};

module.exports = { listarCreditos, obtenerCredito, registrarPago };