import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useGoal } from '../store';
import { MainTabs } from './MainTabs';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { CalibrateScreen } from '../screens/CalibrateScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  Settings: undefined;
  Calibrate: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const hasGoal = useGoal((s) => s.goal != null);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {hasGoal ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="Calibrate" component={CalibrateScreen} options={{ animation: 'slide_from_bottom' }} />
        </>
      ) : (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      )}
    </Stack.Navigator>
  );
}
