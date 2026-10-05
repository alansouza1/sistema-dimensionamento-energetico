import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const dbFile = process.env.DATABASE_FILE || 'database.sqlite';
const dbPath = path.isAbsolute(dbFile)
  ? dbFile
  : path.resolve(process.cwd(), dbFile);

export const db = new DatabaseSync(dbPath);

// Enable referential integrity, WAL journaling and busy timeout
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA busy_timeout = 5000;');

export function initializeDatabase(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS imoveis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      identificacao TEXT NOT NULL,
      endereco TEXT NOT NULL,
      tipo TEXT NOT NULL,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS consumos_mensais (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      imovel_id INTEGER NOT NULL,
      ano INTEGER NOT NULL,
      mes INTEGER NOT NULL,
      consumo_kwh REAL NOT NULL,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(imovel_id, ano, mes),
      FOREIGN KEY (imovel_id) REFERENCES imoveis(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS propostas_solar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
      hsp REAL NOT NULL,
      tarifa_kwh REAL NOT NULL,
      potencia_instalada_kwp REAL NOT NULL,
      geracao_mensal_kwh REAL NOT NULL,
      investimento_grid_tie_brl REAL NOT NULL,
      investimento_hibrido_brl REAL NOT NULL,
      payback_grid_tie_anos REAL NOT NULL,
      payback_hibrido_anos REAL NOT NULL,
      dados_completos TEXT NOT NULL,
      FOREIGN KEY (property_id) REFERENCES imoveis(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );
  `);
}

// Auto-initialize schema on import
initializeDatabase();
