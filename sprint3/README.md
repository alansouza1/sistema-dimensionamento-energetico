# ⚡ Sprint 3 — Finalização do Sistema de Orçamento Fotovoltaico (CP3)

> **FIAP — Soluções em Energias Renováveis e Sustentáveis (SERS)**  
> **Integrantes:**  
> - Alan Junio Araujo de Souza  
> - Gustavo Zibini Belizario  
> **Prazo Final:** 23/10/2026  

Este diretório contém a versão final e consolidada do **Sistema de Dimensionamento Energético Residencial (Sprint 3 / CP3)**. O projeto evolui as etapas anteriores integrando análise econômico-financeira com tarifa configurável, cálculo de energia compensada, **Payback Simples**, **comparação lado a lado dos cenários com e sem armazenamento (PB14)**, **persistência de propostas em banco de dados SQLite (PB20)** e **exportação/impressão de proposta em PDF (PB21)**.

---

## 🚀 Novas Funcionalidades da Sprint 3

1. **Comparação de Cenários Lado a Lado (PB14)**:
   - Apresentação comparativa simultânea da solução **Grid-Tie puro (sem baterias)** versus **Híbrido com armazenamento (baterias LiFePO4)**.
   - Comparação direta de potência instalada, módulos, inversor, geração mensal, autonomia, investimento e retorno.
2. **Estimativa de Economia Financeira (PB15)**:
   - Tarifa de energia configurável (padrão R$ 0,85/kWh — ANEEL B1 convencional).
   - Cálculo da energia compensada: $E_{compensada} = \min(E_{gerada,mês}, E_{consumida,mês})$.
   - Cálculo de economia mensal e anual estimada na fatura da concessionária.
3. **Cálculo de Payback Simples (PB16)**:
   - Cálculo automático do tempo de recuperação do investimento: $Payback = \frac{Investimento}{Economia_{anual}}$ (apresentado em anos e meses).
   - Exibição formal das premissas e ressalva legal de tratar-se de Payback Simples acadêmico.
4. **Persistência de Propostas no SQLite (PB20)**:
   - Tabela `propostas_solar` no SQLite (`node:sqlite`).
   - Salva simulações completas vinculadas ao imóvel e ao usuário autenticado.
   - Aba no modal para listar, recarregar simulações anteriores ou excluir propostas salvas.
5. **Exportação e Emissão de Proposta Comercial / Relatório (PB21)**:
   - Botão para imprimir ou exportar a proposta fotovoltaica consolidada em PDF via folha de estilo de impressão (`@media print`).
6. **Validação Rigorosa de Dados (PB18)**:
   - Rejeição de valores negativos ou zerados de HSP, consumo e tarifas com mensagens explicativas ao usuário.
7. **Roteiro da Sprint Review e Resposta da Questão Final**:
   - Documento completo em [`docs/ROTEIRO_SPRINT_REVIEW.md`](./docs/ROTEIRO_SPRINT_REVIEW.md) com o roteiro de 1 a 15 passos e a resposta fundamentada para a banca avaliadora.

---

## 🔌 Novos Endpoints da API na Sprint 3

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/solar/comparativo` | Executa o dimensionamento comparativo dual (Grid-Tie vs Híbrido) com economia e payback |
| `POST` | `/api/solar/propostas` | Persiste uma proposta comparativa no SQLite vinculada ao imóvel |
| `GET` | `/api/solar/imoveis/:id/propostas` | Lista o histórico de propostas salvas de um imóvel |
| `GET` | `/api/solar/propostas/:id` | Recupera os dados completos de uma proposta salva por ID |
| `DELETE` | `/api/solar/propostas/:id` | Remove uma proposta salva do histórico |

---

## 🛠️ Como Executar

### 1. Instalar Dependências
```bash
# Na pasta raiz da sprint3
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 2. Executar os Testes Automatizados
```bash
npm test --prefix backend
# 31 testes passando (21 legados + 10 de dimensionamento, economia, payback e persistência)
```

### 3. Iniciar o Sistema (Frontend + Backend)
```bash
npm run dev
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Healthcheck:** http://localhost:3001/api/health
