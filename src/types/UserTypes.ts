// src/types/UserTypes.ts

// Define a lista de níveis de usuário no sistema
export type UserLevel = 'operador' | 'engenheiro' | 'administrador';

// Define a hierarquia de acesso, onde o índice mais baixo (0) tem o maior acesso
// Essa lista é usada na função hasPermission.
// ORDEM: OPERADOR (maior índice) < ENGENHEIRO < ADMINISTRADOR (menor índice)
export const ACCESS_HIERARCHY: UserLevel[] = [
  'administrador', // Índice 0
  'engenheiro',    // Índice 1
  'operador',      // Índice 2
];

// Tipo para o objeto User que estará no contexto
export interface User {
  id: number;
  username: string;
  password?: string;
  name: string;
  level: UserLevel;      // Ex: 'administrador'
  levelName: string;     // Ex: 'Administrador'

  // 💡 CORREÇÃO FINAL: Adicionando a propriedade usada no mockUsers
  associatedAircrafts: string[]; // Lista de IDs de aeronaves
}

// Tipo para os níveis de acesso (usado para auto-completar)
export interface UserLevels {
  ADMIN: 'administrador';
  ENGINEER: 'engenheiro';
  OPERATOR: 'operador';
}

// Tipo para o Contexto de Autenticação
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  USER_LEVELS: UserLevels;
  hasPermission: (requiredLevel: UserLevel) => boolean;
}

// O tipo UserWithoutPassword agora inclui associatedAircrafts implicitamente
export type UserWithoutPassword = Omit<User, 'password'>;