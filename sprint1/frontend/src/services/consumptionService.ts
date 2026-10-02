import {
  MonthlyConsumption,
  EnergySummary,
  CreateConsumptionInput,
  ConsumptionBatchInput,
} from '../types/consumption';
import {
  apiRequest,
  calculateLocalSummary,
  getBookletSeedData,
  getLocalConsumptions,
  saveLocalConsumptions,
} from './api';

export const consumptionService = {
  async listConsumptions(propertyId: number): Promise<MonthlyConsumption[]> {
    return apiRequest<MonthlyConsumption[]>(
      `/imoveis/${propertyId}/consumos`,
      { method: 'GET' },
      () => {
        const all = getLocalConsumptions().filter((c) => c.imovel_id === propertyId);
        return all.sort((a, b) => {
          if (a.ano !== b.ano) return a.ano - b.ano;
          return a.mes - b.mes;
        });
      }
    );
  },

  async addConsumption(
    propertyId: number,
    data: CreateConsumptionInput
  ): Promise<MonthlyConsumption> {
    return apiRequest<MonthlyConsumption>(
      `/imoveis/${propertyId}/consumos`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      () => {
        const all = getLocalConsumptions();
        // Validation check for duplicates
        const exists = all.some(
          (c) => c.imovel_id === propertyId && c.ano === data.ano && c.mes === data.mes
        );
        if (exists) {
          throw new Error(`Já existe fatura cadastrada para o mês ${data.mes}/${data.ano}`);
        }

        const newId = all.length > 0 ? Math.max(...all.map((c) => c.id || 0)) + 1 : 1;
        const newRecord: MonthlyConsumption = {
          id: newId,
          imovel_id: propertyId,
          ano: Number(data.ano),
          mes: Number(data.mes),
          consumo_kwh: Number(Number(data.consumo_kwh).toFixed(2)),
        };

        all.push(newRecord);
        saveLocalConsumptions(all);
        return newRecord;
      }
    );
  },

  async addBatch(
    propertyId: number,
    batchData: ConsumptionBatchInput
  ): Promise<{ inseridos: number }> {
    return apiRequest<{ inseridos: number }>(
      `/imoveis/${propertyId}/consumos/batch`,
      {
        method: 'POST',
        body: JSON.stringify(batchData),
      },
      () => {
        const all = getLocalConsumptions();
        let addedCount = 0;
        let nextId = all.length > 0 ? Math.max(...all.map((c) => c.id || 0)) + 1 : 1;

        for (const item of batchData.faturas) {
          const exists = all.some(
            (c) => c.imovel_id === propertyId && c.ano === item.ano && c.mes === item.mes
          );
          if (!exists) {
            all.push({
              id: nextId++,
              imovel_id: propertyId,
              ano: Number(item.ano),
              mes: Number(item.mes),
              consumo_kwh: Number(Number(item.consumo_kwh).toFixed(2)),
            });
            addedCount++;
          }
        }

        saveLocalConsumptions(all);
        return { inseridos: addedCount };
      }
    );
  },

  async deleteConsumption(propertyId: number, consumoId: number): Promise<{ mensagem: string }> {
    return apiRequest<{ mensagem: string }>(
      `/imoveis/${propertyId}/consumos/${consumoId}`,
      { method: 'DELETE' },
      () => {
        const all = getLocalConsumptions();
        const filtered = all.filter((c) => !(c.imovel_id === propertyId && c.id === consumoId));
        saveLocalConsumptions(filtered);
        return { mensagem: 'Consumo excluído com sucesso' };
      }
    );
  },

  async getSummary(propertyId: number): Promise<EnergySummary> {
    return apiRequest<EnergySummary>(
      `/imoveis/${propertyId}/resumo`,
      { method: 'GET' },
      () => {
        return calculateLocalSummary(propertyId);
      }
    );
  },

  async seedTestData(propertyId: number): Promise<EnergySummary> {
    return apiRequest<EnergySummary>(
      `/imoveis/${propertyId}/consumos/seed-teste`,
      { method: 'POST' },
      () => {
        const all = getLocalConsumptions();
        // Remove existing for this property to avoid duplicates or replace cleanly
        const others = all.filter((c) => c.imovel_id !== propertyId);
        const seeds = getBookletSeedData(propertyId);
        const merged = [...others, ...seeds];
        saveLocalConsumptions(merged);
        return calculateLocalSummary(propertyId);
      }
    );
  },
};
