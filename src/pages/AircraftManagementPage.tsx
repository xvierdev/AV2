import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth'; // Hook atualizado
import { getAircraftsForUser, addAircraft } from '../utils/mockAircrafts';
import type { AircraftWithPermission, NewAircraftData } from '../types/AircraftTypes';
import pageStyles from './AircraftManagementPage.module.css';

function AircraftManagementPage() {
    // O useAuth retorna o usuário tipado
    const { user, USER_LEVELS } = useAuth();
    const navigate = useNavigate();


    // Obter a lista de aeronaves baseada nas permissões do usuário logado
    const [aircrafts, setAircrafts] = useState<AircraftWithPermission[]>(() => getAircraftsForUser(user!));

    // Permissões
    const isAdmin = user!.level === USER_LEVELS.ADMIN;
    // Engenheiro ou superior (Admin)
    const isEngineerOrHigher = user!.level === USER_LEVELS.ADMIN || user!.level === USER_LEVELS.ENGINEER;

    // Estado para o modal de Adicionar Aeronave
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newAircraftData, setNewAircraftData] = useState<NewAircraftData>({
        model: '', type: '', capacity: 0, range: 0, clientName: '', deliveryDeadline: ''
    });

    const handleCreateAircraft = () => {
        if (!isAdmin) return; // Segurança extra
        setIsModalOpen(true);
    };

    // Tipando o evento de mudança
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setNewAircraftData(prev => ({
            ...prev,
            // O TypeScript garante a segurança do campo 'name' aqui
            [name]: (name === 'capacity' || name === 'range') ? Number(value) : value
        }));
    };

    // Tipando o evento de submissão
    const handleSaveAircraft = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isAdmin) return;

        // Validação de campos obrigatórios
        if (!newAircraftData.model || !newAircraftData.type || newAircraftData.capacity <= 0 || newAircraftData.range <= 0) {
            alert("Por favor, preencha Modelo, Tipo, Capacidade e Alcance.");
            return;
        }

        try {
            const addedAircraft = addAircraft(newAircraftData, user!.id);
            alert(`Aeronave ${addedAircraft.id} adicionada com sucesso!`);

            // 2. ATUALIZE O ESTADO EM VEZ DE RECARREGAR A PÁGINA
            const newAircraftWithPermissions = { ...addedAircraft, canEdit: true }; // Admin que cria sempre pode editar
            setAircrafts(prevAircrafts => [...prevAircrafts, newAircraftWithPermissions]);
            setIsModalOpen(false);
        } catch (error) {
            alert("Erro ao adicionar aeronave. Consulte o console.");
            console.error(error);
        }
    };

    // Ações de Navegação
    const handleSelectAircraft = (id: string) => {
        navigate(`/aeronaves/${id}`);
    };

    const handleManageUsers = () => {
        // Rota protegida por ProtectedRoute, mas o botão só aparece para Admin
        if (isAdmin) {
            navigate('/funcionarios');
        }
    };


    return (
        <div className={pageStyles.container}>
            <div className={pageStyles.pageHeader}>
                <h1>✈️ Gerenciamento de Aeronaves</h1>
                <div className={pageStyles.actionsBar}>
                    {isAdmin && (
                        <button onClick={handleManageUsers} /* ... */>
                            Gerenciar Funcionários
                        </button>
                    )}
                    {isAdmin && (
                        <button onClick={handleCreateAircraft} /* ... */>
                            + Nova Aeronave
                        </button>
                    )}
                </div>
            </div>

            <main className={pageStyles.content}>
                <h2>Lista de Projetos de Aeronaves</h2>
                <div className={pageStyles.cardContainer}>
                    {aircrafts.map((a) => (
                        // A cor da borda muda se o usuário tiver permissão de edição
                        <div key={a.id} className={pageStyles.card} style={{ borderColor: a.canEdit && isEngineerOrHigher ? '#007bff' : '#ccc' }}>
                            <h3 className={pageStyles.cardTitle}>{a.model} ({a.id})</h3>
                            <p><strong>Tipo:</strong> {a.type}</p>
                            <p><strong>Cliente:</strong> {a.clientName || 'N/A'}</p>
                            <p><strong>Status:</strong> <span className={pageStyles.statusBadge}>{a.status}</span></p>

                            <button
                                onClick={() => handleSelectAircraft(a.id)}
                                className={pageStyles.detailsButton}
                            >
                                Detalhes da Produção
                            </button>

                            {/* Indicador de Permissão de Edição */}
                            {a.canEdit && isEngineerOrHigher && (
                                <span className={pageStyles.editTag}>Pode Editar</span>
                            )}
                            {!a.canEdit && isEngineerOrHigher && (
                                <span className={pageStyles.editTag} style={{ backgroundColor: '#dc3545' }}>Apenas Consulta</span>
                            )}
                        </div>
                    ))}
                </div>
            </main>

            {/* Modal de Adicionar Aeronave (Apenas Admin) */}
            {isModalOpen && isAdmin && (
                <div className={pageStyles.modalOverlay}>
                    <form onSubmit={handleSaveAircraft} className={pageStyles.modalContent}>
                        <h3>Adicionar Nova Aeronave</h3>
                        <p>Atributos obrigatórios em **negrito**.</p>

                        <input name="model" required placeholder="**Modelo** (ex: A320 Neo)" onChange={handleInputChange} className={pageStyles.modalInput} />
                        <input name="type" required placeholder="**Tipo** (ex: Comercial/Militar)" onChange={handleInputChange} className={pageStyles.modalInput} />
                        <input name="capacity" type="number" required placeholder="**Capacidade** de Passageiros/Tripulação" onChange={handleInputChange} className={pageStyles.modalInput} min="1" />
                        <input name="range" type="number" required placeholder="**Alcance** (km)" onChange={handleInputChange} className={pageStyles.modalInput} min="1" />

                        {/* Campos Opcionais */}
                        <input name="clientName" placeholder="Nome do Cliente (Opcional)" onChange={handleInputChange} className={pageStyles.modalInput} />
                        <input name="deliveryDeadline" type="date" placeholder="Prazo Estimado de Entrega (Opcional)" onChange={handleInputChange} className={pageStyles.modalInput} />

                        <div className={pageStyles.modalActions}>
                            <button type="button" onClick={() => setIsModalOpen(false)} className={pageStyles.actionButton} style={{ backgroundColor: '#6c757d' }}>Cancelar</button>
                            <button type="submit" className={pageStyles.actionButton}>Salvar Aeronave</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default AircraftManagementPage;