export interface IUser {
  id: number;
  username: string;
  email?: string;
  name?: string;
  role: 'admin' | 'user';
}

export interface ILoginCredentials {
  username: string;
  password: string;
}

export interface IAuthContext {
  user: IUser | null;
  setUser: (user: IUser | null) => void;
  isAuthenticated: boolean;
  login: (credentials: ILoginCredentials) => Promise<void>;
  logout: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}