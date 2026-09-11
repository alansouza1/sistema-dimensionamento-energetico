# ⚡ Sistema de Dimensionamento Energético Residencial

> **FIAP — Soluções em Energias Renováveis e Sustentáveis (SERS)**  
> **Integrantes:**
> - Alan Junio Araujo de Souza (RM: 574112)
> - Gustavo Zibini Belizario (RM: 561376)

---

## 📖 Visão Geral

Aplicação fullstack desenvolvida para o dimensionamento e acompanhamento do perfil de consumo energético residencial. O sistema permite o gerenciamento de múltiplos imóveis, registro contínuo e em lote de faturas de energia mensais (kWh), visualização gráfica cronológica da evolução de consumo e consolidação de indicadores críticos (Consumo Máximo, Consumo Médio e Mês de Pico).

O projeto implementa com rigor as User Stories e critérios de aceitação do **Kanban Board** da disciplina (**PB01 a PB15 / TSK-01.1 a TSK-15.2**), incluindo isolamento de segurança multiusuário e validação com o **caso de teste padrão da apostila da FIAP** (Jan–Mai: máx 410 kWh, méd 346 kWh, pico Março).

---

## 🏗️ Arquitetura e Tecnologias

### 💻 Backend (`/backend`)
- **Runtime & Linguagem:** Node.js v22/v26 + TypeScript (Strict Mode)
- **Framework HTTP:** Express 4
- **Banco de Dados:** SQLite relacional com integridade referencial e chaves estrangeiras ativas (`PRAGMA foreign_keys = ON;`), utilizando o driver nativo `node:sqlite` (`DatabaseSync`)
- **Segurança & Autenticação:**
  - Hash criptográfico de senhas com algoritmo **SHA-256** (TSK-01.2)
  - Sessão e autenticação via **JWT (JSON Web Token)** no cabeçalho `Authorization: Bearer <token>` (TSK-02.2)
  - Isolamento rigoroso multiusuário em todas as rotas com `WHERE usuario_id = ?` (TSK-15.1)
- **Validação de Dados:** Schemas robustos com **Zod** e respostas padronizadas em Português (TSK-13.1, TSK-13.2)
- **Testes Automatizados:** Vitest + Supertest com 21 testes de integração automatizados

### 🎨 Frontend (`/frontend`)
- **Framework & Bundler:** React 19 + Vite
- **Linguagem:** TypeScript (Strict Mode)
- **Estilização:** Tailwind CSS v4 (Clean Energy design system)
- **Componentes & Ícones:** Lucide React
- **Visualização de Dados:** Recharts (`BarChart` responsivo com destaque do mês de pico)
- **Resiliência:** Cliente HTTP com interceptor JWT e modo de simulação com dados locais para demonstrações offline

---

## 🚀 Como Executar o Projeto com 1 Único Comando

### Pré-requisitos
- Node.js (v20 ou superior, recomendado v22/v26)
- npm (v10 ou superior)

### 1. Instalação das Dependências (Root, Backend e Frontend)
Na raiz do repositório, execute:
```bash
npm run install:all
```

### 2. Inicialização Simultânea (Frontend + Backend Integrados)
Execute na raiz:
```bash
npm run dev
```

Este comando utiliza o `concurrently` para iniciar em paralelo:
- **Backend API:** `http://localhost:3001`
- **Frontend SPA:** `http://localhost:3000`

Abra seu navegador em [http://localhost:3000](http://localhost:3000).

---

## 🧪 Testes Automatizados

Para rodar a suíte de testes de integração automatizados do backend:
```bash
npm test
```

A suíte valida:
1. **Autenticação (PB01, PB02):** Registro com senha SHA-256, bloqueio de e-mail duplicado, login e emissão de JWT.
2. **Gestão de Imóveis (PB03, PB04):** CRUD completo vinculado ao usuário autenticado e exclusão em cascata.
3. **Privacidade e Isolamento (PB15):** Garantia formal de que usuários não acessam dados uns dos outros.
4. **Cálculos Energéticos (PB05–PB11):** Validação matemática exata do caso da apostila (Jan: 320, Fev: 295, Mar: 410, Abr: 365, Mai: 340 $\rightarrow$ Máximo = 410 kWh/mês, Pico = Março, Média = 346 kWh/mês).

---

## 🔌 Tabela de Endpoints da API REST

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/health` | Verificação de disponibilidade da API |
| `POST` | `/api/auth/register` | Cadastro de usuário com validação de campos e SHA-256 |
| `POST` | `/api/auth/login` | Autenticação com geração de token JWT |
| `GET` | `/api/auth/me` | Dados do usuário autenticado na sessão |
| `GET` | `/api/imoveis` | Lista de imóveis do usuário autenticado |
| `POST` | `/api/imoveis` | Cadastro de novo imóvel vinculado ao usuário |
| `GET` | `/api/imoveis/:id` | Consulta de imóvel específico |
| `PUT` | `/api/imoveis/:id` | Edição dos dados cadastrais do imóvel |
| `DELETE` | `/api/imoveis/:id` | Exclusão do imóvel e faturas em cascata |
| `GET` | `/api/imoveis/:id/consumos` | Histórico ordenado cronologicamente (`ano ASC, mes ASC`) |
| `POST` | `/api/imoveis/:id/consumos` | Registro de consumo mensal individual (kWh >= 0) |
| `POST` | `/api/imoveis/:id/consumos/batch` | Inclusão sequencial em lote de múltiplos meses |
| `DELETE` | `/api/imoveis/:id/consumos/:consumoId` | Exclusão de fatura de consumo |
| `GET` | `/api/imoveis/:id/resumo` | Painel consolidado: Máximo, Média, Mês de Pico e Total de Meses |
| `POST` | `/api/imoveis/:id/consumos/seed-teste` | Injeta instantaneamente os dados de teste da apostila FIAP |

---

## 📁 Estrutura de Diretórios

```
sistema-dimensionamento-energetico/
├── package.json                   # Orquestrador monorepo (scripts dev/test/build)
├── README.md                      # Documentação completa do projeto
├── .gitignore                     # Regras de exclusão do Git
├── backend/                       # API REST em Node.js + TypeScript
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   ├── .env.example
│   ├── src/
│   │   ├── server.ts              # Entrypoint do servidor
│   │   ├── app.ts                 # Configuração do Express, CORS e rotas
│   │   ├── database/db.ts         # Conexão SQLite e DDL das tabelas
│   │   ├── utils/security.ts      # SHA-256 e funções JWT
│   │   ├── types/index.ts         # Modelos e interfaces de domínio
│   │   ├── schemas/               # Schemas de validação Zod
│   │   ├── middlewares/           # Middlewares de autenticação e validação
│   │   ├── services/              # Lógica de negócio e cálculos energéticos
│   │   ├── controllers/           # Controladores HTTP
│   │   └── routes/                # Definição das rotas REST
│   └── tests/                     # Testes de integração automatizados
└── frontend/                      # SPA em React 19 + TypeScript + Vite
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    └── src/
        ├── App.tsx                # Dashboard principal
        ├── main.tsx               # Ponto de montagem React
        ├── context/               # Contexto de autenticação
        ├── components/            # Componentes visuais modulares
        ├── services/              # Integração com a API REST
        └── types/                 # Interfaces de dados
```
