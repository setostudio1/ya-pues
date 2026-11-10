const fontFamily = 'Nunito';

export const fontSizes = {
  hero: 56,
  reminderHeading: 48,
  display: 44,
  wheelSelected: 32,
  title: 28,
  stepTitle: 26,
  wheel: 26,
  subtitle: 24,
  heading: 20,
  body: 16,
  small: 14,
  caption: 12,
  tiny: 10,
};

export const textStyles = {
  display: { fontFamily, fontWeight: '700' as const, letterSpacing: -0.6 },
  title: { fontFamily, fontWeight: '700' as const, letterSpacing: -0.4 },
  heading: { fontFamily, fontWeight: '600' as const, letterSpacing: -0.2 },
  label: { fontFamily, fontWeight: '600' as const, letterSpacing: 0 },
  body: { fontFamily, fontWeight: '400' as const, lineHeight: 24 },
  caption: { fontFamily, fontWeight: '600' as const, lineHeight: 20 },
};
