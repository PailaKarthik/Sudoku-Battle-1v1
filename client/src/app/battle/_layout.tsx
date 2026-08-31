import { Stack } from "expo-router";

export default function BattleLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    />
  );
}
