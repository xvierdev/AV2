import { createContext } from 'react';
import { type AuthContextType } from '../types/UserTypes';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);