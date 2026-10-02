import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import { ConsumptionService } from '../services/consumption.service.js';

export class ConsumptionController {
  static async add(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const propertyId = Number(req.params.id);
      const { ano, mes, consumo_kwh } = req.body;
      const record = ConsumptionService.addConsumption(propertyId, req.userId!, ano, mes, consumo_kwh);
      res.status(201).json(record);
    } catch (err) {
      next(err);
    }
  }

  static async addBatch(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const propertyId = Number(req.params.id);
      const { faturas } = req.body;
      const created = ConsumptionService.addBatch(propertyId, req.userId!, faturas);
      res.status(201).json({
        mensagem: `${created.length} faturas cadastradas com sucesso`,
        faturas: created,
        inseridos: created.length,
      });
    } catch (err) {
      next(err);
    }
  }

  static async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const propertyId = Number(req.params.id);
      const records = ConsumptionService.listByProperty(propertyId, req.userId!);
      res.status(200).json(records);
    } catch (err) {
      next(err);
    }
  }

  static async summary(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const propertyId = Number(req.params.id);
      const result = ConsumptionService.getSummary(propertyId, req.userId!);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async seedTextbook(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const propertyId = Number(req.params.id);
      const ano = req.body.ano ? Number(req.body.ano) : 2026;
      const result = ConsumptionService.seedTextbookData(propertyId, req.userId!, ano);
      res.status(200).json({
        ...result,
        mensagem: 'Caso de teste padrão da apostila (Jan–Mai) carregado com sucesso!',
        resumo: result,
      });
    } catch (err) {
      next(err);
    }
  }

  static async remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const propertyId = Number(req.params.id);
      const consumptionId = Number(req.params.consumoId);
      ConsumptionService.deleteConsumption(propertyId, consumptionId, req.userId!);
      res.status(200).json({ mensagem: 'Consumo excluído com sucesso' });
    } catch (err) {
      next(err);
    }
  }
}
