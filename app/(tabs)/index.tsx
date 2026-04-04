import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  return (
    // BRIGHT BLUE BACKGROUND TO PROVE THIS IS THE HOME PAGE
    <View style={[styles.container, { backgroundColor: "#e0f7fa" }]}>
      <Text style={{ fontSize: 40, fontWeight: "bold" }}>
        I AM THE HOME DASHBOARD
      </Text>

      <TouchableOpacity
        style={{ backgroundColor: "green", padding: 20, marginTop: 50 }}
        onPress={() => router.push("/tracker")}
      >
        <Text style={{ color: "white", fontSize: 20 }}>GO TO TRACKER</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});
