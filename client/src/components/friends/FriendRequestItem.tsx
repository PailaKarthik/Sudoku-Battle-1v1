import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { createStyleSheet, useStyles } from "react-native-unistyles";

import type { FriendRequest } from "../../features/friends/types";

const stylesheet = createStyleSheet((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
  },

  avatar: {
    width: 46,
    height: 46,
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

  actions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },

  accept: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },

  decline: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primarySoft,
  },

  acceptText: {
    color: theme.colors.textInverse,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.xs,
    
  },

  declineText: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.xs,
    
  },
}));

type Props = {
  request: FriendRequest;
  loading: boolean;
  onAccept: () => void;
  onDecline: () => void;
};

export default function FriendRequestItem({
  request,
  loading,
  onAccept,
  onDecline,
}: Props) {
  const { styles } = useStyles(stylesheet);

  const name = request.sender.displayName ?? request.sender.username ?? "User";

  const initial = name.charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>

        {request.sender.username ? (
          <Text style={styles.username}>@{request.sender.username}</Text>
        ) : null}
      </View>

      {loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <View style={styles.actions}>
          <Pressable onPress={onAccept} style={styles.accept}>
            <Text style={styles.acceptText}>Accept</Text>
          </Pressable>

          <Pressable onPress={onDecline} style={styles.decline}>
            <Text style={styles.declineText}>Decline</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
