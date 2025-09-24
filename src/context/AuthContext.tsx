import { useState, useEffect, type ReactNode, useCallback } from 'react';
import type { IAuthContext, ILoginCredentials, IUser } from '../types/auth';
import { authService } from '../services/authService';
import { AuthContext } from './auth.context';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const currentUser = await authService.restoreSession();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error inicializando sesión:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: ILoginCredentials): Promise<void> => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value: IAuthContext = {
    user,
    setUser,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
    setLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};