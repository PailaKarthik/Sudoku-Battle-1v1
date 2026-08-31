import { useMemo, useState } from "react";

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from "react-native";

import { router } from "expo-router";

import { createStyleSheet, useStyles } from "react-native-unistyles";

import { updateMyProfile } from "../../services/api/userApi";

import { setUser } from "../../features/auth/authSlice";

import { setProfile } from "../../features/user/userSlice";

import { useAppDispatch, useAppSelector } from "../../store/hooks";

const stylesheet = createStyleSheet((theme) => ({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xxl,
  },

  icon: {
    width: 68,
    height: 68,
    borderRadius: theme.radius.xxl,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    alignSelf: "center",
    marginBottom: theme.spacing.xl,
  },

  iconText: {
    color: theme.colors.textInverse,
    fontFamily: theme.typography.fontExtraBold,
    fontSize: 28,
    
  },

  title: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontExtraBold,
    fontSize: theme.typography.title,
    
    textAlign: "center",
  },

  subtitle: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xxxl,
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.md,
    lineHeight: 22,
    textAlign: "center",
  },

  label: {
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
    fontFamily: theme.typography.fontSemiBold,
    fontSize: theme.typography.sm,
    
  },

  input: {
    height: 52,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.inputBackground,
    color: theme.colors.text,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.md,
  },

  inputFocused: {
    borderColor: theme.colors.primary,
  },

  button: {
    height: 54,
    marginTop: theme.spacing.md,
    borderRadius: theme.radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
  },

  buttonDisabled: {
    opacity: 0.55,
  },

  buttonText: {
    color: theme.colors.textInverse,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.md,
    
  },

  error: {
    marginBottom: theme.spacing.md,
    color: theme.colors.error,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.sm,
  },
}));

export default function ProfileSetupScreen() {
  const { styles } = useStyles(stylesheet);

  const dispatch = useAppDispatch();

  const existingUser = useAppSelector((state) => state.auth.user);

  const [username, setUsername] = useState(existingUser?.username ?? "");

  const [displayName, setDisplayName] = useState(
    existingUser?.displayName ?? "",
  );

  const [focused, setFocused] = useState<"username" | "displayName" | null>(
    null,
  );

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () =>
      username.trim().length >= 3 && displayName.trim().length >= 2 && !loading,
    [username, displayName, loading],
  );

  async function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const profile = await updateMyProfile({
        username: username.trim(),
        displayName: displayName.trim(),
      });

      dispatch(setProfile(profile));

      dispatch(
        setUser({
          ...profile,
          rating: existingUser?.rating ?? {
            rating: 1000,
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            highestRating: 1000,
          },
        }),
      );

      router.replace("/");
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to save profile",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <View style={styles.icon}>
            <Text style={styles.iconText}>S</Text>
          </View>

          <Text style={styles.title}>Make it yours</Text>

          <Text style={styles.subtitle}>
            Choose your username and display name. You can edit them later.
          </Text>

          <Text style={styles.label}>Username</Text>

          <TextInput
            value={username}
            onChangeText={setUsername}
            onFocus={() => setFocused("username")}
            onBlur={() => setFocused(null)}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="your_username"
            placeholderTextColor="#94a3b8"
            style={[
              styles.input,
              focused === "username" ? styles.inputFocused : null,
            ]}
          />

          <Text style={styles.label}>Display name</Text>

          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            onFocus={() => setFocused("displayName")}
            onBlur={() => setFocused(null)}
            placeholder="Your display name"
            placeholderTextColor="#94a3b8"
            style={[
              styles.input,
              focused === "displayName" ? styles.inputFocused : null,
            ]}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            disabled={!canSubmit}
            onPress={handleSubmit}
            style={[styles.button, !canSubmit ? styles.buttonDisabled : null]}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Continue</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
