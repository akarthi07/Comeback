import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme, Theme } from '@react-navigation/native';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
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
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  // Seed sample data once so the product is demoable before real data exists.
  useEffect(() => {
    seedMockData();
  }, []);

  // Hold a black screen (no white flash) until Inter is ready.
  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: palette.ink }} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer theme={navTheme}>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
