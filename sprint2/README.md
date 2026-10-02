# ⚡ Sprint 2 — Sistema de Dimensionamento Fotovoltaico Residencial (CP2)

> **FIAP — Soluções em Energias Renováveis e Sustentáveis (SERS)**  
> **Integrantes:**  
> - Alan Junio Araujo de Souza  
> - Gustavo Zibini Belizario  
> **Entrega:** 02/10/2026  

Este diretório contém a evolução completa do sistema para a **Sprint 2 (CheckPoint 2)**, incorporando a funcionalidade de pré-dimensionamento fotovoltaico e orçamento preliminar integrado ao cadastro de imóveis e faturas de energia desenvolvido na Sprint 1.

---

## 🚀 O Que Foi Implementado na Sprint 2

1. **Datasets de Equipamentos do Mercado Brasileiro (`sprint2/backend/src/data/`)**:
   - `modulos.csv`: 12 módulos fotovoltaicos reais com especificações completas (Wp, Voc, Isc, Vmp, Imp, Eficiência, Preço e Fornecedor).
   - `inversores.csv`: 10 inversores reais de topologia On-Grid e Híbrida com suporte a baterias.
   - `baterias.csv`: 8 opções reais de armazenamento (Lítio LiFePO4 e Chumbo-Ácido estacionárias) com parâmetros de DoD, ciclos e capacidade.
2. **Motor de Cálculo Fotovoltaico (`solar.service.ts`)**:
   - Cálculo de Energia Alvo ($E_{FV}$) baseado no consumo de referência da Sprint 1 e na meta de atendimento (10% a 100%).
   - Cálculo de Potência Necessária ($P_{FV}$) em kWp com base no recurso solar (HSP) e índice de desempenho global ($\eta = 0.78$).
   - Algoritmo de seleção de módulos e cálculo de potência efetivamente instalada ($P_{instalada}$).
   - Algoritmo de seleção e validação técnica de inversores com trava de compatibilidade para inversores híbridos em cenários com baterias.
   - Dimensionamento de armazenamento com profundidade de descarga (DoD) e horas de autonomia configuráveis.
   - Formação de orçamento segregando com clareza o custo de equipamentos e custos de infraestrutura/instalação (BOS).
3. **API REST Endpoints**:
   - `GET /api/solar/equipamentos`: Catálogo completo parseado dos 3 datasets.
   - `POST /api/solar/dimensionamento`: Executa o dimensionamento fotovoltaico e orçamentário.
4. **Interface Visual no Frontend React**:
   - Modal interativo de Simulação Solar (`SolarModal.tsx`).
   - Seletor rápido de HSP por região ou valor customizado.
   - Controle dinâmico com/sem armazenamento por baterias e horas de autonomia.
   - Apresentação completa da Proposta Comercial e Técnica (KPIs de geração, fichas técnicas dos equipamentos e resumo financeiro).
5. **Garantia de Qualidade e Evidências**:
   - 27 testes automatizados cobrindo autenticação, consumo e dimensionamento solar.
   - Relatório técnico detalhado em [`docs/EVIDENCIAS_DIMENSIONAMENTO.md`](./docs/EVIDENCIAS_DIMENSIONAMENTO.md).

---

## 🛠️ Como Executar

### 1. Instalar Dependências (se necessário)
```bash
# Na pasta da sprint2
npm install
npm install --prefix backend
npm install --prefix frontend
```

### 2. Executar Testes Automatizados
```bash
npm test --prefix backend
```

### 3. Executar Frontend e Backend Integrados
```bash
npm run dev
```
- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:3001`
