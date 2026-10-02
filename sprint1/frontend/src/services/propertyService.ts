import { Property, CreatePropertyInput, UpdatePropertyInput } from '../types/property';
import {
  apiRequest,
  getLocalProperties,
  saveLocalProperties,
  getLocalConsumptions,
  saveLocalConsumptions,
} from './api';

export const propertyService = {
  async listProperties(): Promise<Property[]> {
    return apiRequest<Property[]>('/imoveis', { method: 'GET' }, () => {
      return getLocalProperties();
    });
  },

  async createProperty(data: CreatePropertyInput): Promise<Property> {
    return apiRequest<Property>(
      '/imoveis',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      () => {
        const properties = getLocalProperties();
        const newProperty: Property = {
          id: properties.length > 0 ? Math.max(...properties.map((p) => p.id)) + 1 : 1,
          identificacao: data.identificacao.trim(),
          endereco: data.endereco.trim(),
          tipo: data.tipo.trim() || 'Residencial',
          criado_em: new Date().toISOString(),
        };
        properties.push(newProperty);
        saveLocalProperties(properties);
        return newProperty;
      }
    );
  },

  async updateProperty(id: number, data: UpdatePropertyInput): Promise<Property> {
    return apiRequest<Property>(
      `/imoveis/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      () => {
        const properties = getLocalProperties();
        const index = properties.findIndex((p) => p.id === id);
        if (index === -1) {
          throw new Error('Imóvel não encontrado');
        }
        const updated: Property = {
          ...properties[index],
          identificacao: data.identificacao.trim(),
          endereco: data.endereco.trim(),
          tipo: data.tipo.trim() || 'Residencial',
        };
        properties[index] = updated;
        saveLocalProperties(properties);
        return updated;
      }
    );
  },

  async deleteProperty(id: number): Promise<{ mensagem: string }> {
    return apiRequest<{ mensagem: string }>(
      `/imoveis/${id}`,
      { method: 'DELETE' },
      () => {
        const properties = getLocalProperties().filter((p) => p.id !== id);
        saveLocalProperties(properties);
        // Cascade delete all consumptions for this property (TSK-04.2)
        const consumptions = getLocalConsumptions().filter((c) => c.imovel_id !== id);
        saveLocalConsumptions(consumptions);
        return { mensagem: 'Imóvel e consumos excluídos com sucesso' };
      }
    );
  },
};
