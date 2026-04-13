import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
// 1. Import the measuring tape!
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  
  // 2. Call the hook to get the exact height of the Android system bar
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#64748B',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#0F172A',
          borderTopColor: '#1E293B',
          // 3. Dynamically add the inset to the height and padding!
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
        },
      }}>
      
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Kundali', 
          tabBarIcon: ({ color, focused }) => (<Ionicons name={focused ? 'planet' : 'planet-outline'} size={24} color={color} />) 
        }} 
      />
      <Tabs.Screen 
        name="journal" 
        options={{ 
          title: 'Journal', 
          tabBarIcon: ({ color, focused }) => (<Ionicons name={focused ? 'journal' : 'journal-outline'} size={24} color={color} />) 
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Profile', 
          tabBarIcon: ({ color, focused }) => (<Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />) 
        }} 
      />
    </Tabs>
  );
}