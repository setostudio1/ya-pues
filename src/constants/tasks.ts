import { colors } from '@/constants/colors';
import type { Intensity, ProofType } from '@/types/tasks';

export const TITLE_LENGTH = { min: 3, max: 120 };

export const INTENSITY_LEVELS: readonly Intensity[] = ['low', 'medium', 'high'];

export const INTENSITY_LABELS: Record<Intensity, string> = { low: 'Leve', medium: 'Medio', high: 'Alto' };

export const INTENSITY_COLORS: Record<Intensity, string> = {
  low: colors.intensityLow,
  medium: colors.intensityMedium,
  high: colors.intensityHigh,
};

export const PROOF_TYPES: readonly ProofType[] = ['photo', 'video', 'timelapse'];

export const PROOF_LABELS: Record<ProofType, string> = { photo: 'Foto', video: 'Video', timelapse: 'Timelapse' };

export const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

export const WEEKDAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

export const HOURS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));

export const MINUTES = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'));
