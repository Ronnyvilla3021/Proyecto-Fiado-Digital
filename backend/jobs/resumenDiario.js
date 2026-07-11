const { Venta, Pago, Usuario, Notificacion } = require('../models/associations');
const { Op } = require('sequelize');
const enviarEmail = require('../config/mailer');

const resumenDiario = async (io) => {
  try {
    const inicioHoy = new Date();
    inicioHoy.setHours(0, 0, 0, 0);
    const finHoy = new Date();
    finHoy.setHours(23, 59, 59, 999);

    const ventasHoy = await Venta.findAll({ where: { fecha: { [Op.between]: [inicioHoy, finHoy] } } });
    const pagosHoy = await Pago.findAll({ where: { fecha: { [Op.between]: [inicioHoy, finHoy] } } });

    const totalVentas = ventasHoy.reduce((s, v) => s + Number(v.total), 0);
    const totalPagos = pagosHoy.reduce((s, p) => s + Number(p.monto), 0);

    const admins = await Usuario.findAll({ where: { rol: 'administrador' } });

    for (const admin of admins) {
      if (admin.email) {
        await enviarEmail({
          to: admin.email,
          subject: `Resumen diario - Fiado Digital (${new Date().toLocaleDateString('es-EC')})`,
          html: `
            <h2>Resumen del día</h2>
            <p><strong>Ventas registradas:</strong> ${ventasHoy.length} — Total: $${totalVentas.toFixed(2)}</p>
            <p><strong>Pagos recibidos:</strong> ${pagosHoy.length} — Total: $${totalPagos.toFixed(2)}</p>
          `,
        });
      }

      const noti = await Notificacion.create({
        usuario_id: admin.id,
        tipo: 'resumen_diario',
        titulo: 'Resumen diario disponible',
        mensaje: `Hoy: ${ventasHoy.length} ventas ($${totalVentas.toFixed(2)}), ${pagosHoy.length} pagos ($${totalPagos.toFixed(2)}).`,
      });

      if (io) io.emit('nueva-notificacion', noti);
    }

    console.log('📊 Resumen diario enviado');
  } catch (error) {
    console.error('❌ Error en resumenDiario:', error);
  }
};

module.exports = resumenDiario;