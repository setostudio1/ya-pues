import RouteScreen from '../components/RouteScreen';

export default function SetTask() {
  return (
    <RouteScreen title="¿Qué tienes que hacer?" subtitle="Paso 3 · La tarea"
      description="Descríbelo como una acción concreta."
      actions={[{ label: 'Continuar', href: '/set-proof' }]} />
  );
}
