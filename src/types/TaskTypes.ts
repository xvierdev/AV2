// src/types/TaskTypes.ts (VERSÃO FINAL COMPLETA)

export type TaskStatus = 'Pendente' | 'Em Andamento' | 'Concluída';

export interface Task {
    id: number;
    aircraftId: string;
    description: string;
    status: TaskStatus;
    responsibleUserId: number | null; // ID do usuário responsável (ou null para equipe geral)
    responsibleUserName: string;
    dueDate: string; // Data string YYYY-MM-DD

    // 💡 CORREÇÃO NECESSÁRIA: Adicionando a data de criação
    creationDate: string; // Data string YYYY-MM-DD

    // O completionDate é opcional (pode ser null se a tarefa não estiver concluída)
    completionDate: string | null;
}