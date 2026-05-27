import jwt    from 'jsonwebtoken';
import crypto from 'crypto';
import { JwtPayload } from '../types/auth.types';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'change_me';

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' } as jwt.SignOptions);
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
}

export function refreshTokenExpiresAt(): string {
  const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}