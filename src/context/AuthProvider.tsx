import { useEffect, useState, type ReactNode } from 'react';

// Contexto
import { AuthContext } from './AuthContext';

// Tipos
import { type AuthContextType, type User, type UserLevel, ACCESS_HIERARCHY } from '../types/UserTypes';

// Utilitários (Mocks)
import { simulateLogin } from '../utils/mockUsers';


/**
 * Define as propriedades que o componente AuthProvider recebe.
 */
interface AuthProviderProps {
    children: ReactNode;
}

/**
 * Provê o contexto de autenticação para toda a aplicação, gerenciando o estado
 * do usuário (logado/deslogado), o carregamento e as funções de login/logout.
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
    // ========================================================================
    // Hooks e Estados
    // ========================================================================

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // ========================================================================
    // Efeitos
    // ========================================================================

    // Verifica se há um usuário salvo no localStorage ao iniciar a aplicação.
    useEffect(() => {
        const storedUser = localStorage.getItem('aerocodeUser');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser) as User);
            } catch (e) {
                console.error('Erro ao carregar usuário do localStorage:', e);
                localStorage.removeItem('aerocodeUser');
            }
        }
        setLoading(false);
    }, []);

    // ========================================================================
    // Handlers (Funções de Ação)
    // ========================================================================

    // Autentica um usuário, salva a sessão no localStorage e atualiza o estado.
    const login = async (username: string, password: string): Promise<boolean> => {
        setLoading(true);
        const loggedUser = simulateLogin(username, password);

        if (loggedUser) {
            setUser(loggedUser);
            localStorage.setItem('aerocodeUser', JSON.stringify(loggedUser));
            setLoading(false);
            return true;
        } else {
            setUser(null);
            localStorage.removeItem('aerocodeUser');
            setLoading(false);
            return false;
        }
    };

    // Desconecta o usuário, limpando a sessão do localStorage e o estado.
    const logout = () => {
        setUser(null);
        localStorage.removeItem('aerocodeUser');
    };

    // Verifica se o usuário logado tem o nível de permissão mínimo necessário.
    const hasPermission = (requiredLevel: UserLevel): boolean => {
        if (!user) return false;

        const userIndex = ACCESS_HIERARCHY.indexOf(user.level);
        const requiredIndex = ACCESS_HIERARCHY.indexOf(requiredLevel);

        // Retorna true se o índice do usuário for menor ou igual ao índice requerido.
        return userIndex !== -1 && requiredIndex !== -1 && userIndex <= requiredIndex;
    };

    // ========================================================================
    // Renderização
    // ========================================================================

    // Objeto de valor que será fornecido pelo contexto a todos os componentes filhos.
    const contextValue: AuthContextType = {
        user,
        loading,
        login,
        logout,
        USER_LEVELS: {
            ADMIN: 'administrador',
            ENGINEER: 'engenheiro',
            OPERATOR: 'operador'
        },
        hasPermission,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};