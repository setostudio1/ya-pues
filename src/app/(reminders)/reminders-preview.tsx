import { useState } from 'react';

import DailyReminderForm from '@/components/reminders/DailyReminderForm';
import DailyReminderStatus from '@/components/reminders/DailyReminderStatus';
import ReminderPreviewList from '@/components/reminders/ReminderPreviewList';
import TaskRemindersCard from '@/components/reminders/TaskRemindersCard';
import RouteScreen from '@/components/ui/RouteScreen';

export default function RemindersScreen() {
  const [savedCount, setSavedCount] = useState(0);

  return (
    <RouteScreen title="Recordatorios" subtitle="Tus avisos" description="Prueba los avisos y elige tu recordatorio diario.">
      <TaskRemindersCard />
      <DailyReminderStatus key={savedCount} />
      <DailyReminderForm onSaved={() => setSavedCount((count) => count + 1)} />
      <ReminderPreviewList />
    </RouteScreen>
  );
}
