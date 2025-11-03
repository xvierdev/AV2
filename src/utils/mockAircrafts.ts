import type { Aircraft, AircraftWithPermission, NewAircraftData } from '../types/AircraftTypes';
import type { User } from '../types/UserTypes';


// ========================================================================
// Dados Mockados (Simulação de Banco de Dados)
// ========================================================================

let nextAircraftIdPart = 800;

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
    associatedEngineers: [2],
    createdBy: 1,
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
    associatedEngineers: [4],
    createdBy: 1,
  }
];

// ========================================================================
// Funções de Acesso e Manipulação de Dados
// ========================================================================

/**
 * Retorna todas as aeronaves cadastradas no sistema.
 */
export const getAllAircrafts = (): Aircraft[] => {
  return mockAircraftsData;
};

/**
 * Busca e retorna uma única aeronave pelo seu ID.
 */
export const getAircraftById = (id: string): Aircraft | undefined => {
  return mockAircraftsData.find(a => a.id === id);
};

/**
 * Retorna a lista de aeronaves com uma flag `canEdit` baseada nas permissões do usuário.
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
 * Cria uma nova aeronave e a adiciona à lista de dados.
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
 * Atualiza os dados de uma aeronave existente com base no seu ID.
 */
export const updateAircraftDetails = (id: string, updatedData: Partial<Aircraft>): Aircraft | undefined => {
  const index = mockAircraftsData.findIndex(a => a.id === id);
  if (index !== -1) {
    mockAircraftsData[index] = { ...mockAircraftsData[index], ...updatedData };
    console.log(`Aeronave ${id} atualizada.`);
    return mockAircraftsData[index];
  }

  console.error(`Falha ao atualizar: Aeronave com ID ${id} não encontrada.`);
  return undefined;
};