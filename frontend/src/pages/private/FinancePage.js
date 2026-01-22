/**
 * Página de Gestión Financiera
 * Control de ingresos, gastos, facturas y presupuestos
 */

import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Alert } from '../../components/ui';
import api from '../../services/api';

export default function FinancePage() {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({
    totalIngresos: 0,
    totalGastos: 0,
    pendientes: 0,
    balance: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      const response = await api.get('/finance/invoices');
      setInvoices(response.data);
      
      // Calcular estadísticas
      const ingresos = response.data
        .filter(i => i.tipo === 'ingreso' && i.estado === 'pagada')
        .reduce((sum, i) => sum + parseFloat(i.importe), 0);
      
      const gastos = response.data
        .filter(i => i.tipo === 'gasto' && i.estado === 'pagada')
        .reduce((sum, i) => sum + parseFloat(i.importe), 0);
      
      const pendientes = response.data
        .filter(i => i.estado === 'pendiente')
        .reduce((sum, i) => sum + parseFloat(i.importe), 0);

      setStats({
        totalIngresos: ingresos,
        totalGastos: gastos,
        pendientes: pendientes,
        balance: ingresos - gastos
      });
    } catch (error) {
      console.error('Error al cargar datos financieros:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (estado) => {
    const colors = {
      'pagada': 'green',
      'pendiente': 'orange',
      'vencida': 'red',
      'cancelada': 'gray'
    };
    return <Badge color={colors[estado]}>{estado.toUpperCase()}</Badge>;
  };

  const getTypeBadge = (tipo) => {
    return tipo === 'ingreso' ? 
      <Badge color="green">💰 Ingreso</Badge> : 
      <Badge color="red">💸 Gasto</Badge>;
  };

  const filteredInvoices = filter === 'all' ? invoices : 
    invoices.filter(i => i.tipo === filter || i.estado === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión Financiera</h1>
          <p className="text-gray-600 mt-1">Control de tesorería, facturas y presupuestos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">📥 Importar</Button>
          <Button variant="outline">📊 Informes</Button>
          <Button className="bg-blue-500 hover:bg-blue-600">+ Nueva Factura</Button>
        </div>
      </div>

      {/* Estadísticas Financieras */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-green-50 border-green-200">
          <div className="text-sm text-green-600 font-semibold">Total Ingresos</div>
          <div className="text-3xl font-bold text-green-900 mt-2">
            {loading ? '...' : `${stats.totalIngresos.toLocaleString()}€`}
          </div>
          <div className="text-xs text-green-600 mt-1">Este año</div>
        </Card>

        <Card className="bg-red-50 border-red-200">
          <div className="text-sm text-red-600 font-semibold">Total Gastos</div>
          <div className="text-3xl font-bold text-red-900 mt-2">
            {loading ? '...' : `${stats.totalGastos.toLocaleString()}€`}
          </div>
          <div className="text-xs text-red-600 mt-1">Este año</div>
        </Card>

        <Card className={`${stats.balance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
          <div className={`text-sm font-semibold ${stats.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            Balance
          </div>
          <div className={`text-3xl font-bold mt-2 ${stats.balance >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
            {loading ? '...' : `${stats.balance >= 0 ? '+' : ''}${stats.balance.toLocaleString()}€`}
          </div>
          <div className={`text-xs mt-1 ${stats.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            Ingresos - Gastos
          </div>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <div className="text-sm text-orange-600 font-semibold">Pendientes de Pago</div>
          <div className="text-3xl font-bold text-orange-900 mt-2">
            {loading ? '...' : `${stats.pendientes.toLocaleString()}€`}
          </div>
          <div className="text-xs text-orange-600 mt-1">Por cobrar/pagar</div>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <Button variant={filter === 'all' ? 'primary' : 'outline'} onClick={() => setFilter('all')}>
          Todas
        </Button>
        <Button variant={filter === 'ingreso' ? 'primary' : 'outline'} onClick={() => setFilter('ingreso')}>
          💰 Ingresos
        </Button>
        <Button variant={filter === 'gasto' ? 'primary' : 'outline'} onClick={() => setFilter('gasto')}>
          💸 Gastos
        </Button>
        <Button variant={filter === 'pendiente' ? 'primary' : 'outline'} onClick={() => setFilter('pendiente')}>
          ⏳ Pendientes
        </Button>
      </div>

      {/* Información sobre Subvenciones */}
      <Alert type="info" className="bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div className="flex-1">
            <h3 className="font-bold text-blue-900">Sistema de Subvenciones</h3>
            <p className="text-sm text-blue-800 mt-1">
              El buscador inteligente de subvenciones está disponible en el menú <strong>Subvenciones</strong>. 
              Incluye IA para análisis de viabilidad, scraping automático y generación de documentación.
            </p>
            <Button 
              size="sm" 
              className="mt-3 bg-blue-600 hover:bg-blue-700"
              onClick={() => window.location.href = '/subvenciones'}
            >
              🔍 Ir a Subvenciones
            </Button>
          </div>
        </div>
      </Alert>

      {/* Tabla de Facturas */}
      <Card>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">Facturas y Movimientos</h2>
        </div>
        <Table>
          <thead>
            <tr>
              <th>Nº Factura</th>
              <th>Tipo</th>
              <th>Concepto</th>
              <th>Fecha</th>
              <th>Importe</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-8">Cargando...</td></tr>
            ) : filteredInvoices.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">
                  No hay facturas registradas
                </td>
              </tr>
            ) : (
              filteredInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="font-mono text-sm">{invoice.numero}</td>
                  <td>{getTypeBadge(invoice.tipo)}</td>
                  <td className="font-semibold">{invoice.concepto}</td>
                  <td>{new Date(invoice.fecha).toLocaleDateString('es-ES')}</td>
                  <td className={`font-bold ${
                    invoice.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {invoice.tipo === 'ingreso' ? '+' : '-'}{parseFloat(invoice.importe).toLocaleString()}€
                  </td>
                  <td>{getStatusBadge(invoice.estado)}</td>
                  <td>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Ver</Button>
                      {invoice.estado === 'pendiente' && (
                        <Button size="sm" className="bg-green-500 hover:bg-green-600">
                          Marcar pagada
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>

      {/* Gráfico de Evolución (Placeholder) */}
      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Evolución Mensual</h2>
        <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <span className="text-4xl mb-2 block">📊</span>
            <p>Gráfico de evolución financiera</p>
            <p className="text-sm mt-1">(Próximamente con Chart.js)</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
