import { useEffect, useRef } from "react";

import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { StatusBar } from "expo-status-bar";

import { router } from "expo-router";

import { createStyleSheet, useStyles } from "react-native-unistyles";

import Toast from "react-native-toast-message";

import { useAppDispatch, useAppSelector } from "../../store/hooks";

import {
  resetBattle,
  setBattleError,
  setMatched,
  setMatchmakingPosition,
  startMatching,
} from "../../features/battle/battleSlice";

import { connectSocket, leaveMatchmaking } from "../../services/socket/socket";

import { SOCKET_EVENTS } from "../../services/socket/events";

const stylesheet = createStyleSheet((theme) => ({
  screen: {
    flex: 1,

    backgroundColor: theme.colors.background,
  },

  content: {
    flex: 1,

    alignItems: "center",

    justifyContent: "center",

    padding: theme.spacing.xxl,
  },

  loader: {
    width: 88,
    height: 88,

    borderRadius: theme.radius.full,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: theme.colors.primarySoft,
  },

  title: {
    marginTop: theme.spacing.xxl,

    color: theme.colors.text,

    fontFamily: theme.typography.fontExtraBold,

    fontSize: theme.typography.hero,

    

    textAlign: "center",
  },

  subtitle: {
    marginTop: theme.spacing.sm,

    maxWidth: 300,

    color: theme.colors.textMuted,

    fontFamily: theme.typography.fontRegular,

    fontSize: theme.typography.md,

    lineHeight: 22,

    textAlign: "center",
  },

  rating: {
    marginTop: theme.spacing.lg,

    color: theme.colors.primary,

    fontFamily: theme.typography.fontBold,

    fontSize: theme.typography.md,

    
  },

  position: {
    marginTop: theme.spacing.sm,

    color: theme.colors.textMuted,

    fontFamily: theme.typography.fontRegular,

    fontSize: theme.typography.sm,
  },

  cancel: {
    marginTop: theme.spacing.xxxl,

    height: 50,

    minWidth: 130,

    paddingHorizontal: theme.spacing.xxl,

    borderRadius: theme.radius.lg,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: theme.colors.primarySoft,

    borderWidth: 1,

    borderColor: theme.colors.border,
  },

  cancelText: {
    color: theme.colors.text,

    fontFamily: theme.typography.fontBold,

    fontSize: theme.typography.md,

    
  },
}));

export default function MatchmakingScreen() {
  const { styles } = useStyles(stylesheet);

  const dispatch = useAppDispatch();

  const position = useAppSelector((state) => state.battle.matchmakingPosition);

  const userRating = useAppSelector(
    (state) => state.auth.user?.rating?.rating ?? 1000,
  );

  const stopped = useRef(false);

  useEffect(() => {
    let mounted = true;

    stopped.current = false;

    dispatch(startMatching("2x3"));

    let currentSocket: Awaited<ReturnType<typeof connectSocket>> | null = null;

    let cleanup: (() => void) | undefined;

    async function setup() {
      try {
        currentSocket = await connectSocket();

        if (!mounted) {
          return;
        }

        const onQueued = (data: { positionApproximate?: number }) => {
          if (typeof data?.positionApproximate === "number") {
            dispatch(setMatchmakingPosition(data.positionApproximate));
          }
        };

        const onMatched = (data: {
          battleId?: string;
          opponentId?: string;
        }) => {
          if (!data?.battleId || !data?.opponentId) {
            dispatch(setBattleError("Invalid matchmaking response."));

            return;
          }

          stopped.current = true;

          dispatch(
            setMatched({
              battleId: data.battleId,

              opponentId: data.opponentId,
            }),
          );

          router.replace({
            pathname: "/battle/game",

            params: {
              battleId: data.battleId,
            },
          });
        };

        const onCancelled = () => {
          dispatch(resetBattle());
        };

        const onException = (data: { message?: string }) => {
          if (!mounted) {
            return;
          }

          const message = data?.message ?? "Matchmaking failed.";

          dispatch(setBattleError(message));

          Toast.show({
            type: "error",

            text1: "Matchmaking failed",

            text2: message,

            position: "top",
          });
        };

        currentSocket.on(SOCKET_EVENTS.MATCHMAKING_QUEUED, onQueued);

        currentSocket.on(SOCKET_EVENTS.MATCHMAKING_MATCHED, onMatched);

        currentSocket.on(SOCKET_EVENTS.MATCHMAKING_CANCELLED, onCancelled);

        currentSocket.on("exception", onException);

        cleanup = () => {
          currentSocket?.off(SOCKET_EVENTS.MATCHMAKING_QUEUED, onQueued);

          currentSocket?.off(SOCKET_EVENTS.MATCHMAKING_MATCHED, onMatched);

          currentSocket?.off(SOCKET_EVENTS.MATCHMAKING_CANCELLED, onCancelled);

          currentSocket?.off("exception", onException);
        };

        /*
         * Only join after ALL listeners
         * are attached.
         */
        currentSocket.emit("matchmaking.join", {
          variant: "2x3",
        });
      } catch (error) {
        if (!mounted) {
          return;
        }

        const message =
          error instanceof Error
            ? error.message
            : "Unable to connect to matchmaking.";

        dispatch(setBattleError(message));

        Toast.show({
          type: "error",

          text1: "Connection failed",

          text2: message,

          position: "top",
        });
      }
    }

    void setup();

    return () => {
      mounted = false;

      cleanup?.();
    };
  }, [dispatch]);

  async function handleCancel() {
    if (stopped.current) {
      return;
    }

    stopped.current = true;

    try {
      await leaveMatchmaking("2x3");
    } catch (error) {
      console.error("[Matchmaking] Cancel failed:", error);
    } finally {
      dispatch(resetBattle());

      router.back();
    }
  }

  return (
    <SafeAreaView
      style={styles.screen}
      edges={["top", "left", "right", "bottom"]}
    >
      <StatusBar style="auto" />

      <View style={styles.content}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>

        <Text style={styles.title}>Finding opponent</Text>

        <Text style={styles.subtitle}>
          Looking for a player around your 6×6 rating.
        </Text>

        <Text style={styles.rating}>Rating: {userRating}</Text>

        {position !== null ? (
          <Text style={styles.position}>Players in queue: ~{position}</Text>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            styles.cancel,

            pressed
              ? {
                  opacity: 0.75,
                }
              : null,
          ]}
          onPress={() => void handleCancel()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
