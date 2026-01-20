/**
 * Script de migración de base de datos
 * Crea todas las tablas necesarias
 */

const models = require('../models');
const logger = require('../config/logger');

async function migrate() {
  try {
    logger.info('Iniciando migración de base de datos...');
    
    // Sincronizar todos los modelos (crea las tablas)
    await models.sequelize.sync({ force: false, alter: true });
    
    logger.info('✓ Migración completada exitosamente');
    logger.info('Tablas creadas:');
    logger.info('  - usuarios');
    logger.info('  - voluntarios');
    logger.info('  - eventos');
    logger.info('  - eventos_voluntarios');
    logger.info('  - inventario');
    logger.info('  - facturas');
    logger.info('  - proyectos');
    logger.info('  - noticias');
    logger.info('  - anuncios');
    logger.info('  - subvenciones');
    logger.info('  - mesh_positions');
    logger.info('  - datos_meteorologicos');
    logger.info('  - transporte_rural');
    logger.info('  - drones');
    logger.info('  - mapa_riesgos');
    
    process.exit(0);
    
  } catch (error) {
    logger.error('Error en migración:', error);
    process.exit(1);
  }
}

migrate();
