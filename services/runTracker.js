import * as Location from "expo-location";

// --- State Variables ---
let locationSubscription = null;
let isRunning = false;
let totalDistance = 0; // In kilometers
let startTime = null;
let lastLocation = null;

// --- Helper: Haversine Formula ---
// Calculates straight-line distance between two GPS coordinates in kilometers
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// --- Core Functions ---

export const startTracking = async () => {
  if (isRunning) return;

  // 1. Request Runtime Permissions
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    console.log("❌ Permission to access location was denied");
    return;
  }

  // 2. Reset Stats
  totalDistance = 0;
  startTime = Date.now();
  lastLocation = null;
  isRunning = true;

  console.log("🟢 --- RUN STARTED ---");

  // 3. Start Watching Position
  locationSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.BestForNavigation,
      timeInterval: 1000, // Check every 1 second
      distanceInterval: 1, // Check every 1 meter
    },
    (location) => {
      const { latitude, longitude } = location.coords;

      if (lastLocation) {
        // Calculate distance between last point and this new point
        const distanceDelta = calculateDistance(
          lastLocation.latitude,
          lastLocation.longitude,
          latitude,
          longitude,
        );

        // 4. Filter GPS Noise
        // Ignore tiny movements (< 3m or 0.003km) and crazy GPS jumps (> 50m or 0.05km)
        if (distanceDelta >= 0.003 && distanceDelta <= 0.05) {
          totalDistance += distanceDelta;
          lastLocation = { latitude, longitude };
        }
      } else {
        // First ever location point
        lastLocation = { latitude, longitude };
      }

      // Calculate time
      const timeElapsed = Math.floor((Date.now() - startTime) / 1000); // in seconds

      // 5. Output Continuously
      console.log(
        `⏱ Time: ${timeElapsed}s | 📏 Distance: ${totalDistance.toFixed(3)} km`,
      );
    },
  );
};

export const stopTracking = () => {
  if (!isRunning) return;

  // Kill the GPS watcher
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
  }

  isRunning = false;
  console.log("🔴 --- RUN STOPPED ---");

  const finalStats = getStats();
  console.log(
    `🏁 Final Stats -> Time: ${finalStats.time}s | Distance: ${finalStats.distance} km`,
  );
};

// 💡 BONUS: Return current stats at any given moment
export const getStats = () => {
  const timeElapsed = startTime
    ? Math.floor((Date.now() - startTime) / 1000)
    : 0;
  return {
    distance: totalDistance.toFixed(3),
    time: timeElapsed,
  };
};
