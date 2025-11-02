// src/types/AircraftTypes.ts

// 💡 CORREÇÃO 1: Definindo e exportando o tipo 'AircraftStatus'
export type AircraftStatus =
    'Pré-produção' |
    'Em Produção (Fase 1/6)' |
    'Em Produção (Fase 3/6)' |
    'Testes Finais' |
    'Concluído / Entregue' |
    'Pendente de Engenheiro/Etapas'; // Status inicial usado no mock

export interface Aircraft {
    id: string;
    model: string;
    type: string;
    capacity: number;
    range: number;
    clientName?: string;
    deliveryDeadline?: string;

    // 💡 CORREÇÃO 2: Usando o tipo específico AircraftStatus
    status: AircraftStatus;

    associatedEngineers: number[];
}

export interface AircraftWithPermission extends Aircraft {
    canEdit: boolean; // Flag para facilitar a UI (True se Admin ou Engenheiro Associado)
}

export interface NewAircraftData {
    model: string;
    type: string;
    capacity: number;
    range: number;
    clientName?: string;
    deliveryDeadline?: string;
}