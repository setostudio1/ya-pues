import { Link } from 'expo-router';

import Button from '@/components/ui/Button';
import InputField from '@/components/ui/InputField';
import type { SignatureMode, TaskDraft } from '@/types/tasks';

type Props = {
  mode: SignatureMode;
  draft: TaskDraft;
  disabled: boolean;
  onChange: (updates: Partial<TaskDraft>) => void;
};

export default function SignatureFields({ mode, draft, disabled, onChange }: Props) {
  const otherMode: SignatureMode = mode === 'image' ? 'signature' : 'image';

  return (
    <>
      <InputField label="Tu nombre para firmar el compromiso" value={draft.signedBy} maxLength={80}
        editable={!disabled} onChangeText={(signedBy) => onChange({ signedBy })} />
      {mode === 'image' && (
        <InputField label="Enlace de la imagen de tu firma" value={draft.signatureImageUri}
          placeholder="https://…" keyboardType="url" maxLength={2048} autoCapitalize="none" autoCorrect={false}
          editable={!disabled} onChangeText={(signatureImageUri) => onChange({ signatureImageUri })} />
      )}
      <Link href={{ pathname: '/sign', params: { mode: otherMode } }} replace asChild>
        <Button label={mode === 'image' ? 'Firmar con mi nombre' : 'Usar una imagen de mi firma'}
          variant="secondary" disabled={disabled} />
      </Link>
    </>
  );
}
