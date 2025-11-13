const { Prestamo, Usuario, Libro } = require('../models');
const { Op } = require('sequelize');

// @desc    Obtener todos los préstamos
// @route   GET /api/prestamos
// @access  Private
exports.obtenerPrestamos = async (req, res) => {
  try {
    const { page = 1, limit = 10, estado, usuario_id } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Filtros
    if (estado) where.estado = estado;
    if (usuario_id) where.usuario_id = usuario_id;

    const { count, rows: prestamos } = await Prestamo.findAndCountAll({
      where,
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email']
        },
        {
          model: Libro,
          as: 'libro',
          attributes: ['id', 'titulo', 'isbn', 'subtitulo', 'descripcion']  // ✅ SIN 'autor'
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fecha_prestamo', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: prestamos,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener préstamos:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener préstamos',
      error: error.message
    });
  }
};

// @desc    Obtener préstamos del usuario autenticado
// @route   GET /api/prestamos/mis-prestamos
// @access  Private
exports.obtenerMisPrestamos = async (req, res) => {
  try {
    const prestamos = await Prestamo.findAll({
      where: { usuario_id: req.usuario.id },
      include: [
        {
          model: Libro,
          as: 'libro',
          attributes: ['id', 'titulo', 'isbn', 'subtitulo', 'descripcion', 'portada_url', 'disponible'] // ✅ CORREGIDO
        }
      ],
      order: [['fecha_prestamo', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: prestamos
    });
  } catch (error) {
    console.error('Error al obtener mis préstamos:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener préstamos',
      error: error.message
    });
  }
};

// @desc    Crear nuevo préstamo
// @route   POST /api/prestamos
// @access  Private
exports.crearPrestamo = async (req, res) => {
  try {
    const { libro_id, usuario_id, fecha_devolucion_esperada, notas } = req.body;

    // Verificar que el libro existe y está disponible
    const libro = await Libro.findByPk(libro_id);
    if (!libro) {
      return res.status(404).json({
        success: false,
        mensaje: 'Libro no encontrado'
      });
    }

    if (libro.cantidad_disponible <= 0) {
      return res.status(400).json({
        success: false,
        mensaje: 'Libro no disponible para préstamo'
      });
    }

    // Verificar que el usuario no tenga préstamos vencidos
    const prestamosVencidos = await Prestamo.count({
      where: {
        usuario_id: usuario_id || req.usuario.id,
        estado: 'vencido'
      }
    });

    if (prestamosVencidos > 0) {
      return res.status(400).json({
        success: false,
        mensaje: 'No puede realizar préstamos con préstamos vencidos pendientes'
      });
    }

    // Crear préstamo
    const prestamo = await Prestamo.create({
      usuario_id: usuario_id || req.usuario.id,
      libro_id,
      fecha_devolucion_esperada,
      notas,
      estado: 'activo'
    });

    // Actualizar disponibilidad del libro
    libro.cantidad_disponible -= 1;
    if (libro.cantidad_disponible === 0) {
      libro.disponible = false;
    }
    await libro.save();

    // Obtener préstamo con relaciones
    const prestamoCompleto = await Prestamo.findByPk(prestamo.id, {
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'apellido', 'email']
        },
        {
          model: Libro,
          as: 'libro',
          attributes: ['id', 'titulo', 'isbn']
        }
      ]
    });

    res.status(201).json({
      success: true,
      mensaje: 'Préstamo creado exitosamente',
      data: prestamoCompleto
    });
  } catch (error) {
    console.error('Error al crear préstamo:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al crear préstamo',
      error: error.message
    });
  }
};

// @desc    Devolver libro (actualizar préstamo)
// @route   PUT /api/prestamos/:id/devolver
// @access  Private
exports.devolverLibro = async (req, res) => {
  try {
    const prestamo = await Prestamo.findByPk(req.params.id);

    if (!prestamo) {
      return res.status(404).json({
        success: false,
        mensaje: 'Préstamo no encontrado'
      });
    }

    if (prestamo.estado === 'devuelto') {
      return res.status(400).json({
        success: false,
        mensaje: 'El libro ya fue devuelto'
      });
    }

    // Actualizar préstamo
    prestamo.fecha_devolucion_real = new Date();
    prestamo.estado = 'devuelto';
    await prestamo.save();

    // Actualizar disponibilidad del libro
    const libro = await Libro.findByPk(prestamo.libro_id);
    libro.cantidad_disponible += 1;
    libro.disponible = true;
    await libro.save();

    res.status(200).json({
      success: true,
      mensaje: 'Libro devuelto exitosamente',
      data: prestamo
    });
  } catch (error) {
    console.error('Error al devolver libro:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al devolver libro',
      error: error.message
    });
  }
};

// @desc    Renovar préstamo
// @route   PUT /api/prestamos/:id/renovar
// @access  Private
exports.renovarPrestamo = async (req, res) => {
  try {
    const prestamo = await Prestamo.findByPk(req.params.id);

    if (!prestamo) {
      return res.status(404).json({
        success: false,
        mensaje: 'Préstamo no encontrado'
      });
    }

    if (prestamo.estado !== 'activo') {
      return res.status(400).json({
        success: false,
        mensaje: 'Solo se pueden renovar préstamos activos'
      });
    }

    if (prestamo.renovaciones >= 2) {
      return res.status(400).json({
        success: false,
        mensaje: 'Se alcanzó el límite de renovaciones'
      });
    }

    // Renovar préstamo (agregar 15 días)
    const nuevaFecha = new Date(prestamo.fecha_devolucion_esperada);
    nuevaFecha.setDate(nuevaFecha.getDate() + 15);

    prestamo.fecha_devolucion_esperada = nuevaFecha;
    prestamo.renovaciones += 1;
    prestamo.estado = 'renovado';
    await prestamo.save();

    res.status(200).json({
      success: true,
      mensaje: 'Préstamo renovado exitosamente',
      data: prestamo
    });
  } catch (error) {
    console.error('Error al renovar préstamo:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al renovar préstamo',
      error: error.message
    });
  }
};