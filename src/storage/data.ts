import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Task, TaskCompletion, TaskDraft } from '@/types/tasks';
import { buildTask, createId, today } from '@/utils/tasks';

const TASKS_KEY = 'ya-pues:tasks:v1';
const COMPLETIONS_KEY = 'ya-pues:completions:v1';

async function readList<T>(key: string): Promise<T[]> {
  const saved = await AsyncStorage.getItem(key);
  return saved === null ? [] : JSON.parse(saved);
}

export async function loadTasks(): Promise<Task[]> {
  const tasks = await readList<Task>(TASKS_KEY);
  return tasks.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export function loadCompletions(): Promise<TaskCompletion[]> {
  return readList<TaskCompletion>(COMPLETIONS_KEY);
}

export async function saveCompletions(completions: TaskCompletion[]): Promise<void> {
  await AsyncStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions));
}

export async function addTask(draft: TaskDraft): Promise<Task> {
  const task = buildTask(draft);
  const tasks = await loadTasks();
  await saveTasks([task, ...tasks]);
  return task;
}

export async function recordCompletion(taskId: string): Promise<void> {
  const completions = await loadCompletions();
  if (completions.some((entry) => entry.taskId === taskId)) return;

  const now = new Date();
  const completion = { id: createId(), taskId, date: today(now), createdAt: now.toISOString() };
  await saveCompletions([completion, ...completions]);
}
