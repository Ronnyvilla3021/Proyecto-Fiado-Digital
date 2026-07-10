require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dashboardRoutes = require('./routes/dashboardRoutes');
const sequelize = require('./config/database');
require('./models/Usuario');
require('./models/Cliente');
require('./models/associations');

const authRoutes = require('./routes/authRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const ventaRoutes = require('./routes/ventaRoutes');
const creditoRoutes = require('./routes/creditoRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensaje: 'API Fiado Digital funcionando correctamente 🚀' });
});

app.use('/auth', authRoutes);
app.use('/clientes', clienteRoutes);
app.use('/ventas', ventaRoutes);
app.use('/creditos', creditoRoutes);
app.use('/dashboard', dashboardRoutes);

const PORT = process.env.PORT || 5000;

sequelize.sync()
  .then(() => {
    console.log('✅ Conexión a PostgreSQL exitosa y modelos sincronizados');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Error al conectar a la base de datos:', error);
  });