import RouteScreen from '../../components/RouteScreen';

export default function Home() {
  return (
    <RouteScreen
      title="Inicio"
      description="Buen día. ¿Qué tienes que hacer hoy?"
      includeTopInset
      actions={[
        { label: 'Crear tarea', href: '/set-date' },
        { label: 'Recordatorio de tarea', href: '/notification-1' },
        { label: 'Tarea por vencer', href: '/notification-3' },
        { label: 'Acceder a mi cuenta', href: '/start-page' },
      ]}
    />
  );
}
