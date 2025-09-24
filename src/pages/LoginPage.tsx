import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../components/Login';
import { useAuth } from '../hooks/useAuth';
import type { ILoginCredentials } from '../types/auth';

const LoginPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (credentials: ILoginCredentials): Promise<void> => {
    await login(credentials);
  };

  return <Login onLogin={handleLogin} />;
};

export default LoginPage;