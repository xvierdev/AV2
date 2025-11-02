/* eslint-disable @typescript-eslint/no-unused-vars */
// src/utils/mockUsers.ts

import { type User, type UserWithoutPassword } from "../types/UserTypes";

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