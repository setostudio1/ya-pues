import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { useSession } from '@/context/SessionContext';
import { loadCompletions, loadTasks } from '@/storage/data';
import type { Task, TaskCompletion } from '@/types/tasks';

export function useStoredTasks() {
  const { user } = useSession();
  const userId = user?.id;
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const generation = useRef(0);

  const reload = useCallback(async () => {
    const current = ++generation.current;
    setLoading(true);
    setError('');
    try {
      const [savedTasks, savedCompletions] = await Promise.all([loadTasks(userId), loadCompletions()]);
      if (current !== generation.current) return;
      setAllTasks(savedTasks);
      setCompletions(savedCompletions);
    } catch {
      if (current === generation.current) setError('No pudimos leer tus datos. Intenta otra vez; no se han borrado.');
    } finally {
      if (current === generation.current) setLoading(false);
    }
  }, [userId]);

  useFocusEffect(useCallback(() => {
    void reload();
    return () => { generation.current += 1; };
  }, [reload]));

  const tasks = allTasks.filter((task) => task.archivedAt === undefined);

  return { tasks, allTasks, completions, loading, error, reload };
}
