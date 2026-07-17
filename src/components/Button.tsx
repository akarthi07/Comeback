import { Pressable, StyleSheet, View, ActivityIndicator } from 'react-native';
import { palette, radius, spacing } from '../theme';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'lg' | 'md' | 'sm';

interface Props {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  full?: boolean;
  left?: React.ReactNode;
}

const pad: Record<Size, { v: number; h: number; font: 'title' | 'bodyStrong' | 'label' }> = {
  lg: { v: 14, h: 20, font: 'bodyStrong' },
  md: { v: 10, h: 16, font: 'bodyStrong' },
  sm: { v: 7, h: 12, font: 'label' },
};

/** Flat pill button. Primary = subtle filled surface + hairline (monochrome look). */
export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled,
  loading,
  full,
  left,
}: Props) {
  const p = pad[size];
  const isPrimary = variant === 'primary';
  const isGhost = variant === 'ghost';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        { paddingVertical: p.v, paddingHorizontal: p.h },
        full && styles.full,
        isPrimary && styles.primary,
        variant === 'secondary' && styles.secondary,
        isGhost && styles.ghost,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? palette.ink : palette.textHi} />
      ) : (
        <View style={styles.row}>
          {left}
          <Text
            variant={p.font}
            style={{ color: isGhost ? palette.textMid : palette.textHi }}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  full: { alignSelf: 'stretch' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  primary: {
    backgroundColor: palette.surfaceAlt,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.hairline,
  },
  secondary: {
    backgroundColor: palette.surfaceAlt,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.hairline,
  },
  ghost: { backgroundColor: 'transparent' },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.35 },
});
