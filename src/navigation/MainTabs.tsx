import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { palette, type as typeScale } from '../theme';
import { TabIcon, TabName } from '../components';
import { DashboardScreen } from '../screens/DashboardScreen';
import { MeasureScreen } from '../screens/MeasureScreen';
import { ConfidenceScreen } from '../screens/ConfidenceScreen';
import { TrendScreen } from '../screens/TrendScreen';
import { LadderScreen } from '../screens/LadderScreen';

export type MainTabsParamList = {
  Dashboard: undefined;
  Measure: undefined;
  Confidence: undefined;
  Trend: undefined;
  Ladder: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

const icon = (name: TabName) => ({ color }: { color: string }) => <TabIcon name={name} color={color} />;

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.green,
        tabBarInactiveTintColor: palette.textLow,
        tabBarStyle: styles.bar,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: styles.item,
        sceneStyle: { backgroundColor: palette.ink },
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarIcon: icon('dashboard') }} />
      <Tab.Screen name="Measure" component={MeasureScreen} options={{ tabBarIcon: icon('measure') }} />
      <Tab.Screen name="Confidence" component={ConfidenceScreen} options={{ tabBarIcon: icon('confidence') }} />
      <Tab.Screen name="Trend" component={TrendScreen} options={{ tabBarIcon: icon('trend') }} />
      <Tab.Screen name="Ladder" component={LadderScreen} options={{ tabBarIcon: icon('ladder') }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: palette.ink,
    borderTopColor: palette.hairline,
    borderTopWidth: StyleSheet.hairlineWidth,
    height: 64,
    paddingTop: 8,
    paddingBottom: 10,
  },
  label: { ...typeScale.label, fontSize: 11 },
  item: { paddingTop: 2 },
});
