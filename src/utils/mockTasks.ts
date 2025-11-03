import { type Task, type TaskStatus } from '../types/TaskTypes';


// ========================================================================
// Dados Mockados (Simulação de Banco de Dados)
// ========================================================================

const mockTasksData: Task[] = [
    {
        id: 101,
        aircraftId: 'A-123',
        description: 'Verificação da fuselagem principal (Fase 1/6)',
        responsibleUserId: 3,
        responsibleUserName: 'Operador de Montagem',
        dueDate: '2025-11-15',
        status: 'Pendente',
        creationDate: '2025-10-28',
        completionDate: null,
    },
    {
        id: 102,
        aircraftId: 'A-123',
        description: 'Instalação do motor 1 (Engenharia Elétrica)',
        responsibleUserId: 2,
        responsibleUserName: 'Engenheiro Chefe',
        dueDate: '2025-11-30',
        status: 'Em Andamento',
        creationDate: '2025-10-25',
        completionDate: null,
    },
    {
        id: 103,
        aircraftId: 'B-456',
        description: 'Inspeção de qualidade do trem de pouso',
        responsibleUserId: null,
        responsibleUserName: 'Equipe de QA',
        dueDate: '2025-11-10',
        status: 'Concluída',
        creationDate: '2025-10-20',
        completionDate: '2025-11-05',
    },
];

// ========================================================================
// Funções de Acesso e Manipulação de Dados
// ========================================================================

/**
 * Retorna todas as tarefas cadastradas no sistema.
 */
export const getAllTasks = (): Task[] => {
    return mockTasksData;
};

/**
 * Retorna todas as tarefas associadas a um ID de aeronave específico.
 */
export const getTasksByAircraftId = (aircraftId: string): Task[] => {
    return mockTasksData.filter(task => task.aircraftId === aircraftId);
};

/**
 * Cria uma nova tarefa e a adiciona à lista de dados.
 */
export const createNewTask = (
    aircraftId: string,
    description: string,
    responsibleUserId: number | null,
    responsibleUserName: string,
    dueDate: string,
): Task => {
    const newId = Math.max(...mockTasksData.map(t => t.id), 0) + 1;
    const newTask: Task = {
        id: newId,
        aircraftId,
        description,
        responsibleUserId,
        responsibleUserName,
        dueDate,
        status: 'Pendente',
        creationDate: new Date().toISOString().split('T')[0],
        completionDate: null,
    };
    mockTasksData.push(newTask);
    return newTask;
};

/**
 * Atualiza o status de uma tarefa e a data de conclusão, se aplicável.
 */
export const updateTaskStatus = (taskId: number, newStatus: TaskStatus): Task | undefined => {
    const taskIndex = mockTasksData.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        const task = mockTasksData[taskIndex];
        const isNowCompleted = newStatus === 'Concluída';

        // Atualiza a data de conclusão apenas quando a tarefa é finalizada pela primeira vez.
        // Se for reaberta e finalizada de novo, a data de conclusão é atualizada.
        task.completionDate = isNowCompleted ? new Date().toISOString().split('T')[0] : null;
        task.status = newStatus;

        return { ...task };
    }
    return undefined;
};