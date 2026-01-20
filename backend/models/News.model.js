/**
 * Modelo de Noticia
 * Gestión de noticias y publicaciones del blog
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const News = sequelize.define('News', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  resumen: {
    type: DataTypes.TEXT
  },
  contenido: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  imagen_destacada: {
    type: DataTypes.STRING
  },
  categoria: {
    type: DataTypes.ENUM(
      'emergencia',
      'formacion',
      'evento',
      'reconocimiento',
      'convenio',
      'general'
    ),
    defaultValue: 'general'
  },
  autor_id: {
    type: DataTypes.UUID,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  publicada: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  fecha_publicacion: {
    type: DataTypes.DATE
  },
  destacada: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  etiquetas: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  visitas: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'noticias'
});

module.exports = News;
