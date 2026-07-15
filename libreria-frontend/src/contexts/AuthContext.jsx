import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, decodeToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    try { return saved ? JSON.parse(saved) : null; } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const handle401 = () => logout();
    window.addEventListener('auth:unauthorized', handle401);
    return () => window.removeEventListener('auth:unauthorized', handle401);
  }, []);

  useEffect(() => {
    if (token && !initialized) {
      api.users.me()
        .then(setUser)
        .catch(() => logout())
        .finally(() => { setLoading(false); setInitialized(true); });
    } else {
      setLoading(false);
      if (!token) setInitialized(true);
    }
  }, [token]);

  const login = useCallback(async (credentials) => {
    const res = await api.auth.login(credentials);
    localStorage.setItem('token', res.token);
    setToken(res.token);
    const decoded = decodeToken(res.token);
    const userData = {
      id: decoded.userId,
      email: decoded.sub,
      role: decoded.role.replace('ROLE_', ''),
      fullName: decoded.fullName,
      emailVerified: decoded.emailVerified,
    };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return res;
  }, []);

  const register = useCallback(async (data) => {
    const res = await api.auth.register(data);
    localStorage.setItem('token', res.token);
    setToken(res.token);
    const decoded = decodeToken(res.token);
    const userData = {
      id: decoded.userId,
      email: decoded.sub,
      role: decoded.role.replace('ROLE_', ''),
      fullName: decoded.fullName,
      emailVerified: decoded.emailVerified,
    };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return res;
  }, []);

  const logout = useCallback(async () => {
    try { await api.auth.logout(); } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'ADMIN';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
