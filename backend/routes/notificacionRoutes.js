const express = require('express');
const router = express.Router();
const { listarNotificaciones, marcarLeida } = require('../controllers/notificacionController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');
const avisarCobrosPendientes = require('../jobs/avisarCobrosPendientes');
const avisarMora = require('../jobs/avisarMora');
const resumenDiario = require('../jobs/resumenDiario');

router.use(verificarToken);

// Notificaciones internas del usuario autenticado
router.get('/', listarNotificaciones);
router.put('/:id/leer', marcarLeida);

// Ejecución manual de los jobs de automatización (solo administrador)
router.post('/ejecutar/cobros-pendientes', verificarRol('administrador'), async (req, res) => {
  await avisarCobrosPendientes(req.io);
  res.json({ mensaje: 'Job de cobros pendientes ejecutado manualmente' });
});

router.post('/ejecutar/mora', verificarRol('administrador'), async (req, res) => {
  await avisarMora(req.io);
  res.json({ mensaje: 'Job de mora ejecutado manualmente' });
});

router.post('/ejecutar/resumen-diario', verificarRol('administrador'), async (req, res) => {
  await resumenDiario(req.io);
  res.json({ mensaje: 'Job de resumen diario ejecutado manualmente' });
});

module.exports = router;