import { db } from '../database/db.js';
import { Property } from '../types/index.js';

function rowToProperty(row: Record<string, unknown>): Property {
  return {
    id: row.id as number,
    usuario_id: row.usuario_id as number,
    identificacao: row.identificacao as string,
    endereco: row.endereco as string,
    tipo: row.tipo as string,
    criado_em: row.criado_em as string | undefined,
  };
}

export class PropertyService {
  /**
   * TSK-03.1 & TSK-03.2: Create a property linked to the authenticated user
   */
  static create(userId: number, identificacao: string, endereco: string, tipo: string): Property {
    const stmt = db.prepare(`
      INSERT INTO imoveis (usuario_id, identificacao, endereco, tipo)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(userId, identificacao.trim(), endereco.trim(), tipo.trim());

    return {
      id: Number(info.lastInsertRowid),
      usuario_id: userId,
      identificacao: identificacao.trim(),
      endereco: endereco.trim(),
      tipo: tipo.trim(),
    };
  }

  /**
   * TSK-15.1: List only properties belonging to the authenticated user
   */
  static listByUser(userId: number): Property[] {
    const stmt = db.prepare(`
      SELECT id, usuario_id, identificacao, endereco, tipo, criado_em
      FROM imoveis WHERE usuario_id = ? ORDER BY id DESC
    `);
    const rows = stmt.all(userId) as Record<string, unknown>[];
    return rows.map(rowToProperty);
  }

  /**
   * TSK-15.1: Get a single property ensuring user ownership
   */
  static findById(propertyId: number, userId: number): Property | null {
    const stmt = db.prepare(`
      SELECT id, usuario_id, identificacao, endereco, tipo, criado_em
      FROM imoveis WHERE id = ? AND usuario_id = ?
    `);
    const row = stmt.get(propertyId, userId) as Record<string, unknown> | undefined;
    return row ? rowToProperty(row) : null;
  }

  /**
   * TSK-04.1 & TSK-15.1: Update property details
   */
  static update(
    propertyId: number,
    userId: number,
    data: { identificacao?: string; endereco?: string; tipo?: string },
  ): Property {
    const property = this.findById(propertyId, userId);
    if (!property) {
      const error: any = new Error('Imóvel não encontrado ou não pertence ao usuário');
      error.status = 404;
      throw error;
    }

    const updatedIdentificacao = data.identificacao?.trim() ?? property.identificacao;
    const updatedEndereco = data.endereco?.trim() ?? property.endereco;
    const updatedTipo = data.tipo?.trim() ?? property.tipo;

    db.prepare(`
      UPDATE imoveis SET identificacao = ?, endereco = ?, tipo = ?
      WHERE id = ? AND usuario_id = ?
    `).run(updatedIdentificacao, updatedEndereco, updatedTipo, propertyId, userId);

    return { ...property, identificacao: updatedIdentificacao, endereco: updatedEndereco, tipo: updatedTipo };
  }

  /**
   * TSK-04.2 & TSK-15.1: Delete property with cascade (consumptions auto-deleted via FK)
   */
  static delete(propertyId: number, userId: number): boolean {
    const property = this.findById(propertyId, userId);
    if (!property) {
      const error: any = new Error('Imóvel não encontrado ou não pertence ao usuário');
      error.status = 404;
      throw error;
    }

    const result = db.prepare('DELETE FROM imoveis WHERE id = ? AND usuario_id = ?')
      .run(propertyId, userId);
    return Number(result.changes) > 0;
  }
}
