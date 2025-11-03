/**
 * Define os possíveis status de uma peça em seu ciclo de suprimento.
 */
export type PartStatus = 'Em Produção' | 'Em Transporte' | 'Pronta para Uso';

/**
 * Define a origem de uma peça (nacional ou importada).
 */
export type PartType = 'Nacional' | 'Importada';

/**
 * Define a estrutura principal de dados para uma peça no sistema.
 */
export interface Part {
    id: number;
    aircraftId: string;
    name: string;
    type: PartType;
    supplier: string;
    status: PartStatus;
}

/**
 * Define o tipo de dados para a criação de uma nova peça,
 * omitindo campos que são gerados automaticamente pelo sistema.
 */
export type NewPartData = Omit<Part, 'id' | 'aircraftId'>;