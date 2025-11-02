/* eslint-disable @typescript-eslint/no-unused-vars */
// src/utils/mockUsers.ts

import { type User, type UserLevel, type UserWithoutPassword } from "../types/UserTypes";

export const mockUsers: User[] = [
    {
        id: 1,
        name: 'Admin Master',
        username: 'admin',
        password: '123', // Agora é aceito pelo tipo User
        level: 'administrador',
        levelName: 'Administrador',
        associatedAircrafts: []
    },
    {
        id: 2,
        name: 'Engenheiro Chefe',
        username: 'eng',
        password: '123', // Agora é aceito pelo tipo User
        level: 'engenheiro',
        levelName: 'Engenheiro',
        associatedAircrafts: ['A-123', 'B-456']
    },
    {
        id: 3,
        name: 'Operador de Montagem',
        username: 'op',
        password: '123', // Agora é aceito pelo tipo User
        level: 'operador',
        levelName: 'Operador',
        associatedAircrafts: []
    }
];

export const simulateLogin = (username: string, password: string): UserWithoutPassword | null => {
    const user = mockUsers.find(
        // ✅ Acesso à 'password' agora é válido
        u => u.username === username && u.password === password
    );

    if (user) {
        // Agora 'userWithoutPassword' tem o tipo UserWithoutPassword
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    return null;
}

// Função para obter a lista de usuários (sem senha)
export const getAllUsers = (): UserWithoutPassword[] => {
    // Mapeia para remover o campo 'password'
    return mockUsers.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    });
};

// Função para simular a criação de um novo usuário
export const createNewUser = (
    name: string,
    username: string,
    level: string
): UserWithoutPassword => {

    // Simulação: Gera um novo ID baseado no último ID
    const newId = mockUsers.length + 1;

    // Nível Padrão e Nome do Nível
    const levelName = level.charAt(0).toUpperCase() + level.slice(1);

    const newUser: User = {
        id: newId,
        name: name,
        username: username,
        password: '123', // Senha Padrão
        level: level as 'administrador' | 'engenheiro' | 'operador',
        levelName: levelName,
        associatedAircrafts: [],
    };

    mockUsers.push(newUser);

    // Retorna o objeto sem senha
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
};

/**
 * Atualiza os dados de um usuário existente.
 * @param userId - O ID do usuário a ser atualizado.
 * @param updatedData - Um objeto com os campos a serem atualizados(nome e / ou nível).
 * @returns O objeto do usuário atualizado ou null se não for encontrado.
 */
export const updateUser = (userId: number, updatedData: { name?: string; level?: UserLevel }): User | null => {
    const userIndex = mockUsers.findIndex((u: { id: number; }) => u.id === userId);

    if (userIndex !== -1) {
        // Atualiza apenas os campos fornecidos
        if (updatedData.name) {
            mockUsers[userIndex].name = updatedData.name;
        }
        if (updatedData.level) {
            mockUsers[userIndex].level = updatedData.level;
            // Atualiza o levelName para corresponder ao novo level
            mockUsers[userIndex].levelName = updatedData.level.charAt(0).toUpperCase() + updatedData.level.slice(1);
        }

        console.log('Usuário atualizado:', mockUsers[userIndex]);
        return { ...mockUsers[userIndex] }; // Retorna uma cópia do usuário atualizado
    }

    console.error(`Usuário com ID ${userId} não encontrado para atualização.`);
    return null;
};

/**
 * Deleta um usuário do sistema.
 * @param userId - O ID do usuário a ser deletado.
 * @returns true se a exclusão foi bem-sucedida, false caso contrário.
 */
export const deleteUser = (userId: number): boolean => {
    const userIndex = mockUsers.findIndex((u: { id: number; }) => u.id === userId);

    if (userIndex !== -1) {
        const deletedUser = mockUsers.splice(userIndex, 1);
        console.log('Usuário deletado:', deletedUser[0]);
        return true;
    }

    console.error(`Usuário com ID ${userId} não encontrado para exclusão.`);
    return false;
};

/**
 * Atualiza a senha de um usuário específico, verificando a senha antiga.
 * @param userId - O ID do usuário.
 * @param oldPassword - A senha atual para verificação.
 * @param newPassword - A nova senha.
 * @returns true se a atualização foi bem-sucedida.
 * @throws {Error} se a senha antiga estiver incorreta ou a nova for inválida.
 */
export const updatePassword = (userId: number, oldPassword: string, newPassword: string): boolean => {
    const userIndex = mockUsers.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
        const user = mockUsers[userIndex];

        // 🚨 PASSO CRÍTICO: Verificar se a senha antiga corresponde.
        if (user.password !== oldPassword) {
            // Lançamos um erro específico que o front-end pode capturar e exibir.
            throw new Error('A senha antiga está incorreta. Tente novamente.');
        }

        // Validação da nova senha (pode ser mais complexa)
        if (newPassword.length < 3) {
            throw new Error('A nova senha deve ter pelo menos 3 caracteres.');
        }

        // Validação para não usar a mesma senha
        if (oldPassword === newPassword) {
            throw new Error('A nova senha não pode ser igual à antiga.');
        }

        // Se tudo estiver correto, atualiza a senha.
        user.password = newPassword;
        console.log(`Senha do usuário ${user.username} atualizada com sucesso.`);
        return true;
    }

    // Este caso não deveria acontecer se o usuário está logado, mas é uma boa guarda.
    throw new Error('Usuário não encontrado.');
};