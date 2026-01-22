/**
 * Landing Page Profesional de ResqNet
 * Sistema SaaS para Protección Civil
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import Hero from '../../components/landing/Hero';
import Features from '../../components/landing/Features';
import Differentiators from '../../components/landing/Differentiators';
import Testimonials from '../../components/landing/Testimonials';
import CTASection from '../../components/landing/CTASection';

const HomePage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* What is ResqNet */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            {t('landing.what.title')}
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed">
            {t('landing.what.description')}
          </p>
        </div>
      </section>

      {/* Features */}
      <Features />

      {/* Differentiators */}
      <Differentiators />

      {/* Testimonials */}
      <Testimonials />

      {/* Final CTA */}
      <CTASection />
    </div>
  );
};

export default HomePage;

  const services = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Gestión de Voluntarios',
      description: 'Sistema completo para coordinar y gestionar equipos de voluntarios en emergencias.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Planificación de Eventos',
      description: 'Organiza actividades, simulacros y eventos de capacitación para la comunidad.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      title: 'Inventario y Recursos',
      description: 'Control de equipamiento, materiales y recursos disponibles para emergencias.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Finanzas y Subvenciones',
      description: 'Gestión financiera transparente y búsqueda automática de oportunidades de financiación.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        </svg>
      ),
      title: 'Monitoreo Meteorológico',
      description: 'Alertas climáticas en tiempo real y mapas de riesgo para prevención de desastres.'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
        </svg>
      ),
      title: 'Red Mesh LoRa',
      description: 'Comunicaciones resilientes mediante red mesh para zonas sin cobertura tradicional.'
    }
  ];

  const stats = [
    { value: '500+', label: 'Voluntarios Activos' },
    { value: '50+', label: 'Municipios Servidos' },
    { value: '1000+', label: 'Intervenciones Anuales' },
    { value: '24/7', label: 'Disponibilidad' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section con gradiente y patrón */}
      <section className="hero-section relative">
        <div className="hero-pattern"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 py-12">
            {/* Contenido principal */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold mb-6 animate-fade-in">
                Protección Civil
                <span className="block text-accent-300">Voluntarios Rurales</span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-2xl animate-slide-up">
                Tecnología innovadora al servicio de la comunidad rural. 
                Gestión integral de emergencias y servicios de protección civil.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up">
                <Link
                  to="/volunteer-request"
                  className="px-8 py-4 bg-white text-primary-600 rounded-lg shadow-strong hover:shadow-glow-red hover:scale-105 transition-all duration-300 font-bold text-lg"
                >
                  ¡Únete como Voluntario!
                </Link>
                <Link
                  to="/about"
                  className="px-8 py-4 bg-white/10 backdrop-blur text-white border-2 border-white rounded-lg hover:bg-white/20 transition-all duration-300 font-bold text-lg"
                >
                  Conoce Más
                </Link>
              </div>
            </div>
            
            {/* Imagen/Logo */}
            <div className="flex-shrink-0 animate-scale-in">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl"></div>
                <img 
                  src={logo} 
                  alt="Logo Protección Civil" 
                  className="relative h-64 w-64 sm:h-80 sm:w-80 drop-shadow-2xl animate-pulse-soft"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl sm:text-5xl font-display font-bold text-gradient mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section className="py-20 bg-pattern">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-gray-900 mb-4">
              Nuestros Servicios
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Soluciones tecnológicas integrales para la gestión de protección civil en entornos rurales
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div key={index} className="card group">
                <div className="card-body">
                  <div className="w-16 h-16 bg-gradient-primary rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-medium">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-display font-bold text-gray-900 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Características destacadas */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold mb-6">
                Innovación para Zonas Rurales
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Red Mesh Resiliente</h3>
                    <p className="text-gray-300">
                      Comunicaciones LoRa de largo alcance que funcionan incluso sin infraestructura celular.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Inteligencia Artificial</h3>
                    <p className="text-gray-300">
                      Asistente IA para búsqueda de subvenciones y optimización de recursos.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-accent-500 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Tiempo Real</h3>
                    <p className="text-gray-300">
                      Alertas meteorológicas, posiciones GPS y coordinación de equipos en tiempo real.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-8 shadow-strong">
                <h3 className="text-2xl font-display font-bold mb-6">Tecnologías Utilizadas</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-accent-400">React</div>
                    <div className="text-sm text-gray-300">Frontend</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-accent-400">Node.js</div>
                    <div className="text-sm text-gray-300">Backend</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-accent-400">PostgreSQL</div>
                    <div className="text-sm text-gray-300">Base de Datos</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-accent-400">LoRa</div>
                    <div className="text-sm text-gray-300">Mesh Network</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-primary rounded-2xl shadow-strong p-12 text-center text-white">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              ¿Listo para formar parte del cambio?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Únete a nuestra red de voluntarios y ayuda a proteger tu comunidad con tecnología de vanguardia.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/volunteer-request"
                className="px-8 py-4 bg-white text-primary-600 rounded-lg shadow-medium hover:shadow-strong hover:scale-105 transition-all duration-300 font-bold text-lg"
              >
                Solicitar ser Voluntario
              </Link>
              <Link
                to="/contact"
                className="px-8 py-4 bg-white/10 backdrop-blur border-2 border-white rounded-lg hover:bg-white/20 transition-all duration-300 font-bold text-lg"
              >
                Contactar
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
