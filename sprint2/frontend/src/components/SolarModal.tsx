import React, { useState, useEffect } from 'react';
import { Property } from '../types/property';
import { EnergySummary } from '../types/consumption';
import { PropostaSolar } from '../types/solar';
import { solarService } from '../services/solarService';
import {
  Sun,
  BatteryCharging,
  Zap,
  CheckCircle2,
  X,
  Shield,
  Layers,
  Cpu,
  DollarSign,
  TrendingUp,
  Info,
  Sliders,
  HelpCircle,
} from 'lucide-react';

interface SolarModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  summary: EnergySummary | null;
}

export const SolarModal: React.FC<SolarModalProps> = ({
  isOpen,
  onClose,
  property,
  summary,
}) => {
  const [hsp, setHsp] = useState<number>(4.5);
  const [percentual, setPercentual] = useState<number>(100);
  const [comBateria, setComBateria] = useState<boolean>(false);
  const [horasAutonomia, setHorasAutonomia] = useState<number>(12);
  const [origemHsp, setOrigemHsp] = useState<string>(
    'Atlas Solarimétrico Brasileiro (CRESESB / INPE) - Média Sudeste'
  );

  const [loading, setLoading] = useState<boolean>(false);
  const [proposta, setProposta] = useState<PropostaSolar | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const consumoReferencia =
    summary && summary.consumo_medio > 0 ? summary.consumo_medio : 350;

  const handleCalcular = async () => {
    try {
      setLoading(true);
      setErro(null);
      const res = await solarService.dimensionar({
        property_id: property.id,
        hsp,
        percentual_atendimento: percentual,
        com_armazenamento: comBateria,
        horas_autonomia: comBateria ? horasAutonomia : 0,
        origem_hsp: origemHsp,
      });
      setProposta(res);
    } catch (err: any) {
      setErro(err.message || 'Falha ao processar dimensionamento fotovoltaico.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      handleCalcular();
    }
  }, [isOpen, comBateria]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-linear-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
              <Sun className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Dimensionamento de Sistema Fotovoltaico
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  Sprint 2
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Imóvel: <span className="font-semibold text-slate-700">{property.identificacao}</span> — Referência: {consumoReferencia.toFixed(1)} kWh/mês
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Simulation Controls */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-amber-500" />
              Parâmetros de Simulação
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* HSP */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Recurso Solar (HSP)</span>
                  <span className="text-amber-600 font-bold">{hsp.toFixed(2)} h/dia</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={hsp}
                    onChange={(e) => setHsp(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                  <select
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (val > 0) {
                        setHsp(val);
                        if (val === 4.36) setOrigemHsp('CRESESB - São Paulo (Sudeste)');
                        if (val === 5.5) setOrigemHsp('CRESESB - Juazeiro/Nordeste');
                        if (val === 4.0) setOrigemHsp('CRESESB - Curitiba/Sul');
                        if (val === 4.5) setOrigemHsp('CRESESB - Média Nacional');
                      }
                    }}
                    className="px-2 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-600"
                  >
                    <option value="">Região...</option>
                    <option value="4.36">SP (4.36)</option>
                    <option value="5.50">NE (5.50)</option>
                    <option value="4.00">Sul (4.00)</option>
                    <option value="4.50">Média (4.50)</option>
                  </select>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 truncate" title={origemHsp}>
                  Fonte: {origemHsp}
                </p>
              </div>

              {/* Percentual Atendimento */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Meta de Atendimento</span>
                  <span className="text-emerald-600 font-bold">{percentual}%</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={percentual}
                  onChange={(e) => setPercentual(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>10% (Parcial)</span>
                  <span>100% (Integral)</span>
                </div>
              </div>

              {/* Armazenamento Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Armazenamento por Baterias
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setComBateria(!comBateria)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      comBateria
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <BatteryCharging className="w-4 h-4" />
                    {comBateria ? 'Baterias Ativadas' : 'Sem Baterias (Grid-Tie)'}
                  </button>
                </div>
                {comBateria && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 whitespace-nowrap">Autonomia:</span>
                    <select
                      value={horasAutonomia}
                      onChange={(e) => setHorasAutonomia(Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
                    >
                      <option value="6">6 horas (Essencial)</option>
                      <option value="12">12 horas (Noturno)</option>
                      <option value="24">24 horas (Dia completo)</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleCalcular}
                disabled={loading}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
              >
                {loading ? 'Calculando dimensionamento...' : 'Recalcular Proposta'}
              </button>
            </div>
          </div>

          {erro && (
            <div className="p-4 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
              {erro}
            </div>
          )}

          {proposta && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                  <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider mb-1">
                    Geração Pretendida
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-amber-900">
                    {proposta.energia_mensal_gerar_kwh} <span className="text-xs font-normal">kWh/mês</span>
                  </div>
                  <div className="text-[10px] text-amber-700 mt-1">
                    Atende {proposta.percentual_atendimento_pct}% do consumo
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80">
                  <div className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider mb-1">
                    Potência Instalada
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-900">
                    {proposta.potencia_instalada_kwp} <span className="text-xs font-normal">kWp</span>
                  </div>
                  <div className="text-[10px] text-emerald-700 mt-1">
                    Mínimo calculado: {proposta.potencia_fv_necessaria_kwp} kWp
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80">
                  <div className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider mb-1">
                    Geração Estimada
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-blue-900">
                    {proposta.geracao_estimada_mensal_kwh} <span className="text-xs font-normal">kWh/mês</span>
                  </div>
                  <div className="text-[10px] text-blue-700 mt-1">
                    HSP: {proposta.hsp} h/dia (PR: 78%)
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80">
                  <div className="text-[11px] font-semibold text-purple-800 uppercase tracking-wider mb-1">
                    Investimento Estimado
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-purple-900">
                    R$ {proposta.orcamento.custo_total_estimado_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-purple-700 mt-1">
                    Equipamentos + BOS e Instalação
                  </div>
                </div>
              </div>

              {/* Equipamentos Selecionados */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  Equipamentos Selecionados pelo Algoritmo (Datasets Reais)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Módulos */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500 uppercase">Módulos Fotovoltaicos</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                        {proposta.modulo.quantidade} unidades
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">
                      {proposta.modulo.equipamento.fabricante} — {proposta.modulo.equipamento.modelo}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                      <p>Potência Unitária: <span className="font-semibold text-slate-700">{proposta.modulo.equipamento.potencia_wp} Wp</span> (Eficiência: {proposta.modulo.equipamento.eficiencia_pct}%)</p>
                      <p>Potência Total do Arranjo: <span className="font-semibold text-slate-700">{proposta.modulo.potencia_total_w} W</span> ({proposta.potencia_instalada_kwp} kWp)</p>
                      <p>Preço Unitário: <span className="font-semibold text-slate-700">R$ {proposta.modulo.equipamento.preco_brl.toFixed(2)}</span> ({proposta.modulo.equipamento.fornecedor})</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                      <span className="text-slate-500">Subtotal Módulos:</span>
                      <span className="font-bold text-slate-900">
                        R$ {proposta.orcamento.custo_modulos_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Inversor */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500 uppercase">Inversor Compatível</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                        proposta.inversor.equipamento.compativel_bateria
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {proposta.inversor.equipamento.tipo}
                      </span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">
                      {proposta.inversor.equipamento.fabricante} — {proposta.inversor.equipamento.modelo}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                      <p>Potência Nominal: <span className="font-semibold text-slate-700">{proposta.inversor.equipamento.potencia_nominal_w} W</span> (Máx FV: {proposta.inversor.equipamento.potencia_max_fv_w} W)</p>
                      <p>Fator de Dimensionamento (FDI): <span className="font-semibold text-slate-700">{proposta.inversor.fator_dimensionamento}x</span> (Sobrecarga segura)</p>
                      <p>Preço Inversor: <span className="font-semibold text-slate-700">R$ {proposta.inversor.equipamento.preco_brl.toFixed(2)}</span> ({proposta.inversor.equipamento.fornecedor})</p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                      <span className="text-slate-500">Subtotal Inversor:</span>
                      <span className="font-bold text-slate-900">
                        R$ {proposta.orcamento.custo_inversor_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Baterias (se houver) */}
                  {proposta.armazenamento.incluido && proposta.armazenamento.equipamento && (
                    <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-xs md:col-span-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1.5">
                          <BatteryCharging className="w-4 h-4 text-emerald-600" />
                          Banco de Armazenamento por Baterias
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                          {proposta.armazenamento.quantidade_baterias} baterias ({proposta.armazenamento.horas_autonomia}h autonomia)
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600 mt-2">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {proposta.armazenamento.equipamento.fabricante} — {proposta.armazenamento.equipamento.modelo}
                          </p>
                          <p className="mt-1">Tecnologia: <span className="font-semibold text-slate-800">{proposta.armazenamento.equipamento.tecnologia}</span> ({proposta.armazenamento.equipamento.dod_pct}% DoD)</p>
                          <p>Vida útil estimada: <span className="font-semibold text-slate-800">{proposta.armazenamento.equipamento.ciclos} ciclos</span></p>
                        </div>
                        <div className="space-y-0.5 sm:border-l sm:border-emerald-200 sm:pl-4">
                          <p>Capacidade Calculada: <span className="font-semibold text-slate-800">{proposta.armazenamento.capacidade_calculada_kwh} kWh</span></p>
                          <p>Capacidade Instalada: <span className="font-semibold text-slate-800">{proposta.armazenamento.capacidade_instalada_kwh} kWh</span></p>
                          <p>Subtotal Baterias: <span className="font-bold text-emerald-900">R$ {proposta.orcamento.custo_baterias_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Orçamento e Formação de Custos */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white">
                <div className="flex items-center gap-2 mb-4 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <DollarSign className="w-4 h-4" />
                  Formação do Orçamento e Discriminação Financeira
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">Custo dos Equipamentos</span>
                    <span className="text-lg font-bold text-white">
                      R$ {proposta.orcamento.custo_equipamentos_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Módulos + Inversor {proposta.armazenamento.incluido ? '+ Baterias' : ''}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">BOS, Estrutura e Instalação</span>
                    <span className="text-lg font-bold text-amber-400">
                      R$ {proposta.orcamento.outros_custos_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Cabos UV, MC4, DPS, fixações e homologação</p>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">Custo Total da Solução</span>
                    <span className="text-xl font-black text-emerald-400">
                      R$ {proposta.orcamento.custo_total_estimado_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Solução completa chave na mão</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                  <Info className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>
                    Pré-dimensionamento acadêmico para a disciplina de SERS (FIAP). Preços rastreáveis coletados no mercado nacional.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Algoritmo em conformidade com o roteiro CP2 (FIAP SERS).
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
