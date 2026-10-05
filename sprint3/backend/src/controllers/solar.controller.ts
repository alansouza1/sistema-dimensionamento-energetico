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

  public static dimensionarComparativo(req: AuthRequest, res: Response): void {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
      }

      const { property_id, hsp, percentual_atendimento, com_armazenamento, horas_autonomia, modulo_id, inversor_id, bateria_id, origem_hsp, tarifa_kwh } = req.body;

      if (!property_id) {
        res.status(400).json({ error: 'O ID do imóvel (property_id) é obrigatório.' });
        return;
      }

      const proposta = SolarService.dimensionarComparativo(userId, {
        property_id: Number(property_id),
        hsp: hsp !== undefined && hsp !== '' ? Number(hsp) : undefined,
        percentual_atendimento: percentual_atendimento !== undefined && percentual_atendimento !== '' ? Number(percentual_atendimento) : undefined,
        com_armazenamento: Boolean(com_armazenamento),
        horas_autonomia: horas_autonomia !== undefined && horas_autonomia !== '' ? Number(horas_autonomia) : undefined,
        modulo_id,
        inversor_id,
        bateria_id,
        origem_hsp,
        tarifa_kwh: tarifa_kwh !== undefined && tarifa_kwh !== '' ? Number(tarifa_kwh) : undefined,
      });

      res.status(200).json(proposta);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Erro ao processar dimensionamento comparativo.' });
    }
  }

  public static salvarProposta(req: AuthRequest, res: Response): void {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
      }

      const { property_id, proposta } = req.body;
      if (!property_id || !proposta) {
        res.status(400).json({ error: 'ID do imóvel e dados da proposta são obrigatórios.' });
        return;
      }

      const id = SolarService.salvarProposta(userId, Number(property_id), proposta);
      res.status(201).json({ id, message: 'Proposta salva com sucesso.' });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Erro ao salvar proposta.' });
    }
  }

  public static listarPropostas(req: AuthRequest, res: Response): void {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
      }

      const { propertyId } = req.params;
      if (!propertyId) {
        res.status(400).json({ error: 'ID do imóvel é obrigatório.' });
        return;
      }

      const propostas = SolarService.listarPropostas(userId, Number(propertyId));
      res.status(200).json(propostas);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Erro ao listar propostas.' });
    }
  }

  public static obterProposta(req: AuthRequest, res: Response): void {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
      }

      const { id } = req.params;
      const proposta = SolarService.obterProposta(userId, Number(id));
      if (!proposta) {
        res.status(404).json({ error: 'Proposta não encontrada.' });
        return;
      }

      res.status(200).json(proposta);
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Erro ao obter proposta.' });
    }
  }

  public static excluirProposta(req: AuthRequest, res: Response): void {
    try {
      const userId = req.user?.id || req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado.' });
        return;
      }

      const { id } = req.params;
      const sucesso = SolarService.excluirProposta(userId, Number(id));
      
      if (!sucesso) {
        res.status(404).json({ error: 'Proposta não encontrada ou já excluída.' });
        return;
      }

      res.status(200).json({ message: 'Proposta excluída com sucesso.' });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Erro ao excluir proposta.' });
    }
  }
}
