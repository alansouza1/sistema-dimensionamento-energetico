export interface Property {
  id: number;
  identificacao: string;
  endereco: string;
  tipo: string;
  criado_em?: string;
}

export interface CreatePropertyInput {
  identificacao: string;
  endereco: string;
  tipo: string;
}

export interface UpdatePropertyInput {
  identificacao: string;
  endereco: string;
  tipo: string;
}
