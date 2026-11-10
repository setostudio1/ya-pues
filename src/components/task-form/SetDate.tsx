import DateWheels from '@/components/task-form/DateWheels';
import TaskStepScreen from '@/components/task-form/TaskStepScreen';

type Props = {
  value: string;
  onChange: (date: string) => void;
  onContinue: () => void;
  error?: string;
};

export default function SetDate({ value, onChange, onContinue, error }: Props) {
  return (
    <TaskStepScreen step="Paso 1 - Fecha Límite" title="¿Cuándo tiene que estar hecha esta tarea?"
      caption="Para cambiar la fecha" onContinue={onContinue} error={error}>
      <DateWheels value={value} onChange={onChange} />
    </TaskStepScreen>
  );
}
