import React, { useRef } from "react";
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
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { StatCard } from "@/components/StatCard";
import { AIInsightCard } from "@/components/AIInsightCard";
import { GradientCard } from "@/components/GradientCard";
import { ProgressRing } from "@/components/ProgressRing";
import { useHealth } from "@/context/HealthContext";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { healthData, userProfile } = useHealth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const stats = [
    {
      label: "Steps",
      value: healthData.steps.toLocaleString(),
      goal: healthData.stepsGoal.toLocaleString(),
      progress: healthData.steps / healthData.stepsGoal,
      icon: "shoe-print",
      color: colors.primary,
    },
    {
      label: "Calories",
      value: healthData.calories.toLocaleString(),
      unit: "kcal",
      goal: `${healthData.caloriesGoal}`,
      progress: healthData.calories / healthData.caloriesGoal,
      icon: "fire",
      color: colors.orange,
    },
    {
      label: "Distance",
      value: healthData.distance.toString(),
      unit: "km",
      goal: `${healthData.distanceGoal}km`,
      progress: healthData.distance / healthData.distanceGoal,
      icon: "map-marker-distance",
      color: colors.success,
    },
    {
      label: "Sleep",
      value: healthData.sleep.toString(),
      unit: "hrs",
      goal: `${healthData.sleepGoal}hrs`,
      progress: healthData.sleep / healthData.sleepGoal,
      icon: "moon-waning-crescent",
      color: colors.purple,
    },
  ];

  const quickActions = [
    { label: "Run", icon: "run-fast", color: colors.primary, route: "/(tabs)/run" },
    { label: "Log", icon: "clipboard-edit", color: colors.success, route: "/(tabs)/input" },
    { label: "AI Plan", icon: "brain", color: colors.purple, route: "/(tabs)/plan" },
  ];

  const overallProgress =
    (healthData.steps / healthData.stepsGoal +
      healthData.calories / healthData.caloriesGoal +
      healthData.sleep / healthData.sleepGoal) /
    3;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: botPad + 90 }]}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            {
              paddingTop: topPad + 12,
              paddingHorizontal: 20,
              paddingBottom: 16,
            },
          ]}
        >
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {getGreeting()}
            </Text>
            <Text style={[styles.name, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {userProfile.name}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable
              style={[styles.headerBtn, { backgroundColor: colors.secondary }]}
            >
              <Feather name="bell" size={20} color={colors.foreground} />
            </Pressable>
            <Pressable
              onPress={() => router.push("/(tabs)/profile")}
              style={[styles.avatar, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.avatarText, { fontFamily: "Inter_700Bold" }]}>
                {userProfile.name.charAt(0)}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Overall Progress Card */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <GradientCard
            style={[styles.overallCard, { backgroundColor: colors.primary }]}
            padding={20}
          >
            <View style={styles.overallRow}>
              <View style={styles.overallLeft}>
                <Text style={[styles.overallLabel, { color: "#fff", opacity: 0.8, fontFamily: "Inter_500Medium" }]}>
                  Today's Progress
                </Text>
                <Text style={[styles.overallPercent, { color: "#fff", fontFamily: "Inter_700Bold" }]}>
                  {Math.round(overallProgress * 100)}%
                </Text>
                <Text style={[styles.overallSub, { color: "#fff", opacity: 0.75, fontFamily: "Inter_400Regular" }]}>
                  of daily goals
                </Text>
              </View>
              <ProgressRing
                progress={overallProgress}
                size={90}
                strokeWidth={8}
                color="rgba(255,255,255,0.9)"
                trackColor="rgba(255,255,255,0.25)"
                showPercentage={true}
              />
            </View>

            {/* Heart rate */}
            <View style={[styles.hrRow, { borderTopColor: "rgba(255,255,255,0.2)" }]}>
              <MaterialCommunityIcons name="heart-pulse" size={16} color="#fff" />
              <Text style={[styles.hrText, { color: "#fff", opacity: 0.9, fontFamily: "Inter_500Medium" }]}>
                {healthData.heartRate} bpm
              </Text>
              <View style={[styles.hrBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                <Text style={{ color: "#fff", fontSize: 10, fontFamily: "Inter_600SemiBold" }}>
                  Normal
                </Text>
              </View>
            </View>
          </GradientCard>
        </View>

        {/* Stats Grid */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Daily Stats
          </Text>
          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                unit={stat.unit}
                goal={stat.goal}
                progress={stat.progress}
                icon={stat.icon}
                color={stat.color}
              />
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Quick Actions
          </Text>
          <View style={styles.quickActions}>
            {quickActions.map((action) => (
              <Pressable
                key={action.label}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(action.route as any);
                }}
                style={[
                  styles.quickBtn,
                  {
                    backgroundColor: action.color + "15",
                    borderColor: action.color + "30",
                    borderRadius: colors.radius,
                  },
                ]}
              >
                <View style={[styles.quickIcon, { backgroundColor: action.color }]}>
                  <MaterialCommunityIcons name={action.icon as any} size={22} color="#fff" />
                </View>
                <Text style={[styles.quickLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* AI Insight */}
        <View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            AI Insight
          </Text>
          <View style={styles.insightsStack}>
            <AIInsightCard
              insight={`You're ${Math.round((1 - overallProgress) * 100)}% below your weekly goal. A 20-minute walk tonight will close the gap.`}
              type="ai"
              actionLabel="View AI Plan"
              onAction={() => router.push("/(tabs)/plan")}
            />
            <AIInsightCard
              insight="Your sleep improved by 15 min this week. Aim for 8 hours for optimal recovery."
              type="success"
              actionLabel="Track Sleep"
              onAction={() => router.push("/(tabs)/input")}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    gap: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greeting: {
    fontSize: 14,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
  },
  headerRight: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  overallCard: {
    borderRadius: 20,
  },
  overallRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  overallLeft: {
    gap: 2,
  },
  overallLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  overallPercent: {
    fontSize: 42,
    fontWeight: "700",
    lineHeight: 48,
  },
  overallSub: {
    fontSize: 13,
  },
  hrRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  hrText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  hrBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  quickBtn: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
  },
  quickIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  insightsStack: {
    gap: 10,
  },
});
