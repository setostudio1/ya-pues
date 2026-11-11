import type { ROUTES } from '@/constants/routes';

export type ReminderVariant = 'initial' | 'unstarted' | 'urgent' | 'personal';

export type ReminderRoute = (typeof ROUTES)['reminderInitial' | 'reminderUnstarted' | 'reminderUrgent' | 'reminderPersonal'];

export type WebNotificationKind = ReminderVariant | 'daily';

export type ReminderResult = 'scheduled' | 'denied' | 'unsupported' | 'disabled' | 'tooLate';
