# Roteiro da Sprint Review & Defesa do Projeto (CP3)

> **FIAP — Soluções em Energias Renováveis e Sustentáveis (SERS)**  
> **Sistema de Dimensionamento Energético Residencial**  
> **Integrantes:** Alan Junio Araujo de Souza & Gustavo Zibini Belizario  
> **Data de Entrega / Apresentação:** 23/10/2026  

---

## 1. Roteiro de Demonstração do Software (15 Passos)

Este roteiro guia a apresentação prática do software durante a Sprint Review, demonstrando o fluxo operacional completo do sistema funcional:

### Passo 1: Seleção da Residência
- **Ação na Tela:** Acessar a aplicação autenticado, selecionar uma residência cadastrada na lista de imóveis (ex: *"Residência Padrão — Rua das Palmeiras, 120"*).
- **Argumento:** O sistema aproveita o cadastro pré-existente e garante isolamento multi-tenant (cada usuário enxerga apenas seus próprios imóveis).

### Passo 2: Equipamentos e Consumo Calculado
- **Ação na Tela:** Exibir os cards de indicadores de consumo e a tabela de histórico de faturas.
- **Argumento:** O sistema calcula automaticamente a média mensal ($E_{mês} \approx 346 \text{ kWh/mês}$), o consumo diário ($E_{dia} \approx 11,53 \text{ kWh/dia}$), o mês de maior consumo e o consumo máximo registrado.

### Passo 3: Dimensionamento Fotovoltaico
- **Ação na Tela:** Clicar no botão **"☀️ Simular Energia Solar"** na tela do imóvel para abrir o modal de simulação integrado.
- **Argumento:** O sistema utiliza o consumo médio do imóvel automaticamente como consumo de referência para a simulação, permitindo ajustar a meta de atendimento (ex: 100%).

### Passo 4: HSP e PR Utilizados
- **Ação na Tela:** Mostrar os campos de controle no topo do modal.
- **Argumento:**
  - **HSP (Horas de Sol Pico):** Adotado padrão de **$4,50 \text{ h/dia}$** (ou seleção regional: $4,36 \text{ h/dia}$ para São Paulo/Sudeste), referenciado no *Atlas Solarimétrico Brasileiro (CRESESB/INPE)*.
  - **PR (Performance Ratio):** Adotado valor de **$78\%$ ($0,78$)**, representando perdas térmicas nos módulos, sujidade, perdas por cabeamento CC/CA e rendimento do inversor conforme literatura técnica de engenharia.

### Passo 5: Consulta aos Datasets Estruturados
- **Ação na Tela:** Apresentar a origem dos dados na aba *"Memorial Técnico de Equipamentos"*.
- **Argumento:** Os dados de módulos, inversores e baterias vêm de arquivos `.csv` estruturados com equipamentos comercializados no Brasil e preços rastreáveis (Canadian Solar, Jinko, Growatt, Deye, Pylontech, etc.), desacoplados da lógica de cálculo.

### Passo 6: Seleção dos Módulos Fotovoltaicos
- **Ação na Tela:** Mostrar os módulos selecionados pelo algoritmo.
- **Argumento:**
  - O algoritmo ordena os módulos por melhor relação custo-benefício ($\text{R\$/Wp}$).
  - Aplica a fórmula: $P_{FV} = \frac{E_{dia}}{HSP \times PR} \approx 3,286 \text{ kWp}$.
  - Calcula a quantidade de módulos: $N_{mod} = \left\lceil \frac{P_{FV} \times 1000}{P_{mod}} \right\rceil$ (ex: $7$ módulos de $545\text{Wp}$ JA Solar).
  - Potência efetivamente instalada: $P_{inst} = 7 \times 545 = 3,815 \text{ kWp}$.

### Passo 7: Seleção e Compatibilidade do Inversor
- **Ação na Tela:** Mostrar o inversor selecionado e seus parâmetros de validação.
- **Argumento:** O sistema não seleciona apenas pelo preço, mas valida:
  1. Faixa de sobrecarga segura ($FDI \le 1,40\text{x}$ ou $R_{DC/AC}$).
  2. Compatibilidade de tensão $V_{mp}$ dentro da faixa MPPT do inversor ($V_{min} \le V_{mp} \le V_{max}$).
  3. Tensão máxima de circuito aberto $V_{oc} \le V_{max\_entrada}$.
  4. Corrente de curto-circuito $I_{sc} \le I_{max\_entrada}$.
  5. Trava mandatória: para o cenário com baterias, o sistema filtra **obrigatoriamente inversores com `compativel_bateria = true` (Híbridos)**.

### Passo 8: Geração Fotovoltaica Estimada
- **Ação na Tela:** Apresentar a geração mensal estimada calculada pelo sistema.
- **Argumento:**
  - $E_{gerada,dia} = P_{inst} \times HSP \times PR \approx 3,815 \times 4,5 \times 0,78 \approx 13,39 \text{ kWh/dia}$.
  - $E_{gerada,mês} = 13,39 \times 30 \approx 401,7 \text{ kWh/mês}$.

### Passo 9: Comparação Geração × Consumo
- **Ação na Tela:** Mostrar o indicador de atendimento da demanda.
- **Argumento:** Com geração estimada de $401,7 \text{ kWh/mês}$ frente a um consumo de $346 \text{ kWh/mês}$, o percentual de atendimento alcança **$116\%$**, gerando excedente que será injetado na rede e convertido em créditos de energia junto à distribuidora.

### Passo 10: Opção Sem Baterias (Grid-Tie)
- **Ação na Tela:** Destacar a coluna do **Cenário 1 (Grid-Tie Puro)**.
- **Argumento:** Sistema conectado diretamente à rede, utilizando inversor On-Grid convencional (ex: Growatt 3000TL-X), sem custo com acumuladores.

### Passo 11: Opção Com Baterias e Autonomia (Híbrido)
- **Ação na Tela:** Destacar a coluna do **Cenário 2 (Híbrido com Armazenamento)** e variar o seletor de autonomia ($6\text{h}$, $12\text{h}$, $24\text{h}$).
- **Argumento:**
  - O sistema calcula a energia para autonomia: $E_{autonomia} = E_{dia} \times \left(\frac{A}{24}\right)$. Para $12\text{h}$, $E_{aut} \approx 5,77 \text{ kWh}$.
  - Dimensiona a capacidade útil com profundidade de descarga ($DoD = 90\%$) e eficiência ($\eta_{bat} = 0,95$ para LiFePO4): $C_{bat} = \frac{5,77}{0,90 \times 0,95} \approx 6,74 \text{ kWh}$.
  - Seleciona a quantidade de baterias reais: ex: $3$ unidades Pylontech US2000C ($7,2 \text{ kWh}$ instalados).

### Passo 12: Orçamento Automático
- **Ação na Tela:** Exibir a composição de custos de cada cenário.
- **Argumento:** Custo discriminado de módulos, inversores e baterias recuperados diretamente dos datasets de mercado, acrescidos de $25\%$ de BOS (Balance of System: cabos solares, conectores MC4, estrutura de fixação, string box e homologação).

### Passo 13: Comparação dos Cenários (Lado a Lado - PB14)
- **Ação na Tela:** Apresentar a visão comparativa direta da aba *"Comparativo dos Cenários"*.
- **Argumento:** Comparação transparente de especificações, investimentos, geração e retorno financeiro entre a alternativa On-Grid e Híbrida.

### Passo 14: Economia Estimada e Payback Simples (PB15 e PB16)
- **Ação na Tela:** Mostrar os cards de Economia Mensal, Economia Anual e o tempo de Payback Simples.
- **Argumento:**
  - Tarifa utilizada: $\text{R\$ } 0,85\text{/kWh}$ (editável no painel).
  - Energia compensada: $346 \text{ kWh/mês}$.
  - Economia: $\approx \text{R\$ } 294,10\text{/mês} \rightarrow \text{R\$ } 3.529,20\text{/ano}$.
  - **Payback Simples Grid-Tie:** $\frac{\text{R\$ } 10.262,50}{\text{R\$ } 3.529,20} \approx \mathbf{2,9 \text{ anos}}$ ($35$ meses).
  - **Payback Simples Híbrido:** $\frac{\text{R\$ } 39.975,00}{\text{R\$ } 3.529,20} \approx \mathbf{11,3 \text{ anos}}$ ($136$ meses).

### Passo 15: Proposta Final, Persistência e Exportação (PB20 e PB21)
- **Ação na Tela:**
  1. Clicar em **"Salvar Proposta"** e demonstrar a persistência na aba *"Propostas Salvas"* do banco SQLite.
  2. Clicar em **"Imprimir / PDF"** e demonstrar a visualização da proposta comercial formatada para entrega ao cliente final.

---

## 2. Resposta à Questão Final da Sprint Review (Seção 9)

### Pergunta Oficial:
> *"Para a residência utilizada na demonstração, qual solução faz mais sentido: sistema fotovoltaico sem armazenamento ou sistema com baterias? Quais resultados técnicos e econômicos do projeto sustentam a análise?"*

### Parecer Técnico-Econômico Fundamentado:

#### Conclusão Direta:
Para a residência analisada (consumo médio de **$346 \text{ kWh/mês}$** em ambiente residencial urbano conectado à rede da distribuidora), a **solução fotovoltaica SEM armazenamento (Grid-Tie Puro)** é **expressivamente superior e a mais sensata tecnicamente e economicamente**.

#### Sustentação com Resultados Numéricos do Projeto:

| Indicador | Cenário 1: Sem Baterias (Grid-Tie) | Cenário 2: Com Baterias (Híbrido 12h) | Variação / Impacto |
|---|:---:|:---:|:---:|
| **Investimento Total** | **R$ 10.262,50** | **R$ 39.975,00** | **+289% (+R$ 29.712,50)** |
| **Equipamentos Principais** | 7x Módulos 545W + 1x Inversor On-Grid 3kW | 7x Módulos 545W + 1x Inversor Híbrido 3kW + 3x Baterias LiFePO4 2.4kWh | Custo adicional de bateria e inversor híbrido |
| **Geração Mensal Estimada** | $401,7 \text{ kWh/mês}$ | $401,7 \text{ kWh/mês}$ | Idêntica |
| **Economia Anual Estimada** | **R$ 3.529,20** | **R$ 3.529,20** | Idêntica (tarifa plana R$ 0,85/kWh) |
| **Payback Simples** | **2,9 anos (35 meses)** | **11,3 anos (136 meses)** | **Retorno 3,9x mais lento** |
| **Vida Útil dos Equipamentos** | Módulos: 25 anos / Inversor: 10-15 anos | Baterias LiFePO4: 6.000 ciclos (~10 a 12 anos) | Baterias exigirão reinvestimento no horizonte de payback |

#### Fundamentação Técnica e Econômica:
1. **Ausência de Ganho Tarifário com Baterias:**  
   No regime tarifário convencional residencial brasileiro (Grupo B, tarifa monômia/plana), o kWh consumido à noite possui o mesmo valor financeiro do kWh gerado e injetado durante o dia. Portanto, a rede elétrica da concessionária funciona como uma **"bateria virtual de 100% de rendimento"** e sem custo de aquisição através do sistema de compensação de créditos (Lei 14.300 / Net Metering).
2. **Inviabilidade do Payback no Cenário Híbrido:**  
   O payback simples de **$11,3 \text{ anos}$** é extremamente próximo ou superior ao fim da vida útil de projeto das próprias células de bateria (~6.000 ciclos diários $\approx 12$ anos a $90\%$ DoD), significando que o cliente precisaria reinvestir em novas baterias antes mesmo de amortizar o capital investido.
3. **Quando o Sistema com Baterias se Justifica?**  
   O sistema Híbrido/Off-Grid só faz sentido técnico em situações de:
   - **Localidades isoladas** sem conexão física à rede de distribuição;
   - **Alta criticidade energética**, onde quedas de fornecimento causam prejuízos severos ou risco à vida (home care, conservação de medicamentos, servidores de TI domésticos);
   - Futuras implementações de tarifas diferenciadas por horário (Tarifa Branca com grande spread entre ponta e fora-ponta que compense o custo nivelado do armazenamento - LCOS).
