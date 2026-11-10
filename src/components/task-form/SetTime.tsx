import TaskStepScreen from '@/components/task-form/TaskStepScreen';
import TimeSelector from '@/components/task-form/TimeSelector';

type Props = {
  value: string;
  onChange: (time: string) => void;
  onContinue: () => void;
  error?: string;
};

export default function SetTime({ value, onChange, onContinue, error }: Props) {
  return (
    <TaskStepScreen step="Paso 2 - Hora Límite" title="¿A qué hora tiene que estar hecha esta tarea?"
      caption="Para cambiar la hora" onContinue={onContinue} error={error}>
      <TimeSelector value={value} onChange={onChange} />
    </TaskStepScreen>
  );
}
