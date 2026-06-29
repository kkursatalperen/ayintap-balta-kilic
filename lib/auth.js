import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { getCollection } from './mongodb';

const SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';

export async function hashPassword(pw) {
  return bcrypt.hash(pw, 10);
}
export async function comparePassword(pw, hash) {
  return bcrypt.compare(pw, hash);
}
export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}
export function verifyToken(token) {
  try { return jwt.verify(token, SECRET); } catch { return null; }
}

export async function getCurrentUser(req) {
  let token;
  if (req && req.headers) {
    const auth = req.headers.get('authorization');
    if (auth && auth.startsWith('Bearer ')) token = auth.slice(7);
    if (!token) {
      const cookie = req.headers.get('cookie') || '';
      const m = cookie.match(/auth_token=([^;]+)/);
      if (m) token = m[1];
    }
  }
  if (!token) {
    try {
      const c = await cookies();
      token = c.get('auth_token')?.value;
    } catch {}
  }
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  const users = await getCollection('users');
  const user = await users.findOne({ id: payload.id });
  return user || null;
}

export function requireAdmin(user) {
  if (!user) return { ok: false, status: 401, msg: 'Giriş yapılmalı' };
  if (!['super_admin', 'admin', 'editor'].includes(user.role)) return { ok: false, status: 403, msg: 'Yetkisiz erişim' };
  return { ok: true };
}
