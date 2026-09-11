import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fiap_sers_fallback_secret_2026';

/**
 * TSK-01.2: Hash password using SHA-256
 */
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Compare a plain-text password against a stored SHA-256 hash
 */
export function comparePassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

/**
 * TSK-02.2: Generate a JWT token for session management
 */
export function generateToken(payload: { id: number; email: string; nome: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): jwt.JwtPayload {
  return jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
}
