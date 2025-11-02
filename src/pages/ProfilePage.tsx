// src/pages/ProfilePage.tsx
import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { updatePassword } from '../utils/mockUsers'; // Importa a nova função
import pageStyles from './ProfilePage.module.css'; // Criaremos este arquivo

function ProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Estados para o formulário de mudança de senha
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [oldPassword, setOldPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Guarda de segurança, embora a rota seja protegida
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validações no front-end primeiro
        if (!oldPassword || !newPassword || !confirmPassword) {
            setError('Todos os campos de senha são obrigatórios.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem. Tente novamente.');
            return;
        }

        try {
            const wasUpdated = updatePassword(user.id, oldPassword, newPassword);
            if (wasUpdated) {
                setSuccess('Senha atualizada com sucesso! Você será deslogado por segurança.');
                // Limpa os campos após o sucesso
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');

                setTimeout(() => {
                    logout();
                    navigate('/login');
                }, 3000);
            }
        } catch (err) {
            let errorMessage = 'Erro ao atualizar a senha.';

            if (err instanceof Error) {
                // Agora, dentro deste bloco, TypeScript sabe que err é do tipo Error
                errorMessage = err.message;
            }

            setError(errorMessage);
        }
    };

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
                        {/* NOVO CAMPO AQUI */}
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

                        <button type="submit" className={pageStyles.button}>
                            Salvar Nova Senha
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}

export default ProfilePage;