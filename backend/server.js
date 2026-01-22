/**
 * Configuración del servidor Express
 * Sistema de Gestión para Asociación de Protección Civil
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Importar configuración de base de datos
const sequelize = require('./config/database');
const logger = require('./config/logger');

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const publicRoutes = require('./routes/public.routes');
const adminRoutes = require('./routes/admin.routes');
const volunteerRoutes = require('./routes/volunteer.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const financeRoutes = require('./routes/finance.routes');
const eventRoutes = require('./routes/event.routes');
const grantRoutes = require('./routes/grant.routes');
const weatherRoutes = require('./routes/weather.routes');
const meshRoutes = require('./routes/mesh.routes');
const transportRoutes = require('./routes/transport.routes');
const droneRoutes = require('./routes/drone.routes');
const riskMapRoutes = require('./routes/riskMap.routes');
const fleetRoutes = require('./routes/fleet.routes');

// Importar servicios
const meshService = require('./services/mesh.service');
const weatherService = require('./services/weather.service');
const grantScraperService = require('./services/grantScraper.service');
const advancedGrantScraper = require('./services/advancedGrantScraper.service');
const grantDocumentGenerator = require('./services/grantDocumentGenerator.service');

// Crear aplicación Express
const app = express();
const server = http.createServer(app);

// Configurar Socket.io para comunicaciones en tiempo real
const io = socketIo(server, {
  cors: {
    origin: [
      'http://localhost:3000',
      'https://app.resqnet.es',
      'https://www.resqnet.es',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Hacer io accesible en toda la app
app.set('io', io);

// Middleware de seguridad
app.use(helmet());

// CORS - permitir peticiones desde el frontend
const allowedOrigins = [
  'http://localhost:3000',
  'https://app.resqnet.es',
  'https://www.resqnet.es',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Permitir peticiones sin origin (como curl, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Comprimir respuestas
app.use(compression());

// Logger de peticiones HTTP
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
}

// Parsear JSON y URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/grants', grantRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/mesh', meshRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/drones', droneRoutes);
app.use('/api/risk-map', riskMapRoutes);
app.use('/api/fleet', fleetRoutes);

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    environment: process.env.NODE_ENV 
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.path 
  });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  logger.error('Error no manejado:', err);
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Configurar WebSocket para posiciones mesh en tiempo real
io.on('connection', (socket) => {
  logger.info(`Cliente WebSocket conectado: ${socket.id}`);
  
  socket.on('disconnect', () => {
    logger.info(`Cliente WebSocket desconectado: ${socket.id}`);
  });
  
  // Unirse a sala de actualizaciones mesh
  socket.on('join-mesh', () => {
    socket.join('mesh-updates');
    logger.info(`Cliente ${socket.id} unido a mesh-updates`);
  });
  
  // Unirse a sala de alertas meteorológicas
  socket.on('join-weather', () => {
    socket.join('weather-alerts');
    logger.info(`Cliente ${socket.id} unido a weather-alerts`);
  });
});

// Puerto del servidor
const PORT = process.env.PORT || 5000;

// Inicializar servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    logger.info('✓ Conexión a la base de datos establecida');
    
    // Sincronizar modelos (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false });
      logger.info('✓ Modelos sincronizados con la base de datos');
    }
    
    // Iniciar servicios en segundo plano
    if (process.env.NODE_ENV !== 'test') {
      // Servicio de comunicaciones mesh
      meshService.initialize(io);
      logger.info('✓ Servicio Meshtastic inicializado');
      
      // Servicio avanzado de scraping de subvenciones
      advancedGrantScraper.startScheduledScraping();
      logger.info('✓ Sistema avanzado de scraping de subvenciones iniciado');
      
      // Servicio de datos meteorológicos (cada hora)
      weatherService.startWeatherMonitoring(io);
      logger.info('✓ Monitor meteorológico iniciado');
    }
    
    // Iniciar servidor HTTP
    server.listen(PORT, () => {
      logger.info(`🚀 Servidor corriendo en puerto ${PORT}`);
      logger.info(`📡 WebSocket disponible en ws://localhost:${PORT}`);
      logger.info(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
    
  } catch (error) {
    logger.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de cierre graceful
process.on('SIGTERM', async () => {
  logger.info('SIGTERM recibido, cerrando servidor...');
  server.close(async () => {
    await sequelize.close();
    logger.info('Servidor cerrado correctamente');
    process.exit(0);
  });
});

// Iniciar servidor
if (require.main === module) {
  startServer();
}

module.exports = { app, server, io };
