import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import propertyRoutes from './routes/property.routes.js';
import consumptionRoutes from './routes/consumption.routes.js';
import { ConsumptionController } from './controllers/consumption.controller.js';
import { authMiddleware } from './middlewares/auth.middleware.js';

export const app = express();

// Global middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    sistema: 'Dimensionamento Energético Residencial (FIAP SERS)',
    timestamp: new Date().toISOString(),
  });
});

// Resource routes
app.use('/api/auth', authRoutes);
app.use('/api/imoveis', propertyRoutes);
app.use('/api/imoveis/:id/consumos', consumptionRoutes);
app.get('/api/imoveis/:id/resumo', authMiddleware, ConsumptionController.summary);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    erro: 'Rota não encontrada',
    mensagem: 'O endpoint solicitado não existe na API',
  });
});

// TSK-13.2: Global error handler with standardized PT-BR responses
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || 500;
  const mensagem = err.message || 'Erro interno no servidor';

  if (status === 500) {
    console.error('Internal error:', err);
  }

  res.status(status).json({
    erro: status === 500 ? 'Erro interno no servidor' : 'Falha na requisição',
    mensagem,
  });
});
