import type { Part, PartStatus, NewPartData } from '../types/PartTypes';


// ========================================================================
// Dados Mockados (Simulação de Banco de Dados)
// ========================================================================

// Variável para gerar IDs únicos para novas peças.
let nextPartId = 6;

const mockPartsData: Part[] = [
    // Peças para a Aeronave A320-001
    { id: 1, aircraftId: 'A320-001', name: 'Motor Esquerdo PW1100G', type: 'Importada', supplier: 'Pratt & Whitney', status: 'Pronta para Uso' },
    { id: 2, aircraftId: 'A320-001', name: 'Sistema de Navegação Honeywell', type: 'Importada', supplier: 'Honeywell', status: 'Em Transporte' },
    { id: 3, aircraftId: 'A320-001', name: 'Assentos Recaro SL3710', type: 'Nacional', supplier: 'Recaro Brasil', status: 'Em Produção' },

    // Peças para a Aeronave E195-002
    { id: 4, aircraftId: 'E195-002', name: 'Aviônicos Thales', type: 'Importada', supplier: 'Thales Group', status: 'Pronta para Uso' },
    { id: 5, aircraftId: 'E195-002', name: 'Estrutura da Fuselagem', type: 'Nacional', supplier: 'Embraer Aeroestruturas', status: 'Pronta para Uso' },
];

// ========================================================================
// Funções de Acesso e Manipulação de Dados
// ========================================================================

/**
 * Retorna todas as peças associadas a um ID de aeronave específico.
 */
export const getPartsByAircraftId = (aircraftId: string): Part[] => {
    return mockPartsData.filter(part => part.aircraftId === aircraftId);
};

/**
 * Adiciona uma nova peça à lista de dados da aeronave correspondente.
 */
export const addPart = (aircraftId: string, partData: NewPartData): Part => {
    const newPart: Part = {
        id: nextPartId++,
        aircraftId,
        ...partData,
    };
    mockPartsData.push(newPart);
    console.log('Peça adicionada:', newPart);
    return newPart;
};

/**
 * Atualiza o status de uma peça específica com base no seu ID.
 */
export const updatePartStatus = (partId: number, newStatus: PartStatus): Part | null => {
    const partIndex = mockPartsData.findIndex(p => p.id === partId);
    if (partIndex !== -1) {
        mockPartsData[partIndex].status = newStatus;
        return { ...mockPartsData[partIndex] };
    }
    return null;
};

/**
 * Deleta uma peça do sistema com base no seu ID.
 * @param partId - O ID da peça a ser deletada.
 * @returns true se a exclusão foi bem-sucedida, false caso contrário.
 */
export const deletePart = (partId: number): boolean => {
    const partIndex = mockPartsData.findIndex(p => p.id === partId);

    if (partIndex !== -1) {
        mockPartsData.splice(partIndex, 1);
        console.log(`Peça com ID ${partId} deletada.`);
        return true;
    }

    console.error(`Peça com ID ${partId} não encontrada para exclusão.`);
    return false;
};

/**
 * Atualiza os dados de uma peça existente (nome, fornecedor, tipo).
 * @param partId - O ID da peça a ser atualizada.
 * @param updatedData - Um objeto parcial com os novos dados.
 * @returns A peça atualizada ou null se não for encontrada.
 */
export const updatePart = (partId: number, updatedData: Partial<Omit<Part, 'id' | 'aircraftId'>>): Part | null => {
    const partIndex = mockPartsData.findIndex(p => p.id === partId);

    if (partIndex !== -1) {
        // Mescla os dados antigos com os novos dados fornecidos
        const part = mockPartsData[partIndex];
        Object.assign(part, updatedData);

        console.log(`Peça com ID ${partId} atualizada.`);
        return { ...part }; // Retorna uma cópia da peça atualizada
    }

    console.error(`Peça com ID ${partId} não encontrada para atualização.`);
    return null;
};