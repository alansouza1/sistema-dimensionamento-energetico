import React from 'react';
import { Property } from '../types/property';
import { Building2, MapPin, Tag, Edit3, Trash2, Home } from 'lucide-react';

interface PropertyDetailsProps {
  property: Property | null;
  onEdit: () => void;
  onDelete: () => void;
  onOpenSolarModal?: () => void;
}

export const PropertyDetails: React.FC<PropertyDetailsProps> = ({
  property,
  onEdit,
  onDelete,
  onOpenSolarModal,
}) => {
  if (!property) {
    return (
      <div
        id="property-details-empty"
        className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center"
      >
        <div className="p-3 rounded-xl bg-slate-100 text-slate-400 mb-3">
          <Home className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800 mb-1">Nenhum imóvel selecionado</h4>
        <p className="text-xs text-slate-500 max-w-sm">
          Selecione ou cadastre um imóvel para visualizar as métricas e faturas de consumo.
        </p>
      </div>
    );
  }

  return (
    <div
      id="property-details-card"
      className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-colors"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0 border border-emerald-100">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {property.identificacao}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100/70 text-emerald-800">
                <Tag className="w-3 h-3" />
                {property.tipo || 'Residencial'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate max-w-md">{property.endereco}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 self-end sm:self-auto shrink-0">
          {onOpenSolarModal && (
            <button
              id="btn-solar-simulation"
              type="button"
              onClick={onOpenSolarModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300/80 rounded-lg shadow-xs transition-colors"
            >
              <span className="text-sm">☀️</span>
              Simular Energia Solar
            </button>
          )}
          <button
            id="btn-edit-property"
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Editar Imóvel
          </button>
          <button
            id="btn-delete-property"
            type="button"
            onClick={onDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100/80 rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Excluir Imóvel
          </button>
        </div>
      </div>
    </div>
  );
};
