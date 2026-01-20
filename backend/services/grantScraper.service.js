/**
 * Servicio de scraping de subvenciones
 * Busca automáticamente convocatorias en portales oficiales
 */

const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const { Grant } = require('../models');
const logger = require('../config/logger');

class GrantScraperService {
  constructor() {
    this.scheduledJob = null;
    
    // URLs de portales de subvenciones
    this.sources = [
      {
        name: 'Base de Datos Nacional de Subvenciones',
        url: 'https://www.infosubvenciones.es/bdnstrans/GE/es/index',
        type: 'nacional'
      },
      // Añadir más fuentes según necesidad
    ];
  }

  /**
   * Iniciar scraping programado
   */
  startScheduledScraping() {
    // Ejecutar diariamente a las 6:00 AM
    this.scheduledJob = cron.schedule('0 6 * * *', () => {
      logger.info('Iniciando scraping programado de subvenciones');
      this.scrapeAllSources();
    });
    
    logger.info('Scraping de subvenciones programado para las 6:00 AM diarias');
  }

  /**
   * Scrapear todas las fuentes
   */
  async scrapeAllSources() {
    for (const source of this.sources) {
      await this.scrapeSource(source);
    }
  }

  /**
   * Scrapear una fuente específica
   */
  async scrapeSource(source) {
    try {
      logger.info(`Scraping ${source.name}...`);
      
      // NOTA: Este es un ejemplo conceptual. El scraping real dependerá
      // de la estructura específica de cada sitio web y sus políticas.
      // Se recomienda usar APIs oficiales cuando estén disponibles.
      
      // Ejemplo de uso de API oficial (recomendado)
      if (source.name.includes('Nacional')) {
        await this.scrapeNationalDatabase();
      }
      
    } catch (error) {
      logger.error(`Error al scrapear ${source.name}:`, error.message);
    }
  }

  /**
   * Scrapear base de datos nacional (ejemplo)
   */
  async scrapeNationalDatabase() {
    try {
      // TODO: Implementar acceso a API oficial o scraping
      // Este es un ejemplo simulado
      
      const subvencionesEjemplo = [
        {
          titulo: 'Ayudas para equipamiento de protección civil',
          organismo: 'Ministerio del Interior',
          descripcion: 'Subvenciones para la adquisición de equipamiento y material para agrupaciones de voluntarios de protección civil',
          url_convocatoria: 'https://ejemplo.gov.es/convocatoria-2024',
          ambito: 'nacional',
          importe_maximo: 50000,
          fecha_publicacion: new Date('2024-01-15'),
          fecha_limite: new Date('2024-03-31'),
          palabras_clave: ['protección civil', 'voluntarios', 'equipamiento'],
          relevancia: 95
        }
      ];
      
      // Guardar o actualizar subvenciones
      for (const subvencion of subvencionesEjemplo) {
        await this.saveGrant(subvencion);
      }
      
      logger.info(`Procesadas ${subvencionesEjemplo.length} subvenciones`);
      
    } catch (error) {
      logger.error('Error en scraping de base nacional:', error);
    }
  }

  /**
   * Guardar subvención en la base de datos
   */
  async saveGrant(grantData) {
    try {
      // Buscar si ya existe (por URL o título)
      const existing = await Grant.findOne({
        where: {
          [require('sequelize').Op.or]: [
            { url_convocatoria: grantData.url_convocatoria },
            { titulo: grantData.titulo, organismo: grantData.organismo }
          ]
        }
      });
      
      if (existing) {
        // Actualizar si cambió algo relevante
        await existing.update(grantData);
        logger.debug(`Subvención actualizada: ${grantData.titulo}`);
      } else {
        // Crear nueva
        const grant = await Grant.create(grantData);
        logger.info(`Nueva subvención encontrada: ${grantData.titulo}`);
        
        // Marcar como no alertada para que se notifique
        // TODO: Enviar notificación/email al administrador
        this.notifyNewGrant(grant);
      }
      
    } catch (error) {
      logger.error('Error al guardar subvención:', error);
    }
  }

  /**
   * Notificar nueva subvención
   */
  async notifyNewGrant(grant) {
    try {
      // TODO: Implementar envío de email o notificación push
      logger.info(`NUEVA SUBVENCIÓN DETECTADA: ${grant.titulo} - Fecha límite: ${grant.fecha_limite}`);
      
      // Marcar como alertada
      await grant.update({ alertada: true });
      
    } catch (error) {
      logger.error('Error al notificar subvención:', error);
    }
  }

  /**
   * Buscar subvenciones por palabras clave
   */
  async searchByKeywords(keywords) {
    try {
      const Op = require('sequelize').Op;
      
      const subvenciones = await Grant.findAll({
        where: {
          [Op.or]: keywords.map(keyword => ({
            palabras_clave: {
              [Op.contains]: [keyword]
            }
          })),
          estado: 'abierta'
        },
        order: [['relevancia', 'DESC'], ['fecha_limite', 'ASC']]
      });
      
      return subvenciones;
      
    } catch (error) {
      logger.error('Error al buscar subvenciones:', error);
      return [];
    }
  }

  /**
   * Calcular relevancia de una subvención
   */
  calculateRelevance(grant) {
    let score = 0;
    
    // Palabras clave prioritarias
    const priorityKeywords = [
      'protección civil',
      'voluntarios',
      'emergencias',
      'rural',
      'bomberos'
    ];
    
    priorityKeywords.forEach(keyword => {
      if (grant.titulo.toLowerCase().includes(keyword) ||
          (grant.descripcion && grant.descripcion.toLowerCase().includes(keyword))) {
        score += 20;
      }
    });
    
    // Importe (más importe, más relevancia)
    if (grant.importe_maximo > 100000) {
      score += 20;
    } else if (grant.importe_maximo > 50000) {
      score += 15;
    } else if (grant.importe_maximo > 20000) {
      score += 10;
    }
    
    // Ámbito (nacional > autonómico > provincial > local)
    const ambitoScore = {
      'europeo': 25,
      'nacional': 20,
      'autonomico': 15,
      'provincial': 10,
      'local': 5
    };
    score += ambitoScore[grant.ambito] || 0;
    
    // Tiempo restante (urgencia inversa)
    const diasRestantes = Math.ceil((new Date(grant.fecha_limite) - new Date()) / (1000 * 60 * 60 * 24));
    if (diasRestantes < 15) {
      score += 15;
    } else if (diasRestantes < 30) {
      score += 10;
    }
    
    return Math.min(score, 100); // Máximo 100
  }

  /**
   * Detener scraping programado
   */
  stopScheduledScraping() {
    if (this.scheduledJob) {
      this.scheduledJob.stop();
      logger.info('Scraping programado detenido');
    }
  }
}

module.exports = new GrantScraperService();
