import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getAircraftsForUser, addAircraft } from '../utils/mockAircrafts';
import { getAllUsers } from '../utils/mockUsers';
import { AddAircraftModal } from '../components/AddAircraftModal/AddAircraftModal';
import type { AircraftWithPermission, NewAircraftData } from '../types/AircraftTypes';
import pageStyles from './AircraftManagementPage.module.css';

function AircraftManagementPage() {
    // --- Hooks de Estado e Roteamento ---
    const { user, USER_LEVELS, logout } = useAuth();
    const navigate = useNavigate();

    // Estado para a lista de aeronaves exibida na tela
    const [aircrafts, setAircrafts] = useState<AircraftWithPermission[]>([]);
    // Estado para controlar a visibilidade do modal de criação
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- Lógica de Dados e Permissões ---

    // Carrega a lista de aeronaves quando o componente é montado ou o usuário muda
    useEffect(() => {
        if (user) {
            setAircrafts(getAircraftsForUser(user));
        }
    }, [user]);

    // Otimiza o cálculo da lista de engenheiros para passar ao modal
    const engineers = useMemo(() => {
        return getAllUsers().filter(u => u.level === USER_LEVELS.ENGINEER);
    }, [USER_LEVELS.ENGINEER]);

    // Flags de permissão para limpar o JSX
    const isAdmin = user?.level === USER_LEVELS.ADMIN;

    // --- Handlers (Funções de Ação) ---

    // Função passada para o modal, que será chamada no submit
    const handleAddAircraft = (data: NewAircraftData) => {
        if (!user) return; // Guarda de segurança

        try {
            const addedAircraft = addAircraft(data, user.id);
            // O criador (admin) sempre pode editar a aeronave que criou
            const newAircraftWithPermissions = { ...addedAircraft, canEdit: true };

            // Atualiza o estado para a UI reagir instantaneamente
            setAircrafts(prevAircrafts => [...prevAircrafts, newAircraftWithPermissions]);

            alert(`Aeronave "${addedAircraft.model}" adicionada com sucesso!`);
        } catch (error) {
            alert("Ocorreu um erro ao adicionar a aeronave. Consulte o console.");
            console.error(error);
        }
    };

    // Navega para a página de detalhes da aeronave selecionada
    const handleSelectAircraft = (id: string) => {
        navigate(`/aeronaves/${id}`);
    };

    // Navega para a página de gerenciamento de usuários
    const handleManageUsers = () => {
        if (isAdmin) {
            navigate('/usuarios'); // '/usuarios' é a rota oficial definida no App.tsx
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // --- Renderização ---

    // Guarda de carregamento enquanto o usuário ainda não foi carregado
    if (!user) {
        return <div className={pageStyles.container}>Carregando informações...</div>;
    }

    return (
        <div className={pageStyles.container}>
            <header className={pageStyles.header}>
                <h1>✈️ Aerocode - Gerenciamento de Aeronaves</h1>
                <div className={pageStyles.userInfo}>
                    {/* Reutilizando o Header global, esta parte é opcional mas pode ser útil */}
                    <span className={pageStyles.userName}>Usuário: {user.name}</span>
                    <button onClick={handleLogout} className={pageStyles.logoutButton}>Sair</button>
                </div>
            </header>

            <div className={pageStyles.actionsBar}>
                {/* Botões de ação disponíveis apenas para administradores */}
                {isAdmin && (
                    <>
                        <button onClick={handleManageUsers} className={pageStyles.actionButton} style={{ backgroundColor: '#17a2b8' }}>
                            Gerenciar Funcionários
                        </button>
                        <button onClick={() => setIsModalOpen(true)} className={pageStyles.actionButton}>
                            + Nova Aeronave
                        </button>
                    </>
                )}
            </div>

            <main className={pageStyles.content}>
                <h2>Lista de Projetos Ativos</h2>
                <div className={pageStyles.cardContainer}>
                    {aircrafts.map((a) => (
                        <div key={a.id} className={pageStyles.card} onClick={() => handleSelectAircraft(a.id)}>
                            <h3 className={pageStyles.cardTitle}>{a.model} ({a.id})</h3>
                            <p><strong>Tipo:</strong> {a.type}</p>
                            <p><strong>Cliente:</strong> {a.clientName || 'N/A'}</p>
                            <p><strong>Status:</strong> <span className={pageStyles.statusBadge}>{a.status}</span></p>

                            {/* Indicador visual de permissão */}
                            {a.canEdit && user.level !== 'operador' && (
                                <span className={pageStyles.editTag}>Pode Editar</span>
                            )}
                            {!a.canEdit && user.level === 'engenheiro' && (
                                <span className={pageStyles.editTag} style={{ backgroundColor: '#6c757d' }}>Apenas Consulta</span>
                            )}
                        </div>
                    ))}
                </div>
            </main>

            {/* O novo modal é renderizado aqui, passando as props necessárias */}
            {isAdmin && (
                <AddAircraftModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleAddAircraft}
                    engineers={engineers}
                />
            )}
        </div>
    );
}

export default AircraftManagementPage;