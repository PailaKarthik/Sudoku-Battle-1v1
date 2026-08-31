import { Redirect } from "expo-router";

import { ActivityIndicator, View } from "react-native";

import { useAppSelector } from "../store/hooks";

export default function Index() {
  const { initialized, isAuthenticated, user } = useAppSelector(
    (state) => state.auth,
  );

  if (!initialized) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f0f6ff",
        }}
      >
        <ActivityIndicator size="small" color="#2563eb" />
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!user.profileCompleted) {
    return <Redirect href="/(onboarding)/profile-setup" />;
  }

  return <Redirect href="/(main)/home" />;
}
