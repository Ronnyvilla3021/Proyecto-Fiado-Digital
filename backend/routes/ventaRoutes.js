const express = require('express');
const router = express.Router();
const { registrarVenta, listarVentas, obtenerVenta } = require('../controllers/ventaController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.use(verificarToken);

// Los 3 roles pueden registrar y ver ventas (es su trabajo diario)
router.post('/', verificarRol('administrador', 'supervisor', 'cajero'), registrarVenta);
router.get('/', listarVentas);
router.get('/:id', obtenerVenta);

module.exports = router;