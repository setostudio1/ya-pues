import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Task, TaskCompletion, TaskDraft } from '../types/tasks';
import { normalizeTaskCompanions } from '../utils/companions';
import { buildTask, createId, isDateKey, isTime, today } from '../utils/tasks';

export type { Task, TaskCompletion, TaskDraft } from '../types/tasks';
export { today } from '../utils/tasks';

const TASKS_KEY = 'ya-pues:tasks:v1';
const COMPLETIONS_KEY = 'ya-pues:completions:v1';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isTask(value: unknown): value is Task {
  return isRecord(value) && typeof value.id === 'string' && value.id.length > 0
    && typeof value.title === 'string' && value.title.trim().length >= 3
    && isDateKey(value.dueDate) && isTime(value.dueTime)
    && ['low', 'medium', 'high'].includes(String(value.intensity))
    && ['photo', 'video', 'timelapse'].includes(String(value.proofType))
    && typeof value.signedBy === 'string' && value.signedBy.trim().length >= 2
    && ['signature', 'image'].includes(String(value.signatureMode))
    && typeof value.signatureImageUri === 'string'
    && typeof value.createdAt === 'string' && !Number.isNaN(Date.parse(value.createdAt))
    && (value.companions === undefined || normalizeTaskCompanions(value.companions) !== null);
}

function isCompletion(value: unknown): value is TaskCompletion {
  return isRecord(value) && typeof value.id === 'string' && value.id.length > 0
    && typeof value.taskId === 'string' && value.taskId.length > 0 && isDateKey(value.date)
    && typeof value.createdAt === 'string' && !Number.isNaN(Date.parse(value.createdAt));
}

function validateList<T>(value: unknown, validate: (entry: unknown) => entry is T): T[] {
  if (!Array.isArray(value) || !value.every(validate)) {
    throw new Error('Los datos guardados no tienen el formato esperado. No se han modificado.');
  }
  return value;
}

async function readList<T>(key: string, validate: (entry: unknown) => entry is T): Promise<T[]> {
  const saved = await AsyncStorage.getItem(key);
  if (saved === null) return [];
  // Invalid JSON rejects rather than silently replacing existing data with [].
  return validateList(JSON.parse(saved), validate);
}

export async function loadTasks(): Promise<Task[]> {
  const tasks = await readList(TASKS_KEY, isTask);
  return tasks.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  validateList(tasks, isTask);
  await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export async function loadCompletions(): Promise<TaskCompletion[]> {
  return readList(COMPLETIONS_KEY, isCompletion);
}

export async function saveCompletions(completions: TaskCompletion[]): Promise<void> {
  validateList(completions, isCompletion);
  await AsyncStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions));
}

// Serialize read-modify-write operations so quick taps do not overwrite records.
let pendingWrite: Promise<unknown> = Promise.resolve();
function serializeWrite<T>(operation: () => Promise<T>): Promise<T> {
  const result = pendingWrite.then(operation);
  pendingWrite = result.catch(() => undefined);
  return result;
}

export function addTask(draft: TaskDraft): Promise<Task> {
  return serializeWrite(async () => {
    const tasks = await loadTasks();
    const existing = tasks.find((task) => task.id === draft.id);
    if (existing) return existing;
    const task = buildTask(draft);
    await saveTasks([task, ...tasks]);
    return task;
  });
}

export function recordCompletion(taskId: string): Promise<TaskCompletion> {
  return serializeWrite(async () => {
    const [tasks, completions] = await Promise.all([loadTasks(), loadCompletions()]);
    if (!tasks.some((task) => task.id === taskId)) throw new Error('No se encontró esta tarea.');
    const existing = completions.find((entry) => entry.taskId === taskId);
    if (existing) return existing;
    const now = new Date();
    const completion = { id: createId(), taskId, date: today(now), createdAt: now.toISOString() };
    await saveCompletions([completion, ...completions]);
    return completion;
  });
}
