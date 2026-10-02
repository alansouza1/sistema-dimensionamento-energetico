import { db } from '../database/db.js';
import { User } from '../types/index.js';
import { hashPassword, comparePassword, generateToken } from '../utils/security.js';

export class AuthService {
  /**
   * TSK-01.1 & TSK-01.2: Register user with unique email check and SHA-256 hash
   */
  static register(nome: string, email: string, senha: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const existing = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(normalizedEmail);
    if (existing) {
      const error: any = new Error('E-mail já cadastrado no sistema');
      error.status = 409;
      throw error;
    }

    const hashedPassword = hashPassword(senha);
    const stmt = db.prepare('INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)');
    const info = stmt.run(nome.trim(), normalizedEmail, hashedPassword);

    const newUser: User = {
      id: Number(info.lastInsertRowid),
      nome: nome.trim(),
      email: normalizedEmail,
    };

    const token = generateToken({
      id: newUser.id,
      nome: newUser.nome,
      email: newUser.email,
    });

    return { token, usuario: newUser };
  }

  /**
   * TSK-02.1 & TSK-02.2: Login with hash comparison and JWT generation
   */
  static login(email: string, senha: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const row = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(normalizedEmail) as
      | Record<string, unknown>
      | undefined;

    if (!row || !comparePassword(senha, row.senha as string)) {
      const error: any = new Error('Credenciais inválidas');
      error.status = 401;
      throw error;
    }

    const user: User = {
      id: row.id as number,
      nome: row.nome as string,
      email: row.email as string,
      criado_em: row.criado_em as string,
    };

    const token = generateToken({
      id: user.id,
      nome: user.nome,
      email: user.email,
    });

    return { token, usuario: user };
  }

  static findById(id: number): User | null {
    const row = db.prepare('SELECT id, nome, email, criado_em FROM usuarios WHERE id = ?').get(id) as
      | Record<string, unknown>
      | undefined;

    if (!row) return null;

    return {
      id: row.id as number,
      nome: row.nome as string,
      email: row.email as string,
      criado_em: row.criado_em as string,
    };
  }
}
