import { useState, useEffect, type ReactNode } from 'react';
import type { IAuthContext, ILoginCredentials, IUser } from '../types/auth';
import { authService } from '../services/auth';
import { AuthContext } from './auth.context';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = async (credentials: ILoginCredentials): Promise<void> => {
    const loggedInUser = await authService.login(credentials);
    setUser(loggedInUser);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value: IAuthContext = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};