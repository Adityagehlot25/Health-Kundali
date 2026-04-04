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
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { AIInsightCard } from "@/components/AIInsightCard";
import { AppButton } from "@/components/AppButton";
import { WeekScheduleCard } from "@/components/WeekScheduleCard";
import { useHealth } from "@/context/HealthContext";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const today = new Date().getDay();
const adjustedToday = today === 0 ? 6 : today - 1;

function generatePlan(goal: string) {
  const plans: Record<string, any[]> = {
    "Lose Weight": [
      { day: "Mon", activity: "Interval Run", duration: "30 min", icon: "run-fast", color: "#0891b2", completed: true },
      { day: "Tue", activity: "Strength", duration: "45 min", icon: "dumbbell", color: "#f97316", completed: true },
      { day: "Wed", activity: "Rest Day", duration: "Recovery", icon: "bed-outline", color: "#64748b", completed: adjustedToday > 2 },
      { day: "Thu", activity: "5km Run", duration: "35 min", icon: "run-fast", color: "#0891b2", completed: adjustedToday > 3 },
      { day: "Fri", activity: "HIIT", duration: "25 min", icon: "lightning-bolt", color: "#f59e0b", completed: adjustedToday > 4 },
      { day: "Sat", activity: "Long Run", duration: "60 min", icon: "run-fast", color: "#0891b2", completed: false },
      { day: "Sun", activity: "Yoga", duration: "40 min", icon: "meditation", color: "#8b5cf6", completed: false },
    ],
    "Build Muscle": [
      { day: "Mon", activity: "Chest & Tri", duration: "50 min", icon: "dumbbell", color: "#f97316", completed: true },
      { day: "Tue", activity: "Back & Bi", duration: "50 min", icon: "dumbbell", color: "#f97316", completed: true },
      { day: "Wed", activity: "Legs", duration: "55 min", icon: "dumbbell", color: "#f97316", completed: adjustedToday > 2 },
      { day: "Thu", activity: "Rest Day", duration: "Recovery", icon: "bed-outline", color: "#64748b", completed: adjustedToday > 3 },
      { day: "Fri", activity: "Shoulders", duration: "45 min", icon: "dumbbell", color: "#f97316", completed: adjustedToday > 4 },
      { day: "Sat", activity: "Full Body", duration: "60 min", icon: "dumbbell", color: "#f97316", completed: false },
      { day: "Sun", activity: "Recovery Run", duration: "30 min", icon: "run-fast", color: "#0891b2", completed: false },
    ],
  };
  const base = plans[goal] ?? plans["Lose Weight"];
  return base.map((d, i) => ({ ...d, isToday: i === adjustedToday }));
}

export default function PlanScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userProfile } = useHealth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [isGenerating, setIsGenerating] = useState(false);
  const [plan, setPlan] = useState(generatePlan(userProfile.goal));

  const rotateAnim = useSharedValue(0);

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotateAnim.value}deg` }],
  }));

  const handleRegenerate = async () => {
    setIsGenerating(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    rotateAnim.value = withRepeat(
      withTiming(360, { duration: 800 }),
      3,
      false,
      () => {
        rotateAnim.value = 0;
      }
    );
    setTimeout(() => {
      setPlan(generatePlan(userProfile.goal));
      setIsGenerating(false);
    }, 2400);
  };

  const recommendations = [
    { text: "Run 3km tomorrow to stay on track", icon: "run-fast", color: colors.primary },
    { text: "Improve sleep by 30 min — aim for 10pm bedtime", icon: "moon-waning-crescent", color: colors.purple },
    { text: "Add 500ml water after each workout", icon: "cup-water", color: colors.success },
    { text: "Reduce rest period to 60s between sets", icon: "timer-outline", color: colors.warning },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: botPad + 90, paddingTop: topPad + 12 },
        ]}
      >
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: 20 }]}>
          <View>
            <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              AI Plan
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Personalized for {userProfile.name}
            </Text>
          </View>

          <Pressable
            onPress={handleRegenerate}
            style={[
              styles.regenBtn,
              {
                backgroundColor: colors.purple + "15",
                borderColor: colors.purple + "40",
                borderRadius: colors.radius - 4,
              },
            ]}
          >
            <Animated.View style={spinStyle}>
              <MaterialCommunityIcons name="refresh" size={18} color={colors.purple} />
            </Animated.View>
            <Text style={[styles.regenText, { color: colors.purple, fontFamily: "Inter_600SemiBold" }]}>
              Regenerate
            </Text>
          </Pressable>
        </View>

        {/* Goal Card */}
        <View style={{ paddingHorizontal: 20 }}>
          <View
            style={[
              styles.goalCard,
              {
                backgroundColor: colors.card,
                borderRadius: colors.radius,
                borderWidth: 1,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.goalRow}>
              <View style={[styles.goalIcon, { backgroundColor: colors.primary + "15" }]}>
                <MaterialCommunityIcons name="target" size={22} color={colors.primary} />
              </View>
              <View style={styles.goalInfo}>
                <Text style={[styles.goalLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  Current Goal
                </Text>
                <Text style={[styles.goalName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  {userProfile.goal}
                </Text>
              </View>
              <View style={[styles.levelBadge, { backgroundColor: colors.success + "15" }]}>
                <Text style={[styles.levelText, { color: colors.success, fontFamily: "Inter_600SemiBold" }]}>
                  {userProfile.level}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* AI Overview */}
        <View style={{ paddingHorizontal: 20 }}>
          <AIInsightCard
            insight="Your plan is optimized for fat loss with progressive overload. Week 2 adds 10% intensity. You're 78% consistent this month."
            type="ai"
          />
        </View>

        {/* Weekly Schedule */}
        <View style={{ paddingHorizontal: 20 }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Weekly Schedule
            </Text>
            <View style={[styles.weekBadge, { backgroundColor: colors.primary + "15" }]}>
              <Text style={[styles.weekText, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                Week 3
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.scheduleCard,
              {
                backgroundColor: colors.card,
                borderRadius: colors.radius,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 14,
              },
            ]}
          >
            {isGenerating ? (
              <View style={styles.generating}>
                <Animated.View style={spinStyle}>
                  <MaterialCommunityIcons name="brain" size={28} color={colors.purple} />
                </Animated.View>
                <Text style={[styles.generatingText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
                  AI is crafting your plan...
                </Text>
              </View>
            ) : (
              <WeekScheduleCard days={plan} />
            )}
          </View>
        </View>

        {/* AI Recommendations */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            AI Recommendations
          </Text>
          <View style={styles.recs}>
            {recommendations.map((rec, i) => (
              <View
                key={i}
                style={[
                  styles.recRow,
                  {
                    backgroundColor: colors.card,
                    borderRadius: colors.radius - 4,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: 14,
                  },
                ]}
              >
                <View style={[styles.recIcon, { backgroundColor: rec.color + "15" }]}>
                  <MaterialCommunityIcons name={rec.icon as any} size={16} color={rec.color} />
                </View>
                <Text style={[styles.recText, { color: colors.foreground, fontFamily: "Inter_400Regular" }]}>
                  {rec.text}
                </Text>
                <MaterialCommunityIcons name="chevron-right" size={16} color={colors.mutedForeground} />
              </View>
            ))}
          </View>
        </View>

        {/* Timeline teaser */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Progress Timeline
          </Text>
          <View
            style={[
              styles.timelineCard,
              {
                backgroundColor: colors.card,
                borderRadius: colors.radius,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 16,
              },
            ]}
          >
            {[
              { label: "Week 1", note: "Foundation", done: true },
              { label: "Week 2", note: "Build momentum", done: true },
              { label: "Week 3", note: "Increase intensity", done: false, current: true },
              { label: "Week 4", note: "Peak performance", done: false },
            ].map((w, i) => (
              <View key={i} style={styles.timelineRow}>
                <View style={styles.timelineLine}>
                  <View
                    style={[
                      styles.timelineDot,
                      {
                        backgroundColor: w.done
                          ? colors.success
                          : w.current
                            ? colors.primary
                            : colors.muted,
                        borderColor: w.current ? colors.primary : "transparent",
                        borderWidth: w.current ? 3 : 0,
                        width: w.current ? 18 : 12,
                        height: w.current ? 18 : 12,
                        borderRadius: w.current ? 9 : 6,
                      },
                    ]}
                  />
                  {i < 3 && (
                    <View
                      style={[
                        styles.timelineConnector,
                        { backgroundColor: w.done ? colors.success : colors.muted },
                      ]}
                    />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text
                    style={[
                      styles.timelineLabel,
                      {
                        color: w.current ? colors.primary : colors.foreground,
                        fontFamily: w.current ? "Inter_700Bold" : "Inter_500Medium",
                      },
                    ]}
                  >
                    {w.label}
                  </Text>
                  <Text style={[styles.timelineNote, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {w.note}
                  </Text>
                </View>
                {w.done && (
                  <MaterialCommunityIcons name="check-circle" size={16} color={colors.success} />
                )}
                {w.current && (
                  <View style={[styles.currentBadge, { backgroundColor: colors.primary + "15" }]}>
                    <Text style={{ color: colors.primary, fontSize: 10, fontFamily: "Inter_700Bold" }}>
                      NOW
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { gap: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 4,
  },
  title: { fontSize: 26, fontWeight: "700" },
  subtitle: { fontSize: 14 },
  regenBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  regenText: { fontSize: 13, fontWeight: "600" },
  goalCard: { padding: 16 },
  goalRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  goalIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  goalInfo: { flex: 1 },
  goalLabel: { fontSize: 12 },
  goalName: { fontSize: 16, fontWeight: "700" },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelText: { fontSize: 12, fontWeight: "600" },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  weekBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  weekText: { fontSize: 13, fontWeight: "600" },
  scheduleCard: {},
  generating: { alignItems: "center", paddingVertical: 30, gap: 12 },
  generatingText: { fontSize: 14, fontWeight: "500" },
  recs: { gap: 8 },
  recRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  recIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  recText: { flex: 1, fontSize: 14, lineHeight: 20 },
  timelineCard: {},
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 8,
  },
  timelineLine: { alignItems: "center" },
  timelineDot: {},
  timelineConnector: {
    width: 2,
    height: 20,
    marginTop: 4,
    borderRadius: 1,
  },
  timelineContent: { flex: 1 },
  timelineLabel: { fontSize: 14, fontWeight: "600" },
  timelineNote: { fontSize: 12 },
  currentBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
});
