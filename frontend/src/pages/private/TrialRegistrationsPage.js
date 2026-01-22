/**
 * Página de Administración de Registros Trial
 * Gestión de cuentas trial de ResqNet
 */

import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Alert } from '../../components/ui';
import api from '../../services/api';

const TrialRegistrationsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/trial-registrations');
      setRegistrations(response.data);
    } catch (err) {
      setError('Error al cargar registros');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'yellow',
      active: 'green',
      expired: 'red',
      converted: 'blue'
    };
    return <Badge color={colors[status] || 'gray'}>{status}</Badge>;
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/admin/trial-registrations/${id}/approve`);
      fetchRegistrations();
    } catch (err) {
      setError('Error al aprobar registro');
    }
  };

  const handleReject = async (id) => {
    try {
      await api.delete(`/admin/trial-registrations/${id}`);
      fetchRegistrations();
    } catch (err) {
      setError('Error al rechazar registro');
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Registros Trial</h1>
        <p className="text-gray-600">Gestión de cuentas de prueba de ResqNet</p>
      </div>

      {error && (
        <Alert type="error" className="mb-4">
          {error}
        </Alert>
      )}

      <Card>
        <Table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Organización</th>
              <th>País</th>
              <th>Fecha Registro</th>
              <th>Vencimiento Trial</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {registrations.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-8 text-gray-500">
                  No hay registros pendientes
                </td>
              </tr>
            ) : (
              registrations.map((reg) => (
                <tr key={reg.id}>
                  <td>{reg.id}</td>
                  <td>
                    {reg.firstName} {reg.lastName}
                  </td>
                  <td>{reg.email}</td>
                  <td>{reg.organization}</td>
                  <td>{reg.country}</td>
                  <td>{new Date(reg.createdAt).toLocaleDateString()}</td>
                  <td>{new Date(reg.trialEndsAt).toLocaleDateString()}</td>
                  <td>{getStatusBadge(reg.status)}</td>
                  <td>
                    <div className="flex gap-2">
                      {reg.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(reg.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(reg.id)}
                            className="text-red-600 border-red-600"
                          >
                            Rechazar
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-900 mb-2">Usuarios del Sistema</h3>
        <p className="text-sm text-blue-800 mb-3">
          Usuarios configurados para acceder al sistema:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded p-3 border">
            <p className="font-semibold text-sm">Admin</p>
            <p className="text-xs text-gray-600">admin@resqnet.es</p>
            <p className="text-xs text-gray-600">Password: Admin123!</p>
          </div>
          <div className="bg-white rounded p-3 border">
            <p className="font-semibold text-sm">Juan (Tesorero)</p>
            <p className="text-xs text-gray-600">juan@resqnet.es</p>
            <p className="text-xs text-gray-600">Password: Admin123!</p>
          </div>
          <div className="bg-white rounded p-3 border">
            <p className="font-semibold text-sm">David (Voluntario)</p>
            <p className="text-xs text-gray-600">david@resqnet.es</p>
            <p className="text-xs text-gray-600">Password: Admin123!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialRegistrationsPage;
