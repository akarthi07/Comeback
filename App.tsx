import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme, Theme } from '@react-navigation/native';
import { palette } from './src/theme';
import { RootNavigator } from './src/navigation/RootNavigator';
import { seedMockData } from './src/data/mock';

const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: palette.ink,
    card: palette.surface,
    primary: palette.orange,
    text: palette.textHi,
    border: palette.hairline,
    notification: palette.orange,
  },
};

export default function App() {
  // Seed sample data once so the product is demoable before real data exists.
  useEffect(() => {
    seedMockData();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer theme={navTheme}>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
