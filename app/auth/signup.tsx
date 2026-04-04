import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { AppButton } from "@/components/AppButton";
import { AppInput } from "@/components/AppInput";
import { useHealth } from "@/context/HealthContext";

const steps = ["Account", "Profile", "Goals"];

export default function SignUpScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setIsOnboarded, updateProfile } = useHealth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState("Lose Weight");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const goals = ["Lose Weight", "Build Muscle", "Stay Fit", "Run Faster"];

  const validateStep0 = () => {
    let valid = true;
    setNameError("");
    setEmailError("");
    setPasswordError("");
    if (!name.trim()) { setNameError("Name is required"); valid = false; }
    if (!email || !email.includes("@")) { setEmailError("Valid email required"); valid = false; }
    if (!password || password.length < 6) { setPasswordError("At least 6 characters"); valid = false; }
    return valid;
  };

  const handleNext = async () => {
    if (step === 0 && !validateStep0()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleCreate();
    }
  };

  const handleCreate = () => {
    setLoading(true);
    updateProfile({
      name: name || "User",
      age: parseInt(age) || 28,
      weight: parseFloat(weight) || 70,
      height: parseInt(height) || 170,
      goal,
    });
    setTimeout(() => {
      setLoading(false);
      setIsOnboarded(true);
      router.replace("/(tabs)");
    }, 1200);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, paddingHorizontal: 24 }]}>
        <Pressable
          onPress={() => (step > 0 ? setStep(step - 1) : router.back())}
          style={[styles.backBtn, { backgroundColor: colors.secondary }]}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>

        {/* Step indicator */}
        <View style={styles.steps}>
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <View style={styles.stepItem}>
                <View
                  style={[
                    styles.stepDot,
                    {
                      backgroundColor: i <= step ? colors.primary : colors.muted,
                      width: i === step ? 28 : 24,
                    },
                  ]}
                >
                  {i < step ? (
                    <Feather name="check" size={12} color="#fff" />
                  ) : (
                    <Text style={[styles.stepNum, { fontFamily: "Inter_700Bold" }]}>
                      {i + 1}
                    </Text>
                  )}
                </View>
              </View>
              {i < steps.length - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    { backgroundColor: i < step ? colors.primary : colors.muted },
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: 24, paddingBottom: botPad + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 0 && (
          <>
            <View style={styles.titleBlock}>
              <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                Create account
              </Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Start your AI-powered health journey
              </Text>
            </View>

            <View style={styles.form}>
              <AppInput
                label="Full Name"
                placeholder="Aditya Kumar"
                icon="user"
                value={name}
                onChangeText={setName}
                error={nameError}
              />
              <AppInput
                label="Email"
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                icon="mail"
                value={email}
                onChangeText={setEmail}
                error={emailError}
              />
              <AppInput
                label="Password"
                placeholder="At least 6 characters"
                secureTextEntry={!showPassword}
                icon="lock"
                rightIcon={showPassword ? "eye-off" : "eye"}
                onRightIconPress={() => setShowPassword(!showPassword)}
                value={password}
                onChangeText={setPassword}
                error={passwordError}
              />
            </View>
          </>
        )}

        {step === 1 && (
          <>
            <View style={styles.titleBlock}>
              <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                Your profile
              </Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                Help us personalize your experience
              </Text>
            </View>

            <View style={styles.form}>
              <AppInput
                label="Age"
                placeholder="28"
                keyboardType="numeric"
                icon="calendar"
                value={age}
                onChangeText={setAge}
                hint="Optional — improves recommendations"
              />
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <AppInput
                    label="Weight (kg)"
                    placeholder="70"
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                    hint="Optional"
                  />
                </View>
                <View style={styles.halfInput}>
                  <AppInput
                    label="Height (cm)"
                    placeholder="175"
                    keyboardType="numeric"
                    value={height}
                    onChangeText={setHeight}
                    hint="Optional"
                  />
                </View>
              </View>
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <View style={styles.titleBlock}>
              <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                Your goal
              </Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                We'll create a personalized plan for you
              </Text>
            </View>

            <View style={styles.goalsGrid}>
              {goals.map((g) => {
                const icons: Record<string, string> = {
                  "Lose Weight": "scale-bathroom",
                  "Build Muscle": "arm-flex",
                  "Stay Fit": "heart-pulse",
                  "Run Faster": "run-fast",
                };
                const isSelected = goal === g;
                return (
                  <Pressable
                    key={g}
                    onPress={() => {
                      setGoal(g);
                      Haptics.selectionAsync();
                    }}
                    style={[
                      styles.goalCard,
                      {
                        backgroundColor: isSelected ? colors.primary + "12" : colors.card,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderRadius: colors.radius,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={icons[g] as any}
                      size={28}
                      color={isSelected ? colors.primary : colors.mutedForeground}
                    />
                    <Text
                      style={[
                        styles.goalText,
                        {
                          color: isSelected ? colors.primary : colors.foreground,
                          fontFamily: isSelected ? "Inter_700Bold" : "Inter_500Medium",
                        },
                      ]}
                    >
                      {g}
                    </Text>
                    {isSelected && (
                      <View style={[styles.checkMark, { backgroundColor: colors.primary }]}>
                        <Feather name="check" size={10} color="#fff" />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        <AppButton
          title={step < steps.length - 1 ? "Continue" : "Create Account"}
          onPress={handleNext}
          fullWidth
          size="lg"
          loading={loading}
          style={{ marginTop: 8 }}
        />

        <Pressable
          style={styles.signInLink}
          onPress={() => router.replace("/auth/signin")}
        >
          <Text style={[styles.signInText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
            Already have an account?{" "}
            <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold" }}>
              Sign In
            </Text>
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  steps: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  stepItem: {
    alignItems: "center",
  },
  stepDot: {
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNum: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  stepLine: {
    width: 24,
    height: 2,
    marginHorizontal: 4,
  },
  content: {
    gap: 24,
    paddingTop: 12,
  },
  titleBlock: {
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 15,
  },
  form: {
    gap: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  goalsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  goalCard: {
    width: "47%",
    padding: 18,
    borderWidth: 1.5,
    alignItems: "center",
    gap: 10,
    position: "relative",
  },
  goalText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  checkMark: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  signInLink: {
    alignItems: "center",
    paddingTop: 4,
  },
  signInText: {
    fontSize: 14,
  },
});
