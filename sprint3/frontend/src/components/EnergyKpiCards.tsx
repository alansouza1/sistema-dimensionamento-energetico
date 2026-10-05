import React from 'react';
import { EnergySummary } from '../types/consumption';
import { Zap, Activity, Calendar, ArrowUpRight, Flame, BarChart3 } from 'lucide-react';

interface EnergyKpiCardsProps {
  summary: EnergySummary | null;
  isLoading?: boolean;
}

export const EnergyKpiCards: React.FC<EnergyKpiCardsProps> = ({ summary, isLoading = false }) => {
  const maxConsumption = summary ? Number(summary.consumo_maximo).toFixed(2) : '0.00';
  const avgConsumption = summary ? Number(summary.consumo_medio).toFixed(2) : '0.00';
  const totalMonths = summary ? summary.total_meses : 0;
  const peakMonthText =
    summary && summary.mes_pico
      ? `${summary.mes_pico.nome_mes} / ${summary.mes_pico.ano}`
      : 'Sem dados';

  return (
    <div id="energy-kpi-cards-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Consumo Máximo Mensal (PB08) */}
      <div
        id="kpi-card-max-consumption"
        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-slate-300"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Consumo Máximo
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60">
            <ArrowUpRight className="w-3 h-3" />
            Pico Registrado
          </span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isLoading ? '...' : maxConsumption}
          </span>
          <span className="text-xs font-semibold text-slate-500">kWh/mês</span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <div className="p-1 rounded-md bg-rose-100 text-rose-600">
            <Flame className="w-3.5 h-3.5" />
          </div>
          <span>Maior demanda histórica</span>
        </div>
      </div>

      {/* 2. Mês de Maior Consumo / Pico (PB09) */}
      <div
        id="kpi-card-peak-month"
        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-slate-300"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Mês de Pico
          </span>
          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
          {isLoading ? '...' : peakMonthText}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
          <span>Fatura com carga crítica</span>
        </div>
      </div>

      {/* 3. Consumo Médio Mensal (PB10) */}
      <div
        id="kpi-card-average-consumption"
        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-slate-300"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Consumo Médio
          </span>
          <div className="p-1.5 rounded-lg bg-cyan-100 text-cyan-600">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isLoading ? '...' : avgConsumption}
          </span>
          <span className="text-xs font-semibold text-slate-500">kWh/mês</span>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
          <span>Diário: <strong>{summary ? (Number(summary.consumo_medio) / 30).toFixed(2) : '0.00'} kWh/dia</strong></span>
          <span>Demanda: <strong>{summary ? (Number(summary.consumo_medio) / 720).toFixed(2) : '0.00'} kW</strong></span>
        </div>
      </div>

      {/* 4. Meses Analisados (PB11) */}
      <div
        id="kpi-card-analyzed-months"
        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-slate-300"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Meses Analisados
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isLoading ? '...' : totalMonths}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            {totalMonths === 1 ? 'mês cadastrado' : 'meses cadastrados'}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Amostra de dimensionamento</span>
        </div>
      </div>
    </div>
  );
};
