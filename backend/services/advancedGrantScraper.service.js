/**
 * Servicio Avanzado de Scraping de Subvenciones
 * Busca en múltiples fuentes: Europa, España, CCAA, Ayuntamientos e Instituciones Privadas
 * Con sistema de alertas en tiempo real
 */

const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const { Grant } = require('../models');
const logger = require('../config/logger');

class AdvancedGrantScraperService {
  constructor() {
    this.scheduledJobs = [];
    this.alertThreshold = 70; // Relevancia mínima para alertar
    this.io = null; // Se establecerá después desde server.js
    
    // Fuentes múltiples de subvenciones
    this.sources = [
      // UNIÓN EUROPEA
      {
        name: 'Funding & Tenders Portal (EU)',
        url: 'https://ec.europa.eu/info/funding-tenders/opportunities/data/referenceData/grantsTenders.json',
        type: 'europa',
        method: 'api'
      },
      // ESPAÑA - NACIONAL
      {
        name: 'Base de Datos Nacional de Subvenciones (BDNS)',
        url: 'https://www.pap.hacienda.gob.es/bdnstrans/GE/es/busqueda',
        type: 'nacional',
        method: 'scraping'
      },
      {
        name: 'BOE - Boletín Oficial del Estado',
        url: 'https://www.boe.es/datosabiertos/',
        type: 'nacional',
        method: 'api'
      },
      // COMUNIDADES AUTÓNOMAS (ejemplo con varias)
      {
        name: 'Castilla y León - Portal de Subvenciones',
        url: 'https://www.tramitacastillayleon.jcyl.es',
        type: 'ccaa',
        comunidad: 'Castilla y León',
        method: 'scraping'
      },
      {
        name: 'Madrid - Diario Oficial',
        url: 'https://www.bocm.es/',
        type: 'ccaa',
        comunidad: 'Madrid',
        method: 'scraping'
      },
      // AYUNTAMIENTOS (configurar según ubicación)
      {
        name: 'Diputación Provincial',
        url: 'https://ejemplo-diputacion.es/subvenciones',
        type: 'provincial',
        provincia: 'Tu Provincia',
        method: 'scraping'
      },
      // FUNDACIONES Y ENTIDADES PRIVADAS
      {
        name: 'Fundación MAPFRE',
        url: 'https://www.fundacionmapfre.org/ayudas-sociales/',
        type: 'privado',
        method: 'scraping'
      },
      {
        name: 'Fundación La Caixa - Convocatorias',
        url: 'https://fundacionlacaixa.org/es/convocatorias',
        type: 'privado',
        method: 'scraping'
      },
      {
        name: 'Cruz Roja - Programas de Financiación',
        url: 'https://www2.cruzroja.es/',
        type: 'privado',
        method: 'scraping'
      }
    ];
    
    // Palabras clave relevantes para Protección Civil
    this.relevantKeywords = [
      'protección civil', 'emergencias', 'voluntariado', 'emergencia',
      'catástrofe', 'prevención', 'seguridad ciudadana', 'rescate',
      'bomberos', 'sanitario', 'ambulancia', 'equipamiento', 'formación',
      'coordinación', 'comunicaciones', 'drones', 'LoRa', 'meshtastic',
      'teleasistencia', 'rural', 'despoblación', 'mayores', 'social',
      'ONG', 'asociación', 'tercer sector', 'acción social'
    ];
  }

  /**
   * Iniciar scraping programado con múltiples frecuencias
   */
  startScheduledScraping() {
    // Europa y Nacional: Diariamente a las 6:00 AM
    this.scheduledJobs.push(
      cron.schedule('0 6 * * *', () => {
        logger.info('[GRANT SCRAPER] Scraping diario iniciado');
        this.scrapeByType(['europa', 'nacional']);
      })
    );
    
    // CCAA y Provincial: 3 veces por semana (Lun, Mié, Vie a las 7:00 AM)
    this.scheduledJobs.push(
      cron.schedule('0 7 * * 1,3,5', () => {
        logger.info('[GRANT SCRAPER] Scraping CCAA/Provincial iniciado');
        this.scrapeByType(['ccaa', 'provincial']);
      })
    );
    
    // Privadas: Semanalmente (Lunes a las 8:00 AM)
    this.scheduledJobs.push(
      cron.schedule('0 8 * * 1', () => {
        logger.info('[GRANT SCRAPER] Scraping entidades privadas iniciado');
        this.scrapeByType(['privado']);
      })
    );
    
    // Búsqueda urgente cada 4 horas (convocatorias con fecha límite próxima)
    this.scheduledJobs.push(
      cron.schedule('0 */4 * * *', () => {
        this.checkUrgentDeadlines();
      })
    );
    
    logger.info('✓ Sistema de scraping avanzado configurado');
    logger.info('  - Diario: Europa y Nacional (6:00 AM)');
    logger.info('  - 3x/semana: CCAA y Provincial (7:00 AM L/M/V)');
    logger.info('  - Semanal: Privadas (8:00 AM Lunes)');
    logger.info('  - Cada 4h: Verificación de plazos urgentes');
  }

  /**
   * Scrapear por tipo de fuente
   */
  async scrapeByType(types) {
    const sources = this.sources.filter(s => types.includes(s.type));
    
    for (const source of sources) {
      try {
        await this.scrapeSource(source);
      } catch (error) {
        logger.error(`Error scraping ${source.name}:`, error.message);
      }
    }
  }

  /**
   * Scrapear una fuente específica
   */
  async scrapeSource(source) {
    logger.info(`Scraping: ${source.name}`);
    
    try {
      let grants = [];
      
      if (source.method === 'api') {
        grants = await this.scrapeAPI(source);
      } else {
        grants = await this.scrapeWeb(source);
      }
      
      // Procesar y guardar
      let newGrants = 0;
      for (const grant of grants) {
        const saved = await this.saveGrant(grant);
        if (saved.isNew) {
          newGrants++;
          // Emitir alerta si es relevante
          if (grant.relevancia >= this.alertThreshold) {
            this.emitGrantAlert(saved.grant);
          }
        }
      }
      
      logger.info(`${source.name}: ${newGrants} nuevas subvenciones encontradas`);
      
    } catch (error) {
      logger.error(`Error en ${source.name}:`, error.message);
    }
  }

  /**
   * Scraping vía API
   */
  async scrapeAPI(source) {
    const grants = [];
    
    try {
      const response = await axios.get(source.url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (ProteccionCivil/1.0)'
        }
      });
      
      // Procesar según la fuente
      if (source.name.includes('EU')) {
        // Procesar datos EU
        grants.push(...this.parseEUData(response.data, source));
      } else if (source.name.includes('BOE')) {
        // Procesar datos BOE
        grants.push(...this.parseBOEData(response.data, source));
      }
      
    } catch (error) {
      logger.warn(`API no disponible para ${source.name}: ${error.message}`);
    }
    
    return grants;
  }

  /**
   * Scraping vía web scraping
   */
  async scrapeWeb(source) {
    const grants = [];
    
    try {
      const response = await axios.get(source.url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      const $ = cheerio.load(response.data);
      
      // NOTA: Los selectores deben adaptarse a cada sitio web específico
      // Aquí mostramos una estructura genérica
      
      $('.convocatoria, .subvencion, .ayuda').each((i, element) => {
        const grant = this.parseGrantElement($, element, source);
        if (grant && this.isRelevant(grant)) {
          grants.push(grant);
        }
      });
      
    } catch (error) {
      logger.warn(`Web scraping falló para ${source.name}: ${error.message}`);
    }
    
    return grants;
  }

  /**
   * Parsear elemento de subvención (genérico)
   */
  parseGrantElement($, element, source) {
    try {
      const $el = $(element);
      
      const titulo = $el.find('h2, h3, .titulo, .title').first().text().trim();
      const descripcion = $el.find('p, .descripcion, .description').first().text().trim();
      const url = $el.find('a').first().attr('href') || source.url;
      
      // Extraer fechas (patrones comunes)
      const textoCompleto = $el.text();
      const fechaLimite = this.extractDate(textoCompleto);
      
      // Extraer importe (patrones comunes)
      const importe = this.extractAmount(textoCompleto);
      
      return {
        titulo,
        organismo: source.comunidad || source.provincia || source.name,
        descripcion: descripcion.substring(0, 500),
        url_convocatoria: url.startsWith('http') ? url : `${source.url}${url}`,
        ambito: source.type,
        importe_maximo: importe,
        fecha_publicacion: new Date(),
        fecha_limite: fechaLimite,
        palabras_clave: this.extractKeywords(titulo + ' ' + descripcion),
        relevancia: this.calculateRelevance(titulo + ' ' + descripcion)
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Parsear datos de EU
   */
  parseEUData(data, source) {
    const grants = [];
    
    try {
      // Estructura específica de la API de EU
      const opportunities = data.opportunities || [];
      
      opportunities.forEach(opp => {
        if (this.isRelevantEU(opp)) {
          grants.push({
            titulo: opp.title,
            organismo: opp.frameworkProgramme || 'Unión Europea',
            descripcion: opp.description?.substring(0, 500) || '',
            url_convocatoria: `https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-details/${opp.identifier}`,
            ambito: 'europa',
            importe_maximo: opp.budget || null,
            fecha_publicacion: opp.publicationDate ? new Date(opp.publicationDate) : new Date(),
            fecha_limite: opp.deadlineDate ? new Date(opp.deadlineDate) : null,
            palabras_clave: opp.keywords || [],
            relevancia: this.calculateRelevance(opp.title + ' ' + (opp.description || ''))
          });
        }
      });
    } catch (error) {
      logger.error('Error parseando datos EU:', error.message);
    }
    
    return grants;
  }

  /**
   * Parsear datos del BOE
   */
  parseBOEData(data, source) {
    const grants = [];
    
    try {
      // Estructura del BOE (XML/JSON según API)
      const items = data.items || data.resultados || [];
      
      items.forEach(item => {
        const texto = (item.titulo || '') + ' ' + (item.texto || '');
        if (this.isRelevant({ titulo: texto })) {
          grants.push({
            titulo: item.titulo,
            organismo: item.departamento || 'BOE',
            descripcion: item.texto?.substring(0, 500) || '',
            url_convocatoria: item.url || `https://www.boe.es/diario_boe/txt.php?id=${item.id}`,
            ambito: 'nacional',
            importe_maximo: this.extractAmount(item.texto || ''),
            fecha_publicacion: item.fecha ? new Date(item.fecha) : new Date(),
            fecha_limite: this.extractDate(item.texto || ''),
            palabras_clave: this.extractKeywords(texto),
            relevancia: this.calculateRelevance(texto)
          });
        }
      });
    } catch (error) {
      logger.error('Error parseando datos BOE:', error.message);
    }
    
    return grants;
  }

  /**
   * Calcular relevancia de una subvención (0-100)
   */
  calculateRelevance(text) {
    const textLower = text.toLowerCase();
    let score = 0;
    
    // Palabras clave exactas
    for (const keyword of this.relevantKeywords) {
      if (textLower.includes(keyword)) {
        score += 10;
      }
    }
    
    // Palabras relacionadas
    const relatedWords = ['ayuda', 'financiación', 'dotación', 'presupuesto', 'entidad'];
    for (const word of relatedWords) {
      if (textLower.includes(word)) {
        score += 2;
      }
    }
    
    // Limitar a 100
    return Math.min(score, 100);
  }

  /**
   * Verificar si una subvención es relevante
   */
  isRelevant(grant) {
    const text = `${grant.titulo} ${grant.descripcion || ''}`.toLowerCase();
    
    // Al menos una palabra clave debe aparecer
    return this.relevantKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Verificar relevancia para EU
   */
  isRelevantEU(opportunity) {
    const text = `${opportunity.title} ${opportunity.description || ''}`.toLowerCase();
    
    const euKeywords = [
      'civil protection', 'emergency', 'disaster', 'volunteer',
      'rescue', 'safety', 'prevention', 'coordination'
    ];
    
    return euKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Extraer palabras clave del texto
   */
  extractKeywords(text) {
    const textLower = text.toLowerCase();
    const found = [];
    
    for (const keyword of this.relevantKeywords) {
      if (textLower.includes(keyword)) {
        found.push(keyword);
      }
    }
    
    return found;
  }

  /**
   * Extraer fecha del texto (heurística)
   */
  extractDate(text) {
    // Patrones comunes de fecha
    const patterns = [
      /hasta\s+el\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/i,
      /plazo.*?(\d{1,2})\/(\d{1,2})\/(\d{4})/i,
      /antes\s+del\s+(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          // Intentar parsear la fecha
          const dateStr = match[0];
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            return date;
          }
        } catch (e) {
          continue;
        }
      }
    }
    
    // Fecha por defecto: 3 meses desde ahora
    const defaultDate = new Date();
    defaultDate.setMonth(defaultDate.getMonth() + 3);
    return defaultDate;
  }

  /**
   * Extraer importe del texto (heurística)
   */
  extractAmount(text) {
    // Patrones de importes
    const patterns = [
      /(\d+(?:\.\d+)?)\s*(?:millones|M)\s*€/i,
      /(\d+(?:\.\d+)?)\s*€/i,
      /hasta\s+(\d+(?:\.\d+)?)\s*euros/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        let amount = parseFloat(match[1].replace(',', '.'));
        if (text.toLowerCase().includes('millones')) {
          amount *= 1000000;
        }
        return amount;
      }
    }
    
    return null;
  }

  /**
   * Guardar o actualizar subvención
   */
  async saveGrant(grantData) {
    try {
      // Buscar si ya existe (por título y organismo)
      const existing = await Grant.findOne({
        where: {
          titulo: grantData.titulo,
          organismo: grantData.organismo
        }
      });
      
      if (existing) {
        // Actualizar si ha cambiado
        await existing.update(grantData);
        return { grant: existing, isNew: false };
      } else {
        // Crear nueva
        const newGrant = await Grant.create(grantData);
        return { grant: newGrant, isNew: true };
      }
    } catch (error) {
      logger.error('Error guardando subvención:', error.message);
      return { grant: null, isNew: false };
    }
  }

  /**
   * Emitir alerta en tiempo real vía WebSocket
   */
  emitGrantAlert(grant) {
    logger.info(`🚨 ALERTA: Nueva subvención relevante - ${grant.titulo}`);
    
    // Emitir a todos los clientes conectados
    if (this.io) {
      this.io.emit('grant:new', {
        id: grant.id,
        titulo: grant.titulo,
        organismo: grant.organismo,
        ambito: grant.ambito,
        relevancia: grant.relevancia,
        fecha_limite: grant.fecha_limite,
        importe_maximo: grant.importe_maximo,
        url: grant.url_convocatoria
      });
    }
    
    // TODO: Enviar email/SMS a administradores
  }

  /**
   * Verificar plazos urgentes (< 15 días)
   */
  async checkUrgentDeadlines() {
    const now = new Date();
    const urgentDate = new Date();
    urgentDate.setDate(urgentDate.getDate() + 15);
    
    const urgentGrants = await Grant.findAll({
      where: {
        fecha_limite: {
          [require('sequelize').Op.between]: [now, urgentDate]
        },
        alertada: false
      }
    });
    
    for (const grant of urgentGrants) {
      logger.warn(`⏰ PLAZO URGENTE: ${grant.titulo} - Vence en ${this.getDaysUntil(grant.fecha_limite)} días`);
      
      // Emitir alerta urgente
      if (this.io) {
        this.io.emit('grant:urgent', {
          id: grant.id,
          titulo: grant.titulo,
          dias_restantes: this.getDaysUntil(grant.fecha_limite)
        });
      }
      
      // Marcar como alertada
      await grant.update({ alertada: true });
    }
  }

  /**
   * Calcular días hasta una fecha
   */
  getDaysUntil(date) {
    const now = new Date();
    const diff = new Date(date) - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Ejecutar scraping manual (para testing)
   */
  async runManualScraping() {
    logger.info('Iniciando scraping manual de todas las fuentes...');
    await this.scrapeByType(['europa', 'nacional', 'ccaa', 'provincial', 'privado']);
    logger.info('Scraping manual completado');
  }

  /**
   * Detener todos los jobs programados
   */
  stopAllJobs() {
    this.scheduledJobs.forEach(job => job.stop());
    logger.info('Scraping programado detenido');
  }

  /**
   * Establecer instancia de Socket.io
   */
  setSocketIO(socketIO) {
    this.io = socketIO;
    logger.info('Socket.io configurado en AdvancedGrantScraper');
  }
}

module.exports = new AdvancedGrantScraperService();
