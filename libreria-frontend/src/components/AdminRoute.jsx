import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>;
  return isAdmin ? children : <Navigate to="/" replace />;
}
