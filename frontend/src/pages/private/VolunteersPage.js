import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Alert } from '../../components/ui';
import api from '../../services/api';

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/volunteers');
      setVolunteers(response.data);
    } catch (err) {
      setError('Error al cargar voluntarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (activo) => {
    return activo ? 
      <Badge color="green">Activo</Badge> : 
      <Badge color="gray">Inactivo</Badge>;
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Voluntarios</h1>
          <p className="text-gray-600 mt-1">Control de voluntarios, formación y disponibilidad</p>
        </div>
        <Button className="bg-blue-500 hover:bg-blue-600">+ Nuevo Voluntario</Button>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50">
          <div className="text-sm text-blue-600 font-semibold">Total Voluntarios</div>
          <div className="text-3xl font-bold text-blue-900 mt-2">{volunteers.length}</div>
        </Card>
        <Card className="bg-green-50">
          <div className="text-sm text-green-600 font-semibold">Activos</div>
          <div className="text-3xl font-bold text-green-900 mt-2">
            {volunteers.filter(v => v.activo).length}
          </div>
        </Card>
        <Card className="bg-purple-50">
          <div className="text-sm text-purple-600 font-semibold">Con Formación</div>
          <div className="text-3xl font-bold text-purple-900 mt-2">
            {volunteers.filter(v => v.formaciones?.length > 0).length}
          </div>
        </Card>
        <Card className="bg-orange-50">
          <div className="text-sm text-orange-600 font-semibold">Disponibles Hoy</div>
          <div className="text-3xl font-bold text-orange-900 mt-2">
            {volunteers.filter(v => v.disponible).length}
          </div>
        </Card>
      </div>

      <Card>
        <Table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>DNI</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Formación</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {volunteers.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">
                  No hay voluntarios registrados
                </td>
              </tr>
            ) : (
              volunteers.map((volunteer) => (
                <tr key={volunteer.id}>
                  <td className="font-semibold">
                    {volunteer.nombre} {volunteer.apellidos}
                  </td>
                  <td>{volunteer.dni}</td>
                  <td>{volunteer.telefono}</td>
                  <td className="text-sm text-gray-600">{volunteer.email}</td>
                  <td>
                    {volunteer.formaciones?.length > 0 ? (
                      <div className="flex gap-1 flex-wrap">
                        {volunteer.formaciones.slice(0, 2).map((f, i) => (
                          <Badge key={i} color="blue" size="sm">{f}</Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Sin formación</span>
                    )}
                  </td>
                  <td>{getStatusBadge(volunteer.activo)}</td>
                  <td>
                    <Button size="sm" variant="outline">Ver</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
