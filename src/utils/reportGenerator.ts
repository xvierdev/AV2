import type { Aircraft } from '../types/AircraftTypes';
import type { Task } from '../types/TaskTypes';
import type { Part } from '../types/PartTypes';
import type { Test } from '../types/TestTypes';

/**
 * Formata os dados de uma aeronave, tarefas, peças e testes em uma string de texto legível.
 * @param aircraft - O objeto da aeronave.
 * @param tasks - A lista de tarefas associadas.
 * @param parts - A lista de peças associadas.
 * @param tests - A lista de testes associados.
 * @returns Uma string formatada pronta para ser salva em um arquivo.
 */
export const generateAircraftReport = (
    aircraft: Aircraft,
    tasks: Task[],
    parts: Part[],
    tests: Test[]
): string => {
    // Helper function para criar linhas com separadores
    const createSection = (title: string, content: string): string => {
        return `\n${'='.repeat(50)}\n${title.toUpperCase()}\n${'='.repeat(50)}\n${content}`;
    };

    // --- 1. Seção de Informações Principais ---
    const mainInfo = `
ID do Projeto:    ${aircraft.id}
Modelo:           ${aircraft.model}
Tipo:             ${aircraft.type}
Status Atual:     ${aircraft.status}
Cliente:          ${aircraft.clientName || 'N/A'}
Prazo de Entrega: ${aircraft.deliveryDeadline || 'Não definido'}
Capacidade:       ${aircraft.capacity} passageiros
Alcance:          ${aircraft.range} km
    `.trim();

    // --- 2. Seção de Tarefas ---
    const tasksInfo = tasks.length > 0
        ? tasks.map(task =>
            `  - [${task.status.padEnd(12)}] #${task.id}: ${task.description} (Responsável: ${task.responsibleUserName}, Prazo: ${task.dueDate})`
        ).join('\n')
        : 'Nenhuma tarefa registrada.';

    // --- 3. Seção de Peças ---
    const partsInfo = parts.length > 0
        ? parts.map(part =>
            `  - [${part.status.padEnd(15)}] ID #${part.id}: ${part.name} (Fornecedor: ${part.supplier}, Tipo: ${part.type})`
        ).join('\n')
        : 'Nenhuma peça registrada.';

    // --- 4. Seção de Testes ---
    const testsInfo = tests.length > 0
        ? tests.map(test =>
            `  - [${test.result.padEnd(9)}] ${test.datePerformed}: Teste ${test.type}. ${test.notes ? `Notas: ${test.notes}` : ''}`
        ).join('\n')
        : 'Nenhum teste registrado.';

    // --- Montagem Final do Relatório ---
    const reportContent = [
        createSection('Relatório de Produção da Aeronave', mainInfo),
        createSection('Etapas de Produção / Tarefas', tasksInfo),
        createSection('Peças e Componentes', partsInfo),
        createSection('Histórico de Testes', testsInfo),
    ].join('\n');

    const reportHeader = `
AEROCODE - Relatório de Produção
Data de Geração: ${new Date().toLocaleString('pt-BR')}
    `.trim();

    return `${reportHeader}\n\n${reportContent}`;
};