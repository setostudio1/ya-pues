import RouteScreen from '../components/RouteScreen';

export default function SetProof() {
  return (
    <RouteScreen title="¿Cómo vas a demostrar que lo hiciste?" subtitle="Paso 4 · La evidencia"
      actions={[{ label: 'Continuar', href: '/sign' }]} />
  );
}
