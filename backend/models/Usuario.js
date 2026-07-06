const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rol: {
    type: DataTypes.ENUM('administrador', 'cajero', 'supervisor'),
    allowNull: false,
    defaultValue: 'cajero',
  },
  email_verificado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  token_verificacion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  token_recuperacion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  token_recuperacion_expira: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'usuarios',
  timestamps: true, // agrega createdAt y updatedAt automáticamente
});

module.exports = Usuario;