import RouteScreen from '../components/RouteScreen';

export default function NotificationTwo() {
  return (
    <RouteScreen title="¿En serio?" description="¿Todavía no has empezado tu tarea?" actions={[
      { label: 'Volver al inicio', href: '/', dismissTo: true },
    ]} />
  );
}
