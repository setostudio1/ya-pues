import type { ReminderVariant } from './reminderTypes';

export const REMINDER_VARIANTS = ['initial', 'unstarted', 'urgent', 'personal'] as const;

export const reminderVariants = {
  initial: { route: '/notification-1', label: 'Hora de empezar', heading: 'HORAAAAA',
    description: 'Personaje centrado y acción Posponer.', artworkAvailable: true,
    imageWidthRatio: 343 / 402, imageAspectRatio: 1, imageTopRatio: 0 },
  unstarted: { route: '/notification-2', label: '¿En serio?', heading: '¿EN SERIO?',
    description: 'Primer plano con recortes laterales e inferior.', artworkAvailable: true,
    imageWidthRatio: 832 / 402, imageAspectRatio: 1, imageTopRatio: 0 },
  urgent: { route: '/notification-3', label: 'Menos de 1 hora', heading: 'MENOS DE\n1 HORA',
    description: 'Personaje con sirena y compañeros asomándose por los bordes.', artworkAvailable: true,
    imageWidthRatio: 427 / 402, imageAspectRatio: 427 / 434, imageTopRatio: 0 },
  personal: { route: '/notification-4', label: 'Recordatorio personal', heading: '¡YA PUES!',
    description: 'Nombre y tarea personalizables; personaje enfadado.', artworkAvailable: true,
    imageWidthRatio: 531 / 402, imageAspectRatio: 531 / 768, imageTopRatio: -52 / 402 },
} as const satisfies Record<ReminderVariant, {
  route: string; label: string; heading: string; description: string; artworkAvailable: boolean;
  imageWidthRatio: number; imageAspectRatio: number; imageTopRatio: number;
}>;

// Original transparent PNG supplied by the user. Regions are separated by transparent gutters.
// Clip at render time: retain the original pixels, proportions, siren and side accents.
export const triptychLayout = {
  width: 1981,
  height: 793,
  regions: {
    cheerful: { x: 0, width: 735 },
    defiant: { x: 735, width: 565 },
    alarm: { x: 1300, width: 681 },
  },
  // Positions from Figma frame 250:777, relative to its main illustration at y=347.
  layers: [
    { region: 'alarm', x: -12, y: 0, width: 427, height: 434 },
    { region: 'cheerful', x: -22.96880340576172, y: 265, width: 290.4913696050644, height: 292.1125558614731 },
    { region: 'defiant', x: 272, y: 308.2169189453125 - 347, width: 218.97280845963178, height: 220.26957653356658 },
  ],
} as const;
