import { Link, router, useLocalSearchParams } from 'expo-router';

import Button from '../components/Button';
import RouteScreen from '../components/RouteScreen';

export default function Sign() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();

  return (
    <RouteScreen title="Firma tu compromiso" subtitle="Último paso · El compromiso"
      description={mode === 'image' ? 'Subir imagen' : 'Firmar aquí'}>
      <Link href={{ pathname: '/sign', params: { mode: mode === 'image' ? 'signature' : 'image' } }} replace asChild>
        <Button label={mode === 'image' ? 'Firmar aquí' : 'Subir imagen'} variant="secondary" />
      </Link>
      <Button label="Firmar" onPress={() => router.replace('/task-created')} />
    </RouteScreen>
  );
}
