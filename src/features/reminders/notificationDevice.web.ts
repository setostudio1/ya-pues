import type { Permission, PlannedNotification } from './notificationPlan';

export async function permission(_request: boolean): Promise<Permission> { return 'unsupported'; }
export async function pending(): Promise<{ id: string; signature?: unknown }[]> { return []; }
export async function schedule(_plan: PlannedNotification): Promise<void> {
  throw new Error('Los avisos del sistema están disponibles en Android e iOS.');
}
export async function cancel(_id: string): Promise<void> {}
export async function dismissInactive(_activeIds: Set<string>, _tasksEnabled: boolean): Promise<void> {}
export function observeResponses(_onOpen: (data: unknown) => void): () => void { return () => {}; }
