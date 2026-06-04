import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';

export default function ProductsManager() {
  const [products, setProducts] = useState({ content: [], totalPages: 0, number: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const loadProducts = () => {
    setLoading(true);
    api.products.list({ page, size: 10, sort: 'id,desc' })
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProducts() }, [page]);

  const deleteProduct = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await api.products.delete(id);
      loadProducts();
    } catch (e) { alert(e.message); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
        <Link to="/admin/products/new" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg">
          + Nuevo Producto
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">ID</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Título</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Autor</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Categoría</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Precio</th>
              <th className="text-center px-6 py-3 text-sm font-semibold text-gray-600">Activo</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.content?.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{p.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.titulo}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{p.autor?.nombre}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{p.categoria}</td>
                <td className="px-6 py-4 text-sm text-right font-medium">S/ {Number(p.precio).toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-center">
                  <span className={`inline-block w-2 h-2 rounded-full ${p.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                </td>
                <td className="px-6 py-4 text-sm text-right space-x-2">
                  <Link to={`/admin/products/${p.id}`} className="text-indigo-600 hover:text-indigo-800 font-medium">Editar</Link>
                  <button onClick={() => deleteProduct(p.id)} className="text-red-600 hover:text-red-800 font-medium">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button disabled={products.first} onClick={() => setPage(page - 1)}
            className="px-4 py-2 rounded-lg border disabled:opacity-50 hover:bg-gray-50 text-sm font-medium">&laquo; Anterior</button>
          {Array.from({ length: products.totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i)}
              className={`w-10 h-10 rounded-lg text-sm font-medium ${i === products.number ? 'bg-indigo-600 text-white' : 'border hover:bg-gray-50'}`}>
              {i + 1}
            </button>
          ))}
          <button disabled={products.last} onClick={() => setPage(page + 1)}
            className="px-4 py-2 rounded-lg border disabled:opacity-50 hover:bg-gray-50 text-sm font-medium">Siguiente &raquo;</button>
        </div>
      )}
    </div>
  );
}
