import RouteScreen from '../components/RouteScreen';

export default function Login() {
  return (
    <RouteScreen title="Login" actions={[
      { label: 'Iniciar sesión', href: '/welcome' },
      { label: 'Registrarse', href: '/start-page' },
    ]} />
  );
}
