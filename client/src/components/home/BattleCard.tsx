import { Pressable, Text, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useRouter } from "expo-router";

import { createStyleSheet, useStyles } from "react-native-unistyles";

const stylesheet = createStyleSheet((theme) => ({
  card: {
    borderRadius: theme.radius.xxl,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.xl,
    overflow: "hidden",
    minHeight: 218,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
  },

  orbLarge: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    right: -65,
    top: -72,
    backgroundColor: theme.colors.primaryGradientEnd,
    opacity: 0.88,
  },

  orbSmall: {
    position: "absolute",
    width: 86,
    height: 86,
    borderRadius: 43,
    right: 52,
    bottom: -38,
    backgroundColor: theme.colors.textInverse,
    opacity: 0.1,
  },

  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  eyebrow: {
    color: theme.colors.textInverse,
    opacity: 0.72,
    fontFamily: theme.typography.fontSemiBold,
    fontSize: theme.typography.sm,
  },

  title: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textInverse,
    fontFamily: theme.typography.fontExtraBold,
    fontSize: 28,
  },

  description: {
    marginTop: theme.spacing.sm,
    color: theme.colors.textInverse,
    opacity: 0.82,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.sm,
    lineHeight: 19,
  },

  button: {
    alignSelf: "flex-start",
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.textInverse,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 3,
  },

  buttonText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.sm,
  },
}));

export default function BattleCard() {
  const { styles } = useStyles(stylesheet);

  const router = useRouter();

  return (
    <View style={styles.card}>
      <View style={styles.orbLarge} />
      <View style={styles.orbSmall} />

      <View style={styles.iconBadge}>
        <Ionicons name="flash" size={20} color="#ffffff" />
      </View>

      <Text style={styles.eyebrow}>LIVE COMPETITION</Text>

      <Text style={styles.title}>1v1 Battle</Text>

      <Text style={styles.description}>
        Challenge a friend or find an opponent around your rating.
      </Text>

      <Pressable style={styles.button} onPress={() => router.push("/battle")}>
        <Text style={styles.buttonText}>Play now</Text>
      </Pressable>
    </View>
  );
}
