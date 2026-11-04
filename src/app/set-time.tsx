import RouteScreen from '../components/RouteScreen';

export default function SetTime() {
  return (
    <RouteScreen title="¿A qué hora tiene que estar hecha esta tarea?" subtitle="Paso 2 · Hora límite"
      actions={[{ label: 'Establecer', href: '/set-task' }]} />
  );
}
