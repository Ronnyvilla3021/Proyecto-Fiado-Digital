const express = require('express');
const router = express.Router();
const {
  crearCliente,
  listarClientes,
  obtenerCliente,
  editarCliente,
  eliminarCliente,
} = require('../controllers/clienteController');
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware');

// Todas las rutas requieren estar autenticado
router.use(verificarToken);

router.post('/', verificarRol('administrador', 'supervisor', 'cajero'), crearCliente);
router.get('/', listarClientes); // cualquier rol autenticado puede ver/buscar clientes
router.get('/:id', obtenerCliente);
router.put('/:id', verificarRol('administrador', 'supervisor', 'cajero'), editarCliente);
router.delete('/:id', verificarRol('administrador'), eliminarCliente);

module.exports = router;