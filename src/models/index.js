const Usuario = require('./Usuario');
const Libro = require('./Libro');
const Prestamo = require('./Prestamo');

// Definir relaciones
Usuario.hasMany(Prestamo, { foreignKey: 'usuario_id', as: 'prestamos' });
Prestamo.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

Libro.hasMany(Prestamo, { foreignKey: 'libro_id', as: 'prestamos' });
Prestamo.belongsTo(Libro, { foreignKey: 'libro_id', as: 'libro' });

module.exports = {
  Usuario,
  Libro,
  Prestamo
};