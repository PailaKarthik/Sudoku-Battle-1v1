import { UnistylesRegistry } from "react-native-unistyles";

import { darkTheme, lightTheme } from "./themes";

UnistylesRegistry.addThemes({
  light: lightTheme,
  dark: darkTheme,
}).addConfig({
  adaptiveThemes: true,
  initialTheme: "light",
});
