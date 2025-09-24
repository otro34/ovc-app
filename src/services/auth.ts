import type { ILoginCredentials, IUser } from '../types/auth';

const USERS_KEY = 'ov_app_users';
const SESSION_KEY = 'ov_app_session';

interface StoredUser extends IUser {
  password: string;
}

const getUsers = (): StoredUser[] => {
  const users = localStorage.getItem(USERS_KEY);
  if (!users) {
    const defaultUsers: StoredUser[] = [
      {
        id: 1,
        username: 'admin',
        password: 'admin123',
        email: 'admin@ovapp.com',
        name: 'Administrador',
        role: 'admin',
      },
      {
        id: 2,
        username: 'usuario',
        password: 'usuario123',
        email: 'usuario@ovapp.com',
        name: 'Usuario Demo',
        role: 'user',
      },
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }
  return JSON.parse(users);
};

export const authService = {
  login: async (credentials: ILoginCredentials): Promise<IUser> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const users = getUsers();
    const user = users.find(
      (u) => u.username === credentials.username && u.password === credentials.password
    );

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    const token = btoa(JSON.stringify({ userId: user.id, timestamp: Date.now() }));

    const session = {
      user: userWithoutPassword,
      token,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return userWithoutPassword;
  },

  logout: (): void => {
    localStorage.removeItem(SESSION_KEY);
  },

  getCurrentUser: (): IUser | null => {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return null;

    try {
      const session = JSON.parse(sessionStr);

      if (session.expiresAt < Date.now()) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }

      return session.user;
    } catch {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    return authService.getCurrentUser() !== null;
  },
};