# SERS — Sistema de Dimensionamento Energético Residencial

Frontend em React + TypeScript para gestão de imóveis residenciais, registro de faturas de energia elétrica, análise de consumo médio, identificação de mês de pico e auxílio no dimensionamento fotovoltaico.

Projeto desenvolvido para a disciplina SERS (FIAP).

---

## 🚀 Tecnologias Utilizadas

- **React 19** com **Vite**
- **TypeScript** (Strict Mode)
- **Tailwind CSS** (Tema Clean Energy)
- **Recharts** (Gráficos interativos)
- **Lucide React** (Ícones)

---

## 📦 Como Executar o Projeto

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install
```

### Execução em Desenvolvimento

```bash
# Iniciar o servidor local (porta 3000)
npm run dev
```

Acesse em seu navegador: `http://localhost:3000`

### Build para Produção

```bash
npm run build
```

---

## 🔌 Conexão com o Backend

O frontend está configurado para se comunicar com a API RESTful em Node.js rodando em:
`http://localhost:3001/api`

### Endpoints Principais:
- `POST /auth/login` e `POST /auth/register` (Autenticação JWT)
- `GET /imoveis`, `POST /imoveis`, `PUT /imoveis/:id`, `DELETE /imoveis/:id` (Gestão de Imóveis)
- `GET /imoveis/:id/consumos`, `POST /imoveis/:id/consumos`, `DELETE /imoveis/:id/consumos/:id` (Faturas de Consumo)
- `GET /imoveis/:id/resumo` (Resumo Consolidado com Mês de Pico, Média e Máximo)
- `POST /imoveis/:id/consumos/seed-teste` (Carga dos 5 meses de referência)

*Nota: Caso o backend esteja offline durante testes ou desenvolvimento, o sistema possui persistência local com sincronização automática para permitir validação completa.*

---

## 📊 Regras de Negócio e Dimensionamento

1. **Mês de Pico (Consumo Máximo)**: Define a carga crítica para especificação técnica de disjuntores, cabeamento e proteção de entrada.
2. **Consumo Médio Mensal**: Base de cálculo para dimensionamento da potência nominal dos módulos fotovoltaicos.
3. **Modo Sequencial de Faturas**: Agiliza a digitação contínua de competências mensais sucessivas.
