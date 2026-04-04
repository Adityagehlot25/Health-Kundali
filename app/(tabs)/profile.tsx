import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Platform,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { ProgressRing } from "@/components/ProgressRing";
import { useHealth } from "@/context/HealthContext";

interface SettingsRowProps {
  icon: string;
  iconColor: string;
  label: string;
  value?: string;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
  showArrow?: boolean;
}

function SettingsRow({
  icon, iconColor, label, value, toggle, toggleValue, onToggle, onPress, showArrow = true,
}: SettingsRowProps) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.settingsRow, { borderBottomColor: colors.border }]}
    >
      <View style={[styles.settingsIcon, { backgroundColor: iconColor + "18" }]}>
        <MaterialCommunityIcons name={icon as any} size={18} color={iconColor} />
      </View>
      <Text style={[styles.settingsLabel, { color: colors.foreground, fontFamily: "Inter_500Medium" }]}>
        {label}
      </Text>
      {toggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: colors.muted, true: colors.primary + "80" }}
          thumbColor={toggleValue ? colors.primary : colors.mutedForeground}
        />
      ) : (
        <View style={styles.settingsRight}>
          {value && (
            <Text style={[styles.settingsValue, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {value}
            </Text>
          )}
          {showArrow && (
            <MaterialCommunityIcons name="chevron-right" size={18} color={colors.mutedForeground} />
          )}
        </View>
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { userProfile, healthData } = useHealth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [healthSync, setHealthSync] = useState(true);

  const stats = [
    { label: "Workouts", value: "23", icon: "dumbbell", color: colors.primary },
    { label: "Km Run", value: "47.2", icon: "run-fast", color: colors.success },
    { label: "Streak", value: "12d", icon: "fire", color: colors.orange },
  ];

  const weekGoalsProgress =
    (healthData.steps / healthData.stepsGoal +
      healthData.sleep / healthData.sleepGoal +
      healthData.calories / healthData.caloriesGoal) /
    3;

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
          <Text style={[styles.title, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
            Profile
          </Text>
          <Pressable style={[styles.editBtn, { backgroundColor: colors.secondary }]}>
            <Feather name="edit-2" size={16} color={colors.foreground} />
          </Pressable>
        </View>

        {/* Profile Card */}
        <View style={{ paddingHorizontal: 20 }}>
          <View
            style={[
              styles.profileCard,
              {
                backgroundColor: colors.card,
                borderRadius: colors.radius,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 20,
              },
            ]}
          >
            <View style={styles.profileTop}>
              <View style={[styles.avatarLarge, { backgroundColor: colors.primary }]}>
                <Text style={[styles.avatarText, { fontFamily: "Inter_700Bold" }]}>
                  {userProfile.name.charAt(0)}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                  {userProfile.name}
                </Text>
                <Text style={[styles.profileMeta, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {userProfile.goal} • {userProfile.level}
                </Text>
                <View style={styles.profileStats}>
                  {[
                    { label: "Age", val: userProfile.age + "y" },
                    { label: "Weight", val: userProfile.weight + "kg" },
                    { label: "Height", val: userProfile.height + "cm" },
                  ].map((s) => (
                    <View key={s.label} style={styles.profileStat}>
                      <Text style={[styles.profileStatVal, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
                        {s.val}
                      </Text>
                      <Text style={[styles.profileStatLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                        {s.label}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              <ProgressRing
                progress={weekGoalsProgress}
                size={64}
                strokeWidth={5}
                color={colors.primary}
                showPercentage
                sublabel="Week"
              />
            </View>
          </View>
        </View>

        {/* Achievement Stats */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold", marginBottom: 12 }]}>
            This Month
          </Text>
          <View style={styles.statsRow}>
            {stats.map((s) => (
              <View
                key={s.label}
                style={[
                  styles.statCard,
                  {
                    backgroundColor: s.color + "12",
                    borderRadius: colors.radius - 4,
                    borderWidth: 1,
                    borderColor: s.color + "30",
                    flex: 1,
                  },
                ]}
              >
                <MaterialCommunityIcons name={s.icon as any} size={20} color={s.color} />
                <Text style={[styles.statValue, { color: s.color, fontFamily: "Inter_700Bold" }]}>
                  {s.value}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Settings */}
        {[
          {
            title: "Health",
            rows: [
              { icon: "target", iconColor: colors.primary, label: "My Goal", value: userProfile.goal },
              { icon: "run-fast", iconColor: colors.success, label: "Fitness Level", value: userProfile.level },
              { icon: "heart-pulse", iconColor: colors.destructive, label: "Apple Health Sync", toggle: true, toggleValue: healthSync, onToggle: setHealthSync },
            ],
          },
          {
            title: "App",
            rows: [
              { icon: "bell-outline", iconColor: colors.warning, label: "Notifications", toggle: true, toggleValue: notifications, onToggle: setNotifications },
              { icon: "theme-light-dark", iconColor: colors.purple, label: "Dark Mode", toggle: true, toggleValue: darkMode, onToggle: setDarkMode },
              { icon: "shield-outline", iconColor: colors.success, label: "Privacy Policy", showArrow: true },
              { icon: "information-outline", iconColor: colors.primary, label: "About Health Kundli", value: "v1.0.0" },
            ],
          },
        ].map((section) => (
          <View key={section.title} style={{ paddingHorizontal: 20 }}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Inter_700Bold", marginBottom: 8 }]}>
              {section.title}
            </Text>
            <View
              style={[
                styles.settingsCard,
                {
                  backgroundColor: colors.card,
                  borderRadius: colors.radius,
                  borderWidth: 1,
                  borderColor: colors.border,
                  overflow: "hidden",
                },
              ]}
            >
              {section.rows.map((row, i) => (
                <SettingsRow
                  key={row.label}
                  {...row}
                  showArrow={row.showArrow ?? !row.toggle}
                />
              ))}
            </View>
          </View>
        ))}

        {/* Sign out */}
        <View style={{ paddingHorizontal: 20 }}>
          <Pressable
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.replace("/onboarding");
            }}
            style={[
              styles.signOutBtn,
              {
                backgroundColor: colors.destructive + "12",
                borderColor: colors.destructive + "30",
                borderRadius: colors.radius,
              },
            ]}
          >
            <MaterialCommunityIcons name="logout" size={18} color={colors.destructive} />
            <Text style={[styles.signOutText, { color: colors.destructive, fontFamily: "Inter_600SemiBold" }]}>
              Sign Out
            </Text>
          </Pressable>
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
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  profileCard: {},
  profileTop: {
    flexDirection: "row",
    gap: 14,
    alignItems: "flex-start",
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  profileInfo: {
    flex: 1,
    gap: 4,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
  },
  profileMeta: {
    fontSize: 13,
  },
  profileStats: {
    flexDirection: "row",
    gap: 14,
    marginTop: 6,
  },
  profileStat: {
    alignItems: "center",
  },
  profileStatVal: {
    fontSize: 14,
    fontWeight: "700",
  },
  profileStatLabel: {
    fontSize: 11,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 11,
  },
  settingsCard: {},
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
  },
  settingsIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  settingsRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  settingsValue: {
    fontSize: 13,
  },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderWidth: 1,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
