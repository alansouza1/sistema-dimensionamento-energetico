import { db } from '../database/db.js';
import { MonthlyConsumption, EnergySummary } from '../types/index.js';
import { PropertyService } from './property.service.js';
import { buildEnergySummary } from './calculation.service.js';

function rowToConsumption(row: Record<string, unknown>): MonthlyConsumption {
  return {
    id: row.id as number,
    imovel_id: row.imovel_id as number,
    ano: row.ano as number,
    mes: row.mes as number,
    consumo_kwh: row.consumo_kwh as number,
    criado_em: row.criado_em as string | undefined,
  };
}

export class ConsumptionService {
  /**
   * Verify that the property exists and belongs to the user
   */
  private static verifyOwnership(propertyId: number, userId: number) {
    const property = PropertyService.findById(propertyId, userId);
    if (!property) {
      const error: any = new Error('Imóvel não encontrado ou não pertence ao usuário');
      error.status = 404;
      throw error;
    }
    return property;
  }

  /**
   * TSK-05.1, TSK-05.2, TSK-06.2: Register a single monthly consumption bill
   */
  static addConsumption(
    propertyId: number,
    userId: number,
    ano: number,
    mes: number,
    consumoKwh: number,
  ): MonthlyConsumption {
    this.verifyOwnership(propertyId, userId);

    try {
      const stmt = db.prepare(`
        INSERT INTO consumos_mensais (imovel_id, ano, mes, consumo_kwh)
        VALUES (?, ?, ?, ?)
      `);
      const info = stmt.run(propertyId, ano, mes, consumoKwh);

      return {
        id: Number(info.lastInsertRowid),
        imovel_id: propertyId,
        ano,
        mes,
        consumo_kwh: consumoKwh,
      };
    } catch (err: any) {
      if (err.message?.includes('UNIQUE constraint failed')) {
        const error: any = new Error(
          `Já existe registro de consumo para o mês ${mes}/${ano} neste imóvel`,
        );
        error.status = 409;
        throw error;
      }
      throw err;
    }
  }

  /**
   * TSK-06.1: Batch insert multiple monthly bills in a single atomic transaction
   */
  static addBatch(
    propertyId: number,
    userId: number,
    bills: Array<{ ano: number; mes: number; consumo_kwh: number }>,
  ): MonthlyConsumption[] {
    this.verifyOwnership(propertyId, userId);

    const results: MonthlyConsumption[] = [];
    const stmt = db.prepare(`
      INSERT INTO consumos_mensais (imovel_id, ano, mes, consumo_kwh)
      VALUES (?, ?, ?, ?)
    `);

    db.exec('BEGIN');
    try {
      for (const bill of bills) {
        const info = stmt.run(propertyId, bill.ano, bill.mes, bill.consumo_kwh);
        results.push({
          id: Number(info.lastInsertRowid),
          imovel_id: propertyId,
          ano: bill.ano,
          mes: bill.mes,
          consumo_kwh: bill.consumo_kwh,
        });
      }
      db.exec('COMMIT');
      return results;
    } catch (err: any) {
      db.exec('ROLLBACK');
      if (err.message?.includes('UNIQUE constraint failed')) {
        const error: any = new Error(
          'Uma ou mais faturas já existem para este imóvel no mesmo mês/ano',
        );
        error.status = 409;
        throw error;
      }
      throw err;
    }
  }

  /**
   * TSK-07.1: List consumption history in chronological order (ORDER BY ano, mes)
   */
  static listByProperty(propertyId: number, userId: number): MonthlyConsumption[] {
    this.verifyOwnership(propertyId, userId);

    const stmt = db.prepare(`
      SELECT id, imovel_id, ano, mes, consumo_kwh, criado_em
      FROM consumos_mensais WHERE imovel_id = ?
      ORDER BY ano ASC, mes ASC
    `);
    const rows = stmt.all(propertyId) as Record<string, unknown>[];
    return rows.map(rowToConsumption);
  }

  /**
   * TSK-08.1 to TSK-11.1: Build the consolidated energy summary
   */
  static getSummary(propertyId: number, userId: number): EnergySummary {
    const records = this.listByProperty(propertyId, userId);
    return buildEnergySummary(propertyId, records);
  }

  /**
   * TSK-11.2: Seed the FIAP textbook test case
   * Jan: 320 kWh, Feb: 295 kWh, Mar: 410 kWh, Apr: 365 kWh, May: 340 kWh
   */
  static seedTextbookData(propertyId: number, userId: number, ano: number = 2026): EnergySummary {
    this.verifyOwnership(propertyId, userId);

    // Clear existing data for that year to avoid UNIQUE conflicts
    db.prepare('DELETE FROM consumos_mensais WHERE imovel_id = ? AND ano = ?')
      .run(propertyId, ano);

    const textbookBills = [
      { ano, mes: 1, consumo_kwh: 320 },
      { ano, mes: 2, consumo_kwh: 295 },
      { ano, mes: 3, consumo_kwh: 410 },
      { ano, mes: 4, consumo_kwh: 365 },
      { ano, mes: 5, consumo_kwh: 340 },
    ];

    this.addBatch(propertyId, userId, textbookBills);
    return this.getSummary(propertyId, userId);
  }

  /**
   * Delete a single consumption record
   */
  static deleteConsumption(propertyId: number, consumptionId: number, userId: number): boolean {
    this.verifyOwnership(propertyId, userId);

    const result = db.prepare('DELETE FROM consumos_mensais WHERE id = ? AND imovel_id = ?')
      .run(consumptionId, propertyId);
    return Number(result.changes) > 0;
  }
}
