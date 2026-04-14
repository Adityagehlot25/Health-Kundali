import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { useHealthStore } from '../store/healthStore';

export default function RootLayout() {
  const { isAuthenticated, loginSession } = useHealthStore();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  // 1. BOOT CHECK: Look for the token in the phone's hardware
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        const userDataString = await SecureStore.getItemAsync('userData');
        
        if (token && userDataString) {
          // We found everything! Parse the string back into a JSON object
          const parsedUser = JSON.parse(userDataString);
          loginSession(token, parsedUser);
        }
      } catch (error) {
        console.error("Failed to fetch token on boot", error);
      } finally {
        setIsAuthChecked(true); 
      }
    };
    checkToken();
  }, []);

  // 2. THE GATEKEEPER
  useEffect(() => {
    // Wait until Expo Router is ready AND we've finished checking the token
    if (!navigationState?.key || !isAuthChecked) return;

    const inAuthGroup = segments[0] === '(auth)';

    setTimeout(() => {
      if (!isAuthenticated && !inAuthGroup) {
        router.replace('/(auth)/welcome');
      } else if (isAuthenticated && inAuthGroup) {
        router.replace('/(tabs)');
      }
    }, 10);
  }, [isAuthenticated, segments, navigationState?.key, isAuthChecked]);

  // While checking SecureStore, render nothing so we don't flash the wrong screen
  if (!isAuthChecked) return null; 

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}