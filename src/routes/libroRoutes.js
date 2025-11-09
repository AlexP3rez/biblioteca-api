const express = require('express');
const router = express.Router();
const {
  obtenerLibros,
  obtenerLibroPorId,
  crearLibro,
  actualizarLibro,
  eliminarLibro
} = require('../controllers/libroController');
const { protegerRuta, autorizarRoles } = require('../middlewares/auth');

// Rutas públicas
router.get('/', obtenerLibros);
router.get('/:id', obtenerLibroPorId);

// Rutas protegidas (solo administradores)
router.post('/', protegerRuta, autorizarRoles('administrador'), crearLibro);
router.put('/:id', protegerRuta, autorizarRoles('administrador'), actualizarLibro);
router.delete('/:id', protegerRuta, autorizarRoles('administrador'), eliminarLibro);

module.exports = router;