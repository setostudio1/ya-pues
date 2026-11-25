let message = '';
const listeners = new Set<() => void>();

export function publishCalendarSyncStatus(next: string) {
  if (next === message) return;
  message = next;
  listeners.forEach((listener) => listener());
}

export const getCalendarSyncStatus = () => message;
export const getServerCalendarSyncStatus = () => '';
export function subscribeCalendarSyncStatus(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
