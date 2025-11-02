import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import type { UserLevel } from "../types/UserTypes";

interface ProtectedRouteProps {
    minLevel?: UserLevel;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ minLevel = "operador" }) => {
    const { user, loading, hasPermission } = useAuth();

    if (loading) {
        // Exibe tela de carregamento enquanto verifica o estado de autenticação
        return <div style={{ padding: '20px', textAlign: 'center' }}>Verificando acesso...</div>
    }

    // 1. Não Logado: Redireciona para o Login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 2. Logado, mas sem Permissão: Redireciona para a home page de acesso
    if (!hasPermission(minLevel)) {
        console.warn(`Acesso negado para o usuário ${user.username} (Nível: ${user.levelName}) tentando acessar a rota de ${minLevel}.`);

        // Redireciona para a rota base que, no App.tsx, leva para /aeronaves,
        // garantindo que não há tentativa de acessar a mesma rota protegida que causou a negação.
        return <Navigate to="/" replace />; // 👈 Mudança para rota base
    }

    // 3. Permissão Concedida: Renderiza a rota filha
    return <Outlet />;

}

export default ProtectedRoute;