import { User } from './api';

export function normalizeRole(role: unknown): string {
  return String(role ?? '').trim().toLowerCase();
}

export function normalizeUser(raw: unknown): User | null {
  if (!raw || typeof raw !== 'object') return null;

  const data = Array.isArray(raw) ? raw[0] : raw;
  if (!data || typeof data !== 'object') return null;

  const u = data as Record<string, unknown>;
  if (!u.id || !u.username || !u.name) return null;

  return {
    id: String(u.id),
    username: String(u.username),
    name: String(u.name),
    role: normalizeRole(u.role) || 'admin',
  };
}

export function isIbadahRole(role: string): boolean {
  return normalizeRole(role) === 'ibadah';
}

export function isAdminRole(role: string): boolean {
  return normalizeRole(role) === 'admin';
}
