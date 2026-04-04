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

export default function SignInScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { setIsOnboarded } = useHealth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validate = () => {
    let valid = true;
    setEmailError("");
    setPasswordError("");
    if (!email || !email.includes("@")) {
      setEmailError("Enter a valid email address");
      valid = false;
    }
    if (!password || password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      valid = false;
    }
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => {
      setLoading(false);
      setIsOnboarded(true);
      router.replace("/(tabs)");
    }, 1200);
  };

  const handleGoogleLogin = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsOnboarded(true);
    router.replace("/(tabs)");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, paddingHorizontal: 24 }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.secondary }]}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingHorizontal: 24, paddingBottom: botPad + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Branding */}
        <View style={styles.brandSection}>
          <View style={[styles.logoMark, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons name="heart-pulse" size={24} color="#fff" />
          </View>
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Welcome back
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Sign in to continue your health journey
          </Text>
        </View>

        {/* Google Button */}
        <Pressable
          onPress={handleGoogleLogin}
          style={[
            styles.socialBtn,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: colors.radius,
            },
          ]}
        >
          <MaterialCommunityIcons name="google" size={20} color="#EA4335" />
          <Text style={[styles.socialBtnText, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            Continue with Google
          </Text>
        </Pressable>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            or sign in with email
          </Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          <AppInput
            label="Email"
            placeholder="your@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            icon="mail"
            value={email}
            onChangeText={setEmail}
            error={emailError}
          />

          <AppInput
            label="Password"
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            icon="lock"
            rightIcon={showPassword ? "eye-off" : "eye"}
            onRightIconPress={() => setShowPassword(!showPassword)}
            value={password}
            onChangeText={setPassword}
            error={passwordError}
          />

          <Pressable style={styles.forgotBtn}>
            <Text style={[styles.forgotText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
              Forgot Password?
            </Text>
          </Pressable>

          <AppButton
            title="Sign In"
            onPress={handleLogin}
            fullWidth
            size="lg"
            loading={loading}
          />
        </View>

        {/* Sign up link */}
        <Pressable
          style={styles.signupLink}
          onPress={() => router.replace("/auth/signup")}
        >
          <Text style={[styles.signupText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
            Don't have an account?{" "}
            <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold" }}>
              Sign Up
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
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    gap: 20,
    paddingTop: 8,
  },
  brandSection: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
  },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
  },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 54,
    borderWidth: 1,
  },
  socialBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
  },
  form: {
    gap: 16,
  },
  forgotBtn: {
    alignSelf: "flex-end",
    marginTop: -6,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: "600",
  },
  signupLink: {
    alignItems: "center",
    paddingTop: 4,
  },
  signupText: {
    fontSize: 14,
  },
});
