import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import Markdown from 'react-native-markdown-display';

// NEW: Import our custom Master Service instead of raw Health Connect functions
import { fetchMasterBiologicalData } from '../../services/HealthConnectService';

export default function App() {
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);

  const [steps, setSteps] = useState("");
  const [sleep, setSleep] = useState("");
  const [hr, setHr] = useState("");

  // NEW: State to hold the massive 48-hour payload for the AI
  const [masterPayload, setMasterPayload] = useState<any>(null);

  // The raw text the user types
  const [smartLogText, setSmartLogText] = useState("");
  const [isParsing, setIsParsing] = useState(false);

  // The parsed JSON object that will hold our Pipeline 2 data
  const [manualData, setManualData] = useState({
    nutrition: {
      waterLiters: 0,
      calories: 0,
      proteinGrams: 0,
      carbsGrams: 0,
      fiberGrams: 0,
      foodItems: [] as string[]
    },
    gym: { completedToday: false, split: "None", workoutLogs: [] as string[] },
    cycle: { isMenstruating: false, symptoms: "None" },
    injuries: { active: false, location: "None", notes: "None" }
  });

  // --- THE NEW MASTER DATA PULLER ---

  // const pullHealthData = async () => {
  //   try {
  //     setLoading(true);
  //     const data = await fetchMasterBiologicalData();
  //     setMasterPayload(data);

  //     // 1. Calculate Today's Steps
  //     const todayAtMidnight = new Date();
  //     todayAtMidnight.setHours(0, 0, 0, 0);
  //     const todaysStepsRecords = data.biometrics.activity.steps.records.filter(
  //       (record: any) => new Date(record.endTime) >= todayAtMidnight
  //     );
  //     const todaysTotalSteps = todaysStepsRecords.reduce((sum: number, record: any) => sum + record.count, 0);
  //     setSteps(todaysTotalSteps.toString());

  //     // 2. Auto-Fill Heart Rate (If the phone tracked it)
  //     if (data.biometrics.vitals.heartRate.records.length > 0) {
  //       // Grab the most recent heart rate sample for the demo
  //       const latestHrRecord: any = data.biometrics.vitals.heartRate.records[0];
  //       if (latestHrRecord.samples && latestHrRecord.samples.length > 0) {
  //         setHr(latestHrRecord.samples[0].beatsPerMinute.toString());
  //       }
  //     }

  //     setPlan(`✅ Sync Complete! Pulled ${todaysTotalSteps} steps. You can manually edit the boxes above if you need to override the data.`);

  //   } catch (error) {
  //     console.error(error);
  //     Alert.alert("Sync Failed", "Please ensure Health Connect permissions are enabled.");
  //     setPlan("Failed to read Health Connect data.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const pullHealthData = async () => {
    try {
      setLoading(true);
      const data = await fetchMasterBiologicalData();
      setMasterPayload(data);

      const todayAtMidnight = new Date();
      todayAtMidnight.setHours(0, 0, 0, 0);

      // 1. Get all records from today
      const allRecords = data.biometrics.activity.steps.records.filter(
        (record: any) => new Date(record.endTime) >= todayAtMidnight
      );

      // 2. THE DEDUPLICATION LOGIC:
      // We group records by their "Source" (which app sent them)
      // and only take the total from the app that tracked the MOST steps.
      const sourceTotals: { [key: string]: number } = {};

      allRecords.forEach((record: any) => {
        const source = record.metadata?.recordingMethod || 'unknown';
        sourceTotals[source] = (sourceTotals[source] || 0) + record.count;
      });

      // Pick the winner (the highest total from a single source)
      const todaysTotalSteps = Math.max(...Object.values(sourceTotals), 0);

      setSteps(todaysTotalSteps.toString());
      setPlan(`✅ Sync Complete! Deduplicated steps: ${todaysTotalSteps}.`);

    } catch (error) {
      console.error(error);
      setPlan("Failed to read Health Connect data.");
    } finally {
      setLoading(false);
    }
  };

  // 🧠 THE SMART LOGGER ACTION (Upgraded Merge)
  const parseSmartLog = async () => {
    if (!smartLogText) return;

    try {
      setIsParsing(true);
      // ⚠️ Keep your actual IP address here!
      const response = await fetch('http://192.168.236.232:3000/api/parse-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logText: smartLogText }),
      });

      const result = await response.json();

      if (result.success) {
        const newData = result.data;

        // THE SMART MERGE: Add numbers, append text to arrays
        // THE BULLETPROOF MERGE: Uses ?. to survive missing AI data
        setManualData((prevData: any) => ({
          nutrition: {
            waterLiters: prevData.nutrition.waterLiters + (newData?.nutrition?.waterLiters || 0),
            calories: prevData.nutrition.calories + (newData?.nutrition?.calories || 0),
            proteinGrams: prevData.nutrition.proteinGrams + (newData?.nutrition?.proteinGrams || 0),
            carbsGrams: prevData.nutrition.carbsGrams + (newData?.nutrition?.carbsGrams || 0),
            fiberGrams: prevData.nutrition.fiberGrams + (newData?.nutrition?.fiberGrams || 0),
            foodItems: newData?.nutrition?.foodItems?.length > 0
              ? [...prevData.nutrition.foodItems, ...newData?.nutrition?.foodItems]
              : prevData.nutrition.foodItems
          },
          gym: {
            completedToday: prevData.gym.completedToday || (newData?.gym?.completedWorkout || false),
            split: (newData?.gym?.split && newData?.gym?.split !== "None") ? newData.gym.split : prevData.gym.split,
            workoutLogs: newData?.gym?.workoutLogs?.length > 0
              ? [...prevData.gym.workoutLogs, ...newData.gym.workoutLogs]
              : prevData.gym.workoutLogs
          },
          cycle: {
            isMenstruating: prevData.cycle.isMenstruating || (newData?.cycle?.isMenstruating || false),
            symptoms: (newData?.cycle?.symptoms && newData?.cycle?.symptoms !== "None") ? newData.cycle.symptoms : prevData.cycle.symptoms,
          },
          injuries: {
            active: prevData.injuries.active || (newData?.injuries?.active || false),
            location: (newData?.injuries?.location && newData?.injuries?.location !== "None") ? newData.injuries.location : prevData.injuries.location,
            notes: (newData?.injuries?.notes && newData?.injuries?.notes !== "None") ? newData.injuries.notes : prevData.injuries.notes,
          }
        }) as any);

        Alert.alert("Success", "Log saved! Macros and stats updated.");
        setSmartLogText(""); // Clear the box for the next log
      } else {
        Alert.alert("Error", "AI couldn't understand that log.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Network Error", "Is the backend running?");
    } finally {
      setIsParsing(false);
    }
  };

  // --- UPDATED AI GENERATOR ---
  const generatePlan = async () => {
    setLoading(true);
    setPlan("");

    try {
      // We combine the manual inputs with the massive hardware payload
      const fullAIContext = {
        manualInputs: manualData,
        hardwareData: masterPayload // <--- This passes the entire 48h biological history to your backend!
      };

      // ⚠️ Keep your actual IP address or localtunnel URL here!
      const response = await fetch('http://192.168.236.232:3000/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullAIContext),
      });

      // Safely check if the response is OK before parsing JSON
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }

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


  // return (
  //   <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
  //     <Text style={styles.title}>HealthKundli AI</Text>
  //     <Text style={styles.subtitle}>Enter today's stats for tomorrow's plan.</Text>

  //     <TouchableOpacity style={styles.sensorButton} onPress={pullHealthData} disabled={loading}>
  //       <Text style={styles.sensorButtonText}>📱 Auto-Pull Health Data</Text>
  //     </TouchableOpacity>

  //     {/* --- PIPELINE 2: SMART LOGGER --- */}
  //     <View style={styles.logContainer}>
  //       <Text style={styles.logLabel}>Smart Journal (Food, Workouts, Injuries):</Text>
  //       <TextInput
  //         style={styles.logInput}
  //         placeholder="Log as you go! e.g., 'Just had a bowl of Kellogg's with 200ml milk', 'Ran 5k', or 'My knee hurts.'"
  //         multiline={true}
  //         value={smartLogText}
  //         onChangeText={setSmartLogText}
  //       />
  //       <TouchableOpacity style={styles.parseButton} onPress={parseSmartLog} disabled={isParsing}>
  //         {isParsing ? <ActivityIndicator color="#fff" /> : <Text style={styles.parseButtonText}>✨ Extract Data</Text>}
  //       </TouchableOpacity>
  //     </View>

  //     {/* --- LIVE AI MEMORY PREVIEW --- */}
  //     <View style={styles.memoryCard}>
  //       <Text style={styles.memoryTitle}>🧠 AI Memory (Live):</Text>
  //       <Text style={styles.memoryText}>🔥 Calories: {manualData.nutrition.calories} kcal</Text>
  //       <Text style={styles.memoryText}>💧 Water: {manualData.nutrition.waterLiters} L</Text>
  //       <Text style={styles.memoryText}>🍎 Food Log: {manualData?.nutrition?.foodItems?.join(", ") || "None"}</Text>
  //       <Text style={styles.memoryText}>
  //         💪 Gym: {manualData?.gym?.split !== "None" ? manualData?.gym?.split : "Rest"}
  //         {manualData?.gym?.workoutLogs?.length > 0 ?
  //           ` (${manualData.gym.workoutLogs.map((log: any) =>
  //             typeof log === 'object' ? JSON.stringify(log) : log
  //           ).join(", ")})`
  //           : ""
  //         }
  //       </Text>
  //       <Text style={styles.memoryText}>🩹 Injuries: {manualData?.injuries?.location || "None"}</Text>
  //     </View>

  //     <View style={styles.inputContainer}>
  //       <TextInput style={styles.input} placeholder="Steps" keyboardType="numeric" value={steps} onChangeText={setSteps} />
  //       <TextInput style={styles.input} placeholder="Sleep" keyboardType="numeric" value={sleep} onChangeText={setSleep} />
  //       <TextInput style={styles.input} placeholder="HR" keyboardType="numeric" value={hr} onChangeText={setHr} />
  //     </View>

  //     <ScrollView style={styles.cardContainer}>
  //       {plan ? (
  //         <View style={styles.planCard}>
  //           <Text style={styles.planText}>{plan}</Text>
  //         </View>
  //       ) : (
  //         <Text style={styles.placeholderText}>Awaiting health data sync...</Text>
  //       )}
  //     </ScrollView>

  //     <TouchableOpacity style={styles.button} onPress={generatePlan} disabled={loading}>
  //       {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Generate AI Plan</Text>}
  //     </TouchableOpacity>
  //   </KeyboardAvoidingView>
  // );
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: '#f4f4f9' }}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">

        <Text style={styles.title}>HealthKundli AI</Text>
        <Text style={styles.subtitle}>Enter today's stats for tomorrow's plan.</Text>

        <TouchableOpacity style={styles.sensorButton} onPress={pullHealthData} disabled={loading}>
          <Text style={styles.sensorButtonText}>📱 Auto-Pull Health Data</Text>
        </TouchableOpacity>

        {/* --- PIPELINE 2: SMART LOGGER --- */}
        <View style={styles.logContainer}>
          <Text style={styles.logLabel}>Smart Journal (Food, Workouts, Injuries):</Text>
          <TextInput
            style={styles.logInput}
            placeholder="Log as you go! e.g., 'Just had a bowl of Kellogg's...'"
            multiline={true}
            value={smartLogText}
            onChangeText={setSmartLogText}
          />
          <TouchableOpacity style={styles.parseButton} onPress={parseSmartLog} disabled={isParsing}>
            {isParsing ? <ActivityIndicator color="#fff" /> : <Text style={styles.parseButtonText}>✨ Extract Data</Text>}
          </TouchableOpacity>
        </View>

        {/* --- LIVE AI MEMORY PREVIEW --- */}
        <View style={styles.memoryCard}>
          <Text style={styles.memoryTitle}>🧠 AI Memory (Live):</Text>
          <Text style={styles.memoryText}>🔥 Calories: {manualData.nutrition.calories} kcal</Text>
          <Text style={styles.memoryText}>💧 Water: {manualData.nutrition.waterLiters} L</Text>
          <Text style={styles.memoryText}>🍎 Food Log: {manualData?.nutrition?.foodItems?.join(", ") || "None"}</Text>
          <Text style={styles.memoryText}>
            💪 Gym: {manualData?.gym?.split !== "None" ? manualData?.gym?.split : "Rest"}
            {manualData?.gym?.workoutLogs?.length > 0 ?
              ` (${manualData.gym.workoutLogs.map((log: any) =>
                typeof log === 'object' ? JSON.stringify(log) : log
              ).join(", ")})`
              : ""
            }
          </Text>
          <Text style={styles.memoryText}>🩹 Injuries: {manualData?.injuries?.location || "None"}</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput style={styles.input} placeholder="Steps" keyboardType="numeric" value={steps} onChangeText={setSteps} />
          <TextInput style={styles.input} placeholder="Sleep" keyboardType="numeric" value={sleep} onChangeText={setSleep} />
          <TextInput style={styles.input} placeholder="HR" keyboardType="numeric" value={hr} onChangeText={setHr} />
        </View>

        {/* --- THE GENERATE BUTTON MOVES HERE --- */}
        <TouchableOpacity style={styles.button} onPress={generatePlan} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Generate AI Plan</Text>}
        </TouchableOpacity>

        {/* --- THE BEAUTIFUL MARKDOWN PLAN --- */}
        {plan ? (
          <View style={styles.planCard}>
            <Text style={styles.planHeader}>✨ Your Daily Kundli Plan</Text>
            <Markdown style={markdownStyles}>
              {plan}
            </Markdown>
          </View>
        ) : (
          <Text style={styles.placeholderText}>Awaiting health data sync...</Text>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}



const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 60, // Gives room at the bottom so nothing gets cut off
  },
  container: { flex: 1, backgroundColor: '#f4f4f9', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 20 },
  sensorButton: { width: '100%', backgroundColor: '#34C759', padding: 15, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  sensorButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  inputContainer: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  input: { flex: 1, backgroundColor: '#fff', padding: 15, borderRadius: 10, marginHorizontal: 5, textAlign: 'center', fontSize: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardContainer: { width: '100%', flex: 1 },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  planHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 15,
    textAlign: 'center',
  },
  planText: { fontSize: 18, color: '#333', lineHeight: 28 },
  placeholderText: { textAlign: 'center', color: '#999', marginTop: 50, fontSize: 16 },
  button: { width: '100%', backgroundColor: '#007AFF', padding: 18, borderRadius: 12, alignItems: 'center', marginBottom: 40, marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  // --- NEW STYLES FOR THE SMART LOGGER ---
  logContainer: { width: '100%', backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  logLabel: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  logInput: { backgroundColor: '#f9f9f9', padding: 12, borderRadius: 8, fontSize: 16, minHeight: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: '#eee', marginBottom: 10 },
  parseButton: { backgroundColor: '#8E44AD', padding: 12, borderRadius: 8, alignItems: 'center' }, // A nice purple to indicate "AI Magic"
  parseButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  // --- STYLES FOR LIVE MEMORY CARD ---
  memoryCard: { width: '100%', backgroundColor: '#E8F8F5', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#A3E4D7' },
  memoryTitle: { fontSize: 16, fontWeight: 'bold', color: '#117A65', marginBottom: 10 },
  memoryText: { fontSize: 14, color: '#0B5345', marginBottom: 4 },
});

// Put this right at the bottom of the file!
const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 16,
    lineHeight: 26,
    color: '#333333',
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold', // Now TypeScript knows this is safely a valid font weight
    color: '#0984e3',
    marginTop: 20,
    marginBottom: 10,
  },
  bullet_list: {
    marginTop: 10,
    marginBottom: 10,
  },
  strong: {
    fontWeight: 'bold',
    color: '#2d3436',
  }
});