import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'csv-parse/sync';
import { ModuloFV, Inversor, Bateria, DimensionamentoSolarInput, PropostaSolar } from '../types/solar.js';
import { PropertyService } from './property.service.js';
import { ConsumptionService } from './consumption.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class SolarService {
  private static dataDir = path.resolve(__dirname, '../data');

  public static getModulos(): ModuloFV[] {
    const filePath = path.join(this.dataDir, 'modulos.csv');
    const content = fs.readFileSync(filePath, 'utf-8');
    const records = parse(content, { columns: true, skip_empty_lines: true, trim: true });

    return records.map((r: any) => ({
      id: r.id,
      fabricante: r.fabricante,
      modelo: r.modelo,
      potencia_wp: Number(r.potencia_wp),
      voc_v: Number(r.voc_v),
      isc_a: Number(r.isc_a),
      vmp_v: Number(r.vmp_v),
      imp_a: Number(r.imp_a),
      eficiencia_pct: Number(r.eficiencia_pct),
      preco_brl: Number(r.preco_brl),
      fornecedor: r.fornecedor,
      data_coleta: r.data_coleta,
      url_fonte: r.url_fonte,
    }));
  }

  public static getInversores(): Inversor[] {
    const filePath = path.join(this.dataDir, 'inversores.csv');
    const content = fs.readFileSync(filePath, 'utf-8');
    const records = parse(content, { columns: true, skip_empty_lines: true, trim: true });

    return records.map((r: any) => ({
      id: r.id,
      fabricante: r.fabricante,
      modelo: r.modelo,
      tipo: r.tipo,
      potencia_nominal_w: Number(r.potencia_nominal_w),
      potencia_max_fv_w: Number(r.potencia_max_fv_w),
      tensao_max_entrada_v: Number(r.tensao_max_entrada_v),
      faixa_mppt_min_v: Number(r.faixa_mppt_min_v),
      faixa_mppt_max_v: Number(r.faixa_mppt_max_v),
      corrente_max_entrada_a: Number(r.corrente_max_entrada_a),
      numero_mppt: Number(r.numero_mppt),
      compativel_bateria: String(r.compativel_bateria).toLowerCase() === 'sim' || String(r.compativel_bateria).toLowerCase() === 'true',
      preco_brl: Number(r.preco_brl),
      fornecedor: r.fornecedor,
      data_coleta: r.data_coleta,
      url_fonte: r.url_fonte,
    }));
  }

  public static getBaterias(): Bateria[] {
    const filePath = path.join(this.dataDir, 'baterias.csv');
    const content = fs.readFileSync(filePath, 'utf-8');
    const records = parse(content, { columns: true, skip_empty_lines: true, trim: true });

    return records.map((r: any) => ({
      id: r.id,
      fabricante: r.fabricante,
      modelo: r.modelo,
      tecnologia: r.tecnologia,
      tensao_nominal_v: Number(r.tensao_nominal_v),
      capacidade_ah: Number(r.capacidade_ah),
      capacidade_kwh: Number(r.capacidade_kwh),
      dod_pct: Number(r.dod_pct),
      ciclos: Number(r.ciclos),
      preco_brl: Number(r.preco_brl),
      fornecedor: r.fornecedor,
      data_coleta: r.data_coleta,
      url_fonte: r.url_fonte,
    }));
  }

  public static dimensionar(userId: number, input: DimensionamentoSolarInput): PropostaSolar {
    const property = PropertyService.findById(input.property_id, userId);
    if (!property) {
      throw new Error('Imóvel não encontrado ou não pertence ao usuário.');
    }

    const summary = ConsumptionService.getSummary(input.property_id, userId);
    const consumoRef = summary.consumo_medio > 0 ? summary.consumo_medio : 350; // Fallback caso não haja faturas registradas ainda

    const percentual = input.percentual_atendimento && input.percentual_atendimento > 0 
      ? input.percentual_atendimento 
      : 100;
    const fatorAtendimento = percentual > 1 ? percentual / 100 : percentual;
    const percentualPct = percentual > 1 ? percentual : percentual * 100;

    const hsp = input.hsp && input.hsp > 0 ? input.hsp : 4.5;
    const origemHsp = input.origem_hsp || 'Atlas Solarimétrico Brasileiro (CRESESB / INPE) - Média Sudeste';
    const dias = 30;
    const rendimentoGlobal = 0.78; // Performance Ratio (PR) adotado

    // 1. Energia mensal que se pretende gerar (kWh)
    const energiaMensal = Math.round((consumoRef * fatorAtendimento) * 100) / 100;

    // 2. Potência fotovoltaica necessária P_FV (kWp)
    // P_FV = E_FV / (HSP * D * eta)
    const potenciaFvNecessariaKwp = Math.round((energiaMensal / (hsp * dias * rendimentoGlobal)) * 1000) / 1000;

    // 3. Seleção de Módulo
    const modulos = this.getModulos();
    if (modulos.length === 0) {
      throw new Error('Nenhum módulo cadastrado na base.');
    }

    let moduloEscolhido = input.modulo_id 
      ? modulos.find(m => m.id === input.modulo_id) 
      : null;

    if (!moduloEscolhido) {
      // Ordena por melhor custo-benefício (R$ / Wp)
      const modulosOrdenados = [...modulos].sort((a, b) => (a.preco_brl / a.potencia_wp) - (b.preco_brl / b.potencia_wp));
      moduloEscolhido = modulosOrdenados[0];
    }

    // N = teto((P_FV * 1000) / P_modulo)
    const quantidadeModulos = Math.ceil((potenciaFvNecessariaKwp * 1000) / moduloEscolhido.potencia_wp);
    const potenciaInstaladaW = quantidadeModulos * moduloEscolhido.potencia_wp;
    const potenciaInstaladaKwp = Math.round((potenciaInstaladaW / 1000) * 1000) / 1000;

    // 4. Seleção e Validação do Inversor
    const inversores = this.getInversores();
    const comArmazenamento = !!input.com_armazenamento;

    let inversoresCandidatos = inversores.filter(inv => {
      if (comArmazenamento && !inv.compativel_bateria) {
        return false;
      }
      // Critério técnico de compatibilidade:
      // 1. Potência: O inversor deve suportar a potência instalada com sobrecarga máxima de 40% (FDI >= 0.71)
      const atendePotenciaMin = inv.potencia_nominal_w * 1.40 >= potenciaInstaladaW;
      const atendePotenciaMax = inv.potencia_max_fv_w >= potenciaInstaladaW * 0.95;

      // 2. Tensão MPPT: A tensão de operação dos módulos (Vmp) deve caber na faixa MPPT do inversor
      const vmpArranjo = moduloEscolhido.vmp_v; // série mínima de 1 módulo
      const vocArranjo = moduloEscolhido.voc_v;
      const atendeVmpMppt = vmpArranjo >= inv.faixa_mppt_min_v && vmpArranjo <= inv.faixa_mppt_max_v;
      const atendeVocMax = vocArranjo <= inv.tensao_max_entrada_v;

      // 3. Corrente: A corrente de curto-circuito dos módulos não deve exceder o máximo do inversor
      const atendeCorrMax = moduloEscolhido.isc_a <= inv.corrente_max_entrada_a;

      return atendePotenciaMin && atendePotenciaMax && atendeVmpMppt && atendeVocMax && atendeCorrMax;
    });

    if (inversoresCandidatos.length === 0) {
      // Fallback: relaxa critérios MPPT mas mantém compatibilidade de potência mínima e bateria
      inversoresCandidatos = inversores
        .filter(inv => (!comArmazenamento || inv.compativel_bateria) && inv.potencia_max_fv_w >= potenciaInstaladaW * 0.80)
        .sort((a, b) => Math.abs(a.potencia_nominal_w - potenciaInstaladaW) - Math.abs(b.potencia_nominal_w - potenciaInstaladaW));
    }

    let inversorEscolhido = input.inversor_id 
      ? inversores.find(i => i.id === input.inversor_id)
      : null;

    if (!inversorEscolhido && inversoresCandidatos.length > 0) {
      // Ordena pelo menor preço dentro dos compatíveis
      inversoresCandidatos.sort((a, b) => a.preco_brl - b.preco_brl);
      inversorEscolhido = inversoresCandidatos[0];
    }

    if (!inversorEscolhido) {
      throw new Error('Nenhum inversor compatível encontrado para a configuração solicitada.');
    }

    const fatorDimensionamento = Math.round((potenciaInstaladaW / inversorEscolhido.potencia_nominal_w) * 100) / 100;

    // 5. Dimensionamento de Baterias (Armazenamento opcional)
    let armazenamentoResultado = {
      incluido: false,
      horas_autonomia: 0,
      consumo_diario_kwh: 0,
      energia_autonomia_kwh: 0,
      capacidade_calculada_kwh: 0,
      capacidade_instalada_kwh: 0,
      quantidade_baterias: 0,
      equipamento: null as Bateria | null,
    };

    let custoBaterias = 0;

    if (comArmazenamento) {
      const horasAutonomia = input.horas_autonomia && input.horas_autonomia > 0 ? input.horas_autonomia : 12;
      const baterias = this.getBaterias();
      
      let bateriaEscolhida = input.bateria_id 
        ? baterias.find(b => b.id === input.bateria_id)
        : null;

      if (!bateriaEscolhida) {
        // Prefere baterias LiFePO4 com melhor custo por kWh útil
        const lifepo4 = baterias.filter(b => b.tecnologia.includes('LiFePO4'));
        const listaParaOrdenar = lifepo4.length > 0 ? lifepo4 : baterias;
        listaParaOrdenar.sort((a, b) => {
          const custoUtilA = a.preco_brl / (a.capacidade_kwh * (a.dod_pct / 100));
          const custoUtilB = b.preco_brl / (b.capacidade_kwh * (b.dod_pct / 100));
          return custoUtilA - custoUtilB;
        });
        bateriaEscolhida = listaParaOrdenar[0];
      }

      const consumoDiario = Math.round((consumoRef / 30) * 100) / 100;
      // E_autonomia = E_d * (A / 24)
      const energiaAutonomia = Math.round((consumoDiario * (horasAutonomia / 24)) * 100) / 100;
      
      const dod = bateriaEscolhida.dod_pct / 100;
      const etaBat = bateriaEscolhida.tecnologia.includes('LiFePO4') ? 0.95 : 0.85;
      
      // C_bat = E_autonomia / (DoD * eta_bat)
      const capacidadeCalculada = Math.round((energiaAutonomia / (dod * etaBat)) * 100) / 100;
      const capacidadeUtil = bateriaEscolhida.capacidade_kwh * dod;
      
      // N_bat = teto(C_necessaria / C_util)
      const quantidadeBaterias = Math.max(1, Math.ceil(capacidadeCalculada / capacidadeUtil));
      const capacidadeInstalada = Math.round((quantidadeBaterias * bateriaEscolhida.capacidade_kwh) * 100) / 100;

      custoBaterias = quantidadeBaterias * bateriaEscolhida.preco_brl;

      armazenamentoResultado = {
        incluido: true,
        horas_autonomia: horasAutonomia,
        consumo_diario_kwh: consumoDiario,
        energia_autonomia_kwh: energiaAutonomia,
        capacidade_calculada_kwh: capacidadeCalculada,
        capacidade_instalada_kwh: capacidadeInstalada,
        quantidade_baterias: quantidadeBaterias,
        equipamento: bateriaEscolhida,
      };
    }

    // 6. Geração Estimada Mensal
    const geracaoEstimadaMensal = Math.round((potenciaInstaladaKwp * hsp * dias * rendimentoGlobal) * 100) / 100;

    // 7. Orçamento
    const custoModulos = quantidadeModulos * moduloEscolhido.preco_brl;
    const custoInversor = inversorEscolhido.preco_brl;
    const custoEquipamentos = Math.round((custoModulos + custoInversor + custoBaterias) * 100) / 100;
    
    // Outros custos: Estrutura em alumínio, cabos de cobre solares, string box CC/CA, conectores MC4 e homologação (25% do valor dos equipamentos)
    const outrosCustos = Math.round((custoEquipamentos * 0.25) * 100) / 100;
    const custoTotal = Math.round((custoEquipamentos + outrosCustos) * 100) / 100;

    return {
      consumo_referencia_kwh: Math.round(consumoRef * 100) / 100,
      percentual_atendimento_pct: Math.round(percentualPct * 10) / 10,
      energia_mensal_gerar_kwh: energiaMensal,
      hsp,
      origem_hsp: origemHsp,
      potencia_fv_necessaria_kwp: potenciaFvNecessariaKwp,
      potencia_instalada_kwp: potenciaInstaladaKwp,
      modulo: {
        quantidade: quantidadeModulos,
        equipamento: moduloEscolhido,
        potencia_total_w: potenciaInstaladaW,
      },
      inversor: {
        quantidade: 1,
        equipamento: inversorEscolhido,
        fator_dimensionamento: fatorDimensionamento,
      },
      armazenamento: armazenamentoResultado,
      geracao_estimada_mensal_kwh: geracaoEstimadaMensal,
      orcamento: {
        custo_modulos_brl: custoModulos,
        custo_inversor_brl: custoInversor,
        custo_baterias_brl: custoBaterias,
        custo_equipamentos_brl: custoEquipamentos,
        outros_custos_brl: outrosCustos,
        custo_total_estimado_brl: custoTotal,
      },
    };
  }
}
