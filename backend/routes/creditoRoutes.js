const express = require('express');
const router = express.Router();
const { listarCreditos, obtenerCredito, registrarPago } = require('../controllers/creditoController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.use(verificarToken);

router.get('/', listarCreditos);
router.get('/:id', obtenerCredito);
router.post('/pagos', verificarRol('administrador', 'supervisor', 'cajero'), registrarPago);

module.exports = router;