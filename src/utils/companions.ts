import type { TaskCompanion } from '../types/tasks';
import { normalizeCompanionEmail } from './invitations';

export function normalizeTaskCompanions(value: unknown): TaskCompanion[] | null {
  if (!Array.isArray(value)) return null;
  const unique = new Map<string, TaskCompanion>();
  for (const entry of value) {
    if (typeof entry !== 'object' || entry === null || typeof entry.email !== 'string') return null;
    const email = normalizeCompanionEmail(entry.email);
    if (!email) return null;
    if (entry.avatarUri !== undefined && (typeof entry.avatarUri !== 'string'
      || !/^https?:\/\/\S+$/i.test(entry.avatarUri.trim()))) return null;
    const companion: TaskCompanion = {
      email,
      ...(entry.avatarUri === undefined ? {} : { avatarUri: entry.avatarUri.trim() }),
    };
    if (!unique.has(email.toLowerCase())) unique.set(email.toLowerCase(), companion);
  }
  return [...unique.values()];
}

export function companionInitials(email: string): string {
  const parts = email.split('@')[0].split(/[^a-z0-9]+/i).filter(Boolean);
  return parts.slice(0, 2).map((part) => part.charAt(0)).join('').toUpperCase() || '?';
}
