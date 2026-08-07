const { Auditoria } = require('../models/associations');

/**
 * Registra una entrada de auditoría. Se usa desde cualquier controlador
 * después de una acción sensible (crear, editar, desactivar, pago, etc.)
 */
const registrarAuditoria = async ({ usuario_id, accion, entidad, entidad_id, descripcion, detalles = null }, transaction = null) => {
  try {
    await Auditoria.create(
      { usuario_id, accion, entidad, entidad_id, descripcion, detalles },
      transaction ? { transaction } : {}
    );
  } catch (error) {
    // Un fallo al auditar NO debe romper la operación principal (crear cliente, venta, etc.)
    // así que solo lo registramos en consola, nunca lanzamos el error hacia arriba.
    console.error('⚠️ Error al registrar auditoría:', error.message);
  }
};

module.exports = registrarAuditoria;