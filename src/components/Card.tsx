import { View, ViewProps, Pressable, StyleSheet } from 'react-native';
import { palette, radius, spacing } from '../theme';

interface Props extends ViewProps {
  padded?: boolean;
  onPress?: () => void;
  /** Kept for API compatibility; ignored in the flat design. */
  accent?: string;
  glow?: string;
}

/** A flat surface panel: subtle fill + hairline border. No shadow, no glow. */
export function Card({ padded = true, onPress, style, children, ...rest }: Props) {
  const body = (
    <View {...rest} style={[styles.card, padded && styles.padded, style]}>
      {children}
    </View>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {body}
      </Pressable>
    );
  }
  return body;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.hairline,
    overflow: 'hidden',
  },
  padded: { padding: spacing.xl },
  pressed: { opacity: 0.7 },
});
