import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Property } from '../types/property';
import { PropertySelector } from './PropertySelector';
import {
  Zap,
  LogOut,
  User as UserIcon,
  Plus,
  Settings2,
  CheckCircle2,
  HelpCircle,
  Radio,
} from 'lucide-react';

interface NavbarProps {
  properties: Property[];
  selectedProperty: Property | null;
  onSelectProperty: (property: Property) => void;
  onOpenNewPropertyModal: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  properties,
  selectedProperty,
  onSelectProperty,
  onOpenNewPropertyModal,
  onOpenAuthModal,
}) => {
  const { user, isAuthenticated, logout, connectionMode, apiBaseUrl, updateApiBaseUrl } =
    useAuth();
  const [showConfig, setShowConfig] = useState(false);
  const [customUrl, setCustomUrl] = useState(apiBaseUrl);

  const handleSaveApiUrl = (e: React.FormEvent) => {
    e.preventDefault();
    updateApiBaseUrl(customUrl);
    setShowConfig(false);
  };

  return (
    <header id="app-navbar" className="bg-white border-b border-slate-200/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900">SERS</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  FIAP
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Dimensionamento Energético Residencial
              </p>
            </div>
          </div>

          {/* Property Selector & New Property Button */}
          {isAuthenticated && (
            <div className="flex items-center gap-2">
              <PropertySelector
                properties={properties}
                selectedProperty={selectedProperty}
                onSelectProperty={onSelectProperty}
                onOpenNewModal={onOpenNewPropertyModal}
              />

              <button
                id="btn-nav-new-property"
                type="button"
                onClick={onOpenNewPropertyModal}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Novo Imóvel
              </button>
            </div>
          )}

          {/* User Section, Connection Indicator & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Connection Mode Pill */}
            <div className="relative">
              <button
                id="btn-connection-indicator"
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                title="Configuração da API"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                  connectionMode === 'connected'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    connectionMode === 'connected'
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-amber-500'
                  }`}
                />
                <span className="hidden lg:inline">
                  {connectionMode === 'connected' ? 'API Conectada' : 'Modo Local Ativo'}
                </span>
                <Settings2 className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>

              {showConfig && (
                <div
                  id="api-settings-popover"
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Radio className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-800">Conexão da API REST</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowConfig(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                    O SERS consulta o backend em Node.js (porta 3001). Caso o servidor esteja offline
                    no navegador, o SERS ativa automaticamente a persistência e cálculos locais em
                    tempo real.
                  </p>

                  <form onSubmit={handleSaveApiUrl} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                        Endpoint da API (URL)
                      </label>
                      <input
                        type="text"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        placeholder="http://localhost:3001/api"
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCustomUrl('http://localhost:3001/api');
                          updateApiBaseUrl('http://localhost:3001/api');
                          setShowConfig(false);
                        }}
                        className="px-2.5 py-1 text-[11px] text-slate-600 hover:bg-slate-100 rounded"
                      >
                        Padrão
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-xs"
                      >
                        Salvar URL
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                    {user.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">
                      Olá, {user.nome}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[130px]">
                      {user.email}
                    </p>
                  </div>
                </div>

                <button
                  id="btn-logout"
                  type="button"
                  onClick={logout}
                  title="Sair da conta"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="btn-nav-login"
                type="button"
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Entrar
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
