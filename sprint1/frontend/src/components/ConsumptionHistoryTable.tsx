import React, { useState } from 'react';
import { MonthlyConsumption, EnergySummary } from '../types/consumption';
import { MONTH_NAMES_PT } from '../services/api';
import { Trash2, ArrowUp, ArrowDown, Minus, History, AlertTriangle } from 'lucide-react';

interface ConsumptionHistoryTableProps {
  summary: EnergySummary | null;
  onDeleteConsumption: (consumoId: number) => Promise<void>;
}

export const ConsumptionHistoryTable: React.FC<ConsumptionHistoryTableProps> = ({
  summary,
  onDeleteConsumption,
}) => {
  const [deletingId, setDeletingId] = useState<number | null>(null);

  if (!summary || summary.consumos.length === 0) {
    return (
      <div
        id="consumption-history-empty"
        className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs text-center"
      >
        <div className="p-3 rounded-xl bg-slate-100 text-slate-400 inline-block mb-3">
          <History className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800 mb-1">Nenhuma fatura registrada</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Utilize o formulário acima para registrar o consumo das faturas mensais da concessionária.
        </p>
      </div>
    );
  }

  // Sort chronologically (PB07)
  const sortedConsumptions = [...summary.consumos].sort((a, b) => {
    if (a.ano !== b.ano) return a.ano - b.ano;
    return a.mes - b.mes;
  });

  const averageKwh = summary.consumo_medio || 0;

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await onDeleteConsumption(id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div
      id="consumption-history-card"
      className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
    >
      <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Histórico de Faturas de Energia</h3>
            <p className="text-xs text-slate-500">
              {sortedConsumptions.length}{' '}
              {sortedConsumptions.length === 1 ? 'mês registrado' : 'meses registrados'} em ordem cronológica
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table id="consumption-history-table" className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 sm:px-6">Mês / Ano</th>
              <th className="py-3 px-4 sm:px-6 text-right">Consumo (kWh)</th>
              <th className="py-3 px-4 sm:px-6 text-right">Variação vs. Média</th>
              <th className="py-3 px-4 sm:px-6 text-center">Status</th>
              <th className="py-3 px-4 sm:px-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {sortedConsumptions.map((item) => {
              const kwh = Number(item.consumo_kwh);
              const isPeak =
                summary.mes_pico &&
                summary.mes_pico.mes === item.mes &&
                summary.mes_pico.ano === item.ano;

              // Calculate variation vs average
              const diff = kwh - averageKwh;
              const percentDiff = averageKwh > 0 ? (diff / averageKwh) * 100 : 0;

              return (
                <tr
                  key={item.id ?? `${item.ano}-${item.mes}`}
                  id={`consumption-row-${item.id ?? `${item.ano}-${item.mes}`}`}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isPeak ? 'bg-rose-50/30' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-900">
                    <span className="capitalize">{MONTH_NAMES_PT[item.mes] || `Mês ${item.mes}`}</span>{' '}
                    <span className="text-slate-400 font-normal">/ {item.ano}</span>
                  </td>

                  <td className="py-3.5 px-4 sm:px-6 text-right font-bold text-slate-900">
                    {kwh.toFixed(2)} <span className="font-normal text-slate-400">kWh</span>
                  </td>

                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    {averageKwh > 0 ? (
                      <span
                        className={`inline-flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded-full ${
                          diff > 0.05
                            ? 'bg-rose-50 text-rose-700'
                            : diff < -0.05
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {diff > 0.05 ? (
                          <>
                            <ArrowUp className="w-3 h-3" />+{percentDiff.toFixed(1)}%
                          </>
                        ) : diff < -0.05 ? (
                          <>
                            <ArrowDown className="w-3 h-3" />
                            {percentDiff.toFixed(1)}%
                          </>
                        ) : (
                          <>
                            <Minus className="w-3 h-3" /> 0%
                          </>
                        )}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 sm:px-6 text-center">
                    {isPeak ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                        ★ Mês de Pico
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                        Regular
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    {item.id && (
                      <button
                        id={`btn-delete-consumption-${item.id}`}
                        type="button"
                        onClick={() => handleDelete(item.id!)}
                        disabled={deletingId === item.id}
                        title="Excluir fatura"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
