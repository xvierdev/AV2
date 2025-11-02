import type { Aircraft, AircraftWithPermission, NewAircraftData } from '../types/AircraftTypes';
import type { User } from '../types/UserTypes';

/**
 * Dados de Aeronaves de Teste (Simulação de Banco de Dados)
 */
export const mockAircrafts: Aircraft[] = [
  {
    id: 'A-123',
    model: 'Airbus A320 Neo',
    type: 'Comercial',
    capacity: 180,
    range: 6300, // km
    clientName: 'Azul',
    deliveryDeadline: '2026-05-15',
    status: 'Em Produção (Fase 3/6)',
    // O ID 2 é o Engenheiro Chefe (de mockUsers.ts)
    associatedEngineers: [2],
  },
  {
    id: 'B-456',
    model: 'F-35 Lightning II',
    type: 'Militar',
    capacity: 1,
    range: 2200,
    clientName: 'Força Aérea',
    deliveryDeadline: '2025-12-01',
    status: 'Testes Finais',
    associatedEngineers: [2],
  },
  {
    id: 'C-789',
    model: 'Embraer E-195',
    type: 'Comercial',
    capacity: 146,
    range: 4800,
    clientName: 'TAP Air Portugal',
    deliveryDeadline: '2027-01-20',
    status: 'Pré-produção',
    // Aeronave sem o engenheiro 2 associado
    associatedEngineers: [4],
  }
];

// 🎁 CORREÇÃO: Função Faltante para buscar TODAS as aeronaves
export const getAllAircrafts = (): Aircraft[] => {
  return mockAircrafts;
}

/**
 * Simula a busca de aeronaves e aplica a lógica de permissão de edição.
 * @param user - O objeto do usuário logado.
 * @returns {AircraftWithPermission[]} - Lista de aeronaves com a flag 'canEdit'.
 */
export const getAircraftsForUser = (user: User): AircraftWithPermission[] => {
  if (!user) return [];

  const isAdmin = user.level === 'administrador';
  const isEngineer = user.level === 'engenheiro';

  // Todos os usuários logados (Admin, Engenheiro e Operador) visualizam a lista (requisito: Engenheiros podem alternar entre todas)
  return mockAircrafts.map(aircraft => {
    let canEdit = false;

    if (isAdmin) {
      // 1. Administrador pode editar tudo
      canEdit = true;
    } else if (isEngineer) {
      // 2. Engenheiro só pode editar se estiver associado
      canEdit = aircraft.associatedEngineers.includes(user.id);
    }
    // 3. Operador (padrão) não pode editar nada (canEdit = false)

    return {
      ...aircraft,
      canEdit: canEdit
    } as AircraftWithPermission;
  });
};

/**
 * Simula a adição de uma nova aeronave (Apenas Admin).
 * @param newAircraftData - Dados da nova aeronave.
 * @param adminId - ID do administrador que está criando.
 * @returns {Aircraft} - A nova aeronave adicionada.
 */
export const addAircraft = (newAircraftData: NewAircraftData, adminId: number): Aircraft => {
  // Simula a atribuição de código único (A-XXX)
  const newId = `A-${Math.floor(Math.random() * 900) + 100}`;

  const aircraftWithId: Aircraft = {
    ...newAircraftData,
    id: newId,
    capacity: Number(newAircraftData.capacity),
    range: Number(newAircraftData.range),
    status: 'Pendente de Engenheiro/Etapas',
    associatedEngineers: [], // O admin deve associar um engenheiro depois
  };

  // Adiciona ao array de mocks
  mockAircrafts.push(aircraftWithId);

  console.log(`Nova aeronave ${newId} criada pelo Admin ID ${adminId}.`);

  return aircraftWithId;
};

// Função para buscar uma aeronave por ID (sem lógica de permissão ainda)
export const getAircraftById = (id: string): Aircraft | undefined => {
  return mockAircrafts.find(a => a.id === id);
};

// Função para simular a atualização dos dados
export const updateAircraftDetails = (
  id: string,
  updatedData: Partial<Aircraft> // Aceita um objeto parcial para edição
): Aircraft | undefined => {
  const index = mockAircrafts.findIndex(a => a.id === id);

  if (index !== -1) {
    // Aplica as atualizações mantendo os campos existentes
    const currentAircraft = mockAircrafts[index];

    // Simulação de quebra de associação (Se alguém for removido da lista)
    // Usamos um objeto temporário para garantir que apenas os campos fornecidos sejam atualizados
    const newAircraft = {
      ...currentAircraft,
      ...updatedData,
    } as Aircraft;

    mockAircrafts[index] = newAircraft;
    console.log(`Aeronave ${id} atualizada.`);
    return newAircraft;
  }
  return undefined;
};