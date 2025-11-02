// src/utils/mockTasks.ts
import { type Task, type TaskStatus } from '../types/TaskTypes';

// Lista de tarefas simuladas
export const mockTasks: Task[] = [
    {
        id: 101,
        aircraftId: 'A-123',
        description: 'Verificação da fuselagem principal (Fase 1/6)',
        responsibleUserId: 3, // Operador (op/123)
        responsibleUserName: 'Operador de Montagem',
        dueDate: '2025-11-15',
        status: 'Pendente',
        creationDate: new Date().toISOString().split('T')[0],
        completionDate: null,
    },
    {
        id: 102,
        aircraftId: 'A-123',
        description: 'Instalação do motor 1 (Engenharia Elétrica)',
        responsibleUserId: 2, // Engenheiro (eng/123)
        responsibleUserName: 'Engenheiro Chefe',
        dueDate: '2025-11-30',
        status: 'Em Andamento',
        creationDate: new Date().toISOString().split('T')[0],
        completionDate: null,
    },
    {
        id: 103,
        aircraftId: 'B-456',
        description: 'Inspeção de qualidade do trem de pouso',
        responsibleUserId: null, // Tarefa geral (Admin pode gerenciar)
        responsibleUserName: 'Equipe de QA',
        dueDate: '2025-11-10',
        status: 'Concluída',
        creationDate: new Date().toISOString().split('T')[0],
        completionDate: '2025-11-05',
    },
];

/**
 * 🎁 CORREÇÃO: Função Faltante para buscar TODAS as tarefas.
 */
export const getAllTasks = (): Task[] => {
    return mockTasks;
};

/**
 * Obtém todas as tarefas associadas a uma aeronave específica.
 */
export const getTasksByAircraftId = (aircraftId: string): Task[] => {
    return mockTasks.filter(task => task.aircraftId === aircraftId);
};

/**
 * Simula a atualização do status de uma tarefa.
 */
export const updateTaskStatus = (taskId: number, newStatus: TaskStatus): Task | undefined => {
    const taskIndex = mockTasks.findIndex(t => t.id === taskId);

    if (taskIndex !== -1) {
        // A data de conclusão é registrada apenas se o status mudar para 'Concluída'
        const completionDate = newStatus === 'Concluída'
            ? new Date().toISOString().split('T')[0]
            : (newStatus === 'Pendente' ? null : mockTasks[taskIndex].completionDate); // Mantém a data se for 'Em Andamento', ou limpa se for 'Pendente'

        mockTasks[taskIndex] = {
            ...mockTasks[taskIndex],
            status: newStatus,
            completionDate: completionDate,
        };

        return mockTasks[taskIndex];
    }
    return undefined;
};

/**
 * Simula a criação de uma nova tarefa.
 */
export const createNewTask = (
    aircraftId: string,
    description: string,
    responsibleUserId: number | null,
    responsibleUserName: string,
    dueDate: string,
): Task => {
    // Simulação: Gera um novo ID
    const newId = Math.max(...mockTasks.map(t => t.id), 100) + 1;

    const newTask: Task = {
        id: newId,
        aircraftId: aircraftId,
        description: description,
        responsibleUserId: responsibleUserId,
        responsibleUserName: responsibleUserName,
        dueDate: dueDate,
        status: 'Pendente',
        creationDate: new Date().toISOString().split('T')[0], // Adicionando data de criação
        completionDate: null,
    };

    mockTasks.push(newTask);
    return newTask;
};