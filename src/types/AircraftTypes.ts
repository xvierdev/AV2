export type AircraftStatus =
    'Pré-produção' |
    'Em Produção (Fase 1/6)' |
    'Em Produção (Fase 3/6)' |
    'Testes Finais' |
    'Concluído / Entregue';

// 1. ATUALIZAÇÃO DA INTERFACE PRINCIPAL
export interface Aircraft {
    id: string;
    model: string;
    type: string; // Pode ser 'Comercial', 'Militar'
    capacity: number;
    range: number;
    clientName?: string;
    deliveryDeadline?: string;
    status: AircraftStatus;
    associatedEngineers: number[];
    createdBy: number; // ID do admin que criou o projeto
}

export interface AircraftWithPermission extends Aircraft {
    canEdit: boolean;
}

// 2. TIPO NewAircraftData CORRIGIDO
// Usamos Omit para remover os campos que serão gerados automaticamente.
// Isso garante que todos os outros campos de 'Aircraft' sejam herdados corretamente.
export type NewAircraftData = Omit<Aircraft, 'id' | 'status' | 'createdBy'>;
export type EditableAircraftData = Partial<Aircraft>;