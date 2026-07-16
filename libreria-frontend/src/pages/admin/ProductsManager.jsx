import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { CATEGORY_LABELS, TYPE_LABELS, TYPE_BADGE, formatPrice } from '../../constants/catalog';
import Icon from '../../components/ui/Icon';
import { PageLoader } from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';

export default function ProductsManager() {
  const [products, setProducts] = useState({ content: [], totalPages: 0, number: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');

  const loadProducts = (p = page, q = search) => {
    setLoading(true);
    const params = { page: p, size: 10, sort: 'id,desc' };
    if (q) params.titulo = q;
    api.products.list(params)
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadProducts(page, search); }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    loadProducts(0, search);
  };

  const deleteProduct = async (id) => {
    if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;
    try { await api.products.delete(id); loadProducts(); }
    catch (e) { alert(e.message); }
  };

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Productos</h1>
          <p className="mt-1 text-sm text-muted">Catálogo de libros de la tienda.</p>
        </div>
        <Link to="/admin/products/new" className="btn btn-primary">
          <Icon name="plus" className="w-4 h-4" /> Nuevo producto
        </Link>
      </header>

      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título…"
            className="input w-full pl-9 pr-20"
          />
          <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg bg-brand-600 px-3 py-1 text-xs font-medium text-white hover:bg-brand-700">
            Buscar
          </button>
        </div>
      </form>

      {loading ? (
        <PageLoader />
      ) : !products.content?.length ? (
        <div className="card py-10">
          <EmptyState icon="book" title={search ? 'Sin resultados' : 'Sin productos'} description={search ? `No hay productos que coincidan con "${search}".` : 'Crea tu primer producto para empezar.'}>
            {!search && <Link to="/admin/products/new" className="btn btn-primary"><Icon name="plus" className="w-4 h-4" /> Nuevo producto</Link>}
          </EmptyState>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface-soft text-left text-xs uppercase tracking-wide text-muted">
                    <th className="px-5 py-3 font-semibold">Producto</th>
                    <th className="px-5 py-3 font-semibold">Categoría</th>
                    <th className="px-5 py-3 font-semibold">Tipo</th>
                    <th className="px-5 py-3 text-right font-semibold">Precio</th>
                    <th className="px-5 py-3 text-center font-semibold">Estado</th>
                    <th className="px-5 py-3 text-right font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {products.content.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-surface-soft">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-ink">{p.titulo}</p>
                        <p className="text-xs text-muted">{p.autor?.nombre || '—'} · #{p.id}</p>
                      </td>
                      <td className="px-5 py-3.5 text-muted">{CATEGORY_LABELS[p.categoria] || p.categoria}</td>
                      <td className="px-5 py-3.5">
                        <span className={`badge ${TYPE_BADGE[p.tipo] || 'bg-stone-100 text-stone-600'}`}>{TYPE_LABELS[p.tipo] || p.tipo}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium text-ink">{formatPrice(p.precio)}</td>
                      <td className="px-5 py-3.5 text-center">
                        <span className={`badge ${p.isActive ? 'bg-brand-100 text-brand-800' : 'bg-stone-200 text-stone-600'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${p.isActive ? 'bg-brand-600' : 'bg-stone-400'}`} />
                          {p.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/admin/products/${p.id}`} className="rounded-lg p-2 text-muted hover:bg-brand-50 hover:text-brand-700" aria-label="Editar">
                            <Icon name="edit" className="w-4 h-4" />
                          </Link>
                          <button onClick={() => deleteProduct(p.id)} className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600" aria-label="Eliminar">
                            <Icon name="trash" className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={products.number} totalPages={products.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
