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
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import { AppInput } from "@/components/AppInput";
import { AppButton } from "@/components/AppButton";
import { AIInsightCard } from "@/components/AIInsightCard";
import { useHealth } from "@/context/HealthContext";

interface MetricField {
  key: keyof EntryData;
  label: string;
  placeholder: string;
  icon: string;
  unit: string;
  color: string;
  keyboardType: "numeric";
  hint: string;
}

interface EntryData {
  steps: string;
  calories: string;
  sleep: string;
  heartRate: string;
  water: string;
  weight: string;
}

export default function InputScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { logEntry, healthData } = useHealth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [data, setData] = useState<EntryData>({
    steps: "",
    calories: "",
    sleep: "",
    heartRate: "",
    water: "",
    weight: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const fields: MetricField[] = [
    {
      key: "steps",
      label: "Steps",
      placeholder: `Current: ${healthData.steps.toLocaleString()}`,
      icon: "shoe-print",
      unit: "steps",
      color: colors.primary,
      keyboardType: "numeric",
      hint: "AI estimate based on your usual activity: 8,000–10,000",
    },
    {
      key: "calories",
      label: "Calories Burned",
      placeholder: `Current: ${healthData.calories}`,
      icon: "fire",
      unit: "kcal",
      color: colors.orange,
      keyboardType: "numeric",
      hint: "Includes BMR + activity for your profile",
    },
    {
      key: "sleep",
      label: "Sleep Hours",
      placeholder: `Last night: ${healthData.sleep}h`,
      icon: "moon-waning-crescent",
      unit: "hrs",
      color: colors.purple,
      keyboardType: "numeric",
      hint: "Recommended: 7–9 hours for your age group",
    },
    {
      key: "heartRate",
      label: "Resting Heart Rate",
      placeholder: `Last reading: ${healthData.heartRate} bpm`,
      icon: "heart-pulse",
      unit: "bpm",
      color: colors.destructive,
      keyboardType: "numeric",
      hint: "Normal range: 60–100 bpm",
    },
    {
      key: "water",
      label: "Water Intake",
      placeholder: "0",
      icon: "cup-water",
      unit: "glasses",
      color: colors.success,
      keyboardType: "numeric",
      hint: "Goal: 8 glasses per day",
    },
    {
      key: "weight",
      label: "Weight",
      placeholder: `Last: ${healthData.weight} kg`,
      icon: "scale-bathroom",
      unit: "kg",
      color: colors.warning,
      keyboardType: "numeric",
      hint: "Weigh yourself in the morning for accuracy",
    },
  ];

  const handleSubmit = async () => {
    setLoading(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    logEntry({
      steps: data.steps ? parseInt(data.steps) : undefined,
      calories: data.calories ? parseFloat(data.calories) : undefined,
      sleep: data.sleep ? parseFloat(data.sleep) : undefined,
      heartRate: data.heartRate ? parseInt(data.heartRate) : undefined,
    });

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setData({ steps: "", calories: "", sleep: "", heartRate: "", water: "", weight: "" });

      setTimeout(() => setSubmitted(false), 3000);
    }, 900);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: botPad + 90, paddingTop: topPad + 12 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: 20 }]}>
          <View>
            <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              Log Health Data
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              Track your daily metrics
            </Text>
          </View>
          <Pressable style={[styles.historyBtn, { backgroundColor: colors.secondary }]}>
            <MaterialCommunityIcons name="history" size={20} color={colors.foreground} />
          </Pressable>
        </View>

        {/* Success State */}
        {submitted && (
          <View style={{ paddingHorizontal: 20 }}>
            <View style={[styles.successBanner, { backgroundColor: colors.success + "15", borderColor: colors.success + "40", borderRadius: colors.radius }]}>
              <MaterialCommunityIcons name="check-circle" size={20} color={colors.success} />
              <Text style={[styles.successText, { color: colors.success, fontFamily: "Inter_600SemiBold" }]}>
                Health data logged successfully!
              </Text>
            </View>
          </View>
        )}

        {/* AI Hint */}
        <View style={{ paddingHorizontal: 20 }}>
          <AIInsightCard
            insight="AI autofill is ready. Leave fields empty to accept AI estimates based on your daily patterns."
            type="ai"
          />
        </View>

        {/* Form Fields */}
        <View style={[styles.fieldsGrid, { paddingHorizontal: 20 }]}>
          {fields.map((field) => (
            <View
              key={field.key}
              style={[
                styles.fieldCard,
                {
                  backgroundColor: colors.card,
                  borderRadius: colors.radius - 4,
                  borderWidth: 1,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.fieldHeader}>
                <View style={[styles.fieldIcon, { backgroundColor: field.color + "15" }]}>
                  <MaterialCommunityIcons name={field.icon as any} size={16} color={field.color} />
                </View>
                <Text style={[styles.fieldLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
                  {field.label}
                </Text>
                <View style={[styles.unitBadge, { backgroundColor: field.color + "12" }]}>
                  <Text style={[styles.unitText, { color: field.color, fontFamily: "Inter_600SemiBold" }]}>
                    {field.unit}
                  </Text>
                </View>
              </View>

              <AppInput
                placeholder={field.placeholder}
                keyboardType={field.keyboardType}
                value={data[field.key]}
                onChangeText={(v) => setData((prev) => ({ ...prev, [field.key]: v }))}
                hint={field.hint}
              />
            </View>
          ))}
        </View>

        {/* Submit */}
        <View style={{ paddingHorizontal: 20 }}>
          <AppButton
            title="Save Health Data"
            onPress={handleSubmit}
            fullWidth
            size="lg"
            loading={loading}
          />
          <Text style={[styles.privacyNote, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
            Your data is private and stored securely on your device
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    gap: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
  },
  historyBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderWidth: 1,
  },
  successText: {
    fontSize: 14,
    fontWeight: "600",
  },
  fieldsGrid: {
    gap: 12,
  },
  fieldCard: {
    padding: 14,
    gap: 12,
  },
  fieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  fieldIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  unitBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
  },
  unitText: {
    fontSize: 11,
    fontWeight: "600",
  },
  privacyNote: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
  },
});
