import { User, AuthResponse, LoginCredentials, RegisterCredentials } from '../types/auth';
import { Property, CreatePropertyInput, UpdatePropertyInput } from '../types/property';
import { MonthlyConsumption, EnergySummary, CreateConsumptionInput, ConsumptionBatchInput } from '../types/consumption';

const DEFAULT_API_URL = 'http://localhost:3001/api';
const STORAGE_KEY_API_URL = 'sers_api_url';
const STORAGE_KEY_TOKEN = 'sers_token';
const STORAGE_KEY_USER = 'sers_user';
const STORAGE_KEY_PROPERTIES = 'sers_local_properties';
const STORAGE_KEY_CONSUMPTIONS = 'sers_local_consumptions';

export const MONTH_NAMES_PT: Record<number, string> = {
  1: 'Janeiro',
  2: 'Fevereiro',
  3: 'Março',
  4: 'Abril',
  5: 'Maio',
  6: 'Junho',
  7: 'Julho',
  8: 'Agosto',
  9: 'Setembro',
  10: 'Outubro',
  11: 'Novembro',
  12: 'Dezembro',
};

export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return DEFAULT_API_URL;
  return localStorage.getItem(STORAGE_KEY_API_URL) || DEFAULT_API_URL;
}

export function setApiBaseUrl(url: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_API_URL, url.replace(/\/+$/, ''));
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY_TOKEN);
}

export function setStoredToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
  } else {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  }
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY_USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredUser(user: User | null): void {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY_USER);
  }
}

// Global state tracking connection mode
export type ConnectionMode = 'checking' | 'connected' | 'simulated';
let currentConnectionMode: ConnectionMode = 'simulated';
const listeners: Array<(mode: ConnectionMode) => void> = [];

export function subscribeConnectionMode(callback: (mode: ConnectionMode) => void): () => void {
  listeners.push(callback);
  callback(currentConnectionMode);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

function updateConnectionMode(mode: ConnectionMode) {
  if (currentConnectionMode !== mode) {
    currentConnectionMode = mode;
    listeners.forEach((cb) => cb(mode));
  }
}

export function getConnectionMode(): ConnectionMode {
  return currentConnectionMode;
}

// Initial seed data for seamless simulation mode
function initializeMockStorage() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(STORAGE_KEY_PROPERTIES)) {
    const defaultProperties: Property[] = [
      {
        id: 1,
        identificacao: 'Casa Principal (Residência SP)',
        endereco: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
        tipo: 'Residencial',
        criado_em: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEY_PROPERTIES, JSON.stringify(defaultProperties));
  }

  if (!localStorage.getItem(STORAGE_KEY_CONSUMPTIONS)) {
    const defaultConsumptions: MonthlyConsumption[] = [
      { id: 1, imovel_id: 1, ano: 2026, mes: 1, consumo_kwh: 320.0 },
      { id: 2, imovel_id: 1, ano: 2026, mes: 2, consumo_kwh: 295.0 },
      { id: 3, imovel_id: 1, ano: 2026, mes: 3, consumo_kwh: 410.0 },
      { id: 4, imovel_id: 1, ano: 2026, mes: 4, consumo_kwh: 365.0 },
      { id: 5, imovel_id: 1, ano: 2026, mes: 5, consumo_kwh: 340.0 },
    ];
    localStorage.setItem(STORAGE_KEY_CONSUMPTIONS, JSON.stringify(defaultConsumptions));
  }
}

initializeMockStorage();

// Local Storage Helpers for Simulation Mode
function getLocalProperties(): Property[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROPERTIES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalProperties(props: Property[]) {
  localStorage.setItem(STORAGE_KEY_PROPERTIES, JSON.stringify(props));
}

function getLocalConsumptions(): MonthlyConsumption[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONSUMPTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalConsumptions(data: MonthlyConsumption[]) {
  localStorage.setItem(STORAGE_KEY_CONSUMPTIONS, JSON.stringify(data));
}

export function calculateLocalSummary(propertyId: number): EnergySummary {
  const allConsumptions = getLocalConsumptions()
    .filter((c) => c.imovel_id === propertyId)
    .sort((a, b) => {
      if (a.ano !== b.ano) return a.ano - b.ano;
      return a.mes - b.mes;
    });

  if (allConsumptions.length === 0) {
    return {
      imovel_id: propertyId,
      total_meses: 0,
      consumo_maximo: 0,
      mes_pico: null,
      consumo_medio: 0,
      consumos: [],
    };
  }

  let maxItem = allConsumptions[0];
  let sum = 0;

  for (const item of allConsumptions) {
    sum += Number(item.consumo_kwh);
    if (Number(item.consumo_kwh) > Number(maxItem.consumo_kwh)) {
      maxItem = item;
    }
  }

  const average = Number((sum / allConsumptions.length).toFixed(2));
  const max = Number(Number(maxItem.consumo_kwh).toFixed(2));

  return {
    imovel_id: propertyId,
    total_meses: allConsumptions.length,
    consumo_maximo: max,
    mes_pico: {
      mes: maxItem.mes,
      ano: maxItem.ano,
      nome_mes: MONTH_NAMES_PT[maxItem.mes] || `Mês ${maxItem.mes}`,
    },
    consumo_medio: average,
    consumos: allConsumptions,
  };
}

// Generic Request Wrapper with Auto-Fallback to Local Mode
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  fallbackFn?: () => T | Promise<T>
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const token = getStoredToken();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const message = errBody.mensagem || errBody.message || `Erro HTTP ${response.status}`;
      throw new Error(message);
    }

    updateConnectionMode('connected');
    return await response.json();
  } catch (error: any) {
    // If connection refused, aborted or failed to fetch, switch to simulation
    updateConnectionMode('simulated');
    if (fallbackFn) {
      return await fallbackFn();
    }
    throw error;
  }
}

// Seed the 5 test months from the FIAP SERS booklet
export function getBookletSeedData(propertyId: number): MonthlyConsumption[] {
  return [
    { id: Date.now() + 1, imovel_id: propertyId, ano: 2026, mes: 1, consumo_kwh: 320.0 },
    { id: Date.now() + 2, imovel_id: propertyId, ano: 2026, mes: 2, consumo_kwh: 295.0 },
    { id: Date.now() + 3, imovel_id: propertyId, ano: 2026, mes: 3, consumo_kwh: 410.0 },
    { id: Date.now() + 4, imovel_id: propertyId, ano: 2026, mes: 4, consumo_kwh: 365.0 },
    { id: Date.now() + 5, imovel_id: propertyId, ano: 2026, mes: 5, consumo_kwh: 340.0 },
  ];
}

export { getLocalProperties, saveLocalProperties, getLocalConsumptions, saveLocalConsumptions };
