const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Prestamo = sequelize.define('Prestamo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  libro_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha_prestamo: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  fecha_devolucion_esperada: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  fecha_devolucion_real: {
    type: DataTypes.DATEONLY
  },
  estado: {
    type: DataTypes.ENUM('activo', 'devuelto', 'vencido', 'renovado'),
    defaultValue: 'activo'
  },
  renovaciones: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  notas: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'prestamos',
  timestamps: false
});

module.exports = Prestamo;