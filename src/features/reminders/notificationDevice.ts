import * as Notifications from 'expo-notifications';
import { AndroidAudioContentType, AndroidAudioUsage, AndroidImportance, IosAuthorizationStatus } from 'expo-notifications';
import { Platform } from 'react-native';

import { NOTIFICATION_OWNER, notificationSignature, parseNotificationPayload,
  type Permission, type PlannedNotification } from './notificationPlan';

// Channel audio settings are immutable after creation. Keep a new ID so devices
// that already created the old channel receive the corrected audio attributes.
const CHANNEL = 'task-reminders-v2';
const CHANNEL_VERSION = 2;

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true,
    shouldPlaySound: true, shouldSetBadge: false }),
});

function permissionStatus(value: Notifications.NotificationPermissionsStatus): Permission {
  return value.granted || value.ios?.status === IosAuthorizationStatus.PROVISIONAL
    || value.ios?.status === IosAuthorizationStatus.EPHEMERAL ? 'granted'
    : value.status === 'undetermined' ? 'undetermined' : 'denied';
}

export async function permission(request: boolean): Promise<Permission> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Recordatorios de YA PUES', importance: AndroidImportance.HIGH,
      sound: 'default', vibrationPattern: [0, 250, 250, 250],
      // Android's native channel path can otherwise set null audio attributes.
      audioAttributes: {
        usage: AndroidAudioUsage.NOTIFICATION,
        contentType: AndroidAudioContentType.SONIFICATION,
        flags: { enforceAudibility: false, requestHardwareAudioVideoSynchronization: false },
      },
    });
  }
  let current = await Notifications.getPermissionsAsync();
  if (request && permissionStatus(current) !== 'granted' && current.canAskAgain) {
    current = await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: true, allowBadge: false } });
  }
  return permissionStatus(current);
}

export async function pending() {
  return (await Notifications.getAllScheduledNotificationsAsync()).map((entry) => ({
    id: entry.identifier,
    // Invalidate old requests once so reconciliation moves them to the new channel.
    signature: entry.content.data?.channelVersion === CHANNEL_VERSION ? entry.content.data.signature : undefined,
  }));
}

export async function schedule(plan: PlannedNotification): Promise<void> {
  await Notifications.scheduleNotificationAsync({ identifier: plan.id,
    content: { title: plan.title, body: plan.body, sound: 'default',
      data: { ...plan.payload, signature: notificationSignature(plan), channelVersion: CHANNEL_VERSION } },
    trigger: plan.trigger.type === 'daily'
      ? { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour: plan.trigger.hour, minute: plan.trigger.minute, channelId: CHANNEL }
      : { type: Notifications.SchedulableTriggerInputTypes.DATE, date: plan.trigger.at, channelId: CHANNEL },
  });
}

export const cancel = Notifications.cancelScheduledNotificationAsync;

export async function dismissInactive(activeIds: Set<string>, tasksEnabled: boolean): Promise<void> {
  for (const notification of await Notifications.getPresentedNotificationsAsync()) {
    const data = parseNotificationPayload(notification.request.content.data);
    if (data?.kind === 'task' && (!tasksEnabled || !activeIds.has(data.taskId!))) {
      await Notifications.dismissNotificationAsync(notification.request.identifier);
    }
  }
}

export function observeResponses(onOpen: (data: unknown) => void): () => void {
  const handled = new Set<string>();
  function handle(response: Notifications.NotificationResponse) {
    const request = response.notification.request;
    const key = `${request.identifier}:${response.notification.date}`;
    if (request.content.data?.owner !== NOTIFICATION_OWNER || handled.has(key)) return;
    handled.add(key);
    onOpen(request.content.data);
    Notifications.clearLastNotificationResponse();
  }
  const subscription = Notifications.addNotificationResponseReceivedListener(handle);
  const last = Notifications.getLastNotificationResponse();
  if (last) handle(last);
  return () => subscription.remove();
}
