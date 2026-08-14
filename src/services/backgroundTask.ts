import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';

import { todayISODate } from '@/utils/date';

import { runRecurringGeneration } from './runRecurringGeneration';

export const RECURRING_GENERATION_TASK = 'recurring-generation-task';

TaskManager.defineTask(RECURRING_GENERATION_TASK, async () => {
  try {
    await runRecurringGeneration(todayISODate());
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    console.error('Falha ao gerar transações recorrentes em segundo plano', error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

/**
 * Best-effort background generation: the OS decides when (or whether) this
 * actually runs, so the foreground trigger on app launch/resume remains the
 * primary guarantee that recurring transactions get generated on time.
 */
export async function registerRecurringBackgroundTask() {
  await BackgroundTask.registerTaskAsync(RECURRING_GENERATION_TASK, {
    minimumInterval: 60 * 12,
  });
}
