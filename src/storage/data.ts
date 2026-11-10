import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Task, TaskCompletion, TaskDraft, TaskUpdate } from '@/types/tasks';
import { buildTask, createId, TaskValidationError, today } from '@/utils/tasks';

const TASKS_KEY = 'ya-pues:tasks:v1';
const COMPLETIONS_KEY = 'ya-pues:completions:v1';

let pendingWrite: Promise<unknown> = Promise.resolve();

function enqueueWrite<T>(write: () => Promise<T>): Promise<T> {
  const result = pendingWrite.then(write);
  pendingWrite = result.catch(() => undefined);
  return result;
}

async function readList<T>(key: string): Promise<T[]> {
  const saved = await AsyncStorage.getItem(key);
  return saved === null ? [] : JSON.parse(saved);
}

export async function loadTasks(userId?: string): Promise<Task[]> {
  const tasks = await readList<Task>(TASKS_KEY);
  const visible = userId === undefined
    ? tasks
    : tasks.filter((task) => task.ownerId === undefined || task.ownerId === userId);
  return visible.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function saveTasks(tasks: Task[]): Promise<void> {
  await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function loadCompletions(): Promise<TaskCompletion[]> {
  return readList<TaskCompletion>(COMPLETIONS_KEY);
}

async function saveCompletions(completions: TaskCompletion[]): Promise<void> {
  await AsyncStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions));
}

export function addTask(draft: TaskDraft, ownerId?: string): Promise<Task> {
  return enqueueWrite(async () => {
    const tasks = await loadTasks();
    const existing = tasks.find((task) => task.id === draft.id);
    if (existing) {
      return existing;
    }

    const task: Task = { ...buildTask(draft), ownerId };
    await saveTasks([task, ...tasks]);
    return task;
  });
}

export function recordCompletion(taskId: string): Promise<void> {
  return enqueueWrite(async () => {
    const [tasks, completions] = await Promise.all([loadTasks(), loadCompletions()]);
    if (!tasks.some((task) => task.id === taskId)) {
      throw new Error('No se encontró esta tarea.');
    }
    if (completions.some((entry) => entry.taskId === taskId)) {
      return;
    }

    const now = new Date();
    const completion = { id: createId(), taskId, date: today(now), createdAt: now.toISOString() };
    await saveCompletions([completion, ...completions]);
  });
}

export function updateTask(taskId: string, changes: TaskUpdate): Promise<Task> {
  return enqueueWrite(async () => {
    const [tasks, completions] = await Promise.all([loadTasks(), loadCompletions()]);
    const existing = tasks.find((task) => task.id === taskId);
    if (!existing) {
      throw new TaskValidationError('No se encontró esta tarea.');
    }
    if (completions.some((entry) => entry.taskId === taskId)) {
      throw new TaskValidationError('Una tarea completada no se puede editar.');
    }

    const updated: Task = { ...buildTask({ ...existing, ...changes }), createdAt: existing.createdAt };
    await saveTasks(tasks.map((task) => (task.id === taskId ? updated : task)));
    return updated;
  });
}

export function deleteTask(taskId: string): Promise<void> {
  return enqueueWrite(async () => {
    const [tasks, completions] = await Promise.all([loadTasks(), loadCompletions()]);
    const isCompleted = completions.some((entry) => entry.taskId === taskId);
    const remaining = isCompleted
      ? tasks.map((task) => (task.id === taskId ? { ...task, archivedAt: new Date().toISOString() } : task))
      : tasks.filter((task) => task.id !== taskId);
    await saveTasks(remaining);
  });
}
