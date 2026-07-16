import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import Icon from '../../components/ui/Icon';
import { PageLoader } from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';

export default function AuthorsManager() {
  const [authors, setAuthors] = useState({ content: [], totalPages: 0, number: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nombre: '', anioNacimiento: '', paisOrigen: '', sexo: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadAuthors = () => {
    setLoading(true);
    api.authors.list({ page, size: 10, sort: 'nombre,asc' })
      .then(setAuthors)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAuthors(); }, [page]);

  const openModal = () => {
    setForm({ nombre: '', anioNacimiento: '', paisOrigen: '', sexo: '' });
    setError('');
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) { setError('El nombre es obligatorio'); return; }
    setSaving(true);
    setError('');
    try {
      await api.authors.create({
        nombre: form.nombre.trim(),
        anioNacimiento: parseInt(form.anioNacimiento) || undefined,
        paisOrigen: form.paisOrigen.trim() || undefined,
        sexo: form.sexo || undefined,
      });
      setShowModal(false);
      setPage(0);
      loadAuthors();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const deleteAuthor = async (id) => {
    if (!confirm('¿Eliminar este autor? Solo si no tiene libros asociados.')) return;
    try { await api.authors.delete(id); loadAuthors(); }
    catch (e) { alert(e.message); }
  };

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Autores</h1>
          <p className="mt-1 text-sm text-muted">Catálogo de autores de la librería.</p>
        </div>
        <button onClick={openModal} className="btn btn-primary">
          <Icon name="plus" className="w-4 h-4" /> Nuevo autor
        </button>
      </header>

      {loading ? (
        <PageLoader />
      ) : !authors.content?.length ? (
        <div className="card py-10">
          <EmptyState icon="users" title="Sin autores" description="Crea el primer autor para empezar.">
            <button onClick={openModal} className="btn btn-primary"><Icon name="plus" className="w-4 h-4" /> Nuevo autor</button>
          </EmptyState>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface-soft text-left text-xs uppercase tracking-wide text-muted">
                    <th className="px-5 py-3 font-semibold">Nombre</th>
                    <th className="px-5 py-3 font-semibold">País</th>
                    <th className="px-5 py-3 font-semibold">Nacimiento</th>
                    <th className="px-5 py-3 font-semibold">Sexo</th>
                    <th className="px-5 py-3 text-right font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {authors.content.map((a) => (
                    <tr key={a.id} className="transition-colors hover:bg-surface-soft">
                      <td className="px-5 py-3.5 font-medium text-ink">{a.nombre}</td>
                      <td className="px-5 py-3.5 text-muted">{a.paisOrigen || '—'}</td>
                      <td className="px-5 py-3.5 text-muted">{a.anioNacimiento || '—'}</td>
                      <td className="px-5 py-3.5 text-muted">{a.sexo || '—'}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button onClick={() => deleteAuthor(a.id)} className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600" aria-label="Eliminar">
                          <Icon name="trash" className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={authors.number} totalPages={authors.totalPages} onChange={setPage} />
        </>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">Nuevo autor</h2>
              <button type="button" onClick={() => setShowModal(false)} className="rounded-lg p-1.5 text-muted hover:bg-surface-soft">
                <Icon name="close" className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Nombre *</label>
                <input type="text" name="nombre" required value={form.nombre} onChange={handleChange} className="input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Año de nacimiento</label>
                  <input type="number" name="anioNacimiento" value={form.anioNacimiento} onChange={handleChange} className="input" />
                </div>
                <div>
                  <label className="label">País de origen</label>
                  <input type="text" name="paisOrigen" value={form.paisOrigen} onChange={handleChange} className="input" />
                </div>
              </div>
              <div>
                <label className="label">Sexo</label>
                <select name="sexo" value={form.sexo} onChange={handleChange} className="input">
                  <option value="">Seleccionar</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMENINO">Femenino</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn btn-primary flex-1 justify-center">
                  {saving ? 'Guardando…' : 'Crear autor'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
