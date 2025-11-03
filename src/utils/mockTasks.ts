import { type Task, type TaskStatus } from '../types/TaskTypes';
import { getAllUsers } from './mockUsers';

// ========================================================================
// Dados Mockados (Simulação de Banco de Dados)
// ========================================================================

const mockTasksData: Task[] = [
    {
        id: 101,
        aircraftId: 'A-123',
        description: 'Verificação da fuselagem principal',
        responsibleUserIds: [3],
        responsibleUserNames: ['Operador de Montagem'],
        dueDate: '2025-11-15',
        status: 'Pendente',
        creationDate: '2025-10-28',
        completionDate: null,
    },
    {
        id: 102,
        aircraftId: 'A-123',
        description: 'Instalação do sistema elétrico',
        responsibleUserIds: [2, 4],
        responsibleUserNames: ['Engenheiro Chefe', 'Joana Silva'],
        dueDate: '2025-11-30',
        status: 'Em Andamento',
        creationDate: '2025-10-25',
        completionDate: null,
    },
    {
        id: 103,
        aircraftId: 'B-456',
        description: 'Inspeção de qualidade do trem de pouso',
        responsibleUserIds: [],
        responsibleUserNames: [],
        dueDate: '2025-11-10',
        status: 'Concluída',
        creationDate: '2025-10-20',
        completionDate: '2025-11-05',
    },
];

// ========================================================================
// Funções de Leitura (Getters)
// ========================================================================

/**
 * Retorna todas as tarefas cadastradas no sistema.
 */
export const getAllTasks = (): Task[] => {
    return mockTasksData;
};

/**
 * 💡 FUNÇÃO CORRIGIDA: Retorna todas as tarefas de uma aeronave específica.
 */
export const getTasksByAircraftId = (aircraftId: string): Task[] => {
    return mockTasksData.filter(task => task.aircraftId === aircraftId);
};

// ========================================================================
// Funções de Criação e Atualização
// ========================================================================

/**
 * Cria uma nova tarefa e a adiciona à lista de dados.
 */
export const createNewTask = (aircraftId: string, description: string, responsibleUserIds: number[], dueDate: string): Task => {
    const allUsers = getAllUsers();
    const responsibleUserNames = allUsers.filter(u => responsibleUserIds.includes(u.id)).map(u => u.name);
    const newId = Math.max(...mockTasksData.map(t => t.id), 0) + 1;

    const newTask: Task = {
        id: newId, aircraftId, description, responsibleUserIds, responsibleUserNames, dueDate,
        status: 'Pendente', creationDate: new Date().toISOString().split('T')[0], completionDate: null,
    };
    mockTasksData.push(newTask);
    return newTask;
};

/**
 * 💡 FUNÇÃO CORRIGIDA: Atualiza o status de uma tarefa e a data de conclusão.
 */
export const updateTaskStatus = (taskId: number, newStatus: TaskStatus): Task | undefined => {
    const taskIndex = mockTasksData.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        const task = mockTasksData[taskIndex];
        task.status = newStatus;
        task.completionDate = (newStatus === 'Concluída') ? new Date().toISOString().split('T')[0] : null;
        return { ...task };
    }
    return undefined;
};

/**
 * Atualiza os dados de uma tarefa (descrição, prazo, responsáveis).
 */
export const updateTask = (taskId: number, updatedData: Partial<Pick<Task, 'description' | 'dueDate' | 'responsibleUserIds'>>): Task | null => {
    const taskIndex = mockTasksData.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return null;

    const task = mockTasksData[taskIndex];
    Object.assign(task, updatedData);

    if (updatedData.responsibleUserIds) {
        const allUsers = getAllUsers();
        task.responsibleUserNames = allUsers.filter(u => updatedData.responsibleUserIds!.includes(u.id)).map(u => u.name);
    }

    return { ...task };
};

// ========================================================================
// Funções de Exclusão
// ========================================================================

/**
 * Deleta uma tarefa do sistema.
 */
export const deleteTask = (taskId: number): boolean => {
    const taskIndex = mockTasksData.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        mockTasksData.splice(taskIndex, 1);
        return true;
    }
    return false;
};