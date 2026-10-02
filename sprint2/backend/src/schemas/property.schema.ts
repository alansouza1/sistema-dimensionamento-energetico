import { z } from 'zod';

export const createPropertySchema = z.object({
  identificacao: z.string({ required_error: 'A identificação do imóvel é obrigatória' })
    .trim().min(1, 'A identificação não pode ser vazia'),
  endereco: z.string({ required_error: 'O endereço é obrigatório' })
    .trim().min(1, 'O endereço não pode ser vazio'),
  tipo: z.string({ required_error: 'O tipo do imóvel é obrigatório' })
    .trim().min(1, 'O tipo não pode ser vazio'),
});

export const updatePropertySchema = z.object({
  identificacao: z.string().trim().min(1, 'A identificação não pode ser vazia').optional(),
  endereco: z.string().trim().min(1, 'O endereço não pode ser vazio').optional(),
  tipo: z.string().trim().min(1, 'O tipo não pode ser vazio').optional(),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
