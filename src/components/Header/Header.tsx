// src/components/Header/Header.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import styles from './Header.module.css';

/**
 * @component Header
 * @description Componente de navegação principal da aplicação.
 * Exibe links dinâmicos e informações do usuário com base no nível de permissão.
 */
const Header: React.FC = () => {
    // 💡 Método Educativo: Usamos o hook useAuth para acessar o estado global de autenticação
    const { user, logout, hasPermission, USER_LEVELS } = useAuth();
    const navigate = useNavigate();

    // 💡 Documentação: Função para lidar com o logout e redirecionar para a página de login.
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Não deve renderizar o Header se o usuário não estiver logado
    if (!user) {
        return null;
    }

    // 💡 Documentação: Array de objetos que define os links de navegação.
    // O 'minLevel' é usado com 'hasPermission' para determinar se o link deve ser exibido.
    const navItems = [
        { path: '/', label: 'Dashboard', minLevel: USER_LEVELS.OPERATOR }, // Operador (e acima) vê o Dashboard
        { path: '/aeronaves', label: 'Aeronaves', minLevel: USER_LEVELS.OPERATOR },
        // A rota de gerenciamento de usuários é tipicamente APENAS para Administradores
        { path: '/usuarios', label: 'Gestão de Funcionários', minLevel: USER_LEVELS.ADMIN },
    ];

    return (
        <header className={styles.header}>
            <div className={styles.title}>
                AeroCode
            </div>

            <nav className={styles.navLinks}>
                {/* 💡 Método Educativo: Mapeia os itens e exibe APENAS se o usuário tiver a permissão mínima */}
                {navItems.map((item) => (
                    hasPermission(item.minLevel) && (
                        <Link key={item.path} to={item.path}>
                            {item.label}
                        </Link>
                    )
                ))}
            </nav>

            <div className={styles.userInfo}>
                {/* <span className={styles.welcomeText}>
                    Olá, **{user.name}** ({user.levelName})
                </span> */}
                {/* ATUALIZE ESTA PARTE */}
                <Link to="/perfil" className={styles.welcomeText}>
                    Olá, **{user.name}** ({user.levelName})
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