const Usuario = require('./Usuario');
const Cliente = require('./Cliente');
const Venta = require('./Venta');
const DetalleVenta = require('./DetalleVenta');

// Un cliente tiene muchas ventas
Cliente.hasMany(Venta, { foreignKey: 'cliente_id' });
Venta.belongsTo(Cliente, { foreignKey: 'cliente_id' });

// Un usuario (cajero/admin/supervisor) registra muchas ventas
Usuario.hasMany(Venta, { foreignKey: 'usuario_id' });
Venta.belongsTo(Usuario, { foreignKey: 'usuario_id' });

// Una venta tiene muchos detalles (ítems)
Venta.hasMany(DetalleVenta, { foreignKey: 'venta_id', as: 'detalles' });
DetalleVenta.belongsTo(Venta, { foreignKey: 'venta_id' });

module.exports = { Usuario, Cliente, Venta, DetalleVenta };