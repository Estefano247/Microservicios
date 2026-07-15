import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/ui/Icon';
import { PageLoader } from '../../components/ui/Loader';

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-3 last:border-0">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm font-medium text-ink text-right">{value || '—'}</dd>
    </div>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.users.me().then(setUserData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError(''); setPwSuccess('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPwError('Las contraseñas no coinciden');
      return;
    }
    setSaving(true);
    try {
      await api.users.changePassword(passwordForm);
      setPwSuccess('Contraseña actualizada exitosamente');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) {
      setPwError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader label="Cargando tu perfil…" />;

  const fullName = `${userData?.name || ''} ${userData?.lastName || ''}`.trim();

  return (
    <div className="page max-w-5xl py-8">
      {/* Cabecera */}
      <div className="card mb-6 flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 font-display text-2xl font-semibold text-white">
          {(fullName || userData?.email || '?').charAt(0).toUpperCase()}
        </span>
        <div className="text-center sm:text-left">
          <h1 className="font-display text-2xl font-semibold text-ink">{fullName || 'Mi perfil'}</h1>
          <p className="text-sm text-muted">{userData?.email}</p>
        </div>
        <Link to="/profile/orders" className="btn btn-secondary sm:ml-auto">
          <Icon name="receipt" className="w-4 h-4" /> Mis pedidos
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Información personal */}
        <div className="card p-6">
          <h2 className="mb-2 font-display text-lg font-semibold text-ink">Información personal</h2>
          <dl>
            <InfoRow label="Nombre" value={fullName} />
            <InfoRow label="Correo" value={userData?.email} />
            <InfoRow label="Teléfono" value={userData?.phone} />
            <InfoRow label="Rol" value={<span className="badge bg-brand-50 text-brand-700 capitalize">{userData?.role?.toLowerCase()}</span>} />
            <InfoRow label="Miembro desde" value={userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'} />
          </dl>
        </div>

        {/* Cambiar contraseña */}
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-ink">
            <Icon name="lock" className="w-5 h-5 text-brand-600" /> Cambiar contraseña
          </h2>
          {pwError && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <Icon name="alert" className="mt-0.5 w-4 h-4 shrink-0" /> {pwError}
            </div>
          )}
          {pwSuccess && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
              <Icon name="checkCircle" className="mt-0.5 w-4 h-4 shrink-0" /> {pwSuccess}
            </div>
          )}
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="label">Contraseña actual</label>
              <input type="password" required value={passwordForm.currentPassword} autoComplete="current-password"
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Nueva contraseña</label>
              <input type="password" required value={passwordForm.newPassword} autoComplete="new-password"
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="input" />
            </div>
            <div>
              <label className="label">Confirmar nueva contraseña</label>
              <input type="password" required value={passwordForm.confirmPassword} autoComplete="new-password"
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="input" />
            </div>
            <button type="submit" disabled={saving} className="btn btn-primary w-full">
              {saving ? 'Actualizando…' : 'Actualizar contraseña'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
