/**
 * Layout público moderno
 * Layout para páginas públicas del sitio web con diseño elegante
 */

import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/landing/LanguageSelector';
import logo from '../assets/logo.svg';

const PublicLayout = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: t('nav.home'), path: '/' },
    { name: t('nav.about'), path: '/quienes-somos' },
    { name: t('nav.news'), path: '/noticias' },
    { name: 'Anuncios', path: '/tablon' },
    { name: t('nav.transport'), path: '/transporte' },
    { name: t('nav.contact'), path: '/contacto' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header moderno */}
      <header className="sticky top-0 z-40 bg-white shadow-md">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo y título */}
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src={logo} 
                alt="Logo ResqNet" 
                className="h-14 w-14 transition-transform duration-300 group-hover:scale-110"
              />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-blue-600">ResqNet</h1>
                <p className="text-xs text-gray-600">Civil Protection</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Botones de acción */}
            <div className="hidden md:flex items-center gap-3">
              <LanguageSelector />
              
              <Link
                to="/register-trial"
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition font-medium"
              >
                {t('nav.startTrial')}
              </Link>
              
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
              >
                {t('nav.login')}
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="mt-4 pt-4 border-t space-y-2">
                <div className="px-4"><LanguageSelector /></div>
                <Link
                  to="/register-trial"
                  className="block text-center px-4 py-2 rounded-lg bg-gray-200 text-gray-800"
                >
                  {t('nav.startTrial')}
                </Link>
                <Link
                  to="/login"
                  className="block text-center px-4 py-2 rounded-lg bg-blue-600 text-white"
                >
                  {t('nav.login')}
                </Link>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">{t('landing.footer.product')}</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="hover:text-blue-400">{t('landing.footer.features')}</Link></li>
                <li><Link to="/" className="hover:text-blue-400">{t('landing.footer.pricing')}</Link></li>
                <li><Link to="/" className="hover:text-blue-400">{t('landing.footer.demo')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">{t('landing.footer.company')}</h3>
              <ul className="space-y-2">
                <li><Link to="/quienes-somos" className="hover:text-blue-400">{t('landing.footer.about')}</Link></li>
                <li><Link to="/contacto" className="hover:text-blue-400">{t('landing.footer.contact')}</Link></li>
                <li><Link to="/noticias" className="hover:text-blue-400">{t('landing.footer.blog')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">{t('landing.footer.legal')}</h3>
              <ul className="space-y-2">
                <li><Link to="/privacidad" className="hover:text-blue-400">{t('landing.footer.privacy')}</Link></li>
                <li><Link to="/terminos" className="hover:text-blue-400">{t('landing.footer.terms')}</Link></li>
                <li><Link to="/cookies" className="hover:text-blue-400">{t('landing.footer.cookies')}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">ResqNet</h3>
              <p className="text-gray-400">
                {t('landing.footer.copyright')}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
