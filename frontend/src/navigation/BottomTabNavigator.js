import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import MapHomeScreen from '../screens/main/MapHomeScreen';
import ExploreScreen from '../screens/main/ExploreScreen';
import HistoryScreen from '../screens/main/HistoryScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: colors?.surface || '#FFFFFF' },
        headerTitleStyle: { color: colors?.textPrimary || '#0F172A', fontWeight: '700' },
        tabBarActiveTintColor: colors?.primary || '#1D4ED8',
        tabBarInactiveTintColor: colors?.textSecondary || '#64748B',
        tabBarStyle: { height: 60, paddingBottom: 6, paddingTop: 4 },
        tabBarIcon: ({ focused }) => {
          let icon = '🗺️';
          if (route.name === 'Explore') icon = '🧭';
          else if (route.name === 'History') icon = '🕒';
          else if (route.name === 'Profile') icon = '👤';
          return <Text style={{ fontSize: focused ? 20 : 16 }}>{icon}</Text>;
        },
      })}
    >
      <Tab.Screen name="Map" component={MapHomeScreen} options={{ title: 'Route Map' }} />
      <Tab.Screen name="Explore" component={ExploreScreen} options={{ title: 'Explore' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'History' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;