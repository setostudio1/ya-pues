import { Platform } from 'react-native';

import type { TaskCalendar } from '@/types/calendar';

type CalendarModule = typeof import('expo-calendar');
let modulePromise: Promise<CalendarModule> | undefined;

export const CALENDAR_UNAVAILABLE = 'El calendario nativo está disponible en Android e iOS con una compilación de desarrollo o instalada. Puedes seguir usando tus tareas.';
export const CALENDAR_PERMISSION_DENIED = 'Sin permiso de calendario, tus tareas siguen funcionando. Para vincularlas, permite el acceso al calendario en los ajustes del dispositivo y vuelve a intentar.';

export async function loadDeviceCalendar(): Promise<CalendarModule> {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') throw new Error(CALENDAR_UNAVAILABLE);
  try {
    // A missing native module (for example in Expo Go) must not break task flows.
    modulePromise ??= import('expo-calendar');
    return await modulePromise;
  } catch {
    modulePromise = undefined;
    throw new Error(CALENDAR_UNAVAILABLE);
  }
}

export async function selectDeviceCalendars(): Promise<TaskCalendar[]> {
  try {
    const calendar = await loadDeviceCalendar();
    let permission = await calendar.getCalendarPermissions();
    if (!permission.granted && permission.canAskAgain) {
      permission = await calendar.requestCalendarPermissions();
    }
    if (!permission.granted) throw new Error(CALENDAR_PERMISSION_DENIED);
    const calendars = await calendar.getCalendars(calendar.EntityTypes.EVENT);
    return calendars
      .filter((entry) => entry.allowsModifications && entry.isSynced !== false)
      .map((entry) => ({
        id: entry.id,
        title: [entry.title, entry.ownerAccount || entry.source?.name].filter(Boolean).join(' · '),
      }));
  } catch (cause) {
    if (cause instanceof Error && [CALENDAR_PERMISSION_DENIED, CALENDAR_UNAVAILABLE].includes(cause.message)) throw cause;
    throw new Error('No pudimos leer tus calendarios. Revisa que esta versión instalada incluya el calendario y que tengas una cuenta configurada. Puedes continuar sin vincular tu tarea.');
  }
}
