import { Ionicons } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";

import { useAuth } from "@/contexts/auth-context";

export default function TabLayout() {
  const { isAuthenticated, isReady, profileCompleted } = useAuth();

  if (!isReady) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (!profileCompleted) {
    return <Redirect href="/profile-setup" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        tabBarActiveTintColor: "#1e7f5c",
        tabBarInactiveTintColor: "#8ba195",
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 0,
          height: 68,
          paddingBottom: 10,
          paddingTop: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="home-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          headerShown: false,
          title: "Run Tracker",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="walk-outline" size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons color={color} name="person-outline" size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
