import { useState, type FormEvent } from "react";
import { useAuth } from '../context/useAuth';
import { useNavigate, Navigate } from "react-router-dom";
import pageStyles from './LoginPage.module.css';

function LoginPage() {
    const { user, login, loading } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState('');

    if (user) {
        return <Navigate to="/aeronaves" replace />
    }

    if (loading) {
        return <div>Carregando Autenticação...</div>
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Preencha todos os campos!')
        } else {
            const success = await login(username, password);

            if (success) {
                navigate('/aeronaves', { replace: true });
            } else {
                setError('Usuário ou senha incorretos. Tente novamente.');
            }
        }
    };

    return (
        <div className={pageStyles.container}>
            <h2>Aerocode | Acesso ao Sistema</h2>
            <form onSubmit={handleSubmit} className={pageStyles.form}>
                <div className={pageStyles.inputGroup}>
                    <label htmlFor="username">Usuário:</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={pageStyles.input}
                        required
                    />
                </div>
                <div className={pageStyles.inputGroup}>
                    <label htmlFor="password">Senha:</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={pageStyles.input}
                        required
                    />
                </div>
                {error && <p className={pageStyles.error}>{error}</p>}

                <button type="submit" className={pageStyles.button} disabled={loading}>
                    {loading ? 'Entrando' : 'Entrar'}
                </button>

                <p className={pageStyles.hint}>
                    **Usuário de Teste:** admin/123 (Admin), eng/123 (Engenheiro), op/123 (Operador)
                </p>
            </form>
        </div>
    );
}

export default LoginPage;