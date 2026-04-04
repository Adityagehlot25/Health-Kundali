import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "@/contexts/auth-context";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing details", "Enter both email and password to log in.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await login({ email, password });
      router.replace(result.profileCompleted ? "/(tabs)" : "/profile-setup");
    } catch (error) {
      Alert.alert(
        "Login failed",
        error instanceof Error ? error.message : "Unable to log in right now.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.screen}
    >
      <View style={styles.shell}>
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Health Kundali</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Log in to continue your wellness journey and open your dashboard.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="runner@email.com"
            placeholderTextColor="#7f8c8d"
            style={styles.input}
            value={email}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            autoCapitalize="none"
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor="#7f8c8d"
            secureTextEntry
            style={styles.input}
            value={password}
          />

          <Pressable onPress={handleLogin} disabled={isLoading} style={[styles.primaryButton, isLoading && styles.buttonDisabled]}>
            <Text style={styles.primaryButtonText}>{isLoading ? "Loading..." : "Login"}</Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Need an account?</Text>
            <Link href="/signup" style={styles.footerLink}>
              Sign up
            </Link>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f3f8f4",
  },
  shell: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  hero: {
    marginBottom: 24,
  },
  eyebrow: {
    color: "#1e7f5c",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  title: {
    color: "#102a1f",
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 10,
  },
  subtitle: {
    color: "#476257",
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 22,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  label: {
    color: "#163528",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#eef5ef",
    borderColor: "#d6e5d8",
    borderRadius: 16,
    borderWidth: 1,
    color: "#102a1f",
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#1e7f5c",
    borderRadius: 18,
    marginTop: 24,
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  footer: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginTop: 18,
  },
  footerText: {
    color: "#5f7469",
    fontSize: 15,
  },
  footerLink: {
    color: "#1e7f5c",
    fontSize: 15,
    fontWeight: "700",
  },
});
