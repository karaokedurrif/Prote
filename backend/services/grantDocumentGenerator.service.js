/**
 * Servicio de Generación Automática de Documentos para Subvenciones
 * Utiliza IA (OpenAI) para generar borradores de solicitudes
 */

const axios = require('axios');
const logger = require('../config/logger');
const { Grant } = require('../models');

class GrantDocumentGeneratorService {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    this.openaiEndpoint = 'https://api.openai.com/v1/chat/completions';
    this.model = 'gpt-4'; // o 'gpt-3.5-turbo' para menor coste
  }

  /**
   * Generar documento completo de solicitud
   */
  async generateApplication(grantId, organizationData) {
    try {
      const grant = await Grant.findByPk(grantId);
      if (!grant) {
        throw new Error('Subvención no encontrada');
      }

      logger.info(`Generando solicitud para: ${grant.titulo}`);

      // Generar las diferentes secciones del documento
      const sections = await this.generateAllSections(grant, organizationData);

      // Compilar documento completo
      const document = this.compileDocument(grant, sections, organizationData);

      return {
        success: true,
        grant: {
          id: grant.id,
          titulo: grant.titulo,
          organismo: grant.organismo
        },
        document,
        sections
      };

    } catch (error) {
      logger.error('Error generando solicitud:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generar todas las secciones del documento
   */
  async generateAllSections(grant, orgData) {
    const sections = {};

    // 1. Memoria técnica
    sections.memoriaTecnica = await this.generateSection('memoria_tecnica', grant, orgData);

    // 2. Presupuesto detallado
    sections.presupuesto = await this.generateSection('presupuesto', grant, orgData);

    // 3. Justificación de la necesidad
    sections.justificacion = await this.generateSection('justificacion', grant, orgData);

    // 4. Objetivos del proyecto
    sections.objetivos = await this.generateSection('objetivos', grant, orgData);

    // 5. Plan de ejecución y cronograma
    sections.planEjecucion = await this.generateSection('plan_ejecucion', grant, orgData);

    // 6. Impacto y resultados esperados
    sections.impacto = await this.generateSection('impacto', grant, orgData);

    // 7. Sostenibilidad
    sections.sostenibilidad = await this.generateSection('sostenibilidad', grant, orgData);

    return sections;
  }

  /**
   * Generar una sección específica con IA
   */
  async generateSection(sectionType, grant, orgData) {
    // Si no hay API key, usar plantilla básica
    if (!this.openaiApiKey || this.openaiApiKey === 'TU_CLAVE_AQUI') {
      return this.generateTemplateSection(sectionType, grant, orgData);
    }

    try {
      const prompt = this.buildPrompt(sectionType, grant, orgData);

      const response = await axios.post(
        this.openaiEndpoint,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'Eres un experto en redacción de solicitudes de subvenciones para organizaciones de protección civil y emergencias. Genera textos profesionales, convincentes y ajustados a los requisitos formales de las convocatorias públicas españolas y europeas.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const generatedText = response.data.choices[0].message.content;
      logger.info(`Sección ${sectionType} generada con IA`);

      return {
        content: generatedText,
        generatedWith: 'openai',
        timestamp: new Date()
      };

    } catch (error) {
      logger.warn(`Error con OpenAI para sección ${sectionType}, usando plantilla: ${error.message}`);
      return this.generateTemplateSection(sectionType, grant, orgData);
    }
  }

  /**
   * Construir prompt para OpenAI según la sección
   */
  buildPrompt(sectionType, grant, orgData) {
    const baseInfo = `
Convocatoria: ${grant.titulo}
Organismo: ${grant.organismo}
Descripción: ${grant.descripcion}
Importe máximo: ${grant.importe_maximo ? `${grant.importe_maximo}€` : 'No especificado'}

Organización solicitante:
- Nombre: ${orgData.nombre || 'Asociación de Protección Civil'}
- Tipo: Agrupación de Voluntarios de Protección Civil
- Municipio: ${orgData.municipio || 'Tu Municipio'}
- Provincia: ${orgData.provincia || 'Tu Provincia'}
- Voluntarios activos: ${orgData.numVoluntarios || 50}
- Años de actividad: ${orgData.anosActividad || 10}
- Servicios anuales: ${orgData.serviciosAnuales || 100}
`;

    const prompts = {
      memoria_tecnica: `${baseInfo}

Redacta una MEMORIA TÉCNICA profesional para esta solicitud de subvención. Debe incluir:
- Descripción de la organización y su trayectoria
- Recursos humanos y materiales actuales
- Actividades y servicios que realiza
- Necesidades detectadas
- Capacidad técnica de ejecución

Máximo 1000 palabras, formato formal administrativo.`,

      presupuesto: `${baseInfo}

Genera un PRESUPUESTO DETALLADO para el proyecto. Incluye:
- Descripción de conceptos de gasto
- Importes estimados realistas
- Justificación de cada partida
- Total coherente con el importe máximo

Presenta en formato tabla con: Concepto | Descripción | Cantidad | Precio Unit. | Total`,

      justificacion: `${baseInfo}

Redacta la JUSTIFICACIÓN DE LA NECESIDAD. Debe argumentar:
- Por qué se necesita esta subvención
- Problemas que resolverá
- Beneficiarios directos e indirectos
- Urgencia de la actuación
- Impacto social esperado

Máximo 800 palabras, convincente y basado en datos.`,

      objetivos: `${baseInfo}

Define los OBJETIVOS del proyecto usando metodología SMART (Específicos, Medibles, Alcanzables, Relevantes, Temporales):
- Objetivo general
- 4-6 objetivos específicos
- Indicadores de logro para cada uno

Formato claro y estructurado.`,

      plan_ejecucion: `${baseInfo}

Desarrolla un PLAN DE EJECUCIÓN Y CRONOGRAMA detallado:
- Fases del proyecto
- Actividades principales en cada fase
- Responsables
- Timeline (6-12 meses)
- Hitos clave

Presenta en formato tabla: Fase | Mes | Actividad | Responsable`,

      impacto: `${baseInfo}

Describe el IMPACTO Y RESULTADOS ESPERADOS:
- Resultados cuantitativos (números, métricas)
- Resultados cualitativos (mejoras, cambios)
- Beneficiarios (directos e indirectos)
- Cambios en la capacidad operativa
- Contribución a la seguridad ciudadana

Máximo 600 palabras.`,

      sostenibilidad: `${baseInfo}

Explica la SOSTENIBILIDAD del proyecto:
- Viabilidad económica a largo plazo
- Mantenimiento de resultados
- Fuentes de financiación futuras
- Compromiso de la organización
- Continuidad de las actividades

Máximo 500 palabras.`
    };

    return prompts[sectionType] || baseInfo;
  }

  /**
   * Generar sección con plantilla (sin IA)
   */
  generateTemplateSection(sectionType, grant, orgData) {
    const templates = {
      memoria_tecnica: this.templateMemoriaTecnica(grant, orgData),
      presupuesto: this.templatePresupuesto(grant, orgData),
      justificacion: this.templateJustificacion(grant, orgData),
      objetivos: this.templateObjetivos(grant, orgData),
      plan_ejecucion: this.templatePlanEjecucion(grant, orgData),
      impacto: this.templateImpacto(grant, orgData),
      sostenibilidad: this.templateSostenibilidad(grant, orgData)
    };

    return {
      content: templates[sectionType] || 'Sección pendiente de completar',
      generatedWith: 'template',
      timestamp: new Date()
    };
  }

  /**
   * Plantillas básicas de cada sección
   */
  templateMemoriaTecnica(grant, orgData) {
    return `
MEMORIA TÉCNICA
================

1. PRESENTACIÓN DE LA ORGANIZACIÓN

${orgData.nombre || 'Nuestra Asociación de Protección Civil'} es una agrupación de voluntarios registrada y autorizada que opera en ${orgData.municipio || 'nuestro municipio'} desde hace ${orgData.anosActividad || 10} años.

Contamos con ${orgData.numVoluntarios || 50} voluntarios activos que realizan aproximadamente ${orgData.serviciosAnuales || 100} servicios anuales, incluyendo:
- Cobertura de eventos públicos
- Emergencias y catástrofes
- Búsqueda y rescate
- Asistencia sanitaria básica
- Prevención de incendios forestales
- Apoyo logístico

2. RECURSOS ACTUALES

Recursos Humanos:
- Voluntarios activos con formación específica en protección civil
- Coordinadores certificados
- Personal sanitario (técnicos de emergencias)
- Especialistas en comunicaciones

Recursos Materiales:
- Vehículos de emergencia y transporte
- Equipamiento de comunicaciones (emisoras, LoRa/Meshtastic)
- Material sanitario
- Equipamiento de seguridad y rescate
- Herramientas y maquinaria

3. NECESIDADES DETECTADAS

A través de nuestra experiencia operativa hemos identificado necesidades críticas en:
- Renovación y ampliación de equipamiento
- Formación continua de voluntarios
- Mejora de sistemas de comunicación
- Actualización tecnológica
- Equipamiento de seguridad personal

4. CAPACIDAD TÉCNICA

Nuestra organización tiene demostrada capacidad para:
- Gestionar proyectos de mejora
- Justificar correctamente subvenciones públicas
- Coordinar con otras entidades y administraciones
- Ejecutar actividades de formación y equipamiento
- Mantener operativos los recursos adquiridos
`;
  }

  templatePresupuesto(grant, orgData) {
    const importeMax = grant.importe_maximo || 50000;
    
    return `
PRESUPUESTO DETALLADO
=====================

| Concepto | Descripción | Cantidad | Precio Unit. | Total |
|----------|-------------|----------|--------------|-------|
| **EQUIPAMIENTO** | | | | **${(importeMax * 0.6).toFixed(2)}€** |
| Equipos de comunicación | Emisoras portátiles LoRa/Meshtastic | 10 | ${(importeMax * 0.04).toFixed(2)}€ | ${(importeMax * 0.4).toFixed(2)}€ |
| Equipamiento sanitario | Desfibriladores, botiquines, camillas | 1 | ${(importeMax * 0.1).toFixed(2)}€ | ${(importeMax * 0.1).toFixed(2)}€ |
| EPI's | Cascos, chalecos, guantes, calzado | 20 | ${(importeMax * 0.005).toFixed(2)}€ | ${(importeMax * 0.1).toFixed(2)}€ |
| **FORMACIÓN** | | | | **${(importeMax * 0.25).toFixed(2)}€** |
| Cursos especializados | Primeros auxilios, rescate, SACE | 30 | ${(importeMax * 0.0083).toFixed(2)}€ | ${(importeMax * 0.25).toFixed(2)}€ |
| **GASTOS CORRIENTES** | | | | **${(importeMax * 0.15).toFixed(2)}€** |
| Seguros | Responsabilidad civil y accidentes | 1 | ${(importeMax * 0.08).toFixed(2)}€ | ${(importeMax * 0.08).toFixed(2)}€ |
| Mantenimiento | Vehículos y equipamiento | 1 | ${(importeMax * 0.07).toFixed(2)}€ | ${(importeMax * 0.07).toFixed(2)}€ |
| **TOTAL** | | | | **${importeMax.toFixed(2)}€** |

JUSTIFICACIÓN DE PARTIDAS:
- Equipamiento: Esencial para operatividad y seguridad de voluntarios
- Formación: Cumplimiento normativo y mejora de capacidades
- Gastos corrientes: Garantizar sostenibilidad del proyecto
`;
  }

  templateJustificacion(grant, orgData) {
    return `
JUSTIFICACIÓN DE LA NECESIDAD
==============================

1. CONTEXTO Y PROBLEMÁTICA

En ${orgData.municipio || 'nuestro municipio'} existe una necesidad creciente de servicios de protección civil debido a:
- Aumento de eventos meteorológicos extremos
- Mayor demanda de cobertura en eventos públicos
- Envejecimiento poblacional en zonas rurales
- Necesidad de respuesta rápida en emergencias

2. NECESIDADES ESPECÍFICAS

Nuestra organización requiere urgentemente:
- Equipamiento moderno y homologado
- Formación especializada de voluntarios
- Sistemas de comunicación fiables
- Vehículos y material operativo

Actualmente operamos con recursos limitados y equipamiento antiguo que compromete la eficacia de nuestros servicios y la seguridad de los voluntarios.

3. BENEFICIARIOS

Beneficiarios directos:
- ${orgData.numVoluntarios || 50} voluntarios activos
- Personal de protección civil

Beneficiarios indirectos:
- ${orgData.poblacion || 50000} habitantes del municipio y comarca
- Asistentes a eventos públicos (más de 100.000 personas/año)
- Población vulnerable (mayores, niños, personas dependientes)

4. URGENCIA

La mejora de nuestros recursos es urgente porque:
- Equipamiento actual obsoleto o deteriorado
- Normativa exige formación actualizada
- Incremento de servicios solicitados
- Compromisos con otras administraciones

5. IMPACTO SOCIAL

Esta subvención permitirá:
- Mejorar tiempos de respuesta en emergencias
- Aumentar seguridad de voluntarios y ciudadanos
- Ampliar cobertura territorial
- Garantizar calidad de servicios
- Contribuir a la seguridad ciudadana
`;
  }

  templateObjetivos(grant, orgData) {
    return `
OBJETIVOS DEL PROYECTO
======================

OBJETIVO GENERAL:
Mejorar la capacidad operativa de la Agrupación de Protección Civil para garantizar servicios de calidad en prevención, respuesta y asistencia en emergencias.

OBJETIVOS ESPECÍFICOS:

1. **Renovar y ampliar el equipamiento operativo**
   - Indicador: Adquirir 100% del equipamiento planificado en 6 meses
   - Meta: 10 nuevos equipos de comunicación, 20 EPI's completos

2. **Formar a voluntarios en competencias especializadas**
   - Indicador: Al menos 30 voluntarios formados en 12 meses
   - Meta: 100% voluntarios con formación actualizada

3. **Mejorar los sistemas de comunicación y coordinación**
   - Indicador: Reducir tiempo de activación en un 30%
   - Meta: Red mesh operativa con cobertura total

4. **Incrementar la seguridad de los voluntarios**
   - Indicador: Cero incidentes por falta de EPI's
   - Meta: 100% voluntarios con equipamiento homologado

5. **Ampliar la capacidad de respuesta territorial**
   - Indicador: Aumentar cobertura en un 20%
   - Meta: Nuevas zonas cubiertas en la comarca

6. **Garantizar la sostenibilidad del servicio**
   - Indicador: Renovación del 80% material obsoleto
   - Meta: Mantenimiento preventivo programado
`;
  }

  templatePlanEjecucion(grant, orgData) {
    return `
PLAN DE EJECUCIÓN Y CRONOGRAMA
===============================

| Fase | Mes | Actividad | Responsable |
|------|-----|-----------|-------------|
| **FASE 1: PREPARACIÓN** | 1-2 | | |
| | 1 | Aprobación de subvención y firma de convenio | Coordinador |
| | 1-2 | Solicitud de ofertas y comparativas | Tesorero |
| | 2 | Adjudicación de proveedores | Junta Directiva |
| **FASE 2: ADQUISICIÓN** | 3-5 | | |
| | 3-4 | Compra de equipamiento | Tesorero |
| | 4-5 | Recepción y verificación de material | Almacén |
| | 5 | Inventariado y etiquetado | Secretario |
| **FASE 3: FORMACIÓN** | 6-10 | | |
| | 6-7 | Contratación de formadores | Coordinador Formación |
| | 8-10 | Ejecución de cursos y certificación | Formadores |
| | 10 | Evaluación de competencias | Coordinador |
| **FASE 4: IMPLEMENTACIÓN** | 8-11 | | |
| | 8-9 | Distribución de equipamiento | Almacén |
| | 9-10 | Pruebas y puesta en marcha | Técnicos |
| | 10-11 | Ajustes y optimización | Coordinador Técnico |
| **FASE 5: CIERRE** | 11-12 | | |
| | 11 | Evaluación final del proyecto | Junta Directiva |
| | 12 | Justificación económica | Tesorero |
| | 12 | Memoria de actividades | Secretario |

HITOS CLAVE:
- Mes 2: Proveedores adjudicados
- Mes 5: Todo el material recibido
- Mes 10: Formación completada
- Mes 12: Proyecto finalizado y justificado
`;
  }

  templateImpacto(grant, orgData) {
    return `
IMPACTO Y RESULTADOS ESPERADOS
===============================

1. RESULTADOS CUANTITATIVOS

- ${orgData.numVoluntarios || 50} voluntarios con equipamiento renovado
- 30 voluntarios con formación especializada actualizada
- 10 nuevos equipos de comunicación operativos
- 100% de cobertura en servicios solicitados
- Reducción del 30% en tiempos de activación
- Incremento del 20% en servicios prestados

2. RESULTADOS CUALITATIVOS

- Mayor seguridad para voluntarios en intervenciones
- Mejora de la imagen y profesionalización
- Mayor confianza de ciudadanos y administraciones
- Incremento de la eficacia operativa
- Mejor coordinación interna y con otros servicios
- Aumento de la motivación de voluntarios

3. BENEFICIARIOS

Directos:
- 50 voluntarios activos
- Nuevos voluntarios que se incorporen (estimado 10/año)

Indirectos:
- ${orgData.poblacion || 50000} habitantes del municipio
- Visitantes y turistas en eventos
- Otros servicios de emergencia (coordinación)
- Administraciones locales

4. IMPACTO EN CAPACIDAD OPERATIVA

Antes del proyecto:
- Equipamiento limitado y obsoleto
- Formación desactualizada
- Cobertura parcial

Después del proyecto:
- Equipamiento moderno y homologado
- Voluntarios altamente cualificados
- Cobertura total con calidad

5. CONTRIBUCIÓN A LA SEGURIDAD CIUDADANA

Este proyecto contribuirá directamente a:
- Protección de la población en emergencias
- Prevención de riesgos
- Asistencia inmediata en catástrofes
- Apoyo a servicios profesionales
- Cohesión social y participación ciudadana
`;
  }

  templateSostenibilidad(grant, orgData) {
    return `
SOSTENIBILIDAD DEL PROYECTO
============================

1. VIABILIDAD ECONÓMICA

La organización garantiza la sostenibilidad mediante:
- Presupuesto anual aprobado por la asamblea
- Subvenciones públicas (municipal, provincial, autonómicas)
- Convenios con administraciones locales
- Cuotas de socios (voluntarias)
- Donaciones de particulares y empresas

2. MANTENIMIENTO DE RESULTADOS

Los resultados del proyecto se mantendrán a través de:
- Plan de mantenimiento del equipamiento (revisiones periódicas)
- Formación continua de voluntarios
- Actualización de protocolos y procedimientos
- Sistema de gestión de calidad

3. FUENTES DE FINANCIACIÓN FUTURAS

Para garantizar la continuidad, dispondremos de:
- Subvenciones recurrentes (municipales, provinciales)
- Convenios de colaboración con ayuntamientos
- Participación en nuevas convocatorias
- Fondos propios (ahorros y cuotas)

4. COMPROMISO DE LA ORGANIZACIÓN

La Junta Directiva se compromete a:
- Mantener operativo el equipamiento adquirido (mínimo 5 años)
- Continuar las actividades de formación
- Prestar servicios de calidad a la ciudadanía
- Cumplir con la normativa de protección civil
- Justificar correctamente el uso de fondos públicos

5. CONTINUIDAD DE ACTIVIDADES

Las actividades iniciadas en el proyecto continuarán porque:
- Son parte del objeto social de la asociación
- Hay demanda constante de servicios
- Existen compromisos con administraciones
- Los voluntarios están motivados y comprometidos
- El equipamiento tiene vida útil prolongada

6. PLAN DE AMORTIZACIÓN

El equipamiento adquirido se amortizará:
- Vida útil estimada: 5-10 años según tipo
- Mantenimiento preventivo anual
- Revisiones técnicas obligatorias
- Seguro de responsabilidad civil
- Fondo de reserva para reparaciones
`;
  }

  /**
   * Compilar documento completo
   */
  compileDocument(grant, sections, orgData) {
    const fecha = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    return `
═══════════════════════════════════════════════════════════
  SOLICITUD DE SUBVENCIÓN
═══════════════════════════════════════════════════════════

CONVOCATORIA: ${grant.titulo}
ORGANISMO: ${grant.organismo}
FECHA: ${fecha}

SOLICITANTE:
${orgData.nombre || 'Asociación de Protección Civil'}
CIF: ${orgData.cif || 'G-00000000'}
Domicilio: ${orgData.direccion || 'C/ Principal, 1'}
C.P.: ${orgData.codigoPostal || '00000'} - ${orgData.municipio || 'Tu Municipio'}
Provincia: ${orgData.provincia || 'Tu Provincia'}
Email: ${orgData.email || 'info@proteccioncivil.org'}
Teléfono: ${orgData.telefono || '000 000 000'}

Representante Legal:
Nombre: ${orgData.representante || 'Presidente/a'}
DNI: ${orgData.dniRepresentante || '00000000X'}

═══════════════════════════════════════════════════════════

${sections.memoriaTecnica.content}

═══════════════════════════════════════════════════════════

${sections.justificacion.content}

═══════════════════════════════════════════════════════════

${sections.objetivos.content}

═══════════════════════════════════════════════════════════

${sections.planEjecucion.content}

═══════════════════════════════════════════════════════════

${sections.presupuesto.content}

═══════════════════════════════════════════════════════════

${sections.impacto.content}

═══════════════════════════════════════════════════════════

${sections.sostenibilidad.content}

═══════════════════════════════════════════════════════════

DECLARACIÓN RESPONSABLE

El/La abajo firmante DECLARA que toda la información contenida en esta solicitud es veraz y que la organización cumple con todos los requisitos establecidos en la convocatoria.

${orgData.municipio || 'Tu Municipio'}, a ${fecha}


Fdo.: ${orgData.representante || 'Presidente/a'}
${orgData.nombre || 'Asociación de Protección Civil'}

═══════════════════════════════════════════════════════════
  DOCUMENTACIÓN ADJUNTA
═══════════════════════════════════════════════════════════

□ Fotocopia del CIF de la entidad
□ Fotocopia del DNI del representante legal
□ Certificado de estar al corriente con Hacienda
□ Certificado de estar al corriente con la Seguridad Social
□ Estatutos de la asociación
□ Acta de la Junta Directiva autorizando la solicitud
□ Memoria de actividades del último año
□ Cuentas anuales auditadas (si procede)
□ Declaración de otras ayudas solicitadas
□ Presupuestos de proveedores (mínimo 3 por partida)
□ Cualquier otro documento requerido en la convocatoria

═══════════════════════════════════════════════════════════

Generado automáticamente por Sistema de Gestión de Protección Civil
Fecha de generación: ${fecha}
ID Convocatoria: ${grant.id}

NOTA: Este es un borrador generado automáticamente. Debe ser revisado,
personalizado y completado antes de su presentación oficial.
${sections.memoriaTecnica.generatedWith === 'openai' ? '\n✓ Generado con asistencia de IA (OpenAI GPT-4)' : '\n✓ Generado con plantillas predefinidas'}

═══════════════════════════════════════════════════════════
`;
  }
}

module.exports = new GrantDocumentGeneratorService();
