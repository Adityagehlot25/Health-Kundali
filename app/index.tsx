import { Redirect } from "expo-router";
import { useHealth } from "@/context/HealthContext";

export default function IndexScreen() {
  const { isOnboarded } = useHealth();

  if (isOnboarded) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding" />;
}
