const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PublicRegistration = sequelize.define('PublicRegistration', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    organization: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'ES'
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'es'
    },
    trialEndsAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'expired', 'converted'),
      defaultValue: 'pending'
    },
    accessToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'public_registrations',
    timestamps: true
  });

module.exports = PublicRegistration;
