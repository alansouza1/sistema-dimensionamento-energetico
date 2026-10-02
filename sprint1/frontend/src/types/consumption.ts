export interface MonthlyConsumption {
  id?: number;
  imovel_id?: number;
  ano: number;
  mes: number;
  consumo_kwh: number;
}

export interface PeakMonth {
  mes: number;
  ano: number;
  nome_mes: string;
}

export interface EnergySummary {
  imovel_id: number;
  total_meses: number;
  consumo_maximo: number;
  mes_pico: PeakMonth | null;
  consumo_medio: number;
  consumos: MonthlyConsumption[];
}

export interface CreateConsumptionInput {
  ano: number;
  mes: number;
  consumo_kwh: number;
}

export interface ConsumptionBatchInput {
  faturas: CreateConsumptionInput[];
}
