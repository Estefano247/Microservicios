import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}
