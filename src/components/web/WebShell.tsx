import { colors } from '@/constants/colors';
import { WEB_SHELL_ID } from '@/utils/webShell';

// Static splash painted by the server HTML before the JS bundle loads.
// Lives outside #root so React never hydrates it; removeWebShell() drops it once the app is ready.
const css = `
#${WEB_SHELL_ID} {
  position: fixed; inset: 0; z-index: 1;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
  padding: 0 24px; background: ${colors.card}; text-align: center;
  font-family: Nunito, system-ui, -apple-system, sans-serif;
}
#${WEB_SHELL_ID} h1 { margin: 0; font-size: 40px; font-weight: 700; letter-spacing: 1px; color: ${colors.primary}; }
#${WEB_SHELL_ID} p { margin: 0; max-width: 320px; font-size: 18px; line-height: 26px; color: ${colors.textMutedStrong}; }
`;

export default function WebShell() {
  return (
    <div id={WEB_SHELL_ID} aria-hidden="true">
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <h1>YA PUES</h1>
      <p>Organiza tus tareas y cumple tus metas</p>
    </div>
  );
}
