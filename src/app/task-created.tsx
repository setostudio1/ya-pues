import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform } from 'react-native';

import NotifyCard from '@/components/reminders/NotifyCard';
import RewardCheck from '@/components/task-form/RewardCheck';
import Button from '@/components/ui/Button';
import RouteScreen from '@/components/ui/RouteScreen';

const RETURN_HOME_DELAY_MS = 1700;
const CAN_NOTIFY = Platform.OS !== 'web';

function goHome() {
  router.dismissTo('/');
}

export default function TaskCreatedScreen() {
  const { taskId } = useLocalSearchParams<{ taskId?: string }>();
  const [isWaitingForAnswer, setIsWaitingForAnswer] = useState(CAN_NOTIFY);

  const handleAnswered = useCallback(() => setIsWaitingForAnswer(false), []);

  useFocusEffect(useCallback(() => {
    if (isWaitingForAnswer) {
      return;
    }
    const timer = setTimeout(goHome, RETURN_HOME_DELAY_MS);
    return () => clearTimeout(timer);
  }, [isWaitingForAnswer]));

  return (
    <RouteScreen title="Tarea creada" description="Ahora depende de ti" hideBackButton>
      <RewardCheck />
      {CAN_NOTIFY && <NotifyCard taskId={taskId} onAnswered={handleAnswered} />}
      <Button label="Volver al inicio" onPress={goHome} />
    </RouteScreen>
  );
}
