export interface ModuloFV {
  id: string;
  fabricante: string;
  modelo: string;
  potencia_wp: number;
  voc_v: number;
  isc_a: number;
  vmp_v: number;
  imp_a: number;
  eficiencia_pct: number;
  preco_brl: number;
  fornecedor: string;
  data_coleta: string;
  url_fonte: string;
}

export interface Inversor {
  id: string;
  fabricante: string;
  modelo: string;
  tipo: string;
  potencia_nominal_w: number;
  potencia_max_fv_w: number;
  tensao_max_entrada_v: number;
  faixa_mppt_min_v: number;
  faixa_mppt_max_v: number;
  corrente_max_entrada_a: number;
  numero_mppt: number;
  compativel_bateria: boolean;
  preco_brl: number;
  fornecedor: string;
  data_coleta: string;
  url_fonte: string;
}

export interface Bateria {
  id: string;
  fabricante: string;
  modelo: string;
  tecnologia: string;
  tensao_nominal_v: number;
  capacidade_ah: number;
  capacidade_kwh: number;
  dod_pct: number;
  ciclos: number;
  preco_brl: number;
  fornecedor: string;
  data_coleta: string;
  url_fonte: string;
}

export interface DimensionamentoInput {
  property_id: number;
  hsp?: number;
  percentual_atendimento?: number;
  com_armazenamento?: boolean;
  horas_autonomia?: number;
  origem_hsp?: string;
  modulo_id?: string;
  inversor_id?: string;
  bateria_id?: string;
  tarifa_kwh?: number;
}

export interface AnaliseEconomica {
  tarifa_kwh: number;
  energia_compensada_kwh: number;
  economia_mensal_brl: number;
  economia_anual_brl: number;
  payback_anos: number;
  payback_meses: number;
  premissas: string;
}

export interface PropostaSolar {
  consumo_referencia_kwh: number;
  percentual_atendimento_pct: number;
  energia_mensal_gerar_kwh: number;
  hsp: number;
  origem_hsp: string;
  potencia_fv_necessaria_kwp: number;
  potencia_instalada_kwp: number;
  modulo: {
    quantidade: number;
    equipamento: ModuloFV;
    potencia_total_w: number;
  };
  inversor: {
    quantidade: number;
    equipamento: Inversor;
    fator_dimensionamento: number;
  };
  armazenamento: {
    incluido: boolean;
    horas_autonomia: number;
    consumo_diario_kwh: number;
    energia_autonomia_kwh: number;
    capacidade_calculada_kwh: number;
    capacidade_instalada_kwh: number;
    quantidade_baterias: number;
    equipamento: Bateria | null;
  };
  geracao_estimada_mensal_kwh: number;
  orcamento: {
    custo_modulos_brl: number;
    custo_inversor_brl: number;
    custo_baterias_brl: number;
    custo_equipamentos_brl: number;
    outros_custos_brl: number;
    custo_total_estimado_brl: number;
  };
  economia?: AnaliseEconomica;
}

export interface PropostaComparativa {
  imovel: { id: number; identificacao: string; endereco: string };
  consumo_referencia_kwh: number;
  consumo_diario_kwh: number;
  hsp: number;
  origem_hsp: string;
  pr: number;
  cenario_grid_tie: PropostaSolar & { economia: AnaliseEconomica };
  cenario_hibrido: PropostaSolar & { economia: AnaliseEconomica };
}

export interface PropostaSalva {
  id: number;
  property_id: number;
  data_criacao: string;
  hsp: number;
  tarifa_kwh: number;
  potencia_instalada_kwp: number;
  geracao_mensal_kwh: number;
  investimento_grid_tie_brl: number;
  investimento_hibrido_brl: number;
  payback_grid_tie_anos: number;
  payback_hibrido_anos: number;
  dados_completos: string;
}
