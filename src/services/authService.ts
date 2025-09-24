// Servicio de autenticación para gestión de sesión
import { db } from './database';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
}

export interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos en ms
  private readonly LAST_ACTIVITY_KEY = 'last_activity';

  /**
   * Intenta autenticar al usuario con las credenciales proporcionadas
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Buscar usuario en la base de datos
    const user = await db.users
      .where('username')
      .equals(credentials.username)
      .first();

    if (!user) {
      throw new Error('Usuario o contraseña incorrectos');
    }

    // En producción, esto debería ser un hash comparado
    if (user.password !== credentials.password) {
      throw new Error('Usuario o contraseña incorrectos');
    }

    // Generar token (en producción, usar un servicio real de JWT)
    const token = this.generateToken(user.id!);

    // Guardar en localStorage
    const authData = {
      id: user.id!,
      username: user.username,
      role: user.role as 'admin' | 'user'
    };

    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authData));
    this.updateLastActivity();

    return {
      user: authData,
      token
    };
  }

  /**
   * Cierra la sesión del usuario actual
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.LAST_ACTIVITY_KEY);
  }

  /**
   * Verifica si hay una sesión activa
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const user = localStorage.getItem(this.USER_KEY);

    if (!token || !user) {
      return false;
    }

    // Verificar timeout de inactividad
    if (this.isSessionExpired()) {
      this.logout();
      return false;
    }

    return true;
  }

  /**
   * Obtiene el usuario actual de la sesión
   */
  getCurrentUser(): User | null {
    if (!this.isAuthenticated()) {
      return null;
    }

    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) {
      return null;
    }

    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  /**
   * Obtiene el token de la sesión actual
   */
  getToken(): string | null {
    if (!this.isAuthenticated()) {
      return null;
    }
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Actualiza el timestamp de última actividad
   */
  updateLastActivity(): void {
    localStorage.setItem(this.LAST_ACTIVITY_KEY, Date.now().toString());
  }

  /**
   * Verifica si la sesión ha expirado por inactividad
   */
  private isSessionExpired(): boolean {
    const lastActivity = localStorage.getItem(this.LAST_ACTIVITY_KEY);
    if (!lastActivity) {
      return true;
    }

    const lastActivityTime = parseInt(lastActivity, 10);
    const currentTime = Date.now();

    return (currentTime - lastActivityTime) > this.SESSION_TIMEOUT;
  }

  /**
   * Genera un token simple (en producción usar JWT real)
   */
  private generateToken(userId: number): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `${userId}-${timestamp}-${random}`;
  }

  /**
   * Intenta restaurar la sesión desde localStorage
   */
  async restoreSession(): Promise<User | null> {
    if (this.isAuthenticated()) {
      this.updateLastActivity();
      return this.getCurrentUser();
    }
    return null;
  }

  /**
   * Verifica el rol del usuario actual
   */
  hasRole(role: 'admin' | 'user'): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Obtiene el tiempo restante de sesión en minutos
   */
  getSessionTimeRemaining(): number {
    const lastActivity = localStorage.getItem(this.LAST_ACTIVITY_KEY);
    if (!lastActivity) {
      return 0;
    }

    const lastActivityTime = parseInt(lastActivity, 10);
    const currentTime = Date.now();
    const timeElapsed = currentTime - lastActivityTime;
    const timeRemaining = this.SESSION_TIMEOUT - timeElapsed;

    return Math.max(0, Math.floor(timeRemaining / 60000)); // Convertir a minutos
  }
}

export const authService = new AuthService();