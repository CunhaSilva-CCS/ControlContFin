import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const ANDROID_CHANNEL_ID = 'recurring-reminders';

export async function ensureNotificationSetup() {
  await Notifications.requestPermissionsAsync();
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Lembretes de contas recorrentes',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

function subtractDays(isoDate: string, days: number): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day - days, 9, 0, 0));
}

export type RecurringReminderInput = {
  title: string;
  body: string;
  nextRunDate: string;
  notifyBeforeDays: number;
};

/**
 * Schedules a local reminder `notifyBeforeDays` before nextRunDate. Returns
 * null (schedules nothing) if the trigger date has already passed.
 */
export async function scheduleRecurringReminder(
  input: RecurringReminderInput,
): Promise<string | null> {
  const triggerDate = subtractDays(input.nextRunDate, input.notifyBeforeDays);
  if (triggerDate.getTime() <= Date.now()) {
    return null;
  }

  return Notifications.scheduleNotificationAsync({
    content: { title: input.title, body: input.body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
      channelId: Platform.OS === 'android' ? ANDROID_CHANNEL_ID : undefined,
    },
  });
}

export async function cancelRecurringReminder(notificationId: string | null | undefined) {
  if (!notificationId) {
    return;
  }
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
