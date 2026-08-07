const { Auditoria, Usuario } = require('../models/associations');
const { Op } = require('sequelize');

const listarAuditoria = async (req, res) => {
  try {
    const { entidad, entidad_id, usuario_id, accion } = req.query;
    const where = {};

    if (entidad) where.entidad = entidad;
    if (entidad_id) where.entidad_id = entidad_id;
    if (usuario_id) where.usuario_id = usuario_id;
    if (accion) where.accion = accion;

    const registros = await Auditoria.findAll({
      where,
      include: [{ model: Usuario, attributes: ['id', 'nombre', 'rol'] }],
      order: [['createdAt', 'DESC']],
      limit: 200, // límite razonable para no traer un historial infinito de una sola vez
    });

    res.json(registros);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar auditoría' });
  }
};

module.exports = { listarAuditoria };