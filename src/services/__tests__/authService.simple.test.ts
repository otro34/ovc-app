import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '../authService';

describe('AuthService - Basic Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset localStorage mocks
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    vi.mocked(localStorage.setItem).mockClear();
    vi.mocked(localStorage.removeItem).mockClear();
  });

  describe('logout', () => {
    it('debe limpiar el localStorage correctamente', () => {
      authService.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_user');
      expect(localStorage.removeItem).toHaveBeenCalledWith('last_activity');
    });
  });

  describe('isAuthenticated', () => {
    it('debe retornar false sin token o usuario', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      expect(authService.isAuthenticated()).toBe(false);
    });

    it('debe retornar true con sesión válida', () => {
      vi.mocked(localStorage.getItem).mockImplementation((key: string) => {
        switch (key) {
          case 'auth_token':
            return 'fake-token';
          case 'auth_user':
            return JSON.stringify({ id: 1, username: 'test', role: 'user' });
          case 'last_activity':
            return Date.now().toString();
          default:
            return null;
        }
      });

      expect(authService.isAuthenticated()).toBe(true);
    });
  });

  describe('updateLastActivity', () => {
    it('debe actualizar la última actividad en localStorage', () => {
      authService.updateLastActivity();

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'last_activity',
        expect.any(String)
      );
    });
  });

  describe('getSessionTimeRemaining', () => {
    it('debe retornar 0 si no hay actividad registrada', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);

      const timeRemaining = authService.getSessionTimeRemaining();
      expect(timeRemaining).toBe(0);
    });
  });
});