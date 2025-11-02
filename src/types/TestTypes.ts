// Define os tipos de testes que podem ser executados.
export type TestType = 'Elétrico' | 'Hidráulico' | 'Aerodinâmico';

// Define os possíveis resultados de um teste.
export type TestResult = 'Aprovado' | 'Reprovado';

// A interface principal para um registro de Teste
export interface Test {
    id: number;
    aircraftId: string;   // ID da aeronave onde o teste foi realizado
    type: TestType;       // O tipo de teste
    result: TestResult;   // O resultado do teste
    datePerformed: string; // Data no formato YYYY-MM-DD
    notes?: string;       // Notas opcionais do engenheiro
}

// Tipo de dado para o formulário de registro de um novo teste.
// Omitimos 'id', 'aircraftId', e 'datePerformed' pois serão gerados automaticamente.
export type NewTestData = Omit<Test, 'id' | 'aircraftId' | 'datePerformed'>;