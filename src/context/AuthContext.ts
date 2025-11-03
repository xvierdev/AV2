import { createContext } from 'react';

// Tipos
import { type AuthContextType } from '../types/UserTypes';


/**
 * Cria o Contexto de Autenticação para a aplicação.
 * Ele fornecerá o estado de autenticação (usuário, loading, etc.) e as funções
 * (login, logout) para os componentes que o consumirem através do hook useAuth.
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined);