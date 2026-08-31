import { useEffect, useRef, useState } from "react";

import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";

import { Stack, SplashScreen, router } from "expo-router";

import { Provider } from "react-redux";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Ionicons } from "@expo/vector-icons";

import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/outfit";

import { UnistylesRuntime } from "react-native-unistyles";

import Toast from "react-native-toast-message";

import { store } from "../store";

import { useAppDispatch, useAppSelector } from "../store/hooks";

import { getCurrentUser, hasSession } from "../services/api/authApi";

import { clearAuth, setInitialized, setUser } from "../features/auth/authSlice";

import { setProfile } from "../features/user/userSlice";

import { configureGoogleSignIn } from "../services/api/googleAuth";

import { getThemePreference } from "../theme/themeStorage";

import { connectSocket, disconnectSocket } from "../services/socket/socket";

import { SOCKET_EVENTS } from "../services/socket/events";

import {
  acceptBattleInvite,
  declineBattleInvite,
} from "../services/api/battleApi";

import "../theme/unistyles";

SplashScreen.preventAutoHideAsync();

type BattleInviteNotification = {
  inviteId: string;

  sender: {
    id: string;

    username: string | null;

    displayName: string | null;

    avatarUrl: string | null;
  };

  variant: "TWO_BY_THREE" | "THREE_BY_THREE";

  expiresAt: string;
};

function RootNavigator() {
  const dispatch = useAppDispatch();

  const insets = useSafeAreaInsets();

  const { initialized, isAuthenticated, user } = useAppSelector(
    (state) => state.auth,
  );

  const [incomingInvite, setIncomingInvite] =
    useState<BattleInviteNotification | null>(null);

  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const [inviteActionLoading, setInviteActionLoading] = useState<
    "accept" | "decline" | null
  >(null);

  const incomingInviteRef = useRef<BattleInviteNotification | null>(null);

  const handledInviteIds = useRef<Set<string>>(new Set());

  /*
   * ---------------------------------------------------------
   * APP INITIALIZATION
   * ---------------------------------------------------------
   */

  useEffect(() => {
    let mounted = true;

    async function initializeApp() {
      try {
        configureGoogleSignIn();

        const themePreference = await getThemePreference();

        if (!mounted) {
          return;
        }

        if (themePreference === "system") {
          if (!UnistylesRuntime.hasAdaptiveThemes) {
            UnistylesRuntime.setAdaptiveThemes(true);
          }
        } else {
          if (UnistylesRuntime.hasAdaptiveThemes) {
            UnistylesRuntime.setAdaptiveThemes(false);
          }

          UnistylesRuntime.setTheme(themePreference);
        }

        const session = await hasSession();

        if (session && mounted) {
          try {
            const currentUser = await getCurrentUser();

            if (!mounted) {
              return;
            }

            dispatch(setUser(currentUser));

            dispatch(setProfile(currentUser));
          } catch {
            dispatch(clearAuth());
          }
        }
      } catch {
        if (mounted) {
          dispatch(clearAuth());
        }
      } finally {
        if (mounted) {
          dispatch(setInitialized(true));

          await SplashScreen.hideAsync();
        }
      }
    }

    void initializeApp();

    return () => {
      mounted = false;
    };
  }, [dispatch]);

  /*
   * ---------------------------------------------------------
   * GLOBAL BATTLE SOCKET
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!initialized || !isAuthenticated) {
      incomingInviteRef.current = null;

      setIncomingInvite(null);

      setRemainingSeconds(0);

      setInviteActionLoading(null);

      disconnectSocket();

      return;
    }

    let mounted = true;

    let currentSocket: Awaited<ReturnType<typeof connectSocket>> | null = null;

    async function setupBattleSocket() {
      try {
        currentSocket = await connectSocket();

        if (!mounted) {
          return;
        }

        /*
         * =====================================================
         * RECEIVER: NEW INVITE
         * =====================================================
         */

        const handleInviteReceived = (data: BattleInviteNotification) => {
          if (!data?.inviteId || !data?.expiresAt || !data?.sender) {
            return;
          }

          if (handledInviteIds.current.has(data.inviteId)) {
            return;
          }

          const expiryTime = new Date(data.expiresAt).getTime();

          if (!Number.isFinite(expiryTime)) {
            return;
          }

          if (expiryTime <= Date.now()) {
            handledInviteIds.current.add(data.inviteId);

            return;
          }

          handledInviteIds.current.add(data.inviteId);

          incomingInviteRef.current = data;

          setIncomingInvite(data);

          setInviteActionLoading(null);

          setRemainingSeconds(
            Math.max(1, Math.ceil((expiryTime - Date.now()) / 1000)),
          );
        };

        /*
         * =====================================================
         * SENDER + RECEIVER: INVITE UPDATED
         * =====================================================
         *
         * IMPORTANT:
         *
         * battle.invite.updated is emitted by the
         * backend specifically to the SENDER.
         *
         * Therefore, when we receive ACCEPTED here,
         * this client is the person who originally
         * sent the challenge.
         */

        const handleInviteUpdated = (data: {
          inviteId?: string;
          status?: "ACCEPTED" | "DECLINED" | "EXPIRED";
          battleId?: string;
        }) => {
          if (!data?.inviteId || !data?.status) {
            return;
          }

          /*
           * If an invitation banner is somehow
           * displaying this same invite, close it.
           */
          if (incomingInviteRef.current?.inviteId === data.inviteId) {
            incomingInviteRef.current = null;

            setIncomingInvite(null);

            setRemainingSeconds(0);

            setInviteActionLoading(null);
          }

          /*
           * SENDER:
           *
           * ACCEPTED means the other player
           * accepted our challenge.
           */
          if (data.status === "ACCEPTED") {
            if (!data.battleId) {
              Toast.show({
                type: "error",
                text1: "Battle created",
                text2:
                  "The battle ID was not received. Please open Battles and try again.",
                position: "top",
              });

              return;
            }

            Toast.show({
              type: "success",

              text1: "Battle accepted",

              text2: "Your opponent accepted the challenge.",

              position: "top",

              visibilityTime: 2000,
            });

            router.replace({
              pathname: "/battle/game",

              params: {
                battleId: data.battleId,
              },
            });

            return;
          }

          if (data.status === "DECLINED") {
            Toast.show({
              type: "info",

              text1: "Battle declined",

              text2: "Your friend declined the challenge.",

              position: "top",

              visibilityTime: 3000,
            });

            return;
          }

          if (data.status === "EXPIRED") {
            Toast.show({
              type: "info",

              text1: "Challenge expired",

              text2: "Your friend did not respond within 10 seconds.",

              position: "top",

              visibilityTime: 3000,
            });

            return;
          }
        };

        /*
         * Socket errors should never crash
         * navigation or the application.
         */
        const handleSocketError = (error: unknown) => {
          console.error("[Global Battle Socket] Error:", error);
        };

        currentSocket.on(
          SOCKET_EVENTS.BATTLE_INVITE_RECEIVED,
          handleInviteReceived,
        );

        currentSocket.on(
          SOCKET_EVENTS.BATTLE_INVITE_UPDATED,
          handleInviteUpdated,
        );

        currentSocket.on("connect_error", handleSocketError);

        return () => {
          currentSocket?.off(
            SOCKET_EVENTS.BATTLE_INVITE_RECEIVED,
            handleInviteReceived,
          );

          currentSocket?.off(
            SOCKET_EVENTS.BATTLE_INVITE_UPDATED,
            handleInviteUpdated,
          );

          currentSocket?.off("connect_error", handleSocketError);
        };
      } catch (error) {
        if (!mounted) {
          return;
        }

        console.error("[Global Battle Socket] Connection failed:", error);
      }
    }

    let cleanup: (() => void) | undefined;

    void setupBattleSocket().then((value) => {
      cleanup = value;
    });

    return () => {
      mounted = false;

      cleanup?.();
    };
  }, [initialized, isAuthenticated]);

  /*
   * ---------------------------------------------------------
   * INVITE COUNTDOWN
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (!incomingInvite) {
      return;
    }

    const expiryTime = new Date(incomingInvite.expiresAt).getTime();

    const updateCountdown = () => {
      const seconds = Math.max(0, Math.ceil((expiryTime - Date.now()) / 1000));

      setRemainingSeconds(seconds);

      if (seconds <= 0 && !inviteActionLoading) {
        incomingInviteRef.current = null;

        setIncomingInvite(null);

        setRemainingSeconds(0);
      }
    };

    updateCountdown();

    const timer = setInterval(updateCountdown, 250);

    return () => {
      clearInterval(timer);
    };
  }, [incomingInvite, inviteActionLoading]);

  /*
   * ---------------------------------------------------------
   * ACCEPT RECEIVED INVITE
   * ---------------------------------------------------------
   */

  async function handleAcceptInvite() {
    const invite = incomingInviteRef.current;

    if (!invite || inviteActionLoading) {
      return;
    }

    if (remainingSeconds <= 0) {
      incomingInviteRef.current = null;

      setIncomingInvite(null);

      setRemainingSeconds(0);

      return;
    }

    try {
      setInviteActionLoading("accept");

      const battle = await acceptBattleInvite(invite.inviteId);

      incomingInviteRef.current = null;

      setIncomingInvite(null);

      setRemainingSeconds(0);

      setInviteActionLoading(null);

      router.replace({
        pathname: "/battle/game",

        params: {
          battleId: battle.id,
        },
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to accept battle invitation.";

      console.error("[Global Battle Invite] Accept failed:", error);

      incomingInviteRef.current = null;

      setIncomingInvite(null);

      setRemainingSeconds(0);

      setInviteActionLoading(null);

      Toast.show({
        type: "error",

        text1: "Unable to accept battle",

        text2: message,

        position: "top",
      });
    }
  }

  /*
   * ---------------------------------------------------------
   * DECLINE RECEIVED INVITE
   * ---------------------------------------------------------
   */

  async function handleDeclineInvite() {
    const invite = incomingInviteRef.current;

    if (!invite || inviteActionLoading) {
      return;
    }

    try {
      setInviteActionLoading("decline");

      await declineBattleInvite(invite.inviteId);

      incomingInviteRef.current = null;

      setIncomingInvite(null);

      setRemainingSeconds(0);

      setInviteActionLoading(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to decline battle invitation.";

      console.error("[Global Battle Invite] Decline failed:", error);

      incomingInviteRef.current = null;

      setIncomingInvite(null);

      setRemainingSeconds(0);

      setInviteActionLoading(null);

      Toast.show({
        type: "error",

        text1: "Unable to decline battle",

        text2: message,

        position: "top",
      });
    }
  }

  /*
   * ---------------------------------------------------------
   * NAVIGATION
   * ---------------------------------------------------------
   */

  if (!initialized) {
    return null;
  }

  const inviteSenderName =
    incomingInvite?.sender.displayName ??
    incomingInvite?.sender.username ??
    "Player";

  const inviteInitial = inviteSenderName.trim().charAt(0).toUpperCase() || "P";

  const variantLabel =
    incomingInvite?.variant === "THREE_BY_THREE" ? "9×9 Sudoku" : "6×6 Sudoku";

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />

        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        <Stack.Protected
          guard={isAuthenticated && user?.profileCompleted === false}
        >
          <Stack.Screen name="(onboarding)" />
        </Stack.Protected>

        <Stack.Protected
          guard={isAuthenticated && user?.profileCompleted === true}
        >
          <Stack.Screen name="(main)" />

          <Stack.Screen name="friends" />

          <Stack.Screen name="daily" />

          <Stack.Screen name="battle" />
        </Stack.Protected>
      </Stack>

      {/* =====================================================
          GLOBAL INCOMING BATTLE INVITE
          ===================================================== */}

      {incomingInvite ? (
        <View
          pointerEvents="box-none"
          style={{
            position: "absolute",

            top: 0,
            left: 0,
            right: 0,

            zIndex: 1000,

            elevation: 1000,

            paddingTop: insets.top + 8,

            paddingHorizontal: 12,
          }}
        >
          <View
            style={{
              borderRadius: 18,

              padding: 14,

              backgroundColor: "#111827",

              shadowColor: "#000000",

              shadowOffset: {
                width: 0,
                height: 6,
              },

              shadowOpacity: 0.22,

              shadowRadius: 14,

              elevation: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",

                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 46,
                  height: 46,

                  borderRadius: 23,

                  alignItems: "center",

                  justifyContent: "center",

                  overflow: "hidden",

                  backgroundColor: "#DBEAFE",
                }}
              >
                {incomingInvite.sender.avatarUrl ? (
                  <Image
                    source={{
                      uri: incomingInvite.sender.avatarUrl,
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                    }}
                  />
                ) : (
                  <Text
                    style={{
                      color: "#2563EB",

                      fontSize: 18,
                      fontFamily: "Outfit_700Bold",
                    }}
                  >
                    {inviteInitial}
                  </Text>
                )}
              </View>

              <View
                style={{
                  flex: 1,

                  marginLeft: 12,
                }}
              >
                <Text
                  style={{
                    color: "#FFFFFF",

                    fontSize: 15,
                    fontFamily: "Outfit_700Bold",
                  }}
                  numberOfLines={1}
                >
                  Battle Challenge
                </Text>

                <Text
                  style={{
                    marginTop: 3,

                    color: "#D1D5DB",

                    fontSize: 13,
                    fontFamily: "Outfit_400Regular",

                    lineHeight: 18,
                  }}
                  numberOfLines={2}
                >
                  {inviteSenderName} wants to challenge you to {variantLabel}.
                </Text>
              </View>

              <View
                style={{
                  minWidth: 42,

                  alignItems: "center",

                  justifyContent: "center",

                  marginLeft: 8,
                }}
              >
                <Text
                  style={{
                    color: remainingSeconds <= 3 ? "#FCA5A5" : "#FFFFFF",

                    fontSize: 16,
                    fontFamily: "Outfit_700Bold",
                  }}
                >
                  {remainingSeconds}s
                </Text>
              </View>
            </View>

            <View
              style={{
                height: 4,

                marginTop: 12,

                overflow: "hidden",

                borderRadius: 2,

                backgroundColor: "#374151",
              }}
            >
              <View
                style={{
                  height: "100%",

                  width: `${Math.max(
                    0,
                    Math.min(100, (remainingSeconds / 10) * 100),
                  )}%`,

                  backgroundColor:
                    remainingSeconds <= 3 ? "#EF4444" : "#3B82F6",
                }}
              />
            </View>

            <View
              style={{
                flexDirection: "row",

                gap: 8,

                marginTop: 12,
              }}
            >
              <Pressable
                disabled={inviteActionLoading !== null}
                onPress={handleDeclineInvite}
                style={({ pressed }) => ({
                  flex: 1,

                  height: 42,

                  alignItems: "center",

                  justifyContent: "center",

                  borderRadius: 10,

                  backgroundColor: "#374151",

                  opacity:
                    inviteActionLoading === "accept" ? 0.55 : pressed ? 0.8 : 1,
                })}
              >
                {inviteActionLoading === "decline" ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text
                    style={{
                      color: "#FFFFFF",

                      fontSize: 13,
                      fontFamily: "Outfit_600SemiBold",
                    }}
                  >
                    Decline
                  </Text>
                )}
              </Pressable>

              <Pressable
                disabled={inviteActionLoading !== null || remainingSeconds <= 0}
                onPress={handleAcceptInvite}
                style={({ pressed }) => ({
                  flex: 1,

                  height: 42,

                  alignItems: "center",

                  justifyContent: "center",

                  borderRadius: 10,

                  backgroundColor: "#2563EB",

                  opacity:
                    inviteActionLoading === "decline" || remainingSeconds <= 0
                      ? 0.55
                      : pressed
                        ? 0.8
                        : 1,
                })}
              >
                {inviteActionLoading === "accept" ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text
                    style={{
                      color: "#FFFFFF",

                      fontSize: 13,
                      fontFamily: "Outfit_700Bold",
                    }}
                  >
                    Accept
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
}
