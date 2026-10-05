import { Router } from 'express';
import { SolarController } from '../controllers/solar.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

export const solarRouter = Router();

solarRouter.use(authMiddleware);

solarRouter.get('/equipamentos', SolarController.getEquipamentos);
solarRouter.post('/dimensionamento', SolarController.dimensionar);
solarRouter.post('/comparativo', SolarController.dimensionarComparativo);
solarRouter.post('/propostas', SolarController.salvarProposta);
solarRouter.get('/imoveis/:propertyId/propostas', SolarController.listarPropostas);
solarRouter.get('/propostas/:id', SolarController.obterProposta);
solarRouter.delete('/propostas/:id', SolarController.excluirProposta);
