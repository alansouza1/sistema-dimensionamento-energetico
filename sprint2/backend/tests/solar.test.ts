import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { db } from '../src/database/db.js';
import { SolarService } from '../src/services/solar.service.js';

describe('Sprint 2 — Sistema Fotovoltaico & Orçamento', () => {
  let token: string;
  let propertyId: number;

  beforeAll(async () => {
    // Limpa tabelas
    db.exec(`
      DELETE FROM consumos_mensais;
      DELETE FROM imoveis;
      DELETE FROM usuarios;
    `);

    // Registra usuário para testes
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({ nome: 'Alan Engenharia', email: 'alan.solar@fiap.com.br', senha: 'solarPassword123' });
    token = userRes.body.token;

    // Cadastra imóvel
    const propRes = await request(app)
      .post('/api/imoveis')
      .set('Authorization', `Bearer ${token}`)
      .send({ identificacao: 'Residência Teste Solar', endereco: 'Av. Paulista, 1000 - SP', tipo: 'Casa' });
    propertyId = propRes.body.id;

    // Popula histórico de consumo com dados do livro texto da FIAP
    // Jan: 320, Fev: 295, Mar: 410, Abr: 365, Mai: 340 (Média = 346.00 kWh)
    await request(app)
      .post(`/api/imoveis/${propertyId}/consumos/seed-teste`)
      .set('Authorization', `Bearer ${token}`);
  });

  afterAll(() => {
    db.exec(`
      DELETE FROM consumos_mensais;
      DELETE FROM imoveis;
      DELETE FROM usuarios;
    `);
  });

  describe('US01 — Base de Equipamentos (Datasets CSV)', () => {
    it('deve carregar modulos.csv com no mínimo 10 módulos reais e campos válidos', () => {
      const modulos = SolarService.getModulos();
      expect(modulos.length).toBeGreaterThanOrEqual(10);
      for (const m of modulos) {
        expect(m.id).toBeDefined();
        expect(m.fabricante).toBeTruthy();
        expect(m.modelo).toBeTruthy();
        expect(m.potencia_wp).toBeGreaterThan(0);
        expect(m.voc_v).toBeGreaterThan(0);
        expect(m.isc_a).toBeGreaterThan(0);
        expect(m.preco_brl).toBeGreaterThan(0);
        expect(m.url_fonte).toContain('http');
      }
    });

    it('deve carregar inversores.csv com no mínimo 8 inversores reais e tipos On-Grid e Híbrido', () => {
      const inversores = SolarService.getInversores();
      expect(inversores.length).toBeGreaterThanOrEqual(8);
      
      const temHibrido = inversores.some(i => i.compativel_bateria === true);
      const temOnGrid = inversores.some(i => i.compativel_bateria === false);
      expect(temHibrido).toBe(true);
      expect(temOnGrid).toBe(true);

      for (const inv of inversores) {
        expect(inv.potencia_nominal_w).toBeGreaterThan(0);
        expect(inv.potencia_max_fv_w).toBeGreaterThanOrEqual(inv.potencia_nominal_w);
        expect(inv.preco_brl).toBeGreaterThan(0);
        expect(inv.url_fonte).toContain('http');
      }
    });

    it('deve carregar baterias.csv com no mínimo 6 baterias e tecnologias reais', () => {
      const baterias = SolarService.getBaterias();
      expect(baterias.length).toBeGreaterThanOrEqual(6);
      for (const bat of baterias) {
        expect(bat.capacidade_kwh).toBeGreaterThan(0);
        expect(bat.dod_pct).toBeGreaterThan(0);
        expect(bat.ciclos).toBeGreaterThan(0);
        expect(bat.preco_brl).toBeGreaterThan(0);
        expect(bat.url_fonte).toContain('http');
      }
    });
  });

  describe('Cenário 1 — Dimensionamento sem baterias (Grid-Tie)', () => {
    it('deve dimensionar corretamente sem armazenamento e selecionar inversor compatível', async () => {
      const res = await request(app)
        .post('/api/solar/dimensionamento')
        .set('Authorization', `Bearer ${token}`)
        .send({
          property_id: propertyId,
          hsp: 4.5,
          percentual_atendimento: 100,
          com_armazenamento: false,
        });

      expect(res.status).toBe(200);
      const proposta = res.body;

      // Consumo de referência do livro: 346 kWh
      expect(proposta.consumo_referencia_kwh).toBe(346);
      expect(proposta.percentual_atendimento_pct).toBe(100);
      expect(proposta.energia_mensal_gerar_kwh).toBe(346);
      
      // P_FV = 346 / (4.5 * 30 * 0.78) = ~3.286 kWp
      expect(proposta.potencia_fv_necessaria_kwp).toBeGreaterThan(3.0);
      expect(proposta.potencia_fv_necessaria_kwp).toBeLessThan(3.5);

      // Módulo selecionado
      expect(proposta.modulo.quantidade).toBeGreaterThanOrEqual(5);
      expect(proposta.potencia_instalada_kwp).toBeGreaterThanOrEqual(proposta.potencia_fv_necessaria_kwp);

      // Inversor
      expect(proposta.inversor.equipamento).toBeDefined();
      expect(proposta.inversor.fator_dimensionamento).toBeGreaterThan(0.5);

      // Sem armazenamento
      expect(proposta.armazenamento.incluido).toBe(false);
      expect(proposta.armazenamento.quantidade_baterias).toBe(0);
      expect(proposta.orcamento.custo_baterias_brl).toBe(0);

      // Orçamento consistente
      expect(proposta.orcamento.custo_equipamentos_brl).toBe(
        proposta.orcamento.custo_modulos_brl + proposta.orcamento.custo_inversor_brl
      );
      expect(proposta.orcamento.outros_custos_brl).toBeGreaterThan(0);
      expect(proposta.orcamento.custo_total_estimado_brl).toBe(
        proposta.orcamento.custo_equipamentos_brl + proposta.orcamento.outros_custos_brl
      );
    });
  });

  describe('Cenário 2 — Dimensionamento com baterias (Híbrido com Armazenamento)', () => {
    it('deve dimensionar banco de baterias e forçar seleção de inversor híbrido compatível', async () => {
      const res = await request(app)
        .post('/api/solar/dimensionamento')
        .set('Authorization', `Bearer ${token}`)
        .send({
          property_id: propertyId,
          hsp: 4.5,
          percentual_atendimento: 100,
          com_armazenamento: true,
          horas_autonomia: 12,
        });

      expect(res.status).toBe(200);
      const proposta = res.body;

      // Inversor obrigatoriamente híbrido
      expect(proposta.inversor.equipamento.compativel_bateria).toBe(true);

      // Baterias
      expect(proposta.armazenamento.incluido).toBe(true);
      expect(proposta.armazenamento.horas_autonomia).toBe(12);
      expect(proposta.armazenamento.quantidade_baterias).toBeGreaterThan(0);
      expect(proposta.armazenamento.capacidade_instalada_kwh).toBeGreaterThan(0);
      expect(proposta.armazenamento.equipamento).toBeDefined();

      // Custo de baterias contabilizado no orçamento
      expect(proposta.orcamento.custo_baterias_brl).toBeGreaterThan(0);
      expect(proposta.orcamento.custo_equipamentos_brl).toBe(
        proposta.orcamento.custo_modulos_brl + proposta.orcamento.custo_inversor_brl + proposta.orcamento.custo_baterias_brl
      );
    });
  });

  describe('API — Catálogo de Equipamentos', () => {
    it('deve retornar lista completa de equipamentos via GET /api/solar/equipamentos', async () => {
      const res = await request(app)
        .get('/api/solar/equipamentos')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('modulos');
      expect(res.body).toHaveProperty('inversores');
      expect(res.body).toHaveProperty('baterias');
      expect(res.body.modulos.length).toBeGreaterThanOrEqual(10);
      expect(res.body.inversores.length).toBeGreaterThanOrEqual(8);
      expect(res.body.baterias.length).toBeGreaterThanOrEqual(6);
    });
  });
});
