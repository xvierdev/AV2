import { Link } from 'react-router-dom';

// Estilos
import pageStyles from './NotFoundPage.module.css';


/**
 * Exibe uma página de erro 404 para rotas não encontradas.
 */
function NotFoundPage() {
    // ========================================================================
    // Renderização
    // ========================================================================

    return (
        <div className={pageStyles.container}>
            <h1 className={pageStyles.title}>404</h1>
            <h2 className={pageStyles.subtitle}>Página Não Encontrada</h2>
            <p>
                Desculpe, a página que você tentou acessar não existe.
            </p>
            <Link to="/" className={pageStyles.backButton}>
                Voltar para a Página Inicial
            </Link>
        </div>
    );
}

export default NotFoundPage;