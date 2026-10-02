import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from 'recharts';
import { EnergySummary } from '../types/consumption';
import { BarChart3, Info } from 'lucide-react';

const SHORT_MONTHS: Record<number, string> = {
  1: 'Jan',
  2: 'Fev',
  3: 'Mar',
  4: 'Abr',
  5: 'Mai',
  6: 'Jun',
  7: 'Jul',
  8: 'Ago',
  9: 'Set',
  10: 'Out',
  11: 'Nov',
  12: 'Dez',
};

interface ConsumptionBarChartProps {
  summary: EnergySummary | null;
}

export const ConsumptionBarChart: React.FC<ConsumptionBarChartProps> = ({ summary }) => {
  if (!summary || summary.consumos.length === 0) {
    return (
      <div
        id="consumption-bar-chart-empty"
        className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center h-80"
      >
        <div className="p-3.5 rounded-2xl bg-slate-100 text-slate-400 mb-3">
          <BarChart3 className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Nenhum consumo registrado</h3>
        <p className="text-xs text-slate-500 max-w-sm">
          Adicione as faturas de consumo de energia para gerar o gráfico histórico comparativo.
        </p>
      </div>
    );
  }

  const chartData = summary.consumos.map((item) => {
    const isPeak =
      summary.mes_pico &&
      summary.mes_pico.mes === item.mes &&
      summary.mes_pico.ano === item.ano;

    const shortYear = String(item.ano).slice(-2);
    const label = `${SHORT_MONTHS[item.mes] || item.mes}/${shortYear}`;

    return {
      id: item.id,
      label,
      fullDate: `${SHORT_MONTHS[item.mes] || item.mes} de ${item.ano}`,
      kwh: Number(item.consumo_kwh),
      isPeak,
    };
  });

  const avgKwh = Number(summary.consumo_medio);

  return (
    <div
      id="consumption-bar-chart-card"
      className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            Histórico Mensal de Consumo (kWh)
          </h3>
          <p className="text-xs text-slate-500">
            Comparativo de demanda energética mensal com indicação visual de pico e linha média
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block"></span>
            <span className="text-slate-600 font-medium">Consumo Regular</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block"></span>
            <span className="text-slate-900 font-bold">Mês de Pico</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-amber-500 inline-block border-t border-dashed"></span>
            <span className="text-slate-600 font-medium">Média ({avgKwh.toFixed(1)} kWh)</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="label"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tickFormatter={(val) => `${val}k`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-800">
                      <p className="font-semibold text-slate-200 mb-1">{data.fullDate}</p>
                      <p className="text-emerald-400 font-bold text-sm">
                        Consumo: {Number(data.kwh).toFixed(2)} kWh
                      </p>
                      {data.isPeak && (
                        <p className="text-rose-400 font-semibold text-[11px] mt-1 flex items-center gap-1">
                          ★ Mês de Maior Consumo (Pico)
                        </p>
                      )}
                      <p className="text-slate-400 text-[10px] mt-1">
                        Diferença da média:{' '}
                        {data.kwh >= avgKwh
                          ? `+${(data.kwh - avgKwh).toFixed(1)}`
                          : `${(data.kwh - avgKwh).toFixed(1)}`}{' '}
                        kWh
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine
              y={avgKwh}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={2}
              label={{
                value: `Média: ${avgKwh.toFixed(0)} kWh`,
                position: 'insideTopRight',
                fill: '#b45309',
                fontSize: 11,
                fontWeight: 600,
              }}
            />
            <Bar dataKey="kwh" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isPeak ? '#f43f5e' : '#10b981'}
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
        <Info className="w-4 h-4 text-slate-400 shrink-0" />
        <span>
          O pico máximo é o principal parâmetro de segurança técnica para dimensionamento do inversor
          solar fotovoltaico e padrão de entrada.
        </span>
      </div>
    </div>
  );
};
