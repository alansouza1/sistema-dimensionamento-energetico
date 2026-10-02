import { Response } from 'express';
import { AuthRequest } from '../types/index.js';
import { SolarService } from '../services/solar.service.js';

export class SolarController {
  public static getEquipamentos(_req: AuthRequest, res: Response): void {
    try {
      const modulos = SolarService.getModulos();
      const inversores = SolarService.getInversores();
      const baterias = SolarService.getBaterias();

      res.status(200).json({
        modulos,
        inversores,
        baterias,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Erro ao carregar catálogo de equipamentos.' });
    }
  }

  public static dimensionar(req: AuthRequest, res: Response): void {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
      }

      const { property_id, hsp, percentual_atendimento, com_armazenamento, horas_autonomia, modulo_id, inversor_id, bateria_id, origem_hsp } = req.body;

      if (!property_id) {
        res.status(400).json({ error: 'O ID do imóvel (property_id) é obrigatório.' });
        return;
      }

      const proposta = SolarService.dimensionar(userId, {
        property_id: Number(property_id),
        hsp: hsp !== undefined && hsp !== '' ? Number(hsp) : undefined,
        percentual_atendimento: percentual_atendimento !== undefined && percentual_atendimento !== '' ? Number(percentual_atendimento) : undefined,
        com_armazenamento: Boolean(com_armazenamento),
        horas_autonomia: horas_autonomia !== undefined && horas_autonomia !== '' ? Number(horas_autonomia) : undefined,
        modulo_id,
        inversor_id,
        bateria_id,
        origem_hsp,
      });

      res.status(200).json(proposta);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Erro ao processar dimensionamento fotovoltaico.' });
    }
  }
}
