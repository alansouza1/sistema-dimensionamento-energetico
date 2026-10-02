import React from 'react';
import { Property } from '../types/property';
import { Home, ChevronDown, Plus, Check } from 'lucide-react';

interface PropertySelectorProps {
  properties: Property[];
  selectedProperty: Property | null;
  onSelectProperty: (property: Property) => void;
  onOpenNewModal: () => void;
}

export const PropertySelector: React.FC<PropertySelectorProps> = ({
  properties,
  selectedProperty,
  onSelectProperty,
  onOpenNewModal,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div id="property-selector-container" className="relative" ref={dropdownRef}>
      <button
        id="property-selector-trigger"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-800 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
      >
        <div className="p-1 rounded bg-emerald-50 text-emerald-600">
          <Home className="w-4 h-4" />
        </div>
        <div className="text-left max-w-[180px] sm:max-w-[220px] truncate">
          <p className="text-xs text-slate-500 font-normal">Imóvel Ativo</p>
          <p className="text-sm font-semibold text-slate-900 truncate">
            {selectedProperty ? selectedProperty.identificacao : 'Nenhum imóvel'}
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          id="property-selector-dropdown"
          className="absolute left-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Seus Imóveis ({properties.length})
          </div>

          <div className="max-h-60 overflow-y-auto px-1">
            {properties.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                Nenhum imóvel cadastrado.
              </div>
            ) : (
              properties.map((property) => {
                const isSelected = selectedProperty?.id === property.id;
                return (
                  <button
                    key={property.id}
                    id={`property-option-${property.id}`}
                    type="button"
                    onClick={() => {
                      onSelectProperty(property);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                      isSelected
                        ? 'bg-emerald-50/80 text-emerald-900 font-medium'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-md mt-0.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Home className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-semibold truncate">
                          {property.identificacao}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{property.endereco}</p>
                      <span className="inline-block mt-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {property.tipo || 'Residencial'}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="border-t border-slate-100 mt-2 pt-2 px-2">
            <button
              id="btn-add-property-from-dropdown"
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenNewModal();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Novo Imóvel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
