import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

// Componentes
import { AddAircraftModal } from '../components/AddAircraftModal/AddAircraftModal';

// Contexto
import { useAuth } from '../context/useAuth';

// Tipos
import type { AircraftWithPermission, NewAircraftData } from '../types/AircraftTypes';

// Utilitários (Mocks)
import { getAircraftsForUser, addAircraft } from '../utils/mockAircrafts';
import { getAllUsers } from '../utils/mockUsers';

// Estilos
import pageStyles from './AircraftManagementPage.module.css';

// Mapeamento para as cores
const statusClassMap: { [key: string]: string } = {
    'Pré-produção': pageStyles['status-PreProducao'], // Crie esta classe se precisar de cor
    'Em Produção (Fase 1/6)': pageStyles['status-EmProducao'],
    'Em Produção (Fase 3/6)': pageStyles['status-EmProducao'],
    'Testes Finais': pageStyles['status-TestesFinais'],
    'Concluído / Entregue': pageStyles['status-Concluido'],
};

/**
 * Exibe a lista de aeronaves e permite que administradores criem novos projetos.
 */
function AircraftManagementPage() {
    // ========================================================================
    // Hooks e Estados
    // ========================================================================

    const { user, USER_LEVELS } = useAuth();
    const navigate = useNavigate();

    const [aircrafts, setAircrafts] = useState<AircraftWithPermission[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // ========================================================================
    // Lógica de Dados e Permissões
    // ========================================================================

    // Carrega a lista de aeronaves para o usuário logado ao montar o componente.
    useEffect(() => {
        if (user) {
            setAircrafts(getAircraftsForUser(user));
        }
    }, [user]);

    // Memoriza a lista de engenheiros para passar ao modal de criação.
    const engineers = useMemo(() => {
        return getAllUsers().filter(u => u.level === USER_LEVELS.ENGINEER);
    }, [USER_LEVELS.ENGINEER]);

    // Flag de permissão para simplificar a renderização condicional no JSX.
    const isAdmin = user?.level === USER_LEVELS.ADMIN;

    // ========================================================================
    // Handlers (Funções de Ação)
    // ========================================================================

    // Adiciona uma nova aeronave à lista após submissão do modal.
    const handleAddAircraft = (data: NewAircraftData) => {
        if (!user) return;

        try {
            const addedAircraft = addAircraft(data, user.id);
            const newAircraftWithPermissions = { ...addedAircraft, canEdit: true };
            setAircrafts(prevAircrafts => [...prevAircrafts, newAircraftWithPermissions]);
            alert(`Aeronave "${addedAircraft.model}" adicionada com sucesso!`);
        } catch (error) {
            alert("Ocorreu um erro ao adicionar a aeronave. Consulte o console.");
            console.error(error);
        }
    };

    // Navega para a página de detalhes da aeronave clicada.
    const handleSelectAircraft = (id: string) => {
        navigate(`/aeronaves/${id}`);
    };

    // Navega para a página de gerenciamento de funcionários.
    const handleManageUsers = () => {
        if (isAdmin) {
            navigate('/usuarios');
        }
    };


    // ========================================================================
    // Renderização
    // ========================================================================

    if (!user) {
        return <div className={pageStyles.container}>Carregando informações...</div>;
    }

    return (
        <div className={pageStyles.container}>
            <header className={pageStyles.header}>
                <h1>✈️ Aerocode - Gerenciamento de Aeronaves</h1>
                <div className={pageStyles.userInfo}>
                    <span className={pageStyles.userName}>Usuário: {user.name}</span>
                    {/* <button onClick={handleLogout} className={pageStyles.logoutButton}>Sair</button> */}
                </div>
            </header>

            <div className={pageStyles.actionsBar}>
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
                            <p><strong>Status:</strong> <span className={`${pageStyles.statusBadge} ${statusClassMap[a.status] || ''}`}>{a.status}</span></p>

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