import { WEB_REMINDER_TONES, WEB_REMINDER_VIBRATIONS } from '@/constants/reminders';
import type { WebNotificationKind } from '@/types/reminders';

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined' || typeof window.AudioContext !== 'function') {
    return null;
  }
  audioContext ??= new window.AudioContext();
  return audioContext;
}

export function unlockWebAudio() {
  const context = getAudioContext();
  if (context?.state === 'suspended') {
    void context.resume().catch(() => undefined);
  }
}

function playTone({ frequency, volume, beeps, length }: (typeof WEB_REMINDER_TONES)[WebNotificationKind]) {
  const context = getAudioContext();
  if (!context || context.state !== 'running') {
    return;
  }
  for (let index = 0; index < beeps; index++) {
    const start = context.currentTime + index * length * 2;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + length);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + length);
  }
}

function vibrate(pattern: number[]) {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(pattern);
  }
}

export function playWebFeedback(kind: WebNotificationKind) {
  playTone(WEB_REMINDER_TONES[kind]);
  vibrate(WEB_REMINDER_VIBRATIONS[kind]);
}
