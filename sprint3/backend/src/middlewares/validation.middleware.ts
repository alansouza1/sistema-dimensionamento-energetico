import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * TSK-13.1 & TSK-13.2: Centralized validation middleware using Zod.
 * Returns standardized PT-BR error messages on validation failure.
 */
export function validateBody(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const detalhes = error.errors.map((err) => ({
          campo: err.path.join('.'),
          mensagem: err.message,
        }));

        res.status(400).json({
          erro: 'Falha na validação de dados',
          detalhes,
        });
        return;
      }

      res.status(400).json({
        erro: 'Erro de validação desconhecido',
      });
    }
  };
}
