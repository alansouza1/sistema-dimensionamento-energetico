import { apiRequest } from './api';
import { ModuloFV, Inversor, Bateria, DimensionamentoInput, PropostaSolar } from '../types/solar';

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
};
