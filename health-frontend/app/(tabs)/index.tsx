import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
// NEW: Import Health Connect
import { initialize, requestPermission, readRecords } from 'react-native-health-connect';

export default function App() {
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);

  const [steps, setSteps] = useState("");
  const [sleep, setSleep] = useState("7.5"); // Defaulting for demo
  const [hr, setHr] = useState("72");      // Defaulting for demo

  // --- NEW: THE HEALTH CONNECT BOSS FIGHT ---
  const pullHealthData = async () => {
    try {
      setLoading(true);

      // 1. Wake up the sensor
      const isInitialized = await initialize();
      if (!isInitialized) {
        Alert.alert("Error", "Health Connect is not available on this device.");
        return;
      }

      // 2. Ask the user for permission
      await requestPermission([{ accessType: 'read', recordType: 'Steps' }]);

      // 3. Get today's midnight timestamp
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // 4. Read the steps!
      const result = await readRecords('Steps', {
        timeRangeFilter: {
          operator: 'between',
          startTime: today.toISOString(),
          endTime: new Date().toISOString(),
        },
      });

      // 5. Add them all up
      const totalSteps = result.records.reduce((sum, record) => sum + record.count, 0);
      setSteps(totalSteps.toString());
      setPlan(`✅ Successfully pulled ${totalSteps} steps from your phone! Now hit Generate Plan.`);

    } catch (error) {
      console.error(error);
      setPlan("Failed to read Health Connect. Ensure the app has permissions.");
    } finally {
      setLoading(false);
    }
  };

  // --- ORIGINAL AI GENERATOR ---
  const generatePlan = async () => {
    setLoading(true);
    setPlan("");

    try {
      const userHealthData = {
        steps: parseInt(steps) || 0,
        sleepHours: parseFloat(sleep) || 0,
        heartRate: parseInt(hr) || 0
      };

      // ⚠️ Keep your actual IP address or localtunnel URL here!
      const response = await fetch('http://10.179.117.101:3000/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userHealthData),
      });

      const data = await response.json();
      if (data.success) setPlan(data.plan);
      else setPlan("AI failed to generate a plan.");
    } catch (error) {
      console.error(error);
      setPlan("Network Error: Make sure your server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <Text style={styles.title}>HealthKundli AI</Text>
      <Text style={styles.subtitle}>Enter today's stats for tomorrow's plan.</Text>

      {/* NEW: The Native Sensor Button */}
      <TouchableOpacity style={styles.sensorButton} onPress={pullHealthData} disabled={loading}>
        <Text style={styles.sensorButtonText}>📱 Auto-Pull Steps from Phone</Text>
      </TouchableOpacity>

      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Steps" keyboardType="numeric" value={steps} onChangeText={setSteps} />
        <TextInput style={styles.input} placeholder="Sleep" keyboardType="numeric" value={sleep} onChangeText={setSleep} />
        <TextInput style={styles.input} placeholder="HR" keyboardType="numeric" value={hr} onChangeText={setHr} />
      </View>

      <ScrollView style={styles.cardContainer}>
        {plan ? (
          <View style={styles.planCard}>
            <Text style={styles.planText}>{plan}</Text>
          </View>
        ) : (
          <Text style={styles.placeholderText}>Awaiting health data sync...</Text>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={generatePlan} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Generate AI Plan</Text>}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f9', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
  sensorButton: { width: '100%', backgroundColor: '#34C759', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  sensorButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  inputContainer: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  input: { flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 10, marginHorizontal: 5, textAlign: 'center', fontSize: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardContainer: { width: '100%', flex: 1 },
  planCard: { backgroundColor: '#fff', padding: 20, borderRadius: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  planText: { fontSize: 18, color: '#333', lineHeight: 28 },
  placeholderText: { textAlign: 'center', color: '#999', marginTop: 50, fontSize: 16 },
  button: { width: '100%', backgroundColor: '#007AFF', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 40, marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});