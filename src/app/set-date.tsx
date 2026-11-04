import RouteScreen from '../components/RouteScreen';

export default function SetDate() {
  return (
    <RouteScreen title="¿Cuándo tiene que estar hecha esta tarea?" subtitle="Paso 1 · Fecha límite"
      actions={[{ label: 'Establecer', href: '/set-time' }]} />
  );
}
