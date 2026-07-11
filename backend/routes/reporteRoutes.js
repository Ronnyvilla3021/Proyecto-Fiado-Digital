const express = require('express');
const router = express.Router();
const { reporteVentas, reporteClientes, reporteCreditos, reportePagos } = require('../controllers/reporteController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.use(verificarToken);
router.use(verificarRol('administrador', 'supervisor')); // los reportes son información sensible del negocio

router.get('/ventas', reporteVentas);
router.get('/clientes', reporteClientes);
router.get('/creditos', reporteCreditos);
router.get('/pagos', reportePagos);

module.exports = router;