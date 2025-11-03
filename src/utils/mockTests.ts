import type { Test, NewTestData } from '../types/TestTypes';


// ========================================================================
// Dados Mockados (Simulação de Banco de Dados)
// ========================================================================

// Variável para gerar IDs únicos para novos testes.
let nextTestId = 5;

const mockTestsData: Test[] = [
    // Testes para a Aeronave A320-001
    { id: 1, aircraftId: 'A320-001', type: 'Elétrico', result: 'Aprovado', datePerformed: '2025-10-20', notes: 'Sistemas de iluminação OK.' },
    { id: 2, aircraftId: 'A320-001', type: 'Hidráulico', result: 'Aprovado', datePerformed: '2025-10-22' },

    // Testes para a Aeronave E195-002
    { id: 3, aircraftId: 'E195-002', type: 'Elétrico', result: 'Aprovado', datePerformed: '2025-09-15' },
    { id: 4, aircraftId: 'E195-002', type: 'Aerodinâmico', result: 'Reprovado', datePerformed: '2025-09-18', notes: 'Detectada pequena vibração na asa direita.' },
];

// ========================================================================
// Funções de Acesso e Manipulação de Dados
// ========================================================================

/**
 * Retorna todos os testes associados a um ID de aeronave específico.
 */
export const getTestsByAircraftId = (aircraftId: string): Test[] => {
    return mockTestsData.filter(test => test.aircraftId === aircraftId);
};

/**
 * Adiciona um novo registro de teste à lista de dados.
 */
export const recordNewTest = (aircraftId: string, testData: NewTestData): Test => {
    const newTest: Test = {
        id: nextTestId++,
        aircraftId,
        datePerformed: new Date().toISOString().split('T')[0],
        ...testData,
    };
    mockTestsData.push(newTest);
    console.log('Teste registrado:', newTest);
    return newTest;
};