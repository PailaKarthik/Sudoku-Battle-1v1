import * as SecureStore from "expo-secure-store";

export type ThemePreference = "system" | "light" | "dark";

const THEME_KEY = "sudoku_battle.theme_preference";

export async function getThemePreference(): Promise<ThemePreference> {
  const value = await SecureStore.getItemAsync(THEME_KEY);

  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }

  return "system";
}

export async function saveThemePreference(
  preference: ThemePreference,
): Promise<void> {
  await SecureStore.setItemAsync(THEME_KEY, preference);
}
