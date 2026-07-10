const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Credito = sequelize.define('Credito', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  venta_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cliente_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  monto_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  saldo: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  fecha_limite: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'pagado', 'vencido'),
    allowNull: false,
    defaultValue: 'pendiente',
  },
}, {
  tableName: 'creditos',
  timestamps: true,
});

module.exports = Credito;