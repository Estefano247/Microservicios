import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import Icon from '../../components/ui/Icon';
import { PageLoader } from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';

export default function UsersManager() {
  const [users, setUsers] = useState({ content: [], totalPages: 0, number: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const loadUsers = () => {
    setLoading(true);
    api.users.adminList({ page, size: 10, sort: 'id,desc' })
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, [page]);

  const deactivateUser = async (id) => {
    if (!confirm('¿Desactivar este usuario?')) return;
    try { await api.users.adminDeactivate(id); loadUsers(); }
    catch (e) { alert(e.message); }
  };

  const reactivateUser = async () => {
    const email = prompt('Email del usuario a reactivar:');
    if (!email) return;
    try { await api.users.adminReactivate(email); loadUsers(); }
    catch (e) { alert(e.message); }
  };

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Usuarios</h1>
          <p className="mt-1 text-sm text-muted">Administra las cuentas registradas.</p>
        </div>
        <button onClick={reactivateUser} className="btn btn-secondary">
          <Icon name="refresh" className="w-4 h-4" /> Reactivar usuario
        </button>
      </header>

      {loading ? (
        <PageLoader />
      ) : !users.content?.length ? (
        <div className="card py-10">
          <EmptyState icon="users" title="Sin usuarios" description="Aún no hay cuentas registradas." />
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface-soft text-left text-xs uppercase tracking-wide text-muted">
                    <th className="px-5 py-3 font-semibold">Usuario</th>
                    <th className="px-5 py-3 font-semibold">Teléfono</th>
                    <th className="px-5 py-3 font-semibold">Rol</th>
                    <th className="px-5 py-3 text-center font-semibold">Estado</th>
                    <th className="px-5 py-3 text-right font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {users.content.map((u) => {
                    const active = u.enabled !== false;
                    return (
                      <tr key={u.id} className="transition-colors hover:bg-surface-soft">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                              {(u.name || u.email || '?').charAt(0).toUpperCase()}
                            </span>
                            <div>
                              <p className="font-medium text-ink">{u.name} {u.lastName}</p>
                              <p className="text-xs text-muted">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-muted">{u.phone || '—'}</td>
                        <td className="px-5 py-3.5">
                          <span className={`badge capitalize ${u.role === 'ADMIN' ? 'bg-accent-50 text-accent-700' : 'bg-stone-100 text-stone-600'}`}>
                            {u.role?.toLowerCase()}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`badge ${active ? 'bg-brand-100 text-brand-800' : 'bg-red-100 text-red-700'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-brand-600' : 'bg-red-500'}`} />
                            {active ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {active && (
                            <button onClick={() => deactivateUser(u.id)} className="btn btn-danger btn-sm">
                              Desactivar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={users.number} totalPages={users.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
