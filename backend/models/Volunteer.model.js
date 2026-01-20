/**
 * Modelo de Voluntario
 * Información detallada de cada voluntario de la asociación
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Volunteer = sequelize.define('Volunteer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'id'
    }
  },
  dni: {
    type: DataTypes.STRING,
    unique: true
  },
  fecha_nacimiento: {
    type: DataTypes.DATEONLY
  },
  direccion: {
    type: DataTypes.TEXT
  },
  municipio: {
    type: DataTypes.STRING
  },
  codigo_postal: {
    type: DataTypes.STRING
  },
  telefono_emergencia: {
    type: DataTypes.STRING
  },
  contacto_emergencia: {
    type: DataTypes.STRING
  },
  grupo_sanguineo: {
    type: DataTypes.STRING
  },
  alergias: {
    type: DataTypes.TEXT
  },
  condiciones_medicas: {
    type: DataTypes.TEXT
  },
  talla_uniforme: {
    type: DataTypes.STRING
  },
  numero_calzado: {
    type: DataTypes.STRING
  },
  fecha_alta: {
    type: DataTypes.DATEONLY,
    defaultValue: DataTypes.NOW
  },
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo', 'baja', 'pendiente'),
    defaultValue: 'pendiente'
  },
  especialidades: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  formacion: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  disponibilidad: {
    type: DataTypes.JSONB,
    defaultValue: {
      lunes: { disponible: false, horario: '' },
      martes: { disponible: false, horario: '' },
      miercoles: { disponible: false, horario: '' },
      jueves: { disponible: false, horario: '' },
      viernes: { disponible: false, horario: '' },
      sabado: { disponible: false, horario: '' },
      domingo: { disponible: false, horario: '' }
    }
  },
  horas_servicio: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  servicios_realizados: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  observaciones: {
    type: DataTypes.TEXT
  },
  foto: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'voluntarios'
});

module.exports = Volunteer;
