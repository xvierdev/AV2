import { useContext } from 'react';

// Contexto
import { AuthContext } from './AuthContext';

// Tipos
import { type AuthContextType } from '../types/UserTypes';


/**
 * Hook customizado para consumir o AuthContext de forma segura.
 * Ele simplifica o acesso ao contexto de autenticação e lança um erro
 * se for usado fora de um AuthProvider, prevenindo bugs.
 */
export const useAuth = (): AuthContextType => {
    // ========================================================================
    // Lógica do Hook
    // ========================================================================

    const context = useContext(AuthContext);

    // Garante que o hook só seja utilizado dentro da árvore de componentes do AuthProvider.
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }

    return context;
};