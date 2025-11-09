const express = require('express');
const router = express.Router();
const {
  obtenerPrestamos,
  obtenerMisPrestamos,
  crearPrestamo,
  devolverLibro,
  renovarPrestamo
} = require('../controllers/prestamoController');
const { protegerRuta, autorizarRoles } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(protegerRuta);

// Rutas para todos los usuarios autenticados
router.get('/mis-prestamos', obtenerMisPrestamos);
router.post('/', crearPrestamo);
router.put('/:id/renovar', renovarPrestamo);

// Rutas solo para administradores
router.get('/', autorizarRoles('administrador'), obtenerPrestamos);
router.put('/:id/devolver', autorizarRoles('administrador'), devolverLibro);

module.exports = router;