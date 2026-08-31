import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { StatusBar } from "expo-status-bar";

import { Ionicons } from "@expo/vector-icons";

import { router } from "expo-router";

import { createStyleSheet, useStyles } from "react-native-unistyles";

import Toast from "react-native-toast-message";

import FriendSearch from "../../components/friends/FriendSearch";

import FriendItem from "../../components/friends/FriendItem";

import FriendRequestItem from "../../components/friends/FriendRequestItem";

import {
  acceptFriendRequest,
  declineFriendRequest,
  getFriendRequests,
  getFriends,
  removeFriend,
} from "../../services/api/friendsApi";

import {
  setFriends,
  setRequests,
  setLoading,
  setError,
} from "../../features/friends/friendsSlice";

import { useAppDispatch, useAppSelector } from "../../store/hooks";

const stylesheet = createStyleSheet((theme) => ({
  screen: {
    flex: 1,

    backgroundColor: theme.colors.background,
  },

  content: {
    flex: 1,
  },

  header: {
    minHeight: 64,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: theme.spacing.xxl,

    paddingVertical: theme.spacing.md,

    backgroundColor: theme.colors.background,

    borderBottomWidth: 1,

    borderBottomColor: theme.colors.border,

    elevation: 4,

    zIndex: 10,
  },

  headerSide: {
    width: 42,

    alignItems: "flex-start",

    justifyContent: "center",
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

  headerCenter: {
    flex: 1,

    alignItems: "center",

    justifyContent: "center",

    paddingHorizontal: theme.spacing.md,
  },

  title: {
    color: theme.colors.text,

    fontFamily: theme.typography.fontExtraBold,

    fontSize: theme.typography.xl,

    

    lineHeight: 25,

    includeFontPadding: false,
  },

  count: {
    marginTop: 3,

    color: theme.colors.textMuted,

    fontFamily: theme.typography.fontRegular,

    fontSize: theme.typography.xs,

    lineHeight: 16,

    includeFontPadding: false,
  },

  list: {
    flex: 1,
  },

  listContent: {
    paddingBottom: theme.spacing.xxxl,
  },

  searchSection: {
    paddingHorizontal: theme.spacing.xxl,

    paddingTop: theme.spacing.xl,
  },

  section: {
    marginTop: theme.spacing.xl,

    paddingHorizontal: theme.spacing.xxl,
  },

  sectionTitle: {
    marginBottom: theme.spacing.md,

    color: theme.colors.text,

    fontFamily: theme.typography.fontExtraBold,

    fontSize: theme.typography.lg,

    
  },

  sectionCard: {
    overflow: "hidden",

    borderWidth: 1,

    borderColor: theme.colors.border,

    borderRadius: theme.radius.xl,

    backgroundColor: theme.colors.surface,

    paddingHorizontal: theme.spacing.lg,
  },

  emptyCard: {
    paddingVertical: theme.spacing.xl,

    alignItems: "center",

    justifyContent: "center",
  },

  emptyTitle: {
    color: theme.colors.text,

    fontFamily: theme.typography.fontBold,

    fontSize: theme.typography.md,

    

    textAlign: "center",
  },

  emptyText: {
    marginTop: theme.spacing.xs,

    color: theme.colors.textMuted,

    fontFamily: theme.typography.fontRegular,

    fontSize: theme.typography.sm,

    lineHeight: 19,

    textAlign: "center",
  },

  error: {
    marginHorizontal: theme.spacing.xxl,

    marginTop: theme.spacing.md,

    padding: theme.spacing.md,

    borderRadius: theme.radius.md,

    backgroundColor: theme.colors.errorSoft,

    color: theme.colors.error,

    fontFamily: theme.typography.fontRegular,

    fontSize: theme.typography.sm,

    lineHeight: 19,
  },

  friendContainer: {
    marginHorizontal: theme.spacing.xxl,

    marginTop: theme.spacing.sm,
  },

  friendCard: {
    overflow: "hidden",

    borderWidth: 1,

    borderColor: theme.colors.border,

    borderRadius: theme.radius.xl,

    backgroundColor: theme.colors.surface,

    paddingHorizontal: theme.spacing.lg,
  },

  footer: {
    height: theme.spacing.xl,
  },
}));

export default function FriendsScreen() {
  const { styles } = useStyles(stylesheet);

  const dispatch = useAppDispatch();

  const { friends, requests, loading, error } = useAppSelector(
    (state) => state.friends,
  );

  const [refreshing, setRefreshing] = useState(false);

  const [requestActionId, setRequestActionId] = useState<string | null>(null);

  const [removingFriendId, setRemovingFriendId] = useState<string | null>(null);

  const loadData = useCallback(
    async (showSpinner = true) => {
      try {
        if (showSpinner) {
          dispatch(setLoading(true));
        }

        const [friendList, requestList] = await Promise.all([
          getFriends(),
          getFriendRequests(),
        ]);

        dispatch(setFriends(friendList));

        dispatch(setRequests(requestList));

        dispatch(setError(null));
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : "Unable to load friends.";

        dispatch(setError(message));

        Toast.show({
          type: "error",
          text1: "Could not load friends",
          text2: message,
        });
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch],
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleRefresh() {
    try {
      setRefreshing(true);

      await loadData(false);
    } finally {
      setRefreshing(false);
    }
  }

  async function handleAccept(requestId: string) {
    if (requestActionId) {
      return;
    }

    try {
      setRequestActionId(requestId);

      await acceptFriendRequest(requestId);

      Toast.show({
        type: "success",
        text1: "Friend request accepted",
      });

      await loadData(false);
    } catch (requestError) {
      Toast.show({
        type: "error",
        text1: "Could not accept request",
        text2:
          requestError instanceof Error
            ? requestError.message
            : "Please try again.",
      });
    } finally {
      setRequestActionId(null);
    }
  }

  async function handleDecline(requestId: string) {
    if (requestActionId) {
      return;
    }

    try {
      setRequestActionId(requestId);

      await declineFriendRequest(requestId);

      Toast.show({
        type: "success",
        text1: "Friend request declined",
      });

      await loadData(false);
    } catch (requestError) {
      Toast.show({
        type: "error",
        text1: "Could not decline request",
        text2:
          requestError instanceof Error
            ? requestError.message
            : "Please try again.",
      });
    } finally {
      setRequestActionId(null);
    }
  }

  async function handleRemove(friendId: string) {
    if (removingFriendId) {
      return;
    }

    try {
      setRemovingFriendId(friendId);

      await removeFriend(friendId);

      Toast.show({
        type: "success",
        text1: "Friend removed",
      });

      await loadData(false);
    } catch (requestError) {
      Toast.show({
        type: "error",
        text1: "Could not remove friend",
        text2:
          requestError instanceof Error
            ? requestError.message
            : "Please try again.",
      });
    } finally {
      setRemovingFriendId(null);
    }
  }

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "left", "right", "bottom"]}
    >
      <StatusBar style="auto" />

      <View style={styles.content}>
        {/* Fixed header */}
        <View style={styles.header}>
          <View style={styles.headerSide}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
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
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={19} color={"#2563EB"} />
            </Pressable>
          </View>

          <View style={styles.headerCenter}>
            <Text style={styles.title}>Friends</Text>

            <Text style={styles.count}>
              {friends.length} {friends.length === 1 ? "friend" : "friends"}
            </Text>
          </View>

          <View
            style={[
              styles.headerSide,
              {
                alignItems: "flex-end",
              },
            ]}
          />
        </View>

        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListHeaderComponent={
            <>
              {/* Search */}
              <View style={styles.searchSection}>
                <FriendSearch onRequestSent={() => void loadData(false)} />
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              {/* Requests */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Friend requests</Text>

                <View style={styles.sectionCard}>
                  {requests.length === 0 ? (
                    <View style={styles.emptyCard}>
                      <Text style={styles.emptyTitle}>No pending requests</Text>

                      <Text style={styles.emptyText}>
                        New friend requests will appear here.
                      </Text>
                    </View>
                  ) : (
                    requests.map((request) => (
                      <FriendRequestItem
                        key={request.id}
                        request={request}
                        loading={requestActionId === request.id}
                        onAccept={() => void handleAccept(request.id)}
                        onDecline={() => void handleDecline(request.id)}
                      />
                    ))
                  )}
                </View>
              </View>

              {/* Friends section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your friends</Text>

                {friends.length === 0 && !loading ? (
                  <View style={styles.sectionCard}>
                    <View style={styles.emptyCard}>
                      <Text style={styles.emptyTitle}>Build your squad</Text>

                      <Text style={styles.emptyText}>
                        Search for a player above to send your first friend
                        request.
                      </Text>
                    </View>
                  </View>
                ) : null}
              </View>
            </>
          }
          renderItem={({ item }) => (
            <View style={styles.friendContainer}>
              <View style={styles.friendCard}>
                <FriendItem
                  friend={item}
                  removing={removingFriendId === item.id}
                  onRemove={() => void handleRemove(item.id)}
                />
              </View>
            </View>
          )}
          ListFooterComponent={<View style={styles.footer} />}
          ListEmptyComponent={
            loading ? (
              <View
                style={[
                  styles.emptyCard,
                  {
                    marginHorizontal: 24,
                  },
                ]}
              >
                <ActivityIndicator />
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
}
