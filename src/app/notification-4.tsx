import RouteScreen from '../components/RouteScreen';

export default function NotificationFour() {
  return (
    <RouteScreen title="¡Ponte con tu tarea!" description="Deja las distracciones y empieza ahora." actions={[
      { label: 'Volver al inicio', href: '/', dismissTo: true },
    ]} />
  );
}
