// Middleware para manejo de errores
exports.errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  let error = { ...err };
  error.message = err.message;

  // Error de Sequelize - validación
  if (err.name === 'SequelizeValidationError') {
    const mensaje = err.errors.map(e => e.message).join(', ');
    error.message = mensaje;
    error.statusCode = 400;
  }

  // Error de Sequelize - llave única
  if (err.name === 'SequelizeUniqueConstraintError') {
    error.message = 'El valor ya existe en la base de datos';
    error.statusCode = 400;
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Token inválido';
    error.statusCode = 401;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    mensaje: error.message || 'Error del servidor',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
};