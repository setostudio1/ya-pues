import { router } from 'expo-router';
import { useState } from 'react';

import { ROUTES } from '@/constants/routes';
import { useSession } from '@/context/SessionContext';
import type { User } from '@/types/auth';
import { AuthError } from '@/utils/auth';

export function useAuthSubmit<Input>(authenticate: (input: Input) => Promise<User>) {
  const { startSession } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function submit(input: Input) {
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const user = await authenticate(input);
      router.replace(ROUTES.welcome);
      await startSession(user);
    } catch (cause) {
      setError(cause instanceof AuthError ? cause.message : 'Algo salió mal. Revisa tu conexión e intenta otra vez.');
      setSubmitting(false);
    }
  }

  return { submitting, error, submit, clearError: () => setError('') };
}
