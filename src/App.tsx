import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// Importações de Contexto e Componentes
import { useAuth } from './context/useAuth';
import Header from './components/Header/Header';
import ProtectedRoute from "./components/ProtectedRoute"; // Certifique-se que o caminho está correto
// Importações de Páginas
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AircraftManagementPage from "./pages/AircraftManagementPage";
import AircraftDetailPage from "./pages/AircraftDetailPage";
import UserManagementPage from "./pages/UserManagementPage";
import NotFoundPage from './pages/NotFoundPage';


/**
 * @component AppRoutes
 * @description Contém a lógica de roteamento e a exibição condicional do Header.
 * Este componente deve ser envolvido pelo AuthProvider.
 */
function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      {/* 💡 CORREÇÃO 1: Header e main estão fora do Routes, mas dentro do Router (implementado em App) */}
      {user && <Header />}

      <main style={{ padding: '20px' }}>
        <Routes>
          {/* Rota padrão: Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* ---------------------------------------------------- */}
          {/* ROTAS PROTEGIDAS (Mínimo: Operador) - Acesso Operador, Engenheiro, Administrador */}
          {/* ---------------------------------------------------- */}
          <Route element={<ProtectedRoute minLevel={'operador'} />}>


            <Route path="/aeronaves" element={<AircraftManagementPage />} />
            <Route path="/aeronaves/:id" element={<AircraftDetailPage />} />
          </Route>

          {/* ---------------------------------------------------- */}
          {/* ROTAS RESTRITAS (Mínimo: Administrador) - Acesso SÓ Administrador */}
          {/* ---------------------------------------------------- */}
          <Route element={<ProtectedRoute minLevel={'administrador'} />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} /> {/* Redireciona /dashboard para / */}
            {/* 💡 CORREÇÃO 3: Usando /usuarios (como no Header) e com nível de Admin */}
            <Route path="/usuarios" element={<UserManagementPage />} />
            {/* Adicionando a rota /funcionarios para quem quiser digitar, mas redirecionando para o nome oficial */}
            <Route path="/funcionarios" element={<Navigate to="/usuarios" replace />} />
          </Route>

          {/* ---------------------------------------------------- */}
          {/* ROTA CURINGA */}
          {/* ---------------------------------------------------- */}
          {/* 💡 CORREÇÃO 4: Rota curinga (qualquer URL não mapeada) leva ao NotFoundPage */}
          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </main>
    </>
  );
}

/**
 * @component App
 * @description Componente principal que provê o AuthProvider e o BrowserRouter.
 */
function App() {
  return (
    <BrowserRouter>
        <AppRoutes />
    </BrowserRouter>
  );
}

export default App;