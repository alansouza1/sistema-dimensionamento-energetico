# ⚡ Sistema de Dimensionamento Energético Residencial

> **FIAP — Soluções em Energias Renováveis e Sustentáveis (SERS)**  
> **Integrantes:**
> - Alan Junio Araujo de Souza
> - Gustavo Zibini Belizario

Aplicação web full-stack para dimensionamento energético e fotovoltaico de residências, desenvolvida como projeto acadêmico da disciplina SERS da FIAP. O sistema permite cadastrar imóveis, registrar faturas mensais de energia elétrica, calcular indicadores de consumo, dimensionar plantas solares fotovoltaicas com equipamentos reais do mercado brasileiro, analisar retorno de investimento com **Payback Simples**, **comparar cenários com e sem armazenamento lado a lado**, **persistir propostas em SQLite** e **emitir propostas comerciais em PDF**.

---

## 📂 Organização do Repositório

O projeto é estruturado em pastas por **Sprint** (Checkpoints da disciplina), garantindo total reprodutibilidade e rastreabilidade da evolução do software:

| Sprint | Pasta | Descrição | Entrega |
|--------|-------|-----------|---------|
| **Sprint 1** (CP1) | [`sprint1/`](./sprint1/) | Cadastro de imóveis, registro de faturas de energia, cálculo de consumo médio, máximo e mês de pico. | Set/2026 |
| **Sprint 2** (CP2) | [`sprint2/`](./sprint2/) | Dimensionamento fotovoltaico, datasets de equipamentos reais (módulos, inversores, baterias), verificação de compatibilidade técnica e orçamento. | Out/2026 |
| **Sprint 3** (CP3) | [`sprint3/`](./sprint3/) | **Versão Final:** Análise econômica (tarifa e energia compensada), Payback Simples, comparativo lado a lado (On-Grid vs Híbrido), persistência SQLite de propostas e exportação/impressão em PDF. | Out/2026 |

---

## 🏗️ Arquitetura e Stack Tecnológica

```
┌──────────────────────────────┐    ┌──────────────────────────────┐
│        FRONTEND              │    │         BACKEND              │
│  React 18 + TypeScript       │    │  Node.js + Express           │
│  Vite (dev server :3000)     │───▶│  TypeScript + tsx            │
│  Tailwind CSS v4             │    │  SQLite nativo (node:sqlite) │
│  Recharts (gráficos)         │    │  JWT (autenticação)          │
│  Lucide React (ícones)       │    │  Zod (validação)             │
│  @media print (relatório PDF)│    │  csv-parse (datasets reais)  │
│  Proxy /api → :3001          │    │  Vitest + Supertest (testes) │
│  localhost:3000               │    │  localhost:3001              │
└──────────────────────────────┘    └──────────────────────────────┘
```

- **Monorepo por Sprint**: Cada sprint possui seu próprio `package.json` raiz que orquestra backend e frontend via `concurrently`.
- **Banco de Dados**: SQLite embutido via `node:sqlite` (nativo do Node.js v22+), sem compilação nativa externa (zero `node-gyp`).
- **Autenticação**: JWT com hash de senha via `crypto.scryptSync`.
- **Datasets Fotovoltaicos**: Arquivos `.csv` com especificações técnicas e preços de mercado de módulos, inversores e baterias comercializados no Brasil.

---

## 🚀 Como Executar

### Pré-requisitos

- **Node.js** v22+ (testado no v26)
- **npm** v10+

---

### Sprint 3 — Versão Final e Consolidada (CP3)

```bash
# 1. Instalar dependências
npm install --prefix sprint3
npm install --prefix sprint3/backend
npm install --prefix sprint3/frontend

# 2. Configurar variáveis de ambiente
cp sprint3/backend/.env.example sprint3/backend/.env

# 3. Executar frontend e backend simultaneamente
npm run dev --prefix sprint3
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Healthcheck:** http://localhost:3001/api/health

#### Testes Automatizados (Sprint 3)
```bash
npm test --prefix sprint3/backend
# 31 testes passando (21 legados + 10 de dimensionamento, economia, payback e persistência)
```

---

### Sprint 2 — Dimensionamento Fotovoltaico (CP2)

```bash
npm install --prefix sprint2
npm install --prefix sprint2/backend
npm install --prefix sprint2/frontend
cp sprint2/backend/.env.example sprint2/backend/.env
npm run dev --prefix sprint2
```
*Testes:* `npm test --prefix sprint2/backend` (27 testes)

---

### Sprint 1 — Cadastro e Consumo Energético (CP1)

```bash
npm install --prefix sprint1
npm install --prefix sprint1/backend
npm install --prefix sprint1/frontend
cp sprint1/backend/.env.example sprint1/backend/.env
npm run dev --prefix sprint1
```
*Testes:* `npm test --prefix sprint1/backend` (21 testes)

---

## 📋 Funcionalidades por Sprint

### Sprint 1 — Perfil de Consumo Energético
- Cadastro e autenticação de usuários (JWT)
- CRUD completo de imóveis residenciais
- Registro de faturas mensais de energia (individual e em lote)
- Cálculo automático de **consumo médio**, **consumo máximo** e **mês de pico**
- Visualização em gráfico de barras (Recharts)
- Dados de teste do livro-texto FIAP (seed automático)

### Sprint 2 — Dimensionamento Fotovoltaico
- **Datasets reais** de equipamentos fotovoltaicos:
  - 12 módulos solares (Canadian Solar, Jinko, Trina, Longi, JA Solar, Risen, DAH Solar)
  - 10 inversores On-Grid e Híbridos (Growatt, Deye, Fronius, Sungrow, GoodWe)
  - 8 baterias LiFePO4 e Chumbo-Ácido (Pylontech, Deye, Growatt, Unipower, Moura)
- **Motor de cálculo** com as fórmulas do roteiro da FIAP ($E_{FV}$, $P_{FV}$, $N_{mod}$, $P_{instalada}$, $E_{autonomia}$, $C_{bat}$)
- **Seleção técnica de inversores**:
  - Limite de sobrecarga (FDI até 1.40x)
  - Tensão MPPT e máxima de entrada ($V_{mp}$ e $V_{oc}$)
  - Corrente máxima de entrada ($I_{sc}$)
  - Trava obrigatória de inversor híbrido para baterias
- **Orçamento discriminado**: separação entre equipamentos e BOS/instalação (25%)

### Sprint 3 — Finalização, Economia, Payback e Emissão de Proposta (CP3)
- **Comparação Lado a Lado (PB14)**: Cenário Grid-Tie Puro vs Cenário Híbrido com Baterias lado a lado na interface.
- **Análise Financeira (PB15)**: Tarifa configurável (R$/kWh) e cálculo da energia compensada e economia mensal/anual.
- **Payback Simples (PB16)**: Tempo de retorno do investimento em anos e meses com apresentação clara das premissas.
- **Persistência de Propostas no SQLite (PB20)**: Tabela `propostas_solar` para histórico, recarregamento e exclusão de propostas salvas.
- **Exportação/Impressão de Proposta Comercial em PDF (PB21)**: Formatação profissional para entrega ao cliente via `@media print`.
- **Roteiro da Sprint Review e Defesa**: 15 passos de demonstração e resposta técnica fundamentada para a Questão Final da banca.

---

## 🔌 Principais Endpoints da API (Sprint 3)

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/auth/register` | Cadastro de usuário |
| `POST` | `/api/auth/login` | Login e geração de token JWT |
| `GET` | `/api/imoveis` | Listar imóveis do usuário |
| `POST` | `/api/imoveis` | Cadastrar novo imóvel |
| `GET` | `/api/imoveis/:id/consumos` | Listar histórico de faturas |
| `POST` | `/api/imoveis/:id/consumos` | Registrar fatura mensal |
| `GET` | `/api/imoveis/:id/resumo` | Indicadores de consumo (média, pico) |
| `GET` | `/api/solar/equipamentos` | Catálogo de módulos, inversores e baterias |
| `POST` | `/api/solar/dimensionamento` | Dimensionamento solar individual |
| `POST` | `/api/solar/comparativo` | Dimensionamento comparativo dual (Grid-Tie vs Híbrido com economia e payback) |
| `POST` | `/api/solar/propostas` | Persistir proposta no SQLite |
| `GET` | `/api/solar/imoveis/:id/propostas` | Listar histórico de propostas de um imóvel |
| `GET` | `/api/solar/propostas/:id` | Obter detalhes de proposta salva |
| `DELETE` | `/api/solar/propostas/:id` | Excluir proposta salva |

---

## 📄 Documentação Técnica e Relatórios

- **Sprint 1**: [`sprint1/README.md`](./sprint1/README.md)
- **Sprint 2**: [`sprint2/README.md`](./sprint2/README.md) & [`sprint2/docs/EVIDENCIAS_DIMENSIONAMENTO.md`](./sprint2/docs/EVIDENCIAS_DIMENSIONAMENTO.md)
- **Sprint 3 (Final)**: [`sprint3/README.md`](./sprint3/README.md)
- **Roteiro da Sprint Review (CP3)**: [`sprint3/docs/ROTEIRO_SPRINT_REVIEW.md`](./sprint3/docs/ROTEIRO_SPRINT_REVIEW.md)

---

*Projeto desenvolvido com fins acadêmicos para a disciplina SERS — FIAP.*
