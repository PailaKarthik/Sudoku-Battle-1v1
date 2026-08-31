import { useCallback, useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { StatusBar } from "expo-status-bar";

import { Ionicons } from "@expo/vector-icons";

import { router } from "expo-router";

import { createStyleSheet, useStyles } from "react-native-unistyles";

import Toast from "react-native-toast-message";

import { getFriends } from "../../services/api/friendsApi";

import {
  acceptBattleInvite,
  declineBattleInvite,
  getBattleInvites,
  sendBattleInvite,
  type BattleInvite,
} from "../../services/api/battleApi";

import { checkPresence } from "../../services/socket/socket";

import type { FriendUser } from "../../features/friends/types";

import { getMyRating, type RatingStats } from "../../services/api/ratingApi";

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

    borderRadius: theme.radius.md,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: theme.colors.surface,

    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  title: {
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

  ratingCard: {
    marginTop: theme.spacing.lg,

    padding: theme.spacing.lg,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    borderRadius: theme.radius.xl,

    borderWidth: 1,
    borderColor: theme.colors.border,

    backgroundColor: theme.colors.surface,
  },

  ratingCardLeft: {
    flex: 1,
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
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "800",
  },

  ratingMeta: {
    marginTop: 3,
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.xs,
  },

  ratingStats: {
    alignItems: "flex-end",
  },

  ratingStatsRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
  },

  ratingStatText: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.sm,
    
  },

  highestText: {
    marginTop: 4,
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.xs,
  },

  modeCard: {
    marginTop: theme.spacing.lg,

    padding: theme.spacing.xl,

    borderRadius: theme.radius.xxl,

    borderWidth: 1,
    borderColor: theme.colors.border,

    backgroundColor: theme.colors.surface,
  },

  modeHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  modeIcon: {
    width: 44,
    height: 44,

    borderRadius: theme.radius.lg,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: theme.colors.primarySoft,
  },

  modeDetails: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },

  modeTitle: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontExtraBold,
    fontSize: theme.typography.xl,
    
    includeFontPadding: false,
  },

  modeText: {
    marginTop: theme.spacing.xs,
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.sm,
    lineHeight: 19,
  },

  button: {
    height: 50,
    marginTop: theme.spacing.lg,

    borderRadius: theme.radius.lg,

    alignItems: "center",
    justifyContent: "center",
  },

  primaryButton: {
    backgroundColor: theme.colors.primary,
  },

  primaryText: {
    color: theme.colors.textInverse,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.md,
    
    includeFontPadding: false,
  },

  section: {
    marginTop: theme.spacing.xxl,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },

  sectionTitle: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontExtraBold,
    fontSize: theme.typography.lg,
    
    includeFontPadding: false,
  },

  sectionCount: {
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.xs,
  },

  requestCard: {
    marginBottom: theme.spacing.sm,

    padding: theme.spacing.lg,

    borderRadius: theme.radius.xl,

    borderWidth: 1,
    borderColor: theme.colors.primary,

    backgroundColor: theme.colors.surface,
  },

  requestHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  requestAvatar: {
    width: 44,
    height: 44,

    borderRadius: theme.radius.full,

    alignItems: "center",
    justifyContent: "center",

    overflow: "hidden",

    backgroundColor: theme.colors.primarySoft,
  },

  requestAvatarImage: {
    width: "100%",
    height: "100%",
  },

  requestAvatarText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontExtraBold,
    fontSize: theme.typography.md,
    
  },

  requestDetails: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },

  requestName: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.md,
    
    includeFontPadding: false,
  },

  requestUsername: {
    marginTop: 2,
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.xs,
  },

  requestMessage: {
    marginTop: theme.spacing.md,
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.sm,
    lineHeight: 19,
  },

  requestActions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },

  requestButton: {
    flex: 1,
    height: 42,

    borderRadius: theme.radius.md,

    alignItems: "center",
    justifyContent: "center",
  },

  accept: {
    backgroundColor: theme.colors.primary,
  },

  decline: {
    backgroundColor: theme.colors.primarySoft,

    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  acceptText: {
    color: theme.colors.textInverse,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.sm,
    
  },

  declineText: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.sm,
    
  },

  friendRow: {
    flexDirection: "row",
    alignItems: "center",

    minHeight: 70,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,

    borderWidth: 1,
    borderColor: theme.colors.border,

    borderRadius: theme.radius.xl,

    backgroundColor: theme.colors.surface,
  },

  avatar: {
    width: 46,
    height: 46,

    borderRadius: theme.radius.full,

    alignItems: "center",
    justifyContent: "center",

    overflow: "hidden",

    backgroundColor: theme.colors.primarySoft,
  },

  avatarImage: {
    width: "100%",
    height: "100%",
  },

  avatarText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontExtraBold,
    fontSize: theme.typography.md,
    
  },

  details: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },

  name: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.md,
    
    includeFontPadding: false,
  },

  username: {
    marginTop: 2,
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.xs,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },

  statusDot: {
    width: 7,
    height: 7,

    borderRadius: theme.radius.full,

    backgroundColor: theme.colors.success,

    marginRight: 5,
  },

  offlineDot: {
    backgroundColor: theme.colors.textMuted,
  },

  status: {
    color: theme.colors.success,
    fontFamily: theme.typography.fontSemiBold,
    fontSize: theme.typography.xs,
    
  },

  offline: {
    color: theme.colors.textMuted,
  },

  challengeButton: {
    minWidth: 82,
    height: 38,

    paddingHorizontal: theme.spacing.md,

    borderRadius: theme.radius.md,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: theme.colors.primary,
  },

  challengeText: {
    color: theme.colors.textInverse,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.xs,
    
    includeFontPadding: false,
  },

  emptyCard: {
    padding: theme.spacing.xl,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
    borderColor: theme.colors.border,

    borderRadius: theme.radius.xl,

    backgroundColor: theme.colors.surface,
  },

  emptyIcon: {
    width: 44,
    height: 44,

    borderRadius: theme.radius.full,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: theme.colors.primarySoft,
  },

  emptyTitle: {
    marginTop: theme.spacing.md,

    color: theme.colors.text,

    fontFamily: theme.typography.fontBold,

    fontSize: theme.typography.md,

    
  },

  emptyText: {
    marginTop: theme.spacing.xs,

    color: theme.colors.textMuted,

    fontFamily: theme.typography.fontRegular,

    fontSize: theme.typography.sm,

    lineHeight: 19,

    textAlign: "center",
  },

  loadingContainer: {
    paddingVertical: theme.spacing.xxl,

    alignItems: "center",
  },
}));

export default function BattleSelectScreen() {
  const { styles } = useStyles(stylesheet);

  const [friends, setFriends] = useState<FriendUser[]>([]);

  const [onlineFriends, setOnlineFriends] = useState<Set<string>>(new Set());

  const [invites, setInvites] = useState<BattleInvite[]>([]);

  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);

  const [loading, setLoading] = useState(true);

  const [ratingLoading, setRatingLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [sendingTo, setSendingTo] = useState<string | null>(null);

  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  const notifiedInviteIds = useRef<Set<string>>(new Set());

  const showIncomingInviteToast = useCallback((inviteList: BattleInvite[]) => {
    const newInvites = inviteList.filter(
      (invite) => !notifiedInviteIds.current.has(invite.id),
    );

    if (newInvites.length === 0) {
      return;
    }

    for (const invite of newInvites) {
      notifiedInviteIds.current.add(invite.id);
    }

    const invite = newInvites[0];

    const senderName =
      invite.sender.displayName ?? invite.sender.username ?? "A player";

    Toast.show({
      type: "info",

      text1: "Incoming battle challenge",

      text2: `${senderName} wants to play a 6×6 battle.`,

      visibilityTime: 5000,

      position: "top",
    });
  }, []);

  const load = useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setLoading(true);
      }

      setRatingLoading(true);

      /*
       * Load each resource independently.
       * One failed API must not destroy
       * the other sections.
       */
      let friendList: FriendUser[] = [];

      let inviteList: BattleInvite[] = [];

      try {
        try {
          const result = await getFriends();

          friendList = Array.isArray(result) ? result : [];

          setFriends(friendList);
        } catch (error) {
          console.error("[Battle Select] Friends API failed:", error);

          setFriends([]);

          Toast.show({
            type: "error",
            text1: "Could not load friends",
            text2: error instanceof Error ? error.message : "Please try again.",
            position: "top",
          });
        }

        try {
          inviteList = await getBattleInvites();

          setInvites(inviteList);

          showIncomingInviteToast(inviteList);
        } catch (error) {
          console.error("[Battle Select] Battle invites API failed:", error);

          setInvites([]);

          Toast.show({
            type: "error",
            text1: "Battle requests unavailable",
            text2: error instanceof Error ? error.message : "Please try again.",
            position: "top",
          });
        }

        try {
          const rating = await getMyRating("2x3");

          setRatingStats(rating);
        } catch (error) {
          console.error("[Battle Select] Rating API failed:", error);

          setRatingStats(null);

          Toast.show({
            type: "error",
            text1: "Rating unavailable",
            text2: error instanceof Error ? error.message : "Please try again.",
            position: "top",
          });
        }

        if (friendList.length === 0) {
          setOnlineFriends(new Set());

          return;
        }

        const statusResults = await Promise.all(
          friendList.map(async (friend) => {
            try {
              return {
                id: friend.id,
                online: await checkPresence(friend.id),
              };
            } catch {
              return {
                id: friend.id,
                online: false,
              };
            }
          }),
        );

        const onlineIds = new Set<string>();

        for (const result of statusResults) {
          if (result.online) {
            onlineIds.add(result.id);
          }
        }

        setOnlineFriends(onlineIds);
      } finally {
        setLoading(false);
        setRatingLoading(false);
      }
    },
    [showIncomingInviteToast],
  );

  useEffect(() => {
    void load();
  }, [load]);

  async function handleRefresh() {
    try {
      setRefreshing(true);

      await load(false);
    } finally {
      setRefreshing(false);
    }
  }

  async function challengeFriend(friendId: string) {
    if (sendingTo) {
      return;
    }

    try {
      setSendingTo(friendId);

      await sendBattleInvite(friendId, "2x3");

      Toast.show({
        type: "success",
        text1: "Battle request sent",
        text2: "Waiting for your friend to accept.",
        position: "top",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Battle request failed",
        text2: error instanceof Error ? error.message : "Please try again.",
        position: "top",
      });
    } finally {
      setSendingTo(null);
    }
  }

  async function acceptInvite(invite: BattleInvite) {
    if (respondingTo) {
      return;
    }

    try {
      setRespondingTo(invite.id);

      const battle = await acceptBattleInvite(invite.id);

      if (!battle || typeof battle.id !== "string" || battle.id.length === 0) {
        throw new Error("The server did not return a valid battle.");
      }

      setInvites((current) => current.filter((item) => item.id !== invite.id));

      notifiedInviteIds.current.delete(invite.id);

      router.replace({
        pathname: "/battle/game",

        params: {
          battleId: battle.id,
        },
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Could not accept battle",
        text2: error instanceof Error ? error.message : "Please try again.",
        position: "top",
      });
    } finally {
      setRespondingTo(null);
    }
  }

  async function declineInvite(inviteId: string) {
    if (respondingTo) {
      return;
    }

    try {
      setRespondingTo(inviteId);

      await declineBattleInvite(inviteId);

      setInvites((current) =>
        current.filter((invite) => invite.id !== inviteId),
      );

      notifiedInviteIds.current.delete(inviteId);

      Toast.show({
        type: "success",
        text1: "Battle request declined",
        position: "top",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Could not decline request",
        text2: error instanceof Error ? error.message : "Please try again.",
        position: "top",
      });
    } finally {
      setRespondingTo(null);
    }
  }

  const onlineCount = friends.filter((friend) =>
    onlineFriends.has(friend.id),
  ).length;

  const displayRating = ratingStats?.rating ?? 1000;

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "left", "right", "bottom"]}
    >
      <StatusBar style="auto" />

      <View style={styles.header}>
        <View style={styles.headerSide}>
          <Pressable
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
            onPress={() => router.back()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={19} color="#2563EB" />
          </Pressable>
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.title}>1v1 Battle</Text>

          <Text style={styles.headerSubtitle}>6×6 Sudoku</Text>
        </View>

        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <Text style={styles.intro}>
          Play against another player in real time. Choose online matchmaking or
          challenge one of your friends.
        </Text>

        <View style={styles.ratingCard}>
          <View style={styles.ratingCardLeft}>
            <Text style={styles.ratingLabel}>Your 6×6 Rating</Text>

            {ratingLoading ? (
              <ActivityIndicator
                size="small"
                style={{
                  marginTop: 8,
                  alignSelf: "flex-start",
                }}
              />
            ) : (
              <Text style={styles.ratingValue}>{displayRating}</Text>
            )}

            <Text style={styles.ratingMeta}>
              Rating is tracked separately for this mode.
            </Text>
          </View>

          <View style={styles.ratingStats}>
            <View style={styles.ratingStatsRow}>
              <Text style={styles.ratingStatText}>
                {ratingStats?.wins ?? 0}W
              </Text>

              <Text style={styles.ratingStatText}>
                {ratingStats?.losses ?? 0}L
              </Text>

              <Text style={styles.ratingStatText}>
                {ratingStats?.draws ?? 0}D
              </Text>
            </View>

            <Text style={styles.highestText}>
              Highest: {ratingStats?.highestRating ?? 1000}
            </Text>
          </View>
        </View>

        <View style={styles.modeCard}>
          <View style={styles.modeHeader}>
            <View style={styles.modeIcon}>
              <Ionicons name="globe-outline" size={22} color="#2563EB" />
            </View>

            <View style={styles.modeDetails}>
              <Text style={styles.modeTitle}>Play Online</Text>

              <Text style={styles.modeText}>
                Find a random opponent around your rating.
              </Text>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.primaryButton,

              pressed
                ? {
                    opacity: 0.8,
                  }
                : null,
            ]}
            onPress={() => router.push("/battle/matchmaking")}
          >
            <Text style={styles.primaryText}>Find Opponent</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Friends</Text>

            {!loading && friends.length > 0 ? (
              <Text style={styles.sectionCount}>{onlineCount} online</Text>
            ) : null}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator />
            </View>
          ) : friends.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <Ionicons name="people-outline" size={20} color="#2563EB" />
              </View>

              <Text style={styles.emptyTitle}>No friends yet</Text>

              <Text style={styles.emptyText}>
                Add friends first, then challenge them here.
              </Text>
            </View>
          ) : (
            friends.map((friend) => {
              const name = friend.displayName ?? friend.username ?? "Player";

              const online = onlineFriends.has(friend.id);

              const initial = name.trim().charAt(0).toUpperCase() || "P";

              const sending = sendingTo === friend.id;

              return (
                <View key={friend.id} style={styles.friendRow}>
                  <View style={styles.avatar}>
                    {friend.avatarUrl ? (
                      <Image
                        source={{
                          uri: friend.avatarUrl,
                        }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <Text style={styles.avatarText}>{initial}</Text>
                    )}
                  </View>

                  <View style={styles.details}>
                    <Text style={styles.name} numberOfLines={1}>
                      {name}
                    </Text>

                    {friend.username ? (
                      <Text style={styles.username} numberOfLines={1}>
                        @{friend.username}
                      </Text>
                    ) : null}

                    <View style={styles.statusRow}>
                      <View
                        style={[
                          styles.statusDot,
                          !online ? styles.offlineDot : null,
                        ]}
                      />

                      <Text
                        style={[styles.status, !online ? styles.offline : null]}
                      >
                        {online ? "Online" : "Offline"}
                      </Text>
                    </View>
                  </View>

                  {online ? (
                    <Pressable
                      disabled={sending}
                      style={({ pressed }) => [
                        styles.challengeButton,

                        pressed
                          ? {
                              opacity: 0.8,
                            }
                          : null,

                        sending
                          ? {
                              opacity: 0.55,
                            }
                          : null,
                      ]}
                      onPress={() => void challengeFriend(friend.id)}
                    >
                      {sending ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.challengeText}>Challenge</Text>
                      )}
                    </Pressable>
                  ) : null}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
