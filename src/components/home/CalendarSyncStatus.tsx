import { useState, useSyncExternalStore } from 'react';

import { getCalendarSyncStatus, getServerCalendarSyncStatus, subscribeCalendarSyncStatus } from '@/calendar/syncStatus';
import { ErrorState } from '@/components/ui/DataState';
import { useSession } from '@/context/SessionContext';
import { syncTaskCalendars } from '@/storage/data';

export default function CalendarSyncStatus() {
  const { user } = useSession();
  const [busy, setBusy] = useState(false);
  const message = useSyncExternalStore(subscribeCalendarSyncStatus, getCalendarSyncStatus, getServerCalendarSyncStatus);
  if (!message) return null;
  return <ErrorState message={message} onRetry={busy ? undefined : () => {
    setBusy(true);
    void syncTaskCalendars(user?.id).finally(() => setBusy(false));
  }} />;
}
