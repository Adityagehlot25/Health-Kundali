import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

interface WorkoutDay {
  day: string;
  activity: string;
  duration: string;
  completed: boolean;
  isToday: boolean;
  icon: string;
  color: string;
}

interface WeekScheduleCardProps {
  days: WorkoutDay[];
  onDayPress?: (day: WorkoutDay) => void;
}

export function WeekScheduleCard({ days, onDayPress }: WeekScheduleCardProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      {days.map((day, index) => (
        <Pressable
          key={day.day}
          onPress={() => onDayPress?.(day)}
          style={[
            styles.dayRow,
            {
              backgroundColor: day.isToday
                ? colors.primary + "12"
                : "transparent",
              borderRadius: colors.radius - 4,
              borderWidth: day.isToday ? 1 : 0,
              borderColor: colors.primary + "30",
              paddingHorizontal: 12,
              paddingVertical: 11,
            },
          ]}
        >
          <View style={styles.dayLabel}>
            <Text
              style={[
                styles.dayName,
                {
                  color: day.isToday ? colors.primary : colors.mutedForeground,
                  fontFamily: day.isToday ? "Inter_700Bold" : "Inter_500Medium",
                },
              ]}
            >
              {day.day}
            </Text>
          </View>

          <View style={[styles.iconBg, { backgroundColor: day.color + "18" }]}>
            <MaterialCommunityIcons
              name={day.icon as any}
              size={16}
              color={day.color}
            />
          </View>

          <View style={styles.activityInfo}>
            <Text
              style={[
                styles.activityName,
                {
                  color: colors.foreground,
                  fontFamily: "Inter_600SemiBold",
                },
              ]}
            >
              {day.activity}
            </Text>
            <Text
              style={[
                styles.duration,
                {
                  color: colors.mutedForeground,
                  fontFamily: "Inter_400Regular",
                },
              ]}
            >
              {day.duration}
            </Text>
          </View>

          <View style={styles.statusArea}>
            {day.completed ? (
              <View
                style={[
                  styles.completedBadge,
                  { backgroundColor: colors.success + "20" },
                ]}
              >
                <MaterialCommunityIcons
                  name="check"
                  size={12}
                  color={colors.success}
                />
              </View>
            ) : day.isToday ? (
              <View
                style={[
                  styles.todayBadge,
                  { backgroundColor: colors.primary + "20" },
                ]}
              >
                <Text
                  style={{
                    color: colors.primary,
                    fontSize: 10,
                    fontFamily: "Inter_600SemiBold",
                  }}
                >
                  TODAY
                </Text>
              </View>
            ) : (
              <MaterialCommunityIcons
                name="circle-outline"
                size={18}
                color={colors.muted}
              />
            )}
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dayLabel: {
    width: 34,
  },
  dayName: {
    fontSize: 13,
    fontWeight: "500",
  },
  iconBg: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 14,
    fontWeight: "600",
  },
  duration: {
    fontSize: 12,
  },
  statusArea: {
    alignItems: "center",
    justifyContent: "center",
    width: 36,
  },
  completedBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  todayBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
});
