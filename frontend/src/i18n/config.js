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
        logout: 'Salir'
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
        logout: 'Logout'
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
