import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { createStyleSheet, useStyles } from "react-native-unistyles";

import Toast from "react-native-toast-message";

import { logout } from "../../services/api/authApi";

import { clearAuth } from "../../features/auth/authSlice";

import { clearProfile } from "../../features/user/userSlice";

import { useAppDispatch } from "../../store/hooks";

import { getMyRating, type RatingStats } from "../../services/api/ratingApi";

type Props = {
  visible: boolean;
  displayName: string;
  username: string | null;
  avatarUrl?: string | null;
  friendsCount: number;
  onClose: () => void;
};

const stylesheet = createStyleSheet((theme) => ({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: theme.colors.overlay,
  },

  sheet: {
    width: "100%",
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxxl,

    borderTopLeftRadius: theme.radius.xxl,
    borderTopRightRadius: theme.radius.xxl,

    backgroundColor: theme.colors.surface,
  },

  handle: {
    width: 42,
    height: 4,
    alignSelf: "center",
    marginBottom: theme.spacing.xl,

    borderRadius: theme.radius.full,

    backgroundColor: theme.colors.borderStrong,
  },

  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 64,
    height: 64,

    borderRadius: theme.radius.full,

    alignItems: "center",
    justifyContent: "center",

    overflow: "hidden",

    backgroundColor: theme.colors.primarySoft,

    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  avatarText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontExtraBold,
    fontSize: theme.typography.xxl,
    
  },

  profileDetails: {
    flex: 1,
    marginLeft: theme.spacing.lg,
  },

  name: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontExtraBold,
    fontSize: theme.typography.xxl,
    
  },

  username: {
    marginTop: 3,
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.md,
  },

  ratingHeader: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.lg,

    borderRadius: theme.radius.xl,

    backgroundColor: theme.colors.primarySoft,

    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  ratingHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  ratingLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.xs,
    
    textTransform: "uppercase",
  },

  ratingValue: {
    marginTop: 3,
    color: theme.colors.primary,
    fontFamily: theme.typography.fontRegular,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "800",
  },

  highestRating: {
    alignItems: "flex-end",
  },

  highestLabel: {
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.xs,
  },

  highestValue: {
    marginTop: 2,
    color: theme.colors.text,
    fontFamily: theme.typography.fontExtraBold,
    fontSize: theme.typography.md,
    
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },

  statCard: {
    width: "31.8%",
    minHeight: 68,
    padding: theme.spacing.md,

    borderRadius: theme.radius.lg,

    justifyContent: "center",

    backgroundColor: theme.colors.surface,

    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  statValue: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontExtraBold,
    fontSize: theme.typography.lg,
    
    includeFontPadding: false,
  },

  statLabel: {
    marginTop: 3,
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.xs,
  },

  friendsCard: {
    marginTop: theme.spacing.sm,
    minHeight: 68,
    padding: theme.spacing.md,

    borderRadius: theme.radius.lg,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: theme.colors.surface,

    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  friendsIcon: {
    width: 34,
    height: 34,

    borderRadius: theme.radius.full,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: theme.colors.primarySoft,
  },

  friendsText: {
    marginLeft: theme.spacing.md,
  },

  friendsValue: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontExtraBold,
    fontSize: theme.typography.lg,
    
  },

  friendsLabel: {
    marginTop: 2,
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.xs,
  },

  actionSection: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.sm,
  },

  actionButton: {
    minHeight: 50,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    borderRadius: theme.radius.lg,
  },

  logoutButton: {
    backgroundColor: theme.colors.errorSoft,
  },

  logoutText: {
    marginLeft: theme.spacing.sm,
    color: theme.colors.error,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.md,
    
  },

  closeButton: {
    backgroundColor: theme.colors.primarySoft,
  },

  closeText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.md,
    
  },
}));

export default function ProfileSheet({
  visible,
  displayName,
  username,
  avatarUrl,
  friendsCount,
  onClose,
}: Props) {
  const { styles, theme } = useStyles(stylesheet);

  const dispatch = useAppDispatch();

  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);

  const [ratingLoading, setRatingLoading] = useState(false);

  const initial = displayName.trim().charAt(0).toUpperCase() || "S";

  /*
   * Reload the rating every time the
   * profile sheet opens.
   */
  useEffect(() => {
    if (!visible) {
      return;
    }

    let mounted = true;

    async function loadRating() {
      try {
        setRatingLoading(true);

        const stats = await getMyRating("2x3");

        if (!mounted) {
          return;
        }

        setRatingStats(stats);
      } catch (error) {
        if (!mounted) {
          return;
        }

        Toast.show({
          type: "error",
          text1: "Unable to load rating",
          text2: error instanceof Error ? error.message : "Please try again.",
          position: "top",
        });
      } finally {
        if (mounted) {
          setRatingLoading(false);
        }
      }
    }

    void loadRating();

    return () => {
      mounted = false;
    };
  }, [visible]);

  /*
   * Use freshly fetched values first.
   *
   * The fallback is only for the initial
   * render before the request completes.
   */
  const rating = ratingStats ?? {
    rating: 1000,
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    highestRating: 1000,
  };

  async function handleLogout() {
    try {
      await logout();

      dispatch(clearAuth());
      dispatch(clearProfile());

      onClose();

      Toast.show({
        type: "success",
        text1: "Signed out",
        position: "top",
      });
    } catch (error) {
      /*
       * Local authentication should still be
       * cleared if the server logout request
       * fails.
       */
      dispatch(clearAuth());
      dispatch(clearProfile());

      onClose();

      Toast.show({
        type: "error",
        text1: "Signed out locally",
        text2:
          error instanceof Error
            ? error.message
            : "The server logout request failed.",
        position: "top",
      });
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
          }}
          onPress={onClose}
        />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              {avatarUrl ? (
                <Image
                  source={{
                    uri: avatarUrl,
                  }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.avatarText}>{initial}</Text>
              )}
            </View>

            <View style={styles.profileDetails}>
              <Text style={styles.name} numberOfLines={1}>
                {displayName}
              </Text>

              {username ? (
                <Text style={styles.username} numberOfLines={1}>
                  @{username}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.ratingHeader}>
            <View style={styles.ratingHeaderRow}>
              <View>
                <Text style={styles.ratingLabel}>6×6 Rating</Text>

                {ratingLoading ? (
                  <ActivityIndicator
                    size="small"
                    style={{
                      marginTop: 8,
                      alignSelf: "flex-start",
                    }}
                  />
                ) : (
                  <Text style={styles.ratingValue}>{rating.rating}</Text>
                )}
              </View>

              <View style={styles.highestRating}>
                <Text style={styles.highestLabel}>Highest</Text>

                <Text style={styles.highestValue}>{rating.highestRating}</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{rating.gamesPlayed}</Text>

              <Text style={styles.statLabel}>Played</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>{rating.wins}</Text>

              <Text style={styles.statLabel}>Wins</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>{rating.losses}</Text>

              <Text style={styles.statLabel}>Losses</Text>
            </View>
          </View>

          <View style={styles.friendsCard}>
            <View style={styles.friendsIcon}>
              <Ionicons
                name="people-outline"
                size={18}
                color={theme.colors.primary}
              />
            </View>

            <View style={styles.friendsText}>
              <Text style={styles.friendsValue}>{friendsCount}</Text>

              <Text style={styles.friendsLabel}>Friends</Text>
            </View>

            <View
              style={{
                flex: 1,
              }}
            />

            <View
              style={{
                alignItems: "flex-end",
              }}
            >
              <Text style={styles.highestLabel}>Draws</Text>

              <Text style={styles.highestValue}>{rating.draws}</Text>
            </View>
          </View>

          <View style={styles.actionSection}>
            <Pressable
              style={[styles.actionButton, styles.logoutButton]}
              onPress={() => void handleLogout()}
            >
              <Ionicons
                name="log-out-outline"
                size={19}
                color={theme.colors.error}
              />

              <Text style={styles.logoutText}>Sign out</Text>
            </Pressable>

            <Pressable
              style={[styles.actionButton, styles.closeButton]}
              onPress={onClose}
            >
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
