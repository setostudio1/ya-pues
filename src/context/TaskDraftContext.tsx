import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

import type { TaskDraft } from '@/types/tasks';
import { createTaskDraft } from '@/utils/tasks';

type DraftContext = {
  draft: TaskDraft;
  updateDraft: (updates: Partial<TaskDraft>) => void;
  resetDraft: () => void;
};

const TaskDraftContext = createContext<DraftContext | null>(null);

export function TaskDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState(createTaskDraft);
  const updateDraft = useCallback((updates: Partial<TaskDraft>) => {
    setDraft((previous) => ({ ...previous, ...updates }));
  }, []);
  const resetDraft = useCallback(() => setDraft(createTaskDraft()), []);

  return <TaskDraftContext.Provider value={{ draft, updateDraft, resetDraft }}>{children}</TaskDraftContext.Provider>;
}

export function useTaskDraft() {
  const context = useContext(TaskDraftContext);
  if (!context) throw new Error('TaskDraftProvider is required.');
  return context;
}
