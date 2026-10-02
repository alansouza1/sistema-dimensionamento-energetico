import React, { useState, useEffect } from 'react';
import { Property, CreatePropertyInput } from '../types/property';
import { X, Building2, MapPin, Tag } from 'lucide-react';

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePropertyInput) => Promise<void>;
  propertyToEdit?: Property | null;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  propertyToEdit,
}) => {
  const [identificacao, setIdentificacao] = useState('');
  const [endereco, setEndereco] = useState('');
  const [tipo, setTipo] = useState('Residencial');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (propertyToEdit) {
      setIdentificacao(propertyToEdit.identificacao || '');
      setEndereco(propertyToEdit.endereco || '');
      setTipo(propertyToEdit.tipo || 'Residencial');
    } else {
      setIdentificacao('');
      setEndereco('');
      setTipo('Residencial');
    }
    setError(null);
  }, [propertyToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identificacao.trim()) {
      setError('Por favor, informe a identificação do imóvel.');
      return;
    }
    if (!endereco.trim()) {
      setError('Por favor, informe o endereço do imóvel.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        identificacao: identificacao.trim(),
        endereco: endereco.trim(),
        tipo: tipo.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar imóvel. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="property-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div
        id="property-modal-card"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {propertyToEdit ? 'Editar Imóvel' : 'Novo Imóvel'}
              </h3>
              <p className="text-xs text-slate-500">
                {propertyToEdit
                  ? 'Altere os dados cadastrais da residência'
                  : 'Cadastre uma residência para dimensionamento'}
              </p>
            </div>
          </div>
          <button
            id="btn-close-property-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div
              id="property-modal-error"
              className="p-3 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg"
            >
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="property-identificacao"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Identificação do Imóvel *
            </label>
            <div className="relative">
              <input
                id="property-identificacao"
                type="text"
                required
                value={identificacao}
                onChange={(e) => setIdentificacao(e.target.value)}
                placeholder="Ex: Casa Principal, Sobrado Litoral"
                className="w-full pl-3 pr-3 py-2 text-sm text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="property-endereco"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Endereço Completo *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                id="property-endereco"
                type="text"
                required
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                placeholder="Ex: Av. Paulista, 1000 - São Paulo, SP"
                className="w-full pl-9 pr-3 py-2 text-sm text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="property-tipo"
              className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Tipo de Imóvel
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Tag className="w-4 h-4" />
              </div>
              <select
                id="property-tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white"
              >
                <option value="Residencial">Residencial</option>
                <option value="Casa de Campo">Casa de Campo</option>
                <option value="Apartamento">Apartamento</option>
                <option value="Comercial">Comercial</option>
                <option value="Rural">Rural</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              id="btn-cancel-property"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              id="btn-submit-property"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 rounded-lg shadow-sm transition-colors"
            >
              {isSubmitting ? 'Salvando...' : propertyToEdit ? 'Atualizar Imóvel' : 'Cadastrar Imóvel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
