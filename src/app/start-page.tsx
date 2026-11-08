import RouteScreen from '../components/RouteScreen';

export default function StartPage() {
  return (
    <RouteScreen title="YA PUES" subtitle="Acceso" actions={[
      { label: 'Iniciar sesión', href: '/login' },
      { label: 'Registrarse', href: '/login' },
      { label: 'Google', href: '/login' },
      { label: 'Volver al inicio', href: '/', dismissTo: true },
    ]} />
  );
}
