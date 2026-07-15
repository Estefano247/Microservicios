import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { CATEGORY_VALUES, CATEGORY_LABELS, TYPES, TYPE_LABELS } from '../../constants/catalog';
import Icon from '../../components/ui/Icon';
import { PageLoader } from '../../components/ui/Loader';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [authors, setAuthors] = useState([]);
  const [form, setForm] = useState({
    isbn: '', titulo: '', descripcion: '', precio: '', paginas: '',
    anioPublicacion: '', categoria: 'NOVELA', tipo: 'FISICO',
    imageUrl: '', authorId: '', initialStock: '10',
  });

  useEffect(() => {
    // Carga de autores robusta: soporta respuesta paginada { content } o arreglo directo.
    const loadAuthors = api.authors.list({ page: 0, size: 500, sort: 'nombre,asc' })
      .then((res) => (Array.isArray(res) ? res : res?.content || []))
      .catch(() => []);

    if (isEdit) {
      Promise.all([loadAuthors, api.products.getById(id)])
        .then(([authorList, p]) => {
          let list = Array.isArray(authorList) ? [...authorList] : [];
          // Garantiza que el autor actual del producto esté en el desplegable,
          // aunque el listado venga incompleto o vacío (evita el bloqueo al guardar).
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
          });
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
            <select name="authorId" required value={form.authorId} onChange={handleChange} className="input">
              <option value="">Seleccionar autor</option>
              {authors.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="label">URL de imagen</label>
            <input type="url" name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://…" className="input" />
          </div>
        </div>

        {!isEdit && (
          <div className="sm:max-w-[12rem]">
            <label className="label">Stock inicial</label>
            <input type="number" min="0" name="initialStock" value={form.initialStock} onChange={handleChange} className="input" />
          </div>
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
    </div>
  );
}
