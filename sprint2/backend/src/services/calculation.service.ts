import { MonthlyConsumption, EnergySummary } from '../types/index.js';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export function getMonthName(monthNumber: number): string {
  if (monthNumber >= 1 && monthNumber <= 12) {
    return MONTH_NAMES[monthNumber - 1];
  }
  return `Mês ${monthNumber}`;
}

/**
 * TSK-08.1: Find maximum monthly consumption — max(consumos)
 */
export function calculateMaxConsumption(records: MonthlyConsumption[]): number {
  if (records.length === 0) return 0;
  const max = Math.max(...records.map((r) => r.consumo_kwh));
  return Number(max.toFixed(2));
}

/**
 * TSK-09.1: Calculate arithmetic mean of monthly consumption
 */
export function calculateAverageConsumption(records: MonthlyConsumption[]): number {
  if (records.length === 0) return 0;
  const sum = records.reduce((acc, r) => acc + r.consumo_kwh, 0);
  return Number((sum / records.length).toFixed(2));
}

/**
 * TSK-10.1: Identify the peak consumption month/year
 */
export function findPeakMonth(records: MonthlyConsumption[]): EnergySummary['mes_pico'] {
  if (records.length === 0) return null;

  let peak = records[0];
  for (let i = 1; i < records.length; i++) {
    if (records[i].consumo_kwh > peak.consumo_kwh) {
      peak = records[i];
    }
  }

  return {
    mes: peak.mes,
    ano: peak.ano,
    nome_mes: getMonthName(peak.mes),
  };
}

/**
 * TSK-11.1: Build the consolidated energy summary
 */
export function buildEnergySummary(
  propertyId: number,
  records: MonthlyConsumption[],
): EnergySummary {
  return {
    imovel_id: propertyId,
    total_meses: records.length,
    consumo_maximo: calculateMaxConsumption(records),
    mes_pico: findPeakMonth(records),
    consumo_medio: calculateAverageConsumption(records),
    consumos: records.map((r) => ({
      id: r.id,
      ano: r.ano,
      mes: r.mes,
      nome_mes: getMonthName(r.mes),
      consumo_kwh: Number(r.consumo_kwh.toFixed(2)),
    })),
  };
}
