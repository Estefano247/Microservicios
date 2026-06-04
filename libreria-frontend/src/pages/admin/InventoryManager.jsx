import { useEffect, useState } from 'react';
import { api } from '../../api/client';

export default function InventoryManager() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadInventory = () => {
    setLoading(true);
    api.inventory.list({ page: 0, size: 100 })
      .then((res) => setInventory(res.content || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadInventory() }, []);

  const adjustStock = async (id, type) => {
    const q = prompt(`Cantidad a ${type === 'add' ? 'agregar' : 'reducir'}:`, '1');
    if (!q || isNaN(parseInt(q))) return;
    try {
      if (type === 'add') await api.inventory.add(id, parseInt(q));
      else await api.inventory.reduce(id, parseInt(q));
      loadInventory();
    } catch (e) { alert(e.message); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Inventario</h1>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">ID</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Producto ID</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Cantidad</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {inventory.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{item.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.productoId || item.productId || '-'}</td>
                <td className="px-6 py-4 text-sm text-right font-semibold">{item.cantidad ?? item.stock ?? '-'}</td>
                <td className="px-6 py-4 text-sm text-right space-x-2">
                  <button onClick={() => adjustStock(item.id, 'add')} className="text-green-600 hover:text-green-800 font-medium">Agregar</button>
                  <button onClick={() => adjustStock(item.id, 'reduce')} className="text-orange-600 hover:text-orange-800 font-medium">Reducir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {inventory.length === 0 && <p className="text-center text-gray-500 py-8">No hay registros de inventario.</p>}
      </div>
    </div>
  );
}
