const express = require('express');
const router = express.Router();
const { obtenerDashboard, graficoVentasSemana, graficoMetodoPago } = require('../controllers/dashboardController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.get('/', obtenerDashboard);
router.get('/grafico-ventas-semana', graficoVentasSemana);
router.get('/grafico-metodo-pago', graficoMetodoPago);

module.exports = router;