/**
 * Configuración de internacionalización
 * Soporte para español e inglés
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Traducciones
const resources = {
  es: {
    translation: {
      // Navegación
      nav: {
        home: 'Inicio',
        about: 'Quiénes somos',
        news: 'Noticias',
        announcements: 'Tablón',
        transport: 'Transporte',
        contact: 'Contacto',
        volunteer: 'Voluntariado',
        login: 'Acceder',
        logout: 'Salir',
        startTrial: 'Prueba Gratis'
      },
      // Landing Page
      landing: {
        hero: {
          title: 'ResqNet: La Solución Integral para Protección Civil',
          subtitle: 'ERP + App móvil diseñados para asociaciones rurales y urbanas. Gestión inteligente de voluntarios, flotas, ayudas públicas y comunicaciones mesh.',
          cta: 'Comenzar Prueba Gratuita',
          ctaSecondary: 'Ver Demo'
        },
        what: {
          title: '¿Qué es ResqNet?',
          description: 'ResqNet es un sistema SaaS completo que moderniza la gestión de asociaciones de Protección Civil. Integramos gestión de voluntarios, flotas vehiculares, búsqueda automática de subvenciones, comunicaciones LoRa/Meshtastic y alertas preventivas por IA.'
        },
        features: {
          title: 'Módulos Principales',
          volunteer: {
            title: 'Gestión de Voluntarios',
            description: 'Control de disponibilidad, formación, certificados y asignación a servicios en tiempo real.'
          },
          mesh: {
            title: 'Comunicaciones Mesh',
            description: 'Integración con redes LoRa y Meshtastic para comunicación sin cobertura en zonas rurales.'
          },
          fleet: {
            title: 'Flota de Vehículos',
            description: 'Mantenimiento preventivo, geolocalización en vivo, reservas tipo carsharing entre asociaciones.'
          },
          grants: {
            title: 'Buscador de Ayudas',
            description: 'IA que encuentra y sugiere subvenciones públicas relevantes. Generador automático de solicitudes.'
          },
          weather: {
            title: 'Alertas Meteorológicas',
            description: 'Predicción preventiva de incendios, inundaciones y eventos extremos con IA y datos satelitales.'
          },
          drones: {
            title: 'Monitorización con Drones',
            description: 'Detección temprana de incendios con cámaras térmicas y procesamiento de imagen por IA.'
          }
        },
        differentiators: {
          title: 'Ventajas Diferenciales',
          ai: 'IA para detección de incendios en fase temprana',
          satellite: 'Imágenes Sentinel/Planet procesadas automáticamente',
          mesh: 'Comunicaciones mesh sin internet',
          rural: 'Optimizado para entornos rurales',
          saas: '100% cloud, sin instalación',
          open: 'Arquitectura abierta e integrable'
        },
        testimonials: {
          title: 'Lo Que Dicen Nuestros Usuarios',
          user1: {
            name: 'María González',
            role: 'Coordinadora - PC Montaña Alta',
            text: 'ResqNet nos ha permitido profesionalizar nuestra asociación rural. Las comunicaciones mesh son vitales en zonas sin cobertura.'
          },
          user2: {
            name: 'Javier Martínez',
            role: 'Tesorero - PC Metropolitana',
            text: 'El buscador de ayudas nos ahorró cientos de horas. En un mes conseguimos 3 subvenciones que no conocíamos.'
          },
          user3: {
            name: 'Ana López',
            role: 'Jefa de Flota - PC Costa Norte',
            text: 'El carsharing entre asociaciones maximiza el uso de vehículos. Geoposicionamiento en tiempo real imprescindible.'
          }
        },
        cta: {
          title: '¿Listo para Transformar tu Asociación?',
          subtitle: 'Prueba ResqNet gratis durante 30 días. Sin tarjeta de crédito.',
          button: 'Comenzar Ahora'
        },
        footer: {
          product: 'Producto',
          features: 'Características',
          pricing: 'Precios',
          demo: 'Demo',
          company: 'Empresa',
          about: 'Nosotros',
          contact: 'Contacto',
          blog: 'Blog',
          legal: 'Legal',
          privacy: 'Privacidad',
          terms: 'Términos',
          cookies: 'Cookies',
          copyright: '© 2026 ResqNet. Todos los derechos reservados.'
        }
      },
      // Registration
      register: {
        title: 'Comienza tu Prueba Gratuita',
        subtitle: '30 días de acceso completo. Sin tarjeta de crédito.',
        firstName: 'Nombre',
        lastName: 'Apellidos',
        email: 'Email',
        organization: 'Asociación / Organización',
        phone: 'Teléfono (opcional)',
        country: 'País',
        submit: 'Crear Cuenta Trial',
        success: 'Cuenta creada. Revisa tu email para acceder.',
        error: 'Error al crear cuenta. Inténtalo de nuevo.'
      },
      // Dashboard
      dashboard: {
        title: 'Panel de Control',
        volunteers: 'Voluntarios',
        events: 'Eventos',
        inventory: 'Inventario',
        finance: 'Finanzas'
      },
      // Común
      common: {
        loading: 'Cargando...',
        save: 'Guardar',
        cancel: 'Cancelar',
        delete: 'Eliminar',
        edit: 'Editar',
        search: 'Buscar',
        filter: 'Filtrar',
        export: 'Exportar',
        more: 'Ver más'
      }
    }
  },
  en: {
    translation: {
      nav: {
        home: 'Home',
        about: 'About us',
        news: 'News',
        announcements: 'Board',
        transport: 'Transport',
        contact: 'Contact',
        volunteer: 'Volunteer',
        login: 'Login',
        logout: 'Logout',
        startTrial: 'Start Free Trial'
      },
      landing: {
        hero: {
          title: 'ResqNet: The Complete Solution for Civil Protection',
          subtitle: 'ERP + Mobile App designed for rural and urban associations. Smart management of volunteers, fleets, public grants and mesh communications.',
          cta: 'Start Free Trial',
          ctaSecondary: 'Watch Demo'
        },
        what: {
          title: 'What is ResqNet?',
          description: 'ResqNet is a complete SaaS system that modernizes Civil Protection association management. We integrate volunteer management, vehicle fleets, automatic grant searching, LoRa/Meshtastic communications and AI-powered preventive alerts.'
        },
        features: {
          title: 'Main Modules',
          volunteer: {
            title: 'Volunteer Management',
            description: 'Control availability, training, certificates and real-time service assignment.'
          },
          mesh: {
            title: 'Mesh Communications',
            description: 'Integration with LoRa and Meshtastic networks for communication without coverage in rural areas.'
          },
          fleet: {
            title: 'Vehicle Fleet',
            description: 'Preventive maintenance, live geolocation, carsharing-style reservations between associations.'
          },
          grants: {
            title: 'Grant Finder',
            description: 'AI that finds and suggests relevant public grants. Automatic application generator.'
          },
          weather: {
            title: 'Weather Alerts',
            description: 'Preventive prediction of fires, floods and extreme events with AI and satellite data.'
          },
          drones: {
            title: 'Drone Monitoring',
            description: 'Early fire detection with thermal cameras and AI image processing.'
          }
        },
        differentiators: {
          title: 'Key Advantages',
          ai: 'AI for early-stage fire detection',
          satellite: 'Automatically processed Sentinel/Planet imagery',
          mesh: 'Mesh communications without internet',
          rural: 'Optimized for rural environments',
          saas: '100% cloud, no installation',
          open: 'Open and integrable architecture'
        },
        testimonials: {
          title: 'What Our Users Say',
          user1: {
            name: 'María González',
            role: 'Coordinator - High Mountain CP',
            text: 'ResqNet has allowed us to professionalize our rural association. Mesh communications are vital in areas without coverage.'
          },
          user2: {
            name: 'Javier Martínez',
            role: 'Treasurer - Metropolitan CP',
            text: 'The grant finder saved us hundreds of hours. In one month we got 3 grants we didn\'t know about.'
          },
          user3: {
            name: 'Ana López',
            role: 'Fleet Manager - North Coast CP',
            text: 'Carsharing between associations maximizes vehicle usage. Real-time geopositioning is essential.'
          }
        },
        cta: {
          title: 'Ready to Transform Your Association?',
          subtitle: 'Try ResqNet free for 30 days. No credit card required.',
          button: 'Get Started Now'
        },
        footer: {
          product: 'Product',
          features: 'Features',
          pricing: 'Pricing',
          demo: 'Demo',
          company: 'Company',
          about: 'About Us',
          contact: 'Contact',
          blog: 'Blog',
          legal: 'Legal',
          privacy: 'Privacy',
          terms: 'Terms',
          cookies: 'Cookies',
          copyright: '© 2026 ResqNet. All rights reserved.'
        }
      },
      register: {
        title: 'Start Your Free Trial',
        subtitle: '30 days of full access. No credit card required.',
        firstName: 'First Name',
        lastName: 'Last Name',
        email: 'Email',
        organization: 'Association / Organization',
        phone: 'Phone (optional)',
        country: 'Country',
        submit: 'Create Trial Account',
        success: 'Account created. Check your email to access.',
        error: 'Error creating account. Please try again.'
      },
      dashboard: {
        title: 'Dashboard',
        volunteers: 'Volunteers',
        events: 'Events',
        inventory: 'Inventory',
        finance: 'Finance'
      },
      common: {
        loading: 'Loading...',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        search: 'Search',
        filter: 'Filter',
        export: 'Export',
        more: 'See more'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es', // Idioma por defecto
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
