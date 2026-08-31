import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { createStyleSheet, useStyles } from "react-native-unistyles";

import { searchUsers, sendFriendRequest } from "../../services/api/friendsApi";

import type { FriendUser } from "../../features/friends/types";

import Toast from "react-native-toast-message";

const stylesheet = createStyleSheet((theme) => ({
  container: {
    gap: theme.spacing.md,
  },

  input: {
    height: 52,
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.inputBackground,
    color: theme.colors.text,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.md,
  },

  result: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primarySoft,
  },

  avatarText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontRegular,
    fontWeight: "700",
  },

  details: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },

  name: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.md,
    
  },

  username: {
    marginTop: 2,
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.sm,
  },

  addButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },

  addText: {
    color: theme.colors.textInverse,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.sm,
    
  },

  empty: {
    paddingVertical: theme.spacing.xl,
  },

  emptyText: {
    color: theme.colors.textMuted,
    fontFamily: theme.typography.fontRegular,
    fontSize: theme.typography.sm,
    textAlign: "center",
  },
}));

type Props = {
  onRequestSent?: () => void;
};

export default function FriendSearch({ onRequestSent }: Props) {
  const { styles } = useStyles(stylesheet);

  const [query, setQuery] = useState("");

  const [results, setResults] = useState<FriendUser[]>([]);

  const [loading, setLoading] = useState(false);

  const [sendingUserId, setSendingUserId] = useState<string | null>(null);

  useEffect(() => {
    const value = query.trim();

    if (!value) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setLoading(true);

        const users = await searchUsers(value);

        setResults(users);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Search failed",
          text2:
            error instanceof Error ? error.message : "Unable to search users",
        });
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(timeout);
    };
  }, [query]);

  async function handleSend(user: FriendUser) {
    if (sendingUserId) {
      return;
    }

    try {
      setSendingUserId(user.id);

      await sendFriendRequest(user.id);

      Toast.show({
        type: "success",
        text1: "Friend request sent",
        text2: user.displayName ?? user.username ?? "User",
      });

      onRequestSent?.();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Could not send request",
        text2: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setSendingUserId(null);
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="Search by user ID or username"
        placeholderTextColor="#94a3b8"
        style={styles.input}
      />

      {loading ? <ActivityIndicator /> : null}

      {!loading && query.trim() && results.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No users found</Text>
        </View>
      ) : null}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => {
          const label = item.displayName ?? item.username ?? "User";

          const initial = label.charAt(0).toUpperCase();

          const sending = sendingUserId === item.id;

          return (
            <View style={styles.result}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>

              <View style={styles.details}>
                <Text style={styles.name} numberOfLines={1}>
                  {label}
                </Text>

                {item.username ? (
                  <Text style={styles.username}>@{item.username}</Text>
                ) : null}
              </View>

              <Pressable
                disabled={sending}
                onPress={() => handleSend(item)}
                style={styles.addButton}
              >
                {sending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.addText}>Add</Text>
                )}
              </Pressable>
            </View>
          );
        }}
      />
    </View>
  );
}
