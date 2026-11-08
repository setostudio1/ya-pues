import RouteScreen from '../components/RouteScreen';

export default function Welcome() {
  return (
    <RouteScreen title="Bienvenido" description="YA PUES" actions={[
      { label: 'Continuar', href: '/', dismissTo: true },
    ]} />
  );
}
