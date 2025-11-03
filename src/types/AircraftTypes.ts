/**
 * Define os possíveis status de uma aeronave durante seu ciclo de produção.
 */
export type AircraftStatus =
    'Pré-produção' |
    'Em Produção (Fase 1/6)' |
    'Em Produção (Fase 3/6)' |
    'Testes Finais' |
    'Concluído / Entregue';

/**
 * Define a estrutura principal de dados para uma aeronave no sistema.
 */
export interface Aircraft {
    id: string;
    model: string;
    type: string;
    capacity: number;
    range: number;
    clientName?: string;
    deliveryDeadline?: string;
    status: AircraftStatus;
    associatedEngineers: number[];
    createdBy: number;
}

/**
 * Estende a interface `Aircraft` adicionando uma flag de permissão
 * para facilitar a renderização condicional na UI.
 */
export interface AircraftWithPermission extends Aircraft {
    canEdit: boolean;
}

/**
 * Define o tipo de dados para a criação de uma nova aeronave,
 * omitindo campos que são gerados automaticamente pelo sistema.
 */
export type NewAircraftData = Omit<Aircraft, 'id' | 'status' | 'createdBy'>;

/**
 * Define o tipo para os dados de edição de uma aeronave,
 * tornando todas as suas propriedades opcionais.
 */
export type EditableAircraftData = Partial<Aircraft>;