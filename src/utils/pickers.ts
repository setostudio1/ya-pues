import { isDateKey, today } from '@/utils/tasks';

export function getPickerDate(value: string) {
  const normalized = isDateKey(value) ? value : today();
  const [year, month, day] = normalized.split('-').map(Number);
  return { year, month: month - 1, day };
}

export function updatePickerDate(value: string, change: Partial<{ year: number; month: number; day: number }>) {
  const previous = getPickerDate(value);
  const year = Math.max(1000, Math.min(9999, change.year ?? previous.year));
  const month = Math.max(0, Math.min(11, change.month ?? previous.month));
  const lastDay = new Date(year, month + 1, 0).getDate();
  const day = Math.max(1, Math.min(lastDay, change.day ?? previous.day));
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
