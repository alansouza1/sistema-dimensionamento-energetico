# ⚡ Sistema de Dimensionamento Energético Residencial

> **FIAP — Soluções em Energias Renováveis e Sustentáveis (SERS)**  
> **Integrantes:**
> - Alan Junio Araujo de Souza
> - Gustavo Zibini Belizario

Aplicação web full-stack para dimensionamento energético e fotovoltaico de residências, desenvolvida como projeto acadêmico da disciplina SERS da FIAP. O sistema permite cadastrar imóveis, registrar faturas mensais de energia elétrica, calcular indicadores de consumo e gerar propostas preliminares de sistemas fotovoltaicos com orçamento baseado em equipamentos reais do mercado brasileiro.

---

## 📂 Organização do Repositório

O projeto é organizado em **Sprints** (Checkpoints), cada uma em sua própria pasta com backend, frontend e documentação independentes:

| Sprint | Pasta | Descrição | Entrega |
|--------|-------|-----------|---------|
| **Sprint 1** (CP1) | [`sprint1/`](./sprint1/) | Cadastro de imóveis, registro de faturas de energia, cálculo de consumo médio, máximo e mês de pico. | Set/2026 |
| **Sprint 2** (CP2) | [`sprint2/`](./sprint2/) | Dimensionamento fotovoltaico residencial, datasets de equipamentos reais, seleção técnica com verificação de compatibilidade, armazenamento opcional por baterias e orçamento. | Out/2026 |

---

## 🏗️ Arquitetura e Stack Tecnológica

```
┌──────────────────────────────┐    ┌──────────────────────────────┐
│        FRONTEND              │    │         BACKEND              │
│  React 18 + TypeScript       │    │  Node.js + Express           │
│  Vite (dev server :3000)     │───▶│  TypeScript + tsx            │
│  Tailwind CSS v4             │    │  SQLite (node:sqlite)        │
│  Recharts (gráficos)         │    │  JWT (autenticação)          │
│  Lucide React (ícones)       │    │  Zod (validação)             │
│                              │    │  csv-parse (datasets)        │
│  Proxy /api → :3001          │    │  Vitest + Supertest (testes) │
│  localhost:3000               │    │  localhost:3001              │
└──────────────────────────────┘    └──────────────────────────────┘
```

- **Monorepo por Sprint**: Cada sprint possui seu próprio `package.json` raiz que orquestra backend e frontend via `concurrently`.
- **Banco de Dados**: SQLite embutido via `node:sqlite` (nativo do Node.js), sem dependências externas de compilação.
- **Autenticação**: JWT com hash de senha via `crypto.scryptSync` (sem bcrypt).
- **Datasets Fotovoltaicos (Sprint 2)**: Arquivos `.csv` com equipamentos reais do mercado brasileiro (módulos, inversores, baterias).

---

## 🚀 Como Executar

### Pré-requisitos

- **Node.js** v22+ (recomendado v26+)
- **npm** v10+

### Sprint 1 — Cadastro e Consumo Energético

```bash
# 1. Instalar dependências
npm install --prefix sprint1
npm install --prefix sprint1/backend
npm install --prefix sprint1/frontend

# 2. Configurar variáveis de ambiente
cp sprint1/backend/.env.example sprint1/backend/.env

# 3. Executar (frontend + backend simultaneamente)
npm run dev --prefix sprint1
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Healthcheck**: http://localhost:3001/api/health

#### Testes Automatizados (Sprint 1)
```bash
npm test --prefix sprint1/backend
```

### Sprint 2 — Dimensionamento Fotovoltaico e Orçamento

```bash
# 1. Instalar dependências
npm install --prefix sprint2
npm install --prefix sprint2/backend
npm install --prefix sprint2/frontend

# 2. Configurar variáveis de ambiente
cp sprint2/backend/.env.example sprint2/backend/.env

# 3. Executar (frontend + backend simultaneamente)
npm run dev --prefix sprint2
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

#### Testes Automatizados (Sprint 2)
```bash
npm test --prefix sprint2/backend
# 27 testes passando (21 da Sprint 1 + 6 da Sprint 2)
```

---

## 📋 Funcionalidades

### Sprint 1 — Perfil de Consumo Energético
- Cadastro e autenticação de usuários (JWT)
- CRUD de imóveis residenciais
- Registro de faturas mensais de energia (individual e em lote)
- Cálculo automático de **consumo médio**, **consumo máximo** e **mês de pico**
- Visualização em gráfico de barras (Recharts)
- Dados de teste do livro-texto FIAP (seed automático)

### Sprint 2 — Dimensionamento Fotovoltaico
- **Datasets reais** de equipamentos fotovoltaicos do mercado brasileiro:
  - 12 módulos solares (Canadian Solar, Jinko, Trina, Longi, JA Solar, Risen, DAH Solar)
  - 10 inversores On-Grid e Híbridos (Growatt, Deye, Fronius, Sungrow, GoodWe)
  - 8 baterias LiFePO4 e Chumbo-Ácido (Pylontech, Deye, Growatt, Unipower, Moura)
- **Motor de cálculo** com as fórmulas do roteiro da FIAP:
  - Energia alvo (`E_FV = Cm × f`)
  - Potência necessária (`P_FV = E_FV / (HSP × D × η)`)
  - Seleção de módulos por custo-benefício (R$/Wp) e cálculo de `P_instalada`
- **Seleção técnica de inversores** com validação de:
  - Compatibilidade de potência (FDI / sobrecarga até 1.40x)
  - Faixa de tensão MPPT (Vmp do módulo dentro da faixa do inversor)
  - Tensão máxima de entrada (Voc ≤ tensão máxima)
  - Corrente máxima de entrada (Isc ≤ corrente máxima)
  - Trava obrigatória de inversor híbrido quando há baterias
- **Armazenamento opcional por baterias** com autonomia configurável (6h, 12h, 24h)
- **Orçamento discriminado**: custo de equipamentos separado do custo de instalação/BOS (estruturas, cabos, conectores, homologação — estimado em 25% do valor dos equipamentos)
- **Proposta visual completa** com todos os 13 itens exigidos na seção 12 do roteiro

---

## 🔌 Endpoints da API

### Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | Cadastro de novo usuário |
| POST | `/api/auth/login` | Login e obtenção de JWT |

### Imóveis
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/imoveis` | Listar imóveis do usuário |
| POST | `/api/imoveis` | Cadastrar imóvel |
| PUT | `/api/imoveis/:id` | Atualizar imóvel |
| DELETE | `/api/imoveis/:id` | Excluir imóvel |

### Consumo
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/imoveis/:id/consumos` | Listar faturas do imóvel |
| POST | `/api/imoveis/:id/consumos` | Registrar fatura mensal |
| POST | `/api/imoveis/:id/consumos/lote` | Registrar faturas em lote |
| POST | `/api/imoveis/:id/consumos/seed-teste` | Popular dados do livro-texto |
| DELETE | `/api/imoveis/:id/consumos/:consumoId` | Excluir fatura |
| GET | `/api/imoveis/:id/resumo` | Resumo energético (média, máximo, pico) |

### Dimensionamento Solar (Sprint 2)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/solar/equipamentos` | Catálogo completo de módulos, inversores e baterias |
| POST | `/api/solar/dimensionamento` | Gerar proposta fotovoltaica com orçamento |

---

## 📄 Documentação Técnica

- **Sprint 1**: [`sprint1/README.md`](./sprint1/README.md) — Arquitetura, stack e rotas detalhadas
- **Sprint 2**: [`sprint2/README.md`](./sprint2/README.md) — Funcionalidades da feature solar
- **Evidências de Cálculo**: [`sprint2/docs/EVIDENCIAS_DIMENSIONAMENTO.md`](./sprint2/docs/EVIDENCIAS_DIMENSIONAMENTO.md) — Relatório técnico com memória de cálculo, fórmulas, cenários de teste (Grid-Tie e Híbrido) e fontes dos dados

---

*Pré-dimensionamento acadêmico. Não substitui projeto elétrico executivo ou responsabilidade técnica de profissional habilitado.*
