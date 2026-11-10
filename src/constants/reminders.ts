import type { ReminderRoute, ReminderVariant } from '@/types/reminders';

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
    route: '/notification-1',
    label: 'Hora de empezar',
    description: 'Llega 24 horas antes del plazo, o 1 minuto después de crear una tarea con menos tiempo.',
    heading: 'HORAAAAA',
    lead: 'TIENES QUE HACER ',
    tail: '',
    minutesBefore: 24 * 60,
  },
  unstarted: {
    route: '/notification-2',
    label: '¿En serio?',
    description: `Llega 2 horas antes del plazo, o ${SNOOZE_MINUTES} minutos después de tocar Posponer.`,
    heading: '¿EN SERIO?',
    lead: '¿TODAVÍA NO HAS EMPEZADO A HACER ',
    tail: '?',
    minutesBefore: 120,
  },
  urgent: {
    route: '/notification-3',
    label: 'Menos de 1 hora',
    description: 'Llega 45 minutos antes del plazo.',
    heading: 'MENOS DE\n1 HORA',
    lead: 'TU TAREA ',
    tail: ' ESTÁ POR VENCER.',
    minutesBefore: 45,
  },
  personal: {
    route: '/notification-4',
    label: 'Recordatorio personal',
    description: 'Llega 15 minutos antes del plazo.',
    heading: '¡YA PUES!',
    lead: 'DEJA DE VER TIKTOK Y PONTE A ',
    tail: '',
    minutesBefore: 15,
  },
};

export const REMINDER_VARIANTS = Object.keys(REMINDERS) as ReminderVariant[];

export const EXAMPLE_TASK_TITLE = 'la entrega de taller';
