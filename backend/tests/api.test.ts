import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { db } from '../src/database/db.js';

describe('SERS Energy Dimensioning API — Integration Tests', () => {
  let userAToken: string;
  let userBToken: string;
  let propertyId: number;

  beforeAll(() => {
    // Clean tables before running tests
    db.exec(`
      DELETE FROM consumos_mensais;
      DELETE FROM imoveis;
      DELETE FROM usuarios;
    `);
  });

  afterAll(() => {
    // Clean up after tests
    db.exec(`
      DELETE FROM consumos_mensais;
      DELETE FROM imoveis;
      DELETE FROM usuarios;
    `);
  });

  // ─────────────────────────────────────────────────────────────
  // PB01 & PB02 — Authentication (TSK-01, TSK-02)
  // ─────────────────────────────────────────────────────────────

  describe('PB01 & PB02 — Authentication', () => {
    it('should register a new user successfully (TSK-01.1, TSK-01.2)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ nome: 'Alan Souza', email: 'alan@fiap.com.br', senha: 'senhaSegura123' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.usuario).toHaveProperty('id');
      expect(res.body.usuario.email).toBe('alan@fiap.com.br');
      userAToken = res.body.token;
    });

    it('should reject duplicate email (TSK-01.2)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ nome: 'Alan Clone', email: 'alan@fiap.com.br', senha: 'outraSenha' });

      expect(res.status).toBe(409);
      expect(res.body.mensagem).toContain('E-mail já cadastrado');
    });

    it('should reject invalid registration data (TSK-13.1)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ nome: 'A', email: 'email-invalido', senha: '12' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('detalhes');
      expect(res.body.detalhes.length).toBeGreaterThanOrEqual(1);
    });

    it('should login with correct credentials (TSK-02.1)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'alan@fiap.com.br', senha: 'senhaSegura123' });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.usuario.nome).toBe('Alan Souza');
    });

    it('should reject wrong password (TSK-02.1)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'alan@fiap.com.br', senha: 'senhaErrada' });

      expect(res.status).toBe(401);
    });

    it('should return user profile with valid token (TSK-02.2)', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.email).toBe('alan@fiap.com.br');
    });

    it('should reject request without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // PB03 & PB04 — Property Management (TSK-03, TSK-04)
  // ─────────────────────────────────────────────────────────────

  describe('PB03 & PB04 — Property Management', () => {
    it('should create a property linked to the user (TSK-03.1, TSK-03.2)', async () => {
      const res = await request(app)
        .post('/api/imoveis')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          identificacao: 'Residência Principal',
          endereco: 'Av. Lins de Vasconcelos, 1222 - Aclimação',
          tipo: 'Casa',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.identificacao).toBe('Residência Principal');
      propertyId = res.body.id;
    });

    it('should list properties for authenticated user', async () => {
      const res = await request(app)
        .get('/api/imoveis')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
    });

    it('should update property details (TSK-04.1)', async () => {
      const res = await request(app)
        .put(`/api/imoveis/${propertyId}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ identificacao: 'Residência Renovada' });

      expect(res.status).toBe(200);
      expect(res.body.identificacao).toBe('Residência Renovada');
    });

    it('should reject empty identificacao', async () => {
      const res = await request(app)
        .post('/api/imoveis')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ identificacao: '', endereco: 'Rua X', tipo: 'Casa' });

      expect(res.status).toBe(400);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // PB15 — Security & Multi-tenant Isolation (TSK-15)
  // ─────────────────────────────────────────────────────────────

  describe('PB15 — Security & Multi-tenant Isolation', () => {
    beforeAll(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ nome: 'Gustavo Belizario', email: 'gustavo@fiap.com.br', senha: 'senhaGustavo123' });
      userBToken = res.body.token;
    });

    it('User B should not see User A properties', async () => {
      const res = await request(app)
        .get('/api/imoveis')
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(0);
    });

    it('User B should not access User A property by ID', async () => {
      const res = await request(app)
        .get(`/api/imoveis/${propertyId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
    });

    it('User B should not update User A property', async () => {
      const res = await request(app)
        .put(`/api/imoveis/${propertyId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ identificacao: 'Tentativa de Invasão' });

      expect(res.status).toBe(404);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // PB05–PB11 — Consumption, Calculations & Textbook Validation
  // ─────────────────────────────────────────────────────────────

  describe('PB05–PB11 — Consumption & Energy Calculations', () => {
    it('should reject negative consumption (TSK-05.2)', async () => {
      const res = await request(app)
        .post(`/api/imoveis/${propertyId}/consumos`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ ano: 2026, mes: 1, consumo_kwh: -50 });

      expect(res.status).toBe(400);
    });

    it('should reject invalid month (TSK-13.1)', async () => {
      const res = await request(app)
        .post(`/api/imoveis/${propertyId}/consumos`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ ano: 2026, mes: 13, consumo_kwh: 100 });

      expect(res.status).toBe(400);
    });

    it('should batch insert FIAP textbook bills: Jan–May (TSK-06.1, TSK-11.2)', async () => {
      const res = await request(app)
        .post(`/api/imoveis/${propertyId}/consumos/batch`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          faturas: [
            { ano: 2026, mes: 1, consumo_kwh: 320 },
            { ano: 2026, mes: 2, consumo_kwh: 295 },
            { ano: 2026, mes: 3, consumo_kwh: 410 },
            { ano: 2026, mes: 4, consumo_kwh: 365 },
            { ano: 2026, mes: 5, consumo_kwh: 340 },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.faturas.length).toBe(5);
    });

    it('should reject duplicate month/year (TSK-06.2)', async () => {
      const res = await request(app)
        .post(`/api/imoveis/${propertyId}/consumos`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ ano: 2026, mes: 3, consumo_kwh: 450 });

      expect(res.status).toBe(409);
      expect(res.body.mensagem).toContain('Já existe registro');
    });

    it('should list history in chronological order (TSK-07.1)', async () => {
      const res = await request(app)
        .get(`/api/imoveis/${propertyId}/consumos`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(5);
      expect(res.body[0].mes).toBe(1);
      expect(res.body[4].mes).toBe(5);
    });

    it('should calculate exactly the FIAP textbook results (TSK-08, 09, 10, 11.2)', async () => {
      const res = await request(app)
        .get(`/api/imoveis/${propertyId}/resumo`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      const summary = res.body;

      // Total months: 5
      expect(summary.total_meses).toBe(5);

      // Max consumption: 410 kWh/mês
      expect(summary.consumo_maximo).toBe(410.00);

      // Peak month: March (mes 3)
      expect(summary.mes_pico.mes).toBe(3);
      expect(summary.mes_pico.nome_mes).toBe('Março');

      // Average: (320 + 295 + 410 + 365 + 340) / 5 = 1730 / 5 = 346.00
      expect(summary.consumo_medio).toBe(346.00);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Cascade Deletion (TSK-04.2)
  // ─────────────────────────────────────────────────────────────

  describe('Cascade Deletion (TSK-04.2)', () => {
    it('should delete property and all associated consumptions', async () => {
      const delRes = await request(app)
        .delete(`/api/imoveis/${propertyId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(delRes.status).toBe(200);

      // Verify property is gone
      const getRes = await request(app)
        .get(`/api/imoveis/${propertyId}`)
        .set('Authorization', `Bearer ${userAToken}`);
      expect(getRes.status).toBe(404);

      // Verify consumptions were cascade-deleted
      const rows = db.prepare(
        'SELECT COUNT(*) as count FROM consumos_mensais WHERE imovel_id = ?',
      ).get(propertyId) as Record<string, unknown>;
      expect(rows.count).toBe(0);
    });
  });
});
