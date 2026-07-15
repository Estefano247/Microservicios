import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from '../../components/AuthLayout';
import Icon from '../../components/ui/Icon';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', lastName: '', email: '', password: '', confirmPassword: '', phone: '', birthday: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      if (!data.birthday) delete data.birthday;
      await register(data);
      navigate('/');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Crea tu cuenta"
      subtitle="Únete y guarda tus libros favoritos, pedidos y más."
      footer={<>¿Ya tienes cuenta? <Link to="/login" className="link">Inicia sesión</Link></>}
    >
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <Icon name="alert" className="mt-0.5 w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Nombre *</label>
            <input type="text" name="name" required value={form.name} onChange={handleChange} className="input" />
          </div>
          <div>
            <label className="label">Apellido *</label>
            <input type="text" name="lastName" required value={form.lastName} onChange={handleChange} className="input" />
          </div>
        </div>
        <div>
          <label className="label">Correo electrónico *</label>
          <input type="email" name="email" required value={form.email} onChange={handleChange} placeholder="tu@correo.com" autoComplete="email" className="input" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Teléfono *</label>
            <input type="tel" name="phone" required value={form.phone} onChange={handleChange} placeholder="+51 999 000 000" className="input" />
          </div>
          <div>
            <label className="label">Fecha de nacimiento</label>
            <input type="date" name="birthday" value={form.birthday} onChange={handleChange} className="input" />
          </div>
        </div>
        <div>
          <label className="label">Contraseña *</label>
          <input type="password" name="password" required value={form.password} onChange={handleChange} placeholder="••••••••" autoComplete="new-password" className="input" />
          <p className="field-hint">Mín. 8 caracteres, con mayúscula, minúscula, número y símbolo.</p>
        </div>
        <div>
          <label className="label">Confirmar contraseña *</label>
          <input type="password" name="confirmPassword" required value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" autoComplete="new-password" className="input" />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
          {loading ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
    </AuthLayout>
  );
}
