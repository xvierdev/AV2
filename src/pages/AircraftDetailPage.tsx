import { useState, useEffect, type FormEvent, type ChangeEvent, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getAircraftById, updateAircraftDetails } from '../utils/mockAircrafts';
import { getAllUsers } from '../utils/mockUsers'; // Para lista de engenheiros
import type { Aircraft } from '../types/AircraftTypes';
import type { User } from '../types/UserTypes';
import pageStyles from './AircraftDetailPage.module.css';
import { getTasksByAircraftId, updateTaskStatus, createNewTask } from '../utils/mockTasks';
import type { Task, TaskStatus } from '../types/TaskTypes';

// Tipo para os dados de edição, aceita parcial para facilitar a manipulação do estado
type EditableAircraftData = Partial<Aircraft>;

function AircraftDetailPage() {
    // 1. CHAME TODOS OS HOOKS NO TOPO E NA MESMA ORDEM!
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, logout, USER_LEVELS } = useAuth(); // useAuth é um Hook

    const [aircraft, setAircraft] = useState<Aircraft | null>(null); // useState é um Hook
    const [editData, setEditData] = useState<EditableAircraftData>({});
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tasksList, setTasksList] = useState<Task[]>([]);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [newTaskForm, setNewTaskForm] = useState({
        description: '',
        responsibleUserId: null as number | null,
        dueDate: new Date().toISOString().split('T')[0],
    });

    // 2. LÓGICA E HOOKS DEPENDENTES DE ESTADO

    // Lista de Engenheiros e Users (Pode ser carregada aqui, se getAllUsers for pura)
    const allUsers = getAllUsers() as User[];
    const engineers = allUsers.filter(u => u.level === USER_LEVELS.ENGINEER);

    // Filtra apenas usuários que podem ser responsáveis (useMemo é um Hook)
    const possibleAssignees = useMemo(() => {
        return allUsers.filter(u => u.level === USER_LEVELS.ENGINEER || u.level === USER_LEVELS.OPERATOR);
    }, [USER_LEVELS.ENGINEER, USER_LEVELS.OPERATOR, allUsers]);

    // --- Lógica de Permissão de Edição ---
    // Agora 'user' é usado APÓS a chamada dos Hooks, mas antes dos retornos condicionais
    const isAdmin = user?.level === USER_LEVELS.ADMIN; // Usamos o encadeamento opcional para segurança
    const isAssociatedEngineer = aircraft?.associatedEngineers.includes(user?.id ?? 0) ?? false; // Usamos o encadeamento opcional para segurança

    // Flag principal: Se o usuário pode ver a seção de edição
    const canEdit = isAdmin || isAssociatedEngineer;

    // Efeito para carregar os dados da aeronave (useEffect é um Hook)
    useEffect(() => {
        if (!id) {
            setError("ID da Aeronave não fornecido.");
            return;
        }

        const foundAircraft = getAircraftById(id);

        if (!foundAircraft) {
            setError(`Aeronave com ID ${id} não encontrada.`);
        } else {
            setAircraft(foundAircraft);
            // Preenche o formulário de edição com os dados atuais
            setEditData(foundAircraft);
            // Carrega as tarefas
            setTasksList(getTasksByAircraftId(id!));
        }
    }, [id]);

    // 3. RETORNOS CONDICIONAIS DE RENDERIZAÇÃO (PODE OCORRER DEPOIS DE TODOS OS HOOKS)

    // 🟢 MOVIDO PARA DEPOIS DE TODOS OS HOOKS: Verifica se o usuário é nulo (apesar da rota protegida)
    if (!user) {
        return <div className={pageStyles.container} style={{ textAlign: 'center' }}>Acesso negado ou carregando...</div>;
    }

    if (error) {
        return <div className={pageStyles.container} style={{ textAlign: 'center', color: '#dc3545' }}>
            <h2>Erro de Carregamento</h2>
            <p>{error}</p>
            <button onClick={() => navigate('/aeronaves')} className={pageStyles.backButton}>Voltar para Aeronaves</button>
        </div>
    }

    if (!aircraft) {
        return <div className={pageStyles.container}>Carregando detalhes...</div>;
    }


    // Lógica para carregar os dados no formulário
    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        let processedValue: string | number | number[] = value;

        // Converte para número se for capacidade ou alcance
        if (name === 'capacity' || name === 'range') {
            processedValue = Number(value);
        }

        // Lógica especial para associar engenheiros (Assume que o <select multiple> ou similar será implementado)
        // Por enquanto, trataremos como um array simples de IDs (se a entrada for uma string de IDs separados por vírgula)
        if (name === 'associatedEngineers' && typeof value === 'string') {
            const ids = value.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n) && n > 0);
            processedValue = ids;
        }

        setEditData(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleSave = (e: FormEvent) => {
        e.preventDefault();

        if (!id || !canEdit || !aircraft) return;

        // Remove campos indesejados e garante que os tipos estão corretos (ex: range e capacity como number)
        const dataToUpdate: Partial<Aircraft> = {
            model: editData.model,
            type: editData.type,
            capacity: Number(editData.capacity),
            range: Number(editData.range),
            clientName: editData.clientName,
            deliveryDeadline: editData.deliveryDeadline,
            status: editData.status,
            // Certifica-se que associatedEngineers é um array de números (necessário para o mock)
            associatedEngineers: Array.isArray(editData.associatedEngineers)
                ? editData.associatedEngineers
                : (aircraft.associatedEngineers || []),
        };

        const updatedAircraft = updateAircraftDetails(id, dataToUpdate);

        if (updatedAircraft) {
            setAircraft(updatedAircraft);
            setEditData(updatedAircraft); // Atualiza o estado de edição
            setIsEditing(false);
            alert(`Aeronave ${id} atualizada com sucesso!`);
        } else {
            alert("Erro ao salvar. Aeronave não encontrada.");
        }
    };

    const handleTaskInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNewTaskForm(prev => ({
            ...prev,
            [name]: name === 'responsibleUserId' ? Number(value) : value
        }));
    };

    const handleCreateTask = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!newTaskForm.description || !newTaskForm.dueDate || !id) return;

        const responsibleUser = allUsers.find(u => u.id === newTaskForm.responsibleUserId);

        if (!responsibleUser && newTaskForm.responsibleUserId !== null) {
            alert("Usuário responsável não encontrado.");
            return;
        }

        try {
            const addedTask = createNewTask(
                id,
                newTaskForm.description,
                newTaskForm.responsibleUserId,
                responsibleUser ? responsibleUser.name : 'Equipe Geral',
                newTaskForm.dueDate
            );

            // Atualiza a lista e fecha o modal
            setTasksList(prev => [...prev, addedTask]);
            setIsTaskModalOpen(false);
            setNewTaskForm({ // Reseta o formulário
                description: '',
                responsibleUserId: null,
                dueDate: new Date().toISOString().split('T')[0],
            });
            alert(`Tarefa #${addedTask.id} criada com sucesso!`);

        } catch (error) {
            console.error("Erro ao criar tarefa:", error);
            alert("Erro ao criar tarefa. Tente novamente.");
        }
    };

    const handleToggleTaskStatus = (taskId: number, currentStatus: TaskStatus) => {
        // Agora 'user' não é null aqui, graças ao retorno condicional acima.

        const taskToUpdate = tasksList.find(t => t.id === taskId);
        if (!taskToUpdate) return;

        // 1. Permissão para alterar status
        const isResponsible = taskToUpdate.responsibleUserId === user.id || taskToUpdate.responsibleUserId === null;

        // Admin e Engenheiro Associado podem alterar qualquer tarefa
        const canManage = canEdit;

        if (!canManage && !isResponsible) {
            alert("Você não tem permissão para alterar o status desta tarefa.");
            return;
        }

        // 2. Determinar o próximo status (simples: Pendente -> Concluída)
        const newStatus: TaskStatus = currentStatus === 'Pendente' ? 'Concluída' : 'Pendente';

        // Se for Concluída, só permita voltar para Pendente se for Admin/Engenheiro Associado
        if (currentStatus === 'Concluída' && !canManage) {
            alert("Apenas Engenheiros Associados ou Administradores podem reabrir tarefas concluídas.");
            return;
        }

        const updatedTask = updateTaskStatus(taskId, newStatus);

        if (updatedTask) {
            setTasksList(prev => prev.map(t => t.id === taskId ? updatedTask : t));
            alert(`Status da Tarefa #${taskId} alterado para: ${newStatus}`);
        } else {
            alert("Erro ao atualizar status da tarefa.");
        }
    };

    // Filtra o nome dos engenheiros associados para exibição
    const associatedNames = engineers
        .filter(eng => aircraft.associatedEngineers.includes(eng.id))
        .map(eng => eng.name)
        .join(', ');

    return (
        <div className={pageStyles.container}>
            <header className={pageStyles.header}>
                <h1>✈️ Detalhes do Projeto: {aircraft.model} ({aircraft.id})</h1>
                <div className={pageStyles.userInfo}>
                    <span className={pageStyles.userRole}>Nível: **{user.levelName}**</span>
                    <button onClick={() => navigate('/aeronaves')} className={pageStyles.actionButton} style={{ backgroundColor: '#6c757d' }}>
                        Voltar para Aeronaves
                    </button>
                    <button onClick={() => logout()} className={pageStyles.logoutButton}>Sair</button>
                </div>
            </header>

            {/* Seção de Permissão e Edição */}
            <div className={pageStyles.permissionBar}>
                {canEdit ? (
                    <>
                        <span className={pageStyles.editTag} style={{ backgroundColor: '#28a745' }}>✅ Você pode editar este projeto.</span>
                        <button
                            onClick={() => setIsEditing(true)}
                            className={pageStyles.editButton}
                            disabled={isEditing}
                        >
                            {isEditing ? 'Modo Edição ON' : 'Habilitar Edição'}
                        </button>
                    </>
                ) : (
                    <span className={pageStyles.editTag}>Acesso apenas para visualização.</span>
                )}
            </div>

            <main className={pageStyles.detailsGrid}>
                {/* Visualização de Detalhes */}
                <section className={pageStyles.card}>
                    <h2>Informações Principais</h2>
                    <p><strong>Modelo:</strong> {aircraft.model}</p>
                    <p><strong>Tipo:</strong> {aircraft.type}</p>
                    <p><strong>Capacidade:</strong> {aircraft.capacity} pessoas</p>
                    <p><strong>Alcance (km):</strong> {aircraft.range} km</p>
                    <p><strong>Cliente:</strong> {aircraft.clientName || 'N/A'}</p>
                    <p><strong>Entrega Estimada:</strong> {aircraft.deliveryDeadline || 'Não Definido'}</p>
                    <p><strong>Status Atual:</strong> <span className={pageStyles.statusBadge}>{aircraft.status}</span></p>
                    <p>
                        <strong>Engenheiros Associados (IDs):</strong>
                        <br />
                        <span style={{ fontWeight: 'normal' }}>{associatedNames}</span>
                    </p>
                </section>

                {/* Formulário de Edição (Apenas se canEdit e isEditing forem TRUE) */}
                {canEdit && isEditing && (
                    <form onSubmit={handleSave} className={pageStyles.editForm}>
                        <h2>✏️ Editar Detalhes</h2>
                        <label className={pageStyles.label}>Modelo:</label>
                        <input name="model" value={editData.model || ''} onChange={handleInputChange} className={pageStyles.input} required />

                        <label className={pageStyles.label}>Status:</label>
                        <select name="status" value={editData.status || ''} onChange={handleInputChange as never} className={pageStyles.input} required>
                            <option value="Em Produção (Fase 1/6)">Fase 1: Estrutura</option>
                            <option value="Em Produção (Fase 3/6)">Fase 3: Montagem</option>
                            <option value="Testes Finais">Testes Finais</option>
                            <option value="Concluído / Entregue">Concluído / Entregue</option>
                        </select>

                        <label className={pageStyles.label}>Prazo de Entrega:</label>
                        <input name="deliveryDeadline" type="date" value={editData.deliveryDeadline || ''} onChange={handleInputChange} className={pageStyles.input} />

                        {/* Campo de Associação de Engenheiros (Simplificado para input de IDs) */}
                        <label className={pageStyles.label}>
                            Associação de Engenheiros (IDs, separados por vírgula):
                        </label>
                        <input
                            name="associatedEngineers"
                            value={Array.isArray(editData.associatedEngineers) ? editData.associatedEngineers.join(', ') : ''}
                            onChange={handleInputChange}
                            className={pageStyles.input}
                            placeholder="Ex: 2, 4, 5"
                        />

                        <div className={pageStyles.modalActions}>
                            <button type="button" onClick={() => setIsEditing(false)} className={pageStyles.actionButton} style={{ backgroundColor: '#6c757d' }}>
                                Cancelar Edição
                            </button>
                            <button type="submit" className={pageStyles.actionButton}>
                                Salvar Alterações
                            </button>
                        </div>
                    </form>
                )}
            </main>
            {/* NOVO: SEÇÃO DE GERENCIAMENTO DE TAREFAS */}
            <section className={pageStyles.tasksSection}>
                <div className={pageStyles.tasksHeader}>
                    <h2>📋 Etapas de Produção / Tarefas ({tasksList.length})</h2>
                    {canEdit && ( // Permissão para adicionar tarefas
                        <button onClick={() => setIsTaskModalOpen(true)} className={pageStyles.actionButton} style={{ backgroundColor: '#007bff' }}>
                            + Adicionar Tarefa
                        </button>
                    )}
                </div>

                {/* Tabela de Tarefas */}
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
                        {tasksList.map(task => (
                            <tr key={task.id} className={pageStyles.tr}>
                                <td className={pageStyles.td}>{task.id}</td>
                                <td className={pageStyles.td}>{task.description}</td>
                                <td className={pageStyles.td}>{task.responsibleUserName}</td>
                                <td className={pageStyles.td}>{task.dueDate}</td>
                                <td className={pageStyles.td} style={{ color: task.status === 'Concluída' ? '#28a745' : task.status === 'Em Andamento' ? '#ffc107' : '#dc3545', fontWeight: 'bold' }}>
                                    {task.status}
                                </td>
                                <td className={pageStyles.td}>
                                    <button
                                        onClick={() => handleToggleTaskStatus(task.id, task.status)}
                                        className={pageStyles.taskActionButton}
                                        style={{
                                            backgroundColor: task.status === 'Pendente' ? '#28a745' : (task.status === 'Concluída' ? '#6c757d' : '#ffc107'),
                                            fontSize: '0.85em'
                                        }}
                                        disabled={user.level === USER_LEVELS.OPERATOR && task.responsibleUserId !== user.id && task.responsibleUserId !== null}
                                    >
                                        {task.status === 'Pendente' ? 'Marcar Concluída' : task.status === 'Concluída' ? 'Reabrir' : 'Progredir'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* NOVO: Modal de Criar Tarefa */}
            {isTaskModalOpen && (
                <div className={pageStyles.modalOverlay}>
                    <form onSubmit={handleCreateTask} className={pageStyles.modalContent}>
                        <h3>Criar Nova Tarefa para {aircraft.model}</h3>

                        <label className={pageStyles.label}>Descrição da Tarefa:</label>
                        <input name="description" required placeholder="Ex: Montagem da asa direita" onChange={handleTaskInputChange} className={pageStyles.input} />

                        <label className={pageStyles.label}>Prazo (Data):</label>
                        <input name="dueDate" type="date" value={newTaskForm.dueDate} onChange={handleTaskInputChange} className={pageStyles.input} required />

                        <label className={pageStyles.label}>Responsável:</label>
                        <select name="responsibleUserId" onChange={handleTaskInputChange} value={newTaskForm.responsibleUserId || ''} className={pageStyles.input}>
                            <option value="">Equipe Geral (N/A)</option>
                            {possibleAssignees.map(u => (
                                <option key={u.id} value={u.id}>
                                    {u.name} ({u.levelName})
                                </option>
                            ))}
                        </select>
                        <p className={pageStyles.modalHint}>* A tarefa começa como **Pendente**.</p>

                        <div className={pageStyles.formActions}>
                            <button type="button" onClick={() => setIsTaskModalOpen(false)} className={pageStyles.actionButton} style={{ backgroundColor: '#6c757d' }}>Cancelar</button>
                            <button type="submit" className={pageStyles.actionButton}>Criar Tarefa</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default AircraftDetailPage;