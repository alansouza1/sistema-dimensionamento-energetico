import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { PropertyDetails } from './components/PropertyDetails';
import { PropertyModal } from './components/PropertyModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { EnergyKpiCards } from './components/EnergyKpiCards';
import { ConsumptionBarChart } from './components/ConsumptionBarChart';
import { ConsumptionForm } from './components/ConsumptionForm';
import { ConsumptionHistoryTable } from './components/ConsumptionHistoryTable';
import { AuthModal } from './components/AuthModal';
import { Property, CreatePropertyInput } from './types/property';
import { EnergySummary, CreateConsumptionInput } from './types/consumption';
import { propertyService } from './services/propertyService';
import { consumptionService } from './services/consumptionService';
import { SunMedium, Zap, ShieldAlert, Sparkles, Building2, Plus } from 'lucide-react';

function DashboardContent() {
  const { user, isAuthenticated } = useAuth();

  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [summary, setSummary] = useState<EnergySummary | null>(null);

  const [isLoadingProperties, setIsLoadingProperties] = useState<boolean>(true);
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);

  // Modals state
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState<boolean>(false);
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedbackToast({ message, type });
    setTimeout(() => {
      setFeedbackToast(null);
    }, 4000);
  };

  // Fetch properties
  const fetchProperties = useCallback(async (preferredId?: number) => {
    try {
      setIsLoadingProperties(true);
      const list = await propertyService.listProperties();
      setProperties(list);

      if (list.length > 0) {
        if (preferredId) {
          const match = list.find((p) => p.id === preferredId);
          setSelectedProperty(match || list[0]);
        } else if (!selectedProperty || !list.some((p) => p.id === selectedProperty.id)) {
          setSelectedProperty(list[0]);
        }
      } else {
        setSelectedProperty(null);
        setSummary(null);
      }
    } catch (err: any) {
      console.error('Erro ao listar imóveis:', err);
    } finally {
      setIsLoadingProperties(false);
    }
  }, [selectedProperty]);

  // Fetch summary for selected property
  const fetchSummary = useCallback(async (propertyId: number) => {
    try {
      setIsLoadingSummary(true);
      const res = await consumptionService.getSummary(propertyId);
      setSummary(res);
    } catch (err: any) {
      console.error('Erro ao buscar resumo:', err);
    } finally {
      setIsLoadingSummary(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Whenever selected property changes, fetch its summary
  useEffect(() => {
    if (selectedProperty?.id) {
      fetchSummary(selectedProperty.id);
    } else {
      setSummary(null);
    }
  }, [selectedProperty, fetchSummary]);

  // Handlers for Property CRUD
  const handleCreateOrUpdateProperty = async (data: CreatePropertyInput) => {
    if (propertyToEdit) {
      const updated = await propertyService.updateProperty(propertyToEdit.id, data);
      showToast(`Imóvel "${updated.identificacao}" atualizado com sucesso!`);
      await fetchProperties(updated.id);
    } else {
      const created = await propertyService.createProperty(data);
      showToast(`Imóvel "${created.identificacao}" cadastrado com sucesso!`);
      await fetchProperties(created.id);
    }
    setPropertyToEdit(null);
  };

  const handleOpenEditProperty = () => {
    if (selectedProperty) {
      setPropertyToEdit(selectedProperty);
      setIsPropertyModalOpen(true);
    }
  };

  const handleOpenNewProperty = () => {
    setPropertyToEdit(null);
    setIsPropertyModalOpen(true);
  };

  const handleConfirmDeleteProperty = async () => {
    if (!selectedProperty) return;
    try {
      await propertyService.deleteProperty(selectedProperty.id);
      showToast(`Imóvel e seus consumos foram excluídos.`, 'success');
      setIsDeleteModalOpen(false);
      await fetchProperties();
    } catch (err: any) {
      showToast(err.message || 'Erro ao excluir imóvel.', 'error');
    }
  };

  // Handlers for Consumption
  const handleAddConsumption = async (data: CreateConsumptionInput) => {
    if (!selectedProperty) return;
    await consumptionService.addConsumption(selectedProperty.id, data);
    showToast(`Fatura adicionada com sucesso!`);
    await fetchSummary(selectedProperty.id);
  };

  const handleDeleteConsumption = async (consumoId: number) => {
    if (!selectedProperty) return;
    try {
      await consumptionService.deleteConsumption(selectedProperty.id, consumoId);
      showToast(`Fatura excluída com sucesso!`);
      await fetchSummary(selectedProperty.id);
    } catch (err: any) {
      showToast(err.message || 'Erro ao excluir fatura.', 'error');
    }
  };

  // Seed data from FIAP booklet (TSK-11.2)
  const handleSeedBookletData = async () => {
    if (!selectedProperty) return;
    try {
      setIsSeeding(true);
      const res = await consumptionService.seedTestData(selectedProperty.id);
      setSummary(res);
      showToast(
        `5 faturas da apostila inseridas! Pico: ${res.consumo_maximo.toFixed(2)} kWh (${res.mes_pico?.nome_mes}), Média: ${res.consumo_medio.toFixed(2)} kWh.`
      );
    } catch (err: any) {
      showToast(err.message || 'Erro ao injetar dados da apostila.', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar
        properties={properties}
        selectedProperty={selectedProperty}
        onSelectProperty={(prop) => setSelectedProperty(prop)}
        onOpenNewPropertyModal={handleOpenNewProperty}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Floating Feedback Toast */}
      {feedbackToast && (
        <div
          id="global-feedback-toast"
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl border text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200 ${
            feedbackToast.type === 'success'
              ? 'bg-slate-900 text-emerald-400 border-slate-800'
              : 'bg-rose-900 text-rose-200 border-rose-800'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{feedbackToast.message}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>Dimensionamento Energético Residencial</span>
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                <SunMedium className="w-3.5 h-3.5" />
                Fotovoltaico
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Avaliação de histórico de faturas, identificação do mês de maior consumo e cálculo de
              média para projetos solares.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Imóveis ativos:</span>
            <span className="font-bold text-xs bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
              {properties.length}
            </span>
          </div>
        </div>

        {/* If no properties exist */}
        {properties.length === 0 && !isLoadingProperties ? (
          <div
            id="zero-properties-state"
            className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-slate-200/80 shadow-xs max-w-xl mx-auto my-8"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <Building2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Cadastre seu Primeiro Imóvel
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
              Para iniciar a análise energética e o dimensionamento fotovoltaico, adicione uma
              residência ou apartamento.
            </p>
            <button
              id="btn-create-first-property"
              type="button"
              onClick={handleOpenNewProperty}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              Cadastrar Imóvel
            </button>
          </div>
        ) : (
          <>
            {/* Property Details Card */}
            <PropertyDetails
              property={selectedProperty}
              onEdit={handleOpenEditProperty}
              onDelete={() => setIsDeleteModalOpen(true)}
            />

            {/* Energy KPI Cards (PB08 to PB11) */}
            <EnergyKpiCards summary={summary} isLoading={isLoadingSummary} />

            {/* Consumption Bar Chart (PB12) */}
            <ConsumptionBarChart summary={summary} />

            {/* 2-Column Split: Consumption Form (PB05, PB06) & Solar Sizing Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {selectedProperty && (
                  <ConsumptionForm
                    propertyId={selectedProperty.id}
                    existingBills={
                      summary?.consumos.map((c) => ({ mes: c.mes, ano: c.ano })) || []
                    }
                    onSubmit={handleAddConsumption}
                    onSeedBookletData={handleSeedBookletData}
                    isSeeding={isSeeding}
                  />
                )}
              </div>

              {/* Technical Sizing Insights Card */}
              <div
                id="technical-insights-card"
                className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <Zap className="w-4 h-4" />
                    Critérios de Dimensionamento
                  </div>
                  <h4 className="text-base font-bold text-white mb-2">
                    Metodologia SERS
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed space-y-2 mb-4">
                    O dimensionamento fotovoltaico utiliza o{' '}
                    <strong className="text-white">Consumo Médio Mensal</strong> para projetar a
                    quantidade de placas geradoras, enquanto o{' '}
                    <strong className="text-rose-300">Consumo Máximo (Mês de Pico)</strong> define o
                    limite de carga para proteção de disjuntores e cabeamento.
                  </p>

                  <div className="space-y-2 border-t border-slate-700/80 pt-3 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Demanda Média:</span>
                      <span className="font-semibold text-white">
                        {summary ? `${summary.consumo_medio.toFixed(2)} kWh/mês` : '0.00 kWh'}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Pico Crítico:</span>
                      <span className="font-semibold text-rose-300">
                        {summary ? `${summary.consumo_maximo.toFixed(2)} kWh/mês` : '0.00 kWh'}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Geração Diária Estimada:</span>
                      <span className="font-semibold text-emerald-400">
                        {summary && summary.consumo_medio > 0
                          ? `${(summary.consumo_medio / 30).toFixed(2)} kWh/dia`
                          : '0.00 kWh/dia'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-700/80 text-[11px] text-slate-400">
                  Compatível com especificações de engenharia da disciplina FIAP SERS.
                </div>
              </div>
            </div>

            {/* Consumption History Table (PB07) */}
            <ConsumptionHistoryTable
              summary={summary}
              onDeleteConsumption={handleDeleteConsumption}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 SERS — Sistema de Dimensionamento Energético Residencial. FIAP SERS.</p>
          <p className="text-[11px] text-slate-400">
            Frontend React + TypeScript + Tailwind CSS + Recharts
          </p>
        </div>
      </footer>

      {/* Modals */}
      <PropertyModal
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        onSubmit={handleCreateOrUpdateProperty}
        propertyToEdit={propertyToEdit}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteProperty}
        title="Excluir Imóvel Residencial"
        message={`Tem certeza que deseja excluir o imóvel "${selectedProperty?.identificacao}"?`}
        warningNote="Atenção: A exclusão deste imóvel é permanente e removerá todas as faturas e dados de consumo associados a ele (TSK-04.2)."
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}
