import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

interface GradientCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "default" | "glass" | "primary" | "surface";
  padding?: number;
}

export function GradientCard({
  children,
  style,
  variant = "default",
  padding = 16,
}: GradientCardProps) {
  const colors = useColors();

  const cardStyle: ViewStyle = {
    borderRadius: colors.radius,
    padding,
    ...(variant === "default" && {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 2,
    }),
    ...(variant === "glass" && {
      backgroundColor: colors.card + "CC",
      borderWidth: 1,
      borderColor: colors.border + "80",
    }),
    ...(variant === "primary" && {
      backgroundColor: colors.primary,
    }),
    ...(variant === "surface" && {
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
    }),
  };

  return <View style={[cardStyle, style]}>{children}</View>;
}

const styles = StyleSheet.create({});
