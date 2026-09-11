import React, { useState, useRef } from 'react';
import { CreateConsumptionInput } from '../types/consumption';
import { MONTH_NAMES_PT } from '../services/api';
import { PlusCircle, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface ConsumptionFormProps {
  propertyId: number;
  existingBills: Array<{ mes: number; ano: number }>;
  onSubmit: (data: CreateConsumptionInput) => Promise<void>;
  onSeedBookletData: () => Promise<void>;
  isSeeding?: boolean;
}

export const ConsumptionForm: React.FC<ConsumptionFormProps> = ({
  propertyId,
  existingBills,
  onSubmit,
  onSeedBookletData,
  isSeeding = false,
}) => {
  const currentYear = new Date().getFullYear();
  const [mes, setMes] = useState<number>(() => {
    // Find next available month or default to 1
    return 1;
  });
  const [ano, setAno] = useState<number>(2026);
  const [consumoKwh, setConsumoKwh] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const kwhInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const kwhNum = parseFloat(consumoKwh.replace(',', '.'));

    // Validation (PB13, PB14)
    if (isNaN(kwhNum) || kwhNum <= 0) {
      setError('O consumo deve ser um valor numérico positivo e maior que zero (kWh).');
      if (kwhInputRef.current) kwhInputRef.current.focus();
      return;
    }

    const alreadyExists = existingBills.some((b) => b.mes === mes && b.ano === ano);
    if (alreadyExists) {
      setError(`A fatura de ${MONTH_NAMES_PT[mes]} de ${ano} já está cadastrada neste imóvel.`);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        mes,
        ano,
        consumo_kwh: kwhNum,
      });

      setSuccessMessage(`Fatura de ${MONTH_NAMES_PT[mes]}/${ano} salva com sucesso!`);
      setConsumoKwh('');

      // Sequential fast entry mode (TSK-06.1):
      // Advance to next month (and advance year if December)
      if (mes === 12) {
        setMes(1);
        setAno((prev) => prev + 1);
      } else {
        setMes((prev) => prev + 1);
      }

      // Keep focus on kWh input for continuous typing
      setTimeout(() => {
        if (kwhInputRef.current) {
          kwhInputRef.current.focus();
        }
      }, 50);
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar consumo. Verifique os dados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="consumption-form-card"
      className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-emerald-600" />
            Lançar Fatura de Consumo
          </h3>
          <p className="text-xs text-slate-500">
            Adicione o consumo mensal em kWh para atualizar o dimensionamento
          </p>
        </div>

        {/* Quick test button (TSK-11.2) */}
        <button
          id="btn-seed-booklet-data"
          type="button"
          onClick={onSeedBookletData}
          disabled={isSeeding}
          className="flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl transition-all shadow-xs disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          {isSeeding ? 'Carregando Dados...' : 'Carregar Dados da Apostila (Jan a Mai)'}
        </button>
      </div>

      {error && (
        <div
          id="consumption-form-error"
          className="p-3 mb-4 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div
          id="consumption-form-success"
          className="p-3 mb-4 text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Mês */}
          <div>
            <label
              htmlFor="select-consumption-month"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Mês de Referência *
            </label>
            <select
              id="select-consumption-month"
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {m.toString().padStart(2, '0')} - {MONTH_NAMES_PT[m]}
                </option>
              ))}
            </select>
          </div>

          {/* Ano */}
          <div>
            <label
              htmlFor="input-consumption-year"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Ano *
            </label>
            <input
              id="input-consumption-year"
              type="number"
              min={2000}
              max={2100}
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
            />
          </div>

          {/* Consumo em kWh */}
          <div>
            <label
              htmlFor="input-consumption-kwh"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
            >
              Consumo em kWh *
            </label>
            <div className="relative">
              <input
                id="input-consumption-kwh"
                ref={kwhInputRef}
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Ex: 320.00"
                required
                value={consumoKwh}
                onChange={(e) => setConsumoKwh(e.target.value)}
                className="w-full pl-3 pr-12 py-2 text-sm text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white font-medium"
              />
              <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-slate-400 pointer-events-none">
                kWh
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Modo sequencial ativo: ao salvar, avança para o próximo mês automaticamente.
          </div>

          <button
            id="btn-save-consumption"
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 rounded-lg shadow-sm transition-colors"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar Fatura'}
          </button>
        </div>
      </form>
    </div>
  );
};
