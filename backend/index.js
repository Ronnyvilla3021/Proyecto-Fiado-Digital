require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
require('./models/Usuario');
require('./models/Usuario');
require('./models/Cliente');

const authRoutes = require('./routes/authRoutes');
const clienteRoutes = require('./routes/clienteRoutes');

const app = express();


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ mensaje: 'API Fiado Digital funcionando correctamente 🚀' });
});

app.use('/auth', authRoutes);
app.use('/clientes', clienteRoutes);

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