import { Navigate, Outlet } from "react-router-dom";

// Contexto
import { useAuth } from "../context/useAuth";

// Tipos
import type { UserLevel } from "../types/UserTypes";


/**
 * Define as propriedades que o componente ProtectedRoute recebe.
 */
interface ProtectedRouteProps {
    minLevel?: UserLevel;
}

/**
 * Componente que atua como um "gatekeeper" para rotas, garantindo que o usuário
 * esteja logado e tenha o nível de permissão mínimo necessário para acessá-las.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ minLevel = "operador" }) => {
    // ========================================================================
    // Hooks e Lógica de Proteção
    // ========================================================================

    const { user, loading, hasPermission } = useAuth();

    // Exibe uma tela de carregamento enquanto a autenticação é verificada.
    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Verificando acesso...</div>;
    }

    // Se não houver usuário, redireciona para a página de login.
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Se o usuário não tiver o nível de permissão necessário, redireciona para a página inicial.
    if (!hasPermission(minLevel)) {
        console.warn(`Acesso negado para o usuário ${user.username} (Nível: ${user.levelName}) tentando acessar a rota de ${minLevel}.`);
        return <Navigate to="/" replace />;
    }

    // ========================================================================
    // Renderização
    // ========================================================================

    // Se todas as verificações passarem, renderiza a rota filha.
    return <Outlet />;
}

export default ProtectedRoute;