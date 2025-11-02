// src/pages/NotFoundPage.tsx
import { Link } from 'react-router-dom';
import pageStyles from './NotFoundPage.module.css';

/**
 * @component NotFoundPage
 * @description Exibe a página 404 quando o usuário navega para uma URL inexistente.
 */
function NotFoundPage() {
    // 💡 Método Educativo: Usamos o componente Link do react-router-dom para garantir
    // que o retorno ao dashboard seja uma navegação interna rápida.

    return (
        <div className={pageStyles.container}>
            <h1 className={pageStyles.title}>404</h1>
            <h2 className={pageStyles.subtitle}>Página Não Encontrada</h2>

            <p>
                Desculpe, a URL que você tentou acessar não existe no sistema AeroCode.
            </p>

            {/* O link aponta para a rota base, que é protegida e leva ao Dashboard */}
            <Link to="/" className={pageStyles.backButton}>
                Voltar para o Dashboard
            </Link>
        </div>
    );
}

export default NotFoundPage;