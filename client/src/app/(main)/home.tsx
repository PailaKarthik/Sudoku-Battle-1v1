import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { StatusBar } from "expo-status-bar";

import { createStyleSheet, useStyles } from "react-native-unistyles";

import HomeHeader from "../../components/home/HomeHeader";

import BattleCard from "../../components/home/BattleCard";

import DailyCard from "../../components/home/DailyCard";

import RecentGames from "../../components/home/RecentGames";

import ProfileSheet from "../../components/profile/ProfileSheet";

import { getTodayDaily } from "../../services/api/dailyApi";

import { getFriends } from "../../services/api/friendsApi";

import { setFriends } from "../../features/friends/friendsSlice";

import { useAppDispatch, useAppSelector } from "../../store/hooks";

type DailyChallengePreview = Awaited<ReturnType<typeof getTodayDaily>>;

const stylesheet = createStyleSheet((theme) => ({
  screen: {
    flex: 1,

    backgroundColor: theme.colors.background,
  },

  content: {
    flex: 1,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: theme.spacing.xxl,

    paddingTop: theme.spacing.xl,

    paddingBottom: theme.spacing.xxxl,
  },

  cards: {
    gap: theme.spacing.md,
  },

  loading: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: theme.colors.background,
  },

  error: {
    marginHorizontal: theme.spacing.xxl,

    marginTop: theme.spacing.md,

    padding: theme.spacing.md,

    borderRadius: theme.radius.md,

    color: theme.colors.error,

    backgroundColor: theme.colors.errorSoft,

    fontFamily: theme.typography.fontRegular,

    fontSize: theme.typography.sm,

    lineHeight: 19,
  },
}));

export default function HomeScreen() {
  const { styles } = useStyles(stylesheet);

  const [homeRefreshKey, setHomeRefreshKey] = useState(0);

  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);

  const friends = useAppSelector((state) => state.friends.friends);

  const [dailyChallenge, setDailyChallenge] =
    useState<DailyChallengePreview | null>(null);

  const [dailyError, setDailyError] = useState<string | null>(null);

  const [friendsError, setFriendsError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [profileVisible, setProfileVisible] = useState(false);

  const loadHome = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true);
        setHomeRefreshKey((prev) => prev + 1);
      } else {
        setLoading(true);
      }
      setDailyError(null);
      setFriendsError(null);

      try {
        try {
          const daily = await getTodayDaily("2x3");

          setDailyChallenge(daily);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to load daily challenge.";

          setDailyError(message);

          console.error("[Home] Daily API failed:", error);
        }

        try {
          const friendList = await getFriends();

          dispatch(setFriends(friendList));
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unable to load friends.";

          setFriendsError(message);

          console.error("[Home] Friends API failed:", error);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [dispatch],
  );

  useEffect(() => {
    void loadHome();
  }, [loadHome]);

  if (!user) {
    return (
      <SafeAreaView
        style={styles.loading}
        edges={["top", "bottom", "left", "right"]}
      >
        <ActivityIndicator />

        <Text style={styles.error}>Your session could not be loaded.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "left", "right", "bottom"]}
    >
      <StatusBar style={"auto"} />

      <View style={styles.content}>
        {/* Header is outside ScrollView */}
        <HomeHeader
          displayName={user.displayName ?? user.username ?? "Sudoku Player"}
          avatarUrl={user.avatarUrl}
          onProfilePress={() => setProfileVisible(true)}
        />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void loadHome(true)}
            />
          }
        >
          {dailyError ? (
            <Text style={styles.error}>Daily challenge: {dailyError}</Text>
          ) : null}

          {friendsError ? (
            <Text style={styles.error}>Friends: {friendsError}</Text>
          ) : null}

          <View style={styles.cards}>
            <BattleCard />

            <DailyCard
              challenge={dailyChallenge}
              loading={loading}
              error={dailyError}
            />

            <RecentGames refreshKey={homeRefreshKey} />
          </View>
        </ScrollView>
      </View>

      <ProfileSheet
        visible={profileVisible}
        displayName={user.displayName ?? user.username ?? "Sudoku Player"}
        username={user.username}
        avatarUrl={user.avatarUrl}
        friendsCount={friends.length}
        onClose={() => setProfileVisible(false)}
      />
    </SafeAreaView>
  );
}
