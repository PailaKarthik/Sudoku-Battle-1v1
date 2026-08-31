import { Pressable, ScrollView, Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { StatusBar } from "expo-status-bar";

import { Ionicons } from "@expo/vector-icons";

import { router } from "expo-router";

import { createStyleSheet, useStyles } from "react-native-unistyles";

const stylesheet = createStyleSheet((theme) => ({
  screen: {
    flex: 1,

    backgroundColor: theme.colors.background,
  },

  header: {
    minHeight: 72,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: theme.spacing.xxl,

    paddingVertical: theme.spacing.md,

    backgroundColor: theme.colors.background,

    borderBottomWidth: 1,

    borderBottomColor: theme.colors.border,

    zIndex: 10,

    elevation: 4,
  },

  headerSide: {
    width: 40,

    alignItems: "flex-start",

    justifyContent: "center",
  },

  headerCenter: {
    flex: 1,

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: theme.spacing.md,
  },

  headerRight: {
    width: 40,
  },

  backButton: {
    width: 38,
    height: 38,

    alignItems: "center",

    justifyContent: "center",

    borderRadius: theme.radius.md,

    backgroundColor: theme.colors.surface,

    borderWidth: 1,

    borderColor: theme.colors.border,
  },

  headerTitle: {
    color: theme.colors.text,

    fontFamily: theme.typography.fontExtraBold,

    fontSize: theme.typography.xl,

    

    lineHeight: 25,

    includeFontPadding: false,
  },

  headerSubtitle: {
    marginTop: 3,

    color: theme.colors.textMuted,

    fontFamily: theme.typography.fontRegular,

    fontSize: theme.typography.xs,

    lineHeight: 16,

    includeFontPadding: false,
  },

  scroll: {
    flex: 1,
  },

  content: {
    paddingHorizontal: theme.spacing.xxl,

    paddingTop: theme.spacing.xl,

    paddingBottom: theme.spacing.xxxl,
  },

  intro: {
    color: theme.colors.textMuted,

    fontFamily: theme.typography.fontRegular,

    fontSize: theme.typography.sm,

    lineHeight: 20,
  },

  card: {
    marginTop: theme.spacing.lg,

    padding: theme.spacing.xl,

    borderRadius: theme.radius.xxl,

    backgroundColor: theme.colors.surface,

    borderWidth: 1,

    borderColor: theme.colors.border,
  },

  iconContainer: {
    width: 52,
    height: 52,

    borderRadius: theme.radius.lg,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: theme.colors.primarySoft,
  },

  cardTitle: {
    marginTop: theme.spacing.lg,

    color: theme.colors.text,

    fontFamily: theme.typography.fontExtraBold,

    fontSize: theme.typography.xl,

    

    includeFontPadding: false,
  },

  cardText: {
    marginTop: theme.spacing.sm,

    color: theme.colors.textMuted,

    fontFamily: theme.typography.fontRegular,

    fontSize: theme.typography.sm,

    lineHeight: 20,
  },

  featureList: {
    marginTop: theme.spacing.lg,

    gap: theme.spacing.sm,
  },

  feature: {
    minHeight: 44,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: theme.spacing.md,

    borderRadius: theme.radius.md,

    backgroundColor: theme.colors.primarySoft,
  },

  featureIcon: {
    width: 28,
    height: 28,

    borderRadius: theme.radius.full,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: theme.colors.surface,
  },

  featureText: {
    flex: 1,

    marginLeft: theme.spacing.sm,

    color: theme.colors.text,

    fontFamily: theme.typography.fontSemiBold,

    fontSize: theme.typography.sm,

    
  },

  button: {
    height: 52,

    marginTop: theme.spacing.xl,

    borderRadius: theme.radius.lg,

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: theme.colors.primary,
  },

  buttonText: {
    color: theme.colors.textInverse,

    fontFamily: theme.typography.fontBold,

    fontSize: theme.typography.md,

    

    includeFontPadding: false,
  },

  buttonIcon: {
    marginLeft: theme.spacing.sm,
  },

  footerText: {
    marginTop: theme.spacing.md,

    color: theme.colors.textMuted,

    fontFamily: theme.typography.fontRegular,

    fontSize: theme.typography.xs,

    lineHeight: 18,

    textAlign: "center",
  },
}));

export default function BattleIndexScreen() {
  const { styles } = useStyles(stylesheet);

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "left", "right", "bottom"]}
    >
      <StatusBar style="auto" />

      {/* Fixed header */}
      <View style={styles.header}>
        <View style={styles.headerSide}>
          <Pressable
            onPress={() => router.replace("/")}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={({ pressed }) => [
              styles.backButton,

              pressed
                ? {
                    opacity: 0.7,

                    transform: [
                      {
                        scale: 0.96,
                      },
                    ],
                  }
                : null,
            ]}
          >
            <Ionicons name="chevron-back" size={19} color="#2563EB" />
          </Pressable>
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>1v1 Battle</Text>

          <Text style={styles.headerSubtitle}>Competitive Sudoku</Text>
        </View>

        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          Compete against another player in a live 6×6 Sudoku battle. Your
          rating is updated after every completed match.
        </Text>

        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="game-controller-outline"
              size={25}
              color="#2563EB"
            />
          </View>

          <Text style={styles.cardTitle}>Choose your battle</Text>

          <Text style={styles.cardText}>
            Find an opponent automatically or challenge someone from your
            friends list.
          </Text>

          <View style={styles.featureList}>
            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Ionicons name="globe-outline" size={15} color="#2563EB" />
              </View>

              <Text style={styles.featureText}>
                Match with a player around your rating
              </Text>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Ionicons name="people-outline" size={15} color="#2563EB" />
              </View>

              <Text style={styles.featureText}>Challenge an online friend</Text>
            </View>

            <View style={styles.feature}>
              <View style={styles.featureIcon}>
                <Ionicons name="trophy-outline" size={15} color="#2563EB" />
              </View>

              <Text style={styles.featureText}>
                Compete for rating and wins
              </Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.button,

              pressed
                ? {
                    opacity: 0.8,
                  }
                : null,
            ]}
            onPress={() => router.push("/battle/select")}
          >
            <Text style={styles.buttonText}>Continue</Text>

            <Ionicons
              name="arrow-forward"
              size={18}
              color="#FFFFFF"
              style={styles.buttonIcon}
            />
          </Pressable>

          <Text style={styles.footerText}>Current variant: 6×6</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
