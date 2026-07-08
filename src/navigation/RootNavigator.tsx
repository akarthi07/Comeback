import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useGoal } from '../store';
import { MainTabs } from './MainTabs';
import { OnboardingScreen } from '../screens/OnboardingScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const hasGoal = useGoal((s) => s.goal != null);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {hasGoal ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      )}
    </Stack.Navigator>
  );
}
