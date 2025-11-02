import { generateAircraftReport } from '../utils/reportGenerator';
import { TestsList } from '../components/TestsList/TestsList';
import { RecordTestModal } from '../components/RecordTestModal/RecordTestModal';
import { getTestsByAircraftId, recordNewTest } from '../utils/mockTests';
import type { Test, NewTestData } from '../types/TestTypes';
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
import { PartsList } from '../components/PartsList/PartsList';
import { AddPartModal } from '../components/AddPartModal/AddPartModal';
import { getPartsByAircraftId, addPart, updatePartStatus } from '../utils/mockParts';
import type { Part, NewPartData, PartStatus } from '../types/PartTypes';

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
    // No corpo do componente AircraftDetailPage, logo após os useStates e antes dos useEffects.
    const permissions = useMemo(() => {
        // Caso base: se não houver usuário ou aeronave, não há permissões.
        if (!user || !aircraft) {
            return {
                canViewPage: false, // Pode ser útil para um bloqueio geral
                canEditDetails: false,
                canCreateTasks: false,
                canReopenTasks: false,
                isAdmin: false
            };
        }

        // Calcula as condições base uma única vez
        const isAdmin = user.level === USER_LEVELS.ADMIN;
        const isAssociatedEngineer = aircraft.associatedEngineers.includes(user.id);

        // Retorna o objeto de permissões completo
        return {
            canViewPage: true, // Se chegou até aqui, pode ver a página

            // Permissão para editar os detalhes da aeronave (modelo, status, etc.)
            canEditDetails: isAdmin || isAssociatedEngineer,

            // Permissão para criar e deletar tarefas
            canCreateTasks: isAdmin || isAssociatedEngineer,

            // Permissão para reabrir uma tarefa que já foi concluída
            canReopenTasks: isAdmin || isAssociatedEngineer,

            // Expõe a flag de admin para ações que são EXCLUSIVAS do admin
            isAdmin: isAdmin
        };
    }, [user, aircraft, USER_LEVELS]); // Dependências do useMemo
    const [partsList, setPartsList] = useState<Part[]>([]);
    const [isPartModalOpen, setIsPartModalOpen] = useState(false);
    const [testsList, setTestsList] = useState<Test[]>([]);
    const [isTestModalOpen, setIsTestModalOpen] = useState(false);

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
            setPartsList(getPartsByAircraftId(id!));
            setTestsList(getTestsByAircraftId(id!));
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

        if (!id || !permissions.canEditDetails || !aircraft) return;

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

    /**
     * @function handleToggleTaskStatus
     * @description Altera o status de uma tarefa com base nas permissões do usuário.
     * 
     * Regras de Negócio:
     * 1. Um Operador só pode alterar o status de tarefas que lhe foram atribuídas (ou tarefas 'gerais').
     * 2. Somente usuários com permissão 'canReopenTasks' (Admins/Engenheiros Associados) podem reabrir uma tarefa já 'Concluída'.
     * 3. O status alterna entre 'Pendente' e 'Concluída'. (Para este exemplo, não há o estado 'Em Andamento' na transição).
     */
    const handleToggleTaskStatus = (task: Task) => {
        // 💡 PASSO 1: Verificação de Segurança (o 'user' já foi validado no topo do componente, então não é nulo aqui)
        if (!user) return;

        // 💡 PASSO 2: Obter as condições específicas da tarefa
        // Verifica se o usuário logado é o responsável pela tarefa ou se a tarefa é "geral" (sem responsável)
        const isResponsible = task.responsibleUserId === user.id || task.responsibleUserId === null;

        // 💡 PASSO 3: Aplicar as regras de permissão (agora usando o objeto 'permissions')

        // Regra A: Bloqueia a reabertura de tarefas concluídas por usuários sem permissão.
        if (task.status === 'Concluída' && !permissions.canReopenTasks) {
            alert("Ação bloqueada: Apenas Engenheiros Associados ou Administradores podem reabrir uma tarefa concluída.");
            return;
        }

        // Regra B: Bloqueia Operadores que tentam alterar tarefas de outros.
        if (user.level === USER_LEVELS.OPERATOR && !isResponsible) {
            alert("Ação bloqueada: Você só pode alterar o status de tarefas que estão sob sua responsabilidade.");
            return;
        }

        // 💡 PASSO 4: Determinar o próximo estado da tarefa
        // A lógica de transição: se está 'Pendente', vai para 'Concluída'; senão, volta para 'Pendente'.
        const newStatus: TaskStatus = task.status === 'Pendente' ? 'Concluída' : 'Pendente';

        // 💡 PASSO 5: Chamar a função de atualização e atualizar a UI
        const updatedTask = updateTaskStatus(task.id, newStatus);

        if (updatedTask) {
            // Atualiza a lista de tarefas no estado do React para que a UI reflita a mudança instantaneamente.
            setTasksList(prevTasks =>
                prevTasks.map(t => (t.id === task.id ? updatedTask : t))
            );
            // (Opcional) Feedback ao usuário
            // alert(`Status da Tarefa #${task.id} alterado para: ${newStatus}`);
        } else {
            alert("Erro: Não foi possível atualizar o status da tarefa.");
            console.error(`Falha ao atualizar a tarefa com ID: ${task.id}`);
        }
    };

    const handleAddPart = (partData: NewPartData) => {
        if (!id) return;
        const newPart = addPart(id, partData);
        setPartsList(prev => [...prev, newPart]);
        setIsPartModalOpen(false);
        alert(`Peça "${newPart.name}" adicionada com sucesso!`);
    };

    const handleUpdatePartStatus = (partId: number, newStatus: PartStatus) => {
        const updatedPart = updatePartStatus(partId, newStatus);
        if (updatedPart) {
            setPartsList(prev => prev.map(p => p.id === partId ? updatedPart : p));
        }
    };


    const handleRecordTest = (testData: NewTestData) => {
        if (!id) return;
        const newTest = recordNewTest(id, testData);
        setTestsList(prev => [...prev, newTest]);
        setIsTestModalOpen(false);
        alert(`Teste de tipo "${newTest.type}" registrado com sucesso!`);
    };

    const handleGenerateReport = () => {
        // As guardas garantem que os dados não são nulos neste ponto
        if (!aircraft || !permissions.canEditDetails) {
            alert('Dados insuficientes ou permissão negada para gerar o relatório.');
            return;
        }

        // Gera o conteúdo do relatório
        const reportText = generateAircraftReport(aircraft, tasksList, partsList, testsList);

        // Cria um objeto "Blob" que representa o arquivo de texto
        const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });

        // Cria um link temporário na memória para acionar o download
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);

        // Define o nome do arquivo que será baixado
        const fileName = `Relatorio_Aeronave_${aircraft.id}_${new Date().toISOString().split('T')[0]}.txt`;
        link.download = fileName;

        // Adiciona o link ao corpo do documento (necessário para o Firefox)
        document.body.appendChild(link);

        // Simula um clique no link para iniciar o download
        link.click();

        // Remove o link temporário do documento
        document.body.removeChild(link);
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
                {permissions.canEditDetails ? (
                    <>
                        <span className={pageStyles.editTag} style={{ backgroundColor: '#28a745' }}>✅ Você pode editar este projeto.</span>
                        <div>
                            {/* BOTÃO NOVO AQUI */}
                            <button
                                onClick={handleGenerateReport}
                                className={pageStyles.actionButton}
                                style={{ backgroundColor: '#17a2b8', marginRight: '10px' }} // Cor ciano para diferenciar
                            >
                                📜 Gerar Relatório
                            </button>
                            <button
                                onClick={() => setIsEditing(true)}
                                className={pageStyles.editButton}
                                disabled={isEditing}
                            >
                                {isEditing ? 'Modo Edição ON' : 'Habilitar Edição'}
                            </button>
                        </div>
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
                {permissions.canEditDetails && isEditing && (
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
                    {permissions.canEditDetails && ( // Permissão para adicionar tarefas
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
                                        onClick={() => handleToggleTaskStatus(task)}
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

            {/* NOVA SEÇÃO DE PEÇAS */}
            <section className={pageStyles.tasksSection}> {/* Reutilizando o estilo */}
                <div className={pageStyles.tasksHeader}>
                    <h2>🔩 Peças e Componentes ({partsList.length})</h2>
                    {permissions.canEditDetails && (
                        <button onClick={() => setIsPartModalOpen(true)} className={pageStyles.actionButton}>
                            + Adicionar Peça
                        </button>
                    )}
                </div>
                <PartsList
                    parts={partsList}
                    canManage={permissions.canEditDetails}
                    onUpdateStatus={handleUpdatePartStatus}
                />
            </section>

            {/* NOVO MODAL DE PEÇAS */}
            <AddPartModal
                isOpen={isPartModalOpen}
                onClose={() => setIsPartModalOpen(false)}
                onSubmit={handleAddPart}
            />
            {/* NOVA SEÇÃO DE TESTES */}
            <section className={pageStyles.tasksSection}> {/* Reutilizando o estilo */}
                <div className={pageStyles.tasksHeader}>
                    <h2>🔬 Histórico de Testes ({testsList.length})</h2>
                    {permissions.canEditDetails && (
                        <button onClick={() => setIsTestModalOpen(true)} className={pageStyles.actionButton}>
                            + Registrar Teste
                        </button>
                    )}
                </div>
                <TestsList tests={testsList} />
            </section>

            {/* ... (Modal de Tarefas e Peças) ... */}

            {/* NOVO MODAL DE TESTES */}
            <RecordTestModal
                isOpen={isTestModalOpen}
                onClose={() => setIsTestModalOpen(false)}
                onSubmit={handleRecordTest}
            />
        </div >
    );
}

export default AircraftDetailPage;