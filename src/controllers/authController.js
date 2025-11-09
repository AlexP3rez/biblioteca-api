const Usuario = require('../models/Usuario');
const { generarToken } = require('../utils/jwt');

// @desc    Registrar nuevo usuario
// @route   POST /api/auth/registro
// @access  Public
exports.registro = async (req, res) => {
  try {
    const { nombre, apellido, email, password, telefono, fecha_nacimiento, direccion, tipo_usuario } = req.body;

    // Verificar si el usuario ya existe
    const usuarioExiste = await Usuario.findOne({ where: { email } });
    if (usuarioExiste) {
      return res.status(400).json({
        success: false,
        mensaje: 'El email ya está registrado'
      });
    }

    // Crear usuario
    const usuario = await Usuario.create({
      nombre,
      apellido,
      email,
      password,
      telefono,
      fecha_nacimiento,
      direccion,
      tipo_usuario: tipo_usuario || 'estudiante'
    });

    // Generar token
    const token = generarToken(usuario.id);

    res.status(201).json({
      success: true,
      mensaje: 'Usuario registrado exitosamente',
      data: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario
      },
      token
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al registrar usuario',
      error: error.message
    });
  }
};

// @desc    Login de usuario
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar datos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        mensaje: 'Por favor proporcione email y password'
      });
    }

    // Buscar usuario
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({
        success: false,
        mensaje: 'Credenciales inválidas'
      });
    }

    // Verificar password
    const passwordValido = await usuario.compararPassword(password);
    if (!passwordValido) {
      return res.status(401).json({
        success: false,
        mensaje: 'Credenciales inválidas'
      });
    }

    // Verificar estado del usuario
    if (usuario.estado !== 'activo') {
      return res.status(403).json({
        success: false,
        mensaje: 'Usuario inactivo o suspendido'
      });
    }

    // Generar token
    const token = generarToken(usuario.id);

    res.status(200).json({
      success: true,
      mensaje: 'Login exitoso',
      data: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario,
        estado: usuario.estado
      },
      token
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

// @desc    Obtener perfil del usuario autenticado
// @route   GET /api/auth/perfil
// @access  Private
exports.obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id, {
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({
      success: true,
      data: usuario
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener perfil',
      error: error.message
    });
  }
};

// @desc    Actualizar perfil del usuario
// @route   PUT /api/auth/perfil
// @access  Private
exports.actualizarPerfil = async (req, res) => {
  try {
    const { nombre, apellido, telefono, direccion, fecha_nacimiento } = req.body;

    const usuario = await Usuario.findByPk(req.usuario.id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    // Actualizar campos
    if (nombre) usuario.nombre = nombre;
    if (apellido) usuario.apellido = apellido;
    if (telefono) usuario.telefono = telefono;
    if (direccion) usuario.direccion = direccion;
    if (fecha_nacimiento) usuario.fecha_nacimiento = fecha_nacimiento;

    await usuario.save();

    res.status(200).json({
      success: true,
      mensaje: 'Perfil actualizado exitosamente',
      data: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        telefono: usuario.telefono,
        direccion: usuario.direccion,
        fecha_nacimiento: usuario.fecha_nacimiento
      }
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al actualizar perfil',
      error: error.message
    });
  }
};