import { useEffect, useState } from "react";

import { Image, Pressable, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useRouter } from "expo-router";

import {
  createStyleSheet,
  UnistylesRuntime,
  useStyles,
} from "react-native-unistyles";

import {
  getThemePreference,
  saveThemePreference,
} from "../../theme/themeStorage";

type Props = {
  displayName: string;
  avatarUrl?: string | null;
  onProfilePress: () => void;
};

const stylesheet = createStyleSheet((theme) => ({
  container: {
    width: "100%",

    minHeight: 64,

    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.md,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: theme.colors.background,
  },

  brand: {
    flex: 1,

    justifyContent: "center",

    paddingRight: theme.spacing.lg,
  },

  title: {
    color: theme.colors.text,

    fontFamily: theme.typography.fontExtraBold,

    fontSize: theme.typography.xl,


    lineHeight: 25,

    includeFontPadding: false,
  },

  subtitle: {
    marginTop: 4,

    color: theme.colors.textMuted,

    fontFamily: theme.typography.fontMedium,

    fontSize: theme.typography.xs,


    lineHeight: 16,

    includeFontPadding: false,
  },

  actions: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    gap: theme.spacing.sm,

    flexShrink: 0,
  },

  actionButton: {
    width: 38,
    height: 38,

    borderRadius: theme.radius.lg,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: theme.colors.surface,

    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

  actionButtonActive: {
    backgroundColor: theme.colors.primarySoft,

    borderColor: theme.colors.primary,
  },

  profileButton: {
    width: 40,
    height: 40,

    borderRadius: theme.radius.full,

    alignItems: "center",
    justifyContent: "center",

    overflow: "hidden",

    backgroundColor: theme.colors.primarySoft,

    borderWidth: 1,
    borderColor: theme.colors.primary,
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  avatarFallback: {
    color: theme.colors.primary,

    fontFamily: theme.typography.fontBold,

    fontSize: theme.typography.md,


    includeFontPadding: false,
  },

  pressed: {
    opacity: 0.7,

    transform: [
      {
        scale: 0.96,
      },
    ],
  },
}));

export default function HomeHeader({
  displayName,
  avatarUrl,
  onProfilePress,
}: Props) {
  const { styles, theme } = useStyles(stylesheet);

  const router = useRouter();

  const [isDark, setIsDark] = useState(UnistylesRuntime.themeName === "dark");

  useEffect(() => {
    let mounted = true;

    async function loadThemePreference() {
      try {
        const preference = await getThemePreference();

        if (!mounted) {
          return;
        }

        if (preference === "dark") {
          setIsDark(true);
        } else if (preference === "light") {
          setIsDark(false);
        } else {
          setIsDark(UnistylesRuntime.themeName === "dark");
        }
      } catch {
        if (mounted) {
          setIsDark(UnistylesRuntime.themeName === "dark");
        }
      }
    }

    void loadThemePreference();

    return () => {
      mounted = false;
    };
  }, []);

  const initial = displayName.trim().charAt(0).toUpperCase() || "S";

  function toggleTheme() {
    const nextTheme = isDark ? "light" : "dark";

    if (UnistylesRuntime.hasAdaptiveThemes) {
      UnistylesRuntime.setAdaptiveThemes(false);
    }

    UnistylesRuntime.setTheme(nextTheme);

    setIsDark(nextTheme === "dark");

    void saveThemePreference(nextTheme);
  }

  return (
    <View style={styles.container}>
      <View style={styles.brand}>
        <Text style={styles.title} numberOfLines={1}>
          Sudoku Battle
        </Text>

        <Text style={styles.subtitle} numberOfLines={1}>
          Ready for your next challenge?
        </Text>
      </View>

      <View style={styles.actions}>
        {/* Theme */}
        <Pressable
          onPress={toggleTheme}
          hitSlop={8}
          pressRetentionOffset={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
          accessibilityRole="button"
          accessibilityLabel={
            isDark ? "Switch to light mode" : "Switch to dark mode"
          }
          style={({ pressed }) => [
            styles.actionButton,

            isDark ? styles.actionButtonActive : null,

            pressed ? styles.pressed : null,
          ]}
        >
          <Ionicons
            name={isDark ? "sunny-outline" : "moon-outline"}
            size={17}
            color={isDark ? theme.colors.warning : theme.colors.primary}
          />
        </Pressable>

        {/* Friends */}
        <Pressable
          onPress={() => router.push("/friends")}
          hitSlop={8}
          pressRetentionOffset={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
          accessibilityRole="button"
          accessibilityLabel="Friends"
          style={({ pressed }) => [
            styles.actionButton,

            pressed ? styles.pressed : null,
          ]}
        >
          <Ionicons
            name="people-outline"
            size={18}
            color={theme.colors.primary}
          />
        </Pressable>

        {/* Profile */}
        <Pressable
          onPress={onProfilePress}
          hitSlop={8}
          pressRetentionOffset={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
          accessibilityRole="button"
          accessibilityLabel="Profile"
          style={({ pressed }) => [
            styles.profileButton,

            pressed ? styles.pressed : null,
          ]}
        >
          {avatarUrl ? (
            <Image
              source={{
                uri: avatarUrl,
              }}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.avatarFallback}>{initial}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
