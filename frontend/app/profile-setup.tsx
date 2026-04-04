import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "@/contexts/auth-context";

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { isAuthenticated, isReady, profile, profileCompleted, saveProfile } = useAuth();

  const isEditMode = mode === "edit";

  const [fullName, setFullName] = useState(profile?.fullName ?? "");
  const [age, setAge] = useState(profile?.age ?? "");
  const [gender, setGender] = useState(profile?.gender ?? "");
  const [weight, setWeight] = useState(profile?.weight ?? "");
  const [height, setHeight] = useState(profile?.height ?? "");
  const [goal, setGoal] = useState(profile?.goal ?? "");

  React.useEffect(() => {
    setFullName(profile?.fullName ?? "");
    setAge(profile?.age ?? "");
    setGender(profile?.gender ?? "");
    setWeight(profile?.weight ?? "");
    setHeight(profile?.height ?? "");
    setGoal(profile?.goal ?? "");
  }, [profile]);

  if (!isReady) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (profileCompleted && !isEditMode) {
    return <Redirect href="/(tabs)" />;
  }

  const handleSave = async () => {
    if (
      !fullName.trim() ||
      !age.trim() ||
      !gender.trim() ||
      !weight.trim() ||
      !height.trim() ||
      !goal.trim()
    ) {
      Alert.alert("Incomplete profile", "Fill in every field before continuing.");
      return;
    }

    try {
      await saveProfile({
        fullName,
        age,
        gender,
        weight,
        height,
        goal,
      });

      router.replace(isEditMode ? "/(tabs)/profile" : "/(tabs)");
    } catch (error) {
      Alert.alert(
        "Could not save profile",
        error instanceof Error ? error.message : "Try again in a moment.",
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>
            {isEditMode ? "Edit profile" : "Profile setup"}
          </Text>
          <Text style={styles.title}>
            {isEditMode ? "Update your health details" : "Complete your profile"}
          </Text>
          <Text style={styles.subtitle}>
            This is the step between authentication and your dashboard, so we can
            personalize the app for you.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            onChangeText={setFullName}
            placeholder="Anil Kumar"
            placeholderTextColor="#6d7584"
            style={styles.input}
            value={fullName}
          />

          <Text style={styles.label}>Age</Text>
          <TextInput
            keyboardType="numeric"
            onChangeText={setAge}
            placeholder="25"
            placeholderTextColor="#6d7584"
            style={styles.input}
            value={age}
          />

          <Text style={styles.label}>Gender</Text>
          <TextInput
            onChangeText={setGender}
            placeholder="Male / Female / Other"
            placeholderTextColor="#6d7584"
            style={styles.input}
            value={gender}
          />

          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            keyboardType="numeric"
            onChangeText={setWeight}
            placeholder="70"
            placeholderTextColor="#6d7584"
            style={styles.input}
            value={weight}
          />

          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            keyboardType="numeric"
            onChangeText={setHeight}
            placeholder="175"
            placeholderTextColor="#6d7584"
            style={styles.input}
            value={height}
          />

          <Text style={styles.label}>Primary goal</Text>
          <TextInput
            onChangeText={setGoal}
            placeholder="Lose weight, improve stamina, run 5K..."
            placeholderTextColor="#6d7584"
            style={[styles.input, styles.goalInput]}
            value={goal}
          />

          <Pressable onPress={handleSave} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>
              {isEditMode ? "Save Changes" : "Continue to Dashboard"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#eef3ff",
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  hero: {
    marginBottom: 20,
    marginTop: 36,
  },
  eyebrow: {
    color: "#3758c7",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  title: {
    color: "#162444",
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 10,
  },
  subtitle: {
    color: "#56637b",
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
    color: "#162444",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#f3f6fc",
    borderColor: "#d7deef",
    borderRadius: 16,
    borderWidth: 1,
    color: "#162444",
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  goalInput: {
    minHeight: 60,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#3758c7",
    borderRadius: 18,
    marginTop: 24,
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
});
