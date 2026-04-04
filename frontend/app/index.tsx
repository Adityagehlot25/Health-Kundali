import { Redirect } from "expo-router";

import { useAuth } from "@/contexts/auth-context";

export default function IndexScreen() {
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

  return <Redirect href="/(tabs)" />;
}
