import { useEffect, useState } from 'react';
import { api } from '../../api/client';

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

  useEffect(() => { loadUsers() }, [page]);

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

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
        <button onClick={reactivateUser} className="border border-green-300 text-green-600 hover:bg-green-50 font-semibold px-4 py-2 rounded-lg">
          Reactivar Usuario
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">ID</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Nombre</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Email</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Teléfono</th>
              <th className="text-left px-6 py-3 text-sm font-semibold text-gray-600">Rol</th>
              <th className="text-center px-6 py-3 text-sm font-semibold text-gray-600">Activo</th>
              <th className="text-right px-6 py-3 text-sm font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.content?.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{u.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{u.name} {u.lastName}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{u.phone}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="capitalize font-medium">{u.role?.toLowerCase()}</span>
                </td>
                <td className="px-6 py-4 text-sm text-center">
                  <span className={`inline-block w-2 h-2 rounded-full ${u.enabled !== false ? 'bg-green-500' : 'bg-red-500'}`} />
                </td>
                <td className="px-6 py-4 text-sm text-right">
                  {u.enabled !== false && (
                    <button onClick={() => deactivateUser(u.id)} className="text-red-600 hover:text-red-800 font-medium">Desactivar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button disabled={users.first} onClick={() => setPage(page - 1)}
            className="px-4 py-2 rounded-lg border disabled:opacity-50 hover:bg-gray-50 text-sm font-medium">&laquo; Anterior</button>
          {Array.from({ length: users.totalPages }, (_, i) => (
            <button key={i} onClick={() => setPage(i)}
              className={`w-10 h-10 rounded-lg text-sm font-medium ${i === users.number ? 'bg-indigo-600 text-white' : 'border hover:bg-gray-50'}`}>
              {i + 1}
            </button>
          ))}
          <button disabled={users.last} onClick={() => setPage(page + 1)}
            className="px-4 py-2 rounded-lg border disabled:opacity-50 hover:bg-gray-50 text-sm font-medium">Siguiente &raquo;</button>
        </div>
      )}
    </div>
  );
}
