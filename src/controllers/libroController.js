const { Libro } = require('../models');
const { Op } = require('sequelize');

// @desc    Obtener todos los libros
// @route   GET /api/libros
// @access  Public
exports.obtenerLibros = async (req, res) => {
  try {
    const { page = 1, limit = 10, categoria_id, formato, disponible, buscar } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Filtros
    if (categoria_id) where.categoria_id = categoria_id;
    if (formato) where.formato = formato;
    if (disponible !== undefined) where.disponible = disponible === 'true';
    if (buscar) {
      where[Op.or] = [
        { titulo: { [Op.like]: `%${buscar}%` } },
        { isbn: { [Op.like]: `%${buscar}%` } },
        { descripcion: { [Op.like]: `%${buscar}%` } }
      ];
    }

    const { count, rows: libros } = await Libro.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['creado_en', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: libros,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener libros:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener libros',
      error: error.message
    });
  }
};

// @desc    Obtener un libro por ID
// @route   GET /api/libros/:id
// @access  Public
exports.obtenerLibroPorId = async (req, res) => {
  try {
    const libro = await Libro.findByPk(req.params.id);

    if (!libro) {
      return res.status(404).json({
        success: false,
        mensaje: 'Libro no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: libro
    });
  } catch (error) {
    console.error('Error al obtener libro:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener libro',
      error: error.message
    });
  }
};

// @desc    Crear nuevo libro
// @route   POST /api/libros
// @access  Private/Admin
exports.crearLibro = async (req, res) => {
  try {
    const {
      isbn, titulo, subtitulo, descripcion, año_publicacion,
      numero_paginas, idioma, editorial_id, categoria_id,
      formato, cantidad_total, ubicacion_fisica, portada_url
    } = req.body;

    // Verificar si el ISBN ya existe
    if (isbn) {
      const libroExiste = await Libro.findOne({ where: { isbn } });
      if (libroExiste) {
        return res.status(400).json({
          success: false,
          mensaje: 'El ISBN ya existe en el sistema'
        });
      }
    }

    const libro = await Libro.create({
      isbn,
      titulo,
      subtitulo,
      descripcion,
      año_publicacion,
      numero_paginas,
      idioma,
      editorial_id,
      categoria_id,
      formato,
      cantidad_total,
      cantidad_disponible: cantidad_total,
      ubicacion_fisica,
      portada_url
    });

    res.status(201).json({
      success: true,
      mensaje: 'Libro creado exitosamente',
      data: libro
    });
  } catch (error) {
    console.error('Error al crear libro:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al crear libro',
      error: error.message
    });
  }
};

// @desc    Actualizar libro
// @route   PUT /api/libros/:id
// @access  Private/Admin
exports.actualizarLibro = async (req, res) => {
  try {
    const libro = await Libro.findByPk(req.params.id);

    if (!libro) {
      return res.status(404).json({
        success: false,
        mensaje: 'Libro no encontrado'
      });
    }

    const camposActualizables = [
      'titulo', 'subtitulo', 'descripcion', 'año_publicacion',
      'numero_paginas', 'idioma', 'editorial_id', 'categoria_id',
      'formato', 'cantidad_total', 'cantidad_disponible',
      'ubicacion_fisica', 'portada_url', 'disponible'
    ];

    camposActualizables.forEach(campo => {
      if (req.body[campo] !== undefined) {
        libro[campo] = req.body[campo];
      }
    });

    await libro.save();

    res.status(200).json({
      success: true,
      mensaje: 'Libro actualizado exitosamente',
      data: libro
    });
  } catch (error) {
    console.error('Error al actualizar libro:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al actualizar libro',
      error: error.message
    });
  }
};

// @desc    Eliminar libro
// @route   DELETE /api/libros/:id
// @access  Private/Admin
exports.eliminarLibro = async (req, res) => {
  try {
    const libro = await Libro.findByPk(req.params.id);

    if (!libro) {
      return res.status(404).json({
        success: false,
        mensaje: 'Libro no encontrado'
      });
    }

    // Verificar si el libro tiene préstamos activos
    const Prestamo = require('../models/Prestamo');
    const prestamosActivos = await Prestamo.count({
      where: {
        libro_id: req.params.id,
        estado: ['activo', 'renovado']
      }
    });

    if (prestamosActivos > 0) {
      return res.status(400).json({
        success: false,
        mensaje: `No se puede eliminar el libro. Tiene ${prestamosActivos} préstamo(s) activo(s)`,
        prestamos_activos: prestamosActivos
      });
    }

    // Verificar si el libro tiene préstamos históricos
    const prestamosHistoricos = await Prestamo.count({
      where: {
        libro_id: req.params.id
      }
    });

    if (prestamosHistoricos > 0) {
      return res.status(400).json({
        success: false,
        mensaje: `No se puede eliminar el libro. Tiene ${prestamosHistoricos} préstamo(s) en el historial. Considere marcarlo como no disponible en su lugar`,
        prestamos_historicos: prestamosHistoricos,
        sugerencia: 'Use PUT /api/libros/:id con {"disponible": false} para ocultarlo'
      });
    }

    // Si no tiene préstamos, se puede eliminar
    await libro.destroy();

    res.status(200).json({
      success: true,
      mensaje: 'Libro eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar libro:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al eliminar libro',
      error: error.message
    });
  }
};