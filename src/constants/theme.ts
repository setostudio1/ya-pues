import { colors } from '@/constants/colors';

export const theme = {
  colors,

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },

  radius: {
    sm: 10,
    md: 16,
    lg: 22,
    xl: 28,
    full: 999,
  },

  text: {
    display: 44,
    title: 28,
    subtitle: 24,
    heading: 20,
    body: 16,
    small: 14,
    caption: 12,
  },

  border: { standard: 1, buttonDepth: 3, cardDepth: 1 },

  layout: { maxWidth: 640, formMaxWidth: 480 },

  effects: {
    streakCard: '0px 4px 18px rgba(22, 27, 53, 0.08)',
  },

  typography: {
    display: { fontFamily: 'Nunito', fontWeight: '700' as const, letterSpacing: -0.6 },
    title: { fontFamily: 'Nunito', fontWeight: '700' as const, letterSpacing: -0.4 },
    heading: { fontFamily: 'Nunito', fontWeight: '600' as const, letterSpacing: -0.2 },
    label: { fontFamily: 'Nunito', fontWeight: '600' as const, letterSpacing: 0 },
    body: { fontFamily: 'Nunito', fontWeight: '400' as const, lineHeight: 24 },
    caption: { fontFamily: 'Nunito', fontWeight: '600' as const, lineHeight: 20 },
  },

  surfaces: {
    card: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderBottomWidth: 1,
      borderRadius: 22,
      padding: 20,
    },
  },
};
