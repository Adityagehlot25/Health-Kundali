import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { ProgressRing } from "./ProgressRing";

interface StatCardProps {
  label: string;
  value: string;
  unit?: string;
  goal?: string;
  progress?: number;
  icon: string;
  color: string;
}

export function StatCard({
  label,
  value,
  unit,
  goal,
  progress = 0,
  icon,
  color,
}: StatCardProps) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderRadius: colors.radius,
          borderWidth: 1,
          borderColor: colors.border,
          elevation: 2,
        },
      ]}
    >
      <View style={styles.top}>
        <View style={[styles.iconBg, { backgroundColor: color + "18" }]}>
          <MaterialCommunityIcons name={icon as any} size={16} color={color} />
        </View>
        <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
          {label}
        </Text>
      </View>

      <View style={styles.body}>
        <View>
          <View style={styles.valueRow}>
            <Text style={[styles.value, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {value}
            </Text>
            {unit && (
              <Text style={[styles.unit, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {" "}{unit}
              </Text>
            )}
          </View>
          {goal && (
            <Text style={[styles.goal, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Goal: {goal}
            </Text>
          )}
        </View>

        <ProgressRing
          progress={progress}
          size={52}
          strokeWidth={5}
          color={color}
          trackColor={colors.muted}
          showPercentage={true}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    flex: 1,
    minWidth: "47%",
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 10,
  },
  iconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
  },
  body: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  value: {
    fontSize: 22,
    fontWeight: "700",
  },
  unit: {
    fontSize: 12,
  },
  goal: {
    fontSize: 11,
    marginTop: 2,
  },
});
