import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from "react-native";

import { router } from "expo-router";

import { createStyleSheet, useStyles } from "react-native-unistyles";

import { signInWithGoogle } from "../../services/api/googleAuth";

import { loginWithGoogle } from "../../services/api/authApi";

import {
  authStarted,
  setAuth,
  setAuthError,
} from "../../features/auth/authSlice";

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

  branding: {
    alignItems: "center",
    marginBottom: theme.spacing.xxxl,
  },

  logo: {
    width: 76,
    height: 76,
    borderRadius: theme.radius.xxl,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.xl,
  },

  logoGrid: {
    width: 42,
    height: 42,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },

  logoCell: {
    width: 19,
    height: 19,
    borderRadius: 5,
    backgroundColor: theme.colors.textInverse,
  },

  logoCellMuted: {
    opacity: 0.55,
  },

  title: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontExtraBold,
    fontSize: theme.typography.title,
    
  },

  subtitle: {
    marginTop: theme.spacing.sm,
    maxWidth: 290,
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.md,
    lineHeight: 22,
    textAlign: "center",
  },

  card: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.xxl,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
  },

  cardTitle: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.lg,
    
    textAlign: "center",
  },

  cardSubtitle: {
    marginTop: theme.spacing.xs,
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.sm,
    lineHeight: 19,
    textAlign: "center",
  },

  googleButton: {
    height: 52,
    marginTop: theme.spacing.xl,
    borderRadius: theme.radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.textInverse,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },

  googleIcon: {
    width: 22,
    height: 22,
    marginRight: theme.spacing.md,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },

  googleIconText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontExtraBold,
    fontSize: 14,
    
  },

  googleButtonText: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontSemiBold,
    fontSize: theme.typography.md,
    
  },

  loadingButton: {
    height: 52,
    marginTop: theme.spacing.xl,
    borderRadius: theme.radius.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
  },

  loadingText: {
    marginTop: theme.spacing.xs,
    color: theme.colors.textInverse,
    fontFamily: theme.typography.fontSemiBold,
    fontSize: theme.typography.sm,
    
  },

  error: {
    marginTop: theme.spacing.md,
    color: theme.colors.error,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.sm,
    lineHeight: 19,
    textAlign: "center",
  },

  footer: {
    paddingHorizontal: theme.spacing.xxl,
    paddingBottom: theme.spacing.xl,
    alignItems: "center",
  },

  footerText: {
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.xs,
    textAlign: "center",
  },
}));

export default function LoginScreen() {
  const { styles } = useStyles(stylesheet);

  const dispatch = useAppDispatch();

  const { loading, error } = useAppSelector((state) => state.auth);

  async function handleGoogleLogin() {
    if (loading) {
      return;
    }

    try {
      dispatch(authStarted());

      const idToken = await signInWithGoogle();

      const auth = await loginWithGoogle(idToken);

      dispatch(setAuth(auth));
      dispatch(setProfile(auth.user));

      router.replace("/");
    } catch (error) {
      dispatch(
        setAuthError(
          error instanceof Error
            ? error.message
            : "Unable to sign in with Google",
        ),
      );
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.branding}>
          <View style={styles.logo}>
            <View style={styles.logoGrid}>
              <View style={styles.logoCell} />

              <View style={[styles.logoCell, styles.logoCellMuted]} />

              <View style={[styles.logoCell, styles.logoCellMuted]} />

              <View style={styles.logoCell} />
            </View>
          </View>

          <Text style={styles.title}>Sudoku Battle</Text>

          <Text style={styles.subtitle}>
            Solve fast. Compete live. Build your rating.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome</Text>

          <Text style={styles.cardSubtitle}>
            Sign in with Google to continue your battles, friends, and daily
            challenges.
          </Text>

          {loading ? (
            <View style={styles.loadingButton}>
              <ActivityIndicator color={themeColorWhite} />

              <Text style={styles.loadingText}>Signing in...</Text>
            </View>
          ) : (
            <Pressable
              style={styles.googleButton}
              onPress={handleGoogleLogin}
              accessibilityRole="button"
              accessibilityLabel="Continue with Google"
            >
              <View style={styles.googleIcon}>
                <Text style={styles.googleIconText}>G</Text>
              </View>

              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </Pressable>
          )}

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Your account is protected by Google authentication.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const themeColorWhite = "#ffffff";
