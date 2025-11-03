/**
 * Define os tipos de testes que podem ser realizados em uma aeronave.
 */
export type TestType = 'Elétrico' | 'Hidráulico' | 'Aerodinâmico';

/**
 * Define os possíveis resultados de um teste.
 */
export type TestResult = 'Aprovado' | 'Reprovado';

/**
 * Define a estrutura principal de dados para um registro de teste no sistema.
 */
export interface Test {
    id: number;
    aircraftId: string;
    type: TestType;
    result: TestResult;
    datePerformed: string;
    notes?: string;
}

/**
 * Define o tipo de dados para a criação de um novo registro de teste,
 * omitindo campos que são gerados automaticamente pelo sistema.
 */
export type NewTestData = Omit<Test, 'id' | 'aircraftId' | 'datePerformed'>;