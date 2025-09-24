import { useContext } from 'react';
import { AuthContext } from '../context/auth.context';
import type { IAuthContext } from '../types/auth';

export const useAuth = (): IAuthContext => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};