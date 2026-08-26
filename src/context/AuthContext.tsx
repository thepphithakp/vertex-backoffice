import { createContext } from 'preact';
import { useState, useContext, useEffect } from 'preact/hooks';
import { route } from 'preact-router';
import { routes } from '../routes';

export const AuthContext = createContext<{
  token: string | null;
  user: any;
  login: (token: string) => void;
  logout: () => void;
}>({
  token: null,
  user: null,
  login: () => {},
  logout: () => {}
});

export function AuthProvider({ children }: { children: any }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('admin_token'));
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (token) {
      fetch('/api/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(data => {
        setUser(data);
      })
      .catch(() => {
        logout();
      });
    }
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem('admin_token', newToken);
    setToken(newToken);
    route(routes.dashboard);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setUser(null);
    route(routes.dashboard);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
