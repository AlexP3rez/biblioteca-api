const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Libro = sequelize.define('Libro', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  isbn: {
    type: DataTypes.STRING(20),
    unique: true
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  subtitulo: {
    type: DataTypes.STRING(255)
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  año_publicacion: {
    type: DataTypes.INTEGER
  },
  numero_paginas: {
    type: DataTypes.INTEGER
  },
  idioma: {
    type: DataTypes.STRING(50)
  },
  editorial_id: {
    type: DataTypes.INTEGER
  },
  categoria_id: {
    type: DataTypes.INTEGER
  },
  formato: {
    type: DataTypes.ENUM('fisico', 'digital', 'ambos'),
    defaultValue: 'fisico'
  },
  disponible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  cantidad_total: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  cantidad_disponible: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  ubicacion_fisica: {
    type: DataTypes.STRING(100)
  },
  portada_url: {
    type: DataTypes.STRING(255)
  }
}, {
  tableName: 'libros',
  timestamps: true,
  createdAt: 'creado_en',
  updatedAt: 'actualizado_en'
});

module.exports = Libro;