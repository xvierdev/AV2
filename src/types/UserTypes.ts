/**
 * Define os possíveis níveis de permissão de um usuário no sistema.
 */
export type UserLevel = 'operador' | 'engenheiro' | 'administrador';

/**
 * Define a hierarquia de acesso, onde o índice mais baixo (0) representa
 * o maior nível de permissão. Utilizado para comparações de autorização.
 */
export const ACCESS_HIERARCHY: UserLevel[] = [
  'administrador',
  'engenheiro',
  'operador',
];

/**
 * Define a estrutura principal de dados para um usuário no sistema.
 */
export interface User {
  id: number;
  username: string;
  password?: string;
  name: string;
  level: UserLevel;
  levelName: string;
  associatedAircrafts: string[];
}

/**
 * Define um objeto de constantes para os níveis de usuário,
 * facilitando o uso e evitando erros de digitação.
 */
export interface UserLevels {
  ADMIN: 'administrador';
  ENGINEER: 'engenheiro';
  OPERATOR: 'operador';
}

/**
 * Define a estrutura do objeto de contexto de autenticação que será
 * compartilhado com os componentes da aplicação.
 */
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  USER_LEVELS: UserLevels;
  hasPermission: (requiredLevel: UserLevel) => boolean;
}

/**
 * Define um tipo de usuário que omite o campo `password`,
 * ideal para exibição segura de dados na interface.
 */
export type UserWithoutPassword = Omit<User, 'password'>;