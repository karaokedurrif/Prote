import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge } from '../../components/ui';
import api from '../../services/api';

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await api.get('/inventory');
      setItems(response.data);
    } catch (error) {
      console.error('Error al cargar inventario:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (cantidad, minimo) => {
    if (cantidad === 0) return <Badge color="red">Sin stock</Badge>;
    if (cantidad <= minimo) return <Badge color="orange">Stock bajo</Badge>;
    return <Badge color="green">Disponible</Badge>;
  };

  const categories = ['all', 'vehiculo', 'equipo', 'herramienta', 'material', 'epi'];
  const filteredItems = category === 'all' ? items : items.filter(i => i.categoria === category);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Inventario</h1>
          <p className="text-gray-600 mt-1">Control de equipos, materiales y recursos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">📥 Entrada</Button>
          <Button variant="outline">📤 Salida</Button>
          <Button className="bg-blue-500 hover:bg-blue-600">+ Nuevo Item</Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <Button
            key={cat}
            variant={category === cat ? 'primary' : 'outline'}
            onClick={() => setCategory(cat)}
            size="sm"
          >
            {cat === 'all' ? 'Todos' : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50">
          <div className="text-sm text-blue-600 font-semibold">Total Items</div>
          <div className="text-3xl font-bold text-blue-900 mt-2">{items.length}</div>
        </Card>
        <Card className="bg-green-50">
          <div className="text-sm text-green-600 font-semibold">Disponibles</div>
          <div className="text-3xl font-bold text-green-900 mt-2">
            {items.filter(i => i.cantidad > i.cantidad_minima).length}
          </div>
        </Card>
        <Card className="bg-orange-50">
          <div className="text-sm text-orange-600 font-semibold">Stock Bajo</div>
          <div className="text-3xl font-bold text-orange-900 mt-2">
            {items.filter(i => i.cantidad > 0 && i.cantidad <= i.cantidad_minima).length}
          </div>
        </Card>
        <Card className="bg-red-50">
          <div className="text-sm text-red-600 font-semibold">Sin Stock</div>
          <div className="text-3xl font-bold text-red-900 mt-2">
            {items.filter(i => i.cantidad === 0).length}
          </div>
        </Card>
      </div>

      <Card>
        <Table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Cantidad</th>
              <th>Ubicación</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-8">Cargando...</td></tr>
            ) : filteredItems.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-8 text-gray-500">No hay items en esta categoría</td></tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id}>
                  <td className="font-mono text-sm">{item.codigo}</td>
                  <td className="font-semibold">{item.nombre}</td>
                  <td>
                    <Badge color="blue">{item.categoria}</Badge>
                  </td>
                  <td>
                    <span className={`font-bold ${
                      item.cantidad === 0 ? 'text-red-600' :
                      item.cantidad <= item.cantidad_minima ? 'text-orange-600' :
                      'text-green-600'
                    }`}>
                      {item.cantidad}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">/ min: {item.cantidad_minima}</span>
                  </td>
                  <td className="text-sm text-gray-600">{item.ubicacion || 'Sin asignar'}</td>
                  <td>{getStatusBadge(item.cantidad, item.cantidad_minima)}</td>
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
