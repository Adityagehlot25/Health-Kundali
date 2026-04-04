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

export default function SignupScreen() {
  const router = useRouter();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Missing details", "Fill in your name, email, and password.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password mismatch", "Both password fields need to match.");
      return;
    }

    setIsLoading(true);
    try {
      await signup({ email, name, password });
      router.replace("/profile-setup");
    } catch (error) {
      Alert.alert(
        "Signup failed",
        error instanceof Error ? error.message : "Unable to create account right now.",
      );
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
          <Text style={styles.eyebrow}>Create account</Text>
          <Text style={styles.title}>Start strong</Text>
          <Text style={styles.subtitle}>
            Build your account first, then we will collect your profile details
            before opening the dashboard.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            onChangeText={setName}
            placeholder="Anil Kumar"
            placeholderTextColor="#796f66"
            style={styles.input}
            value={name}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="anil@email.com"
            placeholderTextColor="#796f66"
            style={styles.input}
            value={email}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            autoCapitalize="none"
            onChangeText={setPassword}
            placeholder="Create a password"
            placeholderTextColor="#796f66"
            secureTextEntry
            style={styles.input}
            value={password}
          />

          <Text style={styles.label}>Confirm password</Text>
          <TextInput
            autoCapitalize="none"
            onChangeText={setConfirmPassword}
            placeholder="Repeat your password"
            placeholderTextColor="#796f66"
            secureTextEntry
            style={styles.input}
            value={confirmPassword}
          />

          <Pressable onPress={handleSignup} disabled={isLoading} style={[styles.primaryButton, isLoading && styles.buttonDisabled]}>
            <Text style={styles.primaryButtonText}>{isLoading ? "Loading..." : "Sign Up"}</Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Link href="/login" style={styles.footerLink}>
              Login
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
    backgroundColor: "#fff7ef",
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
    color: "#b86619",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  title: {
    color: "#382410",
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 10,
  },
  subtitle: {
    color: "#766150",
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
    color: "#382410",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#fff3e5",
    borderColor: "#f1dcc4",
    borderRadius: 16,
    borderWidth: 1,
    color: "#382410",
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#cf7a21",
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
    color: "#836e5d",
    fontSize: 15,
  },
  footerLink: {
    color: "#cf7a21",
    fontSize: 15,
    fontWeight: "700",
  },
});
