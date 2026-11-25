import { useEffect } from 'react';
import { AppState } from 'react-native';

import { publishCalendarSyncStatus } from '@/calendar/syncStatus';
import { syncTaskCalendars } from '@/storage/data';

export function useTaskCalendarSync(ownerId: string | undefined) {
  useEffect(() => {
    publishCalendarSyncStatus('');
    if (!ownerId) return;
    void syncTaskCalendars(ownerId);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void syncTaskCalendars(ownerId);
    });
    return () => subscription.remove();
  }, [ownerId]);
}
