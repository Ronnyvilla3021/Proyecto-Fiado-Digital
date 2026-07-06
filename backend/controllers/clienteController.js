const Cliente = require('../models/Cliente');
const { Op } = require('sequelize');

// CREAR CLIENTE
const crearCliente = async (req, res) => {
  try {
    const { nombre, apellido, cedula, telefono, direccion, email, limite_credito } = req.body;

    if (!nombre || !apellido || !cedula) {
      return res.status(400).json({ error: 'Nombre, apellido y cédula son obligatorios' });
    }

    const existente = await Cliente.findOne({ where: { cedula } });
    if (existente) {
      return res.status(400).json({ error: 'Ya existe un cliente con esta cédula' });
    }

    // Solo admin y supervisor pueden asignar un límite de crédito distinto de 0 al crear
    let limiteFinal = 0;
    if (limite_credito !== undefined) {
      if (['administrador', 'supervisor'].includes(req.usuario.rol)) {
        limiteFinal = limite_credito;
      } else if (Number(limite_credito) !== 0) {
        return res.status(403).json({ error: 'No tienes permiso para asignar un límite de crédito' });
      }
    }

    const nuevoCliente = await Cliente.create({
      nombre,
      apellido,
      cedula,
      telefono,
      direccion,
      email,
      limite_credito: limiteFinal,
    });

    res.status(201).json({ mensaje: 'Cliente creado correctamente', cliente: nuevoCliente });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear cliente' });
  }
};

// LISTAR CLIENTES (con búsqueda opcional)
const listarClientes = async (req, res) => {
  try {
    const { busqueda } = req.query;

    const where = {};
    if (busqueda) {
      where[Op.or] = [
        { nombre: { [Op.iLike]: `%${busqueda}%` } },
        { apellido: { [Op.iLike]: `%${busqueda}%` } },
        { cedula: { [Op.iLike]: `%${busqueda}%` } },
      ];
    }

    const clientes = await Cliente.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json(clientes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar clientes' });
  }
};

// OBTENER UN CLIENTE POR ID
const obtenerCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByPk(id);

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json(cliente);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
};

// EDITAR CLIENTE
const editarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, telefono, direccion, email, limite_credito, estado } = req.body;

    const cliente = await Cliente.findByPk(id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Bloqueo de campo sensible: límite de crédito solo admin/supervisor
    if (limite_credito !== undefined && Number(limite_credito) !== Number(cliente.limite_credito)) {
      if (!['administrador', 'supervisor'].includes(req.usuario.rol)) {
        return res.status(403).json({ error: 'No tienes permiso para modificar el límite de crédito' });
      }
      cliente.limite_credito = limite_credito;
    }

    // Bloqueo de campo sensible: estado (activar/desactivar) solo admin
    if (estado !== undefined && estado !== cliente.estado) {
      if (req.usuario.rol !== 'administrador') {
        return res.status(403).json({ error: 'No tienes permiso para cambiar el estado del cliente' });
      }
      cliente.estado = estado;
    }

    // Campos generales, cualquiera de los 3 roles autorizados puede editarlos
    if (nombre !== undefined) cliente.nombre = nombre;
    if (apellido !== undefined) cliente.apellido = apellido;
    if (telefono !== undefined) cliente.telefono = telefono;
    if (direccion !== undefined) cliente.direccion = direccion;
    if (email !== undefined) cliente.email = email;

    await cliente.save();

    res.json({ mensaje: 'Cliente actualizado correctamente', cliente });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al editar cliente' });
  }
};

// ELIMINAR CLIENTE (soft delete)
const eliminarCliente = async (req, res) => {
  try {
    const { id } = req.params;
    const cliente = await Cliente.findByPk(id);

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    cliente.estado = 'inactivo';
    await cliente.save();

    res.json({ mensaje: 'Cliente desactivado correctamente (soft delete)' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
};

module.exports = {
  crearCliente,
  listarClientes,
  obtenerCliente,
  editarCliente,
  eliminarCliente,
};