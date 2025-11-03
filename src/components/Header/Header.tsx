import { Link, useNavigate } from 'react-router-dom';

// Contexto
import { useAuth } from '../../context/useAuth';

// Estilos
import styles from './Header.module.css';


/**
 * Componente de cabeçalho e navegação principal da aplicação.
 */
const Header: React.FC = () => {
    // ========================================================================
    // Hooks e Contexto
    // ========================================================================

    const { user, logout, hasPermission, USER_LEVELS } = useAuth();
    const navigate = useNavigate();

    // ========================================================================
    // Handlers (Funções de Ação)
    // ========================================================================

    // Realiza o logout do usuário e o redireciona para a página de login.
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // ========================================================================
    // Renderização
    // ========================================================================

    if (!user) {
        return null;
    }

    // Define os itens de navegação e o nível de permissão mínimo para exibi-los.
    const navItems = [
        { path: '/', label: 'Dashboard', minLevel: USER_LEVELS.ADMIN },
        { path: '/aeronaves', label: 'Aeronaves', minLevel: USER_LEVELS.OPERATOR },
        { path: '/usuarios', label: 'Funcionários', minLevel: USER_LEVELS.ADMIN },
    ];

    return (
        <header className={styles.header}>
            <div className={styles.title}>
                AeroCode
            </div>

            <nav className={styles.navLinks}>
                {navItems.map((item) => (
                    hasPermission(item.minLevel) && (
                        <Link key={item.path} to={item.path}>
                            {item.label}
                        </Link>
                    )
                ))}
            </nav>

            <div className={styles.userInfo}>
                <Link to="/perfil" className={styles.welcomeText}>
                    Olá, {user.name} ({user.levelName}) | Editar Perfil
                </Link>

                <button
                    onClick={handleLogout}
                    className={styles.logoutButton}
                >
                    Sair
                </button>
            </div>
        </header>
    );
};

export default Header;