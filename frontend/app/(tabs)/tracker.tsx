import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { saveRun } from "@/services/run-service";
import {
  getStats,
  startTracking,
  stopTracking,
} from "@/services/runTracker";

type TrackerStats = {
  distanceKm: number;
  durationSeconds: number;
  paceSecondsPerKm: number | null;
  isRunning: boolean;
};

function normaliseStats(snapshot: Partial<TrackerStats> | null | undefined): TrackerStats {
  return {
    distanceKm: snapshot?.distanceKm ?? 0,
    durationSeconds: snapshot?.durationSeconds ?? 0,
    paceSecondsPerKm: snapshot?.paceSecondsPerKm ?? null,
    isRunning: snapshot?.isRunning ?? false,
  };
}

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function formatDistance(distanceKm: number) {
  if (distanceKm === 0) {
    return "0";
  }

  return distanceKm.toFixed(distanceKm >= 10 ? 1 : 2);
}

function formatPace(secondsPerKm: number | null) {
  if (!secondsPerKm) {
    return "--:--";
  }

  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = secondsPerKm % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function TrackerScreen() {
  const [stats, setStats] = useState<TrackerStats>(() => normaliseStats(getStats()));
  const [isStarting, setIsStarting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const syncStats = () => {
      setStats(normaliseStats(getStats()));
    };

    syncStats();
    const timerId = setInterval(syncStats, 1000);

    return () => clearInterval(timerId);
  }, []);

  const handleStartRun = async () => {
    if (isStarting || isSaving || stats.isRunning) {
      return;
    }

    setIsStarting(true);

    try {
      const snapshot = await startTracking();
      setStats(normaliseStats(snapshot));
    } catch (error) {
      Alert.alert(
        "Unable to start run",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopRun = async () => {
    if (isSaving || !stats.isRunning) {
      return;
    }

    const run = stopTracking();

    if (!run) {
      return;
    }

    setStats(
      normaliseStats({
        distanceKm: run.distanceKm,
        durationSeconds: run.durationSeconds,
        paceSecondsPerKm: run.paceSecondsPerKm,
        isRunning: false,
      }),
    );

    setIsSaving(true);

    try {
      await saveRun(run);
      Alert.alert("Run saved", "Your run has been stored successfully.");
    } catch (error) {
      Alert.alert(
        "Run not saved",
        error instanceof Error ? error.message : "Unable to save the run right now.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const buttonLabel = isSaving
    ? "Saving..."
    : stats.isRunning
      ? "Stop Run"
      : isStarting
        ? "Starting..."
        : "Start Run";

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        style={styles.screen}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerLabel}>Run Tracker</Text>
          <Text style={styles.headerNote}>
            {stats.isRunning ? "Tracking your live run" : "Ready when you are"}
          </Text>
        </View>

        <View style={styles.timerBlock}>
          <Text style={styles.timerValue}>{formatDuration(stats.durationSeconds)}</Text>
          <Text style={styles.timerLabel}>Time</Text>
        </View>

        <View style={styles.primaryMetric}>
          <Text style={styles.distanceValue}>{formatDistance(stats.distanceKm)}</Text>
          <Text style={styles.distanceLabel}>Distance (km)</Text>
        </View>

        <View style={styles.secondaryMetrics}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{formatPace(stats.paceSecondsPerKm)}</Text>
            <Text style={styles.metricLabel}>Pace / km</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{stats.isRunning ? "LIVE" : "STOPPED"}</Text>
            <Text style={styles.metricLabel}>Status</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerNote}>
            {stats.isRunning
              ? "Distance and pace will update as your GPS changes."
              : "Press start to begin tracking, then stop when you finish."}
          </Text>

          <Pressable
            disabled={isStarting || isSaving}
            onPress={stats.isRunning ? handleStopRun : handleStartRun}
            style={[
              styles.actionButton,
              stats.isRunning ? styles.stopButton : styles.startButton,
              (isStarting || isSaving) && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.actionButtonText}>{buttonLabel}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#151515",
  },
  screen: {
    flex: 1,
    backgroundColor: "#151515",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerLabel: {
    color: "#8c8c8c",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  headerNote: {
    color: "#f5f5f5",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 10,
  },
  timerBlock: {
    alignItems: "center",
    marginBottom: 36,
  },
  timerValue: {
    color: "#ffffff",
    fontSize: 58,
    fontWeight: "900",
    letterSpacing: 1,
  },
  timerLabel: {
    color: "#909090",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
  },
  primaryMetric: {
    alignItems: "center",
    backgroundColor: "#1d1d1d",
    borderRadius: 32,
    marginBottom: 20,
    paddingVertical: 42,
    paddingHorizontal: 20,
  },
  distanceValue: {
    color: "#ffffff",
    fontSize: 78,
    fontWeight: "900",
    lineHeight: 82,
  },
  distanceLabel: {
    color: "#b8b8b8",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 12,
  },
  secondaryMetrics: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 18,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#1d1d1d",
    borderRadius: 26,
    paddingVertical: 26,
    paddingHorizontal: 18,
  },
  metricValue: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 10,
    textAlign: "center",
  },
  metricLabel: {
    color: "#999999",
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  footer: {
    paddingTop: 12,
  },
  footerNote: {
    color: "#8a8a8a",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
    textAlign: "center",
  },
  actionButton: {
    alignItems: "center",
    borderRadius: 999,
    paddingVertical: 20,
  },
  startButton: {
    backgroundColor: "#108a5e",
  },
  stopButton: {
    backgroundColor: "#ff5a1f",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  actionButtonText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
  },
});
