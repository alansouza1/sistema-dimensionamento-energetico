import { apiRequest } from './api';
import { ModuloFV, Inversor, Bateria, DimensionamentoInput, PropostaSolar, PropostaComparativa, PropostaSalva } from '../types/solar';

export interface CatalogoEquipamentos {
  modulos: ModuloFV[];
  inversores: Inversor[];
  baterias: Bateria[];
}

export const solarService = {
  async getEquipamentos(): Promise<CatalogoEquipamentos> {
    return apiRequest<CatalogoEquipamentos>('/solar/equipamentos', {
      method: 'GET',
    });
  },

  async dimensionar(input: DimensionamentoInput): Promise<PropostaSolar> {
    return apiRequest<PropostaSolar>('/solar/dimensionamento', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async dimensionarComparativo(input: DimensionamentoInput): Promise<PropostaComparativa> {
    return apiRequest<PropostaComparativa>('/solar/comparativo', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async salvarProposta(propertyId: number, dados: PropostaComparativa): Promise<{ id: number }> {
    return apiRequest<{ id: number }>('/solar/propostas', {
      method: 'POST',
      body: JSON.stringify({ property_id: propertyId, dados_completos: dados }),
    });
  },

  async listarPropostas(propertyId: number): Promise<PropostaSalva[]> {
    return apiRequest<PropostaSalva[]>(`/solar/imoveis/${propertyId}/propostas`, {
      method: 'GET',
    });
  },

  async obterProposta(propostaId: number): Promise<PropostaSalva> {
    return apiRequest<PropostaSalva>(`/solar/propostas/${propostaId}`, {
      method: 'GET',
    });
  },

  async excluirProposta(propostaId: number): Promise<void> {
    return apiRequest<void>(`/solar/propostas/${propostaId}`, {
      method: 'DELETE',
    });
  },
};
