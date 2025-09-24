export interface IUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface ILoginCredentials {
  username: string;
  password: string;
}

export interface IAuthContext {
  user: IUser | null;
  isAuthenticated: boolean;
  login: (credentials: ILoginCredentials) => Promise<void>;
  logout: () => void;
  loading: boolean;
}