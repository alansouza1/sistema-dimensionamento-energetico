import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import { verifyToken } from '../utils/security.js';

/**
 * TSK-02.2 & TSK-15.1: JWT authentication middleware.
 * Extracts Bearer token, validates it, and injects userId into request.
 */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      erro: 'Acesso não autorizado',
      mensagem: 'Token de autenticação não fornecido ou em formato inválido',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token) as { id: number; email: string; nome: string };
    req.userId = decoded.id;
    req.user = { id: decoded.id, nome: decoded.nome, email: decoded.email };
    next();
  } catch {
    res.status(401).json({
      erro: 'Acesso não autorizado',
      mensagem: 'Token inválido ou expirado',
    });
  }
}
