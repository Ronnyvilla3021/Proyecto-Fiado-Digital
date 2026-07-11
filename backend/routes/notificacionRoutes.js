const express = require('express');
const router = express.Router();
const { listarNotificaciones, marcarLeida } = require('../controllers/notificacionController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.get('/', listarNotificaciones);
router.put('/:id/leer', marcarLeida);





const avisarCobrosPendientes = require('../jobs/avisarCobrosPendientes');
const avisarMora = require('../jobs/avisarMora');
const resumenDiario = require('../jobs/resumenDiario');
const { verificarRol } = require('../middlewares/authMiddleware');

router.post('/test/cobros-pendientes', verificarRol('administrador'), async (req, res) => {
  await avisarCobrosPendientes(req.io);
  res.json({ mensaje: 'Job de cobros pendientes ejecutado manualmente' });
});

router.post('/test/mora', verificarRol('administrador'), async (req, res) => {
  await avisarMora(req.io);
  res.json({ mensaje: 'Job de mora ejecutado manualmente' });
});

router.post('/test/resumen-diario', verificarRol('administrador'), async (req, res) => {
  await resumenDiario(req.io);
  res.json({ mensaje: 'Job de resumen diario ejecutado manualmente' });
});




module.exports = router;