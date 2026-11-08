import RouteScreen from '../components/RouteScreen';

export default function NotificationOne() {
  return (
    <RouteScreen title="¡Hora de empezar!" description="Tienes una tarea pendiente." actions={[
      { label: 'Posponer', href: '/notification-2' },
      { label: 'Continuar', href: '/notification-4' },
    ]} />
  );
}
