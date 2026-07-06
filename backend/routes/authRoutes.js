const express = require('express');
const router = express.Router();
const {
  registrar,
  login,
  verificarEmail,
  solicitarRecuperacion,
  restablecerPassword,
} = require('../controllers/authController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

router.post('/registro', registrar);
router.post('/login', login);
router.get('/verificar-email/:token', verificarEmail);
router.post('/recuperar-password', solicitarRecuperacion);
router.post('/restablecer-password/:token', restablecerPassword);

// Rutas de prueba (ya las teníamos)
router.get('/perfil', verificarToken, (req, res) => {
  res.json({ mensaje: 'Acceso autorizado', usuario: req.usuario });
});

router.get('/solo-admin', verificarToken, verificarRol('administrador'), (req, res) => {
  res.json({ mensaje: 'Bienvenido administrador, tienes acceso total' });
});

module.exports = router;