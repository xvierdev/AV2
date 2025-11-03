import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Componentes
import Header from './components/Header/Header';
import ProtectedRoute from "./components/ProtectedRoute";

// Páginas
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AircraftManagementPage from "./pages/AircraftManagementPage";
import AircraftDetailPage from "./pages/AircraftDetailPage";
import UserManagementPage from "./pages/UserManagementPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from './pages/NotFoundPage';

// Contexto
import { useAuth } from './context/useAuth';


/**
 * Define a estrutura de rotas da aplicação e controla a exibição do cabeçalho.
 */
function AppRoutes() {
  const { user } = useAuth();

  return (
    <>
      {user && <Header />}

      <main style={{ padding: '20px' }}>
        <Routes>
          {/* ------------------- Rota Pública ------------------- */}
          <Route path="/login" element={<LoginPage />} />

          {/* ------------------- Rotas Protegidas (Nível Mínimo: Operador) ------------------- */}
          <Route element={<ProtectedRoute minLevel={'operador'} />}>
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/aeronaves" element={<AircraftManagementPage />} />
            <Route path="/aeronaves/:id" element={<AircraftDetailPage />} />
          </Route>

          {/* ------------------- Rotas Restritas (Nível Mínimo: Administrador) ------------------- */}
          <Route element={<ProtectedRoute minLevel={'administrador'} />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route path="/usuarios" element={<UserManagementPage />} />
            <Route path="/funcionarios" element={<Navigate to="/usuarios" replace />} />
          </Route>

          {/* ------------------- Rota de Fallback (404) ------------------- */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  );
}

/**
 * Componente raiz que envolve toda a aplicação com o roteador do navegador.
 */
function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;