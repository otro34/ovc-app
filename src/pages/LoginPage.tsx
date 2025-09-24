import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../components/Login';
import { useAuth } from '../hooks/useAuth';

const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return <Login onLogin={login} />;
};

export default LoginPage;