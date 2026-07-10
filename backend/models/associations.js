const Usuario = require('./Usuario');
const Cliente = require('./Cliente');
const Venta = require('./Venta');
const DetalleVenta = require('./DetalleVenta');
const Credito = require('./Credito');
const Pago = require('./Pago');

// Cliente - Venta
Cliente.hasMany(Venta, { foreignKey: 'cliente_id' });
Venta.belongsTo(Cliente, { foreignKey: 'cliente_id' });

// Usuario - Venta
Usuario.hasMany(Venta, { foreignKey: 'usuario_id' });
Venta.belongsTo(Usuario, { foreignKey: 'usuario_id' });

// Venta - DetalleVenta
Venta.hasMany(DetalleVenta, { foreignKey: 'venta_id', as: 'detalles' });
DetalleVenta.belongsTo(Venta, { foreignKey: 'venta_id' });

// Venta - Credito (1 a 1: una venta fiada genera un crédito)
Venta.hasOne(Credito, { foreignKey: 'venta_id' });
Credito.belongsTo(Venta, { foreignKey: 'venta_id' });

// Cliente - Credito
Cliente.hasMany(Credito, { foreignKey: 'cliente_id' });
Credito.belongsTo(Cliente, { foreignKey: 'cliente_id' });

// Credito - Pago
Credito.hasMany(Pago, { foreignKey: 'credito_id', as: 'pagos' });
Pago.belongsTo(Credito, { foreignKey: 'credito_id' });

// Usuario - Pago (quién registró el pago)
Usuario.hasMany(Pago, { foreignKey: 'usuario_id' });
Pago.belongsTo(Usuario, { foreignKey: 'usuario_id' });

module.exports = { Usuario, Cliente, Venta, DetalleVenta, Credito, Pago };