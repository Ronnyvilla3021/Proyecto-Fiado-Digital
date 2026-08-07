const express = require('express');
const router = express.Router();
const { listarAuditoria } = require('../controllers/auditoriaController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.use(verificarToken);
router.use(verificarRol('administrador')); // solo el administrador puede ver el historial completo

router.get('/', listarAuditoria);

module.exports = router;