import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from '../../components/AuthLayout';
import Icon from '../../components/ui/Icon';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(form);
      if (res.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate(searchParams.get('redirect') || '/');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Bienvenido de nuevo"
      subtitle="Ingresa a tu cuenta para continuar tu lectura."
      footer={<>¿No tienes cuenta? <Link to="/register" className="link">Regístrate gratis</Link></>}
    >
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <Icon name="alert" className="mt-0.5 w-4 h-4 shrink-0" /> {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Correo electrónico</label>
          <input
            type="email" required autoFocus value={form.email} autoComplete="email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="tu@correo.com" className="input"
          />
        </div>
        <div>
          <label className="label">Contraseña</label>
          <input
            type="password" required value={form.password} autoComplete="current-password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••" className="input"
          />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </AuthLayout>
  );
}
