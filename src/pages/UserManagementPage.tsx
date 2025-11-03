import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

// Contexto
import { useAuth } from '../context/useAuth';

// Tipos
import type { UserLevel, UserWithoutPassword } from '../types/UserTypes';

// Utilitários (Mocks)
import { getAllUsers, createNewUser, updateUser, deleteUser } from '../utils/mockUsers';

// Estilos
import pageStyles from './UserManagementPage.module.css';


/**
 * Permite que administradores gerenciem (criem, editem, deletem) os usuários do sistema.
 */
function UserManagementPage() {
    // ========================================================================
    // Hooks e Estados
    // ========================================================================

    const { user, logout, USER_LEVELS } = useAuth();
    const navigate = useNavigate();

    // Estados para os dados da página
    const [usersList, setUsersList] = useState<UserWithoutPassword[]>([]);
    const [editingUser, setEditingUser] = useState<UserWithoutPassword | null>(null);

    // Estados para a UI (modais)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newUserForm, setNewUserForm] = useState({
        name: '',
        username: '',
        level: USER_LEVELS.OPERATOR as UserLevel,
    });

    // ========================================================================
    // Lógica de Dados e Efeitos
    // ========================================================================

    const isAdmin = user?.level === USER_LEVELS.ADMIN;

    // Carrega a lista de usuários ou redireciona se o acesso for indevido.
    useEffect(() => {
        if (isAdmin) {
            setUsersList(getAllUsers());
        } else {
            navigate('/aeronaves', { replace: true });
        }
    }, [isAdmin, navigate]);

    // ========================================================================
    // Handlers (Funções de Ação)
    // ========================================================================

    // Cria um novo usuário após a submissão do modal de criação.
    const handleCreateUser = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newUserForm.name || !newUserForm.username) {
            alert('Preencha todos os campos obrigatórios.');
            return;
        }
        try {
            const addedUser = createNewUser(newUserForm.name, newUserForm.username, newUserForm.level);
            setUsersList(prevUsers => [...prevUsers, addedUser]);
            setIsCreateModalOpen(false);
            alert(`Usuário ${addedUser.name} criado com sucesso! Senha Padrão: 123.`);
        } catch (error) {
            console.error("Erro ao criar usuário:", error);
            alert("Erro ao criar usuário. Tente novamente.");
        }
    };

    // Atualiza um usuário existente após a submissão do modal de edição.
    const handleUpdateUser = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingUser) return;

        const updatedUser = updateUser(editingUser.id, { name: editingUser.name, level: editingUser.level });
        if (updatedUser) {
            setUsersList(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));
            setIsEditModalOpen(false);
            setEditingUser(null);
            alert('Usuário atualizado com sucesso!');
        } else {
            alert('Erro ao atualizar o usuário.');
        }
    };

    // Deleta um usuário após solicitar confirmação.
    const handleDeleteUser = (userId: number, userName: string) => {
        if (user?.id === userId) {
            alert('Ação não permitida: Você não pode excluir sua própria conta.');
            return;
        }
        const isConfirmed = window.confirm(`Você tem certeza que deseja excluir o usuário "${userName}"?`);
        if (isConfirmed) {
            const success = deleteUser(userId);
            if (success) {
                setUsersList(prev => prev.filter(u => u.id !== userId));
                alert('Usuário excluído com sucesso.');
            } else {
                alert('Erro ao excluir o usuário.');
            }
        }
    };

    // Abre o modal de edição preenchendo os dados do usuário selecionado.
    const handleOpenEditModal = (userToEdit: UserWithoutPassword) => {
        setEditingUser(userToEdit);
        setIsEditModalOpen(true);
    };

    // Atualiza o estado do formulário de criação.
    const handleCreateFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewUserForm(prev => ({ ...prev, [name]: value }));
    };

    // Atualiza o estado do formulário de edição.
    const handleEditFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (editingUser) {
            setEditingUser({ ...editingUser, [name]: value });
        }
    };

    // Realiza o logout e redireciona para a página de login.
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // ========================================================================
    // Renderização
    // ========================================================================

    if (!isAdmin) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Verificando permissões...</div>;
    }

    const allLevels: UserLevel[] = [USER_LEVELS.ADMIN, USER_LEVELS.ENGINEER, USER_LEVELS.OPERATOR];

    return (
        <div className={pageStyles.container}>
            <header className={pageStyles.header}>
                <h1>👥 Gerenciamento de Funcionários</h1>
                <div className={pageStyles.userInfo}>
                    <button onClick={() => navigate('/aeronaves')} className={pageStyles.actionButton} style={{ backgroundColor: '#007bff' }}>
                        Voltar para Aeronaves
                    </button>
                    <button onClick={handleLogout} className={pageStyles.logoutButton}>Sair</button>
                </div>
            </header>

            <div className={pageStyles.actionsBar}>
                <button onClick={() => setIsCreateModalOpen(true)} className={pageStyles.actionButton}>
                    + Novo Funcionário
                </button>
            </div>

            <main className={pageStyles.content}>
                <h2>Lista de Usuários do Sistema</h2>
                <table className={pageStyles.table}>
                    <thead>
                        <tr>
                            <th className={pageStyles.th}>ID</th>
                            <th className={pageStyles.th}>Nome</th>
                            <th className={pageStyles.th}>Usuário</th>
                            <th className={pageStyles.th}>Nível</th>
                            <th className={pageStyles.th}>Aeronaves Associadas</th>
                            <th className={pageStyles.th}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersList.map((u) => (
                            <tr key={u.id} className={pageStyles.tr}>
                                <td className={pageStyles.td}>{u.id}</td>
                                <td className={pageStyles.td}>{u.name}</td>
                                <td className={pageStyles.td}>{u.username}</td>
                                <td className={pageStyles.td}>{u.levelName}</td>
                                <td className={pageStyles.td}>{u.associatedAircrafts.join(', ') || 'N/A'}</td>
                                <td className={pageStyles.td}>
                                    <div className={pageStyles.actionsCell}>
                                        <button onClick={() => handleOpenEditModal(u)} className={pageStyles.editButton}>Editar</button>
                                        <button onClick={() => handleDeleteUser(u.id, u.name)} className={pageStyles.deleteButton} disabled={user?.id === u.id}>
                                            Excluir
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>

            {isCreateModalOpen && (
                <div className={pageStyles.modalOverlay}>
                    <form onSubmit={handleCreateUser} className={pageStyles.modalContent}>
                        <h3>Criar Novo Funcionário</h3>
                        <input name="name" required placeholder="Nome Completo" onChange={handleCreateFormChange} className={pageStyles.modalInput} />
                        <input name="username" required placeholder="Nome de Usuário (login)" onChange={handleCreateFormChange} className={pageStyles.modalInput} />
                        <select name="level" required onChange={handleCreateFormChange} value={newUserForm.level} className={pageStyles.modalInput}>
                            {allLevels.map(level => <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>)}
                        </select>
                        <p className={pageStyles.modalHint}>A senha padrão inicial é "123".</p>
                        <div className={pageStyles.modalActions}>
                            <button type="button" onClick={() => setIsCreateModalOpen(false)} style={{ backgroundColor: '#6c757d', color: 'white' }}>Cancelar</button>
                            <button type="submit">Criar Usuário</button>
                        </div>
                    </form>
                </div>
            )}

            {isEditModalOpen && editingUser && (
                <div className={pageStyles.modalOverlay}>
                    <form onSubmit={handleUpdateUser} className={pageStyles.modalContent}>
                        <h3>Editando Usuário: {editingUser.username}</h3>
                        <label>Nome Completo:</label>
                        <input name="name" required value={editingUser.name} onChange={handleEditFormChange} className={pageStyles.modalInput} />
                        <label>Nível de Acesso:</label>
                        <select name="level" required value={editingUser.level} onChange={handleEditFormChange} className={pageStyles.modalInput}>
                            {allLevels.map(level => <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>)}
                        </select>
                        <p className={pageStyles.modalHint}>O nome de usuário (login) não pode ser alterado.</p>
                        <div className={pageStyles.modalActions}>
                            <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ backgroundColor: '#6c757d', color: 'white' }}>Cancelar</button>
                            <button type="submit">Salvar Alterações</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default UserManagementPage;