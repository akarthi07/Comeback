import { ScrollView, View, StyleSheet, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { palette, spacing } from '../theme';
import { Text } from './Text';

interface Props {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  scroll?: boolean;
  right?: React.ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
}

/** Every screen's shell: safe-area aware, consistent gutters, optional big header. */
export function Screen({
  children,
  title,
  subtitle,
  scroll = true,
  right,
  onRefresh,
  refreshing,
}: Props) {
  const insets = useSafeAreaInsets();
  const header = title ? (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <Text variant="h1">{title}</Text>
        {subtitle ? (
          <Text variant="body" tone="mid" style={{ marginTop: 2 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  ) : null;

  const pad = {
    paddingTop: insets.top + spacing.md,
    paddingBottom: insets.bottom + spacing.x4,
    paddingHorizontal: spacing.xl,
  };

  if (!scroll) {
    return (
      <View style={[styles.root, pad]}>
        {header}
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={pad}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={palette.textMid} />
        ) : undefined
      }
    >
      {header}
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.ink },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.x2,
  },
});
