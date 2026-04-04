import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AppButton({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}: AppButtonProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const heights: Record<string, number> = { sm: 40, md: 50, lg: 58 };
  const fontSizes: Record<string, number> = { sm: 13, md: 15, lg: 17 };
  const paddings: Record<string, number> = { sm: 14, md: 20, lg: 24 };

  const bgColor =
    variant === "primary"
      ? colors.primary
      : variant === "secondary"
        ? colors.secondary
        : variant === "danger"
          ? colors.destructive
          : "transparent";

  const textColor =
    variant === "primary"
      ? colors.primaryForeground
      : variant === "secondary"
        ? colors.secondaryForeground
        : variant === "danger"
          ? colors.destructiveForeground
          : variant === "outline"
            ? colors.primary
            : colors.foreground;

  const borderColor =
    variant === "outline" ? colors.primary : "transparent";

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        animatedStyle,
        {
          backgroundColor: bgColor,
          borderRadius: colors.radius,
          height: heights[size],
          paddingHorizontal: paddings[size],
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          borderWidth: variant === "outline" ? 1.5 : 0,
          borderColor,
          opacity: disabled ? 0.5 : 1,
          ...(fullWidth ? { width: "100%" } : {}),
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text
          style={{
            color: textColor,
            fontSize: fontSizes[size],
            fontWeight: "700" as const,
            fontFamily: "Inter_700Bold",
            letterSpacing: 0.2,
          }}
        >
          {title}
        </Text>
      )}
    </AnimatedPressable>
  );
}
