import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Pressable,
  Image,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { AppButton } from "@/components/AppButton";
import { useHealth } from "@/context/HealthContext";

const { width, height } = Dimensions.get("window");

const slides = [
  {
    image: require("@/assets/images/onboarding1.png"),
    title: "Track Every Move",
    subtitle: "Monitor your steps, distance, calories and heart rate in real-time with precision tracking.",
    accent: "#0891b2",
  },
  {
    image: require("@/assets/images/onboarding2.png"),
    title: "Deep Health Insights",
    subtitle: "Beautiful charts reveal your sleep patterns, energy levels, and recovery trends over time.",
    accent: "#8b5cf6",
  },
  {
    image: require("@/assets/images/onboarding3.png"),
    title: "AI-Powered Plans",
    subtitle: "Your personal AI coach crafts training plans uniquely tailored to your body and goals.",
    accent: "#10b981",
  },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const { setIsOnboarded } = useHealth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentSlide(idx);
  };

  const goToSlide = (idx: number) => {
    scrollRef.current?.scrollTo({ x: idx * width, animated: true });
    setCurrentSlide(idx);
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = () => {
    setIsOnboarded(true);
    router.replace("/(tabs)");
  };

  const handleLogin = () => {
    router.push("/auth/signin");
  };

  const accent = slides[currentSlide].accent;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Skip button */}
      <Pressable
        style={[styles.skip, { top: topPad + 12, right: 20 }]}
        onPress={handleGetStarted}
      >
        <Text style={[styles.skipText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
          Skip
        </Text>
      </Pressable>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.slides}
      >
        {slides.map((slide, idx) => (
          <View key={idx} style={[styles.slide, { width }]}>
            <View style={[styles.imageContainer, { height: height * 0.48 }]}>
              <Image
                source={slide.image}
                style={[styles.image, { tintColor: undefined }]}
                resizeMode="cover"
              />
              <View
                style={[
                  styles.imageOverlay,
                  {
                    background: undefined,
                    backgroundColor: colors.background + "60",
                  },
                ]}
              />
              <View style={[styles.iconBadge, { backgroundColor: slide.accent + "20", borderColor: slide.accent + "40" }]}>
                <MaterialCommunityIcons
                  name={idx === 0 ? "run-fast" : idx === 1 ? "chart-line" : "brain"}
                  size={32}
                  color={slide.accent}
                />
              </View>
            </View>

            <View style={styles.textBlock}>
              <Text style={[styles.slideTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                {slide.title}
              </Text>
              <Text style={[styles.slideSubtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {slide.subtitle}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Dots */}
      <View style={styles.dots}>
        {slides.map((s, i) => (
          <Pressable key={i} onPress={() => goToSlide(i)}>
            <View
              style={[
                styles.dot,
                {
                  width: i === currentSlide ? 24 : 8,
                  backgroundColor: i === currentSlide ? accent : colors.muted,
                },
              ]}
            />
          </Pressable>
        ))}
      </View>

      {/* CTA Buttons */}
      <View style={[styles.ctas, { paddingBottom: botPad + 16, paddingHorizontal: 24 }]}>
        <AppButton
          title={currentSlide < slides.length - 1 ? "Continue" : "Get Started"}
          onPress={handleNext}
          fullWidth
          size="lg"
        />
        <Pressable onPress={handleLogin} style={styles.loginBtn}>
          <Text style={[styles.loginText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
            Already have an account?{" "}
            <Text style={{ color: colors.primary, fontFamily: "Inter_700Bold" }}>Sign In</Text>
          </Text>
        </Pressable>
      </View>

      {/* App branding at top */}
      <View style={[styles.branding, { top: topPad + 12, left: 20 }]}>
        <View style={[styles.logoMark, { backgroundColor: accent }]}>
          <MaterialCommunityIcons name="heart-pulse" size={16} color="#fff" />
        </View>
        <Text style={[styles.appName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          Health Kundli
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skip: {
    position: "absolute",
    zIndex: 10,
    padding: 4,
  },
  branding: {
    position: "absolute",
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoMark: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    fontSize: 16,
    fontWeight: "700",
  },
  slides: {
    flex: 1,
  },
  slide: {
    flex: 1,
  },
  imageContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  textBlock: {
    padding: 28,
    paddingTop: 24,
    gap: 10,
  },
  slideTitle: {
    fontSize: 30,
    fontWeight: "700",
    lineHeight: 36,
  },
  slideSubtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 16,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  ctas: {
    gap: 14,
    alignItems: "center",
  },
  loginBtn: {
    paddingVertical: 4,
  },
  loginText: {
    fontSize: 14,
  },
});
