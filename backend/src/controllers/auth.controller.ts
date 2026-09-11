import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { AuthRequest } from '../types/index.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { nome, email, senha } = req.body;
      const result = AuthService.register(nome, email, senha);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, senha } = req.body;
      const result = AuthService.login(email, senha);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({ erro: 'Não autenticado' });
        return;
      }
      const user = AuthService.findById(req.userId);
      if (!user) {
        res.status(404).json({ erro: 'Usuário não encontrado' });
        return;
      }
      res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  }
}
