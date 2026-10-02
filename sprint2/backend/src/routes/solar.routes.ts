import { Router } from 'express';
import { SolarController } from '../controllers/solar.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

export const solarRouter = Router();

solarRouter.use(authMiddleware);

solarRouter.get('/equipamentos', SolarController.getEquipamentos);
solarRouter.post('/dimensionamento', SolarController.dimensionar);
