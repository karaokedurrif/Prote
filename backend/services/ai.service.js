/**
 * Servicio de Asistente de IA
 * Integración con modelos de lenguaje para sugerencias y análisis
 */

const axios = require('axios');
const logger = require('../config/logger');

class AIAssistantService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.model = 'gpt-4'; // o 'gpt-3.5-turbo' para menor coste
  }

  /**
   * Generar sugerencias de financiación
   */
  async generateFundingSuggestions(context) {
    try {
      if (!this.apiKey) {
        logger.warn('API key de OpenAI no configurada');
        return this.getMockSuggestions();
      }
      
      const prompt = `
Como experto en financiación de asociaciones de protección civil, analiza el siguiente contexto
y sugiere fuentes de financiación, subvenciones y convenios potenciales:

Contexto de la asociación:
- Ámbito: Rural, municipios pequeños
- Actividades: ${context.actividades || 'Emergencias, prevención, formación'}
- Presupuesto actual: ${context.presupuesto || 'N/A'}
- Proyectos planificados: ${context.proyectos || 'Renovación de equipamiento'}

Proporciona 5 sugerencias concretas de líneas de financiación, incluyendo:
1. Nombre de la convocatoria/programa
2. Organismo convocante
3. Tipo de proyectos que financia
4. Importe aproximado
5. Requisitos principales
`;
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'Eres un experto en financiación pública y privada para organizaciones de protección civil y voluntariado.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const suggestions = response.data.choices[0].message.content;
      
      logger.info('Sugerencias de financiación generadas por IA');
      
      return {
        sugerencias: suggestions,
        timestamp: new Date(),
        modelo: this.model
      };
      
    } catch (error) {
      logger.error('Error al generar sugerencias de IA:', error.message);
      return this.getMockSuggestions();
    }
  }

  /**
   * Analizar factibilidad de proyecto
   */
  async analyzeProjectFeasibility(projectData) {
    try {
      if (!this.apiKey) {
        return { analisis: 'API de IA no configurada', factibilidad: 70 };
      }
      
      const prompt = `
Analiza la factibilidad del siguiente proyecto de protección civil:

Título: ${projectData.nombre}
Descripción: ${projectData.descripcion}
Presupuesto estimado: ${projectData.presupuesto}€
Duración: ${projectData.duracion}
Beneficiarios: ${projectData.beneficiarios}

Proporciona:
1. Análisis DAFO (Debilidades, Amenazas, Fortalezas, Oportunidades)
2. Puntuación de factibilidad (0-100)
3. Recomendaciones para mejorar la propuesta
4. Posibles riesgos y mitigaciones
`;
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'Eres un consultor experto en gestión de proyectos de protección civil y emergencias.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const analisis = response.data.choices[0].message.content;
      
      return {
        analisis,
        timestamp: new Date(),
        modelo: this.model
      };
      
    } catch (error) {
      logger.error('Error al analizar proyecto:', error.message);
      return { analisis: 'Error en el análisis', factibilidad: 0 };
    }
  }

  /**
   * Sugerir colaboraciones con empresas
   */
  async suggestPartnerships(context) {
    try {
      if (!this.apiKey) {
        return this.getMockPartnerships();
      }
      
      const prompt = `
Sugiere empresas y organizaciones que podrían colaborar con una asociación de protección civil
en entorno rural, considerando:

- Ubicación: ${context.municipios || 'Municipios rurales'}
- Necesidades: ${context.necesidades || 'Equipamiento, formación, financiación'}
- Sector: Protección civil, emergencias, voluntariado

Proporciona 10 tipos de empresas/organizaciones y cómo podrían colaborar.
`;
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'Eres un experto en responsabilidad social corporativa y colaboraciones público-privadas.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return {
        sugerencias: response.data.choices[0].message.content,
        timestamp: new Date()
      };
      
    } catch (error) {
      logger.error('Error al sugerir colaboraciones:', error.message);
      return this.getMockPartnerships();
    }
  }

  /**
   * Sugerencias mock para desarrollo/pruebas
   */
  getMockSuggestions() {
    return {
      sugerencias: `
1. **Subvenciones del Ministerio del Interior para Protección Civil**
   - Organismo: Dirección General de Protección Civil
   - Proyectos: Equipamiento, formación, infraestructuras
   - Importe: Hasta 60.000€
   - Requisitos: Estar registrados, memoria de actividades

2. **Programa Leader de Desarrollo Rural**
   - Organismo: Grupos de Acción Local
   - Proyectos: Servicios básicos en zonas rurales
   - Importe: Hasta 100.000€
   - Requisitos: Ámbito rural, beneficio comunitario

3. **Ayudas autonómicas para voluntariado**
   - Organismo: Consejería de Servicios Sociales
   - Proyectos: Apoyo a asociaciones de voluntariado
   - Importe: 5.000-30.000€
   - Requisitos: Registro de voluntariado, memorias

4. **Convenios con Diputación Provincial**
   - Organismo: Diputación Provincial
   - Proyectos: Equipamiento de emergencias municipales
   - Importe: Variable
   - Requisitos: Convenio marco, cofinanciación

5. **Fondos de Responsabilidad Social Empresarial**
   - Organismo: Empresas del sector energético/aseguradoras
   - Proyectos: Prevención de riesgos, formación
   - Importe: Variable
   - Requisitos: Proyecto concreto, impacto medible
      `,
      timestamp: new Date(),
      modelo: 'mock'
    };
  }

  /**
   * Colaboraciones mock
   */
  getMockPartnerships() {
    return {
      sugerencias: `
1. **Empresas de seguros**: Formación en prevención, patrocinio de eventos
2. **Supermercados locales**: Donaciones, voluntariado corporativo
3. **Empresas de telecomunicaciones**: Conectividad, sistemas de comunicación
4. **Concesionarios de vehículos**: Cesión de vehículos, descuentos
5. **Ferreterías y materiales**: Descuentos en equipamiento
6. **Empresas de energía**: Patrocinio, RSC
7. **Clínicas y farmacias**: Material sanitario, formación
8. **Empresas de tecnología**: Software, hardware, soporte
9. **Medios de comunicación locales**: Difusión, sensibilización
10. **Cajas rurales**: Financiación preferente, patrocinio
      `,
      timestamp: new Date()
    };
  }
}

module.exports = new AIAssistantService();
