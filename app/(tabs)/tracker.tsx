import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import {
  startTracking,
  stopTracking
} from "../../services/runTracker";

export default function TrackerScreen() {
  return (
    // BRIGHT YELLOW BACKGROUND TO PROVE THIS IS THE TRACKER PAGE
    <View style={[styles.container, { backgroundColor: "#fff9c4" }]}>
      <Text style={{ fontSize: 30, fontWeight: "bold" }}>I AM THE TRACKER</Text>

      <Button title="Start Run" onPress={startTracking} color="green" />
      <Button title="Stop Run" onPress={stopTracking} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
});
