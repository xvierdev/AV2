import { useState, useEffect, useMemo, type FormEvent, type ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Componentes
import { AddPartModal } from '../components/AddPartModal/AddPartModal';
import { PartsList } from '../components/PartsList/PartsList';
import { RecordTestModal } from '../components/RecordTestModal/RecordTestModal';
import { TestsList } from '../components/TestsList/TestsList';

// Contexto
import { useAuth } from '../context/useAuth';

// Tipos
import type { Aircraft, EditableAircraftData } from '../types/AircraftTypes';
import type { Task, TaskStatus } from '../types/TaskTypes';
import type { Part, NewPartData, PartStatus } from '../types/PartTypes';
import type { Test, NewTestData } from '../types/TestTypes';

// Utilitários (Mocks e Geradores)
import { getAircraftById, updateAircraftDetails } from '../utils/mockAircrafts';
import { getAllUsers } from '../utils/mockUsers';
import { getTasksByAircraftId, createNewTask, updateTaskStatus } from '../utils/mockTasks';
import { getPartsByAircraftId, addPart, updatePartStatus as updatePartMockStatus } from '../utils/mockParts';
import { getTestsByAircraftId, recordNewTest } from '../utils/mockTests';
import { generateAircraftReport } from '../utils/reportGenerator';

// Estilos
import pageStyles from './AircraftDetailPage.module.css';
import modalStyles from '../styles/commonModal.module.css';


/**
 * Exibe e gerencia os detalhes de uma aeronave, incluindo suas tarefas, peças e testes.
 */
function AircraftDetailPage() {
    // ========================================================================
    // Hooks e Estados
    // ========================================================================

    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, USER_LEVELS } = useAuth();

    // Estados para os dados principais da página
    const [aircraft, setAircraft] = useState<Aircraft | null>(null);
    const [tasksList, setTasksList] = useState<Task[]>([]);
    const [partsList, setPartsList] = useState<Part[]>([]);
    const [testsList, setTestsList] = useState<Test[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Estados para controlar a UI (modais, modo de edição, etc.)
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<EditableAircraftData>({});
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isPartModalOpen, setIsPartModalOpen] = useState(false);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);
    const [newTaskForm, setNewTaskForm] = useState({
        description: '',
        responsibleUserId: null as number | null,
        dueDate: new Date().toISOString().split('T')[0],
    });

    // ========================================================================
    // Lógica de Dados e Permissões
    // ========================================================================

    // Memoriza a lista de todos os usuários para evitar recálculos.
    const allUsers = useMemo(() => getAllUsers(), []);
    // Memoriza a lista de engenheiros, derivada da lista de todos os usuários.
    const engineers = useMemo(() => allUsers.filter(u => u.level === USER_LEVELS.ENGINEER), [allUsers, USER_LEVELS.ENGINEER]);
    // Memoriza a lista de usuários que podem ser designados para tarefas.
    const possibleAssignees = useMemo(() => allUsers.filter(u => u.level !== USER_LEVELS.ADMIN), [allUsers, USER_LEVELS.ADMIN]);

    // Calcula as permissões do usuário logado para a aeronave atual.
    const permissions = useMemo(() => {
        if (!user || !aircraft) {
            return { canEditDetails: false, canCreateTasks: false, canReopenTasks: false, isAdmin: false };
        }
        const isAdmin = user.level === USER_LEVELS.ADMIN;
        const isAssociatedEngineer = aircraft.associatedEngineers.includes(user.id);
        const canEdit = isAdmin || isAssociatedEngineer;
        return { canEditDetails: canEdit, canCreateTasks: canEdit, canReopenTasks: canEdit, isAdmin };
    }, [user, aircraft, USER_LEVELS]);

    // ========================================================================
    // Efeito para Carregamento de Dados
    // ========================================================================

    // Carrega todos os dados da aeronave quando o ID da URL muda.
    useEffect(() => {
        if (!id) {
            setError("ID da Aeronave não fornecido.");
            return;
        }
        const foundAircraft = getAircraftById(id);
        if (foundAircraft) {
            setAircraft(foundAircraft);
            setEditData(foundAircraft);
            setTasksList(getTasksByAircraftId(id));
            setPartsList(getPartsByAircraftId(id));
            setTestsList(getTestsByAircraftId(id));
        } else {
            setError(`Aeronave com ID ${id} não encontrada.`);
        }
    }, [id]);

    // ========================================================================
    // Handlers (Funções de Ação)
    // ========================================================================

    // Salva as alterações feitas nos detalhes principais da aeronave.
    const handleSaveDetails = (e: FormEvent) => {
        e.preventDefault();
        if (!id || !permissions.canEditDetails) return;
        const updatedAircraft = updateAircraftDetails(id, editData);
        if (updatedAircraft) {
            setAircraft(updatedAircraft);
            setEditData(updatedAircraft);
            setIsEditing(false);
            alert(`Aeronave ${id} atualizada com sucesso!`);
        } else {
            alert("Erro ao salvar. Aeronave não encontrada.");
        }
    };

    // Atualiza o estado do formulário de edição de detalhes.
    const handleDetailsInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumeric = ['capacity', 'range'].includes(name);
        setEditData(prev => ({ ...prev, [name]: isNumeric ? Number(value) : value }));
    };

    // Cria uma nova tarefa para a aeronave.
    const handleCreateTask = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newTaskForm.description || !id) return;
        const responsibleUser = allUsers.find(u => u.id === newTaskForm.responsibleUserId);
        const addedTask = createNewTask(id, newTaskForm.description, newTaskForm.responsibleUserId, responsibleUser?.name || 'Equipe Geral', newTaskForm.dueDate);
        setTasksList(prev => [...prev, addedTask]);
        setIsTaskModalOpen(false);
        setNewTaskForm({ description: '', responsibleUserId: null, dueDate: new Date().toISOString().split('T')[0] });
    };

    // Avança o status de uma tarefa (Pendente -> Em Andamento -> Concluída).
    const handleUpdateTaskStatus = (task: Task) => {
        if (!user) return;
        let newStatus: TaskStatus | null = null;
        switch (task.status) {
            case 'Pendente': newStatus = 'Em Andamento'; break;
            case 'Em Andamento': newStatus = 'Concluída'; break;
            case 'Concluída':
                if (!permissions.canReopenTasks) {
                    alert("Ação bloqueada: Apenas Engenheiros ou Administradores podem reabrir tarefas.");
                    return;
                }
                newStatus = 'Em Andamento';
                break;
        }
        if (newStatus) {
            const updatedTask = updateTaskStatus(task.id, newStatus);
            if (updatedTask) setTasksList(prev => prev.map(t => (t.id === task.id ? updatedTask : t)));
        }
    };

    // Adiciona uma nova peça à lista da aeronave.
    const handleAddPart = (partData: NewPartData) => {
        if (!id) return;
        const newPart = addPart(id, partData);
        setPartsList(prev => [...prev, newPart]);
        setIsPartModalOpen(false);
    };

    // Atualiza o status de uma peça.
    const handleUpdatePartStatus = (partId: number, newStatus: PartStatus) => {
        const updatedPart = updatePartMockStatus(partId, newStatus);
        if (updatedPart) setPartsList(prev => prev.map(p => (p.id === partId ? updatedPart : p)));
    };

    // Registra um novo teste no histórico da aeronave.
    const handleRecordTest = (testData: NewTestData) => {
        if (!id) return;
        const newTest = recordNewTest(id, testData);
        setTestsList(prev => [...prev, newTest]);
        setIsTestModalOpen(false);
    };

    // Gera um relatório em texto e aciona o download.
    const handleGenerateReport = () => {
        if (!aircraft) return;
        const reportText = generateAircraftReport(aircraft, tasksList, partsList, testsList);
        const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Relatorio_Aeronave_${aircraft.id}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Determina o texto e estado (ativo/desativo) do botão de ação de uma tarefa.
    const getTaskActionProps = (task: Task) => {
        const isResponsible = task.responsibleUserId === user?.id || task.responsibleUserId === null;
        let text = '', disabled = user?.level === 'operador' && !isResponsible;
        switch (task.status) {
            case 'Pendente': text = 'Iniciar Tarefa'; break;
            case 'Em Andamento': text = 'Finalizar Tarefa'; break;
            case 'Concluída': text = 'Reabrir'; if (!permissions.canReopenTasks) disabled = true; break;
        }
        return { text, disabled };
    };

    // ========================================================================
    // Renderização
    // ========================================================================

    if (error) return <div className={pageStyles.container}><h2>Erro</h2><p>{error}</p></div>;
    if (!aircraft || !user) return <div className={pageStyles.container}>Carregando...</div>;

    const associatedNames = engineers.filter(eng => aircraft.associatedEngineers.includes(eng.id)).map(eng => eng.name).join(', ') || 'Nenhum';

    return (
        <div className={pageStyles.container}>
            <header className={pageStyles.header}>
                <h1>✈️ Detalhes: {aircraft.model} ({aircraft.id})</h1>
                <button onClick={() => navigate('/aeronaves')} className={pageStyles.actionButton} style={{ backgroundColor: '#6c757d' }}>Voltar</button>
            </header>

            <div className={pageStyles.permissionBar}>
                <span>{permissions.canEditDetails ? '✅ Você pode editar este projeto.' : '🔒 Acesso apenas para visualização.'}</span>
                {permissions.canEditDetails &&
                    <div>
                        <button onClick={handleGenerateReport} className={pageStyles.actionButton} style={{ backgroundColor: '#17a2b8', marginRight: '10px' }}>Gerar Relatório</button>
                        <button onClick={() => setIsEditing(true)} className={pageStyles.editButton} disabled={isEditing}>Habilitar Edição</button>
                    </div>
                }
            </div>

            <main className={pageStyles.detailsGrid}>
                <section className={pageStyles.card}>
                    <h2>Informações Principais</h2>
                    <p><strong>Modelo:</strong> {aircraft.model}</p>
                    <p><strong>Status:</strong> <span className={pageStyles.statusBadge}>{aircraft.status}</span></p>
                    <p><strong>Engenheiros:</strong> {associatedNames}</p>
                </section>
                {isEditing &&
                    <form onSubmit={handleSaveDetails} className={pageStyles.editForm}>
                        <h2>✏️ Editar Detalhes</h2>
                        <label className={pageStyles.label}>Modelo:</label>
                        <input name="model" value={editData.model || ''} onChange={handleDetailsInputChange} className={pageStyles.input} />
                        <label className={pageStyles.label}>Status:</label>
                        <select name="status" value={editData.status || ''} onChange={handleDetailsInputChange} className={pageStyles.input}>
                            <option value="Pré-produção">Pré-produção</option>
                            <option value="Em Produção (Fase 1/6)">Fase 1: Estrutura</option>
                            <option value="Em Produção (Fase 3/6)">Fase 3: Montagem</option>
                            <option value="Testes Finais">Testes Finais</option>
                            <option value="Concluído / Entregue">Concluído / Entregue</option>
                        </select>
                        <div className={modalStyles.modalActions}>
                            <button type="button" onClick={() => setIsEditing(false)} style={{ backgroundColor: '#6c757d', color: 'white' }}>Cancelar</button>
                            <button type="submit">Salvar</button>
                        </div>
                    </form>
                }
            </main>

            <section className={pageStyles.tasksSection}>
                <div className={pageStyles.tasksHeader}>
                    <h2>📋 Tarefas ({tasksList.length})</h2>
                    {permissions.canCreateTasks && <button onClick={() => setIsTaskModalOpen(true)} className={pageStyles.actionButton} style={{ backgroundColor: '#007bff' }}>+ Adicionar Tarefa</button>}
                </div>
                <table className={pageStyles.taskTable}>
                    <thead>
                        <tr>
                            <th className={pageStyles.th}>ID</th>
                            <th className={pageStyles.th}>Descrição</th>
                            <th className={pageStyles.th}>Responsável</th>
                            <th className={pageStyles.th}>Prazo</th>
                            <th className={pageStyles.th}>Status</th>
                            <th className={pageStyles.th}>Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasksList.map(task => {
                            const { text, disabled } = getTaskActionProps(task);
                            return (
                                <tr key={task.id} className={pageStyles.tr}>
                                    <td className={pageStyles.td}>{task.id}</td>
                                    <td className={pageStyles.td}>{task.description}</td>
                                    <td className={pageStyles.td}>{task.responsibleUserName}</td>
                                    <td className={pageStyles.td}>{task.dueDate}</td>
                                    <td className={`${pageStyles.td} ${pageStyles[task.status.replace(/ /g, '')]}`}>{task.status}</td>
                                    <td className={pageStyles.td}><button onClick={() => handleUpdateTaskStatus(task)} className={pageStyles.taskActionButton} disabled={disabled}>{text}</button></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </section>

            <section className={pageStyles.tasksSection}>
                <div className={pageStyles.tasksHeader}>
                    <h2>🔩 Peças ({partsList.length})</h2>
                    {permissions.canEditDetails && <button onClick={() => setIsPartModalOpen(true)} className={pageStyles.actionButton}>+ Adicionar Peça</button>}
                </div>
                <PartsList parts={partsList} canManage={permissions.canEditDetails} onUpdateStatus={handleUpdatePartStatus} />
            </section>

            <section className={pageStyles.tasksSection}>
                <div className={pageStyles.tasksHeader}>
                    <h2>🔬 Testes ({testsList.length})</h2>
                    {permissions.canEditDetails && <button onClick={() => setIsTestModalOpen(true)} className={pageStyles.actionButton}>+ Registrar Teste</button>}
                </div>
                <TestsList tests={testsList} />
            </section>

            {isTaskModalOpen &&
                <div className={modalStyles.modalOverlay}>
                    <form onSubmit={handleCreateTask} className={modalStyles.modalContent}>
                        <h3>Criar Nova Tarefa</h3>
                        <label className={modalStyles.label}>Descrição:</label>
                        <input name="description" placeholder="Descrição da Tarefa" value={newTaskForm.description} onChange={e => setNewTaskForm(p => ({ ...p, description: e.target.value }))} required className={modalStyles.input} />
                        <label className={modalStyles.label}>Prazo:</label>
                        <input name="dueDate" type="date" value={newTaskForm.dueDate} onChange={e => setNewTaskForm(p => ({ ...p, dueDate: e.target.value }))} required className={modalStyles.input} />
                        <label className={modalStyles.label}>Responsável:</label>
                        <select value={newTaskForm.responsibleUserId || ''} onChange={e => setNewTaskForm(p => ({ ...p, responsibleUserId: Number(e.target.value) || null }))} className={modalStyles.input}>
                            <option value="">Equipe Geral</option>
                            {possibleAssignees.map(u => <option key={u.id} value={u.id}>{u.name} ({u.levelName})</option>)}
                        </select>
                        <div className={modalStyles.modalActions}>
                            <button type="button" onClick={() => setIsTaskModalOpen(false)} style={{ backgroundColor: '#6c757d', color: 'white' }}>Cancelar</button>
                            <button type="submit">Criar</button>
                        </div>
                    </form>
                </div>
            }
            <AddPartModal isOpen={isPartModalOpen} onClose={() => setIsPartModalOpen(false)} onSubmit={handleAddPart} />
            <RecordTestModal isOpen={isTestModalOpen} onClose={() => setIsTestModalOpen(false)} onSubmit={handleRecordTest} />
        </div>
    );
}

export default AircraftDetailPage;