import React from 'react';
import { Navigate } from 'react-router-dom';

const API_BASE = 'http://localhost:3002/api';
export interface AuthUser { id: number; name: string; email: string; role: string }
interface AuthContextValue { user: AuthUser | null; loading: boolean; login: (email: string, password: string) => Promise<void>; logout: () => Promise<void> }
const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const token = window.localStorage.getItem('authToken');
    if (!token) { setLoading(false); return; }
    fetch(`${API_BASE}/auth/me`).then((response) => { if (!response.ok) throw new Error('expired'); return response.json(); }).then((data) => setUser(data.user)).catch(() => { window.localStorage.removeItem('authToken'); setUser(null); }).finally(() => setLoading(false));
  }, []);
  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Đăng nhập thất bại');
    window.localStorage.setItem('authToken', data.token);
    window.localStorage.setItem('adminRole', data.user.role);
    setUser(data.user);
  };
  const logout = async () => { try { await fetch(`${API_BASE}/auth/logout`, { method: 'POST' }); } finally { window.localStorage.removeItem('authToken'); setUser(null); } };
  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}
