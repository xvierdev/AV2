// src/types/TaskTypes.ts

export type TaskStatus = 'Pendente' | 'Em Andamento' | 'Concluída';

export interface Task {
    id: number;
    aircraftId: string;
    description: string;
    status: TaskStatus;

    // 💡 MUDANÇA PRINCIPAL: De um para muitos responsáveis
    responsibleUserIds: number[];
    responsibleUserNames: string[]; // Para facilitar a exibição

    dueDate: string;
    creationDate: string;
    completionDate: string | null;
}

// 💡 ATUALIZAÇÃO: O tipo para criação também muda
export type NewTaskData = Pick<Task, 'description' | 'responsibleUserIds' | 'dueDate'>;