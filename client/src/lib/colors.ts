/**
 * Vibecheck Color Palette
 * Based on: Burgundy & Navy Theme
 * Coolors URL: https://coolors.co/780000-c1121f-fdf0d5-003049-669bbc
 *
 * Color Names and Use Cases:
 * - Dark Burgundy (#780000): Primary actions, focus states, important CTAs
 * - Red (#C1121F): Accents, hover states, destructive actions
 * - Cream (#FDF0D5): Background, card backgrounds
 * - Navy (#003049): Primary text, headers
 * - Light Blue (#669BBC): Secondary elements, borders, subtle accents
 */

export const colors = {
  // Primary colors
  darkBurgundy: "#780000",
  red: "#C1121F",
  cream: "#FDF0D5",
  navy: "#003049",
  lightBlue: "#669BBC",

  // Semantic color mappings
  primary: "#780000", // Dark Burgundy
  primaryHover: "#5a0000",
  primaryLight: "#9a0000",

  secondary: "#669BBC", // Light Blue
  secondaryHover: "#4a7fa0",
  secondaryLight: "#88b5d6",

  accent: "#C1121F", // Red
  accentHover: "#a00f19",
  accentLight: "#d32f3f",

  background: "#FDF0D5", // Cream
  backgroundDark: "#e5d5b7",
  backgroundLight: "#ffffff",

  text: "#003049", // Navy
  textLight: "#336680",
  textMuted: "#669BBC",

  // Additional utility colors
  border: "#669BBC",
  borderLight: "#a0c4d8",
  borderDark: "#4a7fa0",

  success: "#4caf50",
  warning: "#ff9800",
  error: "#C1121F",
  info: "#669BBC",
} as const;

/**
 * Get color with opacity
 * @param color - Hex color string
 * @param opacity - Opacity value between 0 and 1
 */
export function withOpacity(color: string, opacity: number): string {
  // Convert hex to RGB
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Color utility functions for use in components
 */
export const colorUtils = {
  primary: {
    default: colors.primary,
    hover: colors.primaryHover,
    light: colors.primaryLight,
    withOpacity: (opacity: number) => withOpacity(colors.primary, opacity),
  },
  secondary: {
    default: colors.secondary,
    hover: colors.secondaryHover,
    light: colors.secondaryLight,
    withOpacity: (opacity: number) => withOpacity(colors.secondary, opacity),
  },
  accent: {
    default: colors.accent,
    hover: colors.accentHover,
    light: colors.accentLight,
    withOpacity: (opacity: number) => withOpacity(colors.accent, opacity),
  },
  background: {
    default: colors.background,
    dark: colors.backgroundDark,
    light: colors.backgroundLight,
    withOpacity: (opacity: number) => withOpacity(colors.background, opacity),
  },
  text: {
    default: colors.text,
    light: colors.textLight,
    muted: colors.textMuted,
    withOpacity: (opacity: number) => withOpacity(colors.text, opacity),
  },
};

// Export color type for TypeScript
export type ColorKey = keyof typeof colors;
export type ColorValue = (typeof colors)[ColorKey];
