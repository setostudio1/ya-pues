import { Platform } from 'react-native';

export const WEB_SHELL_ID = 'ya-web-shell';

/** Removes the static web splash rendered by +html.tsx. No-op on native. */
export function removeWebShell() {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  document.getElementById(WEB_SHELL_ID)?.remove();
}
