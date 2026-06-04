import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';

const CATEGORIES = [
  'NOVELA', 'CIENCIA_FICCION', 'FICCION', 'HISTORIA', 'BIOGRAFIA',
  'POESIA', 'INFANTIL', 'TECNICO', 'ENSAYO', 'MISTERIO', 'DRAMA',
  'FANTASIA', 'ROMANCE', 'COMEDIA',
];

const TYPES = ['FISICO', 'DIGITAL', 'AUDIO_LIBRO'];

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
    api.authors.list({ page: 0, size: 100 }).then((res) => setAuthors(res.content || [])).catch(() => {});
    if (isEdit) {
      api.products.getById(id).then((p) => {
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
      }).catch(() => navigate('/admin/products')).finally(() => setLoading(false));
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
      if (isEdit) {
        await api.products.update(id, data);
      } else {
        await api.products.create(data);
      }
      navigate('/admin/products');
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{isEdit ? 'Editar Producto' : 'Nuevo Producto'}</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ISBN *</label>
            <input type="text" name="isbn" required value={form.isbn} onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
            <input type="text" name="titulo" required value={form.titulo} onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
            <input type="number" step="0.01" name="precio" required value={form.precio} onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Páginas</label>
            <input type="number" name="paginas" value={form.paginas} onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
            <input type="number" name="anioPublicacion" value={form.anioPublicacion} onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
            <select name="categoria" value={form.categoria} onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
            <select name="tipo" value={form.tipo} onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Autor *</label>
            <select name="authorId" required value={form.authorId} onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="">Seleccionar autor</option>
              {authors.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL Imagen</label>
            <input type="text" name="imageUrl" value={form.imageUrl} onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
        </div>
        {!isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial</label>
            <input type="number" name="initialStock" value={form.initialStock} onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
        )}
        <div className="flex gap-4 pt-4">
          <button type="submit" disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold px-6 py-2 rounded-lg transition">
            {saving ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear Producto')}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')}
            className="border border-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-lg hover:bg-gray-50 transition">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
