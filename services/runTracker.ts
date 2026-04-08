import * as Location from "expo-location";
import { Platform } from "react-native";

const MAX_ACCEPTED_ACCURACY_METERS = 40;
const MIN_MOVEMENT_METERS = 1.0;
const MAX_RUNNING_SPEED_MPS = 8;
const MAX_TRACKING_LOGS = 60;

let locationSubscription: Location.LocationSubscription | null = null;
let webWatchId: number | null = null;
let isRunning = false;
let totalDistance = 0;
let startTime: number | null = null;
let lastLocation: Sample | null = null;
let elapsedBeforeStopSeconds = 0;
let trackingLog: string[] = [];

type Sample = {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  speed: number | null;
  timestamp: number;
};

export type RunStatsSnapshot = {
  distanceKm: number;
  durationSeconds: number;
  paceSecondsPerKm: number | null;
  isRunning: boolean;
};

export type RunSummary = {
  distanceKm: number;
  durationSeconds: number;
  paceSecondsPerKm: number | null;
  startedAt: string;
  endedAt: string;
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const earthRadiusKm = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
};

const formatLogTime = () =>
  new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const formatPaceForLog = (paceSecondsPerKm: number | null) => {
  if (!paceSecondsPerKm) {
    return "--:--/km";
  }

  const minutes = Math.floor(paceSecondsPerKm / 60);
  const seconds = paceSecondsPerKm % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}/km`;
};

const appendLog = (message: string) => {
  const entry = `${formatLogTime()} ${message}`;
  trackingLog = [...trackingLog.slice(-(MAX_TRACKING_LOGS - 1)), entry];
  console.log(`[tracker] ${entry}`);
};

const clearTrackingResources = () => {
  if (Platform.OS === "web" && webWatchId !== null && typeof navigator !== "undefined") {
    navigator.geolocation.clearWatch(webWatchId);
    webWatchId = null;
  }

  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
  }
};

const getElapsedSeconds = () => {
  if (isRunning && startTime) {
    return elapsedBeforeStopSeconds + Math.floor((Date.now() - startTime) / 1000);
  }

  return elapsedBeforeStopSeconds;
};

const getPaceSecondsPerKm = () => {
  const elapsedSeconds = getElapsedSeconds();

  if (totalDistance <= 0 || elapsedSeconds <= 0) {
    return null;
  }

  return Math.round(elapsedSeconds / totalDistance);
};

const createStatsSnapshot = (): RunStatsSnapshot => ({
  distanceKm: Number(totalDistance.toFixed(3)),
  durationSeconds: getElapsedSeconds(),
  paceSecondsPerKm: getPaceSecondsPerKm(),
  isRunning,
});

const toSample = ({ latitude, longitude, accuracy, speed, timestamp }: Partial<Sample> & { latitude: number; longitude: number }): Sample => ({
  latitude,
  longitude,
  accuracy: typeof accuracy === "number" ? accuracy : null,
  speed: typeof speed === "number" ? speed : null,
  timestamp: typeof timestamp === "number" ? timestamp : Date.now(),
});

const processLocation = (sampleInput: Partial<Sample> & { latitude: number; longitude: number }) => {
  const sample = toSample(sampleInput);

  if (!Number.isFinite(sample.latitude) || !Number.isFinite(sample.longitude)) {
    appendLog("Ignored invalid GPS sample.");
    return;
  }

  if (sample.accuracy !== null && sample.accuracy > MAX_ACCEPTED_ACCURACY_METERS) {
    appendLog(`Ignored GPS sample with ${Math.round(sample.accuracy)}m accuracy.`);
    return;
  }

  if (!lastLocation) {
    lastLocation = sample;
    appendLog("GPS lock acquired.");
    return;
  }

  const distanceDeltaMeters =
    calculateDistance(lastLocation.latitude, lastLocation.longitude, sample.latitude, sample.longitude) * 1000;
  const timeDeltaSeconds = Math.max((sample.timestamp - lastLocation.timestamp) / 1000, 1);
  const derivedSpeedMps = distanceDeltaMeters / timeDeltaSeconds;

  if (distanceDeltaMeters < MIN_MOVEMENT_METERS) {
    appendLog(`Ignored ${distanceDeltaMeters.toFixed(1)}m jitter.`);
    return;
  }

  if (derivedSpeedMps > MAX_RUNNING_SPEED_MPS) {
    appendLog(`Ignored ${distanceDeltaMeters.toFixed(1)}m jump at ${derivedSpeedMps.toFixed(1)} m/s.`);
    return;
  }

  totalDistance += distanceDeltaMeters / 1000;
  lastLocation = sample;

  const stats = createStatsSnapshot();
  appendLog(
    `Distance +${distanceDeltaMeters.toFixed(1)}m | total ${stats.distanceKm.toFixed(3)}km | pace ${formatPaceForLog(
      stats.paceSecondsPerKm,
    )}`,
  );
};

const connectWatcher = async () => {
  if (Platform.OS === "web") {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      appendLog("Browser geolocation is unavailable.");
      throw new Error("Geolocation is not available in this browser.");
    }

    webWatchId = navigator.geolocation.watchPosition(
      (position) => {
        processLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        appendLog(`GPS error: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      },
    );

    appendLog("Web GPS watcher connected.");
    return;
  }

  locationSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 1000,
      distanceInterval: 1,
    },
    (location) => {
      processLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        speed: location.coords.speed,
        timestamp: location.timestamp,
      });
    },
  );

  appendLog("Native GPS watcher connected.");
};

export const startTracking = async () => {
  if (isRunning) {
    appendLog("Start ignored because a run is already active.");
    return createStatsSnapshot();
  }

  trackingLog = [];
  appendLog("Run start requested.");

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    appendLog("Location permission denied.");
    throw new Error("Location permission is required to start your run.");
  }

  totalDistance = 0;
  startTime = Date.now();
  lastLocation = null;
  elapsedBeforeStopSeconds = 0;
  isRunning = true;
  appendLog("Run started.");

  try {
    await connectWatcher();
  } catch (error) {
    clearTrackingResources();
    isRunning = false;
    startTime = null;
    elapsedBeforeStopSeconds = 0;
    appendLog("Unable to connect the GPS watcher.");
    throw error instanceof Error ? error : new Error("Unable to start GPS tracking for this run.");
  }

  return createStatsSnapshot();
};

export const pauseTracking = () => {
  if (!isRunning) {
    appendLog("Pause ignored because there is no active run.");
    return createStatsSnapshot();
  }

  elapsedBeforeStopSeconds = getElapsedSeconds();
  isRunning = false;
  startTime = null;
  lastLocation = null;
  clearTrackingResources();
  appendLog("Run paused.");

  return createStatsSnapshot();
};

export const resumeTracking = async () => {
  if (isRunning) {
    appendLog("Resume ignored because run is already active.");
    return createStatsSnapshot();
  }

  if (elapsedBeforeStopSeconds <= 0 && totalDistance <= 0) {
    throw new Error("No paused run found. Start a run first.");
  }

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    appendLog("Location permission denied on resume.");
    throw new Error("Location permission is required to resume your run.");
  }

  startTime = Date.now();
  isRunning = true;
  lastLocation = null;
  appendLog("Run resumed.");

  try {
    await connectWatcher();
  } catch (error) {
    clearTrackingResources();
    isRunning = false;
    startTime = null;
    appendLog("Unable to reconnect GPS watcher on resume.");
    throw error instanceof Error ? error : new Error("Unable to resume GPS tracking for this run.");
  }

  return createStatsSnapshot();
};

export const stopTracking = (): RunSummary | null => {
  if (!isRunning && elapsedBeforeStopSeconds <= 0 && totalDistance <= 0) {
    appendLog("Stop ignored because there is no active run.");
    return null;
  }

  const finalStats = createStatsSnapshot();
  const endedAt = new Date().toISOString();
  const startedAt = startTime ? new Date(startTime).toISOString() : endedAt;

  isRunning = false;
  startTime = null;
  lastLocation = null;
  clearTrackingResources();
  appendLog(
    `Run stopped. Final ${finalStats.distanceKm.toFixed(3)}km in ${finalStats.durationSeconds}s at ${formatPaceForLog(
      finalStats.paceSecondsPerKm,
    )}.`,
  );

  const summary: RunSummary = {
    distanceKm: finalStats.distanceKm,
    durationSeconds: finalStats.durationSeconds,
    paceSecondsPerKm: finalStats.paceSecondsPerKm,
    startedAt,
    endedAt,
  };

  totalDistance = 0;
  elapsedBeforeStopSeconds = 0;

  return summary;
};

export const getStats = () => createStatsSnapshot();

export const getTrackingLog = () => [...trackingLog];

export const isTracking = () => isRunning;

export const hasPausedRun = () => !isRunning && (elapsedBeforeStopSeconds > 0 || totalDistance > 0);
