import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';

import { colors } from '@/constants/colors';
import { ROUTES } from '@/constants/routes';
import type { ReminderRoute, ReminderVariant, WebNotificationKind } from '@/types/reminders';

type ReminderText = {
  route: ReminderRoute;
  label: string;
  description: string;
  heading: string;
  lead: string;
  tail: string;
  minutesBefore: number;
};

export const SNOOZE_MINUTES = 10;

export const REMINDERS: Record<ReminderVariant, ReminderText> = {
  initial: {
    route: ROUTES.reminderInitial,
    label: 'Hora de empezar',
    description: 'Llega 24 horas antes del plazo, o 1 minuto después de crear una tarea con menos tiempo.',
    heading: 'HORAAAAA',
    lead: 'TIENES QUE HACER ',
    tail: '',
    minutesBefore: 24 * 60,
  },
  unstarted: {
    route: ROUTES.reminderUnstarted,
    label: '¿En serio?',
    description: `Llega 2 horas antes del plazo, o ${SNOOZE_MINUTES} minutos después de tocar Posponer.`,
    heading: '¿EN SERIO?',
    lead: '¿TODAVÍA NO HAS EMPEZADO ',
    tail: '?',
    minutesBefore: 120,
  },
  urgent: {
    route: ROUTES.reminderUrgent,
    label: 'Menos de 1 hora',
    description: 'Llega 45 minutos antes del plazo.',
    heading: 'MENOS DE\n1 HORA',
    lead: 'TU TAREA ',
    tail: ' ESTÁ POR VENCER.',
    minutesBefore: 45,
  },
  personal: {
    route: ROUTES.reminderPersonal,
    label: 'Recordatorio personal',
    description: 'Llega 15 minutos antes del plazo.',
    heading: '¡YA PUES!',
    lead: 'DEJA DE VER TIKTOK Y PONTE A HACER ',
    tail: '',
    minutesBefore: 15,
  },
};

export const REMINDER_VARIANTS = Object.keys(REMINDERS) as ReminderVariant[];

export const EXAMPLE_TASK_TITLE = 'Proyecto de taller';

type ReminderTone = { frequency: number; volume: number; beeps: number; length: number };

export const WEB_REMINDER_TONES: Record<WebNotificationKind, ReminderTone> = {
  daily: { frequency: 440, volume: 0.06, beeps: 1, length: 0.25 },
  initial: { frequency: 523, volume: 0.08, beeps: 1, length: 0.3 },
  unstarted: { frequency: 587, volume: 0.1, beeps: 2, length: 0.2 },
  urgent: { frequency: 784, volume: 0.14, beeps: 3, length: 0.15 },
  personal: { frequency: 880, volume: 0.18, beeps: 4, length: 0.12 },
};

export const WEB_REMINDER_VIBRATIONS: Record<WebNotificationKind, number[]> = {
  daily: [100],
  initial: [200],
  unstarted: [200, 100, 200],
  urgent: [300, 100, 300, 100, 300],
  personal: [400, 100, 400, 100, 400, 100, 400],
};

type IconName = ComponentProps<typeof Ionicons>['name'];

export const WEB_REMINDER_ACCENTS: Record<WebNotificationKind, { color: string; icon: IconName }> = {
  daily: { color: colors.primary, icon: 'sunny-outline' },
  initial: { color: colors.primary, icon: 'notifications' },
  unstarted: { color: colors.violet, icon: 'hourglass-outline' },
  urgent: { color: colors.coral, icon: 'alarm-outline' },
  personal: { color: colors.dangerInk, icon: 'flame-outline' },
};
