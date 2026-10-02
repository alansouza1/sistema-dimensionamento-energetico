import { z } from 'zod';

export const consumptionItemSchema = z.object({
  ano: z.number({ required_error: 'O ano é obrigatório' })
    .int('O ano deve ser um número inteiro')
    .min(2000, 'Ano mínimo é 2000')
    .max(2100, 'Ano máximo é 2100'),
  mes: z.number({ required_error: 'O mês é obrigatório' })
    .int('O mês deve ser um número inteiro')
    .min(1, 'O mês deve ser entre 1 e 12')
    .max(12, 'O mês deve ser entre 1 e 12'),
  consumo_kwh: z.number({ required_error: 'O consumo em kWh é obrigatório' })
    .min(0, 'O consumo não pode ser negativo'),
});

export const batchConsumptionSchema = z.object({
  faturas: z.array(consumptionItemSchema)
    .min(1, 'Envie pelo menos uma fatura'),
});

export type ConsumptionInput = z.infer<typeof consumptionItemSchema>;
export type BatchConsumptionInput = z.infer<typeof batchConsumptionSchema>;
