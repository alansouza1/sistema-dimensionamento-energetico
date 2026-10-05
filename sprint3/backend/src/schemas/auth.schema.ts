import { z } from 'zod';

export const registerSchema = z.object({
  nome: z.string({ required_error: 'O nome é obrigatório' })
    .min(2, 'O nome deve ter pelo menos 2 caracteres'),
  email: z.string({ required_error: 'O e-mail é obrigatório' })
    .email('Formato de e-mail inválido'),
  senha: z.string({ required_error: 'A senha é obrigatória' })
    .min(4, 'A senha deve ter pelo menos 4 caracteres'),
});

export const loginSchema = z.object({
  email: z.string({ required_error: 'O e-mail é obrigatório' })
    .email('Formato de e-mail inválido'),
  senha: z.string({ required_error: 'A senha é obrigatória' })
    .min(1, 'A senha é obrigatória'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
