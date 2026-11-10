import * as Notifications from 'expo-notifications';
import { router, useNavigationContainerRef } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { isReminderRoute } from '@/notifications/reminders';

function openReminder(response: Notifications.NotificationResponse) {
  const { route, taskId } = response.notification.request.content.data ?? {};
  if (!isReminderRoute(route)) return;

  const params = typeof taskId === 'string' ? { taskId } : { preview: '1' };
  router.push({ pathname: route, params });
  Notifications.clearLastNotificationResponse();
}

export function useReminderNavigation(enabled: boolean) {
  const navigation = useNavigationContainerRef();

  useEffect(() => {
    if (!enabled || Platform.OS === 'web') return;

    let subscription: Notifications.EventSubscription | null = null;

    function start() {
      if (subscription || !navigation.isReady()) return;
      subscription = Notifications.addNotificationResponseReceivedListener(openReminder);
      const lastResponse = Notifications.getLastNotificationResponse();
      if (lastResponse) openReminder(lastResponse);
    }

    const stopWaiting = navigation.addListener('state', start);
    start();

    return () => {
      stopWaiting();
      subscription?.remove();
    };
  }, [enabled, navigation]);
}
