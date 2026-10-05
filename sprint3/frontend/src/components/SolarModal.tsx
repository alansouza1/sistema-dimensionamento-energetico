import React, { useState, useEffect } from 'react';
import { Property } from '../types/property';
import { EnergySummary } from '../types/consumption';
import { PropostaComparativa, PropostaSalva } from '../types/solar';
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
  Printer,
  Save,
  Clock,
  Trash2,
  ArrowRight,
  Sparkles,
  BarChart3,
  Award,
  AlertCircle,
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
  // Input parameters
  const [hsp, setHsp] = useState<number>(4.5);
  const [percentual, setPercentual] = useState<number>(100);
  const [horasAutonomia, setHorasAutonomia] = useState<number>(12);
  const [tarifaKwh, setTarifaKwh] = useState<number>(0.85);
  const [origemHsp, setOrigemHsp] = useState<string>(
    'Atlas Solarimétrico Brasileiro (CRESESB / INPE) - Média Sudeste'
  );

  // Active view tab
  const [activeTab, setActiveTab] = useState<'comparativo' | 'detalhes' | 'historico'>('comparativo');
  const [detalhesCenario, setDetalhesCenario] = useState<'grid_tie' | 'hibrido'>('grid_tie');

  // State
  const [loading, setLoading] = useState<boolean>(false);
  const [salvando, setSalvando] = useState<boolean>(false);
  const [comparativo, setComparativo] = useState<PropostaComparativa | null>(null);
  const [propostasSalvas, setPropostasSalvas] = useState<PropostaSalva[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const consumoReferencia =
    summary && summary.consumo_medio > 0 ? summary.consumo_medio : 350;

  // Load comparative proposal
  const handleCalcular = async () => {
    try {
      setLoading(true);
      setErro(null);
      setSucesso(null);

      // Validation
      if (hsp <= 0) {
        throw new Error('A Radiação Solar (HSP) deve ser maior que zero.');
      }
      if (percentual <= 0) {
        throw new Error('O percentual de atendimento deve ser maior que zero.');
      }
      if (tarifaKwh <= 0) {
        throw new Error('A tarifa de energia deve ser maior que zero (ex: R$ 0,85/kWh).');
      }

      const res = await solarService.dimensionarComparativo({
        property_id: property.id,
        hsp,
        percentual_atendimento: percentual,
        horas_autonomia: horasAutonomia,
        origem_hsp: origemHsp,
        tarifa_kwh: tarifaKwh,
      });

      setComparativo(res);
    } catch (err: any) {
      setErro(err.message || 'Falha ao processar dimensionamento fotovoltaico.');
    } finally {
      setLoading(false);
    }
  };

  // Load saved proposals
  const carregarPropostasSalvas = async () => {
    try {
      const lista = await solarService.listarPropostas(property.id);
      setPropostasSalvas(lista);
    } catch (err) {
      console.error('Erro ao carregar propostas salvas:', err);
    }
  };

  // Save proposal
  const handleSalvar = async () => {
    if (!comparativo) return;
    try {
      setSalvando(true);
      setErro(null);
      await solarService.salvarProposta(property.id, comparativo);
      setSucesso('Proposta salva com sucesso no histórico do imóvel!');
      await carregarPropostasSalvas();
      setTimeout(() => setSucesso(null), 4000);
    } catch (err: any) {
      setErro(err.message || 'Falha ao salvar proposta.');
    } finally {
      setSalvando(false);
    }
  };

  // Delete saved proposal
  const handleExcluirProposta = async (id: number) => {
    try {
      await solarService.excluirProposta(id);
      await carregarPropostasSalvas();
      setSucesso('Proposta removida do histórico.');
      setTimeout(() => setSucesso(null), 3000);
    } catch (err: any) {
      setErro(err.message || 'Falha ao excluir proposta.');
    }
  };

  // Reload a saved proposal
  const handleCarregarSalva = (salva: PropostaSalva) => {
    try {
      const dados: PropostaComparativa = JSON.parse(salva.dados_completos);
      setComparativo(dados);
      setHsp(dados.hsp);
      setTarifaKwh(dados.cenario_grid_tie.economia.tarifa_kwh);
      setActiveTab('comparativo');
      setSucesso(`Proposta #${salva.id} carregada com sucesso!`);
      setTimeout(() => setSucesso(null), 3000);
    } catch (err) {
      setErro('Erro ao decodificar proposta salva.');
    }
  };

  // Print proposal
  const handleImprimir = () => {
    window.print();
  };

  useEffect(() => {
    if (isOpen) {
      handleCalcular();
      carregarPropostasSalvas();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const gridTie = comparativo?.cenario_grid_tie;
  const hibrido = comparativo?.cenario_hibrido;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #solar-print-area, #solar-print-area * {
            visibility: visible;
          }
          #solar-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div
        id="solar-print-area"
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh] print:max-h-none print:overflow-visible"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-linear-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 print:bg-none print:border-b-2 print:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20 print:bg-slate-900">
              <Sun className="w-6 h-6 animate-spin-slow print:animate-none" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Sistema de Dimensionamento Fotovoltaico Residencial
              </h3>
              <p className="text-xs text-slate-500">
                Imóvel: <span className="font-semibold text-slate-700">{property.identificacao}</span> ({property.endereco}) — Consumo Referência:{' '}
                <span className="font-semibold text-slate-700">{consumoReferencia.toFixed(1)} kWh/mês</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 no-print">
            <button
              onClick={handleImprimir}
              title="Exportar Proposta / Imprimir em PDF (PB21)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Imprimir / PDF</span>
            </button>
            <button
              onClick={handleSalvar}
              disabled={salvando || !comparativo}
              title="Salvar Proposta no Histórico (PB20)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{salvando ? 'Salvando...' : 'Salvar Proposta'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (no-print) */}
        <div className="px-6 border-b border-slate-200/80 bg-slate-50 flex items-center justify-between gap-4 no-print">
          <div className="flex space-x-1">
            <button
              type="button"
              onClick={() => setActiveTab('comparativo')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'comparativo'
                  ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Comparativo dos Cenários (PB14)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('detalhes')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'detalhes'
                  ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Layers className="w-4 h-4" />
              Memorial Técnico de Equipamentos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('historico')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'historico'
                  ? 'border-emerald-600 text-emerald-700 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              Propostas Salvas ({propostasSalvas.length})
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 print:overflow-visible print:p-0 print:space-y-4">
          {/* Notifications */}
          {erro && (
            <div className="p-3.5 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200 flex items-center gap-2 no-print">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{erro}</span>
            </div>
          )}
          {sucesso && (
            <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs border border-emerald-200 flex items-center gap-2 no-print">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{sucesso}</span>
            </div>
          )}

          {/* Simulation Controls (no-print) */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 no-print">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Sliders className="w-4 h-4 text-amber-500" />
                Parâmetros do Dimensionamento
              </div>
              <span className="text-[11px] text-slate-500">
                Consumo Médio: <strong>{consumoReferencia.toFixed(1)} kWh/mês</strong> ({((consumoReferencia / 30)).toFixed(2)} kWh/dia)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* HSP */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Radiação Solar (HSP)</span>
                  <span className="text-amber-600 font-bold">{hsp.toFixed(2)} h/dia</span>
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={hsp}
                    onChange={(e) => setHsp(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
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
                    className="px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-600"
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

              {/* Meta de Atendimento */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Meta de Atendimento</span>
                  <span className="text-emerald-600 font-bold">{percentual}%</span>
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={percentual}
                  onChange={(e) => setPercentual(Number(e.target.value))}
                  className="w-full accent-emerald-600 mt-1.5"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>20% (Parcial)</span>
                  <span>100% (Integral)</span>
                </div>
              </div>

              {/* Tarifa de Energia (R$/kWh) - PB15 */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Tarifa da Concessionária</span>
                  <span className="text-blue-600 font-bold">R$ {tarifaKwh.toFixed(2)}/kWh</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  max="5.0"
                  value={tarifaKwh}
                  onChange={(e) => setTarifaKwh(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Padrão ANEEL B1 Convencional (R$ 0,85)
                </p>
              </div>

              {/* Autonomia do Cenário Híbrido (PB11) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Autonomia das Baterias</span>
                  <span className="text-purple-600 font-bold">{horasAutonomia}h</span>
                </label>
                <select
                  value={horasAutonomia}
                  onChange={(e) => setHorasAutonomia(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="6">6 horas (Cargas essenciais)</option>
                  <option value="12">12 horas (Período noturno)</option>
                  <option value="24">24 horas (Autonomia diária)</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Banco LiFePO4 dimensionado p/ Cenário 2
                </p>
              </div>
            </div>

            <div className="mt-3.5 pt-3 border-t border-slate-200/60 flex justify-end">
              <button
                type="button"
                onClick={handleCalcular}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-2xs"
              >
                {loading ? 'Calculando dimensionamento...' : 'Recalcular Proposta'}
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* TAB 1: COMPARATIVO DOS CENÁRIOS (PB14, PB15, PB16, PB17)       */}
          {/* ============================================================== */}
          {activeTab === 'comparativo' && comparativo && gridTie && hibrido && (
            <div className="space-y-6">
              {/* Resumo Executivo / KPI Superior */}
              <div className="p-4 rounded-2xl bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-xs">
                      <BarChart3 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Comparativo Técnico e Financeiro: On-Grid vs Híbrido com Baterias (PB14)
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Consumo: <strong>{comparativo.consumo_referencia_kwh} kWh/mês</strong> ({comparativo.consumo_diario_kwh} kWh/dia) · Demanda Média: <strong>{comparativo.demanda_media_kw} kW</strong> · Cargas Residência (est.): <strong>{comparativo.potencia_instalada_estimada_kw} kW</strong>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        HSP: <strong>{comparativo.hsp} h/dia</strong> · {comparativo.pr_justificativa}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 block">Compensação Mensal</span>
                    <span className="text-sm font-black text-emerald-800">
                      {gridTie.economia.energia_compensada_kwh} kWh/mês
                    </span>
                    {gridTie.economia.energia_excedente_kwh > 0 && (
                      <span className="text-[10px] text-blue-600 font-semibold block">
                        +{gridTie.economia.energia_excedente_kwh} kWh excedente (créditos)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabela Comparativa Lado a Lado (PB14) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* CENÁRIO 1: GRID-TIE (SEM BATERIAS) */}
                <div className="rounded-2xl border-2 border-emerald-300 bg-white p-5 shadow-xs flex flex-col justify-between relative">
                  <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white uppercase tracking-wider shadow-xs">
                    Recomendado (Maior Retorno)
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                      <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-slate-900 text-base">Cenário 1: Grid-Tie Puro</h5>
                        <p className="text-xs text-slate-500">Conectado à rede · Sem armazenamento</p>
                      </div>
                    </div>

                    {/* Especificações Técnicas */}
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Potência FV Instalada:</span>
                        <span className="font-bold text-slate-900">{gridTie.potencia_instalada_kwp} kWp (Nec: {gridTie.potencia_fv_necessaria_kwp} kWp)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Módulos FV:</span>
                        <span className="font-semibold text-slate-800">
                          {gridTie.modulo.quantidade}x {gridTie.modulo.equipamento.potencia_wp}W ({gridTie.modulo.equipamento.fabricante})
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Inversor Selecionado:</span>
                        <span className="font-semibold text-slate-800">
                          {gridTie.inversor.equipamento.modelo} ({gridTie.inversor.equipamento.potencia_nominal_w}W On-Grid)
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Razão CC/CA (R_DC/AC / FDI):</span>
                        <span className="font-semibold text-slate-800">{gridTie.inversor.razao_dc_ac || gridTie.inversor.fator_dimensionamento}x (P_FV / P_inv)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Geração Estimada:</span>
                        <span className="font-bold text-emerald-700">{gridTie.geracao_estimada_mensal_kwh} kWh/mês ({gridTie.geracao_estimada_diaria_kwh} kWh/dia)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Atendimento da Demanda:</span>
                        <span className="font-bold text-emerald-700">{gridTie.percentual_atendimento_pct}%</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Energia Compensada / Excedente:</span>
                        <span className="font-semibold text-slate-800">
                          {gridTie.economia.energia_compensada_kwh} kWh compensados {gridTie.economia.energia_excedente_kwh > 0 ? `(+${gridTie.economia.energia_excedente_kwh} kWh créditos)` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Armazenamento por Baterias:</span>
                        <span className="text-slate-400 italic">Não incluído (injetado na rede)</span>
                      </div>
                    </div>

                    {/* Quadro Financeiro */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Custo dos Equipamentos:</span>
                        <span className="font-semibold text-slate-800">
                          R$ {gridTie.orcamento.custo_equipamentos_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">BOS, Estrutura e Instalação (25%):</span>
                        <span className="font-semibold text-slate-800">
                          R$ {gridTie.orcamento.outros_custos_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-sm">
                        <span className="text-slate-900">Investimento Total:</span>
                        <span className="text-emerald-700 font-black">
                          R$ {gridTie.orcamento.custo_total_estimado_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Economia e Payback (PB15, PB16) */}
                    <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                      <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        Análise Econômica (Payback Simples)
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div>
                          <span className="text-slate-500 block text-[11px]">Economia Mensal</span>
                          <span className="text-base font-black text-emerald-900">
                            R$ {gridTie.economia.economia_mensal_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">Economia Anual</span>
                          <span className="text-base font-black text-emerald-900">
                            R$ {gridTie.economia.economia_anual_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-emerald-200 flex justify-between items-center text-xs">
                        <span className="font-semibold text-emerald-900">Tempo de Retorno (Payback):</span>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-extrabold text-sm">
                          {gridTie.economia.payback_anos} anos ({gridTie.economia.payback_meses} meses)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CENÁRIO 2: HÍBRIDO (COM BATERIAS) */}
                <div className="rounded-2xl border-2 border-purple-200 bg-white p-5 shadow-xs flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                      <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                        <BatteryCharging className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-extrabold text-slate-900 text-base">Cenário 2: Híbrido com Baterias</h5>
                        <p className="text-xs text-slate-500">Armazenamento LiFePO4 · Autonomia de {horasAutonomia}h</p>
                      </div>
                    </div>

                    {/* Especificações Técnicas */}
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Potência FV Instalada:</span>
                        <span className="font-bold text-slate-900">{hibrido.potencia_instalada_kwp} kWp (Nec: {hibrido.potencia_fv_necessaria_kwp} kWp)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Módulos FV:</span>
                        <span className="font-semibold text-slate-800">
                          {hibrido.modulo.quantidade}x {hibrido.modulo.equipamento.potencia_wp}W ({hibrido.modulo.equipamento.fabricante})
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Inversor Selecionado:</span>
                        <span className="font-semibold text-purple-900">
                          {hibrido.inversor.equipamento.modelo} (Híbrido Compatível)
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Razão CC/CA (R_DC/AC / FDI):</span>
                        <span className="font-semibold text-slate-800">{hibrido.inversor.razao_dc_ac || hibrido.inversor.fator_dimensionamento}x (P_FV / P_inv)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Geração Estimada:</span>
                        <span className="font-bold text-slate-900">{hibrido.geracao_estimada_mensal_kwh} kWh/mês ({hibrido.geracao_estimada_diaria_kwh} kWh/dia)</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Atendimento da Demanda:</span>
                        <span className="font-bold text-slate-900">{hibrido.percentual_atendimento_pct}%</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Energia Compensada / Excedente:</span>
                        <span className="font-semibold text-slate-800">
                          {hibrido.economia.energia_compensada_kwh} kWh compensados {hibrido.economia.energia_excedente_kwh > 0 ? `(+${hibrido.economia.energia_excedente_kwh} kWh créditos)` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Banco de Baterias:</span>
                        <span className="font-bold text-purple-900">
                          {hibrido.armazenamento.quantidade_baterias}x {hibrido.armazenamento.equipamento?.modelo} ({hibrido.armazenamento.capacidade_instalada_kwh} kWh)
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Autonomia Calculada:</span>
                        <span className="font-semibold text-slate-800">{horasAutonomia}h ({hibrido.armazenamento.energia_autonomia_kwh} kWh/ciclo)</span>
                      </div>
                    </div>

                    {/* Quadro Financeiro */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Módulos + Inversor Híbrido:</span>
                        <span className="font-semibold text-slate-800">
                          R$ {(hibrido.orcamento.custo_modulos_brl + hibrido.orcamento.custo_inversor_brl).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Banco de Baterias LiFePO4:</span>
                        <span className="font-semibold text-purple-900">
                          R$ {hibrido.orcamento.custo_baterias_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">BOS, Estrutura e Instalação (25%):</span>
                        <span className="font-semibold text-slate-800">
                          R$ {hibrido.orcamento.outros_custos_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-sm">
                        <span className="text-slate-900">Investimento Total:</span>
                        <span className="text-purple-900 font-black">
                          R$ {hibrido.orcamento.custo_total_estimado_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Economia e Payback (PB15, PB16) */}
                    <div className="p-4 rounded-xl bg-purple-50/80 border border-purple-200 space-y-2">
                      <div className="text-[11px] font-bold text-purple-800 uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                        Análise Econômica (Payback Simples)
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div>
                          <span className="text-slate-500 block text-[11px]">Economia Mensal</span>
                          <span className="text-base font-black text-slate-900">
                            R$ {hibrido.economia.economia_mensal_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[11px]">Economia Anual</span>
                          <span className="text-base font-black text-slate-900">
                            R$ {hibrido.economia.economia_anual_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-purple-200 flex justify-between items-center text-xs">
                        <span className="font-semibold text-purple-900">Tempo de Retorno (Payback):</span>
                        <span className="px-2.5 py-1 rounded-lg bg-purple-800 text-white font-extrabold text-sm">
                          {hibrido.economia.payback_anos} anos ({hibrido.economia.payback_meses} meses)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Análise Crítica e Resposta à Questão Final da Sprint Review (Seção 9) */}
              <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-300 text-xs space-y-2.5">
                <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm uppercase tracking-wide">
                  <Award className="w-5 h-5 text-amber-600" />
                  Conclusão Técnica-Econômica para a Sprint Review (Questão Final)
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Para esta residência com consumo de <strong>{comparativo.consumo_referencia_kwh} kWh/mês</strong> em ambiente urbano conectado à concessionária:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-white rounded-xl border border-amber-200">
                    <span className="font-bold text-emerald-800 block mb-1">Por que escolher o Cenário 1 (Sem Baterias)?</span>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      Apresenta investimento de <strong>R$ {gridTie.orcamento.custo_total_estimado_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> com payback de apenas <strong>{gridTie.economia.payback_anos} anos</strong>. No sistema de compensação de créditos (Net Metering), a rede atua como uma "bateria virtual" com eficiência de 100% e custo zero de armazenamento.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-amber-200">
                    <span className="font-bold text-purple-800 block mb-1">Quando considerar o Cenário 2 (Com Baterias)?</span>
                    <p className="text-[11px] text-slate-600 leading-normal">
                      O custo quase quadruplica para <strong>R$ {hibrido.orcamento.custo_total_estimado_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> e o payback sobe para <strong>{hibrido.economia.payback_anos} anos</strong>. Essa alternativa só se justifica tecnicamente onde há instabilidade crítica na rede elétrica, cargas vitais (médicas) ou necessidade absoluta de resiliência (nobreak).
                    </p>
                  </div>
                </div>
              </div>

              {/* Disclaimer Legal Obrigatório (PB16) */}
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Premissas do Payback Simples:</strong> {gridTie.economia.premissas}
                </span>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: MEMORIAL TÉCNICO DE EQUIPAMENTOS (PB05, PB07, PB11)     */}
          {/* ============================================================== */}
          {activeTab === 'detalhes' && comparativo && (
            <div className="space-y-5">
              {/* Selector de Cenário */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  Selecione o cenário para inspecionar os equipamentos detalhados:
                </div>
                <div className="flex rounded-xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setDetalhesCenario('grid_tie')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      detalhesCenario === 'grid_tie'
                        ? 'bg-white text-emerald-800 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Grid-Tie Puro
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetalhesCenario('hibrido')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      detalhesCenario === 'hibrido'
                        ? 'bg-white text-purple-800 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Híbrido com Baterias
                  </button>
                </div>
              </div>

              {(() => {
                const cenario = detalhesCenario === 'grid_tie' ? gridTie! : hibrido!;
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Módulos */}
                      <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-500 uppercase">Módulos Fotovoltaicos</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800">
                            {cenario.modulo.quantidade} painéis
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 text-sm">
                          {cenario.modulo.equipamento.fabricante} — {cenario.modulo.equipamento.modelo}
                        </div>
                        <div className="text-xs text-slate-600 mt-2 space-y-1">
                          <p>Potência Unitária: <span className="font-semibold text-slate-800">{cenario.modulo.equipamento.potencia_wp} Wp</span> (Eficiência: {cenario.modulo.equipamento.eficiencia_pct}%)</p>
                          <p>Tensão Vmp: <span className="font-semibold text-slate-800">{cenario.modulo.equipamento.vmp_v} V</span> | Voc: {cenario.modulo.equipamento.voc_v} V</p>
                          <p>Corrente Imp: <span className="font-semibold text-slate-800">{cenario.modulo.equipamento.imp_a} A</span> | Isc: {cenario.modulo.equipamento.isc_a} A</p>
                          <p>Potência Total do Arranjo: <span className="font-semibold text-slate-800">{cenario.modulo.potencia_total_w} W</span> ({cenario.potencia_instalada_kwp} kWp)</p>
                          <p>Preço Unitário: <span className="font-semibold text-slate-800">R$ {cenario.modulo.equipamento.preco_brl.toFixed(2)}</span> ({cenario.modulo.equipamento.fornecedor})</p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                          <span className="text-slate-500">Subtotal Módulos:</span>
                          <span className="font-bold text-slate-900">
                            R$ {cenario.orcamento.custo_modulos_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Inversor */}
                      <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-500 uppercase">Inversor Selecionado</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            cenario.inversor.equipamento.compativel_bateria
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {cenario.inversor.equipamento.tipo}
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 text-sm">
                          {cenario.inversor.equipamento.fabricante} — {cenario.inversor.equipamento.modelo}
                        </div>
                        <div className="text-xs text-slate-600 mt-2 space-y-1">
                          <p>Potência Nominal: <span className="font-semibold text-slate-800">{cenario.inversor.equipamento.potencia_nominal_w} W</span> (Máx FV: {cenario.inversor.equipamento.potencia_max_fv_w} W)</p>
                          <p>Faixa MPPT: <span className="font-semibold text-slate-800">{cenario.inversor.equipamento.faixa_mppt_min_v}V – {cenario.inversor.equipamento.faixa_mppt_max_v}V</span> ({cenario.inversor.equipamento.numero_mppt} MPPTs)</p>
                          <p>Tensão Máx: <span className="font-semibold text-slate-800">{cenario.inversor.equipamento.tensao_max_entrada_v} V</span> | Corrente Máx: {cenario.inversor.equipamento.corrente_max_entrada_a} A</p>
                          <p>Fator Dimensionamento (FDI): <span className="font-semibold text-slate-800">{cenario.inversor.fator_dimensionamento}x</span> (Sobrecarga técnica segura)</p>
                          <p>Preço Unitário: <span className="font-semibold text-slate-800">R$ {cenario.inversor.equipamento.preco_brl.toFixed(2)}</span> ({cenario.inversor.equipamento.fornecedor})</p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                          <span className="text-slate-500">Subtotal Inversor:</span>
                          <span className="font-bold text-slate-900">
                            R$ {cenario.orcamento.custo_inversor_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      {/* Baterias (se houver) */}
                      {cenario.armazenamento.incluido && cenario.armazenamento.equipamento ? (
                        <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/40 shadow-xs md:col-span-2">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-purple-900 uppercase flex items-center gap-1.5">
                              <BatteryCharging className="w-4 h-4 text-purple-700" />
                              Banco de Armazenamento LiFePO4
                            </span>
                            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-100 text-purple-900">
                              {cenario.armazenamento.quantidade_baterias} módulos ({cenario.armazenamento.horas_autonomia}h autonomia)
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 mt-2">
                            <div className="space-y-1">
                              <p className="font-bold text-slate-900 text-sm">
                                {cenario.armazenamento.equipamento.fabricante} — {cenario.armazenamento.equipamento.modelo}
                              </p>
                              <p>Tecnologia: <span className="font-semibold text-slate-800">{cenario.armazenamento.equipamento.tecnologia}</span> (DoD: {cenario.armazenamento.equipamento.dod_pct}%)</p>
                              <p>Capacidade por Módulo: <span className="font-semibold text-slate-800">{cenario.armazenamento.equipamento.capacidade_kwh} kWh</span> ({cenario.armazenamento.equipamento.capacidade_ah} Ah @ {cenario.armazenamento.equipamento.tensao_nominal_v}V)</p>
                              <p>Vida Útil Projetada: <span className="font-semibold text-slate-800">{cenario.armazenamento.equipamento.ciclos} ciclos</span></p>
                            </div>
                            <div className="space-y-1 sm:border-l sm:border-purple-200 sm:pl-4">
                              <p>Capacidade Necessária: <span className="font-semibold text-slate-800">{cenario.armazenamento.capacidade_calculada_kwh} kWh</span></p>
                              <p>Capacidade Efetivamente Instalada: <span className="font-semibold text-slate-800">{cenario.armazenamento.capacidade_instalada_kwh} kWh</span></p>
                              <p>Preço Unitário: <span className="font-semibold text-slate-800">R$ {cenario.armazenamento.equipamento.preco_brl.toFixed(2)}</span></p>
                              <p>Subtotal Baterias: <span className="font-bold text-purple-950 text-sm">R$ {cenario.orcamento.custo_baterias_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 shadow-xs md:col-span-2 flex items-center gap-3">
                          <Shield className="w-5 h-5 text-slate-400 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-slate-800">Armazenamento por Baterias: Não Utilizado neste Cenário</p>
                            <p className="text-[11px] text-slate-500">Sistema On-Grid puro com injeção direta de energia na rede da concessionária (compensação 1:1).</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Resumo Orçamentário do Cenário */}
                    <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Equipamentos</span>
                        <span className="text-base font-bold text-white">
                          R$ {cenario.orcamento.custo_equipamentos_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="text-center sm:text-left">
                        <span className="text-slate-400 block text-[11px]">BOS, Cabos e Homologação (25%)</span>
                        <span className="text-base font-bold text-amber-400">
                          R$ {cenario.orcamento.outros_custos_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[11px]">Investimento Total Chave-na-Mão</span>
                        <span className="text-xl font-black text-emerald-400">
                          R$ {cenario.orcamento.custo_total_estimado_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: HISTÓRICO DE PROPOSTAS SALVAS (PB20)                    */}
          {/* ============================================================== */}
          {activeTab === 'historico' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Propostas Salvas no Banco SQLite para este Imóvel
                  </h4>
                  <p className="text-xs text-slate-500">
                    Clique em "Carregar" para reabrir uma simulação salva anteriormente.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSalvar}
                  disabled={salvando || !comparativo}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-2xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Salvar Atual
                </button>
              </div>

              {propostasSalvas.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200/80">
                  <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">Nenhuma proposta salva para este imóvel ainda.</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Gere uma simulação e clique em "Salvar Proposta" para criar um registro permanente.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3"># ID</th>
                        <th className="py-2.5 px-3">Data</th>
                        <th className="py-2.5 px-3">Potência</th>
                        <th className="py-2.5 px-3">Invest. Grid-Tie</th>
                        <th className="py-2.5 px-3">Payback Grid</th>
                        <th className="py-2.5 px-3">Invest. Híbrido</th>
                        <th className="py-2.5 px-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {propostasSalvas.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-slate-900">#{p.id}</td>
                          <td className="py-2.5 px-3 text-slate-500">{new Date(p.data_criacao).toLocaleString('pt-BR')}</td>
                          <td className="py-2.5 px-3 font-semibold">{p.potencia_instalada_kwp} kWp</td>
                          <td className="py-2.5 px-3 font-bold text-emerald-700">
                            R$ {p.investimento_grid_tie_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3">{p.payback_grid_tie_anos} anos</td>
                          <td className="py-2.5 px-3 font-bold text-purple-700">
                            R$ {p.investimento_hibrido_brl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right space-x-1.5">
                            <button
                              type="button"
                              onClick={() => handleCarregarSalva(p)}
                              className="px-2 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              Carregar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleExcluirProposta(p.id)}
                              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center"
                              title="Excluir proposta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between no-print">
          <span className="text-[11px] text-slate-500">
            Sprint 3 — Sistema em conformidade com o Product Backlog Final (PB01 a PB21).
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleImprimir}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              Imprimir Relatório (PDF)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-200/80 hover:bg-slate-300 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
