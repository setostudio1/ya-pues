import ReminderControls from '@/components/reminders/ReminderControls';
import ReminderPreviewList from '@/components/reminders/ReminderPreviewList';
import RouteScreen from '@/components/ui/RouteScreen';

export default function RemindersScreen() {
  return (
    <RouteScreen title="Recordatorios" subtitle="Tus avisos" description="Prueba los avisos y elige tu recordatorio diario.">
      <ReminderControls />
      <ReminderPreviewList />
    </RouteScreen>
  );
}
