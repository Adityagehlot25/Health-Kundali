import React, { useState } from "react";
import {
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function ProfileScreen() {
  // --- State: Where we temporarily store the user's input ---
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState(""); // 'Male' or 'Female'
  const [weight, setWeight] = useState(""); // in kg
  const [height, setHeight] = useState(""); // in cm

  // --- Action: What happens when they click Save ---
  const handleSave = () => {
    // Package all the data into one clean object
    const userProfile = {
      name,
      age: parseInt(age),
      gender,
      weight: parseFloat(weight),
      height: parseFloat(height),
    };

    console.log("💾 --- NEW PROFILE SAVED ---");
    console.log(userProfile);

    // Show a popup alert on the phone
    Alert.alert(
      "Profile Saved!",
      "Check your computer terminal to see the data.",
    );
  };

  return (
    // KeyboardAvoidingView prevents the phone's keyboard from covering the inputs!
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Text style={styles.title}>Your Profile</Text>
      <Text style={styles.subtitle}>Required for calorie calculations</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
      />

      <Text style={styles.label}>Age</Text>
      <TextInput
        style={styles.input}
        value={age}
        onChangeText={setAge}
        placeholder="e.g., 25"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Biological Sex</Text>
      <View style={styles.row}>
        <View style={styles.buttonWrapper}>
          <Button
            title="Male"
            onPress={() => setGender("Male")}
            color={gender === "Male" ? "#2196F3" : "#B0BEC5"}
          />
        </View>
        <View style={styles.buttonWrapper}>
          <Button
            title="Female"
            onPress={() => setGender("Female")}
            color={gender === "Female" ? "#E91E63" : "#B0BEC5"}
          />
        </View>
      </View>

      <Text style={styles.label}>Weight (kg)</Text>
      <TextInput
        style={styles.input}
        value={weight}
        onChangeText={setWeight}
        placeholder="e.g., 70"
        keyboardType="numeric"
      />

      <Text style={styles.label}>Height (cm)</Text>
      <TextInput
        style={styles.input}
        value={height}
        onChangeText={setHeight}
        placeholder="e.g., 175"
        keyboardType="numeric"
      />

      <View style={styles.saveButton}>
        <Button title="Save Profile" onPress={handleSave} color="green" />
      </View>
    </KeyboardAvoidingView>
  );
}

// --- Minimal UI Styling ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "gray",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  row: {
    flexDirection: "row",
    justifyContent: "flex-start",
    gap: 10,
  },
  buttonWrapper: {
    width: 100,
  },
  saveButton: {
    marginTop: 30,
    paddingVertical: 10,
  },
});
