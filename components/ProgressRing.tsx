import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { useColors } from "@/hooks/useColors";

interface ProgressRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  sublabel?: string;
  showPercentage?: boolean;
}

export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 7,
  color,
  trackColor,
  label,
  sublabel,
  showPercentage = false,
}: ProgressRingProps) {
  const colors = useColors();
  const ringColor = color ?? colors.primary;
  const ringTrack = trackColor ?? colors.muted;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(1, Math.max(0, progress));

  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(clampedProgress, {
      duration: 1200,
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
    });
  }, [clampedProgress]);

  const strokeDashoffset = circumference * (1 - clampedProgress);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringTrack}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        {showPercentage && (
          <Text style={[styles.percent, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            {Math.round(clampedProgress * 100)}%
          </Text>
        )}
        {label && (
          <Text style={[styles.label, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            {label}
          </Text>
        )}
        {sublabel && (
          <Text style={[styles.sublabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            {sublabel}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  svg: {
    position: "absolute",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  percent: {
    fontSize: 14,
    fontWeight: "700",
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  sublabel: {
    fontSize: 10,
    textAlign: "center",
  },
});
