import { View, ViewProps, Pressable, StyleSheet } from 'react-native';
import { palette, radius, spacing, shadow } from '../theme';

interface Props extends ViewProps {
  padded?: boolean;
  glow?: string; // accent color for a subtle outer glow (use sparingly)
  onPress?: () => void;
  accent?: string; // a thin left accent rail
}

/** A surface panel. Hairline border + soft shadow. The visual unit everything sits in. */
export function Card({ padded = true, glow, accent, onPress, style, children, ...rest }: Props) {
  const body = (
    <View
      {...rest}
      style={[
        styles.card,
        padded && styles.padded,
        glow ? { borderColor: glow, ...shadow.glow(glow) } : shadow.card,
        accent != null && styles.withAccent,
        style,
      ]}
    >
      {accent != null && <View style={[styles.accentRail, { backgroundColor: accent }]} />}
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
  withAccent: { paddingLeft: spacing.xl + 3 },
  accentRail: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
});
