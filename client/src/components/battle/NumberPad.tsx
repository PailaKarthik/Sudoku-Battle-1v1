import { Pressable, Text, View } from "react-native";

import { createStyleSheet, useStyles } from "react-native-unistyles";

const stylesheet = createStyleSheet((theme) => ({
  container: {
    marginTop: theme.spacing.xl,
    gap: theme.spacing.sm,
  },

  row: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },

  button: {
    flex: 1,
    height: 48,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },

  text: {
    color: theme.colors.text,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.lg,
    
  },

  erase: {
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primarySoft,
  },

  eraseText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontBold,
    fontSize: theme.typography.sm,
    
  },
}));

type Props = {
  size: number;
  onNumber: (value: number) => void;
  onErase: () => void;
};

export default function NumberPad({ size, onNumber, onErase }: Props) {
  const { styles } = useStyles(stylesheet);

  const numbers = Array.from(
    {
      length: size,
    },
    (_, index) => index + 1,
  );

  return (
    <View style={styles.container}>
      {Array.from(
        {
          length: Math.ceil(numbers.length / 3),
        },
        (_, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {numbers.slice(rowIndex * 3, rowIndex * 3 + 3).map((number) => (
              <Pressable
                key={number}
                style={styles.button}
                onPress={() => onNumber(number)}
              >
                <Text style={styles.text}>{number}</Text>
              </Pressable>
            ))}
          </View>
        ),
      )}

      <Pressable style={styles.erase} onPress={onErase}>
        <Text style={styles.eraseText}>Erase</Text>
      </Pressable>
    </View>
  );
}
