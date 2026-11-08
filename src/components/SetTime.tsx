import TaskStepScreen from './TaskStepScreen';
import TimeSelector from './TimeSelector';

export default function SetTime({ value, onChange, onContinue, error }: {
  value: string; onChange: (time: string) => void; onContinue: () => void; error?: string;
}) {
  return (
    <TaskStepScreen step="Paso 2 - Hora Límite" title="¿A qué hora tiene que estar hecha esta tarea?"
      caption="Para cambiar la hora" onContinue={onContinue} error={error}>
      <TimeSelector value={value} onChange={onChange} />
    </TaskStepScreen>
  );
}
