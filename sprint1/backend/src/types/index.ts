import { Request } from 'express';

export interface User {
  id: number;
  nome: string;
  email: string;
  senha?: string;
  criado_em?: string;
}

export interface Property {
  id: number;
  usuario_id: number;
  identificacao: string;
  endereco: string;
  tipo: string;
  criado_em?: string;
}

export interface MonthlyConsumption {
  id: number;
  imovel_id: number;
  ano: number;
  mes: number;
  consumo_kwh: number;
  criado_em?: string;
}

export interface EnergySummary {
  imovel_id: number;
  total_meses: number;
  consumo_maximo: number;
  mes_pico: {
    mes: number;
    ano: number;
    nome_mes: string;
  } | null;
  consumo_medio: number;
  consumos: Array<{
    id?: number;
    mes: number;
    ano: number;
    consumo_kwh: number;
    nome_mes?: string;
  }>;
}

export interface AuthRequest extends Request {
  userId?: number;
  user?: {
    id: number;
    nome: string;
    email: string;
  };
}
