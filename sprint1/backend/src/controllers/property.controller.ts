import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import { PropertyService } from '../services/property.service.js';

export class PropertyController {
  static async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { identificacao, endereco, tipo } = req.body;
      const property = PropertyService.create(req.userId!, identificacao, endereco, tipo);
      res.status(201).json(property);
    } catch (err) {
      next(err);
    }
  }

  static async list(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const properties = PropertyService.listByUser(req.userId!);
      res.status(200).json(properties);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const propertyId = Number(req.params.id);
      const property = PropertyService.findById(propertyId, req.userId!);
      if (!property) {
        res.status(404).json({ erro: 'Imóvel não encontrado' });
        return;
      }
      res.status(200).json(property);
    } catch (err) {
      next(err);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const propertyId = Number(req.params.id);
      const updated = PropertyService.update(propertyId, req.userId!, req.body);
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }

  static async remove(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const propertyId = Number(req.params.id);
      PropertyService.delete(propertyId, req.userId!);
      res.status(200).json({ mensagem: 'Imóvel e seus consumos foram excluídos com sucesso' });
    } catch (err) {
      next(err);
    }
  }
}
