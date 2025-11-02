import type { Aircraft, AircraftWithPermission, NewAircraftData } from '../types/AircraftTypes';
import type { User } from '../types/UserTypes';

let nextAircraftIdPart = 800; // Para gerar IDs únicos sequenciais

/**
 * Dados de Aeronaves de Teste (Simulação de Banco de Dados)
 */
export const mockAircraftsData: Aircraft[] = [
  {
    id: 'A-123',
    model: 'Airbus A320 Neo',
    type: 'Comercial',
    capacity: 180,
    range: 6300,
    clientName: 'Azul Linhas Aéreas',
    deliveryDeadline: '2026-05-15',
    status: 'Em Produção (Fase 3/6)',
    associatedEngineers: [2], // ID do Engenheiro 'eng'
    createdBy: 1, // ID do 'admin'
  },
  {
    id: 'B-456',
    model: 'F-35 Lightning II',
    type: 'Militar',
    capacity: 1,
    range: 2200,
    clientName: 'Força Aérea Brasileira',
    deliveryDeadline: '2025-12-01',
    status: 'Testes Finais',
    associatedEngineers: [2],
    createdBy: 1,
  },
  {
    id: 'C-789',
    model: 'Embraer E-195 E2',
    type: 'Comercial',
    capacity: 146,
    range: 4800,
    clientName: 'TAP Air Portugal',
    deliveryDeadline: '2027-01-20',
    status: 'Pré-produção',
    associatedEngineers: [4], // ID do Engenheiro 'outroEng'
    createdBy: 1,
  }
];

/**
 * Retorna todas as aeronaves.
 */
export const getAllAircrafts = (): Aircraft[] => {
  return mockAircraftsData;
};

/**
 * Retorna a lista de aeronaves com a flag de permissão de edição para o usuário logado.
 * @param user - O objeto do usuário logado.
 * @returns {AircraftWithPermission[]} - Lista de aeronaves com a flag 'canEdit'.
 */
export const getAircraftsForUser = (user: User): AircraftWithPermission[] => {
  if (!user) return [];

  const isAdmin = user.level === 'administrador';
  const isEngineer = user.level === 'engenheiro';

  return mockAircraftsData.map(aircraft => {
    let canEdit = false;

    if (isAdmin) {
      canEdit = true;
    } else if (isEngineer) {
      canEdit = aircraft.associatedEngineers.includes(user.id);
    }

    return { ...aircraft, canEdit };
  });
};

/**
 * Adiciona uma nova aeronave ao sistema.
 * @param aircraftData - Dados da nova aeronave, vindo do formulário.
 * @param creatorId - ID do administrador que está criando a aeronave.
 * @returns O objeto da aeronave criada.
 */
export const addAircraft = (aircraftData: NewAircraftData, creatorId: number): Aircraft => {
  const newId = `D-${nextAircraftIdPart++}`;

  const newAircraft: Aircraft = {
    ...aircraftData,
    id: newId,
    status: 'Pré-produção',
    createdBy: creatorId,
    associatedEngineers: aircraftData.associatedEngineers || [],
  };

  mockAircraftsData.push(newAircraft);
  console.log("Aeronave Adicionada:", newAircraft);
  return newAircraft;
};

/**
 * Busca uma aeronave por seu ID.
 * @param id - O ID da aeronave a ser encontrada.
 * @returns A aeronave encontrada ou undefined.
 */
export const getAircraftById = (id: string): Aircraft | undefined => {
  return mockAircraftsData.find(a => a.id === id);
};

/**
 * Atualiza os detalhes de uma aeronave específica.
 * @param id - O ID da aeronave a ser atualizada.
 * @param updatedData - Um objeto parcial com os dados a serem atualizados.
 * @returns A aeronave atualizada ou undefined se não for encontrada.
 */
export const updateAircraftDetails = (
  id: string,
  updatedData: Partial<Aircraft>
): Aircraft | undefined => {
  const index = mockAircraftsData.findIndex(a => a.id === id);

  if (index !== -1) {
    // Mescla os dados atuais com os novos dados
    mockAircraftsData[index] = { ...mockAircraftsData[index], ...updatedData };
    console.log(`Aeronave ${id} atualizada.`);
    return mockAircraftsData[index];
  }

  console.error(`Falha ao atualizar: Aeronave com ID ${id} não encontrada.`);
  return undefined;
};