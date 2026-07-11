const cron = require('node-cron');
const avisarCobrosPendientes = require('./avisarCobrosPendientes');
const avisarMora = require('./avisarMora');
const resumenDiario = require('./resumenDiario');

const iniciarCronJobs = (io) => {
  // Todos los días a las 8:00 AM: avisar cobros que vencen pronto
  cron.schedule('0 8 * * *', () => {
    console.log('⏰ Ejecutando: avisar cobros pendientes');
    avisarCobrosPendientes(io);
  });

  // Todos los días a las 9:00 AM: avisar mora
  cron.schedule('0 9 * * *', () => {
    console.log('⏰ Ejecutando: avisar mora');
    avisarMora(io);
  });

  // Todos los días a las 8:00 PM: resumen diario
  cron.schedule('0 20 * * *', () => {
    console.log('⏰ Ejecutando: resumen diario');
    resumenDiario(io);
  });

  console.log('✅ Cron jobs programados correctamente');
};

module.exports = iniciarCronJobs;