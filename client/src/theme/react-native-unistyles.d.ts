import type { DarkTheme, LightTheme } from "./themes";

declare module "react-native-unistyles" {
  export interface UnistylesThemes {
    light: LightTheme;
    dark: DarkTheme;
  }
}
