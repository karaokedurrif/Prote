/**
 * Página de Registro para Cuenta Trial
 * 30 días de acceso gratuito a ResqNet
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input, Alert } from '../../components/ui';
import api from '../../services/api';

const RegisterTrialPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    organization: '',
    phone: '',
    country: 'ES'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/public/register-trial', {
        ...formData,
        language: localStorage.getItem('language') || 'es'
      });

      setSuccess(true);
      
      // Redirigir a login después de 3 segundos
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            email: formData.email,
            message: t('register.success')
          }
        });
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.error || t('register.error'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Cuenta Creada!
          </h2>
          <p className="text-gray-700 mb-4">
            {t('register.success')}
          </p>
          <p className="text-sm text-gray-500">
            Redirigiendo al login...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('register.title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('register.subtitle')}
          </p>
        </div>

        <Card>
          {error && (
            <Alert type="error" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('register.firstName')} *
                </label>
                <Input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  placeholder="Juan"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('register.lastName')} *
                </label>
                <Input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Pérez"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('register.email')} *
              </label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="juan.perez@asociacion.org"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('register.organization')} *
              </label>
              <Input
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                required
                placeholder="Asociación de Protección Civil Montaña Alta"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('register.phone')}
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+34 600 123 456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('register.country')} *
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ES">España</option>
                  <option value="FR">France</option>
                  <option value="IT">Italia</option>
                  <option value="PT">Portugal</option>
                  <option value="UK">United Kingdom</option>
                  <option value="DE">Deutschland</option>
                  <option value="US">United States</option>
                  <option value="MX">México</option>
                  <option value="AR">Argentina</option>
                  <option value="CL">Chile</option>
                  <option value="CO">Colombia</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Incluye en tu prueba gratuita:
                  </h3>
                  <ul className="mt-2 text-sm text-blue-700 list-disc list-inside">
                    <li>Acceso completo a todos los módulos</li>
                    <li>30 días sin compromiso</li>
                    <li>Soporte técnico incluido</li>
                    <li>Sin tarjeta de crédito</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Creando cuenta...' : t('register.submit')}
            </Button>

            <p className="text-center text-sm text-gray-500">
              Al registrarte, aceptas nuestros{' '}
              <a href="/terms" className="text-blue-600 hover:underline">
                Términos de Servicio
              </a>
              {' '}y{' '}
              <a href="/privacy" className="text-blue-600 hover:underline">
                Política de Privacidad
              </a>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default RegisterTrialPage;
