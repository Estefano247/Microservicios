import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { CATEGORY_VALUES, CATEGORY_LABELS, TYPES, TYPE_LABELS, isDigitalType } from '../../constants/catalog';
import Icon from '../../components/ui/Icon';
import { PageLoader } from '../../components/ui/Loader';

const EMPTY_AUTHOR = { nombre: '', anioNacimiento: '', paisOrigen: '', sexo: '' };

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [authors, setAuthors] = useState([]);
  const [inventory, setInventory] = useState(null);
  const [form, setForm] = useState({
    isbn: '', titulo: '', descripcion: '', precio: '', paginas: '',
    anioPublicacion: '', categoria: 'NOVELA', tipo: 'FISICO',
    imageUrl: '', authorId: '', initialStock: '10',
    ubicacion: 'Almacén central', minStock: '5', maxStock: '100',
  });
  const [showAuthorModal, setShowAuthorModal] = useState(false);
  const [authorForm, setAuthorForm] = useState({ ...EMPTY_AUTHOR });
  const [authorSaving, setAuthorSaving] = useState(false);
  const [authorError, setAuthorError] = useState('');
  const [invAdjusting, setInvAdjusting] = useState(null);

  useEffect(() => {
    const loadAuthors = api.authors.list({ page: 0, size: 500, sort: 'nombre,asc' })
      .then((res) => (Array.isArray(res) ? res : res?.content || []))
      .catch(() => []);

    if (isEdit) {
      setLoading(true);
      Promise.all([loadAuthors, api.products.getById(id)])
        .then(([authorList, p]) => {
          let list = Array.isArray(authorList) ? [...authorList] : [];
          if (p.autor && !list.some((a) => String(a.id) === String(p.autor.id))) {
            list.unshift(p.autor);
          }
          setAuthors(list);
          setForm({
            isbn: p.isbn || '',
            titulo: p.titulo || '',
            descripcion: p.descripcion || '',
            precio: p.precio?.toString() || '',
            paginas: p.paginas?.toString() || '',
            anioPublicacion: p.anioPublicacion?.toString() || '',
            categoria: p.categoria || 'NOVELA',
            tipo: p.tipo || 'FISICO',
            imageUrl: p.imageUrl || '',
            authorId: p.autor?.id?.toString() || '',
            initialStock: '10',
            ubicacion: 'Almacén central', minStock: '5', maxStock: '100',
          });
          api.inventory.getByProduct(p.id).then((inv) => {
            setInventory(inv);
            setForm((prev) => ({
              ...prev,
              ubicacion: inv.ubicacion || 'Almacén central',
              minStock: String(inv.minStock ?? 5),
              maxStock: String(inv.maxStock ?? 100),
            }));
          }).catch(() => setInventory(null));
        })
        .catch(() => navigate('/admin/products'))
        .finally(() => setLoading(false));
    } else {
      loadAuthors.then(setAuthors);
    }
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...form,
        precio: parseFloat(form.precio),
        paginas: parseInt(form.paginas) || 0,
        anioPublicacion: parseInt(form.anioPublicacion) || new Date().getFullYear(),
        authorId: parseInt(form.authorId),
        initialStock: parseInt(form.initialStock) || 10,
        ubicacion: form.ubicacion || undefined,
        minStock: parseInt(form.minStock) || undefined,
        maxStock: parseInt(form.maxStock) || undefined,
      };
      if (isEdit) await api.products.update(id, data);
      else await api.products.create(data);
      navigate('/admin/products');
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const openAuthorModal = () => {
    setAuthorForm({ ...EMPTY_AUTHOR });
    setAuthorError('');
    setShowAuthorModal(true);
  };

  const handleAuthorChange = (e) => setAuthorForm({ ...authorForm, [e.target.name]: e.target.value });

  const handleAuthorSubmit = async (e) => {
    e.preventDefault();
    if (!authorForm.nombre.trim()) {
      setAuthorError('El nombre del autor es obligatorio');
      return;
    }
    setAuthorSaving(true);
    setAuthorError('');
    try {
      const payload = {
        nombre: authorForm.nombre.trim(),
        anioNacimiento: parseInt(authorForm.anioNacimiento) || undefined,
        paisOrigen: authorForm.paisOrigen.trim() || undefined,
        sexo: authorForm.sexo.trim() || undefined,
      };
      const created = await api.authors.create(payload);
      setAuthors((prev) => [...prev, created].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setForm((prev) => ({ ...prev, authorId: String(created.id) }));
      setShowAuthorModal(false);
    } catch (err) {
      setAuthorError(err.message);
    } finally {
      setAuthorSaving(false);
    }
  };

  const adjustInventory = async (type) => {
    if (!inventory) return;
    const q = prompt(`Cantidad a ${type === 'add' ? 'agregar' : 'reducir'}:`, '1');
    if (!q || isNaN(parseInt(q)) || parseInt(q) <= 0) return;
    setInvAdjusting(type);
    try {
      if (type === 'add') await api.inventory.add(inventory.id, parseInt(q));
      else await api.inventory.reduce(inventory.id, parseInt(q));
      const updated = await api.inventory.getByProduct(id);
      setInventory(updated);
    } catch (err) {
      alert(err.message);
    } finally {
      setInvAdjusting(null);
    }
  };

  const saveInventorySettings = async () => {
    if (!inventory) return;
    try {
      await api.inventory.update(inventory.id, {
        productId: inventory.productId,
        productName: inventory.productName,
        cantidad: inventory.cantidad,
        minStock: parseInt(form.minStock) || 5,
        maxStock: parseInt(form.maxStock) || 100,
        ubicacion: form.ubicacion || 'Almacén central',
      });
      const updated = await api.inventory.getByProduct(id);
      setInventory(updated);
      alert('Inventario actualizado');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-brand-700">
        <Icon name="arrowLeft" className="w-4 h-4" /> Volver a productos
      </Link>
      <h1 className="mb-6 font-display text-3xl font-semibold text-ink">
        {isEdit ? 'Editar producto' : 'Nuevo producto'}
      </h1>

      <form onSubmit={handleSubmit} className="card space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">ISBN *</label>
            <input type="text" name="isbn" required value={form.isbn} onChange={handleChange} className="input" />
          </div>
          <div>
            <label className="label">Título *</label>
            <input type="text" name="titulo" required value={form.titulo} onChange={handleChange} className="input" />
          </div>
        </div>

        <div>
          <label className="label">Descripción</label>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3} className="input resize-y" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Precio (S/) *</label>
            <input type="number" step="0.01" min="0" name="precio" required value={form.precio} onChange={handleChange} className="input" />
          </div>
          <div>
            <label className="label">Páginas</label>
            <input type="number" min="0" name="paginas" value={form.paginas} onChange={handleChange} className="input" />
          </div>
          <div>
            <label className="label">Año</label>
            <input type="number" name="anioPublicacion" value={form.anioPublicacion} onChange={handleChange} className="input" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Categoría *</label>
            <select name="categoria" value={form.categoria} onChange={handleChange} className="input">
              {CATEGORY_VALUES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Tipo *</label>
            <select name="tipo" value={form.tipo} onChange={handleChange} className="input">
              {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Autor *</label>
            <div className="flex gap-2">
              <select name="authorId" required value={form.authorId} onChange={handleChange} className="input flex-1">
                <option value="">Seleccionar autor</option>
                {authors.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
              </select>
              <button type="button" onClick={openAuthorModal} className="btn btn-secondary btn-sm shrink-0" title="Crear nuevo autor">
                <Icon name="plus" className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div>
            <label className="label">URL de imagen</label>
            <input type="url" name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://…" className="input" />
          </div>
        </div>

        {!isEdit && !isDigitalType(form.tipo) && (
          <div className="rounded-xl border border-line bg-surface-soft p-4">
            <h3 className="mb-3 font-semibold text-ink">Inventario inicial</h3>
            <div className="grid gap-4 sm:grid-cols-4">
              <div>
                <label className="label">Stock inicial *</label>
                <input type="number" min="0" name="initialStock" value={form.initialStock} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="label">Stock mínimo</label>
                <input type="number" min="0" name="minStock" value={form.minStock} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="label">Stock máximo</label>
                <input type="number" min="1" name="maxStock" value={form.maxStock} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="label">Ubicación</label>
                <input type="text" name="ubicacion" value={form.ubicacion} onChange={handleChange} className="input" placeholder="Almacén central" />
              </div>
            </div>
          </div>
        )}

        {isEdit && inventory && (
          <div className="rounded-xl border border-line bg-surface-soft p-4">
            <h3 className="mb-3 font-semibold text-ink">Inventario</h3>
            <div className="mb-3 text-sm">
              <span className="text-muted">Stock actual: </span>
              <span className="font-semibold text-ink">{inventory.cantidad}</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="label">Stock mínimo</label>
                <input type="number" min="0" name="minStock" value={form.minStock} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="label">Stock máximo</label>
                <input type="number" min="1" name="maxStock" value={form.maxStock} onChange={handleChange} className="input" />
              </div>
              <div>
                <label className="label">Ubicación</label>
                <input type="text" name="ubicacion" value={form.ubicacion} onChange={handleChange} className="input" />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={saveInventorySettings} className="btn btn-primary btn-sm">
                Guardar configuración
              </button>
              <button type="button" onClick={() => adjustInventory('add')} disabled={invAdjusting === 'add'} className="btn btn-secondary btn-sm">
                {invAdjusting === 'add' ? '…' : <><Icon name="plus" className="w-3.5 h-3.5" /> Agregar stock</>}
              </button>
              <button type="button" onClick={() => adjustInventory('reduce')} disabled={invAdjusting === 'reduce'} className="btn btn-secondary btn-sm">
                {invAdjusting === 'reduce' ? '…' : <><Icon name="minus" className="w-3.5 h-3.5" /> Reducir stock</>}
              </button>
            </div>
          </div>
        )}

        {isEdit && !inventory && !isDigitalType(form.tipo) && (
          <p className="text-sm text-muted">Este producto no tiene inventario registrado.</p>
        )}

        <div className="flex gap-3 border-t border-line pt-5">
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Guardando…' : (isEdit ? 'Guardar cambios' : 'Crear producto')}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="btn btn-secondary">
            Cancelar
          </button>
        </div>
      </form>

      {showAuthorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-ink">Nuevo autor</h2>
              <button type="button" onClick={() => setShowAuthorModal(false)} className="rounded-lg p-1.5 text-muted hover:bg-surface-soft">
                <Icon name="close" className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAuthorSubmit} className="space-y-4">
              <div>
                <label className="label">Nombre *</label>
                <input type="text" name="nombre" required value={authorForm.nombre} onChange={handleAuthorChange} className="input" placeholder="Ej: Gabriel García Márquez" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Año de nacimiento</label>
                  <input type="number" name="anioNacimiento" value={authorForm.anioNacimiento} onChange={handleAuthorChange} className="input" placeholder="1927" />
                </div>
                <div>
                  <label className="label">País de origen</label>
                  <input type="text" name="paisOrigen" value={authorForm.paisOrigen} onChange={handleAuthorChange} className="input" placeholder="Colombia" />
                </div>
              </div>
              <div>
                <label className="label">Sexo</label>
                <select name="sexo" value={authorForm.sexo} onChange={handleAuthorChange} className="input">
                  <option value="">Seleccionar</option>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMENINO">Femenino</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>
              {authorError && <p className="text-sm text-red-600">{authorError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={authorSaving} className="btn btn-primary flex-1 justify-center">
                  {authorSaving ? 'Guardando…' : 'Crear autor'}
                </button>
                <button type="button" onClick={() => setShowAuthorModal(false)} className="btn btn-secondary">
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
