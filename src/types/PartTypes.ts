// Define os possíveis status de uma peça, conforme o escopo do projeto.
export type PartStatus = 'Em Produção' | 'Em Transporte' | 'Pronta para Uso';

// Define os tipos de peça.
export type PartType = 'Nacional' | 'Importada';

// A interface principal para um objeto Peça (Part)
export interface Part {
    id: number;
    aircraftId: string; // ID da aeronave à qual a peça pertence
    name: string;       // Nome da peça (ex: "Turbina Rolls-Royce Trent 7000")
    type: PartType;     // Nacional ou Importada
    supplier: string;   // Fornecedor (ex: "Rolls-Royce")
    status: PartStatus; // O status atual da peça
}

// Tipo de dado para o formulário de criação de uma nova peça.
// Omitimos 'id' e 'aircraftId' pois serão gerados/fornecidos automaticamente.
export type NewPartData = Omit<Part, 'id' | 'aircraftId'>;