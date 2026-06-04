import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  useEffect(() => {
    api.users.me().then(setUserData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPwError('Las contraseñas no coinciden');
      return;
    }
    try {
      await api.users.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });
      setPwSuccess('Contraseña actualizada exitosamente');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) {
      setPwError(e.message);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Personal</h2>
          <dl className="space-y-3">
            <div><dt className="text-sm text-gray-500">Nombre</dt><dd className="font-medium">{userData?.name} {userData?.lastName}</dd></div>
            <div><dt className="text-sm text-gray-500">Email</dt><dd className="font-medium">{userData?.email}</dd></div>
            <div><dt className="text-sm text-gray-500">Teléfono</dt><dd className="font-medium">{userData?.phone}</dd></div>
            <div><dt className="text-sm text-gray-500">Rol</dt><dd className="font-medium capitalize">{userData?.role?.toLowerCase()}</dd></div>
            <div><dt className="text-sm text-gray-500">Miembro desde</dt><dd className="font-medium">{userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString() : '-'}</dd></div>
          </dl>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Cambiar Contraseña</h2>
          {pwError && <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">{pwError}</div>}
          {pwSuccess && <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm">{pwSuccess}</div>}
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
              <input type="password" required value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
              <input type="password" required value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
              <input type="password" required value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition">
              Actualizar Contraseña
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
