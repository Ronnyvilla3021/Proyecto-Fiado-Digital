const { Credito, Cliente, Usuario, Notificacion } = require('../models/associations');
const { Op } = require('sequelize');
const enviarEmail = require('../config/mailer');

const avisarCobrosPendientes = async (io) => {
  try {
    const hoy = new Date();
    const enTresDias = new Date();
    enTresDias.setDate(hoy.getDate() + 3);

    // Créditos que vencen en los próximos 3 días y no están pagados
    const creditosPorVencer = await Credito.findAll({
      where: {
        estado: { [Op.ne]: 'pagado' },
        fecha_limite: { [Op.between]: [hoy, enTresDias] },
      },
      include: [{ model: Cliente }],
    });

    for (const credito of creditosPorVencer) {
      const cliente = credito.Cliente;
      if (!cliente || !cliente.email) continue;

      // Email al cliente
      await enviarEmail({
        to: cliente.email,
        subject: 'Recordatorio de pago - Fiado Digital',
        html: `
          <h2>Hola ${cliente.nombre},</h2>
          <p>Te recordamos que tienes un saldo pendiente de <strong>$${credito.saldo}</strong> 
          que vence el ${new Date(credito.fecha_limite).toLocaleDateString('es-EC')}.</p>
          <p>¡Gracias por tu preferencia!</p>
        `,
      });

      // Notificación interna (visible en el sistema para admin/supervisor)
      const admins = await Usuario.findAll({ where: { rol: ['administrador', 'supervisor'] } });
      for (const admin of admins) {
        const noti = await Notificacion.create({
          usuario_id: admin.id,
          tipo: 'cobro_pendiente',
          titulo: 'Cobro próximo a vencer',
          mensaje: `${cliente.nombre} ${cliente.apellido} tiene un saldo de $${credito.saldo} que vence pronto.`,
        });

        // Emitir en tiempo real si el admin está conectado
        if (io) io.emit('nueva-notificacion', noti);
      }
    }

    console.log(`📬 Avisos de cobros pendientes enviados: ${creditosPorVencer.length}`);
  } catch (error) {
    console.error('❌ Error en avisarCobrosPendientes:', error);
  }
};

module.exports = avisarCobrosPendientes;