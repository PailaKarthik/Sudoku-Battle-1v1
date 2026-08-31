import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { createStyleSheet, useStyles } from "react-native-unistyles";

import type { FriendUser } from "../../features/friends/types";

const stylesheet = createStyleSheet((theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.md,
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primarySoft,
  },

  avatarText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.lg,
    
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

  removeButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primarySoft,
  },

  removeText: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.xs,
    
  },
}));

type Props = {
  friend: FriendUser;
  removing: boolean;
  onRemove: () => void;
};

export default function FriendItem({ friend, removing, onRemove }: Props) {
  const { styles } = useStyles(stylesheet);

  const name = friend.displayName ?? friend.username ?? "User";

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{name.charAt(0).toUpperCase()}</Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>

        {friend.username ? (
          <Text style={styles.username}>@{friend.username}</Text>
        ) : null}
      </View>

      <Pressable
        disabled={removing}
        onPress={onRemove}
        style={styles.removeButton}
      >
        {removing ? (
          <ActivityIndicator size="small" />
        ) : (
          <Text style={styles.removeText}>Remove</Text>
        )}
      </Pressable>
    </View>
  );
}
