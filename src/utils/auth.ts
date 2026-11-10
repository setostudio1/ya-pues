import type { Account, LoginInput, RegistrationInput, User } from '@/types/auth';
import { normalizeCompanionEmail } from '@/utils/invitations';

export const MIN_PASSWORD_LENGTH = 6;

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export function normalizeEmail(value: string): string | null {
  return normalizeCompanionEmail(value)?.toLowerCase() ?? null;
}

export function validateLogin({ email, password }: LoginInput): string | null {
  if (!normalizeEmail(email)) return 'Escribe un email válido.';
  if (password.length === 0) return 'Escribe tu contraseña.';
  return null;
}

export function validateRegistration(input: RegistrationInput): string | null {
  const name = input.name.trim();
  if (name.length < 2 || name.length > 60) return 'Escribe tu nombre (entre 2 y 60 caracteres).';
  if (!normalizeEmail(input.email)) return 'Escribe un email válido.';
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  if (input.password !== input.confirmPassword) return 'Las contraseñas no coinciden.';
  return null;
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? '';
}

export function toUser({ id, name, email }: Account): User {
  return { id, name, email };
}
