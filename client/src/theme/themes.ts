export const colors = {
  blue50: "#eef5ff",
  blue100: "#dbeafe",
  blue200: "#bfdbfe",
  blue400: "#60a5fa",
  blue500: "#3b82f6",
  blue600: "#2563eb",
  blue700: "#1d4ed8",
  blue800: "#1e40af",
  blue900: "#1e3a8a",
  blue950: "#172554",

  navy900: "#0f1e3c",
  navy800: "#162040",
  navy700: "#1a2850",
  navy600: "#1e3464",

  white: "#ffffff",
  black: "#000000",

  slate50: "#f8fafc",
  slate100: "#f1f5f9",
  slate200: "#e2e8f0",
  slate400: "#94a3b8",
  slate500: "#64748b",
  slate600: "#475569",
  slate700: "#334155",

  success: "#22c55e",
  successDark: "#16a34a",

  error: "#ef4444",
  errorDark: "#dc2626",

  warning: "#f59e0b",
} as const;

export const lightTheme = {
  colors: {
    background: "#f6f7fb",
    surface: "#ffffff",
    surfaceElevated: "#ffffff",
    surfaceMuted: "#f0f4fb",
    card: "#ffffff",

    primary: "#4f46e5",
    primaryPressed: "#4338ca",
    primarySoft: "#eeefff",
    primaryGradientEnd: "#7c3aed",

    text: "#172033",
    textSecondary: colors.slate600,
    textMuted: colors.slate500,
    textInverse: colors.white,

    border: "#e2e7f0",
    borderStrong: "#cbd5e1",

    success: colors.success,
    successSoft: "#f0fdf4",

    error: colors.error,
    errorSoft: "#fef2f2",

    warning: colors.warning,
    warningSoft: "#fffbeb",

    inputBackground: "#f8faff",

    overlay: "rgba(15, 30, 60, 0.45)",

    sudokuFixed: colors.blue900,
    sudokuEditable: colors.blue600,
    sudokuSelected: colors.blue100,
    sudokuRelated: "#f5f9ff",
    sudokuCorrect: colors.success,
    sudokuIncorrect: colors.error,

    tabActive: colors.blue600,
    tabInactive: colors.slate400,

    ratingPositive: colors.success,
    ratingNegative: colors.error,

    shadow: "rgba(43, 55, 82, 0.13)",
    white: colors.white,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    xxl: 28,
    full: 999,
  },

  typography: {
    fontFamily: "Outfit_400Regular",
    fontRegular: "Outfit_400Regular",
    fontMedium: "Outfit_500Medium",
    fontSemiBold: "Outfit_600SemiBold",
    fontBold: "Outfit_700Bold",
    fontExtraBold: "Outfit_800ExtraBold",

    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    title: 30,
    hero: 36,
  },
} as const;

export const darkTheme = {
  colors: {
    background: "#10131f",
    surface: "#191e2d",
    surfaceElevated: "#22283a",
    surfaceMuted: "#151a28",
    card: "#191e2d",

    primary: "#818cf8",
    primaryPressed: "#6366f1",
    primarySoft: "#24284a",
    primaryGradientEnd: "#a78bfa",

    text: "#f6f7fb",
    textSecondary: "#c5c9d6",
    textMuted: "#9299ad",
    textInverse: colors.navy900,

    border: "#2c3347",
    borderStrong: "#404960",

    success: "#4ade80",
    successSoft: "#123b27",

    error: "#f87171",
    errorSoft: "#421d20",

    warning: "#fbbf24",
    warningSoft: "#453411",

    inputBackground: "#151a28",

    overlay: "rgba(0, 0, 0, 0.58)",

    sudokuFixed: colors.white,
    sudokuEditable: colors.blue400,
    sudokuSelected: "#25477d",
    sudokuRelated: "#1b2d50",
    sudokuCorrect: "#4ade80",
    sudokuIncorrect: "#f87171",

    tabActive: colors.blue400,
    tabInactive: "#6f86aa",

    ratingPositive: "#4ade80",
    ratingNegative: "#f87171",

    shadow: "rgba(0, 0, 0, 0.35)",
    white: colors.white,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  radius: {
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    xxl: 28,
    full: 999,
  },

  typography: {
    fontFamily: "Outfit_400Regular",
    fontRegular: "Outfit_400Regular",
    fontMedium: "Outfit_500Medium",
    fontSemiBold: "Outfit_600SemiBold",
    fontBold: "Outfit_700Bold",
    fontExtraBold: "Outfit_800ExtraBold",

    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    title: 30,
    hero: 36,
  },
} as const;

export type LightTheme = typeof lightTheme;
export type DarkTheme = typeof darkTheme;
