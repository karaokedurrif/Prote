/**
 * Modelo de Usuario
 * Gestiona usuarios del sistema con diferentes roles
 */

const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellidos: {
    type: DataTypes.STRING,
    allowNull: false
  },
  telefono: {
    type: DataTypes.STRING
  },
  rol: {
    type: DataTypes.ENUM('admin', 'voluntario', 'tesorero', 'coordinador', 'usuario'),
    defaultValue: 'usuario'
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  foto_perfil: {
    type: DataTypes.STRING
  },
  ultimo_acceso: {
    type: DataTypes.DATE
  },
  consentimiento_rgpd: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  fecha_consentimiento: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'usuarios',
  hooks: {
    // Hash de contraseña antes de crear
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    // Hash de contraseña antes de actualizar
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Método para verificar contraseña
User.prototype.verificarPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Método para obtener datos públicos (sin password)
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;
