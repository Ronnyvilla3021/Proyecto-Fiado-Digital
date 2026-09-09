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
const auditoriaRoutes = require('./routes/auditoriaRoutes');

const app = express();
const server = http.createServer(app);

// 🔥 CONFIGURACIÓN DE CORS UNIFICADA (Abre para Vercel y para local)
const allowedOrigins = [process.env.FRONTEND_URL, 'http://localhost:5173'];
app.use(cors({
  origin: function (origin, callback) {
    // Si no hay origin (ej: desde Postman) o está en la lista, permitir
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));

app.use(express.json());

// Endpoint de salud para UptimeRobot
app.get('/', (req, res) => {
  res.json({ mensaje: 'API Fiado Digital funcionando correctamente 🚀' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Montar rutas con el prefijo /api
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/creditos', creditoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/auditoria', auditoriaRoutes);

// 🔥 CONFIGURACIÓN DE SOCKET.IO (Debe estar conectado al CORS)
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

// Middleware para que los controladores puedan acceder a "io"
app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  console.log(`🔌 Cliente conectado por socket: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`🔌 Cliente desconectado: ${socket.id}`);
  });
});

// 🔥 PUERTO: Usa el que Render le asigne, o el 3000 en local
const PORT = process.env.PORT || 3000;

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