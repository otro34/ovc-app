import { useContext, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';
import { authService, type LoginCredentials } from '../services/authService';

export const useAuth = () => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }

  const { user, setUser, loading, setLoading } = context;

  /**
   * Intenta hacer login con las credenciales proporcionadas
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      navigate('/dashboard');
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [navigate, setUser, setLoading]);

  /**
   * Cierra la sesión del usuario
   */
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    navigate('/login');
  }, [navigate, setUser]);

  /**
   * Verifica si el usuario está autenticado
   */
  const isAuthenticated = useCallback(() => {
    return authService.isAuthenticated();
  }, []);

  /**
   * Restaura la sesión si existe
   */
  const restoreSession = useCallback(async () => {
    setLoading(true);
    try {
      const restoredUser = await authService.restoreSession();
      if (restoredUser) {
        setUser(restoredUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error restaurando sesión:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading]);

  /**
   * Verifica si el usuario tiene un rol específico
   */
  const hasRole = useCallback((role: 'admin' | 'user') => {
    return authService.hasRole(role);
  }, []);

  /**
   * Actualiza la actividad del usuario para evitar timeout
   */
  const updateActivity = useCallback(() => {
    if (isAuthenticated()) {
      authService.updateLastActivity();
    }
  }, [isAuthenticated]);

  /**
   * Obtiene el tiempo restante de sesión en minutos
   */
  const getSessionTimeRemaining = useCallback(() => {
    return authService.getSessionTimeRemaining();
  }, []);

  /**
   * Setup de listeners para actividad del usuario
   */
  useEffect(() => {
    if (!user) return;

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    const handleActivity = () => {
      updateActivity();
    };

    // Agregar listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Verificar periódicamente si la sesión expiró
    const checkInterval = setInterval(() => {
      if (!authService.isAuthenticated()) {
        logout();
      }
    }, 60000); // Verificar cada minuto

    // Cleanup
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      clearInterval(checkInterval);
    };
  }, [user, updateActivity, logout]);

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    restoreSession,
    hasRole,
    updateActivity,
    getSessionTimeRemaining
  };
};