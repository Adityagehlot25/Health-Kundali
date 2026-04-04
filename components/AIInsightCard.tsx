import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { GradientCard } from "./GradientCard";

interface AIInsightCardProps {
  insight: string;
  type?: "info" | "warning" | "success" | "ai";
  actionLabel?: string;
  onAction?: () => void;
}

export function AIInsightCard({
  insight,
  type = "ai",
  actionLabel,
  onAction,
}: AIInsightCardProps) {
  const colors = useColors();

  const iconColor =
    type === "warning"
      ? colors.orange
      : type === "success"
        ? colors.success
        : colors.purple;

  const bgColor =
    type === "warning"
      ? colors.orange + "15"
      : type === "success"
        ? colors.success + "15"
        : colors.purple + "15";

  const borderColor =
    type === "warning"
      ? colors.orange + "40"
      : type === "success"
        ? colors.success + "40"
        : colors.purple + "40";

  const iconName =
    type === "warning"
      ? "alert-circle-outline"
      : type === "success"
        ? "check-circle-outline"
        : "brain";

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bgColor,
          borderRadius: colors.radius,
          borderWidth: 1,
          borderColor,
          padding: 14,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: iconColor + "20" }]}>
          <MaterialCommunityIcons name={iconName as any} size={18} color={iconColor} />
        </View>
        <Text
          style={[styles.label, { color: iconColor, fontFamily: "Inter_600SemiBold" }]}
        >
          {type === "ai" ? "AI Insight" : type === "warning" ? "Alert" : "Achievement"}
        </Text>
      </View>
      <Text
        style={[
          styles.insight,
          { color: colors.foreground, fontFamily: "Inter_400Regular" },
        ]}
      >
        {insight}
      </Text>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} style={styles.action}>
          <Text
            style={[
              styles.actionText,
              { color: iconColor, fontFamily: "Inter_600SemiBold" },
            ]}
          >
            {actionLabel}
          </Text>
          <MaterialCommunityIcons name="arrow-right" size={14} color={iconColor} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  insight: {
    fontSize: 14,
    lineHeight: 20,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 10,
  },
  actionText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
