/**
 * Configuración de Winston Logger
 * Sistema de logs para toda la aplicación
 */

const winston = require('winston');
const path = require('path');

// Definir niveles de log personalizados
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Colores para consola
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

winston.addColors(colors);

// Formato de logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Transports (dónde se guardan los logs)
const transports = [
  // Consola
  new winston.transports.Console(),
  
  // Archivo de errores
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/error.log'),
    level: 'error'
  }),
  
  // Archivo de todos los logs
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/combined.log')
  })
];

// Crear logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  levels,
  format,
  transports
});

module.exports = logger;
