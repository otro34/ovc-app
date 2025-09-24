import { createContext } from 'react';
import type { IAuthContext } from '../types/auth';

export const AuthContext = createContext<IAuthContext | undefined>(undefined);