import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '../src/components/Button';
import FillForm from '../src/components/FillForm';
import SetIntensity from '../src/components/SetIntensity';
import StepLabel from '../src/components/StepLabel';
import { theme } from '../src/constants/theme';

export default function Index() {
  const [taskName, setTaskName] = useState('');
  const [selectedIntensity, setSelectedIntensity] = useState('Leve');

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <StepLabel 
          step="Paso 3 - La tarea"
          title="¿Qué tienes que hacer?"
          description="Descríbelo como una acción concreta"
        />
        <FillForm 
          value={taskName}
          onChangeText={setTaskName}
        />
        <SetIntensity 
          selected={selectedIntensity}
          onSelect={setSelectedIntensity}
        />
        <Button 
          label="Continuar" 
          onPress={() => {}} 
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
});