/**
 * Modelo de Subvención
 * Gestión de convocatorias de subvenciones y ayudas
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Grant = sequelize.define('Grant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  organismo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  url_convocatoria: {
    type: DataTypes.STRING
  },
  ambito: {
    type: DataTypes.ENUM('local', 'provincial', 'autonomico', 'nacional', 'europeo'),
    defaultValue: 'nacional'
  },
  importe_maximo: {
    type: DataTypes.DECIMAL(12, 2)
  },
  fecha_publicacion: {
    type: DataTypes.DATEONLY
  },
  fecha_limite: {
    type: DataTypes.DATEONLY
  },
  estado: {
    type: DataTypes.ENUM('abierta', 'cerrada', 'en_evaluacion', 'concedida', 'denegada'),
    defaultValue: 'abierta'
  },
  requisitos: {
    type: DataTypes.TEXT
  },
  palabras_clave: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  relevancia: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  solicitada: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  fecha_solicitud: {
    type: DataTypes.DATEONLY
  },
  documentos: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  notas: {
    type: DataTypes.TEXT
  },
  alertada: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'subvenciones'
});

module.exports = Grant;
