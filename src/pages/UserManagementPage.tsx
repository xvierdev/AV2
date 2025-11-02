import { useState, useEffect, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getAllUsers, createNewUser } from '../utils/mockUsers';
import type { UserLevel, UserWithoutPassword } from '../types/UserTypes';
import pageStyles from './UserManagementPage.module.css';
import { updateUser, deleteUser } from '../utils/mockUsers';

function UserManagementPage() {
    const { user, logout, USER_LEVELS } = useAuth();
    const navigate = useNavigate();

    // Verifica se o usuário logado é realmente um administrador (embora a rota já proteja)
    const isAdmin = user && user.level === USER_LEVELS.ADMIN;

    const [usersList, setUsersList] = useState<UserWithoutPassword[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newUserForm, setNewUserForm] = useState({
        name: '',
        username: '',
        level: USER_LEVELS.OPERATOR as UserLevel // Padrão
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    // Guarda o usuário que está sendo editado
    const [editingUser, setEditingUser] = useState<UserWithoutPassword | null>(null);

    // Efeito para carregar a lista de usuários quando a página é montada
    useEffect(() => {
        if (isAdmin) {
            setUsersList(getAllUsers());
        } else {
            // Se, por algum motivo, um não-admin chegar aqui, ele é redirecionado
            navigate('/aeronaves', { replace: true });
        }
    }, [isAdmin, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewUserForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateUser = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!newUserForm.name || !newUserForm.username || !newUserForm.level) {
            alert('Preencha todos os campos obrigatórios.');
            return;
        }

        try {
            const addedUser = createNewUser(
                newUserForm.name,
                newUserForm.username,
                newUserForm.level
            );

            // 💡 ATUALIZE O ESTADO DIRETAMENTE
            // A função createNewUser já retorna o objeto completo, sem a senha.
            setUsersList(prevUsers => [...prevUsers, addedUser]);

            setIsModalOpen(false); // Fecha o modal
            alert(`Usuário ${addedUser.name} criado com sucesso! Senha Padrão: 123.`);

        } catch (error) {
            console.error("Erro ao criar usuário:", error);
            alert("Erro ao criar usuário. Tente novamente.");
        }
    };

    // Se não for Admin, mostra um loading ou redireciona
    if (!isAdmin) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Acesso não autorizado ou carregando...</div>;
    }

    const allLevels: UserLevel[] = [USER_LEVELS.ADMIN, USER_LEVELS.ENGINEER, USER_LEVELS.OPERATOR];

    // Abre o modal de edição e preenche com os dados do usuário selecionado
    const handleOpenEditModal = (userToEdit: UserWithoutPassword) => {
        setEditingUser(userToEdit);
        setIsEditModalOpen(true);
    };

    // Salva as alterações do formulário de edição
    const handleUpdateUser = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingUser) return;

        const updatedUser = updateUser(editingUser.id, {
            name: editingUser.name,
            level: editingUser.level,
        });

        if (updatedUser) {
            // Atualiza a lista de usuários na UI
            setUsersList(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));
            setIsEditModalOpen(false);
            setEditingUser(null);
            alert('Usuário atualizado com sucesso!');
        } else {
            alert('Erro ao atualizar o usuário.');
        }
    };

    // Handler para o input do modal de edição
    const handleEditInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (editingUser) {
            setEditingUser({ ...editingUser, [name]: value });
        }
    };

    // Deleta um usuário após uma confirmação
    const handleDeleteUser = (userId: number, userName: string) => {
        // 🚨 NUNCA permita que um administrador delete a si mesmo!
        if (user?.id === userId) {
            alert('Ação não permitida: Você não pode excluir sua própria conta.');
            return;
        }

        // 🚨 SEMPRE peça confirmação para ações destrutivas!
        const isConfirmed = window.confirm(`Você tem certeza que deseja excluir o usuário "${userName}"? Esta ação não pode ser desfeita.`);

        if (isConfirmed) {
            const success = deleteUser(userId);
            if (success) {
                // Remove o usuário da lista na UI
                setUsersList(prev => prev.filter(u => u.id !== userId));
                alert('Usuário excluído com sucesso.');
            } else {
                alert('Erro ao excluir o usuário.');
            }
        }
    };

    return (
        <div className={pageStyles.container}>
            <header className={pageStyles.header}>
                <h1>👥 Gerenciamento de Funcionários</h1>
                <div className={pageStyles.userInfo}>
                    <span className={pageStyles.userRole}>Nível: **{user!.levelName}**</span>
                    <button onClick={() => navigate('/aeronaves')} className={pageStyles.actionButton} style={{ backgroundColor: '#007bff' }}>
                        Voltar para Aeronaves
                    </button>
                    <button onClick={handleLogout} className={pageStyles.logoutButton}>Sair</button>
                </div>
            </header>

            <div className={pageStyles.actionsBar}>
                <button onClick={() => setIsModalOpen(true)} className={pageStyles.actionButton}>
                    + Novo Funcionário
                </button>
            </div>

            <main className={pageStyles.content}>
                <h2>Lista de Usuários do Sistema</h2>
                <table className={pageStyles.table}>
                    <thead>
                        <tr>
                            <th className={pageStyles.th}>ID</th>
                            <th className={pageStyles.th}>Nome Completo</th>
                            <th className={pageStyles.th}>Usuário</th>
                            <th className={pageStyles.th}>Nível de Acesso</th>
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
                                <td className={pageStyles.td} style={{ fontWeight: 'bold', color: u.level === USER_LEVELS.ADMIN ? '#dc3545' : '#007bff' }}>
                                    {u.levelName}
                                </td>
                                <td className={pageStyles.td}>
                                    {u.associatedAircrafts.length > 0
                                        ? u.associatedAircrafts.join(', ')
                                        : 'N/A'
                                    }
                                </td>
                                <td className={pageStyles.td}>
                                    <div className={pageStyles.actionsCell}>
                                        <button onClick={() => handleOpenEditModal(u)} className={pageStyles.editButton}>
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(u.id, u.name)}
                                            className={pageStyles.deleteButton}
                                            // Desabilita o botão se o usuário for o próprio admin
                                            disabled={user?.id === u.id}
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>

            {/* Modal de Criar Novo Usuário */}
            {isModalOpen && (
                <div className={pageStyles.modalOverlay}>
                    <form onSubmit={handleCreateUser} className={pageStyles.modalContent}>
                        <h3>Criar Novo Funcionário</h3>

                        <input name="name" required placeholder="Nome Completo" onChange={handleInputChange} className={pageStyles.modalInput} />
                        <input name="username" required placeholder="Nome de Usuário (login)" onChange={handleInputChange} className={pageStyles.modalInput} />

                        <select name="level" required onChange={handleInputChange} value={newUserForm.level} className={pageStyles.modalInput}>
                            <option value="" disabled>Selecione o Nível de Acesso</option>
                            {allLevels.map(level => (
                                <option key={level} value={level}>
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                </option>
                            ))}
                        </select>
                        <p className={pageStyles.modalHint}>* A senha padrão inicial é **123**.</p>

                        <div className={pageStyles.modalActions}>
                            <button type="button" onClick={() => setIsModalOpen(false)} className={pageStyles.actionButton} style={{ backgroundColor: '#6c757d' }}>Cancelar</button>
                            <button type="submit" className={pageStyles.actionButton}>Criar Usuário</button>
                        </div>
                    </form>
                </div>
            )}
            {/* NOVO MODAL DE EDITAR USUÁRIO */}
            {isEditModalOpen && editingUser && (
                <div className={pageStyles.modalOverlay}>
                    <form onSubmit={handleUpdateUser} className={pageStyles.modalContent}>
                        <h3>Editando Usuário: {editingUser.username}</h3>

                        <label>Nome Completo:</label>
                        <input name="name" required value={editingUser.name} onChange={handleEditInputChange} className={pageStyles.modalInput} />

                        <label>Nível de Acesso:</label>
                        <select name="level" required value={editingUser.level} onChange={handleEditInputChange} className={pageStyles.modalInput}>
                            {allLevels.map(level => (
                                <option key={level} value={level}>
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                </option>
                            ))}
                        </select>
                        <p className={pageStyles.modalHint}>* O nome de usuário (login) não pode ser alterado.</p>

                        <div className={pageStyles.modalActions}>
                            <button type="button" onClick={() => setIsEditModalOpen(false)} className={pageStyles.actionButton} style={{ backgroundColor: '#6c757d' }}>Cancelar</button>
                            <button type="submit" className={pageStyles.actionButton}>Salvar Alterações</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default UserManagementPage;