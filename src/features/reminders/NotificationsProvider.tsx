import { router, useNavigationContainerRef } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { loadCompletions, loadTasks } from '../../storage/data';
import * as device from './notificationDevice';
import type { NotificationSnapshot } from './notificationEngine';
import { defaultPreferences, parseNotificationPayload } from './notificationPlan';
import { notificationService } from './notificationService';
import { reminderVariants } from './reminderVariants';

type Command = () => Promise<NotificationSnapshot>;
type NotificationsContextValue = NotificationSnapshot & {
  busy: boolean;
  error: string;
  refresh: () => Promise<boolean>;
  run: (command: Command) => Promise<boolean>;
};
const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const navigation = useNavigationContainerRef();
  const [snapshot, setSnapshot] = useState<NotificationSnapshot>({ preferences: defaultPreferences(),
    permission: 'undetermined', scheduledCount: 0, eligibleCount: 0 });
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const running = useRef(0);
  const run = useCallback(async (command: Command) => {
    running.current += 1;
    setBusy(true);
    setError('');
    try { setSnapshot(await command()); return true; }
    catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No pudimos actualizar los avisos. Vuelve a intentar.');
      // Reflect a permission denial immediately so the Settings action becomes available.
      try {
        const permission = await device.permission(false);
        setSnapshot((previous) => ({ ...previous, permission }));
      } catch { /* Keep the last readable state; the original failure remains visible. */ }
      return false;
    } finally { running.current -= 1; setBusy(running.current > 0); }
  }, []);
  const refresh = useCallback(() => run(notificationService.sync), [run]);

  useEffect(() => {
    let active = true;
    // Initial read is asynchronous and never requests permission.
    void notificationService.sync().then((value) => { if (active) setSnapshot(value); })
      .catch(() => { if (active) setError('No pudimos cargar los avisos. Vuelve a intentar desde Recordatorios.'); })
      .finally(() => { if (active) setBusy(running.current > 0); });
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });
    return () => { active = false; subscription.remove(); };
  }, [refresh]);

  useEffect(() => {
    let active = true;
    let started = false;
    let stop = () => {};
    function observe() {
      if (started || !navigation.isReady()) return;
      started = true;
      stop = device.observeResponses((raw) => {
      const data = parseNotificationPayload(raw);
      if (!data) return;
      if (data.kind !== 'task') { router.dismissTo('/'); return; }
      void Promise.all([loadTasks(), loadCompletions()]).then(([tasks, completions]) => {
        if (!active) return;
        if (!tasks.some((task) => task.id === data.taskId) || completions.some((entry) => entry.taskId === data.taskId)) {
          router.dismissTo('/');
          return;
        }
        router.push({ pathname: reminderVariants[data.variant!].route, params: { taskId: data.taskId! } });
      }).catch(() => { if (active) router.dismissTo('/'); });
      });
    }
    const stopWaiting = navigation.addListener('state', observe);
    observe();
    return () => { active = false; stopWaiting(); stop(); };
  }, [navigation]);

  return <NotificationsContext.Provider value={{ ...snapshot, busy, error, refresh, run }}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error('NotificationsProvider no está disponible.');
  return context;
}
