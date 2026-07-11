require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const notificacionRoutes = require('./routes/notificacionRoutes');
const { Server } = require('socket.io');
const sequelize = require('./config/database');
require('./models/Usuario');
require('./models/Cliente');
require('./models/associations');

const authRoutes = require('./routes/authRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const ventaRoutes = require('./routes/ventaRoutes');
const creditoRoutes = require('./routes/creditoRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const iniciarCronJobs = require('./jobs/scheduler');
const reporteRoutes = require('./routes/reporteRoutes');

const app = express();
const server = http.createServer(app); // servidor HTTP crudo, para que Socket.io se pueda "montar" sobre él

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware para que los controladores puedan acceder a "io" y emitir eventos
app.use((req, res, next) => {
  req.io = io;
  next();
});

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
app.use('/notificaciones', notificacionRoutes);
app.use('/reportes', reporteRoutes);

io.on('connection', (socket) => {
  console.log(`🔌 Cliente conectado por socket: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔌 Cliente desconectado: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

sequelize.sync()
  .then(() => {
    console.log('✅ Conexión a PostgreSQL exitosa y modelos sincronizados');
    server.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
    iniciarCronJobs(io);
  })
  .catch((error) => {
    console.error('❌ Error al conectar a la base de datos:', error);
  });