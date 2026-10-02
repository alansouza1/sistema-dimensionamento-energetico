# Relatório Técnico e Evidências de Dimensionamento Fotovoltaico — Sprint 2 (CP2)

> **Instituição:** FIAP — Soluções em Energias Renováveis e Sustentáveis (SERS)  
> **Integrantes:**  
> - Alan Junio Araujo de Souza  
> - Gustavo Zibini Belizario  
> **Data de Entrega:** 02/10/2026  
> **Repositório:** `sistema-dimensionamento-energetico/sprint2`

---

## 1. Visão Geral e Integração com a Sprint 1

Na Sprint 1, construiu-se a base cadastral de imóveis e faturas de energia, determinando a **média de consumo mensal ($C_m$)** e o **mês de pico crítico**. 

Na **Sprint 2 (CP2)**, essa base foi estendida de ponta a ponta sem isolamento de software:
1. O consumo de referência do imóvel alimenta o motor matemático de dimensionamento fotovoltaico.
2. Datasets normalizados em formato CSV (`modulos.csv`, `inversores.csv`, `baterias.csv`) catalogam equipamentos comercializados no Brasil com dados e preços reais rastreáveis.
3. O algoritmo realiza a seleção técnica automatizada (módulos, inversores compatíveis e baterias opcionais).
4. O sistema gera a estimativa de orçamento segregando com transparência os custos dos equipamentos e os custos de infraestrutura/instalação (BOS).

---

## 2. Metodologia e Fórmulas Matemáticas Adotadas

### 2.1. Dimensionamento da Geração Fotovoltaica
*   **Energia Desejada ($E_{FV}$):**
    $$E_{FV} = C_m \times f$$
    *Onde $C_m$ é o consumo médio mensal da residência (kWh/mês) e $f$ é a fração de atendimento solicitada pelo cliente (ex: 100% = 1.0).*
*   **Potência Fotovoltaica Necessária ($P_{FV}$):**
    $$P_{FV} = \frac{E_{FV}}{HSP \times D \times \eta}$$
    *   $HSP$: Horas de Sol Pleno diárias (média CRESESB para Sudeste = $4.50 \text{ kWh/m}^2/\text{dia}$).
    *   $D$: Número de dias de referência ($30 \text{ dias}$).
    *   $\eta$: Performance Ratio (PR) / Fator global de desempenho do sistema adotado em **$0.78$ (78%)**, contemplando perdas por temperatura dos módulos, sujeira, perdas ôhmicas no cabeamento CC/CA e rendimento de conversão do inversor.
*   **Quantidade Mínima de Módulos ($N$):**
    $$N = \left\lceil \frac{P_{FV} \times 1000}{P_{m\acute{o}dulo}} \right\rceil$$
*   **Potência Efetivamente Instalada ($P_{instalada}$):**
    $$P_{instalada} = \frac{N \times P_{m\acute{o}dulo}}{1000} \text{ [kWp]}$$

### 2.2. Critério Técnico de Seleção e Validação do Inversor
A seleção do inversor não se baseia estritamente em menor preço:
1. **Compatibilidade com Bateria:** Caso o cliente solicite armazenamento, o sistema filtra **estritamente inversores com `compativel_bateria = true` (Inversores Híbridos)**.
2. **Capacidade de Potência e Overload (FDI):** O inversor deve operar dentro de limites seguros de sobredimensionamento de módulos (FDI até 1.40x, ou seja, $P_{nominal} \times 1.40 \ge P_{instalada}$ e $P_{max\_fv} \ge P_{instalada} \times 0.95$).

### 2.3. Dimensionamento de Armazenamento por Baterias (Opcional)
*   **Consumo Médio Diário ($E_d$):**
    $$E_d = \frac{C_m}{30}$$
*   **Energia para Autonomia ($E_{autonomia}$):**
    $$E_{autonomia} = E_d \times \left(\frac{A}{24}\right)$$
    *Onde $A$ é o tempo de autonomia solicitado em horas (ex: 12h).*
*   **Capacidade Nominal do Banco ($C_{bat}$ em kWh):**
    $$C_{bat} = \frac{E_{autonomia}}{DoD \times \eta_{bat}}$$
    *   $DoD$: Profundidade de Descarga da tecnologia (ex: $90\%$ a $95\%$ para Lítio LiFePO4; $50\%$ para Chumbo-Ácido).
    *   $\eta_{bat}$: Eficiência de carga/descarga ($0.95$ para LiFePO4; $0.85$ para Chumbo).
*   **Quantidade de Baterias ($N_{bat}$):**
    $$N_{bat} = \left\lceil \frac{C_{bat}}{C_{nominal} \times DoD} \right\rceil$$

### 2.4. Formação do Orçamento
*   **Custo de Equipamentos:**
    $$C_{equipamentos} = (N \times Pre\c{c}o_{m\acute{o}dulo}) + Pre\c{c}o_{inversor} + (N_{bat} \times Pre\c{c}o_{bateria})$$
*   **BOS e Instalação (Outros Custos):** Estruturas de fixação em alumínio para telhado cerâmico/metálico, cabos solares fotovoltaicos 6mm² com proteção UV, conectores MC4, String Box CC/CA com DPS e disjuntores, aterramento, engenharia e homologação junto à concessionária de energia:
    $$C_{outros} = 25\% \times C_{equipamentos}$$
*   **Custo Total Estimado:**
    $$C_{total} = C_{equipamentos} + C_{outros}$$

---

## 3. Catálogo de Equipamentos e Datasets Reais

Os três datasets encontram-se versionados em `sprint2/backend/src/data/`:
*   `modulos.csv`: 12 módulos fotovoltaicos de fabricantes líderes (Canadian Solar, Jinko, Trina, Longi, JA Solar, Risen, DAH Solar).
*   `inversores.csv`: 10 inversores solares (On-Grid e Híbridos) de fabricantes consolidados (Growatt, Deye, Fronius, Sungrow, GoodWe).
*   `baterias.csv`: 8 opções de armazenamento (LiFePO4 de alta ciclagem e Chumbo-Ácido Estacionárias) com fornecedores auditados no Brasil (NeoSolar, Minha Casa Solar, Portal Solar, Aldo Solar).

---

## 4. Evidências dos Cálculos (Cenários de Teste)

Utilizando a residência de teste com os dados de consumo do livro da FIAP (Média: **346.00 kWh/mês**, $HSP = 4.50 \text{ h/dia}$, $D = 30 \text{ dias}$, $\eta = 0.78$):

### Cenário 1: Dimensionamento Grid-Tie (Sem Armazenamento)
*   **Percentual de Atendimento:** 100%
*   **Energia Mensal Alvo ($E_{FV}$):** $346.00 \text{ kWh}$
*   **Potência Fotovoltaica Necessária ($P_{FV}$):**
    $$P_{FV} = \frac{346.00}{4.50 \times 30 \times 0.78} = 3.286 \text{ kWp}$$
*   **Módulo Selecionado:** JA Solar JAM72S30-545/MR (545 Wp — R$ 760,00)
*   **Quantidade de Módulos ($N$):**
    $$N = \left\lceil \frac{3.286 \times 1000}{545} \right\rceil = \lceil 6.029 \rceil = 7 \text{ módulos}$$
*   **Potência Instalada:** $7 \times 545 = 3.815 \text{ kWp}$ ($3815 \text{ W}$)
*   **Inversor Selecionado:** Growatt MIN 3000TL-X (3000 W nominal / 4200 W máx FV — R$ 2.890,00)
*   **Fator de Dimensionamento (Overload):** $3815 / 3000 = 1.27\text{x}$ (Dentro da faixa recomendada de até 1.40x)
*   **Geração Mensal Estimada:** $3.815 \times 4.50 \times 30 \times 0.78 = 401.65 \text{ kWh/mês}$
*   **Orçamento:**
    *   Módulos ($7 \times 760,00$): **R$ 5.320,00**
    *   Inversor ($1 \times 2.890,00$): **R$ 2.890,00**
    *   Baterias: **R$ 0,00**
    *   Subtotal Equipamentos: **R$ 8.210,00**
    *   BOS, Estruturas e Homologação (25%): **R$ 2.052,50**
    *   **Custo Total Estimado:** **R$ 10.262,50**

---

### Cenário 2: Dimensionamento Híbrido com Baterias (Com Armazenamento)
*   **Autonomia Desejada:** 12 horas (Período Noturno / Emergência)
*   **Consumo Diário ($E_d$):** $346.00 / 30 = 11.53 \text{ kWh/dia}$
*   **Energia para Autonomia ($E_{autonomia}$):** $11.53 \times (12 / 24) = 5.77 \text{ kWh}$
*   **Bateria Selecionada:** Pylontech US2000C (LiFePO4, 2.40 kWh nominal, 95% DoD, 6000 ciclos — R$ 5.890,00)
*   **Capacidade Útil da Bateria:** $2.40 \times 0.95 = 2.28 \text{ kWh}$
*   **Capacidade Nominal Necessária:** $5.77 / (0.95 \times 0.95) = 6.39 \text{ kWh}$
*   **Quantidade de Baterias:** $\lceil 6.39 / 2.28 \rceil = 3 \text{ unidades}$
*   **Capacidade Instalada:** $3 \times 2.40 = 7.20 \text{ kWh}$
*   **Inversor Selecionado:** Deye SUN-5K-SG03LP1-EU (Híbrido 5000 W / Suporte a Baterias — R$ 8.990,00)
*   **Orçamento:**
    *   Módulos ($7 \times 760,00$): **R$ 5.320,00**
    *   Inversor Híbrido: **R$ 8.990,00**
    *   Baterias ($3 \times 5.890,00$): **R$ 17.670,00**
    *   Subtotal Equipamentos: **R$ 31.980,00**
    *   BOS, Cabos e Instalação (25%): **R$ 7.995,00**
    *   **Custo Total Estimado:** **R$ 39.975,00**

---

## 5. Como Reproduzir e Executar

1. **Executar a suíte de testes automatizados (27 testes passando):**
   ```bash
   npm test --prefix sprint2/backend
   ```
2. **Iniciar o ecossistema integrado (Frontend + Backend):**
   ```bash
   npm run dev --prefix sprint2
   ```
3. Acessar `http://localhost:3000`, abrir o imóvel desejado e clicar em **"☀️ Simular Energia Solar"** para visualizar a proposta interativa.
