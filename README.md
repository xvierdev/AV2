# ✈️ Aerocode - Sistema de Gestão da Produção de Aeronaves

![Badge de Status do Projeto: Em Desenvolvimento](https://img.shields.io/badge/Status-Em%20Desenvolvimento-orange)
![Badge de Tecnologia Front-end: React](https://img.shields.io/badge/Front--end-React%20%7C%20Vite-blue)
![Badge de Linguagem: TypeScript](https://img.shields.io/badge/Linguagem-TypeScript-blueviolet)

## 📝 1. Visão Geral do Projeto

O **Aerocode** é um sistema corporativo crucial para o gerenciamento e acompanhamento de todas as fases da produção de aeronaves (comerciais e militares). O projeto tem como foco a migração da interface de linha de comando (CLI) legada para uma **Interface Gráfica do Usuário (GUI) moderna e intuitiva**, visando a escalabilidade e a redução drástica da curva de aprendizado para engenheiros e operadores.

O sistema é construído como uma **Single Page Application (SPA)**, garantindo uma experiência de usuário fluida e responsiva, com a robustez e segurança fornecida pela tipagem estática do **TypeScript**.

### 🖼️ [wireframe de baixa fidelidade](./docs/wireframe%20de%20baixa%20fidelidade.pdf)
### 🖥️ [wireframe de fluxo de usuário](./docs/diagrama%20de%20fluxo%20do%20usuário.pdf)
### 📜 [relatório completo](./docs/AV2_RELATORIO.pdf)

### 🎯 1.1. Objetivos Estratégicos

* **Usabilidade Aprimorada:** Substituir a interface CLI por uma GUI amigável, tornando o sistema acessível a um público técnico, mas com maior facilidade de uso.
* **Gestão Completa do Ciclo de Vida:** Gerenciar todas as etapas críticas: Cadastro de Aeronaves, Suprimento de Peças, Etapas de Produção, Testes e Geração de Relatório Final.
* **Integridade e Segurança:** Implementar um controle de acesso rigoroso para garantir que apenas usuários autorizados realizem operações críticas (CRUD) nas respectivas entidades.

### 🛡️ 1.2. Níveis de Acesso e Permissões (Autenticação)

O Aerocode utiliza três níveis de permissão para controlar o acesso e as ações disponíveis:

| Nível de Acesso | Responsabilidades Principais |
| :--- | :--- |
| **Administrador** | Gerenciamento completo de Funcionários (Cadastro, Edição, Exclusão, Nível de Acesso), além de todas as funções do Engenheiro. |
| **Engenheiro** | Ampla permissividade. Gestão de Peças, Etapas e Testes (CRUD), Associação de Operadores a tarefas e Geração do Relatório Final de Produção. |
| **Operador** | Visualização de Etapas e Peças a ele associadas. Permissão para alterar somente o status de peças relacionadas às suas tarefas. |

---

## 🛠️ 2. Tecnologias Utilizadas

Este projeto é um protótipo navegável **somente front-end** para a fase inicial do desenvolvimento.

* **Front-end:** React (com Hooks e Componentes Funcionais)
* **Build Tool:** Vite
* **Linguagem:** TypeScript
* **Gerenciador de Pacotes:** npm
* **Compatibilidade:** Windows 10+, Linux Ubuntu 24.04.03+ (e derivados)

---

## 🚀 3. Manual de Execução (Guia de Instalação Local)

Siga os passos abaixo para configurar e executar o projeto em seu ambiente de desenvolvimento.

### 3.1. Pré-requisitos

Certifique-se de que você possui o **Node.js** (versão LTS recomendada) e o **npm** (incluso no Node.js) instalados em seu sistema.

### 3.2. Configuração Inicial

1.  **Clone o Repositório:**
    ```bash
    git clone https://github.com/xvierdev/AV2
    cd AV2
    ```

2.  **Instale as Dependências:**
    Acesse a pasta raiz do projeto e instale todas as bibliotecas necessárias:
    ```bash
    npm install
    ```

### 3.3. Executando o Servidor de Desenvolvimento



```bash
npm run dev
```

O código de produção compilado estará disponível na pasta ./dist.