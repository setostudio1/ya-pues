import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

import type { Account, LoginInput, RegistrationInput, User } from '@/types/auth';
import { AuthError, normalizeEmail, toUser, validateLogin, validateRegistration } from '@/utils/auth';

const ACCOUNTS_KEY = 'ya-pues:accounts:v1';
const SESSION_KEY = 'ya-pues:session:v1';

function hashPassword(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}

async function loadAccounts(): Promise<Account[]> {
  const saved = await AsyncStorage.getItem(ACCOUNTS_KEY);
  return saved === null ? [] : JSON.parse(saved);
}

export async function registerAccount(input: RegistrationInput): Promise<User> {
  const problem = validateRegistration(input);
  if (problem) throw new AuthError(problem);

  const email = normalizeEmail(input.email) as string;
  const accounts = await loadAccounts();
  if (accounts.some((account) => account.email === email)) {
    throw new AuthError('Ya existe una cuenta con ese email. Inicia sesión.');
  }

  const salt = Crypto.randomUUID();
  const account: Account = {
    id: Crypto.randomUUID(),
    name: input.name.trim(),
    email,
    salt,
    passwordHash: await hashPassword(input.password, salt),
    createdAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, account]));
  return toUser(account);
}

export async function signInWithPassword(input: LoginInput): Promise<User> {
  const problem = validateLogin(input);
  if (problem) throw new AuthError(problem);

  const email = normalizeEmail(input.email);
  const account = (await loadAccounts()).find((entry) => entry.email === email);
  if (!account || account.passwordHash !== await hashPassword(input.password, account.salt)) {
    throw new AuthError('El email o la contraseña no son correctos.');
  }
  return toUser(account);
}

export async function loadSession(): Promise<User | null> {
  const saved = await AsyncStorage.getItem(SESSION_KEY);
  return saved === null ? null : JSON.parse(saved);
}

export function saveSession(user: User): Promise<void> {
  return AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession(): Promise<void> {
  return AsyncStorage.removeItem(SESSION_KEY);
}
