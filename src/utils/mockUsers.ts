/* eslint-disable @typescript-eslint/no-unused-vars */
import { type User, type UserLevel, type UserWithoutPassword } from "../types/UserTypes";


// ========================================================================
// Dados Mockados (Simulação de Banco de Dados)
// ========================================================================

const mockUsersData: User[] = [
    {
        id: 1,
        name: 'Admin Master',
        username: 'admin',
        password: '123',
        level: 'administrador',
        levelName: 'Administrador',
        associatedAircrafts: []
    },
    {
        id: 2,
        name: 'Engenheiro Chefe',
        username: 'eng',
        password: '123',
        level: 'engenheiro',
        levelName: 'Engenheiro',
        associatedAircrafts: ['A-123', 'B-456']
    },
    {
        id: 3,
        name: 'Operador de Montagem',
        username: 'op',
        password: '123',
        level: 'operador',
        levelName: 'Operador',
        associatedAircrafts: []
    },
    {
        id: 4,
        name: 'Joana Silva',
        username: 'joana',
        password: '123',
        level: 'engenheiro',
        levelName: 'Engenheiro',
        associatedAircrafts: ['C-789']
    }
];

// ========================================================================
// Funções de Acesso e Autenticação (Getters)
// ========================================================================

/**
 * Retorna a lista de todos os usuários, omitindo o campo 'password'.
 */
export const getAllUsers = (): UserWithoutPassword[] => {
    return mockUsersData.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    });
};

/**
 * Simula a autenticação de um usuário, verificando username e password.
 */
export const simulateLogin = (username: string, password: string): UserWithoutPassword | null => {
    const user = mockUsersData.find(u => u.username === username && u.password === password);
    if (user) {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
    return null;
};

// ========================================================================
// Funções de Criação
// ========================================================================

/**
 * Cria um novo usuário com uma senha padrão e o adiciona à lista de dados.
 */
export const createNewUser = (name: string, username: string, level: UserLevel): UserWithoutPassword => {
    const newId = Math.max(...mockUsersData.map(u => u.id), 0) + 1;
    const levelName = level.charAt(0).toUpperCase() + level.slice(1);

    const newUser: User = {
        id: newId,
        name,
        username,
        password: '123',
        level,
        levelName,
        associatedAircrafts: [],
    };

    mockUsersData.push(newUser);

    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
};

// ========================================================================
// Funções de Atualização
// ========================================================================

/**
 * Atualiza o nome e/ou o nível de um usuário existente.
 */
export const updateUser = (userId: number, updatedData: { name?: string; level?: UserLevel }): User | null => {
    const userIndex = mockUsersData.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        const user = mockUsersData[userIndex];
        if (updatedData.name) {
            user.name = updatedData.name;
        }
        if (updatedData.level) {
            user.level = updatedData.level;
            user.levelName = updatedData.level.charAt(0).toUpperCase() + updatedData.level.slice(1);
        }
        console.log('Usuário atualizado:', user);
        return { ...user };
    }
    console.error(`Usuário com ID ${userId} não encontrado para atualização.`);
    return null;
};

/**
 * Atualiza a senha de um usuário após verificar a senha antiga.
 */
export const updatePassword = (userId: number, oldPassword: string, newPassword: string): boolean => {
    const userIndex = mockUsersData.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        const user = mockUsersData[userIndex];

        if (user.password !== oldPassword) {
            throw new Error('A senha antiga está incorreta. Tente novamente.');
        }
        if (newPassword.length < 3) {
            throw new Error('A nova senha deve ter pelo menos 3 caracteres.');
        }
        if (oldPassword === newPassword) {
            throw new Error('A nova senha não pode ser igual à antiga.');
        }

        user.password = newPassword;
        console.log(`Senha do usuário ${user.username} atualizada com sucesso.`);
        return true;
    }
    throw new Error('Usuário não encontrado.');
};

// ========================================================================
// Funções de Exclusão
// ========================================================================

/**
 * Remove um usuário do sistema com base no seu ID.
 */
export const deleteUser = (userId: number): boolean => {
    const userIndex = mockUsersData.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        const deletedUser = mockUsersData.splice(userIndex, 1);
        console.log('Usuário deletado:', deletedUser[0]);
        return true;
    }
    console.error(`Usuário com ID ${userId} não encontrado para exclusão.`);
    return false;
};