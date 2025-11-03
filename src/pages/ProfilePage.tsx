import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

// Contexto
import { useAuth } from '../context/useAuth';

// Utilitários (Mocks)
import { updatePassword } from '../utils/mockUsers';

// Estilos
import pageStyles from './ProfilePage.module.css';


/**
 * Permite que o usuário logado visualize seus dados e altere sua senha.
 */
function ProfilePage() {
    // ========================================================================
    // Hooks e Estados
    // ========================================================================

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Estados para o formulário de alteração de senha
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // ========================================================================
    // Handlers (Funções de Ação)
    // ========================================================================

    // Valida e submete o formulário de alteração de senha.
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!oldPassword || !newPassword || !confirmPassword) {
            setError('Todos os campos de senha são obrigatórios.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem. Tente novamente.');
            return;
        }

        try {
            const wasUpdated = updatePassword(user!.id, oldPassword, newPassword);
            if (wasUpdated) {
                setSuccess('Senha atualizada com sucesso! Você será desconectado por segurança.');

                // Limpa os campos após o sucesso
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');

                // Desconecta o usuário após 3 segundos para que ele possa ler a mensagem
                setTimeout(() => {
                    logout();
                    navigate('/login');
                }, 3000);
            }
        } catch (err) {
            // Captura o erro da lógica de mock para exibir uma mensagem específica
            const errorMessage = (err instanceof Error) ? err.message : 'Erro ao atualizar a senha.';
            setError(errorMessage);
        }
    };

    // ========================================================================
    // Renderização
    // ========================================================================

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className={pageStyles.container}>
            <div className={pageStyles.profileCard}>
                <header className={pageStyles.header}>
                    <h2>Meu Perfil</h2>
                </header>

                <section className={pageStyles.userInfo}>
                    <p><strong>Nome:</strong> {user.name}</p>
                    <p><strong>Usuário:</strong> {user.username}</p>
                    <p><strong>Nível de Acesso:</strong> {user.levelName}</p>
                </section>

                <hr className={pageStyles.divider} />

                <section>
                    <h3>Alterar Senha</h3>
                    <form onSubmit={handleSubmit} className={pageStyles.form}>
                        <div className={pageStyles.inputGroup}>
                            <label htmlFor="oldPassword">Senha Antiga:</label>
                            <input
                                id="oldPassword"
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className={pageStyles.inputGroup}>
                            <label htmlFor="newPassword">Nova Senha:</label>
                            <input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className={pageStyles.inputGroup}>
                            <label htmlFor="confirmPassword">Confirmar Nova Senha:</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && <p className={pageStyles.error}>{error}</p>}
                        {success && <p className={pageStyles.success}>{success}</p>}

                        <button type="submit" className={pageStyles.button} disabled={!!success}>
                            {success ? 'Aguarde...' : 'Salvar Nova Senha'}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}

export default ProfilePage;