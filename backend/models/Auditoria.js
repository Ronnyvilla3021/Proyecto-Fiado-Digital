const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Auditoria = sequelize.define('Auditoria', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // por si algún día una acción la dispara el sistema (cron), no un usuario
  },
  accion: {
    type: DataTypes.ENUM('crear', 'editar', 'desactivar', 'reactivar', 'pago'),
    allowNull: false,
  },
  entidad: {
    type: DataTypes.STRING, // 'cliente', 'venta', 'credito', etc.
    allowNull: false,
  },
  entidad_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  detalles: {
    type: DataTypes.JSONB, // guarda los cambios exactos (campo: valor anterior -> nuevo)
    allowNull: true,
  },
}, {
  tableName: 'auditoria',
  timestamps: true,
  updatedAt: false, // un registro de auditoría nunca se edita, solo se crea
});

module.exports = Auditoria;