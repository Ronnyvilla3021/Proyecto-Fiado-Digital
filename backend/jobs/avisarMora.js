const { Credito, Cliente, Usuario, Notificacion } = require('../models/associations');
const { Op } = require('sequelize');
const enviarEmail = require('../config/mailer');

const avisarMora = async (io) => {
  try {
    const hoy = new Date();

    // Créditos vencidos (fecha límite ya pasó) y no pagados
    const creditosVencidos = await Credito.findAll({
      where: {
        estado: { [Op.ne]: 'pagado' },
        fecha_limite: { [Op.lt]: hoy },
      },
      include: [{ model: Cliente }],
    });

    for (const credito of creditosVencidos) {
      const cliente = credito.Cliente;
      if (!cliente) continue;

      const diasMora = Math.floor((hoy - new Date(credito.fecha_limite)) / (1000 * 60 * 60 * 24));

      if (cliente.email) {
        await enviarEmail({
          to: cliente.email,
          subject: 'Aviso de mora - Fiado Digital',
          html: `
            <h2>Hola ${cliente.nombre},</h2>
            <p>Tu saldo de <strong>$${credito.saldo}</strong> está vencido desde hace 
            <strong>${diasMora} día(s)</strong>. Por favor acércate a regularizar tu pago.</p>
          `,
        });
      }

      const admins = await Usuario.findAll({ where: { rol: ['administrador', 'supervisor'] } });
      for (const admin of admins) {
        const noti = await Notificacion.create({
          usuario_id: admin.id,
          tipo: 'mora',
          titulo: 'Cliente en mora',
          mensaje: `${cliente.nombre} ${cliente.apellido} debe $${credito.saldo}, con ${diasMora} día(s) de mora.`,
        });

        if (io) io.emit('nueva-notificacion', noti);
      }
    }

    console.log(`⚠️ Avisos de mora enviados: ${creditosVencidos.length}`);
  } catch (error) {
    console.error('❌ Error en avisarMora:', error);
  }
};

module.exports = avisarMora;