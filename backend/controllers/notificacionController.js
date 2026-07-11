const { Notificacion } = require('../models/associations');

const listarNotificaciones = async (req, res) => {
  try {
    const notificaciones = await Notificacion.findAll({
      where: { usuario_id: req.usuario.id },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });
    res.json(notificaciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar notificaciones' });
  }
};

const marcarLeida = async (req, res) => {
  try {
    const { id } = req.params;
    const noti = await Notificacion.findOne({ where: { id, usuario_id: req.usuario.id } });

    if (!noti) {
      return res.status(404).json({ error: 'Notificación no encontrada' });
    }

    noti.leida = true;
    await noti.save();

    res.json({ mensaje: 'Notificación marcada como leída', notificacion: noti });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al marcar notificación' });
  }
};

module.exports = { listarNotificaciones, marcarLeida };