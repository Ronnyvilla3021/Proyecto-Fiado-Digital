const express = require('express');
const router = express.Router();
const { registrar, login } = require('../controllers/authController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.post('/registro', registrar);
router.post('/login', login);

// Ruta de prueba: solo usuarios autenticados
router.get('/perfil', verificarToken, (req, res) => {
  res.json({
    mensaje: 'Acceso autorizado',
    usuario: req.usuario,
  });
});

// Ruta de prueba: solo administradores
router.get('/solo-admin', verificarToken, verificarRol('administrador'), (req, res) => {
  res.json({ mensaje: 'Bienvenido administrador, tienes acceso total' });
});

module.exports = router;