/**
 * Define os possíveis status de uma tarefa durante seu ciclo de vida.
 */
export type TaskStatus = 'Pendente' | 'Em Andamento' | 'Concluída';

/**
 * Define a estrutura principal de dados para uma tarefa no sistema.
 */
export interface Task {
    id: number;
    aircraftId: string;
    description: string;
    status: TaskStatus;
    responsibleUserId: number | null;
    responsibleUserName: string;
    dueDate: string;
    creationDate: string;
    completionDate: string | null;
}

/**
 * Define o tipo de dados para a criação de uma nova tarefa.
 */
export type NewTaskData = Pick<Task, 'description' | 'responsibleUserId' | 'dueDate'>;