import { colors } from '@/constants/colors';
import { directions, shadows, sizes } from '@/constants/layout';
import { borders, radius, spacing } from '@/constants/spacing';
import { fontSizes, textStyles } from '@/constants/typography';

export const theme = {
  colors,
  spacing,
  radius,
  border: borders,
  text: fontSizes,
  typography: textStyles,
  layout: sizes,
  directions,
  effects: shadows,

  surfaces: {
    card: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: borders.standard,
      borderBottomWidth: borders.cardDepth,
      borderRadius: radius.lg,
      padding: spacing.lg,
    },
  },
};
