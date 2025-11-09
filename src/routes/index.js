const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const libroRoutes = require('./libroRoutes');
const prestamoRoutes = require('./prestamoRoutes');

// Definir rutas
router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/libros', libroRoutes);
router.use('/prestamos', prestamoRoutes);

// Ruta raíz de la API
router.get('/', (req, res) => {
  res.json({
    success: true,
    mensaje: 'API de Biblioteca Digital',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      usuarios: '/api/usuarios',
      libros: '/api/libros',
      prestamos: '/api/prestamos'
    }
  });
});

module.exports = router;