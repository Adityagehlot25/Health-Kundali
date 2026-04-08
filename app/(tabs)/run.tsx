import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import {
  startTracking,
  pauseTracking,
  resumeTracking,
  stopTracking,
  getStats,
  getTrackingLog,
  isTracking,
  hasPausedRun,
} from "@/services/runTracker";
import { useHealth } from "@/context/HealthContext";

type RunState = "idle" | "running" | "paused";

export default function RunScreen() {
  const colors = useColors();
  const { healthData, updateHealthData } = useHealth();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [runState, setRunState] = useState<RunState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [distance, setDistance] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pulseScale = useSharedValue(1);
  const btnScale = useSharedValue(1);

  const syncFromTracker = () => {
    const stats = getStats();
    setSeconds(stats.durationSeconds);
    setDistance(stats.distanceKm);
    setLogs(getTrackingLog());

    if (stats.isRunning) {
      setRunState("running");
      return;
    }

    if (hasPausedRun()) {
      setRunState("paused");
      return;
    }

    setRunState("idle");
  };

  useEffect(() => {
    syncFromTracker();
  }, []);

  useEffect(() => {
    if (runState === "running") {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        false
      );
      intervalRef.current = setInterval(() => {
        syncFromTracker();
      }, 1000);
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [runState]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const btnAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const handleStart = async () => {
    try {
      setErrorMessage(null);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      btnScale.value = withSpring(0.95, { damping: 10 }, () => {
        btnScale.value = withSpring(1);
      });
      await startTracking();
      syncFromTracker();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to start run tracking.";
      setErrorMessage(message);
      Alert.alert("Run Tracking", message);
    }
  };

  const handlePause = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    pauseTracking();
    syncFromTracker();
  };

  const handleResume = async () => {
    try {
      setErrorMessage(null);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await resumeTracking();
      syncFromTracker();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to resume run tracking.";
      setErrorMessage(message);
      Alert.alert("Run Tracking", message);
    }
  };

  const handleStop = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const summary = stopTracking();

    if (summary) {
      const caloriesBurned = Math.round(summary.distanceKm * 62);
      updateHealthData({
        distance: Number((healthData.distance + summary.distanceKm).toFixed(2)),
        calories: healthData.calories + caloriesBurned,
      });
    }

    syncFromTracker();
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const pace = distance > 0 ? `${Math.floor((seconds / distance) / 60)}:${String(Math.round((seconds / distance) % 60)).padStart(2, "0")}` : "--:--";
  const calories = Math.round(distance * 62);

  const isActive = runState === "running" || runState === "paused";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, paddingHorizontal: 20 }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          Running
        </Text>
        {isActive && (
          <View style={[styles.liveBadge, { backgroundColor: colors.destructive + "20" }]}>
            <View style={[styles.liveDot, { backgroundColor: colors.destructive }]} />
            <Text style={[styles.liveText, { color: colors.destructive, fontFamily: "Inter_700Bold" }]}>
              LIVE
            </Text>
          </View>
        )}
      </View>

      {/* Map Placeholder */}
      <View
        style={[
          styles.mapPlaceholder,
          { backgroundColor: colors.muted, borderColor: colors.border },
        ]}
      >
        <View style={styles.mapGrid}>
          {Array.from({ length: 6 }).map((_, r) =>
            Array.from({ length: 8 }).map((__, c) => (
              <View
                key={`${r}-${c}`}
                style={[styles.mapCell, { borderColor: colors.border + "40" }]}
              />
            ))
          )}
        </View>
        <View style={styles.mapOverlay}>
          <MaterialCommunityIcons
            name="map-outline"
            size={40}
            color={colors.mutedForeground}
          />
          <Text style={[styles.mapText, { color: colors.mutedForeground, fontFamily: "Inter_500Medium" }]}>
            Route Map
          </Text>
          {runState === "running" && (
            <Animated.View style={[styles.locationDot, pulseStyle, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="run-fast" size={14} color="#fff" />
            </Animated.View>
          )}
        </View>
      </View>

      {/* Timer */}
      <View style={styles.timerSection}>
        <Text style={[styles.timer, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
          {formatTime(seconds)}
        </Text>
        <Text style={[styles.timerLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
          elapsed time
        </Text>
        {errorMessage ? (
          <Text style={[styles.errorText, { color: colors.destructive, fontFamily: "Inter_500Medium" }]}>
            {errorMessage}
          </Text>
        ) : null}
      </View>

      {/* Metrics Row */}
      <View style={[styles.metricsRow, { paddingHorizontal: 20 }]}>
        {[
          { label: "Distance", value: `${distance.toFixed(2)} km`, icon: "map-marker-distance", color: colors.success },
          { label: "Pace", value: `${pace} /km`, icon: "speedometer", color: colors.warning },
          { label: "Calories", value: `${Math.round(calories)} kcal`, icon: "fire", color: colors.orange },
        ].map((m) => (
          <View
            key={m.label}
            style={[
              styles.metricCard,
              {
                backgroundColor: colors.card,
                borderRadius: colors.radius - 4,
                borderWidth: 1,
                borderColor: colors.border,
              },
            ]}
          >
            <MaterialCommunityIcons name={m.icon as any} size={18} color={m.color} />
            <Text style={[styles.metricValue, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>
              {m.value}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
              {m.label}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.logSection, { marginHorizontal: 20, borderColor: colors.border, backgroundColor: colors.card }] }>
        <Text style={[styles.logTitle, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}>GPS Log</Text>
        <ScrollView contentContainerStyle={styles.logList} showsVerticalScrollIndicator={false}>
          {logs.length === 0 ? (
            <Text style={[styles.logText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>Start a run to see GPS tracking events.</Text>
          ) : (
            logs.slice(-6).map((item) => (
              <Text key={item} style={[styles.logText, { color: colors.mutedForeground, fontFamily: "Inter_400Regular" }]}>
                {item}
              </Text>
            ))
          )}
        </ScrollView>
      </View>

      {/* Controls */}
      <View style={[styles.controls, { paddingBottom: botPad + 90, paddingHorizontal: 40 }]}>
        {!isActive ? (
          <Animated.View style={btnAnimStyle}>
            <Pressable
              onPress={handleStart}
              style={[styles.startBtn, { backgroundColor: colors.primary }]}
            >
              <MaterialCommunityIcons name="play" size={36} color="#fff" />
            </Pressable>
          </Animated.View>
        ) : (
          <View style={styles.activeControls}>
            <Pressable
              onPress={handleStop}
              style={[styles.controlBtn, { backgroundColor: colors.destructive + "20", borderColor: colors.destructive + "40" }]}
            >
              <MaterialCommunityIcons name="stop" size={26} color={colors.destructive} />
            </Pressable>

            <Pressable
              onPress={runState === "running" ? handlePause : handleResume}
              style={[styles.mainControlBtn, { backgroundColor: runState === "running" ? colors.warning : colors.success }]}
            >
              <MaterialCommunityIcons
                name={runState === "running" ? "pause" : "play"}
                size={34}
                color="#fff"
              />
            </Pressable>

            <View
              style={[styles.controlBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
            >
              <MaterialCommunityIcons name="flag-outline" size={22} color={colors.mutedForeground} />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "700",
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  liveText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  mapPlaceholder: {
    marginHorizontal: 20,
    borderRadius: 20,
    height: 180,
    overflow: "hidden",
    borderWidth: 1,
    position: "relative",
  },
  mapGrid: {
    position: "absolute",
    inset: 0,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  mapCell: {
    width: "12.5%",
    aspectRatio: 1,
    borderWidth: 0.5,
  },
  mapOverlay: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  mapText: {
    fontSize: 14,
    fontWeight: "500",
  },
  locationDot: {
    position: "absolute",
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    bottom: 24,
    right: 24,
  },
  timerSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  timer: {
    fontSize: 56,
    fontWeight: "700",
    letterSpacing: -2,
  },
  timerLabel: {
    fontSize: 13,
    marginTop: -4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 10,
    textAlign: "center",
  },
  metricsRow: {
    flexDirection: "row",
    gap: 10,
  },
  metricCard: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  metricLabel: {
    fontSize: 11,
  },
  logSection: {
    borderWidth: 1,
    borderRadius: 14,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 100,
    maxHeight: 138,
  },
  logTitle: {
    fontSize: 13,
    marginBottom: 6,
  },
  logList: {
    gap: 4,
  },
  logText: {
    fontSize: 11,
    lineHeight: 16,
  },
  controls: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  startBtn: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
  },
  activeControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  controlBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  mainControlBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
});
