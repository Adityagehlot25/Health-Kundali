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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { MiniChart } from "@/components/MiniChart";
import { AIInsightCard } from "@/components/AIInsightCard";
import { useHealth } from "@/context/HealthContext";

type Period = "weekly" | "monthly";

export default function AnalysisScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { weeklySteps, weeklySleep, weeklyCalories, healthData } = useHealth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [period, setPeriod] = useState<Period>("weekly");

  const weekLabels = ["M", "T", "W", "T", "F", "S", "S"];
  const monthLabels = ["W1", "W2", "W3", "W4"];

  const monthlySteps = [52000, 61000, 54000, 63000];
  const monthlySleep = [7.1, 6.8, 7.5, 7.2];
  const monthlyCalories = [12400, 14200, 13100, 15600];

  const stepsData = period === "weekly" ? weeklySteps : monthlySteps;
  const sleepData = period === "weekly" ? weeklySleep : monthlySleep;
  const caloriesData = period === "weekly" ? weeklyCalories : monthlyCalories;
  const labels = period === "weekly" ? weekLabels : monthLabels;

  const avgSteps = Math.round(stepsData.reduce((a, b) => a + b, 0) / stepsData.length);
  const avgSleep = (sleepData.reduce((a, b) => a + b, 0) / sleepData.length).toFixed(1);
  const avgCals = Math.round(caloriesData.reduce((a, b) => a + b, 0) / caloriesData.length);

  const fatigueScore = Math.round(
    100 - (healthData.sleep / healthData.sleepGoal) * 40 - (healthData.steps / healthData.stepsGoal) * 30 - 30
  );

  const perfScore = Math.min(
    100,
    Math.round(
      (healthData.steps / healthData.stepsGoal) * 40 +
      (healthData.sleep / healthData.sleepGoal) * 30 +
      (healthData.calories / healthData.caloriesGoal) * 30
    )
  );

  const scoreCards = [
    {
      label: "Fatigue Score",
      value: `${Math.max(0, fatigueScore)}%`,
      desc: fatigueScore < 30 ? "Low fatigue — great!" : "Moderate fatigue",
      icon: "lightning-bolt-circle",
      color: fatigueScore < 30 ? colors.success : colors.warning,
    },
    {
      label: "Performance",
      value: `${perfScore}%`,
      desc: perfScore > 75 ? "Excellent week!" : "Good progress",
      icon: "chart-line",
      color: colors.primary,
    },
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
              Analysis
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Your health trends
            </Text>
          </View>
        </View>

        {/* Period Toggle */}
        <View style={{ paddingHorizontal: 20 }}>
          <View
            style={[
              styles.toggleContainer,
              { backgroundColor: colors.secondary, borderRadius: colors.radius - 4 },
            ]}
          >
            {(["weekly", "monthly"] as Period[]).map((p) => (
              <Pressable
                key={p}
                onPress={() => setPeriod(p)}
                style={[
                  styles.toggleBtn,
                  {
                    backgroundColor: period === p ? colors.primary : "transparent",
                    borderRadius: colors.radius - 6,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    {
                      color: period === p ? "#fff" : colors.mutedForeground,
                      fontFamily: period === p ? "Inter_700Bold" : "Inter_500Medium",
                    },
                  ]}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Score Cards */}
        <View style={{ paddingHorizontal: 20 }}>
          <View style={styles.scoreCards}>
            {scoreCards.map((s) => (
              <View
                key={s.label}
                style={[
                  styles.scoreCard,
                  {
                    backgroundColor: s.color + "12",
                    borderRadius: colors.radius,
                    borderWidth: 1,
                    borderColor: s.color + "30",
                    flex: 1,
                  },
                ]}
              >
                <MaterialCommunityIcons name={s.icon as any} size={22} color={s.color} />
                <Text style={[styles.scoreValue, { color: s.color, fontFamily: "Inter_700Bold" }]}>
                  {s.value}
                </Text>
                <Text style={[styles.scoreLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  {s.label}
                </Text>
                <Text style={[styles.scoreDesc, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {s.desc}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Charts */}
        {[
          {
            title: "Steps Trend",
            data: stepsData,
            color: colors.primary,
            value: avgSteps.toLocaleString(),
            unit: "avg/day",
            trend: avgSteps > 7500 ? "up" as const : "down" as const,
            trendPercent: "12%",
          },
          {
            title: "Sleep Trend",
            data: sleepData,
            color: colors.purple,
            value: avgSleep,
            unit: "hrs avg",
            trend: parseFloat(avgSleep) >= 7 ? "up" as const : "down" as const,
            trendPercent: "8%",
          },
          {
            title: "Calories Burned",
            data: caloriesData,
            color: colors.orange,
            value: avgCals.toLocaleString(),
            unit: "kcal avg",
            trend: "up" as const,
            trendPercent: "5%",
          },
        ].map((chart) => (
          <View key={chart.title} style={{ paddingHorizontal: 20 }}>
            <View
              style={[
                styles.chartCard,
                {
                  backgroundColor: colors.card,
                  borderRadius: colors.radius,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 16,
                },
              ]}
            >
              <MiniChart
                title={chart.title}
                data={chart.data}
                labels={labels}
                color={chart.color}
                height={80}
                currentValue={chart.value}
                unit={chart.unit}
                trend={chart.trend}
                trendPercent={chart.trendPercent}
              />
            </View>
          </View>
        ))}

        {/* Calories vs Intake */}
        <View style={{ paddingHorizontal: 20 }}>
          <View
            style={[
              styles.chartCard,
              {
                backgroundColor: colors.card,
                borderRadius: colors.radius,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 16,
                gap: 14,
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Calories Balance
            </Text>
            <View style={styles.balanceRow}>
              {[
                { label: "Burned", value: avgCals, color: colors.orange },
                { label: "Goal", value: healthData.caloriesGoal, color: colors.success },
                {
                  label: "Deficit",
                  value: Math.abs(avgCals - healthData.caloriesGoal),
                  color: avgCals < healthData.caloriesGoal ? colors.destructive : colors.success,
                },
              ].map((b) => (
                <View key={b.label} style={styles.balanceItem}>
                  <Text style={[styles.balanceVal, { color: b.color, fontFamily: "Inter_700Bold" }]}>
                    {b.value.toLocaleString()}
                  </Text>
                  <Text style={[styles.balanceLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                    {b.label}
                  </Text>
                </View>
              ))}
            </View>
            <View style={[styles.deficitBar, { backgroundColor: colors.muted, borderRadius: 4 }]}>
              <View
                style={[
                  styles.deficitFill,
                  {
                    width: `${Math.min(100, (avgCals / healthData.caloriesGoal) * 100)}%`,
                    backgroundColor: colors.orange,
                    borderRadius: 4,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* AI Insights */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold", marginBottom: 12 }]}>
            AI Analysis
          </Text>
          <View style={styles.insights}>
            <AIInsightCard
              insight="Your step count peaks on Thursday. Consider adding a Wednesday walk to build consistency."
              type="ai"
            />
            <AIInsightCard
              insight="Sleep quality improved this week. Keep your 10pm routine for optimal recovery."
              type="success"
            />
            <AIInsightCard
              insight="Calorie burn is 12% below target on weekends. A short Saturday run will fix this."
              type="warning"
            />
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
  toggleContainer: {
    flexDirection: "row",
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
  },
  scoreCards: {
    flexDirection: "row",
    gap: 12,
  },
  scoreCard: {
    padding: 16,
    alignItems: "center",
    gap: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  scoreDesc: {
    fontSize: 11,
    textAlign: "center",
  },
  chartCard: {},
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  balanceItem: {
    alignItems: "center",
    gap: 2,
  },
  balanceVal: {
    fontSize: 20,
    fontWeight: "700",
  },
  balanceLabel: {
    fontSize: 12,
  },
  deficitBar: {
    height: 6,
    width: "100%",
  },
  deficitFill: {
    height: "100%",
  },
  insights: {
    gap: 10,
  },
});
