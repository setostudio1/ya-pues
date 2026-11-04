import RouteScreen from '../components/RouteScreen';

export default function NotificationThree() {
  return (
    <RouteScreen title="Menos de 1 hora" description="Es ahora o nunca. Tu tarea está por vencer." actions={[
      { label: 'Volver al inicio', href: '/', dismissTo: true },
    ]} />
  );
}
