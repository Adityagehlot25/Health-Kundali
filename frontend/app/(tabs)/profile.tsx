import { Redirect, useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/contexts/auth-context";

export default function ProfileScreen() {
  const router = useRouter();
  const { isAuthenticated, isReady, logout, profile, profileCompleted, user } = useAuth();

  if (!isReady) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (!profileCompleted || !profile) {
    return <Redirect href="/profile-setup" />;
  }

  const profileRows = [
    { label: "Full name", value: profile.fullName },
    { label: "Email", value: user?.email ?? "--" },
    { label: "Age", value: profile.age },
    { label: "Gender", value: profile.gender },
    { label: "Weight", value: `${profile.weight} kg` },
    { label: "Height", value: `${profile.height} cm` },
    { label: "Goal", value: profile.goal },
  ];

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Profile</Text>
        <Text style={styles.title}>{profile.fullName}</Text>
        <Text style={styles.subtitle}>
          Review your saved details or update them whenever your goals change.
        </Text>
      </View>

      <View style={styles.card}>
        {profileRows.map((row) => (
          <View key={row.label} style={styles.row}>
            <Text style={styles.rowLabel}>{row.label}</Text>
            <Text style={styles.rowValue}>{row.value}</Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={() =>
          router.push({ pathname: "/profile-setup", params: { mode: "edit" } })
        }
        style={styles.primaryButton}
      >
        <Text style={styles.primaryButtonText}>Edit Profile</Text>
      </Pressable>

      <Pressable
        onPress={async () => {
          await logout();
          router.replace("/login");
        }}
        style={styles.secondaryButton}
      >
        <Text style={styles.secondaryButtonText}>Logout</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#faf7f0",
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  hero: {
    marginTop: 18,
    marginBottom: 20,
  },
  eyebrow: {
    color: "#a36a20",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  title: {
    color: "#3d2a13",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: "#6f5b46",
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    marginBottom: 20,
    padding: 20,
  },
  row: {
    borderBottomColor: "#f0e7da",
    borderBottomWidth: 1,
    paddingVertical: 14,
  },
  rowLabel: {
    color: "#8b755e",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  rowValue: {
    color: "#3d2a13",
    fontSize: 17,
    fontWeight: "600",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#cf7a21",
    borderRadius: 18,
    marginBottom: 12,
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#f3e7d5",
    borderRadius: 18,
    paddingVertical: 16,
  },
  secondaryButtonText: {
    color: "#8e5818",
    fontSize: 16,
    fontWeight: "800",
  },
});
