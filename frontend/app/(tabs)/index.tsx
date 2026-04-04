import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/contexts/auth-context";

export default function DashboardScreen() {
  const router = useRouter();
  const { profile, user } = useAuth();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={styles.screen}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Dashboard</Text>
        <Text style={styles.title}>
          Hi {profile?.fullName || user?.name || "Runner"}
        </Text>
        <Text style={styles.subtitle}>
          Your profile is complete, so you are now inside the main app.
        </Text>
      </View>

      <View style={styles.highlightCard}>
        <Text style={styles.highlightLabel}>{"Today's focus"}</Text>
        <Text style={styles.highlightValue}>{profile?.goal || "Stay active"}</Text>
        <Text style={styles.highlightNote}>
          Keep your tracker ready and update your profile any time from the tabs.
        </Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Age</Text>
          <Text style={styles.statValue}>{profile?.age || "--"}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Weight</Text>
          <Text style={styles.statValue}>
            {profile?.weight ? `${profile.weight} kg` : "--"}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Height</Text>
          <Text style={styles.statValue}>
            {profile?.height ? `${profile.height} cm` : "--"}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Gender</Text>
          <Text style={styles.statValue}>{profile?.gender || "--"}</Text>
        </View>
      </View>

      <Pressable
        onPress={() => router.push("/(tabs)/tracker")}
        style={styles.primaryButton}
      >
        <Text style={styles.primaryButtonText}>Open Run Tracker</Text>
      </Pressable>

      <Pressable
        onPress={() =>
          router.push({ pathname: "/profile-setup", params: { mode: "edit" } })
        }
        style={styles.secondaryButton}
      >
        <Text style={styles.secondaryButtonText}>Edit Profile Details</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f4f8f5",
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  hero: {
    marginTop: 18,
    marginBottom: 22,
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
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 8,
  },
  subtitle: {
    color: "#486358",
    fontSize: 16,
    lineHeight: 24,
  },
  highlightCard: {
    backgroundColor: "#1e7f5c",
    borderRadius: 28,
    padding: 24,
    marginBottom: 18,
  },
  highlightLabel: {
    color: "#bce7d1",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 10,
    textTransform: "uppercase",
  },
  highlightValue: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 10,
  },
  highlightNote: {
    color: "#d9f4e6",
    fontSize: 15,
    lineHeight: 22,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    minWidth: "47%",
    padding: 18,
  },
  statLabel: {
    color: "#6f8379",
    fontSize: 14,
    marginBottom: 8,
  },
  statValue: {
    color: "#102a1f",
    fontSize: 22,
    fontWeight: "800",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#102a1f",
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
    backgroundColor: "#dff0e4",
    borderRadius: 18,
    paddingVertical: 16,
  },
  secondaryButtonText: {
    color: "#1e7f5c",
    fontSize: 16,
    fontWeight: "800",
  },
});
