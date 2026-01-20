/**
 * Componente raíz de la aplicación
 * Gestiona rutas, autenticación y providers globales
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import './i18n/config';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import PrivateLayout from './layouts/PrivateLayout';

// Páginas públicas
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import NewsPage from './pages/public/NewsPage';
import NewsDetailPage from './pages/public/NewsDetailPage';
import AnnouncementsPage from './pages/public/AnnouncementsPage';
import TransportPage from './pages/public/TransportPage';
import ContactPage from './pages/public/ContactPage';
import VolunteerRequestPage from './pages/public/VolunteerRequestPage';

// Páginas de autenticación
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Páginas privadas
import DashboardPage from './pages/private/DashboardPage';
import VolunteersPage from './pages/private/VolunteersPage';
import EventsPage from './pages/private/EventsPage';
import InventoryPage from './pages/private/InventoryPage';
import FinancePage from './pages/private/FinancePage';
import GrantsPage from './pages/private/GrantsPage';
import MeshMapPage from './pages/private/MeshMapPage';
import WeatherPage from './pages/private/WeatherPage';
import DronesPage from './pages/private/DronesPage';
import RiskMapPage from './pages/private/RiskMapPage';

// Componentes
import ProtectedRoute from './components/ProtectedRoute';

// Configurar React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Rutas públicas */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/quienes-somos" element={<AboutPage />} />
            <Route path="/noticias" element={<NewsPage />} />
            <Route path="/noticias/:slug" element={<NewsDetailPage />} />
            <Route path="/tablon" element={<AnnouncementsPage />} />
            <Route path="/transporte" element={<TransportPage />} />
            <Route path="/contacto" element={<ContactPage />} />
            <Route path="/voluntariado" element={<VolunteerRequestPage />} />
          </Route>

          {/* Autenticación */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />

          {/* Rutas privadas */}
          <Route element={<ProtectedRoute><PrivateLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/voluntarios" element={<VolunteersPage />} />
            <Route path="/eventos" element={<EventsPage />} />
            <Route path="/inventario" element={<InventoryPage />} />
            <Route path="/finanzas" element={<FinancePage />} />
            <Route path="/subvenciones" element={<GrantsPage />} />
            <Route path="/mapa-mesh" element={<MeshMapPage />} />
            <Route path="/meteorologia" element={<WeatherPage />} />
            <Route path="/drones" element={<DronesPage />} />
            <Route path="/mapa-riesgos" element={<RiskMapPage />} />
          </Route>
        </Routes>
      </Router>

      {/* Notificaciones toast */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
